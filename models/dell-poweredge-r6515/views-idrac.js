/* ==========================================================================================================
   Dell PowerEdge R6515: first iDRAC9 setup at the server, then the check in the web interface.
   A VGA monitor and a USB keyboard on the rear panel; power on; the boot screens (Please wait while the system is
   initializing, the Dell EMC logo with the model and BIOS version, then F2 = System Setup, F10 = Lifecycle Controller,
   F11 = Boot Manager, F12 = PXE Boot, with the iDRAC IPv4 address); F2: System Setup Main Menu > iDRAC Settings >
   Network (Enable NIC, NIC Selection Dedicated, IPv4 enabled, DHCP disabled, static address, gateway and mask, VLAN
   disabled: the switch port is an access port in the management VLAN) and User Configuration (Change Password, entered
   twice); Finish saves, Finish on the main menu exits and reboots; the boot screen shows the new address. Before the
   address goes on, the student checks with the NOC that the management VLAN is on MGT01 port 13. Then the laptop
   browser: https to the address, the self-signed certificate, login as root, and the address checked on the dashboard.
   The screens are rebuilt from the trainer's photos of a real R6515 (photos-raw, never embedded); every value on them
   is invented. Keys: Up, Down, Tab and Shift+Tab move between fields; Left, Right or Space change a choice; Enter opens
   a link or presses a button; Esc goes back; F2 at the boot screen. The mouse works too.
   © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved.
   ========================================================================================================== */

// the work order for the iDRAC: the management subnet of the Cisco lab (Cisco IMC .120, this iDRAC .121)
const IDR = { ip: '10.1.23.121', gw: '10.1.23.1', mask: '255.255.255.0', net: '10.1.23.0/24', user: 'root', pw: 'password87', sw: 'MGT01', port: 13, vlan: 123, mac: '00:00:5E:00:53:27', bios: '2.11.4', fw: '6.10.30.00 (Build 20)', hii: '5.00.00.00' };
const IDR_DEF = { nic: 'Enabled', nicSel: 'Dedicated', autoneg: 'On', dnsReg: 'Disabled', dnsName: 'idrac-' + WO.tag, dnsDom: '', ipv4: 'Enabled', dhcp: 'Enabled', ip: '192.168.0.120', gw: '192.168.0.1', mask: '255.255.255.0', dns1: '0.0.0.0', dns2: '0.0.0.0', vlan: 'Disabled', vlanId: '1', vlanPri: '0', uen: 'Enabled' };
function idrFresh() {
  return { noc: { sw: null, port: null, net: null, ok: false, msgs: [] }, bootT: null, entered: false, f2T: null, page: null, sel: 0, form: { ...IDR_DEF }, saved: null, pwSet: false, pwNew: '', pw1: '', pw2: '', dlg: null, scrMsg: '', rebooted: false, sawIp: false,
    web: { url: '', page: 'blank', user: '', pw: '', err: '', checked: false } };
}
const idrOn = t => !!(t && t.cpu && t.idr);
const netOk = f => f.nic === 'Enabled' && f.nicSel === 'Dedicated' && f.ipv4 === 'Enabled' && f.dhcp === 'Disabled' && f.ip === IDR.ip && f.gw === IDR.gw && f.mask === IDR.mask && f.vlan === 'Disabled';
function netWhy(f) {
  if (f.nic !== 'Enabled') return 'Enable NIC is Disabled: the iDRAC has no network at all. Set it to Enabled.';
  if (f.nicSel !== 'Dedicated') return `NIC Selection is ${f.nicSel}: the management cable is in the iDRAC dedicated port (MGT01 port 13), not in a LOM port. Select Dedicated.`;
  if (f.ipv4 !== 'Enabled') return 'Enable IPv4 is Disabled: the work order gives an IPv4 address. Enable it.';
  if (f.dhcp !== 'Disabled') return 'Enable DHCP is Enabled: there is no DHCP server on the management network, and the work order gives a static address. Disable DHCP.';
  if (f.ip !== IDR.ip) return `Static IP Address is ${f.ip || 'empty'}: the work order says ${IDR.ip}.`;
  if (f.gw !== IDR.gw) return `Static Gateway is ${f.gw || 'empty'}: the work order says ${IDR.gw}.`;
  if (f.mask !== IDR.mask) return `Static Subnet Mask is ${f.mask || 'empty'}: a /24 network is ${IDR.mask}.`;
  if (f.vlan !== 'Disabled') return `Enable VLAN ID is Enabled: MGT01 port ${IDR.port} is an access port in VLAN ${IDR.vlan}, so the frames are untagged. With a VLAN tag on the iDRAC the switch drops them. Disable it.`;
  return '';
}
// the boot sequence after power-on, in seconds: initializing, logo, the F2 prompt, then no boot device (F2 still works)
const BOOT = { init: 7, logo: 10, prompt: 32 };
function idrPh(t) {
  const c = t.cpu, d = t.idr;
  if (!c || !d || c.power !== 'on' || !d.bootT) return 'off';
  if (d.page) return d.f2T && Date.now() - d.f2T < 1300 ? 'entering' : 'setup';
  const a = (Date.now() - d.bootT) / 1000;
  return a < BOOT.init ? 'init' : a < BOOT.logo ? 'logo' : a < BOOT.prompt ? 'prompt' : 'noboot';
}
function idrBoot(t) { const d = t.idr; Object.assign(d, { bootT: Date.now(), page: null, f2T: null, dlg: null, scrMsg: '' }); }
const shownIp = d => d.saved && d.rebooted && d.saved.form.dhcp === 'Disabled' ? d.saved.form.ip : '0.0.0.0';

