#!/bin/bash

# Copy Suppliers Table Data from Production to Dev

set -e

echo "📦 Copy Suppliers Data Tool"
echo "============================"
echo ""

# Project references
PROD_REF="gdbcdubivrrfhnbczgkn"
DEV_REF="qmrrmrhwdiyubqokxvbt"

echo "This will copy the 'suppliers' table data from production to development."
echo ""
echo "⚠️  WARNING: This will DELETE existing data in your dev suppliers table!"
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

# Step 2: Export suppliers data
echo "📤 Step 2: Exporting suppliers table data..."
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
  echo "✅ Suppliers data exported successfully"

  # Show how many suppliers were exported
  SUPPLIER_COUNT=$(grep -c "COPY public.suppliers" suppliers-data.sql || echo "0")
  echo "   Found suppliers data to copy"
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

# Step 4: Clear existing dev suppliers data
echo "🗑️  Step 4: Clearing existing dev suppliers data..."
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "TRUNCATE TABLE public.suppliers CASCADE;"

if [ $? -eq 0 ]; then
  echo "✅ Dev suppliers table cleared"
  echo ""
else
  echo "⚠️  Warning: Could not clear dev table (might be empty already)"
  echo ""
fi

# Step 5: Import suppliers data to dev
echo "📥 Step 5: Importing suppliers data to development..."
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -f suppliers-data.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Suppliers data imported successfully!"
  echo ""

  # Count suppliers in dev
  echo "📊 Verifying import..."
  PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
    -h "db.$DEV_REF.supabase.co" \
    -p 5432 \
    -U postgres \
    -d postgres \
    -t -c "SELECT COUNT(*) FROM public.suppliers;"

  echo ""
  echo "🎉 Data copy complete!"
  echo ""
  echo "Next steps:"
  echo "  1. Verify data: https://supabase.com/dashboard/project/$DEV_REF/editor"
  echo "  2. Test your app with 'npm run dev'"
  echo ""
else
  echo "❌ Import failed."
  echo "    You can view the data file at: suppliers-data.sql"
  exit 1
fi
