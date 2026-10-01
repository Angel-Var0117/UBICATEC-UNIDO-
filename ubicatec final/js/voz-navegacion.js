(function () {
    'use strict';

    var inicializada = false;
    var activa = true;
    var voces = [];
    var vozSeleccionada = null;
    var cola = [];
    var actual = null;
    var temporizador = null;
    var ultimoTexto = '';
    var velocidad = 1;
    var volumen = 1;
    var vocesListenerRegistrado = false;

    function tieneSoporte() {
        return typeof window !== 'undefined' &&
            typeof window.speechSynthesis !== 'undefined' &&
            typeof window.SpeechSynthesisUtterance !== 'undefined';
    }

    function limitar(valor, minimo, maximo, valorActual) {
        var numero = Number(valor);
        if (!Number.isFinite(numero)) return valorActual;
        return Math.min(maximo, Math.max(minimo, numero));
    }

    function leerVoces() {
        if (!tieneSoporte()) return;
        try {
            voces = window.speechSynthesis.getVoices() || [];
        } catch (error) {
            voces = [];
        }
        vozSeleccionada = seleccionarVoz(voces);
    }

    function seleccionarVoz(listaVoces) {
        var vocesEspanolMexicoLocales = [];
        var vocesEspanolMexico = [];
        var vocesEspanolLocales = [];
        var vocesEspanol = [];

        listaVoces.forEach(function (voz) {
            if (!voz || typeof voz.lang !== 'string') return;
            var idioma = voz.lang.toLowerCase();
            var esMexico = idioma === 'es-mx' || idioma.indexOf('es-mx-') === 0;
            var esEspanol = idioma === 'es' || idioma.indexOf('es-') === 0;
            if (!esEspanol) return;

            if (esMexico && voz.localService === true) vocesEspanolMexicoLocales.push(voz);
            else if (esMexico) vocesEspanolMexico.push(voz);
            else if (voz.localService === true) vocesEspanolLocales.push(voz);
            else vocesEspanol.push(voz);
        });

        return vocesEspanolMexicoLocales[0] ||
            vocesEspanolMexico[0] ||
            vocesEspanolLocales[0] ||
            vocesEspanol[0] ||
            null;
    }

    function limpiarTemporizador() {
        if (temporizador !== null) {
            window.clearTimeout(temporizador);
            temporizador = null;
        }
    }

    function cancelarActual() {
        var locucion = actual;
        actual = null;
        limpiarTemporizador();

        if (locucion) {
            locucion.utterance.onend = null;
            locucion.utterance.onerror = null;
        }

        try {
            window.speechSynthesis.cancel();
        } catch (error) {
            // El navegador puede rechazar la cancelacion en estados transitorios.
        }
    }

    function procesarCola() {
        if (!inicializada || !activa || actual || !cola.length) return;
        hablarEntrada(cola.shift());
    }

    function hablarEntrada(texto) {
        var utterance;
        var locucion;

        try {
            utterance = new window.SpeechSynthesisUtterance(texto);
            utterance.lang = 'es-MX';
            utterance.rate = velocidad;
            utterance.volume = volumen;
            if (vozSeleccionada) utterance.voice = vozSeleccionada;

            locucion = { utterance: utterance };
            actual = locucion;
            ultimoTexto = texto;

            utterance.onend = function () {
                if (actual !== locucion) return;
                actual = null;
                limpiarTemporizador();
                procesarCola();
            };

            utterance.onerror = function (evento) {
                if (actual !== locucion) return;
                actual = null;
                limpiarTemporizador();
                if (evento && (evento.error === 'canceled' || evento.error === 'interrupted')) {
                    return;
                }
                procesarCola();
            };

            temporizador = window.setTimeout(function () {
                if (actual !== locucion) return;
                cancelarActual();
                procesarCola();
            }, 12000);

            window.speechSynthesis.speak(utterance);
            return true;
        } catch (error) {
            if (actual === locucion) actual = null;
            limpiarTemporizador();
            return false;
        }
    }

    function inicializar() {
        if (!tieneSoporte()) return false;
        if (inicializada) return true;

        inicializada = true;
        leerVoces();
        if (!vocesListenerRegistrado && typeof window.speechSynthesis.addEventListener === 'function') {
            window.speechSynthesis.addEventListener('voiceschanged', leerVoces);
            vocesListenerRegistrado = true;
        }
        return true;
    }

    function hablar(texto, opciones) {
        if (!inicializada || !activa || !tieneSoporte()) return false;
        if (typeof texto !== 'string' || !texto.trim()) return false;

        var mensaje = texto.trim();
        var prioridad = opciones && opciones.prioridad === 'urgente' ? 'urgente' : 'normal';
        if (prioridad === 'urgente') {
            cola = [];
            cancelarActual();
            return hablarEntrada(mensaje);
        }

        cola.push(mensaje);
        procesarCola();
        return true;
    }

    function repetir() {
        if (!ultimoTexto) return false;
        return hablar(ultimoTexto, { prioridad: 'urgente' });
    }

    function detener() {
        cola = [];
        cancelarActual();
    }

    function activar(valor) {
        activa = Boolean(valor);
        if (!activa) detener();
        return activa;
    }

    function estaActivo() {
        return activa;
    }

    function configurar(opciones) {
        if (!opciones || typeof opciones !== 'object') return;
        if (Object.prototype.hasOwnProperty.call(opciones, 'velocidad')) {
            velocidad = limitar(opciones.velocidad, 0.5, 2, velocidad);
        }
        if (Object.prototype.hasOwnProperty.call(opciones, 'volumen')) {
            volumen = limitar(opciones.volumen, 0, 1, volumen);
        }
    }

    window.UbicatecVoz = {
        inicializar: inicializar,
        hablar: hablar,
        repetir: repetir,
        detener: detener,
        activar: activar,
        estaActivo: estaActivo,
        configurar: configurar
    };
})();
