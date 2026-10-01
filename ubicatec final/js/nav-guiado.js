(function () {
    'use strict';

    // Conserva las utilidades existentes y solo agrega las funciones de guiado.
    var UbicatecNav = window.UbicatecNav || (window.UbicatecNav = {});
    var VENTANA_RUMBO_M = 10;
    var UMBRAL_GIRO = 30;
    var UMBRAL_PREAVISO_M = 35;
    var UMBRAL_GIRO_INMEDIATO_M = 12;

    function haversine(lat1, lon1, lat2, lon2) {
        var radioTierraM = 6371000;
        var radianes = Math.PI / 180;
        var phi1 = lat1 * radianes;
        var phi2 = lat2 * radianes;
        var deltaPhi = (lat2 - lat1) * radianes;
        var deltaLambda = (lon2 - lon1) * radianes;
        var senoPhi = Math.sin(deltaPhi / 2);
        var senoLambda = Math.sin(deltaLambda / 2);
        var a = senoPhi * senoPhi + Math.cos(phi1) * Math.cos(phi2) * senoLambda * senoLambda;
        return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * radioTierraM;
    }

    function rumbo(lat1, lon1, lat2, lon2) {
        var radianes = Math.PI / 180;
        var grados = 180 / Math.PI;
        var deltaLambda = (lon2 - lon1) * radianes;
        var phi1 = lat1 * radianes;
        var phi2 = lat2 * radianes;
        var y = Math.sin(deltaLambda) * Math.cos(phi2);
        var x = Math.cos(phi1) * Math.sin(phi2) -
            Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
        return (Math.atan2(y, x) * grados + 360) % 360;
    }

    function diferenciaRumbos(rumboSalida, rumboEntrada) {
        return ((rumboSalida - rumboEntrada + 540) % 360) - 180;
    }

    function puntoNodo(grafo, indice) {
        return {
            lat: Number(grafo.lat[indice]),
            lon: Number(grafo.lon[indice])
        };
    }

    function interpolar(origen, destino, proporcion) {
        return {
            lat: origen.lat + (destino.lat - origen.lat) * proporcion,
            lon: origen.lon + (destino.lon - origen.lon) * proporcion
        };
    }

    // Obtiene un punto exacto de la ventana de rumbo hacia atras o hacia adelante.
    function puntoVentana(puntos, indice, direccion, distanciaObjetivo) {
        var restante = distanciaObjetivo;
        var indiceActual = indice;
        var puntoActual = puntos[indiceActual];

        while (true) {
            var indiceSiguiente = indiceActual + direccion;
            if (indiceSiguiente < 0 || indiceSiguiente >= puntos.length) return null;

            var puntoSiguiente = puntos[indiceSiguiente];
            var distanciaTramo = haversine(
                puntoActual.lat,
                puntoActual.lon,
                puntoSiguiente.lat,
                puntoSiguiente.lon
            );
            if (!Number.isFinite(distanciaTramo) || distanciaTramo <= 0) {
                indiceActual = indiceSiguiente;
                puntoActual = puntoSiguiente;
                continue;
            }

            if (distanciaTramo >= restante) {
                return interpolar(
                    puntoActual,
                    puntoSiguiente,
                    restante / distanciaTramo
                );
            }

            restante -= distanciaTramo;
            indiceActual = indiceSiguiente;
            puntoActual = puntoSiguiente;
        }
    }

    function textoGiro(deltaRumbo) {
        var lado = deltaRumbo >= 0 ? 'derecha' : 'izquierda';
        var magnitud = Math.abs(deltaRumbo);
        if (magnitud < 60) return 'Gira ligeramente a la ' + lado;
        if (magnitud < 135) return 'Gira a la ' + lado;
        return 'Da un giro cerrado a la ' + lado;
    }

    function construirPasos(grafo, path, opciones) {
        var pasos = [];
        var giros = [];
        var puntos = [];
        var acumuladas = [];
        var acumuladaM = 0;
        var opcionesSeguras = opciones || {};

        if (!grafo || !Array.isArray(path) || path.length < 2) return pasos;
        if (!Array.isArray(grafo.lat) || !Array.isArray(grafo.lon)) return pasos;

        path.forEach(function (indice, posicion) {
            var punto = puntoNodo(grafo, indice);
            if (!Number.isFinite(punto.lat) || !Number.isFinite(punto.lon)) return;
            puntos.push({
                indice: indice,
                posicion: posicion,
                lat: punto.lat,
                lon: punto.lon
            });
            if (puntos.length === 1) {
                acumuladas.push(0);
                return;
            }
            acumuladaM += haversine(
                puntos[puntos.length - 2].lat,
                puntos[puntos.length - 2].lon,
                punto.lat,
                punto.lon
            );
            acumuladas.push(acumuladaM);
        });

        if (puntos.length < 2) return pasos;

        pasos.push({
            tipo: 'inicio',
            texto: 'Comienza a caminar',
            distanciaM: 0,
            nodo: puntos[0].indice,
            lat: puntos[0].lat,
            lon: puntos[0].lon,
            acumM: 0
        });

        for (var indiceInterior = 1; indiceInterior < puntos.length - 1; indiceInterior++) {
            var puntoAnterior = puntoVentana(puntos, indiceInterior, -1, VENTANA_RUMBO_M);
            var puntoPosterior = puntoVentana(puntos, indiceInterior, 1, VENTANA_RUMBO_M);
            if (!puntoAnterior || !puntoPosterior) continue;

            var rumboEntrada = rumbo(
                puntoAnterior.lat,
                puntoAnterior.lon,
                puntos[indiceInterior].lat,
                puntos[indiceInterior].lon
            );
            var rumboSalida = rumbo(
                puntos[indiceInterior].lat,
                puntos[indiceInterior].lon,
                puntoPosterior.lat,
                puntoPosterior.lon
            );
            var deltaRumbo = diferenciaRumbos(rumboSalida, rumboEntrada);
            var magnitudGiro = Math.abs(deltaRumbo);
            if (magnitudGiro < UMBRAL_GIRO) continue;

            var giro = {
                tipo: 'giro',
                texto: textoGiro(deltaRumbo),
                distanciaM: 0,
                nodo: puntos[indiceInterior].indice,
                lat: puntos[indiceInterior].lat,
                lon: puntos[indiceInterior].lon,
                acumM: Math.round(acumuladas[indiceInterior]),
                magnitudGiro: magnitudGiro
            };
            var ultimoGiro = giros[giros.length - 1];
            if (ultimoGiro && giro.acumM - ultimoGiro.acumM < 10) {
                if (giro.magnitudGiro > ultimoGiro.magnitudGiro) {
                    giros[giros.length - 1] = giro;
                }
            } else {
                giros.push(giro);
            }
        }

        giros.forEach(function (giro) {
            delete giro.magnitudGiro;
            pasos.push(giro);
        });

        var ultimoPunto = puntos[puntos.length - 1];
        pasos.push({
            tipo: 'llegada',
            texto: 'Has llegado a tu destino',
            distanciaM: 0,
            nodo: ultimoPunto.indice,
            lat: ultimoPunto.lat,
            lon: ultimoPunto.lon,
            acumM: Math.round(acumuladas[acumuladas.length - 1])
        });

        for (var indicePaso = 1; indicePaso < pasos.length; indicePaso++) {
            pasos[indicePaso].distanciaM = Math.max(
                0,
                pasos[indicePaso].acumM - pasos[indicePaso - 1].acumM
            );
        }

        void opcionesSeguras;
        return pasos;
    }

    function decir(texto, prioridad) {
        if (!texto) return false;
        try {
            if (!window.UbicatecVoz || typeof window.UbicatecVoz.hablar !== 'function') {
                return false;
            }
            return window.UbicatecVoz.hablar(texto, {
                prioridad: prioridad === 'urgente' ? 'urgente' : 'normal'
            }) === true;
        } catch (error) {
            return false;
        }
    }

    function guardarInstruccion(nav, texto) {
        nav.ultimaInstruccion = texto;
        var elemento = document.getElementById('ubNavInstruccion');
        if (elemento) elemento.textContent = texto;
    }

    function estadoPorNodo(nav, nodo) {
        if (!nav._hechos || typeof nav._hechos !== 'object') nav._hechos = {};
        var clave = String(nodo);
        if (!nav._hechos[clave] || typeof nav._hechos[clave] !== 'object') {
            nav._hechos[clave] = {};
        }
        return nav._hechos[clave];
    }

    function redondearA5(metros) {
        return Math.max(5, Math.round(metros / 5) * 5);
    }

    function guiarPaso(nav, lat, lon, precisionM) {
        if (!nav || !Array.isArray(nav.pasos) || !Number.isFinite(lat) || !Number.isFinite(lon)) return false;
        if (!nav._hechos || typeof nav._hechos !== 'object') nav._hechos = {};

        var ahora = Date.now();
        if (Number(precisionM) > 25) {
            if (!nav._ultimaSenalDebil || ahora - nav._ultimaSenalDebil >= 60000) {
                var avisoPrecision = 'Señal de ubicación débil';
                nav._ultimaSenalDebil = ahora;
                guardarInstruccion(nav, avisoPrecision);
                decir(avisoPrecision, 'normal');
            }
            return false;
        }

        var indiceActivo = -1;
        for (var indicePaso = 1; indicePaso < nav.pasos.length; indicePaso++) {
            var pasoCandidate = nav.pasos[indicePaso];
            var estadoCandidate = estadoPorNodo(nav, pasoCandidate.nodo);
            if (!estadoCandidate.hecho) {
                indiceActivo = indicePaso;
                break;
            }
        }
        if (indiceActivo < 0) return false;

        var paso = nav.pasos[indiceActivo];
        var distanciaM = haversine(lat, lon, paso.lat, paso.lon);
        if (!Number.isFinite(distanciaM) || distanciaM > UMBRAL_PREAVISO_M) return false;

        var estado = estadoPorNodo(nav, paso.nodo);
        var distanciaAviso = redondearA5(distanciaM);
        if (paso.tipo === 'llegada') {
            if (!estado.anticipado) {
                var avisoLlegada = 'En ' + distanciaAviso + ' metros llegarás a tu destino';
                estado.anticipado = true;
                guardarInstruccion(nav, avisoLlegada);
                decir(avisoLlegada, 'normal');
            }
            if (distanciaM <= UMBRAL_GIRO_INMEDIATO_M) estado.hecho = true;
            return true;
        }

        if (distanciaM > UMBRAL_GIRO_INMEDIATO_M) {
            if (estado.anticipado) return false;
            var avisoGiro = 'En ' + distanciaAviso + ' metros, ' + paso.texto.toLowerCase();
            estado.anticipado = true;
            guardarInstruccion(nav, avisoGiro);
            decir(avisoGiro, 'normal');
            return true;
        }

        if (estado.hecho) return false;
        var avisoAhora = 'Ahora, ' + paso.texto.toLowerCase();
        estado.hecho = true;
        guardarInstruccion(nav, avisoAhora);
        decir(avisoAhora, 'urgente');
        return true;
    }

    function avisarDesvio(nav) {
        if (!nav) return false;
        var ahora = Date.now();
        if (nav._ultimoDesvio && ahora - nav._ultimoDesvio < 15000) return false;
        var aviso = 'Te has desviado de la ruta. Recalculando.';
        nav._ultimoDesvio = ahora;
        guardarInstruccion(nav, aviso);
        decir(aviso, 'urgente');
        return true;
    }

    function enlazarControles() {
        var repetir = document.getElementById('ubNavRepeat');
        var controlVoz = document.getElementById('ubNavVoz');

        if (repetir) {
            repetir.addEventListener('click', function () {
                var nav = window.ubInMapNav;
                if (nav && nav.ultimaInstruccion) decir(nav.ultimaInstruccion, 'urgente');
            });
        }

        if (controlVoz) {
            var vozActiva = true;
            try {
                if (window.UbicatecVoz && typeof window.UbicatecVoz.estaActivo === 'function') {
                    vozActiva = window.UbicatecVoz.estaActivo();
                }
            } catch (error) {}

            controlVoz.setAttribute('aria-pressed', String(vozActiva));
            controlVoz.textContent = 'Voz: ' + (vozActiva ? 'sí' : 'no');
            controlVoz.addEventListener('click', function () {
                vozActiva = !vozActiva;
                controlVoz.setAttribute('aria-pressed', String(vozActiva));
                controlVoz.textContent = 'Voz: ' + (vozActiva ? 'sí' : 'no');
                try {
                    if (window.UbicatecVoz && typeof window.UbicatecVoz.activar === 'function') {
                        window.UbicatecVoz.activar(vozActiva);
                    }
                } catch (error) {}
            });
        }
    }

    UbicatecNav.construirPasos = construirPasos;
    UbicatecNav.guiarPaso = guiarPaso;
    UbicatecNav.avisarDesvio = avisarDesvio;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enlazarControles);
    } else {
        enlazarControles();
    }
})();
