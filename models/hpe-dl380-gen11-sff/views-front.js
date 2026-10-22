/* ---- Front panel and drives: the trainer's photo of the front (FC frame, 2630 x 490), corrected for lens distortion
   and keystone so the bays are evenly spaced, with the sharper close-up pasted in for the right rack ear; every LED is
   drawn over it. Three drive boxes of eight SFF bays, Box 1 on the left, bays numbered 1 to 8 left to right (service
   label). Each bay holds an HPE basic carrier: one long latch lever, hinged at its top, its bottom end the grip with the
   dark red line; below the red line a finger space, then the Online/Activity LED (green, left) and the Fault/Locate LED
   (amber or blue, right). To open: a finger in the space below the red line lifts the lever's bottom end out, about
   halfway, then pulls the drive out by it. To fit a drive: blank out (keep it), slide the drive in with the latch open
   until it is fully seated, push the latch closed until it clicks, check the LEDs (the trainer's close-ups). ---- */
const FC = { W: 2630, H: 490 };
const LEDX = [224.9, 313.6, 401.8, 489.6, 577.5, 666.8, 756.1, 844.8, 955.9, 1043.1, 1129.3, 1215.9, 1300.7, 1386.6, 1472.1, 1557.4, 1668.4, 1756.1, 1844.2, 1930.6, 2018.0, 2102.7, 2187.3, 2273.8];
const LEDY = [441.5, 439.7, 439.5, 438.0, 437.7, 437.9, 438.0, 438.2, 437.2, 437.2, 437.6, 437.8, 437.6, 437.5, 438.1, 437.0, 436.5, 434.7, 433.6, 433.6, 433.4, 433.2, 434.7, 435.2];
const BAYL = LEDX.map(x => Math.round(x - 35));
// one bay, relative to its left edge: the opening, the latch hinge (top), the finger space below the red line (fin), and
// the latch lever: the handle, the neck, and its grip end with the red line, one rigid piece
const BAY = { w: 88, y0: 22, y1: 460, hinge: 44, rel: [16, 84, 346, 430], fin: [24, 80, 402, 424] };
const HAND = [[8, 44], [84, 44], [87, 50], [87, 114], [74, 128], [74, 288], [88, 304], [88, 337], [80, 343], [80, 401], [24, 401], [24, 343], [10, 337], [10, 304], [22, 290], [22, 128], [8, 114], [5, 50]];
const handPath = L => 'M' + HAND.map(([x, y]) => `${L + x} ${y}`).join('L') + 'Z';
const FP = { power: [2507, 67.2], health: [2505.5, 103.7], nic: [2505.5, 138.2], uid: [2505.5, 175.1], svc: [2548, 23, 2601, 116], usb: [2554, 147, 2592, 210],
  levL: [25, 250, 112, 476], levR: [2526, 256, 2611, 470], tab: [127, 36, 153, 202], panel: [2464, 4, 2630, 484] };
const boxOf = i => Math.floor(i / 8);
const boxCrop = k => [BAYL[k * 8] - 24, BAYL[k * 8 + 7] + BAY.w + 22];
const ANG = 0.71;                 // cos of the open latch angle: lifted about halfway, 45 degrees out
// a fingertip, pointing up, its tip at (x, y): skin, nail
const fingertip = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-17 70V12a17 17 0 0 1 34 0v58z" fill="#D9A47E" stroke="#8A5A3C" stroke-width="2.4"/><path d="M-10 26V12a10 10 0 0 1 20 0v14z" fill="#F1D2BC" stroke="#B98A6C" stroke-width="1.6"/></g>`;
// where the photo goes: whole front at the top, the selected box enlarged below, the side view and panel at the right
const VF = { x: 10, y: 44, s: 880 / FC.W };
const VB = { x: 10, y: 232, w: 600 };
const VS = { x: 622, y: 232 };

