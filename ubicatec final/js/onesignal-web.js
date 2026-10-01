(function () {
    const APP_ID = "bee083e4-1a4b-464e-91e4-d823b38a26ac";

    function isNativeApp() {
        try {
            return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
        } catch (e) {
            return false;
        }
    }

    if (isNativeApp()) return;

    // Verificar que el sitio está en HTTPS (requerido para OneSignal)
    function isSecureContext() {
        return typeof isSecureContext !== "undefined" ? !!isSecureContext : (location && location.protocol === "https:");
    }

    if (!isSecureContext()) {
        console.warn("[UBICATEC] OneSignal requiere HTTPS. Notificaciones no disponibles en HTTP.");
        return;
    }

    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.ubicatecOneSignalReady = new Promise((resolve, reject) => {
        window.OneSignalDeferred.push(async function (OneSignal) {
            try {
                // Registrar listeners para debugging
                OneSignal.Notifications.addEventListener("permission", event => {
                    console.log("[UBICATEC] Estado de permisos de notificaciones:", event.permission);
                });

                OneSignal.Notifications.addEventListener("notificationDisplay", event => {
                    console.log("[UBICATEC] Notificación mostrada:", event.notification);
                });

                OneSignal.Notifications.addEventListener("notificationDismiss", event => {
                    console.log("[UBICATEC] Notificación cerrada:", event.notification.id);
                });

                // Log del contexto de seguridad
                console.log("[UBICATEC] Contexto seguro (HTTPS):", isSecureContext());
                console.log("[UBICATEC] Permisos del navegador:", Notification.permission);
                console.log("[UBICATEC] Service Workers soportados:", 'serviceWorker' in navigator);

                await OneSignal.init({
                    appId: APP_ID,
                    allowLocalhostAsSecureOrigin: true,
                    serviceWorkerPath: "/sw.js",
                    serviceWorkerParam: { scope: "/" },
                    serviceWorkerUpdaterPath: "/OneSignalSDKUpdaterWorker.js",
                    notifyButton: {
                        enable: true,
                        size: "small",
                        position: "bottom-left",
                        showCredit: false,
                        text: {
                            "tip.state.unsubscribed": "Suscríbete a las notificaciones",
                            "tip.state.subscribed": "Estás suscrito a las notificaciones",
                            "tip.state.blocked": "Has bloqueado las notificaciones"
                        }
                    },
                    promptOptions: {
                        slidedown: {
                            prompts: [{
                                type: "push",
                                autoPrompt: true,
                                text: {
                                    actionMessage: "Nos gustaría enviarte notificaciones sobre avisos y actualizaciones importantes de Ubicatec.",
                                    acceptButton: "Permitir",
                                    cancelButton: "No, gracias"
                                },
                                delay: {
                                    pageViews: 1,
                                    timeDelay: 5
                                }
                            }]
                        }
                    }
                });

                try {
                    OneSignal.User.addTag("platform", "web");
                    console.log("[UBICATEC] Tag 'platform:web' agregado");
                } catch (e) {
                    console.warn("[UBICATEC] Error al agregar tag:", e);
                }

                // Verificar estado de suscripción
                const subscriptionState = OneSignal.User.PushSubscription;
                console.log("[UBICATEC] Estado de suscripción:", {
                    isSubscribed: subscriptionState.isSubscribed,
                    isOptedIn: subscriptionState.isOptedIn,
                    optedInStatus: subscriptionState.optedInStatus
                });

                window.ubicatecOneSignalWeb = OneSignal;
                console.log("[UBICATEC] OneSignal Web inicializado correctamente");
                resolve(OneSignal);
            } catch (error) {
                console.error("[UBICATEC] Error al inicializar OneSignal Web:", error);
                console.error("[UBICATEC] Detalles del error:", {
                    message: error.message,
                    stack: error.stack,
                    type: error.type
                });
                reject(error);
            }
        });
    });

    window.requestUbicatecWebPushPermission = async function () {
        try {
            const OneSignal = await window.ubicatecOneSignalReady;
            const result = await OneSignal.Notifications.requestPermission();
            console.log("[UBICATEC] Resultado de solicitud de permisos:", result);
            return result;
        } catch (error) {
            console.error("[UBICATEC] Error al solicitar permisos de notificación:", error);
            throw error;
        }
    };

    window.getUbicatecWebPushPermission = async function () {
        const OneSignal = await window.ubicatecOneSignalReady;
        if (OneSignal.Notifications && typeof OneSignal.Notifications.permission === "boolean") {
            return OneSignal.Notifications.permission;
        }
        if (OneSignal.Notifications && typeof OneSignal.Notifications.getPermissionAsync === "function") {
            return OneSignal.Notifications.getPermissionAsync();
        }
        return typeof Notification !== "undefined" && Notification.permission === "granted";
    };

    // Inicializar logs de debugging
    if (window.location.hostname === "ubicatec.puebla.tecnm.mx" || window.location.hostname === "localhost") {
        console.log("[UBICATEC] Modo debug activado. Logs disponibles en la consola del navegador.");
    }
})();
