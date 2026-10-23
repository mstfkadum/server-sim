/* ============ 5. Views ============ */
/* ---- Chassis: the trainer's two top-view photos (air baffle in / out), straightened onto one frame, cleaned, front at left.
   Coordinates are in the 2000 x 1180 photo frame; the view shows it at 0.45 scale. ---- */
const PK = 0.45, PY0 = 30, HX = x => x * PK, HY = y => PY0 + y * PK;
const HR = (x1, y1, x2, y2) => `x="${HX(x1).toFixed(1)}" y="${HY(y1).toFixed(1)}" width="${(HX(x2) - HX(x1)).toFixed(1)}" height="${(HY(y2) - HY(y1)).toFixed(1)}"`;
const zone = (act, arg, label, b) => `<g${hot(act, arg, label)}><rect ${HR(...b)} rx="4" class="zone"/></g>`;
const mask = b => `<rect ${HR(...b)} rx="3" fill="#101A22" opacity=".9"/>`;
// fan modules as numbered on the chassis: fan 1 at the bottom, fan 6 at the top (y of each green handle)
const FANH = [953, 778, 606, 434, 262, 92];
const FANBOX = FANH.map(h => [548, h - 22, 702, h + 150]);
const CPUBOX = [[822, 738, 1112, 978], [822, 214, 1112, 458]];                 // CPU 1 (lower), CPU 2 (upper): heatsink footprints
const DIMMBOX = [[[745, 594, 1120, 736], [745, 980, 1120, 1082]], [[745, 112, 1120, 212], [745, 460, 1120, 594]]];
// socket rows in the chassis photo (front at left, CPU 2 at the top), measured from the blue slot-1 sockets
const DIMMROW = { G1: 133, G2: 155, G3: 176, H1: 198, H2: 220, H3: 241, F3: 474, F2: 496, F1: 518, E3: 540, E2: 561, E1: 582,
  C1: 606, C2: 627, C3: 649, D1: 670, D2: 692, D3: 714, B3: 955, B2: 977, B1: 1000, A3: 1023, A2: 1045, A1: 1068 };
const RISER2 = [1380, 372, 1950, 722], RISER1 = [1380, 730, 1950, 1092], BAFFLE = [712, 15, 1300, 1165], FRONT = [0, 0, 470, 1180];
const mid = b => [HX((b[0] + b[2]) / 2), HY((b[1] + b[3]) / 2) + 5];
/* ---- Top cover latch: the trainer's two latch photos (closed, lifted), aligned on the four cover rivets.
   Photo coordinates are 720 x 1080. The fan-tray peg is drawn: the photos were taken with the cover off the server. ---- */
// straightened on the four cover rivets, so the latch and the lock slot stand square
// hole: the small stadium-shaped hole at the rear end of the latch [x, y, w, h]; pin: the pin on the fan-tray bracket, as the photo
// shows it through that hole [x, y, w, h], which is where it stands when the cover is in place
const LATCH = { dial: [370.7, 688.9, 43], slot: -0.8, grip: [300, 897, 443, 953], handleC: [249, 500, 460, 1014], handleO: [234, 78, 466, 504], press: [257, 357, 466, 502], hole: [349, 956, 53, 33], pin: [361.5, 960, 24.5, 26], STEP: 21, MAX: 2 };
const LP = { x: 520, y: 36, w: 356, h: 534 };            // photo panel in the frame (2:3)
const LVB = { full: [50, 60, 640, 960], zoom: [150, 340, 460, 690] };
const lpt = (vb, X, Y) => [LP.x + (X - vb[0]) * LP.w / vb[2], LP.y + (Y - vb[1]) * LP.h / vb[3]];
const fx = k => { T.fx = { k, at: Date.now() }; };
const fxOn = (t, k) => t.fx && t.fx.k === k && Date.now() - t.fx.at < 900;
const fitOk = t => t.coverFit.dx === 0 && t.coverFit.dy === 0;
const nudgeDir = t => { const f = t.coverFit; return f.dx > 0 ? 'left' : f.dx < 0 ? 'right' : f.dy > 0 ? 'up' : 'down'; };
// server top view (the baffle-in photo), scaled into the left of the frame (front at left)
const SK = 476 / 2000, SX = x => 24 + x * SK, SY = y => 150 + y * SK;
function latchPanel(t) {
  const [hx, hy, hw, hh] = LATCH.hole, [qx, qy, qw, qh] = LATCH.pin, px = qx + qw / 2, py = qy + qh / 2, [dcx, dcy, dr] = LATCH.dial;
  const placed = t.cover === 'placed', vb = placed ? LVB.zoom : LVB.full, R = (b, act, arg, label, extra = '') => `<g${hot(act, arg, label)}><rect x="${b[0]}" y="${b[1]}" width="${b[2] - b[0]}" height="${b[3] - b[1]}" rx="10" class="zone"${extra}/></g>`;
  const k = LP.w / vb[2];
  let s = `<defs><clipPath id="lpclip"><rect x="${LP.x}" y="${LP.y}" width="${LP.w}" height="${LP.h}" rx="4"/></clipPath></defs><g clip-path="url(#lpclip)"><g transform="translate(${LP.x} ${LP.y}) scale(${k.toFixed(5)}) translate(${-vb[0]} ${-vb[1]})">`;
  if (t.cover === 'closed') {
    s += `<image href="${IMG.latchOpen}" width="720" height="1080"/><image href="${IMG.latchClosed}" width="720" height="1080">${fxOn(t, 'press') ? '<animate attributeName="opacity" from="0" to="1" dur="0.6s" fill="freeze"/>' : ''}</image>`;
    // the lock: the photo shows it unlocked (slot towards the open padlock); locked is the same disc turned 90 degrees
    const S0 = LATCH.slot, a1 = (t.coverLock ? 90 : 0) + S0, a0 = fxOn(t, 'unlock') ? 90 + S0 : fxOn(t, 'lock') ? S0 : a1;
    s += `<defs><clipPath id="dialclip"><circle cx="${dcx}" cy="${dcy}" r="${dr}"/></clipPath></defs><g transform="rotate(${a1} ${dcx} ${dcy})">${a0 !== a1 ? `<animateTransform attributeName="transform" type="rotate" from="${a0} ${dcx} ${dcy}" to="${a1} ${dcx} ${dcy}" dur="0.7s" fill="freeze"/>` : ''}<image href="${IMG.latchClosed}" width="720" height="1080" clip-path="url(#dialclip)"/></g>`;
    s += `<g${hot('coverDial', '', t.coverLock ? 'Cover lock: locked. Turn it a quarter turn anticlockwise to unlock' : 'Cover lock: unlocked. A quarter turn clockwise locks it')}><circle cx="${dcx}" cy="${dcy}" r="${dr + 10}" class="zone"/></g>`;
    s += R(LATCH.grip, 'coverLift', '', 'Green finger grip: lift the latch here');
  } else {
    if (!placed) s += `<image href="${IMG.latchOpen}" width="720" height="1080"/>`;
    if (fxOn(t, 'lift')) s += `<image href="${IMG.latchClosed}" width="720" height="1080"><animate attributeName="opacity" from="1" to="0" dur="0.6s" fill="freeze"/></image>`;
    if (t.cover === 'lifted') s += R(LATCH.handleO, 'coverPress', '', 'Raised latch: press it back down');
  }
  if (placed) {
    // the cover (photo) moves; the pin on the fan-tray bracket stays put. The photo shows the pin through the small hole, so
    // the hole is painted dark on the moving cover and the pin is drawn from the same photo, fixed, seen only through the hole
    const S = LATCH.STEP, ox = t.coverFit.dx * S, oy = t.coverFit.dy * S, ok = fitOk(t), rr = hh / 2;
    s += `<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="#2B3036"/>`;
    s += `<defs><clipPath id="holeclip"><rect id="holeclipR" x="${hx}" y="${hy}" width="${hw}" height="${hh}" rx="${rr}" ry="${rr}" transform="translate(${ox} ${oy})"/></clipPath><clipPath id="pinclip"><rect x="${qx}" y="${qy}" width="${qw}" height="${qh}" rx="5"/></clipPath><radialGradient id="holeg" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#1A1E23"/><stop offset="1" stop-color="#07090B"/></radialGradient></defs>`;
    s += `<g class="dragcover" transform="translate(${ox} ${oy})" style="cursor:grab;touch-action:none"><image href="${IMG.latchOpen}" width="720" height="1080"/><rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" rx="${rr}" ry="${rr}" fill="url(#holeg)" stroke="#05070A" stroke-width="2"/>${R(LATCH.press, 'coverPress', '', 'Raised latch: press it down to close the cover')}</g>`;
    s += `<g clip-path="url(#holeclip)"><rect x="${qx - 3}" y="${qy + 4}" width="${qw + 6}" height="${qh}" rx="6" fill="#000" opacity=".5"/><image href="${IMG.latchOpen}" width="720" height="1080" clip-path="url(#pinclip)"/></g>`;
    s += `<circle cx="${px}" cy="${py}" r="${ok ? 24 : 22}" fill="none" stroke="${ok ? '#45D07F' : '#F0A93B'}" stroke-width="3.5" stroke-dasharray="${ok ? '0' : '7 5'}"/>`;
  }
  s += '</g></g>';
  let o = `<rect x="${LP.x - 2}" y="${LP.y - 2}" width="${LP.w + 4}" height="${LP.h + 4}" rx="6" fill="none" stroke="#8E99A3" stroke-width="2"/>` + s;
  // what to do with a closed latch, drawn on it: locked, a quarter-turn arrow round the lock; unlocked, a pull-up arrow on the
  // green finger grip (the latch swings up toward the front end). The words sit on the plain cover beside the latch.
  if (t.cover === 'closed' && Sim.guide) {
    const A = '#FFB52E', pulse = (x, y, r0, r1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r0}" fill="none" stroke="${A}" stroke-width="2.5"><animate attributeName="r" values="${r0};${r1}" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite"/></circle>`;
    const pill = (x, y, txt) => { const w = txt.length * 6.6 + 16; return `<rect x="${f1(x)}" y="${f1(y - 14)}" width="${f1(w)}" height="21" rx="10.5" fill="#14202B" stroke="${A}" stroke-width="1.5"/><text x="${f1(x + w / 2)}" y="${f1(y + 1)}" text-anchor="middle" style="font:700 11.5px var(--font);fill:#FFE3A8">${txt}</text>`; };
    if (t.coverLock) {
      const [x, y] = lpt(vb, dcx, dcy), r = dr * k + 9, p = a => [x + r * Math.cos(a), y + r * Math.sin(a)], [x0, y0] = p(0.15), [x1, y1] = p(-1.45);
      const arc = `M${f1(x0)} ${f1(y0)}A${f1(r)} ${f1(r)} 0 0 0 ${f1(x1)} ${f1(y1)}`, head = `M${f1(x1 + 9)} ${f1(y1 - 6)}L${f1(x1)} ${f1(y1)}L${f1(x1 + 8)} ${f1(y1 + 7)}`;
      o += `<g pointer-events="none">${pulse(x, y, r - 4, r + 12)}<g><animate attributeName="opacity" values="1;.45;1" dur="1.4s" repeatCount="indefinite"/><path d="${arc}${head}" fill="none" stroke="#14202B" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="${arc}${head}" fill="none" stroke="${A}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>${pill(LP.x + 8, y + 5, 'Unlock: \u00BC turn')}</g>`;
    } else {
      const [x, y] = lpt(vb, (LATCH.grip[0] + LATCH.grip[2]) / 2, (LATCH.grip[1] + LATCH.grip[3]) / 2);
      const arrow = `M${f1(x)} ${f1(y - 17)}V${f1(y - 66)}M${f1(x - 11)} ${f1(y - 54)}L${f1(x)} ${f1(y - 67)}L${f1(x + 11)} ${f1(y - 54)}`;
      o += `<g pointer-events="none">${pulse(x, y, 14, 30)}<g><animateTransform attributeName="transform" type="translate" values="0 6;0 -6;0 6" dur="1.3s" repeatCount="indefinite"/><path d="${arrow}" fill="none" stroke="#14202B" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="${arrow}" fill="none" stroke="${A}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>${pill(LP.x + 8, y - 38, 'Pull the grip up')}</g>`;
    }
  }
  // nothing else written over the photo: what it shows, and what to do, goes in a caption under it
  const lab = { closed: 'Your photo: latch closed', lifted: 'Your photo: latch lifted, cover pushed back', placed: 'Close-up: the small hole in the latch over the pin' }[t.cover];
  const ok = placed && fitOk(t), stat = placed ? (ok ? ['Pin centred in the small hole: press the latch down', '#45D07F'] : ['Dashed circle: the pin on the fan-tray bracket, under the cover', '#FFD27A'])
    : t.cover === 'closed' ? [t.coverLock ? 'Locked: \u00BC turn anticlockwise, then pull the grip up' : 'Unlocked: pull the green grip up to open the latch', '#FFD27A'] : t.cover === 'lifted' ? ['Latch fully open: lift the cover straight up', '#DCE3E9'] : ['', '#DCE3E9'];
  o += `<text x="${LP.x}" y="${LP.y + LP.h + 24}" class="st" style="font-size:13px">${esc(lab)}</text><text x="${LP.x}" y="${LP.y + LP.h + 42}" class="ss" style="fill:${stat[1]}">${esc(stat[0])}</text><text x="${LP.x}" y="${LP.y + LP.h + 59}" class="ss">Front end at the top, rear end at the bottom</text>`;
  if (placed) {
    const cx = LP.x + LP.w - 48, cy = LP.y + LP.h / 2 + 40;
    o += `<circle cx="${cx}" cy="${cy}" r="46" fill="#0E1A22" opacity=".55"/>`;
    const ar = [['up', cx, cy - 27, 'M-8 4L0-5L8 4'], ['down', cx, cy + 27, 'M-8-4L0 5L8-4'], ['left', cx - 27, cy, 'M4-8L-5 0L4 8'], ['right', cx + 27, cy, 'M-4-8L5 0L-4 8']];
    ar.forEach(([d, x, y, p]) => { o += `<g${hot('coverNudge', d, 'Move the cover ' + d)}><circle cx="${x}" cy="${y}" r="16" fill="#0E1A22" opacity=".9" stroke="#C5CCD3" stroke-width="1.5"/><path d="${p}" transform="translate(${x} ${y})" fill="none" stroke="#FFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`; });
  }
  return o;
}
function coverSchematic(t) {
  const sh = t.cover === 'closed' ? 0 : 9, from = fxOn(t, 'lift') ? 0 : fxOn(t, 'press') ? 9 : sh, LX = 624, LY = 590;
  let g = `<image href="${IMG.chassisIn}" x="${SX(0)}" y="${SY(0)}" width="${SX(2000) - SX(0)}" height="${SY(1180) - SY(0)}"/>`;
  g += `<g transform="translate(${sh} 0)">${from !== sh ? `<animateTransform attributeName="transform" type="translate" from="${from} 0" to="${sh} 0" dur="0.6s" fill="freeze"/>` : ''}`;
  const cv = `x="${SX(472).toFixed(1)}" y="${SY(4).toFixed(1)}" width="${(SX(1996) - SX(472)).toFixed(1)}" height="${(SY(1176) - SY(4)).toFixed(1)}"`;
  g += t.cover === 'lifted' ? `<g${hot('coverOff', '', 'Top cover: lift it straight up')}><rect ${cv} rx="3" fill="#C5CCD3"/><rect ${cv} rx="3" class="zone"/></g>` : `<rect ${cv} rx="3" fill="#C5CCD3" stroke="#8E99A3" stroke-width="2"/>`;
  // the latch itself, cut from the same photo as the close-up and laid on the cover: it runs front to back, hinge toward the front
  const open = t.cover !== 'closed', crop = open ? [212, 236, 488, 1044] : [212, 326, 488, 1044], LK = 0.098, LC = [350, 685];
  g += `<defs><clipPath id="minilatch" clipPathUnits="userSpaceOnUse"><rect x="${crop[0]}" y="${crop[1]}" width="${crop[2] - crop[0]}" height="${crop[3] - crop[1]}" rx="40"/></clipPath></defs>`;
  g += `<g pointer-events="none" transform="translate(${SX(LX)} ${SY(LY)}) rotate(-90) scale(${LK}) translate(${-LC[0]} ${-LC[1]})"><rect x="${crop[0] - 14}" y="${crop[1] - 14}" width="${crop[2] - crop[0] + 28}" height="${crop[3] - crop[1] + 28}" rx="50" fill="#0E1A22" opacity=".25"/><image href="${open ? IMG.latchOpen : IMG.latchClosed}" width="720" height="1080" clip-path="url(#minilatch)"/><rect x="${crop[0]}" y="${crop[1]}" width="${crop[2] - crop[0]}" height="${crop[3] - crop[1]}" rx="40" fill="none" stroke="#3A4046" stroke-width="10"/></g></g>`;
  // zoom callout: a frame round the latch on the cover, and a cone from it to the close-up photo.
  // The latch, frame, cone and labels are markers only: clicks pass through to the cover underneath.
  const fw = (open ? 90 : 80), fh = 34, fx0 = SX(LX) + sh - fw / 2 + (open ? -4 : 0), fy0 = SY(LY) - fh / 2, fx1 = fx0 + fw, fy1 = fy0 + fh;
  const px0 = LP.x - 2, py0 = LP.y - 2, py1 = LP.y + LP.h + 2;
  g += `<g pointer-events="none">`;
  g += `<path d="M${fx1} ${fy0}L${px0} ${py0}L${px0} ${py1}L${fx1} ${fy1}Z" fill="#FFB52E" fill-opacity=".10"/><path d="M${fx1} ${fy0}L${px0} ${py0}M${fx1} ${fy1}L${px0} ${py1}" stroke="#FFB52E" stroke-width="1.6" stroke-opacity=".85"/>`;
  g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" rx="5" fill="none" stroke="#FFB52E" stroke-width="2.5"/>${Sim.guide ? `<rect x="${fx0 - 4}" y="${fy0 - 4}" width="${fw + 8}" height="${fh + 8}" rx="8" fill="none" stroke="#FFB52E" stroke-width="2"><animate attributeName="stroke-opacity" values=".9;0;.9" dur="1.8s" repeatCount="indefinite"/></rect>` : ''}`;
  g += chip(fx0 + 2, fy0 - 12, 'Cover latch, over the fans', 'start') + `<text x="${fx1 + 10}" y="${SY(LY) + 4}" class="ss" style="fill:#14202B;font-weight:600">shown enlarged &#8594;</text>`;
  g += `</g>`;
  g += `<line x1="${SX(470)}" y1="${SY(0) - 8}" x2="${SX(470)}" y2="${SY(1180) + 8}" stroke="#F0A93B" stroke-width="2"/>`;
  g += `<text x="24" y="${SY(1180) + 22}" class="st">Front</text><text x="500" y="${SY(1180) + 22}" text-anchor="end" class="st">Rear</text>`;
  g += `<text x="${SX(470) + 4}" y="${SY(1180) + 42}" class="ss">${{ closed: 'Cover closed and latched', lifted: 'Cover pushed back about 1/2 inch (1.27 cm)', placed: 'Cover set 1/2 inch behind the front lip' }[t.cover]}</text>`;
  return g;
}
// installed DIMMs drawn onto the empty slots of the photo (the slots are hidden under the heatsinks' edges)
function dimmStrips(t) {
  const hs = CPUBOX.map(b => `M${HX(b[0])} ${HY(b[1])}H${HX(b[2])}V${HY(b[3])}H${HX(b[0])}Z`).join('');
  let s = `<defs><clipPath id="nohs"><path clip-rule="evenodd" d="M0 0H900V600H0Z${hs}"/></clipPath></defs><g clip-path="url(#nohs)">`;
  const x0 = HX(770), w = HX(1096) - HX(770);
  Object.keys(DIMMROW).forEach(id => {
    const d = t.dimms[id]; if (!d) return;
    const y = HY(DIMMROW[id]);
    s += `<rect x="${x0.toFixed(1)}" y="${(y - 3.4).toFixed(1)}" width="${w.toFixed(1)}" height="6.8" rx="1.2" fill="#14191D" stroke="${d.fault ? '#F0A93B' : '#0A0D10'}" stroke-width="${d.fault ? 1.8 : 0.8}"${d.fault ? ' class="blink"' : ''}/><line x1="${(x0 + 2).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x0 + w - 2).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#3E9A62" stroke-width="1.4"/>`;
  });
  return s + '</g>';
}
/* ---- Numbered parts: the "Replaceable Component Locations" diagram on the server's top cover (items 1 to 18).
   pos: marker positions in the 2000 x 1180 photo frame; in: shown with the air baffle in; out: shown with it out ---- */
