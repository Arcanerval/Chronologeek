// confidentialite.mjs — la politique de confidentialité, `/fr/confidentialite` et `/privacy`.
//
// Posée le 14 novembre 2026, demandée par Niko : Google l'exige pour passer en
// production l'identifiant OAuth de la synchro Drive, et le site n'en avait aucune.
// Le lien vit dans le pied de page seulement (`publier.mjs`, étape 7 bis), jamais au
// menu du haut — choix de Niko.
//
// Le texte dit ce que le site fait VRAIMENT : il a été écrit après un inventaire des
// adresses que le code appelle (app.js, pages, données). **Un service ajouté au site
// (une API, un script, une police) se déclare ici**, sans quoi la page ment sans que
// rien ne le signale. Même habillage que les fiches d'œuvres : menu, pied et CSS de la
// page Star Wars publiée (`habillage()` d'`oeuvres.mjs`, `/works/fiche.css`).

import { TETE_REGLAGES } from './reglages.mjs';

const MAJ = { fr: '14 novembre 2026', en: 'November 14, 2026', es: '14 de noviembre de 2026', pt: '15 de novembro de 2026' };

const TEXTE = {
  fr: {
    titre: 'Confidentialité', h1: 'Politique de confidentialité', tag: 'Vos données',
    desc: 'Ce que Chronologeek garde, ce qu’il n’envoie pas, et les services que votre navigateur appelle en chemin.',
    maj: 'Mise à jour le ' + MAJ.fr,
    sections: [
      ['En bref', [
        'Chronologeek n’a <b>ni compte, ni serveur de données, ni cookie publicitaire</b>. Votre progression, vos ajouts et vos réglages restent dans votre navigateur, sur votre appareil. Nous ne les voyons pas et ne pouvons pas les voir.',
        'Le site est un projet de fan indépendant, édité par une seule personne, sans publicité ni revente de données.'
      ]],
      ['Ce qui reste sur votre appareil', [
        'Le site enregistre dans le stockage local de votre navigateur (<code>localStorage</code>) : les œuvres cochées et le jour où vous les avez cochées, les œuvres que vous avez ajoutées vous-même (image comprise), vos réglages, le parcours choisi sur chaque page, vos votes pour la prochaine ligne, et quelques préférences d’affichage. Un cache hors ligne (service worker) garde aussi une copie des pages.',
        'Rien de cela ne quitte votre appareil, sauf si vous le faites vous-même : un fichier d’export, un lien de transfert (votre progression voyage dans le lien, sans passer par un serveur), ou la synchro Google Drive décrite plus bas.',
        'Pour tout effacer : supprimez les données du site dans les réglages de votre navigateur. Les fichiers que vous importez (export Chronologeek, export Letterboxd) sont lus dans votre navigateur et ne sont envoyés nulle part.'
      ]],
      ['Mesure d’audience', [
        'Nous comptons les visites avec <a href="https://www.goatcounter.com/" rel="noopener">GoatCounter</a>, un outil libre qui <b>ne pose aucun cookie et ne conserve pas votre adresse IP</b>. Il relève la page vue, le site d’où vous venez, la taille de l’écran, le navigateur et le pays approximatif, sans pouvoir vous identifier ni vous suivre d’un site à l’autre.',
        'Un vote pour la prochaine ligne est compté de la même façon, comme un événement anonyme. Les totaux des votes sont publics.',
        'Un bloqueur de publicité qui coupe GoatCounter ne gêne rien sur le site, sauf le vote.'
      ]],
      ['Hébergement', [
        'Le site est hébergé par <a href="https://pages.github.com/" rel="noopener">GitHub Pages</a>. Comme tout hébergeur, GitHub reçoit votre adresse IP pour vous servir les pages et protéger son service ; voir la <a href="https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">déclaration de confidentialité de GitHub</a>. Les polices du site sont servies par le site lui-même.'
      ]],
      ['Les services que votre navigateur appelle', [
        'Pour afficher les fiches, votre navigateur interroge directement des services publics, qui reçoivent donc votre adresse IP et votre type de navigateur, comme pour n’importe quelle image chargée sur le web. Aucune donnée vous concernant ne leur est transmise par nous.',
        '<b>TMDB</b> (The Movie Database) : affiches, résumés, bandes-annonces et plateformes de streaming — ces dernières viennent de JustWatch, par TMDB. <b>RAWG</b> : fiches et plateformes des jeux vidéo. <b>Open Library</b> : fiches des livres. Les bandes-annonces sont des liens vers YouTube : rien n’est chargé chez YouTube tant que vous ne cliquez pas.',
        'Les liens « Où lire », « Où regarder », Ko-fi, l’abonnement à l’agenda et les sources citées mènent vers d’autres sites, qui ont leurs propres règles. Aucun lien affilié n’est utilisé pour l’instant ; s’il y en a un jour, la ligne concernée le dira.'
      ]],
      ['La synchro Google Drive', [
        'Si vous choisissez de synchroniser votre progression avec Google Drive, votre navigateur charge le script de connexion de Google et vous demande l’autorisation de Google. Le site ne demande que l’accès <b>aux fichiers qu’il crée lui-même</b> (<code>drive.file</code>) : il range votre progression dans un fichier <code>chronologeek.json</code> de votre Drive, et ne voit aucun autre de vos fichiers.',
        'Le jeton d’accès reste dans la page le temps de la synchro et n’est envoyé qu’à Google. Rien n’est copié sur un serveur de Chronologeek : il n’y en a pas. Vous pouvez retirer l’accès à tout moment depuis <a href="https://myaccount.google.com/permissions" rel="noopener">votre compte Google</a>, et supprimer le fichier de votre Drive.',
        'L’utilisation des informations reçues des API Google respecte les <a href="https://developers.google.com/terms/api-services-user-data-policy" rel="noopener">règles relatives aux données utilisateur des services d’API Google</a>, y compris les exigences d’utilisation limitée.'
      ]],
      ['Vos droits et le contact', [
        'Comme nous ne conservons aucune donnée vous concernant, il n’y a rien à consulter, rectifier ou supprimer chez nous : tout est sur votre appareil ou dans votre Drive, sous votre contrôle. Pour toute question, écrivez-nous par le lien <a href="#contact" data-contact>Contact</a> en bas de page. Vous pouvez aussi vous adresser à la <a href="https://www.cnil.fr/" rel="noopener">CNIL</a>.',
        'Cette page change quand le site change. La date de mise à jour est en haut.'
      ]]
    ]
  },
  en: {
    titre: 'Privacy', h1: 'Privacy policy', tag: 'Your data',
    desc: 'What Chronologeek keeps, what it never sends, and the services your browser calls along the way.',
    maj: 'Updated ' + MAJ.en,
    sections: [
      ['In short', [
        'Chronologeek has <b>no accounts, no data server and no advertising cookies</b>. Your progress, your own additions and your settings stay in your browser, on your device. We don’t see them and cannot see them.',
        'The site is an independent fan project, run by one person, with no ads and no data resale.'
      ]],
      ['What stays on your device', [
        'The site stores in your browser’s local storage (<code>localStorage</code>): the works you checked and the day you checked them, the works you added yourself (images included), your settings, the path chosen on each page, your votes for the next line, and a few display preferences. An offline cache (service worker) also keeps a copy of the pages.',
        'None of this leaves your device unless you do it yourself: an export file, a transfer link (your progress travels inside the link, with no server in between), or the Google Drive sync described below.',
        'To erase everything, clear the site’s data in your browser settings. Files you import (Chronologeek exports, Letterboxd exports) are read in your browser and sent nowhere.'
      ]],
      ['Audience measurement', [
        'We count visits with <a href="https://www.goatcounter.com/" rel="noopener">GoatCounter</a>, an open-source tool that <b>sets no cookies and does not keep your IP address</b>. It records the page viewed, the referring site, screen size, browser and approximate country, without being able to identify you or follow you from site to site.',
        'A vote for the next line is counted the same way, as an anonymous event. Vote totals are public.',
        'An ad blocker that blocks GoatCounter breaks nothing on the site, except voting.'
      ]],
      ['Hosting', [
        'The site is hosted by <a href="https://pages.github.com/" rel="noopener">GitHub Pages</a>. Like any host, GitHub receives your IP address to serve the pages and protect its service; see <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub’s privacy statement</a>. The site’s fonts are served by the site itself.'
      ]],
      ['Services your browser calls', [
        'To show details about each work, your browser queries public services directly, so they receive your IP address and browser type, as with any image loaded on the web. We send them no data about you.',
        '<b>TMDB</b> (The Movie Database): posters, synopses, trailers and streaming platforms — the latter come from JustWatch, through TMDB. <b>RAWG</b>: video game details and platforms. <b>Open Library</b>: book details. Trailers are links to YouTube: nothing loads from YouTube until you click.',
        'The “Where to read”, “Where to watch”, Ko-fi, calendar subscription and source links lead to other sites, which have their own rules. No affiliate links are used for now; if that changes, the line concerned will say so.'
      ]],
      ['Google Drive sync', [
        'If you choose to sync your progress with Google Drive, your browser loads Google’s sign-in script and asks for Google’s permission. The site only requests access to <b>the files it creates itself</b> (<code>drive.file</code>): it keeps your progress in a <code>chronologeek.json</code> file in your Drive, and sees none of your other files.',
        'The access token stays in the page for the duration of the sync and is only sent to Google. Nothing is copied to a Chronologeek server: there is none. You can remove access at any time from <a href="https://myaccount.google.com/permissions" rel="noopener">your Google account</a>, and delete the file from your Drive.',
        'Chronologeek’s use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" rel="noopener">Google API Services User Data Policy</a>, including the Limited Use requirements.'
      ]],
      ['Your rights and contact', [
        'Since we keep no data about you, there is nothing to access, correct or delete on our side: everything is on your device or in your Drive, under your control. For any question, write to us through the <a href="#contact" data-contact>Contact</a> link at the bottom of the page.',
        'This page changes when the site changes. The update date is at the top.'
      ]]
    ]
  },
  es: {
    titre: 'Privacidad', h1: 'Política de privacidad', tag: 'Tus datos',
    desc: 'Qué guarda Chronologeek, qué no envía nunca y los servicios a los que llama tu navegador por el camino.',
    maj: 'Actualizado el ' + MAJ.es,
    sections: [
      ['En resumen', [
        'Chronologeek <b>no tiene cuentas, ni servidor de datos, ni cookies publicitarias</b>. Tu progreso, tus propias obras añadidas y tus ajustes se quedan en tu navegador, en tu dispositivo. No los vemos ni podemos verlos.',
        'El sitio es un proyecto fan independiente, llevado por una sola persona, sin publicidad y sin reventa de datos.'
      ]],
      ['Lo que se queda en tu dispositivo', [
        'El sitio guarda en el almacenamiento local de tu navegador (<code>localStorage</code>): las obras que marcaste y el día en que las marcaste, las obras que añadiste tú (imágenes incluidas), tus ajustes, el recorrido elegido en cada página, tus votos para la próxima línea y algunas preferencias de visualización. Una caché sin conexión (service worker) guarda además una copia de las páginas.',
        'Nada de esto sale de tu dispositivo salvo que lo hagas tú: un archivo exportado, un enlace de transferencia (tu progreso viaja dentro del enlace, sin servidor de por medio) o la sincronización con Google Drive descrita más abajo.',
        'Para borrarlo todo, elimina los datos del sitio en los ajustes de tu navegador. Los archivos que importas (exportaciones de Chronologeek o de Letterboxd) se leen en tu navegador y no se envían a ninguna parte.'
      ]],
      ['Medición de audiencia', [
        'Contamos las visitas con <a href="https://www.goatcounter.com/" rel="noopener">GoatCounter</a>, una herramienta de código abierto que <b>no pone cookies ni guarda tu dirección IP</b>. Registra la página vista, el sitio de procedencia, el tamaño de pantalla, el navegador y el país aproximado, sin poder identificarte ni seguirte de un sitio a otro.',
        'Un voto para la próxima línea se cuenta igual, como un evento anónimo. Los totales de votos son públicos.',
        'Un bloqueador de anuncios que bloquee GoatCounter no rompe nada del sitio, salvo los votos.'
      ]],
      ['Alojamiento', [
        'El sitio está alojado en <a href="https://pages.github.com/" rel="noopener">GitHub Pages</a>. Como cualquier alojamiento, GitHub recibe tu dirección IP para servirte las páginas y proteger su servicio; consulta la <a href="https://docs.github.com/es/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">declaración de privacidad de GitHub</a>. Las fuentes del sitio las sirve el propio sitio.'
      ]],
      ['Servicios a los que llama tu navegador', [
        'Para mostrar los detalles de cada obra, tu navegador consulta directamente servicios públicos, que reciben así tu dirección IP y el tipo de navegador, como con cualquier imagen cargada en la web. No les enviamos ningún dato sobre ti.',
        '<b>TMDB</b> (The Movie Database): pósteres, sinopsis, tráileres y plataformas de streaming; estas últimas vienen de JustWatch, a través de TMDB. <b>RAWG</b>: datos y plataformas de los videojuegos. <b>Open Library</b>: datos de los libros. Los tráileres son enlaces a YouTube: no se carga nada de YouTube hasta que haces clic.',
        'Los enlaces «Dónde leer», «Dónde ver», Ko-fi, suscripción al calendario y fuentes llevan a otros sitios, que tienen sus propias normas. De momento no se usa ningún enlace de afiliado; si eso cambia, la línea correspondiente lo dirá.'
      ]],
      ['Sincronización con Google Drive', [
        'Si eliges sincronizar tu progreso con Google Drive, tu navegador carga el script de inicio de sesión de Google y pide el permiso de Google. El sitio solo pide acceso a <b>los archivos que crea él mismo</b> (<code>drive.file</code>): guarda tu progreso en un archivo <code>chronologeek.json</code> de tu Drive y no ve ninguno de tus otros archivos.',
        'El token de acceso se queda en la página mientras dura la sincronización y solo se envía a Google. No se copia nada en un servidor de Chronologeek: no hay ninguno. Puedes retirar el acceso cuando quieras desde <a href="https://myaccount.google.com/permissions" rel="noopener">tu cuenta de Google</a> y borrar el archivo de tu Drive.',
        'El uso que hace Chronologeek de la información recibida de las API de Google cumple la <a href="https://developers.google.com/terms/api-services-user-data-policy" rel="noopener">Política de datos de usuario de los servicios de API de Google</a>, incluidos los requisitos de uso limitado.'
      ]],
      ['Tus derechos y contacto', [
        'Como no guardamos ningún dato sobre ti, no hay nada que consultar, corregir o borrar por nuestra parte: todo está en tu dispositivo o en tu Drive, bajo tu control. Para cualquier pregunta, escríbenos con el enlace <a href="#contact" data-contact>Contacto</a> al pie de la página.',
        'Esta página cambia cuando cambia el sitio. La fecha de actualización está arriba.'
      ]]
    ]
  },
  pt: {
    titre: 'Privacidade', h1: 'Política de privacidade', tag: 'Seus dados',
    desc: 'O que o Chronologeek guarda, o que ele nunca envia e os serviços que seu navegador chama pelo caminho.',
    maj: 'Atualizado em ' + MAJ.pt,
    sections: [
      ['Em resumo', [
        'O Chronologeek <b>não tem contas, nem servidor de dados, nem cookies de publicidade</b>. Seu progresso, as obras que você mesmo adicionou e suas configurações ficam no seu navegador, no seu dispositivo. Nós não os vemos e não temos como vê-los.',
        'O site é um projeto independente de fã, mantido por uma só pessoa, sem publicidade e sem revenda de dados.'
      ]],
      ['O que fica no seu dispositivo', [
        'O site guarda no armazenamento local do seu navegador (<code>localStorage</code>): as obras que você marcou e o dia em que marcou, as obras que você adicionou (imagens incluídas), suas configurações, o percurso escolhido em cada página, seus votos para a próxima linha e algumas preferências de exibição. Um cache offline (service worker) também guarda uma cópia das páginas.',
        'Nada disso sai do seu dispositivo, a não ser que você mesmo faça isso: um arquivo exportado, um link de transferência (seu progresso viaja dentro do link, sem servidor no meio) ou a sincronização com o Google Drive descrita abaixo.',
        'Para apagar tudo, exclua os dados do site nas configurações do seu navegador. Os arquivos que você importa (exportações do Chronologeek ou do Letterboxd) são lidos no seu navegador e não são enviados para lugar nenhum.'
      ]],
      ['Medição de audiência', [
        'Contamos as visitas com o <a href="https://www.goatcounter.com/" rel="noopener">GoatCounter</a>, uma ferramenta de código aberto que <b>não usa cookies nem guarda seu endereço IP</b>. Ele registra a página vista, o site de origem, o tamanho da tela, o navegador e o país aproximado, sem conseguir identificar você nem segui-lo de um site para outro.',
        'Um voto para a próxima linha é contado do mesmo jeito, como um evento anônimo. Os totais de votos são públicos.',
        'Um bloqueador de anúncios que bloqueie o GoatCounter não quebra nada no site, exceto os votos.'
      ]],
      ['Hospedagem', [
        'O site é hospedado no <a href="https://pages.github.com/" rel="noopener">GitHub Pages</a>. Como qualquer hospedagem, o GitHub recebe seu endereço IP para servir as páginas e proteger o serviço; veja a <a href="https://docs.github.com/pt/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">declaração de privacidade do GitHub</a>. As fontes do site são servidas pelo próprio site.'
      ]],
      ['Serviços que seu navegador chama', [
        'Para mostrar os detalhes de cada obra, seu navegador consulta diretamente serviços públicos, que recebem assim seu endereço IP e o tipo de navegador, como em qualquer imagem carregada na web. Não enviamos nenhum dado sobre você a eles.',
        '<b>TMDB</b> (The Movie Database): pôsteres, sinopses, trailers e plataformas de streaming; estas últimas vêm do JustWatch, por meio do TMDB. <b>RAWG</b>: dados e plataformas dos videogames. <b>Open Library</b>: dados dos livros. Os trailers são links para o YouTube: nada do YouTube é carregado até você clicar.',
        'Os links “Onde ler”, “Onde assistir”, Ko-fi, assinatura da agenda e fontes levam a outros sites, que têm suas próprias regras. Por enquanto nenhum link de afiliado é usado; se isso mudar, a linha correspondente vai dizer.'
      ]],
      ['Sincronização com o Google Drive', [
        'Se você escolher sincronizar seu progresso com o Google Drive, seu navegador carrega o script de login do Google e pede a permissão do Google. O site só pede acesso <b>aos arquivos que ele mesmo cria</b> (<code>drive.file</code>): ele guarda seu progresso em um arquivo <code>chronologeek.json</code> no seu Drive e não vê nenhum dos seus outros arquivos.',
        'O token de acesso fica na página enquanto dura a sincronização e só é enviado ao Google. Nada é copiado para um servidor do Chronologeek: não existe nenhum. Você pode retirar o acesso quando quiser na <a href="https://myaccount.google.com/permissions" rel="noopener">sua conta do Google</a> e apagar o arquivo do seu Drive.',
        'O uso que o Chronologeek faz das informações recebidas das APIs do Google segue a <a href="https://developers.google.com/terms/api-services-user-data-policy" rel="noopener">Política de dados do usuário dos serviços de API do Google</a>, incluindo os requisitos de uso limitado.'
      ]],
      ['Seus direitos e contato', [
        'Como não guardamos nenhum dado sobre você, não há nada para consultar, corrigir ou apagar do nosso lado: tudo está no seu dispositivo ou no seu Drive, sob seu controle. Para qualquer dúvida, escreva para nós pelo link <a href="#contact" data-contact>Contato</a> no rodapé da página.',
        'Esta página muda quando o site muda. A data de atualização está no topo.'
      ]]
    ]
  }
};

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const CSS = `.cf{max-width:780px;margin:0 auto;padding:48px 20px 64px}
.cf .tag{display:inline-block;font-family:'Big Shoulders Display',sans-serif;font-weight:800;font-size:14px;letter-spacing:.16em;text-transform:uppercase;color:var(--hot)}
.cf h1{font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:clamp(40px,7vw,72px);line-height:.92;text-transform:uppercase;margin:6px 0 10px}
.cf .maj{font-size:13px;color:rgba(255,253,247,.6)}
.cf h2{font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:26px;text-transform:uppercase;margin:34px 0 10px;padding-top:14px;border-top:2px solid var(--line)}
.cf p{font-size:15.5px;line-height:1.65;color:rgba(255,253,247,.86);margin:0 0 12px}
.cf a{color:var(--hot)}
.cf code{font-size:13.5px;background:var(--plaque2,#26252b);padding:1px 5px;border-radius:3px}`;

