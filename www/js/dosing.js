/* =========================================================
   POSOLOGÍA — Anticoagulación FA
   (Lógica clínica pura, sin DOM)
========================================================= */

function doseSuggestions(ctx,avoid){
  const {age,crcl,hasbled,weightKg,scr_mgdl,special}=ctx;
  const out=[]; const isAvoided=name=> (avoid?.[name]&&avoid[name].size>0);

  // Apixabán
  if(!isAvoided("Apixabán")){
    const apxCrit=((age>=80)?1:0)+((isFinite(weightKg)&&weightKg<=60)?1:0)+((isFinite(scr_mgdl)&&scr_mgdl>=1.5)?1:0);
    const apxReduce=(apxCrit>=2)||(isFinite(crcl)&&crcl>=15&&crcl<30);
    out.push({name:"Apixabán",dose:apxReduce?"2.5 mg cada 12 h":"5 mg cada 12 h",highlight:apxReduce,why:apxReduce?">=2 criterios (edad >=80, peso <=60 kg, SCr >=1.5 mg/dL) o ClCr 15–29 ml/min":"Criterios de reducción no presentes"});
  }

  // Rivaroxabán
  if(!isAvoided("Rivaroxabán")){
    const rivaReduce=(isFinite(crcl)&&crcl>=15&&crcl<50);
    out.push({name:"Rivaroxabán",dose:rivaReduce?"15 mg cada 24 h":"20 mg cada 24 h",highlight:rivaReduce,why:rivaReduce?"ClCr 15–49 ml/min":"ClCr >=50 ml/min"});
  }

  // Edoxabán
  if(!isAvoided("Edoxabán")){
    const edoReduce=((isFinite(crcl)&&crcl>=15&&crcl<=50)||(isFinite(weightKg)&&weightKg<=60)||special.pgp===true);
    out.push({name:"Edoxabán",dose:edoReduce?"30 mg cada 24 h":"60 mg cada 24 h",highlight:edoReduce,why:edoReduce?"ClCr 15–50 ml/min o peso <=60 kg o inhibidor potente P-gp":"Sin criterios de reducción"});
  }

  // Dabigatrán
  if (!isAvoided("Dabigatrán")) {
    // Evitar si ClCr <30 siempre, o si hay inhibidor potente de P-gp con ClCr <50
    const dabAvoid =
      (isFinite(crcl) && crcl < 30) ||
      (special.pgp === true && isFinite(crcl) && crcl < 50);

    if (!dabAvoid) {
      const dabReduce =
        (isFinite(crcl) && crcl >= 30 && crcl <= 50) ||
        (age >= 80) ||
        (age >= 75 && age < 80 && hasbled >= 3) ||
        (special.pgp === true && (!isFinite(crcl) || crcl >= 50));

      out.push({
        name: "Dabigatrán",
        dose: dabReduce ? "110 mg cada 12 h" : "150 mg cada 12 h",
        highlight: dabReduce,
        why: dabReduce
          ? "ClCr 30–50 mL/min, edad ≥80 (o 75–80 con HAS-BLED alto) o inhibidor potente de P-gp con ClCr ≥50 mL/min"
          : "Sin criterios de reducción ni interacción relevante por P-gp"
      });
    }
  }

  // VKA
  if(!isAvoided("VKA")){out.push({name:"VKA",dose:"Ajuste a INR entre 2 y 3",highlight:false,why:"Dosis individualizada según INR"});}

  return out;
}
