// api/emails/verification-complete/route.js
import { ServerClient } from "postmark";
import { render } from '@react-email/render';
import VerificationComplete from '../../../../../emails/verification-complete';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

const verificationCompleteTemplate_OLD = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Verification Complete - You're Now Live on PartySnap!</title>
<style>
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
  .success-banner {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 40px 30px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .success-banner::before {
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
  .success-icon {
    width: 80px;
    height: 80px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 40px;
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
  .verified-badge {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 15px 25px;
    border-radius: 25px;
    display: inline-block;
    font-weight: bold;
    font-size: 16px;
    margin: 20px 0;
  }
  .next-steps {
    background: #f0f9ff;
    border: 2px solid #0284c7;
    border-radius: 12px;
    padding: 25px;
    margin: 25px 0;
  }
  .step-item {
    display: flex;
    align-items: start;
    gap: 15px;
    margin-bottom: 20px;
  }
  .step-number {
    width: 32px;
    height: 32px;
    background: #FC6B57;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    flex-shrink: 0;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    background: #f9fafb;
    padding: 25px;
    border-radius: 12px;
    margin: 25px 0;
  }
  .stat-item {
    text-align: center;
  }
  .stat-number {
    font-size: 32px;
    font-weight: bold;
    color: #FC6B57;
    margin-bottom: 5px;
  }
  .stat-label {
    color: #6b7280;
    font-size: 14px;
    font-weight: 600;
  }
  @media (prefers-color-scheme: dark) {
    body, html {
      background: #121212 !important;
      color: #e0e0e0 !important;
    }
    .email-container {
      background: #1e1e1e !important;
    }
    .content, .next-steps, .stats-grid {
      background: #2c2c2c !important;
    }
    h1, h2, h3 {
      color: #ffffff !important;
    }
    p {
      color: #e0e0e0 !important;
    }
    a {
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
  <div class="email-container" role="main" style="background-color:#ffffff; color:#2F2F2F;">
    
    <div class="success-banner">
      <div class="success-icon">✓</div>
      <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Verification Complete!</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">{{BUSINESS_NAME}} is now live on PartySnap</p>
      <div class="verified-badge">
        🛡️ Verified Supplier
      </div>
    </div>

    <div class="content" style="background-color:#FFFFFF; color:#2F2F2F; padding: 40px 30px;">
      <p style="color:#374151; font-size: 18px; line-height: 1.6; margin-bottom: 25px;">Hi {{SUPPLIER_NAME}},</p>
      
      <p style="color:#374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        Fantastic news! All your verification documents have been approved and <strong>{{BUSINESS_NAME}}</strong> is now officially verified and live on the PartySnap platform.
      </p>

      <div style="background-color:#dcfce7; border-radius:12px; padding:25px; margin:25px 0; border: 2px solid #10b981;">
        <h3 style="color:#065f46; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">🎉 What This Means for You:</h3>
        <ul style="color:#064e3b; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.8;">
          <li style="margin-bottom: 8px;"><strong>Higher search rankings:</strong> Verified suppliers appear first in results</li>
          <li style="margin-bottom: 8px;"><strong>Trust badge:</strong> Customers see your verified status</li>
          <li style="margin-bottom: 8px;"><strong>Premium features:</strong> Access to advanced booking tools</li>
          <li><strong>More bookings:</strong> Verified suppliers get 3x more enquiries</li>
        </ul>
      </div>

      <div class="next-steps">
        <h3 style="color:#0369a1; margin: 0 0 20px 0; font-size: 22px; font-weight: bold;">Now Let's Get You Booked:</h3>
        
        <div class="step-item">
          <div class="step-number">1</div>
          <div>
            <h4 style="color:#374151; margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">Complete Your Profile</h4>
            <p style="color:#6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
              Add high-quality photos and detailed service descriptions. Complete profiles get 5x more views.
            </p>
          </div>
        </div>

        <div class="step-item">
          <div class="step-number">2</div>
          <div>
            <h4 style="color:#374151; margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">Set Your Availability</h4>
            <p style="color:#6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
              Update your calendar so customers can see when you're free to book.
            </p>
          </div>
        </div>

        <div class="step-item">
          <div class="step-number">3</div>
          <div>
            <h4 style="color:#374151; margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">Create Service Packages</h4>
            <p style="color:#6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
              Offer different packages at various price points to attract more customers.
            </p>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 35px 0;">
        <a href="{{DASHBOARD_LINK}}" class="cta-button" target="_blank" rel="noopener noreferrer">
          Access Your Dashboard
        </a>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">3x</div>
          <div class="stat-label">More Enquiries</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">85%</div>
          <div class="stat-label">Book Within 7 Days</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">4.9★</div>
          <div class="stat-label">Average Rating</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">24hr</div>
          <div class="stat-label">Avg Response Time</div>
        </div>
      </div>

      <div style="background-color:#fef3c7; border-radius:12px; padding:25px; margin:25px 0; border: 2px solid #f59e0b;">
        <h3 style="color:#92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">💡 Pro Tips to Get More Bookings:</h3>
        <ul style="color:#78350f; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li style="margin-bottom: 8px;"><strong>Respond quickly:</strong> Reply to enquiries within 1 hour for best results</li>
          <li style="margin-bottom: 8px;"><strong>Keep prices competitive:</strong> Check similar suppliers in your area</li>
          <li style="margin-bottom: 8px;"><strong>Show your personality:</strong> Parents love to know who they're booking</li>
          <li><strong>Ask for reviews:</strong> Great reviews lead to more bookings</li>
        </ul>
      </div>

      <div style="border-top: 2px solid #f3f4f6; padding-top: 30px; margin-top: 40px;">
        <h3 style="color:#374151; font-size: 18px; font-weight: bold; margin-bottom: 15px;">Need Help Getting Started?</h3>
        <p style="color:#6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
          Our success team is here to help you get your first booking:
        </p>
        <div style="margin: 20px 0;">
          <p style="color:#4b5563; font-size: 14px; margin: 5px 0;">
            <strong>Email:</strong> <a href="mailto:success@partysnap.uk" style="color: #FC6B57;">success@partysnap.uk</a>
          </p>
          <p style="color:#4b5563; font-size: 14px; margin: 5px 0;">
            <strong>Phone:</strong> <a href="tel:+441234567890" style="color: #FC6B57;">01234 567890</a>
          </p>
          <p style="color:#4b5563; font-size: 14px; margin: 5px 0;">
            <strong>Help Centre:</strong> <a href="https://help.partysnap.uk" style="color: #FC6B57;">help.partysnap.uk</a>
          </p>
        </div>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="{{DASHBOARD_LINK}}" class="cta-button" target="_blank" rel="noopener noreferrer">
          Start Getting Bookings
        </a>
        <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 12px;">
          Your verified supplier dashboard: {{DASHBOARD_LINK}}
        </p>
      </div>

      <p style="text-align:center;font-style:italic;color:#707070; margin-top: 40px; font-size: 16px;">
        Welcome to the PartySnap family!<br>
        <strong>The PartySnap Team</strong><br>
        Let's create magical moments together 🎉
      </p>
    </div>

    <div class="footer" role="contentinfo" style="background-color:#2F2F2F;color:#FFFFFF;padding:25px;text-align:center;font-size:13px;">
      <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png" alt="PartySnap" style="max-width:100px;height:auto;margin-bottom:15px;opacity:0.9;" />
      <p style="margin: 10px 0;">PartySnap Ltd, 123 Party Street, London, UK</p>
      <p style="font-size:11px;opacity:0.8; margin: 5px 0;">
        You received this because your supplier verification was completed.<br />
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
      serviceType = 'entertainment',
      dashboardLink = 'https://partysnap.co.uk/suppliers/dashboard',
      documentsApproved = []
    } = await req.json();

    if (!supplierEmail || !supplierEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid supplier email' }), { status: 400 });
    }

    if (!supplierName || !businessName) {
      return new Response(JSON.stringify({ error: 'Missing required fields: supplierName, businessName' }), { status: 400 });
    }

    console.log('Sending verification complete email to:', supplierEmail);

    // Render the email using React Email
    const emailHtml = await render(
      <VerificationComplete
        supplierName={supplierName}
        businessName={businessName}
        serviceType={serviceType.toLowerCase()}
        dashboardLink={dashboardLink}
      />
    );

    // Create subject line
    const subject = `🎉 Verification Complete! ${businessName} is now live on PartySnap`;

    // Send email via Postmark
    await client.sendEmail({
      From: "hello@partysnap.co.uk",
      To: supplierEmail,
      Subject: subject,
      HtmlBody: emailHtml,
      Tag: "verification-complete"
    });

    console.log('Verification complete email sent successfully');

    return new Response(JSON.stringify({ 
      message: `Verification complete email sent to ${supplierEmail}`,
      supplierName,
      businessName,
      serviceType,
      documentsApproved
    }), { status: 200 });

  } catch (error) {
    console.error('Verification Complete Email Error:', error);
    let errorMsg = error.message || 'Unknown error';

    if (error.response && error.response.body && error.response.body.errors) {
      errorMsg = error.response.body.errors.map(e => e.message).join(', ');
    }

    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}