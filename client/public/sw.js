// Service Worker - Bracha veHatzlacha Lottery Platform
// Cache management for offline functionality

const CACHE_NAME = 'bracha-lottery-v1.0.0';
const STATIC_CACHE = 'bracha-static-v1.0.0';
const DYNAMIC_CACHE = 'bracha-dynamic-v1.0.0';

// Critical assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico'
];

// API endpoints to cache with strategies
const API_CACHE_PATTERNS = [
  '/api/draws/current',
  '/api/draws/completed',
  '/api/auth/user',
  '/api/users/stats'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Cache cleanup completed');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different request types with appropriate strategies
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

// Check if request is for static assets
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/static/') || 
         url.pathname.includes('/assets/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.ico');
}

// Check if request is for API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Check if request is for page navigation
function isPageRequest(request) {
  return request.destination === 'document';
}

// Handle static assets with Cache First strategy
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Static asset fetch failed:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle API requests with Network First strategy
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses for critical endpoints
      if (shouldCacheAPI(url.pathname)) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', url.pathname);
    
    // Fallback to cache for critical endpoints
    if (shouldCacheAPI(url.pathname)) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Add offline indicator header
        const response = cachedResponse.clone();
        response.headers.set('X-Served-By', 'ServiceWorker-Cache');
        return response;
      }
    }
    
    // Return offline response for non-cached API calls
    return new Response(
      JSON.stringify({
        error: 'Service temporarily unavailable',
        offline: true,
        message: 'Please check your internet connection'
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'X-Served-By': 'ServiceWorker-Offline'
        }
      }
    );
  }
}

// Handle page requests with Cache First, fallback to offline page
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      return networkResponse;
    }
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.log('[SW] Page request failed, serving from cache');
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to root page for SPA navigation
    const rootPage = await caches.match('/');
    if (rootPage) {
      return rootPage;
    }
    
    // Ultimate fallback - offline page
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Bracha veHatzlacha</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .offline-container { max-width: 500px; margin: 0 auto; }
          .offline-icon { font-size: 64px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">📡</div>
          <h1>You're Offline</h1>
          <p>Please check your internet connection and try again.</p>
          <button onclick="window.location.reload()">Retry</button>
        </div>
      </body>
      </html>
    `, {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Handle generic requests
async function handleGenericRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Resource not available offline', { status: 503 });
  }
}

// Check if API endpoint should be cached
function shouldCacheAPI(pathname) {
  return API_CACHE_PATTERNS.some(pattern => pathname.includes(pattern));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'lottery-ticket-purchase') {
    event.waitUntil(syncTicketPurchases());
  } else if (event.tag === 'chat-messages') {
    event.waitUntil(syncChatMessages());
  }
});

// Sync offline ticket purchases when back online
async function syncTicketPurchases() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/tickets') && request.method === 'POST') {
        try {
          await fetch(request);
          await cache.delete(request);
          console.log('[SW] Synced offline ticket purchase');
        } catch (error) {
          console.error('[SW] Failed to sync ticket purchase:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync offline chat messages
async function syncChatMessages() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/chat') && request.method === 'POST') {
        try {
          await fetch(request);
          await cache.delete(request);
          console.log('[SW] Synced offline chat message');
        } catch (error) {
          console.error('[SW] Failed to sync chat message:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Chat sync failed:', error);
  }
}

console.log('[SW] Service Worker script loaded successfully');