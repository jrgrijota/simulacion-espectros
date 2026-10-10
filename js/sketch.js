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
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 6) this.trail.shift();
    this.x += this.vx;
    this.y += this.vy;
    if (this.fading) {
      this.alpha -= 18;
      if (this.alpha <= 0) this.done = true;
    }
    // Eliminar si sale del canvas
    if (this.x < -30 || this.x > CV_W + 30 || this.y < -30 || this.y > CV_H + 30)
      this.done = true;
  }
  draw() {
    if (this.done) return;
    for (let i = 0; i < this.trail.length; i++) {
      let a = (i / this.trail.length) * this.alpha * 0.35;
      noStroke();
      fill(this.r, this.g, this.b, a);
      circle(this.trail[i].x, this.trail[i].y, this.size * 0.6);
    }
    noStroke();
    fill(this.r, this.g, this.b, this.alpha * 0.22);
    circle(this.x, this.y, this.size * 2.8);
    fill(this.r, this.g, this.b, this.alpha);
    circle(this.x, this.y, this.size);
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
    if (this.x > CV_W + 20) this.done = true;
  }
  draw() {
    if (this.done) return;
    for (let i = 0; i < this.trail.length; i++) {
      let a = (i / this.trail.length) * 160;
      noStroke();
      fill(0, 200, 255, a);
      circle(this.trail[i].x, this.trail[i].y, 3);
    }
    fill(0, 220, 255, 220);
    noStroke();
    circle(this.x, this.y, 7);
    fill(180, 240, 255, 180);
    circle(this.x, this.y, 3);
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
          emiCount++;
          gasPhotonTotal++;
          let k = Math.round(tr.wl);
          gasPhotonCounts[k] = (gasPhotonCounts[k] || 0) + 1;
          if (tr.visible) updateSpectrum(tr.wl);
          else updateExtSpectrum(tr.wl);
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
    let nc = this.data.nucleusColor;
    let glow = this.level > 0;
    push();
    if (this.glowTimer > 0) {
      let a = map(this.glowTimer, 0, 20, 0, 120);
      noStroke();
      fill(nc[0], nc[1], nc[2], a);
      circle(this.x, this.y, 32);
    }
    noStroke();
    if (glow) {
      fill(nc[0], nc[1], nc[2], 200);
      circle(this.x, this.y, 22);
      fill(255, 255, 255, 180);
    } else {
      fill(nc[0] * 0.5, nc[1] * 0.5, nc[2] * 0.5, 180);
      circle(this.x, this.y, 18);
      fill(nc[0], nc[1], nc[2], 160);
    }
    circle(this.x, this.y, glow ? 10 : 8);
    fill(255, 255, 255, glow ? 240 : 140);
    textAlign(CENTER, CENTER);
    textSize(10);
    noStroke();
    text(this.data.symbol, this.x, this.y);
    if (glow) {
      fill(255, 255, 150, 210);
      textSize(9);
      text(this.data.levelLabels[this.level], this.x, this.y + 16);
    }
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
    if (this.x > TUBE_X + TUBE_W - 5) { this.done = true; return; }  // absorbido en el ánodo
    if (this.y < TUBE_Y + 5 || this.y > TUBE_Y + TUBE_H - 5) { this.vy *= -1; }
  }
  draw() {
    for (let i = 0; i < this.trail.length; i++) {
      let a = (i / this.trail.length) * 120;
      noStroke(); fill(0, 200, 255, a);
      circle(this.trail[i].x, this.trail[i].y, 3);
    }
    fill(0, 220, 255, 200);
    noStroke();
    circle(this.x, this.y, 5);
  }
}

// ─── ESTADO GLOBAL ───────────────────────────────────────────────
const CV_W = 900, CV_H = 660;
const ATOM_CX = 360, ATOM_CY = 270;
const SPEC_Y  = 490, SPEC_X1 = 30, SPEC_X2 = 870, SPEC_H = 76;
const EXT_SPEC_Y = 572, EXT_SPEC_H = 32;
const DIAG_X  = 626, DIAG_Y  = 30,  DIAG_W = 240, DIAG_H = 400;
const TUBE_X  = 30,  TUBE_Y  = 28,  TUBE_W = 840, TUBE_H = 430;

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
let domModeFotones, domModeColision, domModeGas;
let domCtrlFotones, domCtrlColision, domCtrlGas;
let domMonoWrapper;

// Animación de radio del electrón (transición suave entre órbitas)
let electronRCurrent = 68;

// Etiqueta de estado en canvas (modo fotones/colisión)
let stateLbl    = '';
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
  let maxE = atomData.energies[atomData.levels - 1];
  return map(atomData.energies[electronLevel], -0.1, maxE + 0.3,
             DIAG_Y + DIAG_H - 22, DIAG_Y + 32);
}

