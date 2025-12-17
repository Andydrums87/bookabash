import { ServerClient } from "postmark";
import { render } from '@react-email/render';
import SupplierInvoice from '../../../../../emails/supplier-invoice';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

export async function POST(req) {
  try {
    const {
      supplierEmail,
      supplierName,
      invoiceNumber,
      invoiceDate,
      childName,
      partyDate,
      partyTime,
      serviceCategory,
      grossAmount,
      platformFee,
      netAmount,
      invoiceId
    } = await req.json();

    if (!supplierEmail || !supplierEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid supplier email' }), { status: 400 });
    }

    if (!invoiceNumber) {
      return new Response(JSON.stringify({ error: 'Invoice number is required' }), { status: 400 });
    }

    // Format date helper
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
        const day = date.getDate();
        const suffix = day >= 11 && day <= 13 ? "th" :
          day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th";
        const month = date.toLocaleDateString("en-GB", { month: "long" });
        const year = date.getFullYear();
        return `${day}${suffix} ${month}, ${year}`;
      } catch (error) {
        return "N/A";
      }
    };

    // Format currency
    const formatCurrency = (amount) => {
      const num = parseFloat(amount);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    // Build approve link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partysnap.co.uk';
    const approveLink = `${baseUrl}/suppliers/invoices`;

    // Render the email template
    const emailHtml = await render(
      <SupplierInvoice
        invoiceNumber={invoiceNumber}
        invoiceDate={formatDate(invoiceDate || new Date())}
        supplierName={supplierName || 'there'}
        childName={childName || 'the customer'}
        partyDate={formatDate(partyDate)}
        partyTime={partyTime || 'TBC'}
        serviceCategory={serviceCategory || 'Service'}
        grossAmount={formatCurrency(grossAmount)}
        platformFee={formatCurrency(platformFee)}
        netAmount={formatCurrency(netAmount)}
        approveLink={approveLink}
        viewInvoiceLink={approveLink}
      />
    );

    // Send email via Postmark
    const result = await client.sendEmail({
      From: "hello@partysnap.co.uk",
      To: supplierEmail,
      Subject: `Invoice ${invoiceNumber} Ready for Approval - PartySnap`,
      HtmlBody: emailHtml,
      MessageStream: "outbound",
    });

    console.log(`✅ Invoice email sent to ${supplierEmail} for ${invoiceNumber}`);

    return new Response(JSON.stringify({
      success: true,
      messageId: result.MessageID,
      invoiceNumber
    }), { status: 200 });

  } catch (error) {
    console.error('Error sending invoice email:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send email',
      details: error.message
    }), { status: 500 });
  }
}
