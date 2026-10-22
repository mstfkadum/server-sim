/* ---- Cables and arm: the rear of the rack in perspective, rebuilt from the trainer's photos of real racks.
   Zero-U PDUs A and B stand in the left side channel, the top-of-rack switches (data A, data B, management) sit at U10 to
   U12, and the server's rear panel is the trainer's photo with its cords removed. Behind it hangs the cable management arm
   (UCSC-CMAF-M4), folded: the inner arm clipped to the server's inner rail and the outer arm to the fixed outer rail, both
   on the left, the elbow on the right, held up by the width-adjustment slider on the right rail. Its black hinged cable
   guides hold the cables: in from the server along the inner arm, round the elbow, back along the outer arm and out at the
   fixed end, where the power cords drop to the PDUs and the data cables climb the lacing bar to the switches.
   World units are millimetres: x across the rack (0 = centre, + to the right as seen from the rear), y down (0 = top of
   the server, the top of U4), z into the rack (0 = the rear posts; negative = toward you).
   © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved. ---- */
const CW = { S: 1.35, F: 1700, YE: -300, CX: 548, Y40: 370, SB: 614 };
CW.EY = CW.Y40 + CW.YE * CW.S * CW.F / (CW.F + 40);
const cwk = z => CW.S * CW.F / (CW.F + z);
const cwp = (x, y, z) => { const k = cwk(z); return [CW.CX + x * k, CW.EY + (y - CW.YE) * k]; };
const cwT = z => `translate(${CW.CX} ${CW.EY.toFixed(2)}) scale(${cwk(z).toFixed(5)}) translate(0 ${-CW.YE})`;
const f2 = n => (+n).toFixed(2);
const q2 = p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const dPoly = P => 'M' + P.map(q2).join('L') + 'Z';
const dLine = P => 'M' + P.map(q2).join('L');

// geometry, folded (server in). I = inner arm's tab on the inner rail (moves with the server), O = outer arm's tab on the
// fixed outer rail, E = the elbow, SR = the width-adjustment slider's tab on the right outer rail; [x, z] in plan
const CG = {
  zs: 40, travel: 400, half: 214,
  I0: [-212, -58], O: [-222, -112], E0: [204, -85], SR: [222, -112],
  inB: [92, 214, 334], outB: [58, 132, 268, 360], strap: { exit: 20, elbow: 314 },
  pduZ: -28, pdu: { pduA: [-382, -338], pduB: [-332, -288] }, lace: [-279, -259], LX: -269, outlet: 7,
  torZ: -5, torTop: -249, U: 44.45,
};
const CMA_N = CG.inB.length + CG.outB.length;
const PH = (px, py) => [-215 + (px - 34) * 0.3688, py * 0.3689];      // rear photo pixel to world
const CPORT = { psu1: PH(1110, 176), psu2: PH(1110, 56), vic1: PH(760, 89.5), vic2: PH(716, 89.5), mgmt: PH(478, 199) };
// each cable: its kind, thickness, place in the bundle [y, w] (w = toward you from the arm's centre line), where it enters
// the inner arm (x, folded), how far outside the elbow it loops, and how far its connector stands out from the socket
const CSPEC = {
  psu1: { kind: 'power', w: 7.2, slot: [61, -8], entry: 164, r: 24, len: 50 },
  psu2: { kind: 'power', w: 7.2, slot: [53, -19], entry: 180, r: 16, len: 50 },
  mgmt: { kind: 'cat6', w: 5.6, slot: [51, -1], entry: -34, r: 3, len: 34 },
  vic1: { kind: 'fiber', w: 2.9, slot: [42, -12], entry: 72, r: 10, len: 44 },
  vic2: { kind: 'fiber', w: 2.9, slot: [43, -5], entry: 54, r: 6, len: 44 },
};
// where a cable's free end hangs when it is unplugged at the server but still in the arm: [x, y] from its port
const DANG = { psu1: [24, 30], psu2: [40, 50], mgmt: [8, 28], vic1: [12, 30], vic2: [2, 30] };
const CKIND = {
  power: { col: '#1C1E21', edge: '#000000', hi: '#5E6670', name: 'IEC C13 to C14 power cord' },
  fiber: { col: '#F07B2C', edge: '#8E3F0E', hi: '#FFC492', seam: '#B9561A', name: 'LC duplex multimode fibre' },
  cat6: { col: '#D3CAB3', edge: '#7E7663', hi: '#FAF6EC', name: 'Cat 6 UTP patch cord' },
};
const CDEF = { psu1: 'pduA', psu2: 'pduB', vic1: 'dataA', vic2: 'dataB', mgmt: 'mgmt' };
const outletY = n => 40 - (n - 7) * CG.U;
const torTop = u => CG.torTop + (12 - u) * CG.U;
const TORS = { dataA: { u: 12, port: 23, sfp: true, tag: 'SW01' }, dataB: { u: 11, port: 23, sfp: true, tag: 'SW02' }, mgmt: { u: 10, port: 12, sfp: false, tag: 'MGT01' } };
const sfpXY = (u, n) => { const c = (n - 1) >> 1; return [-206 + c * 14.4 + (c >> 2) * 2.4 + 6.6, torTop(u) + ((n - 1) % 2 ? 30.5 : 13.5)]; };
const rjXY = (u, n) => { const c = (n - 1) >> 1; return [-208 + c * 14.1 + Math.floor(c / 6) * 5 + 6.3, torTop(u) + ((n - 1) % 2 ? 31 : 13)]; };
// the work order (cable schedule): the exact switch port or PDU outlet for each of the server's cables, and the ports and
// outlets that other systems in the rack already use. t.cables[k] holds the device, t.cablePort[k] the port number on it
const CWANT = { psu1: 7, psu2: 7, vic1: 23, vic2: 23, mgmt: 12 };
const DBUSY = { pduA: [9, 10, 11], pduB: [9, 10, 11], dataA: [1, 2, 3, 4, 5, 6, 17, 18], dataB: [1, 2, 3, 4, 5, 6, 17, 18], mgmt: [1, 2, 3, 4, 5, 6, 7, 8] };
const DNAME = { pduA: 'PDU A', pduB: 'PDU B', dataA: 'SW01', dataB: 'SW02', mgmt: 'MGT01' };
const OUTLETS = [4, 5, 6, 7, 8, 9, 10, 11];
const DPORT = dk => CG.pdu[dk] ? CG.outlet : TORS[dk].port;                 // this server's port on each device
const cabN = (t, k) => (t.cablePort && t.cablePort[k]) || DPORT(cabDest(t, k));
const cabRight = (t, k) => t.cables[k] === CDEF[k] && cabN(t, k) === CWANT[k];
const cabWrong = (t, k) => !!t.cables[k] && !cabRight(t, k);
const ifName = (dk, n) => CG.pdu[dk] ? `outlet ${n}` : `${TORS[dk].sfp ? 'Eth1/' : 'Gi0/'}${n}`;
const portTxtC = (dk, n) => `${DNAME[dk]} ${CG.pdu[dk] ? 'outlet' : 'port'} ${n}`;
const wantTxt = k => portTxtC(CDEF[k], CWANT[k]);
const destTag = (dk, n) => CG.pdu[dk] ? `${DESTS[dk][4]}-${String(n).padStart(2, '0')}` : `${TORS[dk].tag}-${ifName(dk, n)}`;
const cabAt = (t, dk, n, but) => Object.keys(t.cables).find(k => k !== but && (t.cables[k] === dk || (cableMode(t, k) === 'dangle' && cabDest(t, k) === dk)) && cabN(t, k) === n);
function destAt(dk, n = DPORT(dk)) {
  if (CG.pdu[dk]) { const [a, b] = CG.pdu[dk]; return [(a + b) / 2, outletY(n), CG.pduZ]; }
  const s = TORS[dk]; return [...(s.sfp ? sfpXY(s.u, n) : rjXY(s.u, n)), CG.torZ];
}

/* ---- the arm's state. Older saved states have only cma/routed: the rest is derived from them ---- */
function arm(t) {
  const r = t.rack;
  if (!r.tabs) r.tabs = r.cma ? { outer: true, inner: true, slider: true } : { outer: false, inner: false, slider: false };
  if (!r.lids || r.lids.length !== CMA_N) r.lids = Array(CMA_N).fill(false);         // true = that guide's flap is open
  if (!r.laid) r.laid = r.routed ? { psu1: true, psu2: true, vic1: true, vic2: true, mgmt: true } : {};
  if (!r.straps) r.straps = r.routed ? { exit: true, elbow: true } : { exit: false, elbow: false };
  if (!r.dest) r.dest = {};
  return r;
}
const cmaReady = t => { const r = arm(t); return !!(r.tabs.outer && r.tabs.inner && r.tabs.slider); };
const cabDest = (t, k) => t.cables[k] || arm(t).dest[k] || (k.startsWith('psu') && t.psuFeed && t.psuFeed[k]) || CDEF[k];
const unlaid = t => Object.keys(t.cables).filter(k => t.cables[k] && !arm(t).laid[k]);
function syncRouted(t) {
  const r = arm(t), conn = Object.keys(t.cables).filter(k => t.cables[k]);
  r.cma = cmaReady(t);
  r.routed = r.cma && conn.length > 0 && conn.every(k => r.laid[k]) && r.lids.every(o => !o) && r.straps.exit && r.straps.elbow;
}
const cmFx = {};
const cmMark = (k, extra) => { cmFx[k] = { at: Date.now(), extra }; };
const cmAge = k => cmFx[k] ? (Date.now() - cmFx[k].at) / 1000 : 99;
let cmDemoAt = 0;
const CM_DEMO = 6.4;

/* ---- the arm in plan for a slide position d (mm the server has travelled toward the front) ---- */
function armAt(d) {
  const I = [CG.I0[0], CG.I0[1] + d], O = CG.O, Lin = Math.hypot(CG.E0[0] - CG.I0[0], CG.E0[1] - CG.I0[1]), Lout = Math.hypot(CG.E0[0] - O[0], CG.E0[1] - O[1]);
  const dx = I[0] - O[0], dz = I[1] - O[1], D = Math.hypot(dx, dz), a = (Lout * Lout - Lin * Lin + D * D) / (2 * D), h = Math.sqrt(Math.max(0, Lout * Lout - a * a));
  const mx = O[0] + a * dx / D, mz = O[1] + a * dz / D, e1 = [mx + h * dz / D, mz - h * dx / D], e2 = [mx - h * dz / D, mz + h * dx / D], E = e1[0] > e2[0] ? e1 : e2;
  const ua = [(E[0] - I[0]) / Lin, (E[1] - I[1]) / Lin], ub = [(E[0] - O[0]) / Lout, (E[1] - O[1]) / Lout];
  const sx = ua[0] + ub[0], sz = ua[1] + ub[1], sl = Math.hypot(sx, sz) || 1, u = [sx / sl, sz / sl];
  return { d, I, O, E, Lin, Lout, ua, ub, u, v: [u[1], -u[0]] };
}
// a point on an arm: s along it from its tab, w across it (negative = toward you), y down
const onIn = (A, s, w, y) => [A.I[0] + A.ua[0] * s - A.ua[1] * w, y, A.I[1] + A.ua[1] * s + A.ua[0] * w];
const onOut = (A, s, w, y) => [A.O[0] + A.ub[0] * s - A.ub[1] * w, y, A.O[1] + A.ub[1] * s + A.ub[0] * w];
const atE = (A, a, b, y) => [A.E[0] + A.u[0] * a + A.v[0] * b, y, A.E[1] + A.u[1] * a + A.v[1] * b];
const P3 = p => cwp(p[0], p[1], p[2]);

/* ---- drawing helpers. pth() draws a path whose shape depends on the slide position; while the demonstration plays it
   carries the whole slide out and back as keyframes ---- */
