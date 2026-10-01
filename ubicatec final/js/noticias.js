/**
 * Gestor de Noticias (UBICATEC)
 * 
 * Este script se encarga de cargar y renderizar noticias desde fuentes locales (JSON)
 * y remotas (API WordPress del TecNM). Implementa una estrategia "Local First"
 * para mostrar contenido instantáneamente y luego actualizarlo.
 * 
 * Funcionalidades:
 * 1. Carga de noticias ITP (Local + Live Fetch)
 * 2. Carga de noticias CESA e Industrial (JSON)
 * 3. Renderizado de tarjetas de noticias
 * 4. Modal para lectura de noticias completas
 */

function ubTrack(name, options) {
    try { window.ubicatecTrack && window.ubicatecTrack(name, options); } catch {}
}

document.addEventListener('DOMContentLoaded', function() {
    const title = (document.title || '').toLowerCase();
    if (title.includes('redes sociales')) ubTrack('rs_page_open');
    else ubTrack('news_page_open');

    document.addEventListener('click', function (e) {
        const a = e.target && e.target.closest ? e.target.closest('a') : null;
        if (!a) return;
        const target = (a.getAttribute('target') || '').toLowerCase();
        if (target !== '_blank') return;

        const pageTitle = (document.title || '').toLowerCase();
        const isRs = pageTitle.includes('redes sociales');
        const evt = isRs ? 'rs_social_click' : 'news_external_open';

        let label = '';
        const card = a.closest('.news-card, .card');
        if (card) {
            const t = card.querySelector('.news-title, .card-title, h5, h3');
            label = (t && t.textContent ? t.textContent : '').trim();
        }
        if (!label) label = (a.textContent || '').trim();
        if (!label) label = a.href || '';

        ubTrack(evt, { label });
    });

    loadNews();
    loadCesaNews(); // Cargar noticias del CESA
    // loadIndustrialNews(); // Cargar noticias de Industrial
});

// Datos de respaldo por si falla el fetch (ej. problema de CORS en local)
/**
 * Datos de respaldo (Fallback) para mostrar cuando no hay conexión
 * o fallan todas las peticiones de datos.
 */
const fallbackData = [
  {
    "id": 1,
    "titulo": "El TECNM Puebla evalúa la vinculación con empleadoras(es)",
    "fecha": "2026-01-22",
    "imagen": "https://www.puebla.tecnm.mx/wp-content/uploads/2026/01/empleadores-e1768936100529.jpg",
    "resumen": "¡Hola leonas y leones! El TECNM Puebla evalúa la vinculación con empleadoras(es)… #OrgulloTecNM #SomosTecNM #SomosITPuebla #leonasyleones",
    "url": "https://www.puebla.tecnm.mx/el-tecnm-puebla-evalua-la-vinculacion-con-empleadorases/"
  },
  {
    "id": 2,
    "titulo": "La Rama Estudiantil IEEE del TECNM Puebla recibe reconocimiento.",
    "fecha": "2026-01-22",
    "imagen": "https://www.puebla.tecnm.mx/wp-content/uploads/2026/01/ieee.jpg",
    "resumen": "¡Hola leonas y leones! La Rama Estudiantil IEEE del TECNM Puebla recibe reconocimiento. Se llevó a cabo la Toma de Protesta de la nueva administra...",
    "url": "https://www.puebla.tecnm.mx/la-rama-estudiantil-ieee-del-tecnm-puebla-recibe-reconocimiento/"
  },
  {
    "id": 3,
    "titulo": "Inicia la segunda semana de Cursos Intersemestrales en el TECNM Puebla.",
    "fecha": "2026-01-21",
    "imagen": "https://www.puebla.tecnm.mx/wp-content/uploads/2026/01/cursos2.jpg",
    "resumen": "¡Hola leonas y leones! Inicia la segunda semana de Cursos Intersemestrales en el TECNM Puebla. El departamento de Desarrollo Académico, a través de...",
    "url": "https://www.puebla.tecnm.mx/inicia-la-segunda-semana-de-cursos-intersemestrales-en-el-tecnm-puebla/"
  }
];

