/**
 * Lógica de Detalle de Evento y Navegación GPS
 * 
 * Este script maneja:
 * 1. Carga de parámetros del evento desde la URL
 * 2. Visualización dinámica de la información del evento
 * 3. Inicialización del mapa (Leaflet) con la ubicación del evento
 * 4. Funcionalidad de Geolocalización y Brújula (DeviceOrientation)
 * 5. Cálculo de distancia y rumbo hacia el destino
 * 6. Notificaciones de llegada
 */

// Importar configuración de tipos de eventos
import { getEventTypeConfig, generateEventDescription } from './event-types.js';

// Variables globales para el mapa
let mapaEvento = null;
        let marcadorAuditorio = null;
        let marcadorUbicacionActual = null;
        let circuloPrecision = null;
        let watchId = null;
        let geolocalizacionActiva = false;
        let llegadaNotificada = false;

        // Variables para la brújula
        let currentHeading = 0;
        let targetBearing = 0;
        let ubGeoSuccessTracked = false;
        let ubMapInitTracked = false;
        let ubArrivalTracked = false;

function ubTrack(name, options) {
            try { window.ubicatecTrack && window.ubicatecTrack(name, options); } catch {}
        }

// Función para actualizar la rotación de la flecha
/**
 * Actualiza la rotación de la flecha de dirección en la UI.
 * Calcula el ángulo relativo entre el rumbo al destino y la orientación actual del dispositivo.
 */
function updateArrow() {
            const flechaIcono = document.getElementById('iconoFlecha');
            if (flechaIcono) {
                // Calcular rotación relativa: Rumbo Destino - Orientación Dispositivo
                let relativeHeading = targetBearing - currentHeading;
                
                // Normalizar el ángulo para tomar el camino más corto (-180 a 180)
                while (relativeHeading <= -180) relativeHeading += 360;
                while (relativeHeading > 180) relativeHeading -= 360;

                // Aplicar rotación suave
                flechaIcono.style.transition = 'transform 0.1s linear';
                flechaIcono.style.transform = `rotate(${relativeHeading}deg)`;
                
                const flechaContainer = document.getElementById('flechaDireccion');
                if (flechaContainer) flechaContainer.style.display = 'flex';
            }
        }

// Función para manejar eventos de orientación
/**
 * Maneja los eventos de orientación del dispositivo (brújula).
 * Soporta iOS (webkitCompassHeading) y Android (deviceorientationabsolute/standard).
 * @param {DeviceOrientationEvent} event 
 */
function handleOrientation(event) {
            let heading = null;
            
            if (event.webkitCompassHeading) {
                // iOS - siempre es absoluto
                heading = event.webkitCompassHeading;
            } else if (event.type === 'deviceorientationabsolute' && event.alpha !== null) {
                // Android Absolute - Prioridad alta
                heading = 360 - event.alpha;
                absoluteEventReceived = true;
            } else if ((event.type === 'deviceorientation' || !event.type) && event.alpha !== null) {
                // Android Standard
                // (!event.type check es por si acaso se llama manualmente o en entornos raros, aunque usualmente tiene type)
                
                // Si ya recibimos eventos absolutos reales, ignoramos los eventos 'deviceorientation'
                // estándar que no sean explícitamente absolutos.
                if (absoluteEventReceived && !event.absolute) {
                    return;
                }

                if (event.absolute || heading === null) {
                    heading = 360 - event.alpha;
                }
            }
            
            if (heading !== null) {
                currentHeading = heading;
                updateArrow();
            }
        }

// Función para obtener parámetros de la URL
/**
 * Extrae y decodifica los parámetros de la URL para mostrar la información del evento.
 * Provee valores por defecto si no existen.
 * @returns {Object} Objeto con los datos del evento
 */
function obtenerParametrosURL() {
            const urlParams = new URLSearchParams(window.location.search);
            return {
                tipo: urlParams.get('tipo') || 'PONENCIA',
                hora: urlParams.get('hora') || '9:00 - 10:00',
                titulo: urlParams.get('titulo') || 'Análisis de señales Fetales con inteligencia Artificial y fusión de datos multimodal',
                ponente: urlParams.get('ponente') || 'Sócrates Reyes Romero',
                empresa: urlParams.get('empresa') || 'INAOE - Puebla',
                ubicacion: urlParams.get('ubicacion') || 'Edificio 36',
                categoria: urlParams.get('categoria') || 'IA'
            };
        }

// Función para cargar datos del evento
/**
 * Renderiza la información del evento en el DOM basándose en los parámetros de la URL.
 * Ajusta estilos, campos y contenido según el tipo de evento.
 */