let cvD = 0, CVA = null, cvMemo = new Map();
const pth = (fn, attrs) => CVA ? `<path d="${fn(CVA.ds[0])}" ${attrs}><animate attributeName="d" values="${CVA.ds.map(fn).join(';')}" keyTimes="${CVA.kt}" dur="${CVA.dur}s" begin="-${CVA.age.toFixed(2)}s" fill="freeze"/></path>` : `<path d="${fn(cvD)}" ${attrs}/>`;
const cquad = (fn, fill, extra = '') => pth(d => dPoly(fn(d).map(P3)), `fill="${fill}"${extra}`);
// an axis-aligned box seen from the rear: its top, the side that faces the centre, and its near end
function box3(fb, c, extra = '') {
  const b0 = fb(cvD), [x0, x1, y0, y1, zf, zn] = b0;
  let s = '';
  if (y0 > CW.YE) s += cquad(d => { const [a, b, c0, , e, f] = fb(d); return [[a, c0, e], [b, c0, e], [b, c0, f], [a, c0, f]]; }, c.top);
  if (x0 > 0) s += cquad(d => { const [a, , c0, d0, e, f] = fb(d); return [[a, c0, e], [a, c0, f], [a, d0, f], [a, d0, e]]; }, c.side);
  if (x1 < 0) s += cquad(d => { const [, b, c0, d0, e, f] = fb(d); return [[b, c0, e], [b, c0, f], [b, d0, f], [b, d0, e]]; }, c.side);
  s += cquad(d => { const [a, b, c0, d0, , f] = fb(d); return [[a, c0, f], [b, c0, f], [b, d0, f], [a, d0, f]]; }, c.front, extra);
  return s;
}
// centripetal Catmull-Rom through 2D points, n samples per span
function crSample(P, n = 7) {
  const out = [P[0]], N = P.length, ext = (a, b) => [2 * a[0] - b[0], 2 * a[1] - b[1]];
  const td = (a, b) => Math.max(Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])), 0.05);
  for (let i = 0; i < N - 1; i++) {
    const p0 = i ? P[i - 1] : ext(P[0], P[1]), p1 = P[i], p2 = P[i + 1], p3 = i + 2 < N ? P[i + 2] : ext(P[N - 1], P[N - 2]);
    const t1 = td(p0, p1), t2 = t1 + td(p1, p2), t3 = t2 + td(p2, p3);
    for (let j = 1; j <= n; j++) {
      const tt = t1 + (t2 - t1) * j / n, L = (a, b, ta, tb) => [(a[0] * (tb - tt) + b[0] * (tt - ta)) / (tb - ta), (a[1] * (tb - tt) + b[1] * (tt - ta)) / (tb - ta)];
      const A1 = L(p0, p1, 0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3), B1 = L(A1, A2, 0, t2), B2 = L(A2, A3, t1, t3);
      out.push(L(B1, B2, t1, t2));
    }
  }
  return out;
}
function resample(P, M) {
  const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const tot = L[L.length - 1] || 1, out = []; let j = 0;
  for (let m = 0; m < M; m++) { const s = tot * m / (M - 1); while (j < P.length - 2 && L[j + 1] < s) j++; const f = (s - L[j]) / ((L[j + 1] - L[j]) || 1); out.push([P[j][0] + (P[j + 1][0] - P[j][0]) * f, P[j][1] + (P[j + 1][1] - P[j][1]) * f]); }
  return out;
}

/* ---- cable routes: control points in 3D, then projected and smoothed; the sections are drawn at their own depth so the
   cable guides' flaps can cover them: A from the connector into the inner arm, B along the inner arm, C round the elbow,
   D back along the outer arm, E out of the arm to the PDU or up the lacing bar to the switch ---- */
function cabRoute(t, k, d, mode) {
  const A = armAt(d), sp = CSPEC[k], [px, py] = CPORT[k], zs = CG.zs + d, [sy, sw] = sp.slot, dk = cabDest(t, k), [qx, qy] = destAt(dk, cabN(t, k)), pdu = !!CG.pdu[dk];
  const P = [], cut = {}, mark = n => { cut[n] = P.length - 1; }, se = sp.entry - CG.I0[0];
  const tail = () => {
    if (pdu) P.push([qx + 10, qy + 46, CG.pduZ - 66], [qx + 1, qy + 8, CG.pduZ - 52], [qx, qy, CG.pduZ - 44]);
    else {
      const ty = qy + (TORS[dk].sfp ? 25 : 27);
      P.push([CG.LX, -36, -50], [CG.LX, ty + 26, -46], [-240, ty + 4, -54], [qx - 22, ty, -60], [qx - 2, qy + 9, -56], [qx, qy, CG.torZ - sp.len]);
    }
  };
  if (mode === 'loose') {
    P.push([px, py, zs - sp.len], [px, py + 3, zs - sp.len - 40], [px - 4, py + 10, -168]);
    if (pdu) P.push([px * 0.55 + qx * 0.45, Math.max(py, 60) + 80, -176], [CG.LX + 2, 96, -112]);
    else P.push([px * 0.55 - 120, Math.max(py, 60) + 70, -176], [CG.LX + 4, 52, -90]);
    tail(); cut.L = 0; return { P, cut };
  }
  if (mode === 'dangle') { const [ox, oy] = DANG[k]; P.push([px + ox, py + oy, zs - 70]); mark('A'); P.push([px + ox - 1, py + oy + 18, zs - 66]); }
  else { P.push([px, py, zs - sp.len]); mark('A'); P.push([px + (sp.entry - px) * 0.15, py + 5, zs - sp.len - 14]); }
  { const q = onIn(A, se, sw + 10, Math.max(py + 12, sy - 6)); P.push([q[0], q[1], Math.max(q[2], A.I[1] + 4)]); }
  P.push(onIn(A, se, sw, sy)); mark('B');
  P.push(onIn(A, se + (A.Lin - 36 - se) * 0.5, sw, sy), onIn(A, A.Lin - 36, sw, sy)); mark('C');
  const R = 20 + sp.r * 0.6;
  P.push(onIn(A, A.Lin - 10, sw * 0.6, sy + 2), atE(A, R * 0.72, -R * 0.62 - 6, sy + 5), atE(A, R, -6, sy + 8), atE(A, R * 0.72, R * 0.5 - 6, sy + 5), onOut(A, A.Lout - 10, sw * 0.6, sy + 2)); mark('D');
  P.push(onOut(A, A.Lout - 36, sw, sy), onOut(A, (A.Lout - 36) * 0.5 + 6, sw, sy), onOut(A, 12, sw, sy)); mark('E');
  P.push(onOut(A, -16, sw - 4, sy + 5));
  if (pdu) P.push([CG.LX + 4, sy + 30 + (k === 'psu1' ? 8 : 0), -88]); else P.push([CG.LX + 10, sy + 4, -78], [CG.LX, sy - 36, -54]);
  tail();
  return { P, cut };
}
// sampled 2D points of one section (or 'L', the whole loose cable), memoised per render
function cabPts(t, k, d, mode, sec) {
  const key = `${k}|${d}|${mode}`;
  let m = cvMemo.get(key);
  if (!m) {
    const r = cabRoute(t, k, d, mode), n = 7, S = crSample(r.P.map(P3), n), cuts = Object.entries(r.cut).sort((a, b) => a[1] - b[1]);
    m = {}; cuts.forEach(([nm, i], j) => { const e = j + 1 < cuts.length ? cuts[j + 1][1] : r.P.length - 1; m[nm] = S.slice(i * n, e * n + 1); });
    m.all = S; cvMemo.set(key, m);
  }
  return m[sec];
}
function cabStroke(fn, kind, w, op = 1) {
  const c = CKIND[kind], a = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
  let s = pth(fn, `${a} stroke="${c.edge}" stroke-width="${f2(w + 1.3)}"`) + pth(fn, `${a} stroke="${c.col}" stroke-width="${f2(w)}"`);
  if (kind === 'fiber') s += pth(fn, `${a} stroke="${c.seam}" stroke-width="${f2(Math.max(0.45, w * 0.13))}"`);
  s += pth(fn, `${a} stroke="${c.hi}" stroke-width="${f2(Math.max(0.6, w * 0.26))}" opacity=".5" transform="translate(0 ${f2(-w * 0.22)})"`);
  return op < 1 ? `<g opacity="${op}">${s}</g>` : s;
}
const cabSec = (t, k, mode, sec, z) => cabStroke(d => dLine(cabPts(t, k, d, mode, sec)), CSPEC[k].kind, CSPEC[k].w * cwk(z));

/* ---- connectors, drawn as small boxes in perspective ---- */
const CC = { plug: { top: '#3A3E44', side: '#24272B', front: '#141618' }, steel: { top: '#E3E7EA', side: '#9BA3AA', front: '#C4CBD1' }, lc: { top: '#F6F1E2', side: '#BFB59C', front: '#E6DDC6' }, boot: { top: '#4A4E54', side: '#1E2125', front: '#2C3035' }, rj: { top: '#E9F0F3', side: '#9AA9B1', front: '#C7D3D9' }, cat6: { top: '#EEE7D5', side: '#A39A83', front: '#D6CDB6' } };
// the connector on one cable end. fz(d): depth of the socket face; x, y: socket centre
function plugAt(kind, x, y, fz) {
  if (kind === 'power') return box3(d => [x - 9.5, x + 9.5, y - 12.5, y + 12.5, fz(d), fz(d) - 38], CC.plug) + box3(d => [x - 5.5, x + 5.5, y - 5.5, y + 5.5, fz(d) - 38, fz(d) - 50], CC.boot);
  if (kind === 'fiber') return box3(d => [x - 6.8, x + 6.8, y - 4.4, y + 4.4, fz(d), fz(d) - 11], CC.steel) + box3(d => [x - 6.4, x + 6.4, y - 3.5, y + 3.5, fz(d) - 11, fz(d) - 25], CC.lc)
    + box3(d => [x - 5.8, x - 0.8, y - 2.4, y + 2.4, fz(d) - 25, fz(d) - 44], CC.boot) + box3(d => [x + 0.8, x + 5.8, y - 2.4, y + 2.4, fz(d) - 25, fz(d) - 44], CC.boot);
  return box3(d => [x - 5.8, x + 5.8, y - 4.2, y + 4.2, fz(d), fz(d) - 12], CC.rj) + box3(d => [x - 5.2, x + 5.2, y - 4.6, y + 4.6, fz(d) - 12, fz(d) - 34], CC.cat6);
}
// a free cable end, hanging below its port: the connector points up, capped
function dangleEnd(kind, x, y, z) {
  const h = kind === 'power' ? [9, 12] : kind === 'fiber' ? [6.4, 4] : [5.6, 4.4], c = kind === 'power' ? CC.plug : kind === 'fiber' ? CC.lc : CC.rj;
  let s = box3(() => [x - h[0], x + h[0], y - 26, y, z + h[1], z - h[1]], c);
  if (kind === 'fiber') s += box3(() => [x - 5, x + 5, y - 34, y - 26, z + 3, z - 3], { top: '#E0463A', side: '#8E231B', front: '#C2362B' });
  return s;
}

