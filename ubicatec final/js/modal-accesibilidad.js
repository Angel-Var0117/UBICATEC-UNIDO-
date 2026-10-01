/**
 * Modal de Accesibilidad - UBICATEC
 * Manejo de la interfaz de navegación accesible
 * 
 * @author Sistema UBICATEC
 * @version 1.0
 * @date 2024
 */

// ============================================================================
// VARIABLES GLOBALES
// ============================================================================

let modalAccesibilidad = null;
let edificioDestino = null;
let edificioActual = null;
let ubicacionUsuario = null; // Variable global para almacenar coords GPS

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa el sistema de modal de accesibilidad
 */
function inicializarModalAccesibilidad() {
    console.log('🔧 Inicializando modal de accesibilidad...');

    // Verificar que el sistema de navegación esté cargado
    if (typeof sistemaNavegacionAccesible === 'undefined') {
        console.error('❌ Sistema de navegación accesible no está cargado');
        return false;
    }

    // Crear el modal si no existe
    if (!document.getElementById('modalAccesibilidad')) {
        crearModalAccesibilidad();
    }

    // Obtener referencia al modal
    modalAccesibilidad = document.getElementById('modalAccesibilidad');

    // Configurar event listeners
    configurarEventListeners();

    console.log('✅ Modal de accesibilidad inicializado correctamente');
    return true;
}

/**
 * Crea el HTML del modal de accesibilidad
 */
function crearModalAccesibilidad() {
    const styles = `
        <style>
            .modal-accesibilidad {
                display: none;
                position: fixed;
                z-index: 9999;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
            }
            .modal-accesibilidad.show {
                display: block;
                animation: fadeIn 0.3s;
            }
            .modal-accesibilidad-content {
                background-color: #fefefe;
                margin: 5% auto;
                padding: 0;
                border: 1px solid #888;
                width: 90%;
                max-width: 600px;
                border-radius: 15px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                position: relative;
                animation: slideDown 0.4s;
            }
            .modal-accesibilidad-header {
                padding: 20px;
                background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
                color: white;
                border-top-left-radius: 15px;
                border-top-right-radius: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .modal-accesibilidad-header h2 {
                margin: 0;
                font-size: 1.5rem;
                display: flex;
                align-items: center;
                gap: 10px;
                color: white;
            }
            .icono-accesibilidad {
                font-size: 24px;
                margin-right: 10px;
            }
            .modal-accesibilidad-close {
                color: white;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                transition: 0.3s;
            }
            .modal-accesibilidad-close:hover {
                color: #ffcdd2;
                text-decoration: none;
            }
            .modal-accesibilidad-body {
                padding: 25px;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            .modal-accesibilidad-footer {
                padding: 15px;
                background-color: #f1f1f1;
                border-bottom-left-radius: 15px;
                border-bottom-right-radius: 15px;
                text-align: center;
                font-size: 0.9rem;
                color: #666;
            }
            .pregunta-accesibilidad h3 {
                color: #333;
                margin-top: 0;
            }
            .botones-respuesta {
                display: flex;
                gap: 20px;
                margin-top: 25px;
                justify-content: center;
            }
            .btn-respuesta {
                padding: 12px 30px;
                font-size: 1.1rem;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                font-weight: bold;
                flex: 1;
                max-width: 150px;
            }
            .btn-si {
                background-color: #4CAF50;
                color: white;
            }
            .btn-no {
                background-color: #f44336;
                color: white;
            }
            .btn-respuesta:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            .info-limitaciones, .controles-navegacion {
                display: none;
                margin-top: 20px;
                padding: 15px;
                background-color: #fff3e0;
                border-left: 5px solid #ff9800;
                border-radius: 4px;
            }
            .info-limitaciones.show, .controles-navegacion.show {
                display: block;
                animation: fadeIn 0.5s;
            }
            .selector-inicio {
                margin-top: 20px;
            }
            .selector-inicio select {
                width: 100%;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #ccc;
                font-size: 1rem;
                margin-top: 5px;
            }
            .opciones-punto-inicio {
                margin-top: 20px;
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
            }
            .radio-group {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: 10px;
            }
            .radio-option {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                cursor: pointer;
                padding: 8px;
                border-radius: 6px;
                transition: background 0.2s;
            }
            .radio-option:hover {
                background: #e9ecef;
            }
            .radio-option input[type="radio"] {
                margin-top: 5px;
            }
            .radio-label strong {
                display: block;
                color: #2c3e50;
            }
            .radio-label small {
                color: #6c757d;
            }
            .botones-accion {
                margin-top: 25px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .btn-navegacion {
                padding: 14px;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            .btn-iniciar {
                background-color: #2196F3;
                color: white;
                box-shadow: 0 4px 6px rgba(33, 150, 243, 0.3);
            }
            .btn-iniciar:disabled {
                background-color: #b0bec5;
                cursor: not-allowed;
                box-shadow: none;
            }
            .btn-iniciar:not(:disabled):hover {
                background-color: #1976D2;
                transform: translateY(-2px);
            }
            .btn-cancelar {
                background-color: transparent;
                color: #757575;
                border: 1px solid #757575;
            }
            .btn-cancelar:hover {
                background-color: #f5f5f5;
                color: #333;
            }
            .btn-gps {
                margin-top: 10px;
                background: white;
                border: 1px solid #2196f3;
                color: #2196f3;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
            }
            .btn-gps:hover {
                background: #e3f2fd;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideDown {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            /* Media queries */
            @media (max-width: 600px) {
                .modal-accesibilidad-content {
                    width: 95%;
                    margin: 2% auto;
                }
                .botones-respuesta {
                    flex-direction: column;
                }
                .btn-respuesta {
                    width: 100%;
                    max-width: none;
                }
            }
        </style>
    `;

    const modalHTML = `
        <div id="modalAccesibilidad" class="modal-accesibilidad">
            <div class="modal-accesibilidad-content">
                <div class="modal-accesibilidad-header">
                    <span class="icono-accesibilidad"></span>
                    <h2>Navegación Accesible</h2>
                    <span class="modal-accesibilidad-close" id="cerrarModalAccesibilidad">&times;</span>
                </div>
                
                <div class="modal-accesibilidad-body">
                    <!-- Pregunta de accesibilidad -->
                    <div class="pregunta-accesibilidad" id="preguntaAccesibilidad">
                        <h3>¿Cuentas con alguna discapacidad de movilidad?</h3>
                        <p>Para brindarte la mejor experiencia de navegación, necesitamos saber si tienes alguna limitación de movilidad.</p>
                        <div class="botones-respuesta">
                            <button class="btn-respuesta btn-si" id="btnSiAccesibilidad">Sí</button>
                            <button class="btn-respuesta btn-no" id="btnNoAccesibilidad">No</button>
                        </div>
                    </div>
                    
                    <!-- Información de limitaciones -->
                    <div class="info-limitaciones" id="infoLimitaciones">
                        <h4>🚧 Limitaciones de Accesibilidad</h4>
                        <p>Para moverse dentro del campus con discapacidad de movilidad, hay limitaciones y solo se puede acceder a edificios específicos con rutas accesibles.</p>
                    </div>
                    
                    <!-- Controles de navegación -->
                    <div class="controles-navegacion" id="controlesNavegacion">
                        <h4>Configuración de Navegación</h4>
                        
                        <!-- Indicador de estado GPS -->
                        <div class="estado-gps" id="estadoGps">
                            <div class="indicador-carga">
                                <div class="spinner-gps"></div>
                                <span>Obteniendo tu ubicación...</span>
                            </div>
                        </div>
                        
                        <!-- Selector de ubicación inicial (Oculto por defecto) -->
                        <div class="selector-inicio" style="display: none;">
                            <label for="selectInicio">Ubicación inicial:</label>
                            <select id="selectInicio">
                                <option value="">-- Selecciona tu ubicación inicial --</option>
                                <optgroup label="Accesos Principales">
                                    <!-- Se llena dinámicamente -->
                                </optgroup>
                                <optgroup label="🏢 Edificios Accesibles - Ruta Verde (Norte)">
                                    <!-- Se llena dinámicamente -->
                                </optgroup>
                                <optgroup label="🏢 Edificios Accesibles - Ruta Naranja (Centro)">
                                    <!-- Se llena dinámicamente -->
                                </optgroup>
                                <optgroup label="🏢 Edificios Accesibles - Ruta Azul (Sur)">
                                    <!-- Se llena dinámicamente -->
                                </optgroup>
                            </select>
                        </div>
                        
                        <!-- Opciones de punto de inicio (Oculto por defecto) -->
                        <div class="opciones-punto-inicio" style="display: none;">
                            <h5>📍 ¿Desde dónde quieres iniciar la ruta?</h5>
                            <div class="radio-group">
                                <label class="radio-option">
                                    <input type="radio" name="puntoInicio" value="gps" id="radioGps" checked>
                                    <span class="radio-label">
                                         <strong>Mi ubicación actual</strong><br>
                                        <small>Usar GPS para detectar donde estoy ahora</small>
                                    </span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="puntoInicio" value="seleccionado" id="radioSeleccionado">
                                    <span class="radio-label">
                                         <strong>Punto seleccionado arriba</strong><br>
                                        <small>Usar el acceso o edificio que seleccioné</small>
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="botones-accion" style="display: none;">
                            <button class="btn-navegacion btn-iniciar" id="btnIniciarNavegacion" disabled>
                                 Iniciar Navegación
                            </button>
                            <button class="btn-navegacion btn-cancelar" id="btnCancelarNavegacion">
                                 Cancelar
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-accesibilidad-footer">
                    <p><strong>UBICATEC</strong> - Sistema de Navegación Accesible<br>
                    Instituto Tecnológico de Puebla</p>
                </div>
            </div>
        </div>
    `;

    // Insertar estilos y modal en el body
    document.body.insertAdjacentHTML('beforeend', styles + modalHTML);
    console.log('✅ Modal de accesibilidad creado con estilos');
}

