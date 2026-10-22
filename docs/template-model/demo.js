/* Template model pack: the smallest working pack. Copy this folder to models/<your-id>/, change manifest.json,
   add the id to models/index.json, then grow it view by view. Names here (IMG, PROFILE, fresh) may repeat in
   other packs: each pack has its own scope. */
const IMG = {};                                  // photos: 'name': 'data:image/webp;base64,...'
const PROFILE = { name: 'Template server' };
// the twin state; errors, log and flags are required by the engine
function fresh() { return { lamp: false, ticks: 0, errors: 0, log: [], flags: {} }; }

Sim.registerView({
  id: 'panel', title: 'Front panel',
  keep: [['Example tip', 'Each view ends with its own "Things to keep in mind".']],
  render: t => frame('Front panel', `<g${hot('lamp', '', 'Power button')}><rect x="100" y="100" width="200" height="80" rx="8" fill="${t.lamp ? '#45D07F' : '#555'}" class="zone"/></g><text x="100" y="220" class="st">Seconds running: ${Math.floor(t.ticks / 5)}</text>`),
  actions: t => [button(t.lamp ? 'Switch off' : 'Switch on', 'lamp')]
});
Sim.on('lamp', () => { T.lamp = !T.lamp; say('ok', 'Power ' + (T.lamp ? 'on' : 'off') + '.'); });
Sim.registerRule(t => t.lamp ? [] : [{ lvl: 'warn', msg: 'The server is off.' }]);
Sim.every(() => { if (T.lamp) T.ticks++; }, 200);           // runs only while this model is active
Sim.registerScenario({
  id: 'demo', title: 'Example: switch the server on', intro: 'Press the power button.', start: 'panel', setup: fresh,
  steps: [{ view: 'panel', text: 'Switch the server on', hint: 'The button turns green.', done: t => t.lamp, cue: () => ({ act: 'lamp', arg: '', say: 'Click the power button.' }) }]
});
Sim.expose({ PROFILE, fresh });