// ─── PALETAS DE TEMA PARA EL CANVAS ─────────────────────────────
const CANVAS_THEMES = {
  dark: {
    bg:         [12,  14,  18 ],
    panelBg:    [16,  22,  32 ],
    panelBord:  [50,  70,  90 ],
    txtBright:  [140, 170, 200],
    txtMid:     [100, 130, 160],
    orbitLbl:   [160, 180, 200],
    specBg:     [8,   10,  14 ],
    specBord:   [50,  65,  85 ],
    specTitle:  [120, 150, 190],
    specTick:   [100, 120, 150],
    srcBody:    [30,  40,  55 ],
    srcStroke:  [60,  80,  100],
    srcArrow:   [150, 170, 190],
    tubeBord:   [60,  100, 140],
    electrode:  [80,  100, 130],
    tubeText:   [150, 180, 220],
    gasCnt:     [90,  140, 180],
    sttBoxBg:   [5,   10,  20 ],
    sttBoxTxt:  [180, 200, 220],
    pauseOvl:   [0,   0,   0  ],
    pauseTxt:   [180, 200, 220],
    transNote:  [90,  90,  90 ],
    exciteTxt:  [255, 200, 80 ],
    diagEval:   [100, 140, 180],
  },
  light: {
    bg:         [205, 218, 234],
    panelBg:    [222, 232, 248],
    panelBord:  [140, 160, 190],
    txtBright:  [30,  55,  110],
    txtMid:     [60,  85,  140],
    orbitLbl:   [30,  55,  110],
    specBg:     [190, 205, 226],
    specBord:   [130, 150, 180],
    specTitle:  [30,  55,  110],
    specTick:   [80,  100, 140],
    srcBody:    [175, 192, 218],
    srcStroke:  [110, 135, 175],
    srcArrow:   [80,  105, 160],
    tubeBord:   [60,  100, 160],
    electrode:  [90,  110, 152],
    tubeText:   [30,  60,  120],
    gasCnt:     [30,  70,  140],
    sttBoxBg:   [215, 228, 248],
    sttBoxTxt:  [10,  30,  90 ],
    pauseOvl:   [180, 200, 228],
    pauseTxt:   [10,  30,  90 ],
    transNote:  [80,  105, 160],
    exciteTxt:  [180, 100, 0  ],
    diagEval:   [70,  100, 160],
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
  }
};
let CT = CANVAS_THEMES.dark;

// Contadores del modo gas
let gasPhotonCounts = {};
let gasPhotonTotal  = 0;

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

function emitPhotonFromAtom(wl) {
  let angle = random(TWO_PI);
  let speed = random(3, 5);
  let p = new Photon(ATOM_CX, ATOM_CY, wl, cos(angle) * speed, sin(angle) * speed);
  outPhotons.push(p);
  if (wl >= 380 && wl <= 780) updateSpectrum(wl);
  else updateExtSpectrum(wl);
  emiCount++;
}

function emitPhotonFromGas(x, y, wl) {
  let angle = random(TWO_PI);
  let speed = random(2.5, 4.5);
  outPhotons.push(new Photon(x, y, wl, cos(angle) * speed, sin(angle) * speed));
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
  electronRCurrent = atomData ? atomData.radii[0] : 68;
  stateLbl         = '';
  stateLblT        = 0;
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
  let n = gasDensity;
  for (let i = 0; i < n; i++) {
    let x = random(TUBE_X + 25, TUBE_X + TUBE_W - 25);
    let y = random(TUBE_Y + 25, TUBE_Y + TUBE_H - 25);
    gasAtomsList.push(new GasAtomEntity(x, y, atomData));
  }
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
function setup() {
  let canvas = createCanvas(CV_W, CV_H);
  canvas.parent('canvas-container');
  // El lienzo se escala para llenar su hueco sin deformarse: en un monitor o
  // un proyector grande el diagrama y los espectros se ven más grandes.
  const holder = document.getElementById('canvas-container');
  const fitCanvas = () => {
    const cs = getComputedStyle(holder);
    const w = holder.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = holder.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const k = Math.max(0.1, Math.min(w / CV_W, h / CV_H));
    canvas.elt.style.width = (CV_W * k) + 'px';
    canvas.elt.style.height = (CV_H * k) + 'px';
  };
  fitCanvas();
  if (window.ResizeObserver) new ResizeObserver(fitCanvas).observe(holder);
  frameRate(60);
  textFont('monospace');
  atomData = ATOMS_DATA[currentAtomKey];
  electronRCurrent = atomData.radii[0];
  buildStaticBuffers();
  setupControls();
  updateAtomDisplay();
  initGasMode();
}

// ─── P5.JS DRAW ─────────────────────────────────────────────────
function draw() {
  background(...CT.bg);

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
    drawExtendedSpectrum();
    drawPausedOverlay();
    return;
  }

  drawCurrentMode(true);
  drawSpectrum();
  drawExtendedSpectrum();

  if (frameCount % 8 === 0) updateUI();
}

