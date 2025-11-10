#!/bin/bash

# Simple Database Migration Script (without .env parsing issues)

set -e

echo "🔄 BookABash Database Migration Tool"
echo "===================================="
echo ""

# Project references
PROD_REF="gdbcdubivrrfhnbczgkn"
DEV_REF="qmrrmrhwdiyubqokxvbt"

echo "Production project: $PROD_REF"
echo "Development project: $DEV_REF"
echo ""

# Step 1: Get production password
echo "📋 Step 1: Enter Production Database Password"
echo "   (from https://supabase.com/dashboard/project/$PROD_REF/settings/database)"
echo ""
read -sp "   Production password: " PROD_PASSWORD
echo ""
echo ""

# Step 2: Export schema (change to /tmp to avoid .env.local parsing)
echo "📤 Step 2: Exporting production schema..."
cd /tmp
supabase db dump \
  --db-url "postgresql://postgres:$PROD_PASSWORD@db.$PROD_REF.supabase.co:5432/postgres" \
  -f production-schema.sql

if [ $? -eq 0 ]; then
  # Move the file back to project directory
  mv production-schema.sql "/Users/andrewjoseph/Documents/web dev projects/bookabash/"
  echo "✅ Schema exported successfully"
  echo ""
else
  echo "❌ Export failed. Check your password and try again."
  exit 1
fi

# Step 3: Get dev password
echo "📋 Step 3: Enter Development Database Password"
echo "   (from https://supabase.com/dashboard/project/$DEV_REF/settings/database)"
echo ""
read -sp "   Development password: " DEV_PASSWORD
echo ""
echo ""

# Step 4: Import to dev
echo "📥 Step 4: Importing schema to development database..."
cd "/Users/andrewjoseph/Documents/web dev projects/bookabash"
psql "postgresql://postgres:$DEV_PASSWORD@db.$DEV_REF.supabase.co:5432/postgres" \
  < production-schema.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Schema imported successfully!"
  echo ""
  echo "🎉 Migration complete!"
  echo ""
  echo "Next steps:"
  echo "  1. Verify tables: https://supabase.com/dashboard/project/$DEV_REF/editor"
  echo "  2. Your .env.local is configured for dev"
  echo "  3. Run 'npm run dev' to use your dev database"
  echo ""
else
  echo "❌ Import failed. Check your password and try again."
  exit 1
fi
