/* ============================================================
 HELIOS CAPITAL - dashboard.js
 Subpage router (6 pages x 3 sections), charts, interactions
 ============================================================ */
(function () {
 'use strict';

 const menuBtn = document.querySelector('.menu-btn');
 const sidebar = document.querySelector('.sidebar');
 const overlay = document.querySelector('.dash-overlay');

/* ---------- Animated bar charts ---------- */
  function animateBars() {
  document.querySelectorAll('[data-page]:not([style*="display: none"]) [data-bar]').forEach(bar => {
  const h = bar.dataset.bar;
  bar.style.transition = 'none';
  if (bar.closest('.progress')) {
  bar.style.width = '0%';
  } else {
  bar.style.height = '0%';
  }
  requestAnimationFrame(() => requestAnimationFrame(() => {
  bar.style.transition = '';
  if (bar.closest('.progress')) {
  bar.style.width = h + '%';
  } else {
  bar.style.height = h + '%';
  }
  }));
  });
  }

 /* ---------- Counters ---------- */
 const counters = document.querySelectorAll('[data-count]');
 const cio = new IntersectionObserver(entries => {
 entries.forEach(en => {
 if (!en.isIntersecting) return;
 const el = en.target;
 const target = parseFloat(el.dataset.count);
 const suffix = el.dataset.suffix || '';
 const dec = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
 const dur = 1500;
 const start = performance.now();
 (function tick(now) {
 const p = Math.min((now - start) / dur, 1);
 const e = 1 - Math.pow(1 - p, 4);
 el.textContent = (target * e).toFixed(dec) + suffix;
 if (p < 1) requestAnimationFrame(tick);
 })(start);
 cio.unobserve(el);
 });
 }, { threshold: 0.35 });
 counters.forEach(c => cio.observe(c));

 function animateCounters() {
 counters.forEach(c => c.style.opacity = 1);
 }

 /* ---------- Mobile sidebar ---------- */
 if (menuBtn && sidebar) {
 const close = () => { sidebar.classList.remove('open'); overlay && overlay.classList.remove('show'); document.body.style.overflow = ''; };
 menuBtn.addEventListener('click', () => {
 const open = sidebar.classList.toggle('open');
 overlay && overlay.classList.toggle('show', open);
 document.body.style.overflow = open ? 'hidden' : '';
 });
 if (overlay) overlay.addEventListener('click', close);
 sidebar.querySelectorAll('a[data-sub]').forEach(a => a.addEventListener('click', close));
 }

 /* ---------- Reflect signed-in account from signin/signup ---------- */
  (function () {
  const email = localStorage.getItem('stackly_user_email');
  if (!email) return;
  function prettyName(addr) {
  return String(addr.split('@')[0] || '').replace(/[._-]+/g, ' ').replace(/\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1)).trim();
  }
  const displayName = prettyName(email);
  document.querySelectorAll('#profile-email, #firm-email').forEach(el => { if (el) el.value = email; });
  document.querySelectorAll('.user-chip b').forEach(b => {
  if (b.textContent.indexOf('@') === -1) b.textContent = displayName;
  });
  document.querySelectorAll('.user-chip small').forEach(s => {
  if (s.textContent.indexOf('@') === -1) {
  const role = s.textContent;
  s.textContent = role + ' - ' + email;
  }
  });
  document.querySelectorAll('#profile-fname').forEach(el => { if (el) el.value = displayName.split(' ')[0] || ''; });
  document.querySelectorAll('#profile-lname').forEach(el => { if (el) el.value = displayName.split(' ').slice(1).join(' ') || ''; });
  const initials = (email.split('@')[0] || '').replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase();
  const avatar = document.querySelector('.user-chip img');
  if (avatar && initials && avatar.getAttribute('alt') === avatar.getAttribute('alt')) {
  const holder = document.createElement('span');
  holder.className = 'chip-initials';
  holder.textContent = initials;
  avatar.replaceWith(holder);
  }
  })();

  /* ---------- Subpage routing (6 subpages) ---------- */
 const links = document.querySelectorAll('[data-sub]');
 const pages = document.querySelectorAll('[data-page]');
 const titleEl = document.querySelector('.page-title');
 const subEl = document.querySelector('.page-sub');

 function show(sub) {
 if (!sub) sub = links.length ? links[0].dataset.sub : '';
 links.forEach(l => l.classList.toggle('active', l.dataset.sub === sub));
 pages.forEach(p => {
 const isShow = p.id === 'pg-' + sub;
 p.style.display = isShow ? '' : 'none';
 if (isShow) p.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('in-view'));
 });
 const link = document.querySelector('[data-sub="' + sub + '"]');
 if (link && link.dataset.title && titleEl) titleEl.textContent = link.dataset.title;
 if (link && link.dataset.subtitle && subEl) subEl.textContent = link.dataset.subtitle;
 if (history.replaceState) history.replaceState(null, '', location.pathname + '#sub=' + sub);
 animateBars();
 renderVisibleCharts();
 }

 links.forEach(l => l.addEventListener('click', () => show(l.dataset.sub)));

 const initial = location.hash.replace('#sub=', '');
 const hasLink = links.length && [...links].some(l => l.dataset.sub === initial);
 show(initial && hasLink ? initial : (links.length ? links[0].dataset.sub : ''));

