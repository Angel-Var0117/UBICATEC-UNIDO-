/**
 * Botón de Información de Accesibilidad - UBICATEC
 * Inyecta automáticamente un botón flotante (top-left) y un modal
 * informativo con los edificios accesibles del campus del ITP.
 *
 * Uso: basta con incluir este script en cualquier página HTML:
 *   <script src="js/boton-info-accesibilidad.js"></script>
 */

(function () {
    if (window.__ubicatecBotonAccesibilidad) {
        return;
    }
    window.__ubicatecBotonAccesibilidad = true;

    const UBICATEC_VOZ_STORAGE_KEY = 'ubicatecVozActivo';
    const UBICATEC_MODO_STORAGE_KEY = 'ubicatecModoAccesibilidad';
    const edificiosRespaldo = [1, 2, 3, 17, 19, 20, 25, 27, 28, 30, 36, 41, 45, 49, 51, 53];
    const edificioEspecial = 'Edificio 50 - Centro de Información';
    const idsEdificiosRespaldo = edificiosRespaldo.concat(50);

    // -------------------------------------------------------------------------
    // Datos: edificios accesibles del campus
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // Ruta base hacia img/ (detecta automáticamente si estamos en una
    // subcarpeta — por ejemplo pages/ — o en la raíz del proyecto)
    // -------------------------------------------------------------------------
    const scriptSrc = document.currentScript ? document.currentScript.src : '';
    // js/boton-info-accesibilidad.js → el directorio padre del script es la raíz
    const baseUrl = scriptSrc ? scriptSrc.replace(/js\/[^/]+$/, '') : '';
    const imgAccesibilidad = baseUrl + 'img/accesibilidad.jpeg';

    // -------------------------------------------------------------------------
    // Estilos del botón y el modal (inyectados una sola vez)
    // -------------------------------------------------------------------------
    const style = document.createElement('style');
    style.textContent = `
        #btnInfoAccesibilidad {
            position: fixed;
            
            
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: white;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            cursor: pointer;
            z-index: 1200;
            padding: 0;
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        #btnInfoAccesibilidad:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        #btnInfoAccesibilidad img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }
        #overlayInfoAccesibilidad {
            display: none;
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.55);
            backdrop-filter: blur(5px);
            z-index: 10000;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
        }
        #overlayInfoAccesibilidad.visible {
            display: flex;
        }
        #panelInfoAccesibilidad {
            background: white;
            border-radius: 20px;
            padding: 30px 25px 25px;
            max-width: 420px;
            width: 100%;
            max-height: 85vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            box-sizing: border-box;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            position: relative;
        }
        #cerrarInfoAccesibilidad {
            position: absolute; top: 14px; right: 14px;
            background: #e74c3c; color: white; border: none;
            border-radius: 50%; width: 34px; height: 34px;
            font-size: 20px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            line-height: 1;
        }
        #cerrarInfoAccesibilidad:hover { background: #c0392b; }
        .info-acc-header {
            display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
        }
        .info-acc-header img {
            width: 52px; height: 52px; border-radius: 50%;
            object-fit: cover; border: 2px solid #27ae60; flex-shrink: 0;
        }
        .info-acc-header h4 {
            margin: 0; color: #2c3e50; font-size: 17px; font-weight: 700;
        }
        .info-acc-header p {
            margin: 0; font-size: 12px; color: #7f8c8d;
        }
        .info-acc-desc {
            background: #eafaf1; border-left: 4px solid #27ae60;
            border-radius: 6px; padding: 12px 14px; margin-bottom: 16px;
            font-size: 13.5px; color: #1e8449; line-height: 1.5;
        }
        .info-acc-titulo {
            margin: 0 0 10px; color: #2c3e50;
            font-size: 14px; font-weight: 700;
        }
        .info-acc-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .info-acc-item {
            background: #f0f9f4; border: 1px solid #a9dfbf;
            border-radius: 8px; padding: 8px 10px;
            display: flex; align-items: center; gap: 7px;
            font-size: 13px; color: #1a5276;
        }
        .info-acc-item.full { grid-column: 1 / -1; }
        .info-acc-item span { color: #27ae60; font-size: 15px; flex-shrink: 0; }
        .info-acc-nota {
            margin: 16px 0 0; font-size: 12px;
            color: #95a5a6; text-align: center;
        }
        .info-voz-wrap {
            margin-top: 14px;
            padding: 10px 12px;
            border: 1px solid #dfe6e9;
            border-radius: 10px;
            background: #f8fbff;
        }
        .info-voz-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .info-voz-label {
            font-size: 13px;
            font-weight: 700;
            color: #2c3e50;
            margin: 0;
        }
        .info-voz-hint {
            margin: 6px 0 0;
            color: #6c757d;
            font-size: 12px;
        }
        .info-voz-switch {
            position: relative;
            display: inline-block;
            width: 46px;
            height: 26px;
            flex-shrink: 0;
        }
        .info-voz-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .info-voz-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #dfe6e9;
            transition: background-color 0.2s ease;
            border-radius: 999px;
        }
        .info-voz-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            top: 3px;
            background-color: white;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            border-radius: 50%;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .info-voz-switch input:checked + .info-voz-slider {
            background-color: #27ae60;
        }
        .info-voz-switch input:checked + .info-voz-slider:before {
            transform: translateX(20px);
        }
        .info-voz-switch input:focus-visible + .info-voz-slider {
            box-shadow: 0 0 0 3px rgba(39,174,96,0.35);
        }
        .info-modo-wrap {
            margin-top: 14px;
            padding: 10px 12px;
            border: 1px solid #b7d7f0;
            border-radius: 10px;
            background: #f4f9ff;
        }
        .info-modo-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .info-modo-label {
            font-size: 13px;
            font-weight: 700;
            color: #174a70;
            margin: 0;
        }
        .info-modo-hint {
            margin: 6px 0 0;
            color: #526b7a;
            font-size: 12px;
        }
        .info-modo-link {
            color: #005a9c;
            font-weight: 700;
        }
        .info-modo-switch input:disabled + .info-voz-slider {
            cursor: not-allowed;
            opacity: 0.65;
        }
        #btnInfoAccesibilidad.modo-accesibilidad-activo {
            border: 3px solid #218739;
            box-shadow: 0 0 0 3px rgba(33,135,57,0.25), 0 4px 15px rgba(0,0,0,0.2);
        }
        #ubicatec-accessibility-status {
            position: fixed;
            left: 50%;
            bottom: 24px;
            transform: translateX(-50%);
            z-index: 10001;
            max-width: min(90vw, 420px);
            padding: 12px 16px;
            border-radius: 8px;
            background: #174a70;
            color: #fff;
            box-shadow: 0 4px 16px rgba(0,0,0,0.25);
            font-size: 14px;
        }
        .ubicatec-visually-hidden {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        }
    `;
    document.head.appendChild(style);

    // -------------------------------------------------------------------------
    // HTML del botón
    // -------------------------------------------------------------------------
    const btn = document.createElement('button');
    btn.id = 'btnInfoAccesibilidad';
    btn.title = 'Información de accesibilidad';
    btn.type = 'button';
    btn.innerHTML = `<img src="${imgAccesibilidad}" alt="">`;

    // -------------------------------------------------------------------------
    // HTML del modal (overlay + panel)
    // -------------------------------------------------------------------------
    const overlay = document.createElement('div');
    overlay.id = 'overlayInfoAccesibilidad';

    function esPaginaInicio() {
        const ruta = window.location.pathname || '';
        return document.body.dataset.pagina === 'inicio' || /(?:^|\/)index\.html$/.test(ruta) || /\/$/.test(ruta);
    }

    function leerEstadoModoAccesibilidad() {
        try {
            return localStorage.getItem(UBICATEC_MODO_STORAGE_KEY) === 'true';
        } catch (error) {
            console.warn('No se pudo leer el modo de accesibilidad:', error);
            return false;
        }
    }

    function guardarEstadoModoAccesibilidad(activo) {
        try {
            localStorage.setItem(UBICATEC_MODO_STORAGE_KEY, String(!!activo));
        } catch (error) {
            console.warn('No se pudo guardar el modo de accesibilidad:', error);
        }
    }

    function actualizarEstadoModoAccesibilidad(activo, anunciar) {
        const estadoAnterior = window.UbicatecAccesibilidad.estaActivo();
        const estadoNuevo = !!activo;
        guardarEstadoModoAccesibilidad(estadoNuevo);
        document.documentElement.dataset.modoAccesibilidad = String(estadoNuevo);

        if (estadoAnterior !== estadoNuevo) {
            document.dispatchEvent(new CustomEvent('ubicatec:modo-accesibilidad', {
                detail: { activo: estadoNuevo }
            }));
        }

        actualizarIndicadoresModo(estadoNuevo);
        if (anunciar) {
            anunciarEstadoModo(estadoNuevo);
        }
        return estadoNuevo;
    }

    window.UbicatecAccesibilidad = {
        estaActivo: leerEstadoModoAccesibilidad,
        activar: function () {
            return actualizarEstadoModoAccesibilidad(true, false);
        },
        desactivar: function () {
            return actualizarEstadoModoAccesibilidad(false, false);
        },
        alternar: function () {
            return actualizarEstadoModoAccesibilidad(!leerEstadoModoAccesibilidad(), false);
        }
    };

    function obtenerIdsEdificios() {
        const idsGrafo = window.grafoAccesible && window.grafoAccesible.edificios
            ? Object.keys(window.grafoAccesible.edificios).map(Number).filter(Number.isFinite).sort((a, b) => a - b)
            : null;
        const idsRespaldo = idsEdificiosRespaldo.slice().sort((a, b) => a - b);

        if (idsGrafo) {
            const faltanEnGrafo = idsRespaldo.filter(id => !idsGrafo.includes(id));
            const faltanEnRespaldo = idsGrafo.filter(id => !idsRespaldo.includes(id));
            if (faltanEnGrafo.length || faltanEnRespaldo.length) {
                console.warn('La lista de edificios del grafo y el respaldo difieren:', {
                    faltanEnGrafo,
                    faltanEnRespaldo
                });
            }
            return idsGrafo;
        }

        return idsRespaldo;
    }

    function renderizarEdificios() {
        const idsEdificios = obtenerIdsEdificios();
        const lista = document.createElement('ul');
        lista.id = 'listaEdificiosAccesibles';
        lista.setAttribute('role', 'list');

        idsEdificios.forEach(id => {
            const item = document.createElement('li');
            item.className = 'info-acc-item' + (id === 50 ? ' full' : '');
            item.innerHTML = `<span aria-hidden="true">✓</span>${id === 50 ? edificioEspecial : `Edificio ${id}`}`;
            lista.appendChild(item);
        });
        return { idsEdificios, lista };
    }

    const edificiosRenderizados = renderizarEdificios();
    const estadoInicialModo = leerEstadoModoAccesibilidad();
    document.documentElement.dataset.modoAccesibilidad = String(estadoInicialModo);

    overlay.innerHTML = `
        <div id="panelInfoAccesibilidad" role="dialog" aria-modal="true" aria-labelledby="tituloInfoAccesibilidad">
            <button id="cerrarInfoAccesibilidad" type="button" aria-label="Cerrar información de accesibilidad">×</button>

            <div class="info-acc-header">
                <img src="${imgAccesibilidad}" alt="">
                <div>
                    <h4 id="tituloInfoAccesibilidad">Rutas Accesibles ITP</h4>
                    <p>TecNM Campus Puebla</p>
                </div>
            </div>

            <div class="info-acc-desc">
                El <strong>Instituto Tecnológico de Puebla</strong> cuenta con rutas
                accesibles para personas con movilidad reducida. Estas rutas evitan
                escaleras y obstáculos, garantizando un trayecto seguro por el campus.<br><br>
                <strong>Importante:</strong> Las rutas accesibles actualmente están
                disponibles para <em>ciertos edificios</em> del campus. Consulta la
                lista a continuación.
            </div>

            <div class="info-voz-wrap">
                <div class="info-voz-row">
                    <label class="info-voz-label" for="switchAsistenteVoz">
                        Asistente de navegacion por voz
                    </label>
                    <label class="info-voz-switch">
                        <input
                            id="switchAsistenteVoz"
                            name="ubicatecVozActivo"
                            type="checkbox"
                            role="switch"
                            aria-label="Asistente de navegacion por voz"
                        >
                        <span class="info-voz-slider" aria-hidden="true"></span>
                    </label>
                </div>
                <p class="info-voz-hint">Mantiene el estado activo entre paginas.</p>
            </div>

            <div class="info-modo-wrap">
                <div class="info-modo-row">
                    <label class="info-modo-label" for="switchModoAccesibilidad">Modo de accesibilidad</label>
                    <label class="info-voz-switch info-modo-switch">
                        <input id="switchModoAccesibilidad" type="checkbox" role="switch" aria-checked="false">
                        <span class="info-voz-slider" aria-hidden="true"></span>
                    </label>
                </div>
                <p id="modoAccesibilidadHint" class="info-modo-hint">Activa rutas y asistencia accesibles desde Inicio.</p>
            </div>

            <h5 class="info-acc-titulo">Edificios con ruta accesible disponible:</h5>
            <p id="conteoEdificiosAccesibles" class="info-acc-hint">${edificiosRenderizados.idsEdificios.length} edificios</p>
            <div class="info-acc-grid"></div>

            <p class="info-acc-nota">
                Para más información, selecciona un edificio en el mapa y activa
                la ruta accesible.
            </p>
        </div>
    `;

    function leerEstadoAsistenteVoz() {
        try {
            return localStorage.getItem(UBICATEC_VOZ_STORAGE_KEY) === 'true';
        } catch (error) {
            console.warn('No se pudo leer localStorage para voz:', error);
            return false;
        }
    }

    function guardarEstadoAsistenteVoz(estadoActivo) {
        try {
            localStorage.setItem(UBICATEC_VOZ_STORAGE_KEY, String(!!estadoActivo));
        } catch (error) {
            console.warn('No se pudo guardar localStorage para voz:', error);
        }
    }

    function configurarSwitchAsistenteVoz() {
        const switchVoz = document.getElementById('switchAsistenteVoz');
        if (!switchVoz) {
            return;
        }

        const estadoGuardado = leerEstadoAsistenteVoz();
        switchVoz.checked = estadoGuardado;
        switchVoz.setAttribute('aria-checked', String(estadoGuardado));

        switchVoz.addEventListener('change', function () {
            const activo = !!switchVoz.checked;
            switchVoz.setAttribute('aria-checked', String(activo));
            guardarEstadoAsistenteVoz(activo);
        });
    }

    // -------------------------------------------------------------------------
    // Inyectar en el DOM cuando el documento esté listo
    // -------------------------------------------------------------------------
    function actualizarIndicadoresModo(activo) {
        const switchModo = document.getElementById('switchModoAccesibilidad');
        if (switchModo) {
            switchModo.checked = !!activo;
            switchModo.setAttribute('aria-checked', String(!!activo));
        }
        btn.classList.toggle('modo-accesibilidad-activo', !!activo);
        btn.setAttribute('aria-label', `Información de accesibilidad. Modo ${activo ? 'activado' : 'desactivado'}`);
    }

    function mostrarAvisoFallback(texto) {
        let live = document.getElementById('ubicatec-live');
        if (!live) {
            live = document.createElement('div');
            live.id = 'ubicatec-live';
            live.className = 'ubicatec-visually-hidden';
            live.setAttribute('aria-live', 'polite');
            document.body.appendChild(live);
        }
        live.textContent = texto;

        const previo = document.getElementById('ubicatec-accessibility-status');
        if (previo) previo.remove();
        const aviso = document.createElement('div');
        aviso.id = 'ubicatec-accessibility-status';
        aviso.setAttribute('role', 'status');
        aviso.textContent = texto;
        document.body.appendChild(aviso);
        window.setTimeout(() => aviso.remove(), 4000);
    }

    function hablarConSpeechSynthesis(texto) {
        const synth = window.speechSynthesis;
        const Utterance = window.SpeechSynthesisUtterance;
        if (!synth || !Utterance) {
            return Promise.reject(new Error('SpeechSynthesis no disponible'));
        }

        return new Promise((resolve, reject) => {
            let iniciado = false;
            let listenerRegistrado = false;
            let temporizador = null;

            const limpiar = () => {
                if (listenerRegistrado && synth.removeEventListener) {
                    synth.removeEventListener('voiceschanged', hablar);
                }
                if (temporizador) window.clearTimeout(temporizador);
            };
            const hablar = () => {
                if (iniciado) return;
                iniciado = true;
                limpiar();
                try {
                    synth.cancel();
                    const utterance = new Utterance(texto);
                    utterance.lang = 'es-MX';
                    const voces = synth.getVoices ? synth.getVoices() : [];
                    utterance.voice = voces.find(voz => voz.lang === 'es-MX') || voces.find(voz => /^es-/i.test(voz.lang)) || null;
                    utterance.onend = () => resolve();
                    utterance.onerror = event => reject(event || new Error('Error de voz'));
                    synth.speak(utterance);
                } catch (error) {
                    reject(error);
                }
            };

            const voces = synth.getVoices ? synth.getVoices() : [];
            if (voces.length || !synth.addEventListener) {
                hablar();
            } else {
                listenerRegistrado = true;
                synth.addEventListener('voiceschanged', hablar, { once: true });
                temporizador = window.setTimeout(hablar, 300);
            }
        });
    }

    function anunciarEstadoModo(activo) {
        const texto = `Modo de accesibilidad ${activo ? 'activado' : 'desactivado'}`;
        const voz = window.UbicatecVoz;
        if (voz && typeof voz.hablar === 'function') {
            try {
                if (typeof voz.inicializar === 'function') voz.inicializar({ lang: 'es-MX' });
                const resultado = voz.hablar(texto, { prioridad: 'urgente', lang: 'es-MX' });
                if (resultado && typeof resultado.then === 'function') {
                    resultado.catch(() => hablarConSpeechSynthesis(texto).catch(() => mostrarAvisoFallback(texto)));
                    return;
                }
                if (resultado === true) return;
            } catch (error) {
                console.warn('No se pudo usar UbicatecVoz:', error);
            }
        }
        hablarConSpeechSynthesis(texto).catch(() => mostrarAvisoFallback(texto));
    }

    function configurarModoAccesibilidad() {
        const switchModo = document.getElementById('switchModoAccesibilidad');
        const hint = document.getElementById('modoAccesibilidadHint');
        if (!switchModo) return;

        actualizarIndicadoresModo(estadoInicialModo);
        if (!esPaginaInicio()) {
            switchModo.disabled = true;
            switchModo.setAttribute('aria-disabled', 'true');
            hint.innerHTML = 'Se activa desde <a class="info-modo-link" href="index.html">Inicio</a>.';
            return;
        }

        switchModo.addEventListener('change', () => {
            const activo = actualizarEstadoModoAccesibilidad(switchModo.checked, true);
            switchModo.checked = activo;
        });
    }

    function configurarFocoModal() {
        const panel = document.getElementById('panelInfoAccesibilidad');
        if (!panel) return;
        panel.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                cerrar();
                return;
            }
            if (event.key !== 'Tab') return;
            const elementos = Array.from(panel.querySelectorAll('button, input, a[href], [tabindex]:not([tabindex="-1"])'))
                .filter(elemento => !elemento.disabled && elemento.offsetParent !== null);
            if (!elementos.length) return;
            const primero = elementos[0];
            const ultimo = elementos[elementos.length - 1];
            if (event.shiftKey && document.activeElement === primero) {
                event.preventDefault();
                ultimo.focus();
            } else if (!event.shiftKey && document.activeElement === ultimo) {
                event.preventDefault();
                primero.focus();
            }
        });
    }

    let elementoQueAbrio = null;

    function inyectar() {
        const fabs = document.querySelector('.ub-gmaps-fabs'); if (fabs) { fabs.insertBefore(btn, fabs.firstChild); btn.style.position = 'relative'; btn.style.width = '42px'; btn.style.height = '42px'; btn.style.margin = '5px 0'; } else { document.body.appendChild(btn); btn.style.position = 'absolute'; btn.style.top = '85px'; btn.style.left = '15px'; }
        document.body.appendChild(overlay);
        document.querySelector('#panelInfoAccesibilidad .info-acc-grid').appendChild(edificiosRenderizados.lista);

        // Persistencia del servicio "Asistente de navegacion por voz"
        configurarSwitchAsistenteVoz();
        configurarModoAccesibilidad();
        configurarFocoModal();
        actualizarIndicadoresModo(estadoInicialModo);

        // Abrir modal
        btn.addEventListener('click', function () {
            elementoQueAbrio = document.activeElement;
            overlay.classList.add('visible');
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.getElementById('cerrarInfoAccesibilidad').focus();
        });

        // Cerrar con el botón ×
        document.getElementById('cerrarInfoAccesibilidad').addEventListener('click', cerrar);

        // Cerrar al hacer clic en el fondo (fuera del panel)
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) cerrar();
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('visible')) cerrar();
        });
    }

    function cerrar() {
        overlay.classList.remove('visible');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        if (elementoQueAbrio && typeof elementoQueAbrio.focus === 'function') {
            elementoQueAbrio.focus();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inyectar);
    } else {
        inyectar();
    }
})();




