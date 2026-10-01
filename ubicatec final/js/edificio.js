/**
 * Lógica para la página de detalle de edificio (edificio.html).
 * Maneja la carga de información, visualización 360°, geolocalización y navegación.
 */

$(document).ready(function () {
    // Obtener el ID del edificio desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const edificioId = urlParams.get('id') || '1'; // Default ID: 1

    // Cargar datos del edificio
    loadEdificioData(edificioId);
});

/**
 * Carga los datos del edificio desde el JSON.
 * @param {string} edificioId - ID del edificio a cargar
 */
async function loadEdificioData(edificioId) {
    try {
        // Cargar datos desde el archivo JSON
        const response = await fetch('data/edificios.json');
        const data = await response.json();

        // Buscar el edificio por ID en ambas listas (edificios y canchas)
        const allItems = [...(data.edificios || []), ...(data.canchas || [])];
        const edificio = allItems.find(ed => ed.id == edificioId);

        if (edificio) {
            renderEdificioContent(edificio);
            try {
                var bKey = 'edificio_' + (edificio.nombre || edificioId || 'desconocido').toLowerCase().replace(/[^a-z0-9]+/g, '_');
                if (window.ubicatecTrackPage) window.ubicatecTrackPage(bKey);
            } catch (e) {}
        } else {
            showError('Edificio no encontrado');
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        showError('Error al cargar la información del edificio');
    }
}

/**
 * Renderiza el contenido HTML con la información del edificio.
 * @param {Object} edificio - Objeto con los datos del edificio
 */
function renderEdificioContent(edificio) {
    // Actualizar título de la página
    document.getElementById('page-title').textContent = edificio.nombre;

    // Actualizar el hero section con el nombre del edificio
    document.getElementById('hero-building-name').textContent = edificio.nombre;

    // Crear el contenido HTML dinámico
    const content = `
        <section id="ficha-edificio" class="bg-light py-5">
            <div class="container">
                <div class="row">
                    <div class="col-md-12 text-center" data-aos="fade-up">
                        <p class="section-sub-title">Ubicación: Campus Tec</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                            <!-- Imagen principal del edificio -->
                            <img src="${edificio.imagen}" alt="${edificio.nombre}" 
                                 class="img-fluid" loading="lazy" style="border-radius: 8px; margin-bottom: 20px;">
                            
                            <!-- Botón para ver imagen 360 si existe -->
                            ${edificio.imagen_360 ? `
                            <div class="mt-3 mb-3">
                                <button id="ver360Btn" class="btn btn-info">
                                    <i class="fas fa-globe"></i> Ver en 360°
                                </button>
                            </div>
                        ` : ''}
                        
                        <!-- Botón para iniciar navegación GPS -->
                        <button id="verUbicacionBtn" class="btn btn-primary mt-3" style="margin-bottom: 35px;">
                            Haz clic para ir ahí
                        </button>
                    </div>
                    <div class="col-md-6 text-left">
                        <h4>Descripción:</h4>
                        <p>${edificio.descripcion}</p>
                        ${edificio.logo ? `
                        <div style="margin: 12px 0 22px 0;">
                            <img src="${edificio.logo}" alt="Logo Delegación D-V-79" 
                                 style="max-width: 200px; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                        </div>
                        ` : ''}
                        <h4>Instalaciones:</h4>
                        <ul>
                            ${edificio.instalaciones.map(inst =>
        `<li><i class="fas fa-building"></i> ${inst}</li>`
    ).join('')}
                        </ul>
                        <h4>Horario de Atención:</h4>
                        <p>${edificio.horario}</p>

                        <!-- Actividades reportadas por la comunidad -->
                        <div class="ub-crowd-section mt-4 p-3" style="background: #f4f8ff; border-radius: 12px; border: 1px solid #d0e2ff;">
                            <h5 style="font-size: 15px; font-weight: 700; color: #003366; margin-bottom: 10px;">
                                <i class="fas fa-chart-pie text-primary me-2"></i> Usos más frecuentes (Comunidad):
                            </h5>
                            <div id="ubCrowdReasonsContainer">
                                <p style="font-size: 13px; color: #667788; margin: 0;">Cargando aportes comunitarios...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contenedor del Mapa Emergente para Navegación -->
                <div id="mapaEmergente">
                    <div id="distanciaEnMapa">
                        <div class="ub-edificio-nav-header">
                            <span id="distanciaEnMapaTexto"><b>Distancia Restante: ... Metros</b></span>
                            <button type="button" id="edificioVoiceToggle" class="ub-voice-toggle-btn" aria-label="Silenciar guía por voz" title="Guía por voz: Activada">🔊</button>
                        </div>
                    </div>
                    <div id="mapa"></div>
                    <div class="ub-map-footer">
                        <button id="cerrarMapaBtn" class="btn btn-secondary">Cerrar Mapa</button>
                    </div>
                </div>
            </div>
        </section>
    `;

    // Insertar el contenido en el div principal
    document.getElementById('edificio-content').innerHTML = content;

    // Poblar dinámicamente motivos comunitarios
    setTimeout(function () {
        const crowdContainer = document.getElementById('ubCrowdReasonsContainer');
        if (crowdContainer && window.UbicatecSmartSearch) {
            const reasons = window.UbicatecSmartSearch.getTopReasons(edificio.id);
            if (!reasons || !reasons.length) {
                crowdContainer.innerHTML = '<p style="font-size: 13px; color: #667788; margin: 0; font-style: italic;"><i class="fas fa-comment-dots me-1"></i> Aún no hay registros de actividades. ¡Sé el primero en compartir tu motivo al visitarlo!</p>';
            } else {
                crowdContainer.innerHTML = '<ul class="list-unstyled mb-0" style="font-size: 13px;">' +
                    reasons.map(r => `<li class="mb-1"><span class="badge bg-primary rounded-pill me-2">${r.count} ${r.count === 1 ? 'mención' : 'menciones'}</span> <strong>${window.UbicatecSmartSearch.sanitizeText(r.reason)}</strong></li>`).join('') +
                    '</ul>';
            }
        }
    }, 100);

    // Inicializar funcionalidades del mapa (Geolocalización)
    initializeMapFeatures(edificio);

    // Inicializar visor 360° si existe
    if (edificio.imagen_360) {
        initialize360Viewer(edificio.imagen_360);
    }
}

/**
 * Inicializa las características del mapa de navegación GPS.
 * @param {Object} edificio - Datos del edificio destino
 */
function initializeMapFeatures(edificio) {
    // Variables para el mapa
    let mapa;
    let marcadorDestino;
    let marcadorUsuario;
    let circuloPrecision;
    let watchId = null;
    let llegadaNotificada = false;
    let rutaLinea;
    let campusGraphPromise;
    let campusGraph;
    let campusGraphDestIdx = null;
    let ultimaRutaDesde;
    let ultimaRutaTs = 0;
    let distanciaRutaM = null;
    let duracionRutaS = null;
    let lastRouteLatLngs = null;
    let lastOffRouteRecalcTs = 0;
    let offRouteCounter = 0;
    let poiLayer = null;
    let poiMarkers = null;
    let poiDataPromise = null;
    let poiData = null;
    let lastPoiUpdateTs = 0;
    let lastPoiUpdateFrom = null;
    let headingEventName = null;
    let headingListening = false;
    let smoothedHeadingDeg = null;
    let lastGeoHeadingDeg = null;

    // Elementos del DOM
    const mapaEmergente = document.getElementById('mapaEmergente');
    const verUbicacionBtn = document.getElementById('verUbicacionBtn');
    const cerrarMapaBtn = document.getElementById('cerrarMapaBtn');
    const avisoModal = document.getElementById('avisoModal');
    const cerrarAvisoBtn = document.getElementById('cerrarAvisoBtn');
    const cancelarUbicacionBtn = document.getElementById('cancelarUbicacionBtn');
    const continuarBtn = document.getElementById('continuarBtn');
    const llegadaModal = document.getElementById('llegadaModal');
    const cerrarLlegadaBtn = document.getElementById('cerrarLlegadaBtn');
    const cerrarLlegadaOkBtn = document.getElementById('cerrarLlegadaOkBtn');
    const distanciaEnMapaElement = document.getElementById('distanciaEnMapa');

    function wrap360(deg) {
        const n = Number(deg);
        if (!Number.isFinite(n)) return null;
        let x = n % 360;
        if (x < 0) x += 360;
        return x;
    }

    function angleDeltaDeg(fromDeg, toDeg) {
        const a = wrap360(fromDeg);
        const b = wrap360(toDeg);
        if (a == null || b == null) return 0;
        let d = b - a;
        if (d > 180) d -= 360;
        else if (d < -180) d += 360;
        return d;
    }

    function getScreenAngleDeg() {
        try {
            if (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === 'number') {
                return wrap360(window.screen.orientation.angle) || 0;
            }
        } catch (e) {}
        try {
            if (typeof window.orientation === 'number') return wrap360(window.orientation) || 0;
        } catch (e) {}
        return 0;
    }

    function computeHeadingFromOrientationEvent(e) {
        if (!e) return null;
        if (typeof e.webkitCompassHeading === 'number' && Number.isFinite(e.webkitCompassHeading)) {
            return wrap360(e.webkitCompassHeading);
        }
        if (typeof e.alpha !== 'number' || !Number.isFinite(e.alpha)) return null;
        const raw = 360 - e.alpha;
        const h = wrap360(raw + getScreenAngleDeg());
        return h;
    }

    function applyHeadingToUserMarker(deg) {
        if (!marcadorUsuario || deg == null) return;
        const el = marcadorUsuario.getElement ? marcadorUsuario.getElement() : null;
        if (!el) return;
        const inner = el.querySelector('.ub-user-heading');
        if (!inner) return;
        inner.style.transform = `rotate(${deg}deg)`;
    }

    function onDeviceOrientation(e) {
        const h = computeHeadingFromOrientationEvent(e);
        if (h == null) return;
        if (smoothedHeadingDeg == null) smoothedHeadingDeg = h;
        else smoothedHeadingDeg = wrap360(smoothedHeadingDeg + angleDeltaDeg(smoothedHeadingDeg, h) * 0.2);
        applyHeadingToUserMarker(smoothedHeadingDeg);
    }

    function startHeadingListening() {
        if (headingListening) return;
        if (!('DeviceOrientationEvent' in window)) return;
        headingEventName = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
        const attach = () => {
            if (headingListening) return;
            window.addEventListener(headingEventName, onDeviceOrientation, true);
            headingListening = true;
        };
        try {
            if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
                window.DeviceOrientationEvent.requestPermission()
                    .then(state => { if (state === 'granted') attach(); })
                    .catch(() => {});
                return;
            }
        } catch (e) {}
        attach();
    }

    function stopHeadingListening() {
        if (!headingListening) return;
        try { window.removeEventListener(headingEventName || 'deviceorientation', onDeviceOrientation, true); } catch (e) {}
        headingListening = false;
        headingEventName = null;
        smoothedHeadingDeg = null;
        lastGeoHeadingDeg = null;
    }

    // Event listeners para Modales y Botones
    verUbicacionBtn.addEventListener('click', () => {
        try { if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.unlock(); } catch (e) {}
        avisoModal.style.display = 'block';
    });

    cerrarAvisoBtn.addEventListener('click', () => {
        avisoModal.style.display = 'none';
    });

    cancelarUbicacionBtn.addEventListener('click', () => {
        avisoModal.style.display = 'none';
    });

    continuarBtn.addEventListener('click', () => {
        try { if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.unlock(); } catch (e) {}
        avisoModal.style.display = 'none';
        mapaEmergente.style.display = 'flex';
        startHeadingListening();

        try {
            if (window.UbicatecVoiceNav) {
                window.UbicatecVoiceNav.startRoute(edificio.nombre || 'el edificio');
            }
        } catch (e) {}

        // Pequeño retardo para asegurar que el contenedor es visible y tiene dimensiones
        setTimeout(() => {
            inicializarMapa();
        }, 100);
        llegadaNotificada = false;
    });

    cerrarMapaBtn.addEventListener('click', () => {
        try { if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.stopRoute(); } catch (e) {}
        if (watchId !== null) {
            try { navigator.geolocation.clearWatch(watchId); } catch (e) {}
            watchId = null;
        }
        mapaEmergente.style.display = 'none';
        stopHeadingListening();
        if (mapa) {
            mapa.remove();
            mapa = null;
            marcadorDestino = null;
            marcadorUsuario = null;
            circuloPrecision = null;
            rutaLinea = null;
            campusGraphDestIdx = null;
            ultimaRutaDesde = null;
            ultimaRutaTs = 0;
            distanciaRutaM = null;
            duracionRutaS = null;
            lastRouteLatLngs = null;
            lastOffRouteRecalcTs = 0;
            offRouteCounter = 0;
            poiLayer = null;
            poiMarkers = null;
            poiDataPromise = null;
            poiData = null;
            lastPoiUpdateTs = 0;
            lastPoiUpdateFrom = null;
        }
    });

    cerrarLlegadaBtn.addEventListener('click', () => {
        llegadaModal.style.display = 'none';
    });

    cerrarLlegadaOkBtn.addEventListener('click', () => {
        llegadaModal.style.display = 'none';
    });

    // Cerrar modales al hacer clic en el fondo
    avisoModal.addEventListener('click', (e) => {
        if (e.target === avisoModal) {
            avisoModal.style.display = 'none';
        }
    });

    llegadaModal.addEventListener('click', (e) => {
        if (e.target === llegadaModal) {
            llegadaModal.style.display = 'none';
        }
    });

    /**
     * Inicializa el mapa Leaflet dentro del modal.
     */
    function inicializarMapa() {
        mapa = L.map('mapa').setView([19.0733, -98.2889], 20); // Vista inicial

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapa);

        let followUser = false;
        let lastUserLL = null;
        let didInitialCenter = false;

        mapa.on('dragstart', () => { followUser = false; });
        mapa.on('zoomstart', () => { followUser = false; });

        const centerControl = L.control({ position: 'bottomright' });
        centerControl.onAdd = function () {
            const container = L.DomUtil.create('div', 'ub-center-control');
            const btn = L.DomUtil.create('button', 'ub-center-btn', container);
            btn.type = 'button';
            btn.setAttribute('aria-label', 'Centrar en mi ubicación');
            btn.title = 'Centrar en mi ubicación';
            btn.textContent = '⌖';
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(btn, 'click', L.DomEvent.stop);
            L.DomEvent.on(btn, 'click', () => {
                if (!mapa || !lastUserLL) return;
                mapa.panTo(lastUserLL, { animate: true, duration: 0.5, easeLinearity: 0.25 });
            });
            return container;
        };
        centerControl.addTo(mapa);

        poiLayer = L.layerGroup().addTo(mapa);
        poiMarkers = new Map();

        // Marcador del destino (Edificio)
        marcadorDestino = L.marker(edificio.coords).addTo(mapa)
            .bindPopup(`<b>${edificio.nombre}</b>`).openPopup();

        // Icono personalizado para el usuario
        const iconoUsuario = L.divIcon({
            className: 'ub-user-marker',
            html: `<img class="ub-user-heading ub-user-img" src="Icon/mark.png" alt="" />`,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -17]
        });

        const iconoBano = L.icon({
            iconUrl: encodeURI('Icon/baños.png'),
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const iconoReunion = L.icon({
            iconUrl: 'img/reunion.png',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        let markerAnimRaf = null;

        function easeOutQuad(t) {
            return t * (2 - t);
        }

        function animateMarkerTo(marker, toLatLng, durationMs) {
            if (!marker) return;
            const fromLatLng = marker.getLatLng();
            const dist = fromLatLng.distanceTo(toLatLng);
            if (dist > 80) {
                if (markerAnimRaf) cancelAnimationFrame(markerAnimRaf);
                marker.setLatLng(toLatLng);
                return;
            }

            if (markerAnimRaf) cancelAnimationFrame(markerAnimRaf);
            const start = performance.now();
            const d = Math.max(250, Math.min(1200, durationMs || 700));

            const tick = (now) => {
                const t = Math.min(1, (now - start) / d);
                const k = easeOutQuad(t);
                const lat = fromLatLng.lat + (toLatLng.lat - fromLatLng.lat) * k;
                const lng = fromLatLng.lng + (toLatLng.lng - fromLatLng.lng) * k;
                marker.setLatLng([lat, lng]);
                if (t < 1) markerAnimRaf = requestAnimationFrame(tick);
            };

            markerAnimRaf = requestAnimationFrame(tick);
        }

        function keepUserInView(latLng) {
            if (!mapa) return;
            if (!followUser) return;
            const bounds = mapa.getBounds().pad(-0.25);
            if (!bounds.contains(latLng)) {
                mapa.panTo(latLng, { animate: true, duration: 0.5, easeLinearity: 0.25 });
            }
        }

        // Opciones para el seguimiento GPS
        const opcionesSeguimiento = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000
        };

        function ensureGraphLoading() {
            if (campusGraph) return Promise.resolve(campusGraph);
            if (campusGraphPromise) return campusGraphPromise;
            campusGraphPromise = fetch('data/itp_walk_graph.json')
                .then(r => {
                    if (!r.ok) throw new Error(`graph_http_${r.status}`);
                    return r.json();
                })
                .then(g => {
                    campusGraph = g;
                    return g;
                });
            return campusGraphPromise;
        }

        function haversineMeters(lat1, lon1, lat2, lon2) {
            const R = 6371000;
            const rad = Math.PI / 180;
            const phi1 = lat1 * rad;
            const phi2 = lat2 * rad;
            const dphi = (lat2 - lat1) * rad;
            const dlambda = (lon2 - lon1) * rad;
            const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
            return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
        }

        function nearestNodeIdx(g, userLL) {
            const n = g.lat.length;
            let best = -1;
            let bestD = Infinity;
            for (let i = 0; i < n; i++) {
                const d = haversineMeters(userLL.lat, userLL.lng, g.lat[i], g.lon[i]);
                if (d < bestD) {
                    bestD = d;
                    best = i;
                }
            }
            return best;
        }

        class MinHeap {
            constructor() { this.ids = []; this.keys = []; }
            get size() { return this.ids.length; }
            push(id, key) {
                const ids = this.ids;
                const keys = this.keys;
                let i = ids.length;
                ids.push(id);
                keys.push(key);
                while (i > 0) {
                    const p = (i - 1) >> 1;
                    if (keys[p] <= key) break;
                    ids[i] = ids[p];
                    keys[i] = keys[p];
                    i = p;
                }
                ids[i] = id;
                keys[i] = key;
            }
            pop() {
                const ids = this.ids;
                const keys = this.keys;
                const rootId = ids[0];
                const rootKey = keys[0];
                const lastId = ids.pop();
                const lastKey = keys.pop();
                if (ids.length) {
                    let i = 0;
                    while (true) {
                        const l = i * 2 + 1;
                        const r = l + 1;
                        if (l >= ids.length) break;
                        let c = l;
                        if (r < ids.length && keys[r] < keys[l]) c = r;
                        if (keys[c] >= lastKey) break;
                        ids[i] = ids[c];
                        keys[i] = keys[c];
                        i = c;
                    }
                    ids[i] = lastId;
                    keys[i] = lastKey;
                }
                return { id: rootId, key: rootKey };
            }
        }

        function heuristic(g, a, b) {
            const lat1 = g.lat[a];
            const lon1 = g.lon[a];
            const lat2 = g.lat[b];
            const lon2 = g.lon[b];
            return haversineMeters(lat1, lon1, lat2, lon2);
        }

        function aStar(g, start, goal) {
            if (start === goal) return { path: [start], dist: 0 };
            const n = g.lat.length;
            const offsets = g.offsets;
            const to = g.to;
            const w = g.w;

            const gScore = new Float64Array(n);
            for (let i = 0; i < n; i++) gScore[i] = Infinity;
            const fScore = new Float64Array(n);
            for (let i = 0; i < n; i++) fScore[i] = Infinity;
            const came = new Int32Array(n);
            for (let i = 0; i < n; i++) came[i] = -1;

            gScore[start] = 0;
            fScore[start] = heuristic(g, start, goal);

            const open = new MinHeap();
            open.push(start, fScore[start]);
            const closed = new Uint8Array(n);

            while (open.size) {
                const cur = open.pop().id;
                if (closed[cur]) continue;
                if (cur === goal) break;
                closed[cur] = 1;

                const gCur = gScore[cur];
                const a0 = offsets[cur];
                const a1 = offsets[cur + 1];
                for (let e = a0; e < a1; e++) {
                    const nb = to[e];
                    if (closed[nb]) continue;
                    const tentative = gCur + w[e];
                    if (tentative < gScore[nb]) {
                        came[nb] = cur;
                        gScore[nb] = tentative;
                        fScore[nb] = tentative + heuristic(g, nb, goal);
                        open.push(nb, fScore[nb]);
                    }
                }
            }

            if (came[goal] === -1) return null;
            const path = [];
            let x = goal;
            path.push(x);
            while (x !== start) {
                x = came[x];
                if (x === -1) return null;
                path.push(x);
            }
            path.reverse();
            return { path, dist: gScore[goal] };
        }

        function pintarRutaFromPath(g, path) {
            if (!mapa || !Array.isArray(path) || path.length < 2) return;
            const latLngs = path.map(i => [g.lat[i], g.lon[i]]);
            lastRouteLatLngs = latLngs.map(ll => L.latLng(ll[0], ll[1]));
            if (rutaLinea) {
                rutaLinea.setLatLngs(latLngs);
            } else {
                rutaLinea = L.polyline(latLngs, { color: '#1e66ff', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }).addTo(mapa);
            }
        }

        function distanceToRouteMeters(userLL) {
            if (!lastRouteLatLngs || lastRouteLatLngs.length < 2) return Infinity;
            const R = 6371000;
            const lat0 = userLL.lat * Math.PI / 180;
            const cos0 = Math.cos(lat0);
            function toXY(ll) {
                const latRad = ll.lat * Math.PI / 180;
                const lonRad = ll.lng * Math.PI / 180;
                return { x: lonRad * cos0 * R, y: latRad * R };
            }
            const p = toXY(userLL);
            let best = Infinity;
            for (let i = 0; i < lastRouteLatLngs.length - 1; i++) {
                const a = toXY(lastRouteLatLngs[i]);
                const b = toXY(lastRouteLatLngs[i + 1]);
                const abx = b.x - a.x;
                const aby = b.y - a.y;
                const apx = p.x - a.x;
                const apy = p.y - a.y;
                const ab2 = abx * abx + aby * aby;
                let t = 0;
                if (ab2 > 0) t = (apx * abx + apy * aby) / ab2;
                if (t < 0) t = 0;
                else if (t > 1) t = 1;
                const cx = a.x + abx * t;
                const cy = a.y + aby * t;
                const dx = p.x - cx;
                const dy = p.y - cy;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < best) best = d;
            }
            return best;
        }

        function shouldRecalcRoute(userLL) {
            const now = Date.now();
            if (!ultimaRutaDesde) return true;
            const dRoute = distanceToRouteMeters(userLL);
            if (Number.isFinite(dRoute) && dRoute > 10) {
                if (now - lastOffRouteRecalcTs > 1500) {
                    lastOffRouteRecalcTs = now;
                    try { if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.notifyRerouting(); } catch (e) {}
                    return true;
                }
            }
            if (now - ultimaRutaTs > 5000) return true;
            try {
                if (userLL.distanceTo(ultimaRutaDesde) > 8) return true;
            } catch (e) {}
            if (Number.isFinite(dRoute) && dRoute > 12) return true;
            return false;
        }

        async function actualizarRuta(userLL) {
            if (!mapa || !userLL) return;
            if (!shouldRecalcRoute(userLL)) return;
            ultimaRutaDesde = userLL;
            ultimaRutaTs = Date.now();
            try {
                const g = await ensureGraphLoading();
                if (!g || !g.lat || !g.offsets) throw new Error('graph_invalid');
                if (campusGraphDestIdx == null) {
                    campusGraphDestIdx = nearestNodeIdx(g, L.latLng(edificio.coords[0], edificio.coords[1]));
                }
                const startIdx = nearestNodeIdx(g, userLL);
                if (startIdx < 0 || campusGraphDestIdx < 0) throw new Error('graph_snap');
                const res = aStar(g, startIdx, campusGraphDestIdx);
                if (!res || !res.path || res.path.length < 2) throw new Error('graph_no_route');
                pintarRutaFromPath(g, res.path);
                distanciaRutaM = Number.isFinite(res.dist) ? res.dist : null;
                duracionRutaS = null;
            } catch (e) {
                distanciaRutaM = null;
                duracionRutaS = null;
                lastRouteLatLngs = null;
            }
        }

        function normalizeText(s) {
            return String(s || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();
        }

        function ensurePoiData() {
            if (poiData) return Promise.resolve(poiData);
            if (poiDataPromise) return poiDataPromise;

            const puntosReunion = [
                { id: 'punto_reunion_1', nombre: 'Punto de reunión 1', coords: [19.0707691, -98.1684754] },
                { id: 'punto_reunion_2', nombre: 'Punto de reunión 2', coords: [19.0708372, -98.1688298] },
                { id: 'punto_reunion_3', nombre: 'Punto de reunión 3', coords: [19.0709218, -98.1692499] },
                { id: 'punto_reunion_4', nombre: 'Punto de reunión 4', coords: [19.0710213, -98.1692214] },
                { id: 'punto_reunion_5', nombre: 'Punto de reunión 5', coords: [19.0711573, -98.1695591] },
                { id: 'punto_reunion_6', nombre: 'Punto de reunión 6', coords: [19.0711364, -98.1700516] },
                { id: 'punto_reunion_7', nombre: 'Punto de reunión 7', coords: [19.0715955, -98.1701149] },
                { id: 'punto_reunion_8', nombre: 'Punto de reunión 8', coords: [19.0715033, -98.1695195] },
                { id: 'punto_reunion_9', nombre: 'Punto de reunión 9', coords: [19.0707574, -98.1696482] },
                { id: 'punto_reunion_10', nombre: 'Punto de reunión 10', coords: [19.0705482, -98.169085] },
                { id: 'punto_reunion_11', nombre: 'Punto de reunión 11', coords: [19.0696825, -98.1697968] },
                { id: 'punto_reunion_12', nombre: 'Punto de reunión 12', coords: [19.0698001, -98.1699993] },
                { id: 'punto_reunion_13', nombre: 'Punto de reunión 13', coords: [19.06932, -98.1700341] },
                { id: 'punto_reunion_14', nombre: 'Punto de reunión 14', coords: [19.0688891, -98.1698491] },
                { id: 'punto_reunion_15', nombre: 'Punto de reunión 15', coords: [19.0690244, -98.1693495] },
                { id: 'punto_reunion_16', nombre: 'Punto de reunión 16', coords: [19.0688621, -98.1687349] },
                { id: 'punto_reunion_17', nombre: 'Punto de reunión 17', coords: [19.0691923, -98.1687976] },
                { id: 'punto_reunion_18', nombre: 'Punto de reunión 18', coords: [19.0693267, -98.1683531] },
                { id: 'punto_reunion_19', nombre: 'Punto de reunión 19', coords: [19.0685038, -98.1691353] },
                { id: 'punto_reunion_20', nombre: 'Punto de reunión 20', coords: [19.0684584, -98.1702343] },
                { id: 'punto_reunion_21', nombre: 'Punto de reunión 21', coords: [19.0678329, -98.1695718] },
                { id: 'punto_reunion_22', nombre: 'Punto de reunión 22', coords: [19.0669092, -98.1693193] },
                { id: 'punto_reunion_23', nombre: 'Punto de reunión 23', coords: [19.066895, -98.1690675] },
                { id: 'punto_reunion_24', nombre: 'Punto de reunión 24', coords: [19.0666148, -98.1688429] },
                { id: 'punto_reunion_25', nombre: 'Punto de reunión 25', coords: [19.0661855, -98.1676316] }
            ];

            poiDataPromise = fetch('data/edificios.json')
                .then(r => {
                    if (!r.ok) throw new Error(`poi_http_${r.status}`);
                    return r.json();
                })
                .then(data => {
                    const list = [];
                    const all = [];
                    if (data && Array.isArray(data.edificios)) all.push.apply(all, data.edificios);
                    if (data && Array.isArray(data.laboratorios)) all.push.apply(all, data.laboratorios);
                    if (data && Array.isArray(data.deportivos)) all.push.apply(all, data.deportivos);
                    if (data && Array.isArray(data.canchas)) all.push.apply(all, data.canchas);

                    for (let i = 0; i < all.length; i++) {
                        const it = all[i];
                        if (!it || !Array.isArray(it.coords) || it.coords.length < 2) continue;
                        const tipos = Array.isArray(it.tipo) ? it.tipo : [it.tipo];
                        const tipoNorm = tipos.map(normalizeText);
                        const nameNorm = normalizeText(it.nombre || it.name || '');
                        const isBathroom = tipoNorm.includes('bano') || tipoNorm.includes('banos') || nameNorm.includes('bano') || nameNorm.includes('wc');
                        if (!isBathroom) continue;
                        const id = it.id != null ? `bathroom_${it.id}` : `bathroom_${i}`;
                        list.push({ id, kind: 'bathroom', nombre: it.nombre || 'Baño', coords: [it.coords[0], it.coords[1]] });
                    }

                    for (let i = 0; i < puntosReunion.length; i++) {
                        const p = puntosReunion[i];
                        list.push({ id: p.id, kind: 'meeting', nombre: p.nombre, coords: [p.coords[0], p.coords[1]] });
                    }

                    poiData = list;
                    return list;
                })
                .catch(() => {
                    poiData = puntosReunion.map(p => ({ id: p.id, kind: 'meeting', nombre: p.nombre, coords: [p.coords[0], p.coords[1]] }));
                    return poiData;
                });

            return poiDataPromise;
        }

        function distancePointToPolylineMeters(pt, line) {
            if (!pt || !line || line.length < 2) return Infinity;
            const R = 6371000;
            const lat0 = pt.lat * Math.PI / 180;
            const cos0 = Math.cos(lat0);
            function toXY(ll) {
                const latRad = ll.lat * Math.PI / 180;
                const lonRad = ll.lng * Math.PI / 180;
                return { x: lonRad * cos0 * R, y: latRad * R };
            }
            const p = toXY(pt);
            let best = Infinity;
            for (let i = 0; i < line.length - 1; i++) {
                const a = toXY(line[i]);
                const b = toXY(line[i + 1]);
                const abx = b.x - a.x;
                const aby = b.y - a.y;
                const apx = p.x - a.x;
                const apy = p.y - a.y;
                const ab2 = abx * abx + aby * aby;
                let t = 0;
                if (ab2 > 0) t = (apx * abx + apy * aby) / ab2;
                if (t < 0) t = 0;
                else if (t > 1) t = 1;
                const cx = a.x + abx * t;
                const cy = a.y + aby * t;
                const dx = p.x - cx;
                const dy = p.y - cy;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < best) best = d;
            }
            return best;
        }

        async function updateSubtlePOIs(userLL) {
            if (!mapa || !poiLayer || !userLL) return;
            const now = Date.now();
            if (lastPoiUpdateFrom && now - lastPoiUpdateTs < 3000) {
                try { if (userLL.distanceTo(lastPoiUpdateFrom) < 18) return; } catch (e) {}
            }
            lastPoiUpdateTs = now;
            lastPoiUpdateFrom = userLL;

            const data = await ensurePoiData();
            const maxDistFromUser = 180;
            const maxDistFromRoute = 35;

            const candidates = [];
            for (let i = 0; i < data.length; i++) {
                const p = data[i];
                const ll = L.latLng(p.coords[0], p.coords[1]);
                const du = userLL.distanceTo(ll);
                if (du > maxDistFromUser) continue;
                if (lastRouteLatLngs && lastRouteLatLngs.length >= 2) {
                    const dr = distancePointToPolylineMeters(ll, lastRouteLatLngs);
                    if (dr > maxDistFromRoute) continue;
                    candidates.push({ p, ll, score: du + dr * 0.5 });
                } else {
                    candidates.push({ p, ll, score: du });
                }
            }

            candidates.sort((a, b) => a.score - b.score);
            const keep = new Set();
            let keptBathrooms = 0;
            let keptMeetings = 0;
            for (let i = 0; i < candidates.length; i++) {
                const p = candidates[i].p;
                if (p.kind === 'bathroom') {
                    if (keptBathrooms >= 5) continue;
                    keptBathrooms++;
                } else {
                    if (keptMeetings >= 5) continue;
                    keptMeetings++;
                }
                keep.add(p.id);
                if (keptBathrooms >= 5 && keptMeetings >= 5) break;
            }

            for (const [id, m] of poiMarkers.entries()) {
                if (!keep.has(id)) {
                    try { poiLayer.removeLayer(m); } catch (e) {}
                    poiMarkers.delete(id);
                }
            }

            for (let i = 0; i < candidates.length; i++) {
                const c = candidates[i];
                if (!keep.has(c.p.id)) continue;
                if (poiMarkers.has(c.p.id)) continue;
                const isBathroom = c.p.kind === 'bathroom';
                const isMeeting = c.p.kind === 'meeting';
                let marker;
                if (isBathroom) {
                    marker = L.marker(c.ll, { icon: iconoBano, opacity: 0.85 })
                        .bindTooltip(c.p.nombre, { direction: 'top', opacity: 0.9, offset: [0, -10] });
                } else if (isMeeting) {
                    marker = L.marker(c.ll, { icon: iconoReunion, opacity: 0.82 })
                        .bindTooltip(c.p.nombre, { direction: 'top', opacity: 0.9, offset: [0, -10] });
                } else {
                    marker = L.circleMarker(c.ll, {
                        radius: 5,
                        color: '#27ae60',
                        weight: 2,
                        opacity: 0.6,
                        fillColor: '#27ae60',
                        fillOpacity: 0.18
                    }).bindTooltip(c.p.nombre, { direction: 'top', opacity: 0.9, offset: [0, -8] });
                }
                poiLayer.addLayer(marker);
                poiMarkers.set(c.p.id, marker);
            }
        }

        /**
         * Callback de éxito de Geolocalización.
         * Actualiza posición del usuario, distancia y rumbo.
         */
        function exitoUbicacion(pos) {
            const q = window.UbicatecLocationQuality && window.UbicatecLocationQuality.processPosition
                ? window.UbicatecLocationQuality.processPosition(pos)
                : null;
            if (q && !q.use) return;

            const latitudUsuario = q ? q.lat : pos.coords.latitude;
            const longitudUsuario = q ? q.lng : pos.coords.longitude;
            const precision = q ? q.accuracy : pos.coords.accuracy;
            if (pos && pos.coords && typeof pos.coords.heading === 'number' && Number.isFinite(pos.coords.heading)) {
                lastGeoHeadingDeg = wrap360(pos.coords.heading);
            }

            if (marcadorUsuario) {
                animateMarkerTo(marcadorUsuario, L.latLng(latitudUsuario, longitudUsuario), 700);
            } else {
                marcadorUsuario = L.marker([latitudUsuario, longitudUsuario], { icon: iconoUsuario }).addTo(mapa)
                    .bindPopup('Tu ubicación actual', { autoPan: false });
            }
            if (smoothedHeadingDeg != null) applyHeadingToUserMarker(smoothedHeadingDeg);
            else if (lastGeoHeadingDeg != null) applyHeadingToUserMarker(lastGeoHeadingDeg);

            // Actualizar círculo de precisión
            // Solo mostrar si la precisión es razonable (por ejemplo, menor a 500m)
            if (precision < 500) {
                if (circuloPrecision) {
                    circuloPrecision.setLatLng([latitudUsuario, longitudUsuario]);
                    circuloPrecision.setRadius(precision);
                } else {
                    circuloPrecision = L.circle([latitudUsuario, longitudUsuario], {
                        radius: precision,
                        color: '#3498db',
                        fillColor: '#3498db',
                        fillOpacity: 0.15,
                        weight: 1
                    }).addTo(mapa);
                }
            } else if (circuloPrecision) {
                mapa.removeLayer(circuloPrecision);
                circuloPrecision = null;
            }
            
            lastUserLL = L.latLng(latitudUsuario, longitudUsuario);
            if (!didInitialCenter) {
                didInitialCenter = true;
                mapa.setView(lastUserLL, mapa.getZoom(), { animate: true });
            }
            keepUserInView(lastUserLL);

            const userLL = lastUserLL;
            actualizarRuta(userLL);
            updateSubtlePOIs(userLL);

            const distancia = calcularDistancia(latitudUsuario, longitudUsuario, edificio.coords[0], edificio.coords[1]);
            const distFinal = Number.isFinite(distanciaRutaM) ? distanciaRutaM : distancia;
            const distTextoElem = document.getElementById('distanciaEnMapaTexto');
            if (distTextoElem) {
                distTextoElem.innerHTML = `<b>Distancia Restante: ${Math.round(distFinal)} Metros</b>`;
            } else if (distanciaEnMapaElement) {
                distanciaEnMapaElement.innerHTML = `<b>Distancia Restante: ${Math.round(distFinal)} Metros</b>`;
            }

            try {
                if (window.UbicatecVoiceNav) {
                    window.UbicatecVoiceNav.updateUserLocation(userLL, lastRouteLatLngs, distFinal);
                }
            } catch (e) {}

            // Verificar llegada
            if (distancia <= 10 && !llegadaNotificada) {
                llegadaModal.style.display = 'block';
                llegadaNotificada = true;
                try {
                    const audio = new Audio('mp3/llegada.mp3');
                    audio.volume = 0.7;
                    audio.play().catch(() => {});
                } catch (e) {}
                try {
                    if (window.UbicatecVoiceNav) {
                        window.UbicatecVoiceNav.announceArrival();
                    }
                } catch (e) {}
            }
        }

        function errorUbicacion(err) {
            console.warn('ERROR(' + err.code + '): ' + err.message);
            if (window.UbicatecLocationQuality && window.UbicatecLocationQuality.reportError) {
                window.UbicatecLocationQuality.reportError(err);
            }
            alert('No se pudo obtener la ubicación.');
        }

        try {
            navigator.geolocation.getCurrentPosition(exitoUbicacion, function () {}, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 60000
            });
        } catch (e) {}

        // Iniciar seguimiento continuo
        watchId = navigator.geolocation.watchPosition(exitoUbicacion, errorUbicacion, opcionesSeguimiento);
        mapa.invalidateSize();
    }

    /**
     * Calcula el rumbo (bearing) entre dos puntos geográficos.
     */
    function calcularRumbo(lat1, lon1, lat2, lon2) {
        const rad = Math.PI / 180;
        const lat1Rad = lat1 * rad;
        const lat2Rad = lat2 * rad;
        const dLonRad = (lon2 - lon1) * rad;

        const y = Math.sin(dLonRad) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                  Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLonRad);
        
        const brng = Math.atan2(y, x);
        return (brng * 180 / Math.PI + 360) % 360;
    }

    /**
     * Calcula la distancia en metros entre dos puntos (Fórmula Haversine).
     */
    function calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Radio de la tierra en metros
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // --- SIMULADOR DE RUTA PARA DEPURACION (Fluido estilo Waze - EDIFICIO) ---
    (function initSimulatorEdificio() {
        if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
        
        const simBtn = document.createElement('button');
        simBtn.id = 'ubSimBtnEdificio';
        simBtn.innerHTML = '&#9654; Simular Recorrido';
        simBtn.style.cssText = 'position: fixed; top: 70px; right: 70px; z-index: 9999; padding: 10px 16px; background: #e74c3c; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: none; transition: all 0.3s;';
        document.body.appendChild(simBtn);

        let simAnimFrame = null;
        let simPoints = [];
        let simTramoIdx = 0;
        let simStart = null;
        const DURACION_TRAMO = 600;

        function stopSimulation() {
            if (simAnimFrame) cancelAnimationFrame(simAnimFrame);
            simAnimFrame = null;
            simTramoIdx = 0;
            simStart = null;
            simBtn.innerHTML = '&#9654; Simular Recorrido';
            simBtn.style.background = '#e74c3c';
        }

        function interpolatePoints(points, stepMeters) {
            const res = [];
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i+1];
                const d = calcularDistancia(p1.lat, p1.lng, p2.lat, p2.lng);
                const steps = Math.max(1, Math.floor(d / stepMeters));
                for (let j = 0; j < steps; j++) {
                    const f = j / steps;
                    res.push(L.latLng(
                        p1.lat + (p2.lat - p1.lat) * f,
                        p1.lng + (p2.lng - p1.lng) * f
                    ));
                }
            }
            res.push(points[points.length - 1]);
            return res;
        }

        function calcularRumboSim(p1, p2) {
            var d2r = Math.PI / 180;
            var r2d = 180 / Math.PI;
            var lat1 = p1.lat * d2r;
            var lat2 = p2.lat * d2r;
            var dLon = (p2.lng - p1.lng) * d2r;
            var y = Math.sin(dLon) * Math.cos(lat2);
            var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
            var bearing = Math.atan2(y, x) * r2d;
            return (bearing + 360) % 360;
        }

        function animar(timestamp) {
            if (!simStart) simStart = timestamp;
            const progress = timestamp - simStart;
            const percent = Math.min(progress / DURACION_TRAMO, 1);

            if (simTramoIdx >= simPoints.length - 1) {
                stopSimulation();
                return;
            }

            const p1 = simPoints[simTramoIdx];
            const p2 = simPoints[simTramoIdx + 1];

            const lat = p1.lat + (p2.lat - p1.lat) * percent;
            const lng = p1.lng + (p2.lng - p1.lng) * percent;
            const u = L.latLng(lat, lng);

            try {
                // Inyectar CSS del marcador si no existe
                if (!document.getElementById('ub-sim-marker-css')) {
                    var css = document.createElement('style');
                    css.id = 'ub-sim-marker-css';
                    css.textContent = '.user-marker-container{display:flex;align-items:center;justify-content:center}.user-marker-arrow{width:32px;height:32px;background:linear-gradient(135deg,#3498db 0%,#2980b9 100%);border-radius:50%;border:3px solid white;box-shadow:0 0 14px rgba(52,152,219,0.5),0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;transition:transform 0.15s ease-out}';
                    document.head.appendChild(css);
                }

                var rumbo = calcularRumboSim(p1, p2);
                var iconHtml = '<div class="user-marker-arrow" style="transform:rotate(' + rumbo + 'deg)"><i class="fas fa-location-arrow" style="transform:rotate(-45deg)"></i></div>';
                var simIcon = L.divIcon({
                    className: 'user-marker-container',
                    html: iconHtml,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                if (marcadorUsuario) {
                    marcadorUsuario.setLatLng(u);
                    marcadorUsuario.setIcon(simIcon);
                } else if (mapa) {
                    marcadorUsuario = L.marker(u, { icon: simIcon, zIndexOffset: 1000 }).addTo(mapa);
                }

                if (Math.floor(progress / 33) % 5 === 0 && mapa) {
                    mapa.panTo(u, { animate: true, duration: 0.2 });
                }

                if (percent >= 1) {
                    simTramoIdx++;
                    simStart = null;

                    const destLL = lastRouteLatLngs[lastRouteLatLngs.length - 1];
                    const dist = calcularDistancia(u.lat, u.lng, destLL.lat, destLL.lng);
                    
                    if (window.UbicatecVoiceNav) {
                        window.UbicatecVoiceNav.updateUserLocation(u, lastRouteLatLngs, dist);
                    }
                }

                if (simTramoIdx < simPoints.length - 1) {
                    simAnimFrame = requestAnimationFrame(animar);
                } else {
                    stopSimulation();
                }
            } catch(e) {
                console.error("Error en simulador:", e);
                stopSimulation();
            }
        }

        simBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (simAnimFrame) {
                stopSimulation();
                return;
            }

            if (!lastRouteLatLngs || lastRouteLatLngs.length < 2) {
                alert("No hay ruta trazada activa.");
                return;
            }

            simPoints = interpolatePoints(lastRouteLatLngs, 2.5);
            simTramoIdx = 0;
            simStart = null;
            
            simBtn.innerHTML = '&#9209; Detener Simulacion';
            simBtn.style.background = '#c0392b';

            simAnimFrame = requestAnimationFrame(animar);
        });

        setInterval(function() {
            if (lastRouteLatLngs && lastRouteLatLngs.length >= 2) {
                if (simBtn.style.display === 'none') simBtn.style.display = 'block';
            } else {
                if (simBtn.style.display === 'block') {
                    simBtn.style.display = 'none';
                    stopSimulation();
                }
            }
        }, 1000);
    })();
}

