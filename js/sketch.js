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
    note: 'Líneas de Balmer (n=2 como base). El espectro visible muestra rojo, cian y violeta.',
    nucleusColor: [180, 210, 255],
    orbitStroke: [100, 140, 220],
    levels: 4,
    levelLabels: ['n=2', 'n=3', 'n=4', 'n=5'],
    energies: [0, 1.89, 2.55, 2.86],
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
    note: 'La línea amarilla (589 nm) es la más intensa del espectro visible. Explica el color de las farolas de sodio.',
    nucleusColor: [255, 190, 50],
    orbitStroke: [200, 150, 30],
    levels: 3,
    levelLabels: ['3s', '3p', '4d'],
    energies: [0, 2.10, 3.62],
    radii: [68, 115, 155],
    transitions: [
      { from: 0, to: 1, wl: 589, visible: true,  name: 'D₁/D₂' },
      { from: 0, to: 2, wl: 343, visible: false, name: 'UV' },
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
  if (wl <= 0 || wl < 380 || wl > 780) return [90, 90, 90];
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
    this.size = (wl > 0 && wl >= 380 && wl <= 780) ? 8 : 7;
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
  }
  excite(targetLevel) {
    this.level = targetLevel;
    this.exciteTarget = targetLevel;
    this.exciteTimer = floor(random(40, 100));
    this.glowTimer = 20;
    absCount++;
  }
  update() {
    if (this.glowTimer > 0) this.glowTimer--;
    if (this.level > 0 && this.exciteTimer > 0) {
      this.exciteTimer--;
      if (this.exciteTimer === 0) {
        this.deExcite();
      }
    }
  }
  deExcite() {
    // Cascada: bajar un nivel a la vez o saltar directamente (aleatorio)
    let current = this.level;
    while (current > 0) {
      let targets = [];
      for (let t = 0; t < current; t++) targets.push(t);
      let to = targets[floor(random(targets.length))];
      let tr = findTransition(this.data, to, current);
      if (tr) {
        emitPhotonFromGas(this.x, this.y, tr.wl);
        emiCount++;
        gasPhotonTotal++;
        let k = Math.round(tr.wl);
        gasPhotonCounts[k] = (gasPhotonCounts[k] || 0) + 1;
        if (tr.visible) updateSpectrum(tr.wl);
      }
      current = to;
    }
    this.level = 0;
  }
  draw() {
    let nc = this.data.nucleusColor;
    let glow = this.level > 0;
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
    textSize(8);
    noStroke();
    text(this.data.symbol, this.x, this.y);
  }
}

class GasElectron {
  constructor(x, y, energy) {
    this.x = x; this.y = y;
    this.energy = energy;
    this.vx = map(energy, 1, 8, 3, 9) * (random() > 0.5 ? 1 : -1);
    this.vy = random(-0.5, 0.5);
    this.done = false;
    this.trail = [];
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 6) this.trail.shift();
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < TUBE_X + 5 || this.x > TUBE_X + TUBE_W - 5) { this.vx *= -1; }
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
const SPEC_Y  = 496, SPEC_X1 = 30, SPEC_X2 = 870, SPEC_H = 82;
const DIAG_X  = 626, DIAG_Y  = 30,  DIAG_W = 240, DIAG_H = 400;
const TUBE_X  = 30,  TUBE_Y  = 28,  TUBE_W = 840, TUBE_H = 430;

let currentMode    = 'fotones';
let currentAtomKey = 'hidrogeno';
let atomData       = null;
let electronLevel  = 0;
let exciteTimer    = 0;
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
const SPECTRUM_DECAY  = 0.993;

// DOM
let domAtomSelect, domBtnBlanca, domBtnMono, domSliderWl, domValWl;
let domSliderRate, domValRate;
let domSliderEEnergy, domValEEnergy, domSliderERate, domValERate;
let domSliderVoltage, domValVoltage, domSliderDensity, domValDensity;
let domBtnPause, domBtnReset;
let domMetricLevel, domMetricEnergy, domMetricAbs, domMetricEmi, domMetricState;
let domTransitionsList, domEnergyAccessPanel, domAtomInfo;
let domModeFotones, domModeColision, domModeGas;
let domCtrlFotones, domCtrlColision, domCtrlGas;
let domMonoWrapper, domMonoColorBar;