/* ---- the pages of System Setup: rows of links, settings and read-only values ---- */
const L = (id, l, help) => ({ t: 'link', id, l, help });
const RAD = (k, l, opts, help) => ({ t: 'radio', k, l, opts, help });
const TXT_ = (k, l, help, ro) => ({ t: 'text', k, l, help, ro });
const VAL = (l, v, dis, help) => ({ t: 'val', l, v, dis, help });
const HEAD = l => ({ t: 'head', l });
const IDR_LINKS = ['System Summary', 'System Event Log', 'Network', 'Alerts', 'Front Panel Security', 'Media and USB Port Settings', 'Lifecycle Controller', 'Power Configuration', 'Thermal', 'System Location', 'User Configuration', 'Smart Card'];
function idrPage(t, p) {
  const f = t.idr.form;
  if (p === 'main') return { title: 'System Setup', sub: 'System Setup Main Menu', btn: 'Finish', rows: [L('bios', 'System BIOS', 'This page lets you configure the system BIOS settings.'), L('idrac', 'iDRAC Settings', 'This page lets you configure the iDRAC settings: network, alerts, users and more.'), L('dev', 'Device Settings', 'This page lets you configure the device settings.')] };
  if (p === 'idrac') return { title: 'iDRAC Settings', sub: 'iDRAC Settings', btn: 'Finish', rows: [VAL('iDRAC Settings Version', IDR.hii), VAL('iDRAC Firmware Version', IDR.fw),
    ...IDR_LINKS.map(n => L(n === 'Network' ? 'net' : n === 'User Configuration' ? 'user' : 'x:' + n, n, n === 'Network' ? 'Use this page to configure the network properties, common iDRAC settings, IPv4 and IPv6 properties, IPMI settings, and VLAN settings.' : n === 'User Configuration' ? 'Use this page to configure the iDRAC user: enable it, its privileges, and its password.' : `Use this page to configure ${n}.`))] };
  if (p === 'net') {
    const dh = f.dhcp === 'Enabled', vl = f.vlan !== 'Enabled';
    return { title: 'iDRAC Settings', sub: 'iDRAC Settings • Network', btn: 'Back', rows: [
      HEAD('NETWORK SETTINGS'),
      RAD('nic', 'Enable NIC', ['Disabled', 'Enabled'], 'Select Enabled to enable the NIC. When the NIC is enabled, it activates the remaining controls in this group. When a NIC is disabled, all communication to and from the iDRAC via the network is blocked.'),
      RAD('nicSel', 'NIC Selection', ['Dedicated', 'LOM1', 'LOM2'], 'Selects the port the iDRAC uses: Dedicated is the iDRAC port on the rear panel; LOM1 and LOM2 share the onboard network ports with the host.'),
      VAL('Failover Network', 'None', true), VAL('MAC Address', IDR.mac, false, 'The MAC address of the iDRAC network interface.'),
      RAD('autoneg', 'Auto Negotiation', ['Off', 'On'], 'On: the iDRAC negotiates speed and duplex with the switch port.'),
      VAL('Auto Dedicated NIC', 'Disabled', true), VAL('Network Speed', '1000 Mbps', true), VAL('Active NIC Interface', 'Dedicated'), VAL('Duplex Mode', 'Full Duplex', true),
      HEAD('COMMON SETTINGS'),
      RAD('dnsReg', 'Register DRAC on DNS', ['Disabled', 'Enabled'], 'Registers the iDRAC name in DNS. The work order does not use it.'),
      TXT_('dnsName', 'DNS DRAC Name', 'The iDRAC name. The default is idrac- and the Service Tag.'),
      VAL('Auto Config Domain Name', 'Disabled', true), TXT_('dnsDom', 'Static DNS Domain Name', 'The domain name, when it is not obtained from DHCP.'),
      HEAD('IPV4 SETTINGS'),
      RAD('ipv4', 'Enable IPv4', ['Disabled', 'Enabled'], 'Enables the IPv4 protocol on the iDRAC.'),
      RAD('dhcp', 'Enable DHCP', ['Disabled', 'Enabled'], 'Enabled: the iDRAC asks a DHCP server for its address. Disabled: it uses the static address below.'),
      TXT_('ip', 'Static IP Address', 'Enter the static IPv4 address of the iDRAC. Available when DHCP is disabled.', dh),
      TXT_('gw', 'Static Gateway', 'Enter the static IPv4 gateway. Available when DHCP is disabled.', dh),
      TXT_('mask', 'Static Subnet Mask', 'Enter the static IPv4 subnet mask. Available when DHCP is disabled.', dh),
      VAL('Use DHCP to obtain DNS server addresses', dh ? 'Enabled' : 'Disabled', true),
      TXT_('dns1', 'Static Preferred DNS Server', 'Enter the static preferred DNS server IPv4 address if DHCP is not used to get the DNS address.', dh),
      TXT_('dns2', 'Static Alternate DNS Server', 'Enter the static alternate DNS server IPv4 address if DHCP is not used to get the DNS address.', dh),
      HEAD('VLAN SETTINGS'),
      RAD('vlan', 'Enable VLAN ID', ['Disabled', 'Enabled'], 'Enabled: the iDRAC tags its frames with the VLAN ID below. Leave it Disabled on an access port: the switch puts the frames in its VLAN.'),
      TXT_('vlanId', 'VLAN ID', 'The VLAN ID, when VLAN is enabled.', vl), TXT_('vlanPri', 'Priority', 'The VLAN priority, when VLAN is enabled.', vl)] };
  }
  if (p === 'user') return { title: 'iDRAC Settings', sub: 'iDRAC Settings • User Configuration', btn: 'Back', warn: !t.idr.pwSet && !(t.idr.saved && t.idr.saved.pwOk), rows: [
    VAL('User ID', '2'), RAD('uen', 'Enable User', ['Disabled', 'Enabled'], 'Enables or disables the iDRAC user.'), VAL('User Name', IDR.user, false, 'The iDRAC user name.'),
    VAL('LAN User Privilege', 'Administrator', false, 'Displays the IPMI LAN privilege level to which the user is assigned (Administrator, Operator, User, or None).'),
    VAL('Serial Port User Privilege', 'Administrator', false, 'Displays the IPMI serial port privilege level to which the user is assigned.'),
    { t: 'link', id: 'pw', l: 'Change Password', val: t.idr.pwSet ? '********' : 'Press <Enter> to input', help: 'Changes the password of this user. Enter the new password twice.' }] };
  return { title: 'System Setup', sub: '', btn: 'Back', rows: [] };
}
const focusable = r => r.t === 'link' || (r.t === 'radio') || (r.t === 'text' && !r.ro);
function idrFocus(t) { const P = idrPage(t, t.idr.page); const ix = P.rows.map((r, i) => focusable(r) ? i : -1).filter(i => i >= 0); return ix.concat(['btn']); }

/* ---- the screens, as HTML in a monitor ---- */
const he = s => esc(String(s));
function dellLogo() { return `<div class="logo"><b>D<i>E</i>LL</b>EMC</div>`; }
function bootScreen(t, ph) {
  const d = t.idr;
  if (ph === 'init') return `<div class="init"><div>Please wait while the system is initializing...</div><svg viewBox="0 0 42 46" class="ic"><path d="M4 3h18v40H4z" fill="none" stroke="#EEE" stroke-width="2.4"/><path d="M8 9h10M8 14h10" stroke="#EEE" stroke-width="2.2"/><circle cx="10" cy="22" r="1.8" fill="#EEE"/><g class="spin"><path d="M38 31a7 7 0 1 1-2.2-5.1" fill="none" stroke="#EEE" stroke-width="2.4"/><path d="M37.5 21.5v5h-5" fill="none" stroke="#EEE" stroke-width="2.4"/></g></svg></div>`;
  const top = `<div class="band"></div>`;
  if (ph === 'logo') return `<div class="boot">${top}<div class="ver c"><div>PowerEdge R6515</div><div>BIOS Version: ${IDR.bios}</div></div>${dellLogo()}</div>`;
  if (ph === 'noboot') return `<div class="nob"><p>No boot device available.</p><p>Current boot mode is set to UEFI.</p><p>Please ensure compatible bootable media is available.</p><p>Use the system setup program to change the boot mode as needed.</p><p>&nbsp;</p><p>Strike <span class="k">F1</span> key to retry boot, <span class="k hk" data-act="dkey" data-arg="F2">F2 for system setup</span>, <span class="k">F11</span> for boot manager.</p><p>&nbsp;</p><p>iDRAC IPv4: <span${d.rebooted && !d.sawIp ? ' class="hk" data-act="idrIp" data-arg=""' : ''}>${shownIp(d)} [Dedicated]</span></p></div>`;
  const entering = ph === 'entering';
  const prog = Math.min(1, ((Date.now() - d.bootT) / 1000 - BOOT.logo) / (BOOT.prompt - BOOT.logo));
  return `<div class="boot">${top}<div class="keys">${entering ? '<div><span class="hl">Entering System Setup</span></div>' : '<div class="hk" data-act="dkey" data-arg="F2">F2&nbsp; = System Setup</div>'}<div class="mk" data-act="dkey" data-arg="F10">F10 = Lifecycle Controller (Config</div><div class="in2">iDRAC, Update FW, Install OS)</div><div class="mk" data-act="dkey" data-arg="F11">F11 = Boot Manager</div><div class="mk" data-act="dkey" data-arg="F12">F12 = PXE Boot</div></div>
    <div class="vinfo"><div>PowerEdge R6515</div><div class="dim">BIOS Version: ${IDR.bios}</div><div class="dim">iDRAC IPV4: <span${d.rebooted && !d.sawIp ? ' class="hk ipk" data-act="idrIp" data-arg=""' : ''}>${shownIp(d)} [Dedicated]</span></div></div>${dellLogo()}
    <div class="prog"><div>${entering ? 'Entering System Setup...' : 'Initializing Firmware Interfaces...'}</div><div class="bar"><i style="width:${(Math.max(0.05, prog) * 100).toFixed(0)}%"></i></div></div></div>`;
}
function rowHtml(t, r, i, sel) {
  const f = t.idr.form, on = sel === i;
  if (r.t === 'head') return `<div class="row head"><span class="lb">${he(r.l)}</span></div>`;
  const act = on ? '' : ` data-act="${r.t === 'link' ? 'dgo' : 'dsel'}" data-arg="${r.t === 'link' ? r.id : i}"`;
  let v = '';
  if (r.t === 'val') v = `<span class="v">${he(r.v)}</span>`;
  else if (r.t === 'radio') v = r.opts.map(o => `<span class="opt" data-act="dset" data-arg="${r.k}:${o}"><span class="rb${f[r.k] === o ? ' on' : ''}"></span>${he(o)}</span>`).join('');
  else if (r.t === 'text') v = `<input class="tx" data-field="idr:${r.k}" value="${he(f[r.k] || '')}" autocomplete="off" spellcheck="false" aria-label="${he(r.l)}"${r.ro ? ' readonly tabindex="-1"' : ''}>`;
  if (r.t === 'link' && r.val) v = `<span class="v pv" data-act="dgo" data-arg="${r.id}">${he(r.val)}</span>`;
  const cls = `row ${r.t}${on ? ' sel' : ''}${r.dis || r.ro ? ' dis' : ''}${r.t === 'link' && !r.val ? ' ln' : ''}`;
  if (r.t === 'link' && !r.val) return `<div class="${cls}" data-act="dgo" data-arg="${r.id}"><span class="lb">${he(r.l)}</span></div>`;
  return `<div class="${cls}"${act}><span class="lb">${he(r.l)}</span><span class="vv">${v}</span></div>`;
}
function dialogHtml(t) {
  const d = t.idr, g = d.dlg; if (!g) return '';
  const box = (title, body, btns) => `<div class="shade"></div><div class="dlg"><div class="dt">${he(title)}</div><div class="db">${body}</div><div class="dbs">${btns}</div></div>`;
  const b = (act, l, arg = '') => `<span class="btn2" data-act="${act}" data-arg="${arg}">${l}</span>`;
  if (g.k === 'pw1' || g.k === 'pw2') return box('Change Password', `<div>${g.k === 'pw1' ? 'Create New Password.' : 'Confirm New Password.'}</div><input class="tx pw" type="password" data-field="idrpw:${g.k === 'pw1' ? 1 : 2}" value="${he(g.k === 'pw1' ? d.pw1 : d.pw2)}" autocomplete="off" aria-label="${g.k === 'pw1' ? 'New password' : 'Confirm new password'}">${g.err ? `<div class="derr">${he(g.err)}</div>` : ''}`, b('dlgNo', 'Cancel') + b('dlgOk', 'OK'));
  if (g.k === 'save') return box('Warning - Saving Changes', '<div>Settings have changed.</div><div>Do you want to save the changes?</div>', b('dlgNo', 'No') + b('dlgYes', 'Yes'));
  if (g.k === 'saved') return box('Success', '<div>The settings were saved successfully.</div>', b('dlgOk', 'OK'));
  if (g.k === 'exit') return box('Confirm Exit', '<div>Are you sure you want to exit and reboot?</div>', b('dlgNo', 'No') + b('dlgYes', 'Yes'));
  if (g.k === 'err') return box('Error', `<div>${he(g.msg)}</div>`, b('dlgOk', 'OK'));
  return '';
}
function setupScreen(t) {
  const d = t.idr, P = idrPage(t, d.page), fx = idrFocus(t), cur = fx[Math.min(d.sel, fx.length - 1)];
  const selRow = typeof cur === 'number' ? P.rows[cur] : null;
  const help = d.scrMsg || (selRow && selRow.help) || (d.page === 'main' ? 'This page is the main menu of System Setup.' : 'Select an item and press Enter.');
  return `<div class="setup"><div class="hdr"><span class="dl">D<i>E</i>LL<span>EMC</span></span><span class="sep"></span><span>System Setup</span><span class="lk"><span class="mk">Help</span> | <span class="mk">About</span> | <span class="mk" data-act="dbtn" data-arg="exit">Exit</span></span></div>
    <div class="ttl">${he(P.title)}</div><div class="body">${P.sub ? `<div class="sub">${he(P.sub)}</div>` : ''}<div class="list">${P.rows.map((r, i) => rowHtml(t, r, i, cur)).join('')}${P.warn ? '<div class="warnt">WARNING: The default user name and or password has been detected and pose a security risk. To reduce a security risk, create a unique user name and password.</div>' : ''}</div></div>
    <div class="info"><span class="i">i</span><span>${he(help)}</span></div><div class="foot"><span class="btn2${cur === 'btn' ? ' sel' : ''}" data-act="dbtn" data-arg="${P.btn === 'Finish' ? 'finish' : 'back'}">${P.btn}</span></div>
    <div class="sbar"><div>PowerEdge R6515</div><div>Service Tag : ${WO.tag}</div></div>${dialogHtml(t)}</div>`;
}
function monitorHtml(t) {
  const c = t.cpu, d = t.idr, ph = idrPh(t);
  let scr;
  if (!c.vga) scr = '<div class="nosig dimtx">The monitor is not connected. Plug its VGA cable into the VGA port on the rear panel (Rear view).</div>';
  else if (ph === 'off') scr = `<div class="nosig">${c.power === 'on' ? 'No signal' : 'No signal: the server is off. Press its power button.'}</div>`;
  else if (ph === 'setup') scr = setupScreen(t);
  else scr = bootScreen(t, ph);
  const kb = c.usb ? 'USB keyboard connected: press keys on your own keyboard, or click the keys on the screen.' : 'No keyboard connected: plug the USB keyboard into a rear USB 3.0 port (Rear view).';
  return `<div class="dmon cueable"><div class="dss" tabindex="0" aria-label="Monitor connected to the server">${scr}</div><div class="brand">MONITOR</div><span class="pled${c.vga && c.power === 'on' ? ' on' : ''}"></span></div><p class="dkb">${kb}</p>`;
}