function drawCurrentMode(animate) {
  switch (currentMode) {
    case 'fotones':  drawPhotonMode(animate);    break;
    case 'colision': drawCollisionMode(animate); break;
    case 'gas':      drawGasMode(animate);       break;
  }
}

function drawPausedOverlay() {
  fill(...CT.pauseOvl, 100);
  noStroke();
  rect(0, 0, CV_W, CV_H);
  fill(...CT.pauseTxt, 200);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(i18n.t('PAUSA'), CV_W / 2, CV_H / 2 - SPEC_H / 2);
}

// ─── MODO FOTONES ────────────────────────────────────────────────
function drawPhotonMode(animate) {
  if (animate) updatePhotonMode();
  drawLightSource();
  drawAtom(ATOM_CX, ATOM_CY);
  drawEnergyDiagram();

  for (let ph of inPhotons)  ph.draw();
  for (let ph of outPhotons) ph.draw();
  drawAtomStateLabel();

  // Etiqueta de la fuente
  fill(...CT.tubeText, 140);
  textAlign(CENTER, TOP);
  textSize(13);
  noStroke();
  text(lightType === 'white' ? i18n.t('Luz blanca') : monoWl + ' nm', 65, 20);

  if (fotoSingleShot) drawSourceFireHint('para disparar un fotón');
}

// Banner + resalte de la fuente para el modo "disparo único".
// La fuente está a la izquierda, centrada en ATOM_CY.
function drawSourceFireHint(what) {
  let sy = ATOM_CY;
  // Marco/resalte pulsante alrededor de la fuente
  let pulse = (sin(frameCount * 0.12) + 1) / 2;  // 0..1
  noFill();
  stroke(120, 220, 255, 70 + pulse * 150);
  strokeWeight(2 + pulse * 1.5);
  rect(10, sy - 56, 60, 112, 12);

  // Banner de texto en 2 líneas, debajo de la fuente
  let ln1 = i18n.t('⚡ Haz clic en la fuente');
  let ln2 = i18n.t(what);
  textSize(11);
  let pad = 7, lineH = 15;
  let tw = max(textWidth(ln1), textWidth(ln2)) + pad * 2;
  let bx = 10, by = sy + 68;
  noStroke();
  fill(0, 0, 0, 160);
  rect(bx, by, tw, lineH * 2 + pad * 2, 7);
  fill(150, 225, 255, 235);
  textAlign(LEFT, TOP);
  text(ln1, bx + pad, by + pad);
  text(ln2, bx + pad, by + pad + lineH);
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

function updatePhotonMode() {
  electronAngle += 0.018;
  electronRCurrent += (atomData.radii[electronLevel] - electronRCurrent) * 0.09;
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
    if (!ph.fading && electronLevel === 0 && atomCascade.length === 0 && d < atomData.radii[0] + 12) {
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
      return;
    }
  }
  // No absorbido: el fotón sigue de largo
}

function drawLightSource() {
  // Difusor de luz en la izquierda
  let sx = 64, sy = ATOM_CY;
  let colors = lightType === 'white'
    ? [656, 580, 540, 486, 450, 420, 390]
    : [monoWl];

  // Cuerpo de la fuente
  fill(...CT.srcBody);
  stroke(...CT.srcStroke);
  strokeWeight(1.5);
  rect(18, sy - 50, 42, 100, 8);

  // Líneas de color (patrón espectral)
  let stripH = 86 / colors.length;
  for (let i = 0; i < colors.length; i++) {
    let [r, g, b] = wlToRGB(colors[i]);
    noStroke();
    fill(r, g, b, 160);
    let stripY = sy - 43 + i * stripH;
    rect(22, stripY, 34, stripH - 1, 3);
  }

  // Flecha →
  stroke(...CT.srcArrow, 120);
  strokeWeight(1.5);
  line(62, sy, 88, sy);
  noStroke();
  fill(...CT.srcArrow, 120);
  triangle(88, sy - 4, 88, sy + 4, 94, sy);
}

// ─── MODO COLISIÓN ───────────────────────────────────────────────
function drawCollisionMode(animate) {
  if (animate) updateCollisionMode();
  drawElectronGun();
  drawAtom(ATOM_CX, ATOM_CY);
  drawEnergyDiagram();

  for (let ce of collElectrons) ce.draw();
  for (let ph of outPhotons)    ph.draw();
  drawAtomStateLabel();

  if (collSingleShot) drawSourceFireHint('para disparar un electrón');
}

function updateCollisionMode() {
  electronAngle += 0.018;
  electronRCurrent += (atomData.radii[electronLevel] - electronRCurrent) * 0.09;
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
    if (!e.collided && electronLevel === 0 && atomCascade.length === 0 && d < atomData.radii[0] + 10) {
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
  } else {
    electron.collided = true;
    stateLbl    = i18n.t('Colisión elástica — energía insuficiente');
    stateLblClr = [150, 150, 150];
    stateLblT   = 90;
  }
  electron.done = true;
}

