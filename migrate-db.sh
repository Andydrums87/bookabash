#!/bin/bash

# Database Migration Script
# Migrates schema from production to development

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
echo "📋 Step 1: Get Production Database Password"
echo "   Go to: https://supabase.com/dashboard/project/$PROD_REF/settings/database"
echo "   Copy the 'Database Password' (or reset it if you don't have it)"
echo ""
read -sp "   Enter production database password: " PROD_PASSWORD
echo ""
echo ""

# Step 2: Export schema
echo "📤 Step 2: Exporting production schema..."
supabase db dump \
  --db-url "postgresql://postgres:$PROD_PASSWORD@db.$PROD_REF.supabase.co:5432/postgres" \
  -f production-schema.sql

if [ $? -eq 0 ]; then
  echo "✅ Schema exported successfully to production-schema.sql"
  echo ""
else
  echo "❌ Export failed. Check your password and try again."
  exit 1
fi

# Step 3: Get dev password
echo "📋 Step 3: Get Development Database Password"
echo "   Go to: https://supabase.com/dashboard/project/$DEV_REF/settings/database"
echo "   Copy the 'Database Password'"
echo ""
read -sp "   Enter development database password: " DEV_PASSWORD
echo ""
echo ""

# Step 4: Import to dev
echo "📥 Step 4: Importing schema to development database..."
psql "postgresql://postgres:$DEV_PASSWORD@db.$DEV_REF.supabase.co:5432/postgres" \
  < production-schema.sql

if [ $? -eq 0 ]; then
  echo "✅ Schema imported successfully to development database!"
  echo ""
  echo "🎉 Migration complete!"
  echo ""
  echo "Next steps:"
  echo "  1. Verify tables in dashboard: https://supabase.com/dashboard/project/$DEV_REF/editor"
  echo "  2. Your .env.local is already configured for dev"
  echo "  3. Run 'npm run dev' to start using your dev database"
  echo ""
else
  echo "❌ Import failed. Check your password and try again."
  exit 1
fi