/* ---- the NOC check and the laptop browser ---- */
function nocHtml(t) {
  const n = t.idr.noc, c = t.cpu, pick = (g, v) => `<button class="btn${n[g] === v ? ' pri' : ''}" data-act="nocPick" data-arg="${g}:${v}">${he(v)}</button>`;
  const msgs = n.msgs.map(m => `<div class="nm ${m.who}"><b>${m.who === 'me' ? 'You' : 'NOC (network operations)'}</b><p>${he(m.txt)}</p></div>`).join('');
  return `<div class="noc cueable"><div class="nh"><b>NOC request: management VLAN</b><span>${n.ok ? 'confirmed' : 'open'}</span></div>
    <p class="np">Before the iDRAC gets its address, the management switch port must already be in the management VLAN. Ask the NOC to confirm it for this server's iDRAC cable.</p>
    <div class="ng"><span>Switch</span>${['MGT01', 'SW01', 'SW02'].map(v => pick('sw', v)).join('')}</div>
    <div class="ng"><span>Port</span>${['12', '13', '14'].map(v => pick('port', v)).join('')}</div>
    <div class="ng"><span>Subnet</span>${['10.1.23.0/24', '10.1.40.0/24'].map(v => pick('net', v)).join('')}</div>
    <div class="ng"><span></span><button class="btn pri" data-act="nocSend" data-arg="">Send to the NOC</button></div>
    <div class="nlog">${msgs || '<p class="np">No messages yet.</p>'}</div>${c.cab.idrac ? '' : '<p class="np warnx">The iDRAC cable is not in MGT01 port 13 yet.</p>'}</div>`;
}
const SRV_ICO = '<svg viewBox="0 0 64 64" class="sico"><rect x="6" y="4" width="40" height="56" rx="3" fill="none" stroke="currentColor" stroke-width="3"/><path d="M13 13h26M13 22h8M13 31h8M13 40h8M13 49h8" stroke="currentColor" stroke-width="3"/><rect x="26" y="27" width="32" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="3"/><path d="M26 33h32" stroke="currentColor" stroke-width="3"/></svg>';
function webHtml(t) {
  const d = t.idr, w = d.web, lic = 'Basic Management';
  let body, title = 'New Tab', path = '';
  if (w.page === 'blank') body = '<div class="wblank">New tab. Type the iDRAC address in the address bar.</div>';
  else if (w.page === 'err') body = `<div class="werr"><div class="wico">:(</div><h4>This site can't be reached</h4><p>${he(w.url)} took too long to respond.</p><p class="wsm">ERR_CONNECTION_TIMED_OUT</p><p class="wsm">${he(w.err)}</p></div>`;
  else if (w.page === 'cert') { title = 'Privacy error'; body = `<div class="wcert"><div class="wico red">!</div><h4>Your connection is not private</h4><p>Attackers might be trying to steal your information from <b>${he(IDR.ip)}</b>.</p><p class="wsm">NET::ERR_CERT_AUTHORITY_INVALID</p>${w.adv ? `<p>This server could not prove that it is ${he(IDR.ip)}; its security certificate is not trusted by your computer's operating system (the iDRAC's self-signed certificate).</p><p><span class="wlink" data-act="webProceed" data-arg="">Proceed to ${he(IDR.ip)} (unsafe)</span></p>` : `<div class="wbtns"><button class="btn" data-act="webAdv" data-arg="">Advanced</button><button class="btn pri" data-act="webBack" data-arg="">Back to safety</button></div>`}</div>`; }
  else if (w.page === 'login') {
    title = `idrac-${WO.tag} - iDRAC9 - Login`; path = '/restgui/start.html';
    body = `<div class="ilog">${SRV_ICO}<h1>Integrated Dell Remote Access Controller 9</h1><div class="ied"><span>${lic}</span></div><hr><p class="itp">Type the User Name and Password and click Log In.</p><hr>
      <div class="ifl"><label>Username:<input data-field="web:user" value="${he(w.user)}" autocomplete="off" spellcheck="false" data-enter="webLogin"></label><label>Password: <i class="iinf">i</i><input type="password" data-field="web:pw" value="${he(w.pw)}" autocomplete="off" data-enter="webLogin"></label>
      <label>Domain:<select disabled><option>This iDRAC</option></select></label></div>${w.err ? `<p class="lerr">${he(w.err)}</p>` : ''}<hr><p class="isec"><b>&#128737; Security Notice:</b> By accessing this computer, you confirm that such access complies with your organization's security policy.</p><hr>
      <div class="ibtn"><button class="lgb" data-act="webLogin" data-arg="">Log In</button></div></div>`;
  } else {
    title = `idrac-${WO.tag} - iDRAC9 - Dashboard`; path = '/restgui/index.html#/';
    const rows = [['Power State', 'On'], ['Model', 'PowerEdge R6515'], ['Host Name', ''], ['Operating System', ''], ['Operating System Version', ''], ['Service Tag', WO.tag], ['BIOS Version', IDR.bios], ['iDRAC Firmware Version', IDR.fw.replace(/ .*/, '')]];
    const job = (n, l, e) => `<div class="jh">${l} : ${n}</div><div class="jb">${e}</div>`;
    body = `<div class="idash"><div class="ibar">${SRV_ICO}<b>iDRAC9</b><span class="isep"></span><span>${lic}</span><span class="isrch">Search</span><span class="iic">&#128100; ?</span></div>
      <div class="inav"><span>&#8962; Dashboard</span><span>System &#709;</span><span>Storage &#709;</span><span>Configuration &#709;</span><span>Maintenance &#709;</span><span>iDRAC Settings &#709;</span></div>
      <h2>Dashboard</h2><div class="iacts"><span>&#9211; Graceful Shutdown</span><span>&#9662;</span><span>&#9728; LED On &#9662;</span><span>More Actions &#9662;</span><em>&#10227; Refresh</em></div>
      <div class="icols"><div><h3>Health Information</h3><div class="ihb">&#9745; SYSTEM IS HEALTHY</div><div class="iht"><div><b>System Health</b><p>&#9745; Healthy <em>Details &#9656;</em></p></div><div><b>Storage Health</b><p>&#9745; Healthy <em>Details &#9656;</em></p></div></div></div>
      <div><h3>System Information</h3><table>${rows.map(([a, b]) => `<tr><td>${a}</td><td>${he(b)}</td></tr>`).join('')}<tr class="ipr${w.checked ? ' done' : ''}" data-act="webCheck" data-arg=""><td>IP Address</td><td>${he(IDR.ip)}${w.checked ? ' &#10003; matches the work order' : ''}</td></tr><tr><td>iDRAC MAC Address</td><td>${he(IDR.mac)}</td></tr><tr><td>License</td><td><span class="ick">&#9745;</span> ${lic} <em>Edit</em></td></tr></table></div>
      <div><h3>Task Summary <em>View All Jobs</em></h3>${job(0, 'Pending Jobs', 'No Pending Jobs')}${job(0, 'In-Progress Jobs', 'No In-Progress Jobs')}${job(1, 'Completed Jobs', '0 with Errors<br>0 Failed')}</div></div></div>`;
  }
  const secure = ['cert', 'login', 'dash'].includes(w.page);
  return `<div class="dweb cueable"><div class="wtab"><span>${he(title)}</span><b>+</b></div><div class="wbar"><span class="wnav">&#8592; &#8594; &#8635;</span><div class="wurl">${secure ? '<span class="lock">&#9888; Not secure</span>' : ''}<input data-field="web:url" value="${he(w.url + (w.page === 'login' || w.page === 'dash' ? path : ''))}" placeholder="Search Google or type a URL" autocomplete="off" spellcheck="false" data-enter="webGo" aria-label="Address bar"></div><button class="btn" data-act="webGo" data-arg="">Go</button></div><div class="wbody">${body}</div></div>`;
}

