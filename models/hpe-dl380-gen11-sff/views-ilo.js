/* ---- Power and iLO: the rear panel, rebuilt from the video of this server's rear and the service label: the power
   cords to two PDUs, the iLO Management Port to the management switch, and a monitor (VGA) and a USB keyboard and mouse
   for the first setup at the local console; and the front iLO Service Port, where a laptop can connect through a
   USB-to-Ethernet adapter (169.254.1.2). The default account is Administrator with the password on the pull tab
   (iLO 6 User Guide). The local console and the laptop's browser are the next views. ---- */
/* ---- the rear panel, rebuilt from the trainer's video of this server's rear and the service label (rear view): the
   primary riser (PCIe slots 1 to 3) at the left with OCP slot 14, the rear UID LED, two USB 3.2 ports and the iLO
   Management Port below it; the secondary riser (slots 4 to 6) in the middle with the serial port, OCP slot 15 (here
   a two-port SFP NIC) and VGA below; slots 7 and 8 at the right above PS2 and PS1, 800 W Flex Slot supplies. Units:
   millimetres from the top-left corner, as seen from behind (445 x 87). ---- */
const RV = { x: 30, y: 82, s: 840 / 445 };
const rv = (x, y) => [RV.x + x * RV.s, RV.y + y * RV.s];
const rvR = (x0, y0, x1, y1, fill, extra = '') => { const [a, b] = rv(x0, y0), [c, d] = rv(x1, y1); return `<rect x="${f1(a)}" y="${f1(b)}" width="${f1(c - a)}" height="${f1(d - b)}" fill="${fill}"${extra}/>`; };
const rvT = (x, y, s, sz = 8.5, col = '#2A2F35', anchor = 'start') => { const [a, b] = rv(x, y); return `<text x="${f1(a)}" y="${f1(b)}" text-anchor="${anchor}" style="font:700 ${sz}px var(--font);fill:${col}">${s}</text>`; };
// the rear panel alone (panel coordinates: rv), shared with the Cabling view; its port LEDs follow the cables
function rearPanel(t) {
  const R = rvR, T2 = rvT;
  // perforated slot cover: hexagonal holes (h) or slots (s)
  const cover = (x0, y0, x1, y1, kind, num) => {
    let g = R(x0, y0, x1, y1, '#C9CFD4', ' stroke="#6E767D" stroke-width="1" rx="1.5"');
    const [a, b] = rv(x0 + 10, y0 + 3), [c, d] = rv(x1 - 4, y1 - 3);
    if (kind === 'h') for (let yy = b; yy < d - 3; yy += 6.2) for (let xx = a + ((yy - b) / 6.2 % 2 ? 3.4 : 0); xx < c - 4; xx += 6.8) g += `<circle cx="${f1(xx + 3)}" cy="${f1(yy + 3)}" r="2.1" fill="#4E565D"/>`;
    else for (let yy = b + 1; yy < d - 3; yy += 7) g += `<rect x="${f1(a)}" y="${f1(yy)}" width="${f1(c - a)}" height="3.6" rx="1.6" fill="#4E565D"/>`;
    if (num) g += T2(x0 + 2.2, (y0 + y1) / 2 + 1.5, num + '&#9656;', 8, '#2A2F35');
    return g;
  };
  let g = R(0, 0, 445, 87, '#B4BCC3', ' stroke="#5B636A" stroke-width="2" rx="3"');
  // primary riser cage, slots 1 to 3 (full height, stacked top to bottom)
  g += R(2, 2, 150, 61, '#9AA3AB', ' stroke="#6E767D" rx="2"') + cover(4, 4, 148, 21, 'h', 1) + cover(4, 22, 148, 40, 's', 2) + cover(4, 41, 148, 59, 's', 3);
  // bottom left: OCP 14 (blank), rear UID LED, USB 3.2 x 2, iLO Management Port
  g += R(4, 63, 80, 84, '#ECEDEE', ' stroke="#8E979F" rx="1.5"');
  for (let k = 0; k < 9; k++) g += R(8 + k * 8, 68, 13 + k * 8, 79, '#9AA3AB', ' rx="1"');
  const [ux, uy] = rv(86, 73); g += `<circle cx="${f1(ux)}" cy="${f1(uy)}" r="3.4" fill="${t.uid ? '#4AA8FF' : '#56606A'}"/>` + T2(86, 81, 'UID', 6, '#2A2F35', 'middle');
  g += R(91, 64, 105, 73, '#1D2125', ' rx="1"') + R(93, 66, 103, 69, '#3A6EA8') + R(91, 75, 105, 84, '#1D2125', ' rx="1"') + R(93, 77, 103, 80, '#3A6EA8');
  const iloLink = t.mgmtLink && acOn(t);
  g += R(109, 64, 126, 84, '#1D2125', ' rx="1.5"') + R(112, 67, 123, 78, '#3A3F45', ' rx="1"') + R(110, 64.5, 113, 66.5, iloLink ? '#45D07F' : '#2C3236') + R(122, 64.5, 125, 66.5, iloLink ? '#FFB52E' : '#2C3236');
  g += T2(117.5, 62, 'iLO', 7.5, '#14202B', 'middle');
  // secondary riser, slots 4 to 6
  g += R(152, 2, 292, 53, '#9AA3AB', ' stroke="#6E767D" rx="2"') + cover(154, 4, 290, 19, 's', 4) + cover(154, 20, 290, 35, 's', 5) + cover(154, 36, 290, 51, 's', 6);
  // serial port, OCP 15 (two SFP cages), VGA
  g += T2(158, 60, 'IOIOI', 6.5, '#2A2F35') + R(155, 62, 177, 74, '#1D2125', ' rx="3"');
  g += R(180, 57, 262, 85, '#8E979F', ' stroke="#5B636A" rx="1.5"') + R(184, 62, 210, 79, '#2A2F35', ' rx="1"') + R(214, 62, 240, 79, '#2A2F35', ' rx="1"') + R(186, 64, 208, 77, '#B9C1C8') + R(216, 64, 238, 77, '#B9C1C8');
  const nicUp = k => plugged(t, k) && isOn(t);
  g += R(244, 62, 248, 65, nicUp('ocp1') ? '#45D07F' : '#2C3236') + R(250, 62, 254, 65, nicUp('ocp2') ? '#45D07F' : '#2C3236') + T2(197, 61, '1', 6, '#14202B', 'middle') + T2(227, 61, '2', 6, '#14202B', 'middle') + T2(221, 84, 'OCP 15', 6.5, '#14202B', 'middle');
  g += R(266, 60, 296, 74, '#2F5BA8', ' rx="4"') + T2(281, 80, 'VGA', 6.5, '#14202B', 'middle');
  // slots 7 and 8 (low profile, blank)
  g += R(298, 2, 443, 30, '#9AA3AB', ' stroke="#6E767D" rx="2"') + cover(300, 4, 441, 16, 's', 7) + cover(300, 17, 441, 28, 's', 8);
  // power supplies PS2, PS1: vents, handle with the round 800 W label, release tab, C14 inlet, LED
  const psu = (x0, nm, k) => {
    let s = R(x0, 32, x0 + 70, 85, '#2B3036', ' stroke="#121417" stroke-width="1.5" rx="2"');
    for (let yy = 36; yy < 80; yy += 4.2) for (let xx = x0 + 4 + ((yy - 36) / 4.2 % 2 ? 2 : 0); xx < x0 + 34; xx += 4) s += R(xx, yy, xx + 2.6, yy + 2.6, '#171A1D', ' rx=".6"');
    s += R(x0 + 38, 36, x0 + 66, 47, '#1A1D20', ' rx="2"');
    const [cx, cy] = rv(x0 + 45, 41.5); s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="8.4" fill="#7A2434" stroke="#4D1520"/><text x="${f1(cx)}" y="${f1(cy + 2.6)}" text-anchor="middle" style="font:800 6.5px var(--font);fill:#F2D9DE">800W</text>`;
    s += R(x0 + 58, 37, x0 + 64, 46, '#8A2A3A', ' rx="1"');
    s += R(x0 + 42, 52, x0 + 64, 76, '#111315', ' rx="3"') + R(x0 + 46, 56, x0 + 60, 72, '#2A2E33', ' rx="2"');
    const [lx, ly] = rv(x0 + 39, 80); s += `<circle cx="${f1(lx)}" cy="${f1(ly)}" r="2.8" fill="${t.ac[k] ? '#45D07F' : '#3A4046'}"/>`;
    return s + T2(x0 + 35, 95, nm, 9, '#C5CCD3', 'middle');
  };
  g += psu(298, 'PS2', 'ps2') + psu(373, 'PS1', 'ps1');
  return g;
}
function rearSvg(t) {
  const R = rvR;
  let g = rearPanel(t);
  // cabling, as in the rack: the management network on the iLO port (grey), data fibre on OCP 15 (orange)
  const [ia, ib] = rv(117.5, 84), [fa, fb] = rv(197, 79), [fc, fd] = rv(227, 79);
  if (plugged(t, 'ilo')) g += `<path d="M${f1(ia)} ${f1(ib)}C${f1(ia)} ${f1(ib + 50)} 320 268 334 330" fill="none" stroke="#B9B5A8" stroke-width="5" stroke-linecap="round"/><rect x="${f1(ia - 7)}" y="${f1(ib - 22)}" width="14" height="24" rx="2" fill="#D6D2C4" stroke="#8C877A"/><text x="338" y="344" class="ss" style="fill:#D6D2C4">to the management switch</text>`;
  // the local console: a monitor on VGA (blue cable) and a USB keyboard and mouse (black cable)
  const [va, vb] = rv(281, 74), [ua, ub] = rv(98, 84);
  if (t.crash.vga) g += `<path d="M${f1(va)} ${f1(vb)}C${f1(va)} ${f1(vb + 40)} 560 250 560 276" fill="none" stroke="#2F5BA8" stroke-width="6" stroke-linecap="round"/><rect x="${f1(va - 14)}" y="${f1(vb - 16)}" width="28" height="18" rx="3" fill="#2F5BA8" stroke="#1B356A"/><rect x="500" y="276" width="120" height="20" rx="4" fill="#1D2125" stroke="#2F5BA8"/><text x="560" y="290" text-anchor="middle" style="font:600 10.5px var(--font);fill:#E6EBEF">Monitor (VGA)</text>`;
  if (t.crash.kbd) g += `<path d="M${f1(ua)} ${f1(ub)}C${f1(ua)} ${f1(ub + 30)} 200 262 190 276" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/><rect x="${f1(ua - 6)}" y="${f1(ub - 10)}" width="12" height="12" rx="1.5" fill="#2A2E33" stroke="#8E99A3"/><rect x="110" y="276" width="160" height="20" rx="4" fill="#1D2125" stroke="#8E99A3"/><text x="190" y="290" text-anchor="middle" style="font:600 10.5px var(--font);fill:#E6EBEF">USB keyboard and mouse</text>`;
  [[fa, fb], [fc, fd]].forEach(([x, y], i) => { if (!plugged(t, i ? 'ocp2' : 'ocp1')) return; g += `<path d="M${f1(x)} ${f1(y)}C${f1(x)} ${f1(y + 50)} ${f1(x + 40 + i * 20)} 300 ${f1(x + 60 + i * 30)} 330" fill="none" stroke="#1C1F22" stroke-width="4.5" stroke-linecap="round"/><rect x="${f1(x - 7)}" y="${f1(y - 18)}" width="14" height="20" rx="2" fill="#C9CFD4" stroke="#6E767D"/>`; });
  // PDUs and power cords: PS2 to PDU B (left), PS1 to PDU A (right)
  const pdu = [[40, 'PDU B', '#2F78D6'], [600, 'PDU A', '#D8462E']];
  pdu.forEach(([x, nm, col]) => { g += `<rect x="${x}" y="300" width="260" height="22" rx="4" fill="#1D2125" stroke="${col}" stroke-width="2"/><text x="${x + 10}" y="315" style="font:700 11px var(--font);fill:#E6EBEF">${nm}</text>${[0, 1, 2, 3, 4, 5].map(k => `<rect x="${x + 70 + k * 30}" y="305" width="18" height="12" rx="2" fill="#0B0C0E" stroke="#3B4046"/>`).join('')}`; });
  [['ps1', 373, 759], ['ps2', 298, 249]].forEach(([k, x0, px]) => {
    const [ix, iy] = rv(x0 + 53, 64), on = t.ac[k];
    if (on) {
      const d = `M${f1(ix)} ${f1(iy)}C${f1(ix)} ${f1(iy + 70)} ${px + 9} 250 ${px + 9} 311`;
      g += `<path d="${d}" fill="none" stroke="#0D0F11" stroke-width="7" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#3A4047" stroke-width="2" stroke-linecap="round"/>${R(x0 + 44, 54, x0 + 62, 74, '#121416', ' rx="3" stroke="#3B4046"')}`;
    }
    const [a, b] = rv(x0 + 38, 50), [c, d2] = rv(x0 + 68, 82);
    g += `<g${hot('cord', k, `${k.toUpperCase()} power inlet: ${on ? 'cord connected, click to unplug' : 'no cord'}`)}><rect x="${f1(a)}" y="${f1(b)}" width="${f1(c - a)}" height="${f1(d2 - b)}" rx="4" class="zone"/></g>`;
  });
  const [ja, jb] = rv(107, 62), [jc, jd] = rv(128, 86);
  g += `<g${hot('iloPort', '', t.mgmtLink ? 'iLO Management Port: cabled to the management switch, click to unplug' : 'iLO Management Port: plug in the cable from the management switch')}><rect x="${f1(ja)}" y="${f1(jb)}" width="${f1(jc - ja)}" height="${f1(jd - jb)}" rx="3" class="zone"/></g>`;
  const [ka, kb] = rv(264, 58), [kc, kd] = rv(298, 76), [la, lb] = rv(89, 62), [lc, ld] = rv(107, 86);
  g += `<g${hot('crashVga', '', t.crash.vga ? 'VGA port: monitor connected, click to unplug' : 'VGA port: plug in a monitor')}><rect x="${f1(ka)}" y="${f1(kb)}" width="${f1(kc - ka)}" height="${f1(kd - kb)}" rx="3" class="zone"/></g>`;
  g += `<g${hot('crashKbd', '', t.crash.kbd ? 'USB ports: keyboard and mouse connected, click to unplug' : 'USB 3.2 ports: plug in a USB keyboard and mouse')}><rect x="${f1(la)}" y="${f1(lb)}" width="${f1(lc - la)}" height="${f1(ld - lb)}" rx="3" class="zone"/></g>`;
  g += `<text x="30" y="62" class="ss">Rear panel, rebuilt from the video of this server. Grey: iLO network. Black: data (DAC). Connect the cables in the Cabling view.</text>`;
  return g;
}
// the front iLO Service Port, enlarged from the front photo, with the adapter and the laptop's cable when connected
function svcSvg(t) {
  const [p0, q0, p1, q1] = [2470, 8, 2630, 236], s = 0.62, X = 30, Y = 356;
  let g = `<text x="${X}" y="${Y - 10}" class="st" style="font-size:13px">Front: power button and iLO Service Port</text><rect x="${X - 3}" y="${Y - 3}" width="${f1((p1 - p0) * s + 6)}" height="${f1((q1 - q0) * s + 6)}" rx="5" fill="#0A0D10" stroke="#2E5571"/><g transform="translate(${X} ${Y}) scale(${s}) translate(${-p0} ${-q0})">${frontImg('fsvc', [p0, q0, p1, q1])}${panelLeds(t)}`;
  if (t.laptop) {
    const [x0, y0, x1, y1] = FP.svc;
    g += `<rect x="${x0 + 6}" y="${y0 + 22}" width="${x1 - x0 - 12}" height="${y1 - y0 - 34}" rx="3" fill="#2A2E33" stroke="#0B0C0E" stroke-width="2"/><rect x="${x0 + 12}" y="${y0 + 30}" width="${x1 - x0 - 24}" height="26" rx="2" fill="#C9CED3"/>`;
  }
  g += `<g${hot('power', '', `Power On/Standby button: ${!acOn(t) ? 'LED off, no power' : t.power === 'standby' ? 'LED amber, standby' : t.power === 'post' ? 'LED flashing green, powering on' : 'LED green, on'}`)}><rect x="${FP.power[0] - 22}" y="${FP.power[1] - 22}" width="44" height="44" rx="6" class="zone"/></g>`;
  g += `<g${hot('laptop', '', t.laptop ? 'USB-to-Ethernet adapter in the iLO Service Port: unplug it' : 'iLO Service Port: plug in the laptop\'s USB-to-Ethernet adapter')}><rect x="${FP.svc[0] - 6}" y="${FP.svc[1] - 6}" width="${FP.svc[2] - FP.svc[0] + 12}" height="${FP.svc[3] - FP.svc[1] + 12}" rx="6" class="zone"/></g></g>`;
  const [ax, ay] = [X + (FP.svc[2] - p0) * s, Y + (FP.svc[1] + 50 - q0) * s];
  if (t.laptop) g += `<path d="M${f1(ax)} ${f1(ay)}C${f1(ax + 80)} ${f1(ay)} 330 ${Y + 60} 420 ${Y + 60}H860" fill="none" stroke="#1D6FD1" stroke-width="5" stroke-linecap="round"/><rect x="370" y="${Y + 50}" width="54" height="20" rx="4" fill="#2A2E33" stroke="#8E99A3"/><text x="397" y="${Y + 64}" text-anchor="middle" style="font:600 9px var(--font);fill:#E6EBEF">USB-RJ45</text><text x="440" y="${Y + 50}" class="ss">Laptop: Ethernet, address from iLO (169.254.1.x)</text>`;
  else if (t.net === 'mgmt') g += `<text x="${X + (p1 - p0) * s + 20}" y="${Y + 60}" class="ss">Not used in this lab: your laptop is on the management network,</text><text x="${X + (p1 - p0) * s + 20}" y="${Y + 76}" class="ss">and iLO is reached through its rear Management Port.</text>`;
  else g += `<text x="${X + (p1 - p0) * s + 20}" y="${Y + 60}" class="ss">Click the iLO port to plug in the laptop,</text><text x="${X + (p1 - p0) * s + 20}" y="${Y + 76}" class="ss">through a USB-to-Ethernet adapter (HPE recommends Q7Y55A).</text>`;
  g += `<text x="${X + (p1 - p0) * s + 20}" y="${Y + 120}" class="ss">Power LED: ${!acOn(t) ? 'off, no power' : t.power === 'standby' ? 'amber, standby: iLO is up' : t.power === 'post' ? 'flashing green, powering on' : 'green, on'}</text>`;
  return g;
}

