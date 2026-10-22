/* ---- VMware ESXi 8.0 Update 3: the text installer (welcome, licence agreement, disk, keyboard, root password,
   confirm, install, reboot), then the installed host: the Direct Console User Interface (F2 Customize System,
   Configure Management Network with Network Adapters, IPv4 and DNS, the apply prompt, Troubleshooting Options) and the
   ESXi Shell on Alt+F1, where esxcli answers from the twin. ---- */
(() => {
  const U = osU;
  const css = document.createElement('style'); css.id = 'osi-esxi-css';
  css.textContent = `.ex{background:#0E0E0E;color:#E8E8E8}
.ex .bx{position:absolute;left:${U(112)};right:${U(112)};top:${U(130)};background:#BCBCBC;color:#111;border:${U(2)} solid #7A7A7A;box-shadow:${U(6)} ${U(6)} 0 #000;padding:${U(14)} ${U(22)} ${U(10)}}
.ex .bx h4{margin:0 0 ${U(12)};font:inherit;font-weight:700;text-align:center;color:#000}
.ex .bx p{margin:0 0 ${U(10)};white-space:normal}
.ex .bx .ky{display:flex;justify-content:center;gap:${U(26)};margin-top:${U(14)};border-top:${U(1)} solid #8E8E8E;padding-top:${U(8)}}
.ex .k{white-space:pre}.ex .k:hover{text-decoration:underline}
.ex .row{display:block;width:100%;white-space:pre;padding:0 ${U(4)}!important}.ex .row:hover{background:#A9A9A9}.ex .row.f{background:#2F4F8F;color:#FFF}
.ex .fld{display:grid;grid-template-columns:${U(220)} ${U(300)};gap:${U(6)} ${U(10)};margin:${U(8)} 0 0 ${U(70)}}
.ex input.osin{background:#FFF;color:#000;border:${U(1)} solid #555!important;padding:0 ${U(4)}!important}
.ex .bar{position:absolute;left:0;right:0;bottom:0;height:${U(24)};background:#BCBCBC;color:#000;padding:0 ${U(10)};display:flex;gap:${U(24)}}
.ex .ld{position:absolute;inset:0;background:#000;color:#E2C04A;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:${U(16)}}
.ex .pb{width:${U(600)};height:${U(14)};border:${U(1)} solid #E2C04A}.ex .pb i{display:block;height:100%;background:#E2C04A}
.dc{background:#9B9B9B;color:#000}
.dc .dtop{position:absolute;left:0;right:0;top:0;height:${U(380)};background:#D9B84A;padding:${U(36)} ${U(60)};white-space:pre}
.dc .low{position:absolute;left:0;right:0;top:${U(380)};bottom:${U(26)};padding:${U(36)} ${U(60)};white-space:pre;background:#9B9B9B}
.dc .bar{position:absolute;left:0;right:0;bottom:0;height:${U(26)};background:#D9B84A;color:#000;padding:0 ${U(16)};display:flex;justify-content:space-between;align-items:center}
.dc .k{white-space:pre}.dc .k:hover{text-decoration:underline}
.dc .scr2{position:absolute;inset:0 0 ${U(26)};background:#9B9B9B;display:grid;grid-template-columns:${U(420)} 1fr;grid-template-rows:auto 1fr}
.dc .scr2 .hd{grid-column:1/-1;background:#D9B84A;padding:${U(6)} ${U(16)};font-weight:700}
.dc .scr2 .l{padding:${U(14)} ${U(16)};border-right:${U(2)} solid #6E6E6E}
.dc .scr2 .r{padding:${U(14)} ${U(20)};white-space:pre-wrap}
.dc .row{display:block;width:100%;white-space:pre;padding:0 ${U(6)}!important}.dc .row:hover{background:#B3B3B3}.dc .row.f{background:#D9B84A;color:#000;font-weight:700}
.dc .dlgw{position:absolute;inset:0;background:rgba(0,0,0,.25);z-index:3}
.dc .dlg{position:absolute;z-index:4;left:${U(150)};right:${U(150)};top:${U(110)};background:#C8C8C8;border:${U(2)} solid #333;padding:${U(12)} ${U(20)} ${U(10)};box-shadow:${U(6)} ${U(6)} 0 rgba(0,0,0,.5)}
.dc .dlg h4{margin:0 0 ${U(10)};text-align:center;font:inherit;font-weight:700;background:#D9B84A;margin:${U(-12)} ${U(-20)} ${U(10)};padding:${U(4)}}
.dc .dlg p{white-space:normal;margin:0 0 ${U(8)}}
.dc .dlg .ky{display:flex;justify-content:center;gap:${U(22)};border-top:${U(1)} solid #777;padding-top:${U(6)};margin-top:${U(10)}}
.dc .fld{display:grid;grid-template-columns:${U(240)} ${U(300)};gap:${U(4)} ${U(10)};margin:${U(4)} 0 0 ${U(40)}}
.dc input.osin{background:#FFF;color:#000;border:${U(1)} solid #444!important;padding:0 ${U(4)}!important}
.dc .msg{position:absolute;left:${U(16)};bottom:${U(32)};color:#000;background:#FFF3B0;padding:0 ${U(6)}}
.es{background:#000;color:#CFCFCF;padding:${U(6)} ${U(10)}}`;
  Sim.addCss(css, true);
  const st = t => t.os.inst, H = () => osH(), W = () => osH().net, VER = '8.0.3', BUILD = '24022510';
  const row = (arg, text, f = false) => osB(arg, esc(text), 'row' + (f ? ' f' : ''));
  const KB = ['Belgian', 'Brazilian', 'Croatian', 'Czechoslovakian', 'Danish', 'Estonian', 'Finnish', 'French', 'German', 'Greek', 'Icelandic', 'Italian', 'Japanese', 'Latin American', 'Norwegian', 'Polish', 'Portuguese', 'Russian', 'Slovenian', 'Spanish', 'Swedish', 'Swiss French', 'Swiss German', 'Turkish', 'Ukrainian', 'United Kingdom', 'US Default', 'US Dvorak'];
  const fresh = t => ({ os: 'esxi', s: 'load', at: osNow(), sel: 0, disk: null, kb: KB.indexOf('US Default'), pw: '', pw2: '', err: '', p: 0, done: false });
  const disks = t => H().disks(t);
  const cap = d => osGiB(d.bytes) >= 1024 ? (osGiB(d.bytes) / 1024).toFixed(2) + ' TiB' : osGiB(d.bytes).toFixed(2) + ' GiB';
  const go = (t, s) => { const i = st(t); i.s = s; i.at = osNow(); i.err = ''; };
  const pwOk = p => p.length >= 8 && [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(p)).length >= 3;
  const box = (title, body, keys) => `<div class="osx ex"><div class="bx"><h4>${esc(title)}</h4>${body}<div class="ky">${keys}</div></div></div>`;
  function screen(t) {
    const i = st(t), w = W();
    if (i.s === 'load') return `<div class="osx ex"><div class="ld"><div>Loading ESXi installer</div><div class="pb"><i style="width:${Math.min(100, osAge(i.at) / 3 * 100).toFixed(0)}%"></i></div><div style="color:#9A9A9A">Loading /tools.t00 ... /esxupdt.v00 ... /bnxtnet.v00</div></div></div>`;
    if (i.s === 'welcome') return box(`Welcome to the VMware ESXi ${VER} Installation`, `<p>VMware ESXi ${VER} installs on most systems but only systems on VMware's Compatibility Guide are supported.</p><p>Consult the VMware Compatibility Guide at: http://www.vmware.com/resources/compatibility</p><p>Select the operation to perform.</p>`, osK('Esc', '(Esc) Cancel') + osK('Enter', '(Enter) Continue'));
    if (i.s === 'eula') return box('End User License Agreement (EULA)', `<p>VMware licence agreement</p><p style="height:${U(240)};overflow:hidden;color:#5A5A5A">[The licence agreement is shown here in the real installer. Read it before you accept: accepting is a commitment on behalf of the organisation that owns the server.]</p><p>Use the arrow keys to scroll the EULA text</p>`, osK('Esc', '(ESC) Do not Accept') + osK('F11', '(F11) Accept and Continue'));
    if (i.s === 'scan') return box('Scanning...', '<p style="text-align:center">Scanning for available devices. This may take a few seconds.</p>', '');
    if (i.s === 'disk') {
      const D = disks(t), sel = i.disk || D[0].esx;
      return box('Select a Disk to Install or Upgrade', `<p>* Contains a VMFS partition<br># Claimed by VMware vSAN</p><div style="white-space:pre;font-weight:700"> Storage Device                                               Capacity</div><div style="white-space:pre">Local:</div>${D.map(d => row('disk:' + d.esx, ` ${(d.esxVendor.padEnd(8) + ' ' + d.esxModel.padEnd(17) + ' (' + d.esx.slice(0, 28) + '...)').padEnd(60)} ${cap(d).padStart(11)}`, sel === d.esx)).join('')}<div style="white-space:pre">Remote:</div><div style="white-space:pre">    (none)</div>${i.err ? `<p style="color:#7A0000;margin-top:${U(8)}">${esc(i.err)}</p>` : ''}`, osK('Esc', '(Esc) Cancel') + osK('F1', '(F1) Details') + osK('F5', '(F5) Refresh') + osK('Enter', '(Enter) Continue'));
    }
    if (i.s === 'kbd') return box('Please select a keyboard layout', `<div style="height:${U(300)};overflow:hidden">${KB.slice(Math.max(0, i.kb - 8), i.kb + 6).map(x => row('kb:' + KB.indexOf(x), ` ${x}`, KB.indexOf(x) === i.kb)).join('')}</div><p>Use the arrow keys to scroll.</p>`, osK('Esc', '(Esc) Cancel') + osK('F9', '(F9) Back') + osK('Enter', '(Enter) Continue'));
    if (i.s === 'pw') { const match = i.pw && i.pw === i.pw2; return box('Enter a root password', `<div class="fld"><span>Root password:</span>${osIn('p.pw', i.pw, { type: 'password', label: 'Root password' , enter: 'osKeyEnter' })}<span>Confirm password:</span>${osIn('p.pw2', i.pw2, { type: 'password', label: 'Confirm password' , enter: 'osKeyEnter' })}</div><p style="margin:${U(14)} 0 0 ${U(70)}">${i.pw2 ? (match ? 'Passwords match.' : 'Passwords do not match.') : ''}</p>${i.err ? `<p style="color:#7A0000">${esc(i.err)}</p>` : ''}`, osK('Esc', '(Esc) Cancel') + osK('F9', '(F9) Back') + osK('Enter', '(Enter) Continue')); }
    if (i.s === 'confirm') { const d = disks(t).find(x => x.esx === i.disk); return box('Confirm Install', `<p>The installer is configured to install ESXi ${VER} on:</p><p style="text-align:center">${esc(d.esx)}.</p><p style="text-align:center"><b>Warning: This disk will be repartitioned.</b></p>`, osK('Esc', '(Esc) Cancel') + osK('F9', '(F9) Back') + osK('F11', '(F11) Install')); }
    if (i.s === 'inst') return box(`Installing ESXi ${VER}`, `<div style="border:${U(1)} solid #333;height:${U(16)};margin:${U(20)} 0 ${U(8)}"><i style="display:block;height:100%;width:${Math.min(100, i.p)}%;background:#2F4F8F"></i></div><p style="text-align:center">${Math.min(100, i.p)} %</p>`, '');
    if (i.s === 'done') return box('Installation Complete', `<p>ESXi ${VER} has been installed successfully.</p><p>ESXi ${VER} will operate in evaluation mode for 60 days. To use ESXi ${VER} after the evaluation period, you must register for a VMware product license.</p><p>To administer your server, navigate to the server's hostname or IP address from your web browser or use the Direct Control User Interface.</p><p><b>Remove the installation media before rebooting.</b></p><p>Reboot the server to start using ESXi ${VER}.</p>`, osK('Enter', '(Enter) Reboot'));
    return '<div class="osx ex"></div>';
  }
  function act(t, a) {
    const i = st(t), [k, v] = a.split(/:(.*)/s);
    if (i.s === 'disk' && k === 'disk') { i.disk = v; i.err = ''; return; }
    if (i.s === 'kbd' && k === 'kb') { i.kb = +v; return; }
  }
  function key(t, k) {
    const i = st(t), w = W(), D = disks(t);
    if (k === 'Esc' && ['welcome', 'disk', 'kbd', 'pw', 'confirm'].includes(i.s)) return say('info', 'Esc would cancel the installation and restart the server. Continue instead.');
    switch (i.s) {
      case 'welcome': if (k === 'Enter') go(t, 'eula'); return;
      case 'eula': if (k === 'F11') { go(t, 'scan'); t.os.m.e_eula = true; } else if (k === 'Up' || k === 'Down') say('info', 'The EULA scrolls with the arrow keys.'); return;
      case 'disk': {
        const cur = i.disk || D[0].esx, j = D.findIndex(d => d.esx === cur);
        if (k === 'Up' || k === 'Down') { i.disk = D[Math.max(0, Math.min(D.length - 1, j + (k === 'Up' ? -1 : 1)))].esx; return; }
        if (k === 'F1') { const d = D[j]; return say('info', `${d.esx}: ${d.esxVendor} ${d.esxModel}, ${cap(d)}, ${d.label}.`); }
        if (k === 'Enter') { const d = D[j], wd = OSI.wantDisk(t); i.disk = d.esx; if (d.esx !== wd.esx) { i.err = 'This is not the boot device of the work order.'; return bad(`${d.esxModel} (${cap(d)}) is ${d.label}: ESXi would repartition it and erase it, and the boot device stays empty. Select ${wd.esxModel} (${cap(wd)}), ${wd.label}.`); } go(t, 'kbd'); t.os.m.e_disk = true; }
        return;
      }
      case 'kbd': if (k === 'Up') i.kb = Math.max(0, i.kb - 1); else if (k === 'Down') i.kb = Math.min(KB.length - 1, i.kb + 1); else if (k === 'F9') go(t, 'disk'); else if (k === 'Enter') { if (KB[i.kb] !== 'US Default') return bad(`${KB[i.kb]}: this keyboard is US. A wrong layout scrambles every password you type at the console later.`); go(t, 'pw'); } return;
      case 'pw':
        if (k === 'F9') return go(t, 'kbd');
        if (k === 'Enter') { if (!i.pw) { i.err = 'Enter a root password.'; return say('warn', i.err); } if (i.pw !== i.pw2) { i.err = 'Passwords do not match.'; return say('warn', i.err); } if (!pwOk(i.pw)) { i.err = 'Password does not meet the length or complexity requirements: at least 8 characters, from at least three character classes.'; return say('warn', i.err); } if (i.pw !== OS_ACC.pw) return bad('That is not the root password in the work order.'); go(t, 'confirm'); t.os.m.e_pw = true; }
        return;
      case 'confirm': if (k === 'F9') return go(t, 'pw'); if (k === 'F11') { go(t, 'inst'); i.p = 0; t.os.m.e_inst = true; return say('info', `Installing ESXi ${VER} on the boot device.`); } return;
      case 'done': if (k === 'Enter') { i.s = 'gone'; H().reboot(t); return say('info', 'Enter: the server restarts and boots ESXi from its disk.'); } return;
    }
  }
  function tick(t) {
    const i = st(t);
    if (i.s === 'load') { if (osAge(i.at) > 3) go(t, 'welcome'); return true; }
    if (i.s === 'scan') { if (osAge(i.at) > 1.5) go(t, 'disk'); return true; }
    if (i.s === 'inst') {
      const p = Math.min(100, Math.floor(osAge(i.at) * 12)); if (p === i.p) return false; i.p = p;
      if (p >= 100) { i.s = 'done'; i.done = true; t.os.m.e_done = true; t.os.sys = { os: 'esxi', disk: i.disk, pw: i.pw, nics: [H().nics(t)[0].esx], ip: { mode: 'dhcp', ip: '', mask: '', gw: '' }, dns: { mode: 'auto', p: '', a: '', host: 'localhost' }, shell: false, ssh: false, boots: 0 }; say('ok', 'Installation Complete. Eject the ISO, then press Enter to reboot.'); }
      return true;
    }
    return false;
  }
  function field(t, f, v) { const i = st(t); if (f.startsWith('p.')) { i[f.slice(2)] = v; i.err = ''; } }
  function cue(t) {
    const i = st(t), wd = OSI.wantDisk(t);
    switch (i.s) {
      case 'load': case 'scan': return { say: 'Wait: the installer is loading.' };
      case 'welcome': return osC('osKey', 'Enter', 'Press Enter to continue.');
      case 'eula': return osC('osKey', 'F11', 'F11: Accept and Continue.');
      case 'disk': return (i.disk || disks(t)[0].esx) !== wd.esx ? osC('osAct', 'disk:' + wd.esx, `Select ${wd.esxModel} (${cap(wd)}): ${wd.label}.`) : osC('osKey', 'Enter', 'Press Enter to continue.');
      case 'kbd': return KB[i.kb] !== 'US Default' ? osC('osAct', 'kb:' + KB.indexOf('US Default'), 'Choose US Default.') : osC('osKey', 'Enter', 'US Default: press Enter.');
      case 'pw': return i.pw !== OS_ACC.pw ? osF('p.pw', OS_ACC.pw, 'Root password: the one in the work order.') : i.pw2 !== OS_ACC.pw ? osF('p.pw2', OS_ACC.pw, 'Confirm it.') : osC('osKey', 'Enter', 'Press Enter.');
      case 'confirm': return osC('osKey', 'F11', 'F11: Install.');
      case 'inst': return { say: 'Wait: ESXi installs.' };
      case 'done': return osC('osKey', 'Enter', 'Press Enter to reboot.');
    }
    return null;
  }

  /* ---- the installed host: boot, the DCUI, the ESXi Shell ---- */
  const sys = t => t.os.sys, nicsAll = t => H().nics(t);
  const ipLive = t => { const y = sys(t); return y.ip.mode === 'static' && y.nics.some(e => (nicsAll(t).find(n => n.esx === e) || {}).link) ? y.ip.ip : y.ip.mode === 'dhcp' && y.nics.some(e => (nicsAll(t).find(n => n.esx === e) || {}).link) ? '169.254.88.15' : ''; };
  const hostName = t => sys(t).dns.mode === 'manual' && sys(t).dns.host ? sys(t).dns.host : 'localhost';
  function boot(t) { const y = sys(t); y.boots = (y.boots || 0) + 1; y.boot = osNow(); t.os.dcui = { s: 'load', sel: 0, f: {}, pend: null, msg: '' }; t.os.term = null; }
  function sysTick(t) { const d = t.os.dcui; if (d && d.s === 'load') { if (osAge(sys(t).boot) > 3) { d.s = 'main'; return true; } return true; } return false; }
  const MENU = ['Configure Password', 'Configure Lockdown Mode', '', 'Configure Management Network', 'Restart Management Network', 'Test Management Network', 'Network Restore Options', '', 'Configure Keyboard', 'Troubleshooting Options', '', 'View System Logs', '', 'View Support Information', '', 'Reset System Configuration'];
  const MG = ['Network Adapters', 'VLAN (optional)', '', 'IPv4 Configuration', 'IPv6 Configuration', 'DNS Configuration', 'Custom DNS Suffixes'];
  const TR = () => ['Enable ESXi Shell', 'Enable SSH', 'Modify ESXi Shell and SSH timeouts', 'Modify DCUI idle timeout', 'Restart Management Agents'];
  const mgmt = t => t.os.dcui.pend || { nics: sys(t).nics.slice(), ip: Object.assign({}, sys(t).ip), dns: Object.assign({}, sys(t).dns) };
  function sysScreen(t) {
    const d = t.os.dcui, y = sys(t), h = H(), c = h.cpu(t);
    if (!d) return '<div class="osx dc"></div>';
    if (d.s === 'load') return `<div class="osx ex"><div class="ld"><div>VMware ESXi ${VER}</div><div class="pb"><i style="width:${Math.min(100, osAge(y.boot) / 3 * 100).toFixed(0)}%"></i></div><div style="color:#9A9A9A">Loading VMware ESXi</div></div></div>`;
    if (d.s === 'tty') return t.os.term ? OSI.term.screen(t, 'es') : `<div class="osx es"><pre class="lcl">ESXi Shell is disabled.\n\nEnable it in the DCUI: F2, Troubleshooting Options, Enable ESXi Shell.\nAlt+F2 returns to the DCUI.</pre>${osK('AltF2', '[Alt+F2]', 'ent')}</div>`;
    const ip = ipLive(t), mode = y.ip.mode === 'static' ? 'STATIC' : 'DHCP';
    const main = `<div class="osx dc"><div class="dtop">VMware ESXi ${VER} (VMKernel Release Build ${BUILD})

${h.vendor} ${h.product}

${c.sockets} x ${c.model}
${h.memGB(t)} GiB Memory</div><div class="low">To manage this host, go to:
${y.dns.mode === 'manual' && ip ? `https://${hostName(t)}/\n` : ''}https://${ip || '0.0.0.0'}/ (${mode})
https://[fe80::9640:c9ff:fe3a:5c10]/ (STATIC)</div><div class="bar">${osK('F2', '&lt;F2&gt; Customize System/View Logs')}${osK('F12', '&lt;F12&gt; Shut Down/Restart')}</div>`;
    if (d.s === 'main') return main + '</div>';
    if (d.s === 'auth') return main.replace(/data-act="osKey"/g, 'data-off="osKey"') + `<div class="dlgw"></div><div class="dlg"><h4>Authentication Required</h4><p>Enter an authorized login name and password for ${esc(hostName(t))}.</p><div class="fld"><span>Configured Keyboard (US Default)</span><span></span><span>Login Name:</span>${osIn('a.user', d.f.user == null ? 'root' : d.f.user, { label: 'Login Name' })}<span>Password:</span>${osIn('a.pw', d.f.pw || '', { type: 'password', label: 'Password' , enter: 'osKeyEnter' })}</div>${d.msg ? `<p style="color:#7A0000">${esc(d.msg)}</p>` : ''}<div class="ky">${osK('Enter', '&lt;Enter&gt; OK')}${osK('Esc', '&lt;Esc&gt; Cancel')}</div></div></div>`;
    const P = mgmt(t);
    const two = (title, items, sel, right, keys, pre) => `<div class="osx dc"><div class="scr2"><div class="hd">${esc(title)}</div><div class="l">${items.map((x, k) => x ? row(pre + k, ` ${x}`, k === sel) : '<div style="height:1.3em"></div>').join('')}</div><div class="r">${right}</div></div><div class="bar">${keys}</div>${d.msg ? `<div class="msg">${esc(d.msg)}</div>` : ''}`;
    if (d.s === 'menu') { const R = { 0: 'Configure Password\n\nSet\n\nTo prevent unauthorized access to this system, set the password for the user.', 3: `Configure Management Network\n\nHostname:\n  ${hostName(t)}\n\nIPv4 Addresses:\n  ${ip || 'none'}\n\nTo view or modify this host's management network settings in detail, press <Enter>.`, 9: `Troubleshooting Mode Options\n\nESXi Shell is ${y.shell ? 'Enabled' : 'Disabled'}\nSSH is ${y.ssh ? 'Enabled' : 'Disabled'}\n\nTo view various troubleshooting mode options like Enable ESXi Shell, Enable SSH, Restart Management Agents, etc.` }; return two('System Customization', MENU, d.sel, esc(R[d.sel] || MENU[d.sel]), `${osK('Up', '&lt;Up/Down&gt; Select')}${osK('Enter', '&lt;Enter&gt; More')}${osK('Esc', '&lt;Esc&gt; Log Out')}`, 'menu:') + '</div>'; }
    const nicTxt = P.nics.map(e => { const n = nicsAll(t).find(x => x.esx === e); return `${e} (${n ? n.label : ''})`; }).join('\n  ');
    const mgR = { 0: `Network Adapters\n\n  ${nicTxt}\n\nThe adapters listed here provide the default network connection to and from this host. When two or more adapters are used, connections will be fault-tolerant and outgoing traffic will be load-balanced.`, 1: 'VLAN (optional)\n\nNot set', 3: `IPv4 Configuration\n\n${P.ip.mode === 'static' ? 'Manual' : P.ip.mode === 'dhcp' ? 'Automatic' : 'Disabled'}\n\nIPv4 Address: ${P.ip.mode === 'static' ? P.ip.ip : ipLive(t) || '0.0.0.0'}\nSubnet Mask: ${P.ip.mode === 'static' ? P.ip.mask : '0.0.0.0'}\nDefault Gateway: ${P.ip.mode === 'static' ? P.ip.gw : '0.0.0.0'}`, 4: 'IPv6 Configuration\n\nIPv6 is enabled.\nLink-local address only.', 5: `DNS Configuration\n\n${P.dns.mode === 'manual' ? 'Manual' : 'Automatic'}\n\nPrimary DNS Server: ${P.dns.p || '0.0.0.0'}\nHostname: ${P.dns.mode === 'manual' ? P.dns.host : 'localhost'}`, 6: 'Custom DNS Suffixes\n\nNone' };
    let base = two('Configure Management Network', MG, d.sel, esc(mgR[d.sel] || ''), `${osK('Up', '&lt;Up/Down&gt; Select')}${osK('Enter', '&lt;Enter&gt; Change')}${osK('Esc', '&lt;Esc&gt; Exit')}`, 'mg:');
    if (d.s === 'mgmt') return base + '</div>';
    if (d.s === 'trbl') { const L = TR(); L[0] = y.shell ? 'Disable ESXi Shell' : 'Enable ESXi Shell'; L[1] = y.ssh ? 'Disable SSH' : 'Enable SSH'; return two('Troubleshooting Mode Options', L, d.sel, esc(d.sel === 0 ? `ESXi Shell\n\nESXi Shell is ${y.shell ? 'Enabled' : 'Disabled'}\n\nChange current state of the ESXi Shell` : d.sel === 1 ? `SSH Support\n\nSSH is ${y.ssh ? 'Enabled' : 'Disabled'}\n\nChange current state of SSH` : L[d.sel]), `${osK('Up', '&lt;Up/Down&gt; Select')}${osK('Enter', '&lt;Enter&gt; Change')}${osK('Esc', '&lt;Esc&gt; Exit')}`, 'tr:') + '</div>'; }
    // behind a dialog the screen's own keys are not clickable: the dialog has the focus
    const mute = h => h.replace(/data-act="os(Key|Act)"/g, 'data-off="os$1"');
    const dlg = (title, body, keys) => mute(base) + `<div class="dlgw"></div><div class="dlg"><h4>${esc(title)}</h4>${body}<div class="ky">${keys}</div></div></div>`;
    if (d.s === 'nics') return dlg('Network Adapters', `<p>Select the adapters for this host's default management network connection. Use two or more adapters for fault-tolerance and load-balancing.</p><div style="white-space:pre;font-weight:700">    Device Name  Hardware Label (MAC Address)    Status</div>${nicsAll(t).map(n => row('nic:' + n.esx, `[${d.f.nics.includes(n.esx) ? 'X' : ' '}] ${n.esx.padEnd(11)} N/A (...${n.mac.toLowerCase().slice(-8)})${''.padEnd(10)} ${n.link ? 'Connected' : 'Disconnected'}${n.link ? ' (...' + n.to + ')' : ''}`)).join('')}`, `${osK('D', '&lt;D&gt; View Details')}${osK('Space', '&lt;Space&gt; Toggle Selected')}${osK('Enter', '&lt;Enter&gt; OK')}${osK('Esc', '&lt;Esc&gt; Cancel')}`);
    if (d.s === 'ipv4') { const f = d.f; return dlg('IPv4 Configuration', `<p>This host can obtain network settings automatically if your network includes a DHCP server. If it does not, the following settings must be specified:</p>${row('ip:off', `( ${f.mode === 'off' ? 'o' : ' '} ) Disable IPv4 configuration for management network`)}${row('ip:dhcp', `( ${f.mode === 'dhcp' ? 'o' : ' '} ) Use dynamic IPv4 address and network configuration`)}${row('ip:static', `( ${f.mode === 'static' ? 'o' : ' '} ) Set static IPv4 address and network configuration:`)}<div class="fld"><span>IPv4 Address</span>${osIn('i.ip', f.ip, { label: 'IPv4 Address', ro: f.mode !== 'static' })}<span>Subnet Mask</span>${osIn('i.mask', f.mask, { label: 'Subnet Mask', ro: f.mode !== 'static' })}<span>Default Gateway</span>${osIn('i.gw', f.gw, { label: 'Default Gateway', ro: f.mode !== 'static' , enter: 'osKeyEnter' })}</div>`, `${osK('Up', '&lt;Up/Down&gt; Select')}${osK('Space', '&lt;Space&gt; Mark Selected')}${osK('Enter', '&lt;Enter&gt; OK')}${osK('Esc', '&lt;Esc&gt; Cancel')}`); }
    if (d.s === 'dns') { const f = d.f; return dlg('DNS Configuration', `<p>This host can only obtain DNS settings automatically if it also obtains its IP configuration automatically.</p>${row('dns:auto', `( ${f.mode === 'auto' ? 'o' : ' '} ) Obtain DNS server addresses and a hostname automatically`)}${row('dns:manual', `( ${f.mode === 'manual' ? 'o' : ' '} ) Use the following DNS server addresses and hostname:`)}<div class="fld"><span>Primary DNS Server</span>${osIn('d.p', f.p, { label: 'Primary DNS Server', ro: f.mode !== 'manual' })}<span>Alternate DNS Server</span>${osIn('d.a', f.a, { label: 'Alternate DNS Server', ro: f.mode !== 'manual' })}<span>Hostname</span>${osIn('d.host', f.host, { label: 'Hostname', ro: f.mode !== 'manual' , enter: 'osKeyEnter' })}</div>`, `${osK('Up', '&lt;Up/Down&gt; Select')}${osK('Space', '&lt;Space&gt; Mark Selected')}${osK('Enter', '&lt;Enter&gt; OK')}${osK('Esc', '&lt;Esc&gt; Cancel')}`); }
    if (d.s === 'confirm') return dlg('Configure Management Network: Confirm', `<p>You have made changes to the host's management network.</p><p>Applying these changes may result in a brief network outage, disconnect remote management software and affect running virtual machines. In case IPv6 has been enabled or disabled this will restart your host.</p><p>Apply changes and restart management network?</p>`, `${osK('Y', '&lt;Y&gt; Yes')}${osK('N', '&lt;N&gt; No')}${osK('Esc', '&lt;Esc&gt; Cancel')}`);
    return base + '</div>';
  }
  const checkNet = (t, P) => {
    const w = W(), want = OSI.wantNic(t), nn = P.nics.map(e => nicsAll(t).find(x => x.esx === e)).filter(Boolean);
    if (!P.nics.includes(want.esx) || nn.some(n => !n.link)) return `Network Adapters: ${nn.filter(n => !n.link).map(n => `${n.esx} is Disconnected (${n.label}, no cable)`).join('; ') || `${want.esx} is not selected`}. Select ${want.esx}, ${want.label}, Connected to ${want.to}.`;
    if (P.ip.mode !== 'static') return `IPv4: ${P.ip.mode === 'dhcp' ? 'dynamic (DHCP), and no DHCP server answers on this network' : 'disabled'}. Set the static address ${w.ip}.`;
    if (P.ip.ip !== w.ip) return `IPv4 Address ${P.ip.ip}: the work order gives ${w.ip}.`;
    if (P.ip.mask !== w.mask) return `Subnet Mask ${P.ip.mask}: the work order gives ${w.mask}.`;
    if (P.ip.gw !== w.gw) return `Default Gateway ${P.ip.gw}: the work order gives ${w.gw}.`;
    if (P.dns.mode !== 'manual' || P.dns.p !== w.dns) return `DNS: the work order gives ${w.dns}.`;
    if (P.dns.host.split('.')[0].toLowerCase() !== w.host) return `Hostname ${P.dns.host || 'localhost'}: the work order names the host ${w.host}.`;
    return '';
  };
  function sysAct(t, a) {
    const d = t.os.dcui, y = sys(t), [k, v] = a.split(/:(.*)/s); if (!d) return;
    if (a === 'enter') return OSI.term.enter(t);
    if (k === 'menu' && d.s === 'menu') { d.sel = +v; return sysKey(t, 'Enter'); }
    if (k === 'mg' && d.s === 'mgmt') { d.sel = +v; return sysKey(t, 'Enter'); }
    if (k === 'tr' && d.s === 'trbl') { d.sel = +v; return sysKey(t, 'Enter'); }
    if (k === 'nic' && d.s === 'nics') { const f = d.f; f.nics = f.nics.includes(v) ? f.nics.filter(x => x !== v) : [...f.nics, v]; return; }
    if (k === 'ip' && d.s === 'ipv4') { d.f.mode = v; return; }
    if (k === 'dns' && d.s === 'dns') { d.f.mode = v; return; }
  }
  function sysKey(t, k) {
    const d = t.os.dcui, y = sys(t), h = H(), w = W(); if (!d) return; d.msg = '';
    if (k === 'AltF1') { d.back = d.s === 'tty' ? d.back : d.s; d.s = 'tty'; if (y.shell && !t.os.term) OSI.term.fresh(t, ['', `ESXi ${VER} http://www.vmware.com`, 'Copyright (c) 2007-2024 Broadcom. All Rights Reserved.', '']); return; }
    if (k === 'AltF2') { if (d.s === 'tty') d.s = d.back && d.back !== 'tty' ? d.back : 'main'; return; }
    if (d.s === 'tty') { if (k === 'Enter') OSI.term.enter(t); return; }
    switch (d.s) {
      case 'main': if (k === 'F2') { d.s = 'auth'; d.f = { user: 'root', pw: '' }; } else if (k === 'F12') say('info', 'F12: Shut Down/Restart. Not needed now.'); return;
      case 'auth': if (k === 'Esc') { d.s = 'main'; return; } if (k === 'Enter') { if ((d.f.user || '').trim() !== 'root' || d.f.pw !== y.pw) { d.msg = 'Login incorrect.'; d.f.pw = ''; return say('warn', 'Login incorrect: root, with the password set in the installer.'); } d.s = 'menu'; d.sel = 3; t.os.m.e_auth = true; return say('ok', 'Logged in to the DCUI as root.'); } return;
      case 'menu': {
        if (k === 'Esc') { d.s = 'main'; return; }
        if (k === 'Up' || k === 'Down') { let j = d.sel; do { j = (j + (k === 'Up' ? -1 : 1) + MENU.length) % MENU.length; } while (!MENU[j]); d.sel = j; return; }
        if (k === 'Enter') { if (d.sel === 3) { d.s = 'mgmt'; d.sel = 0; d.pend = { nics: y.nics.slice(), ip: Object.assign({}, y.ip), dns: Object.assign({}, y.dns) }; return; } if (d.sel === 9) { d.s = 'trbl'; d.sel = 0; return; } return say('info', `${MENU[d.sel]}: not needed for this work order.`); }
        return;
      }
      case 'mgmt': {
        if (k === 'Up' || k === 'Down') { let j = d.sel; do { j = (j + (k === 'Up' ? -1 : 1) + MG.length) % MG.length; } while (!MG[j]); d.sel = j; return; }
        if (k === 'Enter') { const P = d.pend; if (d.sel === 0) { d.s = 'nics'; d.f = { nics: P.nics.slice() }; } else if (d.sel === 3) { d.s = 'ipv4'; d.f = Object.assign({}, P.ip); } else if (d.sel === 5) { d.s = 'dns'; d.f = Object.assign({}, P.dns); } else say('info', `${MG[d.sel]}: not needed for this work order.`); return; }
        if (k === 'Esc') { const P = d.pend, ch = JSON.stringify(P) !== JSON.stringify({ nics: y.nics, ip: y.ip, dns: y.dns }); if (!ch) { d.s = 'menu'; d.sel = 3; d.pend = null; return; } d.s = 'confirm'; return; }
        return;
      }
      case 'nics': if (k === 'Esc') { d.s = 'mgmt'; return; } if (k === 'Enter') { if (!d.f.nics.length) return say('warn', 'Select at least one adapter.'); d.pend.nics = d.f.nics.slice(); d.s = 'mgmt'; const want = OSI.wantNic(t); if (d.pend.nics.includes(want.esx) && d.pend.nics.every(e => (nicsAll(t).find(n => n.esx === e) || {}).link)) t.os.m.e_nic = true; else if (d.pend.nics.some(e => !(nicsAll(t).find(n => n.esx === e) || {}).link)) bad(`${d.pend.nics.filter(e => !(nicsAll(t).find(n => n.esx === e) || {}).link).join(', ')} is Disconnected: ${(nicsAll(t).find(n => n.esx === d.pend.nics.find(e => !(nicsAll(t).find(x => x.esx === e) || {}).link)) || {}).label || 'that port'} has no cable. The management network must use ${want.esx}, Connected to ${want.to}.`); return; } if (k === 'Space') return say('info', 'Click an adapter to toggle it.'); return;
      case 'ipv4': if (k === 'Esc') { d.s = 'mgmt'; return; } if (k === 'Enter') { const f = d.f; if (f.mode === 'static' && (osIp(f.ip) === null || osMaskP(f.mask) < 1 || osIp(f.gw) === null)) return say('warn', 'Type a valid IPv4 address, subnet mask and default gateway.'); d.pend.ip = { mode: f.mode, ip: (f.ip || '').trim(), mask: (f.mask || '').trim(), gw: (f.gw || '').trim() }; d.s = 'mgmt'; if (f.mode === 'static' && f.ip.trim() === w.ip && f.mask.trim() === w.mask && f.gw.trim() === w.gw) t.os.m.e_ip = true; return; } return;
      case 'dns': if (k === 'Esc') { d.s = 'mgmt'; return; } if (k === 'Enter') { const f = d.f; d.pend.dns = { mode: f.mode, p: (f.p || '').trim(), a: (f.a || '').trim(), host: (f.host || '').trim() || 'localhost' }; d.s = 'mgmt'; if (f.mode === 'manual' && f.p.trim() === w.dns && f.host.trim().split('.')[0].toLowerCase() === w.host) t.os.m.e_dns = true; return; } return;
      case 'confirm':
        if (k === 'N') { d.s = 'menu'; d.sel = 3; d.pend = null; return say('info', 'Changes discarded.'); }
        if (k === 'Esc') { d.s = 'mgmt'; return; }
        if (k === 'Y') { const P = d.pend; Object.assign(y, { nics: P.nics.slice(), ip: Object.assign({}, P.ip), dns: Object.assign({}, P.dns) }); d.pend = null; d.s = 'menu'; d.sel = 3; const e = checkNet(t, y); if (e) return bad(`Applied, but the management network does not match the work order. ${e}`); t.os.m.e_apply = true; return say('ok', `Management network restarted: ${w.ip} on ${OSI.wantNic(t).esx}, host name ${w.host}.`); }
        return;
      case 'trbl':
        if (k === 'Esc') { d.s = 'menu'; d.sel = 9; return; }
        if (k === 'Up') { d.sel = Math.max(0, d.sel - 1); return; } if (k === 'Down') { d.sel = Math.min(4, d.sel + 1); return; }
        if (k === 'Enter') { if (d.sel === 0) { y.shell = !y.shell; return say('ok', `ESXi Shell ${y.shell ? 'enabled: Alt+F1 opens it on this console' : 'disabled'}.`); } if (d.sel === 1) { y.ssh = !y.ssh; return say('info', `SSH ${y.ssh ? 'enabled' : 'disabled'}. Not in this work order: enable SSH only when it is needed, and disable it again.`); } return say('info', `${TR()[d.sel]}: not needed now.`); }
        return;
    }
  }
  function sysField(t, f, v) { const d = t.os.dcui; if (!d) return; if (f.startsWith('a.') || f.startsWith('i.') || f.startsWith('d.')) d.f[f.slice(2)] = v; }
  /* ---- the ESXi Shell: esxcli and friends ---- */
  const esxAuth = (t, u, p) => u === 'root' && p === sys(t).pw;
  const motd = () => ['The time and date of this login have been sent to the system logs.', '', 'WARNING:', '   All commands run on the ESXi shell are logged and may be included in', '   support bundles. Do not provide passwords directly on the command line.', '   Most tools can prompt for secrets or accept them from standard input.', '', 'VMware offers supported, powerful system administration tools.  Please', 'see www.vmware.com/go/sysadmintools for details.', '', 'The ESXi Shell can be disabled by an administrative user. See the', 'vSphere Security documentation for more information.'];
  const NS = { '': ['device', 'esxcli', 'fcoe', 'graphics', 'hardware', 'iscsi', 'network', 'nvme', 'rdma', 'sched', 'software', 'storage', 'system', 'vm', 'vsan'], hardware: ['bootdevice', 'clock', 'cpu', 'ipmi', 'memory', 'pci', 'platform', 'power', 'trustedboot', 'usb'], network: ['firewall', 'ip', 'nic', 'vm', 'vswitch'], storage: ['core', 'filesystem', 'nfs', 'vmfs'], system: ['hostname', 'maintenanceMode', 'version', 'time'] };
  function esxcli(t, w) {
    const y = sys(t), h = H(), c = h.cpu(t), p = w.slice(1).join(' ');
    const kv = o => Object.entries(o).map(([k, v]) => `   ${k}: ${v}`);
    if (p === 'hardware memory get') { t.os.ran.mem = true; return kv({ 'Physical Memory': `${h.memGB(t) * 1024 ** 3} Bytes`, 'Reliable Memory': '0 Bytes', 'NUMA Node Count': c.sockets }); }
    if (p === 'hardware cpu global get') { t.os.ran.cpu = true; return kv({ 'CPU Packages': c.sockets, 'CPU Cores': c.sockets * c.cores, 'CPU Threads': c.sockets * c.cores * 2, 'Hyperthreading Active': 'true', 'Hyperthreading Supported': 'true', 'Hyperthreading Enabled': 'true', 'HV Support': 3, 'HV Replay Capable': 'false', 'HV Replay Disabled Reasons': 'N/A' }); }
    if (p === 'hardware cpu list') { t.os.ran.cpu = true; return Array.from({ length: Math.min(4, c.sockets * c.cores * 2) }, (_, k) => [`CPU:${k}`, ...kv({ Id: k, 'Package Id': 0, 'Family': 6, 'Model': c.modelNo, 'Brand': c.model, 'Core Speed': `${c.mhz * 1e6} Hz` }), '']).flat().concat([`(${c.sockets * c.cores * 2 - 4} more CPUs: esxcli hardware cpu global get counts them)`]); }
    if (p === 'hardware platform get') return ['Platform Information', ...kv({ UUID: h.uuid.toLowerCase().replace(/-/g, '').replace(/(..)/g, '0x$1 ').trim().slice(0, 59), 'Product Name': h.product, 'Vendor Name': h.vendor, 'Serial Number': h.serial, 'Enclosure Serial Number': h.serial, 'BIOS Asset Tag': '', 'IPMI Supported': 'true' })];
    if (p === 'storage core device list') { t.os.ran.disk = true; return h.disks(t).flatMap(d => [d.esx, ...kv({ 'Display Name': d.esxDisp, 'Has Settable Display Name': 'true', Size: Math.round(d.bytes / 1048576), 'Device Type': 'Direct-Access', 'Multipath Plugin': d.tran === 'nvme' ? 'HPP' : 'NMP', 'Devfs Path': `/vmfs/devices/disks/${d.esx}`, Vendor: d.esxVendor, Model: d.esxModel, 'Is Local': 'true', 'Is Removable': 'false', 'Is SSD': d.rota ? 'false' : 'true', 'Is Boot Device': d.esx === y.disk ? 'true' : 'false', 'Device Max Queue Depth': d.tran === 'nvme' ? 1023 : 128 }), '']); }
    if (p === 'network nic list') { t.os.ran.ip = true; return osTable([['Name', 'PCI Device', 'Driver', 'Admin Status', 'Link Status', 'Speed', 'Duplex', 'MAC Address', 'MTU', 'Description'], ['------', '------------', '-------', '------------', '-----------', '-----', '------', '-----------------', '----', '-----------'], ...h.nics(t).map(n => [n.esx, n.pci, n.esxDrv, 'Up', n.link ? 'Up' : 'Down', n.link ? n.speed : 0, n.link ? 'Full' : 'Half', n.mac.toLowerCase(), 1500, n.esxDesc])]); }
    if (p === 'network ip interface ipv4 get') { t.os.ran.ip = true; const ip = ipLive(t), st2 = y.ip.mode === 'static'; return osTable([['Name', 'IPv4 Address', 'IPv4 Netmask', 'IPv4 Broadcast', 'Address Type', 'Gateway', 'DHCP DNS'], ['----', '------------', '-------------', '--------------', '------------', '---------', '--------'], ['vmk0', ip || '0.0.0.0', st2 ? y.ip.mask : ip ? '255.255.0.0' : '0.0.0.0', st2 ? (() => { const b = (osIp(y.ip.ip) | ~osMaskN(osMaskP(y.ip.mask))) >>> 0; return [b >>> 24, (b >>> 16) & 255, (b >>> 8) & 255, b & 255].join('.'); })() : '0.0.0.0', st2 ? 'STATIC' : 'DHCP', st2 ? y.ip.gw : '0.0.0.0', st2 ? 'false' : 'true']]); }
    if (p === 'network ip interface list') return ['vmk0', ...kv({ Name: 'vmk0', 'MAC Address': (h.nics(t).find(n => n.esx === y.nics[0]) || h.nics(t)[0]).mac.toLowerCase(), Enabled: 'true', Portset: 'vSwitch0', Portgroup: 'Management Network', MTU: 1500 })];
    if (p === 'system hostname get') return kv({ 'Domain Name': '', 'Fully Qualified Domain Name': hostName(t), 'Host Name': hostName(t) });
    if (p === 'system version get') return kv({ Product: 'VMware ESXi', Version: VER, Build: `Releasebuild-${BUILD}`, Update: 3, Patch: 0 });
    if (p === 'software vib list') return osTable([['Name', 'Version', 'Vendor', 'Acceptance Level', 'Install Date'], ...h.vibs.map(v => [v[0], v[1], v[2], 'VMwareCertified', new Date().toISOString().slice(0, 10)])]);
    const parts = w.slice(1), ns = parts.slice(0, -1).join(' '), last = parts[parts.length - 1];
    if (!parts.length) return ['Usage: esxcli [options] {namespace}+ {cmd} [cmd options]', '', 'Available Namespaces:', ...NS[''].map(x => `  ${x}`)];
    if (NS[p]) return [`Usage: esxcli ${p} {cmd} [cmd options]`, '', 'Available Namespaces:', ...NS[p].map(x => `  ${x}`)];
    if (/^(hardware (memory|platform)|hardware cpu global|system (hostname|version))$/.test(p)) return [`Usage: esxcli ${p} {cmd} [cmd options]`, '', 'Available Commands:', '  get'];
    return [`Error: Unknown command or namespace ${parts.join(' ')}`];
  }
  function run(t, line) {
    const y = sys(t), h = H(), parts = osPipes(line), w = osWords(parts[0]); let out;
    switch (w[0]) {
      case 'esxcli': out = esxcli(t, w); break;
      case 'vmware': out = w.includes('-l') ? [`VMware ESXi ${VER} build-${BUILD}`, 'VMware ESXi 8.0 Update 3'] : [`VMware ESXi ${VER} build-${BUILD}`]; break;
      case 'esxcfg-nics': t.os.ran.ip = true; out = osTable([['Name', 'PCI', 'Driver', 'Link', 'Speed', 'Duplex', 'MAC Address', 'MTU', 'Description'], ...h.nics(t).map(n => [n.esx, n.pci, n.esxDrv, n.link ? 'Up' : 'Down', n.link ? n.speed + 'Mbps' : '0Mbps', n.link ? 'Full' : 'Half', n.mac.toLowerCase(), 1500, n.esxDesc])]); break;
      case 'vmkping': case 'ping': {
        const host = w.filter((x, i) => !x.startsWith('-') && w[i - 1] !== '-c').slice(1)[0], ci = w.indexOf('-c'), n = ci >= 0 ? Math.max(1, Math.min(10, +w[ci + 1] || 3)) : 3, ip = ipLive(t);
        if (!host) { out = ['Usage: vmkping [args] [host]']; break; }
        const ok = ip && y.ip.mode === 'static' && osSameNet(host, y.ip.ip, osMaskP(y.ip.mask)) && [y.ip.gw, W().dns, y.ip.ip].includes(host);
        out = [`PING ${host} (${host}): 56 data bytes`];
        if (ok) { const ts = []; for (let k = 0; k < n; k++) { const x = (0.3 + Math.random() * 0.2).toFixed(3); ts.push(+x); out.push(`64 bytes from ${host}: icmp_seq=${k} ttl=64 time=${x} ms`); } out.push('', `--- ${host} ping statistics ---`, `${n} packets transmitted, ${n} packets received, 0% packet loss`, `round-trip min/avg/max = ${Math.min(...ts).toFixed(3)}/${(ts.reduce((a, b) => a + b, 0) / n).toFixed(3)}/${Math.max(...ts).toFixed(3)} ms`); if (host === y.ip.gw) t.os.ran.ping = true; }
        else { if (!ip) out = ['sendto() failed (Host is down)']; else out.push('', `--- ${host} ping statistics ---`, `${n} packets transmitted, 0 packets received, 100% packet loss`); }
        break;
      }
      case 'uname': out = [w.includes('-a') ? `VMkernel ${hostName(t)} ${VER} #1 SMP Release build-${BUILD} Jun 12 2024 07:54:22 x86_64 x86_64 x86_64 ESXi` : 'VMkernel']; break;
      case 'hostname': out = [hostName(t)]; break;
      case 'whoami': out = ['root']; break;
      case 'clear': OSI.term.clear(t); out = []; break;
      case 'exit': case 'logout': OSI.term.fresh(t, ['', `ESXi ${VER} http://www.vmware.com`, '']); out = []; break;
      case 'reboot': OSI.term.print(t, 'Rebooting the host...'); h.reboot(t); out = []; break;
      case 'help': out = ['ESXi Shell (BusyBox ash). The checks after an install:', '  esxcli hardware memory get         esxcli hardware cpu global get', '  esxcli storage core device list    esxcli network nic list', '  esxcli network ip interface ipv4 get   vmkping -c 3 <address>', '  esxcli hardware platform get   esxcli system version get   vmware -vl   esxcfg-nics -l', 'Pipes into grep, head, tail and wc -l work.']; break;
      case 'lsmem': case 'lscpu': case 'lsblk': case 'free': case 'ip': case 'dmidecode': out = [`-sh: ${w[0]}: not found`, `(This is the ESXi Shell: esxcli ${w[0] === 'lsblk' ? 'storage core device list' : w[0] === 'ip' ? 'network ip interface ipv4 get' : w[0] === 'lscpu' ? 'hardware cpu global get' : 'hardware memory get'}.)`]; break;
      default: out = w[0] ? [`-sh: ${w[0]}: not found`] : [];
    }
    for (const p of parts.slice(1)) { const r = osFilter(out, osWords(p)); if (r.err) return [r.err]; out = r.lines; }
    return out;
  }
  function sysCue(t) {
    const d = t.os.dcui, y = sys(t), w = W(), want = OSI.wantNic(t);
    if (!d || d.s === 'load') return { say: 'Wait: ESXi is starting.' };
    const netOk = !!t.os.m.e_apply;
    if (d.s === 'tty') { if (netOk && y.shell) return null; return osC('osKey', 'AltF2', 'Alt+F2: back to the DCUI.'); }
    if (d.s === 'main') return netOk && y.shell ? osC('osKey', 'AltF1', 'Alt+F1: the ESXi Shell.') : osC('osKey', 'F2', 'F2: Customize System.');
    if (d.s === 'auth') return (d.f.user || '') !== 'root' ? osF('a.user', 'root', 'Login Name: root.') : d.f.pw !== y.pw ? osF('a.pw', y.pw, 'Password: the root password from the work order.') : osC('osKey', 'Enter', 'Press Enter.');
    if (d.s === 'menu') { if (!netOk) return osC('osAct', 'menu:3', 'Choose Configure Management Network.'); if (!y.shell) return osC('osAct', 'menu:9', 'Choose Troubleshooting Options.'); return osC('osKey', 'AltF1', 'Alt+F1: the ESXi Shell.'); }
    if (d.s === 'trbl') return !y.shell ? osC('osAct', 'tr:0', 'Choose Enable ESXi Shell.') : osC('osKey', 'AltF1', 'Alt+F1: the ESXi Shell (the shell is enabled).');
    const P = d.pend || mgmt(t);
    if (d.s === 'mgmt') {
      if (!(P.nics.includes(want.esx) && P.nics.every(e => (nicsAll(t).find(n => n.esx === e) || {}).link))) return osC('osAct', 'mg:0', 'Choose Network Adapters.');
      if (!(P.ip.mode === 'static' && P.ip.ip === w.ip && P.ip.mask === w.mask && P.ip.gw === w.gw)) return osC('osAct', 'mg:3', 'Choose IPv4 Configuration.');
      if (!(P.dns.mode === 'manual' && P.dns.p === w.dns && P.dns.host === w.host)) return osC('osAct', 'mg:5', 'Choose DNS Configuration.');
      return osC('osKey', 'Esc', 'Esc: leave Configure Management Network, then apply.');
    }
    if (d.s === 'nics') { const f = d.f.nics, extra = f.find(e => e !== want.esx && !(nicsAll(t).find(n => n.esx === e) || {}).link); if (extra) return osC('osAct', 'nic:' + extra, `Untick ${extra}: ${(nicsAll(t).find(n => n.esx === extra) || {}).link ? 'not the work order\'s port' : 'Disconnected, no cable'}.`); if (!f.includes(want.esx)) return osC('osAct', 'nic:' + want.esx, `Tick ${want.esx}: ${want.label}, Connected to ${want.to}.`); return osC('osKey', 'Enter', 'Press Enter (OK).'); }
    if (d.s === 'ipv4') { const f = d.f; return f.mode !== 'static' ? osC('osAct', 'ip:static', 'Choose Set static IPv4 address.') : f.ip !== w.ip ? osF('i.ip', w.ip, `IPv4 Address: ${w.ip}.`) : f.mask !== w.mask ? osF('i.mask', w.mask, `Subnet Mask: ${w.mask}.`) : f.gw !== w.gw ? osF('i.gw', w.gw, `Default Gateway: ${w.gw}.`) : osC('osKey', 'Enter', 'Press Enter (OK).'); }
    if (d.s === 'dns') { const f = d.f; return f.mode !== 'manual' ? osC('osAct', 'dns:manual', 'Choose Use the following DNS server addresses and hostname.') : f.p !== w.dns ? osF('d.p', w.dns, `Primary DNS Server: ${w.dns}.`) : f.host !== w.host ? osF('d.host', w.host, `Hostname: ${w.host}.`) : osC('osKey', 'Enter', 'Press Enter (OK).'); }
    if (d.s === 'confirm') return osC('osKey', 'Y', 'Y: apply the changes and restart the management network.');
    return null;
  }
  const shellCue = (t, c, say2) => {
    const d = t.os.dcui, tm = t.os.term, y = sys(t);
    if (!d || d.s !== 'tty' || !tm) return sysCue(t) || osC('osKey', 'AltF1', 'Alt+F1: the ESXi Shell.');
    if (tm.mode === 'login') return tm.cmd !== 'root' ? osF('cmd', 'root', 'Login: root.') : osC('osEnter', '', 'Press Enter.');
    if (tm.mode === 'pw') return tm.cmd !== y.pw ? osF('cmd', y.pw, 'Password: the root password.') : osC('osEnter', '', 'Press Enter.');
    if (!c) return null;
    return tm.cmd.trim() !== c ? osF('cmd', c, say2 || `Type ${c}`) : osC('osEnter', '', 'Press Enter.');
  };
  function postSteps() {
    const w = () => W(), n = () => OSI.wantNic(T), m = k => t => !!t.os.m[k], r = k => t => !!t.os.ran[k];
    const dc = t => sysCue(t);
    return [
      { text: 'DCUI: F2 Customize System, log in as root', hint: 'The Direct Console User Interface, on the server\'s screen.', done: m('e_auth'), cue: dc },
      { get text() { return `Configure Management Network, Network Adapters: ${n().esx} (Connected), no port without a link`; }, get hint() { return `${n().esx} is ${n().label}, cabled to ${n().to}. ESXi starts with vmnic0${OSI.wantNic(T).esx !== 'vmnic0' ? ': on this server that port has no cable' : ''}.`; }, done: t => !!(t.os.m.e_nic || t.os.m.e_apply), cue: dc },
      { get text() { return `IPv4 Configuration: static ${w().ip}, ${w().mask}, gateway ${w().gw}`; }, hint: 'No DHCP server answers on this network.', done: t => !!(t.os.m.e_ip || t.os.m.e_apply), cue: dc },
      { get text() { return `DNS Configuration: ${w().dns}, hostname ${w().host}`; }, done: t => !!(t.os.m.e_dns || t.os.m.e_apply), cue: dc },
      { text: 'Esc, then Y: apply the changes and restart the management network', done: m('e_apply'), cue: dc },
      { text: 'Troubleshooting Options: Enable ESXi Shell', hint: 'For the checks at the console. Disable it again after handover (or let its timeout do it).', done: t => !!(t.os.sys && t.os.sys.shell), cue: dc },
      { text: 'Alt+F1: log in to the ESXi Shell as root', done: r('login'), cue: t => shellCue(t, null) || { say: 'Logged in.' } },
      { text: 'Check the memory: esxcli hardware memory get', get hint() { return `Physical Memory is in bytes: ${osH().memGB(T)} GiB is ${osH().memGB(T) * 1024 ** 3} bytes.`; }, done: r('mem'), cue: t => shellCue(t, 'esxcli hardware memory get') },
      { text: 'Check the processors: esxcli hardware cpu global get', done: r('cpu'), cue: t => shellCue(t, 'esxcli hardware cpu global get') },
      { text: 'Check the disks: esxcli storage core device list', hint: 'Is Boot Device: true on the boot device only.', done: r('disk'), cue: t => shellCue(t, 'esxcli storage core device list') },
      { get text() { return `Check the network: esxcli network nic list, then vmkping -c 3 ${w().gw}`; }, done: t => !!(t.os.ran.ip && t.os.ran.ping), cue: t => !t.os.ran.ip ? shellCue(t, 'esxcli network nic list') : shellCue(t, `vmkping -c 3 ${w().gw}`) }];
  }
  const steps = () => {
    const d = () => OSI.wantDisk(T), m = k => t => !!t.os.m[k];
    return [
      { text: 'Welcome: Enter. Licence agreement: F11 Accept and Continue', done: m('e_eula') },
      { get text() { return `Select a Disk: ${d().esxModel} (${cap(d())}), the boot device`; }, get hint() { return `${d().label}. Check the line before Enter: the list starts on the first disk.`; }, done: m('e_disk') },
      { text: 'Keyboard: US Default. Root password: the work order\'s', done: m('e_pw') },
      { text: 'Confirm Install: F11, and wait for Installation Complete', done: m('e_done') },
      { eject: true },
      { text: 'Reboot: Enter, and wait for the DCUI', done: t => !!(t.os.sys && t.os.sys.os === 'esxi' && t.os.sys.boots > 0 && t.os.dcui && t.os.dcui.s !== 'load') }];
  };
  OSI.kinds.esxi = { fresh, screen, act, key, tick, field, cue, steps, postSteps, boot, sysTick, sysScreen, sysAct, sysKey, sysCue,
    sysField, auth: esxAuth, userPw: () => sys(T).pw, motd, prompt: t => `[root@${hostName(t)}:~] `, run, loginHost: t => hostName(t), acct: () => 'root', rootLogin: () => true,
    keyBar: [['F11', 'F11'], ['F9', 'F9'], ['F1', 'F1'], ['F5', 'F5']], sysKeyBar: [['F2', 'F2'], ['F12', 'F12'], ['AltF1', 'Alt+F1'], ['AltF2', 'Alt+F2'], ['Space', 'Space'], ['Y', 'Y'], ['N', 'N']],
    notes: ['Welcome: Enter; licence: F11', 'Select a Disk: the boot device', 'Keyboard: US Default; root password', 'Confirm Install: F11; Installation Complete: eject the ISO, Enter', 'DCUI: F2, root; Configure Management Network: the adapter with a link, static IPv4, DNS and host name; Esc, Y', 'Troubleshooting Options: Enable ESXi Shell; Alt+F1, root'] };
})();
