/* ============================================================
   FOCO ARENA v2.1 — central de operações
   ============================================================ */

/* ── CARREIRA DO JOGADOR ── */
const CAREER = [
  {id:'escolinha',  name:'ESCOLINHA',          club:'Dando os primeiros toques',   need:0},
  {id:'sub15',      name:'SUB-15',              club:'Categoria de base',           need:100},
  {id:'sub20',      name:'SUB-20',              club:'Promessa do futebol',         need:250},
  {id:'profissional',name:'PROFISSIONAL',       club:'Contrato assinado',           need:450},
  {id:'corinthians',name:'TITULAR DO TIMÃO',    club:'Corinthians • Série A',       need:700},
  {id:'selecao',    name:'SELEÇÃO BRASILEIRA',  club:'Convocado pela CBF',          need:1000},
  {id:'porto',      name:'FC PORTO',            club:'Champions League',            need:1400},
  {id:'city',       name:'MANCHESTER CITY',     club:'Premier League',              need:1800},
  {id:'madrid',     name:'REAL MADRID',         club:'La Liga • Santiago Bernabéu', need:2400},
  {id:'ballon',     name:"BALLON D'OR 🏆",      club:'Melhor do mundo',             need:3200},
];

/* ── TROFÉUS ── */
const TROPHY_DEFS = [
  {id:'first_task', icon:'🎯', name:'Primeira Jogada',    desc:'Completou sua primeira tarefa', check:s=>s.tasks.filter(t=>t.done).length>=1},
  {id:'streak_3',   icon:'🔥', name:'Triênio',            desc:'3 dias de sequência',           check:s=>s.streak>=3},
  {id:'streak_7',   icon:'🏅', name:'Semana Invicta',     desc:'7 dias consecutivos',           check:s=>s.streak>=7},
  {id:'streak_14',  icon:'🥇', name:'Quinzena de Ferro',  desc:'14 dias sem parar',             check:s=>s.streak>=14},
  {id:'streak_30',  icon:'👑', name:'Mês Perfeito',       desc:'30 dias consecutivos',          check:s=>s.streak>=30},
  {id:'foco_1',     icon:'⚡', name:'Primeiro Foco',      desc:'1 bloco Pomodoro concluído',    check:s=>(s.records.totalFocos||0)>=1},
  {id:'foco_10',    icon:'🎮', name:'Dez no Foco',        desc:'10 blocos de foco',             check:s=>(s.records.totalFocos||0)>=10},
  {id:'foco_50',    icon:'🚀', name:'Cinquenta Focos',    desc:'50 blocos de foco',             check:s=>(s.records.totalFocos||0)>=50},
  {id:'xp_100',     icon:'💯', name:'Cem Pontos',         desc:'100 XP lifetime',               check:s=>(s.totalXpEver||0)>=100},
  {id:'xp_500',     icon:'💎', name:'Quinhentos',         desc:'500 XP lifetime',               check:s=>(s.totalXpEver||0)>=500},
  {id:'xp_1000',    icon:'🌟', name:'Milhar',             desc:'1000 XP lifetime',              check:s=>(s.totalXpEver||0)>=1000},
  {id:'rival_win',  icon:'👻', name:'Caça-Fantasma',      desc:'Venceu o Rival Fantasma',       check:s=>(s.records.rivalWins||0)>=1},
  {id:'rival_3',    icon:'🏆', name:'Exterminador',       desc:'3 vitórias contra o Rival',     check:s=>(s.records.rivalWins||0)>=3},
  {id:'reflect_1',  icon:'✍️', name:'Primeira Reflexão',  desc:'Primeira reflexão de fé',       check:s=>(s.reflections||[]).length>=1},
  {id:'reflect_7',  icon:'📖', name:'Diário Fiel',        desc:'7 reflexões escritas',          check:s=>(s.reflections||[]).length>=7},
  {id:'obra_5',     icon:'📸', name:'Criador',            desc:'5 posts no IAnaObra',           check:s=>Object.keys(s.obraPosts||{}).length>=5},
  {id:'obra_20',    icon:'📲', name:'Influência em Obra', desc:'20 posts no calendário',        check:s=>Object.keys(s.obraPosts||{}).length>=20},
  {id:'rescue_1',   icon:'🧹', name:'Limpeza Geral',      desc:'Resgatou uma tarefa abandonada',check:s=>(s.records.rescues||0)>=1},
  {id:'rescue_5',   icon:'♻️', name:'Rei do Resgate',     desc:'5 tarefas resgatadas',          check:s=>(s.records.rescues||0)>=5},
  {id:'daily_read', icon:'⛪', name:'Missa Digital',       desc:'Gerou a leitura do dia',        check:s=>!!(s.lastReading)},
  {id:'week_card',  icon:'💌', name:'Carta do Frei',      desc:'Gerou a carta semanal',         check:s=>!!(s.lastWeekCard)},
  {id:'month_card', icon:'📜', name:'Carta do Mês',       desc:'Gerou a carta mensal',          check:s=>!!(s.lastMonthCard)},
  {id:'habit_7',    icon:'💊', name:'Rotina Blindada',    desc:'Hábito marcado 7 dias',         check:()=>false},// verificado manualmente
  {id:'ballon_dor', icon:'🏅', name:"Ballon D'Or",         desc:"Atingiu o nível Ballon D'Or",  check:s=>(s.totalXpEver||0)>=3200},
];

const MOTIV_MSGS = [
  'Bom dia. Uma tarefa de cada vez — qual você ataca primeiro?',
  'Cada checagem é um passo. O campo espera por você.',
  'Dias de pouco brilho também contam. Que tal começar pelo mais fácil?',
  'Foco não é perfeição. É consistência.',
  'O jogo de hoje começa agora. Bora?',
  'Pequenas vitórias constroem campeonatos.',
  'Sua sequência não se faz sozinha. Mas você faz.',
  'Uma tarefa concluída vale mais que dez planejadas.',
];

/* ── CONFIG / ECONOMIA ── */
const XP = {task:10, habit:10, foco:15, streakBonus:20, ressuscitar:30, resgate:15};
const ESCUDO_CAP=3, VISIBLE_LIMIT=3, TASK_FLOOR=3, TASK_RESGATE_DAYS=5;
const WEEKDAY_MIN=3, WEEKEND_MIN=1;

/* ── ESTADO ── */
let S = {
  xp:0, xpMonth:0, totalXpEver:0, monthKey:null,
  streak:0, bestStreak:0,
  escudos:1, escudoWeekKey:null, lastStreakDate:null,
  tasks:[], habits:[],
  history:{}, weekly:{},
  records:{bestStreak:0,bestWeekXP:0,mostFocosInDay:0,totalFocos:0,rivalWins:0,rescues:0},
  lastSettledWeek:null, careerHistory:[],
  trophies:{}, reflections:[],
  weekIntention:'', lastWeekCard:null, lastMonthCard:null,
  lastReading:null,         // {date, text, source} — persiste entre dispositivos
  matchesCache:{date:'',data:[]},
  obraPosts:{}, obraConfig:{about:'',lastPosts:''},
  _seededHabits:false, _updatedAt:0,
  // UI (não persistidos)
  showAll:false, addMode:'task', view:'hoje',
  calYear:new Date().getFullYear(), calMonth:new Date().getMonth(),
  matchesCollapsed:false,
};

