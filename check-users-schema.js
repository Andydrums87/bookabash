const { createClient } = require('@supabase/supabase-js');

const prodUrl = 'https://qmrrmrhwdiyubqokxvbt.supabase.co';
const prodKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtcnJtcmh3ZGl5dWJxb2t4dmJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4OTYzMiwiZXhwIjoyMDc4MzY1NjMyfQ.lKkyhnAbjzTa0OfaW_w1_c0zCnWMijuwsdxA-yJdkR8';

const prodSupabase = createClient(prodUrl, prodKey);

async function checkTables() {
  console.log('Checking users table...');
  const { data: users, error: usersError } = await prodSupabase
    .from('users')
    .select('*')
    .limit(1);

  if (!usersError && users?.[0]) {
    console.log('Users columns:', Object.keys(users[0]));
  } else {
    console.log('Users error:', usersError);
  }

  console.log('\nChecking parties table...');
  const { data: parties, error: partiesError } = await prodSupabase
    .from('parties')
    .select('*')
    .limit(1);

  if (!partiesError && parties?.[0]) {
    console.log('Parties columns:', Object.keys(parties[0]));
  } else {
    console.log('Parties error:', partiesError);
  }

  console.log('\nChecking enquiries table...');
  const { data: enquiries, error: enquiriesError } = await prodSupabase
    .from('enquiries')
    .select('*')
    .limit(1);

  if (!enquiriesError && enquiries?.[0]) {
    console.log('Enquiries columns:', Object.keys(enquiries[0]));
  } else {
    console.log('Enquiries error:', enquiriesError);
  }
}

checkTables();
