/* ---- PCIe riser 2 and the 10 Gb data NIC (Cisco UCS VIC 1225, UCSC-PCIE-CSC-02).
   Redrawn from the trainer's photos of riser 2 (board 2U-RISER2 Rev:A1, slots 4, 5, 6), its securing plate, its blue card-tab
   retainer and the VIC, and from the C240 M4 service guide, "Replacing a PCIe Card".
   Riser 2 holds its cards flat, stacked: slot 4 at the bottom, 5 in the middle, 6 at the top (rear panel PCIe 4, 5, 6).
   Units are millimetres: u along the riser, from the front end (0, securing plate) to the rear panel (270);
   h = height above the motherboard when installed; on the mat, depth d = h (0 at the open bottom side). ---- */
const RSL = {
  4: { h: 20, conn: [110, 229], x24: true, lanes: 'x8', len: '3/4 length' },
  5: { h: 40, conn: [110, 229], x24: true, lanes: 'x16', len: 'full length' },
  6: { h: 60, conn: [140, 229], x24: false, lanes: 'x8', len: 'full length' } };
const RD = s => RSL[s].h;
const f1 = n => (+n).toFixed(1);
const pts = a => a.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' ');
const NSS = ' vector-effect="non-scaling-stroke"';
// tiny deterministic scatter of surface-mount parts, so the boards look populated but never change between renders
function smd(seed, n, x0, x1, y0, y1, col = '#2A2F33') {
  let r = seed, s = '';
  const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  for (let k = 0; k < n; k++) { const w = 1 + rnd() * 2.4, h = 0.8 + rnd() * 1.4, x = x0 + rnd() * (x1 - x0 - w), y = y0 + rnd() * (y1 - y0 - h); s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${rnd() > 0.7 ? '#C9B27A' : col}"/>`; }
  return s;
}

/* The VIC, component side, in card millimetres: x = 0 at the far end to 168 at the bracket; y = -v, v = 0 at the bottom of
   the edge-connector tab. o.tilt: optional push markers. */
const VIC = { body: 'M3 -62H165V-7.5H127V0H115.4V-4.5H113.6V0H38V-4.5H21V0H9V-7.5H3Z',
  gold: [[9, 21], [38, 113.6], [115.4, 127]],                       // NCSI extension, long and short x16 sections
  port1: [121, -25, 168, -9.5], port2: [121, -43, 168, -27], sink: [55, -59, 118, -8.6],
  pins: [[104, -12.4], [105, -42.6], [67, -13.9], [66, -43.3]] };
function vicFace(o = {}) {
  const dz = o.dz === undefined ? 1 : o.dz, kx = 0.5 * dz, ky = 0.38 * dz;   // how far the parts stand out of the board
  let s = `<path d="${VIC.body}" fill="#2B7A3D" stroke="#123D1E" stroke-width="0.5"/>`;
  s += `<path d="M5 -60H163" stroke="#3D9150" stroke-width="0.6"/>` + smd(7, 70, 6, 52, -58, -10) + smd(11, 26, 122, 162, -60, -45) + smd(19, 24, 56, 118, -7.4, -3);
  VIC.gold.forEach(([a, b]) => { s += `<rect x="${a}" y="-6.2" width="${f1(b - a)}" height="6.2" fill="#D6AE4E"/>`; for (let x = a + 0.5; x < b; x += 1) s += `<path d="M${f1(x)} -6V0" stroke="#A88227" stroke-width="0.35"/>`; });
  s += `<rect x="20" y="-41" width="11.5" height="13.3" rx="0.6" fill="#1C1F22"/><text x="25.7" y="-33" text-anchor="middle" style="font:700 2.6px var(--mono);fill:#9AA2AA">2555F</text>`;
  s += `<rect x="35.4" y="-22.9" width="9.6" height="10.5" rx="0.5" fill="#1C1F22"/><rect x="11.5" y="-38" width="3.8" height="4.6" rx="0.6" fill="#C9CED3"/>`;
  s += `<rect x="64" y="-13.6" width="47" height="4.6" fill="#F4F4EC" stroke="#B9B9AA" stroke-width="0.3"/><text x="87.5" y="-10.3" text-anchor="middle" style="font:600 3px var(--mono);fill:#1A1A1A">UCSC-PCIE-CSC-02 V03</text>`;
  // a box standing out of the board by t mm: right face, top face, then the front face (moved left and down)
  const box = (x0, y0, x1, y1, t, side, top, front) => {
    const dx = -kx * t, dy = ky * t;
    return `<path d="M${x1} ${y0}L${f1(x1 + dx)} ${f1(y0 + dy)}V${f1(y1 + dy)}L${x1} ${y1}Z" fill="${side}"/><path d="M${x0} ${y0}H${x1}L${f1(x1 + dx)} ${f1(y0 + dy)}H${f1(x0 + dx)}Z" fill="${top}"/>` +
      `<rect x="${f1(x0 + dx)}" y="${f1(y0 + dy)}" width="${f1(x1 - x0)}" height="${f1(y1 - y0)}" fill="${front}"/>`; };
  // heatsink: cross-cut fins and four white push pins
  const [hx0, hy0, hx1, hy1] = VIC.sink, ht = 10, hdx = -kx * ht, hdy = ky * ht;
  s += box(hx0, hy0, hx1, hy1, ht, '#0B0D0F', '#2A2F35', '#15181B');
  for (let y = hy0 + 2.4; y < hy1 - 1; y += 2.6) s += `<path d="M${f1(hx0 + hdx + 0.6)} ${f1(y + hdy)}H${f1(hx1 + hdx - 0.6)}" stroke="#30363C" stroke-width="0.9"/>`;
  [76, 97].forEach(x => { s += `<rect x="${f1(x + hdx)}" y="${f1(hy0 + hdy)}" width="1.8" height="${f1(hy1 - hy0)}" fill="#0B0D0F"/>`; });
  VIC.pins.forEach(([x, y]) => { s += `<path d="M${f1(x + hdx - 3)} ${f1(y + hdy)}l1.5 -2.6h3l1.5 2.6l-1.5 2.6h-3z" fill="#F2F4F5" stroke="#9AA2AA" stroke-width="0.3"/>`; });
  // the two SFP+ cages at the bracket end: PORT 1 next to the edge connector, PORT 2 above it
  [[VIC.port1, '1'], [VIC.port2, '2']].forEach(([[x0, y0, x1, y1], n]) => {
    s += box(x0, y0, x1, y1, 9, '#7E868D', '#E3E7EA', '#C2C9CF');
    const ox = -kx * 9, oy = ky * 9;
    for (let c = 0; c < 6; c++) for (let r = 0; r < 2; r++) s += `<circle cx="${f1(x0 + ox + 5 + c * 6.4)}" cy="${f1(y0 + oy + 4.6 + r * 6.2)}" r="1.5" fill="#8E969D"/>`;
    s += `<text x="${f1(x0 + ox + 3)}" y="${f1(y1 + oy - 1.2)}" style="font:700 3px var(--font);fill:#3A4046">PORT ${n}</text>`;
  });
  // bracket, edge-on: full height, with the tab that the card-tab retainer holds; two screws fix it to the card
  s += `<path d="M165 13L166.5 14H167.5L168 13V-108H165Z" fill="#B4BCC4" stroke="#6E767D" stroke-width="0.4"/><rect x="162.5" y="-110.6" width="11" height="2.8" rx="0.6" fill="#B4BCC4" stroke="#6E767D" stroke-width="0.4"/>`;
  [-10.5, -56].forEach(y => { s += `<circle cx="157" cy="${y}" r="2.2" fill="#C9CED3" stroke="#6E767D" stroke-width="0.4"/><path d="M155.6 ${y}h2.8M157 ${y - 1.4}v2.8" stroke="#5B636A" stroke-width="0.5"/>`; });
  return s;
}
// a blanking panel seen from the rear, as installed: w x h box, perforated
function blankRear(x, y, w, h, sc = 1) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#B9C1C8" stroke="#7E868D" stroke-width="${sc}"/>`;
  const n = Math.max(4, Math.floor(w / (9 * sc))), gap = w / n;
  for (let k = 0; k < n; k++) s += `<rect x="${f1(x + gap * k + gap * 0.3)}" y="${f1(y + h * 0.22)}" width="${f1(gap * 0.4)}" height="${f1(h * 0.56)}" rx="${f1(0.8 * sc)}" fill="#59626A"/>`;
  return s;
}
// the VIC bracket seen from the rear, as installed (riser board on the right): vents, then PORT 2 and PORT 1 with their ACT/LINK LEDs
function vicRear(x, y, w, h, sc = 1, l1 = false, l2 = false) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#C3CAD0" stroke="#7E868D" stroke-width="${sc}"/>`;
  for (let c = 0; c < 7; c++) for (let r = 0; r < 2; r++) s += `<circle cx="${f1(x + w * 0.06 + c * w * 0.052)}" cy="${f1(y + h * (0.33 + r * 0.34))}" r="${f1(1.1 * sc)}" fill="#59626A"/>`;
  const cage = (cx, n) => { const cw = w * 0.15, ch = h * 0.56, cy = y + h * 0.26; return `<rect x="${f1(cx)}" y="${f1(cy)}" width="${f1(cw)}" height="${f1(ch)}" rx="${f1(0.6 * sc)}" fill="#1A1E22" stroke="#E3E7EA" stroke-width="${f1(1.2 * sc)}"/><rect x="${f1(cx + cw * 0.18)}" y="${f1(cy + ch * 0.38)}" width="${f1(cw * 0.64)}" height="${f1(ch * 0.24)}" fill="#3A3F45"/>`; };
  const led = (cx, on) => `<circle cx="${f1(cx)}" cy="${f1(y + h * 0.36)}" r="${f1(1.3 * sc)}" fill="${on ? '#45D07F' : '#3A3F45'}" stroke="#59626A" stroke-width="${f1(0.4 * sc)}"/><circle cx="${f1(cx)}" cy="${f1(y + h * 0.64)}" r="${f1(1.3 * sc)}" fill="${on ? '#FFB52E' : '#3A3F45'}" stroke="#59626A" stroke-width="${f1(0.4 * sc)}"/>`;
  s += led(x + w * 0.47, l2) + cage(x + w * 0.51, 2) + cage(x + w * 0.68, 1) + led(x + w * 0.87, l1);
  if (h * 0.22 > 5) s += `<text x="${f1(x + w * 0.585)}" y="${f1(y + h * 0.2)}" text-anchor="middle" style="font:700 ${f1(Math.min(9, h * 0.2))}px var(--font);fill:#2A2F35">PORT 2</text><text x="${f1(x + w * 0.755)}" y="${f1(y + h * 0.2)}" text-anchor="middle" style="font:700 ${f1(Math.min(9, h * 0.2))}px var(--font);fill:#2A2F35">PORT 1</text>`;
  return s;
}

