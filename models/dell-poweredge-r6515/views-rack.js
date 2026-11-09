/* ---- The front of the server across the top of both views (the photo, levelled: left control panel with the ear
   latch and the status LED, the drive bays, the information tag in its housing with its lip below the face, the right
   control panel with the power button, USB and iDRAC Direct, the right ear latch), the trainer's rack from U14 to U27
   with its numbered strip and the units already in it, and the information tag close up. Dell ISM: the information
   tag is the slide-out label panel on the front with the Service Tag and the Express Service Code; it pulls out
   downward from under the face. Check it against the work order before anything else, then find the U on the strip.
   Once installed, the server's front sits in its U.
   © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved. ---- */
const FR = { W: 4823, H: 404 };                       // the front photo's own pixel frame: the face, and the tag's lip below it
const TAGZ = [4300, 230, 4565, 404];                  // the information tag: the lower part of its housing and the lip under the face
const LATCH = { l: [88, 36, 234, 384], r: [4650, 36, 4784, 384] };
const PWRBTN = [4556, 28, 4642, 112];               // the power button on the right control panel   // the latch on each rack ear: left of the status LED, right of the control panel
const TAGC = { W: 1400, H: 593, zone: [720, 48, 1062, 593] };          // the closed tag photo: the housing and its lip
const TAGIMG = { W: 1000, H: 1060, label: [162, 293, 342, 778] };      // the pulled tag photo and its blanked label
const FRONT = { y: 34, w: 900 };                      // the front photo across the top of a view
const UH = 28, UY = u => 172 + (RACK.hi - u) * UH;    // one rack unit = 28 px, U27 at the top
const RMM = UH / 44.45;                               // px per mm
const OPEN = { x: 450 - 225 * RMM, w: 450 * RMM };    // 450 mm between the post flanges
const POST = { l: 450 - 245 * RMM, r: 450 + 225 * RMM, w: 20 * RMM };
const INS = { x: 640, y: 222, w: 236 };               // the close-up beside the rack

