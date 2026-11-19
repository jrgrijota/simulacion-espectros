// ═══════════════════════════════════════════════════════════════════
//  SIMULACIÓN: ESPECTROS ATÓMICOS
//  Física y Química — 4.º ESO
// ═══════════════════════════════════════════════════════════════════

// ─── DATOS DE ÁTOMOS ────────────────────────────────────────────────
// energies[]: energía de cada nivel respecto al nivel 0 (eV)
// radii[]:    radio de la órbita en el dibujo (px)
// transitions[]: cada transición absorción/emisión
//   from, to: índices de nivel (from < to para absorción ascendente)
//   wl: longitud de onda en nm
//   visible: true si está en el espectro visible (380-780 nm)

const ATOMS_DATA = {
  hidrogeno: {
    name: 'Hidrógeno (H)', symbol: 'H',
    note: 'Modelo simplificado: solo los niveles n=2 a n=5 (el fundamental, n=1, queda fuera). Las líneas visibles H-α 656 nm, H-β 486 nm y H-γ 434 nm son la serie de Balmer: saltos que acaban en n=2.',
    nucleusColor: [180, 210, 255],
    orbitStroke: [100, 140, 220],
    levels: 4,
    levelLabels: ['n=2', 'n=3', 'n=4', 'n=5'],
    baseLabel: 'Nivel n=2 (el más bajo del modelo)',   // el fundamental es n=1
    energies: [0, 1.89, 2.55, 2.86],                  // respecto a n=2
    radii: [68, 108, 140, 168],
    transitions: [
      { from: 0, to: 1, wl: 656, visible: true,  name: 'H-α' },
      { from: 0, to: 2, wl: 486, visible: true,  name: 'H-β' },
      { from: 0, to: 3, wl: 434, visible: true,  name: 'H-γ' },
      { from: 1, to: 2, wl: 1879, visible: false, name: 'IR' },
      { from: 1, to: 3, wl: 1278, visible: false, name: 'IR' },
      { from: 2, to: 3, wl: 4003, visible: false, name: 'IR' },
    ]
  },
  helio: {
    name: 'Helio (He)', symbol: 'He',
    note: 'Descubierto en el Sol antes que en la Tierra. Emite amarillo y azul.',
    nucleusColor: [255, 255, 160],
    orbitStroke: [200, 200, 100],
    levels: 3,
    levelLabels: ['E₁', 'E₂', 'E₃'],
    energies: [0, 2.11, 2.78],
    radii: [68, 115, 155],
    transitions: [
      { from: 0, to: 1, wl: 588, visible: true,  name: 'D₃' },
      { from: 0, to: 2, wl: 447, visible: true,  name: '447nm' },
      { from: 1, to: 2, wl: 1851, visible: false, name: 'IR' },
    ]
  },
  sodio: {
    name: 'Sodio (Na)', symbol: 'Na',
    note: 'La línea amarilla (589 nm) es la más intensa del espectro visible. Explica el color de las farolas de sodio. Desde 3d el átomo no puede volver directamente a 3s (salto prohibido): baja por 3p.',
    nucleusColor: [255, 190, 50],
    orbitStroke: [200, 150, 30],
    levels: 3,
    levelLabels: ['3s', '3p', '3d'],
    energies: [0, 2.10, 3.62],
    radii: [68, 115, 155],
    // 3s → 3d (Δl = 2) está prohibido: no hay línea de 343 nm
    transitions: [
      { from: 0, to: 1, wl: 589, visible: true,  name: 'D₁/D₂' },
      { from: 1, to: 2, wl: 819, visible: false, name: 'IR' },
    ]
  },
  neon: {
    name: 'Neón (Ne)', symbol: 'Ne',
    note: 'Espectro rico en rojo y naranja. Los letreros de "neón" emiten por desexcitación en cascada.',
    nucleusColor: [255, 100, 70],
    orbitStroke: [200, 60, 50],
    levels: 5,
    levelLabels: ['E₁', 'E₂', 'E₃', 'E₄', 'E₅'],
    energies: [0, 1.76, 1.94, 2.12, 2.73],
    radii: [55, 86, 106, 126, 162],
    transitions: [
      { from: 0, to: 1, wl: 703, visible: true,  name: '703nm' },
      { from: 0, to: 2, wl: 639, visible: true,  name: '639nm' },
      { from: 0, to: 3, wl: 585, visible: true,  name: '585nm' },
      { from: 0, to: 4, wl: 454, visible: true,  name: '454nm' },
      { from: 1, to: 2, wl: 6889, visible: false, name: 'IR' },
      { from: 1, to: 3, wl: 3444, visible: false, name: 'IR' },
      { from: 1, to: 4, wl: 1278, visible: false, name: 'IR' },
      { from: 2, to: 3, wl: 6889, visible: false, name: 'IR' },
      { from: 2, to: 4, wl: 1569, visible: false, name: 'IR' },
      { from: 3, to: 4, wl: 2033, visible: false, name: 'IR' },
    ]
  }
};

// ─── CONVERSIÓN λ (nm) → RGB ─────────────────────────────────────
function wlToRGB(wl) {
  if (wl < 380 || wl > 780) return [90, 90, 90];
  let r, g, b;
  if      (wl < 440) { r = -(wl - 440) / 60;       g = 0;                    b = 1; }
  else if (wl < 490) { r = 0;                        g = (wl - 440) / 50;     b = 1; }
  else if (wl < 510) { r = 0;                        g = 1;                    b = -(wl - 510) / 20; }
  else if (wl < 580) { r = (wl - 510) / 70;         g = 1;                    b = 0; }
  else if (wl < 645) { r = 1;                        g = -(wl - 645) / 65;    b = 0; }
  else               { r = 1;                        g = 0;                    b = 0; }
  // Suavizar bordes del espectro
  let f = (wl < 420) ? 0.3 + 0.7 * (wl - 380) / 40 :
          (wl > 700) ? 0.3 + 0.7 * (780 - wl) / 80 : 1.0;
  return [
    Math.min(255, Math.round(255 * Math.max(0, r) * f)),
    Math.min(255, Math.round(255 * Math.max(0, g) * f)),
    Math.min(255, Math.round(255 * Math.max(0, b) * f))
  ];
}

// ─── CLASES ──────────────────────────────────────────────────────

class Photon {
  constructor(x, y, wl, vx, vy) {
    this.x = x; this.y = y;
    this.wl = wl;
    this.vx = vx; this.vy = vy;
    this.alpha = 255;
    this.fading = false;
    this.done = false;
    this.trail = [];
    [this.r, this.g, this.b] = wlToRGB(wl);
    this.size = (wl >= 380 && wl <= 780) ? 8 : 7;
    this.dest = null;
  }
  // Vuela en curva hasta (dx, dy): sale en su dirección y se curva hacia la
  // raya del espectro, donde «sella» la línea al llegar.
  volarA(dx, dy, alLlegar) {
    let d = dist(this.x, this.y, dx, dy);
    this.dest = { x0: this.x, y0: this.y, cx: this.x + this.vx * 26, cy: this.y + this.vy * 26,
                  dx, dy, t: 0, dur: constrain(d / 7, 38, 80) };
    this.alLlegar = alLlegar;
    this.size = 10;
    return this;
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > (this.dest ? 10 : 6)) this.trail.shift();
    if (this.dest) {
      let d = this.dest;
      d.t = min(1, d.t + 1 / d.dur);
      let t = d.t * d.t * (3 - 2 * d.t), u = 1 - t;
      this.x = u * u * d.x0 + 2 * u * t * d.cx + t * t * d.dx;
      this.y = u * u * d.y0 + 2 * u * t * d.cy + t * t * d.dy;
      if (d.t >= 1) { this.done = true; if (this.alLlegar) this.alLlegar(); }
      return;
    }
    this.x += this.vx;
    this.y += this.vy;
    if (this.fading) {
      this.alpha -= 18;
      if (this.alpha <= 0) this.done = true;
    }
    // Eliminar si sale del canvas o entra en el diagrama de niveles
    if (this.x < -30 || this.x > CV_W + 30 || this.y < -30 || this.y > CV_H + 30)
      this.done = true;
    if (enDiagrama(this.x, this.y)) this.done = true;
  }
  draw() {
    if (this.done) return;
    for (let i = 0; i < this.trail.length; i++) {
      let a = (i / this.trail.length) * this.alpha * 0.35;
      noStroke();
      fill(this.r, this.g, this.b, a);
      circle(this.trail[i].x, this.trail[i].y, this.size * 0.7);
    }
    noStroke();
    fill(this.r, this.g, this.b, this.alpha * 0.25);
    circle(this.x, this.y, this.size * 2.8);
    // Contorno de tinta: los fotones claros (amarillo, cian) se ven también en el tema Día
    stroke(...CT.ink, this.alpha); strokeWeight(1.8);
    fill(this.r, this.g, this.b, this.alpha);
    circle(this.x, this.y, this.size * 1.25);
    noStroke();
  }

}

class CollisionElectron {
  constructor(x, y, energy) {
    this.x = x; this.y = y;
    this.energy = energy;
    this.speed = map(energy, 0.5, 6.0, 2.5, 8.0);
    this.vx = this.speed;
    this.vy = 0;
    this.done = false;
    this.collided = false;
    this.trail = [];
  }
  update() {
    if (this.collided) { this.done = true; return; }
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();
    this.x += this.vx;
    if (this.x > CV_W + 20 || enDiagrama(this.x, this.y)) this.done = true;
  }
  draw() {
    if (this.done) return;
    for (let i = 0; i < this.trail.length; i++) {
      let a = (i / this.trail.length) * 160;
      noStroke();
      fill(0, 200, 255, a);
      circle(this.trail[i].x, this.trail[i].y, 4);
    }
    stroke(...CT.ink); strokeWeight(1.8);
    fill(0, 220, 255);
    circle(this.x, this.y, 10);
    noStroke();
  }

}

class GasAtomEntity {
  constructor(x, y, atomData) {
    this.x = x; this.y = y;
    this.data = atomData;
    this.level = 0;
    this.exciteTimer = 0;
    this.exciteTarget = 0;
    this.glowTimer = 0;
    this.cascadePath = [];
    this.cascadeTimer = 0;
    this.cooldown = 0;
  }
  excite(targetLevel) {
    this.level = targetLevel;
    this.exciteTarget = targetLevel;
    this.exciteTimer = floor(random(40, 100));
    this.glowTimer = 20;
    this.cascadePath = [];
    this.cascadeTimer = 0;
    absCount++;
  }
  _buildCascade(startLevel) {
    let path = [];
    let current = startLevel;
    while (current > 0) {
      let to = nivelInferiorAleatorio(current);
      path.push({ from: current, to });
      current = to;
    }
    return path;
  }
  update() {
    if (this.glowTimer > 0) this.glowTimer--;
    if (this.cooldown > 0) this.cooldown--;
    // Espera inicial antes de iniciar la cascada
    if (this.level > 0 && this.exciteTimer > 0 && this.cascadePath.length === 0) {
      this.exciteTimer--;
      if (this.exciteTimer === 0) {
        this.cascadePath = this._buildCascade(this.level);
        this.cascadeTimer = 120;  // 2 s al nivel superior antes del primer salto
        return;  // no decrementar el timer en el mismo frame que se construye la cascada
      }
      return;
    }
    // Pasos de la cascada: 2 s exactos entre cada emisión
    if (this.cascadePath.length > 0) {
      this.cascadeTimer--;
      if (this.cascadeTimer <= 0) {
        let step = this.cascadePath.shift();
        let tr = findTransition(this.data, step.to, step.from);
        if (tr) {
          emitPhotonFromGas(this.x, this.y, tr.wl);
          if (tr.visible) tuboBrillo = min(1, tuboBrillo + 0.12);
          emiCount++;
          gasPhotonTotal++;
          let k = Math.round(tr.wl);
          gasPhotonCounts[k] = (gasPhotonCounts[k] || 0) + 1;
        }
        this.level = step.to;
        if (this.cascadePath.length > 0) {
          this.cascadeTimer = 120;          // 2 s hasta el siguiente salto
        } else {
          this.cascadeTimer = 0;
          this.cooldown = 120;              // 2 s en el nivel base antes de re-excitarse
        }
      }
    }
  }
  draw() {
    let glow = this.level > 0;
    let tr = glow ? findTransition(this.data, 0, this.level) : null;
    let col = glow ? (tr && tr.visible ? wlToRGB(tr.wl) : this.data.nucleusColor) : [225, 235, 245];
    let s = (glow && !MOV_REDUCIDO) ? 1 + 0.35 * sin(map(this.glowTimer, 20, 0, 0, PI)) : 1;
    let ctx = drawingContext;
    push();
    translate(this.x, this.y);
    scale(s);
    if (glow) { ctx.shadowBlur = 18; ctx.shadowColor = `rgba(${col[0]},${col[1]},${col[2]},0.95)`; }
    stroke(...CT.ink, glow ? 255 : 150); strokeWeight(1.8);
    fill(col[0], col[1], col[2], glow ? 255 : 170);
    circle(0, 0, glow ? 20 : 15);
    ctx.shadowBlur = 0;
    noStroke(); fill(255, 255, 255, 150);
    ellipse(-3, -3.5, 6, 4);
    pop();
  }


}

class GasElectron {
  constructor(x, y, energy) {
    this.x = x; this.y = y;
    this.energy = energy;
    this.vx = map(energy, 1, 8, 3, 9);   // siempre positivo: cátodo → ánodo
    this.vy = random(-0.8, 0.8);
    this.done = false;
    this.trail = [];
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 6) this.trail.shift();
    this.x += this.vx;
    this.y += this.vy;
    let t = tubo();
    if (this.x > t.x2 - min((t.y2 - t.y1) * 0.225, 40) - 9) { this.done = true; return; }  // absorbido en el ánodo
    if (this.y < t.y1 + 8 || this.y > t.y2 - 8) { this.vy *= -1; }
  }
  draw() {
    for (let i = 0; i < this.trail.length; i++) {
      let a = (i / this.trail.length) * 120;
      noStroke(); fill(0, 200, 255, a);
      circle(this.trail[i].x, this.trail[i].y, 4);
    }
    stroke(...CT.ink); strokeWeight(1.5);
    fill(0, 220, 255);
    circle(this.x, this.y, 8);
    noStroke();
  }

}

