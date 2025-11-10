#!/bin/bash

# Direct Database Migration Script (no Docker required)

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

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "❌ PostgreSQL tools not found. Installing..."
    brew install postgresql
    echo ""
fi

# Step 1: Get production password
echo "📋 Step 1: Enter Production Database Password"
echo "   (from https://supabase.com/dashboard/project/$PROD_REF/settings/database)"
echo ""
read -sp "   Production password: " PROD_PASSWORD
echo ""
echo ""

# Step 2: Export schema using pg_dump
echo "📤 Step 2: Exporting production schema..."
PGPASSWORD="$PROD_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/pg_dump \
  -h "db.$PROD_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  --schema-only \
  --no-owner \
  --no-acl \
  -f production-schema.sql

if [ $? -eq 0 ]; then
  echo "✅ Schema exported successfully to production-schema.sql"
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

# Step 4: Import to dev using psql
echo "📥 Step 4: Importing schema to development database..."
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -f production-schema.sql

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
  echo "❌ Import failed. The schema file may need manual review."
  echo "    You can view it at: production-schema.sql"
  exit 1
fi
