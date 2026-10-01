/**
 * UBICATEC - Smart Search & Machine Learning Crowdsourcing Engine
 * Módulo de Búsqueda Inteligente, PLN Coloquial, Filtro de Groserías, Easter Eggs y Encuestas de Motivo de Visita.
 */

(function (window) {
    'use strict';

    var ML_WEIGHTS_KEY = 'ub_smart_search_weights';
    var CROWD_REASONS_KEY = 'ub_crowd_reasons';
    var LAST_SURVEY_KEY = 'ub_last_survey_time';

    // 1. Filtro de Groserías y Lenguaje Inapropiado / Sensible
    var PROFANITY_REGEX = /\b(put[oa]s?|pendej[oa]s?|verg[aa]s?|cabron(a)?|chingu?e?|changa|mamad[aa]|mierd[aa]|cagad[aa]|culer[oa]s?|jod[ee]r?|perr[oa]s?|verguiza|putiza|chaparra|marrano|puto|yeye|coger|sexo|viejit[oa]s?|ancian[oa]s?|melchor|cagar|mear|casino)\b/i;

    function isProfane(text) {
        if (!text) return false;
        return PROFANITY_REGEX.test(String(text));
    }

    function sanitizeText(text) {
        if (!text) return '';
        if (isProfane(text)) return '';
        return String(text).trim().replace(/<[^>]*>/g, '');
    }

    // 2. Easter Eggs y Búsquedas Coloquiales de Campus
    var EASTER_EGGS = [
        {
            keywords: ['llorar', 'sufrir', 'reprobar', 'chillar', 'estres', 'estresado', 'ansiedad'],
            message: '¡Ánimo! Si necesitas apoyo académico, orientación o un respiro, aquí te apoyamos 💙',
            suggestedIds: [6, 25],
            badge: 'Apoyo Académico y Médico'
        },
        {
            keywords: ['dormir', 'mimir', 'descansar', 'hacer la mimi', 'sueno', 'sueño'],
            message: 'Para un rato de calma, lectura 😴 (o repasar para el examen).',
            suggestedIds: [50],
            badge: 'Centro de Información / Biblioteca'
        },
        {
            keywords: ['hambre', 'torta', 'tacos', 'comida', 'comer', 'desayunar', 'lonche', 'antojo'],
            message: '¿Buscando recargar energías? 🥪',
            suggestedIds: [25],
            badge: 'Área de Alimentos y Servicios'
        },
        {
            keywords: ['reta', 'echar reta', 'cascarita', 'jugada', 'partido', 'fut', 'futbol', 'basquet', 'duela', 'domo'],
            message: '¡Hora del deporte y la cascarita! 🏀⚽',
            suggestedIds: [100, 107, 104, 98],
            badge: 'Área Deportiva'
        },
        {
            keywords: ['wifi', 'internet', 'red', 'computadora', 'computadoras', 'pc', 'lap', 'laptop'],
            message: 'Espacios equipados con tecnología y conectividad 💻',
            suggestedIds: [36, 3, 50],
            badge: 'Laboratorios de Cómputo'
        }
    ];

    function checkEasterEgg(query) {
        if (!query) return null;
        var q = normalizeText(query);
        for (var i = 0; i < EASTER_EGGS.length; i++) {
            var egg = EASTER_EGGS[i];
            for (var k = 0; k < egg.keywords.length; k++) {
                if (q.indexOf(normalizeText(egg.keywords[k])) !== -1) {
                    return egg;
                }
            }
        }
        return null;
    }

    // 3. Similitud Difusa (Fuzzy Search / Levenshtein Distance)
    function levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        var matrix = [];
        for (var i = 0; i <= b.length; i++) matrix[i] = [i];
        for (var j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (var i = 1; i <= b.length; i++) {
            for (var j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // sustitucion
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insercion/borrado
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    function fuzzyMatchScore(query, target) {
        var q = normalizeText(query);
        var t = normalizeText(target);
        if (!q || !t) return 0;
        if (t.indexOf(q) !== -1) return 1.0;
        var dist = levenshteinDistance(q, t);
        var maxLen = Math.max(q.length, t.length);
        if (maxLen === 0) return 1.0;
        var sim = 1.0 - (dist / maxLen);
        return sim > 0.65 ? sim : 0;
    }

    function normalizeText(str) {
        if (!str) return '';
        return String(str)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    // 4. Registro y Aprendizaje de Clics (Click ML Feedback)
    function loadWeights() {
        try {
            var raw = localStorage.getItem(ML_WEIGHTS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function saveWeights(weights) {
        try {
            localStorage.setItem(ML_WEIGHTS_KEY, JSON.stringify(weights));
        } catch (e) {}
    }

    function recordSelection(query, item) {
        if (!query || !item) return;
        var qNorm = normalizeText(query);
        if (!qNorm || isProfane(qNorm)) return;
        var targetId = item.id || (item.originalData && item.originalData.id);
        if (!targetId) return;

        var weights = loadWeights();
        if (!weights[qNorm]) weights[qNorm] = {};
        weights[qNorm][targetId] = (weights[qNorm][targetId] || 0) + 1;
        saveWeights(weights);

        // Sincronizar en segundo plano con Firebase RTDB si está disponible
        try {
            if (window.firebase && window.firebase.database) {
                var ref = window.firebase.database().ref('ubicatec/ml_search_weights/' + qNorm + '/' + targetId);
                ref.transaction(function (current) {
                    return (current || 0) + 1;
                });
            }
        } catch (e) {}
    }

    function getMLBoostScore(query, item) {
        if (!query || !item) return 0;
        var qNorm = normalizeText(query);
        var targetId = item.id || (item.originalData && item.originalData.id);
        if (!qNorm || !targetId) return 0;
        var weights = loadWeights();
        if (weights[qNorm] && weights[qNorm][targetId]) {
            return Math.min(weights[qNorm][targetId] * 50, 300); // Premio de relevancia
        }
        return 0;
    }

    // 5. Encuestas Aleatorias de Motivo de Visita (Micro-Surveys)
    function loadCrowdReasons() {
        try {
            var raw = localStorage.getItem(CROWD_REASONS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function saveCrowdReasons(data) {
        try {
            localStorage.setItem(CROWD_REASONS_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    function recordCrowdReason(buildingId, reasonText) {
        if (!buildingId || !reasonText) return false;
        var cleanReason = sanitizeText(reasonText);
        if (!cleanReason) return false; // Bloqueado por filtro de groserías

        var data = loadCrowdReasons();
        if (!data[buildingId]) data[buildingId] = [];
        data[buildingId].push({
            reason: cleanReason,
            date: new Date().toISOString()
        });
        saveCrowdReasons(data);

        // Auto-alimentación al motor de pesos ML
        recordSelection(cleanReason, { id: buildingId });

        // Guardar en Firebase RTDB
        try {
            if (window.firebase && window.firebase.database) {
                var ref = window.firebase.database().ref('ubicatec/motivos_edificios/' + buildingId);
                ref.push({
                    motivo: cleanReason,
                    timestamp: window.firebase.database.ServerValue.TIMESTAMP
                });
            }
        } catch (e) {}
        return true;
    }

    function getTopReasons(buildingId) {
        var data = loadCrowdReasons();
        var list = data[buildingId] || [];
        if (!list.length) return [];
        var counts = {};
        list.forEach(function (item) {
            var r = item.reason;
            counts[r] = (counts[r] || 0) + 1;
        });
        var sorted = Object.keys(counts).map(function (key) {
            return { reason: key, count: counts[key] };
        }).sort(function (a, b) { return b.count - a.count; });
        return sorted.slice(0, 4);
    }

    function maybeTriggerMicroSurvey(buildingId, buildingName) {
        if (!buildingId) return;
        // Evitar encuestas muy seguidas (máximo 1 encuesta cada 5 minutos)
        var lastTime = parseInt(localStorage.getItem(LAST_SURVEY_KEY) || '0', 10);
        var now = Date.now();
        if (now - lastTime < 5 * 60 * 1000) return;

        // Probabilidad del 20%
        if (Math.random() > 0.20) return;

        localStorage.setItem(LAST_SURVEY_KEY, now.toString());
        renderSurveyModal(buildingId, buildingName);
    }

    function renderSurveyModal(buildingId, buildingName) {
        var existing = document.getElementById('ubMicroSurveyModal');
        if (existing) existing.remove();

        var bName = buildingName || ('Edificio ' + buildingId);
        var modalHtml = [
            '<div id="ubMicroSurveyModal" class="ub-survey-overlay">',
            '  <div class="ub-survey-card">',
            '    <button type="button" class="ub-survey-close" id="ubSurveyClose">&times;</button>',
            '    <div class="ub-survey-header">',
            '      <span class="ub-survey-icon">💡</span>',
            '      <div>',
            '        <h4 class="ub-survey-title">¿Cuál es el motivo de tu visita hoy?</h4>',
            '        <p class="ub-survey-subtitle">Ayuda a la comunidad compartiendo qué vienes a hacer a <strong>' + sanitizeText(bName) + '</strong></p>',
            '      </div>',
            '    </div>',
            '    <div class="ub-survey-options">',
            '      <button class="ub-survey-chip" data-reason="Tomar Clase">📚 Tomar Clase</button>',
            '      <button class="ub-survey-chip" data-reason="Trámites / Documentos">📑 Trámites</button>',
            '      <button class="ub-survey-chip" data-reason="Asesoría con Docente">👨‍🏫 Asesoría</button>',
            '      <button class="ub-survey-chip" data-reason="Uso de Laboratorio">🔬 Laboratorio</button>',
            '      <button class="ub-survey-chip" data-reason="Servicio Médico">🩺 Servicio Médico</button>',
            '    </div>',
            '    <div class="ub-survey-input-wrap">',
            '      <input type="text" id="ubSurveyCustom" class="ub-survey-input" placeholder="Otro motivo (ej. pedir mi credencial)..." maxlength="60">',
            '      <button type="button" id="ubSurveySubmit" class="ub-survey-submit">Enviar</button>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('');

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        var modal = document.getElementById('ubMicroSurveyModal');
        var closeBtn = document.getElementById('ubSurveyClose');
        var submitBtn = document.getElementById('ubSurveySubmit');
        var customInput = document.getElementById('ubSurveyCustom');

        function dismiss() {
            if (modal) {
                modal.classList.add('ub-survey-fade-out');
                setTimeout(function () { modal.remove(); }, 300);
            }
        }

        if (closeBtn) closeBtn.addEventListener('click', dismiss);

        function handleSend(reason) {
            if (!reason) return;
            var ok = recordCrowdReason(buildingId, reason);
            if (ok) {
                showToast('¡Gracias por tu aporte a Ubicatec! 💙');
            } else {
                showToast('Por favor escribe un motivo respetuoso.');
            }
            dismiss();
        }

        var chips = modal.querySelectorAll('.ub-survey-chip');
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                handleSend(this.getAttribute('data-reason'));
            });
        });

        if (submitBtn) {
            submitBtn.addEventListener('click', function () {
                handleSend(customInput.value);
            });
        }
    }

    function showToast(msg) {
        var toast = document.createElement('div');
        toast.className = 'ub-smart-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function () { toast.classList.add('is-visible'); }, 10);
        setTimeout(function () {
            toast.classList.remove('is-visible');
            setTimeout(function () { toast.remove(); }, 300);
        }, 3000);
    }

    // Exportar API Pública del Módulo
    window.UbicatecSmartSearch = {
        isProfane: isProfane,
        sanitizeText: sanitizeText,
        checkEasterEgg: checkEasterEgg,
        fuzzyMatchScore: fuzzyMatchScore,
        recordSelection: recordSelection,
        getMLBoostScore: getMLBoostScore,
        recordCrowdReason: recordCrowdReason,
        getTopReasons: getTopReasons,
        maybeTriggerMicroSurvey: maybeTriggerMicroSurvey
    };

})(window);
