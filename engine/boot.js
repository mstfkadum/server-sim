
/* ============ 7. Boot: fill the model and scenario menus, connect to a learning platform if there is one,
   then start the first model, or the one in the link: ?model=...&scenario=...&guide=off; on a first visit, the tour ============ */
(async () => {
  const ms = $('#model'), scn = $('#scn'), q = new URLSearchParams(location.search);
  ms.innerHTML = Sim.modelOrder.map(id => `<option value="${id}">${esc(Sim.models[id].name)}</option>`).join('');
  ms.addEventListener('change', () => loadModel(ms.value));
  scn.addEventListener('change', () => loadScenario(scn.value));
  window.Sim = Sim; window.twin = () => T; window.LMS = LMS;
  const saved = await LMS.init();                      // null outside a learning platform
  if (q.get('guide') === 'off') Sim.guide = false;
  const want = q.get('model');
  loadModel(Sim.models[want] ? want : Sim.modelOrder[0], q.get('scenario'));
  Tour.auto(saved ? LMS.restore(saved) : false);
})();
