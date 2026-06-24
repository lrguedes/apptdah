/* ============================================================
   FOCO ARENA v2.3
   ============================================================ */

/* ── CARREIRA ── */
const CAREER=[
  {id:'escolinha',  name:'ESCOLINHA',        club:'Dando os primeiros toques',   need:0},
  {id:'sub15',      name:'SUB-15',           club:'Categoria de base',           need:100},
  {id:'sub20',      name:'SUB-20',           club:'Promessa do futebol',         need:250},
  {id:'profissional',name:'PROFISSIONAL',    club:'Contrato assinado',           need:450},
  {id:'corinthians',name:'TITULAR DO TIMÃO', club:'Corinthians • Série A',       need:700},
  {id:'selecao',    name:'SELEÇÃO BRASILEIRA',club:'Convocado pela CBF',         need:1000},
  {id:'porto',      name:'FC PORTO',         club:'Champions League',            need:1400},
  {id:'city',       name:'MANCHESTER CITY',  club:'Premier League',              need:1800},
  {id:'madrid',     name:'REAL MADRID',      club:'La Liga • Bernabéu',          need:2400},
  {id:'ballon',     name:"BALLON D'OR 🏆",   club:'Melhor do mundo',             need:3200},
];

/* ── DESAFIOS ── */
const CHALLENGES=[
  {id:'campo_limpo',  name:'Semana Campo Limpo',     desc:'Bata o mínimo todos os dias',         goal:7,  type:'streak_days', xpBonus:50},
  {id:'contra_ataque',name:'Semana do Contra-Ataque',desc:'Resgate 2 tarefas esquecidas (+5d)',  goal:2,  type:'rescues',      xpBonus:60},
  {id:'camisa10',     name:'Camisa 10 da Obra',      desc:'5 posts no IAnaObra esta semana',     goal:5,  type:'obra_posts',   xpBonus:70},
  {id:'foco_total',   name:'Semana Foco Total',      desc:'Complete 5 blocos de foco',           goal:5,  type:'focos',        xpBonus:55},
  {id:'sem_atraso',   name:'Sem Atrasos',            desc:'Zero tarefas atrasadas no fim',       goal:1,  type:'no_decay',     xpBonus:45},
  {id:'hat_trick',    name:'Hat-Trick da Semana',    desc:'Complete 3 tarefas no mesmo dia',     goal:3,  type:'same_day',     xpBonus:40},
  {id:'rotina_pai',   name:'Modo Pai em Campo',      desc:'Registre presença com M.Clara 3x',    goal:3,  type:'pai_days',     xpBonus:65},
  {id:'missa_digital',name:'Semana da Reflexão',     desc:'Escreva reflexão 3 vezes',            goal:3,  type:'reflection',   xpBonus:50},
];

/* ── TROFÉUS ── */
const TROPHY_DEFS=[
  // conquistas básicas
  {id:'first_task',   icon:'🎯', name:'Primeira Jogada',    desc:'Completou sua primeira tarefa',         check:s=>s.tasks.filter(t=>t.done).length>=1},
  // streak
  {id:'streak_3',     icon:'🔥', name:'Triênio',            desc:'3 dias de sequência',                   check:s=>s.streak>=3},
  {id:'streak_5',     icon:'⚡', name:'Semana Sólida',      desc:'5 dias consecutivos',                   check:s=>s.streak>=5},
  {id:'streak_7',     icon:'🏅', name:'Semana Invicta',     desc:'7 dias consecutivos',                   check:s=>s.streak>=7},
  {id:'streak_10',    icon:'💥', name:'Dez em Campo',       desc:'10 dias sem parar',                     check:s=>s.streak>=10},
  {id:'streak_14',    icon:'🥇', name:'Quinzena de Ferro',  desc:'14 dias consecutivos',                  check:s=>s.streak>=14},
  {id:'streak_21',    icon:'🔱', name:'Invicto do Mês',     desc:'21 dias consecutivos',                  check:s=>s.streak>=21},
  {id:'streak_30',    icon:'👑', name:'Mês Perfeito',       desc:'30 dias consecutivos',                  check:s=>s.streak>=30},
  // XP
  {id:'xp_100',       icon:'💯', name:'Cem Pontos',         desc:'100 XP lifetime',                       check:s=>(s.totalXpEver||0)>=100},
  {id:'xp_500',       icon:'💎', name:'Quinhentos',         desc:'500 XP lifetime',                       check:s=>(s.totalXpEver||0)>=500},
  {id:'xp_1000',      icon:'🌟', name:'Milhar',             desc:'1000 XP lifetime',                      check:s=>(s.totalXpEver||0)>=1000},
  {id:'xp_2000',      icon:'🚀', name:'Dois Mil',           desc:'2000 XP lifetime',                      check:s=>(s.totalXpEver||0)>=2000},
  // rival
  {id:'rival_win',    icon:'👻', name:'Caça-Fantasma',      desc:'Venceu o Rival Fantasma uma vez',       check:s=>(s.records.rivalWins||0)>=1},
  {id:'rival_3',      icon:'🏆', name:'Exterminador',       desc:'3 vitórias contra o Rival',             check:s=>(s.records.rivalWins||0)>=3},
  {id:'rival_series', icon:'🔥', name:'Série Invicta',      desc:'3 semanas seguidas vencendo o Rival',   check:s=>(s.records.rivalWins||0)>=3},
  // reflexão e fé
  {id:'reflect_1',    icon:'✍️', name:'Primeira Reflexão',  desc:'Primeira reflexão de fé',               check:s=>(s.reflections||[]).length>=1},
  {id:'reflect_3',    icon:'📝', name:'Semana Reflexiva',   desc:'3 reflexões escritas',                  check:s=>(s.reflections||[]).length>=3},
  {id:'reflect_7',    icon:'📖', name:'Diário Fiel',        desc:'7 reflexões escritas',                  check:s=>(s.reflections||[]).length>=7},
  {id:'reflect_30',   icon:'🙏', name:'Trimestre de Fé',    desc:'30 reflexões escritas',                 check:s=>(s.reflections||[]).length>=30},
  {id:'versiculo_1',  icon:'✨', name:'Versículo na Alma',  desc:'Primeiro versículo salvo',              check:s=>!!(s.versiculos&&s.versiculos.length>0)},
  {id:'week_card',    icon:'💌', name:'Carta do Frei',      desc:'Gerou a carta semanal',                 check:s=>!!(s.lastWeekCard)},
  {id:'month_card',   icon:'📜', name:'Carta do Mês',       desc:'Gerou a carta mensal',                  check:s=>!!(s.lastMonthCard)},
  // IAnaObra
  {id:'obra_5',       icon:'📸', name:'Criador',            desc:'5 posts no IAnaObra',                   check:s=>Object.keys(s.obraPosts||{}).length>=5},
  {id:'obra_20',      icon:'📲', name:'Influência em Obra', desc:'20 posts no calendário',                check:s=>Object.keys(s.obraPosts||{}).length>=20},
  {id:'obra_metrica', icon:'📊', name:'Primeira Métrica',   desc:'Primeiro post com dados preenchidos',   check:s=>Object.values(s.obraPosts||{}).some(p=>p.likes||p.comments||p.saves||p.shares)},
  {id:'obra_analista',icon:'🔬', name:'Analista de Conteúdo',desc:'5 posts com métricas registradas',    check:s=>Object.values(s.obraPosts||{}).filter(p=>p.likes||p.comments||p.saves||p.shares).length>=5},
  // resgate
  {id:'rescue_1',     icon:'🧹', name:'Limpeza Geral',      desc:'Resgatou uma tarefa abandonada',        check:s=>(s.records.rescues||0)>=1},
  {id:'rescue_5',     icon:'♻️', name:'Rei do Resgate',     desc:'5 tarefas resgatadas',                  check:s=>(s.records.rescues||0)>=5},
  // pai
  {id:'pai_1',        icon:'💛', name:'Primeira Memória',   desc:'Primeiro dia registrado com M.Clara',   check:s=>(s.paiDates||[]).length>=1},
  {id:'pai_7',        icon:'👨‍👧', name:'Semana com a Menina',desc:'7 dias com Maria Clara',              check:s=>(s.paiDates||[]).length>=7},
  {id:'pai_20',       icon:'❤️', name:'Rotina do Pai',      desc:'20 dias de presença registrados',       check:s=>(s.paiDates||[]).length>=20},
  // desafios
  {id:'challenge_1',  icon:'🏟️', name:'Corintiano de Raiz', desc:'Completou o primeiro desafio da rodada',check:s=>(s.challengesWon||0)>=1},
  {id:'challenge_5',  icon:'🔱', name:'Lenda do Parque',    desc:'5 desafios de rodada vencidos',         check:s=>(s.challengesWon||0)>=5},
  // especiais
  {id:'madrugador',   icon:'🌅', name:'Madrugador',         desc:'Completou uma tarefa antes das 8h',     check:()=>false},
  {id:'coruja',       icon:'🦉', name:'Coruja',             desc:'Completou uma tarefa depois das 22h',   check:()=>false},
  {id:'domingo_prod', icon:'☀️', name:'Domingo Produtivo',  desc:'Bateu o mínimo num domingo',            check:()=>false},
  {id:'fe_e_foco',    icon:'⚖️', name:'Fé e Foco',          desc:'Reflexão + 3 tarefas no mesmo dia',     check:()=>false},
  {id:'artilheiro',   icon:'🥅', name:'Artilheiro do Mês',  desc:'Seu maior XP num único mês',            check:()=>false},
  {id:'ballon_dor',   icon:'🏅', name:"Ballon D'Or",         desc:"Atingiu o nível Ballon D'Or",          check:s=>(s.totalXpEver||0)>=3200},
];

const MOTIV_MSGS=[
  'Bom dia. Uma tarefa de cada vez — qual você ataca primeiro?',
  'Cada checagem é um passo. O campo espera.',
  'Dias de pouco brilho também contam. Começa pelo mais fácil.',
  'Foco não é perfeição. É consistência.',
  'O jogo de hoje começa agora. Bora?',
  'Pequenas vitórias constroem campeonatos.',
  'Sua sequência não se faz sozinha. Mas você faz.',
  'Uma tarefa concluída vale mais que dez planejadas.',
];

