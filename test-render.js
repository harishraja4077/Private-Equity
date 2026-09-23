const { chromium } = require('playwright-core');
const path = require('path');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const files = ['index.html','about.html','services.html','blog.html','contact.html','signin.html','signup.html','404.html','admin-dashboard.html','user-dashboard.html'];
const widths = [1440, 1024, 992, 768, 576, 480, 400, 360, 320];

const settle = `(() => {
 const s = document.createElement('style');
 s.textContent = '*{transition:none!important;animation:none!important}';
 document.head.appendChild(s);
 document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('in-view'));
 void document.body.offsetWidth;
})();`;

const measure = `(() => {
 const de = document.documentElement;
 const raw = [];
 document.querySelectorAll('body *').forEach(n => {
 const r = n.getBoundingClientRect();
 if (r.width > 0 && r.right > de.clientWidth + 1) {
 let clipped = false, p = n.parentElement;
 while (p && !clipped) { if (/(hidden|auto|clip|scroll|overlay)/.test(getComputedStyle(p).overflowX)) clipped = true; p = p.parentElement; }
 if (!clipped) raw.push({ t: n.tagName, c: String(n.className).slice(0,26), o: Math.round(r.right - de.clientWidth) });
 }
 });
 raw.sort((a, b) => b.o - a.o);
 return { scrollW: de.scrollWidth - de.clientWidth, raw: raw.slice(0, 8) };
})()`;

(async () => {
 const browser = await chromium.launch({ executablePath: CHROME, args: ['--headless=new','--no-sandbox'] });
 const problems = [];
 for (const f of files) {
 for (const w of widths) {
 const page = await browser.newPage({ viewport: { width: w, height: 860 } });
 page.setDefaultTimeout(15000);
 let jsErr = '';
 page.on('pageerror', e => { jsErr = e.message; });
 try {
 await page.goto('file://' + path.resolve(f).replace(/\\/g,'/'), { waitUntil: 'domcontentloaded' });
 await page.evaluate(settle);
 const check = await page.evaluate(measure);
 if (check.scrollW > 1) problems.push(`${f} @${w}px docScrollW +${check.scrollW}px ${check.raw.length ? 'RAW=' + check.raw.map(x => x.t + '.' + x.c + '(' + x.o + 'px)').join(',') : ''}`);
 if (jsErr) problems.push(`${f} @${w}px JSError: ${jsErr}`);
 } catch (e) { problems.push(`${f} @${w}px load: ${e.message.split('\n')[0]}`); }
 await page.close().catch(() => {});
 }
 if (f.includes('dashboard')) {
 const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
 page.setDefaultTimeout(10000);
 await page.goto('file://' + path.resolve(f).replace(/\\/g,'/'), { waitUntil: 'domcontentloaded' });
 await page.evaluate(settle);
 const subs = f.includes('admin') ? ['overview','portfolio','analytics','reports','users','settings'] : ['overview','investments','analytics','documents','messages','profile'];
 let fail = '';
 for (const sub of subs) {
 try {
 await page.click(`[data-sub="${sub}"]`, { timeout: 4000 });
 await page.waitForTimeout(80);
 const n = await page.evaluate(() => [...document.querySelectorAll('[data-page]')].filter(p => p.style.display !== 'none').length);
 if (n !== 1) problems.push(`${f} sub ${sub}: ${n} pages visible`);
 } catch (e) { fail = e.message.split('\n')[0]; break; }
 }
 if (fail) problems.push(`${f} CLICK FAIL: ${fail}`);
 const chartOk = await page.evaluate(() => {
 const vis = document.getElementById('pg-analytics');
 if (!vis || vis.style.display === 'none') return true;
 const c = vis.querySelectorAll('canvas');
 return [...c].every(x => x.width > 0);
 });
 if (!chartOk) problems.push(`${f} charts zero-size on visible page`);
 await page.setViewportSize({ width: 390, height: 844 });
 await page.click('.menu-btn', { timeout: 4000 }).catch(() => problems.push(`${f} no .menu-btn`));
 const open = await page.evaluate(() => document.querySelector('.sidebar').classList.contains('open'));
 if (!open) problems.push(`${f} mobile menu did not open`);
 await page.close().catch(() => {});
 }
 }
 await browser.close();
 if (problems.length) { console.log('=== ISSUES ==='); problems.forEach(p => console.log(p)); }
 else console.log('ALL CLEAN - 9 widths x 10 pages + dashboard subs, no overflow, no JS errors');
})();