// ─── ESTADO GLOBAL ───────────────────────────────────────────────
// Dos disposiciones del lienzo: apaisada (ordenador, pizarra digital) y
// vertical (móvil): el átomo arriba, el diagrama debajo y el espectro al final.
let CV_W, CV_H, ATOM_CX, ATOM_CY, SPEC_Y, SPEC_X1, SPEC_X2, SPEC_H, EXT_SPEC_Y, EXT_SPEC_H;
let DIAG_X, DIAG_Y, DIAG_W, DIAG_H, TUBE_X, TUBE_Y, TUBE_W, TUBE_H;
let RK = 1;            // escala de los radios de las órbitas
let VERTICAL = false;
const BUB_Y = 12;   // franja de la mascota y su bocadillo
let BUB_H = 52;
let REF_Y = 0, REF_H = 0;    // filas de los espectros de referencia (reto)
function aplicarGeometria(vertical, modo) {
  VERTICAL = vertical;
  if (!vertical) {
    CV_W = 900; CV_H = 664; RK = 1; BUB_H = 52;
    ATOM_CX = 350; ATOM_CY = 290;
    DIAG_X = 628; DIAG_Y = 78; DIAG_W = 256; DIAG_H = 400;
    TUBE_X = 16;  TUBE_Y = 84; TUBE_W = 868; TUBE_H = 396;
    SPEC_X1 = 16; SPEC_X2 = 884; SPEC_Y = 496; SPEC_H = 84;
    EXT_SPEC_Y = 590; EXT_SPEC_H = 34;
    if (modo === 'reto') {
      TUBE_Y = 78; TUBE_H = 186;
      SPEC_X1 = 160; SPEC_Y = 282; SPEC_H = 64;
      REF_Y = 364; REF_H = 46;
    }
  } else {
    CV_W = 520; CV_H = 900; RK = 0.82; BUB_H = 66;
    ATOM_CX = 292; ATOM_CY = 252;
    DIAG_X = 14; DIAG_Y = 420; DIAG_W = 492; DIAG_H = 300;
    TUBE_X = 14; TUBE_Y = 96; TUBE_W = 492; TUBE_H = 624;
    SPEC_X1 = 14; SPEC_X2 = 506; SPEC_Y = 734; SPEC_H = 84;
    EXT_SPEC_Y = 828; EXT_SPEC_H = 34;
    if (modo === 'gas') {
      CV_H = 680; TUBE_H = 400;
      SPEC_Y = 514; EXT_SPEC_Y = 608;
    }
    if (modo === 'reto') {
      CV_H = 720;
      TUBE_Y = 96; TUBE_H = 200;
      SPEC_X1 = 116; SPEC_Y = 314; SPEC_H = 64;
      REF_Y = 396; REF_H = 52;
    }
  }
}
aplicarGeometria(false);

// Interior del tubo de descarga (cápsula de vidrio) en los modos gas y reto
function tubo() {
  let reto = currentMode === 'reto';
  return { x1: TUBE_X + 34, x2: TUBE_X + TUBE_W - 34,
           y1: TUBE_Y + (reto ? 8 : 18), y2: TUBE_Y + TUBE_H - (reto ? 8 : 104) };
}
// ¿Está el punto dentro del diagrama de niveles? (fuera del modo gas)
function enDiagrama(x, y) {
  return currentMode !== 'gas' && x > DIAG_X - 4 && x < DIAG_X + DIAG_W + 4 &&
         y > DIAG_Y - 4 && y < DIAG_Y + DIAG_H + 8;
}
// Radio de la órbita i en el dibujo
function R(i) { return atomData.radii[i] * RK; }

let currentMode    = 'fotones';
let currentAtomKey = 'hidrogeno';
let atomData       = null;
let electronLevel  = 0;
let exciteTimer    = 0;
let atomCascade    = [];   // cascada de desexcitación paso a paso (modos fotón/colisión)
let atomCascadeT   = 0;    // frames restantes hasta la siguiente emisión
let absCount       = 0;
let emiCount       = 0;
let isPaused       = false;
let electronAngle  = 0;
let flashTimer     = 0;  // brillo al absorber

// Modo fotones
let lightType     = 'white';
let monoWl        = 550;
let photonRate    = 3;
let inPhotons     = [];
let outPhotons    = [];
let photonSpawnT  = 0;

// Modo colisión
let electronEnergy = 3.0;
let electronRate   = 3;
let collElectrons  = [];
let electronSpawnT = 0;

// Modo gas
let gasVoltage    = 5.0;
let gasDensity    = 10;
let gasAtomsList  = [];
let gasElectrons  = [];
let gasElectronT  = 0;

// Espectro (índice 0 = 380nm, índice 400 = 780nm)
let spectrumIntensity = new Float32Array(401);
// Rayas oscuras del espectro de absorción (modo fotones): λ que el átomo ha absorbido
let absorptionIntensity = new Float32Array(401);
const SPECTRUM_DECAY  = 0.99985;   // las líneas tardan ~77 s en perder la mitad de su brillo

// DOM
let domAtomSelect, domBtnBlanca, domBtnMono, domSliderWl, domValWl;
let domSliderRate, domValRate;
let domSliderEEnergy, domValEEnergy, domSliderERate, domValERate;
let domSliderVoltage, domValVoltage, domSliderDensity, domValDensity;
let domBtnPause, domBtnReset;
let domMetricLevel, domMetricEnergy, domMetricAbs, domMetricEmi, domMetricState;
let domTransitionsList, domEnergyAccessPanel;
let domModeFotones, domModeColision, domModeGas, domModeReto, domCtrlReto;
let domCtrlFotones, domCtrlColision, domCtrlGas;
let domMonoWrapper;

// Animación de radio del electrón (transición suave entre órbitas)
let electronRCurrent = 68;

// Etiqueta de estado en canvas (modo fotones/colisión)
let stateLbl    = '';
// Lo último que ha pasado, para el bocadillo de la mascota
let evTag = '', evTxt = '', evCol = [200, 200, 200], evT = 0;
function contar(tag, txt, col, frames) {
  evTag = tag; evTxt = txt; evCol = col; evT = frames || 240;
}
let stateLblClr = [200, 200, 200];
let stateLblT   = 0;

// Transición activa para resaltar en el diagrama de niveles
let activeTr  = null;
let activeTrT = 0;

// Modo disparo único (modo colisión) — activo por defecto
let collSingleShot = true;
let domBtnRafaga, domBtnSingle, domWrapperERate;

// Modo disparo único (modo fotones) — activo por defecto
let fotoSingleShot  = true;
let domBtnFotoRafaga, domBtnFotoSingle, domWrapperFRate;

// Espectro extendido UV/IR
let extSpectrumLines = {};

// Posición Y suavizada del electrón en el diagrama de niveles
let diagElectronRY = 0;

// Buffers pre-renderizados para los fondos de espectro (evitan 1200+ rects/frame)
let spectrumBgGfx = null;
let absorptionBgGfx = null;   // arcoíris brillante: la luz blanca que atraviesa el gas
let extSpecBgGfx  = null;

// ─── HELPERS DIAGRAMA DE NIVELES ────────────────────────────────
function diagTargetY() {
  if (!atomData) return DIAG_Y + DIAG_H - 22;
  return eToYDiag(atomData.energies[electronLevel]);
}

// ─── PALETAS DE TEMA PARA EL CANVAS ─────────────────────────────
const CANVAS_THEMES = {
  // Pizarra: azules de SimulaCiencia con el estilo del juego «Carga cero»
  dark: {
    bg:         [17,  49,  79 ],
    panelBg:    [21,  57,  90 ],
    panelBord:  [45,  105, 150],
    txtBright:  [238, 247, 255],
    txtMid:     [181, 211, 236],
    orbitLbl:   [238, 247, 255],
    specBg:     [7,   22,  38 ],
    specBord:   [45,  105, 150],
    specTitle:  [238, 247, 255],
    specTick:   [181, 211, 236],
    srcBody:    [29,  74,  114],
    srcStroke:  [7,   26,  43 ],
    srcArrow:   [181, 211, 236],
    tubeBord:   [45,  105, 150],
    electrode:  [150, 185, 215],
    tubeText:   [238, 247, 255],
    gasCnt:     [181, 211, 236],
    sttBoxBg:   [7,   26,  43 ],
    sttBoxTxt:  [238, 247, 255],
    pauseOvl:   [7,   26,  43 ],
    pauseTxt:   [255, 255, 255],
    transNote:  [181, 211, 236],
    exciteTxt:  [255, 216, 74 ],
    diagEval:   [181, 211, 236],
    panel:      [21,  57,  90 ],
    panel2:     [29,  74,  114],
    border:     [45,  105, 150],
    ink:        [7,   26,  43 ],
    text:       [238, 247, 255],
    title:      [255, 255, 255],
    muted:      [181, 211, 236],
    accent:     [0,   200, 255],
    electron:   [52,  227, 168],
    nivel:      [140, 185, 225],
    fun:        true,
  },
  // Día: claro sin llegar a blanco
  light: {
    bg:         [238, 245, 251],
    panelBg:    [247, 251, 255],
    panelBord:  [169, 198, 222],
    txtBright:  [11,  34,  54 ],
    txtMid:     [63,  95,  122],
    orbitLbl:   [19,  48,  74 ],
    specBg:     [7,   22,  38 ],
    specBord:   [169, 198, 222],
    specTitle:  [238, 247, 255],
    specTick:   [181, 211, 236],
    srcBody:    [228, 239, 248],
    srcStroke:  [19,  48,  74 ],
    srcArrow:   [63,  95,  122],
    tubeBord:   [169, 198, 222],
    electrode:  [111, 139, 163],
    tubeText:   [19,  48,  74 ],
    gasCnt:     [63,  95,  122],
    sttBoxBg:   [247, 251, 255],
    sttBoxTxt:  [19,  48,  74 ],
    pauseOvl:   [238, 245, 251],
    pauseTxt:   [11,  34,  54 ],
    transNote:  [63,  95,  122],
    exciteTxt:  [180, 83,  9  ],
    diagEval:   [63,  95,  122],
    panel:      [247, 251, 255],
    panel2:     [228, 239, 248],
    border:     [169, 198, 222],
    ink:        [19,  48,  74 ],
    text:       [19,  48,  74 ],
    title:      [11,  34,  54 ],
    muted:      [63,  95,  122],
    accent:     [3,   105, 161],
    electron:   [8,   128, 90 ],
    nivel:      [111, 150, 185],
    fun:        true,
  },
  contrast: {
    bg:         [0,   0,   0  ],
    panelBg:    [0,   5,   0  ],
    panelBord:  [255, 255, 0  ],
    txtBright:  [255, 255, 0  ],
    txtMid:     [0,   255, 255],
    orbitLbl:   [255, 255, 255],
    specBg:     [0,   0,   0  ],
    specBord:   [255, 255, 0  ],
    specTitle:  [0,   255, 255],
    specTick:   [200, 200, 0  ],
    srcBody:    [0,   20,  0  ],
    srcStroke:  [255, 255, 0  ],
    srcArrow:   [255, 255, 0  ],
    tubeBord:   [255, 255, 0  ],
    electrode:  [180, 180, 0  ],
    tubeText:   [255, 255, 255],
    gasCnt:     [255, 255, 255],
    sttBoxBg:   [0,   0,   0  ],
    sttBoxTxt:  [255, 255, 0  ],
    pauseOvl:   [0,   0,   0  ],
    pauseTxt:   [255, 255, 0  ],
    transNote:  [200, 200, 0  ],
    exciteTxt:  [255, 255, 0  ],
    diagEval:   [0,   255, 255],
    panel:      [0,   0,   0  ],
    panel2:     [0,   0,   0  ],
    border:     [255, 255, 0  ],
    ink:        [0,   0,   0  ],
    text:       [255, 255, 255],
    title:      [255, 255, 0  ],
    muted:      [0,   255, 255],
    accent:     [0,   255, 255],
    electron:   [0,   255, 180],
    nivel:      [200, 200, 200],
  }
};
let CT = CANVAS_THEMES.dark;

// Contadores del modo gas
let gasPhotonCounts = {};
let gasPhotonTotal  = 0;

// ─── ESTILO JUEGO: MASCOTA, BOCADILLO Y CHISPAS ──────────────────
const MOV_REDUCIDO = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FUENTE_TEXTO = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
let etiquetaMascota = '', desdeMascota = -1e9, chispas = [];

function salto(t0) {
  if (MOV_REDUCIDO) return 1;
  let e = (millis() - t0) / 450;
  if (e >= 1) return 1;
  return 1 + 0.35 * sin(e * PI) * (1 - e);
}

function lanzarChispas(x, y, col, n) {
  if (MOV_REDUCIDO) return;
  for (let i = 0; i < n; i++) {
    let a = random(TWO_PI), v = random(1.5, 4);
    chispas.push({ x, y, vx: cos(a) * v, vy: sin(a) * v - 1, vida: 1, col, r: random(3, 6), estrella: random() < 0.5 });
  }
}

function drawChispas() {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(6, 2, 120, BUB_Y + BUB_H + 6);   // nunca salen de la zona de la mascota
  drawingContext.clip();
  for (let i = chispas.length - 1; i >= 0; i--) {
    let c = chispas[i];
    if (!isPaused) { c.x += c.vx; c.y += c.vy; c.vy += 0.12; c.vida -= 0.04; }
    if (c.vida <= 0) { chispas.splice(i, 1); continue; }
    noStroke(); fill(...c.col, 255 * c.vida);
    if (c.estrella) estrella(c.x, c.y, c.r * 1.3, c.r * 0.5);
    else ellipse(c.x, c.y, c.r * 2 * c.vida);
  }
  drawingContext.restore();
}

