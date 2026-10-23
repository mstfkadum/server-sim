/* ---- RAM Distributor for the DL380 Gen11 (engine/memplan.js): HPE's memory rules as data for the board, and the
   view. The rules themselves live with the Memory view (views-mem.js: FILL, OKN, typeErrs, patternErrs), so the board,
   the Memory view and the grading agree. The board offers the three HPE DIMMs of the labs (MEMKIT_H): 16 GB 1Rx8,
   32 GB 2Rx8 and 64 GB 2Rx4. Speed: Xeon Gold 6430 (64xx), 4800 MT/s with one DIMM per channel,
   4400 MT/s with two (a50007437enw, table 15). ---- */
const RD_PARTS = MEMKIT_H.map(k => DIMMK[k]).map(d => ({ key: d.key, pid: d.pid, name: d.name, short: d.tiny, cap: d.cap, org: `${d.org}${d.td ? ' 3DS' : ''}, ${d.dram} Gb DRAM` }));
const rdCount = m => m.filter(Boolean).length;
const HPE_RULES = {
  id: 'hpe-dl380-gen11', cpus: 2, slots: 16, channels: 8, defaultGb: 512, unit: 'MT/s', fill: FILL.map(n => n - 1),
  server: 'HPE ProLiant DL380 Gen11, 24 SFF, Intel Xeon Gold 6430: 16 DDR5 slots per processor',
  parts: RD_PARTS, part: k => RD_PARTS.find(p => p.key === k),
  chanOf: pos => Math.floor(pos / 2),
  cpuName: c => `Processor ${c + 1}`,
  slotName: (c, pos) => `P${c + 1}-${pos + 1}`,
  slotList: ps => { const ns = ps.map(p => p + 1).sort((a, b) => a - b), w = ns.every(white), b = ns.every(n => !white(n)); return `slot${ns.length > 1 ? 's' : ''} ${ns.join(', ')}${w ? ' (white)' : b ? ' (black)' : ''}`; },
  // the board as it sits in the server, left to right (views-chassis.js: SLOTX): processor 2 with its slots 1-8 left
  // of it and 9-16 right, then processor 1 the same; slot numbers as on the service label
  board: { layout: [1, 0].flatMap((c, i) => [...[0, 1, 2, 3, 4, 5, 6, 7].map(pos => ({ c, pos })), { cpu: c }, ...[8, 9, 10, 11, 12, 13, 14, 15].map(pos => ({ c, pos })), ...(i ? [] : [{ gap: true }])]),
    slot: pos => ({ tone: white(pos + 1) ? 'white' : 'black' }), label: (c, pos) => String(pos + 1),
    note: 'Minimum: 1 DIMM per processor, in slot 10 (2 in all). Per processor 1, 2, 4, 6, 8, 12 or 16 DIMMs, in HPE\'s order: 10, 3, then 7, 14, then 5, 16, then 1, 12 (every white slot), then the black slots; processor 2 the same as processor 1.',
    legend: ['in an HPE layout, both processors alike', 'in order, count or other processor not finished', 'wrong slot or type'] },
  facts: cpus => [['Processors', `${cpus} x Xeon Gold 6430`], ['Slots', '16 per processor, 8 channels of 2'], ['Speed', '4800 MT/s; 4400 with 2 per channel'], ['DIMMs', 'HPE DDR5-4800 RDIMM: 16, 32 and 64 GB']],
  population: POP_HTML_H,
  rules: ['Per processor: 1, 2, 4, 6, 8, 12 or 16 DIMMs, each count in its own slots (the table in the Memory view). Other counts may not boot.',
    'Both processors the same: HPE splits the DIMMs evenly over the processors.',
    'One DIMM per channel runs at 4800 MT/s; two per channel (12 or 16 per processor) at 4400 MT/s, with the Xeon Gold 6430.',
    'Never mix x4 and x8 DIMMs: the 64 GB 2Rx4 never goes with the 16 GB 1Rx8 or the 32 GB 2Rx8.',
    'Two DIMM types only with all 16 slots of a processor filled: dual rank in every white slot, single rank in every black slot. Here: 32 GB 2Rx8 (white) with 16 GB 1Rx8 (black).'],
  sources: 'Sources: HPE technical white paper a50007437enw, server memory population rules for HPE Gen11 servers with 4th Gen Intel Xeon (tables 6, 15 and 16); HPE ProLiant DL380 Gen11 QuickSpecs (memory).',
  checkCpu: m => [...patternErrs(m), ...typeErrs(m, false)],
  // for the marks on the board: the types on one processor so far, and whether the count is one of HPE's
  typeErrs: m => typeErrs(m, true),
  countOk: m => OKN.includes(m.filter(Boolean).length) && !typeErrs(m, false).length,
  checkServer(maps, cpus) {
    const e = [], used = maps.slice(0, cpus);
    if (cpus < 2 && rdCount(maps[1])) e.push('Processor 2 is not installed: DIMMs in its slots are not used. Fit DIMMs only for an installed processor.');
    used.forEach((m, c) => { if (!rdCount(m)) e.push(`Processor ${c + 1} has no DIMMs: every installed processor needs at least one, in slot 10.`); });
    if (cpus === 2 && rdCount(maps[0]) && rdCount(maps[1])) {
      if (rdCount(maps[0]) !== rdCount(maps[1])) e.push(`Unbalanced: processor 1 has ${rdCount(maps[0])} DIMMs and processor 2 has ${rdCount(maps[1])}. HPE splits the DIMMs evenly over the processors.`);
      else if (maps[0].some((k, i) => (k ? DIMMK[k].cap : 0) !== (maps[1][i] ? DIMMK[maps[1][i]].cap : 0))) e.push('Unbalanced: the processors hold different capacities in the same slots. HPE splits the memory evenly over the processors.');
      // across the processors: one memory family and one DRAM density in the server
      const ks = used.flat().filter(Boolean).map(k => DIMMK[k]);
      if (!used.some(m => typeErrs(m, true).length) && ks.some(d => d.td) && ks.some(d => !d.td)) e.push('3DS and standard RDIMMs in the server: HPE does not support mixing 3DS and non-3DS memory.');
    }
    if (maps.some(m => m.some(k => k && !hpeOK(k)))) e.push(HPE256);
    return e;
  },
  speed: maps => maps.some(m => m.some((k, i) => k && i % 2 === 0 && m[i + 1])) ? 4400 : 4800,
  candidates() {
    const out = [];
    MEMKIT_H.forEach(k => OKN.forEach(n => { const m = Array(16).fill(null); layoutOf(n).forEach(s => { m[s - 1] = k; }); out.push(m); }));
    // the mix HPE allows with these three: dual rank white, single rank black, same width and DRAM density
    [['r32', 'r16']].forEach(([w, b]) => out.push(Array.from({ length: 16 }, (_, i) => white(i + 1) ? w : b)));
    return out;
  },
  note: maps => { const m = maps[0], ks = [...new Set(m.filter(Boolean))];
    return ks.length > 1 ? 'A mix HPE allows only with all 16 slots filled: dual rank in white, single rank in black.' : ''; },
  // the exam's tricky cases (and practice's): each needs one of HPE's rules to get the best layout
  tasks: [
    { cpus: 2, gb: 768, why: '32 GB 2Rx8 in every white slot and 16 GB 1Rx8 in every black slot: a mix HPE allows with all 16 slots of each processor filled, every channel used (4400 MT/s). 24 x 32 GB leaves the channels unequal, and 12 x 64 GB uses only six channels per processor.' },
    { cpus: 2, gb: 640, why: '640 GB cannot be fitted exactly. The least a supported layout gives is 768 GB, and the best way to get it is the 32 GB 2Rx8 and 16 GB 1Rx8 mix.' },
    { cpus: 2, gb: 384, why: 'At 384 GB the best is 6 DIMMs per processor (12 x 32 GB) at 4800 MT/s: 24 x 16 GB is about as fast (two per channel run at 4400 MT/s) but needs twice the DIMMs.' },
    { cpus: 2, gb: 1024, why: '16 x 64 GB, one per channel at 4800 MT/s, beats 32 x 32 GB at 4400 MT/s.' },
    { cpus: 1, gb: 256, why: 'With one processor only its 16 slots count. 8 x 32 GB fills every channel at 4800 MT/s.' },
    { cpus: 2, gb: 2048, why: 'The most this server holds with these DIMMs: 32 x 64 GB, every slot filled, two per channel at 4400 MT/s.' },
    { cpus: 2, gb: 192, why: '192 GB is 6 DIMMs per processor (12 x 16 GB) at 4800 MT/s. 6 x 32 GB would be 3 per processor, a count HPE does not support.' },
    { cpus: 2, gb: 1280, why: '1280 GB cannot be met exactly: 20 x 64 GB is 10 per processor, a count HPE does not support. The least is 1536 GB: 24 x 64 GB, 12 per processor.' },
    { cpus: 1, gb: 384, why: 'On one processor 384 GB is the 32 GB 2Rx8 + 16 GB 1Rx8 mix, every slot filled: 6 x 64 GB uses only six channels, and 12 x 32 GB leaves the channels unequal.' },
    { cpus: 2, gb: 96, why: '96 GB cannot be fitted exactly: 3 x 16 GB per processor is not a count HPE supports. The least is 128 GB: 8 x 16 GB, four per processor.' }]
};
Sim.memRules(HPE_RULES);
Sim.registerView(MemPlan.view({ id: 'rdist', title: 'RAM Distributor',
  keep: [['Capacity first', 'A work order asks for at least some capacity. Fit no more than the least a supported layout gives: extra DIMMs cost money and slots.'],
    ['Then bandwidth', 'Fill every channel equally where you can: 8 or 16 DIMMs per processor. Fewer or unequal channels split the memory into slower interleave regions.'],
    ['Then fewer DIMMs', 'When two layouts are as fast, use the one with fewer DIMMs: it leaves slots for a later upgrade.']] }));
// the server for the RAM Distributor labs (the plan is made on the board): extended on its rails, access panel and air baffle off, wrist strap on,
// no memory, one or two processors as the work order says
function rdSetup(k) {
  const t = fresh();
  t.rack.pos = 'out'; t.cover = 'off'; t.baffle = false; t.esd = true;
  if (k.cpus === 1) { t.sock2 = 'blank'; t.nuts2 = [0, 0, 0, 0]; t.wires2 = 'unlocked'; }
  return t;
}
