/* ---- Rack: three DL380 Gen11 servers between the front posts (front view), the quick-release levers close up, the
   rack seen from above with a server sliding out on its rails, and the serial number pull tab of each server close up
   (the black tab with the i on the left rack ear: S/N and P/N with bar codes). HPE user guide, "Extend the server from the rack": pull down the
   quick-release levers on each side of the server, then extend the server (it stops and locks in the service position).
   To return it: press the rail-release latches on both sides and slide the server back into the rack until the levers
   engage the posts. Before extending anything, identify the server by its serial number: the work order names it, and
   the servers look alike. From the trainer's photos and videos of this server. ---- */
const RK = { s: 0.2, x: 57, y: 76, pitch: 100, postL: 40, postR: 580, postW: 22 };
const RKW = FC.W * RK.s, RKH = FC.H * RK.s;
// the rack from above: server in W units (front at the bottom), scale and slide distance
const RT = { cx: 760, front: 382, k: 0.14, slide: 245 };
const rtX = x => RT.cx + (x - 675) * RT.k;
const rtY = (y, out) => RT.front - (WV.H - y) * RT.k + (out ? RT.slide : 0);
const POSN = ['top', 'middle', 'bottom'];
const SRVN = i => `${POSN[i]} server`;

/* ---- the three servers: order top to bottom, each one's levers and rails, the pull tabs read. Older saved states
   have only this server's rack state: it is the middle one ---- */
function rk(t) {
  const r = t.rack;
  if (!r.order) r.order = ['live', 'us', 'twin'];
  if (!r.mates) r.mates = { twin: newSlot(), live: newSlot() };
  if (!r.read) r.read = {};
  if (!r.tabs) r.tabs = { twin: false, live: false };
  if (r.sel === undefined) r.sel = null;
  if (r.look === undefined) r.look = null;
  return r;
}
const usSlot = t => rk(t).order.indexOf('us');
const slotId = (t, i) => rk(t).order[i];
const slotSt = (t, i) => { const r = rk(t), id = r.order[i]; return id === 'us' ? r : r.mates[id]; };
const serialAt = (t, i) => { const id = slotId(t, i); return id === 'us' ? LAB.serial : MATES[id].serial; };
const isLive = (t, i) => { const id = slotId(t, i); return id !== 'us' && MATES[id].run; };
const outSlot = t => { for (let i = 0; i < 3; i++) if (slotSt(t, i).pos === 'out') return i; return -1; };
const allRead = t => [0, 1, 2].every(i => rk(t).read[i]);
// each server's serial number pull tab: this one's is the same tab as in the Front panel view
const tabOut = (t, i) => { const id = slotId(t, i); return id === 'us' ? !!t.pullTab : !!rk(t).tabs[id]; };
// which server the views below the rack show: the one that is out, else the one being handled
const shownSlot = t => { const j = outSlot(t), r = rk(t); return j >= 0 ? j : r.sel === null ? -1 : r.sel; };
// action arguments: '2l' (server 2, left), or plain 'l' / '' for the server out, the one being handled, or this one
const argSK = (a, def) => { const s = String(a); return /^[0-2][lr]$/.test(s) ? [+s[0], s[1]] : [def, s]; };
const argS = (a, def) => /^[0-2]$/.test(String(a)) ? +a : def;
const defSlot = t => { const j = outSlot(t), r = rk(t); return j >= 0 ? j : r.sel !== null ? r.sel : usSlot(t); };

// in the rack all three look alike: the front photo with a drive in every bay, nothing lit while they have no power.
// Only the serial number pull tab tells them apart (this server's blanks show in the Front panel view)