export function confidentialite({ langue, ch, site, urls }) {
  const t = TEXTE[langue];
  const moi = urls[langue];
  // le sélecteur de langue (publier.mjs) : chaque langue mène à sa confidentialité
  const header = ch.header
    .replace(/<a class="lp-i" href="[^"]*" hreflang="(\w+)"([\s\S]*?)<\/a>/g,
      (t, l, reste) => urls[l] ? `<a class="lp-i" href="${urls[l]}" hreflang="${l}"${reste}</a>` : '');
  const corps = t.sections.map(([h, ps]) =>
    `<h2>${esc(h)}</h2>\n` + ps.map(p => `<p>${p}</p>`).join('\n')).join('\n');
  const html = `<!doctype html>
<html lang="${langue}" style="--uni:#f0c97c">
<head>
<meta charset="utf-8"/>
${TETE_REGLAGES}
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(t.h1)} | Chronologeek</title>
<meta name="description" content="${esc(t.desc)}"/>
<link rel="canonical" href="${site}${moi}"/>
<link rel="alternate" hreflang="fr" href="${site}${urls.fr}"/>
<link rel="alternate" hreflang="en" href="${site}${urls.en}"/>
<link rel="alternate" hreflang="es" href="${site}${urls.es}"/>
<link rel="alternate" hreflang="pt" href="${site}${urls.pt}"/>
<link rel="alternate" hreflang="x-default" href="${site}${urls.en}"/>
<meta property="og:title" content="${esc(t.h1)}"/>
<meta property="og:description" content="${esc(t.desc)}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Chronologeek"/>
<meta property="og:url" content="${site}${moi}"/>
<meta property="og:image" content="${site}/images/og-banner.webp"/>
<meta property="og:locale" content="${{ fr: 'fr_FR', en: 'en_US', es: 'es_ES', pt: 'pt_BR' }[langue]}"/>
<link rel="icon" type="image/png" href="/images/icon-192.png"/>
<link rel="manifest" href="/manifest.json"/>
<meta name="theme-color" content="#08080f"/>
<link rel="stylesheet" href="/works/fiche.css"/>
<style>${CSS}</style>
</head>
<body>
${header}
<main class="cf">
<span class="tag">${esc(t.tag)}</span>
<h1>${esc(t.h1)}</h1>
<p class="maj">${esc(t.maj)}</p>
${corps}
</main>
${ch.footer}
<script>(function(){var b=document.getElementById('burger'),d=document.getElementById('drawer');if(b&&d)b.addEventListener('click',function(){var o=d.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false')})})();</script>
<script data-goatcounter="https://arcanerval.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
<script src="/pwa.js"></script>
<script src="${langue === 'es' ? '/app-es.js' : langue === 'pt' ? '/app-pt.js' : '/app.js'}"></script>
</body>
</html>
`;
  return { sortie: moi.slice(1) + '.html', url: moi, html };
}
