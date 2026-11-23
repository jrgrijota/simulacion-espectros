// ═══════════════════════════════════════════════════════════════════
//  ESCENA DE «ESPECTROS ATÓMICOS»
//
//  Una sola escena (retícula A de la guía de diseño v2):
//   · columna 1: el experimento de cada modo (lámpara → ampolla → prisma;
//     cañón de electrones → ampolla → prisma; tubo de descarga → prisma)
//     y, debajo, los mandos HTML;
//   · columna 2: el modelo de Bohr (un átomo, o los átomos del gas);
//   · columna 3: el panel de estado con la escalera de niveles;
//   · abajo: el espectroscopio (absorción de frente y emisión de lado).
//  Los objetos se dibujan en las coordenadas del boceto aprobado
//  (/capturas/escena-espectros/boceto.html, 400 · 330) y se colocan con OBJ.
//  La física está en js/fisica.js; los retos y el álbum en js/retos.js.
// ═══════════════════════════════════════════════════════════════════

let CV_W = 1330, CV_H = 680;
let ESC_MOVIL = null;
let OBJ, MANDOS, MODELO, PANEL, ESPEC, TARJETAS, ROT_MODELO, LEYENDA;

// Colores propios (objetos reales: fijos; lo de alrededor sigue al tema)
const COL = {
    metal1: '#2f4558', metal2: '#46627a', metal3: '#8fa9be', vidrio: '#d8efff', tapon: '#3a2a22',
    electron: '#5fd4ff', filamento: '#ff9a3c', piloto: '#34e3a8', cableRojo: '#c0392b', ventana: '#05080c',
    gris: '#9fb9cc',
};
const TEMA_PROPIO = {
    pizarra:   { rotuloObj: '#b5d3ec', rotuloBase: '#e3edf5', orbita: '#7f97ad', orbitaAct: '#e8f4ff', nivelTxt: '#b5d3ec' },
    dia:       { rotuloObj: '#3f5f7a', rotuloBase: '#e3edf5', orbita: '#5b7a95', orbitaAct: '#13304a', nivelTxt: '#3f5f7a' },
    marca:     { rotuloObj: '#64748b', rotuloBase: '#e3edf5', orbita: '#94a3b8', orbitaAct: '#1e293b', nivelTxt: '#475569', ink: '#1e293b' },
    contraste: { rotuloObj: '#ffffff', rotuloBase: '#ffffff', orbita: '#bbbbbb', orbitaAct: '#ffffff', nivelTxt: '#ffffff', ink: '#000000' },
};
const tinta = () => THEME.ink || '#071a2b';
const fmt = (x, d) => i18n.num(x, d);
const $ = (id) => document.getElementById(id);
const nombreDe = (a) => i18n.t(a.name.toLowerCase());
// Nombre del elemento con sus formas para las frases: {nombre} (hidrógeno),
// {el} (el hidrógeno), {del} (del hidrógeno), {X} y {DEL} en mayúsculas.
// En español las frases usan «el {nombre}»; otros idiomas usan {el} y {del}
// (en catalán «de l'hidrogen», en gallego «do hidróxeno», en euskera «hidrogenoaren»…)
function nombres(a) {
    const b = a.name.toLowerCase(), n = i18n.t(b), del = i18n.t('del ' + b);
    return { nombre: n, el: i18n.t('el ' + b), del, X: n.toUpperCase(), DEL: del.toUpperCase() };
}

// ── Composición ──────────────────────────────────────────────────
function altoMandos() {
    const el = document.querySelector('.mandos-exp');
    const u = parseFloat(getComputedStyle($('escena')).getPropertyValue('--u')) || 1;
    return el ? el.offsetHeight / u : 180;
}
function calcularEscena() {
    const movil = esMovil();
    const cambia = movil !== ESC_MOVIL;
    ESC_MOVIL = movil;
    const hM = altoMandos();
    if (!movil) {
        CV_W = 1330; CV_H = 680;
        TARJETAS = [{ x: 0, y: 0, w: 1330, h: 540 }];
        MANDOS = { x: 42, y: Math.min(340, 526 - hM), w: 360 };
        // Si los mandos suben (luz de un color con flujo), el aparato encoge para no taparse
        const sObj = Math.max(0.8, Math.min(0.95, (MANDOS.y - 12 - 4) / 384));
        OBJ = { tx: 22 + (0.95 - sObj) * 200, ty: 4, s: sObj };
        MODELO = { cx: 662, cy: 232, r: 182 };
        ROT_MODELO = { x: 474, y: 434, w: 376 };
        LEYENDA = { x: 490, y: 496 };
        PANEL = { x: 902, y: 30, w: 400, h: 480, compacto: false };
        ESPEC = { x: 0, y: 552, w: 1330, h: 128 };
    } else {
        CV_W = 370;
        OBJ = { tx: 4, ty: 10, s: 0.9 };
        MANDOS = { x: 18, y: 300, w: 334 };
        const hA = MANDOS.y + hM + 16;
        TARJETAS = [{ x: 0, y: 0, w: 370, h: hA }];
        ESPEC = { x: 0, y: hA + 16, w: 370, h: 190 };
        PANEL = { x: 0, y: ESPEC.y + ESPEC.h + 16, w: 370, h: 470, compacto: true };
        const r = 170;
        MODELO = { cx: 185, cy: PANEL.y + PANEL.h + 16 + r, r };
        ROT_MODELO = { x: 20, y: MODELO.cy + r + 14, w: 330 };
        LEYENDA = { x: 14, y: ROT_MODELO.y + 66 };
        CV_H = LEYENDA.y + 40;
    }
    colocarMandos();
    return cambia;
}
function colocarMandos() {
    colocarSobreLienzo(document.querySelector('.mandos-exp'), MANDOS, CV_W, CV_H);
    colocarSobreLienzo($('btn-saltos'), { x: PANEL.x + PANEL.w - 24 - 124, y: PANEL.y + PANEL.h - 42, w: 124 }, CV_W, CV_H);
}
function ajustarEscena(cv) { encajarEscena(cv, CV_W, CV_H, ESC_MOVIL); }
function fitCanvas() {
    const cv = document.querySelector('#canvas-container canvas');
    if (!cv) return;
    ajustarEscena(cv);
    const d = densidadAdecuada(cv);
    if (Math.abs(d - pixelDensity()) > 0.01) { pixelDensity(d); ajustarEscena(cv); }
}
let topeDensidad = 2;
function densidadAdecuada(cv) {
    const visto = cv.getBoundingClientRect().width / CV_W * displayDensity();
    return constrain(Math.ceil(visto * 4) / 4, 1, topeDensidad);
}
let fpsMarca = { t: 0, f: 0 };
function vigilarRendimiento() {
    const ahora = performance.now();
    if (!fpsMarca.t) { fpsMarca = { t: ahora, f: frameCount }; return; }
    if (ahora - fpsMarca.t < 3000) return;
    if (ahora - fpsMarca.t > 4500) { fpsMarca = { t: ahora, f: frameCount }; return; }
    const fps = (frameCount - fpsMarca.f) * 1000 / (ahora - fpsMarca.t);
    fpsMarca = { t: ahora, f: frameCount };
    if (document.hidden || fps >= 40 || pixelDensity() <= 1) return;
    topeDensidad = Math.max(1, pixelDensity() - 0.25);
    fitCanvas();
}
function rehacerComposicion() {
    if (typeof width === 'undefined') return;
    const w0 = CV_W, h0 = CV_H;
    calcularEscena();
    if (w0 !== CV_W || h0 !== CV_H) resizeCanvas(CV_W, CV_H);
    fitCanvas();
}
function windowResized() {
    if (calcularEscena()) resizeCanvas(CV_W, CV_H);
    else resizeCanvas(CV_W, CV_H);
    fitCanvas();
}

// ═══════════════════ EVENTOS, MENSAJES Y CELEBRACIONES ═══════════════
let ultimo = null;                 // último evento de la física { tipo, …, t (fotogramas) }
let ultimoSalto = null;            // último salto (para la flecha de la escalera)
let rayaNueva = null;              // { wl, t (millis) }
let CELEB = null;                  // { titulo, sub, tag, txt, t0, wl, doble }
let rayasSesion = new Set();       // rayas ya vistas desde que se limpió
const celebrados = new Set();      // una vez por sesión cada celebración
let misterio = null;               // { clave, racha } mientras dura el reto del gas misterioso
let respuesta = null;              // { ok, nombres, t } tras contestar en el gas misterioso
let cienCuenta = 0, cienWl = null; // reto: 100 fotones seguidos sin absorber

const DURA_CELEB = 3500, DURA_EVENTO = 180;
function celebrar(c) {
    if (celebrados.has(c.clave)) return;
    celebrados.add(c.clave);
    CELEB = Object.assign({ t0: millis() }, c);
}
const celebrando = () => CELEB && millis() - CELEB.t0 < DURA_CELEB;

