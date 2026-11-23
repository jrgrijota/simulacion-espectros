// ═══════════════════════════════════════════════════════════════════
//  FÍSICA DE «ESPECTROS ATÓMICOS»
//
//  La misma de la versión anterior (js/sketch.js hasta noviembre de 2026):
//  mismos niveles, longitudes de onda, márgenes de absorción, tiempos de la
//  cascada, reglas de los choques y del tubo de gas. Solo cambian:
//   · las coordenadas: ahora son las del modelo (centro en 0,0; las órbitas
//     miden lo mismo que antes, de 55 a 168);
//   · el salto del electrón entre órbitas es casi instantáneo (≈ 0,1 s);
//   · tras un choque, el electrón del cañón sigue con la energía que le
//     sobra (o rebota con la misma si no llega a ningún nivel), en vez de
//     desaparecer. La excitación del átomo es la misma.
//  Todo se mide en fotogramas (60 por segundo).
//  Cuando pasa algo, se llama a alEvento(ev) (lo define js/escena.js).
// ═══════════════════════════════════════════════════════════════════

// ─── DATOS DE LOS ÁTOMOS ─────────────────────────────────────────
// energies[]: energía de cada nivel respecto al más bajo del modelo (eV)
// radii[]: radio de la órbita en el modelo · transitions[]: saltos con su λ (nm)
// lampara: color real del tubo encendido (punto del carril)
const ATOMS_DATA = {
  hidrogeno: {
    clave: 'hidrogeno', name: 'Hidrógeno', symbol: 'H', lampara: '#d77bff',
    note: 'Modelo simplificado: solo los niveles n=2 a n=5 (el fundamental, n=1, queda fuera). Las líneas visibles H-α 656 nm, H-β 486 nm y H-γ 434 nm son la serie de Balmer: saltos que acaban en n=2.',
    nucleus: '#b4d2ff',
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
    clave: 'helio', name: 'Helio', symbol: 'He', lampara: '#ffb9a0',
    note: 'Descubierto en el Sol antes que en la Tierra. Emite amarillo y azul.',
    nucleus: '#ffffa0',
    levels: 3,
    levelLabels: ['E₁', 'E₂', 'E₃'],
    energies: [0, 2.11, 2.78],
    radii: [68, 115, 155],
    transitions: [
      { from: 0, to: 1, wl: 588, visible: true,  name: 'D₃' },
      { from: 0, to: 2, wl: 447, visible: true,  name: '447 nm' },
      { from: 1, to: 2, wl: 1851, visible: false, name: 'IR' },
    ]
  },
  sodio: {
    clave: 'sodio', name: 'Sodio', symbol: 'Na', lampara: '#ffb43c',
    note: 'La línea amarilla (589 nm) es la más intensa del espectro visible. Explica el color de las farolas de sodio. Desde 3d el átomo no puede volver directamente a 3s (salto prohibido): baja por 3p.',
    nucleus: '#ffbe32',
    levels: 3,
    levelLabels: ['3s', '3p', '3d'],
    energies: [0, 2.10, 3.62],
    radii: [68, 115, 155],
    // 3s → 3d está prohibido: no hay línea de 343 nm
    transitions: [
      { from: 0, to: 1, wl: 589, visible: true,  name: 'D₁/D₂' },
      { from: 1, to: 2, wl: 819, visible: false, name: 'IR' },
    ]
  },
  neon: {
    clave: 'neon', name: 'Neón', symbol: 'Ne', lampara: '#ff5a36',
    note: 'Espectro rico en rojo y naranja. Los letreros de «neón» emiten por desexcitación en cascada.',
    nucleus: '#ff6446',
    levels: 5,
    levelLabels: ['E₁', 'E₂', 'E₃', 'E₄', 'E₅'],
    energies: [0, 1.76, 1.94, 2.12, 2.73],
    radii: [55, 86, 106, 126, 162],
    transitions: [
      { from: 0, to: 1, wl: 703, visible: true,  name: '703 nm' },
      { from: 0, to: 2, wl: 639, visible: true,  name: '639 nm' },
      { from: 0, to: 3, wl: 585, visible: true,  name: '585 nm' },
      { from: 0, to: 4, wl: 454, visible: true,  name: '454 nm' },
      { from: 1, to: 2, wl: 6889, visible: false, name: 'IR' },
      { from: 1, to: 3, wl: 3444, visible: false, name: 'IR' },
      { from: 1, to: 4, wl: 1278, visible: false, name: 'IR' },
      { from: 2, to: 3, wl: 6889, visible: false, name: 'IR' },
      { from: 2, to: 4, wl: 1569, visible: false, name: 'IR' },
      { from: 3, to: 4, wl: 2033, visible: false, name: 'IR' },
    ]
  }
};
const CLAVES_ATOMOS = ['hidrogeno', 'helio', 'sodio', 'neon'];
const RAYAS_VISIBLES = (a) => a.transitions.filter(t => t.visible).map(t => t.wl);

