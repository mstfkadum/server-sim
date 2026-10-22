/* ---- Processor 2 replacement, reusing its heatsink (the Processors view when t.rep is set). The high-performance
   heatsink of this server: the main block under a black processor carrier, two copper heat pipes to a T-bar with two
   remote fin stacks, four captive T-30 Torx screws with an anti-tilt wire beside each, a release lever along the carrier
   edge on the heat-pipe side, the pin 1 triangle on the carrier. Drawn from HPE's service video frames supplied by the
   trainer (not embedded): the module base up on the mat, the processor's contacts in the carrier, the lever opened,
   the old grease on the copper base, the base cleaned, the grease pattern on the new processor, the triangles.
   Procedure (the trainer's): wires up to vertical (no click); screws loosened in a cross order; module lifted, processor
   attached; lever pulled (the processor rises); clips pressed, processor out; old processor away; base cleaned until
   shiny with the HPE-recommended kit; grease on the new processor; triangles lined up; lever closed; processor pushed in
   until it clicks; module lowered; wires clipped; screws tightened in a cross order.
   A new install (mode 'install', the new build) works the same way with what differs for a new processor: the processor
   blank and the socket cover come off socket 2 first (kept), the new heatsink comes with its carrier fitted and its
   thermal pad pre-applied under a protective film (peeled, no cleaning and no grease), and there is no old processor.
   © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved. ---- */
const newRep = (mode = 'replace') => mode === 'install'
  ? { mode, w: [false, false, false, false], last: -1, at: 'mat', lever: 'closed', old: 'none', paste: 0, film: true, nw: 'tray', grease: 0, rot: 0, tool: null, kept: {} }
  : { mode, w: [true, true, true, true], last: -1, at: 'socket', lever: 'closed', old: 'in', paste: 4, film: false, nw: 'tray', grease: 0, rot: 0, tool: null, kept: {} };
const isInst = r => r.mode === 'install';
// the new processor is ready to go in: out of its tray (and, when the heatsink is reused, greased)
const ready = r => r.nw === 'mat' && (isInst(r) || r.grease >= 3);
// a saved state from before this view: a new install, finished if processor 2 is already in and screwed down
function repOf(t) {
  if (t.rep) return t.rep;
  const r = t.rep = newRep('install');
  if (t.sock2 === 'phm' && t.nuts2.every(Boolean)) Object.assign(r, { at: 'socket', nw: 'in', film: false, w: [true, true, true, true] });
  return r;
}
const NPART = [1, 0, 3, 2];                                     // the screw diagonally opposite each one (1-2, 3-4)
const REPTOOLS = [
  { k: 't30', name: 'T-30 Torx screwdriver', sub: 'T30 on the heatsink label' },
  { k: 't15', name: 'T-15 Torx screwdriver', sub: 'drive screws' },
  { k: 'ph2', name: 'Phillips #2 screwdriver', sub: 'cross head' },
  { k: 'clean', name: 'Cleaning kit (HPE)', sub: 'alcohol wipes, lint-free cloth' },
  { k: 'towel', name: 'Paper towel', sub: 'dry' },
  { k: 'grease', name: 'Thermal grease syringe', sub: 'from the processor kit' }];
const toolName = k => (REPTOOLS.find(x => x.k === k) || { name: k }).name;
const repDone = t => !!t.rep && t.rep.nw === 'in' && t.rep.at === 'socket' && t.rep.w.every(Boolean) && t.nuts2.every(Boolean);
const cpuBad = t => !!t.rep && t.rep.nw !== 'in';
// the next screw in a cross order: after an odd number, the one diagonally opposite the last; else the first left
const crossNext = (t, want) => { const r = t.rep, n = t.nuts2.filter(x => !!x === want).length; return n % 2 && r.last >= 0 ? NPART[r.last] : t.nuts2.findIndex(x => !!x !== want); };
// where things go: the mat, the module (origin at the carrier centre, mm), the work spot, the kit tray, the return box,
// the tool tray
const RP = { mat: [14, 540, 872, 414], phm: { x: 258, y: 752, s: 2.35 }, spot: { x: 601, y: 686, s: 2.0 }, kit: [508, 800, 90, 140], box: [606, 800, 90, 140], tools: { x: 708, y: 574, h: 61 } };
const rpS = (x, y) => [RP.phm.x + x * RP.phm.s, RP.phm.y + y * RP.phm.s];

const RPDEFS = `<defs>
<linearGradient id="rpBody" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#737B82"/><stop offset=".1" stop-color="#C5CBD0"/><stop offset=".5" stop-color="#A7AEB4"/><stop offset=".9" stop-color="#CBD0D4"/><stop offset="1" stop-color="#6F777E"/></linearGradient>
<linearGradient id="rpBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDE2E5"/><stop offset=".5" stop-color="#ADB4BA"/><stop offset="1" stop-color="#7A828A"/></linearGradient>
<pattern id="rpFin" width="1.1" height="9" patternUnits="userSpaceOnUse"><rect width="1.1" height="9" fill="#8E969D"/><rect width=".42" height="9" fill="#4B535A"/><rect x=".42" width=".24" height="9" fill="#E1E5E8"/></pattern>
<linearGradient id="rpCu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A45A27"/><stop offset=".32" stop-color="#E0A06A"/><stop offset=".55" stop-color="#C58049"/><stop offset=".78" stop-color="#EDB689"/><stop offset="1" stop-color="#9A5323"/></linearGradient>
<pattern id="rpBrush" width="54" height=".9" patternUnits="userSpaceOnUse"><rect width="54" height=".9" fill="none"/><rect width="54" height=".22" fill="#FFFFFF" opacity=".09"/></pattern>
<linearGradient id="rpPipe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6E3612"/><stop offset=".32" stop-color="#ECA56C"/><stop offset=".55" stop-color="#C47A3A"/><stop offset="1" stop-color="#673210"/></linearGradient>
<pattern id="rpRib" width="2.6" height="2.6" patternUnits="userSpaceOnUse"><rect width="2.6" height="2.6" fill="#0C0E0F"/><rect x=".38" y=".38" width="1.84" height="1.84" rx=".2" fill="#1A1D20"/><rect x=".38" y=".38" width="1.84" height=".32" fill="#272B2F"/></pattern>
<radialGradient id="rpBoss" cx=".38" cy=".34" r=".72"><stop offset="0" stop-color="#F3F5F6"/><stop offset=".55" stop-color="#B7BDC2"/><stop offset="1" stop-color="#6C747B"/></radialGradient>
<pattern id="rpLand" width="1.05" height="1.05" patternUnits="userSpaceOnUse"><rect width="1.05" height="1.05" fill="#857041"/><circle cx=".525" cy=".525" r=".37" fill="#E0C47A"/><circle cx=".45" cy=".44" r=".13" fill="#F8E9B8"/></pattern>
<pattern id="rpChan" width=".9" height="1.4" patternUnits="userSpaceOnUse"><rect width=".9" height="1.4" fill="#1E3B47"/><rect x=".2" y=".16" width=".5" height=".56" rx=".1" fill="#8DB1BD"/></pattern>
<linearGradient id="rpLid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E6E8E9"/><stop offset=".42" stop-color="#C2C6C8"/><stop offset=".68" stop-color="#D7DADC"/><stop offset="1" stop-color="#A1A6A9"/></linearGradient>
<pattern id="rpPad" width="1.2" height="1.2" patternUnits="userSpaceOnUse"><rect width="1.2" height="1.2" fill="#6C7379"/><circle cx=".4" cy=".5" r=".22" fill="#7E868C"/><circle cx=".95" cy=".95" r=".18" fill="#5E656B"/></pattern>
<pattern id="rpPaste" width="1.6" height="1.6" patternUnits="userSpaceOnUse"><rect width="1.6" height="1.6" fill="#9CA3A8"/><circle cx=".42" cy=".5" r=".3" fill="#BAC0C4"/><circle cx="1.15" cy="1.12" r=".24" fill="#858C91"/></pattern>
<linearGradient id="rpSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF" stop-opacity="0"/><stop offset=".42" stop-color="#FFF" stop-opacity="0"/><stop offset=".5" stop-color="#FFF" stop-opacity=".5"/><stop offset=".58" stop-color="#FFF" stop-opacity="0"/><stop offset=".78" stop-color="#FFF" stop-opacity="0"/><stop offset=".83" stop-color="#FFF" stop-opacity=".25"/><stop offset=".88" stop-color="#FFF" stop-opacity="0"/></linearGradient>
<linearGradient id="rpSyr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9ECEE"/><stop offset=".5" stop-color="#B4BABF"/><stop offset="1" stop-color="#8A9196"/></linearGradient>
</defs>`;

