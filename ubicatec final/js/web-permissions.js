(function () {
    var hasTriedGeo = false;
    var hasTriedNotif = false;

    function isNativeApp() {
        try {
            return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
        } catch (e) {
            return false;
        }
    }

    function canAutoPromptNotifications() {
        if (typeof Notification === "undefined") return false;
        return Notification.permission === "default";
    }

    function isIOSDevice() {
        var ua = navigator.userAgent || "";
        var isIOS = /iPad|iPhone|iPod/i.test(ua);
        var isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
        return isIOS || isIPadOS;
    }

    function isSafariBrowser() {
        var ua = navigator.userAgent || "";
        return /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS|Edg/i.test(ua);
    }

    function isStandaloneMode() {
        try {
            if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
        } catch (e) {}
        return !!(window.navigator && window.navigator.standalone);
    }

    function canPromptWebPushOnThisBrowser() {
        var secure = typeof isSecureContext !== "undefined" ? !!isSecureContext : (location && location.protocol === "https:");
        if (!secure) {
            console.log("[UBICATEC] No se puede solicitar notificaciones: No está en HTTPS");
            return false;
        }

        // iOS/iPadOS Safari requires installed PWA for web push.
        if (isIOSDevice() && isSafariBrowser() && !isStandaloneMode()) {
            console.log("[UBICATEC] iOS Safari en web requiere PWA instalada para notificaciones");
            return false;
        }
        return true;
    }

    async function requestWebNotificationsIfNeeded() {
        if (isNativeApp()) return;
        if (hasTriedNotif) return;
        if (!canAutoPromptNotifications()) {
            console.log("[UBICATEC] No se puede solicitar notificaciones automáticamente: Permiso ya fue definido");
            return;
        }
        if (!canPromptWebPushOnThisBrowser()) return;
        hasTriedNotif = true;

        try {
            if (typeof window.requestUbicatecWebPushPermission === "function") {
                const result = await window.requestUbicatecWebPushPermission();
                console.log("[UBICATEC] Solicitud de notificaciones enviada. Resultado:", result);
                return;
            }
        } catch (e) {
            console.warn("[UBICATEC] Error en requestUbicatecWebPushPermission:", e);
        }

        try {
            const result = await Notification.requestPermission();
            console.log("[UBICATEC] Solicitud de notificaciones estándar. Resultado:", result);
        } catch (e) {
            console.warn("[UBICATEC] Error en Notification.requestPermission:", e);
        }
    }

    function requestGeolocationIfNeeded() {
        if (isNativeApp()) return;
        if (hasTriedGeo) return;
        if (!navigator.geolocation || !navigator.geolocation.getCurrentPosition) return;
        hasTriedGeo = true;

        var ask = function () {
            navigator.geolocation.getCurrentPosition(
                function () {},
                function () {},
                { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
            );
        };

        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: "geolocation" }).then(function (status) {
                if (status && status.state === "prompt") ask();
            }).catch(function () {
                ask();
            });
            return;
        }

        ask();
    }

    function runChecks() {
        requestGeolocationIfNeeded();
        requestWebNotificationsIfNeeded();
    }

    function runChecksFromUserGesture() {
        runChecks();
        window.removeEventListener("click", runChecksFromUserGesture, true);
        window.removeEventListener("touchstart", runChecksFromUserGesture, true);
        window.removeEventListener("keydown", runChecksFromUserGesture, true);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", runChecks);
    } else {
        runChecks();
    }

    // Cross-browser fallback: many browsers allow permission prompts reliably
    // only after user interaction.
    window.addEventListener("click", runChecksFromUserGesture, true);
    window.addEventListener("touchstart", runChecksFromUserGesture, true);
    window.addEventListener("keydown", runChecksFromUserGesture, true);
})();
