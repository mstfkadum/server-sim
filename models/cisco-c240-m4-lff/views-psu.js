/* ==========================================================================================================
   Model pack: Cisco UCS C240 M4 LFF. Power supplies at the rear: hot-swap of a failed UCSC-PSU2V2-1200W.
   © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved.
   Photos: the trainer's UCSC-PSU2V2-1200W, straightened and cropped to the module faces.
   - psuRear: the rear face as installed, 735 x 300 photo units: LEDs and fan on the left, handle in the middle,
     AC inlet and the green release lever on the right.
   - psuTop: the label (top) face, 920 x 400, rear end on the right and the release-lever side on top.
   - The label is blank paper; the simulator prints each unit's invented serial numbers on it. psuLogo: the Cisco logo sticker.
   - psuEnd: the connector end that plugs into the power distribution board.
   Procedure: Cisco UCS C240 M4 Installation and Service Guide, "Replacing Power Supplies". LED states: the guide's
   rear power supply LED table. The release lever, the hook-and-loop cord strap and the movements follow the
   trainer's video of a removal and installation.
   ========================================================================================================== */
const PF = { w: 735, h: 300, amber: [32, 95], green: [32, 222], fan: [235, 150], plug: [616, 143] };
// the green finger tab of the release lever, sticking out past the inlet end of the face (face units)
const PTAB = 'M703 70L824 56Q836 55 836 67V232Q836 246 823 245L703 191Z';
// rear elevation: left edge, scale and top of each bay's face (index 0 = PSU 1, the lower bay; 1 = PSU 2, the upper bay)
const PE = { x: 404, s: 0.42, y: [218, 86] };
const pe = (i, u, v) => [PE.x + u * PE.s, PE.y[i] + v * PE.s];
const PSUN = i => `PSU ${+i + 1}`;
const PGREEN = '#8DC63F', PGREEN2 = '#5E8A24';
let psuFx = [null, null], psuTimer = 0;
const pfxMark = (i, kind) => { psuFx[i] = { at: Date.now(), kind }; };
const pfxAge = i => psuFx[i] ? (Date.now() - psuFx[i].at) / 1000 : 99;
const psuFan = (t, i) => t.psu[i].st === 'in' && !t.psu[i].fault && !!t.cables[psuKey(i)];
// Cisco IMC system event log, power supply entries only (newest last); the scenario seeds the failure
function psuLog(sev, txt) { const e = T.psuEv || (T.psuEv = []); e.push({ at: Date.now(), sev, txt }); if (e.length > 9) e.splice(0, e.length - 9); }

/* ---- the rear face, in face units: photo, LEDs, spinning fan, power plug (base layer); strap and release lever (top layer) ---- */
function psuLedSvg(x, y, st, col) {
  if (st === 'off') return `<circle cx="${x}" cy="${y}" r="13" fill="#262829"/><circle cx="${x - 4}" cy="${y - 4}" r="4" fill="#5E6266" opacity=".7"/>`;
  return `<g${st === 'blink' ? ' class="blink"' : ''}><circle cx="${x}" cy="${y}" r="30" fill="${col}" opacity=".35"/><circle cx="${x}" cy="${y}" r="13.5" fill="${col}"/><circle cx="${x - 4}" cy="${y - 4}" r="4" fill="#FFFFFF" opacity=".8"/></g>`;
}
function psuSpin() {
  const [cx, cy] = PF.fan, p = (r, a) => `${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}`;
  let b = '';
  for (let k = 0; k < 7; k++) { const a0 = k * 2 * Math.PI / 7, a1 = a0 + 0.42; b += `<path d="M${p(97, a0)}A97 97 0 0 1 ${p(97, a1)}L${p(146, a1 + 0.28)}A146 146 0 0 0 ${p(146, a0 + 0.28)}Z" fill="#0C0E10"/>`; }
  return `<g opacity=".42"><animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="0.3s" repeatCount="indefinite"/>${b}</g>`;
}
// back of an IEC C13 plug pushed into the C14 inlet; the cord leaves it toward the viewer
const psuPlug = () => `<rect x="540" y="28" width="152" height="230" rx="20" fill="#16181B" stroke="#050607" stroke-width="3"/><rect x="556" y="44" width="120" height="198" rx="14" fill="none" stroke="#2C3036" stroke-width="3"/>${[70, 92, 194, 216].map(y => `<rect x="566" y="${y}" width="100" height="6" rx="3" fill="#24282D"/>`).join('')}<circle cx="616" cy="143" r="38" fill="#202328" stroke="#0A0B0D" stroke-width="3"/><circle cx="616" cy="143" r="24" fill="#111316"/>`;
function psuFaceBase(o) {
  let s = `<image href="${IMG.psuRear}" x="0" y="0" width="${PF.w}" height="${PF.h}"/>`;
  s += psuLedSvg(...PF.amber, o.a, '#FFB52E') + psuLedSvg(...PF.green, o.g, '#45D07F');
  if (o.spin) s += psuSpin();
  if (o.plug) s += psuPlug();
  return s;
}
// the hook-and-loop strap: fastened, it ties the cord to the handle; open, it hangs from the handle
function psuStrapSvg(on) {
  if (on) return `<path d="M446 206H636Q660 206 660 222Q660 238 636 238H446Q430 238 430 222Q430 206 446 206Z" fill="#121315" stroke="#000" stroke-width="2"/>${[460, 486, 512, 560, 586, 612].map(x => `<circle cx="${x}" cy="222" r="3.2" fill="#2E3136"/>`).join('')}<path d="M446 211H630" stroke="#34383E" stroke-width="2"/>`;
  return `<path d="M466 226L462 360Q462 372 474 372H486Q497 372 497 360L501 226Z" fill="#121315" stroke="#000" stroke-width="2"/>${[256, 286, 316, 346].map(y => `<circle cx="481" cy="${y}" r="3.2" fill="#2E3136"/>`).join('')}`;
}
function psuTabSvg(pinch, anim = '') {
  return `<g transform="translate(${pinch ? -22 : 0} 0)"><g>${anim}<path d="${PTAB}" fill="${PGREEN}" stroke="${PGREEN2}" stroke-width="3"/><path d="M710 78L818 66" stroke="#C4EA84" stroke-width="4" stroke-linecap="round"/><rect x="713" y="116" width="18" height="63" rx="3" fill="#3B5418"/></g></g>`;
}
const psuFaceTop = o => (o.strap ? psuStrapSvg(o.strap === 'on') : '') + psuTabSvg(o.pinch, o.tabAnim);

/* ---- indicators instead of a hand: a pulsing "Push here" arrow on the outer side of the green tab (push it toward the
   handle), "Pull here" on the handle (pull toward you), and "Push in" on a supply that is slid in but not locked.
   Drawn in rear-view pixels, so they keep their size. ---- */