/* ---- the processor, in mm, centred: its contacts (lands) side, or its lid ---- */
function cpuLand(rot) {
  let g = `<g transform="rotate(${rot})"><rect x="-28.25" y="-38.75" width="56.5" height="77.5" rx="1.2" fill="#1F4A3C" stroke="#0E281F" stroke-width=".35"/>`;
  g += `<rect x="-27.3" y="-37.8" width="54.6" height="75.6" rx=".8" fill="url(#rpLand)"/><path d="M-27.3 -4H27.3" stroke="#3A311E" stroke-width=".4"/>`;
  [[-6.6, 3.5], [3.4, 3.6]].forEach(([x, w]) => { g += `<rect x="${x}" y="-13.5" width="${w}" height="26" rx=".4" fill="url(#rpChan)" stroke="#11252D" stroke-width=".3"/>`; });
  // pin 1: the gold triangle at its corner
  g += `<path d="M-28.25 -38.75h6.8l-6.8 6.8z" fill="#F2CF63" stroke="#86651C" stroke-width=".25"/>`;
  return g + `</g>`;
}
// the lid (integrated heat spreader) side: seen from above it is the mirror of the contacts side, so pin 1 sits at the
// other top corner. old: grease left on it; grease: the strokes of new grease, the newest drawn in
function cpuLid(rot, old, grease, gA) {
  let g = `<g transform="rotate(${rot})"><rect x="-28.25" y="-38.75" width="56.5" height="77.5" rx="1.2" fill="#1F4A3C" stroke="#0E281F" stroke-width=".35"/>`;
  g += `<path d="M-25.8 -36.6H-11l1 -1.4H9.8l1 1.4H25.8V36.6H11l-1 1.4H-10l-1 -1.4H-25.8Z" fill="url(#rpLid)" stroke="#7B8285" stroke-width=".3"/>`;
  g += `<path d="M-24.6 -35.4H24.6V35.4H-24.6Z" fill="none" stroke="#FFFFFF" stroke-opacity=".35" stroke-width=".3"/>`;
  // the laser marking, along the long side
  g += `<g transform="rotate(90)" style="font:700 2.5px var(--font);fill:#8D9396">${['INTEL XEON GOLD 6430', '32C 2.10GHZ 270W', 'LGA4677'].map((s, n) => `<text x="-15" y="${-6 + n * 4}">${s}</text>`).join('')}</g>`;
  g += `<rect x="-20" y="17" width="5" height="5" fill="none" stroke="#8D9396" stroke-width=".4"/><path d="M-19 18h1v1h1v1h-2zM-17 20h1v1h-1z" fill="#8D9396"/>`;
  g += `<path d="M28.25 -38.75h-5.6l5.6 5.6z" fill="#F2CF63" stroke="#86651C" stroke-width=".25"/>`;
  if (old) g += `<path d="M-19 -26c6 -4 18 -3 26 -1c6 2 9 8 7 16c-1 8 3 14 -2 22c-5 7 -16 9 -25 6c-8 -3 -11 -10 -10 -19c1 -8 -3 -18 4 -24z" fill="url(#rpPaste)" opacity=".86"/><path d="M-10 -14c4 -2 9 -1 12 1M-6 6c5 -1 9 0 12 2" stroke="#C5CACD" stroke-width=".6" fill="none" opacity=".7"/>`;
  [-19, 0, 19].slice(0, grease).forEach((y, n) => {
    const last = n === grease - 1 && gA < 0.6, d = `M-14 ${y}c3 -2.6 7 2.4 10.5 0s7 -2.6 10.5 0s4 1.6 5.5 .6`;
    const an = last ? ` stroke-dasharray="40" stroke-dashoffset="40"><animate attributeName="stroke-dashoffset" values="40;0" dur="0.55s" begin="-${gA.toFixed(2)}s" fill="freeze"/></path>` : '/>';
    g += `<path d="${d}" fill="none" stroke="#5E656A" stroke-width="4.6" stroke-linecap="round"${an}<path d="${d}" fill="none" stroke="#9AA1A6" stroke-width="3.6" stroke-linecap="round"${an}<path d="${d}" fill="none" stroke="#D2D7DA" stroke-width="1.1" stroke-linecap="round" transform="translate(-.5 -.8)"${an}`;
  });
  return g + `</g>`;
}

