import { ServerClient } from "postmark";
import { render } from '@react-email/render';
import ContactFormEmail from '../../../../../emails/contact-form';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

export async function POST(req) {
  try {
    const { name, email, inquiryType, subject, message } = await req.json();

    // Validation - check for empty or whitespace-only values
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();
    const trimmedSubject = subject?.trim();
    const trimmedMessage = message?.trim();

    if (!trimmedName) {
      return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400 });
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email address is required' }), { status: 400 });
    }

    if (!trimmedSubject) {
      return new Response(JSON.stringify({ error: 'Subject is required' }), { status: 400 });
    }

    if (!trimmedMessage) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });
    }

    // Render the email using React Email
    const emailHtml = await render(
      <ContactFormEmail
        name={trimmedName}
        email={trimmedEmail}
        inquiryType={inquiryType || 'general'}
        subject={trimmedSubject}
        message={trimmedMessage}
      />
    );

    // Send email via Postmark
    await client.sendEmail({
      From: "hello@partysnap.co.uk",
      To: "andrew@partysnap.co.uk",
      ReplyTo: trimmedEmail,
      Subject: `[Contact Form] ${trimmedSubject}`,
      HtmlBody: emailHtml,
    });

    return new Response(JSON.stringify({
      message: 'Message sent successfully',
      success: true
    }), { status: 200 });

  } catch (error) {
    console.error('Contact Form Email Error:', error);
    let errorMsg = error.message || 'Unknown error';

    // Handle Postmark specific errors
    if (error.response && error.response.body && error.response.body.errors) {
      errorMsg = error.response.body.errors.map(e => e.message).join(', ');
    }

    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