/**
 * Pobla el dropdown de ubicación inicial con edificios accesibles
 */
function poblarDropdownUbicacionInicial() {
    const selectInicio = document.getElementById('selectInicio');
    if (!selectInicio) {
        console.error('❌ No se encontró el select de ubicación inicial');
        return;
    }

    console.log('🔍 Iniciando poblamiento del dropdown...');
    console.log('📋 Select encontrado:', selectInicio);

    // Limpiar opciones existentes de edificios (mantener accesos principales)
    const optgroupsEdificios = [
        selectInicio.querySelector('optgroup[label="🏢 Edificios Accesibles - Ruta Verde (Norte)"]'),
        selectInicio.querySelector('optgroup[label="🏢 Edificios Accesibles - Ruta Naranja (Centro)"]'),
        selectInicio.querySelector('optgroup[label="🏢 Edificios Accesibles - Ruta Azul (Sur)"]')
    ];

    console.log('🏢 Optgroups de edificios encontrados:', optgroupsEdificios);

    optgroupsEdificios.forEach((optgroup, index) => {
        if (optgroup) {
            console.log(`✅ Limpiando optgroup ${index + 1}:`, optgroup.label);
            optgroup.innerHTML = '';
        } else {
            console.error(`❌ No se encontró optgroup ${index + 1}`);
        }
    });

    // Datos de edificios accesibles organizados por rutas con coordenadas reales
    const edificiosAccesibles = {
        'Ruta Verde (Norte)': [
            { id: 'edificio_3', nombre: 'Edificio 3', coords: [19.07028250570129, -98.1691442328977] },
            { id: 'edificio_41', nombre: 'Edificio 41', coords: [19.071208, -98.169903] },
            { id: 'edificio_45', nombre: 'Edificio 45', coords: [19.070917, -98.168811] },
            { id: 'edificio_51', nombre: 'Edificio 51', coords: [19.071552, -98.169811] },
            { id: 'edificio_53', nombre: 'Edificio 53', coords: [19.070834, -98.169673] }
        ],
        'Ruta Naranja (Centro)': [
            { id: 'edificio_1', nombre: 'Edificio 1', coords: [19.0700471611661, -98.16987998532049] },
            { id: 'edificio_2', nombre: 'Edificio 2', coords: [19.070339683584418, -98.16984213200494] },
            { id: 'edificio_17', nombre: 'Edificio 17', coords: [19.068800, -98.169000] }, // Coord aprox
            { id: 'edificio_19', nombre: 'Edificio 19', coords: [19.069084, -98.169326] },
            { id: 'edificio_20', nombre: 'Edificio 20', coords: [19.069205695460248, -98.16860064509656] },
            { id: 'edificio_25', nombre: 'Edificio 25', coords: [19.068845419565694, -98.16910953816078] },
            { id: 'edificio_27', nombre: 'Edificio 27', coords: [19.068793, -98.168558] },
            { id: 'edificio_28', nombre: 'Edificio 28', coords: [19.068900, -98.168700] }, // Coord aprox
            { id: 'edificio_49', nombre: 'Edificio 49', coords: [19.069142, -98.168277] }
        ],
        'Ruta Azul (Sur)': [
            { id: 'edificio_30', nombre: 'Edificio 30', coords: [19.0684055, -98.1689559] },
            { id: 'edificio_36', nombre: 'Edificio 36', coords: [19.068163, -98.17027] },
            { id: 'edificio_50', nombre: 'Edificio 50', coords: [19.067422488611665, -98.169682206123] }
        ]
    };

    // Datos de accesos principales con coordenadas reales
    const accesosPrincipales = {
        'acceso_principal': {
            nombre: 'Acceso Principal',
            descripcion: 'Avenida Tecnológico - Entrada principal',
            conecta: 'Ruta Naranja',
            coords: [19.069821422656712, -98.17042957607508]
        },
        'acceso_visitantes': {
            nombre: 'Acceso Visitantes',
            descripcion: 'Avenida Tecnológico, Frente a Sears',
            conecta: 'Ruta Azul',
            coords: [19.068467599492795, -98.17061388514823]
        },
        'acceso_hangar': {
            nombre: 'Acceso Hangar',
            descripcion: 'Autobuses y Estacionamiento 3',
            conecta: 'Ruta Azul',
            coords: [19.067184781628676, -98.17086525607026]
        },
        'acceso_estacionamiento_1': {
            nombre: 'Acceso Estacionamiento 1',
            descripcion: 'Avenida Tecnológico',
            conecta: 'Ruta Naranja',
            coords: [19.070712336989462, -98.1703082196594]
        },
        'acceso_maravillas': {
            nombre: 'Acceso Maravillas',
            descripcion: 'Avenida Tecnológico',
            conecta: 'Ruta Verde',
            coords: [19.070523, -98.167751]
        }
    };

    // Actualizar opciones de accesos principales con descripciones
    const optgroupAccesos = selectInicio.querySelector('optgroup[label="Accesos Principales"]');
    console.log('🚪 Optgroup de accesos encontrado:', optgroupAccesos);

    if (optgroupAccesos) {
        console.log('✅ Limpiando y poblando accesos principales...');
        optgroupAccesos.innerHTML = '';

        Object.entries(accesosPrincipales).forEach(([id, acceso]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${acceso.nombre} - ${acceso.descripcion}`;
            option.dataset.coords = JSON.stringify(acceso.coords);
            option.dataset.conecta = acceso.conecta;
            optgroupAccesos.appendChild(option);
            console.log(`➕ Agregado acceso: ${acceso.nombre}`);
        });
    } else {
        console.error('❌ No se encontró el optgroup de Accesos Principales');
    }

    // Mapeo de rutas a optgroups
    const mapeoRutas = {
        'Ruta Verde (Norte)': selectInicio.querySelector('optgroup[label="🏢 Edificios Accesibles - Ruta Verde (Norte)"]'),
        'Ruta Naranja (Centro)': selectInicio.querySelector('optgroup[label="🏢 Edificios Accesibles - Ruta Naranja (Centro)"]'),
        'Ruta Azul (Sur)': selectInicio.querySelector('optgroup[label="🏢 Edificios Accesibles - Ruta Azul (Sur)"]')
    };

    // Agregar edificios por rutas
    console.log('🏢 Iniciando poblamiento de edificios por rutas...');
    Object.entries(edificiosAccesibles).forEach(([ruta, edificios]) => {
        const optgroup = mapeoRutas[ruta];
        console.log(`📍 Procesando ruta: ${ruta}`, optgroup);

        if (optgroup) {
            console.log(`✅ Agregando ${edificios.length} edificios a ${ruta}`);
            edificios.forEach(edificio => {
                const option = document.createElement('option');
                option.value = edificio.id;
                option.textContent = edificio.nombre;
                option.dataset.coords = JSON.stringify(edificio.coords);
                option.dataset.ruta = ruta;
                optgroup.appendChild(option);
                console.log(`➕ Agregado edificio: ${edificio.nombre}`);
            });
        } else {
            console.error(`❌ No se encontró optgroup para ruta: ${ruta}`);
        }
    });

    console.log('✅ Dropdown de ubicación inicial poblado con',
        Object.values(edificiosAccesibles).flat().length, 'edificios accesibles y',
        Object.keys(accesosPrincipales).length, 'accesos principales');

    // Forzar re-render del select
    setTimeout(() => {
        const totalOpciones = selectInicio.options.length;
        console.log(`🔍 Total de opciones en el select: ${totalOpciones}`);

        // Log de todas las opciones para debugging
        for (let i = 0; i < selectInicio.options.length; i++) {
            const option = selectInicio.options[i];
            console.log(`📋 Opción ${i}: "${option.textContent}" (valor: ${option.value})`);
        }

        // Forzar actualización visual
        selectInicio.style.display = 'none';
        selectInicio.offsetHeight; // Trigger reflow
        selectInicio.style.display = 'block';
    }, 100);
}

// Alias para compatibilidad
const llenarSelectorInicio = poblarDropdownUbicacionInicial;

/**
 * Obtiene las coordenadas del acceso seleccionado
 * @param {string} accesoId - ID del acceso (ej: 'acceso_visitantes')
 * @returns {Array|null} Coordenadas [lat, lng] o null si no se encuentra
 */
/**
 * Obtiene las coordenadas del acceso seleccionado
 * @param {string} accesoId - ID del acceso (ej: 'acceso_visitantes')
 * @returns {Array|null} Coordenadas [lat, lng] o null si no se encuentra
 */
function obtenerCoordenadasAcceso(accesoId) {
    if (typeof grafoAccesible === 'undefined' || !grafoAccesible.accesos) {
        console.error('❌ Grafo no inicializado al buscar coordenadas de acceso');
        return null;
    }

    // Buscar el ID del nodo en el mapa de accesos
    const nodoId = grafoAccesible.accesos[accesoId];
    if (!nodoId) {
        console.warn(`⚠️ Acceso ${accesoId} no encontrado en grafoAccesible.accesos`);
        return null;
    }

    // Obtener el objeto nodo
    const nodo = obtenerNodoPorId(nodoId);
    if (!nodo) {
        console.warn(`⚠️ Nodo ${nodoId} (de acceso ${accesoId}) no encontrado en nodos`);
        return null;
    }

    console.log(`📍 Coordenadas del acceso ${accesoId}:`, nodo.coords);
    return nodo.coords;
}

/**
 * Maneja el cambio en las opciones de punto de inicio
 */
function manejarCambioPuntoInicio() {
    const radioGps = document.getElementById('radioGps');
    const radioSeleccionado = document.getElementById('radioSeleccionado');
    const selectInicio = document.getElementById('selectInicio');
    const btnIniciar = document.getElementById('btnIniciarNavegacion');

    if (!radioGps || !radioSeleccionado || !selectInicio || !btnIniciar) {
        console.error('❌ Elementos de punto de inicio no encontrados');
        return;
    }

    const usarGps = radioGps.checked;
    const usarSeleccionado = radioSeleccionado.checked;

    console.log('📍 Cambio en punto de inicio:', usarGps ? 'GPS' : 'Seleccionado');

    // Habilitar/deshabilitar el selector según la opción
    selectInicio.disabled = usarGps;

    // Actualizar el estado del botón de iniciar
    if (usarGps) {
        // Si usa GPS, solo necesita que esté disponible la ubicación
        btnIniciar.disabled = false;
        btnIniciar.classList.remove('disabled');
        btnIniciar.innerHTML = `🧭 Navegar al Edificio ${edificioDestino} (GPS)`;
    } else {
        // Si usa punto seleccionado, necesita que esté seleccionado algo
        const valorSeleccionado = selectInicio.value;
        if (valorSeleccionado) {
            btnIniciar.disabled = false;
            btnIniciar.classList.remove('disabled');
            const opcionSeleccionada = selectInicio.options[selectInicio.selectedIndex];
            const ruta = opcionSeleccionada.dataset.ruta || opcionSeleccionada.dataset.conecta;
            btnIniciar.innerHTML = `🧭 Navegar al Edificio ${edificioDestino} (${ruta || 'Seleccionado'})`;
        } else {
            btnIniciar.disabled = true;
            btnIniciar.classList.add('disabled');
            btnIniciar.innerHTML = `🧭 Navegar al Edificio ${edificioDestino}`;
        }
    }
}

/**
 * Maneja el cambio en el selector de ubicación inicial
 */
function manejarCambioInicio() {
    const selectInicio = document.getElementById('selectInicio');
    const btnIniciar = document.getElementById('btnIniciarNavegacion');

    if (!selectInicio || !btnIniciar) {
        console.error('❌ Elementos del selector no encontrados');
        return;
    }

    const valorSeleccionado = selectInicio.value;
    const opcionSeleccionada = selectInicio.options[selectInicio.selectedIndex];

    if (valorSeleccionado) {
        // Habilitar el botón de iniciar navegación
        btnIniciar.disabled = false;
        btnIniciar.classList.remove('disabled');

        // Obtener información de la opción seleccionada
        const coords = opcionSeleccionada.dataset.coords ? JSON.parse(opcionSeleccionada.dataset.coords) : null;
        const ruta = opcionSeleccionada.dataset.ruta || opcionSeleccionada.dataset.conecta;

        console.log('📍 Ubicación inicial seleccionada:', {
            nombre: opcionSeleccionada.textContent,
            valor: valorSeleccionado,
            coordenadas: coords,
            ruta: ruta
        });

        // Actualizar el texto del botón con la información de la ruta
        if (ruta) {
            btnIniciar.innerHTML = `🧭 Navegar al Edificio ${edificioDestino} (${ruta})`;
        } else {
            btnIniciar.innerHTML = `🧭 Navegar al Edificio ${edificioDestino}`;
        }

        // Mostrar información adicional si es un acceso
        if (valorSeleccionado.startsWith('acceso_')) {
            console.log('🚪 Acceso principal seleccionado:', valorSeleccionado);
        } else if (valorSeleccionado.startsWith('edificio_')) {
            console.log('🏢 Edificio accesible seleccionado:', valorSeleccionado);
        }

    } else {
        // Deshabilitar el botón si no hay selección
        btnIniciar.disabled = true;
        btnIniciar.classList.add('disabled');
        btnIniciar.innerHTML = `🧭 Navegar al Edificio ${edificioDestino}`;

        console.log('📍 Ninguna ubicación inicial seleccionada');
    }
}

/**
 * Configura todos los event listeners del modal
 */
function configurarEventListeners() {
    // Botón cerrar modal
    const btnCerrar = document.getElementById('cerrarModalAccesibilidad');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarModalAccesibilidad);
    }

    // Botones de respuesta (Sí/No)
    const btnSi = document.getElementById('btnSiAccesibilidad');
    const btnNo = document.getElementById('btnNoAccesibilidad');

    if (btnSi) {
        btnSi.addEventListener('click', () => manejarRespuestaAccesibilidad(true));
    }

    if (btnNo) {
        btnNo.addEventListener('click', () => manejarRespuestaAccesibilidad(false));
    }

    // Selector de ubicación inicial
    const selectInicio = document.getElementById('selectInicio');
    if (selectInicio) {
        selectInicio.addEventListener('change', manejarCambioInicio);
    }

    // Radio buttons de punto de inicio
    const radioGps = document.getElementById('radioGps');
    const radioSeleccionado = document.getElementById('radioSeleccionado');

    if (radioGps) {
        radioGps.addEventListener('change', manejarCambioPuntoInicio);
    }

    if (radioSeleccionado) {
        radioSeleccionado.addEventListener('change', manejarCambioPuntoInicio);
    }

    // Botones de acción
    const btnIniciar = document.getElementById('btnIniciarNavegacion');
    const btnCancelar = document.getElementById('btnCancelarNavegacion');

    if (btnIniciar) {
        btnIniciar.addEventListener('click', iniciarNavegacionAccesible);
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', cerrarModalAccesibilidad);
    }

    // Cerrar modal al hacer clic fuera
    if (modalAccesibilidad) {
        modalAccesibilidad.addEventListener('click', (e) => {
            if (e.target === modalAccesibilidad) {
                cerrarModalAccesibilidad();
            }
        });
    }

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalAccesibilidad && modalAccesibilidad.classList.contains('show')) {
            cerrarModalAccesibilidad();
        }
    });

    console.log('✅ Event listeners configurados');
}

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Muestra el modal de accesibilidad
 * @param {number} edificioId - ID del edificio de destino
 */
function mostrarModalAccesibilidad(edificioId) {
    console.log('🔍 Mostrando modal de accesibilidad para edificio:', edificioId);

    // Verificar que el sistema esté inicializado
    if (!modalAccesibilidad) {
        console.error('❌ Modal de accesibilidad no está inicializado');
        return false;
    }

    // Verificar si estamos en una página sin mapa
    const mapContainer = document.getElementById('map') || document.getElementById('mapa');
    if (!mapContainer) {
        console.log('📱 Página sin mapa detectada, preparando redirección...');
    }

    // Guardar el edificio de destino
    edificioDestino = edificioId;

    // Resetear el estado del modal
    resetearModalAccesibilidad();

    // Mostrar el modal
    modalAccesibilidad.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Enfocar el primer botón para accesibilidad
    setTimeout(() => {
        const btnSi = document.getElementById('btnSiAccesibilidad');
        if (btnSi) btnSi.focus();
    }, 300);

    console.log('✅ Modal de accesibilidad mostrado');
    return true;
}

/**
 * Maneja la respuesta del usuario sobre discapacidad de movilidad
 * @param {boolean} tieneDiscapacidad - true si tiene discapacidad, false si no
 */
function manejarRespuestaAccesibilidad(tieneDiscapacidad) {
    console.log('👤 Usuario respondió sobre discapacidad:', tieneDiscapacidad ? 'SÍ' : 'NO');

    if (tieneDiscapacidad) {
        // UX MEJORADA: Intentar GPS automáticamente
        iniciarGPSAutomatico();
    } else {
        // Cerrar modal de accesibilidad
        cerrarModalAccesibilidad();
        console.log('📍 Iniciando navegación normal...');
        // Si responde NO, simplemente cerramos y dejamos que use el mapa normal
        // Opcional: Mostrar aviso de GPS normal si se desea
        const avisoModal = document.getElementById('avisoModal');
        if (avisoModal) avisoModal.style.display = 'block';
    }
}

/**
 * Intenta iniciar navegación por GPS automáticamente
 * Si falla, muestra la selección manual
 */
async function iniciarGPSAutomatico() {
    const preguntaAccesibilidad = document.getElementById('preguntaAccesibilidad');
    const controlesNavegacion = document.getElementById('controlesNavegacion');
    const estadoGps = document.getElementById('estadoGps');

    // Ocultar pregunta inicial
    if (preguntaAccesibilidad) preguntaAccesibilidad.style.display = 'none';

    // Mostrar estado de carga GPS
    if (controlesNavegacion) controlesNavegacion.style.display = 'block';
    if (estadoGps) {
        estadoGps.style.display = 'flex';
        estadoGps.innerHTML = `
            <div class="indicador-carga">
                <div class="spinner-gps"></div>
                <span>📍 Detectando tu ubicación...</span>
            </div>
        `;
    }

    console.log('🛰️ Iniciando auto-detección de GPS...');

    if (!navigator.geolocation) {
        console.error('❌ Geolocalización no soportada');
        mostrarSeleccionManual('Tu navegador no soporta GPS. Por favor selecciona un punto de inicio.');
        return;
    }

    try {
        const posicion = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 0
            });
        });

        console.log('✅ GPS detectado:', posicion.coords);

        // GPS Éxito -> Redirección inmediata
        if (estadoGps) {
            estadoGps.innerHTML = `
                <div class="indicador-exito">
                    <span>✅ ¡Ubicación detectada! Iniciando ruta...</span>
                </div>
            `;
        }

        setTimeout(() => {
            redirigirNavegacionGPS(posicion.coords.latitude, posicion.coords.longitude);
        }, 1000);

    } catch (error) {
        console.warn('⚠️ Fallo auto-GPS:', error.message);
        mostrarSeleccionManual('No pudimos detectar tu ubicación automáticamente. Por favor selecciónala manualmente.');
    }
}

/**
 * Muestra la interfaz de selección manual cuando falla el GPS
 */
function mostrarSeleccionManual(mensajeError = null) {
    const estadoGps = document.getElementById('estadoGps');
    const selectorInicio = document.querySelector('.selector-inicio');
    const opcionesPuntoInicio = document.querySelector('.opciones-punto-inicio');
    const botonesAccion = document.querySelector('.botones-accion');
    const radioSeleccionado = document.getElementById('radioSeleccionado');

    // Ocultar spinner GPS
    if (estadoGps) estadoGps.style.display = 'none';

    // Mostrar mensaje de error si existe
    if (mensajeError) {
        console.log('Mostrando fallback manual:', mensajeError);

        // Crear o actualizar alerta visual
        let alertaError = document.getElementById('alertaErrorGps');
        if (!alertaError) {
            alertaError = document.createElement('div');
            alertaError.id = 'alertaErrorGps';
            alertaError.style.cssText = `
                background-color: #f8d7da;
                color: #721c24;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                border: 1px solid #f5c6cb;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: fadeIn 0.5s;
            `;
            // Insertar antes del selector
            if (selectorInicio) {
                selectorInicio.parentNode.insertBefore(alertaError, selectorInicio);
            }
        }

        alertaError.innerHTML = `<span>⚠️ ${mensajeError}</span>`;
        alertaError.style.display = 'flex';
    }

    // Mostrar controles manuales
    if (selectorInicio) selectorInicio.style.display = 'block';
    if (opcionesPuntoInicio) opcionesPuntoInicio.style.display = 'block';
    if (botonesAccion) botonesAccion.style.display = 'flex';

    // Seleccionar automáticamente la opción manual
    if (radioSeleccionado) {
        radioSeleccionado.click();
    }

    // Poblar dropdown si está vacío
    poblarDropdownUbicacionInicial();
}

/**
 * Redirige a la página de ruta con coordenadas
 */
function redirigirNavegacionGPS(lat, lng) {
    if (!edificioDestino) return;
    const url = `ruta_accesible.html?origen=gps&coords=${lat},${lng}&destino=${edificioDestino}`;
    console.log('🚀 Redirigiendo a:', url);
    window.location.href = url;
}

/**
 * Inicia la navegación normal para usuarios sin discapacidad
 */
function iniciarNavegacionNormal() {
    console.log('🚀 Iniciando navegación normal...');

    // Verificar que tenemos el edificio de destino
    if (!edificioDestino) {
        console.error('❌ No hay edificio de destino definido');
        return;
    }

    // Mostrar modal de aviso de GPS
    const avisoModal = document.getElementById('avisoModal');
    if (avisoModal) {
        avisoModal.style.display = 'block';

        // Configurar el botón continuar para iniciar navegación
        const continuarBtn = document.getElementById('continuarBtn');
        if (continuarBtn) {
            continuarBtn.onclick = () => {
                avisoModal.style.display = 'none';
                iniciarNavegacionConMapa();
            };
        }
    } else {
        // Si no hay modal de aviso, iniciar directamente
        iniciarNavegacionConMapa();
    }
}

/**
 * Inicia la navegación con mapa para usuarios normales
 */
function iniciarNavegacionConMapa() {
    console.log('🗺️ Iniciando navegación con mapa...');

    // Mostrar el mapa emergente
    const mapaEmergente = document.getElementById('mapaEmergente');
    if (mapaEmergente) {
        mapaEmergente.style.display = 'block';

        // Inicializar el mapa después de un pequeño delay
        setTimeout(() => {
            inicializarMapaNormal();
        }, 100);
    } else {
        console.log('📱 No hay mapa emergente en esta página, redirigiendo al mapa principal...');

        // Mostrar mensaje al usuario antes de redirigir
        const mensaje = document.createElement('div');
        mensaje.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #2196F3;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        mensaje.innerHTML = `
            <h3>🗺️ Redirigiendo al Mapa Principal</h3>
            <p>Para iniciar la navegación, necesitamos ir a la página del mapa.</p>
            <div style="margin-top: 15px;">
                <div class="spinner" style="display: inline-block; width: 20px; height: 20px; border: 2px solid #ffffff; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
            </div>
            <style>
                @keyframes spin { to { transform: rotate(360deg); } }
            </style>
        `;
        document.body.appendChild(mensaje);

        // Redirigir después de mostrar el mensaje
        setTimeout(() => {
            const edificioInfo = obtenerInfoEdificio(edificioDestino);
            if (edificioInfo && edificioInfo.coords) {
                const coords = edificioInfo.coords.join(',');
                window.location.href = `index.html?edificio=${edificioDestino}&coords=${coords}&navegacion=normal`;
            } else {
                window.location.href = `index.html?edificio=${edificioDestino}&navegacion=normal`;
            }
        }, 2000);
    }
}

/**
 * Inicializa el mapa para navegación normal
 */
function inicializarMapaNormal() {
    console.log('🗺️ Inicializando mapa normal...');

    // Verificar que el contenedor del mapa existe (mapaEmergente se crea dinámicamente)
    const mapaEmergente = document.getElementById('mapaEmergente');
    const mapContainer = document.getElementById('mapa');

    if (!mapaEmergente || !mapContainer) {
        console.error('❌ Contenedor del mapa no encontrado');
        return;
    }

    // Mostrar el mapa emergente normal
    mapaEmergente.style.display = 'block';
    mapaEmergente.style.zIndex = '1000'; // Z-index menor que el mapa accesible

    // Obtener información del edificio de destino
    const edificioInfo = obtenerInfoEdificio(edificioDestino);
    if (!edificioInfo) {
        console.error('❌ No se pudo obtener información del edificio:', edificioDestino);
        return;
    }

    // Usar el mapa existente si está disponible, o crear uno nuevo
    let mapa;
    if (typeof window.map !== 'undefined' && window.map) {
        mapa = window.map;
        console.log('✅ Usando mapa existente');
    } else {
        // Usar el mapa global existente
        mapa = obtenerMapaGlobal();
        if (!mapa) {
            console.error('❌ No se pudo obtener el mapa global');
            return;
        }

        console.log('✅ Usando mapa global para navegación normal');
    }

    // Marcador del destino
    const marcadorDestino = L.marker(edificioInfo.coords).addTo(mapa)
        .bindPopup(`<b>${edificioInfo.nombre}</b>`).openPopup();

    // Icono personalizado para el usuario
    const iconoUsuario = L.icon({
        iconUrl: 'Icon/user.png',
        iconSize: [27, 35],
        iconAnchor: [12, 39],
        popupAnchor: [1, -34]
    });

    // Opciones para el seguimiento de ubicación
    const opcionesSeguimiento = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    function exitoUbicacion(pos) {
        const latitudUsuario = pos.coords.latitude;
        const longitudUsuario = pos.coords.longitude;

        // Crear o actualizar marcador de usuario
        if (window.marcadorUsuario) {
            window.marcadorUsuario.setLatLng([latitudUsuario, longitudUsuario]);
        } else {
            window.marcadorUsuario = L.marker([latitudUsuario, longitudUsuario], { icon: iconoUsuario })
                .addTo(mapa)
                .bindPopup('Tu ubicación actual').openPopup();
        }

        // Centrar mapa en la ubicación del usuario
        mapa.panTo(new L.LatLng(latitudUsuario, longitudUsuario));

        // Calcular distancia al destino
        const distancia = calcularDistanciaHaversine(
            latitudUsuario, longitudUsuario,
            edificioInfo.coords[0], edificioInfo.coords[1]
        );

        // Actualizar información de distancia
        const distanciaElement = document.getElementById('distanciaEnMapa');
        if (distanciaElement) {
            distanciaElement.innerHTML = `<b>Distancia Restante: ${Math.round(distancia)} Metros</b>`;
        }

        // Verificar llegada (menos de 10 metros)
        if (distancia <= 10 && !window.llegadaNotificada) {
            window.llegadaNotificada = true;

            // Reproducir sonido de llegada si está disponible
            const sonido = document.getElementById('notificacionLlegada');
            if (sonido) {
                sonido.play();
            }

            // Mostrar modal de llegada
            const llegadaModal = document.getElementById('llegadaModal');
            if (llegadaModal) {
                llegadaModal.style.display = 'block';
            } else {
                alert('🎉 ¡Has llegado a tu destino!');
            }
        }
    }

    function errorUbicacion(err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
        alert('No se pudo obtener la ubicación.');
    }

    // Iniciar seguimiento de ubicación
    window.watchIdUbicacion = navigator.geolocation.watchPosition(exitoUbicacion, errorUbicacion, opcionesSeguimiento);

    // Ajustar tamaño del mapa
    setTimeout(() => {
        mapa.invalidateSize();
    }, 100);

    console.log('✅ Mapa normal inicializado correctamente');
}

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * Esta función se reutiliza desde navegacion.js para evitar duplicación
 */

/**
 * Muestra la información de limitaciones y edificios accesibles
 */
function mostrarInfoLimitaciones() {
    const infoLimitaciones = document.getElementById('infoLimitaciones');
    const controlesNavegacion = document.getElementById('controlesNavegacion');

    if (infoLimitaciones) {
        infoLimitaciones.classList.add('show');

        // Mostrar controles de navegación después de un delay
        setTimeout(() => {
            if (controlesNavegacion) {
                controlesNavegacion.classList.add('show');
                poblarDropdownUbicacionInicial();

                // Iniciar proceso de GPS automáticamente
                mostrarIndicadorGPS();

                // Intentar obtener GPS
                obtenerUbicacionGPS()
                    .then(ubicacion => {
                        console.log('✅ GPS obtenido en modal:', ubicacion);
                        ubicacionUsuario = ubicacion;
                        mostrarExitoGPS(ubicacion);

                        // Habilitar navegación después de obtener GPS
                        setTimeout(() => {
                            if (typeof window.habilitarNavegacion === 'function') {
                                window.habilitarNavegacion(edificioDestino);
                            } else {
                                // Fallback: habilitar botón manualmente
                                const btnIniciar = document.getElementById('btnIniciarNavegacion');
                                if (btnIniciar) {
                                    btnIniciar.disabled = false;
                                    btnIniciar.textContent = `🧭 Navegar desde tu ubicación al Edificio ${edificioDestino}`;
                                }
                            }
                        }, 500);
                    })
                    .catch(error => {
                        console.log('❌ GPS falló en modal:', error);
                        mostrarErrorGPS();
                        mostrarSelectorManual();
                    });
            }
        }, 500);
    }
}

/**
 * Llena la lista visual de edificios accesibles
 */
function llenarListaEdificiosAccesibles() {
    const listaEdificios = document.getElementById('listaEdificiosAccesibles');
    if (!listaEdificios || !sistemaNavegacionAccesible) {
        console.error('❌ No se puede llenar la lista de edificios');
        return;
    }

    // Limpiar lista
    listaEdificios.innerHTML = '';

    // Agregar cada edificio accesible
    sistemaNavegacionAccesible.edificiosAccesibles.forEach(edificioId => {
        const edificioItem = document.createElement('div');
        edificioItem.className = 'edificio-item';
        edificioItem.textContent = edificioId;
        edificioItem.setAttribute('data-edificio', edificioId);

        // Agregar información del edificio como tooltip
        const infoEdificio = obtenerInfoEdificio(edificioId);
        if (infoEdificio) {
            edificioItem.title = `Edificio ${edificioId} - ${infoEdificio.nombreRuta}`;
        }

        // Event listener para selección visual
        edificioItem.addEventListener('click', () => {
            // Remover selección anterior
            document.querySelectorAll('.edificio-item.seleccionado').forEach(item => {
                item.classList.remove('seleccionado');
            });

            // Seleccionar este edificio
            edificioItem.classList.add('seleccionado');

            // Actualizar selector de destino
            const selectDestino = document.getElementById('selectDestino');
            if (selectDestino) {
                selectDestino.value = edificioId;
                manejarCambioDestino();
            }
        });

        listaEdificios.appendChild(edificioItem);
    });

    console.log('✅ Lista de edificios accesibles llenada');
}

/**
 * Muestra el mapa con ruta específica desde acceso visitantes al edificio 36
 */
function mostrarMapaConRutaEspecifica() {
    console.log('🗺️ Mostrando mapa con ruta específica...');

    // Verificar que tenemos el edificio de destino
    if (!edificioDestino) {
        console.error('❌ No hay edificio de destino definido');
        return;
    }

    // Buscar el contenedor del mapa
    let mapContainer = document.getElementById('mapa') || document.getElementById('map');
    let mapaEmergente = document.getElementById('mapaEmergente');

    if (!mapContainer) {
        console.error('❌ Contenedor del mapa no encontrado');
        return;
    }

    // Si hay un mapa emergente, mostrarlo
    if (mapaEmergente) {
        console.log('📱 Mostrando mapa emergente...');
        mapaEmergente.style.display = 'block';
        mapaEmergente.style.zIndex = '10000';
        document.body.style.overflow = 'hidden';

        // Asegurar que el contenedor del mapa esté visible
        mapContainer.style.width = '100%';
        mapContainer.style.height = '85%';
        mapContainer.style.display = 'block';
    }

    // Obtener información del edificio de destino
    const edificioInfo = obtenerInfoEdificio(edificioDestino);
    if (!edificioInfo) {
        console.error('❌ No se pudo obtener información del edificio:', edificioDestino);
        return;
    }

    // Crear el mapa
    let mapa;
    if (typeof window.map !== 'undefined' && window.map) {
        // Limpiar mapa existente
        window.map.remove();
    }

    // Usar el mapa global existente
    mapa = obtenerMapaGlobal();
    if (!mapa) {
        console.error('❌ No se pudo obtener el mapa global para mapa accesible');
        return;
    }

    console.log('✅ Usando mapa global para mapa accesible');

    // Limpiar marcadores anteriores
    limpiarMarcadoresMapa();

    // Guardar referencia global
    window.map = mapa;

    // Obtener coordenadas del acceso visitantes
    const accesoVisitantes = {
        coords: [19.068467599492795, -98.17061388514823],
        nombre: 'Acceso Visitantes'
    };

    // Agregar marcador del destino
    const marcadorDestino = L.marker(edificioInfo.coords).addTo(mapa)
        .bindPopup(`<b>${edificioInfo.nombre}</b><br>Destino`)
        .openPopup();

    // Agregar marcador del punto de inicio
    const marcadorInicio = L.marker(accesoVisitantes.coords).addTo(mapa)
        .bindPopup(`<b>${accesoVisitantes.nombre}</b><br>Punto de inicio`)
        .openPopup();

    // Calcular y dibujar ruta específica
    calcularRutaEspecifica(accesoVisitantes.coords, edificioInfo.coords, mapa);

    // Configurar botón de cerrar si existe
    const cerrarMapaBtn = document.getElementById('cerrarMapaBtn');
    if (cerrarMapaBtn) {
        cerrarMapaBtn.onclick = () => {
            if (mapaEmergente) {
                mapaEmergente.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            if (mapa) {
                mapa.remove();
                window.map = null;
            }
        };
    }

    console.log('✅ Mapa con ruta específica mostrado');
}

/**
 * Calcula y dibuja la ruta específica entre dos puntos
 * @param {Array} puntoInicio - Coordenadas de inicio [lat, lng]
 * @param {Array} puntoDestino - Coordenadas de destino [lat, lng]
 * @param {L.Map} mapa - Instancia del mapa Leaflet
 */
function calcularRutaEspecifica(puntoInicio, puntoDestino, mapa) {
    console.log('🧭 Calculando ruta específica...');

    // Crear una ruta simple y directa
    const ruta = [
        { id: 'inicio', coords: puntoInicio },
        { id: 'intermedio_1', coords: [19.0685, -98.1705] },
        { id: 'intermedio_2', coords: [19.0683, -98.1704] },
        { id: 'destino', coords: puntoDestino }
    ];

    // Dibujar la ruta
    const coordenadasRuta = ruta.map(punto => punto.coords);

    // Dibujar línea de la ruta
    L.polyline(coordenadasRuta, {
        color: '#e74c3c',
        weight: 5,
        opacity: 0.8,
        dashArray: '10, 5'
    }).addTo(mapa);

    // Marcar inicio y fin
    L.marker(puntoInicio, {
        icon: L.divIcon({
            className: 'marcador-inicio',
            html: '<div style="background: #27ae60; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold;">I</div>',
            iconSize: [20, 20]
        })
    }).addTo(mapa).bindTooltip('Inicio de ruta');

    L.marker(puntoDestino, {
        icon: L.divIcon({
            className: 'marcador-fin',
            html: '<div style="background: #e74c3c; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold;">F</div>',
            iconSize: [20, 20]
        })
    }).addTo(mapa).bindTooltip('Fin de ruta');

    // Calcular distancia total
    let distanciaTotal = 0;
    for (let i = 0; i < coordenadasRuta.length - 1; i++) {
        const distancia = calcularDistanciaHaversine(
            coordenadasRuta[i][0], coordenadasRuta[i][1],
            coordenadasRuta[i + 1][0], coordenadasRuta[i + 1][1]
        );
        distanciaTotal += distancia;
    }

    // Mostrar información de la ruta
    const infoElement = document.getElementById('distanciaEnMapa');
    if (infoElement) {
        infoElement.innerHTML = `<b>Distancia Total: ${Math.round(distanciaTotal)} metros</b>`;
    }

    console.log(`✅ Ruta específica calculada: ${Math.round(distanciaTotal)} metros`);
}

/**
 * Llena el selector de destino con los edificios accesibles
 */
function llenarSelectorDestino() {
    const selectDestino = document.getElementById('selectDestino');
    if (!selectDestino || !sistemaNavegacionAccesible) {
        console.error('❌ No se puede llenar el selector de destino');
        return;
    }

    // Limpiar opciones (excepto la primera)
    selectDestino.innerHTML = '<option value="">-- Selecciona un edificio --</option>';

    // Agregar cada edificio accesible
    sistemaNavegacionAccesible.edificiosAccesibles.forEach(edificioId => {
        const infoEdificio = obtenerInfoEdificio(edificioId);
        const option = document.createElement('option');
        option.value = edificioId;

        if (infoEdificio) {
            option.textContent = `Edificio ${edificioId} - ${infoEdificio.nombreRuta}`;
        } else {
            option.textContent = `Edificio ${edificioId}`;
        }

        selectDestino.appendChild(option);
    });

    console.log('✅ Selector de destino llenado');
}

/**
 * Maneja el cambio en el selector de ubicación inicial
 * Esta función se reutiliza desde navegacion.js para evitar duplicación
 */

/**
 * Inicia la navegación accesible
 */
async function iniciarNavegacionAccesible() {
    const selectInicio = document.getElementById('selectInicio');
    const radioGps = document.getElementById('radioGps');
    const usarGps = radioGps && radioGps.checked;

    if (!usarGps && (!selectInicio || !selectInicio.value)) {
        console.error('❌ No hay ubicación inicial seleccionada (y no es GPS)');
        return;
    }

    const inicio = selectInicio ? selectInicio.value : '';
    const destino = edificioDestino; // El destino ya está definido por el click

    console.log('🧭 Iniciando navegación accesible desde:', inicio, 'hacia edificio:', destino);

    // Cerrar el modal
    cerrarModalAccesibilidad();

    // Determinar qué opción de punto de inicio está seleccionada
    // const radioGps ya fue declarado arriba
    const radioSeleccionado = document.getElementById('radioSeleccionado');
    // usarGps ya calculado arriba


    console.log('📍 Opción de punto de inicio seleccionada:', usarGps ? 'GPS' : 'Punto seleccionado');

    // Obtener coordenadas del punto de inicio según la opción seleccionada
    let coordsInicio = null;

    if (usarGps) {
        // Usar ubicación GPS actual
        if (ubicacionUsuario && ubicacionUsuario.coords) {
            coordsInicio = ubicacionUsuario.coords;
            console.log('📍 Usando ubicación GPS actual:', coordsInicio);
        } else {
            console.warn('⚠️ GPS no disponible, intentando obtener ubicación...');
            // Intentar obtener ubicación GPS
            try {
                const posicion = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    });
                });
                coordsInicio = [posicion.coords.latitude, posicion.coords.longitude];
                console.log('✅ Ubicación GPS obtenida:', coordsInicio);
            } catch (error) {
                console.error('❌ Error al obtener ubicación GPS:', error);
                // Fallback al punto seleccionado
                console.log('🔄 Fallback: usando punto seleccionado');
                if (inicio.startsWith('acceso_')) {
                    coordsInicio = obtenerCoordenadasAcceso(inicio);
                } else if (inicio.startsWith('edificio_')) {
                    try {
                        const edificioInfo = await obtenerInfoEdificio(parseInt(inicio.replace('edificio_', '')));
                        if (edificioInfo && edificioInfo.coords) {
                            coordsInicio = edificioInfo.coords;
                        }
                    } catch (error) {
                        console.error('❌ Error al obtener coordenadas del edificio:', error);
                    }
                }
            }
        }
    } else {
        // Usar punto seleccionado en el dropdown
        if (inicio.startsWith('acceso_')) {
            coordsInicio = obtenerCoordenadasAcceso(inicio);
            console.log('🚪 Usando coordenadas del acceso:', inicio, coordsInicio);
        } else if (inicio.startsWith('edificio_')) {
            try {
                const edificioInfo = await obtenerInfoEdificio(parseInt(inicio.replace('edificio_', '')));
                if (edificioInfo && edificioInfo.coords) {
                    coordsInicio = edificioInfo.coords;
                    console.log('✅ Coordenadas del edificio de inicio obtenidas:', coordsInicio);
                }
            } catch (error) {
                console.error('❌ Error al obtener coordenadas del edificio de inicio:', error);
            }
        } else {
            console.warn('⚠️ No se seleccionó un punto válido, usando GPS como fallback');
            if (ubicacionUsuario && ubicacionUsuario.coords) {
                coordsInicio = ubicacionUsuario.coords;
            }
        }
    }

    // Redirigir a la página dedicada de ruta accesible
    const params = new URLSearchParams();
    params.append('destino', destino);

    // Configurar parámetros según el tipo de origen
    if (usarGps && coordsInicio) {
        params.append('origen', 'gps');
        params.append('origenTipo', 'gps');
        params.append('coords', `${coordsInicio[0]},${coordsInicio[1]}`);
    } else {
        params.append('origen', inicio);
        params.append('origenTipo', 'seleccion');
    }

    console.log('🚀 Redirigiendo a ruta accesible:', params.toString());

    // Redirección
    setTimeout(() => {
        window.location.href = `ruta_accesible.html?${params.toString()}`;
    }, 100);

    console.log('✅ Navegación accesible iniciada');
}

/**
 * Inicializa el mapa para navegación accesible
 */
function inicializarMapaAccesible(destino, inicio) {
    console.log('🗺️ Inicializando mapa accesible...');

    // Usar el mapa principal existente o crear uno nuevo
    let mapa = window.map;
    if (!mapa) {
        console.log('⚠️ Mapa principal no encontrado, creando mapa temporal...');

        // Verificar si hay un contenedor de mapa en la página
        let mapContainer = document.getElementById('map') || document.getElementById('mapa');
        if (!mapContainer) {
            console.log('📱 No hay contenedor de mapa en esta página...');

            // Verificar si hay un mapa temporal disponible
            const mapaTemporal = document.getElementById('mapa-temporal');
            console.log('🔍 Debug - Buscando mapa temporal:', mapaTemporal);

            if (mapaTemporal) {
                console.log('✅ Usando mapa temporal disponible');
                mapContainer = document.getElementById('map');
                console.log('🔍 Debug - Contenedor del mapa encontrado:', mapContainer);

                // Mostrar el mapa temporal inmediatamente
                mapaTemporal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                console.log('✅ Mapa temporal mostrado');
                console.log('🔍 Debug - Estado del modal:', {
                    display: mapaTemporal.style.display,
                    visibility: getComputedStyle(mapaTemporal).visibility,
                    zIndex: getComputedStyle(mapaTemporal).zIndex
                });
            } else {
                console.log('❌ No hay mapa temporal disponible, redirigiendo al mapa principal...');

                // Mostrar mensaje al usuario antes de redirigir
                const mensaje = document.createElement('div');
                mensaje.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #4CAF50;
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    z-index: 10000;
                    text-align: center;
                    font-family: Arial, sans-serif;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                `;
                mensaje.innerHTML = `
                    <h3>🗺️ Redirigiendo al Mapa Principal</h3>
                    <p>Para mostrar las rutas accesibles, necesitamos ir a la página del mapa.</p>
                    <div style="margin-top: 15px;">
                        <div class="spinner" style="display: inline-block; width: 20px; height: 20px; border: 2px solid #ffffff; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
                    </div>
                    <style>
                        @keyframes spin { to { transform: rotate(360deg); } }
                    </style>
                `;
                document.body.appendChild(mensaje);

                // Redirigir después de mostrar el mensaje
                setTimeout(() => {
                    const edificioInfo = obtenerInfoEdificio(destino);
                    if (edificioInfo && edificioInfo.coords) {
                        const coords = edificioInfo.coords.join(',');
                        window.location.href = `index.html?edificio=${destino}&coords=${coords}&navegacion=accesible&inicio=${inicio}`;
                    } else {
                        window.location.href = `index.html?edificio=${destino}&navegacion=accesible&inicio=${inicio}`;
                    }
                }, 2000);
                return;
            }
        }

        // Usar el mapa global existente
        if (mapContainer) {
            mapa = obtenerMapaGlobal();
            if (!mapa) {
                console.error('❌ No se pudo obtener el mapa global para navegación');
                return;
            }

            console.log('✅ Usando mapa global para navegación');

            // Limpiar marcadores anteriores
            limpiarMarcadoresMapa();

            // Guardar referencia global
            window.map = mapa;
            console.log('✅ Mapa temporal creado');
        }
    }

    // Obtener información del edificio de destino
    const edificioInfo = obtenerInfoEdificio(destino);
    if (!edificioInfo) {
        console.error('❌ No se pudo obtener información del edificio:', destino);
        return;
    }

    // Limpiar el mapa antes de dibujar las rutas
    if (window.layerGroupRutas) {
        window.map.removeLayer(window.layerGroupRutas);
    }
    window.layerGroupRutas = L.layerGroup().addTo(window.map);

    // Agregar capa de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Dibujar todas las rutas accesibles
    dibujarRutasAccesibles(mapa);

    // Marcador del destino
    const marcadorDestino = L.marker(edificioInfo.coords).addTo(mapa)
        .bindPopup(`<b>${edificioInfo.nombre}</b>`).openPopup();

    // Si hay ubicación GPS disponible, mostrar marcador de usuario
    if (ubicacionUsuario) {
        const iconoUsuario = L.icon({
            iconUrl: 'Icon/user.png',
            iconSize: [27, 35],
            iconAnchor: [12, 39],
            popupAnchor: [1, -34]
        });

        const marcadorUsuario = L.marker([ubicacionUsuario.lat, ubicacionUsuario.lng], { icon: iconoUsuario })
            .addTo(mapa)
            .bindPopup('Tu ubicación actual').openPopup();

        // Centrar mapa en la ubicación del usuario
        mapa.panTo([ubicacionUsuario.lat, ubicacionUsuario.lng]);

        // Calcular distancia al destino
        const distancia = calcularDistanciaHaversine(
            ubicacionUsuario.lat, ubicacionUsuario.lng,
            edificioInfo.coords[0], edificioInfo.coords[1]
        );

        // Actualizar información de distancia
        const distanciaElement = document.getElementById('distanciaEnMapa');
        if (distanciaElement) {
            distanciaElement.innerHTML = `<b>Distancia Restante: ${Math.round(distancia)} Metros</b>`;
        }

        // Iniciar seguimiento de ubicación
        iniciarSeguimientoUbicacionAccesible(mapa, edificioInfo);
    } else {
        // Si no hay GPS, mostrar solo el destino
        mapa.setView(edificioInfo.coords, 19);

        // Mostrar mensaje de que se necesita GPS
        const distanciaElement = document.getElementById('distanciaEnMapa');
        if (distanciaElement) {
            distanciaElement.innerHTML = `<b>Activa tu GPS para ver la distancia en tiempo real</b>`;
        }
    }

    // Ajustar tamaño del mapa
    setTimeout(() => {
        mapa.invalidateSize();
    }, 100);

    console.log('✅ Mapa accesible inicializado correctamente');
}

