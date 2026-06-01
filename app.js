/* ====================================================================
   FOCO ARENA v1.0  — completo
   Etapa 1: núcleo (Hoje, hábitos, tarefas, streak, XP)
   Etapa 2: Modo Agora (foco com Pomodoro adaptativo)
   Etapa 3: Projetos com micro-passos + "Ressuscitar"
   Etapa 4: Vestiário de recompensas
   Etapa 5: Liga (Rival Fantasma + recordes + histórico)
   Persistência: cache local + Supabase
   ==================================================================== */

/* ===================== CONFIG / ECONOMIA ===================== */
const XP = { micro:5, task:10, habit:10, foco:15, streakBonus:20, ressuscitar:30 };
const DAILY_MIN = 3;
const ESCUDO_CAP = 3;
const VISIBLE_LIMIT = 3;
const PROJECT_ABANDON_DAYS = 7;
const SEC_5 = 5*60, SEC_20 = 20*60, SEC_PAUSE = 5*60;

const DIVISIONS = [
  {name:'SÉRIE D', sub:'Divisão de Acesso',  need:0},
  {name:'SÉRIE C', sub:'Subindo de nível',   need:100},
  {name:'SÉRIE B', sub:'Time em ascensão',   need:250},
  {name:'SÉRIE A', sub:'Elite nacional',     need:450},
  {name:'LIBERTA', sub:'Libertadores',       need:700},
  {name:'MUNDIAL', sub:'Mundial de Clubes',  need:1000},
  {name:'LENDA',   sub:'Hall da Fama',       need:1400},
];

const DEFAULT_REWARDS = [
  {id:'r-game',  name:'30 min de videogame',  icon:'🎮', cost:50},
  {id:'r-foot',  name:'Assistir 1 jogo de futebol', icon:'⚽', cost:80},
  {id:'r-serie', name:'1 episódio de série',  icon:'📺', cost:40},
];

/* ===================== ESTADO ===================== */
let S = {
  xp:0, totalXpEver:0,
  streak:0, bestStreak:0,
  escudos:1, escudoWeekKey:null, lastStreakDate:null,
  tasks:[], habits:[], projects:[], rewards:[],
  history:{},       // 'YYYY-MM-DD': {count, focos, xp}
  weekly:{},        // 'YYYY-MM-DD' (segunda): {xp, rival, won, settled}
  records:{bestStreak:0, bestWeekXP:0, mostFocosInDay:0, totalFocos:0, totalUnlocks:0, rivalWins:0},
  lastSettledWeek:null,
  _seeded:false, _seededRewards:false, _updatedAt:0,
  // UI
  showAll:false, addMode:'task', view:'hoje'
};

/* ===================== STORE (local + supabase) ===================== */
const Store = (function(){
  const LS_CACHE='focoarena:cache', LS_CODE='focoarena:syncCode';
  let sb=null, online=false, saveTimer=null;
  function genCode(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const p=()=>Array.from({length:4},()=>a[Math.floor(Math.random()*a.length)]).join('');
    return 'ARENA-'+p()+'-'+p();}
  function getCode(){let c=localStorage.getItem(LS_CODE);if(!c){c=genCode();localStorage.setItem(LS_CODE,c);}return c;}
  function setCode(c){localStorage.setItem(LS_CODE,c.trim().toUpperCase());}
  function loadLocal(){try{const r=localStorage.getItem(LS_CACHE);return r?JSON.parse(r):null;}catch(e){return null;}}
  function saveLocal(s){try{localStorage.setItem(LS_CACHE,JSON.stringify(s));}catch(e){}}
  function init(){
    const cfg=window.FOCO_CONFIG||{};
    const ready=cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes('COLE_AQUI')&&typeof supabase!=='undefined';
    if(ready){try{sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);online=true;}catch(e){online=false;}}
    return online;
  }
  async function pullRemote(){if(!online)return null;
    try{const{data,error}=await sb.from('foco_arena').select('data').eq('sync_code',getCode()).maybeSingle();
      if(error)return null;return data?data.data:null;}catch(e){return null;}}
  async function pushRemote(s){if(!online)return false;
    try{const{error}=await sb.from('foco_arena').upsert({sync_code:getCode(),data:s,updated_at:new Date().toISOString()});return !error;}catch(e){return false;}}
  return{
    online:()=>online, code:getCode, setCode, init, loadLocal, pullRemote, saveLocal,
    save(state){saveLocal(state);if(!online){setStatus('off');return;}
      setStatus('sync');clearTimeout(saveTimer);
      saveTimer=setTimeout(async()=>{const ok=await pushRemote(state);setStatus(ok?'ok':'off');},600);}
  };
})();

/* ===================== DATAS ===================== */
const pad=n=>String(n).padStart(2,'0');
function keyOf(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function todayKey(){return keyOf(new Date());}
function dateFromKey(k){const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d);}
function daysBetween(a,b){return Math.round((dateFromKey(b)-dateFromKey(a))/86400000);}
function weekStartOf(d){const x=new Date(d);x.setHours(0,0,0,0);const day=x.getDay();const diff=day===0?-6:1-day;x.setDate(x.getDate()+diff);return x;}
function weekKeyOf(d=new Date()){return keyOf(weekStartOf(d));}
function weekDates(weekStart){const arr=[];for(let i=0;i<7;i++){const x=new Date(weekStart);x.setDate(x.getDate()+i);arr.push(keyOf(x));}return arr;}
function fmtDate(k){const d=dateFromKey(k);return pad(d.getDate())+'/'+pad(d.getMonth()+1);}