Sim.registerView({
  id: 'ilo', title: 'Power and iLO',
  keep: [
    ['Two feeds', 'PS1 and PS2 go to different PDUs on different circuits, so the server keeps running if one feed fails.'],
    ['Standby', 'With a cord in, the power LED is amber: the server is in standby and iLO is running, even with the server off.'],
    ['Powering on', 'Press the Power On/Standby button: the LED flashes green during the power-on sequence, then stays green. Hold it more than 4 seconds only to force the server off.'],
    ['iLO Service Port', 'The front USB port marked iLO takes a USB-to-Ethernet adapter. The laptop gets an address from iLO, and iLO answers at 169.254.1.2.'],
    ['Default account', 'User Administrator; the password is on the serial number / iLO information pull tab. Change it once the server is set up, and keep it in the password vault.'],
    ['Dedicated port', 'At the rear, the iLO Management Port connects iLO to the management network for remote access. It needs an address: from DHCP, or a static one set in the iLO 6 Configuration Utility.'],
    ['First setup at the rack', 'A new iLO has DHCP on and no address when no DHCP server answers. Plug a monitor into the rear VGA port and a USB keyboard into a rear USB port, power on, press F9 at POST and set the address in the iLO 6 Configuration Utility.']],
  render(t) { return frame('Rear panel: power, iLO network, monitor and keyboard; front: the iLO Service Port', rearSvg(t) + svcSvg(t), 510); },
  actions(t) {
    const a = [];
    if (acOn(t)) a.push(button(t.power === 'standby' ? 'Press the Power On/Standby button' : t.power === 'on' ? 'Press the Power On/Standby button (shut down)' : 'Powering on…', 'power'));
    a.push(button('Look at the monitor (local console)', 'go', 'console'));
    a.push(button('Open the laptop\'s browser (iLO web interface)', 'go', 'web'));
    return a;
  },
  tray(t) {
    return woTable(t) + `<h2>Serial / iLO pull tab</h2>${t.flags.sawTab ? `<table class="dec"><tr><td>iLO user</td><td>${LAB.user}</td></tr><tr><td>Password</td><td style="font-family:var(--mono)">${LAB.pw}</td></tr><tr><td>DNS name</td><td style="font-family:var(--mono)">${LAB.ilo}</td></tr><tr><td>Service Port IP</td><td>${LAB.svcIp}</td></tr></table><p class="cap">From the iLO side of this lab server's pull tab (invented values).</p>` : `<p class="cap" style="font-size:13px">Pull it out on the front panel (Front panel and drives view) and read its iLO side.</p>`}`;
  }
});
Sim.on('cord', k => {
  if (T.cab && T.cab[k]) return Sim.actions.cabFrom(k);
  return bad(`Plug the ${k.toUpperCase()} cord in at its exact PDU outlet: open the Cabling view (rear of the rack), where the cable schedule lists every port.`);
});
Sim.on('iloPort', () => {
  if (T.cab && T.cab.ilo) return Sim.actions.cabFrom('ilo');
  return bad('Plug the iLO cable in at its exact management switch port: open the Cabling view (rear of the rack), where the cable schedule lists every port.');
});
Sim.on('crashVga', () => { T.crash.vga = !T.crash.vga; Sim.sound(T.crash.vga ? 'snap' : 'clipOpen'); say('ok', T.crash.vga ? 'Monitor cable plugged into the rear VGA port (blue, 15 pins). The monitor shows the server\'s screen: the Local console view.' : 'Monitor unplugged from the VGA port.'); });
Sim.on('crashKbd', () => { T.crash.kbd = !T.crash.kbd; Sim.sound(T.crash.kbd ? 'snap' : 'clipOpen'); say('ok', T.crash.kbd ? 'USB keyboard and mouse plugged into the rear USB 3.2 ports.' : 'Keyboard and mouse unplugged.'); });
Sim.on('laptop', () => { if (T.net === 'mgmt' && !T.laptop) return say('info', `iLO Service Port: a laptop on it reaches iLO at ${LAB.svcIp}. Not used in this lab: your laptop is on the management network (${WO.pcIp}), and iLO is reached through its rear Management Port at the address you set.`); T.laptop = !T.laptop; Sim.sound(T.laptop ? 'snap' : 'clipOpen'); if (!T.laptop && T.net !== 'mgmt') Object.assign(T.ilo, { page: T.ilo.page === 'blank' ? 'blank' : 'noreach', msg: 'There is no network connection.', rc: false, menu: null }); say(T.laptop ? 'ok' : 'info', T.laptop ? 'USB-to-Ethernet adapter plugged into the iLO Service Port, the laptop\'s network cable into the adapter.' : 'Adapter unplugged from the iLO Service Port.'); });
// the work order, shown beside the rear panel, the local console and the browser
function woTable(t) {
  const a = t.iloCfg.users[0], n = t.iloCfg.net;
  return `<h2>Work order: iLO on the management network</h2><table class="dec"><tr><td>iLO IP address</td><td style="font-family:var(--mono)">${WO.ip} /24</td></tr><tr><td>Subnet mask</td><td style="font-family:var(--mono)">${WO.mask}</td></tr><tr><td>Gateway</td><td style="font-family:var(--mono)">${WO.gw}</td></tr><tr><td>DHCP</td><td>Off (no DHCP server on this network)</td></tr><tr><td>Administrator password</td><td style="font-family:var(--mono)">${WO.pw}</td></tr></table><p class="cap" style="font-size:12.5px;margin-top:6px">The new password replaces the one on the pull tab. Connection: the rear iLO Management Port to the management switch; your laptop is on the same network (${WO.pcIp}).</p><p class="cap" style="font-size:12.5px">iLO now: ${n.dhcp === 'ON' ? 'DHCP on, no address' : `static ${esc(n.ip)}`}${t.iloCfg.resetAt ? ' (resetting)' : ''}; Administrator password ${a && a.pw === LAB.pw ? 'still the pull-tab one' : 'changed'}.</p>`;
}

