const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let issues = 0;
for (const f of files) {
 const s = fs.readFileSync(f, 'utf8');
 // duplicate ids
 const ids = [...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
 const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
 if (dupes.length) { issues++; console.log(f, 'DUP IDS:', [...new Set(dupes)]); }
 // internal anchors exist
 const anchors = [...s.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
 const missingAnchors = anchors.filter(a => !s.includes('id="' + a + '"'));
 if (missingAnchors.length) console.log(f, 'MISSING ANCHORS:', missingAnchors);
 // css/js refs
 const assets = [...s.matchAll(/(?:href|src)="(css\/[^"]+|js\/[^"]+)"/g)].map(m => m[1]);
 assets.forEach(a => { if (!fs.existsSync(a)) { issues++; console.log(f, 'MISSING FILE:', a); } });
}
console.log(issues ? 'ISSUES FOUND' : 'NO CRITICAL ISSUES');
// image sizes final check
const sizes = fs.readdirSync('Assets').filter(x => x.endsWith('.webp'))
 .filter(x => fs.statSync('Assets/' + x).size > 98 * 1024);
console.log(sizes.length ? 'OVER 98KB: ' + sizes.join(',') : 'ALL IMAGES UNDER 98KB (' + fs.readdirSync('Assets').filter(x=>x.endsWith('.webp')).length + ' total)');