/* ---- the monitor and keyboard on the rear panel ---- */
function crashArtD(t) {
  const c = t.cpu; if (!c || !(c.vga || c.usb)) return '';
  const zs = CG.zs + (t.rack.pos === 'out' ? CG.travel : 0);
  let g = '<g pointer-events="none">';
  if (c.vga) {
    const [x, y] = CPORT.vga, a = cwp(x - 9, y - 6, zs), b = cwp(x + 9, y + 6, zs), m = cwp(x - 20, y + 60, zs);
    g += `<path d="M${f2((a[0] + b[0]) / 2)} ${f2(b[1])}C${f2((a[0] + b[0]) / 2)} ${f2(b[1] + 30)} ${f2(m[0] + 20)} ${f2(m[1] - 30)} ${f2(m[0])} ${f2(m[1])}" stroke="#2E5571" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="${f2(a[0])}" y="${f2(a[1])}" width="${f2(b[0] - a[0])}" height="${f2(b[1] - a[1])}" rx="2" fill="#2F6FB5" stroke="#0E2A45"/><circle cx="${f2(a[0] + 2)}" cy="${f2((a[1] + b[1]) / 2)}" r="1.6" fill="#C5CCD3"/><circle cx="${f2(b[0] - 2)}" cy="${f2((a[1] + b[1]) / 2)}" r="1.6" fill="#C5CCD3"/>`;
  }
  if (c.usb) {
    const [x, y] = CPORT.usb, a = cwp(x - 5, y - 4, zs), b = cwp(x + 5, y + 4, zs), m = cwp(x - 6, y + 64, zs);
    g += `<path d="M${f2((a[0] + b[0]) / 2)} ${f2(b[1])}C${f2((a[0] + b[0]) / 2)} ${f2(b[1] + 34)} ${f2(m[0])} ${f2(m[1] - 30)} ${f2(m[0])} ${f2(m[1])}" stroke="#1B1F24" stroke-width="3.2" fill="none" stroke-linecap="round"/><rect x="${f2(a[0])}" y="${f2(a[1])}" width="${f2(b[0] - a[0])}" height="${f2(b[1] - a[1])}" rx="1.5" fill="#2A3138" stroke="#0B0F12"/>`;
  }
  return g + '</g>';
}

/* ---- the work order card, in the briefing panel under the work while the iDRAC is set up ---- */
function idrBrief(t) {
  if (!idrOn(t)) return null;
  const row = (k, v) => `<tr><th>${k}</th><td>${v}</td></tr>`;
  return `<section class="ohw"><div class="wo-n"><span>Work order</span><b>IDRAC-${he(WO.tag)}</b></div><div class="wo-b"><p class="wo-gb">Set up the <b>iDRAC9</b> of ${he(PROFILE.name)}, Service Tag ${he(WO.tag)}, ${he(WO.rack)} U${WO.u}</p><table class="oht">`
    + row('Switch port', `iDRAC dedicated port to <b>${IDR.sw} port ${IDR.port}</b> (Gi0/${IDR.port}); ask the NOC to confirm VLAN ${IDR.vlan} for <code>${IDR.net}</code>`)
    + row('Network', `NIC enabled, <b>Dedicated</b>; IPv4 enabled, DHCP disabled; <code>${IDR.ip}</code>, mask <code>${IDR.mask}</code>, gateway <code>${IDR.gw}</code>; VLAN disabled on the iDRAC (access port)`)
    + row('Account', `user <code>${IDR.user}</code>, new password <code>${IDR.pw}</code>`)
    + row('Check', `the boot screen shows the address; then <code>https://${IDR.ip}</code> from the laptop, log in, IP Address on the dashboard`) + '</table></div></section>';
}
/* ---- the views ---- */
const notHere = (title, why) => `<div class="noc"><div class="nh"><b>${he(title)}</b></div><p class="np">${he(why)}</p></div>`;
const IDR_KEEP = [
  ['Work order', `iDRAC dedicated NIC; IPv4 static ${IDR.ip}, mask ${IDR.mask}, gateway ${IDR.gw}; DHCP disabled; VLAN disabled on the iDRAC (MGT01 port ${IDR.port} is an access port in VLAN ${IDR.vlan}); user ${IDR.user}, password ${IDR.pw}.`],
  ['Keys', 'Up and Down, or Tab and Shift+Tab, move between fields. Left, Right or Space change a choice. Enter opens a link or presses a button. Esc goes back one page. F2 at the boot screen opens System Setup. The mouse works as well.'],
  ['Save, then reboot', 'Finish on the iDRAC Settings page asks to save: Yes. Finish on the main menu exits and reboots; the boot screen then shows the new iDRAC IPv4 address.'],
  ['Security', 'Never leave the default password: the iDRAC is the remote power switch, console and firmware of the server. The new password goes in the password vault, not on paper at the rack.']];
