import fs from 'node:fs';
const R = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const lire = p => fs.readFileSync(R + p, 'utf8');

/* Charge les objets d'un fichier proto ou d'une page de prod.
   On evalue le JS plutot que de le lire au regex : les `notes` sont des
   template literals pleins de HTML, un regex y laisserait des plumes. */
function charge(src, prod) {
  let js = src;
  if (prod) {
    // dans une page, les donnees vivent dans des <script> ; on garde ceux
    // qui portent window.CG, DATA_*, RT ou CG_DATA
    js = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
      .map(m => m[1])
      .filter(s => /window\.CG\s*=|window\.CG_DATA\s*=|const\s+DATA/.test(s))
      .join('\n');
  }
  const box = { window: {} };
  const fn = new Function('window', js + '\n;return {window, DATA: typeof DATA!=="undefined"?DATA:undefined,'
    + ' DATA_SW: typeof DATA_SW!=="undefined"?DATA_SW:undefined,'
    + ' DATA_MCU: typeof DATA_MCU!=="undefined"?DATA_MCU:undefined,'
    + ' DATA_DC: typeof DATA_DC!=="undefined"?DATA_DC:undefined,'
    + ' RT: typeof RT!=="undefined"?RT:undefined};');
  const r = fn(box.window);
  return { ...r, CG: r.window.CG, CGD: r.window.CGD, CGDT: r.window.CGDT, CG_DATA: r.window.CG_DATA };
}

const entrees = d => d ? d.eras.flatMap(e => e.entries || []) : [];
const cles = objs => [...new Set(objs.flatMap(o => Object.keys(o)))].sort();

for (const [nom, proto, pageEN, pageFR] of [
  ['SW',  '_proto/data.js',     'starwars.html', 'fr/starwars.html'],
  ['MCU', '_proto/data-mcu.js', 'marvel.html',   'fr/marvel.html'],
  ['DC',  '_proto/data-dc.js',  'dc.html',       'fr/dc.html'],
]) {
  const P = charge(lire(proto), false);
  const E = charge(lire(pageEN), true);
  const F = charge(lire(pageFR), true);
  const dP = P.DATA_SW || P.DATA_MCU || P.DATA_DC;
  const dE = E.DATA_SW || E.DATA_MCU || E.DATA_DC || E.DATA;
  const dF = F.DATA_SW || F.DATA_MCU || F.DATA_DC || F.DATA;
  const eP = entrees(dP), eE = entrees(dE);
  console.log(`\n===== ${nom}`);
  console.log(`  racine   proto=[${Object.keys(dP).join(',')}]`);
  console.log(`           prodEN=[${Object.keys(dE).join(',')}]`);
  console.log(`  eres     proto=${dP.eras.length}  prodEN=${dE.eras.length}  prodFR=${dF.eras.length}`);
  console.log(`  entrees  proto=${eP.length}  prodEN=${eE.length}`);
  console.log(`  champs   proto=[${cles(eP).join(',')}]`);
  console.log(`           prodEN=[${cles(eE).join(',')}]`);
  const idP = eP.map(e => e.id), idE = new Set(eE.map(e => e.id));
  const manque = idP.filter(i => !idE.has(i));
  console.log(`  sans source EN : ${manque.length ? manque.join(', ') : 'aucune'}`);
  // les eres portent-elles les memes titres/ordre ?
  console.log(`  titres d'eres proto : ${dP.eras.map(e => e.title).join(' | ').slice(0,120)}`);
  console.log(`  titres d'eres EN    : ${dE.eras.map(e => e.title).join(' | ').slice(0,120)}`);
}
