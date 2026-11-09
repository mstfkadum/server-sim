/* ==========================================================================================================
   Model pack: Dell PowerEdge R6515. Profile, work order, the rack, twin state and readiness rules.
   © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved.
   The build wraps this pack's files in one function scope, so nothing here collides with another model.
   ========================================================================================================== */
/* Sources: Dell PowerEdge R6515 Installation and Service Manual (Rev. A14): system overview (1U, one AMD EPYC), front
   view (the information tag is the slide-out label panel on the left control panel: Service Tag, Express Service Code),
   "Setting up the system" (install the system into the rack as the rail installation guide says, then connect and
   power on). Dell rail installation guide for ReadyRails sliding rails, drop-in design: rear end piece on the rear
   post first, then the front, both rails at the same U; pull the inner rails out until they lock; rear standoffs into
   the rear J-slots, rotate the system down until every standoff seats in its hook (no lock lever on this kit); pull
   the blue slide-release lock tabs and slide the system into the rack. To slide it out again: press the latch on each
   rack ear, pull; to return it: the blue tabs, push until the ear latches click. The trainer's photos of this server. */
const PROFILE = { name: 'Dell PowerEdge R6515', rackUnits: 1, weightKg: 22, rail: 'ReadyRails sliding rails, 1U, drop-in design', bmc: 'iDRAC9' };
// Work order from the trainer. The Service Tag is invented; the Express Service Code is that tag read as a base-36 number,
// as on a real tag.
const WO = { tag: 'LAB6515', esc: parseInt('LAB6515', 36), u: 20, rack: 'Rack 1', rails: 'ReadyRails sliding rails, 1U kit (drop-in)' };
// The rack: U14 to U27 of the trainer's rack, numbered on the strip beside the left post. What is in it, bottom unit and height.
const RACK = { lo: 14, hi: 27, used: { 14: ['4U storage shelf', 4], 18: ['Dell EMC PowerEdge, 2U', 2], 21: ['Cisco UCS C220 M4', 1], 22: ['Cisco UCS C240 M4', 2], 24: ['Cisco UCS C240 M5', 2] } };
const usedAt = u => { for (const k in RACK.used) { const [name, h] = RACK.used[k]; if (u >= +k && u < +k + h) return name; } return null; };
const freeU = u => u >= RACK.lo && u <= RACK.hi && !usedAt(u);
const SIDE = { l: 'left', r: 'right' };
const MARK = { l: 'LEFT', r: 'RIGHT' };
const cap = s => s[0].toUpperCase() + s.slice(1);
const f1 = n => (+n).toFixed(1);

/* ============ Twin state ============
   pullTab: the information tag is out; tagRead: it was read against the work order.
   rack.u: the marked rack unit; rack.hand: the rail picked up ('l' or 'r'); rack.rail[k]: its rear end seated, its front
   latch pulled open, its front end seated; rack.ext: the inner rails pulled out and locked; rack.pos: where the server is
   ('cart', 'hung' = rear standoffs in the rear J-slots, 'locked' = every standoff in its J-slot hook, 'in' = in the rack,
   'out' = slid out again to the service position); rack.tabs: the blue
   slide-release lock tabs pulled; rack.ear: the latch on each rack ear pressed; rack.cycled: slid out on the ear
   latches and pushed back until they clicked. */
function fresh() {
  return {
    errors: 0, log: [], flags: {}, pullTab: false, tagRead: false,
    rack: { u: null, hand: null, rail: { l: { rear: false, latch: false, front: false }, r: { rear: false, latch: false, front: false } }, ext: false, pos: 'cart', tabs: { l: false, r: false }, ear: { l: false, r: false }, cycled: false }
  };
}
const railDone = (t, k) => t.rack.rail[k].rear && t.rack.rail[k].front;
const railsDone = t => railDone(t, 'l') && railDone(t, 'r');
const railAny = t => t.rack.rail.l.rear || t.rack.rail.r.rear;
const onRails = t => ['locked', 'in', 'out'].includes(t.rack.pos);

