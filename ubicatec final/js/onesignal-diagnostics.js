/**
 * Diagnósticos de OneSignal para UBICATEC
 * 
 * Este archivo proporciona herramientas para diagnosticar problemas con notificaciones push.
 * Acceder a través de la consola del navegador: window.ubicatecDiagnostics.runDiagnostics()
 */

(function() {
    window.ubicatecDiagnostics = {
        async runDiagnostics() {
            console.log("=== DIAGNÓSTICO DE NOTIFICACIONES PUSH UBICATEC ===\n");

            // 1. Verificar contexto seguro (HTTPS)
            const isHttps = location.protocol === 'https:';
            console.log("✓ HTTPS:", isHttps ? "✅ SÍ" : "❌ NO - OneSignal requiere HTTPS");

            // 2. Verificar Service Worker
            const swSupport = 'serviceWorker' in navigator;
            console.log("✓ Service Worker soportado:", swSupport ? "✅ SÍ" : "❌ NO");

            if (swSupport) {
                try {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    console.log(`  Registros activos: ${registrations.length}`);
                    registrations.forEach((reg, i) => {
                        console.log(`  [${i}] Scope: ${reg.scope}`);
                        console.log(`      State: ${reg.installing ? 'installing' : reg.waiting ? 'waiting' : reg.active ? 'active' : 'unknown'}`);
                    });
                } catch (e) {
                    console.error("  Error al obtener registros:", e);
                }
            }

            // 3. Verificar Notification API
            const notifSupport = typeof Notification !== 'undefined';
            console.log("✓ Notification API:", notifSupport ? "✅ SÍ" : "❌ NO");
            if (notifSupport) {
                console.log(`  Estado de permisos: ${Notification.permission}`);
            }

            // 4. Verificar OneSignal SDK
            const onesignalLoaded = !!window.OneSignal;
            console.log("✓ OneSignal SDK cargado:", onesignalLoaded ? "✅ SÍ" : "❌ NO");

            // 5. Verificar estado de OneSignal
            try {
                const OneSignal = await window.ubicatecOneSignalReady;
                console.log("✓ OneSignal inicializado:", "✅ SÍ");

                if (OneSignal && OneSignal.User && OneSignal.User.PushSubscription) {
                    const sub = OneSignal.User.PushSubscription;
                    console.log("  Suscripción Push:", {
                        isSubscribed: sub.isSubscribed,
                        isOptedIn: sub.isOptedIn,
                        optedInStatus: sub.optedInStatus,
                        id: sub.id ? "ID presente" : "Sin ID"
                    });
                }
            } catch (e) {
                console.error("✗ OneSignal no inicializado:", e.message);
            }

            // 6. Verificar manifest.json
            const manifest = document.querySelector('link[rel="manifest"]');
            console.log("✓ Manifest.json referenciado:", manifest ? "✅ SÍ" : "❌ NO");

            // 7. Información del navegador
            console.log("\n=== INFORMACIÓN DEL NAVEGADOR ===");
            console.log("User Agent:", navigator.userAgent);
            console.log("Plataforma:", navigator.platform);
            console.log("Idioma:", navigator.language);

            // 8. Estado de permisos
            console.log("\n=== ESTADO DE PERMISOS ===");
            if (navigator.permissions && navigator.permissions.query) {
                try {
                    const notifStatus = await navigator.permissions.query({ name: 'notifications' });
                    console.log("Notificaciones:", notifStatus.state);

                    const geoStatus = await navigator.permissions.query({ name: 'geolocation' });
                    console.log("Geolocalización:", geoStatus.state);
                } catch (e) {
                    console.log("No se puede consultar permisos:", e.message);
                }
            }

            console.log("\n=== DIAGNÓSTICO COMPLETADO ===");
            console.log("Estado: LISTO PARA NOTIFICACIONES");
            console.log("\nPróximos pasos:");
            console.log("1. Ejecuta: window.ubicatecDiagnostics.requestPushNotification()");
            console.log("2. Ejecuta: window.ubicatecDiagnostics.testNotification()");
            console.log("3. Desde OneSignal, envía una notificación de prueba");
        },

        async requestPushNotification() {
            console.log("\n📢 Solicitando permiso de notificaciones...");
            try {
                if (!window.ubicatecOneSignalReady) {
                    console.error("❌ OneSignal no está inicializado");
                    return;
                }

                const result = await window.requestUbicatecWebPushPermission();
                console.log("✅ Resultado:", result);
                console.log("📌 Verifica el navegador para el diálogo de permisos");
            } catch (e) {
                console.error("❌ Error:", e.message);
            }
        },

        testNotification() {
            console.log("\n🔔 Enviando notificación de prueba...");
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('UBICATEC - Prueba', {
                    icon: 'img/navbar.svg',
                    badge: 'img/fav.png',
                    body: 'Esta es una notificación de prueba. ¡Si ves esto, funciona!',
                    tag: 'ubicatec-test',
                    requireInteraction: false
                });
                console.log("✅ Notificación enviada. Deberías verla en la esquina inferior derecha");
            } else {
                console.warn("⚠️  Notificaciones no permitidas o no soportadas");
                console.log("Estado de permisos:", Notification.permission);
                console.log("Para habilitar: Solicita el permiso primero con requestPushNotification()");
            }
        },

        async checkStatus() {
            console.log("\n📊 Verificando estado actual de OneSignal...\n");
            
            try {
                const OneSignal = await window.ubicatecOneSignalReady;
                
                // Estado de suscripción
                if (OneSignal.User.PushSubscription) {
                    const sub = OneSignal.User.PushSubscription;
                    console.log("Estado de Suscripción Push:");
                    console.log("  - isSubscribed:", sub.isSubscribed);
                    console.log("  - isOptedIn:", sub.isOptedIn);
                    console.log("  - optedInStatus:", sub.optedInStatus);
                }

                // Permisos del navegador
                if (OneSignal.Notifications) {
                    const perm = OneSignal.Notifications.permission;
                    console.log("\nPermiso de Notificaciones:", perm);
                }

                console.log("\n✅ OneSignal está activo y listo");
            } catch (e) {
                console.error("❌ Error al obtener estado:", e.message);
            }
        },

        async optIn() {
            console.log("\n✅ Suscribiendo a notificaciones push...");
            try {
                const OneSignal = await window.ubicatecOneSignalReady;
                OneSignal.User.PushSubscription.optIn();
                console.log("✅ Usuario suscrito a notificaciones push");
            } catch (e) {
                console.error("❌ Error:", e.message);
            }
        },

        async optOut() {
            console.log("\n❌ Cancelando suscripción a notificaciones push...");
            try {
                const OneSignal = await window.ubicatecOneSignalReady;
                OneSignal.User.PushSubscription.optOut();
                console.log("❌ Usuario canceló suscripción");
            } catch (e) {
                console.error("❌ Error:", e.message);
            }
        },

        showHelp() {
            console.log(`
╔════════════════════════════════════════════════════════════════╗
║          HERRAMIENTAS DE DIAGNÓSTICO UBICATEC                  ║
╚════════════════════════════════════════════════════════════════╝

DIAGNÓSTICO Y ESTADO:
  • window.ubicatecDiagnostics.runDiagnostics()
    → Ejecuta diagnóstico completo

  • window.ubicatecDiagnostics.checkStatus()
    → Verifica estado actual de OneSignal

NOTIFICACIONES:
  • window.ubicatecDiagnostics.requestPushNotification()
    → Solicita permiso al usuario

  • window.ubicatecDiagnostics.testNotification()
    → Envía notificación de prueba

SUSCRIPCIÓN:
  • window.ubicatecDiagnostics.optIn()
    → Suscribir a notificaciones push

  • window.ubicatecDiagnostics.optOut()
    → Cancelar suscripción

AYUDA:
  • window.ubicatecDiagnostics.showHelp()
    → Muestra este mensaje
            `);
        }
    };

    console.log("[UBICATEC] ✅ Herramientas de diagnóstico disponibles");
    console.log("[UBICATEC] 📖 Escribe: window.ubicatecDiagnostics.showHelp()");
})();
