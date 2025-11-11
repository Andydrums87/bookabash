const { createClient } = require('@supabase/supabase-js');

const prodUrl = 'https://qmrrmrhwdiyubqokxvbt.supabase.co';
const prodKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtcnJtcmh3ZGl5dWJxb2t4dmJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4OTYzMiwiZXhwIjoyMDc4MzY1NjMyfQ.lKkyhnAbjzTa0OfaW_w1_c0zCnWMijuwsdxA-yJdkR8';

const prodSupabase = createClient(prodUrl, prodKey);

async function checkTables() {
  const tables = [
    'party_gift_registries',
    'registry_items',
    'supplier_responses',
    'applications'
  ];

  for (const table of tables) {
    console.log(`\nChecking ${table}...`);
    const { data, error } = await prodSupabase
      .from(table)
      .select('*')
      .limit(1);

    if (!error && data?.[0]) {
      console.log(`${table} columns:`, Object.keys(data[0]));
    } else if (error) {
      console.log(`${table} error:`, error.message);
    } else {
      console.log(`${table}: No data found`);
    }
  }
}

checkTables();
