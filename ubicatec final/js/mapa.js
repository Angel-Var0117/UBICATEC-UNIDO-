/**
 * Lógica principal del mapa interactivo con Leaflet.
 * Maneja la carga de datos de edificios, creación de marcadores,
 * filtrado y búsqueda.
 */

$(document).ready(function () {
    // Verificar que el contenedor del mapa existe para evitar errores en otras páginas
    var mapContainer = document.getElementById('map');
    if (!mapContainer) {
        return;
    }

    /**
     * Obtiene los parámetros de la URL (edificio y coordenadas)
     * para permitir compartir ubicaciones específicas.
     * @returns {Object} Objeto con propiedades 'edificio' y 'coords'
     */
    function obtenerParametrosURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            edificio: urlParams.get('edificio'),
            coords: urlParams.get('coords')
        };
    }

    /**
     * Centra el mapa en unas coordenadas específicas y abre el popup del edificio correspondiente.
     * @param {string} coords - Coordenadas en formato "lat,lng"
     * @param {string|number} edificio - ID o número del edificio
     */
    function centrarMapaEnCoordenadas(coords, edificio) {
        if (coords && window.map) {
            const [lat, lng] = coords.split(',').map(coord => parseFloat(coord.trim()));

            // Centrar el mapa con animación
            window.map.setView([lat, lng], 19, {
                animate: true,
                duration: 1.5
            });

            // Buscar y mostrar el marcador del edificio si los datos ya están cargados
            if (window.markersData && edificio) {
                const edificioEncontrado = window.markersData.find(data => {
                    const nombreEdificio = data.name.toLowerCase();
                    const match = nombreEdificio.match(/edificio (\d+)/);
                    return match && match[1] === edificio.toString();
                });

                if (edificioEncontrado) {
                    // Mostrar solo este marcador filtrando los demás
                    window.edificioMarkers.clearLayers();
                    window.edificioMarkers.addLayer(edificioEncontrado.marker);
                }
            }
        }
    }

    function ensureGeoNotice() {
        var existing = document.getElementById('ubGeoNotice');
        if (existing) return existing;
        var notice = document.createElement('div');
        notice.id = 'ubGeoNotice';
        notice.className = 'ub-geo-notice';
        notice.setAttribute('role', 'status');
        notice.setAttribute('aria-live', 'polite');
        notice.style.display = 'none';
        notice.innerHTML = [
            '<div class="ub-geo-notice__icon" aria-hidden="true"><i class="fas fa-location-crosshairs"></i></div>',
            '<div class="ub-geo-notice__content">',
            '  <div class="ub-geo-notice__title">Ubicación no disponible</div>',
            '  <div class="ub-geo-notice__body" id="ubGeoNoticeBody">Estamos esperando tu ubicación para mostrar la ruta y los puntos cercanos.</div>',
            '</div>',
            '<button type="button" class="ub-geo-notice__close" id="ubGeoNoticeClose" aria-label="Cerrar aviso">&times;</button>'
        ].join('');
        document.body.appendChild(notice);
        var closeBtn = notice.querySelector('#ubGeoNoticeClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                notice.style.display = 'none';
            });
        }
        return notice;
    }

    function showGeoNotice(message) {
        var notice = ensureGeoNotice();
        var body = notice.querySelector('#ubGeoNoticeBody');
        if (body) body.textContent = message || 'Estamos esperando tu ubicación para mostrar la ruta y los puntos cercanos.';
        notice.style.display = 'flex';
        clearTimeout(window.__ubGeoNoticeTimer);
        window.__ubGeoNoticeTimer = setTimeout(function () {
            if (notice) notice.style.display = 'none';
        }, 9000);
    }

    function hideGeoNotice() {
        var notice = document.getElementById('ubGeoNotice');
        if (notice) notice.style.display = 'none';
        clearTimeout(window.__ubGeoNoticeTimer);
        window.__ubGeoNoticeTimer = null;
    }

    function startUserLocationTracking(map) {
        if (!map || !navigator.geolocation || !window.L) return;
        var prev = window.ubUserLocation;
        if (prev && prev.watchId != null) {
            try { navigator.geolocation.clearWatch(prev.watchId); } catch (e) {}
        }
        var layer = (prev && prev.layer) ? prev.layer : L.layerGroup().addTo(map);
        try { layer.clearLayers(); } catch (e) {}

        function wrap360(deg) {
            var n = Number(deg);
            if (!Number.isFinite(n)) return null;
            var x = n % 360;
            if (x < 0) x += 360;
            return x;
        }

        function angleDeltaDeg(fromDeg, toDeg) {
            var a = wrap360(fromDeg);
            var b = wrap360(toDeg);
            if (a == null || b == null) return 0;
            var d = b - a;
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
            var raw = 360 - e.alpha;
            return wrap360(raw + getScreenAngleDeg());
        }

        function applyHeadingToUserIcon(deg) {
            var d = wrap360(deg);
            if (d == null) return;
            var m = window.ubUserLocation && window.ubUserLocation.marker ? window.ubUserLocation.marker : null;
            if (!m || !m.getElement) return;
            var el = m.getElement();
            if (!el) return;
            var img = el.querySelector('.ub-user-location__img');
            if (!img) return;
            img.style.transform = 'rotate(' + d + 'deg)';
        }

        function applySmoothHeading(state, targetDeg, alpha, maxDeltaPerSample) {
            if (!state) return;
            var t = wrap360(targetDeg);
            if (t == null) return;
            if (state.smoothed == null) state.smoothed = t;
            else {
                var d = angleDeltaDeg(state.smoothed, t);
                if (Number.isFinite(maxDeltaPerSample)) {
                    if (d > maxDeltaPerSample) d = maxDeltaPerSample;
                    else if (d < -maxDeltaPerSample) d = -maxDeltaPerSample;
                }
                state.smoothed = wrap360(state.smoothed + d * (Number.isFinite(alpha) ? alpha : 0.15));
            }
            applyHeadingToUserIcon(state.smoothed);
        }

        function ensureUserHeadingTracking() {
            if (window.__ubUserHeading && window.__ubUserHeading.listening) return;
            if (!('DeviceOrientationEvent' in window)) return;
            var state = window.__ubUserHeading || { smoothed: null, listening: false, eventName: null, onEvent: null };
            var onEvent = function (e) {
                var h = computeHeadingFromOrientationEvent(e);
                if (h == null) return;
                applySmoothHeading(state, h, 0.18, 28);
            };
            var attach = function () {
                if (state.listening) return;
                state.eventName = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
                state.onEvent = onEvent;
                window.addEventListener(state.eventName, state.onEvent, true);
                state.listening = true;
                window.__ubUserHeading = state;
            };
            try {
                if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
                    if (window.__ubUserHeadingArmed) return;
                    window.__ubUserHeadingArmed = true;
                    var ask = function () {
                        document.removeEventListener('click', ask, true);
                        window.DeviceOrientationEvent.requestPermission()
                            .then(function (s) { if (s === 'granted') attach(); })
                            .catch(function () {});
                    };
                    document.addEventListener('click', ask, true);
                    return;
                }
            } catch (e) {}
            attach();
        }

        window.ubicatecEnsureUserHeadingTracking = ensureUserHeadingTracking;

        var userIcon = L.divIcon({
            className: 'ub-user-location',
            html: '<img class="ub-user-location__img" src="Icon/mark.png" alt="" />',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        var initialLL = map.getCenter ? map.getCenter() : [0, 0];
        var marker = L.marker(initialLL, { icon: userIcon, keyboard: false })
            .bindTooltip('Buscando tu ubicación...', { direction: 'top', offset: [0, -14] });

        var accuracy = L.circle(initialLL, {
            color: '#2d7ff9',
            weight: 1,
            fillColor: '#2d7ff9',
            fillOpacity: 0.15
        });

        layer.addLayer(accuracy);
        layer.addLayer(marker);

        var firstFix = true;
        var firstFixTimer = null;
        function notifyPosition(pos, llArr) {
            try {
                window.ubUserLocation = window.ubUserLocation || {};
                window.ubUserLocation.lastPos = pos || null;
                window.ubUserLocation.lastLL = llArr || null;
            } catch (e) {}
            hideGeoNotice();
            try {
                if (window.__ubUserHeading && window.__ubUserHeading.smoothed != null) {
                    applyHeadingToUserIcon(window.__ubUserHeading.smoothed);
                } else if (pos && pos.coords && typeof pos.coords.heading === 'number' && Number.isFinite(pos.coords.heading)) {
                    var spd = (typeof pos.coords.speed === 'number' && Number.isFinite(pos.coords.speed)) ? pos.coords.speed : 0;
                    if (spd >= 0.85) {
                        var gpsState = window.__ubGpsHeading || { smoothed: null };
                        window.__ubGpsHeading = gpsState;
                        applySmoothHeading(gpsState, pos.coords.heading, 0.16, 18);
                    }
                }
            } catch (e) {}
            try {
                if (window.ubInMapNav && typeof window.ubInMapNav.onPos === 'function') {
                    window.ubInMapNav.onPos(pos, llArr);
                }
            } catch (e) {}
        }

        try {
            navigator.geolocation.getCurrentPosition(function (pos) {
                var ll = [pos.coords.latitude, pos.coords.longitude];
                marker.setLatLng(ll);
                accuracy.setLatLng(ll);
                accuracy.setRadius(Math.max(10, pos.coords.accuracy || 0));
                notifyPosition(pos, ll);
                if (firstFix) {
                    firstFix = false;
                    if (firstFixTimer) {
                        clearTimeout(firstFixTimer);
                        firstFixTimer = null;
                    }
                    try { map.setView(ll, Math.max(map.getZoom(), 18), { animate: true, duration: 1.0 }); } catch (e) {}
                    try { if (marker.getTooltip && marker.getTooltip()) marker.getTooltip().setContent('Estás aquí'); } catch (e) {}
                    try { marker.openTooltip(); setTimeout(function () { marker.closeTooltip(); }, 2500); } catch (e) {}
                }
            }, function () {
                showGeoNotice('No pudimos obtener tu ubicación inicial. Activa el GPS y los permisos de ubicación.');
            }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 });
        } catch (e) {}
        var watchId = navigator.geolocation.watchPosition(function (pos) {
            var ll = [pos.coords.latitude, pos.coords.longitude];
            marker.setLatLng(ll);
            accuracy.setLatLng(ll);
            accuracy.setRadius(Math.max(10, pos.coords.accuracy || 0));
            notifyPosition(pos, ll);
            if (firstFix) {
                firstFix = false;
                if (firstFixTimer) {
                    clearTimeout(firstFixTimer);
                    firstFixTimer = null;
                }
                try { map.setView(ll, Math.max(map.getZoom(), 18), { animate: true, duration: 1.0 }); } catch (e) {}
                try { if (marker.getTooltip && marker.getTooltip()) marker.getTooltip().setContent('Estás aquí'); } catch (e) {}
                try { marker.openTooltip(); setTimeout(function () { marker.closeTooltip(); }, 2500); } catch (e) {}
            }
        }, function () {
            try { window.ubicatecTrack && window.ubicatecTrack('geo_error', { label: 'user_dot' }); } catch {}
            showGeoNotice('No pudimos recibir tu ubicación. Revisa permisos, GPS o intenta de nuevo.');
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 });

        firstFixTimer = setTimeout(function () {
            if (firstFix) {
                showGeoNotice('Seguimos esperando tu ubicación. Activa GPS y permisos para ver la ruta y los puntos cercanos.');
            }
        }, 8000);

        window.ubUserLocation = Object.assign({}, window.ubUserLocation || {}, { watchId: watchId, layer: layer, marker: marker, accuracy: accuracy });
        ensureUserHeadingTracking();
        try {
            if (window.__ubUserHeading && window.__ubUserHeading.smoothed != null) {
                applyHeadingToUserIcon(window.__ubUserHeading.smoothed);
            }
        } catch (e) {}
    }

    // Inicializar el mapa con un pequeño retraso para asegurar que el contenedor tiene dimensiones
    setTimeout(function () {
        // Obtener parámetros iniciales de URL
        const params = obtenerParametrosURL();

        // Configuración inicial del mapa Leaflet
        var map = L.map('map', {
            zoomControl: false, // Desactivar zoom por defecto para reubicarlo
            dragging: true
        }).setView([19.0698, -98.1688], 18); // Coordenadas iniciales (Campus ITP)
        
        var cancelControl = L.control({ position: 'topright' });
        cancelControl.onAdd = function () {
            var container = L.DomUtil.create('div', 'ub-nav-cancel leaflet-bar');
            var btn = L.DomUtil.create('button', 'ub-nav-cancel__btn', container);
            btn.type = 'button';
            btn.title = 'Cancelar trayecto';
            btn.setAttribute('aria-label', 'Cancelar trayecto');
            btn.textContent = '✕';
            container.style.display = 'none';
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(btn, 'click', function (e) {
                L.DomEvent.stop(e);
                if (typeof window.ubicatecRequestCancelInMapNav === 'function') window.ubicatecRequestCancelInMapNav();
            });
            window.ubNavCancelEl = container;
            return container;
        };
        cancelControl.addTo(map);

        // Capa de mapa base (OpenStreetMap)
        var calle = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            minZoom: 15,
            attribution: '&copy; OpenStreetMap contributors'
        });

        calle.addTo(map);

        // Hacer el mapa accesible globalmente
        window.map = map;
        try { window.ubicatecTrack && window.ubicatecTrack('map_open'); } catch {}
        startUserLocationTracking(map);

        // Cargar datos asíncronamente y crear marcadores
        cargarDatos().then(function(datos) {
            window.edificios = datos; // Guardar datos globalmente
            crearMarcadores(map, datos);

            // Si hay parámetros de URL, ejecutar la acción de centrado
            if (params.coords && params.edificio) {
                centrarMapaEnCoordenadas(params.coords, params.edificio);
            }
        });
    }, 100);

    // Datos hardcoded de accesos al campus (en caso de no estar en el JSON)
    var accesos = [
        { nombre: "Acceso principal (Avenida Tecnologico)", coords: [19.069821422656712, -98.17042957607508], tipo: "acceso" },
        { nombre: "Acceso Visitantes (Avenida Tecnologico, Frente a Sears)", coords: [19.068467599492795, -98.17061388514823], tipo: "acceso" },
        { nombre: "Acceso Hangar Autobuses y Estacionamiento 3 (Avenida Tecnologico, a un costado de Benteler)", coords: [19.067184781628676, -98.17086525607026], tipo: "acceso" },
        { nombre: "Acceso Estacionamiento 2 (Colonia Maravillas)", coords: [19.069943796103818, -98.16710196647787], tipo: "acceso" },
        { nombre: "Acceso Estudiantes (Colonia Maravillas)", coords: [19.07051268473509, -98.16772933097631], tipo: "acceso" },
        { nombre: "Acceso Estacionamiento 1 (Avenida Tecnologico)", coords: [19.070712336989462, -98.1703082196594], tipo: "acceso" }
    ];
    // Puntos de reunión (coordenadas oficiales)
    var puntosReunion = [
        { id: "punto_reunion_1", nombre: "Punto de reunión 1", coords: [19.0707691, -98.1684754], tipo: "punto_reunion" },
        { id: "punto_reunion_2", nombre: "Punto de reunión 2", coords: [19.0708372, -98.1688298], tipo: "punto_reunion" },
        { id: "punto_reunion_3", nombre: "Punto de reunión 3", coords: [19.0709218, -98.1692499], tipo: "punto_reunion" },
        { id: "punto_reunion_4", nombre: "Punto de reunión 4", coords: [19.0710213, -98.1692214], tipo: "punto_reunion" },
        { id: "punto_reunion_5", nombre: "Punto de reunión 5", coords: [19.0711573, -98.1695591], tipo: "punto_reunion" },
        { id: "punto_reunion_6", nombre: "Punto de reunión 6", coords: [19.0711364, -98.1700516], tipo: "punto_reunion" },
        { id: "punto_reunion_7", nombre: "Punto de reunión 7", coords: [19.0715955, -98.1701149], tipo: "punto_reunion" },
        { id: "punto_reunion_8", nombre: "Punto de reunión 8", coords: [19.0715033, -98.1695195], tipo: "punto_reunion" },
        { id: "punto_reunion_9", nombre: "Punto de reunión 9", coords: [19.0707574, -98.1696482], tipo: "punto_reunion" },
        { id: "punto_reunion_10", nombre: "Punto de reunión 10", coords: [19.0705482, -98.1690850], tipo: "punto_reunion" },
        { id: "punto_reunion_11", nombre: "Punto de reunión 11", coords: [19.0696825, -98.1697968], tipo: "punto_reunion" },
        { id: "punto_reunion_12", nombre: "Punto de reunión 12", coords: [19.0698001, -98.1699993], tipo: "punto_reunion" },
        { id: "punto_reunion_13", nombre: "Punto de reunión 13", coords: [19.0693200, -98.1700341], tipo: "punto_reunion" },
        { id: "punto_reunion_14", nombre: "Punto de reunión 14", coords: [19.0688891, -98.1698491], tipo: "punto_reunion" },
        { id: "punto_reunion_15", nombre: "Punto de reunión 15", coords: [19.0690244, -98.1693495], tipo: "punto_reunion" },
        { id: "punto_reunion_16", nombre: "Punto de reunión 16", coords: [19.0688621, -98.1687349], tipo: "punto_reunion" },
        { id: "punto_reunion_17", nombre: "Punto de reunión 17", coords: [19.0691923, -98.1687976], tipo: "punto_reunion" },
        { id: "punto_reunion_18", nombre: "Punto de reunión 18", coords: [19.0693267, -98.1683531], tipo: "punto_reunion" },
        { id: "punto_reunion_19", nombre: "Punto de reunión 19", coords: [19.0685038, -98.1691353], tipo: "punto_reunion" },
        { id: "punto_reunion_20", nombre: "Punto de reunión 20", coords: [19.0684584, -98.1702343], tipo: "punto_reunion" },
        { id: "punto_reunion_21", nombre: "Punto de reunión 21", coords: [19.0678329, -98.1695718], tipo: "punto_reunion" },
        { id: "punto_reunion_22", nombre: "Punto de reunión 22", coords: [19.0669092, -98.1693193], tipo: "punto_reunion" },
        { id: "punto_reunion_23", nombre: "Punto de reunión 23", coords: [19.0668950, -98.1690675], tipo: "punto_reunion" },
        { id: "punto_reunion_24", nombre: "Punto de reunión 24", coords: [19.0666148, -98.1688429], tipo: "punto_reunion" },
        { id: "punto_reunion_25", nombre: "Punto de reunión 25", coords: [19.0661855, -98.1676316], tipo: "punto_reunion" }
    ];

    /**
     * Carga los datos de edificios desde un archivo JSON local.
     * @returns {Promise<Array>} Promesa que resuelve con el array de todos los puntos de interés.
     */
    function cargarDatos() {
        return fetch('data/edificios.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error("HTTP error " + response.status);
                }
                return response.json();
            })
            .then(data => {
                var todosLosEdificios = [];
                
                // Procesar lista de edificios principales
                if (data.edificios) {
                    data.edificios.forEach(e => {
                        e.link = "edificio.html?id=" + e.id;
                        todosLosEdificios.push(e);
                    });
                }
                
                // Procesar lista de canchas deportivas
                if (data.canchas) {
                    data.canchas.forEach(c => {
                        c.link = "edificio.html?id=" + c.id;
                        todosLosEdificios.push(c);
                    });
                }
                
                // Agregar accesos hardcoded
                accesos.forEach(a => todosLosEdificios.push(a));
                // Agregar puntos de reunión
                puntosReunion.forEach(p => {
                    todosLosEdificios.push({
                        id: p.id,
                        nombre: p.nombre,
                        descripcion: p.descripcion || "Punto de reunión",
                        coords: p.coords,
                        tipo: p.tipo
                    });
                });
                
                return todosLosEdificios;
            })
            .catch(error => {
                console.error("Error al cargar data/edificios.json:", error);
                // Fallback: retornar solo accesos si falla la carga del JSON
                return accesos;
            });
    }

    /**
     * Crea un icono personalizado de Leaflet (DivIcon) basado en el tipo de edificio.
     * @param {string} tipo - Tipo de edificio (aula, laboratorio, etc.)
     * @returns {L.DivIcon} Objeto icono de Leaflet
     */
    function crearIconoPersonalizado(tipo) {
        // Configuración de colores e iconos por tipo
        var colores = {
            'aula': { color: '#3498db', icono: 'school.svg' },
            'laboratorio': { color: '#27ae60', icono: 'microscope.svg' },
            'administrativo': { color: '#e67e22', icono: 'building.svg' },
            'baño': { color: '#9b59b6', icono: 'toilet-paper.svg' },
            'acceso': { color: '#e74c3c', icono: 'door.svg' },
            'deportivo': { color: '#2ecc71', icono: 'sport.svg' },
            'otro': { color: '#95a5a6', icono: 'tools.svg' }
        };

        if (tipo === 'punto_reunion') {
            return L.icon({
                iconUrl: 'img/reunion.png',
                iconSize: [29, 29],
                iconAnchor: [14, 14],
                popupAnchor: [0, -14],
                className: 'custom-marker marker-punto-reunion'
            });
        }
        var config = colores[tipo] || colores['otro'];
        return L.divIcon({
            className: 'custom-marker marker-' + tipo,
            html: '<div style="background-color: ' + config.color + '; border: 3px solid ' + config.color + '; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;"><img src="Icon/tabler/' + config.icono + '" alt="' + tipo + '" style="width: 16px; height: 16px; filter: brightness(0) invert(1);" /></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
    }

    /**
     * Procesa los datos y crea los marcadores en el mapa.
     * @param {L.Map} map - Instancia del mapa Leaflet
     * @param {Array} datosEdificios - Array de objetos de edificios
     */
    function crearMarcadores(map, datosEdificios) {
        var markersData = [];
        datosEdificios.forEach(function (edificio) {
            var icono = crearIconoPersonalizado(edificio.tipo);
            var marker = L.marker(edificio.coords, { icon: icono });
            
            var nombre = edificio.nombre || "Sin nombre";
            
            // Tooltip permanente con el nombre
            marker.bindTooltip(nombre, {
                permanent: true,
                direction: 'top',
                className: 'custom-tooltip'
            });
            
            // Redirección al hacer click
            if (edificio.link) {
                marker.on('click', function () {
                    try { window.ubicatecTrack && window.ubicatecTrack('map_marker_click', { label: nombre }); } catch {}
                    try { window.__UB_LAST_GEO_LABEL = nombre; } catch {}
                    if (typeof window.ubicatecOpenBuildingSheet === 'function') {
                        window.ubicatecOpenBuildingSheet(edificio);
                    } else {
                        setTimeout(function () {
                            window.location.href = edificio.link;
                        }, 250);
                    }
                });
            }
            // Acción para puntos de reunión: abrir modal con opción "Ir ahí"
            if (edificio.tipo === 'punto_reunion') {
                marker.on('click', function () {
                    var ll = L.latLng(edificio.coords[0], edificio.coords[1]);
                    try { window.ubicatecTrack && window.ubicatecTrack('map_meeting_point_open', { label: nombre }); } catch {}
                    try { window.__UB_LAST_GEO_LABEL = nombre; } catch {}
                    showUbPRModal(ll, nombre);
                });
            }
            
            // Extraer ID para búsquedas
            var id = edificio.id ? edificio.id.toString() : null;
            if (!id && edificio.link) {
                var matchId = edificio.link.match(/id=(\d+)/);
                if (matchId) {
                    id = matchId[1];
                }
            }
            
            var descripcion = edificio.descripcion || "";
            
            // Almacenar metadatos del marcador para búsquedas y filtrado
            markersData.push({ 
                marker: marker, 
                name: nombre.toLowerCase(), 
                tipo: edificio.tipo, 
                id: id,
                descripcion: normalizeText(descripcion),
                originalData: edificio 
            });
        });

        // Grupo de capas para gestionar los marcadores
        var edificioMarkers = L.layerGroup();
        markersData.forEach(function (data) {
            edificioMarkers.addLayer(data.marker);
        });

        edificioMarkers.addTo(map);

        // Exponer datos globalmente
        window.markersData = markersData;
        window.edificioMarkers = edificioMarkers;

        // Iniciar con el mapa limpio (los filtros/búsqueda mostrarán los marcadores)
        window.edificioMarkers.clearLayers();
    }

    /**
     * Utilidad para normalizar texto (quitar acentos y minúsculas)
     * @param {string} text 
     * @returns {string} Texto normalizado
     */
    function normalizeText(text) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    /**
     * Actualiza los marcadores visibles según la búsqueda y el filtro seleccionado.
     * @param {string} query - Texto de búsqueda
     * @param {string} selectedFilter - Categoría seleccionada
     */
    function updateMarkers(query, selectedFilter) {
        if (!window.edificioMarkers || !window.markersData) {
            return;
        }

        window.edificioMarkers.clearLayers();
        
        // Mostrar solo si hay interacción (búsqueda o filtro)
        if (query || selectedFilter !== '') { 
            var normalizedQuery = normalizeText(query);
            
            window.markersData.forEach(function (data) {
                var normalizedName = normalizeText(data.name);
                var matchesQuery = normalizedName.includes(normalizedQuery);
                
                // Búsqueda en descripción
                if (!matchesQuery && data.descripcion && data.descripcion.includes(normalizedQuery)) {
                    matchesQuery = true;
                }
                
                var matchesFilter = selectedFilter === '' || selectedFilter === 'todos';
                
                // Lógica de búsqueda avanzada (alias)
                if (normalizedQuery.includes('cancha') || normalizedQuery.includes('deportivo')) {
                    if (data.tipo === 'deportivo' || (Array.isArray(data.tipo) && data.tipo.includes('deportivo'))) {
                        matchesQuery = true;
                    }
                }

                if (normalizedQuery.includes('bano') || normalizedQuery.includes('wc') || normalizedQuery.includes('sanitario')) {
                    if (data.tipo === 'baño' || (Array.isArray(data.tipo) && (data.tipo.includes('baño') || data.tipo.includes('baños')))) {
                        matchesQuery = true;
                    }
                }

                // Lógica de filtrado por categoría
                if (selectedFilter && selectedFilter !== 'todos') {
                    matchesFilter = false;
                    if (selectedFilter === 'otros') {
                        const excludedTypes = ['administrativo', 'aula', 'laboratorio', 'baño', 'acceso'];
                        if (!excludedTypes.includes(data.tipo)) {
                            matchesFilter = true;
                        }
                    }
                    if (selectedFilter === 'punto_reunion') {
                        var tiposPR = Array.isArray(data.tipo) ? data.tipo : [data.tipo];
                        if (tiposPR.includes('punto_reunion')) {
                            matchesFilter = true;
                        }
                    }

                    if (selectedFilter === data.tipo) {
                        matchesFilter = true;
                    }
                    if (selectedFilter === 'baño') {
                        var tipos = Array.isArray(data.tipo) ? data.tipo : [data.tipo];
                        if (normalizedName.includes('wc') || normalizedName.includes('bano') || tipos.includes('baños') || tipos.includes('baño')) {
                            matchesFilter = true;
                        }
                    }
                }

                if (matchesQuery && matchesFilter) {
                    window.edificioMarkers.addLayer(data.marker);
                }
            });
        }
    }

    /**
     * Centra el mapa en un marcador específico y hace scroll suave.
     * @param {Object} edificioEncontrado - Objeto de datos del edificio
     */
    function centrarEnMarcador(edificioEncontrado) {
        var coords = edificioEncontrado.marker.getLatLng();

        $('html, body').animate({
            scrollTop: $("#map").offset().top - 80 
        }, 800);

        window.map.setView(coords, 19, {
            animate: true,
            duration: 1.5
        });

        window.edificioMarkers.clearLayers();
        window.edificioMarkers.addLayer(edificioEncontrado.marker);
    }

    function isPuntoReunion(data) {
        if (!data) return false;
        var tipos = Array.isArray(data.tipo) ? data.tipo : [data.tipo];
        return tipos.indexOf('punto_reunion') !== -1;
    }

    // Modal: selección de punto de reunión con botón "Ir ahí"
    function showUbPRModal(destLL, nombre) {
        var modal = document.getElementById('ubPRModal');
        var t = document.getElementById('ubPRTitle');
        var b = document.getElementById('ubPRBody');
        var go = document.getElementById('ubPRGo');
        var cancel = document.getElementById('ubPRCancel');
        var closeBtn = document.getElementById('ubPRClose');
        if (!modal) return;
        if (t) t.textContent = 'Punto de reunión';
        if (b) b.textContent = nombre ? ('Destino: ' + nombre) : '¿Quieres ir a este punto de reunión?';
        modal.style.display = 'block';
        var cleanup = function () {
            modal.style.display = 'none';
            if (go) go.removeEventListener('click', goHandler);
        };
        var goHandler = function () {
            cleanup();
            try { if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.unlock(true); } catch (e) {}
            try { window.ubicatecTrack && window.ubicatecTrack('map_route_meeting_point', { label: nombre || '' }); } catch {}
            showUbGeoModal('Ubicación requerida', 'Para trazar la ruta al punto de reunión, habilita la ubicación en tu dispositivo.', 'route_meeting_point', function (pos) {
                var userLL = L.latLng(pos.coords.latitude, pos.coords.longitude);
                initUbRouteModal(userLL, destLL, { destTitle: nombre || 'Punto de reunión', destPopup: nombre || 'Punto de reunión' });
            });
        };
        if (go) go.addEventListener('click', goHandler);
        if (cancel) cancel.addEventListener('click', cleanup, { once: true });
        if (closeBtn) closeBtn.addEventListener('click', cleanup, { once: true });
    }
    /**
     * Muestra una lista de resultados en un modal cuando la búsqueda es ambigua.
     * @param {Array} resultados - Array de objetos encontrados
     */
    function mostrarResultadosEnModal(resultados) {
        var lista = document.getElementById('listaResultados');
        lista.innerHTML = ''; 

        resultados.forEach(function(data) {
            var item = document.createElement('div');
            item.className = 'resultado-item';
            item.style.padding = '12px';
            item.style.borderBottom = '1px solid #eee';
            item.style.cursor = 'pointer';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '15px';
            item.style.transition = 'background-color 0.2s';

            item.onmouseover = function() { this.style.backgroundColor = '#f8f9fa'; };
            item.onmouseout = function() { this.style.backgroundColor = 'transparent'; };

            // Configurar icono para la lista
            var color = '#95a5a6'; 
            var iconName = 'tools.svg';
            var tipoStr = Array.isArray(data.tipo) ? data.tipo.join(' ') : data.tipo;
            
            if (tipoStr.includes('aula')) { color = '#3498db'; iconName = 'school.svg'; }
            else if (tipoStr.includes('laboratorio')) { color = '#27ae60'; iconName = 'microscope.svg'; }
            else if (tipoStr.includes('administrativo')) { color = '#e67e22'; iconName = 'building.svg'; }
            else if (tipoStr.includes('deportivo')) { color = '#2ecc71'; iconName = 'sport.svg'; }
            else if (tipoStr.includes('baño') || tipoStr.includes('baños')) { color = '#9b59b6'; iconName = 'toilet-paper.svg'; }
            else if (tipoStr.includes('acceso')) { color = '#e74c3c'; iconName = 'door.svg'; }

            var nombreMostrar = data.name;
            if (data.marker && data.marker.getTooltip()) {
                nombreMostrar = data.marker.getTooltip().getContent();
            } else {
                nombreMostrar = nombreMostrar.replace(/\b\w/g, l => l.toUpperCase());
            }

            item.innerHTML = `
                <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <img src="Icon/tabler/${iconName}" style="width: 18px; height: 18px; filter: brightness(0) invert(1);" alt="${tipoStr}">
                </div>
                <span style="font-weight: 500; color: #333; font-size: 14px;">${nombreMostrar}</span>
            `;

            item.onclick = function() {
                centrarEnMarcador(data);
                $('#resultadosModal').hide();
            };

            lista.appendChild(item);
        });

        $('#resultadosModal').css('display', 'flex'); 
    }

    /**
     * Función global para buscar y centrar un edificio.
     * Maneja búsquedas exactas (ID) y parciales (Nombre).
     * @param {string} query - Término de búsqueda
     */
    window.centrarEnEdificio = function (query) {
        if (!window.markersData || !window.map) {
            console.log('Mapa o marcadores no están listos aún');
            return;
        }

        var resultadosEncontrados = [];
        var normalizedQuery = normalizeText(query);
        
        // 1. Intentar buscar por número de edificio (ej. "Edificio 5")
        var matchNumero = normalizedQuery.match(/(\d+)/);
        var numeroBuscado = matchNumero ? matchNumero[1] : null;

        if (numeroBuscado) {
            for (var i = 0; i < window.markersData.length; i++) {
                var data = window.markersData[i];
                if (isPuntoReunion(data)) continue;
                var normalizedName = normalizeText(data.name);
                var matchEdificio = normalizedName.match(/edificio (\d+)/);
                
                if ((matchEdificio && matchEdificio[1] === numeroBuscado) || (data.id && data.id === numeroBuscado)) {
                    resultadosEncontrados.push(data);
                }
            }
        }

        // 2. Si no hay coincidencia numérica, buscar por texto libre
        if (resultadosEncontrados.length === 0) {
            for (var i = 0; i < window.markersData.length; i++) {
                var data = window.markersData[i];
                var normalizedName = normalizeText(data.name);
                
                if (normalizedName.includes(normalizedQuery) || (data.descripcion && data.descripcion.includes(normalizedQuery))) {
                    resultadosEncontrados.push(data);
                } else if (normalizedQuery.includes('cancha') || normalizedQuery.includes('deportivo')) {
                    if (data.tipo === 'deportivo' || (Array.isArray(data.tipo) && data.tipo.includes('deportivo'))) {
                        resultadosEncontrados.push(data);
                    }
                } else if (normalizedQuery.includes('bano') || normalizedQuery.includes('wc') || normalizedQuery.includes('sanitario')) {
                    if (data.tipo === 'baño' || (Array.isArray(data.tipo) && (data.tipo.includes('baño') || data.tipo.includes('baños')))) {
                        resultadosEncontrados.push(data);
                    }
                }
            }
        }

        // Decidir acción según número de resultados
        if (resultadosEncontrados.length === 1) {
            centrarEnMarcador(resultadosEncontrados[0]);
        } else if (resultadosEncontrados.length > 1) {
            mostrarResultadosEnModal(resultadosEncontrados);
        } else {
            alert('Edificio no encontrado: ' + query);
        }
    };

    function getTipoLabel(tipo) {
        if (!tipo) return '';
        var t = Array.isArray(tipo) ? tipo[0] : tipo;
        switch (t) {
            case 'aula': return 'Aulas';
            case 'laboratorio': return 'Laboratorios';
            case 'administrativo': return 'Administrativo';
            case 'deportivo': return 'Deportivo y recreativo';
            case 'punto_reunion': return 'Puntos de reunión';
            case 'acceso': return 'Accesos';
            case 'baño': return 'Baños';
            case 'otros': return 'Otros';
            default: return (typeof t === 'string' ? t : '');
        }
    }

    var ubSuggestEl = document.getElementById('ubSearchSuggest');
    var ubSearchInputEl = document.getElementById('searchInput');
    var ubSearchOverlayEl = document.getElementById('ubSearchOverlay');
    var ubSearchBackEl = document.getElementById('ubSearchBack');
    var ubFilterPanelEl = document.getElementById('ubFilterPanel');
    var ubFilterOverlayEl = document.getElementById('ubFilterOverlay');
    var ubToggleFilterEl = document.getElementById('ubToggleFilter');
    var ubSuggestTimer = null;
    var ubSuggestPointerDown = false;
    var ubSearchOpen = false;

    function closeFilterDrawerIfOpen() {
        if (ubFilterPanelEl && ubFilterPanelEl.classList.contains('is-open')) {
            ubFilterPanelEl.classList.remove('is-open');
            ubFilterPanelEl.setAttribute('aria-hidden', 'true');
        }
        if (ubFilterOverlayEl) ubFilterOverlayEl.style.display = 'none';
        document.body.classList.remove('ub-drawer-open');
        if (ubToggleFilterEl) ubToggleFilterEl.setAttribute('aria-expanded', 'false');
    }

    function setSearchOpen(next) {
        ubSearchOpen = !!next;
        document.body.classList.toggle('ub-search-open', ubSearchOpen);
        if (ubSearchOverlayEl) ubSearchOverlayEl.style.display = ubSearchOpen ? 'block' : 'none';
        if (ubSearchOpen) {
            closeFilterDrawerIfOpen();
            updateSuggestionsNow();
        } else {
            hideSuggestions();
        }
    }

    function setMapUiForNavigation(active) {
        var isActive = !!active;
        if (isActive) {
            closeFilterDrawerIfOpen();
            setSearchOpen(false);
            try {
                if (ubSearchInputEl) ubSearchInputEl.blur();
            } catch (e) {}
        } else {
            closeFilterDrawerIfOpen();
            setSearchOpen(false);
            try {
                if (ubSearchInputEl) ubSearchInputEl.blur();
            } catch (e) {}
        }
        document.body.classList.toggle('ub-route-active', isActive);
    }

    function hideSuggestions() {
        if (!ubSuggestEl) return;
        ubSuggestEl.style.display = 'none';
        ubSuggestEl.innerHTML = '';
    }

    var UB_RECENTS_KEY = 'ub_recent_searches';
    function loadRecents() {
        try {
            var raw = localStorage.getItem(UB_RECENTS_KEY);
            if (!raw) return [];
            var arr = JSON.parse(raw);
            if (!Array.isArray(arr)) return [];
            return arr.filter(function (s) { return typeof s === 'string' && s.trim(); }).slice(0, 6);
        } catch (e) {
            return [];
        }
    }

    function saveRecents(arr) {
        try { localStorage.setItem(UB_RECENTS_KEY, JSON.stringify(arr)); } catch (e) {}
    }

    function addRecent(query) {
        if (!query) return;
        var q = String(query).trim();
        if (!q) return;
        var arr = loadRecents();
        arr = arr.filter(function (x) { return String(x).toLowerCase() !== q.toLowerCase(); });
        arr.unshift(q);
        if (arr.length > 6) arr.length = 6;
        saveRecents(arr);
    }

    function renderSuggestions(items) {
        if (!ubSuggestEl) return;
        if (!items || !items.length) {
            hideSuggestions();
            return;
        }
        function escapeHtml(s) {
            return String(s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
        ubSuggestEl.innerHTML = items.map(function (it, idx) {
            var isRecent = !!(it && it.__recent);
            var name = isRecent ? (it.query || '') : ((it.originalData && it.originalData.nombre) ? it.originalData.nombre : (it.name || ''));
            var tipoLabel = isRecent ? 'Búsqueda reciente' : getTipoLabel(it.tipo || (it.originalData && it.originalData.tipo));
            var iconCls = isRecent ? 'fa-clock' : 'fa-map-marker-alt';
            return (
                '<button type="button" class="ub-search-suggest__item" data-idx="' + idx + '">' +
                    '<span class="ub-search-suggest__icon" aria-hidden="true"><i class="fas ' + iconCls + '"></i></span>' +
                    '<span class="ub-search-suggest__text">' +
                        '<span class="ub-search-suggest__primary">' + escapeHtml(name) + '</span>' +
                        '<span class="ub-search-suggest__secondary">' + escapeHtml(tipoLabel || '') + '</span>' +
                    '</span>' +
                '</button>'
            );
        }).join('');
        ubSuggestEl.__ubItems = items;
        ubSuggestEl.style.display = 'block';
    }

    function computeSuggestions(query) {
        if (!query) return [];
        if (!window.markersData || !window.markersData.length) return [];
        var normalizedQuery = normalizeText(query);
        if (!normalizedQuery) return [];

        var digitMatch = normalizedQuery.match(/(\d+)/);
        var numeroBuscado = digitMatch ? digitMatch[1] : null;

        var scored = [];
        for (var i = 0; i < window.markersData.length; i++) {
            var data = window.markersData[i];
            if (!data) continue;
            if (numeroBuscado && isPuntoReunion(data)) continue;
            var displayName = (data.originalData && data.originalData.nombre) ? data.originalData.nombre : (data.name || '');
            var nameNorm = normalizeText(displayName);
            var descNorm = data.descripcion || '';

            var match = false;
            var score = 9999;

            if (numeroBuscado) {
                var matchEdificio = nameNorm.match(/edificio (\d+)/);
                if ((matchEdificio && matchEdificio[1] === numeroBuscado) || (data.id && data.id === numeroBuscado)) {
                    match = true;
                    score = 0;
                } else if (nameNorm.indexOf(numeroBuscado) !== -1) {
                    match = true;
                    score = 3 + nameNorm.indexOf(numeroBuscado);
                }
            } else {
                var at = nameNorm.indexOf(normalizedQuery);
                if (at !== -1) {
                    match = true;
                    score = at;
                } else if (descNorm && descNorm.indexOf(normalizedQuery) !== -1) {
                    match = true;
                    score = 50 + descNorm.indexOf(normalizedQuery);
                }
            }

            if (!match) continue;
            scored.push({ data: data, score: score, len: nameNorm.length });
        }

        scored.sort(function (a, b) {
            if (a.score !== b.score) return a.score - b.score;
            return a.len - b.len;
        });

        var out = [];
        for (var j = 0; j < scored.length && out.length < 7; j++) out.push(scored[j].data);
        return out;
    }

    function updateSuggestionsNow() {
        if (!ubSearchInputEl) return;
        var query = ubSearchInputEl.value.trim();
        if (!query) {
            if (ubSearchOpen) {
                var recents = loadRecents().map(function (q) { return { __recent: true, query: q }; });
                renderSuggestions(recents);
            } else {
                hideSuggestions();
            }
            return;
        }
        renderSuggestions(computeSuggestions(query));
    }

    function updateSuggestionsDebounced() {
        if (ubSuggestTimer) clearTimeout(ubSuggestTimer);
        ubSuggestTimer = setTimeout(updateSuggestionsNow, 120);
    }

    if (ubSuggestEl) {
        ubSuggestEl.addEventListener('pointerdown', function () { ubSuggestPointerDown = true; });
        ubSuggestEl.addEventListener('pointerup', function () { ubSuggestPointerDown = false; });
        ubSuggestEl.addEventListener('click', function (e) {
            var btn = e.target && e.target.closest ? e.target.closest('.ub-search-suggest__item') : null;
            if (!btn) return;
            var idx = parseInt(btn.getAttribute('data-idx') || '-1', 10);
            var items = ubSuggestEl.__ubItems || [];
            var picked = items[idx];
            if (!picked) return;
            var isRecent = !!(picked && picked.__recent);
            if (isRecent) {
                if (ubSearchInputEl) ubSearchInputEl.value = picked.query || '';
                addRecent(picked.query || '');
                try { window.centrarEnEdificio && window.centrarEnEdificio(picked.query || ''); } catch (e2) {}
            } else {
                var pickedLabel = (picked.originalData && picked.originalData.nombre) ? picked.originalData.nombre : (picked.name || '');
                if (ubSearchInputEl) ubSearchInputEl.value = pickedLabel;
                addRecent(pickedLabel);
                try { centrarEnMarcador(picked); } catch (err) { try { window.centrarEnEdificio && window.centrarEnEdificio(ubSearchInputEl.value); } catch (e3) {} }
            }
            setSearchOpen(false);
            try { ubSearchInputEl && ubSearchInputEl.blur && ubSearchInputEl.blur(); } catch (e4) {}
        });
    }

    if (ubSearchInputEl) {
        ubSearchInputEl.addEventListener('focus', function () { setSearchOpen(true); });
        ubSearchInputEl.addEventListener('blur', function () {
            setTimeout(function () {
                if (ubSuggestPointerDown) return;
                if (!ubSearchOpen) hideSuggestions();
            }, 180);
        });
    }

    if (ubSearchOverlayEl) {
        ubSearchOverlayEl.addEventListener('click', function () {
            setSearchOpen(false);
            try { ubSearchInputEl && ubSearchInputEl.blur && ubSearchInputEl.blur(); } catch (e) {}
        });
    }

    if (ubSearchBackEl) {
        ubSearchBackEl.addEventListener('click', function () {
            if (ubSearchInputEl) ubSearchInputEl.value = '';
            setSearchOpen(false);
            try { ubSearchInputEl && ubSearchInputEl.blur && ubSearchInputEl.blur(); } catch (e) {}
        });
    }

    // Event Listener: Input de Búsqueda
    document.getElementById('searchInput').addEventListener('input', function () {
        var query = this.value.trim();
        var filterSelect = document.getElementById('filterSelect');

        if (!query) {
            updateSuggestionsNow();
            if (filterSelect) filterSelect.value = '';
            if (window.edificioMarkers && window.edificioMarkers.clearLayers) {
                window.edificioMarkers.clearLayers();
            }
            return;
        }

        // Priorizar búsqueda sobre filtro
        if (query) {
            filterSelect.value = '';
        }

        var selectedFilter = filterSelect.value;
        updateMarkers(query, selectedFilter);
        updateSuggestionsDebounced();
    });

    // Event Listener: Formulario de Búsqueda (Submit)
    var searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault(); 
            var query = document.getElementById('searchInput').value.trim();
            if (query) {
                hideSuggestions();
                addRecent(query);
                setSearchOpen(false);
                try { window.ubicatecTrack && window.ubicatecTrack('map_search', { label: query }); } catch {}
                centrarEnEdificio(query);
                document.getElementById('searchInput').blur(); // Cerrar teclado móvil
            }
        });
    }

    // Event Listener: Botón de Búsqueda
    var searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function (e) {
            e.preventDefault(); 
            var query = document.getElementById('searchInput').value.trim();
            if (query) {
                hideSuggestions();
                addRecent(query);
                setSearchOpen(false);
                try { window.ubicatecTrack && window.ubicatecTrack('map_search', { label: query }); } catch {}
                centrarEnEdificio(query);
            }
        });
    }

    // Event Listener: Cambio de Filtro
    document.getElementById('filterSelect').addEventListener('change', function () {
        var searchInput = document.getElementById('searchInput');
        var selectedFilter = this.value;
        try { window.ubicatecTrack && window.ubicatecTrack('map_filter', { label: selectedFilter }); } catch {}

        // Limpiar búsqueda si se usa filtro
        if (selectedFilter !== '') {
            searchInput.value = '';
        }

        var query = searchInput.value.trim();
        updateMarkers(query, selectedFilter);


    });

    function showUbGeoModal(title, body, metricLabel, onAllow) {
        var modal = document.getElementById('ubGeoModal');
        var t = document.getElementById('ubGeoTitle');
        var b = document.getElementById('ubGeoBody');
        var allow = document.getElementById('ubGeoAllow');
        var cancel = document.getElementById('ubGeoCancel');
        var closeBtn = document.getElementById('ubGeoClose');
        if (!modal) return;
        if (t) t.textContent = title || '';
        if (b) b.textContent = body || '';
        modal.style.display = 'block';
        var handler = function () {
            try { if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.unlock(true); } catch (e) {}
            try { window.ubicatecTrack && window.ubicatecTrack('geo_request', { label: metricLabel || '' }); } catch {}
            navigator.geolocation.getCurrentPosition(function (pos) {
                try { window.ubicatecTrack && window.ubicatecTrack('geo_success', { label: metricLabel || '' }); } catch {}
                if (window.UbicatecLocationQuality && window.UbicatecLocationQuality.processPosition) {
                    var q = window.UbicatecLocationQuality.processPosition(pos);
                    if (q && q.use) {
                        pos = { coords: Object.assign({}, pos.coords, { latitude: q.lat, longitude: q.lng, accuracy: q.accuracy }), timestamp: pos.timestamp };
                    }
                }
                onAllow && onAllow(pos);
                modal.style.display = 'none';
            }, function (err) {
                try { window.ubicatecTrack && window.ubicatecTrack('geo_error', { label: metricLabel || '' }); } catch {}
                if (window.UbicatecLocationQuality && window.UbicatecLocationQuality.reportError) {
                    window.UbicatecLocationQuality.reportError(err);
                }
                modal.style.display = 'none';

                if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                    // MOCK LOCATION PARA DESARROLLO (Campus ITP)
                    console.log('Modo Desarrollo: Inyectando ubicación GPS falsa...');
                    onAllow && onAllow({
                        coords: { latitude: 19.0698, longitude: -98.1688, accuracy: 5 },
                        timestamp: Date.now()
                    });
                } else {
                    alert('No se pudo obtener tu ubicación.');
                }
            }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
            allow.removeEventListener('click', handler);
        };
        allow.addEventListener('click', handler);
        var hide = function () { modal.style.display = 'none'; };
        cancel && cancel.addEventListener('click', hide, { once: true });
        closeBtn && closeBtn.addEventListener('click', hide, { once: true });
    }
    // Botón: Baño más cercano
    var nearestBtn = document.getElementById('nearestBathroomButton');
    if (nearestBtn) {
        nearestBtn.addEventListener('click', function () {
            try { window.ubicatecTrack && window.ubicatecTrack('map_route_nearest_bathroom'); } catch {}
            showUbGeoModal('Ubicación requerida', 'Para trazar la ruta al baño más cercano, habilita la ubicación en tu dispositivo.', 'route_nearest_bathroom', function (pos) {
                var lat = pos.coords.latitude;
                var lng = pos.coords.longitude;
                if (window.markersData && window.markersData.length && window.map) {
                    var nearest = null;
                    var nearestDist = Infinity;
                    for (var i = 0; i < window.markersData.length; i++) {
                        var d = window.markersData[i];
                        var tipos = Array.isArray(d.tipo) ? d.tipo : [d.tipo];
                        var nameNorm = normalizeText(d.name);
                        var isBathroom = tipos.includes('baño') || tipos.includes('baños') || nameNorm.includes('bano') || nameNorm.includes('wc');
                        if (!isBathroom) continue;
                        var ll = d.marker.getLatLng();
                        var R = 6371000;
                        var phi1 = lat * Math.PI / 180;
                        var phi2 = ll.lat * Math.PI / 180;
                        var dphi = (ll.lat - lat) * Math.PI / 180;
                        var dlambda = (ll.lng - lng) * Math.PI / 180;
                        var a = Math.sin(dphi / 2) * Math.sin(dphi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) * Math.sin(dlambda / 2);
                        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        var dist = R * c;
                        if (dist < nearestDist) {
                            nearestDist = dist;
                            nearest = d;
                        }
                    }
                    if (nearest) {
                        var userLL = L.latLng(lat, lng);
                        var destLL = nearest.marker.getLatLng();
                        var bañoNombre = (nearest.marker && nearest.marker.getTooltip && nearest.marker.getTooltip() && nearest.marker.getTooltip().getContent)
                            ? nearest.marker.getTooltip().getContent()
                            : (nearest.name || 'Baño más cercano');
                        try { window.ubicatecPrimeArrivalSound && window.ubicatecPrimeArrivalSound(); } catch (e) {}
                        if (typeof window.ubicatecStartInMapNav === 'function') {
                            window.ubicatecStartInMapNav(userLL, destLL, { destTitle: bañoNombre });
                        } else {
                            initUbRouteModal(userLL, destLL, { destTitle: bañoNombre, destPopup: bañoNombre });
                        }
                    } else {
                        alert('No se encontraron baños en el mapa.');
                    }
                } else {
                    alert('Mapa no está listo aún.');
                }
            });
        });
    }

    var routeBtn = document.getElementById('routeMedButton');
    if (routeBtn) {
        routeBtn.addEventListener('click', function () {
            try { window.ubicatecTrack && window.ubicatecTrack('map_route_med'); } catch {}
            showUbGeoModal('Ubicación requerida', 'Para trazar la ruta hacia Servicio Médico, habilita la ubicación en tu dispositivo.', 'route_med', function (pos) {
                var lat = pos.coords.latitude;
                var lng = pos.coords.longitude;
                if (window.markersData && window.markersData.length && window.map) {
                    var target = null;
                    for (var i = 0; i < window.markersData.length; i++) {
                        var d = window.markersData[i];
                        var idStr = d.id ? d.id.toString() : null;
                        var nameNorm = normalizeText(d.name);
                        if (idStr === '25' || nameNorm.includes('edificio 25')) {
                            target = d;
                            break;
                        }
                    }
                    if (target) {
                        var userLL = L.latLng(lat, lng);
                        var destLL = target.marker.getLatLng();
                        try { window.ubicatecPrimeArrivalSound && window.ubicatecPrimeArrivalSound(); } catch (e) {}
                        if (typeof window.ubicatecStartInMapNav === 'function') {
                            window.ubicatecStartInMapNav(userLL, destLL, { destTitle: 'Servicio Médico (Edificio 25)' });
                        } else {
                            initUbRouteModal(userLL, destLL, { destTitle: 'Servicio Médico (Edificio 25)', destPopup: 'Servicio Médico (Edificio 25)' });
                        }
                    } else {
                        alert('No se encontró el Servicio Médico (Edificio 25).');
                    }
                } else {
                    alert('Mapa no está listo aún.');
                }
            });
        });
    }

    function initUbRouteModal(userLL, destLL, options) {
        var modal = document.getElementById('ubRouteModal');
        var distanceSpan = document.getElementById('ubRouteDistance');
        var routeMapEl = document.getElementById('ubRouteMap');
        var closeBtn = document.getElementById('ubRouteHide');
        var closeX = document.getElementById('ubRouteClose');
        if (!modal || !routeMapEl) return;

        modal.style.display = 'block';

        setTimeout(function () {
            if (routeMapEl._leaflet_id) {
                try { delete routeMapEl._leaflet_id; } catch (e) { routeMapEl._leaflet_id = null; }
            }
            routeMapEl.innerHTML = '';

            var opts = options || {};
            var destTitle = opts.destTitle || 'Destino';
            var destPopup = opts.destPopup || destTitle;

            var rmap = L.map('ubRouteMap', { zoomControl: true }).setView(userLL, 18);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 20,
                minZoom: 15,
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(rmap);

            var userIcon = L.icon({
                iconUrl: 'Icon/user.png',
                iconSize: [32, 32],
                iconAnchor: [16, 28],
                popupAnchor: [0, -20]
            });
            var userMarker = L.marker(userLL, { title: 'Tu ubicación actual', icon: userIcon })
                .addTo(rmap)
                .bindPopup('Tu ubicación actual')
                .openPopup();

            var destMarker = L.marker(destLL, {
                title: destTitle
            }).addTo(rmap).bindPopup(destPopup);

            var R = 6371000;
            function haversine(a, b) {
                var phi1 = a.lat * Math.PI / 180;
                var phi2 = b.lat * Math.PI / 180;
                var dphi = (b.lat - a.lat) * Math.PI / 180;
                var dlambda = (b.lng - a.lng) * Math.PI / 180;
                var s1 = Math.sin(dphi / 2);
                var s2 = Math.sin(dlambda / 2);
                var x = (s1 * s1) + Math.cos(phi1) * Math.cos(phi2) * (s2 * s2);
                return 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * R;
            }

            function ensureGraphLoading() {
                if (window.__UB_CAMPUS_GRAPH) return Promise.resolve(window.__UB_CAMPUS_GRAPH);
                if (window.__UB_CAMPUS_GRAPH_PROMISE) return window.__UB_CAMPUS_GRAPH_PROMISE;
                window.__UB_CAMPUS_GRAPH_PROMISE = fetch('data/itp_walk_graph.json')
                    .then(function (res) {
                        if (!res.ok) throw new Error('graph_http_' + res.status);
                        return res.json();
                    })
                    .then(function (g) {
                        window.__UB_CAMPUS_GRAPH = g;
                        return g;
                    });
                return window.__UB_CAMPUS_GRAPH_PROMISE;
            }

            function haversineMeters(lat1, lon1, lat2, lon2) {
                var rad = Math.PI / 180;
                var phi1 = lat1 * rad;
                var phi2 = lat2 * rad;
                var dphi = (lat2 - lat1) * rad;
                var dlambda = (lon2 - lon1) * rad;
                var s1 = Math.sin(dphi / 2);
                var s2 = Math.sin(dlambda / 2);
                var a = (s1 * s1) + Math.cos(phi1) * Math.cos(phi2) * (s2 * s2);
                return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
            }

            function nearestNodeIdx(g, ll) {
                var n = g.lat.length;
                var best = -1;
                var bestD = Infinity;
                for (var i = 0; i < n; i++) {
                    var d = haversineMeters(ll.lat, ll.lng, g.lat[i], g.lon[i]);
                    if (d < bestD) {
                        bestD = d;
                        best = i;
                    }
                }
                return best;
            }

            function MinHeap() {
                this.ids = [];
                this.keys = [];
            }
            MinHeap.prototype.push = function (id, key) {
                var ids = this.ids;
                var keys = this.keys;
                var i = ids.length;
                ids.push(id);
                keys.push(key);
                while (i > 0) {
                    var p = (i - 1) >> 1;
                    if (keys[p] <= key) break;
                    ids[i] = ids[p];
                    keys[i] = keys[p];
                    i = p;
                }
                ids[i] = id;
                keys[i] = key;
            };
            MinHeap.prototype.pop = function () {
                var ids = this.ids;
                var keys = this.keys;
                var rootId = ids[0];
                var rootKey = keys[0];
                var lastId = ids.pop();
                var lastKey = keys.pop();
                if (ids.length) {
                    var i = 0;
                    while (true) {
                        var l = i * 2 + 1;
                        var r = l + 1;
                        if (l >= ids.length) break;
                        var c = l;
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
            };

            function heuristic(g, a, b) {
                return haversineMeters(g.lat[a], g.lon[a], g.lat[b], g.lon[b]);
            }

            function aStar(g, start, goal) {
                if (start === goal) return { path: [start], dist: 0 };
                var n = g.lat.length;
                var offsets = g.offsets;
                var to = g.to;
                var w = g.w;

                var gScore = new Float64Array(n);
                var fScore = new Float64Array(n);
                var came = new Int32Array(n);
                for (var i = 0; i < n; i++) {
                    gScore[i] = Infinity;
                    fScore[i] = Infinity;
                    came[i] = -1;
                }
                gScore[start] = 0;
                fScore[start] = heuristic(g, start, goal);

                var open = new MinHeap();
                open.push(start, fScore[start]);
                var closed = new Uint8Array(n);

                while (open.ids.length) {
                    var cur = open.pop().id;
                    if (closed[cur]) continue;
                    if (cur === goal) break;
                    closed[cur] = 1;
                    var gCur = gScore[cur];
                    var a0 = offsets[cur];
                    var a1 = offsets[cur + 1];
                    for (var e = a0; e < a1; e++) {
                        var nb = to[e];
                        if (closed[nb]) continue;
                        var tentative = gCur + w[e];
                        if (tentative < gScore[nb]) {
                            came[nb] = cur;
                            gScore[nb] = tentative;
                            fScore[nb] = tentative + heuristic(g, nb, goal);
                            open.push(nb, fScore[nb]);
                        }
                    }
                }

                if (came[goal] === -1) return null;
                var path = [];
                var x = goal;
                path.push(x);
                while (x !== start) {
                    x = came[x];
                    if (x === -1) return null;
                    path.push(x);
                }
                path.reverse();
                return { path: path, dist: gScore[goal] };
            }

            var routeLine = null;
            var lastRouteLatLngs = null;
            var lastRouteDist = null;
            var lastRouteFrom = null;
            var lastRouteTs = 0;
            var lastOffRouteRecalcTs = 0;
            var destIdx = null;
            var didFit = false;

            function setDistanceText(v) {
                if (!distanceSpan) return;
                distanceSpan.textContent = v;
            }

            function paintRouteFromPath(g, path) {
                var latLngs = path.map(function (i) { return [g.lat[i], g.lon[i]]; });
                lastRouteLatLngs = latLngs.map(function (ll) { return L.latLng(ll[0], ll[1]); });
                if (routeLine) {
                    routeLine.setLatLngs(latLngs);
                } else {
                    routeLine = L.polyline(latLngs, { color: '#1e66ff', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }).addTo(rmap);
                }
                if (!didFit) {
                    didFit = true;
                    try { rmap.fitBounds(routeLine.getBounds(), { padding: [50, 50] }); } catch (e) {}
                }
            }

            function distanceToRouteMeters(userLL) {
                if (!lastRouteLatLngs || lastRouteLatLngs.length < 2) return Infinity;
                var rad = Math.PI / 180;
                var lat0 = userLL.lat * rad;
                var cos0 = Math.cos(lat0);
                function toXY(ll) {
                    var latRad = ll.lat * rad;
                    var lonRad = ll.lng * rad;
                    return { x: lonRad * cos0 * R, y: latRad * R };
                }
                var p = toXY(userLL);
                var best = Infinity;
                for (var i = 0; i < lastRouteLatLngs.length - 1; i++) {
                    var a = toXY(lastRouteLatLngs[i]);
                    var b = toXY(lastRouteLatLngs[i + 1]);
                    var abx = b.x - a.x;
                    var aby = b.y - a.y;
                    var apx = p.x - a.x;
                    var apy = p.y - a.y;
                    var ab2 = abx * abx + aby * aby;
                    var t = 0;
                    if (ab2 > 0) t = (apx * abx + apy * aby) / ab2;
                    if (t < 0) t = 0;
                    else if (t > 1) t = 1;
                    var cx = a.x + abx * t;
                    var cy = a.y + aby * t;
                    var dx = p.x - cx;
                    var dy = p.y - cy;
                    var d = Math.sqrt(dx * dx + dy * dy);
                    if (d < best) best = d;
                }
                return best;
            }

            function shouldRecalcRoute(userLL) {
                var now = Date.now();
                if (!lastRouteFrom) return true;
                var dRoute = distanceToRouteMeters(userLL);
                if (Number.isFinite(dRoute) && dRoute > 10) {
                    if (now - lastOffRouteRecalcTs > 1500) {
                        lastOffRouteRecalcTs = now;
                        if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.notifyRerouting();
                        return true;
                    }
                }
                if (now - lastRouteTs > 5000) return true;
                try {
                    if (userLL.distanceTo(lastRouteFrom) > 8) return true;
                } catch (e) {}
                return false;
            }

            function updateDistanceFallback() {
                var dist = haversine(userMarker.getLatLng(), destMarker.getLatLng());
                setDistanceText(String(Math.round(dist)));
            }

            function updateDistance() {
                if (Number.isFinite(lastRouteDist)) {
                    setDistanceText(String(Math.round(lastRouteDist)));
                } else {
                    updateDistanceFallback();
                }
            }

            function recalcRoute(userLL) {
                if (!userLL) return;
                if (!shouldRecalcRoute(userLL)) return;
                lastRouteFrom = userLL;
                lastRouteTs = Date.now();
                setDistanceText('...');
                ensureGraphLoading().then(function (g) {
                    if (!g || !g.lat || !g.offsets) throw new Error('graph_invalid');
                    if (destIdx == null) destIdx = nearestNodeIdx(g, destLL);
                    var startIdx = nearestNodeIdx(g, userLL);
                    if (startIdx < 0 || destIdx < 0) throw new Error('graph_snap');
                    var res = aStar(g, startIdx, destIdx);
                    if (!res || !res.path || res.path.length < 2) throw new Error('graph_no_route');
                    paintRouteFromPath(g, res.path);
                    lastRouteDist = Number.isFinite(res.dist) ? res.dist : null;
                    updateDistance();
                }).catch(function () {
                    lastRouteLatLngs = null;
                    lastRouteDist = null;
                    updateDistanceFallback();
                });
            }

            recalcRoute(userLL);
            updateDistance();

            var bounds = L.latLngBounds([userLL, destLL]);
            rmap.fitBounds(bounds, { padding: [50, 50] });

            try { window.ubicatecTrack && window.ubicatecTrack('geo_request', { label: 'route_watch' }); } catch {}
            var geoSuccessTracked = false;
            var routeGeoTimeout = setTimeout(function () {
                showGeoNotice('Seguimos esperando tu ubicación para el trayecto. Activa GPS y permisos para ver la ruta.');
            }, 8000);
            try {
                navigator.geolocation.getCurrentPosition(function (pos) {
                    var nl = L.latLng(pos.coords.latitude, pos.coords.longitude);
                    userMarker.setLatLng(nl);
                    recalcRoute(nl);
                    updateDistance();
                    hideGeoNotice();
                    if (routeGeoTimeout) {
                        clearTimeout(routeGeoTimeout);
                        routeGeoTimeout = null;
                    }
                }, function () {
                    showGeoNotice('No pudimos obtener tu ubicación para iniciar el trayecto. Revisa permisos o activa el GPS.');
                }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 });
            } catch (e) {}
            var watchId = navigator.geolocation.watchPosition(function (pos) {
                if (!geoSuccessTracked) {
                    geoSuccessTracked = true;
                    try { window.ubicatecTrack && window.ubicatecTrack('geo_success', { label: 'route_watch' }); } catch {}
                }
                var nl = L.latLng(pos.coords.latitude, pos.coords.longitude);
                userMarker.setLatLng(nl);
                recalcRoute(nl);
                updateDistance();
                hideGeoNotice();
                if (routeGeoTimeout) {
                    clearTimeout(routeGeoTimeout);
                    routeGeoTimeout = null;
                }
            }, function () {
                try { window.ubicatecTrack && window.ubicatecTrack('geo_error', { label: 'route_watch' }); } catch {}
                showGeoNotice('No pudimos seguir tu ubicación para el trayecto. Revisa permisos o activa el GPS.');
            }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 });
            var escHandler = null;
            var clickOutsideHandler = null;
            var teardown = function () {
                try { navigator.geolocation.clearWatch(watchId); } catch (e) {}
                if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.stopRoute();
                if (routeGeoTimeout) {
                    clearTimeout(routeGeoTimeout);
                    routeGeoTimeout = null;
                }
                if (escHandler) document.removeEventListener('keydown', escHandler);
                if (clickOutsideHandler) modal.removeEventListener('click', clickOutsideHandler);
                setTimeout(function () {
                    rmap.remove();
                }, 200);
                modal.style.display = 'none';
            };
            closeBtn.onclick = teardown;
            if (closeX) closeX.onclick = teardown;
            escHandler = function (e) {
                if (e.key === 'Escape') {
                    teardown();
                }
            };
            document.addEventListener('keydown', escHandler);
            clickOutsideHandler = function (e) {
                if (e.target === modal) teardown();
            };
            modal.addEventListener('click', clickOutsideHandler);
        }, 200);
    }

    window.ubicatecShowUbGeoModal = showUbGeoModal;
    window.ubicatecInitUbRouteModal = initUbRouteModal;
    window.ubicatecPrimeArrivalSound = function () {
        try {
            if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.unlock();
            if (!window.__ubArrivalAudio) {
                window.__ubArrivalAudio = new Audio('mp3/llegada.mp3');
                window.__ubArrivalAudio.preload = 'auto';
            }
            var a = window.__ubArrivalAudio;
            a.volume = 0;
            var p = a.play();
            if (p && typeof p.then === 'function') {
                p.then(function () {
                    try { a.pause(); } catch (e) {}
                    try { a.currentTime = 0; } catch (e) {}
                    a.volume = 0.7;
                }).catch(function () {
                    a.volume = 0.7;
                });
            } else {
                try { a.pause(); } catch (e) {}
                try { a.currentTime = 0; } catch (e) {}
                a.volume = 0.7;
            }
        } catch (e) {}
    };
    window.ubicatecStartInMapNav = function (userLL, destLL, options) {
        try { if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.unlock(true); } catch (e) {}
        if (!window.map || !window.L || !userLL || !destLL) return;
        try {
            if (typeof window.ubicatecStopInMapNav === 'function' && window.ubInMapNav) {
                window.ubicatecStopInMapNav();
            }
        } catch (e) {}
        var map = window.map;

        function wrap360(deg) {
            var n = Number(deg);
            if (!Number.isFinite(n)) return null;
            var x = n % 360;
            if (x < 0) x += 360;
            return x;
        }

        function angleDeltaDeg(fromDeg, toDeg) {
            var a = wrap360(fromDeg);
            var b = wrap360(toDeg);
            if (a == null || b == null) return 0;
            var d = b - a;
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
            var raw = 360 - e.alpha;
            return wrap360(raw + getScreenAngleDeg());
        }

        function applyHeading(deg) {
            if (!window.ubUserLocation || !window.ubUserLocation.marker || deg == null) return;
            var el = window.ubUserLocation.marker.getElement ? window.ubUserLocation.marker.getElement() : null;
            if (!el) return;
            var img = el.querySelector('.ub-user-location__img');
            if (!img) return;
            img.style.transform = 'rotate(' + deg + 'deg)';
        }

        function ensureGraphLoading() {
            if (window.__UB_CAMPUS_GRAPH) return Promise.resolve(window.__UB_CAMPUS_GRAPH);
            if (window.__UB_CAMPUS_GRAPH_PROMISE) return window.__UB_CAMPUS_GRAPH_PROMISE;
            window.__UB_CAMPUS_GRAPH_PROMISE = fetch('data/itp_walk_graph.json')
                .then(function (res) {
                    if (!res.ok) throw new Error('graph_http_' + res.status);
                    return res.json();
                })
                .then(function (g) {
                    window.__UB_CAMPUS_GRAPH = g;
                    return g;
                });
            return window.__UB_CAMPUS_GRAPH_PROMISE;
        }

        var R = 6371000;
        function haversineMeters(lat1, lon1, lat2, lon2) {
            var rad = Math.PI / 180;
            var phi1 = lat1 * rad;
            var phi2 = lat2 * rad;
            var dphi = (lat2 - lat1) * rad;
            var dlambda = (lon2 - lon1) * rad;
            var s1 = Math.sin(dphi / 2);
            var s2 = Math.sin(dlambda / 2);
            var a = (s1 * s1) + Math.cos(phi1) * Math.cos(phi2) * (s2 * s2);
            return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
        }

        function nearestNodeIdx(g, ll) {
            var n = g.lat.length;
            var best = -1;
            var bestD = Infinity;
            for (var i = 0; i < n; i++) {
                var d = haversineMeters(ll.lat, ll.lng, g.lat[i], g.lon[i]);
                if (d < bestD) {
                    bestD = d;
                    best = i;
                }
            }
            return best;
        }

        function aStar(g, start, goal) {
            var n = g.lat.length;
            var offsets = g.offsets;
            var to = g.to;
            var w = g.w;
            var came = new Int32Array(n);
            var closed = new Uint8Array(n);
            var gScore = new Float64Array(n);
            var fScore = new Float64Array(n);
            for (var i = 0; i < n; i++) { came[i] = -1; gScore[i] = Infinity; fScore[i] = Infinity; }
            gScore[start] = 0;
            fScore[start] = 0;

            function heuristic(idx) {
                return haversineMeters(g.lat[idx], g.lon[idx], g.lat[goal], g.lon[goal]);
            }

            function MinHeap() {
                this.a = [];
            }
            MinHeap.prototype.push = function (node, pri) {
                var a = this.a;
                a.push([node, pri]);
                var i = a.length - 1;
                while (i > 0) {
                    var p = (i - 1) >> 1;
                    if (a[p][1] <= a[i][1]) break;
                    var t = a[p]; a[p] = a[i]; a[i] = t;
                    i = p;
                }
            };
            MinHeap.prototype.pop = function () {
                var a = this.a;
                if (!a.length) return null;
                var top = a[0];
                var last = a.pop();
                if (a.length) {
                    a[0] = last;
                    var i = 0;
                    while (true) {
                        var l = i * 2 + 1;
                        var r = l + 1;
                        var m = i;
                        if (l < a.length && a[l][1] < a[m][1]) m = l;
                        if (r < a.length && a[r][1] < a[m][1]) m = r;
                        if (m === i) break;
                        var t = a[m]; a[m] = a[i]; a[i] = t;
                        i = m;
                    }
                }
                return top;
            };

            var open = new MinHeap();
            open.push(start, heuristic(start));
            fScore[start] = heuristic(start);

            while (true) {
                var curPair = open.pop();
                if (!curPair) break;
                var cur = curPair[0];
                if (closed[cur]) continue;
                if (cur === goal) break;
                closed[cur] = 1;
                var a0 = offsets[cur];
                var a1 = offsets[cur + 1];
                for (var e = a0; e < a1; e++) {
                    var nb = to[e];
                    if (closed[nb]) continue;
                    var tentative = gScore[cur] + w[e];
                    if (tentative < gScore[nb]) {
                        came[nb] = cur;
                        gScore[nb] = tentative;
                        var pri = tentative + heuristic(nb);
                        fScore[nb] = pri;
                        open.push(nb, pri);
                    }
                }
            }

            if (came[goal] === -1) return null;
            var path = [];
            var x = goal;
            path.push(x);
            while (x !== start) {
                x = came[x];
                if (x === -1) return null;
                path.push(x);
            }
            path.reverse();
            return { path: path, dist: gScore[goal] };
        }

        function distancePointToPolylineMeters(pt, line) {
            if (!pt || !line || line.length < 2) return Infinity;
            var lat0 = pt.lat * Math.PI / 180;
            var cos0 = Math.cos(lat0);
            function toXY(ll) {
                var latRad = ll.lat * Math.PI / 180;
                var lonRad = ll.lng * Math.PI / 180;
                return { x: lonRad * cos0 * R, y: latRad * R };
            }
            var p = toXY(pt);
            var best = Infinity;
            for (var i = 0; i < line.length - 1; i++) {
                var a = toXY(line[i]);
                var b = toXY(line[i + 1]);
                var abx = b.x - a.x;
                var aby = b.y - a.y;
                var apx = p.x - a.x;
                var apy = p.y - a.y;
                var ab2 = abx * abx + aby * aby;
                var t = 0;
                if (ab2 > 0) t = (apx * abx + apy * aby) / ab2;
                if (t < 0) t = 0;
                else if (t > 1) t = 1;
                var cx = a.x + abx * t;
                var cy = a.y + aby * t;
                var dx = p.x - cx;
                var dy = p.y - cy;
                var d = Math.sqrt(dx * dx + dy * dy);
                if (d < best) best = d;
            }
            return best;
        }

        var hud = document.getElementById('ubNavHud');
        var hudDist = document.getElementById('ubNavDistance');
        var hudStop = document.getElementById('ubNavStop');
        var arrivalModal = document.getElementById('ubArrivalModal');
        var arrivalClose = document.getElementById('ubArrivalClose');
        var arrivalOk = document.getElementById('ubArrivalOk');

        function setHudDistance(m) {
            if (!hudDist) return;
            hudDist.textContent = String(Math.max(0, Math.round(m || 0)));
        }

        function showArrivalModal() {
            if (!arrivalModal) return;
            arrivalModal.style.display = 'block';
            if (!window.__ubArrivalWired) {
                window.__ubArrivalWired = true;
                var close = function () { arrivalModal.style.display = 'none'; };
                if (arrivalClose) arrivalClose.addEventListener('click', close);
                if (arrivalOk) arrivalOk.addEventListener('click', close);
                arrivalModal.addEventListener('click', function (e) {
                    if (e.target === arrivalModal) close();
                });
                document.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape' && arrivalModal.style.display === 'block') close();
                });
            }
        }

        function playArrivalSound() {
            try {
                var a = window.__ubArrivalAudio;
                if (!a) {
                    a = new Audio('mp3/llegada.mp3');
                    a.preload = 'auto';
                    window.__ubArrivalAudio = a;
                }
                a.volume = 0.7;
                try { a.currentTime = 0; } catch (e) {}
                var p = a.play();
                if (p && typeof p.catch === 'function') p.catch(function () {});
            } catch (e) {}
        }

        function stopNav() {
            var nav = window.ubInMapNav;
            if (nav) {
                try { if (nav.routeLine) map.removeLayer(nav.routeLine); } catch (e) {}
                try { if (nav.destMarker) map.removeLayer(nav.destMarker); } catch (e) {}
                try {
                    if (nav.nearby && nav.nearby.layer) {
                        try { nav.nearby.layer.clearLayers(); } catch (e) {}
                        try { map.removeLayer(nav.nearby.layer); } catch (e) {}
                    }
                } catch (e) {}
            }
            window.ubInMapNav = null;
            setMapUiForNavigation(false);
            if (hud) hud.style.display = 'none';
            if (hudStop) hudStop.onclick = null;
            try { if (window.ubNavCancelEl) window.ubNavCancelEl.style.display = 'none'; } catch (e) {}
            try { if (nav && nav.headingListening) window.removeEventListener(nav.headingEventName || 'deviceorientation', nav.onDeviceOrientation, true); } catch (e) {}
            try {
                var si = document.getElementById('searchInput');
                if (si) {
                    si.value = '';
                    si.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } catch (e) {}
            try {
                var bClose = document.getElementById('ubBldgClose');
                if (bClose) bClose.click();
            } catch (e) {}
            if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.stopRoute();
        }

        stopNav();

        var nav = {
            destLL: destLL,
            destTitle: (options && options.destTitle) ? options.destTitle : 'Destino',
            routeLine: L.polyline([], { color: '#1e66ff', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }).addTo(map),
            destMarker: L.marker(destLL, { title: (options && options.destTitle) ? options.destTitle : 'Destino' }).addTo(map),
            lastRouteFrom: null,
            lastRouteTs: 0,
            lastOffRouteRecalcTs: 0,
            lastRouteLatLngs: null,
            lastRouteDist: null,
            destIdx: null,
            headingEventName: null,
            headingListening: false,
            smoothedHeadingDeg: null,
            lastGeoHeadingDeg: null,
            arrivalNotified: false,
            // GPS filtering & off-route persistence
            offRouteCounter: 0,        // Contador de lecturas consecutivas fuera de ruta
            lastGpsAccuracy: null,      // Última precisión GPS recibida
            stop: stopNav
        };

        (function initNearbyPois() {
            try {
                if (!window.markersData || !Array.isArray(window.markersData)) return;
                var layer = L.layerGroup().addTo(map);
                var items = [];

                function hasType(t, target) {
                    if (!t) return false;
                    if (Array.isArray(t)) return t.indexOf(target) !== -1;
                    return String(t) === target;
                }

                window.markersData.forEach(function (d) {
                    if (!d || !d.marker) return;
                    var tipo = d.tipo;
                    var isPR = hasType(tipo, 'punto_reunion');
                    var isBath = hasType(tipo, 'baño') || hasType(tipo, 'baños');
                    if (!isPR && !isBath) return;
                    var ll = null;
                    try { ll = d.marker.getLatLng ? d.marker.getLatLng() : null; } catch (e) {}
                    if (!ll) return;
                    items.push({
                        marker: d.marker,
                        ll: ll,
                        type: isPR ? 'punto_reunion' : 'baño',
                        name: d.name || ''
                    });
                });

                nav.nearby = {
                    layer: layer,
                    items: items,
                    shown: new Set(),
                    lastTs: 0,
                    config: {
                        'baño': { userShow: 38, userHide: 52, routeShow: 18, routeHide: 24, maxShown: 2 },
                        'punto_reunion': { userShow: 55, userHide: 72, routeShow: 24, routeHide: 32, maxShown: 2 }
                    }
                };
            } catch (e) {}
        })();

        nav.onDeviceOrientation = function (e) {
            var h = computeHeadingFromOrientationEvent(e);
            if (h == null) return;
            if (nav.smoothedHeadingDeg == null) nav.smoothedHeadingDeg = h;
            else nav.smoothedHeadingDeg = wrap360(nav.smoothedHeadingDeg + angleDeltaDeg(nav.smoothedHeadingDeg, h) * 0.2);
            applyHeading(nav.smoothedHeadingDeg);
        };

        nav.startHeading = function () {
            if (typeof window.ubicatecEnsureUserHeadingTracking === 'function') {
                window.ubicatecEnsureUserHeadingTracking();
            }
        };
        nav.startHeading();

        function paintRouteFromPath(g, path) {
            if (!path || path.length < 2) return;
            var latLngs = path.map(function (i) { return [g.lat[i], g.lon[i]]; });
            nav.lastRouteLatLngs = latLngs.map(function (ll) { return L.latLng(ll[0], ll[1]); });
            nav.routeLine.setLatLngs(latLngs);
        }

        function shouldRecalcRoute(u) {
            var now = Date.now();
            if (!nav.lastRouteFrom) return true;
            if (now - nav.lastRouteTs > 5000) return true;
            try { if (u.distanceTo(nav.lastRouteFrom) > 8) return true; } catch (e) {}
            if (nav.lastRouteLatLngs && nav.lastRouteLatLngs.length >= 2) {
                var dRoute = distancePointToPolylineMeters(u, nav.lastRouteLatLngs);
                if (Number.isFinite(dRoute) && dRoute > 10) {
                    if (now - nav.lastOffRouteRecalcTs > 1500) {
                        nav.lastOffRouteRecalcTs = now;
                        if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.notifyRerouting();
                        return true;
                    }
                }
            }
            return false;
        }

        function recalcRoute(u) {
            if (!u) return;
            if (!shouldRecalcRoute(u)) return;
            nav.lastRouteFrom = u;
            nav.lastRouteTs = Date.now();
            ensureGraphLoading().then(function (g) {
                if (!g || !g.lat || !g.offsets) throw new Error('graph_invalid');
                if (nav.destIdx == null) nav.destIdx = nearestNodeIdx(g, destLL);
                var startIdx = nearestNodeIdx(g, u);
                if (startIdx < 0 || nav.destIdx < 0) throw new Error('graph_snap');
                var res = aStar(g, startIdx, nav.destIdx);
                if (!res || !res.path || res.path.length < 2) throw new Error('graph_no_route');
                paintRouteFromPath(g, res.path);
                nav.lastRouteDist = Number.isFinite(res.dist) ? res.dist : null;
                if (Number.isFinite(nav.lastRouteDist)) setHudDistance(nav.lastRouteDist);
            }).catch(function () {
                nav.lastRouteLatLngs = null;
                nav.lastRouteDist = null;
                setHudDistance(haversineMeters(u.lat, u.lng, destLL.lat, destLL.lng));
            });
        }

        nav.onPos = function (pos, llArr) {
            if (!llArr || llArr.length < 2) return;
            var u = L.latLng(llArr[0], llArr[1]);
            var directDist = haversineMeters(u.lat, u.lng, destLL.lat, destLL.lng);
            if (pos && pos.coords && typeof pos.coords.heading === 'number' && Number.isFinite(pos.coords.heading)) {
                var spd = (typeof pos.coords.speed === 'number' && Number.isFinite(pos.coords.speed)) ? pos.coords.speed : 0;
                if (spd >= 0.85 && nav.smoothedHeadingDeg == null) {
                    if (nav.lastGeoHeadingDeg == null) nav.lastGeoHeadingDeg = wrap360(pos.coords.heading);
                    else nav.lastGeoHeadingDeg = wrap360(nav.lastGeoHeadingDeg + angleDeltaDeg(nav.lastGeoHeadingDeg, pos.coords.heading) * 0.16);
                }
            }
            if (nav.smoothedHeadingDeg != null) applyHeading(nav.smoothedHeadingDeg);
            else if (nav.lastGeoHeadingDeg != null) applyHeading(nav.lastGeoHeadingDeg);
            recalcRoute(u);
            try {
                if (nav.nearby && nav.nearby.items && nav.nearby.layer) {
                    var now = Date.now();
                    if (now - (nav.nearby.lastTs || 0) >= 350) {
                        nav.nearby.lastTs = now;
                        var grouped = { 'baño': [], 'punto_reunion': [] };
                        var routeLatLngs = Array.isArray(nav.lastRouteLatLngs) ? nav.lastRouteLatLngs : null;

                        nav.nearby.items.forEach(function (it) {
                            if (!it || !it.marker || !it.ll) return;
                            var cfg = (nav.nearby.config && nav.nearby.config[it.type]) || null;
                            if (!cfg) return;
                            var dUser = Infinity;
                            var dRoute = Infinity;
                            try { dUser = u.distanceTo(it.ll); } catch (e) {}
                            try {
                                if (routeLatLngs && routeLatLngs.length >= 2) {
                                    dRoute = distancePointToPolylineMeters(it.ll, routeLatLngs);
                                }
                            } catch (e) {}
                            var score = Math.min(dUser, Number.isFinite(dRoute) ? dRoute + 8 : Infinity);
                            grouped[it.type].push({
                                item: it,
                                cfg: cfg,
                                dUser: dUser,
                                dRoute: dRoute,
                                score: score,
                                isShown: nav.nearby.shown.has(it.marker)
                            });
                        });

                        var desiredShown = new Set();
                        ['baño', 'punto_reunion'].forEach(function (type) {
                            var list = grouped[type] || [];
                            if (!list.length) return;
                            list.sort(function (a, b) { return a.score - b.score; });

                            var keepers = list.filter(function (entry) {
                                return entry.isShown && (
                                    entry.dUser <= entry.cfg.userHide ||
                                    (Number.isFinite(entry.dRoute) && entry.dRoute <= entry.cfg.routeHide)
                                );
                            });

                            keepers.slice(0, list[0].cfg.maxShown).forEach(function (entry) {
                                desiredShown.add(entry.item.marker);
                            });

                            list.forEach(function (entry) {
                                if (desiredShown.size >= 8) return;
                                var typeCount = 0;
                                desiredShown.forEach(function (marker) {
                                    if (marker !== entry.item.marker) {
                                        var match = list.find(function (x) { return x.item.marker === marker; });
                                        if (match) typeCount++;
                                    }
                                });
                                if (typeCount >= entry.cfg.maxShown) return;
                                var canShow = (
                                    entry.dUser <= entry.cfg.userShow ||
                                    (Number.isFinite(entry.dRoute) && entry.dRoute <= entry.cfg.routeShow)
                                );
                                if (canShow) desiredShown.add(entry.item.marker);
                            });
                        });

                        nav.nearby.items.forEach(function (it) {
                            if (!it || !it.marker) return;
                            var key = it.marker;
                            var isShown = nav.nearby.shown.has(key);
                            var shouldShow = desiredShown.has(key);
                            if (!isShown && shouldShow) {
                                nav.nearby.shown.add(key);
                                try { nav.nearby.layer.addLayer(it.marker); } catch (e) {}
                            } else if (isShown && !shouldShow) {
                                nav.nearby.shown.delete(key);
                                try { nav.nearby.layer.removeLayer(it.marker); } catch (e) {}
                            }
                        });
                    }
                }
            } catch (e) {}
            var effectiveDist = Number.isFinite(nav.lastRouteDist) ? nav.lastRouteDist : directDist;
            if (window.UbicatecVoiceNav) {
                window.UbicatecVoiceNav.updateUserLocation(u, nav.lastRouteLatLngs, effectiveDist);
            }
            if (!Number.isFinite(nav.lastRouteDist)) {
                setHudDistance(directDist);
            }
            if (directDist <= 10 && !nav.arrivalNotified) {
                nav.arrivalNotified = true;
                showArrivalModal();
                playArrivalSound();
                if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.announceArrival();
            }
        };

        window.ubInMapNav = nav;
        setMapUiForNavigation(true);
        if (hud) hud.style.display = 'block';
        if (hudStop) hudStop.onclick = function () {
            if (typeof window.ubicatecRequestCancelInMapNav === 'function') window.ubicatecRequestCancelInMapNav();
        };
        try { if (window.ubNavCancelEl) window.ubNavCancelEl.style.display = 'block'; } catch (e) {}

        try {
            var b = L.latLngBounds([userLL, destLL]);
            map.fitBounds(b, { padding: [50, 50] });
        } catch (e) {}

        setHudDistance(haversineMeters(userLL.lat, userLL.lng, destLL.lat, destLL.lng));
        if (window.UbicatecVoiceNav) {
            window.UbicatecVoiceNav.startRoute(nav.destTitle);
        }
        recalcRoute(userLL);
        try { nav.onPos(null, [userLL.lat, userLL.lng]); } catch (e) {}

        try { nav.onPos(window.ubUserLocation && window.ubUserLocation.lastPos ? window.ubUserLocation.lastPos : null, window.ubUserLocation && window.ubUserLocation.lastLL ? window.ubUserLocation.lastLL : null); } catch (e) {}
    };
    window.ubicatecStopInMapNav = function () {
        try {
            if (window.ubInMapNav && typeof window.ubInMapNav.stop === 'function') {
                window.ubInMapNav.stop();
            }
        } catch (e) {}
    };

    window.ubicatecRequestCancelInMapNav = function () {
        if (!window.ubInMapNav) return;
        var modal = document.getElementById('ubCancelNavModal');
        if (!modal) {
            if (confirm('¿Seguro que deseas cancelar el trayecto actual?')) {
                try { window.ubicatecStopInMapNav && window.ubicatecStopInMapNav(); } catch (e) {}
            }
            return;
        }
        var closeBtn = document.getElementById('ubCancelNavClose');
        var noBtn = document.getElementById('ubCancelNavNo');
        var yesBtn = document.getElementById('ubCancelNavYes');
        var close = function () { modal.style.display = 'none'; };
        if (!modal.__ubWired) {
            modal.__ubWired = true;
            if (closeBtn) closeBtn.addEventListener('click', close);
            if (noBtn) noBtn.addEventListener('click', close);
            if (yesBtn) {
                yesBtn.addEventListener('click', function () {
                    close();
                    try { window.ubicatecStopInMapNav && window.ubicatecStopInMapNav(); } catch (e) {}
                });
            }
            modal.addEventListener('click', function (e) {
                if (e.target === modal) close();
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modal.style.display === 'block') close();
            });
        }
        modal.style.display = 'block';
    };

    // --- SIMULADOR DE RUTA PARA DEPURACION (Fluido estilo Waze) ---
    (function initSimulator() {
        if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
        
        var simBtn = document.createElement('button');
        simBtn.id = 'ubSimBtn';
        simBtn.innerHTML = '&#9654; Simular Recorrido';
        simBtn.style.cssText = 'position: fixed; top: 70px; right: 70px; z-index: 9999; padding: 10px 16px; background: #e74c3c; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: none; transition: all 0.3s;';
        document.body.appendChild(simBtn);

        var simAnimFrame = null;
        var simPoints = [];
        var simTramoIdx = 0;
        var simStart = null;
        var DURACION_TRAMO = 600;

        function stopSimulation() {
            if (simAnimFrame) cancelAnimationFrame(simAnimFrame);
            simAnimFrame = null;
            simTramoIdx = 0;
            simStart = null;
            simBtn.innerHTML = '&#9654; Simular Recorrido';
            simBtn.style.background = '#e74c3c';
        }

        function haversineMeters(lat1, lon1, lat2, lon2) {
            var R = 6371e3;
            var a = Math.sin((lat2 - lat1) * Math.PI / 360) ** 2 +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin((lon2 - lon1) * Math.PI / 360) ** 2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }

        function interpolatePoints(points, stepMeters) {
            var res = [];
            for (var i = 0; i < points.length - 1; i++) {
                var p1 = points[i];
                var p2 = points[i+1];
                var d = haversineMeters(p1.lat, p1.lng, p2.lat, p2.lng);
                var steps = Math.max(1, Math.floor(d / stepMeters));
                for (var j = 0; j < steps; j++) {
                    var f = j / steps;
                    res.push(L.latLng(
                        p1.lat + (p2.lat - p1.lat) * f,
                        p1.lng + (p2.lng - p1.lng) * f
                    ));
                }
            }
            res.push(points[points.length - 1]);
            return res;
        }

        function calcularRumbo(p1, p2) {
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
            var progress = timestamp - simStart;
            var percent = Math.min(progress / DURACION_TRAMO, 1);

            if (simTramoIdx >= simPoints.length - 1 || !window.ubInMapNav) {
                stopSimulation();
                return;
            }

            var p1 = simPoints[simTramoIdx];
            var p2 = simPoints[simTramoIdx + 1];

            var lat = p1.lat + (p2.lat - p1.lat) * percent;
            var lng = p1.lng + (p2.lng - p1.lng) * percent;
            var u = L.latLng(lat, lng);

            try {
                if (!window.ubUserLocation) window.ubUserLocation = {};
                
                // Inyectar CSS del marcador si no existe
                if (!document.getElementById('ub-sim-marker-css')) {
                    var css = document.createElement('style');
                    css.id = 'ub-sim-marker-css';
                    css.textContent = '.user-marker-container{display:flex;align-items:center;justify-content:center}.user-marker-arrow{width:32px;height:32px;background:linear-gradient(135deg,#3498db 0%,#2980b9 100%);border-radius:50%;border:3px solid white;box-shadow:0 0 14px rgba(52,152,219,0.5),0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;transition:transform 0.15s ease-out}';
                    document.head.appendChild(css);
                }

                // Calcular rumbo para rotar la flecha
                var rumbo = calcularRumbo(p1, p2);
                var iconHtml = '<div class="user-marker-arrow" style="transform:rotate(' + rumbo + 'deg)"><i class="fas fa-location-arrow" style="transform:rotate(-45deg)"></i></div>';

                var simIcon = L.divIcon({
                    className: 'user-marker-container',
                    html: iconHtml,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                if (!window.ubUserLocation.marker) {
                    window.ubUserLocation.marker = L.marker(u, { icon: simIcon, zIndexOffset: 1000 }).addTo(window.map);
                } else {
                    window.ubUserLocation.marker.setLatLng(u);
                    window.ubUserLocation.marker.setIcon(simIcon);
                }

                if (Math.floor(progress / 33) % 5 === 0) {
                    window.map.panTo(u, { animate: true, duration: 0.2 });
                }

                if (percent >= 1) {
                    simTramoIdx++;
                    simStart = null;

                    var destLL = window.ubInMapNav.lastRouteLatLngs[window.ubInMapNav.lastRouteLatLngs.length - 1];
                    var dist = haversineMeters(u.lat, u.lng, destLL.lat, destLL.lng);
                    
                    if (window.UbicatecVoiceNav) {
                        window.UbicatecVoiceNav.updateUserLocation(u, window.ubInMapNav.lastRouteLatLngs, dist);
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

            var nav = window.ubInMapNav;
            if (!nav || !nav.lastRouteLatLngs || nav.lastRouteLatLngs.length < 2) {
                alert("No hay ruta trazada activa.");
                return;
            }

            simPoints = interpolatePoints(nav.lastRouteLatLngs, 2.5);
            simTramoIdx = 0;
            simStart = null;
            
            simBtn.innerHTML = '&#9209; Detener Simulacion';
            simBtn.style.background = '#c0392b';

            simAnimFrame = requestAnimationFrame(animar);
        });

        setInterval(function() {
            if (window.ubInMapNav && window.ubInMapNav.lastRouteLatLngs) {
                if (simBtn.style.display === 'none') simBtn.style.display = 'block';
            } else {
                if (simBtn.style.display === 'block') {
                    simBtn.style.display = 'none';
                    stopSimulation();
                }
            }
        }, 1000);
    })();
});


