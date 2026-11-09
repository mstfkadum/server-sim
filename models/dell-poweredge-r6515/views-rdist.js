/* ==========================================================================================================
   Dell PowerEdge R6515 — RAM Distributor rules: Dell Installation and Service Manual (Rev. A14, pages 17, 47–54,
   Tables 12–16). Single AMD EPYC 7002/7003 processor, eight DDR4 memory channels (A to H), two DIMMs per channel
   (16 sockets total: A1 to A16). White release tabs mark the first socket of each channel (A1 to A8, populated first
   in numerical order A1 -> A8 at 3200 MT/s); black release tabs mark the second socket of each channel (A9 to A16,
   populated A9 -> A16 at 2933 MT/s for 2 DPC). Balanced Dell configurations (Table 16): 4, 8, 12, or 16 identical
   DIMMs. Mixing RDIMM and LRDIMM or different module capacities is not supported.
   © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved.
   ========================================================================================================== */

const RD_PARTS = DIMMK.map(k => {
  const d = MEMKIT_D[k];
  return { key: k, pid: d.tag, name: d.name, short: `${d.gb} GB ${d.rank} ${d.kind}`, cap: d.gb, org: `${d.org}, ${d.v}` };
});
const rdCount = m => m.filter(Boolean).length;

// Dell ISM page 49 & Table 13: no mixing RDIMM with LRDIMM, and all occupied sockets must hold identical capacity/rank
function dellTypeErrs(m) {
  const used = [...new Set(m.filter(Boolean))];
  const errs = [];
  if (used.some(k => MEMKIT_D[k].kind === 'RDIMM') && used.some(k => MEMKIT_D[k].kind === 'LRDIMM'))
    errs.push('RDIMM and LRDIMM mixed: Dell PowerEdge R6515 does not support mixing RDIMM and LRDIMM in the same system (ISM page 49, Table 13).');
  if (used.length > 1)
    errs.push(`Mixed memory models (${used.map(k => `${MEMKIT_D[k].gb} GB ${MEMKIT_D[k].rank}`).join(' + ')}): Dell ISM page 49 states that mixing memory module capacities is not supported and all populated channels must hold identical DIMMs.`);
  return errs;
}

// Dell ISM Table 14 & Table 16: balanced counts are 4, 8, 12, or 16 in numerical order A1..A16 (white tabs before black tabs)
function dellPatternErrs(m) {
  const n = rdCount(m);
  if (!n) return [];
  const errs = [];
  if (!OKN.includes(n))
    errs.push(`${n} DIMM${n > 1 ? 's' : ''} is not a balanced Dell PowerEdge R6515 count: populate 4 (A1–A4, minimum recommended for NPS 1), 8 (A1–A8, all 8 channels at 1 DPC), 12 (A1–A12, NPS 2), or 16 (A1–A16, all 16 sockets at 2 DPC).`);
  const targetN = OKN.includes(n) ? n : (OKN.find(x => x > n) || 16);
  const want = [...Array(targetN).keys()];
  if (m.some((k, i) => k && i >= n)) {
    const got = m.map((k, i) => k ? 'A' + (i + 1) : null).filter(Boolean).join(', ');
    const exp = [...Array(n).keys()].map(i => 'A' + (i + 1)).join(', ');
    errs.push(`Wrong sockets for ${n} DIMMs: Dell's population order is ${exp} (white release tabs A1–A8 first, then black release tabs A9–A16), not ${got}.`);
  }
  const pairs = [['D', 0, 8], ['C', 1, 9], ['H', 2, 12], ['G', 3, 13], ['B', 4, 10], ['A', 5, 11], ['F', 6, 14], ['E', 7, 15]];
  pairs.forEach(([ch, wi, bi]) => {
    if (m[bi] && !m[wi])
      errs.push(`Channel ${ch}: black-tab socket A${bi + 1} (2nd in channel) is populated while white-tab socket A${wi + 1} (1st in channel) is empty — populate white release tabs (A1–A8) before black release tabs (A9–A16).`);
  });
  return errs;
}