const CUEA = '#FFB52E';
const cuePulse = (x, y, r0, r1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r0}" fill="none" stroke="${CUEA}" stroke-width="2.5"><animate attributeName="r" values="${r0};${r1}" dur="1.1s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.1s" repeatCount="indefinite"/></circle>`;
const cueArrow = (x0, x1, y) => { const d = `M${f1(x0)} ${f1(y)}H${f1(x1)}m10 -9l-10 9l10 9`; return `<path d="${d}" fill="none" stroke="#14202B" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${CUEA}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`; };
// push the tab toward the handle: the arrow points at its outer (right) edge; move = animation that follows the tab
function cuePushTab(x, y, label, move = '', fade = '', len = 54, below = false) {
  return `<g>${fade}<g>${move}${cuePulse(x + 2, y, 7, 19)}${cueArrow(x + len, x + 14, y)}<circle cx="${f1(x + 2)}" cy="${f1(y)}" r="6" fill="${CUEA}" stroke="#14202B" stroke-width="1.5"/></g>${below ? chip(x - 34, y + 36, label) : chip(x + 4, y + 31, label, 'start')}</g>`;
}
// pull the handle toward you: a ring with a dot, the tip of an arrow coming out of the picture
function cuePullHandle(x, y, fade = '') {
  return `<g>${fade}${cuePulse(x, y, 14, 28)}<circle cx="${f1(x)}" cy="${f1(y)}" r="14" fill="#14202B" fill-opacity=".8" stroke="${CUEA}" stroke-width="3"/><circle cx="${f1(x)}" cy="${f1(y)}" r="5" fill="${CUEA}"/>${chip(x, y + 44, 'Pull here, toward you')}</g>`;
}
// push the supply into the bay: a ring with a cross, the tail of an arrow going into the picture
function cuePushIn(x, y, label) {
  return `<g>${cuePulse(x, y, 16, 30)}<circle cx="${f1(x)}" cy="${f1(y)}" r="16" fill="none" stroke="${CUEA}" stroke-width="3.5"/>${chip(x, y + 44, label)}</g>`;
}
// the lever snapping back into the notch: a short burst of lines at the tab, and "Click"
function cueClick(x, y, a) {
  const ray = k => { const q = (-60 + k * 30) * Math.PI / 180; return `M${f1(x + 12 * Math.cos(q))} ${f1(y + 12 * Math.sin(q))}L${f1(x + 26 * Math.cos(q))} ${f1(y + 26 * Math.sin(q))}`; };
  return `<g opacity="0">${smil('opacity', '', '0;0;1;1;0', '0;0.3;0.38;0.75;1', 0.9, a)}<path d="${[0, 1, 2, 3, 4].map(ray).join('')}" stroke="${CUEA}" stroke-width="3" stroke-linecap="round"/>${chip(x + 30, y + 40, 'Click', 'start')}</g>`;
}
// the step the scenario expects next, when guidance is on (so a hint never points at the wrong move)
function psuNext() {
  if (!Sim.guide || !Sim.scenario) return null;
  const st = Sim.scenarios[Sim.scenario].steps.find(x => !x.done(T));
  return st && st.view === 'psu' && st.cue ? st.cue(T) : null;
}
const nextIs = (act, i) => { const c = psuNext(); return !!c && c.act === act && String(c.arg) === String(i); };
// the demonstration, in step with the tab and the bay: push the tab (0.2 to 0.28), keep it pushed and pull (0.3 to 0.6), let go
const DEMO_TAB = s => demoLoop('transform', 'translate', `0 0;0 0;${-22 * s} 0;${-22 * s} 0;${-22 * s} 0;0 0;0 0`, '0;0.2;0.28;0.5;0.62;0.7;1');
const DEMO_PUSH = () => demoLoop('opacity', '', '0;1;1;1;0;0', '0;0.06;0.5;0.62;0.68;1');
const DEMO_PULL = () => demoLoop('opacity', '', '0;0;1;1;0;0', '0;0.28;0.34;0.62;0.68;1');
// in the top view, arrows instead of a hand: where the thumb pushes, where the fingers hold and which way to pull
function psuTopArrows(anim = '') {
  const A = '#FFB52E';
  return `<g pointer-events="none">${anim}<path d="M640 404V428m-7 -8l7 8l7 -8" fill="none" stroke="${A}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="654" y="416" class="ss" style="fill:#FFD27A">push the green tab toward the handle</text>` +
    `<path d="M640 481H676m-8 -7l8 7l-8 7" fill="none" stroke="${A}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="684" y="478" class="ss" style="fill:#FFD27A">keep it pushed and pull</text><text x="684" y="492" class="ss" style="fill:#FFD27A">by the handle, straight back</text></g>`;
}
// timelines (age-based SMIL, so a redraw mid-movement carries on where it was)
const smil = (attr, type, values, keyTimes, dur, a, extra = '') => `<animate${type ? 'Transform' : ''} attributeName="${attr}"${type ? ` type="${type}"` : ''} values="${values}" keyTimes="${keyTimes}" dur="${dur}s" begin="-${a.toFixed(2)}s" fill="freeze"${extra}/>`;
const DEMO = 3.4;
const DEMO_ARM = `<animateTransform attributeName="transform" type="rotate" values="0 530 Y0;0 530 Y0;9 530 Y0;9 530 Y0;9 530 Y0;0 530 Y0;0 530 Y0" keyTimes="0;0.2;0.28;0.5;0.62;0.7;1" dur="3.4s" repeatCount="indefinite"/>`;   // the looping demonstration: reach, grip, pinch, pull a little, let go, withdraw
const demoLoop = (attr, type, values, keyTimes) => `<animate${type ? 'Transform' : ''} attributeName="${attr}"${type ? ` type="${type}"` : ''} values="${values}" keyTimes="${keyTimes}" dur="${DEMO}s" repeatCount="indefinite"/>`;

