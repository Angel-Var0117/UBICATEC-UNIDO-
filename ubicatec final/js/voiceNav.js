/**
 * Ubicatec Voice Navigation Helper (voiceNav.js)
 * Sistema de guía por voz en tiempo real estilo Uber/DiDi para navegación peatonal en campus.
 * Integrado con SpeechSynthesis API y Web Audio API.
 */
(function (root) {
    'use strict';

    var STORAGE_KEY = 'ub_voice_nav_enabled';
    var isSupported = ('speechSynthesis' in root && 'SpeechSynthesisUtterance' in root);

    // Estado de activación (persistencia durante la sesión)
    var isEnabled = true;
    try {
        var saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
            isEnabled = (saved === 'true');
        }
    } catch (e) {}

    // Selector de voz femenina en español
    var selectedVoice = null;
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
        // "Google español" suele ser la voz femenina predeterminada de Google en navegadores
        if (name.indexOf('google') !== -1 && (name.indexOf('español') !== -1 || name.indexOf('spanish') !== -1)) {
            return true;
        }
        return false;
    }

    function loadVoices() {
        if (!isSupported) return null;
        try {
            var voices = root.speechSynthesis.getVoices() || [];
            if (!voices || !voices.length) return selectedVoice;

            var spanishVoices = voices.filter(function (v) {
                var l = (v.lang || '').replace('_', '-').toLowerCase();
                return l.indexOf('es') === 0;
            });

            if (!spanishVoices.length) {
                return selectedVoice;
            }

            // 1. Prioridad: Voces femeninas identificadas en español
            var femaleMx = null;
            var femaleLatam = null;
            var femaleEs = null;
            var femaleAny = null;

            for (var i = 0; i < spanishVoices.length; i++) {
                var v = spanishVoices[i];
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
                selectedVoice = chosenFemale;
                return selectedVoice;
            }

            // 2. Respaldo (Fallback): Si no hay etiqueta explícita de género femenino,
            // tomar la mejor opción en español (es-MX > es-US/419 > es-ES > cualquier es-*)
            var fallbackMx = spanishVoices.find(function (v) { return (v.lang || '').replace('_', '-').toLowerCase() === 'es-mx'; });
            var fallbackLatam = spanishVoices.find(function (v) {
                var l = (v.lang || '').replace('_', '-').toLowerCase();
                return l === 'es-us' || l === 'es-419';
            });
            var fallbackEs = spanishVoices.find(function (v) {
                var l = (v.lang || '').replace('_', '-').toLowerCase();
                return l === 'es-es' || l === 'es';
            });

            selectedVoice = fallbackMx || fallbackLatam || fallbackEs || spanishVoices[0] || null;
            return selectedVoice;
        } catch (e) {
            return selectedVoice;
        }
    }

    // 2. Manejo Asíncrono de Voces (onvoiceschanged):
    // Safari / WebKit carga voces de forma asíncrona y a menudo getVoices() retorna vacío inicialmente
    if (isSupported) {
        loadVoices();

        var onVoicesReady = function () {
            loadVoices();
        };

        if ('onvoiceschanged' in root.speechSynthesis) {
            root.speechSynthesis.onvoiceschanged = onVoicesReady;
        }
        if (typeof root.speechSynthesis.addEventListener === 'function') {
            root.speechSynthesis.addEventListener('voiceschanged', onVoicesReady);
        }

        // Reintentos escalonados en Safari iOS por si onvoiceschanged no dispara automáticamente al inicio
        var voiceRetryDelays = [100, 300, 700, 1500, 3000];
        voiceRetryDelays.forEach(function (delay) {
            setTimeout(function () {
                if (!selectedVoice) {
                    loadVoices();
                }
            }, delay);
        });
    }

    // AudioContext para chime de recálculo / notificaciones
    var audioCtx = null;
    function playChime() {
        try {
            var AudioContextClass = root.AudioContext || root.webkitAudioContext;
            if (!AudioContextClass) return;
            if (!audioCtx) audioCtx = new AudioContextClass();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            var now = audioCtx.currentTime;
            var osc1 = audioCtx.createOscillator();
            var osc2 = audioCtx.createOscillator();
            var gain = audioCtx.createGain();

            // Tono suave dual ascendente (D5 587Hz -> A5 880Hz)
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, now);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880.00, now + 0.08);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);

            osc1.start(now);
            osc1.stop(now + 0.12);
            osc2.start(now + 0.08);
            osc2.stop(now + 0.35);
        } catch (e) {}
    }

    // Cola de mensajes, debounce y deduplicación
    var queue = [];
    var isSpeaking = false;
    var currentUtterance = null;
    var lastSpokenText = '';
    var lastSpokenTs = 0;

    // Estado del trayecto activo
    var activeRoute = {
        destTitle: '',
        started: false,
        nearAnnounced: false,
        arrivalAnnounced: false,
        lastRerouteTs: 0,
        lastTurnTs: 0,
        lastStraightTs: 0,
        announcedVertices: new Set()
    };

    function processQueue() {
        if (isSpeaking || !queue.length) return;
        if (!isSupported || !isEnabled) {
            queue = [];
            return;
        }

        var item = queue.shift();
        if (!item) return;

        // Descartar mensajes normales viejos (>15s) causados por demoras
        if (Date.now() - item.ts > 15000 && item.priority !== 'urgent') {
            processQueue();
            return;
        }

        try {
            if (!selectedVoice) {
                loadVoices();
            }

            var utt = new SpeechSynthesisUtterance(item.text);
            currentUtterance = utt;

            // 1. Persistencia de la Utterance (Evitar Garbage Collection):
            // Guardamos la instancia activa en una variable global explícita window._lastUtterance
            // para evitar que Safari la elimine de memoria antes de que termine de hablar.
            root._lastUtterance = utt;
            if (typeof window !== 'undefined') {
                window._lastUtterance = utt;
            }
            root.__ubCurrentVoiceUtterance = utt;

            if (selectedVoice) {
                utt.voice = selectedVoice;
                utt.lang = selectedVoice.lang || 'es-MX';
            } else {
                utt.lang = 'es-MX';
            }

            utt.rate = 1.0; // Locución femenina clara y profesional
            utt.pitch = 1.08; // Entonación femenina natural
            utt.volume = 1.0;

            isSpeaking = true;
            lastSpokenText = item.text;
            lastSpokenTs = Date.now();

            var finished = false;
            var onDone = function () {
                if (finished) return;
                finished = true;
                isSpeaking = false;
                currentUtterance = null;
                // En Safari mantenemos window._lastUtterance referenciando la última utterance
                // para que no sea recolectada prematuramente durante callbacks tardíos
                setTimeout(processQueue, 350); // Pausa natural entre oraciones
            };

            utt.onstart = function () {
                isSpeaking = true;
            };
            utt.onend = onDone;
            utt.onerror = onDone;
            utt.onpause = function () {
                // Si Safari pausa la síntesis inesperadamente, intentar reanudar
                if (isSpeaking && root.speechSynthesis.paused) {
                    try { root.speechSynthesis.resume(); } catch (e) {}
                }
            };

            // Timer de seguridad por si Safari u otro navegador omite el evento onend
            var maxDuration = Math.max(3000, item.text.length * 110);
            setTimeout(function () {
                if (isSpeaking && currentUtterance === utt) {
                    onDone();
                }
            }, maxDuration);

            if (root.speechSynthesis.paused) {
                try { root.speechSynthesis.resume(); } catch (e) {}
            }
            root.speechSynthesis.speak(utt);
        } catch (err) {
            isSpeaking = false;
            processQueue();
        }
    }

    function speak(text, options) {
        if (!isSupported || !isEnabled) return;
        if (!text || typeof text !== 'string') return;
        text = text.trim();
        if (!text) return;

        options = options || {};
        var priority = options.priority || 'normal'; // 'normal', 'high', 'urgent'
        var now = Date.now();

        // Evitar repetir la misma instrucción en menos de 8 segundos si no es urgente
        if (text === lastSpokenText && (now - lastSpokenTs < 8000) && priority !== 'urgent') {
            return;
        }

        if (priority === 'urgent') {
            try {
                root.speechSynthesis.cancel();
            } catch (e) {}
            queue = [];
            isSpeaking = false;
        } else if (priority === 'high') {
            // Filtrar mensajes pendientes de baja prioridad
            queue = queue.filter(function (q) { return q.priority === 'high' || q.priority === 'urgent'; });
        }

        queue.push({
            text: text,
            priority: priority,
            ts: now
        });

        processQueue();
    }

    // Funciones trigonométricas para cálculos de navegación
    var R = 6371000;
    function haversineMeters(lat1, lon1, lat2, lon2) {
        var rad = Math.PI / 180;
        var phi1 = lat1 * rad;
        var phi2 = lat2 * rad;
        var dphi = (lat2 - lat1) * rad;
        var dlambda = (lon2 - lon1) * rad;
        var s1 = Math.sin(dphi / 2);
        var s2 = Math.sin(dlambda / 2);
        var a = (s1 * s1) + Math.cos(phi1) * Math.cos(phi2) * (s2 * s2);
        return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
    }

    function calculateBearing(p1, p2) {
        var rad = Math.PI / 180;
        var lat1 = p1.lat * rad;
        var lat2 = p2.lat * rad;
        var dLon = (p2.lng - p1.lng) * rad;
        var y = Math.sin(dLon) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
    }

    function angleDeltaDeg(fromDeg, toDeg) {
        var d = (toDeg - fromDeg) % 360;
        if (d > 180) d -= 360;
        else if (d < -180) d += 360;
        return d;
    }

    // Actualización de botones en la interfaz de usuario
    function syncButtons() {
        var btns = document.querySelectorAll('.ub-voice-toggle-btn, #ubNavVoiceToggle, #edificioVoiceToggle');
        btns.forEach(function (btn) {
            if (!btn) return;
            if (isEnabled) {
                btn.classList.remove('is-muted');
                btn.innerHTML = '🔊';
                btn.title = 'Guía por voz: Activada (clic para silenciar)';
                btn.setAttribute('aria-label', 'Silenciar guía por voz');
            } else {
                btn.classList.add('is-muted');
                btn.innerHTML = '🔇';
                btn.title = 'Guía por voz: Silenciada (clic para activar)';
                btn.setAttribute('aria-label', 'Activar guía por voz');
            }
        });
    }

    // Inyección de estilos para el botón de voz si no existen
    (function injectStyles() {
        if (document.getElementById('ub-voice-nav-styles')) return;
        var style = document.createElement('style');
        style.id = 'ub-voice-nav-styles';
        style.textContent = [
            '.ub-voice-toggle-btn {',
            '    color: #0c3872;',
            '    cursor: pointer;',
            '    appearance: none;',
            '    background: #fffffff2;',
            '    border: 1px solid rgba(0, 0, 0, 0.15);',
            '    border-radius: 10px;',
            '    width: 36px;',
            '    height: 36px;',
            '    padding: 0;',
            '    font-size: 16px;',
            '    line-height: 1;',
            '    display: inline-flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    transition: all 0.2s ease;',
            '    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);',
            '    flex-shrink: 0;',
            '}',
            '.ub-voice-toggle-btn:hover {',
            '    background: #eaf4ff;',
            '    transform: scale(1.06);',
            '}',
            '.ub-voice-toggle-btn:active {',
            '    transform: scale(0.95);',
            '}',
            '.ub-voice-toggle-btn.is-muted {',
            '    color: #777;',
            '    background: #efeff0;',
            '    opacity: 0.85;',
            '    border-color: rgba(0, 0, 0, 0.1);',
            '}',
            '.ub-edificio-nav-header {',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: space-between;',
            '    gap: 8px;',
            '    width: 100%;',
            '    padding: 2px 4px;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    })();

    // 3. Desbloqueo de Audio en iOS (User Gesture):
    // La primera vez que el usuario presione el botón de "Ir ahí" o active la navegación,
    // se ejecuta window.speechSynthesis.speak(new SpeechSynthesisUtterance('')) para desbloquear Safari.
    var isUnlocked = false;
    function unlock(force) {
        if (!isSupported) return;
        if (isUnlocked && !force) return;
        try {
            if (root.speechSynthesis.paused) {
                try { root.speechSynthesis.resume(); } catch (e) {}
            }

            // Utterance silencioso de inicialización requerido para Safari en iOS
            var silentUtt = new SpeechSynthesisUtterance('');
            silentUtt.volume = 0;
            silentUtt.rate = 1.0;
            silentUtt.lang = (selectedVoice && selectedVoice.lang) ? selectedVoice.lang : 'es-MX';

            // 1. Persistencia de la Utterance en variable global para evitar Garbage Collection en Safari
            root._lastUtterance = silentUtt;
            if (typeof window !== 'undefined') {
                window._lastUtterance = silentUtt;
            }
            root.__ubCurrentVoiceUtterance = silentUtt;

            root.speechSynthesis.speak(silentUtt);
            isUnlocked = true;

            // En Safari móvil getVoices() a menudo se puebla tras el primer gesto de usuario
            loadVoices();

            var AudioContextClass = root.AudioContext || root.webkitAudioContext;
            if (AudioContextClass && !audioCtx) {
                audioCtx = new AudioContextClass();
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        } catch (e) {}
    }

    // Toggle de activación
    function toggleVoice() {
        unlock(true);
        isEnabled = !isEnabled;
        try {
            sessionStorage.setItem(STORAGE_KEY, String(isEnabled));
        } catch (e) {}

        syncButtons();

        if (isEnabled) {
            speak('Guía por voz activada.', { priority: 'high' });
        } else {
            try {
                root.speechSynthesis.cancel();
            } catch (e) {}
            queue = [];
            isSpeaking = false;
        }
    }

    function setVoiceEnabled(enabled) {
        if (isEnabled === enabled) return;
        isEnabled = !!enabled;
        try {
            sessionStorage.setItem(STORAGE_KEY, String(isEnabled));
        } catch (e) {}
        syncButtons();
        if (!isEnabled) {
            try { root.speechSynthesis.cancel(); } catch (e) {}
            queue = [];
            isSpeaking = false;
        }
    }

    // Delegación de clics en botones de voz
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.ub-voice-toggle-btn, #ubNavVoiceToggle, #edificioVoiceToggle');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            toggleVoice();
        }
    });

    // Función auxiliar para detectar si un elemento acciona navegación o botón "Ir ahí"
    function isNavTriggerElement(el) {
        if (!el) return false;
        try {
            var id = el.id || '';
            if (id === 'ubPRGo' || id === 'ubGeoAllow' || id === 'bldgGo' || id === 'continuarBtn' || id === 'verUbicacionBtn') {
                return true;
            }
            if (el.closest) {
                var found = el.closest('#ubPRGo, #ubGeoAllow, #bldgGo, #continuarBtn, #verUbicacionBtn, .ub-voice-toggle-btn, #ubNavVoiceToggle, #edificioVoiceToggle');
                if (found) return true;
            }
            var txt = (el.textContent || '').trim().toLowerCase();
            if (txt === 'ir ahí' || txt === 'ir ahi' || txt === 'ir' || txt.indexOf('ir ahí') !== -1 || txt.indexOf('ir ahi') !== -1) {
                return true;
            }
        } catch (e) {}
        return false;
    }

    // Escuchadores en fase de captura (capture: true) para asegurar desbloqueo síncrono en Safari iOS
    ['click', 'touchend', 'touchstart'].forEach(function (evtName) {
        document.addEventListener(evtName, function (e) {
            if (isNavTriggerElement(e.target)) {
                unlock(true);
            } else if (!isUnlocked) {
                unlock(false);
            }
        }, { capture: true, passive: true });
    });

    // API Pública
    var VoiceNav = {
        isSupported: isSupported,
        isVoiceEnabled: function () { return isEnabled; },
        setVoiceEnabled: setVoiceEnabled,
        toggleVoice: toggleVoice,
        unlock: unlock,
        syncButtons: syncButtons,
        speak: speak,
        getSelectedVoice: function () { return selectedVoice; },
        isFemaleVoice: isFemaleVoice,

        /**
         * Inicia una nueva sesión de ruta con anuncio inicial.
         * @param {string} destTitle - Nombre del destino (ej. "Edificio 1")
         */
        startRoute: function (destTitle) {
            unlock(true);
            activeRoute.destTitle = destTitle || 'tu destino';
            activeRoute.started = true;
            activeRoute.nearAnnounced = false;
            activeRoute.arrivalAnnounced = false;
            activeRoute.lastRerouteTs = 0;
            activeRoute.lastTurnTs = Date.now();
            activeRoute.lastStraightTs = Date.now();
            activeRoute.announcedVertices = new Set();

            syncButtons();

            // Anuncio clave: Inicio de ruta
            var inicioMsg = 'Ruta iniciada hacia ' + activeRoute.destTitle + '. Dirígete al andador principal.';
            speak(inicioMsg, { priority: 'high' });
        },

        /**
         * Detiene y resetea la sesión de ruta actual.
         */
        stopRoute: function () {
            activeRoute.started = false;
            activeRoute.nearAnnounced = false;
            activeRoute.arrivalAnnounced = false;
            try {
                if (isSupported) root.speechSynthesis.cancel();
            } catch (e) {}
            queue = [];
            isSpeaking = false;
        },

        /**
         * Notifica desviación y recálculo de ruta (cooldown de 12s para no saturar).
         */
        notifyRerouting: function () {
            if (!activeRoute.started) return;
            var now = Date.now();
            if (now - activeRoute.lastRerouteTs < 12000) return;
            activeRoute.lastRerouteTs = now;

            playChime();
            speak('Recalculando ruta...', { priority: 'high' });
        },

        announceNearDestination: function () {
            if (!activeRoute.started || activeRoute.nearAnnounced || activeRoute.arrivalAnnounced) return;
            activeRoute.nearAnnounced = true;
            speak('Tu destino está cerca, a pocos metros.', { priority: 'high' });
        },

        announceArrival: function () {
            if (activeRoute.arrivalAnnounced) return;
            activeRoute.arrivalAnnounced = true;
            speak('Has llegado a tu destino.', { priority: 'urgent' });
        },

        updateUserLocation: function (userLL, routeLatLngs, remainingDistMeters) {
            if (!window.UbicatecVoiceNav) return; // Comprobación segura
            if (!activeRoute.started || !userLL) return;

            var dist = Number.isFinite(remainingDistMeters) ? remainingDistMeters : null;

            // Gatillo: Llegada al destino (<= 10m)
            if (dist !== null && dist <= 10 && !activeRoute.arrivalAnnounced) {
                this.announceArrival();
                return;
            }

            // Gatillo: Proximidad al destino (20 a 30m)
            if (dist !== null && dist <= 30 && dist > 10 && !activeRoute.nearAnnounced) {
                this.announceNearDestination();
            }

            if (!Array.isArray(routeLatLngs) || routeLatLngs.length < 3) return;

            var now = Date.now();
            var n = routeLatLngs.length;

            // Oyente pasivo: Buscar el próximo vértice de giro relevante a menos de 15m
            for (var i = 1; i < n - 1; i++) {
                var prevPt = routeLatLngs[i - 1];
                var curPt = routeLatLngs[i];
                var nextPt = routeLatLngs[i + 1];

                var dToVertex = haversineMeters(userLL.lat, userLL.lng, curPt.lat, curPt.lng);

                if (dToVertex <= 12 && dToVertex >= 8) {
                    var vKey = curPt.lat.toFixed(5) + '_' + curPt.lng.toFixed(5);
                    if (activeRoute.announcedVertices.has(vKey)) continue;

                    var bIn = calculateBearing(prevPt, curPt);
                    var bOut = calculateBearing(curPt, nextPt);
                    var delta = angleDeltaDeg(bIn, bOut);

                    if (Math.abs(delta) >= 25) {
                        var turnMsg = '';
                        // Si el cambio es mayor a 25 grados, se pronuncia, si es leve (<25) se ignora.
                        if (delta <= -135) {
                            turnMsg = 'Da vuelta en U a la izquierda.';
                        } else if (delta < -25) {
                            turnMsg = 'Gira a la izquierda.';
                        } else if (delta >= 135) {
                            turnMsg = 'Da vuelta en U a la derecha.';
                        } else if (delta > 25) {
                            turnMsg = 'Gira a la derecha.';
                        }

                        if (turnMsg && (now - activeRoute.lastTurnTs > 4000)) {
                            // Limpiar cola para evitar acumulación de audios (punto 4)
                            try { root.speechSynthesis.cancel(); } catch(e) {}
                            queue = [];
                            isSpeaking = false;

                            activeRoute.announcedVertices.add(vKey);
                            activeRoute.lastTurnTs = now;
                            activeRoute.lastStraightTs = now;
                            speak(turnMsg, { priority: 'high' });
                            return;
                        }
                    }
                }
            }

            if (now - activeRoute.lastStraightTs > 45000 && now - activeRoute.lastTurnTs > 15000) {
                if (dist !== null && dist > 35) {
                    activeRoute.lastStraightTs = now;
                    speak('Continúa por el andador.', { priority: 'normal' });
                }
            }
        }
    };

    // Sincronizar botones cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncButtons);
    } else {
        setTimeout(syncButtons, 100);
    }

    root.UbicatecVoiceNav = VoiceNav;

})(typeof window !== 'undefined' ? window : this);
