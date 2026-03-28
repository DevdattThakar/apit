/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Service Worker - Caching Strategy for WorkForce Intel
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This service worker implements multiple caching strategies:
 * 
 * 1. Cache First (Static Assets): 
 *    - HTML, CSS, JS, fonts, images
 *    - Long cache duration (1 year)
 *    - Offline access
 * 
 * 2. Network First (API Calls):
 *    - Supabase API requests
 *    - Always try network first, fall back to cache
 *    - Reduces stale data
 * 
 * 3. Stale While Revalidate (Dynamic Content):
 *    - Blog posts, announcements
 *    - Serve cached content immediately, update in background
 *    - Best balance of freshness and speed
 * 
 * Core Web Vitals Impact:
 * - LCP: Faster through cached static assets
 * - FID: Reduced by pre-caching critical resources
 * - CLS: Consistent loading through proper cache handling
 */

const CACHE_NAME = "workforce-intel-v1";
const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";
const API_CACHE = "api-v1";

// Static assets to cache on install
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/manifest.json",
    "/favicon.ico",
];

// API endpoints that should be cached
const API_PATTERNS = [
    /\/rest\/v1\//,
    /\/functions\/v1\//,
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSTALL EVENT - Cache static assets
// ═══════════════════════════════════════════════════════════════════════════════

self.addEventListener("install", (event) => {
    console.log("[ServiceWorker] Installing...");

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log("[ServiceWorker] Caching static assets");
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((err) => {
                console.warn("[ServiceWorker] Cache install failed:", err);
                // Continue anyway - caching is optional
            })
    );

    // Skip waiting to activate immediately
    self.skipWaiting();
});

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVATE EVENT - Clean up old caches
// ═══════════════════════════════════════════════════════════════════════════════

self.addEventListener("activate", (event) => {
    console.log("[ServiceWorker] Activating...");

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => {
                        // Keep only current caches
                        return (
                            name === STATIC_CACHE ||
                            name === DYNAMIC_CACHE ||
                            name === API_CACHE
                        );
                    })
                    .map((name) => {
                        console.log("[ServiceWorker] Deleting old cache:", name);
                        return caches.delete(name);
                    })
            );
        })
    );

    // Take control immediately
    self.clients.claim();
});

// ═══════════════════════════════════════════════════════════════════════════════
// FETCH EVENT - Handle requests with appropriate caching strategy
// ═══════════════════════════════════════════════════════════════════════════════

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== "GET") {
        return;
    }

    // Skip cross-origin requests except for allowed CDNs
    if (
        url.origin !== location.origin &&
        !url.hostname.endsWith("supabase.co") &&
        !url.hostname.endsWith("googleapis.com") &&
        !url.hostname.endsWith("gstatic.com") &&
        !url.hostname.endsWith("unpkg.com")
    ) {
        return;
    }

    // Determine caching strategy based on request type
    if (isStaticAsset(url.pathname)) {
        // Cache First for static assets
        event.respondWith(cacheFirst(request));
    } else if (isAPIRequest(url)) {
        // Network First for API calls
        event.respondWith(networkFirst(request, API_CACHE));
    } else if (isDynamicContent(url.pathname)) {
        // Stale While Revalidate for dynamic content
        event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    } else {
        // Network First for everything else
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CACHING STRATEGIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Cache First Strategy
 * Best for: Static assets (HTML, CSS, JS, images, fonts)
 * - Check cache first
 * - If cached, return cached version
 * - If not cached, fetch from network and cache
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            try {
                const cache = await caches.open(STATIC_CACHE);
                // Clone the response before caching
                const responseClone = networkResponse.clone();
                await cache.put(request, responseClone);
            } catch (cacheError) {
                // Cache operation failed (common in development) - ignore
                console.warn("Cache.put failed:", cacheError);
            }
        }

        return networkResponse;
    } catch (error) {
        // Return offline fallback if available
        return caches.match("/offline.html") || new Response("Offline", { status: 503 });
    }
}

/**
 * Network First Strategy
 * Best for: API calls, dynamic content
 * - Try network first
 * - If successful, cache and return
 * - If failed, return cached version
 */
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            try {
                const cache = await caches.open(cacheName);
                const responseClone = networkResponse.clone();
                await cache.put(request, responseClone);
            } catch (cacheError) {
                console.warn("Cache.put failed:", cacheError);
            }
        }

        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        return new Response("Offline", { status: 503 });
    }
}

/**
 * Stale While Revalidate Strategy
 * Best for: Blog posts, news, announcements
 * - Return cached version immediately
 * - Fetch and update cache in background
 * - Best of both worlds: fast + fresh
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                try {
                    const responseClone = networkResponse.clone();
                    cache.put(request, responseClone);
                } catch (cacheError) {
                    console.warn("Cache.put failed:", cacheError);
                }
            }
            return networkResponse;
        })
        .catch(() => {
            return cachedResponse || new Response("Offline", { status: 503 });
        });

    return cachedResponse || fetchPromise;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function isStaticAsset(pathname) {
    const staticExtensions = [
        ".html",
        ".css",
        ".js",
        ".json",
        ".woff",
        ".woff2",
        ".ttf",
        ".eot",
        ".svg",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
        ".ico",
    ];

    return staticExtensions.some((ext) => pathname.endsWith(ext));
}

function isAPIRequest(url) {
    return API_PATTERNS.some((pattern) => pattern.test(url.href));
}

function isDynamicContent(pathname) {
    const dynamicPaths = ["/announcements", "/news", "/updates"];
    return dynamicPaths.some((path) => pathname.startsWith(path));
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUND SYNC (Optional - for offline form submissions)
// ═══════════════════════════════════════════════════════════════════════════════

self.addEventListener("sync", (event) => {
    if (event.tag === "sync-reports") {
        event.waitUntil(syncReports());
    }
});

async function syncReports() {
    // Get pending reports from IndexedDB and submit
    // This is a placeholder - implement based on your needs
    console.log("[ServiceWorker] Syncing offline reports...");
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS (Optional - for real-time updates)
// ═══════════════════════════════════════════════════════════════════════════════

self.addEventListener("push", (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
        body: data.body || "New notification",
        icon: "/favicon.ico",
        badge: "/badge-72.png",
        vibrate: [100, 50, 100],
        data: {
            url: data.url || "/",
        },
        actions: [
            { action: "open", title: "Open" },
            { action: "dismiss", title: "Dismiss" },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title || "WorkForce Intel", options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "open" || !event.action) {
        event.waitUntil(
            self.clients.openWindow(event.notification.data.url)
        );
    }
});