/* ---- the module base up on the mat (mm, origin at the carrier centre, the heat pipes and the T-bar toward you) ---- */
const BOSS = [[-31, -47], [31, -47], [-31, 45], [31, 45]];
const CLIPS = [[-31.6, -22], [-31.6, 22], [31.6, -22], [31.6, 22]];
function finStack(x0, y0) {
  let g = `<rect x="${x0}" y="${y0}" width="60" height="20" rx=".8" fill="#5E666D"/><rect x="${x0 + .6}" y="${y0 + .6}" width="58.8" height="8.8" fill="url(#rpFin)"/><rect x="${x0 + .6}" y="${y0 + 10.6}" width="58.8" height="8.8" fill="url(#rpFin)"/>`;
  return g + `<rect x="${x0}" y="${y0 + 9.4}" width="60" height="1.2" fill="#3E454B"/><rect x="${x0}" y="${y0}" width="1.4" height="20" fill="#3E454B"/><rect x="${x0 + 58.6}" y="${y0}" width="1.4" height="20" fill="#3E454B"/>`;
}
function pasteArt(p, a) {
  if (p <= 0) return `<rect x="-27" y="-37.5" width="54" height="75" rx="2" fill="url(#rpSheen)"/>`;
  let g = '';
  const op = [0, .3, .62, .8, .94][p];
  if (p >= 3) g += `<rect x="-27" y="-37.5" width="54" height="75" rx="2" fill="url(#rpPaste)" opacity="${op}"/>`;
  if (p === 4) g += `<rect x="-24.6" y="-35.2" width="49.2" height="70.4" rx="1.2" fill="#AEB4B8" opacity=".35"/><path d="M-18 -24c5 -3 11 2 16 -1s9 2 14 0M-20 -6c6 -2 12 3 18 0s10 1 16 -1M-16 12c5 -3 10 2 15 -1s8 2 13 0M-14 26c6 -2 10 2 16 0" stroke="#8A9196" stroke-width="1.1" fill="none" opacity=".75"/><path d="M-26 -20q3 6 0 12M26 4q-3 6 0 12M-6 -36q6 2 12 0M-8 36q6 -2 14 0" stroke="#C4CACD" stroke-width="2.2" fill="none" opacity=".8"/>`;
  if (p === 3) g += `<path d="M-20 -30l30 34M-12 -34l32 38M-24 -10l26 32" stroke="url(#rpCu)" stroke-width="5" stroke-linecap="round" opacity=".9"/>`;
  if (p === 2) g += `<path d="M-27 -37.5h54v75h-54z M-21 -31v62h42v-62z" fill="url(#rpPaste)" fill-rule="evenodd" opacity=".85"/><path d="M-20 -24c8 -3 14 2 20 -1M-6 14c6 -2 12 1 18 -1" stroke="#A3AAAF" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`;
  if (p === 1) g += `<rect x="-27" y="-37.5" width="54" height="75" rx="2" fill="none" stroke="#A3AAAF" stroke-width="2.2" opacity=".55"/><rect x="-27" y="-37.5" width="54" height="75" rx="2" fill="#B9BFC3" opacity=".16"/>`;
  // the residue thicker at the edges, as in the photo
  if (p >= 2) g += `<rect x="-27" y="-37.5" width="54" height="75" rx="2" fill="none" stroke="#B3B9BD" stroke-width="${p * .9}" opacity=".8"/>`;
  // the last wipe sweeping across
  if (a < 0.7) g += `<rect x="-30" y="-8" width="60" height="16" fill="#FFFFFF" opacity=".18"><animateTransform attributeName="transform" type="translate" values="0 -34;0 34" dur="0.65s" begin="-${a.toFixed(2)}s" fill="freeze"/><animate attributeName="opacity" values=".25;0" dur="0.65s" begin="-${a.toFixed(2)}s" fill="freeze"/></rect>`;
  return g;
}
function padArt(film, a) {
  let g = `<rect x="-24.5" y="-34.5" width="49" height="69" rx="2.4" fill="url(#rpPad)" stroke="#4E555B" stroke-width=".35"/><rect x="-24.5" y="-34.5" width="49" height="69" rx="2.4" fill="url(#rpSheen)" opacity=".35"/>`;
  if (film || a < 0.6) g += `<g>${!film ? `<animateTransform attributeName="transform" type="translate" values="0 0;22 -30" dur="0.55s" begin="-${a.toFixed(2)}s" fill="freeze"/><animate attributeName="opacity" values="1;0" dur="0.55s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : ''}<rect x="-26" y="-36" width="52" height="72" rx="2.4" fill="#9FD3F0" fill-opacity=".33" stroke="#6FB7E9" stroke-width=".6"/><path d="M20 -36l7 -6h5v6l-6 6z" fill="#CFE9F8" stroke="#6FB7E9" stroke-width=".5"/><text x="0" y="-27" text-anchor="middle" style="font:700 3.2px var(--font);fill:#14202B">REMOVE BEFORE INSTALLING</text><path d="M-20 18l40 -10M-20 26l40 -10" stroke="#FFFFFF" stroke-opacity=".35" stroke-width=".8"/></g>`;
  return g;
}
function phmMat(t) {
  const r = t.rep, P = RP.phm, la = fxAge('rpLever'), sa = fxAge('rpSeat');
  let g = `<g transform="translate(${P.x} ${P.y}) scale(${P.s})">`;
  g += `<rect x="-47" y="-60" width="94" height="118" rx="3" fill="#000" opacity=".35" transform="translate(2 3)"/><rect x="-98" y="60" width="196" height="20" rx="2" fill="#000" opacity=".3" transform="translate(2 3)"/>`;
  // T-bar with the two remote fin stacks, the brackets, the heat pipes
  g += finStack(-98, 60) + finStack(38, 60) + `<rect x="-40" y="64" width="80" height="6.5" rx=".6" fill="url(#rpBar)" stroke="#5F676E" stroke-width=".3"/>`;
  g += `<path d="M-23 57h12l3 7h-18z M11 57h12l3 7h-18z" fill="#C6CBCF" stroke="#7B838A" stroke-width=".3"/>`;
  [-1, 1].forEach(s => { const d = `M${s * 5.5} 50C${s * 5.5} 59 ${s * 11} 60 ${s * 13} 66.5`; g += `<path d="${d}" fill="none" stroke="#4E2609" stroke-width="5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#rpPipe)" stroke-width="4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#F6C08F" stroke-width=".9" stroke-linecap="round" transform="translate(${-s * .9} 0)" opacity=".85"/>`; });
  // the main heatsink block, its base edge, then the black processor carrier with its ribs
  g += `<rect x="-47" y="-60" width="94" height="118" rx="2.2" fill="url(#rpBody)" stroke="#545C63" stroke-width=".4"/>`;
  g += `<rect x="-43.5" y="-57" width="87" height="112" rx="2.2" fill="url(#rpRib)" stroke="#040505" stroke-width=".5"/>`;
  [-40, -20, 0, 20, 40].forEach(y => { g += `<rect x="-45" y="${y - 2.5}" width="2" height="5" fill="#0A0B0C"/><rect x="43" y="${y - 2.5}" width="2" height="5" fill="#0A0B0C"/>`; });
  // the opening: the silver base around the copper contact plate
  g += `<rect x="-31" y="-41.5" width="62" height="83" rx="1.4" fill="#B9BFC4" stroke="#3B4146" stroke-width=".4"/><rect x="-29.6" y="-40.1" width="59.2" height="80.2" rx="1.2" fill="none" stroke="#E7EAEC" stroke-width=".35" opacity=".7"/>`;
  g += `<rect x="-27" y="-37.5" width="54" height="75" rx="2" fill="url(#rpCu)"/><rect x="-27" y="-37.5" width="54" height="75" rx="2" fill="url(#rpBrush)"/>`;
  g += isInst(r) ? padArt(r.film, fxAge('rpFilm')) : pasteArt(r.paste, fxAge('rpWipe'));
  // the screw bosses at the corners, each with its anti-tilt wire (standing up while the module is out)
  BOSS.forEach(([x, y]) => {
    const dy = y < 0 ? -1 : 1, dx = x < 0 ? -1 : 1;
    g += `<circle cx="${x}" cy="${y}" r="5.4" fill="#070809"/><circle cx="${x}" cy="${y}" r="4.4" fill="url(#rpBoss)" stroke="#5A6269" stroke-width=".35"/><circle cx="${x}" cy="${y}" r="3.2" fill="none" stroke="#868E95" stroke-width=".55"/><circle cx="${x}" cy="${y}" r="2.1" fill="#1A1D20"/><path d="M${x - 1} ${y - 1.4}l1 -0.8l1 .8l.4 1.2l-1.4 1.1l-1.4 -1.1z" fill="#3A3F44"/>`;
    const wd = `M${x + dx * 3.6} ${y + dy * 2}q${dx * 3} ${dy * 3} ${dx * 1.2} ${dy * 7}q-${dx * 1.6} ${dy * 2.4} -${dx * 3.6} ${dy * .8}`;
    g += `<path d="${wd}" fill="none" stroke="#596168" stroke-width="1.2" stroke-linecap="round"/><path d="${wd}" fill="none" stroke="#DCE0E3" stroke-width=".6" stroke-linecap="round"/>`;
  });
  // pin 1: the triangle on the carrier, at the end away from the heat pipes
  g += `<path d="M-24.5 -55.6h7l-7 7z" fill="#CDD1D4" stroke="#7E858B" stroke-width=".25"/>`;
  // the processor's small retention clips at the sides of the opening
  const clipHi = r.old === 'raised' && Sim.guide;
  CLIPS.forEach(([x, y]) => { g += `<rect x="${x - 1.4}" y="${y - 3.2}" width="2.8" height="6.4" rx=".5" fill="#0A0B0C" stroke="${clipHi ? CUE : '#3A3F44'}" stroke-width="${clipHi ? .7 : .3}"/>`; });
  // the processor in the carrier: the old one (raised a little once the lever is open) or the new one
  if (r.old === 'in' || r.old === 'raised') {
    const up = r.old === 'raised', anim = la < 0.6 ? `<animateTransform attributeName="transform" type="translate" values="${up ? '0 0;-1.4 -2' : '-1.4 -2;0 0'}" dur="0.5s" begin="-${la.toFixed(2)}s" fill="freeze"/>` : '';
    if (up) g += `<rect x="-28.25" y="-38.75" width="56.5" height="77.5" rx="1.2" fill="#000" opacity=".45" transform="translate(1 1.6)"/>`;
    g += `<g transform="${anim ? '' : up ? 'translate(-1.4 -2)' : ''}">${anim}${cpuLand(0)}</g>`;
  } else if (r.nw === 'in') {
    const anim = sa < 0.5 ? `<animateTransform attributeName="transform" type="scale" values="1.05;1" dur="0.3s" begin="-${sa.toFixed(2)}s" fill="freeze"/>` : '';
    g += `<g>${anim}${cpuLand(0)}</g>`;
  } else if (ready(r) && Sim.guide) {
    // the new processor's place, outlined (guidance): where it goes, triangle to triangle
    g += `<rect x="-28.25" y="-38.75" width="56.5" height="77.5" rx="1.2" fill="none" stroke="${CUE}" stroke-width=".6" stroke-dasharray="2.2 1.6" opacity=".9"/>`;
  }
  // the release lever, along the carrier edge on the heat-pipe side: flat (closed) or pulled up about its pivot
  const open = r.lever === 'open', lv = `<path d="M-17 46.4V51H16" fill="none" stroke="#3E454B" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M-17 46.4V51H16" fill="none" stroke="#DCE1E4" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round"/>`;
  const lanim = la < 0.45 ? `<animateTransform attributeName="transform" type="rotate" values="${open ? '0 16 51;-18 16 51' : '-18 16 51;0 16 51'}" dur="0.4s" begin="-${la.toFixed(2)}s" fill="freeze"/>` : '';
  g += `<rect x="13.6" y="48.6" width="5.4" height="5" rx=".6" fill="#9AA2A9" stroke="#4E565D" stroke-width=".3"/>`;
  if (open) g += `<g transform="rotate(-18 16 51) translate(1.6 2.6)" opacity=".4">${lv.replace(/#DCE1E4/g, '#000')}</g>`;
  g += `<g transform="${lanim ? '' : open ? 'rotate(-18 16 51)' : ''}">${lanim}${open ? lv.replace(/#DCE1E4/g, '#FFD27A') : lv}</g>`;
  g += `</g>`;
  // labels and click zones, in screen units
  const [lx0, ly0] = rpS(-21, 43), [lx1, ly1] = rpS(21, 57);
  g += `<text x="${P.x}" y="598" text-anchor="middle" class="st" style="font-size:12.5px">${isInst(r) ? 'New heatsink, base up: carrier fitted, thermal pad' : 'Processor heatsink module, base up'}</text>`;
  const [tx, ty] = rpS(-21, -55);
  g += `<path d="M${f1(tx - 6)} ${f1(ty - 4)}L${f1(tx - 40)} ${f1(ty - 14)}" stroke="#9FB3C2" stroke-width="1"/><text x="${f1(tx - 44)}" y="${f1(ty - 12)}" text-anchor="end" class="ss" style="fill:#C5CCD3">pin 1 &#9650;</text>`;
  g += `<path d="M${f1(lx1 + 4)} ${f1(ly1 - 6)}L${f1(lx1 + 34)} ${f1(ly1 + 2)}" stroke="#9FB3C2" stroke-width="1"/><text x="${f1(lx1 + 38)}" y="${f1(ly1 + 6)}" class="ss" style="fill:${open ? '#FFD27A' : '#C5CCD3'}">release lever: ${open ? 'open' : 'closed'}</text>`;
  const [ox0, oy0] = rpS(-31, -41.5), [ox1, oy1] = rpS(31, 41.5);
  if (isInst(r) && r.film) g += `<g${hot('repFilm', '', 'Protective film on the new heatsink\'s thermal pad: peel it off by its tab')}><rect x="${f1(ox0)}" y="${f1(oy0)}" width="${f1(ox1 - ox0)}" height="${f1(oy1 - oy0)}" rx="6" class="zone"/></g>`;
  else if (isInst(r) && r.nw === 'tray') g += `<g${hot('repPad', '', 'The new heatsink\'s thermal pad: ready to use')}><rect x="${f1(ox0)}" y="${f1(oy0)}" width="${f1(ox1 - ox0)}" height="${f1(oy1 - oy0)}" rx="6" class="zone"/></g>`;
  else if (r.old === 'raised') g += `<g${hot('repClips', '', 'Small clips at the sides of the processor: press them and lift the processor out')}><rect x="${f1(ox0 - 6)}" y="${f1(oy0)}" width="${f1(ox1 - ox0 + 12)}" height="${f1(oy1 - oy0)}" rx="6" class="zone"/></g>`;
  else if ((r.old === 'out' || r.old === 'away') && r.nw !== 'in' && !ready(r)) g += `<g${hot('repWipe', '', `Heatsink base: ${r.paste ? 'old thermal grease on it, clean it' : 'clean and shiny'}`)}><rect x="${f1(ox0)}" y="${f1(oy0)}" width="${f1(ox1 - ox0)}" height="${f1(oy1 - oy0)}" rx="6" class="zone"/></g>`;
  else if (ready(r)) g += `<g${hot('repSeat', '', `Carrier opening: lower the new processor in, ${isInst(r) ? 'lid side down onto the thermal pad' : 'grease side down'}, triangle to triangle, and push until it clicks`)}><rect x="${f1(ox0)}" y="${f1(oy0)}" width="${f1(ox1 - ox0)}" height="${f1(oy1 - oy0)}" rx="6" class="zone"/></g>`;
  if (r.old !== 'in' || r.lever === 'closed') g += `<g${hot('repLever', '', `Release lever: ${open ? 'open, push it back to closed' : 'closed, pull it'}`)}><rect x="${f1(lx0)}" y="${f1(ly0 - (open ? 18 : 0))}" width="${f1(lx1 - lx0)}" height="${f1(ly1 - ly0 + (open ? 18 : 0))}" rx="5" class="zone"/></g>`;
  return g;
}

