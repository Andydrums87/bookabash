-- Migration: Create Referral System Tables
-- Description: Tables for tracking user referrals and discount credits

-- =============================================
-- 1. USER REFERRAL CODES TABLE
-- =============================================
-- Stores the unique referral code for each user
CREATE TABLE IF NOT EXISTS user_referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_referral_code UNIQUE (user_id)
);

-- Index for fast lookups by referral code
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON user_referral_codes(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON user_referral_codes(user_id);

-- =============================================
-- 2. REFERRALS TABLE
-- =============================================
-- Tracks who referred whom
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
  -- pending: referred user signed up but hasn't booked
  -- completed: referred user completed their first booking, credits issued
  -- expired: referral expired (e.g., after 90 days without booking)
  -- cancelled: referral was cancelled/refunded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE,
  first_booking_id UUID, -- The booking that completed the referral

  CONSTRAINT unique_referral UNIQUE (referred_user_id), -- A user can only be referred once
  CONSTRAINT no_self_referral CHECK (referrer_user_id != referred_user_id)
);

-- Indexes for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- =============================================
-- 3. REFERRAL CREDITS TABLE
-- =============================================
-- Tracks the credits/discounts users have earned
CREATE TABLE IF NOT EXISTS referral_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 20.00, -- £20 credit
  type VARCHAR(20) NOT NULL CHECK (type IN ('referrer_bonus', 'referred_bonus')),
  -- referrer_bonus: credit given to the person who referred someone
  -- referred_bonus: credit given to the person who was referred
  referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'used', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '12 months'),
  used_at TIMESTAMP WITH TIME ZONE,
  used_on_booking_id UUID, -- The booking where this credit was used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Indexes for credits
CREATE INDEX IF NOT EXISTS idx_credits_user ON referral_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_status ON referral_credits(status);
CREATE INDEX IF NOT EXISTS idx_credits_user_available ON referral_credits(user_id, status) WHERE status = 'available';

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_credits ENABLE ROW LEVEL SECURITY;

-- user_referral_codes policies
CREATE POLICY "Users can view their own referral code" ON user_referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral code" ON user_referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow anyone to look up a referral code (for validation during signup)
CREATE POLICY "Anyone can look up referral codes" ON user_referral_codes
  FOR SELECT USING (true);

-- referrals policies
CREATE POLICY "Users can view referrals they're involved in" ON referrals
  FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "System can insert referrals" ON referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update referrals" ON referrals
  FOR UPDATE USING (true);

-- referral_credits policies
CREATE POLICY "Users can view their own credits" ON referral_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert credits" ON referral_credits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update credits" ON referral_credits
  FOR UPDATE USING (true);

-- =============================================
-- 5. HELPER FUNCTIONS
-- =============================================

-- Function to generate a unique referral code for a user
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  v_code VARCHAR(20);
  v_exists BOOLEAN;
BEGIN
  -- Generate code: PARTY + first 8 chars of user UUID (uppercase, no dashes)
  v_code := 'PARTY' || UPPER(REPLACE(p_user_id::TEXT, '-', '')::VARCHAR(8));

  -- Check if code exists (unlikely but possible with UUID collision)
  SELECT EXISTS(SELECT 1 FROM user_referral_codes WHERE referral_code = v_code) INTO v_exists;

  -- If exists, append random chars
  IF v_exists THEN
    v_code := v_code || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 4));
  END IF;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create a user's referral code
CREATE OR REPLACE FUNCTION get_or_create_referral_code(p_user_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  v_code VARCHAR(20);
BEGIN
  -- Try to get existing code
  SELECT referral_code INTO v_code FROM user_referral_codes WHERE user_id = p_user_id;

  -- If no code exists, create one
  IF v_code IS NULL THEN
    v_code := generate_referral_code(p_user_id);
    INSERT INTO user_referral_codes (user_id, referral_code)
    VALUES (p_user_id, v_code)
    ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
    RETURNING referral_code INTO v_code;
  END IF;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's available credit balance
CREATE OR REPLACE FUNCTION get_available_credit(p_user_id UUID)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_total DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_total
  FROM referral_credits
  WHERE user_id = p_user_id
    AND status = 'available'
    AND (expires_at IS NULL OR expires_at > NOW());

  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply referral credit to a booking
CREATE OR REPLACE FUNCTION apply_referral_credit(
  p_user_id UUID,
  p_booking_id UUID,
  p_amount_to_apply DECIMAL(10, 2)
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_credit RECORD;
  v_remaining DECIMAL(10, 2) := p_amount_to_apply;
  v_applied DECIMAL(10, 2) := 0;
BEGIN
  -- Loop through available credits, oldest first
  FOR v_credit IN
    SELECT id, amount
    FROM referral_credits
    WHERE user_id = p_user_id
      AND status = 'available'
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at ASC
  LOOP
    EXIT WHEN v_remaining <= 0;

    IF v_credit.amount <= v_remaining THEN
      -- Use entire credit
      UPDATE referral_credits
      SET status = 'used',
          used_at = NOW(),
          used_on_booking_id = p_booking_id
      WHERE id = v_credit.id;

      v_applied := v_applied + v_credit.amount;
      v_remaining := v_remaining - v_credit.amount;
    ELSE
      -- Partial use: split the credit
      UPDATE referral_credits
      SET amount = amount - v_remaining,
          updated_at = NOW()
      WHERE id = v_credit.id;

      -- Create a "used" record for the applied portion
      INSERT INTO referral_credits (
        user_id, amount, type, referral_id, status, used_at, used_on_booking_id
      )
      SELECT user_id, v_remaining, type, referral_id, 'used', NOW(), p_booking_id
      FROM referral_credits WHERE id = v_credit.id;

      v_applied := v_applied + v_remaining;
      v_remaining := 0;
    END IF;
  END LOOP;

  RETURN v_applied;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a referral and issue credits
CREATE OR REPLACE FUNCTION complete_referral(
  p_referred_user_id UUID,
  p_booking_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_referral RECORD;
BEGIN
  -- Find pending referral for this user
  SELECT * INTO v_referral
  FROM referrals
  WHERE referred_user_id = p_referred_user_id
    AND status = 'pending'
  LIMIT 1;

  -- No pending referral found
  IF v_referral IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update referral status
  UPDATE referrals
  SET status = 'completed',
      converted_at = NOW(),
      first_booking_id = p_booking_id
  WHERE id = v_referral.id;

  -- Issue credit to referrer (£20)
  INSERT INTO referral_credits (user_id, amount, type, referral_id, status)
  VALUES (v_referral.referrer_user_id, 20.00, 'referrer_bonus', v_referral.id, 'available');

  -- Issue credit to referred user (£20)
  INSERT INTO referral_credits (user_id, amount, type, referral_id, status)
  VALUES (p_referred_user_id, 20.00, 'referred_bonus', v_referral.id, 'available');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_or_create_referral_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_credit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION apply_referral_credit(UUID, UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_referral(UUID, UUID) TO authenticated;
