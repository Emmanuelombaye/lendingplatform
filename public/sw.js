// Service Worker for Vertex Loans Push Notifications
// Handles background notifications and offline capabilities

const CACHE_NAME = 'vertex-loans-v2'; // Bumped version to clear old caches
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
});

// Fetch event with Network-First strategy for the main entry point
// This prevents the "MIME type text/html" error caused by caching old index.html
// that points to deleted/renamed hashed assets.
self.addEventListener('fetch', (event) => {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);

  // 1. Navigation strategy: Network-First
  // This ensures we always get the latest index.html with correct script hashes
  if (event.request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh version of index.html for offline fallback
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match('/');
        })
    );
    return;
  }

  // 2. API requests: Network-First (with no cache for sensitive data)
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Static Assets: Cache-First (hashed assets or images)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Cache valid static responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return response;
      });
    })
  );
});

// Handle Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  console.log('Syncing notifications...');
}

// Background Task handling
self.addEventListener('message', (event) => {
  const { type } = event.data;
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker v2 loaded successfully');