/* ---- the fixed scene: rack, side channel with the PDUs and the lacing bar, switches, neighbours ---- */
const ROWS = [12, 11, 10, 6, 5, 4, 3, 2, 1];
const uTop = u => u >= 10 ? torTop(u) : -(u - 4) * CG.U;
function rackBack(t) {
  const [lx] = cwp(-241, 0, 0), [rx] = cwp(241, 0, 0);
  let g = `<rect x="10" y="32" width="880" height="${CW.SB - 32}" rx="8" fill="#10161B"/>`;
  g += `<rect x="${f2(lx)}" y="32" width="${f2(rx - lx)}" height="${CW.SB - 32}" fill="#0A0E12"/>`;
  // far front posts and the depth of the rack, faintly
  [-233, 233].forEach(x => { const [a] = cwp(x - 8, 0, 760), [b] = cwp(x + 8, 0, 760); g += `<rect x="${f2(a)}" y="32" width="${f2(b - a)}" height="${CW.SB - 32}" fill="#161C22"/>`; });
  // fixed outer slide rails, running into the rack
  [-1, 1].forEach(sx => {
    if (!(sx < 0 ? t.rack.left : t.rack.right)) return;
    const xi = sx * 219, xo = sx * 226;
    g += `<path d="${dPoly([[xi, 68, -125], [xi, 68, 760], [xi, 88, 760], [xi, 88, -125]].map(P3))}" fill="#5E666E"/><path d="${dPoly([[xo, 68, -125], [xo, 68, 760], [xi, 68, 760], [xi, 68, -125]].map(P3))}" fill="#9AA2A9"/>`;
  });
  return g;
}
function postSvg(sx) {
  const x0 = sx < 0 ? -241 : 225, x1 = x0 + 16;
  let s = `<rect x="${x0}" y="-300" width="16" height="520" fill="#454B52"/><rect x="${sx < 0 ? x1 - 2 : x0}" y="-300" width="2" height="520" fill="#5C636B"/>`;
  ROWS.forEach(u => {
    const y0 = uTop(u);
    [6.35, 22.25, 38.1].forEach(o => { s += `<rect x="${x0 + 3.5}" y="${f2(y0 + o - 4.75)}" width="9.5" height="9.5" fill="#0D1013"/>`; });
    s += `<text x="${x0 + 8}" y="${f2(y0 + 31.2)}" text-anchor="middle" style="font:700 5.6px var(--font);fill:#C9D0D6">${u}</text>`;
  });
  return `<g transform="${cwT(0)}">${s}</g>`;
}
function pduSvg(t, dk) {
  const [x0, x1] = CG.pdu[dk], A = dk === 'pduA', cx = (x0 + x1) / 2, col = A ? '#D8462E' : '#2F78D6';
  const amps = pduAmps(t, dk);
  let s = `<rect x="${x0}" y="-300" width="${x1 - x0}" height="520" rx="3" fill="#1D2125"/><rect x="${x0}" y="-300" width="3" height="520" fill="#363B41"/><rect x="${x1 - 4}" y="-300" width="4" height="520" fill="${col}"/>`;
  s += `<rect x="${x0 + 7}" y="-243" width="${x1 - x0 - 15}" height="21" rx="2" fill="#071209" stroke="#3C434A"/><text x="${cx - 2}" y="-229.5" text-anchor="middle" style="font:700 7.4px ui-monospace,monospace;fill:#7CFF97">${amps}</text>`;
  s += `<text x="${cx - 2}" y="-209" text-anchor="middle" style="font:700 6.4px var(--font);fill:#E6EBEF">PDU ${A ? 'A' : 'B'}</text><text x="${cx - 2}" y="-201" text-anchor="middle" style="font:600 4.4px var(--font);fill:#9AA4AD">feed ${A ? 'A' : 'B'}, 230 V</text>`;
  for (let n = 4; n <= 11; n++) {
    const y = outletY(n);
    s += `<path d="M${cx - 10} ${y - 9}L${cx - 6} ${y - 13}H${cx + 4}L${cx + 8} ${y - 9}V${y + 13}H${cx - 10}Z" fill="#0B0C0E" stroke="#3B4046" stroke-width="1"/><rect x="${cx - 6}" y="${y - 3}" width="3" height="7" fill="#26292D"/><rect x="${cx + 1}" y="${y - 3}" width="3" height="7" fill="#26292D"/><rect x="${cx - 2.5}" y="${y - 10}" width="3" height="5" fill="#26292D"/>`;
    s += `<text x="${x0 + 7}" y="${y + 2}" text-anchor="middle" style="font:700 5.4px var(--font);fill:#AEB7BF">${n}</text>`;
  }
  return `<g transform="${cwT(CG.pduZ)}">${s}</g>`;
}
function pduAmps(t, dk) {
  const feeds = ['psu1', 'psu2'].filter((k, i) => t.cables[k] === dk && t.psu[i].st === 'in' && !t.psu[i].fault), all = ['psu1', 'psu2'].filter((k, i) => t.cables[k] && t.psu[i].st === 'in' && !t.psu[i].fault).length;
  const base = dk === 'pduA' ? 3.4 : 3.1;                         // the switches and the other servers already on this PDU
  const ours = !feeds.length || !all ? 0 : (t.power === 'on' ? 2.1 : 0.25) * feeds.length / all;
  return (base + ours).toFixed(1) + ' A';
}
function laceSvg() {
  const [a, b] = CG.lace;
  let s = `<rect x="${a}" y="-300" width="${b - a}" height="520" fill="#3F464D"/><rect x="${a}" y="-300" width="2" height="520" fill="#59616A"/>`;
  for (let y = -290; y < 220; y += CG.U / 2) s += `<rect x="${a - 5}" y="${f2(y)}" width="${b - a + 10}" height="3.2" rx="1.5" fill="#6A737C"/>`;
  return `<g transform="${cwT(-40)}">${s}</g>`;
}
// decorative cables already in the rack: other systems' power cords, DACs, fibres and patch cords, a little dimmed
function decorSvg() {
  let s = '';
  const cord = (pts, kind, w, op) => cabStroke(() => dLine(crSample(pts.map(P3), 6)), kind, w, op);
  Object.keys(CG.pdu).forEach((dk, j) => {
    const [a, b] = CG.pdu[dk], cx = (a + b) / 2;
    const side = j ? b + 5 : a - 5;
    [10, 11, 9].forEach((n, i) => { const y = outletY(n); s += plugAt('power', cx, y, () => CG.pduZ) + cord([[cx, y, CG.pduZ - 50], [cx + (side - cx) * 0.5, y + 16, -84 - i * 4], [side + (j ? i * 2 : -i * 2), y - 20, -66 - i * 4], [side + (j ? i * 2 : -i * 2), -330, -66 - i * 4]], 'power', 6.4, 0.9); });
  });
  return s;
}
function torSvg(t, dk) {
  const s = TORS[dk], y0 = torTop(s.u), y1 = y0 + CG.U - 0.8, busy = DBUSY[dk];
  let g = `<rect x="-241" y="${y0 + 0.4}" width="482" height="${CG.U - 0.8}" fill="#4B525A"/><rect x="-219" y="${y0 + 0.4}" width="438" height="${CG.U - 0.8}" fill="${s.sfp ? '#24282E' : '#30353C'}"/><rect x="-219" y="${y0 + 0.4}" width="438" height="1.4" fill="#59616A"/>`;
  [-230, 230].forEach(x => { g += `<circle cx="${x}" cy="${y0 + 8}" r="2.6" fill="#1B1E22"/><circle cx="${x}" cy="${y1 - 8}" r="2.6" fill="#1B1E22"/>`; });
  // the switch's name on a label-maker sticker on its left ear
  g += `<rect x="-240.2" y="${y0 + 15.6}" width="20.4" height="10.6" rx="1" fill="#F4F1E6" stroke="#9A9583" stroke-width=".4"/><text x="-230" y="${y0 + 23}" text-anchor="middle" style="font:800 ${s.tag.length > 4 ? 4.6 : 5.2}px var(--font);fill:#15181B">${s.tag}</text>`;
  for (let n = 1; n <= 48; n++) {
    const [x, y] = s.sfp ? sfpXY(s.u, n) : rjXY(s.u, n), top = (n - 1) % 2 === 0, lit = busy.includes(n) || linkUp(t, dk, n);
    if (s.sfp) g += `<rect x="${f2(x - 6.6)}" y="${f2(y - 4.4)}" width="13.2" height="8.8" fill="#A9B0B6"/><rect x="${f2(x - 5.7)}" y="${f2(y - 3.5)}" width="11.4" height="7" fill="#07090B"/>`;
    else g += `<rect x="${f2(x - 6.3)}" y="${f2(y - 5.2)}" width="12.6" height="10.4" fill="#7C858D"/><rect x="${f2(x - 5.4)}" y="${f2(y - 4.3)}" width="10.8" height="8.6" fill="#08090B"/><rect x="${f2(x - 2)}" y="${f2(y + (top ? 2.6 : -4.3))}" width="4" height="1.7" fill="#08090B"/>`;
    // each port's link LED sits between the two rows, a small triangle pointing at its port
    const ly = top ? y + (s.sfp ? 5.2 : 6.1) : y - (s.sfp ? 5.2 : 6.1), dy = top ? 1.5 : -1.5;
    g += `<path d="M${f2(x - 1.9)} ${f2(ly + dy)}H${f2(x + 1.9)}L${f2(x)} ${f2(ly)}Z" fill="${lit ? '#4EF07A' : '#1E2A22'}"${lit && busy.includes(n) ? ' class="blink"' : ''}/>`;
    // the port number: odd numbers above the top row, even numbers below the bottom row
    g += `<text x="${f2(x)}" y="${f2(top ? y - (s.sfp ? 6 : 6.9) : y + (s.sfp ? 9.4 : 10.3))}" text-anchor="middle" style="font:700 4.1px var(--font);fill:#D3DAE0">${n}</text>`;
  }
  if (s.sfp) for (let c = 0; c < 3; c++) for (let r = 0; r < 2; r++) g += `<rect x="${161 + c * 19}" y="${y0 + 8 + r * 17}" width="17" height="9" fill="#9EA6AD"/><rect x="${162 + c * 19}" y="${y0 + 9 + r * 17}" width="15" height="7" fill="#07090B"/>`;
  else for (let c = 0; c < 4; c++) g += `<rect x="${158 + c * 14.6}" y="${y0 + 26}" width="13.2" height="8.8" fill="#A9B0B6"/><rect x="${159 + c * 14.6}" y="${y0 + 27}" width="11.2" height="6.8" fill="#07090B"/>`;
  if (!s.sfp) g += `<rect x="160" y="${y0 + 7}" width="12" height="10" fill="#2F6FD6"/><text x="186" y="${y0 + 15}" style="font:600 4px var(--font);fill:#B7C0C8">CON</text>`;
  return `<g transform="${cwT(CG.torZ)}">${g}</g>`;
}
// other systems' cables in the switch ports, dressed to the left into the lacing bar
function torDecor(dk) {
  const s = TORS[dk], busy = DBUSY[dk];
  let g = '';
  busy.forEach((n, i) => {
    const [x, y] = s.sfp ? sfpXY(s.u, n) : rjXY(s.u, n), kind = s.sfp ? (n > 16 ? 'fiber' : 'dac') : 'cat6';
    const top = (n - 1) % 2 === 0, yy = y + (top ? 9 : 7), pts = [[x, y, CG.torZ - (kind === 'cat6' ? 34 : 44)], [x - 3, yy, -58 - (i % 3) * 2], [-205, yy + 2, -60], [CG.LX + 4, yy + 6, -52], [CG.LX, yy + 60, -48]];
    if (kind === 'dac') g += plugAtSimple(x, y) + cabStroke(() => dLine(crSample(pts.map(P3), 5)), 'power', 4.2 * 1.37, 0.8);
    else if (kind === 'fiber') g += plugAt('fiber', x, y, () => CG.torZ) + `<g style="filter:hue-rotate(150deg) saturate(.7)">${cabStroke(() => dLine(crSample(pts.map(P3), 5)), 'fiber', 2.9 * 1.37, 0.7)}</g>`;
    else g += plugAt('cat6', x, y, () => CG.torZ) + `<g style="filter:hue-rotate(${[190, 30, 0, 200][i % 4]}deg) saturate(${i % 4 === 2 ? 0.3 : 1.6})">${cabStroke(() => dLine(crSample(pts.map(P3), 5)), 'cat6', 5 * 1.37, 0.7)}</g>`;
  });
  return g;
}
const plugAtSimple = (x, y) => box3(() => [x - 6.8, x + 6.8, y - 4.4, y + 4.4, CG.torZ, CG.torZ - 30], { top: '#B9C0C6', side: '#6E767D', front: '#2A2E33' });
function breakSvg() {
  const yT = torTop(10) + CG.U + 1, yB = -CG.U * 2 - 1;
  let top = '', bot = '';
  for (let x = -241, i = 0; x <= 241; x += 12, i++) { top += `L${x} ${f2(yT + (i % 2 ? 4 : 0))}`; bot = `L${x} ${f2(yB - (i % 2 ? 4 : 0))}` + bot; }
  return `<g transform="${cwT(0)}"><path d="M-241 ${yT}${top}L241 ${yB}${bot}Z" fill="#070A0D" stroke="#2E3A45" stroke-width="1"/><text x="0" y="${f2((yT + yB) / 2 + 2.5)}" text-anchor="middle" style="font:600 6.4px var(--font);fill:#7F8E9B">U7 to U9: blanking panels, not shown</text></g>`;
}
// the 1U server at U6 and the UPS at U1 and U2, seen from the rear
function neighboursSvg() {
  const z = CG.zs, h = 214;
  let a = `<rect x="${-h}" y="${-2 * CG.U}" width="${2 * h}" height="${CG.U - 0.6}" fill="#3B4047"/>`;
  for (let x = -200; x < 60; x += 9) for (let y = -84; y < -52; y += 7) a += `<rect x="${x}" y="${y}" width="6" height="4" rx="1" fill="#22262B"/>`;
  [80, 150].forEach(x => { a += `<rect x="${x}" y="${-2 * CG.U + 3}" width="62" height="${CG.U - 7}" fill="#2A2E33" stroke="#565D65"/><circle cx="${x + 20}" cy="${-1.5 * CG.U}" r="13" fill="#1A1D21"/><rect x="${x + 44}" y="${-1.5 * CG.U - 8}" width="12" height="16" fill="#0E1012"/>`; });
  a += `<rect x="-214" y="${-2 * CG.U}" width="428" height="${CG.U - 0.6}" fill="#000" opacity=".25"/>`;
  let u = `<rect x="${-h}" y="${2 * CG.U + 0.3}" width="${2 * h}" height="${2 * CG.U - 0.6}" fill="#2D3136"/><circle cx="-140" cy="${3 * CG.U}" r="30" fill="#1B1E22" stroke="#4C535B" stroke-width="2"/>`;
  for (let i = -3; i <= 3; i++) u += `<path d="M-140 ${3 * CG.U}l${f2(26 * Math.cos(i * 0.9))} ${f2(26 * Math.sin(i * 0.9))}" stroke="#4C535B" stroke-width="1.6"/>`;
  for (let i = 0; i < 6; i++) u += `<path d="M${-60 + i * 30} ${2 * CG.U + 18}h20v6l-3 3h-14l-3-3z" fill="#0C0D0F" stroke="#3B4046"/>`;
  u += `<text x="150" y="${2 * CG.U + 30}" style="font:800 9px var(--font);fill:#8E99A3">UPS</text><rect x="-214" y="${2 * CG.U + 0.3}" width="428" height="${2 * CG.U - 0.6}" fill="#000" opacity=".22"/>`;
  return `<g transform="${cwT(z)}">${a}${u}</g>`;
}

