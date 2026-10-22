/* ---- Cabling: the rear of the rack, with the server's rear panel (the same drawing as the Power and iLO view), the
   two top-of-rack data switches SW01 and SW02 (48 x 10/25 Gb SFP28 each), the management switch MGT01 (48 x 1 Gb
   RJ-45), a horizontal cable manager, and the two rack PDUs (12 x C13 each, feed A on the right, feed B on the left).
   The cable schedule (work order) gives every cable its exact port: the student takes a cable from the server's port and
   plugs it into the numbered port. Switch ports are numbered as on most switches: odd on the top row, even below.
   Lab values: rack R07, the server in U14-U15, invented device names. © 2026 Mustafa Abdulkadhim, Information Technology. ---- */
// the cable runs: server port, device and port, cable, role (the label's last field)
const RUNS = [
  { k: 'ilo', from: 'iLO Management Port', short: 'iLO', dev: 'MGT01', port: 14, kind: 'cat6', role: 'OOB-MGMT', what: 'Cat 6 patch cord, RJ-45, 2 m (blue)' },
  { k: 'ocp1', from: 'OCP 15 port 1', short: 'OCP15-P1', dev: 'SW01', port: 24, kind: 'dac', role: 'DATA-A', what: '10 Gb SFP+ DAC, 3 m (direct attach copper)' },
  { k: 'ocp2', from: 'OCP 15 port 2', short: 'OCP15-P2', dev: 'SW02', port: 24, kind: 'dac', role: 'DATA-B', what: '10 Gb SFP+ DAC, 3 m (direct attach copper)' },
  { k: 'ps1', from: 'Power supply 1 (PS1)', short: 'PS1', dev: 'PDUA', port: 6, kind: 'power', role: 'PWR-A', what: 'C13 to C14 power cord, 1.8 m' },
  { k: 'ps2', from: 'Power supply 2 (PS2)', short: 'PS2', dev: 'PDUB', port: 6, kind: 'power', role: 'PWR-B', what: 'C13 to C14 power cord, 1.8 m' }];
const RUN = Object.fromEntries(RUNS.map(r => [r.k, r]));
// where this server sits: the three DL380 Gen11 servers fill U12 to U17, this one at its place in the Rack view
const CABLOC = { rack: 'R07', name: 'DL380-01', get lo() { const i = T && T.rack && T.rack.order ? T.rack.order.indexOf('us') : 1; return [16, 14, 12][i < 0 ? 1 : i]; }, get u() { return 'U' + this.lo; } };
const DEVS = {
  SW01: { name: 'SW01', what: 'Data switch A: 48 x 10/25 Gb SFP28', ports: 48, cage: 'sfp', y: 72 },
  SW02: { name: 'SW02', what: 'Data switch B: 48 x 10/25 Gb SFP28', ports: 48, cage: 'sfp', y: 122 },
  MGT01: { name: 'MGT01', what: 'Management switch: 48 x 1 Gb RJ-45', ports: 48, cage: 'rj45', y: 172 },
  PDUA: { name: 'PDU A', what: 'Rack PDU, feed A: 12 x C13', ports: 12, cage: 'c13', x: 852 },
  PDUB: { name: 'PDU B', what: 'Rack PDU, feed B: 12 x C13', ports: 12, cage: 'c13', x: 16 }};
const devName = d => DEVS[d].name;
const want = k => `${RUN[k].dev}:${RUN[k].port}`;
// a cable can be unplugged at the server only (maintenance): its far end stays in its switch port or PDU outlet, with
// its label, and the server end hangs at the rear of the rack until it is plugged back in
const cabUn = (t, k) => !!(t.cabOff && t.cabOff[k]);
const plugged = (t, k) => !!(t.cab && t.cab[k]) && !cabUn(t, k);
const cabOk = (t, k) => t.cab[k] === want(k) && !cabUn(t, k);
// every cable on its scheduled far end (plugged in at the server or not): the dressed bundle stays in place
const routed = t => RUNS.every(r => t.cab[r.k] === want(r.k));
const portTxt = a => { const [d, n] = a.split(':'); return `${devName(d)} ${d.startsWith('PDU') ? 'outlet' : 'port'} ${n}`; };
const fitsCage = (kind, cage) => ({ cat6: 'rj45', dac: 'sfp', power: 'c13' })[kind] === cage;
const cageTxt = { rj45: 'an RJ-45 port', sfp: 'an SFP28 cage', c13: 'a C13 outlet' };
const kindTxt = { cat6: 'an RJ-45 plug', dac: 'an SFP+ connector', power: 'a C14 plug' };
const allIn = t => RUNS.every(r => cabOk(t, r.k));
const labelTxt = (k, end) => { const r = RUN[k], a = `${CABLOC.rack}-${CABLOC.u} ${CABLOC.name} ${r.short}`, b = portTxt(want(k)).replace(' port ', ' P').replace(' outlet ', ' O').replace(' ', '-'); return end ? `${b} | ${a} | ${r.role}` : `${a} | ${b} | ${r.role}`; };

