// ═══════════════════════════════════════════════════════════════════
//  RETOS Y ÁLBUM DE HUELLAS (opcionales)
//
//  Ocultos por defecto: el botón «★ Retos» los despliega (o ?retos=1 en la
//  dirección). Lo conseguido se guarda en este navegador con localStorage
//  (sin cookies y sin enviar nada a ningún sitio). «Borrar lo conseguido»
//  lo vacía. La simulación avisa desde js/escena.js con:
//    retosEmite(clave, wl)     un átomo emite un fotón de λ = wl
//    retosAbsorbe(clave, wl)   un átomo absorbe un fotón (luz de un color)
//    retosCien(n)              n fotones seguidos sin absorber (hidrógeno)
//    retosExcita(clave, e)     un electrón de e eV excita el átomo
//    retosRacha(r)             racha del gas misterioso
// ═══════════════════════════════════════════════════════════════════

const RETOS_CLAVE = 'simulaciencia-espectros-retos';

// meta: lo que hay que juntar para completarlo (el anillo marca el avance)
const RETOS = [
    { id: 'tres',     meta: 3,   txt: 'Con luz de un solo color, haz que el hidrógeno absorba sus tres rayas visibles' },
    { id: 'cien',     meta: 100, txt: 'Dispara 100 fotones seguidos de un color que el hidrógeno no absorba ninguna vez' },
    { id: 'minimo',   meta: 1,   txt: 'Enciende el sodio con el electrón de menos energía posible' },
    { id: 'ir',       meta: 1,   txt: 'Consigue que el sodio emita una luz que no se ve (infrarrojo)' },
    { id: 'misterio', meta: 3,   txt: 'Gas misterioso: acierta tres seguidos por su huella' },
];

const ALMACEN = crearAlmacen(RETOS_CLAVE, () => ({ prog: {}, huellas: {}, tres: [] }));   // js/escena-comun.js
let retosDatos = ALMACEN.leer();
if (!retosDatos.prog || typeof retosDatos.prog !== 'object') retosDatos.prog = {};
if (!retosDatos.huellas || typeof retosDatos.huellas !== 'object') retosDatos.huellas = {};
if (!Array.isArray(retosDatos.tres)) retosDatos.tres = [];

const TOTAL_RAYAS = CLAVES_ATOMOS.reduce((s, c) => s + RAYAS_VISIBLES(ATOMS_DATA[c]).length, 0);
const cuentaRayas = () => CLAVES_ATOMOS.reduce((s, c) => s + (retosDatos.huellas[c] || []).length, 0);

function avanzar(id, valor) {
    const r = RETOS.find(x => x.id === id);
    const v = Math.min(r.meta, valor);
    if ((retosDatos.prog[id] || 0) >= v) return false;
    retosDatos.prog[id] = v;
    return true;
}
function guardarYPintar() { ALMACEN.guardar(retosDatos); pintarRetos(); }

function retosEmite(clave, wl) {
    let cambio = false;
    if (esVisible(wl)) {
        const h = retosDatos.huellas[clave] || (retosDatos.huellas[clave] = []);
        if (!h.includes(wl)) { h.push(wl); cambio = true; }
    }
    if (clave === 'sodio' && wl === 819 && avanzar('ir', 1)) cambio = true;
    if (cambio) guardarYPintar();
}
function retosAbsorbe(clave, wl) {
    if (clave !== 'hidrogeno' || !esVisible(wl) || retosDatos.tres.includes(wl)) return;
    retosDatos.tres.push(wl);
    avanzar('tres', retosDatos.tres.length);
    guardarYPintar();
}
function retosCien(n) {
    // Solo se guarda cada 10 fotones (y el 100) para no escribir sin parar
    if (n % 10 && n < 100) return;
    if (avanzar('cien', n)) guardarYPintar();
}
function retosExcita(clave, energia) {
    // El primer salto del sodio cuesta 2,10 eV; el cañón va de 0,1 en 0,1
    if (clave === 'sodio' && energia <= 2.15 && avanzar('minimo', 1)) guardarYPintar();
}
function retosRacha(r) {
    if (avanzar('misterio', r)) guardarYPintar();
}

