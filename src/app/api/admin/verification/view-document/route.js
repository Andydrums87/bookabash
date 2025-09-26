// app/api/admin/verification/view-document/route.js
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
    const { cloudinaryId, supplierId, documentType } = await request.json();

    // TODO: Add admin authentication check here
    // For now, just verify the request has required fields
    if (!cloudinaryId || !supplierId || !documentType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Try to get resource info by attempting different resource types
    let resourceInfo;
    let resourceType = 'raw'; // Default for PDFs and other documents
    
    try {
      // First try 'raw' (for PDFs and other non-image documents)
      resourceInfo = await cloudinary.api.resource(cloudinaryId, { 
        resource_type: 'raw',
        type: 'private' 
      });
      resourceType = 'raw';
    } catch (error) {
      try {
        // If 'raw' fails, try 'image' (for JPG, PNG, etc.)
        resourceInfo = await cloudinary.api.resource(cloudinaryId, { 
          resource_type: 'image',
          type: 'private' 
        });
        resourceType = 'image';
      } catch (error2) {
        console.error('Failed to get resource info for both raw and image:', error2);
        return Response.json({ error: 'Document not found' }, { status: 404 });
      }
    }

    // Get the format from the resource info
    const format = resourceInfo.format || 'pdf'; // Default to pdf if format not available
    
    console.log('Found resource:', { cloudinaryId, resourceType, format });
    
    // Generate a signed URL for viewing the document (expires in 1 hour)
    const signedUrl = cloudinary.utils.private_download_url(cloudinaryId, format, {
      expires_at: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour from now
      attachment: false, // View in browser, not download
      resource_type: resourceType,
      type: 'private'
    });

    return Response.json({
      success: true,
      viewUrl: signedUrl,
      expiresIn: 3600 // 1 hour
    });

  } catch (error) {
    console.error('Error generating document view URL:', error);
    return Response.json({ 
      error: 'Failed to generate document view URL' 
    }, { status: 500 });
  }
}