/* ══════════════════════════════════════════════════════════
   KC APP TECH – Main JavaScript
   Premium Futuristic Tech Website
   ══════════════════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────────────────────
   UTILITY
   ──────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* ────────────────────────────────────────────────────────────
   LOADING SCREEN
   ──────────────────────────────────────────────────────────── */
function initLoader() {
  const loader = $('#loader');
  const bar = $('#loaderBar');
  if (!loader || !bar) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18 + 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      bar.style.width = '100%';
      bar.parentElement.setAttribute('aria-valuenow', 100);
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        // Kick off hero reveal
        $$('.hero .reveal-up, .hero .reveal-right').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), 100 + i * 150);
        });
      }, 500);
    } else {
      bar.style.width = progress + '%';
      bar.parentElement.setAttribute('aria-valuenow', Math.round(progress));
    }
  }, 90);

  document.body.style.overflow = 'hidden';
}

/* ────────────────────────────────────────────────────────────
   CANVAS PARTICLE NETWORK (Hero)
   ──────────────────────────────────────────────────────────── */
function initParticleCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  const COLORS = ['#00D4FF', '#7B61FF', '#00F0FF'];
  const MAX_DIST = 140;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  function buildParticles() {
    const count = Math.min(Math.floor((W * H) / 9000), 120);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.6 + 0.3,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const opacity = (1 - dist / MAX_DIST) * 0.18;
          ctx.globalAlpha = opacity;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }

  resize();
  draw();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  // Pause when not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(animId); }
    else { draw(); }
  });
}

/* ────────────────────────────────────────────────────────────
   CUSTOM CURSOR
   ──────────────────────────────────────────────────────────── */
function initCursor() {
  const dot = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  // Lag ring behind dot
  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  // Active state on interactive elements
  const interactEls = 'a, button, .magnetic-btn, .service-card, .feature-card, .team-card, .blog-card, .testimonial-card, .pricing-card, .faq-question';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactEls)) { dot.classList.add('active'); ring.classList.add('active'); }
    else { dot.classList.remove('active'); ring.classList.remove('active'); }
  });
}

/* ────────────────────────────────────────────────────────────
   MAGNETIC BUTTONS
   ──────────────────────────────────────────────────────────── */
function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  $$('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35;
      const dy = (e.clientY - cy) * 0.35;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });

    // Ripple on click
    btn.addEventListener('click', e => {
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/* ────────────────────────────────────────────────────────────
   STICKY NAVBAR
   ──────────────────────────────────────────────────────────── */
function initNavbar() {
  const nav = $('#navbar');
  if (!nav) return;

  const links = $$('.nav-link');
  const sections = $$('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 40);

    // Active link via IntersectionObserver (fallback via scroll)
    let current = '';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });

    // Back-to-top
    const btn = $('#backToTop');
    if (btn) btn.classList.toggle('visible', scrollY > 500);
  }, { passive: true });

  // Mobile toggle
  const toggle = $('#navToggle');
  const menu = $('#navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    // Close on link click
    $$('.nav-link', menu).forEach(l => {
      l.addEventListener('click', () => {
        toggle.classList.remove('open');
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Back to top
  const btt = $('#backToTop');
  if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ────────────────────────────────────────────────────────────
   SCROLL REVEAL (IntersectionObserver)
   ──────────────────────────────────────────────────────────── */
function initScrollReveal() {
  if (!window.IntersectionObserver) {
    $$('.reveal-up, .reveal-left, .reveal-right').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  // Exclude hero – handled after loader
  $$('.reveal-up:not(.hero .reveal-up):not(.hero .reveal-right), .reveal-left, .reveal-right:not(.hero .reveal-right)').forEach(el => obs.observe(el));
}

/* ────────────────────────────────────────────────────────────
   ANIMATED COUNTERS
   ──────────────────────────────────────────────────────────── */
function initCounters() {
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animate(el, target, duration = 2000) {
    const start = performance.now();
    function step(now) {
      const t = clamp((now - start) / duration, 0, 1);
      const val = Math.round(easeOut(t) * target);
      el.textContent = val.toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const tgt = parseInt(el.dataset.target, 10);
        animate(el, tgt);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  $$('.counter, .counter-dash').forEach(el => obs.observe(el));
}

/* ────────────────────────────────────────────────────────────
   TIMELINE LINE FILL
   ──────────────────────────────────────────────────────────── */
function initTimeline() {
  const fill = $('#timelineFill');
  if (!fill) return;

  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      fill.style.width = '100%';
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(fill.closest('.timeline-track'));
}

/* ────────────────────────────────────────────────────────────
   TESTIMONIALS CAROUSEL
   ──────────────────────────────────────────────────────────── */
function initCarousel() {
  const track = $('#testimonialsTrack');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const dotsWrap = $('#carouselDots');
  if (!track || !prevBtn) return;

  const cards = $$('.testimonial-card', track);
  const total = cards.length;
  let current = 0;
  let autoplay;

  // Build dots
  const dots = [];
  for (let i = 0; i < total; i++) {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    d.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
    dots.push(d);
  }

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    const cardW = cards[0].offsetWidth + 24; // gap = 24px
    track.style.transform = `translateX(-${current * cardW}px)`;
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); restartAutoplay(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); restartAutoplay(); });

  function startAutoplay() {
    autoplay = setInterval(() => goTo(current + 1), 5000);
  }
  function restartAutoplay() {
    clearInterval(autoplay);
    startAutoplay();
  }

  startAutoplay();
  window.addEventListener('resize', () => goTo(current));
}

/* ────────────────────────────────────────────────────────────
   FAQ ACCORDION
   ──────────────────────────────────────────────────────────── */
function initFAQ() {
  $$('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer = $('#' + answerId);

      // Close all
      $$('.faq-question').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const aId = b.getAttribute('aria-controls');
        const ans = $('#' + aId);
        if (ans) ans.classList.remove('open');
      });

      // Toggle clicked
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        if (answer) answer.classList.add('open');
      }
    });
  });
}

