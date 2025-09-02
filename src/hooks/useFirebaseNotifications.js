import { useState, useEffect } from 'react';
import { messaging, getToken, onMessage } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';

export const useFirebaseNotifications = (supplierId) => {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && messaging && supplierId) {
      initializeNotifications();
    }
  }, [supplierId]);

  const initializeNotifications = async () => {
    try {
      // Check current permission
      const permission = Notification.permission;
      setNotificationPermission(permission);

      if (permission === 'granted') {
        await setupFCMToken();
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        await setupFCMToken();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const setupFCMToken = async () => {
    try {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });
      
      if (token) {
        console.log('FCM Token obtained:', token);
        setFcmToken(token);
        await saveTokenToDatabase(token);
        setupMessageListener();
      } else {
        console.log('No registration token available.');
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  const saveTokenToDatabase = async (token) => {
    try {
      // Save FCM token to supplier record
      const { error } = await supabase
        .from('suppliers')
        .update({ 
          fcm_token: token,
          last_token_update: new Date().toISOString()
        })
        .eq('id', supplierId);

      if (error) {
        console.error('Error saving FCM token:', error);
      } else {
        console.log('FCM token saved to database');
      }
    } catch (error) {
      console.error('Error saving token to database:', error);
    }
  };

  const setupMessageListener = () => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        
        // Show custom in-app notification or use browser notification
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'New Booking', {
            body: payload.notification?.body,
            icon: 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png',
            tag: 'partysnap-notification',
            requireInteraction: true
          });
        }
        
        // You can also show an in-app toast/alert here
        alert(`New booking alert: ${payload.notification?.body}`);
      });
    }
  };

  return {
    notificationPermission,
    fcmToken,
    requestPermission
  };
};