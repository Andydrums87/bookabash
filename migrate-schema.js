#!/usr/bin/env node

/**
 * Schema Migration Script
 * Exports schema from production Supabase and imports to dev Supabase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Starting schema migration...\n');

// Production credentials (from Vercel/production)
const PROD_URL = 'https://gdbcdubivrrfhnbczgkn.supabase.co';
const PROD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkYmNkdWJpdnJyZmhuYmN6Z2tuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5NTc4MSwiZXhwIjoyMDY4NjcxNzgxfQ._xaaf6tIs_80Lux4v68eLgOZUzEAxVcZu8z1GUEPzdM';

// Dev credentials (from .env.local)
const DEV_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const DEV_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DEV_URL || !DEV_SERVICE_KEY) {
  console.error('❌ Error: Missing dev credentials in .env.local');
  console.error('Make sure you have:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('📋 Configuration:');
console.log('  Production:', PROD_URL);
console.log('  Development:', DEV_URL);
console.log('');

// Extract project ref from URLs
const prodRef = PROD_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
const devRef = DEV_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

// Build connection strings
const prodConnection = `postgresql://postgres.${prodRef}:[YOUR-DB-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;
const devConnection = `postgresql://postgres.${devRef}:[YOUR-DB-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

console.log('⚠️  IMPORTANT: This script needs your database passwords.');
console.log('');
console.log('You can find them in:');
console.log('  Production: Supabase Dashboard → Settings → Database → Database Password');
console.log('  Development: Your dev project → Settings → Database → Database Password');
console.log('');
console.log('Instead, let\'s use a simpler approach with the Supabase REST API...\n');

// Alternative: Use Supabase Management API to get schema
const { createClient } = require('@supabase/supabase-js');

async function exportSchema() {
  console.log('📤 Connecting to production database...');

  const supabaseProd = createClient(PROD_URL, PROD_SERVICE_KEY);

  // Get all tables
  const { data: tables, error: tablesError } = await supabaseProd
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE');

  if (tablesError) {
    console.error('❌ Error fetching tables:', tablesError);
    console.log('\n💡 Alternative: Use Supabase CLI manually:');
    console.log('\nStep 1 - Export from production:');
    console.log(`  supabase db dump --db-url "postgresql://postgres:YOUR_PASSWORD@db.${prodRef}.supabase.co:5432/postgres" -f production-schema.sql\n`);
    console.log('Step 2 - Import to dev:');
    console.log(`  supabase db push --db-url "postgresql://postgres:YOUR_PASSWORD@db.${devRef}.supabase.co:5432/postgres" --file production-schema.sql\n`);
    return;
  }

  console.log(`✅ Found ${tables?.length || 0} tables in production`);
  console.log('');
  console.log('Tables:', tables?.map(t => t.table_name).join(', '));
}

// Check if @supabase/supabase-js is installed
try {
  require.resolve('@supabase/supabase-js');
  exportSchema().catch(console.error);
} catch (e) {
  console.log('💡 Simplest method - Use Supabase CLI:\n');
  console.log('Get your production database password:');
  console.log('  1. Go to https://supabase.com/dashboard/project/gdbcdubivrrfhnbczgkn/settings/database');
  console.log('  2. Copy your database password (or reset it if you don\'t have it)\n');
  console.log('Then run:\n');
  console.log(`  supabase db dump --db-url "postgresql://postgres:YOUR_PROD_PASSWORD@db.${prodRef}.supabase.co:5432/postgres" -f production-schema.sql\n`);
  console.log('Get your dev database password:');
  console.log(`  1. Go to https://supabase.com/dashboard/project/${devRef}/settings/database`);
  console.log('  2. Copy your database password\n');
  console.log('Then import to dev:\n');
  console.log(`  psql "postgresql://postgres:YOUR_DEV_PASSWORD@db.${devRef}.supabase.co:5432/postgres" < production-schema.sql\n`);
}