/* ────────────────────────────────────────────────────────────
   CONTACT FORM
   ──────────────────────────────────────────────────────────── */
const CONTACT_SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxpIAAVCR1j6-yoiHtD9Fg03YMG3M_tIfENELoj_PLrCvsRCJsulYAcvmucFcCZ_-eR/exec';

function initContactForm() {
  const form = $('#contactForm');
  const success = $('#formSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = $('#submitBtn');
    btn.disabled = true;
    const span = btn.querySelector('span');
    span.textContent = 'Sending…';

    const data = {
      name: form.name.value,
      email: form.email.value,
      company: form.company.value,
      service: form.service.value,
      message: form.message.value
    };

    fetch(CONTACT_SHEET_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    })
      .then(() => {
        success.textContent = '✓ Message sent! We\'ll be in touch within 24 hours.';
        form.reset();
      })
      .catch(() => {
        success.textContent = '✗ Something went wrong. Please email us directly.';
      })
      .finally(() => {
        btn.disabled = false;
        span.textContent = 'Send Message';
        setTimeout(() => { success.textContent = ''; }, 6000);
      });
  });
}

/* ────────────────────────────────────────────────────────────
   SMOOTH SCROLL (for anchor links)
   ──────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ────────────────────────────────────────────────────────────
   PARALLAX ORBS
   ──────────────────────────────────────────────────────────── */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const orbs = $$('.hero-orb');
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 12;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  }, { passive: true });
}

/* ────────────────────────────────────────────────────────────
   DIGITAL RAIN ACCENT (subtle, behind hero)
   ──────────────────────────────────────────────────────────── */
function initDigitalRain() {
  // Very subtle – just a few floating text chars in the bg
  const hero = $('.hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const chars = '01アイウエオカキク01101∑∂∇⊕⊗◈◉▣'.split('');
  const count = 8;

  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'rain-char';
    span.textContent = chars[Math.floor(Math.random() * chars.length)];
    span.setAttribute('aria-hidden', 'true');
    Object.assign(span.style, {
      position: 'absolute',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      fontSize: (Math.random() * 12 + 8) + 'px',
      color: i % 2 === 0 ? 'rgba(0,212,255,0.12)' : 'rgba(123,97,255,0.12)',
      fontFamily: 'monospace',
      animation: `dpFloat ${6 + Math.random() * 8}s ease-in-out infinite`,
      animationDelay: `${-Math.random() * 8}s`,
      zIndex: 0,
      pointerEvents: 'none',
      userSelect: 'none',
    });
    hero.appendChild(span);
  }
}

