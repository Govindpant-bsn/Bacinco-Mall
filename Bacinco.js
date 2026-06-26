(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll progress / day bar ---------- */
  const daybarFill = document.getElementById('daybarFill');
  function updateDaybar() {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    daybarFill.style.width = pct + '%';
  }

  /* ---------- Nav hide/reveal + scrolled state ---------- */
  const nav = document.getElementById('siteNav');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('nav--scrolled', y > 40);

    if (y > lastY && y > 140) {
      nav.classList.add('nav--hidden');
    } else {
      nav.classList.remove('nav--hidden');
    }
    lastY = y;
    updateDaybar();
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  updateDaybar();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openMenu() {
    mobileMenu.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- Reveal-on-scroll (IntersectionObserver) ---------- */
  const revealTargets = document.querySelectorAll('.reveal, .reveal-media, .reveal-line');

  if (reduceMotion) {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(el => revealObserver.observe(el));
  }

  /* ---------- Moment background tint (in-frame tracking for evening/night) ---------- */
  const moments = document.querySelectorAll('.moment');
  const momentObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('in-frame', entry.isIntersecting);
    });
  }, { threshold: 0.4 });
  moments.forEach(m => momentObserver.observe(m));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.stat__num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      if (reduceMotion) {
        el.textContent = target;
        counterObserver.unobserve(el);
        return;
      }
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');

  const validators = {
    nameField: (v) => v.trim().length >= 2 ? '' : 'Please enter your name.',
    emailField: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    messageField: (v) => v.trim().length >= 5 ? '' : 'Tell us a little more — at least 5 characters.'
  };

  function validateField(input) {
    const field = input.closest('.field');
    const errorEl = field.querySelector('.field__error');
    const msg = validators[input.id](input.value);
    field.classList.toggle('has-error', !!msg);
    if (errorEl) errorEl.textContent = msg;
    return !msg;
  }

  ['nameField', 'emailField', 'messageField'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('has-error')) validateField(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = ['nameField', 'emailField', 'messageField'].map(id => document.getElementById(id));
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) {
      inputs.find(i => i.closest('.field').classList.contains('has-error'))?.focus();
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      successMsg.classList.add('is-visible');
      form.reset();
      inputs.forEach(i => i.closest('.field').classList.remove('has-error'));
      setTimeout(() => successMsg.classList.remove('is-visible'), 6000);
    }, 1100);
  });

})();