Sim.registerView({
  id: 'noc', title: 'NOC: management VLAN check', keep: IDR_KEEP,
  render(t) { return idrOn(t) ? nocHtml(t) : notHere('NOC: not part of this lab', 'The NOC check belongs to the first iDRAC setup: in the installation after Continue, or the iDRAC setup lab.'); },
  tray(t) { return idrOn(t) ? idrTray(t) : ''; }
});
Sim.registerView({
  id: 'console', title: 'Monitor and keyboard: iDRAC setup', keep: IDR_KEEP,
  render(t) { return idrOn(t) ? monitorHtml(t) : notHere('Monitor: not part of this lab', 'The monitor and keyboard are for the first iDRAC setup: in the installation after Continue, or the iDRAC setup lab.'); },
  after(t) {
    if (Sim.view !== 'console' || !idrOn(t)) return;
    const s = document.querySelector('#stage .dss'); if (!s) return;
    const inp = s.querySelector('.dlg input') || s.querySelector('.row.sel input.tx:not([readonly])');
    // a field reached with Tab, the arrows or a click has its value selected, so typing replaces it (as in System Setup)
    if (inp) {
      const fk = inp.dataset.field + '|' + (t.idr.dlg ? t.idr.dlg.k : t.idr.page);
      if (document.activeElement !== inp) inp.focus({ preventScroll: true });
      if (fk !== idrFocusKey) { idrFocusKey = fk; try { inp.select(); } catch (e) { } }
    } else {
      idrFocusKey = '';
      const ae = document.activeElement;
      if (!ae || !ae.closest || !ae.closest('#tray, #acts, #nav, header')) s.focus({ preventScroll: true });
    }
    const sel = s.querySelector('.row.sel'), list = s.querySelector('.list');
    if (sel && list) { const a = sel.offsetTop - list.offsetTop, b = a + sel.offsetHeight; if (a < list.scrollTop) list.scrollTop = a - 4; else if (b > list.scrollTop + list.clientHeight) list.scrollTop = b - list.clientHeight + 4; }
  },
  actions(t) {
    if (!idrOn(t)) return [];
    const c = t.cpu, a = [];
    if (!c.vga) a.push(button('Plug in the monitor (VGA)', 'rearPort', 'vga'));
    if (!c.usb) a.push(button('Plug in the USB keyboard', 'rearPort', 'usb'));
    if (c.power === 'on' && c.usb) a.push(button('Ctrl+Alt+Del (restart)', 'dkey', 'CtrlAltDel'));
    return a;
  },
  tray(t) { return idrOn(t) ? idrTray(t) : ''; }
});
Sim.registerView({
  id: 'web', title: 'Laptop: iDRAC web interface', keep: IDR_KEEP,
  render(t) { return idrOn(t) ? webHtml(t) : notHere('Laptop: not part of this lab', 'The iDRAC web check belongs to the first iDRAC setup.'); },
  tray(t) { return idrOn(t) ? idrTray(t) : ''; }
});
function idrTray(t) {
  const d = t.idr;
  return `<h2>Work order: iDRAC9</h2><table class="dec"><tr><td>NIC</td><td>Dedicated (iDRAC port to ${IDR.sw} port ${IDR.port})</td></tr><tr><td>IPv4</td><td>Enabled, DHCP disabled</td></tr><tr><td>Address</td><td>${IDR.ip}</td></tr><tr><td>Subnet mask</td><td>${IDR.mask} (${IDR.net})</td></tr><tr><td>Gateway</td><td>${IDR.gw}</td></tr><tr><td>VLAN on the iDRAC</td><td>Disabled (access port, VLAN ${IDR.vlan} on the switch)</td></tr><tr><td>User</td><td>${IDR.user}</td></tr><tr><td>Password</td><td>${IDR.pw}</td></tr></table>
    <h3>Status</h3><ul class="rules"><li>NOC: ${d.noc.ok ? 'VLAN confirmed' : 'not asked yet'}</li><li>Monitor: ${t.cpu.vga ? 'connected' : 'not connected'}; keyboard: ${t.cpu.usb ? 'connected' : 'not connected'}</li><li>iDRAC settings: ${d.saved ? 'saved' + (d.rebooted ? ', rebooted' : '') : 'not saved'}</li><li>Web: ${d.web.checked ? 'address checked' : d.web.page === 'dash' ? 'logged in' : 'not opened'}</li></ul>`;
}

