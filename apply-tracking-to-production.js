const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Production credentials (from screenshot)
const prodUrl = 'https://qmrrmrhwdiyubqokxvbt.supabase.co';
const prodKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtcnJtcmh3ZGl5dWJxb2t4dmJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4OTYzMiwiZXhwIjoyMDc4MzY1NjMyfQ.lKkyhnAbjzTa0OfaW_w1_c0zCnWMijuwsdxA-yJdkR8';

const supabase = createClient(prodUrl, prodKey);

async function applyTrackingMigrations() {
  console.log('🚀 Applying tracking migrations to production database...\n');

  try {
    // Read migration files
    const migration1 = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20250111000004_create_party_tracking.sql'),
      'utf8'
    );

    const migration2 = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20250111000005_add_tracking_timeline.sql'),
      'utf8'
    );

    // Check if table already exists
    console.log('📊 Checking if party_tracking table exists...');
    const { data: tables, error: checkError } = await supabase
      .from('party_tracking')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('⚠️  party_tracking table already exists!');
      console.log('Would you like to:');
      console.log('1. Skip (table exists)');
      console.log('2. Add timeline column only (if missing)');
      console.log('\nTo add timeline column, run this SQL in Supabase SQL Editor:');
      console.log('\n' + migration2);
      return;
    }

    // Apply first migration (create table)
    console.log('📝 Creating party_tracking table...');
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: migration1
    });

    if (error1) {
      // Try direct execution via REST API
      console.log('⚠️  RPC method not available, using direct SQL execution...');
      console.log('\nPlease run this SQL in your Supabase SQL Editor:\n');
      console.log('----------------------------------------');
      console.log(migration1);
      console.log('----------------------------------------\n');
      console.log('Then run this for the timeline column:\n');
      console.log('----------------------------------------');
      console.log(migration2);
      console.log('----------------------------------------\n');
      return;
    }

    console.log('✅ party_tracking table created!');

    // Apply second migration (add timeline column)
    console.log('📝 Adding action_timeline column...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: migration2
    });

    if (error2) {
      console.log('⚠️  Could not add timeline column automatically');
      console.log('\nPlease run this SQL in your Supabase SQL Editor:\n');
      console.log('----------------------------------------');
      console.log(migration2);
      console.log('----------------------------------------\n');
      return;
    }

    console.log('✅ action_timeline column added!');
    console.log('\n🎉 Tracking system successfully deployed to production!');

  } catch (err) {
    console.error('❌ Error applying migrations:', err.message);
    console.log('\n📋 Manual steps required:');
    console.log('\n1. Go to your Supabase Dashboard > SQL Editor');
    console.log('2. Run these migrations in order:\n');

    const migration1 = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20250111000004_create_party_tracking.sql'),
      'utf8'
    );

    const migration2 = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20250111000005_add_tracking_timeline.sql'),
      'utf8'
    );

    console.log('--- Migration 1: Create table ---');
    console.log(migration1);
    console.log('\n--- Migration 2: Add timeline ---');
    console.log(migration2);
  }
}

applyTrackingMigrations();
