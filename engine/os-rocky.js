/* ---- Rocky Linux 9.5: the Anaconda graphical installer, modelled on its screens (the DVD's boot menu and media
   check, the welcome screen, the Installation Summary hub and its spokes: Installation Destination with the reclaim
   space dialogs, Network & Host Name with the IPv4 settings dialog, Software Selection, Root Password, User Creation,
   then the installation progress and Reboot System). ---- */
(() => {
  const U = osU;
  const css = document.createElement('style'); css.id = 'osi-rocky-css';
  css.textContent = `.an{background:#FFF;color:#2E3436;font:400 ${U(14)}/1.35 'Red Hat Text','Noto Sans','DejaVu Sans',Arial,sans-serif;display:flex}
.an .sb{flex:none;width:${U(150)};background:linear-gradient(180deg,#0B5C45,#10B981);color:#E9FBF4;padding:${U(22)} ${U(14)};font:700 ${U(15)}/1.2 'Red Hat Display','Noto Sans',Arial,sans-serif;letter-spacing:.06em}
.an .sb small{display:block;font-weight:400;letter-spacing:0;margin-top:${U(6)};opacity:.85}
.an .mn{flex:1;display:flex;flex-direction:column;min-width:0;position:relative}
.an .tp{display:flex;justify-content:space-between;align-items:flex-start;padding:${U(16)} ${U(22)} ${U(6)}}
.an .tp h2{margin:0;font:400 ${U(17)}/1.2 inherit;letter-spacing:.04em;text-transform:uppercase}
.an .tp .rt{text-align:right;font-size:${U(13)};letter-spacing:.04em;text-transform:uppercase}
.an .tp .rt .kb{display:inline-block;border:${U(1)} solid #B8BEC0;padding:0 ${U(6)};margin:${U(6)} ${U(6)} 0 0;text-transform:none}
.an .tp .rt .hp{display:inline-block;border:${U(1)} solid #B8BEC0;border-radius:${U(3)};padding:0 ${U(8)};margin-top:${U(6)};text-transform:none}
.an .dn{display:inline-block;margin-top:${U(8)};background:#3C6EB4;color:#FFF!important;border-radius:${U(3)};padding:${U(3)} ${U(14)}!important;font-weight:600}
.an .bd{flex:1;padding:${U(6)} ${U(26)};overflow:hidden;position:relative}
.an .hub{display:grid;grid-template-columns:1fr 1fr;gap:${U(4)} ${U(28)}}
.an .hub h3{grid-column:1/-1;margin:${U(10)} 0 ${U(2)};font:600 ${U(13)} inherit;letter-spacing:.06em;color:#555;border-bottom:${U(1)} solid #D8DCDD;padding-bottom:${U(2)}}
.an .sp{display:flex;gap:${U(10)};align-items:flex-start;padding:${U(5)} ${U(6)}!important;border-radius:${U(4)}!important}
.an .sp:hover{background:#EEF3F7}
#stage .an .sp svg{flex:none;width:${U(34)};height:${U(34)}}
.an .sp b{display:block;font-weight:600}.an .sp i{display:block;font-style:normal;color:#5A6266;font-size:${U(13)}}.an .sp i.w{color:#C9190B}
.an .sp .wi{display:inline-block;width:${U(13)};height:${U(13)};background:#F0AB00;border-radius:50%;margin-right:${U(4)};vertical-align:${U(-1)}}
.an .bt{flex:none;display:flex;justify-content:flex-end;gap:${U(10)};align-items:center;padding:${U(10)} ${U(22)} ${U(8)}}
.an .bt small{flex:1;color:#5A6266;font-size:${U(12)};text-align:right}
.an .abtn{border:${U(1)} solid #8A9396!important;border-radius:${U(3)}!important;padding:${U(4)} ${U(16)}!important;background:#F5F6F6!important}
.an .abtn.pri{background:#3C6EB4!important;border-color:#2C5490!important;color:#FFF}.an .abtn.dis{opacity:.45;cursor:not-allowed}
.an .wb{flex:none;background:#F0AB00;color:#2E2E2E;padding:${U(6)} ${U(22)};font-size:${U(13)}}
.an .tile{display:inline-flex;flex-direction:column;align-items:center;width:${U(190)};padding:${U(10)} ${U(6)}!important;margin:${U(6)} ${U(10)} 0 0;border:${U(2)} solid transparent!important;border-radius:${U(6)}!important;text-align:center!important;vertical-align:top;position:relative}
.an .tile:hover{background:#EEF3F7}.an .tile.on{border-color:#3C6EB4!important;background:#E7EEF8}
#stage .an .tile svg{width:${U(54)};height:${U(54)}}.an .tile b{font-weight:600}.an .tile small{color:#5A6266;font-size:${U(12)}}
.an .tile .ack{position:absolute;right:${U(10)};top:${U(8)};width:${U(20)};height:${U(20)};border-radius:50%;background:#3C6EB4;color:#FFF;font-size:${U(13)};line-height:${U(20)};text-align:center}
.an .sec{font-weight:600;margin:${U(12)} 0 ${U(4)}}
.an .rad{display:block;padding:${U(2)} 0!important}.an .rad::before{content:'○ ';color:#3C6EB4}.an .rad.on::before{content:'◉ '}
.an .achk{display:block;padding:${U(2)} 0!important}.an .achk::before{content:'☐ ';color:#3C6EB4}.an .achk.on::before{content:'☑ '}
.an .fr{display:grid;grid-template-columns:${U(190)} ${U(340)};gap:${U(8)} ${U(12)};align-items:center;margin:${U(8)} 0}
.an .fr>span{text-align:right}
.an input.osin{border:${U(1)} solid #8A9396!important;border-radius:${U(3)};padding:${U(3)} ${U(6)}!important;background:#FFF;color:#2E3436;height:${U(26)};box-sizing:border-box;font-family:inherit}
.an .lst{border:${U(1)} solid #C9CED0;min-height:${U(360)}}
.an .lst .it{display:block;width:100%;padding:${U(8)} ${U(10)}!important;border-bottom:${U(1)} solid #E3E6E7}
.an .lst .it.on{background:#3C6EB4;color:#FFF}.an .lst .it small{display:block;font-size:${U(12)};opacity:.85}
.an .sw{display:inline-flex;border:${U(1)} solid #8A9396;border-radius:${U(12)};overflow:hidden;font-size:${U(12)};font-weight:600}
.an .sw span{padding:${U(2)} ${U(10)}}.an .sw .on{background:#3C6EB4;color:#FFF}
.an .ov{position:absolute;inset:0;z-index:4;background:rgba(30,34,36,.45);display:flex;align-items:flex-start;justify-content:center;padding-top:${U(60)}}
.an .dlg{background:#FFF;width:${U(640)};border:${U(1)} solid #6F777A;box-shadow:0 ${U(8)} ${U(24)} rgba(0,0,0,.4);padding:${U(16)} ${U(20)}}
.an .dlg h4{margin:0 0 ${U(10)};font:600 ${U(16)} inherit;text-transform:uppercase;letter-spacing:.04em}
.an .tabs{display:flex;gap:${U(14)};border-bottom:${U(1)} solid #C9CED0;margin-bottom:${U(10)};font-size:${U(13)}}.an .tabs span{padding:${U(3)} 0}.an .tabs .on{border-bottom:${U(3)} solid #3C6EB4;font-weight:600}
.an .pg{height:${U(14)};background:#E3E6E7;border-radius:${U(7)};overflow:hidden;margin:${U(16)} 0 ${U(10)}}.an .pg i{display:block;height:100%;background:#3C6EB4}
.an .err{color:#C9190B}.an .ok2{color:#3E8635}
.rg{background:#000;color:#BFBFBF;padding:${U(150)} ${U(140)} 0}
.rg .row{display:block;padding:0 ${U(8)}!important;white-space:pre}.rg .row.f{background:#BFBFBF;color:#000}`;
  Sim.addCss(css, true);

  const st = t => t.os.inst, H = () => osH(), W = () => osH().net;
  const b = (arg, label, cls = 'abtn') => osB(arg, esc(label), cls);
  const ICON = {
    kbd: '<rect x="3" y="9" width="28" height="16" rx="2" fill="none" stroke="#4F5A5E" stroke-width="2"/><path d="M7 14h2M12 14h2M17 14h2M22 14h2M10 20h14" stroke="#4F5A5E" stroke-width="2"/>',
    lang: '<circle cx="17" cy="17" r="12" fill="none" stroke="#4F5A5E" stroke-width="2"/><path d="M5 17h24M17 5c-5 6-5 18 0 24M17 5c5 6 5 18 0 24" fill="none" stroke="#4F5A5E" stroke-width="1.6"/>',
    time: '<circle cx="17" cy="17" r="12" fill="none" stroke="#4F5A5E" stroke-width="2"/><path d="M17 9v8l6 4" fill="none" stroke="#4F5A5E" stroke-width="2"/>',
    src: '<circle cx="17" cy="17" r="12" fill="none" stroke="#4F5A5E" stroke-width="2"/><circle cx="17" cy="17" r="3" fill="none" stroke="#4F5A5E" stroke-width="2"/>',
    soft: '<path d="M6 11l11-5 11 5v13l-11 5-11-5z M6 11l11 5 11-5 M17 16v13" fill="none" stroke="#4F5A5E" stroke-width="2"/>',
    disk: '<rect x="5" y="9" width="24" height="16" rx="2" fill="none" stroke="#4F5A5E" stroke-width="2"/><circle cx="24" cy="21" r="1.6" fill="#4F5A5E"/>',
    kdump: '<path d="M17 5c3 6 9 8 9 15a9 9 0 0 1-18 0c0-5 4-7 5-11 2 3 2 5 4 6z" fill="none" stroke="#4F5A5E" stroke-width="2"/>',
    net: '<path d="M17 6v8M8 22v-5h18v5M5 22h6v6H5zM14 22h6v6h-6zM23 22h6v6h-6zM13 6h8v8h-8z" fill="none" stroke="#4F5A5E" stroke-width="2"/>',
    sec: '<path d="M17 5l10 4v7c0 7-4 11-10 13-6-2-10-6-10-13V9z" fill="none" stroke="#4F5A5E" stroke-width="2"/>',
    root: '<circle cx="12" cy="17" r="6" fill="none" stroke="#4F5A5E" stroke-width="2"/><path d="M18 17h12M26 17v5M30 17v4" fill="none" stroke="#4F5A5E" stroke-width="2"/>',
    user: '<circle cx="17" cy="12" r="6" fill="none" stroke="#4F5A5E" stroke-width="2"/><path d="M6 30c1-7 6-10 11-10s10 3 11 10" fill="none" stroke="#4F5A5E" stroke-width="2"/>'
  };
  ICON.dest = ICON.disk;   // the Installation Destination spoke
  const ic = k => `<svg viewBox="0 0 34 34" aria-hidden="true">${ICON[k]}</svg>`;
  const DISKSVG = '<svg viewBox="0 0 54 54" aria-hidden="true"><rect x="6" y="14" width="42" height="26" rx="3" fill="#EEF0F1" stroke="#4F5A5E" stroke-width="2"/><circle cx="40" cy="33" r="2.4" fill="#3E8635"/><path d="M12 22h20" stroke="#9AA2A5" stroke-width="2"/></svg>';
  const SOFT = [['gui', 'Server with GUI', 'An integrated, easy-to-manage server with a graphical interface.'], ['server', 'Server', 'An integrated, easy-to-manage server.'], ['min', 'Minimal Install', 'Basic functionality.'], ['ws', 'Workstation', 'Workstation is a user-friendly desktop system for laptops and PCs.'], ['custom', 'Custom Operating System', 'Basic building block for a custom Rocky Linux system.'], ['virt', 'Virtualization Host', 'Minimal virtualization host.']];
  const PROG = ['Configuring storage', 'Creating disklabel on /dev/{d}', 'Creating efi on /dev/{d}{p}1', 'Creating xfs on /dev/{d}{p}2', 'Creating lvmpv on /dev/{d}{p}3', 'Creating xfs on /dev/mapper/rl-root', 'Creating swap on /dev/mapper/rl-swap', 'Creating xfs on /dev/mapper/rl-home', 'Running pre-installation scripts', 'Running pre-installation tasks', 'Installing.', 'Downloading packages', 'Preparing transaction from installation source', 'Installing kernel-5.14.0-503.14.1.el9_5.x86_64 (312/497)', 'Installing NetworkManager (388/497)', 'Installing openssh-server (421/497)', 'Configuring installed system', 'Writing network configuration', 'Creating users', 'Configuring addons', 'Generating initramfs', 'Running post-installation scripts', 'Installing boot loader'];
  const fresh = t => {
    const nets = {}; H().nics(t).forEach(n => { nets[n.dev] = { on: false, mode: 'dhcp', addr: '', mask: '', gw: '', dns: '' }; });
    return { os: 'rocky', s: 'grub', at: osNow(), sel: 1, sel2: H().nics(t)[0].dev, picked: {}, auto: true, dlg: null, net: nets, cf: null, host: 'localhost.localdomain', hostSet: 'localhost', soft: 'gui', rp: { pw: '', pw2: '', lock: false, ssh: false }, rpSet: false, us: { name: '', user: '', admin: false, req: true, pw: '', pw2: '' }, usSet: false, destOk: false, netOk: false, softOk: false, err: '', p: 0, done: false, reclaimed: false };
  };
  const disk = (t, dev) => H().disks(t).find(d => d.dev === dev);
  const gib = b2 => osGiB(b2) >= 1024 ? (osGiB(b2) / 1024).toFixed(2) + ' TiB' : osGiB(b2).toFixed(2) + ' GiB';
  const go = (t, s) => { const i = st(t); i.s = s; i.at = osNow(); i.dlg = null; i.err = ''; i.cf = null; };
  const state = (t, n) => { const c = st(t).net[n.dev]; if (!n.link) return 'Cable unplugged'; if (!c.on) return 'Disconnected'; if (c.mode === 'manual' && osIp(c.addr) !== null) return 'Connected'; return 'Disconnected'; };
  const connected = t => H().nics(t).filter(n => state(t, n) === 'Connected');
  const prefixOf = mk => /^\d{1,2}$/.test(String(mk).trim()) ? +mk : osMaskP(mk);
  const oldOn = (t, dev) => !!(t.os.sys && t.os.sys.os === 'old' && OSI.wantDisk(t).dev === dev);
  // the Installation Summary: each spoke's status line, and whether it still needs attention
  function spokes(t) {
    const i = st(t), cn = connected(t), sel = Object.keys(i.picked).filter(k => i.picked[k]);
    return [['LOCALIZATION', [['kbd', 'Keyboard', 'English (US)'], ['lang', 'Language Support', 'English (United States)'], ['time', 'Time & Date', 'Americas/New York timezone']]],
      ['SOFTWARE', [['src', 'Installation Source', 'Local media'], ['soft', 'Software Selection', SOFT.find(x => x[0] === i.soft)[1]]]],
      ['SYSTEM', [['dest', 'Installation Destination', i.destOk ? 'Automatic partitioning selected' : sel.length ? 'Automatic partitioning selected' : 'No disks selected', !i.destOk], ['kdump', 'KDUMP', 'Kdump is enabled'], ['net', 'Network & Host Name', cn.length ? `Wired (${cn.map(n => n.dev).join(', ')}) connected` : 'Not connected'], ['sec', 'Security Profile', 'No profile selected']]],
      ['USER SETTINGS', [['root', 'Root Password', i.rpSet ? 'Root password is set' : 'Root account is disabled', !i.rpSet && !i.usSet], ['user', 'User Creation', i.usSet ? `Administrator ${i.us.user} will be created` : 'No user will be created']]]];
  }
  const ready = t => { const i = st(t); return i.destOk && (i.rpSet || (i.usSet && i.us.admin)); };
  const head = (title, done = false) => `<div class="tp"><div><h2>${esc(title)}</h2>${done ? osB('done', 'Done', 'dn') : ''}</div><div class="rt">ROCKY LINUX 9.5 INSTALLATION<br><span class="kb">us</span><span class="hp">Help!</span></div></div>`;
  const frame = (body, extra = '') => `<div class="osx an"><div class="sb">ROCKY<br>LINUX<small>9.5</small></div><div class="mn">${body}</div>${extra}</div>`;

  function screen(t) {
    const i = st(t), w = W();
    if (i.s === 'grub' || i.s === 'trouble') { const L = ['Install Rocky Linux 9.5', 'Test this media & install Rocky Linux 9.5', 'Troubleshooting -->']; return `<div class="osx rg">${L.map((x, k) => osB('grub:' + k, esc(x), 'row' + (k === i.sel ? ' f' : ''))).join('')}<pre style="margin-top:${U(130)}">      Use the ▲ and ▼ keys to change the selection.
      Press 'e' to edit the selected item, or 'c' for a command prompt.
      The selected entry will be started automatically in ${Math.max(1, 60 - Math.floor(osAge(i.at)))}s.</pre></div>`; }
    if (i.s === 'check') return `<div class="osx lc"><pre class="lcl">${esc(['[  OK  ] Started Show Plymouth Boot Screen.', '[  OK  ] Reached target Basic System.', '         Starting checkisomd5@dev-sr0.service - Media check on /dev/sr0...', `/dev/sr0:   ${OSI.want(t).replace('.iso', '')}`, 'Fragment sums: 1f8f0b3e86c2d9a7...', `Checking: ${Math.min(100, osAge(i.at) / 3 * 100).toFixed(1).padStart(5, '0')}%`, '', 'Press [Esc] to abort check.'].join('\n'))}</pre></div>`;
    if (i.s === 'boot') return `<div class="osx lc"><pre class="lcl">${esc(['[  OK  ] Reached target System Initialization.', '[  OK  ] Started Anaconda NetworkManager configuration.', '[  OK  ] Started Network Manager.', '         Starting Terminate Plymouth Boot Screen...', '         Starting Anaconda System Services...', 'Starting installer, one moment...', 'anaconda 34.25.5.9-1.el9.rocky.0.1 for Rocky Linux 9.5 started.', ' * installation log files are stored in /tmp during the installation', ' * shell is available on TTY2', ' * when reporting a bug add logs from /tmp as separate text/plain attachments'].slice(0, 1 + Math.floor(osAge(i.at) * 4)).join('\n'))}</pre></div>`;
    if (i.s === 'welcome') return frame(`${head('')}<div class="bd"><p style="font-size:${U(26)};margin:${U(10)} 0 ${U(4)}">WELCOME TO ROCKY LINUX 9.5.</p><p>What language would you like to use during the installation process?</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:${U(14)}"><div class="lst">${['English', 'Deutsch', 'Español', 'Français', 'Italiano', 'Magyar', 'Polski', 'Português', 'Svenska', 'Türkçe', 'العربية'].map((x, k) => osB('lang:' + x, `${esc(x)}<small>${['English', 'German', 'Spanish', 'French', 'Italian', 'Hungarian', 'Polish', 'Portuguese', 'Swedish', 'Turkish', 'Arabic'][k]}</small>`, 'it' + (k === 0 ? ' on' : ''))).join('')}</div><div class="lst">${['English (United States)', 'English (United Kingdom)', 'English (India)', 'English (Australia)', 'English (Canada)', 'English (Ireland)'].map((x, k) => `<span class="it${k === 0 ? ' on' : ''}" style="display:block">${esc(x)}</span>`).join('')}</div></div></div><div class="bt">${b('quit', 'Quit')}${b('continue', 'Continue', 'abtn pri')}</div>`);
    if (i.s === 'hub') {
      const S = spokes(t);
      return frame(`${head('INSTALLATION SUMMARY')}<div class="bd"><div class="hub">${S.map(([h, L]) => `<h3>${h}</h3>${L.map(([k, l, s2, warn]) => osB('spoke:' + k, `${ic(k)}<span><b>${esc(l)}</b><i class="${warn ? 'w' : ''}">${warn ? '<span class="wi"></span>' : ''}${esc(s2)}</i></span>`, 'sp')).join('')}`).join('')}</div></div><div class="bt"><small>We won't touch your disks until you click 'Begin Installation'.</small>${b('quit', 'Quit')}${b('begin', 'Begin Installation', 'abtn pri' + (ready(t) ? '' : ' dis'))}</div>${ready(t) ? '' : '<div class="wb">Please complete items marked with this icon before continuing to the next step.</div>'}`);
    }
    if (i.s === 'dest') {
      const D = H().disks(t), sel = D.filter(d => i.picked[d.dev]), cap = sel.reduce((a, d) => a + d.bytes, 0);
      let dlg = '';
      if (i.dlg === 'opts') dlg = `<div class="ov"><div class="dlg"><h4>Installation options</h4><p>Your current Rocky Linux software selection requires <b>${i.soft === 'gui' ? '7.88' : '2.95'} GiB</b> of available space, including <b>${i.soft === 'gui' ? '4.42' : '1.06'} GiB</b> for software and <b>2.86 GiB</b> for swap space. The disks you've selected have the following amounts of free space:</p><p style="margin-left:${U(20)}"><b>0 B</b> Free space available for use.</p><p>You don't have enough space available to install Rocky Linux. You can shrink or remove existing partitions via our guided reclaim space tool, or you can adjust your partitions on your own in the custom partitioning interface.</p><div class="bt" style="padding:0">${b('cancel', 'Cancel & add more disks')}${b('reclaimgo', 'Reclaim space', 'abtn pri')}</div></div></div>`;
      if (i.dlg === 'reclaim') { const d = OSI.wantDisk(t), P = d.dev.startsWith('nvme') ? 'p' : ''; dlg = `<div class="ov"><div class="dlg"><h4>Reclaim disk space</h4><p>You can remove existing file systems you no longer need to free up space for this installation. Removing a file system will permanently delete all of the data it contains.</p><table style="width:100%;font-size:${U(13)};border-collapse:collapse"><tr style="text-align:left;color:#5A6266"><th>Disk</th><th>Reclaimable Space</th><th>Action</th></tr><tr><td><b>${esc(d.model)}</b> ${esc(d.dev)}</td><td>${gib(d.bytes)}</td><td>${i.del ? 'Delete' : 'Preserve'}</td></tr>${['efi', 'xfs /boot', 'lvmpv (rl)'].map((x, k) => `<tr><td style="padding-left:${U(16)}">${d.dev}${P}${k + 1} ${x}</td><td></td><td>${i.del ? 'Delete' : 'Preserve'}</td></tr>`).join('')}</table><p style="margin-top:${U(10)}">Total selected space to reclaim: <b>${i.del ? gib(d.bytes) : '0 B'}</b></p><div class="bt" style="padding:0">${b('delall', 'Delete all')}${b('cancel', 'Cancel')}${b('reclaim', 'Reclaim space', 'abtn pri' + (i.del ? '' : ' dis'))}</div></div></div>`; }
      return frame(`${head('INSTALLATION DESTINATION', true)}<div class="bd"><div class="sec">Device Selection</div><p style="margin:0">Select the device(s) you'd like to install to. They will be left untouched until you click on the main menu's "Begin Installation" button.</p><div class="sec">Local Standard Disks</div>${D.map(d => osB('disk:' + d.dev, `${DISKSVG}<b>${gib(d.bytes)}</b><span>${esc(d.model)}</span><small>${esc(d.dev)} / ${oldOn(t, d.dev) && !i.reclaimed ? '0 B' : gib(d.bytes)} free</small>${i.picked[d.dev] ? '<span class="ack">✓</span>' : ''}`, 'tile' + (i.picked[d.dev] ? ' on' : ''))).join('')}<p style="color:#5A6266;font-size:${U(12)}">Disks left unselected here will not be touched.</p><div class="sec">Specialized &amp; Network Disks</div>${b('adddisk', 'Add a disk...')}<div class="sec">Storage Configuration</div>${osB('auto:1', 'Automatic', 'rad' + (i.auto ? ' on' : ''))}${osB('auto:0', 'Custom', 'rad' + (i.auto ? '' : ' on'))}${osB('more', 'I would like to make additional space available.', 'achk')}${i.err ? `<p class="err">${esc(i.err)}</p>` : ''}</div><div class="bt"><small>${osPl(sel.length, 'disk')} selected; ${gib(cap)} capacity; ${gib(sel.filter(d => !oldOn(t, d.dev) || i.reclaimed).reduce((a, d) => a + d.bytes, 0))} free</small>${b('refresh', 'Refresh...')}</div>`, dlg);
    }
    if (i.s === 'net') {
      const L = H().nics(t), cur = L.find(n => n.dev === i.sel2) || L[0], c = i.net[cur.dev], stt = state(t, cur);
      let dlg = '';
      if (i.cf) {
        const f = i.cf;
        dlg = `<div class="ov"><div class="dlg"><h4>Editing ${esc(f.dev)}</h4><div class="tabs">${['General', 'Ethernet', '802.1X Security', 'DCB', 'Proxy', 'IPv4 Settings', 'IPv6 Settings'].map(x => `<span class="${x === 'IPv4 Settings' ? 'on' : ''}">${x}</span>`).join('')}</div><div class="fr"><span>Method</span>${osB('cmeth', `${f.mode === 'manual' ? 'Manual' : 'Automatic (DHCP)'} ▾`, 'abtn')}</div>${f.pop ? `<div style="position:absolute;left:${U(240)};top:${U(150)};background:#FFF;border:${U(1)} solid #8A9396;z-index:5">${[['dhcp', 'Automatic (DHCP)'], ['dhcpa', 'Automatic (DHCP) addresses only'], ['manual', 'Manual'], ['ll', 'Link-Local Only'], ['shared', 'Shared to other computers'], ['off', 'Disabled']].map(([k, l]) => osB('cmeth:' + k, esc(l), 'it')).join('')}</div>` : ''}${f.mode === 'manual' ? `<div class="sec">Addresses</div><div style="display:grid;grid-template-columns:repeat(3,1fr) auto;gap:${U(6)};align-items:center"><span>Address</span><span>Netmask</span><span>Gateway</span><span></span>${f.row ? `${osIn('c.addr', f.addr, { label: 'Address' })}${osIn('c.mask', f.mask, { label: 'Netmask' })}${osIn('c.gw', f.gw, { label: 'Gateway' })}${b('cdel', 'Delete')}` : `<span style="grid-column:1/4;color:#5A6266">No addresses</span>${b('cadd', 'Add')}`}</div><div class="fr"><span>DNS servers</span>${osIn('c.dns', f.dns, { label: 'DNS servers' })}<span>Search domains</span>${osIn('c.search', f.search || '', { label: 'Search domains' })}</div>` : `<p style="color:#5A6266">The address comes from a DHCP server. No DHCP server answers on this network.</p>`}${f.err ? `<p class="err">${esc(f.err)}</p>` : ''}<div class="bt" style="padding:0">${b('ccancel', 'Cancel')}${b('csave', 'Save', 'abtn pri')}</div></div></div>`;
      }
      return frame(`${head('NETWORK & HOST NAME', true)}<div class="bd"><div style="display:grid;grid-template-columns:${U(330)} 1fr;gap:${U(18)}"><div class="lst">${L.map(n => osB('nic:' + n.dev, `Ethernet (${esc(n.dev)})<small>${esc(n.vendor)} ${esc(n.model)}</small>`, 'it' + (n.dev === cur.dev ? ' on' : ''))).join('')}</div><div><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:${U(18)}">Ethernet (${esc(cur.dev)})<br><small style="font-size:${U(13)};color:${stt === 'Connected' ? '#3E8635' : '#5A6266'}">${stt}</small></span>${osB('sw:' + cur.dev, `<span class="${c.on ? '' : 'on'}">OFF</span><span class="${c.on ? 'on' : ''}">ON</span>`, 'sw')}</div><table style="margin-top:${U(14)};font-size:${U(13)}">${[['Hardware Address', cur.mac.toUpperCase()], ['Speed', cur.link ? `${cur.speed} Mb/s` : ''], ...(stt === 'Connected' ? [['IP Address', `${c.addr}/${prefixOf(c.mask)}`], ['Default Route', c.gw], ['DNS', c.dns]] : [])].map(([k, v]) => `<tr><td style="text-align:right;color:#5A6266;padding:${U(2)} ${U(10)} ${U(2)} 0">${k}</td><td>${esc(v)}</td></tr>`).join('')}</table><p style="text-align:right;margin-top:${U(110)}">${b('conf:' + cur.dev, 'Configure...')}</p></div></div><div style="display:flex;gap:${U(10)};align-items:center;margin-top:${U(16)}"><span>Host Name:</span>${osIn('host', i.host, { label: 'Host Name' })}${b('apply', 'Apply')}<span style="margin-left:auto">Current host name: <b>${esc(i.hostSet)}</b></span></div>${i.err ? `<p class="err">${esc(i.err)}</p>` : ''}</div>`, dlg);
    }
    if (i.s === 'soft') return frame(`${head('SOFTWARE SELECTION', true)}<div class="bd"><div style="display:grid;grid-template-columns:1fr 1fr;gap:${U(16)}"><div><div class="sec">Base Environment</div>${SOFT.map(([k, l, d]) => osB('soft:' + k, `<b>${esc(l)}</b><br><small style="color:#5A6266">${esc(d)}</small>`, 'rad' + (i.soft === k ? ' on' : ''))).join('')}</div><div><div class="sec">Additional software for Selected Environment</div>${['Debugging Tools', 'Performance Tools', 'Remote Management for Linux', 'Container Management', 'Headless Management', 'System Tools'].map(x => `<span class="achk" style="display:block;color:#5A6266">${x}</span>`).join('')}</div></div></div>`);
    if (i.s === 'root') return frame(`${head('ROOT PASSWORD', true)}<div class="bd"><p>The root account is used for administering the system. Enter a root password.</p><div class="fr"><span>Root Password:</span>${osIn('r.pw', i.rp.pw, { type: 'password', label: 'Root Password' })}<span>Confirm:</span>${osIn('r.pw2', i.rp.pw2, { type: 'password', label: 'Confirm' })}</div>${osB('r.lock', 'Lock root account', 'achk' + (i.rp.lock ? ' on' : ''))}${osB('r.ssh', 'Allow root SSH login with password', 'achk' + (i.rp.ssh ? ' on' : ''))}${i.err ? `<p class="err">${esc(i.err)}</p>` : ''}</div>`);
    if (i.s === 'user') return frame(`${head('CREATE USER', true)}<div class="bd"><div class="fr"><span>Full name</span>${osIn('u.name', i.us.name, { label: 'Full name' })}<span>User name</span>${osIn('u.user', i.us.user, { label: 'User name' })}</div><div style="margin-left:${U(202)}">${osB('u.admin', 'Make this user administrator', 'achk' + (i.us.admin ? ' on' : ''))}${osB('u.req', 'Require a password to use this account', 'achk' + (i.us.req ? ' on' : ''))}</div><div class="fr"><span>Password</span>${osIn('u.pw', i.us.pw, { type: 'password', label: 'Password' })}<span>Confirm password</span>${osIn('u.pw2', i.us.pw2, { type: 'password', label: 'Confirm password' })}</div><p style="margin-left:${U(202)}">${b('adv', 'Advanced...')}</p>${i.err ? `<p class="err">${esc(i.err)}</p>` : ''}</div>`);
    if (['kbd', 'lang', 'time', 'src', 'kdump', 'sec'].includes(i.s)) { const T2 = { kbd: 'KEYBOARD LAYOUT', lang: 'LANGUAGE SUPPORT', time: 'TIME & DATE', src: 'INSTALLATION SOURCE', kdump: 'KDUMP', sec: 'SECURITY PROFILE' }[i.s]; return frame(`${head(T2, true)}<div class="bd"><p>${{ kbd: 'English (US) is the layout of this keyboard.', lang: 'English (United States) is installed.', time: 'Region Americas, City New York. Network Time: on when the network is up.', src: 'Auto-detected installation media: the DVD image on the virtual CD (sr0), verified.', kdump: 'Kdump is enabled: memory is reserved for capturing a crash dump.', sec: 'No security profile: the default policy.' }[i.s]}</p><p style="color:#5A6266">The default is fine for this work order. Click Done.</p></div>`); }
    if (i.s === 'install') {
      const d = OSI.wantDisk(t), P = d.dev.startsWith('nvme') ? 'p' : '', msg = (PROG[Math.min(PROG.length - 1, i.p)] || '').replace('{d}', d.dev).replace('{p}', P);
      return frame(`${head('INSTALLATION PROGRESS')}<div class="bd">${i.done ? `<p style="font-size:${U(24)};margin-top:${U(150)}" class="ok2">Complete!</p><p>Rocky Linux is now successfully installed and ready for you to use!<br>Go ahead and reboot your system to start using it!</p>` : `<div class="pg" style="margin-top:${U(170)}"><i style="width:${(i.p / PROG.length * 100).toFixed(0)}%"></i></div><p>${esc(msg)}</p>`}</div><div class="bt">${i.done ? b('reboot', 'Reboot System', 'abtn pri') : ''}</div>`);
    }
    return '<div class="osx lc"></div>';
  }
  function validNet(t) {
    const i = st(t), w = W(), want = OSI.wantNic(t), c = i.net[want.dev], cn = connected(t);
    const wrong = H().nics(t).find(n => n.dev !== want.dev && i.net[n.dev].on && i.net[n.dev].mode === 'manual');
    if (wrong) return `${wrong.dev} is on with a static address${wrong.link ? '' : ', and it has no cable'}. The work order puts the address on ${want.dev}, ${want.label}, cabled to ${want.to}.`;
    if (!c.on) return `${want.dev} is OFF: switch it ON. It is ${want.label}, the port cabled to ${want.to}.`;
    if (c.mode !== 'manual') return `${want.dev} is on DHCP, and no DHCP server answers on this network. Configure..., IPv4 Settings, Method Manual.`;
    if (c.addr.trim() !== w.ip) return `${want.dev} has ${c.addr || 'no address'}: the work order gives ${w.ip}.`;
    if (prefixOf(c.mask) !== w.prefix) return `Netmask ${c.mask}: the work order's network is /${w.prefix} (${w.mask}).`;
    if (c.gw.trim() !== w.gw) return `Gateway ${c.gw || '(empty)'}: the work order gives ${w.gw}.`;
    if (!c.dns.split(/[,\s]+/).includes(w.dns)) return `DNS servers: the work order gives ${w.dns}.`;
    if (i.hostSet.split('.')[0].toLowerCase() !== w.host) return `Host name ${i.hostSet}: type ${w.host} and click Apply.`;
    if (!cn.find(n => n.dev === want.dev)) return `${want.dev} is not connected.`;
    return '';
  }
  function act(t, a) {
    const i = st(t), w = W(), [k, v] = a.split(/:(.*)/s);
    if (i.s === 'grub') { if (k !== 'grub') return; i.sel = +v; if (+v === 2) return say('info', 'Troubleshooting: rescue mode and memory tests. Not needed here.'); if (+v === 1) { go(t, 'check'); t.os.m.r_grub = true; return say('info', 'Test this media & install: the installer checks the image first (the default entry).'); } go(t, 'boot'); t.os.m.r_grub = true; return; }
    if (i.s === 'welcome') { if (k === 'lang' && v !== 'English') return say('info', `${v}: this lab runs in English.`); if (k === 'continue') { go(t, 'hub'); t.os.m.r_welc = true; } else if (k === 'quit') say('info', 'Quit restarts the server. Continue instead.'); return; }
    if (i.s === 'hub') {
      if (k === 'spoke') { go(t, v); if (v === 'dest' && !Object.keys(i.picked).length) i.picked = {}; if (v === 'net' && !i.sel2) i.sel2 = H().nics(t)[0].dev; return; }
      if (k === 'begin') { if (!ready(t)) return say('warn', 'Begin Installation is not available yet: complete the items marked with the warning icon.'); go(t, 'install'); i.p = 0; t.os.m.r_begin = true; return say('info', 'The installation starts: Anaconda partitions the disk and installs the packages.'); }
      if (k === 'quit') return say('info', 'Quit leaves the installer and restarts the server.'); return;
    }
    if (i.s === 'dest') {
      if (i.dlg === 'opts') { if (k === 'cancel') { i.dlg = null; return; } if (k === 'reclaimgo') { i.dlg = 'reclaim'; i.del = false; } return; }
      if (i.dlg === 'reclaim') { if (k === 'delall') { i.del = true; return; } if (k === 'cancel') { i.dlg = null; return; } if (k === 'reclaim') { if (!i.del) return say('warn', 'Choose Delete all first: the old system\'s partitions are removed.'); i.dlg = null; i.reclaimed = true; i.destOk = true; go(t, 'hub'); t.os.m.r_dest = true; return say('ok', 'The old system\'s partitions are marked for deletion: the disk is free for Rocky Linux. Nothing is erased until Begin Installation.'); } return; }
      if (k === 'disk') { i.picked[v] = !i.picked[v]; i.err = ''; return; }
      if (k === 'auto') { i.auto = v === '1'; if (!i.auto) say('info', 'Custom partitioning is not part of this lab: use Automatic.'); i.auto = true; return; }
      if (k === 'more') return say('info', 'Not needed: the reclaim dialog opens by itself if the disk is full.');
      if (k === 'adddisk' || k === 'refresh') return say('info', 'No SAN or network disks in this work order.');
      if (k === 'done') {
        const sel = Object.keys(i.picked).filter(x => i.picked[x]), wd = OSI.wantDisk(t);
        if (!sel.length) { i.destOk = false; go(t, 'hub'); return say('warn', 'No disks selected: the installer cannot start until you choose the installation destination.'); }
        if (sel.length > 1) { i.err = 'More than one disk is selected.'; return bad(`More than one disk is selected: automatic partitioning would spread the system over all of them, the data volume included. Select only ${wd.model} (${wd.dev}).`); }
        if (sel[0] !== wd.dev) { const d = disk(t, sel[0]); i.err = `${d.model} is selected.`; return bad(`${d.model} (${gib(d.bytes)}) is ${d.label}: installing there would erase it and leave the boot device empty. Select ${wd.model} (${gib(wd.bytes)}), ${wd.label}, and deselect the other disk.`); }
        if (oldOn(t, wd.dev) && !i.reclaimed) { i.dlg = 'opts'; return say('info', `${wd.model} still holds the old system: the installer offers to reclaim the space.`); }
        i.destOk = true; go(t, 'hub'); t.os.m.r_dest = true; return;
      }
      return;
    }
    if (i.s === 'net') {
      if (i.cf) {
        const f = i.cf;
        if (k === 'cmeth') { if (v) { f.mode = v === 'manual' ? 'manual' : 'dhcp'; f.pop = false; if (!['manual', 'dhcp'].includes(v)) say('info', 'Not that method here: Manual or Automatic (DHCP).'); } else f.pop = !f.pop; return; }
        if (k === 'cadd') { f.row = true; return; } if (k === 'cdel') { f.row = false; f.addr = ''; f.mask = ''; f.gw = ''; return; }
        if (k === 'ccancel') { i.cf = null; return; }
        if (k === 'csave') {
          if (f.mode === 'manual') {
            if (!f.row || osIp(f.addr) === null) { f.err = 'Add an address: a valid IPv4 address.'; return say('warn', f.err); }
            if (prefixOf(f.mask) < 1) { f.err = 'Netmask: a prefix (24) or a mask (255.255.255.0).'; return say('warn', f.err); }
            if (f.gw && (osIp(f.gw) === null || !osSameNet(f.gw, f.addr, prefixOf(f.mask)))) { f.err = 'Gateway: not in the address\'s network.'; return say('warn', f.err); }
          }
          Object.assign(i.net[f.dev], { mode: f.mode, addr: f.addr.trim(), mask: String(f.mask).trim(), gw: f.gw.trim(), dns: f.dns.trim() });
          i.cf = null; const n = H().nics(t).find(x => x.dev === f.dev);
          return say('ok', `${f.dev} saved: IPv4 ${f.mode === 'manual' ? `manual, ${f.addr}` : 'automatic (DHCP)'}.${i.net[f.dev].on ? ` It reconnects: ${state(t, n).toLowerCase()}.` : ' Switch it ON to connect.'}`);
        }
        return;
      }
      if (k === 'nic') { i.sel2 = v; return; }
      if (k === 'sw') { const c = i.net[v], n = H().nics(t).find(x => x.dev === v); c.on = !c.on; return say(c.on && state(t, n) !== 'Connected' ? 'warn' : 'info', c.on ? `${v}: ${!n.link ? 'cable unplugged: this port has no link' : state(t, n) === 'Connected' ? 'connected' : 'activation failed: DHCP got no answer. Configure a static address'}.` : `${v}: off.`); }
      if (k === 'conf') { const c = i.net[v]; i.cf = { dev: v, mode: c.mode, addr: c.addr, mask: c.mask, gw: c.gw, dns: c.dns, row: !!c.addr, err: '', pop: false }; return; }
      if (k === 'apply') { const h2 = i.host.trim(); if (!/^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(h2)) { i.err = 'The host name is not valid.'; return say('warn', i.err); } i.hostSet = h2; return say('ok', `Host name set: ${h2}.`); }
      if (k === 'done') { const e = validNet(t); if (e) { i.err = e; return bad(e); } i.netOk = true; go(t, 'hub'); t.os.m.r_net = true; return say('ok', `${OSI.wantNic(t).dev} connected: ${w.ip}/${w.prefix}; host name ${w.host}.`); }
      return;
    }
    if (i.s === 'soft') { if (k === 'soft') { i.soft = v; return; } if (k === 'done') { if (i.soft !== 'server') return bad(`${SOFT.find(x => x[0] === i.soft)[1]}: the work order asks for Server, without a graphical desktop.`); i.softOk = true; go(t, 'hub'); t.os.m.r_soft = true; } return; }
    if (i.s === 'root') {
      if (k === 'r.lock') { i.rp.lock = !i.rp.lock; return; } if (k === 'r.ssh') { i.rp.ssh = !i.rp.ssh; if (i.rp.ssh) say('warn', 'Root login over SSH with a password: avoid it. Log in as the administrator user and use sudo.'); return; }
      if (k === 'done') { const r = i.rp; if (!r.pw && !r.pw2) { go(t, 'hub'); return; } if (r.pw !== r.pw2) { i.err = 'The passwords do not match.'; return say('warn', i.err); } if (r.lock) return bad('Lock root account is ticked: the work order sets a root password. Untick it.'); if (r.pw !== OS_ACC.pw) return bad('That is not the root password in the work order.'); i.rpSet = true; go(t, 'hub'); t.os.m.r_root = true; } return;
    }
    if (i.s === 'user') {
      if (k === 'u.admin') { i.us.admin = !i.us.admin; return; } if (k === 'u.req') { i.us.req = !i.us.req; return; } if (k === 'adv') return say('info', 'Advanced: home directory, UID and groups. The defaults are fine.');
      if (k === 'done') { const u = i.us; if (!u.user.trim()) { go(t, 'hub'); return; } if (u.pw !== u.pw2) { i.err = 'The passwords do not match.'; return say('warn', i.err); } if (u.user.trim() !== OS_ACC.user) return bad(`User name ${u.user}: the work order's account is ${OS_ACC.user}.`); if (!u.admin) return bad('Tick Make this user administrator: the work order\'s account manages the server with sudo (the wheel group).'); if (u.pw !== OS_ACC.pw) return bad('That is not the password in the work order.'); i.usSet = true; go(t, 'hub'); t.os.m.r_user = true; } return;
    }
    if (['kbd', 'lang', 'time', 'src', 'kdump', 'sec'].includes(i.s)) { if (k === 'done') go(t, 'hub'); return; }
    if (i.s === 'install') { if (k === 'reboot' && i.done) { i.s = 'gone'; H().reboot(t); return say('info', 'Reboot System: the server restarts and boots Rocky Linux from its disk.'); } }
  }
  function key(t, k) {
    const i = st(t);
    if (i.s === 'grub') { if (k === 'Up') i.sel = Math.max(0, i.sel - 1); else if (k === 'Down') i.sel = Math.min(2, i.sel + 1); else if (k === 'Enter') act(t, 'grub:' + i.sel); return; }
    if (i.s === 'check' && k === 'Esc') { go(t, 'boot'); return say('info', 'Media check skipped.'); }
    if (k === 'Esc') { if (i.cf) { i.cf = null; return; } if (i.dlg) { i.dlg = null; return; } }
    if (k === 'Enter' && i.s === 'welcome') act(t, 'continue');
  }
  function tick(t) {
    const i = st(t);
    if (i.s === 'check') { if (osAge(i.at) > 3) { go(t, 'boot'); return true; } return true; }
    if (i.s === 'boot') { if (osAge(i.at) > 2.6) { go(t, 'welcome'); } return true; }
    if (i.s === 'install' && !i.done) {
      const p = Math.min(PROG.length, Math.floor(osAge(i.at) / 0.42)); if (p === i.p) return false; i.p = p;
      if (p >= PROG.length) {
        i.done = true; t.os.m.r_done = true; const n = OSI.wantNic(t), c = i.net[n.dev], conf = H().nics(t).find(x => i.net[x.dev].on && i.net[x.dev].mode === 'manual') || n, cc = i.net[conf.dev];
        t.os.sys = { os: 'rocky', disk: Object.keys(i.picked).find(x => i.picked[x]), iface: conf.dev, addr: cc.addr, prefix: prefixOf(cc.mask), gw: cc.gw, dns: cc.dns.split(/[,\s]+/)[0], host: i.hostSet.split('.')[0], user: i.us.user.trim(), name: i.us.name, pw: i.us.pw, rootPw: i.rpSet ? i.rp.pw : '', ssh: true, lvm: true, boots: 0 };
        say('ok', 'Complete! Rocky Linux is installed. Eject the ISO, then Reboot System.');
      }
      return true;
    }
    return false;
  }
  function field(t, f, v) {
    const i = st(t);
    if (f.startsWith('c.') && i.cf) i.cf[f.slice(2)] = v;
    else if (f === 'host') i.host = v;
    else if (f.startsWith('r.')) { i.rp[f.slice(2)] = v; i.err = ''; }
    else if (f.startsWith('u.')) { i.us[f.slice(2)] = v; i.err = ''; if (f === 'u.name' && !i.us.userTyped) i.us.user = v.toLowerCase().replace(/[^a-z0-9]/g, ''); if (f === 'u.user') i.us.userTyped = true; }
  }
  function cue(t) {
    const i = st(t), w = W(), n = OSI.wantNic(t), wd = OSI.wantDisk(t);
    switch (i.s) {
      case 'grub': return osC('osAct', 'grub:0', 'Choose Install Rocky Linux 9.5. (The default, Test this media, checks the image first.)');
      case 'check': case 'boot': return { say: 'Wait: the installer is starting.' };
      case 'welcome': return osC('osAct', 'continue', 'English is selected: click Continue.');
      case 'hub': {
        if (!i.destOk) return osC('osAct', 'spoke:dest', 'Click Installation Destination.');
        if (!i.netOk) return osC('osAct', 'spoke:net', 'Click Network & Host Name.');
        if (!i.softOk) return osC('osAct', 'spoke:soft', 'Click Software Selection.');
        if (!i.rpSet) return osC('osAct', 'spoke:root', 'Click Root Password.');
        if (!i.usSet) return osC('osAct', 'spoke:user', 'Click User Creation.');
        return osC('osAct', 'begin', 'Click Begin Installation.');
      }
      case 'dest': {
        if (i.dlg === 'opts') return osC('osAct', 'reclaimgo', 'Click Reclaim space: the old system is removed from the boot device.');
        if (i.dlg === 'reclaim') return i.del ? osC('osAct', 'reclaim', 'Click Reclaim space.') : osC('osAct', 'delall', 'Click Delete all.');
        const other = H().disks(t).find(d => d.dev !== wd.dev && i.picked[d.dev]); if (other) return osC('osAct', 'disk:' + other.dev, `Deselect ${other.model}: ${other.label}.`);
        if (!i.picked[wd.dev]) return osC('osAct', 'disk:' + wd.dev, `Select ${wd.model} (${gib(wd.bytes)}): ${wd.label}.`);
        return osC('osAct', 'done', 'Automatic partitioning: click Done.');
      }
      case 'net': {
        if (i.cf) {
          const f = i.cf; if (f.dev !== n.dev) return osC('osAct', 'ccancel', 'Cancel: this is not the work order\'s port.');
          if (f.mode !== 'manual') return f.pop ? osC('osAct', 'cmeth:manual', 'Choose Manual.') : osC('osAct', 'cmeth', 'Method: open the list.');
          if (!f.row) return osC('osAct', 'cadd', 'Addresses: click Add.');
          if (f.addr.trim() !== w.ip) return osF('c.addr', w.ip, `Address: ${w.ip}.`);
          if (prefixOf(f.mask) !== w.prefix) return osF('c.mask', String(w.prefix), `Netmask: ${w.prefix}.`);
          if (f.gw.trim() !== w.gw) return osF('c.gw', w.gw, `Gateway: ${w.gw}.`);
          if (f.dns.trim() !== w.dns) return osF('c.dns', w.dns, `DNS servers: ${w.dns}.`);
          return osC('osAct', 'csave', 'Click Save.');
        }
        const wrong = H().nics(t).find(x => x.dev !== n.dev && i.net[x.dev].on); if (wrong) return i.sel2 !== wrong.dev ? osC('osAct', 'nic:' + wrong.dev, `Select ${wrong.dev}: switch it off.`) : osC('osAct', 'sw:' + wrong.dev, `Switch ${wrong.dev} OFF: not the work order's port.`);
        const c = i.net[n.dev];
        if (i.sel2 !== n.dev) return osC('osAct', 'nic:' + n.dev, `Select ${n.dev}: ${n.label}, cabled to ${n.to}.`);
        if (c.mode !== 'manual' || c.addr !== w.ip || prefixOf(c.mask) !== w.prefix || c.gw !== w.gw || c.dns !== w.dns) return osC('osAct', 'conf:' + n.dev, 'Click Configure...: IPv4 Settings.');
        if (!c.on) return osC('osAct', 'sw:' + n.dev, 'Switch it ON.');
        if (i.host.trim() !== w.host && i.hostSet.split('.')[0] !== w.host) return osF('host', w.host, `Host Name: ${w.host}.`);
        if (i.hostSet.split('.')[0] !== w.host) return osC('osAct', 'apply', 'Click Apply.');
        return osC('osAct', 'done', 'Click Done.');
      }
      case 'soft': return i.soft !== 'server' ? osC('osAct', 'soft:server', 'Choose Server.') : osC('osAct', 'done', 'Click Done.');
      case 'root': return i.rp.lock ? osC('osAct', 'r.lock', 'Untick Lock root account.') : i.rp.pw !== OS_ACC.pw ? osF('r.pw', OS_ACC.pw, 'Root Password: the one in the work order.') : i.rp.pw2 !== OS_ACC.pw ? osF('r.pw2', OS_ACC.pw, 'Confirm it.') : osC('osAct', 'done', 'Click Done.');
      case 'user': { const u = i.us; return u.name !== OS_ACC.name ? osF('u.name', OS_ACC.name, `Full name: ${OS_ACC.name}.`) : u.user !== OS_ACC.user ? osF('u.user', OS_ACC.user, `User name: ${OS_ACC.user}.`) : !u.admin ? osC('osAct', 'u.admin', 'Tick Make this user administrator.') : u.pw !== OS_ACC.pw ? osF('u.pw', OS_ACC.pw, 'Password: the one in the work order.') : u.pw2 !== OS_ACC.pw ? osF('u.pw2', OS_ACC.pw, 'Confirm password.') : osC('osAct', 'done', 'Click Done.'); }
      case 'kbd': case 'lang': case 'time': case 'src': case 'kdump': case 'sec': return osC('osAct', 'done', 'Click Done.');
      case 'install': return i.done ? osC('osAct', 'reboot', 'Click Reboot System.') : { say: 'Wait: Anaconda installs Rocky Linux.' };
    }
    return null;
  }
  const steps = () => {
    const w = () => W(), n = () => OSI.wantNic(T), d = () => OSI.wantDisk(T), m = k => t => !!t.os.m[k];
    return [
      { text: 'Boot menu: Install Rocky Linux 9.5', hint: 'The default entry, Test this media & install, checks the image first: fine, but slower.', done: m('r_grub') },
      { text: 'Welcome: English, Continue', done: m('r_welc') },
      { get text() { return `Installation Destination: only ${d().model} (${d().dev}), Automatic`; }, get hint() { return `${d().label}. Deselect any other disk.${T && T.os && T.os.sys && T.os.sys.os === 'old' ? ' The old system is on it: Reclaim space, Delete all.' : ''}`; }, done: m('r_dest') },
      { get text() { return `Network & Host Name: ${n().dev} Manual ${w().ip}/${w().prefix}, gateway ${w().gw}, DNS ${w().dns}, ON; host name ${w().host}`; }, get hint() { return `${n().dev} is ${n().label}, cabled to ${n().to}. Configure..., IPv4 Settings, Method Manual, Add.`; }, done: m('r_net') },
      { text: 'Software Selection: Server', hint: 'Server with GUI is the default: it installs a desktop the server does not need.', done: m('r_soft') },
      { text: 'Root Password: the work order\'s', done: m('r_root') },
      { get text() { return `User Creation: ${OS_ACC.user}, administrator`; }, done: m('r_user') },
      { text: 'Begin Installation, and wait for "Complete!"', done: m('r_done') },
      { eject: true },
      { text: 'Reboot System', done: t => !!(t.os.sys && t.os.sys.os === 'rocky' && t.os.sys.boots > 0) }];
  };
  OSI.kinds.rocky = Object.assign({ fresh, screen, act, key, tick, field, cue, steps,
    notes: ['Boot menu: Install Rocky Linux 9.5', 'Welcome: language, Continue', 'Installation Destination: the boot device only, Automatic (Reclaim space if an old system is on it)', 'Network & Host Name: the port with a link, Manual IPv4, ON; host name, Apply', 'Software Selection: Server', 'Root Password, User Creation (administrator)', 'Begin Installation; at Complete!, eject the ISO and Reboot System'] }, OSI.linux('rocky'));
})();
