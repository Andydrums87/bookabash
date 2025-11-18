import { ServerClient } from "postmark";
import { render } from '@react-email/render';
import SupplierNotification from '../../../../../emails/supplier-notification';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

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

    // Render the email using React Email
    const emailHtml = await render(
      <SupplierNotification
        supplierName={supplierName || 'there'}
        customerName={customerName || 'Customer'}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        childName={childName || 'Child'}
        theme={theme || 'themed'}
        partyDate={formatDate(partyDate)}
        partyTime={formatTime(partyTime)}
        partyLocation={partyLocation || 'Location TBD'}
        guestCount={guestCount || '10-15'}
        serviceType={serviceType || 'party services'}
        depositAmount={depositAmount || '0'}
        supplierEarning={supplierEarning || '0'}
        paymentType={paymentType || 'deposit'}
        dashboardLink={dashboardLink}
      />
    );

    // Create urgent subject line
    const subject = `🚨 URGENT: £${supplierEarning} Booking Confirmed - ${childName}'s ${theme} Party`;

    // Send email via Postmark
    await client.sendEmail({
      From: "bookings@partysnap.co.uk", // Different from address for supplier emails
      To: supplierEmail,
      Subject: subject,
      HtmlBody: emailHtml,
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