// ─── λ (nm) → color ──────────────────────────────────────────────
function wlToRGB(wl) {
  if (wl < 380 || wl > 780) return [90, 90, 90];
  let r, g, b;
  if      (wl < 440) { r = -(wl - 440) / 60; g = 0;                b = 1; }
  else if (wl < 490) { r = 0;                g = (wl - 440) / 50;  b = 1; }
  else if (wl < 510) { r = 0;                g = 1;                b = -(wl - 510) / 20; }
  else if (wl < 580) { r = (wl - 510) / 70;  g = 1;                b = 0; }
  else if (wl < 645) { r = 1;                g = -(wl - 645) / 65; b = 0; }
  else               { r = 1;                g = 0;                b = 0; }
  const f = (wl < 420) ? 0.3 + 0.7 * (wl - 380) / 40 : (wl > 700) ? 0.3 + 0.7 * (780 - wl) / 80 : 1.0;
  return [
    Math.min(255, Math.round(255 * Math.max(0, r) * f)),
    Math.min(255, Math.round(255 * Math.max(0, g) * f)),
    Math.min(255, Math.round(255 * Math.max(0, b) * f))
  ];
}
// Versión algo más luminosa para dibujar rayas y fotones sobre fondo oscuro
function wlColor(wl, alfa = 255) {
  if (wl < 380 || wl > 780) return color(150, 162, 176, alfa);
  const f = (wl < 420) ? 0.3 + 0.7 * (wl - 380) / 40 : (wl > 700) ? 0.3 + 0.7 * (780 - wl) / 80 : 1.0;
  const k = Math.min(1, f + 0.25) / f;
  const [r, g, b] = wlToRGB(wl);
  return color(Math.min(255, r * k), Math.min(255, g * k), Math.min(255, b * k), alfa);
}
const energiaFoton = (wl) => 1239.84 / wl;            // eV
const esVisible = (wl) => wl >= 380 && wl <= 780;

// ─── ESTADO ──────────────────────────────────────────────────────
const SPECTRUM_DECAY = 0.99985;   // las líneas tardan ~77 s en perder la mitad de su brillo
const F = {
  modo: 'fotones', clave: 'hidrogeno', atom: ATOMS_DATA.hidrogeno, pausa: false, frames: 0,
  // átomo único (fotones y colisión)
  nivel: 0, exciteTimer: 0, cascada: [], cascadaT: 0, angulo: -0.6, rElectron: 68, saltoDesde: null,
  // fotones
  luz: 'white', monoWl: 550, flujo: 1, fotonUnico: false, fotonesIn: [], fotonesOut: [], spawnT: 0,
  // colisión
  eEnergia: 3.0, eFrec: 3, eUnico: true, electrones: [], eSpawnT: 0,
  // gas
  voltaje: 5.0, densidad: 10, gasAtomos: [], gasElectrones: [], gasT: 0, gasTotal: 0, gasCuentas: {},
  // contadores y espectros
  absCount: 0, emiCount: 0,
  espectro: new Float32Array(401), absorcion: new Float32Array(401), extLineas: {},
  brillo: {},                      // λ → brillo reciente de esa raya (luz del tubo y del prisma)
};
let alEvento = () => {};           // lo fija js/escena.js

