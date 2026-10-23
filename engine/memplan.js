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

  /* ---- state: the board (one array per processor socket of the server), the DIMM size placed next, the target and the
     processors; the work order of a lab (t.rd) or of a random exam drawn on the board (t.mp.wo) ---- */
  function st(t) {
    const r = R();
    if (!t.mp) t.mp = { gb: r.defaultGb, gbIn: '', cpus: r.cpus, part: r.parts[0].key, board: full(r, []), wo: null, snap: null };
    return t.mp;
  }
  const woOf = t => t.rd || st(t).wo;
  const hold = t => woOf(t) || st(t);
  const exam = t => { const w = woOf(t); return !!(w && w.exam); };
  // an exam still open: no Distribute, no marks, no hints
  const closed = t => exam(t) && !woOf(t).submitted;
  const taskOf = t => { const w = woOf(t), s = st(t); return w ? { gb: w.gb, cpus: w.cpus } : { gb: s.gb, cpus: s.cpus }; };
  // the best layout for the target, as maps for every socket: what Distribute places and the cues follow
  function target(t) {
    const r = R(), k = taskOf(t), p = plan(r, k.cpus, k.gb);
    return p.best[0] ? full(r, p.best[0].maps) : null;
  }
  const checked = t => { const h = hold(t); return h.snap ? gradeMaps(R(), unsnap(h.snap), taskOf(t)) : null; };
  // the result for the done banner outside a learning platform
  function examText(t) {
    const g = t.grade; if (!g) return '';
    const per = 10, pass = 70, score = g.fail ? 0 : Math.max(0, 100 - per * t.errors - g.penalty);
    return `Exam finished: score ${score} of 100 (pass mark ${pass}), ${score >= pass ? 'passed' : 'not passed'}. ${g.fail ? 'The layout is not supported: ' + g.why : g.penalty ? `${g.penalty} points off for the memory plan` + (t.errors ? `, ${t.errors * per} for mistakes` : '') + '.' : t.errors ? `${t.errors * per} points off for mistakes.` : 'The best layout, no mistakes.'} The RAM Distributor shows why.`;
  }

  /* ---- the board ---- */
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
  // what the side panel says: the target and where to start, or the state of the layout on the board
  function status(r, t) {
    const s = st(t), k = taskOf(t), inst = s.board.slice(0, k.cpus), m = metrics(r, inst), U = r.unit || 'MT/s';
    if (closed(t)) return ['info', m.dimms ? `${pl(m.dimms, 'DIMM')} on the board, ${m.gb} GB. Verify the distribution when the layout is ready.` : `Work order: at least ${k.gb} GB with ${pl(k.cpus, cpuW(r))}. Choose a DIMM size, then click the slots.`];
    if (!m.dimms) {
      const p = plan(r, k.cpus, k.gb), b = p.best[0];
      if (!b) return ['warn', `No supported layout reaches ${k.gb} GB with ${pl(k.cpus, cpuW(r))}: the most this server holds is ${p.max} GB.`];
      const first = Array.from({ length: k.cpus }, (_, c) => r.slotName(c, r.fill[0]));
      return ['info', `Target: ${k.gb} GB${p.exact ? '' : `, the least a supported layout gives is ${p.need} GB`} (${title(r, [b.map])} per ${cpuW(r)}). Start with ${first.join(' and ')}.`];
    }
    const e = errors(r, full(r, s.board.slice()), k.cpus);
    if (e.length) return ['warn', e[0]];
    return ['ok', `Supported: ${title(r, inst)}, ${m.gb} GB at ${m.speed} ${U}, ${bwTxt(m.bw)} per ${cpuW(r)}.${m.gb < k.gb ? ` ${k.gb - m.gb} GB short of the target.` : ''}`];
  }
  function boardHtml(r, t) {
    const s = st(t), k = taskOf(t), b = s.board, q = closed(t), lock = !!(t.rd && t.rd.submitted), inst = b.slice(0, k.cpus), m = metrics(r, inst);
    const keyIdx = key => r.parts.findIndex(p => p.key === key);
    // with guidance on and outside an exam, the next slot of the fill order on each processor
    const next = Sim.guide && !q ? Array.from({ length: k.cpus }, (_, c) => r.fill.find(pos => !b[c][pos])) : [];
    const slot = (c, pos) => {
      const key = b[c][pos], off = c >= k.cpus, sl = r.board.slot(pos), mk = key && !q ? mark(r, b, k.cpus, c, pos) : '';
      const lbl = `${r.slotName(c, pos)} (${sl.tone})${key ? `: ${r.part(key).short}${mk ? `, ${{ ok: 'in the layout', part: 'in order, not finished', bad: 'wrong slot or type' }[mk]}` : ''}` : ': empty'}`;
      return `<button class="mpk t-${sl.tone}${key ? ` f k${keyIdx(key)}` : ''}${mk ? ` m-${mk}` : ''}${!key && next[c] === pos ? ' nx' : ''}" data-act="mpSlot" data-arg="${c}:${pos}" aria-label="${esc(lbl)}"${off || lock ? ' disabled' : ''}>${key ? r.part(key).cap : sl.num}</button>`;
    };
    const rows = Array.from({ length: r.cpus }, (_, c) => {
      const n = b[c].filter(Boolean).length, off = c >= k.cpus;
      return `<div class="mprow${off ? ' off' : ''}"><div class="mpcpu"><b>${esc(r.cpuName(c))}</b><small>${off ? 'not installed' : `${n} of ${r.slots}`}</small></div><div class="mpchs">${r.board.chans.map((ch, i) => `${r.board.split && i === r.board.split ? '<i class="mpsplit" aria-hidden="true"></i>' : ''}<div class="mpch"><span>${esc(ch.label(c))}</span><div>${ch.pos.map(pos => slot(c, pos)).join('')}</div></div>`).join('')}</div></div>`;
    }).join('');
    const [tone, msg] = status(r, t);
    const parts = r.parts.map((p, i) => `<button class="mppart k${i}${s.part === p.key ? ' on' : ''}" data-act="mpPart" data-arg="${p.key}" aria-pressed="${s.part === p.key}"${lock ? ' disabled' : ''}><b>${p.cap} GB</b><span>${esc(p.short)}</span><small>${esc(p.pid)}</small></button>`).join('');
    const legend = q ? '' : `<div class="mpleg">${[['ok', r.board.legend[0]], ['part', r.board.legend[1]], ['bad', r.board.legend[2]]].map(([c, l]) => `<span><i class="m-${c}"></i>${esc(l)}</span>`).join('')}</div>`;
    return `<section class="mpmap"><h3>Population map: ${pl(m.dimms, 'DIMM')}, <b>${m.gb} GB</b>${m.dimms && !q ? ` at ${m.speed} ${r.unit || 'MT/s'}` : ''}</h3><p class="mpnote">${esc(r.board.note)}</p>
      <div class="mpside"><div><p class="mpsl">DIMM to place</p><div class="mpparts" role="group" aria-label="DIMM size to place">${parts}</div></div><p class="mpmsg ${tone}">${esc(msg)}</p></div>${rows}
      <div class="mpfoot">${legend}<p>Numbers in a fitted slot: its size in GB. Click a slot to place the chosen DIMM there; click it again to take it out.${q ? '' : ' Amber outline: the next slot in the vendor\'s order (guidance on).'}</p></div></section>`;
  }
  const factsHtml = (r, cpus) => `<dl class="mpf">${r.facts(cpus).map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>`;
  const btn = (label, act, arg, cls, dis) => `<button class="btn${cls ? ' ' + cls : ''}" data-act="${act}" data-arg="${arg}"${dis ? ' disabled' : ''}>${esc(label)}</button>`;
  // the capacities to try with one click; a star where no layout fills every channel equally at exactly that capacity
  function quickHtml(r, s) {
    return `<div class="mpq" role="group" aria-label="Quick capacities"><span>Quick capacities:</span>${(r.quick || []).map(gb => {
      const p = plan(r, s.cpus, gb), b = p.best[0], odd = !b || !p.exact || !(b.m.full && b.m.even);
      return `<button class="mpchip${odd ? ' odd' : ''}${s.gb === gb ? ' on' : ''}" data-act="mpQuick" data-arg="${gb}" aria-pressed="${s.gb === gb}" title="${odd ? (b ? (p.exact ? 'No layout fills every channel equally at this capacity' : `Not exact: the least a supported layout gives is ${p.need} GB`) : 'More than this server holds') : 'Every channel filled equally'}">${gb >= 1024 ? `${gb} GB (${gb / 1024} TB)` : `${gb} GB`}${odd ? ' *' : ''}</button>`;
    }).join('')}</div>`;
  }

  /* ---- the view ---- */
  function render(t) {
    const r = R(), s = st(t), w = woOf(t), d = t.rd, q = closed(t), k = taskOf(t);
    const verify = d && d.exam && !d.submitted && d.confirm ? `<span class="mpconf">Submit now? The layout is locked after this.</span>${btn('Yes, submit', 'mpVerify', 'yes', 'pri')}${btn('Not yet', 'mpVerify', 'no')}`
      : btn('Verify Distribution', 'mpVerify', '', 'mpgo', !!(d && d.exam && d.submitted));
    let h = `<div class="mp cueable"><header class="mph"><div><h2>RAM Distributor</h2><p>${esc(r.server)}</p></div>${factsHtml(r, k.cpus)}</header>`;
    h += `<section class="mpbar" aria-label="Target and actions"><label class="mptg"><span>Target GB</span><input type="number" min="1" inputmode="numeric" data-field="mp.gb" data-enter="mpDist" value="${esc(w ? w.gb : s.gbIn || s.gb)}" aria-label="Target capacity in GB"${w ? ' disabled' : ''}>${btn('Distribute', 'mpDist', '', 'mpdist', q)}</label>
      <div class="mpseg" role="group" aria-label="${esc(cpuW(r))}s installed">${[1, 2].map(n => `<button class="btn${k.cpus === n ? ' on' : ''}" data-act="mpCpus" data-arg="${n}" aria-pressed="${k.cpus === n}"${w ? ' disabled' : ''}>${n} ${esc(n === 1 ? cpuW(r) : cpuW(r) + 's')}</button>`).join('')}</div>
      ${btn('Clear Board', 'mpClear', '', '', !!(d && d.submitted))}${d ? '' : btn(s.wo ? 'New Random Exam' : 'Random Exam', 'mpExam', '', 'mpexam')}${!d && s.wo ? btn('Leave the exam', 'mpExamEnd') : ''}${verify}</section>`;
    if (!w) h += quickHtml(r, s);
    else h += `<section class="mpwo"><div class="wo-n"><span>Work order</span><b>${esc(w.ref)}</b></div><div class="wo-b"><p class="wo-gb">At least <b>${w.gb} GB</b> of memory, ${pl(w.cpus, cpuW(r))} installed</p><p>${q ? 'Exam: place the DIMMs on the board, then verify the distribution. Distribute and the marks stay off until you verify.' : w.exam ? 'Verified: the result is below. Distribute now shows the best layout.' : 'Practice: place the DIMMs on the board, then verify the distribution. Distribute shows the best layout.'}</p><p class="wo-r">Best = the least capacity that meets the order, then the fastest layout (memory bandwidth within 5 %), then the fewest DIMMs.</p></div></section>`;
    h += boardHtml(r, t);
    const g = checked(t); if (g) h += reportHtml(r, t, g);
    if (!q && r.excludedNote) h += `<p class="mpx">${esc(r.excludedNote)}</p>`;
    return h + '</div>';
  }
  function reportHtml(r, t, g) {
    const w = woOf(t), ex = !!(w && w.exam), m = g.m, p = g.p, U = r.unit || 'MT/s';
    const verdict = g.fail ? ['bad', 'Not supported', g.hard[0]] : g.best ? ['ok', 'Supported: the best layout for this target', ex ? 'Full marks for the plan.' : 'Least capacity needed, best bandwidth, fewest DIMMs.'] : ['mid', 'Supported, but not the best layout', ex ? `${g.penalty} points off the plan.` : 'A better layout exists: see below.'];
    let h = `<section class="mprep ${verdict[0]}"><h3>Verify distribution</h3><p class="v"><b>${esc(verdict[1])}</b> ${esc(verdict[2])}</p>`;
    if (m.dimms) h += `<dl class="mps"><div><dt>Capacity</dt><dd>${m.gb} GB</dd></div><div><dt>Speed</dt><dd>${m.speed} ${U}</dd></div><div><dt>Channels</dt><dd>${m.used} of ${r.channels} <small>${m.even ? 'balanced' : 'unbalanced'}</small></dd></div><div><dt>Bandwidth</dt><dd>${bwTxt(m.bw)} <small>per ${cpuW(r)}</small></dd></div><div><dt>DIMMs</dt><dd>${m.dimms}</dd></div></dl>`;
    const items = [...g.hard.map(x => ['bad', x, ex ? 'fail' : '']), ...g.soft.map(x => ['mid', x.msg, ex ? `−${x.pts}` : ''])];
    if (!items.length) items.push(['ok', 'Meets the target with the least capacity needed, at the best bandwidth, with the fewest DIMMs.', '']);
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
    if (closed(t)) return `<h2>Exam rules</h2><ul class="rules"><li>Distribute, the marks on the board and the hints are off until you verify.</li><li>An unsupported layout, or less capacity than the order asks for, fails.</li><li>A supported layout passes. Points off: 20 if a faster layout was possible at the needed capacity, 10 for more capacity than needed, 10 for more DIMMs than needed.</li><li>Pass mark 70.</li></ul>`;
    return `<h2>How the board ranks</h2><ol class="rules"><li>At least the target capacity, and no more than the least a supported layout gives.</li><li>The highest memory bandwidth: layouts within 5 % count as equal.</li><li>The fewest DIMMs.</li></ol><p class="cap">Bandwidth is the theoretical peak per processor: interleaved channels × transfer rate × 8 bytes. Unequal channels split the memory into interleave regions, which lowers it.</p><h3>Rules for this server</h3><ul class="rules">${r.rules.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="cap" style="margin-top:6px">${esc(r.sources)}</p>${t.rd ? '' : '<p class="cap">Random Exam draws a work order here; for a graded exam, pick the RAM Distributor exam in the Lab menu.</p>'}`;
  }

  /* ---- actions and fields ---- */
  const toInt = v => { const n = parseInt(String(v).trim(), 10); return Number.isFinite(n) && n >= 0 ? n : NaN; };
  const locked = () => { const w = woOf(T); return w && w.exam && w.submitted && T.rd ? say('info', 'The exam is submitted: the board is locked.') || true : false; };
  // any change to the board takes back an earlier verification
  const changed = () => { const h = hold(T); h.snap = null; if (T.rd) T.rd.confirm = false; };
  CORE.mpCpus = n => {
    const r = R(), s = st(T); if (woOf(T)) return say('info', 'The work order sets the processors.');
    s.cpus = +n === 1 ? 1 : 2; if (s.cpus === 1) s.board = [s.board[0]].concat(full(r, []).slice(1));
    changed(); say('info', `${pl(s.cpus, cpuW(r))} installed.`);
  };
  CORE.mpQuick = gb => { const s = st(T); if (woOf(T)) return; s.gb = +gb; s.gbIn = String(gb); say('info', `Target: ${gb} GB. Distribute fills the board with the best layout, or place the DIMMs yourself.`); };
  CORE.mpPart = k => { const r = R(); if (!r.part(k) || locked()) return; st(T).part = k; say('info', `Placing ${r.part(k).short}s (${r.part(k).pid}).`); };
  CORE.mpSlot = a => {
    const r = R(), s = st(T), k = taskOf(T), [c, pos] = String(a).split(':').map(Number); if (locked() || !s.board[c] || !(pos >= 0 && pos < r.slots)) return;
    if (c >= k.cpus) return say('warn', `${r.cpuName(c)} is not installed: its slots are not used.`);
    const was = s.board[c][pos], part = r.part(s.part), name = r.slotName(c, pos);
    s.board[c][pos] = was === s.part ? null : s.part; changed();
    const [tone, msg] = closed(T) ? ['info', ''] : status(r, T);
    say(tone, `${was === s.part ? `${part.short} taken out of ${name}.` : was ? `${r.part(was).short} in ${name} replaced by a ${part.short}.` : `${part.short} in ${name}.`}${msg ? ' ' + msg : ''}`);
  };
  CORE.mpClear = () => { const r = R(); if (locked()) return; st(T).board = full(r, []); changed(); say('info', 'Board cleared.'); };
  CORE.mpDist = () => {
    const r = R(), s = st(T); if (closed(T)) return say('info', 'Distribute is off in an exam until you verify the distribution.');
    if (T.rd && T.rd.submitted) return locked();
    if (!woOf(T)) { const n = toInt(s.gbIn || s.gb); if (!n) return say('warn', 'Type the target capacity, in GB.'); s.gb = n; s.gbIn = String(n); }
    const k = taskOf(T), p = plan(r, k.cpus, k.gb), b = p.best[0];
    if (!b) return say('warn', `No supported layout reaches ${k.gb} GB with ${pl(k.cpus, cpuW(r))}: the most this server holds is ${p.max} GB.`);
    s.board = full(r, b.maps.map(m => m.slice())); changed();
    say('ok', `Distributed for ${k.gb} GB${p.exact ? '' : ` (the least a supported layout gives is ${p.need} GB)`}: ${title(r, b.maps)}, ${where(r, b.map, k.cpus)}. ${b.m.speed} ${r.unit || 'MT/s'}, ${bwTxt(b.m.bw)} per ${cpuW(r)}.`);
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
    hold(T).snap = snapOf(s.board); if (w && w.exam) w.submitted = true;
    const g = checked(T), U = r.unit || 'MT/s';
    say(g.fail ? 'warn' : 'ok', g.fail ? `Not supported: ${g.hard[0]}` : g.best ? `Verified: ${g.m.gb} GB at ${g.m.speed} ${U}, the best layout for ${taskOf(T).gb} GB.` : `Verified: supported, ${g.m.gb} GB at ${g.m.speed} ${U}, but a better layout exists. ${g.soft.map(x => x.msg).join(' ')}`);
  };
  CORE.mpExam = () => {
    const r = R(), s = st(T); if (T.rd) return;
    const k = draw(r, 'board'); s.wo = woNew(k, true); s.cpus = k.cpus; s.gb = k.gb; s.board = full(r, []); s.snap = null;
    say('info', `Random exam, work order ${s.wo.ref}: at least ${k.gb} GB with ${pl(k.cpus, cpuW(r))}. Place the DIMMs, then verify the distribution.`);
  };
  CORE.mpExamEnd = () => { const s = st(T); if (T.rd || !s.wo) return; s.wo = null; s.snap = null; say('info', 'Exam left: the board is a planner again.'); };

  /* ---- the labs: a work order drawn at random from the model's tricky cases; practice (Distribute and cues) or exam ---- */
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
  // the cues to place a layout on the board: take out what does not belong, then fill each processor in the vendor's order
  function boardCue(t, maps) {
    const r = R(), s = st(t), b = s.board; if (!maps) return null;
    for (let c = 0; c < r.cpus; c++) for (const pos of r.fill) if (b[c][pos] && !maps[c][pos]) return C('mpSlot', `${c}:${pos}`, `Take the DIMM out of ${r.slotName(c, pos)}: it is not in the layout. Click it.`);
    for (let c = 0; c < r.cpus; c++) for (const pos of r.fill) {
      const want = maps[c][pos]; if (!want || b[c][pos] === want) continue;
      return s.part !== want ? C('mpPart', want, `Choose the ${r.part(want).short} (DIMM to place).`) : C('mpSlot', `${c}:${pos}`, `Place a ${r.part(want).short} in ${r.slotName(c, pos)}.`);
    }
    return null;
  }
  function labScenario(o) {
    const steps = o.exam ? [
      { view: 'rdist', text: 'Place the DIMMs for the work order on the board', done: t => t.rd.submitted || t.rd.confirm, cue: t => boardCue(t, target(t)) || C('mpVerify', '', 'Verify the distribution.') },
      { view: 'rdist', text: 'Verify the distribution: submit the layout', done: t => !!t.rd.submitted, cue: t => C('mpVerify', t.rd.confirm ? 'yes' : '', t.rd.confirm ? 'Confirm: submit the layout.' : 'Verify the distribution.') }]
    : [
      { view: 'rdist', text: 'Place the DIMMs for the work order on the board', hint: o.hint, done: t => !gradeMaps(R(), st(t).board, t.rd).fail, cue: t => boardCue(t, target(t)) },
      { view: 'rdist', text: 'Verify the distribution', hint: 'Verify grades the board against the work order: supported, the least capacity needed, the best bandwidth, the fewest DIMMs.', done: t => { const g = checked(t); return !!g && !g.fail; }, cue: () => C('mpVerify', '', 'Verify the distribution.') }];
    return {
      id: o.id, title: o.title, exam: !!o.exam, start: 'rdist', steps,
      get intro() { const d = T && T.rd; const wo = d ? `Work order ${d.ref}: at least ${d.gb} GB of memory, with ${pl(d.cpus, cpuW(R()))} installed. ` : '';
        return wo + (o.exam ? o.examIntro : o.practiceIntro); },
      setup() {
        const r = R(), k = draw(r, o.id), t = o.setup(k);
        t.rd = woNew(k, o.exam);
        t.mp = { gb: k.gb, gbIn: '', cpus: k.cpus, part: r.parts[0].key, board: full(r, []), wo: null, snap: null };
        return t;
      }
    };
  }
  const field = (f, v) => { const s = st(T); if (f === 'mp.gb') { s.gbIn = v; const n = toInt(v); if (n > 0 && !woOf(T)) s.gb = n; } };
  return { metrics, errors, all, plan, gradeMaps, checked, target, title, orderOf, counts, examText, render, tray, field, st, exam, lab: labScenario, test, TOL, PTS,
    view: o => Object.assign({ render, tray, actions: () => [] }, o) };
})();
Sim.memRules = r => { REG().mem = r; };
