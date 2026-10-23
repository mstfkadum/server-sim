// RAM Distributor: the practice by its cues for every processor count and DIMM size (the vendor's layout, verified
// correct), every exam work order of every model by its cues (the best layout, score 100), hand-made layouts graded
// against each vendor's rules, then the board in the planner: the memory list, the buttons, the manual placement and
// the one "next" marker.
// Usage: node tests/ram-distributor.js [dist/index.html]
const { chromium } = require('playwright'), path = require('path');
const FILE = 'file://' + path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist', 'index.html'));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
  await p.goto(FILE);
  const run = () => p.evaluate(async () => {
    for (let n = 0; n < 900; n++) {
      const st = Sim.scenarios[Sim.scenario].steps, t = twin(), i = st.findIndex(x => !x.done(t)); if (i < 0) return 'done';
      const x = st[i]; if (Sim.view !== x.view) { Sim.do('go', x.view); continue; }
      const c = x.cue && x.cue(t); if (!c) return 'stuck at step ' + (i + 1);
      if (c.field) { const el = document.querySelector(`#stage [data-field="${c.field}"]`); if (!el) return 'no field ' + c.field; el.value = c.value; el.dispatchEvent(new Event('input', { bubbles: true })); Sim.do('go', Sim.view); continue; }
      if (!c.act) return 'no action at step ' + (i + 1) + ': ' + c.say;
      Sim.do(c.act, c.arg === undefined ? '' : String(c.arg));
    }
    return 'too many actions';
  });
  for (const m of await p.evaluate(() => Sim.modelOrder)) {
    await p.selectOption('#model', m);
    // practice: every processor count and DIMM size, the setup and the placement by the cues, then a correct verify
    for (const cpus of [1, 2]) for (const part of await p.evaluate(() => REG().mem.parts.map(x => x.key))) {
      await p.evaluate(([cpus, part]) => { loadScenario('ramdist'); Sim.do('mpCpus', String(cpus)); Sim.do('mpPart', part); }, [cpus, part]);
      const r = await run();
      const res = await p.evaluate(() => { const g = MemPlan.checked(twin()), s = twin().mp; return { gb: s.gb, ok: g && g.ok, errors: twin().errors, title: g ? MemPlan.title(REG().mem, g.goal.slice(0, s.cpus)) : '' }; });
      ok(r === 'done' && res.ok && !res.errors, `${m} ramdist ${cpus}P ${part}: ${res.gb} GB ${r}, ${res.title}`);
    }
    const n = await p.evaluate(() => REG().mem.tasks.length);
    for (let k = 0; k < n; k++) {
      await p.evaluate(k => { MemPlan.test.k = k; loadScenario('ramexam'); }, k);
      const r = await run();
      const res = await p.evaluate(() => { const g = MemPlan.checked(twin()); return { gb: twin().rd.gb, cpus: twin().rd.cpus, best: g && g.best, why: g ? [...g.hard, ...g.soft.map(s => s.msg)].join(' ') : '', grade: twin().grade, errors: twin().errors, title: g ? MemPlan.title(REG().mem, g.maps) : '' }; });
      ok(r === 'done' && res.best && !res.errors && res.grade && !res.grade.fail && !res.grade.penalty, `${m} ramexam #${k} ${res.cpus}P ${res.gb} GB: ${r}, ${res.title}${res.why ? ' | ' + res.why : ''}`);
    }
  }
  await p.evaluate(() => { MemPlan.test.k = null; });
  // hand-made layouts against the rules: [model, cpus, gb, maps as {slotPositions: part}, expect]
  const cases = await p.evaluate(() => {
    const out = [], g = (cpus, gb, maps) => MemPlan.gradeMaps(REG().mem, maps, { cpus, gb });
    const fill = (len, pos, k) => { const m = Array(len).fill(null); pos.forEach(i => { m[i] = k; }); return m; };
    const both = m => [m, m.slice()], one = m => [m, Array(m.length).fill(null)];
    // HPE (slot n is position n - 1); slots per count from HPE's table
    loadModel('hpe-dl380-gen11-sff', 'install');
    const H = n => ({ 1: [10], 2: [3, 10], 4: [3, 7, 10, 14], 6: [3, 5, 7, 10, 14, 16], 8: [1, 3, 5, 7, 10, 12, 14, 16], 12: [1, 2, 3, 5, 6, 7, 10, 11, 12, 14, 15, 16], 16: [...Array(16).keys()].map(i => i + 1) }[n]).map(x => x - 1);
    const W = [...Array(16).keys()].filter(i => (i + 1 <= 8 ? (i + 1) % 2 === 1 : (i + 1) % 2 === 0));
    const mix = (w, b) => Array.from({ length: 16 }, (_, i) => W.includes(i) ? w : b);
    const push = (name, r, exp) => out.push({ name, fail: r.fail, pen: r.penalty, best: r.best, exp, msg: [...r.hard, ...r.soft.map(s => s.msg)].join(' ') });
    push('HPE 768: the 32+16 mix is the best', g(2, 768, both(mix('r32', 'r16'))), 'best');
    push('HPE 768: 24 x 32 GB 2Rx8 (12 per CPU) is slower', g(2, 768, both(fill(16, H(12), 'r32'))), 20);
    push('HPE 768: 16 x 64 GB is more than needed (faster)', g(2, 768, both(fill(16, H(8), 'r64'))), 10);
    push('HPE 384: 24 x 16 GB needs more DIMMs', g(2, 384, both(fill(16, H(12), 'r16'))), 10);
    push('HPE 1024: 32 x 32 GB (two per channel) is slower', g(2, 1024, both(fill(16, H(16), 'r32'))), 20);
    push('HPE: 3 DIMMs per processor is not supported', g(2, 96, both(fill(16, [2, 9, 6], 'r32'))), 'fail');
    push('HPE: 8 in the wrong slots', g(2, 512, both(fill(16, [0, 1, 2, 3, 4, 5, 6, 7], 'r32'))), 'fail');
    push('HPE: x4 with x8 (32 GB 2Rx8 + 64 GB 2Rx4)', g(2, 1536, both(mix('r32', 'r64'))), 'fail');
    push('HPE: mix the wrong way round (1R white, 2R black)', g(2, 768, both(mix('r16', 'r32'))), 'fail');
    push('HPE: mix with only 12 slots filled', g(2, 512, both((() => { const m = fill(16, H(12), 'r16'); H(8).forEach(i => { m[i] = 'r32'; }); return m; })())), 'fail');
    push('HPE: unbalanced processors', g(2, 512, [fill(16, H(8), 'r32'), fill(16, H(4), 'r32')]), 'fail');
    push('HPE: less than the order', g(2, 1024, both(fill(16, H(8), 'r32'))), 'fail');
    push('HPE: DIMMs on processor 2 with one processor', g(1, 256, both(fill(16, H(8), 'r32'))), 'fail');
    push('HPE 1P 256: 8 x 32 GB is the best', g(1, 256, one(fill(16, H(8), 'r32'))), 'best');
    // Cisco (position = channel x 3 + slot - 1; order blue A..D, black, white)
    loadModel('cisco-c240-m4-lff', 'install');
    const O = [0, 3, 6, 9, 1, 4, 7, 10, 2, 5, 8, 11], CF = (n, rows) => { const m = Array(12).fill(null); O.slice(0, n).forEach((p, i) => { m[p] = rows[Math.floor(i / 4)]; }); return m; };
    push('Cisco 384: 32 GB blue + 16 GB black is the best', g(2, 384, both(CF(8, ['r32', 'r16']))), 'best');
    push('Cisco 384: 24 x 16 GB (3 per channel, 1866 MHz) is slower', g(2, 384, both(CF(12, ['r16', 'r16', 'r16']))), 20);
    push('Cisco 384: 12 x 32 GB (unequal channels) is slower', g(2, 384, both(CF(6, ['r32', 'r32']))), 20);
    push('Cisco 768: 24 x 32 GB RDIMM is slower than the LRDIMM', g(2, 768, both(CF(12, ['r32', 'r32', 'r32']))), 20);
    push('Cisco 768: 12 x 64 GB LRDIMM is the best', g(2, 768, both(CF(6, ['l64', 'l64']))), 'best');
    push('Cisco: RDIMM with LRDIMM', g(2, 384, both(CF(8, ['l64', 'r16']))), 'fail');
    push('Cisco: out of order (A2 without B1)', g(2, 64, both((() => { const m = Array(12).fill(null); m[0] = 'r16'; m[1] = 'r16'; return m; })())), 'fail');
    push('Cisco: CPUs not identical', g(2, 192, [CF(4, ['r32']), CF(4, ['r16'])]), 'fail');
    push('Cisco 512: 16 x 32 GB is as fast but needs more DIMMs', g(2, 512, both(CF(8, ['r32', 'r32']))), 10);
    push('Cisco 1000 GB: 24 x 64 GB is more than needed, and slower (3 per channel)', g(2, 1000, both(CF(12, ['l64', 'l64', 'l64']))), 30);
    return out;
  });
  cases.forEach(c => ok(c.exp === 'best' ? c.best : c.exp === 'fail' ? c.fail : !c.fail && c.pen === c.exp, `${c.name}: ${c.fail ? 'fail' : c.best ? 'best' : '-' + c.pen}${c.msg ? ' | ' + c.msg : ''}`));
  // the board in the planner (the RAM Distributor of a lab that is not a RAM lab): the setup, its buttons, the manual
  // placement and the one "next" marker
  for (const m of await p.evaluate(() => Sim.modelOrder)) {
    const r = await p.evaluate(m => {
      loadModel(m, 'install'); Sim.guide = true; Sim.do('go', 'rdist'); const R = REG().mem, t = twin(), out = {}, n = b => b.flat().filter(Boolean).length;
      const pick = gb => { const el = document.querySelector('#stage [data-field="mp.sel"]'); el.value = String(gb); el.dispatchEvent(new Event('input', { bubbles: true })); Sim.do('go', 'rdist'); };
      out.slots = document.querySelectorAll('#stage svg [data-act="mpSlot"]').length === R.cpus * R.slots;
      // the memory list: every size offered builds a supported layout with the chosen DIMM, and nothing else is offered
      out.choices = R.parts.every(p => [1, 2].every(c => { Sim.do('mpCpus', String(c)); Sim.do('mpPart', p.key);
        const os = [...document.querySelectorAll('#stage [data-field="mp.sel"] option')].map(o => +o.value).filter(Boolean), ch = MemPlan.choices(R, c, p.key);
        return os.join() === ch.map(x => x.gb).join() && ch.every(x => !MemPlan.errors(R, [0, 1].map(k => k < c ? R.fill.reduce((mm, pos, i) => { if (i < x.n) mm[pos] = p.key; return mm; }, Array(R.slots).fill(null)) : Array(R.slots).fill(null)), c).length); }));
      Sim.do('mpCpus', '2'); Sim.do('mpPart', R.parts[1].key); const o = MemPlan.choices(R, 2, R.parts[1].key).find(x => x.n === R.channels); pick(o.gb);
      out.select = t.mp.gb === o.gb;
      Sim.do('mpDist'); out.dist = JSON.stringify(t.mp.board) === JSON.stringify(MemPlan.target(t));
      Sim.do('mpVerify'); const g = MemPlan.checked(t); out.verify = !!g && g.ok;
      Sim.do('mpClear'); out.clear = n(t.mp.board) === 0 && !MemPlan.checked(t);
      // one "next" marker only, also when one processor is ahead of the other
      R.fill.slice(0, 2).forEach(pos => Sim.do('mpSlot', `0:${pos}`));
      out.oneNext = (document.querySelector('#stage .mpsvg').innerHTML.match(/stroke-dasharray="7 4"/g) || []).length === 1;
      Sim.do('mpClear'); Sim.do('mpCpus', '1'); out.oneCpu = !!t.mp.gb === MemPlan.choices(R, 1, t.mp.part).some(x => x.gb === o.gb);
      Sim.do('mpCpus', '2'); pick(o.gb); Sim.do('mpDist'); Sim.do('mpCpus', '1'); out.oneClears = n(t.mp.board.slice(1)) === 0; Sim.do('mpCpus', '2'); Sim.do('mpClear');
      // a random exam: Distribute is off until verified; the best layout placed by hand scores 100
      Sim.do('mpExam'); const w = t.mp.wo; Sim.do('mpDist'); out.examNoDist = !!w && n(t.mp.board) === 0;
      const goal = MemPlan.target(t); goal.forEach((mm, c) => R.fill.forEach(pos => { if (mm[pos]) { Sim.do('mpPart', mm[pos]); Sim.do('mpSlot', `${c}:${pos}`); } }));
      Sim.do('mpVerify'); const e = MemPlan.checked(t); out.exam = !!e && e.best && w.submitted && /Score: <b>100<\/b>/.test(document.querySelector('#stage').innerHTML);
      Sim.do('mpDist'); out.distAfter = n(t.mp.board) > 0;
      // a click on a fitted slot with the same size takes it out; with another size, replaces it
      Sim.do('mpExamEnd'); Sim.do('mpClear'); const p0 = R.fill[0];
      Sim.do('mpPart', R.parts[0].key); Sim.do('mpSlot', `0:${p0}`); Sim.do('mpPart', R.parts[1].key); Sim.do('mpSlot', `0:${p0}`); out.replace = t.mp.board[0][p0] === R.parts[1].key;
      Sim.do('mpSlot', `0:${p0}`); out.remove = t.mp.board[0][p0] === null && !t.mp.wo;
      return out;
    }, m);
    Object.entries(r).forEach(([k, v]) => ok(v, `${m} board: ${k}`));
  }
  ok(!errs.length, errs.length ? 'page errors ' + JSON.stringify(errs) : 'no page errors');
  await b.close(); process.exit(fails ? 1 : 0);
})();
