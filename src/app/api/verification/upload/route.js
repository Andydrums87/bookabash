// app/api/verification/upload/route.js (SIMPLIFIED VERSION)
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import { ServerClient } from 'postmark';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure Postmark
const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN);

export async function POST(request) {
  try {
    console.log('Processing document upload...');

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

    // Get form data first to check if supplierId is provided
    const formData = await request.formData();
    const file = formData.get('file');
    const documentType = formData.get('documentType');
    const requestedSupplierId = formData.get('supplierId');
    const metadata = formData.get('metadata') ? JSON.parse(formData.get('metadata')) : {};

    console.log('Requested supplierId:', requestedSupplierId);

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

    console.log('All supplier IDs for this user:', suppliers.map(s => ({ id: s.id, name: s.business_name })));

    // Use specific supplier if requested, otherwise use first (primary first if exists)
    let supplier;
    if (requestedSupplierId) {
      supplier = suppliers.find(s => s.id === requestedSupplierId);
      if (!supplier) {
        console.error('Requested supplier not found:', requestedSupplierId);
        return Response.json({ error: 'Requested supplier not found' }, { status: 404 });
      }
      console.log('Using requested supplier:', supplier.id);
    } else {
      supplier = suppliers[0];
      console.log('Using first supplier (no supplierId provided):', supplier.id);
    }
    console.log('Using supplier:', supplier.business_name || supplier.id);

    // Validation
    if (!file || !documentType) {
      return Response.json({ error: 'Missing file or document type' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Invalid file type. PDF, JPG, PNG only' }, { status: 400 });
    }

    console.log(`Uploading ${documentType} document:`, file.name);

    // Upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `verification/${supplier.id}/${documentType}`,
          resource_type: file.type.startsWith('image/') ? 'image' : 'raw',
          access_mode: 'authenticated',
          type: 'private',
          tags: [`supplier:${supplier.id}`, `doctype:${documentType}`, 'verification'],
          context: {
            original_filename: file.name,
            document_type: documentType,
            supplier_id: supplier.id,
            uploaded_at: new Date().toISOString()
          }
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(buffer);
    });

    console.log('Cloudinary upload successful');

    // Update supplier verification data
    const currentData = supplier.data || {};
    const currentVerification = currentData.verification || {
      status: 'not_started',
      documents: {},
      uploadHistory: []
    };

    const updatedData = {
      ...currentData,
      verification: {
        ...currentVerification,
        documents: {
          ...currentVerification.documents,
          [documentType]: {
            status: 'submitted',
            cloudinaryId: uploadResult.public_id,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadedAt: new Date().toISOString(),
            cloudinaryUrl: uploadResult.secure_url,
            metadata: metadata,
            reviewFeedback: null,
            reviewedAt: null,
            reviewedBy: null
          }
        },
        uploadHistory: [
          ...(currentVerification.uploadHistory || []),
          {
            action: 'document_uploaded',
            documentType,
            fileName: file.name,
            timestamp: new Date().toISOString(),
            userId: user.id
          }
        ]
      }
    };

    // Update overall status if this is first upload
    if (currentVerification.status === 'not_started') {
      updatedData.verification.status = 'pending_review';
      updatedData.verification.submittedAt = new Date().toISOString();
    }

    console.log('Updating supplier database...');
    console.log('Supplier ID being updated:', supplier.id);
    console.log('Verification data structure:', JSON.stringify({
      status: updatedData.verification.status,
      documents: Object.keys(updatedData.verification.documents),
      [documentType]: updatedData.verification.documents[documentType].status
    }));

    // Save to database
    const { data: updateResult, error: updateError } = await supabase
      .from('suppliers')
      .update({ data: updatedData })
      .eq('id', supplier.id)
      .select();

    if (updateError) {
      console.error('Database update failed:', updateError);
      // Try to clean up uploaded file
      await cloudinary.uploader.destroy(uploadResult.public_id);
      return Response.json({ error: 'Failed to save document' }, { status: 500 });
    }

    console.log('Database updated successfully');
    console.log('Update result:', updateResult ? `${updateResult.length} row(s) updated` : 'No result');

    // Verify the data was saved by reading it back
    const { data: verifyData } = await supabase
      .from('suppliers')
      .select('data')
      .eq('id', supplier.id)
      .single();

    console.log('Verification check - has verification in DB?', !!verifyData?.data?.verification);
    console.log('Verification check - documents:', verifyData?.data?.verification?.documents ? Object.keys(verifyData.data.verification.documents) : []);

    // Send admin notification
    try {
      await sendAdminNotification({
        supplierName: supplier.business_name,
        supplierId: supplier.id,
        documentType,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        cloudinaryId: uploadResult.public_id,
        supplierEmail: currentData.owner?.email || currentData.email || user.email
      });
      console.log('Admin notification sent');
    } catch (emailError) {
      console.error('Admin notification failed:', emailError);
      // Don't fail the upload if email fails
    }

    return Response.json({
      success: true,
      message: 'Document uploaded successfully. Our team will review it within 48 hours.',
      documentType,
      fileName: file.name,
      status: 'submitted',
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ 
      error: 'Upload failed. Please try again or contact support if the problem persists.'
    }, { status: 500 });
  }
}

async function sendAdminNotification(details) {
  const { supplierName, supplierId, documentType, fileName, uploadedAt, cloudinaryId, supplierEmail } = details;
  
  const documentTypeNames = {
    dbs: 'DBS Certificate',
    id: 'Photo ID',
    address: 'Address Proof'
  };

  try {
    await postmarkClient.sendEmail({
      From: 'hello@partysnap.uk',
      To: process.env.ADMIN_EMAIL,
      Subject: `${documentTypeNames[documentType]} Review Required - ${supplierName}`,
      TextBody: `
NEW VERIFICATION DOCUMENT - ACTION REQUIRED

Supplier: ${supplierName}
Document: ${documentTypeNames[documentType] || documentType}
File: ${fileName}
Uploaded: ${new Date(uploadedAt).toLocaleString('en-GB')}

Admin Dashboard: ${process.env.NEXT_PUBLIC_BASE_URL}/admin/verification

Technical Details:
- Supplier ID: ${supplierId}
- Cloudinary ID: ${cloudinaryId}
      `,
      Tag: 'verification-admin-alert'
    });
  } catch (error) {
    console.error('Email notification failed:', error);
  }
}