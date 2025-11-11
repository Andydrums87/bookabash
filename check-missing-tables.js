const { createClient } = require('@supabase/supabase-js');

const prodUrl = 'https://qmrrmrhwdiyubqokxvbt.supabase.co';
const prodKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtcnJtcmh3ZGl5dWJxb2t4dmJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4OTYzMiwiZXhwIjoyMDc4MzY1NjMyfQ.lKkyhnAbjzTa0OfaW_w1_c0zCnWMijuwsdxA-yJdkR8';

const prodSupabase = createClient(prodUrl, prodKey);

async function checkTables() {
  const tables = [
    'admin_users',
    'admin_verification_queue',
    'business_summary',
    'gift_items',
    'onboarding_drafts',
    'payments',
    'public_invites',
    'rsvps',
    'supplier_message_templates',
    'terms_acceptances',
    'urgent_alerts'
  ];

  for (const table of tables) {
    console.log(`\n=== ${table} ===`);
    const { data, error } = await prodSupabase
      .from(table)
      .select('*')
      .limit(1);

    if (!error && data?.[0]) {
      console.log('Columns:', Object.keys(data[0]).join(', '));
    } else if (error) {
      console.log('Error:', error.message);
    } else {
      console.log('Table exists but no data');
    }
  }
}

checkTables();