function cargarDatosEvento() {
    const params = obtenerParametrosURL();
    
    // Obtener configuración del tipo de evento
    const typeConfig = getEventTypeConfig(params.tipo);
    
    // Ajustar ubicación según el tipo de evento
    if (params.tipo === 'TALLER') {
        params.ubicacion = 'Edificio 36';
    } else if (params.tipo === 'PONENCIA') {
        if (params.ubicacion.includes('Auditorio 1')) {
            params.ubicacion = 'Auditorio 1 - Edificio 53';
        } else if (params.ubicacion.includes('Auditorio 2')) {
            params.ubicacion = 'Auditorio 2 - Edificio 53';
        } else {
            params.ubicacion = 'Auditorio 1 - Edificio 53';
        }
    }
    
    // Actualizar título de la página
    document.title = `${params.titulo} - UBICATEC`;
    
    // Actualizar contenido básico
    document.getElementById('evento-titulo').textContent = params.titulo;
    document.getElementById('evento-tipo-texto').textContent = typeConfig.name;
    document.getElementById('evento-hora').textContent = params.hora;
    document.getElementById('evento-titulo-detalle').textContent = params.titulo;
    document.getElementById('evento-ponente').textContent = params.ponente;
    document.getElementById('evento-empresa').textContent = params.empresa;
    document.getElementById('evento-ubicacion').textContent = params.ubicacion;
    
    // Actualizar icono del tipo de evento
    const eventoIcono = document.getElementById('evento-icono');
    eventoIcono.className = typeConfig.icon;
    
    // Aplicar esquema de colores del tipo de evento
    const eventHeader = document.getElementById('evento-header');
    eventHeader.style.background = typeConfig.colorScheme.gradient;
    
    const eventBadge = document.getElementById('evento-tipo');
    eventBadge.style.background = 'rgba(255, 255, 255, 0.2)';
    
    // Actualizar labels dinámicamente
    document.getElementById('label-persona').textContent = typeConfig.fields.person + ':';
    document.getElementById('label-organizacion').textContent = typeConfig.fields.organization + ':';
    document.getElementById('label-ubicacion').textContent = typeConfig.fields.location + ':';
    
    // Mostrar/ocultar campos según configuración
    toggleFieldVisibility('person', typeConfig.showPerson);
    toggleFieldVisibility('organization', typeConfig.showOrganization);
    toggleFieldVisibility('location', typeConfig.showLocation);
    
    // Mostrar campos adicionales específicos del tipo
    if (typeConfig.additionalFields && typeConfig.additionalFields.length > 0) {
        typeConfig.additionalFields.forEach(field => {
            toggleFieldVisibility(field, true);
            // Asignar valores si existen en los parámetros
            if (params[field]) {
                document.getElementById(`evento-${field}`).textContent = params[field];
            }
        });
    }
    
    // Ocultar todos los demás campos adicionales
    const allAdditionalFields = ['categoria', 'carrera', 'desafio', 'equipos', 'deporte', 'modalidad', 'genero', 'duracion', 'materia', 'nivel'];
    allAdditionalFields.forEach(field => {
        if (!typeConfig.additionalFields || !typeConfig.additionalFields.includes(field)) {
            toggleFieldVisibility(field, false);
        }
    });
    
    // Generar descripción contextual
    const descripcion = generateEventDescription(params);
    document.getElementById('evento-descripcion').textContent = descripcion;
}

// Función para mostrar/ocultar campos
function toggleFieldVisibility(fieldName, show) {
    const fieldElement = document.getElementById(`info-${fieldName}`);
    if (fieldElement) {
        fieldElement.style.display = show ? 'flex' : 'none';
    }
}

// Función para inicializar el mapa
/**
 * Inicializa el mapa Leaflet centrado en la ubicación del evento (Auditorio 1, 2 o Lab).
 * Añade marcadores y popups informativos.
 */
