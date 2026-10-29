/* ---- Front panel, readiness and power: the trainer's photos of the operations panel (left rack ear).
   LED meanings follow the "Operations Panel Quick-Status LEDs" table on the server's service label (items A to G). ---- */
const LEDC = { green: '#3DDC84', amber: '#FFB52E', blue: '#4AA8FF' };
// positions: crop = operations-panel close-up (646 x 1353: the trainer's photo of the left rack ear, LEDs shown unlit), ovr = straightened
// front photo (2532 x 488), whose left ear is that same photo scaled into place. glyph: centre and radius of the power symbol (crop units)
const OPS_H = 1353;
const OPS = [
  { k: 'A', name: 'Power button / power status LED', kind: 'btn', crop: [155, 214, 456, 404], ovr: [161.7, 64.8, 56, 34], glyph: [306.3, 315.7, 43.6] },
  { k: 'B', name: 'Unit identification button / LED', kind: 'btn', crop: [151, 480, 452, 670], ovr: [161, 112.9, 56, 34], glyph: [300, 568, 50] },
  { k: 'C', name: 'System status LED', kind: 'led', crop: [360, 773], ovr: [171.9, 148.8, 21, 13] },
  { k: 'D', name: 'Fan status LED', kind: 'led', crop: [360, 888], ovr: [171.9, 169.6, 21, 13] },
  { k: 'E', name: 'Temperature status LED', kind: 'led', crop: [360, 1004], ovr: [171.9, 190.6, 21, 13] },
  { k: 'F', name: 'Power supply status LED', kind: 'led', crop: [360, 1120], ovr: [171.9, 211.6, 21, 13] },
  { k: 'G', name: 'Network activity LED', kind: 'led', crop: [360, 1235], ovr: [171.9, 232.4, 21, 13] }];
