/* ---- Top view: the access panel, the air baffle, and what is under them. All drawing here is in the units of the
   straightened top view of the open server (W: 1350 x 2332, rear at y 0, front at y 2332, chassis walls at x 60 and
   1290). The view shows it turned on its side, front at the left and rear at the right, so it fills the stage: W (x, y)
   lands at screen (VT.x + (2332 - y) k, VT.y + x k). The access panel photo, the two processor heatsink modules and the
   DIMMs are laid over it. ---- */
const WV = { W: 1350, H: 2332 };
// DIMM slot centres (x) for P2 and P1, slots 1..16, measured on the photo's slot latches; y range of a slot
const SLOTX = { P2: [161, 181, 201, 221, 240, 260, 280, 300, 527, 547, 567, 586, 605, 624, 644, 662], P1: [684.5, 703, 722, 741, 760, 779, 798, 817, 1046, 1064, 1085, 1104, 1124, 1142, 1162, 1181] };
const SLOTY = [951, 1313];
const white = n => n <= 8 ? n % 2 === 1 : n % 2 === 0;
// heatsink modules: where each sits; socket 2's nuts in tightening order (1 and 2 a diagonal pair, then 3 and 4)
const PHMPOS = { 1: [696, 945, 523, 450], 2: [139, 945, 523, 450] };
const NUT2 = [[337, 987], [487, 1259], [485, 987], [337, 1259]];
const SOCK2 = { x0: 316, y0: 958, x1: 506, y1: 1290, cx: 411, cy: 1123 };
// the access panel photo covers W x 40..1310, y 30..1958; the latch in it (W)
const COVER = { x: 40, y: 30, w: 1270, h: 1928, back: -38 };
const LATCH = { x: 652, y: 1219, w: 73, h: 201 };
const BAFFLE = { x0: 62, y0: 892, x1: 1288, y1: 1440 };
// the view: top view on its side
const VT = { x: 14, y: 46, k: 0.37 };
const vtT = `translate(${f1(VT.x + WV.H * VT.k)} ${VT.y}) scale(${VT.k}) rotate(90)`;
const TV = (x, y) => [VT.x + (WV.H - y) * VT.k, VT.y + x * VT.k];

