        /**
         * Lógica de Interacción para la página de Equipo (UBICATEC)
         * 
         * Este script maneja la experiencia de "Scrollytelling" única de esta página,
         * coordinando transiciones entre las secciones de Equipo, Asesores y Agradecimientos
         * basado en el desplazamiento vertical.
         * 
         * Funcionalidades:
         * 1. Inicialización de Lenis (Scroll suave de alto rendimiento)
         * 2. Mapeo de scroll vertical a desplazamiento horizontal (para el grid de equipo)
         * 3. Control de opacidad, blur y transformaciones (efectos visuales por sección)
         * 4. Interacciones de tarjetas expandibles (versión móvil)
         */
        const cardGrid = document.querySelector('.card-grid');
        const advisorsSection = document.querySelector('.advisors-section');
        const acknowledgmentsSection = document.querySelector('.acknowledgments-section');
        const scrollIndicator = document.querySelector('.scroll-indicator');
        const isMobile = window.innerWidth <= 768;
        const ubMetricsState = {
            advisorsViewed: false,
            acknowledgmentsViewed: false,
        };

        function ubTrack(name, options) {
            try { window.ubicatecTrack && window.ubicatecTrack(name, options); } catch {}
        }

        ubTrack('team_page_open');

        document.addEventListener('click', function (e) {
            const a = e.target && e.target.closest ? e.target.closest('a') : null;
            if (!a) return;

            const href = a.getAttribute('href') || '';
            const target = (a.getAttribute('target') || '').toLowerCase();
            const isExternal = target === '_blank' || /^https?:\/\//i.test(href);
            const isMail = /^mailto:/i.test(href);
            if (!isExternal && !isMail) return;

            const card = a.closest('.card') || a.closest('.acknowledgment-card');
            let who = '';
            if (card) {
                const t = card.querySelector('.card-title, h3, h4');
                who = (t && t.textContent ? t.textContent : '').trim();
            }
            const kind = a.className || href;
            const label = `${who || 'link'}|${kind}`.slice(0, 80);
            ubTrack(isMail ? 'team_email_click' : 'team_social_click', { label });
        }, true);

        // Configuración de Lenis para scroll horizontal suave en desktop removida
        // para permitir un flujo responsive natural en todos los dispositivos.

        function toggleDescription(card) {
            // Prevenir propagación si se hace clic en elementos internos específicos si fuera necesario
            // pero queremos que toda la card responda
            card.classList.toggle('expanded');
            const t = card.querySelector('.card-title');
            const label = (t && t.textContent ? t.textContent : '').trim().slice(0, 80);
            ubTrack(card.classList.contains('expanded') ? 'team_card_expand' : 'team_card_collapse', { label });
        }

        // Add event listeners to cards with description
        document.querySelectorAll('.card-with-description').forEach(card => {
            card.addEventListener('click', () => toggleDescription(card));
        });

        // --- Propiedad de Carrusel (Drag to Scroll Suave) ---
        function enableDragToScroll(slider) {
            let isDown = false;
            let startX;
            let scrollLeft;
            let velX = 0;
            let momentumID;

            slider.addEventListener('mousedown', (e) => {
                isDown = true;
                slider.classList.add('active');
                startX = e.pageX - slider.offsetLeft;
                scrollLeft = slider.scrollLeft;
                
                // Desactivar snap y comportamiento suave del CSS temporalmente para evitar tirones
                slider.style.scrollSnapType = 'none';
                slider.style.scrollBehavior = 'auto';
                cancelAnimationFrame(momentumID);
            });
            
            const stopDragging = () => {
                if (!isDown) return;
                isDown = false;
                slider.classList.remove('active');
                
                // Iniciar inercia suave
                beginMomentum();
            };

            slider.addEventListener('mouseleave', stopDragging);
            slider.addEventListener('mouseup', stopDragging);

            slider.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - slider.offsetLeft;
                const prevScrollLeft = slider.scrollLeft;
                
                // Multiplicador más suave (1 en lugar de 2)
                const walk = (x - startX) * 1; 
                slider.scrollLeft = scrollLeft - walk;
                
                // Registrar velocidad para la inercia
                velX = slider.scrollLeft - prevScrollLeft;
            });

            function beginMomentum() {
                // Restaurar el comportamiento natural del CSS para que actúe el snapping
                slider.style.scrollSnapType = '';
                
                // Inercia suave artificial si la velocidad es alta
                const loop = () => {
                    if (Math.abs(velX) > 0.5) {
                        slider.scrollLeft += velX;
                        velX *= 0.95; // Fricción
                        momentumID = requestAnimationFrame(loop);
                    } else {
                        // Una vez terminada la inercia, asegurar que el snap se complete suavemente
                        slider.style.scrollBehavior = 'smooth';
                    }
                };
                momentumID = requestAnimationFrame(loop);
            }
        }
        
        if (cardGrid) enableDragToScroll(cardGrid);
        
        const advisorsGrid = document.querySelector('.advisors-grid');
        if (advisorsGrid) enableDragToScroll(advisorsGrid);

        // El efecto scrollytelling complejo fue removido para priorizar el ajuste dinámico (responsive).
        // Las analíticas para las secciones vistas se registrarán mediante IntersectionObserver
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('advisors-section') && !ubMetricsState.advisorsViewed) {
                        ubMetricsState.advisorsViewed = true;
                        ubTrack('team_section_view', { label: 'advisors' });
                    }
                    if (entry.target.classList.contains('acknowledgments-section') && !ubMetricsState.acknowledgmentsViewed) {
                        ubMetricsState.acknowledgmentsViewed = true;
                        ubTrack('team_section_view', { label: 'acknowledgments' });
                    }
                }
            });
        }, { threshold: 0.3 });

        if (advisorsSection) observer.observe(advisorsSection);
        if (acknowledgmentsSection) observer.observe(acknowledgmentsSection);