/* ---- the server: its lid, the inner rails' rear ends, the rear panel photo with live LEDs, and the connectors ---- */
// a link comes up only on a switch port assigned to this server: the others are shut down or in another VLAN
const cabLink = (t, k) => {
  const dk = t.cables[k]; if (!dk || k.startsWith('psu') || cabN(t, k) !== DPORT(dk)) return false;
  if (k === 'mgmt') return psuAny(t);
  return t.power === 'on' && vicSlot(t) && !riserOut(t);
};
const linkUp = (t, dk, n) => Object.keys(t.cables).some(k => t.cables[k] === dk && cabN(t, k) === n && cabLink(t, k));
function serverFace(t) {
  const zs = CG.zs, k0 = cwk(zs + cvD);
  let s = `<image href="${IMG.rearCab}" x="${f2(-215 - 34 * 0.3688)}" y="0" width="${f2(1200 * 0.3688)}" height="${f2(248 * 0.3689)}"/>`;
  // supplies: face units (735 x 300) to world
  [[1, 2, 114], [0, 122, 113]].forEach(([i, py, ph]) => {
    const p = t.psu[i], L = psuLeds(t, i), X = -215 + (893 - 34) * 0.3688, sx = 259 / 735 * 0.3688, sy = ph / 300 * 0.3689;
    if (p.st === 'out') { s += `<rect x="${f2(X)}" y="${f2(py * 0.3689)}" width="${f2(735 * sx)}" height="${f2(300 * sy)}" fill="#07090B"/>`; return; }
    s += `<g transform="translate(${f2(X)} ${f2(py * 0.3689)}) scale(${sx.toFixed(5)} ${sy.toFixed(5)})">${psuLedSvg(...PF.amber, L.a, '#FFB52E')}${psuLedSvg(...PF.green, L.g, '#45D07F')}${psuFan(t, i) ? psuSpin() : ''}${t.cables[psuKey(i)] ? psuPlug() : ''}${psuFaceTop({ strap: p.strap ? 'on' : 'open', pinch: false })}</g>`;
  });
  // link LEDs: the VIC's LINK LED beside each cage, the management jack's two LEDs
  [['vic1', 800], ['vic2', 678]].forEach(([k, px]) => { const on = cabLink(t, k), [x, y] = PH(px, 101); s += `<circle cx="${f2(x)}" cy="${f2(y)}" r="1.5" fill="${on ? '#4EF07A' : '#22302A'}"/>`; });
  if (cabLink(t, 'mgmt')) { const [x1, y1] = PH(459, 185), [x2] = PH(497, 185); s += `<rect x="${f2(x1 - 1.6)}" y="${f2(y1 - 1)}" width="3.2" height="2" fill="#4EF07A"/><rect x="${f2(x2 - 1.6)}" y="${f2(y1 - 1)}" width="3.2" height="2" fill="#FFB52E" class="blink"/>`; }
  if (t.locator) s += `<circle cx="${f2(PH(870, 202)[0])}" cy="${f2(PH(870, 202)[1])}" r="3" fill="#4AA8FF"/>`;
  // the selected port, before you click where its cable goes
  if (t.sel.port && CPORT[t.sel.port]) { const [x, y] = CPORT[t.sel.port]; s += `<rect x="${f2(x - 13)}" y="${f2(y - 10)}" width="26" height="20" rx="3" fill="none" stroke="#45D07F" stroke-width="2"/>`; }
  const anim = CVA ? `<animateTransform attributeName="transform" type="scale" values="${CVA.ds.map(d => cwk(zs + d).toFixed(5)).join(';')}" keyTimes="${CVA.kt}" dur="${CVA.dur}s" begin="-${CVA.age.toFixed(2)}s" fill="freeze"/>` : '';
  return `<g transform="translate(${CW.CX} ${CW.EY.toFixed(2)})"><g transform="scale(${k0.toFixed(5)})">${anim}<g transform="translate(0 ${-CW.YE})">${s}</g></g></g>`;
}
function serverBody(t) {
  const h = CG.half;
  // the lid, seen through the empty U5 above it, and the inner rails' rear ends that stand out behind the server
  let g = cquad(d => [[-h, 0, CG.zs + d], [h, 0, CG.zs + d], [h, 0, CG.zs + d + 420], [-h, 0, CG.zs + d + 420]], '#6A737B') + cquad(d => [[-h, 0, CG.zs + d + 70], [h, 0, CG.zs + d + 70], [h, 0, CG.zs + d + 420], [-h, 0, CG.zs + d + 420]], '#4E565E');
  for (let x = -190; x < 190; x += 16) g += cquad(d => [[x, 0, CG.zs + d + 18], [x + 9, 0, CG.zs + d + 18], [x + 9, 0, CG.zs + d + 30], [x, 0, CG.zs + d + 30]], '#30363C');
  [-1, 1].forEach(sx => { g += box3(d => [sx < 0 ? -219 : 214, sx < 0 ? -214 : 219, 70, 86, CG.zs + d, CG.I0[1] + d], { top: '#B4BCC3', side: '#7D868E', front: '#6A7279' }); });
  return g;
}
// connectors in the server's ports, and free ends hanging from the arm
function serverPlugs(t) {
  let g = '';
  Object.keys(CSPEC).forEach(k => {
    const [x, y] = CPORT[k], sp = CSPEC[k];
    if (k.startsWith('vic') && (!vicSlot(t) || riserOut(t))) return;
    if (k.startsWith('psu') && t.psu[+k[3] - 1].st === 'out') return;
    if (t.cables[k]) g += plugAt(sp.kind, x, y, d => CG.zs + d);
    else if (arm(t).laid[k] && cmaReady(t)) g += dangleEnd(sp.kind, x + DANG[k][0], y + DANG[k][1], CG.zs + cvD - 70);
  });
  return g;
}

/* ---- the cable management arm ---- */
const BASK = { y0: 35, y1: 90, half: 17, back: 7, front: -33, body: [68, 90] };
const lidOpenAng = 74 * Math.PI / 180;
// lid corners for a flap opened by angle phi: rotation about the hinge (y = BASK.y0, w = +7) in the y-w plane
function lidPts(on, A, s, phi) {
  const rot = (dy, dw) => [BASK.y0 + dy * Math.cos(phi) + dw * Math.sin(phi), BASK.back - dy * Math.sin(phi) + dw * Math.cos(phi)];
  const L = BASK.front - BASK.back, F = 33, h = BASK.half;
  const P = (ss, dy, dw) => { const [y, w] = rot(dy, dw); return on(A, s + ss, w, y); };
  return { top: [P(-h, 0, 0), P(h, 0, 0), P(h, 0, L), P(-h, 0, L)], front: [P(-h, 0, L), P(h, 0, L), P(h, F, L), P(-h, F, L)],
    ribs: [-8, 0, 8].map(o => [P(o, 11, L - 0.3), P(o, 24, L - 0.3)]), latch: [P(-6, 26, L - 1.5), P(6, 26, L - 1.5), P(6, 33, L - 1.5), P(-6, 33, L - 1.5)] };
}
function armBar(inner) {
  const on = inner ? onIn : onOut, len = A => inner ? A.Lin : A.Lout;
  let g = cquad(d => { const A = armAt(d), L = len(A); return [on(A, -8, 10, 62), on(A, L + 4, 10, 62), on(A, L + 4, 10, 90), on(A, -8, 10, 90)]; }, '#8B949C');
  g += cquad(d => { const A = armAt(d), L = len(A); return [on(A, -8, 10, 62), on(A, L + 4, 10, 62), on(A, L + 4, 5, 62), on(A, -8, 5, 62)]; }, '#C2C9CF');
  for (let s0 = 18; s0 < 400; s0 += 46) g += cquad(d => { const A = armAt(d), L = len(A), s = Math.min(s0, L - 30); return [on(A, s, 9.8, 71), on(A, s + 24, 9.8, 71), on(A, s + 24, 9.8, 81), on(A, s, 9.8, 81)]; }, '#3E444A');
  return g;
}
function basketBack(inner, s) {
  const on = inner ? onIn : onOut, h = BASK.half;
  return cquad(d => { const A = armAt(d); return [on(A, s - h, BASK.back, BASK.y0), on(A, s + h, BASK.back, BASK.y0), on(A, s + h, BASK.back, BASK.y1), on(A, s - h, BASK.back, BASK.y1)]; }, '#212428')
    + cquad(d => { const A = armAt(d); return [on(A, s - h, BASK.back, 86), on(A, s + h, BASK.back, 86), on(A, s + h, BASK.front, 86), on(A, s - h, BASK.front, 86)]; }, '#2B2F34');
}
function basketFront(t, inner, s, i) {
  const on = inner ? onIn : onOut, h = BASK.half, open = arm(t).lids[i], a = cmAge('lid' + i), fx = cmFx['lid' + i], moving = a < 0.4 + ((fx && fx.extra2) || 0);
  const from = fx && fx.extra != null ? fx.extra : open ? 0 : lidOpenAng, to = open ? lidOpenAng : 0, delay = fx && fx.extra2 ? fx.extra2 : 0;
  let g = cquad(d => { const A = armAt(d); return [on(A, s - h, BASK.front, BASK.body[0]), on(A, s + h, BASK.front, BASK.body[0]), on(A, s + h, BASK.front, BASK.body[1]), on(A, s - h, BASK.front, BASK.body[1])]; }, '#2F3337');
  [-9, -3, 3, 9].forEach(o => { g += pth(d => { const A = armAt(d); return dLine([on(A, s + o, BASK.front - 0.3, 70), on(A, s + o, BASK.front - 0.3, 87)].map(P3)); }, 'stroke="#1A1C1F" stroke-width="1.6"'); });
  // the flap: drawn at its angle; while it moves, keyframes from the old angle to the new one
  const geo = (d, phi) => lidPts(on, armAt(d), s, phi);
  const lidPath = (part, fill, extra = '') => {
    if (moving && !CVA) {
      const N = 6, vals = []; for (let j = 0; j <= N; j++) { const f = j / N, e = f * f * (3 - 2 * f); vals.push(dPoly(geo(cvD, from + (to - from) * e)[part].map(P3))); }
      return `<path d="${vals[0]}" fill="${fill}"${extra}><animate attributeName="d" values="${vals.join(';')}" dur="0.3s" begin="${(delay - a).toFixed(2)}s" fill="freeze"/></path>`;
    }
    return cquad(d => geo(d, to)[part], fill, extra);
  };
  g += lidPath('top', open ? '#454A51' : '#4B5057') + lidPath('front', open ? '#353A40' : '#3C4046', open ? ' stroke="#565C64" stroke-width=".8"' : '');
  if (!open && !moving) {
    g += lidPath('latch', '#5C626A');
    [0, 1, 2].forEach(r => { g += pth(d => dLine(geo(d, 0).ribs[r].map(P3)), 'stroke="#25282C" stroke-width="2"'); });
  }
  // hinge knuckles
  [-h + 2, h - 6].forEach(o => { g += cquad(d => { const A = armAt(d); return [on(A, s + o, 3, BASK.y0 - 4), on(A, s + o + 4, 3, BASK.y0 - 4), on(A, s + o + 4, 3, BASK.y0 + 3), on(A, s + o, 3, BASK.y0 + 3)]; }, '#5A6067'); });
  return g;
}
function elbowSvg() {
  return cquad(d => { const A = armAt(d); return [atE(A, 0, -14, 20), atE(A, 0, 14, 20), atE(A, 0, 14, 92), atE(A, 0, -14, 92)]; }, '#6F7880')
    + cquad(d => { const A = armAt(d); return [atE(A, -6, -14, 20), atE(A, 6, -14, 20), atE(A, 6, 14, 20), atE(A, -6, 14, 20)]; }, '#B9C1C8')
    + pth(d => { const A = armAt(d), c = P3(atE(A, 0, 0, 20)); return `M${f2(c[0] - 4)} ${f2(c[1])}a4 2 0 1 0 8 0a4 2 0 1 0 -8 0Z`; }, 'fill="#3C4248"');
}
function tabSvg(which, on) {
  const off = on ? 0 : -16;
  if (which === 'outer') return box3(() => [CG.O[0] - 6, CG.O[0] + 22, 58, 92, CG.O[1] + 14, CG.O[1] - 2 + off], { top: '#D3D9DE', side: '#8E979F', front: '#AEB6BD' }) + `<circle cx="${f2(cwp(CG.O[0] + 8, 75, CG.O[1] - 2 + off)[0])}" cy="${f2(cwp(CG.O[0] + 8, 75, CG.O[1] - 2 + off)[1])}" r="3.2" fill="#6B737B" stroke="#E7EBEE"/>`;
  if (which === 'inner') return box3(d => [CG.I0[0] - 4, CG.I0[0] + 20, 60, 90, CG.I0[1] + d + 12, CG.I0[1] + d - 2 + off], { top: '#D3D9DE', side: '#8E979F', front: '#AEB6BD' });
  return box3(() => [CG.SR[0] - 14, CG.SR[0] + 5, 72, 88, CG.SR[1] + 10, CG.SR[1] + off], { top: '#C9D0D6', side: '#7C858D', front: '#9EA7AF' });
}
// the width-adjustment slider: from its tab on the right outer rail to the elbow; a tube with a bar sliding inside it
function sliderSvg(on) {
  const end = d => on ? armAt(d).E : [CG.SR[0] - 40, CG.SR[1] + 10];
  return pth(d => { const e = end(d), a = [CG.SR[0], 82, CG.SR[1]], b = [e[0], 82, e[1]], m = [a[0] + (b[0] - a[0]) * 0.55, 82, a[2] + (b[2] - a[2]) * 0.55]; return dLine([a, m].map(P3)); }, 'stroke="#7C858D" stroke-width="9" stroke-linecap="round"')
    + pth(d => { const e = end(d), a = [CG.SR[0], 82, CG.SR[1]], b = [e[0], 82, e[1]]; return dLine([a, b].map(P3)); }, 'stroke="#AEB6BD" stroke-width="4.5" stroke-linecap="round"');
}
function strapSvg(t, which) {
  const s = CG.strap[which], on = arm(t).straps[which], col = which === 'exit' ? ['#1D1D20', '#3A3A40'] : ['#E9E3D3', '#B8B09C'], a = cmAge('strap' + which);
  if (!on) return cquad(d => { const A = armAt(d); return [onOut(A, s - 5, -12, 66), onOut(A, s + 5, -12, 66), onOut(A, s + 5, -16, 118), onOut(A, s - 5, -16, 118)]; }, col[0], ` stroke="${col[1]}" stroke-width=".8"`);
  let g = cquad(d => { const A = armAt(d); return [onOut(A, s - 5, -27, 36), onOut(A, s + 5, -27, 36), onOut(A, s + 5, -27, 69), onOut(A, s - 5, -27, 69)]; }, col[0], ` stroke="${col[1]}" stroke-width=".8"`)
    + cquad(d => { const A = armAt(d); return [onOut(A, s - 5, 4, 36), onOut(A, s + 5, 4, 36), onOut(A, s + 5, -27, 36), onOut(A, s - 5, -27, 36)]; }, col[1]);
  for (let y = 41; y < 68; y += 5) g += pth(d => { const A = armAt(d); return dLine([onOut(A, s - 4, -27.3, y), onOut(A, s + 4, -27.3, y)].map(P3)); }, `stroke="${col[1]}" stroke-width=".7"`);
  return a < 0.5 ? `<g>${`<animate attributeName="opacity" values="0;1" dur="0.35s" begin="-${a.toFixed(2)}s" fill="freeze"/>`}${g}</g>` : g;
}

