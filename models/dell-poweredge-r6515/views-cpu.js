/* ---- Processor replacement, drawn: the inside of the Dell PowerEdge R6515 from above (rear at the top, as the
   service photos and the Installation and Service Manual show it) and a close-up of the processor socket. Every part
   is reconstructed from the trainer's photos and the manual's figures 17 to 53, and moves in place: the cover lock
   turns and the release latch lifts, the cover and the air shroud lift away, the heat sink screws turn in the marked
   order and the heat sink lifts off, the force plate screws open 3, 2, 1 and the plate swings up on its front hinge,
   the blue latches lift and the rail frame rises, the processor tray slides out of the top of the standing frame and
   the new one slides in, the frame comes down, the plate comes down and closes 1, 2, 3, a thin spiral of grease, the
   heat sink comes down and its screws tighten. Standing parts are drawn in an oblique projection: a part hinged at its
   front edge rises up the picture, slightly to the right, as a camera above and a little in front of the server sees it.
   The rear is the trainer's photo of this server, with its cables drawn on it (none in a new installation).
   Dell's order (manual pages 25 to 33 and 54 to 60): power off, cords and cables off at the server, slide the system
   out, cover off (unlock, release latch, lift), air shroud out; let the heat sink cool; its four captive screws in the
   marked order (1 and 2 about three turns, 3 and 4 three turns, then 1 and 2 fully, then 3 and 4 fully), lift it off;
   force plate screws 3, 2, 1; rail frame up by its blue latches; tray out by its tab; the new tray in until seated;
   frame down until the latches lock; force plate screws 1, 2, 3 (12 lbf-in, pressing the plate); clean the heat sink,
   a thin spiral of grease on the processor; heat sink on, screws 1 and 2, 3 and 4 partially, then fully; air shroud
   in, cover on (align, close the latch, lock); back into the rack, cables, cords, power on. The first POST after a
   processor change may show a CMOS checksum message: go into System Setup.
   © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved. ---- */

