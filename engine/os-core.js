/* ============ 4b. Operating system install over virtual media, shared by every model ============
   A model pack describes its server to the operating system with Sim.osHost({...}): the processors, DIMMs, disks and
   network ports as an installed OS would see them (read from the twin, so they always match what the student built),
   the work order's network, the vendor's own ISO images, the label of the virtual CD in the boot menu, and how to
   restart the server. The pack mounts the ISO through its management controller (iLO HTML5 console, Cisco KVM) and
   offers a one-time boot (F11, F6); this module does the rest:
   - the ISO library on the laptop (Downloads), with look-alike wrong images;
   - booting: the one-time boot, the boot order (the installed OS first, then the virtual CD), a wrong image;
   - three installers, modelled on the real ones (os-ubuntu.js, os-rocky.js, os-esxi.js);
   - the installed system: its console and a shell that answers from the twin (os-shell.js), the ESXi DCUI;
   - the handover check (memory, CPU threads, boot disk, as the OS reports them), and the lab steps.
   Screens are drawn on a 1024 x 768 canvas (--u is one pixel of it), so they scale with the console window.
   File names of the ISO images follow the vendors' naming; versions are lab examples. ==== */
const OSI = { kinds: {}, test: {} };
const osU = n => `calc(var(--u)*${n})`;
const osH = () => REG().os || null;
const osNow = () => Date.now();
const osAge = at => at ? (osNow() - at) / 1000 : 1e9;
const osC = (act, arg, say) => ({ act, arg, say });
const osF = (field, value, say) => ({ field: 'os.' + field, value, say });
const osB = (arg, label, cls = '', extra = '') => `<button class="${cls}" data-act="osAct" data-arg="${esc(arg)}"${extra}>${label}</button>`;
const osK = (key, label, cls = 'k') => `<button class="${cls}" data-act="osKey" data-arg="${esc(key)}">${label}</button>`;
const osIn = (name, val, o = {}) => `<input class="osin${o.cls ? ' ' + o.cls : ''}" data-field="os.${esc(name)}" value="${esc(val == null ? '' : val)}" type="${o.type || 'text'}" autocomplete="off" spellcheck="false" aria-label="${esc(o.label || name)}"${o.enter ? ` data-enter="${o.enter}"` : ''}${o.ro ? ' readonly' : ''}>`;
const osPl = (n, w, ws) => `${n} ${n === 1 ? w : (ws || w + 's')}`;
const osIp = s => { const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(String(s || '').trim()); if (!m) return null; const p = m.slice(1).map(Number); return p.some(x => x > 255) ? null : ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]; };
const osMaskN = p => p ? ((0xFFFFFFFF << (32 - p)) >>> 0) : 0;
const osMaskP = m => { const n = osIp(m); if (n === null) return -1; let p = 0; while (p < 32 && (n >>> (31 - p)) & 1) p++; return osMaskN(p) === n ? p : -1; };
const osSameNet = (a, b, p) => { const x = osIp(a), y = osIp(b); return x !== null && y !== null && ((x & osMaskN(p)) >>> 0) === ((y & osMaskN(p)) >>> 0); };
// sizes as the tools print them: lsblk (binary, one decimal), the installers (GiB or TiB)
const osSize = (b, d = 1) => { const u = ['B', 'K', 'M', 'G', 'T', 'P']; let i = 0, v = b; while (v >= 1024 && i < 5) { v /= 1024; i++; } return (Math.round(v * 10 ** d) / 10 ** d) + u[i]; };
const osGiB = b => b / 1024 ** 3;