/* ---- geometry: the server's rear panel at the scale of this view; switch ports; PDU outlets ---- */
const CBP = { x: 98, y: 300, s: 0.84 };                                 // the rear panel: placement and scale of rv() coordinates
const RVC = { x: 30, y: 82, s: 840 / 445 };                              // = RV in views-ilo.js (loaded after this file)
const cpt = (x, y) => [CBP.x + x * RVC.s * CBP.s, CBP.y + y * RVC.s * CBP.s];
const SPORT = { ilo: cpt(117.5, 74), ocp1: cpt(197, 70.5), ocp2: cpt(227, 70.5), ps2: cpt(351, 64), ps1: cpt(426, 64) };
const SWX0 = 158, SWP = 23.2;
const swPort = (dev, n) => { const c = Math.ceil(n / 2) - 1, row = (n - 1) % 2, x = SWX0 + c * SWP + Math.floor(c / 6) * 5; return { x, y: DEVS[dev].y + 11 + row * 13, w: 18, h: 11 }; };
const pduOut = (dev, n) => ({ x: DEVS[dev].x + 4, y: 92 + (n - 1) * 33, w: 24, h: 22 });
const destXY = a => { const [d, n] = a.split(':'); const b = d.startsWith('PDU') ? pduOut(d, +n) : swPort(d, +n); return [b.x + b.w / 2, b.y + b.h / 2, d.startsWith('PDU') ? 'side' : n % 2 ? 'top' : 'bottom']; };
// a polyline with rounded corners
function roundPath(P, r = 12) {
  let d = `M${f1(P[0][0])} ${f1(P[0][1])}`;
  for (let i = 1; i < P.length - 1; i++) {
    const [x0, y0] = P[i - 1], [x1, y1] = P[i], [x2, y2] = P[i + 1];
    const l1 = Math.hypot(x1 - x0, y1 - y0), l2 = Math.hypot(x2 - x1, y2 - y1), q = Math.min(r, l1 / 2, l2 / 2);
    const a = [x1 - (x1 - x0) / l1 * q, y1 - (y1 - y0) / l1 * q], b = [x1 + (x2 - x1) / l2 * q, y1 + (y2 - y1) / l2 * q];
    d += `L${f1(a[0])} ${f1(a[1])}Q${f1(x1)} ${f1(y1)} ${f1(b[0])} ${f1(b[1])}`;
  }
  const L = P[P.length - 1]; return d + `L${f1(L[0])} ${f1(L[1])}`;
}
const CCOL = { cat6: '#2E7BD6', dac: '#2B3034', power: '#121416' }, CW2 = { cat6: 3.6, dac: 4.6, power: 6 };
const LANE = { ilo: 0, ocp1: 1, ocp2: 2 };
// a cable from its server port to its destination: loose, or dressed through the cable manager
// where the server end of a cable hangs when it is unplugged at the server: just below its port
const hangXY = (t, k) => { const [x, y] = SPORT[k]; return RUN[k].kind === 'power' ? [x + 4, y + 40] : t.cabDressed && routed(t) ? [x + 4, y + 40] : [x + 4, y - 34]; };
function cabPath(t, k) {
  const [sx, sy] = cabUn(t, k) ? hangXY(t, k) : SPORT[k], [dx, dy, side] = destXY(t.cab[k]), dressed = t.cabDressed && routed(t);
  if (RUN[k].kind === 'power') {
    const px = side === 'side' && dx > 450 ? dx - 30 : dx + 30;
    return dressed ? roundPath([[sx, sy], [sx, sy + 48 + (k === 'ps1' ? 0 : 8)], [px, sy + 48 + (k === 'ps1' ? 0 : 8)], [px, dy], [dx, dy]], 14)
      : `M${f1(sx)} ${f1(sy)}C${f1(sx)} ${f1(sy + 120)} ${f1(px)} ${f1(dy + 90)} ${f1(dx)} ${f1(dy)}`;
  }
  const exitY = side === 'top' ? dy - 1 : dy + 1;
  // dressed: down out of the port, along under the server to the left-hand lane by the rack post, up the lane, along the
  // horizontal cable manager, then up to the switch port
  if (dressed) { const i = LANE[k], ly = 446 + i * 4, lx = 84 + i * 3, my = 240 - i * 3; return roundPath([[sx, sy], [sx, ly], [lx, ly], [lx, my], [dx, my], [dx, exitY]], 8); }
  return `M${f1(sx)} ${f1(sy)}C${f1(sx)} ${f1(sy - 110)} ${f1(dx)} ${f1(Math.max(dy + 150, 280))} ${f1(dx)} ${f1(exitY)}`;
}