function phmImg(k) { const [x, y, w, h] = PHMPOS[k]; return `<image href="${k === 1 ? IMG.hpPhm1 : IMG.hpPhm}" x="${x}" y="${y}" width="${w}" height="${h}"/>`; }
// a DIMM seen from above: the module's top edge with the DRAM packages either side of the board
function dimmTop(x, y0, y1, a, sel, kind) {
  const drop = a < 0.6 ? `<animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : '';
  // a 3DS DIMM: the same board, but its label is blue
  const lab = DIMMK[kind] && DIMMK[kind].td ? '#9CC3E8' : '#E8E6DD';
  let g = `<g>${drop}<rect x="${x - 6.5}" y="${y0 + 14}" width="13" height="${y1 - y0 - 28}" rx="2" fill="#2F5A3E" stroke="#13261A" stroke-width="1.2"/>`;
  for (let y = y0 + 30; y < y1 - 34; y += 30) g += `<rect x="${x - 5.6}" y="${y}" width="11.2" height="22" rx="1" fill="#16191B"/>`;
  g += `<rect x="${x - 1.2}" y="${y0 + 16}" width="2.4" height="${y1 - y0 - 32}" fill="#8FC09F" opacity=".7"/><rect x="${x - 5}" y="${(y0 + y1) / 2 - 22}" width="10" height="44" fill="${lab}" opacity=".92"/>`;
  return g + `</g>`;
}
function dimmArt(t) {
  let g = '';
  ['P1', 'P2'].forEach(p => SLOTX[p].forEach((x, n) => {
    const id = `${p}-${n + 1}`, has = t.dimms[id], open = t.memOpen[id];
    if (open) {
      // latches swung outward: the slot ends show, the latches stand off them
      const c = white(n + 1) ? '#E9E4CF' : '#1D2023';
      g += `<rect x="${x - 7}" y="${SLOTY[0] - 2}" width="14" height="22" fill="#0B0D0F"/><rect x="${x - 7}" y="${SLOTY[1] - 20}" width="14" height="22" fill="#0B0D0F"/>`;
      g += `<rect x="${x - 7.5}" y="${SLOTY[0] - 19}" width="15" height="16" rx="2" fill="${c}" stroke="#55606A" stroke-width="1.5"/><rect x="${x - 7.5}" y="${SLOTY[1] + 3}" width="15" height="16" rx="2" fill="${c}" stroke="#55606A" stroke-width="1.5"/>`;
    }
    if (has) g += dimmTop(x, SLOTY[0], SLOTY[1], fxAge('dimm' + id), false, dimmKind(has));
  }));
  return g;
}
// socket 2 with no module in it: the bolster plate and its four posts, then the socket, its dust cover, or the blank
function sock2Art(t) {
  const s = SOCK2, st = t.sock2;
  if (st === 'phm') return '';
  let g = `<defs><pattern id="lga" width="3.6" height="3.6" patternUnits="userSpaceOnUse"><rect width="3.6" height="3.6" fill="#3A3324"/><circle cx="1.8" cy="1.8" r="1.05" fill="#D9BE73"/><circle cx="1.5" cy="1.45" r=".4" fill="#F6E6B2"/></pattern><pattern id="lgaCh" width="3" height="4.2" patternUnits="userSpaceOnUse"><rect width="3" height="4.2" fill="#1C2E3A"/><rect x=".7" y=".6" width="1.6" height="2.6" rx=".4" fill="#C9D3D9"/></pattern><pattern id="pcb2" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#17301F"/><path d="M0 6H9L14 11H22M4 22V15L8 11M17 0V5" stroke="#21452D" stroke-width="1.2" fill="none"/><circle cx="14" cy="11" r="1.3" fill="#2E5A3B"/></pattern><linearGradient id="bolg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DDE2E6"/><stop offset=".35" stop-color="#AEB5BB"/><stop offset=".7" stop-color="#C8CED3"/><stop offset="1" stop-color="#8A929A"/></linearGradient><radialGradient id="studg" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#F4F6F7"/><stop offset=".6" stop-color="#B3BAC0"/><stop offset="1" stop-color="#6A727A"/></radialGradient></defs>`;
  // the board under the module: printed circuit board where the photo's heatsink was, and under its fin stacks
  g += `<rect x="306" y="944" width="216" height="348" rx="6" fill="url(#pcb2)"/><rect x="300" y="1286" width="230" height="88" fill="url(#pcb2)"/>`;
  [[318, 1300], [356, 1306], [470, 1302], [498, 1310], [420, 1330]].forEach(([x, y], k) => { g += `<rect x="${x}" y="${y}" width="${k % 2 ? 14 : 22}" height="${k % 2 ? 9 : 12}" rx="1.5" fill="#0E1012" stroke="#2A2E33"/>`; });
  // the bolster plate: stamped steel, with its cut-outs and the ribs along both sides
  g += `<path d="M${s.x0 + 8} ${s.y0}H${s.x1 - 8}Q${s.x1} ${s.y0} ${s.x1} ${s.y0 + 8}V${s.y1 - 8}Q${s.x1} ${s.y1} ${s.x1 - 8} ${s.y1}H${s.x0 + 8}Q${s.x0} ${s.y1} ${s.x0} ${s.y1 - 8}V${s.y0 + 8}Q${s.x0} ${s.y0} ${s.x0 + 8} ${s.y0}Z M344 1024V1222H478V1024Z" fill="url(#bolg)" fill-rule="evenodd" stroke="#4E565D" stroke-width="2"/>`;
  g += `<rect x="${s.x0 + 6}" y="1030" width="10" height="186" rx="4" fill="#9AA2A9" stroke="#626A71"/><rect x="${s.x1 - 16}" y="1030" width="10" height="186" rx="4" fill="#9AA2A9" stroke="#626A71"/>`;
  g += `<rect x="396" y="968" width="30" height="14" rx="3" fill="#2B3E33" stroke="#626A71"/><rect x="396" y="1262" width="30" height="14" rx="3" fill="#2B3E33" stroke="#626A71"/><text x="${s.cx}" y="1252" text-anchor="middle" style="font:700 9px var(--font);fill:#6E767D">LGA4677</text>`;
  // the four threaded studs the heatsink screws go onto, with the hook each anti-tilt wire latches under
  NUT2.forEach(([x, y]) => { const sx = x < s.cx ? -1 : 1; g += `<path d="M${x + sx * 14} ${y - 8}h${sx * 16}v16h${-sx * 16}" fill="none" stroke="#7C858D" stroke-width="4" stroke-linejoin="round"/><circle cx="${x}" cy="${y}" r="15" fill="#3E454C"/><circle cx="${x}" cy="${y}" r="13" fill="url(#studg)" stroke="#4E565D" stroke-width="1.5"/>${[0, 1, 2, 3].map(k => `<circle cx="${x}" cy="${y}" r="${10.5 - k * 2.2}" fill="none" stroke="#8C949B" stroke-width=".9"/>`).join('')}<circle cx="${x}" cy="${y}" r="2.6" fill="#5A6269"/>`; });
  // two guide posts on opposite corners: the module fits one way only
  [[s.x0 + 18, s.y0 + 14], [s.x1 - 18, s.y1 - 14]].forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y}" r="7" fill="#3E454C"/><circle cx="${x}" cy="${y}" r="5.4" fill="url(#studg)"/><circle cx="${x - 1.4}" cy="${y - 1.6}" r="1.6" fill="#FFFFFF" opacity=".7"/>`; });
  // the LGA4677 socket: its slate frame, the pin field split in two halves, the two channels, pin 1, the pads below
  g += `<rect x="346" y="1030" width="130" height="186" rx="5" fill="#3A4458" stroke="#20262F" stroke-width="2"/><rect x="351" y="1035" width="120" height="176" rx="2" fill="url(#lga)"/><path d="M351 1112H471" stroke="#2A2416" stroke-width="1.6"/>`;
  [[389, 9], [413, 9]].forEach(([x, w]) => { g += `<rect x="${x}" y="1078" width="${w}" height="66" rx="1.5" fill="url(#lgaCh)" stroke="#11202A" stroke-width="1"/>`; });
  g += `<path d="M351 1035h14l-14 14z" fill="#F2D27A" stroke="#8C6A1E" stroke-width=".8"/>`;
  for (let k = 0; k < 6; k++) g += `<rect x="${384 + k * 9.5}" y="1224" width="6" height="4" fill="#E2C273"/><rect x="${384 + k * 9.5}" y="1230" width="6" height="4" fill="#E2C273"/>`;
  if (st === 'cover' || st === 'blank') g += `<rect x="338" y="994" width="146" height="258" rx="8" fill="#141618" stroke="#3A3F45" stroke-width="3"/><rect x="382" y="1006" width="58" height="16" rx="6" fill="#2A2E33"/><rect x="382" y="1224" width="58" height="16" rx="6" fill="#2A2E33"/><text x="411" y="1118" text-anchor="middle" style="font:700 15px var(--font);fill:#8E99A3" transform="rotate(-90 411 1123)">SOCKET COVER</text>`;
  if (st === 'blank') {
    g += `<rect x="${s.x0 - 8}" y="${s.y0 - 14}" width="${s.x1 - s.x0 + 16}" height="${s.y1 - s.y0 + 28}" rx="14" fill="#131517" stroke="#3B4046" stroke-width="3"/>`;
    for (let y = s.y0 + 22; y < s.y1 - 20; y += 22) g += `<rect x="${s.x0 + 18}" y="${y}" width="${s.x1 - s.x0 - 36}" height="9" rx="4.5" fill="#1F2225"/>`;
    g += `<rect x="${s.cx - 74}" y="${s.cy - 24}" width="148" height="48" rx="6" fill="#1B1E21"/><text x="${s.cx}" y="${s.cy - 3}" text-anchor="middle" style="font:700 16px var(--font);fill:#9AA4AD">PROCESSOR</text><text x="${s.cx}" y="${s.cy + 16}" text-anchor="middle" style="font:700 16px var(--font);fill:#9AA4AD">BLANK</text>`;
  }
  return g;
}
// the air baffle: clear plastic over the processors and DIMMs, with its printed processor and DIMM labels
function baffleArt() {
  const b = BAFFLE;
  let g = `<g pointer-events="none"><rect x="${b.x0}" y="${b.y0}" width="${b.x1 - b.x0}" height="${b.y1 - b.y0}" rx="14" fill="#DCE6EE" fill-opacity=".36" stroke="#F4F8FB" stroke-opacity=".8" stroke-width="5"/>`;
  // the two hoods over the heatsinks, and the ribs
  [[160, 905, 500, 330], [715, 905, 500, 330]].forEach(([x, y, w, h]) => { g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#EEF4F8" fill-opacity=".22" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="3"/>`; });
  g += `<path d="M${b.x0 + 20} 1290H${b.x1 - 20}M640 ${b.y0 + 10}V${b.y1 - 10}M710 ${b.y0 + 10}V${b.y1 - 10}" stroke="#FFFFFF" stroke-opacity=".45" stroke-width="3"/>`;
  // blue lift tabs at both ends
  g += `<rect x="${b.x0 - 4}" y="1040" width="22" height="80" rx="5" fill="#2F78D6"/><rect x="${b.x1 - 18}" y="1040" width="22" height="80" rx="5" fill="#2F78D6"/>`;
  // printed labels: processor icons and the DIMM slot numbers (black patches, white print)
  const patch = (x, y, w, h, nums, x0) => { let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0E0F10" opacity=".88"/>`; nums.forEach((n, k) => { s += `<text x="${x0 + k * 20}" y="${y + h - 8}" text-anchor="middle" style="font:700 12px var(--font);fill:#F2F2F2">${n}</text>`; }); return s; };
  g += patch(150, 1300, 162, 34, [1, 2, 3, 4, 5, 6, 7, 8], 161) + patch(516, 960, 156, 34, [9, 10, 11, 12, 13, 14, 15, 16], 527) + patch(674, 960, 154, 34, [1, 2, 3, 4, 5, 6, 7, 8], 684.5) + patch(1036, 1300, 156, 34, [9, 10, 11, 12, 13, 14, 15, 16], 1046);
  [[411, 'P2'], [955, 'P1']].forEach(([x, nm]) => { g += `<rect x="${x - 48}" y="928" width="96" height="44" rx="4" fill="#0E0F10" opacity=".9"/><rect x="${x - 38}" y="938" width="22" height="22" rx="3" fill="none" stroke="#F2F2F2" stroke-width="3"/><text x="${x + 14}" y="960" text-anchor="middle" style="font:800 22px var(--font);fill:#F2F2F2">${nm}</text>`; });
  return g + `</g>`;
}
// everything inside the chassis, in W units
function insideArt(t) { return `${t.sock2 === 'phm' ? phmImg(2) : sock2Art(t)}${phmImg(1)}${dimmArt(t)}${t.baffle ? baffleArt() : ''}`; }

/* ---- Numbered parts: the "System board components" diagram on the service label (items 1 to 30 and X), placed on
   the photo from the diagram, and the larger parts lettered A to I. W positions; in: shown with the air baffle in;
   out: shown with it out ---- */
const PARTS = [
  { n: '1', t: 'Front DisplayPort / USB 2.0 port connector', pos: [[1052, 583]], d: 'Cable to the front DisplayPort and USB 2.0 ports (optional front I/O).' },
  { n: '2', t: 'OCP slot 14 port 2', pos: [[1148, 536]], d: 'Second cable port for the OCP NIC in slot 14.' },
  { n: '3', t: 'LP SlimSAS port 2', pos: [[1155, 619]], d: 'Low-profile SlimSAS connector, for drive backplane cables.' },
  { n: '4', t: 'LP SlimSAS port 1', pos: [[1155, 707]], d: 'Low-profile SlimSAS connector, for drive backplane cables.' },
  { n: '5', t: 'Primary riser connector', pos: [[900, 660]], d: 'Under the primary riser cage (PCIe slots 1 to 3). The riser plugs in here.' },
  { n: '6', t: 'Front I/O and USB 3.2 Gen 1 port connector', pos: [[1088, 816]], d: 'Cable to the front panel: power button, LEDs, the iLO Service Port and the USB 3.2 port.' },
  { n: '7', t: 'OCP slot 14 backup power connector', pos: [[934, 791]], d: 'Auxiliary power for the OCP card in slot 14.' },
  { n: '8', t: 'SATA optical port', pos: [[1130, 872]], d: 'For an optional optical drive.' },
  { n: '9', t: 'Socket 1 MCIO port 1', pos: [[813, 818]], d: 'MCIO cable connector wired to processor 1, for NVMe or riser cables.' },
  { n: '10', t: 'x8 SlimSAS ports', pos: [[675, 1705]], d: 'At the front edge of the board, under the fans: numbered 1B to 4B, then 1A to 4A, left to right. B ports belong to processor 2, A ports to processor 1.' },
  { n: '11', t: 'Drive box 1 power connector', pos: [[1023, 1705]], d: 'Power for the drive backplane of box 1, at the front edge of the board.' },
  { n: '12', t: 'Drive box 2 power connector', pos: [[533, 1705]], d: 'Power for the drive backplane of box 2.' },
  { n: '13', t: 'Drive box 3 power connector', pos: [[189, 1705]], d: 'Power for the drive backplane of box 3.' },
  { n: '14', t: 'Internal USB ports', pos: [[341, 900]], in: 0, d: 'Top: USB 3.2 Gen 1, bottom: USB 2.0. For a boot key, for example. At the rear edge of the air baffle.' },
  { n: '15', t: 'Socket 2 MCIO port 1', pos: [[244, 906]], in: 0, d: 'MCIO cable connector wired to processor 2.' },
  { n: '16', t: 'Socket 2 MCIO port 2', pos: [[201, 887]], in: 0, d: 'MCIO cable connector wired to processor 2.' },
  { n: '17', t: 'Backplane power connector', pos: [[131, 820]], d: 'Power for a backplane, for example the rear or midplane drive cage.' },
  { n: '18', t: 'Chassis intrusion detection connector', pos: [[137, 763]], d: 'For the optional switch that reports when the access panel is opened.' },
  { n: '19', t: 'SID connector', pos: [[577, 741]], d: 'For the optional Systems Insight Display at the front.' },
  { n: '20', t: 'Secondary riser connector', pos: [[518, 574]], d: 'The secondary riser (PCIe slots 4 to 6) plugs in here. It needs the second processor.' },
  { n: '21', t: 'System battery', pos: [[765, 713]], d: 'The coin cell that keeps the clock and the settings while the server has no power.' },
  { n: '22', t: 'OCP slot 15 backup power connector', pos: [[666, 668]], d: 'Auxiliary power for the OCP card in slot 15.' },
  { n: '23', t: 'Energy pack connector', pos: [[638, 609]], d: 'For the HPE Smart Storage energy pack that backs up the storage controller cache.' },
  { n: '24', t: 'NS204i-u power connector', pos: [[710, 617]], d: 'Power for the NS204i-u boot device (two mirrored M.2 drives).' },
  { n: '25', t: 'Tertiary riser connector', pos: [[492, 532]], d: 'The tertiary riser (PCIe slots 7 and 8) plugs in here. It needs the second processor.' },
  { n: '26', t: 'OCP slot 15 port 1', pos: [[666, 527]], d: 'First cable port for the OCP NIC in slot 15.' },
  { n: '27', t: 'OCP slot 15 port 2', pos: [[741, 527]], d: 'Second cable port for the OCP NIC in slot 15.' },
  { n: '28', t: 'Auxiliary power connector, secondary riser', pos: [[508, 328]], d: 'Extra power for cards in the secondary riser.' },
  { n: '29', t: 'Serial port connector (optional)', pos: [[545, 245]], d: 'For the optional rear serial port.' },
  { n: '30', t: 'Auxiliary power connector, primary riser', pos: [[892, 326]], d: 'Extra power for cards in the primary riser.' },
  { n: 'X', t: 'System maintenance switch', pos: [[829, 660]], d: 'All off by default. Position 1 on: iLO security override. 5 on: password disabled. 6 on: reset the configuration.' },
  { n: 'A', t: 'Processors P2 and P1', pos: [[400, 1105], [955, 1105]], in: 0, go: 'cpu', d: 'P2 on the left, P1 on the right. Socket 1 must always be populated.' },
  { n: 'B', t: 'DIMM slots, 16 per processor', pos: [[231, 1250], [594, 1250], [751, 1250], [1114, 1250]], in: 0, go: 'mem', d: 'Slots 1 to 8 left of each processor, 9 to 16 right of it.' },
  { n: 'C', t: 'Fan modules 1 to 6', pos: [[430, 1600]], d: 'Six hot-plug high-performance fans, numbered 1 to 6 from left to right on the fan cage.' },
  { n: 'D', t: 'Primary riser cage (PCIe slots 1 to 3)', pos: [[1100, 330]], d: 'Holds the storage controller (the RAID controller) in this server. As its label shows: to remove it, lift the two blue plungers and turn them 180 degrees, then lift the cage out; to refit it, lower it on, press at "Press Here", and turn the plungers back.' },
  { n: 'E', t: 'Secondary riser cage (PCIe slots 4 to 6)', pos: [[510, 120]], d: 'Optional, needs the second processor.' },
  { n: 'F', t: 'Tertiary riser cage (PCIe slots 7 and 8)', pos: [[255, 450]], d: 'Optional, needs the second processor. The power supplies sit under it.' },
  { n: 'G', t: 'Power supplies PS1 and PS2', pos: [[210, 120]], d: 'Two hot-plug Flex Slot supplies, slid in from the rear under the slot 7 and 8 cage.' },
  { n: 'H', t: 'Drive backplanes, boxes 1 to 3', pos: [[675, 1905]], go: 'front', d: 'Eight SFF bays per box. The drives plug into these from the front.' },
  { n: 'I', t: 'Air baffle', pos: [[675, 1040]], in: 1, out: 0, d: 'Clear plastic over the processors and DIMMs, printed with the DIMM numbers. Lift it out by its blue tabs.' }];
const partVis = (p, t) => t.cover === 'off' && (t.baffle ? p.in !== 0 : p.out !== 0);
let HL = null, LZ = false;
function partMarks(t) {
  let g = '';
  PARTS.forEach(p => {
    if (!partVis(p, t)) return;
    const on = HL === p.n;
    p.pos.forEach(([x, y]) => {
      const [cx, cy] = TV(x, y), lt = /[A-I]/.test(p.n);
      g += `<g${hot('partInfo', p.n, `${p.n}. ${p.t}`)}>${on ? `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="15" fill="none" stroke="#FFB52E" stroke-width="3" class="blink"/>` : ''}<circle cx="${f1(cx)}" cy="${f1(cy)}" r="9.5" fill="${on ? '#FFB52E' : lt ? '#BFE3FF' : '#FFFFFF'}" stroke="#14202B" stroke-width="1.6"/><text x="${f1(cx)}" y="${f1(cy + 3.8)}" text-anchor="middle" style="font:700 ${p.n.length > 1 ? 9.5 : 11}px var(--font);fill:#14202B;pointer-events:none">${p.n}</text></g>`;
    });
  });
  return g;
}
function partsLegend(t) {
  const open = t.cover === 'off';
  return `<h3>Component locations</h3><p class="cap" style="font-size:13px;margin:0 0 6px">Numbers 1 to 30 and X as on the "System board components" diagram of the service label inside the access panel; letters mark the larger parts. ${open ? (t.baffle ? 'Items A, B, 14, 15 and 16 are under the air baffle: lift it out to see them.' : 'Refit the air baffle (I) before the panel goes back on.') : 'Remove the access panel to see the numbers on the photo.'} Click a row to find it.</p>
    <div class="plist">${PARTS.map(p => `<button class="prow${HL === p.n ? ' on' : ''}${partVis(p, t) ? '' : ' dim'}" data-act="partInfo" data-arg="${p.n}"><b>${p.n}</b><span><strong>${esc(p.t)}</strong><em>${esc(p.d)}</em></span></button>`).join('')}</div>`;
}
Sim.on('partInfo', n => {
  const p = PARTS.find(q => q.n === String(n)); if (!p) return;
  HL = HL === p.n && Sim.coach.msg.startsWith(p.n + '.') ? null : p.n;
  say('info', `${p.n}. ${p.t}. ${p.d}${partVis(p, T) ? '' : T.cover !== 'off' ? ' (Under the access panel.)' : ' (Under the air baffle.)'}`);
});
Sim.on('labelZoom', () => { LZ = !LZ; });

/* ---- the access panel latch. The close-up photo (hpLatch, 705 x 247, front at the left): the recess x 79..628,
   y 43..204. The latch is one rigid piece, pivoted at its front (rounded) end. Lifting its rear end (near the T-15
   security screw) tilts the whole latch up about that pivot, and its cam pushes the panel about 1.25 cm toward
   the rear. Seen from above, the tilted latch looks shorter (foreshortened toward the pivot) and its rear end, nearer
   to you, a little wider; its shadow falls on the recess floor behind it. ---- */
const LT = { piv: 92, end: 628, top: 43, bot: 204, cos: 0.8, sy: 1.06 };
const latchShape = () => { const L = LT, r = (L.bot - L.top) / 2; return `M${L.end} ${L.top}H${L.piv - 13 + r}A${r} ${r} 0 0 0 ${L.piv - 13 + r} ${L.bot}H${L.end}Z`; };
function latchArt(open, anim, id) {
  const L = LT, my = (L.top + L.bot) / 2;
  if (!open && !anim) return `<image href="${IMG.hpLatch}" width="705" height="247"/>`;
  // the photo, then the empty recess (its floor and side rails), then the latch as one piece on its front pivot
  let g = `<defs><clipPath id="${id}"><path d="${latchShape()}"/></clipPath></defs><image href="${IMG.hpLatch}" width="705" height="247"/>`;
  g += `<path d="${latchShape()}" fill="#07080A"/><path d="M${L.piv + 40} ${L.top + 26}H${L.end - 24}M${L.piv + 40} ${L.bot - 26}H${L.end - 24}" stroke="#1A1E22" stroke-width="5"/><rect x="${L.end - 64}" y="${my - 18}" width="36" height="36" rx="4" fill="#2A2F35"/>`;
  const tf = `translate(${L.piv} ${my}) scale(${L.cos} ${L.sy}) translate(${-L.piv} ${-my})`;
  // its shadow on the recess floor: longer than the latch, offset toward the rear
  g += `<g opacity="${open ? '.55' : '0'}">${anim ? `<animate attributeName="opacity" values="${open ? '0;.55' : '.55;0'}" dur="0.4s" begin="${anim.match(/begin="([^"]+)"/)[1]}" fill="freeze"/>` : ''}<g transform="translate(${L.piv} ${my})"><g transform="${anim ? '' : `scale(${(1 + L.cos) / 2} 1)`}">${anim ? anim.replace('%V', open ? `1 1;${(1 + L.cos) / 2} 1` : `${(1 + L.cos) / 2} 1;1 1`) : ''}<g transform="translate(${-L.piv} ${-my}) translate(18 10)"><path d="${latchShape()}" fill="#000"/></g></g></g></g>`;
  g += `<g transform="translate(${L.piv} ${my})"><g transform="${anim ? '' : `scale(${L.cos} ${L.sy})`}">${anim ? anim.replace('%V', open ? `1 1;${L.cos} ${L.sy}` : `${L.cos} ${L.sy};1 1`) : ''}<g transform="translate(${-L.piv} ${-my})">`;
  g += `<image href="${IMG.hpLatch}" width="705" height="247" clip-path="url(#${id})"/><path d="${latchShape()}" fill="none" stroke="#3E454C" stroke-width="3"/><rect x="${L.end - 6}" y="${L.top + 4}" width="6" height="${L.bot - L.top - 8}" fill="#9AA3AB" opacity=".6"/>`;
  g += `</g></g></g>`;
  return g;
}
// the latch from the side: one straight piece on its front pivot, flat (closed) or tilted up (open, panel slid back)
function latchSide(open, X, Y) {
  const sh = open ? 14 : 0, px = X + 20 + sh, len = 120, ang = open ? 24 : 0, ex = px + len * Math.cos(ang * Math.PI / 180), ey = Y - 3 - len * Math.sin(ang * Math.PI / 180);
  let g = `<rect x="${X - 6}" y="${Y - 70}" width="182" height="100" rx="8" fill="#16293A" stroke="#2E5571"/><text x="${X + 4}" y="${Y - 54}" class="ss" style="font-size:10.5px">From the side</text>`;
  g += `<rect x="${X + sh}" y="${Y}" width="150" height="7" fill="#AEB7BF"/><rect x="${X - 2}" y="${Y + 7}" width="166" height="5" fill="#59626A"/>`;
  g += `<path d="M${px} ${Y - 3}L${f1(ex)} ${f1(ey)}" stroke="#16191C" stroke-width="10" stroke-linecap="round"/><circle cx="${px}" cy="${Y - 3}" r="4" fill="#C9CFD4"/>`;
  g += `<text x="${X + 4}" y="${Y + 24}" class="ss" style="font-size:9.5px">front</text><text x="${X + 168}" y="${Y + 24}" text-anchor="end" class="ss" style="font-size:9.5px">rear</text>`;
  if (open) g += `<path d="M${X + 88} ${Y + 19}h36m-7 -5l7 5l-7 5" fill="none" stroke="${CUE}" stroke-width="2.2"/><text x="${f1(ex - 4)}" y="${f1(ey - 10)}" text-anchor="end" class="ss" style="font-size:9.5px;fill:#FFD27A">rear end up</text>`;
  else if (Sim.guide) g += `<g pointer-events="none"><animateTransform attributeName="transform" type="translate" values="0 2;0 -4;0 2" dur="1.3s" repeatCount="indefinite"/><path d="M${f1(ex - 8)} ${Y - 12}v-26m-8 9l8 -10l8 10" fill="none" stroke="${CUE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  return g;
}
function chassisSvg(t) {
  const on = t.cover !== 'off', lifted = t.cover === 'lifted' || t.cover === 'placed';
  let g = `<g transform="${vtT}"><image href="${IMG.hpInt}" width="${WV.W}" height="${WV.H}"/>${insideArt(t)}`;
  if (!on) {
    // click zones inside: the heatsinks and DIMMs (open their views), the baffle, the drive area
    if (t.baffle) g += `<g${hot('baffle', '', 'Air baffle: lift it out by its blue tabs')}><rect x="${BAFFLE.x0}" y="${BAFFLE.y0}" width="${BAFFLE.x1 - BAFFLE.x0}" height="${BAFFLE.y1 - BAFFLE.y0}" rx="14" class="zone"/></g>`;
    else {
      [1, 2].forEach(k => { const [x, y, w, h] = PHMPOS[k]; g += `<g${hot('go', 'cpu', `Processor ${k}: open the Processors view`)}><rect x="${x + 110}" y="${y + 20}" width="${w - 220}" height="${h - 80}" rx="10" class="zone"/></g>`; });
      [[150, 312], [516, 674], [674, 828], [1036, 1192]].forEach(([a, b]) => { g += `<g${hot('go', 'mem', 'DIMM slots: open the Memory view')}><rect x="${a}" y="${SLOTY[0]}" width="${b - a}" height="${SLOTY[1] - SLOTY[0]}" rx="6" class="zone"/></g>`; });
    }
  }
  if (on) {
    const a = fxAge('cover'), from = t.cover === 'closed' ? COVER.back : 0, to = lifted ? COVER.back : 0;
    const anim = a < 0.6 && from !== to ? `<animateTransform attributeName="transform" type="translate" from="0 ${from}" to="0 ${to}" dur="0.5s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : '';
    g += `<g transform="translate(0 ${to})">${anim}<image href="${IMG.hpCover}" x="${COVER.x}" y="${COVER.y}" width="${COVER.w}" height="${COVER.h}"/>`;
    if (t.cover === 'lifted') g += `<g${hot('panelOff', '', 'Access panel, latch open: lift the panel straight up')}><rect x="${COVER.x + 20}" y="${COVER.y + 20}" width="${COVER.w - 40}" height="${COVER.h - 40}" class="zone"/></g>`;
    g += `</g>`;
  }
  g += `</g>`;
  // the latch on the panel (screen units: the panel's latch, front end at the left)
  if (on) {
    const [x1, y0] = TV(LATCH.x, LATCH.y + LATCH.h), [x2, y1] = TV(LATCH.x + LATCH.w, LATCH.y), sh = lifted ? -COVER.back * VT.k : 0;
    const w = x2 - x1, s = w / 549, ox = x1 - 79 * s + sh, oy = y0 - 43 * s;
    if (lifted) g += `<g transform="translate(${f1(ox)} ${f1(oy)}) scale(${s.toFixed(4)})" pointer-events="none">${latchArt(true, '', 'mini')}</g>`;
    g += `<g${hot('latch', '', lifted ? 'Access panel latch, open: press it down' : 'Access panel latch, closed: lift its rear end')}><rect x="${f1(x1 - 8 + sh)}" y="${f1(y0 - 8)}" width="${f1(w + 16)}" height="${f1(y1 - y0 + 16)}" rx="10" class="zone"/></g>`;
    const cx = x1 + w / 2 + sh, cy = (y0 + y1) / 2;
    if (Sim.guide) g += `<g pointer-events="none"><rect x="${f1(cx - w / 2 - 12)}" y="${f1(cy - 22)}" width="${f1(w + 24)}" height="44" rx="10" fill="none" stroke="#FFB52E" stroke-width="2.4"><animate attributeName="stroke-opacity" values=".9;.15;.9" dur="1.8s" repeatCount="indefinite"/></rect></g>`;
  }
  // in the rack: only the front is reachable
  if (t.rack.pos === 'in') g += `<g pointer-events="none"><rect x="${VT.x}" y="${VT.y}" width="${f1(WV.H * VT.k)}" height="${f1(WV.W * VT.k)}" fill="#0E1A22" opacity=".55"/><rect x="${VT.x + 210}" y="${VT.y + 222}" width="444" height="56" rx="10" fill="#0E1A22" stroke="#FFB52E" stroke-width="2"/><text x="${VT.x + 432}" y="${VT.y + 246}" text-anchor="middle" class="st" style="fill:#FFD27A">The server is pushed into the rack</text><text x="${VT.x + 432}" y="${VT.y + 266}" text-anchor="middle" class="ss">Extend it on its rails first (Rack view) to reach the access panel.</text></g>`;
  if (!on) g += partMarks(t);
  // labels round the view
  const yb = VT.y + WV.W * VT.k;
  g += `<text x="${VT.x}" y="${f1(yb + 15)}" class="st">Front</text><text x="${f1(VT.x + WV.H * VT.k)}" y="${f1(yb + 15)}" text-anchor="end" class="st">Rear</text><text x="${f1(VT.x + WV.H * VT.k / 2)}" y="${f1(yb + 15)}" text-anchor="middle" class="ss">Top view, front at the left${on ? '' : `: P2 at the top, P1 below it${t.baffle ? ', under the air baffle' : ''}`}</text>`;
  // bottom row
  const Y = yb + 30;
  if (on) {
    const k = 0.62, open = lifted, a = fxAge('latch');
    const anim = a < 0.5 ? `<animateTransform attributeName="transform" type="scale" values="%V" dur="0.4s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : '';
    const animOpen = anim && open ? anim : '', animClose = anim && !open ? anim : '';
    g += `<rect x="${VT.x}" y="${Y}" width="${f1(705 * k + 16)}" height="${f1(247 * k + 16)}" rx="8" fill="#0E1A22" stroke="#8E99A3" stroke-width="1.5"/><g transform="translate(${VT.x + 8} ${Y + 8}) scale(${k})"><defs><clipPath id="latpanel"><rect width="705" height="247" rx="6"/></clipPath></defs><g clip-path="url(#latpanel)">${latchArt(open, open ? animOpen : animClose, 'big')}</g>`;
    g += `<g${hot('latch', '', open ? 'Latch open: press it down' : 'Latch closed: lift it by its rear end')}><rect x="${LT.piv - 50}" y="${LT.top - 8}" width="${LT.end - LT.piv + 60}" height="${LT.bot - LT.top + 16}" rx="60" class="zone"/></g>`;
    if (!open && Sim.guide) g += `<g pointer-events="none">${pulse(LT.end - 40, (LT.top + LT.bot) / 2, 22, 50)}<g><animateTransform attributeName="transform" type="translate" values="0 6;0 -8;0 6" dur="1.3s" repeatCount="indefinite"/><path d="M${LT.end - 40} ${LT.top - 2}V${LT.top - 40}M${LT.end - 54} ${LT.top - 26}L${LT.end - 40} ${LT.top - 42}L${LT.end - 26} ${LT.top - 26}" fill="none" stroke="#14202B" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M${LT.end - 40} ${LT.top - 2}V${LT.top - 40}M${LT.end - 54} ${LT.top - 26}L${LT.end - 40} ${LT.top - 42}L${LT.end - 26} ${LT.top - 26}" fill="none" stroke="${CUE}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
    g += `<g${hot('latchScrew', '', 'Latch security screw (T-15 Torx)')}><circle cx="${f1(open ? LT.piv + (452 - LT.piv) * LT.cos : 452)}" cy="127" r="34" class="zone"/></g></g>`;
    g += `<text x="${VT.x}" y="${f1(Y + 247 * k + 32)}" class="ss">Access panel latch, close up: one piece, its pivot at the front (left), the T-15 screw near the rear</text>`;
    const SX = VT.x + 705 * k + 32;
    g += latchSide(open, SX + 6, Y + 82);
    const TX = SX + 196, lines = t.cover === 'closed' ? ['Latch closed.', 'Lift it by its rear end: the', 'whole latch tilts up on its front', 'pivot and pushes the panel', 'about 1.25 cm toward the rear.'] : t.cover === 'lifted' ? ['Latch open, tilted up in one', 'piece: the panel has slid', 'back about 1.25 cm. Lift the', 'panel straight up by its edges.'] : ['Panel on, latch open, about', '1.25 cm past the rear.', 'Press the latch down: it', 'slides the panel forward', 'and closes it.'];
    lines.forEach((s2, i) => { g += `<text x="${TX}" y="${Y + 16 + i * 17}" class="${i ? 'ss' : 'st'}">${esc(s2)}</text>`; });
    g += `<text x="${TX}" y="${Y + 112}" class="st" style="font-size:12px">Security screw</text><text x="${TX}" y="${Y + 128}" class="ss">T-15 Torx in the latch: turned</text><text x="${TX}" y="${Y + 143}" class="ss">to the lock symbol, the latch</text><text x="${TX}" y="${Y + 158}" class="ss">cannot open. Unlocked here.</text>`;
  } else {
    // the service label, small; click to zoom
    const lw = 250, lh = lw * 858 / 1500, LX = 900 - 14 - lw;
    g += `<g${hot('labelZoom', '', 'Service label inside the access panel: click to enlarge')}><rect x="${LX - 4}" y="${Y - 4}" width="${lw + 8}" height="${f1(lh + 8)}" rx="6" fill="#0E1A22" stroke="#8E99A3"/><image href="${IMG.hpService}" x="${LX}" y="${Y}" width="${lw}" height="${f1(lh)}"/><rect x="${LX + lw - 30}" y="${Y + 4}" width="26" height="26" rx="5" fill="#14202B" opacity=".85"/><path d="M${LX + lw - 22} ${Y + 12}h-4v10m4 -10l-4 0M${LX + lw - 12} ${Y + 22}h4v-10" stroke="#EAF2F7" stroke-width="2" fill="none"/><circle cx="${LX + lw - 17}" cy="${Y + 17}" r="5" fill="none" stroke="#EAF2F7" stroke-width="2"/><rect x="${LX - 4}" y="${Y - 4}" width="${lw + 8}" height="${f1(lh + 8)}" rx="6" class="zone"/></g>`;
    g += `<text x="${LX}" y="${f1(Y + lh + 20)}" class="ss" style="font-size:11px">Service label (inside the panel): click to enlarge</text>`;
    const st = [['ESD wrist strap', t.esd ? 'on, clipped to bare chassis metal' : 'not on'], ['Air baffle', t.baffle ? 'in place over the processors and DIMMs' : 'out'], ['Processors', `${cpuCount(t)} of 2 installed`], ['DIMMs', `${dimmCount(t)} installed (${memGB(t)} GB)`], ['Server', extended(t) ? 'extended on its rails' : 'in the rack']];
    st.forEach(([a, b], i) => { g += `<text x="${VT.x}" y="${Y + 14 + i * 20}" class="st" style="font-size:12.5px">${a}:</text><text x="${VT.x + 116}" y="${Y + 14 + i * 20}" class="ss">${esc(b)}</text>`; });
    g += `<text x="${VT.x}" y="${Y + 120}" class="ss" style="fill:#9FB3C2">Click a number on the photo, or a row in the list, to see what it is.</text>`;
  }
  // the label, enlarged
  if (LZ && !on) g += `<g${hot('labelZoom', '', 'Service label, enlarged: click to close')}><rect x="0" y="0" width="900" height="760" fill="#0A1218" opacity=".9"/><image href="${IMG.hpService}" x="10" y="44" width="880" height="${f1(880 * 858 / 1500)}"/><rect x="760" y="10" width="130" height="28" rx="8" fill="#14202B" stroke="#8E99A3"/><text x="825" y="29" text-anchor="middle" style="font:600 13px var(--font);fill:#EAF2F7">Close &#10005;</text><text x="10" y="${f1(56 + 880 * 858 / 1500)}" class="ss">Service label inside the access panel: system board components (left), front and rear components and front panel LEDs (right).</text></g>`;
  return frame(on ? 'Top view: access panel' : 'Top view: inside, numbered as on the service label', g, 760);
}

Sim.registerView({
  id: 'chassis', title: 'Top view and access panel',
  keep: [
    ['Power off first', 'Shut the server down and disconnect every power cord before you remove the access panel: in standby, power is still present. Wait for hot parts to cool.'],
    ['Extend it first', 'In a rack, pull down the quick-release levers on both rack ears and extend the server on its rails before you open it (Rack view).'],
    ['ESD', 'Wear an ESD wrist strap clipped to bare chassis metal before you touch anything inside.'],
    ['Removing the panel', 'If the T-15 Torx screw in the latch is locked, unlock it. Lift the latch by its rear end: the whole latch tilts up on its front pivot and the panel slides toward the rear. Then lift the panel straight up.'],
    ['Refitting the panel', 'Set the panel on the chassis with the latch open, about 1.25 cm (0.5 in) past the rear. Press the latch down: it slides the panel forward and closes it.'],
    ['Air baffle', 'The clear air baffle sits over the processors and DIMMs. Lift it out by its blue tabs, and always refit it: without it, air bypasses the heatsinks.'],
    ['Never run it open', 'Do not operate the server without the access panel, the air baffle, expansion slot covers or blanks.'],
    ['The service label', 'The label under the access panel numbers the system board components (1 to 30 and X), shows P1 on the right and P2 on the left with the front at the bottom, and lists the front panel LEDs.']],
  render: t => chassisSvg(t),
  actions(t) {
    const a = [button(t.esd ? 'Remove ESD wrist strap' : 'Put on ESD wrist strap', 'esd')];
    if (t.cover === 'lifted') a.push(button('Lift the access panel off', 'panelOff'));
    if (t.cover === 'off') { a.push(button(t.baffle ? 'Lift out the air baffle' : 'Refit the air baffle', 'baffle')); a.push(button('Set the access panel on the chassis, latch open', 'panelPlace')); a.push(button(LZ ? 'Close the service label' : 'Enlarge the service label', 'labelZoom')); }
    return a;
  },
  tray(t) {
    const proc = `<h3>Access panel (HPE procedure)</h3><ol class="rules"><li>Power down, disconnect both power cords, extend the server from the rack.</li><li>If the latch's T-15 Torx screw is locked, unlock it.</li><li>Lift the latch by its rear end: it tilts up in one piece and the panel slides toward the rear. Lift the panel off.</li><li><b>Refit:</b> panel on with the latch open, about 1.25 cm (0.5 in) past the rear; press the latch down; lock the screw if needed.</li></ol>`;
    return `<div class="just">${proc}</div>` + partsLegend(t);
  }
});
Sim.on('esd', () => { T.esd = !T.esd; say(T.esd ? 'ok' : 'warn', T.esd ? 'ESD wrist strap on and clipped to bare chassis metal.' : 'ESD wrist strap removed.'); });
Sim.on('latchScrew', () => say('info', 'Latch security screw, T-15 Torx: turned to the lock symbol, it locks the latch so the panel cannot be opened. It is unlocked on this server.'));
Sim.on('latch', () => {
  if (T.cover === 'closed') {
    if (isOn(T)) return bad('The server is running. Shut it down and disconnect the power cords before you open it.');
    if (acOn(T)) return bad('Disconnect both power cords first: in standby, power is still present in the server.');
    if (!extended(T)) return bad('The server is pushed into the rack. Extend it on its rails first (Rack view): pull down both quick-release levers and slide it out.');
    T.cover = 'lifted'; fxMark('cover'); fxMark('latch'); Sim.sound('clipOpen');
    return say('ok', 'Latch lifted by its rear end: the whole latch tilted up on its front pivot and pushed the access panel about 1.25 cm toward the rear. Now lift the panel straight up.');
  }
  if (T.cover === 'lifted' || T.cover === 'placed') {
    const was = T.cover; T.cover = 'closed'; fxMark('cover'); fxMark('latch'); Sim.sound('cover');
    return say('ok', was === 'placed' ? 'Latch pressed down: it pulled the access panel forward into place and closed it.' : 'Latch pressed back down: the panel slid forward and closed again.');
  }
});
Sim.on('panelOff', () => { if (T.cover !== 'lifted') return bad('Lift the latch first: the panel comes off only with the latch open.'); T.cover = 'off'; LZ = false; say('ok', 'Access panel lifted straight up and set aside, label side up. The service label is on its underside.'); });
Sim.on('panelPlace', () => {
  if (T.cover !== 'off') return;
  if (!T.baffle) return bad('Refit the air baffle first. Without it, the air bypasses the heatsinks.');
  if (T.sock2 === 'phm' && !T.nuts2.every(Boolean)) return bad('Processor 2\'s heatsink nuts are not all tightened. Finish the processor first (Processors view).');
  if (T.sock2 === 'empty' || T.sock2 === 'cover') return bad('Socket 2 has neither a processor nor its blank. Install the processor (or refit the socket cover and the blank) first.');
  T.cover = 'placed'; LZ = false; fxMark('cover');
  say('ok', 'Access panel set on the chassis with the latch open, about 1.25 cm past the rear. Now press the latch down.');
});
Sim.on('baffle', () => {
  if (T.cover !== 'off') return bad('Remove the access panel first.');
  if (T.baffle) { if (!T.esd) return bad('Put on the ESD wrist strap first.'); T.baffle = false; return say('ok', 'Air baffle lifted out by its blue tabs. The processors and the DIMM slots are now reachable.'); }
  if (Object.keys(T.memOpen).some(k => T.memOpen[k])) return bad('A DIMM slot still has its latches open. Close them, or fit the DIMM, first (Memory view).');
  if (memBlock(T)) return bad(memBlock(T));
  T.baffle = true; say('ok', 'Air baffle back in place over the processors and the DIMMs.');
});
