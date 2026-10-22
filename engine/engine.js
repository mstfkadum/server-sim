'use strict';
/* ==========================================================================================================
   Server build trainer: the shared engine.
   The engine knows nothing about any particular server. It holds the model registry, the scenario runner
   (steps, cues, progress, mistakes), the rendering shell and the shared drawing helpers. Each server model is
   a "model pack" (models/<id>/) that the build wraps in its own function scope and registers with
   Sim.registerModel; the pack then registers its views, scenarios, actions, rules, timers and listeners.
   See docs/ADDING_A_MODEL.md.
   © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved.
   ========================================================================================================== */

/* ============ 1. Registry: models, and per model its views, scenarios, actions and rules ============ */
let T = null;                                                         // the twin state of the active scenario
const Sim = { models: {}, modelOrder: [], model: null, building: null, view: null, scenario: null, guide: true, coach: { kind: 'info', msg: '' },
  hooks: { before: [], render: [], load: [] }, doneText: null };   // hooks: before every action or typed field, after every render, after a scenario loads (used by the learning-platform link)
const CORE = {};                                                      // engine actions, shared by every model
const newReg = () => ({ views: {}, order: [], scenarios: {}, actions: {}, rules: [], field: null, api: {}, mem: null, os: null });   // mem: the memory rules for the RAM Distributor (memplan.js); os: the server as an installed OS sees it (os-core.js)
const EMPTY = newReg();
// the registry being filled (while a pack is built) or the active model's registry
const REG = () => { const m = Sim.models[Sim.building || Sim.model]; return (m && m.reg) || EMPTY; };
['views', 'order', 'scenarios', 'actions', 'rules'].forEach(k => Object.defineProperty(Sim, k, { get: () => REG()[k], enumerable: true }));
Sim.registerModel = m => { if (Sim.models[m.id]) throw new Error('Duplicate model id ' + m.id); Sim.models[m.id] = m; Sim.modelOrder.push(m.id); };
Sim.registerView = v => { const r = REG(); r.views[v.id] = v; r.order.push(v.id); };
Sim.registerScenario = s => { REG().scenarios[s.id] = s; };
Sim.registerRule = r => REG().rules.push(r);
Sim.on = (name, fn) => { REG().actions[name] = fn; };
// handler for typed fields (inputs with data-field), called as fn(field, value)
Sim.onField = fn => { REG().field = fn; };
// functions a pack offers to tests and to the browser console (window.pack while the model is active)
Sim.expose = obj => Object.assign(REG().api, obj);
/* Style sheets added at run time (the packs', the OS screens'): always after the page's own styles, at the end of the
   body. A host may move the page's <style> out of <head> (a wrapper page, a learning platform), and a sheet appended
   to <head> would then come first and lose every tie. boost: every selector also gets the weight of an id, so the
   operating system screens keep their own look inside any management page (iLO, Cisco IMC) whatever the order. */
