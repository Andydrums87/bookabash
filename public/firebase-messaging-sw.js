importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCPzNSejEF2nRoI-sQsiK5TXdzt_eLeYvY",
    authDomain: "party-snap-8d80a.firebaseapp.com",
    projectId: "party-snap-8d80a",
    storageBucket: "party-snap-8d80a.firebasestorage.app",
    messagingSenderId: "257900407891",
    appId: "1:257900407891:web:1d43aacd94793e274f6aa6",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'New Booking Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new booking waiting',
    icon: 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png',
    requireInteraction: true
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});