function estrella(x, y, r1, r2) {
  beginShape();
  for (let i = 0; i < 10; i++) {
    let a = -HALF_PI + i * PI / 5, r = i % 2 ? r2 : r1;
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape(CLOSE);
}

// Mascota: partícula sonriente que dice el mensaje en un bocadillo
function drawMascota(cx, cy, r, col) {
  let bote = (MOV_REDUCIDO || isPaused) ? 0 : sin(millis() / 260) * 1.5;
  let parpadeo = millis() % 4200 > 4050;
  push();
  translate(cx, cy + bote);
  let s = salto(desdeMascota);
  scale(s, 2 - s);
  noStroke(); fill(0, 0, 0, 45); ellipse(0, r + 3 - bote, r * 1.5, 5);
  stroke(...CT.ink); strokeWeight(2.5); fill(...col);
  ellipse(0, 0, r * 2);
  noStroke(); fill(255, 255, 255, 150);
  ellipse(-r * 0.42, -r * 0.45, r * 0.55, r * 0.35);
  fill(...CT.ink);
  if (parpadeo) {
    stroke(...CT.ink); strokeWeight(2);
    line(-r * 0.42, -r * 0.05, -r * 0.18, -r * 0.05); line(r * 0.18, -r * 0.05, r * 0.42, -r * 0.05);
  } else {
    ellipse(-r * 0.3, -r * 0.08, r * 0.2, r * 0.3); ellipse(r * 0.3, -r * 0.08, r * 0.2, r * 0.3);
  }
  noFill(); stroke(...CT.ink); strokeWeight(2.2);
  arc(0, r * 0.18, r * 0.6, r * 0.45, 0.15 * PI, 0.85 * PI);
  noStroke(); fill(255, 120, 150, 120);
  ellipse(-r * 0.58, r * 0.22, r * 0.3); ellipse(r * 0.58, r * 0.22, r * 0.3);
  pop();
}

// Nombre corto del elemento («Hidrógeno»), en el idioma de la página
function nombreElemento() {
  return i18n.t(atomData.name).replace(/\s*\(.*\)\s*$/, '');
}

// Qué dice la mascota: lo último que ha pasado o, si no, qué hacer ahora
function mensajeMascota() {
  if (evT > 0) return { tag: evTag, txt: evTxt, col: evCol };
  if (currentMode === 'reto') {
    if (retoResuelto) return { tag: i18n.t('¡Resuelto!'), col: CT.electron, txt: i18n.t('Pulsa «Otro gas» para seguir jugando') };
    return { tag: i18n.t('¿Qué gas es?'), col: CT.accent,
             txt: i18n.t('Mira las rayas que salen del tubo y elige el gas que tiene las mismas') };
  }
  let tag = nombreElemento(), col = atomData.nucleusColor;
  if (currentMode === 'gas') {
    let e1 = atomData.energies[1];
    let txt = gasVoltage < e1
      ? i18n.t('Con {v} eV los electrones no pueden excitar ningún átomo: no hay luz', { v: fmt(gasVoltage, 1) })
      : i18n.t('Los electrones chocan con los átomos y los excitan; al bajar de nivel emiten las rayas del espectro');
    let lampara = i18n.t('Lámpara de {nombre}', { nombre: tag.toLocaleLowerCase() });
    return { tag: VERTICAL ? tag : lampara.charAt(0).toLocaleUpperCase() + lampara.slice(1), txt, col };
  }
  if (electronLevel > 0)
    return { tag: i18n.t('Excitado'), col: CT.exciteTxt,
             txt: i18n.t('El electrón está en {nivel} ({e} eV): pronto bajará y emitirá luz',
                         { nivel: atomData.levelLabels[electronLevel], e: fmt(atomData.energies[electronLevel], 2) }) };
  if (currentMode === 'fotones') {
    if (fotoSingleShot) return { tag, col, txt: i18n.t('Haz clic en la fuente para disparar un fotón') };
    if (lightType === 'white') return { tag, col, txt: i18n.t('Llega luz de todos los colores: solo absorbe los fotones con la energía justa para un salto') };
    return { tag, col, txt: i18n.t('Solo absorbe la luz de {wl} nm si coincide con un salto entre niveles', { wl: monoWl }) };
  }
  // Colisión
  if (collSingleShot) return { tag, col, txt: i18n.t('Haz clic en el cañón para disparar un electrón') };
  let alc = -1;
  for (let lv = 1; lv < atomData.levels; lv++) if (electronEnergy >= atomData.energies[lv]) alc = lv;
  return { tag, col, txt: alc < 0
    ? i18n.t('Con {e} eV el electrón no tiene energía para ningún salto', { e: fmt(electronEnergy, 1) })
    : i18n.t('Con {e} eV el electrón puede subir el átomo hasta {nivel}', { e: fmt(electronEnergy, 1), nivel: atomData.levelLabels[alc] }) };
}

// Franja superior: mascota + bocadillo con etiqueta y mensaje
function drawBocadillo() {
  let { tag, txt, col } = mensajeMascota();
  let x = 14, y = BUB_Y, w = CV_W - 28, h = BUB_H;
  if (tag + txt !== etiquetaMascota) {
    if (etiquetaMascota && evT > 0) lanzarChispas(x + 24, y + h / 2, col, 12);
    etiquetaMascota = tag + txt; desdeMascota = millis();
  }
  // En el tema Día la mascota, un poco más clara
  let cm = CT === CANVAS_THEMES.light ? col.map(v => lerp(v, 255, 0.35)) : col;
  drawMascota(x + 24, y + h / 2, 20, cm);

  let bx = x + 58, my = y + h / 2;
  noStroke(); fill(...CT.ink); rect(bx, y + 3, w - 58, h, 18);
  stroke(...CT.border); strokeWeight(2); fill(...CT.panel);
  triangle(bx - 10, my, bx + 4, my - 8, bx + 4, my + 8);
  rect(bx, y, w - 58, h, 18);
  noStroke(); fill(...CT.panel);
  triangle(bx - 7, my, bx + 3, my - 6, bx + 3, my + 6);

  let tx = bx + 14;
  if (tag) {
    textStyle(BOLD); textSize(17);
    let tw = textWidth(tag) + 26;
    push();
    translate(bx + 12 + tw / 2, my);
    scale(salto(desdeMascota));
    noStroke(); fill(...CT.ink); rect(-tw / 2, -13, tw, 30, 15);
    fill(...col); rect(-tw / 2, -15, tw, 30, 15);
    let claro = (col[0] * 0.299 + col[1] * 0.587 + col[2] * 0.114) > 120;
    fill(...(claro ? [7, 26, 43] : [255, 255, 255]));
    textAlign(CENTER, CENTER);
    text(tag, 0, -1);
    pop();
    textStyle(NORMAL);
    tx = bx + 12 + tw + 12;
  }
  textFont(FUENTE_TEXTO);
  fill(...CT.text); textAlign(LEFT, CENTER);
  // Texto grande para la pizarra; si no cabe, un poco menor
  let ancho = x + w - tx - 14;
  let tam = 17;
  let lineas = () => {   // líneas que ocupa el texto partido por palabras
    let n = 1, linea = '';
    for (let pal of txt.split(' ')) {
      let prueba = linea ? linea + ' ' + pal : pal;
      if (textWidth(prueba) > ancho && linea) { n++; linea = pal; } else linea = prueba;
    }
    return n;
  };
  textSize(tam);
  while (tam > 11 && lineas() * (tam + 2) > h - 6) { tam--; textSize(tam); }
  textLeading(tam + 2);
  text(txt, tx, y + 1, ancho, h - 2);
  textFont('Fredoka');
  textAlign(LEFT, BASELINE);
}

// ─── HELPERS ─────────────────────────────────────────────────────
// Nivel al que baja el electrón desde `current`: uno inferior al azar, pero solo
// entre los que tienen transición (en el sodio, desde 3d no se puede ir a 3s).
function nivelInferiorAleatorio(current) {
  let opciones = [];
  for (let lv = 0; lv < current; lv++) if (findTransition(atomData, lv, current)) opciones.push(lv);
  return opciones.length ? random(opciones) : floor(random(current));
}

function findTransition(atom, from, to) {
  return atom.transitions.find(
    t => (t.from === from && t.to === to) || (t.from === to && t.to === from)
  );
}

function updateSpectrum(wl) {
  if (wl < 380 || wl > 780) return;
  let idx = Math.round(wl - 380);
  spectrumIntensity[idx] = min(1.0, spectrumIntensity[idx] + 0.6);
  // Pequeño ensanchamiento natural de línea
  if (idx > 0)   spectrumIntensity[idx - 1] = min(1.0, spectrumIntensity[idx - 1] + 0.25);
  if (idx < 400) spectrumIntensity[idx + 1] = min(1.0, spectrumIntensity[idx + 1] + 0.25);
}

// Raya oscura en el espectro de absorción, con el mismo ensanchamiento que las de emisión
function updateAbsorptionSpectrum(wl) {
  if (wl < 380 || wl > 780) return;
  let idx = Math.round(wl - 380);
  absorptionIntensity[idx] = min(1.0, absorptionIntensity[idx] + 0.6);
  if (idx > 0)   absorptionIntensity[idx - 1] = min(1.0, absorptionIntensity[idx - 1] + 0.25);
  if (idx < 400) absorptionIntensity[idx + 1] = min(1.0, absorptionIntensity[idx + 1] + 0.25);
}

// Posición x de una longitud de onda en el espectro visible y en la franja UV/IR
function xVisible(wl) { return map(wl - 380, 0, 400, SPEC_X1 + 2, SPEC_X2 - 2); }
function xExtendido(wl) {
  let w = SPEC_X2 - SPEC_X1, uvW = floor(w * 0.25), irX1 = SPEC_X1 + uvW + 4;
  if (wl < 380) return map(wl, 200, 380, SPEC_X1 + 2, SPEC_X1 + uvW - 2);
  return map(min(wl, 3000), 780, 3000, irX1 + 2, SPEC_X2 - 2);
}
function yEmision() {
  return currentMode === 'fotones' ? SPEC_Y + SPEC_H * 0.72 : SPEC_Y + SPEC_H * 0.5;
}

// Lanza un fotón desde (x, y) que vuela hasta su raya y la sella al llegar
function lanzarFotonAlEspectro(x, y, wl, vel) {
  let angle = random(TWO_PI);
  let ph = new Photon(x, y, wl, cos(angle) * vel, sin(angle) * vel);
  let visible = wl >= 380 && wl <= 780;
  if (visible) ph.volarA(xVisible(wl), yEmision(), () => sellar(wl, xVisible(wl), yEmision()));
  else if (currentMode !== 'reto') ph.volarA(xExtendido(wl), EXT_SPEC_Y + EXT_SPEC_H / 2, () => updateExtSpectrum(wl));
  else return;
  outPhotons.push(ph);
}

function emitPhotonFromAtom(wl) {
  let eX = ATOM_CX + cos(electronAngle) * electronRCurrent;
  let eY = ATOM_CY + sin(electronAngle) * electronRCurrent;
  lanzarFotonAlEspectro(eX, eY, wl, random(3, 5));
  emiCount++;
}

function emitPhotonFromGas(x, y, wl) {
  lanzarFotonAlEspectro(x, y, wl, random(2.5, 4.5));
}

// ───────── Sellos en el espectro y colección de la «huella» ─────────
let destellos = [];        // anillos y estrellitas donde un fotón sella su raya
let pulsos = [];           // ondas que salen del átomo al absorber o excitarse
let rayasVistas = new Set();
let ultimoDisparo = -1e9;
let mostrarIR = false;      // flechas infrarrojas del diagrama: solo si se piden

function sellar(wl, x, y) {
  updateSpectrum(wl);
  let col = wlToRGB(wl);
  destellos.push({ x, y, col, t0: millis(), grande: false });
  if (currentMode === 'reto' || rayasVistas.has(wl)) return;
  let huella = atomData.transitions.filter(t => t.visible);
  if (!huella.some(t => t.wl === wl)) return;
  rayasVistas.add(wl);
  destellos.push({ x, y, col, t0: millis(), grande: true });
  if (rayasVistas.size === huella.length) {
    contar(i18n.t('¡Huella completa!'),
      i18n.t('Ya tienes todas las rayas visibles del {elemento}: son su huella dactilar', { elemento: nombreElemento().toLocaleLowerCase() }),
      CT.accent, 360);
    for (let t of huella) destellos.push({ x: xVisible(t.wl), y, col: wlToRGB(t.wl), t0: millis() + random(0, 300), grande: true });
  }
}

function drawDestellos() {
  let ahora = millis();
  for (let i = destellos.length - 1; i >= 0; i--) {
    let d = destellos[i];
    let e = (ahora - d.t0) / (d.grande ? 900 : 500);
    if (e < 0) continue;
    if (e >= 1 || MOV_REDUCIDO) { destellos.splice(i, 1); continue; }
    let r = (d.grande ? 34 : 16) * e;
    noFill(); stroke(...d.col, 255 * (1 - e)); strokeWeight(d.grande ? 4 : 2.5);
    circle(d.x, d.y, r * 2);
    if (d.grande) {
      noStroke(); fill(...d.col, 255 * (1 - e));
      for (let k = 0; k < 6; k++) {
        let a = k * TWO_PI / 6 + 0.3;
        estrella(d.x + cos(a) * r * 1.2, d.y + sin(a) * r * 1.2, 6 * (1 - e) + 2, 2.5);
      }
    }
  }
  noStroke();
}

function lanzarPulso(x, y, col) {
  pulsos.push({ x, y, col, t0: millis() });
}
function drawPulsos() {
  let ahora = millis();
  for (let i = pulsos.length - 1; i >= 0; i--) {
    let p = pulsos[i], e = (ahora - p.t0) / 700;
    if (e >= 1 || MOV_REDUCIDO) { pulsos.splice(i, 1); continue; }
    noFill(); stroke(...p.col, 230 * (1 - e)); strokeWeight(5 * (1 - e) + 1);
    circle(p.x, p.y, 20 + 90 * e);
  }
  noStroke();
}

// Inicia la cascada de desexcitación: construye el camino completo de saltos
// pero NO emite nada todavía. Las emisiones se producen en updateAtomCascade(),
// con 2 s (120 frames) de espera entre cada nivel.
function deExciteAtom() {
  if (electronLevel === 0) return;
  atomCascade = [];
  let current = electronLevel;
  while (current > 0) {
    let to = nivelInferiorAleatorio(current);
    atomCascade.push({ from: current, to });
    current = to;
  }
  atomCascadeT = 120;  // 2 s en el nivel superior antes de la primera emisión
}

// Avanza la cascada un frame: cuando el temporizador llega a 0 emite UN fotón,
// baja UN nivel y reinicia 2 s hasta la siguiente emisión.
function updateAtomCascade() {
  if (atomCascade.length === 0) return;
  atomCascadeT--;
  if (atomCascadeT > 0) return;
  let step = atomCascade.shift();
  let tr = findTransition(atomData, step.to, step.from);
  if (tr) {
    emitPhotonFromAtom(tr.wl);
    stateLbl    = i18n.t('EMITE  {wl} nm    ({de} → {a})', { wl: tr.wl, de: atomData.levelLabels[tr.to], a: atomData.levelLabels[tr.from] });
    stateLblClr = wlToRGB(tr.wl);
    stateLblT   = 120;
    activeTr    = tr;
    activeTrT   = 120;
    let datos = { wl: tr.wl, de: atomData.levelLabels[step.from], a: atomData.levelLabels[step.to] };
    if (tr.visible) contar(i18n.t('Emite'), i18n.t('Luz de {wl} nm: el electrón baja de {de} a {a}', datos), wlToRGB(tr.wl));
    else contar(i18n.t('Emite'), i18n.t('Infrarrojo de {wl} nm (no se ve): el electrón baja de {de} a {a}', datos), [200, 90, 50]);
  }
  electronLevel = step.to;
  if (atomCascade.length > 0) {
    atomCascadeT = 120;        // 2 s hasta el siguiente salto
  } else {
    atomCascadeT = 0;
    flashTimer   = 0;
  }
}

function resetSim() {
  electronLevel    = 0;
  exciteTimer      = 0;
  atomCascade      = [];
  atomCascadeT     = 0;
  flashTimer       = 0;
  absCount         = 0;
  emiCount         = 0;
  inPhotons        = [];
  outPhotons       = [];
  collElectrons    = [];
  electronRCurrent = atomData ? R(0) : 68;
  stateLbl         = '';
  stateLblT        = 0;
  evT              = 0;
  rayasVistas      = new Set();
  destellos        = [];
  pulsos           = [];
  estelaElectron   = [];
  activeTr         = null;
  activeTrT        = 0;
  if (atomData) diagElectronRY = diagTargetY();
  initGasMode();
  spectrumIntensity.fill(0);
  absorptionIntensity.fill(0);
  extSpectrumLines = {};
  updateUI();
}

function initGasMode() {
  gasAtomsList    = [];
  gasElectrons    = [];
  gasPhotonCounts = {};
  gasPhotonTotal  = 0;
  let n = currentMode === 'reto' ? 16 : gasDensity;
  let t = tubo();
  for (let i = 0; i < n; i++) {
    let x = random(t.x1 + 40, t.x2 - 40);
    let y = random(t.y1 + 18, t.y2 - 18);
    gasAtomsList.push(new GasAtomEntity(x, y, atomData));
  }
  tuboBrillo = 0;
}

// ─── PRE-RENDER DE FONDOS ESTÁTICOS ─────────────────────────────
function buildStaticBuffers() {
  let sw = SPEC_X2 - SPEC_X1;  // 840

  // Gradiente arcoíris del espectro visible (401 columnas, alpha 18)
  spectrumBgGfx = createGraphics(sw, SPEC_H);
  spectrumBgGfx.noStroke();
  let colW = (sw - 4) / 400;
  for (let i = 0; i <= 400; i++) {
    let [r, g, b] = wlToRGB(380 + i);
    let px = map(i, 0, 400, 2, sw - 2);
    spectrumBgGfx.fill(r, g, b, 18);
    spectrumBgGfx.rect(px, 2, colW, SPEC_H - 4);
  }

  // Arcoíris brillante para el espectro de absorción (mitad superior de la franja)
  absorptionBgGfx = createGraphics(sw, SPEC_H / 2);
  absorptionBgGfx.noStroke();
  for (let i = 0; i <= 400; i++) {
    let [r, g, b] = wlToRGB(380 + i);
    let px = map(i, 0, 400, 2, sw - 2);
    absorptionBgGfx.fill(r, g, b, 200);
    absorptionBgGfx.rect(px, 0, colW + 0.5, SPEC_H / 2);
  }

  // Degradados UV/IR del espectro extendido
  let uvW  = Math.floor(sw * 0.25);
  let gap  = 4;
  let irX1 = uvW + gap;
  let irW  = sw - irX1;
  extSpecBgGfx = createGraphics(sw, EXT_SPEC_H);
  extSpecBgGfx.noStroke();
  for (let i = 0; i < uvW; i++) {
    let t = i / uvW;
    extSpecBgGfx.fill(Math.floor(100 + t * 80), Math.floor(t * 20), 230, 10);
    extSpecBgGfx.rect(i, 2, 1, EXT_SPEC_H - 4);
  }
  for (let i = 0; i < irW; i++) {
    let t = i / irW;
    extSpecBgGfx.fill(Math.floor(190 - t * 110), 18, 5, 10);
    extSpecBgGfx.rect(irX1 + i, 2, 1, EXT_SPEC_H - 4);
  }
}

// ─── P5.JS SETUP ────────────────────────────────────────────────
let mqVertical = null, ajustarLienzo = () => {};

// Recalcula la disposición (apaisada o vertical, y la del reto) y rehace el lienzo
function rehacerGeometria() {
  aplicarGeometria(mqVertical ? mqVertical.matches : false, currentMode);
  if (width !== CV_W || height !== CV_H) resizeCanvas(CV_W, CV_H);
  buildStaticBuffers();
  initGasMode();
  diagElectronRY = diagTargetY();
  ajustarLienzo();
}
function setup() {
  if (document.fonts) document.fonts.load('600 12px Fredoka');
  // Doble resolución: el lienzo crece hasta llenar la zona de la simulación
  // (pizarra digital) sin verse borroso
  pixelDensity(Math.max(2, displayDensity()));
  mqVertical = window.matchMedia('(max-width: 700px)');
  aplicarGeometria(mqVertical.matches, currentMode);
  let canvas = createCanvas(CV_W, CV_H);
  canvas.parent('canvas-container');
  // El lienzo se escala para llenar su hueco sin deformarse: en un monitor o
  // un proyector grande el diagrama y los espectros se ven más grandes.
  const holder = document.getElementById('canvas-container');
  const fitCanvas = ajustarLienzo = () => {
    const cs = getComputedStyle(holder);
    const w = holder.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = holder.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    // En vertical (móvil) el lienzo ocupa todo el ancho y la página se desplaza
    const k = VERTICAL ? Math.max(0.1, w / CV_W) : Math.max(0.1, Math.min(w / CV_W, h / CV_H));
    canvas.elt.style.width = (CV_W * k) + 'px';
    canvas.elt.style.height = (CV_H * k) + 'px';
  };
  fitCanvas();
  if (window.ResizeObserver) new ResizeObserver(fitCanvas).observe(holder);
  const cambiarDisposicion = () => {
    if (mqVertical.matches === VERTICAL) return;
    rehacerGeometria();
  };
  if (mqVertical.addEventListener) mqVertical.addEventListener('change', cambiarDisposicion);
  else if (mqVertical.addListener) mqVertical.addListener(cambiarDisposicion);
  frameRate(60);
  textFont('Fredoka');
  atomData = ATOMS_DATA[currentAtomKey];
  electronRCurrent = R(0);
  buildStaticBuffers();
  setupControls();
  updateAtomDisplay();
  initGasMode();

  // Ajustes de la dirección (fichas del alumnado): ver js/parametros.js.
  aplicarParametrosUrl({
    modo:      urlParam.click({ fotones: 'mode-fotones', colision: 'mode-colision', 'colisión': 'mode-colision', gas: 'mode-gas', reto: 'mode-reto' }),
    elemento:  urlParam.select('atom-select'),
    luz:       urlParam.click({ blanca: 'btn-blanca', mono: 'btn-mono', monocromatica: 'btn-mono', 'monocromática': 'btn-mono' }),
    onda:      urlParam.range('slider-wl'),
    fotones:   urlParam.click({ uno: 'btn-foto-single', continua: 'btn-foto-rafaga' }),
    flujo:     urlParam.range('slider-rate'),
    energia:   urlParam.range('slider-eenergy'),
    disparo:   urlParam.click({ uno: 'btn-single', continuo: 'btn-rafaga' }),
    voltaje:   urlParam.range('slider-voltage'),
    densidad:  urlParam.range('slider-density'),
  });
}

// ─── P5.JS DRAW ─────────────────────────────────────────────────
function draw() {
  // Tablero redondeado dibujado dentro del lienzo: escala con él (móvil)
  clear();
  stroke(...CT.border); strokeWeight(2); fill(...CT.bg);
  rect(1, 1, width - 2, height - 2, CT.fun ? 30 : 12);
  noStroke();
  textFont('Fredoka');

  // Decaimiento del espectro (en pausa se congela, como todo lo demás)
  if (!isPaused) {
    for (let i = 0; i < spectrumIntensity.length; i++) {
      spectrumIntensity[i]   *= SPECTRUM_DECAY;
      absorptionIntensity[i] *= SPECTRUM_DECAY;
    }
    for (let k in extSpectrumLines) {
      extSpectrumLines[k] *= SPECTRUM_DECAY;
      if (extSpectrumLines[k] < 0.01) delete extSpectrumLines[k];
    }
  }

  if (isPaused) {
    // Dibujar estado congelado + mensaje
    drawCurrentMode(false);
    drawSpectrum();
    if (currentMode !== 'reto') drawExtendedSpectrum();
    for (let ph of outPhotons) if (ph.dest) ph.draw();
    drawBocadillo();
    drawPausedOverlay();
    return;
  }

  drawCurrentMode(true);
  drawSpectrum();
  if (currentMode !== 'reto') drawExtendedSpectrum();
  // Fotones en vuelo hacia su raya, por encima de todo
  for (let ph of outPhotons) if (ph.dest) ph.draw();
  drawDestellos();
  if (evT > 0) evT--;
  drawBocadillo();
  drawChispas();

  if (frameCount % 8 === 0) updateUI();
}

function drawCurrentMode(animate) {
  switch (currentMode) {
    case 'fotones':  drawPhotonMode(animate);    break;
    case 'colision': drawCollisionMode(animate); break;
    case 'gas':      drawGasMode(animate);       break;
    case 'reto':     drawRetoMode(animate);      break;
  }
}

function drawPausedOverlay() {
  // Velo suave sobre la simulación (no sobre el bocadillo) y una píldora «En pausa»
  fill(...CT.pauseOvl, 110);
  noStroke();
  rect(2, BUB_Y + BUB_H + 8, CV_W - 4, CV_H - BUB_Y - BUB_H - 10, 0, 0, 28, 28);
  let lbl = i18n.t('En pausa');
  textSize(22); textStyle(BOLD);
  let w = textWidth(lbl) + 40, cy = (SPEC_Y + BUB_Y + BUB_H) / 2;
  fill(...CT.ink); rect(CV_W / 2 - w / 2, cy - 20 + 4, w, 40, 20);
  stroke(...CT.border); strokeWeight(2); fill(...CT.panel);
  rect(CV_W / 2 - w / 2, cy - 20, w, 40, 20);
  noStroke(); fill(...CT.title);
  textAlign(CENTER, CENTER);
  text(lbl, CV_W / 2, cy - 1);
  textStyle(NORMAL);
}

// ─── MODO FOTONES ────────────────────────────────────────────────
function drawPhotonMode(animate) {
  if (animate) updatePhotonMode();
  drawLightSource();
  drawAtom(ATOM_CX, ATOM_CY);
  drawEnergyDiagram();

  for (let ph of inPhotons)  ph.draw();
  for (let ph of outPhotons) if (!ph.dest) ph.draw();

  // Etiqueta de la fuente, debajo de ella
  etiquetaFuente(lightType === 'white' ? i18n.t('Luz blanca') : monoWl + ' nm');

  if (fotoSingleShot) drawSourceFireHint();
}

// Banner + resalte de la fuente para el modo "disparo único".
// La fuente está a la izquierda, centrada en ATOM_CY.
// Resalte pulsante de la fuente en el modo «disparo único»; la instrucción
// («Haz clic en la fuente…») la dice la mascota en el bocadillo.
function drawSourceFireHint() {
  let sy = ATOM_CY;
  let pulse = MOV_REDUCIDO ? 0.6 : (sin(frameCount * 0.12) + 1) / 2;  // 0..1
  noFill();
  stroke(...CT.accent, 90 + pulse * 150);
  strokeWeight(2.5 + pulse * 1.5);
  rect(4, sy - 44, 82, 88, 18);
  noStroke();
}

// Píldora con el nombre de la fuente (luz blanca, 550 nm, 3,0 eV) bajo ella
function etiquetaFuente(txt) {
  textSize(15); textStyle(BOLD);
  let w = textWidth(txt) + 18, cx = 44, y = ATOM_CY + 52;
  if (cx - w / 2 < 8) cx = 8 + w / 2;
  fill(...CT.ink); rect(cx - w / 2, y + 3, w, 26, 13);
  stroke(...CT.border); strokeWeight(2); fill(...CT.panel);
  rect(cx - w / 2, y, w, 26, 13);
  noStroke(); fill(...CT.title);
  textAlign(CENTER, CENTER);
  text(txt, cx, y + 12);
  textStyle(NORMAL);
}

// ¿El ratón está sobre la fuente (zona clicable de disparo)?
function isOverSource() {
  let sy = ATOM_CY;
  if (mouseY < sy - 56 || mouseY > sy + 56) return false;
  if (currentMode === 'fotones')  return mouseX >= 8 && mouseX <= 72;
  if (currentMode === 'colision') return mouseX >= 6 && mouseX <= 72;
  return false;
}

function mousePressed() {
  if (currentMode === 'reto' && !isPaused) {
    if (retoResuelto) {
      let b = botonOtroGas();
      if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) { nuevaRonda(); return; }
    }
    for (let i = 0; i < GASES.length; i++) {
      let f = filaReto(i);
      if (mouseX > f.x && mouseX < f.x + f.w && mouseY > f.y && mouseY < f.y + f.h) { responderReto(GASES[i]); return; }
    }
    return;
  }
  if (isPaused || !isOverSource()) return;
  // Sin espera entre disparos: cada clic dispara. El átomo simplemente no
  // absorberá si ya está excitado o en una cascada de desexcitación.
  if (currentMode === 'fotones' && fotoSingleShot) {
    spawnIncomingPhoton();
  } else if (currentMode === 'colision' && collSingleShot) {
    let yOff = random(-20, 20);
    collElectrons.push(new CollisionElectron(80, ATOM_CY + yOff, electronEnergy));
  }
}