/* ---- the scene ---- */
function swSvg(t, dev) {
  const D = DEVS[dev], y = D.y, sfp = D.cage === 'sfp';
  let g = `<rect x="92" y="${y}" width="716" height="44" rx="3" fill="#24292E" stroke="#0E1114"/><rect x="92" y="${y}" width="716" height="4" fill="#3A4148"/>`;
  g += `<text x="100" y="${y + 20}" style="font:800 11px var(--font);fill:#EAF2F7">${D.name}</text><text x="100" y="${y + 33}" style="font:500 7.5px var(--font);fill:#9AA9B5">${sfp ? '10/25G SFP28' : '1G RJ-45'}</text>`;
  for (let n = 1; n <= D.ports; n++) {
    const b = swPort(dev, n), a = `${dev}:${n}`, who = RUNS.find(r => t.cab[r.k] === a), link = who && cabOk(t, who.k) && (who.k === 'ilo' ? acOn(t) : isOn(t));
    const sel = t.cabSel && fitsCage(RUN[t.cabSel].kind, D.cage);
    g += sfp ? `<rect x="${f1(b.x)}" y="${f1(b.y)}" width="${b.w}" height="${b.h}" rx="1" fill="#0B0D0F" stroke="${sel ? '#5D6A75' : '#4A525A'}"/><rect x="${f1(b.x + 3)}" y="${f1(b.y + 3)}" width="${b.w - 6}" height="${b.h - 6}" fill="#15191C"/>`
      : `<rect x="${f1(b.x)}" y="${f1(b.y)}" width="${b.w}" height="${b.h}" rx="1" fill="#0B0D0F" stroke="${sel ? '#5D6A75' : '#4A525A'}"/><rect x="${f1(b.x + 6)}" y="${f1(n % 2 ? b.y + b.h - 3 : b.y)}" width="6" height="3" fill="#24292E"/>`;
    g += `<rect x="${f1(b.x + b.w - 4)}" y="${f1(n % 2 ? b.y - 3 : b.y + b.h + 1)}" width="3" height="2" fill="${link ? '#45D07F' : who ? '#E5A100' : '#3A4046'}"/>`;
    g += `<text x="${f1(b.x + b.w / 2 - 2)}" y="${f1(n % 2 ? b.y - 2 : b.y + b.h + 7.5)}" text-anchor="middle" style="font:700 6.4px var(--font);fill:#8794A0">${n}</text>`;
    g += `<g${hot('cabTo', a, `${D.name} port ${n}${who ? `: ${RUN[who.k].from} plugged in` : ''}`)}><rect x="${f1(b.x - 1.5)}" y="${f1(b.y - 1.5)}" width="${b.w + 3}" height="${b.h + 3}" rx="2" class="zone"/></g>`;
  }
  // uplinks (not for servers) and, on MGT01, the console port
  for (let k = 0; k < 4; k++) g += `<rect x="${730 + k * 18}" y="${y + 14}" width="15" height="16" rx="1.5" fill="#0B0D0F" stroke="#4A525A"/>`;
  g += `<text x="766" y="${y + 40}" text-anchor="middle" style="font:600 6.5px var(--font);fill:#8794A0">${sfp ? 'QSFP28 uplinks' : 'SFP uplinks'}</text>`;
  return g;
}
function pduSvg(t, dev) {
  const D = DEVS[dev], x = D.x, a = dev === 'PDUA';
  let g = `<rect x="${x}" y="64" width="32" height="420" rx="4" fill="#1D2125" stroke="${a ? '#D8462E' : '#2F78D6'}" stroke-width="2"/><text x="${x + 16}" y="80" text-anchor="middle" style="font:800 8.5px var(--font);fill:${a ? '#FF9A86' : '#8CC0FF'}">${D.name}</text>`;
  for (let n = 1; n <= 12; n++) {
    const b = pduOut(dev, n), ad = `${dev}:${n}`, who = RUNS.find(r => t.cab[r.k] === ad);
    g += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="3" fill="#0B0C0E" stroke="#3B4046"/><rect x="${b.x + 7}" y="${b.y + 6}" width="3" height="7" fill="#3B4046"/><rect x="${b.x + 14}" y="${b.y + 6}" width="3" height="7" fill="#3B4046"/><rect x="${b.x + 10.5}" y="${b.y + 14}" width="3" height="4" fill="#3B4046"/>`;
    g += `<text x="${a ? b.x - 3 : b.x + b.w + 3}" y="${b.y + 14}" text-anchor="${a ? 'end' : 'start'}" style="font:700 7px var(--font);fill:#8794A0">${n}</text>`;
    g += `<g${hot('cabTo', ad, `${D.name} outlet ${n}${who ? `: ${RUN[who.k].from} plugged in` : ''}`)}><rect x="${b.x - 2}" y="${b.y - 2}" width="${b.w + 4}" height="${b.h + 4}" rx="3" class="zone"/></g>`;
  }
  return g;
}
// a connector body at the destination end, and at the server end
function plugEnd(kind, x, y, side) {
  if (kind === 'power') return `<rect x="${f1(x - 10)}" y="${f1(y - 9)}" width="20" height="18" rx="3" fill="#1A1C1F" stroke="#4A5058"/>`;
  if (kind === 'dac') return `<rect x="${f1(x - 8)}" y="${f1(side === 'top' ? y - 5 : y - 5)}" width="16" height="10" rx="1.5" fill="#C9CFD4" stroke="#6E767D"/><rect x="${f1(x - 3)}" y="${f1(side === 'top' ? y + 4 : y - 8)}" width="6" height="5" fill="#8E979F"/>`;
  return `<rect x="${f1(x - 7)}" y="${f1(y - 5)}" width="14" height="10" rx="1.5" fill="#BFD7F2" stroke="#2E7BD6"/>`;
}
const flag = (x, y, txt, col) => `<g pointer-events="none"><rect x="${f1(x)}" y="${f1(y)}" width="${txt.length * 4.6 + 8}" height="11" rx="2" fill="#F7F3E6" stroke="${col}"/><text x="${f1(x + 4)}" y="${f1(y + 8.2)}" style="font:700 6.6px var(--mono);fill:#1A1A1A">${esc(txt)}</text></g>`;
function cabScene(t) {
  let g = `<rect x="60" y="54" width="780" height="640" rx="6" fill="#0F1418" stroke="#2A3540"/>`;
  // rack posts with U marks
  [70, 818].forEach(x => { g += `<rect x="${x}" y="58" width="12" height="632" fill="#2A3036"/>`; for (let yy = 66; yy < 690; yy += 8) g += `<rect x="${x + 3}" y="${yy}" width="6" height="4" rx="1" fill="#11161A"/>`; });
  g += pduSvg(t, 'PDUB') + pduSvg(t, 'PDUA') + swSvg(t, 'SW01') + swSvg(t, 'SW02') + swSvg(t, 'MGT01');
  // the horizontal cable manager below the switches, with its rings
  g += `<rect x="92" y="222" width="716" height="30" rx="3" fill="#1B2024" stroke="#0E1114"/><rect x="100" y="234" width="700" height="6" rx="3" fill="#0E1114"/>`;
  for (let x = 130; x < 800; x += 70) g += `<path d="M${x} 252v-24a7 7 0 0 1 14 0v24" fill="none" stroke="#3A4148" stroke-width="3"/>`;
  g += `<text x="450" y="249" text-anchor="middle" style="font:600 7px var(--font);fill:#6E7C88">horizontal cable manager</text>`;
  // the hook-and-loop straps on the dressed bundle: up the left-hand lane and along the cable manager
  const straps = () => { let s2 = ''; [300, 360, 420].forEach(y => { s2 += `<rect x="81" y="${y}" width="14" height="7" rx="2" fill="#2E2A55" stroke="#6C63D6" pointer-events="none"/>`; }); [150, 290].forEach(x => { s2 += `<rect x="${x}" y="230" width="7" height="14" rx="2" fill="#2E2A55" stroke="#6C63D6" pointer-events="none"/>`; }); return s2; };
  // the server: lid edge, rear panel (as in the Power and iLO view), its U position
  g += `<rect x="${CBP.x - 4}" y="${CBP.y - 10}" width="${f1(840 * CBP.s + 8)}" height="8" rx="2" fill="#5B636A"/>`;
  g += `<g transform="translate(${CBP.x} ${CBP.y}) scale(${CBP.s}) translate(${-RVC.x} ${-RVC.y})">${rearPanel(t)}</g>`;
  g += `<text x="450" y="${CBP.y - 16}" text-anchor="middle" style="font:700 9px var(--font);fill:#C9D3DB">${CABLOC.rack} ${CABLOC.u}-U${CABLOC.lo + 1}: ${CABLOC.name}, HPE ProLiant DL380 Gen11 (rear)</text>`;
  // the other units: blanking panels and a neighbour
  g += CABLOC.lo > 12 ? `<rect x="92" y="458" width="716" height="122" rx="3" fill="#1E2328" stroke="#0E1114"/><text x="450" y="523" text-anchor="middle" style="font:600 8px var(--font);fill:#5D6A75">U${CABLOC.lo - 2}-U${CABLOC.lo - 1}: another DL380 Gen11, not part of this job</text>`
    : `<rect x="92" y="458" width="716" height="38" rx="3" fill="#1A1E22" stroke="#0E1114"/><text x="450" y="481" text-anchor="middle" style="font:600 8px var(--font);fill:#5D6A75">U11: blanking panel</text><rect x="92" y="500" width="716" height="80" rx="3" fill="#1E2328" stroke="#0E1114"/><text x="450" y="544" text-anchor="middle" style="font:600 8px var(--font);fill:#5D6A75">U9-U10: other equipment, not part of this job</text>`;
  // server port zones: take a cable, or unplug it
  RUNS.forEach(r => {
    const [x, y] = SPORT[r.k], sel = t.cabSel === r.k, w = r.kind === 'power' ? 30 : 22, h = r.kind === 'power' ? 34 : 20;
    if (sel) g += `<rect x="${f1(x - w / 2 - 3)}" y="${f1(y - h / 2 - 3)}" width="${w + 6}" height="${h + 6}" rx="4" fill="none" stroke="#45D07F" stroke-width="2.5" stroke-dasharray="5 3" pointer-events="none"/>`;
    g += `<g${hot('cabFrom', r.k, `${r.from}: ${t.cab[r.k] ? `cabled to ${portTxt(t.cab[r.k])}, click to unplug` : 'take its cable'}`)}><rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${w}" height="${h}" rx="3" class="zone"/></g>`;
  });
  // the cables, drawn over the scene: power first (behind), then data and iLO
  ['ps1', 'ps2', 'ocp1', 'ocp2', 'ilo'].forEach(k => {
    if (!t.cab[k]) {
      if (t.cabSel === k) { const [x, y] = SPORT[k], r = RUN[k]; g += `<path d="M${f1(x)} ${f1(y)}c0 ${r.kind === 'power' ? 40 : -40} 26 ${r.kind === 'power' ? 60 : -60} 40 ${r.kind === 'power' ? 46 : -56}" fill="none" stroke="${CCOL[r.kind]}" stroke-width="${CW2[r.kind]}" stroke-linecap="round" opacity=".85" pointer-events="none"/>`; }
      return;
    }
    const r = RUN[k], ok = t.cab[k] === want(k), un = cabUn(t, k), [dx, dy, side] = destXY(t.cab[k]), [sx, sy] = un ? hangXY(t, k) : SPORT[k], d = cabPath(t, k), down = r.kind === 'power' || (t.cabDressed && routed(t));
    g += `<g pointer-events="none"><path d="${d}" fill="none" stroke="${r.kind === 'cat6' ? '#123B6B' : r.kind === 'dac' ? '#7A848D' : '#000'}" stroke-width="${CW2[r.kind] + 1.6}" stroke-linecap="round" opacity="${r.kind === 'dac' ? 0.7 : 0.55}"/><path d="${d}" fill="none" stroke="${CCOL[r.kind]}" stroke-width="${CW2[r.kind]}" stroke-linecap="round"/>${r.kind === 'power' ? '' : `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity=".18"/>`}`;
    g += plugEnd(r.kind, dx, dy, side) + (un ? `<g transform="rotate(${r.kind === 'power' ? 8 : -10} ${f1(sx)} ${f1(sy)})">${plugEnd(r.kind, sx, sy, 'bottom')}</g>` : plugEnd(r.kind, sx, sy, 'bottom'));
    if (!ok) g += `<circle cx="${f1(dx)}" cy="${f1(dy)}" r="13" fill="none" stroke="#FF6B5A" stroke-width="2.5" stroke-dasharray="4 3"/>`;
    if (t.cabLbl[k] && ok) { const tagCol = { ilo: '#2E7BD6', ocp1: '#E8873A', ocp2: '#8E6CD8', ps1: '#D8462E', ps2: '#2F78D6' }[k];
      g += flag(un ? sx - (r.role.length * 4.6 + 8) / 2 : sx + 10, un ? sy + (r.kind === 'power' ? 12 : 9) : sy + (r.kind === 'power' ? 30 : down ? 24 : -42), r.role, tagCol) + flag(side === 'side' ? (dx > 450 ? dx - 64 : dx + 18) : dx + 10, side === 'side' ? dy + 10 : side === 'top' ? dy - 30 : dy + 8, r.role, tagCol); }
    g += '</g>';
  });
  if (t.cabDressed && routed(t)) g += straps();
  g += `<text x="450" y="618" text-anchor="middle" class="ss">${t.cabSel ? `${RUN[t.cabSel].from} cable in hand: click the ${RUN[t.cabSel].kind === 'power' ? 'PDU outlet' : 'switch port'} it goes to (cable schedule below).` : 'Click a port on the server to take its cable, then the numbered port it goes to. Click a cabled server port to unplug it.'}</text>`;
  g += `<text x="450" y="636" text-anchor="middle" class="ss" style="font-size:10.5px">Switch ports: odd numbers on the top row, even numbers on the bottom row. PDU outlets: numbered from the top.</text>`;
  return g;
}
// the cable schedule: what goes where, and how it stands now
function schedHtml(t) {
  const row = r => { const at = t.cab[r.k], ok = cabOk(t, r.k);
    const st = !at ? '<span style="color:var(--muted)">not connected</span>' : cabUn(t, r.k) ? `<span style="color:var(--amber, #B26B00);font-weight:700">unplugged at the server, still in ${esc(portTxt(at))}</span>` : ok ? `<span style="color:var(--touch);font-weight:700">&#10003; connected${t.cabLbl[r.k] ? ', labelled' : ''}</span>` : `<span style="color:var(--red);font-weight:700">&#10007; in ${esc(portTxt(at))}</span>`;
    return `<tr><td><b>${esc(r.role)}</b></td><td>${esc(r.from)}</td><td><b>${esc(portTxt(want(r.k)))}</b></td><td>${esc(r.what)}</td><td>${st}</td></tr>`; };
  return `<div class="cabs"><h3>Cable schedule: ${CABLOC.rack} ${CABLOC.u}, ${CABLOC.name}</h3><table><tr><th>Role</th><th>From (server)</th><th>To</th><th>Cable</th><th>Now</th></tr>${RUNS.map(row).join('')}</table></div>`;
}
(() => {
  if (document.getElementById('hpe-cab-css')) return;
  const s = document.createElement('style'); s.id = 'hpe-cab-css';
  s.textContent = `.cabs{margin-top:10px;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 12px;overflow-x:auto}
.cabs h3{margin:0 0 6px;font-size:15px}.cabs table{border-collapse:collapse;width:100%;font-size:12.5px;min-width:560px}
.cabs th{text-align:left;color:var(--muted);font-weight:600;border-bottom:1px solid var(--line);padding:4px 6px}.cabs td{padding:5px 6px;border-bottom:1px solid var(--line);vertical-align:top}`;
  Sim.addCss(s);
})();

