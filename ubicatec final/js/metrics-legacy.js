(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      try {
        var s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = function () { resolve(); };
        s.onerror = function () { reject(new Error("Failed to load " + src)); };
        document.head.appendChild(s);
      } catch (e) {
        reject(e);
      }
    });
  }

  function getMetricsMode() {
    try {
      var v = window && window.__UBICATEC_METRICS_MODE ? String(window.__UBICATEC_METRICS_MODE) : "";
      if (v) return v;
    } catch (e) {}
    try {
      var s = localStorage.getItem("ubicatec_metrics_mode");
      if (s) return String(s);
    } catch (e2) {}
    return "minimal";
  }

  function getBooleanFlag(windowKey, storageKey, fallbackValue) {
    try {
      if (window && window[windowKey] !== undefined) return !!window[windowKey];
    } catch (e) {}
    try {
      var v = localStorage.getItem(storageKey);
      if (v === null) return fallbackValue;
      if (v === "1") return true;
      if (v === "0") return false;
      return !!v;
    } catch (e2) {}
    return fallbackValue;
  }

  function makeEventAllowlist(mode) {
    if (String(mode || "").toLowerCase() === "full") return null;
    return {
      page_view: 1,
      announcement_open: 1,
      announcement_close: 1,
      announcement_more_info: 1,
      announcement_flyer_open: 1,
      map_open: 1,
      map_marker_click: 1,
      map_search: 1,
      map_filter: 1,
      geo_request: 1,
      geo_success: 1,
      geo_error: 1,
      event_detail_open: 1,
      event_location_click: 1,
      event_location_prompt: 1,
      event_location_start: 1,
      event_map_init: 1,
      event_map_open: 1,
      event_map_close: 1,
      event_geo_success: 1,
      event_geo_error: 1,
      event_arrival: 1,
      news_page_open: 1,
      rs_page_open: 1,
      news_external_open: 1,
      rs_social_click: 1,
      news_live_update: 1,
      news_live_error: 1,
      news_fallback_used: 1,
      jornadas_page_open: 1,
      jornadas_nav_click: 1,
      jornadas_link_click: 1,
      events_page_open: 1,
      events_social_click: 1,
      events_nav_click: 1,
      event_card_open: 1,
      event_card_close: 1,
      event_card_swipe: 1
    };
  }

  function getMinIntervalMsForEvent(eventKey) {
    var k = String(eventKey || "");
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
        var p = window.Capacitor.getPlatform();
        if (p && p !== "web") return "app";
      }
    } catch (e) {}
    return "web";
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function getDateKey(now) {
    var d = now || new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function sanitizeKey(value) {
    var s = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "");
    return s.slice(0, 32);
  }

  function getPageKey() {
    var path = location && location.pathname ? location.pathname : "/";
    var base = path.split("/").pop() || "index.html";
    return sanitizeKey(base.replace(/\.html$/i, "")) || "index";
  }

  function init() {
    var firebaseConfig = {
      apiKey: "AIzaSyCECYhDqVY3vE5j6_U3N9GNQuX_l54TuDI",
      authDomain: "ubicatec-admin.firebaseapp.com",
      databaseURL: "https://ubicatec-admin-default-rtdb.firebaseio.com",
      projectId: "ubicatec-admin",
      storageBucket: "ubicatec-admin.firebasestorage.app",
      messagingSenderId: "860643879745",
      appId: "1:860643879745:android:ba43fb22857c31c2070fc0"
    };

    var mode = getMetricsMode();
    var allowlist = makeEventAllowlist(mode);
    var writeTotalsGlobal = getBooleanFlag("__UBICATEC_METRICS_WRITE_TOTALS", "ubicatec_metrics_write_totals", String(mode).toLowerCase() === "full");
    var writeTotalsPageviews = getBooleanFlag("__UBICATEC_METRICS_WRITE_TOTALS_PAGEVIEWS", "ubicatec_metrics_write_totals_pageviews", writeTotalsGlobal);
    var writeTotalsEvents = getBooleanFlag("__UBICATEC_METRICS_WRITE_TOTALS_EVENTS", "ubicatec_metrics_write_totals_events", writeTotalsGlobal);
    var trackPageViewEvent = getBooleanFlag("__UBICATEC_METRICS_TRACK_PAGE_VIEW_EVENT", "ubicatec_metrics_track_page_view_event", true);

    var trackSessions = getBooleanFlag("__UBICATEC_METRICS_TRACK_SESSIONS", "ubicatec_metrics_track_sessions", true);
    var trackUniques = getBooleanFlag("__UBICATEC_METRICS_TRACK_UNIQUES", "ubicatec_metrics_track_uniques", true);
    var trackFirstOpen = getBooleanFlag("__UBICATEC_METRICS_TRACK_FIRST_OPEN", "ubicatec_metrics_track_first_open", true);
    var trackPageviews = getBooleanFlag("__UBICATEC_METRICS_TRACK_PAGEVIEWS", "ubicatec_metrics_track_pageviews", true);

    var lastSentMsByKey = {};
    var minIntervalMsByEventKey = {};
    var keys = allowlist ? Object.keys(allowlist) : [];
    for (var i = 0; i < keys.length; i++) minIntervalMsByEventKey[keys[i]] = getMinIntervalMsForEvent(keys[i]);

    var app = null;
    try {
      app = window.firebase.initializeApp(firebaseConfig, "ubicatec-metrics-legacy");
    } catch (e) {
      app = window.firebase.app("ubicatec-metrics-legacy");
    }
    try {
      window.firebase.appCheck(app).activate({
        provider: new window.firebase.appCheck.ReCaptchaV3Provider("6LfnTYYtAAAAACNmnJunHPaeI_bMMzOfHal3AcEY"),
        isTokenAutoRefreshEnabled: true
      });
    } catch(e) {}

    var auth = window.firebase.auth(app);
    var db = window.firebase.database(app);

    // Iniciar sesión anónima automáticamente
    auth.signInAnonymously().catch(function(){});

    function safeRunTransaction(path) {
      if (!db) return Promise.resolve(0);
      return db.ref(path).set(window.firebase.database.ServerValue.increment(1)).catch(function () {});
    }

    function safeTrack(name, options) {
      var platform = getPlatform();
      var dateKey = getDateKey();
      var eventKey = sanitizeKey(name);
      if (!eventKey) return;
      if (allowlist && !allowlist[eventKey]) return;

      var labelKey = options && options.label ? sanitizeKey(options.label) : "";
      var dedupeKey = eventKey + "|" + labelKey;
      var nowMs = Date.now();
      var minIntervalMs = minIntervalMsByEventKey[eventKey] || 0;
      var lastMs = lastSentMsByKey[dedupeKey] || 0;
      if (minIntervalMs > 0 && lastMs > 0 && (nowMs - lastMs) < minIntervalMs) return;
      lastSentMsByKey[dedupeKey] = nowMs;

      var basePath = "analytics/v1/events/" + eventKey + "/" + platform + "/" + dateKey;
      safeRunTransaction(basePath + "/count").catch(function () {});
      if (writeTotalsEvents) safeRunTransaction("analytics/v1/totals/events/" + eventKey + "/" + platform).catch(function () {});
      if (labelKey) safeRunTransaction(basePath + "/by/" + labelKey + "/count").catch(function () {});
    }

    function trackSessionsAndUniques() {
      var platform = getPlatform();
      var dateKey = getDateKey();
      if (trackSessions) {
        try {
          var sessionKey = "ubicatec_metrics_session_" + platform + "_" + dateKey;
          if (!localStorage.getItem(sessionKey)) {
            safeRunTransaction("analytics/v1/sessions/" + platform + "/" + dateKey + "/count").catch(function () {});
            if (writeTotalsGlobal) safeRunTransaction("analytics/v1/totals/sessions/" + platform).catch(function () {});
            localStorage.setItem(sessionKey, "1");
          }
        } catch (e) {
          // Ignoramos el error para no contar múltiples visitas en navegadores que bloquean localStorage.
        }
      }

      if (trackFirstOpen) {
        try {
          var fk = "ubicatec_metrics_first_open_" + platform;
          if (!localStorage.getItem(fk)) {
            safeRunTransaction("analytics/v1/first_open/" + platform + "/" + dateKey + "/count").catch(function () {});
            if (writeTotalsGlobal) safeRunTransaction("analytics/v1/totals/first_open/" + platform).catch(function () {});
            localStorage.setItem(fk, "1");
          }
        } catch (e3) {}
      }
    }

    function trackPageview() {
      var platform = getPlatform();
      var dateKey = getDateKey();
      var pageKey = getPageKey();
      if (trackPageviews) {
        safeRunTransaction("analytics/v1/pageviews/" + platform + "/" + pageKey + "/" + dateKey + "/count").catch(function () {});
        if (writeTotalsPageviews) safeRunTransaction("analytics/v1/totals/pageviews/" + platform + "/" + pageKey).catch(function () {});
      }
      if (trackPageViewEvent) safeTrack("page_view", { label: pageKey });
      try {
        var did = getDateKey() + "|" + getPlatform();
        var k = "ubicatec_metrics_auto_funnel_" + did;
        if (!sessionStorage.getItem(k)) {
          if (document.getElementById("map")) safeTrack("map_open", {});
          sessionStorage.setItem(k, "1");
        }
      } catch (e) {}
    }

    window.ubicatecTrack = function (name, options) {
      try { safeTrack(name, options || {}); } catch (e) {}
    };

    trackSessionsAndUniques();
    trackPageview();

    try {
      if (navigator && navigator.geolocation && !navigator.geolocation.__ubPatched) {
        var geo = navigator.geolocation;
        var origGet = geo.getCurrentPosition.bind(geo);
        var origWatch = geo.watchPosition.bind(geo);
        geo.getCurrentPosition = function (success, error, options) {
          var glabel = (window && window.__UB_LAST_GEO_LABEL) ? String(window.__UB_LAST_GEO_LABEL) : 'auto';
          try { window.ubicatecTrack && window.ubicatecTrack('geo_request', { label: glabel }); } catch (e) {}
          return origGet(function (pos) {
            try { window.ubicatecTrack && window.ubicatecTrack('geo_success', { label: glabel }); } catch (e2) {}
            success && success(pos);
          }, function (err) {
            try { window.ubicatecTrack && window.ubicatecTrack('geo_error', { label: glabel }); } catch (e3) {}
            error && error(err);
          }, options);
        };
        geo.watchPosition = function (success, error, options) {
          var glabel = (window && window.__UB_LAST_GEO_LABEL) ? String(window.__UB_LAST_GEO_LABEL) : 'auto';
          try { window.ubicatecTrack && window.ubicatecTrack('geo_request', { label: glabel }); } catch (e) {}
          var sent = false;
          return origWatch(function (pos) {
            if (!sent) {
              sent = true;
              try { window.ubicatecTrack && window.ubicatecTrack('geo_success', { label: glabel }); } catch (e2) {}
            }
            success && success(pos);
          }, function (err) {
            try { window.ubicatecTrack && window.ubicatecTrack('geo_error', { label: glabel }); } catch (e3) {}
            error && error(err);
          }, options);
        };
        geo.__ubPatched = true;
      }
    } catch (e) {}
  }

  function boot() {
    var base = "https://www.gstatic.com/firebasejs/10.8.0/";
    loadScript(base + "firebase-app-compat.js")
      .then(function () { return loadScript(base + "firebase-auth-compat.js"); })
      .then(function () { return loadScript(base + "firebase-app-check-compat.js"); })
      .then(function () { return loadScript(base + "firebase-database-compat.js"); })
      .then(function () { init(); })
      .catch(function () { window.ubicatecTrack = function () {}; });
  }

  try { boot(); } catch (e) { window.ubicatecTrack = function () {}; }
})();
