/**
 * Ubicatec - Index Page Scripts
 * 
 * Contiene la lógica específica para la página de inicio (index.html).
 * Funcionalidades principales:
 * - Inicialización de animaciones AOS.
 * - Lógica de "Scroll Snap" personalizada para el Hero Section (cambio entre logo y contenido).
 * - Sistema de notificaciones tipo "Toast".
 * - Verificación de eventos en curso (Jornadas).
 * - Lógica de Scroll Suave (Lenis).
 */



/* =========================================
   AOS Initialization (Animaciones al hacer scroll)
   ========================================= */
// Esperamos a que el DOM esté listo o ejecutamos si estamos al final del body
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });
} else {
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                mirror: false
            });
        }
    });
}



/* =========================================
   Lenis Smooth Scroll (Scroll Suave)
   ========================================= */
/**
 * Inicializa y configura la librería Lenis para un desplazamiento suave en la página.
 * Se desactiva en móviles para permitir el comportamiento nativo de swipe.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si Lenis está disponible
    if (typeof Lenis === 'undefined') {
        console.warn('Lenis no está cargado');
        return;
    }

    // Inicializar Lenis para smooth scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Función de animación para Lenis
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sincronizar Lenis con eventos de scroll
    lenis.on('scroll', (e) => {
        // Actualizar AOS cuando se hace scroll con Lenis
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    });

    // Detectar si estamos en mobile
    const isMobileDevice = window.innerWidth <= 768;
    
    // En mobile, Lenis trabaja diferente debido al sistema de swipe horizontal
    if (isMobileDevice) {
        // En mobile desactivamos el smooth scroll de Lenis ya que usamos swipe
        lenis.stop();
    }

    // Exponer Lenis globalmente
    window.lenis = lenis;

    // Reiniciar Lenis cuando cambia el tamaño de ventana
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const nowMobile = window.innerWidth <= 768;
            if (nowMobile) {
                lenis.stop();
            } else {
                lenis.start();
            }
        }, 250);
    });
});

/* =========================================
   Notification System (Sistema de Notificaciones)
   ========================================= */
/**
 * SISTEMA DE NOTIFICACIONES EN CÁPSULAS
 * Clase que gestiona la creación, visualización y eliminación de notificaciones flotantes.
 */

// Clase para gestionar notificaciones
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notificationContainer');
        this.notifications = [];
        this.maxNotifications = 5;
        
        if (!this.container) {
            console.error('❌ No se encontró el contenedor de notificaciones!');
        }
    }

    // Crear notificación
    show(options) {
        const {
            type = 'info',
            title = 'Notificación',
            message = '',
            badge = 'NUEVO AVISO',
            duration = 5000,
            onClick = null,
            closable = true
        } = options;

        // Limitar número de notificaciones
        if (this.notifications.length >= this.maxNotifications) {
            this.removeOldest();
        }

        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification-capsule ${type}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'notification-content';

        if (badge) {
            const badgeDiv = document.createElement('div');
            badgeDiv.className = 'notification-badge';
            badgeDiv.textContent = badge;
            contentDiv.appendChild(badgeDiv);
        }

        const titleDiv = document.createElement('div');
        titleDiv.className = 'notification-title';
        titleDiv.textContent = title;
        contentDiv.appendChild(titleDiv);

        if (message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'notification-message';
            messageDiv.textContent = message;
            contentDiv.appendChild(messageDiv);
        }

        notification.appendChild(contentDiv);

        if (closable) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'notification-close';
            closeBtn.textContent = '×';
            notification.appendChild(closeBtn);
        }

        // Agregar al contenedor
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Evento de click en cerrar
        if (closable) {
            const closeBtn = notification.querySelector('.notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.remove(notification);
                });
            }
        }

        // Evento de click en la notificación
        if (onClick) {
            notification.style.cursor = 'pointer';
            notification.addEventListener('click', () => {
                onClick();
                this.remove(notification);
            });
        }

        // Auto-eliminar después del tiempo especificado
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    }

    // Eliminar notificación
    remove(notification) {
        if (!notification || !notification.parentElement) return;
        
        notification.classList.add('removing');
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    // Eliminar la notificación más antigua
    removeOldest() {
        if (this.notifications.length > 0) {
            this.remove(this.notifications[0]);
        }
    }

    // Limpiar todas las notificaciones
    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
    }

    // Métodos de acceso rápido
    info(title, message, options = {}) {
        return this.show({ ...options, type: 'info', title, message });
    }

    success(title, message, options = {}) {
        return this.show({ ...options, type: 'success', title, message });
    }

    warning(title, message, options = {}) {
        return this.show({ ...options, type: 'warning', title, message });
    }

    error(title, message, options = {}) {
        return this.show({ ...options, type: 'error', title, message });
    }
}

