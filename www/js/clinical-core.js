/* =========================================================
   CORE CLÍNICO — Cálculos y tablas base
   (NO DOM, NO UI)
========================================================= */

/* Riesgo anual de ictus según CHA2DS2-VASc */
const strokeRisksByVasc = {
  0: 0.2,
  1: 0.6,
  2: 2.2,
  3: 3.2,
  4: 4.8,
  5: 7.2,
  6: 9.7,
  7: 11.2,
  8: 10.8,
  9: 12.2
};

/* Riesgo anual de sangrado según HAS-BLED */
const bleedRiskByHASBLED = {
  0: 1.1,
  1: 1.9,
  2: 3.4,
  3: 5.8,
  4: 8.9,
  5: 12.5,
  6: 15.0
};

/* Reducción relativa de ictus por estrategia */
const RR_Stroke = {
  "No ACO": 1.00,
  "VKA": 0.36,
  "Apixabán": 0.36 * 0.79,
  "Dabigatrán": 0.36 * 0.66,
  "Edoxabán": 0.36 * 0.87,
  "Rivaroxabán": 0.36 * 0.79
};

/* Riesgo relativo de sangrado vs VKA */
const RR_Bleed_vs_VKA = {
  "No ACO": 0.30,
  "VKA": 1.00,
  "Apixabán": 0.69,
  "Dabigatrán": 0.93,
  "Edoxabán": 0.80,
  "Rivaroxabán": 1.04
};

/* Estrategias comparadas */
const STRATS = [
  "No ACO",
  "VKA",
  "Apixabán",
  "Dabigatrán",
  "Edoxabán",
  "Rivaroxabán"
];

/* CHA2DS2-VA y CHA2DS2-VASc */
function calcVasc(age, female, flags) {
  let s = 0;
  if (flags.cCongest) s += 1;
  if (flags.cHTN) s += 1;
  if (age >= 75 || flags.cAge75) s += 2;
  if (flags.cDiab) s += 1;
  if (flags.cStroke) s += 2;
  if (flags.cVasc) s += 1;
  if ((age >= 65 && age <= 74) || flags.cAge65) s += 1;

  const classicVASc = s + (female ? 1 : 0);
  return { va: s, vasc: classicVASc };
}

/* HAS-BLED */
function calcHASBLED(flags, age) {
  let s = 0;
  if (flags.hHTN) s += 1;
  if (flags.hRenal) s += 1;
  if (flags.hLiver) s += 1;
  if (flags.hStroke) s += 1;
  if (flags.hBleed) s += 1;
  if (flags.hLabileINR) s += 1;
  if (age > 65 || flags.hElder) s += 1;
  if (flags.hDrugs) s += 1;
  if (flags.hAlcohol) s += 1;
  return s;
}

/* Riesgo embólico anual (%) */
function getStrokeRiskPct(vasc) {
  const k = Math.max(0, Math.min(9, vasc | 0));
  return strokeRisksByVasc[k] ?? 0;
}

/* Riesgo hemorrágico anual (%) */
function getBleedRiskPct(hasbled) {
  const k = Math.max(0, Math.min(6, hasbled | 0));
  return bleedRiskByHASBLED[k] ?? bleedRiskByHASBLED[6];
}

/* Cockcroft–Gault */
function calcCrCl(age, sex, weightVal, wUnit, scrVal, scrUnit) {
  if (!isFinite(age) || !sex || !isFinite(weightVal) || !isFinite(scrVal)) {
    return { crcl: NaN, scr_mgdl: NaN };
  }

  const wtKg = (wUnit === 'lb') ? (weightVal / 2.20462) : weightVal;
  const scrMg = (scrUnit === 'umol') ? (scrVal / 88.4) : scrVal;

  const base = (140 - age) * wtKg / (72 * scrMg);
  const factor = (sex === 'F') ? 0.85 : 1.0;

  return {
    crcl: base * factor,
    scr_mgdl: scrMg
  };
}
