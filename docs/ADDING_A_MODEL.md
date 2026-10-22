# Adding a server model

The simulator is one shared **engine** plus one **model pack** per server. The Cisco UCS C240 M4 LFF is the
first pack. A new server (for example an HPE ProLiant) is a new folder under `models/`; the engine does not change.

## Project layout

```
engine/head.html        page layout, header (Server model and Lab menus) and styles
engine/fonts.css        the two typefaces, embedded (Instrument Sans, Big Shoulders; SIL Open Font License)
engine/engine.js        the shared engine: model registry, scenario runner, cues, rendering shell, helpers
engine/memplan.js       the RAM Distributor: planner, ranking and exam grading, driven by a pack's memory rules
engine/os-core.js       OS install over virtual media: ISO library, boot logic, handover check, lab steps
engine/os-ubuntu.js     the Ubuntu Server installer; os-rocky.js the Rocky Linux installer; os-esxi.js ESXi and its DCUI
engine/os-shell.js      the installed Linux system: console login and a shell that answers from the twin
engine/boot.js          fills the menus and starts the first model (or ?model=...&scenario=...)
models/index.json       which models are built, in dropdown order
models/<id>/            one model pack: manifest.json plus its JavaScript files
docs/template-model/    a minimal working pack to copy
tests/                  automated checks (need Node.js and Playwright)
build.js                joins everything into one self-contained HTML file
```

Build: `node build.js` writes `dist/index.html` (or `node build.js path/to/out.html`). That one file is the whole
simulator: open it in a browser, or upload it to any static web host.

## How a pack is built in

`build.js` reads each `models/<id>/manifest.json`, joins the pack's files in the listed order and wraps them in
one function scope:

```js
Sim.registerModel({ id, name, vendor, summary, defaultScenario, pack() { /* the pack's files */ } });
```

The pack runs the first time its model is picked in the menu. Because every pack has its own scope, two packs can
both define `IMG`, `PROFILE`, `fresh()` or any helper without clashing. Never put pack things on `window`.

## manifest.json

```json
{
  "id": "hpe-dl380-gen10-lff",
  "name": "HPE ProLiant DL380 Gen10 LFF",
  "vendor": "HPE",
  "summary": "2U, 12 x 3.5-inch drive bays, iLO 5",
  "defaultScenario": "install",
  "files": ["assets.js", "model.js", "views.js", "scenarios.js"]
}
```

- `id` is unique and is what `?model=` links use. Add it to `models/index.json` to put it in the menu.
- `scorm` (optional) lists the labs for the SCORM packages: `{ "title", "passMark", "pointsPerMistake",
  "lessons": [{ "scenario": "install", "title": "Lab 1: New server install" }, ...] }`. See `MOODLE_SCORM.md`.
- `name` is the text in the Server model menu.
- `files` load in order: images first, then state and rules, then views, then scenarios.

## What a pack provides

**Twin state.** Each scenario's `setup()` returns a fresh state object for that server. It must contain
`errors: 0, log: [], flags: {}`; the engine's `say()` and `bad()` use them. Everything else is the pack's own
(drive bays, DIMM slots, risers, fans, management settings and so on).

**Views** (the left menu, in registration order):

```js
Sim.registerView({
  id: 'storage', title: 'Front drive bays',
  render(t) { return frame('Front panel', svgInner); },   // SVG, 900 wide
  actions(t) { return [button('Pull the tray', 'bayPull', 3)]; },   // optional buttons under the picture
  tray(t) { return '<h2>Parts</h2>...'; },                  // optional side panel content
  keep: [['Heading', 'Text'], ...],                          // "Things to keep in mind"
  after(t) { }                                               // optional, runs after each render
});
```

**Actions.** Clickable things carry `data-act` and `data-arg` (use `hot(act, arg, label)` on SVG groups and
`button(label, act, arg)` for buttons). Handle them with `Sim.on('bayPull', arg => { ... })`. Use `say(kind, msg)`
for feedback (`ok`, `info`, `warn`) and `bad(msg)` for a mistake (it counts toward the score).

**Scenarios:**