/* ---- rear elevation: the two bays, one above the other, in a close-up of the rear panel ---- */
function psuChassisSvg() {
  let g = `<rect x="334" y="58" width="438" height="314" fill="#A7AFB6" stroke="#5B636A" stroke-width="1.5"/>`;
  // right part of riser 2: three slot covers, then the VGA port, as on the rear panel to the left of the supplies
  [[90, 136], [154, 224], [240, 292]].forEach(([a, b]) => { g += `<rect x="338" y="${a}" width="56" height="${b - a}" rx="2" fill="#C2C8CE" stroke="#6E767D"/>${Array.from({ length: Math.floor((b - a - 10) / 9) }, (_, k) => `<rect x="346" y="${a + 7 + k * 9}" width="40" height="4" rx="2" fill="#7D858C"/>`).join('')}`; });
  g += `<path d="M342 316H394L388 346H348Z" fill="#2F5BA8" stroke="#1D3566"/><text x="368" y="364" text-anchor="middle" style="font:600 9px var(--font);fill:#2A2F35">VGA</text>`;
  g += `<rect x="752" y="58" width="20" height="314" fill="#8E979F"/>`;
  return g;
}
function psuBayBase(t, i) {
  const p = t.psu[i], [x0, y0] = pe(i, 0, 0), W = PF.w * PE.s, H = PF.h * PE.s, a = pfxAge(i), fx = psuFx[i];
  let g = `<rect x="${f1(x0 - 3)}" y="${f1(y0 - 3)}" width="${f1(W + 6)}" height="${f1(H + 6)}" fill="#07090B"/>`;
  if (p.st === 'out') {
    // empty bay: guide rails and, at the far end, the connector on the power distribution board
    const ix = x0 + 34, iy = y0 + 18, iw = W - 68, ih = H - 36;
    g += `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(W)}" height="${f1(H)}" fill="#0C1116"/><rect x="${f1(ix)}" y="${f1(iy)}" width="${f1(iw)}" height="${f1(ih)}" fill="#141B22" stroke="#2C3945"/>`;
    g += `<path d="M${f1(x0)} ${f1(y0)}L${f1(ix)} ${f1(iy)}M${f1(x0 + W)} ${f1(y0)}L${f1(ix + iw)} ${f1(iy)}M${f1(x0)} ${f1(y0 + H)}L${f1(ix)} ${f1(iy + ih)}M${f1(x0 + W)} ${f1(y0 + H)}L${f1(ix + iw)} ${f1(iy + ih)}" stroke="#2C3945" stroke-width="1.5"/>`;
    g += `<rect x="${f1(ix + iw * 0.18)}" y="${f1(iy + ih * 0.36)}" width="${f1(iw * 0.64)}" height="${f1(ih * 0.28)}" rx="3" fill="#1D232A" stroke="#3E4A55"/>${[0, 1, 2, 3, 4].map(k => `<rect x="${f1(ix + iw * (0.24 + k * 0.11))}" y="${f1(iy + ih * 0.46)}" width="${f1(iw * 0.07)}" height="3" fill="#C9A85A"/>`).join('')}`;
    g += `<text x="${f1(x0 + W / 2)}" y="${f1(y0 + 24)}" text-anchor="middle" class="ss" style="fill:#FFB52E">${PSUN(i)} bay empty</text>`;
    return g;
  }
  const L = psuLeds(t, i), set = p.st === 'set', cx = x0 + W / 2, cy = y0 + H / 2, sc = set ? 1.03 : 1, anim = psuBayAnim(i);
  g += `<g transform="translate(${f1(cx)} ${f1(cy)})"><g transform="scale(${sc})">${anim}<g transform="scale(${PE.s}) translate(-367.5 -150)">${psuFaceBase({ a: L.a, g: L.g, spin: psuFan(t, i), plug: !!t.cables[psuKey(i)] })}</g></g></g>`;
  if (set) g += `<rect x="${f1(x0 - 6)}" y="${f1(y0 - 6)}" width="${f1(W + 12)}" height="${f1(H + 12)}" fill="none" stroke="#FFB52E" stroke-width="2" stroke-dasharray="6 4" pointer-events="none"/>`;
  return g;
}
function psuBayAnim(i) {
  const fx = psuFx[i], a = pfxAge(i);
  if (T.psuDemo === i && T.psu[i].st === 'in') return demoLoop('transform', 'scale', '1;1;1;1.07;1.07;1;1', '0;0.2;0.3;0.48;0.6;0.72;1');
  return fx && fx.kind === 'insert' && a < 0.55 ? `<animateTransform attributeName="transform" type="scale" from="1.14" to="1.03" dur="0.5s" begin="-${a.toFixed(2)}s" fill="freeze"/>`
    : fx && fx.kind === 'push' && a < 0.3 ? `<animateTransform attributeName="transform" type="scale" from="1.03" to="1" dur="0.25s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : '';
}
// the supply coming out toward you in the hand that pulls it: grows a little, then fades as it leaves the bay
function psuGhost(t, i) {
  const fx = psuFx[i], a = pfxAge(i); if (t.psu[i].st !== 'out' || !fx || fx.kind !== 'pull' || a >= 0.9) return '';
  const [x0, y0] = pe(i, 0, 0), W = PF.w * PE.s, H = PF.h * PE.s;
  return `<g pointer-events="none" opacity="0">${smil('opacity', '', '1;1;0', '0;0.6;1', 0.85, a)}<g transform="translate(${f1(x0 + W / 2)} ${f1(y0 + H / 2)})"><g>${smil('transform', 'scale', '1;1.16;1.2', '0;0.75;1', 0.85, a)}<g transform="scale(${PE.s}) translate(-367.5 -150)">${psuFaceBase({ a: 'off', g: 'off' })}${psuFaceTop({ strap: 'open', pinch: true })}</g></g></g></g>`;
}
function psuBayTop(t, i) {
  const p = t.psu[i]; if (p.st === 'out') return '';
  const [x0, y0] = pe(i, 0, 0), W = PF.w * PE.s, H = PF.h * PE.s, sc = p.st === 'set' ? 1.03 : 1, fx = psuFx[i], a = pfxAge(i), pinch = t.psuPinch === i || p.st === 'set', demo = t.psuDemo === i;
  // the tab moves: while it is pushed, in the demonstration, and when it springs back into the notch with the click
  const tabAnim = demo ? demoLoop('transform', 'translate', '0 0;0 0;-22 0;-22 0;-22 0;0 0;0 0', '0;0.2;0.28;0.5;0.62;0.7;1') : t.psuPinch === i && fx && fx.kind === 'pinch' && a < 0.7 ? smil('transform', 'translate', '22 0;22 0;0 0', '0;0.55;1', 0.65, a)
    : fx && fx.kind === 'push' && a < 0.6 ? smil('transform', 'translate', '-22 0;-22 0;0 0', '0;0.7;1', 0.35, a) : '';
  return `<g transform="translate(${f1(x0 + W / 2)} ${f1(y0 + H / 2)})"><g transform="scale(${sc})">${psuBayAnim(i)}<g transform="scale(${PE.s}) translate(-367.5 -150)">${psuFaceTop({ strap: p.strap ? 'on' : 'open', pinch, tabAnim })}</g></g></g>`;
}
// the indicators on one bay
function psuBayCue(t, i) {
  const p = t.psu[i], fx = psuFx[i], a = pfxAge(i), [tx, ty] = pe(i, 836, 150), [hx, hy] = pe(i, 491, 150);
  if (p.st === 'out') return psuGhost(t, i) + (nextIs('psuBay', i) ? cuePushIn(...pe(i, 367, 150), 'Slide the new supply in here') : '');
  if (t.psuDemo === i && p.st === 'in') return cuePushTab(tx, ty, 'Push here', DEMO_TAB(PE.s), DEMO_PUSH()) + cuePullHandle(hx, hy, DEMO_PULL());
  if (t.psuPinch === i) return cuePushTab(tx - 22 * PE.s, ty, 'Keep it pushed') + (nextIs('psuPull', i) ? cuePullHandle(hx, hy) : '');
  if (p.st === 'set') return nextIs('psuBay', i) ? cuePushIn(...pe(i, 330, 150), 'Push it in here') : '';
  let g = fx && fx.kind === 'push' && a < 0.9 ? cueClick(tx + 2, ty, a) : '';
  if (nextIs('psuLever', i)) g += cuePushTab(tx, ty, 'Push here');
  return g;
}
// power cords: plugged in, they leave the plug toward the viewer and drop to the PDUs; unplugged, the plug hangs beside the bay
function psuCords(t) {
  let g = '';
  [1, 0].forEach(i => {
    const key = psuKey(i), on = !!t.cables[key] && t.psu[i].st !== 'out', [px, py] = pe(i, ...PF.plug);
    const path = on ? (i === 1 ? `M${f1(px)} ${f1(py)}C${f1(px)} 196 ${f1(px + 9)} 214 ${f1(px + 37)} 214H778Q792 214 792 228V372` : `M${f1(px)} ${f1(py)}V372`)
      : (i === 1 ? 'M792 372V346' : `M${f1(px)} 372V358`);
    g += `<path d="${path}" fill="none" stroke="#0D0F11" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="${path}" fill="none" stroke="#33383F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`;
    if (!on && (t.cables[key] || t.psuFeed[key])) {
      const [hx, hy] = i === 1 ? [792, 330] : [px, 344];
      g += `<path d="M${hx - 7} ${hy + 6}L${hx - 4} ${hy + 14}H${hx + 4}L${hx + 7} ${hy + 6}Z" fill="#0D0F11"/><rect x="${hx - 14}" y="${hy - 22}" width="28" height="29" rx="5" fill="#16181B" stroke="#050607" stroke-width="1.5"/><rect x="${hx - 11}" y="${hy - 28}" width="22" height="9" rx="2" fill="#24282D" stroke="#050607"/>${[-6, 0, 6].map((d, k) => `<rect x="${hx + d - 1.2}" y="${hy - (k === 1 ? 25 : 27)}" width="2.4" height="${k === 1 ? 3 : 4}" fill="#000"/>`).join('')}<text x="${hx}" y="${hy + 30}" text-anchor="middle" class="ss" style="font-size:10px">cord out</text>`;
    }
  });
  return g;
}
function psuElevation(t) {
  let g = `<rect x="18" y="44" width="864" height="334" rx="8" fill="#1B2B37" stroke="#2E5571"/><text x="34" y="64" class="st">Rear of the server, seen from behind the rack</text>`;
  // whole rear panel, small, with the close-up area marked
  g += `<g transform="translate(28 74) scale(0.5) translate(-170 -196)">${rearSchematic(t)}</g>`;
  g += `<rect x="221" y="76" width="84" height="67" fill="none" stroke="#FFB52E" stroke-width="2"/><path d="M305 76L334 58M305 143L334 372" stroke="#FFB52E" stroke-width="1.3" stroke-dasharray="5 4" fill="none"/>`;
  if (t.locator) g += chip(96, 168, 'Blue: unit identification LED') + `<path d="M96 156V140" stroke="#4AA8FF" stroke-width="2"/>`;
  g += psuChassisSvg();
  g += psuBayBase(t, 1) + psuBayBase(t, 0);
  g += `<g pointer-events="none">${psuCords(t)}</g>`;
  g += psuBayTop(t, 0) + psuBayTop(t, 1);
  [1, 0].forEach(i => { const y = PE.y[i] + 22; g += `<text x="808" y="${y}" class="st">${PSUN(i)}</text><text x="808" y="${y + 15}" class="ss">${i ? 'upper bay' : 'lower bay'}</text><text x="808" y="${y + 29}" class="ss">${t.psu[i].st === 'out' ? 'empty' : t.cables[psuKey(i)] ? (DESTS[t.cables[psuKey(i)]] || ['', '', 'PDU'])[2] : 'no cord'}</text>`; });
  g += `<g pointer-events="none">${psuBayCue(t, 0)}${psuBayCue(t, 1)}</g>`;
  // click zones, on top of every drawing
  [1, 0].forEach(i => {
    const p = t.psu[i], n = PSUN(i), [x0, y0] = pe(i, 0, 0), W = PF.w * PE.s, H = PF.h * PE.s, key = psuKey(i), z = (act, u0, v0, u1, v1, label, rx = 4) => { const [a, b] = pe(i, u0, v0), [c, d] = pe(i, u1, v1); return `<g${hot(act, i, `${n}: ${label}`)}><rect x="${f1(a)}" y="${f1(b)}" width="${f1(c - a)}" height="${f1(d - b)}" rx="${rx}" class="zone"/></g>`; };
    if (p.st === 'out') { g += `<g${hot('psuBay', i, `${n} bay, empty`)}><rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(W)}" height="${f1(H)}" rx="4" class="zone"/></g>`; return; }
    if (p.st === 'set') { g += `<g${hot('psuBay', i, `${n}: slid in, not locked. Push it home`)}><rect x="${f1(x0 - 4)}" y="${f1(y0 - 4)}" width="${f1(W + 8)}" height="${f1(H + 8)}" rx="4" class="zone"/></g>`; return; }
    g += `<g${hot('psuSel', i, `${n}: rear face`)}><rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(W)}" height="${f1(H)}" rx="4" class="zone"/></g>`;
    g += z('psuLed', 2, 52, 66, 270, 'status and fault LEDs');
    g += z('psuPull', 440, 4, 538, 196, 'handle');
    g += z('psuCord', 548, 24, 690, 196, t.cables[key] ? 'power cord plug' : 'AC inlet, no cord');
    g += z('psuStrap', p.strap ? 432 : 456, p.strap ? 202 : 230, p.strap ? 662 : 506, p.strap ? 242 : 300, p.strap ? 'hook-and-loop strap, fastened' : 'hook-and-loop strap, open', 8);
    g += z('psuLever', t.psuPinch === i ? 676 : 698, 50, t.psuPinch === i ? 818 : 840, 250, 'green release lever', 8);
  });
  [1, 0].forEach(i => {
    const key = psuKey(i); if (t.cables[key] || !t.psuFeed[key] || t.psu[i].st === 'out') return;
    const [px] = pe(i, ...PF.plug), [hx, hy] = i === 1 ? [792, 330] : [px, 344];
    g += `<g${hot('psuCord', i, `${PSUN(i)}: power cord, unplugged`)}><rect x="${f1(hx - 20)}" y="${hy - 32}" width="40" height="44" rx="6" class="zone"/></g>`;
  });
  return g;
}
// LED reading for each supply, beside the close-up
function psuLedLegend(t) {
  let g = `<text x="30" y="${t.locator ? 200 : 178}" class="st" style="font-size:12.5px">Power supply LEDs</text>`;
  [1, 0].forEach((i, k) => {
    const y = (t.locator ? 220 : 198) + k * 82, L = psuLeds(t, i), dot = (x, st, col, lab) => `<circle cx="${x}" cy="${y + 20}" r="7" fill="${st === 'off' ? '#2E3338' : col}" stroke="#8E99A3"${st === 'blink' ? ' class="blink"' : ''}/><text x="${x + 12}" y="${y + 24}" class="ss">${lab}</text>`;
    g += `<text x="30" y="${y}" class="ss" style="fill:#EAF2F7;font-weight:700">${PSUN(i)} (${i ? 'upper' : 'lower'})</text>` + dot(38, L.g, '#45D07F', 'status') + dot(104, L.a, '#FFB52E', 'fault');
    wrapLines(L.txt, 46).slice(0, 3).forEach((ln, j) => { g += `<text x="30" y="${y + 44 + j * 13}" class="ss" style="font-size:10.5px">${esc(ln)}</text>`; });
  });
  return g;
}
function wrapLines(s, n) { const out = []; let cur = ''; String(s).split(' ').forEach(w => { if ((cur + ' ' + w).trim().length > n) { out.push(cur.trim()); cur = w; } else cur += ' ' + w; }); if (cur.trim()) out.push(cur.trim()); return out; }

