/* ---- RAM Distributor for the DL380 Gen11 (engine/memplan.js): HPE's memory rules as data for the planner, and the
   view. The rules themselves live with the Memory view (views-mem.js: FILL, OKN, typeErrs, patternErrs, HPE256), so the
   planner, the Memory view and the grading agree. Speed: Xeon Gold 6430 (64xx), 4800 MT/s with one DIMM per channel,
   4400 MT/s with two (a50007437enw, table 15). ---- */
const RD_PARTS = Object.values(DIMMK).map(d => ({ key: d.key, pid: d.pid, name: d.name, short: d.tiny, cap: d.cap, org: `${d.org}${d.td ? ' 3DS' : ''}, ${d.dram} Gb DRAM` }));
const rdCount = m => m.filter(Boolean).length;
const HPE_RULES = {
  id: 'hpe-dl380-gen11', cpus: 2, slots: 16, channels: 8, defaultGb: 768, unit: 'MT/s', fill: FILL.map(n => n - 1),
  server: 'HPE ProLiant DL380 Gen11, 24 SFF, Intel Xeon Gold 6430: 16 DDR5 slots per processor',
  parts: RD_PARTS, part: k => RD_PARTS.find(p => p.key === k),
  chanOf: pos => Math.floor(pos / 2),
  cpuName: c => `Processor ${c + 1}`,
  cpusIn: t => cpuCount(t),
  slotName: (c, pos) => `P${c + 1}-${pos + 1}`,
  slotList: ps => { const ns = ps.map(p => p + 1).sort((a, b) => a - b), w = ns.every(white), b = ns.every(n => !white(n)); return `slot${ns.length > 1 ? 's' : ''} ${ns.join(', ')}${w ? ' (white)' : b ? ' (black)' : ''}`; },
  // one column per channel (slots 1-2 ... 15-16), the white slot on top
  grid: { rows: ['White', 'Black'], cols: Array.from({ length: 8 }, (_, k) => { const a = 2 * k + 1, b = a + 1; return { label: `${a}-${b}`, pos: white(a) ? [a - 1, b - 1] : [b - 1, a - 1] }; }) },
  facts: cpus => [['Processors', `${cpus} x Xeon Gold 6430`], ['Slots', '16 per processor, 8 channels of 2'], ['Speed', '4800 MT/s; 4400 with 2 per channel'], ['DIMMs', '9 HPE DDR5-4800 RDIMMs']],
  rules: ['Per processor: 1, 2, 4, 6, 8, 12 or 16 DIMMs, each count in its own slots (the table in the Memory view). Other counts may not boot.',
    'Both processors the same: HPE splits the DIMMs evenly over the processors.',
    'One DIMM per channel runs at 4800 MT/s; two per channel (12 or 16 per processor) at 4400 MT/s, with the Xeon Gold 6430.',
    'Never mix 3DS and standard RDIMMs, x4 and x8 DIMMs, or DRAM densities (16, 24 and 32 Gb).',
    'Two DIMM types only with all 16 slots of a processor filled: dual rank in every white slot, single rank in every black slot, for example 32 GB 2Rx8 with 16 GB 1Rx8, or 64 GB 2Rx4 with 32 GB 1Rx4.',
    'The 96 GB RDIMM: alone, with 8 or 16 per processor.',
    'The 256 GB RDIMMs are not supported in this server: they need the High Performance Fan Kit and at most two front drive cages, and this one has three.'],
  sources: 'Sources: HPE technical white paper a50007437enw, server memory population rules for HPE Gen11 servers with 4th Gen Intel Xeon (tables 6, 15 and 16); HPE ProLiant DL380 Gen11 QuickSpecs (memory).',
  excludedNote: HPE256,
  allowed: hpeOK, allowedWhy: () => 'Not supported in this server: it needs the High Performance Fan Kit and at most two drive cages.',
  checkCpu: m => [...patternErrs(m), ...typeErrs(m, false)],
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
    Object.keys(DIMMK).filter(hpeOK).forEach(k => OKN.forEach(n => { const m = Array(16).fill(null); layoutOf(n).forEach(s => { m[s - 1] = k; }); out.push(m); }));
    // the two mixes HPE allows that fit this chassis: dual rank white, single rank black, same width and DRAM density
    [['r32', 'r16'], ['r64', 'r32s']].forEach(([w, b]) => out.push(Array.from({ length: 16 }, (_, i) => white(i + 1) ? w : b)));
    return out;
  },
  note: maps => { const m = maps[0], ks = [...new Set(m.filter(Boolean))];
    return ks.length > 1 ? 'A mix HPE allows only with all 16 slots filled: dual rank in white, single rank in black.' : ks[0] === 'r96' ? 'The 96 GB RDIMM is supported only with 8 or 16 per processor, never mixed.' : ''; },
  read: t => [procMap(t, 'P1'), procMap(t, 'P2')],
  // the order arrives in its packaging: what is already fitted counts against it
  deliver(t, order) {
    const fit = typesIn(t);
    t.memBox = Object.fromEntries(Object.entries(order).map(([k, n]) => [k, Math.max(0, n - ((fit[k] || []).length))]).filter(([, n]) => n));
    t.memLeft = {}; t.flags.memUnpacked = false;
    t.memPick = Object.keys(DIMMK).find(k => t.memBox[k]) || t.memPick;
  },
  kitLeft: t => boxed(t) + Object.values(t.memLeft || {}).reduce((a, b) => a + b, 0),
  // the exam's tricky cases (and practice's): each needs one of HPE's rules to get the best layout
  tasks: [
    { cpus: 2, gb: 768, why: 'No single DIMM size fills the balanced layouts at 768 GB. The best is a mix HPE allows with all 16 slots filled: 32 GB 2Rx8 in every white slot and 16 GB 1Rx8 in every black slot, every channel used.' },
    { cpus: 2, gb: 1536, why: '16 x 96 GB, one in every channel at 4800 MT/s, is the best: the 96 GB RDIMM is supported with 8 or 16 per processor. The 64 GB 2Rx4 + 32 GB 1Rx4 mix also reaches 1536 GB in every channel, but at 4400 MT/s with twice the DIMMs (and only with the 1Rx4 32 GB part, not the 2Rx8).' },
    { cpus: 2, gb: 3072, why: 'The 96 GB RDIMM fills all 16 slots of each processor evenly: 32 x 96 GB. 24 x 128 GB also reaches 3 TB but unbalances the channels, and the 256 GB DIMMs are not supported in this chassis.' },
    { cpus: 2, gb: 640, why: '640 GB cannot be fitted exactly. The least a supported layout gives is 768 GB, and the best way to get it is the 32 GB 2Rx8 and 16 GB 1Rx8 mix.' },
    { cpus: 2, gb: 384, why: 'At 384 GB the best is 6 DIMMs per processor (12 x 32 GB): two channels per processor stay empty, but 24 x 16 GB is no faster and needs twice the DIMMs. Either 32 GB part is fine.' },
    { cpus: 2, gb: 4096, why: '4 TB means 32 x 128 GB (two DIMMs per channel, 4400 MT/s). 16 x 256 GB would leave half the slots free, but the 256 GB DIMMs are not supported in a 24 SFF chassis.' },
    { cpus: 1, gb: 256, why: 'With one processor only its 16 slots count. 8 x 32 GB fills every channel at 4800 MT/s.' },
    { cpus: 2, gb: 2048, why: '16 x 128 GB, one per channel at 4800 MT/s, beats 32 x 64 GB at 4400 MT/s. Both 128 GB parts work; 8 x 256 GB is not supported here.' },
    { cpus: 1, gb: 1536, why: 'On one processor 1.5 TB is 16 x 96 GB, every slot filled evenly. 12 x 128 GB also reaches it, unbalanced.' },
    { cpus: 2, gb: 192, why: '192 GB is 6 DIMMs per processor (12 x 16 GB). 4 per processor of 32 GB would leave four channels empty.' }]
};
Sim.memRules(HPE_RULES);
Sim.registerView(MemPlan.view({ id: 'rdist', title: 'RAM Distributor',
  keep: [['Capacity first', 'A work order asks for at least some capacity. Fit no more than the least a supported layout gives: extra DIMMs cost money and slots.'],
    ['Then bandwidth', 'Fill every channel equally where you can: 8 or 16 DIMMs per processor. Fewer or unequal channels split the memory into slower interleave regions.'],
    ['Then fewer DIMMs', 'When two layouts are as fast, use the one with fewer DIMMs: it leaves slots for a later upgrade.']] }));
