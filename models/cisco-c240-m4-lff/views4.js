/* ---- Local console: VGA monitor and USB keyboard on the rear panel, power-on self-test and the Cisco IMC Configuration Utility (F8).
   Screens follow the trainer's setup video; timings are shortened. Photos: the trainer's rear-panel photos, cleaned. ---- */
const POSTT = { nosig: 1.5, mem: 4.5, plat: 7, win: 32, sas: 3.5, enter: 3, save: 2.5, exit: 2, cfg: 4 };
const CPUFULL = { e2680: 'Intel(R) Xeon(R) CPU E5-2680 v4 @ 2.40GHz', e2640: 'Intel(R) Xeon(R) CPU E5-2640 v4 @ 2.40GHz', g6248: 'Intel(R) Xeon(R) Gold 6248 CPU @ 2.50GHz', g6254: 'Intel(R) Xeon(R) Gold 6254 CPU @ 3.10GHz', s4210: 'Intel(R) Xeon(R) Silver 4210 CPU @ 2.20GHz' };
function newCon() { return { mode: 'off', t: 0, f8: false, boots: 0, page: 1, sel: 0, form: {}, cfgT: 0, configured: false, snap: '', saved: false, entered: false, sawIp: false, msg: '' }; }
function conPhase(t) {
  const c = t.con; if (!c || t.power !== 'on' || c.mode === 'off') return 'off';
  const e = (Date.now() - c.t) / 1000;
  switch (c.mode) {
    case 'post': return e < POSTT.nosig ? 'nosig' : e < POSTT.mem ? 'mem' : e < POSTT.plat ? 'plat' : 'logo';
    case 'enter': return e < POSTT.enter ? 'entering' : 'sas';
    case 'after': return 'sas';
    case 'f8': return 'f8';
    case 'save': return 'saving';
    case 'exit': return 'leaving';
    case 'bmenu': return 'bmenu';
    default: return 'final';
  }
}
function startPost(t) { const c = t.con; Object.assign(c, { mode: 'post', t: Date.now(), f8: false, f6: false, osb: null, bsel: 0, boots: c.boots + 1, msg: '' }); if (t.os) OSI.reset(t); }
// POST is over: the boot menu if F6 was pressed, else the firmware boots (the OS module decides what, in an OS lab)
function osHand(t) { const c = t.con; if (c.f6) { c.mode = 'bmenu'; c.bsel = 0; return; } if (t.os) c.osb = OSI.boot(t); }
function conTick(t) {
  const c = t.con; if (!c) return;
  if (t.power !== 'on') { c.mode = 'off'; if (t.os) OSI.down(t); return; }
  const e = (Date.now() - c.t) / 1000;
  if (c.mode === 'post' && e >= POSTT.win) Object.assign(c, { mode: 'after', t: Date.now() });
  else if (c.mode === 'enter' && e >= POSTT.enter + POSTT.sas) Object.assign(c, { mode: 'f8', entered: true, page: 1, sel: 0, form: f8Form(t), cfgT: 0, configured: false, snap: '', msg: '' });
  else if (c.mode === 'save' && e >= POSTT.save) { startPost(t); Sim.sound('fans'); }        // the reboot after F10: the fans rush again
  else if ((c.mode === 'after' && e >= POSTT.sas) || (c.mode === 'exit' && e >= POSTT.exit)) { c.mode = 'done'; osHand(t); }
  if (c.cfgT && !c.configured && (Date.now() - c.cfgT) / 1000 >= POSTT.cfg) c.configured = true;
  if (c.saved && conPhase(t) === 'logo' && t.cimc.net.ip !== '0.0.0.0') c.sawIp = true;
}
const conKey = t => [conPhase(t), t.con.page, t.con.configured, !!t.con.cfgT, t.con.sawIp, t.power, t.con.bsel, t.con.osb, t.os ? OSI.sig(t) : '', t.cimc.kvmMenu, t.cimc.vmDlg, t.cimc.kvm].join('|');

