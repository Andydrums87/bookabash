import { ServerClient } from "postmark";
import { render } from '@react-email/render';
import BookingConfirmedAllSuppliers from '../../../../../emails/booking-confirmed-all-suppliers';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

export async function POST(req) {
  try {
    const {
      customerEmail,
      customerName,
      childName,
      theme,
      partyDate,
      partyTime,
      venue,
      services, // Changed from suppliers - category-focused
      totalValue,
      dashboardLink,
    } = await req.json();

    if (!customerEmail || !customerEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid customer email' }), { status: 400 });
    }

    if (!services || services.length === 0) {
      return new Response(JSON.stringify({ error: 'No services provided' }), { status: 400 });
    }

    // Format the party date
    const formatDate = (dateString) => {
      if (!dateString) return "your party date";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "your party date";
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
      } catch (error) {
        return "your party date";
      }
    };

    // Format time for display
    const formatTime = (timeString) => {
      if (!timeString) return 'TBC';
      try {
        // Handle HH:MM:SS format
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'pm' : 'am';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes}${ampm}`;
      } catch {
        return timeString;
      }
    };

    const baseUrl = dashboardLink ? dashboardLink.replace('/dashboard', '') : 'https://partysnap.co.uk';
    const einvitesLink = `${baseUrl}/dashboard?tab=invites`;

    const emailHtml = await render(
      <BookingConfirmedAllSuppliers
        customerName={customerName || 'there'}
        childName={childName || 'your child'}
        theme={theme || 'themed'}
        partyDate={formatDate(partyDate)}
        partyTime={formatTime(partyTime)}
        venue={venue}
        services={services}
        totalValue={totalValue || 0}
        dashboardLink={dashboardLink || 'https://partysnap.co.uk/dashboard'}
        einvitesLink={einvitesLink}
      />
    );

    // Friendly subject line - no mention of "suppliers"
    const subject = `🎉 You're all set! ${childName}'s ${theme} party is fully booked`;

    // Send email via Postmark
    await client.sendEmail({
      From: "hello@partysnap.co.uk",
      To: customerEmail,
      Subject: subject,
      HtmlBody: emailHtml,
    });

    console.log(`✅ Booking confirmation email sent to ${customerEmail} for ${services.length} services`);

    return new Response(JSON.stringify({
      message: 'Booking confirmation email sent successfully',
      serviceCount: services.length,
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