Sim.registerRule(t => {
  const i = [], r = t.rack;
  if (!t.tagRead) i.push({ lvl: 'warn', msg: 'The Service Tag was not checked against the work order.' });
  if (t.pullTab) i.push({ lvl: 'fail', msg: 'The information tag is still pulled out.' });
  if (r.u !== WO.u) i.push({ lvl: 'fail', msg: `The work order says U${WO.u}.` });
  if (r.pos !== 'in') i.push({ lvl: 'fail', msg: 'The server is not in the rack.' });
  else if (!r.cycled) i.push({ lvl: 'warn', msg: 'Not checked: slide the server out on its ear latches and push it back until they click.' });
  if (t.memLab || dimmList(t).length) {
    if (!memOk(t)) i.push({ lvl: 'fail', msg: memWhy(t) });
    if (SLOTS.some(s => t.memOpen && t.memOpen[s])) i.push({ lvl: 'warn', msg: 'A memory socket still has its ejector latches open.' });
    if (t.cpu && t.cpu.shroud !== 'in') i.push({ lvl: 'fail', msg: 'The air shroud is out: never run the system without it.' });
    if (t.cpu && t.cpu.cover !== 'locked') i.push({ lvl: 'fail', msg: 'The system cover is not on and locked.' });
  }
  if (t.cpu) {
    const c = t.cpu;
    ['idrac', 'gb1', 'gb2', 'psu1', 'psu2'].forEach(k => {
      if (cabWrong(t, k)) i.push({ lvl: 'fail', msg: `${CAB_LABEL[k]} is plugged into the wrong port/outlet (work order specifies ${wantPortTxt(k)}).` });
      else if (!c.cab[k]) i.push({ lvl: 'fail', msg: `${CAB_LABEL[k]} is not connected (${wantPortTxt(k)}).` });
    });
    if (c.cab.psu1 && !c.strap.psu1) i.push({ lvl: 'warn', msg: 'PSU 1 power cable is not secured with the PSU handle strap (Dell ISM page 93).' });
    if (c.cab.psu2 && !c.strap.psu2) i.push({ lvl: 'warn', msg: 'PSU 2 power cable is not secured with the PSU handle strap (Dell ISM page 93).' });
    if (!c.labeled) i.push({ lvl: 'warn', msg: 'Cables are not labelled at both ends.' });
    if (c.power !== 'on') i.push({ lvl: 'fail', msg: 'The server is not powered on.' });
  }
  return i;
});
// Work order for the processor lab: replace the processor, reuse the heat sink. The processor name is a Dell-supported model.
// AMD's published figures for the 7313P; the ISM lists it among the R6515's processors (Table 15, NPS 4, 2, 1).
const WO2 = { cpu: 'AMD EPYC 7313P', cores: 16, threads: 32, ghz: 3.0, boost: 3.7, l3: 128, tdp: 155, socket: 'SP3', family: 'EPYC 7003 series', reason: 'processor fault logged by iDRAC' };

/* ============ Memory specifications and population rules (Dell R6515 ISM, pages 17 and 47 to 54) ============
   16 DDR4 sockets (A1 to A16) across 8 memory channels (A to H), 2 sockets per channel:
   - White release tabs (A1 to A8): first socket of each channel, populated first in order A1, A2, A3, A4, A5, A6, A7, A8.
   - Black release tabs (A9 to A16): second socket of each channel, populated in order A9, A10, A11, A12, A13, A14, A15, A16.
   Table 13 (page 48): five supported DDR4-3200 memory models (8 GB 1Rx8 RDIMM, 16 GB 2Rx8 RDIMM, 32 GB 2Rx8 RDIMM,
   64 GB 2Rx4 RDIMM, 128 GB 8Rx4 LRDIMM), running at 3200 MT/s at 1 DPC (up to 8 DIMMs) and 2933 MT/s at 2 DPC (16 DIMMs).
   Page 49 & Table 16: mixing capacities or RDIMM/LRDIMM is not supported; minimum recommended configuration is 4 equal
   modules (A1, A2, A3, A4); 8 equal modules (A1 to A8) populate all 8 channels (1 DPC); 12 (A1 to A12) or 16 (A1 to A16). */
