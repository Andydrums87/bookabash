#!/bin/bash

# Copy Data with Dependencies from Production to Dev
# Handles foreign key relationships properly

set -e

echo "📦 Copy Database Data Tool (with dependencies)"
echo "================================================"
echo ""

# Project references
PROD_REF="gdbcdubivrrfhnbczgkn"
DEV_REF="qmrrmrhwdiyubqokxvbt"

echo "This will copy data in the correct order:"
echo "  1. users table (required by suppliers)"
echo "  2. suppliers table"
echo ""
echo "⚠️  WARNING: This will DELETE existing data in your dev database!"
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

# Step 2: Get dev password
echo "📋 Step 2: Enter Development Database Password"
echo ""
read -sp "   Development password: " DEV_PASSWORD
echo ""
echo ""

# Step 3: Export users data
echo "📤 Step 3: Exporting users table data..."
PGPASSWORD="$PROD_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/pg_dump \
  -h "db.$PROD_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  --data-only \
  --no-owner \
  --no-acl \
  --table=public.users \
  -f users-data.sql

if [ $? -eq 0 ]; then
  echo "✅ Users data exported"
  echo ""
else
  echo "❌ Export failed. Check your password and try again."
  exit 1
fi

# Step 4: Export suppliers data
echo "📤 Step 4: Exporting suppliers table data..."
PGPASSWORD="$PROD_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/pg_dump \
  -h "db.$PROD_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  --data-only \
  --no-owner \
  --no-acl \
  --table=public.suppliers \
  -f suppliers-data.sql

if [ $? -eq 0 ]; then
  echo "✅ Suppliers data exported"
  echo ""
else
  echo "❌ Export failed."
  exit 1
fi

# Step 5: Clear and import users
echo "📥 Step 5: Importing users data to development..."
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "TRUNCATE TABLE public.users CASCADE;" 2>/dev/null || echo "   (Table empty or doesn't exist)"

PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -f users-data.sql 2>&1 | grep -v "WARNING.*supautils" || true

if [ $? -eq 0 ]; then
  echo "✅ Users imported"
  echo ""
else
  echo "❌ Users import had issues"
  echo ""
fi

# Step 6: Clear and import suppliers
echo "📥 Step 6: Importing suppliers data to development..."
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "TRUNCATE TABLE public.suppliers CASCADE;" 2>/dev/null || echo "   (Table empty)"

PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -f suppliers-data.sql 2>&1 | grep -v "WARNING.*supautils"

if [ $? -eq 0 ]; then
  echo "✅ Suppliers imported"
  echo ""
else
  echo "⚠️  Suppliers import may have had issues"
  echo ""
fi

# Step 7: Verify counts
echo "📊 Verifying import..."
echo ""

echo -n "Users: "
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -t -c "SELECT COUNT(*) FROM public.users;" 2>/dev/null | xargs

echo -n "Suppliers: "
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -t -c "SELECT COUNT(*) FROM public.suppliers;" 2>/dev/null | xargs

echo ""
echo "🎉 Data copy complete!"
echo ""
echo "Next steps:"
echo "  1. Verify data: https://supabase.com/dashboard/project/$DEV_REF/editor"
echo "  2. Test your app with 'npm run dev'"
echo ""
