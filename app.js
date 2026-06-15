/* ============================================================
   FOCO ARENA v2.0 — central de operações
   ============================================================ */

/* ── CONFIG / ECONOMIA ── */
const XP={micro:5,task:10,habit:10,foco:15,streakBonus:20,ressuscitar:30,resgate:15};
const ESCUDO_CAP=3, VISIBLE_LIMIT=3, TASK_FLOOR=3, TASK_RESGATE_DAYS=5;
const SEC_5=300,SEC_20=1200,SEC_PAUSE=300;
const WEEKDAY_MIN=3, WEEKEND_MIN=1;

const DIVISIONS=[
  {name:'SÉRIE D',sub:'Temporada do mês',need:0},
  {name:'SÉRIE C',sub:'Subindo de nível',need:100},
  {name:'SÉRIE B',sub:'Time em ascensão',need:250},
  {name:'SÉRIE A',sub:'Elite nacional',need:450},
  {name:'LIBERTA',sub:'Libertadores',need:700},
  {name:'MUNDIAL',sub:'Mundial de Clubes',need:1000},
  {name:'LENDA',sub:'Hall da Fama',need:1400},
];

/* ── TROFÉUS ── */
const TROPHY_DEFS=[
  {id:'first_task',icon:'🎯',name:'Primeira Jogada',desc:'Completou sua primeira tarefa'},
  {id:'streak_3',icon:'🔥',name:'Triênio',desc:'3 dias de sequência'},
  {id:'streak_7',icon:'🏅',name:'Semana Invicta',desc:'7 dias consecutivos'},
  {id:'streak_14',icon:'🥇',name:'Quinzena de Ferro',desc:'14 dias sem parar'},
  {id:'streak_30',icon:'👑',name:'Mês Perfeito',desc:'30 dias na sequência'},
  {id:'foco_1',icon:'⚡',name:'Primeiro Foco',desc:'Completou seu primeiro bloco Pomodoro'},
  {id:'foco_10',icon:'🎮',name:'Dez no Foco',desc:'10 blocos de foco concluídos'},
  {id:'foco_50',icon:'🚀',name:'Cinquenta Focos',desc:'50 blocos de foco — você é diferente'},
  {id:'xp_100',icon:'💯',name:'Cem Pontos',desc:'100 XP acumulados (lifetime)'},
  {id:'xp_500',icon:'💎',name:'Quinhentos',desc:'500 XP lifetime'},
  {id:'xp_1000',icon:'🌟',name:'Milhar',desc:'1000 XP lifetime — lenda viva'},
  {id:'rival_win',icon:'👻',name:'Caça-Fantasma',desc:'Venceu o Rival Fantasma uma vez'},
  {id:'rival_3',icon:'🏆',name:'Exterminador',desc:'3 vitórias contra o Rival'},
  {id:'reflect_1',icon:'✍️',name:'Primeira Reflexão',desc:'Escreveu sua primeira reflexão de fé'},
  {id:'reflect_7',icon:'📖',name:'Diário Fiel',desc:'7 reflexões escritas'},
  {id:'obra_post_5',icon:'📸',name:'Criador de Conteúdo',desc:'5 posts registrados no IAnaObra'},
  {id:'obra_post_20',icon:'📲',name:'Influência em Obra',desc:'20 posts no calendário'},
  {id:'rescue_1',icon:'🧹',name:'Limpeza Geral',desc:'Resgatou uma tarefa esquecida (+5 dias)'},
  {id:'rescue_5',icon:'♻️',name:'Rei do Resgate',desc:'5 tarefas resgatadas do abandono'},
  {id:'daily_reading',icon:'⛪',name:'Missa Digital',desc:'Gerou a leitura do dia pela primeira vez'},
  {id:'week_card',icon:'💌',name:'Carta do Frei',desc:'Gerou sua primeira carta semanal'},
  {id:'month_card',icon:'📜',name:'Carta do Mês',desc:'Gerou sua primeira carta mensal'},
  {id:'habit_7',icon:'💊',name:'Rotina Blindada',desc:'Hábito marcado 7 dias seguidos'},
  {id:'all_min',icon:'🎖️',name:'Dia Completo',desc:'Bateu o mínimo em 30 dias no mês'},
];

/* ── ESTADO ── */
let S={
  xp:0,xpMonth:0,totalXpEver:0,
  monthKey:null,
  streak:0,bestStreak:0,
  escudos:1,escudoWeekKey:null,lastStreakDate:null,
  tasks:[],habits:[],
  history:{},weekly:{},
  records:{bestStreak:0,bestWeekXP:0,mostFocosInDay:0,totalFocos:0,rivalWins:0,rescues:0},
  lastSettledWeek:null,
  trophies:{},
  reflections:[],
  weekIntention:'',
  obraPosts:{},   // 'YYYY-MM-DD': {content,posted,ideas}
  obraConfig:{name:'IAnaObra',about:'',lastPosts:''},
  matchesCache:{date:'',data:[]},
  _seeded:false,_seededHabits:false,_updatedAt:0,
  showAll:false,addMode:'task',view:'hoje',
  calYear:new Date().getFullYear(),calMonth:new Date().getMonth(),
};

/* ── STORE ── */
const Store=(function(){
  const LS_CACHE='focoarena:v2',LS_CODE='focoarena:syncCode';
  let sb=null,online=false,saveTimer=null;
  function genCode(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const p=()=>Array.from({length:4},()=>a[Math.floor(Math.random()*a.length)]).join('');return 'ARENA-'+p()+'-'+p();}
  function getCode(){let c=localStorage.getItem(LS_CODE);if(!c){c=genCode();localStorage.setItem(LS_CODE,c);}return c;}
  function setCode(c){localStorage.setItem(LS_CODE,c.trim().toUpperCase());}
  function loadLocal(){try{const r=localStorage.getItem(LS_CACHE);return r?JSON.parse(r):null;}catch(e){return null;}}
  function saveLocal(s){try{localStorage.setItem(LS_CACHE,JSON.stringify(s));}catch(e){}}
  function init(){
    const cfg=window.FOCO_CONFIG||{};
    const ok=cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes('COLE_AQUI')&&typeof supabase!=='undefined';
    if(ok){try{sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);online=true;}catch(e){online=false;}}
    return online;
  }
  async function pullRemote(){if(!online)return null;try{const{data,error}=await sb.from('foco_arena').select('data').eq('sync_code',getCode()).maybeSingle();if(error)return null;return data?data.data:null;}catch(e){return null;}}
  async function pushRemote(s){if(!online)return false;try{const{error}=await sb.from('foco_arena').upsert({sync_code:getCode(),data:s,updated_at:new Date().toISOString()});return !error;}catch(e){return false;}}
  return{
    online:()=>online,code:getCode,setCode,init,loadLocal,pullRemote,saveLocal,
    save(state){saveLocal(state);if(!online){setStatus('off');return;}setStatus('sync');clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{const ok=await pushRemote(state);setStatus(ok?'ok':'off');},700);}
  };
})();

