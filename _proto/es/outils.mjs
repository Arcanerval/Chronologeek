/* ═══ OUTILS COMMUNS DE LA CHAÎNE ESPAGNOLE ═══════════════════════════
   Le scanner de chaînes JS et l'évaluation des fichiers de données, repris
   de `traduire-startrek.mjs` à l'identique : ce sont eux qui ont coûté cher
   à écrire juste (expressions régulières, apostrophes des commentaires,
   bords d'espace). On ne les réinvente pas, on les partage.
   ══════════════════════════════════════════════════════════════════════ */

export const net = s => String(s).replace(/\s+/g, ' ').trim();

/* Évaluer plutôt que lire au regex : même raison que dans `traduire.mjs`. */
export function evalue(js) {
  const box = { window: {} };
  const noms = [...new Set([...js.matchAll(/(?:^|[\n;{])\s*(?:const|var|let)\s+([A-Za-z_$][\w$]*)\s*=/g)]
    .map(m => m[1]))];
  const code = js.replace(/\bconst /g, 'var ')
    + noms.map(n => `\n;try{window[${JSON.stringify(n)}]=${n}}catch(e){}`).join('');
  new Function('window', code)(box.window);
  return box.window;
}

/* Un `/` ouvre une expression régulière ou divise, selon ce qui précède. */
const AVANT_REGEX = /[(,=:[!&|?{};+\-*%~^]\s*$|\breturn\s*$|\btypeof\s*$|^\s*$/;

/* Les chaînes littérales d'un JS, avec leur position, en suivant l'état
   réel du code : chaîne, gabarit, commentaire, expression régulière. */
export function chainesDu(js) {
  const out = [];
  let i = 0, etat = 'code', quote = '', debut = 0;
  while (i < js.length) {
    const c = js[i], d = js[i + 1];
    if (etat === 'code') {
      if (c === '/' && d === '/') { etat = 'ligne'; i += 2; continue; }
      if (c === '/' && d === '*') { etat = 'bloc'; i += 2; continue; }
      if (c === '/' && AVANT_REGEX.test(js.slice(Math.max(0, i - 24), i))) {
        etat = 'regex'; i++; continue;
      }
      if (c === '"' || c === "'" || c === '`') { etat = 'chaine'; quote = c; debut = i; i++; continue; }
      i++; continue;
    }
    if (etat === 'regex') {
      if (c === '\\') { i += 2; continue; }
      if (c === '[') { etat = 'classe'; i++; continue; }
      if (c === '/' || c === '\n') { etat = 'code'; i++; continue; }
      i++; continue;
    }
    if (etat === 'classe') {
      if (c === '\\') { i += 2; continue; }
      if (c === ']') { etat = 'regex'; i++; continue; }
      i++; continue;
    }
    if (etat === 'ligne') { if (c === '\n') etat = 'code'; i++; continue; }
    if (etat === 'bloc') { if (c === '*' && d === '/') { etat = 'code'; i += 2; continue; } i++; continue; }
    if (etat === 'chaine') {
      if (c === '\\') { i += 2; continue; }
      if (c === quote) {
        out.push({ debut, fin: i + 1, quote, val: js.slice(debut + 1, i) });
        etat = 'code'; i++; continue;
      }
      i++; continue;
    }
  }
  return out;
}

/* Le même code, à la même longueur, chaînes, commentaires et expressions
   régulières vidés : ce qui reste est la structure, qu'on peut parcourir
   sans se faire piéger par une parenthèse dans une chaîne. Les chaînes
   gardent leurs guillemets et prennent des `_`. */
export function masque(js) {
  const o = js.split('');
  let i = 0, etat = 'code', quote = '';
  const vide = (a, b, c) => { for (let k = a; k < b; k++) if (o[k] !== '\n') o[k] = c; };
  while (i < js.length) {
    const c = js[i], d = js[i + 1];
    if (etat === 'code') {
      if (c === '/' && d === '/') { const f = js.indexOf('\n', i); const e = f < 0 ? js.length : f; vide(i, e, ' '); i = e; continue; }
      if (c === '/' && d === '*') { const f = js.indexOf('*/', i + 2); const e = f < 0 ? js.length : f + 2; vide(i, e, ' '); i = e; continue; }
      if (c === '/' && AVANT_REGEX.test(js.slice(Math.max(0, i - 24), i))) {
        let k = i + 1, cl = false;
        while (k < js.length && js[k] !== '\n') {
          if (js[k] === '\\') { k += 2; continue; }
          if (js[k] === '[') cl = true; else if (js[k] === ']') cl = false;
          else if (js[k] === '/' && !cl) break;
          k++;
        }
        vide(i, k + 1, '_'); i = k + 1; continue;
      }
      if (c === '"' || c === "'" || c === '`') { etat = 'chaine'; quote = c; i++; continue; }
      i++; continue;
    }
    if (etat === 'chaine') {
      if (c === '\\') { o[i] = '_'; if (js[i + 1] !== '\n') o[i + 1] = '_'; i += 2; continue; }
      if (c === quote) { etat = 'code'; i++; continue; }
      if (c !== '\n') o[i] = '_';
      i++; continue;
    }
  }
  return o.join('');
}

/* La fin d'un littéral objet ou tableau qui commence à `i` (sur `{` ou `[`),
   en sautant les chaînes. Sert à remplacer un bloc de données en place. */
export function finBloc(src, i) {
  let prof = 0, q = '';
  for (; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = ''; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{' || c === '[') prof++;
    else if (c === '}' || c === ']') { prof--; if (prof === 0) return i + 1; }
  }
  throw new Error('bloc non fermé');
}

/* Une chaîne passée à une API du DOM est un identifiant, jamais un libellé. */
export const APPELS_DOM = new RegExp(
  '(?:getElementById|querySelectorAll|querySelector|getElementsByClassName'
  + '|closest|matches|createElement|setAttribute|getAttribute|removeAttribute'
  + '|classList\\.(?:add|remove|toggle|contains)|dataset\\.\\w+|addEventListener'
  + '|removeEventListener|localStorage\\.(?:getItem|setItem|removeItem)'
  + '|sessionStorage\\.(?:getItem|setItem|removeItem)'
  + '|insertAdjacentHTML|setProperty|getPropertyValue)\\s*\\(\\s*$');

export function zonesProtegees(js) {
  const zones = [];
  for (const m of js.matchAll(/i18n-off([\s\S]*?)i18n-on/g)) zones.push([m.index, m.index + m[0].length]);
  return zones;
}