function inicializarMapaEvento() {
            if (mapaEvento) return;
            
            // Obtener parámetros para determinar si es taller
            const params = obtenerParametrosURL();
            let coordenadasAuditorio;
            let tituloMarcador;
            let descripcionMarcador;
            
            if (params.tipo === 'TALLER') {
                // Para talleres, usar coordenadas del Edificio 36
                coordenadasAuditorio = [19.068163, -98.17027];
                tituloMarcador = 'Edificio 36';
                descripcionMarcador = 'Laboratorio de TICS - Redes, programación, bases de datos';
            } else if (params.tipo === 'PONENCIA') {
                // Para ponencias, usar coordenadas del Edificio 53
                coordenadasAuditorio = [19.070901, -98.169714];
                // Determinar si es Auditorio 1 o 2
                if (params.ubicacion.includes('Auditorio 2')) {
                    tituloMarcador = 'Auditorio 2';
                } else {
                    tituloMarcador = 'Auditorio 1';
                }
                descripcionMarcador = 'Edificio 53 - Ciencias básicas, WC';
            }
            
            mapaEvento = L.map('mapa').setView(coordenadasAuditorio, 20);
            if (!ubMapInitTracked) {
                ubMapInitTracked = true;
                ubTrack('event_map_init', { label: tituloMarcador || '' });
            }
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapaEvento);
            
            marcadorAuditorio = L.marker(coordenadasAuditorio, {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="background: #007bff; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"><svg style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2;" viewBox="0 0 24 24"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/><path d="M18 12h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"/></svg></div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(mapaEvento);
            
            marcadorAuditorio.bindPopup(`
                <div style="text-align: center;">
                    <h4 style="color: #007bff; margin-bottom: 10px;">${tituloMarcador}</h4>
                    <p style="margin-bottom: 8px;"><strong>${descripcionMarcador}</strong></p>
                </div>
            `).openPopup();
        }

        // Función para mostrar el mapa con modal de confirmación
        function mostrarMapa() {
            try {
                const p = obtenerParametrosURL();
                ubTrack('event_location_prompt', { label: p.ubicacion || '' });
            } catch {}
            // Crear modal de confirmación si no existe
            if (!document.getElementById('avisoModalEvento')) {
                const modal = document.createElement('div');
                modal.id = 'avisoModalEvento';
                modal.className = 'modal';
                modal.style.display = 'none';
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close-button" id="cerrarAvisoBtnEvento">&times;</span>
                        <h2>Ubicación</h2>
                        <p>Para obtener tu ubicación actual y guiarte al auditorio, necesitamos acceso a tu ubicación. ¿Deseas continuar?</p>
                        <button id="continuarBtnEvento" class="btn btn-primary">Continuar</button>
                    </div>
                `;
                document.body.appendChild(modal);
                
                // Event listeners para el modal
                document.getElementById('cerrarAvisoBtnEvento').addEventListener('click', () => {
                    modal.style.display = 'none';
                });
                
                document.getElementById('continuarBtnEvento').addEventListener('click', () => {
                    modal.style.display = 'none';
                    try {
                        const p = obtenerParametrosURL();
                        ubTrack('event_location_start', { label: p.ubicacion || '' });
                    } catch {}
                    mostrarMapaEmergente();

                    // Solicitar permisos de orientación
                    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                        DeviceOrientationEvent.requestPermission()
                            .then(response => {
                                if (response === 'granted') {
                                    window.addEventListener('deviceorientation', handleOrientation);
                                }
                            })
                            .catch(console.error);
                    } else {
                        // Android y otros: Escuchar AMBOS eventos para asegurar compatibilidad
                        if ('ondeviceorientationabsolute' in window) {
                            window.addEventListener('deviceorientationabsolute', handleOrientation);
                        }
                        // Siempre escuchar el estándar como fallback
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                });
            }
            
            document.getElementById('avisoModalEvento').style.display = 'block';
        }

        // Función para mostrar el mapa emergente
        function mostrarMapaEmergente() {
            const mapaEmergente = document.getElementById('mapaEmergente');
            mapaEmergente.style.display = 'flex';
            try {
                const p = obtenerParametrosURL();
                ubTrack('event_map_open', { label: p.ubicacion || '' });
            } catch {}
            
            setTimeout(() => {
                inicializarMapaEvento();
                if (mapaEvento) mapaEvento.invalidateSize();
                activarGeolocalizacion();
            }, 100);
        }

        // Función para calcular distancia
        function calcularDistancia(lat1, lon1, lat2, lon2) {
            const R = 6371e3;
            const phi1 = lat1 * Math.PI/180;
            const phi2 = lat2 * Math.PI/180;
            const dPhi = (lat2-lat1) * Math.PI/180;
            const dLambda = (lon2-lon1) * Math.PI/180;

            const a = Math.sin(dPhi/2) * Math.sin(dPhi/2) +
                    Math.cos(phi1) * Math.cos(phi2) *
                    Math.sin(dLambda/2) * Math.sin(dLambda/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

            return R * c;
        }

        // Función para actualizar contador de distancia
        function actualizarContadorDistancia(lat, lng) {
            const params = obtenerParametrosURL();
            let auditorioLat, auditorioLng;
            
            if (params.tipo === 'TALLER') {
                // Para talleres, usar coordenadas del Edificio 36
                auditorioLat = 19.068163;
                auditorioLng = -98.17027;
            } else if (params.tipo === 'PONENCIA') {
                // Para ponencias, usar coordenadas del Edificio 53 (mismo edificio para ambos auditorios)
                auditorioLat = 19.070901;
                auditorioLng = -98.169714;
            }
            
            const distancia = calcularDistancia(lat, lng, auditorioLat, auditorioLng);
            const distanciaM = Math.round(distancia);
            
            let mensajeDistancia = `${distanciaM} metros restantes`;
            
            // Actualizar el contador en el mapa emergente
            const distanciaElement = document.getElementById('distanciaEnMapa');
            if (distanciaElement) {
                distanciaElement.innerHTML = `<strong>Distancia al auditorio: ${mensajeDistancia}</strong>`;
            }
            
            // Verificar si se ha llegado al destino (distancia menor a 10 metros)
            if (distanciaM <= 10 && !llegadaNotificada) {
                mostrarNotificacionLlegada();
                llegadaNotificada = true;
            }
        }

        // Función para reproducir sonido de notificación
        function reproducirSonidoLlegada() {
            try {
                const audio = new Audio('mp3/llegada.mp3');
                audio.volume = 0.7; // Volumen moderado
                audio.play().catch(e => {
                    // // console.log('No se pudo reproducir el sonido:', e);
                });
            } catch (error) {
                // // console.log('Error al cargar el archivo de audio:', error);
            }
        }

        // Función para mostrar notificación de llegada
        function mostrarNotificacionLlegada() {
            if (!ubArrivalTracked) {
                ubArrivalTracked = true;
                try {
                    const p = obtenerParametrosURL();
                    ubTrack('event_arrival', { label: p.ubicacion || '' });
                } catch {}
            }
            // Reproducir sonido de llegada
            reproducirSonidoLlegada();
            // Crear modal de llegada si no existe
            if (!document.getElementById('llegadaModalEvento')) {
                const modal = document.createElement('div');
                modal.id = 'llegadaModalEvento';
                modal.className = 'modal';
                modal.style.display = 'none';
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close-button" id="cerrarLlegadaBtnEvento">&times;</span>
                        <h2>¡Has llegado!</h2>
                        <p>Has llegado al auditorio. ¡Bienvenido al evento!</p>
                        <button id="cerrarLlegadaOkBtnEvento" class="btn btn-primary">Ok</button>
                    </div>
                `;
                document.body.appendChild(modal);
                
                // Event listeners para el modal de llegada
                document.getElementById('cerrarLlegadaBtnEvento').addEventListener('click', () => {
                    modal.style.display = 'none';
                });
                
                document.getElementById('cerrarLlegadaOkBtnEvento').addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            }
            
            document.getElementById('llegadaModalEvento').style.display = 'block';
        }

// Función para activar geolocalización
/**
 * Inicia el seguimiento de la posición del usuario (watchPosition).
 * Actualiza el marcador de usuario, calcula distancia y rumbo en tiempo real.
 * Dibuja un círculo de precisión alrededor del usuario.
 */
function activarGeolocalizacion() {
            if (!navigator.geolocation) {
                alert('La geolocalización no está soportada por este navegador.');
                return;
            }

            // Icono personalizado para el usuario
            const iconoUsuario = L.icon({
                iconUrl: 'Icon/mark.png',
                iconSize: [27, 35],
                iconAnchor: [12, 39],
                popupAnchor: [1, -34]
            });

            // Opciones para el seguimiento
            const opcionesSeguimiento = {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            };

            function exitoUbicacion(pos) {
                const q = window.UbicatecLocationQuality && window.UbicatecLocationQuality.processPosition
                    ? window.UbicatecLocationQuality.processPosition(pos)
                    : null;
                if (q && !q.use) return;

                const latitudUsuario = q ? q.lat : pos.coords.latitude;
                const longitudUsuario = q ? q.lng : pos.coords.longitude;
                const precision = q ? q.accuracy : pos.coords.accuracy;
                if (!ubGeoSuccessTracked) {
                    ubGeoSuccessTracked = true;
                    try { ubTrack('event_geo_success', { label: `${Math.round(precision || 0)}m` }); } catch {}
                }

                if (marcadorUbicacionActual) {
                    marcadorUbicacionActual.setLatLng([latitudUsuario, longitudUsuario]);
                } else {
                    marcadorUbicacionActual = L.marker([latitudUsuario, longitudUsuario], {icon: iconoUsuario}).addTo(mapaEvento)
                        .bindPopup('Tu ubicación actual').openPopup();
                }

                // Calcular coordenadas del destino
                const params = obtenerParametrosURL();
                let auditorioLat, auditorioLng;
                if (params.tipo === 'TALLER') {
                    auditorioLat = 19.068163;
                    auditorioLng = -98.17027;
                } else {
                    auditorioLat = 19.070901;
                    auditorioLng = -98.169714;
                }

                // Calcular rumbo
                const rumbo = calcularRumbo(latitudUsuario, longitudUsuario, auditorioLat, auditorioLng);

                // Actualizar variable global y flecha
                targetBearing = rumbo;
                updateArrow();

                // Actualizar círculo de precisión
                if (circuloPrecision) {
                    mapaEvento.removeLayer(circuloPrecision);
                }
                // Solo mostrar si la precisión es razonable (por ejemplo, menor a 500m)
                if (precision < 500) {
                     circuloPrecision = L.circle([latitudUsuario, longitudUsuario], {
                        radius: precision,
                        color: '#3498db',
                        fillColor: '#3498db',
                        fillOpacity: 0.15,
                        weight: 1
                    }).addTo(mapaEvento);
                }

                // Fallback GPS: Si nos movemos rápido (> 1 m/s) y tenemos heading GPS, usarlo
                if (pos.coords.speed && pos.coords.speed > 1 && pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
                    currentHeading = pos.coords.heading;
                    updateArrow();
                }

                mapaEvento.panTo(new L.LatLng(latitudUsuario, longitudUsuario));

                // Calcular distancia
                const distancia = calcularDistancia(latitudUsuario, longitudUsuario, auditorioLat, auditorioLng);
                actualizarContadorDistancia(latitudUsuario, longitudUsuario);

                // Verificar llegada
                if (distancia <= 10 && !llegadaNotificada) {
                    mostrarNotificacionLlegada();
                    llegadaNotificada = true;
                }
            }

            function errorUbicacion(err) {
                console.warn('ERROR(' + err.code + '): ' + err.message);
                try { ubTrack('event_geo_error', { label: `code:${err.code || ''}` }); } catch {}
                if (window.UbicatecLocationQuality && window.UbicatecLocationQuality.reportError) {
                    window.UbicatecLocationQuality.reportError(err);
                }
                alert('No se pudo obtener la ubicación.');
            }

            navigator.geolocation.watchPosition(exitoUbicacion, errorUbicacion, opcionesSeguimiento);
            mapaEvento.invalidateSize();
        }

        // Función para desactivar geolocalización
        function desactivarGeolocalizacion() {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }

            if (marcadorUbicacionActual) {
                mapaEvento.removeLayer(marcadorUbicacionActual);
                marcadorUbicacionActual = null;
            }

            if (circuloPrecision) {
                mapaEvento.removeLayer(circuloPrecision);
                circuloPrecision = null;
            }

            geolocalizacionActiva = false;
            llegadaNotificada = false;
            
            // Remover listeners de orientación
            window.removeEventListener('deviceorientation', handleOrientation);
            if ('ondeviceorientationabsolute' in window) {
                window.removeEventListener('deviceorientationabsolute', handleOrientation);
            }
        }

