-- Fix duplicate enquiries issue by adding unique constraint and updating RPC

-- Step 1: Remove duplicate enquiries (keep the first one created)
DELETE FROM enquiries e1
USING enquiries e2
WHERE e1.party_id = e2.party_id
  AND e1.supplier_id = e2.supplier_id
  AND e1.created_at > e2.created_at;

-- Step 2: Add unique constraint to prevent future duplicates
-- A party should only have one enquiry per supplier
ALTER TABLE enquiries
ADD CONSTRAINT unique_party_supplier
UNIQUE (party_id, supplier_id);

-- Step 3: Update RPC function to use ON CONFLICT DO NOTHING
CREATE OR REPLACE FUNCTION process_payment_success(
  p_party_id UUID,
  p_payment_intent_id TEXT,
  p_total_amount DECIMAL,
  p_remaining_balance DECIMAL,
  p_enquiries_to_create JSONB DEFAULT '[]'::jsonb,
  p_enquiry_ids_to_update UUID[] DEFAULT '{}'::uuid[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment_status TEXT;
  v_existing_payment_intent TEXT;
  v_existing_payment_status TEXT;
  v_existing_enquiry_count INT;
  v_result JSONB;
  v_enquiry JSONB;
  v_created_enquiries JSONB := '[]'::jsonb;
  v_updated_count INT := 0;
  v_inserted_count INT := 0;
BEGIN
  -- Step 1: Check idempotency - has this payment already been processed?
  SELECT payment_intent_id, payment_status
  INTO v_existing_payment_intent, v_existing_payment_status
  FROM parties
  WHERE id = p_party_id;

  IF v_existing_payment_intent = p_payment_intent_id AND v_existing_payment_status != 'pending' THEN
    -- Already processed, return early
    RETURN jsonb_build_object(
      'success', true,
      'duplicate', true,
      'message', 'Payment already processed'
    );
  END IF;

  -- Step 1b: Also check if accepted enquiries already exist (handles race condition)
  SELECT COUNT(*) INTO v_existing_enquiry_count
  FROM enquiries
  WHERE party_id = p_party_id
    AND status = 'accepted'
    AND auto_accepted = true;

  IF v_existing_enquiry_count > 0 THEN
    -- Enquiries already exist from a concurrent request
    RETURN jsonb_build_object(
      'success', true,
      'duplicate', true,
      'message', 'Enquiries already created'
    );
  END IF;

  -- Step 2: Determine payment status
  v_payment_status := CASE
    WHEN p_remaining_balance > 0 THEN 'partial_paid'
    ELSE 'fully_paid'
  END;

  -- Step 3: Update party (within transaction)
  UPDATE parties
  SET
    status = 'planned',
    payment_status = v_payment_status,
    payment_intent_id = p_payment_intent_id,
    payment_date = NOW(),
    total_paid = p_total_amount,
    deposit_amount = 0,
    updated_at = NOW()
  WHERE id = p_party_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Party not found: %', p_party_id;
  END IF;

  -- Step 4: Create new enquiries if provided (with ON CONFLICT to handle any remaining duplicates)
  IF jsonb_array_length(p_enquiries_to_create) > 0 THEN
    FOR v_enquiry IN SELECT * FROM jsonb_array_elements(p_enquiries_to_create)
    LOOP
      INSERT INTO enquiries (
        party_id,
        supplier_id,
        supplier_category,
        message,
        status,
        auto_accepted,
        payment_status,
        quoted_price,
        package_id,
        addon_details,
        created_at
      )
      VALUES (
        p_party_id,
        (v_enquiry->>'supplier_id')::UUID,
        v_enquiry->>'supplier_category',
        COALESCE(v_enquiry->>'message', 'BOOKING CONFIRMED - Customer has completed FULL payment'),
        'accepted',
        true,
        'fully_paid',
        COALESCE((v_enquiry->>'quoted_price')::DECIMAL, 0),
        v_enquiry->>'package_id',
        v_enquiry->'addon_details',
        NOW()
      )
      ON CONFLICT (party_id, supplier_id) DO NOTHING;

      -- Check if row was actually inserted
      GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

      IF v_inserted_count > 0 THEN
        v_created_enquiries := v_created_enquiries || jsonb_build_object(
          'supplier_id', v_enquiry->>'supplier_id',
          'category', v_enquiry->>'supplier_category'
        );
      END IF;
    END LOOP;
  END IF;

  -- Step 5: Update existing enquiries if IDs provided
  IF array_length(p_enquiry_ids_to_update, 1) > 0 THEN
    UPDATE enquiries
    SET
      status = 'accepted',
      auto_accepted = true,
      payment_status = 'fully_paid',
      updated_at = NOW()
    WHERE id = ANY(p_enquiry_ids_to_update)
      AND supplier_category != 'einvites';

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  END IF;

  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'duplicate', false,
    'party_id', p_party_id,
    'payment_status', v_payment_status,
    'enquiries_created', jsonb_array_length(v_created_enquiries),
    'enquiries_updated', v_updated_count
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Transaction will automatically rollback
    RAISE EXCEPTION 'Payment processing failed: %', SQLERRM;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION process_payment_success TO service_role;
