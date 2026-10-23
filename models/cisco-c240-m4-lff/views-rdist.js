/* ---- RAM Distributor for the C240 M4 (engine/memplan.js): Cisco's memory rules as data for the board, and the view.
   The rules live with the memory model (model.js: cfill, typeErrsC, memSpeed), so the board, the Memory view and the
   grading agree. The board offers the three Cisco DIMMs of the labs: 16 GB and 32 GB RDIMM, 64 GB LRDIMM. Sockets per CPU as positions: channel x 3 + slot - 1 (A1 A2 A3 B1 ...); Cisco's order fills every
   blue #1 socket first, then the black #2, then the white #3. Speed: the lab's Xeon E5-2680 v4 runs 2400 MHz memory. ---- */
const CIS_ORDER = [0, 3, 6, 9, 1, 4, 7, 10, 2, 5, 8, 11];
const RD_PARTS = CATALOG.dimms.filter(d => MEMKIT_C.includes(d.id)).map(d => ({ key: d.id, pid: d.pid, name: d.name, short: d.short, cap: d.cap, org: `${d.label.split(' ')[1]} ${d.type}` }));
const rdCount = m => m.filter(Boolean).length;
const rdName = (c, pos) => PROFILE.channels[c][Math.floor(pos / 3)] + (pos % 3 + 1);
const CIS_RULES = {
  id: 'cisco-c240-m4', cpus: 2, slots: 12, channels: 4, defaultGb: 256, unit: 'MHz', cpuWord: 'CPU', fill: CIS_ORDER,
  server: 'Cisco UCS C240 M4 LFF, Intel Xeon E5-2680 v4: 12 DDR4 sockets per CPU',
  parts: RD_PARTS, part: k => RD_PARTS.find(p => p.key === k),
  chanOf: pos => Math.floor(pos / 3),
  cpuName: c => `CPU ${c + 1}`,
  slotName: rdName,
  slotList: (ps, cpus) => ps.slice().sort((a, b) => CIS_ORDER.indexOf(a) - CIS_ORDER.indexOf(b)).map(p => rdName(0, p)).join(', ') + (cpus > 1 ? ' (E to H the same on CPU 2)' : ''),
  // the board: one group per channel (A to D, E to H on CPU 2), its sockets blue #1, black #2, white #3
  board: { chans: [0, 1, 2, 3].map(ch => ({ label: c => PROFILE.channels[c][ch], pos: [ch * 3, ch * 3 + 1, ch * 3 + 2] })),
    slot: pos => ({ num: pos % 3 + 1, tone: ['blue', 'black', 'white'][pos % 3] }),
    note: 'Minimum: 1 DIMM per CPU, in A1 and E1 (2 in all). Order per CPU: blue #1 in A to D, then black #2, then white #3.',
    legend: ['in Cisco\'s order, both CPUs alike', 'in order, other CPU not matching yet', 'wrong socket or mixed type'] },
  quick: [32, 64, 96, 128, 256, 384, 512, 1024, 1536],
  facts: cpus => [['Processors', `${cpus} x Xeon E5-2680 v4`], ['Sockets', '12 per CPU, 4 channels of 3'], ['Speed', '2400 MHz; 3 per channel 2133, or 1866 with dual-rank RDIMMs'], ['DIMMs', 'Cisco DDR4-2400: 16 and 32 GB RDIMM, 64 GB LRDIMM']],
  rules: ['Per CPU: 1 to 12 DIMMs in Cisco\'s order: blue #1 in A to D, then black #2, then white #3.',
    'Both CPUs identical: the same DIMMs in the same positions (A1 and E1, B1 and F1 ...).',
    'Never mix RDIMMs and LRDIMMs: the 64 GB LRDIMM never shares the server with the 16 GB or 32 GB RDIMM.',
    'In a channel, the DIMM with more ranks goes first, in blue slot 1.',
    '2400 MHz with 1 or 2 DIMMs per channel. With 3: 2133 MHz, or 1866 MHz when the channel holds dual-rank RDIMMs (both RDIMMs here are dual rank).',
    'RDIMMs of different sizes in the server run one step down, at 2133 MHz.'],
  sources: 'Source: Cisco UCS C240 M4 spec sheet (memory: table 7 DIMMs, population rules, table 9 speeds with 2400 MHz CPUs).',
  checkCpu(m, c) {
    const n = rdCount(m); if (!n) return [];
    const want = CIS_ORDER.slice(0, n), e = [];
    if (m.some((k, i) => k && !want.includes(i))) e.push(`${n} DIMMs, but Cisco's sockets for ${n} per CPU are ${want.map(p => rdName(c, p)).join(', ')}.`);
    if (new Set(m.filter(Boolean).map(k => byId('dimms', k).type)).size > 1) e.push('RDIMMs and LRDIMMs mixed: Cisco says do not mix RDIMMs with LRDIMMs.');
    return e.concat(typeErrsC(m, c));
  },
  // the DIMM types on one CPU, for the marks on the board: RDIMM with LRDIMM, ranks, LRDIMM sizes
  typeErrs: (m, c) => (new Set(m.filter(Boolean).map(k => byId('dimms', k).type)).size > 1 ? ['RDIMMs and LRDIMMs mixed.'] : []).concat(typeErrsC(m, c)),
  checkServer(maps, cpus) {
    const e = [], used = maps.slice(0, cpus);
    if (cpus < 2 && rdCount(maps[1])) e.push('CPU 2 is not installed: Cisco says DIMMs in the sockets of an absent CPU are not recognized.');
    used.forEach((m, c) => { if (!rdCount(m)) e.push(`CPU ${c + 1} has no DIMMs: every installed CPU needs at least one, in blue socket ${PROFILE.channels[c][0]}1.`); });
    if (cpus === 2 && rdCount(maps[0]) && rdCount(maps[1]) && maps[0].some((k, i) => (k || null) !== (maps[1][i] || null))) e.push('The two CPUs are not populated identically. Cisco: DIMMs for CPU 1 and CPU 2 must always be configured identically.');
    const ty = new Set(used.flat().filter(Boolean).map(k => byId('dimms', k).type));
    if (ty.size > 1 && !used.some(m => new Set(m.filter(Boolean).map(k => byId('dimms', k).type)).size > 1)) e.push('RDIMMs and LRDIMMs in the server: Cisco says do not mix them.');
    return e;
  },
  speed: maps => memSpeed(maps, 2400),
  candidates() {
    const out = [], RD = ['r16', 'r32'], LR = ['l64'];
    for (let n = 1; n <= 12; n++) {
      const rows = Math.ceil(n / 4), fill = parts => { const m = Array(12).fill(null); CIS_ORDER.slice(0, n).forEach((pos, i) => { m[pos] = parts[Math.floor(i / 4)]; }); return m; };
      LR.forEach(k => out.push(fill([k, k, k])));
      // RDIMMs: one model per row of sockets, ranks never rising from blue to white
      const rec = acc => { if (acc.length === rows) { out.push(fill(acc)); return; } RD.forEach(k => { if (!acc.length || byId('dimms', k).ranks <= byId('dimms', acc[acc.length - 1]).ranks) rec([...acc, k]); }); };
      rec([]);
    }
    return out;
  },
  note: maps => { const m = maps[0], caps = new Set(m.filter(Boolean).map(k => byId('dimms', k).cap)), three = [0, 1, 2, 3].some(ch => m[ch * 3 + 2]);
    return [caps.size > 1 ? 'Mixed RDIMM sizes: Cisco runs the memory one step down, at 2133 MHz.' : '', three ? 'Three DIMMs in a channel: one step down (two for dual-rank RDIMMs).' : ''].filter(Boolean).join(' '); },
  // the exam's tricky cases (and practice's): each needs one of Cisco's rules to get the best layout
  tasks: [
    { cpus: 2, gb: 384, why: 'The best 384 GB fills two sockets in every channel: 32 GB RDIMMs in the blue sockets and 16 GB RDIMMs in the black ones. Mixed RDIMM sizes run at 2133 MHz, still faster than 12 x 32 GB (unequal channels) or 24 x 16 GB (three dual-rank RDIMMs per channel drop to 1866 MHz).' },
    { cpus: 2, gb: 512, why: '8 x 64 GB LRDIMM and 16 x 32 GB RDIMM both fill every channel at 2400 MHz: the one with fewer DIMMs wins and leaves sockets free.' },
    { cpus: 1, gb: 96, why: 'With one CPU only sockets A to D count. 6 x 16 GB (two channels with two DIMMs, two with one) beats 3 x 32 GB, which leaves channel D empty.' },
    { cpus: 2, gb: 1000, why: '1000 GB cannot be fitted exactly. The least a supported layout gives is 1024 GB: 16 x 64 GB LRDIMM, two per channel at 2400 MHz.' },
    { cpus: 2, gb: 256, why: '8 x 32 GB RDIMM, one in every channel at 2400 MHz. 16 x 16 GB is as fast but needs twice the DIMMs; 4 x 64 GB leaves half the channels empty.' },
    { cpus: 2, gb: 1536, why: 'The most this server holds: 24 x 64 GB LRDIMM, three per channel at 2133 MHz.' },
    { cpus: 1, gb: 768, why: 'One CPU holds at most 12 x 64 GB = 768 GB: every socket of A to D, at 2133 MHz.' },
    { cpus: 2, gb: 1152, why: 'Only 18 x 64 GB LRDIMM reaches 1152 GB exactly: 9 per CPU, so one channel per CPU has three DIMMs and the others two. Unbalanced, but nothing at 1152 GB does better.' },
    { cpus: 2, gb: 768, why: '12 x 64 GB LRDIMM (6 per CPU, unequal channels) at 2400 MHz beats 24 x 32 GB RDIMM: three dual-rank RDIMMs in a channel drop the memory to 1866 MHz.' },
    { cpus: 2, gb: 48, why: '48 GB cannot be fitted exactly with both CPUs the same: 24 GB per CPU is no DIMM count of these sizes. The least is 64 GB: 4 x 16 GB, two per CPU.' }]
};
Sim.memRules(CIS_RULES);
Sim.registerView(MemPlan.view({ id: 'rdist', title: 'RAM Distributor',
  keep: [['Capacity first', 'A work order asks for at least some capacity. Fit no more than the least a supported layout gives: extra DIMMs cost money and sockets.'],
    ['Then bandwidth', 'Fill every channel equally where you can: 4, 8 or 12 DIMMs per CPU. Three per channel slow the memory; unequal channels split it into slower interleave regions.'],
    ['Then fewer DIMMs', 'When two layouts are as fast, use the one with fewer DIMMs: it leaves sockets for a later upgrade.']] }));
// the server for the RAM Distributor labs (the plan is made on the board): open on the bench, wrist strap on, no memory,
// one or two CPUs as ordered
function rdSetup(k) {
  const t = buildFull(); t.dimms = {}; t.memKit = Object.fromEntries(MEMKIT_C.map(k => [k, 24])); t.power = 'off'; t.post = null; t.con = newCon();
  t.cables = { psu1: null, psu2: null, vic1: null, vic2: null, mgmt: null }; t.cablePort = { ...CWANT }; t.rack.pos = 'service';
  t.cover = 'open'; t.coverLock = false; t.baffle = false; t.esd = true;
  if (k.cpus === 1) t.cpu[1] = syncSt(newSock());
  return t;
}