/* ── DATAS ── */
const pad=n=>String(n).padStart(2,'0');
function keyOf(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function todayKey(){return keyOf(new Date());}
function dateFromKey(k){const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d);}
function daysBetween(a,b){return Math.round((dateFromKey(b)-dateFromKey(a))/86400000);}
function isWeekend(){const d=new Date().getDay();return d===0||d===6;}
function weekStartOf(d){const x=new Date(d);x.setHours(0,0,0,0);const day=x.getDay();const diff=day===0?-6:1-day;x.setDate(x.getDate()+diff);return x;}
function weekKeyOf(d=new Date()){return keyOf(weekStartOf(d));}
function weekDates(ws){const a=[];for(let i=0;i<7;i++){const x=new Date(ws);x.setDate(x.getDate()+i);a.push(keyOf(x));}return a;}
function fmtDate(k){const d=dateFromKey(k);return pad(d.getDate())+'/'+pad(d.getMonth()+1);}
function curMonthKey(){const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1);}
function monthName(y,m){return new Date(y,m,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});}

/* ── ROLLOVER ── */
let pendingMsg=null;
function rollover(){
  // escudo semanal
  const wk=weekKeyOf();
  if(S.escudoWeekKey!==wk){if(S.escudoWeekKey!==null&&S.escudos<ESCUDO_CAP)S.escudos++;S.escudoWeekKey=wk;}
  // streak gaps
  if(S.lastStreakDate){
    const gap=daysBetween(S.lastStreakDate,todayKey());
    if(gap>=2){let missed=gap-1,shield=false;
      while(missed>0&&S.escudos>0){S.escudos--;missed--;shield=true;}
      if(missed>0){S.streak=0;pendingMsg={type:'reset'};}else if(shield){pendingMsg={type:'shield'};}}
  }
  // reset mensal
  const mk=curMonthKey();
  if(S.monthKey&&S.monthKey!==mk){S.xpMonth=0;}
  S.monthKey=mk;
  // settle semanas passadas
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
    if(S.records.totalFocos===1)checkTrophy('foco_1');
    if(S.records.totalFocos>=10)checkTrophy('foco_10');
    if(S.records.totalFocos>=50)checkTrophy('foco_50');
  }else{S.history[t].count++;}
  if(todayMinimumMet()&&S.lastStreakDate!==t){
    S.streak++;if(S.streak>S.bestStreak)S.bestStreak=S.streak;
    if(S.streak>S.records.bestStreak)S.records.bestStreak=S.streak;
    S.lastStreakDate=t;
    addXP(XP.streakBonus,true);
    setTimeout(()=>toast('SEQUÊNCIA MANTIDA! 🔥','+'+XP.streakBonus+' pts · '+S.streak+' dias invicto'),700);
    if(S.streak>=3)checkTrophy('streak_3');if(S.streak>=7)checkTrophy('streak_7');
    if(S.streak>=14)checkTrophy('streak_14');if(S.streak>=30)checkTrophy('streak_30');
  }
}

/* ── XP ── */
function addXP(amount,silent){
  let mult=1,surprise=null;
  if(!silent){const r=Math.random();if(r<0.05){mult=3;surprise='HAT-TRICK! 3x ⚽⚽⚽';}else if(r<0.20){mult=2;surprise='BÔNUS SURPRESA! 2x ⚡';}}
  const gained=amount*mult;
  S.xp+=gained;S.xpMonth+=gained;S.totalXpEver+=gained;
  const t=todayKey();if(!S.history[t])S.history[t]={count:0,focos:0,xp:0};S.history[t].xp=(S.history[t].xp||0)+gained;
  if(surprise)toast(surprise,'+'+gained+' pts');
  if(S.totalXpEver>=100)checkTrophy('xp_100');if(S.totalXpEver>=500)checkTrophy('xp_500');if(S.totalXpEver>=1000)checkTrophy('xp_1000');
  return{gained,surprise};
}
function currentDivision(){let i=0;for(let k=0;k<DIVISIONS.length;k++)if(S.xpMonth>=DIVISIONS[k].need)i=k;return i;}
function weeklyXP(ws){let s=0;weekDates(ws).forEach(k=>{s+=(S.history[k]?.xp||0);});return s;}

/* ── DECAY ── */
function taskAge(t){return Math.max(0,daysBetween(t.date||todayKey(),todayKey()));}
function taskXP(t){return Math.max(TASK_FLOOR,XP.task-taskAge(t));}
function taskIsRescue(t){return taskAge(t)>=TASK_RESGATE_DAYS;}

/* ── TROFÉUS ── */
function checkTrophy(id){
  if(S.trophies[id])return;
  const def=TROPHY_DEFS.find(t=>t.id===id);if(!def)return;
  S.trophies[id]=keyOf(new Date());
  toast('TROFÉU DESBLOQUEADO! 🏆',def.icon+' '+def.name);
  persist();
}

/* ── PERSIST ── */
function persist(){
  S._updatedAt=Date.now();
  const{showAll,addMode,view,...data}=S;
  Store.save(data);
}

/* ── ROUTING ── */
function go(view){
  S.view=view;
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+view));
  document.querySelectorAll('.bnav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  render();
}

