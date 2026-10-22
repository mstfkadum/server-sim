// Server build trainer. © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved.
// Build SCORM 1.2 packages for every model that lists "scorm" lessons in its manifest.json:
//   <id>-all-labs.zip          one activity holding every lab (one SCO per lab)
//   <id>-lab<N>-<scenario>.zip one activity per lab, each with its own grade and completion in the course
// Usage: node build-scorm.js [output folder]   (default: dist/scorm)
const fs = require('fs'), path = require('path'), zlib = require('zlib'), { execFileSync } = require('child_process');
const root = __dirname, outDir = path.resolve(process.argv[2] || path.join(root, 'dist', 'scorm'));
fs.mkdirSync(outDir, { recursive: true });
const html = path.join(outDir, '.index.html');
execFileSync('node', [path.join(root, 'build.js'), html], { stdio: 'inherit' });
const page = fs.readFileSync(html), license = fs.readFileSync(path.join(root, 'LICENSE.txt'));
fs.unlinkSync(html);

// ---- a small zip writer (deflate), enough for SCORM packages ----
const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = buf => { let c = -1; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function zip(files) {                         // files: [[name, Buffer]]
  const now = new Date(), time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1), date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const parts = [], central = []; let off = 0;
  for (const [name, data] of files) {
    const nm = Buffer.from(name, 'utf8'), comp = zlib.deflateRawSync(data, { level: 9 }), crc = crc32(data);
    const h = Buffer.alloc(30); h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(8, 8); h.writeUInt16LE(time, 10); h.writeUInt16LE(date, 12);
    h.writeUInt32LE(crc, 14); h.writeUInt32LE(comp.length, 18); h.writeUInt32LE(data.length, 22); h.writeUInt16LE(nm.length, 26); h.writeUInt16LE(0, 28);
    const c = Buffer.alloc(46); c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(8, 10); c.writeUInt16LE(time, 12); c.writeUInt16LE(date, 14);
    c.writeUInt32LE(crc, 16); c.writeUInt32LE(comp.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(nm.length, 28); c.writeUInt32LE(off, 42);
    parts.push(h, nm, comp); central.push(c, nm); off += h.length + nm.length + comp.length;
  }
  const cd = Buffer.concat(central), e = Buffer.alloc(22);
  e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(files.length, 8); e.writeUInt16LE(files.length, 10); e.writeUInt32LE(cd.length, 12); e.writeUInt32LE(off, 16);
  return Buffer.concat([...parts, cd, e]);
}

// ---- SCORM 1.2 manifest ----
const X = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const idOf = s => s.replace(/[^A-Za-z0-9_-]/g, '_');
function manifest(m, title, lessons) {
  const S = m.scorm, launch = l => `index.html?model=${encodeURIComponent(m.id)}&scenario=${encodeURIComponent(l.scenario)}&pass=${S.passMark}&per=${S.pointsPerMistake}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Server build trainer. © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved. -->
<manifest identifier="SBT_${idOf(m.id)}_${lessons.length === 1 ? idOf(lessons[0].scenario) : 'all'}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG">
    <organization identifier="ORG">
      <title>${X(title)}</title>
${lessons.map(l => `      <item identifier="ITEM_${idOf(l.scenario)}" identifierref="RES_${idOf(l.scenario)}" isvisible="true">
        <title>${X(l.title)}</title>
      </item>`).join('\n')}
    </organization>
  </organizations>
  <resources>
${lessons.map(l => `    <resource identifier="RES_${idOf(l.scenario)}" type="webcontent" adlcp:scormtype="sco" href="${X(launch(l))}">
      <file href="index.html"/>
      <dependency identifierref="RES_COMMON"/>
    </resource>`).join('\n')}
    <resource identifier="RES_COMMON" type="webcontent" adlcp:scormtype="asset">
      <file href="index.html"/>
      <file href="LICENSE.txt"/>
    </resource>
  </resources>
</manifest>
`;
}

const ids = JSON.parse(fs.readFileSync(path.join(root, 'models', 'index.json'), 'utf8')).models;
for (const id of ids) {
  const m = JSON.parse(fs.readFileSync(path.join(root, 'models', id, 'manifest.json'), 'utf8'));
  if (!m.scorm || !(m.scorm.lessons || []).length) continue;
  const S = m.scorm; S.passMark = S.passMark ?? 70; S.pointsPerMistake = S.pointsPerMistake ?? 10;
  const pack = (name, title, lessons) => {
    const buf = zip([['imsmanifest.xml', Buffer.from(manifest(m, title, lessons), 'utf8')], ['index.html', page], ['LICENSE.txt', license]]);
    fs.writeFileSync(path.join(outDir, name), buf);
    console.log(`  ${name}  (${lessons.length} lab${lessons.length === 1 ? '' : 's'}, ${(buf.length / 1048576).toFixed(2)} MB)`);
  };
  console.log(`SCORM 1.2 packages for ${m.name}: pass mark ${S.passMark}, minus ${S.pointsPerMistake} per mistake`);
  pack(`${id}-all-labs.zip`, S.title || m.name, S.lessons);
  S.lessons.forEach((l, i) => pack(`${id}-lab${i + 1}-${l.scenario}.zip`, l.title, [l]));
}