// Píldora sobre el lienzo para la etiqueta de una flecha (λ): fondo del color
// de la luz y texto claro u oscuro según lo claro que sea ese color.
function pildora(txt, x, y, col, tam) {
  textSize(tam); textStyle(BOLD);
  let w = textWidth(txt) + 12, h = tam + 8;
  stroke(...CT.ink); strokeWeight(1.5); fill(...col);
  rect(x - w / 2, y - h / 2, w, h, h / 2);
  noStroke();
  let claro = (col[0] * 0.299 + col[1] * 0.587 + col[2] * 0.114) > 120;
  fill(...(claro ? [7, 26, 43] : [255, 255, 255]));
  textAlign(CENTER, CENTER);
  text(txt, x, y - 1);
  textStyle(NORMAL);
}

function updatePhotonMode() {
  electronAngle += 0.018;
  electronRCurrent += (R(electronLevel) - electronRCurrent) * 0.09;
  if (stateLblT > 0) stateLblT--;
  if (activeTrT > 0) activeTrT--;

  // Generar fotones entrantes (solo en modo ráfaga)
  if (!fotoSingleShot) {
    photonSpawnT++;
    let spawnInterval = [24, 18, 12, 8, 5][photonRate - 1];
    if (photonSpawnT >= spawnInterval) {
      photonSpawnT = 0;
      spawnIncomingPhoton();
    }
  }

  // Actualizar fotones entrantes
  for (let i = inPhotons.length - 1; i >= 0; i--) {
    let ph = inPhotons[i];
    ph.update();
    // Colisión con átomo
    let d = dist(ph.x, ph.y, ATOM_CX, ATOM_CY);
    if (!ph.fading && electronLevel === 0 && atomCascade.length === 0 && d < R(0) + 12) {
      tryAbsorbPhoton(ph);
    }
    if (ph.done) inPhotons.splice(i, 1);
  }

  // Actualizar fotones salientes
  for (let i = outPhotons.length - 1; i >= 0; i--) {
    outPhotons[i].update();
    if (outPhotons[i].done) outPhotons.splice(i, 1);
  }

  // Temporizador de desexcitación
  if (exciteTimer > 0 && electronLevel > 0) {
    exciteTimer--;
    if (exciteTimer === 0) deExciteAtom();
  }
  updateAtomCascade();

  if (flashTimer > 0) flashTimer--;
  diagElectronRY += (diagTargetY() - diagElectronRY) * 0.10;
}

// Números con coma decimal, como se escriben en clase.
function fmt(x, d) {
  return i18n.num(x, d);
}

