// Runs every scenario of every model by following its cues (the "Click here" targets), and reports what is left.
// Usage: node tests/cue-run.js [dist/index.html]
const { chromium } = require('playwright'), path = require('path');
const FILE = 'file://' + path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist', 'index.html'));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  await p.addInitScript(() => { try { localStorage.setItem('sbt.tour', 'seen'); } catch (e) { } });   // the first-visit tour stays closed (tests/tour.js covers it)
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(FILE);
  const models = await p.evaluate(() => Sim.modelOrder);
  let bad = 0;
  for (const m of models) {
    await p.selectOption('#model', m);
    const scns = await p.evaluate(() => Object.keys(Sim.scenarios));
    for (const sc of scns) {
    if (process.env.ONLY && !process.env.ONLY.split(',').includes(sc)) continue;   // ONLY=os-esxi,install runs just those labs
      await p.selectOption('#scn', sc); await p.evaluate(() => { Math.random = () => 0.1; });
      // an exam runs with guidance off: its cues are followed but, by design, not shown
      const exam = await p.evaluate(() => !!Sim.scenarios[Sim.scenario].exam);
      const missing = []; let guard = 0;
      while (guard++ < 4000) {
        const st = await p.evaluate(() => {
          const steps = Sim.scenarios[Sim.scenario].steps, t = twin(), idx = steps.findIndex(s => !s.done(t));
          if (idx < 0) return { idx };
          const s = steps[idx];
          if (Sim.view !== s.view) { const navCue = !!document.querySelector('#nav button.cue'); Sim.do('go', s.view); return { idx, moved: true, navCue }; }
          const cue = s.cue ? s.cue(t) : null;
          if (cue && cue.field) { const el = document.querySelector(`#stage [data-field="${cue.field}"]`); if (!el) return { idx, wait: true }; const shown = el.classList.contains('cue'); el.value = cue.value; el.dispatchEvent(new Event('input', { bubbles: true })); Sim.do('go', Sim.view); return { idx, field: cue.field, shown }; }
          const shown = !!document.querySelector('#stage .cuering, #acts .cue, #tray .cue, #stage .cueable .cue');
          if (cue && cue.act && !shown && !window.__retry) { window.__retry = 1; return { idx, wait: true }; }
          window.__retry = 0;
          if (cue && cue.act) { Sim.do(cue.act, cue.arg === undefined ? '' : String(cue.arg)); return { idx, act: cue.act, arg: cue.arg, shown }; }
          const ans = window.pack && pack.testAnswer && pack.testAnswer(t);
          if (ans) { Sim.do(ans[0], ans[1]); return { idx }; }
          return { idx, wait: true };
        });
        if (st.idx < 0) break;
        if (!exam && st.moved && !st.navCue) missing.push('nav@' + st.idx);
        if (!exam && (st.act || st.field) && !st.shown) missing.push(`${st.act || st.field}:${st.arg}@${st.idx}`);
        if (st.wait) await p.waitForTimeout(400);
      }
      const r = await p.evaluate(() => { const s = Sim.scenarios[Sim.scenario].steps.map(x => !!x.done(twin())); return { done: s.filter(Boolean).length, total: s.length, errors: twin().errors }; });
      const okRun = r.done === r.total && r.errors === 0 && !missing.length; if (!okRun) bad++;
      console.log(`${okRun ? 'PASS' : 'FAIL'} ${m} / ${sc}${exam ? ' (exam, cues hidden)' : ''}: ${r.done}/${r.total} steps, ${r.errors} mistakes${missing.length ? ', cue not shown: ' + missing.join(' ') : ''}`);
    }
  }
  console.log(errs.length ? 'page errors: ' + JSON.stringify(errs) : 'no page errors'); if (errs.length) bad++;
  await b.close(); process.exit(bad ? 1 : 0);
})();