Sim.registerView({
  id: 'cable', title: 'Cabling (rear of the rack)',
  keep: [
    ['Follow the cable schedule', 'Every cable has its exact port in the work order. A cable in the wrong switch port lands in the wrong network (VLAN), or in a port that is shut down.'],
    ['Odd up, even down', 'On most switches, port 1 is top left and port 2 below it: odd numbers on the top row, even numbers on the bottom row.'],
    ['Two feeds, two switches', 'PS1 to PDU A and PS2 to PDU B; OCP 15 port 1 to SW01 and port 2 to SW02. One feed or one switch can fail and the server stays up and reachable.'],
    ['The right cable for the cage', 'RJ-45 Cat 6 for the 1 Gb iLO port; SFP+ DAC (or optics with fibre) for the 10 Gb OCP ports. An RJ-45 plug does not fit an SFP28 cage.'],
    ['Data before power', 'Connect and check the network cables first, the power cords last: the server comes up with its links ready.'],
    ['Label both ends', 'Rack and unit, server, port, the far end and the role, at both ends of every cable.'],
    ['Dress the cables', 'Route the data and iLO cables up through the horizontal cable manager and strap them; keep the power cords apart along the PDUs.'],
    ['Maintenance: unplug at the server', 'To take the server out of the rack, unplug its cables at the server only: power cords first, then data and iLO. The switch and PDU ends stay in their ports with their labels, so every cable goes back exactly where it was: data and iLO first, power last.']],
  render(t) { return frame('Rear of the rack: cable the server to the switches and the PDUs', cabScene(t), 650) + schedHtml(t); },
  actions(t) {
    const a = [];
    if (t.cabSel) a.push(button('Put the cable down', 'cabFrom', t.cabSel));
    a.push(button('Fit the printed labels at both ends', 'cabLabel'));
    a.push(button(t.cabDressed ? 'Undo the cable straps' : 'Dress the cables: cable manager and straps', 'cabDress'));
    return a;
  },
  tray(t) {
    return `<h2>Work order: cabling</h2><table class="dec">${RUNS.map(r => `<tr><td>${esc(r.short)}</td><td><b>${esc(portTxt(want(r.k)))}</b></td></tr>`).join('')}</table>
<h3>Cables on the cart</h3><ul class="rules">${[...new Set(RUNS.map(r => r.what))].map(w => `<li>${esc(w)}</li>`).join('')}</ul>
<h3>Label format</h3><p class="cap" style="font-size:12.5px;font-family:var(--mono)">${esc(labelTxt('ocp1', 0))}</p><p class="cap" style="font-size:12.5px">Rack and unit, server, its port | the far end | role. The far end carries the same label the other way round.</p>
<h3>Devices</h3><table class="dec">${Object.values(DEVS).map(d => `<tr><td>${esc(d.name)}</td><td>${esc(d.what)}</td></tr>`).join('')}</table>`;
  }
});