// the cues for fitting a planned layout: take out what does not belong, then fit processor 1 and processor 2 in HPE's order
function rdFitCue(t, maps) {
  if (!maps) return null;
  if (boxed(t)) return C('memUnpack', '', 'Take the DIMMs out of their packaging.');
  for (const [c, p] of [[0, 'P1'], [1, 'P2']]) {
    const extra = procSlots(t, p).find(n => maps[c][n - 1] !== dimmKind(t.dimms[`${p}-${n}`]));
    if (extra) return C('slot', `${p}-${extra}`, `Take the DIMM out of processor ${c + 1}, slot ${extra}: it is not in the plan. Click it.`);
  }
  for (const [c, p] of [[0, 'P1'], [1, 'P2']]) {
    const add = FILL.find(n => maps[c][n - 1] && !t.dimms[`${p}-${n}`]); if (!add) continue;
    const k = maps[c][add - 1];
    if (!(t.memLeft[k] > 0)) return { say: `No ${DIMMK[k].tiny}s left on the mat: change the order in the RAM Distributor.` };
    if (t.memPick !== k) return C('memPick', k, `Fit ${DIMMK[k].tiny}s next: choose them in the DIMM kit (right).`);
    return !t.memOpen[`${p}-${add}`] ? C('slot', `${p}-${add}`, `Open the latches of processor ${c + 1}, slot ${add}.`) : C('slot', `${p}-${add}`, `Press the ${DIMMK[k].tiny} into processor ${c + 1}, slot ${add}: notch over the key, press down evenly.`);
  }
  return null;
}
// the server for the RAM Distributor labs: extended on its rails, access panel and air baffle off, wrist strap on,
// no memory, one or two processors as the work order says
function rdSetup(k) {
  const t = fresh();
  t.rack.pos = 'out'; t.cover = 'off'; t.baffle = false; t.esd = true; t.memBox = {}; t.memLeft = {}; t.flags.memUnpacked = false;
  if (k.cpus === 1) { t.sock2 = 'blank'; t.nuts2 = [0, 0, 0, 0]; t.wires2 = 'unlocked'; }
  return t;
}