/* ── STORE ── */
const Store=(function(){
  const LS='focoarena:v2',LSC='focoarena:syncCode';
  let sb=null,online=false,timer=null;
  const gen=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const p=()=>Array.from({length:4},()=>a[Math.floor(Math.random()*a.length)]).join('');return 'ARENA-'+p()+'-'+p();};
  const getCode=()=>{let c=localStorage.getItem(LSC);if(!c){c=gen();localStorage.setItem(LSC,c);}return c;};
  const setCode=c=>localStorage.setItem(LSC,c.trim().toUpperCase());
  const loadLocal=()=>{try{const r=localStorage.getItem(LS);return r?JSON.parse(r):null;}catch(e){return null;}};
  const saveLocal=s=>{try{localStorage.setItem(LS,JSON.stringify(s));}catch(e){}};
  const init=()=>{const cfg=window.FOCO_CONFIG||{};
    const ok=cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes('COLE_AQUI')&&typeof supabase!=='undefined';
    if(ok){try{sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);online=true;}catch(e){online=false;}}
    return online;};
  const pull=async()=>{if(!online)return null;try{const{data,error}=await sb.from('foco_arena').select('data').eq('sync_code',getCode()).maybeSingle();if(error)return null;return data?data.data:null;}catch(e){return null;}};
  const push=async s=>{if(!online)return false;try{const{error}=await sb.from('foco_arena').upsert({sync_code:getCode(),data:s,updated_at:new Date().toISOString()});return !error;}catch(e){return false;}};
  return{online:()=>online,code:getCode,setCode,init,loadLocal,pull,saveLocal,
    save(state){saveLocal(state);if(!online){setStatus('off');return;}setStatus('sync');
      clearTimeout(timer);timer=setTimeout(async()=>{const ok=await push(state);setStatus(ok?'ok':'off');},700);}};
})();

/* ── DATAS ── */
const pad=n=>String(n).padStart(2,'0');
function keyOf(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function todayKey(){return keyOf(new Date());}
function dateFromKey(k){const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d);}
function daysBetween(a,b){return Math.round((dateFromKey(b)-dateFromKey(a))/86400000);}
function isWeekend(){const d=new Date().getDay();return d===0||d===6;}
function weekStartOf(d){const x=new Date(d);x.setHours(0,0,0,0);const day=x.getDay();x.setDate(x.getDate()+(day===0?-6:1-day));return x;}
function weekKeyOf(d=new Date()){return keyOf(weekStartOf(d));}
function weekDates(ws){return Array.from({length:7},(_,i)=>{const x=new Date(ws);x.setDate(x.getDate()+i);return keyOf(x);});}
function fmtDate(k){const d=dateFromKey(k);return pad(d.getDate())+'/'+pad(d.getMonth()+1);}
function curMonthKey(){const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1);}
function monthName(y,m){return new Date(y,m,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});}

/* ── AVATAR SVG (pixel art neon preto e branco) ── */
function buildAvatar(careerId){
  const colors={
    body:'#e8f4f8', shorts:'#111', socks:'#e8f4f8', boots:'#222',
    accent: careerId==='corinthians'?'#111':
            careerId==='selecao'?'#007a3d':
            careerId==='porto'?'#003087':
            careerId==='city'?'#6cabdd':
            careerId==='madrid'?'#febe10':
            careerId==='ballon'?'#ffe600':'#00e5ff',
  };
  return `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- cabeça -->
    <rect x="11" y="1" width="10" height="10" fill="#f5d5a8"/>
    <rect x="10" y="3" width="1" height="7" fill="#f5d5a8"/>
    <rect x="21" y="3" width="1" height="7" fill="#f5d5a8"/>
    <!-- cabelo -->
    <rect x="11" y="1" width="10" height="2" fill="#4a3000"/>
    <rect x="10" y="3" width="2" height="1" fill="#4a3000"/>
    <!-- olhos -->
    <rect x="13" y="5" width="2" height="2" fill="#222"/>
    <rect x="17" y="5" width="2" height="2" fill="#222"/>
    <!-- boca -->
    <rect x="14" y="8" width="4" height="1" fill="#c0806a"/>
    <!-- pescoço -->
    <rect x="14" y="11" width="4" height="2" fill="#f5d5a8"/>
    <!-- camisa (listras verticais P&B estilo Corinthians) -->
    <rect x="9"  y="13" width="14" height="11" fill="${colors.body}"/>
    <rect x="10" y="13" width="2"  height="11" fill="${colors.accent}" opacity="0.7"/>
    <rect x="14" y="13" width="2"  height="11" fill="${colors.accent}" opacity="0.7"/>
    <rect x="18" y="13" width="2"  height="11" fill="${colors.accent}" opacity="0.7"/>
    <!-- número na camisa -->
    <rect x="14" y="15" width="4" height="5" fill="none"/>
    <!-- mangas -->
    <rect x="5"  y="13" width="4" height="7" fill="${colors.body}"/>
    <rect x="23" y="13" width="4" height="7" fill="${colors.body}"/>
    <!-- punhos -->
    <rect x="5"  y="20" width="4" height="2" fill="${colors.accent}" opacity="0.8"/>
    <rect x="23" y="20" width="4" height="2" fill="${colors.accent}" opacity="0.8"/>
    <!-- mãos -->
    <rect x="5"  y="22" width="4" height="2" fill="#f5d5a8"/>
    <rect x="23" y="22" width="4" height="2" fill="#f5d5a8"/>
    <!-- shorts -->
    <rect x="10" y="24" width="12" height="6" fill="${colors.shorts}"/>
    <!-- pernas / meias -->
    <rect x="10" y="30" width="5" height="6" fill="${colors.socks}"/>
    <rect x="17" y="30" width="5" height="6" fill="${colors.socks}"/>
    <!-- listra meias -->
    <rect x="10" y="32" width="5" height="1" fill="${colors.accent}" opacity="0.6"/>
    <rect x="17" y="32" width="5" height="1" fill="${colors.accent}" opacity="0.6"/>
    <!-- chuteiras -->
    <rect x="9"  y="36" width="6" height="3" fill="${colors.boots}"/>
    <rect x="17" y="36" width="6" height="3" fill="${colors.boots}"/>
    <rect x="9"  y="38" width="7" height="1" fill="${colors.boots}"/>
    <rect x="16" y="38" width="7" height="1" fill="${colors.boots}"/>
  </svg>`;
}

/* ── ROLLOVER ── */
let pendingMsg=null;
function rollover(){
  const wk=weekKeyOf();
  if(S.escudoWeekKey!==wk){if(S.escudoWeekKey!==null&&S.escudos<ESCUDO_CAP)S.escudos++;S.escudoWeekKey=wk;}
  if(S.lastStreakDate){
    const gap=daysBetween(S.lastStreakDate,todayKey());
    if(gap>=2){let missed=gap-1,shield=false;
      while(missed>0&&S.escudos>0){S.escudos--;missed--;shield=true;}
      if(missed>0){S.streak=0;pendingMsg={type:'reset'};}
      else if(shield){pendingMsg={type:'shield'};}}
  }
  const mk=curMonthKey();
  if(S.monthKey&&S.monthKey!==mk){
    // guarda histórico da carreira antes de zerar
    const prevCareer=currentCareer();
    if(prevCareer){
      S.careerHistory=S.careerHistory||[];
      S.careerHistory.unshift({month:S.monthKey,careerId:prevCareer.id,careerName:prevCareer.name,xp:S.xpMonth});
      if(S.careerHistory.length>12)S.careerHistory=S.careerHistory.slice(0,12);
    }
    S.xpMonth=0;
  }
  S.monthKey=mk;
  settleWeeks();
}
function settleWeeks(){
  const curWk=weekKeyOf();
  if(S.lastSettledWeek===curWk)return;
  if(S.lastSettledWeek){
    let cur=new Date(dateFromKey(S.lastSettledWeek));
    for(let i=0;i<52;i++){
      const wkKey=keyOf(weekStartOf(cur));
      if(wkKey===curWk)break;
      if(!S.weekly[wkKey]){
        const sums=weeklyXP(weekStartOf(cur));
        const lb=new Date(weekStartOf(cur));lb.setDate(lb.getDate()-7);
        const target=Math.max(70,Math.round(weeklyXP(lb)*1.1));
        const won=sums>=target;
        S.weekly[wkKey]={xp:sums,rival:target,won,settled:true};
        if(won){S.records.rivalWins=(S.records.rivalWins||0)+1;checkTrophy('rival_win');if(S.records.rivalWins>=3)checkTrophy('rival_3');}
        if(sums>(S.records.bestWeekXP||0))S.records.bestWeekXP=sums;
      }
      cur.setDate(cur.getDate()+7);
    }
  }
  S.lastSettledWeek=curWk;
}
function dailyMin(){return isWeekend()?WEEKEND_MIN:WEEKDAY_MIN;}
function todayMinimumMet(){const h=S.history[todayKey()]||{count:0,focos:0};return h.count>=dailyMin()||h.focos>=1;}
function registerProgress(type){
  const t=todayKey();
  if(!S.history[t])S.history[t]={count:0,focos:0,xp:0};
  if(type==='foco'){
    S.history[t].focos++;S.records.totalFocos=(S.records.totalFocos||0)+1;
    if(S.history[t].focos>(S.records.mostFocosInDay||0))S.records.mostFocosInDay=S.history[t].focos;
    checkTrophy('foco_1');if(S.records.totalFocos>=10)checkTrophy('foco_10');if(S.records.totalFocos>=50)checkTrophy('foco_50');
  }else{S.history[t].count++;}
  const wasMet=S.lastStreakDate===t;
  if(todayMinimumMet()&&!wasMet){
    S.streak++;if(S.streak>S.bestStreak)S.bestStreak=S.streak;
    if(S.streak>S.records.bestStreak)S.records.bestStreak=S.streak;
    S.lastStreakDate=t;
    addXP(XP.streakBonus,true);
    setTimeout(()=>toast('SEQUÊNCIA MANTIDA! 🔥','+'+XP.streakBonus+' pts · '+S.streak+' dias invicto'),700);
    checkTrophy('streak_3');checkTrophy('streak_7');checkTrophy('streak_14');checkTrophy('streak_30');
    // campo limpo
    setTimeout(renderCampoLimpo,1000);
  }
}