/* ===================== ROLLOVER / STREAK ===================== */
let pendingMessage=null;
function rollover(){
  const t=todayKey();
  const wk=weekKeyOf();
  // concede escudo semanal
  if(S.escudoWeekKey!==wk){
    if(S.escudoWeekKey!==null && S.escudos<ESCUDO_CAP) S.escudos++;
    S.escudoWeekKey=wk;
  }
  // verifica falha de dias
  if(S.lastStreakDate){
    const gap=daysBetween(S.lastStreakDate,t);
    if(gap>=2){
      let missed=gap-1, usedShield=false;
      while(missed>0 && S.escudos>0){S.escudos--;missed--;usedShield=true;}
      if(missed>0){S.streak=0;pendingMessage={type:'reset'};}
      else if(usedShield) pendingMessage={type:'shield'};
    }
  }
  // settle semana anterior se mudou
  settleWeeks();
}
function settleWeeks(){
  const curWk=weekKeyOf();
  if(S.lastSettledWeek===curWk) return;
  // calcula a semana anterior (a que acabou)
  if(S.lastSettledWeek){
    let cur=new Date(dateFromKey(S.lastSettledWeek));
    while(keyOf(weekStartOf(cur))!==curWk){
      const wkKey=keyOf(weekStartOf(cur));
      const sums=weeklyXP(weekStartOf(cur));
      const lastBefore=new Date(weekStartOf(cur));lastBefore.setDate(lastBefore.getDate()-7);
      const target=Math.max(70,Math.round(weeklyXP(lastBefore)*1.1));
      const won=sums>=target;
      S.weekly[wkKey]={xp:sums,rival:target,won,settled:true};
      if(won) S.records.rivalWins=(S.records.rivalWins||0)+1;
      if(sums>(S.records.bestWeekXP||0)) S.records.bestWeekXP=sums;
      cur.setDate(cur.getDate()+7);
      if(daysBetween(keyOf(weekStartOf(cur)),curWk)<=0) break;
    }
  }
  S.lastSettledWeek=curWk;
}
function todayMinimumMet(){const h=S.history[todayKey()]||{count:0,focos:0};return h.count>=DAILY_MIN||h.focos>=1;}
function registerProgress(type){
  const t=todayKey();
  if(!S.history[t]) S.history[t]={count:0,focos:0,xp:0};
  if(type==='foco'){
    S.history[t].focos++;
    S.records.totalFocos=(S.records.totalFocos||0)+1;
    if(S.history[t].focos>(S.records.mostFocosInDay||0)) S.records.mostFocosInDay=S.history[t].focos;
  } else {
    S.history[t].count++;
  }
  if(todayMinimumMet() && S.lastStreakDate!==t){
    S.streak++;
    if(S.streak>(S.records.bestStreak||0)) S.records.bestStreak=S.streak;
    if(S.streak>S.bestStreak) S.bestStreak=S.streak;
    S.lastStreakDate=t;
    addXP(XP.streakBonus,true);
    setTimeout(()=>toast('SEQUÊNCIA MANTIDA! 🔥','+'+XP.streakBonus+' pts · '+S.streak+' dias invicto'),700);
  }
}

/* ===================== XP ===================== */
function addXP(amount,silent){
  let mult=1, surprise=null;
  if(!silent){const r=Math.random();
    if(r<0.05){mult=3;surprise='HAT-TRICK! 3x ⚽⚽⚽';}
    else if(r<0.20){mult=2;surprise='BÔNUS SURPRESA! 2x ⚡';}}
  const gained=amount*mult;
  S.xp+=gained; S.totalXpEver+=gained;
  const t=todayKey();
  if(!S.history[t]) S.history[t]={count:0,focos:0,xp:0};
  S.history[t].xp=(S.history[t].xp||0)+gained;
  if(surprise) toast(surprise,'+'+gained+' pts');
  return {gained,surprise};
}
function spendXP(amount){if(S.xp<amount)return false;S.xp-=amount;return true;}
function currentDivision(){let i=0;for(let k=0;k<DIVISIONS.length;k++)if(S.totalXpEver>=DIVISIONS[k].need)i=k;return i;}

/* ===================== WEEKLY ===================== */
function weeklyXP(weekStartDate){let s=0;weekDates(weekStartDate).forEach(k=>{s+=(S.history[k]?.xp||0);});return s;}
function rivalState(){
  const today=new Date(); today.setHours(12,0,0,0);
  const thisStart=weekStartOf(today);
  const lastStart=new Date(thisStart);lastStart.setDate(lastStart.getDate()-7);
  const lastWeekXP=weeklyXP(lastStart);
  const rivalTarget=Math.max(70,Math.round(lastWeekXP*1.1));
  const dayIdx=Math.max(0,Math.min(6,Math.floor((today-thisStart)/86400000)));
  const rivalPace=Math.round(((dayIdx+1)/7)*rivalTarget);
  const myWeekXP=weeklyXP(thisStart);
  return{lastWeekXP,rivalTarget,rivalPace,myWeekXP,dayIdx};
}

/* ===================== PERSIST ===================== */
function persist(){
  S._updatedAt=Date.now();
  const{showAll,addMode,view,...data}=S;
  Store.save(data);
}

/* ===================== ROUTING ===================== */
function go(view){
  S.view=view;
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+view));
  document.querySelectorAll('.bnav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  render();
}

