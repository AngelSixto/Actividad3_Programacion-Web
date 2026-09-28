/*
 * Componentes visuales - Actividad 3
 * 1) crearTarjeta()    -> tarjeta que se voltea al darle clic
 * 2) new Carrusel()   -> carrusel de imágenes
 */

/* =====================================================
   COMPONENTE 1: TARJETA GIRATORIA
   ===================================================== */
function crearTarjeta(selector, opciones) {
  // Buscamos el contenedor donde se va a dibujar la tarjeta
  const contenedor = document.querySelector(selector);

  // Valores por defecto (se reemplazan con lo que mande el usuario)
  const config = {
    imagen: '',
    titulo: 'Título',
    texto: 'Texto de la parte trasera',
    color: '#6d28d9',
    ...opciones
  };

  // Armamos el HTML de la tarjeta: frente y reverso
  contenedor.innerHTML = `
    <div class="tarjeta" style="--color: ${config.color}" tabindex="0">
      <div class="tarjeta__interior">
        <div class="tarjeta__cara tarjeta__frente">
          <img src="${config.imagen}" alt="${config.titulo}">
          <h3>${config.titulo}</h3>
          <span class="tarjeta__pista">Toca para voltear ↻</span>
        </div>
        <div class="tarjeta__cara tarjeta__reverso">
          <h3>${config.titulo}</h3>
          <p>${config.texto}</p>
        </div>
      </div>
    </div>
  `;

  // Comportamiento: al dar clic (o Enter) se voltea
  const tarjeta = contenedor.querySelector('.tarjeta');
  const voltear = () => tarjeta.classList.toggle('volteada');

  tarjeta.addEventListener('click', voltear);
  tarjeta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      voltear();
    }
  });

  console.log('Tarjeta creada:', config.titulo);
}

/* =====================================================
   COMPONENTE 2: CARRUSEL DE IMÁGENES
   ===================================================== */