/* ---- top view of one bay, cover cut away: how the release lever holds the supply ----
   The lever is a spring arm on the lever side of the supply, fixed at its inner end. A hook on the arm sits in a notch
   in the bay wall; the green finger tab is the arm's free end. Pinching the tab toward the handle bends the arm in and
   lifts the hook out of the notch. Sliding in, the wall presses the hook in; at the end of travel it snaps into the notch. */
const PT = { s: 0.34, xR: 600, y0: 436, L: 920 * 0.34, W: 400 * 0.34, notch: [566, 580] };
const psuFocus = t => { const p = t.psuPinch; if (p !== null && p !== undefined) return p; const o = t.psu.findIndex(x => x.st !== 'in'); if (o >= 0) return o; const s = t.sel.psu; return s === 0 || s === 1 ? s : 1; };
// the lever arm, hook and finger tab at offset dx; bent = pinched, or pressed in by the wall
function psuArm(bent, anim = '') {
  const y = PT.y0 + 2.5;
  return `<g transform="rotate(${bent ? 9 : 0} 530 ${y})">${anim.replace(/Y0/g, y)}<path d="M530 ${y}H600" stroke="#2F4A16" stroke-width="3.2" stroke-linecap="round"/><path d="M566 ${y}L576 ${y - 8.5}H579V${y}Z" fill="${PGREEN}" stroke="${PGREEN2}" stroke-width="1"/><path d="M598 ${y + 1}L627 ${y - 5}V${y - 21}L598 ${y - 13}Z" fill="${PGREEN}" stroke="${PGREEN2}" stroke-width="1.2"/></g><circle cx="530" cy="${y}" r="2.6" fill="#1B2A0D"/>`;
}
function psuWalls(i) {
  const [n0, n1] = PT.notch;
  return `<rect x="252" y="${PT.y0 - 9}" width="${n0 - 252}" height="8" fill="#9AA3AB" stroke="#5B636A"/><rect x="${n1}" y="${PT.y0 - 9}" width="${PT.xR - n1}" height="8" fill="#9AA3AB" stroke="#5B636A"/><rect x="${n0}" y="${PT.y0 - 9}" width="${n1 - n0}" height="8" fill="#0B1014"/>` +
    `<rect x="252" y="${PT.y0 + PT.W + 1}" width="${PT.xR - 252}" height="8" fill="#9AA3AB" stroke="#5B636A"/><rect x="${PT.xR}" y="${PT.y0 - 24}" width="5" height="${PT.W + 46}" fill="#6E767D"/>`;
}
function psuBody(t, i, dx, bent, mag, hand = '', armAnim = '') {
  // the supply seen from above: label face, handle loop at the rear end, cord stub, lever arm
  const y0 = PT.y0, x0 = PT.xR - PT.L, hy = v => y0 + (PF.w - v) / PF.w * PT.W, plug = !!t.cables[psuKey(i)] && t.psu[i].st !== 'out';
  let g = mag ? `<rect x="${f1(x0)}" y="${y0}" width="${f1(PT.L)}" height="${f1(PT.W)}" fill="#B9C0C6"/>` : `<image href="${IMG.psuTop}" x="${f1(x0)}" y="${y0}" width="${f1(PT.L)}" height="${f1(PT.W)}"/>`;
  // the label (photo units 47..483 x 12..344), text running up the page as on the real unit
  if (!mag) { const lx0 = x0 + 47 * PT.s, ly0 = y0 + 12 * PT.s, lw = 436 * PT.s, lh = 332 * PT.s; g += `<g transform="translate(${f1(lx0)} ${f1(ly0 + lh)}) rotate(-90)">${psuSerials(psuSn(t.psu[i]), lh, lw)}</g>`; }
  g += `<rect x="598" y="${f1(hy(527))}" width="30" height="${f1(hy(455) - hy(527))}" rx="5" fill="#111315"/><rect x="603" y="${f1(hy(527) + 3)}" width="20" height="${f1(hy(455) - hy(527) - 6)}" rx="3" fill="#26292D"/>`;
  if (plug) g += `<rect x="600" y="${f1(hy(690))}" width="26" height="${f1(hy(540) - hy(690))}" rx="3" fill="#16181B"/><path d="M626 ${f1((hy(690) + hy(540)) / 2)}H660" stroke="#0D0F11" stroke-width="8" stroke-linecap="round"/>`;
  g += psuArm(bent, armAnim) + hand;
  return `<g transform="translate(${f1(dx)} 0)">${g}</g>`;
}
function psuTopSvg(t) {
  const i = psuFocus(t), p = t.psu[i], a = pfxAge(i), fx = psuFx[i], n = PSUN(i);
  let g = `<rect x="18" y="386" width="864" height="240" rx="8" fill="#16293A" stroke="#2E5571"/><text x="34" y="406" class="st">Top view of the ${n} bay, cover cut away: the release lever</text>`;
  g += `<rect x="236" y="414" width="364" height="170" fill="#0F171E"/><rect x="238" y="${PT.y0 + 14}" width="12" height="${PT.W - 28}" fill="#1B232B" stroke="#3E4A55"/>${[0, 1, 2, 3, 4].map(k => `<rect x="240" y="${PT.y0 + 24 + k * 19}" width="8" height="3" fill="#C9A85A"/>`).join('')}`;
  g += `<path d="M244 ${PT.y0 + PT.W - 8}V${PT.y0 + PT.W + 14}" stroke="#C5CCD3" stroke-width="1"/><text x="248" y="${PT.y0 + PT.W + 26}" class="ss">connector on the power distribution board</text><text x="604" y="${PT.y0 + PT.W + 26}" class="ss">rear of the chassis</text>`;
  g += psuWalls(i);
  // the supply: in place, slid in but not locked, or moving
  const pinch = t.psuPinch === i, bentNow = pinch || p.st === 'set', demo = t.psuDemo === i && p.st === 'in';
  let body = '';
  if (demo) {
    // demonstration: reach, grip, pinch (hook out of the notch), pull a little, ease back, let go
    body = `<g>${demoLoop('transform', 'translate', '0 0;0 0;0 0;46 0;46 0;0 0;0 0', '0;0.2;0.3;0.48;0.6;0.72;1')}${psuBody(t, i, 0, false, false, '', DEMO_ARM)}</g>`;
  } else if (p.st === 'in' || p.st === 'set') {
    const dx = p.st === 'set' ? 14 : 0, freshPinch = pinch && fx && fx.kind === 'pinch' && a < 0.7;
    const hand = '';
    const anim = fx && fx.kind === 'insert' && a < 0.55 ? `<animateTransform attributeName="transform" type="translate" from="290 0" to="14 0" dur="0.5s" begin="-${a.toFixed(2)}s" fill="freeze"/>`
      : fx && fx.kind === 'push' && a < 0.3 ? `<animateTransform attributeName="transform" type="translate" from="14 0" to="0 0" dur="0.25s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : '';
    body = anim ? `<g>${anim}${psuBody(t, i, 0, bentNow && !(fx.kind === 'push'), false, hand)}</g>` : psuBody(t, i, dx, bentNow, false, hand);
  } else if (fx && fx.kind === 'pull' && a < 0.9) {
    body = `<g opacity="0"><animate attributeName="opacity" values="1;1;0" keyTimes="0;0.65;1" dur="0.85s" begin="-${a.toFixed(2)}s" fill="freeze"/><g><animateTransform attributeName="transform" type="translate" from="0 0" to="300 0" dur="0.8s" begin="-${a.toFixed(2)}s" fill="freeze"/>${psuBody(t, i, 0, true, false)}</g></g>`;
  } else body = `<rect x="${f1(PT.xR - PT.L)}" y="${PT.y0}" width="${f1(PT.L)}" height="${f1(PT.W)}" fill="none" stroke="#FFB52E" stroke-dasharray="6 5"/><text x="${f1(PT.xR - PT.L / 2)}" y="${PT.y0 + PT.W / 2 + 5}" text-anchor="middle" class="st" style="fill:#FFB52E">${n} bay empty</text>`;
  g += `<g clip-path="url(#psuClipB)">${body}</g>`;
  // magnifier on the hook and the notch
  const hookBent = p.st === 'out' ? false : bentNow, mx = 122, my = 492, MS = 3, hx = 573, hyy = PT.y0 - 2;
  let mag = `<rect x="${mx - 80}" y="${my - 80}" width="160" height="160" fill="#0F171E"/><g transform="translate(${mx} ${my}) scale(${MS}) translate(${-hx} ${-hyy})">${psuWalls(i)}`;
  if (p.st !== 'out') mag += demo ? `<g>${demoLoop('transform', 'translate', '0 0;0 0;0 0;46 0;46 0;0 0;0 0', '0;0.2;0.3;0.48;0.6;0.72;1')}${psuBody(t, i, 0, false, true, '', DEMO_ARM)}</g>` : psuBody(t, i, p.st === 'set' ? 14 : 0, hookBent, true);
  mag += `</g>`;
  g += `<defs><clipPath id="psuMag"><circle cx="${mx}" cy="${my}" r="74"/></clipPath><clipPath id="psuClipB"><rect x="236" y="390" width="644" height="202"/></clipPath></defs><g clip-path="url(#psuMag)" pointer-events="none">${mag}</g><circle cx="${mx}" cy="${my}" r="74" fill="none" stroke="#C5CCD3" stroke-width="2.5"/>`;
  g += `<path d="M${mx + 52} ${my - 53}L262 420H${hx - 10}" fill="none" stroke="#C5CCD3" stroke-width="1.2" stroke-dasharray="4 3" pointer-events="none"/>`;
  const locked = p.st === 'in' && !pinch;
  const magTxt = demo ? 'watch the hook leave the notch' : p.st === 'out' ? 'empty notch in the bay wall' : p.st === 'set' ? 'hook pressed in by the wall' : pinch ? 'hook clear of the notch' : 'hook in the notch: locked';
  g += `<g pointer-events="none"><text x="${mx}" y="${my + 92}" text-anchor="middle" class="ss">Magnified 3 times:</text><text x="${mx}" y="${my + 106}" text-anchor="middle" class="ss" style="fill:#EAF2F7;font-weight:600">${magTxt}</text></g>`;
  const msg = demo ? ['Demonstration: push the green tab toward the handle, keep it pushed, then pull by the handle.', '#7CC4FF'] : p.st === 'out' ? ['Bay empty: the new supply goes in the same way up as the other one, lever on this side.', '#FFB52E']
    : p.st === 'set' ? ['Slid in: the bay wall presses the hook in. Push until it clicks into the notch.', '#FFB52E']
      : pinch ? ['Pinched: the hook is out of the notch. Pull by the handle and support the supply underneath.', '#45D07F']
        : ['Locked: the hook sits in the notch, so the supply cannot be pulled out.', '#C5CCD3'];
  g += `<text x="248" y="${PT.y0 + PT.W + 46}" class="ss" style="fill:${msg[1]};font-weight:600">${esc(msg[0])}</text>`;
  // labels with leaders
  const handShown = demo || pinch;
  if (handShown) g += psuTopArrows(demo ? demoLoop('opacity', '', '0;0;1;1;1;0;0', '0;0.18;0.22;0.6;0.66;0.7;1') : '');
  if (p.st !== 'out' && !handShown) g += `<g pointer-events="none"><path d="M${636} ${PT.y0 - 14}H680" stroke="#C5CCD3" stroke-width="1"/><text x="684" y="${PT.y0 - 10}" class="ss">green finger tab: push toward the handle</text><path d="M634 ${f1(PT.y0 + (PF.w - 491) / PF.w * PT.W)}H680" stroke="#C5CCD3" stroke-width="1"/><text x="684" y="${f1(PT.y0 + (PF.w - 491) / PF.w * PT.W + 4)}" class="ss">handle</text></g>`;
  // click zones: tab and handle when locked in place, the body when not locked, the empty bay
  if (p.st === 'in') {
    g += `<g${hot('psuLever', i, `${n}: green release lever, top view`)}><rect x="594" y="${PT.y0 - 26}" width="38" height="${pinch ? 46 : 30}" rx="5" class="zone"/></g>`;
    g += `<g${hot('psuPull', i, `${n}: handle, top view`)}><rect x="598" y="468" width="36" height="26" rx="5" class="zone"/></g>`;
  } else g += `<g${hot('psuBay', i, p.st === 'set' ? `${n}: push it home` : `${n} bay, empty`)}><rect x="${f1(PT.xR - PT.L + (p.st === 'set' ? 14 : 0))}" y="${PT.y0}" width="${f1(PT.L)}" height="${f1(PT.W)}" rx="4" class="zone"/></g>`;
  return g;
}

function psuGripPanel(t, X, Y) {
  const i = t.psuDemo !== null && t.psuDemo !== undefined ? t.psuDemo : t.psuPinch, demo = t.psuDemo === i, a = pfxAge(i), fx = psuFx[i];
  const pinching = !demo && fx && fx.kind === 'pinch' && a < 0.7;
  const tabAnim = demo ? DEMO_TAB(1) : pinching ? smil('transform', 'translate', '22 0;22 0;0 0', '0;0.55;1', 0.65, a) : '';
  // magnified: the face of the supply round the handle and the tab (face units 300..900 x 0..312)
  const WX = X + 16, WY = Y + 30, WW = 300, WH = 156, k = 0.5, U0 = 300, V0 = 0, M = (u, v) => [WX + (u - U0) * k, WY + (v - V0) * k];
  let g = `<text x="${X + 14}" y="${Y + 22}" class="st">How to release it (magnified)</text><defs><clipPath id="psuGripW"><rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" rx="6"/></clipPath></defs>`;
  g += `<g clip-path="url(#psuGripW)"><rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" fill="#A7AFB6"/><g transform="translate(${f1(WX - U0 * k)} ${f1(WY - V0 * k)}) scale(${k.toFixed(4)})">${psuFaceBase({ a: 'off', g: 'off' })}${psuFaceTop({ strap: 'open', pinch: !demo, tabAnim })}</g>`;
  const [tx, ty] = M(836, 110), [hx, hy] = M(491, 120);
  g += demo ? cuePushTab(tx, ty, 'Push here', DEMO_TAB(k), DEMO_PUSH(), 30, true) + cuePullHandle(hx, hy, DEMO_PULL()) : cuePushTab(tx - 22 * k, ty, 'Keep it pushed', '', '', 30, true) + cuePullHandle(hx, hy);
  g += `</g><rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" rx="6" fill="none" stroke="#45D07F" stroke-width="1.5"/>`;
  const steps = [['Push here: the green tab, toward the handle', 'push it from its outer side, with your thumb'], ['Keep it pushed', 'the hook on the lever leaves the notch in the bay wall'], ['Pull here: the handle, straight toward you', 'index and middle finger round it'], ['Support the supply underneath', 'as it comes free of the bay']];
  steps.forEach(([p, q], n) => { const yy = Y + 52 + n * 36; g += `<circle cx="${X + 344}" cy="${yy - 4}" r="9.5" fill="#F2B53A" stroke="#14202B" stroke-width="1.5"/><text x="${X + 344}" y="${yy}" text-anchor="middle" style="font:700 11px var(--font);fill:#14202B">${n + 1}</text><text x="${X + 362}" y="${yy - 3}" class="st" style="font-size:12.5px">${esc(p)}</text><text x="${X + 362}" y="${yy + 11}" class="ss">${esc(q)}</text>`; });
  return g;
}

/* ---- in your hand: the label, the rear face and the connector end of the module you hold ---- */
function psuHandSvg(t) {
  const X = 18, Y = 634, h = t.psuHand;
  let g = `<rect x="${X}" y="${Y}" width="864" height="196" rx="8" fill="#16293A" stroke="#2E5571"/>`;
  const call = (k, x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="#F2B53A" stroke="#14202B" stroke-width="1.5"/><text x="${f1(x)}" y="${f1(y + 4)}" text-anchor="middle" style="font:700 11px var(--font);fill:#14202B">${k}</text>`;
  if (!h && ((t.psuDemo !== null && t.psuDemo !== undefined) || (t.psuPinch !== null && t.psuPinch !== undefined))) return g + psuGripPanel(t, X, Y);
  if (!h) {
    const out = t.psu.findIndex(p => p.st === 'out');
    const tip = out >= 0 ? (t.psuRma || !t.flags.psuPulled ? (t.psuSpare ? 'Bay empty. Pick up the new supply from the cart (Parts panel): it appears here, drawn large.' : 'Bay empty. Check the spares on the cart first (Parts panel).') : 'Set the failed supply aside first.')
      : 'Nothing in your hand. To remove a supply: cord out, then push the green release lever toward the handle, keep it pushed and pull.';
    g += `<text x="${X + 14}" y="${Y + 22}" class="st">In your hand</text><text x="450" y="${Y + 104}" text-anchor="middle" class="ss">${esc(tip)}</text>`;
    if (t.psuRma) g += `<text x="450" y="${Y + 126}" text-anchor="middle" class="ss" style="fill:#FFB52E">The failed supply is tagged and set aside for return.</text>`;
    return g;
  }
  const kind = { failed: 'Failed supply, for return', new: `New supply ${PSU_PID}`, healthy: 'Healthy supply: put it back' }[h.kind];
  g += `<text x="${X + 14}" y="${Y + 22}" class="st">In your hand: ${esc(kind)}</text>`;
  // the top of the module: the Cisco logo sticker and the label with the unit's serial numbers
  const lx = X + 14, ly = Y + 32;
  g += `<rect x="${lx - 4}" y="${ly - 2}" width="124" height="156" rx="4" fill="#A9B0B6"/><image href="${IMG.psuLogo}" x="${lx + 22}" y="${ly + 2}" width="72" height="56"/>`;
  g += `<rect x="${lx}" y="${ly + 62}" width="116" height="88" rx="4" fill="#EEEEE9" stroke="#9AA0A5"/><g transform="translate(${lx} ${ly + 62})">${psuSerials(h.sn || (h.kind === 'new' ? 'LAB0PSU0007' : 'LAB0PSU0002'), 116, 88)}</g>` + call(1, lx + 126, ly + 106);
  // rear face with its lever and handle, and the connector end
  const rx = X + 152, ry = Y + 48, rs = 0.4;
  g += `<g transform="translate(${rx} ${ry}) scale(${rs})">${psuFaceBase({ a: 'off', g: 'off' })}${psuFaceTop({})}</g>`;
  g += call(2, rx + 770 * rs, ry - 6) + call(3, rx + 491 * rs, ry - 6) + call(4, rx + 616 * rs, ry - 6) + call(5, rx + 32 * rs, ry - 6);
  const ex = X + 512, ey = Y + 48, es = 0.42;
  g += `<image href="${IMG.psuEnd}" x="${ex}" y="${ey}" width="${f1(720 * es)}" height="${f1(300 * es)}"/>` + call(6, ex + 290 * es, ey - 4);
  g += `<text x="${rx}" y="${Y + 188}" class="ss">Rear face: 2 release lever, 3 handle, 4 AC inlet, 5 LEDs</text><text x="${ex}" y="${Y + 188}" class="ss">Connector end: 6 gold contacts, clean and undamaged</text>`;
  const badge = h.kind === 'failed' ? ['FAILED', '#9B2C22'] : h.kind === 'new' ? ['NEW', '#1E7A45'] : ['HEALTHY', '#3A5A78'];
  g += `<rect x="${X + 770}" y="${Y + 8}" width="84" height="22" rx="4" fill="${badge[1]}"/><text x="${X + 812}" y="${Y + 23}" text-anchor="middle" style="font:700 11px var(--font);fill:#FFFFFF">${badge[0]}</text>`;
  return g;
}

Sim.registerView({
  id: 'psu', title: 'Power supplies',
  keep: [
    ['Hot-swap needs two supplies', 'With two power supplies installed they are redundant as 1+1, so you can replace one without shutting the server down. With only one supply, shut the server down and power it off first.'],
    ['Identical supplies', 'Do not mix power supply types or wattages in the server: both supplies must be identical. Compare the product ID on the spare with the one Cisco IMC shows for the failed unit.'],
    ['Find the right one', 'The failed supply has a solid amber fault LED. Turn the locator LED on, so you work on the right server at the rear of the rack, and check which supply is still green before you touch any cord.'],
    ['Cord first', 'Remove the power cord from the supply you are replacing before you pull it out. Leave the working supply alone: while you work, it carries the whole server.'],
    ['The grip', 'Put your index and middle finger round the handle and your thumb on the outside of the green release lever. Squeeze the thumb toward the fingers: the lever moves toward the handle and its hook leaves the notch in the bay. Keep squeezing and pull straight back, supporting the supply underneath as it comes free.'],
    ['Fitting the new one', 'Slide it in by the handle, the same way up as the other supply, and push it home. The release lever clicks into place by itself: you do not touch the lever. Only then connect the power cord and fasten the strap around it.'],
    ['Read the LEDs', 'Solid green with no amber means the supply delivers main power. Amber with green off on a supply that has no cord means no AC input while the other supply runs the server.'],
    ['Low line, lower rating', 'This supply is rated 1200 W on 200 to 240 V, but only 800 W on 100 to 120 V. One supply must be able to carry the whole server on its own.'],
    ['Return the failed unit', 'Tag the failed supply and return it in the packaging of the replacement, following the return instructions for the spare.']],
  render(t) {
    return frame('Power supplies (hot-swap)', psuElevation(t) + psuLedLegend(t) + psuTopSvg(t) + psuHandSvg(t), 838);
  },
  actions(t) {
    const a = [], i = t.sel.psu, h = t.psuHand;
    if (!t.esd) a.push(button('Put on the ESD wrist strap', 'esd'));
    const f = psuFocus(t), fp = t.psu[f];
    if (fp.st === 'in' && !t.cables[psuKey(f)] && t.psuPinch !== f && !h) a.push(button(t.psuDemo === f ? 'Stop the demonstration' : `Show how: push the tab, pull the handle (${PSUN(f)})`, 'psuDemo', f));
    if (i === 0 || i === 1) {
      const p = t.psu[i], n = PSUN(i), cord = !!t.cables[psuKey(i)];
      if (p.st === 'in') {
        if (p.strap) a.push(button(`Undo the cord strap on ${n}`, 'psuStrap', i));
        else if (cord) a.push(button(`Fasten the strap around the ${n} cord`, 'psuStrap', i));
        a.push(button(cord ? `Unplug the ${n} power cord` : `Connect the ${n} power cord`, 'psuCord', i));
        if (!cord) a.push(button(t.psuPinch === i ? 'Let go of the release lever' : `Push the ${n} release lever toward the handle`, 'psuLever', i));
        if (t.psuPinch === i) a.push(button(`Pull ${n} out by its handle`, 'psuPull', i, true));
      } else if (p.st === 'set') a.push(button(`Push ${n} home (the lever clicks into place)`, 'psuBay', i, true));
      else if (h && h.kind !== 'failed') a.push(button(`Slide the supply into the ${n} bay`, 'psuBay', i, true));
    }
    if (h && h.kind === 'failed') a.push(button('Set the failed supply aside for return', 'psuAside'));
    return a;
  },
  tray(t) {
    const used = t.flags.psuSpareUsed, h = t.psuHand, out = t.psu.some(p => p.st === 'out');
    let s = `<h2>Spares on the cart</h2>`;
    if (!t.psuSpare) s += `<p class="cap" style="font-size:13px;margin:0 0 8px">Two cartons. Read each label and take the one that matches the failed supply.</p>` +
      [['1200', 'UCSC-PSU2V2-1200W=', '1200 W AC power supply, 80 PLUS Platinum'], ['650', 'UCSC-PSU2V2-650W=', '650 W AC power supply']].map(([id, pid, d]) => `<div class="item"><span>Spare carton<small style="font-family:var(--mono)">${pid}</small><small>${d}</small></span>${button('Take this one', 'psuSpare', id)}</div>`).join('');
    else s += `<div class="item${h && h.kind === 'new' ? ' sel' : ''}"><span>New power supply<small style="font-family:var(--mono)">${PSU_PID}=</small><small>Label checked: same product ID and wattage</small>${used ? '<small style="color:var(--touch)">&#10003; Fitted</small>' : h && h.kind === 'new' ? '<small style="color:var(--touch)">In your hand</small>' : ''}</span>${used || (h && h.kind === 'new') || !out ? '' : button('Pick up', 'psuPick')}</div>`;
    if (t.psuRma) s += `<h3>Set aside for return</h3><p class="cap" style="font-size:13px;margin:0">The failed supply, tagged for return.</p>`;
    s += `<h3>The module</h3><ul class="rules"><li>1 Cisco logo, and the label with the unit's serial numbers (invented lab values)</li><li>2 Green release lever: push it toward the handle to unlock; it clicks back into place by itself when a supply is pushed home</li><li>3 Handle, with the hook-and-loop strap for the cord</li><li>4 AC inlet (IEC C14)</li><li>5 Status LED (green) and fault LED (amber)</li><li>6 Connector end: gold contacts that plug into the power distribution board</li></ul>`;
    return s;
  },
  after() {
    clearTimeout(psuTimer); const left = [0, 1].map(pfxAge).filter(a => a < 1);
    if (left.length) psuTimer = setTimeout(() => { if (Sim.view === 'psu' && T) render(); }, (1 - Math.min(...left)) * 1000 + 40);
  }
});

