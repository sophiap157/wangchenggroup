/* ============================================================
   WANGCHENGGROUP.COM - Main JavaScript
   Core Functionality: Navigation, Scroll, Particles, Counters
   ============================================================ */

(function () {
  'use strict';

  // ============ Page Loader ============
  const hideLoader = () => {
    const loader = document.querySelector('.page-loader');
    if (loader) {
      setTimeout(() => loader.classList.add('hidden'), 300);
    }
  };

  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);
  setTimeout(hideLoader, 2500);

  // ============ Mobile Navigation Toggle ============
  const initMobileNav = () => {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      const isOpen = menu.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    menu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  };

  // ============ Sticky Navigation ============
  const initStickyNav = () => {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const handleScroll = () => {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
  };

  // ============ Smooth Scroll for Anchor Links ============
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  };

  // ============ Reveal on Scroll (IntersectionObserver) ============
  const initReveal = () => {
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!('IntersectionObserver' in window) || !revealEls.length) {
      revealEls.forEach(el => el.classList.add('in-view'));
      return;
    }

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach(el => io.observe(el));
  };

  // ============ Number Counter Animation ============
  const animateNumber = (el) => {
    const target = parseFloat(el.getAttribute('data-count')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 1800;
    const startTime = performance.now();
    const isFloat = target % 1 !== 0;

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4); // easeOutQuart
      const current = target * ease;
      el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + (isFloat ? target.toFixed(1) : target.toLocaleString()) + suffix;
    };
    requestAnimationFrame(tick);
  };

  const initCounters = () => {
    const counters = document.querySelectorAll('.count-up[data-count]');
    if (!counters.length || !('IntersectionObserver' in window)) {
      counters.forEach(c => {
        const target = c.getAttribute('data-count') || '0';
        c.textContent = target;
      });
      return;
    }

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => io.observe(el));
  };

  // ============ Particle Network Background ============
  const initParticles = (canvasId, options = {}) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const config = Object.assign(
      {
        count: 60,
        maxDist: 140,
        color: '0, 229, 255',
        size: 1.2,
        speed: 0.35,
      },
      options
    );

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      w = rect.width;
      h = rect.height || canvas.offsetHeight || 600;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
    };

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.r = Math.random() * config.size + 0.4;
        this.alpha = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${config.color}, ${this.alpha})`;
        ctx.fill();
      }
    }

    const initParticlesArray = () => {
      particles = [];
      const area = w * h;
      const count = Math.min(config.count, Math.floor(area / 12000));
      for (let i = 0; i < count; i++) particles.push(new Particle());
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < config.maxDist) {
            const op = (1 - dist / config.maxDist) * 0.18;
            ctx.strokeStyle = `rgba(${config.color}, ${op})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    };

    let animating = true;
    const animate = () => {
      if (!animating) return;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animate);
    };

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      particles.forEach(p => {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.vx -= (dx / dist) * force * 0.4;
          p.vy -= (dy / dist) * force * 0.4;
        }
      });
    };

    resize();
    initParticlesArray();
    animate();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        initParticlesArray();
      }, 200);
    });

    canvas.addEventListener('mousemove', handleMouse);

    // Pause when offscreen
    const visObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        animating = entry.isIntersecting;
        if (animating) animate();
      });
    });
    visObserver.observe(canvas);
  };

  // ============ Animated SVG Orb / Wave ============
  const initHeroOrb = () => {
    const canvas = document.getElementById('orb-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, t = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.parentElement.clientWidth;
      h = canvas.parentElement.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.28;

      // Outer wave
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.01) {
        const r = baseR + Math.sin(a * 4 + t) * 8 + Math.cos(a * 6 - t) * 6;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, baseR * 1.4);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
      grad.addColorStop(1, 'rgba(99, 102, 241, 0.05)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.4 + Math.sin(t * 2) * 0.15})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center dot grid
      const gridSize = 10;
      const spacing = baseR * 0.25;
      for (let i = -gridSize; i <= gridSize; i++) {
        for (let j = -gridSize; j <= gridSize; j++) {
          const x = cx + i * spacing;
          const y = cy + j * spacing;
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > baseR * 0.7) continue;
          const alpha = (1 - dist / (baseR * 0.7)) * 0.6;
          ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(draw);
    };
    draw();
  };

  // ============ Tilt Card Effect ============
  const initTiltCards = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
        card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg) translateZ(0)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)';
      });
    });
  };

  // ============ Magnetic Button ============
  const initMagneticButtons = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  };

  // ============ Initialize All ============
  const init = () => {
    initMobileNav();
    initStickyNav();
    initSmoothScroll();
    initReveal();
    initCounters();
    initTiltCards();
    initMagneticButtons();
    initHeroOrb();

    // Particles on hero
    initParticles('particle-canvas', { count: 70, maxDist: 130, color: '0, 229, 255' });

    // Footer / secondary sections
    initParticles('footer-canvas', { count: 30, maxDist: 100, color: '0, 229, 255', speed: 0.2 });

    // Console signature
    console.log('%c wangchenggroup.com ', 'background:#00e5ff;color:#000;font-weight:bold;padding:6px 12px;border-radius:4px;');
    console.log('%c Crafted with minimalism, privacy-first, and engineering precision. ', 'color:#9ca3af;');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();