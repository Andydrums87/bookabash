-- ============================================
-- CATERING PACKAGES STRUCTURE
-- ============================================
-- This migration documents the expected JSONB structure for catering suppliers
-- Catering uses a simple model: ONE package with optional add-ons
-- No complex choices - parent picks package, optionally adds drinks/treats
-- ============================================

-- The catering package structure within supplier.data:
-- {
--   "packages": [
--     {
--       "id": "party-food-bags",
--       "name": "Party Food Bags",
--       "price": 5.75,
--       "priceType": "per_head",
--       "pricingModel": "perHead",
--       "description": "Delicious party food for little ones - everything they need in one bag!",
--       "image": "https://...",
--       "whatsIncluded": [
--         "Choice of sandwich roll or pasta salad",
--         "2 sides & treats",
--         "Homemade pudding",
--         "Fresh fruit",
--         "Little wooden fork"
--       ],
--       "dietaryNote": "Dietary requirements discussed with you and catered for separately",
--       "addOns": [
--         {
--           "id": "drinks",
--           "name": "Add Drinks",
--           "price": 0.80,
--           "priceType": "per_head",
--           "description": "Bottled water, juice cartons, or fruit shoot"
--         },
--         {
--           "id": "extra-treats",
--           "name": "Extra Treats",
--           "price": 0.50,
--           "priceType": "per_item",
--           "description": "Additional sweet treats"
--         }
--       ]
--     }
--   ],
--   "serviceDetails": {
--     "cateringType": "Party Food Caterer",
--     "serviceStyle": "Delivery Only",
--     "leadTime": 48,
--     "minimumOrder": 10,
--     "maximumOrder": 50,
--     "deliveryInfo": "Delivered to your venue on the day of the party",
--     "allergenInfo": "We handle all common allergens. Please discuss requirements when booking.",
--     "aboutUs": "We create delicious, homemade party food that kids love!"
--   }
-- }

-- ============================================
-- CATERING ADD-ONS TABLE (for platform-level add-ons)
-- ============================================
-- This table defines the standard add-ons that BookABash offers
-- These are white-labeled - suppliers fulfill them but don't define them

CREATE TABLE IF NOT EXISTS public.catering_addon_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    addon_id text NOT NULL UNIQUE,  -- e.g., 'drinks', 'extra-treats'
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    price_type text NOT NULL DEFAULT 'per_head',  -- 'per_head', 'per_item', 'flat'
    category text NOT NULL DEFAULT 'catering',
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT valid_price_type CHECK (price_type IN ('per_head', 'per_item', 'flat'))
);

-- Insert the standard catering add-ons from the menu
INSERT INTO public.catering_addon_templates (addon_id, name, description, price, price_type, display_order)
VALUES
    ('drinks', 'Drinks', 'Bottled water, juice cartons, or fruit shoot', 0.80, 'per_head', 1),
    ('extra-treats', 'Extra Treats', 'Additional sweet treats', 0.50, 'per_item', 2)
ON CONFLICT (addon_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    price_type = EXCLUDED.price_type,
    display_order = EXCLUDED.display_order,
    updated_at = now();


-- ============================================
-- CATERING PACKAGE TEMPLATES (for platform-level packages)
-- ============================================
-- These define the standard packages BookABash offers
-- Suppliers are matched to fulfill these, but parents only see the BookABash package

CREATE TABLE IF NOT EXISTS public.catering_package_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id text NOT NULL UNIQUE,  -- e.g., 'party-food-bags'
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    price_type text NOT NULL DEFAULT 'per_head',
    whats_included text[] NOT NULL DEFAULT '{}',
    dietary_note text,
    image_url text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT valid_price_type CHECK (price_type IN ('per_head', 'per_item', 'flat'))
);

-- Insert the Party Food Bags package
INSERT INTO public.catering_package_templates (
    package_id,
    name,
    description,
    price,
    price_type,
    whats_included,
    dietary_note,
    display_order
)
VALUES (
    'party-food-bags',
    'Party Food Bags',
    'Delicious party food for little ones - everything they need in one bag!',
    5.75,
    'per_head',
    ARRAY[
        'Choice of sandwich roll or pasta salad',
        '2 sides & treats',
        'Homemade pudding',
        'Fresh fruit',
        'Little wooden fork'
    ],
    'Dietary requirements discussed with you and catered for separately',
    1
)
ON CONFLICT (package_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    price_type = EXCLUDED.price_type,
    whats_included = EXCLUDED.whats_included,
    dietary_note = EXCLUDED.dietary_note,
    display_order = EXCLUDED.display_order,
    updated_at = now();


-- ============================================
-- LINK TABLE: Which suppliers can fulfill which packages
-- ============================================
-- This allows BookABash to assign suppliers to packages by area/availability

CREATE TABLE IF NOT EXISTS public.catering_supplier_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    package_template_id uuid NOT NULL REFERENCES public.catering_package_templates(id) ON DELETE CASCADE,
    coverage_postcodes text[],  -- postcodes this supplier covers for this package
    is_active boolean DEFAULT true,
    priority integer DEFAULT 0,  -- higher = preferred supplier
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    UNIQUE(supplier_id, package_template_id)
);

