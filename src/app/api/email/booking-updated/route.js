import { ServerClient } from "postmark";
import { render } from '@react-email/render';
import BookingUpdated from '../../../../../emails/booking-updated';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

export async function POST(req) {
  try {
    const {
      supplierEmail,
      supplierName,
      customerName,
      childName,
      theme,
      partyDate,
      changes,
      dashboardLink = 'https://partysnap.co.uk/suppliers/dashboard',
    } = await req.json();

    // Validate required fields
    if (!supplierEmail || !supplierEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid supplier email' }), { status: 400 });
    }

    if (!changes || changes.length === 0) {
      return new Response(JSON.stringify({ error: 'No changes to notify about' }), { status: 400 });
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

    // Render the email using React Email
    const emailHtml = await render(
      <BookingUpdated
        supplierName={supplierName || 'there'}
        customerName={customerName || 'Customer'}
        childName={childName || 'Child'}
        theme={theme || 'themed'}
        partyDate={formatDate(partyDate)}
        changes={changes}
        dashboardLink={dashboardLink}
      />
    );

    // Create subject line - make it clear this is NOT a new booking
    const subject = `⚠️ BOOKING MODIFIED - ${childName}'s Party (Action Required)`;

    // Send email via Postmark
    await client.sendEmail({
      From: "bookings@partysnap.co.uk",
      To: supplierEmail,
      Subject: subject,
      HtmlBody: emailHtml,
    });

    return new Response(JSON.stringify({
      message: `Booking update notification sent to ${supplierEmail}`,
      supplierName,
      customerName,
      changesCount: changes.length
    }), { status: 200 });

  } catch (error) {
    console.error('Booking Update Email Error:', error);
    let errorMsg = error.message || 'Unknown error';

    // Handle Postmark specific errors
    if (error.response && error.response.body && error.response.body.errors) {
      errorMsg = error.response.body.errors.map(e => e.message).join(', ');
    }

    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