/* ── CONFIG ── */
const XP={task:10,habit:10,foco:15,streakBonus:20,ressuscitar:30,resgate:15};
const ESCUDO_CAP=3,VISIBLE_LIMIT=3,TASK_FLOOR=3,TASK_RESGATE_DAYS=5;
const WEEKDAY_MIN=3,WEEKEND_MIN=1;

/* ── ESTADO ── */
let S={
  xp:0,xpMonth:0,totalXpEver:0,monthKey:null,
  streak:0,bestStreak:0,
  escudos:1,escudoWeekKey:null,lastStreakDate:null,
  tasks:[],habits:[],history:{},weekly:{},
  records:{bestStreak:0,bestWeekXP:0,mostFocosInDay:0,totalFocos:0,rivalWins:0,rescues:0},
  lastSettledWeek:null,careerHistory:[],
  trophies:{},challengesWon:0,
  reflections:[],versiculos:[],weekIntention:'',
  lastWeekCard:null,lastMonthCard:null,
  matchesCache:{date:'',data:[]},
  paiDates:[],paiStreak:0,
  currentChallenge:null,challengeStartWeek:null,challengeProgress:{},
  tecnicoSessions:[],
  obraPosts:{},obraConfig:{about:'',lastPosts:''},
  _seededHabits:false,_updatedAt:0,
  showAll:false,addMode:'task',view:'hoje',
  calYear:new Date().getFullYear(),calMonth:new Date().getMonth(),
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
    if(ok){try{sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);online=true;}catch(e){online=false;}}return online;};
  const pull=async()=>{if(!online)return null;try{const{data,error}=await sb.from('foco_arena').select('data').eq('sync_code',getCode()).maybeSingle();if(error)return null;return data?data.data:null;}catch(e){return null;}};
  const push=async s=>{if(!online)return false;try{const{error}=await sb.from('foco_arena').upsert({sync_code:getCode(),data:s,updated_at:new Date().toISOString()});return !error;}catch(e){return false;}};
  return{online:()=>online,code:getCode,setCode,init,loadLocal,pull,saveLocal,
    save(state){saveLocal(state);if(!online){setStatus('off');return;}setStatus('sync');clearTimeout(timer);timer=setTimeout(async()=>{const ok=await push(state);setStatus(ok?'ok':'off');},700);}};
})();

/* ── DATAS ── */
const pad=n=>String(n).padStart(2,'0');
function keyOf(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function todayKey(){return keyOf(new Date());}
function dateFromKey(k){const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d);}
function daysBetween(a,b){return Math.round((dateFromKey(b)-dateFromKey(a))/86400000);}
function isWeekend(){const d=new Date().getDay();return d===0||d===6;}
function isSunday(){return new Date().getDay()===0;}
function weekStartOf(d){const x=new Date(d);x.setHours(0,0,0,0);const day=x.getDay();x.setDate(x.getDate()+(day===0?-6:1-day));return x;}
function weekKeyOf(d=new Date()){return keyOf(weekStartOf(d));}
function weekDates(ws){return Array.from({length:7},(_,i)=>{const x=new Date(ws);x.setDate(x.getDate()+i);return keyOf(x);});}
function fmtDate(k){const d=dateFromKey(k);return pad(d.getDate())+'/'+pad(d.getMonth()+1);}
function curMonthKey(){const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1);}
function monthName(y,m){return new Date(y,m,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});}

/* ── AVATAR ── */
function buildAvatar(careerId){
  const accent=careerId==='corinthians'?'#111':careerId==='selecao'?'#007a3d':
    careerId==='porto'?'#003087':careerId==='city'?'#6cabdd':
    careerId==='madrid'?'#febe10':careerId==='ballon'?'#ffe600':'#00e5ff';
  return `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="11" y="1" width="10" height="10" fill="#f5d5a8"/>
    <rect x="10" y="3" width="1" height="7" fill="#f5d5a8"/><rect x="21" y="3" width="1" height="7" fill="#f5d5a8"/>
    <rect x="11" y="1" width="10" height="2" fill="#4a3000"/>
    <rect x="13" y="5" width="2" height="2" fill="#222"/><rect x="17" y="5" width="2" height="2" fill="#222"/>
    <rect x="14" y="8" width="4" height="1" fill="#c0806a"/>
    <rect x="14" y="11" width="4" height="2" fill="#f5d5a8"/>
    <rect x="9" y="13" width="14" height="11" fill="#e8f4f8"/>
    <rect x="10" y="13" width="2" height="11" fill="${accent}" opacity="0.7"/>
    <rect x="14" y="13" width="2" height="11" fill="${accent}" opacity="0.7"/>
    <rect x="18" y="13" width="2" height="11" fill="${accent}" opacity="0.7"/>
    <rect x="5" y="13" width="4" height="7" fill="#e8f4f8"/><rect x="23" y="13" width="4" height="7" fill="#e8f4f8"/>
    <rect x="5" y="20" width="4" height="2" fill="${accent}" opacity="0.8"/><rect x="23" y="20" width="4" height="2" fill="${accent}" opacity="0.8"/>
    <rect x="5" y="22" width="4" height="2" fill="#f5d5a8"/><rect x="23" y="22" width="4" height="2" fill="#f5d5a8"/>
    <rect x="10" y="24" width="12" height="6" fill="#111"/>
    <rect x="10" y="30" width="5" height="6" fill="#e8f4f8"/><rect x="17" y="30" width="5" height="6" fill="#e8f4f8"/>
    <rect x="10" y="32" width="5" height="1" fill="${accent}" opacity="0.6"/><rect x="17" y="32" width="5" height="1" fill="${accent}" opacity="0.6"/>
    <rect x="9" y="36" width="6" height="3" fill="#222"/><rect x="17" y="36" width="6" height="3" fill="#222"/>
    <rect x="9" y="38" width="7" height="1" fill="#222"/><rect x="16" y="38" width="7" height="1" fill="#222"/>
  </svg>`;
}

/* ── ROLLOVER ── */
let pendingMsg=null;
function rollover(){
  const wk=weekKeyOf();
  if(S.escudoWeekKey!==wk){if(S.escudoWeekKey!==null&&S.escudos<ESCUDO_CAP)S.escudos++;S.escudoWeekKey=wk;}
  if(S.lastStreakDate){const gap=daysBetween(S.lastStreakDate,todayKey());
    if(gap>=2){let missed=gap-1,shield=false;
      while(missed>0&&S.escudos>0){S.escudos--;missed--;shield=true;}
      if(missed>0){S.streak=0;pendingMsg={type:'reset'};}
      else if(shield)pendingMsg={type:'shield'};}}
  const mk=curMonthKey();
  if(S.monthKey&&S.monthKey!==mk){
    const prev=currentCareer();
    S.careerHistory=S.careerHistory||[];
    S.careerHistory.unshift({month:S.monthKey,careerId:prev.id,careerName:prev.name,xp:S.xpMonth});
    if(S.careerHistory.length>12)S.careerHistory=S.careerHistory.slice(0,12);
    S.xpMonth=0;
  }
  S.monthKey=mk;
  const wk2=weekKeyOf();
  if(S.challengeStartWeek!==wk2){
    if(S.currentChallenge&&S.challengeStartWeek){
      const ch=CHALLENGES.find(c=>c.id===S.currentChallenge.id);
      if(ch&&challengeCurrentProgress(ch)>=ch.goal){
        addXP(ch.xpBonus,true);S.challengesWon=(S.challengesWon||0)+1;
        checkTrophy('challenge_1');if(S.challengesWon>=5)checkTrophy('challenge_5');
        toast('DESAFIO VENCIDO! 🏟️','+'+ch.xpBonus+' pts de bônus');
      }
    }
    const idx=Math.floor((new Date(dateFromKey(wk2)).getTime()/86400000/7))%CHALLENGES.length;
    S.currentChallenge=CHALLENGES[idx];S.challengeStartWeek=wk2;
    S.challengeProgress={rescues_start:S.records.rescues||0,focos_start:S.records.totalFocos||0,
      pai_start:(S.paiDates||[]).length,refl_start:(S.reflections||[]).length};
  }
  // sequência do pai
  recalcPaiStreak();
  settleWeeks();
}
function recalcPaiStreak(){
  const dates=(S.paiDates||[]).slice().sort().reverse();
  if(!dates.length){S.paiStreak=0;return;}
  let c=1;
  for(let i=1;i<dates.length;i++){if(daysBetween(dates[i],dates[i-1])===1)c++;else break;}
  S.paiStreak=c;
}
function isWeekendDay(k){const d=dateFromKey(k).getDay();return d===0||d===6;}
function challengeCurrentProgress(ch){
  if(!ch)return 0;
  const p=S.challengeProgress||{};
  const wk=weekKeyOf();const days=weekDates(weekStartOf(new Date()));
  switch(ch.type){
    case 'streak_days':return days.filter(d=>{const h=S.history[d]||{count:0,focos:0};return h.count>=(isWeekendDay(d)?1:3)||h.focos>=1;}).length;
    case 'rescues':return Math.max(0,(S.records.rescues||0)-(p.rescues_start||0));
    case 'obra_posts':return Object.keys(S.obraPosts||{}).filter(k=>k>=days[0]&&k<=days[6]).length;
    case 'focos':return Math.max(0,(S.records.totalFocos||0)-(p.focos_start||0));
    case 'pai_days':return (S.paiDates||[]).filter(d=>d>=days[0]&&d<=days[6]).length;
    case 'reflection':return (S.reflections||[]).filter(r=>r.date>=days[0]&&r.date<=days[6]).length;
    case 'same_day':return days.reduce((m,d)=>Math.max(m,S.history[d]?.count||0),0);
    case 'no_decay':return S.tasks.filter(t=>!t.done&&taskAge(t)>=TASK_RESGATE_DAYS).length===0?1:0;
    default:return 0;
  }
}
function settleWeeks(){
  const curWk=weekKeyOf();if(S.lastSettledWeek===curWk)return;
  if(S.lastSettledWeek){let cur=new Date(dateFromKey(S.lastSettledWeek));
    for(let i=0;i<52;i++){const wkKey=keyOf(weekStartOf(cur));if(wkKey===curWk)break;
      if(!S.weekly[wkKey]){const sums=weeklyXP(weekStartOf(cur));
        const lb=new Date(weekStartOf(cur));lb.setDate(lb.getDate()-7);
        const target=Math.max(70,Math.round(weeklyXP(lb)*1.1));const won=sums>=target;
        S.weekly[wkKey]={xp:sums,rival:target,won,settled:true};
        if(won){S.records.rivalWins=(S.records.rivalWins||0)+1;checkTrophy('rival_win');if(S.records.rivalWins>=3){checkTrophy('rival_3');checkTrophy('rival_series');}}
        if(sums>(S.records.bestWeekXP||0))S.records.bestWeekXP=sums;}
      cur.setDate(cur.getDate()+7);}}
  S.lastSettledWeek=curWk;
}
function dailyMin(){return isWeekend()?WEEKEND_MIN:WEEKDAY_MIN;}
function todayMinimumMet(){const h=S.history[todayKey()]||{count:0,focos:0};return h.count>=dailyMin()||h.focos>=1;}
function registerProgress(type){
  const t=todayKey();if(!S.history[t])S.history[t]={count:0,focos:0,xp:0};
  if(type==='foco'){S.history[t].focos++;S.records.totalFocos=(S.records.totalFocos||0)+1;
    if(S.history[t].focos>(S.records.mostFocosInDay||0))S.records.mostFocosInDay=S.history[t].focos;
  }else{
    S.history[t].count++;
    // troféus especiais por horário
    const h=new Date().getHours();
    if(h<8)checkTrophy('madrugador');
    if(h>=22)checkTrophy('coruja');
    if(isSunday()&&todayMinimumMet())checkTrophy('domingo_prod');
    // fé e foco
    const todayRefl=S.reflections.some(r=>r.date===t);
    if(todayRefl&&S.history[t].count>=3)checkTrophy('fe_e_foco');
  }
  if(todayMinimumMet()&&S.lastStreakDate!==t){
    S.streak++;if(S.streak>S.bestStreak)S.bestStreak=S.streak;
    if(S.streak>S.records.bestStreak)S.records.bestStreak=S.streak;
    S.lastStreakDate=t;addXP(XP.streakBonus,true);
    setTimeout(()=>toast('SEQUÊNCIA MANTIDA! 🔥','+'+XP.streakBonus+' pts · '+S.streak+' dias invicto'),700);
    checkTrophy('streak_3');checkTrophy('streak_5');checkTrophy('streak_7');
    checkTrophy('streak_10');checkTrophy('streak_14');checkTrophy('streak_21');checkTrophy('streak_30');
    setTimeout(renderCampoLimpo,1000);
  }
}

