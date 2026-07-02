/* ============================================================
   WANGCHENGGROUP.COM - Animations JavaScript
   Advanced Visual Effects: Typewriter, Parallax, Cursor, Forms
   ============================================================ */

(function () {
  'use strict';

  // ============ Typewriter Effect ============
  class Typewriter {
    constructor(el, words, opts = {}) {
      this.el = el;
      this.words = words;
      this.wait = parseInt(opts.wait || 2000, 10);
      this.typeSpeed = opts.typeSpeed || 80;
      this.deleteSpeed = opts.deleteSpeed || 40;
      this.wordIndex = 0;
      this.txt = '';
      this.isDeleting = false;
      this.tick();
    }
    tick() {
      const current = this.wordIndex % this.words.length;
      const fullTxt = this.words[current];
      if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
      } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
      }
      this.el.textContent = this.txt;
      let delta = this.isDeleting ? this.deleteSpeed : this.typeSpeed;
      if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.wait;
        this.isDeleting = true;
      } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.wordIndex++;
        delta = 500;
      }
      setTimeout(() => this.tick(), delta);
    }
  }

  const initTypewriter = () => {
    const els = document.querySelectorAll('[data-typewriter]');
    els.forEach(el => {
      const wordsAttr = el.getAttribute('data-typewriter');
      try {
        const words = JSON.parse(wordsAttr);
        new Typewriter(el, words);
      } catch (e) {
        const words = wordsAttr.split('|').map(w => w.trim());
        new Typewriter(el, words);
      }
    });
  };

  // ============ Parallax on Mouse Move ============
  const initParallax = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length) return;

    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      layers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-parallax')) || 0.05;
        const xOff = x * speed * 30;
        const yOff = y * speed * 30;
        layer.style.transform = `translate3d(${xOff}px, ${yOff}px, 0)`;
      });
    };

    let rafId = null;
    document.addEventListener('mousemove', (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        handleMove(e);
        rafId = null;
      });
    });
  };

  // ============ Scroll-Triggered Parallax ============
  const initScrollParallax = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = document.querySelectorAll('[data-scroll-parallax]');
    if (!els.length) return;

    let ticking = false;
    const update = () => {
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        const speed = parseFloat(el.getAttribute('data-scroll-parallax')) || 0.1;
        const offset = (window.innerHeight / 2 - rect.top) * speed;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  };

  // ============ Custom Cursor (Desktop Only) ============
  const initCustomCursor = () => {
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
    document.body.appendChild(cursor);

    const style = document.createElement('style');
    style.textContent = `
      .custom-cursor { position: fixed; top: 0; left: 0; pointer-events: none; z-index: 99999; mix-blend-mode: difference; }
      .cursor-dot { position: fixed; top: 0; left: 0; width: 6px; height: 6px; background: #fff; border-radius: 50%; transform: translate(-50%, -50%); transition: transform 0.1s var(--ease-out), width 0.2s var(--ease-out), height 0.2s var(--ease-out); }
      .cursor-ring { position: fixed; top: 0; left: 0; width: 36px; height: 36px; border: 1px solid rgba(255,255,255,0.5); border-radius: 50%; transform: translate(-50%, -50%); transition: transform 0.18s var(--ease-out), width 0.2s var(--ease-out), height 0.2s var(--ease-out); }
      .custom-cursor.hover .cursor-dot { width: 12px; height: 12px; }
      .custom-cursor.hover .cursor-ring { width: 56px; height: 56px; border-color: #00e5ff; }
      @media (hover: none) { .custom-cursor { display: none; } }
    `;
    document.head.appendChild(style);

    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.querySelector('.cursor-dot').style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    const animateRing = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      cursor.querySelector('.cursor-ring').style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    const hoverTargets = 'a, button, .card, .news-card, .app-card, .process-step, .team-card, input, textarea';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  };

  // ============ Scroll Progress Indicator ============
  const initScrollProgress = () => {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  // ============ Form Handling ============
  const initContactForm = () => {
    const form = document.querySelector('#contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      const submitBtn = form.querySelector('[type="submit"]');
      const origText = submitBtn.textContent;
      submitBtn.textContent = 'Transmitting...';
      submitBtn.disabled = true;

      // Simulate transmission (replace with real endpoint in production)
      setTimeout(() => {
        if (status) {
          status.classList.add('success');
          status.textContent = '✓ Message received. Our team will respond within 24 hours.';
        }
        form.reset();
        submitBtn.textContent = origText;
        submitBtn.disabled = false;
        setTimeout(() => { if (status) { status.classList.remove('success'); status.textContent = ''; } }, 6000);
      }, 1200);
    });

    // Floating label / focus effect
    form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
      input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
      input.addEventListener('blur', () => {
        if (!input.value) input.parentElement.classList.remove('focused');
      });
    });
  };

  // ============ Set Active Nav Link ============
  const setActiveNav = () => {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (href === path || (path === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  };

  // ============ Current Year in Footer ============
  const setCurrentYear = () => {
    const els = document.querySelectorAll('[data-year]');
    els.forEach(el => el.textContent = new Date().getFullYear());
  };

  // ============ Tab System ============
  const initTabs = () => {
    document.querySelectorAll('[data-tabs]').forEach(tabGroup => {
      const triggers = tabGroup.querySelectorAll('[data-tab]');
      const panels = document.querySelectorAll(`[data-tab-panel-group="${tabGroup.getAttribute('data-tabs')}"] > [data-tab-panel]`);
      triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const target = trigger.getAttribute('data-tab');
          triggers.forEach(t => t.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          trigger.classList.add('active');
          const panel = document.querySelector(`[data-tab-panel="${target}"]`);
          if (panel) panel.classList.add('active');
        });
      });
    });
  };

  // ============ Accordion ============
  const initAccordion = () => {
    document.querySelectorAll('[data-accordion]').forEach(acc => {
      const triggers = acc.querySelectorAll('[data-accordion-trigger]');
      triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const expanded = trigger.getAttribute('aria-expanded') === 'true';
          const panel = trigger.nextElementSibling;
          trigger.setAttribute('aria-expanded', !expanded);
          if (panel) {
            panel.style.maxHeight = expanded ? '0' : panel.scrollHeight + 'px';
          }
        });
      });
    });
  };

  // ============ Marquee Duplication ============
  const duplicateMarquees = () => {
    document.querySelectorAll('.marquee-track').forEach(track => {
      const clone = track.innerHTML;
      track.innerHTML = clone + clone;
    });
  };

  // ============ Console Easter Egg ============
  const consoleSignature = () => {
    console.log(
      '%c wangchenggroup.com ',
      'background: linear-gradient(135deg, #00e5ff, #6366f1); color: #000; font-weight: 700; font-size: 16px; padding: 12px 24px; border-radius: 6px;'
    );
    console.log(
      '%c Minimalist Design · Privacy First · Experience Paramount ',
      'color: #00e5ff; font-family: monospace; font-size: 12px; padding: 8px 0;'
    );
    console.log(
      '%c Engineering innovation with human warmth. ',
      'color: #9ca3af; font-size: 12px; padding: 4px 0;'
    );
  };

  // ============ Initialize ============
  const init = () => {
    setActiveNav();
    setCurrentYear();
    initTypewriter();
    initParallax();
    initScrollParallax();
    initCustomCursor();
    initScrollProgress();
    initContactForm();
    initTabs();
    initAccordion();
    duplicateMarquees();
    consoleSignature();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();