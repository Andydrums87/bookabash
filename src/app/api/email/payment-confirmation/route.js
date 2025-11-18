import { ServerClient } from "postmark";
import { render } from '@react-email/render';
import PaymentConfirmation from '../../../../../emails/payment-confirmation';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

export async function POST(req) {
  try {
    const requestData = await req.json();

    console.log('📧 Payment confirmation email request:', {
      customerEmail: requestData.customerEmail,
      services: requestData.services,
      addons: requestData.addons
    });

    // Generate receipt data
    const receiptNumber = requestData.paymentIntentId.substring(3).toUpperCase();
    const paymentDate = new Date().toLocaleDateString('en-GB');
    const paymentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const paymentIntentShort = requestData.paymentIntentId.substring(requestData.paymentIntentId.length - 8);

    // Render the email using React Email
    const emailHtml = await render(
      <PaymentConfirmation
        receiptNumber={receiptNumber}
        paymentDate={paymentDate}
        paymentTime={paymentTime}
        paymentIntentId={requestData.paymentIntentId}
        paymentIntentShort={paymentIntentShort}
        paymentMethod={requestData.paymentMethod || 'Card'}
        customerName={requestData.customerName || 'Customer'}
        customerEmail={requestData.customerEmail}
        childName={requestData.childName || 'Child'}
        childAge={requestData.childAge || '5'}
        theme={requestData.theme || 'Party Theme'}
        partyDate={requestData.partyDate || 'Party Date'}
        partyTime={requestData.partyTime || '14:00'}
        location={requestData.location || 'Party Location'}
        guestCount={requestData.guestCount || '10-15'}
        services={requestData.services || []}
        addons={requestData.addons || []}
        totalPaidToday={requestData.totalPaidToday || '0'}
        remainingBalance={requestData.remainingBalance || 0}
        dashboardLink={requestData.dashboardLink || 'https://partysnap.co.uk/dashboard'}
      />
    );

    if (!emailHtml || typeof emailHtml !== 'string') {
      console.error('❌ Email HTML render failed:', typeof emailHtml, emailHtml);
      throw new Error('Failed to render email HTML');
    }

    console.log('✅ Email HTML rendered successfully, length:', emailHtml.length);

    // Send email
    await client.sendEmail({
      From: "hello@partysnap.co.uk",
      To: requestData.customerEmail,
      Subject: `Receipt #${receiptNumber} - Payment Confirmed`,
      HtmlBody: emailHtml,
    });

    console.log('✅ Email sent successfully to:', requestData.customerEmail);

    return new Response(JSON.stringify({
      message: 'Professional receipt email sent successfully',
      receiptId: receiptNumber
    }), { status: 200 });

  } catch (error) {
    console.error('Receipt Email Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}