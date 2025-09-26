// api/admin/verification/review/route.js - COMPLETE VERSION
import { supabase } from '@/lib/supabase';
import { verifyAdminAuth } from '@/utils/adminAuth';

export async function POST(request) {
  try {
    console.log('🔍 Starting document review...');
    
    const authResult = await verifyAdminAuth(request);
    if (authResult.error) {
      console.log('❌ Auth failed:', authResult.error);
      return Response.json(
        { error: authResult.error }, 
        { status: authResult.status }
      );
    }

    console.log('✅ Admin authenticated:', authResult.user.email);

    const { supplierId, documentType, decision, feedback } = await request.json();

    if (!supplierId || !documentType || !decision) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('📋 Reviewing document:', { supplierId, documentType, decision });

    // Get current supplier data
    const { data: supplier, error: fetchError } = await supabase
      .from('suppliers')
      .select('data')
      .eq('id', supplierId)
      .single();

    if (fetchError) {
      console.error('Error fetching supplier:', fetchError);
      throw fetchError;
    }

    if (!supplier.data) {
      return Response.json({ error: 'Supplier data not found' }, { status: 404 });
    }

    // Log current verification state BEFORE update
    console.log('📊 BEFORE UPDATE:');
    console.log('Current verification status:', supplier.data.verification?.status);
    console.log('Current isVerified:', supplier.data.isVerified);
    console.log('Current documents:', Object.keys(supplier.data.verification?.documents || {}));
    
    // Log each document status
    Object.entries(supplier.data.verification?.documents || {}).forEach(([docType, docData]) => {
      console.log(`  ${docType}: ${docData.status}`);
    });

    // Update verification document status
    const updatedData = {
      ...supplier.data,
      verification: {
        ...supplier.data.verification,
        documents: {
          ...supplier.data.verification.documents,
          [documentType]: {
            ...supplier.data.verification.documents[documentType],
            status: decision,
            reviewFeedback: feedback,
            reviewedAt: new Date().toISOString(),
            reviewedBy: authResult.user.id
          }
        },
        auditLog: [
          ...(supplier.data.verification?.auditLog || []),
          {
            action: 'document_reviewed',
            documentType,
            decision,
            timestamp: new Date().toISOString(),
            adminId: authResult.user.id,
            adminEmail: authResult.user.email,
            feedback: feedback
          }
        ]
      }
    };

    // Check document statuses AFTER update
    const requiredDocs = ['dbs', 'id', 'address'];
    const documents = updatedData.verification.documents;
    
    console.log('📊 AFTER UPDATE:');
    console.log('Required documents:', requiredDocs);
    
    // Check each required document
    const docStatuses = {};
    requiredDocs.forEach(doc => {
      const status = documents[doc]?.status;
      docStatuses[doc] = status;
      console.log(`  ${doc}: ${status || 'NOT_FOUND'}`);
    });

    const allApproved = requiredDocs.every(doc => {
      const isApproved = documents[doc]?.status === 'approved';
      console.log(`  ${doc} approved? ${isApproved}`);
      return isApproved;
    });

    console.log('🎯 ALL APPROVED?', allApproved);

    const anyRejected = requiredDocs.some(doc => 
      documents[doc]?.status === 'rejected'
    );

    console.log('❌ ANY REJECTED?', anyRejected);

    let wasAlreadyVerified = false;
    let newlyVerified = false;

    if (allApproved) {
      // Check if they were already verified before this update
      wasAlreadyVerified = supplier.data.verification?.status === 'verified' || 
                          supplier.data.isVerified === true;
      
      console.log('📋 Was already verified?', wasAlreadyVerified);
      
      updatedData.verification.status = 'verified';
      updatedData.verification.verifiedAt = new Date().toISOString();
      updatedData.verification.expiresAt = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString();
      updatedData.isVerified = true;
      
      newlyVerified = !wasAlreadyVerified;
      
      console.log('🎉 All documents approved - supplier verified');
      console.log('✨ NEWLY VERIFIED?', newlyVerified);
    }

    if (anyRejected && !allApproved) {
      updatedData.verification.status = 'rejected';
      console.log('❌ Document rejected - supplier verification failed');
    }

    // Save to database
    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ data: updatedData })
      .eq('id', supplierId);

    if (updateError) {
      console.error('Error updating supplier:', updateError);
      throw updateError;
    }

    console.log('✅ Document review completed successfully');

    // EMAIL SENDING LOGIC - COMPLETE IMPLEMENTATION
    if (newlyVerified) {
      console.log('📧 CONDITIONS MET - SENDING VERIFICATION EMAIL');
      
      // Extract email data with fallbacks
      const supplierEmail = supplier.data.owner?.email || supplier.data.email || supplier.data.contactEmail;
      const supplierName = supplier.data.owner?.name || supplier.data.contactName || supplier.data.ownerName || 'Supplier';
      const businessName = supplier.data.businessName || supplier.data.business_name || 'Your Business';
      const serviceType = supplier.data.serviceType || supplier.data.category || 'Entertainment';

      const emailData = {
        supplierEmail,
        supplierName,
        businessName,
        serviceType,
        dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/suppliers/dashboard`,
        documentsApproved: requiredDocs
      };

      console.log('📧 Email data prepared:', {
        to: emailData.supplierEmail,
        name: emailData.supplierName,
        business: emailData.businessName,
        service: emailData.serviceType,
        hasEmail: !!emailData.supplierEmail
      });

      if (!emailData.supplierEmail) {
        console.error('❌ NO EMAIL ADDRESS FOUND FOR SUPPLIER');
        console.log('Available email fields in supplier data:', {
          'owner.email': supplier.data.owner?.email,
          'email': supplier.data.email,
          'contactEmail': supplier.data.contactEmail,
          'data keys': Object.keys(supplier.data)
        });
      } else {
        console.log('📧 Attempting to send verification complete email...');
        
        // CORRECTED: Use singular /email/ path
        const emailUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/email/verification-complete`;
        console.log('📧 Email API URL:', emailUrl);
        
        try {
          console.log('📧 Making email API request...');
          
          const emailResponse = await fetch(emailUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData)
          });

          console.log('📧 Email API response status:', emailResponse.status);
          console.log('📧 Email API response ok:', emailResponse.ok);

          if (!emailResponse.ok) {
            const emailErrorText = await emailResponse.text();
            console.error('❌ Email API returned error status:', emailResponse.status);
            console.error('❌ Email API error response:', emailErrorText);
            // Don't fail the whole verification process if email fails
          } else {
            const emailResult = await emailResponse.json();
            console.log('✅ Email API success response:', emailResult);
          }
        } catch (emailError) {
          console.error('❌ Email API fetch error:', emailError.message);
          console.error('❌ Email error stack:', emailError.stack);
          // Don't fail the whole verification process if email fails
        }
      }
    } else {
      console.log('📧 EMAIL NOT SENT - CONDITIONS NOT MET:');
      console.log('  - All documents approved?', allApproved);
      console.log('  - Was already verified?', wasAlreadyVerified);
      console.log('  - Newly verified?', newlyVerified);
      
      if (!allApproved) {
        console.log('  - Missing approved documents:', 
          requiredDocs.filter(doc => documents[doc]?.status !== 'approved')
        );
      }
    }

    return Response.json({ 
      success: true,
      message: `Document ${decision} successfully`,
      newStatus: updatedData.verification.status,
      debug: {
        allApproved,
        wasAlreadyVerified,
        newlyVerified,
        emailTriggered: newlyVerified,
        documentStatuses: docStatuses,
        supplierEmail: supplier.data.owner?.email || supplier.data.email || supplier.data.contactEmail,
        requiredDocs: requiredDocs
      }
    });

  } catch (error) {
    console.error('💥 CRITICAL ERROR in review API:', error);
    return Response.json({ 
      error: 'Review failed', 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}