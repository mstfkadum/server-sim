/* ---- Memory: 32 DDR5 slots, 16 per processor. Numbering from the service label inside the access panel: slots 1 to 8
   left of each processor and 9 to 16 right of it, left to right, the front of the server at the bottom; for the order,
   the label points to HPE's memory population rules (hpe.com/docs/server-memory). Each processor has 8 channels of two
   slots: 1-2, 3-4, 5-6, 7-8 on its left, 9-10, 11-12, 13-14, 15-16 on its right. White connectors are the first slot of
   each channel (the one farther from the processor); with one DIMM per channel, only white slots are used. The student
   fits any HPE-supported layout: 1, 2, 4, 6, 8, 12 or 16 DIMMs per processor, each count in its own slots, both
   processors the same. HPE's layouts build on each other, so they are one fill order: 10, 3, then 7, 14, then 5, 16,
   then 1, 12, then 2, 6, 11, 15, then 4, 8, 9, 13. Minimum: 1 DIMM per processor (slot 10), 2 in all. HPE user guide:
   open the DIMM slot latches, align the notch with the key, press the DIMM down until the latches close. In every
   lab with memory the DIMM box holds three HPE DIMM types for this server, 32 of each (model.js: MEMKIT_H): 16 GB 1Rx8
   (P43322-B21), 32 GB 2Rx8 (P43328-B21) and 64 GB 2Rx4 (P43331-B21). The student builds with one of them: the 64 GB is
   x4 and the others x8, and HPE does not mix x4 with x8; the 32 GB with the 16 GB is a mix HPE allows only with all 16
   slots of a processor filled. The RAM Distributor plans with the same three on its own board. ---- */
const FILL = [10, 3, 7, 14, 5, 16, 1, 12, 2, 6, 11, 15, 4, 8, 9, 13];
const OKN = [1, 2, 4, 6, 8, 12, 16];
const layoutOf = n => FILL.slice(0, n).sort((a, b) => a - b);
const chanOf = n => n % 2 ? `${n} and ${n + 1}` : `${n - 1} and ${n}`;
const MEMKIT = 32;
// what each step of the fill order adds, and why
const FILLWHY = n => { const k = FILL.indexOf(n);
  return k === 0 ? 'Slot 10 first: HPE\'s layout for 1 DIMM per processor, the white slot of the first channel right of the processor.'
    : k === 1 ? 'Slot 3 makes 2 per processor (3, 10): one DIMM on each side of the processor.'
    : k < 4 ? 'Slots 7 and 14 make 4 per processor (3, 7, 10, 14): every other channel, two on each side.'
    : k < 6 ? 'Slots 5 and 16 make 6 per processor (3, 5, 7, 10, 14, 16).'
    : k < 8 ? 'Slots 1 and 12 make 8 per processor: one DIMM in every channel, all eight white slots. The best memory bandwidth.'
    : k < 12 ? 'Slots 2, 6, 11 and 15 make 12 per processor: four channels get a second DIMM, in their black slot.'
    : 'Slots 4, 8, 9 and 13 make 16 per processor: every slot filled.'; };
const procSlots = (t, p) => { const a = []; for (let n = 1; n <= 16; n++) if (t.dimms[`${p}-${n}`]) a.push(n); return a; };
// for an unsupported count: the DIMMs to add for the next supported layout, or to take out for the one below
function addRm(s, lo, hi) {
  const add = layoutOf(hi).filter(k => !s.includes(k)), rm = s.filter(k => !layoutOf(lo).includes(k)), n = s.length, pl = a => a.length > 1 ? 's' : '';
  return `Add ${hi - n} to make ${hi}${add.length === hi - n ? ` (slot${pl(add)} ${add.join(', ')})` : ` (slots ${layoutOf(hi).join(', ')})`}, or take out ${n - lo} to make ${lo}${rm.length === n - lo ? ` (slot${pl(rm)} ${rm.join(', ')})` : ` (slots ${layoutOf(lo).join(', ')})`}.`;
}
// one processor's layout: '' when it is one of HPE's, otherwise what is wrong and how to fix it
function procErr(t, p) {
  const s = procSlots(t, p), n = s.length, P = `Processor ${p[1]}`;
  if (!n) return `${P} has no DIMMs yet. Every installed processor needs at least one, in slot 10.`;
  if (!OKN.includes(n)) { const lo = Math.max(...OKN.filter(k => k < n)), hi = Math.min(...OKN.filter(k => k > n)); return `${P} has ${n} DIMMs: HPE does not support ${n} per processor, only 1, 2, 4, 6, 8, 12 or 16 (other layouts may not boot). ${addRm(s, lo, hi)}`; }
  const want = layoutOf(n), extra = s.filter(k => !want.includes(k)), miss = want.filter(k => !s.includes(k));
  if (extra.length) return `${P} has ${n} DIMM${n > 1 ? 's' : ''}, but HPE's layout for ${n} is slot${n > 1 ? 's' : ''} ${want.join(', ')}. Slot ${extra.join(', ')} ${extra.length > 1 ? 'are' : 'is'} not in it: move ${extra.length > 1 ? 'those DIMMs' : 'that DIMM'} to slot ${miss.join(', ')}.`;
  return '';
}
/* ---- DIMM types against HPE's rules (a50007437enw): on one processor, no 3DS with standard RDIMMs, no x4 with x8, no
   mixed DRAM densities, the 96 GB RDIMM alone and only with 8 or 16 per processor; two types only with all 16 slots
   filled, the same type in every white slot and in every black slot, mixed ranks only dual rank (white) with single
   rank (black), or the 256 GB 8R with the 128 GB 4R 3DS RDIMM. The 256 GB RDIMMs are not supported in this chassis. ---- */