// Inicializar sistema de notificaciones globalmente
// Nota: Se ejecutará cuando se cargue este script
window.notifications = new NotificationSystem();

// Exponer funciones globales para fácil acceso desde cualquier script
window.showNotification = (type, title, message, options = {}) => {
    return window.notifications.show({ type, title, message, ...options });
};

// Función para mostrar notificación manualmente (útil para testing)
window.mostrarNotificacionAviso = function() {
    window.notifications.info(
        'Hay un anuncio disponible',
        '',
        {
            badge: 'AVISO',
            duration: 0,
            closable: true,
            onClick: () => {
                if (typeof window.abrirModalAnuncio === 'function') window.abrirModalAnuncio();
            }
        }
    );
};

// Sistema de detección de avisos (DOMContentLoaded para asegurar que el DOM está listo)
document.addEventListener('DOMContentLoaded', function() {
    const modalAnuncio = document.getElementById('modalAnuncio');
    const titleEl = document.getElementById('modalAnuncioTitulo');
    const bodyEl = document.getElementById('modalAnuncioMensaje');
    const badgeEl = document.getElementById('modalAnuncioBadge');
    const btnEl = document.getElementById('masInformacion');

    if (!modalAnuncio) return;

    function parseDateSafe(value) {
        if (!value) return null;
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    function isActiveAnuncio(anuncio, now) {
        if (anuncio && anuncio.publicado === false) return false;
        const start = parseDateSafe(anuncio && anuncio.inicio);
        const end = parseDateSafe(anuncio && anuncio.fin);
        if (start && now < start) return false;
        if (end && now > end) return false;
        return true;
    }

    function setModalFromAnuncio(anuncio) {
        if (titleEl) titleEl.textContent = (anuncio && anuncio.titulo) ? anuncio.titulo : '';
        if (badgeEl) badgeEl.textContent = (anuncio && anuncio.badge) ? anuncio.badge : '';
        if (bodyEl) {
            bodyEl.innerHTML = ''; // Limpiamos contenedor de forma segura

            const html = (anuncio && anuncio.mensaje_html) ? anuncio.mensaje_html : '';
            const img = (anuncio && anuncio.imagen_url) ? String(anuncio.imagen_url).trim() : '';
            
            if (img) {
                const imgContainer = document.createElement('div');
                imgContainer.style.marginBottom = '12px';
                imgContainer.style.textAlign = 'center';
                
                const imgEl = document.createElement('img');
                imgEl.setAttribute('data-ubicatec-flyer', '1');
                imgEl.src = img;
                imgEl.alt = 'Flyer del anuncio';
                imgEl.style.width = '100%';
                imgEl.style.maxWidth = '100%';
                imgEl.style.height = 'auto';
                imgEl.style.borderRadius = '12px';
                imgEl.style.display = 'block';
                imgEl.style.margin = '0 auto';
                imgEl.style.objectFit = 'contain';
                imgEl.loading = 'lazy';
                imgEl.referrerPolicy = 'no-referrer';

                imgEl.addEventListener('error', () => {
                    const src = imgEl.getAttribute('src') || '';
                    imgEl.style.display = 'none';
                    if (src && imgEl.parentElement) {
                        const link = document.createElement('a');
                        link.href = src;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.textContent = 'Ver flyer';
                        link.style.display = 'inline-block';
                        link.style.marginBottom = '12px';
                        link.addEventListener('click', () => {
                            if (typeof window.ubicatecTrack === 'function') {
                                window.ubicatecTrack('announcement_flyer_open', { label: (anuncio && anuncio.id) ? String(anuncio.id) : 'default' });
                            }
                        });
                        imgEl.parentElement.appendChild(link);
                    }
                });
                
                imgContainer.appendChild(imgEl);
                bodyEl.appendChild(imgContainer);
            }

            if (html) {
                // Previene XSS inyectando el contenido solo como texto plano
                const textContainer = document.createElement('div');
                textContainer.style.whiteSpace = 'pre-wrap';
                textContainer.textContent = html;
                bodyEl.appendChild(textContainer);
            }
        }

        try {
            const modal = document.getElementById('modalAnuncio');
            if (modal) modal.dataset.anuncioId = (anuncio && anuncio.id) ? String(anuncio.id) : '';
        } catch (e) {}
        const url = (anuncio && anuncio.url) ? String(anuncio.url).trim() : '';
        const text = (anuncio && anuncio.boton_texto) ? String(anuncio.boton_texto).trim() : '';
        if (btnEl) {
            if (url) {
                btnEl.style.display = '';
                btnEl.textContent = text || 'Más información';
                btnEl.dataset.url = url;
            } else {
                btnEl.style.display = 'none';
                btnEl.textContent = '';
                btnEl.dataset.url = '';
            }
        }
    }

    function normalizeFirestoreAnnouncement(doc) {
        if (!doc) return null;
        const data = doc.data || doc;
        return {
            id: doc.id || data.id || '',
            publicado: data.published !== undefined ? Boolean(data.published) : true,
            titulo: data.title || '',
            mensaje_html: data.html || '',
            badge: data.badge || '',
            badgeColor: data.badgeColor || 'EF4444',
            boton_texto: data.buttonText || '',
            url: data.url || '',
            imagen_url: data.imageUrl || '',
            auto_abrir: Boolean(data.autoOpen),
            prioridad: Number(data.priority || 0),
            flyerSize: Number(data.flyerSize || 100),
            inicio: data.startAt && data.startAt.toDate ? data.startAt.toDate().toISOString() : (data.startAt || ''),
            fin: data.endAt && data.endAt.toDate ? data.endAt.toDate().toISOString() : (data.endAt || '')
        };
    }

    let loadedAnnouncements = [];

    function renderCapsule(anuncios) {
        loadedAnnouncements = anuncios || [];
        
        const bellBtn = document.getElementById('notification-bell-btn');
        if (bellBtn) {
            // Reemplazamos eventos previos
            const newBellBtn = bellBtn.cloneNode(true);
            bellBtn.parentNode.replaceChild(newBellBtn, bellBtn);
            
            const badge = newBellBtn.querySelector('.notification-badge');
            
            if (loadedAnnouncements.length > 0) {
                newBellBtn.classList.add('has-unread');
                if (badge) {
                    badge.style.display = 'flex';
                    badge.textContent = loadedAnnouncements.length;
                }
            } else {
                newBellBtn.classList.remove('has-unread');
                if (badge) {
                    badge.style.display = 'none';
                }
            }
            
            newBellBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                newBellBtn.classList.remove('has-unread');
                if (badge) badge.style.display = 'none';
                
                const dropdown = document.getElementById('notifications-dropdown');
                if (dropdown) {
                    if (dropdown.style.display === 'block') {
                        dropdown.style.display = 'none';
                    } else {
                        renderNotificationsDropdown(loadedAnnouncements, dropdown);
                        dropdown.style.display = 'block';
                    }
                }
            });
        }
    }

    // Función para convertir hex a rgb para el fondo translúcido del badge
    function hexToRgb(hex) {
        let c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test('#'+hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return [(c>>16)&255, (c>>8)&255, c&255].join(',');
        }
        return '239, 68, 68'; // default
    }

    function renderNotificationsDropdown(anuncios, container) {
        container.innerHTML = '';
        
        // Agregar cabecera
        const header = document.createElement('div');
        header.className = 'notifications-header';
        header.innerHTML = '<h3><i class="fas fa-bell"></i> Notificaciones</h3>';
        container.appendChild(header);

        // Contenedor de lista
        const list = document.createElement('div');
        list.className = 'notifications-list';
        container.appendChild(list);

        if (anuncios.length === 0) {
            list.innerHTML = '<div style="padding: 32px 16px; text-align: center; color: #9ca3af; font-size: 14px; display:flex; flex-direction:column; align-items:center; gap:12px;"><i class="fas fa-inbox" style="font-size:24px; opacity:0.5;"></i>No hay avisos nuevos</div>';
            return;
        }

        anuncios.forEach((anuncio) => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            
            const badgeColorHex = anuncio.badgeColor || 'EF4444';

            // Extraer un fragmento de texto del html para mostrar como subtítulo si es posible
            let bodyPreview = '';
            if (anuncio.mensaje_html) {
                let text = anuncio.mensaje_html.trim();
                if (text.length > 55) text = text.substring(0, 55) + '...';
                
                const previewDiv = document.createElement('div');
                previewDiv.style.color = '#9ca3af';
                previewDiv.style.fontSize = '12.5px';
                previewDiv.style.lineHeight = '1.5';
                previewDiv.textContent = text;
                bodyPreview = previewDiv;
            }

            const contentContainer = document.createElement('div');
            contentContainer.style.display = 'flex';
            contentContainer.style.flexDirection = 'column';
            contentContainer.style.justifyContent = 'center';
            contentContainer.style.flexGrow = '1';
            contentContainer.style.overflow = 'hidden';
            contentContainer.style.position = 'relative';
            contentContainer.style.zIndex = '1';

            if (anuncio.badge) {
                const badgeContainer = document.createElement('div');
                const badgeSpan = document.createElement('span');
                badgeSpan.style.fontSize = '9px';
                badgeSpan.style.color = `#${badgeColorHex}`;
                badgeSpan.style.textTransform = 'uppercase';
                badgeSpan.style.letterSpacing = '0.8px';
                badgeSpan.style.display = 'inline-block';
                badgeSpan.style.marginBottom = '6px';
                badgeSpan.style.fontWeight = '800';
                badgeSpan.style.border = `1px solid #${badgeColorHex}`;
                badgeSpan.style.background = 'transparent';
                badgeSpan.style.padding = '3px 8px';
                badgeSpan.style.borderRadius = '6px';
                badgeSpan.textContent = anuncio.badge;
                badgeContainer.appendChild(badgeSpan);
                contentContainer.appendChild(badgeContainer);
            }

            const titleDiv = document.createElement('div');
            titleDiv.style.color = '#f3f4f6';
            titleDiv.style.fontSize = '14.5px';
            titleDiv.style.fontWeight = '600';
            titleDiv.style.marginBottom = '4px';
            titleDiv.style.lineHeight = '1.3';
            titleDiv.style.letterSpacing = '0.2px';
            titleDiv.textContent = anuncio.titulo || 'Nuevo Aviso';
            contentContainer.appendChild(titleDiv);

            if (bodyPreview) {
                contentContainer.appendChild(bodyPreview);
            }

            item.appendChild(contentContainer);

            item.addEventListener('click', () => {
                document.getElementById('notifications-dropdown').classList.remove('show');
                setTimeout(() => {
                    document.getElementById('notifications-dropdown').style.display = 'none';
                }, 300); // esperar a que termine la animación
                if (typeof window.ubicatecTrack === 'function') {
                    window.ubicatecTrack('announcement_open', { label: String(anuncio.id) });
                }
                setModalFromAnuncio(anuncio);
                if (modalAnuncio) modalAnuncio.classList.add('show');
            });

            list.appendChild(item);
        });
    }

    // Cerrar el dropdown si se hace click fuera
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('notifications-dropdown');
        const bellBtn = document.getElementById('notification-bell-btn');
        if (dropdown && dropdown.style.display === 'block') {
            if (!dropdown.contains(e.target) && (!bellBtn || !bellBtn.contains(e.target))) {
                dropdown.style.display = 'none';
            }
        }
    });

    async function cargarAnuncios() {
        try {
            if (typeof window.fetchUbicatecActiveAnnouncements === 'function') {
                const docs = await window.fetchUbicatecActiveAnnouncements('web');
                const anuncios = docs.map(normalizeFirestoreAnnouncement).filter(Boolean);
                if (anuncios.length > 0) return anuncios;
            }
        } catch (e) {}

        try {
            const res = await fetch('data/anuncios.json', { cache: 'no-store' });
            if (!res.ok) return [];
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data && Array.isArray(data.anuncios) ? data.anuncios : []);
            const now = new Date();
            const active = list.filter((a) => isActiveAnuncio(a, now));
            active.sort((a, b) => (Number(b.prioridad || 0) - Number(a.prioridad || 0)));
            return active;
        } catch (e) {
            return [];
        }
    }

    async function initAvisos() {
        const anuncios = await cargarAnuncios();
        
        // Siempre renderizar la campana, independientemente de si hay anuncios o no
        renderCapsule(anuncios);

        if (!anuncios || anuncios.length === 0) return;

        const anuncioPrincipal = anuncios[0];
        setModalFromAnuncio(anuncioPrincipal);

        setTimeout(() => {
            const sessionKey = `ubicatec_announcement_shown_${anuncioPrincipal.id || 'default'}`;
            if (sessionStorage.getItem(sessionKey)) return;
            sessionStorage.setItem(sessionKey, '1');

            if (anuncioPrincipal.auto_abrir) {
                if (typeof window.abrirModalAnuncio === 'function') {
                    // Forzamos que se envíe el ID aquí al abrirse automáticamente
                    const modal = document.getElementById('modalAnuncio');
                    if (modal) modal.dataset.anuncioId = String(anuncioPrincipal.id || 'default');
                    window.abrirModalAnuncio();
                }
            }
        }, 3000);
    }

    initAvisos();
});