// ─── CLASES ──────────────────────────────────────────────────────
class Foton {
  constructor(x, y, wl, vx, vy) {
    Object.assign(this, { x, y, wl, vx, vy, alpha: 255, fading: false, done: false, probado: false, avisado: false });
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.fading) { this.alpha -= 18; if (this.alpha <= 0) this.done = true; }
    if (Math.abs(this.x) > 260 || Math.abs(this.y) > 260) this.done = true;
  }
}
class ElectronCanon {
  constructor(x, y, energy) {
    Object.assign(this, { x, y, energy, vy: 0, done: false, collided: false, trail: [] });
    this.vx = map(energy, 0.5, 6.0, 2.5, 8.0);
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();
    this.x += this.vx; this.y += this.vy;
    if (Math.abs(this.x) > 260 || Math.abs(this.y) > 260) this.done = true;
  }
}
class AtomoGas {
  constructor(x, y, atom) {
    Object.assign(this, { x, y, data: atom, level: 0, exciteTimer: 0, glowTimer: 0, cascadePath: [], cascadeTimer: 0, cooldown: 0 });
    this.ang = random(TWO_PI);
  }
  excite(targetLevel) {
    this.level = targetLevel;
    this.exciteTimer = floor(random(40, 100));
    this.glowTimer = 40;
    this.cascadePath = [];
    this.cascadeTimer = 0;
    F.absCount++;
  }
  _buildCascade(startLevel) {
    const path = [];
    let current = startLevel;
    while (current > 0) { const to = nivelInferiorAleatorio(current); path.push({ from: current, to }); current = to; }
    return path;
  }
  update() {
    this.ang += 0.03;
    if (this.glowTimer > 0) this.glowTimer--;
    if (this.cooldown > 0) this.cooldown--;
    if (this.level > 0 && this.exciteTimer > 0 && this.cascadePath.length === 0) {
      this.exciteTimer--;
      if (this.exciteTimer === 0) { this.cascadePath = this._buildCascade(this.level); this.cascadeTimer = 120; }
      return;
    }
    if (this.cascadePath.length > 0) {
      this.cascadeTimer--;
      if (this.cascadeTimer <= 0) {
        const step = this.cascadePath.shift();
        const tr = findTransition(this.data, step.to, step.from);
        if (tr) {
          emitirFotonGas(this.x, this.y, tr.wl);
          F.emiCount++; F.gasTotal++;
          const k = Math.round(tr.wl);
          F.gasCuentas[k] = (F.gasCuentas[k] || 0) + 1;
          alEvento({ tipo: 'emi', tr, wl: tr.wl, de: step.from, a: step.to, gas: true });
        }
        this.level = step.to;
        this.glowTimer = 40;
        if (this.cascadePath.length > 0) this.cascadeTimer = 120;
        else { this.cascadeTimer = 0; this.cooldown = 120; }
      }
    }
  }
}
class ElectronGas {
  constructor(x, y, energy) {
    Object.assign(this, { x, y, energy, done: false, trail: [] });
    this.vx = map(energy, 1, 8, 3, 9);
    this.vy = random(-0.8, 0.8);
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 6) this.trail.shift();
    this.x += this.vx; this.y += this.vy;
    if (this.x > 190) { this.done = true; return; }          // llega al ánodo
    if (this.y < -175 || this.y > 175) this.vy *= -1;
  }
}