/* ── XP ── */
function addXP(amount,silent){
  let mult=1,surprise=null;
  if(!silent){const r=Math.random();if(r<0.05){mult=3;surprise='HAT-TRICK! 3x ⚽⚽⚽';}else if(r<0.20){mult=2;surprise='BÔNUS SURPRESA! 2x ⚡';}}
  const gained=amount*mult;
  const prevCareer=currentCareer();
  S.xp+=gained;S.xpMonth+=gained;S.totalXpEver+=gained;
  const t=todayKey();if(!S.history[t])S.history[t]={count:0,focos:0,xp:0};
  S.history[t].xp=(S.history[t].xp||0)+gained;
  if(surprise)toast(surprise,'+'+gained+' pts');
  // verifica level up de carreira
  const newCareer=currentCareer();
  if(prevCareer&&newCareer&&prevCareer.id!==newCareer.id){setTimeout(()=>showLevelUp(newCareer),800);}
  checkTrophy('xp_100');checkTrophy('xp_500');checkTrophy('xp_1000');checkTrophy('ballon_dor');
  return{gained,surprise};
}
function currentCareer(){
  let idx=0;for(let i=0;i<CAREER.length;i++)if(S.totalXpEver>=CAREER[i].need)idx=i;
  return CAREER[idx];
}
function weeklyXP(ws){return weekDates(ws).reduce((s,k)=>s+(S.history[k]?.xp||0),0);}

/* ── DECAY ── */
function taskAge(t){return Math.max(0,daysBetween(t.date||todayKey(),todayKey()));}
function taskXP(t){return Math.max(TASK_FLOOR,XP.task-taskAge(t));}
function taskIsRescue(t){return taskAge(t)>=TASK_RESGATE_DAYS;}

/* ── TROFÉUS ── */
function checkTrophy(id){
  if(S.trophies[id])return;
  const def=TROPHY_DEFS.find(t=>t.id===id);if(!def)return;
  if(def.check&&!def.check(S))return;
  S.trophies[id]=keyOf(new Date());
  toast('TROFÉU DESBLOQUEADO! 🏆',def.icon+' '+def.name);
  persist();
}
function checkAllTrophies(){TROPHY_DEFS.forEach(d=>{if(!S.trophies[d.id]&&d.check&&d.check(S))checkTrophy(d.id);});}

/* ── LIMPEZA AUTOMÁTICA: tarefas concluídas há mais de 3 dias ── */
function pruneOldTasks(){
  const cutoff=3;
  S.tasks=S.tasks.filter(t=>{
    if(!t.done||!t.doneDate)return true;
    return daysBetween(t.doneDate,todayKey())<cutoff;
  });
}

/* ── PERSIST ── */
function persist(){
  S._updatedAt=Date.now();
  const{showAll,addMode,view,calYear,calMonth,...data}=S;
  Store.save(data);
}

/* ── ROUTING ── */
function go(view){
  S.view=view;
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+view));
  document.querySelectorAll('.bnav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  render();
}

/* ── HELPERS DOM ── */
const $=id=>document.getElementById(id);
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

/* ── RENDER MASTER ── */
function render(){
  renderHUD();renderContext();
  if(S.view==='hoje'){renderToday();renderMatches();renderDayResume();}
  if(S.view==='fe')renderFe();
  if(S.view==='trofeus')renderTrofeus();
  if(S.view==='liga')renderLiga();
  if(S.view==='ianaobra')renderObra();
}

function renderHUD(){
  const career=currentCareer();
  const nextCareer=CAREER[CAREER.indexOf(career)+1];
  $('avatarWrap').innerHTML=buildAvatar(career.id);
  $('playerCareer').textContent=career.name;
  $('playerClub').textContent=career.club;
  $('streakNum').textContent=S.streak;
  if(nextCareer){
    const base=career.need,span=nextCareer.need-base,prog=Math.min(span,S.totalXpEver-base);
    $('fill').style.width=Math.max(4,(prog/span*100))+'%';
    $('playerXpLabel').textContent=(S.totalXpEver-base)+' / '+span+' XP p/ '+nextCareer.name;
  }else{
    $('fill').style.width='100%';
    $('playerXpLabel').textContent="BALLON D'OR CONQUISTADO 🏆";
  }
  $('escudos').innerHTML='<span class="sh">🛡️</span> '+S.escudos+' escudo'+(S.escudos!==1?'s':'')+' <span style="opacity:.5">(máx '+ESCUDO_CAP+')</span>';
  $('xpMonth').textContent='📅 '+S.xpMonth+' XP este mês';
  $('lifetime').textContent='⭐ '+S.totalXpEver+' total';
}

function renderContext(){
  const h=new Date().getHours();const c=$('ctx');const txt=$('ctxText');c.className='ctx';
  if(h>=8&&h<17){c.classList.add('work');c.querySelector('.ic').textContent='💊';
    txt.innerHTML=(h>=9&&h<15)?'<b>Janela de pico do remédio.</b> Hora das tarefas pesadas.':'Modo trabalho em andamento.';}
  else if(h>=17&&h<19){c.classList.add('family');c.querySelector('.ic').textContent='💛';
    txt.innerHTML='<b>Modo presença.</b> Esse tempo é da sua pequena.';}
  else{c.classList.add('me');c.querySelector('.ic').textContent='🎮';
    txt.innerHTML='<b>Seu tempo.</b> Hora de descansar e gastar recompensa.';}
}

/* ── MOTIVACIONAL ── */
function renderMotiv(){
  const h=new Date().getHours();
  if(h<6||h>=22){$('motivBox').classList.remove('show');return;}
  const msg=MOTIV_MSGS[new Date().getDay()%MOTIV_MSGS.length];
  const total=S.tasks.filter(t=>!t.done).length+(S.habits.filter(h=>!(h.doneDates||[]).includes(todayKey()))).length;
  $('motivBox').innerHTML=`<span class="motiv-tag">HOJE</span>${msg}${total>0?' Você tem <b>'+total+' '+(total===1?'item':'itens')+'</b> na escalação.':''}`;
  $('motivBox').classList.add('show');
}