const DELL_RULES = {
  id: 'dell-poweredge-r6515', cpus: 1, slots: 16, channels: 8, defaultGb: 256, unit: 'MT/s', cpuWord: 'CPU',
  fill: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  server: 'Dell PowerEdge R6515, 1U, AMD EPYC 7313P: 16 DDR4 sockets (A1 to A16) across 8 memory channels',
  parts: RD_PARTS, part: k => RD_PARTS.find(p => p.key === k),
  chanOf: pos => 'ABCDEFGH'.indexOf(CHAN['A' + (pos + 1)]),
  cpuName: c => `CPU ${c + 1}`,
  slotName: (c, pos) => 'A' + (pos + 1),
  slotList: ps => {
    const ns = ps.slice().sort((a, b) => a - b).map(p => 'A' + (p + 1));
    const w = ps.every(p => p < 8), b = ps.every(p => p >= 8);
    return `socket${ns.length > 1 ? 's' : ''} ${ns.join(', ')}${w ? ' (white release tabs)' : b ? ' (black release tabs)' : ''}`;
  },
  // Physical system-board order from left to right (ISM Figure 11, page 17):
  // Left bank: A3, A13, A4, A14, A7, A15, A8, A16 | CPU 1 (AMD EPYC) | Right bank: A12, A6, A11, A5, A10, A2, A9, A1
  board: {
    layout: [
      ...SLOTS_L.map(s => ({ c: 0, pos: +s.slice(1) - 1 })),
      { cpu: 0 },
      ...SLOTS_R.map(s => ({ c: 0, pos: +s.slice(1) - 1 }))
    ],
    slot: pos => ({ tone: pos < 8 ? 'white' : 'black' }),
    label: (c, pos) => 'A' + (pos + 1),
    note: 'Minimum recommended: 4 equal DIMMs in A1, A2, A3, A4 (white release tabs, NPS 1). Balanced counts: 4, 8, 12 or 16 identical DIMMs in Dell\'s numerical order: white release tabs A1 to A8 first (1 DPC at 3200 MT/s), then black release tabs A9 to A16 (2 DPC at 2933 MT/s).',
    legend: ['in a balanced Dell layout (4, 8, 12 or 16 in A1..A16)', 'in order, balanced count not yet reached', 'wrong socket, mixed capacities, or mixed RDIMM/LRDIMM']
  },
  facts: () => [
    ['Processor', '1 × AMD EPYC 7313P (SP3)'],
    ['Sockets', '16 DDR4 (A1 to A16), 8 channels of 2'],
    ['Speed', '3200 MT/s (1 DPC, A1–A8); 2933 MT/s (2 DPC, A9–A16)'],
    ['DIMMs', 'Dell DDR4-3200: 8, 16, 32, 64 GB RDIMM; 128 GB LRDIMM']
  ],
  population: POP_HTML_D,
  rules: [
    'Single AMD EPYC processor with 8 memory channels (A to H), 2 DDR4 sockets per channel (16 sockets: A1 to A16).',
    'White release tabs (A1 to A8) mark the first socket of each channel and are populated first in numerical order A1 -> A8 (1 DPC at 3200 MT/s).',
    'Black release tabs (A9 to A16) mark the second socket of each channel and are populated after A1–A8 in numerical order A9 -> A16 (2 DPC at 2933 MT/s).',
    'Balanced Dell configurations (ISM page 49 & Table 16): 4 (A1–A4, minimum recommended for NPS 1), 8 (A1–A8, all 8 channels at 3200 MT/s), 12 (A1–A12, NPS 2), or 16 (A1–A16, full capacity).',
    'Never mix RDIMM and LRDIMM or different memory module capacities in the same system (ISM page 49, Table 13).'
  ],
  sources: 'Sources: Dell PowerEdge R6515 Installation and Service Manual (Rev. A14), System board connectors (Figure 11, page 17) and System memory (pages 47 to 54, Tables 12 to 16).',
  checkCpu: m => [...dellPatternErrs(m), ...dellTypeErrs(m)],
  typeErrs: m => dellTypeErrs(m),
  countOk: m => OKN.includes(rdCount(m)) && !dellTypeErrs(m).length,
  checkServer(maps) {
    const e = [];
    if (!rdCount(maps[0])) e.push('CPU 1 has no DIMMs: populate at least 4 equal modules in A1, A2, A3, A4 (Dell ISM page 49).');
    return e;
  },
  // 1 DPC (only white tabs A1–A8) runs at 3200 MT/s; 2 DPC (any black tab A9–A16 occupied) runs at 2933 MT/s (ISM Table 13)
  speed: maps => maps.some(m => m.some((k, pos) => k && pos >= 8)) ? 2933 : 3200,
  candidates() {
    const out = [];
    DIMMK.forEach(k => OKN.forEach(n => {
      const m = Array(16).fill(null);
      for (let i = 0; i < n; i++) m[i] = k;
      out.push(m);
    }));
    return out;
  },
  note: maps => maps[0].some((k, pos) => k && pos >= 8) ? 'Two DIMMs per channel (black release tabs A9–A16 occupied): bus speed steps down from 3200 MT/s to 2933 MT/s (ISM Table 13).' : '',
  tasks: [
    { cpus: 1, gb: 256, why: 'Eight 32 GB 2Rx8 RDIMMs in the eight white-tab sockets A1–A8 fill every channel at 1 DPC (3200 MT/s), beating sixteen 16 GB RDIMMs (which drop to 2933 MT/s at 2 DPC) and four 64 GB RDIMMs (half the channels).' },
    { cpus: 1, gb: 512, why: 'Eight 64 GB 2Rx4 RDIMMs in the eight white-tab sockets A1–A8 fill all eight memory channels at 1 DPC (3200 MT/s), beating sixteen 32 GB RDIMMs (2933 MT/s) and four 128 GB LRDIMMs (4 channels).' },
    { cpus: 1, gb: 1024, why: 'Eight 128 GB 8Rx4 LRDIMMs in A1–A8 give 1 TB across all eight channels at 1 DPC (3200 MT/s), beating sixteen 64 GB RDIMMs (which drop to 2933 MT/s at 2 DPC).' },
    { cpus: 1, gb: 128, why: 'Eight 16 GB 2Rx8 RDIMMs in A1–A8 populate every channel at 1 DPC (3200 MT/s), beating four 32 GB RDIMMs (4 channels) and sixteen 8 GB RDIMMs (2933 MT/s).' },
    { cpus: 1, gb: 64, why: 'Eight 8 GB 1Rx8 RDIMMs in A1–A8 populate all eight channels at 3200 MT/s, doubling the active channels of four 16 GB RDIMMs in A1–A4.' },
    { cpus: 1, gb: 384, why: '384 GB is 12 × 32 GB 2Rx8 RDIMM in A1–A12 (all eight white-tab sockets A1–A8 plus black-tab sockets A9–A12, ISM Table 14 & Table 16).' },
    { cpus: 1, gb: 768, why: '768 GB is 12 × 64 GB 2Rx4 RDIMM in A1–A12 (A1–A8 white tabs plus A9–A12 black tabs).' },
    { cpus: 1, gb: 192, why: '192 GB is 12 × 16 GB 2Rx8 RDIMM in A1–A12 (A1–A8 white tabs plus A9–A12 black tabs).' },
    { cpus: 1, gb: 600, why: '600 GB cannot be fitted exactly with a balanced Dell count (10 × 64 GB = 640 GB is 10 DIMMs, not in 4, 8, 12, 16). The least balanced configuration >= 600 GB is 768 GB: 12 × 64 GB 2Rx4 RDIMM in A1–A12.' },
    { cpus: 1, gb: 2048, why: 'Dell ISM Table 12 & Table 13: 2 TB maximum capacity requires sixteen 128 GB 8Rx4 LRDIMMs across all 16 sockets A1–A16 (2 DPC at 2933 MT/s).' }
  ]
};

