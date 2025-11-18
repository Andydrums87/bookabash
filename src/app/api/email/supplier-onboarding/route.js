import { ServerClient } from "postmark";
import { render } from '@react-email/render';
import SupplierOnboarding from '../../../../../emails/supplier-onboarding';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

const supplierOnboardingTemplate_OLD = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Welcome to PartySnap Business - Let's Get Started!</title>
<style>
  /* Reset and base styles */
  body, html {
    margin: 0; padding: 0; width: 100%; height: 100%; background: #f8f9fa;
    -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: #2F2F2F;
  }
  img {
    border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none;
    -ms-interpolation-mode: bicubic;
    max-width: 100%;
    display: block;
  }
  a {
    color: #FC6B57; text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  .email-container {
    max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px;
    overflow: hidden;
  }
  .header {
    padding: 30px 20px 20px 20px; text-align: center;
    background: linear-gradient(135deg, #FC6B57, #FF8A80);
  }
  .logo {
    max-width: 150px; height: auto; margin: auto;
    display: block;
  }
  .welcome-banner {
    background: linear-gradient(135deg, #FC6B57, #FF8A80);
    color: white;
    padding: 30px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .welcome-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shimmer 3s infinite;
  }
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  .cta-button {
    display: inline-block; background: #FC6B57; color: white; padding: 18px 36px;
    border-radius: 25px; font-weight: bold; font-size: 18px; margin: 20px 0;
    box-shadow: 0 6px 20px rgba(252, 107, 87, 0.4); transition: all 0.3s ease;
    text-align: center; text-decoration: none;
    border: 2px solid #FC6B57;
  }
  .cta-button:hover {
    background: #E55A4A; box-shadow: 0 8px 25px rgba(229, 90, 74, 0.5);
    color: white; text-decoration: none;
    transform: translateY(-2px);
  }
  .highlight-box {
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border: 2px solid #0284c7;
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 4px 15px rgba(2, 132, 199, 0.1);
  }
  .step-box {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin: 15px 0;
    border-left: 4px solid #FC6B57;
  }
  .verification-notice {
    background: #fefce8;
    border: 2px solid #facc15;
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
  }
  @media (prefers-color-scheme: dark) {
    body, html {
      background: #121212 !important;
      color: #e0e0e0 !important;
    }
    .email-container {
      background: #1e1e1e !important;
    }
    .content, .steps, .highlight-box, .step-box {
      background: #2c2c2c !important;
    }
    h1, h3, .highlight-box h3, .step-box h4 {
      color: #ffffff !important;
    }
    p, .step-box p, .highlight-box p {
      color: #e0e0e0 !important;
    }
    a, .footer a {
      color: #ff7f66 !important;
    }
    .footer {
      background: #121212 !important;
      color: #cfcfcf !important;
    }
  }
</style>
</head>
<body style="background-color:#f8f9fa; color:#2F2F2F;">
  <div class="email-container" role="main" aria-label="Supplier onboarding welcome email" style="background-color:#ffffff; color:#2F2F2F;">
    
    <div class="welcome-banner">
      <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png" alt="PartySnap Logo" class="logo" style="margin-bottom: 20px;" />
      <h1 style="margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Welcome to PartySnap Business!</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; font-weight: 500; opacity: 0.9;">{{BUSINESS_NAME}} is now part of the UK's leading party platform</p>
    </div>

    <div class="content" style="background-color:#FFFFFF; color:#2F2F2F; padding: 40px 30px;">
      <p style="color:#374151; font-size: 18px; line-height: 1.6; margin-bottom: 25px;">Hi {{SUPPLIER_NAME}},</p>
      
      <p style="color:#374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Congratulations! Your <strong>{{BUSINESS_NAME}}</strong> account has been successfully created. You're now ready to start connecting with families looking for amazing <strong>{{SERVICE_TYPE}}</strong> services across the UK.
      </p>

      {{VERIFICATION_SECTION}}

      <div class="highlight-box">
        <h3 style="color:#0369a1; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">What Happens Next?</h3>
        <p style="color:#075985; margin: 0; font-size: 15px; line-height: 1.6;">
          We'll review your profile within <strong>24 hours</strong> and get you live on our platform. In the meantime, 
          complete your setup to start receiving bookings as soon as we approve you.
        </p>
      </div>

      <h3 style="color:#374151; font-size: 22px; font-weight: bold; margin: 30px 0 20px 0;">Your Next Steps:</h3>

      <div class="step-box">
        <h4 style="color:#FC6B57; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">1. Complete Your Profile</h4>
        <p style="color:#4b5563; margin: 0; font-size: 15px; line-height: 1.5;">
          Add photos, detailed descriptions, and set your pricing. Profiles with photos get <strong>5x more bookings</strong>.
        </p>
      </div>

      <div class="step-box">
        <h4 style="color:#FC6B57; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">2. Set Your Availability</h4>
        <p style="color:#4b5563; margin: 0; font-size: 15px; line-height: 1.5;">
          Configure your calendar so customers can only book when you're free. Update it anytime from your dashboard.
        </p>
      </div>

      <div class="step-box">
        <h4 style="color:#FC6B57; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">3. Create Your Packages</h4>
        <p style="color:#4b5563; margin: 0; font-size: 15px; line-height: 1.5;">
          Set up different service packages with clear pricing. Customers love having options to choose from.
        </p>
      </div>

      <div style="text-align: center; margin: 35px 0;">
        <a href="{{DASHBOARD_LINK}}" class="cta-button" target="_blank" rel="noopener noreferrer">
          Complete Your Setup
        </a>
      </div>

      <div style="background-color:#f3f4f6; border-radius:12px; padding:25px; margin:25px 0;">
        <h3 style="text-align:center; font-weight:bold; font-size:18px; margin-bottom:20px; color:#2F2F2F;">Why PartySnap Works:</h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #FC6B57; margin-bottom: 5px;">10,000+</div>
            <div style="color: #6b7280; font-size: 14px; font-weight: 600;">Happy Families</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #FC6B57; margin-bottom: 5px;">4.9★</div>
            <div style="color: #6b7280; font-size: 14px; font-weight: 600;">Average Rating</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #FC6B57; margin-bottom: 5px;">500+</div>
            <div style="color: #6b7280; font-size: 14px; font-weight: 600;">Active Suppliers</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #FC6B57; margin-bottom: 5px;">5x</div>
            <div style="color: #6b7280; font-size: 14px; font-weight: 600;">More Bookings</div>
          </div>
        </div>
      </div>

      <div style="background-color:#dcfce7; border-radius:12px; padding:20px; margin:25px 0; border: 1px solid #bbf7d0;">
        <h4 style="color:#15803d; margin-bottom: 15px; font-size: 16px; font-weight: bold;">Getting Started Tips:</h4>
        <ul style="color:#166534; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li style="margin-bottom: 8px;"><strong>Upload high-quality photos:</strong> Showcasing your services in action</li>
          <li style="margin-bottom: 8px;"><strong>Write detailed descriptions:</strong> Help parents understand what makes you special</li>
          <li style="margin-bottom: 8px;"><strong>Set competitive pricing:</strong> Check similar suppliers in your area</li>
          <li><strong>Respond quickly:</strong> Fast responses lead to more bookings</li>
        </ul>
      </div>

      <div style="border-top: 2px solid #f3f4f6; padding-top: 30px; margin-top: 40px;">
        <h3 style="color:#374151; font-size: 18px; font-weight: bold; margin-bottom: 15px;">Need Help Getting Started?</h3>
        <p style="color:#6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
          Our support team is here to help you succeed. Contact us anytime:
        </p>
        <div style="margin: 20px 0;">
          <p style="color:#4b5563; font-size: 14px; margin: 5px 0;">
            <strong>Email:</strong> <a href="mailto:support@partysnap.uk" style="color: #FC6B57;">support@partysnap.uk</a>
          </p>
          <p style="color:#4b5563; font-size: 14px; margin: 5px 0;">
            <strong>Phone:</strong> <a href="tel:+441234567890" style="color: #FC6B57;">01234 567890</a>
          </p>
          <p style="color:#4b5563; font-size: 14px; margin: 5px 0;">
            <strong>Help Centre:</strong> <a href="https://help.partysnap.uk" style="color: #FC6B57;">help.partysnap.uk</a>
          </p>
        </div>
      </div>

      <div style="text-align: center; margin: 35px 0;">
        <a href="{{DASHBOARD_LINK}}" class="cta-button" target="_blank" rel="noopener noreferrer">
          Access Your Dashboard
        </a>
        <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 12px;">
          Or copy this link: {{DASHBOARD_LINK}}
        </p>
      </div>

      <p style="text-align:center;font-style:italic;color:#707070; margin-top: 40px; font-size: 16px;">
        Ready to create magical moments for families?<br>
        <strong>The PartySnap Team</strong><br>
        Let's make parties unforgettable! 🎉
      </p>
    </div>

    <div class="footer" role="contentinfo" style="background-color:#2F2F2F;color:#FFFFFF;padding:25px;text-align:center;font-size:13px;">
      <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png" alt="PartySnap" class="footer-logo" style="max-width:100px;height:auto;margin-bottom:15px;opacity:0.9;" />
      <p style="margin: 10px 0;">PartySnap Ltd, 123 Party Street, London, UK</p>
      <p style="font-size:11px;opacity:0.8; margin: 5px 0;">
        You received this because you created a PartySnap Business account.<br />
        <a href="#" style="color:#FC6B57;">Account Settings</a> | <a href="mailto:support@partysnap.uk" style="color:#FC6B57;">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>`;

export async function POST(req) {
  try {
    const { 
      supplierEmail,
      supplierName,
      businessName,
      serviceType,
      needsVerification = false,
      dashboardLink = 'https://partysnap.uk/suppliers/dashboard'
    } = await req.json();

    if (!supplierEmail || !supplierEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid supplier email' }), { status: 400 });
    }

    if (!supplierName || !businessName) {
      return new Response(JSON.stringify({ error: 'Missing required fields: supplierName, businessName' }), { status: 400 });
    }

    // Render the email using React Email
    const emailHtml = await render(
      <SupplierOnboarding
        supplierName={supplierName}
        businessName={businessName}
        serviceType={serviceType.toLowerCase()}
        needsVerification={needsVerification}
        supplierEmail={supplierEmail}
        dashboardLink={dashboardLink}
      />
    );

    // Create subject line
    const subject = `Welcome to PartySnap Business, ${supplierName}! Let's get ${businessName} started 🎉`;

    // Send email via Postmark
    await client.sendEmail({
      From: "hello@partysnap.co.uk",
      To: supplierEmail,
      Subject: subject,
      HtmlBody: emailHtml,
      // Tag for tracking
      Tag: "supplier-onboarding"
    });

    return new Response(JSON.stringify({ 
      message: `Onboarding email sent to ${supplierEmail}`,
      supplierName,
      businessName,
      serviceType
    }), { status: 200 });

  } catch (error) {
    console.error('Supplier Onboarding Email Error:', error);
    let errorMsg = error.message || 'Unknown error';

    // Handle Postmark specific errors
    if (error.response && error.response.body && error.response.body.errors) {
      errorMsg = error.response.body.errors.map(e => e.message).join(', ');
    }

    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}