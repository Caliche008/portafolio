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
  const roles = ["Junior Cloud / DevOps", "IA aplicada", "Infraestructura como código", "Diseño 3D y marketing"];
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
    window.location.href = `mailto:carlosaortizjaramillo@gmail.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
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

/* ================= Interactividad ================= */
(function () {
  "use strict";

  // Barra de progreso de scroll (siempre activa)
  const progreso = document.createElement("div");
  progreso.className = "progreso";
  document.body.appendChild(progreso);
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progreso.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }, { passive: true });

  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducido) return;

  const puntero = window.matchMedia("(pointer: fine)").matches;
  const colores = ["#F7C948", "#F26B1D", "#3FA34D", "#E2445C", "#F3EBDD", "#2D3A8C"];
  const decos = Array.from(document.querySelectorAll(".deco, .pc-ilustracion"));

  // 1. Las imágenes aparecen con un efecto de píxeles al entrar en pantalla
  const obsDeco = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.animate(
        [
          { scale: "0", opacity: 0 },
          { scale: "1.15", opacity: 1, offset: 0.6 },
          { scale: "1", opacity: 1 },
        ],
        { duration: 650, easing: "steps(5, end)" }
      );
      obsDeco.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  decos.forEach((d) => obsDeco.observe(d));

  // 2. Las imágenes siguen suavemente al mouse con distinta profundidad
  const estado = decos.map((el) => ({ el, d: 0.6 + Math.random() * 0.9, x: 0, y: 0 }));
  let mx = 0, my = 0;
  window.addEventListener("pointermove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  (function bucle() {
    estado.forEach((s) => {
      const tx = mx * 22 * s.d, ty = my * 22 * s.d;
      s.x += (tx - s.x) * 0.08;
      s.y += (ty - s.y) * 0.08;
      s.el.style.translate = `${s.x.toFixed(1)}px ${s.y.toFixed(1)}px`;
    });
    requestAnimationFrame(bucle);
  })();

  // 3. Al hacer clic: giro, rebote y explosión de píxeles
  function explotar(el) {
    const padre = el.offsetParent;
    if (!padre) return;
    const cx = el.offsetLeft + el.offsetWidth / 2;
    const cy = el.offsetTop + el.offsetHeight / 2;
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("span");
      p.className = "particula";
      p.style.background = colores[Math.floor(Math.random() * colores.length)];
      p.style.left = cx + "px";
      p.style.top = cy + "px";
      padre.appendChild(p);
      const ang = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 60;
      const a = p.animate(
        [
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(0.6)`, opacity: 0 },
        ],
        { duration: 600 + Math.random() * 200, easing: "steps(4, end)" }
      );
      a.onfinish = () => p.remove();
    }
  }
  decos.forEach((el) => {
    el.addEventListener("click", () => {
      el.animate([{ rotate: "0deg" }, { rotate: "360deg" }], { duration: 700, easing: "steps(8, end)" });
      el.animate([{ scale: "1" }, { scale: "1.25" }, { scale: "0.95" }, { scale: "1" }], { duration: 400 });
      explotar(el);
    });
  });

  // 4. Rastro de píxeles con el cursor (solo con mouse)
  if (puntero) {
    let ultimo = 0;
    const variantes = ["", "verde", "coral"];
    window.addEventListener("pointermove", (e) => {
      const ahora = performance.now();
      if (ahora - ultimo < 80) return;
      ultimo = ahora;
      const p = document.createElement("span");
      p.className = "rastro " + variantes[Math.floor(Math.random() * variantes.length)];
      p.style.left = e.clientX - 4 + "px";
      p.style.top = e.clientY - 4 + "px";
      document.body.appendChild(p);
      const a = p.animate(
        [
          { opacity: 0.9, transform: "scale(1)" },
          { opacity: 0, transform: "scale(0.2) translateY(-10px)" },
        ],
        { duration: 700, easing: "steps(4, end)" }
      );
      a.onfinish = () => p.remove();
    }, { passive: true });

    // 5. Botones que se atraen al cursor
    document.querySelectorAll(".boton").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.2;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
        b.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
      });
      b.addEventListener("pointerleave", () => { b.style.translate = "0px 0px"; });
    });
  }
})();
