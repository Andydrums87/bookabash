import { ServerClient } from "postmark";

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

// Professional receipt-style email template (no PDF needed)
const professionalReceiptTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Receipt #{{RECEIPT_NUMBER}} - BookABash</title>
<style>
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; 
    margin: 0; padding: 20px; background: #f8f9fa; color: #333; line-height: 1.6; 
  }
  .receipt-container { 
    max-width: 600px; margin: 0 auto; background: white; 
    border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  .receipt-header { 
    background: linear-gradient(135deg, #10b981, #059669); 
    color: white; padding: 30px; text-align: center; 
  }
  .receipt-header h1 { 
    margin: 0; font-size: 28px; font-weight: bold; 
  }
  .receipt-header p { 
    margin: 10px 0 5px 0; opacity: 0.9; 
  }
  .receipt-info { 
    background: #f8f9fa; padding: 20px; border-bottom: 1px solid #e5e7eb; 
  }
  .receipt-info-grid { 
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px; 
  }
  .company-info, .receipt-details { 
    font-size: 14px; 
  }
  .company-info h3, .receipt-details h3 { 
    margin: 0 0 10px 0; font-size: 16px; color: #374151; 
  }
  .company-info p, .receipt-details p { 
    margin: 3px 0; color: #6b7280; 
  }
  .status-badge { 
    background: #dcfce7; color: #166534; padding: 4px 12px; 
    border-radius: 20px; font-size: 12px; font-weight: 600; 
    display: inline-block; margin-top: 10px;
  }
  .party-details { 
    padding: 20px; background: #f0f9ff; border-left: 4px solid #3b82f6; 
    margin: 20px; border-radius: 6px;
  }
  .party-details h3 { 
    margin: 0 0 15px 0; color: #1e40af; 
  }
  .party-grid { 
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
    gap: 15px; font-size: 14px; 
  }
  .party-grid div { 
    color: #374151; 
  }
  .party-grid strong { 
    color: #1f2937; 
  }
  .services-section { 
    padding: 20px; 
  }
  .services-section h3 { 
    margin: 0 0 20px 0; color: #374151; 
  }
  .services-table { 
    width: 100%; border-collapse: collapse; 
  }
  .services-table th { 
    background: #f9fafb; padding: 12px 8px; text-align: left; 
    font-size: 12px; font-weight: 600; color: #374151; 
    border-bottom: 2px solid #e5e7eb; text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .services-table td { 
    padding: 12px 8px; font-size: 14px; 
    border-bottom: 1px solid #f3f4f6; 
  }
  .services-table tr:nth-child(even) { 
    background: #fafafa; 
  }
  .services-table .amount { 
    text-align: right; font-weight: 600; 
  }
  .payment-type { 
    background: #e0f2fe; color: #0369a1; padding: 2px 6px; 
    border-radius: 12px; font-size: 11px; font-weight: 500;
  }
  .payment-type.full { 
    background: #dcfce7; color: #166534; 
  }
  .totals-section { 
    padding: 20px; background: #f9fafb; border-top: 2px solid #e5e7eb; 
  }
  .total-row { 
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 0; font-size: 14px; 
  }
  .total-row.subtotal { 
    color: #6b7280; 
  }
  .total-row.final { 
    border-top: 2px solid #e5e7eb; margin-top: 15px; 
    padding-top: 15px; font-weight: bold; font-size: 18px; 
    color: #10b981;
  }
  .payment-info { 
    padding: 20px; background: #f0f9ff; 
  }
  .payment-info h3 { 
    margin: 0 0 15px 0; color: #1e40af; 
  }
  .payment-grid { 
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
    gap: 15px; font-size: 14px; 
  }
  .remaining-balance { 
    padding: 20px; background: #fff7ed; border: 1px solid #fed7aa; 
    margin: 20px; border-radius: 6px; border-left: 4px solid #f59e0b;
  }
  .remaining-balance h3 { 
    margin: 0 0 10px 0; color: #92400e; 
  }
  .remaining-balance p { 
    margin: 0; color: #78350f; 
  }
  .fully-paid { 
    padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; 
    margin: 20px; border-radius: 6px; border-left: 4px solid #22c55e;
  }
  .fully-paid h3 { 
    margin: 0 0 10px 0; color: #166534; 
  }
  .fully-paid p { 
    margin: 0; color: #15803d; 
  }
  .next-steps { 
    padding: 20px; 
  }
  .next-steps h3 { 
    margin: 0 0 15px 0; color: #374151; 
  }
  .next-steps ul { 
    margin: 0; padding-left: 20px; 
  }
  .next-steps li { 
    margin-bottom: 8px; color: #6b7280; 
  }
  .cta-section { 
    padding: 20px; text-align: center; background: #f9fafb; 
  }
  .cta-button { 
    background: #FC6B57; color: white; padding: 15px 30px; 
    border-radius: 8px; text-decoration: none; display: inline-block; 
    font-weight: 600; transition: background-color 0.2s;
  }
  .cta-button:hover { 
    background: #e55c48; 
  }
  .footer { 
    padding: 20px; background: #374151; color: #d1d5db; 
    text-align: center; font-size: 12px; 
  }
  .footer p { 
    margin: 5px 0; 
  }
  .footer strong { 
    color: #f9fafb; 
  }
  
  @media (max-width: 600px) {
    body { padding: 10px; }
    .receipt-info-grid, .party-grid, .payment-grid { 
      grid-template-columns: 1fr; 
    }
    .services-table th, .services-table td { 
      padding: 8px 4px; font-size: 12px; 
    }
  }
</style>
</head>
<body>
  <div class="receipt-container">
    <!-- Receipt Header -->
    <div class="receipt-header">
      <h1>Payment Receipt</h1>
      <p>Receipt #{{RECEIPT_NUMBER}}</p>
      <span class="status-badge">PAID</span>
    </div>

    <!-- Receipt Info -->
    <div class="receipt-info">
      <div class="receipt-info-grid">
        <div class="company-info">
          <h3>BookABash Ltd</h3>
          <p>123 Party Street</p>
          <p>London, UK</p>
          <p>hello@bookabash.com</p>
          <p>0800 123 4567</p>
          <p>VAT: GB123456789</p>
        </div>
        <div class="receipt-details">
          <h3>Receipt Details</h3>
          <p><strong>Date:</strong> {{PAYMENT_DATE}}</p>
          <p><strong>Payment ID:</strong> {{PAYMENT_INTENT_SHORT}}</p>
          <p><strong>Method:</strong> {{PAYMENT_METHOD}}</p>
          <p><strong>Customer:</strong> {{CUSTOMER_NAME}}</p>
          <p><strong>Email:</strong> {{CUSTOMER_EMAIL}}</p>
        </div>
      </div>
    </div>

    <!-- Party Details -->
    <div class="party-details">
      <h3>Party Information</h3>
      <div class="party-grid">
        <div><strong>Child:</strong> {{CHILD_NAME}} (Age {{CHILD_AGE}})</div>
        <div><strong>Theme:</strong> {{THEME}}</div>
        <div><strong>Date:</strong> {{PARTY_DATE}}</div>
        <div><strong>Time:</strong> {{PARTY_TIME}}</div>
        <div><strong>Location:</strong> {{LOCATION}}</div>
        <div><strong>Guests:</strong> {{GUEST_COUNT}}</div>
      </div>
    </div>

    <!-- Services -->
    <div class="services-section">
      <h3>Services Booked</h3>
      <table class="services-table">
        <thead>
          <tr>
            <th>Service Provider</th>
            <th>Category</th>
            <th>Payment Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {{SERVICES_ROWS}}
        </tbody>
      </table>
    </div>

    <!-- Payment Totals -->
    <div class="totals-section">
      {{ADDONS_ROWS}}
      <div class="total-row final">
        <span>Total Paid Today:</span>
        <span>£{{TOTAL_PAID_TODAY}}</span>
      </div>
    </div>

    <!-- Remaining Balance or Fully Paid -->
    {{BALANCE_SECTION}}

    <!-- Payment Information -->
    <div class="payment-info">
      <h3>Payment Information</h3>
      <div class="payment-grid">
        <div><strong>Transaction ID:</strong> {{PAYMENT_INTENT_ID}}</div>
        <div><strong>Payment Method:</strong> {{PAYMENT_METHOD}}</div>
        <div><strong>Status:</strong> Successfully Processed</div>
        <div><strong>Date:</strong> {{PAYMENT_DATE}} {{PAYMENT_TIME}}</div>
      </div>
    </div>

    <!-- Next Steps -->
    <div class="next-steps">
      <h3>What Happens Next</h3>
      <ul>
        <li>Your suppliers will contact you within 24 hours to introduce themselves</li>
        <li>Final party details will be confirmed 2-3 days before the event</li>
        <li>You can manage your booking and contact suppliers through your dashboard</li>
        <li>Enjoy {{CHILD_NAME}}'s amazing celebration!</li>
      </ul>
    </div>

    <!-- CTA Button -->
    <div class="cta-section">
      <a href="{{DASHBOARD_LINK}}" class="cta-button">View Your Booking Dashboard</a>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Thank you for choosing BookABash!</strong></p>
      <p>Questions? Reply to this email or call 0800 123 4567</p>
      <p>This email serves as your official payment receipt and booking confirmation.</p>
      <p>BookABash Ltd • Registered in England & Wales • Company No: 12345678</p>
    </div>
  </div>
</body>
</html>`;

export async function POST(req) {
  try {
    const requestData = await req.json();
    
    // Generate receipt data
    const receiptNumber = requestData.paymentIntentId.substring(3).toUpperCase();
    const paymentDate = new Date().toLocaleDateString('en-GB');
    const paymentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const paymentIntentShort = requestData.paymentIntentId.substring(requestData.paymentIntentId.length - 8);
    
    // Generate services table rows
    const servicesRows = (requestData.services || []).map(service => `
      <tr>
        <td><strong>${service.name}</strong></td>
        <td style="text-transform: capitalize;">${service.category}</td>
        <td>
          <span class="payment-type ${service.paymentType === 'full_payment' ? 'full' : ''}">
            ${service.paymentType === 'full_payment' ? 'Full Payment' : 'Deposit'}
          </span>
        </td>
        <td class="amount">£${service.amountPaid}</td>
      </tr>
    `).join('');
    
    // Generate addons rows (if any)
    const addonsRows = (requestData.addons && requestData.addons.length > 0) ? 
      requestData.addons.map(addon => `
        <div class="total-row subtotal">
          <span>${addon.name}</span>
          <span>£${addon.price}</span>
        </div>
      `).join('') : '';
    
    // Generate balance section
    const balanceSection = requestData.remainingBalance > 0 ? `
      <div class="remaining-balance">
        <h3>Remaining Balance</h3>
        <p><strong>£${requestData.remainingBalance}</strong> is due on party day and will be paid directly to your service suppliers. This covers the remaining balance for services that only required a deposit today.</p>
      </div>
    ` : `
      <div class="fully-paid">
        <h3>Fully Paid</h3>
        <p>Your party is completely paid for! All suppliers have been paid in full, so you can relax and enjoy the celebration.</p>
      </div>
    `;

    // Populate the template
    const emailHtml = professionalReceiptTemplate
      .replace(/{{RECEIPT_NUMBER}}/g, receiptNumber)
      .replace(/{{PAYMENT_DATE}}/g, paymentDate)
      .replace(/{{PAYMENT_TIME}}/g, paymentTime)
      .replace(/{{PAYMENT_INTENT_ID}}/g, requestData.paymentIntentId)
      .replace(/{{PAYMENT_INTENT_SHORT}}/g, paymentIntentShort)
      .replace(/{{PAYMENT_METHOD}}/g, requestData.paymentMethod || 'Card')
      .replace(/{{CUSTOMER_NAME}}/g, requestData.customerName || 'Customer')
      .replace(/{{CUSTOMER_EMAIL}}/g, requestData.customerEmail)
      .replace(/{{CHILD_NAME}}/g, requestData.childName || 'Child')
      .replace(/{{CHILD_AGE}}/g, requestData.childAge || '5')
      .replace(/{{THEME}}/g, requestData.theme || 'Party Theme')
      .replace(/{{PARTY_DATE}}/g, requestData.partyDate || 'Party Date')
      .replace(/{{PARTY_TIME}}/g, requestData.partyTime || '14:00')
      .replace(/{{LOCATION}}/g, requestData.location || 'Party Location')
      .replace(/{{GUEST_COUNT}}/g, requestData.guestCount || '10-15')
      .replace(/{{SERVICES_ROWS}}/g, servicesRows)
      .replace(/{{ADDONS_ROWS}}/g, addonsRows)
      .replace(/{{TOTAL_PAID_TODAY}}/g, requestData.totalPaidToday || '0')
      .replace(/{{BALANCE_SECTION}}/g, balanceSection)
      .replace(/{{DASHBOARD_LINK}}/g, requestData.dashboardLink || 'https://partysnap.co.uk/dashboard');

    // Send email (no PDF attachment needed)
    await client.sendEmail({
      From: "hello@partysnap.uk",
      To: requestData.customerEmail,
      Subject: `Receipt #${receiptNumber} - Payment Confirmed`,
      HtmlBody: emailHtml,
    });

    return new Response(JSON.stringify({ 
      message: 'Professional receipt email sent successfully',
      receiptId: receiptNumber 
    }), { status: 200 });

  } catch (error) {
    console.error('Receipt Email Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}