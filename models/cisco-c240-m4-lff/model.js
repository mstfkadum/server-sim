/* ==========================================================================================================
   Model pack: Cisco UCS C240 M4 LFF. Profile, parts, twin state and readiness rules.
   © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved.
   The build wraps this pack's files in one function scope, so nothing here collides with another model.
   ========================================================================================================== */
/* ============ 1. Platform profile and parts catalogue ============
   Sources: Cisco UCS C240 M4 Server Installation and Service Guide; the service label on the server's top cover;
   Cisco UCS C240 M4 spec sheet (memory: DIMM PIDs, 1 to 12 DIMMs per CPU, CPU 1 and CPU 2 configured identically,
   do not mix RDIMMs with LRDIMMs, speed at three DIMMs per channel). */
const PROFILE = {
  name: 'Cisco UCS C240 M4 LFF, 12-drive backplane (UCSC-C240-M4L)', socket: 'LGA2011-3', memGen: 'DDR4', memTypes: ['RDIMM', 'LRDIMM'], memMaxSpeed: 2400,
  // cover label "CPU and DIMM Numbering": CPU 1 = channels A B C D, CPU 2 = E F G H, three sockets per channel.
  // Socket order left to right with the front of the server at the bottom; slot 1 (blue) is farthest from its CPU.
  channels: [['A', 'B', 'C', 'D'], ['E', 'F', 'G', 'H']],
  layout: ['G1', 'G2', 'G3', 'H1', 'H2', 'H3', 'CPU2', 'F3', 'F2', 'F1', 'E3', 'E2', 'E1', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3', 'CPU1', 'B3', 'B2', 'B1', 'A3', 'A2', 'A1'],
  // fill all blue #1 sockets first, alternating CPUs, then all #2, then all #3
  order2: ['A', 'E', 'B', 'F', 'C', 'G', 'D', 'H'], order1: ['A', 'B', 'C', 'D'],
  bays: 12, nvmeBays: [], driveForm: '3.5', rackUnits: 2, weightKg: 29, rail: 'UCSC-RAILB-M4', cma: 'UCSC-CMAF-M4',
  riserSlots: { 4: 'x8', 5: 'x16', 6: 'x8' }, heatsinks: { hsUsed: { pid: 'UCSC-HS-C240M4', name: 'Heatsink reused from this server', note: 'Old thermal grease on its base: clean it, then grease the CPU', reused: true }, hsNew: { pid: 'UCSC-HS-C240M4=', name: 'New spare heatsink', note: 'Thermal pad pre-applied, covered by a plastic sheet', reused: false } }
};
// Management work order from the trainer. 00:00:5E:00:53:xx is a documentation MAC range; the serial number is invented.
const WO = { ip: '10.1.23.120', mask: '255.255.255.0', gw: '10.1.23.1', user: 'admin', pw: 'password87', mac: '00:00:5E:00:53:26', serial: 'TRAIN0001' };
// Factory defaults: Shared LOM EXT, Active-active, DHCP on. There is no DHCP server on this management network, so the controller has no address.
function newCimc() {
  return { pw: 'password', pwSrc: 'factory', auth: false, sess: '', url: '', tab: 'blank', why: '', certOk: {}, certAdv: false, msg: '', menu: false, adminOpen: false, page: 'summary', rowSel: false, dlg: false, chg: false, kvm: false, kvmSeen: false,
    consoleLogin: false, verified: false, guiPw: false, loggedOut: false, reloginNew: false, form: {},
    net: { mode: 'Shared LOM EXT', card: 'Riser1', red: 'Active-active', ipv4: true, ipv6: false, dhcp: true, host: 'C240-' + WO.serial, ip: '0.0.0.0', mask: '0.0.0.0', gw: '0.0.0.0', dns: '0.0.0.0', vlan: false, vlanId: '1', prio: '0', ddns: true, ddnsDom: '' } };
}
// the DIMMs in the box of every lab with memory: 16 GB RDIMM, 32 GB RDIMM, 64 GB LRDIMM (24 of each)
const MEMKIT_C = ['r16', 'r32', 'l64'];
const CATALOG = {
  // C240 M4: Intel Xeon E5-2600 v4 in LGA2011-3 sockets; one Cisco heatsink fits every supported CPU
  cpus: [
    { id: 'e2680', pid: 'UCS-CPU-E52680E', name: 'Intel Xeon E5-2680 v4', socket: 'LGA2011-3', cores: 14, ghz: 2.4, watts: 120, mem: 2400 },
    { id: 'e2640', pid: 'UCS-CPU-E52640E', name: 'Intel Xeon E5-2640 v4', socket: 'LGA2011-3', cores: 10, ghz: 2.4, watts: 90, mem: 2133 },
    { id: 'g6248', pid: 'UCS-CPU-I6248 (from a C240 M5)', name: 'Intel Xeon Gold 6248', socket: 'LGA3647', cores: 20, ghz: 2.5, watts: 150, mem: 2933 }],
  // Cisco's DDR4-2400 DIMMs for this server (spec sheet, table 7): every lab with memory, the RAM Distributor included,
  // uses three of them (MEMKIT_C): the 16 GB and 32 GB RDIMMs and the 64 GB LRDIMM
  dimms: [
    { id: 'r8', pid: 'UCS-MR-1X081RV-A', name: 'Cisco 8 GB DDR4-2400 RDIMM, single rank', short: '8 GB 1R RDIMM', label: '8GB 1Rx4 PC4-2400T-RA1-11', cap: 8, ranks: 1, width: 4, gen: 'DDR4', type: 'RDIMM', speed: 2400, cisco: true, detail: 'Synchronous Registered (Buffered)' },
    { id: 'r16s', pid: 'UCS-MR-1X161RV-A', name: 'Cisco 16 GB DDR4-2400 RDIMM, single rank', short: '16 GB 1R RDIMM', label: '16GB 1Rx4 PC4-2400T-RA1-11', cap: 16, ranks: 1, width: 4, gen: 'DDR4', type: 'RDIMM', speed: 2400, cisco: true, detail: 'Synchronous Registered (Buffered)' },
    { id: 'r16', pid: 'UCS-MR-1X162RV-A', name: 'Cisco 16 GB DDR4-2400 RDIMM', short: '16 GB 2R RDIMM', label: '16GB 2Rx4 PC4-2400T-RA1-11', cap: 16, ranks: 2, width: 4, gen: 'DDR4', type: 'RDIMM', speed: 2400, cisco: true, detail: 'Synchronous Registered (Buffered)' },
    { id: 'r32', pid: 'UCS-MR-1X322RV-A', name: 'Cisco 32 GB DDR4-2400 RDIMM', short: '32 GB 2R RDIMM', label: '32GB 2Rx4 PC4-2400T-RA1-11', cap: 32, ranks: 2, width: 4, gen: 'DDR4', type: 'RDIMM', speed: 2400, cisco: true, detail: 'Synchronous Registered (Buffered)' },
    { id: 'l32', pid: 'UCS-ML-1X324RV-A', name: 'Cisco 32 GB DDR4-2400 LRDIMM', short: '32 GB 4R LRDIMM', label: '32GB 4Rx4 PC4-2400T-LD1-11', cap: 32, ranks: 4, width: 4, gen: 'DDR4', type: 'LRDIMM', speed: 2400, cisco: true, detail: 'Synchronous Load Reduced (Buffered)' },
    { id: 'l64', pid: 'UCS-ML-1X644RV-A', name: 'Cisco 64 GB DDR4-2400 LRDIMM', short: '64 GB 4R LRDIMM', label: '64GB 4Rx4 PC4-2400T-LD1-11', cap: 64, ranks: 4, width: 4, gen: 'DDR4', type: 'LRDIMM', speed: 2400, cisco: true, detail: 'Synchronous Load Reduced (Buffered)' }],
  // drives on the trainer's server (PIDs printed on its carriers), plus one small form factor drive that does not fit
  drives: [
    { id: 'hd8t', pid: 'UCS-HD8T7KL4K', name: '8 TB 12G SAS 7.2K RPM LFF HDD, 4K native', form: '3.5', bus: 'SAS', speed: '12Gb/s', rpm: 7200, sector: '4Kn', kind: 'HDD', cap: 8000 },
    { id: 'hd4t', pid: 'UCS-HD4T7KS3-E', name: '4 TB 6G SAS 7.2K RPM LFF HDD', form: '3.5', bus: 'SAS', speed: '6Gb/s', rpm: 7200, sector: '512', kind: 'HDD', cap: 4000 },
    { id: 'hd1t', pid: 'UCS-HDD1TI2F212', name: '1 TB SAS 7.2K RPM LFF HDD', form: '3.5', bus: 'SAS', speed: '6Gb/s', rpm: 7200, sector: '512', kind: 'HDD', cap: 1000 },
    { id: 'sff12', pid: 'UCS-HD12TB10K12G', name: '1.2 TB 12G SAS 10K RPM HDD, 2.5-inch SFF', form: '2.5', bus: 'SAS', speed: '12Gb/s', rpm: 10000, sector: '512', kind: 'HDD', cap: 1200 }],
  // the data NIC on the trainer's server: Cisco UCS VIC 1225 in riser 2, slot 5
  cards: [
    { id: 'vic', pid: 'UCSC-PCIE-CSC-02', name: 'Cisco UCS VIC 1225', short: 'Dual-port 10 Gb SFP+, PCIe x16, full-height bracket',
      lines: ['UCSC-PCIE-CSC-02: dual-port 10 Gb SFP+ virtual interface card', 'PCIe x16 edge with extra contacts for an x24 connector (NCSI)', 'Half height, half length, with a full-height bracket', 'Component side shown; on the mat you see its solder side'] }]
};
const byId = (list, id) => CATALOG[list].find(x => x.id === id);
const slotCpu = id => 'ABCD'.includes(id[0]) ? 0 : 1;
// Cisco fill order over the sockets of the CPUs that are installed
const memOrder = t => { const two = t.cpu[1].st === 'torqued', ch = two ? PROFILE.order2 : PROFILE.order1; return [1, 2, 3].flatMap(n => ch.map(c => c + n)); };
// the same order within one CPU (c = 0 or 1): blue #1 in each of its channels, then black #2, then white #3
const cfill = c => [1, 2, 3].flatMap(n => PROFILE.channels[c].map(ch => ch + n));
const cpuDimms = (t, c) => cfill(c).filter(s => t.dimms[s]);
// the socket on the other CPU in the same position (A1 and E1, B2 and F2 ...)
const twinSock = s => { const c = slotCpu(s), k = PROFILE.channels[c].indexOf(s[0]); return PROFILE.channels[1 - c][k] + s[1]; };
const dimmOf = (t, s) => byId('dimms', t.dimms[s].id);

/* ============ 2. Twin state ============ */
// one CPU socket: ILM levers (u = unlock icon, open first; l = lock icon, close first), hinged cover plate and seat
const newSock = () => ({ st: 'dust', model: null, cap: true, lev: { u: 'clip', l: 'clip' }, plate: 'closed', seat: 'down', grease: 0, oldGrease: false, hs: null, tim: null, screws: [0, 0, 0, 0], soak: null });
function syncSt(c) { c.st = c.hs && c.screws.every(v => v >= 2) ? 'torqued' : c.model ? 'seated' : c.cap ? 'dust' : 'empty'; return c; }
function fresh() {
  return {
    esd: false, cover: 'closed', coverLock: true, coverFit: { dx: 0, dy: 0, n: 0 }, baffle: true,
    cpu: [0, 1].map(newSock),
    bench: { cpu: null, rot: 90, hs: null, tool: null },
    // dimms: socket to { id, fault }; memKit: DIMMs of each model on the mat (one model may be in hand, sel.dimm)
    dimms: {}, quiz: {}, memLev: {}, memKit: Object.fromEntries(MEMKIT_C.map(k => [k, 24])), dimmSeen: {},
    sel: { dimm: null, socket: 0, bay: 0, port: null, card: null, psu: null },
    riser: newRiser(),
    bays: Array.from({ length: PROFILE.bays }, () => ({ st: 'blank', drive: null, health: 'ok', member: false, pct: 0 })),
    benchDrive: null, pulled: null, trayEmpty: false, arrayFailed: false,
    fans: Array(6).fill('ok'), fanClock: null, fanPinch: null, fanHand: null, fanRma: false,
    rack: { stab: false, u: null, inner: false, left: false, right: false, pos: 'bench', cma: false, routed: false, labeled: false, tested: false },
    cables: { psu1: null, psu2: null, vic1: null, vic2: null, mgmt: null }, cablePort: {}, locator: false, cimc: newCimc(), crash: { vga: false, kbd: false }, con: newCon(),
    psu: [newPsu('LAB0PSU0001'), newPsu('LAB0PSU0002')], psuFeed: { psu1: 'pduA', psu2: 'pduB' }, psuHand: null, psuPinch: null, psuSpare: null, psuRma: false, psuEv: [],
    power: 'off', post: null, checked: false, flags: {}, errors: 0, log: []
  };
}

function inside(core) {
  if (T.cover !== 'open') return bad('Remove the top cover first (Chassis view).');
  if (T.power === 'on') return bad('The server is in main power mode. Shut it down before working inside.');
  if (T.cables.psu1 || T.cables.psu2) return bad('Disconnect all power cords first. In standby mode, current is still present in the server.');
  if (!T.esd) return bad('Put on the ESD wrist strap first. Handle components only by their edges.');
  if (core && T.baffle) return bad('Lift out the air baffle first. It covers the CPUs and the front ends of the DIMM slots (Chassis view).');
  return true;
}
// riser 2: in the chassis ('in', with each end engaged or resting), held above it ('up'), or on the antistatic mat ('mat')
function newRiser() { return { loc: 'in', grip: { f: false, r: false }, up: { f: 0, r: 0 }, screw: 'tight', plate: 'on', ret: 'closed', slots: { 4: null, 5: null, 6: null }, blank: { 4: true, 5: true, 6: true }, seat: { 4: null, 5: null, 6: null }, spare: 0 }; }
const riserOut = t => t.riser.loc !== 'in';
const riserSeated = t => t.riser.loc === 'in' && !t.riser.up.f && !t.riser.up.r;
const cardSeated = (r, s) => !!(r.seat[s] && r.seat[s].f && r.seat[s].r);
const vicSlot = t => Object.keys(t.riser.slots).find(k => t.riser.slots[k] === 'vic') || null;
const cardList = t => Object.values(t.riser.slots).filter(Boolean);
const powerLed = t => t.power === 'on' ? 'green' : psuAny(t) ? 'amber' : 'off';
// power supplies: index 0 = PSU 1 (lower bay), 1 = PSU 2 (upper bay). st: 'in' (pushed home, release lever locked),
// 'set' (slid into the bay but not locked, so its connector is not engaged) or 'out' (bay empty).
// strap: the hook-and-loop strap on the handle is fastened around the power cord.
const PSU_PID = 'UCSC-PSU2V2-1200W';
function newPsu(sn) { return { st: 'in', fault: false, strap: false, pid: PSU_PID, sn }; }
const psuKey = i => 'psu' + (i + 1);
const psuGood = (t, i) => t.psu[i].st === 'in' && !t.psu[i].fault && !!t.cables[psuKey(i)];
const psuAny = t => psuGood(t, 0) || psuGood(t, 1);
const psuBoth = t => psuGood(t, 0) && psuGood(t, 1);
// rear LEDs of one supply (C240 M4 service guide, rear power supply LED states): g = green status, a = amber fault
function psuLeds(t, i) {
  const p = t.psu[i], other = psuGood(t, 1 - i);
  if (p.st === 'out') return { g: 'off', a: 'off', txt: 'Bay empty' };
  if (p.st === 'set') return { g: 'off', a: 'off', txt: 'Not locked in: its connector is not engaged' };
  if (!t.cables[psuKey(i)]) return other ? { g: 'off', a: 'on', txt: 'Status off, fault amber: no AC input, redundant supply active' } : { g: 'off', a: 'off', txt: 'Both off: no AC input' };
  if (p.fault) return { g: 'blink', a: 'on', txt: 'Status blinking green, fault solid amber: fan fault or lock, the supply shut down after over-temperature protection' };
  return t.power === 'on' ? { g: 'on', a: 'off', txt: 'Status solid green, fault off: main 12 V output on' } : { g: 'blink', a: 'off', txt: 'Status blinking green, fault off: standby power mode' };
}
// what the front panel and Cisco IMC report about the supplies: null when both are present, locked, working and fed
function psuIssue(t) {
  for (const i of [0, 1]) if (t.psu[i].st === 'in' && t.psu[i].fault) return { crit: true, n: i + 1, txt: `PSU ${i + 1} has failed` };
  for (const i of [0, 1]) {
    const p = t.psu[i], n = i + 1;
    if (p.st === 'out') return { n, txt: `PSU ${n} bay is empty` };
    if (p.st === 'set') return { n, txt: `PSU ${n} is not locked in` };
    if (!t.cables[psuKey(i)]) return { n, txt: `no input on the PSU ${n} cord` };
  }
  return null;
}
const cpuIn = (t, i) => t.cpu[i].st === 'torqued';
// one CPU's 12 sockets as a list, position = channel x 3 + slot - 1 (A1 A2 A3 B1 ...), each the DIMM model id or null
const cpuMap = (t, c) => Array.from({ length: 12 }, (_, i) => { const d = t.dimms[PROFILE.channels[c][Math.floor(i / 3)] + (i % 3 + 1)]; return d ? d.id : null; });
// the memory speed (spec sheet, table 9, 2400 MHz DIMMs): the CPU's limit; three DIMMs in a channel, one step down
// (2400 to 2133 MHz), two for dual-rank RDIMMs (to 1866 MHz); RDIMMs of different sizes in the server, one step down
const STEPS = [2400, 2133, 1866, 1600];
function memSpeed(maps, cpuMem = PROFILE.memMaxSpeed) {
  const ids = maps.flat().filter(Boolean); if (!ids.length) return 0;
  const base = Math.max(0, STEPS.indexOf(Math.min(cpuMem, PROFILE.memMaxSpeed))); let i = base;
  maps.forEach(m => [0, 1, 2, 3].forEach(ch => { const d = [0, 1, 2].map(r => m[ch * 3 + r]).filter(Boolean).map(k => byId('dimms', k));
    if (d.length === 3) i = Math.max(i, base + (d.some(x => x.type === 'RDIMM' && x.ranks === 2) ? 2 : 1)); }));
  if (new Set(ids.map(k => byId('dimms', k)).filter(x => x.type === 'RDIMM').map(x => x.cap)).size > 1) i = Math.max(i, base + 1);
  return STEPS[Math.min(i, STEPS.length - 1)];
}
function memSummary(t = T) {
  const ids = Object.keys(t.dimms);
  const total = ids.reduce((a, s) => a + byId('dimms', t.dimms[s].id).cap, 0);
  const cpuMax = t.cpu[0].model ? byId('cpus', t.cpu[0].model).mem : PROFILE.memMaxSpeed;
  const dpc3 = ids.some(s => s[1] === '3');
  const speed = ids.length ? memSpeed([cpuMap(t, 0), cpuMap(t, 1)], cpuMax) : 0;
  return { count: ids.length, total, speed, cpuMax, dpc3, per: [0, 1].map(c => ids.filter(s => slotCpu(s) === c)) };
}
/* ---- The memory layout against Cisco's rules: one model type (RDIMM or LRDIMM) in the server; per CPU, the first n
   sockets of Cisco's order (any n from 1 to 12); with both CPUs, the two populated identically. Minimum: 1 DIMM per
   installed CPU, in A1 (and E1). ---- */
function mixErr(t) {
  const ids = Object.keys(t.dimms), types = [...new Set(ids.map(s => dimmOf(t, s).type))];
  if (types.length < 2) return '';
  const of = ty => ids.filter(s => dimmOf(t, s).type === ty), r = of('RDIMM'), l = of('LRDIMM'), few = a => a.length > 6 ? a.slice(0, 6).join(', ') + ' ...' : a.join(', ');
  return `Mixed DIMM types: ${few(l)} ${l.length > 1 ? 'hold LRDIMMs' : 'holds an LRDIMM'}, ${few(r)} ${r.length > 1 ? 'hold RDIMMs' : 'holds an RDIMM'}. Cisco: do not mix RDIMMs with LRDIMMs in the server (a quad-rank LRDIMM cannot share a channel with single- or dual-rank DIMMs). Choose one type and take the others out.`;
}
// the DIMM models on one CPU against Cisco's rules (spec sheet): higher rank first in a channel (from blue slot 1), and,
// as the spec sheet covers mixing sizes only for RDIMMs, one LRDIMM size
function typeErrsC(m, c = 0) {
  const ds = m.filter(Boolean).map(k => byId('dimms', k)), e = [];
  if (new Set(ds.filter(d => d.type === 'LRDIMM').map(d => d.cap)).size > 1) e.push('Two LRDIMM sizes: Cisco\'s spec sheet covers mixing sizes only for RDIMMs. Use one LRDIMM size.');
  for (let ch = 0; ch < 4; ch++) {
    const r = [0, 1, 2].map(i => m[ch * 3 + i] ? byId('dimms', m[ch * 3 + i]).ranks : 0);
    if ((r[1] && r[0] < r[1]) || (r[2] && r[1] < r[2])) { e.push(`Channel ${PROFILE.channels[c][ch]}: a DIMM with more ranks sits behind one with fewer. Cisco: populate the higher number of ranks first, from slot 1 (blue, the farthest from the CPU).`); break; }
  }
  return e;
}
const cpuTypeErr = (t, c) => typeErrsC(cpuMap(t, c), c)[0] || '';
// one CPU's DIMMs in words: '4 x 32 GB 2R RDIMM + 4 x 16 GB 2R RDIMM'
const cpuTxt = (t, c) => { const n = {}; cpuDimms(t, c).forEach(s => { n[t.dimms[s].id] = (n[t.dimms[s].id] || 0) + 1; }); return CATALOG.dimms.filter(d => n[d.id]).map(d => `${n[d.id]} x ${d.short}`).join(' + '); };
function cpuErr(t, c) {
  const have = cpuDimms(t, c), n = have.length, C = `CPU ${c + 1}`, ch = PROFILE.channels[c];
  if (!n) return `${C} has no DIMMs yet. Every installed CPU needs at least one, in blue socket ${ch[0]}1.`;
  const want = cfill(c).slice(0, n), extra = have.filter(s => !want.includes(s)), miss = want.filter(s => !have.includes(s));
  if (!extra.length) return '';
  const lone = extra.find(s => s[1] !== '1' && !t.dimms[s[0] + (+s[1] - 1)]);
  return `${C} has ${n} DIMM${n > 1 ? 's' : ''}, but Cisco's layout for ${n} is ${want.join(', ')}. ${extra.join(', ')} ${extra.length > 1 ? 'are' : 'is'} not in it: move ${extra.length > 1 ? 'those DIMMs' : 'that DIMM'} to ${miss.join(', ')}. ${lone ? `A channel with one DIMM uses its blue slot 1 (${lone[0]}1), never slot ${lone[1]}.` : 'Fill every blue #1 socket first, then the black #2, then the white #3.'}`;
}
function memCheck(t) {
  const two = cpuIn(t, 1), a = cpuDimms(t, 0), b = cpuDimms(t, 1), n = a.length + b.length, gb = memSummary(t).total;
  const out = (err) => ({ ok: !err, err, n, a, b, gb });
  const mx = mixErr(t); if (mx) return out(mx);
  const te = cpuTypeErr(t, 0) ? `CPU 1: ${cpuTypeErr(t, 0)}` : two && cpuTypeErr(t, 1) ? `CPU 2: ${cpuTypeErr(t, 1)}` : ''; if (te) return out(te);
  if (!two && b.length) return out(`${b.join(', ')} ${b.length > 1 ? 'belong' : 'belongs'} to CPU 2, which is not installed: Cisco says DIMMs in the sockets of an absent CPU are not recognized. Take ${b.length > 1 ? 'them' : 'it'} out.`);
  const e1 = cpuErr(t, 0), e2 = two ? cpuErr(t, 1) : '';
  const good = (k, sl) => `CPU ${k}: ${sl.length} DIMM${sl.length > 1 ? 's' : ''} in ${sl.join(', ')}, in Cisco's order. `;
  if (e1) return out((two && !e2 && b.length ? good(2, b) : '') + e1);
  if (e2) return out(good(1, a) + e2);
  if (two) {
    const diff = a.length !== b.length ? `CPU 1 has ${a.length} DIMM${a.length > 1 ? 's' : ''} and CPU 2 has ${b.length}.` : a.some(s => dimmOf(t, s).id !== dimmOf(t, twinSock(s)).id) ? 'The two CPUs hold different DIMM models in the same positions.' : '';
    if (diff) return out(`Not identical: ${diff} Cisco: when both CPUs are installed, populate the DIMM sockets of each CPU identically: the same number, in the same positions (A1 and E1, B1 and F1 ...), the same model.`);
  }
  return out('');
}
const memOK = t => memCheck(t).ok && memCheck(t).n >= (cpuIn(t, 1) ? 2 : 1);
// DIMMs fitted in Cisco's order so far (only the other CPU is not finished yet), as opposed to wrong sockets or mixed types
const memInOrder = t => !mixErr(t) && [0, 1].every(c => { const h = cpuDimms(t, c); return h.every(s => cfill(c).indexOf(s) < h.length); });
const memTone = t => memCheck(t).ok ? 'ok' : memInOrder(t) ? 'info' : 'warn';
function memStatus(t) {
  const m = memCheck(t), two = cpuIn(t, 1), k = m.a.length;
  if (!m.n) return 'No DIMMs yet. Start with blue socket A1 (CPU 1), then E1 (CPU 2).';
  if (!m.ok) return m.err;
  const sp = memSummary(t).speed, nx = k < 12 ? (two ? [cfill(0)[k], cfill(1)[k]] : [cfill(0)[k]]) : null;
  return `Supported: ${cpuTxt(t, 0)} ${two ? `per CPU (${m.a.join(', ')} and ${m.b.join(', ')})` : `on CPU 1 (${m.a.join(', ')})`}: ${m.gb} GB at ${sp} MHz.${nx ? ` To add more, Cisco's next socket${nx.length > 1 ? 's are' : ' is'} ${nx.join(' and ')}.` : ''}${k % 4 ? ' Tip: 4, 8 or 12 per CPU fill all four channels equally, for the best memory bandwidth.' : ''}`;
}
// a fitted DIMM's mark on the board and the map: ok, part (in order, the other CPU does not match it yet), bad
function dimmMark(t, s) {
  const c = slotCpu(s), h = cpuDimms(t, c), mx = mixErr(t);
  if (mx) { const ids = Object.keys(t.dimms), r = ids.filter(x => dimmOf(t, x).type === 'RDIMM').length; if (dimmOf(t, s).type === (r * 2 >= ids.length ? 'LRDIMM' : 'RDIMM')) return 'bad'; }
  if (cpuTypeErr(t, c)) { const n = {}; h.forEach(x => { n[t.dimms[x].id] = (n[t.dimms[x].id] || 0) + 1; }); const main = Object.keys(n).sort((a, b2) => n[b2] - n[a])[0]; if (t.dimms[s].id !== main) return 'bad'; }
  if (cfill(c).indexOf(s) >= h.length) return 'bad';
  if (cpuIn(t, 1)) { const o = twinSock(s); if (!t.dimms[o] || dimmOf(t, o).id !== dimmOf(t, s).id) return 'part'; }
  return 'ok';
}
// population of one CPU as a signature with the channel letters replaced by their position (so CPU 1 and CPU 2 compare)
function popCheck(t, c) {
  const ch = PROFILE.channels[c], mine = Object.keys(t.dimms).filter(s => slotCpu(s) === c);
  return { n: mine.length, sig: mine.map(s => ch.indexOf(s[0]) + s[1]).sort().join() };
}
// the label check: one question, can this DIMM go in this server?
function dimmVerdict(d) {
  if (!d) return { cls: 'no', reasons: ['Unknown DIMM.'] };
  if (d.gen !== PROFILE.memGen) return { cls: 'no', reasons: [`This is ${d.gen}. The server takes DDR4 only: the notch sits elsewhere, so it does not fit.`] };
  if (!PROFILE.memTypes.includes(d.type)) return { cls: 'no', reasons: ['U = UDIMM: unbuffered and without ECC (8 chips per row, no RCD). This server needs registered (R) or load-reduced (L) DDR4 with ECC.'] };
  if (!d.cisco) return { cls: 'no', reasons: ['It looks right and would fit, but it has no Cisco part number. The cover label: Cisco does not support 3rd-party DIMMs; they might cause system problems or damage the motherboard.'] };
  return { cls: 'ok', reasons: [`Cisco ${d.pid}: DDR4-2400, ECC, ${d.type === 'RDIMM' ? 'registered (R)' : 'load-reduced (L)'}.` + (d.type === 'LRDIMM' ? ' Never mix it with RDIMMs in the same server.' : ' Never mix it with LRDIMMs in the same server.')] };
}
function postSummary() {
  const m = memSummary(), cpus = T.cpu.filter(c => c.st === 'torqued');
  return {
    cpus: `${cpus.length} x ${byId('cpus', cpus[0].model).name}`, memory: `${m.total} GB in ${m.count} DIMMs at ${m.speed} MHz`,
    drives: `${T.bays.filter(b => b.st === 'locked').length} drive(s) seen by the storage controller`,
    cards: cardList(T).map(c => byId('cards', c).name).join(', ') || 'No add-in cards'
  };
}
function buildFull() {
  const t = fresh();
  t.cpu = [0, 1].map(() => syncSt(Object.assign(newSock(), { model: 'e2680', cap: false, hs: 'hsNew', tim: 'pad', screws: [2, 2, 2, 2] })));
  ['A1', 'E1', 'B1', 'F1', 'C1', 'G1', 'D1', 'H1'].forEach(s => { t.dimms[s] = { id: 'r16' }; }); t.memKit.r16 -= 8;
  t.riser = newRiser(); Object.assign(t.riser, { slots: { 4: null, 5: 'vic', 6: null }, blank: { 4: true, 5: false, 6: true }, seat: { 4: null, 5: { f: true, r: true }, 6: null } });
  for (let i = 0; i < 4; i++) t.bays[i] = { st: 'locked', drive: 'hd8t', health: 'ok', member: true, pct: 0 };
  t.rack = { stab: true, u: 3, inner: true, left: true, right: true, pos: 'in', cma: true, routed: true, labeled: true, tested: true };
  t.cables = { psu1: 'pduA', psu2: 'pduB', vic1: 'dataA', vic2: 'dataB', mgmt: 'mgmt' }; t.cablePort = { ...CWANT }; t.psu.forEach(p => { p.strap = true; });
  Object.assign(t.cimc, { pw: 'Lab-Train1ng!', pwSrc: 'preset', certOk: { [WO.ip]: true }, form: { url: '' } });
  Object.assign(t.cimc.net, { mode: 'Dedicated', red: 'None', dhcp: false, ip: WO.ip, mask: WO.mask, gw: WO.gw });
  t.power = 'on'; t.con.mode = 'done'; t.flags.hasOS = true;
  return t;
}

/* ============ 3. Readiness rules (each returns a list of {lvl, msg}) ============ */
Sim.registerRule(t => {
  const o = [];
  if (!cpuIn(t, 0)) o.push({ lvl: 'fail', msg: 'CPU 1 is not installed and fully tightened. The minimum configuration needs CPU 1.' });
  t.cpu.forEach((c, i) => {
    const n = i + 1;
    if (c.model && c.st !== 'torqued') {
      const why = c.plate === 'open' ? 'its hinged cover plate is open' : (c.lev.u === 'rel' || c.lev.l === 'rel') ? 'a retaining lever is not clipped down' : !c.hs ? 'it has no heatsink' : 'the four heatsink screws are not all tight';
      o.push({ lvl: 'fail', msg: `CPU ${n} is not fully installed: ${why}.` });
    }
    if (!c.model && !c.cap) o.push({ lvl: i ? 'warn' : 'fail', msg: `CPU socket ${n} is empty and has no protective dust cover. Keep the factory dust cover on an unused socket.` });
  });
  if (cpuIn(t, 0) && cpuIn(t, 1) && t.cpu[0].model !== t.cpu[1].model) o.push({ lvl: 'fail', msg: 'The two CPUs are different models. The server runs with one CPU or two identical CPUs.' });
  return o;
});
Sim.registerRule(t => {
  const o = [], m = memSummary(t), ids = Object.keys(t.dimms), mc = memCheck(t);
  if (!mc.ok) o.push({ lvl: 'fail', msg: mc.err });
  ids.filter(s => t.dimms[s] && s[1] === '3').map(s => s[0]).filter((c, i, a) => a.indexOf(c) === i).forEach(c => o.push({ lvl: 'warn', msg: `Channel ${c} has three DIMMs: three per channel slow the memory to ${m.speed} MHz.` }));
  if (mc.ok && mc.a.length % 4) o.push({ lvl: 'warn', msg: `${mc.a.length} DIMM${mc.a.length > 1 ? 's' : ''} per CPU leave${mc.a.length > 1 ? '' : 's'} some channels with fewer DIMMs than others. Supported, but 4, 8 or 12 per CPU give the best memory bandwidth.` });
  if (ids.some(s => t.dimms[s].fault)) o.push({ lvl: 'fail', msg: 'Uncorrectable memory errors on ' + ids.filter(s => t.dimms[s].fault).join(', ') + '. The system health LED shows amber.' });
  if (ids.some(s => dimmVerdict(byId('dimms', t.dimms[s].id)).cls !== 'ok')) o.push({ lvl: 'fail', msg: 'A DIMM that is not a supported Cisco part is installed.' });
  if (ids.length && m.speed < Math.min(...ids.map(s => byId('dimms', t.dimms[s].id).speed)) && !m.dpc3) o.push({ lvl: 'warn', msg: `Memory runs at ${m.speed} MHz, the maximum of the installed CPU.` });
  return o;
});
Sim.registerRule(t => {
  const o = [];
  if (riserOut(t)) o.push({ lvl: 'fail', msg: 'PCIe riser 2 is still out of the chassis.' });
  else if (!riserSeated(t)) o.push({ lvl: 'fail', msg: 'PCIe riser 2 is not fully engaged in its RISER2 socket. Push down on both ends.' });
  ['4', '5', '6'].forEach(s => { if (!t.riser.slots[s] && !t.riser.blank[s]) o.push({ lvl: 'warn', msg: `PCIe slot ${s} on riser 2 has no card and no blanking panel. Fit the panel: the airflow depends on it.` }); });
  if (!vicSlot(t)) o.push({ lvl: 'warn', msg: 'No VIC in riser 2: the server has no 10 Gb data ports.' });
  if (cardList(t).length && !cpuIn(t, 1)) o.push({ lvl: 'fail', msg: 'PCIe riser 2 (slots 4, 5, 6) is unavailable in a single-CPU configuration.' });
  if (!t.baffle) o.push({ lvl: 'fail', msg: 'The air baffle is not fitted. Without it, fan air bypasses the CPU heatsinks and DIMMs.' });
  t.fans.forEach((f, i) => { if (f === 'out' || f === 'set') o.push({ lvl: 'fail', msg: `Fan bay FAN 0${i + 1} has no latched module. Do not run the server for more than one minute with a fan module removed.` }); else if (f === 'fault') o.push({ lvl: 'warn', msg: `FAN 0${i + 1} has an amber fault LED. Replace it (hot-swappable).` }); });
  if (t.cover === 'open') o.push({ lvl: 'fail', msg: 'The top cover is off. Do not operate the system unless all covers are in place.' });
  else if (t.cover !== 'closed') o.push({ lvl: 'fail', msg: 'The top cover is on but the latch is open. Press the latch down so the cover closes.' });
  return o;
});
Sim.registerRule(t => {
  const o = [];
  if (t.arrayFailed) o.push({ lvl: 'fail', msg: 'The RAID volume has failed: a healthy member was pulled while the volume was already degraded.' });
  if (t.bays.some(b => b.st === 'open')) o.push({ lvl: 'fail', msg: 'A drive tray is inserted but its ejector lever is open, so it is not locked against the backplane.' });
  if (t.bays.some(b => b.member && b.health !== 'ok')) o.push({ lvl: 'warn', msg: 'The RAID volume is degraded.' });
  if (!t.bays.some(b => b.st === 'locked')) o.push({ lvl: 'warn', msg: 'No drives are installed in the front bays.' });
  const firstGap = t.bays.findIndex(b => b.st !== 'locked');
  if (firstGap >= 0 && t.bays.slice(firstGap).some(b => b.st === 'locked')) o.push({ lvl: 'warn', msg: 'Drives are not in the lowest-numbered bays. Cisco: add drives to the lowest-numbered bays first.' });
  if (t.bays.some(b => b.st === 'empty')) o.push({ lvl: 'warn', msg: 'An unused bay has no blanking tray. Keep one in every unused bay for proper airflow.' });
  return o;
});
Sim.registerRule(t => {
  const o = [], c = t.cables;
  if (t.rack.pos === 'bench') o.push({ lvl: 'warn', msg: 'The server is still on the bench, not in the rack.' });
  if (t.rack.pos === 'service') o.push({ lvl: 'warn', msg: 'The server is slid out of the rack.' });
  t.psu.forEach((p, i) => {
    const n = i + 1;
    if (p.st === 'out') o.push({ lvl: 'warn', msg: `Power supply bay ${n} is empty. Fit a power supply, or a blanking panel if the bay stays unused.` });
    else if (p.st === 'set') o.push({ lvl: 'fail', msg: `PSU ${n} is slid in but not locked. Push it home: the release lever clicks into place by itself.` });
    else if (p.fault) o.push({ lvl: 'warn', msg: `PSU ${n} has failed: its fault LED is amber. Replace it; with two supplies it is hot-swappable.` });
    else if (t.cables[psuKey(i)] && !p.strap) o.push({ lvl: 'warn', msg: `The hook-and-loop strap on PSU ${n} is open. Fasten it around the cord so the plug cannot be pulled out by accident.` });
  });
  if (!c.psu1 && !c.psu2) o.push({ lvl: 'fail', msg: 'No power cord is connected.' });
  else if (!psuAny(t)) o.push({ lvl: 'fail', msg: 'No power supply is working: every connected supply has failed or is not locked in.' });
  else if (!c.psu1 || !c.psu2) o.push({ lvl: 'warn', msg: 'Only one power supply is connected. Power supply redundancy (1+1) is lost.' });
  else if (c.psu1 === c.psu2) o.push({ lvl: 'warn', msg: 'Both power supplies are on the same PDU. One feed failure takes the server down.' });
  Object.keys(c).forEach(k => { if (cabWrong(t, k)) o.push({ lvl: 'warn', msg: `${CROUTE[k]} is cabled to ${portTxtC(c[k], cabN(t, k))}, but the cable schedule says ${wantTxt(k)}.${k === 'mgmt' ? ' That port is not assigned to this server: no out-of-band link.' : k.startsWith('vic') && c[k] === CDEF[k] ? ' That port is not assigned to this server: no data link.' : ''}` }); });
  if (!c.mgmt) o.push({ lvl: 'warn', msg: 'The dedicated management port is not connected, so there is no out-of-band path to Cisco IMC.' });
  if ((c.psu1 || c.psu2) && t.cimc.net.ip === '0.0.0.0') o.push({ lvl: 'warn', msg: 'Cisco IMC has no management IP address: no DHCP server answered. Set it from the local console with F8 (Console setup view).' });
  if (!c.vic1 && !c.vic2) o.push({ lvl: 'warn', msg: 'No data cable is connected to the VIC ports (riser 2, slot 5).' });
  else if (!c.vic1 || !c.vic2) o.push({ lvl: 'warn', msg: 'Only one VIC data port is connected. There is no network path redundancy.' });
  else if (c.vic1 === c.vic2) o.push({ lvl: 'warn', msg: 'VIC PORT 1 and PORT 2 are on the same data switch. One switch failure cuts the server off.' });
  if (Object.values(c).some(Boolean)) {
    if (!(t.rack.cma && t.rack.routed)) o.push({ lvl: 'warn', msg: 'Cables are not routed through the cable management arm.' });
    if (!t.rack.labeled) o.push({ lvl: 'warn', msg: 'Cables are not labelled at both ends.' });
  }
  return o;
});

/* ============ 4. Typed fields: the F8 utility (con:...) and the Cisco IMC web pages ============ */
Sim.onField((f, v) => { if (f.startsWith('con:')) T.con.form[f.slice(4)] = v; else T.cimc.form[f] = v; });