alEvento = function (ev) {
    ev.t = F.frames;
    const A = F.atom;
    if (ev.tipo !== 'pasa' || F.luz === 'mono') ultimo = ev;
    if (ev.tipo === 'abs' || ev.tipo === 'emi' || ev.tipo === 'exc') ultimoSalto = ev;

    if (ev.tipo === 'emi') {
        if (!rayasSesion.has(ev.wl)) {
            rayasSesion.add(ev.wl);
            rayaNueva = { wl: ev.wl, de: ev.de, a: ev.a, t: millis() };
        }
        retosEmite(F.clave, ev.wl);
        // ¡COINCIDEN!: la raya emitida cae donde la luz que atraviesa tiene su raya oscura
        if (F.modo === 'fotones' && esVisible(ev.wl) && F.absorcion[Math.round(ev.wl - 380)] > 0.15) {
            celebrar({ clave: 'coinciden-' + F.clave + '-' + ev.wl, tag: i18n.t('¡COINCIDEN!'), titulo: i18n.t('¡COINCIDEN!'),
                sub: i18n.t('{wl} nm: falta arriba, sale abajo', { wl: ev.wl }), wl: ev.wl, doble: true,
                txt: i18n.t('Baja de <strong>{de} a {a}</strong> y emite <strong>{wl} nm</strong>, justo el color que faltaba arriba. El fotón sale hacia cualquier lado: el átomo absorbe y emite los mismos colores.',
                    { de: A.levelLabels[ev.de], a: A.levelLabels[ev.a], wl: ev.wl }) });
        }
        // Huella: ya han salido todas las rayas visibles del modelo (tubo de gas)
        if (F.modo === 'gas' && !misterio) {
            const todas = RAYAS_VISIBLES(A);
            if (todas.every(w => rayasSesion.has(w))) {
                const n = todas.length;
                celebrar({ clave: 'huella-' + F.clave, tag: i18n.t('HUELLA'), titulo: i18n.t('¡HUELLA DEL {X}!', nombres(A)),
                    sub: n === 1 ? i18n.t('su raya visible') : i18n.t('sus {n} rayas visibles', { n }), wl: ev.wl,
                    txt: i18n.t('Ya han salido todas las rayas visibles del {nombre} en este modelo: <strong>{lista} nm</strong>. Ningún otro elemento tiene esta huella.',
                        Object.assign(nombres(A), { lista: todas.slice().sort((a, b) => a - b).join(' · ') })) });
            }
        }
    }
    if (ev.tipo === 'abs') { if (F.luz === 'mono') retosAbsorbe(F.clave, ev.wl); cienCuenta = 0; }
    if (ev.tipo === 'pasa' && F.luz === 'mono' && F.clave === 'hidrogeno') {
        if (cienWl !== F.monoWl) { cienWl = F.monoWl; cienCuenta = 0; }
        cienCuenta++;
        retosCien(cienCuenta);
    }
    if (ev.tipo === 'exc') {
        retosExcita(F.clave, ev.llega);
        if (ev.resto <= 0.3 + 1e-9) {
            celebrar({ clave: 'salta-' + F.clave, tag: i18n.t('¡SALTA!'), titulo: i18n.t('¡SALTA!'),
                sub: i18n.t('{dE} eV bastan', { dE: fmt(ev.dE, 2) }),
                txt: i18n.t('Con {llega} eV apenas sobra nada: <strong>{dE} eV</strong> es lo mínimo para subir de {de} a {a}. Un fotón tendría que traer justo esa energía; un electrón, al menos esa.',
                    { llega: fmt(ev.llega, 1), dE: fmt(ev.dE, 2), de: A.levelLabels[ev.de], a: A.levelLabels[ev.a] }) });
        }
    }
};

// Color de la raya para escribir encima del panel: los violetas y azules
// oscuros se aclaran para que se lean (en temas claros, se oscurecen)
function colorTexto(wl) {
    const c = colorWl(wl), lum = 0.299 * red(c) + 0.587 * green(c) + 0.114 * blue(c);
    const f = color(THEME.pillBg || THEME.panelBg), fondoOscuro = 0.299 * red(f) + 0.587 * green(f) + 0.114 * blue(f) < 128;
    if (fondoOscuro && lum < 150) return lerpColor(c, color(255), 0.45);
    if (!fondoOscuro && lum > 120) return lerpColor(c, color(0), 0.35);
    return c;
}
function colorWl(wl) { return esVisible(wl) ? wlColor(wl) : color(COL.gris); }
function mensaje() {
    const A = F.atom, ahora = millis();
    const reciente = ultimo && F.frames - ultimo.t < DURA_EVENTO;
    if (respuesta && ahora - respuesta.t < 4000) {
        return respuesta.ok
            ? { tag: i18n.t('¡ACIERTO!'), col: THEME.liquid, txt: i18n.t('Era el {nombre}. Racha: <strong>{r} de 3</strong>. Ahí va otro gas misterioso.', Object.assign({}, respuesta.nombres, { r: misterio ? misterio.racha : 3 })) }
            : { tag: i18n.t('NO ERA ESE'), col: THEME.heat, txt: i18n.t('Era el {nombre}. La racha vuelve a 0. Compara las rayas con las del álbum… ahí va otro.', respuesta.nombres) };
    }
    if (celebrando()) return { tag: CELEB.tag, col: THEME.change, txt: CELEB.txt };
    if (rayaNueva && ahora - rayaNueva.t < 3000 && F.modo === 'gas') {
        const tr = findTransition(A, rayaNueva.de, rayaNueva.a);
        return { tag: i18n.t('RAYA NUEVA · {wl} nm', { wl: rayaNueva.wl }), col: colorWl(rayaNueva.wl),
            txt: i18n.t('Sale por primera vez la raya de <strong>{wl} nm</strong>: el salto de {de} a {a} ({dE} eV).',
                { wl: rayaNueva.wl, de: A.levelLabels[rayaNueva.de], a: A.levelLabels[rayaNueva.a], dE: fmt(A.energies[rayaNueva.de] - A.energies[rayaNueva.a], 2) }) + (tr && !tr.visible ? ' ' + i18n.t('Es infrarroja: no se ve.') : '') };
    }
    if (reciente) {
        const ev = ultimo, dE = ev.de != null ? Math.abs(A.energies[ev.a] - A.energies[ev.de]) : 0;
        if (ev.tipo === 'abs') return { tag: i18n.t('ABSORBE {wl} nm', { wl: ev.wl }), col: colorWl(ev.wl),
            txt: i18n.t('El fotón lleva justo la energía del salto de <strong>{de} a {a}</strong> ({dE} eV): el átomo se lo queda y el electrón sube.', { de: A.levelLabels[ev.de], a: A.levelLabels[ev.a], dE: fmt(dE, 2) }) };
        if (ev.tipo === 'emi' && F.modo !== 'gas') return esVisible(ev.wl)
            ? { tag: i18n.t('EMITE {wl} nm', { wl: ev.wl }), col: colorWl(ev.wl),
                txt: i18n.t('Baja de <strong>{de} a {a}</strong> y suelta un fotón de {wl} nm ({dE} eV) hacia cualquier lado.', { de: A.levelLabels[ev.de], a: A.levelLabels[ev.a], wl: ev.wl, dE: fmt(dE, 2) }) }
            : { tag: i18n.t('EMITE {wl} nm · IR', { wl: ev.wl }), col: color(COL.gris),
                txt: i18n.t('Baja de <strong>{de} a {a}</strong> y suelta un fotón infrarrojo de {wl} nm: no se ve, pero el espectroscopio lo marca en la caja IR.', { de: A.levelLabels[ev.de], a: A.levelLabels[ev.a], wl: ev.wl }) };
        if (ev.tipo === 'exc') return { tag: i18n.t('EXCITADO'), col: COL.electron,
            txt: i18n.t('El electrón llega con <strong>{llega} eV</strong> y cede {dE} eV: lo que cuesta subir de {de} a {a}. Sigue con {resto} eV.',
                { llega: fmt(ev.llega, 1), dE: fmt(ev.dE, 2), de: A.levelLabels[ev.de], a: A.levelLabels[ev.a], resto: fmt(ev.resto, 1) }) };
        if (ev.tipo === 'elastico') return { tag: i18n.t('CHOQUE SIN SALTO'), col: color(COL.gris),
            txt: i18n.t('Con {llega} eV no llega al primer salto ({min} eV): rebota con la misma energía y el átomo no cambia.', { llega: fmt(ev.llega, 1), min: fmt(ev.minimo, 2) }) };
        if (ev.tipo === 'pasa') return { tag: i18n.t('PASA DE LARGO'), col: color(COL.gris),
            txt: i18n.t('Un fotón de {wl} nm lleva {e} eV y ningún salto del átomo cuesta eso: sigue sin cambiar.', { wl: ev.wl, e: fmt(energiaFoton(ev.wl), 2) }) };
    }
    if (F.modo === 'gas') {
        const minimo = A.energies[1];
        if (F.voltaje < minimo) return { tag: i18n.t('SIN LUZ'), col: color(COL.gris),
            txt: i18n.t('Los electrones llevan {e} eV y el primer salto cuesta {min} eV: hay corriente, pero ningún átomo se excita y el gas no brilla.', { e: fmt(F.voltaje, 1), min: fmt(minimo, 2) }) };
        return { tag: i18n.t('BRILLA'), col: misterio ? THEME.change : A.lampara,
            txt: i18n.t('Los electrones chocan con los átomos y los excitan; al bajar, emiten luz. El prisma la separa en las rayas de este elemento.') };
    }
    if (F.nivel > 0) return { tag: i18n.t('EXCITADO'), col: COL.electron,
        txt: i18n.t('El electrón está en <strong>{nivel}</strong>. No se queda ahí: enseguida bajará y soltará la energía como luz.', { nivel: A.levelLabels[F.nivel] }) };
    if (F.modo === 'fotones') {
        let t = F.luz === 'white'
            ? i18n.t('Llegan fotones de todos los colores. El átomo solo se queda con los que tienen <strong>justo</strong> la energía de un salto.')
            : i18n.t('Llegan fotones de <strong>{wl} nm</strong> ({e} eV). Solo se absorben si esa energía es justo la de un salto del átomo.', { wl: F.monoWl, e: fmt(energiaFoton(F.monoWl), 2) });
        if (F.fotonUnico) t += ' ' + i18n.t('Pulsa «Disparar» o la lámpara.');
        return { tag: i18n.t('EN REPOSO'), col: color(COL.gris), txt: t };
    }
    let t = i18n.t('Dispara electrones de <strong>{e} eV</strong>. Si llevan al menos la energía de un salto, el átomo sube de nivel.', { e: fmt(F.eEnergia, 1) });
    if (F.eUnico) t += ' ' + i18n.t('Pulsa «Disparar» o el cañón.');
    return { tag: i18n.t('EN REPOSO'), col: color(COL.gris), txt: t };
}