/* ---- keys: from the student's keyboard (view console) and from clicks on the screen ---- */
function idrKey(k) {
  const c = T.cpu, d = T.idr; if (!idrOn(T)) return;
  if (!c.usb) return say('warn', 'Nothing happens: no keyboard is connected to the server. Plug the USB keyboard into a rear USB 3.0 port.');
  if (c.power !== 'on') return say('info', 'The server is off: press its power button first.');
  const ph = idrPh(T);
  if (k === 'CtrlAltDel') { idrBoot(T); Sim.sound('fans', 0.1); return say('info', 'Ctrl+Alt+Del: the server restarts and runs the power-on self-test again.' + (ph === 'setup' ? ' Unsaved settings were discarded.' : '')); }
  if (ph === 'init' || ph === 'logo') return say('info', 'Too early: the server is still initializing. Wait for the line F2 = System Setup.');
  if (ph === 'entering') return;
  if (ph === 'prompt' || ph === 'noboot') {
    if (k === 'F2') { Object.assign(d, { page: 'main', sel: 0, f2T: Date.now(), entered: true, form: d.saved ? { ...d.saved.form } : { ...IDR_DEF }, pwSet: false, scrMsg: '' }); Sim.sound('button'); return say('ok', 'F2 pressed: Entering System Setup.'); }
    if (k === 'F10' || k === 'F11' || k === 'F12') return say('info', `${k} is not needed: the work order configures the iDRAC in System Setup (F2).`);
    return say('info', ph === 'noboot' ? 'No boot device yet: press F2 for System Setup.' : 'Press F2 for System Setup.');
  }
  setupKey(k);
}
function setupKey(k) {
  const d = T.idr, P = idrPage(T, d.page), fx = idrFocus(T);
  d.scrMsg = '';
  if (d.dlg) {
    if (k === 'Enter') return Sim.do(['save', 'exit'].includes(d.dlg.k) ? 'dlgYes' : 'dlgOk', '');
    if (k === 'Esc') return Sim.do('dlgNo', '');
    return;
  }
  if (k === 'Up' || k === 'Down') { d.sel = (Math.min(d.sel, fx.length - 1) + (k === 'Up' ? -1 : 1) + fx.length) % fx.length; return; }
  if (k === 'Esc') return pageBack();
  const cur = fx[Math.min(d.sel, fx.length - 1)];
  if (cur === 'btn') { if (k === 'Enter' || k === 'Space') return Sim.do('dbtn', P.btn === 'Finish' ? 'finish' : 'back'); return; }
  const r = P.rows[cur];
  if (r.t === 'link' && (k === 'Enter' || k === 'Space' || k === 'Right')) return Sim.do('dgo', r.id);
  if (r.t === 'radio' && ['Left', 'Right', 'Space'].includes(k)) { const i = r.opts.indexOf(d.form[r.k]), n = (i + (k === 'Left' ? -1 : 1) + r.opts.length) % r.opts.length; return Sim.do('dset', `${r.k}:${r.opts[n]}`); }
  if (k === 'Enter') { d.sel = (d.sel + 1) % fx.length; return; }
}
function pageBack() {
  const d = T.idr;
  if (d.page === 'net' || d.page === 'user') { d.page = 'idrac'; d.sel = idrFocus(T).indexOf(idrPage(T, 'idrac').rows.findIndex(r => r.id === 'net')); return; }
  if (d.page === 'idrac') return Sim.do('dbtn', 'finish');
  if (d.page === 'main') return Sim.do('dbtn', 'finish');
}
const dirty = d => JSON.stringify(d.form) !== JSON.stringify(d.saved ? d.saved.form : IDR_DEF) || d.pwSet;
Sim.on('dkey', k => idrKey(k));
Sim.on('dsel', i => { const d = T.idr; if (!idrOn(T) || idrPh(T) !== 'setup' || d.dlg) return; const ix = idrFocus(T).indexOf(+i); if (ix >= 0) d.sel = ix; });
Sim.on('dgo', id => {
  const d = T.idr; if (!idrOn(T) || idrPh(T) !== 'setup' || d.dlg) return;
  if (!T.cpu.usb) return say('warn', 'No keyboard or mouse is connected to the server: plug the USB keyboard in first.');
  const P = idrPage(T, d.page), ri = P.rows.findIndex(r => r.id === id); if (ri >= 0) d.sel = Math.max(0, idrFocus(T).indexOf(ri));
  if (id === 'idrac' || id === 'net' || id === 'user') { d.page = id; d.sel = 0; Sim.sound('pick'); return; }
  if (id === 'pw') { d.dlg = { k: 'pw1' }; d.pw1 = ''; d.pw2 = ''; return; }
  if (id === 'bios' || id === 'dev') return say('info', `${id === 'bios' ? 'System BIOS' : 'Device Settings'}: not part of this work order. Open iDRAC Settings.`);
  say('info', `${id.slice(2)}: not part of this work order. The work order needs Network and User Configuration.`);
});
Sim.on('dset', a => {
  const d = T.idr; if (!idrOn(T) || idrPh(T) !== 'setup' || d.dlg) return;
  if (!T.cpu.usb) return say('warn', 'No keyboard or mouse is connected to the server: plug the USB keyboard in first.');
  const [k, v] = a.split(':'), P = idrPage(T, d.page), ri = P.rows.findIndex(r => r.k === k); if (ri < 0) return;
  d.form[k] = v; d.sel = Math.max(0, idrFocus(T).indexOf(ri));
});
Sim.on('dbtn', b => {
  const d = T.idr; if (!idrOn(T) || idrPh(T) !== 'setup' || d.dlg) return;
  if (b === 'back') { if (d.page === 'main') return; return pageBack(); }
  if (b === 'exit' || (b === 'finish' && d.page === 'main')) { d.dlg = { k: 'exit' }; return; }
  if (b === 'finish' && d.page === 'idrac') { if (dirty(d)) { d.dlg = { k: 'save' }; return; } d.page = 'main'; d.sel = 1; return; }
  if (b === 'finish') { d.page = 'main'; d.sel = 1; }
});
Sim.on('dlgOk', () => {
  const d = T.idr; if (!idrOn(T) || !d.dlg) return; const g = d.dlg;
  if (g.k === 'pw1') { if (d.pw1.length < 8) { g.err = 'The password must be at least 8 characters.'; return; } d.dlg = { k: 'pw2' }; return; }
  if (g.k === 'pw2') {
    if (d.pw2 !== d.pw1) { d.dlg = { k: 'pw1' }; d.pw1 = ''; d.pw2 = ''; return bad('The two passwords do not match. Enter the new password again, twice.'); }
    d.pwNew = d.pw1; d.pwSet = true; d.dlg = null; Sim.sound('pick');
    return say(d.pwNew === IDR.pw ? 'ok' : 'warn', d.pwNew === IDR.pw ? 'New password entered twice. It is saved with Finish.' : `Password changed, but not to the work order's password (${IDR.pw}).`);
  }
  if (g.k === 'saved') { d.dlg = null; d.page = 'main'; d.sel = 1; return; }
  d.dlg = null;
});
Sim.on('dlgNo', () => {
  const d = T.idr; if (!idrOn(T) || !d.dlg) return; const g = d.dlg; d.dlg = null;
  if (g.k === 'save') { d.form = d.saved ? { ...d.saved.form } : { ...IDR_DEF }; d.pwSet = false; d.page = 'main'; d.sel = 1; return say('warn', 'No: the changes were discarded.'); }
});
Sim.on('dlgYes', () => {
  const d = T.idr; if (!idrOn(T) || !d.dlg) return; const g = d.dlg;
  if (g.k === 'save') {
    const why = netWhy(d.form) || (!d.pwSet && !(d.saved && d.saved.pwOk) ? `The ${IDR.user} password is still the default: change it in User Configuration (work order: ${IDR.pw}).` : '') || (d.pwSet && d.pwNew !== IDR.pw ? `The new password is not the work order's password (${IDR.pw}).` : '') || (!d.noc.ok ? 'Check with the NOC first that the management VLAN is on MGT01 port 13: an address on a port without its VLAN is unreachable.' : '');
    if (why) { d.dlg = { k: 'err', msg: why }; return bad(why); }
    d.saved = { form: { ...d.form }, pwOk: true }; d.pwSet = false; d.dlg = { k: 'saved' }; Sim.sound('snap');
    return say('ok', `Settings saved: dedicated NIC, static ${IDR.ip}, gateway ${IDR.gw}, mask ${IDR.mask}, VLAN disabled; new ${IDR.user} password.`);
  }
  if (g.k === 'exit') {
    d.dlg = null; const lost = dirty(d);
    if (!d.saved) say('warn', 'Exit without saving: the iDRAC keeps its factory settings.');
    idrBoot(T); d.rebooted = !!d.saved; Sim.sound('fans', 0.2);
    if (lost && d.saved) say('warn', 'Exit and reboot: changes since the last save were discarded.');
    else if (d.saved) say('ok', 'Exit: the server reboots. Watch the boot screen: the iDRAC IPv4 line shows the new address.');
  }
});
Sim.on('idrIp', () => {
  const d = T.idr; if (!idrOn(T) || !d.rebooted) return;
  if (shownIp(d) !== IDR.ip) return bad(`The boot screen shows ${shownIp(d)}, not ${IDR.ip}: the settings did not take.`);
  d.sawIp = true; say('ok', `Boot screen: iDRAC IPV4 ${IDR.ip} [Dedicated], as the work order says. Now check it from the laptop browser.`);
});
Sim.onField((f, v) => {
  const d = T.idr; if (!idrOn(T)) return;
  if (f.startsWith('idr:')) {
    const k = f.slice(4), P = idrPage(T, d.page), ri = P.rows.findIndex(r => r.k === k); if (ri < 0 || P.rows[ri].ro) return;
    d.form[k] = v.trim(); d.sel = Math.max(0, idrFocus(T).indexOf(ri)); return;
  }
  if (f === 'idrpw:1') { d.pw1 = v; if (d.dlg) d.dlg.err = ''; return; }
  if (f === 'idrpw:2') { d.pw2 = v; return; }
  if (f === 'web:url') d.web.url = v.trim();
  if (f === 'web:user') d.web.user = v.trim();
  if (f === 'web:pw') d.web.pw = v;
});
Sim.listen('keydown', e => {
  if (Sim.view !== 'console' || !idrOn(T)) return;
  const tg = e.target, inTx = tg && tg.matches && tg.matches('.dss input'), onUi = tg && tg.closest && tg.closest('#tray, #acts, #nav, header, select, button');
  if (onUi && !(tg.closest && tg.closest('.dss'))) return;
  const map = { F1: 'F1', F2: 'F2', F10: 'F10', F11: 'F11', F12: 'F12', Escape: 'Esc', ArrowUp: 'Up', ArrowDown: 'Down', Enter: 'Enter' };
  let k = map[e.key];
  if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) k = e.shiftKey ? 'Up' : 'Down';
  if (!inTx && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) k = e.key === 'ArrowLeft' ? 'Left' : 'Right';
  if (!inTx && e.key === ' ') k = 'Space';
  if (e.key === 'Delete' && e.ctrlKey && e.altKey) k = 'CtrlAltDel';
  if (!k) return;
  e.preventDefault(); e.stopImmediatePropagation(); Sim.do('dkey', k);
}, true);
// the screen moves on by itself while the server boots: redraw when the phase changes, keeping the cursor in a field
let idrLast = '', idrFocusKey = '';
Sim.every(() => {
  if (!idrOn(T) || Sim.view !== 'console') { idrLast = ''; return; }
  const d = T.idr, ph = idrPh(T), key = ph + '|' + (ph === 'prompt' ? Math.floor(Date.now() / 1000) : '');
  if (key === idrLast) return; idrLast = key;
  const ae = document.activeElement, f = ae && ae.dataset && ae.dataset.field;
  let pos = null; try { pos = f ? ae.selectionStart : null; } catch (e) { }
  render();
  if (f) { const el = document.querySelector(`#stage [data-field="${f}"]`); if (el) { el.focus({ preventScroll: true }); try { if (pos !== null) el.setSelectionRange(pos, pos); } catch (e) { } } }
}, 250);