/* ===================== RENDER MASTER ===================== */
function render(){
  renderHUD();
  renderContext();
  if(S.view==='hoje') renderToday();
  if(S.view==='projetos') renderProjects();
  if(S.view==='vestiario') renderVestiario();
  if(S.view==='liga') renderLiga();
}
function renderHUD(){
  const di=currentDivision(); const d=DIVISIONS[di]; const next=DIVISIONS[di+1];
  $('division').childNodes[0].nodeValue=d.name;
  $('divName').textContent=d.sub;
  $('streakNum').textContent=S.streak;
  $('pts').textContent=S.xp+' PTS';
  if(next){const base=d.need,span=next.need-base,prog=Math.min(span,S.totalXpEver-base);
    $('fill').style.width=Math.max(4,(prog/span*100))+'%';
    $('xpToNext').textContent=(S.totalXpEver-base)+' / '+span+' XP';}
  else{$('fill').style.width='100%';$('xpToNext').textContent='DIVISÃO MÁXIMA 👑';}
  $('escudos').innerHTML='<span class="sh">🛡️</span> '+S.escudos+' escudo'+(S.escudos!==1?'s':'')+
    ' <span style="opacity:.6">(máx '+ESCUDO_CAP+')</span>';
}
function renderContext(){
  const h=new Date().getHours();const c=$('ctx');const txt=$('ctxText');c.className='ctx';
  if(h>=8&&h<17){c.classList.add('work');c.querySelector('.ic').textContent='💊';
    txt.innerHTML=(h>=9&&h<15)?'<b>Janela de pico do remédio.</b> Hora das tarefas mais pesadas — ataca os relatórios e atas agora.':'Modo trabalho. Tarefas de foco rendem mais nessa fase do dia.';}
  else if(h>=17&&h<19){c.classList.add('family');c.querySelector('.ic').textContent='💛';
    txt.innerHTML='<b>Modo presença.</b> Esse tempo é da sua pequena. O app espera por você — nada de tarefa agora.';}
  else{c.classList.add('me');c.querySelector('.ic').textContent='🎮';
    txt.innerHTML='<b>Seu tempo.</b> Hora de gastar recompensa e fazer só o que for leve. Você merece.';}
}
const $=id=>document.getElementById(id);
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

/* ===================== VIEW: HOJE ===================== */
function getTodayItems(){
  const t=todayKey();const items=[];
  S.habits.forEach(h=>items.push({kind:'habit',id:h.id,name:h.name,icon:h.icon||'🔁',
    sub:h.sub||'Hábito diário',done:(h.doneDates||[]).includes(t),xp:XP.habit}));
  S.tasks.forEach(tk=>items.push({kind:'task',id:tk.id,name:tk.name,icon:'🎯',
    sub:'Tarefa do dia',done:tk.done,xp:XP.task}));
  // próximo passo do projeto mais recente (não abandonado, não concluído)
  const activeProjs=S.projects
    .filter(p=>!isProjectDone(p))
    .sort((a,b)=>(b.lastTouchedDate||'').localeCompare(a.lastTouchedDate||''));
  if(activeProjs[0]){
    const p=activeProjs[0];
    const nx=(p.steps||[]).find(s=>!s.done);
    if(nx) items.push({kind:'step',id:nx.id,projectId:p.id,name:nx.name,
      icon:p.icon||'🎯',sub:'⚡ '+p.name,done:false,xp:XP.micro});
  }
  items.sort((a,b)=>(a.done?1:0)-(b.done?1:0));
  return items;
}
function renderToday(){
  const list=$('todayList');const items=getTodayItems();list.innerHTML='';
  if(items.length===0){list.innerHTML='<div class="empty">Escalação vazia. Adicione sua primeira jogada do dia 👇</div>';$('moreBtn').style.display='none';return;}
  const shown=S.showAll?items:items.slice(0,VISIBLE_LIMIT);
  shown.forEach((it,i)=>{
    const c=document.createElement('div');
    const cls=it.kind==='habit'?'hab':it.kind==='step'?'step':'task';
    c.className='card '+cls+(it.done?' done':'');
    c.style.animationDelay=(i*0.04)+'s';
    c.innerHTML=`<div class="check" data-act="toggle" data-kind="${it.kind}" data-id="${it.id}"${it.projectId?` data-pid="${it.projectId}"`:''}>✓</div>
      <div class="ic-emoji">${it.icon}</div>
      <div class="body"><div class="name">${esc(it.name)}</div><div class="sub">${esc(it.sub)}</div></div>
      <button class="play" data-act="focus" data-kind="${it.kind}" data-id="${it.id}"${it.projectId?` data-pid="${it.projectId}"`:''} title="Modo Agora">▶</button>
      <div class="xptag">+${it.xp}</div>
      ${it.kind!=='step'?`<button class="del" data-act="del" data-kind="${it.kind}" data-id="${it.id}">✕</button>`:''}`;
    list.appendChild(c);
  });
  const hidden=items.length-VISIBLE_LIMIT;const mb=$('moreBtn');
  if(hidden>0||S.showAll){mb.style.display='block';mb.textContent=S.showAll?'▲ recolher':'▼ ver mais '+hidden+' '+(hidden===1?'item':'itens');}
  else mb.style.display='none';
}