/* ---- the whole rear view ---- */
function cableMode(t, k) {
  const r = arm(t);
  if (k.startsWith('vic') && (!vicSlot(t) || riserOut(t))) return null;
  if (r.laid[k] && cmaReady(t)) return t.cables[k] ? 'laid' : 'dangle';
  return t.cables[k] ? 'loose' : null;
}
function rearScene(t) {
  const r = arm(t), bench = r.pos === 'bench', ready = cmaReady(t), anyTab = r.tabs.outer || r.tabs.inner || r.tabs.slider;
  cvMemo = new Map(); cvD = r.pos === 'service' ? CG.travel : 0;
  CVA = cmAnim(t);
  const keys = Object.keys(CSPEC), modes = {}; keys.forEach(k => { modes[k] = cableMode(t, k); });
  const lay = cmFx.lay && cmAge('lay') < 1.1 ? cmFx.lay.extra : [];
  const mode = k => lay.includes(k) ? null : modes[k];
  let g = rackBack(t);
  if (!bench) g += serverBody(t) + serverFace(t);
  g += neighboursSvg() + breakSvg() + postSvg(-1) + postSvg(1);
  g += pduSvg(t, 'pduA') + pduSvg(t, 'pduB') + laceSvg() + decorSvg();
  ['dataA', 'dataB', 'mgmt'].forEach(dk => { g += torSvg(t, dk); });
  g += torDecor('mgmt') + torDecor('dataB') + torDecor('dataA');
  if (!bench) {
    g += serverPlugs(t);
    const showArm = anyTab, ghost = !r.tabs.outer;
    let a = '';
    if (showArm) {
      a += tabSvg('inner', r.tabs.inner);
      keys.forEach(k => { if (mode(k) === 'laid' || mode(k) === 'dangle') a += cabSec(t, k, mode(k), 'A', -20); });
      a += armBar(true);
      CG.inB.forEach(s => { a += basketBack(true, s); });
      keys.forEach(k => { if (mode(k) === 'laid' || mode(k) === 'dangle') a += cabSec(t, k, mode(k), 'B', -58); });
      CG.inB.forEach((s, i) => { a += basketFront(t, true, s, i); });
      a += elbowSvg();
      keys.forEach(k => { if (mode(k) === 'laid' || mode(k) === 'dangle') a += cabSec(t, k, mode(k), 'C', -86); });
      a += sliderSvg(r.tabs.slider) + tabSvg('slider', r.tabs.slider);
      a += armBar(false);
      CG.outB.forEach(s => { a += basketBack(false, s); });
      keys.forEach(k => { if (mode(k) === 'laid' || mode(k) === 'dangle') a += cabSec(t, k, mode(k), 'D', -112); });
      CG.outB.forEach((s, i) => { a += basketFront(t, false, s, CG.inB.length + i); });
      a += strapSvg(t, 'elbow') + strapSvg(t, 'exit') + tabSvg('outer', r.tabs.outer);
      if (ghost) a = `<g opacity=".38">${a}</g>`;
    } else a += cmaGhost();
    g += a;
    keys.forEach(k => { if (mode(k) === 'laid' || mode(k) === 'dangle') g += cabSec(t, k, mode(k), 'E', -70); });
  }
  // far ends: plugs in the PDU outlets and the switch ports
  keys.forEach(k => {
    if (bench || !modes[k]) return;
    const dk = cabDest(t, k), [x, y] = destAt(dk, cabN(t, k));
    g += plugAt(CSPEC[k].kind, x, y, () => CG.pdu[dk] ? CG.pduZ : CG.torZ);
  });
  // a cable in a port or outlet the work order does not give: a red ring round its far end
  if (!bench) keys.forEach(k => {
    if (!modes[k] || !cabWrong(t, k)) return;
    const dk = t.cables[k], [x, y, z] = destAt(dk, cabN(t, k)), [px, py] = cwp(x, y, z - 18), r = CG.pdu[dk] ? 24 : 15;
    g += `<circle cx="${f2(px)}" cy="${f2(py)}" r="${r}" fill="#FF5A4E" fill-opacity=".12" stroke="#FF5A4E" stroke-width="2.4" stroke-dasharray="5 3"/>`;
  });
  if (!bench) {
    keys.forEach(k => { if (mode(k) === 'loose') g += cabSec(t, k, 'loose', 'L', -110); });
    // cables swinging from where they hung into the arm
    lay.forEach(k => {
      if (!modes[k]) return;
      const a = cmAge('lay'), from = resample(cabPts(t, k, cvD, 'loose', 'all'), 90), to = resample(cabPts(t, k, cvD, 'laid', 'all'), 90), N = 6, vals = [];
      for (let j = 0; j <= N; j++) { const f = j / N, e = f * f * (3 - 2 * f); vals.push(dLine(from.map((p, i) => [p[0] + (to[i][0] - p[0]) * e, p[1] + (to[i][1] - p[1]) * e]))); }
      const c = CKIND[CSPEC[k].kind], w = CSPEC[k].w * 1.42, an = `<animate attributeName="d" values="${vals.join(';')}" dur="0.9s" begin="-${a.toFixed(2)}s" fill="freeze"/>`;
      g += `<path d="${vals[0]}" fill="none" stroke="${c.edge}" stroke-width="${f2(w + 1.3)}" stroke-linecap="round" stroke-linejoin="round">${an}</path><path d="${vals[0]}" fill="none" stroke="${c.col}" stroke-width="${f2(w)}" stroke-linecap="round" stroke-linejoin="round">${an}</path>`;
    });
    if (r.labeled && !CVA) g += labelsSvg(t, modes);
  }
  if (bench) g += `<rect x="300" y="300" width="460" height="64" rx="8" fill="#14202B" stroke="#F0A93B"/><text x="530" y="328" text-anchor="middle" class="st">The server is on the bench</text><text x="530" y="348" text-anchor="middle" class="ss">Rack it (Rack mounting) before you cable it</text>`;
  if (!bench) g += tabTargets(t) + portTags(t);
  g += sceneLabels(t);
  CVA = null;
  return g;
}
// the arm in its box position before any tab is on: a dashed outline where it will go
function tabTargets(t) {
  const r = arm(t); if (cmaReady(t)) return '';
  let g = '';
  [['outer', 1, CG.O[0] + 3, 88, CG.O[1] - 6, 'outer rail'], ['inner', 2, CG.I0[0] + 3, 57, CG.I0[1] + cvD - 2, 'inner rail'], ['slider', 3, CG.SR[0] - 8, 79, CG.SR[1] - 6, 'slider']].forEach(([k, n, x, y, z, nm]) => {
    if (r.tabs[k]) return;
    const [px, py] = cwp(x, y, z);
    // the numbered targets are guidance: with it off, only the part names stay
    if (Sim.guide) g += `<circle cx="${f2(px)}" cy="${f2(py)}" r="11" fill="#14202B" stroke="#FFB52E" stroke-width="2" stroke-dasharray="4 3"/><text x="${f2(px)}" y="${f2(py + 4)}" text-anchor="middle" style="font:800 11px var(--font);fill:#FFD27A">${n}</text>`;
    g += `<text x="${f2(px + (k === 'slider' ? -16 : 16))}" y="${f2(py + 4)}" text-anchor="${k === 'slider' ? 'end' : 'start'}" style="font:700 10px var(--font);fill:#FFD27A;paint-order:stroke;stroke:#0A0E12;stroke-width:3px">${nm}</text>`;
  });
  return g;
}
function cmaGhost() {
  const A = armAt(0), p = [onIn(A, 0, 0, 62), onIn(A, A.Lin, 0, 62), onOut(A, A.Lout, 0, 90), onOut(A, 0, 0, 90)].map(P3);
  return `<path d="${dPoly(p)}" fill="#FFB52E" fill-opacity=".06" stroke="#FFB52E" stroke-width="1.5" stroke-dasharray="7 5"/>`;
}
// wraparound labels near both ends of each cable
function labelsSvg(t, modes) {
  let g = '';
  Object.keys(modes).forEach(k => {
    if (!modes[k] || !t.cables[k]) return;
    const m = modes[k], a = m === 'loose' ? cabPts(t, k, cvD, 'loose', 'L') : cabPts(t, k, cvD, m, 'A'), e = m === 'loose' ? a : cabPts(t, k, cvD, m, 'E');
    [a[Math.min(3, a.length - 1)], e[Math.max(0, e.length - 4)]].forEach(p => { g += `<g transform="translate(${f2(p[0])} ${f2(p[1])})"><rect x="-4" y="-5" width="16" height="10" rx="1.5" fill="#FBFBF7" stroke="#8E959B" stroke-width=".7"/><path d="M-1 -2h10M-1 1h8" stroke="#5B636A" stroke-width=".9"/></g>`; });
  });
  return g;
}
const PTAG = { mgmt: ['MGMT', -34, -30], vic2: ['PORT 2', -26, -27], vic1: ['PORT 1', 26, -27], psu2: ['PSU 2', -44, -6], psu1: ['PSU 1', -44, -2] };
function portTags(t) {
  if (arm(t).pos === 'bench' || CVA) return '';
  const zs = CG.zs + cvD, vic = vicSlot(t) && !riserOut(t);
  let g = '';
  Object.keys(PTAG).forEach(k => {
    if (t.cables[k] || (k.startsWith('vic') && !vic) || (k.startsWith('psu') && t.psu[+k[3] - 1].st === 'out')) return;
    const [nm, dx, dy] = PTAG[k], [x, y] = cwp(...CPORT[k], zs), tx = x + dx, ty = y + dy, w = nm.length * 6.4 + 10, sel = t.sel.port === k;
    g += `<path d="M${f2(x)} ${f2(y)}L${f2(tx)} ${f2(ty)}" stroke="${sel ? '#45D07F' : '#FFD27A'}" stroke-width="1.4"/><circle cx="${f2(x)}" cy="${f2(y)}" r="2.4" fill="${sel ? '#45D07F' : '#FFD27A'}"/>`;
    g += `<rect x="${f2(tx - w / 2)}" y="${f2(ty - 9)}" width="${f2(w)}" height="15" rx="4" fill="#14202B" stroke="${sel ? '#45D07F' : '#FFD27A'}" stroke-width="1.2"/><text x="${f2(tx)}" y="${f2(ty + 2.5)}" text-anchor="middle" style="font:700 9.5px var(--font);fill:${sel ? '#7CF0A8' : '#FFE3A8'}">${nm}</text>`;
  });
  return g;
}
function sceneLabels(t) {
  const r = arm(t);
  if (r.pos !== 'service') return '';
  const [x, y] = cwp(0, -10, CG.zs + CG.travel);
  return `<text x="${f2(x)}" y="${f2(y)}" text-anchor="middle" style="font:700 11px var(--font);fill:#FFD27A;paint-order:stroke;stroke:#0A0E12;stroke-width:3px">Server slid out on its rails: the arm is unfolded</text>`;
}
// click targets for the rear view
function rearZones(t) {
  const r = arm(t), bench = r.pos === 'bench', ready = cmaReady(t);
  let g = '';
  const zr = (act, arg, label, [x0, y0, x1, y1], rx = 4) => `<g${hot(act, arg, label)}><rect x="${f2(Math.min(x0, x1))}" y="${f2(Math.min(y0, y1))}" width="${f2(Math.abs(x1 - x0))}" height="${f2(Math.abs(y1 - y0))}" rx="${rx}" class="zone"/></g>`;
  const box = (x0, y0, x1, y1, z) => { const a = cwp(x0, y0, z), b = cwp(x1, y1, z); return [a[0], a[1], b[0], b[1]]; };
  // destinations: every PDU outlet and every switch port is its own target. Hovering one shows its name in a bubble
  const dz = (dk, n, bx, what) => {
    const [x0, y0, x1, y1] = bx, who = cabAt(t, dk, n), busy = DBUSY[dk].includes(n), tip = portTxtC(dk, n);
    const st = who ? `${CROUTE[who]} is plugged in here` : busy ? 'in use by another system' : 'free';
    const w = tip.length * 6.3 + 16, cx = Math.min(Math.max((x0 + x1) / 2, w / 2 + 14), 886 - w / 2), up = Math.min(y0, y1) - 5, ty = up - 19 < 34 ? Math.max(y0, y1) + 24 : up;
    return `<g${hot('dest', `${dk}:${n}`, `${tip} (${what}): ${st}`)}><rect x="${f2(Math.min(x0, x1))}" y="${f2(Math.min(y0, y1))}" width="${f2(Math.abs(x1 - x0))}" height="${f2(Math.abs(y1 - y0))}" rx="2" class="zone"/>`
      + `<g class="ptip"><rect x="${f2(cx - w / 2)}" y="${f2(ty - 19)}" width="${f2(w)}" height="19" rx="5" fill="#0E1620" stroke="${who ? '#7CC4FF' : busy ? '#8E99A3' : '#FFD27A'}" stroke-width="1.3"/><text x="${f2(cx)}" y="${f2(ty - 5.6)}" text-anchor="middle" style="font:800 11.5px var(--font);fill:#FFE3A8">${esc(tip)}</text></g></g>`;
  };
  Object.keys(CG.pdu).forEach(dk => { const [a, b] = CG.pdu[dk]; OUTLETS.forEach(n => { g += dz(dk, n, box(a, outletY(n) - 20, b, outletY(n) + 20, CG.pduZ), 'C13 outlet'); }); });
  ['dataA', 'dataB', 'mgmt'].forEach(dk => {
    const s = TORS[dk], y0 = torTop(s.u), hw = s.sfp ? 7.2 : 7.05;
    for (let n = 1; n <= 48; n++) { const [x] = s.sfp ? sfpXY(s.u, n) : rjXY(s.u, n), top = (n - 1) % 2 === 0; g += dz(dk, n, box(x - hw, y0 + (top ? 3.6 : 22), x + hw, y0 + (top ? 22 : 41), CG.torZ), s.sfp ? `${ifName(dk, n)}, 10 Gb SFP+` : `${ifName(dk, n)}, 1 Gb RJ-45`); }
  });
  if (bench) return g;
  const zs = CG.zs + cvD;
  // the arm: tabs while it goes on, then each guide's flap and the two straps
  if (!ready) {
    const T3 = { outer: box(CG.O[0] - 16, 74, CG.O[0] + 22, 102, CG.O[1] - 6), inner: box(CG.I0[0] - 16, 44, CG.I0[0] + 22, 70, CG.I0[1] + cvD - 2), slider: box(CG.SR[0] - 26, 62, CG.SR[0] + 10, 96, CG.SR[1] - 6) };
    const nm = { outer: 'Tab on the outer arm (farthest from the server): slide it onto the left outer rail', inner: 'Tab on the inner arm (closest to the server): slide it onto the left inner rail', slider: 'Width-adjustment slider tab: onto the right outer rail' };
    ['outer', 'inner', 'slider'].forEach(k => { if (!r.tabs[k]) g += zr('cmaTab', k, nm[k], T3[k]); });
  } else {
    const A = armAt(cvD);
    [...CG.inB.map(s => [true, s]), ...CG.outB.map(s => [false, s])].forEach(([inner, s], i) => {
      const on = inner ? onIn : onOut, open = r.lids[i], p = [on(A, s - 17, BASK.front, open ? -36 : 22), on(A, s + 17, BASK.front, 88)].map(P3);
      g += zr('cmaLid', i, `Cable guide ${i + 1} on the ${inner ? 'inner' : 'outer'} arm: flap ${open ? 'open, press it down to close' : 'closed, lift to open'}`, [p[0][0], p[0][1], p[1][0], p[1][1]], 3);
    });
    ['exit', 'elbow'].forEach(k => { const s = CG.strap[k], p = [onOut(A, s - 8, -30, 30), onOut(A, s + 8, -30, r.straps[k] ? 72 : 118)].map(P3); g += zr('cmaStrap', k, `Hook-and-loop strap ${k === 'exit' ? 'at the fixed end of the arm' : 'near the elbow'}: ${r.straps[k] ? 'fastened' : 'open'}`, [p[0][0], p[0][1], p[1][0], p[1][1]], 3); });
  }
  // the server's ports, on top of everything
  const pz = (k, w, h, label) => { const [x, y] = CPORT[k], a = cwp(x - w, y - h, zs), b = cwp(x + w, y + h, zs); return zr('port', k, label, [a[0], a[1], b[0], b[1]], 3); };
  const vic = vicSlot(t) && !riserOut(t);
  const to = k => t.cables[k] ? `, ${k.startsWith('psu') ? 'cord ' : ''}to ${portTxtC(t.cables[k], cabN(t, k))}` : ', empty';
  g += pz('psu2', 14, 12, `PSU 2 power inlet${to('psu2')}`) + pz('psu1', 14, 12, `PSU 1 power inlet${to('psu1')}`);
  if (vic) g += pz('vic2', 7.2, 6, `VIC PORT 2 (10 Gb SFP+)${to('vic2')}`) + pz('vic1', 7.2, 6, `VIC PORT 1 (10 Gb SFP+)${to('vic1')}`);
  g += pz('mgmt', 8, 7, `MGMT port (1 Gb, Cisco IMC)${to('mgmt')}`);
  return g;
}