function pintarRetos() {
    const lista = document.getElementById('lista-retos');
    if (!lista) return;
    const modo = document.getElementById('retos-modo');
    if (modo) modo.textContent = '· ' + i18n.t('Espectros atómicos');
    lista.innerHTML = '';
    RETOS.forEach(r => {
        const p = (retosDatos.prog[r.id] || 0) / r.meta;
        const hecho = p >= 1;
        const txt = i18n.t(r.txt);
        const li = document.createElement('li');
        li.className = hecho ? 'hecho' : '';
        li.style.setProperty('--progreso', String(Math.min(1, p)));
        li.innerHTML = `<span class="anillo" aria-hidden="true"></span><span class="reto-txt"></span><span class="reto-estrella" aria-hidden="true">${hecho ? '★' : '☆'}</span>`;
        li.querySelector('.reto-txt').textContent = txt;
        if (hecho) li.setAttribute('aria-label', txt + ' · ' + i18n.t('conseguido'));
        else if (r.meta > 1 && p > 0) li.setAttribute('aria-label', txt + ' · ' + (retosDatos.prog[r.id] || 0) + ' / ' + r.meta);
        lista.appendChild(li);
    });
    pintarTiras(document.getElementById('album-mini'), false);
    document.getElementById('album-cuenta').textContent = i18n.t('{n} / {total} rayas', { n: cuentaRayas(), total: TOTAL_RAYAS });
}

// Una tira de espectro por elemento: cada raya vista se pinta con su color;
// las que faltan, como un hueco discontinuo
function pintarTiras(caja, grande) {
    if (!caja) return;
    caja.innerHTML = '';
    CLAVES_ATOMOS.forEach(c => {
        const A = ATOMS_DATA[c], vistas = retosDatos.huellas[c] || [], todas = RAYAS_VISIBLES(A);
        const fila = document.createElement('div');
        fila.className = 'tira-fila';
        const sim = document.createElement('span');
        sim.className = 'tira-simbolo';
        sim.textContent = grande ? i18n.t(A.name) : A.symbol;
        sim.title = i18n.t(A.name);
        const tira = document.createElement('span');
        tira.className = 'tira';
        tira.setAttribute('role', 'img');
        const vistasOrd = todas.filter(w => vistas.includes(w));
        tira.setAttribute('aria-label', i18n.t(A.name) + ': ' + (vistasOrd.length
            ? i18n.t('{n} de {total} rayas', { n: vistasOrd.length, total: todas.length }) + ' (' + vistasOrd.join(', ') + ' nm)'
            : i18n.t('ninguna raya todavía')));
        todas.forEach(w => {
            const r = document.createElement('span');
            const ok = vistas.includes(w);
            r.className = 'raya' + (ok ? ' vista' : '');
            r.style.left = ((w - 380) / 400 * 100) + '%';
            if (ok) { const [R, G, B] = wlToRGB(w); r.style.background = `rgb(${R},${G},${B})`; }
            if (grande && ok) { const n = document.createElement('small'); n.textContent = w; r.appendChild(n); }
            tira.appendChild(r);
        });
        fila.appendChild(sim); fila.appendChild(tira);
        if (grande) {
            const cuenta = document.createElement('span');
            cuenta.className = 'tira-cuenta';
            cuenta.textContent = `${vistas.filter(w => todas.includes(w)).length} / ${todas.length}`;
            fila.appendChild(cuenta);
        }
        caja.appendChild(fila);
    });
}

function pintarAlbum() { pintarTiras(document.getElementById('album-tabla'), true); }

// Abrir y cerrar el panel y el álbum, «Borrar lo conseguido» con
// confirmación y Escape: en js/escena-comun.js
document.addEventListener('DOMContentLoaded', () => iniciarPanelRetos({
    pintar: pintarRetos,
    pintarAlbum,
    alBorrar: () => { retosDatos = ALMACEN.vacio(); pintarRetos(); },
}, ALMACEN));
