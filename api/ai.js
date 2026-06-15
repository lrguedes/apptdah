// /api/ai.js — proxy seguro pra Anthropic.
// A API key fica em env var na Vercel (ANTHROPIC_API_KEY) e nunca aparece no frontend.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return;
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada na Vercel' });
    return;
  }

  try {
    const body = req.body || {};
    const {
      system,
      messages,
      tools,
      max_tokens = 1800,
      model = 'claude-haiku-4-5',
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages é obrigatório' });
      return;
    }

    const payload = { model, max_tokens, messages };
    if (system) payload.system = system;
    if (tools) payload.tools = tools;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Erro interno' });
  }
}