const cssSplit = sel => { const out = []; let d = 0, cur = ''; for (const ch of sel) { if (ch === '(' || ch === '[') d++; else if (ch === ')' || ch === ']') d--; if (ch === ',' && !d) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map(x => x.trim()).filter(Boolean); };
const cssBoost = sel => { const i = sel.indexOf('::'); return i >= 0 ? sel.slice(0, i) + ':not(#_os)' + sel.slice(i) : sel + ':not(#_os)'; };
const cssBoostRules = list => { for (const r of list) { if (r instanceof CSSStyleRule) r.selectorText = cssSplit(r.selectorText).map(cssBoost).join(','); else if (r.cssRules && !(r instanceof CSSKeyframesRule)) cssBoostRules(r.cssRules); } };
Sim.addCss = (el, boost) => { if (el.id && document.getElementById(el.id) && document.getElementById(el.id) !== el) return; document.body.appendChild(el); if (boost) try { cssBoostRules(el.sheet.cssRules); } catch (e) { } };
// timers and document listeners that run only while their own model is active
Sim.every = (fn, ms) => { const id = Sim.building; setInterval(() => { if (Sim.model === id && T) fn(); }, ms); };
Sim.listen = (type, fn, opts) => { const id = Sim.building; document.addEventListener(type, e => { if (Sim.model === id && T) fn(e); }, opts); };
// build a pack the first time its model is picked
function buildModel(m) {
  if (m.reg) return m.reg;
  m.reg = newReg(); Sim.building = m.id;
  try { m.pack(); } finally { Sim.building = null; }
  if (!Object.keys(m.reg.scenarios).length || !m.reg.order.length) throw new Error(`Model ${m.id} registered no views or no scenarios`);
  return m.reg;
}

/* ============ 2. Messages and readiness ============ */
// every twin state carries errors (mistake count), log (message list) and flags; say() and bad() use them
function say(kind, msg) { if (kind === 'err') T.errors++; T.log.push({ kind, msg }); Sim.coach = { kind, msg }; }
const bad = msg => { say('err', msg); return false; };
const runRules = () => Sim.rules.flatMap(r => r(T));

/* ============ 2b. Sounds (experimental): short mechanical clicks, made with the Web Audio API, so no sound files ============
   Sim.sound(kind, delay) plays one: 'drive' (drive ejector lever latching), 'dimm' (the two DIMM ejector clips snapping),
   'card' (a PCIe card seating in its connector), 'riser' (a riser seating in its motherboard socket), 'psu' (a power supply
   locking into its bay), 'latch' (a rack slam latch snapping onto a post). Sim.sound('fans') is the rush of the fans at power-on: they run up to full speed, hold there while
   the server initialises, then slow down and fade out; Sim.soundStop('fans') cuts it short and spins the fans down (the server
   was shut down or lost power). The header button turns them on or off; the choice stays in this browser. */
const SFX = (() => {
  let ac = null, on = null, noise = null, hiss = null;
  const loops = {};
  const pref = () => { if (on === null) { try { on = localStorage.getItem('sbt.sfx') !== 'off'; } catch (e) { on = true; } } return on; };
  const ctx = () => { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; if (!ac) ac = new AC(); if (ac.state === 'suspended') ac.resume(); return ac; };
  const burst = a => { if (noise && noise.sampleRate === a.sampleRate) return noise; const n = Math.floor(a.sampleRate * 0.04), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0); for (let k = 0; k < n; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / n, 7); return (noise = b); };
  // a click: a burst of noise through a band-pass filter (f in Hz, q its sharpness)
  const tick = (a, at, f, q, gain) => { const s = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(); s.buffer = burst(a); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; g.gain.value = gain; s.connect(bp); bp.connect(g); g.connect(a.destination); s.start(at); };
  // a thud or a ring: a sine that falls from f0 to f1 and dies away in dur seconds
  const tone = (a, at, f0, f1, dur, gain) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + dur * 0.7); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(gain, at + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, at + dur); o.connect(g); g.connect(a.destination); o.start(at); o.stop(at + dur + 0.02); };
  // stereo noise, two seconds, looped: the air the fans move
  const air = a => { if (hiss && hiss.sampleRate === a.sampleRate) return hiss; const n = a.sampleRate * 2, b = a.createBuffer(2, n, a.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let p = 0; for (let k = 0; k < n; k++) { p = 0.6 * p + 0.4 * (Math.random() * 2 - 1); d[k] = p; } } return (hiss = b); };
  // the fans at power-on: a quick rush up to full speed (about 1.8 s), full speed while the server initialises (to 6 s), a slow
  // settle to a quiet idle (by 9.5 s), then gone by 15 s. Stopping early spins them down: the rush falls in pitch and level.
  function fans(a, t) {
    const src = a.createBufferSource(); src.buffer = air(a); src.loop = true;
    const hp = a.createBiquadFilter(), lp = a.createBiquadFilter(), hi = a.createBiquadFilter(), hiG = a.createGain(), master = a.createGain();
    hp.type = 'highpass'; hp.frequency.value = 110;
    lp.type = 'lowpass'; lp.Q.value = 0.6; const F = lp.frequency;
    F.setValueAtTime(300, t); F.exponentialRampToValueAtTime(4200, t + 1.8); F.setValueAtTime(4200, t + 6); F.exponentialRampToValueAtTime(1000, t + 9.5);
    hi.type = 'bandpass'; hi.frequency.value = 6500; hi.Q.value = 0.8;                                    // the hiss on top
    const HG = hiG.gain; HG.setValueAtTime(0, t); HG.linearRampToValueAtTime(0.5, t + 1.8); HG.setValueAtTime(0.5, t + 6); HG.exponentialRampToValueAtTime(0.06, t + 9.5);
    // blade tone of the six fan modules, rising with their speed (a faint whine under the rush)
    const o = a.createOscillator(), o2 = a.createOscillator(), og = a.createGain(), osc = [[o, 1], [o2, 2.02]]; o.type = 'triangle'; o2.type = 'sine';
    osc.forEach(([x, m]) => { const q = x.frequency; q.setValueAtTime(60 * m, t); q.exponentialRampToValueAtTime(390 * m, t + 1.8); q.setValueAtTime(390 * m, t + 6); q.exponentialRampToValueAtTime(170 * m, t + 9.5); x.connect(og); });
    og.gain.value = 0.05;
    const G = master.gain; G.setValueAtTime(0, t); G.linearRampToValueAtTime(0.42, t + 1.8); G.setValueAtTime(0.42, t + 6); G.exponentialRampToValueAtTime(0.09, t + 9.5); G.linearRampToValueAtTime(0.06, t + 12); G.linearRampToValueAtTime(0, t + 15);
    src.connect(hp); hp.connect(lp); lp.connect(master); hp.connect(hi); hi.connect(hiG); hiG.connect(master); og.connect(master); master.connect(a.destination);
    const end = t + 15.1, hold = (p, now) => { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(now); else { const v = p.value; p.cancelScheduledValues(now); p.setValueAtTime(v, now); } };
    [src, o, o2].forEach(x => { x.start(t); x.stop(end); });
    return { end, stop(f) {
      const now = a.currentTime; [G, F, HG, o.frequency, o2.frequency].forEach(p => hold(p, now));
      G.setTargetAtTime(0, now, f / 4); HG.setTargetAtTime(0, now, f / 5); F.setTargetAtTime(350, now, f / 3);
      osc.forEach(([x, m]) => x.frequency.setTargetAtTime(30 * m, now, f / 3));
      [src, o, o2].forEach(x => { try { x.stop(now + f * 1.6); } catch (e) { } });
    } };
  }
  const KINDS = {
    drive: (a, t) => { tick(a, t, 4300, 2.6, 0.9); tone(a, t + 0.002, 2650, 2550, 0.07, 0.07); tone(a, t, 150, 70, 0.08, 0.25); },          // metal lever latching
    dimm: (a, t) => { tick(a, t, 3000, 2.4, 1.15); tone(a, t, 210, 90, 0.06, 0.22); tick(a, t + 0.045, 3350, 2.4, 1.05); tone(a, t + 0.045, 210, 90, 0.06, 0.2); },   // click-click: both clips
    card: (a, t) => { tone(a, t, 125, 55, 0.14, 0.5); tick(a, t + 0.006, 1900, 2, 0.45); },                                                  // edge going home in the slot
    riser: (a, t) => { tone(a, t, 95, 45, 0.17, 0.55); tick(a, t + 0.008, 1600, 2, 0.4); },                                                  // a deeper seat
    latch: (a, t) => { tick(a, t, 3700, 3, 0.95); tone(a, t + 0.003, 2150, 2050, 0.09, 0.06); tone(a, t, 160, 80, 0.07, 0.22); },          // spring-steel latch onto a rack post
    psu: (a, t) => { tick(a, t, 3400, 2.2, 1); tick(a, t + 0.014, 1500, 3, 0.55); tone(a, t, 170, 65, 0.13, 0.45); },                       // lever snaps, supply seats
    // the top cover closing (timed to its 0.6 s slide): the latch's opening catches the peg with a faint tick, the cover rides
    // forward, and the latch seats flat with a light, bright click and a short sheet-steel ring, then a tiny detent tick
    cover: (a, t) => { tick(a, t + 0.04, 5600, 4.5, 0.22); tick(a, t + 0.5, 4700, 3.6, 0.5); tone(a, t + 0.502, 2870, 2840, 0.16, 0.03); tone(a, t + 0.502, 4130, 4100, 0.11, 0.018); tone(a, t + 0.5, 240, 120, 0.05, 0.08); tick(a, t + 0.545, 6200, 5, 0.2); },
    tab: (a, t) => { tick(a, t, 1900, 0.9, 0.12); tick(a, t + 0.05, 3900, 3, 0.75); tone(a, t + 0.052, 1750, 1680, 0.08, 0.05); tone(a, t + 0.05, 190, 95, 0.06, 0.16); },   // a steel tab slid onto a rail end: slide, click
    clip: (a, t) => { tick(a, t, 2400, 1.8, 0.7); tick(a, t + 0.009, 5400, 4, 0.28); tone(a, t, 520, 260, 0.035, 0.1); },                 // a plastic flap snapping shut
    clipOpen: (a, t) => { tick(a, t, 2000, 1.6, 0.3); tone(a, t, 380, 240, 0.03, 0.05); },                                                // ... and lifted open
    velcro: (a, t) => { for (let i = 0; i < 26; i++) tick(a, t + i * 0.011 + Math.random() * 0.004, 1400 + Math.random() * 3600, 1.1, 0.07 + Math.random() * 0.1); },   // hook-and-loop pressed shut
    plug: (a, t) => { tone(a, t, 140, 70, 0.09, 0.3); tick(a, t + 0.004, 1300, 1.5, 0.3); },                                              // a power plug pushed home
    snap: (a, t) => { tick(a, t, 4600, 4, 0.42); tone(a, t, 900, 600, 0.02, 0.05); },
    fanLatch: (a, t) => { tick(a, t, 3100, 2.2, 0.36); tick(a, t + 0.007, 6200, 4.5, 0.12); tone(a, t, 680, 360, 0.025, 0.05); },   // a fan module's latch snapping back: small and quiet                                                      // an LC or RJ-45 latch
    cpuClip: (a, t) => { tick(a, t, 5200, 5, 0.26); tick(a, t + 0.006, 2600, 2.5, 0.1); tone(a, t, 3150, 3080, 0.05, 0.016); },   // a socket lever slipping under its hook: very light
    cpuRelease: (a, t) => { tick(a, t, 4300, 4, 0.13); tone(a, t + 0.004, 2500, 2400, 0.04, 0.009); }                              // ... and springing out of it
  };
  const stop = (kind, fade = 0.8) => { const l = loops[kind]; if (!l) return; delete loops[kind]; try { l.stop(fade); } catch (e) { } };
  return { on: pref, set(v) { on = v; try { localStorage.setItem('sbt.sfx', v ? 'on' : 'off'); } catch (e) { } if (!v) Object.keys(loops).forEach(k => stop(k, 0.3)); },
    play(kind, delay = 0) {
      if (!pref()) return;
      try {
        const a = ctx(); if (!a) return;
        if (kind === 'fans') { stop('fans', 0.2); loops.fans = fans(a, a.currentTime + delay); return; }
        (KINDS[kind] || KINDS.drive)(a, a.currentTime + delay);
      } catch (e) { }
    },
    stop, stopAll: f => Object.keys(loops).forEach(k => stop(k, f)) };
})();
Sim.sound = (kind, delay) => SFX.play(kind, delay);
Sim.soundStop = (kind, fade) => SFX.stop(kind, fade);

