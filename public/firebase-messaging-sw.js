importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyA30Krnh17Ugd_7yDf-k5dbEIwi02nUrCQ",
  authDomain: "ad96-c974f.firebaseapp.com",
  projectId: "ad96-c974f",
  storageBucket: "ad96-c974f.firebasestorage.app",
  messagingSenderId: "80844393688",
  appId: "1:80844393688:web:50f9e9152b731b57941bad",
  measurementId: "G-KR91ZE7H8T"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background Push Received:', payload);
  const notificationTitle = payload.notification?.title || "Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: '/logo.png',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