// keyframes of the demonstration: hold, slide out (ease), hold out, slide back in, hold
function cmAnim(t) {
  const r = arm(t), da = cmDemoAt ? (Date.now() - cmDemoAt) / 1000 : 99;
  if (!(da < CM_DEMO && r.pos === 'in' && r.routed)) return null;
  const kt = [0, 0.06, 0.12, 0.18, 0.24, 0.3, 0.36, 0.42, 0.5, 0.58, 0.64, 0.7, 0.76, 0.82, 0.88, 0.94, 1];
  const prof = x => x < 0.06 ? 0 : x < 0.42 ? (1 - Math.cos(Math.PI * (x - 0.06) / 0.36)) / 2 : x < 0.58 ? 1 : x < 0.94 ? (1 + Math.cos(Math.PI * (x - 0.58) / 0.36)) / 2 : 0;
  return { ds: kt.map(x => Math.round(CG.travel * prof(x))), kt: kt.join(';'), dur: CM_DEMO, age: da };
}

/* ---- the top view: the same arm, seen from above, folding and unfolding with the server ---- */
const PV = { x0: 20, y0: 42, s: 0.5, X0: -420, Z1: 466, Z0: -172 };
const pvp = (x, z) => [PV.x0 + (x - PV.X0) * PV.s, PV.y0 + (PV.Z1 - z) * PV.s];
function planScene(t) {
  const r = arm(t), bench = r.pos === 'bench', anyTab = r.tabs.outer || r.tabs.inner || r.tabs.slider;
  cvMemo = new Map(); cvD = r.pos === 'service' ? CG.travel : 0; CVA = cmAnim(t);
  const [X0, Y0] = pvp(-420, PV.Z1), [X1, Y1] = pvp(420, PV.Z0);
  const R = (x0, z0, x1, z1, fill, extra = '') => { const a = pvp(x0, z1), b = pvp(x1, z0); return `<rect x="${f2(a[0])}" y="${f2(a[1])}" width="${f2(b[0] - a[0])}" height="${f2(b[1] - a[1])}" fill="${fill}"${extra}/>`; };
  const L2 = P => dLine(P.map(p => pvp(p[0], p[1])));
  let g = `<defs><clipPath id="pvclip"><rect x="${f2(X0)}" y="${f2(Y0)}" width="${f2(X1 - X0)}" height="${f2(Y1 - Y0)}" rx="6"/></clipPath></defs><rect x="${f2(X0)}" y="${f2(Y0)}" width="${f2(X1 - X0)}" height="${f2(Y1 - Y0)}" rx="6" fill="#10161B"/><g clip-path="url(#pvclip)">`;
  for (let z = -150; z <= PV.Z1; z += 50) g += `<path d="${L2([[-420, z], [420, z]])}" stroke="#16202A" stroke-width="1"/>`;
  g += R(-400, PV.Z0, -394, PV.Z1, '#2A3540') + R(394, PV.Z0, 400, PV.Z1, '#2A3540');
  [-1, 1].forEach(sx => { g += R(sx < 0 ? -241 : 225, -14, sx < 0 ? -225 : 241, 30, '#596169'); });
  Object.keys(CG.pdu).forEach(dk => { const [a, b] = CG.pdu[dk]; g += R(a, CG.pduZ, b, CG.pduZ + 44, '#1D2125', ` stroke="${dk === 'pduA' ? '#D8462E' : '#2F78D6'}" stroke-width="1.5"`); });
  g += R(CG.lace[0], -40, CG.lace[1], -22, '#4E555C');
  [-1, 1].forEach(sx => { g += R(sx < 0 ? -226 : 219, -125, sx < 0 ? -219 : 226, 900, '#7C858D'); });
  if (!bench) {
    g += pth(d => dPoly([[-214, CG.zs + d], [214, CG.zs + d], [214, 1200], [-214, 1200]].map(p => pvp(...p))), 'fill="#59626A" stroke="#8E979F" stroke-width="1"');
    g += pth(d => dPoly([[-214, CG.zs + d], [214, CG.zs + d], [214, CG.zs + d + 16], [-214, CG.zs + d + 16]].map(p => pvp(...p))), 'fill="#9FA8AF"');
    g += pth(d => dPoly([[120, CG.zs + d + 2], [212, CG.zs + d + 2], [212, CG.zs + d + 120], [120, CG.zs + d + 120]].map(p => pvp(...p))), 'fill="#4A5259"');
    [-1, 1].forEach(sx => { g += pth(d => dPoly([[sx < 0 ? -219 : 214, CG.I0[1] + d], [sx < 0 ? -214 : 219, CG.I0[1] + d], [sx < 0 ? -214 : 219, 1200], [sx < 0 ? -219 : 214, 1200]].map(p => pvp(...p))), 'fill="#B4BCC3"'); });
    if (anyTab) {
      const op = r.tabs.outer ? '' : ' opacity=".4"';
      g += `<g${op}>` + pth(d => { const A = armAt(d); return L2([A.I, A.E]); }, 'stroke="#8B949C" stroke-width="6" stroke-linecap="round"') + pth(d => { const A = armAt(d); return L2([A.O, A.E]); }, 'stroke="#A3ACB4" stroke-width="6" stroke-linecap="round"');
      if (r.tabs.slider) g += pth(d => { const A = armAt(d); return L2([CG.SR, A.E]); }, 'stroke="#C4CBD1" stroke-width="2.6" stroke-linecap="round"');
      g += '</g>';
    }
    // cables, in plan: each one follows its own place in the bundle
    Object.keys(CSPEC).forEach(k => {
      const m = cableMode(t, k); if (!m) return;
      const kind = CSPEC[k].kind, c = CKIND[kind], w = kind === 'power' ? 3.2 : kind === 'cat6' ? 2.6 : 1.7;
      const fn = d => dLine(crSample(cabRoute(t, k, d, m).P.map(p => pvp(p[0], p[2])), 5));
      g += pth(fn, `fill="none" stroke="${c.edge}" stroke-width="${w + 1.1}" stroke-linejoin="round" stroke-linecap="round"`) + pth(fn, `fill="none" stroke="${c.col}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`);
    });
    if (anyTab) {
      let b = '';
      [...CG.inB.map(s => [true, s]), ...CG.outB.map(s => [false, s])].forEach(([inner, s], i) => {
        const open = r.lids[i];
        b += pth(d => { const A = armAt(d), on = inner ? onIn : onOut; return dPoly([on(A, s - 17, 7, 0), on(A, s + 17, 7, 0), on(A, s + 17, -33, 0), on(A, s - 17, -33, 0)].map(p => pvp(p[0], p[2]))); }, `fill="${open ? '#2C3035' : '#3A3F45'}" fill-opacity="${open ? 0.35 : 0.92}" stroke="#16181B" stroke-width="1"`);
      });
      b += pth(d => { const A = armAt(d), [x, y] = pvp(...A.E); return `M${f2(x - 6)} ${f2(y)}a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z`; }, 'fill="#C4CBD1" stroke="#3C4248" stroke-width="1.4"');
      [['outer', CG.O], ['inner', CG.I0], ['slider', CG.SR]].forEach(([k, at]) => { if (!r.tabs[k]) return; b += pth(d => { const [x, z] = k === 'inner' ? [at[0], at[1] + d] : at, [px, py] = pvp(x, z); return `M${f2(px - 5)} ${f2(py - 5)}h10v10h-10Z`; }, 'fill="#E3E7EA" stroke="#5B636A"'); });
      g += r.tabs.outer ? b : `<g opacity=".4">${b}</g>`;
    }
  }
  g += '</g>';
  const lb = (x, z, s, a = 'middle', c = '#AEB8C1') => { const [px, py] = pvp(x, z); return `<text x="${f2(px)}" y="${f2(py)}" text-anchor="${a}" style="font:600 10px var(--font);fill:${c};paint-order:stroke;stroke:#10161B;stroke-width:3px">${esc(s)}</text>`; };
  g += lb(-410, PV.Z0 + 10, 'REAR (you)', 'start', '#8E99A3') + lb(-410, PV.Z1 - 22, 'FRONT', 'start', '#8E99A3') + lb(0, PV.Z1 - 40, bench ? 'Slide rails, empty' : r.pos === 'service' ? 'Server, slid out' : 'Server, seen from above', 'middle', '#E6EBEF');
  g += lb(-335, -64, 'PDUs') + lb(-269, -140, 'lacing bar');
  if (!bench && cmaReady(t) && !CVA && r.pos === 'in') g += lb(-200, -28, 'inner arm', 'start', '#DCE3E9') + lb(-120, -164, 'outer arm (fixed end)', 'start', '#DCE3E9') + lb(250, -62, 'elbow', 'start', '#DCE3E9') + lb(250, -140, 'width slider', 'start', '#DCE3E9');
  CVA = null;
  return g;
}