const DIMMK = ['r8', 'r16', 'r32', 'r64', 'l128'];
const MEMKIT_D = {
  r8:   { gb: 8,   rank: '1Rx8', kind: 'RDIMM',  mts: 3200, mts2: 2933, v: '1.2 V', org: 'Single rank (1Rx8)', name: '8 GB 1Rx8 DDR4-3200 RDIMM',    tag: '8G 1Rx8 PC4-3200AA-R',    col: '#1D5E3A', chips: 9 },
  r16:  { gb: 16,  rank: '2Rx8', kind: 'RDIMM',  mts: 3200, mts2: 2933, v: '1.2 V', org: 'Dual rank (2Rx8)',   name: '16 GB 2Rx8 DDR4-3200 RDIMM',   tag: '16G 2Rx8 PC4-3200AA-R',   col: '#1D5E3A', chips: 9 },
  r32:  { gb: 32,  rank: '2Rx8', kind: 'RDIMM',  mts: 3200, mts2: 2933, v: '1.2 V', org: 'Dual rank (2Rx8)',   name: '32 GB 2Rx8 DDR4-3200 RDIMM',   tag: '32G 2Rx8 PC4-3200AA-R',   col: '#1D5E3A', chips: 9 },
  r64:  { gb: 64,  rank: '2Rx4', kind: 'RDIMM',  mts: 3200, mts2: 2933, v: '1.2 V', org: 'Dual rank (2Rx4)',   name: '64 GB 2Rx4 DDR4-3200 RDIMM',   tag: '64G 2Rx4 PC4-3200AA-R',   col: '#174D30', chips: 18 },
  l128: { gb: 128, rank: '8Rx4', kind: 'LRDIMM', mts: 3200, mts2: 2933, v: '1.2 V', org: 'Octal rank (8Rx4)',  name: '128 GB 8Rx4 DDR4-3200 LRDIMM', tag: '128G 8Rx4 PC4-3200AA-L',  col: '#1A4766', chips: 18 }
};
const SLOTS_L = ['A3', 'A13', 'A4', 'A14', 'A7', 'A15', 'A8', 'A16'];
const SLOTS_R = ['A12', 'A6', 'A11', 'A5', 'A10', 'A2', 'A9', 'A1'];
const SLOTS = [...SLOTS_L, ...SLOTS_R];
const FILL = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16'];
const WHITE_SLOTS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'];
const CHAN = { A1: 'D', A9: 'D', A2: 'C', A10: 'C', A3: 'H', A13: 'H', A4: 'G', A14: 'G', A5: 'B', A11: 'B', A6: 'A', A12: 'A', A7: 'F', A15: 'F', A8: 'E', A16: 'E' };
// Measured X centres of the 16 sockets on FIGS.topOpen in its 1720-wide coordinate frame (socket Y: 748..1344, body 812..1282)
const SLOT_X = { A3: 763, A13: 793, A4: 824, A14: 854, A7: 885, A15: 915, A8: 946, A16: 976, A12: 1360, A6: 1390, A11: 1421, A5: 1451, A10: 1482, A2: 1512, A9: 1543, A1: 1573 };
const OKN = [4, 8, 12, 16];
const dimmList = t => SLOTS.filter(s => t.dimms && t.dimms[s]);
const dimmKinds = t => [...new Set(dimmList(t).map(s => t.dimms[s]))];
const wantSlots = n => FILL.slice(0, n);
const memOk = t => {
  const on = dimmList(t);
  if (!OKN.includes(on.length) || dimmKinds(t).length !== 1) return false;
  const w = wantSlots(on.length);
  return on.every(s => w.includes(s));
};
const memSpeed = t => { const on = dimmList(t); if (!on.length) return 0; const d = MEMKIT_D[t.dimms[on[0]]]; return on.length <= 8 ? d.mts : d.mts2; };
const memTotalGb = t => dimmList(t).reduce((sum, s) => sum + MEMKIT_D[t.dimms[s]].gb, 0);
function memWhy(t) {
  const on = dimmList(t), n = on.length, kinds = dimmKinds(t);
  if (!n) return 'No memory modules installed. Unpack the DIMM kit, choose one supported Dell DDR4 model (Table 13), and populate at least four sockets: A1, A2, A3, A4.';
  if (kinds.length > 1) {
    const types = [...new Set(kinds.map(k => MEMKIT_D[k].kind))];
    if (types.length > 1) return 'RDIMM and LRDIMM modules are mixed: Dell ISM page 49 forbids mixing memory module types in a system. Keep one model only.';
    return `Mixed memory models (${kinds.map(k => MEMKIT_D[k].gb + ' GB ' + MEMKIT_D[k].rank).join(' and ')}): Dell ISM page 49 states that mixing capacities is not supported and all populated channels must have identical DIMMs.`;
  }
  if (!OKN.includes(n)) {
    if (n < 4) return `${n} of 4 minimum modules installed: continue in Dell's order (${FILL.slice(0, 4).join(', ')} — next is ${FILL.find(s => !t.dimms[s])}). Dell ISM page 49: minimum recommended is 4 equal modules; fewer than 4 triggers UEFI0391 at default NPS 1.`;
    const next = OKN.find(k => k > n);
    return `${n} modules is an unbalanced count. Populate 4 (A1–A4), 8 (A1–A8, all 8 channels at 1 DPC), 12 (A1–A12), or 16 (A1–A16, all 8 channels at 2 DPC): add ${next - n} more up to ${FILL[next - 1]} or remove down to ${OKN.filter(k => k < n).pop()}.`;
  }
  const w = wantSlots(n), wrong = on.filter(s => !w.includes(s)), miss = w.filter(s => !t.dimms[s]);
  return `For ${n} modules Dell's population order is ${w.join(', ')}: move ${wrong.join(', ')} to ${miss.join(', ')} (white release tabs A1–A8 first, then black release tabs A9–A16).`;
}
function initMemState(t) {
  t.dimms = {}; t.memOpen = {}; SLOTS.forEach(s => { t.dimms[s] = null; t.memOpen[s] = false; });
  t.memBox = false; t.memPick = null;
  t.memLeft = { r8: 16, r16: 16, r32: 16, r64: 16, l128: 16 };
  t.selSlot = 'A1'; t.memLab = false;
}

