// RAM Distributor: every work order of every model, run by its cues in practice and in the exam (both must reach the best
// layout: practice "best", exam score 100), then hand-made layouts graded against each vendor's rules.
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
    const n = await p.evaluate(() => REG().mem.tasks.length);
    for (let k = 0; k < n; k++) for (const sc of ['ramdist', 'ramexam']) {
      await p.evaluate(([k, sc]) => { MemPlan.test.k = k; loadScenario(sc); }, [k, sc]);
      const r = await run();
      const res = await p.evaluate(() => { const g = MemPlan.checked(twin()); return { gb: twin().rd.gb, cpus: twin().rd.cpus, best: g && g.best, fail: g && g.fail, why: g ? [...g.hard, ...g.soft.map(s => s.msg)].join(' ') : '', grade: twin().grade, errors: twin().errors, title: g ? MemPlan.title(REG().mem, g.maps) : '' }; });
      ok(r === 'done' && res.best && !res.errors && (sc === 'ramdist' || (res.grade && !res.grade.fail && !res.grade.penalty)), `${m} ${sc} #${k} ${res.cpus}P ${res.gb} GB: ${r}, ${res.title}${res.why ? ' | ' + res.why : ''}`);
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
    push('HPE: 3 DIMMs per processor is not supported', g(2, 96, both(fill(16, [2, 9, 6], 'r32'))), 'fail');
    push('HPE: 8 in the wrong slots', g(2, 512, both(fill(16, [0, 1, 2, 3, 4, 5, 6, 7], 'r32'))), 'fail');
    push('HPE: 3DS with standard RDIMMs', g(2, 1280, both(mix('r128', 'r32'))), 'fail');
    push('HPE: x4 with x8 (32 GB 2Rx8 + 32 GB 1Rx4)', g(2, 1024, both(mix('r32', 'r32s'))), 'fail');
    push('HPE: mix the wrong way round (1R white, 2R black)', g(2, 768, both(mix('r16', 'r32'))), 'fail');
    push('HPE: mix with only 12 slots filled', g(2, 512, both((() => { const m = fill(16, H(12), 'r16'); H(8).forEach(i => { m[i] = 'r32'; }); return m; })())), 'fail');
    push('HPE: 96 GB with 4 per processor', g(2, 768, both(fill(16, H(4), 'r96'))), 'fail');
    push('HPE: 256 GB DIMMs in a 24 SFF chassis', g(2, 4096, both(fill(16, H(8), 'r256'))), 'fail');
    push('HPE: densities mixed (128 GB 2Rx4 32 Gb + 64 GB 2Rx4 16 Gb)', g(2, 3072, both(mix('r128r', 'r64'))), 'fail');
    push('HPE: unbalanced processors', g(2, 512, [fill(16, H(8), 'r32'), fill(16, H(4), 'r32')]), 'fail');
    push('HPE: less than the order', g(2, 1024, both(fill(16, H(8), 'r32'))), 'fail');
    push('HPE: DIMMs on processor 2 with one processor', g(1, 256, both(fill(16, H(8), 'r32'))), 'fail');
    push('HPE 1P 256: 8 x 32 GB is the best', g(1, 256, one(fill(16, H(8), 'r32'))), 'best');
    // Cisco (position = channel x 3 + slot - 1; order blue A..D, black, white)
    loadModel('cisco-c240-m4-lff', 'install');
    const O = [0, 3, 6, 9, 1, 4, 7, 10, 2, 5, 8, 11], CF = (n, rows) => { const m = Array(12).fill(null); O.slice(0, n).forEach((p, i) => { m[p] = rows[Math.floor(i / 4)]; }); return m; };
    push('Cisco 384: 32 GB blue + 16 GB black is the best', g(2, 384, both(CF(8, ['r32', 'r16']))), 'best');
    push('Cisco 384: 24 x 16 GB 1R (3 per channel) needs more DIMMs', g(2, 384, both(CF(12, ['r16s', 'r16s', 'r16s']))), 10);
    push('Cisco 384: 24 x 16 GB 2R is slower (1866 MHz)', g(2, 384, both(CF(12, ['r16', 'r16', 'r16']))), 20);
    push('Cisco 768: 24 x 32 GB RDIMM is slower than the LRDIMM', g(2, 768, both(CF(12, ['r32', 'r32', 'r32']))), 20);
    push('Cisco 768: 24 x 32 GB LRDIMM is the best', g(2, 768, both(CF(12, ['l32', 'l32', 'l32']))), 'best');
    push('Cisco: RDIMM with LRDIMM', g(2, 384, both(CF(8, ['l32', 'r16']))), 'fail');
    push('Cisco: fewer ranks in front (1R blue, 2R black)', g(2, 384, both(CF(8, ['r16s', 'r32']))), 'fail');
    push('Cisco: two LRDIMM sizes', g(2, 768, both(CF(8, ['l64', 'l32']))), 'fail');
    push('Cisco: out of order (A2 without B1)', g(2, 64, both((() => { const m = Array(12).fill(null); m[0] = 'r16'; m[1] = 'r16'; return m; })())), 'fail');
    push('Cisco: CPUs not identical', g(2, 256, [CF(4, ['r32']), CF(4, ['l32'])]), 'fail');
    push('Cisco 512: 16 x 32 GB is as fast but needs more DIMMs', g(2, 512, both(CF(8, ['r32', 'r32']))), 10);
    push('Cisco 1000 GB: 24 x 64 GB is more than needed, and slower (3 per channel)', g(2, 1000, both(CF(12, ['l64', 'l64', 'l64']))), 30);
    return out;
  });
  cases.forEach(c => ok(c.exp === 'best' ? c.best : c.exp === 'fail' ? c.fail : !c.fail && c.pen === c.exp, `${c.name}: ${c.fail ? 'fail' : c.best ? 'best' : '-' + c.pen}${c.msg ? ' | ' + c.msg : ''}`));
  ok(!errs.length, errs.length ? 'page errors ' + JSON.stringify(errs) : 'no page errors');
  await b.close(); process.exit(fails ? 1 : 0);
})();
