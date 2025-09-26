export async function GET(request) {
    try {
      console.log('Testing email system...');
      
      // Check environment variables
      console.log('Environment check:');
      console.log('- POSTMARK_API_TOKEN:', !!process.env.POSTMARK_API_TOKEN);
      console.log('- NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET');
      
      const testEmailData = {
        supplierEmail: 'londonwhiskyguy@gmail.com', // Your actual email for testing
        supplierName: 'Test Supplier Andy',
        businessName: 'Test Entertainment Business',
        serviceType: 'Entertainment',
        dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/suppliers/dashboard`,
        documentsApproved: ['dbs', 'identity', 'address']
      };
  
      console.log('Test email data:', testEmailData);
  
      const emailUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/email/verification-complete`;
      
      console.log('Sending test email to URL:', emailUrl);
      
      const response = await fetch(emailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEmailData)
      });
  
      console.log('Email response status:', response.status);
  
      const result = await response.json();
      console.log('Email response:', result);
      
      return Response.json({
        success: response.ok,
        status: response.status,
        result,
        testData: testEmailData,
        environment: {
          hasPostmarkToken: !!process.env.POSTMARK_API_TOKEN,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET'
        }
      });
  
    } catch (error) {
      console.error('Test email error:', error);
      return Response.json({ 
        error: error.message,
        stack: error.stack 
      }, { status: 500 });
    }
  }