/* ---------- Demo action buttons ---------- */
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
  const field = input.closest('.field') || input.parentElement;
  const n = field && field.querySelector(':scope > .field-error');
  if (n) n.remove();
  }
  window.isValidGmail = isValidGmail;
  document.querySelectorAll('input[type="email"]').forEach(inp => {
  inp.addEventListener('input', () => clearFieldError(inp));
  });

  document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  if (btn.dataset.action === 'invite' || btn.dataset.action === 'save') {
  const scope = btn.closest('.dash-section') || document;
  const emailInput = scope.querySelector('input[type="email"]');
  if (emailInput) {
  if (!emailInput.value.trim()) {
  showFieldError(emailInput, 'Please enter an email address.');
  return;
  }
  if (!isValidGmail(emailInput.value)) {
  showFieldError(emailInput, 'Please enter a valid Gmail address ending with "@gmail.com".');
  return;
  }
  }
  }
  const actions = {
  'invest': 'Investment request submitted for review.',
  'export': 'Report exported to PDF successfully.',
  'download': 'Document download started.',
  'approve': 'Request approved.',
  'reject': 'Request declined.',
  'invite': 'Invitation sent to the user.',
  'save': 'Changes saved successfully.'
  };
  toast(actions[btn.dataset.action] || 'Action completed.');
  });

 /* ---------- Donut chart ---------- */
 function drawDonut(canvas) {
 const w = canvas.clientWidth, h = canvas.clientHeight;
 if (w <= 0 || h <= 0) return;
 const ctx = canvas.getContext('2d');
 const dpr = devicePixelRatio || 1;
 canvas.width = w * dpr; canvas.height = h * dpr;
 ctx.scale(dpr, dpr);
 const vals = canvas.dataset.donut.split(',').map(Number);
 const colors = canvas.dataset.colors ? canvas.dataset.colors.split(',') : ['#c9a96a', '#1a3a63', '#2fbf71', '#e4575d'];
 const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 10;
 const total = vals.reduce((a, b) => a + b, 0) || 1;
 let startAngle = -Math.PI / 2;
 vals.forEach((v, i) => {
 const frac = v / total;
 const end = startAngle + frac * Math.PI * 2;
 ctx.beginPath();
 ctx.moveTo(cx, cy);
 ctx.arc(cx, cy, r, startAngle, end);
 ctx.closePath();
 ctx.fillStyle = colors[i % colors.length];
 ctx.fill();
 startAngle = end;
 });
 ctx.beginPath();
 ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
 ctx.fillStyle = '#fff';
 ctx.fill();
 }

 /* ---------- Line chart ---------- */
 function drawLine(canvas) {
 const w = canvas.clientWidth, h = canvas.clientHeight;
 if (w <= 0 || h <= 0) return;
 const points = (canvas.dataset.line || '').split(',').map(Number);
 if (points.length < 2) return;
 const ctx = canvas.getContext('2d');
 const dpr = devicePixelRatio || 1;
 canvas.width = w * dpr; canvas.height = h * dpr;
 ctx.scale(dpr, dpr);
 const pad = 14;
 const max = Math.max(...points) * 1.15;
 const min = Math.min(...points) * 0.85;
 const stepX = (w - pad * 2) / (points.length - 1) || 1;
 const Y = v => h - pad - ((v - min) / (max - min)) * (h - pad * 2);

 const grad = ctx.createLinearGradient(0, 0, 0, h);
 grad.addColorStop(0, 'rgba(201,169,106,.35)');
 grad.addColorStop(1, 'rgba(201,169,106,0)');

 ctx.beginPath();
 ctx.moveTo(pad, Y(points[0]));
 points.forEach((v, i) => ctx.lineTo(pad + i * stepX, Y(v)));
 ctx.lineTo(w - pad, h - pad);
 ctx.lineTo(pad, h - pad);
 ctx.closePath();
 ctx.fillStyle = grad;
 ctx.fill();

 ctx.beginPath();
 ctx.moveTo(pad, Y(points[0]));
 points.forEach((v, i) => ctx.lineTo(pad + i * stepX, Y(v)));
 ctx.strokeStyle = '#c9a96a';
 ctx.lineWidth = 2.5;
 ctx.lineJoin = 'round';
 ctx.stroke();

 points.forEach((v, i) => {
 ctx.beginPath();
 ctx.arc(pad + i * stepX, Y(v), 4, 0, Math.PI * 2);
 ctx.fillStyle = '#fff';
 ctx.fill();
 ctx.strokeStyle = '#a98846';
 ctx.lineWidth = 2;
 ctx.stroke();
 });
 }

 function renderVisibleCharts() {
 document.querySelectorAll('[data-page]:not([style*="display: none"]) [data-donut]').forEach(drawDonut);
 document.querySelectorAll('[data-page]:not([style*="display: none"]) [data-line]').forEach(drawLine);
 }

 function toast(msg) {
 let t = document.querySelector('.toast');
 if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
 t.textContent = ' ' + msg;
 requestAnimationFrame(() => t.classList.add('show'));
 clearTimeout(t._t);
 t._t = setTimeout(() => t.classList.remove('show'), 3800);
 }

/* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  window.addEventListener('resize', () => renderVisibleCharts());

/* ---------- Dashboard forms: validate then redirect to 404 ---------- */
  document.querySelectorAll('form[data-dash-form]').forEach(form => {
  form.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll('[required]').forEach(inp => {
  const v = inp.value.trim();
  if (!v) { showFieldError(inp, 'Please fill in this field.'); ok = false; return; }
  if (inp.type === 'email' && !isValidGmail(v)) { showFieldError(inp, 'Please enter a valid Gmail address ending with "@gmail.com".'); ok = false; }
  });
  if (!ok) return;
  location.href = '404.html';
  });
  form.querySelectorAll('input, textarea').forEach(inp => {
  inp.addEventListener('input', () => clearFieldError(inp));
  });
  });

/* ---------- Search box: Enter clears bar then redirects to 404 ---------- */
   document.querySelectorAll('.search-box input').forEach(inp => {
   inp.addEventListener('keydown', e => {
   if (e.key === 'Enter') {
   e.preventDefault();
   inp.value = '';
   location.href = '404.html';
   }
   });
   });

/* ---------- User chip / profile bar redirects to 404 ---------- */
   document.querySelectorAll('.user-chip').forEach(chip => {
   chip.addEventListener('click', () => { location.href = '404.html'; });
   chip.style.cursor = 'pointer';
   chip.setAttribute('tabindex', '0');
   chip.addEventListener('keydown', e => {
   if (e.key === 'Enter' || e.key === ' ') {
   e.preventDefault();
   location.href = '404.html';
   }
   });
   });

/* ---------- Redirect section CTA/links to 404 (dashboards) ---------- */
   const dashAllow = '#sidebar, .menu-btn, .dash-overlay, form[data-dash-form] button[type="submit"]';
  document.addEventListener('click', function (e) {
  const t = e.target;
  const el = t && typeof t.closest === 'function' ? t.closest('a[href], button, input[type="submit"]') : null;
  if (!el) return;
  if (el.closest(dashAllow)) return;
  e.preventDefault();
  e.stopPropagation();
  location.href = '404.html';
  }, true);
})();