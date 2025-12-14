/* =========================================================
   UTILIDADES GENERALES — Ictus GPS
   (Funciones puras y helpers transversales)
========================================================= */

const NDASH = '—';

/* Limita un valor entre mínimo y máximo */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/* Formateo numérico seguro */
function fmt(x, d = 1) {
  return isFinite(x) ? (+x).toFixed(d) : NDASH;
}

/* Número necesario a tratar/dañar desde porcentaje */
function oneIn(pct) {
  const p = parseFloat(pct);
  if (!isFinite(p) || p <= 0) return NDASH;
  return Math.round(100 / p);
}

/* Decodifica entidades HTML */
function decodeEntities(str) {
  const ta = document.createElement('textarea');
  ta.innerHTML = String(str);
  return ta.value;
}

/* Escapa atributos HTML (tooltips, title, etc.) */
function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* Toast institucional reutilizable */
let _toastTimer = null;

function showToast(msg, type = 'error') {
  const t = document.getElementById('toast');
  if (!t) return;

  t.textContent = decodeEntities(msg);
  t.classList.remove('warn', 'info');

  if (type === 'warn') t.classList.add('warn');
  if (type === 'info') t.classList.add('info');

  t.classList.add('show');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    t.classList.remove('show');
  }, 3500);
}