/* ── HOJE ── */
function getTodayItems(){
  const t=todayKey();const items=[];
  S.habits.forEach(h=>items.push({kind:'habit',id:h.id,name:h.name,icon:h.icon||'🔁',
    sub:h.sub||'Hábito diário',done:(h.doneDates||[]).includes(t),xp:XP.habit}));
  S.tasks.forEach(tk=>{
    if(tk.done){
      const earned=tk.xpEarned!=null?tk.xpEarned:XP.task;
      items.push({kind:'task',id:tk.id,name:tk.name,icon:'🎯',
        sub:tk.wasRescue?'🧹 Resgatada · rendeu '+earned+' pts':'Concluída ✓',done:true,xp:earned,age:0,rescue:false});
    }else{
      const age=taskAge(tk);const xp=taskXP(tk);const rescue=taskIsRescue(tk);
      let sub='Tarefa do dia';
      if(rescue)sub='🔥 '+age+' dias parada · resgate +'+XP.resgate;
      else if(age>=2)sub=age+' dias parada · -'+(XP.task-xp)+' pts';
      else if(age===1)sub='1 dia parada · -1 pt';
      items.push({kind:'task',id:tk.id,name:tk.name,icon:'🎯',sub,done:false,xp,age,rescue});
    }
  });
  items.sort((a,b)=>(a.done?1:0)-(b.done?1:0));
  return items;
}

function renderToday(){
  renderMotiv();
  const items=getTodayItems();const list=$('todayList');list.innerHTML='';
  const min=dailyMin();const doneCount=items.filter(i=>i.done).length;
  $('goalChip').textContent=doneCount+' / '+min+' mín';
  if(items.length===0){list.innerHTML='<div class="empty">Escalação vazia. Adicione tarefas e hábitos 👇</div>';$('moreBtn').style.display='none';return;}
  const shown=S.showAll?items:items.slice(0,VISIBLE_LIMIT);
  shown.forEach((it,i)=>{
    const cls=it.kind==='habit'?'hab':'task';
    const ageCls=it.rescue?' age-rescue':(it.age>=2)?' age-aging':'';
    const c=document.createElement('div');
    c.className='card '+cls+ageCls+(it.done?' done':'');
    c.style.animationDelay=(i*0.04)+'s';
    c.innerHTML=`<div class="check" data-act="toggle" data-kind="${it.kind}" data-id="${it.id}">✓</div>
      <div class="ic-emoji">${it.icon}</div>
      <div class="body"><div class="name">${esc(it.name)}</div><div class="sub">${esc(it.sub)}</div></div>
      <div class="xptag">+${it.xp}</div>
      <button class="del" data-act="del" data-kind="${it.kind}" data-id="${it.id}">✕</button>`;
    list.appendChild(c);
  });
  const hidden=items.length-VISIBLE_LIMIT;const mb=$('moreBtn');
  if(hidden>0||S.showAll){mb.style.display='block';mb.textContent=S.showAll?'▲ recolher':'▼ ver mais '+hidden+' '+(hidden===1?'item':'itens');}
  else mb.style.display='none';
}

function renderCampoLimpo(){
  if(!todayMinimumMet())return;
  const list=$('todayList');
  const existing=list.querySelector('.campo-limpo');if(existing)return;
  const cl=document.createElement('div');cl.className='campo-limpo';
  const pts=(S.history[todayKey()]?.xp||0);
  cl.innerHTML=`<span class="cl-icon">✅</span><div class="cl-title">CAMPO LIMPO!</div>
    <div class="cl-sub">Mínimo do dia batido · +${XP.streakBonus} pts de sequência</div>`;
  list.insertBefore(cl,list.firstChild);
}

function renderDayResume(){
  const h=new Date().getHours();const box=$('dayResume');
  if(h<21){box.style.display='none';return;}
  const t=todayKey();const hst=S.history[t]||{count:0,focos:0,xp:0};
  box.style.display='block';
  box.innerHTML=`<div class="day-resume">
    <h3>📊 BALANÇO DO DIA</h3>
    <div class="stats">
      <div class="stat"><div class="stat-val">${hst.count}</div><div class="stat-label">tarefas</div></div>
      <div class="stat"><div class="stat-val">${hst.focos||0}</div><div class="stat-label">focos</div></div>
      <div class="stat"><div class="stat-val">${hst.xp||0}</div><div class="stat-label">pts hoje</div></div>
      <div class="stat"><div class="stat-val">${S.streak}</div><div class="stat-label">sequência</div></div>
    </div>
  </div>`;
}

function renderMatches(){
  const body=$('matchesBody');
  if(S.matchesCollapsed){body.style.display='none';$('matchesArrow').classList.add('up');return;}
  body.style.display='block';$('matchesArrow').classList.remove('up');
  const cache=S.matchesCache||{date:'',data:[]};
  if(cache.date===todayKey()&&cache.data.length>0){showMatches(cache.data);}
  // se não tem cache do dia, mostra placeholder
}

function showMatches(matches){
  const box=$('matchesList');
  if(!matches||matches.length===0){box.innerHTML='<div class="empty small">Nenhum jogo hoje nos seus campeonatos.</div>';return;}
  box.innerHTML=matches.map(m=>`
    <div class="match-row">
      <div><div class="match-teams">${esc(m.home)} × ${esc(m.away)}</div>
        <div class="match-league">${esc(m.league)}</div></div>
      <div class="match-time ${m.live?'match-live':''}">${m.live?'🔴 AO VIVO':esc(m.time)}</div>
    </div>`).join('');
}

/* ── FÉ ── */
function renderFe(){
  const today=todayKey();
  // mostra leitura salva se for do dia de hoje
  const readBox=$('readingContent');
  if(S.lastReading&&S.lastReading.date===today){
    readBox.innerHTML=formatReading(S.lastReading.text,S.lastReading.source);
  }
  const todayRefl=S.reflections.find(r=>r.date===today);
  $('reflectInput').value=todayRefl?todayRefl.text:'';
  $('todayReflectStatus').textContent=todayRefl?'✓ Reflexão salva — '+fmtDate(today):'Ainda sem reflexão hoje.';
  $('intentionBox').innerHTML=S.weekIntention?'<b>💭 Intenção da semana:</b> '+esc(S.weekIntention):'';
  // carta semanal salva
  if(S.lastWeekCard){$('weekCard').innerHTML=formatLetter(S.lastWeekCard);$('weekCard').dataset.generated='1';}
  // reflexões
  const rl=$('reflectionsList');
  const recent=[...S.reflections].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7);
  if(recent.length===0){rl.innerHTML='<div class="empty small">Nenhuma reflexão ainda.</div>';return;}
  rl.innerHTML=recent.map(r=>`<div class="reflect-item">
    <div class="reflect-date">${fmtDate(r.date)}</div>
    <div class="reflect-text">${esc(r.text.slice(0,200))}${r.text.length>200?'…':''}</div>
  </div>`).join('');
}

