/**
 * Qanun Docs Service Worker
 * 
 * Caching Strategy:
 * - PRECACHE: App shell (HTML, CSS, JS, fonts)
 * - CACHE_FIRST: Static assets, JSON data files
 * - NETWORK_FIRST: Navigation requests (with cache fallback)
 * - OFFLINE_FALLBACK: Show offline page when network fails
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `qanun-docs-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `qanun-docs-data-${CACHE_VERSION}`;

// Files to precache on install
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
];

// Data files to cache (all law JSON files)
const DATA_URLS = [
  '/data/cpp/book_0.json',
  '/data/cpp/book_1st.json',
  '/data/cpp/book_2nd.json',
  '/data/cpp/book_3rd.json',
  '/data/cpp/book_4th.json',
  '/data/cpp/book_5th.json',
  '/data/cpp/book_6th.json',
  '/data/cpp/book_7th.json',
  '/data/cpp/book_8th.json',
  '/data/dp/code_book_0.json',
  '/data/dp/code_book_1.json',
  '/data/dp/code_book_2.json',
  '/data/dp/code_book_3.json',
];

// Install event - precache essential files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache app shell
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      }),
      // Cache data files
      caches.open(DATA_CACHE_NAME).then((cache) => {
        console.log('[SW] Precaching data files');
        return cache.addAll(DATA_URLS);
      }),
    ]).then(() => {
      console.log('[SW] Precaching complete');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete old version caches
            return name.startsWith('qanun-docs-') && 
                   name !== CACHE_NAME && 
                   name !== DATA_CACHE_NAME;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Handle different request types
  if (request.mode === 'navigate') {
    // Navigation requests - Network First with offline fallback
    event.respondWith(handleNavigationRequest(request));
  } else if (url.pathname.startsWith('/data/') && url.pathname.endsWith('.json')) {
    // JSON data files - Cache First (stale-while-revalidate)
    event.respondWith(handleDataRequest(request));
  } else if (isStaticAsset(url.pathname)) {
    // Static assets - Cache First
    event.respondWith(handleStaticRequest(request));
  } else {
    // Other requests - Network First
    event.respondWith(handleNetworkFirst(request));
  }
});

/**
 * Handle navigation requests (HTML pages)
 * Strategy: Network First with offline fallback
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for navigation, trying cache:', request.url);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page as fallback
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Last resort - return a basic offline response
    return new Response(
      '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>غير متصل</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;background:#12161F;color:#F8F8F2;"><h1>أنت غير متصل بالإنترنت</h1><p>يرجى التحقق من اتصالك بالإنترنت</p></body></html>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }
}

/**
 * Handle JSON data requests
 * Strategy: Cache First with background update (stale-while-revalidate)
 */
async function handleDataRequest(request) {
  const cache = await caches.open(DATA_CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);
  
  // Return cached response immediately, or wait for network
  if (cachedResponse) {
    // Update cache in background (stale-while-revalidate)
    fetchPromise;
    return cachedResponse;
  }
  
  // No cache, wait for network
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  // Both failed
  return new Response(JSON.stringify({ error: 'Offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle static asset requests
 * Strategy: Cache First
 */
async function handleStaticRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    return new Response('', { status: 404 });
  }
}

/**
 * Handle other requests
 * Strategy: Network First with cache fallback
 */
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('', { status: 503 });
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.webp', '.avif'
  ];
  
  return staticExtensions.some(ext => pathname.endsWith(ext)) ||
         pathname.startsWith('/_next/static/') ||
         pathname.startsWith('/icons/');
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'getVersion') {
    event.ports[0].postMessage(CACHE_VERSION);
  }
});

console.log('[SW] Service worker loaded');