// the photo in FC units, clipped
const frontImg = (id, clip) => `<defs><clipPath id="${id}"><rect x="${clip[0]}" y="${clip[1]}" width="${clip[2] - clip[0]}" height="${clip[3] - clip[1]}"/></clipPath></defs><image href="${IMG.hpFront}" x="0" y="0" width="${FC.W}" height="${FC.H}" clip-path="url(#${id})"/>`;
// an empty bay: the opening, the carrier guides, and the backplane connector at the back
function emptyBay(L) {
  const W = BAY.w, y0 = BAY.y0, y1 = BAY.y1;
  let g = `<rect x="${L + 1}" y="${y0}" width="${W - 2}" height="${y1 - y0}" fill="#040506"/>`;
  g += `<path d="M${L + 1} ${y0}L${L + 18} ${y0 + 40}H${L + W - 18}L${L + W - 1} ${y0}ZM${L + 1} ${y1}L${L + 18} ${y1 - 40}H${L + W - 18}L${L + W - 1} ${y1}Z" fill="#0E1215"/>`;
  g += `<path d="M${L + 1} ${y0}L${L + 18} ${y0 + 40}V${y1 - 40}L${L + 1} ${y1}ZM${L + W - 1} ${y0}L${L + W - 18} ${y0 + 40}V${y1 - 40}L${L + W - 1} ${y1}Z" fill="#14191D"/>`;
  [y0 + 70, y1 - 70].forEach(y => { g += `<path d="M${L + 4} ${y}L${L + 18} ${y + (y < 200 ? 6 : -6)}M${L + W - 4} ${y}L${L + W - 18} ${y + (y < 200 ? 6 : -6)}" stroke="#2A3238" stroke-width="3"/>`; });
  g += `<rect x="${L + 18}" y="${y0 + 40}" width="${W - 36}" height="${y1 - y0 - 80}" fill="#07090B" stroke="#1A2026" stroke-width="2"/>`;
  g += `<rect x="${L + W / 2 - 11}" y="${y0 + 150}" width="22" height="96" rx="2" fill="#111417" stroke="#2C343B" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<rect x="${L + W / 2 - 5}" y="${y0 + 158 + k * 10.5}" width="10" height="5" fill="#B8954A" opacity=".8"/>`).join('')}`;
  return g;
}
// a drive blank: black plastic with a vented face and a finger notch at the bottom
function blankBay(L, detail) {
  const W = BAY.w, y0 = BAY.y0 + 6, y1 = BAY.y1 - 6;
  let g = `<rect x="${L + 3}" y="${y0}" width="${W - 6}" height="${y1 - y0}" rx="4" fill="#17191B" stroke="#33383D" stroke-width="2"/>`;
  g += `<rect x="${L + 12}" y="${y0 + 18}" width="${W - 24}" height="${y1 - y0 - 120}" rx="6" fill="#111315" stroke="#26292D" stroke-width="2"/>`;
  for (let y = y0 + 34; y < y1 - 116; y += 16) g += `<rect x="${L + 22}" y="${y}" width="${W - 44}" height="7" rx="3.5" fill="#050607"/>`;
  g += `<rect x="${L + 24}" y="${y1 - 86}" width="${W - 48}" height="46" rx="8" fill="#0C0D0F" stroke="#2B2F34" stroke-width="2"/><path d="M${L + 30} ${y1 - 52}h${W - 60}" stroke="#3A3F45" stroke-width="3" stroke-linecap="round"/>`;
  if (detail) g += `<text x="${L + W / 2}" y="${y1 - 18}" text-anchor="middle" style="font:700 10px var(--font);fill:#7E8892">BLANK</text>`;
  return g;
}
// the latch, opened: the recess it lay in, the catch its grip end clicks onto, then the lever swung out about its top hinge
function openLatch(L, i, anim) {
  const cx = L + 47, h = BAY.hinge;
  let g = `<defs><clipPath id="hc${i}"><path d="${handPath(L)}"/></clipPath></defs>`;
  g += `<path d="${handPath(L)}" fill="#0B0D0F"/><path d="M${L + 24} ${h + 6}V${330}M${L + 70} ${h + 6}V${330}" stroke="#1E2328" stroke-width="2"/>`;
  g += `<rect x="${L + 34}" y="${392}" width="26" height="9" rx="2" fill="#5D666E"/><rect x="${L + 38}" y="${394}" width="18" height="3" fill="#9AA4AD"/>`;
  const sc = `${anim ? '' : `scale(1.06 ${ANG})`}`;
  g += `<g transform="translate(${cx} ${h})"><g transform="${sc}">${anim}<g transform="translate(${-cx} ${-h})">`;
  g += `<path d="${handPath(L)}" fill="#000" opacity=".55" transform="translate(4 26)"/>`;
  g += `<image href="${IMG.hpFront}" x="0" y="0" width="${FC.W}" height="${FC.H}" clip-path="url(#hc${i})"/><path d="${handPath(L)}" fill="none" stroke="#6E777F" stroke-width="2"/>`;
  g += `</g></g></g>`;
  return g;
}
// one bay drawn over the photo; detail: the enlarged box (animations, labels)
function bayArt(t, i, detail) {
  const b = t.bays[i], L = BAYL[i];
  const a = detail ? fxAge('bay' + i) : 9, fx = b.fx;
  let g = '';
  if (b.st === 'blank') g += blankBay(L, detail);
  else if (b.st === 'empty') {
    g += emptyBay(L);
    // the drive or the blank just pulled out: it comes toward you and is gone
    if (a < 0.7 && (fx === 'pull' || fx === 'unblank')) {
      const cx = L + BAY.w / 2, cy = 240;
      g += `<g opacity="0"><animate attributeName="opacity" values="1;1;0" keyTimes="0;.35;1" dur="0.65s" begin="-${a.toFixed(2)}s" fill="freeze"/><g transform="translate(${cx} ${cy})"><g><animateTransform attributeName="transform" type="scale" values="1;1.32" dur="0.65s" begin="-${a.toFixed(2)}s" fill="freeze"/><g transform="translate(${-cx} ${-cy})">`;
      g += fx === 'unblank' ? blankBay(L, false) : `<defs><clipPath id="pc${i}"><rect x="${L}" y="${BAY.y0}" width="${BAY.w}" height="${BAY.y1 - BAY.y0}"/></clipPath></defs><image href="${IMG.hpFront}" x="0" y="0" width="${FC.W}" height="${FC.H}" clip-path="url(#pc${i})"/>` + openLatch(L, 'p' + i, '');
      g += `</g></g></g></g>`;
    }
  } else if (b.st === 'open') {
    // the drive slid in (or released): the latch stands open
    const ins = a < 0.65 && fx === 'ins', rel = a < 1 && fx === 'rel';
    // lifted by a finger under the red line: the grip end comes out (in this view it rises), smoothly, to halfway
    const anim = rel ? `<animateTransform attributeName="transform" type="scale" values="1 1;1 1;1.06 ${ANG}" keyTimes="0;.25;1" dur="0.7s" begin="-${a.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines="0 0 1 1;.3 .1 .3 1"/>` : '';
    let d = openLatch(L, i, anim);
    if (rel && detail) { const yb = 401, yt = BAY.hinge + (yb - BAY.hinge) * ANG; d += `<g opacity="0"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.75;1" dur="1s" begin="-${a.toFixed(2)}s" fill="freeze"/><g><animateTransform attributeName="transform" type="translate" values="0 26;0 0;0 0;0 ${f1(yt - yb)}" keyTimes="0;.21;.25;1" dur="0.7s" begin="-${a.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines="0 0 1 1;0 0 1 1;.3 .1 .3 1"/>${fingertip(L + 52, yb + 2, 0.85)}</g></g>`; }
    if (ins) {
      const cx = L + BAY.w / 2, cy = 240;
      d = `<g opacity="0"><animate attributeName="opacity" values="0;1;1" keyTimes="0;.4;1" dur="0.6s" begin="-${a.toFixed(2)}s" fill="freeze"/><g transform="translate(${cx} ${cy})"><g><animateTransform attributeName="transform" type="scale" values="1.32;1" dur="0.6s" begin="-${a.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".2 .7 .3 1" keyTimes="0;1"/><g transform="translate(${-cx} ${-cy})">` +
        `<defs><clipPath id="ic${i}"><rect x="${L}" y="${BAY.y0}" width="${BAY.w}" height="${BAY.y1 - BAY.y0}"/></clipPath></defs><image href="${IMG.hpFront}" x="0" y="0" width="${FC.W}" height="${FC.H}" clip-path="url(#ic${i})"/>${d}</g></g></g></g>`;
      g += emptyBay(L);
    }
    g += d;
  } else if (b.st === 'drive' && a < 0.9 && fx === 'close') {
    // the latch pushed shut: a finger on its grip end presses it back flat until it clicks onto its catch
    g += openLatch(L, i, `<animateTransform attributeName="transform" type="scale" values="1.06 ${ANG};1.06 ${ANG};1 1" keyTimes="0;.3;1" dur="0.55s" begin="-${a.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines="0 0 1 1;.5 0 .8 .6"/>`);
    if (detail) { const yb = 366, yt = BAY.hinge + (yb - BAY.hinge) * ANG; g += `<g opacity="0"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.65;1" dur="0.9s" begin="-${a.toFixed(2)}s" fill="freeze"/><g><animateTransform attributeName="transform" type="translate" values="0 ${f1(yt - yb + 30)};0 ${f1(yt - yb)};0 ${f1(yt - yb)};0 0" keyTimes="0;.22;.3;1" dur="0.55s" begin="-${a.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines="0 0 1 1;0 0 1 1;.5 0 .8 .6"/>${fingertip(L + 52, yb, 0.85)}</g></g>`; }
  }
  // LEDs: Online/Activity (left, green), Fault/Locate (right, amber)
  if (b.st === 'drive' || b.st === 'open') {
    const on = isOn(t) && t.posted !== false, ly = LEDY[i], lx = L + 35, fxx = L + 66;
    const green = on && b.health !== 'fault' && b.st === 'drive';
    if (green) g += `<g pointer-events="none">${b.health === 'rebuild' ? ledBlink(true, 1) : ''}<rect x="${lx - 9}" y="${ly - 5}" width="18" height="10" rx="2" fill="#5BF07E"/><rect x="${lx - 14}" y="${ly - 9}" width="28" height="18" rx="5" fill="#5BF07E" opacity=".25"/></g>`;
    if (isOn(t) && b.health === 'fault') g += `<g pointer-events="none"><rect x="${fxx - 7}" y="${ly - 5}" width="14" height="10" rx="2" fill="#FFB52E"/><rect x="${fxx - 12}" y="${ly - 9}" width="24" height="18" rx="5" fill="#FFB52E" opacity=".32"/></g>`;
  }
  return g;
}
// the four front panel LEDs (service label): power, health, NIC, UID
function panelLeds(t) {
  const L = (p, col, blink, r = 13) => col ? `<g pointer-events="none">${blink ? ledBlink(true, 0.8) : ''}<rect x="${p[0] - r}" y="${p[1] - r}" width="${2 * r}" height="${2 * r}" rx="4" fill="${col}"/><rect x="${p[0] - r - 6}" y="${p[1] - r - 6}" width="${2 * r + 12}" height="${2 * r + 12}" rx="8" fill="${col}" opacity=".28"/></g>` : '';
  const pw = !acOn(t) ? null : t.power === 'standby' ? '#FFB52E' : '#55EE7C';
  const hl = !acOn(t) ? null : (t.bays.some(b => b.health === 'fault') || cpuBad(t)) && isOn(t) ? '#FFB52E' : '#55EE7C';
  const nic = isOn(t) && t.laptop ? '#55EE7C' : null;
  return L(FP.power, pw, t.power === 'post', 13.5) + L(FP.health, hl, acOn(t) && (!t.flags.iloUp || (isOn(t) && t.bays.some(b => b.health === 'fault'))), 12) + L(FP.nic, nic, false, 12) + L(FP.uid, t.uid ? '#4AA8FF' : null, false, 12);
}
function frontSvg(t) {
  let g = '';
  // 1. the whole front, small
  g += `<g transform="translate(${VF.x} ${VF.y}) scale(${VF.s.toFixed(5)})">${frontImg('ffull', [0, 0, FC.W, FC.H])}`;
  for (let i = 0; i < PROFILE.bays; i++) g += bayArt(t, i, false);
  g += panelLeds(t);
  const k0 = t.sel.box, [ca, cb] = boxCrop(k0);
  g += `<rect x="${ca}" y="4" width="${cb - ca}" height="${FC.H - 8}" fill="none" stroke="${CUE}" stroke-width="7"/>`;
  [0, 1, 2].forEach(k => { const [a, b] = boxCrop(k); g += `<g${hot('box', k, `Drive box ${k + 1}: show it enlarged`)}><rect x="${a}" y="0" width="${b - a}" height="${FC.H}" class="zone"/></g>`; });
  g += `<g${hot('pullTab', '', t.pullTab ? 'Serial number / iLO information pull tab: push it back in' : 'Serial number / iLO information pull tab: pull it out')}><rect x="${FP.tab[0] - 16}" y="${FP.tab[1]}" width="${FP.tab[2] - FP.tab[0] + 32}" height="${FP.tab[3] - FP.tab[1]}" rx="8" class="zone"/></g>`;
  g += `</g>`;
  [0, 1, 2].forEach(k => { const [a, b] = boxCrop(k); g += `<text x="${f1(VF.x + (a + b) / 2 * VF.s)}" y="${f1(VF.y + FC.H * VF.s + 15)}" text-anchor="middle" class="ss" style="${k === k0 ? 'fill:#FFD27A;font-weight:600' : ''}">Box ${k + 1}</text>`; });
  g += `<text x="${f1(VF.x + 60 * VF.s)}" y="${f1(VF.y + FC.H * VF.s + 15)}" text-anchor="start" class="ss">pull tab</text>`;
  // 2. the selected box, enlarged
  const [a, b] = boxCrop(k0), s = VB.w / (b - a), hB = FC.H * s;
  g += `<g transform="translate(${VB.x} ${VB.y}) scale(${s.toFixed(4)}) translate(${-a} 0)">${frontImg('fbox', [a, 0, b, FC.H])}`;
  for (let i = k0 * 8; i < k0 * 8 + 8; i++) g += bayArt(t, i, true);
  const sel = t.sel.bay;
  if (boxOf(sel) === k0) g += `<rect x="${BAYL[sel] - 1}" y="${BAY.y0 - 8}" width="${BAY.w + 2}" height="${BAY.y1 - BAY.y0 + 16}" rx="6" fill="none" stroke="#45D07F" stroke-width="4" stroke-dasharray="10 7" pointer-events="none"/>`;
  for (let i = k0 * 8; i < k0 * 8 + 8; i++) {
    const bb = t.bays[i], L = BAYL[i], nm = bayName(i);
    const lab = bb.st === 'blank' ? `${nm}: drive blank, pull it out` : bb.st === 'empty' ? `${nm}: empty bay` : bb.st === 'open' ? (bb.ins ? `${nm}: drive in, latch open: push the latch closed` : `${nm}: latch lifted: pull the drive out by it`) : `${nm}: ${CATALOG.ssd.short}${bb.health === 'fault' ? ', fault LED amber' : ''}`;
    g += `<g${hot('bay', i, lab)}><rect x="${L + 3}" y="${BAY.y0}" width="${BAY.w - 6}" height="${(bb.st === 'drive' ? BAY.rel[2] - 4 : BAY.y1) - BAY.y0}" rx="5" class="zone"/></g>`;
    if (bb.st === 'drive') g += `<g${hot('bayRel', i, `${nm}: the finger space below the red line: lift the latch`)}><rect x="${L + BAY.rel[0]}" y="${BAY.rel[2]}" width="${BAY.rel[1] - BAY.rel[0]}" height="${BAY.rel[3] - BAY.rel[2]}" rx="5" class="zone"/></g>`;
  }
  g += `</g>`;
  for (let i = k0 * 8; i < k0 * 8 + 8; i++) g += `<text x="${f1(VB.x + (BAYL[i] + BAY.w / 2 - a) * s)}" y="${f1(VB.y + hB + 16)}" text-anchor="middle" style="font:700 13px var(--font);fill:${i === sel ? '#7CF0A8' : '#EAF2F7'}">${(i % 8) + 1}</text>`;
  g += `<text x="${VB.x}" y="${f1(VB.y + hB + 36)}" class="ss">Drive box ${k0 + 1}, enlarged: bays 1 to 8, left to right. Click a box above to show another.</text>`;
  // 3. the selected bay from the side: how the latch and the drive move
  g += baySide(t, sel, VS.x, VS.y);
  // 4. how to fit a drive, under the side view
  const IX = VS.x, IY = VS.y + 190;
  g += `<rect x="${IX}" y="${IY}" width="268" height="${f1(VB.y + hB - IY)}" rx="8" fill="#16293A" stroke="#2E5571"/><text x="${IX + 12}" y="${IY + 22}" class="st" style="font-size:12.5px">Fitting a drive (HPE)</text>`;
  ['1. Pull the blank out; keep it.', '2. Lift the new drive\'s latch: a finger', '    below the red line, halfway out.', '3. Slide it in until it is fully', '    seated, latch open.', '4. Push the latch closed: it clicks.', '5. Check the drive LEDs.'].forEach((s2, i) => { g += `<text x="${IX + 12}" y="${IY + 46 + i * 20}" class="ss" style="white-space:pre">${esc(s2)}</text>`; });
  // 5. the pull tab, pulled out, over the enlarged box
  if (t.pullTab) g += pullTabArt(t);
  return frame('Front panel and drive bays', g, f1(VB.y + hB + 50));
}
/* ---- the selected bay seen from its left side: the drive in its carrier, the latch hinged at the top of the carrier
   front, the backplane connector at the back. Positions animate from the last action. ---- */