/* ===================== VIEW: PROJETOS ===================== */
function isProjectDone(p){const s=p.steps||[];return s.length>0 && s.every(x=>x.done);}
function projectProgress(p){const s=p.steps||[];if(s.length===0)return 0;return Math.round(s.filter(x=>x.done).length/s.length*100);}
function isAbandoned(p){if(!p.lastTouchedDate||isProjectDone(p))return false;return daysBetween(p.lastTouchedDate,todayKey())>=PROJECT_ABANDON_DAYS;}
function renderProjects(){
  const list=$('projectsList');list.innerHTML='';
  if(S.projects.length===0){list.innerHTML='<div class="empty">Nenhum campeonato em andamento.<br>Toque em <b>+ NOVO</b> pra criar seu primeiro projeto.</div>';return;}
  // ordena: ativos primeiro (por lastTouched desc), depois abandonados, depois concluídos
  const sorted=[...S.projects].sort((a,b)=>{
    const aD=isProjectDone(a),bD=isProjectDone(b);
    if(aD!==bD) return aD?1:-1;
    const aA=isAbandoned(a),bA=isAbandoned(b);
    if(aA!==bA) return aA?1:-1;
    return (b.lastTouchedDate||'').localeCompare(a.lastTouchedDate||'');
  });
  sorted.forEach((p,i)=>{
    const prog=projectProgress(p);const done=isProjectDone(p);const aband=isAbandoned(p);
    const nx=(p.steps||[]).find(s=>!s.done);
    const c=document.createElement('div');
    c.className='project-card'+(aband?' abandoned':'');
    c.style.animationDelay=(i*0.04)+'s';
    c.dataset.act='openproj'; c.dataset.id=p.id;
    c.innerHTML=`
      <div class="proj-head">
        <div class="proj-icon">${p.icon||'🎯'}</div>
        <div class="proj-title">${esc(p.name)}</div>
        ${done?'<div class="proj-badge" style="background:rgba(57,255,20,.15);color:var(--neon-green);border-color:rgba(57,255,20,.4)">CONCLUÍDO ✓</div>':aband?'<div class="proj-badge">ABANDONADO</div>':''}
      </div>
      <div class="proj-stats"><span>${(p.steps||[]).filter(s=>s.done).length} / ${(p.steps||[]).length} passos</span><b>${prog}%</b></div>
      <div class="proj-bar"><div class="proj-fill" style="width:${prog}%"></div></div>
      ${nx?`<div class="proj-next"><span>próximo:</span> ${esc(nx.name)}</div>`:''}
      ${aband?'<div class="proj-next" style="color:var(--neon-orange)">💪 retomar agora vale <b>+'+XP.ressuscitar+' pts</b> de bônus</div>':''}`;
    list.appendChild(c);
  });
}
function openProjectDetail(id){
  const p=S.projects.find(x=>x.id===id);if(!p)return;
  const aband=isAbandoned(p);
  const html=`
    <h3>${p.icon||'🎯'} ${esc(p.name)}</h3>
    ${aband?`<p style="color:var(--neon-orange)">⚡ Projeto parado há ${daysBetween(p.lastTouchedDate,todayKey())} dias. Ressuscitar agora dá <b>+${XP.ressuscitar} pts</b> de bônus.</p>`:''}
    <div id="stepsList"></div>
    <label>Adicionar passo</label>
    <div class="addbar"><input id="newStepInput" placeholder="Ex: Levantar dados do trimestre" maxlength="80"><button class="btn" id="addStepBtn">ADD</button></div>
    <div class="modal-actions">
      <button class="m-close" data-close-projdetail>FECHAR</button>
      <button class="m-link" id="delProjectBtn" style="background:linear-gradient(180deg,var(--neon-pink),#c70062);color:#fff">EXCLUIR</button>
    </div>`;
  $('projDetailModal').innerHTML=html;
  renderSteps(p);
  $('projDetailOverlay').classList.add('show');
  $('addStepBtn').onclick=()=>addStep(p.id);
  $('newStepInput').onkeydown=e=>{if(e.key==='Enter')addStep(p.id);};
  $('delProjectBtn').onclick=()=>{
    if(confirm('Excluir o campeonato "'+p.name+'"?')){
      S.projects=S.projects.filter(x=>x.id!==p.id);persist();render();
      $('projDetailOverlay').classList.remove('show');
    }
  };
}
function renderSteps(p){
  const sl=$('stepsList');if(!sl)return;sl.innerHTML='';
  if((p.steps||[]).length===0){sl.innerHTML='<div class="empty" style="margin-bottom:14px">Nenhum passo ainda. Quebre o projeto em jogadas pequenas 👇</div>';return;}
  p.steps.forEach(s=>{
    const r=document.createElement('div');
    r.className='step-row'+(s.done?' done':'');
    r.innerHTML=`<div class="check" data-act="togglestep" data-pid="${p.id}" data-id="${s.id}">✓</div>
      <div class="step-name">${esc(s.name)}</div>
      ${!s.done?`<button class="play" data-act="focus" data-kind="step" data-pid="${p.id}" data-id="${s.id}" title="Modo Agora">▶</button>`:''}
      <button class="del" data-act="delstep" data-pid="${p.id}" data-id="${s.id}">✕</button>`;
    sl.appendChild(r);
  });
}
function addStep(projectId){
  const inp=$('newStepInput');const v=inp.value.trim();if(!v)return;
  const p=S.projects.find(x=>x.id===projectId);if(!p)return;
  p.steps=p.steps||[];
  p.steps.push({id:'s'+Date.now(),name:v,done:false});
  inp.value='';persist();
  renderSteps(p);renderProjects();renderToday();
}
function toggleStep(projectId,stepId,el){
  const p=S.projects.find(x=>x.id===projectId);if(!p)return;
  const s=(p.steps||[]).find(x=>x.id===stepId);if(!s)return;
  if(!s.done){
    const wasAbandoned=isAbandoned(p);
    s.done=true; p.lastTouchedDate=todayKey();
    const res=addXP(XP.micro);
    if(wasAbandoned){addXP(XP.ressuscitar,true);setTimeout(()=>toast('PROJETO RESSUSCITADO! 💪','+'+XP.ressuscitar+' pts de bônus'),900);}
    registerProgress('item');
    celebrate(el,res);
    if(isProjectDone(p)) setTimeout(()=>toast('CAMPEONATO VENCIDO! 🏆','"'+p.name+'" concluído'),600);
  } else {
    s.done=false;
  }
  persist();render();
  if($('projDetailOverlay').classList.contains('show')) renderSteps(p);
}
function delStep(projectId,stepId){
  const p=S.projects.find(x=>x.id===projectId);if(!p)return;
  p.steps=(p.steps||[]).filter(x=>x.id!==stepId);
  persist();renderSteps(p);renderProjects();renderToday();
}
function openNewProjectForm(){
  $('formModal').innerHTML=`
    <h3>🎯 Novo campeonato</h3>
    <label>Nome do projeto</label>
    <input id="np-name" placeholder="Ex: Lançar novo produto" maxlength="60">
    <label>Ícone (emoji)</label>
    <input id="np-icon" placeholder="🎯" maxlength="2" value="🎯">
    <div class="modal-actions">
      <button class="m-close" data-close-form>CANCELAR</button>
      <button class="m-save" id="saveProjectBtn">CRIAR</button>
    </div>`;
  $('formOverlay').classList.add('show');
  setTimeout(()=>$('np-name').focus(),50);
  $('saveProjectBtn').onclick=()=>{
    const name=$('np-name').value.trim();const icon=$('np-icon').value.trim()||'🎯';
    if(!name)return;
    S.projects.unshift({id:'p'+Date.now(),name,icon,steps:[],createdDate:todayKey(),lastTouchedDate:todayKey()});
    persist();render();
    $('formOverlay').classList.remove('show');
    setTimeout(()=>openProjectDetail(S.projects[0].id),120);
  };
}