/* ── TROFÉUS ── */
function renderTrofeus(){
  // carta do mês
  if(S.lastMonthCard){$('monthCard').innerHTML=formatLetter(S.lastMonthCard);$('monthCard').dataset.generated='1';}
  // próximos troféus
  const earned=Object.keys(S.trophies||{});
  $('trophyCount').textContent=earned.length+' / '+TROPHY_DEFS.length;
  const next=$('nextTrophies');next.innerHTML='';
  const upcoming=TROPHY_DEFS.filter(d=>!S.trophies[d.id]).slice(0,3);
  upcoming.forEach(def=>{
    // calcula progresso aproximado
    let prog=0,total=1,label='';
    if(def.id.startsWith('streak_')){const n=parseInt(def.id.split('_')[1]);prog=Math.min(n,S.streak);total=n;label=S.streak+'/'+n+' dias';}
    else if(def.id.startsWith('foco_')){const n=parseInt(def.id.split('_')[1]);prog=Math.min(n,S.records.totalFocos||0);total=n;label=prog+'/'+n+' focos';}
    else if(def.id.startsWith('xp_')){const n=parseInt(def.id.split('_')[1]);prog=Math.min(n,S.totalXpEver||0);total=n;label=prog+'/'+n+' XP';}
    else if(def.id.startsWith('reflect_')){const n=parseInt(def.id.split('_')[1]);prog=Math.min(n,S.reflections.length);total=n;label=prog+'/'+n+' reflexões';}
    else if(def.id.startsWith('rival')){const n=def.id==='rival_3'?3:1;prog=Math.min(n,S.records.rivalWins||0);total=n;label=prog+'/'+n+' vitórias';}
    else{prog=0;total=1;label='Em andamento';}
    const pct=total>0?Math.round(prog/total*100):0;
    const row=document.createElement('div');row.className='next-trophy';
    row.innerHTML=`<div class="nt-icon">${def.icon}</div>
      <div class="nt-body">
        <div class="nt-name">${def.name}</div>
        <div class="nt-desc">${def.desc}</div>
        <div class="nt-track"><div class="nt-fill" style="width:${pct}%"></div></div>
        <div class="nt-progress">${label}</div>
      </div>`;
    next.appendChild(row);
  });
  // grid
  const grid=$('trophyGrid');grid.innerHTML='';
  TROPHY_DEFS.forEach(def=>{
    const gotIt=!!(S.trophies||{})[def.id];
    const div=document.createElement('div');
    div.className='trophy '+(gotIt?'earned':'locked');
    div.title=def.desc+(gotIt?' · '+fmtDate(S.trophies[def.id]):'');
    div.innerHTML=`<div class="trophy-icon">${def.icon}</div>
      <div class="trophy-name">${def.name}</div>
      ${gotIt?'<div class="trophy-date">'+fmtDate(S.trophies[def.id])+'</div>':''}`;
    grid.appendChild(div);
  });
}

/* ── LIGA ── */
function rivalState(){
  const today=new Date();today.setHours(12,0,0,0);
  const thisStart=weekStartOf(today);
  const lastStart=new Date(thisStart);lastStart.setDate(lastStart.getDate()-7);
  const lastWeekXP=weeklyXP(lastStart);
  const rivalTarget=Math.max(70,Math.round(lastWeekXP*1.1));
  const dayIdx=Math.max(0,Math.min(6,Math.floor((today-thisStart)/86400000)));
  const rivalPace=Math.round(((dayIdx+1)/7)*rivalTarget);
  const myWeekXP=weeklyXP(thisStart);
  return{rivalTarget,rivalPace,myWeekXP};
}
function renderLiga(){
  const r=rivalState();
  $('myScore').textContent=r.myWeekXP;$('rivalScore').textContent=r.rivalPace;
  const max=Math.max(r.myWeekXP,r.rivalPace,r.rivalTarget,1);
  $('duelFill').style.width=Math.min(100,(r.myWeekXP/max*100))+'%';
  const diff=r.myWeekXP-r.rivalPace;const stat=$('duelStatus');
  if(diff>=0){stat.className='duel-status winning';stat.textContent='🟢 NA FRENTE por '+diff+' pts · meta: '+r.rivalTarget;}
  else{stat.className='duel-status behind';stat.textContent='🔴 Atrás por '+Math.abs(diff)+' pts · meta: '+r.rivalTarget;}
  // histórico de carreira
  const ch=$('careerHistory');ch.innerHTML='';
  const career=currentCareer();
  // mês atual
  const curRow=document.createElement('div');curRow.className='career-row';
  curRow.innerHTML=`<div class="cr-month">este mês</div><div class="cr-career">${career.name}</div><div class="cr-xp">${S.xpMonth} XP</div>`;
  ch.appendChild(curRow);
  // meses anteriores
  const hist=S.careerHistory||[];
  if(hist.length===0){const em=document.createElement('div');em.className='empty small';em.style.marginTop='8px';em.textContent='Histórico disponível a partir do próximo mês.';ch.appendChild(em);}
  else{
    hist.slice(0,6).forEach(h=>{
      const row=document.createElement('div');row.className='career-row';
      row.innerHTML=`<div class="cr-month">${h.month}</div><div class="cr-career">${h.careerName}</div><div class="cr-xp">${h.xp} XP</div>`;
      ch.appendChild(row);
    });
  }
  // recordes
  const rec=S.records||{};
  $('records').innerHTML=`
    <div class="rec"><div class="rec-val">${rec.bestStreak||0}</div><div class="rec-label">🔥 Maior seq.</div></div>
    <div class="rec"><div class="rec-val">${rec.bestWeekXP||0}</div><div class="rec-label">🏆 Melhor semana</div></div>
    <div class="rec"><div class="rec-val">${rec.mostFocosInDay||0}</div><div class="rec-label">⚡ Focos/dia</div></div>
    <div class="rec"><div class="rec-val">${rec.totalFocos||0}</div><div class="rec-label">🎯 Total focos</div></div>
    <div class="rec"><div class="rec-val">${rec.rivalWins||0}</div><div class="rec-label">👻 Rival batido</div></div>
    <div class="rec"><div class="rec-val">${Object.keys(S.trophies||{}).length}</div><div class="rec-label">🏅 Troféus</div></div>`;
  // histórico semanal
  const wh=$('weeklyHistory');wh.innerHTML='';
  const weeks=Object.keys(S.weekly||{}).sort().reverse().slice(0,8);
  if(weeks.length===0){wh.innerHTML='<div class="empty small">A primeira rodada fecha no próximo domingo.</div>';return;}
  weeks.forEach(wk=>{const w=S.weekly[wk];const row=document.createElement('div');
    row.className='week-row '+(w.won?'won':'lost');
    row.innerHTML=`<div class="week-date">Semana de ${fmtDate(wk)}</div><div class="week-score">${w.xp} × ${w.rival} ${w.won?'✓':''}</div>`;
    wh.appendChild(row);});
}

/* ── IANAOBRA ── */
function renderObra(){
  const y=S.calYear,m=S.calMonth;
  $('calTitle').textContent=monthName(y,m).toUpperCase();
  const firstDay=new Date(y,m,1).getDay();
  const startOffset=firstDay===0?6:firstDay-1;
  const daysInMonth=new Date(y,m+1,0).getDate();
  const prevDays=new Date(y,m,0).getDate();
  const grid=$('calGrid');grid.innerHTML='';
  const today=todayKey();
  for(let i=0;i<startOffset;i++){const d=document.createElement('div');d.className='cal-day other-month';d.innerHTML=`<div class="cal-day-num">${prevDays-startOffset+1+i}</div>`;grid.appendChild(d);}
  for(let day=1;day<=daysInMonth;day++){
    const k=y+'-'+pad(m+1)+'-'+pad(day);const post=S.obraPosts?.[k];
    const d=document.createElement('div');
    d.className='cal-day'+(k===today?' today':'')+(post?' has-content':'');
    d.dataset.key=k;d.dataset.act='openCalDay';
    const postPreview=post?`<div class="cal-day-dot"></div><div class="cal-day-preview">${esc((post.content||'').slice(0,40))}</div>`:'';
    d.innerHTML=`<div class="cal-day-num">${day}</div>${postPreview}`;
    grid.appendChild(d);
  }
  const rem=(7-(startOffset+daysInMonth)%7)%7;
  for(let i=1;i<=rem;i++){const d=document.createElement('div');d.className='cal-day other-month';d.innerHTML=`<div class="cal-day-num">${i}</div>`;grid.appendChild(d);}
  $('ideasOutput').innerHTML='';
}

/* ── IA ── */
function showLoading(title='Consultando IA…',sub='Aguenta uns segundinhos.'){$('loadingTitle').textContent=title;$('loadingSub').textContent=sub;$('loadingOverlay').classList.add('show');}
function hideLoading(){$('loadingOverlay').classList.remove('show');}

