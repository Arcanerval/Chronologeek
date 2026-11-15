/* « Dossiês » : la liste des Dossiers. */
import ES from '../es/dossiers.mjs';
import { memes } from './outils.mjs';

export default {
  ...memes(ES),
  "Chronologeek — Deep Dives (proto E)": "Chronologeek — Dossiês (proto E)",
  "works": "obras",
  "stations": "estações",
  "Star Wars Deep Dive": "Dossiê Star Wars",
  "Deep Dive selection": "Seleção de Dossiês",
  "The guides that go beyond the timeline: reading orders, analyses and thematic paths, universe by universe.": "Os guias que vão além da cronologia: ordens de leitura, análises e percursos temáticos, universo por universo.",
  "Available": "Disponível",
  "Novels · Young-reader books · Comics — the complete canon reading order, placed among the movies and shows.": "Romances · Livros juvenis · Quadrinhos: a ordem de leitura canônica completa, situada entre os filmes e as séries.",
  "Soon": "Em breve",
  "What would you like to see here? More is on the way.": "O que você gostaria de ver aqui? Tem mais a caminho.",
  "Line under construction": "Linha em obras",
  "In progress": "Em preparação",
  "Train composition": "Composição do trem",
  "In the Star Wars Deep Dive": "No Dossiê Star Wars",
  "I'm assuming that if you're here, you've already watched the animated and live-action media.": "Imagino que, se você está aqui, já assistiu às obras animadas e live-action.",
  "Audio dramas": "Audiodramas",
  "On-screen markers": "Referências na tela",
  "{n} Deep Dive open · {n} on-screen markers": "{n} Dossiê aberto · {n} referências na tela",
};

export const RETOUCHES = [
  ["var EN=document.documentElement.lang==='en';", "var EN=true;"],
  ["\"High Republic\",", "\"Alta República\","],
  ["\"Republic\",", "\"República\","],
  ["\"Clone Wars\",", "\"Guerras Clônicas\","],
  ["\"Empire\",", "\"Império\","],
  ["\"Rebellion\",", "\"Rebelião\","],
  ["\"New Republic\",", "\"Nova República\","],
  ["\"First Order\",", "\"Primeira Ordem\","],
  ["{oe:function(n){return n+(n>1?' works':' work');},dep:'Departure',end:'Terminus',fin:'End of the line',",
   "{oe:function(n){return n+(n>1?' obras':' obra');},dep:'Partida',end:'Terminal',fin:'Fim da linha',"],
  ["cnt:'works',st:'Station',first:'First departure',next:'Next departure',wo:'works',lb:'Station ',start:'Departure: ',now:'Your train: '}",
   "cnt:'obras',st:'Estação',first:'Primeira partida',next:'Próxima partida',wo:'obras',lb:'Estação ',start:'Partida: ',now:'Seu trem: '}"],
];
