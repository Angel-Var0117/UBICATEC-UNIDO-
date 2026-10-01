(function() {
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

    let simBtn = document.createElement('button');
    simBtn.id = 'ubSimBtnAccesible';
    simBtn.innerHTML = '🚶 Simular GPS';
    simBtn.style.cssText = 'position: absolute; top: 120px; left: 10px; z-index: 9999; padding: 8px 12px; background: #8e44ad; color: white; border: 2px solid white; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3);';
    document.body.appendChild(simBtn);

    let simInterval = null;
    let simIdx = 0;
    let simPoints = [];
    
    // Almacena los callbacks originales y las referencias de watchPosition
    let watchCallbacks = {};
    let watchIdCounter = 1000;
    
    const originalWatch = navigator.geolocation.watchPosition;
    const originalClear = navigator.geolocation.clearWatch;
    const originalGet = navigator.geolocation.getCurrentPosition;

    navigator.geolocation.watchPosition = function(success, error, options) {
        let id = watchIdCounter++;
        watchCallbacks[id] = success;
        originalWatch.call(navigator.geolocation, success, error, options);
        return id;
    };
    
    navigator.geolocation.clearWatch = function(id) {
        delete watchCallbacks[id];
        originalClear.call(navigator.geolocation, id);
    };

    function haversineMeters(lat1, lon1, lat2, lon2) {
        let R = 6371e3;
        let a = Math.sin((lat2 - lat1) * Math.PI / 360) ** 2 +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin((lon2 - lon1) * Math.PI / 360) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function interpolatePoints(points, stepMeters) {
        let res = [];
        for (let i = 0; i < points.length - 1; i++) {
            let p1 = points[i];
            let p2 = points[i+1];
            let d = haversineMeters(p1.lat, p1.lng, p2.lat, p2.lng);
            let steps = Math.max(1, Math.floor(d / stepMeters));
            for (let j = 0; j < steps; j++) {
                let f = j / steps;
                res.push({
                    lat: p1.lat + (p2.lat - p1.lat) * f,
                    lng: p1.lng + (p2.lng - p1.lng) * f
                });
            }
        }
        res.push(points[points.length - 1]);
        return res;
    }

    simBtn.addEventListener('click', function() {
        if (simInterval) {
            clearInterval(simInterval);
            simInterval = null;
            simBtn.innerHTML = '🚶 Simular GPS';
            simBtn.style.background = '#8e44ad';
            return;
        }

        // Buscar polylines en el mapa actual
        if (!window.map) {
            alert('El mapa no est listo'); return;
        }
        
        let pathLatLngs = [];
        window.map.eachLayer(function(layer) {
            if (layer instanceof L.Polyline && !layer.options.isGuide) {
                // tomar el polyline ms largo
                let latlngs = layer.getLatLngs();
                if (latlngs.length > pathLatLngs.length) {
                    pathLatLngs = latlngs;
                }
            }
        });

        if (pathLatLngs.length < 2) {
            alert('No hay una ruta trazada en el mapa para simular'); return;
        }

        simPoints = interpolatePoints(pathLatLngs, 2.5);
        simIdx = 0;
        
        simBtn.innerHTML = '🛑 Detener Sim. GPS';
        simBtn.style.background = '#c0392b';

        simInterval = setInterval(function() {
            if (simIdx >= simPoints.length) {
                clearInterval(simInterval);
                simInterval = null;
                simBtn.innerHTML = '🚶 Simular GPS';
                simBtn.style.background = '#8e44ad';
                return;
            }
            
            let pt = simPoints[simIdx];
            let mockPos = {
                coords: { latitude: pt.lat, longitude: pt.lng, accuracy: 5, heading: null, speed: 1.5 },
                timestamp: Date.now()
            };
            
            // Disparar los watchers activos
            Object.values(watchCallbacks).forEach(cb => {
                if (typeof cb === 'function') cb(mockPos);
            });
            
            // Si la app usa ubicacin de mdulo rutas voz
            if (window.actualizarProgresoRuta) {
               // ...
            }
            
            simIdx++;
        }, 1000);
    });
})();