function spawnIncomingPhoton() {
  let wl;
  ultimoDisparo = millis();
  if (lightType === 'white') {
    wl = random(380, 780);
  } else {
    wl = monoWl;
  }
  let yOffset = random(-30, 30);
  let target  = { x: ATOM_CX, y: ATOM_CY + yOffset };
  let startX  = 90;
  let startY  = ATOM_CY + yOffset * 0.5;
  let dx = target.x - startX;
  let dy = target.y - startY;
  let mag = sqrt(dx * dx + dy * dy);
  let speed = 4.5;
  inPhotons.push(new Photon(startX, startY, wl, dx / mag * speed, dy / mag * speed));
}

function tryAbsorbPhoton(ph) {
  // Buscar transición desde el nivel actual que coincida con la λ del fotón
  for (let tr of atomData.transitions) {
    if (tr.from !== electronLevel) continue;
    // Con luz monocromática solo se absorbe la longitud de onda justa: el
    // deslizador va de 2 en 2 nm, así que basta 1 nm de margen para alcanzar
    // también las líneas impares (589 nm del sodio). Con luz blanca el margen
    // es mayor solo para que, de entre tantos fotones al azar, se absorban los
    // suficientes y las rayas oscuras aparezcan en un tiempo de clase.
    let tolerance = lightType === 'white' ? 18 : 2; // nm
    if (abs(ph.wl - tr.wl) < tolerance && tr.wl >= 380 && tr.wl <= 780) {
      // ¡Absorción!
      ph.fading = true;
      updateAbsorptionSpectrum(tr.wl);
      electronLevel = tr.to;
      exciteTimer = floor(random(80, 160));
      flashTimer  = 25;
      absCount++;
      stateLbl    = i18n.t('ABSORBE  {wl} nm    ({de} → {a})', { wl: tr.wl, de: atomData.levelLabels[tr.from], a: atomData.levelLabels[tr.to] });
      stateLblClr = wlToRGB(tr.wl);
      stateLblT   = 120;
      activeTr    = tr;
      activeTrT   = 120;
      lanzarPulso(ATOM_CX + cos(electronAngle) * electronRCurrent, ATOM_CY + sin(electronAngle) * electronRCurrent, wlToRGB(tr.wl));
      contar(i18n.t('Absorbe'), i18n.t('Luz de {wl} nm: el electrón sube de {de} a {a}',
        { wl: tr.wl, de: atomData.levelLabels[tr.from], a: atomData.levelLabels[tr.to] }), wlToRGB(tr.wl));
      return;
    }
  }
  // No absorbido: el fotón sigue de largo
}