/* ── XP ── */
function addXP(amount,silent){
  let mult=1,surprise=null;
  if(!silent){const r=Math.random();if(r<0.05){mult=3;surprise='HAT-TRICK! 3x ⚽⚽⚽';}else if(r<0.20){mult=2;surprise='BÔNUS SURPRESA! 2x ⚡';}}
  const prevCareer=currentCareer();
  const gained=amount*mult;
  S.xp+=gained;S.xpMonth+=gained;S.totalXpEver+=gained;
  const t=todayKey();if(!S.history[t])S.history[t]={count:0,focos:0,xp:0};
  S.history[t].xp=(S.history[t].xp||0)+gained;
  if(surprise)toast(surprise,'+'+gained+' pts');
  if(currentCareer().id!==prevCareer.id)setTimeout(()=>showLevelUp(currentCareer()),800);
  checkTrophy('xp_100');checkTrophy('xp_500');checkTrophy('xp_1000');checkTrophy('xp_2000');checkTrophy('ballon_dor');
  // artilheiro do mês
  if(S.xpMonth>(S.records.bestMonthXP||0)){S.records.bestMonthXP=S.xpMonth;checkTrophy('artilheiro');}
  return{gained,surprise};
}
function currentCareer(){let idx=0;for(let i=0;i<CAREER.length;i++)if(S.totalXpEver>=CAREER[i].need)idx=i;return CAREER[idx];}
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
  toast('TROFÉU DESBLOQUEADO! 🏆',def.icon+' '+def.name);persist();
}
function checkAllTrophies(){TROPHY_DEFS.forEach(d=>{if(!S.trophies[d.id]&&d.check&&d.check(S))checkTrophy(d.id);});}
function pruneOldTasks(){S.tasks=S.tasks.filter(t=>{if(!t.done||!t.doneDate)return true;return daysBetween(t.doneDate,todayKey())<3;});}

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

