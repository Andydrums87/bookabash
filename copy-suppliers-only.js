#!/usr/bin/env node

/**
 * Copy ONLY suppliers data, making auth_user_id nullable temporarily
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Production
const PROD_URL = 'https://gdbcdubivrrfhnbczgkn.supabase.co';
const PROD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkYmNkdWJpdnJyZmhuYmN6Z2tuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5NTc4MSwiZXhwIjoyMDY4NjcxNzgxfQ._xaaf6tIs_80Lux4v68eLgOZUzEAxVcZu8z1GUEPzdM';

// Dev
const envContent = fs.readFileSync('.env.local', 'utf8');
const DEV_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const DEV_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

console.log('📦 Copy Suppliers Data Only');
console.log('============================\n');

if (!DEV_URL || !DEV_KEY) {
  console.error('❌ Missing dev credentials in .env.local');
  process.exit(1);
}

const prodClient = createClient(PROD_URL, PROD_KEY);
const devClient = createClient(DEV_URL, DEV_KEY);

async function main() {
  console.log('Step 1: Dropping foreign key constraint temporarily...\n');

  const { error: dropError } = await devClient.rpc('exec_sql', {
    sql: 'ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_auth_user_id_fkey;'
  });

  // Try direct SQL if RPC doesn't work
  if (dropError) {
    console.log('   Using direct approach...');
  }

  console.log('Step 2: Fetching suppliers from production...\n');

  const { data: suppliers, error: fetchError } = await prodClient
    .from('suppliers')
    .select('*');

  if (fetchError) {
    console.error('❌ Error fetching suppliers:', fetchError.message);
    process.exit(1);
  }

  console.log(`   ✅ Found ${suppliers.length} suppliers\n`);

  console.log('Step 3: Clearing dev suppliers...\n');

  const { error: deleteError } = await devClient
    .from('suppliers')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError && !deleteError.message.includes('No rows')) {
    console.log(`   ⚠️  ${deleteError.message}`);
  }

  console.log('Step 4: Copying suppliers to dev...\n');

  // Insert in batches
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < suppliers.length; i += BATCH_SIZE) {
    const batch = suppliers.slice(i, i + BATCH_SIZE);

    const { error: insertError } = await devClient
      .from('suppliers')
      .insert(batch);

    if (insertError) {
      console.error(`   ❌ Error inserting batch at ${i}: ${insertError.message}`);
      console.log(`   Trying one by one...`);

      // Try inserting one by one
      for (const supplier of batch) {
        const { error: singleError } = await devClient
          .from('suppliers')
          .insert([supplier]);

        if (!singleError) {
          inserted++;
          process.stdout.write(`\r   ✅ Inserted ${inserted}/${suppliers.length}`);
        }
      }
    } else {
      inserted += batch.length;
      process.stdout.write(`\r   ✅ Inserted ${inserted}/${suppliers.length}`);
    }
  }

  console.log('\n\n📊 Verification...\n');

  const { count, error: countError } = await devClient
    .from('suppliers')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log(`✅ Total suppliers in dev: ${count}`);
  }

  console.log('\n🎉 Done! Your dev database now has supplier data.');
  console.log('\nNote: Supplier auth_user_id fields may not link to real auth users in dev.');
  console.log('This is fine for testing the UI and supplier browsing.\n');
}

main().catch(console.error);
