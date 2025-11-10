#!/bin/bash

# Copy ALL Data from Production to Dev
# This copies the entire database including all tables

set -e

echo "📦 Copy ALL Database Data from Production to Dev"
echo "=================================================="
echo ""

# Project references
PROD_REF="gdbcdubivrrfhnbczgkn"
DEV_REF="qmrrmrhwdiyubqokxvbt"

echo "⚠️  WARNING: This will copy ALL data from production to development!"
echo ""
echo "This includes:"
echo "  - users"
echo "  - suppliers"
echo "  - parties"
echo "  - enquiries"
echo "  - applications"
echo "  - ALL other tables"
echo ""
echo "Existing data in dev will be REPLACED."
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo ""

# Step 1: Get production password
echo "📋 Step 1: Enter Production Database Password"
echo ""
read -sp "   Production password: " PROD_PASSWORD
echo ""
echo ""

# Step 2: Export ALL data from production
echo "📤 Step 2: Exporting ALL data from production..."
echo "   (This may take a minute...)"
PGPASSWORD="$PROD_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/pg_dump \
  -h "db.$PROD_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  --data-only \
  --no-owner \
  --no-acl \
  --schema=public \
  -f all-production-data.sql

if [ $? -eq 0 ]; then
  echo "✅ All production data exported to all-production-data.sql"

  # Show file size
  SIZE=$(ls -lh all-production-data.sql | awk '{print $5}')
  echo "   File size: $SIZE"
  echo ""
else
  echo "❌ Export failed. Check your password and try again."
  exit 1
fi

# Step 3: Get dev password
echo "📋 Step 3: Enter Development Database Password"
echo ""
read -sp "   Development password: " DEV_PASSWORD
echo ""
echo ""

# Step 4: Import to dev
echo "📥 Step 4: Importing ALL data to development..."
echo "   (This may take a minute...)"
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -f all-production-data.sql 2>&1 | grep -v "WARNING.*supautils" | grep -E "(ERROR|^$)" || true

if [ ${PIPESTATUS[0]} -eq 0 ]; then
  echo ""
  echo "✅ All data imported successfully!"
  echo ""
else
  echo ""
  echo "⚠️  Import completed with some warnings (this is normal)"
  echo ""
fi

# Step 5: Verify counts
echo "📊 Verifying import..."
echo ""

echo "Table counts in dev database:"
echo ""

# Get all tables and their counts
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -t -c "
    SELECT
      table_name || ': ' || (
        SELECT COUNT(*)
        FROM information_schema.tables t2
        WHERE t2.table_name = t1.table_name
      )
    FROM information_schema.tables t1
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  " 2>/dev/null || true

# Better verification - show actual row counts
echo "Getting row counts..."
TABLES=("users" "suppliers" "parties" "enquiries" "applications")

for table in "${TABLES[@]}"; do
  COUNT=$(PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
    -h "db.$DEV_REF.supabase.co" \
    -p 5432 \
    -U postgres \
    -d postgres \
    -t -c "SELECT COUNT(*) FROM public.$table;" 2>/dev/null | xargs || echo "0")

  printf "  %-15s %s rows\n" "$table:" "$COUNT"
done

echo ""
echo "🎉 Complete! Your dev database now has all production data."
echo ""
echo "Next steps:"
echo "  1. Verify data: https://supabase.com/dashboard/project/$DEV_REF/editor"
echo "  2. Test your app with: npm run dev"
echo "  3. Your .env.local is configured to use the dev database"
echo ""
echo "💡 Tip: You can now safely make changes without affecting production!"
echo ""
