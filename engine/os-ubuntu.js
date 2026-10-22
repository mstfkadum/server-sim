/* ---- Ubuntu Server 24.04 LTS: the Subiquity text installer, modelled on its screens (GRUB, language, keyboard, type
   of installation, network, proxy, mirror, guided storage, storage summary and the destructive-action confirmation,
   profile, Ubuntu Pro, SSH, featured snaps, install log, "Please remove the installation medium"). Keyboard driven in
   the real installer; here every item can also be clicked. ---- */
(() => {
  const U = osU;
  const css = document.createElement('style'); css.id = 'osi-ubuntu-css';
  css.textContent = `.sq{background:#000;color:#E6E6E6;display:flex;flex-direction:column}
.sq .hd{flex:none;height:${U(40)};display:flex;align-items:center;justify-content:space-between;padding:0 ${U(24)};background:#2C2C2C;border-bottom:${U(3)} solid #E95420;color:#FFF;font-weight:700}
.sq .hd span{font-weight:400;color:#DDD}
.sq .bd{flex:1;padding:${U(18)} ${U(56)} 0;overflow:hidden;position:relative}
.sq .bd p{margin:0 0 ${U(14)};white-space:normal;max-width:${U(880)}}
.sq .ft{flex:none;display:flex;flex-direction:column;align-items:center;gap:${U(2)};padding:${U(12)} 0 ${U(22)}}
.sq .b{white-space:pre;padding:0 ${U(2)}}.sq .b:hover{background:#3A3A3A}.sq .b.f{background:#E95420;color:#FFF}
.sq .row{display:block;white-space:pre;width:100%}.sq .row:hover{background:#262626}.sq .row.f{background:#E95420;color:#FFF}
.sq .dim{color:#9A9A9A}.sq .err{color:#FF6B57}.sq .ok{color:#7ED957}
.sq .fld{display:grid;grid-template-columns:${U(250)} ${U(420)};gap:${U(4)} ${U(10)};align-items:center;margin:${U(4)} 0}
.sq .fld>span{text-align:right;white-space:pre}
.sq .fld input.osin{background:#303030;color:#FFF;padding:0 ${U(6)};height:${U(19)}}
.sq .fld small{grid-column:2;color:#9A9A9A;font-size:${U(13)};white-space:normal}
.sq .dd{white-space:pre;background:#303030;padding:0 ${U(6)};display:inline-block}.sq .dd:hover{background:#444}
.sq .pop{position:absolute;z-index:3;background:#1E1E1E;border:${U(1)} solid #E95420;padding:${U(4)} 0;min-width:${U(360)}}
.sq .pop .row{padding:0 ${U(10)}}
.sq .ov{position:absolute;inset:${U(40)} 0 0;z-index:4;background:rgba(0,0,0,.55);display:flex;align-items:flex-start;justify-content:center;padding-top:${U(70)}}
.sq .dlg{background:#141414;color:#E6E6E6;border:${U(1)} solid #D6D6D6;padding:${U(14)} ${U(22)} ${U(16)};width:${U(720)};max-width:96%;box-sizing:border-box}
/* the title sits on the top line of the box, as urwid draws a titled box */
.sq .dlg h4{display:table;margin:${U(-24)} auto ${U(12)};padding:0 ${U(8)};background:#141414;font:inherit;font-weight:700;color:#FFF}
.sq .log{border:${U(1)} solid #555;height:${U(470)};padding:${U(6)} ${U(10)};overflow:hidden;white-space:pre;color:#CFCFCF}
.sq .grub{position:absolute;inset:0;background:#000;color:#CFCFCF;padding:${U(30)} ${U(60)}}
.sq .grub .box{border:${U(1)} solid #CFCFCF;margin:${U(18)} 0 ${U(10)};padding:${U(6)} 0;min-height:${U(250)}}
.sq .grub .row{padding:0 ${U(8)}}.sq .grub .row.f{background:#CFCFCF;color:#000}`;
  Sim.addCss(css, true);

  const st = t => t.os.inst, H = () => osH(), W = () => osH().net;
  const btn = (arg, label, f = false, w = 8) => `<button class="b${f ? ' f' : ''}" data-act="osAct" data-arg="${esc(arg)}">[ ${esc(label.padEnd(w))} ]</button>`;
  const row = (arg, text, f = false) => `<button class="row${f ? ' f' : ''}" data-act="osAct" data-arg="${esc(arg)}">${esc(text)}</button>`;
  const page = (title, body, foot, extra = '') => `<div class="osx sq"><div class="hd">${esc(title)}<span>[ Help ]</span></div><div class="bd">${body}</div><div class="ft">${foot}</div>${extra}</div>`;
  const doneBack = (doneLabel = 'Done') => btn('done', doneLabel, true) + btn('back', 'Back');
  const ORDER = ['lang', 'kbd', 'type', 'net', 'proxy', 'mirror', 'storage', 'summary', 'profile', 'pro', 'ssh', 'snaps', 'install'];
  const LANGS = ['Asturianu', 'Bahasa Indonesia', 'Català', 'Deutsch', 'English', 'English (UK)', 'Español', 'Français', 'Galego', 'Hrvatski', 'Latviešu', 'Lietuviškai', 'Magyar', 'Nederlands', 'Norsk bokmål', 'Polski', 'Português', 'Suomi', 'Svenska', 'Čeština', 'Ελληνικά', 'Русский', 'Українська'];
  const GRUB = ['Try or Install Ubuntu Server', 'Ubuntu Server with the HWE kernel', 'Boot from next volume', 'UEFI Firmware Settings'];
  const LOG = ['configuring apt', 'curtin command in-target', 'installing system', '  executing curtin install initial step', '  executing curtin install partitioning step', '    configuring storage', '      running \'curtin block-meta simple\'', '  executing curtin install extract step', '    writing install sources to disk', '      running \'curtin extract\'', '  executing curtin install curthooks step', '    configuring installed system', '    installing kernel', '    setting up swap', '    apply networking config', '    writing etc/fstab', '    configuring multipath', '    updating packages on target system', '    configuring pollinate user-agent on target', '    updating initramfs configuration', '    configuring target system bootloader', '      installing grub to target devices', 'final system configuration', '  configuring cloud-init', '  calculating extra packages to install', '  installing openssh-server', '  restoring apt configuration', 'downloading and installing security updates', 'copying logs to installed system'];
  const fresh = t => {
    const nets = {}; H().nics(t).forEach(n => { nets[n.dev] = { mode: 'dhcp', subnet: '', addr: '', gw: '', dns: '', search: '' }; });
    return { os: 'ubuntu', s: 'grub', at: osNow(), sel: 0, li: LANGS.indexOf('English'), type: 'server', net: nets, menu: null, edit: null, pop: null, disk: H().disks(t)[0].dev, entire: true, lvm: true, f: { name: '', host: '', user: '', pw: '', pw2: '' }, ferr: '', pro: 'skip', ssh: false, sshPw: true, p: 0, done: false, confirm: false };
  };
  const nic = (t, dev) => H().nics(t).find(n => n.dev === dev);
  const disk = (t, dev) => H().disks(t).find(d => d.dev === dev);
  const gib3 = b => osGiB(b) >= 1024 ? (osGiB(b) / 1024).toFixed(3) + 'T' : osGiB(b).toFixed(3) + 'G';
  const go = (t, s) => { const i = st(t); i.s = s; i.at = osNow(); i.menu = null; i.pop = null; i.edit = null; i.confirm = false; i.ferr = ''; };
  const ifStatus = (t, n) => { const c = st(t).net[n.dev]; if (!n.link) return 'not connected'; if (c.mode === 'manual' && c.addr) return `static ${c.addr}/${(c.subnet.split('/')[1] || '?')}`; if (c.mode === 'off') return 'disabled'; return 'DHCPv4 failed: no DHCP server answered'; };
  const configured = t => Object.values(st(t).net).some(c => c.mode === 'manual' && c.addr);

  /* ---- screens ---- */
  function screen(t) {
    const i = st(t), w = W();
    if (i.s === 'grub') return `<div class="osx sq"><div class="grub"><div style="text-align:center">GNU GRUB  version 2.12</div><div class="box">${GRUB.map((g, k) => row('grub:' + k, (k === i.sel ? '*' : ' ') + g, k === i.sel)).join('')}</div><pre>      Use the ▲ and ▼ keys to select which entry is highlighted.
      Press enter to boot the selected OS, \`e' to edit the commands
      before booting or \`c' for a command-line.
   The highlighted entry will be executed automatically in ${Math.max(1, 30 - Math.floor(osAge(i.at)))}s.</pre></div></div>`;
    if (i.s === 'boot') { const n = Math.min(14, 2 + Math.floor(osAge(i.at) * 6)); return `<div class="osx lc"><pre class="lcl">${esc(['[    0.000000] Linux version 6.8.0-41-generic (buildd@lcy02-amd64-100) (x86_64-linux-gnu-gcc-13 (Ubuntu 13.2.0-23ubuntu4) 13.2.0) #41-Ubuntu SMP PREEMPT_DYNAMIC', '[    0.000000] Command line: BOOT_IMAGE=/casper/vmlinuz ---', '[    0.000000] BIOS-provided physical RAM map:', `[    0.000000] DMI: ${H().vendor} ${H().product}, BIOS ${H().bios.ver} ${H().bios.date}`, '[    0.412306] smpboot: Allowing ' + H().cpu(t).sockets * H().cpu(t).cores * 2 + ' CPUs, 0 hotplug CPUs', '[    2.118035] Run /init as init process', '[    3.904112] systemd[1]: Detected architecture x86-64.', '[  OK  ] Mounted cdrom.mount - /cdrom.', '[  OK  ] Started casper-md5check.service - casper-md5check Verify Live ISO checksums.', '[  OK  ] Reached target network-pre.target - Preparation for Network.', '[  OK  ] Started systemd-networkd.service - Network Configuration.', '[  OK  ] Started snap.subiquity.subiquity-service.service - Service for snap application subiquity.subiquity-service.', '[  OK  ] Started serial-subiquity@ttyS0.service - Serial Subiquity.', '[  OK  ] Reached target getty.target - Login Prompts.'].slice(0, n).join('\n'))}</pre></div>`; }
    if (i.s === 'lang') return page('Willkommen! Bienvenue! Welcome! Добро пожаловать! Welkom!', `<p>Use UP, DOWN and ENTER keys to select your language.</p><div style="margin-left:${U(260)};width:${U(420)}">${LANGS.map((l, k) => row('lang:' + k, `[ ${l.padEnd(34)} ▸ ]`, k === i.li)).join('')}</div>`, '');
    if (i.s === 'kbd') return page('Keyboard configuration', `<p>Please select your keyboard layout below, or select "Identify keyboard" to detect your layout automatically.</p><div class="fld"><span>Layout:</span><span class="dd">English (US)                    ▾</span><span>Variant:</span><span class="dd">English (US)                    ▾</span></div><div style="margin:${U(18)} 0 0 ${U(260)}">${btn('ident', 'Identify keyboard', false, 17)}</div>`, doneBack());
    if (i.s === 'type') return page('Choose the type of installation', `<p>Choose the base for the installation.</p>${row('type:server', `(${i.type === 'server' ? 'X' : ' '})  Ubuntu Server`)}<p class="dim" style="margin-left:${U(54)}">The default install contains a curated selection of packages that should make it comfortable to manage your server.</p>${row('type:min', `(${i.type === 'min' ? 'X' : ' '})  Ubuntu Server (minimized)`)}<p class="dim" style="margin-left:${U(54)}">This version has been customized to have a small runtime footprint in environments where humans are not expected to log in.</p><p style="margin-top:${U(20)}">Additional options</p>${row('third', `[${i.third ? 'X' : ' '}]  Search for third-party drivers`)}`, doneBack());
    if (i.s === 'net') {
      const L = H().nics(t).map(n => `${row('if:' + n.dev, `[ ${n.dev.padEnd(14)} eth   ${n.link ? '-'.padEnd(20) : 'not connected'.padEnd(20)} ▸ ]`, i.menu === n.dev)}<div class="dim" style="margin-left:${U(36)};white-space:pre">${esc(ifStatus(t, n))}</div><div class="dim" style="margin-left:${U(36)};white-space:normal">${esc(n.mac)} / ${esc(n.vendor)} / ${esc(n.model)}</div><div style="height:${U(10)}"></div>`).join('');
      let extra = '';
      if (i.menu && !i.edit) extra = `<div class="pop" style="left:${U(470)};top:${U(150 + H().nics(t).findIndex(n => n.dev === i.menu) * 87)}">${['(close)', 'Info', 'Edit IPv4', 'Edit IPv6', 'Add a VLAN tag'].map(x => row('m:' + x, `  ${x}`)).join('')}</div>`;
      if (i.edit) {
        const e = i.edit, man = e.mode === 'manual';
        extra = `<div class="ov"><div class="dlg"><h4>Edit ${esc(i.edit.dev)} IPv4 configuration</h4><div class="fld"><span>IPv4 Method:</span><span>${row('meth', `[ ${({ dhcp: 'Automatic (DHCP)', manual: 'Manual', off: 'Disabled' })[e.mode].padEnd(22)} ▾ ]`)}</span>${man ? `<span>Subnet:</span>${osIn('n.subnet', e.subnet, { label: 'Subnet' })}<small>CIDR e.g. 192.168.9.0/24</small><span>Address:</span>${osIn('n.addr', e.addr, { label: 'Address' })}<span>Gateway:</span>${osIn('n.gw', e.gw, { label: 'Gateway' })}<span>Name servers:</span>${osIn('n.dns', e.dns, { label: 'Name servers' })}<small>IP addresses, comma separated</small><span>Search domains:</span>${osIn('n.search', e.search, { label: 'Search domains' })}<small>Domains, comma separated</small>` : ''}</div>${e.err ? `<p class="err">${esc(e.err)}</p>` : ''}${e.pop ? `<div class="pop" style="left:${U(300)};top:${U(70)}">${[['dhcp', 'Automatic (DHCP)'], ['manual', 'Manual'], ['off', 'Disabled']].map(([k, l]) => row('meth:' + k, `  ${l}`)).join('')}</div>` : ''}<div style="display:flex;flex-direction:column;align-items:center;margin-top:${U(14)}">${btn('save', 'Save', true)}${btn('cancel', 'Cancel')}</div></div></div>`;
      }
      return page('Network configuration', `<p>Configure at least one interface this server can use to talk to other machines, and which preferably provides sufficient access for updates.</p><div class="dim" style="white-space:pre;margin-left:${U(18)}">  NAME             TYPE  NOTES</div>${L}${row('bond', '[ Create bond ▸ ]')}`, btn('done', configured(t) ? 'Done' : 'Continue without network', true, 24) + btn('back', 'Back', false, 24), extra);
    }
    if (i.s === 'proxy') return page('Proxy configuration', `<p>If this system requires a proxy to connect to the internet, enter its details here.</p><div class="fld"><span>Proxy address:</span>${osIn('proxy', i.proxy || '', { label: 'Proxy address' })}<small>If you need to use a HTTP proxy to access the outside world, enter the proxy information here. Otherwise, leave this blank. The proxy information should be given in the standard form of "http://[[user][:pass]@]host[:port]/".</small></div>`, doneBack());
    if (i.s === 'mirror') return page('Ubuntu archive mirror configuration', `<p>If you use an alternative mirror for Ubuntu, enter its details here.</p><div class="fld"><span>Mirror address:</span>${osIn('mirror', i.mirror || 'http://archive.ubuntu.com/ubuntu/', { label: 'Mirror address' })}<small>You may provide an archive mirror to be used instead of the default.</small></div><p class="ok" style="margin-top:${U(20)}">This mirror location passed tests.</p><p class="dim">Get:1 http://archive.ubuntu.com/ubuntu noble InRelease [256 kB] ... Fetched 25.6 MB in 4s</p>`, doneBack());
    if (i.s === 'storage') {
      const d = disk(t, i.disk), lab = x => `${x.model.padEnd(36).slice(0, 36)} local disk  ${gib3(x.bytes)}`;
      const pop = i.pop === 'disk' ? `<div class="pop" style="left:${U(150)};top:${U(120)}">${H().disks(t).map(x => row('disk:' + x.dev, '  ' + lab(x))).join('')}</div>` : '';
      return page('Guided storage configuration', `<p>Configure a guided storage layout, or create a custom one:</p>${row('entire', `(${i.entire ? 'X' : ' '})  Use an entire disk`)}<div style="margin:${U(4)} 0 ${U(6)} ${U(54)}">${row('disk:open', `[ ${lab(d)} ▾ ]`)}</div><div style="margin-left:${U(54)}">${row('lvm', `[${i.lvm ? 'X' : ' '}]  Set up this disk as an LVM group`)}<div style="margin-left:${U(54)}" class="${i.lvm ? '' : 'dim'}">${row('enc', '[ ]  Encrypt the LVM group with LUKS')}</div></div><div style="height:${U(14)}"></div>${row('custom', `(${i.entire ? ' ' : 'X'})  Custom storage layout`)}${pop}`, doneBack());
    }
    if (i.s === 'summary') {
      const d = disk(t, i.disk), g = osGiB(d.bytes), vg = g - 3.049, P = d.dev.startsWith('nvme') ? 'p' : '';
      const fs = i.lvm ? [['/', '100.000G', 'new ext4', 'new LVM logical volume'], ['/boot', '2.000G', 'new ext4', 'new partition of local disk'], ['/boot/efi', '1.049G', 'new fat32', 'new partition of local disk']] : [['/', (g - 1.05).toFixed(3) + 'G', 'new ext4', 'new partition of local disk'], ['/boot/efi', '1.049G', 'new fat32', 'new partition of local disk']];
      const body = `<div style="white-space:pre"><b>FILE SYSTEM SUMMARY</b>
${fs.map(f => `  [ ${f[0].padEnd(12)} ${f[1].padStart(10)}  ${f[2].padEnd(10)} ${f[3].padEnd(28)} ▸ ]`).join('\n')}

<b>AVAILABLE DEVICES</b>
${i.lvm ? `  [ ${'ubuntu-vg (new)'.padEnd(40)} LVM volume group  ${vg.toFixed(3).padStart(10)}G ▸ ]\n    ${'free space'.padEnd(58)}${(vg - 100).toFixed(3).padStart(10)}G ▸` : '  No available devices'}
  [ Create software RAID (md) ▸ ]
  [ Create volume group (LVM) ▸ ]

<b>USED DEVICES</b>
${i.lvm ? `  [ ${'ubuntu-vg (new)'.padEnd(40)} LVM volume group  ${vg.toFixed(3).padStart(10)}G ▸ ]\n    ${'ubuntu-lv   new, to be formatted as ext4, mounted at /'.padEnd(58)}${'100.000G'.padStart(11)} ▸\n` : ''}  [ ${d.model.slice(0, 40).padEnd(40)} local disk        ${gib3(d.bytes).padStart(10)} ▸ ]
    ${`partition ${P}1  new, primary ESP, to be formatted as fat32, mounted at /boot/efi`.padEnd(58).slice(0, 72)}  1.049G ▸
${i.lvm ? `    ${`partition ${P}2  new, to be formatted as ext4, mounted at /boot`.padEnd(58)}${'2.000G'.padStart(10)} ▸\n    ${`partition ${P}3  new, PV of LVM volume group ubuntu-vg`.padEnd(58)}${(vg).toFixed(3).padStart(10)}G ▸` : `    ${`partition ${P}2  new, to be formatted as ext4, mounted at /`.padEnd(58)}${(g - 1.05).toFixed(3).padStart(10)}G ▸`}</div>`;
      const dlg = i.confirm ? `<div class="ov"><div class="dlg"><h4>Confirm destructive action</h4><p>Selecting Continue below will begin the installation process and result in the loss of data on the disks selected to be formatted.</p><p>You will not be able to return to this or a previous screen once the installation has started.</p><p>Are you sure you want to continue?</p><div style="display:flex;flex-direction:column;align-items:center">${btn('no', 'No')}${btn('continue', 'Continue', true)}</div></div></div>` : '';
      return page('Storage configuration', body, btn('done', 'Done', true) + btn('reset', 'Reset') + btn('back', 'Back'), dlg);
    }
    if (i.s === 'profile') {
      const f = i.f, pw = (k, l) => `<span>${l}</span>${osIn('f.' + k, f[k], { type: 'password', label: l.replace(':', '') })}`;
      return page('Profile configuration', `<p>Enter the username and password you will use to log in to the system. You can configure SSH access on a later screen if you need it.</p><div class="fld"><span>Your name:</span>${osIn('f.name', f.name, { label: 'Your name' })}<span>Your servers name:</span>${osIn('f.host', f.host, { label: 'Your servers name' })}<small>The name it uses when it talks to other computers.</small><span>Pick a username:</span>${osIn('f.user', f.user, { label: 'Pick a username' })}${pw('pw', 'Choose a password:')}${pw('pw2', 'Confirm your password:')}</div>${i.ferr ? `<p class="err" style="margin-left:${U(260)}">${esc(i.ferr)}</p>` : ''}`, btn('done', 'Done', true));
    }
    if (i.s === 'pro') return page('Upgrade to Ubuntu Pro', `<p>Upgrade this machine to Ubuntu Pro for security updates on a much wider range of packages, until 2034. Assists with FedRAMP, FIPS, STIG, HIPAA and other compliance or hardening requirements.</p>${row('pro:on', `(${i.pro === 'on' ? 'X' : ' '})  Enable Ubuntu Pro`)}${row('pro:skip', `(${i.pro === 'skip' ? 'X' : ' '})  Skip for now`)}<p class="dim" style="margin-left:${U(54)}">You can always enable Ubuntu Pro later via the 'pro attach' command.</p>`, btn('done', 'Continue', true) + btn('back', 'Back'));
    if (i.s === 'ssh') return page('SSH configuration', `<p>You can choose to install the OpenSSH server package to enable secure remote access to your server.</p>${row('ssh', `[${i.ssh ? 'X' : ' '}]  Install OpenSSH server`)}<div style="height:${U(10)}"></div>${row('sshpw', `[${i.sshPw ? 'X' : ' '}]  Allow password authentication over SSH`)}<div class="fld" style="margin-top:${U(10)}"><span>Import SSH key:</span><span class="dd">No                    ▾</span></div>`, doneBack());
    if (i.s === 'snaps') return page('Featured server snaps', `<p>These are popular snaps in server environments. Select or deselect with SPACE, press ENTER to see more details of the package, publisher and versions available.</p><div style="white-space:pre">${[['microk8s', 'Kubernetes for workstations and appliances'], ['nextcloud', 'Nextcloud Server - A safe home for all your data'], ['wekan', 'Open-Source kanban'], ['kata-containers', 'Build lightweight VMs that seamlessly plug into the c...'], ['docker', 'Docker container runtime'], ['canonical-livepatch', 'Canonical Livepatch Client'], ['rocketchat-server', 'Rocket.Chat server'], ['mosquitto', 'Eclipse Mosquitto MQTT broker'], ['etcd', 'Resilient key-value store by CoreOS'], ['powershell', 'PowerShell for every system!'], ['sabnzbd', 'SABnzbd'], ['wormhole', 'get things from one computer to another, safely'], ['aws-cli', 'Universal Command Line Interface for Amazon Web Services'], ['google-cloud-sdk', 'Google Cloud SDK'], ['prometheus', 'The Prometheus monitoring system and time series da...'], ['juju', 'Juju - a model-driven operator lifecycle manager for K8s and machines']].map(([n, d]) => `[ ] ${n.padEnd(22)} ${d}  ▸`).join('\n')}</div>`, doneBack());
    if (i.s === 'install') {
      const L = LOG.slice(0, i.p), done = i.done;
      return page(done ? 'Installation complete!' : 'Installing system', `<div class="log">${esc(L.slice(-23).join('\n'))}${done ? '' : '\n<span class="cur">_</span>'}</div>`, btn('log', 'View full log', false, 14) + (done ? btn('reboot', 'Reboot Now', true, 14) : btn('cancel', 'Cancel update and reboot', false, 14)));
    }
    if (i.s === 'remove') return `<div class="osx lc"><pre class="lcl">${esc(['[  OK  ] Stopped target network.target - Network.', '[  OK  ] Unmounted run-snapd-ns.mount - /run/snapd/ns.', '[FAILED] Failed unmounting cdrom.mount - /cdrom.', '[  OK  ] Reached target shutdown.target - System Shutdown.', '', '         Please remove the installation medium, then press ENTER: '].join('\n'))}${osB('enter', '[Enter]', 'ent')}</pre></div>`;
    return `<div class="osx lc"></div>`;
  }
  // a storage choice in words, for the messages
  const what = d => d.label;

  /* ---- actions ---- */
  function validNet(t) {
    const w = W(), want = OSI.wantNic(t), c = st(t).net[want.dev], other = H().nics(t).find(n => n.dev !== want.dev && st(t).net[n.dev].mode === 'manual' && st(t).net[n.dev].addr);
    if (other && !other.link) return `${other.dev} has no link: ${other.label} is not cabled. The work order's port is ${want.label}, ${want.dev}, cabled to ${want.to}.`;
    if (c.mode !== 'manual' || !c.addr) return other ? `The address is on ${other.dev} (${other.label}). The work order puts it on ${want.dev}, ${want.label}, cabled to ${want.to}: set ${want.dev} to Manual and the other one back to Automatic.` : `No interface has the work order's static address yet. Edit IPv4 of ${want.dev} (${want.label}, the port cabled to ${want.to}): Manual, ${w.ip}/${w.prefix}. No DHCP server answers on this network.`;
    if (c.addr.trim() !== w.ip) return `${want.dev} has ${c.addr}, but the work order gives ${w.ip}.`;
    if (c.subnet.trim() !== w.subnet) return `Subnet ${c.subnet || '(empty)'}: the work order's network is ${w.subnet}.`;
    if (c.gw.trim() !== w.gw) return `Gateway ${c.gw || '(empty)'}: the work order gives ${w.gw}.`;
    if (!c.dns.split(',').map(x => x.trim()).includes(w.dns)) return `Name servers: the work order gives ${w.dns}.`;
    return '';
  }
  function saveEdit(t) {
    const i = st(t), e = i.edit;
    if (e.mode === 'manual') {
      const m = /^(\d+\.\d+\.\d+\.\d+)\/(\d{1,2})$/.exec(e.subnet.trim());
      if (!m || osIp(m[1]) === null || +m[2] > 32) { e.err = 'Subnet: must be in CIDR form (a.b.c.d/xx).'; return say('warn', e.err); }
      if (osIp(e.addr) === null) { e.err = 'Address: not a valid IPv4 address.'; return say('warn', e.err); }
      if (!osSameNet(e.addr, m[1], +m[2])) { e.err = `Address: ${e.addr} is not contained in ${e.subnet}.`; return say('warn', e.err); }
      if (e.gw && (osIp(e.gw) === null || !osSameNet(e.gw, m[1], +m[2]))) { e.err = `Gateway: ${e.gw} is not contained in ${e.subnet}.`; return say('warn', e.err); }
    }
    Object.assign(i.net[e.dev], { mode: e.mode, subnet: e.subnet.trim(), addr: e.addr.trim(), gw: e.gw.trim(), dns: e.dns.trim(), search: e.search.trim() });
    i.edit = null; i.menu = null; say('ok', `${e.dev}: IPv4 ${e.mode === 'manual' ? `static ${e.addr}` : e.mode === 'dhcp' ? 'automatic (DHCP)' : 'disabled'}.`);
  }
  function startInstall(t) { const i = st(t); go(t, 'install'); i.p = 0; t.os.m.u_snaps = true; }
  function finish(t) {
    const i = st(t), n = OSI.wantNic(t), c = i.net[n.dev];
    i.done = true; t.os.m.u_done = true;
    const conf = H().nics(t).find(x => i.net[x.dev].mode === 'manual' && i.net[x.dev].addr) || n, cc = i.net[conf.dev];
    t.os.sys = { os: 'ubuntu', disk: i.disk, iface: conf.dev, addr: cc.addr, prefix: +(cc.subnet.split('/')[1] || 24), gw: cc.gw, dns: cc.dns, host: i.f.host.trim(), user: i.f.user.trim(), name: i.f.name, pw: i.f.pw, ssh: i.ssh, lvm: i.lvm, boots: 0 };
    say('ok', 'Installation complete! Ubuntu Server is on ' + i.disk + '. Eject the ISO, then Reboot Now.');
  }
  function act(t, a) {
    const i = st(t), w = W(), [k, v] = a.split(/:(.*)/s);
    if (i.s === 'grub') { if (k === 'grub') { i.sel = +v; if (+v >= 2) return say('info', `${GRUB[+v]}: not this one. Choose Try or Install Ubuntu Server.`); go(t, 'boot'); t.os.m.u_grub = true; return say('info', 'The installer starts from the ISO.'); } return; }
    if (i.s === 'lang') { if (k === 'lang') { i.li = +v; if (LANGS[+v] !== 'English') return say('info', `${LANGS[+v]}: this lab runs in English. Choose English.`); go(t, 'kbd'); } return; }
    if (k === 'back') { const j = ORDER.indexOf(i.s); if (j > 0 && i.s !== 'install' && i.s !== 'profile') go(t, ORDER[j - 1]); return; }
    switch (i.s) {
      case 'kbd': if (k === 'done') { go(t, 'type'); t.os.m.u_kbd = true; } else if (k === 'ident') say('info', 'Identify keyboard asks you to press keys to guess the layout. English (US) is already right.'); return;
      case 'type':
        if (k === 'type') { i.type = v; return; } if (k === 'third') { i.third = !i.third; return; }
        if (k === 'done') { if (i.type !== 'server') return bad('Ubuntu Server (minimized) leaves out the tools an administrator logs in to use. The work order asks for the default Ubuntu Server install.'); go(t, 'net'); t.os.m.u_type = true; } return;
      case 'net':
        if (i.edit) {
          const e = i.edit;
          if (k === 'meth') { if (v) { e.mode = v; e.pop = false; } else e.pop = !e.pop; return; }
          if (k === 'save') return saveEdit(t);
          if (k === 'cancel') { i.edit = null; i.menu = null; return; }
          return;
        }
        if (k === 'if') { i.menu = i.menu === v ? null : v; return; }
        if (k === 'm') {
          const dev = i.menu; if (!dev) return;
          if (v === '(close)') { i.menu = null; return; }
          if (v === 'Edit IPv4') { const c = i.net[dev]; i.edit = { dev, mode: c.mode, subnet: c.subnet, addr: c.addr, gw: c.gw, dns: c.dns, search: c.search, err: '', pop: false }; return; }
          if (v === 'Info') { const n = nic(t, dev); i.menu = null; return say('info', `${dev}: ${n.vendor} ${n.model}, ${n.mac}, driver ${n.drv}, ${n.link ? `link up (${n.speed / 1000} Gb/s), ${n.label} to ${n.to}` : `no link: ${n.label} has no cable`}.`); }
          i.menu = null; return say('info', `${v}: not needed for this work order.`);
        }
        if (k === 'bond') return say('info', 'Create bond: a bond of the two ports would survive a switch failure. Not in this work order: one static address on one port.');
        if (k === 'done') {
          if (!configured(t)) return bad(`No network is configured: no DHCP server answers on this network. Edit IPv4 of ${OSI.wantNic(t).dev} and give it the work order's static address.`);
          const e = validNet(t); if (e) return bad(e);
          go(t, 'proxy'); t.os.m.u_net = true; return say('ok', `${OSI.wantNic(t).dev}: static ${w.ip}/${w.prefix}, gateway ${w.gw}.`);
        }
        return;
      case 'proxy': if (k === 'done') go(t, 'mirror'); return;
      case 'mirror': if (k === 'done') { go(t, 'storage'); t.os.m.u_mirror = true; } return;
      case 'storage':
        if (k === 'entire') { i.entire = true; return; } if (k === 'custom') { i.entire = true; return say('info', 'Custom storage layout is not part of this lab: use the guided layout, an entire disk.'); }
        if (k === 'lvm') { i.lvm = !i.lvm; return; } if (k === 'enc') return say('info', 'Encryption asks for a passphrase at every boot. Not in this work order.');
        if (k === 'disk') { if (v === 'open') { i.pop = i.pop === 'disk' ? null : 'disk'; return; } i.disk = v; i.pop = null; return say('info', `Disk: ${disk(t, v).model}, ${gib3(disk(t, v).bytes)}: ${what(disk(t, v))}.`); }
        if (k === 'done') {
          const d = disk(t, i.disk), wd = OSI.wantDisk(t);
          if (d.dev !== wd.dev) return bad(`${d.model} (${gib3(d.bytes)}) is ${what(d)}: installing there would erase it and leave the boot device empty. The work order puts the OS on ${wd.model} (${gib3(wd.bytes)}), ${what(wd)}.`);
          go(t, 'summary'); t.os.m.u_disk = true; return;
        }
        return;
      case 'summary':
        if (i.confirm) { if (k === 'continue') { go(t, 'profile'); t.os.m.u_sum = true; return say('info', 'Confirmed: the installer partitions and formats the disk while you fill in the profile.'); } if (k === 'no') { i.confirm = false; return; } return; }
        if (k === 'done') { i.confirm = true; return; } if (k === 'reset') return say('info', 'Reset: back to the guided layout you chose.'); return;
      case 'profile':
        if (k === 'done') {
          const f = i.f; i.ferr = '';
          if (!f.name.trim() || !f.host.trim() || !f.user.trim() || !f.pw) { i.ferr = 'Fill in every field.'; return say('warn', 'Fill in every field: your name, the server name, the username and the password.'); }
          if (f.pw !== f.pw2) { i.ferr = 'Passwords do not match'; return say('warn', 'The two passwords do not match.'); }
          if (f.host.trim().toLowerCase() !== w.host) return bad(`Server name ${f.host}: the work order names this server ${w.host}. It becomes the host name on the network and in monitoring.`);
          if (f.user.trim() !== OS_ACC.user) return bad(`Username ${f.user}: the work order's account is ${OS_ACC.user}.`);
          if (f.pw !== OS_ACC.pw) return bad('That is not the password in the work order. Use it, so the team can log in; it is changed at handover to the system owner.');
          go(t, 'pro'); t.os.m.u_prof = true; return;
        }
        return;
      case 'pro': if (k === 'pro') { i.pro = v; if (v === 'on') say('info', 'Enable Ubuntu Pro needs a token from an Ubuntu Pro subscription. Not in this work order: skip it for now.'); return; } if (k === 'done') { if (i.pro !== 'skip') return bad('Ubuntu Pro needs a subscription token. The work order: Skip for now.'); go(t, 'ssh'); } return;
      case 'ssh': if (k === 'ssh') { i.ssh = !i.ssh; return; } if (k === 'sshpw') { i.sshPw = !i.sshPw; return; } if (k === 'done') { if (!i.ssh) return bad('The work order asks for remote access over SSH: tick Install OpenSSH server.'); go(t, 'snaps'); } return;
      case 'snaps': if (k === 'done') startInstall(t); return;
      case 'install': if (k === 'reboot' && i.done) { go(t, 'remove'); return; } if (k === 'log') return say('info', 'The full log is in /var/log/installer on the installed system.'); if (k === 'cancel') return say('info', 'Let the installation finish.'); return;
      case 'remove': if (k === 'enter') { i.s = 'gone'; H().reboot(t); return say('info', 'Enter: the server restarts and boots Ubuntu from its disk.'); } return;
    }
  }
  function key(t, k) {
    const i = st(t);
    if (i.s === 'grub') { if (k === 'Up') i.sel = Math.max(0, i.sel - 1); else if (k === 'Down') i.sel = Math.min(GRUB.length - 1, i.sel + 1); else if (k === 'Enter') act(t, 'grub:' + i.sel); return; }
    if (i.s === 'lang') { if (k === 'Up') i.li = Math.max(0, i.li - 1); else if (k === 'Down') i.li = Math.min(LANGS.length - 1, i.li + 1); else if (k === 'Enter') act(t, 'lang:' + i.li); return; }
    if (i.s === 'remove') { if (k === 'Enter') act(t, 'enter'); return; }
    if (k === 'Esc') { if (i.edit) return act(t, 'cancel'); if (i.menu || i.pop) { i.menu = null; i.pop = null; return; } if (i.confirm) { i.confirm = false; return; } return act(t, 'back'); }
    if (k === 'Enter') { if (i.edit) return act(t, 'save'); if (i.confirm) return act(t, 'continue'); if (i.s === 'install') return i.done ? act(t, 'reboot') : undefined; return act(t, 'done'); }
  }
  function tick(t) {
    const i = st(t);
    if (i.s === 'boot' && osAge(i.at) > 2.6) { go(t, 'lang'); return true; }
    if (i.s === 'boot') return true;
    if (i.s === 'install' && !i.done) { const p = Math.min(LOG.length, Math.floor(osAge(i.at) / 0.32)); if (p !== i.p) { i.p = p; if (p >= LOG.length) finish(t); return true; } }
    return false;
  }
  function field(t, f, v) {
    const i = st(t);
    if (f.startsWith('n.') && i.edit) i.edit[f.slice(2)] = v;
    else if (f.startsWith('f.')) { i.f[f.slice(2)] = v; i.ferr = ''; }
    else if (f === 'proxy' || f === 'mirror') i[f] = v;
  }
  /* ---- the next action toward the work order ---- */
  function cue(t) {
    const i = st(t), w = W(), n = OSI.wantNic(t);
    switch (i.s) {
      case 'grub': return osC('osAct', 'grub:0', 'Choose Try or Install Ubuntu Server (or press Enter).');
      case 'boot': return { say: 'Wait: the installer is starting from the ISO.' };
      case 'lang': return osC('osAct', 'lang:' + LANGS.indexOf('English'), 'Choose English.');
      case 'kbd': return osC('osAct', 'done', 'Keyboard: English (US) is right. Choose Done.');
      case 'type': return i.type !== 'server' ? osC('osAct', 'type:server', 'Choose Ubuntu Server.') : osC('osAct', 'done', 'Ubuntu Server: choose Done.');
      case 'net': {
        if (i.edit) {
          const e = i.edit;
          if (e.dev !== n.dev) return e.mode === 'manual' ? (e.pop ? osC('osAct', 'meth:dhcp', 'Choose Automatic (DHCP).') : osC('osAct', 'meth', `${e.dev} is not the work order's port: set IPv4 Method back to Automatic (DHCP).`)) : osC('osAct', 'save', 'Save.');
          if (e.mode !== 'manual') return e.pop ? osC('osAct', 'meth:manual', 'Choose Manual.') : osC('osAct', 'meth', 'IPv4 Method: open the list.');
          if (e.subnet.trim() !== w.subnet) return osF('n.subnet', w.subnet, `Subnet: ${w.subnet}.`);
          if (e.addr.trim() !== w.ip) return osF('n.addr', w.ip, `Address: ${w.ip}.`);
          if (e.gw.trim() !== w.gw) return osF('n.gw', w.gw, `Gateway: ${w.gw}.`);
          if (e.dns.trim() !== w.dns) return osF('n.dns', w.dns, `Name servers: ${w.dns}.`);
          return osC('osAct', 'save', 'Save.');
        }
        const bad2 = H().nics(t).find(x => x.dev !== n.dev && i.net[x.dev].mode === 'manual');
        if (bad2) return i.menu === bad2.dev ? osC('osAct', 'm:Edit IPv4', `Edit IPv4 of ${bad2.dev}: set it back to Automatic (DHCP).`) : osC('osAct', 'if:' + bad2.dev, `${bad2.dev} is not the work order's port: open it and set it back to Automatic.`);
        if (validNet(t)) return i.menu === n.dev ? osC('osAct', 'm:Edit IPv4', 'Choose Edit IPv4.') : i.menu ? osC('osAct', 'm:(close)', 'Close this menu.') : osC('osAct', 'if:' + n.dev, `Choose ${n.dev}: ${n.label}, the port with a link to ${n.to}.`);
        return osC('osAct', 'done', 'Choose Done.');
      }
      case 'proxy': return osC('osAct', 'done', 'No proxy: choose Done.');
      case 'mirror': return osC('osAct', 'done', 'The default mirror: choose Done.');
      case 'storage': { const wd = OSI.wantDisk(t); if (i.pop === 'disk') return osC('osAct', 'disk:' + wd.dev, `Choose ${wd.model} (${gib3(wd.bytes)}): ${what(wd)}.`); if (i.disk !== wd.dev) return osC('osAct', 'disk:open', `The disk offered is not the boot device: open the disk list.`); if (!i.lvm) return osC('osAct', 'lvm', 'Tick Set up this disk as an LVM group.'); return osC('osAct', 'done', 'Choose Done.'); }
      case 'summary': return i.confirm ? osC('osAct', 'continue', 'Choose Continue: the disk is erased and the installation starts.') : osC('osAct', 'done', 'Check the summary: the OS on the boot device. Choose Done.');
      case 'profile': { const f = i.f; return f.name !== OS_ACC.name ? osF('f.name', OS_ACC.name, `Your name: ${OS_ACC.name}.`) : f.host !== w.host ? osF('f.host', w.host, `Your servers name: ${w.host}.`) : f.user !== OS_ACC.user ? osF('f.user', OS_ACC.user, `Pick a username: ${OS_ACC.user}.`) : f.pw !== OS_ACC.pw ? osF('f.pw', OS_ACC.pw, 'Choose a password: the one in the work order.') : f.pw2 !== OS_ACC.pw ? osF('f.pw2', OS_ACC.pw, 'Confirm your password.') : osC('osAct', 'done', 'Choose Done.'); }
      case 'pro': return i.pro !== 'skip' ? osC('osAct', 'pro:skip', 'Skip for now.') : osC('osAct', 'done', 'Choose Continue.');
      case 'ssh': return !i.ssh ? osC('osAct', 'ssh', 'Tick Install OpenSSH server.') : osC('osAct', 'done', 'Choose Done.');
      case 'snaps': return osC('osAct', 'done', 'No snaps: choose Done. The installation runs.');
      case 'install': return i.done ? osC('osAct', 'reboot', 'Choose Reboot Now.') : { say: 'Wait: the installer writes the system to the disk.' };
      case 'remove': return osC('osAct', 'enter', 'Press Enter: the server restarts.');
    }
    return null;
  }
  const steps = () => {
    const w = () => W(), n = () => OSI.wantNic(T), d = () => OSI.wantDisk(T), m = k => t => !!t.os.m[k];
    return [
      { text: 'Boot menu: Try or Install Ubuntu Server', hint: 'The ISO\'s own boot menu (GRUB). It starts the highlighted entry by itself after 30 seconds.', done: m('u_grub') },
      { text: 'Language English, keyboard English (US): Done', done: m('u_kbd') },
      { text: 'Type of installation: Ubuntu Server, Done', done: m('u_type') },
      { get text() { return `Network: ${n().dev}, Edit IPv4, Manual: ${w().ip}/${w().prefix}, gateway ${w().gw}, name server ${w().dns}`; }, get hint() { return `${n().dev} is ${n().label}, cabled to ${n().to}. No DHCP server answers on this network, so DHCP fails on every port.`; }, done: m('u_net') },
      { text: 'Proxy: none. Archive mirror: the default. Done twice', done: m('u_mirror') },
      { get text() { return `Storage: Use an entire disk, ${d().model}, LVM`; }, get hint() { return `The boot device: ${d().label}. Check the disk the installer offers first.`; }, done: m('u_disk') },
      { text: 'Storage summary: Done, then Continue (destructive action)', hint: 'From here the disk is erased: the installation starts while you fill in the profile.', done: m('u_sum') },
      { get text() { return `Profile: server name ${w().host}, user ${OS_ACC.user}, the work order's password`; }, done: m('u_prof') },
      { text: 'Ubuntu Pro: Skip for now. SSH: Install OpenSSH server. Snaps: none', done: m('u_snaps') },
      { text: 'Wait for "Installation complete!"', done: m('u_done') },
      { eject: true },
      { text: 'Reboot Now, then press Enter at "Please remove the installation medium"', hint: 'The ISO is already ejected: the server boots from its own disk.', done: t => !!(t.os.sys && t.os.sys.os === 'ubuntu' && t.os.sys.boots > 0) }];
  };
  OSI.kinds.ubuntu = Object.assign({ fresh, screen, act, key, tick, field, cue, steps,
    notes: ['GRUB: Try or Install Ubuntu Server', 'Language, keyboard, type of installation', 'Network: static IPv4 on the port with a link (Edit IPv4, Manual)', 'Proxy and mirror: defaults', 'Storage: an entire disk, the boot device, LVM', 'Summary, then Continue: the disk is erased', 'Profile: name, server name, username, password', 'Ubuntu Pro: skip; SSH: install OpenSSH server', 'Wait for Installation complete!, eject the ISO, Reboot Now'] }, OSI.linux('ubuntu'));
})();