function frontLeds(t) {
  const on = t.power === 'on', c = t.cables, pl = powerLed(t), ph = conPhase(t);
  const dimmFault = Object.values(t.dimms).some(d => d.fault), raidBad = t.bays.some(b => b.member && b.health !== 'ok'), pi = psuIssue(t), fanOut = t.fans.some(f => f === 'out' || f === 'set'), fanFault = t.fans.includes('fault'), hot = !!t.flags.fanLate, link = false;   // LED G reports the onboard LOM ports; in this build the data network runs on the VIC in riser 2
  const crit = t.arrayFailed || hot, why = [dimmFault && 'faulty DIMM', raidBad && 'drive missing or failed in a RAID volume', pi && pi.txt, (fanOut || fanFault) && 'fan module fault'].filter(Boolean);
  const init = on && ph !== 'final' && ph !== 'off';
  const v = [
    { col: pl === 'off' ? null : pl, txt: { off: 'Off: no AC power to the server', amber: 'Amber: standby power mode (only Cisco IMC runs)', green: 'Green: main power mode' }[pl] },
    { col: t.locator ? 'blue' : null, blink: t.locator, txt: t.locator ? 'Blue, blinking: activated by the user' : 'Off: not in use' },
    !on ? { txt: 'Off' } : crit ? { col: 'amber', blink: true, txt: 'Amber, blinking: critical fault (' + (t.arrayFailed ? 'RAID volume failed' : 'temperature non-recoverable') + ')' } : why.length ? { col: 'amber', txt: 'Amber: degraded operational state (' + why.join(', ') + ')' } : init ? { col: 'green', blink: true, txt: 'Green, blinking: initialization and memory check' } : { col: 'green', txt: 'Green: normal operating condition' },
    !on ? { txt: 'Off' } : fanOut ? { col: 'amber', blink: true, txt: 'Amber, blinking: a fan module breached the non-recoverable threshold (removed)' } : fanFault ? { col: 'amber', txt: 'Amber: a fan module breached the critical threshold' } : { col: 'green', txt: 'Green: all fan modules operating normally' },
    !on ? { txt: 'Off' } : hot ? { col: 'amber', txt: 'Amber: a temperature sensor exceeded the critical threshold' } : { col: 'green', txt: 'Green: normal temperature' },
    !on ? { txt: 'Off' } : pi && pi.crit ? { col: 'amber', blink: true, txt: `Amber, blinking: a power supply is in a critical fault state (${pi.txt})` } : pi ? { col: 'amber', txt: `Amber: a power supply is in a degraded state (${pi.txt})` } : { col: 'green', txt: 'Green: all power supplies operating normally' },
    !on || !link ? { txt: on ? 'Off: no link on the onboard LOM ports (data runs on the VIC in riser 2)' : 'Off' } : t.flags.hasOS && ph === 'final' ? { col: 'green', blink: true, txt: 'Green, blinking: activity on a link-active LOM port' } : { col: 'green', txt: 'Green: a LOM port is link-active, no activity' }];
  return OPS.map((o, i) => Object.assign({}, o, v[i]));
}
function opsGlow(l, X, Y, s, ovr) {
  if (!l.col) return '';
  const c = LEDC[l.col], b = l.blink ? ' class="blink"' : '';
  if (ovr) {
    const [x, y, w = 13, h = 9] = l.ovr;
    if (l.kind === 'btn') return `<g${b}><circle cx="${X(x)}" cy="${Y(y)}" r="${(h * 0.75 * s).toFixed(1)}" fill="${c}" opacity=".3"/><circle cx="${X(x)}" cy="${Y(y)}" r="${(h * 0.32 * s).toFixed(1)}" fill="none" stroke="${c}" stroke-width="${(2.6 * s).toFixed(2)}"/></g>`;
    return `<rect x="${X(x - w / 2)}" y="${Y(y - h / 2)}" width="${w * s}" height="${h * s}" rx="${2 * s}" fill="${c}" opacity=".85"${b}/><rect x="${X(x - w)}" y="${Y(y - h)}" width="${2 * w * s}" height="${2 * h * s}" rx="${4 * s}" fill="${c}" opacity=".25"${b}/>`;
  }
  if (l.kind === 'btn') {
    const [x0, y0, x1, y1] = l.crop, [gx, gy, gr] = l.glyph, P = (u, v) => `${X(u)} ${Y(v)}`;
    // the power button lights its own symbol; the unit identification button glows round its icon
    if (l.k === 'A') {
      const a0 = -50 * Math.PI / 180, a1 = 230 * Math.PI / 180, R = gr * s, sym = `M${P(gx + gr * Math.cos(a0), gy + gr * Math.sin(a0))}A${R.toFixed(1)} ${R.toFixed(1)} 0 1 1 ${P(gx + gr * Math.cos(a1), gy + gr * Math.sin(a1))}M${P(gx, gy - gr * 1.33)}V${Y(gy - gr * 0.3)}`;
      return `<g${b}><path d="${sym}" fill="none" stroke="${c}" stroke-width="${(36 * s).toFixed(1)}" stroke-linecap="round" opacity=".35"/><path d="${sym}" fill="none" stroke="${c}" stroke-width="${(14 * s).toFixed(1)}" stroke-linecap="round"/></g>`;
    }
    return `<g${b}><rect x="${X(x0)}" y="${Y(y0)}" width="${((x1 - x0) * s).toFixed(1)}" height="${((y1 - y0) * s).toFixed(1)}" rx="${(30 * s).toFixed(1)}" fill="${c}" opacity=".22"/><circle cx="${X(gx)}" cy="${Y(gy)}" r="${(gr * s).toFixed(1)}" fill="${c}" opacity=".5"/></g>`;
  }
  const [x, y] = l.crop; return `<rect x="${X(x - 57)}" y="${Y(y - 37)}" width="${114 * s}" height="${74 * s}" rx="${9 * s}" fill="${c}" opacity=".92"${b}/><rect x="${X(x - 80)}" y="${Y(y - 54)}" width="${160 * s}" height="${108 * s}" rx="${16 * s}" fill="${c}" opacity=".25"${b}/>`;
}
Sim.registerView({
  id: 'ready', title: 'Readiness and power',
  keep: [
    ["Everything in place", "Do not power on unless every card, blanking panel, fan module, drive blank and the top cover is in place: the airflow depends on them. Run the readiness check first."],
    ["Standby is not off", "With the cords in, an amber power LED means standby: Cisco IMC is running and current is present inside. Only pulling both cords removes all power."],
    ["Graceful shutdown", "Press and release the power button to shut the operating system down cleanly to standby. Pressing and holding it for four seconds forces the power off and can lose data: use it only in an emergency."],
    ["Watch the first boot", "System status blinks green during initialization and the memory check, then stays green. If it turns amber, read the fan, temperature and power supply LEDs before you go on."],
    ["Loud, then quieter", "At power-on the fans run at full speed until the server takes over fan control, then they slow down. A server that stays loud has a reason: a fan module fault, a high temperature, or a missing blank or cover."],
    ["Amber versus blinking", "Steady amber means degraded: the server runs, but something needs attention. Blinking amber means a critical fault."],
    ["Find the right server", "Press the unit identification button so the blue LED blinks on the front and rear. Check it from the back before you touch any cable."],
    ["One change at a time", "If a check fails, fix one thing and test again. You then know which change cleared the fault."],
    ["Training deck", "Slides 100 to 104: managing servers and out-of-band management. Slides 111 to 115: the troubleshooting method."]],
  render(t) {
    const L = frontLeds(t), s0 = 840 / 2532, X0 = 30, Y0 = 40, ox = x => (X0 + x * s0).toFixed(1), oy = y => (Y0 + y * s0).toFixed(1);
    const ZB = { x: 40, y: 222, w: 160 }, zs = ZB.w / 646, zx = x => (ZB.x + x * zs).toFixed(1), zy = y => (ZB.y + y * zs).toFixed(1), zh = OPS_H * zs;
    let g = `<g transform="translate(${X0} ${Y0}) scale(${s0.toFixed(5)})">${frontBays(t)}</g>`;
    L.forEach(l => { g += opsGlow(l, ox, oy, s0, true); });
    g += `<rect x="${ox(105)}" y="${oy(9)}" width="${(120 * s0).toFixed(1)}" height="${(245 * s0).toFixed(1)}" fill="none" stroke="#FFB52E" stroke-width="2"/><path d="M${ox(105)} ${oy(254)}L${ZB.x} ${ZB.y}M${ox(225)} ${oy(254)}L${ZB.x + ZB.w} ${ZB.y}" stroke="#FFB52E" stroke-width="1.5" fill="none" stroke-dasharray="5 4"/>`;
    g += `<rect x="${ZB.x - 4}" y="${ZB.y - 4}" width="${ZB.w + 8}" height="${(zh + 8).toFixed(1)}" rx="6" fill="#0E1A22" stroke="#FFB52E" stroke-width="2"/><image href="${IMG.opsPanel}" x="${ZB.x}" y="${ZB.y}" width="${ZB.w}" height="${zh.toFixed(1)}"/>`;
    L.forEach(l => { g += opsGlow(l, zx, zy, zs); });
    L.forEach(l => { const [x, y] = l.kind === 'btn' ? [l.crop[2], (l.crop[1] + l.crop[3]) / 2] : [l.crop[0] + 74, l.crop[1]]; g += `<circle cx="${(+zx(x) + 14).toFixed(1)}" cy="${zy(y)}" r="9" fill="#0E1A22" stroke="#C5CCD3"/><text x="${(+zx(x) + 14).toFixed(1)}" y="${(+zy(y) + 4).toFixed(1)}" text-anchor="middle" class="ss" style="fill:#EAF2F7;font-size:11px">${l.k}</text>`; });
    const pb = L[0].crop, ib = L[1].crop;
    g += `<g${hot(t.power === 'on' ? 'shutdown' : 'powerOn', '', 'Power button')}><rect x="${zx(pb[0])}" y="${zy(pb[1])}" width="${((pb[2] - pb[0]) * zs).toFixed(1)}" height="${((pb[3] - pb[1]) * zs).toFixed(1)}" rx="8" class="zone"/></g><g${hot('locator', '', 'Unit identification button')}><rect x="${zx(ib[0])}" y="${zy(ib[1])}" width="${((ib[2] - ib[0]) * zs).toFixed(1)}" height="${((ib[3] - ib[1]) * zs).toFixed(1)}" rx="8" class="zone"/></g>`;
    L.forEach((l, i) => {
      const y = 236 + i * 52, col = l.col ? LEDC[l.col] : null;
      g += `<circle cx="274" cy="${y}" r="10" fill="${col || '#3A4A57'}" stroke="#8E99A3"${l.blink ? ' class="blink"' : ''}/><text x="274" y="${y + 4}" text-anchor="middle" class="ss" style="fill:${col ? '#0E1A22' : '#EAF2F7'};font-size:11px;font-weight:700">${l.k}</text><text x="294" y="${y - 3}" class="st">${l.name}</text><text x="294" y="${y + 14}" class="ss">${esc(l.txt)}</text>`;
    });
    g += `<text x="30" y="${(ZB.y + zh + 30).toFixed(0)}" class="ss">Click the power button or the unit identification button on the enlarged operations panel. Letters A to G match the service label.</text>`;
    const issues = runRules(), fails = issues.filter(i => i.lvl === 'fail');
    let h = `<div class="pane" style="min-height:0">`;
    if (t.checked || t.power === 'on') h += `<ul class="chk" style="margin-top:0">${issues.map(i => `<li class="${i.lvl}"><b>${i.lvl === 'fail' ? 'Blocking' : 'Warning'}:</b> ${esc(i.msg)}</li>`).join('') || '<li class="pass">No issues found. The build matches the rules for this server.</li>'}</ul>`;
    else h += `<p style="color:var(--muted);margin:0">Run the readiness check to compare the build against the Cisco rules for this server, then press the power button.</p>`;
    if (t.post) h += `<h3 style="font-family:var(--display);font-size:18px;margin:14px 0 4px">Simulated self-test result</h3><ul class="chk">${Object.entries(t.post).map(([k, v]) => `<li class="pass"><b>${{ cpus: 'CPUs', memory: 'Memory', drives: 'Drives', cards: 'Cards' }[k]}:</b> ${esc(v)}</li>`).join('')}</ul>`;
    h += `<h3 style="font-family:var(--display);font-size:18px;margin:14px 0 4px">Live server link</h3><p style="margin:0;color:var(--muted)">Not connected. This twin keeps its whole state as data, so a later version can bind it to a real server's Cisco IMC and mirror inventory, sensors and power state.</p>`;
    if (t.flags.json) h += `<textarea readonly aria-label="Twin state as JSON">${esc(JSON.stringify({ profile: PROFILE.name, cpu: t.cpu, dimms: t.dimms, riser: t.riser, bays: t.bays, fans: t.fans, rack: t.rack, cables: t.cables, management: t.cimc.net, power: t.power, locator: t.locator, issues: issues, blocking: fails.length }, null, 1))}</textarea>`;
    return frame('Front panel and operations panel', g, Math.round(ZB.y + zh + 42)) + h + `</div>`;
  },
  actions(t) { return [button('Run readiness check', 'check'), button(t.flags.json ? 'Hide twin state' : 'Show twin state as data', 'json')]; },
  tray() {
    return `<h2>Operations panel</h2><p class="cap" style="font-size:13px">Your photos of the server front and its operations panel, straightened and cleaned. The LED meanings are the "Operations Panel Quick-Status LEDs" table printed on the server's top cover.</p>
      <ul class="rules"><li>Press and release the power button: graceful shutdown to standby</li><li>Amber power LED means current is still present. Pull the power cords before opening the server</li><li>System status blinks green during initialization and memory check, then stays green</li><li>Amber means degraded; amber blinking means a critical fault</li><li>The unit identification LED blinks blue on the front and the rear, so you can find the server from the other side of the rack</li></ul>`;
  }
});
Sim.on('check', () => { T.checked = true; const f = runRules().filter(i => i.lvl === 'fail').length; say(f ? 'warn' : 'ok', f ? `${f} blocking issue${f === 1 ? '' : 's'} found. Fix them before powering on.` : 'No blocking issues. The server is ready to power on.'); });
Sim.on('powerOn', () => {
  if (!psuAny(T)) return bad(T.cables.psu1 || T.cables.psu2 ? 'Nothing happens: no power supply is working, so the power LED stays off. Check the supplies at the rear (Power supplies view).' : 'Nothing happens: there is no AC power, so the power LED stays off. Connect the power cords first (Cables view).');
  if (T.power === 'on') return say('info', 'The server is already running.');
  T.checked = true; const f = runRules().filter(i => i.lvl === 'fail');
  if (f.length) return bad(`Power-on stopped: ${f[0].msg}`);
  T.power = 'on'; T.post = postSummary(); startPost(T); Sim.sound('fans');
  say('ok', 'Power LED green: main power. The fans run up to full speed, then slow down once the server takes over fan control. The server runs its power-on self-test' + (T.crash.vga ? ': watch the monitor.' : '. Connect a monitor to see it.'));
});
Sim.on('shutdown', () => { T.power = 'off'; T.post = null; Sim.soundStop('fans', 2.5); T.con.mode = 'off'; T.flags.shut = true; say('ok', 'Power button pressed and released: the operating system shut down gracefully. Power LED amber: standby. Current is still present until the cords are out.'); });
Sim.on('locator', () => { T.locator = !T.locator; if (T.locator) T.flags.locOn = true; say('info', T.locator ? 'Unit identification LED blinking blue on the front and rear panels.' : 'Unit identification LED off.'); });
Sim.on('json', () => { T.flags.json = !T.flags.json; });

