/**
 * Modulo de rutas accesibles y voz - UBICATEC
 *
 * Este archivo encapsula toda su API en window.UbicatecVoz para evitar
 * contaminacion global y facilitar su integracion con otras paginas.
 */

(function (window, document) {
    'use strict';

    var namespace = window.UbicatecVoz = window.UbicatecVoz || {};

    // Evita doble inicializacion si el script se carga mas de una vez.
    if (namespace._moduloRutasVozCargado) {
        return;
    }
    namespace._moduloRutasVozCargado = true;

    var synth = window.speechSynthesis || null;
    var SpeechUtterance = window.SpeechSynthesisUtterance || null;
    var advertenciaSoporteMostrada = false;

    var estado = {
        cola: [],
        hablando: false,
        itemActual: null,
        idReintento: null,
        gestionAudioActiva: false,
        snapshotsAudio: [],
        webAudioContexts: [],
        webAudioEstados: [],
        config: {
            lang: 'es-MX',
            rate: 1,
            pitch: 1,
            volume: 1,
            voiceName: '',
            estrategiaAudio: 'duck',
            volumenDuck: 0.2,
            controlarWebAudio: true,
            reintentoMs: 150,

            debug: false
        }
    };

    function logDebug() {
        if (!estado.config.debug || !window.console || !console.log) {
            return;
        }
        console.log.apply(console, arguments);
    }

    function soportaSpeechSynthesis() {
        return !!(synth && SpeechUtterance);
    }

    function validarSpeechSynthesis() {
        if (soportaSpeechSynthesis()) {
            return true;
        }

        if (!advertenciaSoporteMostrada && window.console && console.warn) {
            console.warn('[UbicatecVoz] SpeechSynthesis no esta disponible en este navegador.');
            advertenciaSoporteMostrada = true;
        }
        return false;
    }

    function limitarNumero(valor, min, max, fallback) {
        var numero = Number(valor);
        if (!isFinite(numero)) {
            return fallback;
        }
        if (numero < min) {
            return min;
        }
        if (numero > max) {
            return max;
        }
        return numero;
    }

    function normalizarTexto(texto) {
        if (texto === null || texto === undefined) {
            return '';
        }
        return String(texto).trim();
    }

    function toRad(grados) {
        return grados * Math.PI / 180;
    }

    function toDeg(radianes) {
        return radianes * 180 / Math.PI;
    }

    function normalizarCoordenada(valor) {
        var numero = Number(valor);
        return isFinite(numero) ? numero : null;
    }

    function obtenerCoordenadasNodo(nodo) {
        if (!nodo || typeof nodo !== 'object') {
            return null;
        }

        if (Array.isArray(nodo.coords) && nodo.coords.length >= 2) {
            return {
                lat: normalizarCoordenada(nodo.coords[0]),
                lon: normalizarCoordenada(nodo.coords[1])
            };
        }

        return {
            lat: normalizarCoordenada(nodo.lat),
            lon: normalizarCoordenada(nodo.lon)
        };
    }

    function calcularRumbo(nodoA, nodoB) {
        var coordenadasA = obtenerCoordenadasNodo(nodoA);
        var coordenadasB = obtenerCoordenadasNodo(nodoB);
        var lat1 = coordenadasA && coordenadasA.lat;
        var lon1 = coordenadasA && coordenadasA.lon;
        var lat2 = coordenadasB && coordenadasB.lat;
        var lon2 = coordenadasB && coordenadasB.lon;

        if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
            return null;
        }

        var phi1 = toRad(lat1);
        var phi2 = toRad(lat2);
        var deltaLambda = toRad(lon2 - lon1);
        var y = Math.sin(deltaLambda) * Math.cos(phi2);
        var x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
        var theta = Math.atan2(y, x);
        return (toDeg(theta) + 360) % 360;
    }

    function normalizarDiferenciaAngulo(grados) {
        var diff = ((grados % 360) + 360) % 360;
        if (diff > 180) {
            diff -= 360;
        }
        return diff;
    }

    function calcularGiroLocal(nodoAnterior, nodoActual, nodoSiguiente) {
        var rumboPrevio = calcularRumbo(nodoAnterior, nodoActual);
        var rumboSiguiente = calcularRumbo(nodoActual, nodoSiguiente);

        if (rumboPrevio === null || rumboSiguiente === null) {
            return 'Sigue derecho';
        }

        var diferencia = normalizarDiferenciaAngulo(rumboSiguiente - rumboPrevio);
        var umbral = 30;

        if (diferencia > umbral) {
            return 'Gira a la derecha';
        }

        if (diferencia < -umbral) {
            return 'Gira a la izquierda';
        }

        return 'Sigue derecho';
    }

    function clonarOpciones(obj) {
        if (!obj || typeof obj !== 'object') {
            return {};
        }

        var copia = {};
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                copia[key] = obj[key];
            }
        }
        return copia;
    }

    function obtenerVoces() {
        if (!validarSpeechSynthesis() || !synth.getVoices) {
            return [];
        }
        return synth.getVoices() || [];
    }

    var FEMALE_KEYWORDS = [
        'female', 'woman', 'mujer', 'femenina', 'femenino',
        'sabina', 'helena', 'laura', 'paula', 'paulina', 'monica', 'mónica',
        'dalia', 'elvira', 'paloma', 'mia', 'soledad', 'francisca', 'victoria',
        'camila', 'jimena', 'ximena', 'lucia', 'lucía', 'esperanza', 'carmen',
        'silvia', 'ana', 'hilda', 'penelope', 'penélope', 'rosa', 'conchita',
        'angelica', 'angélica', 'luciana', 'guadalupe', 'sofia', 'sofía'
    ];

    function isFemaleVoice(voice) {
        if (!voice) return false;
        var name = (voice.name || '').toLowerCase();
        var uri = (voice.voiceURI || '').toLowerCase();
        for (var i = 0; i < FEMALE_KEYWORDS.length; i++) {
            var kw = FEMALE_KEYWORDS[i];
            if (name.indexOf(kw) !== -1 || uri.indexOf(kw) !== -1) {
                return true;
            }
        }
        if (name.indexOf('google') !== -1 && (name.indexOf('español') !== -1 || name.indexOf('spanish') !== -1)) {
            return true;
        }
        return false;
    }

    function seleccionarVoz(voiceName, lang) {
        var voces = obtenerVoces();
        if (!voces.length) {
            return null;
        }

        var i;
        if (voiceName) {
            for (i = 0; i < voces.length; i++) {
                if (voces[i].name === voiceName) {
                    return voces[i];
                }
            }
        }

        // Filtramos las voces que coincidan con el idioma o al menos el prefijo 'es'
        var prefijo = lang ? String(lang).split('-')[0] : 'es';
        var vocesIdioma = [];
        for (i = 0; i < voces.length; i++) {
            if (typeof voces[i].lang === 'string' && voces[i].lang.toLowerCase().indexOf(prefijo.toLowerCase()) === 0) {
                vocesIdioma.push(voces[i]);
            }
        }

        if (vocesIdioma.length === 0) {
            return voces[0]; // Fallback absoluto
        }

        // Prioridad 1: Voces femeninas del idioma solicitado
        var femaleMx = null;
        var femaleLatam = null;
        var femaleEs = null;
        var femaleAny = null;

        for (i = 0; i < vocesIdioma.length; i++) {
            var v = vocesIdioma[i];
            var l = (v.lang || '').replace('_', '-').toLowerCase();
            if (isFemaleVoice(v)) {
                if (l === 'es-mx' && !femaleMx) femaleMx = v;
                else if ((l === 'es-us' || l === 'es-419') && !femaleLatam) femaleLatam = v;
                else if ((l === 'es-es' || l === 'es') && !femaleEs) femaleEs = v;
                else if (!femaleAny) femaleAny = v;
            }
        }

        var chosenFemale = femaleMx || femaleLatam || femaleEs || femaleAny;
        if (chosenFemale) {
            return chosenFemale;
        }

        // Prioridad 2: Si no hay femeninas, devolver la mejor coincidencia del idioma
        var exactLangMatch = null;
        for (i = 0; i < vocesIdioma.length; i++) {
            if (vocesIdioma[i].lang === lang) {
                exactLangMatch = vocesIdioma[i];
                break;
            }
        }

        return exactLangMatch || vocesIdioma[0] || voces[0];
    }

    function aplicarConfiguracion(utterance, opciones) {
        var cfg = estado.config;
        var local = opciones || {};

        var lang = normalizarTexto(local.lang) || cfg.lang;
        var voiceName = normalizarTexto(local.voiceName) || cfg.voiceName;
        var voice = seleccionarVoz(voiceName, lang);

        utterance.lang = lang;
        utterance.rate = limitarNumero(local.rate, 0.1, 10, cfg.rate);
        utterance.pitch = limitarNumero(local.pitch, 0, 2, cfg.pitch);
        utterance.volume = limitarNumero(local.volume, 0, 1, cfg.volume);

        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang || lang;
        }
    }

    function buscarSnapshotAudio(audioElement) {
        var i;
        for (i = 0; i < estado.snapshotsAudio.length; i++) {
            if (estado.snapshotsAudio[i].element === audioElement) {
                return estado.snapshotsAudio[i];
            }
        }
        return null;
    }

    function capturarEstadoAudio(audioElement) {
        return {
            element: audioElement,
            paused: audioElement.paused,
            muted: audioElement.muted,
            volume: audioElement.volume
        };
    }

    function obtenerAudiosDelDOM() {
        return Array.prototype.slice.call(document.querySelectorAll('audio'));
    }

    function aplicarEstrategiaAudio(audioElement) {
        var estrategia = estado.config.estrategiaAudio;

        if (estrategia === 'pause') {
            if (!audioElement.paused) {
                audioElement.pause();
            }
            return;
        }

        if (estrategia === 'mute') {
            audioElement.muted = true;
            return;
        }

        // Estrategia "duck": baja volumen sin pausar reproduccion.
        audioElement.volume = limitarNumero(estado.config.volumenDuck, 0, 1, 0.2);
    }

    function suspenderWebAudioRegistrado() {
        if (!estado.config.controlarWebAudio || !estado.webAudioContexts.length) {
            return;
        }

        estado.webAudioEstados = [];

        var i;
        for (i = 0; i < estado.webAudioContexts.length; i++) {
            var ctx = estado.webAudioContexts[i];
            if (!ctx) {
                continue;
            }

            try {
                estado.webAudioEstados.push({
                    contexto: ctx,
                    state: ctx.state
                });

                if (ctx.state === 'running' && typeof ctx.suspend === 'function') {
                    var promesaSuspend = ctx.suspend();
                    if (promesaSuspend && typeof promesaSuspend.catch === 'function') {
                        promesaSuspend.catch(function () {
                            // Silencio intencional: la suspension puede fallar
                            // segun politicas de autoplay del navegador.
                        });
                    }
                }
            } catch (error) {
                logDebug('[UbicatecVoz] No se pudo suspender AudioContext:', error);
            }
        }
    }

    function reanudarWebAudioRegistrado() {
        if (!estado.config.controlarWebAudio || !estado.webAudioEstados.length) {
            return;
        }

        var i;
        for (i = 0; i < estado.webAudioEstados.length; i++) {
            var item = estado.webAudioEstados[i];
            if (!item || !item.contexto) {
                continue;
            }

            try {
                if (item.state === 'running' && item.contexto.state === 'suspended' && typeof item.contexto.resume === 'function') {
                    var promesaResume = item.contexto.resume();
                    if (promesaResume && typeof promesaResume.catch === 'function') {
                        promesaResume.catch(function () {
                            // Puede fallar en contextos cerrados o bloqueados.
                        });
                    }
                }
            } catch (error) {
                logDebug('[UbicatecVoz] No se pudo reanudar AudioContext:', error);
            }
        }

        estado.webAudioEstados = [];
    }

    function prepararAudiosAntesDeHablar() {
        var audios = obtenerAudiosDelDOM();
        var i;

        for (i = 0; i < audios.length; i++) {
            var audio = audios[i];
            if (!buscarSnapshotAudio(audio)) {
                estado.snapshotsAudio.push(capturarEstadoAudio(audio));
            }

            try {
                aplicarEstrategiaAudio(audio);
            } catch (error) {
                logDebug('[UbicatecVoz] No se pudo ajustar audio DOM:', error);
            }
        }

        if (!estado.gestionAudioActiva) {
            suspenderWebAudioRegistrado();
            estado.gestionAudioActiva = true;
        }
    }

    function restaurarAudiosDespuesDeHablar() {
        var i;

        for (i = 0; i < estado.snapshotsAudio.length; i++) {
            var snapshot = estado.snapshotsAudio[i];
            if (!snapshot || !snapshot.element) {
                continue;
            }

            var audio = snapshot.element;

            try {
                audio.muted = snapshot.muted;
                audio.volume = snapshot.volume;

                if (snapshot.paused && !audio.paused) {
                    audio.pause();
                }

                if (!snapshot.paused && audio.paused) {
                    var promesaPlay = audio.play();
                    if (promesaPlay && typeof promesaPlay.catch === 'function') {
                        promesaPlay.catch(function () {
                            // Puede fallar si el navegador exige gesto del usuario.
                        });
                    }
                }
            } catch (error) {
                logDebug('[UbicatecVoz] No se pudo restaurar audio DOM:', error);
            }
        }

        estado.snapshotsAudio = [];

        if (estado.gestionAudioActiva) {
            reanudarWebAudioRegistrado();
            estado.gestionAudioActiva = false;
        }
    }

    function programarReintento() {
        if (estado.idReintento) {
            return;
        }

        estado.idReintento = window.setTimeout(function () {
            estado.idReintento = null;
            procesarCola();
        }, estado.config.reintentoMs);
    }

    function limpiarReintento() {
        if (!estado.idReintento) {
            return;
        }
        window.clearTimeout(estado.idReintento);
        estado.idReintento = null;
    }

    function finalizarItem(error, evento) {
        var item = estado.itemActual;

        estado.itemActual = null;
        estado.hablando = false;
        limpiarReintento();

        if (item) {
            if (error) {
                item.reject(error);
            } else {
                item.resolve(evento || null);
            }
        }

        if (!estado.cola.length) {
            restaurarAudiosDespuesDeHablar();
        }

        if (estado.cola.length) {
            window.setTimeout(procesarCola, 0);
        }
    }

    function procesarCola() {
        if (!validarSpeechSynthesis()) {
            return;
        }

        if (estado.hablando) {
            return;
        }

        if (!estado.cola.length) {
            restaurarAudiosDespuesDeHablar();
            return;
        }

        // Respeta otras locuciones activas del navegador.
        if (synth.speaking || synth.pending) {
            programarReintento();
            return;
        }

        var item = estado.cola.shift();
        estado.itemActual = item;
        estado.hablando = true;

        var utterance = new SpeechUtterance(item.texto);
        aplicarConfiguracion(utterance, item.opciones);

        utterance.onstart = function () {
            prepararAudiosAntesDeHablar();
        };

        utterance.onend = function (evento) {
            finalizarItem(null, evento);
        };

        utterance.onerror = function (evento) {
            var detalle = (evento && evento.error) ? String(evento.error) : 'desconocido';
            finalizarItem(new Error('[UbicatecVoz] Error en SpeechSynthesis: ' + detalle), evento);
        };

        try {
            synth.speak(utterance);
        } catch (error) {
            finalizarItem(error);
        }
    }

    function encolarInstruccion(texto, opciones) {
        var mensaje = normalizarTexto(texto);

        if (!mensaje) {
            return Promise.reject(new Error('[UbicatecVoz] El texto de la instruccion esta vacio.'));
        }

        if (!validarSpeechSynthesis()) {
            return Promise.reject(new Error('[UbicatecVoz] SpeechSynthesis no es compatible con este navegador.'));
        }

        return new Promise(function (resolve, reject) {
            estado.cola.push({
                texto: mensaje,
                opciones: opciones || {},
                resolve: resolve,
                reject: reject
            });

            procesarCola();
        });
    }

    function speakStep(texto, opciones) {
        return encolarInstruccion(texto, opciones);
    }

    function requestAccessibleRouteLocal(nodosRuta, indiceActual, opcionesVoz) {
        if (!Array.isArray(nodosRuta) || nodosRuta.length < 3) {
            return Promise.reject(new Error('[UbicatecVoz] Ruta local insuficiente para calcular giro.'));
        }

        var indice = Number(indiceActual);
        if (!isFinite(indice)) {
            indice = 1;
        }

        if (indice < 1) {
            indice = 1;
        } else if (indice > nodosRuta.length - 2) {
            indice = nodosRuta.length - 2;
        }

        var anterior = nodosRuta[indice - 1];
        var actual = nodosRuta[indice];
        var siguiente = nodosRuta[indice + 1];

        var instruccion = calcularGiroLocal(anterior, actual, siguiente);
        return speakStep(instruccion, opcionesVoz);
    }

    function limpiarCola() {
        var pendientes = estado.cola.splice(0, estado.cola.length);
        var i;
        for (i = 0; i < pendientes.length; i++) {
            pendientes[i].reject(new Error('[UbicatecVoz] Instruccion removida de la cola.'));
        }
    }

    function detenerTodo() {
        var actual = estado.itemActual;

        limpiarCola();
        limpiarReintento();

        estado.itemActual = null;
        estado.hablando = false;

        if (actual) {
            actual.reject(new Error('[UbicatecVoz] Reproduccion cancelada por el usuario.'));
        }

        if (validarSpeechSynthesis()) {
            try {
                synth.cancel();
            } catch (error) {
                logDebug('[UbicatecVoz] No se pudo cancelar SpeechSynthesis:', error);
            }
        }

        restaurarAudiosDespuesDeHablar();
    }

    function configurar(opciones) {
        if (!opciones || typeof opciones !== 'object') {
            return;
        }

        if (typeof opciones.lang === 'string' && normalizarTexto(opciones.lang)) {
            estado.config.lang = normalizarTexto(opciones.lang);
        }
        if (typeof opciones.voiceName === 'string') {
            estado.config.voiceName = normalizarTexto(opciones.voiceName);
        }
        if (opciones.rate !== undefined) {
            estado.config.rate = limitarNumero(opciones.rate, 0.1, 10, estado.config.rate);
        }
        if (opciones.pitch !== undefined) {
            estado.config.pitch = limitarNumero(opciones.pitch, 0, 2, estado.config.pitch);
        }
        if (opciones.volume !== undefined) {
            estado.config.volume = limitarNumero(opciones.volume, 0, 1, estado.config.volume);
        }
        if (opciones.reintentoMs !== undefined) {
            estado.config.reintentoMs = limitarNumero(opciones.reintentoMs, 50, 2000, estado.config.reintentoMs);
        }

        if (typeof opciones.debug === 'boolean') {
            estado.config.debug = opciones.debug;
        }

        if (typeof opciones.estrategiaAudio === 'string') {
            var estrategia = normalizarTexto(opciones.estrategiaAudio).toLowerCase();
            if (estrategia === 'pause' || estrategia === 'mute' || estrategia === 'duck') {
                estado.config.estrategiaAudio = estrategia;
            }
        }

        if (opciones.volumenDuck !== undefined) {
            estado.config.volumenDuck = limitarNumero(opciones.volumenDuck, 0, 1, estado.config.volumenDuck);
        }

        if (typeof opciones.controlarWebAudio === 'boolean') {
            estado.config.controlarWebAudio = opciones.controlarWebAudio;
        }
    }

    function registrarAudioContext(contexto) {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass || !contexto || !(contexto instanceof AudioContextClass)) {
            return false;
        }

        var i;
        for (i = 0; i < estado.webAudioContexts.length; i++) {
            if (estado.webAudioContexts[i] === contexto) {
                return true;
            }
        }

        estado.webAudioContexts.push(contexto);
        return true;
    }



    function hablarLote(lista, opcionesBase) {
        if (!Array.isArray(lista)) {
            return Promise.reject(new Error('[UbicatecVoz] Se esperaba un arreglo de instrucciones.'));
        }

        var promesas = [];
        var i;

        for (i = 0; i < lista.length; i++) {
            var item = lista[i];

            if (typeof item === 'string') {
                promesas.push(encolarInstruccion(item, opcionesBase));
                continue;
            }

            if (item && typeof item.texto === 'string') {
                var opcionesItem = clonarOpciones(opcionesBase);
                if (item.opciones && typeof item.opciones === 'object') {
                    var claves = Object.keys(item.opciones);
                    var j;
                    for (j = 0; j < claves.length; j++) {
                        opcionesItem[claves[j]] = item.opciones[claves[j]];
                    }
                }

                promesas.push(encolarInstruccion(item.texto, opcionesItem));
            }
        }

        return Promise.all(promesas);
    }

    namespace.VERSION = '1.0.0';

    namespace.inicializar = function (opciones) {
        configurar(opciones);
        validarSpeechSynthesis();
        return namespace;
    };

    namespace.soportaSpeechSynthesis = soportaSpeechSynthesis;
    namespace.configurar = configurar;

    namespace.encolarInstruccion = encolarInstruccion;
    namespace.hablar = encolarInstruccion;
    namespace.hablarLote = hablarLote;
    namespace.limpiarCola = limpiarCola;
    namespace.detener = detenerTodo;

    namespace.speakStep = speakStep;
    namespace.calcularGiroLocal = calcularGiroLocal;
    namespace.requestAccessibleRouteLocal = requestAccessibleRouteLocal;

    // Helpers para conflicto de audio: uso manual o automatico.
    namespace.prepararAudiosAntesDeHablar = prepararAudiosAntesDeHablar;
    namespace.restaurarAudiosDespuesDeHablar = restaurarAudiosDespuesDeHablar;
    namespace.registrarAudioContext = registrarAudioContext;



    namespace.obtenerEstado = function () {
        return {
            colaPendiente: estado.cola.length,
            hablando: estado.hablando,
            gestionAudioActiva: estado.gestionAudioActiva,
            estrategiaAudio: estado.config.estrategiaAudio,
            speechDisponible: soportaSpeechSynthesis()
        };
    };

    // Forzar carga inicial de voces en navegadores que la hacen diferida.
    if (validarSpeechSynthesis()) {
        obtenerVoces();
    }
})(window, document);
