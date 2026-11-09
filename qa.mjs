import fs from 'node:fs';
import path from 'node:path';
let fail = 0;
const ok = (m) => console.log('  PASS ' + m);
const bad = (m) => { console.log('  FAIL ' + m); fail++; };
const dist = path.resolve('dist');
if (!fs.existsSync(dist)) { console.log('dist missing'); process.exit(1); }

for (const f of ['index.html','washroom-near-me/index.html','about/index.html','privacy/index.html',
  'methodology/index.html','sitemap.xml','robots.txt','_redirects']) {
  fs.existsSync(path.join(dist,f)) ? ok('exists '+f) : bad('missing '+f);
}

const cities = JSON.parse(fs.readFileSync('data/cities/delhi.json','utf8')) ? null : null;
const CITY_SLUGS = ['ahmedabad','bengaluru','chennai','delhi','hyderabad','jaipur','kolkata','lucknow','mumbai','pune'];
let total = 0;
for (const s of CITY_SLUGS) {
  const p = path.join('data/cities', s + '.json');
  if (!fs.existsSync(p)) { bad('data missing ' + s); continue; }
  const rows = JSON.parse(fs.readFileSync(p,'utf8'));
  total += rows.length;
  rows.every(r => r.source && r.source_url && r.verified_at) ? ok('sourced: '+s+' ('+rows.length+')') : bad('unsourced row in '+s);
  fs.existsSync(path.join(dist,s,'index.html')) ? ok('city page '+s) : bad('city page missing '+s);
}
ok('total facilities '+total);

const home = fs.readFileSync(path.join(dist,'index.html'),'utf8');
home.includes('washroom near me') ? ok('H1 present') : bad('H1 missing');
home.includes('Baby changing') ? ok('amenity spine present') : bad('amenity spine missing');

const sm = fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
const n = (sm.match(/<loc>/g)||[]).length;
n >= 15 ? ok('sitemap urls '+n) : bad('sitemap too small '+n);

const robots = fs.readFileSync(path.join(dist,'robots.txt'),'utf8');
!robots.split('\n').some(l => /^\s*crawl-delay\s*:/i.test(l)) ? ok('no crawl-delay') : bad('crawl-delay found');

const red = fs.readFileSync(path.join(dist,'_redirects'),'utf8');
(red.match(/301/g)||[]).length >= 11 ? ok('11 legacy 301s') : bad('redirects missing');

// anti-doorway guard
const cityHtml = fs.readFileSync(path.join(dist,'delhi','index.html'),'utf8');
cityHtml.includes('facility-map') ? ok('leaflet map on city page') : bad('map missing');
const cssFiles = fs.readdirSync(path.join(dist,'_astro')).filter(f=>f.endsWith('.css'));
const css = cssFiles.map(f=>fs.readFileSync(path.join(dist,'_astro',f),'utf8')).join('');
css.includes('leaflet-container') ? ok('leaflet css bundled') : bad('leaflet css missing');
(css.includes('font-weight:500')||css.includes('font-weight: 500')) ? ok('body weight 500') : bad('body weight missing');

console.log(fail===0 ? '\nQA PASSED' : `\nQA FAILED (${fail})`);
process.exit(fail===0?0:1);