/* ===================== VIEW: VESTIÁRIO ===================== */
function renderVestiario(){
  $('balance').textContent=S.xp+' PTS';
  const list=$('rewardsList');list.innerHTML='';
  if(S.rewards.length===0){list.innerHTML='<div class="empty">Nenhuma recompensa cadastrada.</div>';return;}
  S.rewards.forEach((r,i)=>{
    const can=S.xp>=r.cost;
    const el=document.createElement('div');
    el.className='reward'+(can?'':' locked');
    el.style.animationDelay=(i*0.04)+'s';
    el.innerHTML=`<div class="ic-emoji">${r.icon||'🎁'}</div>
      <div class="body"><div class="name">${esc(r.name)}</div>
      <div class="sub">${(r.unlocks||[]).length>0?`Liberado ${(r.unlocks||[]).length}x`:'Disponível'}</div></div>
      <button class="cost ${can?'':'disabled'}" data-act="unlock" data-id="${r.id}">${r.cost} PTS</button>
      <button class="del" data-act="delreward" data-id="${r.id}">✕</button>`;
    list.appendChild(el);
  });
  // histórico
  const hist=[];
  S.rewards.forEach(r=>(r.unlocks||[]).forEach(u=>hist.push({name:r.name,icon:r.icon,at:u})));
  hist.sort((a,b)=>b.at-a.at);
  const hs=$('historySection');const hl=$('rewardsHistory');
  if(hist.length===0){hs.style.display='none';}
  else{hs.style.display='block';hl.innerHTML='';
    hist.slice(0,5).forEach(u=>{
      const d=new Date(u.at);const when=pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+pad(d.getHours())+':'+pad(d.getMinutes());
      const row=document.createElement('div');row.className='unlock-row';
      row.innerHTML=`<div>${u.icon||'🎁'} <b>${esc(u.name)}</b></div><span>${when}</span>`;
      hl.appendChild(row);
    });}
}
function unlockReward(id){
  const r=S.rewards.find(x=>x.id===id);if(!r)return;
  if(!spendXP(r.cost)){toast('PTS INSUFICIENTES','Faltam '+(r.cost-S.xp)+' pts');return;}
  r.unlocks=r.unlocks||[];r.unlocks.push(Date.now());
  S.records.totalUnlocks=(S.records.totalUnlocks||0)+1;
  persist();render();
  toast('LIBERADO! 🎉',r.icon+' '+r.name);
  // confete extra
  for(let i=0;i<10;i++){
    const c=document.createElement('div');c.className='coin';
    c.textContent=['⚽','⭐','🎉','🏆'][Math.floor(Math.random()*4)];
    c.style.left=(window.innerWidth/2-20+(Math.random()*200-100))+'px';
    c.style.top=(window.innerHeight/2)+'px';c.style.animationDelay=(i*0.05)+'s';
    document.body.appendChild(c);setTimeout(()=>c.remove(),1200);
  }
}
function openNewRewardForm(){
  $('formModal').innerHTML=`
    <h3>🛒 Nova recompensa</h3>
    <label>Nome da recompensa</label>
    <input id="nr-name" placeholder="Ex: Pedir pizza" maxlength="50">
    <label>Ícone (emoji)</label>
    <input id="nr-icon" placeholder="🍕" maxlength="2" value="🎁">
    <label>Custo em PTS</label>
    <input id="nr-cost" type="number" placeholder="60" min="5" max="9999" value="50">
    <div class="modal-actions">
      <button class="m-close" data-close-form>CANCELAR</button>
      <button class="m-save" id="saveRewardBtn">SALVAR</button>
    </div>`;
  $('formOverlay').classList.add('show');
  setTimeout(()=>$('nr-name').focus(),50);
  $('saveRewardBtn').onclick=()=>{
    const name=$('nr-name').value.trim();const icon=$('nr-icon').value.trim()||'🎁';
    const cost=parseInt($('nr-cost').value,10);
    if(!name||!cost||cost<1)return;
    S.rewards.push({id:'r'+Date.now(),name,icon,cost,unlocks:[]});
    persist();render();
    $('formOverlay').classList.remove('show');
  };
}

/* ===================== VIEW: LIGA ===================== */
function renderLiga(){
  const r=rivalState();
  $('myScore').textContent=r.myWeekXP;
  $('rivalScore').textContent=r.rivalPace;
  const max=Math.max(r.myWeekXP,r.rivalPace,r.rivalTarget,1);
  $('duelFill').style.width=Math.min(100,(r.myWeekXP/max*100))+'%';
  const diff=r.myWeekXP-r.rivalPace;
  const stat=$('duelStatus');
  if(diff>=0){stat.className='duel-status winning';stat.textContent='🟢 NA FRENTE por '+diff+' pts · meta da semana: '+r.rivalTarget;}
  else{stat.className='duel-status behind';stat.textContent='🔴 Atrás por '+Math.abs(diff)+' pts · meta da semana: '+r.rivalTarget;}

  // records
  const rec=S.records||{};
  $('records').innerHTML=`
    <div class="rec"><div class="rec-val">${rec.bestStreak||0}</div><div class="rec-label">🔥 Maior sequência</div></div>
    <div class="rec"><div class="rec-val">${rec.bestWeekXP||0}</div><div class="rec-label">🏆 Melhor semana</div></div>
    <div class="rec"><div class="rec-val">${rec.mostFocosInDay||0}</div><div class="rec-label">⚡ Mais focos/dia</div></div>
    <div class="rec"><div class="rec-val">${rec.totalFocos||0}</div><div class="rec-label">🎯 Total de focos</div></div>
    <div class="rec"><div class="rec-val">${rec.rivalWins||0}</div><div class="rec-label">👻 Rival derrotado</div></div>
    <div class="rec"><div class="rec-val">${rec.totalUnlocks||0}</div><div class="rec-label">🛒 Recompensas</div></div>`;

  // histórico semanal
  const wh=$('weeklyHistory');wh.innerHTML='';
  const weeks=Object.keys(S.weekly||{}).sort().reverse().slice(0,8);
  if(weeks.length===0){wh.innerHTML='<div class="empty">Ainda sem rodadas anteriores. A primeira fecha no próximo domingo.</div>';return;}
  weeks.forEach(wk=>{
    const w=S.weekly[wk];
    const row=document.createElement('div');
    row.className='week-row '+(w.won?'won':'lost');
    row.innerHTML=`<div class="week-date">semana de ${fmtDate(wk)}</div><div class="week-score">${w.xp} × ${w.rival} ${w.won?'✓':''}</div>`;
    wh.appendChild(row);
  });
}

