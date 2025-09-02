import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req) {
  try {
    const {
      phoneNumber,
      supplierName,
      customerName,
      childName,
      theme,
      partyDate,
      depositAmount,
      supplierEarning,
      dashboardLink
    } = await req.json();

    if (!phoneNumber) {
      return new Response(JSON.stringify({ error: 'Phone number is required' }), { status: 400 });
    }

    // Format phone number for UK
    const formattedPhone = phoneNumber.startsWith('+44') 
      ? phoneNumber 
      : phoneNumber.startsWith('0') 
        ? `+44${phoneNumber.slice(1)}`
        : `+44${phoneNumber}`;

    // Create urgent SMS message
    const message = `URGENT BOOKING - PartySnap

£${supplierEarning} PAID BOOKING CONFIRMED

${customerName} paid £${depositAmount} for ${childName}'s ${theme} party on ${partyDate}.

RESPOND WITHIN 2 HOURS

Dashboard: ${dashboardLink}

Reply STOP to opt out`;

    // Send SMS with alphanumeric sender
    const smsResult = await client.messages.create({
      body: message,
      from: 'PartySnap',  // Alphanumeric sender ID
      to: formattedPhone
    });

    console.log('SMS sent successfully:', smsResult.sid);

    return new Response(JSON.stringify({
      success: true,
      messageId: smsResult.sid,
      sentTo: formattedPhone
    }), { status: 200 });

  } catch (error) {
    console.error('SMS notification error:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Failed to send SMS',
      code: error.code || 'SMS_ERROR'
    }), { status: 500 });
  }
}