// the server's front, from the photo, at x y and width w; crop in photo pixels
const frontImg = (id, x, y, w, crop = [0, 0, FR.W, FR.H]) => {
  const s = w / (crop[2] - crop[0]), h = (crop[3] - crop[1]) * s;
  return `<defs><clipPath id="${id}"><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}"/></clipPath></defs><g clip-path="url(#${id})"><image href="${IMG.front}" x="${f1(x - crop[0] * s)}" y="${f1(y - crop[1] * s)}" width="${f1(FR.W * s)}" height="${f1(FR.H * s)}"/></g>`;
};
// a hot zone over a part of a photo drawn at x y width w with crop
const zoneOn = (box, x, y, w, crop, pad = 0) => { const s = w / (crop[2] - crop[0]); return `<rect x="${f1(x + (box[0] - crop[0]) * s - pad)}" y="${f1(y + (box[1] - crop[1]) * s - pad)}" width="${f1((box[2] - box[0]) * s + 2 * pad)}" height="${f1((box[3] - box[1]) * s + 2 * pad)}" rx="4" class="zone"/>`; };
// the information tag pulled out, its blanked label printed with the invented Service Tag and Express Service Code
function tagImg(x, y, w) {
  const s = w / TAGIMG.W, h = TAGIMG.H * s, [a, b, c, d] = TAGIMG.label, cx = x + (a + c) / 2 * s, cy = y + (b + d) / 2 * s, L = (d - b) * s, W = (c - a) * s;
  let g = `<image href="${IMG.tag}" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}"/>`;
  const bars = (yy, n) => { let p = ''; for (let i = 0; i < n; i++) p += `<rect x="${f1(-L / 2 + 6 + i * 3.2)}" y="${yy}" width="${i % 3 === 0 ? 1.6 : 0.8}" height="6" fill="#14181C"/>`; return p; };
  g += `<g transform="translate(${f1(cx)} ${f1(cy)}) rotate(-90)" pointer-events="none" style="font:600 6.4px var(--font);fill:#14181C">` +
    `<text x="${f1(-L / 2 + 6)}" y="${f1(-W / 2 + 9)}">Service Tag: ${WO.tag}</text>${bars(-W / 2 + 12, Math.floor((L - 12) / 3.2))}` +
    `<text x="${f1(-L / 2 + 6)}" y="${f1(-W / 2 + 27)}">Express Service Code: ${WO.esc}</text>${bars(-W / 2 + 30, Math.floor((L - 12) / 3.2))}` +
    `<text x="${f1(-L / 2 + 6)}" y="${f1(W / 2 - 4)}">MFG YR: 2023</text></g>`;
  return g;
}
// the front of the server across the top of a view, with its parts named; the tag and the two ear latches clickable
// a server that is off shows no light: the photo's lit LEDs painted dark (the drive activity LEDs) and the power button
// drawn unlit (a grey power symbol on its dark face), on the front photo and on both tag close-ups
const DRIVE_LEDS = [[1310,64,1354,102],[2142,84,2176,113],[2932,84,2964,113],[3692,84,3720,113],[3613,86,3633,109],[2122,197,2158,227],[2152,209,2194,227],[2860,223,2892,251],[1310,225,1354,263],[2092,227,2110,259],[3613,235,3631,259],[3692,235,3726,267],[2142,237,2170,275],[2164,247,2180,271],[2932,251,2962,273],[3762,279,3782,297]];                       // the front photo's lit drive LEDs, in its own frame
const PWR_LED = { front: [4566, 12, 4626, 76], closed: [1070, 54, 1172, 190], pulled: [756, 92, 816, 140] };   // the lit power button
const isOn = t => !!(t.cpu && t.cpu.power === 'on');
function pwrOff(box, x, y, s) {
  const cx = x + (box[0] + box[2]) / 2 * s, cy = y + (box[1] + box[3]) / 2 * s, r = Math.min(box[2] - box[0], box[3] - box[1]) * s / 2;
  return `<rect x="${f1(x + box[0] * s)}" y="${f1(y + box[1] * s)}" width="${f1((box[2] - box[0]) * s)}" height="${f1((box[3] - box[1]) * s)}" rx="${f1(r * 0.3)}" fill="#121518"/>` +
    `<path d="M${f1(cx - r * 0.42)} ${f1(cy - r * 0.32)}A${f1(r * 0.56)} ${f1(r * 0.56)} 0 1 0 ${f1(cx + r * 0.42)} ${f1(cy - r * 0.32)}M${f1(cx)} ${f1(cy - r * 0.66)}v${f1(r * 0.52)}" fill="none" stroke="#59626A" stroke-width="${f1(Math.max(1, r * 0.14))}" stroke-linecap="round"/>`;
}
function ledsOff(t, x, y, w, crop = [0, 0, FR.W, FR.H]) {
  if (isOn(t)) return '';
  const s = w / (crop[2] - crop[0]), X = x - crop[0] * s, Y = y - crop[1] * s;
  return `<g pointer-events="none">${DRIVE_LEDS.map(b => `<rect x="${f1(X + b[0] * s)}" y="${f1(Y + b[1] * s)}" width="${f1((b[2] - b[0]) * s)}" height="${f1((b[3] - b[1]) * s)}" rx="${f1(Math.min(3, 4 * s))}" fill="#1E2428"/>`).join('')}${pwrOff(PWR_LED.front, X, Y, s)}</g>`;
}
function frontPanel(t) {
  const r = t.rack, y = FRONT.y, s = FRONT.w / FR.W, h = FR.H * s, inRack = r.pos === 'in', out = r.pos === 'out';
  let g = `<text x="450" y="${y - 12}" text-anchor="middle" class="st">${PROFILE.name}, front${inRack ? `, in U${r.u}` : out ? ', out on its rails' : r.pos === 'cart' ? ', on the cart' : ', on the rails'}</text>`;
  g += `<rect x="0" y="${y}" width="${FRONT.w}" height="${f1(h)}" fill="#05080A"/>` + frontImg('fp', 0, y, FRONT.w) + ledsOff(t, 0, y, FRONT.w);
  // names under the photo, each with a short leader to its part
  const name = (px, label, anchor = 'middle', dy = 0) => { const x = px * s; return `<path d="M${f1(x)} ${f1(y + h + 2)}v${8 + dy}" stroke="#7FA6C2" stroke-width="1" pointer-events="none"/><text x="${f1(x)}" y="${f1(y + h + 22 + dy)}" text-anchor="${anchor}" class="ss" pointer-events="none">${label}</text>`; };
  g += name(160, 'ear latch', 'start') + name(310, 'status LED', 'start', 14) + name(2400, 'drive bays 0 to 9') + name(4430, 'information tag, lip below', 'end') + name(4600, 'power, USB, iDRAC Direct', 'end', 14) + name(4740, 'ear latch', 'end', 28);
  // an ear latch pressed: hinged at its top edge, its bottom swings out toward you (a clipped copy of the photo, squashed
  // up toward the hinge), the recess behind it dark; it springs back when let go
  ['l', 'r'].forEach(k => {
    const [x0, y0, x1, y1] = LATCH[k], bx = x0 * s, by = y + y0 * s, bw = (x1 - x0) * s, bh = (y1 - y0) * s, down = r.ear[k], a = fxAge('ear:' + k), f = 0.42;
    if (!down && !(a < 0.3)) return;
    const cx = bx + bw / 2, base = by;
    const anim = a < 0.3 ? `<animateTransform attributeName="transform" type="scale" values="${down ? `1 1;1.04 ${f}` : `1.04 ${f};1 1`}" dur="0.25s" begin="-${a.toFixed(2)}s" fill="freeze"/>` : '';
    g += `<rect x="${f1(bx)}" y="${f1(by)}" width="${f1(bw)}" height="${f1(bh)}" rx="2" fill="#060708" pointer-events="none"/><defs><clipPath id="earc${k}"><rect x="${f1(bx)}" y="${f1(by)}" width="${f1(bw)}" height="${f1(bh)}"/></clipPath></defs>`;
    g += `<g pointer-events="none" transform="translate(${f1(cx)} ${f1(base)})"><g transform="${anim ? '' : `scale(1.04 ${f})`}">${anim}<g transform="translate(${f1(-cx)} ${f1(-base)})"><rect x="${f1(bx)}" y="${f1(by)}" width="${f1(bw)}" height="${f1(bh)}" fill="#000" opacity=".5" transform="translate(2 6)"/><g clip-path="url(#earc${k})"><image href="${IMG.front}" x="0" y="${y}" width="${FRONT.w}" height="${f1(h)}"/></g></g></g></g>`;
  });
  g += `<g${hot(t.pullTab ? 'tagPush' : 'tagPull', '', t.pullTab ? 'Information tag, pulled out: push it back up into its housing' : 'Information tag: its lip under the face, left of the right control panel; pull it down')}>${zoneOn(TAGZ, 0, y, FRONT.w, [0, 0, FR.W, FR.H], 2)}</g>`;
  if (t.cpu) g += `<g${hot('powerBtn', '', `Power button: ${t.cpu.power === 'on' ? 'on, press it (after the OS shut down) to power off' : 'off, press it to power on'}`)}>${zoneOn(PWRBTN, 0, y, FRONT.w, [0, 0, FR.W, FR.H], 2)}</g>`;
  ['l', 'r'].forEach(k => g += `<g${hot('earLatch', k, `${cap(SIDE[k])} rack-ear latch: ${inRack ? (r.ear[k] ? 'pressed, click to let go' : 'press it to release the server') : 'it holds the server in the rack once installed'}`)}>${zoneOn(LATCH[k], 0, y, FRONT.w, [0, 0, FR.W, FR.H], 2)}</g>`);
  return g;
}
// the close-up beside the rack: the information tag in its housing, or pulled out, then the read-out below
function tagInset(t) {
  const X = INS.x, Y = INS.y, W = INS.w, out = t.pullTab, inRack = t.rack.pos === 'in';
  let g = `<text x="${f1(X + W / 2)}" y="${Y - 26}" text-anchor="middle" class="st">Information tag, close up</text>` +
    `<text x="${f1(X + W / 2)}" y="${Y - 10}" text-anchor="middle" class="ss" style="fill:${out ? '#FFB52E' : '#C4D3DE'}">${out ? 'pulled down: read it' : 'in its housing; the lip shows under the face'}</text>`;
  let h;
  if (!out) {
    const s = W / TAGC.W; h = TAGC.H * s;
    g += `<image href="${IMG.tagClosed}" x="${X}" y="${Y}" width="${W}" height="${f1(h)}"/>`;
    if (!isOn(t)) g += `<g pointer-events="none">${pwrOff(PWR_LED.closed, X, Y, s)}</g>`;
    g += `<g${hot('tagPull', '', 'Information tag: pull it down out of its housing by the lip')}>${zoneOn(TAGC.zone, X, Y, W, [0, 0, TAGC.W, TAGC.H])}</g>`;
  } else {
    h = TAGIMG.H * (W / TAGIMG.W);
    g += `<rect x="${X}" y="${Y}" width="${W}" height="${f1(h)}" rx="6" fill="#0A1218"/>` + tagImg(X, Y, W) + (isOn(t) ? '' : `<g pointer-events="none">${pwrOff(PWR_LED.pulled, X, Y, W / TAGIMG.W)}</g>`);
    g += `<g${hot('tagPush', '', 'Information tag, pulled out: push it back up')}><rect x="${X}" y="${Y}" width="${f1(W * 0.62)}" height="${f1(h)}" rx="4" class="zone"/></g>`;
  }
  g += `<rect x="${X}" y="${Y}" width="${W}" height="${f1(h)}" rx="6" fill="none" stroke="${out ? '#FFB52E' : '#5B7A92'}" stroke-width="2"/>`;
  const ry = Y + h + 14;
  if (out) g += `<rect x="${X}" y="${f1(ry)}" width="${W}" height="66" rx="6" fill="#0E1A24" stroke="#2E5571"/><text x="${X + 10}" y="${f1(ry + 18)}" class="st">Information tag</text><text x="${X + 10}" y="${f1(ry + 36)}" class="ss">Service Tag ${WO.tag}: as the work order says</text><text x="${X + 10}" y="${f1(ry + 52)}" class="ss">Express Service Code ${WO.esc} (the tag in decimal)</text>`;
  else g += `<text x="${X}" y="${f1(ry + 12)}" class="ss">${inRack ? `Installed in U${t.rack.u}${t.rack.cycled ? ', checked: it holds' : ''}` : t.rack.u ? `U${t.rack.u} marked. The server waits on the cart.` : 'Work order: ' + WO.rack + ', U' + WO.u + '. Find it on the strip.'}</text>` +
    `<text x="${X}" y="${f1(ry + 28)}" class="ss">${inRack ? 'The ear latches hold it in the rack.' : `Two people lift it (about ${PROFILE.weightKg} kg).`}</text>`;
  return g;
}
Sim.registerView({
  id: 'rack', title: 'Rack: the server, the U',
  keep: [
    ['Identify first', 'The information tag sits in a housing on the front, left of the right control panel; its lip shows under the face, and it slides out downward: Service Tag and Express Service Code (the tag as a decimal number). Compare it with the work order before you touch anything, then push it back up: left out, it catches on the rack.'],
    ['The front', 'Left: the ear latch, then the status LED bar. Right: the tag housing, the control panel (power button, USB, iDRAC Direct), the ear latch. The latch on each rack ear holds the server in the rack: pressed, it frees the server to slide out; pushed in, it clicks onto the post.'],
    ['Reading the strip', 'The numbered strip beside the post counts rack units from the bottom. One U is 44.45 mm: three holes. The rail end pieces go in the top and bottom holes of the U, so both rails sit at the same height.'],
    ['Rail sizing', 'Dell\'s Rail Sizing and Rack Compatibility Matrix says which rails fit which rack: tool-less ReadyRails fit square-hole and unthreaded round-hole posts; threaded holes need the tooled kit.'],
    ['Stable rack', 'Levelling pads down and the stabiliser or anti-tip feet fitted before you load a rack or slide anything out of it.'],
    ['Two people', 'A fully loaded 1U server weighs about 22 kg. Lift it with two people, one at each end, or use a lift.']],
  render(t) {
    const r = t.rack, n = RACK.hi - RACK.lo + 1;
    let g = frontPanel(t);
    g += `<text x="${f1(OPEN.x + OPEN.w / 2)}" y="${UY(RACK.hi) - 14}" text-anchor="middle" class="st">${WO.rack}, front: U${RACK.lo} to U${RACK.hi}</text>`;
    [POST.l, POST.r].forEach(px => g += `<rect x="${f1(px)}" y="${UY(RACK.hi) - 4}" width="${f1(POST.w)}" height="${n * UH + 8}" class="metal2"/>`);
    g += `<rect x="${f1(POST.l - 38)}" y="${UY(RACK.hi) - 4}" width="32" height="${n * UH + 8}" fill="#101418"/>`;
    for (let u = RACK.hi; u >= RACK.lo; u--) {
      const y = UY(u), mine = r.u === u, block = RACK.used[u];
      // three holes per U on each post, the number on the strip, a line at the bottom of each U
      [4.7, 14, 23.3].forEach(dy => [POST.l, POST.r].forEach(px => g += `<rect x="${f1(px + POST.w / 2 - 2.5)}" y="${f1(y + dy - 2)}" width="5" height="4.5" rx="1" fill="#59626A"/>`));
      g += `<path d="M${f1(POST.l - 38)} ${y + UH}h32" stroke="#2A3138" stroke-width="1"/><text x="${f1(POST.l - 22)}" y="${y + 19}" text-anchor="middle" class="st" style="font-weight:700;font-size:12px;fill:${mine ? '#45D07F' : '#EAF2F7'}">${u}</text>`;
      // every unit is clickable, the used ones too (a mistake): the ring then frames just the one unit
      if (block) { const [name, h] = block, top = UY(u + h - 1); g += `<g${hot('rackU', u, `U${u}${h > 1 ? ' to U' + (u + h - 1) : ''}: ${name}`)}><rect x="${f1(OPEN.x)}" y="${top + 2}" width="${f1(OPEN.w)}" height="${h * UH - 4}" rx="2" fill="#3A4A57"/><rect x="${f1(OPEN.x)}" y="${top + 2}" width="${f1(OPEN.w)}" height="${h * UH - 4}" rx="2" class="zone"/><text x="450" y="${f1(top + h * UH / 2 + 4)}" text-anchor="middle" class="ss" style="fill:#EAF2F7" pointer-events="none">${name}</text></g>`; }
      else if (usedAt(u)) continue;
      else if ((r.pos === 'in' || r.pos === 'out') && mine) g += `<rect x="${f1(OPEN.x)}" y="${y + 1}" width="${f1(OPEN.w)}" height="${UH - 2}" fill="#05080A"/>` + frontImg('rkf', OPEN.x, y + 1.6, OPEN.w, [0, 0, FR.W, 380]) + ledsOff(t, OPEN.x, y + 1.6, OPEN.w, [0, 0, FR.W, 380]);
      else g += `<g${hot('rackU', u, `Rack unit ${u}, free${mine ? ', marked for the server' : ''}`)}><rect x="${f1(OPEN.x)}" y="${y + 1}" width="${f1(OPEN.w)}" height="${UH - 2}" fill="${mine ? '#1F5B3A' : '#1B3447'}" stroke="${mine ? '#45D07F' : '#2E5571'}"/><text x="450" y="${y + 18}" text-anchor="middle" class="ss" pointer-events="none">${mine ? 'U' + u + ': marked for the server' : 'free'}</text></g>`;
    }
    g += `<text x="${f1(OPEN.x + OPEN.w / 2)}" y="${UY(RACK.lo) + UH + 20}" text-anchor="middle" class="ss">numbered strip: rack units from the bottom; three holes per U</text>`;
    return frame('Rack 1, front view', g + tagInset(t), 600);
  },
  actions(t) { return chainBtn(t); },
  tray(t) {
    return `<h2>Work order</h2><ul class="rules"><li>Server: ${PROFILE.name}, Service Tag ${WO.tag}</li><li>Position: ${WO.rack}, U${WO.u} (1U), below the Cisco UCS C220 M4</li><li>Rails: ${WO.rails}</li><li>Two people for the lift</li></ul>` +
      `<h2>Status</h2><ul class="rules"><li>Service Tag: ${t.tagRead ? 'checked, matches' : 'not checked yet'}</li><li>Rack unit: ${t.rack.u ? 'U' + t.rack.u + ' marked' : 'not marked'}</li><li>Server: ${t.rack.pos === 'in' ? 'in the rack' + (t.rack.cycled ? ', checked' : '') : t.rack.pos === 'out' ? 'out on its rails' : t.rack.pos === 'cart' ? 'on the cart' : 'on the rails'}</li></ul>`;
  }
});
Sim.on('tagPull', () => { if (T.pullTab) return say('info', 'The tag is out. Read it, then push it back up.'); T.pullTab = true; T.tagRead = true; Sim.sound('tab'); say('ok', `Information tag pulled down out of its housing: Service Tag ${WO.tag}, Express Service Code ${WO.esc}. It matches the work order: this is the server to install.`); });
Sim.on('tagPush', () => { if (!T.pullTab) return say('info', 'The tag is in its housing.'); T.pullTab = false; Sim.sound('clip'); say('ok', 'Information tag pushed back up into its housing. Left out, it would catch on the rack as the server goes in.'); });
Sim.on('rackU', u => {
  u = +u; const r = T.rack;
  if (r.pos === 'in' || r.pos === 'out') return say('info', `The server is installed in U${r.u}.`);
  if (r.u === u) return say('info', `U${u} is marked. Next: the rails, in the Rails view.`);
  if (railAny(T)) return bad(`A rail is already fitted at U${r.u}. Restart the lab to choose another position.`);
  if (!freeU(u)) return bad(`U${u} is taken by the ${usedAt(u)}.`);
  if (u !== WO.u) return bad(`U${u} is free, but the work order says U${WO.u}. Read the number on the strip beside the left post: it counts from the bottom.`);
  r.u = u; Sim.sound('pick'); say('ok', `U${u} marked: three holes on each post, from the line on the strip to the next. The rail end pieces go in the top and bottom holes of U${u}, on all four posts.`);
});

