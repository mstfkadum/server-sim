// Highlight audit: runs every lab by its cues and, at every cue drawn as a ring on a picture, measures the ring against
// its target, the labels it crosses, other clickable parts inside it and the "Click here" tag; saves a crop of each and
// audit.json. A report for review, not a pass/fail test: a ring may legitimately pass under a label or frame a part with
// info markers on it. Usage: node tests/highlight-audit.js dist/index.html outdir [model,model] [scenario,scenario]
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const [file, out, onlyM, onlyS] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  await p.addInitScript(() => { try { localStorage.setItem('sbt.tour', 'seen'); } catch (e) { } });   // the first-visit tour stays closed (tests/tour.js covers it)
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(500);
  const models = (onlyM ? onlyM.split(',') : await p.evaluate(() => Sim.modelOrder));
  const all = [];
  for (const m of models) {
    await p.selectOption('#model', m); await p.waitForTimeout(300);
    const scns = onlyS ? onlyS.split(',') : await p.evaluate(() => Object.keys(Sim.scenarios));
    for (const sc of scns) {
      await p.evaluate(s => { loadScenario(s); if (!Sim.guide && !Sim.exam) Sim.guide = true; render(); }, sc);
      const seen = new Set(); let n = 0, k = 0;
      for (let g = 0; g < 4000; g++) {
        const st = await p.evaluate(() => { const st = Sim.scenarios[Sim.scenario].steps, t = twin(), i = st.findIndex(s => !s.done(t)); if (i < 0) return { done: true };
          const s = st[i]; if (Sim.view !== s.view) return { go: s.view, i }; const c = s.cue && s.cue(t); return { i, c: c ? { act: c.act, arg: c.arg === undefined ? '' : String(c.arg), field: c.field, value: c.value } : null }; });
        if (st.done) break;
        if (st.go) { await p.evaluate(v => Sim.do('go', v), st.go); continue; }
        if (!st.c) { await p.waitForTimeout(250); continue; }
        const key = `${st.i}|${st.c.act || st.c.field}|${st.c.arg || ''}`;
        if (!seen.has(key) && st.c.act) {
          seen.add(key);
          await p.evaluate(() => render()); await p.waitForTimeout(60);
          const r = await p.evaluate(({ act, arg }) => {
            const ring = document.querySelector('#stage .cuering'); if (!ring) return null;
            const sel = `[data-act="${act}"][data-arg="${arg}"]`, el = document.querySelector(`#stage svg ${sel}`);
            const B = e => { const q = e.getBoundingClientRect(); return { x: q.left, y: q.top, w: q.width, h: q.height }; };
            const R = B(ring), E = el ? B(el) : null, tag = document.querySelector('#stage .cuetagg'), Tg = tag ? B(tag) : null;
            const svg = ring.ownerSVGElement, S = B(svg);
            const ov = (a, c) => Math.max(0, Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x)) * Math.max(0, Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y));
            const inside = (a, c) => a.x >= c.x - 0.5 && a.y >= c.y - 0.5 && a.x + a.w <= c.x + c.w + 0.5 && a.y + a.h <= c.y + c.h + 0.5;
            const vis = e => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity !== 0; };
            const issues = [];
            const texts = [...svg.querySelectorAll('text')].filter(t => vis(t) && !(el && el.contains(t)) && !(tag && tag.contains(t)) && t.textContent.trim()).map(t => ({ t: t.textContent.trim().slice(0, 30), b: B(t) })).filter(o => o.b.w > 0);
            const cut = texts.filter(o => ov(o.b, R) > 0 && !inside(o.b, R));
            if (cut.length) issues.push('ring crosses label: ' + cut.map(o => o.t).join(' / '));
            const hots = [...svg.querySelectorAll('[data-act]')].filter(h => h !== el && !(el && (el.contains(h) || h.contains(el))) && !(tag && tag.contains(h))).map(h => ({ a: h.dataset.act + ':' + h.dataset.arg, b: B(h) })).filter(o => o.b.w * o.b.h > 0 && o.b.w * o.b.h < S.w * S.h / 6);
            const inner = hots.filter(o => ov(o.b, R) > 0.5 * o.b.w * o.b.h);
            if (inner.length) issues.push('other clickables inside ring: ' + inner.map(o => o.a).slice(0, 4).join(', '));
            if (E) { const pad = Math.max(E.x - R.x, E.y - R.y, R.x + R.w - E.x - E.w, R.y + R.h - E.y - E.h); if (!inside(E, { x: R.x - 1, y: R.y - 1, w: R.w + 2, h: R.h + 2 })) issues.push('target not inside ring'); else if (pad > 60) issues.push('ring much larger than target (' + Math.round(pad) + 'px)'); if (E.w < 6 || E.h < 6) issues.push('tiny target ' + Math.round(E.w) + 'x' + Math.round(E.h)); }
            else issues.push('no target element');
            if (Tg) { const tc = texts.filter(o => ov(o.b, Tg) > 4); if (tc.length) issues.push('tag covers label: ' + tc.map(o => o.t).slice(0, 3).join(' / ')); const th = hots.filter(o => ov(o.b, Tg) > 0.3 * o.b.w * o.b.h); if (th.length) issues.push('tag covers clickable: ' + th.map(o => o.a).slice(0, 3).join(', ')); }
            if (R.x < S.x - 2 || R.y < S.y - 2 || R.x + R.w > S.x + S.w + 2 || R.y + R.h > S.y + S.h + 2) issues.push('ring outside picture');
            return { R, E, Tg, issues, view: Sim.view, text: document.querySelector('#now .txt p') ? document.querySelector('#now .txt p').textContent : '' };
          }, st.c);
          if (r) {
            n++; const id = `${m.split('-')[0]}_${sc}_${String(st.i).padStart(3, '0')}_${String(k++).padStart(3, '0')}`;
            const pad = 70, U = [r.R, r.Tg].filter(Boolean), x0 = Math.min(...U.map(o => o.x)) - pad, y0 = Math.min(...U.map(o => o.y)) - pad, x1 = Math.max(...U.map(o => o.x + o.w)) + pad, y1 = Math.max(...U.map(o => o.y + o.h)) + pad;
            await p.evaluate(y => window.scrollTo(0, Math.max(0, y)), 0);
            const clipY = Math.max(0, y0), box = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
            try { await p.screenshot({ path: `${out}/${id}.png`, clip: { x: Math.max(0, x0), y: clipY + await p.evaluate(() => scrollY), width: Math.min(x1, box.w) - Math.max(0, x0), height: Math.min(y1 - Math.max(0, y0), 700) }, fullPage: true }); } catch (e) { }
            all.push({ id, model: m, sc, step: st.i, act: st.c.act, arg: st.c.arg, view: r.view, say: r.text, issues: r.issues, ring: r.R, target: r.E });
          }
        }
        if (st.c.field) { await p.evaluate(c => { const el = document.querySelector(`#stage [data-field="${c.field}"]`); if (el) { el.value = c.value; el.dispatchEvent(new Event('input', { bubbles: true })); } Sim.do('go', Sim.view); }, st.c); continue; }
        if (!st.c.act) { await p.waitForTimeout(250); continue; }
        await p.evaluate(c => Sim.do(c.act, c.arg), st.c);
      }
      fs.writeFileSync(`${out}/audit.json`, JSON.stringify(all, null, 1));
      console.log(`${m} ${sc}: ${n} rings, ${all.filter(a => a.model === m && a.sc === sc && a.issues.length).length} with issues`);
    }
  }
  fs.writeFileSync(`${out}/audit.json`, JSON.stringify(all, null, 1));
  console.log('errors:', errs.length ? errs.slice(0, 3) : 'none'); console.log('audit-done');
  await b.close();
})();