const PARTS = [
  { n: 1, t: 'Drive bays', s: 'SAS/SATA drives, hot-swappable', pos: [[235, 560]], in: 1, out: 1, z: null, go: 'storage',
    d: t => `Twelve 3.5-inch bays at the front, HDD 01 to HDD 12. ${t.bays.filter(b => b.st === 'locked').length} of ${PROFILE.bays} hold a drive. Click the front panel to open the drive bays.` },
  { n: 2, t: 'Fan modules', s: 'hot-swappable; the fan tray is not hot-swappable', pos: [[625, 1140]], in: 1, out: 1, z: null, go: 'fans',
    d: t => { const o = t.fans.indexOf('out'), f = t.fans.indexOf('fault'); return 'Six hot-swappable modules, FAN 01 at the bottom to FAN 06 at the top. Arrow on top points to the rear. Click one to open the fan modules. ' + (o >= 0 ? `FAN 0${o + 1} is removed${t.fanClock > 0 ? ` (${t.fanClock} s left)` : ''}.` : f >= 0 ? `FAN 0${f + 1} has an amber fault LED.` : 'All modules OK.'); } },
  { n: 3, t: 'DIMM sockets (24)', s: '12 per CPU, six on each side of its socket', pos: [[790, 162], [790, 527], [790, 665], [790, 1031]], in: 0, out: 1, z: null,
    d: t => `CPU 1 = channels A to D, CPU 2 = E to H, three sockets each. Fill the blue sockets first: A1, E1, B1, F1, C1, G1, D1, H1. ${memSummary(t).count} DIMMs installed.${t.baffle ? ' Under the air baffle.' : ''}` },
  { n: 4, t: 'CPUs and heatsinks (two)', s: 'CPU 1 lower, CPU 2 upper', pos: [[848, 238], [848, 762]], in: 0, out: 1, z: null,
    d: t => { const st = c => ({ dust: 'dust cover on', empty: 'socket empty', seated: 'not finished', torqued: 'installed' }[t.cpu[c].st]); return `CPU 1 is required; install it first. Without CPU 2, riser 2, the PCIe SSD interposer and CPU 2's memory are not available. CPU 1: ${st(0)}. CPU 2: ${st(1)}.${t.baffle ? ' Under the air baffle.' : ''}`; } },
  { n: 5, t: 'SD card bays on motherboard (two)', s: 'SD1 and SD2', pos: [[1235, 215]], in: 1, out: 1, z: [1100, 140, 1290, 300],
    d: () => 'Small removable boot media, for example a hypervisor. SD2 sits partly under the air baffle edge.' },
  { n: 6, t: 'PCIe SSD interposer socket', s: 'on the motherboard', pos: [[1352, 228]], in: 1, out: 1, z: [1318, 160, 1388, 300],
    d: () => 'Takes the PCIe SSD interposer board that connects front PCIe SSDs. It needs CPU 2.' },
  { n: 7, t: 'USB 3.0 port on motherboard', s: 'internal', pos: [[1172, 362]], in: 0, out: 1, z: [1150, 340, 1196, 392],
    d: t => 'Internal USB port, for example for a boot key.' + (t.baffle ? ' Hidden under the edge of the air baffle.' : '') },
  { n: 8, t: 'Power supplies (two)', s: 'hot-swappable when redundant as 1+1', pos: [[1880, 92]], in: 1, out: 1, z: [1420, 60, 1910, 345],
    d: t => `They slide in from the rear, under this cage. ${t.cables.psu1 && t.cables.psu2 ? 'Both power cords are connected: 1+1 redundant.' : t.cables.psu1 || t.cables.psu2 ? 'Only one power cord is connected: no redundancy.' : 'No power cord is connected.'}` },
  { n: 9, t: 'TPM', s: 'on the motherboard, under PCIe riser 2', pos: [[1440, 420]], in: 1, out: 1, z: null,
    d: () => 'Trusted Platform Module, the hardware security chip. Lift riser 2 to reach it.' },
  { n: 10, t: 'PCIe riser 2', s: 'slots 4 (x8), 5 (x16), 6 (x8)', pos: [[1470, 645]], in: 1, out: 1, z: null, go: 'riser',
    d: t => { const vs = vicSlot(t); return `Needs CPU 2. ${riserOut(t) ? 'Riser 2 is out of the chassis.' : vs ? `The VIC 1225 in slot ${vs} gives the server its two 10 Gb SFP+ data ports.` : 'No cards fitted.'} Click it to open the riser.`; } },
  { n: 11, t: 'PCIe riser 1', s: 'this server has riser 1C', pos: [[1470, 1000]], in: 1, out: 1, z: [1380, 730, 1950, 1040],
    d: () => 'Riser 1C: slot 1 (x8) and slot 2 (x16), with two SATA boot drive sockets in place of slot 3.' },
  { n: 12, t: 'SATA boot drive sockets', s: 'riser 1 version UCSC-PCI-1C-240M4 only', pos: [[1790, 905]], in: 1, out: 1, z: [1690, 800, 1890, 1010],
    d: () => 'Two Samsung SATA solid-state drives are fitted here as boot drives.' },
  { n: 13, t: 'mLOM bay and socket', s: 'under PCIe riser 1', pos: [[1650, 1068]], in: 1, out: 1, z: [1500, 1042, 1800, 1094],
    d: () => 'Modular LAN-on-motherboard card. Lift riser 1 to reach it.' },
  { n: 14, t: 'Embedded SATA RAID interposer socket', s: 'on the motherboard', pos: [[1265, 1085]], in: 1, out: 1, z: [1232, 1058, 1300, 1112],
    d: () => 'For the embedded software RAID (SATA only). The front label lists the interposer board UCSC-IP-PCH-C240M4.' },
  { n: 15, t: 'Cisco modular RAID controller bracket', s: 'and its dedicated PCIe socket on the motherboard', pos: [[1600, 1150]], in: 1, out: 1, z: [1380, 1112, 1950, 1180],
    d: () => 'Holds the Cisco 12G SAS modular RAID controller for the front drives: RAID 0, 1, 5, 6, 10, 50, 60. Do not mix it with the embedded RAID.' },
  { n: 16, t: 'RTC battery socket', s: 'on the motherboard', pos: [[1305, 855]], in: 1, out: 1, z: [1268, 818, 1342, 892],
    d: () => 'Coin cell that keeps the clock and BIOS settings while the server has no power.' },
  { n: 17, t: 'Embedded RAID 5 key socket', s: 'marked SW RAID KEY', pos: [[1240, 368]], in: 0, out: 1, z: [1202, 346, 1280, 402],
    d: t => 'A key here enables RAID 5 on the embedded SATA RAID.' + (t.baffle ? ' Hidden under the edge of the air baffle.' : '') },
  { n: 18, t: 'SuperCap power module', s: 'RAID backup, on the removable air baffle', pos: [[880, 915]], in: 1, out: 0, z: null,
    d: t => 'Backs up the RAID controller write cache if power is lost. It sits on the air baffle, at its SuperCap sticker' + (t.baffle ? '.' : ': refit the baffle to see it.') }];
