// UBICATEC · metrics.js
// Fase 1.2 — Ingesta de métricas vía Cloud Function `ingestMetricV1` con App Check.
// Reemplaza las escrituras REST directas a la Realtime Database (que permitían
// que cualquiera inflara/borrara métricas). Las escrituras ahora son atómicas
// y del lado servidor. Todo va envuelto en try/catch para no afectar la página.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

// TODO: reemplazar por la clave de sitio reCAPTCHA v3 registrada en App Check.
// Mientras sea el placeholder, App Check no se inicializa y las llamadas a la
// función fallarán la verificación (las métricas simplemente no se registran,
// sin romper el sitio). Ver runbook Fase 1.
const APP_CHECK_SITE_KEY = "REEMPLAZAR_CON_RECAPTCHA_V3_SITE_KEY";

const firebaseConfig = {
    apiKey: "AIzaSyCECYhDqVY3vE5j6_U3N9GNQuX_l54TuDI",
    authDomain: "ubicatec-admin.firebaseapp.com",
    databaseURL: "https://ubicatec-admin-default-rtdb.firebaseio.com",
    projectId: "ubicatec-admin",
    storageBucket: "ubicatec-admin.firebasestorage.app",
    messagingSenderId: "860643879745",
    appId: "1:860643879745:android:ba43fb22857c31c2070fc0"
};

let ingestCallable = null;
// Cloud Functions no están desplegadas (se requiere plan Blaze).
// Las métricas se registran vía Realtime Database directa mediante metrics-legacy.js.
/*
try {
    const app = initializeApp(firebaseConfig, "ubicatec-metrics-v6");
    try {
        if (APP_CHECK_SITE_KEY && APP_CHECK_SITE_KEY.indexOf("REEMPLAZAR") === -1) {
            initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(APP_CHECK_SITE_KEY),
                isTokenAutoRefreshEnabled: true
            });
        }
    } catch (e) {}
    const functions = getFunctions(app);
    ingestCallable = httpsCallable(functions, "ingestMetricV1");
} catch (e) {
    ingestCallable = null;
}
*/

function ingest(payload) {
    try {
        if (!ingestCallable) return;
        ingestCallable(payload).catch(function () {});
    } catch (e) {}
}

function getMetricsMode() {
    try {
        const v = (window && window.__UBICATEC_METRICS_MODE) ? String(window.__UBICATEC_METRICS_MODE) : "";
        if (v) return v;
    } catch {}
    try {
        const v = localStorage.getItem("ubicatec_metrics_mode");
        if (v) return String(v);
    } catch {}
    return "minimal";
}

function getBooleanFlag(windowKey, storageKey, fallbackValue) {
    try {
        if (window && window[windowKey] !== undefined) return Boolean(window[windowKey]);
    } catch {}
    try {
        const v = localStorage.getItem(storageKey);
        if (v === null) return fallbackValue;
        if (v === "1") return true;
        if (v === "0") return false;
        return Boolean(v);
    } catch {}
    return fallbackValue;
}

function makeEventAllowlist(mode) {
    if (String(mode || "").toLowerCase() === "full") return null;
    return new Set([
        "page_view", "announcement_open", "announcement_close", "announcement_more_info",
        "announcement_flyer_open", "map_open", "map_marker_click", "map_search", "map_filter",
        "geo_request", "geo_success", "geo_error", "event_detail_open", "event_location_click",
        "event_location_prompt", "event_location_start", "event_map_init", "event_map_open",
        "event_map_close", "event_geo_success", "event_geo_error", "event_arrival",
        "news_page_open", "rs_page_open", "news_external_open", "rs_social_click",
        "news_live_update", "news_live_error", "news_fallback_used", "jornadas_page_open",
        "jornadas_nav_click", "jornadas_link_click", "events_page_open", "events_social_click",
        "events_nav_click", "event_card_open", "event_card_close", "event_card_swipe"
    ]);
}

function getMinIntervalMsForEvent(eventKey) {
    const k = String(eventKey || "");
    if (k === "map_search") return 8000;
    if (k === "map_filter") return 1500;
    if (k === "map_marker_click") return 400;
    if (k === "announcement_more_info") return 800;
    if (k === "announcement_open") return 800;
    if (k === "announcement_close") return 800;
    if (k === "event_location_click") return 600;
    if (k === "event_location_start") return 1200;
    if (k === "event_card_swipe") return 900;
    return 250;
}

function getPlatform() {
    try {
        if (window.Capacitor && typeof window.Capacitor.getPlatform === "function") {
            const p = window.Capacitor.getPlatform();
            if (p && p !== "web") return "app";
        }
    } catch {}
    return "web";
}

function pad2(n) { return String(n).padStart(2, "0"); }
function getDateKey(now = new Date()) {
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function sanitizeKey(value) {
    const s = String(value || "")
        .trim().toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "");
    return s.slice(0, 32);
}

function getPageKey() {
    const path = (location && location.pathname) ? location.pathname : "/";
    const base = path.split("/").pop() || "index.html";
    return sanitizeKey(base.replace(/\.html$/i, "")) || "index";
}

function randomId() {
    return `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`.slice(0, 24);
}