// a quick-release lever (k: 'l' or 'r') in FC units: up (engaged) or pulled down about its bottom edge. S: that server's
// rack state, fk: its animation key
function leverArt(S, k, id, fk) {
  const r = k === 'l' ? FP.levL : FP.levR, [x0, y0, x1, y1] = r, down = S.lev[k], a = fxAge(fk), f = 0.42;
  let g = '';
  if (!down && !(a < 0.3)) return g;
  // the recess behind the lever and the latch hook that holds the post
  g += `<rect x="${x0}" y="${y0 - 2}" width="${x1 - x0}" height="${y1 - y0 + 2}" rx="4" fill="#060708"/><rect x="${x0 + 10}" y="${y0 + 6}" width="${x1 - x0 - 20}" height="34" rx="3" fill="#8E979F" stroke="#4E565D" stroke-width="2"/><path d="M${k === 'l' ? x0 + 4 : x1 - 4} ${y0 + 20}h${k === 'l' ? -14 : 14}" stroke="#B8C0C7" stroke-width="7" stroke-linecap="round"/>`;
  const anim = a < 0.3 ? `<animateTransform attributeName="transform" type="scale" values="${down ? `1 1;1.03 ${f}` : `1.03 ${f};1 1`}" dur="0.25s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : '';
  g += `<defs><clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="4"/></clipPath></defs>`;
  g += `<g transform="translate(${(x0 + x1) / 2} ${y1})"><g transform="${anim ? '' : `scale(1.03 ${f})`}">${anim}<g transform="translate(${-(x0 + x1) / 2} ${-y1})"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#000" opacity=".5" transform="translate(3 14)"/><image href="${IMG.hpFront}" x="0" y="0" width="${FC.W}" height="${FC.H}" clip-path="url(#${id})"/></g></g></g>`;
  return g;
}
// server i's front at its place in the rack (pushed in) or extended toward you
function srvFront(t, i) {
  const r = rk(t), id = r.order[i], S = slotSt(t, i), out = S.pos === 'out', a = fxAge('rack' + i), y = RK.y + RK.pitch * i;
  let g = `<rect x="${RK.postL + RK.postW}" y="${y}" width="${RK.postR - RK.postL - RK.postW}" height="${RKH}" fill="#05080A"/>`;
  // rails in the empty slot when it is out
  if (out) g += `<rect x="${RK.postL + RK.postW + 2}" y="${y + 30}" width="10" height="${RKH - 60}" fill="#6E777F"/><rect x="${RK.postR - 12}" y="${y + 30}" width="10" height="${RKH - 60}" fill="#6E777F"/>`;
  const sc = out ? 1.07 : 1, from = out ? 1 : 1.07, cx = RK.x + RKW / 2, cy = y + RKH / 2;
  const anim = a < 1.4 ? `<animateTransform attributeName="transform" type="scale" values="${from};${sc}" dur="${out ? 1.3 : 1.1}s" begin="-${a.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".3 .1 .3 1" keyTimes="0;1"/>` : '';
  g += `<g transform="translate(${cx} ${cy})"><g transform="${anim ? '' : `scale(${sc})`}">${anim}<g transform="translate(${-cx} ${-cy})">`;
  if (out) g += `<rect x="${RK.x + 6}" y="${y + 10}" width="${RKW}" height="${RKH}" rx="4" fill="#000" opacity=".5"/>`;
  g += `<g transform="translate(${RK.x} ${y}) scale(${RK.s})">${frontImg('rkf' + i, [0, 0, FC.W, FC.H])}`;
  if (id === 'us') g += panelLeds(t);
  g += leverArt(S, 'l', `rlv${i}l`, `lev${i}l`) + leverArt(S, 'r', `rlv${i}r`, `lev${i}r`);
  // the serial number pull tab in its slot at the ear's right edge: pulled out, it stands out toward you (drawn at an angle)
  const [tx0, ty0, tx1, ty1] = FP.tab, tOut = tabOut(t, i);
  let tab = `<rect x="${tx0 - 16}" y="${ty0 - 12}" width="${tx1 - tx0 + 32}" height="${ty1 - ty0 + 24}" rx="6" class="zone"/>`;
  if (tOut) tab += `<g><path d="M${tx1} ${ty0 + 4}L${tx0 - 250} ${ty0 + 64}V${ty1 + 40}L${tx1} ${ty1 - 4}Z" fill="#0D0E10" stroke="#5B636A" stroke-width="3"/><rect x="${tx0 - 226}" y="${ty0 + 86}" width="120" height="34" fill="#F2F2EF"/><rect x="${tx0 - 226}" y="${ty0 + 130}" width="120" height="34" fill="#F2F2EF"/><rect x="${tx0 - 96}" y="${ty0 + 90}" width="70" height="12" fill="#C9CED2"/><rect x="${tx0 - 96}" y="${ty0 + 134}" width="70" height="12" fill="#C9CED2"/></g>`;
  g += `<g${hot('rackTab', i, `${SRVN(i)}: serial number pull tab (the i on the left rack ear): ${tOut ? 'pulled out, click to push it back in' : 'pull it out to read the serial number'}`)}>${tab}</g>`;
  if (!out) ['l', 'r'].forEach(k => { const [x0, y0, x1, y1] = k === 'l' ? FP.levL : FP.levR; g += `<g${hot('rackLever', i + k, `${SRVN(i)}, ${k === 'l' ? 'left' : 'right'} quick-release lever: ${S.lev[k] ? 'pulled down, click to let go' : 'pull it down'}`)}><rect x="${x0 - 6}" y="${y0 - 10}" width="${x1 - x0 + 12}" height="${y1 - y0 + 14}" rx="6" class="zone"/></g>`; });
  else g += `<g${hot('rackIn', i, `${SRVN(i)}, extended: push it back into the rack`)}><rect x="160" y="10" width="2280" height="470" class="zone"/></g>`;
  g += `</g>`;
  if (out) g += `<rect x="${RK.x - 1}" y="${y - 1}" width="${RKW + 2}" height="${RKH + 2}" rx="3" fill="none" stroke="#F0A93B" stroke-width="2"/>`;
  else if (r.sel === i) g += `<rect x="${RK.x - 1}" y="${y - 1}" width="${RKW + 2}" height="${RKH + 2}" rx="3" fill="none" stroke="#7CC4FF" stroke-width="1.6" stroke-dasharray="6 4" pointer-events="none"/>`;
  return g + `</g></g></g>`;
}
// one lever of server i close up, beside the rack
function leverInset(t, i, k, X, Y) {
  const S = slotSt(t, i), r = k === 'l' ? FP.levL : FP.levR, cl = k === 'l' ? [0, 196, 168, 490] : [2462, 196, 2630, 490], s = 0.74, down = S.lev[k];
  const w = (cl[2] - cl[0]) * s, h = (cl[3] - cl[1]) * s, name = k === 'l' ? 'Left lever' : 'Right lever';
  let g = `<text x="${f1(X + w / 2)}" y="${Y - 22}" text-anchor="middle" class="st" style="font-size:12.5px">${name}</text><text x="${f1(X + w / 2)}" y="${Y - 7}" text-anchor="middle" class="ss" style="fill:${down ? '#FFB52E' : '#C5CCD3'}">${S.pos === 'out' ? 'up (the server is out)' : down ? 'pulled down' : 'up: engaged on the post'}</text>`;
  g += `<defs><clipPath id="lvin${k}"><rect x="${X}" y="${Y}" width="${f1(w)}" height="${f1(h)}" rx="6"/></clipPath></defs><g clip-path="url(#lvin${k})"><rect x="${X}" y="${Y}" width="${f1(w)}" height="${f1(h)}" fill="#0A1218"/><g transform="translate(${X} ${Y}) scale(${s}) translate(${-cl[0]} ${-cl[1]})"><image href="${IMG.hpFront}" width="${FC.W}" height="${FC.H}"/>${leverArt(S, k, 'lvc' + k, `lev${i}${k}`)}`;
  if (S.pos === 'in') {
    g += `<g${hot('rackLever', i + k, `${SRVN(i)}, ${name.toLowerCase()}: ${down ? 'pulled down, click to let go' : 'pull it down by its top lip'}`)}><rect x="${r[0] - 4}" y="${r[1] - 8}" width="${r[2] - r[0] + 8}" height="${r[3] - r[1] + 12}" rx="6" class="zone"/></g>`;
    if (!down && Sim.guide) { const cx = (r[0] + r[2]) / 2, cy = r[1] + 14; g += `<g pointer-events="none">${pulse(cx, cy, 14, 34)}<g><animateTransform attributeName="transform" type="translate" values="0 -6;0 10;0 -6" dur="1.3s" repeatCount="indefinite"/><path d="M${cx} ${cy - 50}V${cy - 14}M${cx - 12} ${cy - 26}L${cx} ${cy - 12}L${cx + 12} ${cy - 26}" fill="none" stroke="#14202B" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M${cx} ${cy - 50}V${cy - 14}M${cx - 12} ${cy - 26}L${cx} ${cy - 12}L${cx + 12} ${cy - 26}" fill="none" stroke="${CUE}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></g></g>`; }
  }
  g += `</g></g><rect x="${X}" y="${Y}" width="${f1(w)}" height="${f1(h)}" rx="6" fill="none" stroke="${down ? '#FFB52E' : '#5B7A92'}" stroke-width="2"/>`;
  return g;
}
// a rail-release latch of server i, close up: the inner rail on the side of the chassis, its release tab
function railInset(t, i, k, X, Y) {
  const S = slotSt(t, i), on = S.rel[k], name = k === 'l' ? 'Left rail-release latch' : 'Right rail-release latch';
  let g = `<rect x="${X}" y="${Y}" width="128" height="150" rx="6" fill="#0A1218" stroke="${on ? '#FFB52E' : '#5B7A92'}" stroke-width="2"/><text x="${X + 64}" y="${Y - 22}" text-anchor="middle" class="st" style="font-size:12.5px">${name}</text><text x="${X + 64}" y="${Y - 7}" text-anchor="middle" class="ss" style="fill:${on ? '#FFB52E' : '#C5CCD3'}">${on ? 'pressed, held' : 'locked'}</text>`;
  // chassis side above, the rail below with its slots, the release tab
  g += `<rect x="${X + 6}" y="${Y + 8}" width="116" height="40" fill="#B9C1C8"/><rect x="${X + 6}" y="${Y + 48}" width="116" height="62" fill="#9AA3AB" stroke="#5B636A"/><rect x="${X + 6}" y="${Y + 110}" width="116" height="30" fill="#7D868E"/>`;
  [[18, 62], [18, 86], [94, 62], [94, 86]].forEach(([dx, dy]) => { g += `<rect x="${X + dx}" y="${Y + dy}" width="16" height="8" rx="3" fill="#3E454C"/>`; });
  const tx = X + 46 + (on ? 10 : 0);
  g += `<rect x="${tx}" y="${Y + 54}" width="30" height="50" rx="5" fill="#D9D3C3" stroke="#8C8576" stroke-width="2"/><path d="M${tx + 8} ${Y + 66}h14M${tx + 8} ${Y + 74}h14M${tx + 8} ${Y + 82}h14" stroke="#A39C8A" stroke-width="2"/>`;
  g += `<text x="${X + 64}" y="${Y + 132}" text-anchor="middle" class="ss" style="font-size:10px;fill:#14202B">${on ? '' : 'push toward the front'}</text>`;
  if (S.pos === 'out') g += `<g${hot('rackRel', i + k, `${SRVN(i)}, ${name.toLowerCase()}: ${on ? 'pressed, click to let go' : 'press it'}`)}><rect x="${X + 4}" y="${Y + 4}" width="120" height="142" rx="6" class="zone"/></g>`;
  return g;
}
// the rack from above: front posts, the slide rails, server i sliding out toward you (this one as it is now, the
// others with their access panels on)
function rackTop(t, i) {
  const u = i === usSlot(t), S = slotSt(t, i), out = S.pos === 'out', a = fxAge('rack' + i), W0 = rtX(60) - 10, W1 = rtX(1290) + 10, cover = u ? t.cover : 'closed';
  let g = `<text x="${RT.cx}" y="40" text-anchor="middle" class="st">The rack from above: ${SRVN(i)}</text>`;
  // rack side walls and the front posts
  g += `<rect x="${W0 - 28}" y="50" width="20" height="${RT.front - 50}" fill="#1C2A35"/><rect x="${W1 + 8}" y="50" width="20" height="${RT.front - 50}" fill="#1C2A35"/>`;
  g += `<rect x="${W0 - 30}" y="${RT.front - 4}" width="34" height="18" fill="#59626A"/><rect x="${W1 - 4}" y="${RT.front - 4}" width="34" height="18" fill="#59626A"/><text x="${RT.cx}" y="${RT.front + 34}" text-anchor="middle" class="ss" style="fill:#9FB3C2">front posts</text>`;
  // outer slide rails, fixed to the posts
  g += `<rect x="${W0 - 10}" y="58" width="9" height="${RT.front - 52}" fill="#8E979F"/><rect x="${W1 + 1}" y="58" width="9" height="${RT.front - 52}" fill="#8E979F"/>`;
  // the server: interior frame (front section, labels) with the access panel on top, moving on its inner rails
  const dy = out ? RT.slide : 0, from = out ? 0 : RT.slide;
  const anim = a < 1.4 ? `<animateTransform attributeName="transform" type="translate" values="0 ${from};0 ${dy}" dur="${out ? 1.3 : 1.1}s" begin="-${a.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".3 .1 .3 1" keyTimes="0;1"/>` : '';
  g += `<g transform="translate(0 ${anim ? 0 : dy})">${anim}`;
  g += `<rect x="${f1(rtX(60) - 2)}" y="${f1(rtY(0, false))}" width="${f1(1230 * RT.k + 4)}" height="${f1(WV.H * RT.k)}" fill="#000" opacity=".45" transform="translate(5 8)"/>`;
  g += `<g transform="translate(${f1(rtX(0))} ${f1(rtY(0, false))}) scale(${RT.k})"><image href="${IMG.hpInt}" width="${WV.W}" height="${WV.H}"/>`;
  if (cover !== 'off') g += `<g transform="translate(0 ${cover === 'lifted' || cover === 'placed' ? COVER.back : 0})"><image href="${IMG.hpCover}" x="${COVER.x}" y="${COVER.y}" width="${COVER.w}" height="${COVER.h}"/></g>`;
  else g += insideArt(t);
  g += `</g>`;
  // inner rails on the chassis sides, with the release latches near the front
  const ry = rtY(1880, false);
  g += `<rect x="${f1(rtX(60) - 9)}" y="${f1(rtY(80, false))}" width="7" height="${f1((2250 - 80) * RT.k)}" fill="#B8C0C7"/><rect x="${f1(rtX(1290) + 2)}" y="${f1(rtY(80, false))}" width="7" height="${f1((2250 - 80) * RT.k)}" fill="#B8C0C7"/>`;
  ['l', 'r'].forEach(k => { const x = k === 'l' ? rtX(60) - 12 : rtX(1290) + 1; g += `<rect x="${f1(x)}" y="${f1(ry)}" width="11" height="18" rx="2" fill="${S.rel[k] ? '#FFB52E' : '#D9D3C3'}" stroke="#5B636A"/>`; if (out) g += `<g${hot('rackRel', i + k, `${SRVN(i)}, ${k === 'l' ? 'left' : 'right'} rail-release latch`)}><rect x="${f1(x - 6)}" y="${f1(ry - 6)}" width="23" height="30" rx="4" class="zone"/></g>`; });
  // the rack ears at the front
  g += `<rect x="${f1(rtX(0) - 12)}" y="${f1(rtY(WV.H, false) - 6)}" width="${f1(WV.W * RT.k + 24)}" height="8" fill="#16191C"/>`;
  g += `</g>`;
  g += `<text x="${RT.cx}" y="${out ? 640 : 446}" text-anchor="middle" class="ss" style="fill:${out ? '#FFD27A' : '#C5CCD3'}">${out ? 'Extended: locked in the service position' : 'Pushed in: ears against the posts'}</text>`;
  return g;
}
function rackSvg(t) {
  const r = rk(t), j = outSlot(t), sh = shownSlot(t);
  const sub = j >= 0 ? `The ${SRVN(j)} is extended toward you on its rails.` : r.idCheck ? `Three DL380 Gen11 servers. The work order names yours by serial number: ${LAB.serial}.` : 'Your server is one of three DL380 Gen11 servers in this part of the rack.';
  let g = `<text x="${RK.postL}" y="40" class="st">Front of the rack</text><text x="${RK.postL}" y="58" class="ss">${esc(sub)}</text>`;
  // posts with their square holes, then the three servers
  [RK.postL, RK.postR].forEach(px => { g += `<rect x="${px}" y="66" width="${RK.postW}" height="${RK.pitch * 3 + 20}" fill="#3A444C"/>`; for (let k = 0; k < 26; k++) g += `<rect x="${px + 8}" y="${72 + k * 12}" width="6" height="6" rx="1" fill="#141A1F"/>`; });
  [0, 1, 2].forEach(i => { g += srvFront(t, i); });
  // the levers of the server being handled close up, or the rail-release latches of the one that is out
  const Y = RK.y + RK.pitch * 3 + 66;
  if (j < 0) {
    if (sh >= 0) g += leverInset(t, sh, 'l', 60, Y) + leverInset(t, sh, 'r', 196, Y) + `<text x="196" y="${Y - 40}" text-anchor="middle" class="ss" style="fill:#7CC4FF">${esc(SRVN(sh)[0].toUpperCase() + SRVN(sh).slice(1))}: its rack ears close up</text>`;
    if (acOn(t)) g += `<text x="344" y="${Y + 8}" class="ss" style="fill:#FF8A7A">Your server's power cords are connected:</text><text x="344" y="${Y + 24}" class="ss" style="fill:#FF8A7A">power down and disconnect them first.</text>`;
  } else {
    g += railInset(t, j, 'l', 60, Y) + railInset(t, j, 'r', 210, Y);
    const tx = 360;
    ['To push it back in:', '1. Close the access panel.', '2. Press the rail-release latch', '   on each side.', '3. Slide the server in until the', '   ears meet the posts and both', '   levers click.'].forEach((s, n) => { g += `<text x="${tx}" y="${Y + 8 + n * 18}" class="${n ? 'ss' : 'st'}" style="white-space:pre">${esc(s)}</text>`; });
  }
  g += rackTop(t, sh >= 0 ? sh : 1);
  // nothing chosen and nothing out: no close-ups below the rack, so the frame ends under the rack (the frame title sits
  // lower on a short frame: the drawing moves down with it)
  if (j < 0 && sh < 0) return frame('Rack: identify the server, extend it and push it back', `<g transform="translate(0 12)">${g}</g>`, 490);
  return frame('Rack: identify the server, extend it and push it back', g, 660);
}