/* ---- the work spot, the new processor's kit tray and the return box ---- */
function trayArt(x, y, w, h, title, inner, act, label) {
  let g = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#16293A" stroke="#2E5571"/><text x="${x + w / 2}" y="${y + 16}" text-anchor="middle" class="ss" style="font-size:10px;fill:#C5CCD3">${title}</text>${inner}`;
  if (act) g += `<g${hot(act, '', label)}><rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" rx="7" class="zone"/></g>`;
  return g;
}
function spotArt(t) {
  const r = t.rep, S = RP.spot, ga = fxAge('rpGrease'), ra = fxAge('rpRot');
  let g = `<rect x="504" y="574" width="196" height="218" rx="10" fill="none" stroke="#5B7A92" stroke-dasharray="6 4"/>`;
  let cap = 'Work spot', sub = '';
  const at = inner => `<g transform="translate(${S.x} ${S.y}) scale(${S.s})">${inner}</g>`;
  if (r.old === 'out') {
    g += `<rect x="${S.x - 56}" y="${S.y - 77}" width="113" height="155" rx="3" fill="#000" opacity=".35" transform="translate(3 4)"/>` + at(cpuLid(0, true, 0, 9));
    cap = 'Old processor, lid up'; sub = 'old grease on its lid';
    g += `<g${hot('repAway', '', 'Old processor: put it in the antistatic return box')}><rect x="${S.x - 62}" y="${S.y - 82}" width="124" height="166" rx="6" class="zone"/></g>`;
  } else if (r.nw === 'mat') {
    const flip = ready(r), anim = flip && ra < 0.45 ? `<animateTransform attributeName="transform" type="rotate" values="${(r.rot + 180) % 360};${r.rot === 0 ? 360 : 180}" dur="0.4s" begin="-${ra.toFixed(2)}s" fill="freeze"/>` : '';
    g += `<rect x="${S.x - 56}" y="${S.y - 77}" width="113" height="155" rx="3" fill="#000" opacity=".35" transform="translate(3 4)"/>`;
    if (!flip) { g += at(cpuLid(0, false, r.grease, ga)); cap = 'New processor, lid up'; sub = r.grease ? `grease: ${r.grease} of 3 strokes` : 'clean lid'; }
    else { g += `<g transform="translate(${S.x} ${S.y}) scale(${S.s})"><g transform="${anim ? '' : `rotate(${r.rot})`}">${anim}${cpuLand(0)}</g></g>`; cap = isInst(r) ? 'New processor, lid side down' : 'New processor, grease side down'; sub = `its triangle at the ${r.rot === 0 ? 'top left' : 'bottom right'}`; }
    g += `<g${hot(flip ? 'repRot' : 'repGrease', '', flip ? 'New processor: turn it around (180 degrees)' : 'New processor lid: apply the thermal grease')}><rect x="${S.x - 62}" y="${S.y - 82}" width="124" height="166" rx="6" class="zone"/></g>`;
  } else g += `<text x="${S.x}" y="${S.y}" text-anchor="middle" class="ss" style="fill:#8E99A3">${r.nw === 'in' ? 'The new processor is in the carrier.' : 'Empty'}</text>`;
  g += `<text x="${S.x}" y="592" text-anchor="middle" class="st" style="font-size:12px">${cap}</text>${sub ? `<text x="${S.x}" y="786" text-anchor="middle" class="ss" style="font-size:10.5px">${sub}</text>` : ''}`;
  // the kit tray with the new processor, and the antistatic return box for the old one
  const [kx, ky, kw, kh] = RP.kit, [bx, by, bw, bh] = RP.box, small = (x, y, inner) => `<g transform="translate(${x} ${y}) scale(1.15)">${inner}</g>`;
  let k = `<rect x="${kx + 8}" y="${ky + 24}" width="${kw - 16}" height="${kh - 34}" rx="5" fill="#26425A" opacity=".75" stroke="#8FC3E6" stroke-opacity=".6"/><rect x="${kx + 12}" y="${ky + 28}" width="${kw - 24}" height="${kh - 42}" rx="3" fill="#1A2E3E"/>`;
  if (r.nw === 'tray') k += small(kx + kw / 2, ky + 24 + (kh - 34) / 2, cpuLid(0, false, 0, 9));
  g += trayArt(kx, ky, kw, kh, 'Processor kit tray', k, r.nw === 'tray' ? 'repNew' : '', 'New processor in its kit tray: take it out by its edges');
  let b = `<rect x="${bx + 8}" y="${by + 24}" width="${bw - 16}" height="${bh - 34}" rx="4" fill="#202326" stroke="#4A5057"/><rect x="${bx + 14}" y="${by + 30}" width="${bw - 28}" height="${bh - 46}" rx="2" fill="#2C3034"/>`;
  if (isInst(r)) {
    // the processor blank and the socket cover, kept for later
    if (r.kept.blank) b += `<rect x="${bx + 18}" y="${by + 36}" width="54" height="40" rx="4" fill="#131517" stroke="#3B4046"/>${[0, 1, 2, 3].map(n => `<rect x="${bx + 24}" y="${by + 42 + n * 8}" width="42" height="3.5" rx="1.5" fill="#1F2225"/>`).join('')}`;
    if (r.kept.cover) b += `<rect x="${bx + 24}" y="${by + 84}" width="42" height="34" rx="4" fill="#141618" stroke="#3A3F45"/><rect x="${bx + 36}" y="${by + 87}" width="18" height="5" rx="2" fill="#2A2E33"/><rect x="${bx + 36}" y="${by + 110}" width="18" height="5" rx="2" fill="#2A2E33"/>`;
    g += trayArt(bx, by, bw, bh, 'Kept: blank, cover', b, '', '');
  } else {
    b += `<text x="${bx + bw / 2}" y="${by + bh - 14}" text-anchor="middle" style="font:800 7px var(--font);fill:#FFD27A">ESD</text>`;
    if (r.old === 'away') b += small(bx + bw / 2, by + 24 + (bh - 40) / 2, cpuLid(0, true, 0, 9));
    g += trayArt(bx, by, bw, bh, 'Return box', b, r.old === 'out' ? 'repAway' : '', 'Antistatic return box: put the old processor in it');
  }
  return g;
}

