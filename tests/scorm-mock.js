// Runs the SCORM 1.2 build inside a mock learning platform (a parent page that provides window.API, like Moodle's
// SCORM player) and checks graded, practice, failed-then-passed and resumed runs.
// Usage: node tests/scorm-mock.js [scorm package folder or zip]   (default: builds dist/scorm and uses the all-labs zip)
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), http = require('http'), os = require('os'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
let dir = process.argv[2];
if (!dir || dir.endsWith('.zip')) {
  let zipFile = dir;
  if (!zipFile) { execFileSync('node', [path.join(root, 'build-scorm.js'), path.join(os.tmpdir(), 'sbt-scorm')], { stdio: 'inherit' }); zipFile = fs.readdirSync(path.join(os.tmpdir(), 'sbt-scorm')).filter(f => f.endsWith('-all-labs.zip')).map(f => path.join(os.tmpdir(), 'sbt-scorm', f))[0]; }
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sbt-pkg-')); execFileSync('unzip', ['-q', zipFile, '-d', dir]);
}
const manifest = fs.readFileSync(path.join(dir, 'imsmanifest.xml'), 'utf8');
const launches = [...manifest.matchAll(/adlcp:scormtype="sco" href="([^"]+)"/g)].map(m => m[1].replace(/&amp;/g, '&'));
const launchOf = sc => launches.find(h => h.includes('scenario=' + sc + '&'));
const HARNESS = `<!DOCTYPE html><html><body style="margin:0"><script>
window.__data = {}; window.__calls = [];
const save = () => {};
window.API = {
  LMSInitialize: () => { __calls.push('LMSInitialize'); return 'true'; },
  LMSGetValue: k => (k in __data ? __data[k] : ''),
  LMSSetValue: (k, v) => { __data[k] = String(v); __calls.push('set ' + k); return 'true'; },
  LMSCommit: () => { __calls.push('LMSCommit'); return 'true'; },
  LMSFinish: () => { __calls.push('LMSFinish'); return 'true'; },
  LMSGetLastError: () => '0', LMSGetErrorString: () => 'No error', LMSGetDiagnostic: () => ''
};
// what a platform does between sessions: a suspended exit makes the next entry a resume
window.start = (href) => { const old = document.querySelector('iframe'); if (old) old.remove();
  __data['cmi.core.entry'] = __data['cmi.core.exit'] === 'suspend' ? 'resume' : (__data['cmi.core.lesson_status'] ? '' : 'ab-initio');
  const f = document.createElement('iframe'); f.src = href; f.style.cssText = 'width:1400px;height:1000px;border:0'; document.body.appendChild(f); };
window.stop = () => { const f = document.querySelector('iframe'); if (f) f.remove(); };
</script></body></html>`;
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/harness.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(HARNESS); }
  const f = path.join(dir, u); if (!f.startsWith(dir) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1420, height: 1020 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
  await p.goto(BASE + 'harness.html');
  const frame = async () => { for (let i = 0; i < 50; i++) { const f = p.frames().find(x => x !== p.mainFrame()); if (f) { try { if (await f.evaluate(() => !!(window.Sim && window.twin && twin()))) return f; } catch (e) { } } await p.waitForTimeout(100); } throw new Error('SCO did not start'); };
  const data = () => p.evaluate(() => Object.assign({}, __data));
  const open = async sc => { await p.evaluate(h => start(h), launchOf(sc)); const f = await frame(); await p.waitForTimeout(200); return f; };
  // follow the cues for n steps (all if n is omitted)
  const run = async (f, n = 1e9) => {
    for (let i = 0; i < 2000; i++) {
      const s = await f.evaluate(() => { const st = Sim.scenarios[Sim.scenario].steps, t = twin(), k = st.findIndex(x => !x.done(t)); if (k < 0) return 'done'; const x = st[k]; if (Sim.view !== x.view) { Sim.do('go', x.view); return 'go'; } const c = x.cue && x.cue(t); if (c && c.field) { const el = document.querySelector(`#stage [data-field="${c.field}"]`); if (el) { el.value = c.value; el.dispatchEvent(new Event('input', { bubbles: true })); Sim.do('go', Sim.view); return 'field'; } return 'wait'; } if (c && c.act) { Sim.do(c.act, c.arg === undefined ? '' : String(c.arg)); return 'act'; } const a = window.pack && pack.testAnswer && pack.testAnswer(t); if (a) { Sim.do(a[0], a[1]); return 'act'; } return 'wait'; });
      if (s === 'done') return true; if (s === 'act' && --n <= 0) return false; if (s === 'wait') await p.waitForTimeout(300);
    }
    return false;
  };
  const stepIdx = f => f.evaluate(() => Sim.scenarios[Sim.scenario].steps.findIndex(x => !x.done(twin())));
  const ui = f => f.evaluate(() => ({ bar: document.getElementById('lmsbar').innerText.replace(/\s+/g, ' '), menus: getComputedStyle(document.querySelector('#scn').closest('label')).display, now: document.getElementById('now').innerText.replace(/\s+/g, ' '), copy: document.querySelector('footer.copy').textContent }));

  console.log('SCO launch links:', launches.length);
  // 1. graded run that passes
  let f = await open('fan'), u = await ui(f);
  ok(u.menus === 'none' && /Lab|fan/i.test(u.bar) && /Guidance is on/.test(u.bar), 'in the platform: menus hidden, lab title and guidance warning shown: ' + u.bar);
  ok(/Mustafa Abdulkadhim/.test(u.copy), 'copyright footer: ' + u.copy);
  let d = await data(); ok(d['cmi.core.lesson_status'] === 'incomplete', 'status incomplete on first launch');
  await f.evaluate(() => Sim.do('guide')); u = await ui(f); ok(/Graded run: guidance off/.test(u.bar), 'guidance off: ' + u.bar);
  ok(await run(f), 'fan lab finished by its cues');
  d = await data(); u = await ui(f);
  ok(d['cmi.core.lesson_status'] === 'passed' && d['cmi.core.score.raw'] === '100' && d['cmi.core.score.max'] === '100', `graded clean run: ${d['cmi.core.lesson_status']}, score ${d['cmi.core.score.raw']}`);
  ok(/^\d{4}:\d{2}:\d{2}\.\d{2}$/.test(d['cmi.core.session_time'] || ''), 'session time in SCORM 1.2 format: ' + d['cmi.core.session_time']);
  ok(/graded run, 0 mistakes, score 100/.test(d['cmi.comments'] || ''), 'comments: ' + d['cmi.comments']);
  ok(/Graded run finished: 0 mistakes, score 100/.test(u.now), 'done message: ' + u.now);
  await p.evaluate(() => stop()); await p.waitForTimeout(300);
  d = await data(); const calls = await p.evaluate(() => __calls.slice(-3));
  ok(d['cmi.core.exit'] === '' && calls.includes('LMSFinish'), 'closing a finished lab: exit normal, LMSFinish called');

  // 2. practice run (guidance on) on a fresh attempt: completed, no score
  await p.evaluate(() => { __data = {}; __calls = []; });
  f = await open('drive'); ok(await run(f), 'drive lab finished with guidance on');
  d = await data(); ok(d['cmi.core.lesson_status'] === 'completed' && !d['cmi.core.score.raw'], `practice run: ${d['cmi.core.lesson_status']}, no score`);
  u = await ui(f); ok(/Practice run finished/.test(u.now), 'practice message: ' + u.now);

  // 3. graded run with mistakes fails, a clean retry passes, a later practice run keeps the best
  await p.evaluate(() => { __data = {}; __calls = []; });
  f = await open('fan'); await f.evaluate(() => Sim.do('guide'));
  await f.evaluate(() => { for (let i = 0; i < 4; i++) bad('Test mistake'); render(); });
  ok(await run(f), 'fan lab finished with 4 mistakes');
  d = await data(); ok(d['cmi.core.lesson_status'] === 'failed' && d['cmi.core.score.raw'] === '60', `4 mistakes: ${d['cmi.core.lesson_status']}, score ${d['cmi.core.score.raw']}`);
  await f.evaluate(() => Sim.do('reset')); u = await ui(f); ok(/Graded run: guidance off/.test(u.bar), 'restart keeps guidance off: a new graded run');
  ok(await run(f), 'clean retry finished');
  d = await data(); ok(d['cmi.core.lesson_status'] === 'passed' && d['cmi.core.score.raw'] === '100', `retry: ${d['cmi.core.lesson_status']}, score ${d['cmi.core.score.raw']}`);
  await f.evaluate(() => { Sim.do('guide'); Sim.do('reset'); }); ok(await run(f), 'practice run after passing');
  d = await data(); ok(d['cmi.core.lesson_status'] === 'passed' && d['cmi.core.score.raw'] === '100', 'best result kept after a practice run');
  await f.evaluate(() => { Sim.do('guide'); Sim.do('reset'); for (let i = 0; i < 2; i++) bad('Test mistake'); render(); }); ok(await run(f), 'weaker graded run');
  d = await data(); u = await ui(f);
  ok(d['cmi.core.lesson_status'] === 'passed' && d['cmi.core.score.raw'] === '100' && /best score, 100, is kept/.test(u.now), 'weaker graded run does not lower the best: ' + u.now);
  ok((d['cmi.comments'] || '').split(' | ').length === 4, 'four runs noted in comments');

  // 4. resume: leave the long install lab halfway, come back to the same step
  await p.evaluate(() => { __data = {}; __calls = []; });
  f = await open('install'); await f.evaluate(() => Sim.do('guide'));
  await run(f, 60); const before = await stepIdx(f), view = await f.evaluate(() => Sim.view), total = await f.evaluate(() => Sim.scenarios[Sim.scenario].steps.length);
  await p.waitForTimeout(1600);
  await p.evaluate(() => stop()); await p.waitForTimeout(300);
  d = await data();
  ok(d['cmi.core.exit'] === 'suspend' && /^(z1|j1):/.test(d['cmi.suspend_data'] || '') && d['cmi.suspend_data'].length <= 4096, `left halfway at step ${before + 1}: exit suspend, saved progress ${(d['cmi.suspend_data'] || '').length} characters`);
  ok(d['cmi.core.lesson_location'] === `step ${before + 1} of ${total}`, 'lesson location: ' + d['cmi.core.lesson_location']);
  f = await open('install');
  const after = await stepIdx(f), st = await f.evaluate(() => ({ view: Sim.view, guide: Sim.guide, coach: Sim.coach.msg }));
  ok(after === before && st.view === view && st.guide === false, `resumed at step ${after + 1} in ${st.view}, guidance still off`);
  ok(await run(f), 'install lab finished after resuming');
  d = await data(); ok(d['cmi.core.lesson_status'] === 'passed' && d['cmi.core.score.raw'] === '100', `resumed graded run: ${d['cmi.core.lesson_status']}, score ${d['cmi.core.score.raw']}`);

  // 5b. the RAM Distributor exam: graded with guidance off from the start; the best layout scores 100, an unsupported one 0
  if (launchOf('ramexam')) {
    await p.evaluate(() => { __data = {}; __calls = []; });
    f = await open('ramexam'); u = await ui(f);
    ok(/Graded run: guidance off/.test(u.bar) && await f.evaluate(() => Sim.guide === false && document.getElementById('guidebtn').disabled), 'exam: guidance off and locked, graded: ' + u.bar);
    ok(await run(f), 'exam finished by its cues (the best layout)');
    d = await data(); u = await ui(f);
    ok(d['cmi.core.lesson_status'] === 'passed' && d['cmi.core.score.raw'] === '100', `exam, best layout: ${d['cmi.core.lesson_status']}, score ${d['cmi.core.score.raw']}`);
    await p.evaluate(() => { __data = {}; __calls = []; });
    f = await open('ramexam');
    // three of the smallest DIMM on processor 1 only: never enough, and processor 2 (if ordered) left empty
    await f.evaluate(() => { const r = REG().mem; Sim.do('go', 'rdist'); Sim.do('mpPart', r.parts[0].key); r.fill.slice(0, 3).forEach(pos => Sim.do('mpSlot', `0:${pos}`)); Sim.do('mpVerify'); Sim.do('mpVerify', 'yes'); });
    await run(f); d = await data(); u = await ui(f);
    ok(d['cmi.core.lesson_status'] === 'failed' && d['cmi.core.score.raw'] === '0' && /unsupported memory layout/.test(u.now), `exam, unsupported layout: ${d['cmi.core.lesson_status']}, score ${d['cmi.core.score.raw']}: ${u.now}`);
  }

  // 5. every lab in the package starts in its own scenario
  for (const h of launches) { await p.evaluate(() => { __data = {}; }); await p.evaluate(x => start(x), h); const fr = await frame(); const sc = await fr.evaluate(() => Sim.scenario); ok(h.includes('scenario=' + sc + '&'), 'launch ' + sc); }
  ok(!errs.length, errs.length ? 'page errors ' + JSON.stringify(errs) : 'no page errors');
  await b.close(); server.close(); process.exit(fails ? 1 : 0);
})();