/* ---- identify the server: the pull tab of the server checked last, close up (the ear photo with the tab pulled out,
   as in the Front panel view), its readout, the work order and the serials read so far ---- */
const TP = { s: 0.6, x: 24, y: 48 };                           // the pull-tab photo box (the Front view's VB box) here
function tabPanelSvg(t) {
  const r = rk(t), L = r.look, X = 610, W = 272;
  let g = '';
  if (L === null) {
    g += `<rect x="${TP.x}" y="${TP.y}" width="${f1(344 * TP.s + 4)}" height="${f1(388 * TP.s + 4)}" rx="8" fill="#14202B" stroke="#5B7A92" stroke-dasharray="6 4"/>`;
    ['Pull out a server\'s serial', 'number tab: the black tab', 'with the i, on the left', 'rack ear, slides straight', 'out toward you.'].forEach((s, n) => { g += `<text x="${f1(TP.x + 172 * TP.s + 2)}" y="${TP.y + 86 + n * 18}" text-anchor="middle" class="ss">${esc(s)}</text>`; });
  } else {
    g += `<rect x="${TP.x}" y="${TP.y}" width="${f1(344 * TP.s + 4)}" height="${f1(388 * TP.s + 4)}" rx="8" fill="#0E1A22" stroke="#5B7A92"/>`;
    g += `<g transform="translate(${f1(TP.x + 2 - (VB.x + 8) * TP.s)} ${f1(TP.y + 2 - (VB.y + 8) * TP.s)}) scale(${TP.s})">${pullTabCore(serialAt(t, L), tabOut(t, L), false, 'rtab' + L, 'rtabflip', 'rk')}</g>`;
  }
  // the readout of that tab
  const R = 262;
  if (L !== null) {
    const out = tabOut(t, L);
    g += `<text x="${R}" y="64" class="st">${esc(SRVN(L)[0].toUpperCase() + SRVN(L).slice(1))}: pull tab ${out ? 'pulled out' : 'pushed back in'}</text><text x="${R}" y="82" class="ss">Serial number side (lab values)</text>`;
    [['Serial number (S/N)', serialAt(t, L), 20], ['Product number (P/N)', PROFILE.productId, 14], ['Model', PROFILE.product, 14]].forEach(([k, v, fs], n) => { g += `<text x="${R}" y="${112 + n * 46}" class="ss" style="fill:#9FB3C2">${k}</text><text x="${R}" y="${136 + n * 46 - (fs < 20 ? 3 : 0)}" style="font:800 ${fs}px var(--mono);fill:#EAF2F7;letter-spacing:.03em">${esc(v)}</text>`; });
    g += `<g${hot('rackTab', L, out ? `${SRVN(L)}: push the pull tab back in` : `${SRVN(L)}: pull the tab out again`)}><rect x="${R}" y="236" width="200" height="32" rx="8" fill="#14202B" stroke="#8E99A3"/><text x="${R + 100}" y="257" text-anchor="middle" style="font:600 13px var(--font);fill:#EAF2F7">${out ? 'Push it back in' : 'Pull it out again'}</text></g>`;
  } else g += `<text x="${R}" y="64" class="st">Serial number pull tab</text><text x="${R}" y="84" class="ss">Each server carries its own: S/N and P/N with bar codes.</text><text x="${R}" y="102" class="ss">Click the i at the top of a server's left rack ear.</text>`;
  // the work order and the serials read so far
  g += `<rect x="${X}" y="46" width="${W}" height="112" rx="8" fill="#14202B" stroke="#F0A93B" stroke-width="1.5"/><text x="${X + 14}" y="66" style="font:800 10px var(--font);letter-spacing:.08em;fill:#F0A93B">WORK ORDER</text>`;
  g += `<text x="${X + 14}" y="84" class="ss" style="fill:#DCE3E9">New build: processor 2, memory, drives, iLO</text><text x="${X + 14}" y="100" class="ss">HPE ${esc(PROFILE.product)}, rack R07</text><text x="${X + 14}" y="120" class="ss">Serial number:</text><text x="${X + 14}" y="146" style="font:800 21px var(--mono);fill:#FFE3A8;letter-spacing:.04em">${LAB.serial}</text>`;
  g += `<text x="${X}" y="186" class="st" style="font-size:12.5px">Pull tabs read</text>`;
  [0, 1, 2].forEach(i => { const y = 208 + i * 22; g += `${r.read[i] ? `<circle cx="${X + 6}" cy="${y - 4}" r="6" fill="#45D07F"/><path d="M${X + 3} ${y - 4}l2.2 2.2l4 -4.4" stroke="#0E1A12" stroke-width="1.8" fill="none"/>` : `<circle cx="${X + 6}" cy="${y - 4}" r="5.5" fill="none" stroke="#8E99A3" stroke-width="1.4"/>`}<text x="${X + 18}" y="${y}" class="ss" style="fill:${r.read[i] ? '#DCE3E9' : '#8E99A3'}">${esc(SRVN(i)[0].toUpperCase() + SRVN(i).slice(1))}: <tspan style="font-family:var(--mono);font-weight:700">${r.read[i] ? serialAt(t, i) : 'not read yet'}</tspan></text>`; });
  return frame('Identify the server: the serial number pull tabs', g, 296);
}

