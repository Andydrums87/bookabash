import { ServerClient } from "postmark";
import { render } from "@react-email/render";
import EarlyAccessSignup from "../../../../emails/early-access-signup";

const client = new ServerClient(process.env.POSTMARK_API_TOKEN);

export async function POST(req) {
  try {
    const { email, name } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
    }

    // 1. Save to Google Sheets via your Apps Script webhook
    try {
      const sheetRes = await fetch(
        'https://script.google.com/macros/s/AKfycbx_e_WvEZnpJBHLPQrRJ3OzhFXv7RaRAfwsicUJxeRu1NlCbFx6ZA8VqXFJ4XsMG7Xs/exec',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
          redirect: 'follow',
        }
      );
      console.log('Google Sheets response status:', sheetRes.status);
    } catch (sheetErr) {
      console.error('Google Sheets error:', sheetErr);
    }

    // 2. Send confirmation email
    try {
      const emailHtml = await render(EarlyAccessSignup());
      await client.sendEmail({
        From: "hello@partysnap.co.uk",
        To: email,
        Subject: "You're on the list - PartySnap",
        HtmlBody: emailHtml,
        TextBody: "Thanks for signing up for early access to PartySnap. We'll keep you updated on our progress and let you know as soon as we launch. As an early supporter, you'll also have the chance to earn founder credits when we go live. Stay tuned! — The PartySnap Team",
      });
      console.log('Postmark email sent successfully');
    } catch (emailErr) {
      console.error('Postmark email error:', emailErr);
      return new Response(JSON.stringify({ error: emailErr.message || 'Failed to send email' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Email saved and confirmation sent' }), { status: 200 });
  } catch (error) {
    console.error('Subscribe route error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), { status: 500 });
  }
}
