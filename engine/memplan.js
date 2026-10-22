
/* ============ 4. RAM Distributor: the memory planner, shared by every model ============
   A model pack describes its memory with Sim.memRules({...}): slots, channels, the vendor's parts, the vendor's rules
   (checkCpu, checkServer), the speed, the layouts to try (candidates) and how to read the fitted DIMMs from the twin.
   This module lists every layout the vendor supports for a capacity and a processor count, ranks them, and grades the
   layout a student fitted.
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
    if (cpus > 1 && each[0].length && each[0].join() === each[1].join()) each[0].forEach(x => e.push(`Both ${r.cpuWord || 'processor'}s: ${x}`));
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
    if (!opts.length) return { gb, cpus, none: true, max, best: [], rest: [], bigger: [], faster: [], count: 0 };
    const need = Math.min(...opts.map(o => o.m.gb)), at = opts.filter(o => o.m.gb === need);
    const top = Math.max(...at.map(o => o.m.bw)), fast = at.filter(o => o.m.bw >= top * TOL), fewest = Math.min(...fast.map(o => o.m.dimms));
    const isBest = o => o.m.gb === need && o.m.bw >= top * TOL && o.m.dimms === fewest;
    // ties: the bigger DIMMs in the first slots of the fill order (the vendor's usual picture of a mixed layout)
    const front = o => (r.fill || []).map(pos => o.map[pos] ? r.part(o.map[pos]).cap : 0);
    const byFront = (a, b) => { const x = front(a), y = front(b); for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return y[i] - x[i]; return 0; };
    const byBw = (a, b) => b.m.bw - a.m.bw || a.m.dimms - b.m.dimms || byFront(a, b);
    const best = at.filter(isBest).sort(byBw), rest = at.filter(o => !isBest(o)).sort(byBw);
    const bigger = opts.filter(o => o.m.gb > need).sort((a, b) => a.m.gb - b.m.gb || byBw(a, b));
    const faster = []; bigger.filter(o => o.m.bw > top / TOL).forEach(o => { if (!faster.some(x => x.m.gb === o.m.gb)) faster.push(o); });
    return { gb, cpus, need, top, fewest, exact: need === gb, best, rest, bigger, faster: faster.slice(0, 3), count: opts.length, max };
  }
  // the parts of a layout, biggest first: '16 x 32 GB 2Rx8 RDIMM + 16 x 16 GB 1Rx8 RDIMM'
const counts = (r, maps) => { const c = {}; maps.forEach(m => m.forEach(k => { if (k) c[k] = (c[k] || 0) + 1; })); return r.parts.filter(p => c[p.key]).sort((a, b) => b.cap - a.cap).map(p => [p, c[p.key]]); };
  const title = (r, maps) => counts(r, maps).map(([p, n]) => `${n} × ${p.short}`).join(' + ') || 'No DIMMs';
  const orderOf = (r, maps) => Object.fromEntries(counts(r, maps).map(([p, n]) => [p.key, n]));
  // where each part goes on one processor
  function where(r, m, cpus = 2) {
    const by = {}; m.forEach((k, pos) => { if (k) (by[k] = by[k] || []).push(pos); });
    return Object.entries(by).map(([k, ps]) => `${r.part(k).cap} GB in ${r.slotList(ps, cpus)}`).join('; ');
  }
  // grade a fitted layout (maps for every socket) against a work order
  function gradeMaps(r, maps, task) {
    const cpus = task.cpus, inst = maps.slice(0, cpus), hard = errors(r, full(r, maps.slice()), cpus), m = metrics(r, inst), p = plan(r, cpus, task.gb);
    if (!m.dimms) hard.unshift('No DIMMs fitted.');
    else if (m.gb < task.gb) hard.push(`${m.gb} GB fitted: less than the ${task.gb} GB the work order asks for.`);
    const soft = [];
    if (!hard.length && !p.none) {
      if (m.gb > p.need) soft.push({ pts: PTS.over, msg: `${m.gb} GB is ${m.gb - p.need} GB more than needed: ${p.need} GB ${p.exact ? 'meets the order exactly' : 'is the least a supported layout gives'}.` });
      if (m.bw < p.top * TOL) soft.push({ pts: PTS.slow, msg: `About ${bwTxt(m.bw)} per ${r.cpuWord || 'processor'}, while a layout of ${p.need} GB reaches ${bwTxt(p.top)}.` });
      else if (m.gb === p.need && m.dimms > p.fewest) soft.push({ pts: PTS.more, msg: `${m.dimms} DIMMs, while the same capacity and speed need only ${p.fewest}.` });
    }
    return { hard, soft, m, p, maps: inst, fail: hard.length > 0, best: !hard.length && !soft.length, penalty: sum(soft.map(s => s.pts)) };
  }
  const snapOf = (r, t) => r.read(t).map(m => m.map(k => k || '-').join(','));
  const unsnap = s => s.map(x => x.split(',').map(k => k === '-' ? null : k));

  /* ---- state ---- */
  function st(t) {
    const r = R();
    if (!t.mp) t.mp = { gb: (t.rd && t.rd.gb) || r.defaultGb, gbIn: '', cpus: (t.rd && t.rd.cpus) || r.cpus, qty: {} };
    return t.mp;
  }
  const lab = t => t.rd || null;
  const exam = t => !!(t.rd && t.rd.exam);
  const taskOf = t => t.rd ? { gb: t.rd.gb, cpus: t.rd.cpus } : { gb: st(t).gb, cpus: st(t).cpus };
  // the layout the cues follow: the one matching the order (a best one first), else the first best layout
  function target(t) {
    const r = R(), d = t.rd; if (!d) return null;
    const p = plan(r, d.cpus, d.gb), list = [...p.best, ...p.rest, ...p.bigger];
    if (d.pick) { const o = list.find(x => x.sig === d.pick); if (o) return full(r, o.maps); }
    if (d.order) { const o = list.find(x => JSON.stringify(orderOf(r, x.maps)) === JSON.stringify(d.order)); if (o) return full(r, o.maps); }
    return p.best[0] ? full(r, p.best[0].maps) : null;
  }
  const checked = t => { const d = t.rd; return d && d.snap ? gradeMaps(R(), unsnap(d.snap), d) : null; };
  const kitEmpty = t => !R().kitLeft(t);
  // the result for the done banner outside a learning platform
  function examText(t) {
    const g = t.grade; if (!g) return '';
    const per = 10, pass = 70, score = g.fail ? 0 : Math.max(0, 100 - per * t.errors - g.penalty);
    return `Exam finished: score ${score} of 100 (pass mark ${pass}), ${score >= pass ? 'passed' : 'not passed'}. ${g.fail ? 'The layout is not supported: ' + g.why : g.penalty ? `${g.penalty} points off for the memory plan` + (t.errors ? `, ${t.errors * per} for mistakes` : '') + '.' : t.errors ? `${t.errors * per} points off for mistakes.` : 'The best layout, no mistakes.'} The memory check in the RAM Distributor shows why.`;
  }

  /* ---- pictures ---- */
  // a processor's slots as a small grid: one column per channel, its slots from the first (top) down
  function grid(r, m, keys) {
    const g = r.grid, idx = k => keys.indexOf(k);
    return `<table class="mpg" aria-label="Slot map, one processor"><tr><th></th>${g.cols.map(c => `<th>${esc(c.label)}</th>`).join('')}</tr>${g.rows.map((rl, ri) => `<tr><th>${esc(rl)}</th>${g.cols.map(c => { const pos = c.pos[ri], k = pos === undefined ? null : m[pos]; return pos === undefined ? '<td class="na"></td>' : k ? `<td class="k${idx(k)}" title="${esc(r.slotName(0, pos))}: ${esc(r.part(k).short)}">${r.part(k).cap}</td>` : `<td title="${esc(r.slotName(0, pos))}: empty"></td>`; }).join('')}</tr>`).join('')}</table>`;
  }
  const legend = (r, keys) => `<span class="mpl">${keys.map((k, i) => `<span><i class="k${i}"></i>${esc(r.part(k).short)} <small>${esc(r.part(k).pid)}</small></span>`).join('')}</span>`;
  const keysOf = maps => [...new Set(maps.flat().filter(Boolean))];
  function stats(m, p) {
    const cap = p && !p.none ? (m.gb === p.need ? (p.exact ? 'exact' : 'least possible') : m.gb > p.need ? `+${m.gb - p.need} GB` : 'too little') : '';
    return `<dl class="mps"><div><dt>Capacity</dt><dd>${m.gb} GB${cap ? ` <small>${cap}</small>` : ''}</dd></div><div><dt>Speed</dt><dd>${m.speed} ${R().unit || 'MT/s'}</dd></div><div><dt>Channels</dt><dd>${m.used} of ${R().channels}${m.dimms ? ` <small>${m.even ? 'balanced' : 'unbalanced'}</small>` : ''}</dd></div><div><dt>Bandwidth</dt><dd>${bwTxt(m.bw)} <small>per ${R().cpuWord || 'processor'}</small></dd></div><div><dt>Free slots</dt><dd>${m.free}</dd></div></dl>`;
  }
  // why an option ranks where it does
  function why(r, o, p, kind) {
    const m = o.m, w = [];
    if (kind === 'best') w.push(m.full && m.even ? 'Every channel filled equally: full interleave, the best bandwidth for this capacity.' : m.even ? `Balanced over ${m.used} of ${r.channels} channels: no supported layout of ${p.need} GB fills them all equally.` : `Unbalanced, but no layout of ${p.need} GB does better.`);
    else if (kind === 'faster') w.push(`${m.gb - p.need} GB more than needed buys ${Math.round((m.bw / p.top - 1) * 100)} % more bandwidth${m.full && m.even ? ': every channel filled equally' : ''}.`);
    else {
      if (m.gb > p.need) w.push(`${m.gb - p.need} GB more than needed.`);
      if (m.bw < p.top * TOL) w.push(`${Math.round((1 - m.bw / p.top) * 100)} % less bandwidth than the best: ${!m.even ? 'unequal channels split the interleave' : m.used < r.channels ? `${r.channels - m.used} channel${r.channels - m.used > 1 ? 's' : ''} left empty` : `the memory runs at ${m.speed} ${r.unit || 'MT/s'}`}.`);
      else if (m.dimms > p.fewest && m.gb === p.need) w.push(`The same speed with ${m.dimms - p.fewest} more DIMMs.`);
    }
    const note = r.note && r.note(o.maps); if (note) w.push(note);
    return w.join(' ');
  }
  function optionHtml(r, o, p, kind, n, canUse) {
    const keys = keysOf(o.maps), per = counts(r, [o.map]).map(([, c]) => c).join(' + ');
    const badge = kind === 'best' ? '<b class="mpb best">Best</b>' : kind === 'faster' ? '<b class="mpb fast">Faster, more GB</b>' : `<b class="mpb">${n}</b>`;
    return `<article class="mpo ${kind}"><header>${badge}<h4>${esc(title(r, o.maps))}</h4><span class="per">${per} per ${r.cpuWord || 'processor'}</span></header>
      <div class="mpo-b"><div class="mpo-g">${grid(r, o.map, keys)}${legend(r, keys)}</div><div class="mpo-t">${stats(o.m, p)}<p class="mpw">${esc(where(r, o.map, o.maps.length))}.</p><p class="mpy">${esc(why(r, o, p, kind))}</p>${canUse ? `<p>${button('Order this layout', 'mpUse', o.sig, kind === 'best')}</p>` : ''}</div></div></article>`;
  }
  // the ranked list for a capacity
  function resultsHtml(r, p, canUse) {
    if (p.none) return `<p class="mpn">No supported layout reaches ${p.gb} GB with ${pl(p.cpus, 'processor')}: the most this server holds is ${p.max} GB.</p>`;
    // one card per set of parts (the same parts in another order of equal ranks score the same)
    const uniq = l => { const seen = new Set(); return l.filter(o => { const k = title(r, o.maps); if (seen.has(k)) return false; seen.add(k); return true; }); };
    const best = uniq(p.best), more = uniq(p.rest).slice(0, 5), hidden = p.count - best.length - more.length - p.faster.length;
    let h = `<p class="mpsum">${p.exact ? `${p.need} GB can be fitted exactly.` : `${p.gb} GB cannot be fitted exactly: the least a supported layout gives is <b>${p.need} GB</b>.`} ${pl(p.count, 'supported layout')} reach it with ${pl(p.cpus, 'processor')}. ${best.length > 1 ? `${best.length} layouts tie for best: any of them gets full marks.` : ''}</p>`;
    h += best.map(o => optionHtml(r, o, p, 'best', 0, canUse)).join('');
    if (more.length) h += `<h3>Also supported at ${p.need} GB</h3>` + more.map((o, i) => optionHtml(r, o, p, 'alt', i + 2, canUse)).join('');
    if (p.faster.length) h += `<h3>Faster, with more capacity than asked</h3>` + p.faster.map(o => optionHtml(r, o, p, 'faster', 0, canUse)).join('');
    if (hidden > 0) h += `<p class="mpn">${pl(hidden, 'more supported layout')} not shown: other part choices, or more capacity.</p>`;
    return h;
  }
  const factsHtml = (r, cpus) => `<dl class="mpf">${r.facts(cpus).map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>`;

  /* ---- the view ---- */
  function render(t) {
    const r = R(), s = st(t), d = lab(t), ex = exam(t), task = taskOf(t);
    let h = `<div class="mp cueable"><header class="mph"><div><h2>RAM Distributor</h2><p>${esc(r.server)}</p></div>${factsHtml(r, task.cpus)}</header>`;
    if (d) {
      const g = checked(t), sent = d.submitted;
      let ordHtml = '';
      // the order form
      const q = s.qty, rows = r.parts.map(p => { const v = q[p.key] === undefined ? (d.order && d.order[p.key]) || '' : q[p.key]; const no = r.allowed && !r.allowed(p.key);
        return `<tr><td class="pid">${esc(p.pid)}</td><td>${esc(p.name)}${!ex && no ? `<small class="no">${esc(r.allowedWhy(p.key))}</small>` : ''}</td><td>${esc(p.org)}</td><td><input type="number" min="0" max="${r.slots * r.cpus}" inputmode="numeric" data-field="mp.q.${p.key}" value="${esc(v)}" aria-label="Quantity of ${esc(p.pid)}"${sent ? ' disabled' : ''}></td></tr>`; }).join('');
      ordHtml = `<section class="mpord"><h3>Order the DIMMs</h3><table class="mpt"><tr><th>Part number</th><th>Description</th><th>Organization</th><th>Quantity</th></tr>${rows}</table><div class="mpa">${sent ? '' : button(d.order ? 'Change the order' : 'Place the order', 'mpOrder', '', !d.order)}${d.order ? `<span>Ordered: ${esc(counts(r, [Object.entries(d.order).flatMap(([k, n]) => Array(n).fill(k))]).map(([p, n]) => `${n} × ${p.pid}`).join(', '))}. ${kitEmpty(t) ? 'All fitted or none left.' : `${R().kitLeft(t)} not fitted yet: Memory view.`}</span>` : ''}</div></section>`;
      const woH = `<section class="mpwo"><div class="wo-n"><span>Work order</span><b>${esc(d.ref)}</b></div><div class="wo-b"><p class="wo-gb">At least <b>${d.gb} GB</b> of memory, ${pl(d.cpus, 'processor')} installed</p><p>${ex ? 'Exam: choose the part numbers and quantities, fit the DIMMs, then submit. The planner opens after you submit.' : 'Practice: the planner below lists every supported layout for this order, best first. Order one, fit it in the Memory view, then run the memory check.'}</p><p class="wo-r">Best = the least capacity that meets the order, then the fastest layout (memory bandwidth within 5 %), then the fewest DIMMs.</p></div></section>`;
      const chkH = sent ? '' : `<section class="mpchk"><h3>${ex ? 'Submit for the memory check' : 'Memory check'}</h3><p>${ex ? 'The memory check reads the DIMMs you fitted, as POST and the management controller will at the next power-on, and grades the layout. Submitting ends the exam.' : 'Reads the DIMMs you fitted, as POST and the management controller will at the next power-on, and says how the layout compares with the best one.'}</p><div class="mpa">${ex ? (d.confirm ? `<span class="warn">Submit now? The layout is locked after this.</span>${button('Yes, submit', 'mpSubmit', 'yes', true)}${button('Not yet', 'mpSubmit', 'no')}` : button('Submit for the memory check', 'mpSubmit', '', true)) : button('Run the memory check', 'mpCheck', '', true)}</div></section>`;
      const repH = g ? reportHtml(r, t, g) : '';
      const resH = ex && !sent ? '' : `<section class="mpres"><h3>${sent ? 'The layouts for this work order' : 'Planner: layouts for this work order'}</h3>${resultsHtml(r, g ? g.p : plan(r, d.cpus, d.gb), !ex && !sent)}</section>`;
      // exam: order, submit, then the result and the layouts; practice: the planner first, then order, check and the result
      h += woH + (ex ? ordHtml + chkH + repH + resH : resH + ordHtml + chkH + repH);
    } else {
      h += `<section class="mpin"><label>Capacity needed<span><input type="number" min="1" inputmode="numeric" data-field="mp.gb" data-enter="mpShow" value="${esc(s.gbIn || s.gb)}" aria-label="Capacity needed in GB"> GB</span></label><div class="mpc" role="group" aria-label="Processors installed"><span>Processors</span>${[1, 2].map(n => `<button class="btn${s.cpus === n ? ' pri' : ''}" data-act="mpCpus" data-arg="${n}" aria-pressed="${s.cpus === n}">${n}</button>`).join('')}</div>${button('Show layouts', 'mpShow', '', true)}</section>`;
      h += `<section class="mpres"><h3>Layouts for ${s.gb} GB, ${pl(s.cpus, 'processor')}</h3>${resultsHtml(r, plan(r, s.cpus, s.gb), false)}</section>`;
    }
    if (!ex && r.excludedNote) h += `<p class="mpx">${esc(r.excludedNote)}</p>`;
    return h + '</div>';
  }
  function reportHtml(r, t, g) {
    const d = t.rd, ex = d.exam, keys = keysOf(g.maps), m = g.m;
    const verdict = g.fail ? ['bad', 'Not supported', g.hard[0]] : g.best ? ['ok', 'Supported: the best layout for this order', 'Full marks for the plan.'] : ['mid', 'Supported, but not the best layout', ex ? `${g.penalty} points off the plan.` : 'A better layout exists: see below.'];
    let h = `<section class="mprep ${verdict[0]}"><h3>Memory check</h3><p class="v"><b>${esc(verdict[1])}</b> ${esc(verdict[2])}</p>`;
    if (m.dimms) h += `<div class="mpo-b"><div class="mpo-g">${g.maps.map((mm, c) => `<p class="cpu">${esc(r.cpuName(c))}</p>${grid(r, mm, keys)}`).join('')}${legend(r, keys)}</div><div class="mpo-t">${stats(m, g.p)}<p class="mpw">${esc(title(r, g.maps))}.</p></div></div>`;
    const items = [...g.hard.map(x => ['bad', x, ex ? 'fail' : '']), ...g.soft.map(x => ['mid', x.msg, ex ? `−${x.pts}` : ''])];
    if (!items.length) items.push(['ok', 'Meets the order with the least capacity needed, at the best bandwidth, with the fewest DIMMs.', '']);
    h += `<ul class="mpfind">${items.map(([c, x, pts]) => `<li class="${c}">${pts ? `<b>${esc(pts)}</b>` : ''}${esc(x)}</li>`).join('')}</ul>`;
    if (ex && d.submitted) { const sc = g.fail ? 0 : Math.max(0, 100 - 10 * t.errors - g.penalty); const off = [g.penalty ? `${g.penalty} for the plan` : '', t.errors ? `${10 * t.errors} for ${pl(t.errors, 'handling mistake')}` : ''].filter(Boolean).join(' and ');
      h += `<p class="mpscore">Score: <b>${sc}</b> of 100. ${g.fail ? 'An unsupported layout or too little capacity fails the exam.' : off ? `Points off: ${off}.` : 'No points off.'} Pass mark 70.</p>`; }
    if (d.why && (d.submitted || !ex)) h += `<p class="mpy"><b>About this work order:</b> ${esc(d.why)}</p>`;
    return h + '</section>';
  }
  function tray(t) {
    const r = R(), d = lab(t);
    if (exam(t)) return `<h2>Exam rules</h2><ul class="rules"><li>The planner, the cues and the memory hints are off until you submit.</li><li>An unsupported layout, or less capacity than the order asks for, fails.</li><li>A supported layout passes. Points off: 20 if a faster layout was possible at the needed capacity, 10 for more capacity than needed, 10 for more DIMMs than needed.</li><li>10 points off for each handling mistake. Pass mark 70.</li></ul>`;
    return `<h2>How the planner ranks</h2><ol class="rules"><li>At least the capacity asked for, and no more than the least a supported layout gives.</li><li>The highest memory bandwidth: layouts within 5 % count as equal.</li><li>The fewest DIMMs.</li></ol><p class="cap">Bandwidth is the theoretical peak per processor: interleaved channels × transfer rate × 8 bytes. Unequal channels split the memory into interleave regions, which lowers it.</p><h3>Rules for this server</h3><ul class="rules">${r.rules.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="cap" style="margin-top:6px">${esc(r.sources)}</p>${d ? '' : '<p class="cap">For a graded test, pick the RAM Distributor exam in the Lab menu.</p>'}`;
  }

  /* ---- actions and fields ---- */
  const toInt = v => { const n = parseInt(String(v).trim(), 10); return Number.isFinite(n) && n >= 0 ? n : NaN; };
  CORE.mpCpus = n => { st(T).cpus = +n === 1 ? 1 : 2; };
  CORE.mpShow = () => { const s = st(T), n = toInt(s.gbIn || s.gb); if (!n) return say('warn', 'Type the capacity needed, in GB.'); s.gb = n; s.gbIn = String(n); say('info', `Layouts for ${n} GB with ${pl(s.cpus, 'processor')}.`); };
  function place(order, pick) {
    const r = R(), d = T.rd, total = sum(Object.values(order));
    if (d.submitted) return say('info', 'The exam is submitted: the order is closed.');
    if (!total) return say('warn', 'Enter a quantity for at least one part number, then place the order.');
    r.deliver(T, order); d.order = order; d.pick = pick || null; d.snap = null; d.confirm = false;
    const room = r.slots * d.cpus, over = total > room ? ` That is more than the ${room} slots of ${pl(d.cpus, 'processor')}.` : '';
    const bad = !d.exam && r.parts.filter(p => order[p.key] && r.allowed && !r.allowed(p.key));
    say(bad && bad.length ? 'warn' : 'ok', `Order placed: ${counts(r, [Object.entries(order).flatMap(([k, n]) => Array(n).fill(k))]).map(([p, n]) => `${n} × ${p.pid} (${p.short})`).join(', ')}. The DIMMs are on the bench in their antistatic packaging: fit them in the Memory view.${over}${bad && bad.length ? ' ' + bad.map(p => r.allowedWhy(p.key)).join(' ') : ''}`);
  }
  CORE.mpOrder = () => {
    const r = R(), q = st(T).qty, order = {};
    for (const p of r.parts) { const raw = q[p.key] === undefined ? (T.rd.order && T.rd.order[p.key]) || 0 : q[p.key]; if (raw === '' || raw === undefined) continue; const n = toInt(raw); if (Number.isNaN(n)) return say('warn', `${p.pid}: the quantity must be a whole number.`); if (n) order[p.key] = n; }
    place(order);
  };
  CORE.mpUse = sig => {
    const r = R(), d = T.rd; if (!d || d.exam) return;
    const p = plan(r, d.cpus, d.gb), o = [...p.best, ...p.rest, ...p.bigger].find(x => x.sig === sig); if (!o) return;
    const order = orderOf(r, o.maps); st(T).qty = Object.fromEntries(r.parts.map(x => [x.key, order[x.key] ? String(order[x.key]) : '']));
    place(order, sig);
  };
  CORE.mpCheck = () => {
    const r = R(), d = T.rd; if (!d) return;
    d.snap = snapOf(r, T); const g = checked(T);
    say(g.fail ? 'warn' : 'ok', g.fail ? `Memory check: not supported. ${g.hard[0]}` : g.best ? `Memory check: ${g.m.gb} GB at ${g.m.speed} MT/s, the best layout for this order.` : `Memory check: supported, ${g.m.gb} GB at ${g.m.speed} MT/s, but a better layout exists: ${g.soft.map(x => x.msg).join(' ')}`);
  };
  CORE.mpSubmit = a => {
    const r = R(), d = T.rd; if (!d || !d.exam || d.submitted) return;
    if (a === 'no') { d.confirm = false; return; }
    if (a !== 'yes') { d.confirm = true; return say('info', 'Submit the layout for the memory check? The layout is locked after this.'); }
    d.snap = snapOf(r, T); d.submitted = true; d.confirm = false; const g = checked(T);
    T.grade = { penalty: g.penalty, fail: g.fail, why: g.fail ? g.hard[0] : g.soft.map(x => x.msg).join(' '), best: g.best };
    say(g.fail ? 'warn' : 'ok', g.fail ? `Submitted. Not supported: ${g.hard[0]}` : g.best ? 'Submitted: the best layout for this order.' : `Submitted: supported, ${g.penalty} points off the plan.`);
  };
  /* ---- the labs: a work order drawn at random from the model's tricky cases; practice (planner and cues) or exam ---- */
  const C = (act, arg, say) => ({ act, arg, say });
  const lastCase = {};
  const test = { k: null };   // tests: force a work order (index into the model's tasks)
  function draw(r, id) {
    const pool = r.tasks; let k = Math.floor(Math.random() * pool.length);
    if (test.k !== null && pool[test.k]) { lastCase[r.id + id] = test.k; return Object.assign({ k: test.k }, pool[test.k]); }
    if (pool.length > 1 && k === lastCase[r.id + id]) k = (k + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length;
    lastCase[r.id + id] = k; return Object.assign({ k }, pool[k]);
  }
  // the order the best layout needs, typed into the form one field at a time, then placed
  function orderCue(t) {
    const r = R(), d = t.rd, p = plan(r, d.cpus, d.gb), o = p.best[0]; if (!o) return null;
    const need = orderOf(r, o.maps), q = st(t).qty;
    for (const x of r.parts) { const want = need[x.key] ? String(need[x.key]) : '', cur = q[x.key] === undefined ? '' : String(q[x.key]).trim(); if (cur !== want && !(want === '' && (cur === '0'))) return { field: `mp.q.${x.key}`, value: want, say: `Type ${want || 'nothing'} for ${x.pid}.` }; }
    return C('mpOrder', '', 'Place the order.');
  }
  function labScenario(o) {
    const fv = o.fitView || 'mem';
    const steps = o.exam ? [
      { view: 'rdist', text: 'Order the DIMMs for the work order: part numbers and quantities', done: t => !!t.rd.order, cue: orderCue },
      { view: fv, text: 'Fit the DIMMs you ordered', done: t => t.rd.submitted || (!!t.rd.order && kitEmpty(t) && R().read(t).some(m => m.some(Boolean))), cue: t => o.fitCue(t, target(t)) },
      { view: 'rdist', text: 'Submit your layout for the memory check', done: t => !!t.rd.submitted, cue: t => C('mpSubmit', t.rd.confirm ? 'yes' : '', t.rd.confirm ? 'Confirm: submit the layout.' : 'Submit the layout for the memory check.') }]
    : [
      { view: 'rdist', text: 'Plan the memory for the work order and order a layout', hint: 'The planner lists every supported layout for the order, best first, and says why. "Order this layout" fills in the order.', done: t => !!t.rd.order,
        cue: t => { const p = plan(R(), t.rd.cpus, t.rd.gb), b = p.best[0]; return b ? C('mpUse', b.sig, `Order the best layout: ${title(R(), b.maps)}.`) : null; } },
      { view: fv, text: 'Fit the DIMMs in the slots of the plan', hint: o.fitHint, done: t => !gradeMaps(R(), R().read(t), t.rd).fail, cue: t => o.fitCue(t, target(t)) },
      { view: 'rdist', text: 'Run the memory check', hint: 'It reads the fitted DIMMs as POST and the management controller will, and compares the layout with the best one.', done: t => { const g = checked(t); return !!g && !g.fail; }, cue: () => C('mpCheck', '', 'Run the memory check.') }];
    return {
      id: o.id, title: o.title, exam: !!o.exam, start: 'rdist', steps,
      get intro() { const d = T && T.rd; const wo = d ? `Work order ${d.ref}: at least ${d.gb} GB of memory, with ${pl(d.cpus, 'processor')} installed. ` : '';
        return wo + (o.exam ? o.examIntro : o.practiceIntro); },
      setup() {
        const r = R(), k = draw(r, o.id), t = o.setup(k);
        t.rd = { gb: k.gb, cpus: k.cpus, why: k.why, ref: `RD-${String(k.gb).padStart(4, '0')}-${k.cpus}P`, exam: !!o.exam, order: null, pick: null, snap: null, submitted: false, confirm: false };
        t.mp = { gb: k.gb, gbIn: '', cpus: k.cpus, qty: {} };
        return t;
      }
    };
  }
  const field = (f, v) => { const s = st(T); if (f === 'mp.gb') s.gbIn = v; else if (f.startsWith('mp.q.')) s.qty[f.slice(5)] = v; };
  return { metrics, errors, all, plan, gradeMaps, checked, target, title, orderOf, counts, kitEmpty, examText, render, tray, field, st, exam, lab: labScenario, test, TOL, PTS,
    view: o => Object.assign({ render, tray, actions: () => [] }, o) };
})();
Sim.memRules = r => { REG().mem = r; };
