/* ====================================================================
   FOCO ARENA — app standalone (Etapa 1)
   Persistência: cache local (instantâneo/offline) + Supabase (sync)
   ==================================================================== */

/* ===================== ECONOMIA & CONFIG ===================== */
const XP = { micro:5, task:10, habit:10, foco:15, streakBonus:20, ressuscitar:30 };
const DAILY_MIN = 3;
const ESCUDO_CAP = 3;
const VISIBLE_LIMIT = 3;

const DIVISIONS = [
  {name:'SÉRIE D', sub:'Divisão de Acesso',  need:0},
  {name:'SÉRIE C', sub:'Subindo de nível',   need:100},
  {name:'SÉRIE B', sub:'Time em ascensão',   need:250},
  {name:'SÉRIE A', sub:'Elite nacional',     need:450},
  {name:'LIBERTA', sub:'Libertadores',       need:700},
  {name:'MUNDIAL', sub:'Mundial de Clubes',  need:1000},
  {name:'LENDA',   sub:'Hall da Fama',       need:1400},
];

/* ===================== ESTADO ===================== */
let S = {
  xp:0, totalXpEver:0, streak:0, bestStreak:0,
  escudos:1, escudoWeekKey:null, lastStreakDate:null,
  tasks:[], habits:[], history:{}, _updatedAt:0, _seeded:false,
  showAll:false, addMode:'task',
};

/* ===================== STORE (local + supabase) ===================== */
const Store = (function(){
  const LS_CACHE = 'focoarena:cache';
  const LS_CODE  = 'focoarena:syncCode';
  let sb = null, online = false, saveTimer = null;

  function genCode(){
    const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const part=()=>Array.from({length:4},()=>a[Math.floor(Math.random()*a.length)]).join('');
    return 'ARENA-'+part()+'-'+part();
  }
  function getCode(){
    let c = localStorage.getItem(LS_CODE);
    if(!c){ c = genCode(); localStorage.setItem(LS_CODE, c); }
    return c;
  }
  function setCode(c){ localStorage.setItem(LS_CODE, c.trim().toUpperCase()); }

  function loadLocal(){
    try{ const raw=localStorage.getItem(LS_CACHE); return raw?JSON.parse(raw):null; }catch(e){ return null; }
  }
  function saveLocal(state){
    try{ localStorage.setItem(LS_CACHE, JSON.stringify(state)); }catch(e){}
  }

  function initSupabase(){
    const cfg = window.FOCO_CONFIG||{};
    const ready = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
      !cfg.SUPABASE_URL.includes('COLE_AQUI') && typeof supabase!=='undefined';
    if(ready){
      try{ sb = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY); online=true; }
      catch(e){ online=false; }
    }
    return online;
  }

  async function pullRemote(){
    if(!online) return null;
    try{
      const { data, error } = await sb.from('foco_arena')
        .select('data').eq('sync_code', getCode()).maybeSingle();
      if(error) return null;
      return data ? data.data : null;
    }catch(e){ return null; }
  }

  async function pushRemote(state){
    if(!online) return false;
    try{
      const { error } = await sb.from('foco_arena')
        .upsert({ sync_code:getCode(), data:state, updated_at:new Date().toISOString() });
      return !error;
    }catch(e){ return false; }
  }

  return {
    online: ()=>online,
    code: getCode,
    setCode,
    init: initSupabase,
    loadLocal,
    pullRemote,
    saveLocal,
    // grava local na hora + agenda push remoto (debounce)
    save(state){
      saveLocal(state);
      if(!online){ setStatus('off'); return; }
      setStatus('sync');
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async ()=>{
        const ok = await pushRemote(state);
        setStatus(ok?'ok':'off');
      }, 600);
    }
  };
})();

/* ===================== DATAS ===================== */
function todayKey(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function dateFromKey(k){const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d);}
function daysBetween(a,b){return Math.round((dateFromKey(b)-dateFromKey(a))/86400000);}
function weekKey(){const d=new Date();const onejan=new Date(d.getFullYear(),0,1);const wk=Math.ceil(((d-onejan)/86400000+onejan.getDay()+1)/7);return d.getFullYear()+'-W'+wk;}

