#!/bin/bash

DEV_REF="qmrrmrhwdiyubqokxvbt"

echo "📥 Wake and Import Data"
echo "======================="
echo ""
echo "First, make sure your dev project is awake:"
echo "1. Go to: https://supabase.com/dashboard/project/$DEV_REF"
echo "2. If it says 'Project is paused', click 'Restore'"
echo "3. Wait 1-2 minutes for it to wake up"
echo ""
read -p "Press ENTER when the project is active..."
echo ""

read -sp "Enter dev database password: " DEV_PASSWORD
echo ""
echo ""

echo "📥 Testing connection..."
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "SELECT 1;" 2>&1

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Connection failed. Possible issues:"
  echo "   1. Project is still paused/waking up (wait another minute)"
  echo "   2. Wrong password"
  echo "   3. Firewall blocking connection"
  exit 1
fi

echo "✅ Connection successful!"
echo ""

echo "📥 Importing data..."
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -v ON_ERROR_STOP=0 \
  -f all-production-data-clean.sql 2>&1 | grep -E "(COPY|ERROR)" | tail -30

echo ""
echo "📊 Checking counts..."
PGPASSWORD="$DEV_PASSWORD" /opt/homebrew/opt/postgresql@17/bin/psql \
  -h "db.$DEV_REF.supabase.co" \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "SELECT 'users' as table, COUNT(*) FROM users 
      UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers 
      UNION ALL SELECT 'parties', COUNT(*) FROM parties 
      UNION ALL SELECT 'enquiries', COUNT(*) FROM enquiries;" 2>/dev/null

echo ""
echo "✅ Done!"