function drawLightSource() {
  // Linterna: cuerpo metálico, cabezal y lente del color de la luz, con haz
  let sy = ATOM_CY, ctx = drawingContext;
  let blanca = lightType === 'white';
  let [mr, mg, mb] = blanca ? [255, 248, 225] : wlToRGB(monoWl);

  // Haz de luz hacia el átomo (siempre en emisión continua; un instante al disparar)
  let haz = !fotoSingleShot ? 1 : constrain(1 - (millis() - ultimoDisparo) / 500, 0, 1);
  if (haz > 0) {
    let g = ctx.createLinearGradient(74, 0, ATOM_CX - 20, 0);
    g.addColorStop(0, `rgba(${mr},${mg},${mb},${0.32 * haz})`);
    g.addColorStop(1, `rgba(${mr},${mg},${mb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(74, sy - 24); ctx.lineTo(ATOM_CX - 20, sy - 70);
    ctx.lineTo(ATOM_CX - 20, sy + 70); ctx.lineTo(74, sy + 24);
    ctx.closePath(); ctx.fill();
  }

  // Cuerpo
  noStroke(); fill(...CT.ink); rect(12, sy - 20 + 4, 44, 40, 10);
  stroke(...CT.ink); strokeWeight(2.5); fill(...CT.panel2);
  rect(12, sy - 20, 44, 40, 10);
  stroke(...CT.ink, 120); strokeWeight(2);
  line(26, sy - 14, 26, sy + 14); line(34, sy - 14, 34, sy + 14);
  noStroke(); fill(...CT.accent); circle(45, sy - 10, 7);
  // Cabezal
  stroke(...CT.ink); strokeWeight(2.5); fill(...CT.panel2);
  quad(56, sy - 18, 70, sy - 30, 70, sy + 30, 56, sy + 18);
  // Lente
  ctx.save(); ctx.shadowBlur = 22; ctx.shadowColor = `rgba(${mr},${mg},${mb},0.95)`;
  if (blanca) {
    let gl = ctx.createLinearGradient(0, sy - 28, 0, sy + 28);
    [656, 600, 575, 530, 486, 450, 410].forEach((w, i) => {
      let [r, g2, b] = wlToRGB(w); gl.addColorStop(i / 6, `rgb(${r},${g2},${b})`);
    });
    ctx.fillStyle = gl;
    ctx.beginPath(); ctx.ellipse(72, sy, 7, 28, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    noStroke(); fill(mr, mg, mb); ellipse(72, sy, 14, 56);
  }
  ctx.restore();
  noFill(); stroke(...CT.ink); strokeWeight(2.5); ellipse(72, sy, 14, 56);
  noStroke();
}

// ─── MODO COLISIÓN ───────────────────────────────────────────────
function drawCollisionMode(animate) {
  if (animate) updateCollisionMode();
  drawElectronGun();
  drawAtom(ATOM_CX, ATOM_CY);
  drawEnergyDiagram();

  for (let ce of collElectrons) ce.draw();
  for (let ph of outPhotons) if (!ph.dest) ph.draw();

  etiquetaFuente(fmt(electronEnergy, 1) + ' eV');
  if (collSingleShot) drawSourceFireHint();
}

function updateCollisionMode() {
  electronAngle += 0.018;
  electronRCurrent += (R(electronLevel) - electronRCurrent) * 0.09;
  if (stateLblT > 0) stateLblT--;
  if (activeTrT > 0) activeTrT--;

  if (!collSingleShot) {
    electronSpawnT++;
    let spawnInterval = [30, 22, 14, 9, 5][electronRate - 1];
    if (electronSpawnT >= spawnInterval) {
      electronSpawnT = 0;
      let yOff = random(-20, 20);
      collElectrons.push(new CollisionElectron(80, ATOM_CY + yOff, electronEnergy));
    }
  }

  for (let i = collElectrons.length - 1; i >= 0; i--) {
    let e = collElectrons[i];
    e.update();
    let d = dist(e.x, e.y, ATOM_CX, ATOM_CY);
    if (!e.collided && electronLevel === 0 && atomCascade.length === 0 && d < R(0) + 10) {
      tryCollisionExcite(e);
    }
    if (e.done) collElectrons.splice(i, 1);
  }

  for (let i = outPhotons.length - 1; i >= 0; i--) {
    outPhotons[i].update();
    if (outPhotons[i].done) outPhotons.splice(i, 1);
  }

  if (exciteTimer > 0 && electronLevel > 0) {
    exciteTimer--;
    if (exciteTimer === 0) deExciteAtom();
  }
  updateAtomCascade();
  if (flashTimer > 0) flashTimer--;
  diagElectronRY += (diagTargetY() - diagElectronRY) * 0.10;
}

function tryCollisionExcite(electron) {
  // El electrón puede excitar el átomo si tiene suficiente energía
  let bestTarget = -1;
  let bestDE = 0;
  for (let lv = 1; lv < atomData.levels; lv++) {
    let needed = atomData.energies[lv] - atomData.energies[electronLevel];
    if (needed > 0 && electron.energy >= needed && needed > bestDE) {
      bestTarget = lv;
      bestDE = needed;
    }
  }
  if (bestTarget >= 0) {
    let prevLevel = electronLevel;
    electronLevel = bestTarget;
    exciteTimer   = floor(random(80, 160));
    flashTimer    = 25;
    absCount++;
    electron.collided = true;
    electron.vx *= -0.6;
    stateLbl    = i18n.t('EXCITACIÓN  ({de} → {a})', { de: atomData.levelLabels[prevLevel], a: atomData.levelLabels[bestTarget] });
    stateLblClr = [80, 210, 255];
    stateLblT   = 120;
    let tr = findTransition(atomData, prevLevel, bestTarget);
    if (tr) { activeTr = tr; activeTrT = 120; }
    lanzarPulso(ATOM_CX + cos(electronAngle) * electronRCurrent, ATOM_CY + sin(electronAngle) * electronRCurrent, [0, 220, 255]);
    contar(i18n.t('Choque'), i18n.t('El electrón cede {e} eV y el átomo sube de {de} a {a}',
      { e: fmt(bestDE, 2), de: atomData.levelLabels[prevLevel], a: atomData.levelLabels[bestTarget] }), [0, 200, 255]);
  } else {
    electron.collided = true;
    stateLbl    = i18n.t('Colisión elástica — energía insuficiente');
    stateLblClr = [150, 150, 150];
    stateLblT   = 90;
    contar(i18n.t('Rebota'), i18n.t('Al electrón le falta energía para cualquier salto: el átomo no cambia'), CT.nivel, 150);
  }
  electron.done = true;
}

function drawElectronGun() {
  // Cañón de electrones: tubo metálico con el filamento incandescente a la vista
  let sy = ATOM_CY, ctx = drawingContext;
  noStroke(); fill(...CT.ink); rect(10, sy - 24 + 4, 52, 48, 12);
  stroke(...CT.ink); strokeWeight(2.5); fill(...CT.panel2);
  rect(10, sy - 24, 52, 48, 12);
  // Ventana con el filamento
  fill(...CT.specBg); rect(17, sy - 14, 30, 28, 7);
  let brillo = map(electronEnergy, 0.5, 6.0, 0.45, 1);
  ctx.save(); ctx.shadowBlur = 12; ctx.shadowColor = `rgba(255,150,40,${brillo})`;
  noFill(); stroke(255, 150 + 80 * brillo, 60, 255); strokeWeight(2.5);
  beginShape();
  for (let i = 0; i <= 8; i++) vertex(21 + i * 2.8, sy + (i % 2 ? -7 : 7));
  endShape();
  ctx.restore();
  // Boquilla
  stroke(...CT.ink); strokeWeight(2.5); fill(...CT.panel2);
  rect(60, sy - 10, 16, 20, 4);
  ctx.save(); ctx.shadowBlur = 18; ctx.shadowColor = 'rgba(0,220,255,0.9)';
  noStroke(); fill(0, 220, 255, 120 + 120 * brillo); circle(78, sy, 10);
  ctx.restore();
  noStroke();
}


// ─── MODO GAS IONIZADO ──────────────────────────────────────────
let tuboBrillo = 0;

function voltajeActual() { return currentMode === 'reto' ? 6 : gasVoltage; }

// Color del tubo encendido: mezcla de los colores de las rayas visibles del gas
function colorTubo() {
  let vis = atomData.transitions.filter(t => t.visible);
  if (!vis.length) return atomData.nucleusColor;
  let c = [0, 0, 0];
  for (let t of vis) { let k = wlToRGB(t.wl); c[0] += k[0]; c[1] += k[1]; c[2] += k[2]; }
  c = c.map(v => v / vis.length);
  let m = max(c[0], c[1], c[2]) || 1;
  return c.map(v => min(255, v * 255 / m * 0.95 + 12));
}

function drawTubo() {
  let t = tubo(), ctx = drawingContext;
  let h = t.y2 - t.y1, r = h / 2;
  let col = colorTubo();
  // La lámpara luce de forma continua si los electrones pueden excitar el gas;
  // cada fotón visible la aviva un poco más
  let excitados = gasAtomsList.filter(a => a.level > 0).length / max(1, gasAtomsList.length);
  let base = voltajeActual() >= atomData.energies[1] ? 0.35 + 0.5 * excitados : 0;
  let b = max(tuboBrillo, base);

  // Cables y fuente de alimentación (solo en el modo gas)
  if (currentMode === 'gas') {
    let fy = t.y2 + 58, fx = (t.x1 + t.x2) / 2;
    stroke(...CT.ink); strokeWeight(3); noFill();
    line(t.x1 + min(r * 0.45, 40), t.y1 + r, t.x1 - 14, t.y1 + r);
    line(t.x1 - 14, t.y1 + r, t.x1 - 14, fy); line(t.x1 - 14, fy, fx - 70, fy);
    line(t.x2 - min(r * 0.45, 40), t.y1 + r, t.x2 + 14, t.y1 + r);
    line(t.x2 + 14, t.y1 + r, t.x2 + 14, fy); line(t.x2 + 14, fy, fx + 70, fy);
    noStroke(); fill(...CT.ink); rect(fx - 70, fy - 24 + 4, 140, 48, 12);
    stroke(...CT.ink); strokeWeight(2.5); fill(...CT.panel2);
    rect(fx - 70, fy - 24, 140, 48, 12);
    noStroke(); fill(...CT.title); textAlign(CENTER, CENTER);
    textStyle(BOLD); textSize(20);
    text(fmt(gasVoltage, 1) + ' V', fx, fy - 1);
    textStyle(NORMAL); textSize(15); fill(...CT.muted);
    text('−', fx - 56, fy - 1); text('+', fx + 56, fy - 1);
    textSize(13); textAlign(LEFT, CENTER);
    text(i18n.t('Cátodo (−)'), t.x1 - 10, t.y2 + 18);
    textAlign(RIGHT, CENTER);
    text(i18n.t('Ánodo (+)'), t.x2 + 10, t.y2 + 18);
  }

  // Resplandor y gas encendido
  ctx.save();
  ctx.shadowBlur = 50 * b;
  ctx.shadowColor = `rgba(${col[0]},${col[1]},${col[2]},${0.9 * b})`;
  noStroke();
  fill(col[0], col[1], col[2], 22 + 150 * b);
  rect(t.x1, t.y1, t.x2 - t.x1, h, r);
  ctx.restore();
  // Núcleo más brillante del plasma, del color del gas
  if (b > 0.15) {
    let k = (b - 0.15) / 0.85;
    fill(lerp(col[0], 255, 0.5), lerp(col[1], 255, 0.5), lerp(col[2], 255, 0.5), 110 * k);
    rect(t.x1 + r * 0.7, t.y1 + h * 0.36, t.x2 - t.x1 - r * 1.4, h * 0.28, h * 0.14);
  }
  // Electrodos: discos metálicos dentro del vidrio
  let ex = min(r * 0.45, 40);
  stroke(...CT.ink); strokeWeight(2); fill(190, 205, 220);
  rect(t.x1 + ex, t.y1 + h * 0.3, 9, h * 0.4, 4);
  rect(t.x2 - ex - 9, t.y1 + h * 0.3, 9, h * 0.4, 4);
  noStroke();

  for (let ga of gasAtomsList) ga.draw();
  for (let ge of gasElectrons) ge.draw();

  // Vidrio: contorno y reflejos
  noFill();
  stroke(...CT.ink); strokeWeight(3);
  rect(t.x1, t.y1, t.x2 - t.x1, h, r);
  stroke(255, 255, 255, 120); strokeWeight(2);
  rect(t.x1 + 4, t.y1 + 4, t.x2 - t.x1 - 8, h - 8, r - 4);
  stroke(255, 255, 255, 90); strokeWeight(4);
  line(t.x1 + r, t.y1 + 12, t.x2 - r, t.y1 + 12);
  noStroke();
}

function drawGasMode(animate) {
  if (animate) updateGasMode();
  drawTubo();
  for (let ph of outPhotons) if (!ph.dest) ph.draw();
  drawGasCounters();
}

function updateGasMode() {
  electronAngle += 0.01;

  // Generar electrones del tubo
  gasElectronT++;
  let v = voltajeActual();
  let eInterval = floor(map(v, 1, 8, 40, 10));
  if (gasElectronT >= eInterval) {
    gasElectronT = 0;
    let t = tubo();
    let ey = random(t.y1 + 12, t.y2 - 12);
    gasElectrons.push(new GasElectron(t.x1 + min((t.y2 - t.y1) * 0.225, 40) + 12, ey, v));
  }
  tuboBrillo *= 0.992;

  // Actualizar electrones y comprobar colisiones
  for (let i = gasElectrons.length - 1; i >= 0; i--) {
    let e = gasElectrons[i];
    e.update();
    // Colisión con átomos
    for (let a of gasAtomsList) {
      if (a.level === 0 && a.cooldown <= 0 && dist(e.x, e.y, a.x, a.y) < 14) {
        tryGasExcite(e, a);
        break;
      }
    }
    if (e.done) gasElectrons.splice(i, 1);
  }
  // Limitar nº de electrones
  if (gasElectrons.length > 30) gasElectrons.shift();

  // Actualizar átomos
  for (let a of gasAtomsList) a.update();

  // Actualizar fotones
  for (let i = outPhotons.length - 1; i >= 0; i--) {
    outPhotons[i].update();
    if (outPhotons[i].done) outPhotons.splice(i, 1);
  }
  if (outPhotons.length > 160) outPhotons.splice(0, outPhotons.length - 160);
}

function tryGasExcite(electron, atom) {
  let bestTarget = -1;
  let bestDE = 0;
  for (let lv = 1; lv < atomData.levels; lv++) {
    let needed = atomData.energies[lv];
    if (electron.energy >= needed && needed > bestDE) {
      bestTarget = lv;
      bestDE = needed;
    }
  }
  if (bestTarget >= 0 && random() < 0.4) {
    atom.excite(bestTarget);
    electron.vx = max(1, electron.vx * 0.6);  // frena pero sigue hacia el ánodo
    electron.vy += random(-1, 1);
  }
}

// ─── ÁTOMO PLANETARIO ───────────────────────────────────────────
let estelaElectron = [];

function drawAtom(cx, cy) {
  let atom = atomData;
  let nc   = atom.nucleusColor;
  let maxR = R(atom.levels - 1);

  // Halo suave del color del elemento (sin plato: el átomo flota en el tablero)
  let ctx = drawingContext;
  let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR + 70);
  let fuerza = CT === CANVAS_THEMES.light ? 0.30 : 0.22;
  g.addColorStop(0, `rgba(${nc[0]},${nc[1]},${nc[2]},${fuerza + 0.12})`);
  g.addColorStop(0.55, `rgba(${nc[0]},${nc[1]},${nc[2]},${fuerza * 0.4})`);
  g.addColorStop(1, `rgba(${nc[0]},${nc[1]},${nc[2]},0)`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, maxR + 70, 0, Math.PI * 2); ctx.fill();

  // ── Órbitas: anillos suaves; la del electrón, gruesa y luminosa ──
  for (let i = 0; i < atom.levels; i++) {
    let r = R(i);
    let activo = i === electronLevel;
    noFill();
    if (activo) {
      ctx.save(); ctx.shadowBlur = 14; ctx.shadowColor = `rgba(${CT.electron.join(',')},0.8)`;
      stroke(...CT.electron); strokeWeight(3.5);
      circle(cx, cy, r * 2);
      ctx.restore();
    } else {
      stroke(atom.orbitStroke[0], atom.orbitStroke[1], atom.orbitStroke[2], 150);
      strokeWeight(2);
      drawingContext.setLineDash([2, 7]);
      circle(cx, cy, r * 2);
      drawingContext.setLineDash([]);
    }
  }
  noStroke();

  drawPulsos();

  // ── Núcleo: esfera brillante con contorno de tinta ──
  ctx.save(); ctx.shadowBlur = 24; ctx.shadowColor = `rgba(${nc[0]},${nc[1]},${nc[2]},0.9)`;
  stroke(...CT.ink); strokeWeight(2.5);
  fill(nc[0], nc[1], nc[2]);
  circle(cx, cy, 30);
  ctx.restore();
  noStroke(); fill(255, 255, 255, 170);
  ellipse(cx - 5, cy - 6, 10, 7);

  // ── Electrón con estela (se ve el salto entre órbitas) ──
  let eX = cx + cos(electronAngle) * electronRCurrent;
  let eY = cy + sin(electronAngle) * electronRCurrent;
  if (!isPaused) {
    estelaElectron.push({ x: eX, y: eY });
    if (estelaElectron.length > 14) estelaElectron.shift();
  }
  for (let i = 0; i < estelaElectron.length; i++) {
    let k = i / estelaElectron.length;
    fill(...CT.electron, 150 * k);
    circle(estelaElectron[i].x, estelaElectron[i].y, 4 + 8 * k);
  }
  if (flashTimer > 0) {
    fill(...CT.exciteTxt, map(flashTimer, 0, 25, 0, 200));
    circle(eX, eY, 30 + (25 - flashTimer) * 1.6);
  }
  ctx.save(); ctx.shadowBlur = 16; ctx.shadowColor = `rgba(${CT.electron.join(',')},0.9)`;
  stroke(...CT.ink); strokeWeight(2.2);
  fill(...CT.electron);
  circle(eX, eY, 16);
  ctx.restore();
  noStroke(); fill(255, 255, 255, 170);
  circle(eX - 2.5, eY - 2.5, 5);

  // ── Nombre de cada nivel, arriba a la izquierda de su órbita ──
  // (las energías están en el diagrama: aquí solo el nombre, sin cajas)
  textAlign(CENTER, CENTER);
  textStyle(BOLD); textSize(15);
  for (let i = 0; i < atom.levels; i++) {
    let r = R(i), a = -HALF_PI;
    let lx = cx + cos(a) * r, ly = cy + sin(a) * r;
    let activo = i === electronLevel;
    stroke(...CT.bg); strokeWeight(5);
    fill(...(activo ? CT.electron : CT.title));
    text(atom.levelLabels[i], lx, ly);
  }
  noStroke(); textStyle(NORMAL);
}



// ─── DIAGRAMA DE NIVELES DE ENERGÍA ─────────────────────────────
function eToYDiag(e) {
  let maxE = atomData.energies[atomData.levels - 1];
  let abajo = DIAG_Y + DIAG_H - (atomData.symbol === 'H' ? 52 : 30);
  return map(e, 0, maxE, abajo, DIAG_Y + 58);
}

function drawEnergyDiagram() {
  let atom  = atomData;
  let x0    = DIAG_X;
  let y0    = DIAG_Y;
  let w     = DIAG_W;
  let h     = DIAG_H;

  // Tarjeta del diagrama
  noStroke(); fill(...CT.ink, CT.fun ? 255 : 0); rect(x0, y0 + 4, w, h, 20);
  stroke(...CT.border); strokeWeight(2); fill(...CT.panelBg);
  rect(x0, y0, w, h, 20);
  noStroke();

  // Título
  fill(...CT.title);
  textAlign(LEFT, TOP);
  textStyle(BOLD); textSize(16);
  text(i18n.t('Diagrama de niveles'), x0 + 16, y0 + 12);
  textStyle(NORMAL);

  let axX = x0 + 50;           // eje de energías
  let finX = x0 + w - 14;      // final de las líneas de nivel
  stroke(...CT.border); strokeWeight(1.5);
  line(axX, y0 + 44, axX, y0 + h - 18);
  noStroke(); fill(...CT.muted); textSize(12); textAlign(RIGHT, CENTER);
  text('eV', axX - 6, y0 + 44);

  // Niveles
  for (let i = 0; i < atom.levels; i++) {
    let e = atom.energies[i];
    let ly = eToYDiag(e);
    let isActive = (i === electronLevel);
    stroke(...(isActive ? CT.electron : CT.nivel), isActive ? 255 : 200);
    strokeWeight(isActive ? 4 : 2);
    line(axX, ly, finX, ly);
    noStroke();

    // Energía a la izquierda del eje y nombre del nivel encima, al final
    fill(...CT.muted);
    textAlign(RIGHT, CENTER); textSize(13);
    text(fmt(e, 2), axX - 6, ly);
    fill(...(isActive ? CT.electron : CT.title));
    textAlign(RIGHT, BOTTOM); textStyle(BOLD); textSize(14);
    text(atom.levelLabels[i], finX, ly - 3);
    textStyle(NORMAL);
  }
  // En el hidrógeno el nivel de abajo es n = 2, no el fundamental (n = 1):
  // se dice en el propio diagrama para no confundirlos.
  if (atom.symbol === 'H') {
    textFont(FUENTE_TEXTO);
    fill(...CT.muted); textSize(11.5); textLeading(14);
    textAlign(LEFT, TOP);
    text(i18n.t('Nivel más bajo de este modelo. El fundamental (n=1) no se muestra.'), axX + 4, eToYDiag(0) + 8, finX - axX - 4);
    textFont('Fredoka');
  }

  // Flechas de transición: las visibles, separadas y con la λ en vertical junto
  // a cada flecha; las infrarrojas, discontinuas y finas a la derecha.
  let vis = atom.transitions.filter(t => t.visible);
  let inv = mostrarIR ? atom.transitions.filter(t => !t.visible) : [];
  let paso = min(34, (finX - axX - 70) / max(1, vis.length + (inv.length ? 1 : 0)));
  let xVis = axX + 52;
  let xInv = xVis + paso * vis.length + 6;
  let pasoInv = inv.length ? min(9, (finX - 40 - xInv) / max(1, inv.length)) : 0;
  let todas = vis.map((tr, i) => ({ tr, x: xVis + i * paso }))
    .concat(inv.map((tr, i) => ({ tr, x: xInv + i * pasoInv })));
  for (let { tr, x } of todas) {
    let y1 = eToYDiag(atom.energies[tr.from]);
    let y2 = eToYDiag(atom.energies[tr.to]);
    let col = tr.visible ? wlToRGB(tr.wl) : CT.nivel;
    let activa = activeTrT > 0 && activeTr &&
      ((tr.from === activeTr.from && tr.to === activeTr.to) ||
       (tr.from === activeTr.to   && tr.to === activeTr.from));
    stroke(col[0], col[1], col[2], tr.visible ? 255 : 170);
    strokeWeight(activa ? 5 : (tr.visible ? 3 : 1.4));
    if (!tr.visible) drawingContext.setLineDash([3, 4]);
    line(x, y1, x, y2 + 6);
    drawingContext.setLineDash([]);
    if (activa) {
      noFill(); stroke(...CT.title, 200); strokeWeight(1.5);
      rect(x - 7, y2 - 4, 14, y1 - y2 + 8, 7);
    }
    // Punta hacia abajo (emisión)
    noStroke();
    fill(col[0], col[1], col[2], tr.visible ? 255 : 170);
    triangle(x, y1 + 1, x - 5, y1 - 8, x + 5, y1 - 8);

    if (tr.visible) {
      // λ en vertical, junto a la flecha
      push();
      translate(x + 12, (y1 + y2) / 2);
      rotate(-HALF_PI);
      pildoraSinBorde(tr.wl + ' nm', col, activa ? 14 : 12);
      pop();
    }
  }
  if (inv.length) {
    fill(...CT.muted); textSize(12); textAlign(CENTER, TOP);
    text('IR', xInv + pasoInv * (inv.length - 1) / 2, eToYDiag(atom.energies[1]) + 6);
  }

  // Electrón animado en el diagrama (posición interpolada)
  let targY   = diagTargetY();
  let distY   = abs(diagElectronRY - targY);
  let eX      = axX + 22;
  noStroke();
  if (distY > 3) {
    fill(...CT.electron, map(distY, 3, 40, 0, 110));
    circle(eX, targY, 12);
  }
  stroke(...CT.ink); strokeWeight(2);
  fill(...CT.electron);
  circle(eX, diagElectronRY, 13);
  noStroke();
}

// Etiqueta en píldora sin borde, centrada en el origen (para textos girados)
function pildoraSinBorde(txt, col, tam) {
  textSize(tam); textStyle(BOLD);
  let w = textWidth(txt) + 10, h = tam + 6;
  fill(...col); noStroke();
  rect(-w / 2, -h / 2, w, h, h / 2);
  let claro = (col[0] * 0.299 + col[1] * 0.587 + col[2] * 0.114) > 120;
  fill(...(claro ? [7, 26, 43] : [255, 255, 255]));
  textAlign(CENTER, CENTER);
  text(txt, 0, -1);
  textStyle(NORMAL);
}


// ─── CONTADORES MODO GAS ─────────────────────────────────────────
function drawGasCounters() {
  let excitedN = gasAtomsList.filter(a => a.level > 0).length;
  // Contadores: a la izquierda de la fuente, bajo el tubo
  let t = tubo();
  let txt = i18n.t('Átomos excitados: {x} de {n}', { x: excitedN, n: gasAtomsList.length });
  let txt2 = i18n.t('Fotones emitidos: {f}', { f: gasPhotonTotal });
  textSize(VERTICAL ? 13 : 15); textAlign(LEFT, CENTER);
  let y = t.y2 + 46;
  fill(...CT.muted);
  if (VERTICAL) { text(txt, t.x1 - 10, y + 54); textAlign(RIGHT, CENTER); text(txt2, t.x2 + 10, y + 54); }
  else { text(txt, t.x1 + 10, y); text(txt2, t.x1 + 10, y + 24); }
}

// ─── ESPECTRO ────────────────────────────────────────────────────
function drawSpectrum() {
  let x1 = SPEC_X1, x2 = SPEC_X2, y = SPEC_Y, h = SPEC_H;
  let w = x2 - x1;

  // Marco: tarjeta oscura (las rayas de emisión se ven sobre negro, como en el
  // laboratorio) con sombra de tinta
  noStroke(); fill(...CT.ink, CT.fun ? 255 : 0); rect(x1, y + 4, w, h, 12);
  fill(...CT.specBg);
  stroke(...CT.specBord);
  strokeWeight(2);
  rect(x1, y, w, h, 12);

  // Gradiente de fondo pre-renderizado (arcoíris tenue)
  if (spectrumBgGfx) image(spectrumBgGfx, x1, y);

  // En el modo fotones la franja se parte en dos sobre el mismo eje de λ:
  // arriba el espectro de absorción (la luz que atraviesa, con rayas oscuras)
  // y abajo el de emisión. Así se ve que las rayas coinciden.
  let split = currentMode === 'fotones';
  let yEm   = split ? y + h / 2 : y + 2;          // zona de las líneas de emisión
  let hEm   = split ? h / 2 - 2 : h - 4;

  if (split) {
    let hAb = h / 2 - 2;
    if (absorptionBgGfx) image(absorptionBgGfx, x1, y + 2, w, hAb, 0, 0, w, hAb);
    noStroke();
    for (let i = 0; i <= 400; i++) {
      let intensity = absorptionIntensity[i];
      if (intensity < 0.01) continue;
      let px = map(i, 0, 400, x1 + 2, x2 - 2);
      fill(8, 10, 14, intensity * 255);   // negro también con el tema claro
      rect(px - 1.6, y + 2, 3.2, hAb);
    }
    stroke(...CT.specBord, 160);
    strokeWeight(1);
    line(x1, y + h / 2, x2, y + h / 2);
    noStroke();
  }

  // Líneas de emisión
  noStroke();
  for (let i = 0; i <= 400; i++) {
    let intensity = spectrumIntensity[i];
    if (intensity < 0.01) continue;
    let wl = 380 + i;
    let [r, g, b] = wlToRGB(wl);
    let px = map(i, 0, 400, x1 + 2, x2 - 2);
    // Halo
    fill(r, g, b, intensity * 70);
    rect(px - 2.5, yEm, 5, hEm);
    // Línea central
    fill(r, g, b, intensity * 250);
    rect(px - 1.2, yEm, 2.4, hEm);
  }

  // Huecos de la «huella»: dónde caerán las rayas visibles del elemento
  if (currentMode !== 'reto') {
    let huella = atomData.transitions.filter(t => t.visible);
    for (let t of huella) {
      if (rayasVistas.has(t.wl)) continue;
      let px = xVisible(t.wl), [r, g, b] = wlToRGB(t.wl);
      noFill(); stroke(r, g, b, 150 + 80 * sin(millis() / 300)); strokeWeight(1.5);
      drawingContext.setLineDash([3, 3]);
      rect(px - 5, yEm + 3, 10, hEm - 20, 3);
      drawingContext.setLineDash([]);
    }
    noStroke();
    // Contador «Huella del hidrógeno: 2 de 3»
    let txt = i18n.t('Huella del {elemento}: {n} de {t}', { elemento: nombreElemento().toLocaleLowerCase(), n: rayasVistas.size, t: huella.length });
    textStyle(BOLD); textSize(13);
    let tw = textWidth(txt) + 34, ty = y + 14;
    let completa = rayasVistas.size === huella.length && huella.length > 0;
    fill(...(completa ? CT.accent : CT.specBg), completa ? 255 : 225);
    rect(x2 - tw - 6, ty - 10, tw, 20, 10);
    fill(...(completa ? CT.ink : CT.specTitle));
    estrella(x2 - tw + 6, ty, 6, 2.6);
    textAlign(LEFT, CENTER);
    text(txt, x2 - tw + 16, ty - 1);
    textStyle(NORMAL);
  }

  // Marcadores de longitud de onda
  let markers = [400, 450, 500, 550, 600, 650, 700, 750];
  for (let wlM of markers) {
    let px = map(wlM - 380, 0, 400, x1 + 2, x2 - 2);
    stroke(...CT.specTick, 110);
    strokeWeight(1);
    line(px, y + h - 6, px, y + h - 2);
    noStroke();
    fill(...CT.specTick, 220);
    textAlign(CENTER, BOTTOM);
    textSize(12);
    if (!VERTICAL || wlM % 100 === 0) text(wlM === 750 || (VERTICAL && wlM === 700) ? wlM + ' nm' : wlM, px, y + h - 5);
  }

  // Títulos: píldoras oscuras para que se lean sobre el arcoíris
  noStroke();
  textAlign(LEFT, CENTER);
  textStyle(BOLD); textSize(14);
  let rotulo = (lbl, ty) => {
    let tw = textWidth(lbl);
    fill(...CT.specBg, 225);
    rect(x1 + 6, ty - 10, tw + 14, 20, 10);
    fill(...CT.specTitle);
    text(lbl, x1 + 13, ty - 1);
  };
  if (split) {
    rotulo(i18n.t('Espectro de absorción'), y + 14);
    rotulo(i18n.t('Espectro de emisión'), y + h / 2 + 13);
  } else {
    rotulo(i18n.t(currentMode === 'reto' ? 'Espectro del gas misterioso' : 'Espectro de emisión'), y + 14);
  }
  textStyle(NORMAL);
}

// ─── ESPECTRO EXTENDIDO UV/IR ────────────────────────────────────
function updateExtSpectrum(wl) {
  if (wl >= 380 && wl <= 780) return;
  let k = Math.round(wl);
  extSpectrumLines[k] = Math.min(1.0, (extSpectrumLines[k] || 0) + 0.7);
  let k1 = k - 3, k2 = k + 3;
  if (k1 > 0)    extSpectrumLines[k1] = Math.min(1.0, (extSpectrumLines[k1] || 0) + 0.2);
  if (k2 < 9999) extSpectrumLines[k2] = Math.min(1.0, (extSpectrumLines[k2] || 0) + 0.2);
}

function drawExtendedSpectrum() {
  let x1  = SPEC_X1, x2 = SPEC_X2;
  let y   = EXT_SPEC_Y, h = EXT_SPEC_H;
  let w   = x2 - x1;
  let uvW  = floor(w * 0.25);
  let uvX1 = x1, uvX2 = x1 + uvW;
  let gap  = 4;
  let irX1 = uvX2 + gap, irX2 = x2;
  let irW  = irX2 - irX1;

  // Fondos de sección
  fill(...CT.specBg);
  stroke(...CT.specBord);
  strokeWeight(2);
  rect(uvX1, y, uvW, h, 10, 0, 0, 10);
  rect(irX1, y, irW, h, 0, 10, 10, 0);

  // Degradados pre-renderizados UV/IR
  if (extSpecBgGfx) image(extSpecBgGfx, x1, y);

  // Etiquetas de sección
  noStroke();
  fill(205, 160, 255);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(VERTICAL ? 'UV' : 'UV  (200–380 nm)', uvX1 + uvW / 2, y + h / 2);
  fill(255, 170, 120);
  text(VERTICAL ? 'IR  (780–3000 nm)' : 'IR  (780–3000 nm) · ' + i18n.t('no se ve'), irX1 + irW / 2, y + h / 2);

  // Marcadores estáticos de transiciones del átomo actual (siempre visibles)
  for (let tr of atomData.transitions) {
    if (tr.visible) continue;
    let wl = tr.wl;
    let px, col;
    if (wl >= 200 && wl < 380) {
      px  = map(wl, 200, 380, uvX1 + 2, uvX2 - 2);
      col = [155, 65, 215];
    } else if (wl > 780 && wl <= 3000) {
      px  = map(wl, 780, 3000, irX1 + 2, irX2 - 2);
      col = [floor(map(wl, 780, 3000, 215, 75)), 42, 18];
    } else continue;
    stroke(col[0], col[1], col[2], 38);
    strokeWeight(0.8);
    line(px, y + 2, px, y + h - 2);
  }

  // Líneas de emisión animadas
  noStroke();
  for (let wlStr in extSpectrumLines) {
    let wl        = parseInt(wlStr);
    let intensity = extSpectrumLines[wlStr];
    if (intensity < 0.02) continue;
    let px, col;
    if (wl >= 200 && wl < 380) {
      px  = map(wl, 200, 380, uvX1 + 2, uvX2 - 2);
      col = [190, 85, 255];
    } else if (wl > 780 && wl <= 3000) {
      px  = map(wl, 780, 3000, irX1 + 2, irX2 - 2);
      col = [floor(map(wl, 780, 3000, 235, 85)), 50, 18];
    } else continue;

    // Halo
    fill(col[0], col[1], col[2], intensity * 52);
    rect(px - 2.5, y + 2, 5, h - 4);
    // Línea central
    fill(col[0], col[1], col[2], intensity * 235);
    rect(px - 0.7, y + 2, 1.4, h - 4);
    // Etiqueta debajo de la barra si la emisión es fuerte
    if (intensity > 0.28) {
      fill(col[0] + 20, col[1] + 60, col[2] + 40, intensity * 255);
      textSize(11);
      textAlign(CENTER, TOP);
      noStroke();
      text(wl + ' nm', px, y + h + 2);
    }
  }
}

// ─── CONTROLES HTML ──────────────────────────────────────────────
function setupControls() {
  domAtomSelect        = select('#atom-select');
  domBtnBlanca         = select('#btn-blanca');
  domBtnMono           = select('#btn-mono');
  domSliderWl          = select('#slider-wl');
  domValWl             = select('#val-wl');
  domSliderRate        = select('#slider-rate');
  domValRate           = select('#val-rate');
  domSliderEEnergy     = select('#slider-eenergy');
  domValEEnergy        = select('#val-eenergy');
  domSliderERate       = select('#slider-erate');
  domValERate          = select('#val-erate');
  domSliderVoltage     = select('#slider-voltage');
  domValVoltage        = select('#val-voltage');
  domSliderDensity     = select('#slider-density');
  domValDensity        = select('#val-density');
  domBtnPause          = select('#btn-pause');
  domBtnReset          = select('#btn-reset');
  domMetricLevel       = select('#metric-level');
  domMetricEnergy      = select('#metric-energy');
  domMetricAbs         = select('#metric-abs');
  domMetricEmi         = select('#metric-emi');
  domMetricState       = select('#metric-state');
  domTransitionsList   = select('#transitions-list');
  domEnergyAccessPanel = select('#energy-access-panel');
  domModeFotones       = select('#mode-fotones');
  domModeColision      = select('#mode-colision');
  domModeGas           = select('#mode-gas');
  domModeReto          = select('#mode-reto');
  domCtrlReto          = select('#controls-reto');
  domCtrlFotones       = select('#controls-fotones');
  domCtrlColision      = select('#controls-colision');
  domCtrlGas           = select('#controls-gas');
  domMonoWrapper       = select('#wrapper-mono');
  domBtnRafaga         = select('#btn-rafaga');
  domBtnSingle         = select('#btn-single');
  domWrapperERate      = select('#wrapper-erate');
  domBtnFotoRafaga     = select('#btn-foto-rafaga');
  domBtnFotoSingle     = select('#btn-foto-single');
  domWrapperFRate      = select('#wrapper-frate');

  // Selector de átomo
  domAtomSelect.changed(() => {
    currentAtomKey = domAtomSelect.value();
    atomData = ATOMS_DATA[currentAtomKey];
    resetSim();
    updateAtomDisplay();
  });

  // Modos
  domModeFotones.mouseClicked(() => switchMode('fotones'));
  domModeColision.mouseClicked(() => switchMode('colision'));
  domModeGas.mouseClicked(() => switchMode('gas'));
  domModeReto.mouseClicked(() => switchMode('reto'));
  document.querySelectorAll('[data-gas]').forEach(b => b.addEventListener('click', () => responderReto(b.dataset.gas)));
  document.getElementById('btn-otro-gas').addEventListener('click', () => nuevaRonda());
  let chkIR = document.getElementById('chk-ir');
  if (chkIR) chkIR.addEventListener('change', () => { mostrarIR = chkIR.checked; });

  // Fuente de luz
  domBtnBlanca.mouseClicked(() => {
    lightType = 'white';
    domBtnBlanca.addClass('active');
    domBtnMono.removeClass('active');
    domMonoWrapper.style('display', 'none');
  });
  domBtnMono.mouseClicked(() => {
    lightType = 'mono';
    domBtnMono.addClass('active');
    domBtnBlanca.removeClass('active');
    domMonoWrapper.style('display', 'flex');
    updateMonoBar();
  });

  // Slider λ monocromático
  domSliderWl.input(() => {
    monoWl = int(domSliderWl.value());
    domValWl.html(monoWl + ' nm');
    updateMonoBar();
    updateSliderFill(domSliderWl);
  });

  // Sliders de modo fotones
  domSliderRate.input(() => {
    photonRate = int(domSliderRate.value());
    let labels = ['Lento', 'Pausado', 'Medio', 'Rápido', 'Máximo'];
    domValRate.html(i18n.t(labels[photonRate - 1]));
    updateSliderFill(domSliderRate);
  });

  // Sliders de modo colisión
  domSliderEEnergy.input(() => {
    electronEnergy = parseFloat(domSliderEEnergy.value());
    domValEEnergy.html(fmt(electronEnergy, 1) + ' eV');
    updateSliderFill(domSliderEEnergy);
    updateEnergyAccessPanel();
  });
  domSliderERate.input(() => {
    electronRate = int(domSliderERate.value());
    let labels = ['Lenta', 'Pausada', 'Media', 'Rápida', 'Máxima'];
    domValERate.html(i18n.t(labels[electronRate - 1]));
    updateSliderFill(domSliderERate);
  });

  // Sliders de modo gas
  domSliderVoltage.input(() => {
    gasVoltage = parseFloat(domSliderVoltage.value());
    domValVoltage.html(fmt(gasVoltage, 1) + ' eV');
    updateSliderFill(domSliderVoltage);
    // Actualizar energía de electrones del gas
    for (let e of gasElectrons) {
      e.energy = gasVoltage;
    }
  });
  domSliderDensity.input(() => {
    gasDensity = int(domSliderDensity.value());
    // round: el valor inicial (10) cae en «Media», como dice la etiqueta al cargar
    let labels = ['Muy diluida', 'Diluida', 'Media', 'Densa', 'Muy densa'];
    let idx = round(map(gasDensity, 4, 20, 0, 4));
    domValDensity.html(i18n.t(labels[min(idx, 4)]));
    updateSliderFill(domSliderDensity);
    initGasMode();
  });

  // Pausa / reset
  domBtnPause.mouseClicked(() => {
    isPaused = !isPaused;
    if (isPaused) {
      domBtnPause.html(i18n.t('▶ Continuar'));
      domBtnPause.addClass('paused');
    } else {
      domBtnPause.html(i18n.t('⏸ Pausar'));
      domBtnPause.removeClass('paused');
    }
  });
  domBtnReset.mouseClicked(() => {
    resetSim();
    if (currentMode === 'gas') initGasMode();
  });

  // Disparo único / Ráfaga (modo colisión) — en disparo único se dispara
  // haciendo clic en la fuente del lienzo (ver mousePressed / drawSourceFireHint)
  if (domBtnRafaga) domBtnRafaga.mouseClicked(() => {
    collSingleShot = false;
    domBtnRafaga.addClass('active');
    domBtnSingle.removeClass('active');
    if (domWrapperERate) domWrapperERate.style('display', 'flex');
    resetSim();
  });
  if (domBtnSingle) domBtnSingle.mouseClicked(() => {
    collSingleShot = true;
    domBtnSingle.addClass('active');
    domBtnRafaga.removeClass('active');
    if (domWrapperERate) domWrapperERate.style('display', 'none');
    resetSim();
  });

  // Disparo único / Ráfaga (modo fotones)
  if (domBtnFotoRafaga) domBtnFotoRafaga.mouseClicked(() => {
    fotoSingleShot = false;
    domBtnFotoRafaga.addClass('active');
    domBtnFotoSingle.removeClass('active');
    if (domWrapperFRate) domWrapperFRate.style('display', 'flex');
    resetSim();
  });
  if (domBtnFotoSingle) domBtnFotoSingle.mouseClicked(() => {
    fotoSingleShot = true;
    domBtnFotoSingle.addClass('active');
    domBtnFotoRafaga.removeClass('active');
    if (domWrapperFRate) domWrapperFRate.style('display', 'none');
    resetSim();
  });

  // Tema
  setupTheme();

  // Inicializar fills de sliders
  updateSliderFill(domSliderWl);
  updateSliderFill(domSliderRate);
  updateSliderFill(domSliderEEnergy);
  updateSliderFill(domSliderERate);
  updateSliderFill(domSliderVoltage);
  updateSliderFill(domSliderDensity);
  updateMonoBar();
}

// ─── RETO «GAS MISTERIOSO» ───────────────────────────────────────
const GASES = ['hidrogeno', 'helio', 'sodio', 'neon'];
let retoGas = null, retoResuelto = false, retoFallos = new Set();
let retoAciertos = 0, retoRondas = 0;
let retoHover = -1;

function nuevaRonda() {
  let opciones = GASES.filter(g => g !== retoGas);
  retoGas = random(opciones);
  retoResuelto = false;
  retoFallos = new Set();
  retoRondas++;
  atomData = ATOMS_DATA[retoGas];
  resetSim();
  actualizarBotonesReto();
}

function responderReto(key) {
  if (retoResuelto || retoFallos.has(key)) return;
  let nombre = i18n.t(ATOMS_DATA[key].name).replace(/\s*\(.*\)\s*$/, '');
  if (key === retoGas) {
    retoResuelto = true;
    if (retoFallos.size === 0) retoAciertos++;
    contar(i18n.t('¡Correcto!'), i18n.t('Es {gas}: sus rayas coinciden una a una con las del tubo', { gas: nombre.toLocaleLowerCase() }), CT.electron, 100000);
    let i = GASES.indexOf(key), y = REF_Y + i * (REF_H + 8) + REF_H / 2;
    for (let t of ATOMS_DATA[key].transitions.filter(t => t.visible))
      destellos.push({ x: xVisible(t.wl), y, col: wlToRGB(t.wl), t0: millis() + random(0, 250), grande: true });
    lanzarChispas(38, BUB_Y + BUB_H / 2, CT.electron, 24);
  } else {
    retoFallos.add(key);
    contar(i18n.t('Todavía no'), i18n.t('El {gas} tiene rayas que no salen en el tubo. Compara otra vez', { gas: nombre.toLocaleLowerCase() }), [255, 150, 90], 300);
  }
  actualizarBotonesReto();
}

function actualizarBotonesReto() {
  document.querySelectorAll('[data-gas]').forEach(b => {
    let k = b.dataset.gas;
    b.classList.toggle('fallo', retoFallos.has(k));
    b.classList.toggle('active', retoResuelto && k === retoGas);
    b.disabled = retoResuelto || retoFallos.has(k);
  });
  let m = document.getElementById('reto-marcador');
  if (m) m.textContent = i18n.t('Aciertos a la primera: {a} de {r}', { a: retoAciertos, r: retoRondas - (retoResuelto ? 0 : 1) });
  let otro = document.getElementById('btn-otro-gas');
  if (otro) otro.classList.toggle('btn-primary', retoResuelto), otro.classList.toggle('btn-secondary', !retoResuelto);
}

// Fila de referencia i: tarjeta con el nombre del gas y sus rayas visibles
function filaReto(i) {
  return { x: TUBE_X, y: REF_Y + i * (REF_H + 8), w: SPEC_X2 - TUBE_X, h: REF_H };
}

function drawRetoMode(animate) {
  if (animate) updateGasMode();
  drawTubo();
  for (let ph of outPhotons) if (!ph.dest) ph.draw();

  // Interrogación sobre el tubo
  let t = tubo();
  if (!retoResuelto) {
    textStyle(BOLD); textSize(VERTICAL ? 40 : 48); textAlign(CENTER, CENTER);
    stroke(...CT.ink); strokeWeight(6); fill(255, 255, 255, 230);
    text('?', (t.x1 + t.x2) / 2, (t.y1 + t.y2) / 2);
    noStroke(); textStyle(NORMAL);
  }

  // Rótulo a la izquierda del espectro misterioso
  textStyle(BOLD); textSize(15); fill(...CT.title); textAlign(LEFT, CENTER);
  text(i18n.t('Gas del tubo'), TUBE_X + 4, SPEC_Y + SPEC_H / 2);
  textStyle(NORMAL);

  // Espectros de referencia
  let mx = mouseX, my = mouseY;
  retoHover = -1;
  for (let i = 0; i < GASES.length; i++) {
    let key = GASES[i], f = filaReto(i);
    let dentro = mx > f.x && mx < f.x + f.w && my > f.y && my < f.y + f.h;
    let fallo = retoFallos.has(key), bien = retoResuelto && key === retoGas;
    if (dentro && !fallo && !retoResuelto) retoHover = i;
    let a = fallo || (retoResuelto && !bien) ? 0.45 : 1;
    noStroke(); fill(...CT.ink, 255 * a); rect(f.x, f.y + 4, f.w, f.h, 14);
    stroke(...(bien ? CT.electron : (retoHover === i ? CT.accent : CT.border)), 255 * a);
    strokeWeight(bien || retoHover === i ? 3 : 2);
    fill(...CT.panel, 255 * a);
    rect(f.x, f.y, f.w, f.h, 14);
    // Nombre
    noStroke(); fill(...CT.title, 255 * a); textAlign(LEFT, CENTER);
    textStyle(BOLD); textSize(VERTICAL ? 14 : 16);
    let nombre = i18n.t(ATOMS_DATA[key].name).replace(/\s*\(.*\)\s*$/, '');
    text(nombre, f.x + 14, f.y + f.h / 2 - 1);
    textStyle(NORMAL);
    if (fallo) { fill(255, 120, 90); textSize(18); text('✗', SPEC_X1 - 26, f.y + f.h / 2); }
    if (bien)  { fill(...CT.electron); textSize(18); text('✓', SPEC_X1 - 26, f.y + f.h / 2); }
    // Franja con sus rayas
    let sy = f.y + 7, sh = f.h - 14;
    fill(...CT.specBg, 255 * a); rect(SPEC_X1, sy, SPEC_X2 - SPEC_X1 - 8, sh, 8);
    for (let tr of ATOMS_DATA[key].transitions) {
      if (!tr.visible) continue;
      let px = xVisible(tr.wl), [r, g, b] = wlToRGB(tr.wl);
      fill(r, g, b, 70 * a); rect(px - 3, sy + 2, 6, sh - 4);
      fill(r, g, b, 255 * a); rect(px - 1.3, sy + 2, 2.6, sh - 4);
    }
  }
  if (retoHover >= 0) cursor(HAND); else cursor(ARROW);

  // Marcador
  let txt = i18n.t('Aciertos a la primera: {a} de {r}', { a: retoAciertos, r: retoRondas - (retoResuelto ? 0 : 1) });
  let fy = REF_Y + 4 * (REF_H + 8) + 14;
  textSize(15); textAlign(LEFT, CENTER); fill(...CT.muted);
  text(txt, TUBE_X + 4, fy + 14);
  // Botón «Otro gas» en el lienzo cuando se ha resuelto
  if (retoResuelto) {
    let b = botonOtroGas();
    noStroke(); fill(...CT.ink); rect(b.x, b.y + 4, b.w, b.h, b.h / 2);
    fill(...CT.accent); rect(b.x, b.y, b.w, b.h, b.h / 2);
    fill(...CT.ink); textStyle(BOLD); textSize(16); textAlign(CENTER, CENTER);
    text(i18n.t('Otro gas') + '  →', b.x + b.w / 2, b.y + b.h / 2 - 1);
    textStyle(NORMAL);
  }
}

function botonOtroGas() {
  let fy = REF_Y + 4 * (REF_H + 8) + 6;
  return { x: SPEC_X2 - 170, y: fy, w: 170, h: 40 };
}

function switchMode(mode) {
  let antes = currentMode;
  currentMode = mode;
  if (antes === 'reto' && mode !== 'reto') { atomData = ATOMS_DATA[currentAtomKey]; cursor(ARROW); }
  rehacerGeometria();
  resetSim();
  if (mode === 'reto') nuevaRonda();
  let secAtomo = document.getElementById('seccion-atomo');
  if (secAtomo) secAtomo.style.display = mode === 'reto' ? 'none' : '';
  document.querySelectorAll('.mode-btn').forEach(b => b.setAttribute('aria-selected', b.classList.contains('active')));

  [domModeFotones, domModeColision, domModeGas, domModeReto].forEach(b => b.removeClass('active'));
  [domCtrlFotones, domCtrlColision, domCtrlGas, domCtrlReto].forEach(s => s.style('display', 'none'));

  if (mode === 'fotones')  { domModeFotones.addClass('active');  domCtrlFotones.style('display', 'flex'); }
  if (mode === 'colision') { domModeColision.addClass('active'); domCtrlColision.style('display', 'flex'); }
  if (mode === 'gas')      { domModeGas.addClass('active');      domCtrlGas.style('display', 'flex'); initGasMode(); }
  if (mode === 'reto')     { domModeReto.addClass('active');     domCtrlReto.style('display', 'flex'); }
  document.querySelectorAll('.mode-btn').forEach(b => b.setAttribute('aria-selected', b.classList.contains('active')));
}

function updateAtomDisplay() {
  // Lista de transiciones
  updateTransitionsList();
  updateEnergyAccessPanel();
}

function updateTransitionsList() {
  if (!domTransitionsList) return;
  let html = '';
  for (let tr of atomData.transitions) {
    let [r, g, b] = wlToRGB(tr.wl);
    let bgColor = tr.visible
      ? `rgb(${r},${g},${b})`
      : '#444';
    let typeLabel = tr.visible ? 'visible' : (tr.wl < 380 ? 'UV' : 'IR');
    let wlLabel   = tr.visible ? tr.wl + ' nm' : (tr.wl < 380 ? tr.wl + ' nm (UV)' : tr.wl + ' nm (IR)');
    html += `<div class="transition-row">
      <div class="tr-swatch" style="background:${bgColor}"></div>
      <div class="tr-info">
        <span class="tr-wl">${wlLabel}</span>
        &nbsp;·&nbsp;
        <span class="tr-type">${typeLabel}</span>
        &nbsp;·&nbsp;
        <span class="tr-levels">${atomData.levelLabels[tr.from]}→${atomData.levelLabels[tr.to]}</span>
      </div>
    </div>`;
  }
  domTransitionsList.html(html);
}

function updateEnergyAccessPanel() {
  if (!domEnergyAccessPanel) return;
  let html = '<div class="energy-access-title" style="font-size:8px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">' + i18n.t('Con {e} eV puedes alcanzar:', { e: fmt(electronEnergy, 1) }) + '</div>';
  for (let lv = 1; lv < atomData.levels; lv++) {
    let needed = atomData.energies[lv] - atomData.energies[0];
    let canReach = electronEnergy >= needed;
    let [r, g, b] = wlToRGB(atomData.transitions.find(t => t.from === 0 && t.to === lv)?.wl || 0);
    let dotColor = canReach ? `rgb(60,220,80)` : `rgb(180,80,60)`;
    let check = canReach ? '<span class="energy-check yes">✓</span>' : '<span class="energy-check no">✗</span>';
    html += `<div class="energy-row">
      <div class="energy-dot" style="background:${dotColor}"></div>
      <span class="energy-label">${atomData.levelLabels[lv]} (${fmt(needed, 2)} eV)</span>
      ${check}
    </div>`;
  }
  domEnergyAccessPanel.html(html);
}

function updateUI() {
  if (!domMetricLevel) return;
  domMetricLevel.html(atomData.levelLabels[electronLevel]);
  domMetricEnergy.html(fmt(atomData.energies[electronLevel], 2));
  domMetricAbs.html(absCount);
  domMetricEmi.html(emiCount);
  let stateText = electronLevel === 0 ? i18n.t(atomData.baseLabel || 'Estado fundamental') :
    i18n.t('Excitado — {nivel} ({e} eV)', { nivel: atomData.levelLabels[electronLevel], e: fmt(atomData.energies[electronLevel], 2) });
  domMetricState.html(stateText);

  // Estado del gas
  if (currentMode === 'gas') {
    let excited = gasAtomsList.filter(a => a.level > 0).length;
    domMetricLevel.html(excited + '/' + gasAtomsList.length);
    domMetricEnergy.html(fmt(gasVoltage, 1));
    domMetricState.html(excited > 0 ? i18n.t('{x} átomos excitados', { x: excited }) : i18n.t('Todos en reposo'));
  }
}

function updateMonoBar() {
  // Colorea el propio slider con el color de la longitud de onda seleccionada
  if (!domSliderWl || !domSliderWl.elt) return;
  let [r, g, b] = wlToRGB(monoWl);
  let col    = `rgb(${r},${g},${b})`;
  let colDim = `rgba(${r},${g},${b},0.22)`;
  let el = domSliderWl.elt;
  let slMin = parseFloat(el.min), slMax = parseFloat(el.max), slVal = parseFloat(el.value);
  let pct = ((slVal - slMin) / (slMax - slMin) * 100).toFixed(1) + '%';
  el.style.background = `linear-gradient(to right, ${col} 0%, ${col} ${pct}, ${colDim} ${pct})`;
}

function updateSliderFill(slider) {
  if (!slider || !slider.elt) return;
  let el     = slider.elt;
  let slMin  = parseFloat(el.min);
  let slMax  = parseFloat(el.max);
  let slVal  = parseFloat(el.value);
  let pct    = ((slVal - slMin) / (slMax - slMin) * 100).toFixed(1) + '%';
  el.style.setProperty('--fill', pct);
}

// ─── TEMA ────────────────────────────────────────────────────────
function setupTheme() {
  let themeBtn   = document.getElementById('theme-btn');
  let themePanel = document.getElementById('theme-panel');
  let themeOpts  = document.querySelectorAll('.theme-opt');

  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    let open = themePanel.classList.toggle('open');
    themeBtn.classList.toggle('active', open);
    themeBtn.setAttribute('aria-expanded', open);
    themePanel.setAttribute('aria-hidden', !open);
  });

  themeOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      let theme = opt.dataset.theme;
      document.body.className = 'theme-' + theme;
      CT = CANVAS_THEMES[theme] || CANVAS_THEMES.dark;
      themeOpts.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      themePanel.classList.remove('open');
      themeBtn.classList.remove('active');
      themeBtn.setAttribute('aria-expanded', 'false');
      themePanel.setAttribute('aria-hidden', 'true');
    });
  });

  document.addEventListener('click', () => {
    if (themePanel.classList.contains('open')) {
      themePanel.classList.remove('open');
      themeBtn.classList.remove('active');
      themeBtn.setAttribute('aria-expanded', 'false');
      themePanel.setAttribute('aria-hidden', 'true');
    }
  });
}