/* ===================== LÓGICA DIÁRIA ===================== */
let pendingMessage=null;
function rollover(){
  const t = todayKey();
  const wk = weekKey();
  if(S.escudoWeekKey !== wk){
    if(S.escudoWeekKey!==null && S.escudos<ESCUDO_CAP){ S.escudos++; }
    S.escudoWeekKey = wk;
  }
  if(S.lastStreakDate){
    const gap = daysBetween(S.lastStreakDate, t);
    if(gap >= 2){
      let missed = gap - 1, usedShield=false;
      while(missed > 0 && S.escudos > 0){ S.escudos--; missed--; usedShield=true; }
      if(missed > 0){ S.streak = 0; pendingMessage={type:'reset'}; }
      else if(usedShield){ pendingMessage={type:'shield'}; }
    }
  }
}
function todayMinimumMet(){
  const h = S.history[todayKey()] || {count:0,focos:0};
  return h.count >= DAILY_MIN || h.focos >= 1;
}
function registerProgress(){
  const t = todayKey();
  if(!S.history[t]) S.history[t]={count:0,focos:0};
  S.history[t].count++;
  if(todayMinimumMet() && S.lastStreakDate !== t){
    S.streak++;
    if(S.streak > S.bestStreak) S.bestStreak = S.streak;
    S.lastStreakDate = t;
    addXP(XP.streakBonus, true);
    setTimeout(()=>toast('SEQUÊNCIA MANTIDA! 🔥', '+'+XP.streakBonus+' pts · '+S.streak+' dias invicto'),700);
  }
}

/* ===================== XP ===================== */
function addXP(amount, silent){
  let mult=1, surprise=null;
  if(!silent){
    const r=Math.random();
    if(r<0.05){ mult=3; surprise='HAT-TRICK! 3x ⚽⚽⚽'; }
    else if(r<0.20){ mult=2; surprise='BÔNUS SURPRESA! 2x ⚡'; }
  }
  const gained=amount*mult;
  S.xp+=gained; S.totalXpEver+=gained;
  if(surprise) toast(surprise,'+'+gained+' pts');
  return {gained, surprise};
}
function currentDivision(){
  let idx=0;
  for(let i=0;i<DIVISIONS.length;i++) if(S.totalXpEver>=DIVISIONS[i].need) idx=i;
  return idx;
}

/* ===================== PERSISTÊNCIA (wrapper) ===================== */
function persist(){
  S._updatedAt = Date.now();
  const {showAll, addMode, ...data} = S;
  Store.save(data);
}

/* ===================== RENDER ===================== */
function getTodayItems(){
  const t=todayKey(); const items=[];
  S.habits.forEach(h=> items.push({kind:'habit', id:h.id, name:h.name, icon:h.icon||'🔁',
    sub:h.sub||'Hábito diário', done:(h.doneDates||[]).includes(t), xp:XP.habit}));
  S.tasks.forEach(tk=> items.push({kind:'task', id:tk.id, name:tk.name, icon:'🎯',
    sub:'Tarefa do dia', done:tk.done, xp:XP.task}));
  items.sort((a,b)=>(a.done?1:0)-(b.done?1:0));
  return items;
}
function render(){
  const di=currentDivision(); const d=DIVISIONS[di]; const next=DIVISIONS[di+1];
  document.getElementById('division').childNodes[0].nodeValue=d.name;
  document.getElementById('divName').textContent=d.sub;
  document.getElementById('streakNum').textContent=S.streak;
  document.getElementById('pts').textContent=S.xp+' PTS';
  if(next){
    const base=d.need, span=next.need-base, prog=Math.min(span,S.totalXpEver-base);
    document.getElementById('fill').style.width=Math.max(4,(prog/span*100))+'%';
    document.getElementById('xpToNext').textContent=(S.totalXpEver-base)+' / '+span+' XP';
  }else{
    document.getElementById('fill').style.width='100%';
    document.getElementById('xpToNext').textContent='DIVISÃO MÁXIMA 👑';
  }
  const e=document.getElementById('escudos');
  e.innerHTML='<span class="sh">🛡️</span> '+S.escudos+' escudo'+(S.escudos!==1?'s':'')+
    ' <span style="opacity:.6">(máx '+ESCUDO_CAP+')</span>';
  renderContext();

  const list=document.getElementById('todayList');
  const items=getTodayItems(); list.innerHTML='';
  if(items.length===0){
    list.innerHTML='<div class="empty">Escalação vazia. Adicione sua primeira jogada do dia 👇</div>';
    document.getElementById('moreBtn').style.display='none';
  }else{
    const shown=S.showAll?items:items.slice(0,VISIBLE_LIMIT);
    shown.forEach((it,i)=>{
      const c=document.createElement('div');
      c.className='card '+(it.kind==='habit'?'hab':'task')+(it.done?' done':'');
      c.style.animationDelay=(i*0.04)+'s';
      c.innerHTML=`<div class="check" data-act="toggle" data-kind="${it.kind}" data-id="${it.id}">✓</div>
        <div class="ic-emoji">${it.icon}</div>
        <div class="body"><div class="name">${esc(it.name)}</div><div class="sub">${esc(it.sub)}</div></div>
        <div class="xptag">+${it.xp}</div>
        <button class="del" data-act="del" data-kind="${it.kind}" data-id="${it.id}">✕</button>`;
      list.appendChild(c);
    });
    const hidden=items.length-VISIBLE_LIMIT; const mb=document.getElementById('moreBtn');
    if(hidden>0||S.showAll){ mb.style.display='block';
      mb.textContent=S.showAll?'▲ recolher':'▼ ver mais '+hidden+' '+(hidden===1?'item':'itens'); }
    else mb.style.display='none';
  }
}
function renderContext(){
  const h=new Date().getHours();
  const c=document.getElementById('ctx'); const txt=document.getElementById('ctxText');
  c.className='ctx';
  if(h>=8&&h<17){ c.classList.add('work'); c.querySelector('.ic').textContent='💊';
    txt.innerHTML=(h>=9&&h<15)
      ?'<b>Janela de pico do remédio.</b> Hora das tarefas mais pesadas — ataca os relatórios e atas agora.'
      :'Modo trabalho. Tarefas de foco rendem mais nessa fase do dia.';
  }else if(h>=17&&h<19){ c.classList.add('family'); c.querySelector('.ic').textContent='💛';
    txt.innerHTML='<b>Modo presença.</b> Esse tempo é da sua pequena. O app espera por você — nada de tarefa agora.';
  }else{ c.classList.add('me'); c.querySelector('.ic').textContent='🎮';
    txt.innerHTML='<b>Seu tempo.</b> Hora de gastar recompensa e fazer só o que for leve. Você merece.';
  }
}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