/* ===================== MODO AGORA ===================== */
const Focus={
  state:'idle', ref:null, totalSec:0, elapsedSec:0, interval:null,
  open(ref){
    this.ref=ref;this.state='intro';this.elapsedSec=0;
    $('focusTask').textContent=ref.name;
    $('focusStage').textContent='Compromisso de 5 minutos';
    $('focusHint').textContent='A única missão é começar. Vai, 5 minutos.';
    $('focus').classList.add('show');
    this.renderActions();
    this.updateRing(0,SEC_5);
    $('ringTime').textContent='05:00';
    document.querySelector('.focus').classList.remove('pausebg','donebg');
  },
  close(){
    clearInterval(this.interval);this.interval=null;
    $('focus').classList.remove('show');
    this.state='idle';this.ref=null;
    render();
  },
  start5(){
    this.state='run5';this.totalSec=SEC_5;this.elapsedSec=0;
    $('focusStage').textContent='Bola rolando · 5 min';
    $('focusHint').textContent='Só comece. O resto vem.';
    document.querySelector('.ring-fg').className.baseVal='ring-fg run';
    this.startTick();this.renderActions();
  },
  start20(){
    this.state='run20';this.totalSec=SEC_20;this.elapsedSec=0;
    $('focusStage').textContent='Bloco de foco · 20 min';
    $('focusHint').textContent='Mantém o pique. Tira distrações e segue.';
    document.querySelector('.ring-fg').className.baseVal='ring-fg run';
    document.querySelector('.focus').classList.remove('pausebg','donebg');
    this.startTick();this.renderActions();
  },
  startPause(){
    this.state='pause';this.totalSec=SEC_PAUSE;this.elapsedSec=0;
    $('focusStage').textContent='Intervalo · 5 min';
    $('focusHint').textContent='Levanta, bebe água, olha pra longe.';
    document.querySelector('.ring-fg').className.baseVal='ring-fg pause';
    document.querySelector('.focus').classList.add('pausebg');
    this.startTick();this.renderActions();
  },
  startTick(){
    clearInterval(this.interval);
    this.tickUI();
    this.interval=setInterval(()=>{
      this.elapsedSec++;
      this.tickUI();
      if(this.elapsedSec>=this.totalSec){clearInterval(this.interval);this.interval=null;this.onFinish();}
    },1000);
  },
  tickUI(){
    const remain=Math.max(0,this.totalSec-this.elapsedSec);
    const m=Math.floor(remain/60),s=remain%60;
    $('ringTime').textContent=pad(m)+':'+pad(s);
    this.updateRing(this.elapsedSec,this.totalSec);
  },
  updateRing(elapsed,total){
    const C=2*Math.PI*108;
    const ratio=Math.min(1,elapsed/total);
    const offset=C*(1-ratio);
    const fg=document.querySelector('.ring-fg');
    fg.style.strokeDasharray=C;
    fg.style.strokeDashoffset=offset;
  },
  onFinish(){
    beep();
    if(navigator.vibrate)navigator.vibrate([120,80,120]);
    if(this.state==='run5'){
      this.state='after5';
      const res=addXP(XP.micro); persist();
      $('focusStage').textContent='Primeiro tempo cumprido ⚽';
      $('focusHint').textContent='Os 5 min mais difíceis já foram. Quer emendar um bloco de 20?';
      document.querySelector('.ring-fg').className.baseVal='ring-fg done';
      document.querySelector('.focus').classList.add('donebg');
      $('ringTime').textContent='+'+res.gained;
      toast('FOCO INICIADO ⚽','+'+res.gained+' pts pelos primeiros 5 min');
    }
    else if(this.state==='run20'){
      this.state='after20';
      const res=addXP(XP.foco); registerProgress('foco'); persist();
      $('focusStage').textContent='Bloco fechado 🏁';
      $('focusHint').textContent='Boa! Que tal uma pausa de 5 min antes do próximo?';
      document.querySelector('.ring-fg').className.baseVal='ring-fg done';
      document.querySelector('.focus').classList.add('donebg');
      $('ringTime').textContent='+'+res.gained;
      toast('BLOCO DE FOCO! 🎯','+'+res.gained+' pts · '+(S.history[todayKey()].focos)+' hoje');
    }
    else if(this.state==='pause'){
      this.state='afterpause';
      $('focusStage').textContent='Intervalo encerrado ☕';
      $('focusHint').textContent='Pronto pra outro bloco? Você decide.';
      document.querySelector('.ring-fg').className.baseVal='ring-fg done';
      document.querySelector('.focus').classList.remove('pausebg');
      document.querySelector('.focus').classList.add('donebg');
      $('ringTime').textContent='OK';
    }
    this.renderActions();
  },
  cancel(){
    clearInterval(this.interval);this.interval=null;
    if(this.state==='run5'||this.state==='run20'||this.state==='pause'){
      this.state='intro';this.elapsedSec=0;
      $('focusStage').textContent='Pausado';
      $('focusHint').textContent='Continuar de onde parou?';
      document.querySelector('.focus').classList.remove('pausebg','donebg');
      this.renderActions();
    }
  },
  resume(){
    if(this.elapsedSec<this.totalSec){
      this.startTick();
      if(this.totalSec===SEC_PAUSE){this.state='pause';document.querySelector('.focus').classList.add('pausebg');}
      else if(this.totalSec===SEC_20){this.state='run20';}
      else {this.state='run5';}
      $('focusStage').textContent=(this.totalSec===SEC_20?'Bloco de foco · 20 min':this.totalSec===SEC_PAUSE?'Intervalo · 5 min':'Bola rolando · 5 min');
      this.renderActions();
    }
  },
  renderActions(){
    const box=$('focusActions');box.innerHTML='';
    const btn=(label,cls,act)=>{const b=document.createElement('button');b.className='f-btn '+cls;b.textContent=label;b.onclick=act;return b;};
    if(this.state==='intro' && this.elapsedSec===0){
      box.appendChild(btn('COMEÇAR — SÓ 5 MIN','primary',()=>this.start5()));
      box.appendChild(btn('Cancelar','danger',()=>this.close()));
    }
    else if(this.state==='intro'){
      box.appendChild(btn('CONTINUAR','primary',()=>this.resume()));
      box.appendChild(btn('Encerrar','secondary',()=>this.close()));
    }
    else if(this.state==='run5'||this.state==='run20'||this.state==='pause'){
      box.appendChild(btn('PAUSAR','secondary',()=>this.cancel()));
      box.appendChild(btn('Encerrar','danger',()=>this.close()));
    }
    else if(this.state==='after5'){
      box.appendChild(btn('CONTINUAR (20 MIN)','primary',()=>this.start20()));
      box.appendChild(btn('Pausa 5 min','secondary',()=>this.startPause()));
      box.appendChild(btn('Concluído','danger',()=>this.close()));
    }
    else if(this.state==='after20'){
      box.appendChild(btn('PAUSA 5 MIN','primary',()=>this.startPause()));
      box.appendChild(btn('Outro bloco','secondary',()=>this.start20()));
      box.appendChild(btn('Concluído','danger',()=>this.close()));
    }
    else if(this.state==='afterpause'){
      box.appendChild(btn('OUTRO BLOCO','primary',()=>this.start20()));
      box.appendChild(btn('Concluído','danger',()=>this.close()));
    }
  }
};
function beep(){try{
  const ctx=new(window.AudioContext||window.webkitAudioContext)();
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.connect(g);g.connect(ctx.destination);
  o.type='sine';o.frequency.value=880;
  g.gain.setValueAtTime(0.001,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.18,ctx.currentTime+0.04);
  g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.6);
  o.start();o.stop(ctx.currentTime+0.62);
}catch(e){}}

