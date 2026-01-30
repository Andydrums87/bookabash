/**
 * Script to reset supplier user password
 *
 * Usage: node scripts/reset-supplier-password.js
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const SUPPLIER_EMAIL = 'andydrums87@gmail.com'
const NEW_PASSWORD = 'LocalSupplier123!'

async function main() {
  console.log('🔐 Resetting supplier password...\n')

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables')
    process.exit(1)
  }

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log(`📧 Email: ${SUPPLIER_EMAIL}`)
  console.log(`🔑 New Password: ${NEW_PASSWORD}\n`)

  // Find the user
  console.log('1️⃣ Finding user...')
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('❌ Error listing users:', listError.message)
    process.exit(1)
  }

  const user = users.users.find(u => u.email === SUPPLIER_EMAIL)

  if (!user) {
    console.error('❌ User not found!')
    console.error('   Make sure the user exists first by running: npm run create-supplier-user')
    process.exit(1)
  }

  console.log('✅ User found!')
  console.log(`   User ID: ${user.id}\n`)

  // Update password
  console.log('2️⃣ Updating password...')
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: NEW_PASSWORD }
  )

  if (updateError) {
    console.error('❌ Error updating password:', updateError.message)
    process.exit(1)
  }

  console.log('✅ Password updated successfully!\n')

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Password reset complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📧 Email:    ${SUPPLIER_EMAIL}`)
  console.log(`🔑 Password: ${NEW_PASSWORD}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch(console.error)