async function callAI(messages,system,max_tokens=1800,use_web_search=false){
  const model=use_web_search?'claude-sonnet-4-5':'claude-haiku-4-5';
  const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages,system,max_tokens,model,use_web_search})});
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||'Erro '+r.status);}
  const data=await r.json();
  if(use_web_search&&data.text_only!=null)return data.text_only;
  return(data.content||[]).map(c=>c.text||'').join('').trim();
}

async function loadDailyReading(){
  showLoading('Buscando liturgia…','Consultando a CNBB e preparando a reflexão.');
  try{
    const r=await fetch('/api/liturgia',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}' });
    if(!r.ok)throw new Error('Erro '+r.status);
    const data=await r.json();
    if(data.error)throw new Error(data.error);
    const today=todayKey();
    S.lastReading={date:today,text:data.text,source:data.source||'ia'};
    persist();
    $('readingContent').innerHTML=formatReading(data.text,data.source);
    checkTrophy('daily_read');
  }catch(e){$('readingContent').innerHTML='<div class="empty small">Erro: '+esc(e.message)+'</div>';}
  finally{hideLoading();}
}

function formatReading(text,source){
  const sourceTag=source==='cnbb'?'<span class="source-tag">✓ Fonte: CNBB</span>':'<span class="source-tag" style="color:var(--neon-yellow);border-color:rgba(255,230,0,.3)">⚠️ Leituras aproximadas — confira em cnbb.org.br</span>';
  const body=text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .split('\n').map(l=>{const t=l.trim();if(!t)return '';
      if(/^(PRIMEIRA LEITURA|EVANGELHO|SALMO|SEGUNDA LEITURA|REFLEXÃO)/i.test(t))return '<h4>'+esc(t)+'</h4>';
      if(/^REFLEXÃO/i.test(t))return '<div class="reflection-block"><h4>'+esc(t)+'</h4>';
      return '<p>'+esc(t)+'</p>';}).join('');
  return `<div>${sourceTag}${body}</div>`;
}
function formatLetter(text){return'<div>'+text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').split('\n').filter(l=>l.trim()).map(l=>'<p>'+esc(l.trim())+'</p>').join('')+'</div>';}

async function generateWeekCard(){
  const recentReflections=[...S.reflections].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7);
  if(recentReflections.length===0){toast('SEM REFLEXÕES','Escreva pelo menos uma reflexão antes.');return;}
  showLoading('Escrevendo carta…','O Frei está lendo suas reflexões da semana.');
  try{
    const reflText=recentReflections.map(r=>`[${fmtDate(r.date)}] ${r.text}`).join('\n\n');
    const statsText=`Sequência: ${S.streak} dias · XP no mês: ${S.xpMonth} · Carreira: ${currentCareer().name}`;
    const intention=S.weekIntention?`\nIntenção anterior: "${S.weekIntention}"`:'';
    const text=await callAI(
      [{role:'user',content:`Reflexões da semana:\n\n${reflText}\n\nSituação no app: ${statsText}${intention}\n\nEscreva uma carta pastoral calorosa, direta e prática como um padre próximo do povo. Apanhado espiritual da semana, algo pra crescer, e intenção simples pra próxima. Máximo 300 palavras.`}],
      'Você é um padre pastoral, próximo do povo, prático e caloroso. Escreve cartas espirituais simples e diretas.');
    S.lastWeekCard=text;persist();
    $('weekCard').innerHTML=formatLetter(text);$('weekCard').dataset.generated='1';
    checkTrophy('week_card');
    setTimeout(()=>openIntentionModal(),1200);
  }catch(e){$('weekCard').innerHTML='<div class="empty small">Erro: '+esc(e.message)+'</div>';}
  finally{hideLoading();}
}

function openIntentionModal(){
  $('formModal').innerHTML=`<h3>💭 Intenção da semana</h3>
    <p>O que você quer cultivar na semana que começa?</p>
    <input id="intentionInput" placeholder="Ex: Ser mais presente com minha filha..." value="${esc(S.weekIntention||'')}">
    <div class="modal-actions">
      <button class="m-close" data-close-form>DEPOIS</button>
      <button class="m-save" id="saveIntentionBtn">SALVAR</button>
    </div>`;
  $('formOverlay').classList.add('show');
  setTimeout(()=>$('intentionInput').focus(),50);
  $('saveIntentionBtn').onclick=()=>{S.weekIntention=$('intentionInput').value.trim();persist();$('formOverlay').classList.remove('show');renderFe();toast('INTENÇÃO SALVA 💭','');};
}

async function generateMonthCard(){
  showLoading('Escrevendo carta do mês…','Lendo toda sua evolução.');
  try{
    const reflections=[...S.reflections].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,14);
    const trophiesEarned=TROPHY_DEFS.filter(t=>(S.trophies||{})[t.id]).map(t=>t.name);
    const mk=curMonthKey();const monthDays=Object.keys(S.history||{}).filter(k=>k.startsWith(mk));
    const activeDays=monthDays.filter(k=>S.history[k].count>0||S.history[k].focos>0).length;
    const reflText=reflections.length>0?reflections.map(r=>`[${fmtDate(r.date)}] ${r.text}`).join('\n\n'):'Nenhuma reflexão escrita este mês.';
    const text=await callAI(
      [{role:'user',content:`Carta mensal de balanço.\n\nNúmeros do mês:\n- XP: ${S.xpMonth}\n- Dias ativos: ${activeDays}\n- Sequência: ${S.streak} dias\n- Carreira atual: ${currentCareer().name}\n- Focos: ${S.records.totalFocos||0}\n- Troféus: ${trophiesEarned.length>0?trophiesEarned.join(', '):'Nenhum ainda'}\n\nReflexões:\n${reflText}\n\nCarta pastoral de fim de mês: celebre o que foi bom, aponte o que pode melhorar, proponha intenção pro próximo mês. Tom caloroso, direto. Máximo 400 palavras.`}],
      'Você é um padre pastoral que escreve cartas espirituais mensais de balanço e crescimento pessoal.');
    S.lastMonthCard=text;persist();
    $('monthCard').innerHTML=formatLetter(text);$('monthCard').dataset.generated='1';
    checkTrophy('month_card');
  }catch(e){$('monthCard').innerHTML='<div class="empty small">Erro: '+esc(e.message)+'</div>';}
  finally{hideLoading();}
}

async function loadMatches(){
  const btn=$('refreshMatches');if(btn)btn.textContent='⏳';
  showLoading('Buscando jogos de hoje…','Pesquisando na web.');
  try{
    const today=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const text=await callAI(
      [{role:'user',content:`Pesquise na web e liste TODOS os jogos de futebol que acontecem HOJE (${today}) nos campeonatos: Brasileirão Série A, Libertadores, Sul-Americana, Copa do Mundo FIFA, Premier League, La Liga, Champions League, e jogos do Corinthians. Retorne APENAS JSON válido:\n[{"home":"Time A","away":"Time B","league":"Campeonato","time":"19:00","live":false}]\nSe não houver jogos: []`}],
      'Você é assistente esportivo. Retorne apenas JSON válido.',1200,true);
    let matches=[];
    try{const clean=text.replace(/```json?|```/g,'').trim();const m=clean.match(/\[[\s\S]*\]/);matches=m?JSON.parse(m[0]):[];}catch(e){matches=[];}
    S.matchesCache={date:todayKey(),data:matches};persist();
    showMatches(matches);
    if(!S.matchesCollapsed){$('matchesBody').style.display='block';}
  }catch(e){$('matchesList').innerHTML='<div class="empty small">Erro: '+esc(e.message)+'</div>';}
  finally{hideLoading();if(btn)btn.textContent='↻';}
}

