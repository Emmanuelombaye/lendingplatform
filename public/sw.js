// Service Worker for Vertex Loans Push Notifications
// Handles background notifications and offline capabilities

const CACHE_NAME = 'vertex-loans-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/logovertex.png',
  '/sounds/notification.mp3',
  '/sounds/success.mp3',
  '/sounds/warning.mp3',
  '/sounds/error.mp3'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Handle Push Notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  if (!event.data) {
    console.log('No push data');
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (error) {
    console.error('Error parsing push data:', error);
    notificationData = {
      title: 'Vertex Loans',
      message: event.data.text(),
      type: 'info'
    };
  }

  const {
    title = 'Vertex Loans',
    message = 'You have a new notification',
    type = 'info',
    actionUrl,
    loanId,
    icon = '/logovertex.png',
    badge = '/logovertex.png',
    requireInteraction = false,
    actions = []
  } = notificationData;

  // Customize notification based on type
  let notificationOptions = {
    body: message,
    icon: icon,
    badge: badge,
    requireInteraction: requireInteraction,
    data: {
      actionUrl,
      loanId,
      type,
      timestamp: new Date().toISOString()
    },
    actions: actions,
    silent: false,
    renotify: true,
    tag: `vertex-${type}-${Date.now()}`
  };

  // Customize based on notification type
  switch (type) {
    case 'success':
      notificationOptions.icon = '/logovertex.png';
      notificationOptions.requireInteraction = true;
      notificationOptions.actions = [
        { action: 'view', title: 'View Details' },
        { action: 'close', title: 'Close' }
      ];
      break;

    case 'error':
      notificationOptions.requireInteraction = true;
      notificationOptions.actions = [
        { action: 'retry', title: 'Try Again' },
        { action: 'support', title: 'Contact Support' },
        { action: 'close', title: 'Close' }
      ];
      break;

    case 'warning':
      notificationOptions.actions = [
        { action: 'view', title: 'View Details' },
        { action: 'close', title: 'Close' }
      ];
      break;

    default:
      notificationOptions.actions = [
        { action: 'view', title: 'View' },
        { action: 'close', title: 'Close' }
      ];
  }

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
      .then(() => {
        console.log('Notification displayed successfully');
      })
      .catch((error) => {
        console.error('Error displaying notification:', error);
      })
  );
});

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  const { action, notification } = event;
  const { actionUrl, loanId, type } = notification.data;

  // Close the notification
  notification.close();

  // Handle different actions
  switch (action) {
    case 'view':
      if (actionUrl) {
        event.waitUntil(
          clients.openWindow(actionUrl)
        );
      } else {
        event.waitUntil(
          clients.openWindow('/dashboard')
        );
      }
      break;

    case 'retry':
      if (loanId) {
        event.waitUntil(
          clients.openWindow(`/apply?retry=${loanId}`)
        );
      } else {
        event.waitUntil(
          clients.openWindow('/apply')
        );
      }
      break;

    case 'support':
      event.waitUntil(
        clients.openWindow('https://wa.me/18709620043?text=Hello, I need support with my Vertex Loans account.')
      );
      break;

    case 'close':
      // Just close, no action needed
      break;

    default:
      // Default click action
      if (actionUrl) {
        event.waitUntil(
          clients.openWindow(actionUrl)
        );
      } else {
        event.waitUntil(
          clients.openWindow('/dashboard')
        );
      }
  }
});

// Handle Notification Close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);

  // Optional: Track notification close events
  // You could send analytics data here
});

// Fetch event for offline support
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response for caching
          const responseClone = response.clone();

          // Cache successful API responses (optional)
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(event.request);
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
      .catch(() => {
        // Return offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Handle Background Sync (for offline actions)
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'background-sync-notifications') {
    event.waitUntil(
      syncNotifications()
    );
  }
});

// Sync notifications when back online
async function syncNotifications() {
  try {
    // Get pending notifications from IndexedDB or localStorage
    const pendingNotifications = await getPendingNotifications();

    for (const notification of pendingNotifications) {
      await self.registration.showNotification(notification.title, notification.options);
      await removePendingNotification(notification.id);
    }
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// Helper functions for managing pending notifications
async function getPendingNotifications() {
  // Implementation would depend on your storage strategy
  // This is a placeholder
  return [];
}

async function removePendingNotification(id) {
  // Implementation would depend on your storage strategy
  // This is a placeholder
  console.log('Removing pending notification:', id);
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_CLIENT_COUNT':
      self.clients.matchAll().then((clients) => {
        event.ports[0].postMessage({ count: clients.length });
      });
      break;

    case 'SHOW_NOTIFICATION':
      self.registration.showNotification(data.title, data.options);
      break;

    default:
      console.log('Unknown message type:', type);
  }
});

console.log('Service Worker loaded successfully');
