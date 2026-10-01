/**
 * Ubicatec - Production Log Control & Debug Mode
 */
(function() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const isDebug = urlParams.has('debug') || 
                        localStorage.getItem('UBICATEC_DEBUG') === 'true' || 
                        window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
        
        window.UBICATEC_DEBUG = isDebug;

        if (!isDebug) {
            window._originalConsoleLog = console.log;
            console.log = function() {};
        }
    } catch (_e) {}
})();

/**
 * Ubicatec - Shared Utilities (Utilidades Compartidas)
 * 
 * Contiene lógica compartida utilizada en múltiples páginas, principalmente:
 * - Gestión de la navegación móvil flotante (Mobile Navigation).
 * - Detección de página activa.
 * - Efectos visuales y táctiles para la UI móvil.
 */

const MobileNavUtils = {
    /**
     * Inicializa todas las utilidades de navegación móvil.
     * Se ejecuta automáticamente al cargar el DOM.
     */
    init: function() {
        try {
            const isCap = !!(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : true));
            if (isCap && document.body && document.body.classList) {
                document.body.classList.add('ub-capacitor');
            }
        } catch {}
        // Solo ejecutar en dispositivos móviles si existe la navegación flotante
        if (window.innerWidth <= 768 && document.querySelector('.floating-mobile-nav')) {
            this.initDirectColorDetector();
            this.setCurrentPageActive();
            this.initNativeSwipe();
            this.initTouchEffects();
            this.initScrollBehavior();
        }
        
        // Manejar cambios de tamaño de ventana
        window.addEventListener('resize', () => {
            const floatingNav = document.getElementById('floatingMobileNav');
            const desktopNav = document.getElementById('header-navbar');
            
            if (window.innerWidth <= 768) {
                if (floatingNav) floatingNav.style.display = 'block';
                if (desktopNav) desktopNav.style.display = 'none';
                
                // Re-inicializar si no estaba inicializado (opcional)
                // Pero mejor simplemente asegurar que los estilos estén correctos
            } else {
                if (floatingNav) floatingNav.style.display = 'none';
                if (desktopNav) desktopNav.style.display = 'block';
            }
        });

        // Manejar cambios de orientación
        window.addEventListener('orientationchange', function() {
            setTimeout(() => MobileNavUtils.setCurrentPageActive(), 100);
        });
    },

    setActiveNavItem: function(item) {
        const navItems = document.querySelectorAll('.floating-mobile-nav .nav-item');
        navItems.forEach(nav => nav.classList.remove('active'));
        if (item) {
            item.classList.add('active');
        }
    },

    setCurrentPageActive: function() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        let activeElement = null;

        // Mapeo de páginas a IDs de navegación
        const navMap = {
            'index.html': 'navHome',
            '': 'navHome',
            'aula.html': 'navAula',
            'edificio.html': 'navAula',
            'rs.html': 'navNoticias',

            'equipo.html': 'navEquipo',
            'jornadas.html': null,
            'noticias.html': 'navNoticias'
        };

        const navId = navMap[currentPage];
        if (navId) {
            activeElement = document.getElementById(navId);
        }

        if (activeElement) {
            this.setActiveNavItem(activeElement);
        } else {
            // Fallback para home
            if (currentPage === 'index.html' || currentPage === '') {
                activeElement = document.getElementById('navHome');
                if(activeElement) this.setActiveNavItem(activeElement);
            }
        }
    },
    
    // Sistema DIRECTO de detección de color basado en scroll
    initDirectColorDetector: function() {
        const body = document.body;
        const allowDynamic = !!(body && body.classList && (body.classList.contains('page-index') || body.classList.contains('page-equipo')));
        if (!allowDynamic) return;
        const navItems = document.querySelectorAll('.floating-mobile-nav .nav-item');
        if (navItems.length === 0) return;
        
        const DirectColorDetector = {
            currentState: null,
            lastUpdate: 0,
            
            detectBackgroundType() {
                const navbar = document.getElementById('floatingMobileNav');
                if (!navbar) return 'dark'; 
                
                const rect = navbar.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;
                
                // 60% de la altura del viewport como umbral
                if (centerY < window.innerHeight * 0.6) {
                    return 'dark'; // Header azul oscuro o sección superior
                } else {
                    return 'light'; // Contenido blanco
                }
            },
            
            update() {
                const now = Date.now();
                if (now - this.lastUpdate < 100) return; // Throttle
                
                const backgroundType = this.detectBackgroundType();
                
                if (this.currentState !== backgroundType) {
                    this.currentState = backgroundType;
                    
                    navItems.forEach(item => {
                        item.style.transition = 'color 0.4s ease';
                        
                        if (backgroundType === 'dark') {
                            // Fondo oscuro - texto blanco
                            item.style.color = 'rgba(255, 255, 255, 0.95)';
                            item.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
                            item.style.fontWeight = '600';
                        } else {
                            // Fondo claro - texto negro
                            item.style.color = 'rgba(0, 0, 0, 0.85)';
                            item.style.textShadow = '0 1px 2px rgba(255, 255, 255, 0.5)';
                            item.style.fontWeight = '500';
                        }
                    });
                    
                    this.lastUpdate = now;
                }
            }
        };

        // Inicializar
        DirectColorDetector.update();
        
        let scrollTimer;
        window.addEventListener('scroll', () => {
            if (scrollTimer) return;
            scrollTimer = setTimeout(() => {
                DirectColorDetector.update();
                scrollTimer = null;
            }, 50);
        }, { passive: true });
        
        let resizeTimer;
        window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => DirectColorDetector.update(), 200);
        });
        
        // Actualización después de cargar
        window.addEventListener('load', () => {
            setTimeout(() => DirectColorDetector.update(), 300);
        });
    },

    initTouchEffects: function() {
        const navItems = document.querySelectorAll('.floating-mobile-nav .nav-item');
        const navContainer = document.querySelector('#floatingMobileNav .nav-container');
        const nativeSwipe = !!(navContainer && navContainer.dataset && navContainer.dataset.nativeSwipe === '1');

        navItems.forEach(item => {
            let isPressed = false;
            let pressTimer = null;

            if (!nativeSwipe) {
                item.addEventListener('touchstart', function(e) {
                    isPressed = true;
                    this.style.transform = 'translateY(-1px) scale(0.95)';
                    this.style.transition = 'all 0.1s ease';
                    
                    pressTimer = setTimeout(() => {
                        if (isPressed) {
                            this.style.transform = 'translateY(-2px)';
                            this.style.transition = 'all 0.3s ease';
                        }
                    }, 100);
                }, { passive: true });

                item.addEventListener('touchend', function(e) {
                    isPressed = false;
                    clearTimeout(pressTimer);
                    setTimeout(() => {
                        this.style.transform = '';
                        this.style.transition = 'all 0.3s ease';
                    }, 50);
                }, { passive: true });

                item.addEventListener('touchcancel', function(e) {
                    isPressed = false;
                    clearTimeout(pressTimer);
                    this.style.transform = '';
                    this.style.transition = 'all 0.3s ease';
                }, { passive: true });
            }
            
            // Manejar click para activar (además de navegación)
            item.addEventListener('click', function(e) {
                if (!this.classList.contains('active')) {
                    MobileNavUtils.setActiveNavItem(this);
                }
            });
        });
    },
    
    initScrollBehavior: function() {
        // Ocultar/Mostrar navbar al hacer scroll (opcional, si se desea ese comportamiento)
        // Por ahora, solo aseguramos que el navbar esté visible/oculto según media queries
    },

    initNativeSwipe: function() {
        const nav = document.querySelector('#floatingMobileNav .nav-container');
        if (!nav) return;
        if (!window.PointerEvent) return;
        if (nav.dataset && nav.dataset.nativeSwipe === '1') return;

        nav.dataset.nativeSwipe = '1';

        const snapItems = () => Array.from(nav.querySelectorAll('a.nav-item'));
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        const maxScroll = () => Math.max(0, nav.scrollWidth - nav.clientWidth);

        let activePointerId = null;
        let startX = 0;
        let startY = 0;
        let startScrollLeft = 0;
        let lastX = 0;
        let lastT = 0;
        let velocity = 0;
        let dragging = false;
        let draggedDistance = 0;
        let lastDragEndAt = 0;
        let rafId = 0;
        let snapRafId = 0;

        const stopMomentum = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = 0;
            if (snapRafId) cancelAnimationFrame(snapRafId);
            snapRafId = 0;
        };

        const animateTo = (targetLeft) => {
            const from = nav.scrollLeft;
            const to = clamp(targetLeft, 0, maxScroll());
            if (Math.abs(to - from) < 1) return;

            const duration = 260;
            const start = performance.now();
            const ease = (t) => 1 - Math.pow(1 - t, 3);

            const step = (now) => {
                const p = clamp((now - start) / duration, 0, 1);
                nav.scrollLeft = from + (to - from) * ease(p);
                if (p < 1) snapRafId = requestAnimationFrame(step);
            };

            snapRafId = requestAnimationFrame(step);
        };

        const snapToNearest = () => {
            const items = snapItems();
            if (!items.length) return;
            const navRect = nav.getBoundingClientRect();
            const center = nav.scrollLeft + nav.clientWidth / 2;

            let best = null;
            let bestDist = Infinity;
            for (const it of items) {
                const itRect = it.getBoundingClientRect();
                const c = nav.scrollLeft + (itRect.left - navRect.left) + itRect.width / 2;
                const d = Math.abs(c - center);
                if (d < bestDist) {
                    bestDist = d;
                    best = it;
                }
            }
            if (!best) return;
            const bestRect = best.getBoundingClientRect();
            const target = nav.scrollLeft + (bestRect.left - navRect.left) + bestRect.width / 2 - nav.clientWidth / 2;
            animateTo(target);
        };

        const startMomentum = () => {
            const friction = 0.94;
            const minV = 0.02;
            let prev = performance.now();

            const step = (now) => {
                const dt = now - prev;
                prev = now;
                velocity *= Math.pow(friction, dt / 16.7);

                if (Math.abs(velocity) < minV) {
                    rafId = 0;
                    snapToNearest();
                    return;
                }

                nav.scrollLeft = clamp(nav.scrollLeft - velocity * dt, 0, maxScroll());
                rafId = requestAnimationFrame(step);
            };

            rafId = requestAnimationFrame(step);
        };

        nav.addEventListener('pointerdown', function(e) {
            if (e.pointerType !== 'touch') return;
            activePointerId = e.pointerId;
            stopMomentum();
            startX = e.clientX;
            startY = e.clientY;
            startScrollLeft = nav.scrollLeft;
            lastX = e.clientX;
            lastT = performance.now();
            velocity = 0;
            dragging = false;
            draggedDistance = 0;
            try { nav.setPointerCapture(activePointerId); } catch {}
        }, { passive: true });

        nav.addEventListener('pointermove', function(e) {
            if (activePointerId == null || e.pointerId !== activePointerId) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const adx = Math.abs(dx);
            const ady = Math.abs(dy);

            if (!dragging) {
                if (adx <= 6 || adx <= ady) return;
                dragging = true;
            }

            e.preventDefault();

            const nextLeft = clamp(startScrollLeft - dx, 0, maxScroll());
            nav.scrollLeft = nextLeft;

            draggedDistance = Math.max(draggedDistance, adx);

            const now = performance.now();
            const dt = Math.max(1, now - lastT);
            const vx = (e.clientX - lastX) / dt;
            velocity = velocity * 0.6 + vx * 0.4;
            lastX = e.clientX;
            lastT = now;
        }, { passive: false });

        const end = (e) => {
            if (activePointerId == null || e.pointerId !== activePointerId) return;
            try { nav.releasePointerCapture(activePointerId); } catch {}
            activePointerId = null;

            if (!dragging) return;
            dragging = false;
            lastDragEndAt = Date.now();

            if (draggedDistance < 10) {
                snapToNearest();
                return;
            }

            startMomentum();
        };

        nav.addEventListener('pointerup', end, { passive: true });
        nav.addEventListener('pointercancel', end, { passive: true });

        nav.addEventListener('click', function(e) {
            if (!lastDragEndAt) return;
            if ((Date.now() - lastDragEndAt) > 450) return;
            const link = e.target && e.target.closest ? e.target.closest('a.nav-item') : null;
            if (!link) return;
            e.preventDefault();
            e.stopPropagation();
        }, true);
    }
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MobileNavUtils.init());
} else {
    MobileNavUtils.init();
}