/* ── RENDER MASTER ── */
function render(){
  renderHUD();renderContext();
  if(S.view==='hoje')renderToday();
  if(S.view==='fe')renderFe();
  if(S.view==='trofeus')renderTrofeus();
  if(S.view==='liga')renderLiga();
  if(S.view==='ianaobra')renderObra();
}
const $=id=>document.getElementById(id);
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

function renderHUD(){
  const di=currentDivision();const d=DIVISIONS[di];const next=DIVISIONS[di+1];
  $('division').childNodes[0].nodeValue=d.name;$('divName').textContent=d.sub;
  $('streakNum').textContent=S.streak;
  if(next){const base=d.need,span=next.need-base,prog=Math.min(span,S.xpMonth-base);
    $('fill').style.width=Math.max(4,(prog/span*100))+'%';
    $('xpToNext').textContent=(S.xpMonth-base)+' / '+span+' XP';
    $('xpBarLabel').textContent='Próxima divisão';}
  else{$('fill').style.width='100%';$('xpToNext').textContent='LENDA DO MÊS 👑';$('xpBarLabel').textContent='Divisão máxima';}
  $('escudos').innerHTML='<span class="sh">🛡️</span> '+S.escudos+' escudo'+(S.escudos!==1?'s':'')+' <span style="opacity:.5">(máx '+ESCUDO_CAP+')</span>';
  $('lifetime').textContent='⭐ '+S.totalXpEver+' lifetime';
}
function renderContext(){
  const h=new Date().getHours();const c=$('ctx');const txt=$('ctxText');c.className='ctx';
  if(h>=8&&h<17){c.classList.add('work');c.querySelector('.ic').textContent='💊';
    txt.innerHTML=(h>=9&&h<15)?'<b>Janela de pico do remédio.</b> Hora das tarefas pesadas.':'Modo trabalho em andamento.';}
  else if(h>=17&&h<19){c.classList.add('family');c.querySelector('.ic').textContent='💛';
    txt.innerHTML='<b>Modo presença.</b> Esse tempo é da sua pequena.';}
  else{c.classList.add('me');c.querySelector('.ic').textContent='🎮';
    txt.innerHTML='<b>Seu tempo.</b> Hora de descansar ou gastar recompensa.';}
}

