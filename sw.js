// FOCO ARENA service worker — cache do app shell (offline) + sync continua online
const CACHE = 'foco-arena-v1';
const SHELL = ['./','./index.html','./styles.css','./app.js','./config.js',
  './manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // chamadas ao Supabase e fontes: sempre rede (não cachear dados)
  if (url.hostname.includes('supabase') || url.hostname.includes('googleapis') || url.hostname.includes('jsdelivr')) {
    return; // deixa passar direto pra rede
  }
  // app shell: cache primeiro, rede como fallback
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp=>{
    const copy = resp.clone();
    caches.open(CACHE).then(c=>c.put(e.request, copy)).catch(()=>{});
    return resp;
  }).catch(()=>caches.match('./index.html'))));
});