/* ---- the local console: the monitor on the rear VGA port and the USB keyboard and mouse, for the first setup. The
   screen is the same as in the iLO remote console: Secure Start, POST, F9 System Utilities. ---- */
Sim.registerView({
  id: 'console', title: 'Local console (monitor)',
  keep: [
    ['No address yet', 'At POST, the bottom of the screen shows iLO 6 IPv4. A new iLO with DHCP on and no DHCP server shows 0.0.0.0: it cannot be reached on the management network yet.'],
    ['F9 at POST', 'When the bottom of the POST screen offers F9 System Utilities, press F9. Missed it? Ctrl+Alt+Del restarts the server.'],
    ['DHCP off first', 'In Network Options, set DHCP Enable to OFF: only then can you type the IP address, the subnet mask and the gateway.'],
    ['The new password', 'User Management, Edit/Remove User: Administrator, Action Edit, then Password. It replaces the pull-tab password.'],
    ['Save, then iLO resets', 'Save the network settings first: F12 (Save and Exit), Yes - Save Changes. They take effect after an iLO reset; the server keeps running in System Utilities. Then change the password and save again.'],
    ['Resume the boot', 'Back in System Utilities, Exit and resume system boot lets the server start its operating system. Then unplug the monitor and keyboard: from now on, iLO is reached over the network.']],
  render(t) {
    const keys = [['Esc', 'Esc'], ['Up', '&uarr;'], ['Down', '&darr;'], ['Enter', 'Enter'], ['F9', 'F9'], ['F10', 'F10'], ['F12', 'F12'], ['CtrlAltDel', 'Ctrl+Alt+Del']];
    const scr = t.crash.vga ? conScreen(t) : `<div class="cc"><div class="nov">No monitor on the server. Plug it into the rear VGA port (Power and iLO view).</div></div>`;
    return `<div class="h6 mon cueable" role="region" aria-label="Local console: monitor and keyboard"><p class="cap2">Monitor on the rear VGA port${t.crash.kbd ? ', USB keyboard and mouse on the rear USB ports' : ', no keyboard yet'}. Power LED: ${!acOn(t) ? 'off, no power' : t.power === 'standby' ? 'amber, standby' : t.power === 'post' ? 'flashing green' : 'green'}.</p><div class="bez"><div class="rcscr" tabindex="0" aria-label="Server screen">${scr}</div><div class="bezb"><span>${postCode(t) ? 'POST code ' + postCode(t) : ''}</span><i class="${t.crash.vga && isOn(t) ? 'on' : ''}"></i></div></div>${t.crash.kbd ? `<div class="rck"><span>Keyboard:</span>${keys.map(([k, l]) => `<button data-act="rcKey" data-arg="${k}">${l}</button>`).join('')}<span style="margin-left:6px">Your own keyboard works too while the screen has focus.</span></div>` : '<p class="cap2" style="margin:8px 0 0">No keyboard: plug a USB keyboard into a rear USB port (Power and iLO view).</p>'}</div>`;
  },
  after(t) { if (Sim.view !== 'console' || !t.crash.kbd) return; const d = t.rb.dlg, ae = document.activeElement, free = !ae || ae === document.body;
    if (d && d.kind === 'pw') { const el = document.querySelector(`#stage [data-field="rb:${d.pw1 ? 'pw2' : 'pw1'}"]`); if (el && free) el.focus({ preventScroll: true }); return; }
    if (free) { const s2 = document.querySelector('#stage .mon .rcscr'); if (s2) s2.focus({ preventScroll: true }); } },
  actions(t) { const a = []; if (acOn(t)) a.push(button(t.power === 'standby' ? 'Press the Power On/Standby button (front)' : t.power === 'on' ? 'Press the Power On/Standby button (shut down)' : 'Powering on…', 'power')); a.push(button('Rear panel (Power and iLO)', 'go', 'ilo')); return a; },
  tray(t) {
    return woTable(t) + `<h3>iLO 6 User Guide: first setup in the iLO 6 Configuration Utility</h3><ol class="rules" style="padding-left:20px"><li>Monitor on VGA, keyboard on USB, power on</li><li>At POST, press F9 (System Utilities)</li><li>System Configuration, then iLO 6 Configuration Utility</li><li>Network Options: DHCP Enable OFF, then IP Address, Subnet Mask, Gateway IP Address</li><li>F12 (Save and Exit), Yes - Save Changes</li><li>OK: iLO resets to use the new address</li><li>User Management, Edit/Remove User: Administrator, Action Edit, Password</li><li>F12 (Save and Exit), Yes - Save Changes: no reset this time</li><li>Esc back to System Utilities, Exit and resume system boot</li></ol><h3>Keys</h3><ul class="rules"><li>Click the menus and fields on the screen, as with the mouse</li><li>The keys under the screen send Esc, the arrows, Enter and the function keys</li></ul>`;
  }
});