```js
Sim.registerScenario({
  id: 'drive', title: 'Maintenance: replace a failed drive', intro: '...', start: 'storage',
  setup: () => buildFull(),
  steps: [{ view: 'storage', text: 'Pull the failed drive', hint: '...', done: t => ..., cue: t => ({ act: 'bayPull', arg: 3, say: 'Click ...' }) }]
});
```

A cue points at what to click next (`{act, arg, say}`) or what to type (`{field, value, say}`); the engine draws the
"Click here" ring and the step bar from it.

**RAM Distributor (optional):** a pack that wants the planner and its two labs gives the engine its memory rules with
`Sim.memRules(rules)`, registers the view with `Sim.registerView(MemPlan.view({ id: 'rdist', title: 'RAM Distributor',
keep }))`, and builds the practice and exam scenarios with `MemPlan.lab({ id, title, exam, practiceIntro or examIntro,
fitView, fitHint, fitCue, setup })`: `setup(order)` returns the open server for a work order and `fitCue(t, maps)` the
next cue to fit a planned layout. The two packs' `views-rdist.js` are complete examples. The rules object holds:

- the server: `id`, `server` (one line), `cpus`, `slots` (per CPU), `channels`, `chanOf(pos)`, `fill` (the slot order),
  `unit` ('MHz' or 'MT/s'), `cpuWord`, `cpuName(c)`, `slotName(c, pos)`, `slotList(positions, cpus)`, `grid` (rows and
  columns for the slot map), `facts(cpus)`, `defaultGb`;
- the parts: `parts` (key, part number, name, short name, capacity, organisation) and `part(key)`; optional
  `allowed(key)`, `allowedWhy(key)` and `excludedNote` for parts the chassis does not support;
- the rules: `checkCpu(map, c)` and `checkServer(maps, cpus)` return the errors for one CPU and for the server (a map
  is one array per CPU, a part key or null per slot), `speed(maps)`, `note(maps)`, `candidates()` (every layout to
  consider for one CPU), `rules` (the text shown on the page) and `sources`;
- the twin: `cpusIn(t)`, `read(t)` (the fitted maps), `deliver(t, order)` (puts an order in the DIMM box) and
  `kitLeft(t)`;
- `tasks`: the work orders for practice and the exam, `{ cpus, gb, why }`, where `why` explains the best layout.

Use the same functions for the planner as for the pack's Memory view (fill order, mixing checks), so the plan, the
hands-on check and the grade always agree. `node tests/ram-distributor.js` runs every task and a set of hand-made
layouts against the expected grade.

**OS install (optional):** a pack describes its server to the operating system with `Sim.osHost({...})` and
registers the handover view with `Sim.registerView(OSI.view({ id: 'handover', title: 'OS handover check' }))`. The
two packs' `views-os.js` are complete examples. The host object holds:

- identity: `id`, `bmc` (the controller's name), `conName`, `vendor`, `product`, `sku`, `serial`, `uuid`, `bios`;
- the hardware as the OS sees it, read from the twin: `cpu(t)`, `socketName(k)`, `dimms(t)`, `memGB(t)`, `disks(t)`
  (device names, sizes, the boot device marked `boot: true`), `nics(t)` (OS and ESXi names, MACs, driver, `link` when
  cabled, `want` for the port of the work order), `pci`, `ctlTool`;
- the work order's network `net` (host name, address, prefix, gateway, DNS), the vendor's ESXi image in `isos`, with
  `genericWhy` and `genericScreen` for VMware's generic image, and `vibs` (the vendor's drivers on ESXi);
- the boot menu label of the virtual CD `cdLabel`, `cdModel`, `entry(name)` for the new boot entry, `old` (the system
  being replaced), and `reboot(t)` and `powerOff(t)` for the pack's own POST.

The pack mounts the image through its management controller and offers the one-time boot, then builds each lab's
steps with `OSI.steps(os, P)`, where `P` holds `view`, `con(t, fn)` (the cue that reaches the server's screen, then
`fn`), `mount` and `boot` (steps), `eject` and `readback` (one step each). `OSI.init(t, os, old)` sets up a lab's
state. `node tests/os-install.js` checks the mistakes each installer catches and the shell's answers.

**Readiness rules:** `Sim.registerRule(t => [{ lvl: 'fail' | 'warn', msg: '...' }])`.