/* ---- the operating systems and the accounts of the work orders ---- */
const OS_META = {
  ubuntu: { name: 'Ubuntu Server 24.04.1 LTS', short: 'Ubuntu Server', entry: 'ubuntu', pretty: 'Ubuntu 24.04.1 LTS', kernel: '6.8.0-41-generic', flavor: 'linux' },
  rocky: { name: 'Rocky Linux 9.5', short: 'Rocky Linux', entry: 'Rocky Linux', pretty: 'Rocky Linux 9.5 (Blue Onyx)', kernel: '5.14.0-503.14.1.el9_5.x86_64', flavor: 'linux' },
  esxi: { name: 'VMware ESXi 8.0 Update 3', short: 'VMware ESXi', entry: 'VMware ESXi', pretty: 'VMware ESXi 8.0.3', build: '24022510', flavor: 'esxi' }
};
const OS_ACC = { name: 'Lab Admin', user: 'labadmin', pw: 'Train-OS-26!' };
// the laptop's Downloads folder: the right images and look-alikes (the vendor's own ESXi image comes from the pack)
const OS_ISOS = [
  { file: 'ubuntu-24.04.1-live-server-amd64.iso', os: 'ubuntu', size: '2.6 GB', date: '27/08/2024' },
  { file: 'ubuntu-24.04.1-desktop-amd64.iso', os: 'x', size: '5.8 GB', date: '27/08/2024', why: 'the Ubuntu Desktop image: it starts a live desktop session, not the server installer the work order asks for' },
  { file: 'Rocky-9.5-x86_64-dvd.iso', os: 'rocky', size: '10.9 GB', date: '18/11/2024' },
  { file: 'Rocky-9.5-x86_64-boot.iso', os: 'x', size: '1.1 GB', date: '18/11/2024', why: 'the Rocky Linux boot image: it holds the installer but no packages, so it needs a network repository. The work order asks for the full DVD image, for an install without a repository' },
  { file: 'Rocky-9.5-aarch64-dvd.iso', os: 'x', size: '10.2 GB', date: '18/11/2024', why: 'the ARM (aarch64) image of Rocky Linux: it does not boot on an x86-64 server' },
  { file: 'VMware-VMvisor-Installer-8.0U3-24022510.x86_64.iso', os: 'x', size: '0.6 GB', date: '25/06/2024', generic: true }];
OSI.isos = () => [...OS_ISOS, ...((osH() && osH().isos) || [])].sort((a, b) => a.file.localeCompare(b.file));
const osIso = f => OSI.isos().find(x => x.file === f) || null;
OSI.want = t => { const os = osSt(t).wo; return os === 'esxi' ? osH().isos.find(x => x.os === 'esxi').file : OS_ISOS.find(x => x.os === os).file; };
OSI.whyNot = (t, f) => {
  const x = osIso(f); if (!x) return 'not an image in the Downloads folder';
  if (x.file === OSI.want(t)) return '';
  if (x.generic) return osH().genericWhy;
  if (x.why) return x.why;
  return `the ${OS_META[x.os] ? OS_META[x.os].name : 'other'} image, not the ${OS_META[osSt(t).wo].name} image the work order asks for`;
};

/* ---- the state: t.os ---- */
// wo: the OS in the work order; media: the image on the virtual CD; next: a one-time boot ('cd', 'disk'); scr: what
// the OS screen shows ('inst' installer, 'sys' the installed system, 'bad' a wrong image); inst: the installer's state;
// sys: what is on the boot disk (null, { os: 'old' } the server's previous OS, or the new one); m: milestones the steps
// follow; ran: the checks run in the shell; rep: the handover check
function osSt(t) { return t.os; }
OSI.fresh = (wo, old) => ({ wo, media: null, next: null, scr: null, at: 0, inst: null, sys: old ? { os: 'old' } : null, m: {}, ran: {}, rep: { mem: '', thr: '', disk: '' }, repOk: false, term: null, dcui: null, cdBoots: 0, mountAt: 0, dlg: null, pick: null });
OSI.st = osSt;
OSI.on = t => !!t.os;
OSI.newSys = t => { const s = t.os; return !!(s && s.sys && s.sys.os !== 'old'); };
OSI.meta = os => OS_META[os];
OSI.acc = OS_ACC;
// the disk and network port the work order names (the pack marks them: boot, want)
OSI.wantDisk = t => osH().disks(t).find(d => d.boot);
OSI.wantNic = t => osH().nics(t).find(n => n.want);