/* ---- NOC and laptop handlers ---- */
Sim.on('nocPick', a => { const n = T.idr && T.idr.noc; if (!n) return; const [g, v] = a.split(':'); n[g] = a.slice(g.length + 1); Sim.sound('pick'); });
Sim.on('nocSend', () => {
  const n = T.idr && T.idr.noc; if (!n) return;
  if (!n.sw || !n.port || !n.net) return say('info', 'Pick the switch, the port and the subnet first.');
  n.msgs.push({ who: 'me', txt: `Please confirm the management VLAN for ${n.net} is configured on ${n.sw} port ${n.port} (Gi0/${n.port}) for the iDRAC of ${PROFILE.name} ${WO.tag} in ${WO.rack} U${WO.u}.` });
  let why = '';
  if (n.sw !== IDR.sw) why = `${n.sw} is a data switch: the iDRAC cable goes to the management switch MGT01 (cable schedule).`;
  else if (+n.port !== IDR.port) why = `${n.sw} port ${n.port} is not assigned to this server: the cable schedule says port ${IDR.port}.`;
  else if (n.net !== IDR.net) why = `${n.net} is not the management subnet of the work order (${IDR.net}).`;
  if (why) { n.msgs.push({ who: 'noc', txt: `That does not match our records for ${WO.tag}. ${why} Please check the work order and send it again.` }); return bad(`Wrong request: ${why}`); }
  n.ok = true; Sim.sound('pick');
  n.msgs.push({ who: 'noc', txt: `Confirmed. MGT01 Gi0/${IDR.port}: switchport mode access, VLAN ${IDR.vlan} (OOB-MGMT), subnet ${IDR.net}, gateway ${IDR.gw} on the core. ${T.cpu.cab.idrac ? 'The port shows link up at 1 Gb/s.' : 'The port is down: no cable yet.'} It is untagged: leave VLAN disabled on the iDRAC.` });
  say('ok', `The NOC confirmed VLAN ${IDR.vlan} on MGT01 port ${IDR.port}, untagged, for ${IDR.net}.`);
});
const idrReady = t => !!(t.idr.saved && t.idr.rebooted && t.cpu.power === 'on' && t.cpu.cab.idrac && t.idr.noc.ok);
Sim.on('webGo', () => {
  const d = T.idr; if (!idrOn(T)) return; const w = d.web, u = w.url.replace(/\/+$/, '');
  if (!u) return say('info', 'Type the iDRAC address in the address bar.');
  const host = u.replace(/^https?:\/\//, '').split('/')[0];
  if (host !== IDR.ip) { w.page = 'err'; w.err = `The work order's iDRAC address is ${IDR.ip}.`; return bad(`${u} is not the iDRAC address: the work order says ${IDR.ip}.`); }
  if (!idrReady(T)) { w.page = 'err'; w.err = !d.saved || !d.rebooted ? 'The iDRAC settings are not saved, or the server has not rebooted since.' : 'The iDRAC is not reachable on the management network.'; return say('warn', 'No answer from the iDRAC yet.'); }
  w.url = 'https://' + IDR.ip;
  w.page = 'cert'; w.adv = false; say('info', 'The iDRAC answers with its self-signed certificate: the browser warns about it.');
});
Sim.on('webAdv', () => { const w = T.idr && T.idr.web; if (!w || w.page !== 'cert') return; w.adv = true; });
Sim.on('webBack', () => { const w = T.idr && T.idr.web; if (!w) return; w.page = 'blank'; say('info', 'Back to safety: the page was closed. On a new iDRAC the self-signed certificate is expected: Advanced, then proceed.'); });
Sim.on('webProceed', () => { const w = T.idr && T.idr.web; if (!w || w.page !== 'cert') return; w.page = 'login'; say('ok', 'The iDRAC9 login page. The certificate is the iDRAC\'s own, self-signed one; it can be replaced with a CA-signed certificate later.'); });
Sim.on('webLogin', () => {
  const w = T.idr && T.idr.web; if (!w || w.page !== 'login') return;
  if (w.user !== IDR.user || w.pw !== IDR.pw) { w.err = 'Login failed. Check the user name and the password.'; w.pw = ''; return bad(`Login failed: the user is ${IDR.user}, and the password is the one you set in System Setup (${IDR.pw}).`); }
  w.page = 'dash'; w.err = ''; Sim.sound('pick'); say('ok', `Logged in to the iDRAC9 web interface as ${IDR.user}.`);
});
Sim.on('webCheck', () => { const w = T.idr && T.idr.web; if (!w || w.page !== 'dash') return; w.checked = true; say('ok', `iDRAC IPv4 Address ${IDR.ip}: matches the work order. The iDRAC is ready for remote management.`); });

(() => {
  if (document.getElementById('dell-idrac-css')) return;
  const s = document.createElement('style'); s.id = 'dell-idrac-css';
  s.textContent = `.dmon{background:linear-gradient(#2E3238,#191C20);border-radius:14px;padding:14px 14px 26px;margin:4px auto 0;max-width:860px;position:relative;border:1px solid #3A4048}
.dmon .brand{position:absolute;bottom:7px;left:50%;transform:translateX(-50%);font:600 9px var(--font);color:#7E8890;letter-spacing:.3em}
.dmon .pled{position:absolute;bottom:10px;right:22px;width:7px;height:7px;border-radius:50%;background:#2A2F35}.dmon .pled.on{background:#45D07F}
.dkb{margin:6px 2px 0;font-size:12.5px;color:var(--muted)}
.dss{position:relative;aspect-ratio:4/3;background:#000;overflow:hidden;font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#1D1D1D;outline:none;border-radius:2px;container-type:inline-size;user-select:none}
.dss [data-act]{cursor:pointer}
.dss .nosig{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#9AA3AB;font-size:2.2cqw;text-align:center;padding:0 10%}
.dss .init{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,#2C2B2E,#1C1B1E 70%,#161518);color:#E8E8E8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.1cqw;font-size:1.55cqw;letter-spacing:.01em}.dss .init .ic{width:3.1cqw}.dss .init .ic .spin{transform-origin:31px 31px;transform-box:fill-box;transform-origin:center;animation:dspin 2.2s linear infinite}@keyframes dspin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.dss .init .ic .spin{animation:none}}
.dss .boot{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 58%,#4FB6EC 0%,#2A90D4 40%,#156AAE 75%,#0E4F86 100%);color:#FFF}
.dss .boot .band{position:absolute;left:0;right:0;top:0;height:30%;background:linear-gradient(#0B0F14 30%,rgba(11,15,20,0))}
.dss .logo{position:absolute;left:0;right:0;top:44%;text-align:center;font:400 6cqw/1 "Segoe UI",Arial,sans-serif;letter-spacing:.02em}.dss .logo b{font-weight:700;margin-right:.08em}.dss .logo i,.dss .hdr .dl i{display:inline-block;font-style:normal;transform:rotate(-24deg)}
.dss .ver{position:absolute;top:4%;left:0;right:0;font-size:1.9cqw;line-height:1.35}.dss .ver.c{text-align:center}
.dss .keys{position:absolute;left:7%;top:4%;font-size:1.95cqw;line-height:1.3}.dss .keys .in2{padding-left:3.4em}
.dss .vinfo{position:absolute;left:51%;top:4%;padding-left:2.4%;border-left:1px solid #DDD;font-size:1.75cqw;line-height:1.35}.dss .dim{color:#CFD8E0}
.dss .hl{background:#2457C5;color:#FFF;padding:0 .2em}
.dss .hk{border-radius:2px}.dss .hk:hover{background:rgba(255,255,255,.18)}.dss .mk:hover{background:rgba(255,255,255,.08)}
.dss .prog{position:absolute;left:24%;right:22%;bottom:7%;font-size:1.5cqw}.dss .prog .bar{height:1.1cqw;background:rgba(255,255,255,.25);margin-top:.5cqw}.dss .prog .bar i{display:block;height:100%;background:#E8F1F8}
.dss .nob{position:absolute;inset:0;background:#000;color:#E6E6E6;font:2cqw/1.35 Consolas,monospace;padding:6% 7%}.dss .nob p{margin:0}.dss .nob .k{color:#FFF}.dss .nob .hk:hover{background:#333}
.dss .setup{position:absolute;inset:0;background:#F6F3E6;display:flex;flex-direction:column}
.dss .hdr{height:7.5%;flex:none;background:linear-gradient(#5E6166,#1C1D1F);color:#FFF;display:flex;align-items:center;padding:0 2%;font-size:1.65cqw}
.dss .hdr .dl{font-weight:700;letter-spacing:.02em;font-size:1.5cqw}.dss .hdr .dl span{font-weight:400;margin-left:.1em}
.dss .hdr .sep{width:1px;height:45%;background:#8D9095;margin:0 1.8%}.dss .hdr .lk{margin-left:auto;font-size:1.25cqw}
.dss .ttl{margin:1.4% 1.6% 0;background:linear-gradient(#EAF1F8,#C8D8E8);border:1px solid #B5C4D2;padding:.6% 1.2%;font-size:2.1cqw;color:#1D2A36;flex:none}
.dss .body{flex:1;margin:0 1.6%;background:linear-gradient(#FDFCF6,#F3EED7);border:1px solid #D6D0BA;border-top:0;display:flex;flex-direction:column;min-height:0}
.dss .sub{font-size:1.95cqw;padding:1.2% 1.4% .6%;color:#222;flex:none}
.dss .list{flex:1;overflow:auto;padding:0 1.4% 1%;min-height:0}
.dss .row{display:grid;grid-template-columns:44% 56%;align-items:center;min-height:3.3cqw;font-size:1.45cqw;padding:0 .8%;border-radius:2px}
.dss .row .lb{white-space:nowrap;overflow:hidden;color:#3B3B3B}.dss .row .lb::after{content:" ........................................................................................................................";color:#A2A2A2}
.dss .row.sel{background:#F5E59D}.dss .row.ln{grid-template-columns:100%;width:62%}.dss .row.ln .lb{text-decoration:underline;text-decoration-color:#9DB4CA;text-underline-offset:.25em}.dss .row.ln .lb::after,.dss .row.head .lb::after{content:none}
.dss .row.head{font-weight:600;color:#222;margin-top:.6%}.dss .row.dis .lb,.dss .row.dis .v{color:#A6A6A6}
.dss .opt{display:inline-flex;align-items:center;gap:.4em;margin-right:1.4em}.dss .rb{width:1.15cqw;height:1.15cqw;border-radius:50%;border:1px solid #6B7680;background:#FFF;display:inline-block;position:relative}.dss .rb.on::after{content:"";position:absolute;inset:20%;border-radius:50%;background:#2D6FB7}
.dss .tx{width:94%;font:inherit;font-size:1.35cqw;border:1px solid #B7B19A;background:#FFF;padding:.15em .4em;color:#222;border-radius:0;outline:none}.dss .tx[readonly]{background:#EEEBDF;color:#8D8D8D}.dss .row.sel .tx{border-color:#6C86A0}
.dss .pv{color:#555}.dss .warnt{font-size:1.3cqw;color:#444;margin:2% .8%}
.dss .info{display:flex;gap:1.2%;align-items:flex-start;margin:1% 1.6% 0;padding:.8% 1.2%;font-size:1.3cqw;color:#555;background:linear-gradient(#FBFAF2,#ECE9DC);border:1px solid #D6D0BA;min-height:7%;flex:none}
.dss .info .i{width:2.1cqw;height:2.1cqw;border-radius:50%;background:#2D6FB7;color:#FFF;font:700 1.4cqw/2.1cqw Georgia,serif;text-align:center;flex:none}
.dss .foot{display:flex;justify-content:flex-end;padding:.8% 1.6%;flex:none}
.dss .btn2{display:inline-block;font-size:1.35cqw;padding:.25em 1.6em;border:1px solid #9B9B9B;border-radius:2px;background:linear-gradient(#FFF,#DCDCDC);color:#333}.dss .btn2.sel{outline:2px solid #E2B93B}
.dss .sbar{background:linear-gradient(#3A3B3D,#19191A);color:#EEE;font-size:1.3cqw;padding:.6% 1.6%;line-height:1.35;flex:none}
.dss .shade{position:absolute;inset:0;background:rgba(0,0,0,.12)}
.dss .dlg{position:absolute;left:33%;top:33%;width:34%;background:#EFEFEF;border:1px solid #6F6F6F;box-shadow:0 4px 18px rgba(0,0,0,.4);font-size:1.4cqw}
.dss .dlg .dt{background:linear-gradient(#5D5F63,#2B2C2E);color:#FFF;padding:1.6% 3%;font-weight:600}.dss .dlg .db{padding:4% 4% 1%;line-height:1.4}.dss .dlg .tx{width:100%;margin-top:3%}
.dss .dlg .dbs{display:flex;justify-content:flex-end;gap:3%;padding:3% 4% 4%}.dss .derr{color:#B23B2E;margin-top:2%}
.noc{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px 16px;max-width:860px}
.noc .nh{display:flex;justify-content:space-between;align-items:center;font-size:15px;margin-bottom:6px}.noc .nh span{font-size:12px;color:var(--muted)}
.noc .np{font-size:13px;color:var(--muted);margin:4px 0 10px}.noc .warnx{color:var(--amber,#F0A93B)}
.noc .ng{display:flex;gap:8px;align-items:center;margin:6px 0;flex-wrap:wrap}.noc .ng>span{width:64px;font-size:13px;color:var(--muted)}
.noc .nlog{margin-top:12px;display:flex;flex-direction:column;gap:8px}.noc .nm{padding:8px 10px;border-radius:8px;font-size:13px;max-width:80%}.noc .nm p{margin:3px 0 0}
.noc .nm.me{align-self:flex-end;background:color-mix(in srgb,var(--uid) 18%,transparent)}.noc .nm.noc{align-self:flex-start;background:color-mix(in srgb,var(--touch) 16%,transparent)}
.dweb{background:#DEE1E6;border-radius:10px 10px 6px 6px;overflow:hidden;max-width:880px;border:1px solid #9AA3AB;color:#1F2328;font-family:"Segoe UI",Arial,sans-serif}
.dweb .wtab{padding:6px 10px 0}.dweb .wtab span{display:inline-block;background:#FFF;border-radius:8px 8px 0 0;padding:6px 14px;font-size:12px;max-width:60%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dweb .wbar{background:#FFF;display:flex;gap:8px;align-items:center;padding:6px 10px;border-bottom:1px solid #D0D4D9}.dweb .wbar .lock{font-size:11px;color:#C5221F;min-width:64px}
.dweb .wbar input{flex:1;font:14px "Segoe UI",Arial,sans-serif;border:1px solid #C6CBD1;border-radius:16px;padding:6px 12px;color:#1F2328;background:#F1F3F4}
.dweb .wbody{background:#FFF;min-height:420px;position:relative}.dweb .wblank{padding:60px 20px;text-align:center;color:#6B7280;font-size:14px}
.dweb .werr,.dweb .wcert{padding:44px 12%;font-size:14px;line-height:1.5}.dweb .werr h4,.dweb .wcert h4{font-size:22px;margin:10px 0}.dweb .wsm{font-size:12px;color:#6B7280}
.dweb .wico{font:700 28px Arial;color:#6B7280}.dweb .wico.red{color:#C5221F}.dweb .wbtns{display:flex;gap:10px;margin-top:16px}.dweb .wlink{color:#1A56C8;text-decoration:underline;cursor:pointer}
.dweb .wtab b{font-weight:400;color:#5F6368;margin-left:10px}.dweb .wnav{color:#5F6368;font-size:15px;letter-spacing:4px}
.dweb .wurl{flex:1;display:flex;align-items:center;gap:8px;background:#F1F3F4;border-radius:16px;padding:0 10px}.dweb .wurl .lock{font-size:12px;color:#C5221F;background:#FCE8E6;border-radius:10px;padding:2px 8px;white-space:nowrap}
.dweb .wurl input{flex:1;border:0;background:transparent;padding:7px 0;border-radius:0}
.dweb .ilog{background:#3F87BD;color:#FFF;min-height:470px;padding:22px 9% 26px;text-align:center}.dweb .sico{width:52px;color:#FFF}
.dweb .ilog h1{font:300 25px "Segoe UI",Arial,sans-serif;margin:10px 0 4px;color:#FFF}.dweb .ied{font-size:13px;font-weight:600}.dweb .ied span{border-left:1px solid #CFE2F0;padding-left:8px;margin-left:30%}
.dweb .ilog hr{border:0;border-top:1px solid rgba(255,255,255,.35);margin:12px 0}.dweb .itp{font-size:13px;margin:0}
.dweb .ifl{display:grid;grid-template-columns:1fr 1fr;gap:10px 26px;text-align:left;max-width:520px;margin:6px auto}.dweb .ifl label{font-size:12.5px;font-weight:600}
.dweb .ifl input,.dweb .ifl select{display:block;width:100%;margin-top:4px;font:14px "Segoe UI",Arial;padding:6px 8px;border:1px solid #9FBBD2;border-radius:0;color:#1F2328;background:#FFF;box-sizing:border-box}
.dweb .iinf{display:inline-block;width:13px;height:13px;border-radius:50%;background:#FFF;color:#3F87BD;font:700 10px/13px Georgia,serif;text-align:center;font-style:normal}
.dweb .isec{font-size:12.5px;margin:0}.dweb .lgb{font:13px "Segoe UI",Arial;background:#F3F3F3;color:#333;border:1px solid #CCC;border-radius:1px;padding:7px 18px;cursor:pointer}.dweb .lerr{color:#FFE1DE;font-weight:600}
.dweb .idash{font-size:12.5px;color:#333;background:#FFF}.dweb .ibar{background:#3F87BD;color:#FFF;display:flex;align-items:center;gap:8px;padding:0 0 0 8px;height:40px}.dweb .ibar .sico{width:26px}.dweb .ibar b{font-weight:500;font-size:15px}
.dweb .isep{width:1px;height:18px;background:#CFE2F0}.dweb .isrch{margin-left:auto;background:#FFF;color:#888;height:100%;display:flex;align-items:center;padding:0 60px 0 12px}.dweb .iic{padding:0 12px}
.dweb .inav{display:flex;gap:18px;padding:8px 12px;border-bottom:1px solid #E3E6E9}.dweb .inav span{color:#2F6EA5;font-weight:600}
.dweb .idash h2{font:300 24px "Segoe UI",Arial;margin:8px 12px}.dweb .iacts{display:flex;gap:6px;padding:0 12px 10px;align-items:center}.dweb .iacts span{background:#3F87BD;color:#FFF;padding:6px 10px;border-radius:2px}.dweb .iacts em{margin-left:auto;color:#2F6EA5;font-style:normal}
.dweb .icols{display:grid;grid-template-columns:1fr 1.25fr 1fr;gap:14px;padding:0 12px 14px}.dweb .icols h3{font:400 15px "Segoe UI",Arial;margin:4px 0 6px;display:flex;justify-content:space-between}.dweb .icols h3 em{font-size:12px;color:#2F6EA5;font-style:normal}
.dweb .ihb{background:#7BA83A;color:#FFF;font-size:14px;padding:12px;text-align:center}.dweb .iht{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}.dweb .iht>div{background:#EEF4E3;padding:8px;min-height:90px}.dweb .iht p{color:#5A8A2A;margin:6px 0}.dweb .iht em{font-style:normal;color:#2F6EA5;float:right;font-size:11px}
.dweb .icols table{background:#F4F5F6}.dweb .icols td{padding:6px 8px;border-bottom:0}.dweb .icols td:first-child{color:#555;width:52%}.dweb .ick{color:#5A8A2A}.dweb .icols td em{color:#2F6EA5;font-style:normal}
.dweb .jh{background:#3F87BD;color:#FFF;font-weight:600;padding:5px 8px;margin-top:6px}.dweb .jb{padding:8px 14px;color:#555;min-height:28px}

#stage .dss .init svg.ic{width:3.1cqw;height:auto}#stage .dweb .ilog svg.sico{width:58px;height:58px;display:inline-block}#stage .dweb .ibar svg.sico{width:26px;height:26px;display:inline-block;flex:none}`;
  Sim.addCss(s);
})();
