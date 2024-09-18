// Import Firebase SDKs for Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.1.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.2/firebase-messaging-compat.js');

// Inicjalizacja Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAK4rhRpK1M3XuMz19ONqJjBAc5UhQanUo",
  authDomain: "auth-vue-bf3ca.firebaseapp.com",
  projectId: "auth-vue-bf3ca",
  storageBucket: "auth-vue-bf3ca.appspot.com",
  messagingSenderId: "138253763668",
  appId: "1:138253763668:web:ea8f4676278466737199c1",
  measurementId: "G-0BX2JEHR9Y"
});

// Inicjalizacja Firebase Messaging
const messaging = firebase.messaging();

// Obsługa powiadomień w tle
messaging.onBackgroundMessage(function(payload) {
  console.log('Otrzymano powiadomienie w tle:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
