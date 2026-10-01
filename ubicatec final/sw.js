importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_NAME = 'ubicatec-v56';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/aula.html',
  '/edificio.html',
  '/equipo.html',
  '/eventos.html',
  '/jornadas.html',
  '/rs.html',
  '/detalle-evento.html',
  '/css/style.min.css',
  '/css/index.css',
  '/css/aula.css',
  '/css/edificio.css',
  '/css/equipo.css',
  '/css/eventos.css',
  '/css/jornadas.css',
  '/css/noticias.css',
  '/css/detalle-evento.css',
  '/css/smart-search.css',
  '/css/global-nav.css',
  '/css/mobile-back-button.css',
  '/css/flappy-scores.css',
  '/css/pacman-toggle.css',
  '/vendor/bootstrap/bootstrap.min.css',
  '/vendor/bootstrap/bootstrap.min.js',
  '/vendor/bootstrap/popper.min.js',
  '/vendor/leaflet/leaflet.css',
  '/vendor/leaflet/leaflet.js',
  '/vendor/leaflet/images/marker-icon.png',
  '/vendor/leaflet/images/marker-shadow.png',
  '/vendor/jquery/jquery.min.js',
  '/vendor/aos/aos.css',
  '/vendor/aos/aos.js',
  '/vendor/fonts/google-fonts.css',
  '/vendor/fontawesome/css/all.min.css',
  '/vendor/fontawesome/webfonts/fa-solid-900.woff2',
  '/vendor/fontawesome/webfonts/fa-solid-900.ttf',
  '/vendor/fontawesome/webfonts/fa-brands-400.woff2',
  '/vendor/fontawesome/webfonts/fa-brands-400.ttf',
  '/vendor/fontawesome/webfonts/fa-regular-400.woff2',
  '/vendor/fontawesome/webfonts/fa-regular-400.ttf',
  '/vendor/linearicons/icon-font.min.css',
  '/vendor/linearicons/fonts/Linearicons-Free.woff2',
  '/vendor/linearicons/fonts/Linearicons-Free.woff',
  '/vendor/linearicons/fonts/Linearicons-Free.ttf',
  '/Icon/baños.png',
  '/Icon/mark.png',
  '/Icon/medicos.png',
  '/Icon/tabler/building.svg',
  '/Icon/tabler/door.svg',
  '/Icon/tabler/microscope.svg',
  '/Icon/tabler/school.svg',
  '/Icon/tabler/sport.svg',
  '/Icon/tabler/tools.svg',
  '/js/index.js',
  '/js/onesignal-web.js',
  '/js/web-permissions.js',
  '/js/onesignal-diagnostics.js',
  '/js/aula.js',
  '/js/voiceNav.js',
  '/js/mapa.js',
  '/js/edificio.js',
  '/js/equipo.js',
  '/js/eventos.js',
  '/js/noticias.js',
  '/js/detalle-evento.js',
  '/js/smart-search.js',
  '/js/global-nav.js',
  '/js/utils.js',
  '/js/metrics.js',
  '/js/metrics-legacy.js',
  '/vendor/bootstrap/bootstrap.min.js',
  '/vendor/bootstrap/popper.min.js',
  '/data/anuncios.json',
  '/data/cesa.json',
  '/data/edificios.json',
  '/data/industrial.json',
  '/data/itp_walk_graph.json',
  '/data/noticias.json',
  '/data/scores.json',
  '/games/pacman/index.html',
  '/games/pacman/pacman.js',
  '/games/pacman/modernizr-1.5.min.js',
  '/games/pacman/BD_Cartoon_Shout-webfont.ttf',
  '/games/pacman/audio/die.mp3',
  '/games/pacman/audio/eatghost.mp3',
  '/games/pacman/audio/eating.short.mp3',
  '/games/pacman/audio/eatpill.mp3',
  '/games/pacman/audio/opening_song.mp3',
  '/img/pacman/icon.png',
  '/img/navbar.svg',
  '/img/fondo.webp',
  '/img/edificios/Edificio 1.webp',
  '/img/edificios/edificio 10.webp',
  '/img/edificios/centro de informacion.webp',
  '/img/logo/logo.svg'
];

// Instalar el Service Worker y pre-cachear los recursos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      let cachedCount = 0;
      const totalCount = ASSETS_TO_CACHE.length;
      
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
          cachedCount++;
          // Enviar progreso a todos los clientes (ventanas abiertas)
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'CACHE_PROGRESS',
              progress: Math.round((cachedCount / totalCount) * 100)
            });
          });
        } catch (error) {
          console.warn(`Aviso al cachear ${asset}: ${error.message}`);
          // No fallar si un asset no se puede cachear
        }
      }
      return self.skipWaiting();
    })
  );
});

// Activar el SW y limpiar caches antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== 'map-tiles') {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de respuesta: Network First con Cache Fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Estrategia para las teselas del mapa (Map Tiles)
  if (url.hostname === 'tile.openstreetmap.org') {
    event.respondWith(
      caches.open('map-tiles').then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Estrategia general: Intentar Red, si falla, buscar en Cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida y es un GET, guardarla en cache
        if (response.status === 200 && event.request.method === 'GET' && !url.hostname.includes('google-analytics')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar buscar en el cache
        return caches.match(event.request).then(response => {
          if (response) return response;
          
          // Fallback para navegación offline
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Escuchar mensajes de OneSignal y cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_PROGRESS') {
    // Manejo de progreso de cache
  }
});