// ─── AYUDAS ──────────────────────────────────────────────────────
function findTransition(atom, from, to) {
  return atom.transitions.find(t => (t.from === from && t.to === to) || (t.from === to && t.to === from));
}
// Nivel al que baja el electrón: uno inferior al azar, solo entre los que tienen
// transición (en el sodio, desde 3d no se puede ir a 3s).
function nivelInferiorAleatorio(current) {
  const opciones = [];
  for (let lv = 0; lv < current; lv++) if (findTransition(F.atom, lv, current)) opciones.push(lv);
  return opciones.length ? random(opciones) : floor(random(current));
}
function sumarRaya(arr, wl) {
  if (!esVisible(wl)) return;
  const idx = Math.round(wl - 380);
  arr[idx] = Math.min(1, arr[idx] + 0.6);
  if (idx > 0) arr[idx - 1] = Math.min(1, arr[idx - 1] + 0.25);
  if (idx < 400) arr[idx + 1] = Math.min(1, arr[idx + 1] + 0.25);
}
function sumarExt(wl) {
  if (esVisible(wl)) return;
  const k = Math.round(wl);
  F.extLineas[k] = Math.min(1, (F.extLineas[k] || 0) + 0.7);
  if (k - 3 > 0) F.extLineas[k - 3] = Math.min(1, (F.extLineas[k - 3] || 0) + 0.2);
  if (k + 3 < 9999) F.extLineas[k + 3] = Math.min(1, (F.extLineas[k + 3] || 0) + 0.2);
}
function registrarEmision(wl) {
  if (esVisible(wl)) { sumarRaya(F.espectro, wl); F.brillo[wl] = Math.min(1.4, (F.brillo[wl] || 0) + 0.5); }
  else sumarExt(wl);
}
function emitirFotonAtomo(wl) {
  const a = random(TWO_PI), v = random(3, 5);
  F.fotonesOut.push(new Foton(0, 0, wl, cos(a) * v, sin(a) * v));
  registrarEmision(wl);
  F.emiCount++;
}
function emitirFotonGas(x, y, wl) {
  const a = random(TWO_PI), v = random(2.5, 4.5);
  F.fotonesOut.push(new Foton(x, y, wl, cos(a) * v, sin(a) * v));
  registrarEmision(wl);
}
function saltarA(nivel) {
  F.saltoDesde = { r: F.rElectron, ang: F.angulo, t: F.frames };
  F.nivel = nivel;
}

// ─── REINICIOS ───────────────────────────────────────────────────
function limpiarFisica() {
  Object.assign(F, { nivel: 0, exciteTimer: 0, cascada: [], cascadaT: 0, absCount: 0, emiCount: 0,
    fotonesIn: [], fotonesOut: [], electrones: [], saltoDesde: null, extLineas: {}, brillo: {} });
  F.rElectron = F.atom.radii[0];
  F.espectro.fill(0); F.absorcion.fill(0);
  iniciarGas();
}
function iniciarGas() {
  F.gasAtomos = []; F.gasElectrones = []; F.gasCuentas = {}; F.gasTotal = 0;
  // Separación según la cantidad de gas, para que los átomos dibujados no se
  // monten unos sobre otros (F.gasEsc: tamaño del dibujo de cada átomo)
  const dmin = Math.min(84, 0.85 * Math.sqrt(Math.PI * 160 * 160 / F.densidad));
  F.gasEsc = Math.min(0.2, (dmin - 8) / 2 / 168);
  const rMax = 168 - dmin / 2;
  for (let i = 0; i < F.densidad; i++) {
    let x = 0, y = 0, mejor = null, mejorD = -1;
    for (let intento = 0; intento < 400; intento++) {
      x = random(-rMax, rMax); y = random(-rMax, rMax);
      if (Math.hypot(x, y) > rMax) continue;
      const d = F.gasAtomos.reduce((m, a) => Math.min(m, Math.hypot(a.x - x, a.y - y)), 1e9);
      if (d > mejorD) { mejorD = d; mejor = [x, y]; }
      if (d > dmin) break;
    }
    [x, y] = mejor || [0, 0];
    F.gasAtomos.push(new AtomoGas(x, y, F.atom));
  }
}
function elegirAtomo(clave) {
  if (!ATOMS_DATA[clave]) return;
  F.clave = clave; F.atom = ATOMS_DATA[clave];
  limpiarFisica();
}
function elegirModoFisica(m) { F.modo = m; limpiarFisica(); }