/* =========================================
   Event Verification (Verificación de Jornadas)
   ========================================= */
/**
 * Verifica si hay eventos programados para el día actual y su estado (próximo, en curso).
 * Utilizado para mostrar avisos relevantes al usuario.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Datos de las jornadas (fechas y horarios)
    const jornadasData = {
        fecha: '2025-09-11', // Ajustar según la fecha real
        eventos: [] // Los eventos se agregarán dinámicamente
    };

    function verificarEventosEnCurso() {
        const ahora = new Date();
        const hoy = ahora.toISOString().split('T')[0];
        
        // Log removed for production cleanliness, uncomment for debugging
        
        // Verificar si es el día de las jornadas
        if (hoy !== jornadasData.fecha) {
            return null;
        }

        let eventoProximo = null;
        let minutosParaEvento = 0;
        let minutosTranscurridos = 0;
        let estado = null; // 'countdown', 'en_curso', 'finalizado'

        jornadasData.eventos.forEach(evento => {
            const [hora, minutos] = evento.hora.split(':');
            const horaEvento = new Date();
            horaEvento.setHours(parseInt(hora), parseInt(minutos), 0, 0);
            
            const diferenciaMs = ahora - horaEvento;
            const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
            
            // Si el evento está en curso (0 a 60 minutos después)
            if (diferenciaMinutos >= 0 && diferenciaMinutos < 60) {
                if (!eventoProximo || diferenciaMinutos < minutosTranscurridos) {
                    eventoProximo = evento;
                    minutosTranscurridos = diferenciaMinutos;
                    estado = 'en_curso';
                }
            }
            // Si el evento está próximo (30 minutos antes a 0 minutos)
            else if (diferenciaMinutos >= -30 && diferenciaMinutos < 0) {
                if (!eventoProximo) {
                    eventoProximo = evento;
                    minutosParaEvento = Math.abs(diferenciaMinutos);
                    estado = 'countdown';
                }
            }
        });

        if (eventoProximo) {
            const resultado = { 
                ...eventoProximo, 
                minutosTranscurridos, 
                minutosParaEvento, 
                estado 
            };
            return resultado;
        }

        return null;
    }
});

/* =========================================
   Modal Announcement Logic (Lógica del Modal de Anuncios)
   ========================================= */