-- Index for fast lookup by postcode coverage
CREATE INDEX IF NOT EXISTS idx_catering_assignments_postcodes
ON public.catering_supplier_assignments USING GIN (coverage_postcodes);

-- Index for active assignments
CREATE INDEX IF NOT EXISTS idx_catering_assignments_active
ON public.catering_supplier_assignments (is_active, priority DESC);


-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.catering_addon_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_package_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_supplier_assignments ENABLE ROW LEVEL SECURITY;

-- Everyone can read templates (they're public product info)
CREATE POLICY "Anyone can read catering addon templates"
ON public.catering_addon_templates FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Anyone can read catering package templates"
ON public.catering_package_templates FOR SELECT
TO authenticated, anon
USING (true);

-- Only admins can modify templates (via service role)
-- No INSERT/UPDATE/DELETE policies for regular users

-- Suppliers can see their own assignments
CREATE POLICY "Suppliers can view their own assignments"
ON public.catering_supplier_assignments FOR SELECT
TO authenticated
USING (
    supplier_id IN (
        SELECT id FROM public.suppliers
        WHERE auth_user_id = auth.uid()
    )
);


-- ============================================
-- HELPER FUNCTION: Get catering package with add-ons for display
-- ============================================

CREATE OR REPLACE FUNCTION public.get_catering_package_display(p_package_id text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'package', jsonb_build_object(
            'id', pt.package_id,
            'name', pt.name,
            'description', pt.description,
            'price', pt.price,
            'priceType', pt.price_type,
            'whatsIncluded', pt.whats_included,
            'dietaryNote', pt.dietary_note,
            'image', pt.image_url
        ),
        'addOns', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', at.addon_id,
                    'name', at.name,
                    'description', at.description,
                    'price', at.price,
                    'priceType', at.price_type
                )
                ORDER BY at.display_order
            )
            FROM public.catering_addon_templates at
            WHERE at.is_active = true
            ), '[]'::jsonb
        )
    ) INTO result
    FROM public.catering_package_templates pt
    WHERE pt.package_id = p_package_id
    AND pt.is_active = true;

    RETURN result;
END;
$$;


-- ============================================
-- HELPER FUNCTION: Calculate catering total
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_catering_total(
    p_package_id text,
    p_guest_count integer,
    p_addon_selections jsonb DEFAULT '[]'::jsonb
    -- addon_selections format: [{"addonId": "drinks", "quantity": 20}, {"addonId": "extra-treats", "quantity": 5}]
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    package_price numeric;
    package_price_type text;
    package_subtotal numeric;
    addons_subtotal numeric := 0;
    addon_record record;
    addon_selection jsonb;
    result jsonb;
BEGIN
    -- Get package price
    SELECT price, price_type INTO package_price, package_price_type
    FROM public.catering_package_templates
    WHERE package_id = p_package_id AND is_active = true;

    IF package_price IS NULL THEN
        RETURN jsonb_build_object('error', 'Package not found');
    END IF;

    -- Calculate package subtotal
    IF package_price_type = 'per_head' THEN
        package_subtotal := package_price * p_guest_count;
    ELSE
        package_subtotal := package_price;
    END IF;

    -- Calculate add-ons subtotal
    FOR addon_selection IN SELECT * FROM jsonb_array_elements(p_addon_selections)
    LOOP
        SELECT price, price_type INTO addon_record
        FROM public.catering_addon_templates
        WHERE addon_id = (addon_selection->>'addonId')
        AND is_active = true;

        IF addon_record.price IS NOT NULL THEN
            IF addon_record.price_type = 'per_head' THEN
                addons_subtotal := addons_subtotal + (addon_record.price * p_guest_count);
            ELSIF addon_record.price_type = 'per_item' THEN
                addons_subtotal := addons_subtotal + (addon_record.price * COALESCE((addon_selection->>'quantity')::integer, p_guest_count));
            ELSE
                addons_subtotal := addons_subtotal + addon_record.price;
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'packageSubtotal', package_subtotal,
        'addonsSubtotal', addons_subtotal,
        'total', package_subtotal + addons_subtotal,
        'guestCount', p_guest_count,
        'pricePerHead', ROUND((package_subtotal + addons_subtotal) / p_guest_count, 2)
    );
END;
$$;


-- ============================================
-- EXAMPLE USAGE
-- ============================================
--
-- Get package display for frontend:
-- SELECT get_catering_package_display('party-food-bags');
--
-- Calculate total for 20 guests with drinks:
-- SELECT calculate_catering_total(
--     'party-food-bags',
--     20,
--     '[{"addonId": "drinks", "quantity": 20}]'::jsonb
-- );
--
-- Result: {"total": 131.00, "guestCount": 20, "pricePerHead": 6.55, "addonsSubtotal": 16.00, "packageSubtotal": 115.00}