// ─── DISPAROS ────────────────────────────────────────────────────
function dispararFoton() {
  const wl = F.luz === 'white' ? random(380, 780) : F.monoWl;
  const yOff = random(-30, 30);
  const x0 = -200, y0 = yOff * 0.5, dx = -x0, dy = yOff - y0, m = Math.hypot(dx, dy), v = 4.5;
  F.fotonesIn.push(new Foton(x0, y0, wl, dx / m * v, dy / m * v));
}
function dispararElectron() {
  F.electrones.push(new ElectronCanon(-200, random(-20, 20), F.eEnergia));
}

// ─── PASO DE LA FÍSICA ───────────────────────────────────────────
function pasoFisica() {
  if (F.pausa) return;
  F.frames++;
  for (let i = 0; i < 401; i++) { F.espectro[i] *= SPECTRUM_DECAY; F.absorcion[i] *= SPECTRUM_DECAY; }
  for (const k in F.extLineas) { F.extLineas[k] *= SPECTRUM_DECAY; if (F.extLineas[k] < 0.01) delete F.extLineas[k]; }
  for (const k in F.brillo) { F.brillo[k] *= 0.993; if (F.brillo[k] < 0.01) delete F.brillo[k]; }
  if (F.modo === 'gas') pasoGas(); else pasoAtomo();
  for (let i = F.fotonesOut.length - 1; i >= 0; i--) { F.fotonesOut[i].update(); if (F.fotonesOut[i].done) F.fotonesOut.splice(i, 1); }
  if (F.fotonesOut.length > 80) F.fotonesOut.splice(0, F.fotonesOut.length - 80);
}

function pasoAtomo() {
  const A = F.atom;
  F.angulo += 0.018;
  // Salto casi instantáneo (≈ 0,1 s): el electrón no pasa por energías intermedias
  F.rElectron += (A.radii[F.nivel] - F.rElectron) * (MOV_REDUCIDO ? 1 : 0.5);
  const libre = F.nivel === 0 && F.cascada.length === 0;

  if (F.modo === 'fotones') {
    if (!F.fotonUnico) {
      F.spawnT++;
      if (F.spawnT >= [24, 18, 12, 8, 5][F.flujo - 1]) { F.spawnT = 0; dispararFoton(); }
    }
    for (let i = F.fotonesIn.length - 1; i >= 0; i--) {
      const ph = F.fotonesIn[i];
      ph.update();
      const d = Math.hypot(ph.x, ph.y);
      if (!ph.fading && d < A.radii[0] + 12) {
        if (F.nivel === 0 && F.cascada.length === 0) { if (!intentarAbsorber(ph)) ph.probado = true; }
      }
      // Ha cruzado el átomo sin que se lo quede (aunque el átomo estaba libre)
      if (ph.probado && !ph.avisado && !ph.fading && ph.x > A.radii[0] + 12) {
        ph.avisado = true;
        alEvento({ tipo: 'pasa', wl: ph.wl });
      }
      if (ph.done) F.fotonesIn.splice(i, 1);
    }
  } else {
    if (!F.eUnico) {
      F.eSpawnT++;
      if (F.eSpawnT >= [30, 22, 14, 9, 5][F.eFrec - 1]) { F.eSpawnT = 0; dispararElectron(); }
    }
    for (let i = F.electrones.length - 1; i >= 0; i--) {
      const e = F.electrones[i];
      e.update();
      if (!e.collided && libre && Math.hypot(e.x, e.y) < A.radii[0] + 10) chocar(e);
      if (e.done) F.electrones.splice(i, 1);
    }
  }

  if (F.exciteTimer > 0 && F.nivel > 0) { F.exciteTimer--; if (F.exciteTimer === 0) desexcitar(); }
  pasoCascada();
}

