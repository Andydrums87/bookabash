// app/api/verification/delete/route.js
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request) {
  try {
    console.log('Processing document delete...');

    // Simple authentication approach
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'No authorization header found' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Use ANON key for authentication
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      console.log('Auth failed:', authError);
      return Response.json({ error: 'Authentication failed' }, { status: 401 });
    }

    console.log('Authenticated user:', user.id);

    // Use SERVICE ROLE key for database mutations (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get request body
    const { documentType, supplierId } = await request.json();

    if (!documentType) {
      return Response.json({ error: 'Missing document type' }, { status: 400 });
    }

    console.log('Delete request for:', { documentType, supplierId });

    // Get suppliers for this user
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('id, business_name, data, is_primary')
      .eq('auth_user_id', user.id)
      .order('is_primary', { ascending: false });

    if (suppliersError || !suppliers || suppliers.length === 0) {
      console.error('No suppliers found:', suppliersError);
      return Response.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    // Use specific supplier if requested, otherwise use first
    let supplier;
    if (supplierId) {
      supplier = suppliers.find(s => s.id === supplierId);
      if (!supplier) {
        console.error('Requested supplier not found:', supplierId);
        return Response.json({ error: 'Requested supplier not found' }, { status: 404 });
      }
    } else {
      supplier = suppliers[0];
    }

    console.log('Using supplier:', supplier.business_name || supplier.id);

    // Get current verification data
    const currentData = supplier.data || {};
    const currentVerification = currentData.verification || {};
    const currentDocuments = currentVerification.documents || {};

    // Check if document exists
    if (!currentDocuments[documentType]) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    const documentToDelete = currentDocuments[documentType];

    // Try to delete from Cloudinary if we have the cloudinaryId
    if (documentToDelete.cloudinaryId) {
      try {
        console.log('Deleting from Cloudinary:', documentToDelete.cloudinaryId);
        await cloudinary.uploader.destroy(documentToDelete.cloudinaryId, {
          resource_type: documentToDelete.fileType?.startsWith('image/') ? 'image' : 'raw',
          type: 'private'
        });
        console.log('Cloudinary delete successful');
      } catch (cloudinaryError) {
        console.error('Cloudinary delete failed:', cloudinaryError);
        // Continue anyway - we still want to remove from database
      }
    }

    // Create updated documents object without the deleted document
    const { [documentType]: removed, ...remainingDocuments } = currentDocuments;

    // Update verification data
    const updatedData = {
      ...currentData,
      verification: {
        ...currentVerification,
        documents: remainingDocuments,
        uploadHistory: [
          ...(currentVerification.uploadHistory || []),
          {
            action: 'document_deleted',
            documentType,
            fileName: documentToDelete.fileName,
            timestamp: new Date().toISOString(),
            userId: user.id
          }
        ]
      }
    };

    // Check if any documents remain - if not, reset status
    const remainingDocCount = Object.keys(remainingDocuments).length;
    if (remainingDocCount === 0) {
      updatedData.verification.status = 'not_started';
    }

    console.log('Updating supplier database...');

    // Save to database
    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ data: updatedData })
      .eq('id', supplier.id);

    if (updateError) {
      console.error('Database update failed:', updateError);
      return Response.json({ error: 'Failed to delete document' }, { status: 500 });
    }

    console.log('Document deleted successfully');

    return Response.json({
      success: true,
      message: 'Document deleted successfully',
      documentType
    });

  } catch (error) {
    console.error('Delete error:', error);
    return Response.json({
      error: 'Delete failed. Please try again or contact support if the problem persists.'
    }, { status: 500 });
  }
}