/* ---- virtual media: the laptop's file dialog and the virtual CD ---- */
OSI.mount = (t, f) => {
  const s = osSt(t);
  if (s.scr === 'inst' && s.inst && !s.inst.done) return say('warn', 'Not now: the installer is reading from the image on the virtual CD. Eject it once the installation is complete.');
  s.media = f; s.mountAt = osNow(); s.dlg = null; s.pick = null;
  if (!s.sys || s.sys.os === 'old') Object.assign(s.m, { reset: false, f11: false, cd: false });
  const why = OSI.whyNot(t, f);
  if (why) return bad(`${f} is ${why}. Eject it and mount ${OSI.want(t)}.`);
  say('ok', `${f} is on the virtual CD/DVD-ROM. The server sees it as a USB CD drive, as if the DVD were in a drive at the server.`);
  return true;
};
OSI.eject = t => {
  const s = osSt(t); if (!s.media) return say('info', 'Nothing to eject: no image is on the virtual CD.');
  if (s.scr === 'inst' && s.inst && !s.inst.done) return say('warn', 'Not now: the installer is still reading from the image. Eject it once the installation is complete.');
  const f = s.media; s.media = null;
  say('ok', `${f} ejected: the virtual CD/DVD-ROM is empty.${OSI.newSys(t) ? ' The server now boots only from its own disk.' : ''}`);
};
// the laptop's file dialog: the pack opens it (its own Browse button), the student picks a file and confirms
OSI.fileDialog = (t, title, okLabel = 'Open') => {
  const s = osSt(t); if (!s.dlg) return '';
  const rows = OSI.isos().map(x => `<button class="osfr${s.pick === x.file ? ' on' : ''}" data-act="osPick" data-arg="${esc(x.file)}" role="option" aria-selected="${s.pick === x.file}"><span class="ic"></span><span class="n">${esc(x.file)}</span><span>${x.date}</span><span>${x.size}</span></button>`).join('');
  return `<div class="osfd" role="dialog" aria-label="${esc(title)}"><div class="osfw"><div class="osfh">${esc(title)}<button data-act="osDlg" data-arg="cancel" aria-label="Close">&times;</button></div>
<div class="osfp"><span>This PC</span><span>&rsaquo;</span><span>Downloads</span></div><div class="osfl" role="listbox"><div class="osfr hd"><span></span><span class="n">Name</span><span>Date modified</span><span>Size</span></div>${rows}</div>
<div class="osfb"><span>File name:</span><span class="fn">${esc(s.pick || '')}</span><span class="ty">Disk Image Files (*.iso)</span>${osBtn('osDlg', 'ok', okLabel, 'pri')}${osBtn('osDlg', 'cancel', 'Cancel')}</div></div></div>`;
};
const osBtn = (act, arg, label, cls = '') => `<button class="${cls}" data-act="${act}" data-arg="${esc(arg)}">${esc(label)}</button>`;
CORE.osPick = f => { const s = osSt(T); if (s && s.dlg) s.pick = f; };
CORE.osDlg = a => {
  const s = osSt(T), d = s && s.dlg; if (!d) return;
  if (a !== 'ok') { s.dlg = null; s.pick = null; return say('info', 'File dialog closed: nothing mounted.'); }
  if (!s.pick) return say('warn', 'Choose an image file first.');
  if (d.mount) { OSI.mount(T, s.pick); s.dlg = null; return; }
  d.file = s.pick; s.dlg = null; if (d.then) Sim.do(d.then, s.pick);
};
OSI.openDialog = (t, o = {}) => { const s = osSt(t); s.dlg = Object.assign({ mount: true }, o); s.pick = s.media || null; };

