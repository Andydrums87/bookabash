# Database Migration Guide: Production → Dev

## Quick Start (2 Commands)

You need your database passwords for this. Here's how to get them:

### Step 1: Get Your Database Passwords

**Production Password:**
1. Go to: https://supabase.com/dashboard/project/gdbcdubivrrfhnbczgkn/settings/database
2. Scroll to "Database Password"
3. If you don't have it, click "Reset Database Password" (⚠️ This won't affect your app - it only affects direct database connections)
4. Copy the password

**Dev Password:**
1. You should have this from when you created your dev project
2. If not, go to your dev project → Settings → Database
3. Reset the password and copy it

### Step 2: Export Production Schema

Open your terminal and run:

```bash
supabase db dump \
  --db-url "postgresql://postgres:YOUR_PROD_PASSWORD@db.gdbcdubivrrfhnbczgkn.supabase.co:5432/postgres" \
  -f production-schema.sql
```

**Replace `YOUR_PROD_PASSWORD` with your actual production database password**

This will create a `production-schema.sql` file with all your tables, columns, indexes, etc.

### Step 3: Import to Dev Database

Once you have the `production-schema.sql` file, import it to your dev database.

**First, get your dev project reference from `.env.local`:**
- Look at `NEXT_PUBLIC_SUPABASE_URL` in your `.env.local`
- It will be something like: `https://XXXXX.supabase.co`
- The `XXXXX` part is your dev project reference

Then run:

```bash
psql "postgresql://postgres:YOUR_DEV_PASSWORD@db.YOUR_DEV_REF.supabase.co:5432/postgres" \
  < production-schema.sql
```

**Replace:**
- `YOUR_DEV_PASSWORD` with your dev database password
- `YOUR_DEV_REF` with your dev project reference from `.env.local`

---

## Alternative: Manual Export from Dashboard

If the CLI method doesn't work, you can export manually:

### Production Export:

1. Go to: https://supabase.com/dashboard/project/gdbcdubivrrfhnbczgkn/editor
2. Click "SQL Editor" in sidebar
3. Click "New Query"
4. Paste and run this SQL:

```sql
-- Get table creation statements
SELECT
    'CREATE TABLE IF NOT EXISTS ' || schemaname || '.' || tablename || E' (\n' ||
    string_agg(
        '  ' || column_name || ' ' ||
        CASE
            WHEN data_type = 'character varying' THEN 'varchar(' || character_maximum_length || ')'
            WHEN data_type = 'character' THEN 'char(' || character_maximum_length || ')'
            WHEN data_type = 'numeric' THEN 'numeric(' || numeric_precision || ',' || numeric_scale || ')'
            ELSE data_type
        END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
        E',\n'
    ) || E'\n);' as create_statement
FROM information_schema.columns
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
```

5. Copy all the CREATE TABLE statements
6. Save them to a file called `production-schema.sql`

### Dev Import:

1. Go to your dev Supabase project
2. Click "SQL Editor"
3. Click "New Query"
4. Paste the CREATE TABLE statements
5. Click "Run"

---

## Verification

After importing, verify your dev database has all tables:

```bash
# Check tables in dev database
supabase db dump \
  --db-url "postgresql://postgres:YOUR_DEV_PASSWORD@db.YOUR_DEV_REF.supabase.co:5432/postgres" \
  --data-only \
  --schema public
```

Or in the Supabase dashboard:
1. Go to your dev project
2. Click "Table Editor"
3. You should see all your production tables listed

---

## Important Notes

- ⚠️ This only copies the SCHEMA (table structure), not the data
- Your production data is safe - this is read-only
- Your dev database will have empty tables with the same structure as production
- You can manually add test data later, or use Supabase's seed functionality
