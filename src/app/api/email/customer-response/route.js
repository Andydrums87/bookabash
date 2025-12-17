import { ServerClient } from "postmark";
import { render } from '@react-email/render';
import CustomerResponseAccepted from '../../../../../emails/customer-response-accepted';
import CustomerResponseDeclined from '../../../../../emails/customer-response-declined';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

export async function POST(req) {
  try {
    const {
      customerEmail,
      customerName,
      childName,
      theme,
      partyDate,
      supplierName,
      supplierEmail,
      supplierPhone,
      serviceType,
      supplierMessage,
      responseType, // 'accepted' or 'declined'
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
    const baseUrl = dashboardLink ? dashboardLink.replace('/dashboard', '') : 'https://partysnap.co.uk'
    const einvitesLink = `${baseUrl}/dashboard?tab=invites`
    const isVenue = serviceType?.toLowerCase()?.includes('venue')

    let emailHtml, subject;
    if (responseType === 'accepted') {
      emailHtml = await render(
        <CustomerResponseAccepted
          customerName={customerName || 'there'}
          supplierName={supplierName || 'your supplier'}
          supplierEmail={supplierEmail || 'supplier@example.com'}
          supplierPhone={supplierPhone || '01234567890'}
          childName={childName || 'your child'}
          theme={theme || 'themed'}
          partyDate={formatDate(partyDate)}
          serviceType={serviceType || 'party services'}
          supplierMessage={supplierMessage || 'Thank you for choosing our services!'}
          dashboardLink={dashboardLink || 'https://partysnap.co.uk/dashboard'}
          einvitesLink={einvitesLink}
        />
      );
      // Special subject for venue confirmations
      subject = isVenue
        ? `🎉 Great news! Your venue is confirmed for ${childName}'s party!`
        : `🎭 ${supplierName || 'Your supplier'} can't wait to meet you!`;
    } else {
      emailHtml = await render(
        <CustomerResponseDeclined
          customerName={customerName || 'there'}
          supplierName={supplierName || 'your supplier'}
          childName={childName || 'your child'}
          theme={theme || 'themed'}
          partyDate={formatDate(partyDate)}
          serviceType={serviceType || 'party services'}
          supplierMessage={supplierMessage || 'Thank you for your interest in our services.'}
          dashboardLink={dashboardLink || 'https://partysnap.co.uk/dashboard'}
        />
      );
      subject = `📅 Booking Update for ${childName || 'Your Child'}'s Party`;
    }

    // Send email via Postmark
    await client.sendEmail({
      From: "hello@partysnap.co.uk",
      To: customerEmail,
      Subject: subject,
      HtmlBody: emailHtml,
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