/**
 * Controla la apertura y cierre del modal de anuncios globales.
 * Incluye lógica para redireccionar a encuestas o enlaces externos.
 */
document.addEventListener('DOMContentLoaded', function() {
    const modalAnuncio = document.getElementById('modalAnuncio');
    const cerrarAnuncio = document.getElementById('cerrarAnuncio');
    const masInformacion = document.getElementById('masInformacion');

    // Función para abrir el modal (se llamará desde la notificación)
    window.abrirModalAnuncio = function() {
        if (modalAnuncio) {
            modalAnuncio.classList.add('show');
            if (typeof window.ubicatecTrack === 'function') {
                const anuncioId = (modalAnuncio.dataset && modalAnuncio.dataset.anuncioId) ? String(modalAnuncio.dataset.anuncioId) : 'default';
                window.ubicatecTrack('announcement_open', { label: anuncioId });
            }
        }
    };

    // Cerrar modal al hacer clic en la X
    if (cerrarAnuncio) {
        cerrarAnuncio.addEventListener('click', function() {
            modalAnuncio.classList.remove('show');
            if (typeof window.ubicatecTrack === 'function') {
                const anuncioId = (modalAnuncio.dataset && modalAnuncio.dataset.anuncioId) ? String(modalAnuncio.dataset.anuncioId) : 'default';
                window.ubicatecTrack('announcement_close', { label: anuncioId });
            }
        });
    }

    // Cerrar modal al hacer clic fuera del contenido
    if (modalAnuncio) {
        modalAnuncio.addEventListener('click', function(e) {
            if (e.target === modalAnuncio) {
                modalAnuncio.classList.remove('show');
                if (typeof window.ubicatecTrack === 'function') {
                    const anuncioId = (modalAnuncio.dataset && modalAnuncio.dataset.anuncioId) ? String(modalAnuncio.dataset.anuncioId) : 'default';
                    window.ubicatecTrack('announcement_close', { label: anuncioId });
                }
            }
        });
    }

    // Acción del botón "Contestar Encuesta"
    if (masInformacion) {
        masInformacion.addEventListener('click', function() {
            const url = (masInformacion.dataset && masInformacion.dataset.url) ? masInformacion.dataset.url : '';
            if (url) {
                window.open(url, '_blank');
                if (typeof window.ubicatecTrack === 'function') {
                    const anuncioId = (modalAnuncio.dataset && modalAnuncio.dataset.anuncioId) ? String(modalAnuncio.dataset.anuncioId) : 'default';
                    window.ubicatecTrack('announcement_more_info', { label: anuncioId });
                }
            }
            // Cerrar el modal
            modalAnuncio.classList.remove('show');
        });
    }

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalAnuncio && modalAnuncio.classList.contains('show')) {
            modalAnuncio.classList.remove('show');
        }
    });
});