/* ---- the riser in the chassis: side view, looking at the riser board (front of the server at the left) ---- */
const RSC = 2.15, RX = u => 118 + RSC * u, RY = h => 396 - RSC * h;
let riserFx = {};
const rfxMark = (k, from) => { riserFx[k] = { at: Date.now(), from }; };
const rfxAge = k => riserFx[k] ? (Date.now() - riserFx[k].at) / 1000 : 99;
function riserPose(r) {
  if (r.loc === 'up') return { lift: 80, ang: 0, pv: 0 };
  const f = r.up.f ? 14 : 0, b = r.up.r ? 14 : 0, span = RX(272) - RX(0);
  if (f === b) return { lift: f, ang: 0, pv: 0 };
  // one end engaged: pivot on that end; front up = clockwise about the rear end, rear up = anticlockwise about the front end
  return f > b ? { lift: b, ang: Math.atan(f / span) * 180 / Math.PI, pv: RX(272) } : { lift: f, ang: -Math.atan(b / span) * 180 / Math.PI, pv: RX(0) };
}
function hand(x, y) {
  return `<g pointer-events="none"><path d="M${x - 21} ${y - 34}C${x - 24} ${y - 52} ${x + 24} ${y - 52} ${x + 21} ${y - 34}L${x + 18} ${y - 7}H${x - 18}Z" fill="#E2B08A" stroke="#9C6B47" stroke-width="1.4"/>` +
    [-12, -4, 4, 12].map(dx => `<rect x="${x + dx - 3.8}" y="${y - 12}" width="7.6" height="${dx === -12 || dx === 12 ? 17 : 20}" rx="3.8" fill="#E2B08A" stroke="#9C6B47" stroke-width="1.1"/>`).join('') + `</g>`;
}
function riserSideSvg(t) {
  const r = t.riser, P = riserPose(r), prev = riserFx.pose, age = rfxAge('pose');
  let g = `<rect x="18" y="48" width="864" height="388" rx="8" fill="#1B2B37" stroke="#2E5571"/>`;
  g += `<text x="34" y="70" class="st">Riser 2 in the chassis, side view</text><text x="34" y="428" class="ss">&#9664; Front of the server</text><text x="866" y="428" text-anchor="end" class="ss">Rear &#9654;</text>`;
  // chassis: floor, motherboard, CPU 2 heatsink beyond, rear wall with one of the two alignment channels
  g += `<rect x="24" y="408" width="852" height="8" fill="#9AA3AB"/><rect x="26" y="396" width="${RX(276) - 26}" height="12" fill="#1E5B3E" stroke="#0F3A26"/>`;
  g += `<g opacity=".55"><rect x="28" y="276" width="78" height="120" fill="#7E868D"/>${Array.from({ length: 12 }, (_, k) => `<path d="M${32 + k * 6.4} 280V392" stroke="#C9D0D6" stroke-width="2.4"/>`).join('')}<text x="67" y="268" text-anchor="middle" class="ss">CPU 2 heatsink</text></g>`;
  const wx = RX(275);
  g += `<rect x="${wx}" y="150" width="36" height="258" fill="#A9B2BA" stroke="#5B636A"/><rect x="${wx + 3}" y="${RY(80)}" width="9" height="${RY(0) - RY(80)}" fill="#2A3138"/><text x="${wx + 44}" y="170" class="ss">Chassis</text><text x="${wx + 44}" y="184" class="ss">rear wall</text>`;
  g += `<path d="M${wx + 12} ${RY(70)}H${wx + 42}" stroke="#FFB52E" stroke-width="1.2"/><text x="${wx + 44}" y="${RY(70) - 3}" class="ss" style="fill:#FFD27A">Alignment</text><text x="${wx + 44}" y="${RY(70) + 11}" class="ss" style="fill:#FFD27A">channels (2)</text>`;
  g += `<rect x="${RX(104)}" y="${RY(6)}" width="${RX(232) - RX(104)}" height="${RY(0) - RY(6)}" fill="#111417" stroke="#3A4046"/><path d="M${RX(106)} ${RY(3)}H${RX(230)}" stroke="#3A4046" stroke-width="2"/>`;
  g += `<text x="${RX(168)}" y="405.5" text-anchor="middle" style="font:700 8px var(--font);fill:#F4F6F8">RISER2</text>`;
  [12, 262].forEach(u => { g += `<rect x="${RX(u) - 3}" y="${RY(16)}" width="6" height="${RY(0) - RY(16)}" rx="3" fill="#D3DAE0" stroke="#5B636A"/>`; });
  g += `<path d="M${RX(262) + 3} ${RY(15)}H${wx + 42}" stroke="#FFB52E" stroke-width="1.2"/><text x="${wx + 44}" y="${RY(15) - 3}" class="ss" style="fill:#FFD27A">Alignment pegs (2)</text><text x="${wx + 44}" y="${RY(15) + 11}" class="ss" style="fill:#FFD27A">on the motherboard</text>`;
  // the riser itself
  let z = '';
  const pcb = `M${RX(88)} ${RY(76)}H${RX(262)}V${RY(8)}H${RX(232)}V${RY(1)}H${RX(104)}V${RY(8)}H${RX(88)}Z`;
  z += `<path d="${pcb}" fill="#1F6B45" stroke="#0E3B22" stroke-width="1.5"/><rect x="${RX(105)}" y="${RY(6)}" width="${RX(231) - RX(105)}" height="${RY(1) - RY(6)}" fill="#D6AE4E"/>`;
  z += `<text x="${RX(150)}" y="${RY(70)}" style="font:600 8px var(--mono);fill:#DCE8DF">2U-RISER2 Rev:A1</text><text x="${RX(95)}" y="${RY(70)}" style="font:700 7.5px var(--font);fill:#DCE8DF">cisco</text>`;
  ['6', '5', '4'].forEach(s => {
    const c = RSL[s];
    z += `<rect x="${RX(c.conn[0])}" y="${RY(c.h + 7.5)}" width="${RX(c.conn[1]) - RX(c.conn[0])}" height="${RSC * 7.5}" rx="1.5" fill="#15181B"/><path d="M${RX(c.conn[0]) + 3} ${RY(c.h + 3.75)}H${RX(c.conn[1]) - 3}" stroke="#4A5057" stroke-width="1.6"/>`;
    z += `<text x="${RX(90)}" y="${RY(c.h + 1.5)}" style="font:700 8px var(--font);fill:#F4F6F8">SLOT${s}</text>`;
  });
  [[238, 30], [246, 30], [254, 30], [238, 50], [246, 50], [238, 70], [250, 70]].forEach(([u, h]) => { z += `<circle cx="${RX(u)}" cy="${RY(h)}" r="3.6" fill="#D3DAE0" stroke="#5B636A"/><circle cx="${RX(u)}" cy="${RY(h)}" r="1.4" fill="#2F6FB0"/>`; });
  z += `<rect x="${RX(90)}" y="${RY(17)}" width="${RSC * 11}" height="${RSC * 8}" fill="#EDE6D3" stroke="#9C9580"/>${[0, 1, 2, 3].map(k => `<circle cx="${RX(92 + k * 2.4)}" cy="${RY(13)}" r="1.3" fill="#B39B57"/>`).join('')}`;
  // cage: black top plate; the securing plate's folded edge on the far side of the front end (inside face, black pads, hinge-tabs
  // up by the top plate) and its flat body under the front end, edge-on, with the captive thumbscrew below it; rear panel and retainer
  z += `<rect x="${RX(0)}" y="${RY(83)}" width="${RX(272) - RX(0)}" height="${RSC * 5}" fill="#1B1F24" stroke="#000"/>`;
  z += `<rect x="${RX(0)}" y="${RY(80)}" width="${RX(86) - RX(0)}" height="${RY(5) - RY(80)}" fill="#B9C1C8" stroke="#6E767D"/>`;
  SPL.tabs.forEach(u => { z += `<rect x="${RX(u)}" y="${RY(83)}" width="${RSC * 10}" height="${RSC * 3.5}" rx="1" fill="#A9B2BA" stroke="#6E767D"/>`; });
  z += `<rect x="${RX(8)}" y="${RY(61)}" width="${RSC * 62}" height="${RSC * 38}" rx="3" fill="#1C2024"/><rect x="${RX(9)}" y="${RY(20)}" width="${RSC * 60}" height="${RSC * 14}" rx="3" fill="#1C2024"/>`;
  z += `<rect x="${RX(0)}" y="${RY(6)}" width="${RX(86) - RX(0)}" height="${RSC * 2}" fill="#CBD2D8" stroke="#6E767D"/><rect x="${RX(SPL.knob[0] - 5)}" y="${RY(4)}" width="${RSC * 10}" height="${RSC * 3.6}" rx="2" fill="#5B8BD9" stroke="#2C4F8E"/>`;
  z += `<rect x="${RX(266)}" y="${RY(83)}" width="${RSC * 6}" height="${RY(2) - RY(83)}" fill="#C5CCD3" stroke="#6E767D"/><rect x="${RX(259)}" y="${RY(78)}" width="${RSC * 6}" height="${RY(10) - RY(78)}" rx="2" fill="#7FA3E0" stroke="#2C4F8E"/>`;
  z += `<rect x="${RX(256)}" y="${RY(13)}" width="${RSC * 12}" height="${RSC * 3}" fill="#C5CCD3" stroke="#6E767D"/><rect x="${RX(0)}" y="${RY(14)}" width="${RSC * 34}" height="${RSC * 8}" fill="#E9ECEF" stroke="#8E99A3"/>`;
  // cards, end-on: thin board line, heatsink and SFP cages standing up toward the top plate
  ['4', '5', '6'].forEach(s => {
    const id = r.slots[s]; if (!id) return;
    const hc = RSL[s].h + 3.75;
    z += `<rect x="${RX(105)}" y="${RY(hc + 1)}" width="${RX(266) - RX(105)}" height="4" fill="#45B565" stroke="#0E3B22"/>`;
    z += `<rect x="${RX(157)}" y="${RY(hc + 11)}" width="${RX(220) - RX(157)}" height="${RSC * 10}" fill="#3A4046" stroke="#0B0D0F"/>${Array.from({ length: 9 }, (_, k) => `<path d="M${RX(160 + k * 6.6)} ${RY(hc + 10)}V${RY(hc + 2)}" stroke="#15181B" stroke-width="2"/>`).join('')}`;
    z += `<rect x="${RX(223)}" y="${RY(hc + 10)}" width="${RX(266) - RX(223)}" height="${RSC * 9}" fill="#D3DAE0" stroke="#6E767D"/>`;
    z += `<path d="M${RX(104)} ${RY(hc)}L${RX(70)} ${RY(hc + 12)}H${RX(28)}" fill="none" stroke="#FFB52E" stroke-width="1.2"/><rect x="${RX(8)}" y="${RY(hc + 12) - 12}" width="${RSC * 46}" height="16" rx="4" fill="#0E1A22" fill-opacity=".85"/><text x="${RX(31)}" y="${RY(hc + 12)}" text-anchor="middle" style="font:600 10px var(--font);fill:#FFFFFF">VIC 1225, slot ${s}</text>`;
  });
  // blue touch points on the top plate, one at each end
  const tp = [['f', 36], ['r', 214]];
  tp.forEach(([e, u]) => { z += `<rect x="${RX(u)}" y="${RY(88)}" width="${RSC * 26}" height="${RSC * 5}" rx="4" fill="#5B8BD9" stroke="#2C4F8E"/>${[4, 9, 14, 19].map(k => `<path d="M${RX(u + k + 1.5)} ${RY(87.4)}V${RY(83.6)}" stroke="#2C4F8E" stroke-width="1.4"/>`).join('')}`; });
  // pose: lift and tilt, animated from the previous pose
  const anim = prev && age < 0.7 ? `<animateTransform attributeName="transform" type="translate" from="0 ${-prev.lift}" to="0 ${-P.lift}" dur="0.6s" begin="-${age.toFixed(2)}s" fill="freeze"/>` : '';
  const animR = prev && age < 0.7 && (prev.ang !== P.ang) ? `<animateTransform attributeName="transform" type="rotate" from="${prev.ang} ${prev.pv || P.pv} ${RY(0)}" to="${P.ang} ${P.pv || prev.pv} ${RY(0)}" dur="0.6s" begin="-${age.toFixed(2)}s" fill="freeze"/>` : '';
  g += `<defs><clipPath id="riserclip"><rect x="18" y="48" width="864" height="388" rx="8"/></clipPath></defs><g clip-path="url(#riserclip)"><g transform="translate(0 ${-P.lift})">${anim}<g transform="rotate(${f1(P.ang)} ${P.pv} ${RY(0)})">${animR}${z}`;
  // hands on the touch points
  const holding = r.loc === 'up';
  tp.forEach(([e, u]) => {
    const pa = rfxAge('push' + e), resting = r.loc === 'in' && (r.up.f || r.up.r);
    if (holding || (r.loc === 'in' && r.grip[e]) || (resting && r.up[e])) g += hand(RX(u + 13), RY(86));
    else if (r.loc === 'in' && pa < 0.9) g += `<g opacity="0">${pa < 0.9 ? `<animate attributeName="opacity" values="1;1;0" keyTimes="0;0.7;1" dur="0.9s" begin="-${pa.toFixed(2)}s" fill="freeze"/><animateTransform attributeName="transform" type="translate" values="0 -10;0 0;0 0" keyTimes="0;0.4;1" dur="0.9s" begin="-${pa.toFixed(2)}s" fill="freeze"/>` : ''}${hand(RX(u + 13), RY(86))}</g>`;
  });
  // click zones on the riser
  if (r.loc === 'in') {
    const seated = !r.up.f && !r.up.r;
    tp.forEach(([e, u]) => {
      const lbl = seated ? `Blue touch point at the ${e === 'f' ? 'front' : 'rear'} end: ${r.grip[e] ? 'gripped' : 'grip it'}` : `${e === 'f' ? 'Front' : 'Rear'} end: ${r.up[e] ? 'push it down' : 'engaged'}`;
      g += `<g${hot(seated ? 'riserGrip' : 'riserPush', e, lbl)}><rect x="${RX(u) - 14}" y="${RY(88) - 30}" width="${RSC * 26 + 28}" height="50" rx="8" class="zone"/></g>`;
      if (!seated && r.up[e]) g += `<g pointer-events="none"><path d="M${RX(u + 13)} ${RY(88) - 48}v24m-9 -9l9 9l9 -9" fill="none" stroke="#FFB52E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    });
    if (seated && r.grip.f && r.grip.r) g += `<g${hot('riserLift', '', 'Lift riser 2 straight up')}><rect x="${RX(80)}" y="${RY(76)}" width="${RX(262) - RX(80)}" height="${RY(8) - RY(76)}" rx="6" class="zone"/></g>`;
  } else if (holding) g += `<g${hot('riserMat', '', 'Lay riser 2 on the antistatic mat')}><rect x="${RX(0)}" y="${RY(88)}" width="${RX(272) - RX(0)}" height="${RY(0) - RY(88)}" rx="6" class="zone"/></g>`;
  g += `</g></g></g>`;
  if (holding) g += `<g${hot('riserAlign', '', 'Lower riser 2 onto the RISER2 socket, the two alignment pegs and the two channels')}><rect x="${RX(0)}" y="${RY(18)}" width="${RX(272) - RX(0)}" height="${RY(0) - RY(18) + 6}" rx="6" class="zone" style="stroke-dasharray:6 4"/></g>` +
    `<text x="${RX(136)}" y="${RY(20) - 4}" text-anchor="middle" class="ss" style="fill:#FFD27A">RISER2 socket, pegs and channels: click to lower the riser here</text>`;
  const st = r.loc === 'up' ? 'Held above the chassis, level, by both touch points' : r.up.f || r.up.r ? `Resting on the socket, not engaged at the ${r.up.f && r.up.r ? 'front and rear' : r.up.f ? 'front' : 'rear'}` : r.grip.f || r.grip.r ? `Gripped at the ${r.grip.f && r.grip.r ? 'front and rear' : r.grip.f ? 'front' : 'rear'} touch point` : 'Seated in the RISER2 socket';
  g += `<text x="866" y="72" text-anchor="end" class="st" style="fill:${r.loc === 'in' && !r.up.f && !r.up.r ? '#45D07F' : '#FFB52E'}">${esc(st)}</text>`;
  return g;
}

/* ---- the riser on the antistatic mat, lying on its board, seen from its open bottom side (as in the trainer's photos):
   the black top plate stands at the back, the cards stand up from the board and show their solder side.
   Oblique view: u to the right (front end to rear panel), v up (card height), depth d = installed height, receding up-right. ---- */
const RB = { ox: 270, oy: 424, s: 1.45, kx: 0.42, ky: 0.6 };
const bp = (u, v, d) => [RB.ox + RB.s * (u + RB.kx * d), RB.oy - RB.s * (v + RB.ky * d)];
const faceM = (d, du = 0, dv = 0, k = 0) => `matrix(${RB.s} ${f1(k)} 0 ${RB.s} ${f1(RB.ox + RB.s * (du + RB.kx * d))} ${f1(RB.oy - RB.s * (dv + RB.ky * d))})`;   // plane at depth d (x = u, y = -v)
const endM = U => `matrix(${f1(RB.s * RB.kx)} ${f1(-RB.s * RB.ky)} 0 ${RB.s} ${f1(RB.ox + RB.s * U)} ${RB.oy})`;   // end plane at u = U (x = d, y = -v)
const flatM = V => `matrix(${RB.s} 0 ${f1(RB.s * RB.kx)} ${f1(-RB.s * RB.ky)} ${RB.ox} ${f1(RB.oy - RB.s * V)})`;   // plane at height v = V (x = u, y = d)
const quad = (a, b, c, d, fill, extra = '') => `<polygon points="${pts([a, b, c, d])}" fill="${fill}"${extra}/>`;
// box from (u0..u1, v0..v1, d0..d1): right, top, then front faces
function bbox(u0, u1, v0, v1, d0, d1, front, top, side) {
  return quad(bp(u1, v0, d0), bp(u1, v0, d1), bp(u1, v1, d1), bp(u1, v1, d0), side) + quad(bp(u0, v1, d0), bp(u1, v1, d0), bp(u1, v1, d1), bp(u0, v1, d1), top) + quad(bp(u0, v0, d0), bp(u1, v0, d0), bp(u1, v1, d0), bp(u0, v1, d0), front);
}
// the VIC's solder side, in the same card millimetres as vicFace (the riser shows this side when it lies on its board)
function vicBack() {
  let s = `<path d="${VIC.body}" fill="#2E7F40" stroke="#123D1E" stroke-width="0.5"/>` + smd(23, 150, 5, 145, -60, -8, '#245F33') + smd(31, 60, 112, 162, -60, -8, '#B89A55');
  VIC.gold.forEach(([a, b]) => { s += `<rect x="${a}" y="-6.2" width="${f1(b - a)}" height="6.2" fill="#D6AE4E"/>`; for (let x = a + 0.5; x < b; x += 1) s += `<path d="M${f1(x)} -6V0" stroke="#A88227" stroke-width="0.35"/>`; });
  for (let c = 0; c < 13; c++) for (let r = 0; r < 9; r++) s += `<circle cx="${f1(78 + c * 2.4)}" cy="${f1(-44 + r * 2.5)}" r="0.55" fill="#C9B27A"/>`;
  VIC.pins.forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="2.4" fill="#F2F4F5" stroke="#9AA2AA" stroke-width="0.3"/>`; });
  [[60, -50], [66, -48], [118, -36], [118, -30], [118, -18], [118, -12]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="1.7" fill="#1C1F22"/>`; });
  const code = (x, y, w, h) => { let b = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.5" fill="#F4F4EC" stroke="#B9B9AA" stroke-width="0.3"/>`; for (let k = 0; k < 26; k++) b += `<rect x="${f1(x + 1 + k * (w - 2) / 26)}" y="${f1(y + 0.6)}" width="${f1((k * 7) % 3 === 0 ? 0.5 : 0.25)}" height="${f1(h * 0.55)}" fill="#1A1A1A"/>`; return b; };
  s += code(149, -30, 17, 5.4) + `<text x="149" y="-20.8" style="font:700 3px var(--font);fill:#DCE8DF">MAC ID</text>`;
  s += code(149, -47.5, 17, 5.4) + `<text x="157.5" y="-37.6" text-anchor="middle" style="font:600 2.1px var(--mono);fill:#DCE8DF">SN FCH0000XXXX</text>`;
  s += `<rect x="60" y="-14.5" width="28" height="5.5" fill="none" stroke="#DCE8DF" stroke-width="0.4"/><text x="74" y="-10.6" text-anchor="middle" style="font:600 3px var(--font);fill:#DCE8DF">P/N LABEL</text><text x="92" y="-10.6" style="font:700 3.2px var(--font);fill:#DCE8DF">cisco</text>`;
  s += `<path d="M165 13L166.5 14H167.5L168 13V-108H165Z" fill="#B4BCC4" stroke="#6E767D" stroke-width="0.4"/><rect x="162.5" y="-110.6" width="11" height="2.8" rx="0.6" fill="#B4BCC4" stroke="#6E767D" stroke-width="0.4"/>`;
  return s;
}
/* The securing plate in mat coordinates. Body: plane d = 0, outline in (u, v). Folded edge: plane v = 116, (u, d) from the body
   (d = 0) to the hinge-tabs (d = 78). Opening turns both about the hinge line (v = 116, d = 78), up to SPL.open degrees. */
const SPL = { hv: 116, hd: 78, open: 112, body: [[0, 0], [44, 0], [44, 12], [86, 104], [86, 116], [0, 116]], knob: [14, 8], dimple: [38, 76, 13], tabs: [14, 66] };
const PLATE_T = 0.8;
// screen matrices of the body and the folded edge, turned by q radians about the hinge line
function plateBodyM(q) {
  const s = RB.s, k = RB.kx, y = RB.ky, c = Math.cos(q), n = Math.sin(q), d0 = SPL.hd - SPL.hv * n - SPL.hd * c, v0 = SPL.hv - SPL.hv * c + SPL.hd * n;
  return `matrix(${f1(s)} 0 ${(-s * k * n).toFixed(3)} ${(s * (c + y * n)).toFixed(3)} ${f1(RB.ox + s * k * d0)} ${f1(RB.oy - s * (v0 + y * d0))})`;
}
function plateEdgeM(q) {
  const s = RB.s, k = RB.kx, y = RB.ky, c = Math.cos(q), n = Math.sin(q), d0 = SPL.hd - SPL.hd * c;
  return `matrix(${f1(s)} 0 ${(s * k * c).toFixed(3)} ${(s * (n - y * c)).toFixed(3)} ${f1(RB.ox + s * k * d0)} ${f1(RB.oy - s * (SPL.hv + SPL.hd * n + y * d0))})`;
}
// the plate's angle now: 0 closed, SPL.open swung open; eased while it moves
function plateAngle(r) {
  const tgt = r.plate === 'on' ? 0 : SPL.open, f = riserFx.plate, a = rfxAge('plate');
  if (!f || a >= PLATE_T || f.from === 'off' || r.plate === 'off') return tgt;
  const src = f.from === 'on' ? 0 : SPL.open, e = Math.min(1, a / PLATE_T), k = e * e * (3 - 2 * e);
  return src + (tgt - src) * k;
}
function plateKnob(r, cx, cy, rr, spin) {
  const ang = r.screw === 'tight' ? 0 : -200, sa = rfxAge('rscrew'), sf = riserFx.rscrew, from = sf && sa < 0.8 ? (sf.from === 'tight' ? 0 : -200) : ang;
  const an = spin && sf && sa < 0.8 ? `<animateTransform attributeName="transform" type="rotate" from="${from} ${cx} ${cy}" to="${ang} ${cx} ${cy}" dur="0.8s" begin="-${sa.toFixed(2)}s" fill="freeze"/>` : '';
  let k = ''; for (let q = 0; q < 12; q++) { const a = q * 30 * Math.PI / 180; k += `<path d="M${f1(cx + rr * 0.62 * Math.cos(a))} ${f1(cy + rr * 0.62 * Math.sin(a))}L${f1(cx + rr * 0.95 * Math.cos(a))} ${f1(cy + rr * 0.95 * Math.sin(a))}" stroke="#2C4F8E" stroke-width="1.2"${NSS}/>`; }
  return `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="#6E98E0" stroke="#2C4F8E" stroke-width="1.5"${NSS}/><g transform="rotate(${ang} ${cx} ${cy})">${an}${k}<path d="M${f1(cx - rr * 0.42)} ${cy}H${f1(cx + rr * 0.42)}M${cx} ${f1(cy - rr * 0.42)}V${f1(cy + rr * 0.42)}" stroke="#1D3566" stroke-width="2"${NSS} stroke-linecap="round"/></g>`;
}
// the plate in place (closed, opening or open), drawn at angle deg; the folded edge shows its black pads once its inside faces you
function plateSvg(r, deg, spin = true) {
  if (r.plate === 'off' && !(riserFx.plate && rfxAge('plate') < 0.5 && riserFx.plate.from !== 'off')) return '';
  const q = deg * Math.PI / 180, inside = Math.sin(q) - RB.ky * Math.cos(q) > 0;
  const fade = r.plate === 'off' ? `<animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="-${rfxAge('plate').toFixed(2)}s" fill="freeze"/>` : riserFx.plate && riserFx.plate.from === 'off' && rfxAge('plate') < 0.5 ? `<animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="-${rfxAge('plate').toFixed(2)}s" fill="freeze"/>` : '';
  let edge = `<rect x="0" y="0" width="86" height="78" fill="${inside ? '#A3ACB4' : '#AEB7BF'}" stroke="#6E767D" stroke-width="1"${NSS}/>`;
  SPL.tabs.forEach(u => { edge += `<rect x="${u}" y="77" width="10" height="5" rx="1" fill="#A9B2BA" stroke="#6E767D" stroke-width="1"${NSS}/>`; });
  if (inside) edge += `<rect x="9" y="4" width="60" height="15" rx="2" fill="#1C2024"/><circle cx="15" cy="11.5" r="2" fill="#7E868D"/><circle cx="63" cy="11.5" r="2" fill="#7E868D"/><rect x="30" y="8" width="18" height="6" rx="1" fill="#2E3439"/>` +
    `<rect x="8" y="25" width="62" height="38" rx="2.5" fill="#1C2024"/><path d="M30 31h20v9h-6v8h-8v-8h-6z" fill="#2E3439"/><path d="M30 49h20v8h-20z" fill="#2E3439"/><circle cx="15" cy="32" r="2" fill="#7E868D"/><circle cx="63" cy="56" r="2" fill="#C9CED3"/>`;
  let body = `<path d="M${SPL.body.map(([u, w]) => `${u} ${-w}`).join('L')}Z" fill="${deg > 45 ? '#DCE1E6' : '#CBD2D8'}" stroke="#6E767D" stroke-width="1.2"${NSS}/>`;
  const [dx, dw, dr] = SPL.dimple;
  body += `<circle cx="${dx}" cy="${-dw}" r="${dr}" fill="#C0C7CE" stroke="#8E99A3" stroke-width="1"${NSS}/><circle cx="${dx}" cy="${-dw}" r="${dr * 0.55}" fill="#D3D9DE"/><circle cx="${dx}" cy="${-dw}" r="1.6" fill="#59626A"/>`;
  // captive thumbscrew: its shaft shows once the plate lifts away from the post
  let shaft = '';
  if (deg > 12) {
    const [ku, kw] = SPL.knob, a0 = kw - SPL.hv, b0 = -SPL.hd, c = Math.cos(q), n = Math.sin(q);
    const v1 = SPL.hv + a0 * c - b0 * n, d1 = SPL.hd + a0 * n + b0 * c, L = 13, v2 = v1 - L * n, d2 = d1 + L * c;
    const [x1, y1] = bp(ku, v1, d1), [x2, y2] = bp(ku, v2, d2);
    shaft = `<path d="M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}" stroke="#8E99A3" stroke-width="5" stroke-linecap="round"/><path d="M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}" stroke="#C9CED3" stroke-width="2" stroke-dasharray="1.5 1.5"/>`;
  }
  const knob = plateKnob(r, SPL.knob[0], -SPL.knob[1], 5.6, spin && deg < 1);
  // painter's order: seen from the front and above, the body is always nearer than the folded edge, and its outer face
  // (with the knob) faces you through the whole swing; the thumbscrew's shaft is on the far side of the body
  const E = `<g transform="${plateEdgeM(q)}">${edge}</g>`, B = `<g transform="${plateBodyM(q)}">${body}${knob}</g>`;
  return `<g>${fade}${E}${shaft}${B}</g>`;
}
// what stays on the riser: the white bracket with the black threaded post for the thumbscrew, and the two hinge-tab slots
function plateRiserParts(r) {
  let g = bbox(0, 88, 0, 3, 0, 12, '#A9B2BA', '#C5CCD3', '#8E99A3') + bbox(0, 34, 3, 13, 2, 10, '#E9ECEF', '#F7F8F9', '#C3C9CF');
  const [px, py] = bp(SPL.knob[0], SPL.knob[1] + 1, 2);
  g += `<circle cx="${f1(px)}" cy="${f1(py)}" r="6" fill="#1C2024"/><circle cx="${f1(px)}" cy="${f1(py)}" r="2.6" fill="#59626A"/>`;
  const [hx, hy] = bp(26, 7, 2); g += `<circle cx="${f1(hx)}" cy="${f1(hy)}" r="2.2" fill="#8E99A3"/>`;
  SPL.tabs.forEach(u => { g += quad(bp(u, SPL.hv, 77), bp(u + 10, SPL.hv, 77), bp(u + 10, SPL.hv, 82), bp(u, SPL.hv, 82), r.plate === 'off' ? '#0B0D0F' : '#3A4046'); });
  return g;
}
// the swing on the hinge-tabs, drawn frame by frame (the rest of the view stays as it is)
let plateRaf = 0;
function plateAnim() {
  const f = riserFx.plate; if (!f || plateRaf || rfxAge('plate') >= PLATE_T || f.from === 'off' || T.riser.plate === 'off') return;
  const step = () => {
    plateRaf = 0; const el = document.getElementById('splate');
    if (!el || Sim.view !== 'riser' || T.riser.loc !== 'mat') return;
    el.innerHTML = plateSvg(T.riser, plateAngle(T.riser), false);
    if (rfxAge('plate') < PLATE_T + 0.05) plateRaf = requestAnimationFrame(step);
  };
  plateRaf = requestAnimationFrame(step);
}
// the plate lying on the mat once removed: its body, and the folded edge with the black pads and the two hinge-tabs
const SPO = { x: 34, y: 118, w: 104, h: 212 };
function plateOffSvg(r) {
  const fx = riserFx.plate, a = rfxAge('plate'), show = r.plate === 'off' || (fx && fx.from === 'off' && a < 0.5);
  if (!show) return '';
  const fade = r.plate === 'off' && fx && fx.from !== 'off' && a < 0.5 ? `<animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : r.plate !== 'off' ? `<animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : '';
  const k = 0.9, X = SPO.x + 8, Y = SPO.y + 6, P = (u, y) => `${f1(X + k * u)} ${f1(Y + k * y)}`;
  let g = `<g>${fade}<text x="${SPO.x + SPO.w / 2}" y="${SPO.y - 12}" text-anchor="middle" class="ss">Securing plate (off)</text>`;
  // folded edge (laid flat for the drawing), inside up: hinge-tabs at the top, black pads
  g += `<path d="M${P(0, 0)}H${f1(X + k * 86)}V${f1(Y + k * 74)}H${f1(X)}Z" fill="#B9C1C8" stroke="#6E767D" stroke-width="1.2"/>`;
  SPL.tabs.forEach(u => { g += `<rect x="${f1(X + k * u)}" y="${f1(Y - 5)}" width="${f1(k * 10)}" height="6" rx="1" fill="#A9B2BA" stroke="#6E767D"/>`; });
  g += `<rect x="${f1(X + k * 8)}" y="${f1(Y + k * 10)}" width="${f1(k * 62)}" height="${f1(k * 36)}" rx="2" fill="#1C2024"/><rect x="${f1(X + k * 9)}" y="${f1(Y + k * 55)}" width="${f1(k * 60)}" height="${f1(k * 14)}" rx="2" fill="#1C2024"/>`;
  g += `<path d="M${P(0, 76)}H${f1(X + k * 86)}" stroke="#6E767D" stroke-width="1" stroke-dasharray="3 2"/>`;
  // body, inside up
  const by = 78, body = SPL.body.map(([u, w]) => [u, by + (116 - w)]);
  g += `<path d="M${body.map(([u, y]) => P(u, y)).join('L')}Z" fill="#CBD2D8" stroke="#6E767D" stroke-width="1.2"/>`;
  g += `<circle cx="${f1(X + k * SPL.dimple[0])}" cy="${f1(Y + k * (by + 116 - SPL.dimple[1]))}" r="${f1(k * SPL.dimple[2])}" fill="#D3D9DE" stroke="#8E99A3"/><circle cx="${f1(X + k * SPL.dimple[0])}" cy="${f1(Y + k * (by + 116 - SPL.dimple[1]))}" r="1.8" fill="#59626A"/>`;
  g += plateKnob(r, f1(X + k * SPL.knob[0]), f1(Y + k * (by + 116 - SPL.knob[1])), 8, false);
  g += `<text x="${f1(X + k * 43)}" y="${f1(Y + k * 40)}" text-anchor="middle" style="font:600 8px var(--font);fill:#C9D0D6">black pads</text><text x="${SPO.x + SPO.w / 2}" y="${SPO.y + SPO.h + 14}" text-anchor="middle" style="font:600 10px var(--font);fill:#C9D0D6">hinge-tabs at the top</text></g>`;
  return g;
}
function riserBenchSvg(t) {
  const r = t.riser;
  let g = `<rect x="18" y="48" width="864" height="388" rx="8" fill="#2A3640" stroke="#3B4D5A"/>`;
  for (let k = 0; k < 28; k++) g += `<path d="M${36 + k * 31} 52V432" stroke="#33424D" stroke-width="1"/>`;
  g += `<text x="866" y="72" text-anchor="end" class="st">Riser 2 on the antistatic mat, lying on its board</text><text x="866" y="90" text-anchor="end" class="ss">Seen from its bottom side: front end at the left,</text><text x="866" y="105" text-anchor="end" class="ss">rear panel at the right, top plate at the back.</text>`;
  // the black top plate stands at the back: windows, chamfered front corner, blue touch points on both long edges
  let tp = `<path d="M0 0H272V-116H20L0 -96Z" fill="#2E343B" stroke="#14181C" stroke-width="0.6"/>`;
  [[36, -85, 59, 60], [148, -85, 57, 60], [214, -43, 26, 21], [214, -67, 26, 21], [214, -91, 26, 21]].forEach(([x, y, w, h]) => { tp += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#22303A" stroke="#14181C" stroke-width="0.5"/>`; });
  [[42, 92, 0], [153, 203, 0], [56, 84, -116], [167, 195, -116]].forEach(([a, b, y]) => { tp += `<rect x="${a}" y="${y - 2}" width="${b - a}" height="4" rx="1.5" fill="#7FA3E0" stroke="#2C4F8E" stroke-width="0.4"/>`; });
  g += `<g transform="${faceM(82)}">${tp}</g>`;
  // the riser board, flat on the mat: slot connectors, capacitors, GPU power connector, gold edge toward you
  const ft = (x, y, st, txt) => `<text transform="translate(${x} ${y}) scale(1 -1)" style="${st}">${txt}</text>`;
  let b = `<path d="M88 76H262V6H232V-2H104V6H88Z" fill="#1F6B45" stroke="#0E3B22" stroke-width="0.5"/><rect x="105" y="-1.5" width="126" height="6" fill="#D6AE4E"/>`;
  for (let x = 106; x < 231; x += 2) b += `<path d="M${x} -1.2V4.2" stroke="#A88227" stroke-width="0.5"/>`;
  b += ft(150, 72, 'font:600 3.6px var(--mono);fill:#DCE8DF', '2U-RISER2 Rev:A1');
  ['6', '5', '4'].forEach(s => { b += ft(91, RSL[s].h - 1.8, 'font:700 4.2px var(--font);fill:#F4F6F8', 'SLOT' + s); });
  g += `<g transform="${flatM(0)}">${b}</g>`;
  [[238, 70], [250, 70], [238, 50], [246, 50], [254, 50], [238, 30], [248, 30]].forEach(([u, d]) => {
    const [x0, y0] = bp(u, 0, d), [x1, y1] = bp(u, 9, d);
    g += `<rect x="${f1(x0 - 3.6)}" y="${f1(y1)}" width="7.2" height="${f1(y0 - y1)}" fill="#C9D0D6" stroke="#6E767D" stroke-width=".7"/><ellipse cx="${f1(x1)}" cy="${f1(y1)}" rx="3.6" ry="2.2" fill="#2F6FB0" stroke="#6E767D" stroke-width=".7"/>`; });
  g += bbox(90, 101, 0, 9, 9, 17, '#EDE6D3', '#F7F2E4', '#C9C1AA');
  // slot connectors and the cards in them, far to near: slot 6, then 5, then 4
  ['6', '5', '4'].forEach(s => {
    const c = RSL[s], d = RD(s);
    g += bbox(c.conn[0], c.conn[1], 0, 7.5, d - 3.5, d + 3.5, '#2A2F35', '#15181B', '#0B0D0F');
    const [sx0, sy0] = bp(c.conn[0] + 2, 7.5, d), [sx1, sy1] = bp(c.conn[1] - 2, 7.5, d);
    g += `<path d="M${f1(sx0)} ${f1(sy0)}L${f1(sx1)} ${f1(sy1)}" stroke="#4A5057" stroke-width="1.6"/>`;
    const id = r.slots[s];
    if (!id) return;
    const st = r.seat[s] || { f: true, r: true }, offF = st.f ? 0 : 6, offR = st.r ? 0 : 6, k = -RB.s * (offR - offF) / 168;
    const a = rfxAge('card' + s), drop = a < 0.5 ? `<animateTransform attributeName="transform" type="translate" from="0 -30" to="0 0" dur="0.45s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : '';
    g += `<g>${drop}<g transform="${faceM(d, 102, 1.5 + offF, k)}">${vicBack()}</g></g>`;
    if (!cardSeated(r, s)) [['f', 14], ['r', 150]].forEach(([e, x]) => {
      const off = e === 'f' ? offF : offR, [px, py] = bp(102 + x, 1.5 + 62 + off, d);
      g += `<g${hot('cardPush', `${s}:${e}`, `Push down on the ${e === 'f' ? 'far end' : 'bracket end'} of the card in slot ${s}`)}><circle cx="${f1(px)}" cy="${f1(py - 20)}" r="17" fill="#0E1A22" fill-opacity=".6" stroke="${st[e] ? '#45D07F' : '#FFB52E'}" stroke-width="2.5"/><path d="M${f1(px)} ${f1(py - 30)}v18m-7 -7l7 7l7 -7" fill="none" stroke="${st[e] ? '#45D07F' : '#FFB52E'}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    });
  });
  // rear panel, outer face: the three openings with blanking panels or the card bracket (ports and LEDs)
  let rp = `<path d="M0 0V-116H82V0Z" fill="#C5CCD3" stroke="#6E767D" stroke-width=".5"/>`;
  ['4', '5', '6'].forEach(s => {
    const d = RD(s), x0 = d - 8.5, w = 17, y0 = -106, hh = 100;
    if (r.slots[s]) {
      rp += `<rect x="${x0}" y="${y0}" width="${w}" height="${hh}" fill="#C3CAD0" stroke="#7E868D" stroke-width=".4"/>`;
      [[-26.5, '1'], [-44.5, '2']].forEach(([y, n]) => { rp += `<rect x="${x0 + 2}" y="${y}" width="${w - 4}" height="15.5" rx="1" fill="#1A1E22" stroke="#E3E7EA" stroke-width=".6"/><rect x="${x0 + 5}" y="${y + 6}" width="${w - 10}" height="3.5" fill="#3A3F45"/>`; });
      for (let k = 0; k < 5; k++) rp += `<circle cx="${x0 + 5 + (k % 2) * 7}" cy="${-60 - k * 8}" r="1.3" fill="#59626A"/>`;
    } else if (r.blank[s]) {
      rp += `<rect x="${x0}" y="${y0}" width="${w}" height="${hh}" fill="#B9C1C8" stroke="#7E868D" stroke-width=".4"/>`;
      for (let k = 0; k < 9; k++) rp += `<rect x="${x0 + 4}" y="${y0 + 6 + k * 10.4}" width="${w - 8}" height="4.6" rx="1" fill="#59626A"/>`;
    } else rp += `<rect x="${x0}" y="${y0}" width="${w}" height="${hh}" fill="#0B1014" stroke="#FF8A7A" stroke-width=".7" stroke-dasharray="3 2"/>`;
    rp += `<text x="${d}" y="-108.5" text-anchor="middle" style="font:700 4.4px var(--font);fill:#2A2F35">PCIe ${s}</text>`;
  });
  g += `<g transform="${endM(270)}">${rp}</g>`;
  ['4', '5', '6'].forEach(s => { if (r.slots[s]) [[19, '1'], [37, '2']].forEach(([v, n]) => { const [x, y] = bp(272, v, RD(s) + 9); g += `<text x="${f1(x + 3)}" y="${f1(y + 3)}" style="font:700 8.5px var(--font);fill:#EAF2F7">PORT ${n}</text>`; }); });
  // card-tab retainer, blue, along the top of the rear panel; hinged next to the top plate, it swings out
  const th = r.ret === 'open' ? 60 : 0, ra = rfxAge('ret'), rf = riserFx.ret;
  const retPts = deg => { const q = deg * Math.PI / 180, A = [Math.sin(q), -Math.cos(q)], B = [-Math.cos(q), -Math.sin(q)], H = [270, 80];
    const at = (al, be, v) => bp(H[0] + al * A[0] + be * B[0], v, H[1] + al * A[1] + be * B[1]);
    return { top: [at(0, -2, 116), at(78, -2, 116), at(78, 8, 116), at(0, 8, 116)], side: [at(0, -2, 106), at(78, -2, 106), at(78, -2, 116), at(0, -2, 116)] }; };
  const R1 = retPts(th), R0 = rf && ra < 0.7 ? retPts(rf.from === 'open' ? 60 : 0) : null;
  const an = (p0, p1) => R0 ? `<animate attributeName="points" from="${pts(p0)}" to="${pts(p1)}" dur="0.6s" begin="-${ra.toFixed(2)}s" fill="freeze"/>` : '';
  if (r.ret === 'open') ['4', '5', '6'].forEach(s => { if (r.slots[s] || r.blank[s]) { const [x, y] = bp(268, 111, RD(s)); g += `<rect x="${f1(x - 7)}" y="${f1(y - 3)}" width="14" height="6" rx="1.5" fill="#D3DAE0" stroke="#6E767D"/>`; } });
  g += `<polygon points="${pts(R1.side)}" fill="#4F78C4">${an(R0 && R0.side, R1.side)}</polygon><polygon points="${pts(R1.top)}" fill="#8FB0EA" stroke="#2C4F8E" stroke-width="1">${an(R0 && R0.top, R1.top)}</polygon>`;
  g += `<g${hot('riserRet', '', `Blue card-tab retainer: ${r.ret}`)}><polygon points="${pts(r.ret === 'open' ? R1.top : [bp(258, 102, -2), bp(274, 102, -2), bp(274, 122, 82), bp(258, 122, 82)])}" class="zone" style="stroke-width:3"/></g>`;
  // securing plate (from the trainer's video): an L-shaped part. Its flat body covers the front of the bottom side, its folded
  // edge wraps the outer long edge back to two hinge-tabs next to the top plate. Loosen the thumbscrew, swing it open on the
  // hinge-tabs, then lift it off; it lies on the mat until it goes back on.
  g += plateRiserParts(r);
  g += `<g id="splate">${plateSvg(r, plateAngle(r))}</g>` + plateOffSvg(r);
  if (r.plate === 'on') {
    g += `<g${hot('riserPlate', '', 'Securing plate: swing it open on its hinge-tabs')}><polygon points="${pts(SPL.body.map(([u, w]) => bp(u, w, 0)))}" class="zone"/></g>`;
    const [kx, ky] = bp(SPL.knob[0], SPL.knob[1], 0);
    g += `<g${hot('riserScrew', '', `Securing plate thumbscrew, on the bottom of the riser: ${r.screw}`)}><circle cx="${f1(kx)}" cy="${f1(ky)}" r="22" class="zone"/></g>`;
    g += `<path d="M${f1(kx - 14)} ${f1(ky - 8)}L${f1(kx - 30)} ${f1(ky - 26)}" stroke="#FFB52E" stroke-width="1"/>` + chip(kx - 156, ky - 26, `Thumbscrew: ${r.screw}`, 'start');
  } else if (r.plate === 'open') {
    const q = SPL.open * Math.PI / 180, fl = [[0, 0], [86, 0], [86, 78], [0, 78]].map(([u, dd]) => bp(u, SPL.hv - (dd - SPL.hd) * Math.sin(q), SPL.hd + (dd - SPL.hd) * Math.cos(q)));
    g += `<g${hot('riserPlate', '', 'Securing plate, swung open: lift its two hinge-tabs out of their slots')}><polygon points="${pts(fl)}" class="zone"/></g>`;
  } else {
    g += `<g${hot('riserPlate', '', 'Securing plate: hook its two hinge-tabs into their slots on the riser')}><rect x="${SPO.x - 10}" y="${SPO.y - 34}" width="${SPO.w + 20}" height="${SPO.h + 58}" rx="8" class="zone"/></g>`;
  }
  // slot click zones: the connector on the board and the opening in the rear panel
  ['4', '5', '6'].forEach(s => {
    const c = RSL[s], d = RD(s), lbl = `Riser slot ${s} (${c.lanes}, ${c.x24 ? 'x24' : 'x16'} connector): ${r.slots[s] ? byId('cards', r.slots[s]).name + (cardSeated(r, s) ? ', seated' : ', not seated') : r.blank[s] ? 'blanking panel' : 'open'}`;
    g += `<g${hot('riserSlot', s, lbl)}><polygon points="${pts([bp(c.conn[0] - 4, 0, d - 7), bp(c.conn[1] + 4, 0, d - 7), bp(c.conn[1] + 4, 9, d + 7), bp(c.conn[0] - 4, 9, d + 7)])}" class="zone"/></g>`;
    g += `<g${hot('riserSlot', s, lbl + ' (rear opening)')}><polygon points="${pts([bp(270, 6, d - 8.5), bp(270, 6, d + 8.5), bp(270, 106, d + 8.5), bp(270, 106, d - 8.5)])}" class="zone"/></g>`;
  });
  const lab = (u, v, d, txt, dx, dy, anchor = 'start') => { const [x, y] = bp(u, v, d), w = txt.length * 6.6 + 14; return `<path d="M${f1(x)} ${f1(y)}L${f1(x + dx)} ${f1(y + dy)}" stroke="#FFB52E" stroke-width="1"/>` + chip(anchor === 'start' ? x + dx + 4 : x + dx - 4 - w, y + dy + 4, txt, 'start'); };
  g += lab(272, 50, 82, 'Rear panel', 46, 26);
  g += lab(266, 116, 30, `Card-tab retainer: ${r.ret}`, -14, -46, 'end');
  g += lab(220, 0, -2, 'Edge to RISER2', 130, -12);
  { const [x, y] = bp(176, 74, 82); g += chip(x, y, 'Top plate'); }
  if (r.plate === 'on') g += lab(30, 100, 0, 'Securing plate', -40, -40, 'end');
  if (r.plate === 'open') g += lab(20, 170, 80, 'Folded edge: black pads inside', -26, 10, 'end');
  return g;
}

/* ---- the rear panel of riser 2, as installed (riser board on the right; PCIe 6 at the top, 4 at the bottom) ---- */
function riserRearSvg(t, X, Y) {
  const r = t.riser, k = 2.05, x = v => X + 282 - k * v, y = h => Y + 228 - k * h;
  let g = `<rect x="${X}" y="${Y}" width="286" height="304" rx="8" fill="#16293A" stroke="#2E5571"/><text x="${X + 12}" y="${Y + 22}" class="st">Rear of riser 2, as installed</text>`;
  g += `<rect x="${x(114)}" y="${y(84)}" width="${k * 114}" height="${k * 84}" fill="#C5CCD3" stroke="#6E767D" stroke-width="1.5"/><rect x="${x(2)}" y="${y(80)}" width="4" height="${k * 74}" fill="#1F6B45"/>`;
  ['6', '5', '4'].forEach(s => {
    const h0 = RSL[s].h - 5, h1 = RSL[s].h + 12, bx = x(106), bw = k * 98, by = y(h1), bh = k * (h1 - h0);
    g += r.slots[s] ? vicRear(bx, by, bw, bh, 1.4, t.power === 'on' && !!t.cables.vic1, t.power === 'on' && !!t.cables.vic2)
      : r.blank[s] ? blankRear(bx, by, bw, bh, 1.4)
      : `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#0B1014" stroke="#FF8A7A" stroke-width="1.5" stroke-dasharray="5 3"/><text x="${bx + bw / 2}" y="${by + bh / 2 + 4}" text-anchor="middle" class="ss" style="fill:#FF8A7A">open: no blanking panel</text>`;
    g += `<text x="${X + 6}" y="${by + bh / 2 + 4}" class="ss" style="fill:#EAF2F7;font-weight:600">PCIe ${s}</text>`;
    g += `<g${hot('riserSlot', s, `Rear opening PCIe ${s}: ${r.slots[s] ? byId('cards', r.slots[s]).name : r.blank[s] ? 'blanking panel' : 'open'}`)}><rect x="${bx - 3}" y="${by - 3}" width="${bw + 6}" height="${bh + 6}" rx="3" class="zone"/></g>`;
  });
  // the blue card-tab retainer over the bracket tabs, hinged at the top
  const rx0 = x(114) + 2, rtop = y(80);
  if (r.ret === 'open') {
    g += `<rect x="${rx0}" y="${rtop}" width="18" height="${k * 76}" rx="3" fill="#16293A" fill-opacity=".35" stroke="#8FB0EA" stroke-width="1.5" stroke-dasharray="4 3"/>`;
    ['6', '5', '4'].forEach(s => { if (r.slots[s] || r.blank[s]) g += `<rect x="${rx0 + 3}" y="${y(RSL[s].h + 9)}" width="16" height="${k * 10}" rx="2" fill="#D3DAE0" stroke="#6E767D"/>`; });
  }
  else g += `<rect x="${rx0}" y="${rtop}" width="18" height="${k * 76}" rx="3" fill="#7FA3E0" stroke="#2C4F8E" stroke-width="1.5"/>`;
  g += `<text x="${X + 12}" y="${Y + 262}" class="ss">Blue bar: card-tab retainer, ${r.ret}.</text><text x="${X + 12}" y="${Y + 278}" class="ss">Green edge: the riser board side.</text><text x="${X + 12}" y="${Y + 294}" class="ss">Click an opening to work on that slot.</text>`;
  return g;
}

/* ---- the card in your hand, drawn large below the work area ---- */
function cardHandSvg(t, X, Y) {
  const id = t.sel.card;
  let g = `<rect x="${X}" y="${Y}" width="576" height="304" rx="8" fill="#16293A" stroke="#2E5571"/>`;
  if (!id) return g + `<text x="${X + 14}" y="${Y + 22}" class="st">In your hand</text><text x="${X + 288}" y="${Y + 150}" text-anchor="middle" class="ss">Nothing in your hand. Pick up the VIC from the card tray:</text><text x="${X + 288}" y="${Y + 168}" text-anchor="middle" class="ss">its ports and parts appear here, drawn large, before you fit it.</text>`;
  const c = byId('cards', id), sc = 2.12, ox = X + 18, oy = Y + 268;
  g += `<text x="${X + 14}" y="${Y + 22}" class="st">In your hand: ${esc(c.name)}</text>`;
  c.lines.forEach((l, k) => { g += `<text x="${X + 14}" y="${Y + 42 + k * 16}" class="ss">${esc(l)}</text>`; });
  g += `<g transform="translate(${ox} ${oy}) scale(${sc})">${vicFace({ dz: 0.6 })}</g>`;
  const P = (x, y) => [ox + sc * x, oy + sc * y];
  const call = (n, x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="9.5" fill="#F2B53A" stroke="#14202B" stroke-width="1.5"/><text x="${f1(x)}" y="${f1(y + 4)}" text-anchor="middle" style="font:700 11px var(--font);fill:#14202B">${n}</text>`;
  const marks = [P(140, -17), P(140, -35), P(86, -34), P(76, -2), P(15, -2), P(180, -109)];
  marks.forEach(([x, y], k) => { g += call(k + 1, x, y); });
  const notes = [['PORT 1', '10 Gb SFP+, by the edge'], ['PORT 2', '10 Gb SFP+'], ['Heatsink', 'leave it on the card'], ['Gold contacts', 'PCIe x16: never touch'], ['Extra contacts', 'need an x24 connector'], ['Bracket tab', 'held by the blue retainer']];
  notes.forEach(([a, b], k) => { const yy = Y + 84 + k * 34; g += call(k + 1, X + 414, yy) + `<text x="${X + 430}" y="${yy - 1}" class="st" style="font-size:12.5px">${esc(a)}</text><text x="${X + 430}" y="${yy + 13}" class="ss">${esc(b)}</text>`; });
  g += `<text x="${X + 14}" y="${Y + 294}" class="ss" style="fill:#FFD27A">Hold it by its edges and bracket. Never touch the gold contacts.</text>`;
  return g;
}

Sim.registerView({
  id: 'riser', title: 'Riser 2 and NIC',
  keep: [
    ['Riser 2 needs CPU 2', 'PCIe riser 2 (slots 4, 5 and 6) works only when CPU 2 is installed. In a single-CPU server it is not available.'],
    ['RISER2 socket only', 'Riser 2 plugs only into the motherboard socket labeled RISER2. The risers are not interchangeable: in the wrong socket, the server will not boot.'],
    ['Lift and seat it evenly', 'Grasp the top of the riser at both ends and lift it straight up, then set it on an antistatic mat. To refit it, line it up over the RISER2 socket, the two alignment pegs on the motherboard and the two channels in the chassis, then push down on both ends until it is fully engaged.'],
    ['Slot for the VIC', 'Slot 4: x8 lanes, x24 connector, 3/4 length. Slot 5: x16 lanes, x24 connector, full length. Slot 6: x8 lanes, x16 connector, no NCSI. The VIC 1225 needs an x24 connector; slot 5 is its primary slot in riser 2 for Cisco Card NIC mode.'],
    ['Plate and retainer order', 'Open: loosen the single thumbscrew on the bottom of the riser, swing the securing plate open on its two hinge-tabs and lift it off, then swing open the blue card-tab retainer. Close in reverse: retainer, then hook the plate\'s two hinge-tabs into their slots, swing it closed, tighten the thumbscrew.'],
    ['The securing plate', 'It is L-shaped. The flat part covers the front of the riser\'s bottom side and carries the captive thumbscrew. The folded edge, with black pads inside, wraps the riser\'s outer long edge and ends in the two hinge-tabs next to the top plate.'],
    ['Seat the card', 'Hold the card by its edges and bracket, never the gold contacts. Align it with the socket and push down evenly on both ends until it is fully seated. The card\'s rear-panel tab must sit flat against the riser\'s rear-panel opening.'],
    ['Blanking panels', 'Keep a blanking panel in every slot without a card. Do not operate the server unless all cards, faceplates and covers are in place: the airflow depends on them.'],
    ['The data ports', 'The VIC\'s two 10 Gb SFP+ ports, PORT 1 and PORT 2, are this server\'s data ports. Cable them to two different data switches with SFP+ twinax (DAC) cables or SFP+ optics and fiber.'],
    ['Cisco parts', 'Cisco supports the PCIe cards it qualifies and sells. Check the card against the server\'s supported list before fitting it.'],
    ['Training deck', 'Slides 19 and 20: why a riser turns the card flat. Slides 80 and 82: NIC anatomy and mechanical fit. Slide 88: the PCIe card field checklist.']],
  after() { plateAnim(); },
  render(t) {
    const r = t.riser;
    let g = r.loc === 'mat' ? riserBenchSvg(t) : riserSideSvg(t);
    g += riserRearSvg(t, 14, 448) + cardHandSvg(t, 310, 448);
    return frame('PCIe riser 2 and the 10 Gb NIC', g, 762);
  },
  actions(t) {
    const r = t.riser, a = [], seated = r.loc === 'in' && !r.up.f && !r.up.r;
    if (r.loc === 'in' && seated) {
      if (!r.grip.f) a.push(button('Grip the front touch point', 'riserGrip', 'f'));
      if (!r.grip.r) a.push(button('Grip the rear touch point', 'riserGrip', 'r'));
      a.push(button('Lift riser 2 straight up', 'riserLift', '', r.grip.f && r.grip.r));
    }
    if (r.loc === 'in' && !seated) { if (r.up.f) a.push(button('Push down the front end', 'riserPush', 'f')); if (r.up.r) a.push(button('Push down the rear end', 'riserPush', 'r')); }
    if (r.loc === 'up') { a.push(button('Lay it on the antistatic mat', 'riserMat')); a.push(button('Lower it onto RISER2, the pegs and the channels', 'riserAlign')); }
    if (r.loc === 'mat') {
      if (r.plate === 'on') a.push(button(r.screw === 'tight' ? 'Loosen the securing plate thumbscrew' : 'Tighten the securing plate thumbscrew', 'riserScrew'));
      a.push(button(r.plate === 'on' ? 'Swing the securing plate open on its hinge-tabs' : r.plate === 'open' ? 'Lift the securing plate off its hinge-tabs' : 'Hook the securing plate\'s two hinge-tabs into their slots', 'riserPlate'));
      if (r.plate === 'open') a.push(button('Swing the securing plate closed', 'riserPlateShut'));
      a.push(button(r.ret === 'closed' ? 'Swing open the card-tab retainer' : 'Close the card-tab retainer', 'riserRet'));
      a.push(button('Pick up riser 2 and hold it over the chassis', 'riserHold'));
    }
    if (t.sel.card) a.push(button('Put the card back in the tray', 'cardDrop'));
    return a;
  },
  tray(t) {
    const r = t.riser, spare = r.spare;
    return `<h2>Pick a card</h2>` + CATALOG.cards.map(c => {
      const at = Object.keys(r.slots).find(k => r.slots[k] === c.id), inHand = t.sel.card === c.id;
      return `<div class="item${inHand ? ' sel' : ''}"><span>${esc(c.name)}<small style="font-family:var(--mono)">${esc(c.pid)}</small><small>${esc(c.short)}</small>${at ? `<small style="color:var(--touch)">&#10003; In riser 2, slot ${at}</small>` : inHand ? '<small style="color:var(--touch)">In your hand</small>' : ''}</span>${at || inHand ? '' : button('Pick up', 'cardPick', c.id)}</div>`;
    }).join('') + `<h3>Blanking panels set aside</h3><p class="cap" style="font-size:13px;margin:0">${spare ? `${spare} on the mat. Click an open slot with your hands empty to fit one back.` : 'None. Panels you remove from a slot wait here.'}</p>`;
  }
});
function setPose(fn) { const before = riserPose(T.riser); fn(); riserFx.pose = { at: Date.now(), lift: before.lift, ang: before.ang, pv: before.pv }; }
const benchOnly = () => T.riser.loc === 'mat' || bad(T.riser.loc === 'up' ? 'Lay riser 2 on the antistatic mat first.' : 'Lift riser 2 out of the chassis and lay it on the antistatic mat first.');
const unseated = r => ['4', '5', '6'].filter(s => r.slots[s] && !cardSeated(r, s));
Sim.on('riserGrip', e => {
  if (!inside()) return; const r = T.riser;
  if (r.loc !== 'in' || r.up.f || r.up.r) return;
  r.grip[e] = !r.grip[e];
  say('info', r.grip[e] ? `${e === 'f' ? 'Front' : 'Rear'} touch point gripped.${r.grip.f && r.grip.r ? ' Both ends held: lift straight up.' : ' Grip the other end too: the riser comes up level, on both ends.'}` : 'Grip released.');
});
Sim.on('riserLift', () => {
  if (!inside()) return; const r = T.riser;
  if (r.loc !== 'in') return;
  if (!r.grip.f || !r.grip.r) return bad('Grasp the riser at both ends first. Lifting one end rocks the board in its socket and can damage the socket.');
  if (T.cables.vic1 || T.cables.vic2) return bad('Data cables are still plugged into the VIC ports on this riser. Unplug them first.');
  setPose(() => { r.loc = 'up'; r.grip = { f: false, r: false }; });
  say('ok', 'Riser 2 lifted straight up on both ends: its board came out of the RISER2 socket evenly.');
});
Sim.on('riserMat', () => { const r = T.riser; if (r.loc !== 'up') return; r.loc = 'mat'; say('ok', 'Riser 2 laid on the antistatic mat, on its board, with its bottom side toward you. The securing plate covers the front of that side; the blue card-tab retainer is at the rear panel.'); });
Sim.on('riserHold', () => {
  if (!inside()) return; const r = T.riser;
  if (r.loc !== 'mat') return;
  const u = unseated(r);
  if (u.length) return bad(`The card in slot ${u[0]} is not fully seated. Push down evenly on both ends first.`);
  if (r.ret !== 'closed') return bad('Close the blue card-tab retainer over the bracket tabs first.');
  if (r.plate !== 'on') return bad(r.plate === 'open' ? 'Swing the securing plate closed first, then tighten its thumbscrew.' : 'Refit the securing plate first: hook its two hinge-tabs into their slots, then swing it closed.');
  if (r.screw !== 'tight') return bad('Tighten the thumbscrew on the bottom of the riser first.');
  setPose(() => { r.loc = 'up'; }); riserFx.pose.lift = 300;
  say('ok', 'Riser 2 picked up by both touch points and held level over the chassis.' + (['4', '5', '6'].some(s => !r.slots[s] && !r.blank[s]) ? ' Note: a slot has no card and no blanking panel.' : ''));
});
Sim.on('riserAlign', () => {
  if (!inside()) return; const r = T.riser;
  if (r.loc !== 'up') return;
  setPose(() => { r.loc = 'in'; r.up = { f: 1, r: 1 }; });
  say('ok', 'Riser 2 lowered over the RISER2 socket: the two alignment pegs in their holes, the rear panel in the two chassis channels. Now push down on both ends.');
});
Sim.on('riserPush', e => {
  if (!inside()) return; const r = T.riser;
  if (r.loc !== 'in' || !r.up[e]) return;
  setPose(() => { r.up[e] = 0; }); rfxMark('push' + e);
  const other = e === 'f' ? 'r' : 'f';
  if (r.up[other]) say('info', `${e === 'f' ? 'Front' : 'Rear'} end pushed down. Now push the ${other === 'f' ? 'front' : 'rear'} end, so the board goes in evenly.`);
  else { Sim.sound('riser'); say('ok', `Both ends pushed down: riser 2 is fully engaged in the RISER2 socket.${cpuIn(T, 1) ? '' : ' Warning: riser 2 does not work without CPU 2.'}`); }
});
Sim.on('riserScrew', () => {
  if (!inside() || !benchOnly()) return; const r = T.riser;
  if (r.plate === 'open') return bad('The securing plate is swung open. Swing it closed first: the thumbscrew only reaches its post when the plate lies flat.');
  if (r.plate !== 'on') return bad('The securing plate is off. Refit it first: hook its two hinge-tabs into their slots, then swing it closed.');
  rfxMark('rscrew', r.screw);
  r.screw = r.screw === 'tight' ? 'loose' : 'tight';
  say('ok', r.screw === 'loose' ? 'Thumbscrew on the bottom of the riser turned anticlockwise until it came free of its post. It stays captive in the plate.' : 'Thumbscrew turned clockwise into its post, finger-tight: the securing plate is held.');
});
// securing plate: closed (on) -> swung open on its hinge-tabs (open) -> lifted off (off), and back
Sim.on('riserPlate', () => {
  if (!inside() || !benchOnly()) return; const r = T.riser;
  if (r.plate === 'on') {
    if (r.screw === 'tight') return bad('The securing plate is still held by its thumbscrew. Loosen the thumbscrew on the bottom of the riser first.');
    rfxMark('plate', 'on'); r.plate = 'open';
    return say('ok', 'Securing plate swung open on its two hinge-tabs: its folded edge, with the black pads inside, has turned up off the riser\'s outer edge. Now lift it off.');
  }
  if (r.plate === 'open') {
    rfxMark('plate', 'open'); r.plate = 'off';
    return say('ok', 'Securing plate lifted off: its two hinge-tabs came out of their slots. It lies on the mat.');
  }
  if (r.ret !== 'closed') return bad('Close the blue card-tab retainer first. The securing plate goes back on last.');
  const u = unseated(r); if (u.length) return bad(`The card in slot ${u[0]} is not fully seated. Push down on both ends first.`);
  rfxMark('plate', 'off'); r.plate = 'open'; r.screw = 'loose';
  say('ok', 'The securing plate\'s two hinge-tabs are hooked into their slots next to the top plate. Now swing the plate closed.');
});
Sim.on('riserPlateShut', () => {
  if (!inside() || !benchOnly()) return; const r = T.riser;
  if (r.plate !== 'open') return;
  if (r.ret !== 'closed') return bad('Close the blue card-tab retainer first. The securing plate goes back on last.');
  const u = unseated(r); if (u.length) return bad(`The card in slot ${u[0]} is not fully seated. Push down on both ends first.`);
  rfxMark('plate', 'open'); r.plate = 'on'; r.screw = 'loose';
  say('ok', 'Securing plate swung closed: its folded edge lies along the riser\'s outer edge and the thumbscrew sits over its post. Now tighten the thumbscrew.');
});
Sim.on('riserRet', () => {
  if (!inside() || !benchOnly()) return; const r = T.riser;
  if (r.ret === 'closed') {
    if (r.plate !== 'off') return bad(r.plate === 'on' ? 'Remove the securing plate first: loosen its thumbscrew, swing it open on its hinge-tabs and lift it off.' : 'Lift the securing plate off its hinge-tabs first. It is open, but still on the riser.');
    rfxMark('ret', 'closed'); r.ret = 'open';
    return say('ok', 'Blue card-tab retainer swung open: the bracket tabs are free.');
  }
  const u = unseated(r); if (u.length) return bad(`The card in slot ${u[0]} is not fully seated, so its bracket tab does not sit flat. Push down on both ends first.`);
  rfxMark('ret', 'open'); r.ret = 'closed';
  say('ok', 'Card-tab retainer swung closed over the bracket tabs.');
});
Sim.on('riserSlot', s => {
  if (!inside()) return; const r = T.riser, hand = T.sel.card;
  if (r.loc !== 'mat') return bad(r.loc === 'up' ? 'Lay riser 2 on the antistatic mat first.' : 'Cards are fitted with riser 2 out of the chassis. Lift it out and lay it on the antistatic mat.');
  if (r.plate !== 'off') return bad(r.plate === 'on' ? 'Loosen the thumbscrew, swing the securing plate open and lift it off first.' : 'Lift the securing plate off its hinge-tabs first.');
  if (r.ret !== 'open') return bad('Swing open the blue card-tab retainer first.');
  if (r.slots[s]) {
    if (hand) return bad('Your hand is full. Put the card you hold back in the tray first.');
    T.sel.card = r.slots[s]; r.slots[s] = null; r.seat[s] = null;
    return say('info', `Card pulled out of slot ${s} evenly on both ends. It is in your hand. Fit the blanking panel if the slot stays empty.`);
  }
  const c = hand && byId('cards', hand), sl = RSL[s];
  if (c && !sl.x24) return bad(`Slot ${s} has an x16 connector and no NCSI. The ${c.name} has extra contacts for an x24 connector: it goes in slot 4 or 5.`);
  if (c && s !== '5') return say('warn', `Slot ${s} would take it (x24 connector, NCSI), but slot 5 is the VIC's primary slot in riser 2 for Cisco Card NIC mode. Fit it in slot 5.`);
  if (r.blank[s]) { r.blank[s] = false; r.spare++; return say('ok', `Blanking panel lifted out of slot ${s}. Keep it: it goes back in any slot you leave empty.${c ? ' Now line the card up with the slot.' : ''}`); }
  if (!hand) {
    if (!r.spare) return bad(`Slot ${s} is open. Pick up a card, or keep a blanking panel to close it.`);
    r.blank[s] = true; r.spare--; return say('ok', `Blanking panel fitted in slot ${s}.`);
  }
  r.slots[s] = hand; r.seat[s] = { f: false, r: false }; T.sel.card = null; rfxMark('card' + s);
  say('ok', `${c.name} lined up with slot ${s}: edge connector over the x24 socket, bracket in the rear opening. Now push down evenly on both ends.`);
});
Sim.on('cardPush', a => {
  if (!inside()) return; const [s, e] = a.split(':'), r = T.riser;
  if (!r.slots[s] || cardSeated(r, s)) return;
  r.seat[s][e] = true;
  if (!cardSeated(r, s)) return say('info', `${e === 'f' ? 'Far end' : 'Bracket end'} pushed down. Now push the ${e === 'f' ? 'bracket end' : 'far end'}: evenly, until the whole edge is in.`);
  Sim.sound('card');
  say('ok', `Card fully seated in slot ${s}: the rear-panel tab sits flat against the riser's rear-panel opening.`);
});
Sim.on('cardPick', id => {
  const r = T.riser; if (Object.values(r.slots).includes(id)) return say('info', 'That card is already fitted in riser 2.');
  T.sel.card = id; say('info', `${byId('cards', id).name} picked up by its edges and bracket. Check it below the riser.`);
});
Sim.on('cardDrop', () => { T.sel.card = null; say('info', 'Card put back in the tray.'); });

/* ---- Fan modules: the C240 M4 fan wall, six hot-swappable modules (UCSC-FAN-C240M4), redrawn from the trainer's photos.
   Bays as seen facing the front of the server: FAN 06 at the left (power supply side) to FAN 01 at the right.
   Top cover of a module (photo units, rear at the top): green latch on the left (a block with a curved finger lip), half-round cutout on the right
   for the neighbour's latch, airflow arrow label in the middle, fault LED light pipe along the front edge. ---- */
const FAN = { x0: 66, pitch: 128, w: 126, fy: 136, ty: 360, ts: 1.1 };
const fanX = i => FAN.x0 + (5 - i) * FAN.pitch;          // bay i (0 = FAN 01) to its column
const FGREEN = '#A6D63A', FGREEN2 = '#6E9A1E';
const fanLed = (t, i) => { const f = t.fans[i]; if (t.power !== 'on' || f === 'out' || f === 'set') return 'off'; return f === 'fault' ? 'amber' : 'green'; };
const FLED = { green: '#45D07F', amber: '#FFB52E', off: '#2A2F35' };
let fanFx = {};
const ffxMark = k => { fanFx[k] = Date.now(); };
const ffxAge = k => fanFx[k] ? (Date.now() - fanFx[k]) / 1000 : 99;
// the latch as a module goes home: pushed in by the catch as it slides down, then back out with the click (about 0.4 s)
const fanSnap = (i, d) => { const a = ffxAge('snap' + i); return a < 0.6 ? `<animateTransform attributeName="transform" type="translate" values="0 0;${d} 0;${d} 0;0 0;0 0" keyTimes="0;0.3;0.66;0.76;1" dur="0.6s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : ''; };
// the latch from above, in top-cover units: scoop, lip and block (photo: the green tab at the module's side)
const FAN_LATCH_TOP = `<path d="M1 23.6Q-5.2 40.25 1 56.9L2.6 56.9Q10.4 40.25 2.6 23.6Z" fill="#6F9420" stroke="#4E6C14" stroke-width="0.5"/>`
  + `<path d="M1 23.6Q-5.2 40.25 1 56.9" fill="none" stroke="#B9DE4C" stroke-width="0.9"/>`
  + `<path d="M6.6 20.6Q17.8 40.25 6.6 59.9H17.4Q20.4 59.9 20.4 56.9V23.6Q20.4 20.6 17.4 20.6Z" fill="${FGREEN}" stroke="${FGREEN2}" stroke-width="0.6"/>`
  + `<path d="M15.6 22.6Q19 22.6 19 26V54.5Q19 57.9 15.6 57.9" fill="none" stroke="#86B42A" stroke-width="1.2"/>`
  + `<path d="M1.6 19.8Q0.4 19.8 0.8 21.2Q13.6 40.25 0.8 59.3Q0.4 60.7 1.6 60.7L2.4 60.7Q4 60.7 4.9 59.9Q18.4 40.25 4.9 20.6Q4 19.8 2.4 19.8Z" fill="#C3EA4C" stroke="${FGREEN2}" stroke-width="0.6"/>`
  + `<path d="M1.4 21.2Q13.8 40.25 1.4 59.3" fill="none" stroke="#EAFBA8" stroke-width="0.9" stroke-linecap="round"/>`;
// top cover, in photo units (0..114.5 across, 0..92 deep, rear at y = 0); flip turns it around (arrow to the front)
function fanTopMm(o = {}) {
  const led = FLED[o.led || 'off'], px = o.pinch ? 3.5 : 0;
  let s = `<path d="M15.3 0.2H114.5V24A17.5 17.5 0 0 0 114.5 59V92H0V60.5H20.5V19.5H3V3H15.3Z" fill="#26292D" stroke="#0E1012" stroke-width="0.8"/>`;
  s += `<path d="M3.5 3.5H15.3V1H113.6" fill="none" stroke="#3A3F45" stroke-width="0.8"/>`;
  // airflow label: frame, triangle head, three wavy lines
  s += `<rect x="42" y="19" width="35" height="45.5" rx="0.6" fill="none" stroke="#E9EDF0" stroke-width="0.7"/><path d="M53.5 31.5L61.5 23.5L69.5 31.5Z" fill="#E9EDF0"/>`;
  [-2.4, 0, 2.4].forEach(d => { s += `<path d="M${f1(61.5 + d)} 31.5C${f1(61.5 + d)} 40 ${f1(55 + d)} 44 ${f1(55 + d)} 50C${f1(55 + d)} 54 ${f1(56 + d)} 57 ${f1(56 + d)} 60" fill="none" stroke="#E9EDF0" stroke-width="1"/>`; });
  // fault LED light pipe along the front edge
  s += `<rect x="24.5" y="80.6" width="72" height="2.6" rx="1.3" fill="${led}"${o.led === 'off' ? '' : ` style="filter:drop-shadow(0 0 2px ${led})"`}/><rect x="24" y="80" width="73" height="3.6" rx="1.8" fill="none" stroke="#0E1012" stroke-width="0.5"/>`;
  // green latch (pinched: pushed toward the centre): a block in the notch, a curved finger lip across its outer end with the
  // ends turned up toward the edge, and the scoop behind the lip reaching into the neighbour's half-round cutout
  s += `<g transform="translate(${px} 0)">${o.latchAnim || ''}${FAN_LATCH_TOP}</g>`;
  return o.flip ? `<g transform="rotate(180 57.25 46)">${s}</g>` : s;
}
// front face, as seen from the drive bays: black top housing with the latch, green finger guard over the impeller; w x 150
function fanFrontSvg(x, y, o = {}) {
  const W = FAN.w, led = FLED[o.led || 'off'], cx = x + W / 2, cy = y + 94, px = o.pinch ? 6 : 0;
  let s = `<rect x="${x + 2}" y="${y + 30}" width="${W - 4}" height="${126}" rx="3" fill="#1B1E22"/>`;
  // impeller behind the guard
  s += `<circle cx="${cx}" cy="${cy}" r="54" fill="#121417"/>`;
  for (let k = 0; k < 7; k++) { const a = k * 2 * Math.PI / 7; s += `<path d="M${f1(cx + 13 * Math.cos(a))} ${f1(cy + 13 * Math.sin(a))}Q${f1(cx + 40 * Math.cos(a + 0.5))} ${f1(cy + 40 * Math.sin(a + 0.5))} ${f1(cx + 52 * Math.cos(a + 0.2))} ${f1(cy + 52 * Math.sin(a + 0.2))}L${f1(cx + 50 * Math.cos(a - 0.25))} ${f1(cy + 50 * Math.sin(a - 0.25))}Q${f1(cx + 34 * Math.cos(a + 0.05))} ${f1(cy + 34 * Math.sin(a + 0.05))} ${f1(cx + 13 * Math.cos(a - 0.35))} ${f1(cy + 13 * Math.sin(a - 0.35))}Z" fill="#2B3036"/>`; }
  // green finger guard: square frame, two rings, hub, five curved spokes
  s += `<rect x="${x + 3}" y="${y + 33}" width="${W - 6}" height="120" rx="5" fill="none" stroke="${FGREEN}" stroke-width="7"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="55" fill="none" stroke="${FGREEN}" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="31" fill="none" stroke="${FGREEN}" stroke-width="4.5"/><circle cx="${cx}" cy="${cy}" r="11" fill="${FGREEN}" stroke="${FGREEN2}"/>`;
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; s += `<path d="M${f1(cx + 11 * Math.cos(a))} ${f1(cy + 11 * Math.sin(a))}Q${f1(cx + 38 * Math.cos(a - 0.55))} ${f1(cy + 38 * Math.sin(a - 0.55))} ${f1(cx + 60 * Math.cos(a - 0.2))} ${f1(cy + 60 * Math.sin(a - 0.2))}" fill="none" stroke="${FGREEN}" stroke-width="4" stroke-linecap="round"/>`; }
  s += `<path d="M${x + 6} ${y + 150}H${x + 26}M${x + W - 26} ${y + 150}H${x + W - 6}" stroke="${FGREEN2}" stroke-width="3"/>`;
  // black top housing, LED light pipe on top, two small green clips, the latch on the left
  s += `<path d="M${x} ${y + 34}V${y + 10}Q${x} ${y + 4} ${x + 6} ${y + 4}H${x + W - 6}Q${x + W} ${y + 4} ${x + W} ${y + 10}V${y + 34}Z" fill="#26292D" stroke="#0E1012"/>`;
  s += `<rect x="${x + 36}" y="${y + 1.5}" width="${W - 50}" height="4.5" rx="2.2" fill="${led}"${o.led === 'off' ? '' : ` style="filter:drop-shadow(0 0 4px ${led})"`}/>`;
  [x + 16, x + W - 30].forEach(cx2 => { s += `<rect x="${cx2}" y="${y + 24}" width="14" height="7" rx="3.5" fill="none" stroke="${FGREEN}" stroke-width="2"/>`; });
  s += `<g transform="translate(${px} 0)">${o.latchAnim || ''}<path d="M${x + 4} ${y + 18}V${y + 6}Q${x + 4} ${y + 3} ${x + 7} ${y + 3}H${x + 21}Q${x + 24} ${y + 3} ${x + 24} ${y + 6}V${y + 18}Z" fill="${FGREEN}" stroke="${FGREEN2}"/>`
    + `<path d="M${x + 21.5} ${y + 5}V${y + 17}" stroke="#86B42A" stroke-width="2"/><path d="M${x + 4} ${y + 18}H${x + 24}" stroke="#4E6C14" stroke-width="1.4"/>`
    + `<path d="M${x - 1} ${y + 7}Q${x - 2} ${y + 0.5} ${x + 2} ${y}Q${x + 6} ${y - 0.5} ${x + 9} ${y + 3}L${x + 9} ${y + 7}Q${x + 5.5} ${y + 4.5} ${x + 3} ${y + 5}Q${x} ${y + 5.5} ${x - 1} ${y + 7}Z" fill="#C3EA4C" stroke="${FGREEN2}" stroke-width=".8"/>`
    + `<path d="M${x - 0.2} ${y + 3.6}Q${x + 1} ${y + 0.8} ${x + 4} ${y + 0.8}" fill="none" stroke="#EAFBA8" stroke-width="1.2" stroke-linecap="round"/></g>`;
  // connector on the bottom
  s += `<rect x="${cx - 16}" y="${y + 156}" width="32" height="8" rx="1" fill="#15181B"/>${[0, 1, 2, 3, 4, 5].map(k => `<rect x="${cx - 13 + k * 5}" y="${y + 158}" width="2.4" height="4" fill="#C9B27A"/>`).join('')}`;
  return s;
}
function fanWallSvg(t) {
  let g = `<rect x="18" y="48" width="864" height="282" rx="8" fill="#1B2B37" stroke="#2E5571"/><text x="34" y="70" class="st">Fan wall, seen from the front of the server (drive side)</text>`;
  g += `<rect x="${FAN.x0 - 8}" y="${FAN.fy + 166}" width="${6 * FAN.pitch + 12}" height="8" fill="#1E5B3E"/>`;
  for (let i = 0; i < 6; i++) {
    const x = fanX(i), f = t.fans[i], lifted = f === 'out', set = f === 'set', a = ffxAge('fan' + i);
    // bay: tray walls and the motherboard connector the module plugs into
    g += `<rect x="${x - 2}" y="${FAN.fy + 20}" width="${FAN.pitch - 2}" height="148" fill="#0F171E" stroke="#3A4651"/><rect x="${x + FAN.w / 2 - 18}" y="${FAN.fy + 160}" width="36" height="8" rx="1" fill="#0B0D0F" stroke="#3A4046"/>`;
    if (!lifted) {
      const dy = set ? -8 : 0, anim = a < 0.5 ? `<animateTransform attributeName="transform" type="translate" from="0 ${set ? -60 : -8}" to="0 ${dy}" dur="0.45s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : '';
      g += `<g transform="translate(0 ${dy})">${anim}${fanFrontSvg(x, FAN.fy, { led: fanLed(t, i), pinch: t.fanPinch === i, latchAnim: fanSnap(i, 6) })}</g>`;
      if (t.fanPinch === i) g += `<g pointer-events="none"><path d="M${x - 14} ${FAN.fy - 2}h12m-5 -5l5 5l-5 5M${x + 56} ${FAN.fy - 2}h-12m5 -5l-5 5l5 5" fill="none" stroke="#FFB52E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${chip(x + FAN.w / 2 + 16, FAN.fy - 32, 'pinched')}</g>`;
      if (set) g += `<g pointer-events="none"><path d="M${x + FAN.w / 2} ${FAN.fy - 44}v26m-10 -10l10 10l10 -10" fill="none" stroke="#FFB52E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    } else {
      const lbl = t.fanClock !== null && t.power === 'on' ? `${t.fanClock} s left` : 'empty';
      g += `<text x="${x + FAN.w / 2}" y="${FAN.fy + 96}" text-anchor="middle" class="st" style="fill:${t.fanClock !== null && t.fanClock < 20 ? '#FF8A7A' : '#FFB52E'}">${esc(lbl)}</text><text x="${x + FAN.w / 2}" y="${FAN.fy + 114}" text-anchor="middle" class="ss">bay empty</text>`;
    }
    const lab = `FAN 0${i + 1}`, st = lifted ? 'empty' : set ? 'set in place, not latched' : f === 'fault' ? 'fault LED amber' : 'running';
    g += `<g${hot('fanBay', i, `${lab}: ${st}`)}><rect x="${x - 2}" y="${FAN.fy + 14}" width="${FAN.w}" height="150" rx="5" class="zone"/></g>`;
    if (!lifted) g += `<g${hot('fanLatch', i, `${lab}: green latch${t.fanPinch === i ? ', pinched' : ''}`)}><rect x="${x - 4}" y="${FAN.fy - 14 + (set ? -8 : 0)}" width="46" height="30" rx="6" class="zone"/></g>`;
    g += `<text x="${x + FAN.w / 2}" y="${FAN.fy - 22}" text-anchor="middle" style="font:700 12px var(--font);fill:#EAF2F7">${lab}</text>`;
  }
  g += `<text x="34" y="${FAN.fy + 188}" class="ss">&#9664; Power supply side</text><text x="866" y="${FAN.fy + 188}" text-anchor="end" class="ss">FAN 01 at the right, as seen facing the front &#9654;</text>`;
  return g;
}
function fanTraySvg(t) {
  let g = `<rect x="18" y="336" width="864" height="146" rx="8" fill="#16293A" stroke="#2E5571"/><text x="34" y="356" class="st">Top view of the tray</text><text x="866" y="356" text-anchor="end" class="ss">Rear of the server &#9650; (arrows point here)</text>`;
  for (let i = 0; i < 6; i++) {
    const x = fanX(i), f = t.fans[i];
    if (f === 'out') { g += `<rect x="${x}" y="${FAN.ty + 4}" width="${FAN.w}" height="${92 * FAN.ts}" rx="3" fill="#0B1014" stroke="#FFB52E" stroke-dasharray="5 4"/>`; }
    else g += `<g transform="translate(${x} ${FAN.ty + 4}) scale(${FAN.ts})"${f === 'set' ? ' opacity=".8"' : ''}>${fanTopMm({ led: fanLed(t, i), pinch: t.fanPinch === i, latchAnim: fanSnap(i, 3.5) })}</g>`;
    g += `<g${hot('fanBay', i, `FAN 0${i + 1}, top view`)}><rect x="${x}" y="${FAN.ty + 4}" width="${FAN.w}" height="${92 * FAN.ts}" rx="3" class="zone"/></g>`;
    if (f !== 'out') g += `<g${hot('fanLatch', i, `FAN 0${i + 1}: green latch, top view`)}><rect x="${x - 2}" y="${FAN.ty + 4 + 18 * FAN.ts}" width="${24 * FAN.ts}" height="${44 * FAN.ts}" rx="4" class="zone"/></g>`;
  }
  g += `<text x="450" y="478" text-anchor="middle" class="ss">Front of the server &#9660;: the fault LED light pipe runs along each module's front edge.</text>`;
  return g;
}
function fanHandSvg(t) {
  const X = 14, Y = 490, h = t.fanHand;
  let g = `<rect x="${X}" y="${Y}" width="872" height="270" rx="8" fill="#16293A" stroke="#2E5571"/>`;
  const clock = t.fanClock !== null && t.power === 'on' ? `<g><rect x="${X + 652}" y="${Y + 10}" width="208" height="44" rx="8" fill="${t.fanClock < 20 ? '#3F1A17' : '#3A2A10'}" stroke="${t.fanClock < 20 ? '#FF8A7A' : '#FFB52E'}"/><text x="${X + 668}" y="${Y + 30}" style="font:700 12px var(--font);fill:#FFD27A">Bay empty, server running</text><text x="${X + 668}" y="${Y + 47}" style="font:700 14px var(--font);fill:${t.fanClock < 20 ? '#FF8A7A' : '#FFB52E'}">${t.fanClock} s left of one minute</text></g>` : '';
  if (!h) return g + `<text x="${X + 14}" y="${Y + 22}" class="st">In your hand</text>` + clock + `<text x="${X + 436}" y="${Y + 130}" text-anchor="middle" class="ss">Nothing in your hand. ${t.fans.includes('set') ? 'Press the module that rests on its connector down until the latch clicks.' : t.fans.includes('out') ? 'Pick up the new fan module from the tray: it appears here, drawn large.' : 'Pinch a module\'s green latch toward the centre, then lift it straight up.'}</text>`;
  const kind = { faulty: 'Failed fan module, for return', healthy: 'Healthy fan module (put it back)', new: 'New fan module UCSC-FAN-C240M4' }[h.kind];
  g += `<text x="${X + 14}" y="${Y + 22}" class="st">In your hand: ${esc(kind)}</text>` + clock;
  // front view, scaled up
  g += `<g transform="translate(${X + 34} ${Y + 40}) scale(1.05)">${fanFrontSvg(0, 12, { led: 'off' })}</g>`;
  // top view, as held now
  const flip = h.arrow === 'front';
  g += `<g transform="translate(${X + 214} ${Y + 66}) scale(1.62)">${fanTopMm({ led: 'off', flip })}</g>`;
  const msg = h.kind === 'faulty' ? ['Failed module: set it aside for return', '#FF8A7A'] : flip ? ['Arrow points to the front: turn it around', '#FF8A7A'] : [h.kind === 'healthy' ? 'Healthy module: put it back in its bay' : 'Arrow points to the rear: ready to fit', '#45D07F'];
  g += `<text x="${X + 307}" y="${Y + 230}" text-anchor="middle" class="ss" style="fill:${msg[1]}">${msg[0]}</text>`;
  g += `<text x="${X + 100}" y="${Y + 246}" text-anchor="middle" class="ss">Front face (air in)</text><text x="${X + 307}" y="${Y + 246}" text-anchor="middle" class="ss">Top, rear of the server at the top</text>`;
  if (h.kind === 'faulty') g += `<rect x="${X + 112}" y="${Y + 50}" width="74" height="22" rx="4" fill="#9B2C22"/><text x="${X + 149}" y="${Y + 65}" text-anchor="middle" style="font:700 11px var(--font);fill:#FFFFFF">FAILED</text>`;
  const call = (n, x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="9.5" fill="#F2B53A" stroke="#14202B" stroke-width="1.5"/><text x="${f1(x)}" y="${f1(y + 4)}" text-anchor="middle" style="font:700 11px var(--font);fill:#14202B">${n}</text>`;
  const T0 = [X + 214, Y + 66, 1.62], tp = (u, v) => { const [ox, oy, s] = T0; return flip ? [ox + s * (114.5 - u), oy + s * (92 - v)] : [ox + s * u, oy + s * v]; };
  const marks = [tp(4, 33), tp(59.5, 41), tp(60, 82), [X + 34 + 1.05 * 100, Y + 40 + 1.05 * 66], [X + 34 + 1.05 * 104, Y + 40 + 1.05 * 172]];
  marks.forEach(([x, y], k) => { g += call(k + 1, x, y); });
  const notes = [['Green latch', 'pinch toward the centre to release'], ['Airflow arrow', 'must point to the rear of the server'], ['Fault LED light pipe', 'amber when the module has failed'], ['Finger guard', 'air comes in from the drive side'], ['Connector on the bottom', 'lines up with the motherboard connector']];
  notes.forEach(([a, b], k) => { const yy = Y + 84 + k * 34; g += call(k + 1, X + 470, yy) + `<text x="${X + 486}" y="${yy - 1}" class="st" style="font-size:12.5px">${esc(a)}</text><text x="${X + 486}" y="${yy + 13}" class="ss">${esc(b)}</text>`; });
  g += `<text x="${X + 470}" y="${Y + 258}" class="ss" style="fill:#FFD27A">Spare: UCSC-FAN-C240M4, front-to-back airflow.</text>`;
  return g;
}
Sim.registerView({
  id: 'fans', title: 'Fan modules',
  keep: [
    ['Hot-swappable modules', 'The six fan modules can be replaced with the server running; you do not need to shut it down. The fan tray itself is not hot-swappable.'],
    ['One minute', 'To keep proper cooling, do not run the server for more than one minute with any fan module removed. Have the new module ready before you pull the old one.'],
    ['Find the failed module', 'The fault LED on top of a module lights amber when it fails. On the front panel, the fan status LED is green when all modules are fine, amber when one breaches the critical threshold, and blinking amber at the non-recoverable threshold.'],
    ['Numbering', 'FAN 01 to FAN 06, as seen facing the front of the server: FAN 06 on the power supply side, FAN 01 at the other end. The numbers are printed on the chassis next to each bay.'],
    ['Removing a module', 'Grasp the top of the module, pinch the green plastic latch toward the centre, and lift it straight up to disconnect its connector.'],
    ['Fitting a module', 'Line up the connector on the bottom with the connector on the motherboard. The arrow label on top shows the airflow and must point to the rear of the server. Press down gently until the latch clicks and locks.'],
    ['One at a time', 'Replace one module at a time, and refit the top cover as soon as you are done: the cover is part of the airflow path.'],
    ['Spare part', 'Fan module UCSC-FAN-C240M4, front-to-back airflow. Send the failed module back for return.'],
    ['Training deck', 'Slide 3: fan modules among the server components. Slides 117 and 118: thermal faults, LEDs and BMC sensors.']],
  render(t) {
    return frame('Fan modules (hot-swappable)', fanWallSvg(t) + fanTraySvg(t) + fanHandSvg(t), 770);
  },
  actions(t) {
    const a = [], h = t.fanHand, out = t.fans.indexOf('out'), set = t.fans.indexOf('set');
    if (t.fanPinch !== null && t.fans[t.fanPinch] !== 'out') a.push(button(`Lift FAN 0${t.fanPinch + 1} straight up`, 'fanBay', t.fanPinch, true));
    if (h) {
      if (h.kind === 'faulty') a.push(button('Set the failed module aside for return', 'fanAside'));
      a.push(button('Turn the module around', 'fanTurn'));
      if (out >= 0) a.push(button(`Set it in bay FAN 0${out + 1}`, 'fanBay', out));
    }
    if (set >= 0) a.push(button(`Press FAN 0${set + 1} down until the latch clicks`, 'fanBay', set, true));
    return a;
  },
  tray(t) {
    const h = t.fanHand, used = t.flags.fanSpareUsed;
    return `<h2>Pick a fan module</h2><div class="item${h && h.kind === 'new' ? ' sel' : ''}"><span>New fan module<small style="font-family:var(--mono)">UCSC-FAN-C240M4</small><small>Hot-swappable, front-to-back airflow</small>${used ? '<small style="color:var(--touch)">&#10003; Fitted</small>' : h && h.kind === 'new' ? '<small style="color:var(--touch)">In your hand</small>' : ''}</span>${used || (h && h.kind === 'new') ? '' : button('Pick up', 'fanPick', 'new')}</div>` +
      (t.fanRma ? `<h3>Set aside for return</h3><p class="cap" style="font-size:13px;margin:0">The failed module, tagged for return.</p>` : '');
  }
});
const fanReady = () => {
  if (T.cover !== 'open') return bad('Remove the top cover to reach the fan modules (Chassis view).');
  if (!T.esd) return bad('Put on the ESD wrist strap first (Chassis view).');
  return true;
};
Sim.on('fanLatch', i => {
  i = +i; if (!fanReady()) return;
  const f = T.fans[i];
  if (f === 'out') return;
  if (f === 'set') return say('info', `FAN 0${i + 1} is resting on its connector. Press it down until the latch clicks.`);
  if (T.fanHand) return bad('Your hands are full. Set the module you hold aside, or fit it, first.');
  if (T.fans.some(x => x === 'out' || x === 'set')) return bad('Another fan bay is still open. Replace one module at a time.');
  T.fanPinch = T.fanPinch === i ? null : i;
  say('info', T.fanPinch === i ? `Top of FAN 0${i + 1} grasped and its green latch pinched toward the centre. Now lift it straight up.` : 'Latch released.');
});
Sim.on('fanBay', i => {
  i = +i; if (!fanReady()) return;
  const f = T.fans[i], h = T.fanHand;
  if (f === 'set') { T.fans[i] = 'ok'; ffxMark('fan' + i); ffxMark('snap' + i); Sim.sound('fanLatch', 0.44); T.fanClock = null; if (T.flags.fanSpareBay === i) T.flags.fanDone = true;
    return say('ok', `FAN 0${i + 1} pressed down gently: the latch clicked and locked, the connector is engaged.${T.power === 'on' ? ' The module spins up and its LED is green.' : ''}`); }
  if (f === 'out') {
    if (!h) return bad(`Bay FAN 0${i + 1} is empty. Pick up the new fan module from the tray first.`);
    if (h.kind === 'faulty') return bad('That is the failed module. Set it aside for return and fit the new one.');
    if (h.arrow !== 'rear') return bad('The arrow label points to the front. Turn the module around: the arrow shows the airflow and must point to the rear of the server.');
    if (h.kind === 'healthy' && h.bay !== i) return bad(`That module came out of FAN 0${h.bay + 1}. Put it back in its own bay.`);
    T.fans[i] = 'set'; ffxMark('fan' + i); T.fanHand = null; if (h.kind === 'new') { T.flags.fanSpareUsed = true; T.flags.fanSpareBay = i; }
    return say('ok', `Module set in bay FAN 0${i + 1}: connector on the bottom lined up with the motherboard connector, arrow to the rear. Now press it down gently.`);
  }
  if (T.fanPinch !== i) return bad(`Pinch the green latch of FAN 0${i + 1} toward the centre first, then lift.`);
  T.fanPinch = null; T.fans[i] = 'out';
  if (f === 'fault') { T.flags.fanPulled = true; T.fanHand = { kind: 'faulty', bay: i, arrow: 'rear' }; say('ok', `FAN 0${i + 1} lifted straight up: its connector came out of the motherboard.${T.power === 'on' ? ' The server is running: fit the new module within one minute.' : ''}`); }
  else { T.fanHand = { kind: 'healthy', bay: i, arrow: 'rear' }; say('err', `FAN 0${i + 1} was healthy (green LED). Put it back in its bay and find the module with the amber LED.`); }
  if (T.power === 'on') T.fanClock = 60;
});
Sim.on('fanAside', () => { const h = T.fanHand; if (!h || h.kind !== 'faulty') return; T.fanHand = null; T.fanRma = true; say('ok', 'Failed module tagged and set aside for return. Now pick up the new one.'); });
Sim.on('fanPick', () => {
  if (T.flags.fanSpareUsed) return say('info', 'The spare has already been fitted.');
  if (T.fanHand) return bad(T.fanHand.kind === 'faulty' ? 'Set the failed module aside for return first.' : 'Your hands are full.');
  T.fanHand = { kind: 'new', bay: null, arrow: 'front' };
  say('info', 'New fan module UCSC-FAN-C240M4 out of its bag. Check the arrow on top below: it must point to the rear of the server.');
});
Sim.on('fanTurn', () => { const h = T.fanHand; if (!h) return; h.arrow = h.arrow === 'rear' ? 'front' : 'rear'; say('info', `Module turned around: the arrow now points to the ${h.arrow}${h.arrow === 'rear' ? ', as it must' : ''}.`); });

/* ---- Storage: the trainer's front photo of the C240 (12-drive LFF backplane), straightened and cleaned: the drive cage
   is remapped onto a regular bay grid (pitch 510) and both rack ears are re-projected upright, at true 2U / 19-inch scale.
   Coordinates are the 2532 x 488 photo frame: ears x 106 to 2398, y 12 to 430; cage y 20 to 422. ---- */
const FB = { W: 2532, H: 488 };
const bayXY = i => [230 + 510 * (i % 4), 30 + 129.33 * Math.floor(i / 4)];
// fault LED (x, y) and activity LED (x, y) on each carrier, offsets from the bay corner, measured on the photo
const DLED = [[489, 39, 489, 62], [490, 41, 490, 65], [490, 37, 490, 61], [492, 35, 492, 60], [487, 38, 487, 62], [491, 41, 490, 64], [491, 41, 491, 64], [487, 41, 486, 65], [487, 37, 488, 61], [491, 34, 491, 55], [491, 36, 490, 58], [491, 37, 490, 60]];
const capTxt = d => d.cap >= 1000 ? (d.cap / 1000) + 'TB' : d.cap + 'GB';
const pidLabel = (d, x, y, w = 158, h = 17) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#4C5157" stroke="#A3AAB1" stroke-width="1"/><text x="${x + w / 2}" y="${y + h * 0.72}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${h * 0.56}" fill="#F2F4F6" textLength="${w - 18}" lengthAdjust="spacingAndGlyphs">${esc(d.pid)} / ${capTxt(d)}</text>`;
const ledDot = (x, y, col, blink) => col ? `<circle cx="${x}" cy="${y}" r="9" fill="${col}" opacity=".35"${blink ? ' class="blink"' : ''}/><circle cx="${x}" cy="${y}" r="5.2" fill="${col}"${blink ? ' class="blink"' : ''}/>` : '';
function driveLeds(t, b) {
  const on = t.power === 'on', ok = b.st === 'locked' && !!b.drive;
  const fault = !on || !ok ? null : b.health === 'fault' ? 'amber' : b.health === 'rebuild' ? 'amber' : null;
  const act = on && ok ? 'green' : null;
  return { fault, faultBlink: b.health === 'rebuild', act, actBlink: on && ok && (t.flags.hasOS || b.health === 'rebuild') };
}
// what each bay showed before its last change, for the cross-fades on the front photo (blank, empty, open, locked)
const bayLast = {}, bayFx = {};
function bayTrans(i, st) { if (bayLast[i] !== undefined && bayLast[i] !== st) bayFx[i] = { from: bayLast[i], at: Date.now() }; bayLast[i] = st; const f = bayFx[i], a = f ? (Date.now() - f.at) / 1000 : 99; return a < 0.9 ? { from: f.from, a } : null; }
const fade = (a, from, to, dur = 0.5) => `<animate attributeName="opacity" from="${from}" to="${to}" dur="${dur}s" begin="-${a.toFixed(2)}s" fill="freeze"/>`;
const emptyBay = (bx, by, anim = '') => `<g>${anim}<rect x="${bx + 1}" y="${by + 3}" width="508" height="124" fill="#0B0F13"/><rect x="${bx + 30}" y="${by + 14}" width="450" height="102" fill="#141A20"/><rect x="${bx + 90}" y="${by + 30}" width="330" height="70" fill="#1B232B"/><rect x="${bx + 205}" y="${by + 54}" width="100" height="18" rx="2" fill="#2A3540"/><path d="M${bx + 4} ${by + 118}H${bx + 506}M${bx + 4} ${by + 10}H${bx + 506}" stroke="#3B4650" stroke-width="3"/></g>`;
const openSled = (bx, by, drive, anim = '', move = '') => { const X = bx - 2, Y = by + 0.34; return `<g>${anim}${move}<image href="${IMG.sledOpen}" x="${X}" y="${Y}" width="514" height="181"/>${drive ? `<g transform="matrix(0.7657 0.1096 -0.2912 0.9375 ${X + 119} ${Y + 108})">${pidLabel(byId('drives', drive), 0, 0, 146, 16)}</g>` : ''}</g>`; };
// all twelve bays drawn over the photo, in photo coordinates; a bay that just changed cross-fades from its old look
/* ---- slam latches: the lower part of each rack ear (Cisco badge on the left, Intel and UCS badges on the right) pivots at its
   top on a spring-loaded hinge. Pulled open, it swings out toward you, its hook clears the rack post and the server can slide out.
   Let go, it springs back; pushed back in, it snaps onto the post with a click. Photo units of the straightened front photo. ---- */
// the open-latch drawing covers front-photo units 100..226 x 236..506 for the left ear; the right ear mirrors it, a little shorter
// (its latch sits lower, under the console port). hinge: the pin at the bottom of the cavity, the latch swings about it
const SLAM = { l: { x: 100, y: 236, sy: 1, flip: false, cx: 161, zx: 106 }, r: { x: 2278, y: 247.5, sy: 0.9412, flip: true, cx: 2343, zx: 2290 }, w: 126, h: 270, hinge: 192, zw: 108 };
const latchFx = {};
const lfxMark = k => { latchFx[k] = Date.now(); };
const lfxAge = k => latchFx[k] ? (Date.now() - latchFx[k]) / 1000 : 99;
const latchOpen = (t, k) => !!(t.rack && t.rack.latch && t.rack.latch[k]);
const LATCH_T = 0.34;
function latchSvg(t, k) {
  const L = SLAM[k], open = latchOpen(t, k), a = lfxAge('l' + k), moving = a < LATCH_T;
  if (!open && !moving) return '';
  const an = (attr, type, vals, keys) => `<animate${type ? 'Transform' : ''} attributeName="${attr}"${type ? ` type="${type}"` : ''} values="${vals}" keyTimes="${keys}" dur="${LATCH_T}s" begin="-${a.toFixed(2)}s" fill="freeze"/>`;
  // opening: the cavity shows at once and the latch folds down from the hinge; closing: the latch folds back up, then the cavity goes
  const plate = moving ? an('transform', 'scale', open ? '1 0;1 0;1 1' : '1 1;1 0;1 0', open ? '0;0.15;1' : '0;0.7;1') : '';
  const cav = moving ? an('opacity', '', open ? '0;1;1' : '1;1;0', open ? '0;0.3;1' : '0;0.7;1') : '';
  const img = (href, extra = '') => `<image href="${href}" x="0" y="0" width="${SLAM.w}" height="${SLAM.h}" preserveAspectRatio="none"${extra}/>`;
  const frame = L.flip ? `translate(${L.x + SLAM.w} ${L.y}) scale(-1 ${L.sy})` : `translate(${L.x} ${L.y})`;
  return `<g pointer-events="none" transform="${frame}"><g transform="translate(0 ${SLAM.hinge})"><g>${plate}<g transform="translate(0 ${-SLAM.hinge})">${img(IMG.latchPlate)}</g></g></g><g>${cav}${img(IMG.latchCav)}</g></g>`;
}
function frontBays(t) {
  let g = `<image href="${IMG.frontM4}" width="${FB.W}" height="${FB.H}"/>`;
  t.bays.forEach((b, i) => {
    const [bx, by] = bayXY(i), L = DLED[i], tr = bayTrans(i, b.st), was = tr && tr.from;
    // what the bay looked like a moment ago, fading out
    if (tr) {
      if (was === 'empty') g += emptyBay(bx, by, fade(tr.a, 1, 0));
      if (was === 'open') g += openSled(bx, by, b.drive || (t.pulled && t.pulled.bay === i && t.pulled.id), fade(tr.a, 1, 0, 0.55), b.st === 'empty' ? `<animateTransform attributeName="transform" type="translate" from="0 0" to="0 40" dur="0.55s" begin="-${tr.a.toFixed(2)}s" fill="freeze"/>` : '');
    }
    if (b.st === 'empty') { g += emptyBay(bx, by, tr ? fade(tr.a, 0, 1, 0.45) : ''); return; }
    if (b.st === 'open') {
      const mv = tr && was === 'empty' ? `<animateTransform attributeName="transform" type="translate" from="0 40" to="0 0" dur="0.6s" begin="-${tr.a.toFixed(2)}s" fill="freeze"/>` : tr && was === 'locked' ? `<animateTransform attributeName="transform" type="translate" from="0 -6" to="0 0" dur="0.45s" begin="-${tr.a.toFixed(2)}s" fill="freeze"/>` : '';
      g += openSled(bx, by, b.drive, tr ? fade(tr.a, 0, 1, 0.5) : '', mv);
      return;
    }
    if (b.st === 'blank') { g += `<rect x="${bx + 4}" y="${by + 6}" width="306" height="118" rx="4" fill="#0E1A22" opacity=".18"/>`; return; }
    const d = byId('drives', b.drive), led = driveLeds(t, b);
    g += pidLabel(d, bx + 155, by + 104);
    g += ledDot(bx + L[0], by + L[1], led.fault && '#FFB52E', led.faultBlink) + ledDot(bx + L[2], by + L[3], led.act && '#3DDC84', led.actBlink);
  });
  return g + latchSvg(t, 'l') + latchSvg(t, 'r');
}
const S0 = 880 / FB.W, O0 = [10, 36];                                  // overview placement
const ov = (x, y) => [O0[0] + x * S0, O0[1] + y * S0];
const ZP = { x: 10, y: 226, w: 560, h: 214 };                          // close-up panel
function zoomOf(i) {
  const [bx, by] = bayXY(i), s = ZP.w / 640, vh = ZP.h / s;
  const vx = Math.max(0, Math.min(FB.W - 640, bx - 65)), vy = Math.max(0, Math.min(FB.H - vh, by - 30));
  return { s, vx, vy, f: (x, y) => [ZP.x + (x - vx) * s, ZP.y + (y - vy) * s] };
}
/* ---- top view of the selected bay and its LFF drive tray, redrawn after the trainer's photo of a tray pulled out.
   Tray millimetres: x across (as seen from the front), y toward the rear is negative; the tray front is y = 0.
   The ejector lever lies across the front, hinged at its left end; the release button sits at its right end. ---- */
const SP = { x: 588, y: 226, w: 300, h: 524 }, TK = 1.35, TRAY_L = 200, TRAY_OUT = 212;
const SPY = SP.y + 126;                                                   // chassis front face, in the panel
const sledLast = { key: null, pose: null, bay: null }, sledFx = { at: 0, from: null };
function sledPose(t) {
  const i = t.sel.bay, b = t.bays[i];
  if (b.st === 'locked' || b.st === 'open') return { d: 0, lev: b.st === 'open' ? 80 : 0, id: b.drive, drv: 'mounted', where: 'bay' };
  if (t.pulled) return { d: TRAY_OUT, lev: 80, id: t.pulled.id, drv: 'mounted', failed: !!t.pulled.failed, where: 'bench' };
  if (t.benchDrive) return { d: TRAY_OUT, lev: 80, id: t.benchDrive.id, drv: t.benchDrive.mounted ? 'mounted' : 'loose', where: 'bench' };
  if (t.trayEmpty) return { d: TRAY_OUT, lev: 80, id: null, drv: 'none', where: 'bench' };
  return null;
}
// the drive's top cover and its label, in tray millimetres
function driveTopMm(d, failed) {
  let s = `<defs><linearGradient id="hddlid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4E8EB"/><stop offset=".5" stop-color="#C3C9CE"/><stop offset="1" stop-color="#A9B0B6"/></linearGradient></defs>`;
  s += `<rect x="-50.8" y="-171" width="101.6" height="147" rx="3.5" fill="url(#hddlid)" stroke="#6E767D" stroke-width="0.6"/>`;
  s += `<circle cx="-2" cy="-112" r="47" fill="none" stroke="#9AA2AA" stroke-width="0.8"/><circle cx="-2" cy="-112" r="44" fill="none" stroke="#F4F6F8" stroke-width="0.5" opacity=".8"/><circle cx="31" cy="-158" r="6" fill="#B4BBC2" stroke="#8E99A3" stroke-width="0.5"/>`;
  [[-46, -166], [46, -166], [-46, -29], [46, -29]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="1.6" fill="#8E99A3"/>`; });
  // the label, printed for this drive
  s += `<rect x="-36" y="-118" width="76" height="82" rx="1.5" fill="#F7F7F2" stroke="#B9B9AA" stroke-width="0.4"/>`;
  const T = (x, y, sz, txt, w = 400) => `<text x="${x}" y="${y}" style="font:${w} ${sz}px Arial, Helvetica, sans-serif;fill:#1A1A1A">${esc(txt)}</text>`;
  s += T(-32, -104, 10, capTxt(d), 700) + T(-32, -94, 3.6, `${d.bus} ${d.speed} · ${d.rpm} RPM`) + T(-32, -89, 3.3, `${d.form === '3.5' ? '3.5-inch LFF' : '2.5-inch SFF'} hard drive`) + T(-32, -84.4, 3.3, d.sector === '4Kn' ? '4K native sectors (4Kn)' : '512-byte sectors') + T(-32, -77.5, 3.2, 'PID ' + d.pid);
  for (let k = 0; k < 34; k++) s += `<rect x="${f1(-32 + k * 1.95)}" y="-74" width="${f1(0.4 + ((k * 5) % 4) * 0.28)}" height="8" fill="#1A1A1A"/>`;
  if (failed) s += `<g transform="rotate(-8 18 -50)"><rect x="2" y="-56" width="34" height="11" rx="1.5" fill="#C2332B"/><text x="19" y="-48.2" text-anchor="middle" style="font:700 5.6px Arial, Helvetica, sans-serif;fill:#FFFFFF">FAILED</text></g>`;
  return s;
}
// the tray frame: side rails with the four drive screws, rear bar, front bezel with vent, release button and LED pipes
function trayFrameMm(screws) {
  let s = `<rect x="-56" y="-${TRAY_L}" width="6" height="${TRAY_L - 18}" fill="#A9B1B8" stroke="#6E767D" stroke-width="0.5"/><rect x="50" y="-${TRAY_L}" width="6" height="${TRAY_L - 18}" fill="#A9B1B8" stroke="#6E767D" stroke-width="0.5"/>`;
  s += `<rect x="-56" y="-${TRAY_L}" width="112" height="6" fill="#A9B1B8" stroke="#6E767D" stroke-width="0.5"/>`;
  s += `<rect x="-56" y="-18" width="112" height="18" rx="1" fill="#B9C0C6" stroke="#6E767D" stroke-width="0.6"/><path d="M-55 -16.5H55" stroke="#DCE1E5" stroke-width="0.6"/>`;
  for (let c = 0; c < 6; c++) for (let r = 0; r < 3; r++) s += `<circle cx="${f1(17 + c * 5 + (r % 2) * 2.5)}" cy="${f1(-14 + r * 4.6)}" r="1.5" fill="#3A4046"/>`;
  s += `<rect x="6" y="-16" width="6" height="15" rx="1" fill="#9AA2AA" stroke="#6E767D" stroke-width="0.4"/><path d="M9 -13V-4" stroke="#59626A" stroke-width="1.2"/>`;
  s += `<rect x="49" y="-14" width="4" height="3.2" rx="0.8" fill="#5B636A"/><rect x="49" y="-8" width="4" height="3.2" rx="0.8" fill="#5B636A"/>`;
  [[-53, -60], [-53, -140], [53, -60], [53, -140]].forEach(([x, y]) => {
    s += screws ? `<circle cx="${x}" cy="${y}" r="2.6" fill="#D3DAE0" stroke="#5B636A" stroke-width="0.5"/><path d="M${x - 1.6} ${y}h3.2M${x} ${y - 1.6}v3.2" stroke="#3A4046" stroke-width="0.6"/>`
      : `<circle cx="${x}" cy="${y}" r="1.4" fill="#2A2F35"/><circle cx="${x}" cy="${y}" r="4" fill="none" stroke="#FFB52E" stroke-width="0.8" stroke-dasharray="2 1.4"/>`;
  });
  return s;
}
// the ejector lever, closed across the front or swung open about its hinge at the left end
const leverMm = () => `<g><rect x="-55" y="0.2" width="62" height="6" rx="2" fill="#C3CAD0" stroke="#4B5259" stroke-width="0.7"/>${[0, 1, 2, 3, 4, 5, 6].map(k => `<path d="M${-48 + k * 8} 1.4V4" stroke="#8E99A3" stroke-width="0.7"/>`).join('')}<circle cx="-53" cy="2.7" r="1.7" fill="#6E767D"/></g>`;
function sledPanel(t) {
  const i = t.sel.bay, b = t.bays[i], P = sledPose(t), n = String(i + 1).padStart(2, '0');
  // remember the last pose of this panel, so a change animates from it
  const key = P ? `${P.d}|${P.lev}|${P.drv}|${P.id}` : 'none';
  if (sledLast.bay === i && sledLast.key !== key && sledLast.pose && P) sledFx.from = sledLast.pose, sledFx.at = Date.now();
  if (sledLast.bay !== i) sledFx.from = null;
  sledLast.bay = i; sledLast.key = key; sledLast.pose = P;
  const F = sledFx.from, age = (Date.now() - sledFx.at) / 1000, live = F && P && age < 1;
  const cx = SP.x + SP.w / 2;
  let o = `<rect x="${SP.x}" y="${SP.y}" width="${SP.w}" height="${SP.h}" rx="6" fill="#2A3640" stroke="#2E5571"/><defs><clipPath id="spclip"><rect x="${SP.x}" y="${SP.y}" width="${SP.w}" height="${SP.h}" rx="6"/></clipPath><clipPath id="spfront"><rect x="${SP.x}" y="${SPY - 14}" width="${SP.w}" height="${SP.y + SP.h - SPY + 14}"/></clipPath></defs>`;
  const st = !P ? (b.st === 'blank' ? 'Blanking tray in the bay' : 'Bay empty, no tray out') : P.where === 'bay' ? (P.lev ? 'Tray in, ejector lever open' : 'Tray in, lever closed and locked') : P.drv === 'none' ? 'Empty tray on the bench' : P.drv === 'loose' ? 'New drive on the tray: fit the 4 screws' : P.failed ? 'Failed drive, pulled out on its tray' : `Drive in its tray, ready for HDD ${n}`;
  o += `<text x="${SP.x + 12}" y="${SP.y + 20}" class="st">Top view, HDD ${n}</text><text x="${SP.x + 12}" y="${SP.y + 38}" class="ss" style="fill:${P && P.where === 'bay' && !P.lev ? '#45D07F' : '#FFD27A'}">${esc(st)}</text>`;
  o += `<g clip-path="url(#spclip)">`;
  if (P) {
    const d0 = live ? F.d : P.d, l0 = live ? F.lev : P.lev, ty = SPY + P.d * TK;
    const slide = live && F.d !== P.d ? `<animateTransform attributeName="transform" type="translate" from="${cx} ${SPY + F.d * TK}" to="${cx} ${ty}" dur="0.9s" begin="-${age.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1" keyTimes="0;1"/>` : '';
    const swing = live && F.lev !== P.lev ? `<animateTransform attributeName="transform" type="rotate" from="${F.lev} -53 2.7" to="${P.lev} -53 2.7" dur="0.5s" begin="-${age.toFixed(2)}s" fill="freeze"/>` : '';
    const mount = live && F.drv === 'loose' && P.drv === 'mounted' ? `<animateTransform attributeName="transform" type="translate" from="7 -12" to="0 0" dur="0.5s" begin="-${age.toFixed(2)}s" fill="freeze"/>` : '';
    let tray = `<rect x="-58" y="-${TRAY_L + 2}" width="116" height="${TRAY_L + 2}" fill="#000" opacity=".18" transform="translate(3 4)"/>` + trayFrameMm(P.drv === 'mounted');
    const d = P.id && byId('drives', P.id);
    const arrive = live && F.drv === 'none' && P.drv === 'loose' ? `<animateTransform attributeName="transform" type="translate" from="7 -70" to="7 -12" dur="0.55s" begin="-${age.toFixed(2)}s" fill="freeze"/>` : '';
    if (d) tray += P.drv === 'loose' ? `<g transform="translate(7 -12) rotate(-2)">${arrive}<rect x="-49" y="-168" width="101.6" height="147" rx="3.5" fill="#000" opacity=".22" transform="translate(3 4)"/>${driveTopMm(d, false)}</g>` : `<g transform="translate(0 0)">${mount}${driveTopMm(d, P.failed)}</g>`;
    if (live && F.id && !P.id) tray += `<g opacity="0"><animate attributeName="opacity" from="1" to="0" dur="0.7s" begin="-${age.toFixed(2)}s" fill="freeze"/><animateTransform attributeName="transform" type="translate" from="0 0" to="14 -40" dur="0.7s" begin="-${age.toFixed(2)}s" fill="freeze"/>${driveTopMm(byId('drives', F.id), F.failed)}</g>`;
    tray += `<g transform="rotate(${P.lev} -53 2.7)">${swing}${leverMm()}</g>`;
    o += `<g clip-path="url(#spfront)"><g transform="translate(${cx} ${ty})">${slide}<g transform="scale(${TK})">${tray}</g></g></g>`;
  }
  // the chassis above the front face: top cover with vents (hides whatever is inside the bay), then the row of bay fronts
  o += `<rect x="${SP.x}" y="${SP.y + 48}" width="${SP.w}" height="${SPY - 14 - SP.y - 48}" fill="#B9C0C6"/>`;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 15; c++) o += `<rect x="${SP.x + 14 + c * 18.5 + (r % 2) * 8}" y="${SP.y + 62 + r * 13}" width="11" height="8" rx="1.5" fill="#59626A"/>`;
  o += `<rect x="${SP.x}" y="${SPY - 14}" width="${cx - 76 - SP.x}" height="14" fill="#8E99A3"/><rect x="${cx + 76}" y="${SPY - 14}" width="${SP.x + SP.w - cx - 76}" height="14" fill="#8E99A3"/>`;
  [cx - 76 - 130, cx + 76 + 4].forEach(x => { o += `<rect x="${x}" y="${SPY - 13}" width="126" height="12" fill="#B4BBC2" stroke="#6E767D"/>`; });
  if (!P || P.where === 'bench') o += b.st === 'blank' ? `<rect x="${cx - 76}" y="${SPY - 13}" width="152" height="12" fill="#A9B1B8" stroke="#6E767D"/>${Array.from({ length: 12 }, (_, k) => `<rect x="${cx - 70 + k * 12}" y="${SPY - 10}" width="6" height="6" fill="#59626A"/>`).join('')}` : `<rect x="${cx - 76}" y="${SPY - 13}" width="152" height="12" fill="#0B0F13"/>`;
  o += `<text x="${SP.x + SP.w - 8}" y="${SP.y + 60}" text-anchor="end" class="ss" style="fill:#2A2F35;font-weight:600">top cover</text><text x="${SP.x + 8}" y="${SPY - 20}" class="ss" style="fill:#2A2F35;font-weight:600">front of the server &#9660;</text>`;
  o += `</g>`;
  if (P && P.where === 'bay') {
    const hy = SPY + 150, lines = P.lev ? ['Lever open: the tray is free.', 'Pull it out by the lever, or close', 'the lever to lock it to the backplane.'] : ['The tray is inside the bay, its lever', 'closed and locked. Press the release', 'button (close-up) to swing the lever open.'];
    lines.forEach((l, k) => { o += `<text x="${cx}" y="${hy + k * 17}" text-anchor="middle" class="ss">${esc(l)}</text>`; });
  }
  // click zones on the tray
  if (P && P.where === 'bay' && P.lev) {
    const [lx, ly] = [cx - 53 * TK, SPY + 2.7 * TK];
    o += `<g${hot('bayPull', i, `Pull the tray out of HDD ${n} by its open lever`)}><rect x="${lx - 20}" y="${ly + 10}" width="56" height="86" rx="8" class="zone"/></g>` + chip(lx + 74, ly + 60, 'Pull by the lever', 'start');
  }
  if (P && P.where === 'bench') {
    const top = SPY + (TRAY_OUT - TRAY_L) * TK, h = TRAY_L * TK, act = P.drv === 'loose' ? 'drvMount' : t.pulled && t.pulled.failed ? 'drvUnmount' : P.drv === 'mounted' && b.st === 'empty' ? 'bayInsert' : null;
    const lbl = { drvMount: 'Fit the drive in the tray with its four screws', drvUnmount: 'Remove the four screws and lift the drive out of the tray', bayInsert: `Slide the tray into HDD ${n} with the lever open` }[act];
    if (act) o += `<g${hot(act, act === 'bayInsert' ? i : '', lbl)}><rect x="${cx - 80}" y="${top - 4}" width="160" height="${h + 8}" rx="8" class="zone"/></g>`;
    if (act === 'bayInsert') o += `<g pointer-events="none"><path d="M${cx} ${top - 2}v-26m-10 10l10 -10l10 10" fill="none" stroke="#FFB52E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  return o;
}
Sim.registerView({
  id: 'storage', title: 'Front drive bays',
  keep: [
    ["Confirm the bay first", "Before you pull a drive, check that the amber fault LED, the bay number on the service label and Cisco IMC or the RAID utility all point to the same bay."],
    ["Never pull a healthy drive", "In a degraded RAID volume, pulling a second drive by mistake can fail the whole volume. Change one failed drive at a time."],
    ["Release, then pull", "Press the release button so the ejector lever swings open, then pull the tray straight out by the lever. Support it from below: a 3.5-inch drive is heavy."],
    ["Drive into the tray", "Four screws hold the drive in its tray, connector end toward the backplane. Do not overtighten them."],
    ["Seat it, then lock it", "Push the tray in with the lever open until it touches the backplane, then close the lever. Close the lever only once the tray is fully in."],
    ["The right replacement", "Use a Cisco drive of the same type and interface, with at least the capacity of the failed one. A RAID volume cannot mix hard drives and SSDs, or 4Kn and 512-byte-sector drives."],
    ["Let the rebuild finish", "The RAID controller rebuilds onto the new drive while its fault LED blinks amber. The volume stays degraded until the rebuild is done; do not disturb it."],
    ["Blanks stay in", "Keep a blanking tray in every empty bay. An open bay lets air bypass the drives and the rest of the server."],
    ["Training deck", "Slide 53: drive, carrier, backplane and controller path. Slide 65: SAS drives. Slides 94 to 99: RAID and RAID controllers."]],
  render(t) {
    const i = t.sel.bay, b = t.bays[i], fb = frontBays(t);
    let g = `<g transform="translate(${O0[0]} ${O0[1]}) scale(${S0.toFixed(5)})">${fb}</g>`;
    t.bays.forEach((bb, k) => {
      const [bx, by] = bayXY(k), [x, y] = ov(bx, by), w = 506 * S0, h = 125 * S0;
      g += `<g${hot('bay', k, `HDD ${String(k + 1).padStart(2, '0')}, ${bb.st === 'locked' ? byId('drives', bb.drive).pid : bb.st}`)}><rect x="${x + 1}" y="${y + 1}" width="${w}" height="${h}" rx="3" class="zone"/></g>`;
      g += `<text x="${x + 5}" y="${y + 13}" class="ss" style="font-size:10px;fill:#EAF2F7;paint-order:stroke;stroke:#0E1A22;stroke-width:3px">${String(k + 1).padStart(2, '0')}</text>`;
      if (k === i) g += `<rect x="${x - 1}" y="${y - 1}" width="${w + 4}" height="${h + 4}" rx="4" class="selring"/>`;
    });
    const [tx, ty] = ov(2312, 120), [kx, ky] = ov(2430, 170);
    g += `<g${hot('frontInfo', 'tag', 'Pull-out asset tag')}><rect x="${tx - 8}" y="${ty - 24}" width="18" height="70" rx="3" class="zone"/></g><g${hot('frontInfo', 'kvm', 'KVM cable connector')}><rect x="${kx - 12}" y="${ky - 30}" width="24" height="62" rx="3" class="zone"/></g>`;
    // close-up of the selected bay
    const z = zoomOf(i), [bx, by] = bayXY(i);
    g += `<rect x="${ZP.x}" y="${ZP.y}" width="${ZP.w}" height="${ZP.h}" rx="6" fill="#0E1A22" stroke="#FFB52E" stroke-width="2"/><defs><clipPath id="zpclip"><rect x="${ZP.x}" y="${ZP.y}" width="${ZP.w}" height="${ZP.h}" rx="6"/></clipPath></defs>`;
    g += `<g clip-path="url(#zpclip)"><g transform="translate(${ZP.x} ${ZP.y}) scale(${z.s.toFixed(5)}) translate(${-z.vx} ${-z.vy})">${fb}</g></g>`;
    const R = (act, label, x0, y0, x1, y1) => { const [a, c] = z.f(x0, y0), [e, f] = z.f(x1, y1); return `<g${hot(act, i, label)}><rect x="${a.toFixed(1)}" y="${c.toFixed(1)}" width="${(e - a).toFixed(1)}" height="${(f - c).toFixed(1)}" rx="5" class="zone"/></g>`; };
    const L = DLED[i];
    if (b.st === 'locked') {
      g += R('bayOpen', `Release button of HDD ${i + 1}: press it to open the ejector lever`, bx + 304, by + 8, bx + 352, by + 128);
      const [rx, ry] = z.f(bx + 328, by + 8), [lx, ly] = z.f(bx + L[0], by + L[1]), [ax, ay] = z.f(bx + L[2], by + L[3]);
      const rt = lx + 140 < ZP.x + ZP.w, sx = rt ? 72 : -72;
      g += chip(rx, ry - 6, 'Release button') + chip(lx + sx, ly + 4, 'Fault LED') + chip(ax + sx * 1.1, ay + 6, 'Activity LED');
    } else if (b.st === 'open') {
      g += R('bayLock', `Ejector lever of HDD ${i + 1}: swing it closed`, bx + 30, by + 16, bx + 300, by + 160);
      const [px, py] = z.f(bx + 380, by + 150);
      g += `<g${hot('bayPull', i, `Pull the tray out of HDD ${i + 1}`)}><rect x="${px - 58}" y="${py - 14}" width="116" height="26" rx="13" fill="#0E1A22" stroke="#FFB52E" stroke-width="2"/><text x="${px}" y="${py + 4}" text-anchor="middle" class="st" style="font-size:12px">Pull tray out</text></g>`;
      const [qx, qy] = z.f(bx + 165, by + 14); g += chip(qx, qy, 'Ejector lever open');
    } else if (b.st === 'empty') {
      const act = (t.benchDrive && t.benchDrive.mounted) || (t.pulled && !t.pulled.failed) ? 'bayInsert' : 'bayBlankIn';
      g += R(act, act === 'bayInsert' ? `Empty HDD ${i + 1}: insert the tray with its lever open` : `Empty HDD ${i + 1}: refit a blanking tray`, bx + 4, by + 6, bx + 506, by + 124);
      const [qx, qy] = z.f(bx + 255, by + 66); g += chip(qx, qy, act === 'bayInsert' ? 'Empty bay: click to insert the tray' : 'Empty bay');
    } else if (b.st === 'blank') {
      g += R('bayBlank', `Blanking tray in HDD ${i + 1}: press release and pull it out`, bx + 4, by + 6, bx + 352, by + 124);
      const [qx, qy] = z.f(bx + 160, by + 66); g += chip(qx, qy, 'Blanking tray');
    }
    g += `<text x="${ZP.x + 10}" y="${ZP.y + 20}" class="st" style="paint-order:stroke;stroke:#0E1A22;stroke-width:4px">HDD ${String(i + 1).padStart(2, '0')}, close-up</text>`;
    // status of the selected bay and the LED legend from the service label
    const d = b.drive && byId('drives', b.drive), led = b.st === 'locked' && d ? driveLeds(t, b) : null;
    const st = { blank: 'Blanking tray fitted', empty: 'Empty: no tray', open: 'Tray in, ejector lever open: not locked to the backplane', locked: d ? `${d.pid}, ${d.name}` : '' }[b.st];
    g += `<text x="${ZP.x}" y="466" class="st">HDD ${String(i + 1).padStart(2, '0')}: ${esc(st)}</text>`;
    if (led) g += `<text x="${ZP.x}" y="486" class="ss">Fault LED: ${led.fault ? (led.faultBlink ? 'amber, blinking: rebuilding' : 'amber: drive has failed') : 'off: operating normally'}. Activity LED: ${led.act ? (led.actBlink ? 'green, blinking: reading or writing' : 'green: ready') : 'off'}${t.power !== 'on' ? ' (server not in main power)' : ''}.</text>`;
    const lg = [['Fault LED (top, triangle)', 'Off: operating normally. Amber: drive has failed. Amber, blinking: rebuilding.'], ['Activity LED (bottom, drive)', 'Off: no drive in sled. Green: ready. Green, blinking: reading or writing.']];
    lg.forEach(([h, s], k) => { g += `<text x="${ZP.x}" y="${520 + k * 40}" class="st" style="font-size:13px">${h}</text><text x="${ZP.x}" y="${538 + k * 40}" class="ss">${s}</text>`; });
    g += `<text x="${ZP.x}" y="620" class="ss">Remove: press the release button, open the ejector lever, pull the tray out.</text><text x="${ZP.x}" y="638" class="ss">Install: drive in the tray (four screws), lever open, push in until it touches the backplane,</text><text x="${ZP.x}" y="656" class="ss">then close the lever to lock it. SAS and SATA drives are hot-swappable.</text>`;
    g += `<text x="${ZP.x}" y="690" class="ss">Click a bay in the photo above to select it. Bays are numbered as on the service label:</text><text x="${ZP.x}" y="708" class="ss">HDD 01 to 04 top row, 05 to 08 middle row, 09 to 12 bottom row.</text>`;
    g += sledPanel(t);
    return frame('Front panel, 12 large form factor drive bays', g, 760);
  },
  actions(t) {
    const i = t.sel.bay, b = t.bays[i], a = [], n = String(i + 1).padStart(2, '0');
    if (t.pulled && t.pulled.failed) a.push(button('Remove the 4 tray screws and lift the failed drive out', 'drvUnmount', '', true));
    if (t.benchDrive && !t.benchDrive.mounted) a.push(button('Fit drive in tray (4 screws)', 'drvMount', '', true));
    if (b.st === 'blank') a.push(button(`Remove blanking tray from HDD ${n}`, 'bayBlank', i));
    if (b.st === 'empty' && ((t.benchDrive && t.benchDrive.mounted) || (t.pulled && !t.pulled.failed))) a.push(button(`Insert tray into HDD ${n}, lever open`, 'bayInsert', i, true));
    if (b.st === 'empty') a.push(button(`Refit blanking tray in HDD ${n}`, 'bayBlankIn', i));
    if (b.st === 'open') { a.push(button(`Close ejector lever on HDD ${n}`, 'bayLock', i, true)); a.push(button(`Pull tray out of HDD ${n}`, 'bayPull', i)); }
    if (b.st === 'locked') a.push(button(`Press release button on HDD ${n}`, 'bayOpen', i));
    return a;
  },
  tray(t) {
    return `<h2>Drive tray</h2><ul class="rules"><li>12 bays, 3.5-inch (LFF) SAS or SATA drives in LFF sleds, hot-swappable</li><li>Add drives to the lowest-numbered bays first</li><li>Keep a blanking tray in every unused bay for airflow</li><li>A RAID volume is all one drive type. Do not mix 4K-native and 512-byte-sector drives in one volume; 4Kn drives boot only in UEFI mode</li><li>RAID: Cisco 12G SAS Modular RAID controller, levels 0, 1, 5, 6, 10, 50, 60. LFF 12 drives use the expander and cable UCS-240CBLMR12</li><li>Do not mix RAID controller types in one server</li></ul>` +
      CATALOG.drives.map(d => `<div class="item${t.benchDrive && t.benchDrive.id === d.id ? ' sel' : ''}"><span>${esc(d.pid)} / ${capTxt(d)}<small>${esc(d.name)}</small></span>${button('Pick up', 'drvPick', d.id)}</div>`).join('');
  }
});
Sim.on('frontInfo', w => say('info', { tag: 'Pull-out asset tag (service label item 4): slide it out to read the serial number and product ID.', kvm: 'KVM cable connector (service label item 5): a KVM breakout cable gives VGA, two USB and serial at the front. The rear VGA and USB ports work the same way.', ops: 'Operations panel: power button, unit identification button and five status LEDs. See Readiness and power.' }[w]));
Sim.on('bay', i => {
  i = +i; T.sel.bay = i; const b = T.bays[i];
  if (b.health === 'fault' && b.st === 'locked') { T.flags.ident = true; say('warn', `HDD ${String(i + 1).padStart(2, '0')}: steady amber fault LED. This is the failed drive.`); }
  else say('info', `HDD ${String(i + 1).padStart(2, '0')} selected.`);
});
Sim.on('bayBlank', i => { T.sel.bay = +i; T.bays[i].st = 'empty'; say('ok', `Release pressed and the blanking tray pulled out of HDD ${String(+i + 1).padStart(2, '0')}.`); });
Sim.on('bayBlankIn', i => { const b = T.bays[i]; if (b.member) return bad('This bay belongs to the RAID volume. It needs a replacement drive, not a blank.'); b.st = 'blank'; Sim.sound('drive'); say('ok', `Blanking tray refitted in HDD ${String(+i + 1).padStart(2, '0')}.`); });
Sim.on('drvPick', id => {
  if (T.pulled) return bad(T.pulled.failed ? 'The failed drive is still in the tray. Remove its four screws and lift it out first.' : 'A drive tray is out on the bench. Put it back in its bay first.');
  T.benchDrive = { id, mounted: false }; T.trayEmpty = false; const d = byId('drives', id); say('info', `${d.pid} (${d.name}) set on the drive tray. Its label is printed on the drive. Fit the four screws next.`);
});
Sim.on('drvUnmount', () => {
  const p = T.pulled; if (!p) return;
  if (!p.failed) return bad('This drive is healthy. Slide its tray back into its bay instead.');
  T.pulled = null; T.trayEmpty = true; T.flags.failedOut = true;
  say('ok', 'Four drive-tray screws removed and the failed drive lifted out of the tray. Set it aside for return. The empty tray takes the replacement.');
});
Sim.on('drvMount', () => { if (!T.benchDrive) return; T.benchDrive.mounted = true; T.trayEmpty = false; say('ok', 'Drive placed in the drive tray and the four drive-tray screws fitted.'); });
Sim.on('bayInsert', i => {
  i = +i; T.sel.bay = i; const b = T.bays[i], bd = T.benchDrive, pl = T.pulled;
  if (!bd && pl && !pl.failed) {
    if (pl.bay !== i) return bad(`That tray came out of HDD ${String(pl.bay + 1).padStart(2, '0')}. Put it back in its own bay.`);
    b.st = 'open'; b.drive = pl.id; T.pulled = null; fx('insert');
    return say('ok', `Tray pushed back into HDD ${String(i + 1).padStart(2, '0')} with the lever open. Close the ejector lever.`);
  }
  if (!bd && pl && pl.failed) return bad('That is the failed drive. Remove it from the tray and fit a replacement.');
  if (!bd) return bad('Pick a drive from the drive tray first.');
  const d = byId('drives', bd.id);
  if (!bd.mounted) return bad('Fit the drive in its tray with the four screws first.');
  if (d.form !== PROFILE.driveForm) return bad(`A ${d.form}-inch drive does not fit this server's 3.5-inch LFF drive sleds. The small form factor drives need the SFF chassis (24-, 16- or 8-drive backplane).`);
  if (b.member) {
    const ref = T.bays.find(o => o.member && o.drive && o !== b), r = ref && byId('drives', ref.drive);
    if (r && d.cap < r.cap) return bad(`The replacement (${capTxt(d)}) is smaller than the other ${capTxt(r)} members, so the rebuild cannot start.`);
    if (r && d.sector !== r.sector) return bad(`The volume is built from ${r.sector === '4Kn' ? '4K-native' : '512-byte-sector'} drives. Do not mix 4K and 512-byte sector drives in one RAID volume.`);
  }
  b.st = 'open'; b.drive = d.id; T.benchDrive = null; T.trayEmpty = false; fx('insert');
  const gap = T.bays.slice(0, i).some(o => o.st !== 'locked' && o.st !== 'open');
  say(gap ? 'warn' : 'ok', `Tray pushed into HDD ${String(i + 1).padStart(2, '0')} with the lever open, until it touched the backplane. Now close the ejector lever.` + (gap ? ' Note: a lower-numbered bay is still unused.' : ''));
});
Sim.on('bayLock', i => {
  const b = T.bays[i]; if (b.st !== 'open') return;
  b.st = 'locked'; Sim.sound('drive');
  if (b.member && b.health === 'missing') { b.health = 'rebuild'; b.pct = 0; say('ok', 'Lever closed: the drive is locked in. The RAID controller sees it and starts the rebuild: the fault LED blinks amber.'); }
  else say('ok', `Ejector lever closed: the drive in HDD ${String(+i + 1).padStart(2, '0')} is locked against the backplane.`);
});
Sim.on('bayOpen', i => { i = +i; T.sel.bay = i; const b = T.bays[i]; if (b.st !== 'locked') return; b.st = 'open'; if (b.health === 'fault') T.flags.leverOpened = true; say('info', `Release button pressed on HDD ${String(i + 1).padStart(2, '0')}: the ejector lever swung open.`); });
Sim.on('bayPull', i => {
  i = +i; const b = T.bays[i]; if (b.st !== 'open') return;
  const id = b.drive, wasFault = b.health === 'fault'; fx('pull');
  if (b.member) {
    if (b.health === 'fault') { T.flags.pulledBad = true; say('ok', `Failed drive pulled out of HDD ${String(i + 1).padStart(2, '0')}. No shutdown needed: SAS and SATA drives are hot-swappable.`); }
    else if (T.bays.some((o, k) => k !== i && o.member && o.health !== 'ok')) { T.arrayFailed = true; say('err', `HDD ${i + 1} held a healthy member and the volume was already degraded. The RAID volume has failed and its data is lost. Restart the scenario.`); }
    else say('err', `HDD ${i + 1} held a healthy RAID member. The volume is now degraded. Put a drive back and let it rebuild.`);
    b.health = 'missing';
  } else say('info', `Drive tray pulled out of HDD ${String(i + 1).padStart(2, '0')}.`);
  T.pulled = id ? { id, bay: i, failed: wasFault } : null; b.drive = null; b.st = 'empty'; T.trayEmpty = false;
});
let tick = 0;
Sim.every(() => {
  let ch = false; tick++;
  T.bays.forEach(b => { if (b.health === 'rebuild' && b.st === 'locked') { b.pct = Math.min(100, b.pct + 5); if (b.pct >= 100) { b.health = 'ok'; say('ok', 'Rebuild complete. The fault LED is off and the volume is healthy again.'); } ch = true; } });
  if (T.fanClock > 0 && tick % 3 === 0) { T.fanClock--; ch = true; if (T.fanClock === 0) { T.flags.fanLate = true; say('err', 'More than one minute with a fan module removed while the server runs. Cooling is no longer adequate: fit the fan now.'); } }
  const ae = document.activeElement;
  if (ch && !(ae && ae.matches && ae.matches('.simui input, .simui select'))) render();
}, 334);

/* ---- Rack: the trainer's straightened front photo at true scale. Its rack ears span photo x 106 to 2398 and y 12 to 430
   (482.6 x 87.3 mm, 4.788 px/mm); two rack units (88.9 mm) are 72 px here, so the ears sit over the post flanges
   and the 450 mm opening between the posts matches the chassis. ---- */
const RACK_USED = { 1: 'UPS', 2: 'UPS', 6: '1U server', 10: 'Management switch', 11: 'Data switch B', 12: 'Data switch A' };
const uy = u => 52 + (12 - u) * 36;
const RF = { x0: 106, x1: 2398, y0: 12, y1: 430, mm: 4.788 };
const RFS = 72 / (88.9 * RF.mm), RFW = (RF.x1 - RF.x0) * RFS, RFH = (RF.y1 - RF.y0) * RFS, RMM = RF.mm * RFS;
const OPEN = { x: 450 - 225 * RMM, w: 450 * RMM };                       // 450 mm between the posts
const POST = { l: 450 - 245 * RMM, r: 450 + 225 * RMM, w: 20 * RMM };   // post flanges, 20 mm wide
// the server front: the photo with the live drive bays and LEDs; (x, y) is the top-left corner of the ears
function rackServer(t, x, y, s, id) {
  return `<defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><rect x="${RF.x0 - 6}" y="${RF.y0}" width="${RF.x1 - RF.x0 + 12}" height="${RF.y1 - RF.y0 + 20}" rx="8"/></clipPath></defs>` +
    `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(5)}) translate(${-RF.x0} ${-RF.y0})"><g clip-path="url(#${id})">${frontBays(t)}</g></g>`;
}
// one latch, magnified, beside the rack: what it looks like now, and where to click
function latchInset(t, k, X, Y) {
  const L = SLAM[k], x0 = k === 'l' ? 92 : 2266, y0 = 196, w = 146, h = 300, s = 0.76, open = latchOpen(t, k), inRack = t.rack.pos === 'in', name = k === 'l' ? 'Left' : 'Right';
  const st = !inRack ? 'closed (springs back)' : open ? 'pulled open' : 'engaged on the post';
  let g = `<defs><clipPath id="latchIn${k}"><rect x="${X}" y="${Y}" width="${f1(w * s)}" height="${f1(h * s)}" rx="6"/></clipPath></defs>`;
  g += `<g clip-path="url(#latchIn${k})"><rect x="${X}" y="${Y}" width="${f1(w * s)}" height="${f1(h * s)}" fill="#0A1218"/><g transform="translate(${X} ${Y}) scale(${s}) translate(${-x0} ${-y0})"><image href="${IMG.frontM4}" width="${FB.W}" height="${FB.H}"/>${latchSvg(t, k)}${latchClick(k, L.cx, 444)}</g></g>`;
  g += `<rect x="${X}" y="${Y}" width="${f1(w * s)}" height="${f1(h * s)}" rx="6" fill="none" stroke="${open ? '#FFB52E' : '#5B7A92'}" stroke-width="2"/>`;
  g += `<text x="${f1(X + w * s / 2)}" y="${Y - 22}" text-anchor="middle" class="st" style="font-size:12.5px">${name} slam latch</text><text x="${f1(X + w * s / 2)}" y="${Y - 7}" text-anchor="middle" class="ss" style="fill:${open ? '#FFB52E' : '#C5CCD3'}">${st}</text>`;
  if (inRack) g += `<g${hot('rackLatch', k, `${name} slam latch: ${open ? 'pulled open, click to let go' : 'engaged, click to pull it open'}`)}><rect x="${f1(X + (L.zx - x0) * s)}" y="${f1(Y + (246 - y0) * s)}" width="${f1(SLAM.zw * s)}" height="${f1((open ? 248 : 186) * s)}" rx="6" class="zone"/></g>`;
  return g;
}
// the latch snapping onto the post: a short burst of lines and "Click"
function latchClick(k, x, y) {
  const a = lfxAge('c' + k); if (a > 0.9) return '';
  const ray = n => { const q = (30 + n * 30) * Math.PI / 180; return `M${f1(x + 14 * Math.cos(q))} ${f1(y + 14 * Math.sin(q))}L${f1(x + 40 * Math.cos(q))} ${f1(y + 40 * Math.sin(q))}`; };
  return `<g opacity="0" pointer-events="none"><animate attributeName="opacity" values="1;1;0" keyTimes="0;0.6;1" dur="0.85s" begin="-${a.toFixed(2)}s" fill="freeze"/><path d="${[0, 1, 2, 3, 4].map(ray).join('')}" stroke="#FFB52E" stroke-width="7" stroke-linecap="round"/></g>`;
}
Sim.registerView({
  id: 'rack', title: 'Rack mounting',
  keep: [
    ["The right rack", "A standard 19-inch four-post rack (EIA-310-D hole spacing), with square or round post holes. These rails fit 610 to 914 mm between the front and rear posts. The server needs 2 RU: 88.9 mm."],
    ["Stabilise first", "Lower the levelling pads and fit the stabilisers before you mount anything or slide anything out. A rack can tip over when a heavy server is extended."],
    ["Heavy at the bottom", "Load a partly filled rack from the bottom up, heaviest equipment lowest, so the centre of gravity stays low."],
    ["Two people", "This server can weigh up to 29 kg fully loaded. Lift it with two people or a mechanical lift, and keep your back straight."],
    ["Rails level and matched", "Fit both slide rails at the same rack units, level from front to rear, with their securing plates closed. A rail one hole off makes the server bind."],
    ["Inner rails on the bench", "Fit the inner rails to the server before you lift it: each one slides over the three pegs on the side of the chassis and locks with its front clip."],
    ["Slam latches", "The lower part of each rack ear is a spring-loaded latch: the Cisco badge on the left, the Intel and UCS badges on the right. Pushed in, both latches click onto the rack posts. To slide the server out, pull both latches open toward you first, then slide it out slowly. Let go and they spring back."],
    ["One at a time", "Extend only one device from a rack at a time, and only with the stabilisers fitted."],
    ["Service clearance", "Leave room at the front and rear for airflow and for sliding the server fully out on its rails."],
    ["Training deck", "Slides 21 to 27: rack units, the four constraints, heavy equipment low, the six-step sequence and the field checklist."]],
  render(t) {
    const r = t.rack, SX = POST.r + POST.w + 18;
    let g = `<rect x="${f1(POST.l)}" y="46" width="${f1(POST.w)}" height="444" class="metal2"/><rect x="${f1(POST.r)}" y="46" width="${f1(POST.w)}" height="444" class="metal2"/>`;
    for (let k = 0; k < 37; k++) [POST.l, POST.r].forEach(px => { g += `<rect x="${f1(px + POST.w / 2 - 3)}" y="${50 + k * 12}" width="6" height="5" rx="1" fill="#59626A"/>`; });
    g += `<g${hot('rackStab', '', 'Rack stabilisers')}><rect x="${f1(POST.l - 34)}" y="486" width="${f1(POST.r + POST.w - POST.l + 68)}" height="44" fill="#000" fill-opacity="0"/><rect x="${f1(POST.l - 34)}" y="490" width="${f1(POST.r + POST.w - POST.l + 68)}" height="14" rx="3" fill="${r.stab ? '#45D07F' : '#FFB52E'}"/><text x="450" y="524" text-anchor="middle" class="st">${r.stab ? 'Levelling pads down and stabilisers fitted' : 'Not stabilised: click to lower the levelling pads and fit the stabilisers'}</text></g>`;
    for (let u = 12; u >= 1; u--) {
      const y = uy(u), used = RACK_USED[u], mine = r.u && (u === r.u || u === r.u + 1);
      if (used) g += `<rect x="${f1(OPEN.x)}" y="${y + 2}" width="${f1(OPEN.w)}" height="32" fill="#3A4A57"/><text x="450" y="${y + 23}" text-anchor="middle" class="st">${used}</text>`;
      else if (!mine || r.pos === 'bench') g += `<g${hot('rackU', u, `Rack unit ${u}, free`)}><rect x="${f1(OPEN.x)}" y="${y + 2}" width="${f1(OPEN.w)}" height="32" fill="${mine ? '#1F5B3A' : '#1B3447'}" stroke="#2E5571"/><text x="450" y="${y + 23}" text-anchor="middle" class="ss">${mine ? 'marked for the server' : 'free'}</text></g>`;
      g += `<text x="${f1(POST.l - 8)}" y="${y + 23}" text-anchor="end" class="ss" style="fill:#EAF2F7">U${u}</text>`;
    }
    if (r.u) {
      const y = uy(r.u + 1);
      if (r.left) g += `<rect x="${f1(OPEN.x)}" y="${y + 8}" width="12" height="56" class="touch"/>`;
      if (r.right) g += `<rect x="${f1(OPEN.x + OPEN.w - 12)}" y="${y + 8}" width="12" height="56" class="touch"/>`;
      if (r.pos !== 'bench') {
        const out = r.pos === 'service', sc = out ? 1.045 : 1, w = RFW * sc, h = RFH * sc, x = 450 - w / 2, yy = y + 36 - h / 2 + (out ? 6 : 0);
        if (out) g += `<rect x="${f1(OPEN.x)}" y="${y}" width="${f1(OPEN.w)}" height="72" fill="#0A1218"/><rect x="${f1(x + 6)}" y="${f1(yy + 8)}" width="${f1(w)}" height="${f1(h)}" rx="6" fill="#000" opacity=".45"/>`;
        g += `<g class="drop">${rackServer(t, x, yy, RFS * sc, 'rackfront')}`;
        if (out) g += `<rect x="${f1(x - 1.5)}" y="${f1(yy - 1.5)}" width="${f1(w + 3)}" height="${f1(h + 3)}" rx="4" fill="none" stroke="#F0A93B" stroke-width="2.5"/>`;
        g += `</g>`;
        // click zones on each latch of the server itself (the lower part of each rack ear)
        if (!out) ['l', 'r'].forEach(k => { const L = SLAM[k], s0 = RFS * sc, zx = x + (L.zx - RF.x0) * s0, zy = yy + (246 - RF.y0) * s0; g += `<g${hot('rackLatch', k, `${k === 'l' ? 'Left' : 'Right'} slam latch on the server`)}><rect x="${f1(zx)}" y="${f1(zy)}" width="${f1(SLAM.zw * s0)}" height="${f1((latchOpen(t, k) ? 248 : 186) * s0)}" rx="3" class="zone"/></g>`; });
        g += `<text x="${f1(SX)}" y="${y + 30}" class="st">${out ? 'Extended on its rails' : 'Racked'}</text>`;
      }
    }
    if (r.u && r.pos !== 'bench') g = latchInset(t, 'l', 64, 84) + latchInset(t, 'r', 726, 84) + g;
    if (r.pos === 'bench') {
      const bw = 172, bs = bw / (RF.x1 - RF.x0), bh = (RF.y1 - RF.y0) * bs, bx = 16, by = 452 - bh;
      g += `<rect x="${bx - 8}" y="452" width="${bw + 16}" height="8" rx="2" fill="#8E99A3"/>` + rackServer(t, bx, by, bs, 'benchfront');
      g += `<text x="${bx + bw / 2}" y="${f1(by - 12)}" text-anchor="middle" class="ss">Server on the bench</text>`;
      if (r.inner) g += `<rect x="${bx - 6}" y="${f1(by + 5)}" width="5" height="${f1(bh - 10)}" class="touch"/><rect x="${bx + bw + 1}" y="${f1(by + 5)}" width="5" height="${f1(bh - 10)}" class="touch"/><text x="${bx + bw / 2}" y="476" text-anchor="middle" class="ss">inner rails locked on the pegs</text>`;
      g += `<text x="${f1(SX)}" y="90" class="st">${r.u ? `Marked: U${r.u} and U${r.u + 1}` : 'Mark the bottom U'}</text>` +
        (r.u ? '' : `<text x="${f1(SX)}" y="108" class="ss">Click a free rack unit.</text>`) +
        `<text x="${f1(SX)}" y="${r.u ? 108 : 126}" class="ss">2 RU = 88.9 mm of vertical space.</text><text x="${f1(SX)}" y="${r.u ? 124 : 142}" class="ss">Load from the bottom up,</text><text x="${f1(SX)}" y="${r.u ? 140 : 158}" class="ss">heaviest equipment lowest.</text>`;
    }
    return frame('Four-post rack, front view', g);
  },
  actions(t) {
    const r = t.rack, a = [];
    if (r.pos === 'bench') {
      if (!r.stab) a.push(button('Stabilise the rack', 'rackStab'));
      if (!r.left) a.push(button('Fit left slide rail', 'rackRail', 'left'));
      if (!r.right) a.push(button('Fit right slide rail', 'rackRail', 'right'));
      if (!r.inner) a.push(button('Attach inner rails to server', 'rackInner'));
      a.push(button('Two-person lift: insert server into rails', 'rackLift'));
    } else if (r.pos === 'in') {
      ['l', 'r'].forEach(k => a.push(button(latchOpen(t, k) ? `Let go of the ${k === 'l' ? 'left' : 'right'} latch` : `Pull the ${k === 'l' ? 'left' : 'right'} slam latch open`, 'rackLatch', k)));
      a.push(button('Slide server out', 'rackOut', '', latchOpen(t, 'l') && latchOpen(t, 'r')));
    } else a.push(button('Push server back until the slam latches click', 'rackIn'));
    return a;
  },
  tray() { return `<h2>Rack notes</h2><ul class="rules"><li>Slide 26 sequence: stabilise, mark U, fit rails, lift, secure, verify</li><li>Fully loaded, this server can weigh up to 64 lb (${PROFILE.weightKg} kg): two people or a mechanical lift</li><li>Rails ${PROFILE.rail} need no tools and adjust from 610 to 914 mm</li><li>Both rails at the same height and level front to rear</li><li>Extend only one device at a time (slide 25)</li></ul>`; }
});
Sim.on('rackStab', () => { T.rack.stab = true; say('ok', 'Levelling pads lowered and the rack stabilisers installed before anything is mounted.'); });
Sim.on('rackU', u => {
  u = +u; if (T.rack.pos !== 'bench') return;
  if (T.rack.left || T.rack.right) return bad('Rails are already fitted. Restart the scenario to choose another position.');
  if (u + 1 > 12 || RACK_USED[u] || RACK_USED[u + 1]) return bad(`The server needs two rack units. U${u} and U${u + 1} are not both free.`);
  T.rack.u = u; const low = [3, 4, 7, 8, 9].filter(x => !RACK_USED[x] && !RACK_USED[x + 1])[0];
  say(u === low ? 'ok' : 'warn', u === low ? `U${u} and U${u + 1} marked: the lowest free position.` : `U${u} and U${u + 1} marked. It fits, but load a partly filled rack from the bottom up.`);
});
Sim.on('rackInner', () => { T.rack.inner = true; say('ok', 'Inner rails set over the three pegs on each side of the server and slid forward until the front clip locked.'); });
Sim.on('rackRail', side => {
  if (!T.rack.stab) return bad('Stabilise the rack first: lower the levelling pads and fit the stabilisers.');
  if (!T.rack.u) return bad('Mark the rack position first: click a free rack unit.');
  T.rack[side] = true; say('ok', `${side === 'left' ? 'Left' : 'Right'} slide rail: front pegs into the post holes, securing plate closed (PUSH), rear pegs in from inside the post, level at U${T.rack.u}.`);
});
Sim.on('rackLift', () => {
  const r = T.rack; if (!r.u) return bad('Mark the rack position first.');
  if (!r.left || !r.right) return bad('Fit both slide rails in the rack first.');
  if (!r.inner) return bad('Attach the inner rails to the sides of the server first.');
  if (T.cover !== 'closed') return bad('Refit the top cover before lifting the server.');
  if (riserOut(T)) return bad('PCIe riser 2 is still out of the chassis.');
  r.pos = 'in'; latchesEngage(); say('ok', 'Two people aligned the inner rails with the slide rails, pushed to the stops, slid the release clips back and pushed on until both front slam latches snapped onto the posts: click, click.');
});
Sim.on('rackLatch', k => {
  const r = T.rack; if (k !== 'l' && k !== 'r') return;
  const side = k === 'l' ? 'left' : 'right', other = k === 'l' ? 'r' : 'l';
  if (r.pos !== 'in') return say('info', r.pos === 'service' ? 'The server is out on its rails: the latches sprang back closed when you let go. They engage again when you push the server back in.' : 'The latches hold the server in the rack once it is mounted.');
  r.latch = r.latch || { l: false, r: false };
  if (r.latch[k]) { r.latch[k] = false; lfxMark('l' + k); return say('info', `You let go of the ${side} latch: its spring pulled it back closed.`); }
  r.latch[k] = true; lfxMark('l' + k);
  say('ok', r.latch[other] ? 'Both slam latches are pulled open: their hooks are clear of the rack posts. Now slide the server out slowly.' : `${side[0].toUpperCase() + side.slice(1)} slam latch pulled open toward you: its hook is clear of the post. Now pull the ${other === 'l' ? 'left' : 'right'} one open too.`);
});
Sim.on('rackOut', () => {
  const r = T.rack, any = Object.values(T.cables).some(Boolean);
  if (r.pos === 'in' && !(latchOpen(T, 'l') && latchOpen(T, 'r'))) return bad(`The slam latches still hold the server on the rack posts. Pull ${latchOpen(T, 'l') || latchOpen(T, 'r') ? 'the other latch' : 'both latches'} open first: the lower part of each rack ear swings out toward you.`);
  r.pos = 'service'; r.latch = { l: false, r: false }; lfxMark('ll'); lfxMark('lr');
  const loose = Object.keys(T.cables).filter(k => T.cables[k] && !(cmaReady(T) && arm(T).laid[k]));
  if (loose.length) {
    const names = loose.map(k => (k.startsWith('vic') ? 'VIC ' : '') + PORTS[k][2]);
    loose.forEach(k => { T.cables[k] = null; if (k.startsWith('psu')) T.psu[+k[3] - 1].strap = false; }); syncRouted(T);
    const hard = T.power === 'on' && !psuAny(T); if (hard) { T.power = 'off'; T.post = null; Sim.soundStop('fans', 0.6); }
    return say('err', `${names.join(', ')}: not in the cable management arm. ${loose.length === 1 ? 'It' : 'They'} pulled tight and unplugged as the server slid out.` + (hard ? ' The server lost power without a clean shutdown.' : ''));
  }
  if (any) r.tested = true;
  const ar = arm(T), loosely = any && (ar.lids.some(Boolean) || !ar.straps.exit || !ar.straps.elbow);
  say(loosely ? 'warn' : 'ok', (any ? 'Server slid out slowly. The arm unfolded, and every connector and cable stayed in place.' : 'Server slid out on its rails.') + ' You let go of the latches as it moved: they sprang back closed.' + (loosely ? ' Close every guide and strap the bundle: a loose cable can drop out of the arm and snag.' : ''));
});
const latchesEngage = () => { T.rack.latch = { l: false, r: false }; lfxMark('cl'); lfxMark('cr'); Sim.sound('latch'); Sim.sound('latch', 0.08); };
Sim.on('rackIn', () => { if (T.cover !== 'closed') return bad('Refit the top cover before pushing the server back into the rack.'); T.rack.pos = 'in'; latchesEngage(); say('ok', 'Server pushed back until both slam latches snapped onto the rack posts: click, click.'); });

/* ---- Cabling: the rear panel laid out like the trainer's server. Data goes through the VIC 1225 in riser 2, slot 5
   (two 10 Gb SFP+ ports); the onboard 1 Gb LAN ports are not used for data in this build. ---- */
const RP = { x0: 170, y0: 196, r2: [340, 520], row: { 6: [204, 230], 5: [236, 272], 4: [278, 304] } };
const vicPortXY = n => { const [a, b] = RP.r2, w = b - a, [y0, y1] = RP.row[5], h = y1 - y0, x = a + w * (n === 1 ? 0.68 : 0.51); return [x + w * 0.075, y0 + h * 0.26 + h * 0.28]; };
const PORTS = { psu1: [700, 300, 'PSU 1', 'power', 'PSU1'], psu2: [700, 234, 'PSU 2', 'power', 'PSU2'], vic1: [...vicPortXY(1), 'PORT 1', 'data', 'VIC-P1'], vic2: [...vicPortXY(2), 'PORT 2', 'data', 'VIC-P2'], mgmt: [343, 320, 'MGMT', 'mgmt', 'MGMT'] };
const DESTS = { pduA: [65, 290, 'PDU A', 'power', 'PDU-A'], pduB: [835, 290, 'PDU B', 'power', 'PDU-B'], dataA: [250, 70, 'Data switch A', 'data', 'SW01-Eth1/23'], mgmt: [450, 70, 'Management switch', 'mgmt', 'MGT01-Gi0/12'], dataB: [650, 70, 'Data switch B', 'data', 'SW02-Eth1/23'] };
const CABLE_COL = { power: '#F0A93B', data: '#62AEEA', mgmt: '#C9A0FF' };
const ROLE = { psu1: 'PWR-A', psu2: 'PWR-B', vic1: 'DATA-A', vic2: 'DATA-B', mgmt: 'OOB' };
function rearSchematic(t) {
  const vs = vicSlot(t), out = riserOut(t);
  let g = `<rect x="${RP.x0}" y="${RP.y0}" width="560" height="146" rx="4" fill="#AEB7BF" stroke="#5B636A" stroke-width="1.5"/>`;
  // riser 1 (PCIe 1 to 3) and riser 2 (PCIe 4 to 6); the VIC sits in PCIe 5
  [[180, 330, 1], [RP.r2[0], RP.r2[1], 4]].forEach(([a, b, first]) => {
    [6, 5, 4].forEach((rowKey, k) => {
      const [y0, y1] = RP.row[rowKey], slot = first + 2 - k;
      if (first === 4 && !out && t.riser.slots[slot]) g += vicRear(a, y0, b - a, y1 - y0, 1, t.power === 'on' && !!t.cables.vic1, t.power === 'on' && !!t.cables.vic2);
      else if (first === 4 && (out || !t.riser.blank[slot])) g += `<rect x="${a}" y="${y0}" width="${b - a}" height="${y1 - y0}" fill="#0B1014" stroke="#FF8A7A" stroke-dasharray="4 3"/>`;
      else g += blankRear(a, y0, b - a, y1 - y0, 0.9);
      g += `<text x="${a - 4}" y="${(y0 + y1) / 2 + 4}" text-anchor="end" style="font:600 9px var(--font);fill:#2A2F35">${slot}</text>`;
    });
  });
  g += `<text x="255" y="192" text-anchor="middle" class="ss">Riser 1: PCIe 1 to 3</text><text x="430" y="192" text-anchor="middle" class="ss">Riser 2: PCIe 4 to 6</text>`;
  if (out) g += `<text x="430" y="256" text-anchor="middle" class="ss" style="fill:#FF8A7A">riser 2 is out</text>`;
  // power supplies: PSU 2 on top, PSU 1 below, each with its power inlet
  [['psu2', 204, 1], ['psu1', 270, 0]].forEach(([id, y, i]) => {
    if (t.psu[i].st === 'out') { g += `<rect x="560" y="${y}" width="160" height="60" rx="3" fill="#0B1014" stroke="#FF8A7A" stroke-dasharray="5 4"/><text x="640" y="${y + 34}" text-anchor="middle" style="font:700 9px var(--font);fill:#FF8A7A">${PORTS[id][2]} bay empty</text>`; return; }
    const L = psuLeds(t, i), dot = (cy, on, col) => `<circle cx="569" cy="${cy}" r="3.6" fill="${on === 'off' ? '#3A4046' : col}"${on === 'blink' ? ' class="blink"' : ''}/>`;
    g += `<rect x="560" y="${y}" width="160" height="60" rx="3" fill="#2A3138" stroke="#14202B"/><circle cx="604" cy="${y + 30}" r="22" fill="#1B1F24" stroke="#5B636A"/><path d="M590 ${y + 16}L618 ${y + 44}M618 ${y + 16}L590 ${y + 44}" stroke="#5B636A" stroke-width="2"/><circle cx="604" cy="${y + 30}" r="9" fill="#D9573B"/><text x="642" y="${y + 18}" style="font:700 9px var(--font);fill:#C9D0D6">${PORTS[id][2]}</text>` + dot(y + 14, L.a, '#FFB52E') + dot(y + 46, L.g, '#45D07F');
  });
  // bottom row: mLOM opening, USB, M (management), serial, onboard LAN 1 and 2 (1 Gb, not used for data), VGA
  g += blankRear(180, 308, 120, 26, 0.9) + `<rect x="306" y="312" width="16" height="18" rx="2" fill="${t.locator ? '#7CC4FF' : '#1F6FB2'}"/>` + (t.locator ? `<rect x="300" y="306" width="28" height="30" rx="6" fill="#4AA8FF" opacity=".45" class="blink"/>` : '');
  g += `<rect x="362" y="311" width="26" height="20" rx="2" fill="#1B1F24" stroke="#5B636A"/><text x="375" y="342" text-anchor="middle" style="font:600 8px var(--font);fill:#2A2F35">IOIO</text>`;
  [['1', 394], ['2', 426]].forEach(([n, x]) => { g += `<g${hot('lanInfo', n, `LAN ${n}: onboard 1 Gb port, not used for data in this build`)}><rect x="${x}" y="311" width="26" height="20" rx="2" fill="#1B1F24" stroke="#5B636A" opacity=".75"/><text x="${x + 13}" y="342" text-anchor="middle" style="font:600 8px var(--font);fill:#2A2F35">LAN ${n}</text></g>`; });
  g += `<path d="M470 312H520L514 330H476Z" fill="#2F5BA8" stroke="#1D3566"/><text x="495" y="342" text-anchor="middle" style="font:600 8px var(--font);fill:#2A2F35">VGA</text><text x="343" y="342" text-anchor="middle" style="font:600 8px var(--font);fill:#2A2F35">M</text>`;
  return g;
}
Sim.on('lanInfo', n => say('info', `LAN ${n} is an onboard 1 Gb Ethernet port (RJ-45). In this build the data network uses the VIC's two 10 Gb SFP+ ports in riser 2, slot 5.`));
Sim.on('port', id => {
  if (T.rack.pos === 'bench') return bad('Rack the server before cabling it.');
  if (id.startsWith('vic') && (!vicSlot(T) || riserOut(T))) return bad('There is no VIC in riser 2, so there are no 10 Gb data ports. Fit the VIC 1225 in slot 5 first.');
  if (T.cables[id]) {
    T.cables[id] = null; T.sel.port = null; syncRouted(T);
    if (id.startsWith('psu')) T.psu[+id[3] - 1].strap = false;
    if (T.power === 'on' && id.startsWith('psu')) {
      if (!psuAny(T)) { T.power = 'off'; T.post = null; Sim.soundStop('fans', 0.6); return say('err', T.cables.psu1 || T.cables.psu2 ? `${PORTS[id][2]} unplugged, and it was the only working supply. The server lost power without a clean shutdown.` : 'Both power cords are out and the server was in main power mode. It lost power without a clean shutdown.'); }
      return say('warn', `${PORTS[id][2]} unplugged. The server keeps running on the other supply, but redundancy is lost.`);
    }
    return say('info', `${CROUTE[id]} cable unplugged at the server${arm(T).laid[id] && cmaReady(T) ? ': its far end stays in ' + portTxtC(cabDest(T, id), cabN(T, id)) + ', the cable stays in the arm' : ''}.`);
  }
  T.sel.port = id; say('info', `${CROUTE[id]} selected. Now click its ${id.startsWith('psu') ? 'PDU outlet' : 'switch port'} from the cable schedule.`);
});
Sim.on('dest', a => {
  const [d, ns] = String(a).split(':'), n = +ns || DPORT(d), id = T.sel.port, here = portTxtC(d, n), busy = DBUSY[d].includes(n), who = cabAt(T, d, n, id);
  if (!id) return say('info', who ? `${here}: ${CROUTE[who]} is plugged in here. To unplug it, click its port on the server.` : busy ? `${here}: in use by another system in the rack.` : `${here}: free. Click a port on the server first, then the port or outlet its cable goes to.`);
  const kind = PORTS[id][3], nm = CROUTE[id];
  if (kind !== DESTS[d][3]) return bad(`${nm} does not belong on ${CG.pdu[d] ? DESTS[d][2] : 'the ' + DESTS[d][2].toLowerCase().replace(' a', ' A').replace(' b', ' B') + ' (' + DNAME[d] + ')'}.` + (kind === 'mgmt' ? ' The dedicated management port goes to the management network.' : kind === 'data' ? ' The VIC ports carry the data network: they go to the data switches.' : '') + ` The cable schedule says ${wantTxt(id)}.`);
  if (busy) return bad(`${here} is in use: another system's ${kind === 'power' ? 'power cord' : 'cable'} is plugged in there. ${nm} goes to ${wantTxt(id)}.`);
  if (who) return bad(`${here} is taken: ${CROUTE[who]} is plugged in there.`);
  if (kind === 'power') { const p = T.psu[+id[3] - 1]; if (p.st !== 'in') { T.sel.port = null; return bad(p.st === 'out' ? `The ${PORTS[id][2]} bay is empty: there is no supply to connect.` : `${PORTS[id][2]} is not locked in. Push it into its bay until the release lever locks, then connect the cord.`); } p.strap = true; T.psuFeed[id] = d; }
  if (!T.cablePort) T.cablePort = {};
  T.cables[id] = d; T.cablePort[id] = n; T.sel.port = null; arm(T).dest[id] = d; syncRouted(T); Sim.sound(kind === 'power' ? 'plug' : 'snap');
  if (!cabRight(T, id)) {
    const why = d !== CDEF[id] ? (kind === 'power' ? `${DNAME[d]} is the other feed: ${nm} belongs on ${DNAME[CDEF[id]]}, so the two supplies stay on different feeds.` : `${DNAME[d]} is the other data switch: ${nm} belongs on ${DNAME[CDEF[id]]}, so each VIC port lands on its own switch.`)
      : kind === 'power' ? `the outlets are planned for each server, so the PDU load stays balanced and the labels match.`
      : `port ${n} is not assigned to this server: it is shut down or in another VLAN, so the link stays down${kind === 'mgmt' ? ' and Cisco IMC is unreachable' : ''}.`;
    return bad(`Plugged into ${here}, but the cable schedule says ${wantTxt(id)}: ${why} Click ${nm} on the server to unplug it, then plug it into ${wantTxt(id)}.`);
  }
  say('ok', `${nm} ${kind === 'data' ? 'SFP-10G-SR optic and LC fibre clicked in' : 'seated fully'} and connected to ${here} (${ifName(d, n)}), as the schedule says.` + (kind === 'power' && T.power !== 'on' ? ' The power LED turns amber: standby power.' : kind === 'mgmt' ? (psuAny(T) ? ' The link LEDs light: the management port is on the management network.' : ' The link comes up as soon as the server has standby power.') : kind === 'data' ? (T.power === 'on' ? ' The link LED lights.' : ' The link comes up when the server is running.') : ''));
});

