import express from 'express';
import clinicalExplain from './api/clinical-explain.js';

const app = express();
app.use(express.json());

// Permitir llamadas desde archivos HTML locales
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/api', clinicalExplain);

app.listen(3000, () => {
  console.log('🧠 Servidor IA activo en http://localhost:3000');
});
