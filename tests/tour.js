// The "How to use" tour (engine/tour.js): opens on a first visit, frames each part of the screen, keeps its card on the
// screen, blocks the page while open, closes by Skip / Esc / the last card and stays closed after that, reopens from the
// header, adapts to a learning platform and to exams, and never counts as a lab action.
// Usage: node tests/tour.js dist/index.html
const { chromium } = require('playwright'), path = require('path');
const FILE = 'file://' + path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist', 'index.html'));
const API = () => { const d = {}; window.__lms = d; window.API = { LMSInitialize: () => 'true', LMSGetValue: k => d[k] || '', LMSSetValue: (k, v) => { d[k] = String(v); return 'true'; },
  LMSCommit: () => 'true', LMSFinish: () => 'true', LMSGetLastError: () => '0', LMSGetErrorString: () => '', LMSGetDiagnostic: () => '' }; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
  // reduced motion: the spotlight does not slide, so it is measured where it ends
  const page = async (vw, vh, lms) => { const p = await b.newPage({ viewport: { width: vw, height: vh }, reducedMotion: 'reduce' }); p.on('pageerror', e => errs.push(e.message)); if (lms) await p.addInitScript(API); return p; };
  // the open card: where the spotlight and the card are, and whether the spotlight frames its part
  const card = p => p.evaluate(() => {
    const r = e => { const x = e.getBoundingClientRect(); return { x: x.left, y: x.top, r: x.right, b: x.bottom, w: x.width, h: x.height }; };
    const el = document.getElementById('tour'), s = Tour.steps()[Tour.index()], hole = el.querySelector('.tour-hole'), c = r(el.querySelector('.tour-card'));
    const tg = s.sel ? [...document.querySelectorAll(s.sel)].filter(e => e.getBoundingClientRect().width > 0) : [], W = innerWidth, H = innerHeight;
    const out = { title: s.title, sel: s.sel, card: c, inView: c.x >= 0 && c.y >= 0 && c.r <= W + 0.5 && c.b <= H + 0.5, holeShown: getComputedStyle(hole).display !== 'none' };
    if (tg.length) {
      const h = r(hole), t = tg.map(r), x = Math.max(4, Math.min(...t.map(q => q.x))), y = Math.max(4, Math.min(...t.map(q => q.y))), rr = Math.min(W - 4, Math.max(...t.map(q => q.r))), bb = Math.min(H - 4, Math.max(...t.map(q => q.b)));   // the spotlight stays 4 px inside the window
      out.frames = h.x <= x + 1 && h.y <= y + 1 && h.r >= rr - 1 && h.b >= bb - 1 && h.x >= x - 12 && h.y >= y - 12 && h.r <= rr + 12 && h.b <= bb + 12;
      out.dbg = { h: [h.x, h.y, h.r, h.b].map(Math.round), t: [x, y, rr, bb].map(Math.round) };
      out.visible = bb - y > 8 && rr - x > 8;
      out.small = h.h < H * 0.45;
      out.overlap = !(c.r <= h.x || c.x >= h.r || c.b <= h.y || c.y >= h.b);
    }
    return out;
  });
  const walk = async (p, label) => {
    const [n, from] = await p.evaluate(() => [Tour.steps().length, Tour.index()]); let bad = [];
    for (let k = from; k < n; k++) {
      const c = await card(p);
      if (!c.inView) bad.push(`${c.title}: card off screen`);
      if (c.sel && !c.holeShown) bad.push(`${c.title}: no spotlight`);
      if (c.sel && !c.frames) bad.push(`${c.title}: spotlight does not frame ${c.sel} ${JSON.stringify(c.dbg)}`);
      if (c.sel && !c.visible) bad.push(`${c.title}: part not scrolled into view`);
      if (c.sel && c.small && c.overlap) bad.push(`${c.title}: card covers its part`);
      if (!c.sel && c.holeShown) bad.push(`${c.title}: spotlight on a centre card`);
      await p.click('.tour-card [data-tour="next"]'); await p.waitForTimeout(60);
    }
    ok(!bad.length, `${label}: ${n} cards, each framed and on screen` + (bad.length ? ' — ' + bad.join('; ') : ''));
    ok(!(await p.evaluate(() => Tour.isOpen())), `${label}: the last card closes the tour`);
    return n;
  };

  // 1. desktop, first visit
  let p = await page(1400, 1000);
  await p.goto(FILE); await p.waitForTimeout(400);
  ok(await p.evaluate(() => Tour.isOpen()), 'first visit: the tour opens by itself');
  let c = await card(p);
  ok(!c.holeShown && c.title.startsWith('Welcome'), 'first card: the welcome, centred, no spotlight');
  ok(await p.evaluate(() => document.activeElement && document.activeElement.dataset.tour === 'next'), 'focus on the Next button');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('[data-tour="back"]')).display === 'none'), 'no Back button on the first card');
  const titles = await p.evaluate(() => Tour.steps().map(s => s.title));
  ok(titles.includes('Server model') && titles.includes('Lab') && !titles.includes('This lab, from your course'), 'outside a platform: model and lab cards, no course card');
  // the page under the tour does not react
  const before = await p.evaluate(() => ({ e: twin().errors, n: twin().log.length, v: Sim.view }));
  await p.mouse.click(700, 560); await p.mouse.click(100, 300);
  const after = await p.evaluate(() => ({ e: twin().errors, n: twin().log.length, v: Sim.view }));
  ok(JSON.stringify(before) === JSON.stringify(after), 'clicks on the dimmed page do nothing');
  // keys
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  ok(await p.evaluate(() => Tour.index()) === 2, 'Right arrow: next card');
  await p.keyboard.press('ArrowLeft');
  ok(await p.evaluate(() => Tour.index()) === 1, 'Left arrow: back');
  await p.click('.tour-card [data-tour="back"]');
  ok(await p.evaluate(() => Tour.index()) === 0, 'Back button: previous card');
  await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
  ok(await p.evaluate(() => !!document.activeElement.closest('.tour-card')), 'Tab keeps the focus in the card');
  await p.keyboard.press('Escape');
  ok(!(await p.evaluate(() => Tour.isOpen())), 'Esc closes the tour');
  ok(await p.evaluate(() => localStorage.getItem('sbt.tour')) === 'seen', 'closing remembers the tour was seen');
  await p.reload(); await p.waitForTimeout(400);
  ok(!(await p.evaluate(() => Tour.isOpen())), 'second visit: the tour stays closed');
  await p.click('#tourbtn'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => Tour.isOpen()), '"How to use" opens it again');
  await walk(p, 'desktop');
  ok(await p.evaluate(() => document.activeElement && document.activeElement.id === 'tourbtn'), 'after closing, the focus is back on "How to use"');
  ok(await p.evaluate(() => twin().errors === 0 && Sim.scenarios[Sim.scenario].steps.filter(s => s.done(twin())).length === 0), 'the tour did no lab action and made no mistake');
  await p.click('#tourbtn'); await p.click('.tour-skip');
  ok(!(await p.evaluate(() => Tour.isOpen())), 'Skip tour closes it');
  await p.goto(FILE + '?tour=on'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => Tour.isOpen()), '?tour=on opens it even when seen');
  await p.close();
  p = await page(1400, 1000);
  await p.goto(FILE + '?tour=off'); await p.waitForTimeout(300);
  ok(!(await p.evaluate(() => Tour.isOpen())), '?tour=off keeps it closed on a first visit');
  await p.close();

  // 2. exam lab
  p = await page(1280, 800);
  await p.goto(FILE + '?scenario=ramexam'); await p.waitForTimeout(400);
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  const g = await p.evaluate(() => { const s = Tour.steps()[Tour.index()]; return s.title + ' | ' + document.getElementById('tourt').innerText; });
  ok(/^Guidance \|.*exam/i.test(g), 'exam: the Guidance card says it stays off in an exam');
  await walk(p, 'exam lab');
  await p.close();

  // 3. inside a learning platform (SCORM 1.2 API in the page), its own pass mark
  p = await page(1280, 800, true);
  await p.goto(FILE + '?model=hpe-dl380-gen11-sff&scenario=cpurep&pass=80&per=5'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => LMS.on && Tour.isOpen()), 'platform: the tour opens on a first launch');
  const lt = await p.evaluate(() => Tour.steps().map(s => s.title));
  ok(lt.includes('This lab, from your course') && !lt.includes('Server model') && !lt.includes('Lab'), 'platform: course card instead of the menus');
  ok(/5 points; 80 passes/.test(await p.evaluate(() => document.getElementById('tourt').innerText)), 'platform: the package\'s pass mark and points per mistake');
  await walk(p, 'platform');
  ok(await p.evaluate(() => !LMS.guided && twin().errors === 0), 'platform: the tour does not make the run practice');
  await p.close();

  // 4. phone
  p = await page(390, 844);
  await p.goto(FILE); await p.waitForTimeout(400);
  ok(await p.evaluate(() => { const b = document.getElementById('tourbtn').getBoundingClientRect(); return b.width > 0 && b.right <= innerWidth; }), 'phone: "How to use" fits in the header');
  await walk(p, 'phone');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'phone: no horizontal scroll');
  await p.close();

  ok(!errs.length, errs.length ? 'page errors ' + JSON.stringify(errs) : 'no page errors');
  await b.close(); process.exit(fails ? 1 : 0);
})();