async function loadNews() {
    const container = document.getElementById('news-container-itp'); // ID actualizado
    if (!container) return; // Validación por si cambia el HTML
    
    // ESTRATEGIA OPTIMIZADA: "Local First" (Cargar local primero, luego actualizar si hay cambios)
    
    let localData = [];
    
    // 1. Intentar cargar JSON local inmediatamente (Velocidad instantánea)
    try {
        const response = await fetch('data/noticias.json');
        if (response.ok) {
            localData = await response.json();
            if (localData && localData.length > 0) {
                renderNews(localData, container);
            }
        }
    } catch (error) {
        console.warn('No se pudo cargar noticias locales:', error);
    }

    // 2. Intentar buscar actualizaciones en segundo plano (Frescura)
    // No bloqueamos la UI ni mostramos spinner si ya cargamos lo local
    fetchLiveNews()
        .then(liveData => {
            if (liveData && liveData.length > 0) {
                // Verificar si hay noticias nuevas comparando el ID de la más reciente
                const hasNewContent = !localData.length || (liveData[0].id !== localData[0].id);
                
                if (hasNewContent) {
                    console.log('Nuevas noticias detectadas en vivo, actualizando...');
                    // Opcional: Podríamos mostrar un botón "Nuevas noticias disponibles" en lugar de actualizar de golpe
                    ubTrack('news_live_update');
                    renderNews(liveData, container);
                } else {
                    console.log('Las noticias locales están actualizadas.');
                }
            }
        })
        .catch(error => {
            console.log('Fallo en fetchLiveNews (sin conexión o error API), manteniendo versión local:', error);
            ubTrack('news_live_error');
            // Si falló live y no teníamos local, entonces sí usamos fallback duro
            if (localData.length === 0) {
                 loadFallbackData(container);
            }
        });
}

function loadCesaNews() {
    const container = document.getElementById('news-container-cesa');
    if (!container) return;

    fetch('data/cesa.json')
        .then(response => {
            if (!response.ok) throw new Error('No CESA data');
            return response.json();
        })
        .then(data => {
            renderNews(data, container);
        })
        .catch(error => {
            console.error('Error cargando noticias CESA:', error);
            container.innerHTML = `
                <div class="col-12 text-center text-muted">
                    <p>No se pudieron cargar las noticias del CESA automáticamente.</p>
                    <p><a href="https://www.instagram.com/cesaitpuebla.2025/" target="_blank" class="btn btn-primary btn-sm">Ver en Instagram</a></p>
                </div>
            `;
        });
}

function loadIndustrialNews() {
    const container = document.getElementById('news-container-industrial');
    if (!container) return;

    fetch('data/industrial.json')
        .then(response => {
            if (!response.ok) throw new Error('No Industrial data');
            return response.json();
        })
        .then(data => {
            renderNews(data, container);
        })
        .catch(error => {
            console.error('Error cargando noticias Industrial:', error);
            container.innerHTML = `
                <div class="col-12 text-center text-muted">
                    <p>No se pudieron cargar las noticias de Ingeniería Industrial automáticamente.</p>
                    <p><a href="https://www.facebook.com/groups/121145248071674" target="_blank" class="btn btn-primary btn-sm">Ver grupo en Facebook</a></p>
                </div>
            `;
        });
}

function fetchLiveNews() {
    const wpApiUrl = 'https://www.puebla.tecnm.mx/wp-json/wp/v2/posts?per_page=12&_embed';
    // Usamos allorigins para evitar problemas de CORS
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(wpApiUrl) + '&disableCache=true';

    return fetch(proxyUrl)
        .then(response => {
            if (!response.ok) throw new Error('Proxy error');
            return response.json();
        })
        .then(data => {
            const posts = JSON.parse(data.contents); // allorigins devuelve el contenido en 'contents'
            return posts.map(post => {
                // Extraer imagen destacada
                let imagen = 'img/fondo.jpg';
                if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
                    imagen = post._embedded['wp:featuredmedia'][0].source_url;
                }

                // Limpiar resumen de forma segura sin ejecutar scripts o cargar imágenes
                const parser = new DOMParser();
                const doc = parser.parseFromString(post.excerpt.rendered, 'text/html');
                const resumen = doc.body.textContent || doc.body.innerText || '';
                
                const titleDoc = parser.parseFromString(post.title.rendered, 'text/html');
                const tituloLimpio = titleDoc.body.textContent || titleDoc.body.innerText || '';

                return {
                    id: post.id,
                    titulo: tituloLimpio,
                    fecha: post.date.split('T')[0],
                    imagen: imagen,
                    resumen: resumen.substring(0, 150) + '...',
                    contenido: post.content.rendered,
                    url: post.link
                };
            });
        });
}