// ═════════════════════════ DIBUJO ═════════════════════════════════
function drawEscena() {
    for (const t of TARJETAS) tarjeta(t);
    const p = puntoObjeto();
    if (!ESC_MOVIL) drawCono(p);
    push(); translate(OBJ.tx, OBJ.ty); scale(OBJ.s);
    if (F.modo === 'gas') objetoGas(); else if (F.modo === 'colision') objetoColision(); else objetoFotones();
    pop();
    noFill(); stroke(THEME.accent); strokeWeight(2.5); circle(p.x, p.y, 18);
    drawModelo();
    const m = mensaje();
    drawPanelEstado(m);
    anunciar(m);
    drawEspectroscopio();
    if (celebrando()) {
        if (ESC_MOVIL) sello(CELEB.titulo, CELEB.sub, ESPEC.x + ESPEC.w / 2, ESPEC.y + ESPEC.h - 34, CELEB.t0, true);
        else {
            noStroke(); fill(COL.metal2); rect(10, ESPEC.y + 10, 248, ESPEC.h - 20, 12);
            sello(CELEB.titulo, CELEB.sub, 134, ESPEC.y + 64, CELEB.t0, false);
        }
    }
}

function puntoObjeto() {
    const l = F.modo === 'gas' ? { x: 140, y: 150 } : { x: 200, y: 150 };
    return { x: OBJ.tx + OBJ.s * l.x, y: OBJ.ty + OBJ.s * l.y };
}
function drawCono(p) {
    const { cx, cy, r } = MODELO;
    const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
    if (d <= r) return;
    const th = Math.atan2(dy, dx), a = Math.acos(r / d);
    const c = color(THEME.accent); c.setAlpha(26);
    noStroke(); fill(c);
    triangle(p.x, p.y, cx + r * cos(th + a), cy + r * sin(th + a), cx + r * cos(th - a), cy + r * sin(th - a));
}

// ── Ayudas de dibujo ─────────────────────────────────────────────
function gradLineal(x0, y0, x1, y1, paradas) {
    const g = drawingContext.createLinearGradient(x0, y0, x1, y1);
    paradas.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
}
function metal(x, y, w, h, r, grosor = 3) {
    stroke(tinta()); strokeWeight(grosor); fill(COL.metal2);
    drawingContext.fillStyle = gradLineal(0, y, 0, y + h, [[0, COL.metal3], [0.35, COL.metal2], [1, COL.metal1]]);
    rect(x, y, w, h, r);
}
function foco(x, y, rx, ry) {
    if (!THEME.fun) return;
    const ctx = drawingContext, g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    g.addColorStop(0, 'rgba(45,119,173,0.55)'); g.addColorStop(1, 'rgba(45,119,173,0)');
    ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function textoSis(txt, x, y, fs, col, alin = LEFT, peso = NORMAL, anchoMax = 0) {
    textFont(FUENTE_TEXTO); textSize(fs); textStyle(peso);
    if (anchoMax) { const w = textWidth(txt); if (w > anchoMax) textSize(fs * anchoMax / w); }
    noStroke(); fill(col); textAlign(alin, BASELINE); text(txt, x, y);
    textStyle(NORMAL); fuenteJuego();
}
// Lectura en la cabeza oscura de un aparato (sin marco amarillo)
function lectura(x, y, w, num, uni, fs, sub) {
    stroke(THEME.headEdge || '#9fb9cc'); strokeWeight(2); fill(THEME.headBg || '#0e2238'); rect(x, y, w, 46, 12);
    fuenteJuego(); textStyle(BOLD);
    textSize(fs); let w1 = textWidth(num); textSize(16); const w2 = uni ? textWidth(uni) + 5 : 0;
    let f = fs;
    if (w1 + w2 > w - 14) { f = fs * (w - 14 - w2) / w1; textSize(f); w1 = textWidth(num); }
    const xx = x + w / 2 - (w1 + w2) / 2;
    noStroke(); fill(THEME.headText || '#ffffff'); textAlign(LEFT, BASELINE);
    textSize(f); text(num, xx, y + 33);
    if (uni) { textSize(16); text(uni, xx + w1 + 5, y + 33); }
    textStyle(NORMAL);
    if (sub) textoSis(sub, x + w / 2, y + 64, 12.5, THEME.rotuloObj, CENTER, NORMAL, w + 30);
}
function electronBola(x, y, r, vx = 0, vy = 0, rastro = null) {
    noStroke();
    if (rastro) rastro.forEach((p, i) => { const c = color(COL.electron); c.setAlpha(40 + 120 * i / rastro.length); fill(c); circle(p.x, p.y, r * 0.9); });
    stroke(tinta()); strokeWeight(2); fill(COL.electron); circle(x, y, 2 * r);
    noStroke(); fill(255, 255, 255, 180); circle(x - r * 0.32, y - r * 0.32, r * 0.66);
}
// Fotón como paquete de onda del color de su λ (no como bolita)
function paquete(x, y, ang, wl, len, amp, alfa = 255) {
    push(); translate(x, y); rotate(ang); noFill(); strokeCap(ROUND); strokeJoin(ROUND);
    const curva = () => { beginShape(); for (let i = 0; i <= 24; i++) { const t = i / 24, env = sin(PI * t); vertex((t - 0.5) * len, sin(t * PI * 6) * amp * env); } endShape(); };
    if (!esVisible(wl)) {
        stroke(150, 162, 176, alfa); strokeWeight(2.6); drawingContext.setLineDash([3, 3]); curva(); drawingContext.setLineDash([]);
    } else {
        const ci = color(tinta()); ci.setAlpha(alfa); stroke(ci); strokeWeight(6); curva();
        stroke(wlColor(wl, alfa)); strokeWeight(3.2); curva();
    }
    pop();
}
function lineaDiscontinua(x0, y0, x1, y1, a, b) { drawingContext.setLineDash([a, b]); line(x0, y0, x1, y1); drawingContext.setLineDash([]); }
function aroDiscontinuo(x, y, d, col, w, a, b) { noFill(); stroke(col); strokeWeight(w); drawingContext.setLineDash([a, b]); circle(x, y, d); drawingContext.setLineDash([]); }

// ── Piezas del experimento (coordenadas del boceto) ──────────────
// Prisma de vidrio; la luz sale por la cara derecha y baja hacia el
// espectroscopio. El rojo se desvía menos que el violeta.
function prisma(px, py) {
    const fx = px + 16, fy = py + 2, X0 = px + 22, X1 = px + 66, Yb = 300;
    const xl = (l) => X0 + (X1 - X0) * (780 - l) / 400;
    if (F.modo === 'fotones' && F.luz === 'white') {
        noStroke(); fill(255);
        const paradas = []; for (let l = 700; l >= 420; l -= 35) paradas.push([(700 - l) / 280, wlColor(l).toString()]);
        drawingContext.fillStyle = gradLineal(X0, 0, X1, 0, paradas);
        drawingContext.globalAlpha = 0.85; triangle(fx, fy, X0, Yb, X1, Yb); drawingContext.globalAlpha = 1;
        // rayas oscuras: lo que se queda el gas
        for (let i = 0; i <= 400; i += 1) {
            const a = F.absorcion[i]; if (a < 0.08) continue;
            stroke(5, 8, 12, a * 230); strokeWeight(2); line(fx, fy, xl(380 + i), Yb);
        }
    } else {
        const lineas = F.modo === 'fotones' ? [[F.monoWl, 1]] : Object.entries(F.brillo).map(([w, b]) => [+w, Math.min(1, b)]);
        strokeCap(ROUND);
        for (const [w, b] of lineas) {
            if (!esVisible(w)) continue;
            const ci = color(tinta()); ci.setAlpha(255 * b); stroke(ci); strokeWeight(7); line(fx, fy, xl(w), Yb);
            stroke(wlColor(w, 255 * b)); strokeWeight(4); line(fx, fy, xl(w), Yb);
        }
    }
    stroke(tinta()); strokeWeight(7); strokeJoin(ROUND); fill(255, 255, 255, 40);
    triangle(px, py - 38, px + 38, py + 30, px - 38, py + 30);
    noFill(); stroke(COL.vidrio); strokeWeight(3); triangle(px, py - 38, px + 38, py + 30, px - 38, py + 30);
    stroke(255, 255, 255, 90); strokeWeight(5); strokeCap(ROUND); line(px - 6, py - 22, px - 24, py + 12);
    metal(px - 46, py + 30, 92, 12, 4);
    textoSis(i18n.t('prisma'), px - 10, py + 62, 12.5, THEME.rotuloObj, CENTER);
}
function ampolla(cx, cy) {
    metal(cx + 70, cy - 92, 10, 230, 4);
    metal(cx - 4, cy - 92, 88, 14, 5);
    stroke(tinta()); strokeWeight(3); fill(COL.tapon); rect(cx - 16, cy - 100, 32, 30, 6);
    stroke(tinta()); strokeWeight(9); line(cx - 12, cy - 72, cx - 12, cy - 52); line(cx + 12, cy - 72, cx + 12, cy - 52);
    // velo: el gas no se ve
    noStroke(); fill(255, 255, 255, 36); circle(cx, cy, 116); rect(cx - 12, cy - 72, 24, 22);
    const contorno = () => { beginShape(); vertex(cx - 12, cy - 70); vertex(cx - 12, cy - 55);
        const a0 = Math.atan2(-55, -12), a1 = Math.atan2(-55, 12) + TWO_PI;
        for (let a = a0; a >= a1 - TWO_PI; a -= 0.08) vertex(cx + 58 * Math.cos(a), cy + 58 * Math.sin(a));
        vertex(cx + 12, cy - 55); vertex(cx + 12, cy - 70); endShape(); };
    noFill(); strokeJoin(ROUND); stroke(tinta()); strokeWeight(8); contorno(); stroke(COL.vidrio); strokeWeight(3); contorno();
    stroke(255, 255, 255, 85); strokeWeight(6); strokeCap(ROUND); noFill();
    arc(cx, cy, 88, 88, radians(200), radians(250));
    push(); translate(cx + 32, cy + 27); rotate(radians(-35)); noStroke(); fill(255, 255, 255, 72); rect(-4, -9, 8, 18, 4); pop();
    metal(cx + 40, cy + 136, 70, 12, 5);
}
function lampara(x, y, colLuz) {
    metal(x, y, 74, 78, 12, 3.5);
    noStroke(); const ci = color(tinta()); ci.setAlpha(140); fill(ci);
    for (let i = 0; i < 4; i++) rect(x + 12, y + 14 + i * 12, 34, 5, 2.5);
    stroke(tinta()); strokeWeight(3); fill(COL.metal2); rect(x + 64, y + 18, 20, 42, 6);
    strokeWeight(2.5); fill(colLuz); ellipse(x + 84, y + 39, 12, 32);
    metal(x + 18, y + 78, 38, 56, 0);
    metal(x - 6, y + 134, 88, 12, 5);
}
// Paquetes que viajan por un haz (decorativo: el haz lleva luz)
function paquetesHaz(x0, y0, x1, y1, colores) {
    if (F.pausa && false) return;
    const n = 2, L = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0);
    for (let i = 0; i < n; i++) {
        const t = ((F.frames * 1.6 + i * L / n) % L) / L;
        const wl = colores[(Math.floor(F.frames * 1.6 / L) + i) % colores.length];
        paquete(lerp(x0, x1, t), lerp(y0, y1, t), ang, wl, 22, 3.2);
    }
}
function rotuloObjeto(l1, l2) {
    textoSis(l1, 10, 18, 13, THEME.rotuloObj, LEFT, NORMAL, 380);
    textoSis(l2, 10, 36, 13, THEME.rotuloObj, LEFT, NORMAL, 380);
}
function nombreGas() { return misterio ? i18n.t('un gas misterioso') : nombreDe(F.atom); }