async function generateIdeas(){
  const cfg=S.obraConfig||{};if(!cfg.about){openObraConfig(true);return;}
  showLoading('Gerando ideias…','IA pensando em conteúdo pra obra.');
  try{
    const postsFeitos=Object.values(S.obraPosts||{}).filter(p=>p.posted).length;
    const lastPostsText=cfg.lastPosts?'\n\nÚltimos posts:\n'+cfg.lastPosts:'';
    const text=await callAI(
      [{role:'user',content:`Sou criador do IAnaObra no Instagram. Público: engenheiros/profissionais da construção civil 30-45 anos que querem usar IA no dia a dia de obra e pessoal. Tom: didático, prático, como colega de profissão.\n\nContexto: ${cfg.about}${lastPostsText}\n\nPubliquei ${postsFeitos} posts. Me dê 5 ideias criativas. Para cada: título chamativo, formato (carrossel/reels/story), 2 linhas de desenvolvimento. Retorne APENAS JSON: [{"title":"...","format":"...","body":"..."}]`}],
      'Você é estrategista de conteúdo para Instagram focado em construção civil e IA.',1400);
    let ideas=[];
    try{const clean=text.replace(/```json?|```/g,'').trim();const m=clean.match(/\[[\s\S]*\]/);ideas=m?JSON.parse(m[0]):[];}catch(e){ideas=[];}
    const out=$('ideasOutput');
    if(ideas.length===0){out.innerHTML='<div class="empty small">Não consegui gerar ideias. Tente novamente.</div>';return;}
    out.innerHTML=ideas.map(idea=>`<div class="idea-card">
      <div class="idea-title">${esc(idea.title||'')}</div>
      <div class="idea-body">${esc(idea.body||'')}</div>
      <div class="idea-format">📱 ${esc(idea.format||'')}</div>
    </div>`).join('');
  }catch(e){$('ideasOutput').innerHTML='<div class="empty small">Erro: '+esc(e.message)+'</div>';}
  finally{hideLoading();}
}

/* ── LEVEL UP ── */
function showLevelUp(career){
  $('levelupCareer').textContent=career.name+' · '+career.club;
  $('levelupAvatar').innerHTML=buildAvatar(career.id);
  $('levelupOverlay').style.display='flex';
}

/* ── AÇÕES ── */
function toggle(kind,id,el){
  const t=todayKey();
  if(kind==='task'){
    const tk=S.tasks.find(x=>x.id===id);if(!tk)return;
    const wasNotDone=!tk.done;tk.done=!tk.done;
    if(tk.done&&wasNotDone){
      const rescue=taskIsRescue(tk);const xpVal=taskXP(tk);
      const res=addXP(xpVal);celebrate(el,res);let earned=res.gained;
      if(rescue){const r2=addXP(XP.resgate,true);earned+=r2.gained;
        S.records.rescues=(S.records.rescues||0)+1;
        checkTrophy('rescue_1');if(S.records.rescues>=5)checkTrophy('rescue_5');
        setTimeout(()=>toast('LIMPEZA DE BACKLOG! 🧹','+'+XP.resgate+' pts de resgate'),900);}
      tk.doneDate=todayKey();tk.xpEarned=earned;tk.wasRescue=rescue;
      checkTrophy('first_task');registerProgress('item');
    }
  }else if(kind==='habit'){
    const hb=S.habits.find(x=>x.id===id);if(!hb)return;
    hb.doneDates=hb.doneDates||[];
    if(hb.doneDates.includes(t)){hb.doneDates=hb.doneDates.filter(x=>x!==t);}
    else{hb.doneDates.push(t);celebrate(el,addXP(XP.habit));registerProgress('item');
      const streak7=countConsecutiveDates(hb.doneDates);
      if(streak7>=7)checkTrophy('habit_7');}
  }
  persist();render();
}
function countConsecutiveDates(dates){
  if(!dates||dates.length===0)return 0;
  const sorted=[...dates].sort().reverse();let c=1;
  for(let i=1;i<sorted.length;i++){if(daysBetween(sorted[i],sorted[i-1])===1)c++;else break;}
  return c;
}
function del(kind,id){
  if(kind==='task')S.tasks=S.tasks.filter(x=>x.id!==id);
  else S.habits=S.habits.filter(x=>x.id!==id);
  persist();render();
}
function addItem(){
  const inp=$('addInput');const v=inp.value.trim();if(!v)return;
  if(S.addMode==='task')S.tasks.unshift({id:'t'+Date.now(),name:v,done:false,date:todayKey()});
  else S.habits.unshift({id:'h'+Date.now(),name:v,icon:'🔁',sub:'Hábito diário',doneDates:[]});
  inp.value='';persist();render();inp.focus();
}
function saveReflection(){
  const text=$('reflectInput').value.trim();if(!text){toast('VAZIO','Escreve algo primeiro.');return;}
  const today=todayKey();
  S.reflections=S.reflections.filter(r=>r.date!==today);
  S.reflections.push({date:today,text});persist();renderFe();
  toast('REFLEXÃO SALVA ✍️','');checkTrophy('reflect_1');checkTrophy('reflect_7');
}
function openCalDay(k){
  const post=S.obraPosts?.[k]||{content:'',posted:false};
  const[y,m,d]=k.split('-');
  $('formModal').innerHTML=`<h3>📅 ${d}/${m}/${y}</h3>
    <label>Conteúdo planejado / executado</label>
    <textarea id="calContent" rows="4">${esc(post.content||'')}</textarea>
    <div style="display:flex;align-items:center;gap:10px;margin-top:12px;">
      <input type="checkbox" id="calPosted" ${post.posted?'checked':''} style="width:auto;accent-color:var(--neon-green)">
      <label style="margin:0;text-transform:none;font-size:14px">Post já publicado ✓</label>
    </div>
    <div class="modal-actions"><button class="m-close" data-close-form>CANCELAR</button><button class="m-save" id="saveCalBtn">SALVAR</button></div>`;
  $('formOverlay').classList.add('show');
  setTimeout(()=>$('calContent').focus(),50);
  $('saveCalBtn').onclick=()=>{
    const content=$('calContent').value.trim();const posted=$('calPosted').checked;
    if(!S.obraPosts)S.obraPosts={};
    if(content){S.obraPosts[k]={content,posted};
      const cnt=Object.keys(S.obraPosts).length;
      if(cnt>=5)checkTrophy('obra_5');if(cnt>=20)checkTrophy('obra_20');}
    else delete S.obraPosts[k];
    persist();$('formOverlay').classList.remove('show');renderObra();
  };
}
function openObraConfig(fromIdeas=false){
  const cfg=S.obraConfig||{};
  $('formModal').innerHTML=`<h3>🧱 Configurar IAnaObra</h3>
    ${fromIdeas?'<p style="color:var(--neon-yellow)">Configure seu canal primeiro.</p>':''}
    <label>Sobre o canal</label>
    <textarea id="cfgAbout" rows="4" placeholder="Objetivo, diferenciais, tom de voz...">${esc(cfg.about||'')}</textarea>
    <label>Últimos 5 posts que funcionaram</label>
    <textarea id="cfgLast" rows="3" placeholder="Temas, títulos...">${esc(cfg.lastPosts||'')}</textarea>
    <div class="modal-actions"><button class="m-close" data-close-form>CANCELAR</button><button class="m-save" id="saveCfgBtn">SALVAR</button></div>`;
  $('formOverlay').classList.add('show');
  $('saveCfgBtn').onclick=()=>{
    S.obraConfig={...(S.obraConfig||{}),about:$('cfgAbout').value.trim(),lastPosts:$('cfgLast').value.trim()};
    persist();$('formOverlay').classList.remove('show');
    if(fromIdeas)setTimeout(generateIdeas,200);
  };
}