/* ============ 3. Rendering shell ============ */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hot = (act, arg, label) => ` class="hot" tabindex="0" role="button" data-act="${act}" data-arg="${arg}" aria-label="${esc(label)}"`;
const frame = (title, inner, h = 540) => `<svg viewBox="0 0 900 ${h}" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="${esc(title)}">
<defs><pattern id="mat" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#2E5571" stroke-width="1"/></pattern></defs>
<rect width="900" height="${h}" fill="#24465E"/><rect width="900" height="${h}" fill="url(#mat)"/><text x="24" y="${h > 540 ? 22 : 34}" class="sh">${esc(title)}</text>${inner}</svg>`;
const button = (label, act, arg = '', pri = false) => `<button class="btn${pri ? ' pri' : ''}" data-act="${act}" data-arg="${arg}">${esc(label)}</button>`;
const chip = (x, y, text, anchor = 'middle') => { const w = text.length * 6.6 + 14, x0 = anchor === 'middle' ? x - w / 2 : x; return `<rect x="${x0}" y="${y - 14}" width="${w}" height="20" rx="4" class="chipbg"/><text x="${x0 + w / 2}" y="${y}" text-anchor="middle" class="chip">${esc(text)}</text>`; };
const DECK = { name: 'Hardware Training (ver 2)', slides: 128 };
const companionHtml = v => `<h3>Companion material</h3><p class="cap" style="font-size:13px;margin:0 0 8px">${DECK.name}, the training deck this simulator accompanies.</p><div class="comp">${v.companion.map(([n, sec, title, what]) => `<div class="cslide"><div class="cnum"><b>${n}</b><span>of ${DECK.slides}</span></div><div class="cbody"><b>${esc(title)}</b><small>Section: ${esc(sec)}</small><span>${esc(what)}</span><i class="cpos" aria-label="Position in the deck: slide ${n} of ${DECK.slides}"><em style="left:${((n - 1) / (DECK.slides - 1) * 100).toFixed(1)}%"></em></i></div></div>`).join('')}</div>`;
const keepHtml = v => `<h3>Things to keep in mind</h3><div class="keep">${v.keep.map(([h, d]) => `<div class="kp"><b>${esc(h)}</b><span>${esc(d)}</span></div>`).join('')}</div>`;
// reference notes stay hidden during an exam
const refsHtml = v => Sim.exam ? '' : v.keep ? keepHtml(v) : v.companion ? companionHtml(v) : '';

