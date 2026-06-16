// api/tecnico.js — Reunião com o Técnico (análise semanal personalizada)
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){res.status(200).end();return;}
  if(req.method!=='POST'){res.status(405).json({error:'Use POST'});return;}
  const apiKey=process.env.ANTHROPIC_API_KEY;
  if(!apiKey){res.status(500).json({error:'ANTHROPIC_API_KEY não configurada.'});return;}
  try{
    const{messages,system,max_tokens=2000}=req.body||{};
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-sonnet-4-5',max_tokens,system,messages})
    });
    const data=await r.json();
    const text=(data.content||[]).map(c=>c.text||'').join('').trim();
    res.status(r.status).json({text,raw:data});
  }catch(err){res.status(500).json({error:err.message||'Erro interno.'});}
};