// Función para calcular rumbo
/**
 * Calcula el rumbo (bearing) en grados desde un punto A a un punto B.
 * Fórmula de Haversine para rumbo inicial.
 * @param {number} lat1 - Latitud origen
 * @param {number} lon1 - Longitud origen
 * @param {number} lat2 - Latitud destino
 * @param {number} lon2 - Longitud destino
 * @returns {number} Rumbo en grados (0-360)
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

        // Inicializar página
        document.addEventListener('DOMContentLoaded', function() {
            cargarDatosEvento();
            try {
                const p = obtenerParametrosURL();
                ubTrack('event_detail_open', { label: `${p.tipo || ''}|${p.ubicacion || ''}` });
            } catch {}
            
            // Event listeners
            document.getElementById('verUbicacionBtn').addEventListener('click', function () {
                try {
                    const p = obtenerParametrosURL();
                    ubTrack('event_location_click', { label: p.ubicacion || '' });
                } catch {}
                mostrarMapa();
            });
            document.getElementById('cerrarMapaBtn').addEventListener('click', function() {
                document.getElementById('mapaEmergente').style.display = 'none';
                try { ubTrack('event_map_close'); } catch {}
                if (geolocalizacionActiva) {
                    desactivarGeolocalizacion();
                }
            });
        });
