// utils/adminAuth.js - DEBUG VERSION
import { supabase } from '@/lib/supabase';

export async function verifyAdminPermissions(userId, permission) {
  try {
    console.log('🔍 Checking admin permissions for user:', userId, 'permission:', permission);
    
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('permissions, active')
      .eq('user_id', userId)
      .eq('active', true)
      .single();

    if (error) {
      console.log('❌ Database error checking admin:', error.message);
      return false;
    }

    if (!adminUser) {
      console.log('❌ User not found in admin_users table');
      return false;
    }

    console.log('✅ Admin user found with permissions:', adminUser.permissions);

    const hasPermission = adminUser.permissions.includes(permission) || 
                         adminUser.permissions.includes('super_admin');
    
    console.log('🎯 Has permission?', hasPermission);
    return hasPermission;
    
  } catch (err) {
    console.error('💥 Error verifying admin permissions:', err);
    return false;
  }
}

export async function verifyAdminAuth(request) {
  try {
    console.log('🔍 API: Starting admin authentication check...');
    
    // Check authorization header
    const authHeader = request.headers.get('authorization');
    console.log('📋 Auth header present:', !!authHeader);
    console.log('📋 Auth header format:', authHeader ? authHeader.substring(0, 20) + '...' : 'none');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header found');
      return { error: 'No authorization token', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    console.log('🎫 Token extracted:', token ? token.substring(0, 20) + '...' : 'none');
    
    // Check environment variables
    console.log('🔧 NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔧 SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
      return { error: 'Server configuration error', status: 500 };
    }
    
    // Create Supabase service client
    const { createClient } = require('@supabase/supabase-js');
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔧 Supabase service client created');
    
    // Verify token
    const { data: { user }, error } = await supabaseService.auth.getUser(token);
    
    console.log('👤 Token verification result:', {
      hasUser: !!user,
      userEmail: user?.email,
      userId: user?.id,
      error: error?.message
    });
    
    if (error || !user) {
      console.log('❌ Token verification failed:', error?.message);
      return { error: 'Invalid authentication token', status: 401 };
    }

    console.log('✅ User authenticated:', user.email);
    
    // Check admin permissions
    console.log('🔍 Checking admin permissions in database...');
    const { data: adminUser, error: adminError } = await supabaseService
      .from('admin_users')
      .select('permissions, active, email')
      .eq('user_id', user.id)
      .eq('active', true)
      .single();

    console.log('📊 Admin query result:', {
      hasAdminUser: !!adminUser,
      adminEmail: adminUser?.email,
      permissions: adminUser?.permissions,
      error: adminError?.message
    });

    if (adminError || !adminUser) {
      console.log('❌ User is not admin:', adminError?.message);
      return { error: 'Admin access required', status: 403 };
    }

    console.log('🎉 Admin authentication successful!');
    return { user, isAdmin: true, permissions: adminUser.permissions };
    
  } catch (err) {
    console.error('💥 Admin auth critical error:', err);
    return { error: 'Authentication system error', status: 500 };
  }
}

// Alternative simpler version for testing
export async function verifyAdminAuthSimple(request) {
  try {
    console.log('🧪 SIMPLE AUTH TEST: Starting...');
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ SIMPLE: No auth header');
      return { error: 'No authorization token', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    
    // Just check if it's a valid token (not admin permissions yet)
    const { createClient } = require('@supabase/supabase-js');
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: { user }, error } = await supabaseService.auth.getUser(token);
    
    if (error || !user) {
      console.log('❌ SIMPLE: Invalid token');
      return { error: 'Invalid token', status: 401 };
    }

    // Simple email check
    const adminEmails = ['andydrums87@gmail.com']; // Your email
    if (!adminEmails.includes(user.email)) {
      console.log('❌ SIMPLE: Not admin email');
      return { error: 'Not admin', status: 403 };
    }

    console.log('✅ SIMPLE: Auth success');
    return { user, isAdmin: true };
    
  } catch (err) {
    console.error('💥 SIMPLE AUTH ERROR:', err);
    return { error: 'Auth error', status: 500 };
  }
}