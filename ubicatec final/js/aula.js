// Funcionalidad para la interfaz de usuario de la página de Aulas (Leyendas, Scroll, Modales)
// Se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const leyendaTab = document.getElementById('leyendaTab');
    const leyendaModal = document.getElementById('leyendaModal');
    const leyendaClose = document.getElementById('leyendaClose');
    const leyendaMarcadores = document.getElementById('leyendaMarcadores');
    const leyendaButton = document.getElementById('leyendaButton');
    const mapSection = document.getElementById('mapa');
    const toggleSearch = document.getElementById('ubToggleSearch');
    const toggleFilter = document.getElementById('ubToggleFilter');
    const searchPanel = document.getElementById('ubSearchPanel');
    const filterPanel = document.getElementById('ubFilterPanel');
    const filterOverlay = document.getElementById('ubFilterOverlay');
    const filterClose = document.getElementById('ubFilterClose');
    const filterList = document.getElementById('ubFilterList');
    const filterSelect = document.getElementById('filterSelect');

    let filterOpen = false;

    function syncFilterActiveUI() {
        if (!filterList) return;
        const value = (filterSelect && typeof filterSelect.value === 'string') ? filterSelect.value : '';
        const items = filterList.querySelectorAll('[data-filter]');
        items.forEach(function (el) {
            const itemValue = el.getAttribute('data-filter') || '';
            el.classList.toggle('is-active', itemValue === value);
        });
    }

    function setFilterOpen(next) {
        filterOpen = !!next;
        if (filterPanel) {
            filterPanel.classList.toggle('is-open', filterOpen);
            filterPanel.setAttribute('aria-hidden', filterOpen ? 'false' : 'true');
        }
        if (filterOverlay) {
            filterOverlay.style.display = filterOpen ? 'block' : 'none';
        }
        document.body.classList.toggle('ub-drawer-open', filterOpen);
        if (toggleFilter) {
            toggleFilter.classList.toggle('is-active', filterOpen);
            toggleFilter.setAttribute('aria-expanded', filterOpen ? 'true' : 'false');
        }
        if (filterOpen) syncFilterActiveUI();
    }

    function focusSearch() {
        try {
            const input = document.getElementById('searchInput');
            if (input) input.focus();
        } catch (e) {}
    }

    if (searchPanel) searchPanel.classList.add('is-active');
    if (toggleSearch) {
        toggleSearch.setAttribute('aria-expanded', 'true');
        toggleSearch.addEventListener('click', function () { focusSearch(); });
    }
    if (toggleFilter) toggleFilter.addEventListener('click', function () { setFilterOpen(!filterOpen); });
    if (filterClose) filterClose.addEventListener('click', function () { setFilterOpen(false); });
    if (filterOverlay) filterOverlay.addEventListener('click', function () { setFilterOpen(false); });
    if (filterList) {
        filterList.addEventListener('click', function (e) {
            const item = e.target && e.target.closest ? e.target.closest('[data-filter]') : null;
            if (!item) return;
            const value = item.getAttribute('data-filter');
            if (filterSelect) filterSelect.value = value;
            syncFilterActiveUI();
            if (filterSelect) filterSelect.dispatchEvent(new Event('change', { bubbles: true }));
            setFilterOpen(false);
        });
    }
    if (filterSelect) filterSelect.addEventListener('change', syncFilterActiveUI);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && filterOpen) setFilterOpen(false);
    });
    
    /**
     * Verifica el tamaño de la pantalla para ajustar la visibilidad de elementos.
     * En este caso, asegura que la leyenda flotante se controle mediante el botón.
     */
    function checkScreenSize() {
        // Ocultar pestaña antigua y asegurar que el botón circular sea el control principal
        if (leyendaTab) leyendaTab.style.display = 'none';
        if (leyendaButton) leyendaButton.style.display = 'flex';
        if (leyendaMarcadores) leyendaMarcadores.style.display = 'none';
    }
    
    // Verificar tamaño de pantalla al cargar y al redimensionar la ventana
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Inicializar visibilidad de botones flotantes
    handleScroll();
    
    /**
     * Maneja el evento de scroll para mostrar/ocultar botones flotantes.
     * Actualmente configurado para mostrar los botones siempre que haya scroll (o siempre activos).
     */
    function handleScroll() {
        // Mostrar botón de leyenda en todas las pantallas
        leyendaButton.classList.add('show');
    }
    
    // Escuchar eventos de scroll
    window.addEventListener('scroll', handleScroll);
    
    /**
     * Abre el modal de la leyenda de marcadores.
     * Bloquea el scroll del body para evitar desplazamiento de fondo.
     */
    function openLegendModal() {
        leyendaModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    /**
     * Cierra el modal de la leyenda de marcadores.
     * Restaura el scroll del body.
     */
    function closeLegendModal() {
        leyendaModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Event Listeners para el Modal de Leyenda
    
    // 1. Abrir modal al hacer click en el botón flotante
    if(leyendaButton) leyendaButton.addEventListener('click', openLegendModal);
    
    // 2. Cerrar modal con el botón de cierre (X)
    if(leyendaClose) leyendaClose.addEventListener('click', closeLegendModal);
    
    // 3. Cerrar modal al hacer click fuera del contenido (en el fondo oscuro)
    leyendaModal.addEventListener('click', function(e) {
        if (e.target === leyendaModal) {
            closeLegendModal();
        }
    });

    // 4. Cerrar modal con la tecla Escape (Accesibilidad)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && leyendaModal.style.display === 'flex') {
            closeLegendModal();
        }
    });

    /**
     * Maneja parámetros de búsqueda desde el Widget
     */
    function handleWidgetSearch() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('search') === 'true') {
            // Dar un pequeño delay para asegurar que el mapa y el buscador estén listos
            setTimeout(() => {
                setPanel('search');
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    // 1. Hacer scroll suave hasta el buscador si es necesario
                    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // 2. Dar foco al input
                    searchInput.focus();
                    
                    // 3. Forzar la apertura del teclado usando el plugin nativo de Capacitor
                    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Keyboard) {
                        window.Capacitor.Plugins.Keyboard.show();
                    } else {
                        // Fallback: algunos navegadores requieren un click real
                        searchInput.click(); 
                    }
                    const term = urlParams.get('term');
                    if (term) {
                        searchInput.value = term;
                        if (typeof window.buscarEdificio === 'function') {
                            window.buscarEdificio(term);
                        } else {
                            document.getElementById('searchBtn')?.click();
                        }
                    }
                }
            }, 600);
        }
    }

    handleWidgetSearch();

    const bldgBackdrop = document.getElementById('ubBldgBackdrop');
    const bldgSheet = document.getElementById('ubBldgSheet');
    const bldgClose = document.getElementById('ubBldgClose');
    const bldgTitle = document.getElementById('ubBldgTitle');
    const bldgSubtitle = document.getElementById('ubBldgSubtitle');
    const bldgImg = document.getElementById('ubBldgImg');
    const bldgDesc = document.getElementById('ubBldgDesc');
    const bldgHorarioWrap = document.getElementById('ubBldgHorarioWrap');
    const bldgHorario = document.getElementById('ubBldgHorario');
    const bldgInstalacionesWrap = document.getElementById('ubBldgInstalacionesWrap');
    const bldgInstalaciones = document.getElementById('ubBldgInstalaciones');
    const bldgGo = document.getElementById('ubBldgGo');
    const bldg360 = document.getElementById('ubBldg360');

    const modal360 = document.getElementById('ub360Modal');
    const modal360Close = document.getElementById('ub360Close');
    const modal360Scene = document.getElementById('ub360Scene');
    const modal360Title = document.getElementById('ub360Title');

    let currentBuilding = null;
    let pending360Src = null;

    function hideEl(el) { if (el) el.style.display = 'none'; }
    function showEl(el, display) { if (el) el.style.display = display || 'block'; }

    function closeBuildingSheet() {
        if (!bldgSheet || !bldgBackdrop) return;
        bldgSheet.classList.remove('is-open');
        bldgSheet.setAttribute('aria-hidden', 'true');
        setTimeout(function () {
            bldgBackdrop.style.display = 'none';
        }, 230);
        document.body.style.overflow = '';
    }

    function openBuildingSheet(edificio) {
        if (!bldgSheet || !bldgBackdrop) return;
        currentBuilding = edificio || null;

        if (bldgTitle) bldgTitle.textContent = (edificio && (edificio.nombre || edificio.name)) ? (edificio.nombre || edificio.name) : 'Edificio';

        const bits = [];
        if (edificio && edificio.id != null) bits.push('ID: ' + String(edificio.id));
        if (edificio && edificio.tipo) {
            const tipos = Array.isArray(edificio.tipo) ? edificio.tipo : [edificio.tipo];
            const tipoTxt = tipos.filter(Boolean).map(String).join(', ');
            if (tipoTxt) bits.push(tipoTxt);
        }
        if (bldgSubtitle) {
            bldgSubtitle.textContent = bits.join(' • ');
            if (!bldgSubtitle.textContent) bldgSubtitle.textContent = 'Campus Tec';
        }

        if (bldgImg) {
            if (edificio && edificio.imagen) {
                bldgImg.src = edificio.imagen;
                bldgImg.alt = (edificio.nombre || 'Edificio');
                showEl(bldgImg, 'block');
            } else {
                hideEl(bldgImg);
                bldgImg.removeAttribute('src');
            }
        }

        if (bldgDesc) {
            const d = edificio && edificio.descripcion ? String(edificio.descripcion) : '';
            if (d) {
                bldgDesc.textContent = d;
                showEl(bldgDesc, 'block');
            } else {
                bldgDesc.textContent = '';
                hideEl(bldgDesc);
            }
        }

        if (bldgHorarioWrap && bldgHorario) {
            const h = edificio && edificio.horario ? String(edificio.horario) : '';
            if (h) {
                bldgHorario.textContent = h;
                showEl(bldgHorarioWrap, 'block');
            } else {
                bldgHorario.textContent = '';
                hideEl(bldgHorarioWrap);
            }
        }

        if (bldgInstalacionesWrap && bldgInstalaciones) {
            const inst = edificio && Array.isArray(edificio.instalaciones) ? edificio.instalaciones : [];
            if (inst.length) {
                bldgInstalaciones.innerHTML = inst.map(function (x) {
                    return '<li>' + String(x) + '</li>';
                }).join('');
                showEl(bldgInstalacionesWrap, 'block');
            } else {
                bldgInstalaciones.innerHTML = '';
                hideEl(bldgInstalacionesWrap);
            }
        }

        if (bldg360) {
            if (edificio && edificio.imagen_360) showEl(bldg360, '');
            else hideEl(bldg360);
        }

        bldgBackdrop.style.display = 'block';
        bldgSheet.classList.add('is-open');
        bldgSheet.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function close360Modal() {
        if (!modal360) return;
        modal360.style.display = 'none';
        pending360Src = null;
        if (modal360Scene) modal360Scene.innerHTML = '';
        document.body.style.overflow = '';
        document.body.classList.remove('ub-360-open');
    }

    let aframeScriptLoading = false;

    function ensureAFrameLoaded(callback) {
        if (window.AFRAME) {
            if (typeof callback === 'function') callback();
            return;
        }

        if (aframeScriptLoading) {
            const checkInterval = setInterval(function () {
                if (window.AFRAME) {
                    clearInterval(checkInterval);
                    if (typeof callback === 'function') callback();
                }
            }, 100);
            return;
        }

        aframeScriptLoading = true;
        const script = document.createElement('script');
        script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
        script.onload = function () {
            aframeScriptLoading = false;
            if (typeof callback === 'function') callback();
        };
        script.onerror = function () {
            aframeScriptLoading = false;
            if (modal360Scene) modal360Scene.textContent = 'Error al cargar el motor 3D. Comprueba tu conexión a internet.';
        };
        document.head.appendChild(script);
    }

    function render360SceneIfReady() {
        if (!modal360 || !modal360Scene || !pending360Src) return;
        if (!window.AFRAME) {
            ensureAFrameLoaded(render360SceneIfReady);
            return;
        }
        modal360Scene.innerHTML = `<a-scene embedded vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false"><a-sky src="${pending360Src}"></a-sky><a-camera position="0 1.6 0"></a-camera></a-scene>`;
    }

    function open360Modal(edificio) {
        if (!modal360 || !modal360Scene) return;
        if (!edificio || !edificio.imagen_360) return;
        pending360Src = edificio.imagen_360;
        if (modal360Title) modal360Title.textContent = (edificio.nombre ? (edificio.nombre + ' - 360°') : 'Vista 360°');
        modal360Scene.textContent = 'Cargando visor 360°...';
        modal360.style.display = 'block';
        document.body.style.overflow = 'hidden';
        document.body.classList.add('ub-360-open');
        ensureAFrameLoaded(render360SceneIfReady);
    }

    if (bldgClose) bldgClose.addEventListener('click', closeBuildingSheet);
    if (bldgBackdrop) bldgBackdrop.addEventListener('click', closeBuildingSheet);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && bldgSheet && bldgSheet.classList.contains('is-open')) closeBuildingSheet();
        if (e.key === 'Escape' && modal360 && modal360.style.display === 'block') close360Modal();
    });

    if (bldgGo) {
        bldgGo.addEventListener('click', function () {
            try { if (typeof window.ubicatecPrimeArrivalSound === 'function') window.ubicatecPrimeArrivalSound(); } catch (e) {}
            try { if (window.UbicatecVoiceNav) window.UbicatecVoiceNav.unlock(); } catch (e) {}
            const ed = currentBuilding;
            if (!ed || !ed.coords || !Array.isArray(ed.coords) || ed.coords.length < 2) return;
            if (!window.L || typeof window.ubicatecShowUbGeoModal !== 'function' || typeof window.ubicatecStartInMapNav !== 'function') return;
            closeBuildingSheet();
            const destLL = L.latLng(ed.coords[0], ed.coords[1]);
            const destTitle = ed.nombre || 'Destino';
            window.ubicatecShowUbGeoModal('Ubicación requerida', 'Para trazar la ruta hacia el edificio, habilita la ubicación en tu dispositivo.', 'route_building', function (pos) {
                const userLL = L.latLng(pos.coords.latitude, pos.coords.longitude);
                
                // INICIO MODIFICACION: Soporte para Modo Accesibilidad
                if (localStorage.getItem('ubicatecModoAccesibilidad') === 'true' && ed && ed.id) {
                    let simParam = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? '&simulacion=true' : '';
                    window.location.href = `ruta_accesible.html?origen=gps&coords=${userLL.lat},${userLL.lng}&destino=${ed.id}${simParam}`;
                    return;
                }
                // FIN MODIFICACION

                window.ubicatecStartInMapNav(userLL, destLL, { destTitle: destTitle });
            });
        });
    }

    if (bldg360) {
        bldg360.addEventListener('click', function () {
            const ed = currentBuilding;
            closeBuildingSheet();
            open360Modal(ed);
        });
    }

    if (modal360Close) modal360Close.addEventListener('click', close360Modal);
    if (modal360) {
        modal360.addEventListener('click', function (e) {
            if (e.target === modal360) close360Modal();
        });
    }

    window.ubicatecOpenBuildingSheet = openBuildingSheet;
});