/* ── HELPERS ── */
const $=id=>document.getElementById(id);
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function formatLetter(text){return'<div>'+text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').split('\n').filter(l=>l.trim()).map(l=>'<p>'+esc(l.trim())+'</p>').join('')+'</div>';}

/* ── RENDER MASTER ── */
function render(){
  renderHUD();renderContext();renderTecnicoBtn();
  if(S.view==='hoje'){renderToday();renderMatches();renderDayResume();}
  if(S.view==='fe')renderFe();
  if(S.view==='trofeus')renderTrofeus();
  if(S.view==='liga')renderLiga();
  if(S.view==='ianaobra')renderObra();
}

function renderHUD(){
  const career=currentCareer();const nextCareer=CAREER[CAREER.indexOf(career)+1];
  $('avatarWrap').innerHTML=buildAvatar(career.id);
  $('playerCareer').textContent=career.name;$('playerClub').textContent=career.club;
  $('streakNum').textContent=S.streak;
  if(nextCareer){const base=career.need,span=nextCareer.need-base,prog=Math.min(span,S.totalXpEver-base);
    $('fill').style.width=Math.max(4,(prog/span*100))+'%';
    $('playerXpLabel').textContent=(S.totalXpEver-base)+' / '+span+' XP p/ '+nextCareer.name;}
  else{$('fill').style.width='100%';$('playerXpLabel').textContent="BALLON D'OR CONQUISTADO 🏆";}
  $('escudos').innerHTML='<span class="sh">🛡️</span> '+S.escudos+' escudo'+(S.escudos!==1?'s':'')+' <span style="opacity:.5">(máx '+ESCUDO_CAP+')</span>';
  $('xpMonth').textContent='📅 '+S.xpMonth+' XP';$('lifetime').textContent='⭐ '+S.totalXpEver+' total';
  const ch=S.currentChallenge;const banner=$('challengeBanner');
  if(ch){const prog=challengeCurrentProgress(ch);banner.style.display='block';
    $('challengeName').textContent=ch.name+' — '+ch.desc;
    $('challengeProgress').textContent=prog+' / '+ch.goal+(prog>=ch.goal?' ✅ COMPLETO!':' · +'+ch.xpBonus+' pts ao completar');}
  else banner.style.display='none';
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
function renderTecnicoBtn(){$('tecnicoBtn').style.display=(isSunday()&&new Date().getHours()>=18)?'block':'none';}

/* ── HOJE ── */
function renderToday(){
  const h=new Date().getHours();const mb=$('motivBox');
  if(h>=6&&h<22){const msg=MOTIV_MSGS[new Date().getDay()%MOTIV_MSGS.length];
    const total=S.tasks.filter(t=>!t.done).length+S.habits.filter(h=>!(h.doneDates||[]).includes(todayKey())).length;
    mb.innerHTML=`<span class="motiv-tag">HOJE</span>${msg}${total>0?' Você tem <b>'+total+' '+(total===1?'item':'itens')+'</b> na escalação.':''}`;
    mb.classList.add('show');}
  else mb.classList.remove('show');
  // Modo Pai (17h–21h)
  const paiCard=$('paiCard');
  if(h>=17&&h<21){
    paiCard.style.display='block';
    const todayMarked=(S.paiDates||[]).includes(todayKey());
    $('markPaiBtn').textContent=todayMarked?'✓ Presença registrada':'✓ Fui presente hoje';
    $('markPaiBtn').style.opacity=todayMarked?'.6':'1';
    const ps=S.paiStreak||0;
    $('paiStreak').innerHTML=ps>1?'🔥 '+ps+' dias seguidos':'💛 '+((S.paiDates||[]).length)+' dias total';
    $('paiSub').textContent=todayMarked?'Presença registrada hoje ✓':'17h–19h · tempo de presença';
  }else paiCard.style.display='none';
  // itens
  const items=getTodayItems();const list=$('todayList');list.innerHTML='';
  const min=dailyMin();const doneCount=items.filter(i=>i.done).length;
  $('goalChip').textContent=doneCount+' / '+min+' mín';
  if(items.length===0){list.innerHTML='<div class="empty">Escalação vazia 👇</div>';$('moreBtn').style.display='none';return;}
  const shown=S.showAll?items:items.slice(0,VISIBLE_LIMIT);
  shown.forEach((it,i)=>{
    const cls=it.kind==='habit'?'hab':'task';
    const ageCls=it.rescue?' age-rescue':(it.age>=2)?' age-aging':'';
    const c=document.createElement('div');c.className='card '+cls+ageCls+(it.done?' done':'');
    c.style.animationDelay=(i*0.04)+'s';
    c.innerHTML=`<div class="check" data-act="toggle" data-kind="${it.kind}" data-id="${it.id}">✓</div>
      <div class="ic-emoji">${it.icon}</div>
      <div class="body"><div class="name">${esc(it.name)}</div><div class="sub">${esc(it.sub)}</div></div>
      <div class="xptag">+${it.xp}</div>
      <button class="del" data-act="del" data-kind="${it.kind}" data-id="${it.id}">✕</button>`;
    list.appendChild(c);
  });
  const hidden=items.length-VISIBLE_LIMIT;const mb2=$('moreBtn');
  if(hidden>0||S.showAll){mb2.style.display='block';mb2.textContent=S.showAll?'▲ recolher':'▼ ver mais '+hidden;}
  else mb2.style.display='none';
}
function getTodayItems(){
  const t=todayKey();const items=[];
  S.habits.forEach(h=>items.push({kind:'habit',id:h.id,name:h.name,icon:h.icon||'🔁',
    sub:h.sub||'Hábito diário',done:(h.doneDates||[]).includes(t),xp:XP.habit}));
  S.tasks.forEach(tk=>{
    if(tk.done){const earned=tk.xpEarned!=null?tk.xpEarned:XP.task;
      items.push({kind:'task',id:tk.id,name:tk.name,icon:'🎯',
        sub:tk.wasRescue?'🧹 Resgatada · rendeu '+earned+' pts':'Concluída ✓',done:true,xp:earned,age:0,rescue:false});}
    else{const age=taskAge(tk);const xp=taskXP(tk);const rescue=taskIsRescue(tk);
      let sub='Tarefa do dia';
      if(rescue)sub='🔥 '+age+' dias parada · resgate +'+XP.resgate;
      else if(age>=2)sub=age+' dias parada · -'+(XP.task-xp)+' pts';
      else if(age===1)sub='1 dia parada · -1 pt';
      items.push({kind:'task',id:tk.id,name:tk.name,icon:'🎯',sub,done:false,xp,age,rescue});}
  });
  items.sort((a,b)=>(a.done?1:0)-(b.done?1:0));return items;
}
function renderCampoLimpo(){
  if(!todayMinimumMet())return;const list=$('todayList');
  if(list.querySelector('.campo-limpo'))return;
  const cl=document.createElement('div');cl.className='campo-limpo';
  cl.innerHTML=`<span class="cl-icon">✅</span><div class="cl-title">CAMPO LIMPO!</div><div class="cl-sub">Mínimo do dia batido · sequência mantida</div>`;
  list.insertBefore(cl,list.firstChild);
}
function renderDayResume(){
  const h=new Date().getHours();const box=$('dayResume');
  if(h<21){box.style.display='none';return;}
  const t=todayKey();const hst=S.history[t]||{count:0,focos:0,xp:0};
  box.style.display='block';
  box.innerHTML=`<div class="day-resume"><h3>📊 BALANÇO DO DIA</h3><div class="stats">
    <div class="stat"><div class="stat-val">${hst.count}</div><div class="stat-label">tarefas</div></div>
    <div class="stat"><div class="stat-val">${hst.focos||0}</div><div class="stat-label">focos</div></div>
    <div class="stat"><div class="stat-val">${hst.xp||0}</div><div class="stat-label">pts hoje</div></div>
    <div class="stat"><div class="stat-val">${S.streak}</div><div class="stat-label">sequência</div></div>
  </div></div>`;
}
function renderMatches(){
  const body=$('matchesBody');
  if(S.matchesCollapsed){body.style.display='none';$('matchesArrow').classList.add('up');return;}
  body.style.display='block';$('matchesArrow').classList.remove('up');
  const cache=S.matchesCache||{date:'',data:[]};
  if(cache.date===todayKey()&&cache.data&&cache.data.length>0)showMatches(cache.data);
}
function showMatches(matches){
  const box=$('matchesList');
  if(!matches||matches.length===0){box.innerHTML='<div class="empty small">Nenhum jogo hoje nos seus campeonatos.</div>';return;}
  box.innerHTML=matches.map(m=>`<div class="match-row">
    <div><div class="match-teams">${esc(m.home)} × ${esc(m.away)}</div><div class="match-league">${esc(m.league)}</div></div>
    <div class="match-time ${m.live?'match-live':''}">${m.live?'🔴 AO VIVO':esc(m.time)}</div>
  </div>`).join('');
}

/* ── FÉ ── */
function renderFe(){
  const today=todayKey();
  // versículo
  const todayV=(S.versiculos||[]).find(v=>v.date===today);
  $('versiculoInput').value=todayV?todayV.text:'';
  $('versiculoStatus').textContent=todayV?'✓ Versículo salvo hoje':'Ainda sem versículo hoje.';
  // reflexão
  const todayRefl=(S.reflections||[]).find(r=>r.date===today);
  $('reflectInput').value=todayRefl?todayRefl.text:'';
  $('todayReflectStatus').textContent=todayRefl?'✓ Reflexão salva — '+fmtDate(today):'Ainda sem reflexão hoje.';
  $('intentionBox').innerHTML=S.weekIntention?'<b>💭 Intenção da semana:</b> '+esc(S.weekIntention):'';
  if(S.lastWeekCard){$('weekCard').innerHTML=formatLetter(S.lastWeekCard);$('weekCard').dataset.generated='1';}
  // reflexões recentes expansíveis
  const rl=$('reflectionsList');
  const recent=[...S.reflections].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
  if(recent.length===0){rl.innerHTML='<div class="empty small">Nenhuma reflexão ainda. Escreva a sua acima.</div>';return;}
  rl.innerHTML='';
  recent.forEach(r=>{
    const versiculo=(S.versiculos||[]).find(v=>v.date===r.date);
    const item=document.createElement('div');item.className='reflect-item';
    item.dataset.date=r.date;
    item.innerHTML=`<div class="reflect-header">
        <div class="reflect-date">${fmtDate(r.date)}</div>
        <span class="reflect-arrow">▼</span>
      </div>
      <div class="reflect-preview">${esc(r.text)}</div>
      <div class="reflect-full">
        ${versiculo?`<div class="reflect-versiculo">"${esc(versiculo.text)}"</div>`:''}
        ${esc(r.text)}
      </div>`;
    item.querySelector('.reflect-header').addEventListener('click',()=>{
      const full=item.querySelector('.reflect-full');
      const arrow=item.querySelector('.reflect-arrow');
      const isOpen=full.classList.contains('open');
      full.classList.toggle('open',!isOpen);
      arrow.classList.toggle('open',!isOpen);
    });
    rl.appendChild(item);
  });
}

/* ── TROFÉUS ── */
function renderTrofeus(){
  if(S.lastMonthCard){$('monthCard').innerHTML=formatLetter(S.lastMonthCard);$('monthCard').dataset.generated='1';}
  const earned=Object.keys(S.trophies||{}).length;$('trophyCount').textContent=earned+' / '+TROPHY_DEFS.length;
  const nt=$('nextTrophies');nt.innerHTML='';
  const upcoming=TROPHY_DEFS.filter(d=>!S.trophies[d.id]&&d.check).slice(0,3);
  upcoming.forEach(def=>{
    let prog=0,tot=1,label='';
    if(def.id.startsWith('streak_')){const n=parseInt(def.id.split('_')[1]);prog=Math.min(n,S.streak);tot=n;label=S.streak+'/'+n+' dias';}
    else if(def.id.startsWith('xp_')){const n=parseInt(def.id.split('_')[1]);prog=Math.min(n,S.totalXpEver||0);tot=n;label=prog+'/'+n+' XP';}
    else if(def.id.startsWith('reflect_')){const n=parseInt(def.id.split('_')[1]);prog=Math.min(n,S.reflections.length);tot=n;label=prog+'/'+n+' reflexões';}
    else if(def.id.startsWith('rival')){const n=def.id==='rival_3'||def.id==='rival_series'?3:1;prog=Math.min(n,S.records.rivalWins||0);tot=n;label=prog+'/'+n+' vitórias';}
    else if(def.id.startsWith('pai_')){const n=parseInt(def.id.split('_')[1]);prog=Math.min(n,(S.paiDates||[]).length);tot=n;label=prog+'/'+n+' dias';}
    else if(def.id.startsWith('obra_')){const n=def.id==='obra_5'?5:def.id==='obra_20'?20:def.id==='obra_analista'?5:1;
      const v=def.id==='obra_analista'?Object.values(S.obraPosts||{}).filter(p=>p.likes||p.comments||p.saves||p.shares).length:Object.keys(S.obraPosts||{}).length;
      prog=Math.min(n,v);tot=n;label=prog+'/'+n+' posts';}
    else{prog=0;tot=1;label='Em andamento';}
    const pct=tot>0?Math.round(prog/tot*100):0;
    const row=document.createElement('div');row.className='next-trophy';
    row.innerHTML=`<div class="nt-icon">${def.icon}</div><div class="nt-body">
      <div class="nt-name">${def.name}</div><div class="nt-desc">${def.desc}</div>
      <div class="nt-track"><div class="nt-fill" style="width:${pct}%"></div></div>
      <div class="nt-progress">${label}</div></div>`;
    nt.appendChild(row);
  });
  const grid=$('trophyGrid');grid.innerHTML='';
  TROPHY_DEFS.forEach(def=>{const gotIt=!!(S.trophies||{})[def.id];
    const div=document.createElement('div');div.className='trophy '+(gotIt?'earned':'locked');
    div.title=def.desc+(gotIt?' · '+fmtDate(S.trophies[def.id]):'');
    div.innerHTML=`<div class="trophy-icon">${def.icon}</div><div class="trophy-name">${def.name}</div>
      ${gotIt?'<div class="trophy-date">'+fmtDate(S.trophies[def.id])+'</div>':''}`;
    grid.appendChild(div);});
}

/* ── LIGA ── */
function rivalState(){
  const today=new Date();today.setHours(12,0,0,0);const thisStart=weekStartOf(today);
  const lastStart=new Date(thisStart);lastStart.setDate(lastStart.getDate()-7);
  const lastWeekXP=weeklyXP(lastStart);const rivalTarget=Math.max(70,Math.round(lastWeekXP*1.1));
  const dayIdx=Math.max(0,Math.min(6,Math.floor((today-thisStart)/86400000)));
  return{rivalTarget,rivalPace:Math.round(((dayIdx+1)/7)*rivalTarget),myWeekXP:weeklyXP(thisStart)};
}
function renderLiga(){
  const r=rivalState();$('myScore').textContent=r.myWeekXP;$('rivalScore').textContent=r.rivalPace;
  const max=Math.max(r.myWeekXP,r.rivalPace,r.rivalTarget,1);
  $('duelFill').style.width=Math.min(100,(r.myWeekXP/max*100))+'%';
  const diff=r.myWeekXP-r.rivalPace;const stat=$('duelStatus');
  if(diff>=0){stat.className='duel-status winning';stat.textContent='🟢 NA FRENTE por '+diff+' pts · meta: '+r.rivalTarget;}
  else{stat.className='duel-status behind';stat.textContent='🔴 Atrás por '+Math.abs(diff)+' pts · meta: '+r.rivalTarget;}
  renderTimeline();
  const ch=$('careerHistory');ch.innerHTML='';
  const row=document.createElement('div');row.className='career-row';
  row.innerHTML=`<div class="cr-month">este mês</div><div class="cr-career">${currentCareer().name}</div><div class="cr-xp">${S.xpMonth} XP</div>`;
  ch.appendChild(row);
  const hist=S.careerHistory||[];
  if(!hist.length){const e=document.createElement('div');e.className='empty small';e.style.marginTop='8px';e.textContent='Histórico disponível a partir do próximo mês.';ch.appendChild(e);}
  else hist.slice(0,6).forEach(h=>{const r=document.createElement('div');r.className='career-row';
    r.innerHTML=`<div class="cr-month">${h.month}</div><div class="cr-career">${h.careerName}</div><div class="cr-xp">${h.xp} XP</div>`;ch.appendChild(r);});
  const rec=S.records||{};
  $('records').innerHTML=`
    <div class="rec"><div class="rec-val">${rec.bestStreak||0}</div><div class="rec-label">🔥 Maior seq.</div></div>
    <div class="rec"><div class="rec-val">${rec.bestWeekXP||0}</div><div class="rec-label">🏆 Melhor semana</div></div>
    <div class="rec"><div class="rec-val">${rec.mostFocosInDay||0}</div><div class="rec-label">⚡ Focos/dia</div></div>
    <div class="rec"><div class="rec-val">${rec.totalFocos||0}</div><div class="rec-label">🎯 Total focos</div></div>
    <div class="rec"><div class="rec-val">${rec.rivalWins||0}</div><div class="rec-label">👻 Rival batido</div></div>
    <div class="rec"><div class="rec-val">${Object.keys(S.trophies||{}).length}</div><div class="rec-label">🏅 Troféus</div></div>`;
  const wh=$('weeklyHistory');wh.innerHTML='';
  const weeks=Object.keys(S.weekly||{}).sort().reverse().slice(0,8);
  if(!weeks.length){wh.innerHTML='<div class="empty small">A primeira rodada fecha no próximo domingo.</div>';return;}
  weeks.forEach(wk=>{const w=S.weekly[wk];const row=document.createElement('div');
    row.className='week-row '+(w.won?'won':'lost');
    row.innerHTML=`<div class="week-date">Semana de ${fmtDate(wk)}</div><div class="week-score">${w.xp} × ${w.rival} ${w.won?'✓':''}</div>`;
    wh.appendChild(row);});
}
function renderTimeline(){
  const chart=$('timelineChart');chart.innerHTML='';
  const today=new Date();const todayK=todayKey();
  const days30=Array.from({length:30},(_,i)=>{const d=new Date(today);d.setDate(d.getDate()-(29-i));return keyOf(d);});
  const values=days30.map(k=>S.history[k]?.xp||0);const maxVal=Math.max(...values,1);
  days30.forEach((k,i)=>{
    const v=values[i];const pct=Math.max(4,(v/maxVal*100));
    const bar=document.createElement('div');bar.className='tl-bar'+(k===todayK?' today':'')+(v===0?' zero':'');
    const hue=v===0?0:Math.round(120*(v/maxVal));
    bar.style.cssText=`height:${pct}%;background:${v>0?`hsl(${hue},90%,50%)`:'rgba(255,255,255,.06)'};`;
    bar.setAttribute('data-tip',fmtDate(k)+': '+v+' pts');
    chart.appendChild(bar);});
}

/* ── IANAOBRA ── */
function getMonthChampions(y,m){
  const prefix=y+'-'+pad(m+1);
  const posts=Object.entries(S.obraPosts||{}).filter(([k,v])=>k.startsWith(prefix)&&(v.likes||v.comments||v.saves||v.shares));
  if(!posts.length)return null;
  const champ=(metric)=>{
    const sorted=[...posts].filter(([,v])=>v[metric]>0).sort(([,a],[,b])=>(b[metric]||0)-(a[metric]||0));
    if(!sorted.length)return null;
    const[k,v]=sorted[0];return{key:k,val:v[metric],preview:(v.content||'').slice(0,30)};
  };
  return{likes:champ('likes'),comments:champ('comments'),saves:champ('saves'),shares:champ('shares')};
}
function renderObra(){
  const y=S.calYear,m=S.calMonth;$('calTitle').textContent=monthName(y,m).toUpperCase();
  // campeões do mês
  const champs=getMonthChampions(y,m);const mc=$('monthChampions');
  if(champs&&(champs.likes||champs.comments||champs.saves||champs.shares)){
    mc.style.display='flex';mc.innerHTML='';
    const items=[
      {key:'likes',icon:'❤️',label:'Mais curtidas',champ:champs.likes},
      {key:'comments',icon:'💬',label:'Mais comentários',champ:champs.comments},
      {key:'saves',icon:'🔖',label:'Mais salvamentos',champ:champs.saves},
      {key:'shares',icon:'🔁',label:'Mais compartilhamentos',champ:champs.shares},
    ];
    items.forEach(it=>{if(!it.champ)return;
      const card=document.createElement('div');card.className='champion-card '+it.key;
      card.innerHTML=`<div class="champion-icon">${it.icon}</div>
        <div class="champion-label">${it.label}</div>
        <div class="champion-val">${it.champ.val.toLocaleString('pt-BR')}</div>
        <div class="champion-post">${fmtDate(it.champ.key)} · ${esc(it.champ.preview)}${it.champ.preview.length>=30?'…':''}</div>`;
      mc.appendChild(card);});
  }else mc.style.display='none';
  // calendário
  const firstDay=new Date(y,m,1).getDay();const startOffset=firstDay===0?6:firstDay-1;
  const daysInMonth=new Date(y,m+1,0).getDate();const prevDays=new Date(y,m,0).getDate();
  const grid=$('calGrid');grid.innerHTML='';const today=todayKey();
  // calcula quais dias são campeões de cada métrica neste mês
  const champKeys={likes:champs?.likes?.key,comments:champs?.comments?.key,saves:champs?.saves?.key,shares:champs?.shares?.key};
  for(let i=0;i<startOffset;i++){const d=document.createElement('div');d.className='cal-day other-month';d.innerHTML=`<div class="cal-day-num">${prevDays-startOffset+1+i}</div>`;grid.appendChild(d);}
  for(let day=1;day<=daysInMonth;day++){
    const k=y+'-'+pad(m+1)+'-'+pad(day);const post=S.obraPosts?.[k];
    const hasMetrics=post&&(post.likes||post.comments||post.saves||post.shares);
    const d=document.createElement('div');
    d.className='cal-day'+(k===today?' today':'')+(hasMetrics?' has-metrics':post?' has-content':'');
    d.dataset.key=k;d.dataset.act='openCalDay';
    // medalhas de campeão
    const medals=[];
    if(champKeys.likes===k)medals.push('❤️');
    if(champKeys.comments===k)medals.push('💬');
    if(champKeys.saves===k)medals.push('🔖');
    if(champKeys.shares===k)medals.push('🔁');
    const medalsHtml=medals.length?`<div class="cal-day-medals">${medals.map(m=>`<span>${m}</span>`).join('')}</div>`:'';
    const preview=post?`<div class="cal-day-preview">${esc((post.content||'').slice(0,25))}</div>`:'';
    d.innerHTML=`<div class="cal-day-num">${day}</div>${preview}${medalsHtml}`;
    grid.appendChild(d);
  }
  const rem=(7-(startOffset+daysInMonth)%7)%7;
  for(let i=1;i<=rem;i++){const d=document.createElement('div');d.className='cal-day other-month';d.innerHTML=`<div class="cal-day-num">${i}</div>`;grid.appendChild(d);}
  $('ideasOutput').innerHTML='';
}

/* ── PROMPT BUILDER (sem API — copiar e colar no Claude/GPT) ── */
function showPrompt(title, desc, prompt){
  $('promptTitle').textContent='✨ '+title;
  $('promptDesc').textContent=desc;
  $('promptBox').textContent=prompt;
  $('promptOverlay').classList.add('show');
}

function generateWeekCard(){
  const refl=[...S.reflections].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7);
  if(!refl.length){toast('SEM REFLEXÕES','Escreva pelo menos uma reflexão antes.');return;}
  const versics=(S.versiculos||[]).filter(v=>refl.some(r=>r.date===v.date));
  const reflText=refl.map(r=>{
    const v=versics.find(x=>x.date===r.date);
    return `[${fmtDate(r.date)}]${v?' Versículo: "'+v.text+'"\n':'\n'}Reflexão: ${r.text}`;
  }).join('\n\n');
  const prompt=`Você é um padre pastoral próximo do povo — caloroso, direto e humano, como um amigo sacerdote que fala de coração aberto.

Aqui estão minhas reflexões e versículos desta semana:

${reflText}

Minha situação esta semana:
- Sequência de dias produtivos: ${S.streak} dias
- XP conquistado no mês: ${S.xpMonth}
- Fase da carreira no meu app de produtividade: ${currentCareer().name}${S.weekIntention?'\n- Intenção da semana passada: "'+S.weekIntention+'"':''}

Com base em tudo isso, escreva uma carta pastoral para mim:
1. Faça um apanhado espiritual da semana usando os versículos como âncora
2. Aponte UMA coisa concreta para crescer na próxima semana
3. Termine com uma intenção simples e prática para os próximos 7 dias
4. Me pergunte qual é minha intenção para a semana que começa

Tom: como um padre que fala de coração, linguagem simples e próxima do cotidiano. Máximo 300 palavras.`;
  showPrompt('CARTA SEMANAL DO FREI',
    'Cole esse prompt no Claude (claude.ai) ou GPT. O Claude gratuito dá ótimas cartas pastorais.',
    prompt);
  checkTrophy('week_card');persist();
}

function generateMonthCard(){
  const refl=[...S.reflections].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,14);
  const trophiesEarned=TROPHY_DEFS.filter(t=>(S.trophies||{})[t.id]).map(t=>t.icon+' '+t.name);
  const mk=curMonthKey();
  const activeDays=Object.keys(S.history||{}).filter(k=>k.startsWith(mk)&&(S.history[k].count>0||S.history[k].focos>0)).length;
  const versics=(S.versiculos||[]).filter(v=>v.date.startsWith(mk)).map(v=>'"'+v.text+'"').join('\n');
  const reflText=refl.length?refl.map(r=>`[${fmtDate(r.date)}] ${r.text}`).join('\n\n'):'Nenhuma reflexão escrita este mês.';
  const prompt=`Você é um padre pastoral que escreve cartas mensais de balanço e crescimento pessoal.

MEUS NÚMEROS DO MÊS:
- XP conquistado: ${S.xpMonth}
- Dias ativos: ${activeDays}
- Sequência atual: ${S.streak} dias consecutivos
- Fase da carreira: ${currentCareer().name}
- Dias de presença com minha filha Maria Clara (5 anos): ${(S.paiDates||[]).filter(d=>d.startsWith(mk)).length}
- Troféus conquistados: ${trophiesEarned.length?trophiesEarned.join(', '):'Nenhum este mês'}

VERSÍCULOS QUE GUARDEI ESTE MÊS:
${versics||'Nenhum versículo salvo este mês.'}

MINHAS REFLEXÕES DO MÊS:
${reflText}

Escreva uma carta pastoral de fim de mês para mim:
1. Celebre o que foi bom com base nos números e nas reflexões
2. Use os versículos como âncora espiritual do balanço
3. Aponte honestamente o que pode melhorar
4. Proponha uma intenção concreta para o próximo mês
5. Mencione a Maria Clara — a presença com ela é sagrada

Tom: caloroso, direto, como um padre amigo. Máximo 400 palavras.`;
  showPrompt('CARTA DO MÊS',
    'Cole no Claude (claude.ai) — é o melhor para cartas espirituais. Totalmente gratuito.',
    prompt);
  checkTrophy('month_card');persist();
}

