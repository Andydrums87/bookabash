// api/admin/verification/list/route.js
import { supabase } from '@/lib/supabase';
import { verifyAdminPermissions } from '@/utils/adminAuth';

export async function GET(request) {
  try {
    // Skip auth for testing
    console.log('Testing mode - skipping authentication');

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status') || 'pending';

    console.log(`Fetching suppliers with status filter: ${statusFilter}`);

    // Get suppliers with auth_user_id (indicating they've registered through your system)
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select(`
        id,
        business_name,
        data,
        auth_user_id,
        created_at,
        updated_at
      `)
      .not('auth_user_id', 'is', null)  // Only get suppliers who have registered
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Found ${suppliers.length} suppliers with auth_user_id`);

    // Process suppliers to extract verification data
    const processedSuppliers = suppliers
      .map(supplier => {
        const data = supplier.data || {};
        const verification = data.verification || {};
        const documents = verification.documents || {};

        // Check if this supplier has any verification documents
        const hasVerificationDocuments = Object.keys(documents).length > 0;
        
        // Check if they're entertainment/performer related
        const isEntertainer = 
          data.serviceType === 'Entertainment' ||
          data.category === 'Entertainment' ||
          data.type === 'entertainment' ||
          data.services?.some(s => s.category === 'Entertainment') ||
          supplier.business_name?.toLowerCase().includes('entertainment') ||
          supplier.business_name?.toLowerCase().includes('performer') ||
          supplier.business_name?.toLowerCase().includes('magician') ||
          supplier.business_name?.toLowerCase().includes('clown') ||
          supplier.business_name?.toLowerCase().includes('party') ||
          data.description?.toLowerCase().includes('entertainment') ||
          hasVerificationDocuments; // If they've uploaded verification docs, they're likely entertainers

        if (!isEntertainer) {
          return null; // Filter out non-entertainers
        }

        // Determine verification status
        let verificationStatus = 'not_started';
        let hasSubmittedDocs = false;
        let pendingDocsCount = 0;
        let approvedDocsCount = 0;
        let rejectedDocsCount = 0;

        Object.entries(documents).forEach(([docType, docData]) => {
          if (docData.status === 'submitted') {
            hasSubmittedDocs = true;
            pendingDocsCount++;
          } else if (docData.status === 'approved') {
            approvedDocsCount++;
          } else if (docData.status === 'rejected') {
            rejectedDocsCount++;
          }
        });

        // Override with explicit verification status if available
        if (verification.status) {
          verificationStatus = verification.status;
        } else if (rejectedDocsCount > 0) {
          verificationStatus = 'rejected';
        } else if (pendingDocsCount > 0) {
          verificationStatus = 'pending';
        } else if (approvedDocsCount > 0) {
          verificationStatus = 'approved';
        } else if (hasVerificationDocuments) {
          verificationStatus = 'submitted';
        }

        return {
          id: supplier.id,
          name: supplier.business_name || data.businessName || data.name || 'Unnamed Business',
          owner: {
            name: data.owner?.name || data.contactName || data.ownerName || 'Unknown',
            email: data.owner?.email || data.email || data.contactEmail || 'No email',
            phone: data.owner?.phone || data.phone || data.contactPhone || 'No phone'
          },
          serviceType: data.serviceType || data.category || 'Entertainment',
          submittedAt: verification.submittedAt || 
                      verification.createdAt || 
                      Object.values(documents)[0]?.submittedAt ||
                      supplier.created_at,
          verification: {
            status: verificationStatus,
            documents: documents,
            hasDocuments: hasVerificationDocuments,
            pendingCount: pendingDocsCount,
            approvedCount: approvedDocsCount,
            rejectedCount: rejectedDocsCount,
            auditLog: verification.auditLog || []
          },
          rawVerificationData: verification // For debugging
        };
      })
      .filter(supplier => supplier !== null); // Remove filtered out suppliers

    console.log(`Processed ${processedSuppliers.length} entertainment suppliers`);

    // Apply status filter
    let filteredSuppliers = processedSuppliers;
    
    if (statusFilter !== 'all') {
      filteredSuppliers = processedSuppliers.filter(supplier => {
        switch (statusFilter) {
          case 'pending':
            return supplier.verification.status === 'pending' || 
                   supplier.verification.status === 'submitted' ||
                   supplier.verification.pendingCount > 0;
          case 'approved':
          case 'verified':
            return supplier.verification.status === 'approved' || 
                   supplier.verification.status === 'verified';
          case 'rejected':
            return supplier.verification.status === 'rejected' ||
                   supplier.verification.rejectedCount > 0;
          case 'not_started':
            return supplier.verification.status === 'not_started' ||
                   !supplier.verification.hasDocuments;
          default:
            return supplier.verification.status === statusFilter;
        }
      });
    }

    console.log(`After filtering for status '${statusFilter}': ${filteredSuppliers.length} suppliers`);

    // Sort by most recent activity
    filteredSuppliers.sort((a, b) => {
      const aDate = new Date(a.submittedAt);
      const bDate = new Date(b.submittedAt);
      return bDate - aDate;
    });

    return Response.json({ 
      success: true, 
      suppliers: filteredSuppliers,
      total: filteredSuppliers.length,
      debug: {
        totalFetched: suppliers.length,
        afterProcessing: processedSuppliers.length,
        afterFiltering: filteredSuppliers.length,
        statusFilter,
        sampleSupplier: filteredSuppliers[0] || null
      }
    });

  } catch (error) {
    console.error('Failed to fetch verifications:', error);
    return Response.json({ 
      error: 'Failed to fetch data', 
      details: error.message 
    }, { status: 500 });
  }
}

// Helper function to get detailed verification info
export async function POST(request) {
  try {
    const { action, supplierId } = await request.json();
    
    if (action === 'getDetails') {
      // Skip auth for testing
      console.log('Getting supplier details for testing');

      const { data: supplier, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single();

      if (error) throw error;

      return Response.json({ 
        success: true, 
        supplier: {
          ...supplier,
          verification: supplier.data?.verification || {},
          documents: supplier.data?.verification?.documents || {}
        }
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Failed to get supplier details:', error);
    return Response.json({ error: 'Failed to get details' }, { status: 500 });
  }
}