function partMarks(t) {
  let g = '';
  PARTS.forEach(p => {
    if (!(t.baffle ? p.in : p.out)) return;
    if (p.z) g += `<g${hot('partInfo', p.n, `${p.n}. ${p.t}`)}><rect ${HR(...p.z)} rx="4" class="zone"/></g>`;
  });
  PARTS.forEach(p => {
    if (!(t.baffle ? p.in : p.out)) return;
    const on = Sim.hl === p.n;
    p.pos.forEach(([x, y]) => {
      const cx = HX(x).toFixed(1), cy = HY(y).toFixed(1);
      g += `<g${hot('partInfo', p.n, `${p.n}. ${p.t}`)}>${on ? `<circle cx="${cx}" cy="${cy}" r="17" fill="none" stroke="#FFB52E" stroke-width="3" class="blink"/>` : ''}<circle cx="${cx}" cy="${cy}" r="10.5" fill="${on ? '#FFB52E' : '#FFFFFF'}" stroke="#14202B" stroke-width="1.6"/><text x="${cx}" y="${(+cy + 4).toFixed(1)}" text-anchor="middle" style="font:700 ${p.n > 9 ? 10.5 : 12}px var(--font);fill:#14202B;pointer-events:none">${p.n}</text></g>`;
    });
  });
  return g;
}
function partsLegend(t) {
  const open = t.cover === 'open';
  return `<h3>Component locations</h3><p class="cap" style="font-size:13px;margin:0 0 6px">Numbers as on the "Replaceable Component Locations" diagram on the server's top cover. ${open ? (t.baffle ? 'Items 3, 4, 7 and 17 are under the air baffle; lift it to see them.' : 'Item 18 sits on the air baffle; refit it to see it.') : 'Remove the top cover to see the numbers on the photo.'} Click a number to find it.</p>
    <div class="plist">${PARTS.map(p => { const vis = open && (t.baffle ? p.in : p.out); return `<button class="prow${Sim.hl === p.n ? ' on' : ''}${vis ? '' : ' dim'}" data-act="partInfo" data-arg="${p.n}"><b>${p.n}</b><span><strong>${esc(p.t)}</strong> <small>${esc(p.s)}</small><em>${esc(p.d(t))}</em></span></button>`; }).join('')}</div>`;
}
Sim.on('partInfo', n => {
  n = +n; const p = PARTS.find(q => q.n === n); if (!p) return;
  Sim.hl = Sim.hl === n && Sim.coach.msg.startsWith(n + '.') ? null : n;
  say('info', `${p.n}. ${p.t} (${p.s}). ${p.d(T)}`);
});
// ESD wrist strap on a hand: band on the wrist, coiled cord, crocodile clip on bare chassis metal (tx, ty)
function esdFig(t, x, y, tx, ty) {
  const on = t.esd, sk = '#E6B08C', ske = '#9A6A4A', bandC = '#1F6FB2';
  let s = `<g${hot('esd', '', on ? 'ESD wrist strap: on. Click to take it off' : 'ESD wrist strap: put it on and clip it to the chassis')}>`;
  s += `<rect x="${x - 6}" y="${y - 6}" width="346" height="64" rx="10" fill="${on ? '#173F2C' : '#0E1A22'}" stroke="${on ? '#45D07F' : '#8E99A3'}" stroke-width="1.5" opacity=".92"/>`;
  // hand, back view, fingers to the right
  const H = (dx, dy) => [x + dx, y + dy];
  const [hx, hy] = H(0, 4);
  s += `<g transform="translate(${hx} ${hy})" stroke="${ske}" stroke-width="1.2" fill="${sk}">
    <path d="M0 13C0 11 2 10 4 10H30V40H4C2 40 0 39 0 37Z"/>
    <path d="M28 9C34 6 46 6 54 8C58 9 60 12 60 16V34C60 38 57 41 53 41H34C30 41 28 39 28 36Z"/>
    <path d="M38 10C40 4 44 0 50 -2C54 -3 56 0 54 3C51 7 47 9 46 12Z"/>
    <rect x="56" y="10" width="26" height="7" rx="3.5"/><rect x="57" y="18" width="29" height="7" rx="3.5"/><rect x="57" y="26" width="27" height="7" rx="3.5"/><rect x="55" y="34" width="21" height="6.5" rx="3.2"/>
    <path d="M60 13.5H63M61 21.5H64M61 29.5H64M59 37H62" stroke="${ske}" fill="none" stroke-width=".8"/></g>`;
  let stud;
  if (on) {
    s += `<rect x="${hx + 18}" y="${hy + 8}" width="11" height="34" rx="3" fill="${bandC}" stroke="#0E2A45"/><path d="M${hx + 20} ${hy + 11}V${hy + 39}M${hx + 23.5} ${hy + 11}V${hy + 39}M${hx + 27} ${hy + 11}V${hy + 39}" stroke="#5BA3E0" stroke-width=".8"/>`;
    stud = [hx + 23.5, hy + 25];
  } else {
    // strap lying open beside the hand
    s += `<path d="M${hx + 96} ${hy + 30}C${hx + 100} ${hy + 18} ${hx + 120} ${hy + 18} ${hx + 124} ${hy + 30}" fill="none" stroke="${bandC}" stroke-width="7" stroke-linecap="round"/>`;
    stud = [hx + 110, hy + 22];
  }
  s += `<circle cx="${stud[0]}" cy="${stud[1]}" r="3.6" fill="#C5CCD3" stroke="#5B636B"/>`;
  // coiled cord: a curve from the stud to the clip with a sine wiggle
  const end = on ? [tx, ty] : [hx + 150, hy + 38], c1 = on ? [stud[0] + 10, stud[1] + 60] : [stud[0] + 20, stud[1] + 30];
  const pts = [];
  for (let k = 0; k <= 60; k++) {
    const u = k / 60, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
    const px = a * stud[0] + b * c1[0] + c * end[0], py = a * stud[1] + b * c1[1] + c * end[1];
    const dx = 2 * (1 - u) * (c1[0] - stud[0]) + 2 * u * (end[0] - c1[0]), dy = 2 * (1 - u) * (c1[1] - stud[1]) + 2 * u * (end[1] - c1[1]), L = Math.hypot(dx, dy) || 1;
    const w = u > 0.12 && u < 0.88 ? 3.2 * Math.sin(k * 1.6) : 0;
    pts.push(`${(px - dy / L * w).toFixed(1)},${(py + dx / L * w).toFixed(1)}`);
  }
  s += `<polyline points="${pts.join(' ')}" fill="none" stroke="#2A2F35" stroke-width="2"/>`;
  // crocodile clip at the cord end
  const ang = on ? Math.atan2(end[1] - c1[1], end[0] - c1[0]) * 180 / Math.PI : 0;
  s += `<g transform="translate(${end[0]} ${end[1]}) rotate(${ang.toFixed(1)})"><path d="M-14 -4H-2L4 -2.5L-2 -1H-14Z" fill="#B8C0C7" stroke="#4A5259" stroke-width=".8"/><path d="M-14 4H-2L4 2.5L-2 1H-14Z" fill="#B8C0C7" stroke="#4A5259" stroke-width=".8"/><rect x="-18" y="-4.5" width="6" height="9" rx="2" fill="#C0392B"/></g>`;
  if (on) s += `<circle cx="${end[0]}" cy="${end[1]}" r="9" fill="none" stroke="#45D07F" stroke-width="2"/>`;
  s += `<text x="${x + (on ? 104 : 168)}" y="${y + 22}" class="st">ESD wrist strap</text><text x="${x + (on ? 104 : 168)}" y="${y + 40}" class="ss" style="fill:${on ? '#45D07F' : '#FFB52E'}">${on ? 'On the wrist, clipped to the chassis' : 'Not on. Click to wear it'}</text>`;
  return s + '</g>';
}
Sim.registerView({
  id: 'bench', title: 'Chassis and cover',
  keep: [
    ["Power off before you open it", "Shut the server down to standby and pull both power cords before you take the top cover off. The one exception is a hot-swap fan module, which you can change with the server running."],
    ["Antistatic protection", "Wear a grounded antistatic wrist strap and lay parts on an antistatic mat. Hold boards, cards and DIMMs by their edges."],
    ["Unlock before you lift", "If the latch is locked, turn the lock a quarter turn anticlockwise first. Lift the latch by its green finger grip; prying at the cover edges bends it."],
    ["Air baffle back in", "Refit the air baffle over the CPUs and memory before the cover goes back on. Without it, the air bypasses the heatsinks and the CPUs overheat."],
    ["Cover on to run", "The top cover is part of the airflow path. Do not run the server with it off for longer than a fan swap takes."],
    ["Pin in the small hole", "When you refit the cover, slide it until the pin on the fan-tray bracket comes up through the small hole at the rear end of the latch. Then pressing the latch down pulls the cover forward and closes the last half inch. If the cover rests on the pin, it will not slide home."],
    ["Rack or bench", "To open a racked server, slide it out on its rails, with the cable management arm keeping the cables connected, or take it out of the rack and work on a bench."],
    ["Training deck", "Slide 3: the components of this Cisco UCS server. Slide 4: chassis types and form factors."]],
  render(t) {
    const where = { bench: 'on the bench', in: 'in the rack', service: 'slid out of the rack' }[t.rack.pos];
    let g;
    if (t.cover !== 'open') {
      g = coverSchematic(t) + latchPanel(t) + `<text x="24" y="128" class="ss">Server is ${where}.</text>`;
    } else {
      const m = memSummary(t);
      g = `<image href="${t.baffle ? IMG.chassisIn : IMG.chassisOut}" x="0" y="${PY0}" width="900" height="531"/>`;
      if (riserOut(t)) g += mask(RISER2);
      g += zone('go', 'storage', '1. Drive bays: open the front drive bays', FRONT);
      t.fans.forEach((f, i) => {
        if (f === 'out' || f === 'set') g += mask(FANBOX[i]) + chip(mid(FANBOX[i])[0], mid(FANBOX[i])[1], t.fanClock > 0 ? `FAN 0${i + 1} out ${t.fanClock}s` : `FAN 0${i + 1} out`);
        if (f === 'fault') g += `<rect ${HR(...FANBOX[i])} rx="4" fill="none" stroke="#F0A93B" stroke-width="4" class="blink"/>`;
        g += zone('go', 'fans', `2. Fan module FAN 0${i + 1}: ${f === 'fault' ? 'amber fault LED' : f === 'ok' ? 'running' : 'removed'}. Open the fan modules`, FANBOX[i]);
      });
      const cpuSt = c => ({ dust: 'dust cover on', empty: 'socket empty', seated: 'not finished', torqued: 'installed' }[t.cpu[c].st]);
      if (t.baffle) {
        g += zone('baffle', '', 'Air baffle: lift it out to reach the CPUs and memory', BAFFLE);
      } else {
        g += dimmStrips(t);
        [0, 1].forEach(c => {
          if (t.cpu[c].st === 'dust' || t.cpu[c].st === 'empty') g += mask(CPUBOX[c]);
          g += zone('go', 'cpu', `4. CPU ${c + 1}: ${cpuSt(c)}`, CPUBOX[c]);
          DIMMBOX[c].forEach(b => { g += zone('go', 'mem', `3. Memory for CPU ${c + 1}: ${m.per[c].length} DIMMs`, b); });
        });
      }
      g += zone('go', 'riser', '10. PCIe riser 2: open the riser', RISER2) + partMarks(t);
    }
    g += t.cover === 'open' ? esdFig(t, 30, 572, HX(18), HY(1150)) : esdFig(t, 30, 526, SX(30), SY(1150));
    if (t.cover === 'open') g += `<text x="876" y="589" text-anchor="end" class="ss">Front at left. Server is ${where}.</text>`;
    return frame('Chassis, top view', g, 646);
  },
  actions(t) {
    const a = [];
    if (!t.esd) a.push(button('Put on ESD wrist strap', 'esd', '', true));
    if (t.cover === 'closed') {
      if (t.coverLock) a.push(button('Unlock: quarter turn anticlockwise', 'coverDial', '', true));
      else { a.push(button('Lift the latch by the green grip', 'coverLift', '', true)); a.push(button('Lock: quarter turn clockwise (optional)', 'coverDial')); }
    }
    if (t.cover === 'lifted') { a.push(button('Lift the cover straight up', 'coverOff', '', true)); a.push(button('Press the latch back down', 'coverPress')); }
    if (t.cover === 'open') { a.push(button(t.baffle ? 'Lift out air baffle' : 'Refit air baffle', 'baffle')); a.push(button('Place the top cover on the server', 'coverPlace')); }
    if (t.cover === 'placed') { a.push(button('Press the latch down', 'coverPress', '', fitOk(t))); a.push(button('Lift the cover off again', 'coverOff')); }
    return a;
  },
  tray(t) {
    const cov = `<h3>Top cover (Cisco procedure)</h3><ol class="rules">
      <li><b>Remove:</b> if the latch is locked, turn the lock 90 degrees anticlockwise with a screwdriver.</li>
      <li>Lift the end of the latch that has the <b>green finger grip</b>. The cover is pushed back as the latch rises.</li>
      <li>Lift the cover straight up and set it aside.</li>
      <li><b>Refit:</b> with the latch fully open, place the cover about 1/2 inch (1.27 cm) behind the lip of the front panel.</li>
      <li>The <b>small hole at the rear end of the latch</b> must sit over the <b>pin on the fan-tray bracket</b>. Centre the pin in the hole, then press the latch down: it pulls the cover forward and closes the remaining gap. If the cover rests on the pin, it will not slide home.</li>
      <li>Press the latch down: the cover is pulled forward and closes. Optionally lock it with a quarter turn clockwise.</li></ol>`;
    if (t.cover !== 'open') return `<div class="just">` + cov + `<ul class="rules"><li>Power LED: <b>${{ green: 'green, main power', amber: 'amber, standby power', off: 'off, no AC power' }[powerLed(t)]}</b></li></ul></div>` + partsLegend(t);
    return `<div class="just"><h2>What you are looking at</h2><p class="cap" style="font-size:13px">Your server, photographed from above with the top cover off. Front at left, rear (risers) at right. With the air baffle in, the baffle hides the CPUs and memory; lift it out to reach them. The slots in the photo are empty: DIMMs you install are drawn onto them. Fans are numbered as printed on the chassis, 1 at the bottom to 6 at the top. The numbers on the photo follow the diagram on the server's top cover; the list below explains each one.</p>
      <ul class="rules"><li>Power LED: <b>${{ green: 'green, main power', amber: 'amber, standby power', off: 'off, no AC power' }[powerLed(t)]}</b></li><li>Fans are hot-swappable, but do not run for more than one minute with a fan module removed</li><li>The air baffle must be in place before the cover goes back on</li></ul>` + cov + `</div>` + partsLegend(t);
  }
});
Sim.on('esd', () => { T.esd = !T.esd; say(T.esd ? 'ok' : 'warn', T.esd ? 'Wrist strap on and clipped to bare chassis metal.' : 'Wrist strap removed.'); });
const inRack = () => T.rack.pos === 'in' && (bad('The server is pushed into the rack. Slide it out far enough to remove the top cover (Rack view).'), true);
Sim.on('coverDial', () => {
  if (T.cover !== 'closed') return bad('The lock turns only with the latch pressed down flat.');
  if (T.coverLock) { if (inRack()) return; T.coverLock = false; fx('unlock'); say('ok', 'Lock turned 90 degrees anticlockwise with a screwdriver: unlocked. The slot now points to the open padlock. Next, lift the latch by its green finger grip.'); }
  else { T.coverLock = true; fx('lock'); say('ok', 'Lock turned 90 degrees clockwise: the latch is locked.'); }
});
Sim.on('coverLift', () => {
  if (T.cover !== 'closed') return bad('The latch is already open.');
  if (inRack()) return;
  if (T.coverLock) return bad('The latch is locked and will not lift. Turn the lock a quarter turn anticlockwise with a screwdriver first.');
  T.cover = 'lifted'; fx('lift'); say('ok', 'Latch lifted by its green finger grip. As it rose, the cover was pushed back about half an inch. Now lift the cover straight up.');
});
Sim.on('coverOff', () => {
  if (T.cover === 'closed') return bad(T.coverLock ? 'Unlock the latch, then lift it by the green finger grip. The cover comes off only with the latch fully open.' : 'Lift the latch by its green finger grip first. The cover comes off only with the latch fully open.');
  if (T.cover === 'open') return;
  T.cover = 'open'; say('ok', 'Cover lifted straight up and set aside.');
});
Sim.on('baffle', () => {
  if (T.cover !== 'open') return bad('Remove the top cover first.');
  // refitting it ends the memory work: the layout must be one Cisco supports
  if (!T.baffle) { const m = memCheck(T); if (!m.ok) return bad(`Not yet: Cisco does not support this memory layout. ${m.err} On a real server a layout like this can stop the power-on self-test with a memory configuration error, or leave DIMMs unused. Fix the memory first (Memory view).`); if (T.sel.dimm) return bad('Put the DIMM in your hand back in the tray first (Memory view).'); }
  T.baffle = !T.baffle; say('ok', T.baffle ? 'Air baffle back in place over the CPUs and DIMMs.' : 'Air baffle lifted out. The CPUs and the DIMM slots are now reachable.');
});
const FITS = [[2, 1], [-1, 2], [1, -2]];
Sim.on('coverPlace', () => {
  if (T.cover !== 'open') return;
  if (riserOut(T)) return bad('PCIe riser 2 is still out. Refit it before closing the cover.');
  if (!riserSeated(T)) return bad('PCIe riser 2 is not fully engaged. Push down on both ends before closing the cover.');
  if (!T.baffle) return bad('Refit the air baffle first. Without it, air bypasses the heatsinks.');
  if (T.fans.some(f => f === 'out' || f === 'set')) return bad('A fan bay has no latched module. Fit and latch it first (Fan modules).');
  if (T.fanHand) return bad('You are still holding a fan module. Fit it, or set it aside, first.');
  const [dx, dy] = FITS[T.coverFit.n % FITS.length];
  T.cover = 'placed'; T.coverFit.dx = dx; T.coverFit.dy = dy;
  say('ok', 'Cover set on the server with the latch fully open, about half an inch behind the front lip. Now slide it until the pin on the fan-tray bracket shows in the small hole at the rear end of the latch.');
});
const fitMsg = () => { Sim.coach = fitOk(T) ? { kind: 'ok', msg: 'The pin is centred in the small hole at the rear end of the latch, and the cover sits flat. Press the latch down: it pulls the cover forward and closes the gap.' } : { kind: 'info', msg: 'The pin (dashed circle) is still under the cover. Keep sliding the cover until the pin shows in the middle of the small hole.' }; };
Sim.on('coverNudge', d => {
  if (T.cover !== 'placed') return;
  const f = T.coverFit, M = LATCH.MAX, c = v => Math.max(-M, Math.min(M, v));
  if (d === 'left') f.dx = c(f.dx - 1); if (d === 'right') f.dx = c(f.dx + 1); if (d === 'up') f.dy = c(f.dy - 1); if (d === 'down') f.dy = c(f.dy + 1);
  fitMsg();
});
Sim.on('coverMove', v => {
  if (T.cover !== 'placed') return;
  const M = LATCH.MAX, [dx, dy] = String(v).split(',').map(n => Math.max(-M, Math.min(M, Math.round(+n) || 0)));
  T.coverFit.dx = dx; T.coverFit.dy = dy; fitMsg();
});
Sim.on('coverPress', () => {
  if (T.cover === 'lifted') { T.cover = 'closed'; fx('press'); Sim.sound('cover'); return say('ok', 'Latch pressed back down: the cover slid forward and closed again.'); }
  if (T.cover !== 'placed') return;
  if (!fitOk(T)) return bad('The pin is not in the small hole at the rear end of the latch. The cover is resting on the pin, so the latch cannot pull it forward. Slide the cover until the pin is centred in the small hole.');
  T.cover = 'closed'; T.coverLock = false; T.coverFit.n++; fx('press'); Sim.sound('cover');
  say('ok', 'Latch pressed down: it hooked the pin and pulled the cover forward, closing the last half inch. You may lock it with a quarter turn clockwise.');
});
// drag the cover in the close-up; it snaps to the nearest step on release
let coverDrag = null;
Sim.listen('pointerdown', e => {
  const g = e.target.closest && e.target.closest('.dragcover'); if (!g || T.cover !== 'placed' || e.target.closest('[data-act]')) return;
  const m = g.parentNode.getScreenCTM(); if (!m) return;
  coverDrag = { g, clip: document.getElementById('holeclipR'), inv: m.inverse(), x0: e.clientX, y0: e.clientY, dx: T.coverFit.dx, dy: T.coverFit.dy, ox: 0, oy: 0, moved: false };
  g.style.cursor = 'grabbing'; e.preventDefault();
});
Sim.listen('pointermove', e => {
  const d = coverDrag; if (!d) return;
  if (!d.g.isConnected) { coverDrag = null; return; }
  const a = new DOMPoint(d.x0, d.y0).matrixTransform(d.inv), b = new DOMPoint(e.clientX, e.clientY).matrixTransform(d.inv);
  d.ox = b.x - a.x; d.oy = b.y - a.y; d.moved = d.moved || Math.hypot(d.ox, d.oy) > 3;
  const S = LATCH.STEP, L = LATCH.MAX * S, c = v => Math.max(-L, Math.min(L, v)), tr = `translate(${c(d.dx * S + d.ox)} ${c(d.dy * S + d.oy)})`;
  d.g.setAttribute('transform', tr); if (d.clip) d.clip.setAttribute('transform', tr);
});
Sim.listen('pointerup', () => {
  const d = coverDrag; coverDrag = null; if (!d || !d.moved || !d.g.isConnected) return;
  const S = LATCH.STEP; Sim.do('coverMove', `${Math.round(d.dx + d.ox / S)},${Math.round(d.dy + d.oy / S)}`);
});
/* ---- CPUs and heatsinks: Cisco UCS C240 M4, LGA2011-3 ILM socket with hinged cover plate and hinged CPU seat.
   Photos: the trainer's socket photos, aligned to one frame (1260 x 1370 crop of a 1320 x 1820 frame, y from 330).
   Levers: 'u' has the unlock icon (released first, clipped last), 'l' has the lock icon (clipped first). ---- */
const CP = { x: 12, y: 46, s: 0.4 };                                   // photo panel placement
const cX = x => CP.x + x * CP.s, cY = y => CP.y + (y - 330) * CP.s;
const CBOX = { win: [300, 690, 925, 1186], ihs: [370, 664, 856, 1194], plateTop: [250, 470, 965, 690], plateBot: [250, 1186, 965, 1335], plateUp: [240, 360, 985, 600], seatUp: [290, 1440, 960, 1700], seatDown: [340, 640, 890, 1222] };
const SCREW = [[348, 425], [865, 425], [348, 1452], [865, 1452]];   // captive screws of the drawn heatsink, over the standoffs
const HSK = { scr: SCREW };
const BEADS = [[613, 929], [490, 800], [736, 800], [490, 1058], [736, 1058]];   // 5 x 0.4 cc = 2 cc
const SOAK_MS = 3750;                                                  // 15 s of soaking, shown 4x faster
// lever rods: same point count closed and released so the change can be animated
const LEV = {
  l: { piv: [226, 1392], clip: [[226, 1392], [212, 1360], [206, 1300], [203, 1000], [204, 700], [208, 600], [214, 552], [232, 520], [268, 499], [323, 489]] },
  u: { piv: [953, 550], clip: [[953, 550], [975, 680], [990, 850], [998, 1000], [1003, 1200], [1006, 1300], [1008, 1400], [1012, 1548]] } };
