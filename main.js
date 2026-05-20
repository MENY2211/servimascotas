/* ══════════════════════════════════════
   PETCARE VILLAHERMOSA — main.js
   Interacciones y animaciones
══════════════════════════════════════ */

(function () {
  'use strict';

  /* ──────────────────────────────
     1. NAVBAR — scroll behavior
  ────────────────────────────── */
  const navbar = document.getElementById('navbar');

  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    toggleFloatButton();
    updateNavActiveLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ──────────────────────────────
     2. HAMBURGER MENU (móvil)
  ────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Cerrar menú al hacer clic en un enlace
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ──────────────────────────────
     3. BOTÓN FLOTANTE WHATSAPP
  ────────────────────────────── */
  const floatWa = document.getElementById('floatWa');

  function toggleFloatButton() {
    if (!floatWa) return;
    if (window.scrollY > 300) {
      floatWa.classList.add('visible');
    } else {
      floatWa.classList.remove('visible');
    }
  }

  /* ──────────────────────────────
     4. REVEAL ON SCROLL (IntersectionObserver)
  ────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback para navegadores sin soporte
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ──────────────────────────────
     5. ENLACE ACTIVO EN NAV según sección visible
  ────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateNavActiveLink() {
    let currentId = '';
    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= 100) currentId = section.id;
    });

    navAnchors.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + currentId) {
        a.classList.add('active');
      }
    });
  }

  /* ──────────────────────────────
     6. SMOOTH SCROLL para anclas internas
  ────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ──────────────────────────────
     7. ANIMACIÓN PALPITANTE en botón flotante (pulse)
  ────────────────────────────── */
  if (floatWa) {
    let pulseTimeout;

    function schedulePulse() {
      pulseTimeout = setTimeout(() => {
        if (!floatWa.matches(':hover')) {
          floatWa.style.animation = 'none';
          floatWa.offsetHeight; // reflow
          floatWa.style.animation = '';
        }
        schedulePulse();
      }, 4000);
    }

    schedulePulse();
  }

  /* ──────────────────────────────
     8. LAZY LOADING de imágenes (polyfill mínimo)
  ────────────────────────────── */
  if ('loading' in HTMLImageElement.prototype) {
    // Nativo, no se necesita polyfill
  } else {
    // Fallback básico para navegadores sin lazy loading nativo
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
      const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            imgObserver.unobserve(img);
          }
        });
      });
      lazyImgs.forEach(img => imgObserver.observe(img));
    }
  }

  /* ──────────────────────────────
     9. NÚMEROS ANIMADOS en stats del hero
  ────────────────────────────── */
  const heroStats = document.querySelectorAll('.hero-stat strong');

  function animateNumber(el, target, suffix, prefix) {
    prefix = prefix || '';
    const duration = 1200;
    const start = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(startVal + (target - startVal) * eased);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // Observar el hero para disparar animación
  const heroStatContainer = document.querySelector('.hero-stats');
  if (heroStatContainer && 'IntersectionObserver' in window) {
    const statsObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          heroStats.forEach(stat => {
            const text = stat.textContent.trim();
            if (text === '$80') animateNumber(stat, 80, '', '$');
            if (text === '5')   animateNumber(stat, 5, '', '');
          });
          statsObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statsObs.observe(heroStatContainer);
  }

  /* ──────────────────────────────
     10. TOOLTIP de WhatsApp flotante en mobile
  ────────────────────────────── */
  // En móvil se muestra el tooltip por 2 seg al hacer scroll después del hero
  if (floatWa && window.innerWidth < 600) {
    let tooltipShown = false;
    const tooltip = floatWa.querySelector('.float-tooltip');

    window.addEventListener('scroll', () => {
      if (!tooltipShown && window.scrollY > 500 && tooltip) {
        tooltipShown = true;
        tooltip.style.opacity = '1';
        setTimeout(() => { tooltip.style.opacity = '0'; }, 2500);
      }
    }, { passive: true });
  }

  /* ──────────────────────────────
     INIT
  ────────────────────────────── */
  onScroll(); // estado inicial

})();