/* ---- the tool tray: pick a tool up (it is then in your hand), click it again to put it down ---- */
function toolIcon(k, x, y) {
  const drv = (handle, band, tip) => `<rect x="${x}" y="${y + 4}" width="46" height="14" rx="6" fill="${handle}" stroke="#000" stroke-width="1"/>${[10, 18, 26, 34].map(d => `<rect x="${x + d}" y="${y + 6}" width="2" height="10" rx="1" fill="#000" opacity=".35"/>`).join('')}<rect x="${x + 40}" y="${y + 4}" width="6" height="14" fill="${band}"/><rect x="${x + 46}" y="${y + 9.2}" width="44" height="3.6" fill="url(#rpSyr)"/>${tip}`;
  const torx = s => `<path d="M${x + 92} ${y + 11}l2 -${s}l2 ${s}l2 -${s}l2 ${s}l-2 ${s}l-2 -${s}l-2 ${s}z" fill="#C9CED2" stroke="#5B636A" stroke-width=".8"/>`;
  if (k === 't30') return drv('#1C1E21', '#D8462E', torx(3.4));
  if (k === 't15') return drv('#1C1E21', '#F0C43B', torx(2.2));
  if (k === 'ph2') return drv('#2F78D6', '#1B4A8A', `<path d="M${x + 90} ${y + 11}h8M${x + 94} ${y + 7}v8" stroke="#C9CED2" stroke-width="2"/>`);
  if (k === 'clean') return `<rect x="${x + 2}" y="${y + 2}" width="44" height="20" rx="3" fill="#F4F6F7" stroke="#8E979F"/><rect x="${x + 2}" y="${y + 8}" width="44" height="6" fill="#2F78D6"/><text x="${x + 24}" y="${y + 20}" text-anchor="middle" style="font:800 5px var(--font);fill:#14202B">IPA 70%</text><path d="M${x + 54} ${y + 4}h36l4 6l-4 6h-36z" fill="#BFE0F2" stroke="#6FA3C8"/><path d="M${x + 58} ${y + 8}h28M${x + 58} ${y + 12}h24" stroke="#8FC3E6" stroke-width="1"/>`;
  if (k === 'towel') return `<path d="M${x + 6} ${y + 2}h70l8 6v14h-78z" fill="#F7F5EF" stroke="#B9B4A6"/>${[14, 30, 46, 62].map(d => `<circle cx="${x + d}" cy="${y + 12}" r="1.6" fill="#DAD5C8"/>`).join('')}`;
  return `<rect x="${x + 4}" y="${y + 9}" width="10" height="6" fill="#8E979F"/><rect x="${x + 14}" y="${y + 6}" width="56" height="12" rx="2" fill="url(#rpSyr)" stroke="#6E767D"/><rect x="${x + 36}" y="${y + 6}" width="14" height="12" fill="#2F5BD6"/><path d="M${x + 70} ${y + 9}h10l6 3l-6 3h-10z" fill="#B4BABF" stroke="#6E767D"/><rect x="${x + 86}" y="${y + 9}" width="8" height="6" rx="1" fill="#2F5BD6"/>`;
}
function toolsArt(t) {
  const r = t.rep, T0 = RP.tools;
  let g = `<text x="${T0.x + 88}" y="562" text-anchor="middle" class="st" style="font-size:12px">Tool tray</text>`;
  REPTOOLS.forEach((o, i) => {
    const y = T0.y + i * T0.h, held = r.tool === o.k;
    g += `<rect x="${T0.x}" y="${y}" width="176" height="56" rx="8" fill="${held ? '#2A2414' : '#14202B'}" stroke="${held ? CUE : '#2E5571'}" stroke-width="${held ? 2 : 1}"/>`;
    g += held ? `<rect x="${T0.x + 36}" y="${y + 8}" width="104" height="22" rx="5" fill="none" stroke="#5B7A92" stroke-dasharray="4 3"/><text x="${T0.x + 88}" y="${y + 23}" text-anchor="middle" class="ss" style="font-size:10px;fill:#FFD27A">in your hand</text>` : toolIcon(o.k, T0.x + 38, y + 6);
    const sub = o.k === 'grease' && isInst(r) ? 'thermal grease' : o.sub;
    g += `<text x="${T0.x + 88}" y="${y + 41}" text-anchor="middle" style="font:700 10.5px var(--font);fill:#EAF2F7">${esc(o.name)}</text><text x="${T0.x + 88}" y="${y + 52}" text-anchor="middle" style="font:500 9px var(--font);fill:#9FB3C2">${esc(sub)}</text>`;
    g += `<g${hot('repTool', o.k, held ? `${o.name}: in your hand, put it down` : `${o.name}: pick it up`)}><rect x="${T0.x + 2}" y="${y + 2}" width="172" height="52" rx="7" class="zone"/></g>`;
  });
  return g;
}