/* ===================== AÇÕES ===================== */
function toggle(kind,id,el,pid){
  const t=todayKey();
  if(kind==='task'){
    const tk=S.tasks.find(x=>x.id===id);if(!tk)return;
    tk.done=!tk.done;
    if(tk.done){celebrate(el,addXP(XP.task));registerProgress('item');}
  } else if(kind==='habit'){
    const hb=S.habits.find(x=>x.id===id);if(!hb)return;
    hb.doneDates=hb.doneDates||[];
    if(hb.doneDates.includes(t))hb.doneDates=hb.doneDates.filter(x=>x!==t);
    else{hb.doneDates.push(t);celebrate(el,addXP(XP.habit));registerProgress('item');}
  } else if(kind==='step'){
    toggleStep(pid,id,el); return;
  }
  persist();render();
}
function del(kind,id){
  if(kind==='task') S.tasks=S.tasks.filter(x=>x.id!==id);
  else if(kind==='habit') S.habits=S.habits.filter(x=>x.id!==id);
  persist();render();
}
function add(){
  const inp=$('addInput');const v=inp.value.trim();if(!v)return;
  if(S.addMode==='task') S.tasks.unshift({id:'t'+Date.now(),name:v,done:false,date:todayKey()});
  else S.habits.unshift({id:'h'+Date.now(),name:v,icon:'🔁',sub:'Hábito diário',doneDates:[]});
  inp.value='';persist();render();inp.focus();
}
function openFocusFor(kind,id,pid){
  let ref=null;
  if(kind==='task'){const t=S.tasks.find(x=>x.id===id);if(t)ref={kind,id,name:t.name};}
  else if(kind==='habit'){const h=S.habits.find(x=>x.id===id);if(h)ref={kind,id,name:h.name};}
  else if(kind==='step'){const p=S.projects.find(x=>x.id===pid);const s=p&&(p.steps||[]).find(x=>x.id===id);if(s)ref={kind,id,pid,name:s.name};}
  if(ref) Focus.open(ref);
}

/* ===================== FX & STATUS ===================== */
function setStatus(kind){const el=$('status');if(!el)return;
  el.className='status '+(kind==='ok'?'ok':kind==='sync'?'sync':'off');
  el.textContent=kind==='ok'?'☁️ sincronizado':kind==='sync'?'⏳ salvando…':'📴 local';}
function toast(title,sub){const el=$('toast');
  el.innerHTML=esc(title)+(sub?('<small>'+esc(sub)+'</small>'):'');
  el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2400);}
function celebrate(el,res){
  if(!el)return;const r=el.getBoundingClientRect();
  for(let i=0;i<5;i++){const c=document.createElement('div');c.className='coin';
    c.textContent=Math.random()<.5?'⚽':'⭐';
    c.style.left=(r.left+r.width/2-12+(Math.random()*40-20))+'px';
    c.style.top=(r.top-8)+'px';c.style.animationDelay=(i*0.05)+'s';
    document.body.appendChild(c);setTimeout(()=>c.remove(),1100);}
  if(!res.surprise) toast('+'+res.gained+' PTS','Boa! Bola na rede ⚽');
}

