/* ============ 4. RAM Distributor: the memory planner, shared by every model ============
   A model pack describes its memory with Sim.memRules({...}): slots, channels, the vendor's parts (16, 32 and 64 GB), the
   vendor's rules (checkCpu, checkServer), the speed, the layouts to try (candidates) and how to draw the slots on the
   board. The page is one board: a target capacity and the processors at the top, then the population map, where the
   student places DIMMs by clicking the slots. Distribute fills the board with the best layout for the target; Verify
   Distribution grades what is on the board. Random Exam draws a work order and keeps Distribute off until it is verified.
   Ranking, as a work order is judged: (1) at least the capacity asked for, and no more than the least capacity a
   supported layout can give (the "needed" capacity); (2) the highest memory bandwidth, layouts within 5 % of the best
   counting as equal; (3) the fewest DIMMs.
   Grading: an unsupported layout, or less capacity than asked, fails. A supported layout passes, with points off: 20 for
   a slower layout than the best at the needed capacity, 10 for more capacity than needed, 10 for more DIMMs than needed.
   Bandwidth is the theoretical peak per processor: interleaved channels x transfer rate x 8 bytes. With unequal
   channels the memory splits into interleave regions (all channels, then the ones with more capacity); the effective
   channel count is their capacity-weighted average. HPE's memory paper describes 12 DIMMs per processor as two regions,
   8 channels then 4, down to 50 % of peak at worst: this model gives the same. ==== */
