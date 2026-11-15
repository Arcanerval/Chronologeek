/* L'accueil en portugais : ses textes sont tous au lexique commun. Restent
   les bascules du script de la page, `EN ? anglais : français`, qui sur une
   page portugaise prendraient le français. */
export default {};
export const RETOUCHES = [
  /* les noms des univers : ceux de l'anglais */
  ['if(EN&&x.nameEn) x.name=x.nameEn;', 'if(x.nameEn) x.name=x.nameEn;'],
  /* les stations du plan : decomptes.mjs écrit le portugais dans les deux colonnes */
  ['return [EN?e[1]:e[0],e[2],e[3]];', 'return [e[1],e[2],e[3]];'],
  ["var BOUTS=EN?['Departure','Terminus','Terminus reached','Network','independent lines']:['Départ','Terminus','Terminus atteint','Réseau','lignes indépendantes'];",
   "var BOUTS=['Partida','Terminal','Terminal alcançado','Rede','linhas independentes'];"],
];
