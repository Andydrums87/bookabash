import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyCPzNSejEF2nRoI-sQsiK5TXdzt_eLeYvY",
    authDomain: "party-snap-8d80a.firebaseapp.com",
    projectId: "party-snap-8d80a",
    storageBucket: "party-snap-8d80a.firebasestorage.app",
    messagingSenderId: "257900407891",
    appId: "1:257900407891:web:1d43aacd94793e274f6aa6",
    measurementId: "G-BEX0E68R87"
  };

const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service worker
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export { getToken, onMessage };
export default app;