function objetoFotones() {
    foco(200, 150, 170, 170);
    const blanca = F.luz === 'white';
    rotuloObjeto(i18n.t(blanca ? 'luz blanca → ampolla con {gas}' : 'luz de un solo color → ampolla con {gas}', { gas: nombreGas() }), i18n.t('→ prisma → espectroscopio'));
    const cHaz = blanca ? color(255, 255, 255, 115) : wlColor(F.monoWl, 115);
    noStroke(); fill(cHaz); rect(96, 141, 70, 16);
    quad(256, 143, 318, 128, 318, 140, 256, 157);
    lampara(10, 110, blanca ? '#ffffff' : wlColor(F.monoWl));
    ampolla(200, 150);
    prisma(330, 130);
    const cols = blanca ? [656, 520, 450, 580, 410, 600] : [F.monoWl];
    if (!F.fotonUnico || F.fotonesIn.length) { paquetesHaz(100, 149, 160, 149, cols); paquetesHaz(262, 149, 312, 135, cols); }
    lectura(2, 52, 96, blanca ? i18n.t('Blanca') : String(F.monoWl), blanca ? '' : 'nm', blanca ? 22 : 26);
    textoSis(i18n.t('▢ gas: en realidad es invisible'), 124, 232, 12, THEME.rotuloObj, LEFT, NORMAL, 200);
}
function objetoColision() {
    foco(200, 150, 170, 170);
    rotuloObjeto(i18n.t('cañón de electrones → ampolla con {gas}', { gas: nombreGas() }), i18n.t('→ prisma → espectroscopio'));
    // Cañón: tubo metálico con el filamento que se ve por la ventana y dos rejillas
    metal(8, 128, 104, 44, 10, 3.5);
    stroke(tinta()); strokeWeight(2.5); fill('#1b1410'); rect(22, 138, 34, 24, 6);
    noFill(); stroke(COL.filamento); strokeWeight(3);
    beginShape(); for (let i = 0; i <= 24; i++) vertex(26 + i, 150 - 4 * Math.abs(Math.sin(i / 8 * PI))); endShape();
    stroke(tinta()); strokeWeight(2); fill(COL.metal3); rect(74, 134, 8, 32, 2); rect(92, 134, 8, 32, 2);
    metal(40, 172, 34, 48, 0); metal(14, 220, 88, 12, 5);
    textoSis(i18n.t('filamento y rejilla'), 60, 248, 12, THEME.rotuloObj, CENTER);
    if (F.electrones.some(e => !e.collided)) for (let i = 0; i < 3; i++) electronBola(118 + ((F.frames * 2 + i * 13) % 38), 150, 4.5);
    ampolla(200, 150);
    prisma(330, 130);
    lectura(14, 62, 92, fmt(F.eEnergia, 1), 'eV', 26);
    textoSis(i18n.t('▢ gas: en realidad es invisible'), 124, 232, 12, THEME.rotuloObj, LEFT, NORMAL, 200);
}
// Color del tubo encendido: la mezcla de las rayas que está emitiendo
function luzTubo() {
    let r = 0, g = 0, b = 0, s = 0;
    for (const [w, k] of Object.entries(F.brillo)) {
        const wl = +w; if (!esVisible(wl)) continue;
        const [cr, cg, cb] = wlToRGB(wl); r += cr * k; g += cg * k; b += cb * k; s += k;
    }
    if (s < 0.02) return null;
    const m = Math.max(r, g, b) || 1;
    return { col: color(r / m * 255, g / m * 255, b / m * 255), a: Math.min(1, s / 1.2) };
}
function objetoGas() {
    foco(150, 150, 170, 170);
    rotuloObjeto(i18n.t('tubo de descarga con {gas}', { gas: nombreGas() }), i18n.t('→ prisma → espectroscopio'));
    // Fuente de alimentación
    stroke(tinta()); strokeWeight(3.5); fill(COL.metal1); rect(24, 262, 250, 52, 14);
    noStroke(); fill(COL.metal2); rect(24, 262, 250, 12, 6);
    stroke(tinta()); strokeWeight(2); fill(COL.piloto); circle(48, 292, 12);
    textoSis(i18n.t('Fuente · encendida'), 160, 297, 14, THEME.rotuloBase, CENTER, NORMAL, 200);
    // Soportes y cables
    metal(196, 54, 10, 210, 4); metal(150, 66, 56, 12, 5); metal(150, 232, 56, 12, 5);
    noFill(); stroke(COL.cableRojo); strokeWeight(4); bezier(112, 70, 70, 70, 70, 262, 90, 262);
    stroke(tinta()); bezier(112, 240, 90, 240, 100, 262, 110, 262);
    const luz = luzTubo();
    // Halo: la luz que sale del tubo (esto sí se ve)
    if (luz) {
        const ctx = drawingContext, gr = ctx.createRadialGradient(140, 155, 0, 140, 155, 120);
        const c = luz.col, rgba = (al) => `rgba(${red(c)},${green(c)},${blue(c)},${al})`;
        gr.addColorStop(0, rgba(0.75 * luz.a)); gr.addColorStop(0.45, rgba(0.25 * luz.a)); gr.addColorStop(1, rgba(0));
        ctx.save(); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(140, 155, 70, 120, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    const tuboForma = () => {
        beginShape(); vertex(128, 46); bezierVertex(110, 46, 110, 100, 128, 104); vertex(134, 112); vertex(134, 196); vertex(128, 204);
        bezierVertex(110, 208, 110, 262, 140, 262); bezierVertex(170, 262, 170, 208, 152, 204); vertex(146, 196); vertex(146, 112); vertex(152, 104);
        bezierVertex(170, 100, 170, 46, 140, 46); endShape(CLOSE);
    };
    stroke(tinta()); strokeWeight(7); fill(255, 255, 255, 36);
    if (luz) { const c = color(luz.col); c.setAlpha(70 * luz.a + 30); fill(c); }
    tuboForma();
    noStroke();
    if (luz) { fill(luz.col); rect(134.5, 108, 11, 92, 5); fill(255, 255, 255, 180 * luz.a); rect(137.5, 110, 5, 88, 2.5); }
    noFill(); stroke(COL.vidrio); strokeWeight(3); tuboForma();
    stroke(tinta()); strokeWeight(2); fill(COL.metal3); rect(137, 54, 6, 34, 2); rect(137, 220, 6, 34, 2);
    noStroke(); fill(255, 255, 255, 90); rect(118, 58, 5, 30, 2.5); rect(118, 222, 5, 30, 2.5);
    textoSis('−', 96, 80, 18, THEME.rotuloObj, CENTER, BOLD); textoSis('+', 96, 246, 18, THEME.rotuloObj, CENTER, BOLD);
    if (luz) { const c = color(luz.col); c.setAlpha(115 * luz.a); noStroke(); fill(c); quad(152, 146, 312, 124, 314, 134, 152, 156); }
    else textoSis(i18n.t('▢ gas: en realidad es invisible'), 176, 232, 12, THEME.rotuloObj, LEFT, NORMAL, 150);
    prisma(330, 130);
    lectura(10, 150, 96, fmt(F.voltaje, 1), 'eV', 26, i18n.t('energía de los e⁻'));
}

// ── Modelo ───────────────────────────────────────────────────────
function drawModelo() {
    const { cx, cy, r } = MODELO, k = r / 182;
    noStroke(); fill(THEME.modelBg); circle(cx, cy, 2 * r);
    push();
    drawingContext.save(); drawingContext.beginPath(); drawingContext.arc(cx, cy, r, 0, Math.PI * 2); drawingContext.clip();
    translate(cx, cy); scale(k);
    if (F.modo === 'gas') modeloGas(); else modeloAtomo();
    drawingContext.restore();
    pop();
    noFill(); stroke(tinta()); strokeWeight(ESC_MOVIL ? 8 : 10); circle(cx, cy, 2 * r);
    stroke(THEME.accent); strokeWeight(3); drawingContext.setLineDash([12, 7]); circle(cx, cy, 2 * r); drawingContext.setLineDash([]);
    // Rótulo del modelo
    const rt = ROT_MODELO;
    stroke(THEME.accent); strokeWeight(2.5); fill(THEME.pillBg || '#0f2c45'); rect(rt.x, rt.y, rt.w, 34, 17);
    fuenteJuego(); textStyle(BOLD); noStroke(); fill(THEME.text); textAlign(CENTER, CENTER);
    let txt = F.modo === 'gas' ? i18n.t('Modelo: así imaginamos los átomos del gas') : i18n.t('Modelo de Bohr: así imaginamos el átomo');
    if (ESC_MOVIL) txt = F.modo === 'gas' ? i18n.t('Modelo de los átomos del gas') : i18n.t('Modelo de Bohr del átomo');
    textSize(16); if (textWidth(txt) > rt.w - 24) textSize(16 * (rt.w - 24) / textWidth(txt));
    text(txt, rt.x + rt.w / 2, rt.y + 17);
    textStyle(NORMAL);
    drawLeyenda(LEYENDA.x, LEYENDA.y);
}
function orbitas(radios, nivelAct, conRotulo, escala = 1) {
    radios.forEach((rr, i) => {
        const act = i === nivelAct;
        noFill(); stroke(act ? THEME.orbitaAct : THEME.orbita); strokeWeight(escala < 1 ? (act ? 2 : 1.2) : (act ? 2.6 : 1.6));
        if (!act) { const c = color(THEME.orbita); c.setAlpha(150); stroke(c); }
        circle(0, 0, 2 * rr * escala);
        // Las órbitas de fuera llevan el rótulo por dentro, para que no lo corte el borde del modelo
        if (conRotulo) { const fuera = rr > 150;
            textoSis(F.atom.levelLabels[i], fuera ? rr * 0.5 : rr * 0.72 + 4, fuera ? -rr * 0.866 + 17 : -rr * 0.72 + 2, 13, act ? THEME.text : THEME.nivelTxt, fuera ? CENTER : LEFT, act ? BOLD : NORMAL); }
    });
}
function nucleo(r, col) {
    stroke(tinta()); strokeWeight(2.5); fill(col); circle(0, 0, 2 * r);
    noStroke(); fill(255, 255, 255, 150); circle(-r * 0.35, -r * 0.35, r * 0.7);
}
function modeloAtomo() {
    const A = F.atom;
    orbitas(A.radii, F.nivel, true);
    // Huella del salto: dónde estaba el electrón y por dónde ha saltado
    const s = F.saltoDesde, edad = s ? F.frames - s.t : 999;
    const ex = Math.cos(F.angulo) * F.rElectron, ey = Math.sin(F.angulo) * F.rElectron;
    if (s && edad < 70) {
        const col = ultimoSalto && ultimoSalto.wl ? colorWl(ultimoSalto.wl) : color(COL.electron);
        const x0 = Math.cos(s.ang) * s.r, y0 = Math.sin(s.ang) * s.r;
        stroke(col); strokeWeight(3.5); lineaDiscontinua(x0, y0, ex, ey, 6, 5);
        aroDiscontinuo(x0, y0, 12, col, 2, 3, 3);
        aroDiscontinuo(ex, ey, 30, THEME.change, 2, 5, 4);
    }
    nucleo(11, A.nucleus);
    electronBola(ex, ey, 7.5);
    for (const ph of F.fotonesIn) paquete(ph.x, ph.y, Math.atan2(ph.vy, ph.vx), ph.wl, 40, 5, ph.alpha);
    for (const ph of F.fotonesOut) paquete(ph.x, ph.y, Math.atan2(ph.vy, ph.vx), ph.wl, 44, 6, ph.alpha);
    for (const e of F.electrones) electronBola(e.x, e.y, 7, e.vx, e.vy, e.trail);
}
function modeloGas() {
    const A = F.atom, esc = F.gasEsc || 0.2;
    for (const a of F.gasAtomos) {
        push(); translate(a.x, a.y);
        orbitas(A.radii, a.level, false, esc);
        nucleo(5, misterio ? '#c8d4e0' : A.nucleus);   // en el gas misterioso, el color no da pistas
        const re = A.radii[a.level] * esc;
        electronBola(Math.cos(a.ang) * re, Math.sin(a.ang) * re, 4.2);
        if (a.glowTimer > 0) aroDiscontinuo(0, 0, 2 * (A.radii[A.levels - 1] * esc + 7), THEME.change, 2, 5, 5);
        pop();
    }
    for (const e of F.gasElectrones) electronBola(e.x, e.y, 5, e.vx, e.vy, e.trail);
    for (const ph of F.fotonesOut) paquete(ph.x, ph.y, Math.atan2(ph.vy, ph.vx), ph.wl, 46, 6, ph.alpha);
    textoSis('−', -172, 6, 20, THEME.nivelTxt, CENTER, BOLD); textoSis('+', 172, 6, 20, THEME.nivelTxt, CENTER, BOLD);
}
function drawLeyenda(x, y) {
    const fs = ESC_MOVIL ? 13 : 13.5, dx = ESC_MOVIL ? 206 : 220;
    paquete(x + 16, y - 5, 0, 500, 28, 4);
    textoSis(i18n.t('fotón (su color es su λ)'), x + 36, y, fs, THEME.text, LEFT, NORMAL, dx - 50);
    electronBola(x + dx, y - 5, 6);
    textoSis(i18n.t('electrón'), x + dx + 12, y, fs, THEME.text, LEFT, NORMAL, 130);
    const y2 = y + 24;
    paquete(x + 16, y2 - 5, 0, 1500, 28, 4);
    textoSis(i18n.t('infrarrojo: no se ve'), x + 36, y2, fs, THEME.text, LEFT, NORMAL, dx - 50);
    aroDiscontinuo(x + dx, y2 - 5, 16, THEME.change, 2, 3, 3);
    textoSis(i18n.t('acaba de saltar'), x + dx + 12, y2, fs, THEME.text, LEFT, NORMAL, 130);
}

// ── Panel de estado con la escalera de niveles ───────────────────
let rotuloTag = '', rotuloDesde = -1e9, mensajeCache = { clave: '' };
function drawPanelEstado(m) {
    const { x, y, w, h, compacto } = PANEL, pad = 24, A = F.atom;
    tarjeta({ x, y, w, h }, THEME.pillBg || THEME.panelBg, 20);
    if (m.tag !== rotuloTag) { rotuloTag = m.tag; rotuloDesde = millis(); }
    fuenteJuego();
    const th = etiquetaRotulo(m.tag, m.col, x + pad, y + 20, compacto ? 15 : 16.5, rotuloDesde).h;
    const fsMsg = compacto ? 17 : 18.5, lead = fsMsg + 7;
    textSize(fsMsg);
    const clave = m.txt + '|' + fsMsg + '|' + w + '|' + textFont();
    if (clave !== mensajeCache.clave) {
        let lineas = partirRico(trozosRicos(m.txt), w - 2 * pad), fs = fsMsg;
        if (lineas.length > 4) { fs = fsMsg - 2; textSize(fs); lineas = partirRico(trozosRicos(m.txt), w - 2 * pad); }
        mensajeCache = { clave, lineas, fs };
    }
    textSize(mensajeCache.fs); noStroke(); fill(THEME.text);
    const yMsg = y + 20 + th + 16;
    textoRico(mensajeCache.lineas.slice(0, 5), x + pad, yMsg, mensajeCache.fs + 7);
    let dy = yMsg + 4 * lead + 2;
    stroke(THEME.border); strokeWeight(1.5); line(x + pad, dy, x + w - pad, dy);
    fuenteJuego(); textStyle(BOLD); textSize(14.5); noStroke(); fill(THEME.text); textAlign(LEFT, BASELINE);
    text(i18n.t('Niveles de energía'), x + pad, dy + 24);
    const wT = textWidth(i18n.t('Niveles de energía')); textStyle(NORMAL);
    textoSis(compacto ? i18n.t('(altura = energía)') : i18n.t('(la altura es energía, no distancia)'), x + pad + wT + 10, dy + 24, 12.5, THEME.textDim, LEFT, NORMAL, w - 2 * pad - wT - 10);
    // Escalera
    const gy0 = dy + 46, gy1 = y + h - 62, Emax = Math.max(...A.energies) * 1.06;
    const lx0 = x + pad + (compacto ? 46 : 56), lx1 = x + pad + (compacto ? 196 : 222);
    const Y = (e) => gy1 - (gy1 - gy0) * e / Emax;
    if (misterio) {
        textoSis(i18n.t('La escalera de este gas se verá al acertar.'), x + w / 2, (gy0 + gy1) / 2, 15, THEME.textDim, CENTER);
    } else {
        const nAct = F.modo === 'gas' ? -1 : F.nivel;
        A.energies.forEach((e, i) => {
            const yy = Y(e), act = i === nAct;
            stroke(act ? THEME.text : THEME.textDim); strokeWeight(act ? 3 : 1.8); line(lx0, yy, lx1, yy);
            textoSis(A.levelLabels[i], lx0 - 10, yy + 5, 13.5, act ? THEME.text : THEME.textDim, RIGHT);
            textoSis(fmt(e, 2) + ' eV', lx1 + 10, yy + 5, 13, THEME.textDim, LEFT);
            if (F.modo === 'colision' && i > 0) {
                const llega = F.eEnergia >= e - A.energies[0] - 1e-9;
                textoSis(llega ? i18n.t('✓ llega') : i18n.t('✗ no llega'), lx1 + (compacto ? 62 : 66), yy + 5, 12.5, llega ? THEME.liquid : THEME.heat, LEFT, BOLD);
            }
        });
        if (F.modo !== 'gas') {
            const s = ultimoSalto;
            if (s && F.frames - s.t < 240 && s.de != null && s.a != null) {
                const col = s.tipo === 'exc' ? color(COL.electron) : colorWl(s.wl), xa = lx0 + 70;
                flechaNivel(xa, Y(A.energies[s.de]), Y(A.energies[s.a]), col);
                const ym = (Y(A.energies[s.de]) + Y(A.energies[s.a])) / 2, dE = Math.abs(A.energies[s.a] - A.energies[s.de]);
                textoSis('ΔE = ' + fmt(dE, 2) + ' eV', xa + 18, ym - (s.wl ? 4 : -5), 14, THEME.text, LEFT, BOLD);
                if (s.wl) textoSis('↔ λ = ' + s.wl + ' nm', xa + 18, ym + 16, 14, esVisible(s.wl) ? colorTexto(s.wl) : THEME.textDim, LEFT, BOLD);
            }
            electronBola(lx0 + (compacto ? 130 : 140), Y(A.energies[F.nivel]), 7);
        } else {
            const vis = A.transitions.filter(t => t.visible);
            vis.forEach((t, j) => {
                const b = Math.min(1, F.brillo[t.wl] || 0); if (b < 0.03) return;
                const c = colorWl(t.wl); c.setAlpha(80 + 175 * b);
                flechaNivel(lx0 + 24 + j * 36, Y(A.energies[t.to]), Y(A.energies[t.from]), c);
            });
        }
    }
    stroke(THEME.border); strokeWeight(1.5); line(x + pad, y + h - 50, x + w - pad, y + h - 50);
    const pie = F.modo === 'gas'
        ? i18n.t('Excitados: <strong>{x} de {n}</strong> · fotones: <strong>{f}</strong>', { x: F.gasAtomos.filter(a => a.level > 0).length, n: F.gasAtomos.length, f: F.gasTotal })
        : i18n.t('Absorbidos: <strong>{a}</strong> · emitidos: <strong>{e}</strong>', { a: F.absCount, e: F.emiCount });
    const anchoPie = w - 2 * pad - 132;
    textFont(FUENTE_TEXTO); textSize(compacto ? 14 : 15); textStyle(BOLD);
    const wPie = textWidth(pie.replace(/<[^>]+>/g, '')); textStyle(NORMAL);
    if (wPie > anchoPie) textSize((compacto ? 14 : 15) * anchoPie / wPie);
    noStroke(); fill(THEME.text);
    textoRico(partirRico(trozosRicos(pie), anchoPie + 4), x + pad, y + h - 34, 18);
    fuenteJuego();
}
function flechaNivel(xa, yDe, yA, col) {
    const sube = yA < yDe, punta = sube ? yA : yA, d = sube ? 1 : -1;
    stroke(tinta()); strokeWeight(7); line(xa, yDe, xa, punta + d * 12);
    stroke(col); strokeWeight(4); line(xa, yDe, xa, punta + d * 12);
    stroke(tinta()); strokeWeight(2); fill(col);
    triangle(xa - 8, punta + d * 14, xa, punta, xa + 8, punta + d * 14);
}

// ── Espectroscopio (tira inferior) ───────────────────────────────
function drawEspectroscopio() {
    const { x, y, w, h } = ESPEC, m = ESC_MOVIL, doble = F.modo === 'fotones';
    if (THEME.fun) { noStroke(); fill(tinta()); rect(x + 4, y + 5, w, h, 16); }
    metal(x, y, w, h, 16, 3);
    let sx, sw, sy, rowH;
    if (m) {
        sx = x + 14; sw = w - 28; sy = y + 46; rowH = doble ? 40 : 56;
        fuenteJuego(); textStyle(BOLD); textSize(17); noStroke(); fill('#ffffff'); textAlign(LEFT, BASELINE); text(i18n.t('Espectroscopio'), x + 16, y + 28); textStyle(NORMAL);
        textoSis(i18n.t('λ en nm'), x + w - 16, y + 28, 12.5, '#dde9f3', RIGHT);
    } else {
        sx = x + 262; sw = w - 262 - 18; sy = y + 14; rowH = doble ? 36 : 72;
        fuenteJuego(); textStyle(BOLD); textSize(20); noStroke(); fill('#ffffff'); textAlign(LEFT, BASELINE); text(i18n.t('Espectroscopio'), x + 20, y + 36); textStyle(NORMAL);
        if (doble) {
            textoSis(i18n.t('arriba, de frente: la luz que'), x + 20, y + 58, 13, '#e3edf5', LEFT, NORMAL, 230);
            textoSis(i18n.t('atraviesa; abajo, de lado: la que emite'), x + 20, y + 76, 13, '#e3edf5', LEFT, NORMAL, 230);
        } else textoSis(F.modo === 'gas' ? i18n.t('la luz del tubo, abierta por el prisma') : i18n.t('la luz de la ampolla, abierta por el prisma'), x + 20, y + 58, 13, '#e3edf5', LEFT, NORMAL, 230);
        textoSis(i18n.t('UV e IR también salen, aunque no se vean'), x + 20, y + 108, 12, '#cfdce8', LEFT, NORMAL, 230);
    }
    const uvW = m ? 0 : 70, irW = m ? 0 : 96, gap = m ? 0 : 8;
    const vx = sx + uvW + gap, vw = sw - uvW - irW - 2 * gap, alto = rowH * (doble ? 2 : 1);
    const X = (l) => vx + vw * (l - 380) / 400;
    noStroke(); fill(tinta()); rect(sx - 4, sy - 4, sw + 8, alto + 8, 10);
    if (!m) {
        fill('#1a1030'); rect(sx, sy, uvW, alto, 6);
        textoSis('UV', sx + uvW / 2, sy + alto / 2 - 2, 14, '#b48cff', CENTER, BOLD);
        textoSis(i18n.t('no se ve'), sx + uvW / 2, sy + alto / 2 + 15, 11, '#9c86c9', CENTER, NORMAL, uvW - 6);
        const ix = vx + vw + gap;
        noStroke(); fill('#2a1208'); rect(ix, sy, irW, alto, 6);
        textoSis('IR', ix + irW / 2, sy + alto / 2 - 2, 14, '#ff9a6a', CENTER, BOLD);
        textoSis(i18n.t('no se ve'), ix + irW / 2, sy + alto / 2 + 15, 11, '#c98a6a', CENTER, NORMAL, irW - 6);
        let fuerte = null;
        for (const [k, v] of Object.entries(F.extLineas)) {
            const l = +k; if (l <= 780 || l > 3000 || v < 0.02) continue;
            const px = ix + 6 + (irW - 12) * (l - 780) / 2220;
            noStroke(); fill(255, 122, 64, 60 * v); rect(px - 2.5, sy + 2, 5, alto - 4);
            fill(255, 122, 64, 235 * v); rect(px - 0.8, sy + 2, 1.6, alto - 4);
            if (v > 0.28 && (!fuerte || v > fuerte.v)) fuerte = { l, v };
        }
        if (fuerte) textoSis(fuerte.l + ' nm', ix + irW / 2, sy + alto - 4, 10.5, '#ffd2bd', CENTER, BOLD);
    }
    if (doble) {
        noStroke(); fill(255);
        const paradas = []; for (let l = 380; l <= 780; l += 20) paradas.push([(l - 380) / 400, wlColor(l).toString()]);
        drawingContext.fillStyle = gradLineal(vx, 0, vx + vw, 0, paradas);
        rect(vx, sy, vw, rowH - 2, 4, 4, 0, 0);
        for (let i = 0; i <= 400; i++) { const a = F.absorcion[i]; if (a < 0.01) continue; fill(5, 8, 12, a * 255); rect(X(380 + i) - 1.4, sy, 2.8, rowH - 2); }
    }
    const yEm = doble ? sy + rowH : sy, hEm = doble ? rowH : rowH;
    noStroke(); fill(COL.ventana); rect(vx, yEm, vw, hEm, doble ? 0 : 4);
    for (let i = 0; i <= 400; i++) {
        const a = F.espectro[i]; if (a < 0.01) continue;
        const px = X(380 + i);
        fill(wlColor(380 + i, a * 70)); rect(px - 2, yEm, 4, hEm);
        fill(wlColor(380 + i, a * 245)); rect(px - 0.8, yEm, 1.6, hEm);
    }
    // Recuento de fotones por raya en el tubo de gas
    if (F.modo === 'gas' && !m) {
        for (const t of F.atom.transitions) {
            if (!t.visible) continue; const n = F.gasCuentas[Math.round(t.wl)] || 0; if (!n) continue;
            textoSis(String(n), X(t.wl) + 6, yEm + 14, 11, '#dfe9f2', LEFT, BOLD);
        }
    }
    if (doble) {
        const et = m ? i18n.t('absorción') : i18n.t('absorción · de frente');
        textSize(12.5); textFont(FUENTE_TEXTO); textStyle(BOLD);
        noStroke(); fill(5, 8, 12, 170); rect(vx + 3, sy + 3, textWidth(et) + 12, 18, 5);
        textoSis(et, vx + 9, sy + 16, 12.5, '#ffffff', LEFT, BOLD);
    }
    textoSis(doble ? (m ? i18n.t('emisión') : i18n.t('emisión · de lado')) : i18n.t('emisión'), vx + 8, yEm + 16, 12.5, '#dfe9f2', LEFT, BOLD);
    // Celebración: la raya rodeada de amarillo con dos chispas
    if (celebrando() && CELEB.wl && esVisible(CELEB.wl)) {
        const px = X(CELEB.wl), y0 = CELEB.doble ? sy : yEm, hh = CELEB.doble ? alto : hEm;
        push(); translate(px, y0 + hh / 2); scale(salto(CELEB.t0));
        noFill(); stroke(THEME.change); strokeWeight(3); rect(-11, -hh / 2 - 2, 22, hh + 4, 6);
        chispa(16, -hh / 2 + 6, 7); chispa(-15, hh / 2 - 6, 5);
        pop();
    }
    // Regla en papel
    const ry = sy + alto + 6;
    stroke(tinta()); strokeWeight(1.5); fill(THEME.paper || '#d6e6f3'); rect(vx, ry, vw, 22, 4);
    for (let l = 400; l <= 750; l += (m ? 50 : 25)) {
        const px = X(l), grande = l % 50 === 0;
        stroke(THEME.paperInk || '#24323f'); strokeWeight(1.5); line(px, ry, px, ry + (grande ? 8 : 5));
        if (grande && (!m || l % 100 === 0)) textoSis(l + (l === 750 && !m ? ' nm' : ''), px, ry + 19, 11.5, THEME.paperInk || '#24323f', CENTER);
    }
    if (m) {
        const ext = Object.entries(F.extLineas).filter(([k, v]) => v > 0.28 && (+k < 380 || (+k > 780 && +k <= 3000))).map(([k]) => +k).sort((a, b) => a - b);
        const lista = [...new Set(ext.map(l => Math.round(l / 10) * 10 === l ? l : l))].filter((l, i, arr) => !arr.some(o => o !== l && Math.abs(o - l) <= 3 && (F.extLineas[o] || 0) > (F.extLineas[l] || 0)));
        textoSis(lista.length ? i18n.t('UV e IR (no se ven): {lista}', { lista: lista.map(l => l + ' nm').join(' · ') }) : i18n.t('UV e IR (no se ven): ninguna raya todavía'),
            vx, ry + 46, 12.5, '#e3edf5', LEFT, NORMAL, vw);
    }
}

// ═════════════════════ MANDOS Y ARRANQUE ══════════════════════════
function pintarRelleno(sl) {
    const pct = ((sl.value - sl.min) / (sl.max - sl.min) * 100).toFixed(1) + '%';
    sl.style.setProperty('--fill', pct);
}
const ETQ_FLUJO = ['Lento', 'Pausado', 'Medio', 'Rápido', 'Máximo'];
const ETQ_FREC = ['Lenta', 'Pausada', 'Media', 'Rápida', 'Máxima'];
const ETQ_DENS = ['Muy diluida', 'Diluida', 'Media', 'Densa', 'Muy densa'];
function mostrarValores() {
    $('val-wl').textContent = F.monoWl + ' nm';
    $('slider-wl').value = F.monoWl; $('slider-wl').setAttribute('aria-valuetext', F.monoWl + ' nm');
    const [r, g, b] = wlToRGB(F.monoWl); $('slider-wl').style.setProperty('--col-wl', `rgb(${r},${g},${b})`);
    $('val-rate').textContent = i18n.t(ETQ_FLUJO[F.flujo - 1]); $('slider-rate').value = F.flujo;
    $('val-eenergy').textContent = fmt(F.eEnergia, 1) + ' eV'; $('slider-eenergy').value = F.eEnergia; $('slider-eenergy').setAttribute('aria-valuetext', fmt(F.eEnergia, 1) + ' eV');
    $('val-erate').textContent = i18n.t(ETQ_FREC[F.eFrec - 1]); $('slider-erate').value = F.eFrec;
    $('val-voltage').textContent = fmt(F.voltaje, 1) + ' eV'; $('slider-voltage').value = F.voltaje; $('slider-voltage').setAttribute('aria-valuetext', fmt(F.voltaje, 1) + ' eV');
    const idx = Math.round(map(F.densidad, 4, 20, 0, 4));
    $('val-density').textContent = i18n.t(ETQ_DENS[Math.min(idx, 4)]); $('slider-density').value = F.densidad;
    ['slider-wl', 'slider-rate', 'slider-eenergy', 'slider-erate', 'slider-voltage', 'slider-density'].forEach(id => pintarRelleno($(id)));
    const marcar = (id, on) => $(id).setAttribute('aria-checked', String(on));
    marcar('btn-blanca', F.luz === 'white'); marcar('btn-mono', F.luz === 'mono');
    marcar('btn-foto-single', F.fotonUnico); marcar('btn-foto-rafaga', !F.fotonUnico);
    marcar('btn-single', F.eUnico); marcar('btn-rafaga', !F.eUnico);
    $('btn-disparar-f').disabled = !F.fotonUnico; $('btn-disparar-e').disabled = !F.eUnico;
    const c = document.body.classList;
    c.toggle('luz-mono', F.luz === 'mono'); c.toggle('foton-continua', !F.fotonUnico); c.toggle('haz-continuo', !F.eUnico);
    document.querySelectorAll('[data-elem]').forEach(bt => bt.setAttribute('aria-checked', String(!misterio && bt.dataset.elem === F.clave)));
    document.querySelectorAll('[data-modo]').forEach(bt => { const on = bt.dataset.modo === F.modo; bt.setAttribute('aria-selected', String(on)); bt.classList.toggle('active', on); });
    frase();
    requestAnimationFrame(() => { if (ESC_MOVIL != null) rehacerComposicion(); });
}
function frase() {
    const A = F.atom, n = nombres(A);
    let f;
    if (misterio) f = [i18n.t('Gas misterioso: mira sus rayas y pulsa el elemento que creas.'), i18n.t('Racha: {r} de 3.', { r: misterio.racha })];
    else if (F.modo === 'fotones') f = [F.luz === 'white' ? i18n.t('La luz blanca atraviesa el {nombre}.', n) : i18n.t('La luz de {wl} nm atraviesa el {nombre}.', Object.assign({ wl: F.monoWl }, n)), i18n.t('¿Qué colores le faltan al salir? Esa es su huella.')];
    else if (F.modo === 'colision') f = [i18n.t('Dispara electrones al {nombre}.', n), i18n.t('¿Cuánta energía hace falta para que dé luz?')];
    else f = [i18n.t('La descarga excita los átomos del {nombre} y brillan.', n), i18n.t('El prisma separa su luz en rayas: su huella.')];
    $('frase').innerHTML = `<strong>${f[0]}</strong> <em class="curiosidad">${f[1]}</em>`;
    $('nota-elemento').textContent = misterio ? '' : i18n.t(A.note);
    $('titulo-saltos').textContent = misterio ? i18n.t('Saltos del átomo') : i18n.t('Saltos del {nombre}', nombres(A));
}
function pintarSaltos() {
    const A = F.atom;
    if (misterio) { $('tabla-saltos').innerHTML = `<p>${i18n.t('Se verán al acertar el gas misterioso.')}</p>`; return; }
    let h = `<table class="tabla-saltos"><thead><tr><th>${i18n.t('Salto')}</th><th>ΔE</th><th>λ</th><th>${i18n.t('Tipo')}</th></tr></thead><tbody>`;
    for (const t of A.transitions) {
        const [r, g, b] = wlToRGB(t.wl), dE = A.energies[t.to] - A.energies[t.from];
        const tipo = t.visible ? i18n.t('visible') : (t.wl < 380 ? 'UV' : 'IR');
        h += `<tr><td>${A.levelLabels[t.from]} ↔ ${A.levelLabels[t.to]}</td><td>${fmt(dE, 2)} eV</td><td><span class="muestra" style="background:${t.visible ? `rgb(${r},${g},${b})` : '#555'}"></span>${t.wl} nm</td><td>${tipo}</td></tr>`;
    }
    $('tabla-saltos').innerHTML = h + '</tbody></table>';
}

function elegirModo(m) {
    if (misterio && m !== 'gas') salirMisterio(false);
    if (m !== F.modo) {
        elegirModoFisica(m);
        limpiarEscena();
    }
    document.body.classList.remove('modo-fotones', 'modo-colision', 'modo-gas');
    document.body.classList.add('modo-' + m);
    mostrarValores();
    if (typeof pintarRetos === 'function') pintarRetos();
}
function elegirElemento(clave) {
    if (misterio) { contestarMisterio(clave); return; }
    if (clave === F.clave) return;
    elegirAtomo(clave);
    limpiarEscena();
    mostrarValores();
    if (!$('panel-saltos').hidden) pintarSaltos();
}
function limpiarEscena() {
    ultimo = null; ultimoSalto = null; rayaNueva = null; CELEB = null; rayasSesion = new Set();
    cienCuenta = 0;
}
function limpiar() {
    limpiarFisica();
    limpiarEscena();
}
function alternarPausa() {
    F.pausa = !F.pausa;
    const b = $('btn-pausa');
    b.querySelector('.btn-txt').textContent = i18n.t(F.pausa ? '▶ Reanudar' : '⏸ Pausar');
    b.setAttribute('aria-pressed', String(F.pausa));
    b.classList.toggle('active', F.pausa);
}
function disparar() {
    if (F.pausa) return;
    if (F.modo === 'fotones' && F.fotonUnico) dispararFoton();
    else if (F.modo === 'colision' && F.eUnico) dispararElectron();
}

// ── Gas misterioso (reto 5) ──────────────────────────────────────
function nuevoMisterio() {
    const otras = CLAVES_ATOMOS.filter(c => !misterio || c !== misterio.clave);
    const clave = otras[Math.floor(Math.random() * otras.length)];
    misterio.clave = clave;
    elegirAtomo(clave);
    limpiarEscena();
    mostrarValores();
}
function empezarMisterio() {
    cerrarRetos();
    misterio = { clave: null, racha: 0 };
    document.body.classList.add('misterio');
    $('btn-salir-misterio').hidden = false;
    if (F.modo !== 'gas') { elegirModoFisica('gas'); document.body.classList.remove('modo-fotones', 'modo-colision'); document.body.classList.add('modo-gas'); }
    if (F.voltaje < 4) F.voltaje = 5;
    nuevoMisterio();
}
function contestarMisterio(clave) {
    const ok = clave === misterio.clave;
    respuesta = { ok, nombres: nombres(ATOMS_DATA[misterio.clave]), t: millis() };
    misterio.racha = ok ? misterio.racha + 1 : 0;
    retosRacha(misterio.racha);
    if (ok && misterio.racha >= 3) { salirMisterio(true); return; }
    nuevoMisterio();
}
function salirMisterio(ganado) {
    const clave = misterio ? misterio.clave : F.clave;
    misterio = null;
    document.body.classList.remove('misterio');
    $('btn-salir-misterio').hidden = true;
    if (ganado) respuesta = { ok: true, nombres: nombres(ATOMS_DATA[clave]), t: millis() };
    mostrarValores();
}

function setupControles() {
    document.querySelectorAll('[data-modo]').forEach(b => b.addEventListener('click', () => elegirModo(b.dataset.modo)));
    document.querySelectorAll('[data-elem]').forEach(b => b.addEventListener('click', () => elegirElemento(b.dataset.elem)));
    $('btn-blanca').addEventListener('click', () => { F.luz = 'white'; mostrarValores(); });
    $('btn-mono').addEventListener('click', () => { F.luz = 'mono'; mostrarValores(); });
    $('btn-foto-single').addEventListener('click', () => { if (!F.fotonUnico) { F.fotonUnico = true; limpiar(); } mostrarValores(); });
    $('btn-foto-rafaga').addEventListener('click', () => { if (F.fotonUnico) { F.fotonUnico = false; limpiar(); } mostrarValores(); });
    $('btn-single').addEventListener('click', () => { if (!F.eUnico) { F.eUnico = true; limpiar(); } mostrarValores(); });
    $('btn-rafaga').addEventListener('click', () => { if (F.eUnico) { F.eUnico = false; limpiar(); } mostrarValores(); });
    $('btn-disparar-f').addEventListener('click', disparar);
    $('btn-disparar-e').addEventListener('click', disparar);
    const sl = (id, fn) => $(id).addEventListener('input', () => { fn(+$(id).value); mostrarValores(); });
    sl('slider-wl', (v) => { F.monoWl = Math.round(v); });
    sl('slider-rate', (v) => { F.flujo = v; });
    sl('slider-eenergy', (v) => { F.eEnergia = Math.round(v * 10) / 10; });
    sl('slider-erate', (v) => { F.eFrec = v; });
    sl('slider-voltage', (v) => { F.voltaje = Math.round(v * 10) / 10; for (const e of F.gasElectrones) e.energy = F.voltaje; });
    sl('slider-density', (v) => { F.densidad = v; iniciarGas(); });
    $('btn-pausa').addEventListener('click', alternarPausa);
    $('btn-reset').addEventListener('click', limpiar);
    $('btn-salir-misterio').addEventListener('click', () => salirMisterio(false));
    $('btn-misterio').addEventListener('click', empezarMisterio);
    const saltos = iniciarPopover('btn-saltos', 'panel-saltos');
    $('btn-saltos').addEventListener('click', pintarSaltos);
    $('check-pantalla').addEventListener('change', (e) => {
        try {
            if (e.target.checked && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
            else if (!e.target.checked && document.fullscreenElement) document.exitFullscreen();
        } catch (err) { /* nada */ }
    });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) $('check-pantalla').checked = false; setTimeout(fitCanvas, 100); });
    document.querySelectorAll('.theme-opt').forEach(b => b.addEventListener('click', () => { try { localStorage.setItem('sim-espectros-tema', b.dataset.theme); } catch (e) { /* nada */ } }));
    const t = temaActual(), clave = { pizarra: 'dark', dia: 'light', marca: 'marca', contraste: 'contrast' }[t];
    document.querySelectorAll('.theme-opt').forEach(b => b.classList.toggle('active', b.dataset.theme === clave));
    // Flechas dentro de los grupos de opciones
    document.querySelectorAll('.carril[role="radiogroup"], .carril[role="tablist"]').forEach(grupo => {
        grupo.addEventListener('keydown', (e) => {
            const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
            if (!paso) return;
            e.preventDefault();
            const btns = [...grupo.querySelectorAll('button')];
            const sig = btns[(btns.indexOf(document.activeElement) + paso + btns.length) % btns.length];
            sig.focus(); sig.click();
        });
    });
    // Atajos: barra espaciadora (pausa), L (limpiar), D (disparar). La barra no
    // actúa con el foco en un control (allí pulsa el control); L y D, sí, salvo
    // al escribir, para poder disparar mientras se mueve un deslizador.
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const t = e.target, escribiendo = t.closest('textarea, select, [contenteditable]') || (t.tagName === 'INPUT' && t.type !== 'range' && t.type !== 'checkbox');
        if (escribiendo) return;
        if (e.key === ' ') { if (t.closest('button, input, summary, a')) return; e.preventDefault(); alternarPausa(); }
        else if (e.key === 'l' || e.key === 'L') limpiar();
        else if (e.key === 'd' || e.key === 'D') disparar();
    });
    iniciarPopover('btn-ayuda', 'panel-ayuda');
    window.addEventListener('load', fitCanvas);
    if (document.fonts) document.fonts.ready.then(fitCanvas);
    new ResizeObserver(fitCanvas).observe(document.querySelector('.barra-sus'));
    return saltos;
}