function drawElectronGun() {
  let sx = 68, sy = ATOM_CY;
  fill(...CT.srcBody);
  stroke(...CT.srcStroke);
  strokeWeight(1.5);
  rect(14, sy - 40, 50, 80, 6);

  // Intensidad según energía
  let bright = map(electronEnergy, 0.5, 6.0, 60, 220);
  fill(0, bright, 255, 180);
  noStroke();
  rect(20, sy - 30, 38, 60, 4);
  fill(0, 220, 255, 200);
  circle(sx - 2, sy, 8);

  // Flecha
  stroke(0, 180, 255, 130);
  strokeWeight(1.5);
  line(65, sy, 88, sy);
  noStroke();
  fill(0, 180, 255, 130);
  triangle(88, sy - 4, 88, sy + 4, 95, sy);

  // Etiqueta energía
  fill(...CT.tubeText, 160);
  textAlign(CENTER, CENTER);
  textSize(13);
  noStroke();
  text(fmt(electronEnergy, 1) + ' eV', sx, sy - 50);
}


// ─── MODO GAS IONIZADO ──────────────────────────────────────────
function drawGasMode(animate) {
  if (animate) updateGasMode();

  // Tubo
  noFill();
  stroke(...CT.tubeBord, 200);
  strokeWeight(2);
  rect(TUBE_X, TUBE_Y, TUBE_W, TUBE_H, 8);

  // Fondo tenue del tubo (color del elemento)
  let nc = atomData.nucleusColor;
  fill(nc[0], nc[1], nc[2], 8);
  noStroke();
  rect(TUBE_X + 2, TUBE_Y + 2, TUBE_W - 4, TUBE_H - 4, 7);

  // Electrodos (altura completa del tubo)
  fill(...CT.electrode, 200);
  noStroke();
  rect(TUBE_X + 3, TUBE_Y + 4, 12, TUBE_H - 8, 2);
  rect(TUBE_X + TUBE_W - 15, TUBE_Y + 4, 12, TUBE_H - 8, 2);

  // Etiquetas cátodo / ánodo (encima del tubo)
  fill(...CT.tubeText, 200);
  textAlign(CENTER, BOTTOM);
  textSize(11);
  noStroke();
  text(i18n.t('Cátodo (−)'), TUBE_X + 9, TUBE_Y - 3);
  text(i18n.t('Ánodo (+)'), TUBE_X + TUBE_W - 9, TUBE_Y - 3);

  for (let ga of gasAtomsList) ga.draw();
  for (let ge of gasElectrons) ge.draw();
  for (let ph of outPhotons)   ph.draw();

  // Etiqueta
  fill(...CT.tubeText, 160);
  textAlign(CENTER, TOP);
  textSize(13);
  noStroke();
  text(i18n.t('Lámpara de {nombre}', { nombre: i18n.t(atomData.name) }) + '   —   ' + fmt(gasVoltage, 1) + ' eV', CV_W / 2, TUBE_Y + 5);

  drawGasCounters();
}