(() => {   // released positions follow the trainer's open-socket photos
  const along = pts => { let d = 0; return pts.map((p, k) => (k ? (d += Math.hypot(p[0] - pts[k - 1][0], p[1] - pts[k - 1][1])) : 0)); };
  const L = LEV.l, dl = along(L.clip), ul = [-202 / 514, 474 / 514];
  L.rel = L.clip.map((p, k) => k < 7 ? [L.piv[0] + ul[0] * dl[k] * 0.62, L.piv[1] + ul[1] * dl[k] * 0.62] : [L.piv[0] + ul[0] * dl[6] * 0.62 + (k - 6) * 18, L.piv[1] + ul[1] * dl[6] * 0.62 + (k - 6) * 9]);
  const U = LEV.u, du = along(U.clip), ud = [235 / 1022, 995 / 1022];
  U.rel = U.clip.map((p, k) => [U.piv[0] + ud[0] * du[k] * 1.04, U.piv[1] + ud[1] * du[k] * 1.04]);
})();
const ptsStr = pts => pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
let cpuFx = {};                                                        // recent changes, for animations: key -> {at, from}
const fxMark = (k, from) => { cpuFx[k] = { at: Date.now(), from }; };
const fxAge = k => cpuFx[k] ? (Date.now() - cpuFx[k].at) / 1000 : 99;
function rodSvg(side, state, i) {
  const L = LEV[side], to = state === 'clip' ? L.clip : L.rel, f = cpuFx['lev' + i + side], age = fxAge('lev' + i + side);
  const anim = (pFrom) => f && age < 0.7 ? `<animate attributeName="points" from="${ptsStr(pFrom)}" to="${ptsStr(to)}" dur="0.6s" begin="-${age.toFixed(2)}s" fill="freeze"/>` : '';
  const from = f ? (f.from === 'clip' ? L.clip : L.rel) : to, raised = state === 'rel';
  const sh = raised ? [12, 14] : [3, 4], shPts = to.map(p => [p[0] + sh[0], p[1] + sh[1]]), shFrom = from.map(p => [p[0] + (f && f.from === 'rel' ? 12 : 3), p[1] + (f && f.from === 'rel' ? 14 : 4)]);
  const line = (pts, pf, stroke, w, extra = '') => `<polyline points="${ptsStr(pts)}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}>${anim(pf)}</polyline>`;
  let s = `<polyline points="${ptsStr(shPts)}" fill="none" stroke="#000" stroke-opacity="${raised ? 0.32 : 0.25}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round">${f && age < 0.7 ? `<animate attributeName="points" from="${ptsStr(shFrom)}" to="${ptsStr(shPts)}" dur="0.6s" begin="-${age.toFixed(2)}s" fill="freeze"/>` : ''}</polyline>`;
  s += line(to, from, '#4B5259', 24) + line(to, from, '#B4BCC4', 17) + `<g transform="translate(-4 -3)">${line(to, from, '#F4F7F9', 5)}</g>`;
  if (side === 'u') { const tt = to.slice(5), tf = from.slice(5); s += line(tt, tf, '#4B5259', 38) + line(tt, tf, '#C9D0D6', 31) + `<g transform="translate(-6 -4)">${line(tt, tf, '#F4F7F9', 7)}</g>`; }
  return s;
}
const cpuKey = c => c.plate === 'closed' ? (c.model ? 'cpuClosedCpu' : 'cpuClosedEmpty') : c.seat === 'up' ? (c.model ? 'cpuSeatCpu' : 'cpuOpenUp') : (c.model ? 'cpuOpenCpu' : 'cpuOpenDown');
const cpuLast = {};
// 2D top view of the C240 M4 CPU heatsink (redrawn so it sits square and all four screws show)
function hsTopSvg(id, c, i) {
  const P = id || 'hs';
  const finArea = 'M150 560H1110V1500H928V1372H800V1500H412V1372H285V1500H150Z';
  const topBand = 'M420 384H797V560H420Z';
  let s = `<defs>
    <linearGradient id="${P}cu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C9845A"/><stop offset=".45" stop-color="#E3A276"/><stop offset="1" stop-color="#A8613A"/></linearGradient>
    <linearGradient id="${P}fin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F1F3F5"/><stop offset=".55" stop-color="#C9CED3"/><stop offset="1" stop-color="#9AA1A8"/></linearGradient>
    <pattern id="${P}fins" width="15" height="40" patternUnits="userSpaceOnUse"><rect width="15" height="40" fill="#4F575E"/><rect x="1" width="9" height="40" fill="url(#${P}fin)"/></pattern>
    <pattern id="${P}finsLow" width="15" height="40" patternUnits="userSpaceOnUse"><rect width="15" height="40" fill="#3E454B"/><rect x="1" width="9" height="40" fill="#A9B0B6"/></pattern>
    <linearGradient id="${P}shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".18"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity=".22"/></linearGradient>
    <radialGradient id="${P}scr" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#FAFBFC"/><stop offset=".6" stop-color="#B9C0C6"/><stop offset="1" stop-color="#7E868D"/></radialGradient>
    <filter id="${P}blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>`;
  // drop shadow
  s += `<g transform="translate(18 22)" filter="url(#${P}blur)" opacity=".55"><path d="${finArea}" fill="#000"/><rect x="292" y="372" width="629" height="1135" rx="14" fill="#000"/></g>`;
  // copper base plate
  s += `<rect x="292" y="372" width="629" height="1135" rx="14" fill="url(#${P}cu)" stroke="#7A4526" stroke-width="4"/>`;
  for (let y = 384; y < 1500; y += 9) s += `<path d="M300 ${y}H913" stroke="#FFFFFF" stroke-opacity="${(y * 7) % 5 === 0 ? 0.10 : 0.04}" stroke-width="2"/>`;
  // lower fins between the top screws, then the main fin stack
  s += `<path d="${topBand}" fill="url(#${P}finsLow)" stroke="#5B636A" stroke-width="3"/><path d="${topBand}" fill="url(#${P}shade)"/>`;
  s += `<path d="${finArea}" fill="url(#${P}fins)" stroke="#5B636A" stroke-width="4" stroke-linejoin="round"/><path d="${finArea}" fill="url(#${P}shade)"/>`;
  // fin locking crimps (the two zip lines across the stack)
  [580, 1345].forEach(y => { s += `<path d="M152 ${y}H1108" stroke="#5B636A" stroke-width="6"/><path d="M152 ${y - 5}H1108" stroke="#F4F6F8" stroke-width="3" stroke-dasharray="9 6"/>`; });
  // notches: the base shows through around the lower screws
  [[285, 412], [800, 928]].forEach(([a, b]) => { s += `<path d="M${a} 1372H${b}V1505H${a}Z" fill="url(#${P}cu)" stroke="#7A4526" stroke-width="3"/><path d="M${a} 1372H${b}" stroke="#3E454B" stroke-width="8" stroke-opacity=".55"/>`; });
  // airflow label: arrow points to the rear of the server
  s += `<g transform="translate(613 958)"><rect x="-100" y="-132" width="200" height="264" rx="14" fill="#1D2A36" stroke="#C9D0D6" stroke-width="6"/>
    <path d="M0 -104L-40 -52H-15V0H15V-52H40Z" fill="#F4F6F8"/>
    <path d="M-38 112C-38 70 -14 60 -14 26C-14 6 -24 -4 -24 -24M0 112C0 70 24 60 24 26C24 6 14 -4 14 -24M38 112C38 70 62 60 62 26C62 6 52 -4 52 -24" fill="none" stroke="#F4F6F8" stroke-width="10" stroke-linecap="round" transform="translate(-12 0)"/></g>`;
  // four captive screws, all visible from above
  HSK.scr.forEach(([x, y], k) => {
    const v = c ? c.screws[k] : 2, ang = 18 + v * 135, age = c ? fxAge('scr' + i + k) : 99, f = c && cpuFx['scr' + i + k];
    const spin = age < 1 ? `<animateTransform attributeName="transform" type="rotate" from="${ang - (f && f.from === 'loose' ? -855 : 855)} ${x} ${y}" to="${ang} ${x} ${y}" dur="0.9s" begin="-${age.toFixed(2)}s" fill="freeze"/>` : '';
    // a captive screw sits higher while loose: bigger, lighter head; it seats as it is tightened
    const r = 31 + (2 - v) * 2.5;
    s += `<circle cx="${x + 4}" cy="${y + 6}" r="40" fill="#000" opacity=".28"/><circle cx="${x}" cy="${y}" r="40" fill="#8A9299" stroke="#4B5259" stroke-width="4"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#${P}scr)" stroke="#5B636A" stroke-width="3"/>
      <g transform="rotate(${ang} ${x} ${y})">${spin}<rect x="${x - 17}" y="${y - 4}" width="34" height="8" rx="2" fill="#3A4046"/><rect x="${x - 4}" y="${y - 17}" width="8" height="34" rx="2" fill="#3A4046"/><circle cx="${x + 24}" cy="${y}" r="3" fill="#5B636A"/></g>`;
  });
  return s;
}
// clockwise arrow around a screw: right-hand rule, tighten clockwise
const cwArrow = (x, y, r, col) => {
  const rad = d => d * Math.PI / 180, a0 = -165, a1 = 65, P = d => [x + r * Math.cos(rad(d)), y + r * Math.sin(rad(d))];
  const [x0, y0] = P(a0), [x1, y1] = P(a1), tx = -Math.sin(rad(a1)), ty = Math.cos(rad(a1)), nx = Math.cos(rad(a1)), ny = Math.sin(rad(a1));
  const tip = [x1 + tx * 26, y1 + ty * 26], b1 = [x1 + nx * 15, y1 + ny * 15], b2 = [x1 - nx * 15, y1 - ny * 15], f = v => v.toFixed(1);
  const arc = `M${f(x0)} ${f(y0)}A${r} ${r} 0 1 1 ${f(x1)} ${f(y1)}`, head = `M${f(tip[0])} ${f(tip[1])}L${f(b1[0])} ${f(b1[1])}L${f(b2[0])} ${f(b2[1])}Z`;
  return `<g pointer-events="none"><path d="${arc}" fill="none" stroke="#0E1A22" stroke-opacity=".7" stroke-width="14" stroke-linecap="round"/><path d="${head}" fill="#0E1A22" fill-opacity=".7" stroke="#0E1A22" stroke-opacity=".7" stroke-width="6" stroke-linejoin="round"/><path d="${arc}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round"/><path d="${head}" fill="${col}"/></g>`; };
