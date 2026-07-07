
// ═══════════════════════════════════════════════════════════
// CHRONOLOGEEK — Système de badges & confettis
// ═══════════════════════════════════════════════════════════

const CG_BADGES_KEY = 'cg_badges';

// Définition de tous les badges
const BADGE_DEFS = {
  // ── STAR WARS ─────────────────────────────────────────────
  sw_padawan: {
    id: 'sw_padawan', universe: 'sw', label: 'Padawan',
    desc: "L'ère de la République terminée",
    icon: '🌱', color: '#4ade80',
    trigger: 'last', ids: ['sw-toj4']
  },
  sw_chevalier: {
    id: 'sw_chevalier', universe: 'sw', label: 'Chevalier Jedi',
    desc: 'La Guerre des Clones terminée',
    icon: '⚔️', color: '#60a5fa',
    trigger: 'last', ids: ['sw-toe5']
  },
  sw_fuite: {
    id: 'sw_fuite', universe: 'sw', label: 'Jedi en Fuite',
    desc: "L'ère de l'Empire terminée",
    icon: '🌑', color: '#f87171',
    trigger: 'last', ids: ['sw-survivor']
  },
  sw_rebelle: {
    id: 'sw_rebelle', universe: 'sw', label: 'Jedi Rebelle',
    desc: "L'ère de la Rébellion terminée",
    icon: '✊', color: '#fb923c',
    trigger: 'last', ids: ['sw-bf2-c2']
  },
  sw_survivant: {
    id: 'sw_survivant', universe: 'sw', label: 'Jedi Survivant',
    desc: "L'ère de la Nouvelle République terminée",
    icon: '🌿', color: '#34d399',
    trigger: 'last', ids: ['sw-skelcrew']
  },
  sw_dernier: {
    id: 'sw_dernier', universe: 'sw', label: 'Dernier Jedi',
    desc: "L'ère du Premier Ordre terminée",
    icon: '⚡', color: '#a78bfa',
    trigger: 'last', ids: ['sw-ep9']
  },
  sw_force: {
    id: 'sw_force', universe: 'sw', label: 'Que la Force soit avec toi',
    desc: '100% Star Wars complété',
    icon: '🌟', color: '#ffd700',
    trigger: '100pct', universe_key: 'sw'
  },

  // ── MARVEL ────────────────────────────────────────────────
  mcu_avenger: {
    id: 'mcu_avenger', universe: 'mcu', label: 'Avenger',
    desc: '100% Marvel complété',
    icon: '🛡️', color: '#f43f5e',
    trigger: '100pct', universe_key: 'mcu'
  },
  mcu_spidey: {
    id: 'mcu_spidey', universe: 'mcu', label: 'Araignée du Quartier',
    desc: 'Tous les Spider-Man vus',
    icon: '🕷️', color: '#e11d48',
    trigger: 'all', ids: ['mcu-sm1','mcu-smffh','mcu-smr1','mcu-smr2','mcu-smr3','mcu-tasm1','mcu-tasm2','mcu-itsv','mcu-nwh','mcu-atsv','mcu-vfsm']
  },
  mcu_mutant: {
    id: 'mcu_mutant', universe: 'mcu', label: 'Mutant Oméga',
    desc: 'Tous les X-Men et Deadpool vus',
    icon: '🧬', color: '#facc15',
    trigger: 'all', ids: ['mcu-xfc','mcu-xow','mcu-xm1','mcu-xm2','mcu-xm3','mcu-twolv','mcu-dofp','mcu-xma','mcu-xdp','mcu-logan','mcu-dp1','mcu-dp2','mcu-dpw']
  },
  mcu_thanos: {
    id: 'mcu_thanos', universe: 'mcu', label: 'Thanos',
    desc: "La Saga de l'Infini terminée",
    icon: '🪨', color: '#a855f7',
    trigger: 'last', ids: ['mcu-smffh']
  },
  mcu_defender: {
    id: 'mcu_defender', universe: 'mcu', label: 'Defender',
    desc: 'Toutes les séries Defenders vues',
    icon: '🥊', color: '#ef4444',
    trigger: 'all', ids: ['mcu-dd1','mcu-jj1','mcu-dd2','mcu-lc1','mcu-if1','mcu-defenders','mcu-pun1','mcu-jj2','mcu-lc2','mcu-if2','mcu-dd3','mcu-pun2','mcu-jj3','mcu-dba1','mcu-dba2','mcu-pun-olk']
  },
  mcu_shield: {
    id: 'mcu_shield', universe: 'mcu', label: 'Agent du S.H.I.E.L.D.',
    desc: 'Agent Carter et Agents of SHIELD terminés',
    icon: '🦅', color: '#3b82f6',
    trigger: 'all', ids: ['mcu-ac-os','mcu-ac-serie','mcu-aos-s1a','mcu-aos-s1b','mcu-aos-s1c','mcu-aos-s2a','mcu-aos-s2b','mcu-aos-s3a','mcu-aos-s3b','mcu-aos-s4','mcu-aos-s5a','mcu-aos-s5b','mcu-aos-s5c','mcu-aos-s6','mcu-aos-s7']
  },

  // ── DC ────────────────────────────────────────────────────
  dc_survivant: {
    id: 'dc_survivant', universe: 'dc', label: "Survivant de l'Événement",
    desc: "L'événement majeur atteint",
    icon: '⚡', color: '#ffd700',
    trigger: 'all', ids: ['av-arrow-s8e8','av-flash-s6e9','av-sg-s5e9','av-bw-s1e9','av-lot-s5e1']
  },
  dc_superman: {
    id: 'dc_superman', universe: 'dc', label: 'Superman Prime',
    desc: 'Toutes les origines de Superman vues',
    icon: '🦸', color: '#3b82f6',
    trigger: 'all', ids: ['dc-smallville','dc-krypton-s1','dc-supermanreturns','dc-supermanlois']
  },
  dc_batman: {
    id: 'dc_batman', universe: 'dc', label: 'Dark Knight Returns',
    desc: 'Toutes les origines de Batman vues',
    icon: '🦇', color: '#c084fc',
    trigger: 'all', ids: ['dc-batman89','dc-batmanreturns','dc-batmanbegins','dc-tdk','dc-tdkr','dc-gotham','dc-thebatman','dc-thepenguin']
  },
  dc_spectre: {
    id: 'dc_spectre', universe: 'dc', label: 'Spectre',
    desc: "Tout l'Arrowverse terminé",
    icon: '👻', color: '#22c55e',
    trigger: 'last', ids: ['av-flash-s9']
  },
  dc_voyageur: {
    id: 'dc_voyageur', universe: 'dc', label: 'Voyageur du Temps',
    desc: 'Tout le DCEU terminé',
    icon: '⏱️', color: '#60a5fa',
    trigger: 'last', ids: ['dceu-theflash']
  },
  dc_maitre: {
    id: 'dc_maitre', universe: 'dc', label: 'Maître du Multivers',
    desc: '100% DC complété',
    icon: '🌐', color: '#1e90ff',
    trigger: '100pct', universe_key: 'dc'
  },
};