// OneSignal Cordova Plugin Native Initialization (Versión 5+)
document.addEventListener('deviceready', function () {
    // La versión 5 del plugin de OneSignal para Cordova expone el objeto OneSignal directamente en window.plugins.OneSignal
    const OneSignal = window.plugins && window.plugins.OneSignal;
    
    if (OneSignal) {
        console.log("Inicializando OneSignal SDK v5...");
        
        // 1. Opcional: Activar logs detallados para debug
        OneSignal.Debug.setLogLevel(6);
        
        // 2. Inicializar con tu App ID
        OneSignal.initialize("bee083e4-1a4b-464e-91e4-d823b38a26ac");

        // Fase 5.1 - etiqueta de plataforma para segmentar (web vs app)
        try { OneSignal.User.addTag("platform", "app"); } catch (e) {}

        // 3. Solicitar permisos de notificación (Muestra el cuadro de diálogo nativo de Android 13+)
        OneSignal.Notifications.requestPermission(true).then((accepted) => {
            console.log("User accepted notifications: " + accepted);
            
            // Si el usuario acepta, nos aseguramos de registrar el dispositivo
            if (accepted) {
                console.log("Dispositivo suscrito a OneSignal exitosamente.");
            }
        });
        
        // 4. Escuchar cuando el usuario toca la notificación
        OneSignal.Notifications.addEventListener('click', function(event) {
            console.log("Notificación clickeada", event);
        });
    } else {
        console.warn("OneSignal SDK no encontrado. ¿Se instaló el plugin y se ejecutó npx cap sync?");
    }
}, false);

