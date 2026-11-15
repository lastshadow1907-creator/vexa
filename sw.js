
const CACHE_NAME = 'vexa-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode !== 'navigate') return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request)
    )
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Vexa', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Vexa', {
      body: data.body || 'Yeni bildirimin var',
      icon: '/vexa-icon.svg',
      badge: '/vexa-icon.svg',
      tag: data.tag || 'vexa-notification',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = new URL(
    event.notification.data?.url || '/',
    self.location.origin
  );

  if (url.origin !== self.location.origin) return;

  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(async (clients) => {
      for (const client of clients) {
        if (client.url === url.href) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url.href);
    })
  );
});