function baySide(t, i, X, Y) {
  const b = t.bays[i], W = 268, H = 170, fx0 = X + 46, back = X + 238, top = Y + 44, ht = 88, len = 172;
  let g = `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="8" fill="#16293A" stroke="#2E5571"/><text x="${X + 10}" y="${Y + 18}" class="st" style="font-size:12px">${esc(bayName(i))}, from the side</text>`;
  // the drive cage: floor, roof, backplane
  g += `<rect x="${fx0}" y="${top - 8}" width="${back - fx0 + 8}" height="${ht + 16}" fill="#0B1015"/><path d="M${fx0} ${top - 8}H${back + 8}M${fx0} ${top + ht + 8}H${back + 8}" stroke="#7D8890" stroke-width="3"/>`;
  g += `<rect x="${back}" y="${top - 4}" width="10" height="${ht + 8}" fill="#2D6B46" stroke="#173F28"/><rect x="${back - 7}" y="${top + ht / 2 - 13}" width="8" height="26" rx="1" fill="#1A1D20" stroke="#4A525A"/>`;
  g += `<text x="${fx0 - 4}" y="${Y + H - 10}" class="ss" style="font-size:9.5px" text-anchor="middle">front</text><text x="${back + 5}" y="${Y + H - 10}" text-anchor="middle" class="ss" style="font-size:9.5px">backplane</text>`;
  if (b.st === 'blank') return g + `<rect x="${fx0}" y="${top}" width="34" height="${ht}" rx="3" fill="#1B1E21" stroke="#3B4147"/><text x="${fx0 + 50}" y="${top + ht / 2 + 4}" class="ss">drive blank</text>`;
  const a = fxAge('bay' + i), fx = b.fx;
  // drive position: 0 = seated against the backplane; out = pulled toward you
  const seated = b.st === 'drive' || (b.st === 'open' && !b.ins) || b.st === 'open';
  let dx = 0, anim = '', fade = '';
  if (b.st === 'empty') {
    g += `<text x="${fx0 + 24}" y="${top + ht / 2 + 4}" class="ss">${t.hand && t.hand.kind === 'ssd' ? 'empty: slide the new drive in' : 'empty bay'}</text>`;
    if (!(a < 0.7 && fx === 'pull')) return g;
    anim = `<animateTransform attributeName="transform" type="translate" values="0 0;-${len + 30} 0" dur="0.65s" begin="-${a.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".4 0 .7 1" keyTimes="0;1"/>`;
    fade = `<animate attributeName="opacity" values="1;1;0" keyTimes="0;.7;1" dur="0.65s" begin="-${a.toFixed(2)}s" fill="freeze"/>`;
  } else if (b.st === 'open' && fx === 'ins' && a < 0.65) anim = `<animateTransform attributeName="transform" type="translate" values="-${len + 30} 0;4 0;6 0" keyTimes="0;.85;1" dur="0.6s" begin="-${a.toFixed(2)}s" fill="freeze"/>`;
  else if (b.st === 'open' && b.ins) dx = 6;
  else if (b.st === 'open') dx = 6;
  else if (b.st === 'drive' && fx === 'close' && a < 0.55) anim = `<animateTransform attributeName="transform" type="translate" values="6 0;6 0;0 0" keyTimes="0;.3;1" dur="0.55s" begin="-${a.toFixed(2)}s" fill="freeze"/>`;
  const dX = back - len - 6;                         // left end of the drive when seated
  g += `<g${fade ? ' opacity="1"' : ''}>${fade}<g transform="translate(${anim ? 0 : dx} 0)">${anim}`;
  // the SSD in its carrier: metal body, the carrier frame, the drive connector at the back
  g += `<rect x="${dX + 14}" y="${top + 4}" width="${len - 14}" height="${ht - 8}" rx="3" fill="#8D969E" stroke="#4E565D"/><rect x="${dX + 30}" y="${top + 14}" width="${len - 60}" height="${ht - 28}" rx="2" fill="#A3ABB2"/><text x="${dX + 30 + (len - 60) / 2}" y="${top + ht / 2 + 4}" text-anchor="middle" style="font:600 9px var(--font);fill:#2B3036">2.5-inch SSD</text>`;
  g += `<rect x="${dX + len}" y="${top + ht / 2 - 10}" width="7" height="20" fill="#1A1D20"/><rect x="${dX}" y="${top}" width="16" height="${ht}" rx="2" fill="#16191C" stroke="#3E454C"/>`;
  // the latch lever: hinged at the top of the carrier front, its bottom end the grip with the red line. Lifted, that end
  // comes out toward you, about halfway (45 degrees); pushed, it goes back flat and clicks onto its catch
  const hx = dX, hy = top + 6, open = b.st === 'open', ang = open ? 45 : 0, gy = hy + ht - 6;
  let la = '', fin = '';
  const finger = (op, rot) => `<g opacity="0">${op}<g transform="rotate(${rot} ${hx} ${hy})"><path d="M${hx - 11} ${gy + 30}V${gy + 8}a6 6 0 0 1 12 0V${gy + 30}z" fill="#D9A47E" stroke="#8A5A3C" stroke-width="1.2"/><path d="M${hx - 8.5} ${gy + 15}V${gy + 8}a3.5 3.5 0 0 1 7 0V${gy + 15}z" fill="#F1D2BC"/></g></g>`;
  if (open && fx === 'rel' && a < 1) {
    la = `<animateTransform attributeName="transform" type="rotate" values="0 ${hx} ${hy};0 ${hx} ${hy};${ang} ${hx} ${hy}" keyTimes="0;.25;1" dur="0.7s" begin="-${a.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines="0 0 1 1;.3 .1 .3 1"/>`;
    fin = finger(`<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.75;1" dur="1s" begin="-${a.toFixed(2)}s" fill="freeze"/>`, 0);
  }
  if (!open && fx === 'close' && a < 0.9) {
    la = `<animateTransform attributeName="transform" type="rotate" values="45 ${hx} ${hy};45 ${hx} ${hy};0 ${hx} ${hy}" keyTimes="0;.3;1" dur="0.55s" begin="-${a.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines="0 0 1 1;.5 0 .8 .6"/>`;
    fin = finger(`<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.65;1" dur="0.9s" begin="-${a.toFixed(2)}s" fill="freeze"/>`, 0);
  }
  g += `<g transform="rotate(${la ? 0 : ang} ${hx} ${hy})">${la}<path d="M${hx - 1} ${hy - 4}h-7v${ht - 6}l7 4z" fill="#0F1113" stroke="#59616A" stroke-width="1.2"/><rect x="${hx - 8}" y="${gy - 22}" width="7" height="5" fill="#8A2A3A"/>${fin}</g><circle cx="${hx - 3}" cy="${hy}" r="2.6" fill="#B8C0C7"/>`;
  g += `</g></g>`;
  const msg = b.st === 'drive' ? (b.health === 'fault' ? 'Fault LED amber: replace this drive' : 'Latch closed: the drive is locked in') : b.st === 'open' ? (b.ins ? 'Fully seated, latch open: push it closed' : 'Latch lifted halfway: pull the drive out') : '';
  g += `<text x="${X + 10}" y="${Y + 34}" class="ss" style="fill:${b.st === 'open' ? '#FFD27A' : b.health === 'fault' ? '#FF8A7A' : '#C5CCD3'}">${msg}</text>`;
  return g;
}
/* ---- the pull tab: the left rack ear photographed from the front left (hpEarL: p8 x 420..1180, y 40..900 at 0.62).
   The tab is a card standing on edge in a slot at the ear's right edge; it pulls straight out toward you, which in this
   photo runs down and to the left. One face carries the serial number and product number, the other the default iLO
   account. Values are invented lab values. ---- */
