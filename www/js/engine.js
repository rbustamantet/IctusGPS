/* =========================================================
   ENGINE — Motor clínico (sin DOM)
========================================================= */

/**
 * Construye el "núcleo" del cálculo clínico a partir de inputs ya leídos del DOM.
 * No renderiza nada. Devuelve todo lo necesario para que la UI pinte resultados.
 */
function computeCore({ age, sex, flags, special, weight, wUnit, scr, scrUnit }) {
  const female = (sex === 'F');

  const vasc = calcVasc(age || 0, female, flags);
  const hasbled = calcHASBLED(flags, age || 0);

  const strokeBase = getStrokeRiskPct(vasc.vasc);
  const bleedBase  = getBleedRiskPct(hasbled);

  const { crcl, scr_mgdl } = calcCrCl(
    age,
    sex,
    isFinite(weight) ? weight : NaN,
    wUnit,
    scr,
    scrUnit
  );

  const weightKg = isFinite(weight)
    ? ((wUnit === 'lb') ? (weight / 2.20462) : weight)
    : NaN;

  // ================================================
  // REGLAS DE NO ANTICOAGULAR
  // ================================================
  const noOAC_byLowRisk =
    (!female && vasc.vasc === 0) ||
    (female && vasc.va === 0 && vasc.vasc === 1);

  const noOAC_byHighBleed =
    special.noOACabs === true ||
    special.ichPrev === true;

  const considerOAC_byBorderline =
    (!female && vasc.vasc === 1) ||
    (female && vasc.vasc === 2);

  const noOAC = (noOAC_byLowRisk || noOAC_byHighBleed) && !special.valvular;

  // Reglas clínicas (prefer/avoid/notes)
  const { prefer, avoid, notes } = buildClinicalRules({
    crcl, age, special, weightKg, hasbled
  });

  // Nota específica “zona gris”
  if (considerOAC_byBorderline && !noOAC && !special.valvular) {
    notes.push(
      "🟠⚠️ CHA₂DS₂-VASc en zona intermedia (1 en varón, 2 en mujer): " +
      "se puede considerar anticoagulación oral tras valorar riesgo hemorrágico, " +
      "comorbilidad y preferencias del paciente; no es obligatoria según las guías ⚖️🟠"
    );
  }

  return {
    female,
    vasc,
    hasbled,
    strokeBase,
    bleedBase,
    crcl,
    scr_mgdl,
    weightKg,
    noOAC,
    noOAC_byLowRisk,
    noOAC_byHighBleed,
    considerOAC_byBorderline,
    prefer,
    avoid,
    notes
  };
}

/**
 * Construye el estado final del informe a partir de los elementos ya calculados.
 * Mantiene el mismo formato de __lastReport que usas.
 */
function buildLastReport({
  age, sex, weight, wUnit, scr, scrUnit,
  weightKg,
  crcl, scr_mgdl,
  vasc, hasbled,
  strokeBase, bleedBase,
  noOAC, noOAC_byLowRisk, noOAC_byHighBleed,
  special,
  preferredGlobal, avoidedGlobal,
  notes,
  dosesForReport
}) {
  return {
    ts: new Date().toISOString(),
    inputs: {
      age,
      sex,
      weight: isFinite(weight) ? weight : null,
      weightUnit: wUnit,
      scr: isFinite(scr) ? scr : null,
      scrUnit,
      weightKg: isFinite(weightKg) ? weightKg : null
    },
    renal: {
      crcl: isFinite(crcl) ? +crcl.toFixed(0) : null,
      scr_mgdl: isFinite(scr_mgdl) ? +scr_mgdl.toFixed(2) : null
    },
    scores: { va: vasc.va, vasc: vasc.vasc, hasbled },
    risks: { strokeBase: +strokeBase, bleedBase: +bleedBase },
    noOAC,
    noOAC_byLowRisk,
    noOAC_byHighBleed,
    special,
    preferredGlobal,
    avoidedGlobal,
    notes: [...notes],
    doses: dosesForReport
  };
}