function steps() { return Sim.scenarios[Sim.scenario].steps; }
// the ring and the "Click here" tag. The ring frames its own target and cuts through nothing: it sits 6 units outside the
// target, closer on a side where another clickable part or a label is near (a dense row of sockets, ports or slots; a
// title just above), grows to take in a small label of its own (a port number just under its port) but never over another
// clickable part, and goes under a label it still has to cross, so the label stays readable. The tag goes where it covers
// the least text, then the fewest other clickable parts, and stays inside the picture.
function cueLayout(svg, el, bb, inv) {
  const vb = svg.viewBox && svg.viewBox.baseVal, W = vb && vb.width ? vb.width : 900, H = vb && vb.height ? vb.height : 540, TW = 80, TH = 19;
  const box = e => { const rc = e.getBoundingClientRect(); if (!rc.width && !rc.height) return null; const a = new DOMPoint(rc.left, rc.top).matrixTransform(inv), b = new DOMPoint(rc.right, rc.bottom).matrixTransform(inv); return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y }; };
  const mine = e => el.contains(e) || e.closest('.cuetagg');
  const shown = e => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && e.textContent.trim(); };
  const tels = [...svg.querySelectorAll('text')].filter(e => !mine(e) && shown(e)).map(e => ({ e, b: box(e) })).filter(o => o.b), texts = tels.map(o => o.b);
  const hots = [...svg.querySelectorAll('[data-act]')].filter(e => !mine(e) && !e.contains(el)).map(box).filter(b => b && b.w * b.h < W * H / 6);
  const over = (r, bs) => bs.reduce((n, b) => n + Math.max(0, Math.min(r.x + r.w, b.x + b.w) - Math.max(r.x, b.x)) * Math.max(0, Math.min(r.y + r.h, b.y + b.h) - Math.max(r.y, b.y)), 0);
  const inside = (a, c) => a.x >= c.x - 0.5 && a.y >= c.y - 0.5 && a.x + a.w <= c.x + c.w + 0.5 && a.y + a.h <= c.y + c.h + 0.5;
  const B = { x: bb.x, y: bb.y, w: bb.width, h: bb.height }, pad = { l: 6, r: 6, t: 6, b: 6 }, room = g => Math.max(1.5, Math.min(6, g / 2));
  [...hots, ...texts].forEach(b => {
    if (over(B, [b]) > 0.5 * b.w * b.h) return;                       // on the target: its own label, taken in
    const vo = Math.min(B.y + B.h, b.y + b.h) - Math.max(B.y, b.y), ho = Math.min(B.x + B.w, b.x + b.w) - Math.max(B.x, b.x);
    if (vo > 0.3 * Math.min(B.h, b.h)) { if (b.x >= B.x + B.w / 2) pad.r = Math.min(pad.r, room(b.x - B.x - B.w)); else if (b.x + b.w <= B.x + B.w / 2) pad.l = Math.min(pad.l, room(B.x - b.x - b.w)); }
    if (ho > 0.3 * Math.min(B.w, b.w)) { if (b.y >= B.y + B.h / 2) pad.b = Math.min(pad.b, room(b.y - B.y - B.h)); else if (b.y + b.h <= B.y + B.h / 2) pad.t = Math.min(pad.t, room(B.y - b.y - b.h)); }
  });
  const R = { x: B.x - pad.l, y: B.y - pad.t, w: B.w + pad.l + pad.r, h: B.h + pad.t + pad.b };
  const band = { x: R.x - 5, y: R.y - 5, w: R.w + 10, h: R.h + 10 }, core = { x: R.x + 5, y: R.y + 5, w: R.w - 10, h: R.h - 10 };
  for (const t of texts) {
    if (t.w * t.h > 1400 || !over(band, [t]) || (core.w > 0 && core.h > 0 && over(core, [t]) >= t.w * t.h - 1)) continue;
    const x0 = Math.min(R.x, t.x - 4), y0 = Math.min(R.y, t.y - 3), x1 = Math.max(R.x + R.w, t.x + t.w + 4), y1 = Math.max(R.y + R.h, t.y + t.h + 3);
    if (R.x - x0 > 28 || R.y - y0 > 22 || x1 - R.x - R.w > 28 || y1 - R.y - R.h > 22) continue;     // a small label next to the ring, not a heading
    // never grow over another clickable thing: in a dense row (DIMM sockets, ports) the label may be a neighbour's
    const G = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    if (hots.some(h => over(G, [h]) > 0.4 * h.w * h.h && over(R, [h]) <= 0.4 * h.w * h.h)) continue;
    if (texts.some(o => o !== t && over(G, [o]) > 0 && !inside(o, G) && inside(o, R) === false && over(R, [o]) === 0)) continue;   // nor into another label
    R.x = x0; R.y = y0; R.w = x1 - x0; R.h = y1 - y0;
  }
  // labels the ring still crosses, drawn after the target: the ring goes just before the first of them, under it
  const crossing = tels.filter(o => over(R, [o.b]) > 0 && !inside(o.b, R) && (el.compareDocumentPosition(o.e) & Node.DOCUMENT_POSITION_FOLLOWING)).map(o => o.e);
  const keep = { x: R.x - 3, y: R.y - 3, w: R.w + 6, h: R.h + 6 }, cx = R.x + R.w / 2, cy = R.y + R.h / 2;
  const spots = [[cx, R.y - 6, 0], [cx, R.y + R.h + 20, 2], [R.x + R.w + 6 + TW / 2, cy + 5, 4], [R.x - 6 - TW / 2, cy + 5, 6],
    [R.x + R.w + 6 + TW / 2, R.y + 12, 7], [R.x - 6 - TW / 2, R.y + 12, 8], [R.x + R.w + 6 + TW / 2, R.y + R.h - 2, 7], [R.x - 6 - TW / 2, R.y + R.h - 2, 8],
    [cx, R.y - 30, 10], [cx, R.y + R.h + 44, 12], [R.x + R.w + 30 + TW / 2, cy + 5, 14], [R.x - 30 - TW / 2, cy + 5, 16]];
  const place = list => { let best = null;
    for (const [x0, y, pref] of list) {
      const x = Math.min(Math.max(x0, TW / 2 + 6), W - TW / 2 - 6), r = { x: x - TW / 2, y: y - 14, w: TW, h: TH };
      const out = (r.y < 4 ? 4 - r.y : 0) + (r.y + r.h > H - 2 ? r.y + r.h - H + 2 : 0);
      const cover = over(r, texts) * 3 + over(r, hots) * 2, score = cover + over(r, [keep]) * 50 + out * 400 + pref;
      if (!best || score < best.score) best = { tx: x, ty: y, score, cover, r };
    }
    return best; };
  let best = place(spots), lead = null;
  // in a crowded spot (a row of ports or sockets), the tag moves further out, onto clear ground, with a short line to the ring
  if (best.cover > 0) {
    const far = [[cx, R.y - 56, 30], [cx, R.y + R.h + 70, 32], [R.x + R.w + 60 + TW / 2, cy + 5, 34], [R.x - 60 - TW / 2, cy + 5, 36],
      [R.x + R.w + 50 + TW / 2, R.y - 30, 44], [R.x - 50 - TW / 2, R.y - 30, 44], [R.x + R.w + 50 + TW / 2, R.y + R.h + 44, 44], [R.x - 50 - TW / 2, R.y + R.h + 44, 44]];
    const f = place(far);
    if (f.cover < best.cover * 0.5 && f.score < best.score) {
      best = f; const t = f.r, px = Math.max(t.x, Math.min(cx, t.x + t.w)), py = Math.max(t.y, Math.min(cy, t.y + t.h));
      const qx = Math.max(R.x, Math.min(px, R.x + R.w)), qy = Math.max(R.y, Math.min(py, R.y + R.h));
      lead = [px, py, qx, qy];
    }
  }
  return { ring: R, tx: best.tx, ty: best.ty, crossing, lead };
}
// where the ring goes in the drawing: just before the first label it crosses (in their common group, in that group's
// units), so the label is drawn over it; otherwise on top of everything
function ringPlace(svg, el, R, crossing) {
  const S = svg.getScreenCTM();
  for (const t of crossing) {
    let c = t.parentNode; while (c && c !== svg && !c.contains(el)) c = c.parentNode;
    if (!c) continue;
    const kid = [...c.childNodes].find(n => n.contains && n.contains(t)); if (!kid || kid.contains(el)) continue;
    const M = c === svg ? null : c.getScreenCTM(); if (M && (Math.abs(M.b) > 1e-6 || Math.abs(M.c) > 1e-6)) continue;
    const to = M ? M.inverse().multiply(S) : new DOMMatrix(), p = new DOMPoint(R.x, R.y).matrixTransform(to), q = new DOMPoint(R.x + R.w, R.y + R.h).matrixTransform(to);
    return { parent: c, before: kid, x: p.x, y: p.y, w: q.x - p.x, h: q.y - p.y, k: Math.abs(to.a) || 1 };
  }
  return { parent: svg, before: null, x: R.x, y: R.y, w: R.w, h: R.h, k: 1 };
}
function applyCue(cue, stepView) {
  if (!Sim.guide || !cue) return;
  if (stepView !== Sim.view) { document.querySelectorAll(`#nav button[data-arg="${stepView}"], #steps [data-act="go"][data-arg="${stepView}"]`).forEach(b => b.classList.add('cue')); return; }
  if (cue.field) { document.querySelectorAll(`#stage [data-field="${cue.field}"]`).forEach(b => b.classList.add('cue')); return; }
  if (!cue.act) return;
  const sel = `[data-act="${cue.act}"][data-arg="${cue.arg === undefined ? '' : cue.arg}"]`;
  document.querySelectorAll(`#acts ${sel}, #tray ${sel}, #stage .cueable ${sel}`).forEach(b => b.classList.add('cue'));
  const el = document.querySelector(`#stage svg ${sel}`);
  if (el && el.ownerSVGElement) {
    let svg = el.ownerSVGElement; while (svg.ownerSVGElement) svg = svg.ownerSVGElement;
    const ns = 'http://www.w3.org/2000/svg', rc = el.getBoundingClientRect(), inv = svg.getScreenCTM().inverse();
    const p1 = new DOMPoint(rc.left, rc.top).matrixTransform(inv), p2 = new DOMPoint(rc.right, rc.bottom).matrixTransform(inv);
    const bb = { x: p1.x, y: p1.y, width: p2.x - p1.x, height: p2.y - p1.y };
    const { ring: R, tx, ty, crossing, lead } = cueLayout(svg, el, bb, inv), P = ringPlace(svg, el, R, crossing);
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', P.x); r.setAttribute('y', P.y); r.setAttribute('width', P.w); r.setAttribute('height', P.h); r.setAttribute('rx', 8 * P.k); r.setAttribute('class', 'cuering');
    if (P.k !== 1) r.style.strokeWidth = 4 * P.k;
    P.parent.insertBefore(r, P.before);
    const g = document.createElementNS(ns, 'g'); g.setAttribute('class', 'cuetagg');
    g.innerHTML = `${lead ? `<line x1="${lead[0]}" y1="${lead[1]}" x2="${lead[2]}" y2="${lead[3]}" class="cuelead"/>` : ''}<rect x="${tx - 40}" y="${ty - 14}" width="80" height="19" rx="9" class="cuetagbg"/><text x="${tx}" y="${ty}" text-anchor="middle" class="cuetag">Click here</text>`;
    svg.appendChild(g);
    const stg = $('#stage');
    if (stg.scrollWidth > stg.clientWidth + 2) { const sr = stg.getBoundingClientRect(), rr = r.getBoundingClientRect(); if (rr.left < sr.left || rr.right > sr.right) stg.scrollLeft += rr.left - sr.left - Math.max(10, (sr.width - rr.width) / 2); }
  }
}
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function guide() {
  document.querySelectorAll('.cue').forEach(e => e.classList.remove('cue'));
  document.querySelectorAll('.cuering, .cuetagg').forEach(e => e.remove());
  const st = steps(), nextIdx = st.findIndex(s => !s.done(T)), nxt = nextIdx >= 0 ? st[nextIdx] : null, cue = nxt && nxt.cue ? nxt.cue(T) : null;
  const now = $('#now');
  // the finished banner shows with or without guidance: a graded run ends here with its result
  if (!nxt) { now.className = 'fin'; now.innerHTML = `<div class="num">${CHECK}<strong>Done</strong></div><div class="txt"><p>${esc((Sim.doneText && Sim.doneText()) || (T.grade && MemPlan.examText(T)) || `Lab complete with ${T.errors} mistake${T.errors === 1 ? '' : 's'}. Pick another lab, or restart with guidance off to test yourself.`)}</p></div>`; }
  else {
    now.className = Sim.guide ? '' : 'off';
    const text = nxt.view !== Sim.view ? `Go to ${Sim.views[nxt.view].title}: ${nxt.text}` : (cue && cue.say) || nxt.text;
    now.innerHTML = `<div class="num"><span>Step</span><strong>${nextIdx + 1}</strong><small>of ${st.length}</small></div><div class="txt"><p>${esc(text)}</p>${nxt.hint ? `<em>${esc(nxt.hint)}</em>` : ''}</div>`;
  }
  if (nxt) applyCue(cue, nxt.view);
  navInView();
  scrollHint();
}
// on narrow screens the work areas are one scrolling row: keep the highlighted (or current) area in sight
function navInView() {
  const nav = $('#nav'); if (!nav || nav.scrollWidth <= nav.clientWidth + 2) return;
  const b = nav.querySelector('.cue') || nav.querySelector('[aria-current="true"]'); if (!b) return;
  const nr = nav.getBoundingClientRect(), br = b.getBoundingClientRect();
  if (br.left < nr.left + 8 || br.right > nr.right - 8) nav.scrollLeft += br.left - nr.left - Math.max(12, (nr.width - br.width) / 2);
}
// when every highlighted target is off-screen (for example a tray button further down), show an arrow that points to it
function scrollHint() {
  let h = document.getElementById('cuehint');
  if (!h) {
    h = document.createElement('button'); h.id = 'cuehint'; h.type = 'button'; h.className = 'cuehint'; h.hidden = true;
    h.addEventListener('click', () => { const el = h._target; if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    document.body.appendChild(h);
  }
  const els = [...document.querySelectorAll('#stage .cuering, #acts .cue, #tray .cue, #steps .cue, #nav .cue, #stage .cueable .cue')].filter(e => e.getClientRects().length);
  // the visible band for an element: the window, narrowed to the side panel when the panel scrolls on its own
  const vh = window.innerHeight, band = e => { let a = 24, z = vh - 24; const sc = e.closest('aside'); if (sc && sc.scrollHeight > sc.clientHeight + 2) { const s = sc.getBoundingClientRect(); a = Math.max(a, s.top); z = Math.min(z, s.bottom); } return [a, z]; };
  const vis = e => { const r = e.getBoundingClientRect(), [a, z] = band(e); return r.bottom > a && r.top < z; };
  if (!Sim.guide || !els.length || els.some(vis)) { h.hidden = true; h._target = null; return; }
  const el = els[0], r = el.getBoundingClientRect(), down = r.top >= band(el)[1], where = el.closest('#tray') ? 'in the parts tray' : el.closest('#acts') ? 'in the action buttons' : el.closest('#nav') ? 'in the menu' : el.closest('#steps') ? 'in the step list' : 'on the picture';
  h._target = el; h.hidden = false; h.className = 'cuehint ' + (down ? 'down' : 'up');
  h.innerHTML = `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="${down ? 'M10 3v12M4 10l6 6 6-6' : 'M10 17V5M4 10l6-6 6 6'}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Next action ${down ? 'below' : 'above'}, ${where}</span>`;
  const w = h.offsetWidth || 320, cx = Math.min(Math.max(r.left + r.width / 2, w / 2 + 12), window.innerWidth - w / 2 - 12);
  h.style.left = cx + 'px';
  h.setAttribute('aria-label', `Next action ${down ? 'below' : 'above'} ${where}. Click to scroll to it.`);
}
let hintRaf = 0;
['scroll', 'resize'].forEach(ev => window.addEventListener(ev, () => { if (!hintRaf) hintRaf = requestAnimationFrame(() => { hintRaf = 0; scrollHint(); }); }, { passive: true }));
// the side panel scrolls on its own on wide screens: fade its lower edge while there is more below
function asideMore() { const a = document.querySelector('aside'); if (a) a.classList.toggle('more', a.scrollHeight > a.clientHeight + 2 && a.scrollTop + a.clientHeight < a.scrollHeight - 4); }
document.addEventListener('scroll', e => { if (e.target && e.target.matches && e.target.matches('aside')) asideMore(); }, true);
window.addEventListener('resize', () => asideMore(), { passive: true });
const toggle = (el, on, name) => { if (!el) return; el.setAttribute('aria-pressed', on); el.innerHTML = `<i class="led" aria-hidden="true"></i>${name}<b>${on ? 'on' : 'off'}</b>`; };
function render() {
  const sc = Sim.scenarios[Sim.scenario], st = steps(), v = Sim.views[Sim.view];
  const done = st.map(s => !!s.done(T)), nextIdx = done.indexOf(false), nDone = done.filter(Boolean).length;
  const nxt = nextIdx >= 0 ? st[nextIdx] : null;
  // header: one lamp per step (green done, amber next), the count, and the mistakes
  const rail = $('#rail');
  if (rail) { rail.innerHTML = st.map((s, i) => `<i${done[i] ? ' class="d"' : i === nextIdx ? ' class="n"' : ''}></i>`).join(''); rail.setAttribute('aria-label', `${nDone} of ${st.length} steps done`); }
  $('#progtxt').innerHTML = `<b>${nDone}</b> of ${st.length} steps done`;
  const mi = $('#mist'); if (mi) { mi.className = 'mist' + (T.errors ? ' has' : ''); mi.innerHTML = `<i class="led" aria-hidden="true"></i>${T.errors} mistake${T.errors === 1 ? '' : 's'}`; }
  toggle($('#guidebtn'), Sim.guide, 'Guidance'); toggle($('#sndbtn'), SFX.on(), 'Sound');
  const gbt = $('#guidebtn'); if (gbt) { gbt.disabled = !!Sim.exam; if (Sim.exam) gbt.innerHTML = '<i class="led" aria-hidden="true"></i>Guidance<b>off: exam</b>'; }
  $('#nav').innerHTML = Sim.order.map(id => {
    const mine = st.map((s, i) => [s, i]).filter(([s]) => s.view === id), d = mine.filter(([, i]) => done[i]).length, all = mine.length && d === mine.length;
    return `<button data-act="go" data-arg="${id}" aria-current="${id === Sim.view}"><span>${esc(Sim.views[id].title)}</span>${mine.length ? `<small class="${all ? 'done' : ''}" aria-label="${d} of ${mine.length} steps done">${all ? '<i class="led" aria-hidden="true"></i>' : ''}${d}/${mine.length}</small>` : ''}</button>`;
  }).join('');
  const stg = $('#stage'); stg.innerHTML = v.render(T); stg.classList.toggle('zoom', !!Sim.zoom);
  const zb = $('#zoombtn'); if (zb) { zb.setAttribute('aria-pressed', !!Sim.zoom); zb.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.8" cy="6.8" r="4.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.2 10.2L14 14${Sim.zoom ? '' : 'M6.8 4.6v4.4'}M4.6 6.8h4.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>${Sim.zoom ? 'Fit to screen' : 'Zoom in'}`; zb.hidden = !stg.querySelector(':scope > svg'); }
  $('#acts').innerHTML = (v.actions ? v.actions(T) : []).join('');
  // the result of the last action; nothing until there is one
  const c = $('#coach'), msg = Sim.coach.msg;
  c.className = msg ? Sim.coach.kind : 'empty';
  c.innerHTML = msg ? `<i class="led" aria-hidden="true"></i><p>${Sim.coach.kind === 'err' ? '<b class="tag">Mistake</b>' : ''}${esc(msg)}</p>` : '';
  const bt = $('#brieftxt'); if (bt) { bt.textContent = sc.intro || ''; $('#brief').hidden = !sc.intro; }
  const mine = st.map((s, i) => [s, i]).filter(([s]) => s.view === Sim.view);
  $('#steps').innerHTML = `<h2>${esc(sc.title)}</h2>` +
    (nxt && nxt.view !== Sim.view ? `<div class="elsewhere"><p>Next step is in <b>${esc(Sim.views[nxt.view].title)}</b>.</p>${button('Go there', 'go', nxt.view, true)}</div>` : '') +
    `<p class="where">Steps in <b>${esc(v.title)}</b></p>` +
    (mine.length ? `<ol class="steps">${mine.map(([s, i]) => `<li class="${done[i] ? 'done' : i === nextIdx ? 'next' : ''}"><b>${done[i] ? '&#10003;' : i + 1}</b><span>${esc(s.text)}</span></li>`).join('')}</ol>` : '<p class="none">No steps in this area for this lab.</p>');
  const tray = (v.tray ? v.tray(T) : '') + refsHtml(v);
  $('#tray').style.display = tray ? '' : 'none'; $('#tray').innerHTML = tray;
  $('#log').innerHTML = T.log.slice(-60).reverse().map(l => `<li class="${l.kind}">${esc(l.msg)}</li>`).join('');
  guide();
  asideMore();
  if (v.after) v.after(T);
  Sim.hooks.render.forEach(h => h());
}
function loadScenario(id) {
  SFX.stopAll(0.3);
  Sim.scenario = id; const sc = Sim.scenarios[id];
  // an exam runs with guidance off, whatever the setting was; leaving it puts the setting back
  if (sc.exam) { if (!Sim.exam) Sim.guideWas = Sim.guide; Sim.guide = false; } else if (Sim.exam && Sim.guideWas !== undefined) Sim.guide = Sim.guideWas;
  Sim.exam = !!sc.exam;
  T = sc.setup(); Sim.view = sc.start || Sim.order[0]; Sim.coach = { kind: 'info', msg: '' };
  T.log.push({ kind: 'info', msg: 'Lab started: ' + sc.title });
  const s = $('#scn'); if (s && s.value !== id) s.value = id;
  const br = $('#brief'); if (br) br.open = !(window.matchMedia && matchMedia('(max-width: 640px)').matches);   // open on a new lab; on a phone it starts folded, under the step bar
  render();
  Sim.hooks.load.forEach(h => h(id));
}
// switch to another server model: build its pack if needed, list its scenarios, start one
function loadModel(id, scenarioId) {
  const m = Sim.models[id]; buildModel(m);
  Sim.model = id; window.pack = m.reg.api;
  const ms = $('#model'); if (ms && ms.value !== id) ms.value = id;
  const s = $('#scn'); if (s) s.innerHTML = Object.values(Sim.scenarios).map(x => `<option value="${x.id}">${esc(x.title)}</option>`).join('');
  loadScenario(Sim.scenarios[scenarioId] ? scenarioId : Sim.scenarios[m.defaultScenario] ? m.defaultScenario : Object.keys(Sim.scenarios)[0]);
}
Sim.do = (name, arg) => { const f = Sim.actions[name] || CORE[name]; if (f) { Sim.hooks.before.forEach(h => h(name, arg)); f(arg); render(); } };
CORE.go = id => { if (Sim.views[id]) Sim.view = id; };
CORE.reset = () => loadScenario(Sim.scenario);
CORE.guide = () => { if (Sim.exam) return say('info', 'Guidance stays off in an exam.'); Sim.guide = !Sim.guide; };
CORE.zoom = () => { Sim.zoom = !Sim.zoom; };
CORE.sound = () => { SFX.set(!SFX.on()); if (SFX.on()) SFX.play('drive'); };
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (el) Sim.do(el.dataset.act, el.dataset.arg); });
document.addEventListener('input', e => { const f = e.target.dataset && e.target.dataset.field; if (!f || !T) return; Sim.hooks.before.forEach(h => h('field', f)); if (f.startsWith('mp.')) MemPlan.field(f, e.target.value); else if (f.startsWith('os.')) OSI.field(f.slice(3), e.target.value); else { const h = REG().field; if (h) h(f, e.target.value); } guide(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.enter) { e.preventDefault(); Sim.do(e.target.dataset.enter, ''); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.hot')) { e.preventDefault(); Sim.do(e.target.dataset.act, e.target.dataset.arg); }
});
