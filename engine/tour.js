
/* ============ 6. How to use: the tour on the first page ============
   A short walkthrough of the screen, the first thing a new student sees: a welcome card, then one card per part of the
   page (model and lab, or the course bar inside a learning platform; Guidance, Sound, Restart, progress, work areas,
   step, workbench, actions, briefing, steps, reference, event log), each with that part spotlighted, then a closing card.
   It opens by itself on the first visit in this browser, not when a saved run resumes; "How to use" in the header opens it
   again. ?tour=off never opens it by itself, ?tour=on always does. The tour is not a lab action: it does not go through
   Sim.do, so it never counts as guidance used, a mistake or a step, and it works the same in exams and SCORM packages.
   Keys: Right / Left for next and back, Esc to close. ==== */
const Tour = (() => {
  const KEY = 'sbt.tour', q = new URLSearchParams(location.search);
  const seen = () => { try { return localStorage.getItem(KEY) === 'seen'; } catch (e) { return false; } };
  const remember = () => { try { localStorage.setItem(KEY, 'seen'); } catch (e) { } };
  const lms = () => typeof LMS !== 'undefined' && LMS.on;
  const pass = () => lms() ? LMS.PASS : 70, per = () => lms() ? LMS.PER : 10;
  const shown = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  const $$ = s => [...document.querySelectorAll(s)];

  // the cards: sel = what to spotlight (all matches together); a card whose part is not on the page is left out
  // (the menus inside a learning platform, the course bar outside one, an empty action row)
  const STEPS = [
    { title: 'Welcome to the Server build trainer', body: () => `<p>You work on photos of a real server: the same parts, in the same order as the vendor's service procedure. This tour shows the screen in about a minute.</p>
      <ol class="tour-flow">
        <li><b>${lms() ? 'Your course opened a lab' : 'Pick a server and a lab'}</b><span>${lms() ? 'The bar at the top names it.' : 'At the top of the page.'}</span></li>
        <li><b>Read the step</b><span>Above the workbench: what to do now.</span></li>
        <li><b>Click the part</b><span>On the photo, or its button below it.</span></li>
        <li><b>Finish every step</b><span>Each mistake costs ${per()} points; ${pass()} passes.</span></li>
      </ol>` },
    { sel: '.pick label:not(.lab)', title: 'Server model', body: () => '<p>Choose the server to work on. Each model has its own labs, photos and vendor rules.</p>' },
    { sel: '.pick label.lab', title: 'Lab', body: () => '<p>Choose the job: a new server install, a part replacement, memory planning, an OS install. Labs marked <b>exam</b> run without guidance and are scored. Changing the lab starts it from step 1.</p>' },
    { sel: '#lmsbar', title: 'This lab, from your course', body: () => `<p>Your course opened this lab. The bar shows whether this run is graded.</p><p><b>Graded:</b> turn Guidance off before your first action and keep it off to the end. Pass mark ${pass()}, minus ${per()} per mistake; your best result is kept.</p><p><b>Practice:</b> a run with guidance on at any action is recorded as completed, without a score.</p>` },
    { sel: '#guidebtn', title: 'Guidance', body: () => Sim.exam ? '<p>Guidance shows the next part with a ring, an arrow and a "Click here" tag. This lab is an exam, so it stays off: you work from the step text and the reference panels.</p>'
      : `<p>On: a ring, an arrow and a "Click here" tag show the next part, and each step has a hint. Practice with it on.</p><p>Off: no help on the picture. Use it to test yourself${lms() ? ', and for a graded run' : ''}.</p>` },
    { sel: '#sndbtn', title: 'Sound', body: () => '<p>Clicks when a part locks into place, and the fans when the server powers on. Turn it off in a quiet room.</p>' },
    { sel: '.btns [data-act="reset"]', title: 'Restart', body: () => '<p>Starts this lab again from step 1, with the server back as it was and the mistakes at zero.</p>' },
    { sel: '.prog', title: 'Progress and mistakes', body: () => `<p>One segment per step: green when done. On the right, the steps done and the mistakes so far.</p><p>A wrong action is a <b>mistake</b>: the simulator explains what was wrong, and it costs ${per()} points of 100. ${pass()} passes.</p>` },
    { sel: '.navwrap', title: 'Work areas', body: () => '<p>The parts of the server and the tools: chassis, processors, memory, rack, cables, console and more. The numbers show the steps done in each area.</p><p>The step tells you which area to open; with Guidance on, that area pulses.</p>' },
    { sel: '#now', title: 'The step to do now', body: () => '<p>What to do next, in the order an engineer does the job. Read it before you click. With Guidance on, a hint below it explains how.</p>' },
    { sel: '.stagewrap', title: 'Workbench', body: () => '<p>The server, on photos of the real parts. Click the part itself: a latch, a screw, a slot, a cable, a port. Text boxes and consoles take typing.</p><p>Feedback appears under the picture: green when right, red with the reason when it is a mistake.</p>' },
    { sel: '#acts', title: 'Action buttons', body: () => '<p>The actions of this area as buttons, for the same jobs as clicking on the picture. Use either one.</p>' },
    { sel: '#brief', title: 'Lab briefing', body: () => '<p>The work order: what the lab asks for, what it teaches and the values to use. Read it before you start.</p>' },
    { sel: '#steps', title: 'Steps', body: () => '<p>The steps of this lab in the open area, ticked when done. The current one is marked.</p>' },
    { sel: '#tray', title: 'Reference', body: () => '<p>The vendor\'s procedure, component locations, population tables and cable schedules for this area. It stays visible in exams: look things up like on a real job.</p>' },
    { sel: '#logwrap', title: 'Event log', body: () => '<p>Everything you did in this lab, newest first, mistakes included. Open it to see where a run went wrong.</p>' },
    { title: 'Ready', body: () => `<p>${Sim.exam ? 'This lab is an exam: no guidance, every mistake counts. Use the briefing and the reference panels.' : `A good way to learn a lab: do it once with Guidance on, then press Restart, turn Guidance off and do it again${lms() ? ' for your grade' : ' to test yourself'}.`}</p><p>Open this tour again any time with <b>How to use</b> at the top of the page.</p>`, last: true }
  ];

  let el = null, list = [], i = 0, raf = 0, back = null;
  const live = () => STEPS.filter(s => !s.sel || targets(s).length);
  function build() {
    el = document.createElement('div'); el.id = 'tour'; el.className = 'tour';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'tourh');
    el.innerHTML = `<div class="tour-veil"></div><div class="tour-hole" aria-hidden="true"></div>
      <div class="tour-card"><div class="tour-k" id="tourk"></div><h2 id="tourh"></h2><div class="tour-t" id="tourt"></div>
        <div class="tour-dots" aria-hidden="true"></div>
        <div class="tour-b"><button type="button" class="tour-skip" data-tour="close">Skip tour</button><span><button type="button" class="btn" data-tour="back">Back</button><button type="button" class="btn pri" data-tour="next">Next</button></span></div></div>`;
    el.addEventListener('click', e => { const b = e.target.closest('[data-tour]'); if (!b) return; const a = b.dataset.tour; if (a === 'close') close(); else if (a === 'back') go(i - 1); else go(i + 1); });
    document.body.appendChild(el);
  }
  function targets(s) { return s.sel ? $$(s.sel).filter(shown) : []; }
  function go(n) {
    if (n >= list.length) return close();
    i = Math.max(0, n); const s = list[i], tg = targets(s), card = el.querySelector('.tour-card');
    el.classList.toggle('center', !tg.length);
    el.querySelector('#tourk').textContent = i === 0 ? 'How to use' : s.last ? 'Done' : `${i} of ${list.length - 2}`;
    el.querySelector('#tourh').textContent = s.title;
    el.querySelector('#tourt').innerHTML = s.body();
    el.querySelector('.tour-dots').innerHTML = list.map((_, k) => `<i class="${k === i ? 'on' : k < i ? 'past' : ''}"></i>`).join('');
    el.querySelector('[data-tour="back"]').hidden = i === 0;
    el.querySelector('[data-tour="next"]').textContent = i === 0 ? 'Start the tour' : s.last ? (lms() || Sim.exam ? 'Start the lab' : 'Start') : 'Next';
    el.querySelector('.tour-skip').hidden = !!s.last;
    if (tg.length) {
      // bring the part into view (the side panel scrolls on its own): from its top when it is tall, or when the card has no
      // room beside it but fits under it (a phone); else to the middle
      const r = box(tg), W = innerWidth, H = innerHeight, cw = card.offsetWidth, ch = card.offsetHeight;
      const side = r.x + r.w + cw + 30 <= W || r.x - cw - 30 >= 0, top = r.h > H * 0.55 || (!side && r.h + ch + 50 <= H);
      tg[0].scrollIntoView({ block: top ? 'start' : 'center', inline: 'nearest', behavior: 'instant' });
    }
    place();
    card.querySelector('[data-tour="next"]').focus({ preventScroll: true });
  }
  const box = tg => { const rs = tg.map(t => t.getBoundingClientRect()); const x = Math.min(...rs.map(r => r.left)), y = Math.min(...rs.map(r => r.top));
    return { x, y, w: Math.max(...rs.map(r => r.right)) - x, h: Math.max(...rs.map(r => r.bottom)) - y }; };
  // the spotlight around the part, the card beside it: below, above, right or left, wherever it fits; else docked at the bottom
  function place() {
    if (!el) return;
    const s = list[i], tg = targets(s), hole = el.querySelector('.tour-hole'), card = el.querySelector('.tour-card');
    const W = innerWidth, H = innerHeight, M = 12, P = 6;
    card.style.left = card.style.top = '';
    if (!tg.length) { hole.style.display = 'none'; return; }
    const r = box(tg), x0 = Math.max(4, r.x - P), y0 = Math.max(4, r.y - P), x1 = Math.min(W - 4, r.x + r.w + P), y1 = Math.min(H - 4, r.y + r.h + P);
    Object.assign(hole.style, { display: '', left: x0 + 'px', top: y0 + 'px', width: Math.max(0, x1 - x0) + 'px', height: Math.max(0, y1 - y0) + 'px' });
    const cw = card.offsetWidth, ch = card.offsetHeight, clampX = v => Math.min(Math.max(M, v), W - cw - M), clampY = v => Math.min(Math.max(M, v), H - ch - M);
    let x, y;
    if (y1 + M + ch <= H - M) { x = clampX(x0); y = y1 + M; }
    else if (y0 - M - ch >= M) { x = clampX(x0); y = y0 - M - ch; }
    else if (x1 + M + cw <= W - M) { x = x1 + M; y = clampY(y0); }
    else if (x0 - M - cw >= M) { x = x0 - M - cw; y = clampY(y0); }
    else { x = clampX((W - cw) / 2); y = H - ch - M; }
    card.style.left = x + 'px'; card.style.top = y + 'px';
  }
  const later = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(place); };
  function key(e) {
    if (!el) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'Tab') {   // keep the focus in the card
      const bs = [...el.querySelectorAll('.tour-card button')].filter(b => !b.hidden), k = bs.indexOf(document.activeElement);
      e.preventDefault(); bs[(k + (e.shiftKey ? bs.length - 1 : 1)) % bs.length].focus();
    }
    e.stopPropagation();
  }
  function open() {
    if (el) return;
    back = document.activeElement; list = live(); build();
    document.documentElement.classList.add('touring');
    addEventListener('resize', later); addEventListener('scroll', later, true); document.addEventListener('keydown', key, true);
    go(0);
  }
  function close() {
    if (!el) return;
    remember(); el.remove(); el = null; cancelAnimationFrame(raf);
    document.documentElement.classList.remove('touring');
    removeEventListener('resize', later); removeEventListener('scroll', later, true); document.removeEventListener('keydown', key, true);
    scrollTo({ top: 0, behavior: 'instant' });
    const b = back && document.contains(back) && back !== document.body ? back : document.getElementById('tourbtn'); if (b) b.focus({ preventScroll: true });
  }
  // on load: the first visit opens the tour, a resumed run does not
  const auto = resumed => { const t = q.get('tour'); if (t === 'on' || (t !== 'off' && !resumed && !seen())) open(); };
  document.addEventListener('click', e => { if (e.target.closest('#tourbtn')) open(); });
  return { open, close, auto, isOpen: () => !!el, steps: () => list.map(s => ({ title: s.title, sel: s.sel || null })), index: () => i };
})();