Sim.registerView({
  id: 'rack', title: 'Rack: identify, extend and return',
  keep: [
    ['Identify the server first', 'The work order names the server by its serial number. Pull out the serial number tab of every candidate (the black tab with the i, on the left rack ear) and compare its S/N character by character before you touch a lever: servers of the same model look alike, and extending the wrong one can take a running service down. Push each tab back in.'],
    ['Stabilise the rack', 'Before you extend anything, make sure the rack is stabilised: levelling feet down, stabilisers fitted. Extend one server at a time.'],
    ['Power and cables first', 'To open the server: power it down, disconnect every power cord, then extend it. Without a cable management arm, cables left connected pull tight.'],
    ['Quick-release levers', 'The lower part of each rack ear is a quick-release lever: the drive box label on the left, the model badge on the right. Pull both down, then extend the server.'],
    ['Service position', 'The rails stop and lock the server when it is fully extended, so it cannot slide back by itself while you work on it.'],
    ['Pushing it back', 'Close the access panel. Press the rail-release latch on each side, slide the server in slowly until the ears meet the posts and the levers click. Then reconnect the cables.'],
    ['Heavy', 'A loaded DL380 can weigh up to about 37 kg (81 lb): to remove it from the rack, use two people or a lift.']],
  render: t => rackSvg(t) + tabPanelSvg(t),
  actions(t) {
    const r = rk(t), j = outSlot(t), a = [];
    if (j >= 0) {
      const S = slotSt(t, j);
      ['l', 'r'].forEach(k => a.push(button(S.rel[k] ? `Let go of the ${k === 'l' ? 'left' : 'right'} rail-release latch` : `Press the ${k === 'l' ? 'left' : 'right'} rail-release latch (${SRVN(j)})`, 'rackRel', j + k)));
      a.push(button(`Slide the ${SRVN(j)} back in`, 'rackIn', j, S.rel.l && S.rel.r));
      return a;
    }
    [0, 1, 2].forEach(i => { if (!r.read[i] || tabOut(t, i)) a.push(button(tabOut(t, i) ? `Push the ${SRVN(i)}'s pull tab back in` : `Pull out the ${SRVN(i)}'s serial number tab`, 'rackTab', i)); });
    if (r.sel !== null) {
      const i = r.sel, S = slotSt(t, i);
      ['l', 'r'].forEach(k => a.push(button(S.lev[k] ? `Let go of the ${k === 'l' ? 'left' : 'right'} lever` : `Pull down the ${k === 'l' ? 'left' : 'right'} quick-release lever (${SRVN(i)})`, 'rackLever', i + k)));
      a.push(button(`Slide the ${SRVN(i)} out`, 'rackOut', i, S.lev.l && S.lev.r));
    }
    [0, 1, 2].forEach(i => { if (i !== r.sel) a.push(button(`Choose the ${SRVN(i)}`, 'rackSel', i)); });
    return a;
  },
  tray(t) {
    const u = usSlot(t), r = rk(t);
    return `<h2>Rack procedure (HPE)</h2><ol class="rules"><li><b>Identify:</b> pull out the serial number tab of each server (the i on its left rack ear), compare its S/N with the work order (S/N ${LAB.serial}), and push it back in. Only the one that matches is yours.</li><li><b>Extend:</b> pull down the quick-release levers on each side of that server.</li><li>If shipping screws are fitted, loosen them (T-25 Torx).</li><li>Extend the server: the rails lock it in the service position.</li><li><b>Return:</b> close the access panel, press the rail-release latches on both sides, and slide the server in until the levers engage.</li></ol><p class="cap">Pull tabs read: ${[0, 1, 2].filter(i => r.read[i]).length} of 3. ${outSlot(t) === u ? `Your server (S/N ${LAB.serial}) is extended on its rails.` : outSlot(t) >= 0 ? `The ${SRVN(outSlot(t))} is extended.` : 'All three servers are pushed in.'} ${acOn(t) ? 'Its power cords are connected.' : ''}</p>`;
  }
});
// choose the server to work on: its levers show close up; any lever held on another server is let go
const takeSlot = i => { const r = rk(T); [0, 1, 2].forEach(n => { if (n !== i) { const S = slotSt(T, n); if (S.pos === 'in') S.lev = { l: false, r: false }; } }); r.sel = i; };
Sim.on('rackSel', a => {
  const i = argS(a, null); if (i === null) return;
  const j = outSlot(T); if (j >= 0) return say('warn', `The ${SRVN(j)} is extended. Extend one server at a time: push it back in first.`);
  takeSlot(i); say('info', `The ${SRVN(i)}: its rack ears are shown close up. Is it the one in the work order?`);
});
Sim.on('rackTab', a => {
  const i = argS(a, null), r = rk(T); if (i === null) return;
  const id = slotId(T, i), out = !tabOut(T, i);
  if (id === 'us') { T.pullTab = out; T.tabSide = 'sn'; fxMark('tab'); } else r.tabs[id] = out;
  fxMark('rtab' + i); Sim.sound(out ? 'tab' : 'clip', 0.02); r.look = i;
  if (!out) return say('info', `Pull tab of the ${SRVN(i)} pushed back into its slot.`);
  r.read[i] = true;
  say('info', `Pull tab of the ${SRVN(i)} out. S/N ${serialAt(T, i)}, P/N ${PROFILE.productId}.${allRead(T) ? ' All three tabs read: compare them with the work order.' : ''} Push it back in when you have read it.`);
});
Sim.on('rackLever', a => {
  const [i, k] = argSK(a, defSlot(T)); if (k !== 'l' && k !== 'r') return;
  const S = slotSt(T, i), j = outSlot(T);
  if (S.pos !== 'in') return say('info', 'This server is out on its rails: the levers sprang back up. They engage the posts again when you push it in.');
  if (j >= 0) return say('warn', `The ${SRVN(j)} is extended. Extend one server at a time: push it back in first.`);
  takeSlot(i);
  S.lev[k] = !S.lev[k]; fxMark(`lev${i}${k}`); Sim.sound(S.lev[k] ? 'clipOpen' : 'clip', 0.02);
  const side = k === 'l' ? 'left' : 'right', other = k === 'l' ? 'r' : 'l';
  if (!S.lev[k]) return say('info', `You let go of the ${side} lever of the ${SRVN(i)}: it sprang back up and engages the post again.`);
  say('ok', S.lev[other] ? `Both quick-release levers of the ${SRVN(i)} are pulled down: its ears are free of the posts.` : `${SRVN(i)[0].toUpperCase() + SRVN(i).slice(1)}: ${side} quick-release lever pulled down. Now the ${other === 'l' ? 'left' : 'right'} one.`);
});
Sim.on('rackOut', a => {
  const r = rk(T), i = argS(a, defSlot(T)), S = slotSt(T, i), j = outSlot(T);
  if (S.pos !== 'in') return;
  if (j >= 0) return say('warn', `The ${SRVN(j)} is extended. Extend one server at a time: push it back in first.`);
  if (!(S.lev.l && S.lev.r)) return bad(`The quick-release levers still hold the ears of the ${SRVN(i)} on the rack posts. Pull down ${S.lev.l || S.lev.r ? 'the other lever' : 'both levers'} first: the lower part of each rack ear.`);
  if (r.idCheck && !allRead(T)) return bad(`Identify the server before you extend anything: pull out the serial number tab of all three servers and compare it with the work order (S/N ${LAB.serial}). Servers of the same model look alike.`);
  if (i === usSlot(T) && acOn(T)) return bad('Power down the server and disconnect both power cords first: without a cable management arm, the cords would pull tight as the server slides out.');
  const still = ['ilo', 'ocp1', 'ocp2'].filter(k => plugged(T, k));
  if (i === usSlot(T) && still.length) return bad(`Unplug the ${still.map(k => RUN[k].short).join(', ')} cable${still.length > 1 ? 's' : ''} at the rear first (Cabling view): the server slides out about 70 cm, and its cables would pull tight on the switches.`);
  S.pos = 'out'; S.lev = { l: false, r: false }; r.sel = i; fxMark('rack' + i); Sim.sound('drive', 0.1); Sim.sound('latch', 1.2);
  if (i !== usSlot(T)) {
    const sn = serialAt(T, i), live = isLive(T, i);
    return bad(`Wrong server. The ${SRVN(i)}'s pull tab reads S/N ${sn}, and the work order says ${LAB.serial}. ${live ? 'It is a production server, shut down for another team\'s maintenance: someone else\'s job, and its cables pull tight as it slides out.' : 'It is another new server, waiting for its own build: someone else\'s job.'} Push it back in: press both rail-release latches, then slide it in.`);
  }
  say('ok', `Server S/N ${LAB.serial} slid out slowly on its rails until they stopped and locked it in the service position: click. You let go of the levers as it moved: they sprang back up. Now you can open the access panel.`);
});
Sim.on('rackRel', a => {
  const [i, k] = argSK(a, defSlot(T)); if (k !== 'l' && k !== 'r') return;
  const S = slotSt(T, i);
  if (S.pos !== 'out') return say('info', 'The rail-release latches unlock the rails only when the server is extended.');
  S.rel[k] = !S.rel[k]; Sim.sound(S.rel[k] ? 'tab' : 'clip', 0.02);
  const other = k === 'l' ? 'r' : 'l';
  say(S.rel[k] ? 'ok' : 'info', !S.rel[k] ? 'Rail-release latch let go: the rails stay locked.' : S.rel[other] ? 'Both rail-release latches pressed: the rails are unlocked. Slide the server back in.' : `${k === 'l' ? 'Left' : 'Right'} rail-release latch pressed. Press the ${other === 'l' ? 'left' : 'right'} one too.`);
});
Sim.on('rackIn', a => {
  const r = rk(T), i = argS(a, defSlot(T)), S = slotSt(T, i), u = i === usSlot(T);
  if (S.pos !== 'out') return;
  if (u && T.cover !== 'closed') return bad('Close the access panel before you push the server back into the rack.');
  if (!(S.rel.l && S.rel.r)) return bad(`The rails are locked in the service position. Press ${S.rel.l || S.rel.r ? 'the other rail-release latch' : 'the rail-release latches on both sides'} first.`);
  S.pos = 'in'; S.rel = { l: false, r: false }; fxMark('rack' + i); Sim.sound('drive', 0.1); Sim.sound('latch', 1.0); Sim.sound('latch', 1.08);
  if (!u) { r.sel = null; return say('ok', `The ${SRVN(i)} slid back in until its ears met the posts and both quick-release levers clicked into place. Now extend the server whose pull tab matches the work order: S/N ${LAB.serial}.`); }
  say('ok', `Server slid back in until the ears met the posts and both quick-release levers clicked into place. ${RUNS.some(r => cabUn(T, r.k)) ? 'Reconnect the cables at the rear: iLO and data first, power last.' : 'Reconnect the power cords.'}`);
});
