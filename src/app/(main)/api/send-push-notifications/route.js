import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

export async function POST(req) {
  try {
    const { 
      fcmToken,
      title,
      body,
      data = {},
      supplierName,
      customerName,
      childName,
      theme,
      partyDate,
      depositAmount
    } = await req.json();

    if (!fcmToken) {
      return new Response(JSON.stringify({ error: 'FCM token is required' }), { status: 400 });
    }

    // Create the notification message
    const message = {
      notification: {
        title: title || `🚨 URGENT: £${depositAmount} Booking Confirmed`,
        body: body || `${customerName} paid for ${childName}'s ${theme} party on ${partyDate}. Confirm within 2 hours!`
      },
      data: {
        bookingType: 'paid_booking',
        customerName: customerName || '',
        childName: childName || '',
        theme: theme || '',
        partyDate: partyDate || '',
        depositAmount: depositAmount || '',
        urgency: 'high',
        redirectUrl: '/suppliers/dashboard',
        ...data
      },
      token: fcmToken,
      android: {
        priority: 'high',
        notification: {
          channelId: 'booking_alerts',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: title || `🚨 URGENT: £${depositAmount} Booking Confirmed`,
              body: body || `${customerName} paid for ${childName}'s ${theme} party. Confirm now!`
            },
            sound: 'default',
            badge: 1,
            'content-available': 1
          }
        }
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          title: title || `🚨 URGENT: £${depositAmount} Booking Confirmed`,
          body: body || `${customerName} paid for ${childName}'s ${theme} party on ${partyDate}. Confirm within 2 hours!`,
          icon: 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png',
          badge: 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png',
          requireInteraction: true,
          tag: 'urgent-booking',
          actions: [
            {
              action: 'view',
              title: 'View Booking'
            },
            {
              action: 'dismiss', 
              title: 'Dismiss'
            }
          ]
        },
        fcmOptions: {
          link: '/suppliers/dashboard'
        }
      }
    };

    // Send the notification
    const messaging = getMessaging();
    const response = await messaging.send(message);

    console.log('Push notification sent successfully:', response);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: response,
      sentTo: supplierName || 'Supplier'
    }), { status: 200 });

  } catch (error) {
    console.error('Push notification error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'messaging/registration-token-not-registered') {
      return new Response(JSON.stringify({ 
        error: 'FCM token is invalid or expired',
        code: 'TOKEN_INVALID'
      }), { status: 400 });
    }
    
    if (error.code === 'messaging/invalid-registration-token') {
      return new Response(JSON.stringify({ 
        error: 'FCM token format is invalid',
        code: 'TOKEN_FORMAT_INVALID'
      }), { status: 400 });
    }

    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to send push notification',
      code: error.code || 'UNKNOWN_ERROR'
    }), { status: 500 });
  }
}