// Couleurs confettis par univers
const CONFETTI_COLORS = {
  sw:  ['#ffe81f','#fff','#4ade80','#60a5fa','#f87171'],
  mcu: ['#f43f5e','#fbbf24','#60a5fa','#fff','#a78bfa'],
  dc:  ['#1e90ff','#ffd700','#c084fc','#22c55e','#fff'],
};

// ── Confettis ────────────────────────────────────────────────
function launchConfetti(universe, big=false){
  const colors = CONFETTI_COLORS[universe] || ['#fff','#ffd700','#60a5fa'];
  const count = big ? 180 : 80;
  const container = document.createElement('div');
  container.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(container);

  for(let i=0;i<count;i++){
    const el=document.createElement('div');
    const color=colors[Math.floor(Math.random()*colors.length)];
    const size=Math.random()*8+4;
    const startX=Math.random()*100;
    const delay=Math.random()*(big?0.8:0.4);
    const duration=1.2+Math.random()*1.2;
    const rotation=Math.random()*720-360;
    const shape=Math.random()>0.5?'50%':'2px';
    el.style.cssText=`
      position:absolute;
      left:${startX}vw;top:-10px;
      width:${size}px;height:${size*1.4}px;
      background:${color};
      border-radius:${shape};
      animation:cgFall ${duration}s ${delay}s ease-in forwards;
      transform-origin:center;
    `;
    container.appendChild(el);
  }

  const style=document.createElement('style');
  style.textContent=`@keyframes cgFall{
    0%{transform:translateY(0) rotate(0deg);opacity:1}
    80%{opacity:1}
    100%{transform:translateY(105vh) rotate(${Math.random()>0.5?'':'- '}720deg);opacity:0}
  }`;
  document.head.appendChild(style);
  setTimeout(()=>{container.remove();style.remove()}, (big?2.5:2)*1000);
}