function generateIdeas(){
  const cfg=S.obraConfig||{};
  if(!cfg.about){openObraConfig(true);return;}
  const champs=getMonthChampions(S.calYear,new Date().getMonth());
  let metricsCtx='';
  if(champs){
    if(champs.likes)metricsCtx+=`\n- Post com mais curtidas este mês (${champs.likes.val}❤️): "${champs.likes.preview}"`;
    if(champs.saves)metricsCtx+=`\n- Post com mais salvamentos (${champs.saves.val}🔖): "${champs.saves.preview}"`;
    if(champs.comments)metricsCtx+=`\n- Post com mais comentários (${champs.comments.val}💬): "${champs.comments.preview}"`;
  }
  const totalPosts=Object.keys(S.obraPosts||{}).length;
  const prompt=`Você é um estrategista de conteúdo especializado em Instagram para profissionais da construção civil.

MEU CANAL — IAnaObra:
- Público: engenheiros e profissionais da construção civil, 30-45 anos, que querem usar IA no dia a dia de obra e na vida pessoal
- Tom: didático, prático, como um colega de profissão que está um passo à frente — não professor, mas parceiro
- Sobre o canal: ${cfg.about}
${cfg.lastPosts?'- Últimos posts que funcionaram bem: '+cfg.lastPosts:''}
- Total de posts publicados: ${totalPosts}

DADOS DO QUE FUNCIONOU MELHOR ESTE MÊS:${metricsCtx||'\nAinda sem métricas registradas.'}

Com base nesse contexto, me dê 5 ideias de conteúdo diferentes e criativas para postar agora. Para cada ideia:
1. Título chamativo (que pare o scroll)
2. Formato sugerido: carrossel / reels / story
3. 3-4 linhas desenvolvendo a ideia
4. Por que esse formato/tema tende a performar bem para esse público

Seja específico — não quero ideias genéricas de "use IA para X". Quero ideias que esse engenheiro de obra vai parar pra salvar.`;
  showPrompt('IDEIAS PARA O IANAOBRA',
    'Cole no Claude, GPT ou Gemini. GPT-4o tende a ser criativo para ideias de conteúdo.',
    prompt);
}