/* ── SYNC MODAL ── */
function openSync(){$('myCode').textContent=Store.code();$('syncNote').innerHTML=Store.online()?'Guarde seu código.':'⚠️ Sync desligado.';$('overlay').classList.add('show');}
function closeSync(){$('overlay').classList.remove('show');}
async function linkCode(){const v=$('codeInput').value.trim().toUpperCase();if(!v)return;
  if(!Store.online()){toast('SYNC DESLIGADO','');return;}
  Store.setCode(v);setStatus('sync');
  const remote=await Store.pull();
  if(remote){S=Object.assign(S,remote);S.showAll=false;S.addMode='task';S.view='hoje';
    Store.saveLocal(remote);go('hoje');closeSync();toast('CONECTADO 🔗','');setStatus('ok');}
  else{persist();closeSync();toast('CÓDIGO VINCULADO','');}}

/* ── FX ── */
function setStatus(k){const el=$('status');if(!el)return;el.className='status '+(k==='ok'?'ok':k==='sync'?'sync':'off');el.textContent=k==='ok'?'☁️ sincronizado':k==='sync'?'⏳ salvando…':'📴 local';}
function toast(title,sub){const el=$('toast');el.innerHTML=esc(title)+(sub?'<small>'+esc(sub)+'</small>':'');el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2600);}
function celebrate(el,res){if(!el)return;const r=el.getBoundingClientRect();
  for(let i=0;i<5;i++){const c=document.createElement('div');c.className='coin';c.textContent=Math.random()<.5?'⚽':'⭐';
    c.style.left=(r.left+r.width/2-12+(Math.random()*40-20))+'px';c.style.top=(r.top-8)+'px';c.style.animationDelay=(i*.05)+'s';
    document.body.appendChild(c);setTimeout(()=>c.remove(),1100);}
  if(!res.surprise)toast('+'+res.gained+' PTS','⚽');}

/* ── EVENTOS ── */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');
  if(a){const{act,kind,id}=a.dataset;
    if(act==='toggle')toggle(kind,id,a.closest('.card'));
    else if(act==='del')del(kind,id);
    else if(act==='openCalDay')openCalDay(a.dataset.key);
    return;}
  const tab=e.target.closest('.tab');
  if(tab){S.addMode=tab.dataset.mode;
    document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===tab));
    $('addInput').placeholder=S.addMode==='task'?'Ex: Emitir relatório semanal':'Ex: Tomar suplemento';
    $('addBtn').className='btn'+(S.addMode==='habit'?' pink':'');return;}
  const bn=e.target.closest('.bnav-btn');if(bn){go(bn.dataset.view);return;}
  if(e.target.matches('[data-close-form]')||e.target===$('formOverlay'))$('formOverlay').classList.remove('show');
});
$('addBtn').addEventListener('click',addItem);
$('addInput').addEventListener('keydown',e=>{if(e.key==='Enter')addItem();});
$('moreBtn').addEventListener('click',()=>{S.showAll=!S.showAll;renderToday();});
$('gearBtn').addEventListener('click',openSync);
$('closeBtn').addEventListener('click',closeSync);
$('linkBtn').addEventListener('click',linkCode);
$('copyBtn').addEventListener('click',()=>navigator.clipboard.writeText(Store.code()).then(()=>toast('COPIADO ✅','')));
$('loadReadingBtn').addEventListener('click',loadDailyReading);
$('saveReflectBtn').addEventListener('click',saveReflection);
$('weekCardBtn').addEventListener('click',generateWeekCard);
$('monthCardBtn').addEventListener('click',generateMonthCard);
$('refreshMatches').addEventListener('click',()=>{S.matchesCache={date:'',data:[]};persist();loadMatches();});
$('ideasBtn').addEventListener('click',generateIdeas);
$('obraConfigBtn').addEventListener('click',()=>openObraConfig(false));
$('calPrev').addEventListener('click',()=>{S.calMonth--;if(S.calMonth<0){S.calMonth=11;S.calYear--;}renderObra();});
$('calNext').addEventListener('click',()=>{S.calMonth++;if(S.calMonth>11){S.calMonth=0;S.calYear++;}renderObra();});
$('levelupClose').addEventListener('click',()=>{$('levelupOverlay').style.display='none';});
// colapsar/expandir jogos
$('matchesToggle').addEventListener('click',e=>{
  if(e.target.closest('#refreshMatches'))return; // não colapsa ao clicar em refresh
  S.matchesCollapsed=!S.matchesCollapsed;
  const body=$('matchesBody');
  body.style.display=S.matchesCollapsed?'none':'block';
  $('matchesArrow').classList.toggle('up',S.matchesCollapsed);
});

/* ── BOOT ── */
(async function init(){
  Store.init();
  const local=Store.loadLocal();
  if(local)S=Object.assign(S,local);
  // garante campos novos
  S.history=S.history||{};S.weekly=S.weekly||{};S.trophies=S.trophies||{};
  S.reflections=S.reflections||[];S.obraPosts=S.obraPosts||{};
  S.obraConfig=S.obraConfig||{about:'',lastPosts:''};
  S.matchesCache=S.matchesCache||{date:'',data:[]};
  S.records=Object.assign({bestStreak:0,bestWeekXP:0,mostFocosInDay:0,totalFocos:0,rivalWins:0,rescues:0},S.records||{});
  S.xpMonth=S.xpMonth||0;S.totalXpEver=S.totalXpEver||S.xp||0;
  S.careerHistory=S.careerHistory||[];
  S.lastReading=S.lastReading||null;
  S.lastWeekCard=S.lastWeekCard||null;S.lastMonthCard=S.lastMonthCard||null;
  delete S.projects;delete S.rewards;
  S.showAll=false;S.addMode='task';S.view='hoje';
  S.calYear=new Date().getFullYear();S.calMonth=new Date().getMonth();
  S.matchesCollapsed=false;
  setStatus(Store.online()?'sync':'off');render();

  if(Store.online()){
    const remote=await Store.pull();
    if(remote&&(remote._updatedAt||0)>(S._updatedAt||0)){
      S=Object.assign(S,remote);
      S.history=S.history||{};S.weekly=S.weekly||{};S.trophies=S.trophies||{};
      S.reflections=S.reflections||[];S.obraPosts=S.obraPosts||{};
      S.obraConfig=S.obraConfig||{about:'',lastPosts:''};
      S.matchesCache=S.matchesCache||{date:'',data:[]};
      S.records=Object.assign({bestStreak:0,bestWeekXP:0,mostFocosInDay:0,totalFocos:0,rivalWins:0,rescues:0},S.records||{});
      S.xpMonth=S.xpMonth||0;S.totalXpEver=S.totalXpEver||S.xp||0;
      S.careerHistory=S.careerHistory||[];
      S.lastReading=S.lastReading||null;
      S.lastWeekCard=S.lastWeekCard||null;S.lastMonthCard=S.lastMonthCard||null;
      delete S.projects;delete S.rewards;
      S.showAll=false;S.addMode='task';S.view='hoje';
      Store.saveLocal(remote);
    }
    setStatus('ok');
  }

  if(!S._seededHabits&&S.habits.length===0){
    S.habits.push({id:'h0',name:'Tomar Venvanse',icon:'💊',sub:'07:00 · pico vem aí',doneDates:[]});
    S._seededHabits=true;
  }

  pruneOldTasks();
  rollover();
  checkAllTrophies();
  persist();render();

  if(pendingMsg){setTimeout(()=>{
    if(pendingMsg.type==='shield')toast('ESCUDO ATIVADO 🛡️','Sequência preservada!');
    if(pendingMsg.type==='reset')toast('NOVO JOGO 🟢','Bata o mínimo hoje e volte a embalar.');
  },600);}

  // mostra leitura do dia se já foi buscada hoje
  if(S.lastReading&&S.lastReading.date===todayKey()){
    $('readingContent').innerHTML=formatReading(S.lastReading.text,S.lastReading.source);
  }

  setInterval(()=>{if(S.view==='hoje'){renderContext();renderDayResume();}},60000);
})();
