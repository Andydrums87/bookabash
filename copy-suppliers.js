const { createClient } = require('@supabase/supabase-js');

// Production (cloud dev)
const prodUrl = 'https://qmrrmrhwdiyubqokxvbt.supabase.co';
const prodKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtcnJtcmh3ZGl5dWJxb2t4dmJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4OTYzMiwiZXhwIjoyMDc4MzY1NjMyfQ.lKkyhnAbjzTa0OfaW_w1_c0zCnWMijuwsdxA-yJdkR8';

// Local
const localUrl = 'http://127.0.0.1:54321';
const localKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const prodSupabase = createClient(prodUrl, prodKey);
const localSupabase = createClient(localUrl, localKey);

async function copySuppliers() {
  console.log('🚀 Starting suppliers data copy from production to local...\n');

  try {
    // Fetch all suppliers from production
    console.log('📥 Fetching suppliers from production...');
    const { data: suppliers, error: fetchError } = await prodSupabase
      .from('suppliers')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching suppliers:', fetchError);
      return;
    }

    console.log(`✅ Found ${suppliers.length} suppliers\n`);

    // Insert into local database
    console.log('📤 Copying to local database...');
    const { data: inserted, error: insertError } = await localSupabase
      .from('suppliers')
      .insert(suppliers)
      .select();

    if (insertError) {
      console.error('❌ Error inserting suppliers:', insertError);
      return;
    }

    console.log(`✅ Successfully copied ${inserted.length} suppliers!\n`);

    // Show sample
    console.log('Sample supplier:', {
      id: inserted[0]?.id,
      name: inserted[0]?.data?.name,
      category: inserted[0]?.data?.category,
      email: inserted[0]?.email
    });

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

copySuppliers();
