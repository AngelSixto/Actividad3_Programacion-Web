/* =====================================================
   Código de la página de demostración (index.html)
   Aquí solo USAMOS los componentes de componente.js
   ===================================================== */

/* ---------- Tarjetas giratorias ---------- */
crearTarjeta('#tarjeta1', {
  imagen: 'img/tarjeta-ajolote.jpg',
  titulo: 'Ajolote',
  texto: 'Es originario de Xochimilco y puede regenerar patas, cola e incluso partes de su corazón.',
  color: '#db2777'
});

crearTarjeta('#tarjeta2', {
  imagen: 'img/tarjeta-jaguar.jpg',
  titulo: 'Jaguar',
  texto: 'Es el felino más grande de América y tiene una de las mordidas más fuertes de todos los felinos.',
  color: '#d97706'
});

crearTarjeta('#tarjeta3', {
  imagen: 'img/tarjeta-colibri.jpg',
  titulo: 'Colibrí',
  texto: 'Puede aletear hasta 80 veces por segundo y es el único pájaro que vuela hacia atrás.',
  color: '#059669'
});

/* ---------- Carrusel de imágenes ---------- */
const destinos = new Carrusel('#carruselDestinos', {
  altura: '420px',
  intervalo: 5000,
  slides: [
    { imagen: 'img/destino-1.jpg', titulo: 'Playas del Caribe', texto: 'Arena blanca y agua turquesa para desconectarte.' },
    { imagen: 'img/destino-2.jpg', titulo: 'Montañas y bosques', texto: 'Senderos, cabañas y aire fresco lejos de la ciudad.' },
    { imagen: 'img/destino-3.jpg', titulo: 'Pueblos con historia', texto: 'Calles empedradas, arquitectura colonial y buena comida.' },
    { imagen: 'img/destino-4.jpg', titulo: 'Desierto al atardecer', texto: 'Cielos enormes y noches llenas de estrellas.' }
  ],
  alCambiar: (i, slide) => console.log('Carrusel -> imagen ' + (i + 1) + ': ' + slide.titulo)
});

// Controlar el carrusel desde botones propios
document.getElementById('btnAnterior').onclick = () => destinos.anterior();
document.getElementById('btnSiguiente').onclick = () => destinos.siguiente();
document.getElementById('btnPrimero').onclick = () => destinos.irA(0);