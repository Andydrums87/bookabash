import { ServerClient } from "postmark";

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

const emailTemplate = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Welcome to BookABash - Supplier Confirmation</title>
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
    padding: 30px 20px; text-align: center;
  }
  .logo {
    max-width: 200px; height: auto; margin: auto;
    display: block;
  }
  .hero-image {
    width: 100%; height: auto;
  }
  .cta-button {
    display: inline-block; background: #FC6B57; color: white; padding: 16px 32px;
    border-radius: 25px; font-weight: bold; font-size: 16px; margin: 20px 0;
    box-shadow: 0 4px 15px rgba(252, 107, 87, 0.3); transition: all 0.3s ease;
    text-align: center;
  }
  .cta-button:hover {
    background: #e55c48; box-shadow: 0 8px 25px rgba(229, 92, 72, 0.4);
  }
  @media (prefers-color-scheme: dark) {
    body, html {
      background: #121212 !important;
      color: #e0e0e0 !important;
    }
    .email-container {
      background: #1e1e1e !important;
    }
    .content, .steps, .highlight-box {
      background: #2c2c2c !important;
    }
    h1, h3, .highlight-box h3, .step-content h4 {
      color: #ffffff !important;
    }
    p, .step-content p, .highlight-box p {
      color: #e0e0e0 !important;
    }
    a, .cta-button, .footer a, .social-links a {
      color: #ff7f66 !important;
    }
    .cta-button {
      background: #ff7f66 !important;
      color: #ffffff !important;
    }
    .footer {
      background: #121212 !important;
      color: #cfcfcf !important;
    }
  }