function generateInsights(){
  const today=new Date();
  const days30=Array.from({length:30},(_,i)=>{const d=new Date(today);d.setDate(d.getDate()-(29-i));return keyOf(d);});
  const data=days30.map(k=>({
    data:fmtDate(k),
    xp:S.history[k]?.xp||0,
    tarefas:S.history[k]?.count||0,
    diaSemana:dateFromKey(k).toLocaleDateString('pt-BR',{weekday:'short'})
  }));
  const prompt=`Você é um analista de produtividade pessoal. Analise meus dados dos últimos 30 dias e me dê insights práticos.

MEUS DADOS (data | dia | XP | tarefas concluídas):
${data.map(d=>`${d.data} (${d.diaSemana}) | ${d.xp} XP | ${d.tarefas} tarefas`).join('\n')}

Com base nesses dados, me diga:
1. Em quais dias da semana eu produzo mais? E menos?
2. Existe algum padrão (semanas boas vs semanas ruins)?
3. Uma recomendação prática e específica para melhorar minha consistência

Seja direto e objetivo. Máximo 150 palavras. Use os dados reais para embasar cada insight.`;
  const out=$('insightsOutput');
  out.innerHTML=`<div class="ai-insight">
    <strong>Prompt gerado!</strong><p>Copie o prompt abaixo e cole no Claude ou GPT para receber análise do seu padrão de 30 dias.</p>
    <button class="btn" onclick="showPrompt('INSIGHTS DE PRODUTIVIDADE','Análise dos seus 30 dias de dados reais.', document.querySelector('.insight-prompt-hidden').textContent)" style="margin-top:8px;font-size:9px;">📋 VER PROMPT</button>
    <div class="insight-prompt-hidden" style="display:none">${prompt}</div>
  </div>`;
}

/* ── MODO PAI ── */
function markPai(){
  const today=todayKey();S.paiDates=S.paiDates||[];
  if(S.paiDates.includes(today)){toast('JÁ REGISTRADO','Presença de hoje já marcada 💛');return;}
  S.paiDates.push(today);recalcPaiStreak();addXP(15,true);persist();render();
  toast('MODO PAI ✓','Dia registrado com Maria Clara 💛');
  checkTrophy('pai_1');checkTrophy('pai_7');checkTrophy('pai_20');
}
function getBrincadeira(){
  const prompt=`Você é um especialista em desenvolvimento infantil e brincadeiras criativas para crianças de 5 anos.

Minha filha se chama Maria Clara e tem 5 anos.

Me sugira UMA brincadeira criativa, simples e cheia de afeto que eu possa fazer com ela AGORA. Preciso de:
1. Nome da brincadeira
2. Como fazer (3-4 passos bem simples)
3. Por que ela vai adorar (o que desenvolve e diverte)
4. Uma dica de como tornar o momento ainda mais especial

Seja caloroso e divertido. A brincadeira deve ser possível em casa, sem precisar comprar nada.`;
  const out=$('brincarOutput');
  out.innerHTML=`<div class="brincar-result">
    <p>Prompt pronto! Cole no Claude ou ChatGPT pra receber uma sugestão de brincadeira pra Maria Clara. 💛</p>
    <button class="btn pink" onclick="navigator.clipboard.writeText(document.querySelector('.brincadeira-prompt').textContent).then(()=>toast('COPIADO ✅','Cole no Claude ou ChatGPT'))" style="font-size:9px;margin-top:8px;">📋 COPIAR PROMPT</button>
    <div class="brincadeira-prompt" style="display:none">${prompt}</div>
  </div>`;
}

/* ── TÉCNICO — gera prompt completo para copiar ── */
function openTecnico(){
  $('tecnicoOverlay').classList.add('show');
  $('tecnicoStart').style.display='block';
  $('tecnicoInputArea').style.display='none';
  $('tecnicoChat').innerHTML='';
}
function startTecnico(){
  const days=weekDates(weekStartOf(new Date()));
  const weekXP=days.reduce((s,k)=>s+(S.history[k]?.xp||0),0);
  const weekTasks=days.reduce((s,k)=>s+(S.history[k]?.count||0),0);
  const weekPai=(S.paiDates||[]).filter(d=>days.includes(d)).length;
  const weekRefl=(S.reflections||[]).filter(r=>days.includes(r.date)).length;
  const weekObra=Object.keys(S.obraPosts||{}).filter(k=>days.includes(k)).length;
  const ch=S.currentChallenge;const chalProg=ch?challengeCurrentProgress(ch):0;
  const reflDaSemana=(S.reflections||[]).filter(r=>days.includes(r.date)).map(r=>`[${fmtDate(r.date)}] ${r.text}`).join('\n');
  const prompt=`Você é o Técnico — um mentor pessoal direto, honesto e humano. Seu estilo é como um técnico de futebol no vestiário após o jogo: direto, sem enrolação, com carinho.

DADOS DA MINHA SEMANA:
- XP conquistado: ${weekXP} pts
- Tarefas concluídas: ${weekTasks}
- Dias com minha filha Maria Clara: ${weekPai} de 7
- Reflexões de fé escritas: ${weekRefl}
- Posts publicados no Instagram (IAnaObra): ${weekObra}
- Sequência atual de dias produtivos: ${S.streak} dias
- Fase da minha carreira no app: ${currentCareer().name}
- Desafio da semana: ${ch?ch.name+' — progresso: '+chalProg+'/'+ch.goal:'nenhum ativo'}
- Tarefas atrasadas (mais de 5 dias paradas): ${S.tasks.filter(t=>!t.done&&taskIsRescue(t)).length}
- Minha intenção para esta semana era: "${S.weekIntention||'não havia definido'}"
${reflDaSemana?'\nO QUE ESCREVI NAS MINHAS REFLEXÕES:\n'+reflDaSemana:''}

COMO CONDUZIR A REUNIÃO:
1. Comece com uma análise honesta da semana em 3-4 linhas
2. Faça a pergunta mais importante que os dados levantam
3. Espere minha resposta antes de continuar (é uma conversa, não um monólogo)
4. Ao todo, faça 3 perguntas — uma por vez
5. Feche com um plano de ação simples e concreto para a semana que começa

Inicie a reunião agora.`;
  $('tecnicoStart').style.display='none';
  $('tecnicoChat').innerHTML=`<div class="tc-msg tecnico">
    <div class="tc-label">🧠 PROMPT PRONTO</div>
    <div class="tc-text">
      <p>Cole esse prompt numa <b>nova conversa no Claude</b> (claude.ai/new) e conduza a reunião com o Técnico por lá. A conversa vai fluir naturalmente — o Claude vai te fazer as 3 perguntas e fechar com um plano de ação.</p>
      <p style="color:var(--muted);font-size:12px;">Sugestão: salve a conversa no Claude como "Reunião com o Técnico — semana de ${fmtDate(days[0])}" para ter um histórico.</p>
    </div>
  </div>`;
  $('tecnicoInputArea').style.display='none';
  // Mostra botão de copiar
  const btn=document.createElement('button');btn.className='btn';btn.style.cssText='width:100%;margin-top:12px;font-size:10px;';
  btn.textContent='📋 COPIAR PROMPT DA REUNIÃO';
  btn.onclick=()=>navigator.clipboard.writeText(prompt).then(()=>{toast('COPIADO! 🧠','Abra claude.ai/new e cole');});
  $('tecnicoChat').appendChild(btn);
}
function sendTecnico(){} // não usado mais
function addTecnicoMsg(){}
function replaceTecnicoPlaceholder(){}
async function loadMatches(){
  const btn=$('refreshMatches');if(btn)btn.textContent='⏳';
  showLoading('Buscando jogos de hoje…','Pesquisando na web.');
  try{const today=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const text=await callAI([{role:'user',content:`Pesquise na web e liste TODOS os jogos de futebol HOJE (${today}) nos campeonatos: Brasileirão Série A, Libertadores, Sul-Americana, Copa do Mundo FIFA, Premier League, La Liga, Champions League, e jogos do Corinthians. Retorne APENAS JSON:\n[{"home":"Time A","away":"Time B","league":"Camp","time":"19:00","live":false}]\nSe não houver: []`}],
      'Retorne apenas JSON válido.',1200,true);
    let matches=[];try{const m=text.replace(/```json?|```/g,'').trim().match(/\[[\s\S]*\]/);matches=m?JSON.parse(m[0]):[];}catch(e){matches=[];}
    S.matchesCache={date:todayKey(),data:matches,_ts:Date.now()};
    persist();showMatches(matches);
    if(!S.matchesCollapsed)$('matchesBody').style.display='block';
  }catch(e){$('matchesList').innerHTML='<div class="empty small">Erro: '+esc(e.message)+'</div>';}
  finally{hideLoading();if(btn)btn.textContent='↻';}
}
/* callAI — mantido APENAS para os jogos (web search via API) */
async function callAI(messages,system,max_tokens=1800,use_web_search=false){
  const model=use_web_search?'claude-sonnet-4-5':'claude-haiku-4-5';
  const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages,system,max_tokens,model,use_web_search})});
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||'Erro '+r.status);}
  const data=await r.json();
  if(use_web_search&&data.text_only!=null)return data.text_only;
  return(data.content||[]).map(c=>c.text||'').join('').trim();
}