// screwdriver seen from above while it turns a screw: the round handle end, spinning clockwise
function driverTop(x, y, ang, age) {
  const spin = `<animateTransform attributeName="transform" type="rotate" from="${ang - 855} ${x} ${y}" to="${ang} ${x} ${y}" dur="0.9s" begin="-${age.toFixed(2)}s" fill="freeze"/>`;
  const fade = `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" dur="1.05s" begin="-${age.toFixed(2)}s" fill="freeze"/>`;
  let ribs = ''; for (let k = 0; k < 8; k++) { const a = k * 45 * Math.PI / 180; ribs += `<path d="M${(x + 34 * Math.cos(a)).toFixed(1)} ${(y + 34 * Math.sin(a)).toFixed(1)}L${(x + 66 * Math.cos(a)).toFixed(1)} ${(y + 66 * Math.sin(a)).toFixed(1)}" stroke="#7A1E18" stroke-width="9" stroke-linecap="round"/>`; }
  return `<g pointer-events="none">${fade}<circle cx="${x + 10}" cy="${y + 14}" r="74" fill="#000" opacity=".3"/><g>${spin}<circle cx="${x}" cy="${y}" r="74" fill="#C0392B" stroke="#5E1610" stroke-width="5"/>${ribs}<circle cx="${x}" cy="${y}" r="30" fill="#1B1F24"/><path d="M${x - 14} ${y}H${x + 14}" stroke="#C0392B" stroke-width="6"/></g></g>`;
}
function sockSvg(t, i) {
  const c = t.cpu[i], b = t.bench, key = cpuKey(c), now = Date.now();
  if (cpuLast[i] !== key) { if (cpuLast[i]) fxMark('ph' + i, cpuLast[i]); cpuLast[i] = key; }
  let s = `<image href="${IMG[key]}" x="0" y="330" width="1260" height="1370"/>`;
  const pf = cpuFx['ph' + i], pa = fxAge('ph' + i);
  if (pf && pa < 0.7 && pf.from !== key) s += `<image href="${IMG[pf.from]}" x="0" y="330" width="1260" height="1370"><animate attributeName="opacity" from="1" to="0" dur="0.6s" begin="-${pa.toFixed(2)}s" fill="freeze"/></image>`;
  const R = (box, act, arg, label, rx = 16) => `<g${hot(act, arg, label)}><rect x="${box[0]}" y="${box[1]}" width="${box[2] - box[0]}" height="${box[3] - box[1]}" rx="${rx}" class="zone" style="stroke-width:6"/></g>`;
  if (c.plate === 'closed') {
    if (c.cap) {   // factory dust cover over the cover plate window
      const [x0, y0, x1, y1] = CBOX.win;
      s += `<rect x="${x0 - 6}" y="${y0 - 6}" width="${x1 - x0 + 12}" height="${y1 - y0 + 12}" rx="22" fill="#000" opacity=".35"/><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="18" fill="#17191C" stroke="#3A3F45" stroke-width="6"/><rect x="${x0 + 40}" y="${y0 + 40}" width="${x1 - x0 - 80}" height="${y1 - y0 - 80}" rx="10" fill="#202327"/>`;
      s += `<rect x="${x0 - 22}" y="${(y0 + y1) / 2 - 60}" width="30" height="120" rx="8" fill="#17191C" stroke="#3A3F45" stroke-width="5"/><rect x="${x1 - 8}" y="${(y0 + y1) / 2 - 60}" width="30" height="120" rx="8" fill="#17191C" stroke="#3A3F45" stroke-width="5"/>`;
      s += `<text x="${(x0 + x1) / 2}" y="${(y0 + y1) / 2 - 10}" text-anchor="middle" style="font:700 40px var(--font);fill:#C9D0D6">PROTECTIVE COVER</text><text x="${(x0 + x1) / 2}" y="${(y0 + y1) / 2 + 42}" text-anchor="middle" style="font:500 30px var(--font);fill:#8E99A3">Keep on an unused socket</text>`;
    }
    if (c.model && !c.hs) {
      if (c.oldGrease) s += `<rect x="${CBOX.ihs[0] + 20}" y="${CBOX.ihs[1] + 20}" width="${CBOX.ihs[2] - CBOX.ihs[0] - 40}" height="${CBOX.ihs[3] - CBOX.ihs[1] - 40}" rx="30" fill="#8C949B" opacity=".75"/><text x="613" y="940" text-anchor="middle" style="font:600 34px var(--font);fill:#2A2F35">old grease</text>`;
      BEADS.slice(0, c.grease).forEach(([x, y], k) => { s += `<ellipse cx="${x + 5}" cy="${y + 6}" rx="44" ry="38" fill="#000" opacity=".18"/><ellipse cx="${x}" cy="${y}" rx="44" ry="38" fill="#9EA6AD" stroke="#6E767D" stroke-width="3"${k === c.grease - 1 && fxAge('gr' + i) < 0.6 ? ' class="drop"' : ''}/><ellipse cx="${x - 12}" cy="${y - 12}" rx="14" ry="10" fill="#E4E8EB" opacity=".8"/>`; });
      if (c.soak) s += `<rect x="${CBOX.ihs[0] + 10}" y="${CBOX.ihs[1] + 10}" width="${CBOX.ihs[2] - CBOX.ihs[0] - 20}" height="${CBOX.ihs[3] - CBOX.ihs[1] - 20}" rx="30" fill="#4AA8FF" opacity=".25"/>`;
    }
    s += rodSvg('l', c.lev.l, i) + rodSvg('u', c.lev.u, i);
  }
  if (c.hs) {
    const a = fxAge('hs' + i);
    s += `<g>${a < 0.6 ? `<animateTransform attributeName="transform" type="translate" from="-30 -60" to="0 0" dur="0.5s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : ''}${hsTopSvg('hs' + i, c, i)}</g>`;
    SCREW.forEach(([x, y], k) => {
      const v = c.screws[k], col = ['#F0A93B', '#FFD54A', '#45D07F'][v];
      const age = fxAge('scr' + i + k), drv = b.tool === 'driver';
      if (drv && v < 2) s += cwArrow(x, y, 84, col);
      if (age < 1.05) s += driverTop(x, y, 18 + v * 135, age);
      s += `<g${hot('hsScrew', `${i}:${k}`, `Heatsink captive screw ${k + 1}: ${['loose', 'snug', 'tight'][v]}. Turn it clockwise to tighten`)}><circle cx="${x}" cy="${y}" r="52" fill="${col}" fill-opacity=".14" stroke="${col}" stroke-width="9"${v ? '' : ' stroke-dasharray="20 12"'}/></g>`;
    });
  }
  // click zones
  if (!c.hs) {
    if (c.plate === 'closed') {
      if (c.cap) s += R(CBOX.win, 'cpuCap', i, 'Protective dust cover: lift it off');
      else if (c.model) s += R(CBOX.ihs, b.hs && b.tool !== 'grease' && b.tool !== 'clean' && c.lev.u === 'clip' && c.lev.l === 'clip' ? 'hsPlace' : 'cpuTop', i, 'Top of the CPU (heat spreader)');
      s += R(CBOX.plateTop, 'cpuPlate', i, 'Hinged CPU cover plate') + R(CBOX.plateBot, 'cpuPlate', i, 'Hinged CPU cover plate');
      const bl = (pts, pad) => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) + pad, Math.max(...ys) + pad]; };
      s += R(bl(c.lev.l === 'clip' ? LEV.l.clip.slice(0, 7) : LEV.l.rel, 26), 'cpuLever', `${i}:l`, `Lever with the lock icon: ${c.lev.l === 'clip' ? 'clipped down' : 'released'}`);
      s += R(c.lev.u === 'clip' ? [978, 1270, 1046, 1560] : bl(LEV.u.rel.slice(4), 30), 'cpuLever', `${i}:u`, `Lever with the unlock icon: ${c.lev.u === 'clip' ? 'clipped down' : 'released'}`);
    } else {
      s += R(CBOX.plateUp, 'cpuPlate', i, 'Hinged CPU cover plate (open): close it');
      s += c.seat === 'up' ? R(CBOX.seatUp, !c.model && b.cpu ? 'cpuInsert' : 'cpuSeat', i, c.model ? 'Hinged seat with the CPU: swing it down' : b.cpu ? 'Hinged seat: insert the CPU by its ALIGN tab' : 'Hinged CPU seat (up)')
        : R(CBOX.seatDown, 'cpuSeat', i, 'Hinged CPU seat: swing it up');
    }
  }
  return s;
}
function cpuMech(t, i, x, y) {
  const c = t.cpu[i], m = c.model && byId('cpus', c.model), b = t.bench;
  const tim = c.hs ? (c.tim === 'pad' ? 'pre-applied pad of the new heatsink' : '2 cc of grease') : c.oldGrease ? 'old grease: clean it off' : c.grease ? `${(c.grease * 0.4).toFixed(1)} of 2.0 cc grease` : 'none yet';
  const rows = [
    ['Protective dust cover', c.cap ? 'on the socket' : 'removed', c.cap ? 0 : 2],
    ['Lever with unlock icon', c.lev.u === 'clip' ? 'clipped down' : 'released', c.lev.u === 'clip' ? (c.model ? 2 : 1) : (c.model ? 1 : 2)],
    ['Lever with lock icon', c.lev.l === 'clip' ? 'clipped down' : 'released', c.lev.l === 'clip' ? (c.model ? 2 : 1) : (c.model ? 1 : 2)],
    ['Hinged cover plate', c.plate === 'open' ? 'open' : 'closed', c.plate === 'open' ? 1 : 2],
    ['Hinged CPU seat', c.seat === 'up' ? 'swung up' : 'down in the socket', c.seat === 'up' ? 1 : 2],
    ['CPU', m ? `${m.name}${c.seat === 'up' ? ', in the seat' : ', in the socket'}` : 'none', m ? 2 : 0],
    ['Thermal interface', tim, c.hs || c.grease === 5 ? 2 : c.grease || c.oldGrease ? 1 : 0],
    ['Heatsink', c.hs ? `on, screws ${c.screws.filter(v => v >= 2).length} of 4 tight` : 'not fitted', c.st === 'torqued' ? 2 : c.hs ? 1 : 0]];
  let s = `<rect x="${x}" y="${y}" width="362" height="234" rx="8" fill="#16293A" stroke="#2E5571"/><text x="${x + 12}" y="${y + 22}" class="st">CPU ${i + 1} socket, step by step</text>`;
  rows.forEach(([k, v, ok], r) => {
    const yy = y + 46 + r * 23, col = ['#8E99A3', '#FFB52E', '#45D07F'][ok];
    s += `<circle cx="${x + 18}" cy="${yy - 4}" r="5.5" fill="${col}"/><text x="${x + 30}" y="${yy}" class="ss" style="fill:#C9D6E0">${k}</text><text x="${x + 352}" y="${yy}" text-anchor="end" class="ss" style="fill:${col === '#8E99A3' ? '#C9D6E0' : col}">${esc(v)}</text>`;
  });
  const tool = { grease: 'Thermal grease syringe', clean: 'Heatsink cleaning kit', driver: 'No. 2 Phillips screwdriver' }[b.tool];
  s += `<text x="${x + 12}" y="${y + 228}" class="ss">Tool in use: ${tool || "none"}</text>`;
  return s;
}
function cpuCard(t, x, y) {
  const b = t.bench;
  let s = `<rect x="${x}" y="${y}" width="362" height="150" rx="8" fill="#16293A" stroke="#2E5571"/><text x="${x + 12}" y="${y + 22}" class="st">CPU in hand</text>`;
  if (!b.cpu) return s + `<text x="${x + 181}" y="${y + 84}" text-anchor="middle" class="ss">Pick a CPU from the CPU tray.</text>`;
  const m = byId('cpus', b.cpu), cx = x + 74, cy = y + 88, big = m.socket !== 'LGA2011-3';
  s += `<g${hot('cpuRotate', '', 'Turn the CPU a quarter turn')}><circle cx="${cx}" cy="${cy}" r="66" class="zone"/><g transform="translate(${cx} ${cy}) rotate(${b.rot})">`;
  s += big ? `<rect x="-58" y="-40" width="116" height="80" rx="4" fill="#2F6B3A"/><rect x="-46" y="-30" width="92" height="60" rx="4" fill="#C4CBD1" stroke="#8E99A3"/><path d="M-58 40l14 0l-14 -14z" fill="#F2C94C"/>`
    : `<rect x="-56" y="-54" width="112" height="108" rx="7" fill="#1A1D21" stroke="#3E444B" stroke-width="2"/><rect x="-64" y="-26" width="10" height="52" rx="3" fill="#1A1D21"/><rect x="54" y="-26" width="10" height="52" rx="3" fill="#1A1D21"/>
       <path d="M-62 -18h6M-62 -8h6M-62 2h6M-62 12h6M56 -18h6M56 -8h6M56 2h6M56 12h6" stroke="#4A5058" stroke-width="2"/>
       <rect x="-24" y="52" width="48" height="12" rx="2" fill="#1A1D21"/><text x="0" y="61" text-anchor="middle" style="font:700 8px var(--font);fill:#E6EDF2">ALIGN</text><path d="M-16 63h32" stroke="#F2C94C" stroke-width="2"/>
       <rect x="-44" y="-42" width="88" height="84" rx="3" fill="#2F6B3A"/><rect x="-35" y="-35" width="70" height="70" rx="5" fill="#C9D0D6" stroke="#8E99A3"/><path d="M-44 42l13 0l-13 -13z" fill="#F2C94C"/>`;
  s += `<text x="0" y="-4" text-anchor="middle" style="font:600 7.5px var(--font);fill:#4A5058">${esc(m.name.replace('Intel Xeon ', ''))}</text><text x="0" y="8" text-anchor="middle" style="font:500 6.5px var(--font);fill:#4A5058">${m.ghz} GHz</text></g></g>`;
  const ok = b.rot === 0 && !big;
  s += `<text x="${x + 152}" y="${y + 46}" class="st">${esc(m.name)}</text><text x="${x + 152}" y="${y + 64}" class="ss">${esc(m.pid)}</text><text x="${x + 152}" y="${y + 82}" class="ss">${m.socket}, ${m.cores} cores, ${m.watts} W</text>`;
  s += big ? `<text x="${x + 152}" y="${y + 104}" class="ss" style="fill:#FFB52E">Larger package: not an LGA2011-3 CPU</text>`
    : `<text x="${x + 152}" y="${y + 104}" class="ss" style="fill:${ok ? '#45D07F' : '#FFB52E'}">${ok ? 'Turned right: ALIGN tab down,' : 'Click the CPU to turn it until'}</text><text x="${x + 152}" y="${y + 120}" class="ss" style="fill:${ok ? '#45D07F' : '#FFB52E'}">${ok ? 'pin 1 triangle bottom-left' : 'ALIGN is down, pin 1 bottom-left'}</text>`;
  s += `<text x="${x + 152}" y="${y + 140}" class="ss">Hold it by the finger grips only.</text>`;
  return s;
}
function hsCard(t, x, y) {   // the heatsink part of the In your hand card
  const b = t.bench, h = b.hs;
  let s = '';
  const k = PROFILE.heatsinks[h.id], bx = x + 12, by = y + 32, bw = 112, bh = 156, sx = bw / 600, sy = bh / 836;
  s += `<image href="${h.clean || !k.reused ? IMG.hsBaseClean : IMG.hsBaseOld}" x="${bx}" y="${by}" width="${bw}" height="${bh}"/>`;
  const gx = bx + 120 * sx, gy = by + 274 * sy, gw = 362 * sx, gh = 288 * sy;
  if (!k.reused) {
    s += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="3" fill="#8E969D" stroke="#6E767D"/>`;
    if (h.film) s += `<rect x="${gx - 6}" y="${gy - 6}" width="${gw + 12}" height="${gh + 12}" rx="3" fill="#E8F4FF" fill-opacity=".45" stroke="#FFFFFF" stroke-width="1.2"/><path d="M${gx + gw + 6} ${gy - 6}l10 -8l4 6l-8 8z" fill="#E8F4FF" stroke="#FFFFFF"/>`;
  }
  if (h.soak) { const left = Math.max(0, 15 - Math.floor((Date.now() - h.soak) / (SOAK_MS / 15))); s += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="3" fill="#4AA8FF" opacity=".35"/><text x="${gx + gw / 2}" y="${gy + gh / 2 + 4}" text-anchor="middle" style="font:700 12px var(--font);fill:#FFFFFF">${left ? left + ' s' : 'wipe'}</text>`; }
  s += `<g${hot('hsBase', '', 'Heatsink base')}><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" class="zone"/></g>`;
  s += `<image href="${IMG.hsSide}" x="${x + 132}" y="${by + 8}" width="68" height="139"/><text x="${x + 166}" y="${by + 164}" text-anchor="middle" class="ss" style="font-size:10px">side</text><text x="${x + 68}" y="${by + 172}" text-anchor="middle" class="ss" style="font-size:10px">base, facing you</text>`;
  const st = k.reused ? (h.clean ? 'Base cleaned: ready once the CPU has 2 cc of grease' : h.soak ? 'Cleaning solution soaking (15 s)' : 'Old grease on the base: clean it') : (h.film ? 'Plastic sheet still over the thermal pad' : 'Plastic sheet removed: pad ready, no grease needed');
  s += `<text x="${x + 212}" y="${by + 14}" class="st" style="font-size:12.5px">${esc(k.pid)}</text><text x="${x + 212}" y="${by + 32}" class="ss">${k.reused ? 'Reused heatsink' : 'New spare heatsink'}</text>`;
  const words = st.split(' '); let line = '', ly = by + 56;
  words.forEach(w => { if ((line + ' ' + w).length > 24) { s += `<text x="${x + 212}" y="${ly}" class="ss" style="fill:${k.reused ? (h.clean ? '#45D07F' : '#FFB52E') : (h.film ? '#FFB52E' : '#45D07F')}">${esc(line.trim())}</text>`; ly += 16; line = w; } else line += ' ' + w; });
  s += `<text x="${x + 212}" y="${ly}" class="ss" style="fill:${k.reused ? (h.clean ? '#45D07F' : '#FFB52E') : (h.film ? '#FFB52E' : '#45D07F')}">${esc(line.trim())}</text>`;
  s += `<text x="${x + 212}" y="${by + 150}" class="ss">Click the base to ${k.reused ? 'clean' : 'peel'}.</text>`;
  return s;
}
// tools drawn for the In your hand card
const TOOLS = {
  driver: { name: 'No. 2 Phillips screwdriver', lines: ['Turn clockwise to tighten the captive screws,', 'counterclockwise to loosen them.', 'Alternate between the four screws.'] },
  grease: { name: 'Thermal grease syringe', lines: ['UCS-CPU-GREASE3=. For a reused heatsink only:', 'click the top of the CPU to apply 2 cc', 'in five even dabs. No grease under a new pad.'] },
  clean: { name: 'Heatsink cleaning kit', lines: ['UCSX-HSCK=: cleaning solution and soft cloth.', 'Click the old grease to apply the solution,', 'wait at least 15 seconds, then click to wipe.'] } };