/* ============ drawing helpers ============ */
const DEFS = `<defs>
<linearGradient id="dsteel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E6EAEE"/><stop offset=".5" stop-color="#C3C9CF"/><stop offset="1" stop-color="#9AA3AB"/></linearGradient>
<linearGradient id="dihs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CDD1D5"/><stop offset=".55" stop-color="#ABB1B7"/><stop offset="1" stop-color="#8E959C"/></linearGradient>
<linearGradient id="dcover" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDD2D7"/><stop offset="1" stop-color="#A9AFB5"/></linearGradient>
<linearGradient id="dshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
<pattern id="dfins" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#C2C8CD"/><rect x="2" width="2.2" height="7" fill="#7D858D"/><rect x="4.2" width="1" height="7" fill="#E8ECEF"/></pattern>
<pattern id="dfins2" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#C2C8CD"/><rect x="1.2" width="1.3" height="4" fill="#7D858D"/></pattern>
<pattern id="dpins" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#3A2E22"/><circle cx="3" cy="3" r="1.3" fill="#D1A84C"/></pattern>
<pattern id="dvent" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" fill="#5B636B"/></pattern>
<pattern id="dmesh" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#7D858D"/><circle cx="2.5" cy="2.5" r="1.3" fill="#2A3138"/></pattern>
</defs>`;
const R = (x, y, w, h, fill, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" ${extra}/>`;
const TXT = (x, y, s, style, anchor = 'middle') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}" pointer-events="none">${esc(s)}</text>`;
const zoneR = (act, arg, label, x, y, w, h, rx = 5) => `<g${hot(act, arg, label)}><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" class="zone"/></g>`;
const zoneC = (act, arg, label, x, y, r) => `<g${hot(act, arg, label)}><circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" class="zone"/></g>`;
const anim = (age, dur) => `dur="${dur}s" begin="-${age.toFixed(2)}s" fill="freeze"`;
// a Torx screw head from above; loose: raised, with a light ring
function star6(x, y, r) { let d = ''; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, rr = i % 2 ? r * 0.5 : r; d += (i ? 'L' : 'M') + f1(x + rr * Math.cos(a)) + ' ' + f1(y + rr * Math.sin(a)); } return d + 'Z'; }
const screwArt = (x, y, r, loose) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${loose ? '#DCE1E5' : '#AEB5BB'}" stroke="#5B636B" stroke-width="1.2"/><path d="${star6(x, y, r * 0.55)}" fill="#4A525A"/>${loose ? `<circle cx="${x}" cy="${y}" r="${r + 3}" fill="none" stroke="#FFFFFF" stroke-opacity=".75"/>` : ''}`;
// the turn: an arc arrow going round the screw while it is turned (anticlockwise to loosen)
function turnArt(x, y, age, ccw, tool) {
  if (age > 0.7) return '';
  const d = tool && TOOLS[tool], hd = d ? `<circle cx="${x}" cy="${y}" r="15" fill="${d.col}" stroke="#0B0F12"/><circle cx="${x}" cy="${y}" r="10" fill="none" stroke="${d.band}" stroke-width="3"/><path d="M${x} ${y - 13}v6" stroke="#E6E9EC" stroke-width="2"/>` : '';
  return `<g pointer-events="none" transform="rotate(0 ${x} ${y})"><animateTransform attributeName="transform" type="rotate" values="0 ${x} ${y};${ccw ? -400 : 400} ${x} ${y}" ${anim(age, 0.6)}/>${hd}<path d="M${x + 22} ${y}A22 22 0 1 1 ${x} ${y - 22}" fill="none" stroke="#FFB52E" stroke-width="3.5" stroke-linecap="round"/><path d="M${x - 6} ${y - 28}l8 6l-8 6z" fill="#FFB52E"/></g>`;
}
// a screw's state under it, in the colour of its state (every screw shows its state the same way)
const stateTxt = (x, y, s, col) => s ? TXT(x, y < 300 ? y - 28 : y + 36, s, `font:600 9.5px var(--font);fill:${col}`) : '';
const SC_COL = ['#C9D0D6', '#FFB52E', '#45D07F'];
// a part lying flat on the board, drawn standing up on its hinge line y = hy, swung th degrees, as a camera above and
// slightly in front sees it: the face rises up the picture (k of its length at 90 degrees) and a little to the right.
// With `from`, it swings from that angle to th over dur seconds (started age seconds ago).
const PK = 0.45, PS = 0.16;
function proj(hy, th, ps = PS, pk = PK) { const r = th * Math.PI / 180, m = Math.cos(r) + pk * Math.sin(r), c = -ps * Math.sin(r); return { e: -c * hy, f: hy * (1 - m), al: Math.atan2(c, m) * 180 / Math.PI, d: m }; }
function standG(hy, th, inner, from, age, dur = 0.7, ps = PS, pk = PK) {
  const steps = from === undefined || age > dur ? [th] : [0, .2, .4, .6, .8, 1].map(u => from + (th - from) * u);
  const P = steps.map(a => proj(hy, a, ps, pk)), last = P[P.length - 1], kt = steps.length > 1 ? ` keyTimes="${steps.map((_, i) => f1(i / (steps.length - 1))).join(';')}"` : '';
  const an = (type, vals) => steps.length > 1 ? `<animateTransform attributeName="transform" type="${type}" values="${vals.join(';')}" ${anim(age, dur)}${kt}/>` : '';
  return `<g transform="translate(${f1(last.e)} ${f1(last.f)})">${an('translate', P.map(p => `${f1(p.e)} ${f1(p.f)}`))}<g transform="skewX(${f1(last.al)})">${an('skewX', P.map(p => f1(p.al)))}<g transform="scale(1 ${f1(last.d)})">${an('scale', P.map(p => `1 ${f1(p.d)}`))}${inner}</g></g></g>`;
}
// the shade on a standing face, darker toward its hinge
const shadeArt = (x, y, w, h, th) => { const o = Math.min(1, th / 90); return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#dshade)" opacity="${f1(o * 0.9)}" pointer-events="none"/><rect x="${x}" y="${y - 8}" width="${w}" height="8" rx="2" fill="#59626A" opacity="${f1(o)}" pointer-events="none"/>`; };
// a part lifting away from the board toward the camera (out), or coming down onto it (in): it grows a little, rises and fades
function lift(inner, cx, cy, age, out, dur = 0.8, dy = -60, sc = 1.16) {
  if (age > dur) return out ? '' : inner;
  const v = (a, b) => out ? `${a};${b}` : `${b};${a}`, b = `${anim(age, dur)} calcMode="spline" keySplines=".4 0 .6 1" keyTimes="0;1"`;
  return `<g pointer-events="none"><animate attributeName="opacity" values="${v(1, 0)}" ${b}/><animateTransform attributeName="transform" type="translate" values="${v('0 0', `0 ${dy}`)}" ${b}/><g transform="translate(${cx} ${cy})"><animateTransform attributeName="transform" type="scale" values="${v('1', sc)}" ${b}/><g transform="translate(${-cx} ${-cy})">${inner}</g></g></g>`;
}
// a memory socket from above: the slot, its key, the release tabs at both ends (white = the first socket of a channel)
function dimmArt(x, y, w, h, white, label) {
  const col = white ? '#E8E6DE' : '#2A2D31', edge = white ? '#B9B6AC' : '#111418', tab = white ? '#F6F4EE' : '#3A3E44', k = w / 30;
  return `<g pointer-events="none"><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(3 * k)}" fill="${col}" stroke="${edge}"/><rect x="${f1(x + 11 * k)}" y="${f1(y + 24 * k)}" width="${f1(8 * k)}" height="${f1(h - 48 * k)}" fill="#15191D"/><rect x="${f1(x + 5 * k)}" y="${f1(y + 4 * k)}" width="${f1(20 * k)}" height="${f1(16 * k)}" rx="2" fill="${tab}" stroke="${edge}"/><rect x="${f1(x + 5 * k)}" y="${f1(y + h - 20 * k)}" width="${f1(20 * k)}" height="${f1(16 * k)}" rx="2" fill="${tab}" stroke="${edge}"/>${label ? TXT(x + w / 2, y + h + 13, label, 'font:600 9px var(--font);fill:#DCE6EC') : ''}</g>`;
}
// ESD wrist strap on a hand (the same drawing as the Cisco pack): band on the wrist, coiled cord, crocodile clip on bare chassis metal (tx, ty)
function esdFig(t, x, y, tx, ty) {
  const on = t.cpu.esd, sk = '#E6B08C', ske = '#9A6A4A', bandC = '#1F6FB2';
  let s = `<g${hot('esd', '', on ? 'ESD wrist strap: on. Click to take it off' : 'ESD wrist strap: put it on and clip it to the chassis')}>`;
  s += `<rect x="${x - 6}" y="${y - 6}" width="346" height="64" rx="10" fill="${on ? '#173F2C' : '#0E1A22'}" stroke="${on ? '#45D07F' : '#8E99A3'}" stroke-width="1.5" opacity=".92"/>`;
  const hx = x, hy = y + 4;
  s += `<g transform="translate(${hx} ${hy})" stroke="${ske}" stroke-width="1.2" fill="${sk}">
    <path d="M0 13C0 11 2 10 4 10H30V40H4C2 40 0 39 0 37Z"/>
    <path d="M28 9C34 6 46 6 54 8C58 9 60 12 60 16V34C60 38 57 41 53 41H34C30 41 28 39 28 36Z"/>
    <path d="M38 10C40 4 44 0 50 -2C54 -3 56 0 54 3C51 7 47 9 46 12Z"/>
    <rect x="56" y="10" width="26" height="7" rx="3.5"/><rect x="57" y="18" width="29" height="7" rx="3.5"/><rect x="57" y="26" width="27" height="7" rx="3.5"/><rect x="55" y="34" width="21" height="6.5" rx="3.2"/>
    <path d="M60 13.5H63M61 21.5H64M61 29.5H64M59 37H62" stroke="${ske}" fill="none" stroke-width=".8"/></g>`;
  let stud;
  if (on) { s += `<rect x="${hx + 18}" y="${hy + 8}" width="11" height="34" rx="3" fill="${bandC}" stroke="#0E2A45"/><path d="M${hx + 20} ${hy + 11}V${hy + 39}M${hx + 23.5} ${hy + 11}V${hy + 39}M${hx + 27} ${hy + 11}V${hy + 39}" stroke="#5BA3E0" stroke-width=".8"/>`; stud = [hx + 23.5, hy + 25]; }
  else { s += `<path d="M${hx + 96} ${hy + 30}C${hx + 100} ${hy + 18} ${hx + 120} ${hy + 18} ${hx + 124} ${hy + 30}" fill="none" stroke="${bandC}" stroke-width="7" stroke-linecap="round"/>`; stud = [hx + 110, hy + 22]; }
  s += `<circle cx="${stud[0]}" cy="${stud[1]}" r="3.6" fill="#C5CCD3" stroke="#5B636B"/>`;
  const end = on ? [tx, ty] : [hx + 150, hy + 38], c1 = on ? [stud[0] + 10, stud[1] + 60] : [stud[0] + 20, stud[1] + 30], pts = [];
  for (let k = 0; k <= 60; k++) {
    const u = k / 60, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
    const px = a * stud[0] + b * c1[0] + c * end[0], py = a * stud[1] + b * c1[1] + c * end[1];
    const dx = 2 * (1 - u) * (c1[0] - stud[0]) + 2 * u * (end[0] - c1[0]), dy = 2 * (1 - u) * (c1[1] - stud[1]) + 2 * u * (end[1] - c1[1]), L = Math.hypot(dx, dy) || 1;
    const w = u > 0.12 && u < 0.88 ? 3.2 * Math.sin(k * 1.6) : 0;
    pts.push(`${(px - dy / L * w).toFixed(1)},${(py + dx / L * w).toFixed(1)}`);
  }
  s += `<polyline points="${pts.join(' ')}" fill="none" stroke="#2A2F35" stroke-width="2"/>`;
  const ang = on ? Math.atan2(end[1] - c1[1], end[0] - c1[0]) * 180 / Math.PI : 0;
  s += `<g transform="translate(${end[0]} ${end[1]}) rotate(${ang.toFixed(1)})"><path d="M-14 -4H-2L4 -2.5L-2 -1H-14Z" fill="#B8C0C7" stroke="#4A5259" stroke-width=".8"/><path d="M-14 4H-2L4 2.5L-2 1H-14Z" fill="#B8C0C7" stroke="#4A5259" stroke-width=".8"/><rect x="-18" y="-4.5" width="6" height="9" rx="2" fill="#C0392B"/></g>`;
  if (on) s += `<circle cx="${end[0]}" cy="${end[1]}" r="9" fill="none" stroke="#45D07F" stroke-width="2"/>`;
  s += `<text x="${x + (on ? 104 : 168)}" y="${y + 22}" class="st">ESD wrist strap</text><text x="${x + (on ? 104 : 168)}" y="${y + 40}" class="ss" style="fill:${on ? '#45D07F' : '#FFB52E'}">${on ? 'On the wrist, clipped to the chassis' : 'Not on. Click to wear it'}</text>`;
  return s + '</g>';
}

/* ============ tools: the ISM's list (page 25) and a torque driver for the force plate ============
   Cover lock: a 1/4 inch flat blade or a Phillips #2 (page 27). Heat sink and force plate screws: Torx T20 (pages 54 to
   60). Force plate screws: 12.0 ± 1.0 lbf-in (page 58), so a torque driver with a T20 bit; the manual gives no value for
   the heat sink screws. One tool in hand at a time; the torque driver's setting is chosen on its chips. */
const TOOLS = {
  ph1: { name: 'Phillips #1', col: '#B23B2E', band: '#E6E9EC', tip: 'ph' },
  ph2: { name: 'Phillips #2', col: '#1B1F24', band: '#2BB3C0', tip: 'ph' },
  t20: { name: 'Torx T20', col: '#1B1F24', band: '#E8C23A', tip: 'torx' },
  hex5: { name: '5 mm hex nut driver', col: '#D9822B', band: '#1B1F24', tip: 'hex' },
  flat: { name: '1/4 inch flat blade', col: '#1B1F24', band: '#45D07F', tip: 'flat' },
  tq: { name: 'Torque driver, T20 bit', col: '#2E5571', band: '#C9D0D6', tip: 'torx' }
};
const TOOL_ORDER = ['ph1', 'ph2', 't20', 'hex5', 'flat', 'tq'], T20S = ['t20', 'tq'], LOCK_TOOLS = ['flat', 'ph2'], TORQUES = [6, 12, 20];
const TOOL_KEEP = [['Tools', 'Dell lists a Phillips #1 and #2, a Torx T20, a 5 mm hex nut driver and a 1/4 inch flat blade screwdriver. Cover lock: the flat blade or the Phillips #2. Heat sink and force plate screws: Torx T20.'],
  ['Torque', 'The force plate screws are tightened to 12.0 ± 1.0 lbf-in (1.36 N m), 1, 2, 3, with a torque driver and a T20 bit. Under it the socket is not fully actuated; over it the plate or the socket can be damaged. The manual gives no torque for the heat sink screws: tighten them fully, in the marked order.']];
// a screwdriver lying on the rack, handle left, tip right
function driverArt(k, x, y) {
  const d = TOOLS[k], big = k === 'tq';
  let g = `<g pointer-events="none">`;
  g += R(x, y - (big ? 11 : 9), big ? 70 : 62, big ? 22 : 18, d.col, 'rx="7" stroke="#0B0F12"') + R(x + (big ? 50 : 44), y - (big ? 11 : 9), 6, big ? 22 : 18, d.band);
  if (big) g += `<circle cx="${x + 22}" cy="${y}" r="8" fill="#C9D0D6" stroke="#0B0F12"/><path d="M${x + 22} ${y}l5 -4" stroke="#B23B2E" stroke-width="2"/>`;
  const sx = x + (big ? 70 : 62), sw = d.tip === 'hex' ? 8 : 4;
  g += R(sx, y - sw / 2, 44, sw, '#C5CCD3', 'stroke="#59626A" stroke-width=".6"');
  const tx = sx + 44;
  if (d.tip === 'ph') g += `<path d="M${tx} ${y - 3}l7 3l-7 3z" fill="#9AA3AB"/><path d="M${tx + 2} ${y}h4" stroke="#3A4149"/>`;
  else if (d.tip === 'torx') g += `<path d="${star6(tx + 4, y, 4)}" fill="#9AA3AB" stroke="#3A4149" stroke-width=".6"/>`;
  else if (d.tip === 'hex') g += `<path d="M${tx} ${y - 6}h6l3 6l-3 6h-6z" fill="#9AA3AB" stroke="#3A4149" stroke-width=".6"/>`;
  else g += `<path d="M${tx} ${y - 2}h7l2 2l-2 2h-7z" fill="#9AA3AB" stroke="#3A4149" stroke-width=".6"/>`;
  return g + '</g>';
}
const toolLabel = (c, k) => `${TOOLS[k].name}: ${c.tool === k ? 'in hand, click to put it back' : 'click to pick it up'}`;
const torqueChips = (c, x, y) => TORQUES.map((v, i) => `<g${hot('torque', String(v), `Torque driver setting: ${v} lbf-in${c.torque === v ? ' (set)' : ''}`)}><rect x="${x + i * 46}" y="${y}" width="40" height="22" rx="11" fill="${c.torque === v ? '#2E5571' : '#0E1A22'}" stroke="${c.torque === v ? '#C9D0D6' : '#3A4A56'}"/>${TXT(x + i * 46 + 20, y + 15, String(v), `font:700 11px var(--font);fill:${c.torque === v ? '#FFFFFF' : '#C4D3DE'}`)}</g>`).join('') + TXT(x + 140, y + 15, 'lbf-in', 'font:500 10px var(--font);fill:#C4D3DE', 'start');
// the rack in a column (inside view) and in a row (socket close-up)
function toolColumn(c, x, y) {
  let g = TXT(x, y, 'Tools (Dell ISM, page 25)', 'font:700 12px var(--font);fill:#EAF2F7', 'start');
  TOOL_ORDER.forEach((k, i) => {
    const yy = y + 12 + i * 50, on = c.tool === k;
    g += `<g${hot('tool', k, toolLabel(c, k))}><rect x="${x}" y="${yy}" width="284" height="44" rx="6" fill="${on ? '#173F2C' : '#0E1A22'}" stroke="${on ? '#45D07F' : '#3A4A56'}" stroke-width="1.5"/>${driverArt(k, x + 10, yy + 22)}${TXT(x + 140, yy + 19, TOOLS[k].name, 'font:600 11px var(--font);fill:#EAF2F7', 'start')}${TXT(x + 140, yy + 34, on ? 'in hand' : k === 'tq' ? `set: ${c.torque ? c.torque + ' lbf-in' : 'not set'}` : '', `font:500 10px var(--font);fill:${on ? '#45D07F' : '#C4D3DE'}`, 'start')}</g>`;
  });
  return g + TXT(x, y + 330, 'Torque driver setting', 'font:600 10.5px var(--font);fill:#C4D3DE', 'start') + torqueChips(c, x, y + 338);
}
function toolRow(c, y) {
  let g = R(0, y - 8, 900, 128, '#14212C', 'pointer-events="none"') + TXT(18, y + 8, 'Tools (Dell ISM, page 25)', 'font:700 11px var(--font);fill:#EAF2F7', 'start');
  TOOL_ORDER.forEach((k, i) => {
    const x = 18 + i * 146, on = c.tool === k;
    g += `<g${hot('tool', k, toolLabel(c, k))}><rect x="${x}" y="${y + 16}" width="138" height="62" rx="6" fill="${on ? '#173F2C' : '#0E1A22'}" stroke="${on ? '#45D07F' : '#3A4A56'}" stroke-width="1.5"/>${driverArt(k, x + 8, y + 34)}${TXT(x + 69, y + 60, TOOLS[k].name, 'font:600 10px var(--font);fill:#EAF2F7')}${TXT(x + 69, y + 73, on ? 'in hand' : k === 'tq' ? `set: ${c.torque ? c.torque + ' lbf-in' : 'not set'}` : '', `font:500 9.5px var(--font);fill:${on ? '#45D07F' : '#C4D3DE'}`)}</g>`;
  });
  return g + TXT(706, y + 101, 'torque driver setting', 'font:600 10px var(--font);fill:#C4D3DE', 'end') + torqueChips(c, 712, y + 86);
}
// a tool that does not fit the job: what Dell says to use
const toolOk = (c, list, job) => {
  if (list.includes(c.tool)) return true;
  const want = list.map(k => TOOLS[k].name).join(' or ');
  bad(c.tool ? `The ${TOOLS[c.tool].name} does not fit ${job}. Dell: ${want}.` : `No tool in hand: ${job} takes the ${want}. Pick it up from the rack.`);
  return false;
};

/* ============ the procedure's phases ============ */
const SCREW_TXT = ['tight', 'three turns', 'loose'];
const HS_STAGES = [[0, 1, 1], [2, 3, 1], [0, 1, 2], [2, 3, 2]];            // pairs 1-2 then 3-4, partial then full
// the heat sink screws go in stages: which stage a click on screw k would set, or 0 if that is out of order
function hsStage(c, k) {
  const s = c.hs.screws;
  for (const [a, b, st] of HS_STAGES) { if (s[a] >= st && s[b] >= st) continue; return (k === a || k === b) && s[k] === st - 1 ? st : 0; }
  return 0;
}
const hsWant = c => { const s = c.hs.screws; for (const [a, b, st] of HS_STAGES) { if (s[a] < st) return [a, st]; if (s[b] < st) return [b, st]; } return null; };
// the force plate: loosen 3, 2, 1; tighten 1, 2, 3
const fpNext = c => c.tray === 'old' ? [2, 1, 0].find(k => c.fp[k]) : [0, 1, 2].find(k => !c.fp[k]);
const removing = c => c.tray === 'old';
function cpuPhase(t) {
  const c = t.cpu;
  if (!c.back && c.cover !== 'off') return 'coverOff';
  if (!c.back && c.shroud === 'in') return 'shroudOut';
  if (c.tray === 'old' && c.hs.on) return 'hsOff';
  if (c.tray === 'old' && (!c.lidClean || !c.hs.clean)) return 'clean';
  if (c.tray === 'old' && c.plate === 'down') return 'fpOpen';
  if (c.tray === 'old' && c.frame === 'down') return 'frameUp';
  if (c.tray === 'old') return 'trayOut';
  if (c.tray === 'none') return 'trayIn';
  if (c.frame === 'up') return 'frameDown';
  if (c.plate === 'up' || c.fp.some(x => !x)) return 'fpClose';
  if (c.hs.grease !== 1) return 'grease';
  if (!c.hs.on || c.hs.screws.some(x => x < 2)) return 'hsOn';
  if (t.memLab && (!memOk(t) || SLOTS.some(s => t.memOpen[s]))) return 'memWork';      // the installation: memory next
  if (c.shroud === 'out') return 'shroudIn';
  return 'coverOn';
}
const PHASE_TITLE = { coverOff: 'System cover: unlock, lift the release latch, lift the cover off', shroudOut: 'Air shroud: lift it out by its touch points', memWork: 'Memory modules: open the Memory view, choose a model, populate in Dell\'s order', hsOff: 'Heat sink: four captive screws in the marked order, then lift', clean: 'Old grease: wipe the processor lid and the heat sink base', fpOpen: 'Force plate: open the screws 3, 2, 1', frameUp: 'Rail frame: lift the blue latches', trayOut: 'Processor tray: out of the frame by its tab', trayIn: 'Processor tray: the new one in, until seated', frameDown: 'Rail frame: down until the latches lock', fpClose: 'Force plate: down, then the screws 1, 2, 3', grease: 'Thermal grease: draw a thin spiral on the processor', hsOn: 'Heat sink: down, screws 1 and 2, 3 and 4', shroudIn: 'Air shroud: back in', coverOn: 'System cover: align, close the latch, lock' };
const SOCKET_PH = ['hsOff', 'clean', 'fpOpen', 'frameUp', 'trayOut', 'trayIn', 'frameDown', 'fpClose', 'grease', 'hsOn'];
// a lab without the processor work (the rack lab): these views say where the work is instead of drawing it
const otherLab = (title, h = 220) => frame(title, `<rect x="120" y="60" width="660" height="110" rx="8" fill="#0E1A24" stroke="#2E5571"/><text x="450" y="100" text-anchor="middle" class="st">${esc(title)}: not part of this lab</text><text x="450" y="126" text-anchor="middle" class="ss">It belongs to the processor lab: finish the rack installation and continue into it,</text><text x="450" y="146" text-anchor="middle" class="ss">or pick "Maintenance: replace the processor" in the Lab menu at the top.</text>`, h);

/* ============ Inside the server, from above: the trainer's photo (rear at the top) ============
   The photo is straightened and cropped to the chassis walls (assets-cpu.js); FP maps its frame (1720 px between the
   walls in the straightened original) into the view. The air shroud is its own layer, cut from the shroud-on photo,
   and lifts away; the cover is drawn over the same frame. With the heat sink off, the socket as it stands is drawn at
   the heat sink's place. */
const PHO = { x: 20, y: 44, w: 560 }; PHO.h = PHO.w * FIGS.topOpen.H / FIGS.topOpen.W;
const pk = PHO.w / 1720, pv = (x, y) => [PHO.x + x * pk, PHO.y + y * pk];
// in the straightened original's pixels: the air shroud's outline, the heat sink, the chassis' bare front-left corner
const SHROUD_P = [[690, 710], [756, 710], [756, 1260], [1020, 1260], [1020, 1180], [1344, 1180], [1344, 1260], [1580, 1260], [1580, 800], [1704, 800], [1704, 1474], [1350, 1474], [1350, 1320], [780, 1320], [780, 1474], [272, 1474], [272, 1424], [636, 790], [690, 790]];
const HS_PH = [1020, 770, 1344, 1300];
const IV = {
  cover: { x: PHO.x - 4, y: PHO.y - 4, w: PHO.w + 8, h: PHO.h + 8 },
  shroudPts: () => SHROUD_P.map(p => pv(...p).map(f1).join(',')).join(' '),
  hs: () => { const [x0, y0] = pv(HS_PH[0], HS_PH[1]), [x1, y1] = pv(HS_PH[2], HS_PH[3]); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; }
};
IV.cover.latch = { x: PHO.x + PHO.w / 2 - 22, y: PHO.y + PHO.h / 2 - 80, w: 44, h: 120 };
IV.cover.lock = [PHO.x + PHO.w / 2, IV.cover.latch.y + 102];
const photoImg = (key, extra = '') => `<image href="${FIGS[key].src}" x="${PHO.x}" y="${PHO.y}" width="${PHO.w}" height="${f1(PHO.h)}" preserveAspectRatio="none" pointer-events="none"${extra}/>`;
// the socket where the heat sink was, as it stands (heat sink off): the processor plate, the frame, the tray, the plate
function miniSocket(c) {
  const H = IV.hs(), s = H.w / 330, cx = H.x + H.w / 2, cy = H.y + H.h / 2;
  let g = R(H.x, H.y, H.w, H.h, '#1E3A2A', 'rx="4" pointer-events="none"') + `<g pointer-events="none" transform="translate(${f1(cx - 450 * s)} ${f1(cy - 297 * s)}) scale(${f1(s)})">` + baseArt(c);
  g += c.tray === 'none' ? pinsArt() : carrierArt(c, false);
  if (c.frame === 'down') g += frameArt();
  if (c.plate === 'down') g += plateArt(c);
  return g + '</g>';
}
// the cover from above. The release latch lies in its recess in the middle of the cover, along the depth, the lock at its
// front end where it pivots; lifted, its rear end swings up toward the camera (standG), as in figure 17.
function coverArt(c, latchUp, lockAge, latchAge) {
  const V = IV.cover, L = V.latch, [lx, ly] = V.lock, hy = L.y + L.h;
  let g = `<g pointer-events="none">` + R(V.x, V.y, V.w, V.h, 'url(#dcover)', 'rx="3" stroke="#6F7780" stroke-width="1.5"');
  g += R(V.x + V.w - 170, V.y + 40, 140, 90, 'url(#dvent)') + R(V.x + V.w - 170, V.y + V.h - 140, 140, 90, 'url(#dvent)');
  g += `<path d="M${V.x + 40} ${V.y + 40}H${V.x + V.w - 40}" stroke="#DCE1E5" stroke-width="1" opacity=".7"/>`;
  // the recess, dark inside where the lifted latch has left it
  g += R(L.x - 7, L.y - 7, L.w + 14, L.h + 14, '#8E99A3', 'rx="8"') + R(L.x - 2, L.y - 2, L.w + 4, L.h + 4, '#2A3138', 'rx="6"');
  const th = latchUp ? 65 : 0, from = latchAge < 0.5 ? (latchUp ? 0 : 65) : undefined;
  const handle = R(L.x, L.y, L.w, L.h, '#15191D', 'rx="6" stroke="#3A4149"') + R(L.x + 9, L.y + 10, L.w - 18, L.h - 46, '#2A3138', 'rx="3"') +
    [0, 1, 2, 3].map(k => `<path d="M${L.x + 12} ${L.y + 18 + k * 10}h${L.w - 24}" stroke="#3E464E" stroke-width="2"/>`).join('') + shadeArt(L.x, L.y, L.w, L.h, th);
  const sh = latchUp ? 1 : 0;
  g += `<rect x="${L.x + 10}" y="${L.y + 14}" width="${L.w}" height="${L.h}" rx="8" fill="#000" opacity="${sh * 0.45}">${latchAge < 0.5 ? `<animate attributeName="opacity" values="${0.45 - sh * 0.45};${sh * 0.45}" ${anim(latchAge, 0.45)}/>` : ''}</rect>`;
  g += standG(hy, th, handle, from, latchAge, 0.45, 0, 1.1);
  // the lock at the pivot end: slot along the latch when locked, across it when unlocked
  g += `<circle cx="${lx}" cy="${ly}" r="10" fill="#C5CCD3" stroke="#59626A"/><g transform="rotate(${c.cover === 'locked' ? 0 : -90} ${lx} ${ly})">${lockAge < 0.5 ? `<animateTransform attributeName="transform" type="rotate" values="${c.cover === 'locked' ? -90 : 0} ${lx} ${ly};${c.cover === 'locked' ? 0 : -90} ${lx} ${ly}" ${anim(lockAge, 0.45)}/>` : ''}<path d="M${lx} ${ly - 6}v12" stroke="#2A3138" stroke-width="2.5" stroke-linecap="round"/></g>`;
  g += TXT(L.x - 16, L.y + 24, 'release latch', 'font:600 9px var(--font);fill:#3B434B', 'end') + TXT(L.x - 16, ly + 4, 'lock', 'font:600 9px var(--font);fill:#3B434B', 'end');
  return g + '</g>';
}
Sim.registerView({
  id: 'inside', title: 'Inside: cover, air shroud',
  keep: [
    ['Before working inside', 'Power off, disconnect the power cords and the cables at the server, slide the system out, then the cover. Never open a running system. An antistatic strap, clipped to bare chassis metal.'],
    ['The cover', 'Figure 17: 1 turn the lock a quarter turn anticlockwise with a 1/4 inch flat blade or a Phillips #2 screwdriver, 2 lift the release latch until the cover slides back, 3 lift the cover off. To close: align the tabs with the guide slots, slide the cover on, close the latch, turn the lock clockwise.'],
    ['Air shroud', 'Hold its touch points at both ends and lift it out. Never run the system without it: it overheats within minutes.'],
    ['Where things are', 'Rear at the top: the PSU bay on the left, the risers, the rear ports. The system board with 16 memory sockets around the processor (white release tabs: the first socket of each channel). Fans across the front, the backplane and drives in front of them.'],
    ...TOOL_KEEP],
  render(t) {
    if (!t.cpu) return otherLab('Inside the server');
    const c = t.cpu, ph = cpuPhase(t), aCL = fxAge('coverLift'), aCP = fxAge('coverPlace'), aSh = fxAge('shroud'), H = IV.hs();
    let g = DEFS + `<rect x="${PHO.x - 6}" y="${PHO.y - 6}" width="${PHO.w + 12}" height="${f1(PHO.h + 12)}" rx="5" fill="#59626A" pointer-events="none"/>` + photoImg('topOpen');
    const wall = `<rect x="${PHO.x}" y="${PHO.y}" width="${PHO.w}" height="${f1(PHO.h)}" fill="none" stroke="#7D868F" stroke-width="9" pointer-events="none"/>`;   // the chassis walls, over the photo's edges
    g += TXT(PHO.x + PHO.w / 2, PHO.y - 12, 'REAR (PSU bay, risers, rear ports)', 'font:600 10px var(--font);fill:#C4D3DE') + TXT(PHO.x + PHO.w / 2, PHO.y + PHO.h + 20, 'FRONT (drives behind the backplane)', 'font:600 10px var(--font);fill:#C4D3DE');
    g += wall;
    if (!c.hs.on) g += miniSocket(c);
    if (t.dimms) SLOTS.forEach(s => {
      const k = t.dimms[s]; if (!k) return;
      const d = MEMKIT_D[k], [x0, y0] = pv(SLOT_X[s] - 7, 808), [x1, y1] = pv(SLOT_X[s] + 7, 1284);
      g += `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(x1 - x0)}" height="${f1(y1 - y0)}" rx="1.5" fill="${d.col}" stroke="#45D07F" stroke-width="1" pointer-events="none"/>`;
    });
    const onSocket = SOCKET_PH.includes(ph);
    // the air shroud: in place, lifting out, coming down, or on the bench
    const shroud = photoImg('topShroud');
    if (c.shroud === 'in') g += aSh < 0.8 ? lift(shroud, 340, 400, aSh, false) : shroud;
    else if (aSh < 0.8) g += lift(shroud, 340, 400, aSh, true);
    // the cover: on (slid back when the latch is up), lifting off, coming down, or off
    const coverOn = c.cover !== 'off', back = c.cover === 'released' || c.cover === 'placed';
    const cov = coverArt(c, back, fxAge('lock'), fxAge('latch'));
    const cx = PHO.x + PHO.w / 2, cy = PHO.y + PHO.h / 2;
    if (coverOn && aCP < 0.9) g += lift(`<g transform="translate(0 -18)">${cov}</g>`, cx, cy, aCP, false, 0.9, -70, 1.1);
    else if (coverOn) g += `<g transform="translate(0 ${back ? -18 : 0})">${back && fxAge('latch') < 0.5 ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 -18" ${anim(fxAge('latch'), 0.45)}/>` : ''}${cov}</g>`;
    else if (aCL < 0.9) g += lift(`<g transform="translate(0 -18)">${cov}</g>`, cx, cy, aCL, true, 0.9, -70, 1.1);
    // the clickable parts of this phase
    const V = IV.cover, L = V.latch, [lx, ly] = V.lock, dy = back ? -18 : 0;
    // the latch and the lock are clickable while they are still to be worked; the whole cover once it is free
    if (ph === 'coverOff' && c.cover === 'released') g += zoneR('coverLift', '', 'System cover: lift it off', V.x, V.y + dy, V.w, V.h, 3);
    else if (ph === 'coverOff') {
      g += zoneR('coverLift', '', 'System cover: unlock it and lift the release latch first', V.x, V.y + dy, V.w, V.h, 3);       // under the lock and the latch
      g += zoneR('coverLatch', '', c.cover === 'released' ? 'Release latch: lifted, the cover slid back' : 'Release latch: lift it until the cover slides back', L.x - 4, L.y - 10 + dy, L.w + 8, L.h - 22);
      g += zoneC('coverLock', '', c.cover === 'locked' ? 'Cover lock: a quarter turn anticlockwise (1/4 inch flat blade or Phillips #2)' : 'Cover lock: unlocked', lx, ly + dy, 16);
    } else if (ph === 'coverOn') {
      if (!coverOn) g += zoneR('coverPlace', '', 'System cover: align its tabs with the guide slots and slide it on', V.x, V.y, V.w, V.h, 3);
      else { if (c.cover === 'placed') g += zoneR('coverClose', '', 'Release latch: close it, the cover pulls home', L.x - 4, L.y - 10 + dy, L.w + 8, L.h - 22); g += zoneC('coverLock', '', c.cover === 'locked' ? 'Cover lock: locked' : 'Cover lock: a quarter turn clockwise (1/4 inch flat blade or Phillips #2)', lx, ly + dy, 16); }
    } else if (ph === 'shroudOut' || ph === 'shroudIn') {
      const xs = SHROUD_P.map(p => p[0]), ys = SHROUD_P.map(p => p[1]), [x0, y0] = pv(Math.min(...xs), Math.min(...ys)), [x1, y1] = pv(Math.max(...xs), Math.max(...ys));
      g += zoneR('shroud', '', ph === 'shroudOut' ? 'Air shroud: hold its touch points at both ends and lift it out' : 'Air shroud: lower it in, its slot on the chassis standoff, touch points at both ends', x0 - 3, y0 - 3, x1 - x0 + 6, y1 - y0 + 6, 5);
    } else if (ph === 'memWork') {
      const [x0, y0] = pv(745, 740), [x1, y1] = pv(1555, 1355);
      g += zoneR('go', 'mem', '16 DDR4 memory sockets (A1 to A16): open the Memory view', x0, y0, x1 - x0, y1 - y0, 6);
    } else if (onSocket) g += zoneR('go', 'socket', 'Processor and heat sink: open the close-up', H.x - 6, H.y - 6, H.w + 12, H.h + 12, 6);
    // the right column: the phase, the wrist strap clipped to the bare front-left corner of the chassis, the tools
    const [tx, ty] = pv(1712, 300);                        // the bare right wall of the chassis, by the rear
    const [t1, t2] = PHASE_TITLE[ph].split(': ');
    g += TXT(604, 62, t1, 'font:700 14px var(--font);fill:#EAF2F7', 'start') + TXT(604, 82, t2 || '', 'font:500 12px var(--font);fill:#C4D3DE', 'start');
    g += TXT(604, 102, onSocket ? 'The processor work is in the close-up: click the heat sink.' : ph === 'memWork' ? 'The memory work is in the Memory view: click the sockets.' : '', 'font:400 11px var(--font);fill:#C4D3DE', 'start');
    g += `<g transform="translate(604 128) scale(.82)">${esdFig(t, 0, 0, (tx - 604) / 0.82, (ty - 128) / 0.82)}</g>`;
    g += toolColumn(c, 604, 200);
    return frame('Inside the server, from above', g, Math.ceil(PHO.y + PHO.h + 34));
  },
  actions(t) {
    if (!t.cpu) return [];
    const c = t.cpu, a = [...chainBtn(t)];
    if (!c.esd) a.push(button('Put on the ESD wrist strap', 'esd', '', true));
    return a;
  },
  tray(t) { return kitHtml(t); }
});
function kitHtml(t) {
  const c = t.cpu; if (!c) return '';
  const on = dimmList(t), pk = t.memPick && MEMKIT_D[t.memPick];
  const memLine = t.memLab || on.length ? `<li>Memory: ${on.length ? `${on.length} × ${MEMKIT_D[t.dimms[on[0]]].name} (${memTotalGb(t)} GB total, ${memSpeed(t)} MT/s) in ${FILL.filter(s => t.dimms[s]).join(', ')}` : pk ? `chosen ${pk.name}, 0 seated` : 'none seated yet'}</li>` : '';
  return `<h2>Kit</h2><ul class="rules"><li>New processor: ${WO2.cpu}, in its tray${c.hand ? ' (in hand)' : c.tray === 'new' ? ' (installed)' : ''}</li>${t.memLab ? `<li>DDR4 memory kit (ISM Table 13): 8 GB 1Rx8, 16 GB 2Rx8, 32 GB 2Rx8, 64 GB 2Rx4 RDIMM, or 128 GB 8Rx4 LRDIMM${pk ? ` — selected: ${pk.name}` : ''}</li>` : ''}<li>Thermal grease syringe (single use)${c.hs.grease ? ' (used)' : ''}</li><li>Lint-free cloth</li><li>Tools (ISM page 25): Phillips #1 and #2, Torx T20, 5 mm hex nut driver, 1/4 inch flat blade; a torque driver with a T20 bit</li><li>In hand: ${c.tool ? TOOLS[c.tool].name : 'nothing'}; torque driver set to ${c.torque ? c.torque + ' lbf-in' : 'nothing yet'}</li><li>ESD wrist strap: ${c.esd ? 'on' : 'not on'}</li></ul>` +
    `<h2>State</h2><ul class="rules"><li>Power: ${c.power}; cords: ${[c.cab.psu1, c.cab.psu2].filter(Boolean).length} of 2 in; cables: ${['gb1', 'gb2', 'idrac'].filter(k => c.cab[k]).length} of 3 in</li><li>Cover: ${c.cover}; air shroud: ${c.shroud}</li><li>Heat sink: ${c.hs.on ? 'on' : 'off, on the bench'}${c.hs.on ? '' : c.hs.clean ? ', base cleaned' : ', old grease on its base'}; force plate: ${c.plate}; rail frame: ${c.frame}</li><li>Processor: ${c.tray === 'old' ? 'the old one, in its tray' : c.tray === 'new' ? WO2.cpu : 'socket empty'}</li>${memLine}</ul>`;
}

/* ============ The processor socket, close-up, from above: 5 px per mm ============
   The processor plate (the socket's metal base) with the heat sink standoffs around it; on it the force plate, a
   stainless frame with a window over the processor lid, hinged at its front edge, its screw 1 on the rear bar and 2
   and 3 on the front brackets (CLOSE 1->2->3, OPEN 3->2->1 as marked); under it the rail frame with its two blue
   latches on the rear corners, hinged at its front edge; in the rail frame the processor tray, a green carrier round the
   processor with its tab at the rear. The heat sink over all of it, its four captive screws on springs numbered 1 to 4.
   The ends of the nearest memory sockets on both sides, the blue touch point in front. */
const SV = {
  base: { x: 305, y: 110, w: 290, h: 375 },
  plate: { x: 318, y: 125, w: 264, h: 310, win: { x: 356, y: 183, w: 188, h: 236 }, hinge: 470 },   // the plate ends at its hinge pins; screws 2 and 3 sit on the brackets in front of it
  fpScrews: [[450, 147], [567, 452], [333, 452]],
  frame: { x: 340, y: 150, w: 220, h: 305, hinge: 455, bar: 14 },
  latches: [[340, 150], [534, 150]],
  carrier: { x: 362, y: 166, w: 176, h: 274, tab: { x: 420, y: 90, w: 60, h: 38 } },
  ihs: { x: 374, y: 186, w: 152, h: 236 },
  hs: { x: 250, y: 60, w: 400, h: 470, fins: { x: 292, y: 96, w: 316, h: 398 }, screws: [[272, 82], [628, 508], [628, 82], [272, 508]] },
  touch: { x: 330, y: 500, w: 62, h: 86 }
};
function pcbArt() {
  let g = `<g pointer-events="none">` + R(0, 0, 900, 620, '#1F6B4A');
  for (let i = 0; i < 14; i++) g += `<path d="M${20 + i * 66} 0v620" stroke="#2A7F5A" stroke-width=".8"/>`;
  for (let i = 0; i < 9; i++) g += `<path d="M0 ${40 + i * 70}h900" stroke="#2A7F5A" stroke-width=".8"/>`;
  // the nearest four memory sockets on each side, their ends
  ['A7', 'A15', 'A8', 'A16'].forEach((n, i) => g += dimmArt(60 + i * 48, 30, 30, 540, i % 2 === 0, n));
  ['A12', 'A6', 'A11', 'A5'].forEach((n, i) => g += dimmArt(656 + i * 48, 30, 30, 540, i % 2 === 1, n));
  // silk: CPU; the blue touch point; two jumpers and capacitors in front of the socket
  g += R(250, 106, 40, 18, '#F1F3F5', 'rx="2"') + TXT(270, 119, 'CPU', 'font:700 10px var(--font);fill:#14202B');
  const T = SV.touch; g += R(T.x, T.y, T.w, T.h, '#2E7FD6', 'rx="8" stroke="#174A86" stroke-width="1.5"') + `<ellipse cx="${T.x + T.w / 2}" cy="${T.y + 22}" rx="18" ry="12" fill="#1F5FA8" stroke="#174A86"/>`;
  g += R(412, 520, 18, 24, '#F1F3F5', 'rx="2" stroke="#8E99A3"') + R(440, 520, 18, 24, '#F1F3F5', 'rx="2" stroke="#8E99A3"');
  [[484, 548], [512, 548], [540, 548]].forEach(([x, y]) => g += `<circle cx="${x}" cy="${y}" r="9" fill="#2A3138" stroke="#59626A"/><circle cx="${x}" cy="${y}" r="4" fill="#59626A"/>`);
  // the heat sink standoffs around the processor plate
  SV.hs.screws.forEach(([x, y]) => g += `<circle cx="${x}" cy="${y}" r="11" fill="#8E99A3" stroke="#59626A"/><circle cx="${x}" cy="${y}" r="4.5" fill="#2A3138"/>`);
  return g + '</g>';
}
function baseArt(c) {
  const b = SV.base, p = SV.plate;
  let g = `<g pointer-events="none">` + R(b.x, b.y, b.w, b.h, '#AEB5BC', 'rx="6" stroke="#6F7780" stroke-width="1.2"');
  // the hinge brackets of the force plate on the front corners, screws 2 and 3 on them
  g += R(p.x - 8, p.hinge - 32, 48, 36, '#9AA3AB', 'rx="4" stroke="#6F7780"') + R(p.x + p.w - 40, p.hinge - 32, 48, 36, '#9AA3AB', 'rx="4" stroke="#6F7780"');
  g += `<path d="M${p.x + 40} ${p.hinge - 4}H${p.x + p.w - 40}" stroke="#6F7780" stroke-width="4"/>`;
  g += triArt(b.x + 6, b.y + b.h - 6, 13);                                   // the socket's own orientation mark, front left
  [1, 2].forEach(k => { const [x, y] = SV.fpScrews[k]; g += screwArt(x, y, 9, !c.fp[k]) + TXT(x + (k === 1 ? -28 : 28), y + 4, String(k + 1), 'font:700 11px var(--font);fill:#3B434B'); });
  return g + '</g>';
}
const pinsArt = () => { const i = SV.ihs; return R(i.x, i.y, i.w, i.h, 'url(#dpins)', 'stroke="#59626A" pointer-events="none"'); };
function plateArt(c) {
  const p = SV.plate, w = p.win;
  let g = `<g pointer-events="none"><path d="M${p.x} ${p.y}h${p.w}v${p.h}h${-p.w}z M${w.x} ${w.y}v${w.h}h${w.w}v${-w.h}z" fill="url(#dsteel)" fill-rule="evenodd" stroke="#6F7780" stroke-width="1.2"/>`;
  g += TXT(450, p.y + 15, 'CLOSE 1→2→3', 'font:600 9.5px var(--font);fill:#4A535C;letter-spacing:.08em') + TXT(450, p.y + p.h - 5, 'OPEN 3→2→1', 'font:600 9.5px var(--font);fill:#4A535C;letter-spacing:.08em');
  const [x, y] = SV.fpScrews[0]; g += screwArt(x, y, 9, !c.fp[0]) + TXT(x + 26, y + 6, '1', 'font:700 11px var(--font);fill:#3B434B');
  return g + '</g>';
}
// the orientation mark: a gold triangle in one corner of the processor and of its carrier, and the same triangle on the
// rail frame; the tray goes into the frame one way only, the triangles at the same corner (front left, from above)
const triArt = (x, y, s) => `<path d="M${f1(x)} ${f1(y)}h${s}L${f1(x)} ${f1(y - s)}z" fill="#D9B24C" stroke="#7A5E12" stroke-width=".8" pointer-events="none"/>`;
function frameArt() {
  const f = SV.frame, b = f.bar, tb = SV.carrier.tab;
  return `<g pointer-events="none"><path d="M${f.x} ${f.y}h${f.w}v${f.h}h${-f.w}z M${f.x + b} ${f.y + b}v${f.h - 2 * b}h${f.w - 2 * b}v${-(f.h - 2 * b)}z" fill="url(#dsteel)" fill-rule="evenodd" stroke="#6F7780" stroke-width="1.2"/>${R(tb.x - 4, f.y, tb.w + 8, b, '#7D858D')}${triArt(f.x + 2, f.y + f.h - 2, 11)}</g>`;
}
// grease drawn by the student: their strokes on the lid
const strokePath = st => st.length ? 'M' + st.map(p => p.join(' ')).join('L') : '';
// the old grease left on the old processor's lid when the heat sink comes off: a flattened, smeared layer
function oldGreaseArt() {
  const i = SV.ihs, cx = i.x + i.w / 2, cy = i.y + i.h / 2;
  return `<g pointer-events="none" opacity=".92"><ellipse cx="${cx}" cy="${cy}" rx="${i.w * 0.42}" ry="${i.h * 0.4}" fill="#B9BDC1"/><ellipse cx="${cx - 8}" cy="${cy + 6}" rx="${i.w * 0.3}" ry="${i.h * 0.28}" fill="#A6ABB0"/><path d="M${cx - 50} ${cy - 60}q30 -14 62 6M${cx - 44} ${cy + 40}q34 16 70 -6M${cx - 30} ${cy - 10}q22 -8 52 4" stroke="#8E959B" stroke-width="3" fill="none" stroke-linecap="round"/>${TXT(cx, cy + i.h * 0.44, 'old grease', 'font:600 10px var(--font);fill:#3B434B')}</g>`;
}
function latchArt(k, up, age) {
  const [x, y] = SV.latches[k], dy = up ? -7 : 0;
  return `<g pointer-events="none" transform="translate(0 ${dy})">${age < 0.4 ? `<animateTransform attributeName="transform" type="translate" values="0 ${up ? 0 : -7};0 ${dy}" ${anim(age, 0.35)}/>` : ''}${R(x, y, 26, 26, up ? '#4F9BE8' : '#2E7FD6', 'rx="4" stroke="#174A86" stroke-width="1.5"')}<path d="M${x + 6} ${y + 9}h14M${x + 6} ${y + 14}h14M${x + 6} ${y + 19}h14" stroke="#174A86" stroke-width="1.5"/></g>`;
}
// the processor tray: the green carrier round the processor (its lid, AMD EPYC), the tab at the rear; the grease spiral when applied
function spiralPath(cx, cy, turns, a, b, ry) { let d = ''; for (let t = 0; t <= turns * 2 * Math.PI; t += 0.12) { const r = a + b * t; d += (d ? 'L' : 'M') + f1(cx + r * Math.cos(t)) + ' ' + f1(cy + r * ry * Math.sin(t)); } return d; }
function carrierArt(c, withTab) {
  const k = SV.carrier, i = SV.ihs, tb = k.tab, cx = i.x + i.w / 2, cy = i.y + i.h / 2;
  let g = `<g pointer-events="none">` + R(k.x, k.y, k.w, k.h, '#2DA44E', 'rx="8" stroke="#1B6F33" stroke-width="1.5"') + R(tb.x + 14, tb.y + tb.h - 4, tb.w - 28, k.y - tb.y - tb.h + 6, '#2DA44E', 'stroke="#1B6F33"');
  g += R(i.x, i.y, i.w, i.h, 'url(#dihs)', 'rx="3" stroke="#6F7780"') + R(i.x + 14, i.y + 14, i.w - 28, i.h - 28, 'none', 'stroke="#C9CDD1" stroke-opacity=".6"');
  g += `<g transform="rotate(90 ${cx} ${cy})">${TXT(cx, cy - 8, 'AMD', 'font:700 13px var(--font);fill:#5B636B;letter-spacing:.08em')}${TXT(cx, cy + 14, 'EPYC', 'font:800 22px var(--font);fill:#5B636B;letter-spacing:.06em')}</g>`;
  g += triArt(k.x + 3, k.y + k.h - 3, 12) + triArt(i.x + 3, i.y + i.h - 3, 9);
  if (c.tray === 'old' && !c.hs.on && !c.lidClean) g += oldGreaseArt();
  if (c.tray === 'new' && c.gStrokes && c.gStrokes.length) {
    g += c.gStrokes.map(st => `<path d="${strokePath(st)}" fill="none" stroke="#DADEE2" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    if (c.hs.grease === -1) g += `<rect x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}" fill="#B23B2E" opacity=".12"/>` + TXT(cx, i.y + i.h - 10, 'too much: wipe it off', 'font:700 11px var(--font);fill:#B23B2E');
  }
  g += '</g>';
  return withTab ? g + tabArt() : g;
}
const FINGER = { x: 530, y: 156 };
function fingerArt() {
  // a right hand from above, reaching in from the rear edge of the picture, palm down: the index finger straight, its tip
  // pressing the plate's rear edge; the middle, ring and little fingers curled under; the thumb resting beside them
  const { x, y } = FINGER, w = 13, sk = '#E2A988', ske = '#A86F52';
  const grad = (id, a, b, c) => `<linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${a}"/><stop offset=".45" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
  let g = `<g pointer-events="none"><defs>${grad('dfing', '#B97A5C', '#EDBB9C', '#B47456')}${grad('dhand', '#C88A6B', '#E9B595', '#BF7F60')}${grad('dcurl', '#B87858', '#E4AC8B', '#B07052')}</defs>`;
  // shadows on the board: the index tip, and the hand above it
  g += `<ellipse cx="${x + 3}" cy="${y + 6}" rx="${w + 2}" ry="7" fill="#000" opacity=".25"/><ellipse cx="${x - 30}" cy="${y - 74}" rx="64" ry="14" fill="#000" opacity=".08"/>`;
  // the thumb, on the right, along the side of the hand
  g += `<path d="M${x + 22} ${y - 120}C${x + 40} ${y - 104} ${x + 52} ${y - 86} ${x + 54} ${y - 70}C${x + 56} ${y - 58} ${x + 42} ${y - 52} ${x + 36} ${y - 62}C${x + 28} ${y - 76} ${x + 16} ${y - 92} ${x + 10} ${y - 104}Z" fill="url(#dhand)" stroke="${ske}" stroke-width="1"/>`;
  g += `<path d="M${x + 38} ${y - 74}C${x + 44} ${y - 70} ${x + 50} ${y - 68} ${x + 51} ${y - 62}C${x + 48} ${y - 58} ${x + 42} ${y - 60} ${x + 38} ${y - 66}Z" fill="#F3CDBA" stroke="#C99278" stroke-width=".8"/>`;
  // the curled fingers, middle to little, their middle joints showing, the tips tucked under
  [[x - 27, 12, 0], [x - 52, 11.5, 4], [x - 75, 10, 10]].forEach(([cx, hw, d]) => {
    const yb = y - 84 - d;
    g += `<path d="M${cx - hw} ${y - 130}V${yb - 8}C${cx - hw} ${yb + 8} ${cx - 5} ${yb + 12} ${cx} ${yb + 12}C${cx + 5} ${yb + 12} ${cx + hw} ${yb + 8} ${cx + hw} ${yb - 8}V${y - 130}Z" fill="url(#dcurl)" stroke="${ske}" stroke-width="1"/>`;
    g += `<path d="M${cx - hw + 3} ${yb - 6}Q${cx} ${yb - 11} ${cx + hw - 3} ${yb - 6}" stroke="${ske}" stroke-opacity=".75" stroke-width="1.1" fill="none"/><path d="M${cx - hw + 1} ${yb + 2}C${cx - hw + 2} ${yb + 10} ${cx - 4} ${yb + 12} ${cx} ${yb + 12}C${cx + 4} ${yb + 12} ${cx + hw - 2} ${yb + 10} ${cx + hw - 1} ${yb + 2}Q${cx} ${yb + 7} ${cx - hw + 1} ${yb + 2}Z" fill="#9A6046" opacity=".55"/>`;   // the finger turning under, in shade
  });
  // the index finger, straight down to the plate: rounded across its width, the nail at the tip, two knuckle creases
  g += `<path d="M${x - w} ${y - 120}V${y - 16}C${x - w} ${y + 2} ${x - 7} ${y + 10} ${x} ${y + 10}C${x + 7} ${y + 10} ${x + w} ${y + 2} ${x + w} ${y - 16}V${y - 120}Z" fill="url(#dfing)" stroke="${ske}" stroke-width="1"/>`;
  g += `<path d="M${x - 8} ${y - 28}C${x - 8} ${y - 6} ${x + 8} ${y - 6} ${x + 8} ${y - 28}V${y - 34}C${x + 8} ${y - 38} ${x - 8} ${y - 38} ${x - 8} ${y - 34}Z" fill="#F3CDBA" stroke="#C99278" stroke-width=".9"/><path d="M${x - 6} ${y - 33}C${x - 2} ${y - 35} ${x + 2} ${y - 35} ${x + 6} ${y - 33}" stroke="#FFF" stroke-opacity=".55" stroke-width="1.2" fill="none"/>`;
  g += [[y - 58, 0], [y - 63, 3]].map(([cy, d]) => `<path d="M${x - w + 4} ${cy + d}Q${x} ${cy - 4 + d} ${x + w - 4} ${cy + d}" stroke="${ske}" stroke-opacity=".7" stroke-width="1.1" fill="none"/>`).join('');
  // the back of the hand over the knuckles, out past the rear edge of the picture
  g += `<path d="M${x - 92} 0C${x - 90} ${y - 140} ${x - 88} ${y - 112} ${x - 70} ${y - 104}C${x - 40} ${y - 94} ${x - 8} ${y - 96} ${x + 16} ${y - 102}C${x + 30} ${y - 106} ${x + 34} ${y - 124} ${x + 36} 0Z" fill="url(#dhand)" stroke="${ske}" stroke-width="1"/>`;
  g += [x - 75, x - 52, x - 27, x].map((cx, k) => `<ellipse cx="${cx}" cy="${y - 106 + (k === 3 ? 2 : 0)}" rx="8" ry="4" fill="#F0C2A6" opacity=".7"/>`).join('');
  // the label: what the hand is doing
  g += `<rect x="${x + 44}" y="${y - 30}" width="86" height="20" rx="10" fill="#0E1A22" opacity=".85"/>` + TXT(x + 87, y - 16, 'hold the plate', 'font:600 10.5px var(--font);fill:#EAF2F7');
  return g + '</g>';
}
const tabArt = () => { const tb = SV.carrier.tab; return `<g pointer-events="none">${R(tb.x, tb.y, tb.w, tb.h, '#2DA44E', 'rx="7" stroke="#1B6F33" stroke-width="1.5"')}<path d="M${tb.x + 12} ${tb.y + 12}h36M${tb.x + 12} ${tb.y + 19}h36M${tb.x + 12} ${tb.y + 26}h36" stroke="#1B6F33" stroke-width="2"/></g>`; };
function hsArt(c, hot) {
  const h = SV.hs, F = h.fins;
  let g = `<g pointer-events="none">` + R(h.x, h.y, h.w, h.h, 'url(#dsteel)', 'rx="10" stroke="#6F7780" stroke-width="1.5"') + R(F.x, F.y, F.w, F.h, 'url(#dfins)', 'stroke="#5B636B"') + R(F.x, F.y, F.w, 10, '#9AA3AB') + R(F.x, F.y + F.h - 10, F.w, 10, '#9AA3AB');
  h.screws.forEach(([x, y], k) => { g += `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="#8E99A3" stroke-width="2.5" stroke-dasharray="5 3"/>` + screwArt(x, y, 10, c.hs.screws[k] === 2) + TXT(x + (x < 450 ? 32 : -32), y + 4, String(k + 1), 'font:700 12px var(--font);fill:#3B434B'); });
  if (hot) g += `<rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" fill="#FF6A3D" opacity=".2"><animate attributeName="opacity" values=".1;.32;.1" dur="1.6s" repeatCount="indefinite"/></rect>` + TXT(450, F.y + F.h / 2 + 6, 'HOT', 'font:800 18px var(--font);fill:#FF8A7A;letter-spacing:.2em');
  return g + '</g>';
}
// the new tray in hand, shown beside the socket: turned as the student holds it, its triangle visible
function handTray(c) {
  const X = 652, Y = 22, W = 232, H = 300, cx = X + W / 2, cy = Y + 172, s = 0.55, a = fxAge('turn');
  const k = SV.carrier, ox = k.x + k.w / 2, oy = (SV.carrier.tab.y + k.y + k.h) / 2;
  const tray = carrierArt({ tray: 'kit', hs: { on: true, grease: 0 }, gStrokes: [] }, true);
  const rot = c.trayRot, from = rot ? 0 : 180;
  let g = `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="8" fill="#0E1A22" stroke="#45D07F" stroke-width="1.5" pointer-events="none"/>` + TXT(cx, Y + 20, `In hand: ${WO2.cpu}, in its tray`, 'font:700 11px var(--font);fill:#EAF2F7') + TXT(cx, Y + 36, 'held by the tab; the triangle marks one corner', 'font:500 9.5px var(--font);fill:#C4D3DE');
  g += `<g pointer-events="none" transform="translate(${cx} ${cy})"><g transform="rotate(${rot})">${a < 0.5 ? `<animateTransform attributeName="transform" type="rotate" values="${from};${rot}" ${anim(a, 0.45)}/>` : ''}<g transform="scale(${s}) translate(${-ox} ${-oy})">${tray}</g></g></g>`;
  return g + zoneR('trayTurn', '', 'The new tray in hand: turn it 180 degrees', X + 6, Y + 46, W - 12, H - 52, 6);
}
// the grease pattern of figure 52: a spiral from the centre outward, about three turns; the cue draws it
const greaseIdeal = () => { const i = SV.ihs, cx = i.x + i.w / 2, cy = i.y + i.h / 2, pts = []; for (let a = 0; a <= 3.1 * 2 * Math.PI; a += 0.15) { const r = 3 + 2.9 * a; pts.push([Math.round(cx + r * Math.cos(a)), Math.round(cy + r * 1.25 * Math.sin(a))]); } return pts; };
const greaseDrag = () => greaseIdeal().map(p => p.join(',')).join(' ');
// what the strokes add up to: their length, how far they wind round the centre, how far out they reach, how much is off the lid
function greaseMeasure(strokes) {
  const i = SV.ihs, cx = i.x + i.w / 2, cy = i.y + i.h / 2, hw = i.w / 2, hh = i.h / 2;
  let L = 0, wind = 0, maxR = 0, n = 0, out = 0;
  strokes.forEach(st => {
    let w = 0, prev = null;
    st.forEach((p, k) => {
      const u = (p[0] - cx) / hw, v = (p[1] - cy) / hh, r = Math.hypot(u, v); n++; if (Math.abs(u) > 1.02 || Math.abs(v) > 1.02) out++; maxR = Math.max(maxR, r);
      if (k) L += Math.hypot(p[0] - st[k - 1][0], p[1] - st[k - 1][1]);
      if (r > 0.06) { const ang = Math.atan2(v, u); if (prev !== null) { let d = ang - prev; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; w += d; } prev = ang; } else prev = null;
    });
    wind += Math.abs(w);
  });
  return { L, wind, maxR, out: n ? out / n : 0 };
}
// a good spiral: long enough, about one and a half turns or more, reaching out to 0.4 of the lid; longer than max is too much
const GREASE = { min: 250, max: 1150, turns: 1.5, reach: 0.4 };
// drawing with the mouse (or a finger) on the lid: the stroke shows as it is drawn and goes to the twin when released
let gLive = null, gDrag = 0;
Sim.listen('pointerdown', e => {
  const z = e.target && e.target.closest && e.target.closest('[data-act="grease"]'); if (!z || Sim.view !== 'socket' || !T.cpu) return;
  let svg = z.ownerSVGElement; while (svg.ownerSVGElement) svg = svg.ownerSVGElement;
  const m = svg.getScreenCTM().inverse(), pt = ev => { const q = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m); return [Math.round(q.x), Math.round(q.y)]; };
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  [['fill', 'none'], ['stroke', '#DADEE2'], ['stroke-width', '5.5'], ['stroke-linecap', 'round'], ['stroke-linejoin', 'round'], ['pointer-events', 'none']].forEach(([k, v]) => path.setAttribute(k, v));
  svg.appendChild(path); gLive = { pts: [pt(e)], pt, path }; e.preventDefault();
});
Sim.listen('pointermove', e => { if (!gLive) return; const p = gLive.pt(e), q = gLive.pts[gLive.pts.length - 1]; if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 2) return; gLive.pts.push(p); gLive.path.setAttribute('d', strokePath(gLive.pts)); });
Sim.listen('pointerup', () => {
  if (!gLive) return; const g = gLive; gLive = null; g.path.remove();
  if (g.pts.length < 3) return;                       // a plain click: the click itself says how to draw
  gDrag = Date.now(); Sim.do('grease', g.pts.map(p => p.join(',')).join(' '));
});
// the click that ends a drag is not a second action
Sim.listen('click', e => { if (Date.now() - gDrag < 400 && e.target && e.target.closest && e.target.closest('#stage')) { gDrag = 0; e.stopPropagation(); e.preventDefault(); } }, true);
Sim.registerView({
  id: 'socket', title: 'Processor socket: close-up',
  keep: [
    ['Hot heat sink', 'The heat sink and processor stay hot for some time after power-off. Let them cool before you touch them.'],
    ['Captive screws, in order', 'The heat sink screws are numbered on the heat sink: 1 and 2 about three turns, 3 and 4 three turns, then 1 and 2 fully, then 3 and 4 fully; the same order to tighten. The force plate opens 3, 2, 1 and closes 1, 2, 3, pressed flat, to 12 lbf-in (1.36 N m). A Torx T20 for all of them.'],
    ['The processor stays in its tray', 'Hold the tray by its tab (green on this unit, blue in the manual). Never touch the processor\'s contacts or the socket pins.'],
    ['Grease', 'A reused heat sink: wipe the old grease off with a lint-free cloth, then one thin spiral from the syringe on the processor. Too much grease runs into the socket. A new heat sink has its paste pre-applied: peel the cover, no syringe.'],
    ['From above', 'Rear at the top. The force plate and the rail frame hinge at their front edges and stand up toward the rear; the tray slides out of the top of the standing frame.'],
    ...TOOL_KEEP],
  render(t) {
    if (!t.cpu) return otherLab('Processor socket');
    const c = t.cpu, ph = cpuPhase(t), aPl = fxAge('plate'), aFr = fxAge('frame'), aTr = fxAge('tray'), aHL = fxAge('hsLift'), aHP = fxAge('hsPlace');
    let g = DEFS + pcbArt();
    if (c.cover !== 'off' || c.shroud === 'in') {
      g += R(0, 0, 900, 620, '#0E1A24', 'opacity=".88"') + TXT(450, 290, c.cover !== 'off' ? 'The system cover is on.' : 'The air shroud covers the processor.', 'font:500 15px var(--font);fill:#EAF2F7') + TXT(450, 316, c.cover !== 'off' ? 'Open the server in the Inside view first: unlock, release latch, lift.' : 'Lift it out in the Inside view first.', 'font:400 12px var(--font);fill:#C4D3DE');
      return frame('Processor socket', g, 620);
    }
    g += baseArt(c);
    const frameFlat = c.frame === 'down' && aFr >= 0.7, trayFlat = frameFlat && c.tray !== 'none';
    if (!trayFlat) g += pinsArt();
    // the rail frame flat with the tray in it, or standing (and swinging) with the tray sliding in or out
    if (frameFlat) {
      if (c.tray !== 'none') g += carrierArt(c, false);
      g += frameArt() + latchArt(0, c.latch.l, fxAge('latch:l')) + latchArt(1, c.latch.r, fxAge('latch:r'));
      if (c.tray !== 'none') g += tabArt();
    } else {
      const th = c.frame === 'up' ? 80 : 0, from = aFr < 0.7 ? (c.frame === 'up' ? 0 : 80) : undefined, f = SV.frame;
      let inner = '';
      const slide = (out, age) => `<g>${out ? `<animate attributeName="opacity" values="1;1;0" keyTimes="0;.65;1" ${anim(age, 0.9)}/>` : `<animate attributeName="opacity" values="0;1;1" keyTimes="0;.3;1" ${anim(age, 0.9)}/>`}<animateTransform attributeName="transform" type="translate" values="${out ? '0 0;0 -250' : '0 -250;0 0'}" ${anim(age, 0.9)} calcMode="spline" keySplines=".4 0 .6 1" keyTimes="0;1"/>${carrierArt(c, true)}</g>`;
      if (c.tray === 'none' && aTr < 0.9) inner += slide(true, aTr);
      else if (c.tray === 'new' && aTr < 0.9) inner += slide(false, aTr);
      else if (c.tray !== 'none') inner += carrierArt(c, true);
      inner += frameArt() + latchArt(0, c.latch.l, fxAge('latch:l')) + latchArt(1, c.latch.r, fxAge('latch:r'));
      if (c.tray !== 'none' && aTr >= 0.9) inner += tabArt();
      inner += shadeArt(f.x, SV.carrier.tab.y, f.w, f.hinge - SV.carrier.tab.y, th);
      if (c.frame === 'up') {
        const tb = SV.carrier.tab;
        if (ph === 'trayOut') inner += zoneR('trayOut', '', 'Tab of the processor tray: hold it and slide the tray out of the top of the frame', tb.x - 6, tb.y - 6, tb.w + 12, tb.h + 12, 8);
        else if (ph === 'trayIn') inner += zoneR('trayIn', '', c.hand ? 'Rail frame: slide the new processor tray in from the top until it is firmly seated' : 'Rail frame: empty. Take the new processor tray from the kit first', f.x, f.y, f.w, f.h, 6);
        else if (ph === 'frameDown') inner += zoneR('frameDown', '', 'Rail frame: push it down until the blue latches lock', f.x, f.y, f.w, f.h, 6);
      }
      g += standG(f.hinge, th, inner, from, aFr);
    }
    // the force plate: flat over the frame, or standing up on its front hinge
    if (c.plate === 'down' && aPl >= 0.7) g += plateArt(c);
    else {
      const th = c.plate === 'up' ? 100 : 0, from = aPl < 0.7 ? (c.plate === 'up' ? 0 : 100) : undefined, p = SV.plate;
      let inner = plateArt(c) + shadeArt(p.x, p.y, p.w, p.h, th);
      if (c.plate === 'up' && ph === 'fpClose') inner += zoneR('plateClose', '', 'Force plate: lower it over the processor', p.x, p.y, p.w, p.h, 6);
      g += standG(p.hinge, th, inner, from, aPl);
    }
    if (c.press && c.plate === 'down') g += fingerArt();
    // the heat sink: on, coming down, lifting off, or on the bench
    const hs = hsArt(c, c.hs.on && !c.cool && removing(c));
    if (c.hs.on && aHP < 0.8) g += lift(hs, 450, 295, aHP, false);
    else if (c.hs.on) g += hs;
    else if (aHL < 0.8) g += lift(hs, 450, 295, aHL, true);
    // the clickable parts of this phase, with the state of every screw
    const screws = (pts, states, txt, act, ccw, beside = true) => pts.forEach((p, k) => { const [x, y] = p, st = states[k], ta = fxAge(act + ':' + k); g += turnArt(x, y, ta, ccw, c.tool) + (beside ? stateTxt(x, y, txt(st), SC_COL[st]) : '') + zoneC(act, k, `Screw ${k + 1}: ${txt(st) || 'done'}`, x, y, 20); });
    const fpLine = () => g += TXT(450, 586, 'Force plate screws: ' + c.fp.map((x, k) => `${k + 1} ${x ? 'tight' : 'loose'}`).join('  ·  '), 'font:600 11px var(--font);fill:#C4D3DE');
    if (ph === 'hsOff') {
      const all = c.hs.screws.every(x => x === 2), F = SV.hs.fins;
      g += zoneR('hsLift', '', all ? 'Heat sink: lift it from the system' : 'Heat sink: loosen all four captive screws first', F.x, F.y, F.w, F.h, 4);
      screws(SV.hs.screws, c.hs.screws, st => all ? '' : SCREW_TXT[st], 'hsScrew', true);
    } else if (ph === 'clean') { if (!c.lidClean) { const i = SV.ihs; g += zoneR('lidClean', '', 'Old processor lid: wipe the old grease off with a lint-free cloth', i.x, i.y, i.w, i.h, 4); } }
    else if (ph === 'fpOpen') { screws(SV.fpScrews, c.fp.map(x => x ? 0 : 2), st => st ? 'loose' : 'tight', 'fpScrew', true, false); fpLine(); }
    else if (ph === 'fpClose' && c.plate === 'down') { screws(SV.fpScrews, c.fp.map(x => x ? 2 : 0), st => st ? 'tight' : 'loose', 'fpScrew', false, false); fpLine(); }
    else if (ph === 'frameUp') SV.latches.forEach(([x, y], k) => g += zoneR('latch', k ? 'r' : 'l', `Blue latch, ${k ? 'right' : 'left'}: ${c.latch[k ? 'r' : 'l'] ? 'lifted' : 'lift it to release the rail frame'}`, x - 6, y - 12, 38, 38, 6));
    else if (ph === 'grease' && c.hs.grease === 0) {
      const i = SV.ihs;
      if (Sim.guide) { const d = greaseIdeal().map((p, k) => (k ? 'L' : 'M') + p.join(' ')).join(''); g += `<g pointer-events="none"><path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" opacity=".7"/><path d="${d}" fill="none" stroke="#1F6FB2" stroke-width="3" stroke-dasharray="7 4" stroke-linecap="round"/></g>`; }   // the pattern to follow: guidance only
      g += `<g${hot('grease', '', 'Processor lid: hold the mouse button and draw a thin spiral of grease, from the centre outward')}><rect x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}" rx="4" class="zone" style="touch-action:none;cursor:crosshair"/></g>`;
    }
    else if (ph === 'hsOn') {
      if (!c.hs.on) { const b = SV.base; g += zoneR('hsPlace', '', 'Processor plate: lower the heat sink onto it, its captive screws over the standoffs', b.x - 30, b.y - 30, b.w + 60, b.h + 60, 8); }
      else screws(SV.hs.screws, c.hs.screws, st => ['loose', 'three turns', 'tight'][st], 'hsScrew', false);
    }
    if (ph === 'fpOpen' || (ph === 'fpClose' && c.plate === 'down')) g += zoneR('press', '', c.press ? 'Finger on the force plate: holding it down. Click to let go' : 'Force plate, rear edge: hold it down with a finger', 482, 128, 96, 50, 5);
    if (c.hand) g += handTray(c);
    g += TXT(450, 606, PHASE_TITLE[ph] || 'Processor socket', 'font:500 13px var(--font);fill:#EAF2F7') + toolRow(c, 628);
    return frame('Processor socket, close-up from above', g, 748);
  },
  actions(t) {
    if (!t.cpu) return [];
    const c = t.cpu, ph = cpuPhase(t), a = [];
    if (!c.esd) a.push(button('Put on the ESD wrist strap', 'esd', '', true));
    if (ph === 'hsOff' && !c.cool) a.push(button('Wait for the heat sink to cool', 'cool', '', true));
    if (ph === 'trayIn' && !c.hand) a.push(button('Take the new processor tray from the kit', 'trayPick', '', true));
    if (ph === 'clean' && !c.hs.clean) a.push(button('Wipe the old grease off the heat sink base (lint-free cloth)', 'hsClean', '', true));
    if (ph === 'grease' && c.hs.grease === -1) a.push(button('Wipe the grease off the lid and start again (lint-free cloth)', 'greaseWipe', '', true));
    return a;
  },
  tray(t) { return kitHtml(t); }
});