/* F8 utility model: items in Up/Down order, per page */
const F8I = {
  1: [{ k: 'mode', v: 'Dedicated', l: 'Dedicated:' }, { k: 'mode', v: 'Shared LOM', l: 'Shared LOM:' }, { k: 'mode', v: 'Riser1', l: 'Riser1:' }, { k: 'mode', v: 'Riser2', l: 'Riser2:' }, { k: 'mode', v: 'MLom', l: 'MLom:' }, { k: 'mode', v: 'Shared LOM EXT', l: 'Shared LOM Ext:' },
    { k: 'ipv4', b: 1, l: 'IPV4:' }, { k: 'ipv6', b: 1, l: 'IPV6:' }, { k: 'dhcp', b: 1, l: 'DHCP enabled' }, { k: 'ip', l: 'CIMC IP:' }, { k: 'mask', l: 'Prefix/Subnet:' }, { k: 'gw', l: 'Gateway:' }, { k: 'dns', l: 'Pref DNS Server:' },
    { k: 'red', v: 'None', l: 'None:' }, { k: 'red', v: 'Active-standby', l: 'Active-standby:' }, { k: 'red', v: 'Active-active', l: 'Active-active:' }, { k: 'vlan', b: 1, l: 'VLAN enabled:' }, { k: 'vlanId', l: 'VLAN ID:' }, { k: 'prio', l: 'Priority:' }],
  2: [{ k: 'host', l: 'Hostname:' }, { k: 'ddns', b: 1, l: 'Dynamic DNS:' }, { k: 'ddnsDom', l: 'DDNS Domain:' }, { k: 'factory', b: 1, l: 'Factory Default:' }, { k: 'pw', p: 1, l: 'Default password:' }, { k: 'pw2', p: 1, l: 'Reenter password:' }, { k: 'autoneg', b: 1, l: 'Auto Negotiation:' }, { k: 'ppReset', b: 1, l: 'Reset:' }, { k: 'ppName', l: 'Name:' }]
};
const F8L = {
  1: [[{ h: 'NIC Properties' }], [{ h: ' NIC mode' }, { h: 'NIC redundancy' }], [{ i: 0 }, { i: 13 }], [{ i: 1 }, { i: 14 }], [{ h: '  Cisco Card:' }, { i: 15 }], [{ i: 2, n: 2 }, { h: 'VLAN (Advanced)' }], [{ i: 3, n: 2 }, { i: 16 }], [{ i: 4, n: 2 }, { i: 17 }], [{ i: 5 }, { i: 18 }],
    [{ h: 'IP (Basic)' }], [{ i: 6 }, { i: 7 }], [{ i: 8 }], [{ i: 9 }], [{ i: 10 }], [{ i: 11 }], [{ i: 12 }]],
  2: [[{ h: 'Common Properties' }], [{ i: 0 }], [{ i: 1 }], [{ i: 2 }], [{ h: 'FactoryDefaults' }], [{ i: 3 }], [{ h: 'Default User(Basic)' }], [{ i: 4 }], [{ i: 5 }], [{ h: 'Port Properties' }], [{ i: 6 }],
    [{ s: '                         Admin Mode    Operation Mode' }], [{ s: ' Speed[1000/100/10Mbps]:  Auto          1000' }], [{ s: ' Duplex mode[half/full]:  Auto          full' }], [{ h: 'Port Profiles' }], [{ i: 7 }], [{ i: 8 }]]
};
const f8Idx = (page, k, v) => F8I[page].findIndex(it => it.k === k && (v === undefined || it.v === v));
function f8Form(t) {
  const n = t.cimc.net;
  return { mode: n.mode === 'Cisco Card' ? n.card : n.mode, red: n.red, ipv4: n.ipv4 !== false, ipv6: !!n.ipv6, dhcp: n.dhcp, ip: n.ip, mask: n.mask, gw: n.gw, dns: n.dns, vlan: !!n.vlan, vlanId: n.vlanId || '1', prio: n.prio || '0',
    host: n.host, ddns: n.ddns !== false, ddnsDom: n.ddnsDom || '', factory: false, pw: '', pw2: '', autoneg: true, ppReset: false, ppName: '' };
}
const f8Snap = f => JSON.stringify(f);
function f8Check(f) {
  const card = ['Riser1', 'Riser2', 'MLom'].includes(f.mode);
  if (f.mode === 'Dedicated' && f.red !== 'None') return 'Dedicated NIC mode works only with NIC redundancy None.';
  if (f.mode === 'Shared LOM EXT' && f.red !== 'Active-active') return 'Shared LOM Ext mode works only with NIC redundancy Active-active.';
  if ((card || f.mode === 'Shared LOM') && f.red === 'None') return 'NIC redundancy None is valid only with Dedicated mode.';
  if (!f.ipv4 && !f.ipv6) return 'Enable IPV4: with both IPv4 and IPv6 off, the controller has no address.';
  if (f.factory) return 'Factory Default is ticked: saving would reset Cisco IMC to factory settings. Untick it.';
  if (f.ipv4 && !f.dhcp) {
    const ip = ipNum(f.ip), mask = ipNum(f.mask), gw = ipNum(f.gw);
    if (ip === null || ip === 0) return 'CIMC IP is not a valid IPv4 address.';
    if (!maskOk(mask)) return 'Prefix/Subnet is not a valid subnet mask. For a /24 network it is 255.255.255.0.';
    if (gw === null) return 'Gateway is not a valid IPv4 address.';
    if (gw !== 0 && ((ip & mask) >>> 0) !== ((gw & mask) >>> 0)) return 'The gateway is not in the same subnet as the CIMC IP.';
    if (ip === gw) return 'The CIMC IP and the gateway are the same address.';
    const hb = (ip & ~mask) >>> 0; if (hb === 0 || hb === ((~mask) >>> 0)) return 'That CIMC IP is the network or broadcast address of the subnet.';
    if (ipNum(f.dns) === null) return 'Pref DNS Server is not a valid IPv4 address (use 0.0.0.0 for none).';
  }
  if (!/^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test((f.host || '').trim())) return 'Hostname: letters, digits and hyphens only.';
  if ((f.pw || f.pw2) && f.pw !== f.pw2) return 'The two default passwords do not match. Type the same password in both fields.';
  return '';
}
function f8Apply(t) {
  const f = t.con.form, c = t.cimc, card = ['Riser1', 'Riser2', 'MLom'].includes(f.mode), old = c.net.ip;
  c.net = Object.assign({}, c.net, { mode: card ? 'Cisco Card' : f.mode, card: card ? f.mode : c.net.card, red: f.red, ipv4: f.ipv4, ipv6: f.ipv6, dhcp: f.dhcp,
    ip: f.dhcp ? '0.0.0.0' : f.ip.trim(), mask: f.dhcp ? '0.0.0.0' : f.mask.trim(), gw: f.dhcp ? '0.0.0.0' : f.gw.trim(), dns: f.dhcp ? '0.0.0.0' : f.dns.trim(),
    vlan: f.vlan, vlanId: f.vlanId, prio: f.prio, host: f.host.trim(), ddns: f.ddns, ddnsDom: f.ddnsDom });
  if (f.pw) { c.pw = f.pw; c.pwSrc = 'console'; }
  if (c.net.ip !== old && c.auth) { c.auth = false; c.tab = 'lost'; }
}