/* ===================== SYNC MODAL ===================== */
function openSync(){
  $('myCode').textContent=Store.code();
  $('syncNote').innerHTML=Store.online()
    ?'Guarde seu código num lugar seguro: quem tiver ele acessa seus dados.'
    :'⚠️ Sincronização desligada. Seus dados estão salvos só neste aparelho.';
  $('overlay').classList.add('show');
}
function closeSync(){$('overlay').classList.remove('show');}
async function linkCode(){
  const v=$('codeInput').value.trim().toUpperCase();if(!v)return;
  if(!Store.online()){toast('SYNC DESLIGADO','Configure o Supabase no config.js');return;}
  Store.setCode(v);setStatus('sync');
  const remote=await Store.pullRemote();
  if(remote){
    S=Object.assign(S,remote);S.showAll=false;S.addMode='task';S.view='hoje';
    Store.saveLocal(remote);go('hoje');closeSync();
    toast('TIMES CONECTADOS 🔗','Dados deste código carregados!');setStatus('ok');
  } else {
    persist();closeSync();toast('CÓDIGO VINCULADO','Este aparelho agora usa esse código.');
  }
}

/* ===================== EVENTOS ===================== */
document.addEventListener('click',e=>{
  // ações em cards
  const a=e.target.closest('[data-act]');
  if(a){
    const{act,kind,id,pid}=a.dataset;
    if(act==='toggle') toggle(kind,id,a.closest('.card'),pid);
    else if(act==='togglestep') toggleStep(pid,id,a.closest('.step-row'));
    else if(act==='del') del(kind,id);
    else if(act==='delstep') delStep(pid,id);
    else if(act==='focus') openFocusFor(kind,id,pid);
    else if(act==='openproj') openProjectDetail(id);
    else if(act==='unlock') unlockReward(id);
    else if(act==='delreward'){
      if(confirm('Remover esta recompensa?')){S.rewards=S.rewards.filter(x=>x.id!==id);persist();render();}
    }
    return;
  }
  // tabs
  const tab=e.target.closest('.tab');
  if(tab){S.addMode=tab.dataset.mode;
    document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===tab));
    const inp=$('addInput');
    inp.placeholder=S.addMode==='task'?'Ex: Emitir relatório semanal':'Ex: Beber 2L de água';
    $('addBtn').className='btn'+(S.addMode==='habit'?' pink':'');return;}
  // bottom nav
  const bn=e.target.closest('.bnav-btn');
  if(bn){go(bn.dataset.view);return;}
  // fechar modais
  if(e.target.matches('[data-close-form]')||e.target===$('formOverlay')) $('formOverlay').classList.remove('show');
  if(e.target.matches('[data-close-projdetail]')||e.target===$('projDetailOverlay')) $('projDetailOverlay').classList.remove('show');
});
$('addBtn').addEventListener('click',add);
$('addInput').addEventListener('keydown',e=>{if(e.key==='Enter')add();});
$('moreBtn').addEventListener('click',()=>{S.showAll=!S.showAll;renderToday();});
$('gearBtn').addEventListener('click',openSync);
$('closeBtn').addEventListener('click',closeSync);
$('linkBtn').addEventListener('click',linkCode);
$('copyBtn').addEventListener('click',()=>{navigator.clipboard.writeText(Store.code()).then(()=>toast('COPIADO ✅','Cole no outro aparelho'));});
$('newProjectBtn').addEventListener('click',openNewProjectForm);
$('addRewardBtn').addEventListener('click',openNewRewardForm);
$('focusClose').addEventListener('click',()=>Focus.close());

/* ===================== BOOT ===================== */
(async function init(){
  Store.init();
  const local=Store.loadLocal();
  if(local) S=Object.assign(S,local);
  // garante novos campos
  S.projects=S.projects||[]; S.rewards=S.rewards||[];
  S.history=S.history||{}; S.weekly=S.weekly||{};
  S.records=Object.assign({bestStreak:0,bestWeekXP:0,mostFocosInDay:0,totalFocos:0,totalUnlocks:0,rivalWins:0},S.records||{});
  S.showAll=false; S.addMode='task'; S.view='hoje';
  setStatus(Store.online()?'sync':'off');
  render();

  if(Store.online()){
    const remote=await Store.pullRemote();
    if(remote && (remote._updatedAt||0)>(S._updatedAt||0)){
      S=Object.assign(S,remote);
      S.projects=S.projects||[]; S.rewards=S.rewards||[];
      S.history=S.history||{}; S.weekly=S.weekly||{};
      S.records=Object.assign({bestStreak:0,bestWeekXP:0,mostFocosInDay:0,totalFocos:0,totalUnlocks:0,rivalWins:0},S.records||{});
      S.showAll=false; S.addMode='task'; S.view='hoje';
      Store.saveLocal(remote);
    }
    setStatus('ok');
  }

  // seeds (uma vez só)
  if(!S._seeded && S.habits.length===0 && S.tasks.length===0){
    S.habits.push({id:'h0',name:'Tomar Venvanse',icon:'💊',sub:'07:00 · pico vem aí',doneDates:[]});
    S._seeded=true;
  }
  if(!S._seededRewards && S.rewards.length===0){
    DEFAULT_REWARDS.forEach(r=>S.rewards.push({...r,unlocks:[]}));
    S._seededRewards=true;
  }

  rollover();
  persist();
  render();

  if(pendingMessage){
    setTimeout(()=>{
      if(pendingMessage.type==='shield') toast('ESCUDO ATIVADO 🛡️','Cobriu sua falta. Sequência preservada!');
      if(pendingMessage.type==='reset') toast('NOVO JOGO 🟢','Sem drama. Bata 3 itens hoje e volte a embalar.');
    },500);
  }
  setInterval(()=>{if(S.view==='hoje')renderContext();},60000);

  // adiciona gradient no SVG
  const svgNS='http://www.w3.org/2000/svg';
  const defs=document.createElementNS(svgNS,'defs');
  defs.innerHTML='<linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00e5ff"/><stop offset="100%" stop-color="#39ff14"/></linearGradient>';
  document.querySelector('.ring').insertBefore(defs,document.querySelector('.ring').firstChild);
})();