(function() {
    function notify(kind, title, message) {
        try {
            if (window.notifications) {
                if (kind === 'success') return window.notifications.success(title, message);
                if (kind === 'warning') return window.notifications.warning(title, message);
                if (kind === 'error') return window.notifications.error(title, message);
                return window.notifications.info(title, message);
            }
        } catch (e) {}
        try { alert(`${title}\n\n${message}`); } catch (e) {}
    }

    function getNativeOneSignal() {
        return window.plugins && window.plugins.OneSignal;
    }

    function getOneSignal() {
        return getNativeOneSignal();
    }

    async function getWebPushPermission() {
        if (typeof window.getUbicatecWebPushPermission !== 'function') return null;
        try {
            return await window.getUbicatecWebPushPermission();
        } catch (e) {
            return null;
        }
    }

    async function requestWebPushPermission() {
        if (typeof window.requestUbicatecWebPushPermission !== 'function') return null;
        try {
            return await window.requestUbicatecWebPushPermission();
        } catch (e) {
            return null;
        }
    }

    function isCapacitorNative() {
        try {
            return !!(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : true));
        } catch (e) {
            return false;
        }
    }

    function isIOSDevice() {
        const ua = navigator.userAgent || '';
        const isIOS = /iPad|iPhone|iPod/i.test(ua);
        const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        return isIOS || isIPadOS;
    }

    function isSafariBrowser() {
        const ua = navigator.userAgent || '';
        const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS|Edg/i.test(ua);
        return isSafari;
    }

    function isStandaloneMode() {
        try {
            if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
        } catch (e) {}
        return !!(window.navigator && window.navigator.standalone);
    }

    function statusTextFromPermissionState(state) {
        if (!state) return '—';
        if (state === 'granted') return 'Concedido';
        if (state === 'denied') return 'Denegado';
        if (state === 'prompt') return 'Pendiente';
        return String(state);
    }

    function probeGeolocationPermission() {
        return new Promise((resolve) => {
            if (!navigator.geolocation || !navigator.geolocation.getCurrentPosition) return resolve(null);

            navigator.geolocation.getCurrentPosition(
                () => resolve('granted'),
                (err) => {
                    if (err && err.code === 1) return resolve('denied');
                    resolve('granted');
                },
                { enableHighAccuracy: false, timeout: 1500, maximumAge: 60000 }
            );
        });
    }

    async function refreshSettingsStatus() {
        const geoEl = document.getElementById('settingsGeoStatus');
        const notifEl = document.getElementById('settingsNotifStatus');
        const geoBtn = document.getElementById('settingsGeoRequest');
        const notifBtn = document.getElementById('settingsNotifRequest');
        const a2hsCard = document.getElementById('settingsA2HSCard');
        const a2hsStatus = document.getElementById('settingsA2HSStatus');
        const a2hsBtn = document.getElementById('settingsA2HSOpen');
        const OneSignal = getOneSignal();
        const isSafariWebIOS = isIOSDevice() && isSafariBrowser() && !isCapacitorNative();
        const standalone = isStandaloneMode();
        const secure = typeof isSecureContext !== 'undefined' ? !!isSecureContext : (location && location.protocol === 'https:');

        if (a2hsCard) {
            const canShowA2HS = isSafariWebIOS;
            const installed = standalone;
            a2hsCard.style.display = canShowA2HS ? '' : 'none';
            if (canShowA2HS && a2hsStatus) {
                a2hsStatus.textContent = installed ? 'Instalada' : 'Disponible';
            }
            if (a2hsBtn) {
                a2hsBtn.disabled = installed;
            }
        }

        let geoState = null;
        if (geoEl) {
            if (isSafariWebIOS && !secure) {
                geoEl.textContent = 'Requiere HTTPS';
                geoState = null;
            } else {
            if (navigator.permissions && navigator.permissions.query) {
                try {
                    const s = await navigator.permissions.query({ name: 'geolocation' });
                    const state = s && s.state;
                    geoState = state;
                    geoEl.textContent = statusTextFromPermissionState(geoState);
                    if (state === 'prompt') {
                        const probed = await probeGeolocationPermission();
                        if (probed) {
                            geoState = probed;
                            geoEl.textContent = statusTextFromPermissionState(geoState);
                        }
                    }
                } catch (e) {
                    const probed = await probeGeolocationPermission();
                    geoState = probed;
                    geoEl.textContent = statusTextFromPermissionState(geoState);
                }
            } else {
                const probed = await probeGeolocationPermission();
                geoState = probed;
                geoEl.textContent = statusTextFromPermissionState(geoState);
            }
            }
        }

        if (geoBtn) {
            geoBtn.disabled = (isSafariWebIOS && !secure) || geoState === 'granted';
        }

        let notifGranted = null;
        if (notifEl) {
            if (isSafariWebIOS) {
                if (!secure) {
                    notifEl.textContent = 'Requiere HTTPS';
                    notifGranted = null;
                } else if (!standalone) {
                    notifEl.textContent = 'Instala la PWA';
                    notifGranted = null;
                }
            }

            if (isSafariWebIOS && (!secure || !standalone)) {
            } else
            if (OneSignal && OneSignal.Notifications && typeof OneSignal.Notifications.getPermissionAsync === 'function') {
                try {
                    const hasPermission = await OneSignal.Notifications.getPermissionAsync();
                    notifEl.textContent = hasPermission ? 'Concedido' : 'Denegado';
                    notifGranted = !!hasPermission;
                } catch (e) {
                    notifEl.textContent = '—';
                    notifGranted = null;
                }
            } else if (!isCapacitorNative() && typeof window.getUbicatecWebPushPermission === 'function') {
                const hasPermission = await getWebPushPermission();
                if (hasPermission === null) {
                    notifEl.textContent = 'Pendiente';
                    notifGranted = false;
                } else {
                    notifEl.textContent = hasPermission ? 'Concedido' : statusTextFromPermissionState(typeof Notification !== 'undefined' ? Notification.permission : null);
                    notifGranted = !!hasPermission;
                }
            } else if (typeof Notification !== 'undefined' && Notification.permission) {
                notifEl.textContent = statusTextFromPermissionState(Notification.permission);
                notifGranted = Notification.permission === 'granted';
            } else {
                notifEl.textContent = 'No soportado';
                notifGranted = null;
            }
        }

        if (notifBtn) {
            notifBtn.disabled = (isSafariWebIOS && (!secure || !standalone)) || notifGranted === true;
        }
    }

    function openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (!modal) return;
        modal.classList.add('show');
        refreshSettingsStatus();
    }

    function closeSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (!modal) return;
        modal.classList.remove('show');
    }

    function openA2HSModal() {
        const modal = document.getElementById('a2hsModal');
        if (!modal) return;
        modal.classList.add('show');
    }

    function closeA2HSModal() {
        const modal = document.getElementById('a2hsModal');
        if (!modal) return;
        modal.classList.remove('show');
    }

    function bindSettingsUI() {
        const btn = document.getElementById('settings-btn');
        const modal = document.getElementById('settingsModal');
        const closeBtn = document.getElementById('settingsModalClose');
        const okBtn = document.getElementById('settingsModalOk');
        const geoBtn = document.getElementById('settingsGeoRequest');
        const notifBtn = document.getElementById('settingsNotifRequest');
        const openSystemBtn = document.getElementById('settingsOpenSystem');
        const a2hsBtn = document.getElementById('settingsA2HSOpen');
        const a2hsModal = document.getElementById('a2hsModal');
        const a2hsCloseBtn = document.getElementById('a2hsModalClose');
        const a2hsOkBtn = document.getElementById('a2hsModalOk');

        if (btn) {
            btn.addEventListener('click', openSettingsModal);
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') openSettingsModal();
            });
        }

        if (closeBtn) closeBtn.addEventListener('click', closeSettingsModal);
        if (okBtn) okBtn.addEventListener('click', closeSettingsModal);

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeSettingsModal();
            });
        }

        if (a2hsBtn) {
            a2hsBtn.addEventListener('click', openA2HSModal);
        }
        if (a2hsCloseBtn) a2hsCloseBtn.addEventListener('click', closeA2HSModal);
        if (a2hsOkBtn) a2hsOkBtn.addEventListener('click', closeA2HSModal);
        if (a2hsModal) {
            a2hsModal.addEventListener('click', (e) => {
                if (e.target === a2hsModal) closeA2HSModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeSettingsModal();
                closeA2HSModal();
            }
        });

        if (geoBtn) {
            geoBtn.addEventListener('click', async () => {
                const OneSignal = getOneSignal();

                if (OneSignal && OneSignal.Location && typeof OneSignal.Location.requestPermission === 'function') {
                    try {
                        await OneSignal.Location.requestPermission();
                    } catch (e) {}
                }

                if (!navigator.geolocation || !navigator.geolocation.getCurrentPosition) {
                    notify('warning', 'Ubicación', 'Este dispositivo no soporta geolocalización.');
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    () => {
                        notify('success', 'Ubicación', 'Permiso de ubicación concedido.');
                        refreshSettingsStatus();
                    },
                    (err) => {
                        const msg = (err && err.message) ? err.message : 'No se pudo obtener la ubicación.';
                        notify('warning', 'Ubicación', msg);
                        if (window.UbicatecLocationQuality && window.UbicatecLocationQuality.reportError) {
                            window.UbicatecLocationQuality.reportError(err);
                        }
                        refreshSettingsStatus();
                    },
                    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
                );
            });
        }

        if (notifBtn) {
            notifBtn.addEventListener('click', async () => {
                const OneSignal = getOneSignal();
                if (OneSignal && OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
                    try {
                        const accepted = await OneSignal.Notifications.requestPermission(true);
                        notify(accepted ? 'success' : 'warning', 'Notificaciones', accepted ? 'Permiso concedido.' : 'Permiso denegado.');
                    } catch (e) {
                        notify('warning', 'Notificaciones', 'No se pudo solicitar el permiso de notificaciones.');
                    }
                    refreshSettingsStatus();
                    return;
                }

                if (!isCapacitorNative() && typeof window.requestUbicatecWebPushPermission === 'function') {
                    const accepted = await requestWebPushPermission();
                    notify(accepted ? 'success' : 'warning', 'Notificaciones', accepted ? 'Permiso concedido.' : 'Permiso denegado o pendiente.');
                    refreshSettingsStatus();
                    return;
                }

                if (typeof Notification === 'undefined' || !Notification.requestPermission) {
                    notify('warning', 'Notificaciones', 'Este dispositivo no soporta notificaciones.');
                    return;
                }
                try {
                    await Notification.requestPermission();
                } catch (e) {}
                refreshSettingsStatus();
            });
        }

        if (openSystemBtn) {
            openSystemBtn.addEventListener('click', async () => {
                try {
                    if (window.cordova && window.cordova.plugins && window.cordova.plugins.OpenAppSettings && typeof window.cordova.plugins.OpenAppSettings.open === 'function') {
                        window.cordova.plugins.OpenAppSettings.open();
                        return;
                    }
                } catch (e) {}

                try {
                    const settingsPlugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.UbicatecSettings;
                    if (settingsPlugin && typeof settingsPlugin.openAppSettings === 'function') {
                        await settingsPlugin.openAppSettings();
                        return;
                    }
                } catch (e) {}

                const OneSignal = getOneSignal();
                if (OneSignal && OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
                    try {
                        await OneSignal.Notifications.requestPermission(true);
                    } catch (e) {}
                    refreshSettingsStatus();
                    return;
                }

                if (!isCapacitorNative() && typeof window.requestUbicatecWebPushPermission === 'function') {
                    await requestWebPushPermission();
                    refreshSettingsStatus();
                    return;
                }

                if (!isCapacitorNative()) {
                    notify('info', 'Ajustes', 'Abre los ajustes del navegador para administrar permisos.');
                    return;
                }

                notify('info', 'Ajustes', 'Abre los ajustes del sistema para administrar permisos de Ubicatec.');
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindSettingsUI);
    } else {
        bindSettingsUI();
    }
})();