/* ---- Cisco IMC: simulated browser and web interface, used to verify the console setup and change the credentials ---- */
const ipNum = s => { const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(String(s || '').trim()); if (!m) return null; const o = m.slice(1).map(Number); return o.some(x => x > 255) ? null : ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0; };
const maskOk = n => { if (n === null || n === 0) return false; const inv = (~n) >>> 0; return (inv & (inv + 1)) === 0; };
function pwProblems(p, user) {
  const o = []; p = p || '';
  if (p.length < 8) o.push('at least 8 characters');
  if ([/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(p)).length < 3) o.push('characters from three of these groups: upper case, lower case, digits, special characters');
  if (p.toLowerCase().includes(user)) o.push('must not contain the user name');
  if (/(.)\1\1\1/.test(p)) o.push('no character more than three times in a row');
  return o;
}
const cimcReach = t => { const n = t.cimc.net;
  if (!psuAny(t)) return 'The management controller has no standby power. Connect at least one power cord to a working power supply (Cables view).';
  if (t.cables.mgmt !== 'mgmt') return 'The dedicated management port (M) is not cabled to the management switch (Cables view).';
  if (!cabRight(t, 'mgmt')) return `The management cable is in ${portTxtC('mgmt', cabN(t, 'mgmt'))}, which is not assigned to this server: no link. Move it to ${wantTxt('mgmt')} (Cables view).`;
  if (n.ip === '0.0.0.0') return 'Cisco IMC has no IP address yet: no DHCP server answered. Set a static address from the local console with F8 (Console setup view).';
  if (n.mode !== 'Dedicated') return `Cisco IMC is in ${n.mode} NIC mode, so it does not answer on the dedicated management port. Set NIC mode to Dedicated.`;
  if (n.vlan) return `Cisco IMC tags its traffic with VLAN ${n.vlanId}, but the management switch port is untagged. Untick VLAN enabled.`;
  return ''; };
const netMismatch = t => { const n = t.cimc.net, o = [];
  if (n.mode !== 'Dedicated') o.push('NIC mode'); if (n.red !== 'None') o.push('NIC redundancy'); if (n.dhcp) o.push('DHCP');
  if (n.ip !== WO.ip) o.push('IP address'); if (n.mask !== WO.mask) o.push('subnet mask'); if (n.gw !== WO.gw) o.push('gateway'); return o; };
