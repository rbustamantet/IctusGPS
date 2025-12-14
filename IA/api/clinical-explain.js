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
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Eres un médico especialista en neurología vascular.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 1500
  })
});

const json = await aiRes.json();

/* 👇 AÑADIR AQUÍ */
console.log('finish_reason:', json.choices?.[0]?.finish_reason);

let text = json.choices[0].message.content;
let finishReason = json.choices[0].finish_reason;

// Si la respuesta se ha cortado por longitud, pedir continuación
if (finishReason === 'length') {
  const continuationRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Eres un médico especialista en neurología vascular.' },
        { role: 'user', content: prompt },
        { role: 'assistant', content: text },
        { role: 'user', content: 'Continúa exactamente desde donde lo dejaste, sin repetir.' }
      ],
      temperature: 0.2,
      max_tokens: 1500
    })
  });

  const contJson = await continuationRes.json();
  text += contJson.choices[0].message.content;
}

res.json({ text });


  } catch (e) {
    res.status(500).json({ error: 'Error llamando a la IA' });
  }
});

export default router;