/* ---- each unit's invented serial numbers, printed on its label with barcodes ---- */
const psuSn = p => (p && p.sn) || 'LAB0PSU0000';
function psuBars(code, x, y, w, h) {
  let s = '', seed = 7; for (const ch of code) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
  let u = x; while (u < x + w - 1.5) { seed = (seed * 73 + 41) % 9973; const bw = [0.9, 0.9, 1.6, 2.3][seed % 4], gap = [0.9, 1.6, 0.9, 1.3][(seed >> 2) % 4]; s += `<rect x="${f1(u)}" y="${f1(y)}" width="${bw}" height="${f1(h)}" fill="#1E2023"/>`; u += bw + gap; }
  return s;
}
// w along the text, h across it; drawn in a frame of its own (the caller places and turns it)
function psuSerials(sn, w, h) {
  const pcb = 'LAB0PCB447' + sn.slice(-1), fs = Math.max(6, Math.min(9, h / 9)), lh = h / 2;
  return [[`SN: ${sn}`, sn], [`PCB SN: ${pcb}`, pcb]].map(([txt, code], k) => { const y = k * lh + lh * 0.16;
    return psuBars(code, w * 0.1, y, w * 0.8, lh * 0.44) + `<text x="${f1(w / 2)}" y="${f1(y + lh * 0.44 + fs + 1)}" text-anchor="middle" style="font:600 ${f1(fs)}px var(--mono);fill:#1E2023">${txt}</text>`; }).join('');
}
/* ---- actions ---- */
const psuAct = (name, fn) => Sim.on(name, a => { if (name !== 'psuDemo') T.psuDemo = null; fn(a); });
psuAct('psuDemo', i => {
  i = +i; if (T.psuDemo === i) { T.psuDemo = null; return say('info', 'Demonstration stopped.'); }
  T.psuDemo = i; T.sel.psu = i;
  say('info', `Watch ${PSUN(i)}: push the green tab toward the handle (Push here), keep it pushed, and pull the supply out by the handle (Pull here). Nothing changes until you do it yourself.`);
});
const lastGood = i => T.power === 'on' && psuGood(T, i) && !psuGood(T, 1 - i);
const lastGoodMsg = i => `Stop: ${PSUN(i)} is the only supply that works, and it carries the whole running server. Unplugging or pulling it now cuts the power. ${T.psu[1 - i].st === 'in' && T.psu[1 - i].fault ? `The failed supply is ${PSUN(1 - i)}: its fault LED is amber.` : `${PSUN(1 - i)} is not delivering power yet.`}`;
psuAct('psuSel', i => {
  i = +i; T.sel.psu = i; const p = T.psu[i];
  say('info', `${PSUN(i)} selected. ${psuLeds(T, i).txt}.${p.st === 'in' && T.cables[psuKey(i)] ? ' Its power cord is in.' : ''}`);
});
psuAct('psuLed', i => {
  i = +i; T.sel.psu = i; const p = T.psu[i], L = psuLeds(T, i);
  if (p.st === 'in' && p.fault) { T.flags.psuFound = true; return say('ok', `${PSUN(i)}: ${L.txt}. This is the failed supply.`); }
  say('info', `${PSUN(i)}: ${L.txt}.${psuGood(T, i) ? ' It is healthy.' : ''}`);
});
psuAct('psuStrap', i => {
  i = +i; T.sel.psu = i; const p = T.psu[i]; if (p.st === 'out') return;
  p.strap = !p.strap;
  say('info', p.strap ? (T.cables[psuKey(i)] ? `Strap on ${PSUN(i)} fastened around the cord: the plug cannot be pulled out by accident.` : 'Strap fastened, but there is no cord to hold yet.') : `Hook-and-loop strap on ${PSUN(i)} undone: the cord is free.`);
});
psuAct('psuCord', i => {
  i = +i; T.sel.psu = i; const p = T.psu[i], key = psuKey(i), n = PSUN(i);
  if (T.cables[key]) {
    if (lastGood(i)) return bad(lastGoodMsg(i));
    if (p.strap) return say('warn', `The hook-and-loop strap ties the ${n} cord to the handle. Undo the strap first.`);
    T.psuFeed[key] = T.cables[key]; T.cables[key] = null;
    if (p.st === 'in' && p.fault) { T.flags.psuCordOut = true; psuLog('Major', `${key.toUpperCase()}_STATUS: Power Supply sensor for ${key.toUpperCase()}, Power Supply input lost (AC/DC) was asserted`); return say('ok', `Power cord pulled out of the ${n} inlet. ${PSUN(1 - i)} carries the server alone.`); }
    return say('warn', `${n} cord unplugged. The server keeps running on the other supply, but redundancy is lost.`);
  }
  if (p.st === 'out') return bad(`The ${n} bay is empty. Fit a supply before you connect the cord.`);
  if (p.st === 'set') return bad(`${n} is not locked in yet: its connector is not engaged. Push the supply home until the lever clicks, then connect the cord.`);
  T.cables[key] = T.psuFeed[key] || (i ? 'pduB' : 'pduA');
  if (psuGood(T, i)) { psuLog('Normal', `${key.toUpperCase()}_STATUS: Power Supply sensor for ${key.toUpperCase()}, Power Supply input lost (AC/DC) was deasserted`); if (psuBoth(T)) psuLog('Normal', 'PSU_REDUNDANCY: PS Redundancy sensor, Fully Redundant was asserted'); }
  say('ok', `Power cord pushed fully into the ${n} inlet (${portTxtC(T.cables[key], cabN(T, key))}). ${psuLeds(T, i).txt}.${p.strap ? '' : ' Fasten the strap around the cord.'}`);
});
psuAct('psuLever', i => {
  i = +i; T.sel.psu = i; const p = T.psu[i], n = PSUN(i);
  if (p.st === 'out') return;
  if (p.st === 'set') return say('info', `${n} is not locked yet. Push the supply home: the lever clicks into place by itself, you do not need to touch it.`);
  if (T.psuPinch === i) { T.psuPinch = null; return say('info', 'Release lever let go: the spring arm pushes the hook back into the notch.'); }
  if (lastGood(i)) return bad(lastGoodMsg(i));
  if (!T.esd) return bad('Put on the ESD wrist strap before you handle the supply.');
  if (T.cables[psuKey(i)]) return bad(`Remove the power cord from ${n} first. Never pull a supply with its cord in.`);
  if (T.psuHand) return bad(T.psuHand.kind === 'failed' ? 'Your hands are full: set the failed supply aside first.' : 'Your hands are full.');
  T.psuPinch = i; pfxMark(i, 'pinch');
  say('info', `${n}: green release lever pushed toward the handle. The hook is out of the notch in the bay wall: keep it pushed and pull the supply out by the handle.`);
});
psuAct('psuPull', i => {
  i = +i; T.sel.psu = i; const p = T.psu[i], n = PSUN(i);
  if (p.st !== 'in') return;
  if (T.psuPinch !== i) {
    if (lastGood(i)) return bad(lastGoodMsg(i));
    return bad(T.cables[psuKey(i)] ? `${n} still has its power cord in, and its release lever holds it in the bay. Cord out first, then pinch the lever and pull.` : `The release lever holds ${n} in the bay. Grasp the handle while you pinch the green release lever toward it, then pull.`);
  }
  T.psuPinch = null; pfxMark(i, 'pull');
  T.psuHand = { kind: p.fault ? 'failed' : 'healthy', bay: i, sn: psuSn(p) };
  T.psu[i] = { st: 'out', fault: false, strap: false, pid: null };
  psuLog('Major', `${psuKey(i).toUpperCase()}_STATUS: Power Supply sensor for ${psuKey(i).toUpperCase()}, Presence detected was deasserted`);
  if (T.psuHand.kind === 'failed') { T.flags.psuPulled = true; return say('ok', `${n} pulled out by its handle, supported underneath as it came free. ${PSUN(1 - i)} runs the server alone until the new supply is in.`); }
  say('warn', `${n} was a healthy supply. Put it back in its bay.`);
});
psuAct('psuAside', () => { const h = T.psuHand; if (!h || h.kind !== 'failed') return; T.psuHand = null; T.psuRma = true; say('ok', 'Failed supply tagged and set aside for return. Now pick up the new one from the cart.'); });
psuAct('psuSpare', id => {
  if (T.psuSpare) return;
  if (id !== '1200') return bad('That carton holds UCSC-PSU2V2-650W, a 650 W supply. Do not mix power supply types or wattages in the server: both must be identical. Take the UCSC-PSU2V2-1200W spare.');
  T.psuSpare = '1200'; say('ok', `Carton label checked: ${PSU_PID}=, the same product ID and wattage as the failed unit. It waits on the cart.`);
});
psuAct('psuPick', () => {
  if (T.flags.psuSpareUsed) return say('info', 'The spare has already been fitted.');
  if (!T.psuSpare) return bad('Check the spares on the cart first: take the carton whose label matches the failed supply.');
  if (T.psuHand) return bad(T.psuHand.kind === 'failed' ? 'Your hands are full: set the failed supply aside for return first.' : 'Your hands are full.');
  if (!T.psu.some(p => p.st === 'out')) return bad('Remove the failed supply first: both bays are still occupied.');
  T.psuHand = { kind: 'new', bay: null, sn: 'LAB0PSU0007' };
  say('info', 'New supply out of its antistatic bag, held by the handle with the other hand underneath. Its connector end is shown below: the gold contacts must be clean and undamaged.');
});
psuAct('psuBay', i => {
  i = +i; T.sel.psu = i; const p = T.psu[i], n = PSUN(i), h = T.psuHand;
  if (p.st === 'set') {
    p.st = 'in'; pfxMark(i, 'push'); Sim.sound('psu', 0.2);
    psuLog('Normal', `${psuKey(i).toUpperCase()}_STATUS: Power Supply sensor for ${psuKey(i).toUpperCase()}, Presence detected was asserted`);
    return say('ok', `${n} pushed home. Click: the green release lever sprang back into place by itself, its hook is in the notch, and the connector is engaged. ${psuLeds(T, i).txt}.`);
  }
  if (p.st === 'in') return say('info', `${n} is locked in its bay.`);
  if (!h) return say('warn', `The ${n} bay is empty. ${T.psuSpare ? 'Pick up the new supply from the cart first.' : 'Check the spares on the cart first.'}`);
  if (h.kind === 'failed') return bad('That is the failed supply. Set it aside for return, and fit the new one.');
  if (!T.esd) return bad('Put on the ESD wrist strap before you handle the supply.');
  T.psu[i] = { st: 'set', fault: false, strap: false, pid: PSU_PID, sn: h.sn || 'LAB0PSU0007' };
  if (h.kind === 'new') T.flags.psuSpareUsed = true;
  T.psuHand = null; pfxMark(i, 'insert');
  say('ok', `Supply slid into the ${n} bay by its handle, the same way up as the other one, release lever on the right, until it stops at the connector. Now push it home: the lever clicks into place by itself.`);
});