</style>
</head>
<body style="background-color:#f8f9fa; color:#2F2F2F;">
  <div class="email-container" role="main" aria-label="Welcome email for BookABash supplier" style="background-color:#ffffff; color:#2F2F2F;">
    <div class="header">
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-darker-BtzC12IP4PmQu4X05qoZrrl5eFlqov.png" alt="BookABash Logo" class="logo" />
    </div>

    <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1748527076/ChatGPT_Image_May_29_2025_02_57_49_PM_ttmzsw.png" alt="Party scene with balloons and decorations" class="hero-image" />

    <div class="content" style="background-color:#FFFFFF; color:#2F2F2F; padding: 40px 30px;">
      <h1 style="color:#2F2F2F;">🎉 Congratulations! You're In!</h1>
      <p style="color:#707070;">You've successfully secured your spot as one of our first 100 suppliers and qualified for <strong>3 months commission-free</strong> access to our platform.</p>
      <p style="color:#707070;">We're excited to help you connect with thousands of parents looking for exactly what you offer and grow your party services business.</p>
      <a href="#" class="cta-button" target="_blank" rel="noopener noreferrer" style="background-color:#FC6B57;color:white;">🎯 Complete Your Profile →</a>

      <div class="steps" role="list" aria-label="Next steps for suppliers" style="background-color:#FFF8F7;color:#2F2F2F; border-radius:12px; padding:30px; margin:30px 0;">
        <h3 style="text-align:center; font-weight:bold; font-size:20px; margin-bottom:25px; color:#2F2F2F;">🎪 Your Next Steps:</h3>

        <div class="step" role="listitem" style="display:flex; align-items:flex-start; margin-bottom:20px;">
          <div class="step-number" style="background:#FC6B57;color:white;width:30px;height:30px;border-radius:50%;font-weight:bold;font-size:14px;margin-right:15px;display:flex;justify-content:center;align-items:center;box-shadow:0 2px 8px rgba(252,107,87,0.3);flex-shrink:0;">1</div>
          <div class="step-content">
            <h4 style="margin:0 0 5px 0;color:#2F2F2F;">Complete Your Business Profile</h4>
            <p style="margin:0;color:#707070;">Add your services, photos, pricing, and availability to attract customers.</p>
          </div>
        </div>

        <div class="step" role="listitem" style="display:flex; align-items:flex-start; margin-bottom:20px;">
          <div class="step-number" style="background:#FC6B57;color:white;width:30px;height:30px;border-radius:50%;font-weight:bold;font-size:14px;margin-right:15px;display:flex;justify-content:center;align-items:center;box-shadow:0 2px 8px rgba(252,107,87,0.3);flex-shrink:0;">2</div>
          <div class="step-content">
            <h4 style="margin:0 0 5px 0;color:#2F2F2F;">Verify Your Business</h4>
            <p style="margin:0;color:#707070;">Upload your insurance documents and business registration for trust and credibility.</p>
          </div>
        </div>

        <div class="step" role="listitem" style="display:flex; align-items:flex-start;">
          <div class="step-number" style="background:#FC6B57;color:white;width:30px;height:30px;border-radius:50%;font-weight:bold;font-size:14px;margin-right:15px;display:flex;justify-content:center;align-items:center;box-shadow:0 2px 8px rgba(252,107,87,0.3);flex-shrink:0;">3</div>
          <div class="step-content">
            <h4 style="margin:0 0 5px 0;color:#2F2F2F;">Go Live &amp; Start Booking</h4>
            <p style="margin:0;color:#707070;">Once approved, your profile goes live and you can start receiving bookings immediately.</p>
          </div>
        </div>
      </div>

      <div class="highlight-box" role="region" aria-label="Commission free period" style="background-color:#FFF8F7;color:#2F2F2F;border-left:4px solid #FC6B57;padding:20px;margin:25px 0;border-radius:0 8px 8px 0;">
        <h3 style="color:#FC6B57;">🎯 Your Commission-Free Period</h3>
        <p style="margin:0;">As one of our first 100 suppliers, you'll enjoy <strong>zero commission fees</strong> for your first 3 months. After that, our standard rate is just 8% - one of the lowest in the industry.</p>
      </div>

      <p style="color:#707070;">Our team will review your application within 24 hours and send you login details to access your supplier dashboard.</p>
      <p style="color:#707070;">Have questions? Simply reply to this email or call us at <strong style="color:#FC6B57;">0800 123 4567</strong>. We're here to help you succeed!</p>

      <div style="text-align:center;">
        <a href="#" class="cta-button" target="_blank" rel="noopener noreferrer" style="background-color:#FC6B57;color:white;">📞 Schedule a Call with Our Team</a>
      </div>

      <p style="text-align:center;font-style:italic;color:#707070;">
        Best regards,<br>
        <strong>The BookABash Team</strong><br>
        Making party planning magical ✨
      </p>
    </div>

    <div class="footer" role="contentinfo" style="background-color:#2F2F2F;color:#FFFFFF;padding:30px;text-align:center;font-size:14px;">
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-darker-BtzC12IP4PmQu4X05qoZrrl5eFlqov.png" alt="BookABash" class="footer-logo" style="max-width:120px;height:auto;margin-bottom:20px;opacity:0.9;" />
      <div class="social-links" role="list">
        <a href="#" role="listitem" style="color:#FC6B57;">📘 Facebook</a>
        <a href="#" role="listitem" style="color:#FC6B57;">🐦 Twitter</a>
        <a href="#" role="listitem" style="color:#FC6B57;">📸 Instagram</a>
        <a href="#" role="listitem" style="color:#FC6B57;">💼 LinkedIn</a>
      </div>
      <p>BookABash Ltd, 123 Party Street, London, UK</p>
      <p style="font-size:12px;opacity:0.8;">
        You received this email because you signed up as a supplier on BookABash.<br />
        <a href="#" style="color:#FC6B57;">Unsubscribe</a> | <a href="#" style="color:#FC6B57;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>

`

export async function POST(req) {
  try {
    const { email, name } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
    }

    // 1. Save to Google Sheets via your Apps Script webhook
    const sheetRes = await fetch(
      'https://script.google.com/macros/s/AKfycbwaX89Ref6DmyXA9Hr4-JlrKjmOaKDz_jMTbWEv7oJFtQGaw8ivYMoQrzKq90e0zQZ2/exec',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );

    if (!sheetRes.ok) {
      throw new Error('Failed to save email to Google Sheets');
    }

       // Send confirmation email
       await client.sendEmail({
        From: "hello@bookabash.com",
        To: email,
    
        Subject: "Thanks for signing up to BookABash!",
        HtmlBody: emailTemplate,
        TextBody: "Plain text fallback here",
      });

    return new Response(JSON.stringify({ message: 'Email saved and confirmation sent' }), { status: 200 });
  } catch (error) {
    console.error('Postmark Error:', error);
    let errorMsg = error.message || 'Unknown error';

    // If SendGrid returns a response with body, include that:
    if (error.response && error.response.body && error.response.body.errors) {
      errorMsg = error.response.body.errors.map(e => e.message).join(', ');
    }
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
