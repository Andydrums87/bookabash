import { ServerClient } from "postmark";
import { render } from '@react-email/render';
import BookingUpgradeReceipt from '../../../../../emails/booking-upgrade-receipt';
import BookingRefundConfirmation from '../../../../../emails/booking-refund-confirmation';
import BookingUpdatedCustomer from '../../../../../emails/booking-updated-customer';

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
      supplierType,
      previousTotal,
      newTotal,
      amountPaid, // For upgrades (positive)
      refundAmount, // For refunds (positive)
      changes,
      type, // 'upgrade', 'refund', or 'update'
      dashboardLink = 'https://partysnap.co.uk/dashboard',
    } = await req.json();

    // Validate required fields
    if (!customerEmail || !customerEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid customer email' }), { status: 400 });
    }

    if (!type || !['upgrade', 'refund', 'update'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid type: must be "upgrade", "refund", or "update"' }), { status: 400 });
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

    let emailHtml;
    let subject;

    if (type === 'upgrade') {
      // Render upgrade receipt email
      emailHtml = await render(
        <BookingUpgradeReceipt
          customerName={customerName || 'there'}
          childName={childName || 'Child'}
          theme={theme || 'themed'}
          partyDate={formatDate(partyDate)}
          supplierName={supplierName || 'Supplier'}
          supplierType={supplierType || 'service'}
          previousTotal={previousTotal || 0}
          newTotal={newTotal || 0}
          amountPaid={amountPaid || 0}
          changes={changes || []}
          dashboardLink={dashboardLink}
        />
      );
      subject = `Payment Received - Booking Updated for ${childName}'s Party`;
    } else if (type === 'refund') {
      // Render refund confirmation email
      emailHtml = await render(
        <BookingRefundConfirmation
          customerName={customerName || 'there'}
          childName={childName || 'Child'}
          theme={theme || 'themed'}
          partyDate={formatDate(partyDate)}
          supplierName={supplierName || 'Supplier'}
          supplierType={supplierType || 'service'}
          previousTotal={previousTotal || 0}
          newTotal={newTotal || 0}
          refundAmount={refundAmount || 0}
          changes={changes || []}
          dashboardLink={dashboardLink}
        />
      );
      subject = `Refund Processed - Booking Updated for ${childName}'s Party`;
    } else {
      // Render general booking update email (no price change)
      emailHtml = await render(
        <BookingUpdatedCustomer
          customerName={customerName || 'there'}
          childName={childName || 'Child'}
          theme={theme || 'themed'}
          partyDate={formatDate(partyDate)}
          supplierName={supplierName || 'Supplier'}
          supplierType={supplierType || 'service'}
          changes={changes || []}
          dashboardLink={dashboardLink}
        />
      );
      subject = `Booking Updated for ${childName}'s Party`;
    }

    // Send email via Postmark
    await client.sendEmail({
      From: "bookings@partysnap.co.uk",
      To: customerEmail,
      Subject: subject,
      HtmlBody: emailHtml,
    });

    console.log(`✅ Customer ${type} email sent to ${customerEmail}`);

    return new Response(JSON.stringify({
      message: `Booking ${type} confirmation sent to ${customerEmail}`,
      customerName,
      type,
      amount: type === 'upgrade' ? amountPaid : refundAmount
    }), { status: 200 });

  } catch (error) {
    console.error('Customer Booking Update Email Error:', error);
    let errorMsg = error.message || 'Unknown error';

    // Handle Postmark specific errors
    if (error.response && error.response.body && error.response.body.errors) {
      errorMsg = error.response.body.errors.map(e => e.message).join(', ');
    }

    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
