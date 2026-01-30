/**
 * Script to create a local supplier user and link existing suppliers
 *
 * This script:
 * 1. Creates a Supabase auth user for andydrums87@gmail.com
 * 2. Updates all suppliers with matching owner email to link to this auth user
 *
 * Usage: node scripts/create-local-supplier-user.js
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const SUPPLIER_EMAIL = 'andydrums87@gmail.com'
const SUPPLIER_PASSWORD = 'LocalSupplier123!' // Change this to whatever you want

async function main() {
  console.log('🚀 Starting local supplier user setup...\n')

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    console.error('\nMake sure these are set in your .env.local file')
    process.exit(1)
  }

  // Create Supabase admin client (can bypass RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log(`📧 Email: ${SUPPLIER_EMAIL}`)
  console.log(`🔑 Password: ${SUPPLIER_PASSWORD}\n`)

  // Step 1: Check if user already exists
  console.log('1️⃣ Checking if user already exists...')
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('❌ Error checking existing users:', listError.message)
    process.exit(1)
  }

  let authUserId
  const existingUser = existingUsers.users.find(u => u.email === SUPPLIER_EMAIL)

  if (existingUser) {
    console.log('✅ User already exists!')
    authUserId = existingUser.id
    console.log(`   User ID: ${authUserId}\n`)
  } else {
    // Step 2: Create the auth user
    console.log('2️⃣ Creating Supabase auth user...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: SUPPLIER_EMAIL,
      password: SUPPLIER_PASSWORD,
      email_confirm: true, // Auto-confirm email for local dev
      user_metadata: {
        role: 'supplier',
        name: 'Andrew Joseph'
      }
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message)
      process.exit(1)
    }

    authUserId = authData.user.id
    console.log('✅ Auth user created successfully!')
    console.log(`   User ID: ${authUserId}\n`)
  }

  // Step 3: Find all suppliers with matching owner email
  console.log('3️⃣ Finding suppliers with owner email...')
  const { data: suppliers, error: suppliersError } = await supabase
    .from('suppliers')
    .select('id, business_name, data')
    .or(`data->owner->>email.eq.${SUPPLIER_EMAIL}`)

  if (suppliersError) {
    console.error('❌ Error fetching suppliers:', suppliersError.message)
    process.exit(1)
  }

  console.log(`   Found ${suppliers.length} supplier(s)\n`)

  if (suppliers.length === 0) {
    console.log('⚠️  No suppliers found with this owner email')
    console.log('   Your suppliers might use a different email in the owner.email field')
    console.log('\n✅ Auth user created successfully. You can now sign in with:')
    console.log(`   Email: ${SUPPLIER_EMAIL}`)
    console.log(`   Password: ${SUPPLIER_PASSWORD}`)
    process.exit(0)
  }

  // Step 4: Update all matching suppliers
  console.log('4️⃣ Linking suppliers to auth user...')
  let updatedCount = 0
  let errors = []
  let primarySet = false

  for (const supplier of suppliers) {
    // Set the first supplier as primary
    const updateData = {
      auth_user_id: authUserId,
      is_primary: !primarySet, // First one is primary
      business_type: primarySet ? 'themed' : 'primary' // First is primary, rest are themed
    }

    const { error: updateError } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', supplier.id)

    if (updateError) {
      errors.push({ id: supplier.id, name: supplier.business_name, error: updateError.message })
    } else {
      updatedCount++
      const type = !primarySet ? '(PRIMARY)' : ''
      console.log(`   ✅ Linked: ${supplier.business_name || supplier.id} ${type}`)
      primarySet = true
    }
  }

  console.log(`\n✅ Successfully linked ${updatedCount} supplier(s)!\n`)

  if (errors.length > 0) {
    console.log('⚠️  Some suppliers failed to link:')
    errors.forEach(e => console.log(`   - ${e.name || e.id}: ${e.error}`))
    console.log()
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Setup complete! You can now sign in with:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📧 Email:    ${SUPPLIER_EMAIL}`)
  console.log(`🔑 Password: ${SUPPLIER_PASSWORD}`)
  console.log(`👤 User ID:  ${authUserId}`)
  console.log(`🏢 Suppliers: ${updatedCount} linked`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch(console.error)