// Animación de radio del electrón (transición suave entre órbitas)
let electronRCurrent = 68;

// Etiqueta de estado en canvas (modo fotones/colisión)
let stateLbl    = '';
let stateLblClr = [200, 200, 200];
let stateLblT   = 0;

// Transición activa para resaltar en el diagrama de niveles
let activeTr  = null;
let activeTrT = 0;

// Modo disparo único (modo colisión)
let collSingleShot = false;
let collWaitResult = false;
let domBtnRafaga, domBtnSingle, domBtnFire, domWrapperSingleFire, domWrapperERate;

// Contadores del modo gas
let gasPhotonCounts = {};
let gasPhotonTotal  = 0;

// ─── HELPERS ─────────────────────────────────────────────────────
function findTransition(atom, from, to) {
  return atom.transitions.find(t => t.from === from && t.to === to) ||
         atom.transitions.find(t => t.from === to   && t.to === from);
}

function updateSpectrum(wl) {
  if (wl < 380 || wl > 780) return;
  let idx = Math.round(wl - 380);
  spectrumIntensity[idx] = min(1.0, spectrumIntensity[idx] + 0.6);
  // Pequeño ensanchamiento natural de línea
  if (idx > 0)   spectrumIntensity[idx - 1] = min(1.0, spectrumIntensity[idx - 1] + 0.25);
  if (idx < 400) spectrumIntensity[idx + 1] = min(1.0, spectrumIntensity[idx + 1] + 0.25);
}

function emitPhotonFromAtom(wl) {
  let angle = random(TWO_PI);
  let speed = random(3, 5);
  let p = new Photon(ATOM_CX, ATOM_CY, wl, cos(angle) * speed, sin(angle) * speed);
  outPhotons.push(p);
  if (wl >= 380 && wl <= 780) updateSpectrum(wl);
  emiCount++;
}

function emitPhotonFromGas(x, y, wl) {
  let angle = random(TWO_PI);
  let speed = random(2.5, 4.5);
  outPhotons.push(new Photon(x, y, wl, cos(angle) * speed, sin(angle) * speed));
}

function deExciteAtom() {
  if (electronLevel === 0) return;
  let current = electronLevel;
  while (current > 0) {
    let possible = [];
    for (let t = 0; t < current; t++) possible.push(t);
    let to = possible[floor(random(possible.length))];
    let tr = findTransition(atomData, to, current);
    if (tr) {
      emitPhotonFromAtom(tr.wl);
      stateLbl    = `EMITE  ${tr.wl} nm    (${atomData.levelLabels[tr.to]} → ${atomData.levelLabels[tr.from]})`;
      stateLblClr = wlToRGB(tr.wl);
      stateLblT   = 120;
      activeTr    = tr;
      activeTrT   = 120;
    }
    current = to;
  }
  electronLevel = 0;
  flashTimer = 0;
}

