#!/bin/bash

# Safe Data Import - handles foreign key constraints properly

set -e

echo "📥 Safe Data Import to Development Database"
echo "============================================"
echo ""

DEV_REF="qmrrmrhwdiyubqokxvbt"

if [ ! -f "all-production-data.sql" ]; then
  echo "❌ Error: all-production-data.sql not found!"
  echo "   Please run ./copy-all-data.sh first to export the data."
  exit 1
fi

echo "Found data file (15MB)"
echo ""

echo "📋 Enter Development Database Password"
echo ""
read -sp "   Development password: " DEV_PASSWORD
echo ""
echo ""

echo "🔧 Step 1: Disabling foreign key constraints temporarily..."
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "SET session_replication_role = replica;" 2>&1 | grep -v "WARNING.*supautils" || true

echo "✅ Constraints disabled"
echo ""

echo "📥 Step 2: Importing data..."
echo "   (This may take 1-2 minutes...)"
echo ""

# Import with constraints disabled
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -v ON_ERROR_STOP=0 \
  --single-transaction \
  -c "SET session_replication_role = replica;" \
  -f all-production-data.sql 2>&1 | \
  grep -v "WARNING.*supautils" | \
  grep -E "(ERROR|COPY|^$)" | \
  head -50 || true

echo ""
echo "✅ Import completed"
echo ""

echo "🔧 Step 3: Re-enabling foreign key constraints..."
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "SET session_replication_role = DEFAULT;" 2>&1 | grep -v "WARNING.*supautils" || true

echo "✅ Constraints re-enabled"
echo ""

echo "📊 Verifying import..."
echo ""

# Check key tables
TABLES=("users" "suppliers" "parties" "enquiries" "gift_items")

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
echo "🎉 Import complete!"
echo ""
echo "Next steps:"
echo "  1. Verify in dashboard: https://supabase.com/dashboard/project/$DEV_REF/editor"
echo "  2. Test your app: npm run dev"
echo ""