function toolSvg(id, x, y, w) {
  if (id === 'driver') {
    let g = `<rect x="${x + 4}" y="${y + 6}" width="${w * 0.36}" height="34" rx="16" fill="#000" opacity=".25"/><rect x="${x}" y="${y}" width="${w * 0.36}" height="34" rx="16" fill="#C0392B" stroke="#5E1610" stroke-width="2"/>`;
    for (let k = 1; k < 6; k++) g += `<path d="M${x + k * w * 0.06} ${y + 6}V${y + 28}" stroke="#7A1E18" stroke-width="4" stroke-linecap="round"/>`;
    g += `<rect x="${x + w * 0.36}" y="${y + 9}" width="16" height="16" rx="3" fill="#1B1F24"/><rect x="${x + w * 0.36 + 16}" y="${y + 13}" width="${w * 0.5}" height="8" fill="#C9D0D6" stroke="#7E868D"/><path d="M${x + w * 0.86 + 16} ${y + 13}l20 4l-20 4z" fill="#9AA2AA" stroke="#5B636A"/>`;
    return g + `<path d="M${x + w * 0.86 + 22} ${y + 17}h10" stroke="#3A4046" stroke-width="2"/>`;
  }
  if (id === 'grease') {
    let g = `<rect x="${x}" y="${y + 6}" width="${w * 0.62}" height="26" rx="6" fill="#E8F1F7" fill-opacity=".85" stroke="#9AA9B5" stroke-width="2"/><rect x="${x + 4}" y="${y + 10}" width="${w * 0.62 - 8}" height="18" rx="4" fill="#9EA6AD"/>`;
    for (let k = 0; k <= 5; k++) g += `<path d="M${x + 10 + k * (w * 0.62 - 20) / 5} ${y + 6}v8" stroke="#3A4046" stroke-width="1.5"/>`;
    g += `<text x="${x + w * 0.31}" y="${y + 48}" text-anchor="middle" class="ss" style="font-size:10px">2 cc dose in 0.4 cc steps</text>`;
    return g + `<rect x="${x - 26}" y="${y + 13}" width="26" height="12" fill="#C9D0D6" stroke="#7E868D"/><rect x="${x - 34}" y="${y + 2}" width="8" height="34" rx="2" fill="#5B636A"/><path d="M${x + w * 0.62} ${y + 14}h16l10 5l-10 5h-16z" fill="#C9D0D6" stroke="#7E868D"/>`;
  }
  return `<rect x="${x + 6}" y="${y - 6}" width="40" height="58" rx="8" fill="#4AA8FF" fill-opacity=".85" stroke="#1F6FB2" stroke-width="2"/><rect x="${x + 14}" y="${y - 18}" width="24" height="14" rx="3" fill="#F4F7F9" stroke="#9AA9B5"/><rect x="${x + 10}" y="${y + 12}" width="32" height="20" rx="2" fill="#F4F7F9"/><text x="${x + 26}" y="${y + 25}" text-anchor="middle" style="font:700 7px var(--font);fill:#1F6FB2">CLEAN</text>
    <path d="M${x + 70} ${y + 4}h${w * 0.4}l-14 46h-${w * 0.4}z" fill="#F4F7F9" stroke="#C9D0D6" stroke-width="2"/><path d="M${x + 76} ${y + 20}h${w * 0.38}M${x + 72} ${y + 34}h${w * 0.38}" stroke="#D3DAE0" stroke-width="2"/><text x="${x + 70 + w * 0.2}" y="${y + 66}" text-anchor="middle" class="ss" style="font-size:10px">soft cloth</text>`;
}
function handCard(t, x, y) {
  const b = t.bench, h = b.hs, tl = b.tool && TOOLS[b.tool];
  let s = `<rect x="${x}" y="${y}" width="362" height="208" rx="8" fill="#16293A" stroke="#2E5571"/><text x="${x + 12}" y="${y + 22}" class="st">In your hand</text>`;
  if (h) {   // heatsink, plus the tool as a badge
    if (tl) s += `<g${hot('toolPick', b.tool, 'Put the tool down')}><rect x="${x + 150}" y="${y + 7}" width="202" height="22" rx="11" fill="#0E1A22" stroke="#FFB52E"/><text x="${x + 251}" y="${y + 22}" text-anchor="middle" class="ss" style="fill:#FFB52E">+ ${esc(tl.name)}</text></g>`;
    return s + hsCard(t, x, y);
  }
  if (tl) {
    s += `<g transform="translate(0 0)">${toolSvg(b.tool, x + 44, y + 44, 280)}</g>`;
    s += `<text x="${x + 12}" y="${y + 126}" class="st" style="font-size:13px">${esc(tl.name)}</text>`;
    tl.lines.forEach((l, k) => { s += `<text x="${x + 12}" y="${y + 146 + k * 17}" class="ss">${esc(l)}</text>`; });
    if (b.tool === 'driver') s += cwArrowUI(x + 330, y + 60);
    return s;
  }
  return s + `<text x="${x + 181}" y="${y + 100}" text-anchor="middle" class="ss">Nothing in your hand.</text><text x="${x + 181}" y="${y + 118}" text-anchor="middle" class="ss">Pick a heatsink or a tool from the tray.</text>`;
}
const cwArrowUI = (x, y) => `<g><path d="M${x - 16} ${y - 2}A16 16 0 1 1 ${x - 4} ${y + 15}" fill="none" stroke="#45D07F" stroke-width="3" stroke-linecap="round"/><path d="M${x - 10} ${y + 21}l9 -9l-11 -3z" fill="#45D07F"/><text x="${x - 2}" y="${y + 40}" text-anchor="middle" class="ss" style="font-size:9.5px;fill:#45D07F">tighten</text></g>`;
Sim.registerView({
  id: 'cpu', title: 'CPUs and heatsinks',
  keep: [
    ['Handle with care', 'CPUs and their sockets are fragile. Never touch the socket pins or the CPU contacts. Hold the CPU only by the finger grips on its plastic frame.'],
    ['No pick-and-place tool', 'This server uses ILM CPU sockets with a hinged CPU seat, so no pick-and-place tool is needed.'],
    ['Lever order', 'Open: release the lever with the unlock icon first, then the lever with the lock icon. Close: clip down the lock-icon lever first, then the unlock-icon lever.'],
    ['ALIGN tab', 'With the cover plate open and the hinged seat up, insert the ALIGN tab of the CPU frame into the seat until it stops. The line below ALIGN must be level with the edge of the seat. Then swing the seat down until the frame clicks flat.'],
    ['CPU rules', 'Install CPU 1 first: a single-CPU server needs CPU 1. Two CPUs must be identical. Keep the factory dust cover on an unused socket. Without CPU 2, riser 2 and the CPU 2 DIMM channels do not work.'],
    ['Thermal interface', 'A new heatsink has a thermal pad pre-applied under a small plastic sheet: remove the sheet and add no grease. A reused heatsink: clean the old grease off the heatsink and the CPU (cleaning kit UCSX-HSCK=: solution, soak at least 15 seconds, wipe with the soft cloth, do not scratch), then apply 2 cc of grease (UCS-CPU-GREASE3=) to the top of the CPU.'],
    ['Screws', 'Align the four captive screws with the motherboard standoffs. Tighten them with a No. 2 Phillips screwdriver, alternating evenly so the heatsink and CPU are not damaged. Loosen them the same way.'],
    ['Never without a heatsink', 'A CPU must always run with its heatsink and thermal interface in place.']],
  render(t) {
    const i = t.sel.socket;
    let g = '';
    [0, 1].forEach(k => { const on = k === i, x = 212 + k * 128; g += `<g${hot('sock', k, `Show the CPU ${k + 1} socket`)}><rect x="${x}" y="10" width="120" height="28" rx="6" fill="${on ? '#FFB52E' : '#16293A'}" stroke="${on ? '#FFB52E' : '#2E5571'}"/><text x="${x + 60}" y="29" text-anchor="middle" class="st" style="fill:${on ? '#14202B' : '#EAF2F7'}">CPU ${k + 1} socket</text></g>`; });
    const s = t.cpu[i];
    g += `<defs><clipPath id="cpuclip"><rect x="${CP.x}" y="${CP.y}" width="${1260 * CP.s}" height="${1370 * CP.s}" rx="6"/></clipPath></defs>`;
    g += `<g clip-path="url(#cpuclip)"><g transform="translate(${CP.x} ${CP.y - 330 * CP.s}) scale(${CP.s})">${sockSvg(t, i)}</g></g>`;
    g += `<rect x="${CP.x}" y="${CP.y}" width="${1260 * CP.s}" height="${1370 * CP.s}" rx="6" fill="none" stroke="#2E5571" stroke-width="2"/>`;
    if (s.plate === 'closed' && !s.hs) {   // which lever is which (icons stamped next to each hook)
      const [ux, uy] = [cX(1060), cY(1500)], [lx, ly] = [cX(240), cY(470)];
      g += chip(ux + 4, uy + 26, 'Unlock icon: open 1st') + chip(lx + 50, ly - 4, 'Lock icon: close 1st');
    }
    g += cpuMech(t, i, 528, 8) + cpuCard(t, 528, 250) + handCard(t, 528, 408);
    g += `<text x="${CP.x}" y="${CP.y + 1370 * CP.s + 18}" class="ss">Your socket photos. Lever rods, dust cover, grease and heatsink are drawn.</text>`;
    return frame('CPU socket, top view', g, 634);
  },
  actions(t) {
    const i = t.sel.socket, c = t.cpu[i], b = t.bench, a = [], n = i + 1;
    if (c.hs) { a.push(button(`Loosen the four screws evenly and lift the CPU ${n} heatsink off`, 'hsRemove', i)); return a; }
    if (c.plate === 'closed') {
      if (c.cap && !c.model) a.push(button('Lift off the protective dust cover', 'cpuCap', i, true));
      if (!c.cap && !c.model && c.lev.u === 'clip' && c.lev.l === 'clip') a.push(button('Refit the protective dust cover', 'cpuCap', i));
      a.push(button(c.lev.u === 'clip' ? 'Release lever with unlock icon' : 'Clip down lever with unlock icon', 'cpuLever', `${i}:u`));
      a.push(button(c.lev.l === 'clip' ? 'Release lever with lock icon' : 'Clip down lever with lock icon', 'cpuLever', `${i}:l`));
      if (c.lev.u === 'rel' && c.lev.l === 'rel') a.push(button('Open the hinged cover plate', 'cpuPlate', i));
      if (c.model && b.hs) a.push(button(`Lower the heatsink onto CPU ${n}`, 'hsPlace', i));
    } else {
      if (c.seat === 'down') { a.push(button('Swing the hinged seat up', 'cpuSeat', i)); a.push(button('Close the hinged cover plate', 'cpuPlate', i)); }
      else {
        if (!c.model && b.cpu) a.push(button('Insert the CPU into the hinged seat (ALIGN tab)', 'cpuInsert', i, true));
        if (c.model && !b.cpu) a.push(button('Lift the CPU out by its finger grips', 'cpuLift', i));
        a.push(button(c.model ? 'Swing the seat down until the frame clicks' : 'Swing the hinged seat down', 'cpuSeat', i));
      }
    }
    if (b.cpu) a.push(button('Turn the CPU a quarter turn', 'cpuRotate'));
    return a;
  },
  tray(t) {
    const b = t.bench, item = (sel, title, sub, act, arg, label) => `<div class="item${sel ? ' sel' : ''}"><span>${title}<small>${sub}</small></span>${button(label, act, arg)}</div>`;
    return `<h2>Pick a CPU</h2>` + CATALOG.cpus.map(m => item(b.cpu === m.id, `${esc(m.name)}`, `${esc(m.pid)}, ${m.socket}, ${m.cores} cores, ${m.watts} W`, 'cpuPick', m.id, 'Pick up')).join('') +
      `<h3>Pick a heatsink</h3>` + Object.entries(PROFILE.heatsinks).map(([k, h]) => item(b.hs && b.hs.id === k, esc(h.pid), esc(h.name + '. ' + h.note), 'hsPick', k, 'Pick up')).join('') +
      `<h3>Tools and consumables</h3>` +
      item(b.tool === 'grease', 'Thermal grease syringe', 'UCS-CPU-GREASE3=, 2 cc per CPU, only for a reused heatsink', 'toolPick', 'grease', b.tool === 'grease' ? 'In hand' : 'Use') +
      item(b.tool === 'clean', 'Heatsink cleaning kit', 'UCSX-HSCK=: cleaning solution and soft cloth', 'toolPick', 'clean', b.tool === 'clean' ? 'In hand' : 'Use') +
      item(b.tool === 'driver', 'No. 2 Phillips screwdriver', 'For the four captive heatsink screws', 'toolPick', 'driver', b.tool === 'driver' ? 'In hand' : 'Use');
  }
});
const sockN = i => `CPU ${+i + 1}`;
const cpuOk = () => inside(true);
Sim.on('sock', i => { T.sel.socket = +i; });
Sim.on('cpuPick', id => { T.bench.cpu = id; T.bench.rot = [90, 180, 270][Math.floor(Math.random() * 3)]; say('info', `${byId('cpus', id).name} picked up by the finger grips on its plastic frame. Turn it so the ALIGN tab faces the hinged seat.`); });
Sim.on('cpuRotate', () => { if (T.bench.cpu) T.bench.rot = (T.bench.rot + 90) % 360; });
Sim.on('hsPick', id => { const h = PROFILE.heatsinks[id]; T.bench.hs = { id, film: !h.reused, clean: false, soak: null }; say('info', `${h.pid}: ${h.name.toLowerCase()}. ${h.note}.`); });
Sim.on('toolPick', id => { T.bench.tool = T.bench.tool === id ? null : id; });
Sim.on('cpuCap', i => {
  i = +i; if (!cpuOk()) return; const c = T.cpu[i];
  if (c.plate !== 'closed') return bad('Close the cover plate first. The dust cover sits on the closed socket.');
  if (c.cap) { c.cap = false; say('ok', `Protective dust cover lifted off the ${sockN(i)} socket by its edges. Keep it: an unused socket must have it.`); }
  else { if (c.model) return bad('A CPU is installed: the dust cover is only for an empty socket.'); c.cap = true; say('ok', `Dust cover refitted on the empty ${sockN(i)} socket.`); }
  syncSt(c);
});
Sim.on('cpuLever', arg => {
  const [i, side] = arg.split(':'), c = T.cpu[+i]; if (!cpuOk()) return;
  if (c.hs) return bad('Remove the heatsink first: it sits over the retaining levers.');
  if (c.plate !== 'closed') return bad('Close the hinged cover plate first. The levers clip down over it.');
  const name = side === 'u' ? 'unlock icon' : 'lock icon', other = side === 'u' ? 'l' : 'u';
  if (c.lev[side] === 'clip') {
    if (side === 'l' && c.lev.u === 'clip') return bad('Release the lever with the unlock icon first, then the lever with the lock icon.');
    fxMark('lev' + i + side, 'clip'); c.lev[side] = 'rel'; Sim.sound('cpuRelease', 0.03);
    say('ok', side === 'u' ? 'Lever with the unlock icon pressed down and out of its hook: it springs up. Now release the lever with the lock icon.' : 'Lever with the lock icon released. Both levers are open: the cover plate is free.');
  } else {
    if (side === 'u' && c.lev.l === 'rel') return bad('Clip down the lever with the lock icon first, then the lever with the unlock icon.');
    if (c.seat === 'up') return bad('The hinged seat is up. Swing it down first.');
    fxMark('lev' + i + side, 'rel'); c.lev[side] = 'clip'; Sim.sound('cpuClip', 0.55);
    say('ok', side === 'l' ? 'Lever with the lock icon pressed down and clipped under its hook. Now clip down the lever with the unlock icon.' : `Lever with the unlock icon clipped down. ${c.model ? 'The CPU is held in the socket.' : 'Socket closed.'}`);
  }
  void other; syncSt(c);
});
Sim.on('cpuPlate', i => {
  i = +i; if (!cpuOk()) return; const c = T.cpu[i];
  if (c.hs) return bad('Remove the heatsink first.');
  if (c.plate === 'closed') {
    if (c.lev.u === 'clip' || c.lev.l === 'clip') return bad('Release both retaining levers first: the unlock-icon lever, then the lock-icon lever.');
    if (c.cap) return bad('Lift off the protective dust cover first.');
    c.plate = 'open'; say('ok', 'Hinged CPU cover plate swung open.' + (c.model ? '' : ' Next, swing the hinged CPU seat up.'));
  } else {
    if (c.seat === 'up') return bad('Swing the hinged seat down first. The cover plate closes over it.');
    c.plate = 'closed'; say('ok', 'Hinged cover plate closed. Now clip down the levers: the lock-icon lever first.');
  }
  syncSt(c);
});
Sim.on('cpuSeat', i => {
  i = +i; if (!cpuOk()) return; const c = T.cpu[i];
  if (c.plate !== 'open') return bad('Open the hinged cover plate first.');
  c.seat = c.seat === 'up' ? 'down' : 'up';
  say('ok', c.seat === 'up' ? (c.model ? 'Hinged seat swung up with the CPU in it.' : 'Hinged CPU seat swung up. Insert the CPU into it by its ALIGN tab.') : (c.model ? 'Seat swung down: the CPU frame clicked in place and lies flat in the socket.' : 'Hinged seat swung down.'));
  syncSt(c);
});
Sim.on('cpuInsert', i => {
  i = +i; if (!cpuOk()) return; const c = T.cpu[i], b = T.bench, o = T.cpu[1 - i];
  if (c.plate !== 'open' || c.seat !== 'up') return bad('Open the cover plate and swing the hinged seat up first.');
  if (c.model) return bad('There is already a CPU in this seat.');
  if (!b.cpu) return bad('Pick a CPU from the CPU tray first.');
  const m = byId('cpus', b.cpu);
  if (m.socket !== PROFILE.socket) return bad(`${m.name} is an ${m.socket} CPU from a newer server. This C240 M4 has ${PROFILE.socket} sockets for Intel Xeon E5-2600 v3 and v4 CPUs: it does not fit. Never force a CPU.`);
  if (i === 1 && !o.model) return bad('Install CPU 1 first, then CPU 2. The server needs at least CPU 1.');
  if (o.model && o.model !== b.cpu) return bad(`CPU ${2 - i} is a ${byId('cpus', o.model).name}. The two CPUs must be identical.`);
  if (b.rot !== 0) return bad('Wrong orientation. Turn the CPU until the ALIGN tab faces the seat hinge and the pin 1 triangle is at the bottom-left, then insert it.');
  c.model = b.cpu; b.cpu = null; c.grease = 0; c.oldGrease = false; c.tim = null;
  say('ok', 'ALIGN tab inserted into the hinged seat until it stopped: the line below ALIGN is level with the seat edge. Now swing the seat down.');
  syncSt(c);
});
Sim.on('cpuLift', i => { i = +i; if (!cpuOk()) return; const c = T.cpu[i]; if (!c.model || c.seat !== 'up') return; T.bench.cpu = c.model; T.bench.rot = 0; c.model = null; say('info', 'CPU lifted out of the hinged seat by the finger grips on its plastic frame.'); syncSt(c); });
const soakDone = s => s && Date.now() - s >= SOAK_MS;
Sim.on('cpuTop', i => {
  i = +i; if (!cpuOk()) return; const c = T.cpu[i], b = T.bench;
  if (!c.model || c.plate !== 'closed') return;
  if (c.lev.u !== 'clip' || c.lev.l !== 'clip') return bad('Clip down both levers first so the CPU is held in the socket.');
  if (b.tool === 'clean') {
    if (!c.grease && !c.oldGrease) return say('info', 'The top of the CPU is already clean.');
    if (!c.soak) { c.soak = Date.now(); return say('info', 'Cleaning solution applied to the old grease on the CPU. Let it soak at least 15 seconds.'); }
    if (!soakDone(c.soak)) return bad('Let the solution soak at least 15 seconds before wiping.');
    c.soak = null; c.grease = 0; c.oldGrease = false; return say('ok', 'Old grease wiped off the CPU with the soft cloth.');
  }
  if (b.tool === 'grease') {
    if (c.oldGrease) return bad('Clean the old grease off the CPU first (heatsink cleaning kit).');
    if (b.hs && !PROFILE.heatsinks[b.hs.id].reused) return bad('The heatsink in your hand is new: its thermal pad is pre-applied. Do not add grease.');
    if (c.grease >= 5) { c.grease = 0; return bad('That is more than 2 cc. Excess grease squeezes out over the socket. The grease was wiped off: apply exactly 2 cc again.'); }
    c.grease++; fxMark('gr' + i);
    return say(c.grease === 5 ? 'ok' : 'info', c.grease === 5 ? '2 cc of thermal grease applied evenly to the top of the CPU.' : `${(c.grease * 0.4).toFixed(1)} of 2.0 cc applied. Keep going so the whole surface is covered evenly.`);
  }
  say('info', 'Top of the CPU. A reused heatsink needs 2 cc of grease here (thermal grease syringe). A new heatsink brings its own pad.');
});
Sim.on('hsBase', () => {
  const h = T.bench.hs; if (!h) return; const k = PROFILE.heatsinks[h.id];
  if (!k.reused) { if (!h.film) return say('info', 'The thermal pad is ready. Do not touch it.'); h.film = false; return say('ok', 'Small plastic sheet peeled off the pre-applied thermal pad. Do not add grease.'); }
  if (h.clean) return say('info', 'The base is already clean.');
  if (T.bench.tool !== 'clean') return bad('Use the heatsink cleaning kit: cleaning solution on the old grease, soak, then wipe with the soft cloth.');
  if (!h.soak) { h.soak = Date.now(); return say('info', 'Cleaning solution applied to the old thermal grease. Let it soak at least 15 seconds.'); }
  if (!soakDone(h.soak)) return bad('Let the solution soak at least 15 seconds before wiping.');
  h.soak = null; h.clean = true; say('ok', 'Old grease wiped off the heatsink base with the soft cloth, without scratching the surface.');
});
Sim.on('hsPlace', i => {
  i = +i; if (!cpuOk()) return; const c = T.cpu[i], b = T.bench, h = b.hs;
  if (!h) return bad('Pick a heatsink from the heatsink tray first.');
  if (!c.model) return bad('There is no CPU in this socket.');
  if (c.plate !== 'closed' || c.lev.u !== 'clip' || c.lev.l !== 'clip') return bad('Close the cover plate and clip down both levers before fitting the heatsink.');
  const k = PROFILE.heatsinks[h.id];
  if (k.reused) {
    if (!h.clean) return bad('Clean the old thermal grease off the heatsink base first.');
    if (c.oldGrease) return bad('Clean the old grease off the CPU first.');
    if (c.grease < 5) return bad(`The CPU has ${(c.grease * 0.4).toFixed(1)} of 2 cc of grease. A reused heatsink needs 2 cc of new grease on the top of the CPU.`);
  } else {
    if (h.film) return bad('Remove the small plastic sheet from the pre-applied thermal pad first.');
    if (c.grease) return bad('A new heatsink has its own thermal pad. Wipe the grease off the CPU first (cleaning kit): do not use both.');
  }
  c.hs = h.id; c.tim = k.reused ? 'grease' : 'pad'; c.screws = [0, 0, 0, 0]; b.hs = null; fxMark('hs' + i);
  say('ok', 'Heatsink lowered with its four captive screws aligned over the motherboard standoffs. Now tighten the screws evenly with the No. 2 Phillips screwdriver.');
  syncSt(c);
});
Sim.on('hsScrew', arg => {
  const [i, k] = arg.split(':').map(Number), c = T.cpu[i]; if (!cpuOk()) return;
  if (!c.hs) return;
  if (T.bench.tool !== 'driver') return bad('Use the No. 2 Phillips screwdriver (Tools and consumables).');
  if (c.screws[k] >= 2) return say('info', 'That screw is already tight.');
  if (c.screws[k] > Math.min(...c.screws)) return bad('Alternate: bring the other screws to the same level first. Tightening one screw all the way tilts the heatsink and can damage the CPU.');
  c.screws[k]++; fxMark('scr' + i + k, 'tight'); syncSt(c);
  if (c.st === 'torqued') say('ok', `Screw ${k + 1} turned clockwise until tight. All four captive screws are tight: CPU ${i + 1} and its heatsink are installed.`);
  else say('ok', `Screw ${k + 1} turned clockwise ${c.screws[k] === 2 ? 'until tight' : 'until snug'}. Alternate to the next screw.`);
});
Sim.on('hsRemove', i => {
  i = +i; if (!cpuOk()) return; const c = T.cpu[i]; if (!c.hs) return;
  T.bench.hs = { id: c.hs, film: false, clean: false, soak: null }; if (c.hs === 'hsNew') T.bench.hs.id = 'hsUsed';
  c.hs = null; c.tim = null; c.screws = [0, 0, 0, 0]; c.grease = 0; c.oldGrease = true;
  say('info', 'Four captive screws loosened evenly, turning counterclockwise, and the heatsink lifted off. It and the CPU now carry old grease: clean both before refitting.');
  syncSt(c);
});
Sim.every(() => {   // redraw while a cleaning solution soaks
  if (Sim.view !== 'cpu' || !T || !T.bench) return;
  const busy = (T.bench.hs && T.bench.hs.soak) || T.cpu.some(c => c.soak);
  if (busy) render();
}, 250);

