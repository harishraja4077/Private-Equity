const { chromium } = require("playwright-core");
const path = require("path");
(async () => {
 const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--headless=new","--no-sandbox"] });
 const p = await b.newPage({ viewport: { width: 480, height: 900 } });
 await p.goto("file://" + path.resolve("index.html").replace(/\\/g,"/"), { waitUntil: "domcontentloaded" });
 const r = await p.evaluate(() => {
 const sec = document.getElementById("about");
 const m = sec.querySelector(".media"), c = sec.querySelector(".copy");
 return { media: m.getAttribute("data-reveal") + " | " + getComputedStyle(m).transform, copy: c.getAttribute("data-reveal") + " | " + getComputedStyle(c).transform };
 });
 console.log(JSON.stringify(r));
 await b.close();
})();