/* ---- actions ---- */
// power to one supply follows its cord: standby, iLO starting, or lost
function setAc(k, on) {
  T.ac[k] = on;
  if (on) { Sim.sound('plug'); if (!T.acAt || !T.flags.iloUp) { T.acAt = Date.now(); T.flags.iloUp = false; } }
  syncPower(T);
  if (!acOn(T)) { T.acAt = 0; T.flags.iloUp = false; T.posted = false; }
}
const syncLinks = () => { T.mgmtLink = cabOk(T, 'ilo'); };
Sim.on('cabFrom', k => {
  if (!RUN[k]) return;
  if (T.cab[k] && cabUn(T, k)) {
    if (T.cabSel) return say('warn', `Put down the ${RUN[T.cabSel].from} cable in your hand first.`);
    if (T.rack.pos !== 'in') return bad(`The server is extended on its rails: slide it back into the rack first, then plug the ${RUN[k].from} cable back in.`);
    if (RUN[k].kind === 'power' && T.cover !== 'closed') return bad('Close the access panel before you connect power.');
    T.cabOff[k] = false;
    if (RUN[k].kind === 'power') setAc(k, true); else Sim.sound('snap');
    syncLinks();
    return say('ok', `${RUN[k].from} cable plugged back in at the server: its far end is still in ${portTxt(T.cab[k])}.${RUN[k].kind === 'power' ? (T.power === 'standby' ? ' The power LED is amber: standby, and iLO starts.' : '') : k === 'ilo' ? (acOn(T) ? ' The link LEDs light: iLO is on the management network again.' : ' The link comes up when the server has standby power.') : ' The link comes up when the server is running.'}${RUNS.every(r => cabOk(T, r.k)) ? ' All five cables are back in place.' : ''}`);
  }
  if (T.cab[k] && T.cab[k] === want(k)) {
    const live = RUN[k].kind === 'power' && isOn(T) && T.ac[k === 'ps1' ? 'ps2' : 'ps1'] === false;
    if (T.cabSel) T.cabSel = null;
    T.cabOff = T.cabOff || {}; T.cabOff[k] = true;
    if (RUN[k].kind === 'power') setAc(k, false); else Sim.sound('clipOpen');
    syncLinks();
    if (live) return bad(`${RUN[k].from} cable unplugged while the server was running: it lost power without a shutdown. Shut it down first with the power button, then unplug.`);
    return say('info', `${RUN[k].from} cable unplugged at the server. Its other end stays in ${portTxt(T.cab[k])}, label on: it hangs at the rear of the rack until you plug it back in.${RUN[k].kind === 'power' && acOn(T) ? ' The server runs on the other supply: redundancy is lost.' : RUN[k].kind === 'power' ? ' The server has no power.' : k === 'ilo' ? ' iLO is off the management network.' : ''}`);
  }
  if (T.cab[k]) {
    const was = T.cab[k], live = RUN[k].kind === 'power' && isOn(T) && T.ac[k === 'ps1' ? 'ps2' : 'ps1'] === false;
    T.cab[k] = null; T.cabLbl[k] = false; T.cabSel = null;
    if (RUN[k].kind === 'power') setAc(k, false); else Sim.sound('clipOpen');
    if (live) { syncLinks(); return bad(`${RUN[k].from} cable unplugged while the server was running: it lost power without a shutdown. Shut it down first with the power button, then unplug.`); }
    syncLinks();
    return say('info', `${RUN[k].from} cable unplugged from ${portTxt(was)}.${RUN[k].kind === 'power' && acOn(T) ? ' The server runs on the other supply: redundancy is lost.' : RUN[k].kind === 'power' ? ' The server has no power.' : ''}`);
  }
  if (T.cabSel === k) { T.cabSel = null; return say('info', 'Cable put down.'); }
  if (RUN[k].kind === 'power' && T.cover !== 'closed') return bad('Close the access panel before you connect power.');
  T.cabSel = k;
  say('info', `${RUN[k].what} plugged into ${RUN[k].from} on the server. Now click the ${RUN[k].kind === 'power' ? 'PDU outlet' : 'switch port'} it goes to: the cable schedule says ${portTxt(want(k))}.`);
});
Sim.on('cabTo', a => {
  const k = T.cabSel, [dev, n] = a.split(':'), D = DEVS[dev];
  const who = RUNS.find(r => T.cab[r.k] === a);
  if (!k) return say('info', who ? `${portTxt(a)}: ${RUN[who.k].from} is plugged in here. To unplug it, click its port on the server.` : `${portTxt(a)}: free. Take a cable from the server first: click one of its ports.`);
  const r = RUN[k];
  if (!fitsCage(r.kind, D.cage)) return bad(`${kindTxt[r.kind][0].toUpperCase() + kindTxt[r.kind].slice(1)} does not fit ${cageTxt[D.cage]}: ${portTxt(a)} is on ${devName(dev)} (${D.what}). The ${r.from} cable goes to ${portTxt(want(k))}.`);
  if (who) return bad(`${portTxt(a)} is taken: ${RUN[who.k].from} is plugged in there.`);
  T.cab[k] = a; T.cabSel = null;
  if (r.kind === 'power') setAc(k, true); else Sim.sound('snap');
  syncLinks();
  if (a !== want(k)) {
    const why = dev !== RUN[k].dev ? (r.kind === 'power' ? `${devName(dev)} is the other feed: ${r.short} belongs on ${devName(RUN[k].dev)}, so the two supplies stay on different feeds.` : `${devName(dev)} is the other switch: ${r.short} belongs on ${devName(RUN[k].dev)}, so the two data ports stay on different switches.`)
      : r.kind === 'power' ? `the schedule gives outlet ${RUN[k].port}: the outlets are counted for each server, so the PDU load stays planned.` : `port ${n} is not assigned to this server (another VLAN, or shut down).${k === 'ilo' ? ' iLO gets no link to the management network there.' : ''}`;
    return bad(`Plugged into ${portTxt(a)}, but the cable schedule says ${portTxt(want(k))}: ${why} Click the server's ${r.short} port to unplug it, then plug it into ${portTxt(want(k))}.`);
  }
  say('ok', `${r.from} cabled to ${portTxt(a)}.${k === 'ilo' ? (acOn(T) ? ' The link LEDs light: iLO is on the management network.' : ' The link comes up as soon as the server has standby power.') : r.kind === 'power' ? ` ${T.power === 'standby' ? 'The power LED is amber: standby, and iLO starts.' : ''}` : ' The link comes up when the server is running.'}${allIn(T) ? ' All five cables are in place.' : ''}`);
});
Sim.on('cabLabel', () => {
  const ok = RUNS.filter(r => cabOk(T, r.k)), wrong = RUNS.filter(r => T.cab[r.k] && !cabOk(T, r.k));
  if (!ok.length) return bad('Connect the cables first: the labels name both ends.');
  if (wrong.length) return bad(`Fix the cable${wrong.length > 1 ? 's' : ''} in the wrong port first (${wrong.map(r => r.short).join(', ')}): a label on a wrong cable is worse than none.`);
  ok.forEach(r => { T.cabLbl[r.k] = true; }); Sim.sound('velcro');
  const left = RUNS.filter(r => !T.cab[r.k]);
  say(left.length ? 'info' : 'ok', `Printed labels fitted at both ends of ${ok.length} cable${ok.length > 1 ? 's' : ''}, for example "${labelTxt(ok[0].k, 0)}".${left.length ? ` Still to connect and label: ${left.map(r => r.short).join(', ')}.` : ''}`);
});
Sim.on('cabDress', () => {
  if (T.cabDressed) { T.cabDressed = false; return say('info', 'Cable straps undone: the cables hang loose again.'); }
  if (!allIn(T)) return bad('Connect all five cables to their ports first, then dress them.');
  T.cabDressed = true; Sim.sound('velcro');
  say('ok', 'Data and iLO cables routed up through the horizontal cable manager and strapped with hook-and-loop ties; the power cords run apart, along the PDUs. Nothing hangs in front of the fans.');
});
