const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
 const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--headless=new','--no-sandbox'] });
 const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
 p.on('pageerror', e => console.log('PAGEERROR:', e.message));
 p.on('console', m => console.log('CONSOLE:', m.type(), m.text().slice(0, 200)));
 await p.goto('file://' + path.resolve('signin.html').replace(/\\/g,'/'), { waitUntil: 'load' });
 await p.waitForTimeout(500);
 await p.fill('#si-email', 'a@b.com');
 await p.fill('#si-pass', 'password123');
 await p.click('[data-role="user"]');
 const snap = await p.evaluate(() => {
 const form = document.querySelector('.auth form[data-demo]');
 return {
 hasAuthAttr: form.hasAttribute('data-auth-form'),
 invalid: [...form.querySelectorAll('[required]')].map(i => i.id + ':' + i.checkValidity()),
 handlers: 'na'
 };
 });
 console.log('SNAP', JSON.stringify(snap));
 await p.click('.auth form button[type="submit"]');
 await p.waitForTimeout(1500);
 console.log('URL AFTER SUBMIT:', p.url().split('/').pop());
 await b.close();
})();