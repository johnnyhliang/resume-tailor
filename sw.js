const CACHE_NAME = 'resume-tailor-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/src/app.js',
  '/src/blocks.js',
  '/src/gemini-api.js',
  '/src/utils.js',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Syne:wght@400;500;600&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  // Handle share target (GET request with params)
  if (event.request.method === 'GET' && event.request.url.includes('?')) {
    const url = new URL(event.request.url);
    if (url.searchParams.has('text') || url.searchParams.has('url') || url.searchParams.has('title')) {
      return event.respondWith(Response.redirect('/index.html' + url.search));
    }
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