/* ---- booting ---- */
// the firmware's boot entries, in boot order: the installed OS, then the virtual CD with an image on it
OSI.bootList = t => {
  const s = osSt(t), h = osH(), L = [];
  if (s.sys) L.push({ id: 'disk', label: h.entry(s.sys.os === 'old' ? h.old.entry : OS_META[s.sys.os].entry), os: true });
  if (s.media) L.push({ id: 'cd', label: h.cdLabel });
  return L;
};
OSI.pickBoot = (t, id) => { const s = osSt(t); s.next = id; if (id === 'cd') s.m.f11 = true; };
OSI.reset = t => { const s = osSt(t); if (s.media && (!s.sys || s.sys.os === 'old' || !s.m.cd)) s.m.reset = true; s.scr = null; s.inst = s.inst && s.inst.done ? s.inst : null; if (s.term) s.term.mode = 'boot'; };
// the firmware hands over after POST: 'osi' (this module draws the screen), 'old' (the pack's own screen for the
// previous OS) or 'none' (no bootable device)
OSI.boot = t => {
  const s = osSt(t), next = s.next; s.next = null;
  if (s.media && (next === 'cd' || (!s.sys && next !== 'disk'))) {
    s.cdBoots++; s.m.cd = true; s.at = osNow();
    if (OSI.whyNot(t, s.media)) { s.scr = 'bad'; return 'osi'; }
    s.scr = 'inst'; s.inst = OSI.kinds[s.wo].fresh(t); return 'osi';
  }
  if (!s.sys) return 'none';
  if (s.sys.os === 'old') return 'old';
  s.scr = 'sys'; s.at = osNow(); OSI.kinds[s.sys.os].boot(t); return 'osi';
};
OSI.peek = t => { const s = t.os; if (!s) return null; if (s.media && (s.next === 'cd' || (!s.sys && s.next !== 'disk'))) return 'cd'; return s.sys ? 'disk' : 'none'; };
OSI.down = t => { const s = osSt(t); s.scr = null; };
// what the screen shows now, and the keys to send
OSI.active = t => !!(t.os && t.os.scr);
OSI.screen = t => {
  const s = osSt(t), k = OSI.kinds[s.scr === 'sys' ? s.sys.os : s.wo];
  if (s.scr === 'bad') return osBadScreen(t);
  return s.scr === 'inst' ? k.screen(t) : k.sysScreen(t);
};
OSI.thumb = t => { const s = osSt(t); return s.scr === 'bad' ? 'Boot failed: wrong image' : s.scr === 'inst' ? OS_META[s.wo].name + '\nInstaller' : s.scr === 'sys' ? OS_META[s.sys.os].pretty + '\n' + osH().net.host : ''; };
OSI.key = (t, k) => { const s = osSt(t); if (s.scr === 'bad') return say('info', 'This image does not start an installer. Eject it, mount the image in the work order and restart the server.'); const kd = OSI.kinds[s.scr === 'sys' ? s.sys.os : s.wo]; return s.scr === 'inst' ? kd.key(t, k) : kd.sysKey(t, k); };
OSI.act = (t, a) => { const s = osSt(t); if (!s.scr || s.scr === 'bad') return; const kd = OSI.kinds[s.scr === 'sys' ? s.sys.os : s.wo]; return s.scr === 'inst' ? kd.act(t, a) : kd.sysAct(t, a); };
OSI.field = (f, v) => { const s = osSt(T); if (!s) return; if (f.startsWith('rep.')) { s.rep[f.slice(4)] = v; return; } if (f === 'cmd') { if (s.term) s.term.cmd = v; return; } if (s.scr === 'sys') { const kd = OSI.kinds[s.sys.os]; if (kd.sysField) kd.sysField(T, f, v); return; } const kd = OSI.kinds[s.wo]; if (kd && kd.field && s.inst) kd.field(T, f, v); };
// timed screens (boot messages, install progress): true when something changed
OSI.tick = t => { if (!t.os || !t.os.scr || t.os.scr === 'bad') return false; const s = t.os, kd = OSI.kinds[s.scr === 'sys' ? s.sys.os : s.wo]; return !!(s.scr === 'inst' ? kd.tick && kd.tick(t) : kd.sysTick && kd.sysTick(t)); };
OSI.sig = t => { if (!t.os) return ''; const s = t.os, i = s.inst; return [s.scr, s.media, i && i.s, i && i.p, s.term && s.term.mode, s.dcui && s.dcui.s, s.sys && s.sys.boot].join(','); };
// extra keys for the console's key bar while an OS screen is up
OSI.keys = t => { const s = t.os; if (!s || !s.scr || s.scr === 'bad') return []; const kd = OSI.kinds[s.scr === 'sys' ? s.sys.os : s.wo]; return (s.scr === 'inst' ? kd.keyBar : kd.sysKeyBar) || []; };
// a keyboard event to a key name, while an OS screen has the focus
OSI.mapKey = e => {
  if (e.altKey && /^F[1-4]$/.test(e.key)) return 'Alt' + e.key;
  const m = { F1: 'F1', F2: 'F2', F5: 'F5', F9: 'F9', F11: 'F11', F12: 'F12', Escape: 'Esc', ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right', Tab: 'Tab', ' ': 'Space' };
  if (m[e.key]) return m[e.key];
  if (/^[yYnN]$/.test(e.key)) return e.key.toUpperCase();
  return null;
};
CORE.osAct = a => { if (T.os) OSI.act(T, a); };
CORE.osKey = k => { if (T.os && T.os.scr) OSI.key(T, k); };
CORE.osEnter = () => { if (T.os) OSI.term.enter(T); };
// Enter in a field of an installer or the DCUI: the screen's Enter (OK, Continue)
CORE.osKeyEnter = () => { if (T.os && T.os.scr) OSI.key(T, 'Enter'); };
// focus: the console's input (the shell, a login prompt) gets the keyboard
OSI.focus = () => { const ae = document.activeElement; if (ae && ae.matches && ae.matches('input:not(.osin), textarea')) return; const el = document.querySelector('#stage .osx input.osin.focus') || document.querySelector('#stage .osx input.osin'); if (el && ae !== el) { el.focus({ preventScroll: true }); const n = el.value.length; try { el.setSelectionRange(n, n); } catch (e) { } } };

/* ---- a wrong image on the virtual CD: what the firmware or the image shows ---- */
function osBadScreen(t) {
  const s = osSt(t), x = osIso(s.media) || {}, h = osH();
  let L;
  if (/aarch64/.test(x.file)) L = [`${h.cdLabel}`, '', 'Boot failed: the image has no x86-64 boot loader (EFI/BOOT/BOOTX64.EFI).', 'It was built for ARM64 (aarch64) processors.', '', 'No bootable device was found.'];
  else if (/desktop/.test(x.file)) L = ['Ubuntu 24.04.1 LTS (Noble Numbat): live desktop session', '', 'Starting the graphical desktop...', '', 'This is the desktop image: it runs Ubuntu from the DVD with a desktop,', 'and installs Ubuntu Desktop, not Ubuntu Server.'];
  else if (/boot\.iso/.test(x.file)) L = ['Rocky Linux 9.5 installer (boot image)', '', 'INSTALLATION SOURCE', '  Error setting up base repository', '', 'The boot image holds no packages: the installer needs a network repository,', 'and the work order asks for the DVD image.'];
  else if (x.generic) L = h.genericScreen;
  else L = [`${s.media}: ${OSI.whyNot(t, s.media)}.`];
  return `<div class="osx lc"><pre class="lcl">${esc(L.join('\n'))}</pre><div class="osnote">Training note: ${esc(s.media)} is not the image in the work order. Eject it, mount ${esc(OSI.want(t))} and restart the server with a one-time boot from the virtual CD.</div></div>`;
}

/* ---- the handover check: what the student reads in the OS, against the twin ---- */
OSI.view = o => Object.assign({
  render(t) {
    if (!t.os) return `<div class="oh cueable"><h3 style="margin-top:0">OS handover check</h3><p class="ohwait">This lab installs no operating system. The OS install labs (Lab menu) end here, with the handover check.</p></div>`;
    const s = osSt(t), h = osH(), m = OS_META[s.wo], w = h.net, done = s.repOk, linux = m.flavor === 'linux';
    const disks = h.disks(t), dk = d => linux ? d.dev : d.esx;
    const row = (k, v) => `<tr><th>${k}</th><td>${v}</td></tr>`;
    const card = `<section class="ohw"><div class="wo-n"><span>Work order</span><b>${esc(s.ref || 'OS-' + s.wo.toUpperCase())}</b></div><div class="wo-b"><p class="wo-gb">Install <b>${esc(m.name)}</b> on ${esc(h.product)} S/N ${esc(h.serial)}</p><table class="oht">${row('Image', `<code>${esc(OSI.want(t))}</code>`)}${row('Boot disk', esc(OSI.wantDisk(t).label))}${row('Host name', `<code>${esc(w.host)}</code>`)}${row('Network', `${esc(OSI.wantNic(t).label)} (${esc(OSI.wantNic(t).to)}): <code>${w.ip}/${w.prefix}</code>, gateway <code>${w.gw}</code>, DNS <code>${w.dns}</code>`)}${row('Accounts', linux ? `user <code>${OS_ACC.user}</code> (${OS_ACC.name}, administrator), password <code>${OS_ACC.pw}</code>${s.wo === 'rocky' ? '; root password the same' : ''}` : `root, password <code>${OS_ACC.pw}</code>`)}</table></div></section>`;
    const can = OSI.newSys(t) && s.ran.mem && s.ran.cpu && s.ran.disk;
    const f = (k, label, hint) => `<label class="ohf"><span>${label}</span>${osIn('rep.' + k, s.rep[k], { label })}<small>${hint}</small></label>`;
    const form = `<section class="ohc"><h3>Handover check</h3><p class="cap">Read these in the installed system${linux ? ' (lsmem or dmidecode, lscpu, lsblk)' : ' (esxcli hardware memory get, esxcli hardware cpu global get, esxcli storage core device list)'}, not from the work order: the handover records what the OS reports.</p>
${can ? `<div class="ohg">${f('mem', 'Memory installed, in GB', linux ? 'lsmem: Total online memory' : 'Physical Memory is in bytes: divide by 1024 three times')}${f('thr', 'Logical CPUs (threads)', linux ? 'lscpu: CPU(s)' : 'CPU Threads')}</div>
<div class="ohd"><span>Boot disk the OS was installed on</span><div>${disks.map(d => `<button class="${s.rep.disk === dk(d) ? 'on' : ''}" data-act="osRep" data-arg="disk:${esc(dk(d))}" aria-pressed="${s.rep.disk === dk(d)}"><code>${esc(dk(d))}</code><small>${esc(linux ? osSize(d.bytes) : Math.round(d.bytes / 1048576).toLocaleString('en-US') + ' MB')}</small></button>`).join('')}</div></div>
<p>${done ? '<b class="ohok">Handover recorded: the OS reports what was built.</b>' : osBtn('osRep', 'submit', 'Record the handover', 'pri')}</p>` : `<p class="ohwait">${OSI.newSys(t) ? 'Run the checks in the installed system first: memory, processors and disks.' : 'Install the operating system first.'}</p>`}</section>`;
    return `<div class="oh cueable">${card}${form}</div>`;
  },
  tray(t) {
    if (!t.os) return '';
    const s = osSt(t), m = OS_META[s.wo], kd = OSI.kinds[s.wo];
    return `<h2>${esc(m.name)}</h2><p class="cap">The installer and the installed system run on the server's screen: open it through ${esc(osH().bmc)} (${esc(osH().conName)}). This page records the handover.</p>${kd.notes ? `<h3>The installer, step by step</h3><ol class="rules" style="padding-left:20px">${kd.notes.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}`;
  }
}, o);
CORE.osRep = a => {
  const s = osSt(T), h = osH(); if (!s || s.repOk) return;
  if (a.startsWith('disk:')) { s.rep.disk = a.slice(5); return; }
  const linux = OS_META[s.wo].flavor === 'linux', mem = h.memGB(T), c = h.cpu(T), thr = c.sockets * c.cores * 2, d = OSI.wantDisk(T), dk = linux ? d.dev : d.esx;
  const n = v => parseInt(String(v).replace(/[^\d]/g, ''), 10);
  const e = [];
  if (n(s.rep.mem) !== mem) e.push(n(s.rep.mem) && n(s.rep.mem) < mem && n(s.rep.mem) > mem * 0.95 ? `Memory: ${n(s.rep.mem)} GB is what is left after the kernel's reservations (free). The installed memory is the sum of the DIMMs: lsmem, or dmidecode.` : `Memory: ${s.rep.mem || 'nothing'} GB is not what the OS reports.${linux ? '' : ' Physical Memory is in bytes: divide by 1024 three times (bytes, KiB, MiB, GiB).'}`);
  if (n(s.rep.thr) !== thr) e.push(n(s.rep.thr) === c.sockets * c.cores ? `Logical CPUs: ${n(s.rep.thr)} is the core count. With Hyper-Threading on, every core runs two threads.` : `Logical CPUs: ${s.rep.thr || 'nothing'} is not what the OS reports.`);
  if (s.rep.disk !== dk) e.push(!s.rep.disk ? 'Boot disk: choose the disk the OS was installed on.' : `Boot disk: the OS is not on ${s.rep.disk}. Check which disk holds the OS partitions (lsblk) or is the boot device (esxcli).`);
  if (e.length) return bad(e.join(' '));
  s.repOk = true; say('ok', `Handover recorded: ${mem} GB, ${thr} logical CPUs, the OS on ${dk}. It matches the build.`);
};

/* ---- the lab steps: the pack's own (open the console, mount, one-time boot, eject, read back) around the OS's ---- */
// P: { view, con(t, fn) the cue to reach the server's screen then fn, mount: steps, boot: steps, eject: step, readback: step }
OSI.steps = (os, P) => {
  const kd = OSI.kinds[os], on = fn => t => P.con(t, fn);
  // copy the steps with their getters (a step's text can depend on the twin)
  const wrap = s => { const d = Object.getOwnPropertyDescriptors(s), c = d.cue ? d.cue.value : null; delete d.cue; return Object.defineProperties({ view: P.view, cue: on(c || (t => OSI.cue(t))) }, d); };
  const inst = kd.steps().map(wrap), post = kd.postSteps().map(wrap);
  const ejectAt = inst.findIndex(s => s.eject);
  inst.splice(ejectAt, 1, P.eject);
  return [...P.mount, ...P.boot, ...inst, ...post, P.readback,
    { view: 'handover', text: 'Record the handover: memory, logical CPUs and boot disk, as the OS reports them', hint: 'The values the OS shows, not the work order: the handover proves the build and the install match.', done: t => !!osSt(t).repOk, cue: osRepCue }];
};
function osRepCue(t) {
  const s = osSt(t), h = osH(), linux = OS_META[s.wo].flavor === 'linux', c = h.cpu(t), d = OSI.wantDisk(t);
  if (String(s.rep.mem) !== String(h.memGB(t))) return osF('rep.mem', String(h.memGB(t)), `Type the memory the OS reported: ${h.memGB(t)} GB.`);
  if (String(s.rep.thr) !== String(c.sockets * c.cores * 2)) return osF('rep.thr', String(c.sockets * c.cores * 2), `Type the logical CPUs: ${c.sockets * c.cores * 2}.`);
  const dk = linux ? d.dev : d.esx; if (s.rep.disk !== dk) return osC('osRep', 'disk:' + dk, `Choose the boot disk: ${dk}.`);
  return osC('osRep', 'submit', 'Record the handover.');
}
// the next action on the OS screen, toward the work order
OSI.cue = t => { const s = osSt(t); if (s.scr === 'bad') return { say: 'This is the wrong image: eject it and mount the one in the work order.' }; if (!s.scr) return { say: 'Wait for the server to start.' }; const kd = OSI.kinds[s.scr === 'sys' ? s.sys.os : s.wo]; return s.scr === 'inst' ? kd.cue(t) : kd.sysCue(t); };
OSI.milestone = (t, k) => !!osSt(t).m[k];
// the lab's setup: the OS of the work order, the server's previous OS (a reinstall) or none (a new build)
OSI.init = (t, os, old) => { t.os = OSI.fresh(os, old); t.os.ref = `OS-${{ ubuntu: 'UBU2404', rocky: 'RKY95', esxi: 'ESX803' }[os]}-${osH().id.toUpperCase()}`; return t.os; };

/* ---- the styles of the OS screens and the handover page ---- */
(() => {
  if (document.getElementById('osi-css')) return;
  const s = document.createElement('style'); s.id = 'osi-css'; const U = osU;
  s.textContent = `.osx{position:absolute;inset:0;--u:calc(100cqw / 1024);overflow:hidden;background:#000;color:#D6D6D6;font:400 ${U(15)}/${U(19)} 'DejaVu Sans Mono','Liberation Mono','Courier New',monospace;text-align:left}
.osbox{position:relative;width:100%;aspect-ratio:4/3;container-type:inline-size;background:#000;overflow:hidden}
.osx button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;border-radius:0;text-align:left;line-height:inherit}
.osx input.osin{font:inherit;color:inherit;background:transparent;border:0;outline:none;padding:0;margin:0;min-width:0;caret-color:currentColor}
/* the cue ring stays inside the highlighted line: the text screens have no space between lines */
#stage .osx .cue,.osx .cue{outline:none!important;box-shadow:inset 0 0 0 ${U(3)} #FFB52E;animation:oscue 1.3s ease-in-out infinite!important}
@keyframes oscue{0%,100%{box-shadow:inset 0 0 0 ${U(3)} #FFB52E}50%{box-shadow:inset 0 0 0 ${U(3)} #FFE08A,inset 0 0 0 ${U(6)} rgba(255,181,46,.35)}}
.osx pre{margin:0;font:inherit;white-space:pre}
.osx .osnote{position:absolute;left:${U(16)};right:${U(16)};bottom:${U(14)};background:#3A2A00;color:#FFE08A;border:${U(1)} solid #B88A1A;padding:${U(8)} ${U(12)};font:500 ${U(13)}/1.35 var(--font);white-space:normal}
.lc{background:#000;color:#C8C8C8;padding:${U(6)} ${U(10)}}
.osx .lcl{white-space:pre-wrap;word-break:break-all}
.osx .lin{display:flex;white-space:pre}.osx .lin input{flex:1}
.osx .ent{color:#888;margin-left:${U(8)};border:${U(1)} solid #555!important;padding:0 ${U(6)}!important;font-size:${U(12)}!important}
.osfd{position:absolute;inset:0;z-index:9;background:rgba(10,14,18,.5);display:flex;align-items:flex-start;justify-content:center;padding:40px 10px}
.osfw{width:min(640px,100%);background:#FFF;color:#1C2226;border:1px solid #8A949B;box-shadow:0 12px 34px rgba(0,0,0,.5);font:13px/1.4 var(--font)}
.osfh{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#F1F3F4;border-bottom:1px solid #D2D7DA;font-weight:600}
.osfh button,.osfw .osfr,.osfw .osfb button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;text-align:left}
.osfh button{font-size:20px;line-height:1;padding:0 4px}
.osfp{display:flex;gap:8px;padding:7px 12px;color:#4A555C;border-bottom:1px solid #E3E7EA}
.osfl{max-height:300px;overflow:auto;padding:4px 0}
.osfw .osfr{display:grid;grid-template-columns:22px minmax(0,1fr) 92px 64px;gap:8px;align-items:center;width:100%;padding:5px 12px}
.osfw .osfr.hd{color:#5A666E;font-size:12px;cursor:default;border-bottom:1px solid #E3E7EA}
.osfw .osfr .n{overflow-wrap:anywhere}
.osfw .osfr:not(.hd):hover{background:#EEF4FA}.osfw .osfr.on{background:#CCE3F7}
.osfw .osfr .ic{width:16px;height:16px;border-radius:50%;border:2px solid #7C8A94;box-sizing:border-box;background:radial-gradient(circle,#FFF 30%,#C7CED3 32%)}
.osfb{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;gap:8px 10px;align-items:center;padding:10px 12px;border-top:1px solid #E3E7EA;background:#F7F8F9}
.osfb .fn{border:1px solid #9AA7B1;background:#FFF;padding:3px 7px;min-height:22px;overflow-wrap:anywhere}
.osfb .ty{grid-column:2;color:#5A666E;font-size:12px}
.osfw .osfb button{border:1px solid #9AA7B1;border-radius:3px;padding:5px 14px;background:#FFF}
.osfw .osfb button.pri{background:#1576C7;border-color:#1576C7;color:#FFF}
.oh{background:var(--label);color:var(--ink);padding:20px 22px 24px;min-height:480px;font-size:14.5px;line-height:1.5}
.ohw{display:grid;grid-template-columns:auto minmax(0,1fr);border:1px solid var(--line);border-radius:8px;overflow:hidden}
.ohw .wo-n{background:var(--bezel);color:#DDE6EC;padding:14px 16px;display:flex;flex-direction:column;justify-content:center;gap:2px}
.ohw .wo-n span{font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.8}.ohw .wo-n b{font:700 15px var(--mono);letter-spacing:.02em}
.ohw .wo-b{padding:12px 16px}.ohw .wo-gb{margin:0 0 6px;font-size:16px}
.oht{border-collapse:collapse;font-size:13.5px}.oht th{text-align:left;font-weight:600;padding:3px 14px 3px 0;vertical-align:top;white-space:nowrap;color:var(--muted)}.oht td{padding:3px 0}
.oh code{font:13px var(--mono);background:rgba(127,140,150,.14);padding:0 4px;border-radius:3px}
.ohc{margin-top:18px}.ohc h3{font:700 22px var(--display);margin:0 0 4px;letter-spacing:.01em}
.ohg{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px 18px;margin:12px 0}
.ohf{display:flex;flex-direction:column;gap:4px}.ohf span{font-weight:600}.ohf small{color:var(--muted);font-size:12.5px}
.ohf input{font:15px var(--mono);padding:7px 9px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);max-width:200px}
.ohd>span{display:block;font-weight:600;margin-bottom:6px}.ohd>div{display:flex;flex-wrap:wrap;gap:8px}
.ohd button{display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:7px 12px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);cursor:pointer;font:inherit;max-width:100%}
.ohd button code{background:none;padding:0;overflow-wrap:anywhere}.ohd button small{color:var(--muted)}.ohd button.on{border-color:#2E6FB4;box-shadow:0 0 0 2px rgba(46,111,180,.35)}
.oh .pri{font:600 14px var(--font);padding:9px 16px;border-radius:6px;border:1px solid #1F5F99;background:#2E6FB4;color:#FFF;cursor:pointer}
.oh .cue{outline:3px solid #E08A00;outline-offset:2px;animation:cuepulse 1.3s ease-in-out infinite}
.ohok{color:#1E7A45}.ohwait{color:var(--muted);font-style:italic}
@media (max-width:640px){.oh{padding:14px 12px 18px}.ohw{grid-template-columns:minmax(0,1fr)}.osfw .osfr{grid-template-columns:18px minmax(0,1fr) 54px}.osfw .osfr span:nth-child(3){display:none}}`;
  Sim.addCss(s, true);
})();
Sim.osHost = h => { REG().os = h; };
