-- Restore Foreign Key Constraints for Dev Database
-- Run this in your dev Supabase SQL Editor
-- Uses DROP IF EXISTS to avoid errors if constraints already exist

-- enquiries table
ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_supplier_id_fkey;
ALTER TABLE enquiries
  ADD CONSTRAINT enquiries_supplier_id_fkey
  FOREIGN KEY (supplier_id)
  REFERENCES suppliers(id)
  ON DELETE CASCADE;

ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_party_id_fkey;
ALTER TABLE enquiries
  ADD CONSTRAINT enquiries_party_id_fkey
  FOREIGN KEY (party_id)
  REFERENCES parties(id)
  ON DELETE CASCADE;

-- parties table
ALTER TABLE parties DROP CONSTRAINT IF EXISTS parties_user_id_fkey;
ALTER TABLE parties
  ADD CONSTRAINT parties_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- party_gift_registries table
ALTER TABLE party_gift_registries DROP CONSTRAINT IF EXISTS party_gift_registries_party_id_fkey;
ALTER TABLE party_gift_registries
  ADD CONSTRAINT party_gift_registries_party_id_fkey
  FOREIGN KEY (party_id)
  REFERENCES parties(id)
  ON DELETE CASCADE;

-- registry_items table
ALTER TABLE registry_items DROP CONSTRAINT IF EXISTS registry_items_registry_id_fkey;
ALTER TABLE registry_items
  ADD CONSTRAINT registry_items_registry_id_fkey
  FOREIGN KEY (registry_id)
  REFERENCES party_gift_registries(id)
  ON DELETE CASCADE;

-- supplier_message_templates table
ALTER TABLE supplier_message_templates DROP CONSTRAINT IF EXISTS supplier_message_templates_supplier_id_fkey;
ALTER TABLE supplier_message_templates
  ADD CONSTRAINT supplier_message_templates_supplier_id_fkey
  FOREIGN KEY (supplier_id)
  REFERENCES suppliers(id)
  ON DELETE CASCADE;

-- supplier_responses table
ALTER TABLE supplier_responses DROP CONSTRAINT IF EXISTS supplier_responses_enquiry_id_fkey;
ALTER TABLE supplier_responses
  ADD CONSTRAINT supplier_responses_enquiry_id_fkey
  FOREIGN KEY (enquiry_id)
  REFERENCES enquiries(id)
  ON DELETE CASCADE;

ALTER TABLE supplier_responses DROP CONSTRAINT IF EXISTS supplier_responses_party_id_fkey;
ALTER TABLE supplier_responses
  ADD CONSTRAINT supplier_responses_party_id_fkey
  FOREIGN KEY (party_id)
  REFERENCES parties(id)
  ON DELETE CASCADE;

ALTER TABLE supplier_responses DROP CONSTRAINT IF EXISTS supplier_responses_supplier_id_fkey;
ALTER TABLE supplier_responses
  ADD CONSTRAINT supplier_responses_supplier_id_fkey
  FOREIGN KEY (supplier_id)
  REFERENCES suppliers(id)
  ON DELETE CASCADE;

ALTER TABLE supplier_responses DROP CONSTRAINT IF EXISTS supplier_responses_customer_id_fkey;
ALTER TABLE supplier_responses
  ADD CONSTRAINT supplier_responses_customer_id_fkey
  FOREIGN KEY (customer_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- terms_acceptances table
ALTER TABLE terms_acceptances DROP CONSTRAINT IF EXISTS terms_acceptances_user_id_fkey;
ALTER TABLE terms_acceptances
  ADD CONSTRAINT terms_acceptances_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE terms_acceptances DROP CONSTRAINT IF EXISTS terms_acceptances_supplier_id_fkey;
ALTER TABLE terms_acceptances
  ADD CONSTRAINT terms_acceptances_supplier_id_fkey
  FOREIGN KEY (supplier_id)
  REFERENCES suppliers(id)
  ON DELETE CASCADE;

-- Note: We're NOT adding auth_user_id foreign keys because those reference auth.users
-- which we didn't copy. The auth_user_id fields will be NULL or point to non-existent users,
-- but that's okay for dev testing.

SELECT 'Foreign keys restored!' as status;
