#!/usr/bin/env node

/**
 * Copy data from production to dev using Supabase API
 * This bypasses direct database connection issues
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Production (from .env.production or Vercel)
const PROD_URL = 'https://gdbcdubivrrfhnbczgkn.supabase.co';
const PROD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkYmNkdWJpdnJyZmhuYmN6Z2tuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5NTc4MSwiZXhwIjoyMDY4NjcxNzgxfQ._xaaf6tIs_80Lux4v68eLgOZUzEAxVcZu8z1GUEPzdM';

// Read dev credentials from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const DEV_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const DEV_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

console.log('📦 Data Copy Tool (via Supabase API)');
console.log('=====================================\n');

if (!DEV_URL || !DEV_KEY) {
  console.error('❌ Missing dev credentials in .env.local');
  process.exit(1);
}

console.log('Production:', PROD_URL);
console.log('Development:', DEV_URL);
console.log('');

const prodClient = createClient(PROD_URL, PROD_KEY);
const devClient = createClient(DEV_URL, DEV_KEY);

const TABLES = [
  'users',
  'suppliers',
  'parties',
  'enquiries',
  'gift_items',
  'onboarding_drafts',
  'party_gift_registries',
  'registry_items',
  'rsvps',
  'supplier_message_templates',
  'supplier_responses',
  'terms_acceptances'
];

async function copyTable(tableName) {
  console.log(`\n📋 Copying ${tableName}...`);

  // Fetch all data from production
  const { data: prodData, error: fetchError } = await prodClient
    .from(tableName)
    .select('*');

  if (fetchError) {
    console.error(`❌ Error fetching ${tableName}:`, fetchError.message);
    return { table: tableName, count: 0, error: fetchError.message };
  }

  if (!prodData || prodData.length === 0) {
    console.log(`   ⚠️  No data in ${tableName}`);
    return { table: tableName, count: 0 };
  }

  console.log(`   Found ${prodData.length} rows`);

  // Clear dev table
  const { error: deleteError } = await devClient
    .from(tableName)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError && !deleteError.message.includes('No rows found')) {
    console.log(`   ⚠️  Could not clear dev table: ${deleteError.message}`);
  }

  // Insert in batches (1000 at a time to avoid API limits)
  const BATCH_SIZE = 1000;
  let inserted = 0;

  for (let i = 0; i < prodData.length; i += BATCH_SIZE) {
    const batch = prodData.slice(i, i + BATCH_SIZE);

    const { error: insertError } = await devClient
      .from(tableName)
      .insert(batch);

    if (insertError) {
      console.error(`   ❌ Error inserting batch: ${insertError.message}`);
      return { table: tableName, count: inserted, error: insertError.message };
    }

    inserted += batch.length;
    console.log(`   ✅ Inserted ${inserted}/${prodData.length}`);
  }

  return { table: tableName, count: inserted };
}

async function main() {
  const results = [];

  for (const table of TABLES) {
    const result = await copyTable(table);
    results.push(result);
  }

  console.log('\n\n📊 Summary');
  console.log('==========\n');

  results.forEach(r => {
    const status = r.error ? '❌' : '✅';
    const msg = r.error ? r.error : `${r.count} rows`;
    console.log(`${status} ${r.table.padEnd(25)} ${msg}`);
  });

  console.log('\n🎉 Done!\n');
  console.log('Test with: npm run dev\n');
}

main().catch(console.error);
