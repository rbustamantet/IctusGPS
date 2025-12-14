import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/clinical-explain', async (req, res) => {
  const { prompt } = req.body;

  try {
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer TU_API_KEY_AQUI`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un médico especialista en neurología vascular.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 300
      })
    });

    const json = await aiRes.json();
    const text = json.choices?.[0]?.message?.content ?? 'Sin respuesta';

    res.json({ text });

  } catch (e) {
    res.status(500).json({ error: 'Error llamando a la IA' });
  }
});

export default router;
