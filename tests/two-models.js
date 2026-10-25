// Builds the template pack (docs/template-model) next to the real models and checks that switching models
// keeps views, scenarios, state, timers and listeners apart, and that ?model= links work.
// Usage: node tests/two-models.js
const { chromium } = require('playwright'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..'), out = path.join(os.tmpdir(), 'sim-two-models.html');
execFileSync('node', [path.join(root, 'build.js'), out], { env: Object.assign({}, process.env, { BUILD_EXTRA_MODELS: path.join(root, 'docs', 'template-model') }), stdio: 'inherit' });
const FILE = 'file://' + out, TPL = 'template-model';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  await p.addInitScript(() => { try { localStorage.setItem('sbt.tour', 'seen'); } catch (e) { } });   // the first-visit tour stays closed (tests/tour.js covers it)
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
  await p.goto(FILE); await p.waitForTimeout(400);
  let r = await p.evaluate(() => ({ models: [...document.querySelectorAll('#model option')].map(o => o.value), order: Sim.modelOrder, model: Sim.model }));
  const first = r.order[0];
  ok(r.models.join() === r.order.join() && r.models.includes(TPL), 'menu lists every model: ' + r.models.join(', '));
  ok(r.model === first, 'first model active at start: ' + first);
  const firstViews = await p.evaluate(() => Sim.order.slice());
  await p.selectOption('#model', TPL); await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ model: Sim.model, nav: [...document.querySelectorAll('#nav button')].length, order: Sim.order, scn: [...document.querySelectorAll('#scn option')].map(o => o.value), lamp: 'lamp' in twin() }));
  ok(r.model === TPL && r.nav === r.order.length && r.scn.join() === 'demo' && r.lamp, `template active: ${r.nav} view(s), scenarios ${r.scn.join()}`);
  ok(!r.order.some(v => firstViews.includes(v)), 'no views of the first model in the template menu');
  const z = await p.$('#stage svg [data-act="lamp"] .zone'); await z.click(); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { window.__tpl = twin(); return { lamp: twin().lamp, ticks: twin().ticks, prog: document.querySelector('#progtxt').textContent }; });
  ok(r.lamp && r.ticks >= 3 && /1 of 1/.test(r.prog), `template click, timer and progress: ${r.ticks} ticks, "${r.prog}"`);
  await p.selectOption('#model', first); await p.waitForTimeout(1200);
  r = await p.evaluate(() => ({ model: Sim.model, order: Sim.order, frozen: window.__tpl.ticks, lamp: 'lamp' in twin() }));
  const ticksThen = r.frozen; await p.waitForTimeout(800);
  const ticksLater = await p.evaluate(() => window.__tpl.ticks);
  ok(r.model === first && r.order.join() === firstViews.join() && !r.lamp, 'back on the first model with its own views and state');
  ok(ticksLater === ticksThen, 'template timer stops while another model is active');
  // the first model's default scenario still runs to the end by its cues
  for (let i = 0; i < 1200; i++) {
    const s = await p.evaluate(() => { const st = Sim.scenarios[Sim.scenario].steps, t = twin(), k = st.findIndex(x => !x.done(t)); if (k < 0) return 'done'; const x = st[k]; if (Sim.view !== x.view) { Sim.do('go', x.view); return 'go'; } const c = x.cue && x.cue(t); if (c && c.field) { const el = document.querySelector(`#stage [data-field="${c.field}"]`); if (el) { el.value = c.value; el.dispatchEvent(new Event('input', { bubbles: true })); Sim.do('go', Sim.view); return 'field'; } return 'wait'; } if (c && c.act) { Sim.do(c.act, c.arg === undefined ? '' : String(c.arg)); return 'act'; } const a = window.pack && pack.testAnswer && pack.testAnswer(t); if (a) { Sim.do(a[0], a[1]); return 'ans'; } return 'wait'; });
    if (s === 'done') break; if (s === 'wait') await p.waitForTimeout(350);
  }
  r = await p.evaluate(() => ({ sc: Sim.scenario, done: Sim.scenarios[Sim.scenario].steps.every(x => x.done(twin())), errors: twin().errors }));
  ok(r.done && r.errors === 0, `first model's "${r.sc}" scenario completes after switching back`);
  await p.goto(FILE + '?model=' + TPL); await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ model: Sim.model, sel: document.querySelector('#model').value })); ok(r.model === TPL && r.sel === TPL, '?model= opens that model');
  await p.goto(FILE + '?model=unknown'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => Sim.model) === first, 'an unknown ?model falls back to the first model');
  ok(!errs.length, errs.length ? 'page errors ' + JSON.stringify(errs) : 'no page errors');
  await b.close(); process.exit(fails ? 1 : 0);
})();