/**
 * Dibuja todas las rutas accesibles en el mapa
 */
function dibujarRutasAccesibles(mapa) {
    console.log('🛤️ Dibujando rutas accesibles...');

    if (!sistemaNavegacionAccesible || !sistemaNavegacionAccesible.rutas) {
        console.warn('⚠️ Sistema de rutas accesibles no disponible');
        return;
    }

    // Dibujar cada ruta
    Object.values(sistemaNavegacionAccesible.rutas).forEach(ruta => {
        dibujarRutaIndividual(mapa, ruta);
    });

    console.log('✅ Rutas accesibles dibujadas');
}

/**
 * Dibuja una ruta individual en el mapa
 */
function dibujarRutaIndividual(mapa, ruta) {
    if (!ruta.nodos || ruta.nodos.length < 2) {
        console.warn(`⚠️ Ruta ${ruta.id} no tiene suficientes nodos`);
        return;
    }

    // Crear array de coordenadas para la polyline
    const coordenadas = ruta.nodos.map(nodo => [nodo.coords[0], nodo.coords[1]]);

    // Crear la polyline con el color de la ruta
    const polyline = L.polyline(coordenadas, {
        color: ruta.color,
        weight: 6,
        opacity: 0.8,
        smoothFactor: 1
    });

    // Agregar al layerGroup si existe, sino al mapa directamente
    if (window.layerGroupRutas) {
        polyline.addTo(window.layerGroupRutas);
    } else {
        polyline.addTo(mapa);
    }

    // Agregar popup informativo
    polyline.bindPopup(`
        <div style="text-align: center;">
            <h4 style="color: ${ruta.color}; margin: 0 0 5px 0;">${ruta.nombre}</h4>
            <p style="margin: 0; font-size: 12px;">${ruta.descripcion}</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">
                Edificios: ${ruta.edificios.join(', ')}
            </p>
        </div>
    `);

    // Agregar marcadores en los edificios de la ruta
    ruta.edificios.forEach(edificioId => {
        const infoEdificio = obtenerInfoEdificio(edificioId);
        if (infoEdificio) {
            const marcador = L.marker(infoEdificio.coords, {
                icon: L.divIcon({
                    className: 'marcador-edificio-accesible',
                    html: `<div style="
                        background-color: ${ruta.color};
                        color: white;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        font-weight: bold;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">${edificioId}</div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            });

            // Agregar al layerGroup si existe, sino al mapa directamente
            if (window.layerGroupRutas) {
                marcador.addTo(window.layerGroupRutas);
            } else {
                marcador.addTo(mapa);
            }

            marcador.bindPopup(`
                <div style="text-align: center;">
                    <h4 style="color: ${ruta.color}; margin: 0 0 5px 0;">Edificio ${edificioId}</h4>
                    <p style="margin: 0; font-size: 12px;">${infoEdificio.nombre}</p>
                    <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">
                        Accesible por ${ruta.nombre}
                    </p>
                </div>
            `);
        }
    });

    console.log(`✅ Ruta ${ruta.nombre} dibujada con ${ruta.nodos.length} nodos`);
}

/**
 * Inicia el seguimiento de ubicación para navegación accesible
 */
function iniciarSeguimientoUbicacionAccesible(mapa, edificioInfo) {
    console.log('📍 Iniciando seguimiento de ubicación accesible...');

    // Icono personalizado para el usuario
    const iconoUsuario = L.icon({
        iconUrl: 'Icon/user.png',
        iconSize: [27, 35],
        iconAnchor: [12, 39],
        popupAnchor: [1, -34]
    });

    // Opciones para el seguimiento de ubicación
    const opcionesSeguimiento = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    function exitoUbicacion(pos) {
        // Actualizar variable global
        ubicacionUsuario = pos;
        console.log('📍 Ubicación global actualizada:', ubicacionUsuario.coords.latitude, ubicacionUsuario.coords.longitude);

        const latitudUsuario = pos.coords.latitude;
        const longitudUsuario = pos.coords.longitude;

        // Crear o actualizar marcador de usuario
        if (window.marcadorUsuario) {
            window.marcadorUsuario.setLatLng([latitudUsuario, longitudUsuario]);
        } else {
            window.marcadorUsuario = L.marker([latitudUsuario, longitudUsuario], { icon: iconoUsuario })
                .addTo(mapa)
                .bindPopup('Tu ubicación actual').openPopup();
        }

        // Centrar mapa en la ubicación del usuario
        mapa.panTo(new L.LatLng(latitudUsuario, longitudUsuario));

        // Calcular distancia al destino
        const distancia = calcularDistanciaHaversine(
            latitudUsuario, longitudUsuario,
            edificioInfo.coords[0], edificioInfo.coords[1]
        );

        // Actualizar información de distancia
        const distanciaElement = document.getElementById('distanciaEnMapa');
        if (distanciaElement) {
            distanciaElement.innerHTML = `<b>Distancia Restante: ${Math.round(distancia)} Metros</b>`;
        }

        // Verificar llegada (menos de 10 metros)
        if (distancia <= 10 && !window.llegadaNotificada) {
            window.llegadaNotificada = true;

            // Reproducir sonido de llegada si está disponible
            const sonido = document.getElementById('notificacionLlegada');
            if (sonido) {
                sonido.play();
            }

            // Mostrar modal de llegada
            const llegadaModal = document.getElementById('llegadaModal');
            if (llegadaModal) {
                llegadaModal.style.display = 'block';
            } else {
                alert('🎉 ¡Has llegado a tu destino!');
            }
        }
    }

    function errorUbicacion(err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
        // No mostrar alerta para no interrumpir la experiencia
    }

    // Iniciar seguimiento de ubicación
    window.watchIdUbicacion = navigator.geolocation.watchPosition(exitoUbicacion, errorUbicacion, opcionesSeguimiento);

    console.log('✅ Seguimiento de ubicación accesible iniciado');
}

/**
 * Cierra el modal de accesibilidad
 */
function cerrarModalAccesibilidad() {
    if (modalAccesibilidad) {
        modalAccesibilidad.classList.remove('show');
        document.body.style.overflow = '';

        // Limpiar estado
        setTimeout(() => {
            resetearModalAccesibilidad();
        }, 300);

        console.log('✅ Modal de accesibilidad cerrado');
    }
}

/**
 * Resetea el estado del modal a su estado inicial
 */
function resetearModalAccesibilidad() {
    // Ocultar secciones
    const infoLimitaciones = document.getElementById('infoLimitaciones');
    const controlesNavegacion = document.getElementById('controlesNavegacion');

    if (infoLimitaciones) {
        infoLimitaciones.classList.remove('show');
    }

    if (controlesNavegacion) {
        controlesNavegacion.classList.remove('show');
    }

    // Resetear controles
    const selectDestino = document.getElementById('selectDestino');
    const btnIniciar = document.getElementById('btnIniciarNavegacion');

    if (selectDestino) {
        selectDestino.value = '';
    }

    if (btnIniciar) {
        btnIniciar.disabled = true;
        btnIniciar.textContent = '🧭 Iniciar Navegación';
    }

    // Limpiar selecciones visuales
    document.querySelectorAll('.edificio-item.seleccionado').forEach(item => {
        item.classList.remove('seleccionado');
    });
}

// ============================================================================
// FUNCIONES AUXILIARES PARA SISTEMA HÍBRIDO
// ============================================================================

/**
 * Obtiene la ubicación GPS del usuario
 * Esta función se reutiliza desde navegacion.js para evitar duplicación
 */

/**
 * Muestra el indicador de carga GPS
 * Esta función se reutiliza desde navegacion.js para evitar duplicación
 */

/**
 * Muestra éxito en obtención de GPS
 * Esta función se reutiliza desde navegacion.js para evitar duplicación
 */

/**
 * Muestra error en obtención de GPS
 * Esta función se reutiliza desde navegacion.js para evitar duplicación
 */

/**
 * Muestra el selector manual de punto de inicio
 */
function mostrarSelectorManual() {
    const selectorInicio = document.getElementById('selectorInicio');
    if (selectorInicio) {
        selectorInicio.style.display = 'block';
        llenarSelectorInicio();
        configurarEventListenersManual();
    }
}

/**
 * Llena el selector de punto de inicio
 * Esta función se reutiliza desde navegacion.js para evitar duplicación
 */

/**
 * Configura los event listeners para el modo manual
 */
function configurarEventListenersManual() {
    const selectInicio = document.getElementById('selectInicio');
    const btnReintentar = document.getElementById('btnReintentarGps');

    if (selectInicio) {
        selectInicio.addEventListener('change', manejarCambioInicio);
    }

    if (btnReintentar) {
        btnReintentar.addEventListener('click', reintentarGPS);
    }
}

/**
 * Maneja el cambio en el selector de inicio
 */
// Función duplicada eliminada - se usa la primera versión

/**
 * Reintenta obtener la ubicación GPS
 * Esta función se reutiliza desde navegacion.js para evitar duplicación
 */

/**
 * Habilita la navegación cuando se tiene origen y destino
 * Esta función se reutiliza desde navegacion.js para evitar duplicación
 */

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Verifica si un edificio es accesible
 * @param {number} edificioId - ID del edificio
 * @returns {boolean} True si es accesible
 */
function esEdificioAccesibleParaModal(edificioId) {
    return sistemaNavegacionAccesible &&
        sistemaNavegacionAccesible.edificiosAccesibles.includes(edificioId);
}

/**
 * Obtiene información de un edificio para el modal
 * @param {number} edificioId - ID del edificio
 * @returns {Object|null} Información del edificio
 */
function obtenerInfoEdificioParaModal(edificioId) {
    if (typeof obtenerInfoEdificio === 'function') {
        return obtenerInfoEdificio(edificioId);
    }
    return null;
}

// ============================================================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================================================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    // Esperar un poco para que otros scripts se carguen
    setTimeout(() => {
        if (inicializarModalAccesibilidad()) {
            console.log('🎉 Modal de accesibilidad listo para usar');
        }
    }, 500);
});

// Hacer funciones disponibles globalmente
if (typeof window !== 'undefined') {
    window.mostrarModalAccesibilidad = mostrarModalAccesibilidad;
    window.manejarRespuestaAccesibilidad = manejarRespuestaAccesibilidad;
    window.iniciarNavegacionAccesible = iniciarNavegacionAccesible;
    window.cerrarModalAccesibilidad = cerrarModalAccesibilidad;
    window.resetearModalAccesibilidad = resetearModalAccesibilidad;
    window.llenarSelectorInicio = llenarSelectorInicio;
    window.manejarCambioInicio = manejarCambioInicio;
    window.manejarCambioPuntoInicio = manejarCambioPuntoInicio;
    window.obtenerCoordenadasAcceso = obtenerCoordenadasAcceso;
    window.mostrarInfoLimitaciones = mostrarInfoLimitaciones;
    window.inicializarModalAccesibilidad = inicializarModalAccesibilidad;
    window.iniciarNavegacionNormal = iniciarNavegacionNormal;
    window.iniciarNavegacionConMapa = iniciarNavegacionConMapa;
    window.inicializarMapaNormal = inicializarMapaNormal;
    window.inicializarMapaAccesible = inicializarMapaAccesible;
    window.iniciarSeguimientoUbicacionAccesible = iniciarSeguimientoUbicacionAccesible;
    window.dibujarRutasAccesibles = dibujarRutasAccesibles;
    window.dibujarRutaIndividual = dibujarRutaIndividual;
    window.calcularDistanciaHaversine = calcularDistanciaHaversine;
    window.obtenerUbicacionGPS = obtenerUbicacionGPS;
    window.mostrarIndicadorGPS = mostrarIndicadorGPS;
    window.mostrarExitoGPS = mostrarExitoGPS;
    window.mostrarErrorGPS = mostrarErrorGPS;
    window.mostrarSelectorManual = mostrarSelectorManual;
    window.esEdificioAccesibleParaModal = esEdificioAccesibleParaModal;
    window.mostrarMapaNormal = mostrarMapaNormal;
    window.activarSistemaOriginal = activarSistemaOriginal;
}

/**
 * Muestra el mapa normal para usuarios sin discapacidad
 */
function mostrarMapaNormal() {
    console.log('🗺️ Mostrando mapa normal...');

    // Usar la función existente de mapa normal
    inicializarMapaNormal();
}
