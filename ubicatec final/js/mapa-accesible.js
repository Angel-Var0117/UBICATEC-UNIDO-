/**
 * Mapa Accesible - UBICATEC
 * Estructura de datos del grafo para navegación accesible
 * 
 * @author Sistema UBICATEC
 * @version 1.0
 * @date 2024
 */

// ============================================================================
// VARIABLE DEL GRAFO - DECLARAR AQUÍ
// ============================================================================

/**
 * Grafo de navegación accesible
 * Estructura que representa los nodos, aristas y conexiones del campus
 * 
 * Formato sugerido:
 * - nodos: Array de vértices con coordenadas GPS
 * - aristas: Array de conexiones entre nodos
 * - edificios: Mapeo de edificios a nodos específicos
 * - accesos: Puntos de entrada al campus
 * - rutas: Rutas predefinidas accesibles
 */
let grafoAccesible = {
    nodos: [
        // Aquí van todos tus nodos de la ruta azul
        // Ejemplo:
        {
            id: 'azul_1',                    // ID único del nodo
            coords: [19.068467599492795, -98.17061388514823],
            descripcion: 'Acceso Visitantes',      // Descripción del punto
            tipo: 'acceso',  // Tipo de nodo
            ruta: 'azul'                    // Ruta a la que pertenece
        },
        {
            id: 'azul_2',                   // ID único del nodo
            coords: [19.0683843, -98.1702980],              // Coordenadas GPS
            descripcion: 'Estacionamiento de alumnos',      // Descripción del punto
            tipo: 'nodo',  // Tipo de nodo
            ruta: 'azul'                    // Ruta a la que pertenece
        },
        {
            id: 'azul_3',                   // ID único del nodo
            coords: [19.068163, -98.170270],              // Coordenadas GPS
            descripcion: 'Entrada edificio 36',      // Descripción del punto
            tipo: 'edificio',  // Tipo de nodo
            ruta: 'azul'                    // Ruta a la que pertenece
        },
        {
            id: 'azul_4',
            coords: [19.0683612, -98.1700623],
            descripcion: 'Cordillera del 36',
            tipo: 'nodo',
            ruta: 'azul'
        },
        {
            id: 'azul_5',
            coords: [19.0683475, -98.1699010],
            descripcion: 'Cajon de estacionamiento',
            tipo: 'nodo',
            ruta: 'azul'
        },
        {
            id: 'azul_6',
            coords: [19.0684908, -98.1698233],
            descripcion: 'Inicio del pasillo de canchas',
            tipo: 'nodo',
            ruta: 'azul'
        },
        {
            id: 'azul_7',
            coords: [19.0684141, -98.1692114],
            descripcion: 'Final del pasillo de canchas',
            tipo: 'nodo',
            ruta: 'azul'
        },
        {
            id: 'azul_8',
            coords: [19.0685174, -98.1691869],
            descripcion: 'Pasillo edificio 29',
            tipo: 'interseccion',
            ruta: 'azul'
        },
        {
            id: 'azul_9',
            coords: [19.0684790, -98.1689670],
            descripcion: 'Entrada edificio 30',
            tipo: 'edificio',
            ruta: 'azul'
        },
        {
            id: 'azul_10',
            coords: [19.06766279821493, -98.17013187271783],
            descripcion: 'Cordillera del 36',
            tipo: 'nodo',
            ruta: 'azul'
        },
        {
            id: 'azul_11',
            coords: [19.067589895228735, -98.1696891],
            descripcion: 'Entrada centro de información',
            tipo: 'edificio',
            ruta: 'azul'
        },
        {
            id: 'azul_12',
            coords: [19.067422488611665, -98.169682206123],
            descripcion: 'Edificio 50(Centro de información)',
            tipo: 'edificio',
            ruta: 'azul'
        },
        {
            id: 'azul_13',
            coords: [19.067589895228735, -98.16930687345818],
            descripcion: 'Cordillera hacia gimnasio',
            tipo: 'nodo',
            ruta: 'azul'
        },
        {
            id: 'azul_14',
            coords: [19.0671937, -98.1693723],
            descripcion: 'Cordillera hacia gimnasio',
            tipo: 'nodo',
            ruta: 'azul'
        },
        {
            id: 'azul_15',
            coords: [19.0671990, -98.1691631],
            descripcion: 'Entrada accesible gimnasio',
            tipo: 'edificio',
            ruta: 'azul'
        },
        {
            id: 'azul_16',
            coords: [19.0670036, -98.1691540],
            descripcion: 'Cajon de estacionamiento gimnasio',
            tipo: 'nodo',
            ruta: 'azul'
        },
        {
            id: 'azul_17',
            coords: [19.066967924289344, -98.16869954966634],
            descripcion: 'Cordillera hacia edificio 38',
            tipo: 'nodo',
            ruta: 'azul'
        },
        {
            id: 'azul_18',
            coords: [19.06634923333955, -98.16864781128356],
            descripcion: 'Canchas del domo',
            tipo: 'nodo',
            ruta: 'azul'
        },
        {
            id: 'azul_19',
            coords: [19.067184781628676, -98.17086525607026],
            descripcion: 'Acceso hangar',
            tipo: 'acceso',
            ruta: 'azul'
        },
        //------------------------------------------------------------------//
        {
            id: 'naranja_1',
            coords: [19.069804848263956, -98.17041271377924],
            descripcion: 'Acceso principal',
            tipo: 'acceso',
            ruta: 'naranja'
        },
        {
            id: 'naranja_2',
            coords: [19.069927624157344, -98.1703294409239],
            descripcion: 'Cordillera de entrada principal',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_3',
            coords: [19.069897837778097, -98.17011084090497],
            descripcion: 'Cordillera de entrada principal',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_4',
            coords: [19.070192532570985, -98.17007127832228],
            descripcion: 'Cordillera hacia edificios 1 y 2',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_5',
            coords: [19.070259176578254, -98.17018421030318],
            descripcion: 'Pasillo estacionamiento para personal',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_6',
            coords: [19.07051431443449, -98.17014230172214],
            descripcion: 'Pasillo estacionamiento para personal',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_7',
            coords: [19.07060430697445, -98.17017381767646],
            descripcion: 'Estacionamiento principal',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_8',
            coords: [19.07061685675977, -98.1702820816372],
            descripcion: 'Acceso estacionamiento principal',
            tipo: 'acceso',
            ruta: 'naranja'
        },
        {
            id: 'naranja_9',
            coords: [19.070182596818434, -98.16984098206038],
            descripcion: 'Pasillo entre edificios 1 y 2',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_10',
            coords: [19.070159827858692, -98.16965699301171],
            descripcion: 'Pasillo/Cordillera principal',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_11',
            coords: [19.070339683584418, -98.16984213200494],
            descripcion: 'Entrada edificio 2',
            tipo: 'edificio',
            ruta: 'naranja'
        },
        {
            id: 'naranja_12',
            coords: [19.0700471611661, -98.16987998532049],
            descripcion: 'Entrada edificio 1',
            tipo: 'edificio',
            ruta: 'naranja'
        },
        {
            id: 'naranja_13',
            coords: [19.07045696117779, -98.16959931061868],
            descripcion: 'Pasillo/cordillera principal',
            tipo: 'interseccion',
            ruta: 'naranja'
        },
        {
            id: 'naranja_14',
            coords: [19.06954411330357, -98.169699301171],
            descripcion: 'Pasillo/Cordillera principal',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_15',
            coords: [19.069276620209916, -98.1697020963557],
            descripcion: 'Pasillo entre edificio 17 y 18',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_16',
            coords: [19.069187280232338, -98.1697393033749],
            descripcion: 'Pasillo entre edificio 17 y 18',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_17',
            coords: [19.06883313589799, -98.1699629309711],
            descripcion: 'Pasillo hacia el edificio 28',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_18',
            coords: [19.068709930910195, -98.1699847419628],
            descripcion: 'Edificio 28',
            tipo: 'edificio',
            ruta: 'naranja'
        },
        {
            id: 'naranja_19',
            coords: [19.069621431292198, -98.17040155232779],
            descripcion: 'Pasillo entrada principal',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_20',
            coords: [19.06954411330357, -98.169699301171],
            descripcion: 'Pasillo explanada',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_21',
            coords: [19.06927554283283, -98.16995516119464],
            descripcion: 'Pasillo edificio de titulación',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_22',
            coords: [19.069322, -98.169955],
            descripcion: 'Entrada accesible a edificio de titulación',
            tipo: 'edificio',
            ruta: 'naranja'
        },
        {
            id: 'naranja_23',
            coords: [19.069155186281783, -98.16946992268306],
            descripcion: 'Pasillo del edificio 18',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_24',
            coords: [19.06907279802546, -98.16947394598972],
            descripcion: 'Inicio pasillo para el edificio 19',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_25',
            coords: [19.069053151589696, -98.16934050610591],
            descripcion: 'Pasillo del edificio 19',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_26',
            coords: [19.069084, -98.169326],
            descripcion: 'Entrada al edificio 19',
            tipo: 'edificio',
            ruta: 'naranja'
        },
        {
            id: 'naranja_27',
            coords: [19.068963346800043, -98.16949092670183],
            descripcion: 'Pasillo entre edificio 24 y 19',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_28',
            coords: [19.068940531567176, -98.16941381317659],
            descripcion: 'Pasillo del edificio 24(jardinera)',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_29',
            coords: [19.06881314646958, -98.16942521256362],
            descripcion: 'Pasillo del edificio 24-25',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_30',
            coords: [19.06880047133015, -98.16917710825706],
            descripcion: 'Pasillo del edificio 24-25-29',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_32',
            coords: [19.068845419565694, -98.16910953816078],
            descripcion: 'Edificio 25',
            tipo: 'edificio',
            ruta: 'naranja'
        },
        {
            id: 'naranja_33',
            coords: [19.0689629787397, -98.16914431034333],
            descripcion: 'Pasillo del edificio 25',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_34',
            coords: [19.068953386117077, -98.16897627859588],
            descripcion: 'Pasillo entre el edificio 19 y 25',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_35',
            coords: [19.068825367272474, -98.16898566632639],
            descripcion: 'Pasillo edificio 21',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_36',
            coords: [19.068793679424385, -98.1687050881701],
            descripcion: 'Pasillo edificio 21',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_37',
            coords: [19.068793, -98.168558],
            descripcion: 'Edificio 27',
            tipo: 'edificio',
            ruta: 'naranja'
        },
        {
            id: 'naranja_38',
            coords: [19.069272112524505, -98.16864071515533],
            descripcion: 'Pasillo entre edificio 21 y 20',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_39',
            coords: [19.06924295978286, -98.16833896666323],
            descripcion: 'Pasillo del edificio 20',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_40',
            coords: [19.069104801068896, -98.16835170715466],
            descripcion: 'Pasillo entre edificio 20 y 49',
            tipo: 'nodo',
            ruta: 'naranja'
        },
        {
            id: 'naranja_41',
            coords: [19.069142, -98.168277],
            descripcion: 'Edificio 49',
            tipo: 'edificio',
            ruta: 'naranja'
        },
        {
            id: 'naranja_42',
            coords: [19.069142510837185, -98.16839168822943],
            descripcion: 'Edificio 20',
            tipo: 'edificio',
            ruta: 'naranja'
        },
        //------------------------------------------------------------------//
        {
            id: 'verde_1',
            coords: [19.070523, -98.167751],
            descripcion: 'Acceso Maravillas',
            tipo: 'acceso',
            ruta: 'verde'
        },
        {
            id: 'verde_2',
            coords: [19.070805, -98.168135],
            descripcion: 'Pasillo',
            tipo: 'nodo',
            ruta: 'verde'
        },
        {
            id: 'verde_3',
            coords: [19.070878, -98.168829],
            descripcion: 'edificio 45',
            tipo: 'edificio',
            ruta: 'verde'
        },
        {
            id: 'verde_4',
            coords: [19.070936, -98.169357],
            descripcion: 'pasillo',
            tipo: 'nodo',
            ruta: 'verde'
        },
        {
            id: 'verde_5',
            coords: [19.070793, -98.169381],
            descripcion: 'pasillo',
            tipo: 'nodo',
            ruta: 'verde'
        },
        {
            id: 'verde_6',
            coords: [19.070825, -98.169685],
            descripcion: 'edificio 53',
            tipo: 'edificio',
            ruta: 'verde'
        },
        {
            id: 'verde_7',
            coords: [19.070801, -98.169558],
            descripcion: 'pasillo',
            tipo: 'nodo',
            ruta: 'verde'
        },
        {
            id: 'verde_8',
            coords: [19.07045696117779, -98.16959931061868],
            descripcion: 'Interseccion naranja-verde',
            tipo: 'interseccion',
            ruta: 'verde'
        },
        {
            id: 'verde_9',
            coords: [19.070399, -98.169142],
            descripcion: 'edificio 3',
            tipo: 'edificio',
            ruta: 'verde'
        },
        {
            id: 'verde_10',
            coords: [19.070399, -98.169142],
            descripcion: 'edificio 3',
            tipo: 'edificio',
            ruta: 'verde'
        },
        {
            id: 'verde_11',
            coords: [19.070716, -98.169572],
            descripcion: 'pasillo',
            tipo: 'nodo',
            ruta: 'verde'
        },
        {
            id: 'verde_12',
            coords: [19.070783, -98.170154],
            descripcion: 'pasillo',
            tipo: 'nodo',
            ruta: 'verde'
        },
        {
            id: 'verde_13',
            coords: [19.070747, -98.170159],
            descripcion: 'pasillo',
            tipo: 'nodo',
            ruta: 'verde'
        },
        {
            id: 'verde_14',
            coords: [19.070768, -98.170343],
            descripcion: 'Acceso_estacionamiento 1',
            tipo: 'acceso',
            ruta: 'verde'
        },
        {
            id: 'verde_15',
            coords: [19.071119, -98.169336],
            descripcion: 'pasiilo',
            tipo: 'nodo',
            ruta: 'verde'
        },
        {
            id: 'verde_16',
            coords: [19.071157, -98.169635],
            descripcion: 'pasiilo',
            tipo: 'nodo',
            ruta: 'verde'
        },
        {
            id: 'verde_17',
            coords: [19.071208, -98.169903],
            descripcion: 'edificio 41',
            tipo: 'edificio',
            ruta: 'verde'
        },
        {
            id: 'verde_18',
            coords: [19.071477, -98.169603],
            descripcion: 'pasillo',
            tipo: 'nodo',
            ruta: 'verde'
        },
        {
            id: 'verde_19',
            coords: [19.071505, -98.169812],
            descripcion: 'edificio 51',
            tipo: 'edificio',
            ruta: 'verde'
        },
    ],

    // NUEVA ESTRUCTURA ESCALABLE: Todas las aristas en un solo array
    aristas: [
        // --------------------------------------------------------------------------------

        {
            desde: 'azul_1',
            hacia: 'azul_2',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50], // Edificios que pueden usar esta arista
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas'] // Accesos que pueden usar esta arista
        },
        {
            desde: 'azul_2',
            hacia: 'azul_3',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50], // Solo edificio 36 puede usar esta arista
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_2',
            hacia: 'azul_4',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50], // Solo edificio 36 puede usar esta arista
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_4',
            hacia: 'azul_5',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50], // Solo edificio 30 puede usar esta arista
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_5',
            hacia: 'azul_6',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_6',
            hacia: 'azul_7',
            ruta: 'azul',
            precaucion: {
                tipo: 'obstaculo_fisico',
                severidad: 'media',
                mensaje: 'Pasillo con deformaciones en el pavimento, transitar con cuidado'
            },
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_7',
            hacia: 'azul_8',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_8',
            hacia: 'azul_9',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_4',
            hacia: 'azul_10',
            ruta: 'azul',
            precaucion: {
                tipo: 'obstaculo_fisico',
                severidad: 'media',
                mensaje: 'Pasillo con deformaciones en el pavimento, transitar con cuidado'
            },
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_10',
            hacia: 'azul_11',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_11',
            hacia: 'azul_12',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_11',
            hacia: 'azul_13',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_13',
            hacia: 'azul_14',
            ruta: 'azul',
            precaucion: {
                tipo: 'obstaculo_fisico',
                severidad: 'media',
                mensaje: 'Pasillo con deformaciones en el pavimento, transitar con cuidado'
            },
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_14',
            hacia: 'azul_15',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_15',
            hacia: 'azul_16',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_16',
            hacia: 'azul_17',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_17',
            hacia: 'azul_18',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_19',
            hacia: 'azul_16',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'azul_8',
            hacia: 'naranja_30',
            ruta: 'azul',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        //------------------------------------------------------------------//
        {
            desde: 'naranja_1',
            hacia: 'naranja_2',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_2',
            hacia: 'naranja_3',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_3',
            hacia: 'naranja_4',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_4',
            hacia: 'naranja_5',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']

        },
        {
            desde: 'naranja_5',
            hacia: 'naranja_6',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_6',
            hacia: 'naranja_7',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_7',
            hacia: 'naranja_8',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_9',
            hacia: 'naranja_10',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_10',
            hacia: 'naranja_20',
            ruta: 'naranja',
            precaucion: {
                tipo: 'obstaculo_fisico',
                severidad: 'media',
                mensaje: 'Rampas pronunciadas, transitar con cuidado'
            },
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_4',
            hacia: 'naranja_9',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_9',
            hacia: 'naranja_11',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_9',
            hacia: 'naranja_12',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_1',
            hacia: 'naranja_19',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_19',
            hacia: 'naranja_20',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_20',
            hacia: 'naranja_14',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_14',
            hacia: 'naranja_15',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_15',
            hacia: 'naranja_21',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_21',
            hacia: 'naranja_22',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_15',
            hacia: 'naranja_16',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_16',
            hacia: 'naranja_17',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_17',
            hacia: 'naranja_18',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_16',
            hacia: 'naranja_23',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_23',
            hacia: 'naranja_24',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_24',
            hacia: 'naranja_25',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_25',
            hacia: 'naranja_26',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_24',
            hacia: 'naranja_27',
            ruta: 'naranja',
            precaucion: {
                tipo: 'obstaculo_fisico',
                severidad: 'media',
                mensaje: 'Rampas pronunciadas, transitar con cuidado'
            },
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_27',
            hacia: 'naranja_28',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_28',
            hacia: 'naranja_29',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_29',
            hacia: 'naranja_30',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_30',
            hacia: 'naranja_32',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_30',
            hacia: 'naranja_33',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_33',
            hacia: 'naranja_34',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_34',
            hacia: 'naranja_35',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_35',
            hacia: 'naranja_36',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_36',
            hacia: 'naranja_37',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_36',
            hacia: 'naranja_38',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_38',
            hacia: 'naranja_39',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_39',
            hacia: 'naranja_40',
            ruta: 'naranja',
            precaucion: {
                tipo: 'obstaculo_fisico',
                severidad: 'media',
                mensaje: 'Rampas pronunciadas, transitar con cuidado'
            },
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_40',
            hacia: 'naranja_41',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_40',
            hacia: 'naranja_42',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_principal', 'acceso_visitantes', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_30',
            hacia: 'naranja_31',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'naranja_10',
            hacia: 'verde_8',
            ruta: 'naranja',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        //------------------------------------------------------------------//
        {
            desde: 'verde_1',
            hacia: 'verde_2',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_2',
            hacia: 'verde_3',
            ruta: 'verde',
            precaucion: {
                tipo: 'obstaculo_fisico',
                severidad: 'media',
                mensaje: 'Edificio abarca parte del camino, transitar con cuidado'
            },
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_3',
            hacia: 'verde_4',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_4',
            hacia: 'verde_5',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_5',
            hacia: 'verde_7',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_7',
            hacia: 'verde_6',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_7',
            hacia: 'verde_11',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_11',
            hacia: 'verde_8',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_8',
            hacia: 'verde_10',
            ruta: 'verde',
            precaucion: {
                tipo: 'obstaculo_fisico',
                severidad: 'media',
                mensaje: 'Precaución: Ramas de árboles han levantado el camino. Transitar con cuidado.'
            },
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_4',
            hacia: 'verde_15',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_15',
            hacia: 'verde_16',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_16',
            hacia: 'verde_17',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_16',
            hacia: 'verde_18',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_18',
            hacia: 'verde_19',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_11',
            hacia: 'verde_12',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_12',
            hacia: 'verde_13',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        {
            desde: 'verde_13',
            hacia: 'verde_14',
            ruta: 'verde',
            edificiosAccesibles: [45, 51, 41, 53, 1, 2, 3, 17, 19, 25, 20, 27, 28, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        }
    ],

    edificios: {
        36: 'azul_3',
        30: 'azul_9', //PENDIENTE
        50: 'azul_12',
        1: 'naranja_12',
        2: 'naranja_11',
        3: 'verde_10',
        17: 'naranja_22',
        28: 'naranja_18',
        19: 'naranja_26',
        25: 'naranja_32',
        20: 'naranja_42',
        27: 'naranja_37',
        49: 'naranja_41',
        45: 'verde_3',
        41: 'verde_17',
        51: 'verde_19',
        53: 'verde_6'
    },
    accesos: {
        'acceso_visitantes': 'azul_1',
        'acceso_hangar': 'azul_19',
        'acceso_principal': 'naranja_1',
        'acceso_maravillas': 'verde_1',
        'acceso_estacionamiento_1': 'verde_11',
    },
    rutas: {
        // Rutas predefinidas
        'azul': {
            nombre: 'Ruta Azul',
            color: '#3498db',
            edificios: [30, 36, 50],
            accesos: ['acceso_visitantes', 'acceso_hangar', 'acceso_principal', 'acceso_maravillas', 'acceso_estacionamiento_1']
        },
        'naranja': {
            nombre: 'Ruta Naranja',
            color: '#e67e22',
            edificios: [1, 2, 17, 28, 19, 25, 20, 27, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        },
        'verde': {
            nombre: 'Ruta Verde',
            color: '#2ecc71',
            edificios: [3, 17, 28, 19, 25, 20, 27, 49, 36, 30, 50],
            accesos: ['acceso_visitantes', 'acceso_principal', 'acceso_hangar', 'acceso_estacionamiento_1', 'acceso_maravillas']
        }
    }
};

// ============================================================================
// FUNCIONES DE UTILIDAD PARA EL GRAFO
// ============================================================================

/**
 * Inicializa el grafo accesible
 * @param {Object} grafo - Estructura del grafo a inicializar
 */
function inicializarGrafoAccesible(grafo) {
    console.log('🗺️ Inicializando grafo accesible...');

    if (!grafo) {
        console.error('❌ No se proporcionó grafo para inicializar');
        return false;
    }

    grafoAccesible = grafo;

    // Validar estructura básica del grafo
    if (!validarEstructuraGrafo(grafo)) {
        console.error('❌ Estructura del grafo inválida');
        return false;
    }

    console.log('✅ Grafo accesible inicializado correctamente');
    console.log('📊 Estadísticas del grafo:', {
        nodos: grafo.nodos ? grafo.nodos.length : 0,
        aristas: grafo.aristas ? grafo.aristas.length : 0,
        edificios: grafo.edificios ? Object.keys(grafo.edificios).length : 0,
        accesos: grafo.accesos ? Object.keys(grafo.accesos).length : 0
    });

    return true;
}

/**
 * Valida la estructura básica del grafo
 * @param {Object} grafo - Grafo a validar
 * @returns {boolean} True si la estructura es válida
 */
function validarEstructuraGrafo(grafo) {
    if (!grafo || typeof grafo !== 'object') {
        console.error('❌ El grafo debe ser un objeto');
        return false;
    }

    // Validar que tenga al menos nodos
    if (!grafo.nodos || !Array.isArray(grafo.nodos) || grafo.nodos.length === 0) {
        console.error('❌ El grafo debe tener un array de nodos');
        return false;
    }

    // Validar estructura de nodos
    const mapaNodos = new Set();
    for (let i = 0; i < grafo.nodos.length; i++) {
        const nodo = grafo.nodos[i];
        if (!nodo.id || !nodo.coords || !Array.isArray(nodo.coords) || nodo.coords.length !== 2) {
            console.error(`❌ Nodo ${i} tiene estructura inválida:`, nodo);
            return false;
        }
        mapaNodos.add(nodo.id);
    }

    console.log('🔍 Validando integridad referencial del grafo...');
    let erroresEncontrados = false;

    // Validar Edificios
    if (grafo.edificios) {
        Object.entries(grafo.edificios).forEach(([edificioId, nodoId]) => {
            if (!mapaNodos.has(nodoId)) {
                console.error(`❌ Error de Integridad: El edificio ${edificioId} apunta al nodo '${nodoId}' que no existe.`);
                erroresEncontrados = true;
            }
        });
    }

    // Validar Accesos
    if (grafo.accesos) {
        Object.entries(grafo.accesos).forEach(([accesoId, nodoId]) => {
            if (!mapaNodos.has(nodoId)) {
                console.error(`❌ Error de Integridad: El acceso '${accesoId}' apunta al nodo '${nodoId}' que no existe.`);
                erroresEncontrados = true;
            }
        });
    }

    // Validar Aristas
    if (grafo.aristas) {
        grafo.aristas.forEach((arista, index) => {
            if (!mapaNodos.has(arista.desde)) {
                console.error(`❌ Error de Integridad (Arista ${index}): Nodo origen '${arista.desde}' no existe.`);
                erroresEncontrados = true;
            }
            if (!mapaNodos.has(arista.hacia)) {
                console.error(`❌ Error de Integridad (Arista ${index}): Nodo destino '${arista.hacia}' no existe.`);
                erroresEncontrados = true;
            }
        });
    }

    if (!erroresEncontrados) {
        console.log('✅ Integridad del grafo verificada: Todas las referencias son válidas.');
    } else {
        console.warn('⚠️ Se encontraron errores de integridad en el grafo. Revise la consola para más detalles.');
    }

    return true;
}

/**
 * Obtiene un nodo por su ID
 * @param {string} nodoId - ID del nodo a buscar
 * @returns {Object|null} Nodo encontrado o null
 */
function obtenerNodoPorId(nodoId) {
    if (!grafoAccesible || !grafoAccesible.nodos) {
        return null;
    }

    return grafoAccesible.nodos.find(nodo => nodo.id === nodoId) || null;
}

/**
 * Obtiene todos los nodos del grafo
 * @returns {Array} Array de nodos
 */
function obtenerTodosLosNodos() {
    return grafoAccesible && grafoAccesible.nodos ? grafoAccesible.nodos : [];
}

/**
 * Obtiene las aristas del grafo
 * @returns {Array} Array de aristas
 */
function obtenerAristas() {
    return grafoAccesible && grafoAccesible.aristas ? grafoAccesible.aristas : [];
}

/**
 * FILTRADO INTELIGENTE: Obtiene aristas específicas para un edificio y acceso
 * @param {number} edificioDestino - ID del edificio de destino
 * @param {string} accesoInicio - ID del acceso de inicio (opcional)
 * @returns {Array} Array de aristas filtradas
 */
function obtenerAristasPorEdificio(edificioDestino, accesoInicio = null) {
    console.log(`🔍 Filtrando aristas para edificio ${edificioDestino} desde acceso ${accesoInicio}`);

    if (!grafoAccesible || !grafoAccesible.aristas) {
        console.warn('⚠️ No hay aristas disponibles en el grafo');
        return [];
    }

    // Filtrar aristas que pueden ser usadas por este edificio
    const aristasFiltradas = grafoAccesible.aristas.filter(arista => {
        // Verificar si el edificio puede usar esta arista
        const puedeUsarEdificio = arista.edificiosAccesibles.includes(edificioDestino);

        // Si se especifica un acceso, verificar si puede usar esta arista
        const puedeUsarAcceso = !accesoInicio || arista.accesos.includes(accesoInicio);

        const resultado = puedeUsarEdificio && puedeUsarAcceso;

        if (resultado) {
            console.log(`✅ Arista ${arista.desde} → ${arista.hacia} disponible para edificio ${edificioDestino}`);
        }

        return resultado;
    });

    console.log(`📊 Total de aristas filtradas: ${aristasFiltradas.length}`);
    return aristasFiltradas;
}

/**
 * FILTRADO INTELIGENTE: Obtiene aristas para una ruta específica
 * @param {string} rutaId - ID de la ruta (ej: 'azul', 'naranja')
 * @returns {Array} Array de aristas de la ruta
 */
function obtenerAristasPorRuta(rutaId) {
    console.log(`🔍 Obteniendo aristas para ruta: ${rutaId}`);

    if (!grafoAccesible || !grafoAccesible.aristas) {
        return [];
    }

    const aristasRuta = grafoAccesible.aristas.filter(arista => arista.ruta === rutaId);
    console.log(`📊 Aristas encontradas para ruta ${rutaId}: ${aristasRuta.length}`);
    return aristasRuta;
}

/**
 * FILTRADO INTELIGENTE: Determina qué ruta usar según origen y destino
 * @param {string} accesoInicio - ID del acceso de inicio
 * @param {number} edificioDestino - ID del edificio de destino
 * @returns {string|null} ID de la ruta a usar
 */
function determinarRutaAccesible(accesoInicio, edificioDestino) {
    console.log(`🧭 Determinando ruta accesible desde ${accesoInicio} hacia edificio ${edificioDestino}`);

    if (!grafoAccesible || !grafoAccesible.rutas) {
        console.warn('⚠️ No hay rutas definidas en el grafo');
        return null;
    }

    // Buscar rutas que conecten el acceso con el edificio
    const rutasDisponibles = Object.keys(grafoAccesible.rutas).filter(rutaId => {
        const ruta = grafoAccesible.rutas[rutaId];
        const tieneAcceso = ruta.accesos.includes(accesoInicio);
        const tieneEdificio = ruta.edificios.includes(edificioDestino);

        console.log(`🔍 Ruta ${rutaId}: acceso=${tieneAcceso}, edificio=${tieneEdificio}`);
        return tieneAcceso && tieneEdificio;
    });

    if (rutasDisponibles.length > 0) {
        const rutaSeleccionada = rutasDisponibles[0];
        console.log(`✅ Ruta seleccionada: ${rutaSeleccionada}`);
        return rutaSeleccionada;
    }

    console.warn(`⚠️ No se encontró ruta accesible desde ${accesoInicio} hacia edificio ${edificioDestino}`);
    return null;
}

/**
 * FILTRADO INTELIGENTE DE NODOS: Obtiene solo los nodos relevantes para un edificio específico
 * @param {number} edificioDestino - ID del edificio de destino
 * @param {string} accesoInicio - ID del acceso de inicio (opcional)
 * @returns {Array} Array de nodos relevantes
 */
function obtenerNodosRelevantes(edificioDestino, accesoInicio = null) {
    console.log(`🔍 Filtrando nodos relevantes para edificio ${edificioDestino} desde acceso ${accesoInicio}`);

    if (!grafoAccesible || !grafoAccesible.aristas) {
        console.warn('⚠️ No hay aristas disponibles en el grafo');
        return [];
    }

    // PASO 1: Obtener aristas filtradas para el edificio
    const aristasFiltradas = obtenerAristasPorEdificio(edificioDestino, accesoInicio);
    console.log(`📊 Aristas filtradas encontradas: ${aristasFiltradas.length}`);

    // PASO 2: Extraer todos los IDs de nodos de las aristas filtradas
    const nodosRelevantesIds = new Set();
    aristasFiltradas.forEach(arista => {
        nodosRelevantesIds.add(arista.desde);
        nodosRelevantesIds.add(arista.hacia);
        console.log(`📍 Nodo relevante encontrado: ${arista.desde} y ${arista.hacia}`);
    });

    // PASO 3: Filtrar nodos del grafo que están en la lista relevante
    const todosLosNodos = obtenerTodosLosNodos();
    const nodosFiltrados = todosLosNodos.filter(nodo => {
        const esRelevante = nodosRelevantesIds.has(nodo.id);
        if (esRelevante) {
            console.log(`✅ Nodo ${nodo.id} es relevante para edificio ${edificioDestino}`);
        }
        return esRelevante;
    });

    console.log(`📊 Total de nodos relevantes: ${nodosFiltrados.length} de ${todosLosNodos.length}`);
    console.log(`🎯 Nodos relevantes: ${nodosFiltrados.map(n => n.id).join(', ')}`);

    return nodosFiltrados;
}

/**
 * Obtiene los edificios mapeados
 * @returns {Object} Mapeo de edificios a nodos
 */
function obtenerEdificios() {
    return grafoAccesible && grafoAccesible.edificios ? grafoAccesible.edificios : {};
}

/**
 * Obtiene los accesos al campus
 * @returns {Object} Mapeo de accesos
 */
function obtenerAccesos() {
    return grafoAccesible && grafoAccesible.accesos ? grafoAccesible.accesos : {};
}

/**
 * Obtiene las rutas predefinidas
 * @returns {Object} Rutas del grafo
 */
function obtenerRutas() {
    return grafoAccesible && grafoAccesible.rutas ? grafoAccesible.rutas : {};
}

/**
 * Encuentra el nodo más cercano a unas coordenadas GPS
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {Function} [filtro=null] - Función de filtrado opcional (retorna true para incluir)
 * @returns {Object|null} Nodo más cercano
 */
function encontrarNodoMasCercano(lat, lng, filtro = null) {
    let nodos = obtenerTodosLosNodos();
    if (nodos.length === 0) {
        return null;
    }

    // Aplicar filtro si existe
    if (filtro && typeof filtro === 'function') {
        nodos = nodos.filter(filtro);
    }

    let nodoMasCercano = null;
    let distanciaMinima = Infinity;

    nodos.forEach(nodo => {
        const distancia = calcularDistanciaHaversine(
            lat, lng,
            nodo.coords[0], nodo.coords[1]
        );

        if (distancia < distanciaMinima) {
            distanciaMinima = distancia;
            nodoMasCercano = {
                ...nodo,
                distancia: distancia
            };
        }
    });

    return nodoMasCercano;
}

/**
 * Calcula distancia entre dos puntos usando fórmula de Haversine
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lon1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lon2 - Longitud punto 2
 * @returns {number} Distancia en metros
 */
function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Obtiene información completa del grafo
 * @returns {Object} Información del grafo
 */
function obtenerInformacionGrafo() {
    if (!grafoAccesible) {
        return {
            inicializado: false,
            mensaje: 'Grafo no inicializado'
        };
    }

    return {
        inicializado: true,
        estadisticas: {
            totalNodos: grafoAccesible.nodos ? grafoAccesible.nodos.length : 0,
            totalAristas: grafoAccesible.aristas ? grafoAccesible.aristas.length : 0,
            totalEdificios: grafoAccesible.edificios ? Object.keys(grafoAccesible.edificios).length : 0,
            totalAccesos: grafoAccesible.accesos ? Object.keys(grafoAccesible.accesos).length : 0,
            totalRutas: grafoAccesible.rutas ? Object.keys(grafoAccesible.rutas).length : 0
        },
        estructura: {
            tieneNodos: !!grafoAccesible.nodos,
            tieneAristas: !!grafoAccesible.aristas,
            tieneEdificios: !!grafoAccesible.edificios,
            tieneAccesos: !!grafoAccesible.accesos,
            tieneRutas: !!grafoAccesible.rutas
        }
    };
}

// ============================================================================
// SISTEMA DE VISUALIZACIÓN DEL GRAFO
// ============================================================================

/**
 * Crea un panel de visualización del grafo en la página
 */
function crearPanelVisualizacionGrafo() {
    // Crear contenedor del panel
    const panel = document.createElement('div');
    panel.id = 'panel-grafo';
    panel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 350px;
        max-height: 80vh;
        background: white;
        border: 2px solid #3498db;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: Arial, sans-serif;
        overflow-y: auto;
    `;

    // Crear header del panel
    const header = document.createElement('div');
    header.style.cssText = `
        background: #3498db;
        color: white;
        padding: 10px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    header.innerHTML = `
        <span><i class="fas fa-map"></i> Visualizador de Grafo</span>
        <button id="cerrar-panel-grafo" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">✕</button>
    `;


    // Crear contenido del panel
    const contenido = document.createElement('div');
    contenido.id = 'contenido-panel-grafo';
    contenido.style.cssText = `
        padding: 15px;
        font-size: 12px;
    `;

    // Ensamblar panel
    panel.appendChild(header);
    panel.appendChild(contenido);
    document.body.appendChild(panel);

    // Configurar botón cerrar
    document.getElementById('cerrar-panel-grafo').onclick = () => {
        panel.remove();
    };

    // Actualizar contenido inicial
    actualizarVisualizacionGrafo();

    console.log('✅ Panel de visualización del grafo creado');
    return panel;
}

/**
 * Actualiza la visualización del grafo en el panel
 */
function actualizarVisualizacionGrafo() {
    const contenido = document.getElementById('contenido-panel-grafo');
    if (!contenido) return;

    const info = obtenerInformacionGrafo();

    let html = `
        <div style="margin-bottom: 15px;">
            <h4 style="color: #2c3e50; margin: 0 0 10px 0;">📊 Estadísticas del Grafo</h4>
            <div style="background: #ecf0f1; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
                <strong>Estado:</strong> ${info.inicializado ? 'Inicializado' : 'No inicializado'}<br>
                <strong>Nodos:</strong> ${info.estadisticas.totalNodos}<br>
                <strong>Aristas:</strong> ${info.estadisticas.totalAristas}<br>
                <strong>Edificios:</strong> ${info.estadisticas.totalEdificios}<br>
                <strong>Accesos:</strong> ${info.estadisticas.totalAccesos}<br>
                <strong>Rutas:</strong> ${info.estadisticas.totalRutas}
            </div>

        </div>
    `;

    if (info.inicializado) {
        // Mostrar nodos por ruta
        html += mostrarNodosPorRuta();

        // Mostrar aristas
        html += mostrarAristas();

        // Mostrar edificios
        html += mostrarEdificios();
    }

    contenido.innerHTML = html;
}

/**
 * Muestra los nodos agrupados por ruta
 */
function mostrarNodosPorRuta() {
    const nodos = obtenerTodosLosNodos();
    const nodosPorRuta = {};

    // Agrupar nodos por ruta
    nodos.forEach(nodo => {
        const ruta = nodo.ruta || 'sin_ruta';
        if (!nodosPorRuta[ruta]) {
            nodosPorRuta[ruta] = [];
        }
        nodosPorRuta[ruta].push(nodo);
    });

    let html = `
        <div style="margin-bottom: 15px;">
            <h4 style="color: #2c3e50; margin: 0 0 10px 0;"><i class="fas fa-map-marker-alt"></i> Nodos por Ruta</h4>
    `;


    Object.keys(nodosPorRuta).forEach(ruta => {
        const color = ruta === 'verde' ? '#27ae60' :
            ruta === 'naranja' ? '#e67e22' :
                ruta === 'azul' ? '#3498db' : '#95a5a6';

        html += `
            <div style="margin-bottom: 8px;">
                <div style="background: ${color}; color: white; padding: 5px; border-radius: 4px; font-weight: bold; margin-bottom: 5px;">
                    ${ruta.toUpperCase()} (${nodosPorRuta[ruta].length} nodos)
                </div>
                <div style="max-height: 100px; overflow-y: auto; border: 1px solid #bdc3c7; border-radius: 4px;">
        `;

        nodosPorRuta[ruta].forEach(nodo => {
            html += `
                <div style="padding: 3px 8px; border-bottom: 1px solid #ecf0f1; font-size: 11px;">
                    <strong>${nodo.id}</strong><br>
                    <span style="color: #7f8c8d;">${nodo.descripcion}</span><br>
                    <span style="color: #95a5a6;">[${nodo.coords[0].toFixed(6)}, ${nodo.coords[1].toFixed(6)}]</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

/**
 * Muestra las aristas del grafo
 */
function mostrarAristas() {
    const aristas = obtenerAristas();

    let html = `
        <div style="margin-bottom: 15px;">
            <h4 style="color: #2c3e50; margin: 0 0 10px 0;"><i class="fas fa-link"></i> Aristas (${aristas.length})</h4>
            <div style="max-height: 120px; overflow-y: auto; border: 1px solid #bdc3c7; border-radius: 4px;">
    `;


    aristas.forEach(arista => {
        html += `
            <div style="padding: 5px 8px; border-bottom: 1px solid #ecf0f1; font-size: 11px;">
                <strong>${arista.desde}</strong> → <strong>${arista.hacia}</strong>
                ${arista.distancia ? `<span style="color: #7f8c8d;">(${arista.distancia}m)</span>` : ''}
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    return html;
}

/**
 * Muestra los edificios mapeados
 */
function mostrarEdificios() {
    const edificios = obtenerEdificios();
    const accesos = obtenerAccesos();

    let html = `
        <div style="margin-bottom: 15px;">
            <h4 style="color: #2c3e50; margin: 0 0 10px 0;"><i class="fas fa-building"></i> Edificios y Accesos</h4>
    `;


    if (Object.keys(edificios).length > 0) {
        html += `
            <div style="margin-bottom: 10px;">
                <strong>Edificios:</strong>
                <div style="max-height: 80px; overflow-y: auto; border: 1px solid #bdc3c7; border-radius: 4px; margin-top: 5px;">
        `;

        Object.keys(edificios).forEach(edificio => {
            html += `
                <div style="padding: 3px 8px; border-bottom: 1px solid #ecf0f1; font-size: 11px;">
                    Edificio <strong>${edificio}</strong> → Nodo <strong>${edificios[edificio]}</strong>
                </div>
            `;
        });

        html += `</div></div>`;
    }

    if (Object.keys(accesos).length > 0) {
        html += `
            <div>
                <strong>Accesos:</strong>
                <div style="max-height: 80px; overflow-y: auto; border: 1px solid #bdc3c7; border-radius: 4px; margin-top: 5px;">
        `;

        Object.keys(accesos).forEach(acceso => {
            html += `
                <div style="padding: 3px 8px; border-bottom: 1px solid #ecf0f1; font-size: 11px;">
                    <strong>${acceso}</strong> → Nodo <strong>${accesos[acceso]}</strong>
                </div>
            `;
        });

        html += `</div></div>`;
    }

    html += `</div>`;
    return html;
}

/**
 * Muestra el grafo en la consola para debugging
 */
function mostrarGrafoEnConsola() {
    console.log('=== VISUALIZACIÓN DEL GRAFO ===');
    console.log('Estadísticas:', obtenerInformacionGrafo().estadisticas);
    console.log('Nodos:', obtenerTodosLosNodos());
    console.log('Aristas:', obtenerAristas());
    console.log('Edificios:', obtenerEdificios());
    console.log('Accesos:', obtenerAccesos());
    console.log('Rutas:', obtenerRutas());
}


// ============================================================================
// SISTEMA DE MAPA ACCESIBLE INTERACTIVO
// ============================================================================

/**
 * Crea marcadores mejorados con iconos personalizados para rutas accesibles
 * @param {Array} coordenadas - Coordenadas [lat, lng] del marcador
 * @param {string} tipo - Tipo de marcador ('inicio', 'destino', 'paso', 'usuario')
 * @param {number} numero - Número para marcadores de paso (opcional)
 * @param {string} descripcion - Descripción para tooltip (opcional)
 * @returns {L.DivIcon} Icono personalizado de Leaflet
 */
function crearMarcadoresMejorados(coordenadas, tipo, numero = null, descripcion = '') {
    console.log(`🎨 Creando marcador mejorado tipo: ${tipo}`);

    // Validar coordenadas
    if (!coordenadas || !Array.isArray(coordenadas) || coordenadas.length < 2) {
        console.error('❌ Error: Coordenadas inválidas para crear marcador:', coordenadas);
        return null;
    }

    // Validar que las coordenadas son números válidos
    if (typeof coordenadas[0] !== 'number' || typeof coordenadas[1] !== 'number') {
        console.error('❌ Error: Coordenadas deben ser números válidos:', coordenadas);
        return null;
    }

    // Paleta de colores mejorada
    const coloresMejorados = {
        inicio: '#27ae60',      // Verde - Punto de partida
        destino: '#e74c3c',     // Rojo - Punto de llegada
        paso: '#3498db',        // Azul - Pasos intermedios
        usuario: '#f39c12',     // Naranja - Ubicación del usuario
        nodoActivo: '#e67e22',  // Naranja - Nodo actualmente destacado
        nodoCompletado: '#95a5a6' // Gris - Nodos ya visitados
    };

    // Configuración de iconos por tipo
    const configuracionIconos = {
        inicio: {
            icono: '▶',
            color: coloresMejorados.inicio,
            tamaño: [30, 30],
            descripcion: descripcion || 'Punto de inicio de la ruta accesible'
        },
        destino: {
            icono: '●',
            color: coloresMejorados.destino,
            tamaño: [30, 30],
            descripcion: descripcion || 'Punto de destino de la ruta accesible'
        },
        paso: {
            icono: numero ? numero.toString() : '●',
            color: coloresMejorados.paso,
            tamaño: [25, 25],
            descripcion: descripcion || `Paso ${numero || ''} de la ruta`
        },
        usuario: {
            icono: '◉',
            color: coloresMejorados.usuario,
            tamaño: [30, 30],
            descripcion: descripcion || 'Tu ubicación actual'
        }
    };

    const config = configuracionIconos[tipo] || configuracionIconos.paso;

    // Crear HTML del marcador
    const htmlMarcador = `
        <div style="
            background: ${config.color}; 
            color: white; 
            border: 2px solid white;
            border-radius: 50%; 
            width: ${config.tamaño[0]}px; 
            height: ${config.tamaño[1]}px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: bold; 
            font-size: ${tipo === 'paso' ? '12px' : '16px'};
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            transition: transform 0.2s ease;
        " title="${config.descripcion}">
            ${config.icono}
        </div>
    `;

    // Crear y retornar el icono de Leaflet
    const iconoLeaflet = L.divIcon({
        className: `marcador-${tipo}`,
        html: htmlMarcador,
        iconSize: config.tamaño,
        iconAnchor: [config.tamaño[0] / 2, config.tamaño[1] / 2],
        popupAnchor: [0, -config.tamaño[1] / 2]
    });

    console.log(`✅ Marcador ${tipo} creado correctamente`);
    return iconoLeaflet;
}

/**
 * Crea el panel de información lateral con detalles de la ruta
 * @param {Array} ruta - Array de IDs de nodos de la ruta
 * @param {number} edificioDestino - ID del edificio de destino
 * @param {string} accesoInicio - Acceso de inicio seleccionado
 * @param {Array} coordsUsuario - Coordenadas del usuario [lat, lng]
 */
async function crearPanelInformacionRuta(ruta, edificioDestino, accesoInicio = 'acceso_visitantes', coordsUsuario = null) {
    console.log('📋 Creando panel de información de ruta...');

    const panelContainer = document.getElementById('panelInformacionRuta');
    if (!panelContainer) {
        console.error('❌ No se encontró el contenedor del panel de información');
        return;
    }

    // Detectar si es dispositivo móvil
    const isMobile = window.innerWidth <= 768;

    // Obtener información del edificio destino (SOLUCIÓN CRÍTICA: Función async)
    const edificioInfo = await obtenerInfoEdificio(edificioDestino);
    const nodos = obtenerTodosLosNodos();

    // Calcular información de la ruta
    let distanciaTotal = 0;
    const pasosDetallados = [];

    if (ruta && ruta.length > 0) {
        for (let i = 0; i < ruta.length - 1; i++) {
            const nodoActual = nodos.find(n => n.id === ruta[i]);
            const nodoSiguiente = nodos.find(n => n.id === ruta[i + 1]);

            if (nodoActual && nodoSiguiente) {
                const distancia = calcularDistanciaHaversine(
                    nodoActual.coords[0], nodoActual.coords[1],
                    nodoSiguiente.coords[0], nodoSiguiente.coords[1]
                );
                distanciaTotal += distancia;

                pasosDetallados.push({
                    numero: i + 1,
                    nodo: nodoActual,
                    distancia: distancia,
                    esInicio: i === 0,
                    esDestino: i === ruta.length - 2
                });
            }
        }

        // Agregar el último nodo
        const ultimoNodo = nodos.find(n => n.id === ruta[ruta.length - 1]);
        if (ultimoNodo) {
            pasosDetallados.push({
                numero: ruta.length,
                nodo: ultimoNodo,
                distancia: 0,
                esInicio: false,
                esDestino: true
            });
        }
    }

    // Crear HTML del panel con diseño responsive
    const htmlPanel = `
        <div style="padding: ${isMobile ? '15px' : '20px'}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <!-- Header del Panel -->
            <div style="margin-bottom: ${isMobile ? '15px' : '20px'}; padding-bottom: ${isMobile ? '10px' : '15px'}; border-bottom: 2px solid #e74c3c;">
                <h3 style="margin: 0 0 5px 0; color: #2c3e50; font-size: ${isMobile ? '16px' : '18px'};"><i class="fas fa-list-ol"></i> Información de Ruta</h3>
                <p style="margin: 0; color: #7f8c8d; font-size: ${isMobile ? '12px' : '14px'};">Guía paso a paso para tu destino</p>
            </div>

            
            <!-- Resumen de la Ruta -->
            <div style="background: white; padding: ${isMobile ? '12px' : '15px'}; border-radius: 8px; margin-bottom: ${isMobile ? '15px' : '20px'}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h4 style="margin: 0 0 ${isMobile ? '8px' : '10px'} 0; color: #2c3e50; font-size: ${isMobile ? '14px' : '16px'};"><i class="fas fa-chart-pie"></i> Resumen</h4>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${isMobile ? '8px' : '10px'}; font-size: ${isMobile ? '12px' : '14px'};">
                    <div style="text-align: center; padding: ${isMobile ? '6px' : '8px'}; background: #f8f9fa; border-radius: 4px;">
                        <div style="color: #3498db; font-weight: bold; font-size: ${isMobile ? '16px' : '18px'};">${ruta ? ruta.length : 0}</div>
                        <div style="color: #7f8c8d; font-size: ${isMobile ? '10px' : '12px'};">Pasos</div>
                    </div>
                    <div style="text-align: center; padding: ${isMobile ? '6px' : '8px'}; background: #f8f9fa; border-radius: 4px;">
                        <div style="color: #27ae60; font-weight: bold; font-size: ${isMobile ? '16px' : '18px'};">${Math.round(distanciaTotal)}</div>
                        <div style="color: #7f8c8d; font-size: ${isMobile ? '10px' : '12px'};">Metros</div>
                    </div>
                </div>
                ${edificioInfo ? `
                    <div style="margin-top: ${isMobile ? '8px' : '10px'}; padding: ${isMobile ? '8px' : '10px'}; background: #e8f5e8; border-radius: 4px; border-left: 4px solid #27ae60;">
                        <strong style="color: #27ae60; font-size: ${isMobile ? '12px' : '14px'};"><i class="fas fa-building"></i> Destino:</strong> Edificio ${edificioDestino}<br>

                        <span style="color: #2c3e50; font-size: ${isMobile ? '11px' : '13px'};">${edificioInfo.nombre}</span>
                    </div>
                ` : ''}
            </div>
            
            <!-- Lista de Pasos -->
            <div style="margin-bottom: ${isMobile ? '15px' : '20px'};">
                <h4 style="margin: 0 0 ${isMobile ? '10px' : '15px'} 0; color: #2c3e50; font-size: ${isMobile ? '14px' : '16px'};"><i class="fas fa-route"></i> Pasos de la Ruta</h4>

                <div style="max-height: ${isMobile ? '300px' : '400px'}; overflow-y: auto;">
                    ${pasosDetallados.map((paso, index) => {
        const icono = paso.esInicio ? '▶' : paso.esDestino ? '●' : (index + 1).toString();
        const color = paso.esInicio ? '#27ae60' : paso.esDestino ? '#e74c3c' : '#3498db';
        const tipo = paso.esInicio ? 'Inicio' : paso.esDestino ? 'Destino' : `Paso ${paso.numero}`;

        return `
                            <div style="display: flex; align-items: flex-start; margin-bottom: ${isMobile ? '8px' : '12px'}; padding: ${isMobile ? '8px' : '10px'}; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <div style="flex-shrink: 0; width: ${isMobile ? '25px' : '30px'}; height: ${isMobile ? '25px' : '30px'}; background: ${color}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: ${isMobile ? '12px' : '14px'}; margin-right: ${isMobile ? '8px' : '12px'};">
                                    ${icono}
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: bold; color: ${color}; margin-bottom: 2px; font-size: ${isMobile ? '12px' : '14px'};">${tipo}</div>
                                    <div style="color: #2c3e50; font-size: ${isMobile ? '11px' : '13px'}; margin-bottom: 4px; line-height: 1.3;">${paso.nodo.descripcion}</div>
                                    ${paso.distancia > 0 ? `<div style="color: #7f8c8d; font-size: ${isMobile ? '10px' : '12px'};">Distancia: ${Math.round(paso.distancia)}m</div>` : ''}
                                </div>
                            </div>
                        `;
    }).join('')}
                </div>
            </div>
            
            <!-- Información de Acceso -->
            <div style="background: white; padding: ${isMobile ? '12px' : '15px'}; border-radius: 8px; margin-bottom: ${isMobile ? '15px' : '20px'}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h4 style="margin: 0 0 ${isMobile ? '8px' : '10px'} 0; color: #2c3e50; font-size: ${isMobile ? '14px' : '16px'};"><i class="fas fa-door-open"></i> Punto de Inicio</h4>

                <div style="color: #2c3e50; font-size: ${isMobile ? '12px' : '14px'};">
                    ${accesoInicio === 'acceso_principal' ? 'Acceso Principal' :
            accesoInicio === 'acceso_visitantes' ? 'Acceso Visitantes' :
                accesoInicio === 'acceso_hangar' ? 'Acceso Hangar' :
                    `${accesoInicio}`}
                </div>

            </div>
            
            <!-- Consejos de Navegación -->
            <div style="background: #fff3cd; padding: ${isMobile ? '12px' : '15px'}; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h4 style="margin: 0 0 ${isMobile ? '8px' : '10px'} 0; color: #856404; font-size: ${isMobile ? '14px' : '16px'};"><i class="fas fa-info-circle"></i> Consejos</h4>

                <ul style="margin: 0; padding-left: ${isMobile ? '16px' : '20px'}; color: #856404; font-size: ${isMobile ? '11px' : '13px'}; line-height: 1.4;">
                    <li>Sigue los marcadores numerados en orden</li>
                    <li>Los marcadores de color indican el tipo de punto</li>
                    <li>Verde: Inicio, Rojo: Destino, Azul: Pasos</li>
                    <li>Mantén el mapa centrado para mejor orientación</li>
                </ul>
            </div>
        </div>
    `;

    // Insertar HTML en el panel
    panelContainer.innerHTML = htmlPanel;

    console.log('✅ Panel de información de ruta creado correctamente');
}

/**
 * Anima el trazado progresivo de la ruta accesible
 * @param {Array} ruta - Array de IDs de nodos de la ruta
 * @param {Object} mapa - Instancia del mapa de Leaflet
 * @param {Object} options - Opciones de animación
 */
function animarTrazadoRuta(ruta, mapa, options = {}) {
    console.log('🎬 Iniciando animación progresiva de ruta...');

    // Configuración por defecto
    const config = {
        velocidad: options.velocidad || 1500, // ms entre pasos
        colorActivo: options.colorActivo || '#ff6b6b',
        colorCompletado: options.colorCompletado || '#4ecdc4',
        grosorLinea: options.grosorLinea || 6,
        mostrarControles: options.mostrarControles !== false,
        autoPlay: options.autoPlay !== false,
        destacarNodos: options.destacarNodos !== false,
        ...options
    };

    // Verificar que tenemos una ruta válida
    if (!ruta || ruta.length < 2) {
        console.warn('⚠️ No hay ruta válida para animar');
        return;
    }

    const nodos = obtenerTodosLosNodos();

    // Validar que todos los nodos de la ruta tienen coordenadas válidas
    const nodosInvalidos = [];
    ruta.forEach(nodoId => {
        const nodo = nodos.find(n => n.id === nodoId);
        if (!nodo || !nodo.coords || !Array.isArray(nodo.coords) || nodo.coords.length < 2) {
            nodosInvalidos.push(nodoId);
        }
    });

    if (nodosInvalidos.length > 0) {
        console.error('❌ Nodos con coordenadas inválidas en la ruta:', nodosInvalidos);
        console.warn('⚠️ No se puede animar la ruta con coordenadas inválidas');
        return;
    }
    let polylinesAnimados = [];
    let marcadoresAnimados = [];
    let pasoActual = 0;
    let animacionActiva = false;
    let intervaloAnimacion = null;

    // Limpiar animaciones anteriores
    limpiarAnimacionRuta();

    // Crear controles de animación si está habilitado
    if (config.mostrarControles) {
        crearControlesAnimacion(mapa, config);
    }

    /**
     * Función para limpiar la animación actual
     */
    function limpiarAnimacionRuta() {
        // Limpiar polylines animados
        polylinesAnimados.forEach(polyline => {
            if (mapa && mapa.removeLayer) {
                mapa.removeLayer(polyline);
            }
        });

        // Limpiar marcadores animados
        marcadoresAnimados.forEach(marker => {
            if (mapa && mapa.removeLayer) {
                mapa.removeLayer(marker);
            }
        });

        // Limpiar controles de animación
        const controlesContainer = document.getElementById('controlesAnimacion');
        if (controlesContainer) {
            controlesContainer.remove();
        }

        polylinesAnimados = [];
        marcadoresAnimados = [];
        pasoActual = 0;
        animacionActiva = false;

        if (intervaloAnimacion) {
            clearInterval(intervaloAnimacion);
            intervaloAnimacion = null;
        }
    }

    /**
     * Función para crear controles de animación
     */
    function crearControlesAnimacion(mapa, config) {
        // Detectar si es móvil para optimizar controles
        const isMobile = window.innerWidth <= 768;

        // Crear contenedor de controles
        const controlesContainer = document.createElement('div');
        controlesContainer.id = 'controlesAnimacion';
        controlesContainer.style.cssText = `
            position: absolute;
            top: ${isMobile ? '15px' : '10px'};
            left: ${isMobile ? '15px' : '10px'};
            z-index: 1000;
            background: rgba(255, 255, 255, 0.95);
            border-radius: ${isMobile ? '12px' : '8px'};
            padding: ${isMobile ? '12px' : '10px'};
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: flex;
            gap: ${isMobile ? '10px' : '8px'};
            align-items: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            backdrop-filter: blur(10px);
        `;

        // Botón Play/Pause
        const btnPlayPause = document.createElement('button');
        btnPlayPause.id = 'btnPlayPause';
        btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';

        btnPlayPause.style.cssText = `
            background: #27ae60;
            color: white;
            border: none;
            border-radius: ${isMobile ? '8px' : '4px'};
            padding: ${isMobile ? '12px 16px' : '8px 12px'};
            cursor: pointer;
            font-size: ${isMobile ? '16px' : '14px'};
            min-width: ${isMobile ? '48px' : 'auto'};
            min-height: ${isMobile ? '48px' : 'auto'};
            transition: transform 0.2s ease;
        `;

        // Efecto hover para desktop
        if (!isMobile) {
            btnPlayPause.addEventListener('mouseenter', () => {
                btnPlayPause.style.transform = 'scale(1.05)';
            });
            btnPlayPause.addEventListener('mouseleave', () => {
                btnPlayPause.style.transform = 'scale(1)';
            });
        }

        // Botón Stop
        const btnStop = document.createElement('button');
        btnStop.innerHTML = '<i class="fas fa-stop"></i>';

        btnStop.style.cssText = `
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: ${isMobile ? '8px' : '4px'};
            padding: ${isMobile ? '12px 16px' : '8px 12px'};
            cursor: pointer;
            font-size: ${isMobile ? '16px' : '14px'};
            min-width: ${isMobile ? '48px' : 'auto'};
            min-height: ${isMobile ? '48px' : 'auto'};
            transition: transform 0.2s ease;
        `;

        // Efecto hover para desktop
        if (!isMobile) {
            btnStop.addEventListener('mouseenter', () => {
                btnStop.style.transform = 'scale(1.05)';
            });
            btnStop.addEventListener('mouseleave', () => {
                btnStop.style.transform = 'scale(1)';
            });
        }

        // Indicador de progreso
        const indicador = document.createElement('span');
        indicador.id = 'indicadorProgreso';
        indicador.style.cssText = `
            font-size: ${isMobile ? '14px' : '12px'};
            color: #666;
            margin-left: ${isMobile ? '12px' : '8px'};
            font-weight: ${isMobile ? '500' : 'normal'};
            min-width: ${isMobile ? '120px' : 'auto'};
        `;

        // Event listeners
        btnPlayPause.addEventListener('click', () => {
            if (animacionActiva) {
                pausarAnimacion();
            } else {
                iniciarAnimacion();
            }
        });

        btnStop.addEventListener('click', () => {
            detenerAnimacion();
        });

        // Agregar elementos al contenedor
        controlesContainer.appendChild(btnPlayPause);
        controlesContainer.appendChild(btnStop);
        controlesContainer.appendChild(indicador);

        // Agregar al mapa
        if (mapa && mapa.getContainer) {
            mapa.getContainer().appendChild(controlesContainer);
        }
    }

    /**
     * Función para iniciar la animación
     */
    function iniciarAnimacion() {
        if (animacionActiva) return;

        console.log('▶️ Iniciando animación de ruta');
        animacionActiva = true;

        // Actualizar botón
        const btnPlayPause = document.getElementById('btnPlayPause');
        if (btnPlayPause) {
            btnPlayPause.innerHTML = '<i class="fas fa-pause"></i>';
        }


        // Iniciar intervalo de animación
        intervaloAnimacion = setInterval(() => {
            if (pasoActual < ruta.length - 1) {
                animarSiguientePaso();
                pasoActual++;
            } else {
                completarAnimacion();
            }
        }, config.velocidad);
    }

    /**
     * Función para pausar la animación
     */
    function pausarAnimacion() {
        console.log('⏸️ Pausando animación de ruta');
        animacionActiva = false;

        if (intervaloAnimacion) {
            clearInterval(intervaloAnimacion);
            intervaloAnimacion = null;
        }

        // Actualizar botón
        const btnPlayPause = document.getElementById('btnPlayPause');
        if (btnPlayPause) {
            btnPlayPause.innerHTML = '▶️';
        }
    }

    /**
     * Función para detener la animación
     */
    function detenerAnimacion() {
        console.log('⏹️ Deteniendo animación de ruta');
        limpiarAnimacionRuta();

        // Actualizar botón
        const btnPlayPause = document.getElementById('btnPlayPause');
        if (btnPlayPause) {
            btnPlayPause.innerHTML = '▶️';
        }

        // Actualizar indicador
        const indicador = document.getElementById('indicadorProgreso');
        if (indicador) {
            indicador.textContent = 'Animación detenida';
        }
    }

    /**
     * Función para animar el siguiente paso
     */
    function animarSiguientePaso() {
        if (pasoActual >= ruta.length - 1) return;

        const nodoActual = nodos.find(n => n.id === ruta[pasoActual]);
        const nodoSiguiente = nodos.find(n => n.id === ruta[pasoActual + 1]);

        if (!nodoActual || !nodoSiguiente) return;

        // Crear polyline animado
        const polylineAnimado = L.polyline([nodoActual.coords, nodoSiguiente.coords], {
            color: config.colorActivo,
            weight: config.grosorLinea,
            opacity: 0.8,
            className: 'polyline-animado'
        }).addTo(mapa);

        polylinesAnimados.push(polylineAnimado);

        // Destacar nodo activo si está habilitado
        if (config.destacarNodos) {
            const marcadorActivo = L.marker(nodoActual.coords, {
                icon: crearMarcadoresMejorados(nodoActual.coords, 'nodoActivo', pasoActual + 1, `Paso ${pasoActual + 1} - ${nodoActual.descripcion}`)
            }).addTo(mapa);

            marcadoresAnimados.push(marcadorActivo);

            // Remover marcador anterior después de un tiempo
            setTimeout(() => {
                if (mapa && mapa.removeLayer && marcadorActivo) {
                    mapa.removeLayer(marcadorActivo);
                }
            }, config.velocidad * 0.8);
        }

        // Actualizar indicador de progreso
        const indicador = document.getElementById('indicadorProgreso');
        if (indicador) {
            indicador.textContent = `Paso ${pasoActual + 1}/${ruta.length - 1}`;
        }

        console.log(`🎬 Animando paso ${pasoActual + 1}: ${nodoActual.descripcion} → ${nodoSiguiente.descripcion}`);
    }

    /**
     * Función para completar la animación
     */
    function completarAnimacion() {
        console.log('✅ Animación de ruta completada');
        animacionActiva = false;

        if (intervaloAnimacion) {
            clearInterval(intervaloAnimacion);
            intervaloAnimacion = null;
        }

        // Cambiar color de todos los polylines a completado
        polylinesAnimados.forEach(polyline => {
            polyline.setStyle({
                color: config.colorCompletado,
                opacity: 0.9
            });
        });

        // Actualizar botón
        const btnPlayPause = document.getElementById('btnPlayPause');
        if (btnPlayPause) {
            btnPlayPause.innerHTML = '🔄';
            btnPlayPause.onclick = () => reiniciarAnimacion();
        }

        // Actualizar indicador
        const indicador = document.getElementById('indicadorProgreso');
        if (indicador) {
            indicador.textContent = 'Ruta completada';
        }
    }

    /**
     * Función para reiniciar la animación
     */
    function reiniciarAnimacion() {
        console.log('🔄 Reiniciando animación de ruta');
        limpiarAnimacionRuta();

        // Recrear controles
        if (config.mostrarControles) {
            crearControlesAnimacion(mapa, config);
        }

        // Iniciar animación automáticamente
        if (config.autoPlay) {
            setTimeout(() => {
                iniciarAnimacion();
            }, 500);
        }
    }

    // Iniciar animación automáticamente si está habilitado
    if (config.autoPlay) {
        setTimeout(() => {
            iniciarAnimacion();
        }, 1000);
    }

    // Exportar funciones de control globalmente
    window.animacionRuta = {
        iniciar: iniciarAnimacion,
        pausar: pausarAnimacion,
        detener: detenerAnimacion,
        reiniciar: reiniciarAnimacion,
        limpiar: limpiarAnimacionRuta
    };

    console.log('✅ Animación de ruta configurada correctamente');
    return {
        iniciar: iniciarAnimacion,
        pausar: pausarAnimacion,
        detener: detenerAnimacion,
        reiniciar: reiniciarAnimacion,
        limpiar: limpiarAnimacionRuta
    };
}

/**
 * Agrega numeración visual a los nodos de la ruta
 * @param {Array} ruta - Array de IDs de nodos de la ruta
 * @param {Object} mapa - Instancia del mapa de Leaflet
 * @param {Object} options - Opciones de numeración
 */
function agregarNumeracionVisual(ruta, mapa, options = {}) {
    console.log('🔢 Agregando numeración visual a nodos...');

    // Configuración por defecto
    const config = {
        tamañoNumero: options.tamañoNumero || 16,
        colorFondo: options.colorFondo || '#ffffff',
        colorTexto: options.colorTexto || '#2c3e50',
        colorBorde: options.colorBorde || '#3498db',
        grosorBorde: options.grosorBorde || 2,
        radio: options.radio || 20,
        mostrarSoloEnRuta: options.mostrarSoloEnRuta !== false,
        offsetY: options.offsetY || -10,
        ...options
    };

    // Limpiar numeración anterior
    limpiarNumeracionVisual(mapa);

    if (!ruta || ruta.length === 0) {
        console.warn('⚠️ No hay ruta para numerar');
        return;
    }

    const nodos = obtenerTodosLosNodos();
    let marcadoresNumeracion = [];

    ruta.forEach((nodoId, index) => {
        const nodo = nodos.find(n => n.id === nodoId);
        if (!nodo) {
            console.warn(`⚠️ Nodo ${nodoId} no encontrado en la ruta`);
            return;
        }

        // Validar coordenadas del nodo
        if (!nodo.coords || !Array.isArray(nodo.coords) || nodo.coords.length < 2) {
            console.error(`❌ Coordenadas inválidas para nodo ${nodoId}:`, nodo.coords);
            return;
        }

        // Crear HTML del número
        const numero = index + 1;
        const htmlNumero = `
            <div style="
                background: ${config.colorFondo};
                color: ${config.colorTexto};
                border: ${config.grosorBorde}px solid ${config.colorBorde};
                border-radius: 50%;
                width: ${config.radio * 2}px;
                height: ${config.radio * 2}px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: ${config.tamañoNumero}px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                position: relative;
                z-index: 1000;
            ">
                ${numero}
            </div>
        `;

        // Crear icono personalizado
        const iconoNumeracion = L.divIcon({
            className: 'marcador-numeracion',
            html: htmlNumero,
            iconSize: [config.radio * 2, config.radio * 2],
            iconAnchor: [config.radio, config.radio + config.offsetY],
            popupAnchor: [0, -(config.radio + config.offsetY)]
        });

        // Crear marcador
        const marcadorNumero = L.marker(nodo.coords, {
            icon: iconoNumeracion
        }).addTo(mapa);

        // Agregar tooltip mejorado
        const tipoNodo = index === 0 ? 'inicio' : index === ruta.length - 1 ? 'destino' : 'paso';
        const iconoTipo = index === 0 ? '▶' : index === ruta.length - 1 ? '●' : numero.toString();
        const colorTipo = index === 0 ? '#27ae60' : index === ruta.length - 1 ? '#e74c3c' : '#3498db';

        marcadorNumero.bindTooltip(`
            <div style="text-align: center; font-size: 14px; min-width: 200px;">
                <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                    <div style="
                        background: ${colorTipo};
                        color: white;
                        border-radius: 50%;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        margin-right: 8px;
                    ">${iconoTipo}</div>
                    <strong style="color: ${colorTipo};">Paso ${numero}</strong>
                </div>
                <div style="color: #2c3e50; font-size: 13px; margin-bottom: 4px;">${nodo.descripcion}</div>
                <div style="color: #7f8c8d; font-size: 11px;">
                    ${tipoNodo === 'inicio' ? '📍 Punto de partida' :
                tipoNodo === 'destino' ? '🎯 Punto de llegada' :
                    '📍 Punto intermedio'}
                </div>
            </div>
        `, {
            permanent: false,
            direction: 'top',
            className: 'tooltip-numeracion-mejorado',
            offset: [0, -5]
        });

        // Agregar popup con información detallada
        marcadorNumero.bindPopup(`
            <div style="text-align: center; min-width: 250px;">
                <div style="margin-bottom: 15px;">
                    <div style="
                        background: ${colorTipo};
                        color: white;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        font-weight: bold;
                        margin: 0 auto 10px auto;
                    ">${iconoTipo}</div>
                    <h4 style="margin: 0 0 5px 0; color: ${colorTipo};">Paso ${numero}</h4>
                    <p style="margin: 0; font-size: 12px; color: #7f8c8d;">
                        ${tipoNodo === 'inicio' ? 'Punto de partida de la ruta' :
                tipoNodo === 'destino' ? 'Punto de llegada de la ruta' :
                    'Punto intermedio de la ruta'}
                    </p>
                </div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                    <p style="margin: 0; font-weight: bold; color: #2c3e50; font-size: 14px;">${nodo.descripcion}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
                    <div style="text-align: center; padding: 8px; background: #e8f5e8; border-radius: 4px;">
                        <div style="color: #27ae60; font-weight: bold; font-size: 16px;">${numero}</div>
                        <div style="color: #7f8c8d;">Paso</div>
                    </div>
                    <div style="text-align: center; padding: 8px; background: #e3f2fd; border-radius: 4px;">
                        <div style="color: #2196f3; font-weight: bold; font-size: 16px;">${ruta.length}</div>
                        <div style="color: #7f8c8d;">Total</div>
                    </div>
                </div>
                ${index > 0 ? `
                    <div style="margin-top: 10px; padding: 8px; background: #fff3cd; border-radius: 4px; border-left: 4px solid #ffc107;">
                        <div style="color: #856404; font-size: 11px; font-weight: bold;">📏 Distancia desde paso anterior</div>
                        <div style="color: #856404; font-size: 10px;">Calculada automáticamente</div>
                    </div>
                ` : ''}
            </div>
        `, {
            maxWidth: 280,
            className: 'popup-numeracion-mejorado'
        });

        marcadoresNumeracion.push(marcadorNumero);
    });

    // Guardar referencia global para limpieza
    window.marcadoresNumeracion = marcadoresNumeracion;

    console.log(`✅ Numeración visual agregada a ${marcadoresNumeracion.length} nodos`);
    return marcadoresNumeracion;
}

/**
 * Limpia la numeración visual anterior
 * @param {Object} mapa - Instancia del mapa de Leaflet
 */
function limpiarNumeracionVisual(mapa) {
    if (window.marcadoresNumeracion && Array.isArray(window.marcadoresNumeracion)) {
        window.marcadoresNumeracion.forEach(marcador => {
            if (mapa && mapa.removeLayer && marcador) {
                mapa.removeLayer(marcador);
            }
        });
        window.marcadoresNumeracion = [];
        console.log('🧹 Numeración visual anterior limpiada');
    }
}

/**
 * Inicializa el mapa accesible interactivo para navegación
 * @param {number} edificioDestino - ID del edificio de destino
 * @param {Array} coordsUsuario - Coordenadas del usuario [lat, lng]
 * @param {string} accesoInicio - Acceso de inicio seleccionado
 */
async function inicializarMapaAccesibleInteractivo(edificioDestino, coordsUsuario, accesoInicio = 'acceso_visitantes') {
    console.log('🗺️ Inicializando mapa accesible interactivo...');

    // Detectar si es dispositivo móvil (definir al inicio para todo el scope)
    const isMobile = window.innerWidth <= 768;

    try {

        // Crear o buscar el contenedor del mapa accesible
        let mapaAccesibleEmergente = document.getElementById('mapaAccesibleEmergente');
        let mapContainer = document.getElementById('mapaAccesible');

        // Si no existe, crear el contenedor del mapa accesible
        if (!mapaAccesibleEmergente) {
            console.log('📱 Creando contenedor del mapa accesible...');
            mapaAccesibleEmergente = document.createElement('div');
            mapaAccesibleEmergente.id = 'mapaAccesibleEmergente';
            mapaAccesibleEmergente.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: none;
        `;

            // Detectar si es dispositivo móvil
            const panelWidth = isMobile ? '280px' : '350px';
            const modalWidth = isMobile ? '98%' : '95%';
            const modalHeight = isMobile ? '98%' : '95%';

            mapaAccesibleEmergente.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: ${modalWidth}; height: ${modalHeight}; background: white; border-radius: ${isMobile ? '12px' : '8px'}; box-shadow: 0 4px 20px rgba(0,0,0,0.3); display: flex; flex-direction: column;">
                <!-- Header del Modal -->
                <div style="padding: ${isMobile ? '12px' : '15px'}; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                    <h3 style="margin: 0; color: #333; font-size: ${isMobile ? '16px' : '18px'};">🗺️ Navegación Accesible</h3>
                    <button id="cerrarMapaAccesibleBtn" style="background: #e74c3c; color: white; border: none; padding: ${isMobile ? '6px 12px' : '8px 15px'}; border-radius: 4px; cursor: pointer; font-size: ${isMobile ? '12px' : '14px'};">✕ Cerrar</button>
                </div>
                
                <!-- Barra de información rápida -->
                <div id="distanciaAccesible" style="padding: ${isMobile ? '8px' : '10px'}; text-align: center; background: #f8f9fa; border-bottom: 1px solid #eee; flex-shrink: 0; font-size: ${isMobile ? '12px' : '14px'};"></div>
                
                <!-- Contenido principal: Mapa + Panel -->
                <div style="display: flex; flex: 1; overflow: hidden; position: relative;">
                    <!-- Mapa -->
                    <div id="mapaAccesible" style="flex: 1; height: 100%;"></div>
                    
                    <!-- Panel de Información Lateral -->
                    <div id="panelInformacionRuta" style="width: ${isMobile ? '0px' : panelWidth}; background: #f8f9fa; border-left: 1px solid #dee2e6; overflow-y: auto; flex-shrink: 0; transition: width 0.3s ease; position: ${isMobile ? 'absolute' : 'relative'}; right: 0; top: 0; height: 100%; z-index: 1000;">
                        <!-- Contenido del panel se llena dinámicamente -->
                    </div>
                    
                    <!-- Botón para colapsar/expandir panel -->
                    <div id="togglePanelBtn" style="position: absolute; top: 50%; right: ${isMobile ? '10px' : panelWidth}; transform: translateY(-50%); width: ${isMobile ? '40px' : '30px'}; height: ${isMobile ? '80px' : '60px'}; background: #6c757d; color: white; border: none; border-radius: ${isMobile ? '20px 0 0 20px' : '15px 0 0 15px'}; cursor: pointer; z-index: 1001; display: flex; align-items: center; justify-content: center; font-size: ${isMobile ? '18px' : '16px'}; transition: right 0.3s ease;" title="${isMobile ? 'Ver información' : 'Colapsar panel'}">
                        ${isMobile ? '📋' : '◀'}
                    </div>
                </div>
            </div>
        `;

            document.body.appendChild(mapaAccesibleEmergente);
            mapContainer = document.getElementById('mapaAccesible');
        }

        if (!mapContainer) {
            console.error('❌ No se pudo crear el contenedor del mapa accesible');
            return;
        }

        // Mostrar el mapa accesible emergente
        mapaAccesibleEmergente.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Obtener información del edificio de destino (SOLUCIÓN CRÍTICA: Función async)
        console.log('🔍 Obteniendo información del edificio:', edificioDestino);
        const edificioInfo = await obtenerInfoEdificio(edificioDestino);

        if (!edificioInfo) {
            console.error('❌ No se pudo obtener información del edificio:', edificioDestino);
            return;
        }

        console.log('✅ Información del edificio obtenida:', edificioInfo);

        // Crear el mapa accesible
        let mapa;
        if (typeof window.map !== 'undefined' && window.map) {
            // Limpiar mapa existente
            window.map.remove();
        }

        // Crear nuevo mapa centrado en el campus (SOLUCIÓN #3: Verificar contenedor)
        const contenedorMapa = document.getElementById('mapaAccesible');

        if (!contenedorMapa) {
            console.error('❌ Error: Contenedor del mapa #mapaAccesible no encontrado');
            console.error('🔍 Elementos disponibles en el DOM:', document.querySelectorAll('[id*="mapa"]'));
            throw new Error('No se puede inicializar el mapa: contenedor #mapaAccesible no existe');
        }

        console.log('✅ Contenedor del mapa encontrado:', contenedorMapa);
        mapa = L.map('mapaAccesible').setView([19.0695, -98.1695], 18);

        // Agregar capa de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapa);

        // Guardar zoom inicial y bloquear cambios de zoom
        const zoomInicial = 18;

        // Bloquear el zoom - mantener siempre el zoom inicial
        mapa.on('zoomend', function () {
            if (mapa.getZoom() !== zoomInicial) {
                mapa.setZoom(zoomInicial);
            }
        });

        // Bloquear zoom con rueda del mouse
        mapa.scrollWheelZoom.disable();

        // Bloquear zoom con botones + y -
        mapa.doubleClickZoom.disable();

        // Guardar referencia global
        window.map = mapa;

        // Dibujar rutas accesibles CON FILTRADO INTELIGENTE
        dibujarRutasAccesiblesEnMapa(mapa, edificioDestino, accesoInicio);

        // Agregar marcador del destino mejorado (SOLUCIÓN #1: Validar coordenadas)
        console.log('🔍 Validando coordenadas del edificio destino:', edificioInfo.coords);
        let marcadorDestinoEdificio = null;

        if (edificioInfo.coords && Array.isArray(edificioInfo.coords) && edificioInfo.coords.length >= 2) {
            console.log('✅ Coordenadas del edificio válidas, creando marcador...');

            const iconoDestino = crearMarcadoresMejorados(edificioInfo.coords, 'destino', null, `Edificio ${edificioDestino} - ${edificioInfo.nombre}`);

            if (iconoDestino) {
                marcadorDestinoEdificio = L.marker(edificioInfo.coords, {
                    icon: iconoDestino
                }).addTo(mapa);

                console.log('✅ Marcador del edificio destino creado exitosamente');
            } else {
                console.error('❌ Error: No se pudo crear icono para edificio destino');
                // Fallback: usar marcador por defecto
                marcadorDestinoEdificio = L.marker(edificioInfo.coords).addTo(mapa);
                console.log('⚠️ Usando marcador por defecto para edificio destino');
            }
        } else {
            console.error('❌ Error: Coordenadas del edificio destino inválidas:', edificioInfo.coords);
            console.warn('⚠️ No se puede crear marcador para edificio destino');
        }

        // Agregar tooltip mejorado para edificio destino (solo si el marcador existe)
        if (marcadorDestinoEdificio) {
            marcadorDestinoEdificio.bindTooltip(`
        <div style="text-align: center; font-size: 14px;">
            <strong style="color: #e74c3c;">● DESTINO</strong><br>
            <span style="font-size: 12px; color: #666;">Edificio ${edificioDestino}</span><br>
            <span style="font-size: 11px; color: #888;">${edificioInfo.nombre}</span>
        </div>
        `, {
                permanent: false,
                direction: 'top',
                className: 'tooltip-mejorado'
            });

            // También agregar popup para más información
            marcadorDestinoEdificio.bindPopup(`
            <div style="text-align: center;">
                <h4 style="margin: 0 0 5px 0; color: #e74c3c;">🏢 Edificio ${edificioDestino}</h4>
                <p style="margin: 0; font-weight: bold;">${edificioInfo.nombre}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Destino de tu ruta accesible</p>
            </div>
        `);
        }

        // Agregar marcador del usuario mejorado si hay coordenadas (SOLUCIÓN #1: Validar icono)
        if (coordsUsuario && coordsUsuario.length === 2) {
            console.log('🔍 Validando coordenadas del usuario:', coordsUsuario);
            let marcadorUsuario = null;

            const iconoUsuario = crearMarcadoresMejorados(coordsUsuario, 'usuario', null, 'Tu ubicación actual');

            if (iconoUsuario) {
                marcadorUsuario = L.marker(coordsUsuario, {
                    icon: iconoUsuario
                }).addTo(mapa);

                console.log('✅ Marcador del usuario creado exitosamente');
            } else {
                console.error('❌ Error: No se pudo crear icono para usuario');
                // Fallback: usar marcador por defecto
                marcadorUsuario = L.marker(coordsUsuario).addTo(mapa);
                console.log('⚠️ Usando marcador por defecto para usuario');
            }

            // Agregar tooltip mejorado para usuario (solo si el marcador existe)
            if (marcadorUsuario) {
                marcadorUsuario.bindTooltip(`
            <div style="text-align: center; font-size: 14px;">
                <strong style="color: #f39c12;">◉ TU UBICACIÓN</strong><br>
                <span style="font-size: 12px; color: #666;">Posición actual detectada</span>
            </div>
            `, {
                    permanent: false,
                    direction: 'top',
                    className: 'tooltip-mejorado'
                });

                // Guardar referencia global
                window.marcadorUsuario = marcadorUsuario;

                // Centrar el mapa en la ubicación del usuario (manteniendo el zoom fijo)
                mapa.panTo(new L.LatLng(coordsUsuario[0], coordsUsuario[1]));
            }
        }

        // Calcular y mostrar ruta accesible
        if (coordsUsuario && coordsUsuario.length === 2) {
            await calcularRutaAccesible(coordsUsuario, edificioInfo.coords, mapa, accesoInicio, edificioDestino, coordsUsuario);
        }

        // Configurar botón de cerrar
        const cerrarMapaAccesibleBtn = document.getElementById('cerrarMapaAccesibleBtn');
        if (cerrarMapaAccesibleBtn) {
            cerrarMapaAccesibleBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Cerrando modal de navegación accesible...');

                if (mapaAccesibleEmergente) {
                    mapaAccesibleEmergente.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    console.log('✅ Modal cerrado correctamente');
                }
                if (mapa) {
                    mapa.remove();
                    window.map = null;
                    console.log('✅ Mapa removido correctamente');
                }
            });
        } else {
            console.error('❌ No se encontró el botón de cerrar del modal');
        }

        // Configurar botón para colapsar/expandir panel
        const togglePanelBtn = document.getElementById('togglePanelBtn');
        const panelInformacion = document.getElementById('panelInformacionRuta');
        let panelColapsado = isMobile; // En móvil, colapsar por defecto

        if (togglePanelBtn && panelInformacion) {
            togglePanelBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (panelColapsado) {
                    // Expandir panel
                    const newWidth = isMobile ? '280px' : '350px';
                    panelInformacion.style.width = newWidth;
                    togglePanelBtn.style.right = newWidth;
                    togglePanelBtn.innerHTML = isMobile ? '📋' : '◀';
                    togglePanelBtn.title = isMobile ? 'Ocultar información' : 'Colapsar panel';
                    panelColapsado = false;
                    console.log('📋 Panel expandido');
                } else {
                    // Colapsar panel
                    panelInformacion.style.width = '0px';
                    togglePanelBtn.style.right = isMobile ? '10px' : '0px';
                    togglePanelBtn.innerHTML = isMobile ? '📋' : '▶';
                    togglePanelBtn.title = isMobile ? 'Ver información' : 'Expandir panel';
                    panelColapsado = true;
                    console.log('📋 Panel colapsado');
                }

                // Reajustar tamaño del mapa
                if (mapa) {
                    setTimeout(() => {
                        mapa.invalidateSize();
                    }, 300);
                }
            });
        }

        console.log('✅ Mapa accesible interactivo inicializado');

    } catch (error) {
        console.error('❌ Error crítico en inicializarMapaAccesibleInteractivo:', error);
        console.error('📍 Stack trace:', error.stack);

        // Limpiar recursos en caso de error
        try {
            if (typeof window.map !== 'undefined' && window.map) {
                window.map.remove();
                window.map = null;
            }
        } catch (cleanupError) {
            console.error('❌ Error al limpiar recursos:', cleanupError);
        }

        // Mostrar mensaje de error al usuario
        const errorMessage = 'Error al inicializar la navegación accesible. Por favor, recarga la página e inténtalo de nuevo.';
        console.error('💬 Mensaje para el usuario:', errorMessage);

        // Re-throw el error para que sea manejado por el código que llama esta función
        throw error;
    }
}

/**
 * Dibuja las rutas accesibles en el mapa CON FILTRADO INTELIGENTE
 * @param {L.Map} mapa - Instancia del mapa Leaflet
 * @param {number} edificioDestino - ID del edificio de destino (opcional)
 * @param {string} accesoInicio - ID del acceso de inicio (opcional)
 */
function dibujarRutasAccesiblesEnMapa(mapa, edificioDestino = null, accesoInicio = null) {
    console.log('🛤️ Dibujando rutas accesibles en el mapa...');

    // FILTRADO INTELIGENTE: Determinar qué aristas mostrar
    let aristasAMostrar = [];
    let nodosAMostrar = [];

    if (edificioDestino && accesoInicio) {
        // Caso específico: mostrar solo aristas y nodos para este edificio y acceso
        console.log(`🎯 Modo específico: edificio ${edificioDestino} desde ${accesoInicio}`);
        aristasAMostrar = obtenerAristasPorEdificio(edificioDestino, accesoInicio);
        nodosAMostrar = obtenerNodosRelevantes(edificioDestino, accesoInicio);
    } else if (edificioDestino) {
        // Caso edificio específico: mostrar aristas y nodos para este edificio
        console.log(`🎯 Modo edificio específico: edificio ${edificioDestino}`);
        aristasAMostrar = obtenerAristasPorEdificio(edificioDestino);
        nodosAMostrar = obtenerNodosRelevantes(edificioDestino);
    } else {
        // Caso general: mostrar todas las aristas y nodos
        console.log('🎯 Modo general: mostrando todas las aristas y nodos');
        aristasAMostrar = obtenerAristas();
        nodosAMostrar = obtenerTodosLosNodos();
    }

    console.log(`📊 Aristas a mostrar: ${aristasAMostrar.length}`);
    console.log(`📊 Nodos a mostrar: ${nodosAMostrar.length}`);

    if (nodosAMostrar.length === 0) {
        console.warn('⚠️ No hay nodos relevantes para dibujar');
        return;
    }

    // Agrupar nodos filtrados por ruta
    const nodosPorRuta = {};
    nodosAMostrar.forEach(nodo => {
        const ruta = nodo.ruta || 'sin_ruta';
        if (!nodosPorRuta[ruta]) {
            nodosPorRuta[ruta] = [];
        }
        nodosPorRuta[ruta].push(nodo);
    });

    // Colores para cada ruta
    const coloresRutas = {
        'azul': '#3498db',
        'verde': '#27ae60',
        'naranja': '#e67e22',
        'conexion': '#95a5a6'
    };

    // Dibujar cada ruta
    Object.keys(nodosPorRuta).forEach(ruta => {
        const color = coloresRutas[ruta] || '#95a5a6';
        const nodosRuta = nodosPorRuta[ruta];

        // Dibujar nodos
        nodosRuta.forEach(nodo => {
            const marcador = L.circleMarker(nodo.coords, {
                radius: 6,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(mapa);

            // Tooltip con información del nodo
            marcador.bindTooltip(nodo.descripcion, {
                permanent: false,
                direction: 'top'
            });
        });

        // FILTRADO INTELIGENTE: Dibujar solo las aristas filtradas de esta ruta
        const aristasRuta = aristasAMostrar.filter(arista => {
            const nodoDesde = nodosRuta.find(n => n.id === arista.desde);
            const nodoHacia = nodosRuta.find(n => n.id === arista.hacia);
            return nodoDesde && nodoHacia && arista.ruta === ruta;
        });

        console.log(`🔗 Dibujando ${aristasRuta.length} aristas para ruta ${ruta}`);

        aristasRuta.forEach(arista => {
            const nodoDesde = nodosRuta.find(n => n.id === arista.desde);
            const nodoHacia = nodosRuta.find(n => n.id === arista.hacia);

            if (nodoDesde && nodoHacia) {
                L.polyline([nodoDesde.coords, nodoHacia.coords], {
                    color: color,
                    weight: 3,
                    opacity: 0.7
                }).addTo(mapa);
            }
        });
    });

    console.log('✅ Rutas accesibles dibujadas en el mapa con filtrado inteligente');
}

/**
 * Calcula y dibuja la ruta accesible entre dos puntos
 * @param {Array} puntoInicio - Coordenadas de inicio [lat, lng]
 * @param {Array} puntoDestino - Coordenadas de destino [lat, lng]
 * @param {L.Map} mapa - Instancia del mapa Leaflet
 * @param {string} accesoInicio - Acceso de inicio seleccionado
 */
async function calcularRutaAccesible(puntoInicio, puntoDestino, mapa, accesoInicio = 'acceso_visitantes', edificioDestino = null, coordsUsuario = null) {
    console.log('🧭 Calculando ruta accesible...');

    const isMobile = window.innerWidth <= 768;

    // Encontrar nodos más cercanos
    const nodoInicio = encontrarNodoMasCercano(puntoInicio[0], puntoInicio[1]);
    const nodoDestino = encontrarNodoMasCercano(puntoDestino[0], puntoDestino[1]);

    if (!nodoInicio || !nodoDestino) {
        console.warn('⚠️ No se pudieron encontrar nodos cercanos');
        return;
    }

    console.log('📍 Nodo de inicio:', nodoInicio.id);
    console.log('📍 Nodo de destino:', nodoDestino.id);

    // Implementar algoritmo de ruta (Dijkstra simplificado) CON FILTRADO INTELIGENTE
    const edificioDestinoFiltro = edificioDestino === null || edificioDestino === undefined || edificioDestino === '' ? 36 : Number(edificioDestino);
    const edificioDestinoId = Number.isFinite(edificioDestinoFiltro) ? edificioDestinoFiltro : 36;
    const ruta = calcularRutaDijkstra(nodoInicio.id, nodoDestino.id, edificioDestinoId, accesoInicio);

    if (ruta && ruta.length > 0) {
        console.log('✅ Ruta calculada exitosamente:', ruta);

        try {
            // Dibujar la ruta calculada
            console.log('🛤️ Iniciando dibujo de ruta...');
            dibujarRutaCalculada(ruta, mapa, accesoInicio);
            console.log('✅ Ruta dibujada correctamente');

            // Mostrar información de la ruta
            console.log('📊 Mostrando información de ruta...');
            mostrarInformacionRuta(ruta);
            console.log('✅ Información de ruta mostrada');

            // Crear panel de información lateral
            console.log('📋 Creando panel de información...');
            await crearPanelInformacionRuta(ruta, edificioDestino, accesoInicio, coordsUsuario);
            console.log('✅ Panel de información creado');

            // Iniciar animación progresiva de la ruta
            console.log('🎬 Iniciando animación de ruta...');
            const opcionesAnimacion = {
                velocidad: isMobile ? 2000 : 1500, // Más lento en móvil para mejor visualización
                colorActivo: '#ff6b6b',
                colorCompletado: '#4ecdc4',
                grosorLinea: isMobile ? 8 : 6, // Más grueso en móvil
                mostrarControles: true,
                autoPlay: true,
                destacarNodos: true
            };

            animarTrazadoRuta(ruta, mapa, opcionesAnimacion);
            console.log('✅ Animación de ruta iniciada');

            // Agregar numeración visual a los nodos
            console.log('🔢 Agregando numeración visual...');
            const opcionesNumeracion = {
                tamañoNumero: isMobile ? 18 : 16,
                radio: isMobile ? 22 : 20,
                offsetY: isMobile ? -12 : -10,
                colorBorde: '#3498db',
                grosorBorde: isMobile ? 3 : 2
            };

            agregarNumeracionVisual(ruta, mapa, opcionesNumeracion);
            console.log('✅ Numeración visual agregada');

            console.log('🎉 ¡Todas las funcionalidades de la ruta implementadas exitosamente!');

        } catch (error) {
            console.error('❌ Error durante la implementación de la ruta:', error);
            console.error('📍 Stack trace:', error.stack);

            // Intentar al menos dibujar la ruta básica si hay error
            try {
                console.log('🔄 Intentando dibujo básico de ruta...');
                dibujarRutaCalculada(ruta, mapa, accesoInicio);
            } catch (errorBasico) {
                console.error('❌ Error crítico en dibujo básico:', errorBasico);
            }
        }
    } else {
        console.warn('⚠️ No se pudo calcular una ruta accesible');
    }
}

/**
 * Calcula la ruta usando algoritmo de Dijkstra simplificado CON FILTRADO INTELIGENTE
 * @param {string} nodoInicio - ID del nodo de inicio
 * @param {string} nodoDestino - ID del nodo de destino
 * @param {number} edificioDestino - ID del edificio de destino (opcional)
 * @param {string} accesoInicio - ID del acceso de inicio (opcional)
 * @returns {Array} Array de IDs de nodos que forman la ruta
 */
function calcularRutaDijkstra(nodoInicio, nodoDestino, edificioDestino = null, accesoInicio = null) {
    console.log(`🧭 Calculando ruta Dijkstra desde ${nodoInicio} hacia ${nodoDestino}`);

    const nodos = obtenerTodosLosNodos();

    // FILTRADO INTELIGENTE: Usar solo aristas relevantes
    let aristas = [];
    if (edificioDestino && accesoInicio) {
        aristas = obtenerAristasPorEdificio(edificioDestino, accesoInicio);
        console.log(`🎯 Usando aristas filtradas para edificio ${edificioDestino} desde ${accesoInicio}: ${aristas.length}`);
    } else if (edificioDestino) {
        aristas = obtenerAristasPorEdificio(edificioDestino);
        console.log(`🎯 Usando aristas filtradas para edificio ${edificioDestino}: ${aristas.length}`);
    } else {
        aristas = obtenerAristas();
        console.log(`🎯 Usando todas las aristas: ${aristas.length}`);
    }

    // Crear grafo de adyacencia solo con aristas filtradas
    const grafo = {};
    nodos.forEach(nodo => {
        grafo[nodo.id] = [];
    });

    aristas.forEach(arista => {
        const nodoDesde = nodos.find(n => n.id === arista.desde);
        const nodoHacia = nodos.find(n => n.id === arista.hacia);

        if (nodoDesde && nodoHacia) {
            const distancia = calcularDistanciaHaversine(
                nodoDesde.coords[0], nodoDesde.coords[1],
                nodoHacia.coords[0], nodoHacia.coords[1]
            );

            grafo[arista.desde].push({ id: arista.hacia, distancia });
            grafo[arista.hacia].push({ id: arista.desde, distancia });
        }
    });

    // Dijkstra simplificado
    const distancias = {};
    const previos = {};
    const visitados = new Set();
    const cola = [];

    // Inicializar distancias
    nodos.forEach(nodo => {
        distancias[nodo.id] = nodo.id === nodoInicio ? 0 : Infinity;
        cola.push({ id: nodo.id, distancia: distancias[nodo.id] });
    });

    while (cola.length > 0) {
        // Encontrar nodo con menor distancia
        cola.sort((a, b) => a.distancia - b.distancia);
        const actual = cola.shift();

        if (visitados.has(actual.id)) continue;
        visitados.add(actual.id);

        if (actual.id === nodoDestino) break;

        // Actualizar distancias de vecinos
        grafo[actual.id].forEach(vecino => {
            const nuevaDistancia = distancias[actual.id] + vecino.distancia;
            if (nuevaDistancia < distancias[vecino.id]) {
                distancias[vecino.id] = nuevaDistancia;
                previos[vecino.id] = actual.id;
                cola.push({ id: vecino.id, distancia: nuevaDistancia });
            }
        });
    }

    // Reconstruir ruta
    const ruta = [];
    let actual = nodoDestino;

    while (actual !== undefined) {
        ruta.unshift(actual);
        actual = previos[actual];
    }

    const rutaValida = ruta.length > 1 ? ruta : null;
    console.log(`✅ Ruta calculada: ${rutaValida ? rutaValida.join(' → ') : 'No encontrada'}`);
    return rutaValida;
}

/**
 * Dibuja la ruta calculada en el mapa
 * @param {Array} ruta - Array de IDs de nodos de la ruta
 * @param {L.Map} mapa - Instancia del mapa Leaflet
 * @param {string} accesoInicio - Acceso de inicio para determinar el color de la ruta
 */
function dibujarRutaCalculada(ruta, mapa, accesoInicio = 'acceso_visitantes') {
    console.log('🛤️ Dibujando ruta calculada...');

    const nodos = obtenerTodosLosNodos();
    const coordenadasRuta = [];

    ruta.forEach(nodoId => {
        const nodo = nodos.find(n => n.id === nodoId);
        if (nodo) {
            coordenadasRuta.push(nodo.coords);
        }
    });

    if (coordenadasRuta.length > 1) {
        // Determinar el color de la ruta según el acceso de inicio
        let colorRuta = '#e74c3c'; // Color por defecto (rojo)

        if (accesoInicio === 'acceso_principal') {
            colorRuta = '#e67e22'; // Naranja para ruta naranja
        } else if (accesoInicio === 'acceso_visitantes') {
            colorRuta = '#3498db'; // Azul para ruta azul
        }

        console.log(`🎨 Usando color ${colorRuta} para ruta desde ${accesoInicio}`);

        // Dibujar línea de la ruta
        L.polyline(coordenadasRuta, {
            color: colorRuta,
            weight: 5,
            opacity: 0.8,
            dashArray: '10, 5'
        }).addTo(mapa);

        // Validar coordenadas antes de crear marcadores
        const coordenadaInicio = coordenadasRuta[0];
        const coordenadaDestino = coordenadasRuta[coordenadasRuta.length - 1];

        console.log('🔍 Validando coordenadas:', {
            inicio: coordenadaInicio,
            destino: coordenadaDestino,
            totalCoordenadas: coordenadasRuta.length
        });

        // Marcar inicio y fin con marcadores mejorados (solo si las coordenadas son válidas)
        if (coordenadaInicio && Array.isArray(coordenadaInicio) && coordenadaInicio.length >= 2) {
            console.log('✅ Creando marcador de inicio con coordenadas válidas:', coordenadaInicio);
            const marcadorInicio = L.marker(coordenadaInicio, {
                icon: crearMarcadoresMejorados(coordenadaInicio, 'inicio', null, 'Inicio de ruta accesible')
            }).addTo(mapa);

            // Agregar tooltip mejorado para inicio
            marcadorInicio.bindTooltip(`
                <div style="text-align: center; font-size: 14px;">
                    <strong style="color: #27ae60;">▶ INICIO</strong><br>
                    <span style="font-size: 12px; color: #666;">Punto de partida de la ruta</span>
                </div>
            `, {
                permanent: false,
                direction: 'top',
                className: 'tooltip-mejorado'
            });
        } else {
            console.error('❌ Error: Coordenadas de inicio inválidas:', coordenadaInicio);
        }

        if (coordenadaDestino && Array.isArray(coordenadaDestino) && coordenadaDestino.length >= 2) {
            console.log('✅ Creando marcador de destino con coordenadas válidas:', coordenadaDestino);
            const marcadorDestino = L.marker(coordenadaDestino, {
                icon: crearMarcadoresMejorados(coordenadaDestino, 'destino', null, 'Destino de ruta accesible')
            }).addTo(mapa);

            // Agregar tooltip mejorado para destino
            marcadorDestino.bindTooltip(`
                <div style="text-align: center; font-size: 14px;">
                    <strong style="color: #e74c3c;">● DESTINO</strong><br>
                    <span style="font-size: 12px; color: #666;">Punto de llegada de la ruta</span>
                </div>
            `, {
                permanent: false,
                direction: 'top',
                className: 'tooltip-mejorado'
            });
        } else {
            console.error('❌ Error: Coordenadas de destino inválidas:', coordenadaDestino);
        }
    }
}

/**
 * Muestra información de la ruta calculada
 * @param {Array} ruta - Array de IDs de nodos de la ruta
 */
function mostrarInformacionRuta(ruta) {
    console.log('📊 Información de la ruta:');
    console.log(`📍 Nodos en la ruta: ${ruta.length}`);
    console.log(`🛤️ Ruta: ${ruta.join(' → ')}`);

    // Calcular distancia total
    const nodos = obtenerTodosLosNodos();
    let distanciaTotal = 0;

    for (let i = 0; i < ruta.length - 1; i++) {
        const nodoActual = nodos.find(n => n.id === ruta[i]);
        const nodoSiguiente = nodos.find(n => n.id === ruta[i + 1]);

        if (nodoActual && nodoSiguiente) {
            const distancia = calcularDistanciaHaversine(
                nodoActual.coords[0], nodoActual.coords[1],
                nodoSiguiente.coords[0], nodoSiguiente.coords[1]
            );
            distanciaTotal += distancia;
        }
    }

    console.log(`📏 Distancia total: ${Math.round(distanciaTotal)} metros`);

    // Mostrar información en la interfaz si hay elementos disponibles
    const infoElement = document.getElementById('infoRuta');
    if (infoElement) {
        infoElement.innerHTML = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <h4>🛤️ Ruta Accesible Calculada</h4>
                <p><strong>Nodos:</strong> ${ruta.length}</p>
                <p><strong>Distancia:</strong> ${Math.round(distanciaTotal)} metros</p>
                <p><strong>Ruta:</strong> ${ruta.join(' → ')}</p>
            </div>
        `;
    }
}

// ============================================================================
// EXPORTACIÓN Y CONFIGURACIÓN GLOBAL
// ============================================================================

// Hacer funciones disponibles globalmente
if (typeof window !== 'undefined') {
    window.grafoAccesible = grafoAccesible;
    window.inicializarGrafoAccesible = inicializarGrafoAccesible;
    window.validarEstructuraGrafo = validarEstructuraGrafo;
    window.obtenerNodoPorId = obtenerNodoPorId;
    window.obtenerTodosLosNodos = obtenerTodosLosNodos;
    window.obtenerAristas = obtenerAristas;
    window.obtenerEdificios = obtenerEdificios;
    window.obtenerAccesos = obtenerAccesos;
    window.obtenerRutas = obtenerRutas;
    window.encontrarNodoMasCercano = encontrarNodoMasCercano;
    window.calcularDistanciaHaversine = calcularDistanciaHaversine;
    window.obtenerInformacionGrafo = obtenerInformacionGrafo;

    // Funciones de visualización
    window.crearPanelVisualizacionGrafo = crearPanelVisualizacionGrafo;
    window.actualizarVisualizacionGrafo = actualizarVisualizacionGrafo;
    window.mostrarGrafoEnConsola = mostrarGrafoEnConsola;

    // Funciones de mapa interactivo
    window.inicializarMapaAccesibleInteractivo = inicializarMapaAccesibleInteractivo;
    window.dibujarRutasAccesiblesEnMapa = dibujarRutasAccesiblesEnMapa;
    window.calcularRutaAccesible = calcularRutaAccesible;
    window.crearMarcadoresMejorados = crearMarcadoresMejorados;
    window.crearPanelInformacionRuta = crearPanelInformacionRuta;
    window.animarTrazadoRuta = animarTrazadoRuta;
    window.agregarNumeracionVisual = agregarNumeracionVisual;
    window.limpiarNumeracionVisual = limpiarNumeracionVisual;

    // Funciones de filtrado inteligente
    window.obtenerNodosRelevantes = obtenerNodosRelevantes;

    // Inicializar sistema de navegación accesible
    window.sistemaNavegacionAccesible = {
        rutas: {
            'azul': { id: 'azul', color: '#3498db', nombre: 'Ruta Azul', descripcion: 'Acceso Sur - Edificios 30-36', edificios: [30, 36, 50], nodos: [] },
            'naranja': { id: 'naranja', color: '#e67e22', nombre: 'Ruta Naranja', descripcion: 'Acceso Principal - Edificios 20-29', edificios: [1, 2, 17, 19, 20, 25, 27, 28, 49], nodos: [] },
            'verde': { id: 'verde', color: '#27ae60', nombre: 'Ruta Verde', descripcion: 'Acceso Norte - Edificios 3-53', edificios: [3, 41, 45, 51, 53], nodos: [] }
        },
        edificiosAccesibles: [],
        accesos: {}
    };

    // Poblar datos desde el grafo
    if (typeof grafoAccesible !== 'undefined') {
        // Llenar accesos
        if (grafoAccesible.accesos) {
            window.sistemaNavegacionAccesible.accesos = grafoAccesible.accesos;
        }

        // Llenar lista de edificios accesibles
        if (grafoAccesible.edificios) {
            window.sistemaNavegacionAccesible.edificiosAccesibles = Object.keys(grafoAccesible.edificios).map(Number);
        }
    }
}

console.log('✅ Mapa accesible cargado - Listo para declarar el grafo');

if (typeof window !== 'undefined') {
    if (typeof window.obtenerInfoEdificio !== 'function') {
        window.obtenerInfoEdificio = function (edificioId) {
            const edificios = window.edificios;
            if (Array.isArray(edificios)) {
                const edificioEncontrado = edificios.find(edificio => {
                    return String(edificio.id || edificio.numero || edificio.edificio) === String(edificioId);
                });
                if (edificioEncontrado) {
                    return edificioEncontrado;
                }
            }

            const nodoId = grafoAccesible.edificios && grafoAccesible.edificios[edificioId];
            const nodo = nodoId ? obtenerNodoPorId(nodoId) : null;
            if (!nodo) {
                return null;
            }

            return {
                id: edificioId,
                nombre: nodo.descripcion || `Edificio ${edificioId}`,
                nombreRuta: nodo.descripcion || `Edificio ${edificioId}`,
                coords: nodo.coords
            };
        };
    }

    if (typeof window.obtenerMapaGlobal !== 'function') {
        window.obtenerMapaGlobal = function () {
            return window.map || null;
        };
    }
}

// ============================================================================
// ESTILOS CSS PERSONALIZADOS PARA MEJORAR LA EXPERIENCIA VISUAL
// ============================================================================

/**
 * Agrega estilos CSS personalizados para mejorar la experiencia visual
 */
function agregarEstilosPersonalizados() {
    // Verificar si los estilos ya fueron agregados
    if (document.getElementById('estilos-rutas-accesibles')) {
        return;
    }

    const estilos = document.createElement('style');
    estilos.id = 'estilos-rutas-accesibles';
    estilos.textContent = `
        /* Estilos para tooltips mejorados */
        .tooltip-mejorado {
            background: rgba(255, 255, 255, 0.98) !important;
            border: 2px solid #3498db !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            backdrop-filter: blur(10px) !important;
        }
        
        .tooltip-numeracion-mejorado {
            background: rgba(255, 255, 255, 0.98) !important;
            border: 2px solid #3498db !important;
            border-radius: 10px !important;
            box-shadow: 0 6px 16px rgba(0,0,0,0.2) !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            backdrop-filter: blur(10px) !important;
            transition: all 0.3s ease !important;
        }
        
        .tooltip-numeracion-mejorado:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 20px rgba(0,0,0,0.25) !important;
        }
        
        /* Estilos para popups mejorados */
        .popup-numeracion-mejorado {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        }
        
        .popup-numeracion-mejorado .leaflet-popup-content-wrapper {
            border-radius: 12px !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
            backdrop-filter: blur(10px) !important;
        }
        
        .popup-numeracion-mejorado .leaflet-popup-tip {
            background: rgba(255, 255, 255, 0.98) !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }
        
        /* Estilos para marcadores de numeración */
        .marcador-numeracion {
            transition: all 0.3s ease !important;
            cursor: pointer !important;
        }
        
        .marcador-numeracion:hover {
            transform: scale(1.1) !important;
            z-index: 1001 !important;
        }
        
        /* Estilos para polylines animados */
        .polyline-animado {
            stroke-dasharray: 10, 5 !important;
            animation: dash 2s linear infinite !important;
        }
        
        @keyframes dash {
            to {
                stroke-dashoffset: -15 !important;
            }
        }
        
        /* Estilos para controles de animación */
        #controlesAnimacion button {
            transition: all 0.2s ease !important;
            cursor: pointer !important;
        }
        
        #controlesAnimacion button:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
        }
        
        #controlesAnimacion button:active {
            transform: translateY(0) !important;
        }
        
        /* Estilos para panel de información */
        #panelInformacionRuta {
            scrollbar-width: thin !important;
            scrollbar-color: #3498db #f8f9fa !important;
        }
        
        #panelInformacionRuta::-webkit-scrollbar {
            width: 6px !important;
        }
        
        #panelInformacionRuta::-webkit-scrollbar-track {
            background: #f8f9fa !important;
            border-radius: 3px !important;
        }
        
        #panelInformacionRuta::-webkit-scrollbar-thumb {
            background: #3498db !important;
            border-radius: 3px !important;
        }
        
        #panelInformacionRuta::-webkit-scrollbar-thumb:hover {
            background: #2980b9 !important;
        }
        
        /* Animaciones para elementos del panel */
        #panelInformacionRuta > div {
            animation: fadeInUp 0.5s ease-out !important;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Efectos de hover para elementos interactivos */
        #panelInformacionRuta div[style*="background: white"] {
            transition: all 0.2s ease !important;
        }
        
        #panelInformacionRuta div[style*="background: white"]:hover {
            transform: translateX(5px) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        
        /* Estilos responsive para móviles */
        @media (max-width: 768px) {
            .tooltip-mejorado,
            .tooltip-numeracion-mejorado {
                font-size: 14px !important;
                max-width: 250px !important;
            }
            
            .popup-numeracion-mejorado .leaflet-popup-content {
                font-size: 14px !important;
            }
            
            .marcador-numeracion:hover {
                transform: scale(1.05) !important;
            }
            
            #controlesAnimacion {
                font-size: 14px !important;
            }
        }
        
        /* Efectos de carga */
        .cargando-animacion {
            animation: pulse 2s infinite !important;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        /* Estilos para estados de error */
        .error-estilo {
            border: 2px solid #e74c3c !important;
            background: rgba(231, 76, 60, 0.1) !important;
            animation: shake 0.5s ease-in-out !important;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;

    document.head.appendChild(estilos);
    console.log('🎨 Estilos personalizados agregados para mejorar la experiencia visual');
}

// Agregar estilos automáticamente
agregarEstilosPersonalizados();

// ============================================================================
// OPTIMIZACIONES DE RENDIMIENTO Y MEMORIA
// ============================================================================

/**
 * Optimiza el rendimiento limpiando recursos no utilizados
 */
function optimizarRendimiento() {
    console.log('⚡ Optimizando rendimiento y memoria...');

    // Limpiar referencias globales no utilizadas
    if (window.marcadoresNumeracion && window.marcadoresNumeracion.length === 0) {
        window.marcadoresNumeracion = null;
    }

    // Limpiar elementos DOM huérfanos
    const elementosHuérfanos = document.querySelectorAll('[id^="marcador-"], [class*="marcador-"]:not([id])');
    elementosHuérfanos.forEach(elemento => {
        if (!elemento.parentNode) {
            elemento.remove();
        }
    });

    // Forzar garbage collection si está disponible
    if (window.gc && typeof window.gc === 'function') {
        window.gc();
    }

    console.log('✅ Optimización de rendimiento completada');
}

/**
 * Limpia todos los recursos del mapa accesible
 */
function limpiarRecursosMapaAccesible() {
    console.log('🧹 Limpiando recursos del mapa accesible...');

    // Limpiar numeración visual
    if (typeof limpiarNumeracionVisual === 'function') {
        limpiarNumeracionVisual(window.map);
    }

    // Limpiar animación de ruta
    if (window.animacionRuta && typeof window.animacionRuta.limpiar === 'function') {
        window.animacionRuta.limpiar();
    }

    // Limpiar marcadores de usuario
    if (window.marcadorUsuario) {
        if (window.map && window.map.removeLayer) {
            window.map.removeLayer(window.marcadorUsuario);
        }
        window.marcadorUsuario = null;
    }

    // Limpiar panel de información
    const panelContainer = document.getElementById('panelInformacionRuta');
    if (panelContainer) {
        panelContainer.innerHTML = '';
    }

    // Limpiar controles de animación
    const controlesContainer = document.getElementById('controlesAnimacion');
    if (controlesContainer) {
        controlesContainer.remove();
    }

    // Limpiar referencias globales
    window.animacionRuta = null;
    window.marcadoresNumeracion = null;

    console.log('✅ Recursos del mapa accesible limpiados');
}

/**
 * Optimiza la memoria liberando recursos no utilizados
 */
function optimizarMemoria() {
    console.log('💾 Optimizando memoria...');

    // Limpiar event listeners huérfanos
    const botones = document.querySelectorAll('#controlesAnimacion button');
    botones.forEach(boton => {
        if (!boton.parentNode) {
            boton.removeEventListener('click', null);
            boton.removeEventListener('mouseenter', null);
            boton.removeEventListener('mouseleave', null);
        }
    });

    // Limpiar intervalos no utilizados
    if (window.intervalosMapaAccesible) {
        window.intervalosMapaAccesible.forEach(intervalo => {
            clearInterval(intervalo);
        });
        window.intervalosMapaAccesible = [];
    }

    // Limpiar timeouts no utilizados
    if (window.timeoutsMapaAccesible) {
        window.timeoutsMapaAccesible.forEach(timeout => {
            clearTimeout(timeout);
        });
        window.timeoutsMapaAccesible = [];
    }

    console.log('✅ Optimización de memoria completada');
}

/**
 * Configura el cleanup automático cuando se cierra el modal
 */
function configurarCleanupAutomatico() {
    // Interceptar el cierre del modal para limpiar recursos
    const originalCerrarModal = document.getElementById('cerrarMapaAccesibleBtn');
    if (originalCerrarModal) {
        originalCerrarModal.addEventListener('click', () => {
            // Limpiar recursos antes de cerrar
            setTimeout(() => {
                limpiarRecursosMapaAccesible();
                optimizarMemoria();
            }, 100);
        });
    }

    // Limpiar recursos cuando se cambia de página
    window.addEventListener('beforeunload', () => {
        limpiarRecursosMapaAccesible();
        optimizarMemoria();
    });

    console.log('✅ Cleanup automático configurado');
}

// Configurar optimizaciones automáticas
configurarCleanupAutomatico();