/* ── AÇÕES GERAIS ── */
function toggle(kind,id,el){
  const t=todayKey();
  if(kind==='task'){const tk=S.tasks.find(x=>x.id===id);if(!tk)return;const wasNotDone=!tk.done;tk.done=!tk.done;
    if(tk.done&&wasNotDone){
      const h=new Date().getHours();
      if(h<8){S.records.earlyBird=true;checkTrophy('madrugador');}
      if(h>=22){S.records.nightOwl=true;checkTrophy('coruja');}
      if(new Date().getDay()===0){S.records.sundayWin=true;checkTrophy('domingo_prod');}
      const rescue=taskIsRescue(tk);const xpVal=taskXP(tk);const res=addXP(xpVal);celebrate(el,res);let earned=res.gained;
      if(rescue){const r2=addXP(XP.resgate,true);earned+=r2.gained;S.records.rescues=(S.records.rescues||0)+1;
        checkTrophy('rescue_1');if(S.records.rescues>=5)checkTrophy('rescue_5');
        setTimeout(()=>toast('LIMPEZA DE BACKLOG! 🧹','+'+XP.resgate+' pts'),900);}
      tk.doneDate=todayKey();tk.xpEarned=earned;tk.wasRescue=rescue;checkTrophy('first_task');registerProgress('item');}
  }else if(kind==='habit'){const hb=S.habits.find(x=>x.id===id);if(!hb)return;
    hb.doneDates=hb.doneDates||[];
    if(hb.doneDates.includes(t))hb.doneDates=hb.doneDates.filter(x=>x!==t);
    else{hb.doneDates.push(t);celebrate(el,addXP(XP.habit));registerProgress('item');}
  }
  persist();render();
}
function del(kind,id){if(kind==='task')S.tasks=S.tasks.filter(x=>x.id!==id);else S.habits=S.habits.filter(x=>x.id!==id);persist();render();}
function addItem(){const inp=$('addInput');const v=inp.value.trim();if(!v)return;
  if(S.addMode==='task')S.tasks.unshift({id:'t'+Date.now(),name:v,done:false,date:todayKey()});
  else S.habits.unshift({id:'h'+Date.now(),name:v,icon:'🔁',sub:'Hábito diário',doneDates:[]});
  inp.value='';persist();render();inp.focus();}
function saveVersiculo(){const text=$('versiculoInput').value.trim();if(!text){toast('VAZIO','');return;}
  const today=todayKey();S.versiculos=S.versiculos||[];
  S.versiculos=S.versiculos.filter(v=>v.date!==today);S.versiculos.push({date:today,text});
  persist();renderFe();toast('VERSÍCULO SALVO ✨','Vai aparecer na sua carta semanal.');checkTrophy('versiculo_1');}
function saveReflection(){const text=$('reflectInput').value.trim();if(!text){toast('VAZIO','');return;}
  const today=todayKey();S.reflections=S.reflections.filter(r=>r.date!==today);S.reflections.push({date:today,text});
  persist();renderFe();toast('REFLEXÃO SALVA ✍️','');checkTrophy('reflect_1');checkTrophy('reflect_3');checkTrophy('reflect_7');checkTrophy('reflect_30');
  // fé e foco
  const hst=S.history[today]||{count:0};if(hst.count>=3)checkTrophy('fe_e_foco');}

/* ── OBRA: modal de post com métricas ── */
function openCalDay(k){
  const post=S.obraPosts?.[k]||{content:'',posted:false,likes:0,comments:0,saves:0,shares:0};
  const[y,m,d]=k.split('-');const hasMetrics=post.posted;
  $('obraPostModal').innerHTML=`<h3>📅 ${d}/${m}/${y}</h3>
    <label>Conteúdo planejado / executado</label>
    <textarea id="calContent" rows="3">${esc(post.content||'')}</textarea>
    <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
      <input type="checkbox" id="calPosted" ${post.posted?'checked':''} style="width:auto;accent-color:var(--neon-green)">
      <label style="margin:0;text-transform:none;font-size:14px">Post já publicado ✓</label>
    </div>
    <div id="metricsSection" style="${post.posted?'':'display:none'}">
      <div style="margin:12px 0 6px;font-family:'Press Start 2P';font-size:9px;color:var(--muted)">MÉTRICAS (após 48h)</div>
      <div class="metrics-grid">
        <div class="metric-input likes"><label>❤️ Curtidas</label><input type="number" id="mLikes" min="0" value="${post.likes||0}"></div>
        <div class="metric-input comments"><label>💬 Comentários</label><input type="number" id="mComments" min="0" value="${post.comments||0}"></div>
        <div class="metric-input saves"><label>🔖 Salvamentos</label><input type="number" id="mSaves" min="0" value="${post.saves||0}"></div>
        <div class="metric-input shares"><label>🔁 Compartilhamentos</label><input type="number" id="mShares" min="0" value="${post.shares||0}"></div>
      </div>
    </div>
    <div class="modal-actions"><button class="m-close" data-close-obra>CANCELAR</button><button class="m-save" id="saveObraBtn">SALVAR</button></div>`;
  $('obraPostOverlay').classList.add('show');
  setTimeout(()=>$('calContent').focus(),50);
  // mostrar/ocultar métricas ao marcar "publicado"
  $('calPosted').addEventListener('change',e=>{
    $('metricsSection').style.display=e.target.checked?'block':'none';});
  $('saveObraBtn').onclick=()=>{
    const content=$('calContent').value.trim();const posted=$('calPosted').checked;
    const likes=parseInt($('mLikes')?.value||0,10)||0;const comments=parseInt($('mComments')?.value||0,10)||0;
    const saves=parseInt($('mSaves')?.value||0,10)||0;const shares=parseInt($('mShares')?.value||0,10)||0;
    if(!S.obraPosts)S.obraPosts={};
    if(content){S.obraPosts[k]={content,posted,likes,comments,saves,shares};
      const cnt=Object.keys(S.obraPosts).length;if(cnt>=5)checkTrophy('obra_5');if(cnt>=20)checkTrophy('obra_20');
      if(likes||comments||saves||shares){checkTrophy('obra_metrica');
        const withMetrics=Object.values(S.obraPosts).filter(p=>p.likes||p.comments||p.saves||p.shares).length;
        if(withMetrics>=5)checkTrophy('obra_analista');}}
    else delete S.obraPosts[k];
    persist();$('obraPostOverlay').classList.remove('show');renderObra();};
}
function openObraConfig(fromIdeas=false){const cfg=S.obraConfig||{};
  $('formModal').innerHTML=`<h3>🧱 Configurar IAnaObra</h3>${fromIdeas?'<p style="color:var(--neon-yellow)">Configure seu canal primeiro.</p>':''}
    <label>Sobre o canal</label><textarea id="cfgAbout" rows="4">${esc(cfg.about||'')}</textarea>
    <label>Últimos 5 posts que funcionaram</label><textarea id="cfgLast" rows="3">${esc(cfg.lastPosts||'')}</textarea>
    <div class="modal-actions"><button class="m-close" data-close-form>CANCELAR</button><button class="m-save" id="saveCfgBtn">SALVAR</button></div>`;
  $('formOverlay').classList.add('show');
  $('saveCfgBtn').onclick=()=>{S.obraConfig={...(S.obraConfig||{}),about:$('cfgAbout').value.trim(),lastPosts:$('cfgLast').value.trim()};persist();$('formOverlay').classList.remove('show');if(fromIdeas)setTimeout(generateIdeas,200);};}
