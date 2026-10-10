(function () {
  "use strict";

  const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Año en el pie
  document.getElementById("anio").textContent = new Date().getFullYear();

  // Rotaciones de los elementos desde data-rot
  document.querySelectorAll("[data-rot]").forEach((el) => {
    el.style.setProperty("--r", el.dataset.rot + "deg");
  });

  // Menú móvil
  const boton = document.getElementById("menuToggle");
  const nav = document.getElementById("navegacion");
  boton.addEventListener("click", () => {
    const abierto = nav.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", String(abierto));
    boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("abierto");
      boton.setAttribute("aria-expanded", "false");
    })
  );

  // Revelado al hacer scroll (una sola vez por elemento)
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visible");
        entrada.target.querySelectorAll(".barra-skill").forEach(animarBarras);
        observador.unobserve(entrada.target);
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observador.observe(el));

  // Barras de habilidades
  function animarBarras(barra) {
    const relleno = barra.querySelector("i");
    relleno.style.width = barra.dataset.nivel + "%";
  }
  if (movimientoReducido) {
    document.querySelectorAll(".barra-skill").forEach(animarBarras);
  }
  // Las barras sueltas (fuera de un .reveal) se animan al entrar
  const obsBarras = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) {
        animarBarras(e.target);
        obsBarras.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll(".barra-skill").forEach((b) => obsBarras.observe(b));

  // Texto que escribe el rol
  const roles = ["Junior Cloud / AWS", "Soporte TI", "Infraestructura TI", "Diseño 3D"];
  const salida = document.getElementById("rol-animado");
  if (movimientoReducido) {
    salida.textContent = roles[0];
  } else {
    let indiceRol = 0, indiceLetra = 0, borrando = false;
    function escribir() {
      const texto = roles[indiceRol];
      if (!borrando) {
        indiceLetra++;
        salida.textContent = texto.slice(0, indiceLetra);
        if (indiceLetra === texto.length) {
          borrando = true;
          return setTimeout(escribir, 1800);
        }
        return setTimeout(escribir, 90);
      }
      indiceLetra--;
      salida.textContent = texto.slice(0, indiceLetra);
      if (indiceLetra === 0) {
        borrando = false;
        indiceRol = (indiceRol + 1) % roles.length;
        return setTimeout(escribir, 400);
      }
      return setTimeout(escribir, 45);
    }
    escribir();
  }

  // Filtros de proyectos
  const filtros = document.querySelectorAll(".filtro");
  const proyectos = document.querySelectorAll(".proyecto");
  filtros.forEach((f) =>
    f.addEventListener("click", () => {
      filtros.forEach((x) => x.classList.remove("activo"));
      f.classList.add("activo");
      const cual = f.dataset.filtro;
      proyectos.forEach((p) => {
        const coincide = cual === "todos" || p.dataset.categoria.split(" ").includes(cual);
        p.classList.toggle("oculto", !coincide);
      });
    })
  );

  // Formulario con validación
  const formulario = document.getElementById("formulario");
  const estado = document.getElementById("estado");
  const reglas = {
    nombre: { valida: (v) => v.trim().length >= 2, msg: "Escribe tu nombre (mínimo 2 letras)." },
    correo: { valida: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: "Escribe un correo válido." },
    mensaje: { valida: (v) => v.trim().length >= 10, msg: "Cuéntame un poco más (mínimo 10 caracteres)." },
  };

  Object.keys(reglas).forEach((campo) => {
    const input = document.getElementById(campo);
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true" && reglas[campo].valida(input.value)) {
        limpiarError(campo);
      }
    });
  });

  function mostrarError(campo, mensaje) {
    const input = document.getElementById(campo);
    input.setAttribute("aria-invalid", "true");
    document.getElementById("error-" + campo).textContent = mensaje;
  }
  function limpiarError(campo) {
    const input = document.getElementById(campo);
    input.removeAttribute("aria-invalid");
    document.getElementById("error-" + campo).textContent = "";
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    let ok = true;
    Object.keys(reglas).forEach((campo) => {
      const valor = document.getElementById(campo).value;
      if (reglas[campo].valida(valor)) {
        limpiarError(campo);
      } else {
        mostrarError(campo, reglas[campo].msg);
        if (ok) document.getElementById(campo).focus();
        ok = false;
      }
    });
    if (!ok) {
      estado.textContent = "Revisa los campos marcados.";
      return;
    }

    // Envío: abre el correo del visitante con el mensaje ya armado.
    // Para un envío sin abrir el correo, reemplaza esta parte por un servicio como Formspree.
    const datos = new FormData(formulario);
    const asunto = `Contacto desde portafolio: ${datos.get("asunto")}`;
    const cuerpo = `Nombre: ${datos.get("nombre")}\nCorreo: ${datos.get("correo")}\n\n${datos.get("mensaje")}`;
    window.location.href = `mailto:tucorreo@ejemplo.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    estado.textContent = "Se abrió tu correo con el mensaje listo para enviar.";
    formulario.reset();
  });

  // Fondo: partículas de píxeles lentas detrás del contenido
  if (!movimientoReducido) {
    const lienzo = document.getElementById("fondo");
    const ctx = lienzo.getContext("2d");
    const colores = ["#F7C948", "#F26B1D", "#3FA34D", "#E2445C", "#F3EBDD"];
    let particulas = [];
    function ajustar() {
      lienzo.width = window.innerWidth;
      lienzo.height = window.innerHeight;
      const cantidad = Math.min(60, Math.floor((lienzo.width * lienzo.height) / 22000));
      particulas = Array.from({ length: cantidad }, () => ({
        x: Math.random() * lienzo.width,
        y: Math.random() * lienzo.height,
        t: 4 + Math.floor(Math.random() * 3) * 2,
        v: 0.15 + Math.random() * 0.35,
        c: colores[Math.floor(Math.random() * colores.length)],
      }));
    }
    function dibujar() {
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      particulas.forEach((p) => {
        p.y -= p.v;
        if (p.y < -10) p.y = lienzo.height + 10;
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.t, p.t);
      });
      requestAnimationFrame(dibujar);
    }
    window.addEventListener("resize", ajustar);
    ajustar();
    dibujar();
  }
})();