try {
    const mode = getMetricsMode();
    const allowlist = makeEventAllowlist(mode);
    const trackPageViewEvent = getBooleanFlag("__UBICATEC_METRICS_TRACK_PAGE_VIEW_EVENT", "ubicatec_metrics_track_page_view_event", true);
    const trackSessions = getBooleanFlag("__UBICATEC_METRICS_TRACK_SESSIONS", "ubicatec_metrics_track_sessions", true);
    const trackUniques = getBooleanFlag("__UBICATEC_METRICS_TRACK_UNIQUES", "ubicatec_metrics_track_uniques", true);
    const trackFirstOpen = getBooleanFlag("__UBICATEC_METRICS_TRACK_FIRST_OPEN", "ubicatec_metrics_track_first_open", true);
    const trackPageviews = getBooleanFlag("__UBICATEC_METRICS_TRACK_PAGEVIEWS", "ubicatec_metrics_track_pageviews", true);

    const minIntervalMsByEventKey = {};
    const baseEventKeys = allowlist ? Array.from(allowlist) : ["page_view"];
    for (const k of baseEventKeys) minIntervalMsByEventKey[k] = getMinIntervalMsForEvent(k);
    const lastSentMsByKey = Object.create(null);

    const platform = getPlatform();
    const dateKey = getDateKey();

    if (trackSessions) {
        try {
            const sk = `ubicatec_metrics_session_${platform}_${dateKey}`;
            if (!localStorage.getItem(sk)) {
                ingest({ kind: "session", platform });
                localStorage.setItem(sk, "1");
            }
        } catch {
            ingest({ kind: "session", platform });
        }
    }



    try {
        if (trackFirstOpen && !localStorage.getItem("ubicatec_metrics_first_open")) {
            localStorage.setItem("ubicatec_metrics_first_open", dateKey);
            ingest({ kind: "first_open", platform });
        }
        if (!localStorage.getItem("ubicatec_metrics_install_id")) {
            localStorage.setItem("ubicatec_metrics_install_id", randomId());
        }
    } catch {}

    const pageKey = getPageKey();
    if (trackPageviews) {
        ingest({ kind: "pageview", platform, page: pageKey });
    }

    function safeTrack(name, options) {
        const eventKey = sanitizeKey(name);
        if (!eventKey) return;
        if (allowlist && !allowlist.has(eventKey)) return;
        const labelKey = (options && options.label) ? sanitizeKey(options.label) : "";
        const dedupeKey = `${eventKey}|${labelKey}`;
        const nowMs = Date.now();
        const minIntervalMs = minIntervalMsByEventKey[eventKey] || 0;
        const lastMs = lastSentMsByKey[dedupeKey] || 0;
        if (minIntervalMs > 0 && lastMs > 0 && (nowMs - lastMs) < minIntervalMs) return;
        lastSentMsByKey[dedupeKey] = nowMs;
        ingest({ kind: "event", platform, event: eventKey, label: labelKey || undefined });
    }

    window.ubicatecTrack = function (name, options) {
        try { safeTrack(name, options); } catch {}
    };

    // Contador de vistas por edificio/lugar (reemplaza los fetch REST embebidos
    // en mapa.js / edificio.js). page ya viene saneado a <=32 chars.
    window.ubicatecTrackPage = function (page) {
        try {
            const p = sanitizeKey(page);
            if (p) ingest({ kind: "pageview", platform, page: p });
        } catch {}
    };

    if (trackPageViewEvent) {
        if (pageKey === "mapa") window.ubicatecTrack("map_open");
        else if (pageKey === "detalle-evento") window.ubicatecTrack("event_detail_open");
        else if (pageKey === "eventos") window.ubicatecTrack("events_page_open");
        else if (pageKey === "noticias") window.ubicatecTrack("news_page_open");
        else if (pageKey === "rs") window.ubicatecTrack("rs_page_open");
        else if (pageKey === "jornadas") window.ubicatecTrack("jornadas_page_open");
        window.ubicatecTrack("page_view", { label: pageKey });
    }

    try {
        const did = `${getDateKey()}|${getPlatform()}`;
        const key = `ubicatec_metrics_auto_funnel_${did}`;
        if (!sessionStorage.getItem(key)) {
            if (document.getElementById("map")) window.ubicatecTrack("map_open");
            sessionStorage.setItem(key, "1");
        }
    } catch {}

    try {
        if (navigator && navigator.geolocation && !navigator.geolocation.__ubPatched) {
            const geo = navigator.geolocation;
            const origGet = geo.getCurrentPosition.bind(geo);
            const origWatch = geo.watchPosition.bind(geo);
            geo.getCurrentPosition = function (success, error, options) {
                const glabel = (window && window.__UB_LAST_GEO_LABEL) ? String(window.__UB_LAST_GEO_LABEL) : 'auto';
                try { window.ubicatecTrack && window.ubicatecTrack('geo_request', { label: glabel }); } catch {}
                return origGet(function (pos) {
                    try { window.ubicatecTrack && window.ubicatecTrack('geo_success', { label: glabel }); } catch {}
                    success && success(pos);
                }, function (err) {
                    try { window.ubicatecTrack && window.ubicatecTrack('geo_error', { label: glabel }); } catch {}
                    error && error(err);
                }, options);
            };
            geo.watchPosition = function (success, error, options) {
                const glabel = (window && window.__UB_LAST_GEO_LABEL) ? String(window.__UB_LAST_GEO_LABEL) : 'auto';
                try { window.ubicatecTrack && window.ubicatecTrack('geo_request', { label: glabel }); } catch {}
                let sent = false;
                return origWatch(function (pos) {
                    if (!sent) {
                        sent = true;
                        try { window.ubicatecTrack && window.ubicatecTrack('geo_success', { label: glabel }); } catch {}
                    }
                    success && success(pos);
                }, function (err) {
                    try { window.ubicatecTrack && window.ubicatecTrack('geo_error', { label: glabel }); } catch {}
                    error && error(err);
                }, options);
            };
            geo.__ubPatched = true;
        }
    } catch {}
} catch {
    window.ubicatecTrack = function () {};
    window.ubicatecTrackPage = function () {};
}
