-- Disable foreign key constraints temporarily
ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_auth_user_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_user_id_fkey;
ALTER TABLE parties DROP CONSTRAINT IF EXISTS parties_user_id_fkey;
ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_party_id_fkey;
ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_supplier_id_fkey;

-- Now you can run the copy script without foreign key errors
-- After copying, you can decide whether to re-add constraints or not

-- To check what constraints exist:
SELECT conname, conrelid::regclass AS table_name
FROM pg_constraint
WHERE contype = 'f' AND connamespace = 'public'::regnamespace;