/* ---- beside the top view: what each cable is, where it goes, and the arm's state ---- */
const CROUTE = { psu1: 'PSU 1', psu2: 'PSU 2', vic1: 'VIC PORT 1', vic2: 'VIC PORT 2', mgmt: 'MGMT' };
const CSHORT = { power: 'C13 to C14 power cord', fiber: 'LC duplex fibre, SFP-10G-SR optics', cat6: 'Cat 6 patch cord, RJ-45' };
function swatch(kind, x, y) {
  const c = CKIND[kind], w = kind === 'power' ? 6 : kind === 'cat6' ? 4.6 : 2.6, d = `M${x} ${y}h40`;
  let s = `<path d="${d}" stroke="${c.edge}" stroke-width="${w + 1.3}" stroke-linecap="round"/><path d="${d}" stroke="${c.col}" stroke-width="${w}" stroke-linecap="round"/>`;
  if (kind === 'fiber') s += `<path d="${d}" stroke="${c.seam}" stroke-width=".5"/>`;
  s += `<path d="M${x} ${f2(y - w * 0.22)}h40" stroke="${c.hi}" stroke-width="${f2(w * 0.26)}" opacity=".5"/>`;
  s += kind === 'power' ? `<rect x="${x + 38}" y="${y - 8}" width="13" height="16" rx="2" fill="#16181B" stroke="#3A3E44"/>` : kind === 'fiber' ? `<rect x="${x + 38}" y="${y - 4}" width="8" height="8" fill="#E6DDC6"/><rect x="${x + 46}" y="${y - 5}" width="9" height="10" fill="#C4CBD1"/>` : `<rect x="${x + 38}" y="${y - 5}" width="9" height="10" fill="#D6CDB6"/><rect x="${x + 47}" y="${y - 4}" width="6" height="8" fill="#C7D3D9"/>`;
  return s;
}
function legendSvg(t) {
  const r = arm(t), ready = cmaReady(t), X = 454;
  let g = `<text x="${X}" y="58" class="st">Cables</text>`, y = 80;
  Object.keys(CSPEC).forEach(k => {
    const m = cableMode(t, k), dw = CDEF[k], to = CG.pdu[dw] ? wantTxt(k) : `${wantTxt(k)} (${ifName(dw, CWANT[k])})`;
    const st = m && cabWrong(t, k) ? [`&#10007; wrong: in ${portTxtC(t.cables[k], cabN(t, k))}`, '#FF8A7A'] : !m ? ['not connected', '#8E99A3'] : m === 'laid' ? ['in the arm', '#45D07F'] : m === 'dangle' ? ['in the arm, unplugged at the server', '#FFB52E'] : ['hanging loose, not in the arm', '#FF8A7A'];
    g += swatch(CSPEC[k].kind, X + 2, y) + `<text x="${X + 66}" y="${y - 2}" style="font:700 11px var(--font);fill:#E6EBEF">${CROUTE[k]} &#8594; ${esc(to)}</text><text x="${X + 66}" y="${y + 11}" style="font:500 10px var(--font);fill:#AEB8C1">${CSHORT[CSPEC[k].kind]}: <tspan style="fill:${st[1]};font-weight:700">${st[0]}</tspan></text>`;
    y += 31;
  });
  g += `<text x="${X}" y="${y + 2}" style="font:500 10px var(--font);fill:#8E99A3">Ports from the work order. SW01 = data switch A, SW02 = data switch B,</text><text x="${X}" y="${y + 15}" style="font:500 10px var(--font);fill:#8E99A3">MGT01 = management switch</text>`;
  y += 13;
  const tabs = ['outer', 'inner', 'slider'].filter(k => r.tabs[k]).length, shut = r.lids.filter(o => !o).length, straps = ['exit', 'elbow'].filter(k => r.straps[k]).length;
  y += 30;
  const row = (ok, txt) => { const s = `<circle cx="${X + 8}" cy="${y - 4}" r="5.5" fill="${ok ? '#45D07F' : 'none'}" stroke="${ok ? '#45D07F' : '#8E99A3'}" stroke-width="1.5"/>${ok ? `<path d="M${X + 5.2} ${y - 4}l2 2l3.6 -4" stroke="#0E1A12" stroke-width="1.7" fill="none"/>` : ''}<text x="${X + 20}" y="${y}" style="font:500 11px var(--font);fill:#DCE3E9">${txt}</text>`; y += 19; return s; };
  g += `<text x="${X}" y="${y}" class="st">The arm</text>`; y += 21;
  g += row(tabs === 3, `Tabs on the rails: ${tabs} of 3 (outer, inner, width slider)`);
  g += row(ready && shut === CMA_N && Object.keys(r.laid).some(k => r.laid[k]), `Cable guides: ${shut} of ${CMA_N} flaps closed`);
  g += row(straps === 2, `Hook-and-loop straps: ${straps} of 2 fastened`);
  g += row(!!r.labeled, 'Labels at both ends of every cable');
  return g;
}

/* ---- the cable schedule from the work order: each cable's exact port, and where it is now ---- */
const CSCHED = [
  { k: 'vic1', cable: 'SFP-10G-SR optic, LC duplex OM3 fibre' },
  { k: 'vic2', cable: 'SFP-10G-SR optic, LC duplex OM3 fibre' },
  { k: 'mgmt', cable: 'Cat 6 UTP patch cord, RJ-45' },
  { k: 'psu1', cable: 'IEC C13 to C14 power cord' },
  { k: 'psu2', cable: 'IEC C13 to C14 power cord' }];
function schedC(t) {
  const u = t.rack.u || 0, vic = vicSlot(t) && !riserOut(t);
  const row = ({ k, cable }) => {
    const m = cableMode(t, k), dw = CDEF[k];
    const st = k.startsWith('vic') && !vic ? '<span style="color:var(--muted)">no VIC fitted yet</span>'
      : cabWrong(t, k) ? `<span style="color:var(--red);font-weight:700">&#10007; in ${esc(portTxtC(t.cables[k], cabN(t, k)))}</span>`
      : t.cables[k] ? `<span style="color:var(--touch);font-weight:700">&#10003; connected${t.rack.labeled ? ', labelled' : ''}</span>`
      : m === 'dangle' ? '<span style="color:var(--amber, #F0A93B)">unplugged at the server</span>' : '<span style="color:var(--muted)">not connected</span>';
    return `<tr><td><b>${ROLE[k]}</b></td><td>${esc(CROUTE[k])}</td><td><b>${esc(wantTxt(k))}</b></td><td>${CG.pdu[dw] ? 'C13 outlet, 230 V' : esc(ifName(dw, CWANT[k]) + (TORS[dw].sfp ? ', 10 Gb SFP+' : ', 1 Gb RJ-45'))}</td><td>${esc(cable)}</td><td>${st}</td></tr>`;
  };
  return `<div class="csched"><h3>Cable schedule (work order): DC1-R12-U${u ? String(u).padStart(2, '0') : '--'}, SRV01</h3><table><tr><th>Role</th><th>From (server)</th><th>To</th><th>Interface</th><th>Cable</th><th>Now</th></tr>${CSCHED.map(row).join('')}</table><p class="cap" style="margin:6px 0 0">Switch ports: odd numbers on the top row, even numbers on the bottom row, counted from the left. PDU outlets are numbered beside each outlet. Hover a port or an outlet to see its number.</p></div>`;
}
(() => {
  if (document.getElementById('cis-cab-css')) return;
  const s = document.createElement('style'); s.id = 'cis-cab-css';
  s.textContent = `.csched{margin:10px 0;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 12px;overflow-x:auto}
.csched h3{margin:0 0 6px;font-size:15px}.csched table{border-collapse:collapse;width:100%;font-size:12.5px;min-width:600px}
.csched th{text-align:left;color:var(--muted);font-weight:600;border-bottom:1px solid var(--line);padding:4px 6px}.csched td{padding:5px 6px;border-bottom:1px solid var(--line);vertical-align:top}
#stage .ptip{display:none;pointer-events:none}#stage .hot:hover .ptip,#stage .hot:focus-visible .ptip{display:inline}`;
  Sim.addCss(s);
})();

