(() => {
  const getActiveKey = () => {
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (file === "index.html") return "home";
    if (file === "aula.html" || file === "edificio.html") return "aula";
    if (file === "rs.html") return "rs";
    if (file === "jornadas.html") return "jornadas";
    if (file === "equipo.html") return "equipo";
    return "home";
  };
 
  const buildDesktopNav = (active) => {
    const is = (k) => (active === k ? " active" : "");
    return `
<nav id="header-navbar" class="navbar navbar-expand-lg py-4">
  <div class="container">
    <a class="navbar-brand d-flex align-items-center text-white" href="index.html">
      <img src="img/navbar.svg" alt="UBICATEC logo" style="height: 25px;">
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-nav-header" aria-controls="navbar-nav-header" aria-expanded="false" aria-label="Toggle navigation">
      <span class="lnr lnr-menu"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbar-nav-header">
      <ul class="navbar-nav ml-auto">
        <li class="nav-item">
          <a class="nav-link${is("home")}" href="index.html">
            <i class="lnr lnr-home"></i> Inicio
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link${is("aula")}" href="aula.html">
            <i class="lnr lnr-map-marker"></i> Ubica tu Edificio
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link${is("rs")}" href="rs.html">
            <i class="lnr lnr-bullhorn"></i> Redes Sociales
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link${is("equipo")}" href="equipo.html">
            <i class="lnr lnr-users"></i> Equipo de desarrollo
          </a>
        </li>
      </ul>
    </div>
  </div>
</nav>
`.trim();
  };
 
  const buildMobileNav = (active) => {
    const is = (k) => (active === k ? " active" : "");
    return `
<div class="floating-mobile-nav" id="floatingMobileNav">
  <div class="nav-container">
    <div class="nav-scroll">
      <a href="index.html" class="nav-item${is("home")}" id="navHome">
        <div class="nav-icon">
          <i class="lnr lnr-home"></i>
        </div>
        <span class="nav-label">Inicio</span>
      </a>
      <a href="aula.html" class="nav-item${is("aula")}" id="navAula">
        <div class="nav-icon">
          <i class="lnr lnr-map-marker"></i>
        </div>
        <span class="nav-label">Ubica</span>
      </a>
      <a href="rs.html" class="nav-item${is("rs")}" id="navNoticias">
        <div class="nav-icon">
          <i class="lnr lnr-bullhorn"></i>
        </div>
        <span class="nav-label">Redes Sociales</span>
      </a>
      <a href="equipo.html" class="nav-item${is("equipo")}" id="navEquipo">
        <div class="nav-icon">
          <i class="lnr lnr-users"></i>
        </div>
        <span class="nav-label">Equipo</span>
      </a>
    </div>
  </div>
</div>
`.trim();
  };
 
  const upsert = (selector, html, position = "beforeend") => {
    const el = document.querySelector(selector);
    if (el) {
      el.outerHTML = html;
      return;
    }
    document.body.insertAdjacentHTML(position, html);
  };
 
  const mountGlobalNav = () => {
    const active = getActiveKey();
    if (!document.getElementById("sidebar-nav")) {
      upsert("#header-navbar", buildDesktopNav(active), "afterbegin");
    }
    upsert("#floatingMobileNav", buildMobileNav(active), "beforeend");

    if (typeof MobileNavUtils !== "undefined" && MobileNavUtils && typeof MobileNavUtils.init === "function") {
      MobileNavUtils.init();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountGlobalNav, { once: true });
  } else {
    mountGlobalNav();
  }
})();
