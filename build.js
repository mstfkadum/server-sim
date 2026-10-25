// Server build trainer. © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved.
// Build the single-file simulator:
//   engine/head.html + engine/engine.js + engine/memplan.js + engine/os-*.js + engine/lms.js + engine/tour.js + every model pack (each wrapped in its own scope) + engine/boot.js
// Usage: node build.js [output.html]   (default: dist/index.html)
// Extra model folders for testing can be listed in the BUILD_EXTRA_MODELS environment variable (comma-separated paths).
const fs = require('fs'), path = require('path');
const root = __dirname, rd = p => fs.readFileSync(path.join(root, p), 'utf8');
const out = path.resolve(process.argv[2] || path.join(root, 'dist', 'index.html'));
fs.mkdirSync(path.dirname(out), { recursive: true });
const ids = JSON.parse(rd('models/index.json')).models;
const dirs = ids.map(id => path.join(root, 'models', id)).concat((process.env.BUILD_EXTRA_MODELS || '').split(',').filter(Boolean).map(p => path.resolve(p)));
const J = JSON.stringify;
const pack = dir => {
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  for (const k of ['id', 'name', 'files']) if (!m[k]) throw new Error(`${dir}/manifest.json: missing "${k}"`);
  const meta = { id: m.id, name: m.name, vendor: m.vendor || '', summary: m.summary || '', defaultScenario: m.defaultScenario || null };
  const body = m.files.map(f => `/* ---- ${m.id}/${f} ---- */\n` + fs.readFileSync(path.join(dir, f), 'utf8').replace(/^'use strict';\n/, '')).join('\n');
  return `\n/* ==================== model pack: ${m.name} ==================== */\nSim.registerModel(Object.assign(${J(meta)}, { pack() {\n${body}\n} }));\n`;
};
// the OS install over virtual media: the core, the console and shell, then one file per operating system
const OS_FILES = ['engine/os-core.js', 'engine/os-shell.js', 'engine/os-ubuntu.js', 'engine/os-rocky.js', 'engine/os-esxi.js'];
// engine/fonts.css (the embedded typefaces) goes where head.html has the /*@fonts*/ marker
const html = rd('engine/head.html').replace('/*@fonts*/', () => rd('engine/fonts.css')) + rd('engine/engine.js') + rd('engine/memplan.js') + OS_FILES.map(rd).join('') + rd('engine/lms.js') + rd('engine/tour.js') + dirs.map(pack).join('') + rd('engine/boot.js') + '</script>\n</body>\n</html>\n';
fs.writeFileSync(out, html);
console.log(`built ${out}: ${dirs.length} model(s), ${(html.length / 1048576).toFixed(2)} MB`);