/* ============ Rear rack cabling schedule (Dell ISM pages 13, 20, 92–93) ============
   Work order cable schedule for R6515 in U20 of Rack 1:
   - iDRAC dedicated port (RJ-45) -> MGT01 port 13 (Gi0/13, OOB-MGMT)
   - Gb 1 onboard LOM 1 (RJ-45)   -> SW01 port 22  (Gi0/22, DATA-A)
   - Gb 2 onboard LOM 2 (RJ-45)   -> SW02 port 22  (Gi0/22, DATA-B)
   - PSU 1 AC inlet (C14)         -> PDU A outlet 8 (C13, 230 V, PWR-A) + secure cable with PSU 1 handle strap
   - PSU 2 AC inlet (C14)         -> PDU B outlet 8 (C13, 230 V, PWR-B) + secure cable with PSU 2 handle strap */
const CAB_DEF = { idrac: 'mgmt', gb1: 'dataA', gb2: 'dataB', psu1: 'pduA', psu2: 'pduB' };
const CAB_WANT = { idrac: 13, gb1: 22, gb2: 22, psu1: 8, psu2: 8 };
const CAB_LABEL = { idrac: 'iDRAC', gb1: 'Gb 1', gb2: 'Gb 2', psu1: 'PSU 1', psu2: 'PSU 2' };
const CAB_ROLE = { idrac: 'OOB-MGMT', gb1: 'DATA-A', gb2: 'DATA-B', psu1: 'PWR-A', psu2: 'PWR-B' };
const DNAME = { pduA: 'PDU A', pduB: 'PDU B', dataA: 'SW01', dataB: 'SW02', mgmt: 'MGT01' };
const DBUSY = { pduA: [9, 10, 11], pduB: [9, 10, 11], dataA: [1, 2, 3, 4, 5, 6, 17, 18], dataB: [1, 2, 3, 4, 5, 6, 17, 18], mgmt: [1, 2, 3, 4, 5, 6, 7, 8] };
const isPdu = dk => dk === 'pduA' || dk === 'pduB';
const portTxtD = (dk, n) => `${DNAME[dk]} ${isPdu(dk) ? 'outlet' : 'port'} ${n}`;
const ifNameD = (dk, n) => isPdu(dk) ? `outlet ${n}` : `Gi0/${n}`;
const wantPortTxt = k => portTxtD(CAB_DEF[k], CAB_WANT[k]);
const cabRight = (t, k) => !!(t.cpu && t.cpu.cabTo[k] === CAB_DEF[k] && t.cpu.cabPort[k] === CAB_WANT[k] && !t.cpu.cabOff[k]);
const cabWrong = (t, k) => !!(t.cpu && t.cpu.cabTo[k] && !t.cpu.cabOff[k] && (t.cpu.cabTo[k] !== CAB_DEF[k] || t.cpu.cabPort[k] !== CAB_WANT[k]));
function syncCab(c) {
  ['idrac', 'gb1', 'gb2', 'psu1', 'psu2'].forEach(k => {
    c.cab[k] = !!(c.cabTo[k] === CAB_DEF[k] && c.cabPort[k] === CAB_WANT[k] && !c.cabOff[k]);
  });
}

