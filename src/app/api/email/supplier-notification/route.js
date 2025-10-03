import { ServerClient } from "postmark";

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

const supplierNotificationTemplate = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>🚨 URGENT: Paid Booking Awaiting Confirmation - PartySnap</title>
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
    padding: 20px 20px 10px 20px; text-align: center;
  }
  .logo {
    max-width: 150px; height: auto; margin: auto;
    display: block;
  }
  .urgent-banner {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    color: white;
    padding: 25px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .urgent-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shimmer 2s infinite;
  }
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  .cta-button {
    display: inline-block; background: #dc2626; color: white; padding: 18px 36px;
    border-radius: 25px; font-weight: bold; font-size: 18px; margin: 20px 0;
    box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4); transition: all 0.3s ease;
    text-align: center; text-decoration: none;
    border: 2px solid #dc2626;
  }
  .cta-button:hover {
    background: #b91c1c; box-shadow: 0 8px 25px rgba(185, 28, 28, 0.5);
    color: white; text-decoration: none;
    transform: translateY(-2px);
  }
  .price-highlight {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border: 2px solid #f59e0b;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    margin: 20px 0;
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
  }
  .time-warning {
    background: #fef2f2;
    border: 2px solid #fca5a5;
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
    .content, .steps, .highlight-box, .price-highlight {
      background: #2c2c2c !important;
    }
    h1, h3, .highlight-box h3, .step-content h4 {
      color: #ffffff !important;
    }
    p, .step-content p, .highlight-box p {
      color: #e0e0e0 !important;
    }
    a, .footer a, .social-links a {
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
  <div class="email-container" role="main" aria-label="Urgent supplier booking notification" style="background-color:#ffffff; color:#2F2F2F;">
    
    <div class="header">
      <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png" alt="PartySnap Logo" class="logo" />
    </div>

    <div class="urgent-banner">
      <h1 style="margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚨 URGENT BOOKING ALERT</h1>
      <p style="margin: 15px 0 0 0; font-size: 18px; font-weight: 600;">Customer has paid deposit - Confirm within 2 hours</p>
    </div>

    <div class="content" style="background-color:#FFFFFF; color:#2F2F2F; padding: 40px 30px;">
      <h2 style="color:#dc2626; font-size: 24px; margin-bottom: 20px; text-align: center;">💰 New Paid Booking: {{CHILD_NAME}}'s {{THEME}} Party</h2>
      
      <p style="color:#374151; font-size: 16px; line-height: 1.6;">Hi {{SUPPLIER_NAME}},</p>
      
      <p style="color:#374151; font-size: 16px; line-height: 1.6;">
        <strong>{{CUSTOMER_NAME}}</strong> has just paid a <strong>£{{DEPOSIT_AMOUNT}} deposit</strong> for {{SERVICE_TYPE}} services at their child's party. 
        This booking is now <strong>priority status</strong> and requires immediate attention.
      </p>

      <div class="price-highlight">
        <h3 style="color:#92400e; margin: 0 0 10px 0; font-size: 18px;">💰 Your Earnings</h3>
        <div style="font-size: 36px; font-weight: bold; color: #b45309; margin: 10px 0;">£{{SUPPLIER_EARNING}}</div>
        <p style="color: #a16207; margin: 0; font-size: 14px;">{{PAYMENT_TYPE}} payment secured</p>
      </div>

      <div class="time-warning">
        <div style="display: flex; align-items: start; gap: 15px;">
          <div style="width: 40px; height: 40px; background: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span style="color: white; font-size: 20px; font-weight: bold;">⏰</span>
          </div>
          <div>
            <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">TIME SENSITIVE: 2 Hour Response Window</h3>
            <p style="color: #7f1d1d; margin: 0; font-size: 14px; line-height: 1.5;">
              The customer believes their party is confirmed since they've paid. If you cannot fulfill this booking, 
              we'll immediately find a replacement supplier to maintain their trust.
            </p>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 35px 0;">
        <a href="{{DASHBOARD_LINK}}" class="cta-button" target="_blank" rel="noopener noreferrer">
          🎯 CONFIRM BOOKING NOW
        </a>
      </div>

      <div style="background-color:#f3f4f6; border-radius:12px; padding:25px; margin:25px 0;">
        <h3 style="text-align:center; font-weight:bold; font-size:18px; margin-bottom:20px; color:#2F2F2F;">📋 Booking Details:</h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px;">PARTY DATE</div>
            <div style="color: #1f2937; font-size: 16px; font-weight: bold;">{{PARTY_DATE}}</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px;">PARTY TIME</div>
            <div style="color: #1f2937; font-size: 16px; font-weight: bold;">{{PARTY_TIME}}</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px;">LOCATION</div>
            <div style="color: #1f2937; font-size: 14px; font-weight: bold;">{{PARTY_LOCATION}}</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px;">GUESTS</div>
            <div style="color: #1f2937; font-size: 16px; font-weight: bold;">{{GUEST_COUNT}} children</div>
          </div>
        </div>

        <div style="margin-top: 20px; background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <div style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">CUSTOMER CONTACT</div>
          <div style="color: #1f2937; font-size: 16px; font-weight: bold; margin-bottom: 5px;">{{CUSTOMER_NAME}}</div>
          <div style="color: #4b5563; font-size: 14px;">{{CUSTOMER_EMAIL}}</div>
          {{CUSTOMER_PHONE_SECTION}}
        </div>
      </div>

      <div style="background-color:#dcfce7; border-radius:12px; padding:20px; margin:25px 0; border: 1px solid #bbf7d0;">
        <h4 style="color:#15803d; margin-bottom: 15px; font-size: 16px; font-weight: bold;">✅ What This Means:</h4>
        <ul style="color:#166534; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
          <li style="margin-bottom: 8px;"><strong>Guaranteed booking:</strong> Customer has committed with real money</li>
          <li style="margin-bottom: 8px;"><strong>Priority treatment:</strong> This takes precedence over unpaid enquiries</li>
          <li style="margin-bottom: 8px;"><strong>{{PAYMENT_TYPE_DETAIL}}</strong></li>
          <li><strong>Immediate action required:</strong> Confirm or decline within 2 hours</li>
        </ul>
      </div>

      <div style="background-color:#fff1f2; border-radius:12px; padding:20px; margin:25px 0; border: 1px solid #fecaca;">
        <h4 style="color:#dc2626; margin-bottom: 10px; font-size: 16px; font-weight: bold;">⚠️ Can't Fulfill This Booking?</h4>
        <p style="color:#991b1b; margin: 0; font-size: 14px; line-height: 1.5;">
          No problem! Simply decline in your dashboard and we'll immediately find a replacement supplier. 
          The customer will never know - we handle all communication seamlessly.
        </p>
      </div>

      <div style="text-align: center; margin: 35px 0;">
        <a href="{{DASHBOARD_LINK}}" class="cta-button" target="_blank" rel="noopener noreferrer">
          📱 OPEN YOUR DASHBOARD
        </a>
        <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 12px;">
          Or copy this link: {{DASHBOARD_LINK}}
        </p>
      </div>

      <p style="text-align:center;font-style:italic;color:#707070; margin-top: 40px;">
        Time is money - and this customer is ready to pay!<br>
        <strong>The PartySnap Team</strong><br>
        Making parties profitable 💰
      </p>
    </div>

    <div class="footer" role="contentinfo" style="background-color:#2F2F2F;color:#FFFFFF;padding:25px;text-align:center;font-size:13px;">
      <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png" alt="PartySnap" class="footer-logo" style="max-width:100px;height:auto;margin-bottom:15px;opacity:0.9;" />
      <p style="margin: 10px 0;">PartySnap Ltd, 123 Party Street, London, UK</p>
      <p style="font-size:11px;opacity:0.8; margin: 5px 0;">
        You received this because you're a registered supplier with PartySnap.<br />
        <a href="#" style="color:#FC6B57;">Supplier Settings</a> | <a href="#" style="color:#FC6B57;">Contact Support</a>
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
      customerName,
      customerEmail,
      customerPhone,
      childName,
      theme,
      partyDate,
      partyTime,
      partyLocation,
      guestCount,
      serviceType,
      depositAmount,
      supplierEarning,
      paymentType, // 'deposit' or 'full_payment'
      dashboardLink = 'http://localhost:3000/suppliers/dashboard'
    } = await req.json();

    if (!supplierEmail || !supplierEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid supplier email' }), { status: 400 });
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid customer email' }), { status: 400 });
    }

    // Format the party date
    const formatDate = (dateString) => {
      if (!dateString) return "TBD"
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return "TBD"
        const day = date.getDate()
        const suffix = day >= 11 && day <= 13 ? "th" : 
          day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th"
        const month = date.toLocaleDateString("en-GB", { month: "long" })
        const year = date.getFullYear()
        return `${day}${suffix} ${month}, ${year}`
      } catch (error) {
        return "TBD"
      }
    }

    // Format the party time
    const formatTime = (timeString) => {
      if (!timeString) return "Time TBD"
      try {
        const [hours, minutes] = timeString.split(":")
        const timeObj = new Date()
        timeObj.setHours(Number.parseInt(hours), Number.parseInt(minutes))
        return timeObj.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      } catch (error) {
        return timeString || "Time TBD"
      }
    }

    // Get payment type details
    const paymentTypeDetail = paymentType === 'full_payment' 
      ? 'Full payment received: No remaining balance to collect'
      : `Deposit payment: Collect remaining balance (£${Math.round(supplierEarning - depositAmount)}) on party day`;

    // Build customer phone section
    const customerPhoneSection = customerPhone 
      ? `<div style="color: #4b5563; font-size: 14px; margin-top: 5px;">${customerPhone}</div>`
      : '';

    // Replace placeholders in template
    const populatedTemplate = supplierNotificationTemplate
      .replace(/{{SUPPLIER_NAME}}/g, supplierName || 'there')
      .replace(/{{CUSTOMER_NAME}}/g, customerName || 'Customer')
      .replace(/{{CUSTOMER_EMAIL}}/g, customerEmail)
      .replace(/{{CUSTOMER_PHONE_SECTION}}/g, customerPhoneSection)
      .replace(/{{CHILD_NAME}}/g, childName || 'Child')
      .replace(/{{THEME}}/g, theme || 'themed')
      .replace(/{{PARTY_DATE}}/g, formatDate(partyDate))
      .replace(/{{PARTY_TIME}}/g, formatTime(partyTime))
      .replace(/{{PARTY_LOCATION}}/g, partyLocation || 'Location TBD')
      .replace(/{{GUEST_COUNT}}/g, guestCount || '10-15')
      .replace(/{{SERVICE_TYPE}}/g, serviceType || 'party services')
      .replace(/{{DEPOSIT_AMOUNT}}/g, depositAmount || '0')
      .replace(/{{SUPPLIER_EARNING}}/g, supplierEarning || '0')
      .replace(/{{PAYMENT_TYPE}}/g, paymentType === 'full_payment' ? 'Full Payment' : 'Deposit')
      .replace(/{{PAYMENT_TYPE_DETAIL}}/g, paymentTypeDetail)
      .replace(/{{DASHBOARD_LINK}}/g, dashboardLink);

    // Create urgent subject line
    const subject = `🚨 URGENT: £${supplierEarning} Booking Confirmed - ${childName}'s ${theme} Party`;

    // Create plain text version
    const textBody = `URGENT: PAID BOOKING CONFIRMATION REQUIRED

Hi ${supplierName || 'there'},

${customerName || 'A customer'} has just paid £${depositAmount} deposit for ${serviceType || 'party services'} at ${childName || 'their child'}'s ${theme || 'themed'} party.

BOOKING DETAILS:
- Date: ${formatDate(partyDate)}
- Time: ${formatTime(partyTime)}
- Location: ${partyLocation || 'TBD'}
- Guests: ${guestCount || '10-15'} children
- Your earnings: £${supplierEarning}

ACTION REQUIRED: Confirm or decline within 2 hours
Dashboard: ${dashboardLink}

Customer contact: ${customerEmail}${customerPhone ? `\nPhone: ${customerPhone}` : ''}

If you cannot fulfill this booking, simply decline and we'll find a replacement immediately.

Best regards,
The PartySnap Team`;

    // Send email via Postmark
    await client.sendEmail({
      From: "bookings@partysnap.co.uk", // Different from address for supplier emails
      To: supplierEmail,
      Subject: subject,
      HtmlBody: populatedTemplate,
      TextBody: textBody,
      // Add high priority headers
      Headers: [
        {
          "Name": "X-Priority",
          "Value": "1"
        },
        {
          "Name": "X-MSMail-Priority", 
          "Value": "High"
        },
        {
          "Name": "Importance",
          "Value": "high"
        }
      ]
    });

    return new Response(JSON.stringify({ 
      message: `Urgent supplier notification sent to ${supplierEmail}`,
      supplierName,
      customerName,
      depositAmount
    }), { status: 200 });

  } catch (error) {
    console.error('Supplier Email Error:', error);
    let errorMsg = error.message || 'Unknown error';

    // Handle Postmark specific errors
    if (error.response && error.response.body && error.response.body.errors) {
      errorMsg = error.response.body.errors.map(e => e.message).join(', ');
    }

    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}