/* ---- Rear of the rack in perspective: Zero-U PDUs A and B in the left side channel, the vertical lacing bar, the
   top-of-rack switches (SW01 data switch A at U27, SW02 data switch B at U26, MGT01 management switch at U25), and the
   Dell PowerEdge R6515 rear panel photo (FIGS.rearPhoto) in U20.
   Dell ISM (pages 13, 20, 92–93):
   - Table 6 (page 13): Serial, iDRAC dedicated port, Onboard Gb 1 & Gb 2, USB 3.0 (2), VGA, System ID button, PSU 1 & PSU 2.
   - Page 20 ("Setting up the system"): connect peripherals/network cables first, connect electrical outlets last, then power on.
   - Page 93 ("Installing a power supply unit", CAUTION): when connecting the power cable to the PSU, secure the cable to the
     PSU handle with the hook-and-loop strap; the translucent PSU handle lights green when AC power is healthy. ---- */
const CW = { S: 1.35, F: 1700, YE: -300, CX: 548, Y40: 370, SB: 614 };
CW.EY = CW.Y40 + CW.YE * CW.S * CW.F / (CW.F + 40);
const cwk = z => CW.S * CW.F / (CW.F + z);
const cwp = (x, y, z) => { const k = cwk(z); return [CW.CX + x * k, CW.EY + (y - CW.YE) * k]; };
const cwT = z => `translate(${CW.CX} ${CW.EY.toFixed(2)}) scale(${cwk(z).toFixed(5)}) translate(0 ${-CW.YE})`;
const f2 = n => (+n).toFixed(2);
const q2 = p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const dPoly = P => 'M' + P.map(q2).join('L') + 'Z';
const dLine = P => 'M' + P.map(q2).join('L');

