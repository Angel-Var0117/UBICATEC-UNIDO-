/**
 * Lógica de interacción para la página de Eventos
 * 
 * Este script maneja:
 * 1. Inicialización de animaciones AOS (Animate On Scroll)
 * 2. Desplazamiento suave (Smooth Scroll)
 * 3. Interacciones de tarjetas de eventos (volteo por click y touch)
 */

function loadDynamicEvents() {
    const grid = document.getElementById('dynamic-events-grid');
    const emptyView = document.getElementById('no-events-view');
    if (!grid || !emptyView) return;
    grid.innerHTML = '';
    emptyView.style.display = 'flex';
}

// Inicializar AOS
document.addEventListener('DOMContentLoaded', function() {
    loadDynamicEvents();
    AOS.init({
        duration: 1000,
        once: true
    });
    try { window.ubicatecTrack && window.ubicatecTrack('events_page_open'); } catch {}

    document.querySelectorAll('.social-links a').forEach(a => {
        a.addEventListener('click', function () {
            const label = (a.textContent || '').trim() || a.href;
            try { window.ubicatecTrack && window.ubicatecTrack('events_social_click', { label }); } catch {}
        });
    });

    document.querySelectorAll('#header-navbar a, #floatingMobileNav a, .mobile-back-btn').forEach(a => {
        a.addEventListener('click', function () {
            const label = a.id || (a.getAttribute('href') || '');
            try { window.ubicatecTrack && window.ubicatecTrack('events_nav_click', { label }); } catch {}
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Función para voltear la tarjeta (solo si no está volteada)
/**
 * Voltea una tarjeta de evento para mostrar detalles
 * @param {HTMLElement} card - Elemento DOM de la tarjeta
 */
function flipCard(card) {
    // Solo voltear si la card no está ya volteada
    if (!card.classList.contains('flipped')) {
        card.classList.add('flipped');
        const label = (card.getAttribute('data-title') || card.textContent || '').trim().slice(0, 80);
        try { window.ubicatecTrack && window.ubicatecTrack('event_card_open', { label }); } catch {}
    }
}

// Función para volver al frente de la tarjeta
/**
 * Devuelve la tarjeta a su estado original (frente)
 * @param {HTMLElement} card - Elemento DOM de la tarjeta
 * @param {Event} event - Evento del click para detener propagación
 */
function flipBack(card, event) {
    event.stopPropagation(); // Prevenir la propagación del evento
    card.classList.remove('flipped');
    const label = (card.getAttribute('data-title') || card.textContent || '').trim().slice(0, 80);
    try { window.ubicatecTrack && window.ubicatecTrack('event_card_close', { label }); } catch {}
}

// Prevenir el volteo accidental en dispositivos táctiles
/**
 * Manejo de gestos táctiles (swipe) para tarjetas en móvil
 * Permite voltear las tarjetas deslizando hacia arriba/abajo
 */
let touchStartY = 0;
let touchEndY = 0;

document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    card.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe(card);
    }, { passive: true });
});

function handleSwipe(card) {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    // Detectar swipe vertical significativo
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe hacia arriba - voltear tarjeta
            card.classList.add('flipped');
            const label = (card.getAttribute('data-title') || card.textContent || '').trim().slice(0, 80);
            try { window.ubicatecTrack && window.ubicatecTrack('event_card_swipe', { label: `up:${label}` }); } catch {}
        } else {
            // Swipe hacia abajo - volver al frente
            card.classList.remove('flipped');
            const label = (card.getAttribute('data-title') || card.textContent || '').trim().slice(0, 80);
            try { window.ubicatecTrack && window.ubicatecTrack('event_card_swipe', { label: `down:${label}` }); } catch {}
        }
    }
}

// Agregar efecto de sonido opcional (comentado por defecto)
function playFlipSound() {
    // Descomenta las siguientes líneas si quieres agregar un sonido de volteo
    // const audio = new Audio('sounds/flip.mp3');
}