/* ── VIEW: HOJE ── */
function getTodayItems(){
  const t=todayKey();const items=[];
  S.habits.forEach(h=>items.push({kind:'habit',id:h.id,name:h.name,icon:h.icon||'🔁',
    sub:h.sub||'Hábito diário',done:(h.doneDates||[]).includes(t),xp:XP.habit}));
  S.tasks.forEach(tk=>{
    if(tk.done){
      const earned=tk.xpEarned!=null?tk.xpEarned:XP.task;
      items.push({kind:'task',id:tk.id,name:tk.name,icon:'🎯',sub:tk.wasRescue?'🧹 Resgatada · rendeu '+earned+' pts':'Concluída ✓',done:true,xp:earned,age:0,rescue:false});
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
  const items=getTodayItems();const list=$('todayList');list.innerHTML='';
  const min=dailyMin();const done=items.filter(i=>i.done).length;
  const total=items.length;
  $('goalChip').textContent=done+' / '+min+' mín';
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
      <button class="play" data-act="focus" data-kind="${it.kind}" data-id="${it.id}" title="Modo Agora">▶</button>
      <div class="xptag">+${it.xp}</div>
      <button class="del" data-act="del" data-kind="${it.kind}" data-id="${it.id}">✕</button>`;
    list.appendChild(c);
  });
  const hidden=items.length-VISIBLE_LIMIT;const mb=$('moreBtn');
  if(hidden>0||S.showAll){mb.style.display='block';mb.textContent=S.showAll?'▲ recolher':'▼ ver mais '+hidden+' '+(hidden===1?'item':'itens');}
  else mb.style.display='none';
}
function renderMatches(){
  const box=$('matchesList');
  const cache=S.matchesCache||{date:'',data:[]};
  if(cache.date===todayKey()&&cache.data.length>0){showMatches(cache.data);return;}
  box.innerHTML='<div class="empty small">Toque em ↻ pra carregar os jogos do dia.</div>';
}
function showMatches(matches){
  const box=$('matchesList');
  if(!matches||matches.length===0){box.innerHTML='<div class="empty small">Nenhum jogo encontrado para hoje nos seus campeonatos.</div>';return;}
  box.innerHTML=matches.map(m=>`
    <div class="match-row">
      <div>
        <div class="match-teams">${esc(m.home)} × ${esc(m.away)}</div>
        <div class="match-league">${esc(m.league)}</div>
      </div>
      <div class="match-time ${m.live?'match-live':''}">${m.live?'🔴 AO VIVO':esc(m.time)}</div>
    </div>`).join('');
}

/* ── VIEW: FÉ ── */
function renderFe(){
  const today=todayKey();
  const todayRefl=S.reflections.find(r=>r.date===today);
  $('reflectInput').value=todayRefl?todayRefl.text:'';
  $('todayReflectStatus').textContent=todayRefl?'✓ Reflexão salva hoje — '+todayRefl.date:'Ainda sem reflexão hoje.';
  // intenção semanal
  const ib=$('intentionBox');
  ib.innerHTML=S.weekIntention?'<b>💭 Intenção da semana:</b> '+esc(S.weekIntention):'';
  // reflexões recentes
  const rl=$('reflectionsList');
  const recent=[...S.reflections].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7);
  if(recent.length===0){rl.innerHTML='<div class="empty small">Nenhuma reflexão ainda. Escreva sua primeira acima.</div>';return;}
  rl.innerHTML=recent.map(r=>`
    <div class="reflect-item">
      <div class="reflect-date">${fmtDate(r.date)}</div>
      <div class="reflect-text">${esc(r.text.slice(0,200))}${r.text.length>200?'…':''}</div>
    </div>`).join('');
}

/* ── VIEW: TROFÉUS ── */
function renderTrofeus(){
  const earned=Object.keys(S.trophies||{}).length;
  $('trophyCount').textContent=earned+' / '+TROPHY_DEFS.length;
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
  // carta do mês
  if(!$('monthCard').dataset.generated){
    $('monthCard').innerHTML='<div class="empty small">A carta lê toda sua evolução do mês — tarefas, foco, sequências, reflexões, troféus — e devolve um balanço com intenção pro próximo mês.</div>';
  }
}

/* ── VIEW: LIGA ── */
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
  if(weeks.length===0){wh.innerHTML='<div class="empty small">Ainda sem rodadas. A primeira fecha no próximo domingo.</div>';return;}
  weeks.forEach(wk=>{const w=S.weekly[wk];const row=document.createElement('div');
    row.className='week-row '+(w.won?'won':'lost');
    row.innerHTML=`<div class="week-date">Semana de ${fmtDate(wk)}</div><div class="week-score">${w.xp} × ${w.rival} ${w.won?'✓':''}</div>`;
    wh.appendChild(row);});
}

/* ── VIEW: IANAOBRA ── */
function renderObra(){
  const y=S.calYear,m=S.calMonth;
  $('calTitle').textContent=monthName(y,m).toUpperCase();
  const firstDay=new Date(y,m,1).getDay();
  const startOffset=firstDay===0?6:firstDay-1;
  const daysInMonth=new Date(y,m+1,0).getDate();
  const prevDays=new Date(y,m,0).getDate();
  const grid=$('calGrid');grid.innerHTML='';
  const today=todayKey();

  for(let i=0;i<startOffset;i++){
    const d=document.createElement('div');d.className='cal-day other-month';
    d.innerHTML=`<div class="cal-day-num">${prevDays-startOffset+1+i}</div>`;grid.appendChild(d);}

  for(let day=1;day<=daysInMonth;day++){
    const k=y+'-'+pad(m+1)+'-'+pad(day);
    const post=S.obraPosts?.[k];
    const d=document.createElement('div');
    d.className='cal-day'+(k===today?' today':'')+(post?' has-content'+(post.posted?' posted':''):'');
    d.dataset.key=k;d.dataset.act='openCalDay';
    const postPreview=post?`<div class="cal-day-dot"></div><div class="cal-day-preview">${esc((post.content||'').slice(0,40))}</div>`:'';
    d.innerHTML=`<div class="cal-day-num">${day}</div>${postPreview}`;
    grid.appendChild(d);
  }

  const totalCells=startOffset+daysInMonth;const rem=(7-totalCells%7)%7;
  for(let i=1;i<=rem;i++){const d=document.createElement('div');d.className='cal-day other-month';d.innerHTML=`<div class="cal-day-num">${i}</div>`;grid.appendChild(d);}

  // ideas output
  $('ideasOutput').innerHTML='';
}

function openCalDay(k){
  const post=S.obraPosts?.[k]||{content:'',posted:false};
  const[y,m,d]=k.split('-');
  $('formModal').innerHTML=`
    <h3>📅 ${d}/${m}/${y}</h3>
    <label>Conteúdo planejado / executado</label>
    <textarea id="calContent" rows="4" placeholder="Ideia, roteiro, legenda, link...">${esc(post.content||'')}</textarea>
    <div style="display:flex;align-items:center;gap:10px;margin-top:12px;">
      <input type="checkbox" id="calPosted" ${post.posted?'checked':''} style="width:auto;accent-color:var(--neon-green)">
      <label style="margin:0;text-transform:none;font-size:14px;color:var(--txt)">Post já publicado ✓</label>
    </div>
    <div class="modal-actions" style="margin-top:16px">
      <button class="m-close" data-close-form>CANCELAR</button>
      <button class="m-save" id="saveCalBtn">SALVAR</button>
    </div>`;
  $('formOverlay').classList.add('show');
  setTimeout(()=>$('calContent').focus(),50);
  $('saveCalBtn').onclick=()=>{
    const content=$('calContent').value.trim();
    const posted=$('calPosted').checked;
    if(!S.obraPosts)S.obraPosts={};
    if(content){
      S.obraPosts[k]={content,posted};
      const postCount=Object.keys(S.obraPosts).length;
      if(postCount>=5)checkTrophy('obra_post_5');
      if(postCount>=20)checkTrophy('obra_post_20');
    }else{delete S.obraPosts[k];}
    persist();$('formOverlay').classList.remove('show');renderObra();
  };
}

/* ── IA ── */
function showLoading(title='Consultando IA…',sub='Aguenta uns segundinhos.'){
  $('loadingTitle').textContent=title;$('loadingSub').textContent=sub;
  $('loadingOverlay').classList.add('show');
}
function hideLoading(){$('loadingOverlay').classList.remove('show');}

async function callAI(messages,system,max_tokens=1800){
  const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages,system,max_tokens,model:'claude-haiku-4-5'})});
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||'Erro '+r.status);}
  const data=await r.json();
  return(data.content||[]).map(c=>c.text||'').join('').trim();
}

async function loadDailyReading(){
  showLoading('Buscando liturgia…','Primeira leitura, Evangelho e reflexão do dia.');
  try{
    const today=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const text=await callAI(
      [{role:'user',content:`Hoje é ${today}. Me dê a liturgia católica do dia: a Primeira Leitura (com referência bíblica), o Evangelho (com referência bíblica) e uma reflexão pastoral prática e direta, com linguagem simples e próxima do povo — como um padre que fala de coração aberto, sem floreios, trazendo a Palavra para o cotidiano. Use títulos claros: "PRIMEIRA LEITURA", "EVANGELHO", "REFLEXÃO DO DIA". Máximo 500 palavras no total.`}],
      'Você é um assistente de espiritualidade católica. Apresenta as leituras do dia e reflexões pastorais.'
    );
    $('readingContent').innerHTML='<div class="reading-box">'+formatReading(text)+'</div>';
    checkTrophy('daily_reading');persist();
  }catch(e){$('readingContent').innerHTML='<div class="empty small">Erro ao carregar: '+esc(e.message)+'. Verifique se a API key está configurada na Vercel.</div>';}
  finally{hideLoading();}
}

function formatReading(text){
  return text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .split('\n').map(l=>{
      const t=l.trim();if(!t)return '';
      if(/^(PRIMEIRA LEITURA|EVANGELHO|SALMO|SEGUNDA LEITURA|REFLEXÃO)/i.test(t))return '<h4>'+esc(t)+'</h4>';
      return '<p>'+esc(t)+'</p>';
    }).join('');
}

async function generateWeekCard(){
  const recentReflections=[...S.reflections].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7);
  if(recentReflections.length===0){toast('SEM REFLEXÕES','Escreva pelo menos uma reflexão antes de gerar a carta.');return;}
  showLoading('Escrevendo carta…','O Frei está lendo suas reflexões da semana.');
  try{
    const reflText=recentReflections.map(r=>`[${fmtDate(r.date)}] ${r.text}`).join('\n\n');
    const statsText=`Sequência atual: ${S.streak} dias | XP no mês: ${S.xpMonth} | Tarefas concluídas esta semana: ${weeklyXP(weekStartOf(new Date()))} pts`;
    const intention=S.weekIntention?`\nIntenção da semana passada: "${S.weekIntention}"`:'';
    const text=await callAI(
      [{role:'user',content:`Aqui estão minhas reflexões espirituais da semana:\n\n${reflText}\n\nMinha situação no app: ${statsText}${intention}\n\nEscreva uma carta pastoral calorosa, direta e prática, como um padre próximo do povo. Faça um apanhado espiritual da semana, aponte algo para crescer e termine com uma intenção simples para a próxima semana. No final, pergunte qual é a minha intenção para a semana que começa. Máximo 300 palavras.`}],
      'Você é um padre pastoral, próximo do povo, prático e caloroso. Escreve cartas espirituais simples e diretas.'
    );
    $('weekCard').innerHTML=formatLetter(text);$('weekCard').dataset.generated='1';
    checkTrophy('week_card');
    // pede intenção da semana
    setTimeout(()=>openIntentionModal(),1200);
    persist();
  }catch(e){$('weekCard').innerHTML='<div class="empty small">Erro: '+esc(e.message)+'</div>';}
  finally{hideLoading();}
}

function openIntentionModal(){
  $('formModal').innerHTML=`
    <h3>💭 Intenção da semana</h3>
    <p>O que você quer cultivar ou mudar na semana que começa?</p>
    <input id="intentionInput" placeholder="Ex: Ser mais presente com minha filha..." value="${esc(S.weekIntention||'')}">
    <div class="modal-actions">
      <button class="m-close" data-close-form>DEPOIS</button>
      <button class="m-save" id="saveIntentionBtn">SALVAR</button>
    </div>`;
  $('formOverlay').classList.add('show');
  setTimeout(()=>$('intentionInput').focus(),50);
  $('saveIntentionBtn').onclick=()=>{
    S.weekIntention=$('intentionInput').value.trim();
    persist();$('formOverlay').classList.remove('show');renderFe();
    toast('INTENÇÃO SALVA 💭','Que essa semana seja frutífera.');
  };
}

async function generateMonthCard(){
  showLoading('Escrevendo carta do mês…','Lendo toda sua evolução de '+monthName(S.calYear,new Date().getMonth())+'.');
  try{
    const reflections=[...S.reflections].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,14);
    const trophiesEarned=TROPHY_DEFS.filter(t=>(S.trophies||{})[t.id]).map(t=>t.name);
    const totalTasks=Object.values(S.history||{}).reduce((acc,h)=>acc+(h.count||0),0);
    const totalFocos=S.records.totalFocos||0;
    const mk=curMonthKey();
    const monthDays=Object.keys(S.history||{}).filter(k=>k.startsWith(mk));
    const activeDays=monthDays.filter(k=>S.history[k].count>0||S.history[k].focos>0).length;
    const reflText=reflections.length>0?reflections.map(r=>`[${fmtDate(r.date)}] ${r.text}`).join('\n\n'):'Nenhuma reflexão escrita este mês.';
    const text=await callAI(
      [{role:'user',content:`Faça uma carta pastoral mensal de balanço para mim.\n\nMeus números do mês:\n- XP conquistado: ${S.xpMonth}\n- Dias ativos: ${activeDays}\n- Sequência atual: ${S.streak} dias\n- Blocos de foco completados: ${totalFocos}\n- Troféus conquistados: ${trophiesEarned.length>0?trophiesEarned.join(', '):'Nenhum ainda'}\n\nMinhas reflexões espirituais:\n${reflText}\n\nCom base em tudo isso, escreva uma carta pastoral de fim de mês: celebre o que foi bom, aponte o que pode melhorar, e proponha uma intenção para o próximo mês. Tom caloroso, direto, como um padre amigo. Máximo 400 palavras.`}],
      'Você é um padre pastoral que escreve cartas espirituais mensais de balanço e crescimento pessoal.'
    );
    $('monthCard').innerHTML=formatLetter(text);$('monthCard').dataset.generated='1';
    checkTrophy('month_card');persist();
  }catch(e){$('monthCard').innerHTML='<div class="empty small">Erro: '+esc(e.message)+'</div>';}
  finally{hideLoading();}
}

function formatLetter(text){
  return'<div>'+text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .split('\n').filter(l=>l.trim()).map(l=>'<p>'+esc(l.trim())+'</p>').join('')+'</div>';
}

async function loadMatches(){
  const refreshBtn=$('refreshMatches');
  if(refreshBtn)refreshBtn.textContent='⏳';
  showLoading('Buscando jogos…','Checando os campeonatos do dia.');
  try{
    const today=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const raw=await callAI(
      [{role:'user',content:`Hoje é ${today}. Liste os principais jogos de futebol que acontecem HOJE nos seguintes campeonatos: Brasileirão Série A, Libertadores, Sul-Americana, Copa do Mundo, Premier League, La Liga, Champions League. Foque em jogos com o Corinthians se houver. Retorne APENAS JSON válido neste formato exato, sem texto extra:\n[{"home":"Time A","away":"Time B","league":"Nome do campeonato","time":"19:00","live":false}]\nSe não houver jogos hoje, retorne: []`}],
      'Você é um assistente de dados esportivos. Retorne apenas JSON válido, sem markdown, sem explicações.'
    );
    let matches=[];
    try{const clean=text.replace(/```json?|```/g,'').trim();matches=JSON.parse(clean);}catch(e){matches=[];}
    S.matchesCache={date:todayKey(),data:matches};persist();
    showMatches(matches);
  }catch(e){$('matchesList').innerHTML='<div class="empty small">Erro ao carregar jogos. Verifique a API key.</div>';}
  finally{hideLoading();if(refreshBtn)refreshBtn.textContent='↻';}
}

async function generateIdeas(){
  const cfg=S.obraConfig||{};
  if(!cfg.about){openObraConfig(true);return;}
  showLoading('Gerando ideias…','IA pensando em conteúdo pra obra.');
  try{
    const postsFeitos=Object.values(S.obraPosts||{}).filter(p=>p.posted).length;
    const lastPostsText=cfg.lastPosts?'\n\nÚltimos posts publicados:\n'+cfg.lastPosts:'';
    const text=await callAI(
      [{role:'user',content:`Sou criador do perfil IAnaObra no Instagram. Meu público: engenheiros e profissionais da construção civil entre 30-45 anos que querem aprender a usar inteligência artificial no dia a dia de obra e em suas rotinas pessoais. Tom: didático, prático, próximo — como um colega de profissão que está um passo à frente.\n\nContexto do canal: ${cfg.about}${lastPostsText}\n\nJá publiquei ${postsFeitos} posts. Me dê 5 ideias de conteúdo diferentes e criativas pra postar agora. Para cada ideia inclua: título chamativo, formato sugerido (carrossel/reels/story), e 2 linhas de desenvolvimento da ideia. Retorne APENAS JSON: [{"title":"...","format":"...","body":"..."}]`}],
      'Você é um estrategista de conteúdo especializado em Instagram para profissionais da construção civil e inteligência artificial.'
    );
    let ideas=[];
    try{const clean=text.replace(/```json?|```/g,'').trim();ideas=JSON.parse(clean);}catch(e){ideas=[];}
    const out=$('ideasOutput');
    if(ideas.length===0){out.innerHTML='<div class="empty small">Não consegui gerar ideias. Tente novamente.</div>';return;}
    out.innerHTML='<div class="ideas-output">'+ideas.map(idea=>`
      <div class="idea-card">
        <div class="idea-title">${esc(idea.title||'')}</div>
        <div class="idea-body">${esc(idea.body||'')}</div>
        <div class="idea-format">📱 ${esc(idea.format||'')}</div>
      </div>`).join('')+'</div>';
  }catch(e){$('ideasOutput').innerHTML='<div class="empty small">Erro: '+esc(e.message)+'</div>';}
  finally{hideLoading();}
}

function openObraConfig(fromIdeas=false){
  const cfg=S.obraConfig||{};
  $('formModal').innerHTML=`
    <h3>🧱 Configurar IAnaObra</h3>
    ${fromIdeas?'<p style="color:var(--neon-yellow)">Configure seu canal primeiro para gerar ideias relevantes.</p>':''}
    <label>Sobre o canal (objetivo, diferenciais, tom de voz)</label>
    <textarea id="cfgAbout" rows="4" placeholder="Ex: Foco em BIM, orçamento com IA, automatização de relatórios. Tom: parceiro de profissão, não professor.">${esc(cfg.about||'')}</textarea>
    <label>Últimos 5 posts que funcionaram bem (títulos ou temas)</label>
    <textarea id="cfgLast" rows="3" placeholder="Ex: Como usei ChatGPT pra fazer ata de reunião em 5 min...">${esc(cfg.lastPosts||'')}</textarea>
    <div class="modal-actions">
      <button class="m-close" data-close-form>CANCELAR</button>
      <button class="m-save" id="saveCfgBtn">SALVAR</button>
    </div>`;
  $('formOverlay').classList.add('show');
  $('saveCfgBtn').onclick=()=>{
    S.obraConfig={...(S.obraConfig||{}),about:$('cfgAbout').value.trim(),lastPosts:$('cfgLast').value.trim()};
    persist();$('formOverlay').classList.remove('show');
    if(fromIdeas)setTimeout(generateIdeas,200);
  };
}

/* ── AÇÕES: HOJE ── */
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
        if(S.records.rescues===1)checkTrophy('rescue_1');
        if(S.records.rescues>=5)checkTrophy('rescue_5');
        setTimeout(()=>toast('LIMPEZA DE BACKLOG! 🧹','+'+XP.resgate+' pts de resgate'),900);}
      tk.doneDate=todayKey();tk.xpEarned=earned;tk.wasRescue=rescue;
      // checar primeiro troféu de task
      const doneTasks=S.tasks.filter(x=>x.done).length;if(doneTasks===1)checkTrophy('first_task');
      registerProgress('item');
    }
  }else if(kind==='habit'){
    const hb=S.habits.find(x=>x.id===id);if(!hb)return;
    hb.doneDates=hb.doneDates||[];
    if(hb.doneDates.includes(t)){hb.doneDates=hb.doneDates.filter(x=>x!==t);}
    else{hb.doneDates.push(t);celebrate(el,addXP(XP.habit));registerProgress('item');
      // troféu de hábito 7 dias
      const streak7=hb.doneDates.sort().reverse().reduce((acc,d,i,arr)=>{
        if(i===0)return 1;return daysBetween(arr[i],arr[i-1])===1?acc+1:0;},0);
      if(streak7>=7)checkTrophy('habit_7');}
  }
  persist();render();
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
  const text=$('reflectInput').value.trim();if(!text){toast('VAZIO','Escreve algo antes de salvar.');return;}
  const today=todayKey();
  S.reflections=S.reflections.filter(r=>r.date!==today);
  S.reflections.push({date:today,text});
  persist();renderFe();
  toast('REFLEXÃO SALVA ✍️','Guardada para a carta semanal.');
  const total=S.reflections.length;
  if(total===1)checkTrophy('reflect_1');if(total>=7)checkTrophy('reflect_7');
}

/* ── MODO AGORA ── */
const Focus={
  state:'idle',ref:null,totalSec:0,elapsedSec:0,interval:null,
  open(ref){this.ref=ref;this.state='intro';this.elapsedSec=0;
    $('focusTask').textContent=ref.name;$('focusStage').textContent='Compromisso de 5 minutos';
    $('focusHint').textContent='A única missão é começar. Vai, 5 minutos.';
    $('focus').classList.add('show');this.renderActions();
    this.updateRing(0,SEC_5);$('ringTime').textContent='05:00';
    document.querySelector('.focus').classList.remove('pausebg','donebg');},
  close(){clearInterval(this.interval);this.interval=null;$('focus').classList.remove('show');this.state='idle';this.ref=null;render();},
  start5(){this.state='run5';this.totalSec=SEC_5;this.elapsedSec=0;
    $('focusStage').textContent='Bola rolando · 5 min';$('focusHint').textContent='Só comece. O resto vem.';
    $('ringFg').className.baseVal='ring-fg';this.startTick();this.renderActions();},
  start20(){this.state='run20';this.totalSec=SEC_20;this.elapsedSec=0;
    $('focusStage').textContent='Bloco de foco · 20 min';$('focusHint').textContent='Mantém o pique.';
    $('ringFg').className.baseVal='ring-fg';document.querySelector('.focus').classList.remove('pausebg','donebg');
    this.startTick();this.renderActions();},
  startPause(){this.state='pause';this.totalSec=SEC_PAUSE;this.elapsedSec=0;
    $('focusStage').textContent='Intervalo · 5 min';$('focusHint').textContent='Levanta, bebe água.';
    $('ringFg').className.baseVal='ring-fg pause';document.querySelector('.focus').classList.add('pausebg');
    this.startTick();this.renderActions();},
  startTick(){clearInterval(this.interval);this.tickUI();
    this.interval=setInterval(()=>{this.elapsedSec++;this.tickUI();if(this.elapsedSec>=this.totalSec){clearInterval(this.interval);this.interval=null;this.onFinish();}},1000);},
  tickUI(){const rem=Math.max(0,this.totalSec-this.elapsedSec);$('ringTime').textContent=pad(Math.floor(rem/60))+':'+pad(rem%60);this.updateRing(this.elapsedSec,this.totalSec);},
  updateRing(el,tot){const C=2*Math.PI*108;$('ringFg').style.strokeDasharray=C;$('ringFg').style.strokeDashoffset=C*(1-Math.min(1,el/tot));},
  onFinish(){beep();if(navigator.vibrate)navigator.vibrate([120,80,120]);
    if(this.state==='run5'){this.state='after5';const res=addXP(XP.micro);persist();
      $('focusStage').textContent='Primeiro tempo cumprido ⚽';$('focusHint').textContent='Os 5 min mais difíceis foram. Quer emendar 20?';
      $('ringFg').className.baseVal='ring-fg done';document.querySelector('.focus').classList.add('donebg');$('ringTime').textContent='+'+res.gained;
      toast('FOCO INICIADO ⚽','+'+res.gained+' pts pelos 5 min');}
    else if(this.state==='run20'){this.state='after20';const res=addXP(XP.foco);registerProgress('foco');persist();
      $('focusStage').textContent='Bloco fechado 🏁';$('focusHint').textContent='Pausa de 5 ou mais um bloco?';
      $('ringFg').className.baseVal='ring-fg done';document.querySelector('.focus').classList.add('donebg');$('ringTime').textContent='+'+res.gained;
      toast('BLOCO DE FOCO! 🎯','+'+res.gained+' pts · '+(S.history[todayKey()].focos)+' hoje');}
    else if(this.state==='pause'){this.state='afterpause';$('focusStage').textContent='Intervalo encerrado';
      $('ringFg').className.baseVal='ring-fg done';document.querySelector('.focus').classList.remove('pausebg');document.querySelector('.focus').classList.add('donebg');$('ringTime').textContent='OK';}
    this.renderActions();},
  cancel(){clearInterval(this.interval);this.interval=null;if(['run5','run20','pause'].includes(this.state)){this.state='intro';$('focusStage').textContent='Pausado';this.renderActions();}},
  renderActions(){const box=$('focusActions');box.innerHTML='';
    const btn=(label,cls,act)=>{const b=document.createElement('button');b.className='f-btn '+cls;b.textContent=label;b.onclick=act;return b;};
    if(this.state==='intro'&&this.elapsedSec===0){box.appendChild(btn('COMEÇAR — SÓ 5 MIN','primary',()=>this.start5()));box.appendChild(btn('Cancelar','danger',()=>this.close()));}
    else if(this.state==='intro'){box.appendChild(btn('CONTINUAR','primary',()=>{this.startTick();}));box.appendChild(btn('Encerrar','secondary',()=>this.close()));}
    else if(['run5','run20','pause'].includes(this.state)){box.appendChild(btn('PAUSAR','secondary',()=>this.cancel()));box.appendChild(btn('Encerrar','danger',()=>this.close()));}
    else if(this.state==='after5'){box.appendChild(btn('CONTINUAR (20 MIN)','primary',()=>this.start20()));box.appendChild(btn('Pausa 5 min','secondary',()=>this.startPause()));box.appendChild(btn('Concluído','danger',()=>this.close()));}
    else if(this.state==='after20'){box.appendChild(btn('PAUSA 5 MIN','primary',()=>this.startPause()));box.appendChild(btn('Outro bloco','secondary',()=>this.start20()));box.appendChild(btn('Concluído','danger',()=>this.close()));}
    else if(this.state==='afterpause'){box.appendChild(btn('OUTRO BLOCO','primary',()=>this.start20()));box.appendChild(btn('Concluído','danger',()=>this.close()));}}
};
function beep(){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(.001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.18,ctx.currentTime+.04);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.6);o.start();o.stop(ctx.currentTime+.62);}catch(e){}}

/* ── FX ── */
function setStatus(k){const el=$('status');if(!el)return;el.className='status '+(k==='ok'?'ok':k==='sync'?'sync':'off');el.textContent=k==='ok'?'☁️ sincronizado':k==='sync'?'⏳ salvando…':'📴 local';}
function toast(title,sub){const el=$('toast');el.innerHTML=esc(title)+(sub?'<small>'+esc(sub)+'</small>':'');el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2600);}
function celebrate(el,res){if(!el)return;const r=el.getBoundingClientRect();for(let i=0;i<5;i++){const c=document.createElement('div');c.className='coin';c.textContent=Math.random()<.5?'⚽':'⭐';c.style.left=(r.left+r.width/2-12+(Math.random()*40-20))+'px';c.style.top=(r.top-8)+'px';c.style.animationDelay=(i*.05)+'s';document.body.appendChild(c);setTimeout(()=>c.remove(),1100);}if(!res.surprise)toast('+'+res.gained+' PTS','Boa! ⚽');}
function openFocusFor(kind,id){let ref=null;if(kind==='task'){const t=S.tasks.find(x=>x.id===id);if(t)ref={kind,id,name:t.name};}else if(kind==='habit'){const h=S.habits.find(x=>x.id===id);if(h)ref={kind,id,name:h.name};}if(ref)Focus.open(ref);}

/* ── SYNC MODAL ── */
function openSync(){$('myCode').textContent=Store.code();$('syncNote').innerHTML=Store.online()?'Guarde seu código. Quem tiver ele acessa seus dados.':'⚠️ Sync desligado. Preencha o Supabase no config.js.';$('overlay').classList.add('show');}
function closeSync(){$('overlay').classList.remove('show');}
async function linkCode(){const v=$('codeInput').value.trim().toUpperCase();if(!v)return;
  if(!Store.online()){toast('SYNC DESLIGADO','Configure o Supabase.');return;}
  Store.setCode(v);setStatus('sync');
  const remote=await Store.pullRemote();
  if(remote){S=Object.assign(S,remote);S.showAll=false;S.addMode='task';S.view='hoje';Store.saveLocal(remote);go('hoje');closeSync();toast('CONECTADO 🔗','Dados carregados!');setStatus('ok');}
  else{persist();closeSync();toast('CÓDIGO VINCULADO','Este aparelho usa esse código.');}}

/* ── EVENTOS ── */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');
  if(a){const{act,kind,id}=a.dataset;
    if(act==='toggle')toggle(kind,id,a.closest('.card'));
    else if(act==='del')del(kind,id);
    else if(act==='focus')openFocusFor(kind,id);
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
$('copyBtn').addEventListener('click',()=>navigator.clipboard.writeText(Store.code()).then(()=>toast('COPIADO ✅','Cole no outro aparelho')));
$('focusClose').addEventListener('click',()=>Focus.close());
$('loadReadingBtn').addEventListener('click',loadDailyReading);
$('saveReflectBtn').addEventListener('click',saveReflection);
$('weekCardBtn').addEventListener('click',generateWeekCard);
$('monthCardBtn').addEventListener('click',generateMonthCard);
$('refreshMatches').addEventListener('click',()=>{S.matchesCache={date:'',data:[]};loadMatches();});
$('ideasBtn').addEventListener('click',generateIdeas);
$('obraConfigBtn').addEventListener('click',()=>openObraConfig(false));
$('calPrev').addEventListener('click',()=>{S.calMonth--;if(S.calMonth<0){S.calMonth=11;S.calYear--;}renderObra();});
$('calNext').addEventListener('click',()=>{S.calMonth++;if(S.calMonth>11){S.calMonth=0;S.calYear++;}renderObra();});

/* ── BOOT ── */
(async function init(){
  Store.init();
  const local=Store.loadLocal();
  if(local)S=Object.assign(S,local);
  // garante campos novos
  S.history=S.history||{};S.weekly=S.weekly||{};S.trophies=S.trophies||{};
  S.reflections=S.reflections||[];S.obraPosts=S.obraPosts||{};
  S.obraConfig=S.obraConfig||{name:'IAnaObra',about:'',lastPosts:''};
  S.matchesCache=S.matchesCache||{date:'',data:[]};
  S.records=Object.assign({bestStreak:0,bestWeekXP:0,mostFocosInDay:0,totalFocos:0,rivalWins:0,rescues:0},S.records||{});
  S.xpMonth=S.xpMonth||0;S.totalXpEver=S.totalXpEver||S.xp||0;
  // limpa campos obsoletos
  delete S.projects;delete S.rewards;
  S.showAll=false;S.addMode='task';S.view='hoje';
  S.calYear=S.calYear||new Date().getFullYear();S.calMonth=S.calMonth!=null?S.calMonth:new Date().getMonth();
  setStatus(Store.online()?'sync':'off');render();

  if(Store.online()){
    const remote=await Store.pullRemote();
    if(remote&&(remote._updatedAt||0)>(S._updatedAt||0)){
      S=Object.assign(S,remote);
      S.history=S.history||{};S.weekly=S.weekly||{};S.trophies=S.trophies||{};
      S.reflections=S.reflections||[];S.obraPosts=S.obraPosts||{};
      S.obraConfig=S.obraConfig||{name:'IAnaObra',about:'',lastPosts:''};
      S.matchesCache=S.matchesCache||{date:'',data:[]};
      S.records=Object.assign({bestStreak:0,bestWeekXP:0,mostFocosInDay:0,totalFocos:0,rivalWins:0,rescues:0},S.records||{});
      S.xpMonth=S.xpMonth||0;S.totalXpEver=S.totalXpEver||S.xp||0;
      delete S.projects;delete S.rewards;
      S.showAll=false;S.addMode='task';S.view='hoje';
      Store.saveLocal(remote);
    }
    setStatus('ok');
  }
  // seed hábito inicial
  if(!S._seededHabits&&S.habits.length===0){
    S.habits.push({id:'h0',name:'Tomar Venvanse',icon:'💊',sub:'07:00 · pico vem aí',doneDates:[]});
    S._seededHabits=true;
  }
  rollover();persist();render();

  if(pendingMsg){setTimeout(()=>{
    if(pendingMsg.type==='shield')toast('ESCUDO ATIVADO 🛡️','Sequência preservada!');
    if(pendingMsg.type==='reset')toast('NOVO JOGO 🟢','Sem drama. Bata o mínimo hoje.');
  },600);}

  // carregar jogos do cache (sem chamar IA automaticamente)
  renderMatches();
  setInterval(()=>{if(S.view==='hoje')renderContext();},60000);
  // SVG gradient pro timer
  const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
  defs.innerHTML='<linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00e5ff"/><stop offset="100%" stop-color="#39ff14"/></linearGradient>';
  document.querySelector('.ring').insertBefore(defs,document.querySelector('.ring').firstChild);
})();