function openIntentionModal(){
  $('formModal').innerHTML=`<h3>💭 Intenção da semana</h3><p>O que você quer cultivar na semana que começa?</p>
    <input id="intentionInput" placeholder="Ex: Ser mais presente..." value="${esc(S.weekIntention||'')}">
    <div class="modal-actions"><button class="m-close" data-close-form>DEPOIS</button><button class="m-save" id="saveIntentionBtn">SALVAR</button></div>`;
  $('formOverlay').classList.add('show');setTimeout(()=>$('intentionInput').focus(),50);
  $('saveIntentionBtn').onclick=()=>{S.weekIntention=$('intentionInput').value.trim();persist();$('formOverlay').classList.remove('show');renderFe();toast('INTENÇÃO SALVA 💭','');};}

/* ── FX ── */
function showLevelUp(career){$('levelupCareer').textContent=career.name+' · '+career.club;$('levelupAvatar').innerHTML=buildAvatar(career.id);$('levelupOverlay').style.display='flex';}
function setStatus(k){const el=$('status');if(!el)return;el.className='status '+(k==='ok'?'ok':k==='sync'?'sync':'off');el.textContent=k==='ok'?'☁️ sincronizado':k==='sync'?'⏳ salvando…':'📴 local';}
function toast(title,sub){const el=$('toast');el.innerHTML=esc(title)+(sub?'<small>'+esc(sub)+'</small>':'');el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2600);}
function celebrate(el,res){if(!el)return;const r=el.getBoundingClientRect();
  for(let i=0;i<5;i++){const c=document.createElement('div');c.className='coin';c.textContent=Math.random()<.5?'⚽':'⭐';
    c.style.left=(r.left+r.width/2-12+(Math.random()*40-20))+'px';c.style.top=(r.top-8)+'px';c.style.animationDelay=(i*.05)+'s';
    document.body.appendChild(c);setTimeout(()=>c.remove(),1100);}
  if(!res.surprise)toast('+'+res.gained+' PTS','⚽');}

/* ── SYNC ── */
function openSync(){$('myCode').textContent=Store.code();$('syncNote').innerHTML=Store.online()?'Guarde seu código.':'⚠️ Sync desligado.';$('overlay').classList.add('show');}
function closeSync(){$('overlay').classList.remove('show');}
async function linkCode(){const v=$('codeInput').value.trim().toUpperCase();if(!v)return;
  if(!Store.online()){toast('SYNC DESLIGADO','');return;}Store.setCode(v);setStatus('sync');
  const remote=await Store.pull();
  if(remote){S=Object.assign(S,remote);S.showAll=false;S.addMode='task';S.view='hoje';Store.saveLocal(remote);go('hoje');closeSync();toast('CONECTADO 🔗','');setStatus('ok');}
  else{persist();closeSync();toast('CÓDIGO VINCULADO','');}}

/* ── EVENTOS ── */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');
  if(a){const{act,kind,id}=a.dataset;
    if(act==='toggle')toggle(kind,id,a.closest('.card'));
    else if(act==='del')del(kind,id);
    else if(act==='openCalDay')openCalDay(a.dataset.key);return;}
  const tab=e.target.closest('.tab');
  if(tab){S.addMode=tab.dataset.mode;document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===tab));
    $('addInput').placeholder=S.addMode==='task'?'Ex: Emitir relatório semanal':'Ex: Tomar suplemento';
    $('addBtn').className='btn'+(S.addMode==='habit'?' pink':'');return;}
  const bn=e.target.closest('.bnav-btn');if(bn){go(bn.dataset.view);return;}
  if(e.target.matches('[data-close-form]')||e.target===$('formOverlay'))$('formOverlay').classList.remove('show');
  if(e.target.matches('[data-close-obra]')||e.target===$('obraPostOverlay'))$('obraPostOverlay').classList.remove('show');
  if(e.target===$('tecnicoOverlay'))$('tecnicoOverlay').classList.remove('show');
});
$('addBtn').addEventListener('click',addItem);
$('addInput').addEventListener('keydown',e=>{if(e.key==='Enter')addItem();});
$('moreBtn').addEventListener('click',()=>{S.showAll=!S.showAll;renderToday();});
$('gearBtn').addEventListener('click',openSync);
$('closeBtn').addEventListener('click',closeSync);
$('linkBtn').addEventListener('click',linkCode);
$('copyBtn').addEventListener('click',()=>navigator.clipboard.writeText(Store.code()).then(()=>toast('COPIADO ✅','')));
$('saveVersiculoBtn').addEventListener('click',saveVersiculo);
$('saveReflectBtn').addEventListener('click',saveReflection);
$('weekCardBtn').addEventListener('click',generateWeekCard);
$('monthCardBtn').addEventListener('click',generateMonthCard);
$('refreshMatches').addEventListener('click',()=>{S.matchesCache={date:'',data:[],_ts:0};persist();loadMatches();});
$('ideasBtn').addEventListener('click',generateIdeas);
$('obraConfigBtn').addEventListener('click',()=>openObraConfig(false));
$('calPrev').addEventListener('click',()=>{S.calMonth--;if(S.calMonth<0){S.calMonth=11;S.calYear--;}renderObra();});
$('calNext').addEventListener('click',()=>{S.calMonth++;if(S.calMonth>11){S.calMonth=0;S.calYear++;}renderObra();});
$('levelupClose').addEventListener('click',()=>$('levelupOverlay').style.display='none');
$('openTecnico').addEventListener('click',openTecnico);
$('tecnicoBegin').addEventListener('click',startTecnico);
$('tecnicoSkip').addEventListener('click',()=>$('tecnicoOverlay').classList.remove('show'));
$('tecnicoClose').addEventListener('click',()=>$('tecnicoOverlay').classList.remove('show'));
$('tecnicoSend').addEventListener('click',sendTecnico);
$('tecnicoReply').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendTecnico();}});
$('markPaiBtn').addEventListener('click',markPai);
$('brincarBtn').addEventListener('click',getBrincadeira);
$('insightsBtn').addEventListener('click',generateInsights);
$('promptClose').addEventListener('click',()=>$('promptOverlay').classList.remove('show'));
$('promptCopy').addEventListener('click',()=>{
  navigator.clipboard.writeText($('promptBox').textContent)
    .then(()=>toast('COPIADO! ✅','Abra claude.ai/new e cole o prompt'));
});
$('matchesToggle').addEventListener('click',e=>{
  if(e.target.closest('#refreshMatches'))return;
  S.matchesCollapsed=!S.matchesCollapsed;
  $('matchesBody').style.display=S.matchesCollapsed?'none':'block';
  $('matchesArrow').classList.toggle('up',S.matchesCollapsed);
});

/* ── BOOT ── */
function ensureFields(){
  S.history=S.history||{};S.weekly=S.weekly||{};S.trophies=S.trophies||{};
  S.reflections=S.reflections||[];S.versiculos=S.versiculos||[];
  S.obraPosts=S.obraPosts||{};S.obraConfig=S.obraConfig||{about:'',lastPosts:''};
  S.matchesCache=S.matchesCache||{date:'',data:[]};
  S.records=Object.assign({bestStreak:0,bestWeekXP:0,mostFocosInDay:0,totalFocos:0,rivalWins:0,rescues:0},S.records||{});
  S.xpMonth=S.xpMonth||0;S.totalXpEver=S.totalXpEver||S.xp||0;
  S.careerHistory=S.careerHistory||[];S.paiDates=S.paiDates||[];S.paiStreak=S.paiStreak||0;
  S.lastWeekCard=S.lastWeekCard||null;S.lastMonthCard=S.lastMonthCard||null;
  S.challengesWon=S.challengesWon||0;S.tecnicoSessions=S.tecnicoSessions||[];
  delete S.projects;delete S.rewards;delete S.lastReading;
}
(async function init(){
  Store.init();
  const local=Store.loadLocal();if(local)S=Object.assign(S,local);
  ensureFields();
  S.showAll=false;S.addMode='task';S.view='hoje';
  S.calYear=new Date().getFullYear();S.calMonth=new Date().getMonth();S.matchesCollapsed=false;

  // FASE 1: renderiza com dados locais (sem persistir ainda)
  setStatus(Store.online()?'sync':'off');render();

  if(Store.online()){
    const remote=await Store.pull();
    if(remote){
      const localTs=S._updatedAt||0;const remoteTs=remote._updatedAt||0;
      const localMatchTs=S.matchesCache?._ts||0;const remoteMatchTs=remote.matchesCache?._ts||0;

      // PROTEÇÃO: se local não tem streak mas remoto tem, remoto sempre ganha
      const localHasData=(S.totalXpEver||0)>0||(S.streak||0)>0;
      const remoteHasData=(remote.totalXpEver||0)>0||(remote.streak||0)>0;

      if(remoteTs>localTs||(remoteHasData&&!localHasData)){
        const savedMatchCache=localMatchTs>=remoteMatchTs?S.matchesCache:null;
        S=Object.assign(S,remote);ensureFields();
        if(savedMatchCache)S.matchesCache=savedMatchCache;
        S.showAll=false;S.addMode='task';S.view='hoje';Store.saveLocal(S);
      } else if(remoteMatchTs>localMatchTs){
        S.matchesCache=remote.matchesCache;
      }
    }
    setStatus('ok');
  }

  if(!S._seededHabits&&S.habits.length===0){
    S.habits.push({id:'h0',name:'Tomar Venvanse',icon:'💊',sub:'07:00 · pico vem aí',doneDates:[]});S._seededHabits=true;}

  pruneOldTasks();recalcPaiStreak();rollover();checkAllTrophies();

  // FASE 2: só persiste DEPOIS do pull — nunca antes
  persist();render();

  if(pendingMsg){setTimeout(()=>{
    if(pendingMsg.type==='shield')toast('ESCUDO ATIVADO 🛡️','Sequência preservada!');
    if(pendingMsg.type==='reset')toast('NOVO JOGO 🟢','Bata o mínimo hoje.');},600);}

  // mostra jogos do cache se existir
  if(S.matchesCache?.date===todayKey()&&S.matchesCache?.data?.length>0)showMatches(S.matchesCache.data);

  setInterval(()=>{if(S.view==='hoje'){renderContext();renderDayResume();renderTecnicoBtn();}},60000);
})();
