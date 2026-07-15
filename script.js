/* ==========================================
   AeroSphere Interactive Controls & Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initCarousel();
  initNavigation();
  initCardInteractions();
  initPageRouting();
  initBackgroundVideoClick();
});

/**
 * Live Date and Time Updater
 */
function initClock() {
  const dateStrElement = document.getElementById('date-str');
  const timeStrElement = document.getElementById('time-str');

  function updateClock() {
    const now = new Date();
    
    // Time formatting: e.g. 10:30 AM
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const timeStr = `${hours}:${minutes} ${ampm}`;
    
    // Date formatting: e.g. June 8, 2024
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    const dateStr = `${month} ${day}, ${year}`;
    
    // Update DOM
    if (dateStrElement) dateStrElement.textContent = dateStr;
    if (timeStrElement) timeStrElement.textContent = timeStr;
  }

  // Initial call and run every second
  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * Games Carousel Controller
 */
function initCarousel() {
  const track = document.getElementById('carousel-track');
  const cards = Array.from(document.querySelectorAll('.game-card'));
  const indicators = Array.from(document.querySelectorAll('.indicator'));
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  
  if (!track || cards.length === 0) return;

  let activeIndex = 0;

  // Set active game and update view
  function setActiveSlide(index) {
    // Clamp index
    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;

    // Toggle active state classes
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    indicators.forEach((indicator, i) => {
      if (i === index) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });

    activeIndex = index;

    // Scroll track if necessary (only needed if items overflow, like on tablet/mobile)
    const containerWidth = track.parentElement.offsetWidth;
    const trackWidth = track.scrollWidth;
    
    if (trackWidth > containerWidth) {
      const cardWidth = cards[0].offsetWidth;
      const gap = 15; // gap in px
      
      // Calculate scroll offset to center or align active card
      let offset = index * (cardWidth + gap);
      
      // Prevent scrolling beyond boundaries
      const maxOffset = trackWidth - containerWidth;
      if (offset > maxOffset) offset = maxOffset;
      
      track.style.transform = `translateX(-${offset}px)`;
    } else {
      // Reset transform if everything fits
      track.style.transform = 'translateX(0)';
    }
  }

  // Arrow navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      setActiveSlide(activeIndex - 1);
      playClickSound();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      setActiveSlide(activeIndex + 1);
      playClickSound();
    });
  }

  // Bullet indicators navigation
  indicators.forEach((indicator) => {
    indicator.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.target.getAttribute('data-slide'));
      setActiveSlide(targetIndex);
      playClickSound();
    });
  });

  // Card click navigation
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      if (activeIndex !== index) {
        setActiveSlide(index);
        playClickSound();
      } else {
        // Active card click: Launch game animation!
        launchGame(card.querySelector('.game-title').textContent);
      }
    });
  });

  // Handle window resizing to adjust alignment of slider
  window.addEventListener('resize', () => {
    setActiveSlide(activeIndex);
  });
}

/**
 * Sidebar and Navigation Active Item Toggles
 */
function initNavigation() {
  // Sidebar Items
  const sidebarItems = document.querySelectorAll('.sidebar .menu-item');
  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't override settings button if it has special actions
      if (item.classList.contains('settings-btn')) {
        openSettingsModal();
        return;
      }
      
      sidebarItems.forEach(sib => sib.classList.remove('active'));
      item.classList.add('active');
      playClickSound();
    });
  });

  // Top Header Nav Items
  const headerNavItems = document.querySelectorAll('.header-bar .nav-item');
  headerNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      headerNavItems.forEach(sib => sib.classList.remove('active'));
      item.classList.add('active');
      playClickSound();
    });
  });
}

/**
 * Mouse Move Card Tilting 3D Parallax Effects
 */