function updateGasMode() {
  electronAngle += 0.01;

  // Generar electrones del tubo
  gasElectronT++;
  let eInterval = floor(map(gasVoltage, 1, 8, 40, 10));
  if (gasElectronT >= eInterval) {
    gasElectronT = 0;
    let ey = random(TUBE_Y + 15, TUBE_Y + TUBE_H - 15);
    gasElectrons.push(new GasElectron(TUBE_X + 20, ey, gasVoltage));
  }

  // Actualizar electrones y comprobar colisiones
  for (let i = gasElectrons.length - 1; i >= 0; i--) {
    let e = gasElectrons[i];
    e.update();
    // Colisión con átomos
    for (let a of gasAtomsList) {
      if (a.level === 0 && a.cooldown <= 0 && dist(e.x, e.y, a.x, a.y) < 16) {
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
  if (outPhotons.length > 80) outPhotons.splice(0, outPhotons.length - 80);
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
function drawAtom(cx, cy) {
  let atom = atomData;
  let nc   = atom.nucleusColor;
  let maxR = atom.radii[atom.levels - 1];

  // Fondo tenue del área del átomo
  noStroke();
  fill(nc[0], nc[1], nc[2], 6);
  circle(cx, cy, maxR * 2 + 60);

  // ── Flechas de transición (entre las órbitas, lado derecho) ──
  drawTransitionArrows(cx, cy);

  // ── Órbitas ──
  for (let i = 0; i < atom.levels; i++) {
    let r = atom.radii[i];
    let alpha = (i === electronLevel) ? 160 : 70;
    stroke(atom.orbitStroke[0], atom.orbitStroke[1], atom.orbitStroke[2], alpha);
    strokeWeight(i === electronLevel ? 1.8 : 1.0);
    noFill();
    circle(cx, cy, r * 2);

    // Etiqueta del nivel + energía en la parte SUPERIOR de cada órbita, apiladas
    // verticalmente (las flechas de transición van por la zona inferior). Una
    // sola línea por nivel: "n=4  2.86 eV".
    let lx = cx;
    let ly = cy - r - 4;
    noStroke();
    textSize(11);
    let eStr   = fmt(atom.energies[i], 2) + ' eV';
    let wLabel = textWidth(atom.levelLabels[i] + '  ');
    let wEnergy = textWidth(eStr);
    let xLeft  = lx - (wLabel + wEnergy) / 2;
    textAlign(LEFT, BOTTOM);
    fill(...CT.orbitLbl, 160);
    text(atom.levelLabels[i], xLeft, ly);
    fill(...CT.txtMid, 120);
    text(eStr, xLeft + wLabel, ly);
  }

  // ── Núcleo ──
  noStroke();
  fill(nc[0] * 0.3, nc[1] * 0.3, nc[2] * 0.3, 160);
  circle(cx, cy, 28);
  fill(nc[0], nc[1], nc[2], 220);
  circle(cx, cy, 16);
  fill(255, 255, 255, 160);
  circle(cx, cy, 7);

  // ── Electrón ──
  let eRadius = electronRCurrent;
  let eX = cx + cos(electronAngle) * eRadius;
  let eY = cy + sin(electronAngle) * eRadius;

  // Flash de absorción
  if (flashTimer > 0) {
    let fa = map(flashTimer, 0, 25, 0, 180);
    noStroke();
    fill(nc[0], nc[1], nc[2], fa);
    circle(eX, eY, 30);
  }

  // Halo del electrón
  noStroke();
  fill(0, 255, 180, 100);
  circle(eX, eY, 18);
  fill(0, 255, 180, 220);
  circle(eX, eY, 9);
  fill(200, 255, 240, 200);
  circle(eX, eY, 4);

  // Indicador de excitación
  if (electronLevel > 0) {
    let txt = i18n.t('— excitado —');
    fill(...CT.exciteTxt, 160);
    textAlign(CENTER, BOTTOM);
    textSize(12);
    noStroke();
    text(txt, cx, cy - maxR - 12);
  }
}

function drawTransitionArrows(cx, cy) {
  let atom = atomData;
  let allTrs = atom.transitions;

  // Repartir ángulos en el cuadrante inferior-derecho (22.5° → 75°)
  let startAngle = PI / 8;
  let endAngle   = PI * 5 / 12;
  let n = allTrs.length;
  let angleStep  = n > 1 ? (endAngle - startAngle) / (n - 1) : 0;

  for (let i = 0; i < n; i++) {
    let tr  = allTrs[i];
    let r1  = atom.radii[tr.from];
    let r2  = atom.radii[tr.to];

    // Color según región espectral
    let col, baseAlpha, lblAlpha, strokeW;
    if (tr.visible) {
      col = wlToRGB(tr.wl);
      baseAlpha = 190; lblAlpha = 220; strokeW = 1.8;
    } else if (tr.wl < 380) {
      col = [170, 80, 230];   // UV: violeta
      baseAlpha = 110; lblAlpha = 150; strokeW = 1.2;
    } else {
      col = [190, 70, 40];    // IR: rojo oscuro
      baseAlpha = 110; lblAlpha = 150; strokeW = 1.2;
    }

    let ang = startAngle + i * angleStep;
    let ix1 = cx + r1 * cos(ang), iy1 = cy + r1 * sin(ang);
    let ix2 = cx + r2 * cos(ang), iy2 = cy + r2 * sin(ang);

    let isActiveTr = activeTrT > 0 && activeTr &&
      ((tr.from === activeTr.from && tr.to === activeTr.to) ||
       (tr.from === activeTr.to   && tr.to === activeTr.from));
    let trAlpha = isActiveTr ? min(255, map(activeTrT, 0, 120, 60, 255)) : baseAlpha;

    stroke(col[0], col[1], col[2], trAlpha);
    strokeWeight(isActiveTr ? 3.2 : strokeW);
    line(ix1, iy1, ix2, iy2);

    // Cabeza de flecha — punta exactamente sobre la órbita exterior
    let dx = ix2 - ix1, dy = iy2 - iy1;
    let len = sqrt(dx * dx + dy * dy);
    let ux = dx / len, uy = dy / len;
    let px = -uy, py = ux;
    noStroke();
    fill(col[0], col[1], col[2], isActiveTr ? 255 : (tr.visible ? 210 : 120));
    triangle(
      ix2, iy2,
      ix2 - ux * 9 + px * 4, iy2 - uy * 9 + py * 4,
      ix2 - ux * 9 - px * 4, iy2 - uy * 9 - py * 4
    );

    // Círculo en el nivel inferior
    fill(col[0], col[1], col[2], tr.visible ? 140 : 80);
    circle(ix1, iy1, 5);

    // Etiqueta justo más allá de la punta, en dirección radial
    let lx = ix2 + ux * 16;
    let ly = iy2 + uy * 16;
    fill(col[0], col[1], col[2], isActiveTr ? 255 : lblAlpha);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(tr.visible ? 11 : 10);
    text(tr.visible ? (tr.wl + ' nm') : tr.name, lx, ly);
  }
}

// ─── DIAGRAMA DE NIVELES DE ENERGÍA ─────────────────────────────
function drawEnergyDiagram() {
  let atom  = atomData;
  let x0    = DIAG_X;
  let y0    = DIAG_Y;
  let w     = DIAG_W;
  let h     = DIAG_H;
  let maxE  = atom.energies[atom.levels - 1];

  // Marco del diagrama
  fill(...CT.panelBg, 210);
  stroke(...CT.panelBord, 160);
  strokeWeight(1);
  rect(x0, y0, w, h, 8);

  // Título
  fill(...CT.txtBright, 180);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(12);
  text(i18n.t('Diagrama de niveles'), x0 + w / 2, y0 + 6);
  textSize(11);
  fill(...CT.txtMid, 130);
  text('(eV)', x0 + 18, y0 + 18);

  // Eje Y
  stroke(...CT.panelBord, 100);
  strokeWeight(0.8);
  line(x0 + 30, y0 + 30, x0 + 30, y0 + h - 20);

  // Mapear energía a posición Y
  let eToY = (e) => map(e, -0.1, maxE + 0.3, y0 + h - 22, y0 + 32);

  // Dibujar niveles
  for (let i = 0; i < atom.levels; i++) {
    let e = atom.energies[i];
    let ly = eToY(e);
    let isActive = (i === electronLevel);

    // Línea del nivel
    let lColor = isActive ? [0, 255, 180] : [120, 160, 200];
    let lAlpha = isActive ? 240 : 130;
    stroke(lColor[0], lColor[1], lColor[2], lAlpha);
    strokeWeight(isActive ? 2.5 : 1.2);
    line(x0 + 30, ly, x0 + w - 12, ly);

    // Etiqueta nivel
    fill(lColor[0], lColor[1], lColor[2], lAlpha);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(11);
    text(atom.levelLabels[i], x0 + 32, ly - 8);
    // En el hidrógeno el nivel de abajo es n = 2, no el fundamental (n = 1):
    // se dice en el propio diagrama para no confundirlos.
    if (i === 0 && atom.symbol === 'H') {
      fill(...CT.diagEval, 170);
      textSize(9.5);
      textAlign(LEFT, TOP);
      text(i18n.t('Nivel más bajo de este modelo. El fundamental (n=1) no se muestra.'), x0 + 32, ly + 8, w - 44);
    }

    // Valor de energía
    fill(...CT.diagEval, 140);
    textAlign(RIGHT, CENTER);
    textSize(11);
    text(fmt(e, 2), x0 + 28, ly);

  }

  // Electrón animado en el diagrama (posición interpolada)
  let targY   = diagTargetY();
  let distY   = abs(diagElectronRY - targY);
  let eX      = x0 + 40;   // sobre la línea del nivel, sin tapar la energía del eje

  noStroke();
  if (distY > 3) {
    // Ghost en el nivel destino mientras el electrón se mueve
    fill(0, 255, 180, map(distY, 3, 40, 0, 90));
    circle(eX, targY, 10);
    // Línea punteada entre posición actual y destino
    let steps = floor(distY / 5);
    for (let s = 0; s <= steps; s++) {
      if (s % 2 === 0) {
        let sy = lerp(diagElectronRY, targY, s / steps);
        fill(0, 255, 180, map(distY, 3, 40, 0, 55));
        circle(eX, sy, 2.5);
      }
    }
  }
  // Electrón principal
  fill(0, 255, 180, 220);
  circle(eX, diagElectronRY, 9);
  fill(200, 255, 240, 200);
  circle(eX, diagElectronRY, 4);

  // Dibujar flechas de transición en el diagrama
  let drawn = new Set();
  for (let tr of atom.transitions) {
    let key = tr.from + '-' + tr.to;
    if (drawn.has(key)) continue;
    drawn.add(key);

    let y1 = eToY(atom.energies[tr.from]);
    let y2 = eToY(atom.energies[tr.to]);
    let col = tr.visible ? wlToRGB(tr.wl) : [70, 70, 70];
    let alpha = tr.visible ? 180 : 60;

    // Línea de transición (en el centro del diagrama)
    let tx = min(x0 + w - 28, x0 + w * 0.50 + (tr.from + tr.to) * 4);
    let isDiagActive = activeTrT > 0 && activeTr &&
      ((tr.from === activeTr.from && tr.to === activeTr.to) ||
       (tr.from === activeTr.to   && tr.to === activeTr.from));
    let diagAlpha = isDiagActive ? min(255, map(activeTrT, 0, 120, 60, 255)) : alpha;
    let diagCol   = isDiagActive ? [255, 255, 200] : col;
    stroke(diagCol[0], diagCol[1], diagCol[2], diagAlpha);
    strokeWeight(isDiagActive ? 3.0 : (tr.visible ? 1.5 : 0.7));
    if (!tr.visible) drawingContext.setLineDash([3, 4]);
    line(tx, y1, tx, y2);
    drawingContext.setLineDash([]);

    // Flecha emisión (hacia abajo)
    noStroke();
    fill(col[0], col[1], col[2], alpha);
    triangle(tx, y1 + 5, tx - 2.5, y1 - 1, tx + 2.5, y1 - 1);

    // Etiqueta λ
    fill(col[0], col[1], col[2], tr.visible ? 180 : 60);
    textAlign(LEFT, CENTER);
    textSize(10);
    let ly = (y1 + y2) / 2;
    let lbl = tr.visible ? tr.wl + ' nm' : (tr.wl < 380 ? 'UV' : 'IR');
    text(lbl, tx + 4, ly);
  }
}

// ─── ETIQUETA DE ESTADO (FOTONES / COLISIÓN) ────────────────────
function drawAtomStateLabel() {
  if (stateLblT <= 0 || !stateLbl) return;
  let alpha = stateLblT > 80 ? 220 : map(stateLblT, 0, 80, 0, 220);
  let [r, g, b] = stateLblClr;
  let maxR = atomData.radii[atomData.levels - 1];
  let lx = ATOM_CX;
  let ly = ATOM_CY - maxR - 26;

  push();
  textSize(14);
  let tw = textWidth(stateLbl);
  noStroke();
  fill(...CT.sttBoxBg, alpha * 0.85);
  rect(lx - tw / 2 - 10, ly - 15, tw + 20, 22, 5);
  fill(r, g, b, alpha);
  textAlign(CENTER, CENTER);
  text(stateLbl, lx, ly - 4);
  pop();
}

// ─── CONTADORES MODO GAS ─────────────────────────────────────────
function drawGasCounters() {
  let freeE    = gasElectrons.length;
  let excitedN = gasAtomsList.filter(a => a.level > 0).length;

  fill(...CT.gasCnt, 160);
  noStroke();
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text(
    i18n.t('e⁻ libres: {e}   ·   átomos excitados: {x} / {n}   ·   fotones emitidos: {f}',
      { e: freeE, x: excitedN, n: gasAtomsList.length, f: gasPhotonTotal }),
    TUBE_X + 12, TUBE_Y + TUBE_H - 7
  );

  if (gasPhotonTotal === 0) return;
  let visTrs = atomData.transitions.filter(t => t.visible);
  for (let tr of visTrs) {
    let k   = Math.round(tr.wl);
    let cnt = gasPhotonCounts[k] || 0;
    if (cnt === 0) continue;
    let px = map(tr.wl - 380, 0, 400, SPEC_X1 + 2, SPEC_X2 - 2);
    let [r, g, b] = wlToRGB(tr.wl);
    fill(r, g, b, 200);
    noStroke();
    textAlign(CENTER, BOTTOM);
    textSize(11);
    text(cnt, px, SPEC_Y - 4);
  }
}

// ─── ESPECTRO ────────────────────────────────────────────────────
function drawSpectrum() {
  let x1 = SPEC_X1, x2 = SPEC_X2, y = SPEC_Y, h = SPEC_H;
  let w = x2 - x1;

  // Marco
  fill(...CT.specBg);
  stroke(...CT.specBord, 160);
  strokeWeight(1);
  rect(x1, y, w, h, 6);

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
      rect(px - 1.2, y + 2, 2.4, hAb);
    }
    stroke(...CT.specBord, 160);
    strokeWeight(1);
    line(x1, y + h / 2, x2, y + h / 2);
    noStroke();
  }

  // Líneas de emisión
  for (let i = 0; i <= 400; i++) {
    let intensity = spectrumIntensity[i];
    if (intensity < 0.01) continue;
    let wl = 380 + i;
    let [r, g, b] = wlToRGB(wl);
    let px = map(i, 0, 400, x1 + 2, x2 - 2);
    // Halo
    fill(r, g, b, intensity * 60);
    rect(px - 1.5, yEm, 3, hEm);
    // Línea central
    fill(r, g, b, intensity * 240);
    rect(px - 0.7, yEm, 1.4, hEm);
  }

  // Marcadores de longitud de onda
  let markers = [400, 450, 500, 550, 600, 650, 700, 750];
  for (let wlM of markers) {
    let px = map(wlM - 380, 0, 400, x1 + 2, x2 - 2);
    stroke(...CT.specTick, 80);
    strokeWeight(0.6);
    line(px, y + h - 12, px, y + h - 2);
    noStroke();
    fill(...CT.specTick, 120);
    textAlign(CENTER, BOTTOM);
    textSize(11);
    text(wlM, px, y + h - 1);
  }

  // Título
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  if (split) {
    // Rótulo de absorción sobre un fondo oscuro para que se lea sobre el arcoíris
    let lbl = i18n.t('Espectro de absorción');
    fill(...CT.specBg, 200);
    rect(x1 + 3, y + 3, textWidth(lbl) + 8, 16, 3);
    fill(...CT.specTitle, 220);
    text(lbl, x1 + 7, y + 5);
    fill(...CT.specTitle, 160);
    text(i18n.t('Espectro de emisión   (nm)'), x1 + 6, y + h / 2 + 3);
  } else {
    fill(...CT.specTitle, 160);
    text(i18n.t('Espectro de emisión   (nm)'), x1 + 6, y + 4);
  }
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
  stroke(55, 35, 80, 120);
  strokeWeight(1);
  rect(uvX1, y, uvW, h, 4, 0, 0, 4);
  stroke(70, 38, 22, 120);
  rect(irX1, y, irW, h, 0, 4, 4, 0);

  // Degradados pre-renderizados UV/IR
  if (extSpecBgGfx) image(extSpecBgGfx, x1, y);

  // Etiquetas de sección
  noStroke();
  fill(170, 100, 235, 115);
  textAlign(CENTER, CENTER);
  textSize(11);
  text('UV  (200–380 nm)', uvX1 + uvW / 2, y + h / 2);
  fill(215, 105, 55, 115);
  text('IR  (780–3000 nm)', irX1 + irW / 2, y + h / 2);

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
      fill(col[0], col[1], col[2], intensity * 195);
      textSize(10);
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
  domModeFotones.mousePressed(() => switchMode('fotones'));
  domModeColision.mousePressed(() => switchMode('colision'));
  domModeGas.mousePressed(() => switchMode('gas'));

  // Fuente de luz
  domBtnBlanca.mousePressed(() => {
    lightType = 'white';
    domBtnBlanca.addClass('active');
    domBtnMono.removeClass('active');
    domMonoWrapper.style('display', 'none');
  });
  domBtnMono.mousePressed(() => {
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
  domBtnPause.mousePressed(() => {
    isPaused = !isPaused;
    if (isPaused) {
      domBtnPause.html(i18n.t('▶ Continuar'));
      domBtnPause.addClass('paused');
    } else {
      domBtnPause.html(i18n.t('⏸ Pausar'));
      domBtnPause.removeClass('paused');
    }
  });
  domBtnReset.mousePressed(() => {
    resetSim();
    if (currentMode === 'gas') initGasMode();
  });

  // Disparo único / Ráfaga (modo colisión) — en disparo único se dispara
  // haciendo clic en la fuente del lienzo (ver mousePressed / drawSourceFireHint)
  if (domBtnRafaga) domBtnRafaga.mousePressed(() => {
    collSingleShot = false;
    domBtnRafaga.addClass('active');
    domBtnSingle.removeClass('active');
    if (domWrapperERate) domWrapperERate.style('display', 'flex');
    resetSim();
  });
  if (domBtnSingle) domBtnSingle.mousePressed(() => {
    collSingleShot = true;
    domBtnSingle.addClass('active');
    domBtnRafaga.removeClass('active');
    if (domWrapperERate) domWrapperERate.style('display', 'none');
    resetSim();
  });

  // Disparo único / Ráfaga (modo fotones)
  if (domBtnFotoRafaga) domBtnFotoRafaga.mousePressed(() => {
    fotoSingleShot = false;
    domBtnFotoRafaga.addClass('active');
    domBtnFotoSingle.removeClass('active');
    if (domWrapperFRate) domWrapperFRate.style('display', 'flex');
    resetSim();
  });
  if (domBtnFotoSingle) domBtnFotoSingle.mousePressed(() => {
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

function switchMode(mode) {
  currentMode = mode;
  resetSim();

  [domModeFotones, domModeColision, domModeGas].forEach(b => b.removeClass('active'));
  [domCtrlFotones, domCtrlColision, domCtrlGas].forEach(s => s.style('display', 'none'));

  if (mode === 'fotones')  { domModeFotones.addClass('active');  domCtrlFotones.style('display', 'flex'); }
  if (mode === 'colision') { domModeColision.addClass('active'); domCtrlColision.style('display', 'flex'); }
  if (mode === 'gas')      { domModeGas.addClass('active');      domCtrlGas.style('display', 'flex'); initGasMode(); }
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
        <span style="color:#666">${atomData.levelLabels[tr.from]}→${atomData.levelLabels[tr.to]}</span>
      </div>
    </div>`;
  }
  domTransitionsList.html(html);
}

function updateEnergyAccessPanel() {
  if (!domEnergyAccessPanel) return;
  let html = '<div style="font-size:8px;color:#607080;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">' + i18n.t('Con {e} eV puedes alcanzar:', { e: fmt(electronEnergy, 1) }) + '</div>';
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
