/**
 * Configuración Centralizada de Tipos de Eventos para UBICATEC
 * 
 * Este archivo define todos los tipos de eventos disponibles con sus configuraciones:
 * - Esquemas de color únicos
 * - Campos dinámicos específicos
 * - Iconografía contextual
 * - Configuración de visualización
 */

const EVENT_TYPES = {
    PONENCIA: {
        id: 'ponencia',
        name: 'Ponencia',
        icon: 'fas fa-microphone',
        colorScheme: {
            primary: '#2563eb',
            secondary: '#1d4ed8',
            gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
        },
        fields: {
            person: 'Ponente',
            organization: 'Empresa',
            location: 'Auditorio'
        },
        showPerson: true,
        showOrganization: true,
        showLocation: true,
        additionalFields: []
    },

    TALLER: {
        id: 'taller',
        name: 'Taller',
        icon: 'fas fa-tools',
        colorScheme: {
            primary: '#ea580c',
            secondary: '#c2410c',
            gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
        },
        fields: {
            person: 'Instructor',
            organization: 'Institución',
            location: 'Laboratorio'
        },
        showPerson: true,
        showOrganization: true,
        showLocation: true,
        additionalFields: []
    },

    CONFERENCIA: {
        id: 'conferencia',
        name: 'Conferencia',
        icon: 'fas fa-chalkboard-teacher',
        colorScheme: {
            primary: '#7c3aed',
            secondary: '#6d28d9',
            gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
        },
        fields: {
            person: 'Conferencista',
            organization: 'Universidad',
            location: 'Auditorio Principal'
        },
        showPerson: true,
        showOrganization: true,
        showLocation: true,
        additionalFields: []
    },

    NETWORKING: {
        id: 'networking',
        name: 'Networking',
        icon: 'fas fa-handshake',
        colorScheme: {
            primary: '#16a34a',
            secondary: '#15803d',
            gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
        },
        fields: {
            person: 'Organizador',
            organization: 'Comité',
            location: 'Sala de Eventos'
        },
        showPerson: true,
        showOrganization: true,
        showLocation: true,
        additionalFields: []
    },

    RALLY: {
        id: 'rally',
        name: 'Rally de Ingenierías',
        icon: 'fas fa-puzzle-piece',
        colorScheme: {
            primary: '#f97316',
            secondary: '#ea580c',
            gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
        },
        fields: {
            person: 'Coordinador',
            organization: 'Departamento/Carrera',
            location: 'Patio/Laboratorio'
        },
        showPerson: true,
        showOrganization: true,
        showLocation: true,
        additionalFields: ['carrera', 'desafio', 'equipos']
    },

    DEPORTIVO: {
        id: 'deportivo',
        name: 'Evento Deportivo',
        icon: 'fas fa-running',
        colorScheme: {
            primary: '#0284c7',
            secondary: '#0369a1',
            gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
        },
        fields: {
            person: 'Deportista/Entrenador',
            organization: 'Equipo/Club',
            location: 'Cancha/Estadio'
        },
        showPerson: true,
        showOrganization: true,
        showLocation: true,
        additionalFields: ['deporte', 'modalidad']
    },

    CULTURAL: {
        id: 'cultural',
        name: 'Cultural',
        icon: 'fas fa-theater-masks',
        colorScheme: {
            primary: '#ca8a04',
            secondary: '#a16207',
            gradient: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)'
        },
        fields: {
            person: 'Artista/Director',
            organization: 'Grupo/Compañía',
            location: 'Teatro/Foro'
        },
        showPerson: true,
        showOrganization: true,
        showLocation: true,
        additionalFields: ['genero', 'duracion']
    },

    ACADEMICO: {
        id: 'academico',
        name: 'Académico',
        icon: 'fas fa-graduation-cap',
        colorScheme: {
            primary: '#9333ea',
            secondary: '#7e22ce',
            gradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)'
        },
        fields: {
            person: 'Profesor/Conferencista',
            organization: 'Departamento',
            location: 'Aula/Salón'
        },
        showPerson: true,
        showOrganization: true,
        showLocation: true,
        additionalFields: ['materia', 'nivel']
    }
};

// Función para obtener configuración por tipo
export function getEventTypeConfig(eventType) {
    return EVENT_TYPES[eventType] || EVENT_TYPES.PONENCIA;
}

// Función para obtener todos los tipos disponibles
export function getAvailableEventTypes() {
    return Object.keys(EVENT_TYPES);
}

// Función para validar si un tipo existe
export function isValidEventType(eventType) {
    return EVENT_TYPES.hasOwnProperty(eventType);
}

// Función para generar descripción basada en el tipo
export function generateEventDescription(eventData) {
    const config = getEventTypeConfig(eventData.tipo);
    
    const templates = {
        PONENCIA: `Esta ponencia aborda ${eventData.titulo} presentada por ${eventData.ponente} de ${eventData.empresa}.`,
        TALLER: `Taller práctico sobre ${eventData.titulo} dirigido por ${eventData.ponente}. Los participantes desarrollarán habilidades prácticas.`,
        CONFERENCIA: `Conferencia magistral sobre ${eventData.titulo} impartida por ${eventData.ponente} de ${eventData.empresa}.`,
        NETWORKING: `Evento de networking organizado por ${eventData.ponente} del ${eventData.empresa}. Oportunidad para conectar con profesionales.`,
        RALLY: `Rally de desafíos para ${eventData.carrera} organizado por ${eventData.ponente} del ${eventData.empresa}. ${eventData.desafio} con participación de ${eventData.equipos} equipos.`,
        DEPORTIVO: `Competencia de ${eventData.deporte} en modalidad ${eventData.modalidad} organizada por ${eventData.ponente} de ${eventData.empresa}.`,
        CULTURAL: `Evento cultural de ${eventData.genero} con duración de ${eventData.duracion} presentado por ${eventData.ponente} de ${eventData.empresa}.`,
        ACADEMICO: `Actividad académica de ${eventData.materia} para nivel ${eventData.nivel} impartida por ${eventData.ponente} del ${eventData.empresa}.`
    };
    
    return templates[eventData.tipo] || templates.PONENCIA;
}