/* ────────────────────────────────────────────────────────────
   DASHBOARD CHART ANIMATION TRIGGER
   ──────────────────────────────────────────────────────────── */
function initDashboard() {
  const chartLine = $('.chart-line');
  if (!chartLine) return;

  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      chartLine.style.animationPlayState = 'running';
      obs.disconnect();
    }
  }, { threshold: 0.3 });

  obs.observe($('.dashboard-mock') || chartLine);
}

/* ────────────────────────────────────────────────────────────
   LENIS-LIKE SMOOTH SCROLL (native-CSS fallback)
   ──────────────────────────────────────────────────────────── */
function initSmoothScrollBehavior() {
  // Already handled by html { scroll-behavior: smooth } in CSS.
  // No JS shim needed unless you want wheel interception.
}

/* ────────────────────────────────────────────────────────────
   SERVICE CARD ICON PULSE ON ENTER
   ──────────────────────────────────────────────────────────── */
function initServiceCards() {
  $$('.service-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const link = card.querySelector('.service-link');
        if (link) { e.preventDefault(); link.click(); }
      }
    });
  });
}

/* ────────────────────────────────────────────────────────────
   BLOG CARD KEYBOARD
   ──────────────────────────────────────────────────────────── */
function initBlogCards() {
  $$('.blog-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const link = card.querySelector('.blog-link');
        if (link) link.click();
      }
    });
  });
}

/* ────────────────────────────────────────────────────────────
   NEWSLETTER FORM
   ──────────────────────────────────────────────────────────── */
function initNewsletter() {
  $$('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (!input || !input.value.includes('@')) return;
      const btn = form.querySelector('button');
      const origHTML = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      input.value = '';
      setTimeout(() => { btn.innerHTML = origHTML; }, 3000);
    });
  });
}

/* ────────────────────────────────────────────────────────────
   PRICING CARD HOVER GLOW BORDER
   ──────────────────────────────────────────────────────────── */
function initPricingCards() {
  $$('.pricing-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0,212,255,0.07) 0%, rgba(11,16,32,0.55) 60%)`;
    });
    card.addEventListener('mouseleave', () => { card.style.background = ''; });
  });
}

/* ────────────────────────────────────────────────────────────
   FEATURE CARDS – CURSOR GLOW
   ──────────────────────────────────────────────────────────── */
function initFeatureCards() {
  $$('.feature-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      card.style.setProperty('--gx', x + '%');
      card.style.setProperty('--gy', y + '%');
    });
  });
}

/* ────────────────────────────────────────────────────────────
   LENS FLARE EFFECT (click anywhere on hero)
   ──────────────────────────────────────────────────────────── */
function initLensFlare() {
  const hero = $('.hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  hero.addEventListener('click', e => {
    const flare = document.createElement('div');
    flare.setAttribute('aria-hidden', 'true');
    Object.assign(flare.style, {
      position: 'absolute',
      left: (e.clientX - hero.getBoundingClientRect().left) + 'px',
      top: (e.clientY - hero.getBoundingClientRect().top) + 'px',
      width: '6px', height: '6px',
      borderRadius: '50%',
      background: 'rgba(0,240,255,0.9)',
      boxShadow: '0 0 60px 30px rgba(0,240,255,0.35)',
      transform: 'translate(-50%, -50%) scale(0)',
      transition: 'transform 0.5s ease, opacity 0.5s ease',
      opacity: '1',
      pointerEvents: 'none',
      zIndex: 3,
    });
    hero.appendChild(flare);
    requestAnimationFrame(() => {
      flare.style.transform = 'translate(-50%, -50%) scale(1)';
      setTimeout(() => { flare.style.opacity = '0'; setTimeout(() => flare.remove(), 500); }, 400);
    });
  });
}

/* ────────────────────────────────────────────────────────────
   INTERSECTION OBSERVER – TIMELINE ITEMS
   ──────────────────────────────────────────────────────────── */
function initTimelineItems() {
  const items = $$('.timeline-item');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });

  items.forEach(item => obs.observe(item));
}

/* ────────────────────────────────────────────────────────────
   COOKIE CONSENT BANNER
   ──────────────────────────────────────────────────────────── */