/* screens */
const scr = (cls, s) => `<span class="${cls}">${esc(s)}</span>`;
function postLines(t, ph) {
  const c = t.con, m = memSummary(t), cpu = t.cpu.find(x => x.st === 'torqued'), ip = t.cimc.net.ip;
  if (ph === 'mem' || ph === 'plat') return [scr('cy', 'Cisco Systems, Inc.'), 'Configuring and testing memory..', ph === 'plat' ? 'Configuring platform hardware...' : ''];
  const L = ['', '', '', 'Press &lt;F2&gt; Setup, &lt;F6&gt; Boot Menu, &lt;F7&gt; Diagnostics, &lt;F8&gt;Cisco IMC Configuration,', '&lt;F12&gt; Network Boot', '',
    'Bios Version : C240M5.4.1.3 (training simulation)', 'Platform ID  : C240M5', ''];
  if (ip === '0.0.0.0') L.push('Error in getting the Cisco IMC IP');
  else L.push(`Cisco IMC IPv4 Address : ${scr('wh', ip)}`, `Cisco IMC MAC Address  : ${WO.mac}`);
  L.push(`Processor(s) ${cpu ? CPUFULL[cpu.model] || byId('cpus', cpu.model).name : 'not detected'}`, `Total Memory = ${m.total} GB Effective Memory = ${m.total} GB`, `Memory Operating Speed ${m.speed} Mhz`);
  if (ph === 'entering' || (ph === 'sas' && c.mode === 'enter')) { L.push(scr('wh', 'Entering CIMC Configuration Utility...')); if (c.boots === 1 && !t.flags.hasOS) L.push('Detected DIMM configuration change. Performing Platform Characterization ...'); }
  return L;
}
function sasLines(t) {
  const d = t.bays.map((b, i) => [b, i]).filter(([b]) => b.st === 'locked');
  return ['Avago Technologies MPT SAS3 BIOS', 'MPT3BIOS-8.31.02.00 (2016.10.27)', 'Copyright 2000-2016 Avago Technologies. All rights reserved', '', 'Initializing..', '',
    'SLOT ENCL SLOT LUN VENDOR   PRODUCT          PRODUCT   SIZE \\', ' NUM       NUM      NAME     IDENTIFIER       REVISION  NVDATA', '---- ---- ---- ---- -------- ---------------- --------- ----------',
    '   0           LSI      SAS3108          4.680.01  NV 2D:01',
    ...d.map(([b, i]) => `   0 ${String(i + 1).padStart(4)}    0 TRAIN    ${(byId('drives', b.drive).bus + '-' + byId('drives', b.drive).kind + '-' + (byId('drives', b.drive).cap >= 1000 ? byId('drives', b.drive).cap / 1000 + 'T' : byId('drives', b.drive).cap + 'G')).padEnd(16)} 0001      ${(byId('drives', b.drive).cap / 1099.5).toFixed(3)} TiB`),
    '', `${d.length} supportable devices of ${d.length + 1} are presented for system boot selection!`, 'Avago MPT3 boot ROM successfully installed!'];
}
function finalLines(t) {
  const has = t.os ? t.con.osb === 'old' : t.flags.hasOS;
  return has ? ['Rocky Linux 8.10 (Green Obsidian)', 'Kernel 4.18.0-553.el8_10.x86_64 on an x86_64', '', 'server01 login: _']
    : ['Reboot and Select proper Boot device', 'or Insert Boot Media in selected Boot device and press a key_'];
}
function hostScreenText(t) {
  const ph = conPhase(t);
  if (ph === 'off') return 'No signal.\n\nThe host is powered off. Cisco IMC still runs on standby power:\nclose this console and use Host Power, or press the front-panel power button.';
  if (ph === 'nosig') return 'No signal yet: the server is starting.';
  if (ph === 'f8') return 'The Cisco IMC Configuration Utility is open on the local console.\nUse the keyboard connected to the server.';
  if (ph === 'bmenu') return 'Please select boot device:';
  const L = ph === 'sas' ? sasLines(t) : ph === 'final' ? finalLines(t) : ph === 'saving' ? ['Saving settings. The server will now reboot...'] : ph === 'leaving' ? ['Exiting Cisco IMC Configuration Utility...'] : postLines(t, ph);
  return L.join('\n').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function f8Cell(t, cell) {
  if (!cell) return '<span class="c"></span>';
  if (cell.h) return `<span class="c">${scr('wh', cell.h)}</span>`;
  if (cell.s) return `<span class="c">${scr('cy', cell.s)}</span>`;
  const c = t.con, it = F8I[c.page][cell.i], f = c.form, sel = c.sel === cell.i, ind = ' '.repeat(cell.n || 1);
  let v;
  if (it.v) v = f[it.k] === it.v ? '[X]' : '[ ]';
  else if (it.b) v = f[it.k] ? '[X]' : '[ ]';
  else if (sel) {
    const ro = ['ip', 'mask', 'gw', 'dns'].includes(it.k) && f.dhcp;
    v = `<input class="f8in" type="${it.p ? 'password' : 'text'}" data-field="con:${it.k}" value="${esc(f[it.k] || '')}" autocomplete="off" spellcheck="false" aria-label="${esc(it.l.replace(':', ''))}"${ro ? ' readonly title="DHCP is enabled: untick DHCP enabled to type an address"' : ''}>`;
  } else v = it.p ? esc('*'.repeat((f[it.k] || '').length)) : esc(f[it.k] || '');
  const lab = (ind + it.l).padEnd(cell.r ? 17 : 20);
  return `<span class="c${sel ? ' sel' : ''}"${sel ? '' : ` data-act="conSel" data-arg="${cell.i}"`}>${scr('cy', lab)}<span class="v">${v}</span>${sel && !it.p && (it.v || it.b) ? '<span class="cur">_</span>' : ''}</span>`;
}
function f8Screen(t) {
  const c = t.con, P = F8L[c.page];
  let h = `<div class="f8"><div>${scr('yl', 'Cisco IMC Configuration Utility Version 2.0  Cisco Systems, Inc.')}</div><div class="rule"></div>`;
  P.forEach(line => { const [a, b] = line; if (b) b.r = 1; h += `<div class="ln">${f8Cell(t, a)}${f8Cell(t, b)}</div>`; });
  const st = c.msg ? scr('er', c.msg) : c.cfgT && !c.configured ? scr('wh', 'Configuring network settings... please wait') : c.configured && c.snap === f8Snap(c.form) ? scr('wh', 'Network settings configured') : '';
  h += `<div class="ln stat">${st || '&nbsp;'}</div><div class="rule"></div><div class="keys">${scr('yl', '<Up/Down>Selection   <F10>Save   <Space>Enable/Disable   <F5>Refresh   <ESC>Exit')}</div>`;
  h += `<div class="keys">${scr('yl', c.page === 1 ? '<F1>Additional settings' : '<F2>PreviousPageettings')}</div></div>`;
  return h;
}
function monitor(t) {
  const ph = t.crash.vga ? conPhase(t) : 'unplugged';
  let body;
  if (ph === 'unplugged' || ph === 'off' || ph === 'nosig') body = `<div class="osd"><b>VGA</b><br>No Signal!<br>${ph === 'unplugged' ? 'Check the cable connection.' : 'Entering the power saving mode shortly.'}</div>`;
  else if (ph === 'f8') body = f8Screen(t);
  else if (ph === 'bmenu' || osScreenOn(t)) body = null;
  else {
    const L = ph === 'sas' ? sasLines(t) : ph === 'final' ? finalLines(t) : ph === 'saving' ? [scr('wh', 'Saving settings. The server will now reboot...')] : ph === 'leaving' ? ['Exiting Cisco IMC Configuration Utility...'] : postLines(t, ph);
    body = `<div class="post${ph === 'logo' || ph === 'entering' ? ' logo' : ''}">${L.map(l => `<div>${l || '&nbsp;'}</div>`).join('')}</div>`;
  }
  const keys = [['Esc', 'Esc'], ['F1', 'F1'], ['F2', 'F2'], ['F5', 'F5'], ['F8', 'F8'], ['F10', 'F10'], ['Up', '&uarr;'], ['Down', '&darr;'], ['Space', 'Space'], ['Enter', 'Enter'], ['CtrlAltDel', 'Ctrl+Alt+Del']];
  const scrH = body === null ? `<div class="scr osfit" tabindex="0">${kvmScreen(t)}</div>` : `<div class="scr" tabindex="0">${body}</div>`;
  return `<div class="mon cueable" role="region" aria-label="Monitor connected to the server">${scrH}<div class="brand">VGA monitor</div></div>
    <div class="kbar cueable" role="group" aria-label="Keyboard connected to the server"><span>${t.crash.kbd ? 'USB keyboard:' : 'Keyboard not connected'}</span>${keys.map(([k, l]) => `<button class="kb" data-act="key" data-arg="${k}">${l}</button>`).join('')}</div>`;
}

/* rear panel: the cleaned wide photo of the user's server */
const RZW = { usb: [299, 176, 36, 36], vga: [561, 176, 82, 52], mgmt: [340, 180, 37, 26], ser: [381, 180, 33, 26], lan1: [420, 180, 34, 26], lan2: [457, 180, 35, 26], vic2: [522, 101, 30, 20], vic1: [555, 101, 31, 20] };
const PORTINFO = { mgmt: 'That is M, the 1 Gb Ethernet dedicated management port. It goes to the management switch, not to the monitor or keyboard.', ser: 'That is the RJ-45 serial port (marked IOIO). The monitor needs the VGA video port (DB-15).', lan1: 'That is LAN 1, an onboard 1 Gb Ethernet port (RJ-45). In this build the data network uses the VIC\'s 10 Gb ports instead.', lan2: 'That is LAN 2, an onboard 1 Gb Ethernet port (RJ-45). In this build the data network uses the VIC\'s 10 Gb ports instead.', vic1: 'That is PORT 1 of the Cisco VIC 1225 in riser 2 (PCIe 5): a 10 Gb SFP+ data port. It goes to a data switch, not to the monitor or keyboard.', vic2: 'That is PORT 2 of the Cisco VIC 1225 in riser 2 (PCIe 5): a 10 Gb SFP+ data port. It goes to the other data switch.' };
function rearSvg(t) {
  const v = t.crash.vga, k = t.crash.kbd, zr = (act, arg, label, [x, y, w, h]) => `<g${hot(act, arg, label)}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" class="zone"/></g>`;
  let g = `<image href="${v ? IMG.rearWideOn : IMG.rearWideOff}" x="0" y="44" width="900" height="219"/>`;
  if (k) g += `<rect x="301" y="181" width="32" height="14" rx="2" fill="#15181C" stroke="#3A4048"/><path d="M317 195V250" stroke="#15181C" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  ['mgmt', 'ser', 'lan1', 'lan2', 'vic1', 'vic2'].forEach(p => { g += zr('portInfo', p, PORTINFO[p], RZW[p]); });
  g += zr('crashKbd', '', k ? 'Unplug the USB keyboard' : 'USB 3.0 ports', RZW.usb) + zr('crashVga', '', v ? 'Unplug the monitor cable' : 'VGA port', RZW.vga);
  g += chip(318, 170, 'USB') + chip(602, 170, 'VGA');
  return frame('Rear panel', g, 270);
}
Sim.registerView({
  id: 'console', title: 'Console setup (F8)',
  keep: [
    ["What you need", "A VGA monitor and a USB keyboard on the rear panel. The Console connector on the front right ear takes a KVM cable that gives VGA, USB and serial at the front."],
    ["Watch for the F8 prompt", "The F8 option shows only for a few seconds while the server boots. If you miss it, let the boot finish, restart, and watch again."],
    ["Mode first, then address", "On page 1, set NIC mode and NIC redundancy first, untick DHCP, and only then type the IP address, prefix and gateway."],
    ["Password on page 2", "Page 2 sets the admin password. Use a strong password and record it in the password vault, not on paper at the rack."],
    ["Save before you leave", "Nothing changes until F10 saves the settings and the server reboots. Esc leaves without saving."],
    ["Check the boot screen", "After the reboot, the boot screen shows the new Cisco IMC address. Check it against the work order, then test it from a browser."],
    ["Tidy up", "Unplug the monitor and keyboard when you are done and return the crash cart, so nothing stays plugged in at the rear."],
    ["Training deck", "Slides 100 to 104: local and virtual consoles, out-of-band management."]],
  render(t) {
    const both = t.crash.vga && t.crash.kbd;
    return rearSvg(t) + (both || t.crash.vga ? monitor(t) : `<div class="monoff">Monitor and keyboard are not connected yet. Plug them into the rear panel above.</div>${t.crash.kbd ? '' : ''}`);
  },
  after(t) {
    if (Sim.view !== 'console') return;
    const inp = document.querySelector('#stage input.f8in');
    if (inp) { inp.focus({ preventScroll: true }); const n = inp.value.length; try { inp.setSelectionRange(n, n); } catch (e) { /* password inputs */ } }
    else if (conPhase(t) === 'f8') { const s = document.querySelector('#stage .scr'); if (s) s.focus({ preventScroll: true }); }
  },
  actions(t) {
    return [t.power === 'on' ? button('Press front power button (shut down)', 'shutdown') : button('Press front power button', 'powerOn'), button(t.crash.vga ? 'Unplug monitor' : 'Plug in monitor (VGA)', 'crashVga'), button(t.crash.kbd ? 'Unplug keyboard' : 'Plug in USB keyboard', 'crashKbd')];
  },
  tray(t) {
    return `<h2>Work order: management setup</h2><table class="dec"><tr><td>NIC mode</td><td>Dedicated</td></tr><tr><td>NIC redundancy</td><td>None</td></tr><tr><td>DHCP</td><td>Disabled</td></tr><tr><td>CIMC IP</td><td>${WO.ip}</td></tr><tr><td>Prefix/Subnet</td><td>${WO.mask} (/24)</td></tr><tr><td>Gateway</td><td>${WO.gw}</td></tr><tr><td>User name</td><td>${WO.user}</td></tr><tr><td>Password</td><td>${WO.pw}</td></tr></table>
      <h3>Procedure</h3><ol class="rules" style="padding-left:20px"><li>Power cords in: the power LED is amber (standby)</li><li>Plug a VGA monitor and a USB keyboard into the rear panel</li><li>Press the front power button (Cisco's guide says press and hold it for four seconds)</li><li>When the screen offers &lt;F8&gt;Cisco IMC Configuration, press F8</li><li>Page 1: NIC mode, NIC redundancy, untick DHCP, then CIMC IP, Prefix/Subnet and Gateway</li><li>F1 for page 2: type the default (admin) password twice</li><li>F5, then wait for "Network settings configured" (about 45 seconds on a real server)</li><li>F10 saves and reboots</li><li>Check the new IP on the boot screen, then unplug the monitor and keyboard</li><li>Check the result from a browser (Management view)</li></ol>
      <h3>Keys</h3><ul class="rules"><li>Up and Down, or Tab and Shift+Tab, move between fields; Space ticks a box</li><li>In a text field, type the value directly</li><li>F1 and F2 switch pages; Esc leaves without saving</li><li>Your own keyboard works while this view is open. On a touch screen, use the keys below the monitor</li></ul>
      <h3>About these screens</h3><p class="cap" style="font-size:13px">The boot and utility screens are rebuilt from your video; timings are shortened. The rear photo is yours, cleaned: background removed, straightened, empty slots darkened. In the unplugged view the VGA port is drawn in, and the keyboard plug is drawn.</p>`;
  }
});
(() => { const i = Sim.order.indexOf('console'), j = Sim.order.indexOf('cimc'); if (i > -1 && j > -1 && i > j) { Sim.order.splice(i, 1); Sim.order.splice(j, 0, 'console'); } })();

Sim.on('crashVga', () => { T.crash.vga = !T.crash.vga; say('ok', T.crash.vga ? 'Monitor cable plugged into the VGA port and both thumbscrews tightened.' : 'Monitor cable unplugged from the VGA port.'); });
Sim.on('crashKbd', () => { T.crash.kbd = !T.crash.kbd; say('ok', T.crash.kbd ? 'USB keyboard plugged into the upper USB 3.0 port.' : 'USB keyboard unplugged.'); });
Sim.on('portInfo', p => say('info', PORTINFO[p]));
Sim.on('conSel', i => {
  const c = T.con; if (conPhase(T) !== 'f8') return;
  c.sel = +i; const it = F8I[c.page][c.sel];
  say('info', it.v || it.b ? `${it.l.replace(':', '')} selected. Press Space to change it. (The real utility has no mouse: Up and Down move the cursor.)` : `${it.l.replace(':', '')} selected. Type the value.`);
});
Sim.on('key', k => {
  if (!T.crash.kbd) return say('warn', 'Nothing happens: no keyboard is connected to the server. Plug the USB keyboard into a rear USB port.');
  keyIn(k);
});
// a key at the server: from the USB keyboard, or through the KVM console (kvm); 'boot:<id>' is a click in the boot menu
function keyIn(k, kvm) {
  const c = T.con;
  if (T.power !== 'on') return say('info', kvm ? 'No video: the host is off. Power it on from the KVM Power menu.' : 'The server is off (standby power only). Press the front power button first.');
  const ph = conPhase(T);
  if (ph === 'bmenu') {
    const L = [...(T.os ? OSI.bootList(T) : T.flags.hasOS ? [{ id: 'disk' }] : []), { id: 'shell' }, { id: 'setup' }];
    if (k === 'Up' || k === 'Down') { c.bsel = Math.max(0, Math.min(L.length - 1, (c.bsel || 0) + (k === 'Up' ? -1 : 1))); return; }
    const id = k.startsWith('boot:') ? k.slice(5) : k === 'Enter' ? L[c.bsel || 0].id : k === 'Esc' ? '' : null;
    if (id === null) return;
    if (id === 'shell' || id === 'setup') return say('info', id === 'shell' ? 'The UEFI Shell: not needed here.' : 'Setup (F2) changes BIOS settings: not needed here.');
    c.mode = 'done'; c.f6 = false;
    if (T.os) { if (id) OSI.pickBoot(T, id); c.osb = OSI.boot(T); }
    return say(id ? 'ok' : 'info', id ? `Booting ${id === 'cd' ? 'the image on the virtual CD (Cisco vKVM-Mapped vDVD)' : 'the installed system'}.` : 'Esc: the server boots from its boot order.');
  }
  if (k.startsWith('boot:')) return;
  if (ph === 'final' && T.os && c.osb === 'osi' && k !== 'CtrlAltDel') return OSI.key(T, k);
  if (k === 'F6') {
    if (ph === 'logo') { c.f6 = true; if (T.os) T.os.m.f11 = true; return say('ok', 'F6 pressed: "Entering boot selection menu...". The menu opens when POST is over.'); }
    if (['nosig', 'mem', 'plat'].includes(ph)) return say('info', 'Too early. Wait until the screen offers <F6> Boot Menu.');
    return say('warn', 'Too late: the F6 prompt has passed. Restart the server (Power, Reset System), then press F6 at the prompt.');
  }
  if (k === 'CtrlAltDel') { startPost(T); Sim.sound('fans'); return say('info', 'Ctrl+Alt+Del: the server restarts and runs the power-on self-test again.' + (ph === 'f8' ? ' Unsaved settings were discarded.' : '')); }
  if (ph === 'f8') return f8Key(k);
  if (k === 'F8') {
    if (ph === 'logo') { Object.assign(c, { mode: 'enter', t: Date.now(), f8: true }); return say('ok', 'F8 pressed: "Entering CIMC Configuration Utility...". It opens after the storage controller finishes starting.'); }
    if (['nosig', 'mem', 'plat'].includes(ph)) return say('info', 'Too early. Wait until the screen offers <F8>Cisco IMC Configuration.');
    if (c.mode === 'enter') return say('info', 'F8 was already pressed. Wait for the utility to open.');
    return say('warn', 'Too late: the F8 prompt has passed. Press Ctrl+Alt+Del to restart the server, then press F8 at the prompt.');
  }
  say('info', 'That key does nothing on this screen.');
}
function f8Key(k) {
  const c = T.con, items = F8I[c.page], it = items[c.sel], f = c.form;
  c.msg = '';
  if (k === 'Up') { c.sel = (c.sel - 1 + items.length) % items.length; return; }
  if (k === 'Down' || k === 'Enter') { c.sel = (c.sel + 1) % items.length; return; }
  if (k === 'Space') {
    if (it.v) { f[it.k] = it.v; return say('info', `${it.k === 'mode' ? 'NIC mode' : 'NIC redundancy'}: ${it.v}.`); }
    if (it.b) { f[it.k] = !f[it.k]; return say(it.k === 'factory' && f.factory ? 'warn' : 'info', it.k === 'factory' && f.factory ? 'Factory Default ticked: saving now would reset Cisco IMC to factory settings.' : `${it.l.replace(':', '')}: ${f[it.k] ? 'enabled' : 'disabled'}.`); }
    return say('info', 'Space ticks check boxes. In this field, type the value.');
  }
  if (k === 'F1') { if (c.page === 1) { c.page = 2; c.sel = 0; } return; }
  if (k === 'F2') { if (c.page === 2) { c.page = 1; c.sel = 0; } return; }
  if (k === 'F5') {
    const err = f8Check(f); if (err) { c.msg = err; return bad(err); }
    f8Apply(T); Object.assign(c, { cfgT: Date.now(), configured: false, snap: f8Snap(f) });
    return say('info', 'F5: settings applied. Wait for "Network settings configured" before you press F10 (about 45 seconds on a real server).');
  }
  if (k === 'F10') {
    const err = f8Check(f); if (err) { c.msg = err; return bad(err); }
    const ready = c.configured && c.snap === f8Snap(f);
    f8Apply(T); Object.assign(c, { saved: true, savedVals: Object.assign({}, f), sawIp: false, mode: 'save', t: Date.now() });
    return say(ready ? 'ok' : 'warn', ready ? 'F10: settings saved. The server reboots.' : 'Saved, and the server reboots. Next time press F5 first and wait for "Network settings configured", as Cisco\'s procedure says.');
  }
  if (k === 'Esc') {
    const dirty = f8Snap(f) !== f8Snap(f8Form(T));
    Object.assign(c, { mode: 'exit', t: Date.now() });
    return say(dirty ? 'warn' : 'info', dirty ? 'Esc: left the utility without saving. Changes since the last F5 were discarded.' : 'Esc: left the utility. The server continues to boot.');
  }
  if (k === 'F8') return say('info', 'You are already in the Cisco IMC Configuration Utility.');
  if (k === 'CtrlAltDel') return;
}
let conLast = '';
Sim.every(() => {
  if (!T.con) return;
  conTick(T); const osA = T.os && OSI.tick(T), vis = Sim.view === 'console' || (Sim.view === 'cimc' && T.cimc.kvm), k = conKey(T) + (osA && vis ? '|' + Date.now() : '');
  if (k === conLast) return; conLast = k;
  const ae = document.activeElement, f = ae && ae.dataset && ae.dataset.field;
  if (ae && ae.matches && ae.matches('.simui input:not(.osin), .simui select')) return guide();
  let pos = null; try { pos = f ? ae.selectionStart : null; } catch (e) { }
  render();
  if (f) { const el = document.querySelector(`#stage [data-field="${f}"]`); if (el) { el.focus({ preventScroll: true }); try { if (pos !== null) el.setSelectionRange(pos, pos); } catch (e) { } } }
  else if (osScreenOn(T)) OSI.focus();
}, 250);
Sim.listen('keydown', e => {
  // through the KVM: keys typed with focus in the console window, or nowhere in particular (after a click or a redraw)
  const tg0 = e.target, free = !tg0 || tg0 === document.body || tg0 === document.documentElement;
  const kvm = Sim.view === 'cimc' && T.cimc.kvm && (free || (tg0.closest && tg0.closest('.kvm')));
  if (Sim.view !== 'console' && !kvm) return;
  const map = { F1: 'F1', F2: 'F2', F5: 'F5', F6: 'F6', F8: 'F8', F10: 'F10', Escape: 'Esc', ArrowUp: 'Up', ArrowDown: 'Down' };
  const tg = e.target, inF8 = tg && tg.matches && tg.matches('input.f8in'), onBtn = tg && tg.matches && tg.matches('button, select, a, .hot'), inOs = tg && tg.matches && tg.matches('input.osin');
  let k = map[e.key];
  if (inOs && (k === 'Up' || k === 'Down')) k = null;
  // Tab and Shift+Tab move between the fields of the F8 utility and the items of the F6 boot menu, like Down and Up
  if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey && ['f8', 'bmenu'].includes(conPhase(T))) k = e.shiftKey ? 'Up' : 'Down';
  if (osScreenOn(T) && (!k || k === 'Esc')) { const o = OSI.mapKey(e); if (o && (!inOs || /^(Alt)?F\d+$|^Esc$/.test(o))) k = o; }
  if (kvm) { if (!k && e.key === 'Enter' && !onBtn && !inOs) k = 'Enter'; if (!k) return; e.preventDefault(); e.stopImmediatePropagation(); Sim.do('kvmKey', k); return; }
  if (!k && e.key === 'Enter' && !onBtn) k = 'Enter';
  if (!k && e.key === 'Enter' && inOs) k = null;
  if (!k && e.key === ' ' && !inF8 && !onBtn && !inOs) k = 'Space';
  if (!k && e.key === 'Delete' && e.ctrlKey && e.altKey) k = 'CtrlAltDel';
  if (!k) return;
  e.preventDefault(); e.stopImmediatePropagation(); Sim.do('key', k);
}, true);