const PT = { x: 64, y: 236, s: 0.712, N: [178, 79], A: [17, 186], dir: [-0.888, 0.46], E: 172, L: 280 };
function barcode(x, y, w, h, seed) {
  let s = '', r = seed, xx = x;
  while (xx < x + w) { r = (r * 9301 + 49297) % 233280; const bw = 0.8 + (r % 3) * 0.7; s += `<rect x="${f1(xx)}" y="${f1(y)}" width="${f1(bw)}" height="${f1(h)}" fill="#111"/>`; xx += bw + 0.9 + ((r >> 3) % 3) * 0.7; }
  return s;
}
// the ear photo with its pull tab, in the front view's box (VB): sn, the serial on the card; fk, fkf: animation keys;
// sfx: makes the clip ids unique when more than one is on the page
function pullTabCore(sn, out, flip, fk, fkf, sfx) {
  const a = fxAge(fk);
  const P = (x, y) => [PT.x + x * PT.s, PT.y + y * PT.s];
  const N = P(...PT.N), A = [PT.A[0] * PT.s, PT.A[1] * PT.s], H = Math.hypot(...A), au = [A[0] / H, A[1] / H], d = PT.dir;
  let g = `<defs><clipPath id="earclip${sfx}"><rect x="${VB.x + 8}" y="${VB.y + 8}" width="344" height="388" rx="8"/></clipPath></defs><g clip-path="url(#earclip${sfx})"><image href="${IMG.hpEarL}" x="${PT.x}" y="${PT.y}" width="${f1(471 * PT.s)}" height="${f1(533 * PT.s)}"/>`;
  // the slot, dark once the tab has moved out of it
  if (out || a < 0.85) g += `<path d="M${f1(N[0] - 4)} ${f1(N[1])}l${f1(14)} ${f1(-2)}l${f1(A[0] + 4)} ${f1(A[1])}l${f1(-14)} ${f1(2)}z" fill="#040506"/>`;
  // clip: only what is outside the ear, in the pulling direction
  const far = 900, cp = [N, [N[0] + A[0], N[1] + A[1]], [N[0] + A[0] + d[0] * far, N[1] + A[1] + d[1] * far], [N[0] + d[0] * far, N[1] + d[1] * far]];
  g += `<defs><clipPath id="tabclip${sfx}"><path d="M${cp.map(p => `${f1(p[0])} ${f1(p[1])}`).join('L')}Z"/></clipPath></defs><g clip-path="url(#tabclip${sfx})">`;
  // the card: (u, v) px, u from its outer end toward the ear, v down the slot; mapped onto the photo's perspective
  const e = out ? PT.E : 0, e0 = out ? 0 : PT.E, O = [N[0] + d[0] * e, N[1] + d[1] * e];
  const mt = `matrix(${f2(-d[0])} ${f2(-d[1])} ${f2(au[0])} ${f2(au[1])} 0 0)`;
  const anim = a < 0.9 ? `<animateTransform attributeName="transform" type="translate" values="${f1(N[0] + d[0] * e0)} ${f1(N[1] + d[1] * e0)};${f1(O[0])} ${f1(O[1])}" dur="0.85s" begin="-${a.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".25 .1 .25 1" keyTimes="0;1"/>` : '';
  g += `<g transform="translate(${f1(O[0])} ${f1(O[1])})">${anim}<g transform="${mt}">`;
  const L = PT.L, fa = fxAge(fkf), fl = fa < 0.45 ? `<animateTransform attributeName="transform" type="scale" values="1 1;1 .04;1 1" dur="0.42s" begin="-${fa.toFixed(2)}s" fill="freeze"/>` : '';
  g += `<g transform="translate(0 ${f1(H / 2)})"><g>${fl}<g transform="translate(0 ${f1(-H / 2)})">`;
  g += `<rect x="0" y="0" width="${L}" height="${f1(H)}" rx="3" fill="#0D0E10"/><rect x="0" y="${f1(H - 5)}" width="${L}" height="5" fill="#26292D"/><rect x="0" y="0" width="${L}" height="2.4" fill="#474D53"/><rect x="0" y="0" width="7" height="${f1(H)}" rx="2" fill="#1C1F23"/>`;
  if (!flip) {
    g += `<rect x="12" y="${f1(H * 0.12)}" width="76" height="${f1(H * 0.68)}" rx="2" fill="#F2F2EF"/>` + barcode(16, H * 0.17, 68, H * 0.25, 7) + barcode(16, H * 0.5, 68, H * 0.25, 31);
    g += `<text x="96" y="${f1(H * 0.22)}" style="font:700 8.5px var(--font);fill:#9AA4AD">S/N</text><text x="96" y="${f1(H * 0.35)}" style="font:700 10px var(--mono);fill:#E9ECEF">${sn}</text><text x="96" y="${f1(H * 0.52)}" style="font:700 8.5px var(--font);fill:#9AA4AD">P/N</text><text x="96" y="${f1(H * 0.65)}" style="font:700 10px var(--mono);fill:#E9ECEF">${PROFILE.productId}</text><text x="96" y="${f1(H * 0.82)}" style="font:600 8px var(--font);fill:#9AA4AD">DL380 Gen11</text>`;
  } else {
    g += `<rect x="10" y="${f1(H * 0.08)}" width="152" height="${f1(H * 0.82)}" rx="2" fill="none" stroke="#E9ECEF" stroke-width="1"/><text x="18" y="${f1(H * 0.25)}" style="font:800 12px var(--font);fill:#E9ECEF">iLO</text><rect x="52" y="${f1(H * 0.13)}" width="100" height="${f1(H * 0.15)}" fill="#F2F2EF"/>` + barcode(55, H * 0.145, 94, H * 0.12, 77);
    [['User Name', LAB.user], ['DNS Name', LAB.ilo], ['Password', LAB.pw]].forEach(([k, v], r) => { g += `<text x="18" y="${f1(H * (0.44 + r * 0.16))}" style="font:600 8.2px var(--mono);fill:#E9ECEF">${k}: ${v}</text>`; });
  }
  return g + `</g></g></g></g></g></g></g>`;
}
function pullTabArt(t) {
  const out = t.pullTab, flip = t.tabSide === 'ilo';
  let g = `<g><rect x="${VB.x + 4}" y="${VB.y + 4}" width="${VB.w - 8}" height="396" rx="10" fill="#0E1A22" opacity=".97"/>` + pullTabCore(LAB.serial, out, flip, 'tab', 'tabflip', '');
  // the readout, flat, beside the photo
  const R = 382, ry = VB.y + 28;
  g += `<text x="${R}" y="${ry}" class="st">Pull tab ${out ? 'pulled out' : 'in its slot'}</text><text x="${R}" y="${ry + 18}" class="ss">${flip ? 'iLO side (lab values)' : 'Serial number side (lab values)'}</text>`;
  const rows = flip ? [['iLO user', LAB.user], ['Password', LAB.pw], ['DNS name', LAB.ilo], ['Service Port IP', LAB.svcIp]] : [['Serial number', LAB.serial], ['Product number', PROFILE.productId], ['Model', PROFILE.product]];
  rows.forEach(([k, v], r) => { g += `<text x="${R}" y="${ry + 52 + r * 40}" class="ss" style="fill:#9FB3C2">${k}</text><text x="${R}" y="${ry + 70 + r * 40}" style="font:600 14px var(--mono);fill:#EAF2F7">${v}</text>`; });
  g += `<g${hot('tabSide', '', flip ? 'Pull tab: read the serial number side' : 'Pull tab: read the other side, the iLO account')}><rect x="${R}" y="${VB.y + 300}" width="200" height="34" rx="8" fill="#1F4E6E" stroke="#5BA3E0"/><text x="${R + 100}" y="${VB.y + 322}" text-anchor="middle" style="font:600 13px var(--font);fill:#EAF2F7">${flip ? 'Show the serial side' : 'Read the other side'}</text></g>`;
  g += `<g${hot('pullTab', '', 'Pull tab: push it back in')}><rect x="${R}" y="${VB.y + 344}" width="200" height="34" rx="8" fill="#14202B" stroke="#8E99A3"/><text x="${R + 100}" y="${VB.y + 366}" text-anchor="middle" style="font:600 13px var(--font);fill:#EAF2F7">Push it back in</text></g>`;
  return g + `</g>`;
}