Sim.registerView({
  id: 'cable', title: 'Cables and arm',
  keep: [
    ["Follow the cable schedule", "The work order gives every cable its exact switch port or PDU outlet. A cable in the wrong switch port lands in a port that is shut down or in another VLAN: no link, or the wrong network."],
    ["Odd up, even down", "On these switches port 1 is top left and port 2 is below it: odd numbers on the top row, even numbers on the bottom row. Port 23 is the 12th from the left on the top row."],
    ["Two power feeds", "Plug PSU 1 and PSU 2 into different PDUs fed from different circuits (feed A and feed B). Then the server keeps running if one feed is lost."],
    ["Two switches for data", "VIC PORT 1 and PORT 2 go to two different data switches, so the server stays connected if one switch or cable fails."],
    ["Management stays separate", "The MGMT port goes to the out-of-band management switch, never to a data switch. That path must work when the data network does not."],
    ["Fit the arm in order", "Outer arm's tab onto the fixed outer rail first, then the inner arm's tab onto the server's inner rail, then pull out the width-adjustment slider and clip it onto the opposite rail."],
    ["Follow the whole arm", "Every rear cable runs from its connector into the inner arm, along it, round the elbow with a loose loop, back along the outer arm and out at the fixed end. Then the arm, not the connectors, takes the movement when the server slides."],
    ["Close every guide", "Lift the hinged flap, lay the cables in, press the flap down until it clicks. A cable outside a guide can snag the rail or the server below."],
    ["Straps, not ties", "Bundle with hook-and-loop straps, snug, not tight. Cable ties crush fibre and twinax and must be cut to change one cable."],
    ["Bend radius", "Do not bend fibre tighter than its minimum bend radius (about 30 mm for LC patch cords): give the elbow loop room."],
    ["Optics safety", "Never look into an SFP+ optic or a fibre end: the laser light is invisible. Keep dust caps on unused optics and fibre ends."],
    ["Label both ends", "Every cable carries a label at each end that names the location, both endpoints and the role, so anyone can trace it without pulling on it."],
    ["Test the slide", "When the cabling is done, slide the server out and back once, slowly. Every connector must stay in place and nothing may snag."],
    ["Training deck", "Slides 29 to 35: the cable management arm, label format, and the route, secure, label, cycle, verify workflow. Slide 80: NIC anatomy. Slide 103: out-of-band management."]],
  render(t) {
    syncRouted(t);
    const r = arm(t), rear = rearScene(t) + rearZones(t), hint = r.pos === 'bench' ? '' : `<text x="450" y="${CW.SB + 17}" text-anchor="middle" class="ss">Click a port on the server, then the exact switch port or PDU outlet from the cable schedule. Click a connected port to unplug it.</text>`;
    return frame('Rear of the rack: cables and the cable management arm', `<defs><clipPath id="cwclip"><rect x="10" y="32" width="880" height="${CW.SB - 32}" rx="8"/></clipPath></defs><g clip-path="url(#cwclip)">${rear}</g>${hint}`, CW.SB + 26)
      + (r.pos === 'bench' ? '' : schedC(t))
      + frame('Top view: the arm and the cables', planScene(t) + legendSvg(t), 380);
  },
  actions(t) {
    const r = arm(t), a = [];
    if (r.pos === 'bench') return a;
    const ready = cmaReady(t), ul = unlaid(t);
    if (ready && ul.length && !r.lids.every(Boolean)) a.push(button('Open the hinged flap on every cable guide', 'cmaFlaps'));
    if (ready && ul.length && r.lids.every(Boolean)) a.push(button(`Lay the ${ul.length === 1 ? 'cable' : ul.length + ' cables'} in the arm`, 'cmaLay'));
    if (!r.labeled) a.push(button('Fit printed labels at both ends', 'label'));
    if (r.routed && r.pos === 'in') a.push(button('Show the arm working: slide the server out and back', 'cmaDemo'));
    return a;
  },
  tray(t) {
    const u = t.rack.u || 0, loc = `DC1-R12-U${String(u).padStart(2, '0')}`;
    const rows = Object.keys(PORTS).filter(k => t.cables[k]).map(k => `<div class="dimmlabel" style="font-size:12px">${loc}-SRV01 | ${PORTS[k][4]} &harr; ${destTag(t.cables[k], cabN(t, k))} | ${ROLE[k]}</div>`).join('');
    return `<h2>Cabling notes</h2><img class="photo" alt="Photo of a cable management arm behind a server" src="${IMG.cma}"><p class="cap">A cable management arm seen from above, the server slid out: the cables ride in the guides along both arms and round the elbow (slide 30).</p>
      <h3>Fitting the arm (Cisco UCSC-CMAF-M4)</h3><ol class="rules" style="padding-left:20px"><li>Server pushed fully in</li><li>Outer arm's tab onto the end of the fixed outer rail, until it clicks</li><li>Inner arm's tab onto the end of the server's inner rail, until it clicks</li><li>Pull out the width-adjustment slider to the rack's width; its tab onto the opposite outer rail</li><li>Open the hinged flap on each guide, lay the cables in, close each flap</li></ol>
      <ul class="rules"><li>Power: black IEC C13 to C14 cords, PSU 1 to PDU A outlet 7 and PSU 2 to PDU B outlet 7: redundant as 1+1</li><li>Data: SFP-10G-SR optics in the VIC's PORT 1 and PORT 2 (riser 2, slot 5), orange LC duplex multimode fibre: PORT 1 to SW01 port 23 (Eth1/23), PORT 2 to SW02 port 23 (Eth1/23). Twinax (DAC) cables also fit SFP+ ports; RJ-45 does not</li><li>MGMT (M): Cat 6 patch cord to MGT01 port 12 (Gi0/12), for Cisco IMC</li><li>Ports already in use by other systems: SW01 and SW02 ports 1 to 6, 17 and 18; MGT01 ports 1 to 8; PDU outlets 9 to 11</li><li>LAN 1 and LAN 2, the onboard 1 Gb ports, are not used for data in this build</li><li>Controlled slack: a loose loop at the elbow, nothing hanging below the arm</li><li>Labels name both endpoints: location, source, destination, role</li></ul>` +
      (t.rack.labeled && rows ? `<h3>Labels fitted (slide 33 format)</h3>${rows}` : '');
  }
});
Sim.on('cmaTab', k => {
  const r = arm(T);
  if (r.pos === 'bench') return bad('Rack the server first. The arm fits on the ends of the slide rails.');
  if (r.pos !== 'in') return bad('Push the server fully into the rack first: the arm goes on with the server in.');
  if (!['outer', 'inner', 'slider'].includes(k) || r.tabs[k]) return;
  if (k === 'inner' && !r.tabs.outer) return bad('Start with the arm farthest from the server: slide its tab onto the end of the left outer slide rail, the fixed one, until it clicks.');
  if (k === 'slider' && !(r.tabs.outer && r.tabs.inner)) return bad('Fit both tabs at the hinge end first, outer rail then inner rail. The width-adjustment slider goes on last.');
  r.tabs[k] = true; cmMark('tab' + k); Sim.sound('tab'); syncRouted(T);
  say('ok', k === 'outer' ? 'Tab on the outer arm slid over the end of the left outer slide rail until it clicked and locked. The arm hangs from the rack now.'
    : k === 'inner' ? 'Tab on the inner arm slid over the end of the inner rail on the server until it clicked. This end moves with the server.'
      : 'Width-adjustment slider pulled out to the width of the rack and its tab slid onto the right outer rail until it clicked. The arm is fitted.');
});
Sim.on('cmaFlaps', () => {
  const r = arm(T); if (!cmaReady(T)) return bad('Fit the cable management arm first.');
  let n = 0;
  r.lids.forEach((o, i) => { if (!o) { cmFx['lid' + i] = { at: Date.now(), extra: 0, extra2: n * 0.07 }; r.lids[i] = true; Sim.sound('clipOpen', n * 0.07); n++; } });
  syncRouted(T); say('ok', `Hinged flap lifted on ${n === CMA_N ? `all ${CMA_N}` : n} cable guide${n === 1 ? '' : 's'}: they are open from the top.`);
});
Sim.on('cmaLay', () => {
  const r = arm(T), ul = unlaid(T);
  if (!cmaReady(T)) return bad('Fit the cable management arm first.');
  if (!ul.length) return say('info', 'Every connected cable is already in the arm.');
  if (!r.lids.every(Boolean)) return bad('Open the flap on every cable guide first: each cable runs through all of them.');
  ul.forEach(k => { r.laid[k] = true; }); cmMark('lay', ul); syncRouted(T);
  say('ok', `${ul.length === 1 ? 'Cable' : ul.length + ' cables'} laid in: from the connectors down into the inner arm, along it to the elbow, round the elbow in a loose loop, back along the outer arm and out at the fixed end. Power cords drop to the PDUs; data cables climb the lacing bar to the switches. Now close each flap.`);
});
Sim.on('cmaLid', i => {
  const r = arm(T); i = +i; if (!cmaReady(T) || !(i >= 0 && i < CMA_N)) return;
  const was = r.lids[i]; cmFx['lid' + i] = { at: Date.now(), extra: was ? lidOpenAng : 0 }; r.lids[i] = !was;
  Sim.sound(was ? 'clip' : 'clipOpen'); syncRouted(T);
  if (!was) return say('info', `Flap on guide ${i + 1} lifted open.`);
  const left = r.lids.filter(Boolean).length;
  say('ok', `Flap on guide ${i + 1} pressed down until it clicked.${left ? ` ${left} still open.` : ' Every guide is closed.'}`);
});
Sim.on('cmaStrap', k => {
  const r = arm(T); if (!cmaReady(T) || !CG.strap[k]) return;
  if (!r.straps[k] && !Object.keys(r.laid).some(x => r.laid[x])) return bad('Lay the cables in the arm first, then strap the bundle.');
  r.straps[k] = !r.straps[k]; cmMark('strap' + k); Sim.sound('velcro'); syncRouted(T);
  say(r.straps[k] ? 'ok' : 'info', r.straps[k] ? `Hook-and-loop strap ${k === 'exit' ? 'at the fixed end of the arm' : 'near the elbow'} wrapped round the bundle and pressed closed: snug, not tight, so nothing is crushed.` : 'Strap opened.');
});
Sim.on('cmaDemo', () => {
  if (!arm(T).routed || T.rack.pos !== 'in') return;
  cmDemoAt = Date.now();
  say('info', 'Watch both views: as the server slides out, the inner arm goes with it and the elbow opens toward the middle; the cables ride in the guides, so nothing pulls on a connector. Then the arm folds back as the server goes in.');
});
Sim.on('label', () => {
  if (!Object.values(T.cables).some(Boolean)) return bad('Connect the cables first, then label them.');
  const wrong = Object.keys(T.cables).filter(k => cabWrong(T, k));
  if (wrong.length) return bad(`Fix the cable${wrong.length > 1 ? 's' : ''} in the wrong port first (${wrong.map(k => `${CROUTE[k]} in ${portTxtC(T.cables[k], cabN(T, k))}`).join('; ')}): a label on a wrong cable is worse than none.`);
  const k0 = Object.keys(PORTS).find(k => T.cables[k]), loc = `DC1-R12-U${String(T.rack.u || 0).padStart(2, '0')}`;
  T.rack.labeled = true; say('ok', `Printed wraparound labels fitted at both ends of every cable, with the same ID at each end, for example "${loc}-SRV01 | ${PORTS[k0][4]} ↔ ${destTag(T.cables[k0], cabN(T, k0))} | ${ROLE[k0]}".`);
});