let aframeScriptLoadingEdificio = false;
function ensureAFrameLoadedEdificio(callback) {
    if (window.AFRAME) {
        if (typeof callback === 'function') callback();
        return;
    }
    if (aframeScriptLoadingEdificio) {
        const checkInterval = setInterval(function () {
            if (window.AFRAME) {
                clearInterval(checkInterval);
                if (typeof callback === 'function') callback();
            }
        }, 100);
        return;
    }
    aframeScriptLoadingEdificio = true;
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.onload = function () {
        aframeScriptLoadingEdificio = false;
        if (typeof callback === 'function') callback();
    };
    script.onerror = function () {
        aframeScriptLoadingEdificio = false;
    };
    document.head.appendChild(script);
}

/**
 * Inicializa el visor de imágenes 360° usando A-Frame.
 * @param {string} imagen360 - URL o ruta de la imagen panorámica
 */
function initialize360Viewer(imagen360) {
    // Crear el modal para el visor 360° dinámicamente
    const modal360 = document.createElement('div');
    modal360.id = 'modal360';
    modal360.className = 'modal';
    modal360.style.display = 'none';
    modal360.innerHTML = `
        <div class="modal-content">
            <span class="close-button" id="cerrar360Btn" style="position: absolute; top: 10px; right: 20px; font-size: 30px; cursor: pointer; z-index: 1002; color: white;">&times;</span>
            <div id="viewer360" style="width: 100%; height: 100%;"></div>
        </div>
    `;
    document.body.appendChild(modal360);

    // Event listeners para el visor
    const ver360Btn = document.getElementById('ver360Btn');
    const cerrar360Btn = document.getElementById('cerrar360Btn');

    ver360Btn.addEventListener('click', () => {
        modal360.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Bloquear scroll de fondo

        // Limpiar contenedor anterior
        const viewerContainer = document.getElementById('viewer360');
        viewerContainer.innerHTML = '';

        // Crear contenedor interno
        const psvContainer = document.createElement('div');
        psvContainer.id = 'psv-container';
        psvContainer.style.width = '100%';
        psvContainer.style.height = '100%';
        viewerContainer.appendChild(psvContainer);

        // Mostrar estado de carga
        psvContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #000; color: white;">
                <div style="text-align: center;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <p>Cargando visor 360°...</p>
                    <p style="font-size: 12px; color: #ccc;">Imagen: ${imagen360}</p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        ensureAFrameLoadedEdificio(() => {
            // Inicializar visor 360° personalizado con A-Frame
            setTimeout(() => {
                try {
                    console.log('Inicializando visor 360° personalizado...');

                    // Convertir ruta relativa a absoluta si es necesario
                    const imageUrl = imagen360.startsWith('http') ? imagen360 : window.location.origin + '/' + imagen360;

                    // Crear escena A-Frame
                    psvContainer.innerHTML = `
                        <div id="viewer360" style="width: 100%; height: 100%; position: relative; overflow: hidden; background: #000;">
                            <div id="loading360" style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; color: #6c757d;">
                                <div style="text-align: center;">
                                    <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                                    <p class="mt-3">Cargando visor 360°...</p>
                                    <p><small>URL: ${imageUrl}</small></p>
                                </div>
                            </div>
                            <a-scene id="aframe360" style="display: none; width: 100%; height: 100%;" embedded>
                                <a-sky src="${imageUrl}" rotation="0 0 0"></a-sky>
                                <a-camera position="0 0 0" rotation="0 0 0">
                                    <a-cursor></a-cursor>
                                </a-camera>
                            </a-scene>
                            <img id="hiddenImage360" src="${imageUrl}" style="display: none;" 
                                 onload="handleImageLoad()" 
                                 onerror="handleImageError('${imageUrl}')" />
                            <div id="controls360" style="position: absolute; top: 10px; right: 10px; z-index: 1000; display: none;">
                                <button id="reset360" style="background: rgba(0,0,0,0.7); color: white; border: none; padding: 10px; margin: 2px; border-radius: 5px; cursor: pointer;" title="Resetear">⌂</button>
                            </div>
                            <div id="instructions360" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 10px; border-radius: 5px; font-size: 12px; display: none;">
                                Arrastra para rotar • Rueda del mouse para zoom • Click en controles
                            </div>
                        </div>
                        <style>
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        </style>
                    `;

                    // Inicializar controles 360°
                    initialize360Controls();

                } catch (error) {
                    console.error('Error al inicializar visor 360°:', error);
                    psvContainer.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; color: #6c757d;">
                            <div style="text-align: center;">
                                <h4>Error al cargar la vista 360°</h4>
                                <p>Error: ${error.message}</p>
                                <p>Imagen: ${imagen360}</p>
                                <button onclick="location.reload()" class="btn btn-primary">Reintentar</button>
                            </div>
                        </div>
                    `;
                }
            }, 500);
        });
    });


    // Función para cerrar el modal y limpiar A-Frame
    function close360Modal() {
        modal360.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restaurar scroll
        
        // Limpiar clases que A-Frame añade al html/body
        document.documentElement.classList.remove('a-fullscreen');
        document.body.classList.remove('a-fullscreen');

        // Limpiar el visor al cerrar para liberar memoria
        const viewerContainer = document.getElementById('viewer360');
        if (viewerContainer) {
            viewerContainer.innerHTML = '';
        }
    }

    cerrar360Btn.addEventListener('click', close360Modal);

    // Cerrar al hacer clic fuera del modal
    modal360.addEventListener('click', (e) => {
        if (e.target === modal360) {
            close360Modal();
        }
    });
}

function showError(message) {
    document.getElementById('edificio-content').innerHTML = `
        <div class="text-center py-5">
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error</h4>
                <p>${message}</p>
                <hr>
                <a href="aula.html" class="btn btn-primary">Volver al mapa</a>
            </div>
        </div>
    `;
}

/**
 * Inicializa los controles de la cámara A-Frame.
 */
window.initialize360Controls = function () {
    const aframeScene = document.getElementById('aframe360');
    const sky = aframeScene ? aframeScene.querySelector('a-sky') : null;
    const camera = aframeScene ? aframeScene.querySelector('a-camera') : null;
    const resetBtn = document.getElementById('reset360');

    if (!aframeScene || !sky || !camera) {
        return;
    }

    console.log('Inicializando controles 360° con A-Frame...');

    // Reset posición
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            sky.setAttribute('rotation', '0 0 0');
            camera.setAttribute('rotation', '0 0 0');
            camera.setAttribute('position', '0 0 0');
        });
    }
};

/**
 * Maneja la carga exitosa de la imagen 360.
 */
function handleImageLoad() {
    const loading = document.getElementById('loading360');
    const aframeScene = document.getElementById('aframe360');
    const controls = document.getElementById('controls360');
    const instructions = document.getElementById('instructions360');

    if (loading) loading.style.display = 'none';
    if (aframeScene) aframeScene.style.display = 'block';
    if (controls) controls.style.display = 'block';
    if (instructions) instructions.style.display = 'block';

    // Inicializar controles después de que la escena se muestre
    setTimeout(() => {
        initialize360Controls();
    }, 100);
}

/**
 * Maneja errores de carga de la imagen 360.
 */
function handleImageError(imageUrl) {
    console.error('Error al cargar la imagen 360°:', imageUrl);
    const loading = document.getElementById('loading360');
    if (loading) {
        loading.innerHTML = `
            <div style="text-align: center;">
                <h4>Error al cargar la imagen 360°</h4>
                <p>No se pudo cargar la imagen</p>
                <p><small>URL: ${imageUrl}</small></p>
                <button onclick="location.reload()" class="btn btn-primary">Reintentar</button>
            </div>
        `;
    }
}
