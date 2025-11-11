const { createClient } = require('@supabase/supabase-js');

const prodUrl = 'https://qmrrmrhwdiyubqokxvbt.supabase.co';
const prodKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtcnJtcmh3ZGl5dWJxb2t4dmJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4OTYzMiwiZXhwIjoyMDc4MzY1NjMyfQ.lKkyhnAbjzTa0OfaW_w1_c0zCnWMijuwsdxA-yJdkR8';

const prodSupabase = createClient(prodUrl, prodKey);

async function checkLegacyId() {
  const { data, error } = await prodSupabase
    .from('suppliers')
    .select('legacy_id')
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample legacy_id values:');
  data.forEach((row, i) => {
    console.log(`${i + 1}. ${row.legacy_id} (type: ${typeof row.legacy_id})`);
  });
}

checkLegacyId();