/* ---- socket 2 close up while the module is replaced: per-corner anti-tilt wires and screws, then the empty socket ---- */
function repWireArt(x, y, locked) {
  const sx = x < SOCK2.cx ? -1 : 1, ex = x + sx * 36;
  if (locked) return `<path d="M${x + sx * 14} ${y - 6}C${x + sx * 26} ${y - 10} ${ex} ${y - 4} ${ex} ${y + 2}C${ex} ${y + 8} ${x + sx * 22} ${y + 9} ${x + sx * 15} ${y + 5}" fill="none" stroke="#2E3338" stroke-width="5.4" stroke-linecap="round"/><path d="M${x + sx * 14} ${y - 6}C${x + sx * 26} ${y - 10} ${ex} ${y - 4} ${ex} ${y + 2}C${ex} ${y + 8} ${x + sx * 22} ${y + 9} ${x + sx * 15} ${y + 5}" fill="none" stroke="#DCE0E3" stroke-width="3" stroke-linecap="round"/>`;
  // standing up: seen from above it is a short stub and the loop's end toward you
  return `<path d="M${x + sx * 14} ${y}L${ex - sx * 6} ${y}" stroke="#2E3338" stroke-width="5.4" stroke-linecap="round"/><path d="M${x + sx * 14} ${y}L${ex - sx * 6} ${y}" stroke="${CUE}" stroke-width="3" stroke-linecap="round"/><ellipse cx="${ex - sx * 2}" cy="${y}" rx="6" ry="9" fill="none" stroke="#2E3338" stroke-width="5"/><ellipse cx="${ex - sx * 2}" cy="${y}" rx="6" ry="9" fill="none" stroke="${CUE}" stroke-width="2.6"/>`;
}
function repSocket(t) {
  const r = t.rep, can = !t.baffle && t.cover === 'off';
  let g = `<defs><clipPath id="czclip"><rect x="${CZ.ox}" y="${CZ.oy}" width="${f1(CZW)}" height="${f1(CZH)}" rx="8"/></clipPath></defs><g clip-path="url(#czclip)"><g transform="${czT}">${bandImg('czb')}`;
  g += sock2Art(t) + phmImg(1) + dimmArt(t);
  if (t.sock2 === 'phm') {
    const a = fxAge('phmDown'), [x, y, w, h] = PHMPOS[2];
    const anim = a < 0.8 ? `<animateTransform attributeName="transform" type="translate" values="-26 -70;0 0" dur="0.75s" begin="-${a.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".3 .2 .3 1" keyTimes="0;1"/>` : '';
    g += `<rect x="${x + 90}" y="${y + 24}" width="${w - 180}" height="${h - 60}" rx="14" fill="#000" opacity=".5" transform="translate(8 12)"/><g>${anim}${phmImg(2)}</g>`;
    NUT2.forEach(([nx, ny], k) => {
      const ok = t.nuts2[k], na = fxAge('nut' + k), ox = nx < SOCK2.cx ? -40 : 40, oy = ny < SOCK2.cy ? -34 : 34;
      g += repWireArt(nx, ny, r.w[k]);
      g += `<circle cx="${nx}" cy="${ny}" r="20" fill="none" stroke="${ok ? '#45D07F' : CUE}" stroke-width="4"${ok ? '' : ' stroke-dasharray="7 5"'}/>`;
      if (na < 0.9) g += `<g opacity="0"><animate attributeName="opacity" values="1;1;0" keyTimes="0;.75;1" dur="0.85s" begin="-${na.toFixed(2)}s" fill="freeze"/><g transform="translate(${nx} ${ny})"><g><animateTransform attributeName="transform" type="rotate" values="${ok ? '0;360' : '360;0'}" dur="0.85s" begin="-${na.toFixed(2)}s" fill="freeze"/><path d="M-6 -16L0 -9L6 -16L9 -6L16 0L9 6L6 16L0 9L-6 16L-9 6L-16 0L-9 -6Z" fill="#E7EBEE" stroke="#3E454C" stroke-width="2"/><rect x="-5" y="-60" width="10" height="44" rx="3" fill="#2A2F35"/></g></g></g>`;
      g += `<circle cx="${nx + ox}" cy="${ny + oy}" r="16" fill="${ok ? '#45D07F' : '#14202B'}" stroke="${ok ? '#1E6B3E' : CUE}" stroke-width="2.5"/><text x="${nx + ox}" y="${ny + oy + 6}" text-anchor="middle" style="font:800 18px var(--font);fill:${ok ? '#0E1A12' : '#FFD27A'}">${k + 1}</text>`;
    });
  }
  if (can) {
    if (t.sock2 === 'phm') {
      if (t.nuts2.every(n => !n) && r.w.every(x => !x)) g += `<g${hot('repLift', '', 'Processor heatsink module: lift it straight up by the edges of its base plate')}><rect x="${SOCK2.cx - 120}" y="1030" width="240" height="190" rx="12" class="zone"/></g>`;
      NUT2.forEach(([x, y], k) => {
        g += `<g${hot('repNut', k, `Heatsink screw ${k + 1}: ${t.nuts2[k] ? 'tight' : 'loose'}`)}><circle cx="${x}" cy="${y}" r="20" class="zone"/></g>`;
        const sx = x < SOCK2.cx ? -1 : 1;
        g += `<g${hot('repWire', k, `Anti-tilt wire at screw ${k + 1}: ${r.w[k] ? 'locked, clipped down' : 'unlocked, standing up'}`)}><circle cx="${x + sx * 34}" cy="${y}" r="14" class="zone"/></g>`;
      });
    } else if (t.sock2 === 'blank' || t.sock2 === 'cover') g += `<g${hot('repSock', '', t.sock2 === 'blank' ? 'Socket 2: processor blank. Lift it off' : 'Socket 2: socket cover. Remove it by its tabs, straight up')}><rect x="${SOCK2.x0 - 8}" y="${SOCK2.y0 - 14}" width="${SOCK2.x1 - SOCK2.x0 + 16}" height="${SOCK2.y1 - SOCK2.y0 + 28}" rx="12" class="zone"/></g>`;
    else if (r.at === 'mat') g += `<g${hot('repLower', '', 'Socket 2: lower the processor heatsink module into it')}><rect x="${SOCK2.x0}" y="${SOCK2.y0}" width="${SOCK2.x1 - SOCK2.x0}" height="${SOCK2.y1 - SOCK2.y0}" rx="10" class="zone"/></g>`;
  }
  g += `</g></g><rect x="${CZ.ox}" y="${CZ.oy}" width="${f1(CZW)}" height="${f1(CZH)}" rx="8" fill="none" stroke="#2E5571" stroke-width="1.5"/>`;
  const [lx, ly] = czXY(SOCK2.cx, 905);
  g += `<text x="${f1(lx)}" y="${f1(ly)}" text-anchor="middle" style="font:700 14px var(--font);fill:#FFD27A;paint-order:stroke;stroke:#0E1A22;stroke-width:3px" pointer-events="none">P2</text>`;
  g += `<text x="${CZ.ox + 8}" y="${f1(CZ.oy + CZH - 10)}" class="ss" style="fill:#EAF2F7;paint-order:stroke;stroke:#0E1A22;stroke-width:3px" pointer-events="none">front of the server &#8595;${t.sock2 === 'empty' ? '. Socket 2 empty: do not touch the pins' : ''}</text>`;
  if (!can) g += `<rect x="${CZ.ox}" y="${CZ.oy}" width="${f1(CZW)}" height="28" fill="#0E1A22" opacity=".88"/><text x="${CZ.ox + 10}" y="${CZ.oy + 19}" class="st" style="fill:#FFD27A">${t.cover !== 'off' ? 'Access panel on: remove it first (Top view)' : 'Air baffle in place: lift it out first (Top view)'}</text>`;
  return g;
}
// the procedure with its progress, beside the socket
function repStepsArt(t) {
  const r = t.rep, f = t.flags, out = r.at === 'mat', nin = r.nw === 'in';
  const rows = isInst(r) ? [
    ['Processor blank off socket 2, kept', t.sock2 !== 'blank'], ['Socket cover off by its tabs, kept', t.sock2 === 'empty' || t.sock2 === 'phm'],
    ['Film peeled off the heatsink\'s thermal pad', !r.film], ['New processor out of its tray', r.nw !== 'tray'], ['Triangle to triangle', !!f.i5],
    ['Processor pushed in until it clicks (lever closed)', nin], ['Module lowered into socket 2', nin && !out], ['Anti-tilt wires clipped (4)', nin && !out && r.w.every(Boolean)],
    ['Screws tightened in a cross order (T-30)', repDone(t)]] : [
    ['Anti-tilt wires up to vertical (4)', !!f.p1], ['Screws loosened in a cross order (T-30)', !!f.p2], ['Module lifted out, processor attached', !!f.p3],
    ['Release lever pulled: processor rises', !!f.p4], ['Clips pressed: old processor out', !!f.p5], ['Old processor in the return box', r.old === 'away'],
    ['Heatsink base cleaned until shiny', r.paste === 0], ['New processor out of its tray', r.nw !== 'tray'], ['Thermal grease on the lid, HPE pattern', r.grease >= 3 || nin],
    ['Triangle to triangle', !!f.p10], ['Release lever back to closed', !!f.p11], ['Processor pushed in until it clicks', nin],
    ['Module lowered into socket 2', nin && !out], ['Anti-tilt wires clipped (4)', nin && !out && r.w.every(Boolean)], ['Screws tightened in a cross order (T-30)', repDone(t)]];
  const X = 548, Y = 50, next = Sim.guide ? rows.findIndex(x => !x[1]) : -1;   // the current row is guidance
  let g = `<rect x="${X}" y="${Y}" width="338" height="${rows.length * 25 + 42}" rx="10" fill="#16293A" stroke="#2E5571"/><text x="${X + 14}" y="${Y + 22}" class="st">${isInst(r) ? 'Install processor 2' : 'Replace processor 2'}, step by step</text>`;
  rows.forEach(([s, ok], i) => {
    const y = Y + 42 + i * 25, cur = i === next;
    g += `<circle cx="${X + 22}" cy="${y - 4}" r="8.5" fill="${ok ? '#45D07F' : cur ? '#14202B' : '#0E1A22'}" stroke="${ok ? '#1E6B3E' : cur ? CUE : '#4A5A68'}" stroke-width="2"/>${ok ? `<path d="M${X + 17.5} ${y - 4}l3.6 3.6l6.4 -7.2" fill="none" stroke="#0E1A12" stroke-width="2.2"/>` : `<text x="${X + 22}" y="${y}" text-anchor="middle" style="font:700 9.5px var(--font);fill:${cur ? '#FFD27A' : '#8E99A3'}">${i + 1}</text>`}`;
    g += `<text x="${X + 38}" y="${y}" class="ss" style="${cur ? 'fill:#FFD27A;font-weight:600' : ok ? 'fill:#A9D9BB' : ''}">${esc(s)}</text>`;
  });
  return g;
}
function repRender(t) {
  const [mx, my, mw, mh] = RP.mat;
  let mat = `<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="10" fill="#1E2A33" stroke="#2E5571"/><rect x="${mx + 4}" y="${my + 4}" width="${mw - 8}" height="${mh - 8}" rx="8" fill="url(#matg)"/><defs><pattern id="matg" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#25343F"/><path d="M0 16L16 0" stroke="#2C3E4B" stroke-width="1"/></pattern></defs>`;
  const r = repOf(t);
  mat += `<text x="28" y="562" class="st">Antistatic mat: processor kit ${CATALOG.cpu.pid} (${CATALOG.cpu.short}), ${isInst(r) ? 'new heatsink' : 'heatsink reused'}</text>`;
  if (r.at === 'mat') mat += phmMat(t);
  else mat += `<text x="${RP.phm.x}" y="760" text-anchor="middle" class="ss">The processor heatsink module is in socket 2.</text><text x="${RP.phm.x}" y="778" text-anchor="middle" class="ss">${r.nw === 'in' ? 'The new processor is in it.' : 'Lift it out to change the processor.'}</text>`;
  mat += spotArt(t) + toolsArt(t);
  return frame(`Processor 2: ${isInst(r) ? 'install it, with a new heatsink' : 'replace it, reusing its heatsink'}. Socket close up, front of the server at the bottom`, RPDEFS + repSocket(t) + repStepsArt(t) + mat, 966);
}
function repActions(t) {
  const r = repOf(t), a = [];
  if (r.tool) a.push(button(`Put the ${toolName(r.tool)} down`, 'repTool', r.tool));
  if (r.old === 'out') a.push(button('Put the old processor in the return box', 'repAway'));
  if (ready(r)) a.push(button('Turn the processor around (180°)', 'repRot'));
  return a;
}
function repTray(t) {
  const c = CATALOG.cpu, r = repOf(t);
  if (isInst(r)) return `<h2>Install processor 2</h2><table class="dec"><tr><td>Kit</td><td>${c.pid}</td></tr><tr><td>Processor</td><td>${c.name}, the same part as processor 1</td></tr><tr><td>Heatsink</td><td>New: carrier fitted, thermal pad pre-applied under a protective film</td></tr><tr><td>Tool</td><td>${PROFILE.tool} screwdriver</td></tr><tr><td>Torque</td><td>${PROFILE.torque}</td></tr></table>
    <ol class="rules" style="padding-left:20px;margin-top:8px"><li>Processor blank off socket 2: keep it</li><li>Socket cover off by its tabs, straight up: keep it. Do not touch the pins</li><li>Film peeled off the new heatsink's thermal pad: no cleaning, no grease</li><li>New processor out of its tray by its edges</li><li>Triangle on the processor to the triangle on the carrier</li><li>Release lever closed, processor pushed in until it clicks</li><li>Module lowered into the socket</li><li>Wires clipped</li><li>Screws tightened in a cross order</li></ol>
    <p class="cap">What differs from replacing a processor: no old processor to free, a blank and a socket cover to take off, and a new heatsink with its thermal pad already on it.</p>`;
  return `<h2>Replace processor 2</h2><table class="dec"><tr><td>Kit</td><td>${c.pid}</td></tr><tr><td>Processor</td><td>${c.name}, the same part as processor 1</td></tr><tr><td>Heatsink</td><td>Reused: clean it, new grease from the kit's syringe</td></tr><tr><td>Tools</td><td>${PROFILE.tool} screwdriver; cleaning kit (alcohol wipes, lint-free cloth)</td></tr><tr><td>Torque</td><td>${PROFILE.torque}</td></tr></table>
    <ol class="rules" style="padding-left:20px;margin-top:8px"><li>Anti-tilt wires up to vertical (no click)</li><li>Screws loosened in a cross order: one, then the one diagonally opposite</li><li>Module lifted, processor attached</li><li>Release lever pulled: the processor rises</li><li>Clips pressed: the processor comes free</li><li>Old processor in the return box</li><li>Base cleaned until shiny</li><li>Grease on the new processor's lid</li><li>Triangle on the processor to the triangle on the heatsink</li><li>Lever closed, processor pushed in until it clicks</li><li>Module lowered into the socket</li><li>Wires clipped</li><li>Screws tightened in a cross order</li></ol>`;
}