// The processor lab starts in one of two ways. From the Lab menu: the server runs in U20, cabled, as in service. From
// the rack lab's Continue button (CH.on): the server the student just installed, not cabled, never powered (fresh), so
// the heat sink is cold, the memory goes in as part of the installation (t.memLab) after the heat sink and before the
// air shroud, and then the student connects the data, management and power cables, powers on, and verifies at POST.
const CH = { on: false };
function cpuFresh() {
  const chained = CH.on || !!(T && T.cpu && T.cpu.fresh && Sim.scenario === 'cpurep'); CH.on = false;
  const t = fresh(); const r = t.rack;
  t.tagRead = true; r.u = WO.u; r.rail = { l: { rear: true, latch: false, front: true }, r: { rear: true, latch: false, front: true } }; r.ext = true; r.pos = 'in'; r.cycled = true;
  t.cpu = {
    fresh: chained, power: chained ? 'off' : 'on',
    cab: { psu1: !chained, psu2: !chained, gb1: !chained, gb2: !chained, idrac: !chained },
    cabTo: chained ? { idrac: null, gb1: null, gb2: null, psu1: null, psu2: null } : { ...CAB_DEF },
    cabPort: chained ? { idrac: null, gb1: null, gb2: null, psu1: null, psu2: null } : { ...CAB_WANT },
    cabOff: { idrac: false, gb1: false, gb2: false, psu1: false, psu2: false },
    cabSel: null,
    strap: { psu1: !chained, psu2: !chained },
    labeled: !chained,
    vga: false, usb: false,
    esd: false, cool: chained, cover: 'locked', shroud: 'in',
    hs: { on: true, screws: [0, 0, 0, 0], clean: false, grease: 0 }, plate: 'down', fp: [true, true, true], latch: { l: false, r: false }, frame: 'down', tray: 'old', hand: false, tool: null, torque: null, press: false, lidClean: false, trayRot: 0, gStrokes: [], post: null, back: false
  };
  initMemState(t);
  t.memLab = chained;                 // the installation run fits the memory too, after the heat sink
  if (chained) t.idr = idrFresh();    // ... and ends with the first iDRAC setup at the server (views-idrac.js)
  return t;
}
// the iDRAC lab: the server installed in U20, cabled to the schedule, strapped and labelled, memory in, never powered on
function idracFresh() {
  const t = memFresh(), c = t.cpu;
  c.power = 'off'; c.back = true; c.fresh = false; t.memLab = false;
  ['A1', 'A2', 'A3', 'A4'].forEach(s => { t.dimms[s] = 'r32'; }); t.memBox = true; t.memPick = 'r32'; t.memLeft.r32 -= 4;
  t.idr = idrFresh();
  return t;
}
function memFresh() {
  const t = cpuFresh();                 // maintenance: cabled to the scheduled ports, straps and labels on, running
  t.cpu.fresh = false; t.cpu.power = 'on'; t.cpu.cool = true;
  t.cpu.cabTo = { ...CAB_DEF }; t.cpu.cabPort = { ...CAB_WANT };
  t.cpu.cabOff = { idrac: false, gb1: false, gb2: false, psu1: false, psu2: false };
  t.cpu.cabSel = null; t.cpu.strap = { psu1: true, psu2: true }; t.cpu.labeled = true;
  syncCab(t.cpu);
  t.cpu.tray = 'new'; t.cpu.hs = { on: true, screws: [2, 2, 2, 2], clean: true, grease: 1 };
  t.memLab = true;
  return t;
}
Sim.expose({ PROFILE, WO, WO2, RACK, CH, DIMMK, MEMKIT_D, SLOTS_L, SLOTS_R, SLOTS, FILL, WHITE_SLOTS, CHAN, SLOT_X, OKN, dimmList, dimmKinds, wantSlots, memOk, memSpeed, memTotalGb, memWhy, CAB_DEF, CAB_WANT, CAB_LABEL, CAB_ROLE, DNAME, DBUSY, isPdu, portTxtD, ifNameD, wantPortTxt, cabRight, cabWrong, syncCab, fresh, cpuFresh, memFresh, idracFresh });
