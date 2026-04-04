// Service Worker for Vertex Loans - v10
const CACHE_NAME = 'vertex-loans-v10';

// Install - skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// Activate - claim clients and clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch - pass everything through, never block requests
self.addEventListener('fetch', (event) => {
  // Do nothing - let all requests go to network normally
  return;
});

// Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch { data = { title: 'Vertex Loans', message: event.data.text() }; }

  const { title = 'Vertex Loans', message = 'New notification', actionUrl } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon: '/logovertex.png',
      badge: '/logovertex.png',
      data: { actionUrl },
    }).catch(() => {})
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.actionUrl || '/dashboard';
  event.waitUntil(clients.openWindow(url));
});

// Message
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

console.log('Service Worker v10 loaded successfully');