const MemPlan = (() => {
  const TOL = 0.95, PTS = { slow: 20, over: 10, more: 10 };
  const R = () => REG().mem || null;
  const sum = a => a.reduce((s, x) => s + x, 0);
  const bwTxt = x => `${(Math.round(x * 10) / 10).toFixed(1)} GB/s`;
  const pl = (n, w, ws) => `${n} ${n === 1 ? w : (ws || w + 's')}`;
  const blank = r => Array(r.slots).fill(null);
  const cpuW = r => r.cpuWord || 'processor';

  /* ---- layouts ---- */
  // maps: one array per installed processor, slot position -> part key (or null)
  function metrics(r, maps) {
    const per = maps.map(m => {
      const ch = Array(r.channels).fill(0); let n = 0;
      m.forEach((k, pos) => { if (k) { ch[r.chanOf(pos)] += r.part(k).cap; n++; } });
      const used = ch.filter(c => c > 0).sort((a, b) => a - b), tot = sum(used);
      let prev = 0, w = 0; used.forEach((c, i) => { const ways = used.length - i; w += (c - prev) * ways * ways; prev = c; });
      return { gb: tot, dimms: n, used: used.length, ways: tot ? w / tot : 0, even: used.length > 0 && used[0] === used[used.length - 1] };
    });
    const dimms = sum(per.map(p => p.dimms)), speed = dimms ? r.speed(maps) : 0, ways = Math.min(...per.map(p => p.ways));
    return { gb: sum(per.map(p => p.gb)), dimms, speed, ways, bw: ways * speed * 8 / 1000, used: Math.min(...per.map(p => p.used)), even: per.every(p => p.even),
      full: per.every(p => p.used === r.channels), free: r.slots * maps.length - dimms };
  }
  // the vendor's rules: everything wrong with a server layout (maps for every processor socket, installed or not)
  function errors(r, maps, cpus) {
    const e = r.checkServer(maps, cpus).slice(), each = [];
    for (let c = 0; c < cpus; c++) each.push(r.checkCpu(maps[c], c));
    if (cpus > 1 && each[0].length && each[0].join() === each[1].join()) each[0].forEach(x => e.push(`Both ${cpuW(r)}s: ${x}`));
    else each.forEach((l, c) => l.forEach(x => e.push(`${r.cpuName(c)}: ${x}`)));
    return [...new Set(e)];
  }
  const full = (r, maps) => maps.concat(Array.from({ length: r.cpus - maps.length }, () => blank(r)));
  // every layout the vendor supports for this many processors (both processors the same), with its metrics
  const cache = {};
  function all(r, cpus) {
    const key = r.id + ':' + cpus; if (cache[key]) return cache[key];
    const seen = new Set(), out = [];
    r.candidates().forEach(m => {
      const sig = m.map(k => k || '-').join(','); if (seen.has(sig)) return; seen.add(sig);
      const maps = Array.from({ length: cpus }, () => m.slice());
      if (errors(r, full(r, maps), cpus).length) return;
      out.push({ map: m, maps, m: metrics(r, maps), sig });
    });
    return (cache[key] = out);
  }
  function plan(r, cpus, gb) {
    const every = all(r, cpus), opts = every.filter(o => o.m.gb >= gb), max = Math.max(0, ...every.map(o => o.m.gb));
    if (!opts.length) return { gb, cpus, none: true, max, best: [], rest: [], bigger: [], count: 0 };
    const need = Math.min(...opts.map(o => o.m.gb)), at = opts.filter(o => o.m.gb === need);
    const top = Math.max(...at.map(o => o.m.bw)), fast = at.filter(o => o.m.bw >= top * TOL), fewest = Math.min(...fast.map(o => o.m.dimms));
    const isBest = o => o.m.gb === need && o.m.bw >= top * TOL && o.m.dimms === fewest;
    // ties: the bigger DIMMs in the first slots of the fill order (the vendor's usual picture of a mixed layout)
    const front = o => (r.fill || []).map(pos => o.map[pos] ? r.part(o.map[pos]).cap : 0);
    const byFront = (a, b) => { const x = front(a), y = front(b); for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return y[i] - x[i]; return 0; };
    const byBw = (a, b) => b.m.bw - a.m.bw || a.m.dimms - b.m.dimms || byFront(a, b);
    const best = at.filter(isBest).sort(byBw), rest = at.filter(o => !isBest(o)).sort(byBw);
    const bigger = opts.filter(o => o.m.gb > need).sort((a, b) => a.m.gb - b.m.gb || byBw(a, b));
    return { gb, cpus, need, top, fewest, exact: need === gb, best, rest, bigger, count: opts.length, max };
  }
  // the parts of a layout, biggest first: '16 x 32 GB 2R RDIMM + 16 x 16 GB 2R RDIMM'
  const counts = (r, maps) => { const c = {}; maps.forEach(m => m.forEach(k => { if (k) c[k] = (c[k] || 0) + 1; })); return r.parts.filter(p => c[p.key]).sort((a, b) => b.cap - a.cap).map(p => [p, c[p.key]]); };
  const title = (r, maps) => counts(r, maps).map(([p, n]) => `${n} × ${p.short}`).join(' + ') || 'No DIMMs';
  const orderOf = (r, maps) => Object.fromEntries(counts(r, maps).map(([p, n]) => [p.key, n]));
  // where each part goes on one processor
  function where(r, m, cpus = 2) {
    const by = {}; m.forEach((k, pos) => { if (k) (by[k] = by[k] || []).push(pos); });
    return Object.entries(by).map(([k, ps]) => `${r.part(k).cap} GB in ${r.slotList(ps, cpus)}`).join('; ');
  }
  // grade a layout (maps for every socket) against a work order
  function gradeMaps(r, maps, task) {
    const cpus = task.cpus, inst = maps.slice(0, cpus), hard = errors(r, full(r, maps.slice()), cpus), m = metrics(r, inst), p = plan(r, cpus, task.gb);
    if (!m.dimms) hard.unshift('No DIMMs on the board.');
    else if (m.gb < task.gb) hard.push(`${m.gb} GB on the board: less than the ${task.gb} GB the order asks for.`);
    const soft = [];
    if (!hard.length && !p.none) {
      if (m.gb > p.need) soft.push({ pts: PTS.over, msg: `${m.gb} GB is ${m.gb - p.need} GB more than needed: ${p.need} GB ${p.exact ? 'meets the order exactly' : 'is the least a supported layout gives'}.` });
      if (m.bw < p.top * TOL) soft.push({ pts: PTS.slow, msg: `About ${bwTxt(m.bw)} per ${cpuW(r)}, while a layout of ${p.need} GB reaches ${bwTxt(p.top)}.` });
      else if (m.gb === p.need && m.dimms > p.fewest) soft.push({ pts: PTS.more, msg: `${m.dimms} DIMMs, while the same capacity and speed need only ${p.fewest}.` });
    }
    return { hard, soft, m, p, maps: inst, fail: hard.length > 0, best: !hard.length && !soft.length, penalty: sum(soft.map(s => s.pts)) };
  }
  const snapOf = maps => maps.map(m => m.map(k => k || '-').join(','));
  const unsnap = s => s.map(x => x.split(',').map(k => k === '-' ? null : k));

  /* ---- state: the board (one array per processor socket of the server), the DIMM size placed next, the processors and
     the memory chosen (practice); the work order of the exam lab (t.rd) or of a random exam drawn on the board (t.mp.wo) ---- */
  function st(t) {
    const r = R();
    if (!t.mp) t.mp = { gb: null, cpus: r.cpus, part: (r.parts[1] || r.parts[0]).key, board: full(r, []), wo: null, snap: null };
    return t.mp;
  }
  const woOf = t => t.rd || st(t).wo;
  const hold = t => woOf(t) || st(t);
  const exam = t => { const w = woOf(t); return !!(w && w.exam); };
  // an exam still open: no Distribute, no marks, no hints
  const closed = t => exam(t) && !woOf(t).submitted;
  const taskOf = t => { const w = woOf(t), s = st(t); return w ? { gb: w.gb, cpus: w.cpus } : { gb: s.gb, cpus: s.cpus }; };
  /* ---- practice: one DIMM size, a count per processor in the vendor's slots. The memory selector offers only the totals
     that size can build in a supported layout ---- */
  const single = (r, part, n) => { const m = blank(r); r.fill.slice(0, n).forEach(pos => { m[pos] = part; }); return m; };
  function choices(r, cpus, part) {
    const out = [];
    for (let n = 1; n <= r.slots; n++) {
      const maps = Array.from({ length: cpus }, () => single(r, part, n));
      if (!errors(r, full(r, maps), cpus).length) { const m = metrics(r, maps); out.push({ n, gb: m.gb, m }); }
    }
    return out;
  }
  // the practice layout as maps for every socket, or null while no memory size is chosen
  function goalOfS(r, s) {
    if (!s.gb) return null; const o = choices(r, s.cpus, s.part).find(x => x.gb === s.gb);
    return o ? full(r, Array.from({ length: s.cpus }, () => single(r, s.part, o.n))) : null;
  }
  const goalOf = t => woOf(t) ? null : goalOfS(R(), st(t));
  // what Distribute places and the cues follow: the practice layout, or the best layout for a work order
  function target(t) {
    if (!woOf(t)) return goalOf(t);
    const r = R(), k = taskOf(t), p = plan(r, k.cpus, k.gb);
    return p.best[0] ? full(r, p.best[0].maps) : null;
  }
  // practice check: the board against the vendor's layout for the chosen DIMM, count and processors
  function practiceGrade(r, s, maps) {
    const g = goalOfS(r, s), m = metrics(r, maps.slice(0, s.cpus)), items = [];
    const hard = errors(r, full(r, maps.slice()), s.cpus), names = l => l.length > 8 ? l.slice(0, 8).join(', ') + ' ...' : l.join(', ');
    if (!m.dimms) items.push(['bad', 'No DIMMs on the board.']);
    hard.forEach(x => items.push(['bad', x]));
    if (g) {
      const miss = [], extra = [], other = [];
      for (let c = 0; c < r.cpus; c++) r.fill.forEach(pos => { const want = g[c][pos], have = maps[c][pos]; if (want && !have) miss.push(r.slotName(c, pos)); else if (!want && have) extra.push(r.slotName(c, pos)); else if (want && have !== want) other.push(r.slotName(c, pos)); });
      if (other.length) items.push(['bad', `${names(other)}: not the ${r.part(s.part).short} chosen for this setup.`]);
      if (extra.length) items.push(['bad', `${names(extra)}: not in the vendor's layout for ${s.gb} GB. Take ${extra.length > 1 ? 'them' : 'it'} out.`]);
      if (miss.length) items.push(['mid', `Still empty: ${names(miss)}.`]);
      if (m.gb !== s.gb) items.push(['mid', `${m.gb} GB on the board; the setup is ${s.gb} GB.`]);
    }
    const ok = !!g && !items.length;
    return { practice: true, ok, fail: !ok, best: ok, items, m, p: s.gb ? plan(r, s.cpus, s.gb) : null, goal: g || full(r, []) };
  }
  const checked = t => { const h = hold(t), r = R(); if (!h.snap) return null; const maps = unsnap(h.snap); return woOf(t) ? gradeMaps(r, maps, taskOf(t)) : practiceGrade(r, st(t), maps); };
  // the result for the done banner outside a learning platform
  function examText(t) {
    const g = t.grade; if (!g) return '';
    const per = 10, pass = 70, score = g.fail ? 0 : Math.max(0, 100 - per * t.errors - g.penalty);
    return `Exam finished: score ${score} of 100 (pass mark ${pass}), ${score >= pass ? 'passed' : 'not passed'}. ${g.fail ? 'The layout is not supported: ' + g.why : g.penalty ? `${g.penalty} points off for the memory plan` + (t.errors ? `, ${t.errors * per} for mistakes` : '') + '.' : t.errors ? `${t.errors * per} points off for mistakes.` : 'The best layout, no mistakes.'} The RAM Distributor shows why.`;
  }

  /* ---- the board ---- */
  // the vendor's order over the server: the first slot of the order on each processor, then the second, and so on
  // (A1, E1, B1, F1 ... on the Cisco; slot 10 of processor 1, slot 10 of processor 2, slot 3 ... on the HPE)
  const order = (r, cpus) => r.fill.flatMap(pos => Array.from({ length: cpus }, (_, c) => [c, pos]));
  // a placed DIMM's mark: 'ok' (in the vendor's layout, both processors alike), 'part' (in order, but the other processor
  // or the count is not finished), 'bad' (a wrong slot, or a type that does not go with the others)
  function mark(r, maps, cpus, c, pos) {
    const m = maps[c], k = m[pos], n = m.filter(Boolean).length;
    if (c >= cpus || r.fill.indexOf(pos) >= n) return 'bad';
    if (r.typeErrs(m, c).length) {
      const by = {}; r.fill.forEach(p => { if (m[p]) by[m[p]] = (by[m[p]] || 0) + 1; });
      if (k !== Object.keys(by).sort((a, b) => by[b] - by[a])[0]) return 'bad';
    }
    if (cpus > 1 && maps[1 - c][pos] !== k) return 'part';
    return r.countOk && !r.countOk(m) ? 'part' : 'ok';
  }
  // the next slot to fill: of the practice layout when one is chosen, else of the vendor's order (one slot only)
  function nextSlot(r, t) {
    const s = st(t), k = taskOf(t), g = target(t), b = s.board;
    const o = order(r, k.cpus).find(([c, pos]) => g ? g[c][pos] && b[c][pos] !== g[c][pos] : !b[c][pos]);
    return o ? o.join(':') : '';
  }
  // what the line above the map says: what to do next, or the state of the layout on the board
  function status(r, t) {
    const s = st(t), k = taskOf(t), inst = s.board.slice(0, k.cpus), m = metrics(r, inst), U = r.unit || 'MT/s';
    if (closed(t)) return ['info', m.dimms ? `${pl(m.dimms, 'DIMM')} on the board, ${m.gb} GB. Verify the distribution when the layout is ready.` : `Work order: at least ${k.gb} GB with ${pl(k.cpus, cpuW(r))}. Choose a DIMM size, then click the slots.`];
    if (!woOf(t) && !s.gb) return ['info', `Choose the ${cpuW(r)}s, the DIMM and the memory size above: the list offers only what ${r.part(s.part).short}s can build in a supported layout.`];
    if (!m.dimms) {
      const g = target(t), first = g ? order(r, k.cpus).filter(([c, pos]) => g[c][pos]).slice(0, k.cpus).map(([c, pos]) => r.slotName(c, pos)) : [];
      if (!g) return ['warn', `No supported layout reaches ${k.gb} GB with ${pl(k.cpus, cpuW(r))}.`];
      const start = Sim.guide ? ` Start with ${first.join(' and ')}.` : '';
      return ['info', woOf(t) ? `Work order: at least ${k.gb} GB.${start}` : `${k.gb} GB: ${title(r, g.slice(0, 1))} per ${cpuW(r)}${k.cpus > 1 ? `, ${pl(k.cpus, cpuW(r))} the same` : ''}.${start}`];
    }
    // practice, on the way to the chosen layout: progress, not the rules a half-filled board still breaks
    const g = goalOf(t);
    if (g && order(r, k.cpus).every(([c, pos]) => !s.board[c][pos] || s.board[c][pos] === g[c][pos])) {
      const need = order(r, k.cpus).filter(([c, pos]) => g[c][pos]), nx = need.find(([c, pos]) => !s.board[c][pos]);
      if (nx) return ['info', `${m.dimms} of ${need.length} DIMMs placed for ${k.gb} GB, in the vendor's order.${Sim.guide ? ` Next: ${r.slotName(nx[0], nx[1])}.` : ''}`];
    }
    const e = errors(r, full(r, s.board.slice()), k.cpus);
    if (e.length) return ['warn', e[0]];
    return ['ok', `Supported: ${title(r, inst)}, ${m.gb} GB at ${m.speed} ${U}, ${bwTxt(m.bw)} per ${cpuW(r)}.${k.gb && m.gb < k.gb ? ` ${k.gb - m.gb} GB short of ${k.gb} GB.` : ''}`];
  }
  // the map: the slots and the processors in their real places on the board, seen from above, the rear of the server at
  // the top. Click a slot to place the chosen DIMM, click it again to take it out
  const TONE = { blue: ['#2667B8', '#0D2C57', '#FFFFFF'], black: ['#1C2025', '#000000', '#E8EEF2'], white: ['#E4DCC3', '#A99F84', '#14181C'] };
  const PART = ['#4E5FA6', '#2C7C78', '#8A5A2B'], MK = { ok: '#7CF0A8', part: '#FFC85A', bad: '#FF8A7A' };
  function mapSvg(r, t) {
    const s = st(t), k = taskOf(t), b = s.board, q = closed(t), lock = !!(t.rd && t.rd.submitted), lay = r.board.layout;
    const nx = Sim.guide && !q && !t.rd && !t.mpLab ? nextSlot(r, t) : '';
    const units = lay.reduce((a, x) => a + (x.cpu !== undefined ? 6 : x.gap ? 0.6 : 1), 0), P = 852 / units, sw = Math.min(17, P * 0.66);
    const Y0 = 58, H = 176, W = 900, keyIdx = key => r.parts.findIndex(p => p.key === key);
    let x = 24, g = `<rect x="0" y="0" width="${W}" height="300" fill="#16293A"/><rect x="14" y="34" width="872" height="238" rx="8" fill="#1F3A28" stroke="#2E5571"/>`;
    g += `<text x="450" y="24" text-anchor="middle" class="ss" style="fill:#C5CCD3">↑ Rear of the server</text>`;
    lay.forEach(it => {
      if (it.gap) { x += P * 0.6; return; }
      if (it.cpu !== undefined) {
        const c = it.cpu, off = c >= k.cpus, cx = x + P * 3, w = P * 5;
        g += `<g opacity="${off ? 0.45 : 1}"><rect x="${(cx - w / 2).toFixed(1)}" y="${Y0 + 26}" width="${w.toFixed(1)}" height="${H - 52}" rx="6" fill="#9AA4AC" stroke="#4E5961" stroke-width="2"/>`;
        for (let i = 0; i < 9; i++) g += `<rect x="${(cx - w / 2 + 6).toFixed(1)}" y="${Y0 + 34 + i * 12}" width="${(w - 12).toFixed(1)}" height="6" rx="1" fill="#C3CBD1"/>`;
        g += `<rect x="${(cx - 44).toFixed(1)}" y="${Y0 + H / 2 - 14}" width="88" height="28" rx="4" fill="#FFFFFF" stroke="#2A2F35"/><text x="${cx.toFixed(1)}" y="${Y0 + H / 2 + 5}" text-anchor="middle" style="font:800 13px var(--font);fill:#14181C">${esc(r.cpuName(c))}</text>`;
        if (off) g += `<text x="${cx.toFixed(1)}" y="${Y0 + H - 34}" text-anchor="middle" style="font:700 11px var(--font);fill:#14181C">not installed</text>`;
        g += '</g>'; x += P * 6; return;
      }
      const { c, pos } = it, key = b[c][pos], sl = r.board.slot(pos), [base, groove, ink] = TONE[sl.tone], cx = x + P / 2, off = c >= k.cpus;
      const mk = key && !q ? mark(r, b, k.cpus, c, pos) : '', name = r.slotName(c, pos);
      const lbl = `${name} (${sl.tone})${key ? `: ${r.part(key).short}${mk ? `, ${{ ok: 'in the layout', part: 'in order, not finished', bad: 'wrong slot or type' }[mk]}` : ''}, click to take it out` : ': empty, click to place the chosen DIMM'}`;
      let sg = `<rect x="${(cx - sw / 2).toFixed(1)}" y="${Y0}" width="${sw.toFixed(1)}" height="${H}" rx="2" fill="${base}" stroke="${groove}"/><rect x="${(cx - 1.2).toFixed(1)}" y="${Y0 + 8}" width="2.4" height="${H - 16}" fill="${groove}" opacity=".7"/>`;
      if (key) {
        const kc = PART[keyIdx(key)] || '#4E5FA6';
        sg += `<rect x="${(cx - sw / 2 - 1).toFixed(1)}" y="${Y0 - 6}" width="${(sw + 2).toFixed(1)}" height="${H + 12}" rx="2" fill="#2D6A44" stroke="${mk ? MK[mk] : '#163A24'}" stroke-width="${mk ? 2.5 : 1}"/><rect x="${(cx - sw / 2 + 1).toFixed(1)}" y="${Y0 + 4}" width="${(sw - 2).toFixed(1)}" height="${H - 8}" rx="1" fill="${kc}"/>`;
        sg += `<text transform="translate(${(cx + 4).toFixed(1)} ${Y0 + H / 2}) rotate(-90)" text-anchor="middle" style="font:800 ${sw > 14 ? 12 : 10.5}px var(--font);fill:#FFFFFF" pointer-events="none">${r.part(key).cap} GB</text>`;
      }
      if (nx === `${c}:${pos}`) sg += `<rect x="${(cx - sw / 2 - 4).toFixed(1)}" y="${Y0 - 10}" width="${(sw + 8).toFixed(1)}" height="${H + 20}" rx="4" fill="none" stroke="#F2AD45" stroke-width="3" stroke-dasharray="7 4" pointer-events="none"/>`;
      sg += `<rect x="${(cx - P / 2).toFixed(1)}" y="${Y0 - 8}" width="${P.toFixed(1)}" height="${H + 16}" class="zone"/>`;
      g += off || lock ? `<g opacity="${off ? 0.4 : 1}">${sg}</g>` : `<g${hot('mpSlot', `${c}:${pos}`, lbl)}>${sg}</g>`;
      g += `<text x="${cx.toFixed(1)}" y="${Y0 + H + 22}" text-anchor="middle" style="font:700 ${P > 21 ? 11 : 9.5}px var(--font);fill:${sl.tone === 'white' ? '#F4F0DE' : sl.tone === 'blue' ? '#9FC3E8' : '#AEB8C1'}" pointer-events="none">${esc(r.board.label(c, pos))}</text>`;
      x += P;
    });
    g += `<rect x="300" y="276" width="300" height="18" rx="3" fill="#C5CCD3"/><text x="450" y="289" text-anchor="middle" style="font:700 11.5px var(--font);fill:#14181C">Front of the server</text>`;
    return `<div class="mpsvgw"><svg class="mpsvg" viewBox="0 0 ${W} 300" role="group" aria-label="Memory slots and ${cpuW(r)}s, top view">${g}</svg></div>`;
  }
  function boardHtml(r, t) {
    const s = st(t), k = taskOf(t), q = closed(t), inst = s.board.slice(0, k.cpus), m = metrics(r, inst), [tone, msg] = status(r, t);
    const legend = q ? '' : `<div class="mpleg">${[['ok', r.board.legend[0]], ['part', r.board.legend[1]], ['bad', r.board.legend[2]]].map(([c, l]) => `<span><i class="m-${c}"></i>${esc(l)}</span>`).join('')}${r.parts.map((p, i) => `<span><i class="k${i}"></i>${esc(p.short)}</span>`).join('')}</div>`;
    return `<section class="mpmap"><h3>Population map: ${pl(m.dimms, 'DIMM')}, <b>${m.gb} GB</b>${m.dimms && !q ? ` at ${m.speed} ${r.unit || 'MT/s'}` : ''}</h3><p class="mpnote">${esc(r.board.note)}</p>
      <p class="mpmsg ${tone}">${esc(msg)}</p>${mapSvg(r, t)}
      <div class="mpfoot">${legend}<p>Top view, as the slots and ${cpuW(r)}s sit on the board. Click a slot to place the chosen DIMM there; click it again to take it out.${!q && !t.rd && !t.mpLab ? ' Dashed amber outline: the next slot (guidance on).' : ''}</p></div></section>`;
  }
  const factsHtml = (r, cpus) => `<dl class="mpf">${r.facts(cpus).map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>`;
  const btn = (label, act, arg, cls, dis, extra) => `<button class="btn${cls ? ' ' + cls : ''}" data-act="${act}" data-arg="${arg}"${dis ? ' disabled' : ''}${extra || ''}>${esc(label)}</button>`;
  // the memory selector of the practice: only the totals the chosen DIMM builds in a supported layout
  function memSelect(r, s) {
    const os = choices(r, s.cpus, s.part);
    return `<label class="mpsel"><span>Memory</span><select data-field="mp.sel" aria-label="Memory size"><option value=""${s.gb ? '' : ' selected'}>Choose…</option>${os.map(o => `<option value="${o.gb}"${s.gb === o.gb ? ' selected' : ''}>${o.gb >= 1024 ? `${o.gb / 1024} TB` : `${o.gb} GB`}: ${o.n} × ${r.part(s.part).cap} GB per ${cpuW(r)}${o.m.full && o.m.even ? ', every channel' : ''}</option>`).join('')}</select></label>`;
  }

  /* ---- the view ---- */
  function render(t) {
    const r = R(), s = st(t), w = woOf(t), d = t.rd, q = closed(t), k = taskOf(t);
    const verify = d && d.exam && !d.submitted && d.confirm ? `<span class="mpconf">Submit now? The layout is locked after this.</span>${btn('Yes, submit', 'mpVerify', 'yes', 'pri')}${btn('Not yet', 'mpVerify', 'no')}`
      : btn('Verify Distribution', 'mpVerify', '', 'mpgo', !!(d && d.exam && d.submitted));
    const lockAll = !!(d && d.submitted);
    let h = `<div class="mp cueable"><header class="mph"><div><h2>RAM Distributor</h2><p>${esc(r.server)}</p></div>${factsHtml(r, k.cpus)}</header>`;
    h += `<section class="mpbar" aria-label="Setup and actions">
      <div class="mpgrp"><span>${esc(cpuW(r).replace(/^./, c => c.toUpperCase()))}s</span><div class="mpseg" role="group" aria-label="${esc(cpuW(r))}s installed">${[1, 2].map(n => btn(String(n), 'mpCpus', n, k.cpus === n ? 'on' : '', !!w, ` aria-pressed="${k.cpus === n}"`)).join('')}</div></div>
      <div class="mpgrp"><span>DIMM</span><div class="mpseg" role="group" aria-label="DIMM size">${r.parts.map((p, i) => btn(`${p.cap} GB`, 'mpPart', p.key, `k${i}${s.part === p.key ? ' on' : ''}`, lockAll, ` aria-pressed="${s.part === p.key}" title="${esc(`${p.short}, ${p.pid}`)}"`)).join('')}</div></div>
      ${w ? '' : memSelect(r, s)}
      ${btn('Distribute', 'mpDist', '', 'mpdist', q || (!w && !s.gb))}${btn('Clear Board', 'mpClear', '', '', lockAll)}${d ? '' : btn(s.wo ? 'New Random Exam' : 'Random Exam', 'mpExam', '', 'mpexam')}${!d && s.wo ? btn('Leave the exam', 'mpExamEnd') : ''}${verify}</section>`;
    const pd = r.part(s.part);
    h += `<p class="mppick">DIMM to place: <b>${esc(pd.name || pd.short)}</b> <span>${esc(pd.pid)}, ${esc(pd.org)}</span></p>`;
    if (w) h += `<section class="mpwo"><div class="wo-n"><span>Work order</span><b>${esc(w.ref)}</b></div><div class="wo-b"><p class="wo-gb">At least <b>${w.gb} GB</b> of memory, ${pl(w.cpus, cpuW(r))} installed</p><p>${q ? 'Exam: place the DIMMs on the board (any of the three sizes), then verify the distribution. Distribute and the marks stay off until you verify.' : 'Verified: the result is below. Distribute now shows the best layout.'}</p><p class="wo-r">Best = the least capacity that meets the order, then the fastest layout (memory bandwidth within 5 %), then the fewest DIMMs.</p></div></section>`;
    h += boardHtml(r, t);
    const g = checked(t); if (g) h += g.practice ? practiceHtml(r, t, g) : reportHtml(r, t, g);
    if (!q && r.excludedNote) h += `<p class="mpx">${esc(r.excludedNote)}</p>`;
    return h + '</div>';
  }
  const statsHtml = (r, m) => `<dl class="mps"><div><dt>Capacity</dt><dd>${m.gb} GB</dd></div><div><dt>Speed</dt><dd>${m.speed} ${r.unit || 'MT/s'}</dd></div><div><dt>Channels</dt><dd>${m.used} of ${r.channels} <small>${m.even ? 'balanced' : 'unbalanced'}</small></dd></div><div><dt>Bandwidth</dt><dd>${bwTxt(m.bw)} <small>per ${cpuW(r)}</small></dd></div><div><dt>DIMMs</dt><dd>${m.dimms}</dd></div></dl>`;
  function practiceHtml(r, t, g) {
    const s = st(t), m = g.m, U = r.unit || 'MT/s', n = g.goal[0].filter(Boolean).length;
    let h = `<section class="mprep ${g.ok ? 'ok' : 'bad'}"><h3>Verify distribution</h3><p class="v"><b>${g.ok ? 'Correct' : 'Not yet'}</b> ${g.ok ? `The vendor's layout for ${n} × ${r.part(s.part).short} per ${cpuW(r)}, ${s.gb} GB in all: ${esc(where(r, g.goal[0], s.cpus))}.` : 'The board does not match the vendor\'s layout for this setup yet.'}</p>`;
    if (m.dimms) h += statsHtml(r, m);
    if (g.items.length) h += `<ul class="mpfind">${g.items.map(([c, x]) => `<li class="${c}">${esc(x)}</li>`).join('')}</ul>`;
    const b = g.p && g.p.best[0];
    if (g.ok && b) h += `<p class="mpy">${title(r, b.maps) === title(r, g.goal.slice(0, s.cpus)) ? `<b>The best layout for ${s.gb} GB</b> with these DIMMs or any other size: no layout is faster or uses fewer DIMMs.` : `<b>For ${g.p.need} GB with any DIMM size</b>, the best layout is ${esc(title(r, b.maps))} (${esc(where(r, b.map, s.cpus))}): ${b.m.speed} ${U}, ${bwTxt(b.m.bw)} per ${cpuW(r)}, against ${bwTxt(m.bw)} here.`}</p>`;
    return h + '</section>';
  }
  function reportHtml(r, t, g) {
    const w = woOf(t), ex = !!(w && w.exam), m = g.m, p = g.p, U = r.unit || 'MT/s';
    const verdict = g.fail ? ['bad', 'Not supported', g.hard[0]] : g.best ? ['ok', 'Supported: the best layout for this order', ex ? 'Full marks for the plan.' : 'Least capacity needed, best bandwidth, fewest DIMMs.'] : ['mid', 'Supported, but not the best layout', ex ? `${g.penalty} points off the plan.` : 'A better layout exists: see below.'];
    let h = `<section class="mprep ${verdict[0]}"><h3>Verify distribution</h3><p class="v"><b>${esc(verdict[1])}</b> ${esc(verdict[2])}</p>`;
    if (m.dimms) h += statsHtml(r, m);
    const items = [...g.hard.map(x => ['bad', x, ex ? 'fail' : '']), ...g.soft.map(x => ['mid', x.msg, ex ? `−${x.pts}` : ''])];
    if (!items.length) items.push(['ok', 'Meets the order with the least capacity needed, at the best bandwidth, with the fewest DIMMs.', '']);
    h += `<ul class="mpfind">${items.map(([c, x, pts]) => `<li class="${c}">${pts ? `<b>${esc(pts)}</b>` : ''}${esc(x)}</li>`).join('')}</ul>`;
    if (ex) { const sc = g.fail ? 0 : Math.max(0, 100 - 10 * t.errors - g.penalty);
      h += `<p class="mpscore">Score: <b>${sc}</b> of 100. ${g.fail ? 'An unsupported layout or too little capacity fails the exam.' : g.penalty ? `Points off: ${g.penalty} for the plan.` : 'No points off.'} Pass mark 70.</p>`; }
    const b = p.best[0];
    if (b && !g.best) h += `<p class="mpy"><b>Best for ${p.gb} GB${p.exact ? '' : ` (${p.need} GB)`}:</b> ${esc(title(r, b.maps))}, ${esc(where(r, b.map, b.maps.length))}; ${b.m.speed} ${U}, ${bwTxt(b.m.bw)} per ${cpuW(r)}. Distribute places it.</p>`;
    if (w && w.why) h += `<p class="mpy"><b>About this work order:</b> ${esc(w.why)}</p>`;
    return h + '</section>';
  }
  function tray(t) {
    const r = R();
    if (closed(t)) return `${r.population || ''}<h2>Exam rules</h2><ul class="rules"><li>Distribute, the marks on the board and the hints are off until you verify.</li><li>An unsupported layout, or less capacity than the order asks for, fails.</li><li>A supported layout passes. Points off: 20 if a faster layout was possible at the needed capacity, 10 for more capacity than needed, 10 for more DIMMs than needed.</li><li>Pass mark 70.</li></ul>`;
    return `${r.population || ''}<h2>How to use the board</h2><ol class="rules"><li>Choose the ${cpuW(r)}s installed and the DIMM size.</li><li>Choose the memory: the list offers only the totals that DIMM builds in a layout the vendor supports.</li><li>Place the DIMMs on the map, in the vendor's order, or press Distribute to see the layout.</li><li>Verify Distribution checks the board against the vendor's layout.</li></ol><h3>Rules for this server</h3><ul class="rules">${r.rules.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="cap" style="margin-top:6px">${esc(r.sources)}</p><p class="cap">Random Exam draws a work order: any DIMM sizes, ranked by capacity, then bandwidth, then the fewest DIMMs.${t.rd || t.mpLab ? '' : ' For a graded exam, pick the RAM Distributor exam in the Lab menu.'}</p>`;
  }

  /* ---- actions and fields ---- */
  const locked = () => { const w = woOf(T); return w && w.exam && w.submitted && T.rd ? say('info', 'The exam is submitted: the board is locked.') || true : false; };
  // any change to the board or the setup takes back an earlier verification
  const changed = () => { const h = hold(T); h.snap = null; if (T.rd) T.rd.confirm = false; };
  // a practice setup that no longer offers the chosen memory size drops it
  const keepGb = (r, s) => { if (s.gb && !choices(r, s.cpus, s.part).some(o => o.gb === s.gb)) s.gb = null; };
  CORE.mpCpus = n => {
    const r = R(), s = st(T); if (woOf(T)) return say('info', 'The work order sets the processors.');
    s.cpus = +n === 1 ? 1 : 2; if (s.cpus === 1) s.board = [s.board[0]].concat(full(r, []).slice(1));
    keepGb(r, s); changed(); say('info', `${pl(s.cpus, cpuW(r))} installed.${s.gb ? '' : ' Choose the memory size.'}`);
  };
  CORE.mpPart = k => {
    const r = R(), s = st(T); if (!r.part(k) || locked()) return;
    s.part = k; if (!woOf(T)) { keepGb(r, s); changed(); }
    say('info', `DIMM to place: ${r.part(k).short} (${r.part(k).pid}).${!woOf(T) && !s.gb ? ' Choose the memory size.' : ''}`);
  };
  CORE.mpSlot = a => {
    const r = R(), s = st(T), k = taskOf(T), [c, pos] = String(a).split(':').map(Number); if (locked() || !s.board[c] || !(pos >= 0 && pos < r.slots)) return;
    if (c >= k.cpus) return say('warn', `${r.cpuName(c)} is not installed: its slots are not used.`);
    const was = s.board[c][pos], part = r.part(s.part), name = r.slotName(c, pos);
    s.board[c][pos] = was === s.part ? null : s.part; changed();
    Sim.sound(was === s.part ? 'clipOpen' : 'dimm');
    const [tone, msg] = closed(T) ? ['info', ''] : status(r, T);
    say(tone, `${was === s.part ? `${part.short} taken out of ${name}.` : was ? `${r.part(was).short} in ${name} replaced by a ${part.short}.` : `${part.short} in ${name}.`}${msg ? ' ' + msg : ''}`);
  };
  CORE.mpClear = () => { const r = R(); if (locked()) return; st(T).board = full(r, []); changed(); say('info', 'Board cleared.'); };
  CORE.mpDist = () => {
    const r = R(), s = st(T), w = woOf(T); if (closed(T)) return say('info', 'Distribute is off in an exam until you verify the distribution.');
    if (T.rd && T.rd.submitted) return locked();
    if (!w && !s.gb) return say('warn', 'Choose the memory size first.');
    const g = target(T), k = taskOf(T);
    if (!g) return say('warn', `No supported layout reaches ${k.gb} GB with ${pl(k.cpus, cpuW(r))}.`);
    s.board = g.map(m => m.slice()); changed();
    const m = metrics(r, g.slice(0, k.cpus));
    say('ok', `Distributed ${k.gb} GB: ${title(r, g.slice(0, k.cpus))}, ${where(r, g[0], k.cpus)}. ${m.speed} ${r.unit || 'MT/s'}, ${bwTxt(m.bw)} per ${cpuW(r)}.`);
  };
  CORE.mpVerify = a => {
    const r = R(), s = st(T), d = T.rd, w = woOf(T);
    if (d && d.exam) {
      if (d.submitted) return locked();
      if (a === 'no') { d.confirm = false; return; }
      if (a !== 'yes') { d.confirm = true; return say('info', 'Submit the layout? The board is locked after this.'); }
      d.snap = snapOf(s.board); d.submitted = true; d.confirm = false; const g = checked(T);
      T.grade = { penalty: g.penalty, fail: g.fail, why: g.fail ? g.hard[0] : g.soft.map(x => x.msg).join(' '), best: g.best };
      return say(g.fail ? 'warn' : 'ok', g.fail ? `Submitted. Not supported: ${g.hard[0]}` : g.best ? 'Submitted: the best layout for this order.' : `Submitted: supported, ${g.penalty} points off the plan.`);
    }
    if (!w && !s.gb) return say('warn', 'Choose the memory size first: Verify checks the board against the vendor\'s layout for it.');
    hold(T).snap = snapOf(s.board); if (w && w.exam) w.submitted = true;
    const g = checked(T), U = r.unit || 'MT/s';
    if (g.practice) return say(g.ok ? 'ok' : 'warn', g.ok ? `Correct: ${s.gb} GB in the vendor's layout, ${g.m.speed} ${U}.` : `Not yet: ${g.items[0][1]}`);
    say(g.fail ? 'warn' : 'ok', g.fail ? `Not supported: ${g.hard[0]}` : g.best ? `Verified: ${g.m.gb} GB at ${g.m.speed} ${U}, the best layout for ${taskOf(T).gb} GB.` : `Verified: supported, ${g.m.gb} GB at ${g.m.speed} ${U}, but a better layout exists. ${g.soft.map(x => x.msg).join(' ')}`);
  };
  CORE.mpExam = () => {
    const r = R(), s = st(T); if (T.rd) return;
    const k = draw(r, 'board'); s.wo = woNew(k, true); s.board = full(r, []); s.snap = null;
    say('info', `Random exam, work order ${s.wo.ref}: at least ${k.gb} GB with ${pl(k.cpus, cpuW(r))}. Place the DIMMs, then verify the distribution.`);
  };
  CORE.mpExamEnd = () => { const s = st(T); if (T.rd || !s.wo) return; s.wo = null; s.snap = null; say('info', 'Exam left: back to the practice setup.'); };

  /* ---- the labs: practice (the student's own setup) and the exam (a work order drawn at random from the model's tricky
     cases) ---- */
  const C = (act, arg, say) => ({ act, arg, say });
  const lastCase = {};
  const test = { k: null };   // tests: force a work order (index into the model's tasks)
  function draw(r, id) {
    const pool = r.tasks; let k = Math.floor(Math.random() * pool.length);
    if (test.k !== null && pool[test.k]) { lastCase[r.id + id] = test.k; return Object.assign({ k: test.k }, pool[test.k]); }
    if (pool.length > 1 && k === lastCase[r.id + id]) k = (k + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length;
    lastCase[r.id + id] = k; return Object.assign({ k }, pool[k]);
  }
  const woNew = (k, ex) => ({ gb: k.gb, cpus: k.cpus, why: k.why, ref: `RD-${String(k.gb).padStart(4, '0')}-${k.cpus}P`, exam: !!ex, snap: null, submitted: false, confirm: false });
  // the cues to place a layout on the board: take out what does not belong, then fill in the vendor's order over the server
  function boardCue(t, maps) {
    const r = R(), s = st(t), b = s.board; if (!maps) return null;
    for (const [c, pos] of order(r, r.cpus)) if (b[c][pos] && !maps[c][pos]) return C('mpSlot', `${c}:${pos}`, `Take the DIMM out of ${r.slotName(c, pos)}: it is not in the layout. Click it.`);
    for (const [c, pos] of order(r, r.cpus)) {
      const want = maps[c][pos]; if (!want || b[c][pos] === want) continue;
      return s.part !== want ? C('mpPart', want, `Choose the ${r.part(want).cap} GB DIMM.`) : C('mpSlot', `${c}:${pos}`, `Place a ${r.part(want).short} in ${r.slotName(c, pos)}.`);
    }
    return null;
  }
  // practice cue for the setup: the memory size that fills every channel once (or the nearest), for the chosen DIMM
  function setupCue(t) {
    const r = R(), s = st(t), os = choices(r, s.cpus, s.part), o = os.find(x => x.n === r.channels) || os[os.length - 1];
    return { field: 'mp.sel', value: String(o.gb), say: `Choose the memory size: for example ${o.gb} GB, ${o.n} × ${r.part(s.part).cap} GB per ${cpuW(r)}, one DIMM in every channel.` };
  }
  function labScenario(o) {
    const steps = o.exam ? [
      { view: 'rdist', text: 'Place the DIMMs for the work order on the board', done: t => t.rd.submitted || t.rd.confirm, cue: t => boardCue(t, target(t)) || C('mpVerify', '', 'Verify the distribution.') },
      { view: 'rdist', text: 'Verify the distribution: submit the layout', done: t => !!t.rd.submitted, cue: t => C('mpVerify', t.rd.confirm ? 'yes' : '', t.rd.confirm ? 'Confirm: submit the layout.' : 'Verify the distribution.') }]
    : [
      { view: 'rdist', text: `Choose the ${cpuW(R())}s, the DIMM and the memory size`, hint: 'The memory list offers only the totals the chosen DIMM builds in a supported layout.', done: t => !!st(t).gb, cue: setupCue },
      { view: 'rdist', text: 'Place the DIMMs on the map', hint: o.hint, done: t => { const g = goalOf(t); return !!g && JSON.stringify(g) === JSON.stringify(st(t).board); }, cue: t => boardCue(t, goalOf(t)) },
      { view: 'rdist', text: 'Verify the distribution', hint: 'Verify checks the board against the vendor\'s layout for your setup, and compares it with the best layout for that capacity.', done: t => { const g = checked(t); return !!g && g.ok; }, cue: () => C('mpVerify', '', 'Verify the distribution.') }];
    return {
      id: o.id, title: o.title, exam: !!o.exam, start: 'rdist', steps,
      get intro() { const d = T && T.rd; const wo = d ? `Work order ${d.ref}: at least ${d.gb} GB of memory, with ${pl(d.cpus, cpuW(R()))} installed. ` : '';
        return wo + (o.exam ? o.examIntro : o.practiceIntro); },
      setup() {
        const r = R();
        if (!o.exam) { const t = o.setup({ cpus: r.cpus }); t.mpLab = true; t.mp = null; st(t); return t; }
        const k = draw(r, o.id), t = o.setup(k);
        t.rd = woNew(k, true);
        t.mp = { gb: null, cpus: k.cpus, part: (r.parts[1] || r.parts[0]).key, board: full(r, []), wo: null, snap: null };
        return t;
      }
    };
  }
  const field = (f, v) => { const s = st(T); if (f === 'mp.sel' && !woOf(T)) { const n = parseInt(v, 10); s.gb = n > 0 ? n : null; changed(); } };
  return { metrics, errors, all, plan, gradeMaps, checked, target, choices, title, orderOf, counts, examText, render, tray, field, st, exam, lab: labScenario, test, TOL, PTS,
    view: o => Object.assign({ render, tray, actions: () => [] }, o) };
})();
Sim.memRules = r => { REG().mem = r; };
