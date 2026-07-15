# Resumen de Arquitectura y Estructura de Código: AeroSphere

Este documento detalla la organización estructural, el flujo de navegación y los fragmentos clave de código que componen la plantilla interactiva premium **AeroSphere** (Landing Page + Dashboard).

---

## 1. Arquitectura General del Proyecto

La plantilla está diseñada bajo un enfoque de **Single Page Application (SPA)** nativa, estructurada con tecnologías web esenciales (Vanilla Stack):

* **Estructura (HTML5)**: Un único archivo principal ([index.html](file:///c:/Users/Asus/Desktop/🎨%20Creative%20&%20Art/Proyecto%20AlbertoA/ejemplo/index.html)) que contiene el marcado semántico de dos pantallas principales organizadas como secciones de página controladas dinámicamente.
* **Diseño y Estética (CSS3)**: Hoja de estilos centralizada ([style.css](file:///c:/Users/Asus/Desktop/🎨%20Creative%20&%20Art/Proyecto%20AlbertoA/ejemplo/style.css)) estructurada con **Custom Properties (variables globales)**. Utiliza un sistema robusto de Glassmorphism, filtros de desenfoque y animaciones infinitas para simular cristal templado y líquidos fluidos neón en el fondo.
* **Interactividad (ES6 JavaScript)**: Script principal ([script.js](file:///c:/Users/Asus/Desktop/🎨%20Creative%20&%20Art/Proyecto%20AlbertoA/ejemplo/script.js)) que maneja el reloj en tiempo real, el carrusel de juegos destacados, efectos de inclinación 3D (tilt parallax) en respuesta al mouse, feedback de sonido con la API de audio del navegador y la lógica de transición entre páginas.

---

## 2. Estructura de Vistas (HTML)

El cuerpo de `index.html` se divide en dos contenedores hermanos con la clase `.page-section`. El estado de visibilidad se gestiona intercambiando la clase `.active`:

```html
<!-- Pantalla 1: Landing Page -->
<div id="landing-page" class="page-section active">
  <div class="landing-container">
    <!-- Header (Píldora Flotante), Hero (Esfera Mascota), Stats Bar, Features Grid, Footer -->
  </div>
</div>

<!-- Pantalla 2: Dashboard Principal -->
<div id="dashboard-page" class="page-section">
  <div class="app-container">
    <!-- Header, Sidebar izquierdo, Grid Central de Juegos, Sidebar derecho (Amigos + Logros), Footer -->
  </div>
</div>
```

### Gráficos de Cristal en 3D (SVG)
Para representar elementos de aspecto 3D y cristalino en las tarjetas de la landing sin recargar la página con imágenes pesadas, utilizamos gráficos **SVG en línea** estructurados con degradados semitransparentes y filtros de desenfoque (`feGaussianBlur`):

```html
<svg class="glass-3d-svg" viewBox="0 0 200 200">
  <defs>
    <!-- Degradado translúcido para el efecto de cristal -->
    <linearGradient id="blueGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(11, 212, 231, 0.4)" />
      <stop offset="100%" stop-color="rgba(2, 59, 156, 0.1)" />
    </linearGradient>
  </defs>
  <!-- Rectángulo girado que representa la placa de cristal -->
  <rect x="50" y="50" width="100" height="90" rx="16" fill="url(#blueGlassGrad)" stroke="rgba(11, 212, 231, 0.4)" stroke-width="1.5" />
</svg>
```

---

## 3. Sistema de Estilos y Glassmorphism (CSS)

El corazón estético de AeroSphere reside en el uso de variables personalizadas en la raíz (`:root`) para estandarizar los brillos y sombras:

```css
:root {
  /* Paleta Neón / Aero */
  --primary-glow: #76E012;      /* Verde vibrante */
  --secondary-glow: #0bd4e7;    /* Cian vibrante */
  
  /* Configuración del Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-inner-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.15);
  --glass-blur: blur(10px) saturate(180%);
}
```

### Clases Decorativas
* **Fondos Líquidos (`.ambient-wave`)**: Ondas circulares gigantescas con desenfoque de `80px` e inclinadas, que simulan fluidez y reaccionan en profundidad mediante la propiedad `mix-blend-mode: screen`.
* **Esfera Gigante Flotante**: Contiene la mascota y posee una animación `@keyframes float-mascot` que la desplaza sutilmente de arriba a abajo (`translateY(-12px)`), junto con anillos rotativos configurados en perspectiva 3D (`rotateY(360deg)`).

---

## 4. Lógica de Control e Interactividad (JS)

### Inclinación Parallax 3D (`initCardInteractions`)
Calcula las coordenadas del cursor del mouse relativas al centro del panel para rotar el elemento en los ejes X e Y, creando una sensación física de profundidad:

```javascript
el.addEventListener('mousemove', (e) => {
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left; // Coordenada X dentro del elemento
  const y = e.clientY - rect.top;  // Coordenada Y dentro del elemento
  
  const xc = rect.width / 2;
  const yc = rect.height / 2;
  
  const tiltX = ((yc - y) / yc) * 8; // Inclinación en eje X
  const tiltY = ((x - xc) / xc) * 8; // Inclinación en eje Y

  el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.04)`;
});
```

### Transiciones Suaves entre Secciones (`switchPage`)
Cuando el usuario interactúa, la función reduce la escala y desvanece la opacidad de la página actual. Durante el cambio, realiza un **reflow** (`offsetHeight`) para que el navegador registre el cambio de estado de visualización (`display`) antes de iniciar la animación de entrada de la nueva página:

```javascript
function switchPage(toPage, activeTab = null) {
  playClickSound(); // Sonido sintetizado
  
  const currentPage = toPage === 'dashboard' ? landingPage : dashboardPage;
  const nextPage = toPage === 'dashboard' ? dashboardPage : landingPage;

  // Desvanecimiento de salida (escala a 0.96 y opacidad a 0)
  currentPage.style.opacity = '0';
  currentPage.style.transform = 'scale(0.96)';
  
  setTimeout(() => {
    currentPage.style.display = 'none';
    currentPage.classList.remove('active');

    nextPage.style.display = 'flex';
    nextPage.offsetHeight; // Forzar repintado / Reflow del navegador
    nextPage.classList.add('active');
    
    // Animación de entrada (escala a 1 y opacidad a 1)
    setTimeout(() => {
      nextPage.style.opacity = '1';
      nextPage.style.transform = 'scale(1)';
    }, 50);

    // Ajustar tab activa si navega a una sección específica
    if (toPage === 'dashboard' && activeTab) {
      activateDashboardTab(activeTab);
    }
  }, 450);
}
```

### API de Audio Sintetizado (`playClickSound`)
AeroSphere no utiliza archivos `.mp3` para las alertas sonoras; en su lugar, sintetiza ondas sinusoidales directas usando la **AudioContext API** del navegador web para garantizar una latencia nula y una experiencia limpia:

```javascript
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();

oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);

oscillator.type = 'sine';
oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Nota Re5 (D5)
gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.15);

oscillator.start();
oscillator.stop(audioCtx.currentTime + 0.15);
```

---

## 5. Capas de Fondo Ambiental Premium (Imagen y Video)

Para otorgar dinamismo y una sensación cinemática a la interfaz sin interferir con la legibilidad del contenido, se ha implementado una estructura de capas apiladas mediante `z-index` negativos para el fondo.

Esto evita que la imagen de fondo del `body` cubra el video con z-index negativo, asegurando una correcta visualización de ambos elementos.

### Marcado HTML ([index.html](file:///c:/Users/Asus/Desktop/🎨%20Creative%20&%20Art/Proyecto%20AlbertoA/ejemplo/index.html))
Se sitúan justo al inicio del `<body>` en contenedores separados:

```html
<!-- Imagen de fondo base en capa separada -->
<div class="background-image-container"></div>

<!-- Video de fondo ambiental sutil (movimiento cinético premium) -->
<div class="background-video-container">
  <video muted playsinline class="background-video">
    <source src="assets/vitruvio FINAL0001-1244.mp4" type="video/mp4">
  </video>
</div>
```

### Estilos CSS ([style.css](file:///c:/Users/Asus/Desktop/🎨%20Creative%20&%20Art/Proyecto%20AlbertoA/ejemplo/style.css))
El `body` pasa a tener un color plano oscuro `#011116`. Las capas se superponen en el siguiente orden de atrás hacia adelante:

1. **`.background-image-container` (`z-index: -3`)**: Dibuja la imagen abstracta estática `bg-abstract.png` con opacidad casi imperceptible (`0.03`) en la Landing para no interferir con el video. Al cambiar al Dashboard, se le añade la clase `.opaque` que eleva su opacidad a `0.85`.
2. **`.background-video-container` (`z-index: -2`)**: Dibuja el video con opacidad `0.75` y desenfoque de `10px`, reproduciéndose en la Landing Page sobre la imagen de fondo. Al cambiar al Dashboard, el contenedor del video se desvanece (`opacity: 0`) y se pausa.
3. **`.ambient-glow` y `.ambient-wave` (`z-index: 0`)**: Los orbes y ondas neón se dibujan por encima del video, tiñendo el movimiento.
4. **Contenido principal (`z-index: 1`)**: Las tarjetas de cristal se muestran encima.

```css
/* Imagen estática de fondo */
.background-image-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: url('assets/bg-abstract.png') no-repeat center center;
  background-size: cover;
  z-index: -3; /* Detrás del video */
  pointer-events: none;
  opacity: 0.03; /* Casi inexistente en Home */
  transition: opacity 0.8s ease;
}

/* Imagen de fondo visible en el Dashboard */
.background-image-container.opaque {
  opacity: 0.85; /* Altamente visible en el Dashboard */
}

/* Video dinámico difuminado */
.background-video-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -2; /* Encima de la imagen pero detrás de todo lo demás */
  pointer-events: none;
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.8s ease;
}

.background-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.75; /* Altamente visible en Home */
  filter: blur(10px) saturate(130%); /* Desenfoque premium */
}
```
