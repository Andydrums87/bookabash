import { ServerClient } from "postmark";
import { render } from '@react-email/render';
import CustomerDispatchNotification from '../../../../emails/customer-dispatch-notification';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

export async function POST(req) {
  try {
    const {
      customerEmail,
      customerName,
      childName,
      partyDate,
      cakeName,
      trackingUrl,
      courierName,
      cakeCustomization
    } = await req.json();

    if (!customerEmail || !customerEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid customer email' }), { status: 400 });
    }

    // Render the email using React Email
    const emailHtml = await render(
      <CustomerDispatchNotification
        customerName={customerName || 'there'}
        childName={childName || 'your child'}
        cakeName={cakeName || 'Your cake'}
        partyDate={partyDate}
        trackingUrl={trackingUrl}
        courierName={courierName}
        cakeCustomization={cakeCustomization || {}}
      />
    );

    // Create exciting subject line
    const subject = `🎂 Your cake is on its way! - ${childName}'s party`;

    // Send email via Postmark
    await client.sendEmail({
      From: "bookings@partysnap.co.uk",
      To: customerEmail,
      Subject: subject,
      HtmlBody: emailHtml,
    });

    console.log('✅ Customer dispatch notification sent to:', customerEmail);

    return new Response(JSON.stringify({
      success: true,
      message: `Dispatch notification sent to ${customerEmail}`,
      customerEmail
    }), { status: 200 });

  } catch (error) {
    console.error('Customer Dispatch Email Error:', error);
    let errorMsg = error.message || 'Unknown error';

    // Handle Postmark specific errors
    if (error.response && error.response.body && error.response.body.errors) {
      errorMsg = error.response.body.errors.map(e => e.message).join(', ');
    }

    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