/* ---- Rails: the front of the server across the top, and below it the rack at the marked U seen from above. Rear
   posts at the top, front posts below, the two ReadyRails sliding rails between them, the inner rails pulled out
   toward you, and the server lowered onto them (drop-in design): rear standoffs into the rear J-slots, rotate the
   front down into the hooks, pull the blue slide-release lock tab in the middle of each
   inner rail and slide it in; the inner rails go in with it. Beside it, a close-up of what the hands do: the end
   piece's two pins going into the post holes and its latch; the standoffs on the side of the chassis dropping into
   the J-slots of the inner rail. A diagram, not a photo: the rails are drawn. ---- */
const TV = { rearY: 244, frontY: 468, ext: 180, len: 200, lx: 290, rx: 610 };   // posts from above; x of the inner faces of the left and right posts (drawn narrow: room for the close-ups beside)
const RW = 16;                                                                    // a rail's width seen from above
const railX = k => k === 'l' ? TV.lx + 2 : TV.rx - 2 - RW;
const outX = (k, w) => k === 'l' ? railX('l') - 2 - w : railX('r') + RW + 2;    // beside the rail, on the post side
const STAND = [16, 70, 124, 178];                                                 // the standoffs, from the rear of the chassis
const SRV = { x: TV.lx + 2 + RW + 4, w: TV.rx - TV.lx - 4 - 2 * RW - 8 };         // the chassis between the rails
const CU = { x: 690, w: 180, l: 34 };                                             // the close-ups: right of the rack, or left of it (x: CU.l)
const TABY = TV.frontY + 12 + TV.ext / 2 - 11;                                    // the blue slide-release lock tab: in the middle of the inner rail
const srvY = t => t.rack.pos === 'in' ? TV.rearY + 6 : TV.frontY + 14;
const bluePart = (x, y, w, h, lit) => `<rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="${h}" rx="2" fill="${lit ? '#7CC4FF' : '#1F6FB2'}" stroke="#0E3C66"/>`;
// an end piece of a rail seated on a post: the block over the post and its two pins in the holes
const endPiece = (x, y) => `<rect x="${x - 2}" y="${y - 12}" width="${RW + 4}" height="24" rx="2" fill="#6E777F" stroke="#3E454C"/><circle cx="${x + 4}" cy="${y}" r="2.2" fill="#C9D0D6"/><circle cx="${x + RW - 4}" cy="${y}" r="2.2" fill="#C9D0D6"/>`;
// short animations in the close-up (an end piece sliding onto its post, a latch opening): each keyed by its start time,
// drawn with begin="-age" so they survive the redraws; one more redraw when the last one has played out
const FX = {}; let fxPending = null;
const fxMark = k => { FX[k] = Date.now(); fxPending = k; };
const fxAge = k => FX[k] ? (Date.now() - FX[k]) / 1000 : 99;
const seatingNow = () => ['l', 'r'].some(k => ['rear', 'front'].some(e => fxAge(`seat:${k}:${e}`) < 1.4));
Sim.every(() => { if (fxPending && fxAge(fxPending) > 1.4) { fxPending = null; if (Sim.view === 'rails') render(); } }, 150);
// the "click": a short burst of rays at x y, `delay` seconds after the action that happened `age` seconds ago
function clickFx(x, y, delay, age) {
  const ray = n => { const q = (-60 + n * 30) * Math.PI / 180; return `M${f1(x + 7 * Math.cos(q))} ${f1(y + 7 * Math.sin(q))}L${f1(x + 18 * Math.cos(q))} ${f1(y + 18 * Math.sin(q))}`; };
  const dur = delay + 0.7, k1 = delay / dur, k2 = (delay + 0.4) / dur;
  return `<g opacity="0" pointer-events="none"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${k1.toFixed(3)};${(k1 + 0.01).toFixed(3)};${k2.toFixed(3)};1" dur="${dur.toFixed(2)}s" begin="-${age.toFixed(2)}s" fill="freeze"/><path d="${[0, 1, 2, 3, 4].map(ray).join('')}" stroke="#FFB52E" stroke-width="3" stroke-linecap="round"/></g>`;
}
const cuTitle = (X, Y, a, b, warm) => `<text x="${X + CU.w / 2}" y="${Y - 24}" text-anchor="middle" class="st" style="font-size:12.5px">${a}</text><text x="${X + CU.w / 2}" y="${Y - 9}" text-anchor="middle" class="ss" style="fill:${warm ? '#FFB52E' : '#C4D3DE'}">${b}</text>`;
const cuBox = (X, Y, H, warm) => `<rect x="${X}" y="${Y}" width="${CU.w}" height="${H}" rx="6" fill="#0A1218" stroke="${warm ? '#FFB52E' : '#5B7A92'}" stroke-width="2"/>`;
// close-up of the end piece in hand on its post, placed beside the top view where that end piece is: left rail on
// the left, right rail on the right; the rear end up by the rear posts, the front end down by the front posts
function endInset(t) {
  const r = t.rack; let k = r.hand || (railDone(t, 'l') ? 'r' : 'l'), end = !r.rail[k].rear ? 'rear' : 'front';
  // an end piece that has just seated stays in view while it slides on and clicks
  ['l', 'r'].forEach(kk => ['rear', 'front'].forEach(e => { if (fxAge(`seat:${kk}:${e}`) < 1.4) { k = kk; end = e; } }));
  const R = r.rail[k], seated = end === 'rear' ? R.rear : R.front, open = R.latch, age = fxAge(`seat:${k}:${end}`), la = fxAge(`latch:${k}`);
  return endFaceInset(t, k === 'l' ? CU.l : CU.x, end === 'rear' ? TV.rearY - 14 : TV.frontY - 85, k, R, end, seated, open, age, la);
}
// close-up: an end piece on its post, seen from inside the rack. The post flange with the three holes of the U; the
// end piece in front of it, coming from the rail side, its two pins landing on the top and bottom holes (they click
// in). On the front end piece also the latch: a flat spring plate on its face carved around the two pins. Pulled, it
// slides sideways on its hinge (the rail side) a little outward; when the end piece seats it springs back over the
// pins and clips the rail to the post. Mirrored for the right rail.
function endFaceInset(t, X, Y, k, R, end, seated, open, age, la) {
  const r = t.rack, d = k === 'l' ? -1 : 1, px = X + 90 - 11, holes = [Y + 48, Y + 86, Y + 124], seating = seated && age < 1.4, front = end === 'front';
  const sub = seated ? (seating ? (front ? 'click: the latch locks onto the post' : 'click: both pins are in') : front ? 'seated, latch locked over the pins' : 'seated: both pins in the holes') : front ? (open ? 'latch pulled: holes clear, push it on' : 'latch over the holes: pull it open') : 'two pins onto the post holes, push';
  let g = cuTitle(X, Y, `${cap(SIDE[k])} rail: ${end} end piece`, sub, !seated || seating) + cuBox(X, Y, 170, !seated || seating);
  // the post flange seen from inside the rack, with its three holes
  g += `<rect x="${px}" y="${Y + 14}" width="22" height="142" fill="#59626A"/><path d="M${px - 8} ${Y + 32}h38M${px - 8} ${Y + 140}h38" stroke="#2E5571" stroke-dasharray="3 2"/>`;
  holes.forEach(hy => g += `<rect x="${px + 6}" y="${hy - 5}" width="10" height="10" rx="1.5" fill="#101418"/>`);
  g += `<text x="${px + 11}" y="${Y + 166}" text-anchor="middle" class="ss" style="font-size:9.5px">U${r.u || WO.u}: 3 holes, from inside</text>`;
  // the end piece, in front of the flange (it comes from inside the rack): its block, the two pins on its face at the
  // hole positions, and the latch plate over them. Not seated, it stands off to the rail side; seating, it slides on
  const gap = seated ? 0 : 24 * -d, bx = (d < 0 ? px - 8 : px - 32), hx = d < 0 ? px + 24 : px - 2;
  // seating: one straight push onto the post
  const slide = seating ? `<animateTransform attributeName="transform" type="translate" values="${24 * -d} 0;0 0" dur="0.4s" begin="-${age.toFixed(2)}s" fill="freeze"/>` : '';
  g += `<g transform="translate(${slide ? 0 : gap} 0)">${slide}`;
  g += `<rect x="${bx}" y="${Y + 36}" width="62" height="100" rx="3" fill="#2A3138" fill-opacity=".92" stroke="#5B636A"/><text x="${bx + 31}" y="${Y + 150}" text-anchor="middle" style="font:700 8px var(--font);fill:#C9D0D6" pointer-events="none">${MARK[k]} ${end.toUpperCase()}</text>`;
  [holes[0], holes[2]].forEach(hy => g += `<circle cx="${px + 11}" cy="${hy}" r="4" fill="#C9D0D6" stroke="#5B636A"/>`);
  if (!front) {
    // no latch on the rear end piece: the pins click into the holes
    g += `</g>`;
    if (!seated) g += `<path d="M${px + 11 + 34 * -d} ${Y + 86}h${8 * d}" stroke="#FFB52E" stroke-width="2"/><path d="M${px + 11 + 24 * -d} ${Y + 86}l${6 * -d} -4v8z" fill="#FFB52E"/>`;
    if (seating) [holes[0], holes[2]].forEach(hy => g += clickFx(px + 11, hy, 0.45, age));
    if (!seated) g += `<g${hot('railRear', k, `${cap(SIDE[k])} rail, rear end piece: push its pins into the post holes`)}><rect x="${bx + gap}" y="${Y + 36}" width="62" height="100" rx="3" class="zone"/></g>`;
    return g;
  }
  // the latch plate on the face of the end piece, carved round the two pins, hinged on the rail side. At first it
  // lies over the holes, not locked; pulled, it slides back toward the rail and clears the holes, so the end piece can
  // be pushed on; when the pins are in, it springs forward over them and locks the end piece to the post
  const ox = 14 * -d;                                  // the plate when pulled open: back toward the rail side
  let snap = '';
  if (seating) snap = `<animateTransform attributeName="transform" type="translate" values="${ox} 0;${ox} 0;0 0" keyTimes="0;0.7;1" dur="0.6s" begin="-${age.toFixed(2)}s" fill="freeze"/>`;
  else if (la < 0.35) snap = `<animateTransform attributeName="transform" type="translate" values="${open ? `0 0;${ox} 0` : `${ox} 0;0 0`}" dur="0.25s" begin="-${la.toFixed(2)}s" fill="freeze"/>`;
  g += `<g transform="translate(${snap ? 0 : open && !seated ? ox : 0} 0)">${snap}`;
  g += `<rect x="${px - 3}" y="${Y + 34}" width="28" height="104" rx="2" fill="#B9C1C8" stroke="${open && !seated ? '#FFB52E' : '#5B636A'}" stroke-width="1.5"/>`;
  // its two cut-outs: locked, the pins show through them; before that they are blind, covering the holes
  [holes[0], holes[2]].forEach(hy => g += `<circle cx="${px + 11}" cy="${hy}" r="7.5" fill="${seated ? 'none' : '#2A3138'}" stroke="#7D868E"/>` + (seated ? `<circle cx="${px + 11}" cy="${hy}" r="4" fill="#C9D0D6" stroke="#5B636A"/>` : ''));
  g += `<circle cx="${hx}" cy="${Y + 46}" r="2.2" fill="#5B636A"/><circle cx="${hx}" cy="${Y + 126}" r="2.2" fill="#5B636A"/>`;   // the hinge
  g += `</g></g>`;
  if (!seated) g += `<text x="${px + 11 + 52 * d}" y="${Y + 24}" text-anchor="middle" class="ss" style="font-size:9.5px">latch${open ? ' open' : ''}</text>`;
  if (seating) [holes[0], holes[2]].forEach(hy => g += clickFx(px + 11, hy, 0.55, age));
  // the close-up works too: the end piece to push on, the latch plate to pull open or let go (the plate on top)
  if (!seated) {
    const zx = Math.min(px - 3, px - 3 + ox) + gap, zw = 28 + Math.abs(ox), bl = bx + gap, br = bl + 62;
    const ex0 = d < 0 ? zx + zw : bl, ex1 = d < 0 ? br : zx;   // the part of the block clear of the plate
    g += `<g${hot('railFront', k, `${cap(SIDE[k])} rail, front end piece: push it onto the post`)}><rect x="${ex0}" y="${Y + 36}" width="${ex1 - ex0}" height="100" rx="3" class="zone"/></g>`;
    g += `<g${hot('railLatch', k, `${cap(SIDE[k])} rail, latch on the front end piece: ${open ? 'open, click to let go' : 'pull it open'}`)}><rect x="${zx}" y="${Y + 34}" width="${zw}" height="104" rx="2" class="zone"/></g>`;
  }
  return g;
}
// close-up: the side of the chassis and the inner rail, seen from outside the rack (front to the left). The rail has
// four J-slots: open at the top, with a hook toward the rear at the bottom. The four standoffs on the side of the
// chassis show through them. Dell's drop-in: the chassis comes down rear first, its rear standoff into the rear J-slot,
// hangs there with the front raised, rotates down until every standoff is in its slot, then is pushed inward (toward
// the rear) so the standoffs ride into the hooks and the server is held. No lock lever on this kit. The blue
// slide-release tab is in the middle of the rail. Clickable like the top view.
function dropInset(t, Y) {
  const r = t.rack, p = r.pos, X = CU.x, ry = Y + 104, sx = [X + 150, X + 114, X + 78, X + 42];   // standoffs and slots, rear first
  const txt = p === 'cart' ? (r.ext ? 'rear standoff down into the rear J-slot' : 'pull the inner rails out first') : p === 'hung' ? 'hanging on the rear standoff: rotate the front down' : p === 'in' ? 'in the rack, held on the rails' : 'all four standoffs in the hooks: held';
  let g = cuTitle(X, Y, 'Side: standoffs into the J-slots', txt, p !== 'locked' && p !== 'in') + cuBox(X, Y, 170, p !== 'locked' && p !== 'in');
  g += `<text x="${X + 10}" y="${Y + 14}" class="ss" style="font-size:9.5px">front</text><text x="${X + 170}" y="${Y + 14}" text-anchor="end" class="ss" style="font-size:9.5px">rear</text>`;
  // the chassis with its standoffs: lifted and tilted on the cart, hung on the rear standoff, down on the rail, pushed into the hooks
  const locked = p === 'locked' || p === 'in' || p === 'out', push = locked ? 7 : 0, lift = p === 'cart' ? 28 : 0, tilt = p === 'cart' || p === 'hung' ? 9 : 0;
  const aR = fxAge('drop:rear'), aF = fxAge('drop:front'), piv = `${sx[0]} ${ry + 8}`;
  // the tilt about the rear standoff (outer), the lift and the push (inner); each animated when it has just changed
  const rotA = aF < 1 ? `<animateTransform attributeName="transform" type="rotate" values="9 ${piv};0 ${piv}" dur="0.6s" begin="-${aF.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".3 0 .4 1" keyTimes="0;1"/>` : '';
  const movA = aR < 1 ? `<animateTransform attributeName="transform" type="translate" values="0 -28;0 0" dur="0.6s" begin="-${aR.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".3 0 .4 1" keyTimes="0;1"/>`
    : aF < 1 ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 0;7 0" keyTimes="0;0.67;1" dur="0.9s" begin="-${aF.toFixed(2)}s" fill="freeze"/>` : '';
  const moving = `<g transform="${rotA ? '' : `rotate(${tilt} ${piv})`}">${rotA}<g transform="${movA ? '' : `translate(${push} ${-lift})`}">${movA}`;
  g += moving + `<rect x="${X + 18}" y="${ry - 50}" width="148" height="56" rx="3" fill="#AEB7BF" stroke="#5B636A"/><text x="${X + 92}" y="${ry - 20}" text-anchor="middle" class="ss" style="font-size:9.5px;fill:#2A2F35" pointer-events="none">chassis, side</text></g></g>`;
  // the inner rail over the chassis side, its four J-slots as windows: a slot down from the top edge, a hook toward the rear
  g += `<rect x="${X + 12}" y="${ry}" width="156" height="20" fill="#B9C1C8" stroke="#5B636A"/>`;
  sx.forEach(x => g += `<path d="M${x - 4} ${ry}V${ry + 12}H${x + 11}V${ry + 4}H${x + 4}V${ry}Z" fill="#1B1F24" stroke="#5B636A" stroke-width=".8"/>`);
  // the standoffs, in the same motion as the chassis, drawn over the rail so they show in the slot windows
  g += moving;
  sx.forEach((x, i) => { const seatedOne = p !== 'cart' && (p !== 'hung' || i === 0); g += `<circle cx="${x}" cy="${ry + 8}" r="4" fill="${seatedOne ? '#45D07F' : '#FFB52E'}" stroke="#14202B"/>`; });
  g += `</g></g>`;
  if (p === 'cart' && r.ext) g += `<path d="M${sx[0]} ${ry - 56}v16" stroke="#FFB52E" stroke-width="2" stroke-dasharray="3 2"/><path d="M${sx[0] - 4} ${ry - 42}l4 7l4 -7z" fill="#FFB52E"/>`;
  g += `<text x="${X + 168}" y="${ry + 44}" text-anchor="end" class="ss" style="font-size:9px">J-slots: down, then back into the hook</text>`;
  if (aF < 1) sx.forEach(x => g += clickFx(x, ry + 8, 0.6, aF));
  // the blue tab under the rail's middle: pulled, it hinges open a little at its free end
  const pulled = r.tabs.l || r.tabs.r, ta = Math.min(fxAge('tab:l'), fxAge('tab:r')), tp = `${X + 101} ${ry + 22}`;
  const tswing = ta < 0.4 ? `<animateTransform attributeName="transform" type="rotate" values="${pulled ? `0 ${tp};22 ${tp}` : `22 ${tp};0 ${tp}`}" dur="0.25s" begin="-${ta.toFixed(2)}s" fill="freeze"/>` : '';
  g += `<g transform="rotate(${tswing ? 0 : pulled ? 22 : 0} ${tp})">${tswing}${bluePart(X + 79, ry + 22, 22, 9, pulled)}</g><text x="${X + 90}" y="${ry + 58}" text-anchor="middle" class="ss" style="font-size:9.5px">blue slide-release tab, mid-rail</text>`;
  // clickable like the top view: lower the rear standoff, rotate the front down, push inward
  if (p === 'cart' && r.ext) g += `<g${hot('dropRear', '', 'Chassis: lower the rear standoff into the rear J-slot')}><rect x="${X + 18}" y="${ry - 100}" width="148" height="60" rx="3" class="zone"/></g>`;
  else if (p === 'hung') g += `<g${hot('dropFront', '', 'Front of the chassis: rotate it down until every standoff is in its slot')}><rect x="${X + 18}" y="${ry - 72}" width="80" height="60" rx="3" class="zone"/></g>`;
  return g;
}
function railArt(t, k) {
  const r = t.rack, R = r.rail[k], x = railX(k), name = SIDE[k], inRack = r.pos === 'in', sl = fxAge('slide') < 1.0;
  const extOut = r.ext;   // the inner rails: out toward you, or inside the rack with the server; they slide with it
  let g = '';
  if (R.rear) g += `<rect x="${x}" y="${TV.rearY}" width="${RW}" height="${TV.frontY - TV.rearY}" fill="#9AA3AB" stroke="#5B636A"/>` + endPiece(x, TV.rearY);
  if (R.front) g += endPiece(x, TV.frontY);
  else if (R.rear) g += `<rect x="${x - 2}" y="${TV.frontY - 12}" width="${RW + 4}" height="24" rx="2" fill="none" stroke="#FF8A7A" stroke-dasharray="3 2"/>`;
  // the latch of the front end piece: beside the rail; pulled open it stands forward
  const lx = outX(k, 10);
  if (R.rear) g += bluePart(lx, TV.frontY - 10 + (R.latch ? 8 : 0), 10, 20, R.latch);
  // the inner rail pulled out toward you, its J-slots, and the blue slide-release lock tab in its middle
  if (extOut) {
    // sliding with the server: into the rack, or out to the service position
    const mv = sl ? `<animateTransform attributeName="transform" type="translate" values="${inRack ? `0 0;0 -${TV.ext}` : `0 -${TV.ext};0 0`}" dur="0.9s" begin="-${fxAge('slide').toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".3 0 .2 1" keyTimes="0;1"/>` : '';
    g += `<g transform="translate(0 ${inRack && !sl ? -TV.ext : 0})">${mv}<rect x="${x + 2}" y="${TV.frontY + 12}" width="${RW - 4}" height="${TV.ext}" fill="#B9C1C8" stroke="#5B636A"/>`;
    STAND.forEach(d => g += `<rect x="${x + 3}" y="${TV.frontY + 14 + d - 3}" width="${RW - 6}" height="6" fill="#3E454C"/>`);
    // the tab stays on the rail; pulled, it hinges open a little at its outer edge, toward you
    const tx = outX(k, 10), px = k === 'l' ? tx + 10 : tx, ang = (k === 'l' ? -1 : 1) * 24, ta = fxAge('tab:' + k);
    const swing = ta < 0.4 ? `<animateTransform attributeName="transform" type="rotate" values="${r.tabs[k] ? `0 ${px} ${TABY + 11};${ang} ${px} ${TABY + 11}` : `${ang} ${px} ${TABY + 11};0 ${px} ${TABY + 11}`}" dur="0.25s" begin="-${ta.toFixed(2)}s" fill="freeze"/>` : '';
    g += `<g transform="rotate(${swing ? 0 : r.tabs[k] ? ang : 0} ${px} ${TABY + 11})" pointer-events="none">${swing}${bluePart(tx, TABY, 10, 22, r.tabs[k])}</g></g>`;
  }
  // hot zones: the rear end, the front latch, the front end, the slide-release tab
  g += `<g${hot('railRear', k, `${cap(name)} rail, rear end piece on the rear post: ${R.rear ? 'seated' : 'seat it first'}`)}><rect x="${x - 6}" y="${TV.rearY - 18}" width="${RW + 12}" height="36" rx="4" class="zone"/></g>`;
  if (R.rear && !R.front) g += `<g${hot('railLatch', k, `${cap(name)} rail, latch on the front end piece: ${R.latch ? 'open' : 'pull it open'}`)}><rect x="${k === 'l' ? lx - 4 : lx}" y="${TV.frontY - 16}" width="14" height="36" rx="4" class="zone"/></g>`;
  g += `<g${hot('railFront', k, `${cap(name)} rail, front end piece on the front post: ${R.front ? 'seated and locked' : 'seat it after the rear end'}`)}><rect x="${x - 2}" y="${TV.frontY - 18}" width="${RW + 4}" height="30" rx="4" class="zone"/></g>`;
  if (extOut && !inRack) g += `<g${hot('slideTab', k, `${cap(name)} rail, blue slide-release lock tab in the middle of the inner rail: ${r.tabs[k] ? 'pulled' : 'pull it to release the inner rail'}`)}><rect x="${k === 'l' ? outX(k, 10) - 4 : outX(k, 10)}" y="${TABY - 6}" width="14" height="40" rx="4" class="zone"/></g>`;
  return g;
}
function serverArt(t) {
  const r = t.rack, p = r.pos, inRack = p === 'in';
  let g = '';
  if (p === 'cart') {
    g += `<rect x="12" y="630" width="212" height="56" rx="6" fill="#2A3138" stroke="#5B636A"/><text x="118" y="653" text-anchor="middle" class="st" style="font-size:12px">${PROFILE.name} on the cart</text><text x="118" y="671" text-anchor="middle" class="ss">two people to lift it</text>`;
    if (r.ext) {
      g += `<g${hot('dropRear', '', 'Rear J-slots of both rails: lower the rear standoffs into them')}><rect x="${SRV.x}" y="${TV.frontY + 12}" width="${SRV.w}" height="52" rx="4" class="zone"/></g>`;
      g += `<g${hot('dropFront', '', 'Front J-slots: the front standoffs, after the rear ones')}><rect x="${SRV.x}" y="${TV.frontY + 12 + TV.ext - 52}" width="${SRV.w}" height="52" rx="4" class="zone"/></g>`;
      g += `<text x="${SRV.x + SRV.w / 2}" y="${TV.frontY + 42}" text-anchor="middle" class="ss" pointer-events="none">rear J-slots</text><text x="${SRV.x + SRV.w / 2}" y="${TV.frontY + 12 + TV.ext - 22}" text-anchor="middle" class="ss" pointer-events="none">front J-slots</text>`;
    }
    return g;
  }
  const y = srvY(t), hung = p === 'hung', sa = fxAge('slide');
  // sliding into the rack or out of it: the server glides between the two positions, the inner rails with it
  const dy = (TV.frontY + 14) - (TV.rearY + 6);
  g += `<g>${sa < 1.0 ? `<animateTransform attributeName="transform" type="translate" values="0 ${inRack ? dy : -dy};0 0" dur="0.9s" begin="-${sa.toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".3 0 .2 1" keyTimes="0;1"/>` : ''}`;
  g += `<rect x="${SRV.x}" y="${y}" width="${SRV.w}" height="${TV.len}" rx="3" fill="${hung ? '#C9D0D6' : '#AEB7BF'}" stroke="#5B636A"/>`;
  g += `<text x="${SRV.x + SRV.w / 2}" y="${y + TV.len / 2 - 14}" text-anchor="middle" style="font:600 13px var(--font);fill:#2A2F35" pointer-events="none">${PROFILE.name}, top cover</text>` +
    `<text x="${SRV.x + SRV.w / 2}" y="${y + TV.len / 2 + 20}" text-anchor="middle" class="ss" style="fill:#2A2F35" pointer-events="none">${hung ? 'front end raised: the rear standoffs are in the rear J-slots' : inRack ? (r.cycled ? 'in the rack, checked: it holds' : 'in the rack, the inner rails with it') : p === 'out' ? 'slid out to the service position' : 'locked on the inner rails'}</text>` +
    `<text x="${SRV.x + SRV.w / 2}" y="${y + TV.len - 8}" text-anchor="middle" class="ss" style="fill:#2A2F35" pointer-events="none">front: rack ears</text>`;
  STAND.forEach((d, i) => ['l', 'r'].forEach(k => { const sx = k === 'l' ? SRV.x - 1 : SRV.x + SRV.w + 1, seated = !hung || i === 0; g += `<circle cx="${sx}" cy="${y + d}" r="4" fill="${seated ? '#45D07F' : '#FFB52E'}" stroke="#14202B"/>`; }));
  if (hung) g += `<path d="M${SRV.x} ${y + TV.len}H${SRV.x + SRV.w}" stroke="#FFB52E" stroke-width="3" stroke-dasharray="8 5"/>`;
  if (hung) g += `<g${hot('dropFront', '', 'Front of the server: rotate it down until all the standoffs seat')}><rect x="${SRV.x}" y="${y + TV.len / 2}" width="${SRV.w}" height="${TV.len / 2}" rx="4" class="zone"/></g>`;
  else if (inRack) g += `<g${hot('srvOut', '', r.ear.l && r.ear.r ? 'Front of the server: pull it out to the service position' : 'Front of the server: press both ear latches first, then pull')}><rect x="${SRV.x + SRV.w / 2 - 80}" y="${y + TV.len - 34}" width="160" height="40" rx="4" class="zone"/></g>`;
  else g += `<g${hot('srvPush', '', p === 'out' ? 'Front of the server: push it back into the rack' : 'Front of the server: slide it into the rack')}><rect x="${SRV.x + SRV.w / 2 - 80}" y="${y + TV.len - 34}" width="160" height="40" rx="4" class="zone"/></g>`;
  // the latch on each rack ear, at the front corners, once the server is in the rack
  if (inRack) ['l', 'r'].forEach(k => { const x = k === 'l' ? SRV.x + 2 : SRV.x + SRV.w - 16; g += `<rect x="${x}" y="${y + TV.len - 2}" width="14" height="${r.ear[k] ? 14 : 8}" rx="2" fill="${r.ear[k] ? '#FFB52E' : '#14181C'}" stroke="#5B636A" pointer-events="none"/>`; });
  return g + '</g>';
}
Sim.registerView({
  id: 'rails', title: 'Rails: fit, lift, secure',
  keep: [
    ['Read the end pieces', 'Each rail is marked LEFT or RIGHT, and each end piece FRONT or REAR. Hold the rail with FRONT toward you before you reach into the rack.'],
    ['Rear first', 'Seat the rear end piece on the rear post (both pins in the top and bottom holes of the U, push until it clicks), then the front. The front end piece needs its latch pulled open; push it onto the post and the latch clicks back and locks.'],
    ['Same U, level', 'Both rails in the same holes, front and rear. A rail one hole off binds the server and can let it drop.'],
    ['Drop-in', 'Pull the inner rails out until they lock. Four J-slots on each rail take the four standoffs on each side of the chassis: the rear standoff first (it frees a hand), then rotate the front down until every standoff drops into its J-slot and rides back into the hook. Then the server is held on the rails.'],
    ['Blue means release', 'The blue slide-release lock tab in the middle of each inner rail frees it from the extended position: pull both, then push the server in and the inner rails go in with it. Never one side alone.'],
    ['Ear latches', 'The latch on each rack ear, at the ends of the front, holds the server in the rack. To slide it out: press both latches and pull until the rails lock. To return it: pull the blue tabs, push until both latches click. Improper installation on the rails may damage the rails or cause the system to fall when extended (Dell).']],
  render(t) {
    const r = t.rack;
    let g = frontPanel(t);
    g += `<text x="450" y="${TV.rearY - 8}" text-anchor="middle" class="st">${r.u ? `${WO.rack} at U${r.u}, seen from above` : `${WO.rack}, seen from above: mark the rack unit first (Rack view)`}</text>`;
    [[TV.lx - 44], [TV.rx + 34]].forEach(([x]) => g += `<rect x="${x}" y="${TV.rearY - 22}" width="10" height="${TV.frontY - TV.rearY + 40}" fill="#1C2A35"/>`);
    [[TV.rearY, 'rear posts'], [TV.frontY, 'front posts']].forEach(([y, nm]) => {
      g += `<rect x="${TV.lx - 34}" y="${y - 7}" width="34" height="14" fill="#59626A"/><rect x="${TV.rx}" y="${y - 7}" width="34" height="14" fill="#59626A"/>`;
      g += `<text x="${TV.lx - 40}" y="${y + 4}" text-anchor="end" class="ss" style="font-size:9.5px">${nm}</text>`;
    });
    g += railArt(t, 'l') + railArt(t, 'r');
    if (railsDone(t) && !r.ext) g += `<g${hot('railExt', '', 'Inner rails: pull them out toward you until they lock')}><rect x="${railX('l') - 4}" y="${TV.frontY + 14}" width="${railX('r') + RW + 4 - railX('l') + 4}" height="30" rx="4" class="zone"/></g><text x="450" y="${TV.frontY + 34}" text-anchor="middle" class="ss" pointer-events="none">inner rails: pull them out toward you</text>`;
    if (!railAny(t)) g += `<text x="450" y="${TV.frontY + 60}" text-anchor="middle" class="ss">${r.u ? `Rails from the kit (tray): rear end piece on the rear post first, then the front, at U${r.u}` : 'Mark the rack unit first, in the Rack view'}</text>`;
    g += serverArt(t);
    g += `<text x="450" y="${TV.frontY + 14 + TV.ext + 42}" text-anchor="middle" class="ss">front of the rack: you stand here</text>`;
    // the close-up for this phase: the end piece on its post, then the standoffs into the J-slots
    g += !railsDone(t) || seatingNow() ? endInset(t) : dropInset(t, TV.rearY - 14);
    return frame('The rack from above', g, 712);
  },
  actions(t) {
    const r = t.rack, a = chainBtn(t);
    if (r.pos === 'cart') {
      ['l', 'r'].forEach(k => { if (!railDone(t, k) && r.hand !== k) a.push(button(`Pick up the ${SIDE[k]} rail (marked ${MARK[k]})`, 'railPick', k)); });
      if (railsDone(t) && !r.ext) a.push(button('Pull both inner rails out until they lock', 'railExt', '', true));
      if (r.ext) { a.push(button('Two-person lift: rear standoffs into the rear J-slots', 'dropRear', '', true)); a.push(button('Rotate the front down until all standoffs seat', 'dropFront')); }
    } else if (r.pos === 'hung') a.push(button('Rotate the front down until all standoffs seat', 'dropFront', '', true));
    else if (r.pos === 'locked' || r.pos === 'out') {
      // the blue slide-release lock tabs are clicked on the rails themselves
      a.push(button(r.pos === 'out' ? 'Push the server back until the ear latches click' : 'Slide the server into the rack', 'srvPush', '', r.tabs.l && r.tabs.r));
    } else {
      // the ear latches are pressed on the front photo
      a.push(button('Pull the server out to the service position', 'srvOut', '', r.ear.l && r.ear.r));
    }
    return a;
  },
  tray(t) {
    const r = t.rack;
    return `<h2>Rail kit</h2><ul class="rules"><li>${PROFILE.rail}: a left rail and a right rail, each end piece marked LEFT or RIGHT and FRONT or REAR</li><li>Tool-less: two pins on each end piece for square or unthreaded round holes, a latch on the front end pieces</li><li>In hand: ${r.hand ? SIDE[r.hand] + ' rail, FRONT toward you' : 'nothing'}</li></ul>` +
      `<h2>Dell's order</h2><ol class="rules"><li>Rear end piece on the rear post (two pins click in), then the front: latch open, push on, it clicks; both rails at the same U</li><li>Pull the inner rails out until they lock</li><li>Rear standoffs into the rear J-slots, rotate the front down: every standoff into its hook</li><li>Blue slide-release lock tabs (mid-rail) pulled, push it in: the inner rails go in with it</li><li>Check: ear latches pressed, pull it out, push it back until they click</li></ol>`;
  }
});
Sim.on('railPick', k => {
  const r = T.rack; if (!SIDE[k]) return;
  if (!r.u) return bad('Mark the rack unit first, in the Rack view: the rails go in the holes of that U.');
  if (railDone(T, k)) return say('info', `The ${SIDE[k]} rail is already in the rack.`);
  if (r.hand && r.hand !== k && r.rail[r.hand].rear) return say('warn', `The ${SIDE[r.hand]} rail's rear end is on its post: finish its front end first.`);
  r.hand = k; Sim.sound('pick'); say('ok', `${cap(SIDE[k])} rail in hand: its end pieces are marked ${MARK[k]}, FRONT and REAR. Hold it with FRONT toward you.`);
});
Sim.on('railRear', k => {
  const r = T.rack, R = r.rail[k]; if (!R) return;
  if (R.rear) return say('info', `The ${SIDE[k]} rail's rear end is seated and latched.`);
  if (!r.hand) return say('info', 'Pick up a rail first: the kit is in the tray.');
  if (r.hand !== k) return bad(`That is the ${SIDE[r.hand]} rail: its end pieces are marked ${MARK[r.hand]}. It does not seat on the ${SIDE[k]} posts. Pick up the ${SIDE[k]} rail.`);
  R.rear = true; fxMark(`seat:${k}:rear`); Sim.sound('latch', 0.55);
  say('ok', `Rear end of the ${SIDE[k]} rail: its two pins into the top and bottom holes of U${r.u} on the rear post, pushed until they clicked in. Now the front.`);
});
Sim.on('railLatch', k => {
  const R = T.rack.rail[k]; if (!R) return;
  if (R.front) return say('info', 'The front end is seated and its latch is locked.');
  if (!R.rear) return bad('Rear end first: its two pins click into the rear post. Then the front end.');
  R.latch = !R.latch; fxMark(`latch:${k}`); Sim.sound(R.latch ? 'clipOpen' : 'clip'); say(R.latch ? 'ok' : 'info', R.latch ? 'Latch on the front end piece pulled open: now the pins can go into the holes.' : 'Latch let go: it closed again.');
});
Sim.on('railFront', k => {
  const r = T.rack, R = r.rail[k]; if (!R) return;
  if (R.front) return say('info', `The ${SIDE[k]} rail's front end is seated and locked.`);
  if (!r.hand && !R.rear) return say('info', 'Pick up a rail first: the kit is in the tray.');
  if (!R.rear) return bad(r.hand !== k ? `That is the ${SIDE[r.hand]} rail, and the rear end goes on first. Pick up the ${SIDE[k]} rail and seat its rear end piece on the rear post.` : 'Rear end first: seat the rear end piece on the rear post until its pins click in, then the front.');
  if (!R.latch) return say('warn', 'It will not go in: the latch on the front end piece is closed. Pull the latch open, then push the end piece onto the post.');
  R.front = true; R.latch = false; r.hand = null; fxMark(`seat:${k}:front`); fxMark(`latch:${k}`); Sim.sound('latch', 0.55);
  say('ok', `Front end of the ${SIDE[k]} rail: pins into the top and bottom holes of U${r.u}, pushed on, and the latch clicked back and locked it. Shake it: it holds.`);
});
Sim.on('railExt', () => {
  const r = T.rack;
  if (r.ext) return say('info', 'The inner rails are out and locked.');
  if (!railsDone(T)) return bad('Fit both rails first, rear end then front, at the same U.');
  r.ext = true; Sim.sound('latch'); say('ok', 'Both inner rails pulled out toward you until they locked in the extended position. Four J-slots on each: the four standoffs on each side of the chassis drop into them.');
});
Sim.on('dropRear', () => {
  const r = T.rack;
  if (r.pos !== 'cart') return say('info', 'The rear standoffs are in their J-slots.');
  if (T.pullTab) return bad('Push the information tag back up first: it would catch on the rack as the server goes in.');
  if (!r.ext) return bad(railsDone(T) ? 'Pull the inner rails out until they lock first: the standoffs cannot reach the J-slots otherwise.' : 'Fit both rails first, then pull the inner rails out.');
  r.pos = 'hung'; fxMark('drop:rear'); Sim.sound('tab', 0.3); say('ok', 'Two people, one at each end. The rear standoff on each side of the chassis lowered into the rear J-slot of its rail. The front is still raised.');
});
Sim.on('dropFront', () => {
  const r = T.rack;
  if (r.pos === 'cart') return bad(r.ext ? 'Rear standoffs first: lower them into the rear J-slots, then rotate the front down. It frees a hand to steady the server.' : 'The inner rails are not out yet, and the rear standoffs go in first.');
  if (r.pos !== 'hung') return say('info', 'All the standoffs are seated.');
  r.pos = 'locked'; fxMark('drop:front'); Sim.sound('latch', 0.6); Sim.sound('latch', 0.68); say('ok', 'Server rotated down until all four standoffs on each side dropped into their J-slots and rode back into the hooks: click. It is held on the rails. Now the blue slide-release lock tabs, in the middle of each inner rail.');
});
Sim.on('srvPush', () => {
  const r = T.rack;
  if (r.pos === 'locked' || r.pos === 'out') {
    if (!(r.tabs.l && r.tabs.r)) return bad(`The inner rails are locked in the extended position: it does not move. Pull the blue slide-release lock tab on ${r.tabs.l || r.tabs.r ? 'the other rail' : 'both rails'} first.`);
    const back = r.pos === 'out';
    if (back && T.cpu && T.cpu.cover !== 'locked') return bad('Put the system cover on and lock it before the system goes back into the rack.');
    r.pos = 'in'; r.tabs = { l: false, r: false }; r.ear = { l: false, r: false }; if (back) r.cycled = true; fxMark('slide'); Sim.sound('latch', 0.8); Sim.sound('latch', 0.88);
    return say('ok', back ? `Server pushed back into U${r.u}, the inner rails with it, until both ear latches clicked onto the posts: click, click. It is held.` : `Server slid into the rack, the inner rails with it, until both rack ears touched the posts at U${r.u} and their latches clicked. Now check it: press both ear latches, pull it out, push it back.`);
  }
  if (r.pos === 'hung') return bad('Not yet: rotate the front down until every standoff is in its J-slot.');
  say('info', r.pos === 'in' ? 'The server is in the rack.' : 'Lower the server onto the inner rails first.');
});
Sim.on('slideTab', k => {
  const r = T.rack; if (!SIDE[k]) return;
  if (r.pos !== 'locked' && r.pos !== 'out') return say('info', 'The blue slide-release lock tab, in the middle of each inner rail, frees the rail from its extended position once the server sits on it.');
  r.tabs[k] = !r.tabs[k]; fxMark('tab:' + k); Sim.sound(r.tabs[k] ? 'clipOpen' : 'clip');
  say(r.tabs[k] ? 'ok' : 'info', r.tabs[k] ? (r.tabs.l && r.tabs.r ? 'Both slide-release lock tabs pulled: the inner rails are free. Push the server in; the rails go in with it.' : `${cap(SIDE[k])} slide-release lock tab pulled. Now the ${SIDE[k === 'l' ? 'r' : 'l']} one.`) : `${cap(SIDE[k])} tab let go: that rail is locked again.`);
});
Sim.on('earLatch', k => {
  const r = T.rack; if (!SIDE[k]) return;
  if (r.pos !== 'in') return say('info', r.pos === 'out' ? 'The server is out: the ear latches click onto the posts again when it is pushed back.' : 'The latch on each rack ear, at the ends of the front, holds the server in the rack once it is installed.');
  r.ear[k] = !r.ear[k]; fxMark('ear:' + k); Sim.sound(r.ear[k] ? 'clipOpen' : 'clip');
  say(r.ear[k] ? 'ok' : 'info', r.ear[k] ? (r.ear.l && r.ear.r ? 'Both ear latches pressed: the server is free. Keep them pressed and pull it out until the rails lock.' : `${cap(SIDE[k])} ear latch pressed. The other one still holds: press both.`) : `${cap(SIDE[k])} ear latch let go: it holds again.`);
});
Sim.on('srvOut', () => {
  const r = T.rack;
  if (r.pos !== 'in') return say('info', r.pos === 'out' ? 'The server is out on its rails.' : 'The server is not in the rack.');
  if (!(r.ear.l && r.ear.r)) return bad(`The ear latches hold the server on the posts: press ${r.ear.l || r.ear.r ? 'the other latch too' : 'both latches on the rack ears'}, then pull.`);
  if (T.cpu && T.cpu.power === 'on') return bad('The system is running: shut it down and power it off before you slide it out for service.');
  if (T.cpu && anyCab(T.cpu)) return bad('Disconnect the power cords and the cables at the server before you slide the system out.');
  r.pos = 'out'; r.ear = { l: false, r: false }; r.tabs = { l: false, r: false }; fxMark('slide'); Sim.sound('card');   // no click on the way out: the rails just run to their stop
  say('ok', 'Server pulled out to the service position: the inner rails came out with it and locked extended. You let go of the latches as it moved. To push it back, pull the blue slide-release lock tabs, then push until the ear latches click.');
});
// the rack lab done: the processor lab continues on this server; the processor lab done: the memory lab continues on this server
const chainBtn = t => Sim.scenario === 'rackin' && Sim.scenarios.rackin.steps.every(s => s.done(t)) ? [button('Continue: processor and memory in this server', 'chainCpu', '', true)] : [];
// the rack lab continues into the processor lab on the same server: the next lab starts with the server just installed
Sim.on('chainCpu', () => { if (!Sim.scenarios.rackin.steps.every(s => s.done(T))) return say('info', 'Finish the rack installation first.'); CH.on = true; Sim.startScenario('cpurep'); });