function initCardInteractions() {
  const tiltElements = document.querySelectorAll('.game-card, .glass-panel:not(.header-bar):not(.sidebar):not(.footer-bar)');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate within the element
      const y = e.clientY - rect.top;  // y coordinate within the element
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      // Calculate tilt angles (limit tilt to max 5 degrees for cards, 2 degrees for main panels)
      const isCard = el.classList.contains('game-card');
      const maxTilt = isCard ? 8 : 2;
      
      const tiltX = ((yc - y) / yc) * maxTilt;
      const tiltY = ((x - xc) / xc) * maxTilt;

      // Subtle scaling on hover
      const scale = isCard ? 1.04 : 1.01;

      // Apply the styling
      el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
      
      // Add dynamic reflection effect (if element has reflection element or standard gradient overlay)
      if (isCard) {
        const borderGlow = el.querySelector('.game-glow-border');
        if (borderGlow) {
          borderGlow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`;
        }
      }
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      if (el.classList.contains('game-card')) {
        const borderGlow = el.querySelector('.game-glow-border');
        if (borderGlow) {
          borderGlow.style.background = '';
        }
      }
    });
  });
}

/**
 * UI Audio Feedback Simulation
 */
function playClickSound() {
  // Audio context synthesized beep for standard gaming interface feel!
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
    gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.15);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
  } catch (error) {
    // Audio Context not allowed by user interaction policy yet, safe to ignore
  }
}

/**
 * Launch Game Simulation Effect
 */
function launchGame(gameName) {
  // Visual click launch feedback
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(1, 17, 22, 0.85)';
  overlay.style.backdropFilter = 'blur(15px)';
  overlay.style.zIndex = '999';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.4s ease';

  const loader = document.createElement('div');
  loader.style.width = '50px';
  loader.style.height = '50px';
  loader.style.border = '4px solid rgba(255, 255, 255, 0.1)';
  loader.style.borderTop = '4px solid var(--primary-glow)';
  loader.style.borderRadius = '50%';
  loader.style.animation = 'spin 1s linear infinite';
  
  const text = document.createElement('h2');
  text.textContent = `LAUNCHING ${gameName}...`;
  text.style.fontFamily = 'var(--font-title)';
  text.style.color = '#fff';
  text.style.marginTop = '20px';
  text.style.letterSpacing = '1px';
  text.style.fontSize = '20px';

  overlay.appendChild(loader);
  overlay.appendChild(text);
  document.body.appendChild(overlay);

  // Trigger fade in
  setTimeout(() => overlay.style.opacity = '1', 50);

  // Play launch chime
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.frequency.setValueAtTime(392.00, audioCtx.currentTime); // G4
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.1); // C5
    osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5

    osc2.frequency.setValueAtTime(392.00 / 2, audioCtx.currentTime);
    osc2.frequency.setValueAtTime(523.25 / 2, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.8);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.8);
    osc2.stop(audioCtx.currentTime + 0.8);
  } catch (e) {}

  // Style helper for loader
  const style = document.createElement('style');
  style.id = 'temp-spin-style';
  style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
  document.head.appendChild(style);

  // Dismiss loader after 3 seconds
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      const styleEl = document.getElementById('temp-spin-style');
      if (styleEl) styleEl.remove();
    }, 400);
  }, 2500);
}

/**
 * Settings Modal Simulator
 */
function openSettingsModal() {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0, 0, 0, 0.6)';
  modal.style.backdropFilter = 'blur(10px)';
  modal.style.zIndex = '998';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.opacity = '0';
  modal.style.transition = 'opacity 0.3s ease';

  const content = document.createElement('div');
  content.className = 'glass-panel';
  content.style.padding = '30px';
  content.style.width = '400px';
  content.style.maxWidth = '90%';
  content.style.color = '#fff';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.gap = '15px';
  content.style.border = '1px solid var(--glass-border)';

  const title = document.createElement('h3');
  title.textContent = 'Settings';
  title.style.fontFamily = 'var(--font-title)';
  title.style.fontSize = '22px';

  const settingsList = document.createElement('div');
  settingsList.style.display = 'flex';
  settingsList.style.flexDirection = 'column';
  settingsList.style.gap = '12px';
  
  const options = ['Audio Feedback Enabled', 'Fluid Animations', 'High Fidelity Blur', 'Color Accent: Lime Green'];
  options.forEach(opt => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.fontSize = '14px';

    const label = document.createElement('span');
    label.textContent = opt;

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = true;
    toggle.style.accentColor = 'var(--primary-glow)';
    toggle.style.cursor = 'pointer';

    row.appendChild(label);
    row.appendChild(toggle);
    settingsList.appendChild(row);
  });

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-primary';
  closeBtn.textContent = 'Save Changes';
  closeBtn.style.padding = '10px 20px';
  closeBtn.style.marginTop = '15px';
  closeBtn.addEventListener('click', () => {
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 300);
  });

  content.appendChild(title);
  content.appendChild(settingsList);
  content.appendChild(closeBtn);
  modal.appendChild(content);
  document.body.appendChild(modal);

  setTimeout(() => modal.style.opacity = '1', 50);
}

/**
 * Landing Page to Dashboard Section Routing & Animations
 */
function initPageRouting() {
  const landingPage = document.getElementById('landing-page');
  const dashboardPage = document.getElementById('dashboard-page');

  if (!landingPage || !dashboardPage) return;

  // Transition Page function
  function switchPage(toPage, activeTab = null) {
    playClickSound();
    
    const currentPage = toPage === 'dashboard' ? landingPage : dashboardPage;
    const nextPage = toPage === 'dashboard' ? dashboardPage : landingPage;

    // Apply fade/scale transition Out
    currentPage.style.opacity = '0';
    currentPage.style.transform = 'scale(0.96)';
    
    // Controlar opacidad de capas de fondo e inicio/pausa de video
    const bgImage = document.querySelector('.background-image-container');
    const bgVideoContainer = document.querySelector('.background-video-container');
    const bgVideo = document.querySelector('.background-video');

    if (toPage === 'dashboard') {
      if (bgImage) bgImage.classList.add('opaque');
      if (bgVideoContainer) bgVideoContainer.style.opacity = '0';
      if (bgVideo) bgVideo.pause(); // Pausar video en el Dashboard
    } else {
      if (bgImage) bgImage.classList.remove('opaque');
      if (bgVideoContainer) bgVideoContainer.style.opacity = '1';
      if (bgVideo) bgVideo.play().catch(e => console.warn('Error al reproducir al volver a Home:', e));
    }
    
    setTimeout(() => {
      currentPage.style.display = 'none';
      currentPage.classList.remove('active');

      nextPage.style.display = 'flex';
      // Force repaint to make sure transition plays
      nextPage.offsetHeight;
      nextPage.classList.add('active');
      
      setTimeout(() => {
        nextPage.style.opacity = '1';
        nextPage.style.transform = 'scale(1)';
      }, 50);

      // Tab highlighting configuration
      if (toPage === 'dashboard') {
        if (activeTab) {
          activateDashboardTab(activeTab);
        }
      }
    }, 450); // matching transition curve duration
  }

  // Hook buttons
  const launchBtn = document.getElementById('launch-dashboard-btn');
  if (launchBtn) launchBtn.addEventListener('click', () => switchPage('dashboard'));

  const playCtaBtn = document.getElementById('cta-nav-play');
  if (playCtaBtn) playCtaBtn.addEventListener('click', () => switchPage('dashboard', 'games'));

  const footerGamesBtn = document.getElementById('footer-btn-games');
  if (footerGamesBtn) footerGamesBtn.addEventListener('click', () => switchPage('dashboard', 'games'));

  // Cards direct links
  const gamesCard = document.getElementById('card-games-btn');
  if (gamesCard) gamesCard.addEventListener('click', () => switchPage('dashboard', 'games'));

  const socialCard = document.getElementById('card-social-btn');
  if (socialCard) socialCard.addEventListener('click', () => switchPage('dashboard', 'friends'));

  const achCard = document.getElementById('card-achievements-btn');
  if (achCard) achCard.addEventListener('click', () => switchPage('dashboard', 'achievements'));

  const storeCard = document.getElementById('card-store-btn');
  if (storeCard) storeCard.addEventListener('click', () => switchPage('dashboard', 'media'));

  // Header Nav Items Navigation
  const landingNavItems = document.querySelectorAll('.landing-nav-item');
  landingNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      
      landingNavItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      if (target === 'home') {
        // Stay here
      } else if (target === 'library') {
        switchPage('dashboard', 'games');
      } else if (target === 'social') {
        switchPage('dashboard', 'friends');
      } else if (target === 'achievements') {
        switchPage('dashboard', 'achievements');
      } else if (target === 'about') {
        switchPage('dashboard');
      }
    });
  });

  // Return to Landing: logo area in dashboard
  const dashboardLogo = document.querySelector('.header-bar .logo-area');
  if (dashboardLogo) {
    dashboardLogo.style.cursor = 'pointer';
    dashboardLogo.addEventListener('click', () => {
      resetLandingNav();
      switchPage('landing');
    });
  }

  // Return to Landing: Home link in dashboard header
  const dashboardHomeNav = Array.from(document.querySelectorAll('.header-bar .nav-item')).find(item => item.textContent.trim() === 'Home');
  if (dashboardHomeNav) {
    dashboardHomeNav.addEventListener('click', (e) => {
      e.preventDefault();
      resetLandingNav();
      switchPage('landing');
    });
  }

  // Return to Landing: Home link in dashboard sidebar
  const dashboardSidebarHome = Array.from(document.querySelectorAll('.sidebar .menu-item')).find(item => {
    const text = item.querySelector('span');
    return text && text.textContent.trim() === 'Home';
  });
  if (dashboardSidebarHome) {
    dashboardSidebarHome.addEventListener('click', (e) => {
      e.preventDefault();
      resetLandingNav();
      switchPage('landing');
    });
  }

  function resetLandingNav() {
    landingNavItems.forEach(nav => {
      if (nav.getAttribute('data-target') === 'home') {
        nav.classList.add('active');
      } else {
        nav.classList.remove('active');
      }
    });
  }

  function activateDashboardTab(tabName) {
    // 1. Sidebar menu active element
    const sidebarItems = document.querySelectorAll('.sidebar .menu-item');
    sidebarItems.forEach(item => {
      const text = item.querySelector('span');
      if (text && text.textContent.trim().toLowerCase() === tabName) {
        sidebarItems.forEach(sib => sib.classList.remove('active'));
        item.classList.add('active');
      }
    });

    // 2. Header nav active element
    const headerNavItems = document.querySelectorAll('.header-bar .nav-item');
    headerNavItems.forEach(item => {
      if (item.textContent.trim().toLowerCase() === tabName || (tabName === 'games' && item.textContent.trim() === 'Discover')) {
        headerNavItems.forEach(sib => sib.classList.remove('active'));
        item.classList.add('active');
      }
    });
  }

  // Hook watch trailer button
  const watchTrailerBtn = document.getElementById('watch-trailer-btn');
  if (watchTrailerBtn) {
    watchTrailerBtn.addEventListener('click', () => {
      launchGame("AeroSphere Trailer");
    });
  }
}

/**
 * Initialize background video click-to-play on landing page (runs only once)
 */
function initBackgroundVideoClick() {
  const landingPage = document.getElementById('landing-page');
  const video = document.querySelector('.background-video');

  if (landingPage && video) {
    landingPage.addEventListener('click', () => {
      if (video.paused) {
        video.play().then(() => {
          console.log('Video de fondo: reproducción iniciada tras clic de fallback.');
        }).catch(err => console.warn('Fallo al reproducir en clic:', err));
      }
    }, { once: true }); // Solo escuchar el primer clic para evitar disparar reproducciones repetidas
  }
}