function initCookieBanner() {
  const banner = $('#cookieBanner');
  if (!banner) return;
  if (localStorage.getItem('nexcore_cookie_consent')) return;

  setTimeout(() => {
    banner.classList.add('visible');
  }, 1200);

  const btnAccept = $('#btnCookieAccept');
  if (btnAccept) {
    btnAccept.addEventListener('click', () => {
      localStorage.setItem('nexcore_cookie_consent', 'accepted');
      banner.classList.remove('visible');
    });
  }
}

/* ────────────────────────────────────────────────────────────
   PRIVACY PAGE INTERACTIVE FEATURES
   ──────────────────────────────────────────────────────────── */
function initPrivacyPageFeatures() {
  const privacyContent = $('#privacyContent');
  if (!privacyContent) return; // Only runs on privacy.html

  // 1. Reading Progress Bar & TOC Scroll Spy
  const progressBar = $('#tocProgressBar');
  const sections = $$('.privacy-card', privacyContent);
  const tocLinks = $$('.toc-link');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPos = window.scrollY;
    if (progressBar && totalHeight > 0) {
      progressBar.style.width = Math.min(100, Math.max(0, (scrollPos / totalHeight) * 100)) + '%';
    }

    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 150;
      if (scrollPos >= top) {
        currentId = sec.id;
      }
    });

    if (currentId) {
      tocLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
      });
    }
  });

  // 2. Search Privacy Policy Topics
  const searchInput = $('#privacySearch');
  const searchCount = $('#searchCount');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      let matches = 0;

      sections.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          card.style.display = '';
          if (q) matches++;
        } else {
          card.style.display = 'none';
        }
      });

      if (searchCount) {
        searchCount.textContent = q ? `${matches} section${matches === 1 ? '' : 's'} found` : '';
      }
    });
  }

  // 3. Print Button
  const btnPrint = $('#btnPrintPolicy');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
  }

  // 4. DSAR Request Modal logic
  const dsarModal = $('#dsarModal');
  const openBtns = [$('#btnOpenDsarModal'), $('#btnLaunchDsarInContent')].filter(Boolean);
  const closeBtn = $('#btnCloseDsarModal');
  const dsarForm = $('#dsarForm');
  const dsarSuccess = $('#dsarSuccess');

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (dsarModal) dsarModal.classList.add('open');
    });
  });

  if (closeBtn && dsarModal) {
    closeBtn.addEventListener('click', () => dsarModal.classList.remove('open'));
    dsarModal.addEventListener('click', e => {
      if (e.target === dsarModal) dsarModal.classList.remove('open');
    });
  }

  if (dsarForm) {
    dsarForm.addEventListener('submit', e => {
      e.preventDefault();
      if (dsarSuccess) {
        dsarSuccess.style.color = '#00FF87';
        dsarSuccess.textContent = 'Data request submitted! Our DPO team will email you verification steps within 24 hours.';
        setTimeout(() => {
          if (dsarModal) dsarModal.classList.remove('open');
          dsarForm.reset();
          dsarSuccess.textContent = '';
        }, 3500);
      }
    });
  }

  // 5. Cookie Preferences Widget Button
  const btnSaveCookies = $('#btnSaveCookiesWidget');
  if (btnSaveCookies) {
    btnSaveCookies.addEventListener('click', () => {
      localStorage.setItem('nexcore_cookie_consent', 'customized');
      const origText = btnSaveCookies.textContent;
      btnSaveCookies.textContent = 'Saved!';
      setTimeout(() => btnSaveCookies.textContent = origText, 2000);
    });
  }
}

/* ────────────────────────────────────────────────────────────
   BOOT
   ──────────────────────────────────────────────────────────── */
function boot() {
  initLoader();
  initParticleCanvas();
  initCursor();
  initMagneticButtons();
  initNavbar();
  initScrollReveal();
  initCounters();
  initTimeline();
  initTimelineItems();
  initCarousel();
  initFAQ();
  initContactForm();
  initSmoothScroll();
  initParallax();
  initDigitalRain();
  initDashboard();
  initServiceCards();
  initBlogCards();
  initNewsletter();
  initPricingCards();
  initFeatureCards();
  initLensFlare();
  initCookieBanner();
  initPrivacyPageFeatures();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