function intentarAbsorber(ph) {
  const A = F.atom;
  for (const tr of A.transitions) {
    if (tr.from !== F.nivel) continue;
    // Con luz de un solo color solo se absorbe la λ justa (1 nm de margen para
    // alcanzar las líneas impares con el deslizador de 2 en 2). Con luz blanca
    // el margen es mayor para que las rayas oscuras aparezcan en un tiempo de clase.
    const tol = F.luz === 'white' ? 18 : 2;
    if (Math.abs(ph.wl - tr.wl) < tol && esVisible(tr.wl)) {
      ph.fading = true;
      sumarRaya(F.absorcion, tr.wl);
      saltarA(tr.to);
      F.exciteTimer = floor(random(80, 160));
      F.absCount++;
      alEvento({ tipo: 'abs', tr, wl: tr.wl, de: tr.from, a: tr.to });
      return true;
    }
  }
  return false;
}

function chocar(e) {
  const A = F.atom;
  let mejor = -1, mejorDE = 0;
  for (let lv = 1; lv < A.levels; lv++) {
    const needed = A.energies[lv] - A.energies[F.nivel];
    if (needed > 0 && e.energy >= needed && needed > mejorDE) { mejor = lv; mejorDE = needed; }
  }
  e.collided = true;
  if (mejor >= 0) {
    const de = F.nivel, llega = e.energy;
    saltarA(mejor);
    F.exciteTimer = floor(random(80, 160));
    F.absCount++;
    // Sigue con la energía que le sobra (más lento)
    e.energy = Math.max(0, llega - mejorDE);
    e.vx = Math.max(1.2, map(e.energy, 0, 6, 1.2, 8));
    e.vy = random(-1.2, 1.2);
    alEvento({ tipo: 'exc', tr: findTransition(A, de, mejor), de, a: mejor, dE: mejorDE, llega, resto: e.energy });
  } else {
    // Choque elástico: no le alcanza para ningún salto y rebota con la misma energía
    const v = Math.hypot(e.vx, e.vy), ang = random(-2.4, 2.4);
    e.vx = v * cos(ang); e.vy = v * sin(ang);
    alEvento({ tipo: 'elastico', llega: e.energy, minimo: A.energies[1] - A.energies[0] });
  }
}

// Cascada de desexcitación: 2 s en cada nivel antes de cada emisión
function desexcitar() {
  if (F.nivel === 0) return;
  F.cascada = [];
  let current = F.nivel;
  while (current > 0) { const to = nivelInferiorAleatorio(current); F.cascada.push({ from: current, to }); current = to; }
  F.cascadaT = 120;
}
function pasoCascada() {
  if (F.cascada.length === 0) return;
  F.cascadaT--;
  if (F.cascadaT > 0) return;
  const step = F.cascada.shift();
  const tr = findTransition(F.atom, step.to, step.from);
  saltarA(step.to);
  if (tr) {
    emitirFotonAtomo(tr.wl);
    alEvento({ tipo: 'emi', tr, wl: tr.wl, de: step.from, a: step.to });
  }
  F.cascadaT = F.cascada.length > 0 ? 120 : 0;
}

function pasoGas() {
  F.gasT++;
  if (F.gasT >= floor(map(F.voltaje, 1, 8, 40, 10))) {
    F.gasT = 0;
    F.gasElectrones.push(new ElectronGas(-190, random(-165, 165), F.voltaje));
  }
  for (let i = F.gasElectrones.length - 1; i >= 0; i--) {
    const e = F.gasElectrones[i];
    e.update();
    for (const a of F.gasAtomos) {
      if (a.level === 0 && a.cooldown <= 0 && Math.hypot(e.x - a.x, e.y - a.y) < 18) { excitarGas(e, a); break; }
    }
    if (e.done) F.gasElectrones.splice(i, 1);
  }
  if (F.gasElectrones.length > 30) F.gasElectrones.shift();
  for (const a of F.gasAtomos) a.update();
}
function excitarGas(e, a) {
  const A = F.atom;
  let mejor = -1, mejorDE = 0;
  for (let lv = 1; lv < A.levels; lv++) {
    const needed = A.energies[lv];
    if (e.energy >= needed && needed > mejorDE) { mejor = lv; mejorDE = needed; }
  }
  if (mejor >= 0 && random() < 0.4) {
    a.excite(mejor);
    e.vx = Math.max(1, e.vx * 0.6);      // frena, pero sigue hacia el ánodo
    e.vy += random(-1, 1);
  }
}