// Pulsar la lámpara o el cañón dispara (como antes)
function enZonaDisparo(px, py) {
    const lx = (px - OBJ.tx) / OBJ.s, ly = (py - OBJ.ty) / OBJ.s;
    if (F.modo === 'fotones' && F.fotonUnico) return lx >= 4 && lx <= 96 && ly >= 104 && ly <= 250;
    if (F.modo === 'colision' && F.eUnico) return lx >= 4 && lx <= 116 && ly >= 120 && ly <= 236;
    return false;
}
function coordsLienzo(e, cv) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * CV_W / r.width, y: (e.clientY - r.top) * CV_H / r.height }; }

function setup() {
    calcularEscena();
    const cv = createCanvas(CV_W, CV_H);
    pixelDensity(1);
    cv.parent('canvas-container');
    cv.elt.setAttribute('role', 'img');
    cv.elt.setAttribute('aria-label', i18n.t('Simulación de espectros atómicos: el experimento con su prisma, el modelo de Bohr del átomo, la escalera de niveles y el espectroscopio. Los mensajes de la simulación se leen en voz alta.'));
    cv.elt.addEventListener('click', (e) => { const p = coordsLienzo(e, cv.elt); if (enZonaDisparo(p.x, p.y)) disparar(); });
    cv.elt.addEventListener('mousemove', (e) => { const p = coordsLienzo(e, cv.elt); cv.elt.style.cursor = enZonaDisparo(p.x, p.y) ? 'pointer' : ''; });
    frameRate(60);
    if (document.fonts) document.fonts.load('600 12px Fredoka');
    iniciarSelectorTema();
    setupControles();
    limpiarFisica();
    elegirModo('fotones');

    // Ajustes de la dirección (fichas del alumnado): ver js/parametros.js.
    const si = (v) => ['1', 'si', 'sí', 'true'].includes(v);
    aplicarParametrosUrl({
        tema:      (v) => { const t = { simulaciencia: 'marca', marca: 'marca', claro: 'light', oscuro: 'dark', contraste: 'contrast' }[v];
                            const b = t && document.querySelector(`.theme-opt[data-theme="${t}"]`); if (b) b.click(); },
        modo:      (v) => { const m = { fotones: 'fotones', colision: 'colision', 'colisión': 'colision', gas: 'gas' }[v]; if (m) elegirModo(m); },
        elemento:  (v) => { const c = { hidrogeno: 'hidrogeno', 'hidrógeno': 'hidrogeno', helio: 'helio', sodio: 'sodio', neon: 'neon', 'neón': 'neon' }[v]; if (c) elegirElemento(c); },
        luz:       (v) => { const b = { blanca: 'btn-blanca', mono: 'btn-mono', monocromatica: 'btn-mono', 'monocromática': 'btn-mono' }[v]; if (b) $(b).click(); },
        onda:      urlParam.range('slider-wl'),
        fotones:   (v) => { const b = { uno: 'btn-foto-single', continua: 'btn-foto-rafaga' }[v]; if (b) $(b).click(); },
        flujo:     urlParam.range('slider-rate'),
        energia:   urlParam.range('slider-eenergy'),
        disparo:   (v) => { const b = { uno: 'btn-single', continuo: 'btn-rafaga' }[v]; if (b) $(b).click(); },
        voltaje:   urlParam.range('slider-voltage'),
        densidad:  urlParam.range('slider-density'),
        retos:     (v) => { if (si(v)) abrirRetos(); },
    });
    mostrarValores();
    rehacerComposicion();
}

function draw() {
    vigilarRendimiento();
    actualizarTema(TEMA_PROPIO);
    clear();
    fuenteJuego();
    pasoFisica();
    drawEscena();
}