/* ===================== AÇÕES ===================== */
function toggle(kind,id,el){
  const t=todayKey();
  if(kind==='task'){
    const tk=S.tasks.find(x=>x.id===id); if(!tk)return;
    tk.done=!tk.done;
    if(tk.done){ celebrate(el, addXP(XP.task)); registerProgress(); }
  }else{
    const hb=S.habits.find(x=>x.id===id); if(!hb)return;
    hb.doneDates=hb.doneDates||[];
    if(hb.doneDates.includes(t)) hb.doneDates=hb.doneDates.filter(x=>x!==t);
    else{ hb.doneDates.push(t); celebrate(el, addXP(XP.habit)); registerProgress(); }
  }
  persist(); render();
}
function del(kind,id){
  if(kind==='task') S.tasks=S.tasks.filter(x=>x.id!==id);
  else S.habits=S.habits.filter(x=>x.id!==id);
  persist(); render();
}
function add(){
  const inp=document.getElementById('addInput'); const v=inp.value.trim(); if(!v)return;
  if(S.addMode==='task') S.tasks.unshift({id:'t'+Date.now(),name:v,done:false,date:todayKey()});
  else S.habits.unshift({id:'h'+Date.now(),name:v,icon:'🔁',sub:'Hábito diário',doneDates:[]});
  inp.value=''; persist(); render(); inp.focus();
}

/* ===================== FX & STATUS ===================== */
function setStatus(kind){
  const el=document.getElementById('status'); if(!el)return;
  el.className='status '+(kind==='ok'?'ok':kind==='sync'?'sync':'off');
  el.textContent = kind==='ok'?'☁️ sincronizado':kind==='sync'?'⏳ salvando…':'📴 local';
}
function toast(title,sub){
  const el=document.getElementById('toast');
  el.innerHTML=esc(title)+(sub?('<small>'+esc(sub)+'</small>'):'');
  el.classList.add('show'); clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove('show'),2200);
}
function celebrate(el,res){
  if(!el)return;
  const r=el.getBoundingClientRect();
  for(let i=0;i<5;i++){
    const c=document.createElement('div'); c.className='coin';
    c.textContent=Math.random()<.5?'⚽':'⭐';
    c.style.left=(r.left+r.width/2-12+(Math.random()*40-20))+'px';
    c.style.top=(r.top-8)+'px'; c.style.animationDelay=(i*0.05)+'s';
    document.body.appendChild(c); setTimeout(()=>c.remove(),1100);
  }
  if(!res.surprise) toast('+'+res.gained+' PTS','Boa! Bola na rede ⚽');
}

