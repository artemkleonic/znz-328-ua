
const CACHE = 'znz328-cache-v1';
const ASSETS = [
  'index.html','assets/css/main.css','assets/js/data.js','assets/js/main.js','assets/img/hero-school.jpg','assets/icons/icon.svg'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).catch(()=>caches.match('index.html'))));
});