Sim.registerView({
  id: 'front', title: 'Front panel and drives',
  keep: [
    ['Hot-plug drives', 'SAS and SATA drives in the front bays can be replaced with the server running. Check the drive LEDs first, and replace only the drive with the amber fault LED.'],
    ['Blanks keep the airflow', 'Never leave a bay empty while the server runs: fit a drive or keep its blank in. Keep the blanks you remove for later.'],
    ['Basic carrier latch', 'The latch is one long lever, hinged at its top; its bottom end, with the dark red line, is the grip. Put a finger in the space below the red line and lift the lever out, about halfway, then pull the drive out by it.'],
    ['Installing a drive', 'Remove the blank. Lift the new drive\'s latch halfway open. Slide the drive into the bay until it is fully seated, then push the latch closed until it clicks. Check the LEDs.'],
    ['Drive LEDs', 'Online/Activity (left): solid green online, flashing green activity or rebuild, off not configured. Fault/Locate (right): solid amber failed, flashing amber predictive failure, solid blue being located.'],
    ['Front panel LEDs', 'Power: green on, flashing green powering on, amber standby, off no power. Health: green normal, flashing green iLO rebooting, flashing amber degraded, flashing red critical. All four flashing together: a power fault.'],
    ['Pull tab', 'The serial number / iLO information pull tab at the left is double-sided: the serial number on one side, the default iLO account (user, password, DNS name) on the other.'],
    ['iLO Service Port', 'The front USB port marked iLO takes a USB-to-Ethernet adapter (HPE recommends Q7Y55A). A laptop on it reaches iLO at 169.254.1.2.'],
    ['Bay numbering', 'Box 1 (left), Box 2 (middle) and Box 3 (right), eight SFF bays each, numbered 1 to 8 left to right.']],
  render: t => frontSvg(t),
  actions(t) {
    const a = [];
    if (t.hand && t.hand.kind === 'failed') a.push(button('Set the failed drive aside for return', 'driveAside'));
    if (t.hand && t.hand.kind === 'ssd') a.push(button('Put the SSD back in its box', 'ssdBack'));
    a.push(button(t.pullTab ? 'Push the pull tab back in' : 'Pull out the serial number / iLO pull tab', 'pullTab'));
    if (t.pullTab) a.push(button(t.tabSide === 'ilo' ? 'Show the serial number side' : 'Read the iLO side of the tab', 'tabSide'));
    return a;
  },
  tray(t) {
    const left = t.ssdKit, hand = t.hand;
    return `<h2>Drives</h2><div class="item${hand && hand.kind === 'ssd' ? ' sel' : ''}"><span>${CATALOG.ssd.name}<small style="font-family:var(--mono)">${CATALOG.ssd.label}</small><small>${left} in the box${hand && hand.kind === 'ssd' ? ', one in your hand, latch open' : ''}</small></span>${left && !hand ? button('Pick up', 'ssdPick') : hand && hand.kind === 'ssd' ? button('Put it back', 'ssdBack') : ''}</div>` +
      (t.flags.driveMin ? `<p class="cap" style="font-size:13px">Fitted: <b>${driveCount(t)}</b> of 24 bays. Minimum for this build: <b>${DMIN}</b>. The operating system lives on the NS204i-u boot device (two M.2 SSDs in RAID 1, at the rear), so the front drives are for data, and ${DMIN} drives are enough for any RAID level the MR416i-o offers for a data volume, RAID 6 and RAID 10 included. Fit more if you like: iLO's Storage page lists every drive you fitted.</p>` : '') +
      (hand && hand.kind === 'failed' ? `<p class="cap" style="font-size:13px;color:var(--red)">In your hand: the failed drive from ${esc(bayName(hand.from))}.</p>` : '') +
      (t.rma ? '<p class="cap" style="font-size:13px">Failed drive tagged and set aside for return.</p>' : '') +
      `<h3>The basic carrier</h3><div style="display:flex;gap:10px;align-items:flex-start"><img class="photo" style="width:96px;flex:none" alt="Two drive bays of this server close up" src="${IMG.hpBayRef}"><ol class="rules" style="margin:0;padding-left:18px;font-size:12.5px"><li>Latch lever (the handle), hinged at the top</li><li>Its grip end, with the dark red line; the finger space is just below it</li><li>Online/Activity LED (left)</li><li>Fault/Locate LED (right)</li><li>Bay number, printed above the bay</li></ol></div>` +
      `<h3>Drive LEDs</h3><table class="dec"><tr><td>Green, solid</td><td>Online, no activity</td></tr><tr><td>Green, flashing</td><td>Activity, or rebuilding</td></tr><tr><td>Amber, solid</td><td>Failed</td></tr><tr><td>Amber, flashing</td><td>Predictive failure</td></tr><tr><td>Blue, solid</td><td>Being located</td></tr><tr><td>Off</td><td>Not configured, or a spare</td></tr></table>`;
  }
});

