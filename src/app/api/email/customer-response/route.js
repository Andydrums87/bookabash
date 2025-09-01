import { ServerClient } from "postmark";

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

const acceptedEmailTemplate = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Party Booking Confirmed - BookABash</title>
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
  .success-banner {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 20px;
    text-align: center;
  }
  .price-highlight {
    background: #f0fdf4;
    border: 2px solid #22c55e;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
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
    .content, .steps, .highlight-box, .price-highlight {
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
  <div class="email-container" role="main" aria-label="Party booking confirmation email" style="background-color:#ffffff; color:#2F2F2F;">
    <div class="header">
      <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755787342/iajcwwtirjnd0spfkley.png" alt="BookABash Logo" class="logo" />
    </div>

    <div class="success-banner">
      <h2 style="margin: 0; font-size: 24px; font-weight: bold;">🎉 Your Party is Confirmed!</h2>
      <p style="margin: 10px 0 0 0; font-size: 16px;">{{SUPPLIER_NAME}} has accepted your booking</p>
    </div>

    <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683368/bg9f9i7jqo16c5ojwxzj.jpg" alt="Celebration scene with party decorations" class="hero-image" />

    <div class="content" style="background-color:#FFFFFF; color:#2F2F2F; padding: 40px 30px;">
      <h1 style="color:#2F2F2F;">Great News, {{CUSTOMER_NAME}}!</h1>
      <p style="color:#707070;">{{SUPPLIER_NAME}} has confirmed they can provide {{SERVICE_TYPE}} for {{CHILD_NAME}}'s {{THEME}} party on {{PARTY_DATE}}.</p>

      <div class="price-highlight">
        <h3 style="color:#22c55e; margin: 0; font-size: 18px;">Final Price Confirmed</h3>
        <div style="font-size: 36px; font-weight: bold; color: #16a34a; margin: 10px 0;">£{{FINAL_PRICE}}</div>
        <p style="color: #15803d; margin: 0; font-size: 14px;">{{PRICE_STATUS}}</p>
      </div>

      <div style="background-color:#FFF8F7; border-radius:12px; padding:25px; margin:25px 0; border-left: 4px solid #FC6B57;">
        <h3 style="color:#FC6B57; margin-bottom: 15px;">📨 Message from {{SUPPLIER_NAME}}:</h3>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #fecaca;">
          <p style="color:#374151; font-style: italic; margin: 0;">{{SUPPLIER_MESSAGE}}</p>
        </div>
      </div>

      <div style="background-color:#f3f4f6; border-radius:12px; padding:25px; margin:25px 0;">
        <h3 style="text-align:center; font-weight:bold; font-size:18px; margin-bottom:20px; color:#2F2F2F;">🎪 What Happens Next:</h3>

        <div style="display:flex; align-items:flex-start; margin-bottom:15px;">
          <div style="background:#10b981;color:white;width:28px;height:28px;border-radius:50%;font-weight:bold;font-size:12px;margin-right:12px;display:flex;justify-content:center;align-items:center;flex-shrink:0;">1</div>
          <div>
            <h4 style="margin:0 0 5px 0;color:#2F2F2F; font-size: 14px;">Party Details Finalized</h4>
            <p style="margin:0;color:#707070; font-size: 13px;">Your supplier will contact you 2-3 days before the party to confirm final details.</p>
          </div>
        </div>

        <div style="display:flex; align-items:flex-start; margin-bottom:15px;">
          <div style="background:#10b981;color:white;width:28px;height:28px;border-radius:50%;font-weight:bold;font-size:12px;margin-right:12px;display:flex;justify-content:center;align-items:center;flex-shrink:0;">2</div>
          <div>
            <h4 style="margin:0 0 5px 0;color:#2F2F2F; font-size: 14px;">Payment Processing</h4>
            <p style="margin:0;color:#707070; font-size: 13px;">{{PAYMENT_INFO}}</p>
          </div>
        </div>

        <div style="display:flex; align-items:flex-start;">
          <div style="background:#10b981;color:white;width:28px;height:28px;border-radius:50%;font-weight:bold;font-size:12px;margin-right:12px;display:flex;justify-content:center;align-items:center;flex-shrink:0;">3</div>
          <div>
            <h4 style="margin:0 0 5px 0;color:#2F2F2F; font-size: 14px;">Party Day Magic</h4>
            <p style="margin:0;color:#707070; font-size: 13px;">Sit back and enjoy {{CHILD_NAME}}'s special day - everything is taken care of!</p>
          </div>
        </div>
      </div>

      <div style="text-align:center; margin: 30px 0;">
        <a href="{{DASHBOARD_LINK}}" class="cta-button" target="_blank" rel="noopener noreferrer" style="background-color:#FC6B57;color:white;">
          📱 View Your Booking Details
        </a>
      </div>

      <div style="background-color:#e0f2fe; border-radius:12px; padding:20px; margin:25px 0;">
        <h4 style="color:#0277bd; margin-bottom: 10px;">💬 Need to Contact Your Supplier?</h4>
        <p style="color:#01579b; margin: 0; font-size: 14px;">
          You can message {{SUPPLIER_NAME}} directly through your BookABash dashboard or reply to this email.
          Need help? Call us at <strong>0800 123 4567</strong>.
        </p>
      </div>

      <p style="text-align:center;font-style:italic;color:#707070;">
        Best regards,<br>
        <strong>The BookABash Team</strong><br>
        Making party planning magical ✨
      </p>
    </div>

    <div class="footer" role="contentinfo" style="background-color:#2F2F2F;color:#FFFFFF;padding:30px;text-align:center;font-size:14px;">
      <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png" alt="BookABash" class="footer-logo" style="max-width:120px;height:auto;margin-bottom:20px;opacity:0.9;" />
      <div class="social-links" role="list">
        <a href="#" role="listitem" style="color:#FC6B57;">📘 Facebook</a>
        <a href="#" role="listitem" style="color:#FC6B57;">🐦 Twitter</a>
        <a href="#" role="listitem" style="color:#FC6B57;">📸 Instagram</a>
        <a href="#" role="listitem" style="color:#FC6B57;">💼 LinkedIn</a>
      </div>
      <p>BookABash Ltd, 123 Party Street, London, UK</p>
      <p style="font-size:12px;opacity:0.8;">
        You received this email because you booked a party through BookABash.<br />
        <a href="#" style="color:#FC6B57;">Unsubscribe</a> | <a href="#" style="color:#FC6B57;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>`;

const declinedEmailTemplate = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Booking Update - BookABash</title>
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
  .update-banner {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    padding: 20px;
    text-align: center;
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
  <div class="email-container" role="main" aria-label="Booking update email" style="background-color:#ffffff; color:#2F2F2F;">
    <div class="header">
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-darker-BtzC12IP4PmQu4X05qoZrrl5eFlqov.png" alt="BookABash Logo" class="logo" />
    </div>

    <div class="update-banner">
      <h2 style="margin: 0; font-size: 24px; font-weight: bold;">📅 Booking Update</h2>
      <p style="margin: 10px 0 0 0; font-size: 16px;">We're finding you the perfect alternative</p>
    </div>

    <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1748527076/ChatGPT_Image_May_29_2025_02_57_49_PM_ttmzsw.png" alt="Party planning scene" class="hero-image" />

    <div class="content" style="background-color:#FFFFFF; color:#2F2F2F; padding: 40px 30px;">
      <h1 style="color:#2F2F2F;">Hi {{CUSTOMER_NAME}},</h1>
      <p style="color:#707070;">We have an update about your {{SERVICE_TYPE}} booking for {{CHILD_NAME}}'s {{THEME}} party on {{PARTY_DATE}}.</p>
      
      <p style="color:#707070;">Unfortunately, {{SUPPLIER_NAME}} is not available for your requested date. However, <strong>don't worry</strong> - we're already working to find you an excellent alternative supplier!</p>

      <div style="background-color:#fff7ed; border-radius:12px; padding:25px; margin:25px 0; border-left: 4px solid #f59e0b;">
        <h3 style="color:#f59e0b; margin-bottom: 15px;">📨 Message from {{SUPPLIER_NAME}}:</h3>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #fed7aa;">
          <p style="color:#374151; font-style: italic; margin: 0;">{{SUPPLIER_MESSAGE}}</p>
        </div>
      </div>

      <div style="background-color:#f3f4f6; border-radius:12px; padding:25px; margin:25px 0;">
        <h3 style="text-align:center; font-weight:bold; font-size:18px; margin-bottom:20px; color:#2F2F2F;">🔄 What We're Doing Next:</h3>

        <div style="display:flex; align-items:flex-start; margin-bottom:15px;">
          <div style="background:#FC6B57;color:white;width:28px;height:28px;border-radius:50%;font-weight:bold;font-size:12px;margin-right:12px;display:flex;justify-content:center;align-items:center;flex-shrink:0;">1</div>
          <div>
            <h4 style="margin:0 0 5px 0;color:#2F2F2F; font-size: 14px;">Finding Alternative Suppliers</h4>
            <p style="margin:0;color:#707070; font-size: 13px;">We're contacting other qualified {{SERVICE_TYPE}} suppliers in your area right now.</p>
          </div>
        </div>

        <div style="display:flex; align-items:flex-start; margin-bottom:15px;">
          <div style="background:#FC6B57;color:white;width:28px;height:28px;border-radius:50%;font-weight:bold;font-size:12px;margin-right:12px;display:flex;justify-content:center;align-items:center;flex-shrink:0;">2</div>
          <div>
            <h4 style="margin:0 0 5px 0;color:#2F2F2F; font-size: 14px;">Same Great Service</h4>
            <p style="margin:0;color:#707070; font-size: 13px;">Your new supplier will provide the same {{SERVICE_TYPE}} at the same price point.</p>
          </div>
        </div>

        <div style="display:flex; align-items:flex-start;">
          <div style="background:#FC6B57;color:white;width:28px;height:28px;border-radius:50%;font-weight:bold;font-size:12px;margin-right:12px;display:flex;justify-content:center;align-items:center;flex-shrink:0;">3</div>
          <div>
            <h4 style="margin:0 0 5px 0;color:#2F2F2F; font-size: 14px;">Quick Confirmation</h4>
            <p style="margin:0;color:#707070; font-size: 13px;">We'll email you within 24 hours with your new supplier's details and confirmation.</p>
          </div>
        </div>
      </div>

      <div style="text-align:center; margin: 30px 0;">
        <a href="{{DASHBOARD_LINK}}" class="cta-button" target="_blank" rel="noopener noreferrer" style="background-color:#FC6B57;color:white;">
          📱 View Booking Status
        </a>
      </div>

      <div style="background-color:#dbeafe; border-radius:12px; padding:20px; margin:25px 0;">
        <h4 style="color:#1d4ed8; margin-bottom: 10px;">💬 Questions or Concerns?</h4>
        <p style="color:#1e3a8a; margin: 0; font-size: 14px;">
          Our team is here to help! Call us at <strong>0800 123 4567</strong> or reply to this email.
          We're committed to making {{CHILD_NAME}}'s party absolutely magical.
        </p>
      </div>

      <p style="text-align:center;font-style:italic;color:#707070;">
        Best regards,<br>
        <strong>The BookABash Team</strong><br>
        Making party planning magical ✨
      </p>
    </div>

    <div class="footer" role="contentinfo" style="background-color:#2F2F2F;color:#FFFFFF;padding:30px;text-align:center;font-size:14px;">
      <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png" alt="BookABash" class="footer-logo" style="max-width:120px;height:auto;margin-bottom:20px;opacity:0.9;" />
      <div class="social-links" role="list">
        <a href="#" role="listitem" style="color:#FC6B57;">📘 Facebook</a>
        <a href="#" role="listitem" style="color:#FC6B57;">🐦 Twitter</a>
        <a href="#" role="listitem" style="color:#FC6B57;">📸 Instagram</a>
        <a href="#" role="listitem" style="color:#FC6B57;">💼 LinkedIn</a>
      </div>
      <p>PartySnap Ltd, 123 Party Street, London, UK</p>
      <p style="font-size:12px;opacity:0.8;">
        You received this email because you booked a party through PartSnap.<br />
        <a href="#" style="color:#FC6B57;">Unsubscribe</a> | <a href="#" style="color:#FC6B57;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>`;

export async function POST(req) {
  try {
    const { 
      customerEmail, 
      customerName, 
      childName, 
      theme, 
      partyDate, 
      supplierName, 
      serviceType, 
      supplierMessage, 
      responseType, // 'accepted' or 'declined'
      finalPrice,
      originalPrice,
      isPaid, // whether customer has already paid
      dashboardLink 
    } = await req.json();

    if (!customerEmail || !customerEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid customer email' }), { status: 400 });
    }

    if (!responseType || !['accepted', 'declined'].includes(responseType)) {
      return new Response(JSON.stringify({ error: 'Invalid response type' }), { status: 400 });
    }

    // Format the party date
    const formatDate = (dateString) => {
      if (!dateString) return "your party date"
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return "your party date"
        const day = date.getDate()
        const suffix = day >= 11 && day <= 13 ? "th" : 
          day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th"
        const month = date.toLocaleDateString("en-GB", { month: "long" })
        const year = date.getFullYear()
        return `${day}${suffix} ${month}, ${year}`
      } catch (error) {
        return "your party date"
      }
    }

    // Choose template and subject based on response type
    let template, subject;
    if (responseType === 'accepted') {
      template = acceptedEmailTemplate;
      subject = `🎉 Great News! Your ${theme || ''} Party is Confirmed`;
    } else {
      template = declinedEmailTemplate;
      subject = `📅 Booking Update for ${childName || 'Your Child'}'s Party`;
    }

    // Replace placeholders in template
    const populatedTemplate = template
      .replace(/{{CUSTOMER_NAME}}/g, customerName || 'there')
      .replace(/{{CHILD_NAME}}/g, childName || 'your child')
      .replace(/{{THEME}}/g, theme || 'themed')
      .replace(/{{PARTY_DATE}}/g, formatDate(partyDate))
      .replace(/{{SUPPLIER_NAME}}/g, supplierName || 'your supplier')
      .replace(/{{SERVICE_TYPE}}/g, serviceType || 'party services')
      .replace(/{{SUPPLIER_MESSAGE}}/g, supplierMessage || 'Thank you for choosing our services!')
      .replace(/{{FINAL_PRICE}}/g, finalPrice || originalPrice || '0')
      .replace(/{{PRICE_STATUS}}/g, 
        finalPrice && finalPrice !== originalPrice 
          ? `Updated from original quote of £${originalPrice}`
          : 'As originally quoted'
      )
      .replace(/{{PAYMENT_INFO}}/g, 
        isPaid 
          ? 'Your payment has been processed. No further payment required.'
          : `We'll send you payment details once everything is confirmed.`
      )
      .replace(/{{DASHBOARD_LINK}}/g, dashboardLink || 'https://bookabash.com/dashboard');

    // Create plain text version
    const textBody = responseType === 'accepted' 
      ? `Hi ${customerName || 'there'}!\n\nGreat news! ${supplierName || 'Your supplier'} has confirmed they can provide ${serviceType || 'party services'} for ${childName || 'your child'}'s ${theme || 'themed'} party on ${formatDate(partyDate)}.\n\nFinal Price: £${finalPrice || originalPrice || '0'}\n\nMessage from ${supplierName}: "${supplierMessage}"\n\nWe'll be in touch with final details closer to your party date.\n\nBest regards,\nThe BookABash Team`
      : `Hi ${customerName || 'there'},\n\nWe have an update about your ${serviceType || 'party services'} booking for ${childName || 'your child'}'s ${theme || 'themed'} party on ${formatDate(partyDate)}.\n\nUnfortunately, ${supplierName || 'the supplier'} is not available for your requested date. Don't worry - we're finding you an excellent alternative!\n\nMessage from ${supplierName}: "${supplierMessage}"\n\nWe'll email you within 24 hours with your new supplier details.\n\nBest regards,\nThe BookABash Team`;

    // Send email via Postmark
    await client.sendEmail({
      From: "hello@partysnap.uk",
      To: customerEmail,
      Subject: subject,
      HtmlBody: populatedTemplate,
      TextBody: textBody,
    });

    return new Response(JSON.stringify({ 
      message: `Customer notification email sent successfully`,
      responseType: responseType 
    }), { status: 200 });

  } catch (error) {
    console.error('Email Error:', error);
    let errorMsg = error.message || 'Unknown error';

    // Handle Postmark specific errors
    if (error.response && error.response.body && error.response.body.errors) {
      errorMsg = error.response.body.errors.map(e => e.message).join(', ');
    }

    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}