const procMap = (t, p) => Array.from({ length: 16 }, (_, i) => t.dimms[`${p}-${i + 1}`] ? dimmKind(t.dimms[`${p}-${i + 1}`]) : null);
const hpeOK = k => DIMMK[k].cap <= 128;
const HPE256 = 'The 256 GB RDIMMs (P43337-B21, P90550-B21) need the High Performance Fan Kit and limit the server to two front drive cages (HPE QuickSpecs). This server has three cages for its 24 SFF bays, so they are not supported here.';
// partial: the mix is still being fitted, so the "all 16 slots" rule waits
function typeErrs(m, partial) {
  const sl = []; m.forEach((k, i) => { if (k) sl.push(i + 1); });
  const ks = [...new Set(m.filter(Boolean))], P = ks.map(k => DIMMK[k]), e = [];
  if (ks.length < 2) return ks[0] === 'r96' && !partial && ![8, 16].includes(sl.length) ? ['The 96 GB RDIMM (P66675-B21) is supported only with 8 or 16 DIMMs per processor.'] : [];
  if (P.some(d => d.td) && P.some(d => !d.td)) e.push('3DS and standard RDIMMs mixed: HPE does not support mixing 3DS and non-3DS memory.');
  if (new Set(P.map(d => d.width)).size > 1) e.push('x4 and x8 DIMMs mixed: HPE does not mix x4 with x8 on a processor.');
  if (new Set(P.map(d => d.dram)).size > 1) e.push(`DRAM densities mixed (${[...new Set(P.map(d => d.dram + ' Gb'))].join(' and ')}): HPE does not support it.`);
  if (ks.includes('r96')) e.push('The 96 GB RDIMM (P66675-B21) cannot be mixed with any other DIMM.');
  if (e.length) return e;
  if (ks.length > 2) return ['More than two DIMM types on a processor: HPE mixes two at most, one type in the white slots and one in the black.'];
  const wk = [...new Set(sl.filter(white).map(n => m[n - 1]))], bk = [...new Set(sl.filter(n => !white(n)).map(n => m[n - 1]))];
  if (wk.length > 1 || bk.length > 1) return ['Mixed DIMMs must be the same in every white slot and the same in every black slot: HPE does not mix DIMM densities across channels.'];
  if (!wk.length || !bk.length) return [];
  const w = DIMMK[wk[0]], b = DIMMK[bk[0]];
  if (!((!w.td && w.ranks === 2 && b.ranks === 1) || (w.key === 'r256' && b.key === 'r128'))) return [w.ranks < b.ranks ? `The ${b.tiny}s have more ranks than the ${w.tiny}s: the higher rank goes in the white slots.` : `${w.tiny} with ${b.tiny} in a channel: HPE allows mixed ranks only as dual rank (white) with single rank (black), or 256 GB 8R with 128 GB 4R 3DS.`];
  if (!partial && sl.length !== 16) return [`Two DIMM types (${w.tiny} white, ${b.tiny} black) are supported only with all 16 slots of the processor filled.`];
  return [];
}
// the slots: one of HPE's counts, in its slots
function patternErrs(m) {
  const sl = []; m.forEach((k, i) => { if (k) sl.push(i + 1); }); const n = sl.length; if (!n) return [];
  if (!OKN.includes(n)) return [`${n} DIMMs: HPE supports 1, 2, 4, 6, 8, 12 or 16 per processor (other counts may not boot).`];
  const want = layoutOf(n); return sl.some(k => !want.includes(k)) ? [`${n} DIMMs, but HPE's slots for ${n} are ${want.join(', ')}.`] : [];
}
const typesIn = t => { const c = {}; Object.keys(t.dimms).forEach(id => { const k = dimmKind(t.dimms[id]); (c[k] = c[k] || []).push(id); }); return c; };
const kindsIn = t => { const c = typesIn(t); return Object.assign(Object.fromEntries(Object.keys(DIMMK).map(k => [k, []])), c); };
const procTypeErr = (t, p) => typeErrs(procMap(t, p), true)[0] || '';
const mixed = t => !!(procTypeErr(t, 'P1') || procTypeErr(t, 'P2'));
// the type a processor (or the server) is built with: the one most of its DIMMs are, else the one chosen
function mainKind(t) {
  const c = typesIn(t), ks = Object.keys(c); if (!ks.length) return t.memPick;
  ks.sort((a, b) => c[b].length - c[a].length || (t.dimms['P1-10'] && dimmKind(t.dimms['P1-10']) === b ? 1 : 0) - (t.dimms['P1-10'] && dimmKind(t.dimms['P1-10']) === a ? 1 : 0));
  return ks[0];
}
const few = ids => ids.length > 4 ? `${ids.slice(0, 4).map(slotLabel).join('; ')} and ${ids.length - 4} more` : ids.map(slotLabel).join('; ');
function mixErr(t) {
  const p = procTypeErr(t, 'P1') ? 'P1' : 'P2', e = procTypeErr(t, p); if (!e) return '';
  const k = procKind(t, p), off = procSlots(t, p).filter(n => dimmKind(t.dimms[`${p}-${n}`]) !== k).map(n => `${p}-${n}`);
  return `Processor ${p[1]}: ${e} ${off.length ? `Take out the DIMM${off.length > 1 ? 's' : ''} that differ from the ${DIMMK[k].tiny}s (${few(off)}), or follow a supported mix.` : ''}`.trim();
}
// the layout in words: one type, or a white and a black type
function layoutTxt(t, p) {
  const m = procMap(t, p), ks = [...new Set(m.filter(Boolean))], n = m.filter(Boolean).length;
  if (ks.length === 1) return `${n} x ${DIMMK[ks[0]].tiny}`;
  return ks.map(k => `${m.filter(x => x === k).length} x ${DIMMK[k].tiny}`).join(' + ');
}
// the whole memory: each processor's types and slots, the two processors alike, the chassis
function memCheck(t) {
  const two = cpuCount(t) >= 2, a = procSlots(t, 'P1'), b = procSlots(t, 'P2'), out = err => ({ ok: !err, err, n: a.length + b.length, a, b, gb: memGB(t) });
  const big = Object.keys(t.dimms).find(id => !hpeOK(dimmKind(t.dimms[id])));
  if (big) return out(`${HPE256} Take out the 256 GB DIMMs.`);
  if (mixed(t)) return out(mixErr(t));
  // a supported mix still being fitted: say how many slots are left, not which smaller count to make
  const mixing = p => { const m = procMap(t, p), ks = [...new Set(m.filter(Boolean))], n = m.filter(Boolean).length; if (ks.length !== 2 || n === 16 || typeErrs(m, true).length || procSlots(t, p).some(k => FILL.indexOf(k) >= n)) return '';
    const w = m.find((k, i) => k && white(i + 1)), b = ks.find(k => k !== w) || ks[1];
    return `Processor ${p[1]}: a mix of ${DIMMK[w].tiny}s (white) and ${DIMMK[b].tiny}s (black). HPE supports it only with all 16 slots filled: ${16 - n} more to fit, in HPE's order.`; };
  const e1 = mixing('P1') || procErr(t, 'P1'), e2 = two ? mixing('P2') || procErr(t, 'P2') : '';
  const m16 = c => typeErrs(procMap(t, c), false)[0] || '';
  const ma = m16('P1'), mb = two ? m16('P2') : '';
  const bal = two && !e1 && !e2 && a.length !== b.length ? `Unbalanced: processor 1 has ${a.length} DIMMs and processor 2 has ${b.length}. HPE splits the DIMMs evenly over the processors: give both the same number, in the same slots.`
    : two && !e1 && !e2 && a.some(n => dimmOf(t, `P1-${n}`).cap !== (t.dimms[`P2-${n}`] ? dimmOf(t, `P2-${n}`).cap : 0)) ? 'Unbalanced: the two processors hold different capacities in the same slots. HPE splits the memory evenly over the processors: populate both the same way.' : '';
  // when one processor is fine and the other is not, say so first
  const good = (k, sl) => `Processor ${k}: ${sl.length} DIMM${sl.length > 1 ? 's' : ''} in slot${sl.length > 1 ? 's' : ''} ${sl.join(', ')}, supported. `;
  const err = e1 ? (two && !e2 && b.length ? good(2, b) : '') + e1 : e2 ? good(1, a) + e2 : ma ? `Processor 1: ${ma}` : mb ? `Processor 2: ${mb}` : bal;
  return out(err);
}
const memOK = t => memCheck(t).ok && memCheck(t).n >= 2;
// the next slot in HPE's fill order for a processor
const fillNext = (t, p) => FILL.find(n => !t.dimms[`${p}-${n}`]);
// the exam: no marks, no next slot, no verdicts in the Memory view (the RAM Distributor grades at the end)
const quiet = t => !!(t.rd && t.rd.exam);
// a short status after each change
function memStatus(t) {
  const m = memCheck(t), two = cpuCount(t) >= 2, k = m.a.length;
  if (quiet(t)) return `${m.n} DIMM${m.n === 1 ? '' : 's'} fitted, ${m.gb} GB.`;
  if (m.ok) return `Supported: ${layoutTxt(t, 'P1')} ${two ? 'per processor' : 'on processor 1'} in slot${k > 1 ? 's' : ''} ${m.a.join(', ')}${two ? ', both processors the same' : ''}: ${m.gb} GB in all.${k < 16 ? (nx => ` To add more, HPE's order continues with slot${nx.length > 1 ? 's' : ''} ${nx.join(', ')}${two ? ' on each processor' : ''}.`)(FILL.slice(k, OKN.find(x => x > k))) : ''}${two ? '' : ' Processor 2 is not installed.'}`;
  return m.err;
}
// DIMMs fitted in HPE's order so far (only the count is not finished yet), as opposed to DIMMs in the wrong slots
const inOrder = t => ['P1', 'P2'].every(p => procSlots(t, p).every(n => FILL.indexOf(n) < procSlots(t, p).length));
const memTone = t => quiet(t) ? 'info' : memCheck(t).ok ? 'ok' : !mixed(t) && inOrder(t) && !Object.keys(t.dimms).some(id => !hpeOK(dimmKind(t.dimms[id]))) ? 'info' : 'warn';
// DIMMs on the mat of the type in hand
const pickLeft = t => (t.memLeft && t.memLeft[t.memPick]) || 0;
const boxed = t => Object.values(t.memBox || {}).reduce((a, b) => a + b, 0);
// a processor's own type (the one most of its DIMMs are), and whether all its DIMMs are that type
function procKind(t, p) {
  const s = procSlots(t, p); if (!s.length) return mainKind(t);
  const c = {}; s.forEach(n => { const k = dimmKind(t.dimms[`${p}-${n}`]); c[k] = (c[k] || 0) + 1; });
  return Object.keys(c).sort((x, y) => c[y] - c[x] || (x === mainKind(t) ? -1 : y === mainKind(t) ? 1 : 0))[0];
}
const procUniform = (t, p) => procSlots(t, p).every(k => dimmKind(t.dimms[`${p}-${k}`]) === procKind(t, p));
const MB = { s: 0.7, ox: 20, oy: 44 };
const mbT = `translate(${MB.ox} ${MB.oy}) scale(${MB.s}) translate(${-BAND.x0} ${-BAND.y0})`;
const mbXY = (x, y) => [MB.ox + (x - BAND.x0) * MB.s, MB.oy + (y - BAND.y0) * MB.s];
const slotLabel = id => { const [p, n] = id.split('-'); return `processor ${p[1]}, slot ${n}`; };
// a fitted DIMM's mark: 'ok' (in HPE's layout), 'part' (in HPE's order, but the count is not a supported one yet), 'bad' (wrong slot)
const slotMark = (t, p, n) => { const sl = procSlots(t, p), k = dimmKind(t.dimms[`${p}-${n}`]); return !hpeOK(k) || (procTypeErr(t, p) && k !== procKind(t, p)) ? 'bad' : FILL.indexOf(n) >= sl.length ? 'bad' : OKN.includes(sl.length) && !typeErrs(procMap(t, p), false).length ? 'ok' : 'part'; };
const MARK = { ok: ['#2F6B4A', '#7CF0A8', '&#10003;'], part: ['#8A5A00', '#FFC85A', '+'], bad: ['#7A1E16', '#FF8A7A', '!'] };
function memBand(t) {
  const W = (BAND.x1 - BAND.x0) * MB.s, H = (BAND.y1 - BAND.y0) * MB.s;
  let g = `<defs><clipPath id="bandclipm"><rect x="${MB.ox}" y="${MB.oy}" width="${f1(W)}" height="${f1(H)}" rx="6"/></clipPath></defs><g clip-path="url(#bandclipm)"><g transform="${mbT}">${bandImg('bandclipm0')}${insideArt(t)}`;
  const want = t.sel.slot, can = !t.baffle && t.cover === 'off';
  if (can) ['P2', 'P1'].forEach(p => SLOTX[p].forEach((x, n) => {
    const id = `${p}-${n + 1}`, has = t.dimms[id], open = t.memOpen[id];
    if (want === id) g += `<rect x="${x - 12}" y="${SLOTY[0] - 24}" width="24" height="${SLOTY[1] - SLOTY[0] + 48}" rx="5" fill="none" stroke="#45D07F" stroke-width="3.5" stroke-dasharray="8 6" pointer-events="none"/>`;
    g += `<g${hot('slot', id, `DIMM ${slotLabel(id)} (${white(n + 1) ? 'white' : 'black'})${has ? ': DIMM installed, click to take it out' : open ? ': latches open' : ': empty'}`)}><rect x="${x - 9.5}" y="${SLOTY[0] - 18}" width="19" height="${SLOTY[1] - SLOTY[0] + 36}" rx="3" class="zone"/></g>`;
  }));
  if (can && !quiet(t)) ['P1', 'P2'].forEach(p => {
    if (p === 'P2' && cpuCount(t) < 2) return;
    const sl = procSlots(t, p);
    sl.forEach(n => { const x = SLOTX[p][n - 1], k = slotMark(t, p, n), [f, st, ch] = MARK[k]; g += `<g pointer-events="none"><circle cx="${x}" cy="${SLOTY[0] - 40}" r="15" fill="${f}" stroke="${st}" stroke-width="3"/><text x="${x}" y="${SLOTY[0] - 33}" text-anchor="middle" style="font:800 19px var(--font);fill:#FFF">${ch}</text></g>`; });
    // no separate "next" marker: with guidance on, the highlight shows the slot; with it off, nothing points the way
  });
  g += `</g></g>`;
  // slot numbers under each group, as on the service label
  ['P2', 'P1'].forEach(p => SLOTX[p].forEach((x, n) => { const [vx, vy] = mbXY(x, BAND.y1); g += `<text x="${f1(vx)}" y="${f1(vy + 14)}" text-anchor="middle" style="font:${white(n + 1) ? 700 : 500} 10.5px var(--font);fill:${white(n + 1) ? '#F4F0DE' : '#8E99A3'}">${n + 1}</text>`; }));
  const [a, b] = mbXY(SOCK2.cx, 935), [c, d] = mbXY(955, 935);
  g += `<text x="${f1(a)}" y="${f1(b)}" text-anchor="middle" style="font:700 13px var(--font);fill:#FFD27A;paint-order:stroke;stroke:#0E1A22;stroke-width:3px" pointer-events="none">P2</text><text x="${f1(c)}" y="${f1(d)}" text-anchor="middle" style="font:700 13px var(--font);fill:#FFD27A;paint-order:stroke;stroke:#0E1A22;stroke-width:3px" pointer-events="none">P1</text>`;
  if (!can) g += `<rect x="${MB.ox}" y="${MB.oy}" width="${f1(W)}" height="26" fill="#0E1A22" opacity=".88"/><text x="${MB.ox + 10}" y="${MB.oy + 18}" class="st" style="fill:#FFD27A">${t.cover !== 'off' ? 'Access panel on: remove it first (Top view)' : 'Air baffle in place: lift it out first (Top view)'}</text>`;
  return g;
}
// one slot, close up from the side: the connector with a latch at each end, and the DIMM (its key notch off centre)
function slotSide(t, X, Y) {
  const id = t.sel.slot, n = id ? +id.split('-')[1] : 3, wh = white(n), has = id && t.dimms[id], open = id && t.memOpen[id];
  const a = id ? fxAge('dimm' + id) : 9, ins = has && a < 0.9, L = X + 24, R = X + 444, sy = Y + 196;
  let g = `<rect x="${X}" y="${Y}" width="468" height="236" rx="10" fill="#16293A" stroke="#2E5571"/>`;
  // the header goes on top of a DIMM held over the slot
  let hd = `<text x="${X + 14}" y="${Y + 22}" class="st">${id ? `${slotLabel(id)[0].toUpperCase() + slotLabel(id).slice(1)}, close up` : 'A DIMM slot, close up'}</text>`;
  hd += `<text x="${X + 14}" y="${Y + 40}" class="ss">${!id ? 'Click a slot on the board above.' : has ? 'DIMM pressed in: both latches closed over its ends.' : open ? 'Latches open. Line the notch up with the key, press down evenly.' : wh ? 'White slot: the first in its channel. Push both latches outward.' : 'Black slot: the second in its channel.'}</text>`;
  // the connector body on the board
  g += `<rect x="${X + 8}" y="${sy + 16}" width="452" height="10" fill="#1F3A28"/><rect x="${L}" y="${sy}" width="${R - L}" height="18" rx="2" fill="${wh ? '#E7E2CC' : '#1E2124'}" stroke="${wh ? '#9A947E' : '#0B0D0F'}"/><rect x="${L + 160}" y="${sy - 4}" width="6" height="6" fill="${wh ? '#B7B19B' : '#3A3F45'}"/>`;
  // latches: closed (upright, hooked over the DIMM ends) or open (swung outward)
  const lat = (x, dir) => {
    const ang = open ? dir * 28 : 0, la = has && a < 0.9 ? `<animateTransform attributeName="transform" type="rotate" values="${dir * 28} ${x} ${sy + 14};${dir * 28} ${x} ${sy + 14};0 ${x} ${sy + 14}" keyTimes="0;.7;1" dur="0.85s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : '';
    return `<g transform="rotate(${la ? 0 : ang} ${x} ${sy + 14})">${la}<path d="M${x + dir * 9} ${sy + 14}V${sy - 62}H${x - dir * 14}V${sy - 50}H${x - dir * 9}V${sy + 14}Z" fill="${wh ? '#ECE7D2' : '#24282C'}" stroke="${wh ? '#8F8A74' : '#0B0D0F'}" stroke-width="1.5"/></g>`;
  };
  g += lat(L - 2, -1) + lat(R + 2, 1);
  // the DIMM: board, DRAM packages, label, gold fingers and the key notch
  const kd = has ? dimmOf(t, id) : DIMMK[t.memPick];
  if (has || (id && open && pickLeft(t))) {
    const dy = has ? 0 : -78, an = ins ? `<animateTransform attributeName="transform" type="translate" values="0 -78;0 -8;0 0" keyTimes="0;.65;1" dur="0.8s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : '';
    g += `<g transform="translate(0 ${ins ? 0 : dy})"${has ? '' : ' opacity=".92"'}>${an}<rect x="${L + 6}" y="${sy - 104}" width="${R - L - 12}" height="110" rx="3" fill="#2D6A44" stroke="#163A24"/>`;
    for (let k = 0; k < 10; k++) { const x = L + 22 + k * 40 + (k > 4 ? 14 : 0); g += `<rect x="${x}" y="${sy - 92}" width="30" height="34" rx="2" fill="#16191B"/>`; }
    g += `<rect x="${L + 214}" y="${sy - 52}" width="18" height="18" fill="#16191B"/><rect x="${L + 22}" y="${sy - 50}" width="${kd.td ? 184 : 150}" height="20" fill="${kd.td ? '#9CC3E8' : '#EDEBE3'}"/><text x="${L + (kd.td ? 114 : 97)}" y="${sy - 36}" text-anchor="middle" style="font:700 9px var(--mono);fill:#2A2F35">${kd.label}</text>`;
    for (let x = L + 12; x < R - 14; x += 6) if (Math.abs(x - (L + 163)) > 6) g += `<rect x="${x}" y="${sy - 8}" width="3.6" height="13" fill="#D2B05A"/>`;
    g += `<path d="M${L + 158} ${sy + 6}v-14h10v14z" fill="#16293A"/></g>`;
    if (!has && Sim.guide) g += `<path d="M${L + 163} ${sy - 66}v54m-7 -9l7 10l7 -10" fill="none" stroke="${CUE}" stroke-width="2.4"/><text x="${L + 176}" y="${sy - 34}" class="ss" style="fill:#FFD27A">notch over the key, press down evenly</text>`;
  }
  const lift = id && open && !has && pickLeft(t);
  return g + (lift ? `<rect x="${X + 1.5}" y="${Y + 1.5}" width="465" height="48" rx="9" fill="#16293A" opacity=".88"/>` : '') + hd;
}
// the layout panel: both processors' 16 slots, the status in HPE's terms, and the next slot in HPE's order
const wrapTxt = (s, n) => { const out = []; let line = ''; s.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; };
function popTable(t, X, Y) {
  const m = memCheck(t);
  const q = quiet(t), bad = !q && mixed(t), ty = Object.entries(typesIn(t)).map(([k, v]) => `${v.length} x ${DIMMK[k].cap} GB${DIMMK[k].td ? ' 3DS' : ''}`).join(' + ');
  let g = `<rect x="${X}" y="${Y}" width="398" height="236" rx="10" fill="#16293A" stroke="#2E5571"/><text x="${X + 14}" y="${Y + 22}" class="st"${bad ? ' style="fill:#FF9F8F"' : ''}>${!m.n ? 'Your layout: no DIMMs yet' : bad ? `Mixed types: ${ty}` : `Your layout: ${ty}, ${m.gb} GB`}</text><text x="${X + 14}" y="${Y + 39}" class="ss">${q ? 'Exam: no checks here. Submit in the RAM Distributor.' : 'Minimum: 1 per processor, in slot 10 (2 in all)'}</text>`;
  ['P1', 'P2'].forEach((p, r) => {
    const y = Y + 62 + r * 46, sl = procSlots(t, p), off = p === 'P2' && cpuCount(t) < 2;
    g += `<text x="${X + 14}" y="${y - 5}" class="st" style="font-size:11.5px">Processor ${p[1]}${off ? ' (not installed yet)' : `: ${sl.length}`}</text>`;
    for (let n = 1; n <= 16; n++) {
      const x = X + 14 + (n - 1) * 22.5 + (n > 8 ? 10 : 0), has = t.dimms[`${p}-${n}`];
      g += `<rect x="${f1(x)}" y="${y}" width="20" height="24" rx="3" fill="${has ? (q ? '#2D5B78' : MARK[slotMark(t, p, n)][0]) : white(n) ? '#ECE7D2' : '#1D2023'}" stroke="#55606A" stroke-width="1"/><text x="${f1(x + 10)}" y="${y + 16}" text-anchor="middle" style="font:700 10px var(--font);fill:${has ? '#FFF' : white(n) ? '#14202B' : '#C4D3DE'}">${n}</text>`;
    }
  });
  if (!q) [['ok', 'in an HPE layout'], ['part', 'in order, count not supported'], ['bad', 'wrong slot or type']].forEach(([k, l], i) => { const x = X + 14 + [0, 102, 268][i]; g += `<rect x="${x}" y="${Y + 141}" width="12" height="12" rx="2" fill="${MARK[k][0]}" stroke="${MARK[k][1]}"/><text x="${x + 17}" y="${Y + 151}" class="ss" style="font-size:10.5px">${l}</text>`; });
  const msg = m.n ? memStatus(t) : q ? 'No DIMMs fitted yet.' : `Start with slot 10 on each processor. ${FILLWHY(10)} Supported per processor: 1, 2, 4, 6, 8, 12 or 16 DIMMs, both processors the same.`, tone = m.n ? memTone(t) : 'info';
  wrapTxt(msg, 66).slice(0, 5).forEach((l, i) => { g += `<text x="${X + 14}" y="${Y + 166 + i * 14}" class="ss" style="font-size:11px;fill:${tone === 'warn' ? '#FF9F8F' : tone === 'ok' ? '#9FE8B8' : '#C5CCD3'}">${esc(l)}</text>`; });
  return g;
}
// HPE's population table: the Memory view and the RAM Distributor show it beside the work
const POP_HTML_H = `<h3>Population (HPE, 4th Gen Xeon, 16 slots per processor)</h3><table class="dec"><tr><td>1</td><td>10</td></tr><tr><td>2</td><td>3, 10</td></tr><tr><td>4</td><td>3, 7, 10, 14</td></tr><tr><td>6</td><td>3, 5, 7, 10, 14, 16</td></tr><tr><td>8</td><td>1, 3, 5, 7, 10, 12, 14, 16</td></tr><tr><td>12</td><td>1, 2, 3, 5, 6, 7, 10, 11, 12, 14, 15, 16</td></tr><tr><td>16</td><td>1 to 16</td></tr></table><p class="cap" style="margin-top:6px">DIMMs per processor, then the slots; both processors the same. Other counts are not supported. Source: HPE server memory population rules for Gen11 (hpe.com/docs/server-memory).</p>`;
Sim.registerView({
  id: 'mem', title: 'Memory',
  keep: [
    ['Processor first', 'Install DIMMs only for an installed processor: each processor has its own 16 slots.'],
    ['Service label', 'Inside the access panel: slots 1 to 8 left of each processor, 9 to 16 right of it. For the order it points to HPE\'s memory population rules.'],
    ['Population order', 'HPE Gen11, 16 slots per processor: 1 DIMM per processor in slot 10; 2 in 3, 10; 4 in 3, 7, 10, 14; 6 in 3, 5, 7, 10, 14, 16; 8 in 1, 3, 5, 7, 10, 12, 14, 16; 16 fills every slot. Other counts are not supported: the server may not boot.'],
    ['Channels and white slots', 'Each processor has 8 channels of two slots (1-2, 3-4 ... 15-16). With one DIMM per channel, use the white slots only: the first of each channel, the one farther from the processor.'],
    ['Minimum: 2 DIMMs', 'One per processor, in slot 10. Each installed processor needs its own memory, and HPE splits the DIMMs evenly over the processors.'],
    ['Balance', 'Give both processors the same number of DIMMs, in the same slots. Fewer than 8 per processor leaves channels empty: supported, but 8 per processor (one in every channel) gives the best memory bandwidth.'],
    ['One DIMM type', 'Best practice: one part number throughout, the same on both processors. HPE does not mix x4 DIMMs (the 64 GB 2Rx4) with x8 DIMMs (the 16 GB 1Rx8 and 32 GB 2Rx8), even though they fit the same slot.'],
    ['Mixing two types', 'Only with all 16 slots of a processor filled: one type in every white slot, one in every black, the higher rank in white. Allowed: dual rank (white) with single rank (black) of the same width and DRAM density, for example 32 GB 2Rx8 with 16 GB 1Rx8. Never x4 with x8, never 3DS with standard.'],
    ['Speed', 'DDR5-4800 RDIMMs run at 4800 MT/s with one DIMM per channel, 4400 MT/s with two (12 or 16 per processor).'],
    ['Installing a DIMM', 'Open both latches of the slot, line the notch up with the key, press the DIMM down evenly until both latches close.'],
    ['Under a heatsink wing', 'With the max-performance heatsinks, slide a DIMM for a slot under the heatsink wing first, then press it in.'],
    ['After the change', 'Set the memory mode in the system utilities (RBSU) if needed, then check the memory in iLO.']],
  render(t) { const Y = 466; return frame('Memory: 16 slots per processor, numbered as on the service label', memBand(t) + slotSide(t, 14, Y) + popTable(t, 488, Y), 716); },
  actions(t) {
    const a = t.flags.memUnpacked ? [] : [button('Take the DIMMs out of their packaging', 'memUnpack')], id = t.sel.slot;
    if (id && t.memOpen[id] && !t.dimms[id]) a.push(button(`Close the latches of ${slotLabel(id)} (leave it empty)`, 'slotClose', id));
    return a;
  },
  tray(t) {
    const un = t.flags.memUnpacked, c = kindsIn(t), q = quiet(t), mx = !q && mixed(t), cur = DIMMK[t.memPick], lab = !!t.rd, box = t.memBox || {}, mat = t.memLeft || {};
    // one card per DIMM type in the kit: what it is, how many are packed, on the mat and fitted, whether it is fitted next
    const ks = Object.keys(DIMMK).filter(k => (box[k] || 0) + (mat[k] || 0) + c[k].length > 0);
    const card = k => {
      const d = DIMMK[k], now = un && t.memPick === k, left = mat[k] || 0, used = c[k].length, wrong = mx && !!procTypeErr(t, 'P1') && k !== procKind(t, 'P1');
      const st = (now ? `<span class="pill on" style="margin-top:5px">&#10003; Fitting next</span> ` : '') + (wrong ? `<span class="pill" style="color:var(--red);border-color:var(--red);margin-top:5px">Mixed: take these out</span>` : '');
      const btn = !un ? (k === ks[0] ? button('Take them out', 'memUnpack') : '') : !now && left ? button('Fit this type', 'memPick', k) : '';
      return `<div class="item" style="padding:9px 10px;margin-top:8px;border:${wrong ? '2px solid var(--red)' : now ? '2px solid var(--touch)' : '1px solid var(--line)'};border-radius:8px"><span>${d.name}<small style="font-family:var(--mono)">${d.pid}</small><small>${d.label}</small><small>${[box[k] ? `${box[k]} in their antistatic packaging` : '', un || left ? `${left} on the mat` : '', used ? `${used} in the server` : ''].filter(Boolean).join(', ')}</small>${st}</span><span style="flex:none;white-space:nowrap">${btn}</span></div>`;
    };
    const head = !ks.length ? 'No DIMMs left in the kit.' : !un ? `Three HPE DIMM types for this server, ${MEMKIT} of each, in their antistatic packaging: 16 GB, 32 GB and 64 GB. Use one type in the whole server.`
      : `Use one type in the whole server: the 64 GB 2Rx4 is x4, the others x8, and HPE does not mix x4 with x8. Next DIMM you fit: <b>${cur.short}</b>.`;
    return `<h2>DIMM kit</h2><p class="cap" style="font-size:12.5px;margin:0">${head}</p>${mx ? `<p class="cap" style="font-size:12.5px;margin:6px 0 0;color:var(--red)"><b>Unsupported mix in the server.</b> The Memory view marks the DIMMs in red.</p>` : ''}${ks.map(card).join('')}
      ${POP_HTML_H}${lab ? '' : '<h3>Minimum for this build</h3><p class="cap" style="font-size:13px">2 DIMMs: 1 per processor, in slot 10. Each installed processor needs its own memory, and HPE splits DIMMs evenly over the processors. Add more in HPE\'s order if you like: iLO shows what you fitted.</p>'}`;
  }
});
const matTxt = t => Object.entries(t.memLeft || {}).filter(([, n]) => n).map(([k, n]) => `${n} x ${DIMMK[k].label}`).join(', ') || 'nothing';
const locked = () => T.rd && T.rd.submitted ? say('info', 'The exam is submitted: the memory layout is locked.') || true : false;
Sim.on('memUnpack', () => {
  if (locked()) return;
  if (!T.esd) return bad('Put on the ESD wrist strap first (Top view).');
  if (!boxed(T)) return say('info', 'The DIMMs are already out of their packaging.');
  T.flags.memUnpacked = true; Object.entries(T.memBox).forEach(([k, n]) => { T.memLeft[k] = (T.memLeft[k] || 0) + n; }); T.memBox = {};
  if (!T.memLeft[T.memPick]) T.memPick = Object.keys(DIMMK).find(k => T.memLeft[k]) || T.memPick;
  say('ok', `DIMMs out of their antistatic packaging, held by their edges; do not touch the gold contacts. On the mat: ${matTxt(T)}. Choose one type (the DIMM kit, right) and use only that one in the server.`);
});
Sim.on('memPick', k => {
  if (locked()) return;
  if (!T.flags.memUnpacked) return bad('Take the DIMMs out of their packaging first.');
  if (!DIMMK[k] || T.memPick === k) return;
  T.memPick = k; const d = DIMMK[k];
  // would this type, next to what processor 1 holds, break HPE's rules? (not in the exam)
  const m = procMap(T, 'P1'), free = m.findIndex(x => !x); if (free >= 0) m[free] = k;
  const e = !quiet(T) && m.some(x => x && x !== k) ? typeErrs(m, true)[0] : '';
  if (e) return say('warn', `Fitting next: ${d.label} (${d.pid}). Careful, next to the DIMMs already fitted: ${e}`);
  if (!quiet(T) && !hpeOK(k)) return say('warn', `Fitting next: ${d.label} (${d.pid}). ${HPE256}`);
  say('info', `Fitting next: ${d.label} (${d.pid}).${T.rd ? '' : ' Use this type for every DIMM in the server.'}`);
});
Sim.on('slot', id => {
  if (locked()) return;
  if (!inside()) return;
  const [p, ns] = id.split('-'), n = +ns, q = quiet(T);
  T.sel.slot = id;
  if (T.dimms[id]) {
    // take it out: push both latches outward, the DIMM lifts out of the slot
    const k = dimmKind(T.dimms[id]);
    delete T.dimms[id]; T.memLeft[k] = (T.memLeft[k] || 0) + 1; T.flags.memUnpacked = true; fxMark('dimm' + id); Sim.sound('clipOpen');
    return say(memTone(T) === 'warn' ? 'warn' : 'info', `Latches pushed outward: the ${DIMMK[k].tiny} in ${slotLabel(id)} lifted out, back on the mat. ${dimmCount(T) ? memStatus(T) : ''}`.trim());
  }
  if (p === 'P2' && cpuCount(T) < 2) return bad('Processor 2 is not installed. Install DIMMs only for an installed processor.');
  if (!T.memOpen[id]) { T.memOpen[id] = true; Sim.sound('clipOpen'); return say('ok', `Both latches of ${slotLabel(id)} pushed outward: the slot is open.${pickLeft(T) ? ' Now line up the notch and press the DIMM in.' : ''}${q ? '' : FILL.indexOf(n) >= 0 && fillNext(T, p) === n ? ' ' + FILLWHY(n) : fillNext(T, p) !== n && Sim.guide ? ` HPE's order would put the next DIMM of processor ${p[1]} in slot ${fillNext(T, p)}.` : ''}`); }
  if (!T.flags.memUnpacked) return bad('Take the DIMMs out of their packaging first (the DIMM kit, right).');
  if (!pickLeft(T)) return bad(`No ${DIMMK[T.memPick].tiny}s left on the mat.`);
  T.memLeft[T.memPick]--;
  T.memOpen[id] = false; T.dimms[id] = T.memPick; fxMark('dimm' + id); Sim.sound('dimm', 0.5);
  say(memTone(T), `${DIMMK[T.memPick].tiny} pressed into ${slotLabel(id)} until both latches closed: click. ${memStatus(T)}`);
});
Sim.on('slotClose', id => { if (!T.memOpen[id]) return; T.memOpen[id] = false; Sim.sound('clip', 0.2); say('info', `Latches of ${slotLabel(id)} closed again, the slot left empty.`); });
// at the end of the memory work (refitting the air baffle): the layout must be one HPE supports
const memBlock = t => { const m = memCheck(t); return m.ok ? '' : `Not yet: HPE does not support this memory configuration. ${m.err} On a real server an unsupported layout can stop the boot at POST with a memory configuration error, or run with lower memory performance. Fix the memory first (Memory view).`; };