Sim.on('box', k => { T.sel.box = +k; if (boxOf(T.sel.bay) !== +k) T.sel.bay = +k * 8; });
Sim.on('pullTab', () => {
  T.pullTab = !T.pullTab; fxMark('tab'); Sim.sound(T.pullTab ? 'tab' : 'clip', 0.02);
  if (T.pullTab) { T.tabSide = 'sn'; say('info', `Pull tab out. This side: serial number ${LAB.serial}, product number ${PROFILE.productId}. The other side carries the iLO account.`); }
  else say('info', 'Pull tab pushed back in.');
});
Sim.on('tabSide', () => {
  if (!T.pullTab) return say('info', 'Pull the tab out first.');
  T.tabSide = T.tabSide === 'ilo' ? 'sn' : 'ilo'; fxMark('tabflip');
  if (T.tabSide === 'ilo') { T.flags.sawTab = true; say('info', `iLO side of the pull tab: user ${LAB.user}, password ${LAB.pw}, iLO DNS name ${LAB.ilo}. The iLO Service Port answers at ${LAB.svcIp}.`); }
  else say('info', `Serial number side: ${LAB.serial}.`);
});
Sim.on('svcPort', () => say('info', 'iLO Service Port: a USB port that takes a USB-to-Ethernet adapter. A laptop on it reaches iLO at 169.254.1.2, even in standby. Connect the laptop in the Power and iLO view.'));
Sim.on('uid', () => { T.uid = !T.uid; say('info', T.uid ? 'UID on: the front and rear UID LEDs light blue, so the server can be found in the rack.' : 'UID off.'); });
Sim.on('power', () => {
  if (!acOn(T)) return say('info', 'Nothing happens: the power LED stays off. Connect the power cords first (Power and iLO view).');
  if (T.cover !== 'closed') return bad('Close the access panel before powering on: the server must not run without it. The panel is part of the airflow path.');
  if (T.baffle === false) return bad('Refit the air baffle before powering on.');
  if (T.rack.pos !== 'in') return bad('Push the server back into the rack first (Rack view).');
  { const e = T.bays.findIndex(b => b.st === 'empty' || b.st === 'open'); if (e >= 0 && T.power === 'standby') return bad(`${bayName(e)} is ${T.bays[e].st === 'open' ? 'open: push its latch closed' : 'empty: fit a drive or push its blank back in'} before powering on. Every bay needs a drive or a blank, for the airflow.`); }
  if (T.power === 'standby') { T.power = 'post'; T.postAt = Date.now(); Sim.sound('fans'); return say('ok', 'Power button pressed: the power LED flashes green while the server runs its power-on sequence.'); }
  if (T.power === 'on') { T.power = 'standby'; Sim.soundStop('fans', 2.5); return say('info', 'Power button pressed and released: graceful shutdown. The power LED turns amber (standby).'); }
});
// the minimum number of front drives for the new build: enough for a RAID 6 or RAID 10 data volume (RAID 1 needs 2, RAID 5 3)
const DMIN = 4;
Sim.on('ssdBack', () => { if (!T.hand || T.hand.kind !== 'ssd') return; T.hand = null; T.ssdKit++; say('info', 'SSD put back in its box.'); });
Sim.on('ssdPick', () => { if (T.hand) return bad('Your hands are full.'); if (!T.ssdKit) return; T.ssdKit--; T.hand = { kind: 'ssd' }; say('info', 'New SSD picked up by its carrier, its latch lifted halfway open, ready to slide in.'); });
Sim.on('driveAside', () => { if (!T.hand || T.hand.kind !== 'failed') return; T.hand = null; T.rma = true; say('ok', 'Failed drive tagged and set aside for return.'); });
const bayFx = (i, kind) => { T.bays[i].fx = kind; fxMark('bay' + i); };
Sim.on('bayRel', i => {
  i = +i; const b = T.bays[i]; T.sel.bay = i; T.sel.box = boxOf(i);
  if (b.st !== 'drive') return;
  if (b.health !== 'fault' && isOn(T) && T.vol.members.includes(i)) return bad(`${bayName(i)} is a healthy drive in a running array (green LED). Find the drive with the amber fault LED.`);
  b.st = 'open'; b.ins = false; b.rel = true; bayFx(i, 'rel');
  Sim.sound('clipOpen', 0.2);
  say('ok', `Finger in the space below the red line of ${bayName(i)}: the latch lifted out about halfway, pivoting on its top hinge. Now pull the drive out by it.`);
});
Sim.on('bay', i => {
  i = +i; const b = T.bays[i]; T.sel.bay = i; T.sel.box = boxOf(i);
  if (b.st === 'blank') {
    if (T.hand) return bad('Put down what you are holding first.');
    b.st = 'empty'; T.blanks++; bayFx(i, 'unblank'); Sim.sound('tab', 0.02); return say('ok', `Blank pulled out of ${bayName(i)} by its finger notch. Keep it for later.`);
  }
  if (b.st === 'empty') {
    if (!T.hand) { if (T.blanks) { T.blanks--; b.st = 'blank'; bayFx(i, 'blank'); return say('info', `Blank pushed back into ${bayName(i)}.`); } return say('info', `${bayName(i)} is empty. Pick up a drive from the tray first.`); }
    if (T.hand.kind !== 'ssd') return bad('That is the failed drive. Set it aside for return, then pick up the new one.');
    b.st = 'open'; b.ins = true; b.rel = false; b.health = 'ok'; T.hand = null; bayFx(i, 'ins'); Sim.sound('drive', 0.3);
    return say('ok', `Drive slid back into ${bayName(i)} with its latch open, until it was fully seated against the backplane. Now push the latch closed.`);
  }
  if (b.st === 'open') {
    if (b.ins) {
      b.st = 'drive'; b.ins = false; bayFx(i, 'close'); Sim.sound('latch', 0.5);
      if (T.flags.replacing === i && isOn(T)) { b.health = 'rebuild'; b.pct = 0; T.flags.replaced = true; return say('ok', `Latch pushed closed: it clicked and locked. The drive's Online/Activity LED flashes green: the array is rebuilding onto it.`); }
      if (!T.vol.members.includes(i) && T.flags.driveMin) { const n = driveCount(T); return say(n >= DMIN ? 'ok' : 'info', `Latch pushed closed until it clicked: the drive is locked in ${bayName(i)}. ${n} SSD${n > 1 ? 's' : ''} fitted${n < DMIN ? `: ${DMIN - n} more to reach the minimum of ${DMIN}` : n === DMIN ? ': the minimum of 4 is reached. Fit more if you like' : ''}.`); }
      return say('ok', `Latch pushed closed until it clicked: the drive is locked in ${bayName(i)}.`);
    }
    if (T.hand) return bad('Your hands are full.');
    // a new drive that is in no volume yet can simply come out again, back into its box
    if (b.health !== 'fault' && !T.vol.members.includes(i)) { b.st = 'empty'; b.rel = false; T.ssdKit++; bayFx(i, 'pull'); Sim.sound('drive', 0.02); return say('info', `SSD pulled out of ${bayName(i)} by its latch and put back in its box. It was in no volume yet. Fit a drive or push the blank back in: never leave a bay empty while the server runs.`); }
    T.hand = { kind: b.health === 'fault' ? 'failed' : 'healthy', from: i }; b.st = 'empty'; b.rel = false; bayFx(i, 'pull'); Sim.sound('drive', 0.02);
    if (T.hand.kind === 'failed') { T.flags.pulled = true; T.flags.replacing = i; return say('ok', `Failed drive pulled out of ${bayName(i)} by its latch. Set it aside for return, and fit the new drive in the same bay.`); }
    return bad(`That drive was healthy. Put it back in ${bayName(i)}.`);
  }
  if (b.st === 'drive' && b.health === 'fault') T.flags.found = true;
  if (b.st === 'drive') say('info', `${bayName(i)}: ${CATALOG.ssd.short} (${CATALOG.ssd.label}). ${b.health === 'fault' ? 'Fault/Locate LED amber: this is the failed drive. Put a finger in the space below its red line and lift the latch.' : isOn(T) ? 'Online LED green.' : 'Server off: LEDs off.'}`);
});
