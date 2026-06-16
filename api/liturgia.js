// api/liturgia.js — busca leituras do dia na CNBB e gera reflexão via IA

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Use POST' }); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' }); return; }

  try {
    // 1. Busca leituras do dia na CNBB
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    
    let liturgyText = '';
    let source = 'ia';

    // Tenta a API da CNBB
    try {
      const cnbbUrl = `https://www.cnbb.org.br/liturgia-diaria/?data=${yyyy}-${mm}-${dd}`;
      const cnbbRes = await fetch(cnbbUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FocoArena/2.0)' },
        signal: AbortSignal.timeout(6000)
      });
      if (cnbbRes.ok) {
        const html = await cnbbRes.text();
        // Extrai texto das leituras do HTML
        const clean = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\s{2,}/g, ' ')
          .trim();
        // Pega trecho relevante (leituras costumam ter 2000-5000 chars)
        const idx = clean.search(/primeira leitura|leitura do dia/i);
        if (idx > -1) {
          liturgyText = clean.slice(idx, idx + 4000);
          source = 'cnbb';
        }
      }
    } catch (e) {
      // CNBB falhou, vai de IA pura
    }

    // 2. Monta prompt para a IA
    const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    let userPrompt;
    if (source === 'cnbb' && liturgyText) {
      userPrompt = `Hoje é ${dateStr}.\n\nAbaixo estão as leituras litúrgicas do dia extraídas do site da CNBB:\n\n${liturgyText}\n\nCom base EXATAMENTE nestas leituras (não invente nem substitua), me apresente de forma organizada:\n1. PRIMEIRA LEITURA (com referência bíblica exata)\n2. EVANGELHO (com referência bíblica exata)\n3. REFLEXÃO DO DIA — uma reflexão pastoral prática, direta e calorosa, como um padre próximo do povo que traz a Palavra para o cotidiano de forma simples e humana. Máximo 200 palavras na reflexão.`;
    } else {
      userPrompt = `Hoje é ${dateStr}. Apresente a liturgia católica do dia:\n1. PRIMEIRA LEITURA — indique a referência bíblica mais provável para esta data no calendário litúrgico e apresente o texto\n2. EVANGELHO — idem\n3. REFLEXÃO DO DIA — reflexão pastoral prática, direta e calorosa, como um padre próximo do povo. Máximo 200 palavras.\n\nIMPORTANTE: Se não tiver certeza das leituras exatas do dia, indique isso claramente antes das referências.`;
    }

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1400,
        system: 'Você é um assistente de espiritualidade católica. Apresenta as leituras do dia com precisão e faz reflexões pastorais simples e diretas.',
        messages: [{ role: 'user', content: userPrompt }]
      }),
    });

    const aiData = await aiRes.json();
    const text = (aiData.content || []).map(c => c.text || '').join('').trim();
    res.status(200).json({ text, source });

  } catch (err) {
    res.status(500).json({ error: err.message || 'Erro interno.' });
  }
};