const CG = {
  zs: 40, travel: 300, half: 214,
  pduZ: -28, pdu: { pduA: [-382, -338], pduB: [-332, -288] }, lace: [-279, -259], LX: -269,
  torZ: -5, torTop: -249, U: 44.45
};
const OUTLETS = [4, 5, 6, 7, 8, 9, 10, 11];
const outletY = n => 40 - (n - 7) * CG.U;
const torTop = u => CG.torTop + (27 - u) * CG.U;
const TORS = {
  dataA: { u: 27, port: 22, tag: 'SW01', name: 'Data switch A' },
  dataB: { u: 26, port: 22, tag: 'SW02', name: 'Data switch B' },
  mgmt:  { u: 25, port: 13, tag: 'MGT01', name: 'Management switch' }
};
const rjXY = (u, n) => { const c = (n - 1) >> 1; return [-208 + c * 14.1 + Math.floor(c / 6) * 5 + 6.3, torTop(u) + ((n - 1) % 2 ? 31 : 13)]; };

// Map FIGS.rearPhoto (1520 x 290; chassis face x: 12..1460, y: 98..236) to U20 world coordinates (x: -214..214, y: 0..48)
const PH_SX = 428 / 1448, PH_SY = 48 / 138;
const PH = (px, py) => [-214 + (px - 12) * PH_SX, (py - 98) * PH_SY];
const CPORT = {
  vga:    PH(143, 196),
  idrac:  PH(245, 134),
  usb:    PH(245, 188),
  gb1:    PH(321, 145),
  gb2:    PH(321, 196),
  psu1:   PH(1168, 168),
  strap1: PH(1232, 187),
  psu2:   PH(1348, 168),
  strap2: PH(1412, 187)
};

const CAB = {
  idrac: { name: 'iDRAC', far: 'MGT01 port 13', dest: 'mgmt', port: 13, ifName: 'Gi0/13', kind: 'mgmt', w: 5.2, len: 34, hang: [-18, 42], role: 'OOB-MGMT', desc: 'iDRAC9 dedicated port (1 Gb RJ-45)', cable: 'Cat 6 UTP patch cord (purple), RJ-45' },
  gb1:   { name: 'Gb 1',  far: 'SW01 port 22',  dest: 'dataA', port: 22, ifName: 'Gi0/22', kind: 'data', w: 5.2, len: 34, hang: [-6, 46],  role: 'DATA-A',   desc: 'Onboard LOM port 1 (1 Gb RJ-45)',    cable: 'Cat 6 UTP patch cord (blue), RJ-45' },
  gb2:   { name: 'Gb 2',  far: 'SW02 port 22',  dest: 'dataB', port: 22, ifName: 'Gi0/22', kind: 'data', w: 5.2, len: 34, hang: [14, 42],  role: 'DATA-B',   desc: 'Onboard LOM port 2 (1 Gb RJ-45)',    cable: 'Cat 6 UTP patch cord (blue), RJ-45' },
  psu1:  { name: 'PSU 1 cord', far: 'PDU A outlet 8', dest: 'pduA', port: 8, ifName: 'outlet 8', kind: 'power', w: 7.0, len: 46, hang: [-14, 44], role: 'PWR-A', desc: 'PSU 1 power inlet (IEC C14)', cable: 'IEC C13 to C14 power cord + PSU handle strap' },
  psu2:  { name: 'PSU 2 cord', far: 'PDU B outlet 8', dest: 'pduB', port: 8, ifName: 'outlet 8', kind: 'power', w: 7.0, len: 46, hang: [14, 44],  role: 'PWR-B', desc: 'PSU 2 power inlet (IEC C14)', cable: 'IEC C13 to C14 power cord + PSU handle strap' }
};
const CABS = ['psu1', 'psu2', 'gb1', 'gb2', 'idrac'];
const CAB_ORDER = ['idrac', 'gb1', 'gb2', 'psu1', 'psu2'];
const CKIND = {
  power: { col: '#1C1E21', edge: '#000000', hi: '#5E6670', name: 'IEC C13 to C14 power cord' },
  data:  { col: '#3B82C4', edge: '#183C5E', hi: '#8CC8FF', name: 'Cat 6 UTP patch cord (data)' },
  mgmt:  { col: '#9B6EE3', edge: '#462878', hi: '#DFC9FF', name: 'Cat 6 UTP patch cord (iDRAC)' },
  cat6:  { col: '#D3CAB3', edge: '#7E7663', hi: '#FAF6EC', name: 'Cat 6 UTP patch cord' }
};