(function (window, document) {
  'use strict';

  // Crea un elemento HTML con clase y contenido
  function crear(tag, clase, html) {
    var el = document.createElement(tag);
    if (clase) el.className = clase;
    if (html !== undefined) el.innerHTML = html;
    return el;
  }

  // Evita que el texto se interprete como HTML
  function escapar(texto) {
    var d = document.createElement('div');
    d.textContent = texto == null ? '' : String(texto);
    return d.innerHTML;
  }

  /**
   * @param {string|HTMLElement} destino  selector o elemento donde se dibuja
   * @param {Object} opciones
   *  - slides {Array<{imagen:string, titulo?:string, texto?:string, enlace?:string}>}
   *  - autoplay {boolean} (por defecto true)
   *  - intervalo {number} ms entre slides (por defecto 5000)
   *  - flechas {boolean} (true)   - puntos {boolean} (true)
   *  - miniaturas {boolean} (false)
   *  - bucle {boolean} (true)
   *  - altura {string} CSS, ej. '420px' (por defecto '400px')
   *  - alCambiar {function(indice, slide)}
   */
  function Carrusel(destino, opciones) {
    if (!(this instanceof Carrusel)) return new Carrusel(destino, opciones);

    this.raiz = typeof destino === 'string' ? document.querySelector(destino) : destino;
    if (!this.raiz) throw new Error('Carrusel: no se encontró el elemento "' + destino + '"');

    this.o = Object.assign({
      slides: [],
      autoplay: true,
      intervalo: 5000,
      flechas: true,
      puntos: true,
      miniaturas: false,
      bucle: true,
      altura: '400px',
      alCambiar: null
    }, opciones || {});

    if (!this.o.slides.length) {
      console.warn('Carrusel: no se recibieron slides.');
    }

    this.indice = 0;
    this._timer = null;
    this._manejadores = [];
    this._construir();
    this._eventos();
    this.irA(0, true);
    this.reproducir();
  }

  Carrusel.prototype._on = function (el, ev, fn, opts) {
    el.addEventListener(ev, fn, opts);
    this._manejadores.push([el, ev, fn, opts]);
  };

  Carrusel.prototype._construir = function () {
    var o = this.o, self = this;
    this.raiz.innerHTML = '';
    this.raiz.classList.add('chispa-carrusel');
    this.raiz.setAttribute('tabindex', '0');
    this.raiz.setAttribute('role', 'region');
    this.raiz.setAttribute('aria-roledescription', 'carrusel');
    this.raiz.style.setProperty('--chispa-altura', o.altura);
    this.raiz.style.setProperty('--chispa-intervalo', o.intervalo + 'ms');

    this.ventana = crear('div', 'chispa-carrusel__ventana');
    this.pista = crear('div', 'chispa-carrusel__pista');

    o.slides.forEach(function (s, i) {
      var slide = crear('div', 'chispa-carrusel__slide');
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-label', (i + 1) + ' de ' + o.slides.length);
      var img = crear('img');
      img.src = s.imagen;
      img.alt = s.titulo || ('Imagen ' + (i + 1));
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.draggable = false;
      img.onerror = function () { slide.classList.add('chispa-carrusel__slide--sin-imagen'); };
      slide.appendChild(img);

      if (s.titulo || s.texto) {
        var cap = crear('div', 'chispa-carrusel__texto');
        cap.innerHTML =
          (s.titulo ? '<h3>' + escapar(s.titulo) + '</h3>' : '') +
          (s.texto ? '<p>' + escapar(s.texto) + '</p>' : '') +
          (s.enlace ? '<a href="' + escapar(s.enlace) + '" class="chispa-carrusel__boton">Ver más</a>' : '');
        slide.appendChild(cap);
      }
      self.pista.appendChild(slide);
    });

    this.ventana.appendChild(this.pista);
    this.raiz.appendChild(this.ventana);

    // Barra de tiempo del autoplay
    this.barra = crear('div', 'chispa-carrusel__tiempo');
    this.raiz.appendChild(this.barra);

    if (o.flechas && o.slides.length > 1) {
      this.btnPrev = crear('button', 'chispa-carrusel__flecha chispa-carrusel__flecha--prev', '&#8249;');
      this.btnNext = crear('button', 'chispa-carrusel__flecha chispa-carrusel__flecha--next', '&#8250;');
      this.btnPrev.setAttribute('aria-label', 'Anterior');
      this.btnNext.setAttribute('aria-label', 'Siguiente');
      this.raiz.appendChild(this.btnPrev);
      this.raiz.appendChild(this.btnNext);
    }

    if (o.autoplay && o.slides.length > 1) {
      this.btnPausa = crear('button', 'chispa-carrusel__pausa');
      this.btnPausa.setAttribute('aria-label', 'Pausar / reproducir');
      this.raiz.appendChild(this.btnPausa);
    }

    this.contador = crear('div', 'chispa-carrusel__contador');
    this.raiz.appendChild(this.contador);

    if (o.puntos && o.slides.length > 1) {
      this.puntos = crear('div', 'chispa-carrusel__puntos');
      o.slides.forEach(function (_, i) {
        var p = crear('button', 'chispa-carrusel__punto');
        p.setAttribute('aria-label', 'Ir a la imagen ' + (i + 1));
        p.dataset.indice = i;
        self.puntos.appendChild(p);
      });
      this.raiz.appendChild(this.puntos);
    }

    if (o.miniaturas && o.slides.length > 1) {
      this.minis = crear('div', 'chispa-carrusel__miniaturas');
      o.slides.forEach(function (s, i) {
        var m = crear('button', 'chispa-carrusel__mini');
        m.dataset.indice = i;
        m.setAttribute('aria-label', 'Miniatura ' + (i + 1));
        m.innerHTML = '<img src="' + escapar(s.imagen) + '" alt="" loading="lazy">';
        self.minis.appendChild(m);
      });
      this.raiz.parentNode.insertBefore(this.minis, this.raiz.nextSibling);
    }
  };

  Carrusel.prototype._eventos = function () {
    var self = this;
    if (this.btnPrev) this._on(this.btnPrev, 'click', function () { self.anterior(); });
    if (this.btnNext) this._on(this.btnNext, 'click', function () { self.siguiente(); });
    if (this.btnPausa) this._on(this.btnPausa, 'click', function () {
      self._pausadoManual = !self._pausadoManual;
      if (self._pausadoManual) self.pausar(); else self.reproducir();
    });

    var alClicIndice = function (e) {
      var b = e.target.closest('[data-indice]');
      if (b) self.irA(parseInt(b.dataset.indice, 10));
    };
    if (this.puntos) this._on(this.puntos, 'click', alClicIndice);
    if (this.minis) this._on(this.minis, 'click', alClicIndice);

    // Teclado
    this._on(this.raiz, 'keydown', function (e) {
      if (e.key === 'ArrowLeft') { self.anterior(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { self.siguiente(); e.preventDefault(); }
    });

    // Pausa al pasar el mouse
    this._on(this.raiz, 'mouseenter', function () { self.pausar(true); });
    this._on(this.raiz, 'mouseleave', function () { if (!self._pausadoManual) self.reproducir(); });

    // Deslizar con el dedo / arrastrar con el mouse
    var inicioX = null, deltaX = 0, ancho = 0;
    var inicio = function (x) { inicioX = x; deltaX = 0; ancho = self.ventana.offsetWidth; self.pista.style.transition = 'none'; };
    var mover = function (x) {
      if (inicioX === null) return;
      deltaX = x - inicioX;
      self.pista.style.transform = 'translateX(calc(' + (-self.indice * 100) + '% + ' + deltaX + 'px))';
    };
    var fin = function () {
      if (inicioX === null) return;
      self.pista.style.transition = '';
      if (Math.abs(deltaX) > ancho * 0.18) { deltaX < 0 ? self.siguiente() : self.anterior(); }
      else self.irA(self.indice, true);
      inicioX = null;
    };
    this._on(this.ventana, 'touchstart', function (e) { inicio(e.touches[0].clientX); }, { passive: true });
    this._on(this.ventana, 'touchmove', function (e) { mover(e.touches[0].clientX); }, { passive: true });
    this._on(this.ventana, 'touchend', fin);
    this._on(this.ventana, 'mousedown', function (e) { e.preventDefault(); inicio(e.clientX); });
    this._on(window, 'mousemove', function (e) { mover(e.clientX); });
    this._on(window, 'mouseup', fin);

    // Pausar cuando la pestaña no está visible
    this._on(document, 'visibilitychange', function () {
      if (document.hidden) self.pausar(); else if (!self._pausadoManual) self.reproducir();
    });
  };

  Carrusel.prototype.irA = function (i, silencioso) {
    var total = this.o.slides.length;
    if (!total) return this;
    if (this.o.bucle) i = (i + total) % total;
    else i = Math.max(0, Math.min(i, total - 1));

    var cambio = i !== this.indice;
    this.indice = i;
    this.pista.style.transform = 'translateX(' + (-i * 100) + '%)';

    var slides = this.pista.children;
    for (var k = 0; k < slides.length; k++) slides[k].classList.toggle('es-activo', k === i);
    if (this.puntos) Array.prototype.forEach.call(this.puntos.children, function (p, k) { p.classList.toggle('es-activo', k === i); });
    if (this.minis) Array.prototype.forEach.call(this.minis.children, function (m, k) { m.classList.toggle('es-activo', k === i); });
    this.contador.textContent = (i + 1) + ' / ' + total;

    if (!this.o.bucle && this.btnPrev) {
      this.btnPrev.disabled = i === 0;
      this.btnNext.disabled = i === total - 1;
    }

    this._reiniciarBarra();
    if (cambio && !silencioso && typeof this.o.alCambiar === 'function') {
      this.o.alCambiar(i, this.o.slides[i]);
    }
    return this;
  };

  Carrusel.prototype.siguiente = function () { return this.irA(this.indice + 1); };
  Carrusel.prototype.anterior = function () { return this.irA(this.indice - 1); };

  Carrusel.prototype._reiniciarBarra = function () {
    var b = this.barra;
    b.classList.remove('es-corriendo');
    void b.offsetWidth; // reinicia la animación CSS
    if (this._reproduciendo) b.classList.add('es-corriendo');
  };

  Carrusel.prototype.reproducir = function () {
    if (!this.o.autoplay || this.o.slides.length < 2) return this;
    var self = this;
    clearInterval(this._timer);
    this._reproduciendo = true;
    this.raiz.classList.remove('esta-pausado');
    this._timer = setInterval(function () { self.siguiente(); }, this.o.intervalo);
    this._reiniciarBarra();
    return this;
  };

  Carrusel.prototype.pausar = function () {
    clearInterval(this._timer);
    this._reproduciendo = false;
    this.raiz.classList.add('esta-pausado');
    this.barra.classList.remove('es-corriendo');
    return this;
  };

  Carrusel.prototype.destruir = function () {
    this.pausar();
    this._manejadores.forEach(function (h) { h[0].removeEventListener(h[1], h[2], h[3]); });
    this._manejadores = [];
    if (this.minis && this.minis.parentNode) this.minis.parentNode.removeChild(this.minis);
    this.raiz.innerHTML = '';
    this.raiz.className = this.raiz.className.replace(/\bchispa-carrusel\b|\besta-pausado\b/g, '').trim();
  };

  // Hacemos el carrusel disponible para cualquier página
  window.Carrusel = Carrusel;
})(window, document);