/* ===================== SYNC MODAL ===================== */
function openSync(){
  document.getElementById('myCode').textContent=Store.code();
  document.getElementById('syncNote').innerHTML = Store.online()
    ? 'Guarde seu código num lugar seguro: quem tiver ele acessa seus dados.'
    : '⚠️ Sincronização desligada (chaves do Supabase não configuradas no <b>config.js</b>). Seus dados estão salvos só neste aparelho.';
  document.getElementById('overlay').classList.add('show');
}
function closeSync(){ document.getElementById('overlay').classList.remove('show'); }
async function linkCode(){
  const v=document.getElementById('codeInput').value.trim().toUpperCase();
  if(!v){ return; }
  if(!Store.online()){ toast('SYNC DESLIGADO','Configure o Supabase no config.js'); return; }
  Store.setCode(v);
  setStatus('sync');
  const remote=await Store.pullRemote();
  if(remote){
    S=Object.assign(S,remote); S.showAll=false; S.addMode='task';
    Store.saveLocal(remote); render(); closeSync();
    toast('TIMES CONECTADOS 🔗','Dados deste código carregados!');
    setStatus('ok');
  }else{
    // código novo/vazio: empurra o estado atual pra ele
    persist(); closeSync();
    toast('CÓDIGO VINCULADO','Este aparelho agora usa esse código.');
  }
}

/* ===================== EVENTOS ===================== */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');
  if(a){ const{act,kind,id}=a.dataset;
    if(act==='toggle') toggle(kind,id,a.closest('.card'));
    if(act==='del') del(kind,id); return; }
  const tab=e.target.closest('.tab');
  if(tab){ S.addMode=tab.dataset.mode;
    document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===tab));
    const inp=document.getElementById('addInput');
    inp.placeholder=S.addMode==='task'?'Ex: Emitir relatório semanal':'Ex: Beber 2L de água';
    document.getElementById('addBtn').className='btn'+(S.addMode==='habit'?' pink':''); return; }
});
document.getElementById('addBtn').addEventListener('click',add);
document.getElementById('addInput').addEventListener('keydown',e=>{if(e.key==='Enter')add();});
document.getElementById('moreBtn').addEventListener('click',()=>{S.showAll=!S.showAll;render();});
document.getElementById('gearBtn').addEventListener('click',openSync);
document.getElementById('closeBtn').addEventListener('click',closeSync);
document.getElementById('linkBtn').addEventListener('click',linkCode);
document.getElementById('copyBtn').addEventListener('click',()=>{
  navigator.clipboard.writeText(Store.code()).then(()=>toast('COPIADO ✅','Cole no outro aparelho'));
});

/* ===================== BOOT ===================== */
(async function init(){
  Store.init();
  // 1) cache local primeiro (instantâneo)
  const local=Store.loadLocal();
  if(local) S=Object.assign(S,local);
  S.showAll=false; S.addMode='task';
  setStatus(Store.online()?'sync':'off');
  render();

  // 2) puxa do Supabase e funde por _updatedAt
  if(Store.online()){
    const remote=await Store.pullRemote();
    if(remote && (remote._updatedAt||0) > (S._updatedAt||0)){
      S=Object.assign(S,remote); S.showAll=false; S.addMode='task';
      Store.saveLocal(remote);
    }
    setStatus('ok');
  }

  // 3) seed inicial (Venvanse) só se nunca houve nada
  if(!S._seeded && S.habits.length===0 && S.tasks.length===0){
    S.habits.push({id:'h0',name:'Tomar Venvanse',icon:'💊',sub:'07:00 · pico vem aí',doneDates:[]});
    S._seeded=true;
  }

  // 4) rollover diário (streak/escudos)
  rollover();
  persist();
  render();

  if(pendingMessage){
    setTimeout(()=>{
      if(pendingMessage.type==='shield') toast('ESCUDO ATIVADO 🛡️','Cobriu sua falta. Sequência preservada!');
      if(pendingMessage.type==='reset') toast('NOVO JOGO 🟢','Sem drama. Bata 3 itens hoje e volte a embalar.');
    },500);
  }
  setInterval(renderContext,60000);
})();