(function() {
    if (window.UbicatecLocationQuality) return;

    const state = {
        lastAccepted: null,
        smoothed: null,
        badSince: null,
        banner: null,
        tempHideAt: 0
    };

    function haversineMeters(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
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

    function ensureBanner() {
        if (state.banner) return state.banner;
        const el = document.createElement('div');
        el.id = 'ubicatecGpsQualityBanner';
        el.style.position = 'fixed';
        el.style.left = '50%';
        el.style.transform = 'translateX(-50%)';
        el.style.zIndex = '10050';
        el.style.maxWidth = '520px';
        el.style.width = 'calc(100% - 24px)';
        el.style.padding = '12px 14px';
        el.style.borderRadius = '14px';
        el.style.border = '1px solid rgba(255,255,255,0.12)';
        el.style.background = 'rgba(17, 24, 39, 0.78)';
        el.style.backdropFilter = 'blur(14px) saturate(160%)';
        el.style.webkitBackdropFilter = 'blur(14px) saturate(160%)';
        el.style.color = 'rgba(255,255,255,0.96)';
        el.style.fontFamily = 'Lato, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
        el.style.fontSize = '13px';
        el.style.lineHeight = '1.25';
        el.style.display = 'none';

        const bottomBase = window.innerWidth <= 768 && document.getElementById('floatingMobileNav') ? 110 : 18;
        el.style.bottom = `calc(${bottomBase}px + env(safe-area-inset-bottom, 0px))`;

        window.addEventListener('resize', () => {
            const bottom = window.innerWidth <= 768 && document.getElementById('floatingMobileNav') ? 110 : 18;
            el.style.bottom = `calc(${bottom}px + env(safe-area-inset-bottom, 0px))`;
        });

        document.body.appendChild(el);
        state.banner = el;
        return el;
    }

    function showBanner(text) {
        const now = Date.now();
        if (now < state.tempHideAt) return;
        const el = ensureBanner();
        el.textContent = text;
        el.style.display = 'block';
    }

    function hideBanner() {
        const el = ensureBanner();
        el.style.display = 'none';
    }

    function showTemporary(text, ms) {
        const now = Date.now();
        state.tempHideAt = 0;
        showBanner(text);
        state.tempHideAt = now + Math.max(0, ms || 0);
        window.setTimeout(() => {
            if (Date.now() >= state.tempHideAt) {
                state.tempHideAt = 0;
                hideBanner();
            }
        }, Math.max(250, ms || 0));
    }

    function classify(accuracy, ageMs) {
        if (!Number.isFinite(accuracy) || ageMs > 20000 || accuracy > 40) return 'bad';
        if (accuracy > 15) return 'regular';
        return 'ok';
    }

    function processPosition(pos) {
        const now = Date.now();
        const ts = typeof pos?.timestamp === 'number' ? pos.timestamp : now;
        const ageMs = Math.max(0, now - ts);
        const rawLat = pos?.coords?.latitude;
        const rawLng = pos?.coords?.longitude;
        const accuracy = typeof pos?.coords?.accuracy === 'number' ? pos.coords.accuracy : Number.POSITIVE_INFINITY;

        if (!Number.isFinite(rawLat) || !Number.isFinite(rawLng)) {
            const level = 'bad';
            return { use: false, level, accuracy, ageMs, timestamp: ts };
        }

        let use = true;

        if (state.lastAccepted) {
            const dt = (ts - state.lastAccepted.ts) / 1000;
            if (dt > 0) {
                const dist = haversineMeters(rawLat, rawLng, state.lastAccepted.rawLat, state.lastAccepted.rawLng);
                const speed = dist / dt;
                const reportedSpeed = (typeof pos?.coords?.speed === 'number' && !isNaN(pos.coords.speed)) ? pos.coords.speed : null;
                const lastAcc = state.lastAccepted.accuracy;
                const noisy = dist > 40 && dt < 2 && (accuracy > 20 || lastAcc > 20) && speed > 10;
                if (noisy && (!reportedSpeed || Math.abs(reportedSpeed - speed) > 8)) {
                    use = false;
                }
            }
        }

        let lat = rawLat;
        let lng = rawLng;

        if (use) {
            if (state.smoothed) {
                const alpha = accuracy <= 10 ? 0.45 : (accuracy <= 25 ? 0.25 : 0.15);
                lat = state.smoothed.lat + (rawLat - state.smoothed.lat) * alpha;
                lng = state.smoothed.lng + (rawLng - state.smoothed.lng) * alpha;
            }
            state.smoothed = { lat, lng };
            state.lastAccepted = { ts, rawLat, rawLng, accuracy };
        }

        const level = classify(accuracy, ageMs);

        if (level === 'bad') {
            if (state.badSince == null) state.badSince = now;
            if (now - state.badSince > 3500) {
                const a = Number.isFinite(accuracy) ? Math.round(accuracy) : null;
                showBanner(a ? `Ubicación inestable (±${a}m). Puedes experimentar problemas con la ubicación actual.` : 'Ubicación inestable. Puedes experimentar problemas con la ubicación actual.');
            }
        } else {
            state.badSince = null;
            hideBanner();
        }

        return { use, lat, lng, accuracy, level, ageMs, timestamp: ts };
    }

    function reportError(err) {
        const code = err && typeof err.code !== 'undefined' ? String(err.code) : '';
        if (code === '1') {
            showTemporary('Ubicación desactivada o sin permisos. Puedes experimentar problemas con la ubicación actual.', 6000);
            return;
        }
        showTemporary('No se pudo obtener la ubicación. Puedes experimentar problemas con la ubicación actual.', 6000);
    }

    window.UbicatecLocationQuality = { processPosition, reportError, showTemporary };
})();
