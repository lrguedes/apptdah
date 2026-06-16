// api/brincadeira.js — sugere brincadeira para o pai com a filha
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){res.status(200).end();return;}
  if(req.method!=='POST'){res.status(405).json({error:'Use POST'});return;}
  const apiKey=process.env.ANTHROPIC_API_KEY;
  if(!apiKey){res.status(500).json({error:'ANTHROPIC_API_KEY não configurada.'});return;}
  try{
    const{context=''}=req.body||{};
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({
        model:'claude-haiku-4-5',
        max_tokens:600,
        system:'Você é um especialista em desenvolvimento infantil e brincadeiras criativas para crianças de 5 anos. Sugere brincadeiras simples, divertidas e cheias de afeto para um pai passar tempo de qualidade com sua filha.',
        messages:[{role:'user',content:`Minha filha se chama Maria Clara e tem 5 anos. ${context?'Contexto: '+context+'.':''} Me sugira UMA brincadeira criativa, simples e afetiva que posso fazer com ela agora. Inclua: nome da brincadeira, como fazer (3-4 passos simples), por que ela vai adorar, e uma dica de como tornar ainda mais especial. Seja caloroso e divertido na linguagem.`}]
      })
    });
    const data=await r.json();
    const text=(data.content||[]).map(c=>c.text||'').join('').trim();
    res.status(r.status).json({text});
  }catch(err){res.status(500).json({error:err.message||'Erro interno.'});}
};