function resetSim() {
  electronLevel    = 0;
  exciteTimer      = 0;
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
  collWaitResult   = false;
  if (domBtnFire && domBtnFire.elt) domBtnFire.elt.disabled = false;
  initGasMode();
  spectrumIntensity.fill(0);
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

// ─── P5.JS SETUP ────────────────────────────────────────────────
function setup() {
  let canvas = createCanvas(CV_W, CV_H);
  canvas.parent('canvas-container');
  frameRate(60);
  textFont('monospace');
  atomData = ATOMS_DATA[currentAtomKey];
  electronRCurrent = atomData.radii[0];
  setupControls();
  updateAtomDisplay();
  initGasMode();
}

// ─── P5.JS DRAW ─────────────────────────────────────────────────
function draw() {
  background(12, 14, 18);

  // Decaimiento del espectro
  for (let i = 0; i < spectrumIntensity.length; i++) {
    spectrumIntensity[i] *= SPECTRUM_DECAY;
  }

  if (isPaused) {
    // Dibujar estado congelado + mensaje
    drawCurrentMode(false);
    drawSpectrum();
    drawPausedOverlay();
    return;
  }

  drawCurrentMode(true);
  drawSpectrum();

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
  fill(0, 0, 0, 100);
  noStroke();
  rect(0, 0, CV_W, CV_H);
  fill(180, 200, 220, 200);
  textAlign(CENTER, CENTER);
  textSize(18);
  text('PAUSA', CV_W / 2, CV_H / 2 - SPEC_H / 2);
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
  fill(180, 200, 220, 140);
  textAlign(CENTER, TOP);
  textSize(10);
  noStroke();
  text(lightType === 'white' ? 'Luz blanca' : monoWl + ' nm', 65, 20);
}

function updatePhotonMode() {
  electronAngle += 0.018;
  electronRCurrent += (atomData.radii[electronLevel] - electronRCurrent) * 0.09;
  if (stateLblT > 0) stateLblT--;
  if (activeTrT > 0) activeTrT--;

  // Generar fotones entrantes
  photonSpawnT++;
  let spawnInterval = [24, 18, 12, 8, 5][photonRate - 1];
  if (photonSpawnT >= spawnInterval) {
    photonSpawnT = 0;
    spawnIncomingPhoton();
  }

  // Actualizar fotones entrantes
  for (let i = inPhotons.length - 1; i >= 0; i--) {
    let ph = inPhotons[i];
    ph.update();
    // Colisión con átomo
    let d = dist(ph.x, ph.y, ATOM_CX, ATOM_CY);
    if (!ph.fading && d < atomData.radii[0] + 12) {
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

  if (flashTimer > 0) flashTimer--;
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
    let tolerance = 12; // nm
    if (abs(ph.wl - tr.wl) < tolerance && tr.wl >= 380 && tr.wl <= 780) {
      // ¡Absorción!
      ph.fading = true;
      electronLevel = tr.to;
      exciteTimer = floor(random(80, 160));
      flashTimer  = 25;
      absCount++;
      stateLbl    = `ABSORBE  ${tr.wl} nm    (${atomData.levelLabels[tr.from]} → ${atomData.levelLabels[tr.to]})`;
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
  fill(30, 40, 55);
  stroke(60, 80, 100);
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
  stroke(150, 170, 190, 120);
  strokeWeight(1.5);
  line(62, sy, 88, sy);
  noStroke();
  fill(150, 170, 190, 120);
  triangle(88, sy - 4, 88, sy + 4, 94, sy);

  // Icono de lámpara
  fill(200, 220, 240, 100);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(9);
  text('☀', sx - 4, sy - 58);
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
    if (!e.collided && d < atomData.radii[0] + 10) {
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
  if (flashTimer > 0) flashTimer--;

  // Disparo único: re-habilitar botón cuando el resultado se resuelve
  if (collSingleShot && collWaitResult &&
      electronLevel === 0 && exciteTimer === 0 &&
      collElectrons.length === 0 && stateLblT < 30) {
    collWaitResult = false;
    if (domBtnFire && domBtnFire.elt) domBtnFire.elt.disabled = false;
  }
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
    stateLbl    = `EXCITACIÓN  (${atomData.levelLabels[prevLevel]} → ${atomData.levelLabels[bestTarget]})`;
    stateLblClr = [80, 210, 255];
    stateLblT   = 120;
    let tr = findTransition(atomData, prevLevel, bestTarget);
    if (tr) { activeTr = tr; activeTrT = 120; }
  } else {
    electron.collided = true;
    stateLbl    = 'Colisión elástica — energía insuficiente';
    stateLblClr = [150, 150, 150];
    stateLblT   = 90;
  }
  electron.done = true;
}

function drawElectronGun() {
  let sx = 68, sy = ATOM_CY;
  fill(25, 35, 50);
  stroke(50, 80, 120);
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
  fill(150, 200, 240, 160);
  textAlign(CENTER, CENTER);
  textSize(10);
  noStroke();
  text(electronEnergy.toFixed(1) + ' eV', sx, sy - 50);
}


// ─── MODO GAS IONIZADO ──────────────────────────────────────────
function drawGasMode(animate) {
  if (animate) updateGasMode();

  // Tubo
  noFill();
  stroke(60, 100, 140, 200);
  strokeWeight(2);
  rect(TUBE_X, TUBE_Y, TUBE_W, TUBE_H, 8);

  // Fondo tenue del tubo (color del elemento)
  let nc = atomData.nucleusColor;
  fill(nc[0], nc[1], nc[2], 8);
  noStroke();
  rect(TUBE_X + 2, TUBE_Y + 2, TUBE_W - 4, TUBE_H - 4, 7);

  // Electrodos
  fill(80, 100, 130, 200);
  noStroke();
  rect(TUBE_X + 3, TUBE_Y + TUBE_H / 2 - 15, 12, 30, 2);
  rect(TUBE_X + TUBE_W - 15, TUBE_Y + TUBE_H / 2 - 15, 12, 30, 2);

  for (let ga of gasAtomsList) ga.draw();
  for (let ge of gasElectrons) ge.draw();
  for (let ph of outPhotons)   ph.draw();

  // Etiqueta
  fill(150, 180, 220, 120);
  textAlign(CENTER, TOP);
  textSize(10);
  noStroke();
  text('Lámpara de ' + atomData.name + '   —   ' + gasVoltage.toFixed(1) + ' eV', CV_W / 2, TUBE_Y + 5);

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
      if (a.level === 0 && dist(e.x, e.y, a.x, a.y) < 16) {
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
    electron.vx *= -0.5;
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

    // Etiqueta del nivel (izquierda)
    let lx = cx - r - 6;
    let ly = cy;
    fill(160, 180, 200, 120);
    noStroke();
    textAlign(RIGHT, CENTER);
    textSize(9);
    text(atom.levelLabels[i], lx, ly);

    // Energía del nivel
    fill(100, 130, 160, 100);
    textSize(8);
    text(atom.energies[i].toFixed(2) + ' eV', lx, ly + 11);
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
    let txt = '— excitado —';
    fill(255, 200, 80, 160);
    textAlign(CENTER, BOTTOM);
    textSize(9);
    noStroke();
    text(txt, cx, cy - maxR - 12);
  }
}

function drawTransitionArrows(cx, cy) {
  let atom = atomData;
  // Solo transiciones visibles (UV/IR se muestran en el diagrama de energía)
  let visTrs = atom.transitions.filter(t => t.visible);

  // Distribuir ángulos equitativamente en el cuadrante superior-derecho
  let baseAngle = -PI / 8;          // -22.5° desde horizontal
  let angleStep = PI / (visTrs.length + 1) * 0.55;

  for (let i = 0; i < visTrs.length; i++) {
    let tr  = visTrs[i];
    let r1  = atom.radii[tr.from];
    let r2  = atom.radii[tr.to];
    let col = wlToRGB(tr.wl);
    let ang = baseAngle - i * angleStep;

    // Puntos en los bordes de cada órbita (radiales)
    let ix1 = cx + r1 * cos(ang),  iy1 = cy + r1 * sin(ang);
    let ix2 = cx + r2 * cos(ang),  iy2 = cy + r2 * sin(ang);

    // Línea entre órbitas
    let isActiveTr = activeTrT > 0 && activeTr &&
      ((tr.from === activeTr.from && tr.to === activeTr.to) ||
       (tr.from === activeTr.to   && tr.to === activeTr.from));
    let trAlpha = isActiveTr ? min(255, map(activeTrT, 0, 120, 60, 255)) : 190;
    stroke(col[0], col[1], col[2], trAlpha);
    strokeWeight(isActiveTr ? 3.2 : 1.8);
    line(ix1, iy1, ix2, iy2);

    // Cabeza de flecha hacia afuera (absorción ↑)
    let dx = ix2 - ix1, dy = iy2 - iy1;
    let len = sqrt(dx * dx + dy * dy);
    let ux = dx / len, uy = dy / len;
    let px = -uy, py = ux; // perpendicular
    noStroke();
    fill(col[0], col[1], col[2], 210);
    triangle(
      ix2 + ux * 5, iy2 + uy * 5,
      ix2 - ux * 4 + px * 3.5, iy2 - uy * 4 + py * 3.5,
      ix2 - ux * 4 - px * 3.5, iy2 - uy * 4 - py * 3.5
    );

    // Pequeño círculo en el nivel inferior
    fill(col[0], col[1], col[2], 140);
    circle(ix1, iy1, 5);

    // Etiqueta: longitud de onda cerca de la mitad de la flecha
    let mx = (ix1 + ix2) / 2 + ux * 6 + px * 8;
    let my = (iy1 + iy2) / 2 + uy * 6 + py * 8;
    fill(col[0], col[1], col[2], 220);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(8);
    text(tr.wl + ' nm', mx, my);
  }

  // Indicar transiciones invisibles con etiqueta global (no arrows)
  let invTrs = atom.transitions.filter(t => !t.visible);
  if (invTrs.length > 0) {
    fill(90, 90, 90, 100);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(7.5);
    let maxR = atom.radii[atom.levels - 1];
    text('+ ' + invTrs.length + ' IR/UV (ver diagrama →)', cx + maxR + 8, cy + maxR * 0.55);
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
  fill(16, 22, 32, 210);
  stroke(50, 70, 90, 160);
  strokeWeight(1);
  rect(x0, y0, w, h, 8);

  // Título
  fill(140, 170, 200, 180);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(9);
  text('Diagrama de niveles', x0 + w / 2, y0 + 6);
  textSize(8);
  fill(100, 130, 160, 130);
  text('(eV)', x0 + 18, y0 + 18);

  // Eje Y
  stroke(60, 80, 100, 100);
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
    textSize(8);
    text(atom.levelLabels[i], x0 + 32, ly - 8);

    // Valor de energía
    fill(100, 140, 180, 140);
    textAlign(RIGHT, CENTER);
    textSize(8);
    text(e.toFixed(2), x0 + 28, ly);

    // Electrón en el diagrama
    if (isActive) {
      noStroke();
      fill(0, 255, 180, 200);
      circle(x0 + 22, ly, 7);
      fill(200, 255, 240, 180);
      circle(x0 + 22, ly, 3);
    }
  }

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
    textSize(7.5);
    let ly = (y1 + y2) / 2;
    let lbl = tr.visible ? tr.wl + 'nm' : (tr.wl < 380 ? 'UV' : 'IR');
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
  textSize(11);
  let tw = textWidth(stateLbl);
  noStroke();
  fill(5, 10, 20, alpha * 0.85);
  rect(lx - tw / 2 - 10, ly - 13, tw + 20, 18, 5);
  fill(r, g, b, alpha);
  textAlign(CENTER, CENTER);
  text(stateLbl, lx, ly - 4);
  pop();
}

// ─── CONTADORES MODO GAS ─────────────────────────────────────────
function drawGasCounters() {
  let freeE    = gasElectrons.length;
  let excitedN = gasAtomsList.filter(a => a.level > 0).length;

  fill(90, 140, 180, 160);
  noStroke();
  textAlign(LEFT, BOTTOM);
  textSize(9);
  text(
    'e⁻ libres: ' + freeE +
    '   ·   átomos excitados: ' + excitedN + ' / ' + gasAtomsList.length +
    '   ·   fotones emitidos: ' + gasPhotonTotal,
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
    textSize(8);
    text(cnt, px, SPEC_Y - 4);
  }
}

// ─── ESPECTRO ────────────────────────────────────────────────────
function drawSpectrum() {
  let x1 = SPEC_X1, x2 = SPEC_X2, y = SPEC_Y, h = SPEC_H;
  let w = x2 - x1;

  // Marco
  fill(8, 10, 14);
  stroke(50, 65, 85, 160);
  strokeWeight(1);
  rect(x1, y, w, h, 6);

  // Gradiente de fondo (espectro completo muy tenue)
  noStroke();
  for (let i = 0; i <= 400; i++) {
    let wl = 380 + i;
    let [r, g, b] = wlToRGB(wl);
    let px = map(i, 0, 400, x1 + 2, x2 - 2);
    fill(r, g, b, 18);
    rect(px, y + 2, (w - 4) / 400, h - 4);
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
    rect(px - 1.5, y + 2, 3, h - 4);
    // Línea central
    fill(r, g, b, intensity * 240);
    rect(px - 0.7, y + 2, 1.4, h - 4);
  }

  // Marcadores de longitud de onda
  let markers = [400, 450, 500, 550, 600, 650, 700, 750];
  for (let wlM of markers) {
    let px = map(wlM - 380, 0, 400, x1 + 2, x2 - 2);
    stroke(100, 120, 150, 80);
    strokeWeight(0.6);
    line(px, y + h - 12, px, y + h - 2);
    noStroke();
    fill(100, 120, 150, 120);
    textAlign(CENTER, BOTTOM);
    textSize(8);
    text(wlM, px, y + h - 1);
  }

  // Título
  fill(120, 150, 190, 160);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(9);
  text('Espectro de emisión   (nm)', x1 + 6, y + 4);
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
  domAtomInfo          = select('#atom-info');
  domModeFotones       = select('#mode-fotones');
  domModeColision      = select('#mode-colision');
  domModeGas           = select('#mode-gas');
  domCtrlFotones       = select('#controls-fotones');
  domCtrlColision      = select('#controls-colision');
  domCtrlGas           = select('#controls-gas');
  domMonoWrapper       = select('#wrapper-mono');
  domMonoColorBar      = select('#mono-color-bar');
  domBtnRafaga         = select('#btn-rafaga');
  domBtnSingle         = select('#btn-single');
  domBtnFire           = select('#btn-fire');
  domWrapperSingleFire = select('#wrapper-single-fire');
  domWrapperERate      = select('#wrapper-erate');

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
    domValRate.html(labels[photonRate - 1]);
    updateSliderFill(domSliderRate);
  });

  // Sliders de modo colisión
  domSliderEEnergy.input(() => {
    electronEnergy = parseFloat(domSliderEEnergy.value());
    domValEEnergy.html(electronEnergy.toFixed(1) + ' eV');
    updateSliderFill(domSliderEEnergy);
    updateEnergyAccessPanel();
  });
  domSliderERate.input(() => {
    electronRate = int(domSliderERate.value());
    let labels = ['Lenta', 'Pausada', 'Media', 'Rápida', 'Máxima'];
    domValERate.html(labels[electronRate - 1]);
    updateSliderFill(domSliderERate);
  });

  // Sliders de modo gas
  domSliderVoltage.input(() => {
    gasVoltage = parseFloat(domSliderVoltage.value());
    domValVoltage.html(gasVoltage.toFixed(1) + ' eV');
    updateSliderFill(domSliderVoltage);
    // Actualizar energía de electrones del gas
    for (let e of gasElectrons) {
      e.energy = gasVoltage;
    }
  });
  domSliderDensity.input(() => {
    gasDensity = int(domSliderDensity.value());
    let labels = ['Muy diluid', 'Diluida', 'Media', 'Densa', 'Muy densa'];
    let idx = floor(map(gasDensity, 4, 20, 0, 4));
    domValDensity.html(labels[min(idx, 4)]);
    updateSliderFill(domSliderDensity);
    initGasMode();
  });

  // Pausa / reset
  domBtnPause.mousePressed(() => {
    isPaused = !isPaused;
    if (isPaused) {
      domBtnPause.html('▶ Continuar');
      domBtnPause.addClass('paused');
    } else {
      domBtnPause.html('⏸ Pausar');
      domBtnPause.removeClass('paused');
    }
  });
  domBtnReset.mousePressed(() => {
    resetSim();
    if (currentMode === 'gas') initGasMode();
  });

  // Disparo único / Ráfaga (modo colisión)
  if (domBtnRafaga) domBtnRafaga.mousePressed(() => {
    collSingleShot = false;
    domBtnRafaga.addClass('active');
    domBtnSingle.removeClass('active');
    if (domWrapperERate)      domWrapperERate.style('display', 'flex');
    if (domWrapperSingleFire) domWrapperSingleFire.style('display', 'none');
    resetSim();
  });
  if (domBtnSingle) domBtnSingle.mousePressed(() => {
    collSingleShot = true;
    domBtnSingle.addClass('active');
    domBtnRafaga.removeClass('active');
    if (domWrapperERate)      domWrapperERate.style('display', 'none');
    if (domWrapperSingleFire) domWrapperSingleFire.style('display', 'block');
    resetSim();
  });
  if (domBtnFire) domBtnFire.mousePressed(() => {
    if (!collWaitResult && !isPaused) {
      let yOff = random(-20, 20);
      collElectrons.push(new CollisionElectron(80, ATOM_CY + yOff, electronEnergy));
      collWaitResult = true;
      domBtnFire.elt.disabled = true;
    }
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
  // Nota del átomo
  if (domAtomInfo) domAtomInfo.html(atomData.note);
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
  let html = '<div style="font-size:8px;color:#607080;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Con ' + electronEnergy.toFixed(1) + ' eV puedes alcanzar:</div>';
  for (let lv = 1; lv < atomData.levels; lv++) {
    let needed = atomData.energies[lv] - atomData.energies[0];
    let canReach = electronEnergy >= needed;
    let [r, g, b] = wlToRGB(atomData.transitions.find(t => t.from === 0 && t.to === lv)?.wl || 0);
    let dotColor = canReach ? `rgb(60,220,80)` : `rgb(180,80,60)`;
    let check = canReach ? '<span class="energy-check yes">✓</span>' : '<span class="energy-check no">✗</span>';
    html += `<div class="energy-row">
      <div class="energy-dot" style="background:${dotColor}"></div>
      <span class="energy-label">${atomData.levelLabels[lv]} (${needed.toFixed(2)} eV)</span>
      ${check}
    </div>`;
  }
  domEnergyAccessPanel.html(html);
}

function updateUI() {
  if (!domMetricLevel) return;
  domMetricLevel.html(atomData.levelLabels[electronLevel]);
  domMetricEnergy.html(atomData.energies[electronLevel].toFixed(2));
  domMetricAbs.html(absCount);
  domMetricEmi.html(emiCount);
  let stateText = electronLevel === 0 ? 'Estado fundamental' :
    'Excitado — ' + atomData.levelLabels[electronLevel] + ' (' + atomData.energies[electronLevel].toFixed(2) + ' eV)';
  domMetricState.html(stateText);

  // Estado del gas
  if (currentMode === 'gas') {
    let excited = gasAtomsList.filter(a => a.level > 0).length;
    domMetricLevel.html(excited + '/' + gasAtomsList.length);
    domMetricEnergy.html(gasVoltage.toFixed(1));
    let totalAbs = gasAtomsList.reduce((s, a) => s + (a.level > 0 ? 1 : 0), 0);
    domMetricState.html(excited > 0 ? excited + ' átomos excitados' : 'Todos en reposo');
  }
}

function updateMonoBar() {
  if (!domMonoColorBar) return;
  let [r, g, b] = wlToRGB(monoWl);
  domMonoColorBar.style('background', `rgb(${r},${g},${b})`);
}

function updateSliderFill(slider) {
  if (!slider || !slider.elt) return;
  let el  = slider.elt;
  let min = parseFloat(el.min);
  let max = parseFloat(el.max);
  let val = parseFloat(el.value);
  let pct = ((val - min) / (max - min) * 100).toFixed(1) + '%';
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