const netDone = t => !netMismatch(t).length;
Sim.registerView({
  id: 'cimc', title: 'Management (Cisco IMC)',
  keep: [
    ["Change the default password", "Replace the factory admin password at the first login. Keep the new one in the password vault, never on a label or in a ticket."],
    ["Static address", "Give Cisco IMC the static IP, mask and gateway from the work order, with DHCP off, so monitoring and the inventory always find it at the same address."],
    ["A separate network", "Keep Cisco IMC on the management network only. It can power the server off, open its console and mount virtual media, so it must not be reachable from the data network."],
    ["NIC mode and cabling", "In Dedicated mode Cisco IMC answers only on the MGMT port. The NIC mode you set must match the port you cabled, or the server cannot be reached."],
    ["Certificate warning", "The browser warns about the certificate the first time because Cisco IMC uses a self-signed one. Check the address you typed before you accept it."],
    ["Check every field", "Compare each setting with the work order before you leave the rack. One wrong digit in the gateway makes the server unreachable from other subnets."],
    ["Locked out?", "The F8 Cisco IMC Configuration Utility on the local console can set the network again. Keep a monitor and keyboard within reach until a remote login works."],
    ["Training deck", "Slides 100 to 104: access paths, local and virtual consoles, out-of-band management."]],
  render(t) {
    const c = t.cimc, f = c.form;
    const fin = (field, type = 'text', extra = '') => `<input type="${type}" data-field="${field}" value="${esc(f[field] || '')}" autocomplete="off" spellcheck="false" aria-label="${field}" ${extra}>`;
    const sel = (field, opts) => `<select data-field="${field}" aria-label="${field}">${opts.map(o => `<option${f[field] === o ? ' selected' : ''}>${o}</option>`).join('')}</select>`;
    const b = (label, act, arg = '', cls = '', extra = '') => `<button class="${cls}" data-act="${act}" data-arg="${arg}" ${extra}>${label}</button>`;
    const chk = (on, act, label) => `<button class="chk" role="checkbox" aria-checked="${!!on}" aria-label="${label}" data-act="${act}" data-arg="">${on ? '&#10003;' : '&nbsp;'}</button>`;
    const secure = c.tab === 'login' || c.tab === 'app' ? '<span class="nsec">Not secure</span>' : '';
    let h = `<div class="simui cueable"><div class="note">Training simulation of a browser and the Cisco IMC web interface. It is not connected to a real server. Never type a real password here.</div>
      <div class="addr">${secure}<input class="url" data-field="url" data-enter="cimcGo" value="${esc(f.url || '')}" placeholder="Type an address and press Enter" autocomplete="off" spellcheck="false" aria-label="Browser address bar">${b('Go', 'cimcGo')}</div>`;
    if (c.tab === 'blank') return h + `<div class="unreach"><h4>New tab</h4><p>Your laptop is on the management network. Type the controller's address in the address bar above: the CIMC IP you set from the console.</p></div></div>`;
    if (c.tab === 'unreach') return h + `<div class="unreach"><h4>This site can't be reached</h4><p><b>${esc(c.url)}</b> took too long to respond.</p><p>${esc(c.why || '')}</p></div></div>`;
    if (c.tab === 'lost') return h + `<div class="unreach"><h4>Connection lost</h4><p>The controller's address changed to ${c.net.ip}, so this session ended. Type the new address in the address bar.</p></div></div>`;
    if (c.tab === 'cert') return h + `<div class="certw"><h4>Your connection is not private</h4><p>The site at <b>${esc(c.url)}</b> presented a certificate that your computer does not trust.</p><p class="code">NET::ERR_CERT_AUTHORITY_INVALID</p>
      ${c.certAdv ? `<p>This server could not prove that it is ${esc(c.url)}: its certificate is self-signed. Continue only if this is the address on your work order.</p><p>${b('Continue to ' + esc(c.url) + ' (unsafe)', 'cimcCert')}</p>` : `<p>${b('Back to safety', 'cimcBack', '', 'blue')} ${b('Advanced', 'cimcAdv')}</p>`}</div></div>`;
    if (c.tab === 'login') return h + `<div class="login"><div class="host">${esc(c.net.host)}</div><h3>Cisco Integrated Management Controller</h3><div>Simulated interface, modelled on version 3.0</div><div class="msg">${esc(c.msg || 'Logged out')}</div>${fin('user', 'text', 'placeholder="Username"')}${fin('pass', 'password', 'placeholder="Password" data-enter="cimcLogin"')}${b('Log In', 'cimcLogin')}</div></div>`;
    h += `<div class="bar">${b('&#9776;', 'cimcMenu', '', '', 'aria-label="Toggle navigation menu"')}<b>Cisco Integrated Management Controller</b><small>admin@${c.sess} - ${esc(c.net.host)}</small>${b('Log Out', 'cimcLogout')}</div>`;
    if (c.kvm) return h + kvmHtml(t, b) + '</div>';
    h += `<div class="crumb"><b>${{ summary: 'Chassis / Summary', inventory: 'Chassis / Inventory', faults: 'Chassis / Faults and Logs', users: 'User Management / Local User Management', network: 'Networking / Network', compute: 'Compute / BIOS' }[c.page]}</b>${b('Refresh', 'cimcMisc', 'Refresh')}${b('Host Power', 'cimcPower')}${b('Launch KVM', 'cimcKvm')}${b('Ping', 'cimcMisc', 'Ping')}${b('Reboot', 'cimcMisc', 'Reboot')}${b('Locator LED', 'cimcLocator')}</div><div class="body">`;
    if (c.menu) {
      const chas = ['summary', 'inventory', 'faults'].includes(c.page);
      h += `<nav class="side" aria-label="Cisco IMC navigation">${b('Chassis ' + (c.chassisOpen ? '&#9662;' : '&#9656;'), 'cimcNav', 'chassis', chas && !c.chassisOpen ? 'on' : '')}${c.chassisOpen ? b('Summary', 'cimcNav', 'summary', 'sub' + (c.page === 'summary' ? ' on' : '')) + b('Inventory', 'cimcNav', 'inventory', 'sub' + (c.page === 'inventory' ? ' on' : '')) + b('Sensors', 'cimcMisc', 'Sensors', 'sub') + b('Power Management', 'cimcMisc', 'Power Management', 'sub') + b('Faults and Logs', 'cimcNav', 'faults', 'sub' + (c.page === 'faults' ? ' on' : '')) : ''}${b('Compute', 'cimcNav', 'compute', c.page === 'compute' ? 'on' : '')}${b('Networking', 'cimcMisc', 'Networking')}${b('Storage', 'cimcMisc', 'Storage')}${b('Admin ' + (c.adminOpen ? '&#9662;' : '&#9656;'), 'cimcNav', 'admin')}`;
      if (c.adminOpen) h += b('User Management', 'cimcNav', 'users', 'sub' + (c.page === 'users' ? ' on' : '')) + b('Networking', 'cimcNav', 'network', 'sub' + (c.page === 'network' ? ' on' : '')) + ['Communication Services', 'Security Management', 'Event Management', 'Firmware Management', 'Utilities'].map(x => b(x, 'cimcMisc', x, 'sub')).join('');
      h += `</nav>`;
    }
    h += `<div class="main">`;
    if (c.page === 'summary') {
      const on = t.power === 'on', dimm = Object.values(t.dimms).some(d => d.fault), psu = psuBoth(t), pi = psuIssue(t), fans = t.fans.every(x => x === 'ok'), deg = t.bays.some(x => x.member && x.health !== 'ok');
      const st = (ok, good, badTxt, cls = 'bad') => ok ? `<span class="ok">&#10003; ${good}</span>` : `<span class="${cls}">&#9888; ${badTxt}</span>`;
      h += `<div class="cols"><div><h4>Server Properties</h4><div class="kv"><span>Product Name:</span><span>UCS C240 M4L</span><span>Serial Number:</span><span>${WO.serial}</span><span>PID:</span><span>UCSC-C240-M4L</span><span>Asset Tag:</span><span>Unknown</span></div></div>
        <div><h4>Cisco IMC Information</h4><div class="kv"><span>Hostname:</span><span>${esc(c.net.host)}</span><span>IP Address:</span><span>${c.net.ip}</span><span>MAC Address:</span><span>${WO.mac}</span><span>Firmware Version:</span><span>simulated</span></div></div></div>
        <h4>Chassis Status</h4><div class="kv"><span>Power State:</span><span class="${on ? 'ok' : 'warnc'}">&#9679; ${on ? 'On' : 'Off'}</span><span>Overall Server Status:</span>${st(!dimm && psu && fans && !deg && !t.arrayFailed, 'Good', dimm || t.arrayFailed ? 'Severe Fault' : 'Moderate Fault')}<span>Overall DIMM Status:</span>${st(!dimm, 'Good', 'Severe Fault')}<span>Power Supplies:</span>${st(psu, 'Good', pi && pi.crit ? 'Fault: redundancy lost' : 'Redundancy lost', 'warnc')}<span>Fans:</span>${st(fans, 'Good', 'Fault')}<span>Locator LED:</span><span>&#9679; ${t.locator ? 'On' : 'Off'}</span><span>Overall Storage Status:</span>${st(!deg && !t.arrayFailed, 'Good', t.arrayFailed ? 'Severe Fault' : 'Moderate Fault', t.arrayFailed ? 'bad' : 'warnc')}</div>`;
    } else if (c.page === 'inventory') {
      h += cimcInventory(t, b);
    } else if (c.page === 'faults') {
      h += cimcFaults(t, b);
    } else if (c.page === 'compute') {
      h += cimcCompute(t, b);
    } else if (c.page === 'users') {
      h += `<div class="tabs">${b('Local User Management', 'cimcMisc', 'tab', 'on')}${b('LDAP', 'cimcMisc', 'LDAP')}${b('Session Management', 'cimcMisc', 'Session Management')}</div><h4 style="margin-top:0">Local User Management</h4>
        <div class="tools">${b('Add User', 'cimcMisc', 'Add User', '', 'disabled')}${b('Modify User', 'cimcModify')}${b('Delete User', 'cimcMisc', 'Delete User', '', 'disabled')}${b('Disable Strong Password', 'cimcMisc', 'Disable Strong Password')}${b('Password Expiration Details', 'cimcMisc', 'Password Expiration Details')}</div>
        <table><tr><th style="width:44px"></th><th>ID</th><th>Enabled</th><th>Username</th><th>Role</th></tr><tr class="${c.rowSel ? 'sel' : ''}"><td>${chk(c.rowSel, 'cimcRow', 'Select user 1, admin')}</td><td>1</td><td>yes</td><td>admin</td><td>admin</td></tr>${Array.from({ length: 14 }, (_, i) => `<tr><td><button class="chk" disabled aria-label="Empty user slot ${i + 2}">&nbsp;</button></td><td>${i + 2}</td><td></td><td></td><td></td></tr>`).join('')}</table>`;
      if (c.dlg) h += `<div class="dlgwrap"><div class="dlg" role="dialog" aria-label="Modify user details"><header>Modify user Details</header><div class="in"><div class="kv"><span>ID</span><span><input value="1" disabled aria-label="ID"></span><span>* User Name</span><span><input value="admin" disabled aria-label="User name"></span><span>* Role Played:</span><span><select disabled aria-label="Role"><option>admin</option></select></span><span>Enabled:</span><span><button class="chk" disabled aria-label="Enabled">&#10003;</button></span><span>Change Password:</span><span>${chk(c.chg, 'cimcChg', 'Change password')}</span>${c.chg ? `<span>New Password:</span><span>${fin('np', 'password', 'placeholder="Enter Password"')}</span><span>Confirm Password</span><span>${fin('cp', 'password', 'placeholder="Re-Enter Password" data-enter="cimcSaveUser"')}</span>` : ''}</div></div><footer>${b('Save', 'cimcSaveUser', '', 'blue')}${b('Cancel', 'cimcCancel')}</footer></div></div>`;
    } else {
      const dis = f.dhcp ? 'disabled' : '';
      h += `<div class="tabs">${b('Network', 'cimcMisc', 'tab', 'on')}${b('Network Security', 'cimcMisc', 'Network Security')}${b('NTP Setting', 'cimcMisc', 'NTP Setting')}</div>
        <div class="cols"><div><h4 style="margin-top:0">NIC Properties</h4><div class="kv"><span>NIC Mode:</span><span>${sel('mode', ['Dedicated', 'Shared LOM', 'Shared LOM EXT', 'Cisco Card'])}</span><span>NIC Redundancy:</span><span>${sel('red', ['None', 'Active-active', 'Active-standby'])}</span><span>MAC Address:</span><span>${WO.mac}</span></div>
        <h4>Common Properties</h4><div class="kv"><span>Management Hostname:</span><span>${fin('host')}</span><span>Dynamic DNS:</span><span><button class="chk" disabled aria-label="Dynamic DNS">&#10003;</button></span></div></div>
        <div><h4 style="margin-top:0">IPv4 Properties</h4><div class="kv"><span>Enable IPv4:</span><span><button class="chk" disabled aria-label="Enable IPv4">&#10003;</button></span><span>Use DHCP:</span><span>${chk(f.dhcp, 'cimcDhcp', 'Use DHCP')}</span><span>Management IP Address:</span><span>${fin('ip', 'text', dis)}</span><span>Subnet Mask:</span><span>${fin('mask', 'text', dis)}</span><span>Gateway:</span><span>${fin('gw', 'text', dis)}</span><span>Preferred DNS Server:</span><span>${fin('dns', 'text', dis + ' data-enter="cimcSaveNet"')}</span></div></div></div>
        <p style="text-align:right;margin:16px 0 0">${b('Save Changes', 'cimcSaveNet', '', 'blue')}</p>`;
    }
    h += `</div></div></div>`;
    // the lab task, outside the simulated browser, right under it: compare the saved values with the work order, then confirm
    if (c.page === 'network') {
      const chkRows = [['NIC mode', 'Dedicated', c.net.mode], ['NIC redundancy', 'None', c.net.red], ['DHCP', 'Disabled', c.net.dhcp ? 'Enabled' : 'Disabled'], ['IP address', WO.ip, c.net.ip], ['Subnet mask', WO.mask, c.net.mask], ['Gateway', WO.gw, c.net.gw]];
      h += `<div class="cverify cueable${c.verified ? ' done' : ''}"><h3>Task: verify against the work order</h3><p>Compare every saved value with the work order, then confirm.</p><table class="dec"><tr><td></td><td>Work order</td><td>Saved</td></tr>${chkRows.map(([k, w, v]) => `<tr><td>${k}</td><td>${w}</td><td>${esc(v)}</td></tr>`).join('')}</table>${c.verified ? '<p class="okv">&#10003; Confirmed: the settings match the work order.</p>' : `<p style="margin:8px 0 0">${button('Confirm: settings match the work order', 'cimcVerify')}</p>`}</div>`;
    }
    return h;
  },
  tray(t) {
    const c = t.cimc, row = (k, v) => `<tr><td>${k}</td><td>${v}</td></tr>`;
    return `<h2>Work order</h2><table class="dec">${row('CIMC IP', WO.ip + ' (/24)')}${row('Gateway', WO.gw)}${row('NIC mode', 'Dedicated, redundancy None')}${row('Console account', WO.user + ' / ' + WO.pw)}${row('Then', 'change the password to a new strong one')}</table>
      <h3>Account</h3><ul class="rules"><li>${c.pwSrc === 'factory' ? 'Factory default account: admin / password' : c.pwSrc === 'console' ? `Set from the console: admin / ${esc(WO.pw)}` : c.pwSrc === 'preset' ? 'Account for this scenario: admin / Lab-Train1ng!' : 'admin and the new password you set'}</li><li>The browser warns about the certificate the first time: Cisco IMC uses a self-signed certificate</li><li>Keep the new password in the password vault, never on a label (slide 33)</li></ul>
      <h3>Strong password rules used here</h3><ul class="rules"><li>At least 8 characters</li><li>Characters from three of four groups: upper case, lower case, digits, special characters</li><li>Must not contain the user name</li><li>No character more than three times in a row</li></ul>
      <p class="cap" style="font-size:13px">The screens follow your Cisco IMC screenshots. Host Power, Locator LED and KVM act on the same twin as the front panel and the console.</p>`;
  }
});
const cimcOk = () => { const why = cimcReach(T); if (why) return bad(why); if (!T.cimc.auth) return bad('Log in to Cisco IMC first.'); return true; };
Sim.on('cimcGo', () => {
  const c = T.cimc, raw = (c.form.url || '').trim(), m = /^(?:(https?):\/\/)?([^\/:\s?#]+)(?::\d+)?(?:[\/?#].*)?$/i.exec(raw);
  if (!raw) return say('warn', 'Type the controller\'s IP address in the address bar first.');
  if (!m) return bad('That is not a valid address. Type the CIMC IP, for example ' + WO.ip + '.');
  const host = m[2], http = (m[1] || '').toLowerCase() === 'http';
  c.url = host; c.form.url = 'https://' + host; c.certAdv = false;
  const why = ipNum(host) === null ? `${host} is not an IP address. Type the CIMC IP from the work order.` : cimcReach(T) || (host !== c.net.ip ? `Nothing answers at ${host}. Check the address against the work order.` : '');
  if (why) { c.tab = 'unreach'; c.why = why; return say('warn', `The browser cannot reach ${host}. ${why}`); }
  if (!c.certOk[host]) { c.tab = 'cert'; return say('info', (http ? 'Cisco IMC redirected the browser to HTTPS. ' : '') + 'The browser warns about the certificate: expected for a new controller with its self-signed certificate.'); }
  c.tab = c.auth && c.sess === host ? 'app' : 'login'; if (c.tab === 'login') c.msg = '';
  say('info', (http ? 'Redirected to HTTPS. ' : '') + (c.tab === 'login' ? 'The Cisco IMC login page appears.' : 'Back to the open session.'));
});
Sim.on('cimcAdv', () => { T.cimc.certAdv = true; });
Sim.on('cimcBack', () => { const c = T.cimc; c.tab = 'blank'; c.form.url = ''; say('info', 'Back to a blank tab. The warning is expected for Cisco IMC: check the address, then continue through Advanced.'); });
Sim.on('cimcCert', () => { const c = T.cimc; c.certOk[c.url] = true; c.tab = 'login'; c.msg = ''; say('ok', 'Continued to the controller. The browser will not ask again for this address.'); });
Sim.on('cimcLogin', () => {
  const c = T.cimc, f = c.form, why = cimcReach(T); if (why) return bad(why);
  if (c.tab !== 'login') return;
  if ((f.user || '').trim() !== 'admin' || f.pass !== c.pw) { c.msg = 'Login failed'; f.pass = ''; return bad('Login failed: wrong user name or password.' + (c.pwSrc === 'console' ? ` Use the account set from the console: admin / ${WO.pw}.` : c.pwSrc === 'factory' ? ' The factory default account is admin / password.' : '')); }
  Object.assign(c, { auth: true, sess: c.url, tab: 'app', msg: '', page: 'summary', menu: false, adminOpen: false, dlg: false, rowSel: false, kvm: false }); f.pass = '';
  if (c.pwSrc === 'console') c.consoleLogin = true;
  if (c.guiPw && c.loggedOut) c.reloginNew = true;
  say(c.pwSrc === 'factory' ? 'warn' : 'ok', c.pwSrc === 'factory' ? 'Logged in with the factory default password. Anyone on the management network knows it: change it now.' : c.reloginNew ? 'Logged in with the new password: the credential change works.' : 'Logged in to Cisco IMC with the account set from the console.');
});
Sim.on('cimcLogout', () => { const c = T.cimc; Object.assign(c, { auth: false, tab: 'login', msg: 'Logged out', kvm: false, dlg: false }); c.loggedOut = true; c.form.user = ''; c.form.pass = ''; say('info', 'Logged out of Cisco IMC.'); });
Sim.on('cimcMenu', () => { if (!cimcOk()) return; T.cimc.menu = !T.cimc.menu; });
Sim.on('cimcNav', a => {
  if (!cimcOk()) return; const c = T.cimc;
  if (a === 'admin') { c.adminOpen = !c.adminOpen; return; }
  if (a === 'chassis') { c.chassisOpen = !c.chassisOpen; if (c.chassisOpen && !['summary', 'inventory', 'faults'].includes(c.page)) { c.page = 'summary'; c.dlg = false; } return; }
  c.page = a; c.dlg = false; c.boDlg = false;
  if (a === 'network') { Object.assign(c.form, c.net); say('info', 'Admin, Networking: the management controller\'s own network settings. Compare them with the work order in the panel on the right.'); }
  else if (a === 'users') say('info', 'Local User Management: 15 user slots. Slot 1 is the built-in admin account.');
  else if (a === 'inventory' || a === 'faults') { if (a === 'inventory') c.invTab = 'psu'; cimcPsuSeen(a); }
  else if (a === 'compute') { if (T.os && OSI.newSys(T)) T.flags.osBootSeen = true; say('info', 'Compute, BIOS: the boot mode and the boot order the BIOS reports.'); }
});
Sim.on('cimcMisc', a => {
  if (!cimcOk()) return;
  if (a === 'Refresh' && T.cimc.page === 'inventory' && T.cimc.invTab && T.cimc.invTab !== 'psu') return Sim.actions.cimcInvTab(T.cimc.invTab);
  // Reboot: a warm restart of the host, which runs the power-on self-test again (the fans rush up again)
  if (a === 'Reboot') { if (T.power !== 'on') return say('info', 'The host is powered off: there is nothing to reboot. Use Host Power to power it on.'); startPost(T); Sim.sound('fans'); return say('ok', 'Reboot: the host restarts and runs its power-on self-test. On a production server, shut the operating system down first.'); }
  if (a === 'Refresh' && (T.cimc.page === 'inventory' || T.cimc.page === 'faults')) return cimcPsuSeen(T.cimc.page, true);
  say('info', a === 'Networking' ? 'This Networking section is for the adapter cards. The management network settings are under Admin, Networking.' : a === 'Disable Strong Password' ? 'Leave strong passwords enabled.' : a === 'tab' ? 'This tab is already open.' : `${a} is not part of this exercise.`);
});
Sim.on('cimcVerify', () => {
  if (!cimcOk()) return; const c = T.cimc;
  if (c.page !== 'network') return bad('Open Admin, Networking first, then compare the settings with the work order.');
  const m = netMismatch(T);
  if (m.length) return bad(`Not a match: ${m.join(', ')} ${m.length === 1 ? 'differs' : 'differ'} from the work order. Correct ${m.length === 1 ? 'it' : 'them'} here and click Save Changes, or redo the console setup.`);
  c.verified = true; say('ok', 'Verified: NIC mode, redundancy, DHCP, IP address, subnet mask and gateway all match the work order.');
});
Sim.on('cimcRow', () => { if (!cimcOk()) return; T.cimc.rowSel = !T.cimc.rowSel; });
Sim.on('cimcModify', () => { if (!cimcOk()) return; const c = T.cimc; if (!c.rowSel) return say('warn', 'Select a user first: tick the checkbox for user 1, admin, then click Modify User.'); c.dlg = true; c.chg = false; c.form.np = ''; c.form.cp = ''; });
Sim.on('cimcChg', () => { if (!cimcOk()) return; T.cimc.chg = !T.cimc.chg; });
Sim.on('cimcCancel', () => { T.cimc.dlg = false; });
// a click outside the Modify user dialog closes it, as Cancel does: not a mistake
Sim.listen('click', e => { if (Sim.view === 'cimc' && T.cimc.dlg && e.target.matches && e.target.matches('.simui .dlgwrap')) Sim.do('cimcCancel', ''); });
Sim.on('cimcSaveUser', () => {
  if (!cimcOk()) return; const c = T.cimc, f = c.form;
  if (!c.chg) { c.dlg = false; return say('info', 'Nothing was changed. Tick Change Password to set a new one.'); }
  const p = pwProblems(f.np, 'admin');
  if (p.length) return bad('Password rejected by the strong password policy: ' + p.join('; ') + '.');
  if (f.np === c.pw) return bad('The new password is the same as the current one.');
  if (f.np !== f.cp) return bad('The two passwords do not match.');
  Object.assign(c, { pw: f.np, pwSrc: 'gui', guiPw: true, loggedOut: false, dlg: false, chg: false }); f.np = ''; f.cp = '';
  say('ok', 'Password changed for admin. Record it in the password vault, then log out and back in to prove it works.');
});
Sim.on('cimcDhcp', () => { if (!cimcOk()) return; const f = T.cimc.form; f.dhcp = !f.dhcp; });
Sim.on('cimcSaveNet', () => {
  if (!cimcOk()) return; const c = T.cimc, f = c.form, host = (f.host || '').trim();
  if (f.mode === 'Dedicated' && f.red !== 'None') return bad('Dedicated NIC mode works only with NIC redundancy None.');
  if (f.mode === 'Shared LOM EXT' && f.red !== 'Active-active') return bad('Shared LOM EXT mode works only with NIC redundancy Active-active.');
  if (f.mode !== 'Dedicated' && f.red === 'None') return bad('NIC redundancy None is valid only with Dedicated mode.');
  if (f.mode !== 'Dedicated') return bad('This site reaches Cisco IMC only through the dedicated management port. In a shared mode the controller answers on the LAN ports instead. Keep NIC mode Dedicated.');
  if (f.dhcp) return bad('There is no DHCP server on this management network: with DHCP on, the controller would lose its address. Keep DHCP off.');
  if (!/^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(host)) return bad('Hostname: letters, digits and hyphens only, up to 63 characters.');
  const ip = ipNum(f.ip), mask = ipNum(f.mask), gw = ipNum(f.gw), dns = ipNum(f.dns);
  if (ip === null) return bad('Management IP Address is not a valid IPv4 address.');
  if (!maskOk(mask)) return bad('Subnet Mask is not valid. Example: 255.255.255.0.');
  if (gw === null) return bad('Gateway is not a valid IPv4 address.');
  if (dns === null) return bad('Preferred DNS Server is not a valid IPv4 address (0.0.0.0 for none).');
  if (((ip & mask) >>> 0) !== ((gw & mask) >>> 0)) return bad('The gateway is not in the same subnet as the management address.');
  if (ip === gw) return bad('The management address and the gateway are the same address.');
  const hb = (ip & ~mask) >>> 0; if (hb === 0 || hb === ((~mask) >>> 0)) return bad('That is the network or broadcast address of the subnet, not a usable host address.');
  const old = c.net.ip;
  c.net = Object.assign({}, c.net, { mode: f.mode, red: f.red, dhcp: false, host, ip: f.ip.trim(), mask: f.mask.trim(), gw: f.gw.trim(), dns: f.dns.trim() });
  if (c.net.ip !== old) { c.auth = false; c.menu = false; c.tab = 'lost'; }
  say(netDone(T) ? 'ok' : 'warn', (c.net.ip !== old ? `Saved. The controller now answers on ${c.net.ip}, so this session on the old address has ended.` : 'Network settings saved.') + (netDone(T) ? '' : ' Warning: the saved values do not all match the work order.'));
});
Sim.on('cimcKvm', () => { if (!cimcOk()) return; const c = T.cimc; c.kvm = true; if (T.power === 'on') { c.kvmSeen = true; say('ok', 'KVM console open: the same screen as a monitor plugged into the server, over the management network.'); } else say('warn', 'KVM console open, but there is no video signal: the host is powered off.'); });
Sim.on('cimcKvmClose', () => { Object.assign(T.cimc, { kvm: false, kvmMenu: null, vmDlg: false }); if (T.os) T.os.dlg = null; });
// Chassis, Inventory tabs: what Cisco IMC reads about the memory is what was installed
Sim.on('cimcInvTab', k => {
  if (!cimcOk()) return; const c = T.cimc; c.invTab = k;
  if (k === 'psu') return cimcPsuSeen('inventory');
  if (T.power !== 'on' || !T.post) return say('info', 'The host is off: Cisco IMC has no fresh inventory. Power it on, then Refresh.');
  if (k === 'cpu') return say('info', `Inventory, CPUs: ${[0, 1].filter(i => cpuIn(T, i)).length} installed.`);
  const m = memSummary(T); T.flags.cimcMemSeen = true;
  const kinds = CATALOG.dimms.map(d => [d, Object.values(T.dimms).filter(x => x.id === d.id).length]).filter(([, n]) => n).map(([d, n]) => `${n} x ${d.pid}`).join(', ');
  say('ok', `Inventory, Memory: ${m.count} DIMM${m.count === 1 ? '' : 's'} (${kinds || 'none'}), ${m.total} GB at ${m.speed} MHz. Cisco IMC reads exactly what you installed.`);
});
Sim.on('cimcPower', () => { if (!cimcOk()) return; if (T.power === 'on') Sim.actions.shutdown(); else Sim.actions.powerOn(); });
Sim.on('cimcLocator', () => { if (!cimcOk()) return; Sim.actions.locator(); });

/* ---- Cisco IMC: Chassis, Inventory (Power Supplies tab) and Chassis, Faults and Logs, for the power supplies ---- */
// load on the supplies: they share it; one working supply carries all of it (watts, simulated)
function psuWatts(t, i) { const n = [0, 1].filter(k => psuGood(t, k)).length, out = psuGood(t, i) ? Math.round((t.power === 'on' ? 372 : 26) / n) : 0; return { out, in: out ? Math.round(out / 0.94) : 0 }; }
// Chassis, Inventory: the CPUs, Memory and Power Supplies tabs are simulated; CPUs and Memory are read during POST
function cimcInventory(t, b) {
  const tab = t.cimc.invTab || 'psu', tabs = [['CPUs', 'cpu'], ['Memory', 'mem'], ['Power Supplies', 'psu'], ['Cable Management'], ['PCIe Adapters'], ['Network Adapters'], ['Storage'], ['TPM']];
  const h = `<div class="tabs">${tabs.map(([x, k]) => k ? b(x, 'cimcInvTab', k, k === tab ? 'on' : '') : b(x, 'cimcMisc', x)).join('')}</div>`;
  if (tab === 'psu') return h + cimcPsuInventory(t, b);
  if (t.power !== 'on' || !t.post) return h + `<h4 style="margin-top:0">${tab === 'mem' ? 'Memory' : 'CPUs'}</h4><p style="color:#555">The host is powered off. Cisco IMC reads the ${tab === 'mem' ? 'memory' : 'processor'} inventory from the BIOS during the power-on self-test: power the host on (Host Power), then click Refresh.</p>`;
  if (tab === 'cpu') {
    const rows = [0, 1].map(i => { const c = t.cpu[i], m = c.model && byId('cpus', c.model); return `<tr><td>CPU${i + 1}</td><td>${cpuIn(t, i) ? `<span class="ok">&#10003; Enabled</span>` : 'Not Present'}</td><td>${cpuIn(t, i) ? m.name : 'N/A'}</td><td>${cpuIn(t, i) ? m.cores : 'N/A'}</td><td>${cpuIn(t, i) ? m.ghz * 1000 + ' MHz' : 'N/A'}</td><td>${cpuIn(t, i) ? m.pid : 'N/A'}</td></tr>`; }).join('');
    return h + `<h4 style="margin-top:0">CPUs</h4><table><tr><th>Socket</th><th>Status</th><th>Version</th><th>Cores</th><th>Speed</th><th>Product ID</th></tr>${rows}</table>`;
  }
  const m = memSummary(t), ids = Object.keys(t.dimms), bad = ids.filter(s2 => t.dimms[s2].fault), ign = ids.filter(s2 => !cpuIn(t, slotCpu(s2)));
  const mb = gb => (gb * 1024).toLocaleString('en-US'), used = ids.filter(s2 => !t.dimms[s2].fault && !ign.includes(s2));
  const tot = used.reduce((a, s2) => a + dimmOf(t, s2).cap, 0), failed = bad.reduce((a, s2) => a + dimmOf(t, s2).cap, 0), ignored = ign.reduce((a, s2) => a + dimmOf(t, s2).cap, 0);
  const kv = [['Memory Speed:', `${m.speed} MHz`], ['Total Memory:', `${mb(tot + failed)} MB`], ['Effective Memory:', `${mb(tot)} MB`], ['Redundant Memory:', '0 MB'], ['Failed Memory:', `${mb(failed)} MB`], ['Ignored Memory:', `${mb(ignored)} MB`], ['Number of Ignored DIMMs:', ign.length], ['Number of Failed DIMMs:', bad.length], ['Memory RAS possible:', 'Memory configuration can support mirroring'], ['Memory Configuration:', 'Maximum Performance']];
  let x = h + `<h4 style="margin-top:0">Memory Summary</h4><div class="kv">${kv.map(([k, v]) => `<span>${k}</span><span>${v}</span>`).join('')}</div><h4>Memory Details</h4><table style="font-size:12.5px"><tr><th>Name</th><th>Capacity</th><th>Speed (MHz)</th><th>Type</th><th>Memory Type Detail</th><th>Operability</th><th>Product ID</th></tr>`;
  const none = [];
  [0, 1].forEach(c => PROFILE.channels[c].forEach(ch => [1, 2, 3].forEach(n => {
    const s2 = ch + n, d = t.dimms[s2];
    if (!d) { none.push(s2); return; }
    const k = byId('dimms', d.id), ig = ign.includes(s2);
    x += `<tr><td style="white-space:nowrap"><b>DIMM_${s2}</b></td><td style="white-space:nowrap">${mb(k.cap)} MB</td><td>${ig ? 'N/A' : m.speed}</td><td>DDR4 ${k.type}</td><td>${k.detail.replace('Synchronous ', '')}</td><td style="white-space:nowrap">${d.fault ? '<span class="bad">&#9888; Inoperable</span>' : ig ? '<span class="warnc">Not used (no CPU 2)</span>' : '<span class="ok">&#10003; Operable</span>'}</td><td style="white-space:nowrap;font-family:var(--mono);font-size:11.5px">${k.pid}</td></tr>`;
  })));
  if (none.length) x += `<tr style="color:#8A939B"><td colspan="7">Not Installed (${none.length}): ${none.map(s2 => 'DIMM_' + s2).join(', ')}</td></tr>`;
  return x + `</table><p style="margin:10px 0 0;color:#555;font-size:13px">${used.length} of 24 sockets in use. Read from the BIOS at the last power-on self-test.</p>`;
}
function cimcPsuInventory(t, b) {
  let h = `<h4 style="margin-top:0">Power Supplies</h4>`;
  h += `<table><tr><th>Device ID</th><th>Status</th><th>Input</th><th>Output</th><th>FW Version</th><th>Product ID</th></tr>`;
  [0, 1].forEach(i => {
    const p = t.psu[i], w = psuWatts(t, i), present = p.st === 'in';
    const st = !present ? '<span class="warnc">Not Present</span>' : p.fault ? '<span class="bad">&#9888; Present, Failed</span>' : !t.cables[psuKey(i)] ? '<span class="warnc">&#9888; Present, No AC Input</span>' : '<span class="ok">&#10003; Present</span>';
    h += `<tr><td>PSU${i + 1}</td><td>${st}</td><td>${present ? w.in + ' Watts' : 'N/A'}</td><td>${present ? w.out + ' Watts' : 'N/A'}</td><td>${present ? 'simulated' : 'N/A'}</td><td>${present ? PSU_PID : 'N/A'}</td></tr>`;
  });
  h += `</table><p style="margin:10px 0 0;color:#555;font-size:13px">Power supplies are redundant as 1+1: one working supply can carry the whole server. Rating: 1200 W at 200 to 240 V, 800 W at 100 to 120 V.</p>`;
  return h;
}
function cimcFaults(t, b) {
  const tabs = ['Fault Summary', 'Fault History', 'System Event Log', 'Cisco IMC Log', 'Logging Controls'], fmt = ms => new Date(ms).toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  let h = `<div class="tabs">${tabs.map(x => x === 'Fault Summary' ? b(x, 'cimcMisc', 'tab', 'on') : b(x, 'cimcMisc', x)).join('')}</div><h4 style="margin-top:0">Fault Summary</h4>`;
  const rows = psuBoth(t) ? [] : [['Major', 'F0743', 'PSU-REDUNDANCY-FAIL', 'Power Supply redundancy is lost : Reseat or replace Power Supply']];
  h += `<table><tr><th>Time</th><th>Severity</th><th>Code</th><th>Probable Cause</th><th>Description</th></tr>${rows.length ? rows.map(([sv, code, cause, d]) => `<tr><td>${fmt(t.psuFaultAt || Date.now())}</td><td><span class="bad">&#9888; ${sv}</span></td><td>${code}</td><td>${cause}</td><td>${d}</td></tr>`).join('') : '<tr><td colspan="5">No active faults for the power supplies.</td></tr>'}</table>`;
  const ev = (t.psuEv || []).slice().reverse();
  h += `<h4>System Event Log: latest power supply entries</h4><table><tr><th>Time</th><th>Severity</th><th>Description</th></tr>${ev.length ? ev.map(e => `<tr><td>${fmt(e.at)}</td><td>${e.sev === 'Normal' ? '<span class="ok">Normal</span>' : `<span class="bad">${e.sev}</span>`}</td><td>${esc(e.txt)}</td></tr>`).join('') : '<tr><td colspan="3">No power supply events.</td></tr>'}</table>`;
  h += `<p style="margin:10px 0 0;color:#555;font-size:13px">Training view: only power supply faults and events are simulated on this page.</p>`;
  return h;
}
function cimcPsuSeen(page, refresh) {
  const pi = psuIssue(T);
  if (page === 'faults') {
    if (pi && pi.crit) T.flags.psuFaultSeen = true;
    if (psuBoth(T) && T.flags.psuSpareUsed) T.flags.psuVerified = true;
    say(psuBoth(T) ? 'ok' : 'info', psuBoth(T) ? `${refresh ? 'Refreshed. ' : ''}No active power supply fault: redundancy is restored.` : `${refresh ? 'Refreshed. ' : ''}Fault Summary: power supply redundancy is lost. The System Event Log below names the supply.`);
  } else {
    if (pi && pi.crit) T.flags.psuInvSeen = true;
    say('info', `${refresh ? 'Refreshed. ' : ''}Inventory, Power Supplies: ${[0, 1].map(i => `PSU${i + 1} ${T.psu[i].st !== 'in' ? 'not present' : T.psu[i].fault ? 'failed' : psuGood(T, i) ? 'present, ' + psuWatts(T, i).out + ' W out' : 'present, no AC input'}`).join('; ')}.`);
  }
}
// the verify task in the side panel: framed, so it stands out with guidance off
(() => {
  if (document.getElementById('cis-cimc-css')) return;
  const s = document.createElement('style'); s.id = 'cis-cimc-css';
  s.textContent = `.cverify{margin:12px 0 0;max-width:640px;padding:10px 14px;border:3px solid var(--led);border-radius:10px;background:var(--panel);color:var(--ink)}
.cverify.done{border-color:var(--touch)}.cverify h3{margin:0 0 4px}.cverify p{margin:0 0 6px;font-size:13px}
.cverify button{font-weight:700}.cverify .okv{color:var(--touch);font-weight:700;margin:8px 0 0}`;
  Sim.addCss(s);
})();