const cabDest = (t, k) => (t.cpu && t.cpu.cabTo[k]) || CAB[k].dest;
const cabN = (t, k) => (t.cpu && t.cpu.cabPort[k]) || CAB[k].port;
const cabAt = (t, dk, n, but) => CABS.find(k => k !== but && t.cpu && t.cpu.cabTo[k] === dk && t.cpu.cabPort[k] === n);
function destAt(dk, n) {
  if (CG.pdu[dk]) { const [a, b] = CG.pdu[dk]; return [(a + b) / 2, outletY(n), CG.pduZ]; }
  const s = TORS[dk]; return [...rjXY(s.u, n), CG.torZ];
}
const destTag = (dk, n) => CG.pdu[dk] ? `${dk === 'pduA' ? 'PDUA' : 'PDUB'}-${String(n).padStart(2, '0')}` : `${TORS[dk].tag}-Gi0/${n}`;

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
const P3 = p => cwp(p[0], p[1], p[2]);
const cquad = (pts, fill, extra = '') => `<path d="${dPoly(pts.map(P3))}" fill="${fill}"${extra}/>`;
function box3(b0, c, extra = '') {
  const [x0, x1, y0, y1, zf, zn] = b0;
  let s = '';
  if (y0 > CW.YE) s += cquad([[x0, y0, zf], [x1, y0, zf], [x1, y0, zn], [x0, y0, zn]], c.top);
  if (x0 > 0) s += cquad([[x0, y0, zf], [x0, y0, zn], [x0, y1, zn], [x0, y1, zf]], c.side);
  if (x1 < 0) s += cquad([[x1, y0, zf], [x1, y0, zn], [x1, y1, zn], [x1, y1, zf]], c.side);
  s += cquad([[x0, y0, zn], [x1, y0, zn], [x1, y1, zn], [x0, y1, zn]], c.front, extra);
  return s;
}
const CC = {
  plug: { top: '#3A3E44', side: '#24272B', front: '#141618' },
  boot: { top: '#4A4E54', side: '#1E2125', front: '#2C3035' },
  rj:   { top: '#E9F0F3', side: '#9AA9B1', front: '#C7D3D9' },
  data: { top: '#5BA3E0', side: '#265985', front: '#3B82C4' },
  mgmt: { top: '#B58DF2', side: '#5A3791', front: '#9B6EE3' },
  cat6: { top: '#EEE7D5', side: '#A39A83', front: '#D6CDB6' }
};
function plugAt(kind, x, y, z) {
  if (kind === 'power') return box3([x - 8.5, x + 8.5, y - 11, y + 11, z, z - 34], CC.plug) + box3([x - 5, x + 5, y - 5, y + 5, z - 34, z - 46], CC.boot);
  const bootC = CC[kind] || CC.cat6;
  return box3([x - 5.4, x + 5.4, y - 4, y + 4, z, z - 12], CC.rj) + box3([x - 4.8, x + 4.8, y - 4.4, y + 4.4, z - 12, z - 32], bootC);
}
function dangleEnd(kind, x, y, z, labelTxt) {
  const h = kind === 'power' ? [8.5, 11] : [5.4, 4.2], c = kind === 'power' ? CC.plug : CC[kind] || CC.rj;
  let s = box3([x - h[0], x + h[0], y - 24, y, z + h[1], z - h[1]], c);
  const [px, py] = cwp(x, y + 12, z);
  s += `<g pointer-events="none"><rect x="${f2(px - 36)}" y="${f2(py - 7)}" width="72" height="14" rx="3" fill="#F4F1E6" stroke="#8C8576" stroke-width=".8"/><text x="${f2(px)}" y="${f2(py + 3)}" text-anchor="middle" style="font:700 8.2px var(--font);fill:#15181B">${esc(labelTxt)}</text></g>`;
  return s;
}
function cabStroke(pts, kind, w, op = 1) {
  const c = CKIND[kind], d = dLine(crSample(pts.map(P3), 7)), a = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const s = `<path d="${d}" ${a} stroke="${c.edge}" stroke-width="${f2(w + 1.3)}"/><path d="${d}" ${a} stroke="${c.col}" stroke-width="${f2(w)}"/><path d="${d}" ${a} stroke="${c.hi}" stroke-width="${f2(Math.max(0.6, w * 0.26))}" opacity=".5" transform="translate(0 ${f2(-w * 0.22)})"/>`;
  return op < 1 ? `<g opacity="${op}">${s}</g>` : s;
}
function cabPts3D(t, k, zs) {
  const c = t.cpu, sp = CAB[k], [px, py] = CPORT[k], dk = cabDest(t, k), n = cabN(t, k), [qx, qy] = destAt(dk, n), pdu = isPdu(dk);
  const P = [];
  if (c.cabOff[k]) {
    const [ox, oy] = sp.hang;
    P.push([px + ox, py + oy, zs - 56], [px + ox, py + oy + 22, zs - 64]);
  } else {
    P.push([px, py, zs - sp.len], [px + (k.startsWith('psu') ? 12 : 0), py + 6, zs - sp.len - 18]);
    if (k === 'psu1' && c.strap.psu1) P.push([CPORT.strap1[0] - 4, CPORT.strap1[1] + 4, zs - 26]);
    if (k === 'psu2' && c.strap.psu2) P.push([CPORT.strap2[0] - 4, CPORT.strap2[1] + 4, zs - 26]);
  }
  const laneY = k === 'psu2' ? 76 : k === 'psu1' ? 68 : k === 'gb2' ? 58 : k === 'gb1' ? 52 : 46;
  P.push([px * 0.45 - 90, laneY, -78], [CG.LX + 8, laneY - 4, -64]);
  if (pdu) {
    P.push([CG.LX, qy + 34, -58], [qx + 10, qy + 38, CG.pduZ - 60], [qx + 1, qy + 6, CG.pduZ - 50], [qx, qy, CG.pduZ - 44]);
  } else {
    const ty = qy + 27;
    P.push([CG.LX, -36, -50], [CG.LX, ty + 24, -46], [-240, ty + 4, -54], [qx - 22, ty, -60], [qx - 2, qy + 9, -54], [qx, qy, CG.torZ - sp.len]);
  }
  return P;
}