/* ---- handlers ---- */
const repOn = () => !!repOf(T);
const matOk = () => T.esd || bad('Put on the ESD wrist strap first (Top view).');
Sim.on('repTool', k => {
  if (!repOn()) return; const r = T.rep, o = REPTOOLS.find(x => x.k === k); if (!o) return;
  if (r.tool === k) { r.tool = null; return say('info', `${o.name} put back in the tool tray.`); }
  const was = r.tool; r.tool = k; Sim.sound('clipOpen');
  say('info', `${was ? `${toolName(was)} put down. ` : ''}${o.name} in your hand${k === 'clean' ? ': an alcohol wipe, and the lint-free cloth for the last pass' : ''}.`);
});
Sim.on('repWire', a => {
  if (!repOn() || !inside()) return; const r = T.rep, k = +a; if (r.at !== 'socket' || !(k >= 0 && k < 4)) return;
  r.w[k] = !r.w[k]; T.wires2 = r.w.every(Boolean) ? 'locked' : 'unlocked';
  if (!r.w[k]) { Sim.sound('clipOpen'); return say('ok', `Anti-tilt wire at screw ${k + 1} pushed up to vertical: unlocked. It just stands up, no click.${r.w.every(x => !x) ? ' All four are up.' : ''}`); }
  Sim.sound('clip'); say('ok', `Anti-tilt wire at screw ${k + 1} clipped down over its hook: locked, click.${r.w.every(Boolean) ? ' All four are clipped.' : ''}`);
});
Sim.on('repNut', a => {
  if (!repOn() || !inside()) return; const r = T.rep, k = +a; if (r.at !== 'socket' || !(k >= 0 && k < 4)) return;
  if (r.tool !== 't30') return bad(r.tool ? `The ${toolName(r.tool)} does not fit: the heatsink screws are T-30 Torx (printed on the heatsink label: T30, 8 in-lb or 0.9 N·m). Take the T-30 Torx screwdriver.` : 'Take the T-30 Torx screwdriver from the tool tray first.');
  const tight = !!T.nuts2[k];
  if (r.nw !== 'in') {
    if (!tight) return say('info', `Screw ${k + 1} is already loose.`);
    if (r.w[k]) return bad(`Push the anti-tilt wire at screw ${k + 1} up to vertical first: the wires are unlocked before the screws are loosened.`);
    const n = T.nuts2.filter(x => !x).length;
    if (n % 2 && k !== NPART[r.last]) return bad(`Cross order: after screw ${r.last + 1}, loosen the one diagonally opposite it, screw ${NPART[r.last] + 1}. Then the module stays level as it comes up.`);
    T.nuts2[k] = 0; r.last = k; fxMark('nut' + k); Sim.sound('tab', 0.5);
    return say('ok', `Screw ${k + 1} loosened with the T-30 Torx until it turns freely: the captive screw stays in the heatsink.${T.nuts2.every(x => !x) ? ' All four are loose.' : n % 2 ? ' Now the other pair.' : ` Next: screw ${NPART[k] + 1}, diagonally opposite.`}`);
  }
  if (tight) return say('info', `Screw ${k + 1} is already tight, ${PROFILE.torque}.`);
  if (!r.w[k]) return bad(`Clip the anti-tilt wire at screw ${k + 1} down first: locked, it keeps the module level while you tighten.`);
  const n = T.nuts2.filter(Boolean).length;
  if (n % 2 && k !== NPART[r.last]) return bad(`Cross order: after screw ${r.last + 1}, tighten the one diagonally opposite it, screw ${NPART[r.last] + 1}. The module is pulled down evenly.`);
  T.nuts2[k] = 1; r.last = k; fxMark('nut' + k); Sim.sound('snap', 0.7);
  say('ok', `Screw ${k + 1} tightened with the T-30 Torx to ${PROFILE.torque}.${T.nuts2.every(Boolean) ? ` All four are tight: processor 2 is ${isInst(r) ? 'installed' : 'replaced'}.` : n % 2 ? ' Now the other pair.' : ` Next: screw ${NPART[k] + 1}, diagonally opposite.`}`);
});
Sim.on('repLift', () => {
  if (!repOn() || !inside()) return; const r = T.rep; if (r.at !== 'socket') return;
  if (T.nuts2.some(Boolean)) return bad('Loosen all four heatsink screws first: the module is still screwed down.');
  if (r.w.some(Boolean)) return bad('Push all four anti-tilt wires up to vertical first: a locked wire holds the module on its hook.');
  const had = r.tool; r.tool = null; r.at = 'mat'; T.sock2 = 'empty'; fxMark('rpLift'); Sim.sound('clipOpen', 0.3);
  say('ok', `${had ? `${toolName(had)} put down. ` : ''}Module lifted straight up by the edges of its base plate, the processor still in the carrier under it, and turned over onto the mat, base up. Socket 2 is open now: do not touch its pins.`);
});
Sim.on('repLever', () => {
  if (!repOn() || !matOk()) return; const r = T.rep;
  if (r.at !== 'mat') return say('info', 'The release lever is on the module: lift the module out first.');
  fxMark('rpLever');
  if (r.lever === 'closed') {
    r.lever = 'open'; Sim.sound('cpuRelease');
    if (r.old === 'in') { r.old = 'raised'; return say('ok', 'Release lever pulled up: it pushes the processor up a little, off the heatsink base. The processor is still held by the carrier\'s small clips.'); }
    return say('ok', 'Release lever pulled open.');
  }
  if (r.old === 'raised') r.old = 'in';
  r.lever = 'closed'; Sim.sound('clip');
  say('ok', 'Release lever pushed back down to its resting position, flat along the carrier edge: closed.');
});
Sim.on('repClips', () => {
  if (!repOn() || !matOk()) return; const r = T.rep; if (r.at !== 'mat') return;
  if (r.old === 'in') return bad('Pull the release lever first: it lifts the processor off the heatsink base, then the clips let it go.');
  if (r.old !== 'raised') return;
  r.tool = null; r.old = 'out'; fxMark('rpOut'); Sim.sound('cpuRelease', 0.1);
  say('ok', 'Small clips pressed outward, one side, then the other: the old processor is free. Lifted out of the carrier by its edges, its contacts untouched. The heatsink base is revealed, with the old thermal grease on it.');
});
Sim.on('repAway', () => {
  if (!repOn()) return; const r = T.rep; if (r.old !== 'out') return;
  r.old = 'away'; Sim.sound('clip');
  say('ok', 'Old processor put in the antistatic return box, lid up: it goes back to HPE with the return label.');
});
Sim.on('repSock', () => {
  if (!repOn() || !inside()) return; const r = T.rep;
  if (T.sock2 === 'blank') { T.sock2 = 'cover'; r.kept.blank = true; Sim.sound('clipOpen'); return say('ok', 'Processor blank lifted off socket 2 and kept in the parts box: it goes back on if the processor is ever removed for good.'); }
  if (T.sock2 === 'cover') { T.sock2 = 'empty'; r.kept.cover = true; Sim.sound('cpuRelease'); return say('ok', 'Socket cover removed by its tabs, straight up, and kept. The socket pins are exposed now: do not touch them.'); }
});
Sim.on('repFilm', () => {
  if (!repOn() || !matOk()) return; const r = T.rep; if (!isInst(r) || !r.film) return;
  r.film = false; fxMark('rpFilm'); Sim.sound('clipOpen');
  say('ok', 'Protective film peeled off the new heatsink\'s thermal pad by its tab. Do not touch the pad: it is the thermal interface, ready to use. No cleaning and no grease on a new heatsink.');
});
Sim.on('repPad', () => {
  if (!repOn() || !matOk()) return; const r = T.rep; if (!isInst(r) || r.film) return;
  if (r.tool === 'clean' || r.tool === 'towel') return bad('Do not wipe a new heatsink: its thermal pad is the thermal interface, pre-applied. Wiping damages it and leaves residue or fibres. Cleaning is only for a reused heatsink with old grease.');
  if (r.tool === 'grease') return bad('No grease on a new heatsink: the pre-applied thermal pad is the thermal interface. Grease on top of it only adds a thicker, worse layer. The syringe is for a reused heatsink.');
  if (r.tool) return bad(`Keep the ${toolName(r.tool)} off the thermal pad: any scratch or dent spoils the contact.`);
  say('info', 'The thermal pad is ready: grey, even, no film left on it. Do not touch it. The new processor goes on it next.');
});
Sim.on('repWipe', () => {
  if (!repOn() || !matOk()) return; const r = T.rep; if (isInst(r) || r.at !== 'mat' || r.old === 'in' || r.old === 'raised') return;
  if (r.paste <= 0) return say('info', 'The copper base is clean and shiny already.');
  if (r.old === 'out') return say('warn', 'Put the old processor away first (antistatic return box): keep the mat clear while you clean.');
  if (r.tool !== 'clean') return bad(r.tool === 'towel' ? 'A dry paper towel smears the grease and leaves fibres on the base. Use the HPE-recommended cleaning kit: alcohol wipes, then the lint-free cloth.' : r.tool ? `The ${toolName(r.tool)} is not for cleaning, and metal scratches the copper. Take the cleaning kit.` : 'Take the cleaning kit from the tool tray first.');
  r.paste--; fxMark('rpWipe'); Sim.sound('velcro', 0.02);
  say('ok', r.paste ? `Wiped with an alcohol wipe, from the edges in: ${['', 'only a light haze left', 'grease left at the edges', 'the copper shows through in streaks'][r.paste]}. Again.` : 'Last pass with the lint-free cloth: the copper base is clean and shiny, no grease and no fibres left.');
});
Sim.on('repNew', () => {
  if (!repOn() || !matOk()) return; const r = T.rep; if (r.nw !== 'tray') return;
  if (!isInst(r)) {
    if (r.old === 'out') return say('warn', 'Put the old processor away first: the work spot is for one processor at a time.');
    if (r.paste > 0 && r.at === 'mat' && r.old === 'away') return say('warn', 'Clean the heatsink base first: the new processor waits safely in its tray.');
    if (r.at !== 'mat') return say('warn', 'Lift the module out and take the old processor off it first.');
  }
  const had = r.tool; r.tool = null; r.nw = 'mat'; Sim.sound('clipOpen');
  say('ok', `${had ? `${toolName(had)} put down. ` : ''}New processor lifted out of its kit tray by its edges${isInst(r) ? ' and turned over, lid side down, the way it goes onto the thermal pad' : ' and set on the work spot, lid up'}. Its contacts stay untouched.`);
});
Sim.on('repGrease', () => {
  if (!repOn() || !matOk()) return; const r = T.rep; if (r.nw !== 'mat' || isInst(r)) return;
  if (r.grease >= 3) return say('info', 'The whole syringe is on the lid already.');
  if (r.tool !== 'grease') return bad(r.tool ? `That is the ${toolName(r.tool)}. Take the thermal grease syringe from the processor kit.` : 'Take the thermal grease syringe from the tool tray first.');
  if (r.paste > 0) return bad('Clean the old grease off the heatsink base first: old and new grease must not mix.');
  r.grease++; fxMark('rpGrease');
  if (r.grease < 3) return say('ok', `Grease stroke ${r.grease} of 3 across the processor lid.`);
  r.tool = null;
  say('ok', 'Third stroke: the whole syringe is on the lid, three strokes across it, the pattern in the kit\'s instructions. Do not spread it: the heatsink does that. Syringe put down. Now turn the processor over above the heatsink: grease side down.');
});
Sim.on('repRot', () => {
  if (!repOn()) return; const r = T.rep; if (!ready(r)) return;
  r.rot = (r.rot + 180) % 360; fxMark('rpRot'); Sim.sound('clipOpen');
  say('info', `Processor turned around: its gold triangle is now at the ${r.rot === 0 ? 'top left' : 'bottom right'} corner.`);
});
Sim.on('repSeat', () => {
  if (!repOn() || !matOk()) return; const r = T.rep; if (r.at !== 'mat' || r.nw !== 'mat') return;
  if (isInst(r) && r.film) return bad('Peel the protective film off the thermal pad first: a processor pushed in over the film would not touch the pad.');
  if (!isInst(r) && r.grease < 3) return bad('Apply the thermal grease to the new processor first.');
  if (r.lever !== 'closed') return bad('Return the release lever to its resting, closed position first: with the lever open the processor cannot latch.');
  if (r.rot !== 0) return bad('The triangles do not line up: the gold triangle on the processor must sit at the corner of the triangle on the carrier. Turn the processor around.');
  r.tool = null; r.nw = 'in'; fxMark('rpSeat'); Sim.sound('clip', 0.05); Sim.sound('cpuClip', 0.14);
  say('ok', `Processor lowered ${isInst(r) ? 'lid side down onto the thermal pad' : 'grease side down onto the heatsink base'}, triangle to triangle, and pushed in until the carrier clips snapped over it: click. It sits flat and level.`);
});
Sim.on('repLower', () => {
  if (!repOn() || !inside()) return; const r = T.rep; if (r.at !== 'mat') return;
  if (r.nw !== 'in') return bad(`Fit the new processor in the carrier first: the module goes ${isInst(r) ? 'in' : 'back'} with its processor clicked in.`);
  if (T.sock2 !== 'empty') return bad(`Take the ${T.sock2 === 'blank' ? 'processor blank and then the socket cover' : 'socket cover'} off socket 2 first.`);
  if (r.w.some(Boolean)) return bad('Set all four anti-tilt wires vertical first, or they catch on the bolster plate.');
  r.tool = null; r.at = 'socket'; T.sock2 = 'phm'; T.nuts2 = [0, 0, 0, 0]; r.last = -1; fxMark('phmDown'); Sim.sound('clip', 0.6);
  say('ok', `Module turned ${isInst(r) ? '' : 'back '}over and lowered straight down into socket 2 by the edges of its base plate, onto the guide posts, the heat pipes and fin stacks toward the front: it fits one way only. It sits flat. Now clip the four anti-tilt wires.`);
});
