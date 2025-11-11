const { createClient } = require('@supabase/supabase-js');

// Production credentials
const supabaseUrl = 'https://qmrrmrhwdiyubqokxvbt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtcnJtcmh3ZGl5dWJxb2t4dmJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4OTYzMiwiZXhwIjoyMDc4MzY1NjMyfQ.lKkyhnAbjzTa0OfaW_w1_c0zCnWMijuwsdxA-yJdkR8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchSchema() {
  console.log('Fetching schema from production...\n');

  // Get all tables from information_schema
  const { data: tables, error } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `
    });

  if (error) {
    console.error('Error fetching tables:', error);

    // Try alternative approach - list tables we know exist
    const knownTables = [
      'users',
      'suppliers',
      'parties',
      'enquiries',
      'supplier_responses',
      'applications',
      'party_gift_registries',
      'registry_items',
      'supplier_message_templates',
      'terms_acceptances'
    ];

    console.log('\nKnown tables from schema:', knownTables.join(', '));
    return knownTables;
  }

  console.log('Tables found:', tables);
  return tables;
}

fetchSchema();