const REAR_ROWS = [27, 26, 25, 21, 20, 19, 18];
const uTopR = u => u >= 25 ? torTop(u) : -(u - 20) * CG.U;
function rackBackR(t) {
  const [lx] = cwp(-241, 0, 0), [rx] = cwp(241, 0, 0);
  let g = `<rect x="10" y="32" width="880" height="${CW.SB - 32}" rx="8" fill="#10161B"/>`;
  g += `<rect x="${f2(lx)}" y="32" width="${f2(rx - lx)}" height="${CW.SB - 32}" fill="#0A0E12"/>`;
  [-233, 233].forEach(x => { const [a] = cwp(x - 8, 0, 760), [b] = cwp(x + 8, 0, 760); g += `<rect x="${f2(a)}" y="32" width="${f2(b - a)}" height="${CW.SB - 32}" fill="#161C22"/>`; });
  [-1, 1].forEach(sx => {
    const xi = sx * 219, xo = sx * 226;
    g += `<path d="${dPoly([[xi, 18, -80], [xi, 18, 760], [xi, 42, 760], [xi, 42, -80]].map(P3))}" fill="#5E666E"/><path d="${dPoly([[xo, 18, -80], [xo, 18, 760], [xi, 18, 760], [xi, 18, -80]].map(P3))}" fill="#9AA2A9"/>`;
  });
  return g;
}
function postSvgR(sx) {
  const x0 = sx < 0 ? -241 : 225, x1 = x0 + 16;
  let s = `<rect x="${x0}" y="-300" width="16" height="520" fill="#454B52"/><rect x="${sx < 0 ? x1 - 2 : x0}" y="-300" width="2" height="520" fill="#5C636B"/>`;
  REAR_ROWS.forEach(u => {
    const y0 = uTopR(u);
    [6.35, 22.25, 38.1].forEach(o => { s += `<rect x="${x0 + 3.5}" y="${f2(y0 + o - 4.75)}" width="9.5" height="9.5" fill="#0D1013"/>`; });
    s += `<text x="${x0 + 8}" y="${f2(y0 + 31.2)}" text-anchor="middle" style="font:700 5.4px var(--font);fill:${u === WO.u ? '#FFD27A' : '#C9D0D6'}">${u}</text>`;
  });
  return `<g transform="${cwT(0)}">${s}</g>`;
}
function pduAmpsR(t, dk) {
  const c = t.cpu;
  const feeds = ['psu1', 'psu2'].filter(k => c.cabTo[k] === dk && !c.cabOff[k]), all = ['psu1', 'psu2'].filter(k => c.cabTo[k] && !c.cabOff[k]).length;
  const base = dk === 'pduA' ? 3.4 : 3.1;
  const ours = !feeds.length || !all ? 0 : (c.power === 'on' ? 1.8 : 0.2) * feeds.length / all;
  return (base + ours).toFixed(1) + ' A';
}
function pduSvgR(t, dk) {
  const [x0, x1] = CG.pdu[dk], A = dk === 'pduA', cx = (x0 + x1) / 2, col = A ? '#D8462E' : '#2F78D6';
  const amps = pduAmpsR(t, dk);
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
function laceSvgR() {
  const [a, b] = CG.lace;
  let s = `<rect x="${a}" y="-300" width="${b - a}" height="520" fill="#3F464D"/><rect x="${a}" y="-300" width="2" height="520" fill="#59616A"/>`;
  for (let y = -290; y < 220; y += CG.U / 2) s += `<rect x="${a - 5}" y="${f2(y)}" width="${b - a + 10}" height="3.2" rx="1.5" fill="#6A737C"/>`;
  return `<g transform="${cwT(-40)}">${s}</g>`;
}
function decorSvgR() {
  let s = '';
  Object.keys(CG.pdu).forEach((dk, j) => {
    const [a, b] = CG.pdu[dk], cx = (a + b) / 2, side = j ? b + 5 : a - 5;
    [10, 11, 9].forEach((n, i) => {
      const y = outletY(n);
      s += plugAt('power', cx, y, CG.pduZ) + cabStroke([[cx, y, CG.pduZ - 50], [cx + (side - cx) * 0.5, y + 16, -84 - i * 4], [side + (j ? i * 2 : -i * 2), y - 20, -66 - i * 4], [side + (j ? i * 2 : -i * 2), -330, -66 - i * 4]], 'power', 6.2, 0.88);
    });
  });
  return s;
}
const cabLinkR = (t, k) => {
  const c = t.cpu; if (!c || !cabRight(t, k)) return false;
  if (k === 'idrac') return c.cab.psu1 || c.cab.psu2;
  return c.power === 'on';
};
const linkUpR = (t, dk, n) => ['idrac', 'gb1', 'gb2'].some(k => t.cpu.cabTo[k] === dk && t.cpu.cabPort[k] === n && cabLinkR(t, k));
function torSvgR(t, dk) {
  const s = TORS[dk], y0 = torTop(s.u), y1 = y0 + CG.U - 0.8, busy = DBUSY[dk];
  let g = `<rect x="-241" y="${y0 + 0.4}" width="482" height="${CG.U - 0.8}" fill="#4B525A"/><rect x="-219" y="${y0 + 0.4}" width="438" height="${CG.U - 0.8}" fill="${dk === 'mgmt' ? '#30353C' : '#262B31'}"/><rect x="-219" y="${y0 + 0.4}" width="438" height="1.4" fill="#59616A"/>`;
  [-230, 230].forEach(x => { g += `<circle cx="${x}" cy="${y0 + 8}" r="2.6" fill="#1B1E22"/><circle cx="${x}" cy="${y1 - 8}" r="2.6" fill="#1B1E22"/>`; });
  g += `<rect x="-240.2" y="${y0 + 15.6}" width="20.4" height="10.6" rx="1" fill="#F4F1E6" stroke="#9A9583" stroke-width=".4"/><text x="-230" y="${y0 + 23}" text-anchor="middle" style="font:800 ${s.tag.length > 4 ? 4.6 : 5.2}px var(--font);fill:#15181B">${s.tag}</text>`;
  for (let n = 1; n <= 48; n++) {
    const [x, y] = rjXY(s.u, n), top = (n - 1) % 2 === 0, lit = busy.includes(n) || linkUpR(t, dk, n);
    g += `<rect x="${f2(x - 6.3)}" y="${f2(y - 5.2)}" width="12.6" height="10.4" fill="#7C858D"/><rect x="${f2(x - 5.4)}" y="${f2(y - 4.3)}" width="10.8" height="8.6" fill="#08090B"/><rect x="${f2(x - 2)}" y="${f2(y + (top ? 2.6 : -4.3))}" width="4" height="1.7" fill="#08090B"/>`;
    const ly = top ? y + 6.1 : y - 6.1, dy = top ? 1.5 : -1.5;
    g += `<path d="M${f2(x - 1.9)} ${f2(ly + dy)}H${f2(x + 1.9)}L${f2(x)} ${f2(ly)}Z" fill="${lit ? '#4EF07A' : '#1E2A22'}"${lit && busy.includes(n) ? ' class="blink"' : ''}/>`;
    g += `<text x="${f2(x)}" y="${f2(top ? y - 6.9 : y + 10.3)}" text-anchor="middle" style="font:700 4.1px var(--font);fill:#D3DAE0">${n}</text>`;
  }
  for (let c = 0; c < 4; c++) g += `<rect x="${158 + c * 14.6}" y="${y0 + 26}" width="13.2" height="8.8" fill="#A9B0B6"/><rect x="${159 + c * 14.6}" y="${y0 + 27}" width="11.2" height="6.8" fill="#07090B"/>`;
  g += `<rect x="160" y="${y0 + 7}" width="12" height="10" fill="#2F6FD6"/><text x="186" y="${y0 + 15}" style="font:600 4px var(--font);fill:#B7C0C8">CON</text>`;
  return `<g transform="${cwT(CG.torZ)}">${g}</g>`;
}
function torDecorR(dk) {
  const s = TORS[dk], busy = DBUSY[dk];
  let g = '';
  busy.forEach((n, i) => {
    const [x, y] = rjXY(s.u, n), top = (n - 1) % 2 === 0, yy = y + (top ? 9 : 7);
    const pts = [[x, y, CG.torZ - 32], [x - 3, yy, -58 - (i % 3) * 2], [-205, yy + 2, -60], [CG.LX + 4, yy + 6, -52], [CG.LX, yy + 60, -48]];
    g += plugAt('cat6', x, y, CG.torZ) + `<g style="filter:hue-rotate(${[190, 30, 0, 200][i % 4]}deg) saturate(${i % 4 === 2 ? 0.3 : 1.6})">${cabStroke(pts, 'cat6', 4.8 * 1.35, 0.68)}</g>`;
  });
  return g;
}
function breakSvgR() {
  const yT = torTop(25) + CG.U + 1, yB = -CG.U * 1 - 16;
  let top = '', bot = '';
  for (let x = -241, i = 0; x <= 241; x += 12, i++) { top += `L${x} ${f2(yT + (i % 2 ? 4 : 0))}`; bot = `L${x} ${f2(yB - (i % 2 ? 4 : 0))}` + bot; }
  return `<g transform="${cwT(0)}"><path d="M-241 ${yT}${top}L241 ${yB}${bot}Z" fill="#070A0D" stroke="#2E3A45" stroke-width="1"/><text x="0" y="${f2((yT + yB) / 2 + 2.5)}" text-anchor="middle" style="font:600 6.2px var(--font);fill:#7F8E9B">U22 to U24: Cisco UCS C240 M4 &amp; M5, cutaway</text></g>`;
}
function neighboursSvgR() {
  const z = CG.zs, h = 214, yTop21 = -CG.U - 14, yBot18 = 62;
  let a = `<rect x="${-h}" y="${yTop21}" width="${2 * h}" height="${CG.U - 2}" fill="#3B4047"/>`;
  for (let x = -200; x < 60; x += 10) for (let y = yTop21 + 8; y < yTop21 + 34; y += 7) a += `<rect x="${x}" y="${y}" width="6" height="4" rx="1" fill="#22262B"/>`;
  [80, 150].forEach(x => { a += `<rect x="${x}" y="${yTop21 + 3}" width="62" height="${CG.U - 8}" fill="#2A2E33" stroke="#565D65"/><circle cx="${x + 20}" cy="${yTop21 + 21}" r="11" fill="#1A1D21"/><rect x="${x + 44}" y="${yTop21 + 13}" width="12" height="16" fill="#0E1012"/>`; });
  a += `<text x="-195" y="${yTop21 + 24}" style="font:700 5.5px var(--font);fill:#AEB8C1">U21: Cisco UCS C220 M4</text><rect x="-214" y="${yTop21}" width="428" height="${CG.U - 2}" fill="#000" opacity=".25"/>`;
  let u = `<rect x="${-h}" y="${yBot18}" width="${2 * h}" height="${2 * CG.U - 2}" fill="#2D3136"/>`;
  for (let x = -200; x < 60; x += 12) for (let y = yBot18 + 12; y < yBot18 + 76; y += 9) u += `<rect x="${x}" y="${y}" width="8" height="5" rx="1" fill="#1C2024"/>`;
  [80, 150].forEach(x => { u += `<rect x="${x}" y="${yBot18 + 8}" width="62" height="${2 * CG.U - 18}" fill="#25292E" stroke="#4C535B"/>`; });
  u += `<text x="-195" y="${yBot18 + 48}" style="font:700 6px var(--font);fill:#9AA4AD">U18–U19: Dell EMC PowerEdge (2U)</text><rect x="-214" y="${yBot18}" width="428" height="${2 * CG.U - 2}" fill="#000" opacity=".24"/>`;
  return `<g transform="${cwT(z)}">${a}${u}</g>`;
}

function serverBodyR(zs) {
  const h = CG.half;
  let g = cquad([[-h, 0, zs], [h, 0, zs], [h, 0, zs + 420], [-h, 0, zs + 420]], '#8A939B')
    + cquad([[-h, 0, zs + 65], [h, 0, zs + 65], [h, 0, zs + 420], [-h, 0, zs + 420]], '#636C74');
  for (let x = -180; x < 180; x += 16) g += cquad([[x, 0, zs + 16], [x + 9, 0, zs + 16], [x + 9, 0, zs + 28], [x, 0, zs + 28]], '#343A40');
  [-1, 1].forEach(sx => { g += box3([sx < 0 ? -219 : 214, sx < 0 ? -214 : 219, 14, 38, zs, zs - 26], { top: '#C4CCD3', side: '#7D868E', front: '#6A7279' }); });
  return g;
}
function serverFaceR(t, zs) {
  const c = t.cpu, k0 = cwk(zs);
  const imgX = -214 - 12 * PH_SX, imgY = -98 * PH_SY, imgW = 1520 * PH_SX, imgH = 290 * PH_SY;
  let s = `<defs><clipPath id="dellRearClip"><rect x="-214" y="0" width="428" height="52" rx="1.5"/></clipPath></defs>`;
  s += `<rect x="-214" y="0" width="428" height="48.5" fill="#2A3036" stroke="#6E7780" stroke-width=".8"/>`;
  s += `<g clip-path="url(#dellRearClip)"><image href="${FIGS.rearPhoto.src}" x="${f2(imgX)}" y="${f2(imgY)}" width="${f2(imgW)}" height="${f2(imgH)}" preserveAspectRatio="none"/></g>`;
  // PSU 1 and PSU 2 illuminated status handles (Dell ISM page 93: green indicator on translucent handle when AC is connected)
  [['psu1', 1222], ['psu2', 1402]].forEach(([k, px]) => {
    const on = !!(c.cabTo[k] && !c.cabOff[k]), [hx, hy] = PH(px, 134);
    s += `<rect x="${f2(hx - 5.5)}" y="${f2(hy - 5.5)}" width="11" height="11" rx="2.5" fill="${on ? '#45D07F' : '#2C3238'}" opacity="${on ? 0.88 : 0.45}" stroke="${on ? '#A8FFCB' : '#4A525A'}" stroke-width=".7"/>`;
    if (on) s += `<circle cx="${f2(hx)}" cy="${f2(hy)}" r="7.5" fill="#45D07F" opacity=".28"/>`;
  });
  // PSU 1 and PSU 2 hook-and-loop cord retention straps on the PSU handles (Dell ISM page 93 CAUTION)
  [['psu1', 'strap1'], ['psu2', 'strap2']].forEach(([pk, sk]) => {
    const [sx, sy] = CPORT[sk], st = c.strap[pk], hasCord = !!(c.cabTo[pk] && !c.cabOff[pk]);
    const col = st ? '#45D07F' : hasCord ? '#FFB52E' : '#5C646C';
    s += `<rect x="${f2(sx - 6.5)}" y="${f2(sy - 8)}" width="13" height="16" rx="2.5" fill="${st ? '#18221D' : '#1E2226'}" fill-opacity=".75" stroke="${col}" stroke-width="${st || hasCord ? 1.5 : 0.9}"${!st && hasCord ? ' stroke-dasharray="2.5 1.8"' : ''}/>`;
    if (st) s += `<path d="M${f2(sx - 4.5)} ${f2(sy - 3)}h9M${f2(sx - 4.5)} ${f2(sy)}h9M${f2(sx - 4.5)} ${f2(sy + 3)}h9" stroke="#45D07F" stroke-width="1"/>`;
  });
  // Link & activity LEDs on iDRAC, Gb 1 and Gb 2
  [['idrac', 230, 260, 114], ['gb1', 306, 336, 126], ['gb2', 306, 336, 176]].forEach(([k, xL, xR, py]) => {
    if (!cabLinkR(t, k)) return;
    const [x1, y1] = PH(xL, py), [x2] = PH(xR, py);
    s += `<rect x="${f2(x1 - 1.5)}" y="${f2(y1 - 1)}" width="3" height="2" fill="#4EF07A"/><rect x="${f2(x2 - 1.5)}" y="${f2(y1 - 1)}" width="3" height="2" fill="#FFB52E" class="blink"/>`;
  });
  // Highlight selected server port when routing a cable to a switch port or PDU outlet
  if (c.cabSel && CPORT[c.cabSel]) {
    const [x, y] = CPORT[c.cabSel], pw = c.cabSel.startsWith('psu');
    s += `<rect x="${f2(x - (pw ? 11 : 8.5))}" y="${f2(y - (pw ? 13 : 8.5))}" width="${pw ? 22 : 17}" height="${pw ? 26 : 17}" rx="3" fill="none" stroke="#45D07F" stroke-width="2"/>`;
  }
  return `<g transform="translate(${CW.CX} ${CW.EY.toFixed(2)}) scale(${k0.toFixed(5)}) translate(0 ${-CW.YE})">${s}</g>`;
}
function serverPlugsR(t, zs) {
  const c = t.cpu;
  let g = '';
  CAB_ORDER.forEach(k => {
    if (!c.cabTo[k]) return;
    const [x, y] = CPORT[k], sp = CAB[k];
    if (c.cabOff[k]) g += dangleEnd(sp.kind, x + sp.hang[0], y + sp.hang[1], zs - 56, portTxtD(c.cabTo[k], c.cabPort[k]));
    else g += plugAt(sp.kind, x, y, zs);
  });
  return g;
}
function labelsSvgR(t, zs) {
  const c = t.cpu; if (!c.labeled) return '';
  let g = '';
  CAB_ORDER.forEach(k => {
    if (!c.cabTo[k] || c.cabOff[k]) return;
    const S = crSample(cabPts3D(t, k, zs).map(P3), 7);
    [S[Math.min(4, S.length - 1)], S[Math.max(0, S.length - 5)]].forEach(p => {
      g += `<g pointer-events="none" transform="translate(${f2(p[0])} ${f2(p[1])})"><rect x="-4" y="-5" width="16" height="10" rx="1.5" fill="#FBFBF7" stroke="#8E959B" stroke-width=".7"/><path d="M-1 -2h10M-1 1h8" stroke="#5B636A" stroke-width=".9"/></g>`;
    });
  });
  return g;
}
const PTAG_D = {
  vga:   ['VGA',   -28, -24, '#7CC4FF'],
  usb:   ['USB 3.0', -28, 30, '#7CC4FF'],
  idrac: ['iDRAC',  0,  -26, '#FFE3A8'],
  gb1:   ['Gb 1',   34, -26, '#FFE3A8'],
  gb2:   ['Gb 2',   34,  30, '#FFE3A8'],
  psu1:  ['PSU 1', -24, -26, '#FFE3A8'],
  psu2:  ['PSU 2',  18, -26, '#FFE3A8']
};
function portTagsR(t, zs) {
  const c = t.cpu;
  let g = '<g pointer-events="none">';
  Object.keys(PTAG_D).forEach(k => {
    const [nm, dx, dy, defCol] = PTAG_D[k], [x, y] = cwp(...CPORT[k], zs), tx = x + dx, ty = y + dy;
    const sel = c.cabSel === k, conn = CAB[k] && c.cab[k], w = nm.length * 6.2 + 12;
    const strokeC = sel ? '#45D07F' : conn ? '#45D07F' : defCol;
    const textC = sel ? '#7CF0A8' : conn ? '#A8FFCB' : defCol;
    g += `<path d="M${f2(x)} ${f2(y + (dy < 0 ? -9 : 9))}L${f2(tx)} ${f2(ty)}" stroke="${strokeC}" stroke-width="1.2" opacity=".85"/>`;
    g += `<rect x="${f2(tx - w / 2)}" y="${f2(ty - 8)}" width="${f2(w)}" height="15" rx="4" fill="#14202B" stroke="${strokeC}" stroke-width="1.2"/><text x="${f2(tx)}" y="${f2(ty + 2.8)}" text-anchor="middle" style="font:700 9.5px var(--font);fill:${textC}">${nm}</text>`;
  });
  // Strap status callout below PSU 1 and PSU 2 whenever a power cord is plugged in
  [['psu1', 'strap1', 'PSU 1 strap', -18], ['psu2', 'strap2', 'PSU 2 strap', 24]].forEach(([pk, sk, lbl, dx]) => {
    if (!c.cabTo[pk] || c.cabOff[pk]) return;
    const on = c.strap[pk], [x, y] = cwp(...CPORT[sk], zs), tx = x + dx, ty = y + 32, col = on ? '#45D07F' : '#FFB52E';
    g += `<path d="M${f2(x)} ${f2(y + 11)}L${f2(tx)} ${f2(ty - 8)}" stroke="${col}" stroke-width="1.1" opacity=".85"/>`;
    g += `<text x="${f2(tx)}" y="${f2(ty)}" text-anchor="middle" style="font:700 9.5px var(--font);fill:${col};paint-order:stroke;stroke:#0A0E12;stroke-width:3px">${lbl}: ${on ? 'fastened' : 'open'}</text>`;
  });
  return g + '</g>';
}

function rearSceneD(t) {
  const c = t.cpu, zs = CG.zs + (t.rack.pos === 'out' ? CG.travel : 0);
  let g = rackBackR(t) + neighboursSvgR() + breakSvgR() + postSvgR(-1) + postSvgR(1);
  g += pduSvgR(t, 'pduA') + pduSvgR(t, 'pduB') + laceSvgR() + decorSvgR();
  ['dataA', 'dataB', 'mgmt'].forEach(dk => { g += torSvgR(t, dk); });
  g += torDecorR('mgmt') + torDecorR('dataB') + torDecorR('dataA');
  g += serverBodyR(zs) + serverFaceR(t, zs);
  // Far-end plugs in switch ports and PDU outlets
  CAB_ORDER.forEach(k => {
    if (!c.cabTo[k]) return;
    const dk = c.cabTo[k], n = c.cabPort[k], [x, y] = destAt(dk, n);
    g += plugAt(CAB[k].kind, x, y, isPdu(dk) ? CG.pduZ : CG.torZ);
  });
  // Red dashed ring around any far end plugged into the wrong switch port or PDU outlet
  CAB_ORDER.forEach(k => {
    if (!cabWrong(t, k)) return;
    const dk = c.cabTo[k], n = c.cabPort[k], [x, y, z] = destAt(dk, n), [px, py] = cwp(x, y, z - 18), r = isPdu(dk) ? 24 : 15;
    g += `<circle cx="${f2(px)}" cy="${f2(py)}" r="${r}" fill="#FF5A4E" fill-opacity=".12" stroke="#FF5A4E" stroke-width="2.4" stroke-dasharray="5 3" pointer-events="none"/>`;
  });
  // Cables from the server (or hanging beside the port when unplugged at the server) to the switches and PDUs
  CAB_ORDER.forEach(k => {
    if (!c.cabTo[k]) return;
    g += cabStroke(cabPts3D(t, k, zs), CAB[k].kind, CAB[k].w * 1.32);
  });
  g += serverPlugsR(t, zs) + labelsSvgR(t, zs) + portTagsR(t, zs);
  if (t.rack.pos === 'out') {
    const [x, y] = cwp(0, -14, zs);
    g += `<text x="${f2(x)}" y="${f2(y)}" text-anchor="middle" pointer-events="none" style="font:700 11px var(--font);fill:#FFD27A;paint-order:stroke;stroke:#0A0E12;stroke-width:3px">Server slid out to the service position</text>`;
  }
  return g;
}

function rearZonesD(t) {
  const c = t.cpu, zs = CG.zs + (t.rack.pos === 'out' ? CG.travel : 0);
  let g = '';
  const zr = (act, arg, label, [x0, y0, x1, y1], rx = 3) => `<g${hot(act, arg, label)}><rect x="${f2(Math.min(x0, x1))}" y="${f2(Math.min(y0, y1))}" width="${f2(Math.abs(x1 - x0))}" height="${f2(Math.abs(y1 - y0))}" rx="${rx}" class="zone"/></g>`;
  const box = (x0, y0, x1, y1, z) => { const a = cwp(x0, y0, z), b = cwp(x1, y1, z); return [a[0], a[1], b[0], b[1]]; };
  const dz = (dk, n, bx, what) => {
    const [x0, y0, x1, y1] = bx, who = cabAt(t, dk, n), busy = DBUSY[dk].includes(n), tip = portTxtD(dk, n);
    const st = who ? `${CAB[who].name} is connected here` : busy ? 'in use by another system' : 'free';
    const w = tip.length * 6.3 + 16, cx = Math.min(Math.max((x0 + x1) / 2, w / 2 + 14), 886 - w / 2), up = Math.min(y0, y1) - 5, ty = up - 19 < 34 ? Math.max(y0, y1) + 24 : up;
    return `<g${hot('cabDest', `${dk}:${n}`, `${tip} (${what}): ${st}`)}><rect x="${f2(Math.min(x0, x1))}" y="${f2(Math.min(y0, y1))}" width="${f2(Math.abs(x1 - x0))}" height="${f2(Math.abs(y1 - y0))}" rx="2" class="zone"/>`
      + `<g class="ptip"><rect x="${f2(cx - w / 2)}" y="${f2(ty - 19)}" width="${f2(w)}" height="19" rx="5" fill="#0E1620" stroke="${who ? '#7CC4FF' : busy ? '#8E99A3' : '#FFD27A'}" stroke-width="1.3"/><text x="${f2(cx)}" y="${f2(ty - 5.6)}" text-anchor="middle" style="font:800 11.5px var(--font);fill:#FFE3A8">${esc(tip)}</text></g></g>`;
  };
  Object.keys(CG.pdu).forEach(dk => { const [a, b] = CG.pdu[dk]; OUTLETS.forEach(n => { g += dz(dk, n, box(a, outletY(n) - 20, b, outletY(n) + 20, CG.pduZ), 'C13 outlet, 230 V'); }); });
  ['dataA', 'dataB', 'mgmt'].forEach(dk => {
    const s = TORS[dk], y0 = torTop(s.u), hw = 7.05;
    for (let n = 1; n <= 48; n++) { const [x] = rjXY(s.u, n), top = (n - 1) % 2 === 0; g += dz(dk, n, box(x - hw, y0 + (top ? 3.6 : 22), x + hw, y0 + (top ? 22 : 41), CG.torZ), `${ifNameD(dk, n)}, 1 Gb RJ-45`); }
  });
  const pz = (act, arg, pk, w, h, label) => { const [x, y] = CPORT[pk], a = cwp(x - w, y - h, zs), b = cwp(x + w, y + h, zs); return zr(act, arg, label, [a[0], a[1], b[0], b[1]], 3); };
  const statusOf = k => c.cabOff[k] ? `: unplugged at the server (hanging beside port, far end in ${portTxtD(c.cabTo[k], c.cabPort[k])}); click to plug in`
    : c.cabTo[k] ? `: connected to ${portTxtD(c.cabTo[k], c.cabPort[k])}; click to unplug at the server`
    : `: empty (work order: ${CAB[k].far}); click to select`;
  g += pz('cab', 'idrac', 'idrac', 7.5, 6.5, `iDRAC dedicated port (1 Gb RJ-45)${statusOf('idrac')}`);
  g += pz('cab', 'gb1',   'gb1',   7.5, 6.5, `Gb 1 onboard Ethernet port 1 (1 Gb RJ-45)${statusOf('gb1')}`);
  g += pz('cab', 'gb2',   'gb2',   7.5, 6.5, `Gb 2 onboard Ethernet port 2 (1 Gb RJ-45)${statusOf('gb2')}`);
  g += pz('cab', 'psu1',  'psu1',  8.5, 9.5, `PSU 1 power inlet (IEC C14)${statusOf('psu1')}`);
  g += pz('cab', 'psu2',  'psu2',  8.5, 9.5, `PSU 2 power inlet (IEC C14)${statusOf('psu2')}`);
  g += pz('psuStrap', 'psu1', 'strap1', 6.5, 8.5, `PSU 1 handle cable retention strap (Dell ISM page 93): ${c.strap.psu1 ? 'fastened around the power cord' : 'open, click to secure the PSU 1 power cord'}`);
  g += pz('psuStrap', 'psu2', 'strap2', 6.5, 8.5, `PSU 2 handle cable retention strap (Dell ISM page 93): ${c.strap.psu2 ? 'fastened around the power cord' : 'open, click to secure the PSU 2 power cord'}`);
  g += pz('rearPort', 'vga',  'vga', 8.5, 6.5, 'Rear VGA port (15-pin DB-15, Dell ISM Table 6 item 10): for local crash-cart monitor and iDRAC setup');
  g += pz('rearPort', 'usb',  'usb', 7.5, 7.5, 'Rear USB 3.0 ports (2x SuperSpeed USB, Dell ISM Table 6 item 9): for local USB keyboard/mouse and iDRAC setup');
  return g;
}

function schedD(t) {
  const c = t.cpu, u = t.rack.u || WO.u;
  const rows = CAB_ORDER.map(k => {
    const sp = CAB[k], pw = sp.kind === 'power';
    const st = cabWrong(t, k) ? `<span style="color:var(--red);font-weight:700">&#10007; in ${esc(portTxtD(c.cabTo[k], c.cabPort[k]))}</span>`
      : c.cab[k] ? `<span style="color:var(--touch);font-weight:700">&#10003; connected${pw ? (c.strap[k] ? ', strap fastened' : ', <span style="color:var(--amber,#F0A93B)">strap open</span>') : ''}${c.labeled ? ', labelled' : ''}</span>`
      : c.cabOff[k] ? `<span style="color:var(--amber, #F0A93B)">unplugged at the server (far end in ${esc(portTxtD(c.cabTo[k], c.cabPort[k]))})</span>`
      : c.cabSel === k ? `<span style="color:var(--touch);font-weight:700">selected — click ${esc(sp.far)}</span>`
      : '<span style="color:var(--muted)">not connected</span>';
    return `<tr><td><b>${sp.role}</b></td><td>${esc(sp.name)} <small style="color:var(--muted)">(${esc(sp.desc)})</small></td><td><b>${esc(sp.far)}</b></td><td>${pw ? 'C13 outlet, 230 V' : esc(sp.ifName + ', 1 Gb RJ-45')}</td><td>${esc(sp.cable)}</td><td>${st}</td></tr>`;
  }).join('');
  return `<div class="csched"><h3>Cable schedule (work order): ${WO.rack}-U${String(u).padStart(2, '0')}, ${PROFILE.name} (Service Tag ${WO.tag})</h3><table><tr><th>Role</th><th>From (server)</th><th>To</th><th>Interface</th><th>Cable &amp; Dell Procedure</th><th>Now</th></tr>${rows}</table><p class="cap" style="margin:6px 0 0">Switch ports: odd numbers on the top row, even numbers on the bottom row, counted from the left. PDU outlets are numbered beside each outlet. Hover any switch port or PDU outlet to inspect its number.</p></div>`;
}

(() => {
  if (document.getElementById('dell-cab-css')) return;
  const s = document.createElement('style'); s.id = 'dell-cab-css';
  s.textContent = `.csched{margin:10px 0;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 12px;overflow-x:auto}
.csched h3{margin:0 0 6px;font-size:15px}.csched table{border-collapse:collapse;width:100%;font-size:12.5px;min-width:600px}
.csched th{text-align:left;color:var(--muted);font-weight:600;border-bottom:1px solid var(--line);padding:4px 6px}.csched td{padding:5px 6px;border-bottom:1px solid var(--line);vertical-align:top}
#stage .ptip{display:none;pointer-events:none}#stage .hot:hover .ptip,#stage .hot:focus-visible .ptip{display:inline}`;
  Sim.addCss(s);
})();

Sim.registerView({
  id: 'rear', title: 'Rear: cords and cables',
  keep: [
    ['Follow the work-order schedule', 'The work order assigns every cable its exact switch port or PDU outlet: iDRAC to MGT01 port 13 (Gi0/13), Gb 1 to SW01 port 22 (Gi0/22), Gb 2 to SW02 port 22 (Gi0/22), PSU 1 to PDU A outlet 8, and PSU 2 to PDU B outlet 8.'],
    ['Dell cabling order (ISM page 20)', 'When setting up or reconnecting the server, connect the network and management peripherals (iDRAC, Gb 1, Gb 2) first, and connect the electrical power cords (PSU 1, PSU 2) last. Before opening the system for service, disconnect both power cords first, then the network cables.'],
    ['PSU handle retention straps (ISM page 93)', 'Dell CAUTION: "When connecting the power cable to the PSU, secure the cable to the PSU with the strap." Wrap the hook-and-loop strap on each PSU handle around the power cord so it cannot be pulled out accidentally. The translucent PSU handle lights green when AC is healthy.'],
    ['Odd up, even down', 'On SW01, SW02, and MGT01, port 1 is top-left and port 2 is below it: odd numbers on the top row, even numbers on the bottom row. Hover any port or PDU outlet to see its number.'],
    ['Rear VGA & USB 3.0 (ISM Table 6)', 'The rear panel includes a 15-pin VGA video port and two USB 3.0 ports beside the iDRAC dedicated port for connecting a local crash-cart monitor and USB keyboard during initial iDRAC9 and BIOS setup.']],
  render(t) {
    if (!t.cpu) return otherLab('Rear of the server');
    const c = t.cpu; syncCab(c);
    const rear = rearSceneD(t) + crashArtD(t) + rearZonesD(t);
    const nOk = CAB_ORDER.filter(k => c.cab[k]).length;
    const hint = c.cabSel ? `Selected ${CAB[c.cabSel].name}: click ${CAB[c.cabSel].far} (${CAB[c.cabSel].ifName}) on the ${c.cabSel.startsWith('psu') ? 'PDU' : 'switch'} to connect it.`
      : nOk === 5 ? `All 5 cables connected to their scheduled ports${c.strap.psu1 && c.strap.psu2 ? ', PSU handle straps fastened' : ' — fasten both PSU handle straps'}${c.labeled ? ', labels fitted.' : '.'}`
      : 'Click a port on the server, then click its assigned switch port or PDU outlet from the cable schedule below.';
    return frame('Rear of the rack: switches, PDUs, and the Dell PowerEdge R6515 in U20', `<defs><clipPath id="dellCwClip"><rect x="10" y="32" width="880" height="${CW.SB - 32}" rx="8"/></clipPath></defs><g clip-path="url(#dellCwClip)">${rear}</g><text x="450" y="${CW.SB + 17}" text-anchor="middle" class="ss">${esc(hint)}</text>`, CW.SB + 26)
      + schedD(t);
  },
  actions(t) {
    const c = t.cpu, a = [...chainBtn(t)]; if (!c) return a;
    if (!c.labeled) a.push(button('Fit printed labels at both ends', 'cabLabel', '', CAB_ORDER.every(k => c.cab[k]) && c.strap.psu1 && c.strap.psu2));
    return a;
  },
  tray(t) {
    const c = t.cpu; if (!c) return '';
    const u = t.rack.u || WO.u, loc = `R1-U${String(u).padStart(2, '0')}`;
    const rows = CAB_ORDER.filter(k => c.cabTo[k] && !c.cabOff[k]).map(k => `<div class="dimmlabel" style="font-size:12px">${loc}-R6515 | ${CAB_LABEL[k]} &harr; ${destTag(c.cabTo[k], c.cabPort[k])} | ${CAB_ROLE[k]}</div>`).join('');
    return `<h2>Dell R6515 Rear Panel (ISM Table 6, page 13)</h2>
      <ul class="rules">
        <li><b>iDRAC dedicated port</b> (RJ-45, above USB ports): out-of-band management via iDRAC9 &rarr; <b>MGT01 port 13</b> (<code>Gi0/13</code>)</li>
        <li><b>Gb 1 &amp; Gb 2</b> (integrated 1 GbE LOM RJ-45 ports): redundant data links &rarr; <b>SW01 port 22</b> (<code>Gi0/22</code>) and <b>SW02 port 22</b> (<code>Gi0/22</code>)</li>
        <li><b>PSU 1 &amp; PSU 2</b> (redundant hot-swap AC power supplies): <b>PSU 1</b> &rarr; <b>PDU A outlet 8</b> (feed A), <b>PSU 2</b> &rarr; <b>PDU B outlet 8</b> (feed B)</li>
        <li><b>PSU handle straps (ISM page 93)</b>: secure each AC power cord to the PSU handle with its hook-and-loop strap; the translucent handle glows green when AC power is healthy</li>
        <li><b>VGA &amp; USB 3.0 (2)</b>: local console ports for connecting a monitor and USB keyboard to configure iDRAC9 and System Setup</li>
        <li><b>Ports in use by neighbour servers</b>: SW01 &amp; SW02 ports 1–6, 17, 18; MGT01 ports 1–8; PDU A &amp; B outlets 9–11</li>
      </ul>` + (c.labeled && rows ? `<h3>Fitted cable labels</h3>${rows}` : '') + kitHtml(t);
  }
});

/* ---- POST after the processor or memory change, and System Setup ---- */
Sim.registerView({
  id: 'post', title: 'Monitor: POST and System Setup',
  keep: [
    ['Expected message', 'Dell: after a processor or system board replacement, the first power-on may show a CMOS battery loss or CMOS checksum error. Go into System Setup and configure the settings; it does not come back.'],
    ['Memory verification', 'Dell ISM page 53: after installing memory modules, press F2 during POST to enter System Setup > System BIOS > Memory Settings and verify that System Memory Size, System Memory Type, and System Memory Speed match the installed configuration (3200 MT/s at 1 DPC, 2933 MT/s at 2 DPC).']],
  render(t) {
    if (!t.cpu) return otherLab('Monitor');
    const c = t.cpu, on = dimmList(t), d = on.length ? MEMKIT_D[t.dimms[on[0]]] : null;
    let g = `<rect x="60" y="30" width="780" height="420" rx="6" fill="#050505" stroke="#5B636A"/>`;
    const line = (y, s, col = '#C9D0D6', big = false) => `<text x="90" y="${y}" style="font:${big ? '600 15px' : '500 13px'} ui-monospace, Menlo, monospace;fill:${col}">${esc(s)}</text>`;
    if (c.power !== 'on') g += line(240, !(c.cab.psu1 && c.cab.psu2) ? 'No signal: connect the rear cables and power cords, then press the power button' : 'No signal: press the power button on the front control panel', '#59626A', true);
    else if (c.post === 'cmos') {
      g += line(70, 'Dell PowerEdge R6515', '#EAF2F7', true) + line(100, 'BIOS Version 2.x.x    iDRAC9') + line(130, `Service Tag: ${WO.tag}`) +
        line(190, 'CMOS checksum error - defaults loaded.', '#FFB52E', true) + line(220, 'CMOS battery loss or checksum error after processor replacement.', '#FFB52E') +
        line(280, 'Press F1 to continue, F2 to enter System Setup', '#EAF2F7');
    } else if (c.post === 'setup') {
      g += line(70, 'System Setup  >  System BIOS  >  Processor Settings', '#EAF2F7', true) +
        line(120, 'Processor 1                 ' + WO2.cpu) + line(146, 'Core count                  ' + WO2.cores) + line(172, 'Base frequency              ' + WO2.ghz + ' GHz') + line(198, 'Logical processors          ' + WO2.cores * 2) +
        line(260, 'The new processor is reported. Save the settings and exit; the system reboots.', '#45D07F') + line(300, 'Finish', '#7CC4FF');
    } else if (c.post === 'memPost') {
      g += line(70, 'Dell PowerEdge R6515', '#EAF2F7', true) + line(98, 'BIOS Version 2.x.x    iDRAC9') + line(124, `Service Tag: ${WO.tag}    Processor: ${WO2.cpu}`) +
        line(168, 'Configuring Memory... Done', '#45D07F') +
        line(202, `Alert! Memory configuration changed: ${memTotalGb(t)} GB DDR4-${memSpeed(t)} ${d ? d.kind : ''} (${on.length} modules).`, '#FFB52E', true) +
        line(232, `Populated sockets: ${FILL.filter(s => t.dimms[s]).join(', ')}`, '#C9D0D6') +
        line(286, 'Press F1 to continue, F2 to enter System Setup (Memory Settings)', '#EAF2F7');
    } else if (c.post === 'memSetup') {
      const chs = [...new Set(FILL.filter(s => t.dimms[s]).map(s => CHAN[s]))];
      g += line(64, 'System Setup  >  System BIOS  >  Processor & Memory Settings', '#EAF2F7', true) +
        line(98,  `Processor 1                 ${WO2.cpu} (${WO2.cores} cores, ${WO2.ghz} GHz)`) +
        line(124, `System Memory Size          ${memTotalGb(t)} GB (${on.length} x ${d ? d.gb : 0} GB)`) +
        line(150, `System Memory Type          ECC DDR4 ${d ? d.kind : ''} (${d ? d.org : ''})`) +
        line(176, `System Memory Speed         ${memSpeed(t)} MT/s (${on.length <= 8 ? '1 DPC' : '2 DPC'})`) +
        line(202, `System Memory Voltage       ${d ? d.v : '1.2 V'}`) +
        line(228, `Operating Mode              Optimizer Mode (NUMA Nodes Per Socket: NPS 1)`) +
        line(254, `Populated Sockets           ${FILL.filter(s => t.dimms[s]).join(', ')} (Channels ${chs.join(', ')})`) +
        line(298, 'Processor and DDR4 memory modules verified with no UEFI0391 warnings. Save and exit.', '#45D07F') +
        line(334, 'Finish', '#7CC4FF');
    } else if (c.post === 'ok') {
      g += line(70, 'Dell PowerEdge R6515', '#EAF2F7', true) + line(120, 'Processor: ' + WO2.cpu, '#45D07F') +
        (on.length ? line(148, `Memory: ${memTotalGb(t)} GB DDR4-${memSpeed(t)} ${d.kind} (${on.length} x ${d.gb} GB ${d.rank})`, '#45D07F') : '') +
        line(on.length ? 182 : 150, 'Booting the operating system...', '#C9D0D6');
    } else {
      g += line(70, 'Dell PowerEdge R6515', '#EAF2F7', true) + line(120, `Service Tag: ${WO.tag}    Processor: ${WO2.cpu}`) + line(160, 'Operating system running. Shut down and power off in the Rack view before opening.', '#C9D0D6');
    }
    return frame('Monitor', g, 480);
  },
  actions(t) {
    const c = t.cpu, a = [...chainBtn(t)]; if (!c) return a;
    if (c.post === 'cmos' || c.post === 'memPost') { a.push(button('F1: continue', 'postKey', 'f1')); a.push(button('F2: System Setup', 'postKey', 'f2', true)); }
    if (c.post === 'setup' || c.post === 'memSetup') a.push(button('Finish: save and exit', 'postKey', 'finish', true));
    return a;
  }
});

/* ---- handlers ---- */
const powerIn = c => !!(c.cabTo.psu1 && !c.cabOff.psu1) || !!(c.cabTo.psu2 && !c.cabOff.psu2);
const anyCab = c => CABS.some(k => c.cabTo[k] && !c.cabOff[k]);
const needInside = () => { const c = T.cpu; if (!c) return false; if (c.power === 'on') { bad('The system is running. Power it off before you open it: opening a running system risks electric shock.'); return false; } if (anyCab(c)) { bad(`${powerIn(c) ? 'A power cord' : 'A cable'} is still connected at the server. Disconnect the cords and the cables before working inside.`); return false; } if (T.rack.pos !== 'out') { bad('Slide the system out of the rack first: press both ear latches and pull it to the service position.'); return false; } return true; };
Sim.on('esd', () => { const c = T.cpu; if (!c) return; c.esd = !c.esd; Sim.sound(c.esd ? 'clip' : 'clipOpen'); say(c.esd ? 'ok' : 'warn', c.esd ? 'ESD wrist strap on and clipped to bare chassis metal.' : 'Wrist strap removed.'); });
Sim.on('powerBtn', () => {
  const c = T.cpu; if (!c) return say('info', 'The power button.');
  Sim.sound('button');
  if (c.power === 'on') { c.power = 'off'; c.post = null; Sim.sound('fansDown', 0.05); return say('ok', 'Operating system shut down, then the power button pressed: the system is off. The power LED is out.'); }
  if (T.rack.pos !== 'in') return bad('Push the system back into the rack before you power it on.');
  if (c.cover !== 'locked') return bad('The system cover is not on and locked. Never run the system open.');
  const missData = ['idrac', 'gb1', 'gb2'].filter(k => !c.cab[k]);
  if (missData.length) return bad(`Connect the management and data cables according to the work order first (${missData.map(k => `${CAB[k].name} -> ${CAB[k].far}`).join(', ')}).`);
  if (!(c.cab.psu1 && c.cab.psu2)) return bad('No power: connect both PSU 1 (PDU A outlet 8) and PSU 2 (PDU B outlet 8) power cords first.');
  if (!(c.strap.psu1 && c.strap.psu2)) return bad('Secure both power cords to the PSU handles with the retention straps before powering on (Dell ISM page 93).');
  if (T.idr) {                      // the first iDRAC setup: the boot screens, on the monitor once it is plugged in
    if (T.memLab && !memOk(T)) return bad(memWhy(T));
    c.power = 'on'; c.post = null; idrBoot(T); Sim.sound('fans', 0.1);
    return say('ok', 'Power button pressed: the fans spin up and the power LED lights green. The server starts its power-on self-test: plug the monitor and the USB keyboard into the rear panel to watch it.');
  }
  if (T.memLab) {
    if (!memOk(T)) return bad(memWhy(T));
    c.power = 'on'; c.post = 'memPost'; Sim.sound('fans', 0.1);
    return say('warn', 'Power button pressed: fans spin up and the front power LED lights green. POST detects the new DDR4 memory configuration and prompts F2 for System Setup. Open the Monitor view to verify Memory Settings (ISM page 53).');
  }
  c.power = 'on'; c.post = 'cmos'; Sim.sound('fans', 0.1); say('warn', 'Power button pressed: fans spin up and POST stops on a CMOS checksum message, expected after a processor change. Go to the Monitor view and enter System Setup.');
});
Sim.on('cab', k => {
  const c = T.cpu, d = CAB[k]; if (!c || !d) return;
  const pw = d.kind === 'power';
  // Case 1: Cable is currently plugged into the server (either right or wrong far end)
  if (c.cabTo[k] && !c.cabOff[k]) {
    if (c.power === 'on') return bad(pw ? `${d.name} pulled with the system running: it keeps running on the other supply, but shut it down first.` : `${d.name} pulled with the system running: the link dropped. Shut the system down first.`);
    // If plugged into a wrong switch port / PDU outlet, unplug it completely so the student can re-route it to the scheduled port
    if (cabWrong(T, k)) {
      const oldHere = portTxtD(c.cabTo[k], c.cabPort[k]);
      c.cabTo[k] = null; c.cabPort[k] = null; c.cabOff[k] = false; if (pw) c.strap[k] = false;
      syncCab(c); c.cabSel = k; fxMark('cab:' + k); Sim.sound(pw ? 'plug' : 'clipOpen');
      return say('info', `${d.name} unplugged from ${oldHere} and selected. Now click ${d.far} (${d.ifName}) from the cable schedule.`);
    }
    if (!pw && powerIn(c)) return bad(`Power first: pull both cords, then the ${d.name} cable. Dell: disconnect the system from the electrical outlet, then the peripherals.`);
    c.cabOff[k] = true; if (pw) c.strap[k] = false; c.cabSel = null; syncCab(c); fxMark('cab:' + k); Sim.sound(pw ? 'plug' : 'clipOpen');
    return say('ok', `${d.name} unplugged at the server; it hangs beside the port, labelled ${d.far}. The far end stays in place.${anyCab(c) ? '' : ' Everything is off the server: no power in the system.'}`);
  }
  // Check rack position and cover before connecting or selecting a port for cabling
  if (T.rack.pos !== 'in') return bad('Push the system back into the rack before you connect anything.');
  if (c.cover !== 'locked') return bad('Close and lock the cover before you connect anything.');
  if (pw && ['idrac', 'gb1', 'gb2'].some(x => !c.cab[x])) {
    return bad(`The cables first, power last: ${['idrac', 'gb1', 'gb2'].filter(x => !c.cab[x]).map(x => `${CAB[x].name} (${CAB[x].far})`).join(', ')} must be connected first. Dell ISM page 20: connect the peripherals and network cables, then connect the system to the electrical outlet.`);
  }
  // Case 2: Maintenance reconnect (far end is already in its scheduled switch port / PDU outlet, server end was hanging beside port)
  if (c.cabTo[k] && c.cabOff[k]) {
    c.cabOff[k] = false; if (pw) c.strap[k] = true; c.cabSel = null; syncCab(c); fxMark('cab:' + k); Sim.sound(pw ? 'plug' : 'snap');
    return say('ok', `${d.name} plugged in at the server${pw ? ' and secured with the PSU handle strap' : ''}, label ${d.far}.${pw && c.cab.psu1 && c.cab.psu2 ? ' Both supplies have standby power: the PSU handles glow green.' : !pw ? ' The link LED comes up with power.' : ''}`);
  }
  // Case 3: Fresh port-to-port installation — select the server port, then click the switch port or PDU outlet
  c.cabSel = k;
  say('info', `${d.name} (${d.desc}) selected on the server. Now click its assigned ${pw ? 'PDU outlet' : 'switch port'} from the work-order cable schedule: ${d.far} (${d.ifName}).`);
});
Sim.on('cabDest', a => {
  const c = T.cpu; if (!c) return;
  const [dk, ns] = String(a).split(':'), n = +ns, id = c.cabSel;
  if (!DNAME[dk] || !n) return;
  const here = portTxtD(dk, n), busy = DBUSY[dk].includes(n), who = cabAt(T, dk, n, id);
  if (!id) return say('info', who ? `${here}: ${CAB[who].name} is plugged in here. To unplug it, click its port on the server.` : busy ? `${here}: in use by another system in the rack.` : `${here}: free. Click a port on the server first, then click the switch port or PDU outlet its cable goes to.`);
  const sp = CAB[id], pw = sp.kind === 'power';
  if (pw !== isPdu(dk)) return bad(`${sp.name} cannot plug into ${here}: ${pw ? 'AC power cords plug into PDU A or PDU B C13 outlets' : 'RJ-45 network cables plug into the top-of-rack switches (SW01, SW02, MGT01)'}. The work order specifies ${sp.far}.`);
  if (!pw && ((sp.kind === 'mgmt' && dk !== 'mgmt') || (sp.kind === 'data' && dk === 'mgmt'))) {
    return bad(`${sp.name} does not belong on ${DNAME[dk]}: ${sp.kind === 'mgmt' ? 'the iDRAC dedicated port goes to the out-of-band management switch (MGT01)' : 'the onboard Gb data ports go to the data switches (SW01 and SW02), never the management switch'}. The work order specifies ${sp.far}.`);
  }
  if (busy) return bad(`${here} is already in use by another server in the rack. The work order assigns ${sp.name} to ${sp.far}.`);
  if (who) return bad(`${here} is already taken by ${CAB[who].name}.`);
  c.cabTo[id] = dk; c.cabPort[id] = n; c.cabOff[id] = false; c.cabSel = null; syncCab(c); fxMark('cab:' + id); Sim.sound(pw ? 'plug' : 'snap');
  if (!cabRight(T, id)) {
    const why = dk !== sp.dest ? (pw ? `${DNAME[dk]} is the wrong power feed: ${sp.name} belongs on ${DNAME[sp.dest]} so PSU 1 and PSU 2 run on redundant A/B feeds.` : `${DNAME[dk]} is the other data switch: ${sp.name} belongs on ${DNAME[sp.dest]} so Gb 1 and Gb 2 stay on redundant switches.`)
      : pw ? `PDU outlets are pre-allocated per rack U to balance phase load and match circuit labels.`
      : `port ${n} is not provisioned for this server's VLAN, so the link stays down.`;
    return bad(`Plugged ${sp.name} into ${here}, but the work-order cable schedule specifies ${sp.far} (${sp.ifName}): ${why} Click ${sp.name} on the server to unplug it, then connect it to ${sp.far}.`);
  }
  say('ok', `${sp.name} connected from the server to ${here} (${sp.ifName}), matching the work order.${pw ? ' Translucent PSU handle status indicator turns green (ISM page 93). Now secure the power cable to the PSU handle with the strap.' : id === 'idrac' ? ' iDRAC9 out-of-band management link ready.' : ' Data link connected.'}`);
});
Sim.on('psuStrap', k => {
  const c = T.cpu; if (!c || (k !== 'psu1' && k !== 'psu2')) return;
  if (!c.cabTo[k] || c.cabOff[k]) return bad(`Connect the ${CAB[k].name} to ${CAB[k].far} first, then secure the cable with the PSU handle strap (Dell ISM page 93).`);
  if (cabWrong(T, k)) return bad(`Move the ${CAB[k].name} to its scheduled outlet (${CAB[k].far}) before fastening the PSU handle strap.`);
  c.strap[k] = !c.strap[k]; Sim.sound('velcro');
  say(c.strap[k] ? 'ok' : 'info', c.strap[k] ? `${CAB[k].name} secured to the ${k === 'psu1' ? 'PSU 1' : 'PSU 2'} handle with the hook-and-loop retention strap (Dell ISM page 93 CAUTION: prevents accidental disconnection).` : `${k === 'psu1' ? 'PSU 1' : 'PSU 2'} handle strap opened.`);
});
Sim.on('cabLabel', () => {
  const c = T.cpu; if (!c) return;
  const miss = CAB_ORDER.filter(k => !c.cabTo[k] || c.cabOff[k]);
  if (miss.length) return bad(`Connect all 5 cables first (${miss.map(k => CAB[k].name).join(', ')} still unconnected), then fit the labels.`);
  const wrong = CAB_ORDER.filter(k => cabWrong(T, k));
  if (wrong.length) return bad(`Fix the cable${wrong.length > 1 ? 's' : ''} in the wrong port first (${wrong.map(k => `${CAB[k].name} in ${portTxtD(c.cabTo[k], c.cabPort[k])}`).join('; ')}): never label a miswired cable.`);
  if (!(c.strap.psu1 && c.strap.psu2)) return bad('Secure both PSU power cords with the PSU handle straps first (Dell ISM page 93), then fit the labels.');
  c.labeled = true; Sim.sound('snap');
  const loc = `R1-U${String(T.rack.u || WO.u).padStart(2, '0')}`;
  say('ok', `Printed wraparound labels fitted at both ends of all 5 cables (e.g. "${loc}-R6515 | iDRAC ↔ MGT01-Gi0/13 | OOB-MGMT"). The server is ready to power on in the Rack view.`);
});
Sim.on('rearPort', k => {
  const c = T.cpu; if (!c || (k !== 'vga' && k !== 'usb')) return;
  c[k] = !c[k]; Sim.sound(c[k] ? (k === 'vga' ? 'plug' : 'clip') : 'clipOpen');
  if (k === 'vga') return say(c.vga ? 'ok' : 'info', c.vga ? 'Monitor cable plugged into the rear VGA port (Dell ISM Table 6) and both thumbscrews tightened.' : 'Monitor cable unplugged from the VGA port.');
  say(c.usb ? 'ok' : 'info', c.usb ? 'USB keyboard plugged into a rear USB 3.0 port.' : 'USB keyboard unplugged.');
});

Sim.on('coverLock', () => {
  const c = T.cpu; if (!c) return;
  if (c.cover === 'locked' && !c.back) { if (!needInside()) return; if (!c.esd) return bad('Put on the ESD wrist strap before you open the system.'); if (!toolOk(c, LOCK_TOOLS, 'the cover lock')) return; c.cover = 'unlocked'; fxMark('lock'); Sim.sound('screw'); return say('ok', 'Lock turned a quarter turn anticlockwise with the flat screwdriver: unlocked. Now lift the release latch.'); }
  if (c.cover === 'closed') { if (!toolOk(c, LOCK_TOOLS, 'the cover lock')) return; c.cover = 'locked'; c.back = true; fxMark('lock'); Sim.sound('screw'); Sim.sound('snap', 0.42); return say('ok', 'Lock turned clockwise: the cover is locked. Now slide the system back into the rack, then connect the rear cables, power cords, and power on.'); }
  if (c.cover === 'unlocked') return say('info', 'Unlocked. Lift the release latch.');
  if (c.cover === 'locked') return say('info', 'The cover is locked.');
  say('info', c.cover === 'off' ? 'The cover is off.' : 'Close the release latch first, then lock.');
});
Sim.on('coverLatch', () => {
  const c = T.cpu; if (!c) return;
  if (c.cover === 'locked') return bad('The cover is locked: the latch will not lift. Unlock it first (a quarter turn anticlockwise).');
  if (c.cover === 'unlocked') { c.cover = 'released'; fxMark('latch'); Sim.sound('clipOpen'); return say('ok', 'Release latch lifted: the cover slid back. Lift it off.'); }
  say('info', c.cover === 'released' ? 'The latch is up and the cover slid back: lift the cover off.' : 'The cover is off.');
});
Sim.on('coverLift', () => {
  const c = T.cpu; if (!c) return;
  if (c.cover === 'released') { c.cover = 'off'; fxMark('coverLift'); Sim.sound('tab'); return say('ok', 'System cover lifted off and set aside. Inside: the air shroud over the processor and the memory.'); }
  if (c.cover === 'off') return say('info', 'The cover is off.');
  bad(c.cover === 'locked' ? 'The cover is locked down: unlock it and lift the release latch first.' : 'Lift the release latch first: it slides the cover back so it can come off.');
});
Sim.on('coverPlace', () => {
  const c = T.cpu; if (!c) return;
  if (c.cover !== 'off') return say('info', 'The cover is on.');
  if (c.shroud !== 'in') return bad('Install the air shroud first: the system must never run without it.');
  if (cpuPhase(T) !== 'coverOn') return bad(T.memLab ? memWhy(T) : 'Not yet: finish the processor and the heat sink first, screws tight.');
  c.cover = 'placed'; fxMark('coverPlace'); Sim.sound('tab'); fxMark('latch'); say('ok', 'Cover aligned with the guide slots and set on, slid back. Now close the release latch, then lock.');
});
Sim.on('coverClose', () => { const c = T.cpu; if (!c) return; if (c.cover !== 'placed') return say('info', c.cover === 'off' ? 'Put the cover on first.' : 'The latch is closed.'); c.cover = 'closed'; fxMark('latch'); Sim.sound('cover'); say('ok', 'Release latch closed: the cover pulled home. Now the lock.'); });
Sim.on('shroud', () => {
  const c = T.cpu; if (!c) return;
  if (c.shroud === 'in') {
    if (c.cover !== 'off') return bad('Take the cover off first.');
    c.shroud = 'out'; fxMark('shroud'); Sim.sound('clipOpen');
    return say('ok', T.memLab ? 'Air shroud lifted out by its touch points and set aside. The heat sink and the 16 memory sockets around it are clear: the processor first, in the close-up, then the memory.' : 'Air shroud lifted out by its touch points and set aside. The heat sink and the memory modules are clear: open the close-up of the processor.');
  }
  if (T.memLab && cpuPhase(T) === 'memWork') {
    const op = SLOTS.find(s => T.memOpen[s]);
    return bad(!memOk(T) ? memWhy(T) : `Close the open ejector latches on memory socket ${op} before lowering the air shroud.`);
  }
  if (T.memLab) {
    if (cpuPhase(T) !== 'shroudIn') return bad('Not yet: the heat sink is not on with its screws tight.');
    c.shroud = 'in'; c.back = true; fxMark('shroud'); Sim.sound('clip');
    return say('ok', 'Air shroud lowered in over the processor and memory modules, its slot on the chassis standoff, firmly seated. Now the system cover.');
  }
  if (cpuPhase(T) !== 'shroudIn') return bad('Not yet: the heat sink is not on with its screws tight.');
  c.shroud = 'in'; fxMark('shroud'); Sim.sound('clip'); say('ok', 'Air shroud lowered in, its slot on the chassis standoff, firmly seated. Now the cover.');
});
Sim.on('tool', k => {
  const c = T.cpu; if (!c || !TOOLS[k]) return;
  Sim.sound('pick'); if (c.tool === k) { c.tool = null; return say('info', `${TOOLS[k].name} put back on the rack.`); }
  c.tool = k; say('ok', `${TOOLS[k].name} in hand.${k === 'tq' ? ` Its setting: ${c.torque ? c.torque + ' lbf-in' : 'not set yet'}.` : ''}`);
});
Sim.on('torque', v => {
  const c = T.cpu; v = +v; if (!c || !TORQUES.includes(v)) return;
  c.torque = v; Sim.sound('clip'); say(v === 12 ? 'ok' : 'info', `Torque driver set to ${v} lbf-in.${v === 12 ? ' Dell: 12.0 ± 1.0 lbf-in for the force plate screws.' : ''}`);
});
Sim.on('cool', () => { const c = T.cpu; if (!c) return; if (c.cool) return say('info', 'Cool enough to handle.'); c.cool = true; say('ok', 'A few minutes passed: the heat sink and processor are cool to the touch.'); });
Sim.on('hsScrew', k => {
  const c = T.cpu; if (!c) return; k = +k; if (!(k >= 0 && k < 4)) return;
  if (removing(c)) {
    if (!c.hs.on) return say('info', 'The heat sink is off.');
    if (!c.cool) return bad('The heat sink is still hot: let it cool before you touch it.');
    if (!toolOk(c, T20S, 'the heat sink captive screws')) return;
    const st = hsStage(c, k); if (!st) { const w = hsWant(c); return bad(w ? `Wrong order. Next: screw ${w[0] + 1}, ${w[1] === 1 ? 'about three turns' : 'fully'}: loosen 1 and 2 three turns, then 3 and 4 three turns, then 1 and 2 fully, then 3 and 4 fully.` : 'All four screws are loose: lift the heat sink.'); }
    c.hs.screws[k] = st; fxMark('hsScrew:' + k); Sim.sound('screw'); return say('ok', `Screw ${k + 1} ${st === 1 ? 'loosened about three turns' : 'loosened fully'} with the T20.${c.hs.screws.every(x => x === 2) ? ' All four loose: lift the heat sink from the system.' : ''}`);
  }
  if (!c.hs.on) return say('info', 'Place the heat sink on the processor first.');
  if (!toolOk(c, T20S, 'the heat sink captive screws')) return;
  const st = hsStage(c, k); if (!st) { const w = hsWant(c); return bad(w ? `Wrong order. Next: screw ${w[0] + 1}, ${w[1] === 1 ? 'about three turns' : 'fully'}: tighten 1 and 2 three turns, then 3 and 4 three turns, then 1 and 2 fully, then 3 and 4 fully, so the heat sink seats flat.` : 'All four screws are tight.'); }
  c.hs.screws[k] = st; fxMark('hsScrew:' + k); Sim.sound('screw'); if (c.hs.screws.every(x => x === 2)) { c.back = true; Sim.sound('snap'); }
  say('ok', `Screw ${k + 1} ${st === 1 ? 'tightened about three turns' : 'tightened fully'}.${c.hs.screws.every(x => x === 2) ? ' The heat sink is on, flat and tight. Now the air shroud and the cover, in the Inside view.' : ''}`);
});
Sim.on('hsLift', () => {
  const c = T.cpu; if (!c) return;
  if (!c.hs.on) return say('info', 'The heat sink is on the bench.');
  if (!removing(c)) return say('info', 'The heat sink is installed.');
  if (!c.cool) return bad('The heat sink is still hot: let it cool first.');
  if (c.hs.screws.some(x => x < 2)) return bad('Not all four captive screws are loose yet: it does not lift. Loosen them in the marked order.');
  c.hs.on = false; c.hs.screws = [0, 0, 0, 0]; fxMark('hsLift'); Sim.sound('card'); say('ok', 'Heat sink lifted from the system and set on the bench, old grease on its base. The processor is in its tray under the force plate: screws 3, 2, 1.');
});
Sim.on('fpScrew', k => {
  const c = T.cpu; if (!c) return; k = +k; if (!(k >= 0 && k < 3)) return;
  if (c.hs.on) return bad('The heat sink is still on: remove it before the force plate.');
  if (removing(c)) {
    if (!c.fp[k]) return say('info', `Screw ${k + 1} is loose.`);
    if (!c.lidClean || !c.hs.clean) return bad('Wipe the old grease off first: the processor lid and the heat sink base, with a lint-free cloth.');
    if (!toolOk(c, T20S, 'the force plate screws')) return;
    if (!c.press) return bad('Hold the force plate down with a finger first: it is spring-loaded, and as its screws let go it springs up and can knock the processor tray out of line.');
    const n = fpNext(c); if (n !== k) return bad(`Wrong order: the force plate opens 3, 2, 1. Next is screw ${n + 1}.`);
    c.fp[k] = false; fxMark('fpScrew:' + k); Sim.sound('screw');
    if (!c.fp.some(Boolean)) { c.plate = 'up'; c.press = false; fxMark('plate'); Sim.sound('cpuRelease', 0.45); return say('ok', 'Force plate screw 1 loosened: the plate is free and swings up on its front hinge. Now lift the two blue latches to release the rail frame.'); }
    return say('ok', `Force plate screw ${k + 1} loosened with the T20.`);
  }
  if (c.tray !== 'new') return bad('There is no processor tray in the rail frame.');
  if (c.frame !== 'down') return bad('Push the rail frame down until the blue latches lock before you close the force plate.');
  if (c.plate !== 'down') return bad('Lower the force plate over the processor first, then the screws 1, 2, 3.');
  if (c.fp[k]) return say('info', `Screw ${k + 1} is tight.`);
  if (c.tool !== 'tq') return bad(c.tool === 't20' ? 'Dell: the force plate screws go to 12.0 ± 1.0 lbf-in. A plain T20 cannot tell you when you are there: use the torque driver with its T20 bit, set to 12 lbf-in.' : `${c.tool ? `The ${TOOLS[c.tool].name} does not fit the force plate screws.` : 'No tool in hand.'} Dell: Torx T20, to 12.0 ± 1.0 lbf-in: the torque driver with its T20 bit.`);
  if (c.torque !== 12) return bad(c.torque == null ? 'Set the torque driver first: 12 lbf-in for the force plate screws (Dell: 12.0 ± 1.0 lbf-in).' : c.torque < 12 ? `${c.torque} lbf-in is under Dell's 12.0 ± 1.0 lbf-in: the socket would not be fully actuated and the processor may not make contact. Set 12.` : `${c.torque} lbf-in is over Dell's 12.0 ± 1.0 lbf-in: it can crack the force plate or damage the socket. Set 12.`);
  const n = fpNext(c); if (n !== k) return bad(`Wrong order: the force plate closes 1, 2, 3. Next is screw ${n + 1}.`);
  if (!c.press) return bad('Press the force plate down with a finger while you tighten (Dell: so the processor cover does not tilt out of the socket).');
  c.fp[k] = true; fxMark('fpScrew:' + k); Sim.sound('screw'); Sim.sound('torque', 0.46); if (c.fp.every(Boolean)) c.press = false; say('ok', `Force plate screw ${k + 1} tightened to 12 lbf-in, the plate pressed flat; the driver clicked.${c.fp.every(Boolean) ? ' All three fully threaded: the socket is actuated (12 lbf-in). Now clean the heat sink and grease the processor.' : ''}`);
});
Sim.on('plateClose', () => {
  const c = T.cpu; if (!c) return;
  if (c.plate === 'down') return say('info', 'The force plate is down.');
  if (c.tray !== 'new') return bad(c.tray === 'old' ? 'The old processor is still in the frame.' : 'The frame is empty: the new processor tray first.');
  if (c.frame !== 'down') return bad('Push the rail frame down until the blue latches lock first.');
  c.plate = 'down'; fxMark('plate'); Sim.sound('clip'); say('ok', 'Force plate lowered over the processor. Press it flat and tighten the screws 1, 2, 3.');
});
Sim.on('latch', k => {
  const c = T.cpu; if (!c || !(k in c.latch)) return;
  if (c.frame === 'up') return say('info', 'The rail frame is up.');
  if (c.hs.on) return bad('The heat sink is still on.');
  if (c.plate !== 'up') return bad('The force plate still holds the frame: loosen its screws 3, 2, 1 first.');
  if (c.latch[k]) return say('info', `The ${k === 'l' ? 'left' : 'right'} latch is lifted. The other one too.`);
  c.latch[k] = true; fxMark('latch:' + k); Sim.sound('clipOpen');
  if (c.latch.l && c.latch.r) { c.frame = 'up'; fxMark('frame'); return say('ok', 'Both blue latches lifted: the rail frame is released and swings up on its front hinge, the processor tray standing in it. Hold the tray by its tab and slide it out of the top of the frame.'); }
  say('ok', `${k === 'l' ? 'Left' : 'Right'} blue latch lifted. Lift the other one too.`);
});
Sim.on('frameDown', () => {
  const c = T.cpu; if (!c) return;
  if (c.frame === 'down') return say('info', 'The rail frame is down.');
  if (c.tray !== 'new') return bad(c.tray === 'old' ? 'The old processor is still in the frame: slide it out first.' : 'The frame is empty: slide the new processor tray in first.');
  c.frame = 'down'; c.latch = { l: false, r: false }; fxMark('frame'); Sim.sound('cpuClip'); say('ok', 'Rail frame pushed down until both blue latches locked into place. Now lower the force plate and close it: screws 1, 2, 3.');
});
Sim.on('trayOut', () => {
  const c = T.cpu; if (!c) return;
  if (c.tray !== 'old') return say('info', 'The old tray is out.');
  if (c.frame !== 'up') return bad('Lift the rail frame first: the tray is held in it.');
  c.tray = 'none'; fxMark('tray'); Sim.sound('card'); say('ok', 'Old processor tray slid out of the top of the rail frame by its tab, into the kit box. The socket pins are open: do not touch them.');
});
Sim.on('trayPick', () => {
  const c = T.cpu; if (!c) return; if (c.hand) return say('info', 'The new tray is in hand.'); if (c.tray !== 'none') return bad('The socket is not empty.');
  c.hand = true; c.trayRot = 180; Sim.sound('pick');
  say('ok', `From the kit: ${WO2.cpu}, ${WO2.family}, socket ${WO2.socket}: ${WO2.cores} cores, ${WO2.threads} threads, ${WO2.ghz.toFixed(1)} GHz base, ${WO2.boost} GHz boost, ${WO2.l3} MB L3, ${WO2.tdp} W. The ISM lists it for the R6515 (Table 15). In its tray, held by the tab, contacts untouched. Check its triangle against the triangle on the rail frame before it goes in.`);
});
Sim.on('trayTurn', () => { const c = T.cpu; if (!c || !c.hand) return; c.trayRot = c.trayRot ? 0 : 180; fxMark('turn'); Sim.sound('pick'); say('info', 'Tray turned 180 degrees in your hands.'); });
Sim.on('trayIn', () => {
  const c = T.cpu; if (!c) return;
  if (c.tray === 'new') return say('info', 'The new tray is in.');
  if (c.tray === 'old') return bad('The old processor is still in the frame.');
  if (!c.hand) return bad('Take the new processor tray from the kit first.');
  if (c.frame !== 'up') return bad('The rail frame must be up to slide the tray in.');
  if (c.trayRot) return bad('Wrong way round: the triangle on the tray does not line up with the triangle on the rail frame. The tray fits one way only; forced, it bends the socket pins. Turn it 180 degrees.');
  c.tray = 'new'; c.hand = false; fxMark('tray'); Sim.sound('card', 0.8); say('ok', 'New processor tray slid into the rail frame from the top until firmly seated. Now push the rail frame down.');
});
Sim.on('hsClean', () => { const c = T.cpu; if (!c) return; if (c.hs.clean) return say('info', 'The base is clean.'); if (c.hs.on) return bad('The heat sink is on the processor.'); c.hs.clean = true; Sim.sound('wipe'); say('ok', `Old grease wiped off the heat sink base with a lint-free cloth: it is reused, and old and new grease must not mix.${c.lidClean ? ' Both clean: now the force plate.' : ''}`); });
Sim.on('lidClean', () => { const c = T.cpu; if (!c) return; if (c.lidClean) return say('info', 'The lid is clean.'); if (c.hs.on || c.tray !== 'old') return; c.lidClean = true; Sim.sound('wipe'); say('ok', `Old grease wiped off the old processor's lid with a lint-free cloth, so it goes back clean in its tray.${c.hs.clean ? ' Both clean: now the force plate.' : ' Now the heat sink base.'}`); });
Sim.on('press', () => { const c = T.cpu; if (!c) return; if (c.plate !== 'down') return say('info', 'The force plate is up.'); c.press = !c.press; if (c.press) Sim.sound('pick'); say(c.press ? 'ok' : 'info', c.press ? 'Finger on the rear edge of the force plate: it is held down while its screws are turned.' : 'Finger off the force plate.'); });
Sim.on('greaseWipe', () => { const c = T.cpu; if (!c) return; if (!c.gStrokes.length) return say('info', 'The lid is clean.'); c.gStrokes = []; c.hs.grease = 0; Sim.sound('wipe'); say('ok', 'Grease wiped off the lid with a lint-free cloth. Draw it again: one thin spiral from the centre outward.'); });
Sim.on('grease', arg => {
  const c = T.cpu; if (!c) return;
  if (c.tray !== 'new' || !c.fp.every(Boolean) || c.plate !== 'down') return bad('Grease goes on the new processor after the force plate is closed.');
  if (!arg) return say('info', 'Hold the mouse button down on the processor lid and draw: a thin spiral from the centre outward, about three turns, like figure 52.');
  if (c.hs.grease === -1) return bad('There is too much grease on the lid already: wipe it off and start again.');
  const st = arg.trim().split(/\s+/).map(q => q.split(',').map(Number)).filter(p => p.length === 2 && p.every(Number.isFinite)); if (st.length < 2) return;
  c.gStrokes.push(st); Sim.sound('wipe');
  if (c.hs.grease === 1) { c.hs.grease = -1; return bad('Too much grease: the spiral was already done. More squeezes out into the socket under the heat sink. Wipe it off and draw one spiral.'); }
  const m = greaseMeasure(c.gStrokes);
  if (m.out > 0.05) { c.hs.grease = -1; return bad('Grease off the lid: it runs into the socket and onto the pins. Wipe it off and draw again, inside the lid.'); }
  if (m.L > GREASE.max) { c.hs.grease = -1; return bad('Too much grease: it would squeeze out into the socket when the heat sink goes on. Wipe it off and draw one thin spiral.'); }
  if (m.wind >= GREASE.turns * 2 * Math.PI && m.maxR >= GREASE.reach && m.L >= GREASE.min) { c.hs.grease = 1; return say('ok', 'A thin spiral of thermal grease on the processor, from the centre outward, as in figure 52. The syringe is single use: into the bin. Now the heat sink.'); }
  say('info', m.wind < GREASE.turns * 2 * Math.PI ? 'Keep going: round and round, from the centre outward, about three turns.' : 'Keep going outward: the spiral should reach about half way to the edges of the lid.');
});
Sim.on('hsPlace', () => {
  const c = T.cpu; if (!c) return;
  if (c.hs.on) return say('info', 'The heat sink is on.');
  if (c.tray !== 'new' || c.plate !== 'down' || !c.fp.every(Boolean)) return bad('Not yet: the new processor in, the rail frame down, the force plate closed first.');
  if (c.hs.grease !== 1) return bad(c.hs.grease === -1 ? 'Too much grease on the processor: wipe it off and draw one thin spiral first.' : 'No thermal grease on the processor yet.');
  c.hs.on = true; c.hs.screws = [0, 0, 0, 0]; fxMark('hsPlace'); Sim.sound('card', 0.6); say('ok', 'Heat sink lowered onto the processor, its captive screws over the standoffs. Now the screws: 1 and 2, 3 and 4 three turns, then fully.');
});
Sim.on('postKey', k => {
  const c = T.cpu; if (!c || c.power !== 'on') return;
  if (k === 'f1') return bad(c.post === 'memPost' ? 'F1 skips System Setup without verifying Memory Settings. Dell ISM page 53: press F2 to enter System Setup > Memory Settings and verify that the installed memory matches.' : 'F1 continues with the defaults loaded and the message comes back next boot. Dell: enter System Setup and configure the settings.');
  if (k === 'f2') {
    if (c.post === 'cmos') { c.post = 'setup'; Sim.sound('button'); return say('ok', 'System Setup. Processor Settings shows the new processor.'); }
    if (c.post === 'memPost') { c.post = 'memSetup'; Sim.sound('button'); const on = dimmList(T), d = MEMKIT_D[T.dimms[on[0]]]; return say('ok', `System Setup > System BIOS > Memory Settings: ${memTotalGb(T)} GB DDR4-${memSpeed(T)} ${d.kind} (${on.length} × ${d.gb} GB ${d.rank}) recognized. Save and exit.`); }
    return;
  }
  if (k === 'finish') {
    if (c.post === 'setup') { c.post = 'ok'; T.flags.cpuDone = true; Sim.sound('button'); Sim.sound('fans', 0.3); return say('ok', `Settings saved. The system reboots clean and shows ${WO2.cpu}. Job done.`); }
    if (c.post === 'memSetup') { c.post = 'ok'; T.flags.memDone = true; Sim.sound('button'); Sim.sound('fans', 0.3); return say('ok', `Memory Settings verified and saved. The system reboots clean with ${memTotalGb(T)} GB DDR4 at ${memSpeed(T)} MT/s. Job done.`); }
  }
});
// the scene settles after an animation: one more redraw when it has played out, so the zones come back in place
Sim.every(() => { if ((Sim.view === 'inside' || Sim.view === 'socket') && T && T.cpu && ['plate', 'frame', 'tray', 'hsLift', 'hsPlace', 'coverLift', 'coverPlace', 'shroud', 'latch'].some(k => { const a = fxAge(k); return a > 0.7 && a < 1.5; })) render(); }, 250);