**Timers and keyboard or pointer listeners:** use `Sim.every(fn, ms)` and `Sim.listen(type, fn, options)`, never
`setInterval` or `document.addEventListener`. They then run only while their own model is active.

**Typed fields** (inputs with `data-field`): `Sim.onField((field, value) => { ... })`.

**For tests and the browser console:** `Sim.expose({ ... })` makes those functions available as `window.pack`.

**Sounds:** `Sim.sound('drive' | 'dimm' | 'card' | 'riser' | 'psu' | 'latch', delay)` plays a short click when a part locks into place;
`Sim.sound('fans')` plays the fans at power-on (up to full speed, then settling and fading out over about 16 seconds), and
`Sim.soundStop('fans', fade)` cuts it short when the server loses power. The header's Sound button turns them on or off.

**Engine helpers a pack can use:** `T` (the current state), `say`, `bad`, `runRules`, `render`, `guide`,
`frame`, `chip`, `hot`, `button`, `esc`, `$`, `DECK`.

## Conventions that keep views right

- Photos go in the pack's `assets.js` as `const IMG = { name: 'data:image/webp;base64,...' }`. Straighten and clean
  them first; then measure every LED, button, bay and port in that photo's own pixel frame.
- Labels, arrows and callouts drawn over a clickable area get `pointer-events="none"`, so they never swallow a click.
- Draw cables before ports, so a cable never covers a port.
- Anything that points the way (a pulsing ring, an arrow, a "next" marker, an order number, a port or outlet drawn
  brighter than the others) is guidance: draw it only when `Sim.guide` is on, and never in an exam. The engine's ring is
  the main pointer. It frames the hot zone of the cue's target, so keep each zone the size of its part; in dense rows the
  ring tightens to stay off the neighbours.
- Animations use a start time stored in the state (`begin="-age"`), so they survive the frequent redraws.
- A pack's own styles go in a `<style>` element added with `Sim.addCss(el)`, never `document.head.appendChild`: the
  sheet then always comes after the page's own styles, also on hosts that move the page's `<style>` out of `<head>`.
- Rules of a management page (iLO, Cisco IMC) must not reach into the operating system screens shown in its console:
  add `:where(:not(.osx *))` to a rule whose class an OS screen could also use. `Sim.addCss(el, true)` gives every
  selector of an OS sheet the weight of an id.

## Material needed for a new model

1. Exact model and configuration: drive bays, CPUs, RAID controller, network card, power supplies.
2. Straight-on photos in good light:
   - front and rear;
   - the rack ears and LEDs close up;
   - a drive carrier in and pulled out;
   - top view with the cover off, with and without the air baffle;
   - the cover latch;
   - CPU socket and heatsink, and the DIMM slots;
   - risers in and out, and a PCIe card;
   - fans in and out;
   - a power supply: its label side, its rear face (handle, lever, LEDs) and its connector end.
   
   Most important: the service label inside the cover.
3. Short videos of the moving parts: the cover latch, the drive lever, riser removal, a power supply swap.
4. Management: a screen recording of the boot and setup screens, screenshots of the management web pages
   (login, network, users) and the CLI commands to teach.
5. The model's maintenance and service guide.
6. The scenarios wanted, and the training-deck slides that go with them.

Use invented lab values for passwords, IP addresses, MAC addresses and serial numbers: a hosted page is readable
by anyone who has the link.

## Tests

With Node.js and Playwright installed (`npm i playwright`):

- `node tests/cue-run.js dist/index.html` runs every scenario of every model by its cues.
- `node tests/real-click.js dist/index.html` runs every scenario with real mouse clicks and reports any target
  whose centre is covered by another element.
- `node tests/two-models.js` builds the template pack next to the real ones and checks that switching models keeps
  state, timers and listeners apart.
- `node tests/ram-distributor.js dist/index.html` runs every RAM Distributor work order of both models in practice and
  in the exam, and grades about thirty hand-made layouts (unsupported, slower, too much capacity, too many DIMMs).
- `node tests/os-install.js dist/index.html` runs the OS install mistakes (wrong image, wrong disk, a port without a
  link, the management network on the wrong adapter, wrong handover values) and checks the shells' answers against the
  twin.
- `node tests/scorm-mock.js` builds the SCORM packages and runs them inside a mock learning platform: graded,
  practice, failed-then-passed and resumed runs.
