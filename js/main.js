/* ============================================================
 HELIOS CAPITAL - main.js
 Motion, reveal, counters, sliders, interactions
 ============================================================ */
(function () {
 'use strict';

 /* ---------- Redirect section CTA/links to 404 (public + auth pages) ---------- */
  const rPath = location.pathname.split('/').pop() || 'index.html';
  const redirectPages = ['index.html', 'about.html', 'services.html', 'blog.html', 'contact.html', 'signin.html', 'signup.html'];
  if (redirectPages.indexOf(rPath) !== -1) {
  const auth = rPath === 'signin.html' || rPath === 'signup.html';
  const allowSel = auth
  ? '.brand, .auth-back, .auth-alt a, .role-switch, .pw-toggle, form[data-auth-form] button[type="submit"]'
  : '.site-header, .brand, .footer-company, .faq-q, .cat-pill, .to-top, .lightbox, .arrow-btn, .testi-dot, form[data-newsletter] button[type="submit"], form[data-demo] button[type="submit"]';
  document.addEventListener('click', function (e) {
  const t = e.target;
  const el = t && typeof t.closest === 'function' ? t.closest('a[href], button, input[type="submit"]') : null;
  if (!el) return;
  if (el.closest(allowSel)) return;
  e.preventDefault();
  e.stopPropagation();
  location.href = '404.html';
  }, true);
  }

 /* ---------- Preloader ---------- */
 const pre = document.getElementById('preloader');
 if (pre) {
 window.addEventListener('load', () => pre.classList.add('done'));
 setTimeout(() => pre && pre.classList.add('done'), 1800);
 }

 /* ---------- Scroll progress + header + to-top ---------- */
 const progress = document.getElementById('scrollProgress');
 const header = document.querySelector('.site-header');
 const toTop = document.querySelector('.to-top');

 function onScroll() {
 const y = window.scrollY;
 const max = document.documentElement.scrollHeight - innerHeight;
 if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
 if (header) header.classList.toggle('scrolled', y > 50);
 if (toTop) toTop.classList.toggle('show', y > 600);
 }
 window.addEventListener('scroll', onScroll, { passive: true });
 onScroll();
 if (toTop) toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- Mobile nav ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
  const lockScroll = on => {
  document.body.style.overflow = on ? 'hidden' : '';
  document.documentElement.style.overflow = on ? 'hidden' : '';
  };
  const openNav = () => { nav.classList.add('open'); toggle.classList.add('open'); lockScroll(true); };
  const closeNav = () => {
  toggle.classList.remove('open');
  nav.classList.remove('open');
  lockScroll(false);
  };
  toggle.addEventListener('click', () => {
  if (nav.classList.contains('open')) closeNav(); else openNav();
  });
  const closeBtn = document.querySelector('.nav-close');
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) closeNav(); });
  }

 /* ---------- Reveal on scroll with stagger ---------- */
 const revealEls = document.querySelectorAll('[data-reveal]');
 if ('IntersectionObserver' in window) {
 const io = new IntersectionObserver((entries) => {
 entries.forEach((e, i) => {
 if (e.isIntersecting) {
 const el = e.target;
 const parent = el.closest('[data-stagger]');
 if (parent) {
 const kids = [...parent.children];
 const idx = kids.indexOf(el);
 el.style.setProperty('--d', (idx * 90) + 'ms');
 }
 el.classList.add('in-view');
 io.unobserve(el);
 }
 });
 }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
 revealEls.forEach(el => io.observe(el));
 } else {
 revealEls.forEach(el => el.classList.add('in-view'));
 }

 /* ---------- Animated counters ---------- */
 const counters = document.querySelectorAll('[data-count]');
 const countIO = new IntersectionObserver((entries) => {
 entries.forEach(en => {
 if (!en.isIntersecting) return;
 const el = en.target;
 const target = parseFloat(el.dataset.count);
 const suffix = el.dataset.suffix || '';
 const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
 const dur = 1800;
 const start = performance.now();
 (function tick(now) {
 const p = Math.min((now - start) / dur, 1);
 const eased = 1 - Math.pow(1 - p, 4);
 el.textContent = (target * eased).toFixed(decimals) + suffix;
 if (p < 1) requestAnimationFrame(tick);
 })(start);
 countIO.unobserve(el);
 });
 }, { threshold: 0.4 });
 counters.forEach(c => countIO.observe(c));

 /* ---------- Testimonial slider ---------- */
 const slider = document.querySelector('.testi-slider');
 if (slider) {
 const track = slider.querySelector('.testi-track');
 const slides = track.children;
 const dots = document.querySelectorAll('.testi-dot');
 const prev = document.getElementById('testiPrev');
 const next = document.getElementById('testiNext');
 let idx = 0;
 function go(i) {
 idx = (i + slides.length) % slides.length;
 track.style.transform = 'translateX(-' + idx * 100 + '%)';
 dots.forEach((d, di) => d.classList.toggle('active', di === idx));
 }
 if (prev) prev.addEventListener('click', () => go(idx - 1));
 if (next) next.addEventListener('click', () => go(idx + 1));
 dots.forEach((d, di) => d.addEventListener('click', () => go(di)));
 let timer = setInterval(() => go(idx + 1), 6000);
 slider.addEventListener('mouseenter', () => clearInterval(timer));
 slider.addEventListener('mouseleave', () => timer = setInterval(() => go(idx + 1), 6000));
 }

 /* ---------- FAQ accordion ---------- */
 document.querySelectorAll('.faq-item').forEach(item => {
 const q = item.querySelector('.faq-q');
 if (q) q.addEventListener('click', () => {
 const wasOpen = item.classList.contains('open');
 document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
 if (!wasOpen) item.classList.add('open');
 });
 });

 /* ---------- Blog category filter ---------- */
 const pills = document.querySelectorAll('.cat-pill[data-filter]');
 if (pills.length) {
 pills.forEach(p => p.addEventListener('click', () => {
 pills.forEach(x => x.classList.remove('active'));
 p.classList.add('active');
 const cat = p.dataset.filter;
 document.querySelectorAll('.blog-card').forEach(card => {
 const show = cat === 'all' || card.dataset.cat === cat;
 card.style.display = show ? '' : 'none';
 if (show) {
 card.classList.remove('in-view');
 requestAnimationFrame(() => {
 card.classList.add('in-view');
 card.style.setProperty('--d', Math.random() * 200 + 'ms');
 });
 }
 });
 }));
 }

 /* ---------- Portfolio filter (index) ---------- */
 const pfPills = document.querySelectorAll('[data-fp]');
 if (pfPills.length) {
 pfPills.forEach(p => p.addEventListener('click', () => {
 pfPills.forEach(x => x.classList.remove('active'));
 p.classList.add('active');
 const cat = p.dataset.fp;
 document.querySelectorAll('.portfolio-card').forEach(c => {
 const show = cat === 'all' || c.dataset.cat === cat;
 c.style.display = show ? '' : 'none';
 });
 }));
 }

 /* ---------- Lightbox for portfolio ---------- */
 const lightbox = document.getElementById('lightbox');
 if (lightbox) {
 const img = lightbox.querySelector('img');
 const cap = lightbox.querySelector('.lb-cap');
 const close = lightbox.querySelector('.lb-close');
 const open = () => { lightbox.style.display = 'grid'; lightbox.classList.add('show'); document.body.style.overflow = 'hidden'; };
 const shut = () => { lightbox.style.display = 'none'; lightbox.classList.remove('show'); document.body.style.overflow = ''; };
 document.querySelectorAll('.portfolio-card').forEach(card => {
 if (card.dataset.fpFilter === 'skip') return;
 card.addEventListener('click', () => {
 img.src = card.querySelector('img').src;
 cap.textContent = card.querySelector('h3').textContent;
 open();
 });
 });
 [close, lightbox].forEach(el => el.addEventListener('click', (e) => {
 if (e.target === lightbox || e.target === close) shut();
 }));
 document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
 }

 /* ---------- Tilt cards ---------- */
 if (!window.matchMedia('(pointer:coarse)').matches) {
 document.querySelectorAll('[data-tilt]').forEach(card => {
 card.addEventListener('mousemove', e => {
 const r = card.getBoundingClientRect();
 const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
 const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
 card.style.transform = `perspective(900px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-6px)`;
 });
 card.addEventListener('mouseleave', () => { card.style.transform = ''; });
 });
 }

/* ---------- Forms (demo submit) ---------- */
  function isValidGmail(email) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(String(email).trim());
  }
  function showFieldError(input, msg) {
  clearFieldError(input);
  const err = document.createElement('div');
  err.className = 'field-error';
  err.textContent = msg;
  input.classList.add('error');
  const field = input.closest('.field');
  (field || input.parentElement).appendChild(err);
  input.focus();
  }
  function clearFieldError(input) {
  input.classList.remove('error');
  if (input.type === 'checkbox') {
  const host = input.closest('.check-row') || input.parentElement;
  const next = host && host.nextElementSibling;
  if (next && next.classList.contains('field-error')) next.remove();
  return;
  }
  const field = input.closest('.field') || input.parentElement;
  const n = field && field.querySelector(':scope > .field-error');
  if (n) n.remove();
  }
  window.isValidGmail = isValidGmail;

  function validateDemoForm(form) {
  let ok = true;
  form.querySelectorAll('[required]').forEach(inp => {
  if (inp.type === 'checkbox') {
  if (!inp.checked) {
  clearFieldError(inp);
  const err = document.createElement('div');
  err.className = 'field-error';
  err.textContent = 'Please tick this box to continue.';
  const host = inp.closest('.check-row');
  (host || inp.parentElement).after(err);
  inp.classList.add('error');
  ok = false;
  }
  return;
  }
  if (!inp.value.trim()) { showFieldError(inp, 'Please fill in this field.'); ok = false; return; }
  if (inp.type === 'email' && !isValidGmail(inp.value)) { showFieldError(inp, 'Please enter a valid Gmail address ending with "@gmail.com".'); ok = false; }
  });
  return ok;
  }

  document.querySelectorAll('form[data-demo]').forEach(form => {
  form.addEventListener('submit', e => {
  e.preventDefault();
  if (form.hasAttribute('data-auth-form')) return;
  if (!validateDemoForm(form)) return;
  location.href = '404.html';
  });
  });
  document.querySelectorAll('form[data-demo] input[required], form[data-demo] textarea[required]').forEach(inp => {
  inp.addEventListener('input', () => clearFieldError(inp));
  });

 /* ---------- Auth: role switch + dashboard routing ---------- */
 document.querySelectorAll('.role-switch').forEach(switchEl => {
 const hidden = switchEl.parentElement.querySelector('input[name="role"]');
 switchEl.querySelectorAll('button').forEach(btn => {
 btn.addEventListener('click', () => {
 switchEl.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
 if (hidden) hidden.value = btn.dataset.role;
 });
 });
 });