function loadFallbackData(container) {
    // Intentar usar datos de respaldo hardcodeados si todo falla
    if (typeof fallbackData !== 'undefined' && fallbackData.length > 0) {
        ubTrack('news_fallback_used');
        renderNews(fallbackData, container);
        
        // Agregar aviso discreto
        const warningDiv = document.createElement('div');
        warningDiv.className = 'col-12 text-center text-muted mt-3';
        warningDiv.innerHTML = '<small>Modo offline: Mostrando noticias de respaldo.</small>';
        container.appendChild(warningDiv);
    } else {
        container.innerHTML = `
            <div class="col-12 text-center text-danger">
                <h3>Hubo un error al cargar las noticias.</h3>
                <p>Por favor intenta de nuevo más tarde.</p>
            </div>`;
    }
}

function renderNews(data, container) {
    container.innerHTML = ''; // Limpiar spinner o contenido previo
    
    if (data.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><h3>No hay noticias disponibles por el momento.</h3></div>';
        return;
    }

    data.forEach(news => {
        const cardHtml = createNewsCard(news);
        container.innerHTML += cardHtml;
    });
    
    // Refrescar AOS para detectar los nuevos elementos
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

function createNewsCard(news) {
    // Formatear fecha
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(news.fecha + 'T12:00:00'); // T12:00:00 para evitar problemas de zona horaria
    const formattedDate = date.toLocaleDateString('es-ES', options);

    const linkAttr = news.url ? `href="${news.url}" target="_blank" rel="noopener noreferrer"` : `href="#" onclick="openNewsModal('${news.id}'); return false;"`;

    let mediaContent;
    if (news.is_video && news.video_url) {
        mediaContent = `
            <div class="video-container" style="background: #000;">
                <video controls preload="none" poster="${news.imagen}" class="news-image" style="object-fit: contain;">
                    <source src="${news.video_url}" type="video/mp4">
                    Tu navegador no soporta video HTML5.
                </video>
            </div>
        `;
    } else {
        mediaContent = `
            <a ${linkAttr} class="text-decoration-none">
                <img src="${news.imagen}" alt="${news.titulo}" class="news-image" loading="lazy" onerror="this.src='img/fondo.jpg'">
            </a>
        `;
    }

    return `
        <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up">
            <div class="news-card">
                ${mediaContent}
                <div class="news-content">
                    <div class="news-date">
                        <i class="far fa-calendar-alt"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <h3 class="news-title">
                        <a ${linkAttr} class="text-dark text-decoration-none">
                            ${news.titulo}
                        </a>
                    </h3>
                    <p class="news-excerpt">${news.resumen}</p>
                    <a ${linkAttr} class="news-link">
                        Leer más <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Función para abrir modal
function openNewsModal(id) {
    ubTrack('news_modal_open', { label: String(id || '') });
    // console.log('Abriendo noticia:', id);
    
    fetch('data/noticias.json')
        .then(res => res.json())
        .then(data => {
            const news = data.find(n => n.id === id);
            if (news) {
                // Crear modal dinámicamente
                const modalHtml = `
                    <div class="modal fade" id="newsModal" tabindex="-1" role="dialog" aria-hidden="true">
                        <div class="modal-dialog modal-lg" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">${news.titulo}</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <img src="${news.imagen}" class="img-fluid mb-3 rounded" loading="lazy" style="width:100%; max-height:400px; object-fit:cover;">
                                    <p class="text-muted"><i class="far fa-calendar-alt"></i> ${new Date(news.fecha + 'T12:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <div class="news-body-text">
                                        ${news.contenido.replace(/\n/g, '<br>')}
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Remover modal anterior si existe
                $('#newsModal').remove();
                $('body').append(modalHtml);
                $('#newsModal').modal('show');
            }
        });
}