// ── Badge débloqué : toast ───────────────────────────────────
function showBadgeToast(badge){
  const existing=document.getElementById('cg-badge-toast');
  if(existing)existing.remove();

  const toast=document.createElement('div');
  toast.id='cg-badge-toast';
  toast.style.cssText=`
    position:fixed;bottom:7rem;right:1.5rem;z-index:8000;
    background:linear-gradient(135deg,#1a1a2e,#16213e);
    border:1px solid ${badge.color};
    border-radius:14px;padding:.85rem 1.1rem;
    display:flex;align-items:center;gap:.75rem;
    box-shadow:0 4px 30px rgba(0,0,0,.6),0 0 20px ${badge.color}44;
    animation:cgToastIn .4s cubic-bezier(.34,1.56,.64,1) forwards;
    max-width:280px;
  `;
  toast.innerHTML=`
    <div style="font-size:1.8rem;flex-shrink:0">${badge.icon}</div>
    <div>
      <div style="font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${badge.color};margin-bottom:.15rem">Badge débloqué !</div>
      <div style="font-size:.88rem;font-weight:700;color:#e2e2f0">${badge.label}</div>
      <div style="font-size:.72rem;color:#9090b0;margin-top:.1rem">${badge.desc}</div>
    </div>
  `;

  const style=document.createElement('style');
  style.textContent=`
    @keyframes cgToastIn{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}
    @keyframes cgToastOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(60px)}}
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  setTimeout(()=>{
    toast.style.animation='cgToastOut .3s ease forwards';
    setTimeout(()=>{toast.remove();style.remove()},300);
  },3500);
}

// ── Récupérer les badges sauvegardés ─────────────────────────
function getSavedBadges(){
  try{return JSON.parse(localStorage.getItem(CG_BADGES_KEY)||'{}')}catch{return{}}
}
function saveBadges(obj){localStorage.setItem(CG_BADGES_KEY,JSON.stringify(obj))}

// ── Vérifier les badges ───────────────────────────────────────
function checkBadges(universe, progressObj, allEntryIds){
  const saved=getSavedBadges();
  const progress=progressObj||{};
  const newBadges=[];

  Object.values(BADGE_DEFS).forEach(badge=>{
    if(saved[badge.id])return; // déjà débloqué
    if(badge.universe!==universe)return; // mauvais univers

    let unlocked=false;

    if(badge.trigger==='last'){
      // Débloqué quand la dernière entrée est cochée
      unlocked=badge.ids.every(id=>!!progress[id]);
    }
    else if(badge.trigger==='all'){
      // Débloqué quand TOUTES les entrées listées sont cochées
      unlocked=badge.ids.every(id=>!!progress[id]);
    }
    else if(badge.trigger==='all_last'){
      // Débloqué quand toutes les entrées listées sont cochées (même logique)
      unlocked=badge.ids.every(id=>!!progress[id]);
    }
    else if(badge.trigger==='100pct'){
      // Débloqué quand 100% de l'univers est coché
      if(allEntryIds&&allEntryIds.length>0){
        unlocked=allEntryIds.every(id=>!!progress[id]);
      }
    }

    if(unlocked){
      newBadges.push(badge);
      saved[badge.id]=Date.now();
    }
  });

  if(newBadges.length>0){
    saveBadges(saved);
    // Afficher les badges avec délai entre chaque
    newBadges.forEach((badge,i)=>{
      setTimeout(()=>{
        const big=badge.trigger==='100pct';
        launchConfetti(universe,big);
        setTimeout(()=>showBadgeToast(badge),300);
        updateBadgeModal();
      },i*1000);
    });
  }
}

// ── Modal badges ──────────────────────────────────────────────
function openBadgeModal(){
  const existing=document.getElementById('cg-badge-modal');
  if(existing){existing.remove();return;}

  const saved=getSavedBadges();
  const universe=document.body.dataset.universe||'';

  // Filtrer les badges de cet univers
  const univBadges=Object.values(BADGE_DEFS).filter(b=>!universe||b.universe===universe);

  const unlockedCount=univBadges.filter(b=>saved[b.id]).length;

  let html=`<div id="cg-badge-modal" style="
    position:fixed;inset:0;z-index:7000;
    background:rgba(0,0,0,.75);backdrop-filter:blur(6px);
    display:flex;align-items:center;justify-content:center;padding:1rem;
  " onclick="if(event.target===this)this.remove()">
  <div style="
    background:#0f0f1a;border:1px solid #2a2a48;border-radius:18px;
    max-width:480px;width:100%;max-height:85vh;overflow-y:auto;
    padding:1.5rem;position:relative;
  ">
    <button onclick="document.getElementById('cg-badge-modal').remove()" style="
      position:absolute;top:.8rem;right:.8rem;background:none;border:none;
      color:#686880;font-size:1.2rem;cursor:pointer;
    ">✕</button>
    <div style="font-size:1.1rem;font-weight:800;color:#e2e2f0;margin-bottom:.3rem">Mes Badges</div>
    <div style="font-size:.78rem;color:#686880;margin-bottom:1.25rem">${unlockedCount} / ${univBadges.length} débloqués</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;">`;

  univBadges.forEach(badge=>{
    const unlocked=!!saved[badge.id];
    const date=saved[badge.id]?new Date(saved[badge.id]).toLocaleDateString('fr-FR'):'';
    html+=`<div style="
      background:${unlocked?'rgba('+hexToRgb(badge.color)+',.08)':'#161625'};
      border:1px solid ${unlocked?badge.color+'66':'#1e1e35'};
      border-radius:10px;padding:.75rem;
      opacity:${unlocked?'1':'.4'};
      transition:all .2s;
    ">
      <div style="font-size:1.6rem;margin-bottom:.3rem;filter:${unlocked?'none':'grayscale(1)'}">${badge.icon}</div>
      <div style="font-size:.78rem;font-weight:700;color:${unlocked?badge.color:'#686880'};margin-bottom:.15rem">${badge.label}</div>
      <div style="font-size:.67rem;color:#686880;line-height:1.4">${badge.desc}</div>
      ${unlocked&&date?`<div style="font-size:.6rem;color:#2a2a48;margin-top:.3rem">Débloqué le ${date}</div>`:''}
      ${!unlocked?`<div style="font-size:.6rem;color:#2a2a48;margin-top:.3rem">🔒 Verrouillé</div>`:''}
    </div>`;
  });

  html+=`</div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}

function hexToRgb(hex){
  const r=parseInt(hex.slice(1,3),16);
  const g=parseInt(hex.slice(3,5),16);
  const b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function updateBadgeModal(){
  const modal=document.getElementById('cg-badge-modal');
  if(modal){modal.remove();openBadgeModal();}
}

// ── Bouton badges dans le progress-block ─────────────────────
function initBadgeButton(){
  const pb=document.querySelector('.progress-block');
  if(!pb||pb.querySelector('.badge-btn'))return;
  const btn=document.createElement('button');
  btn.className='badge-btn';
  btn.innerHTML='🏆 Badges';
  btn.style.cssText=`
    background:none;border:1px solid #2a2a48;color:#9090b0;
    border-radius:8px;padding:.35rem .9rem;font-size:.78rem;
    cursor:pointer;transition:all .2s;white-space:nowrap;
  `;
  btn.onmouseenter=()=>{btn.style.borderColor='#7c6af7';btn.style.color='#e2e2f0'};
  btn.onmouseleave=()=>{btn.style.borderColor='#2a2a48';btn.style.color='#9090b0'};
  btn.onclick=openBadgeModal;
  pb.appendChild(btn);
}

// Init au chargement
document.addEventListener('DOMContentLoaded',initBadgeButton);
