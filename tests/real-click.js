// Real-click run of every scenario of every model: each cued target is clicked with the mouse at its centre, as a user would.
// Usage: node tests/real-click.js [dist/index.html]
// Reports targets whose centre is covered by another element (the click would miss) and steps that stall.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist', 'index.html'));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(FILE);
  const models = await p.evaluate(() => Sim.modelOrder); let bad = 0;
  for (const m of models) {
  await p.selectOption('#model', m);
  const scns = await p.evaluate(() => Object.keys(Sim.scenarios));
  for (const sc of scns) {
    if (process.env.ONLY && !process.env.ONLY.split(',').includes(sc)) continue;   // ONLY=os-esxi,install runs just those labs
    await p.selectOption('#scn', sc); await p.evaluate(() => { Math.random = () => 0.1; });
    const covered = new Set(); let guard = 0, clicks = 0, last = '', same = 0, stall = null;
    while (guard++ < 4000) {
      const st = await p.evaluate(() => {
        const steps = Sim.scenarios[Sim.scenario].steps, t = twin(), idx = steps.findIndex(s => !s.done(t));
        if (idx < 0) return { idx };
        const s = steps[idx];
        if (Sim.view !== s.view) return { idx, sel: `#nav [data-act="go"][data-arg="${s.view}"]` };
        const cue = s.cue ? s.cue(t) : null;
        if (cue && cue.field) return { idx, field: cue.field, value: cue.value };
        const ans = window.pack && pack.testAnswer && pack.testAnswer(t);
        if (ans) return { idx, answer: ans };
        if (!cue || !cue.act) return { idx, wait: true };
        const q = `[data-act="${cue.act}"][data-arg="${cue.arg === undefined ? '' : cue.arg}"]`;
        return { idx, q, act: cue.act, arg: cue.arg };
      });
      if (st.idx < 0) break;
      // a stall: the same step asking for the same click again and again (a step may take many different clicks)
      const sig = `${st.idx}|${st.sel || st.q || st.field || ''}|${st.value || ''}|${st.wait ? 'wait' : ''}`;
      if (sig === last) same++; else { same = 0; last = sig; }
      // waiting is allowed longer: a server's POST, an installer's progress and an OS boot take a while
      if (same > (st.wait ? 400 : 40)) { stall = st; break; }
      if (st.wait) { await p.waitForTimeout(350); continue; }
      if (st.field) { const loc = p.locator(`#stage [data-field="${st.field}"]`).first(); await loc.fill(String(st.value)); continue; }
      if (st.answer) { await p.evaluate(a => Sim.do(a[0], a[1]), st.answer); continue; }
      const sel = st.sel || st.q;
      // prefer the picture target (its .zone child), then the tray, then the action buttons
      const target = await p.evaluate(sel => {
        const cands = [...document.querySelectorAll(`#stage svg ${sel}`), ...document.querySelectorAll(`#tray ${sel}`), ...document.querySelectorAll(`#acts ${sel}`), ...document.querySelectorAll(`#stage ${sel}`), ...document.querySelectorAll(sel)];
        for (const c of cands) {
          const z = (c.querySelector && c.querySelector('.zone')) || c; z.scrollIntoView({ block: 'center' });
          const r = z.getBoundingClientRect(); if (!r.width || !r.height) continue;
          const x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y);
          const ok = top && (top === c || c.contains(top) || (top.closest && top.closest('[data-act]') === c));
          const hit = top && top.closest && top.closest('[data-act]');
          return { x, y, ok, where: c.closest('#tray') ? 'tray' : c.closest('#acts') ? 'acts' : c.closest('#nav') ? 'nav' : 'stage', top: top ? top.tagName + (top.getAttribute('class') ? '.' + top.getAttribute('class') : '') + (hit ? ` [${hit.dataset.act}]` : '') : null };
        }
        return null;
      }, sel);
      if (!target) { await p.waitForTimeout(350); continue; }
      if (!target.ok) covered.add(`${st.act || 'nav'}:${st.arg === undefined ? '' : st.arg} on ${target.where}, covered by ${target.top}`);
      if (target.ok) await p.mouse.click(target.x, target.y); else await p.evaluate(sel => { const el = document.querySelector(`#stage svg ${sel}`) || document.querySelector(sel); el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }, sel);
      clicks++;
    }
    const res = await p.evaluate(() => { const s = Sim.scenarios[Sim.scenario].steps.map(x => !!x.done(twin())); return { done: s.filter(Boolean).length, total: s.length, errors: twin().errors }; });
    const okRun = res.done === res.total && res.errors === 0 && !stall && !covered.size; if (!okRun) bad++;
    console.log(`${okRun ? 'PASS' : 'FAIL'} ${m} / ${sc}: ${res.done}/${res.total} steps, ${res.errors} mistakes, ${clicks} clicks` + (stall ? ' STALL ' + JSON.stringify(stall) : '') + (covered.size ? '\n   covered: ' + [...covered].join('\n   covered: ') : ''));
  }
  }
  console.log(errs.length ? 'page errors: ' + JSON.stringify(errs) : 'no page errors'); if (errs.length) bad++;
  await b.close(); process.exit(bad ? 1 : 0);
})();
