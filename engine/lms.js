
/* ============ 5. Learning platform link (SCORM 1.2) ============
   Active only when the page runs inside a learning platform's SCORM player (Moodle, Canvas, Blackboard...):
   the player provides the SCORM 1.2 API object (window.API) in a parent frame or the opening window.
   Outside a platform nothing here runs and the simulator works exactly as before.
   Grading (set per package in the launch link: &pass=70&per=10):
   - a graded run is one done with guidance off from the first action to the end:
     score = 100 minus `per` points per mistake (never below 0), passed when score >= `pass`; a lab that grades a plan
     (T.grade, the RAM Distributor exam) takes its own points off as well, and an unsupported layout scores 0;
   - a run that used guidance is practice: it is recorded as completed, without a score;
   - the best result is kept: a later practice run or a weaker graded run never lowers it.
   Progress is saved (compressed, in cmi.suspend_data), so a student who leaves mid-scenario resumes there. */
const LMS = (() => {
  const q = new URLSearchParams(location.search), num = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) && n >= 0 && n <= 100 ? n : d; };
  const L = { api: null, on: false, PASS: num(q.get('pass'), 70), PER: num(q.get('per'), 10), t0: Date.now(), runT0: Date.now(), guided: false, done: false, result: null,
    best: { status: '', score: null }, notes: '', last: '', timer: null, dirty: false, closed: false };
  function find(w) {
    for (let n = 0; w && n < 12; n++) {
      try { if (w.API && typeof w.API.LMSInitialize === 'function') return w.API; } catch (e) { return null; }   // another site's frame: stop
      if (!w.parent || w.parent === w) break; w = w.parent;
    }
    return null;
  }
  const get = k => { try { return String(L.api.LMSGetValue(k) || ''); } catch (e) { return ''; } };
  const set = (k, v) => { try { L.api.LMSSetValue(k, String(v)); L.dirty = true; } catch (e) { } };
  const commit = () => { try { L.api.LMSCommit(''); L.dirty = false; } catch (e) { } };
  // SCORM 1.2 time span: HHHH:MM:SS.SS
  const span = ms => { const s = ms / 1000, h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return `${String(h).padStart(4, '0')}:${String(m).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`; };
  // saved progress: deflate + base64 where the browser can compress (about 2 KB), plain JSON otherwise
  async function encode(obj) {
    const json = JSON.stringify(obj);
    if (typeof CompressionStream === 'function') {
      try {
        const buf = new Uint8Array(await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
        let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
        return 'z1:' + btoa(bin);
      } catch (e) { }
    }
    return 'j1:' + json;
  }
  async function decode(s) {
    if (s.startsWith('j1:')) return JSON.parse(s.slice(3));
    if (s.startsWith('z1:') && typeof DecompressionStream === 'function') {
      const bin = atob(s.slice(3)), buf = Uint8Array.from(bin, c => c.charCodeAt(0));
      return JSON.parse(await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text());
    }
    return null;
  }
  function save() {
    if (L.timer) return;
    L.timer = setTimeout(async () => {
      L.timer = null; if (!T || L.closed) return;
      const { log, ...t } = T;
      const s = await encode({ v: 1, model: Sim.model, scenario: Sim.scenario, view: Sim.view, guide: Sim.guide, guided: L.guided, done: L.done, t });
      if (s.length <= 4096 && s !== L.last) { set('cmi.suspend_data', s); L.last = s; }
    }, 1000);
  }
  // header: which lab, and whether this run is graded
  function bar() {
    const el = document.getElementById('lmsbar'); if (!el || !Sim.scenario) return;
    const sc = Sim.scenarios[Sim.scenario], m = Sim.models[Sim.model];
    let mode, cls;
    if (L.done && L.result) { const r = L.result; mode = r.graded ? `Graded run finished: score ${r.score}, ${r.status === 'passed' ? 'passed' : 'not passed yet'}` : 'Practice run finished: recorded as completed'; cls = r.graded && r.status === 'passed' ? 'ok' : 'info'; }
    else if (L.guided) { mode = 'Practice run: guidance was used, so this run is not graded'; cls = 'info'; }
    else if (Sim.guide) { mode = 'Guidance is on. Turn it off before your first action for a graded run'; cls = 'warn'; }
    else { mode = `Graded run: guidance off. Pass mark ${L.PASS}, minus ${L.PER} per mistake`; cls = 'ok'; }
    el.innerHTML = `<b>${esc(sc.title)}</b><small>${esc(m.name)}</small><span class="mode ${cls}">${esc(mode)}</span>`;
  }
  function report() {
    const m = T.errors, mins = Math.max(1, Math.round((Date.now() - L.runT0) / 60000)), when = new Date().toISOString().slice(0, 16).replace('T', ' ');
    let note;
    if (!L.guided) {
      // a lab that grades a plan (the RAM Distributor exam) adds its own points off, or fails an unsupported layout
      const g = T.grade || null, pen = g ? g.penalty || 0 : 0, fail = !!(g && g.fail);
      const score = fail ? 0 : Math.max(0, 100 - L.PER * m - pen), best = L.best.score === null ? score : Math.max(L.best.score, score);
      const status = L.best.status === 'passed' || best >= L.PASS ? 'passed' : 'failed';
      L.best = { status, score: best };
      set('cmi.core.score.min', 0); set('cmi.core.score.max', 100); set('cmi.core.score.raw', best); set('cmi.core.lesson_status', status);
      L.result = { graded: true, score, best, status, m, pen, fail };
      note = `${when}: graded run, ${m} mistake${m === 1 ? '' : 's'}${fail ? ', unsupported memory layout' : pen ? `, ${pen} points off the memory plan` : ''}, score ${score}, about ${mins} min`;
    } else {
      if (L.best.status !== 'passed' && L.best.status !== 'failed') { L.best.status = 'completed'; set('cmi.core.lesson_status', 'completed'); }
      L.result = { graded: false, m };
      note = `${when}: practice run with guidance, ${m} mistake${m === 1 ? '' : 's'}, about ${mins} min`;
    }
    L.notes = (L.notes ? L.notes + ' | ' : '') + note; if (L.notes.length > 3900) L.notes = L.notes.slice(L.notes.length - 3900);
    set('cmi.comments', L.notes); set('cmi.core.session_time', span(Date.now() - L.t0)); commit();
  }
  function progress() {
    if (!T || !Sim.scenario) return;
    const st = Sim.scenarios[Sim.scenario].steps, idx = st.findIndex(s => !s.done(T)), loc = idx < 0 ? 'done' : `step ${idx + 1} of ${st.length}`;
    if (loc !== L.loc) { set('cmi.core.lesson_location', loc); L.loc = loc; }
    if (idx < 0 && !L.done) { L.done = true; report(); guide(); }
    bar();
  }
  function close() {
    if (!L.on || L.closed) return; L.closed = true;
    set('cmi.core.session_time', span(Date.now() - L.t0)); set('cmi.core.exit', L.done ? '' : 'suspend'); commit();
    try { L.api.LMSFinish(''); } catch (e) { }
  }
  // connect; returns saved progress to resume, or null
  L.init = async () => {
    L.api = find(window) || (window.opener ? find(window.opener) : null);
    if (!L.api) return null;
    let ok = 'false'; try { ok = String(L.api.LMSInitialize('')); } catch (e) { }
    if (ok !== 'true') { L.api = null; return null; }
    L.on = true; document.documentElement.classList.add('in-lms');
    const st = get('cmi.core.lesson_status'), sc = get('cmi.core.score.raw');
    L.best = { status: st, score: sc === '' || isNaN(+sc) ? null : +sc }; L.notes = get('cmi.comments');
    if (!st || st === 'not attempted') set('cmi.core.lesson_status', 'incomplete');
    commit();
    // a run counts as practice once any action or typed field happens while guidance is on (moving between views does not count)
    Sim.hooks.before.push(name => { if (name === 'reset') L.loading = true; });
    const VIEWING = ['go', 'guide', 'reset', 'sound', 'zoom'];   // moving around and settings, not lab actions
    Sim.hooks.before.push(name => { if (!VIEWING.includes(name) && Sim.guide && !L.done) L.guided = true; });
    // every render, including those from timers (a drive rebuild, a soak), checks for the end of the run and saves progress
    Sim.hooks.render.push(() => { if (!L.loading) { progress(); save(); } });
    Sim.hooks.load.push(() => { L.guided = false; L.done = false; L.result = null; L.runT0 = Date.now(); L.loading = false; progress(); save(); });
    Sim.doneText = () => {
      const r = L.result; if (!r) return null;
      if (!r.graded) return `Practice run finished with ${r.m} mistake${r.m === 1 ? '' : 's'}: recorded as completed. For a graded run, press Restart, turn Guidance off, then work through it without help.`;
      return `Graded run finished: ${r.m} mistake${r.m === 1 ? '' : 's'}${r.fail ? ', an unsupported memory layout' : r.pen ? `, ${r.pen} points off the memory plan` : ''}, score ${r.score} of 100 (pass mark ${L.PASS}). ${r.status === 'passed' ? 'Passed' : 'Not passed yet: restart and try again'}${r.best > r.score ? `. Your best score, ${r.best}, is kept` : ''}. Your result is saved to the course.`;
    };
    window.addEventListener('pagehide', close); window.addEventListener('beforeunload', close);
    setInterval(() => { if (L.dirty && !L.closed) commit(); }, 30000);
    const sus = get('cmi.suspend_data');
    try { return sus ? await decode(sus) : null; } catch (e) { return null; }
  };
  // continue a saved run (same model and scenario, not finished)
  L.restore = r => {
    if (!r || r.v !== 1 || r.done || r.model !== Sim.model || r.scenario !== Sim.scenario || !r.t) return false;
    // a run saved by an older version may lack newer state fields: start from a fresh setup and lay the saved state over it
    T = Object.assign(Sim.scenarios[Sim.scenario].setup(), r.t); T.log = [{ kind: 'info', msg: 'Resumed where you left off.' }];
    if (Sim.views[r.view]) Sim.view = r.view; Sim.guide = !!r.guide; L.guided = !!r.guided;
    Sim.coach = { kind: 'info', msg: 'Welcome back: you are where you left off.' };
    render(); progress(); return true;
  };
  return L;
})();
