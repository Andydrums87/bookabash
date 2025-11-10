#!/bin/bash

# Final simplified import

set -e

DEV_REF="qmrrmrhwdiyubqokxvbt"

echo "📥 Final Data Import"
echo "===================="
echo ""

read -sp "Enter dev database password: " DEV_PASSWORD
echo ""
echo ""

echo "📥 Importing data (this will take 1-2 minutes)..."
echo ""

PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "aws-0-us-west-1.pooler.supabase.com" \
  -p 6543 \
  -U "postgres.$DEV_REF" \
  -d postgres \
  -v ON_ERROR_STOP=0 \
  -f all-production-data-clean.sql 2>&1 | tail -20

echo ""
echo "📊 Checking results..."
echo ""

# Check counts
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "aws-0-us-west-1.pooler.supabase.com" \
  -p 6543 \
  -U "postgres.$DEV_REF" \
  -d postgres \
  -c "SELECT 'users' as table, COUNT(*) FROM users UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers UNION ALL SELECT 'parties', COUNT(*) FROM parties UNION ALL SELECT 'enquiries', COUNT(*) FROM enquiries;" 2>/dev/null

echo ""
echo "✅ Done!"
