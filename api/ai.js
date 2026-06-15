// api/ai.js — proxy seguro para a API da Anthropic
// A ANTHROPIC_API_KEY fica em Environment Variables na Vercel (nunca no código)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Use POST' }); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada nas Environment Variables da Vercel.' });
    return;
  }

  try {
    const {
      system,
      messages,
      max_tokens = 1800,
      model = 'claude-haiku-4-5',
      use_web_search = false,
    } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Campo "messages" é obrigatório.' });
      return;
    }

    const payload = { model, max_tokens, messages };
    if (system) payload.system = system;

    // Ativa busca na web quando solicitado (jogos do dia, etc.)
    if (use_web_search) {
      payload.tools = [{
        type: 'web_search_20250305',
        name: 'web_search',
      }];
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Extrai apenas os blocos de texto da resposta (ignora tool_use/tool_result)
    if (use_web_search && data.content) {
      const textOnly = data.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('');
      res.status(response.status).json({ ...data, text_only: textOnly });
    } else {
      res.status(response.status).json(data);
    }

  } catch (err) {
    res.status(500).json({ error: err.message || 'Erro interno no proxy.' });
  }
};
