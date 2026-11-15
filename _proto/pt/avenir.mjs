/* « Em breve » : la page du radar. Le bloc `i18n-off` d'origine décide de
   la langue par `FR = lang !== 'en'` ; sur la page portugaise, on prend
   la branche anglaise (sortie américaine, titre original) et on en
   traduit les mois, les jours et les libellés. */
import ES from '../es/avenir.mjs';
import { memes } from './outils.mjs';

export default {
  ...memes(ES),
  "Chronologeek — Upcoming (proto E)": "Chronologeek — Em breve (proto E)",
  "Updated every day": "Atualizado todos os dias",
  "Every upcoming Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, Assassin’s Creed, DC Animation, Jurassic World, The Witcher, Resident Evil, Blade Runner and Monsterverse release — updated every single day.":
    "Todos os próximos lançamentos de Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, Assassin’s Creed, DC Animation, Jurassic World, The Witcher, Resident Evil, Blade Runner e Monsterverse, atualizados todos os dias.",
  "upcoming releases": "próximos lançamentos",
  "universes departing": "universos com partidas",
  "next departure": "próxima partida",
  "months ahead": "meses à frente",
  "Map of the timeline": "Mapa da cronologia",
  "Next departure ·": "Próxima partida ·",
  "Filters, search and sources": "Filtros, busca e fontes",
  "Search a release": "Buscar um lançamento",
  "Format": "Formato",
  "Nothing matches. Try another spelling, or turn the filters you switched off back on.": "Nada corresponde. Tente outra grafia ou reative os filtros que você desligou.",
  "next ·": "próxima ·",
  "Next station:": "Próxima estação:",
  "until release": "até o lançamento",
  "Updated automatically every day": "Atualizado automaticamente todos os dias",
  "Terminus for now": "Terminal por enquanto",
  "New releases are added every night": "Novos lançamentos são adicionados toda noite",
  "not the": "não o",
  "at the root: serve the repository (port 8947),": "na raiz: sirva o repositório (porta 8947),",
  "The radar could not be loaded.": "Não foi possível carregar o radar.",
  "TOMORROW": "AMANHÃ",
  "TODAY": "HOJE",
  "Other": "Outro",
};

export const RETOUCHES = [
  ["(n>1?'s':'')+' exibidas';", "(n>1?'s':'')+' exibido'+(n>1?'s':'');"],
  [",'release')", ",'lançamento')"],
  ["(total>1?'releases':'release')", "(total>1?'lançamentos':'lançamento')"],
  ["textContent='release'+(n>1?'s':'')+' tracked';", "textContent='lançamento'+(n>1?'s':'')+' acompanhado'+(n>1?'s':'');"],
  ["var FR = document.documentElement.lang !== 'en';", "var FR = false;"],
  ["['January','February','March','April','May','June',", "['janeiro','fevereiro','março','abril','maio','junho',"],
  ["'July','August','September','October','November','December']", "'julho','agosto','setembro','outubro','novembro','dezembro']"],
  ["['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']", "['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']"],
  ["['Sun','Mon','Tue','Wed','Thu','Fri','Sat']", "['dom','seg','ter','qua','qui','sex','sáb']"],
  ["['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']", "['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado']"],
  ["JOURS_L[d.getDay()]+', '+MOIS[d.getMonth()]+' '+d.getDate();", "JOURS_L[d.getDay()]+', '+d.getDate()+' de '+MOIS[d.getMonth()];"],
  ["return MOIS[parseInt(m[2],10)-1]+' '+parseInt(m[3],10)+', '+m[1];", "return parseInt(m[3],10)+' de '+MOIS[parseInt(m[2],10)-1]+' de '+m[1];"],
  ["{premiere:'Premiere',finale:'Finale',saison:'All season'}", "{premiere:'Estreia',finale:'Final',saison:'Temporada completa'}"],
  ["lang:FR?'fr-FR':'en-US'}", "lang:FR?'fr-FR':'pt-BR'}"],
  ["{annee:'Year',genre:'Genre',note:'Rating',periode:'Period',", "{annee:'Ano',genre:'Gênero',note:'Nota',periode:'Período',"],
  ["serie:'The series',trailer:'YouTube trailer'}", "serie:'A série',trailer:'Trailer no YouTube'}"],
  ["else { syn=e.syn||''; }", "else { syn=e.syn||''; if(syn) marque='<span class=\"en\">EN</span>'; }"],
];