Sim.memRules(DELL_RULES);

Sim.registerView(MemPlan.view({
  id: 'rdist', title: 'RAM Distributor',
  keep: [
    ['8 channels, 16 sockets', 'The single AMD EPYC processor has eight DDR4 memory channels (A to H), two sockets per channel: A3, A13, A4, A14, A7, A15, A8, A16 on the left of the processor and A12, A6, A11, A5, A10, A2, A9, A1 on the right (ISM Figure 11 & Table 12).'],
    ['White tabs before black', 'Sockets A1–A8 have white release tabs (first socket of each channel) and are populated first in numerical order A1 to A8 (1 DPC at 3200 MT/s). Sockets A9–A16 have black release tabs (second socket of each channel) and follow A9 to A16 (2 DPC at 2933 MT/s, ISM Table 13 & Table 14).'],
    ['Balanced counts: 4, 8, 12, 16', 'Dell ISM page 49 & Table 16: populate 4 (A1–A4, minimum recommended for NPS 1), 8 (A1–A8, all 8 channels at 3200 MT/s), 12 (A1–A12, NPS 2), or 16 (A1–A16, full capacity). Other counts leave channels unbalanced.'],
    ['No mixing models', 'ISM page 49 & Table 13: five DDR4-3200 models are supported (8 GB 1Rx8, 16 GB 2Rx8, 32 GB 2Rx8, 64 GB 2Rx4 RDIMM up to 1 TB, and 128 GB 8Rx4 LRDIMM up to 2 TB). Never mix RDIMM and LRDIMM or different capacities in the system.'],
    ['Inexact work orders', 'When a customer requests a capacity that no balanced count (4, 8, 12, 16) of a single Dell DIMM size can hit exactly, round up to the least supported balanced configuration at or above the request.']]
}));

function rdSetup() {
  return fresh();
}
