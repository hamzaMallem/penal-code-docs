
-
---
name: pwa-offline-support
description: How to turn Qanun Docs into a Progressive Web App (PWA) with offline support on desktop and mobile.
---

# PWA and Offline Support

## Instructions

- Use `next-pwa` or similar to enable PWA features.
- Create `manifest.json` for installability on devices.
- Implement a service worker to cache static assets and law data.
- Use caching strategies like Cache-first and Stale-while-revalidate.
- Notify users when a new version is available.

## next.config.js snippet

```js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
    // your other caching strategies...
  ],
});

module.exports = withPWA({
  // actual config
});

## Best Practices
 -- Test full offline experience thoroughly.
 -- Provide UI to clear cache if necessary.
 -- Avoid excessive caching size.
 -- Show network status indicators.