/* ---- Memory: conceptual top view of the C240 M4 board, laid out like the cover label "CPU and DIMM Numbering"
   (front of the server at the bottom, CPU 2 at the left), a side view of the DIMM in hand like training slide 17, and a
   map of the layout against Cisco's rules (model.js: memCheck). The build and memory labs offer three Cisco models (16 GB
   and 32 GB RDIMM, 64 GB LRDIMM); the RAM Distributor plans with the same three on its own board. ---- */
// the exam: no marks, no next socket, no verdicts in the Memory view (the RAM Distributor grades at the end)
const quiet = t => !!(t.rd && t.rd.exam);
const locked = () => T.rd && T.rd.submitted ? say('info', 'The exam is submitted: the memory layout is locked.') || true : false;
const MB = { x0: 44, y0: 86, L: 214, pitch: 20, sw: 13, cpuW: 138, gap: 14 };
const SLOTC = { 1: ['#2667B8', '#0D2C57', 'blue'], 2: ['#1C2025', '#000000', 'black'], 3: ['#E4DCC3', '#A99F84', 'white'] };
const MARK = { ok: ['#2F6B4A', '#7CF0A8', '&#10003;'], part: ['#8A5A00', '#FFC85A', '+'], bad: ['#7A1E16', '#FF8A7A', '!'] };
const wrapT = (s, n) => { const out = []; let line = ''; s.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; };
// the next socket of each installed CPU in Cisco's order
const memNextOf = (t, c) => cpuIn(t, c) ? cfill(c).find(s => !t.dimms[s]) : null;
function memLayout() {
  let x = MB.x0; const pos = {};
  PROFILE.layout.forEach(k => { if (k.startsWith('CPU')) { x += MB.gap; pos[k] = x; x += MB.cpuW + MB.gap; } else { pos[k] = x; x += MB.pitch; } });
  return pos;
}
function memSlotSvg(t, id, x, num) {
  const d = t.dimms[id], n = +id[1], [base, groove] = SLOTC[n], open = !d && t.memLev[id] === 'open', y = MB.y0, L = MB.L, w = MB.sw;
  const latch = (top) => { const ly = top ? y - 11 : y + L - 1, ang = open ? (top ? -38 : 38) : 0, px = x + w / 2, py = top ? y : y + L;
    return `<g transform="rotate(${ang} ${px} ${py})"><rect x="${x - 1}" y="${ly}" width="${w + 2}" height="12" rx="2.5" fill="#F2EEE2" stroke="#9C9580"/><rect x="${x + 2}" y="${top ? ly + 2 : ly + 6}" width="${w - 4}" height="4" rx="1" fill="#CFC8B3"/></g>`; };
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${L}" rx="2" fill="${base}" stroke="${n === 3 ? '#8E866E' : '#0A0D10'}"/>`;
  s += `<rect x="${x + 4.5}" y="${y + 8}" width="4" height="${L - 16}" rx="1" fill="${groove}"/><rect x="${x + 3}" y="${y + L * 0.56 - 2}" width="7" height="4" fill="${base}"/>`;
  if (d) {
    const m = byId('dimms', d.id), cls = fxAge('dimm' + id) < 0.5 ? ' class="drop"' : '', lr = m.type === 'LRDIMM';
    s += `<g${cls}><rect x="${x - 2}" y="${y + 3}" width="${w + 4}" height="${L - 6}" rx="2" fill="${lr ? '#1F5A6B' : '#1F6B45'}" stroke="${d.fault ? '#F0A93B' : '#0E3B22'}" stroke-width="${d.fault ? 2.5 : 1}"${d.fault ? ' class="blink"' : ''}/>`;
    const nc = 9, ch = (L - 20) / nc;
    for (let k = 0; k < nc; k++) s += `<rect x="${x - 1}" y="${y + 10 + k * ch + 1.5}" width="${w + 2}" height="${ch - 4}" rx="1" fill="#22262B"/>`;
    s += `<rect x="${x + 1}" y="${y + L * 0.62}" width="${w - 2}" height="26" rx="1" fill="${lr ? '#BFE3F0' : '#F4F4EC'}"/></g>`;
    if (d.fault && powerLed(t) !== 'off') s += `<circle cx="${x + w / 2}" cy="${y - 20}" r="5" fill="#F0A93B" class="blink"/>`;
    if (!d.fault && !quiet(t)) { const [f, st, c] = MARK[dimmMark(t, id)]; s += `<g pointer-events="none"><circle cx="${x + w / 2}" cy="${y + 22}" r="8.5" fill="${f}" stroke="${st}" stroke-width="2"/><text x="${x + w / 2}" y="${y + 26.5}" text-anchor="middle" style="font:800 11px var(--font);fill:#FFF">${c}</text></g>`; }
  } else if (num && !quiet(t) && Sim.guide) s += `<circle cx="${x + w / 2}" cy="${y + 26}" r="8.5" fill="#FFFFFF" stroke="#0D2C57" stroke-width="1.5"/><text x="${x + w / 2}" y="${y + 29.5}" text-anchor="middle" style="font:700 10px var(--font);fill:#1F4F8E">${num}</text>`;
  // no separate "next" marker: with guidance on, the highlight shows the socket; with it off, nothing points the way
  s += latch(true) + latch(false);
  const label = d ? `${id}, ${byId('dimms', d.id).name}${d.fault ? ', faulty' : ', click to take it out'}` : `${id}, ${SLOTC[n][2]} slot ${n}, empty, ejector levers ${open ? 'open' : 'closed'}`;
  s += `<g${hot('memSlot', id, label)}><rect x="${x - 4}" y="${y - 13}" width="${w + 8}" height="${L + 26}" rx="3" class="zone"/></g>`;
  s += `<text x="${x + w / 2}" y="${y + L + 26}" text-anchor="middle" style="font:600 10px var(--font);fill:#EAF2F7">${id}</text>`;
  return s;
}
function memBoard(t) {
  const pos = memLayout(), order = memOrder(t), y = MB.y0, L = MB.L;
  let g = `<rect x="14" y="44" width="872" height="296" rx="8" fill="#1E4D3A" stroke="#123326" stroke-width="2"/>`;
  for (let k = 0; k < 40; k++) g += `<path d="M${30 + k * 22} 50V334" stroke="#2A5C47" stroke-width="1" opacity=".35"/>`;
  // channel letters and the CPU each channel belongs to
  const groups = {};
  PROFILE.layout.forEach(k => { if (!k.startsWith('CPU')) (groups[k[0]] = groups[k[0]] || []).push(pos[k]); });
  Object.entries(groups).forEach(([c, xs]) => {
    const a = Math.min(...xs), b = Math.max(...xs) + MB.sw, cpu = slotCpu(c + '1');
    g += `<path d="M${a} ${y - 22}H${b}" stroke="${cpu ? '#9FC4E8' : '#F2D27A'}" stroke-width="2"/><text x="${(a + b) / 2}" y="${y - 27}" text-anchor="middle" style="font:700 12px var(--font);fill:${cpu ? '#9FC4E8' : '#F2D27A'}">${c}</text>`;
  });
  PROFILE.layout.forEach(k => {
    if (k.startsWith('CPU')) {
      const i = k === 'CPU1' ? 0 : 1, x = pos[k], ok = cpuIn(t, i), s = MB.cpuW / 960, top = y + L / 2 - 1135 * s / 2;
      if (ok) g += `<g transform="translate(${(x - 150 * s).toFixed(2)} ${(top - 372 * s).toFixed(2)}) scale(${s.toFixed(5)})">${hsTopSvg('mhs' + i)}</g>`;
      else g += `<rect x="${x + 10}" y="${y + 40}" width="${MB.cpuW - 20}" height="${L - 80}" rx="6" fill="#163A2C" stroke="#8E99A3" stroke-dasharray="6 4"/><text x="${x + MB.cpuW / 2}" y="${y + L / 2 + 22}" text-anchor="middle" class="ss" style="fill:#EAF2F7">not installed</text>`;
      g += `<text x="${x + MB.cpuW / 2}" y="${y - 24}" text-anchor="middle" class="ss" style="fill:#BFD6C9;font-size:10.5px">&#8593; Rear of server</text>`;
      g += `<rect x="${x + MB.cpuW / 2 - 34}" y="${y + L / 2 - 13}" width="68" height="26" rx="4" fill="#F4F6F8" stroke="#14202B" stroke-width="1.5"/><text x="${x + MB.cpuW / 2}" y="${y + L / 2 + 5}" text-anchor="middle" style="font:700 13px var(--font);fill:#14202B">CPU ${i + 1}</text>`;
      return;
    }
    const num = k[1] === '1' && order.indexOf(k) >= 0 && order.indexOf(k) < (cpuIn(t, 1) ? 8 : 4) ? order.indexOf(k) + 1 : 0;
    g += memSlotSvg(t, k, pos[k], num);
  });
  if (!cpuIn(t, 1)) { const xs = ['G1', 'H3', 'F3', 'E1'].map(k => pos[k]); g += `<rect x="${xs[0] - 6}" y="${y - 14}" width="${xs[1] - xs[0] + 25}" height="${L + 28}" fill="#0E1A22" opacity=".55"/><rect x="${xs[2] - 6}" y="${y - 14}" width="${xs[3] - xs[2] + 25}" height="${L + 28}" fill="#0E1A22" opacity=".55"/>`; }
  g += `<rect x="190" y="${y + L + 34}" width="520" height="18" rx="3" fill="#D3DAE0"/><text x="450" y="${y + L + 47}" text-anchor="middle" style="font:700 12px var(--font);fill:#14202B">Front of server</text>`;
  g += `<g transform="translate(728 ${y + L + 36})"><rect width="11" height="13" rx="2" fill="${SLOTC[1][0]}"/><text x="15" y="11" class="ss" style="font-size:10.5px;fill:#EAF2F7">#1</text><rect x="38" width="11" height="13" rx="2" fill="${SLOTC[2][0]}" stroke="#5B636A"/><text x="53" y="11" class="ss" style="font-size:10.5px;fill:#EAF2F7">#2</text><rect x="76" width="11" height="13" rx="2" fill="${SLOTC[3][0]}"/><text x="91" y="11" class="ss" style="font-size:10.5px;fill:#EAF2F7">#3</text></g>`;
  if (!quiet(t)) g += `<text x="28" y="${y + L + 47}" class="ss" style="fill:#BFD6C9">Blue numbers: fill order</text>`;
  return g;
}
// side view of the DIMM in hand, after training slide 17
function dimmSide(t) {
  const id = t.sel.dimm, X = 14, Y = 352;
  let s = `<rect x="${X}" y="${Y}" width="872" height="292" rx="8" fill="#16293A" stroke="#2E5571"/>`;
  if (!id) return s + `<text x="28" y="${Y + 24}" class="st">DIMM in hand</text><text x="450" y="${Y + 132}" text-anchor="middle" class="ss">Nothing in hand. Pick up one of the three Cisco models from the tray: its label and parts appear here.</text><text x="450" y="${Y + 152}" text-anchor="middle" class="ss">16 GB or 32 GB RDIMM (registered), or 64 GB LRDIMM (load-reduced): choose one model for the whole server.</text>`;
  const m = byId('dimms', id), lr = m.type === 'LRDIMM';
  const dx = X + 16, dy = Y + 44, w = 560, h = 108;
  s += `<text x="28" y="${Y + 24}" class="st">DIMM in hand: ${esc(m.name)}</text><text x="872" y="${Y + 24}" text-anchor="end" class="ss">Front face; server DIMMs carry chips on both sides</text>`;
  s += `<rect x="${dx}" y="${dy}" width="${w}" height="${h}" rx="5" fill="${lr ? '#1F5A6B' : '#1F6B45'}" stroke="#0E3B22" stroke-width="2"/><circle cx="${dx}" cy="${dy + 48}" r="7" fill="#16293A"/><circle cx="${dx + w}" cy="${dy + 48}" r="7" fill="#16293A"/>`;
  const nc = 9, cw = 48, gap = (w - 24 - nc * cw) / (nc - 1);
  for (let k = 0; k < nc; k++) s += `<rect x="${dx + 12 + k * (cw + gap)}" y="${dy + 8}" width="${cw}" height="42" rx="2" fill="#23272D"/>`;
  s += `<rect x="${dx + w / 2 - 24}" y="${dy + 56}" width="48" height="24" rx="2" fill="#2C3036"/><text x="${dx + w / 2}" y="${dy + 72}" text-anchor="middle" style="font:700 10px var(--font);fill:#C9D0D6">RCD</text>`;
  if (lr) for (let k = 0; k < 9; k++) if (k !== 4) s += `<rect x="${dx + 18 + k * (cw + gap)}" y="${dy + 82}" width="${cw - 12}" height="8" rx="1" fill="#2C3036"/>`;
  s += `<rect x="${dx + 302}" y="${dy + 56}" width="246" height="24" rx="2" fill="${lr ? '#BFE3F0' : '#F7F7F2'}" stroke="#B9B9AA"/><text x="${dx + 425}" y="${dy + 73}" text-anchor="middle" style="font:700 13px var(--mono);fill:#1A1A1A">${esc(m.label)}</text>`;
  s += `<rect x="${dx + 18}" y="${dy + 56}" width="152" height="22" rx="2" fill="#FFFFFF" stroke="#B9B9AA"/><text x="${dx + 24}" y="${dy + 71}" style="font:600 10.5px var(--mono);fill:#1A1A1A">${esc(m.pid)}</text>`;
  const notch = dx + 10 + 540 * 0.56;
  s += `<defs><linearGradient id="goldg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9C565"/><stop offset="1" stop-color="#B98C2E"/></linearGradient></defs><rect x="${dx + 10}" y="${dy + 92}" width="540" height="16" fill="url(#goldg)"/>`;
  for (let k = 0; k < 60; k++) s += `<path d="M${dx + 14 + k * 9} ${dy + 94}V${dy + 108}" stroke="#A67C25" stroke-width="1"/>`;
  s += `<rect x="${notch - 4}" y="${dy + 90}" width="8" height="20" rx="3" fill="#16293A"/>`;
  const call = (n, x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="#F2B53A" stroke="#14202B" stroke-width="1.5"/><text x="${x}" y="${y + 4}" text-anchor="middle" style="font:700 11px var(--font);fill:#14202B">${n}</text>`;
  s += call(1, dx + 12, dy + 8) + call(2, dx + 12 + (nc - 1) * (cw + gap) + cw, dy + 8) + call(3, dx + w / 2 - 34, dy + 68) + call(4, dx + 548, dy + 56) + call(5, notch + 14, dy + 98);
  const notes = [['Memory chips', 'store the data.'], ['9 chips per row:', 'the 9th holds ECC check bits.'], [lr ? 'RCD + data buffers' : 'RCD', lr ? 'by the pins: load-reduced (L).' : 'repeats commands: registered (R).'], ['Stickers:', 'label + Cisco part number.'], ['Notch:', 'DDR4 position; DDR3 will not fit.']];
  notes.forEach(([a, b], k) => { const yy = dy + 4 + k * 22; s += call(k + 1, 604, yy) + `<text x="620" y="${yy + 4}" class="ss" style="fill:#EAF2F7"><tspan font-weight="700">${esc(a)}</tspan> ${esc(b)}</text>`; });
  // decode the sticker
  const p = m.label.split(' '), parts = p[2].split('-'), pc = parts[0], speed = parts[1].match(/^\d+/)[0], tim = parts[1].slice(speed.length), typ = parts[2][0], rev = parts[2].slice(1) + '-' + parts[3];
  const cells = [[p[0], 'capacity'], [p[1].split('x')[0], `${p[1][0]} ranks`], ['x' + p[1].split('x')[1], 'bits per chip'], [pc, 'DDR4'], [speed, 'speed, MT/s'], [tim, 'timing'], [typ, { R: 'type: RDIMM', L: 'type: LRDIMM' }[typ]], [rev, 'board rev.'], [m.pid, 'Cisco part number']];
  let cx = 28; const cy = Y + 170;
  s += `<text x="28" y="${cy - 8}" class="st" style="font-size:13px">Decode the sticker</text>`;
  cells.forEach(([a, b], k) => {
    const wd = Math.max(a.length * 10 + 18, b.length * 6.2 + 14), hot2 = k === 6;
    s += `<rect x="${cx}" y="${cy}" width="${wd}" height="46" rx="5" fill="${hot2 ? '#F2B53A' : '#F4F6F8'}" stroke="${hot2 ? '#B9831A' : '#C9D0D6'}"/><text x="${cx + wd / 2}" y="${cy + 21}" text-anchor="middle" style="font:700 ${k === 8 ? 12 : 16}px var(--mono);fill:#14202B">${esc(a)}</text><text x="${cx + wd / 2}" y="${cy + 38}" text-anchor="middle" style="font:500 10.5px var(--font);fill:#3A4651">${esc(b)}</text>`;
    cx += wd + 6;
  });
  // what this model means for the build: one type in the server
  const vy = Y + 232, other = !quiet(t) && Object.keys(t.dimms).find(s2 => dimmOf(t, s2).type !== m.type);
  s += `<rect x="28" y="${vy}" width="844" height="48" rx="6" fill="${other ? '#3F1A17' : '#173F2C'}" stroke="${other ? '#FF8A7A' : '#45D07F'}"/><text x="40" y="${vy + 19}" style="font:700 13px var(--font);fill:${other ? '#FF8A7A' : '#45D07F'}">${other ? `Careful: the server already holds ${dimmOf(t, other).type}s (${other}...).` : `${m.type === 'RDIMM' ? 'Registered' : 'Load-reduced'} DDR4 with ECC: a Cisco part for this server.`}</text>`;
  wrapT(other ? `Cisco: do not mix RDIMMs with LRDIMMs in the server. Put this one back and use the ${dimmOf(t, other).short}, or take the others out first.` : t.rd ? `${m.ranks} rank${m.ranks > 1 ? 's' : ''}, ${m.cap} GB, ${m.pid}. In a channel, the DIMM with more ranks goes in the lower-numbered socket; both CPUs are populated identically.` : `${m.ranks} ranks, ${m.cap} GB. Use this one model in every socket you fill: Cisco does not allow RDIMMs and LRDIMMs together, and both CPUs must be populated identically.`, 140).slice(0, 2).forEach((l, k) => { s += `<text x="40" y="${vy + 34 + k * 13}" class="ss" style="fill:#EAF2F7;font-size:11px">${esc(l)}</text>`; });
  return s;
}
// the map: both CPUs' 12 sockets by channel, marked against Cisco's rules, with the next socket and what to do
function memMap(t) {
  const X = 14, Y = 652, m = memCheck(t), q = quiet(t), tone = m.n && !q ? memTone(t) : 'info';
  let g = `<rect x="${X}" y="${Y}" width="872" height="236" rx="8" fill="#16293A" stroke="#2E5571"/><text x="${X + 14}" y="${Y + 24}" class="st">Population map: ${m.n} DIMM${m.n === 1 ? '' : 's'}, ${m.gb} GB${m.n && !q ? ` at ${memSummary(t).speed} MHz` : ''}</text><text x="${X + 14}" y="${Y + 42}" class="ss">Minimum: 1 DIMM per CPU, in A1 and E1 (2 in all). Order per CPU: blue #1 in A to D, then black #2, then white #3.</text>`;
  [0, 1].forEach(c => {
    const y = Y + 76 + c * 62, off = !cpuIn(t, c);
    g += `<text x="${X + 14}" y="${y + 17}" class="st" style="font-size:12.5px">CPU ${c + 1}</text><text x="${X + 14}" y="${y + 33}" class="ss" style="font-size:10.5px">${off ? 'not installed' : `${cpuDimms(t, c).length} of 12`}</text>`;
    PROFILE.channels[c].forEach((ch, k) => {
      const gx = X + 84 + k * 102;
      g += `<text x="${gx + 41}" y="${y - 5}" text-anchor="middle" style="font:700 11px var(--font);fill:${c ? '#9FC4E8' : '#F2D27A'}">${ch}</text>`;
      [1, 2, 3].forEach(n => {
        const s = ch + n, d = t.dimms[s], x = gx + (n - 1) * 28, [base] = SLOTC[n];
        const fill = d ? (d.fault ? '#5A3A10' : q ? '#2D5B78' : MARK[dimmMark(t, s)][0]) : base;
        g += `<rect x="${x}" y="${y}" width="24" height="26" rx="3" fill="${fill}" stroke="#55606A" stroke-width="1" opacity="${off ? 0.4 : 1}"/><text x="${x + 12}" y="${y + 17}" text-anchor="middle" style="font:700 ${d ? 9.5 : 11}px var(--font);fill:${d || n !== 3 ? '#FFFFFF' : '#14202B'}">${d ? byId('dimms', d.id).cap : n}</text>`;
      });
    });
  });
  if (!q) [['ok', 'in Cisco\'s order, both CPUs alike'], ['part', 'in order, other CPU not matching yet'], ['bad', 'wrong socket or mixed type']].forEach(([k, l], i) => { const x = X + 14 + [0, 200, 420][i]; g += `<rect x="${x}" y="${Y + 206}" width="12" height="12" rx="2" fill="${MARK[k][0]}" stroke="${MARK[k][1]}"/><text x="${x + 17}" y="${Y + 216}" class="ss" style="font-size:10.5px">${l}</text>`; });
  g += `<text x="${X + 14}" y="${Y + 230}" class="ss" style="font-size:10.5px">Numbers in a fitted socket: its size in GB. Amber outline: the next socket in Cisco's order.</text>`;
  const msg = q ? `Exam: no checks here. ${m.n} DIMM${m.n === 1 ? '' : 's'} fitted, ${m.gb} GB. Submit in the RAM Distributor.` : memStatus(t);
  g += `<rect x="${X + 506}" y="${Y + 56}" width="352" height="140" rx="6" fill="#0F1F2C" stroke="#2E5571"/>`;
  wrapT(msg, 54).slice(0, 8).forEach((l, i) => { g += `<text x="${X + 518}" y="${Y + 76 + i * 15}" class="ss" style="font-size:11.5px;fill:${tone === 'warn' ? '#FF9F8F' : tone === 'ok' ? '#9FE8B8' : '#C5CCD3'}">${esc(l)}</text>`; });
  return g;
}
Sim.registerView({
  id: 'mem', title: 'Memory',
  keep: [
    ['Channels and sockets', 'Each CPU has 4 memory channels: CPU 1 = A, B, C, D; CPU 2 = E, F, G, H. Each channel has 3 sockets, for example A1, A2, A3. Without CPU 2, banks E, F, G and H are not available.'],
    ['Blue slot 1 first', 'A channel works with 1, 2 or 3 DIMMs. If a channel has only one DIMM, it goes in blue slot 1; then black slot 2; then white slot 3.'],
    ['Spread before you stack', 'Fill all blue #1 sockets first, alternating CPUs: A1, E1, B1, F1, C1, G1, D1, H1. Then all #2 sockets, then all #3.'],
    ['Minimum: 2 DIMMs', 'One per CPU, in A1 and E1. Cisco supports 1 to 12 DIMMs per CPU, and each installed CPU needs its own memory.'],
    ['Keep both CPUs equal', 'When both CPUs are installed, populate the DIMM sockets of each CPU identically: the same number, the same positions, the same model.'],
    ['One model type', 'Do not mix RDIMMs with LRDIMMs in the server. A quad-rank DIMM (the 64 GB LRDIMM) cannot share a channel with single- or dual-rank DIMMs.'],
    ['Bandwidth and speed', '4, 8 or 12 DIMMs per CPU keep all four channels equal: the best bandwidth. Three DIMMs in a channel slow the memory: 2133 MHz, or 1866 MHz with dual-rank RDIMMs (spec sheet, 2400 MHz DIMMs and CPU). RDIMMs of different sizes in the server run one step down, at 2133 MHz.'],
    ['Ranks in a channel', 'With two or three DIMMs in a channel, the one with more ranks goes first, in blue slot 1 (farthest from the CPU). Single-rank and dual-rank RDIMMs may share a channel.'],
    ['Cisco DIMMs only', 'DDR4 with ECC, registered (R) or load-reduced (L). Cisco does not support 3rd-party DIMMs: they might cause system problems or damage the motherboard.'],
    ['Installing a DIMM', 'DIMMs and sockets are fragile. Open both ejector levers, line the DIMM\'s notch up with the key in the socket, then press down evenly on both top corners until both levers lock.'],
    ['Training deck', 'Slides 15 and 17: DIMM population (spread first, then stack) and reading a server DIMM.']],
  render(t) {
    const m = memSummary(t);
    let g = `<text x="876" y="22" text-anchor="end" class="ss">Installed: ${m.count} DIMMs, ${m.total} GB${m.count && !quiet(t) ? `, running at ${m.speed} MT/s` : ''}</text>`;
    g += memBoard(t) + dimmSide(t) + memMap(t);
    return frame('DIMM sockets, top view', g, 896);
  },
  actions(t) {
    const a = [];
    if (t.sel.dimm) a.push(button('Put the DIMM back in the tray', 'memDrop'));
    return a;
  },
  tray(t) {
    const kit = t.memKit || {};
    const hand = t.sel.dimm && byId('dimms', t.sel.dimm);
    const shown = CATALOG.dimms.filter(d => (kit[d.id] || 0) > 0 || t.sel.dimm === d.id || Object.values(t.dimms).some(x => x.id === d.id));
    const card = d => { const now = t.sel.dimm === d.id, used = Object.values(t.dimms).filter(x => x.id === d.id).length;
      return `<div class="item" style="padding:9px 10px;margin-top:8px;border:${now ? '2px solid var(--touch)' : '1px solid var(--line)'};border-radius:8px"><span>${esc(d.name)}<small style="font-family:var(--mono)">${esc(d.label)}</small><small>${esc(d.pid)}, ${d.ranks} ranks</small><small>${kit[d.id] || 0} in the box${used ? `, ${used} in the server` : ''}</small>${now ? '<span class="pill on" style="margin-top:5px">&#10003; In your hand</span>' : ''}</span><span style="flex:none;white-space:nowrap">${now ? button('Put it back', 'memDrop') : button('Pick up', 'memPick', d.id)}</span></div>`; };
    return `<h2>Pick a DIMM model</h2><p class="cap" style="font-size:12.5px;margin:0">${hand ? `In your hand: <b>${esc(hand.short)}</b> (${esc(hand.label)}, ${esc(hand.pid)}).` : 'Nothing in your hand. Three Cisco models for this server: choose one for the whole server, RDIMMs and LRDIMMs must not be mixed.'}</p>` + shown.map(card).join('') +
      `<h3>Cisco population order (per CPU)</h3><table class="dec"><tr><td>DIMMs per CPU</td><td>CPU 1</td><td>CPU 2</td></tr><tr><td>1</td><td>A1</td><td>E1</td></tr><tr><td>2</td><td>A1, B1</td><td>E1, F1</td></tr><tr><td>3</td><td>A1, B1, C1</td><td>E1, F1, G1</td></tr><tr><td><b>4</b></td><td><b>A1 to D1</b> (all blue)</td><td><b>E1 to H1</b></td></tr><tr><td>5 to 7</td><td>+ A2, B2, C2</td><td>+ E2, F2, G2</td></tr><tr><td><b>8</b></td><td><b>+ D2</b> (all blue and black)</td><td><b>+ H2</b></td></tr><tr><td>9 to 11</td><td>+ A3, B3, C3</td><td>+ E3, F3, G3</td></tr><tr><td><b>12</b></td><td><b>+ D3</b> (all)</td><td><b>+ H3</b></td></tr></table><p class="cap" style="margin-top:6px">Any count from 1 to 12 per CPU is supported in this order, both CPUs the same, one model type. Bold: every channel equal, the best bandwidth. Source: Cisco UCS C240 M4 installation guide and spec sheet.</p>${t.rd ? '' : '<h3>Minimum for this lab</h3><p class="cap" style="font-size:13px">2 DIMMs: one per CPU, in A1 and E1. Each installed CPU needs its own memory, and Cisco wants both CPUs populated identically. Add more in Cisco\'s order if you like: Cisco IMC shows what you fitted.</p>'}`;
  }
});
Sim.on('memPick', id => {
  if (locked()) return;
  const d = byId('dimms', id); if (!d) return;
  if (T.sel.dimm === id) return;
  if (!T.memKit[id]) return bad(`No ${d.name}s left in the box.`);
  if (T.sel.dimm) T.memKit[T.sel.dimm] = (T.memKit[T.sel.dimm] || 0) + 1;
  T.memKit[id]--; T.sel.dimm = id; T.dimmSeen[id] = true; T.quiz[id] = { right: true };
  const other = !quiet(T) && Object.keys(T.dimms).find(s => dimmOf(T, s).type !== d.type);
  if (other) return say('warn', `${d.name} (${d.label}) in hand. The server already holds ${dimmOf(T, other).type}s: Cisco says do not mix RDIMMs with LRDIMMs in the server.`);
  say('info', `${d.name} picked up by its edges: ${d.label}, ${d.pid}. ${d.type === 'RDIMM' ? 'R after the speed: registered.' : 'L after the speed: load-reduced, quad rank.'} Read the label below the board.`);
});
Sim.on('memDrop', () => { if (locked()) return; if (T.sel.dimm) T.memKit[T.sel.dimm] = (T.memKit[T.sel.dimm] || 0) + 1; T.sel.dimm = null; say('info', 'DIMM put back in the tray.'); });
Sim.on('memSlot', id => {
  if (locked()) return;
  if (!inside(true)) return;
  const cur = T.dimms[id], hand = T.sel.dimm;
  if (cur) {
    if (hand) return bad(`Socket ${id} is occupied. Put the DIMM in your hand back in the tray first.`);
    delete T.dimms[id]; T.memLev[id] = 'open';
    if (cur.fault) { T.flags.dimmPulled = true; return say('ok', `Both ejector levers on ${id} pushed outward: the faulty DIMM popped up and was lifted out by its edges. Set it aside for return.`); }
    T.sel.dimm = cur.id;
    return say(!quiet(T) && memTone(T) === 'warn' ? 'warn' : 'info', `Both ejector levers on ${id} pushed outward and the DIMM lifted out. It is now in your hand.${quiet(T) ? '' : ' ' + memStatus(T)}`);
  }
  const c = slotCpu(id);
  if (!cpuIn(T, c)) return bad(`Socket ${id} belongs to CPU 2, which is not installed. Without CPU 2, banks E, F, G and H are not available: a DIMM there is not recognized.`);
  if (T.memLev[id] !== 'open') {
    T.memLev[id] = 'open'; const nx = memNextOf(T, c);
    return say('ok', `Both ejector levers on ${id} pushed outward. ${hand ? 'Now line up the notch and press the DIMM in.' : 'Pick a DIMM to install.'}${nx && nx !== id && !quiet(T) && Sim.guide ? ` Cisco's order would put CPU ${c + 1}'s next DIMM in ${nx}.` : ''}`);
  }
  if (!hand) { delete T.memLev[id]; return say('info', `Ejector levers on ${id} closed again.`); }
  T.dimms[id] = { id: hand }; delete T.memLev[id]; T.sel.dimm = null; fxMark('dimm' + id); Sim.sound('dimm');
  say(quiet(T) ? 'info' : memTone(T), `Notch lined up with the key in ${id}, DIMM pressed down evenly on both corners until both ejector levers locked. ${quiet(T) ? `${Object.keys(T.dimms).length} DIMMs fitted.` : memStatus(T)}`);
});