document.querySelectorAll('form[data-auth-form]').forEach(form => {
  form.addEventListener('submit', e => {
  e.preventDefault();
  const mail = form.querySelector('#si-email, #su-email');
  if (mail) {
  if (!mail.value.trim()) {
  showFieldError(mail, 'Please enter your email address.');
  return;
  }
  if (!isValidGmail(mail.value)) {
  showFieldError(mail, 'Please enter a valid Gmail address ending with "@gmail.com".');
  return;
  }
  }
  const role = (form.querySelector('input[name="role"]') || {}).value || 'user';
  const isSignin = form.querySelector('#si-email') !== null;
  const loginEmail = mail ? mail.value.trim() : '';
  if (loginEmail) localStorage.setItem('stackly_user_email', loginEmail);
  showToast(isSignin
  ? (role === 'admin' ? 'Admin signed in successfully.' : 'Signed in successfully.')
  : (role === 'admin' ? 'Admin account created. Please sign in.' : 'Account created. Please sign in.'));
  setTimeout(() => {
  location.href = isSignin
  ? (role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html')
  : 'signin.html';
  }, 750);
  });
  });
  document.querySelectorAll('#si-email, #su-email').forEach(inp => {
  inp.addEventListener('input', () => clearFieldError(inp));
  });
const newsletter = document.querySelector('.newsletter form');
  if (newsletter) newsletter.addEventListener('submit', e => {
  e.preventDefault();
  const mail = newsletter.querySelector('input[type="email"]');
  if (mail) {
  if (!mail.value.trim()) {
  showFieldError(mail, 'Please enter your email address.');
  return;
  }
  if (!isValidGmail(mail.value)) {
  showFieldError(mail, 'Please enter a valid Gmail address ending with "@gmail.com".');
  return;
  }
  }
  location.href = '404.html';
  });
  if (newsletter) newsletter.querySelectorAll('input').forEach(inp => {
  inp.addEventListener('input', () => clearFieldError(inp));
  });

 function showToast(msg) {
 let t = document.querySelector('.toast');
 if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
 t.textContent = ' ' + msg;
 t.classList.add('show');
 clearTimeout(t._timer);
 t._timer = setTimeout(() => t.classList.remove('show'), 4000);
 }
 window.showToast = showToast;

 /* ---------- Password toggle ---------- */
 document.querySelectorAll('.pw-toggle').forEach(btn => {
 btn.addEventListener('click', () => {
 const inp = btn.parentElement.querySelector('input');
 const isPw = inp.type === 'password';
 inp.type = isPw ? 'text' : 'password';
 btn.textContent = isPw ? ' ' : ' ';
 });
 });

 /* ---------- Team social hover (keyboard) ---------- */
 document.querySelectorAll('.team-card').forEach(c => {
 c.addEventListener('focusin', () => c.querySelector('.team-social') && (c.querySelector('.team-social').style.transform = 'translate(-50%,0)'));
 c.addEventListener('focusout', () => c.querySelector('.team-social') && (c.querySelector('.team-social').style.transform = ''));
 });

 /* ---------- Typewriter (hero) ---------- */
 const typer = document.querySelector('[data-typer]');
 if (typer) {
 const words = (typer.dataset.typer || '').split('|').filter(Boolean);
 if (words.length) {
 let wi = 0, ci = 0, deleting = false;
 const caret = '<span style="color:var(--gold-500)">|</span>';
 (function type() {
 const word = words[wi];
 typer.innerHTML = word.slice(0, ci) + caret;
 if (!deleting) {
 if (ci < word.length) { ci++; typer._t = setTimeout(type, 95); }
 else { deleting = true; typer._t = setTimeout(type, 1800); }
 } else {
 if (ci > 0) { ci--; typer._t = setTimeout(type, 45); }
 else { deleting = false; wi = (wi + 1) % words.length; typer._t = setTimeout(type, 350); }
 }
 })();
 }
 }

 /* ---------- Social buttons (Google/Apple) -> 404 ---------- */
  document.querySelectorAll('.social-btn').forEach(btn => {
  btn.addEventListener('click', () => { location.href = '404.html'; });
  });

  /* ---------- Footer year ---------- */
 document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

 /* ---------- Nav active state on inner pages ---------- */
 const path = location.pathname.split('/').pop() || 'index.html';
 document.querySelectorAll('.site-nav a').forEach(a => {
 const href = a.getAttribute('href');
 if (href === path) a.classList.add('active');
else if (path === 'index.html' && href === 'index.html') a.classList.add('active');
});
})();