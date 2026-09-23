const { chromium } = require('playwright-core');
const path = require('path');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
(async () => {
 const browser = await chromium.launch({ executablePath: CHROME, args: ['--headless=new','--no-sandbox'] });
 const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
 page.on('pageerror', e => console.log('PAGEERROR', e.message));
 page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
 await page.goto('file://' + path.resolve('admin-dashboard.html').replace(/\\/g,'/'), { waitUntil: 'load' });
 await page.waitForTimeout(800);
 const initial = await page.evaluate(() => ({
 links: [...document.querySelectorAll('[data-sub]')].map(l => l.dataset.sub),
 visible: [...document.querySelectorAll('[data-page]')].filter(p => p.style.display !== 'none').map(p => p.id)
 }));
 console.log('INITIAL:', JSON.stringify(initial));
 await page.click('[data-sub="overview"]');
 await page.waitForTimeout(200);
 const after = await page.evaluate(() => ({
 links: [...document.querySelectorAll('[data-sub]')].map(l => l.dataset.sub),
 visible: [...document.querySelectorAll('[data-page]')].filter(p => p.style.display !== 'none').map(p => p.id)
 }));
 console.log('AFTER OVERVIEW:', JSON.stringify(after));
 await browser.close();
})();