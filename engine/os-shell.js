/* ---- The console of an installed system: a login prompt and a shell that answers from the twin. The hardware the
   commands report (memory, processors, disks, network ports and their links) is what the student built and cabled; the
   network settings are the ones typed in the installer. Only the checks an engineer runs after an install are
   modelled; other commands answer as a minimal system would. ---- */
const OS_OUT = new WeakMap();                 // the console output, kept out of the saved state (it can be long)
OSI.term = {
  out(t) { const tm = t.os.term; if (!OS_OUT.has(tm)) OS_OUT.set(tm, []); return OS_OUT.get(tm); },
  print(t, lines) { const o = OSI.term.out(t); (Array.isArray(lines) ? lines : String(lines).split('\n')).forEach(l => o.push(l)); if (o.length > 400) o.splice(0, o.length - 400); },
  clear(t) { OSI.term.out(t).length = 0; },
  fresh(t, banner) { t.os.term = { mode: 'login', user: '', root: false, cmd: '', tries: 0, pend: null, sudoOk: false, hist: [] }; OSI.term.print(t, banner); },
  // the prompt the shell shows now
  prompt(t) { const tm = t.os.term, kd = OSI.kinds[t.os.sys.os]; return tm.mode === 'login' ? `${kd.loginHost(t)} login: ` : tm.mode === 'pw' ? 'Password: ' : tm.mode === 'sudo' ? `[sudo] password for ${tm.user}: ` : tm.mode === 'su' ? 'Password: ' : kd.prompt(t); },
  screen(t, cls = 'lc') {
    const tm = t.os.term, out = OSI.term.out(t), secret = ['pw', 'sudo', 'su'].includes(tm.mode);
    return `<div class="osx ${cls}"><pre class="lcl">${esc(out.slice(-34).join('\n'))}</pre><div class="lin"><span>${esc(OSI.term.prompt(t))}</span>${osIn('cmd', tm.cmd, { type: secret ? 'password' : 'text', label: secret ? 'Password' : 'Console input', enter: 'osEnter', cls: 'focus' })}<button class="ent" data-act="osEnter" data-arg="">Enter</button></div></div>`;
  },
  enter(t) {
    const s = t.os, tm = s.term; if (!tm || !s.sys || s.scr !== 'sys' || ['boot', 'off'].includes(tm.mode)) return;
    const kd = OSI.kinds[s.sys.os], line = tm.cmd; tm.cmd = '';
    const P = OSI.term.prompt(t), secret = ['pw', 'sudo', 'su'].includes(tm.mode);
    OSI.term.print(t, P + (secret ? '' : line));
    if (tm.mode === 'login') { if (!line.trim()) return; tm.user = line.trim(); tm.mode = 'pw'; return; }
    if (tm.mode === 'pw') {
      const ok = kd.auth(t, tm.user, line);
      if (!ok) { tm.mode = 'login'; OSI.term.print(t, ['', 'Login incorrect']); tm.tries++; return say('warn', tm.tries > 1 ? `Login incorrect: the account is ${kd.acct(t)}, with the work order's password.` : 'Login incorrect: check the user name and the password.'); }
      tm.mode = 'sh'; tm.root = tm.user === 'root'; tm.sudoOk = false; s.ran.login = true; OSI.term.print(t, kd.motd(t)); return say('ok', `Logged in as ${tm.user}.`);
    }
    if (tm.mode === 'sudo') {
      const ok = line === kd.userPw(t, tm.user);
      if (!ok) { tm.tries++; if (tm.tries >= 3) { tm.mode = 'sh'; tm.pend = null; OSI.term.print(t, 'sudo: 3 incorrect password attempts'); return; } OSI.term.print(t, 'Sorry, try again.'); return; }
      tm.mode = 'sh'; tm.sudoOk = true; tm.tries = 0; const c = tm.pend; tm.pend = null; return OSI.term.exec(t, c, true);
    }
    if (tm.mode === 'su') {
      tm.mode = 'sh'; if (line === kd.userPw(t, 'root') && kd.rootLogin(t)) { tm.root = true; tm.suFrom = tm.user; return; }
      OSI.term.print(t, 'su: Authentication failure'); return;
    }
    tm.hi = null; tm.draft = '';
    if (!line.trim()) return;
    // bash keeps every command, but not the same command twice in a row (HISTCONTROL ignoredups on Rocky, ignoreboth on Ubuntu)
    if (tm.hist[tm.hist.length - 1] !== line) tm.hist.push(line); if (tm.hist.length > 50) tm.hist.shift();
    OSI.term.exec(t, line, false);
  },
  // Up and Down walk the command history, as in bash: Down past the newest command gives back the line being typed
  histMove(t, d) {
    const tm = t.os.term; if (!tm || !tm.hist || !tm.hist.length || ['boot', 'login', 'pw', 'sudo', 'su'].includes(tm.mode)) return;
    if (tm.hi == null) { if (d > 0) return; tm.draft = tm.cmd; tm.hi = tm.hist.length; }
    tm.hi = Math.max(0, Math.min(tm.hist.length, tm.hi + d));
    if (tm.hi === tm.hist.length) { tm.cmd = tm.draft || ''; tm.hi = null; } else tm.cmd = tm.hist[tm.hi];
  },
  // Ctrl+L: clear the screen; the prompt and the line being typed stay
  cls(t) { const tm = t.os.term; if (tm && !['boot'].includes(tm.mode)) OSI.term.clear(t); },
  exec(t, line, sudo) { const kd = OSI.kinds[t.os.sys.os], r = kd.run(t, line, sudo); if (r && r.length) OSI.term.print(t, r); }
};
CORE.osHist = d => { if (T.os && T.os.term && T.os.scr === 'sys') OSI.term.histMove(T, d === 'down' ? 1 : -1); };
CORE.osCls = () => { if (T.os && T.os.term && T.os.scr === 'sys') OSI.term.cls(T); };
// keys in the console's command line: Up and Down (history) and Ctrl+L (clear), before any model's own key handling
document.addEventListener('keydown', e => {
  const tg = e.target; if (!T || !T.os || !tg || !tg.matches || !tg.matches('#stage input.osin[data-field="os.cmd"]')) return;
  let a = null;
  if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !e.altKey && !e.ctrlKey && !e.metaKey) a = ['osHist', e.key === 'ArrowUp' ? 'up' : 'down'];
  else if (e.ctrlKey && !e.altKey && !e.metaKey && (e.key === 'l' || e.key === 'L')) a = ['osCls', ''];
  if (!a) return;
  e.preventDefault(); e.stopImmediatePropagation(); Sim.do(a[0], a[1]); OSI.focus();
}, true);
// keys while nmtui is up: Tab and Shift+Tab, the arrows, Enter, Space (not in a text field) and Esc
document.addEventListener('keydown', e => {
  const tm = T && T.os && T.os.term, tg = e.target; if (!tm || tm.mode !== 'nmtui' || !document.querySelector('#stage .osx.nmt')) return;
  if (tg && tg !== document.body && !(tg.closest && tg.closest('#stage .osx.nmt'))) return;
  const inTxt = tg && tg.matches && tg.matches('input.osin');
  const m = { ArrowUp: 'Up', ArrowDown: 'Down', Enter: 'Enter', Escape: 'Esc' };
  let k = e.key === 'Tab' ? (e.shiftKey ? 'BackTab' : 'Tab') : m[e.key] || (e.key === ' ' && !inTxt ? 'Space' : null);
  if (!k || e.altKey || e.ctrlKey || e.metaKey) return;
  e.preventDefault(); e.stopImmediatePropagation(); Sim.do('osKey', k); OSI.focus();
}, true);
// a command line: words, with simple quotes; pipes split
const osWords = s => { const out = []; let cur = '', q = null, any = false; for (const ch of s) { if (q) { if (ch === q) q = null; else cur += ch; } else if (ch === '"' || ch === "'") { q = ch; any = true; } else if (/\s/.test(ch)) { if (cur || any) out.push(cur); cur = ''; any = false; } else cur += ch; } if (cur || any) out.push(cur); return out; };
const osPipes = s => { const out = []; let cur = '', q = null; for (const ch of s) { if (q) { if (ch === q) q = null; cur += ch; } else if (ch === '"' || ch === "'") { q = ch; cur += ch; } else if (ch === '|') { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map(x => x.trim()); };
// the filters at the end of a pipe: grep, head, tail, wc -l, sort, less and more
function osFilter(lines, w, name) {
  const cmd = w[0];
  if (cmd === 'grep' || cmd === 'egrep') {
    let i = 1, ci = false, inv = false, cnt = false, re = cmd === 'egrep', word = false; while (w[i] && /^-[a-zA-Z]+$/.test(w[i])) { const f = w[i]; ci = ci || f.includes('i'); inv = inv || f.includes('v'); cnt = cnt || f.includes('c'); re = re || f.includes('E'); word = word || f.includes('w'); i++; }
    const pat = w[i]; if (pat === undefined) return { err: 'Usage: grep [OPTION]... PATTERNS [FILE]...' };
    let rx; try { rx = new RegExp((word ? '\\b' : '') + (re ? pat : pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\.\\\*/g, '.*')) + (word ? '\\b' : ''), ci ? 'i' : ''); } catch (e) { return { err: 'grep: Invalid regular expression' }; }
    const m = lines.filter(l => rx.test(l) !== inv); return { lines: cnt ? [String(m.length)] : m };
  }
  if (cmd === 'head' || cmd === 'tail') { let n = 10; const a = w.slice(1).join(' '), m = /-n\s*(\d+)|-(\d+)/.exec(a); if (m) n = +(m[1] || m[2]); return { lines: cmd === 'head' ? lines.slice(0, n) : lines.slice(-n) }; }
  if (cmd === 'wc') return { lines: [w.includes('-l') ? String(lines.length) : `${String(lines.length).padStart(7)} ${String(lines.join(' ').split(/\s+/).filter(Boolean).length).padStart(7)} ${String(lines.join('\n').length + 1).padStart(7)}`] };
  if (cmd === 'sort') return { lines: lines.slice().sort() };
  if (cmd === 'less' || cmd === 'more' || cmd === 'cat') return { lines };
  if (cmd === 'awk' || cmd === 'sed' || cmd === 'cut') return { err: `${cmd}: not part of this simulated system. Use grep, head, tail or wc -l in a pipe.` };
  return { err: `${cmd}: command not found` };
}
// a table with columns padded to their widest cell
const osTable = (rows, right = []) => { const n = Math.max(...rows.map(r => r.length)), wd = Array.from({ length: n }, (_, i) => Math.max(...rows.map(r => String(r[i] == null ? '' : r[i]).length))); return rows.map(r => r.map((c, i) => right.includes(i) ? String(c).padStart(wd[i]) : i === r.length - 1 ? String(c) : String(c).padEnd(wd[i])).join(' ').replace(/\s+$/, '')); };

/* ---- an installed Linux (Ubuntu Server or Rocky Linux) ---- */
OSI.linux = os => {
  const ub = os === 'ubuntu', m = OS_META[os];
  const sys = t => t.os.sys, H = () => osH(), W = () => osH().net;
  const usable = gb => Math.floor(gb - 0.6 - gb * 0.0165);           // what the kernel leaves after its own reservations
  const thr = t => { const c = H().cpu(t); return c.sockets * c.cores * 2; };
  const nicOf = (t, dev) => H().nics(t).find(n => n.dev === dev);
  // the address on a port: only the one configured in the installer, and only with a link
  const addrOf = (t, n) => { const y = sys(t); return y.iface === n.dev && y.addr && !y.nmOff ? { addr: y.addr, prefix: y.prefix } : null; };
  const live = t => { const y = sys(t), n = nicOf(t, y.iface); return !!(n && n.link && y.addr && !y.nmOff); };
  const upOn = (t, n) => n.dev === sys(t).iface && !sys(t).nmOff;          // the port the active connection is on
  const v6 = mac => { const p = mac.split(':').map(x => parseInt(x, 16)); p[0] ^= 2; const h = x => x.toString(16).padStart(2, '0'); return `fe80::${h(p[0])}${h(p[1])}:${h(p[2])}ff:fe${h(p[3])}:${h(p[4])}${h(p[5])}`.replace(/:0+([0-9a-f])/g, ':$1'); };
  const bootMsgs = t => [`${m.pretty}: starting`, '', `[    0.000000] Linux version ${m.kernel}`, `[    0.000000] DMI: ${H().vendor} ${H().product}, BIOS ${H().bios.ver} ${H().bios.date}`, `[    0.000000] Memory: ${usable(H().memGB(t))}G available`, `[    0.512443] smpboot: Total of ${thr(t)} processors activated`, '[    2.031876] EXT4-fs (dm-0): mounted filesystem with ordered data mode.', '[  OK  ] Reached target local-fs.target - Local File Systems.', `[  OK  ] Started ${ub ? 'systemd-networkd.service - Network Configuration' : 'NetworkManager.service - Network Manager'}.`, `[  OK  ] Started ${ub ? 'ssh.service - OpenBSD Secure Shell server' : 'sshd.service - OpenSSH server daemon'}.`, '[  OK  ] Reached target multi-user.target - Multi-User System.'];
  const banner = t => ub ? ['', ...(sys(t).boots === 1 ? [`[  ${(9.8).toFixed(1)}] cloud-init[1304]: Cloud-init v. 24.1.3-0ubuntu3.3 finished. Datasource DataSourceNone.`, ''] : []), `${m.pretty} ${sys(t).host} tty1`, ''] : ['', m.pretty, `Kernel ${m.kernel} on an x86_64`, '', 'Activate the web console with: systemctl enable --now cockpit.socket', ''];
  function boot(t) { const y = sys(t); y.boots = (y.boots || 0) + 1; y.boot = osNow(); t.os.term = { mode: 'boot', user: '', root: false, cmd: '', tries: 0, pend: null, sudoOk: false, hist: [] }; OSI.term.clear(t); }
  function sysTick(t) { const tm = t.os.term; if (tm && tm.mode === 'boot' && osAge(sys(t).boot) > 3.2) { OSI.term.fresh(t, banner(t)); return true; } return !!(tm && tm.mode === 'boot'); }
  function sysScreen(t) {
    const tm = t.os.term;
    if (!tm || tm.mode === 'boot') { const L = bootMsgs(t); return `<div class="osx lc"><pre class="lcl">${esc(L.slice(0, Math.min(L.length, 1 + Math.floor(osAge(sys(t).boot) * 4))).join('\n'))}</pre></div>`; }
    if (tm.mode === 'nmtui') return nmScreen(t);
    return OSI.term.screen(t);
  }
  const auth = (t, u, p) => { const y = sys(t); return (u === y.user && p === y.pw) || (!ub && u === 'root' && p === y.rootPw); };
  const userPw = (t, u) => u === 'root' ? sys(t).rootPw : sys(t).pw;
  const motd = t => ub ? [`Welcome to ${m.pretty} (GNU/Linux ${m.kernel} x86_64)`, '', ' * Documentation:  https://help.ubuntu.com', ' * Management:     https://landscape.canonical.com', ' * Support:        https://ubuntu.com/pro', '', ` System information as of ${new Date().toUTCString()}`, '', `  System load:  0.08              Processes:             ${thr(t) * 7 + 150}`, `  Usage of /:   6.1% of 97.87GB   Users logged in:       0`, `  Memory usage: 0%                IPv4 address for ${sys(t).iface}: ${live(t) ? sys(t).addr : '(none)'}`, '  Swap usage:   0%', '', `To run a command as administrator (user "root"), use "sudo <command>".`, 'See "man sudo_root" for details.', ''] : [`Last login: ${new Date().toDateString()} on tty1`];
  const prompt = t => { const tm = t.os.term, u = tm.root ? 'root' : tm.user, h = sys(t).host; return ub ? `${u}@${h}:~${tm.root ? '#' : '$'} ` : `[${u}@${h} ~]${tm.root ? '#' : '$'} `; };
  /* ---- what the commands print ---- */
  function lsblk(t, w) {
    const H2 = H(), y = sys(t), dev = y.disk, nv = dev.startsWith('nvme'), P = nv ? 'p' : '', rows = [];
    const cols = (() => { const i = w.indexOf('-o'); const o = i >= 0 ? w[i + 1] : (w.find(x => /^--output=/.test(x)) || '').split('=')[1]; return o ? o.toUpperCase().split(',') : null; })();
    const nod = w.includes('-d') || w.includes('--nodeps');
    H2.disks(t).forEach((d, k) => {
      const mm = d.dev.startsWith('nvme') ? `259:${k * 0}` : `8:${16 * k}`;
      rows.push({ NAME: d.dev, 'MAJ:MIN': d.dev.startsWith('nvme') ? '259:0' : `8:${16 * (d.dev.charCodeAt(2) - 97)}`, RM: '0', SIZE: osSize(d.bytes), RO: '0', TYPE: 'disk', MOUNTPOINTS: '', MODEL: d.model, TRAN: d.tran, ROTA: String(d.rota), SERIAL: d.serial, VENDOR: d.vendor || '', FSTYPE: d.dev === dev ? '' : '', kid: 0, mm });
      if (d.dev !== dev || nod) return;
      const g = d.bytes, kids = ub ? (y.lvm ? [['1', 1024 ** 3, 'part', '/boot/efi', 'vfat'], ['2', 2 * 1024 ** 3, 'part', '/boot', 'ext4'], ['3', g - 3.05 * 1024 ** 3, 'part', '', 'LVM2_member']] : [['1', 1024 ** 3, 'part', '/boot/efi', 'vfat'], ['2', g - 1.05 * 1024 ** 3, 'part', '/', 'ext4']])
        : [['1', 600 * 1024 ** 2, 'part', '/boot/efi', 'vfat'], ['2', 1024 ** 3, 'part', '/boot', 'xfs'], ['3', g - 1.6 * 1024 ** 3, 'part', '', 'LVM2_member']];
      kids.forEach(([n, b, ty, mp, fs], j) => rows.push({ NAME: `${j === kids.length - 1 ? '└─' : '├─'}${dev}${P}${n}`, 'MAJ:MIN': nv ? `259:${j + 1}` : `8:${j + 1}`, RM: '0', SIZE: osSize(b), RO: '0', TYPE: ty, MOUNTPOINTS: mp, MODEL: '', TRAN: '', ROTA: String(d.rota), SERIAL: '', VENDOR: '', FSTYPE: fs }));
      const pv = g - (ub ? 3.05 : 1.6) * 1024 ** 3;
      const lvs = ub ? (y.lvm ? [['ubuntu--vg-ubuntu--lv', 100 * 1024 ** 3, '/', 'ext4']] : []) : [['rl-root', 70 * 1024 ** 3, '/', 'xfs'], ['rl-swap', 4 * 1024 ** 3, '[SWAP]', 'swap'], ['rl-home', pv - 74 * 1024 ** 3, '/home', 'xfs']];
      lvs.forEach(([n, b, mp, fs], j) => rows.push({ NAME: `  ${j === lvs.length - 1 ? '└─' : '├─'}${n}`, 'MAJ:MIN': `${ub ? 252 : 253}:${j}`, RM: '0', SIZE: osSize(b), RO: '0', TYPE: 'lvm', MOUNTPOINTS: mp, MODEL: '', TRAN: '', ROTA: String(d.rota), SERIAL: '', VENDOR: '', FSTYPE: fs }));
    });
    if (t.os.media) rows.splice(0, 0, { NAME: 'sr0', 'MAJ:MIN': '11:0', RM: '1', SIZE: (osIso(t.os.media) || { size: '1G' }).size.replace(' GB', 'G'), RO: '0', TYPE: 'rom', MOUNTPOINTS: '', MODEL: H2.cdModel, TRAN: 'usb', ROTA: '1', SERIAL: '', VENDOR: '', FSTYPE: 'iso9660' });
    const C = cols ? cols.map(c => c === 'MOUNTPOINT' ? 'MOUNTPOINTS' : c) : w.includes('-f') ? ['NAME', 'FSTYPE', 'MOUNTPOINTS'] : ['NAME', 'MAJ:MIN', 'RM', 'SIZE', 'RO', 'TYPE', 'MOUNTPOINTS'];
    const bad = C.find(c => !(c in rows[0])); if (bad) return [`lsblk: unknown column: ${bad}`];
    return osTable([C.map(c => c === 'MOUNTPOINTS' && cols && cols.includes('MOUNTPOINT') ? 'MOUNTPOINT' : c), ...rows.map(r => C.map(c => r[c]))], C.map((c, i) => ['SIZE', 'RM', 'RO', 'ROTA'].includes(c) ? i : -1).filter(i => i > 0));
  }
  function lscpu(t) {
    const c = H().cpu(t), n = thr(t), per = c.cores, half = n / 2;
    const L = [['Architecture:', 'x86_64'], ['  CPU op-mode(s):', '32-bit, 64-bit'], ['  Address sizes:', `${c.phys} bits physical, ${c.virt} bits virtual`], ['  Byte Order:', 'Little Endian'], ['CPU(s):', n], ['  On-line CPU(s) list:', `0-${n - 1}`], ['Vendor ID:', 'GenuineIntel'], ['  Model name:', c.model], ['    CPU family:', 6], ['    Model:', c.modelNo], ['    Thread(s) per core:', 2], ['    Core(s) per socket:', per], ['    Socket(s):', c.sockets], ['    Stepping:', c.step], ['    CPU(s) scaling MHz:', '100%'], ['    CPU max MHz:', c.max.toFixed(4)], ['    CPU min MHz:', c.min.toFixed(4)], ['    BogoMIPS:', (c.mhz * 2).toFixed(2)], ['Virtualization features:', ''], ['  Virtualization:', 'VT-x'], ['Caches (sum of all):', ''], ['  L1d:', c.l1d], ['  L1i:', c.l1i], ['  L2:', c.l2], ['  L3:', c.l3], ['NUMA:', ''], ['  NUMA node(s):', c.sockets],
      ...Array.from({ length: c.sockets }, (_, k) => [`  NUMA node${k} CPU(s):`, `${k * per}-${k * per + per - 1},${half + k * per}-${half + k * per + per - 1}`])];
    return L.map(([k, v]) => `${k.padEnd(26)}${v}`);
  }
  function dmiMem(t) {
    const L = ['# dmidecode 3.5', 'Getting SMBIOS data from sysfs.', `SMBIOS ${H().smbios} present.`, ''];
    H().dimms(t).forEach((d, k) => {
      L.push(`Handle 0x${(0x30 + k).toString(16).padStart(4, '0').toUpperCase()}, DMI type 17, 100 bytes`, 'Memory Device', '\tTotal Width: 80 bits', '\tData Width: 64 bits', `\tSize: ${d.gb ? d.gb + ' GB' : 'No Module Installed'}`, '\tForm Factor: DIMM', `\tLocator: ${d.loc}`, `\tBank Locator: ${d.bank}`, `\tType: ${d.gb ? d.type : 'Unknown'}`, `\tType Detail: ${d.gb ? d.detail : 'None'}`);
      if (d.gb) L.push(`\tSpeed: ${d.speed} ${d.unit}`, `\tRank: ${d.ranks}`, `\tConfigured Memory Speed: ${d.cfg} ${d.unit}`);
      L.push('');
    });
    return L;
  }
  function dmi(t, w, sudo) {
    if (!sudo && !t.os.term.root) return ['# dmidecode 3.5', '/sys/firmware/dmi/tables/smbios_entry_point: Permission denied', 'Scanning /dev/mem for entry point.', '/dev/mem: Permission denied'];
    const i = w.indexOf('-t'), ty = i >= 0 ? String(w[i + 1] || '').toLowerCase() : (w.find(x => /^--type=/.test(x)) || '').split('=')[1] || '';
    const h = H(), c = h.cpu(t);
    if (['memory', '17'].includes(ty)) { t.os.ran.mem = true; return dmiMem(t); }
    if (['system', '1'].includes(ty)) return ['# dmidecode 3.5', 'Getting SMBIOS data from sysfs.', `SMBIOS ${h.smbios} present.`, '', 'Handle 0x0001, DMI type 1, 27 bytes', 'System Information', `\tManufacturer: ${h.vendor}`, `\tProduct Name: ${h.product}`, '\tVersion: Not Specified', `\tSerial Number: ${h.serial}`, `\tUUID: ${h.uuid.toLowerCase()}`, '\tWake-up Type: Power Switch', `\tSKU Number: ${h.sku}`, `\tFamily: ${h.family}`];
    if (['bios', '0'].includes(ty)) return ['# dmidecode 3.5', 'Getting SMBIOS data from sysfs.', `SMBIOS ${h.smbios} present.`, '', 'Handle 0x0000, DMI type 0, 26 bytes', 'BIOS Information', `\tVendor: ${h.bios.vendor}`, `\tVersion: ${h.bios.ver}`, `\tRelease Date: ${h.bios.date}`, '\tCharacteristics:', '\t\tUEFI is supported'];
    if (['processor', '4'].includes(ty)) { t.os.ran.cpu = true; return ['# dmidecode 3.5', 'Getting SMBIOS data from sysfs.', `SMBIOS ${h.smbios} present.`, '', ...Array.from({ length: c.sockets }, (_, k) => [`Handle 0x${(0x400 + k).toString(16).toUpperCase()}, DMI type 4, 48 bytes`, 'Processor Information', `\tSocket Designation: ${h.socketName(k)}`, '\tType: Central Processor', '\tFamily: Xeon', '\tManufacturer: Intel(R) Corporation', `\tVersion: ${c.model}`, `\tMax Speed: ${c.max} MHz`, `\tCurrent Speed: ${c.mhz} MHz`, '\tStatus: Populated, Enabled', `\tCore Count: ${c.cores}`, `\tCore Enabled: ${c.cores}`, `\tThread Count: ${c.cores * 2}`, '']).flat()]; }
    if (!ty) { t.os.ran.mem = true; return [...dmiMem(t).slice(0, 4), '(The full table is long: use dmidecode -t memory, -t system, -t processor or -t bios.)']; }
    return [`Invalid type keyword: ${ty}`, 'Valid type keywords are:', '  bios', '  system', '  baseboard', '  chassis', '  processor', '  memory', '  cache', '  connector', '  slot'];
  }
  function ipA(t, w) {
    const br = w.includes('-br') || w.includes('-brief'), si = w.findIndex((x, i) => i > 0 && /^(a|addr|address|l|link|r|route|n|neigh)$/.test(x)), sub = si > 0 ? w[si] : 'addr';
    const rest = w.slice(si > 0 ? si + 1 : 1).filter(x => !x.startsWith('-') && x !== 'show' && x !== 'dev'), dev = rest[0];
    if (si < 0 && w.slice(1).some(x => !x.startsWith('-'))) return [`Object "${w.slice(1).find(x => !x.startsWith('-'))}" is unknown, try "ip help".`];
    const y = sys(t), list = H().nics(t).filter(n => !dev || n.dev === dev);
    if (dev && !list.length) return [`Device "${dev}" does not exist.`];
    if (/^r/.test(sub)) { t.os.ran.ip = true; return live(t) ? [`default via ${y.gw} dev ${y.iface} proto static${ub ? '' : ' metric 100'}`, `${(() => { const n = osIp(y.addr) & osMaskN(y.prefix); return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'); })()}/${y.prefix} dev ${y.iface} proto kernel scope link src ${y.addr}${ub ? '' : ' metric 100'}`] : []; }
    if (/^n/.test(sub)) return live(t) ? [`${y.gw} dev ${y.iface} lladdr 00:00:5e:00:01:28 REACHABLE`] : [];
    t.os.ran.ip = true;
    const st = n => { const up = upOn(t, n); return { flags: up ? (n.link ? '<BROADCAST,MULTICAST,UP,LOWER_UP>' : '<NO-CARRIER,BROADCAST,MULTICAST,UP>') : '<BROADCAST,MULTICAST>', state: up && n.link ? 'UP' : 'DOWN' }; };
    const lnk = /^l/.test(sub);
    if (br) return osTable([...(dev ? [] : [lnk ? ['lo', 'UNKNOWN', '00:00:00:00:00:00', '<LOOPBACK,UP,LOWER_UP>'] : ['lo', 'UNKNOWN', '127.0.0.1/8 ::1/128']]), ...list.map(n => { const s2 = st(n), a = addrOf(t, n); return lnk ? [n.dev, s2.state, n.mac.toLowerCase(), s2.flags] : [n.dev, s2.state, [a && n.link ? `${a.addr}/${a.prefix}` : '', s2.state === 'UP' ? `${v6(n.mac)}/64` : ''].filter(Boolean).join(' ')]; })]);
    const L = dev ? [] : ['1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000', '    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00', ...(lnk ? [] : ['    inet 127.0.0.1/8 scope host lo', '       valid_lft forever preferred_lft forever', '    inet6 ::1/128 scope host noprefixroute', '       valid_lft forever preferred_lft forever'])];
    H().nics(t).forEach((n, k) => {
      if (dev && n.dev !== dev) return;
      const s2 = st(n), a = addrOf(t, n);
      L.push(`${k + 2}: ${n.dev}: ${s2.flags} mtu 1500 qdisc mq state ${s2.state} ${lnk ? 'mode DEFAULT ' : ''}group default qlen 1000`, `    link/ether ${n.mac.toLowerCase()} brd ff:ff:ff:ff:ff:ff`);
      if (n.alt) L.push(`    altname ${n.alt}`);
      if (!lnk && a && n.link) L.push(`    inet ${a.addr}/${a.prefix} brd ${(() => { const b = (osIp(a.addr) | ~osMaskN(a.prefix)) >>> 0; return [b >>> 24, (b >>> 16) & 255, (b >>> 8) & 255, b & 255].join('.'); })()} scope global ${ub ? '' : 'noprefixroute '}${n.dev}`, '       valid_lft forever preferred_lft forever', `    inet6 ${v6(n.mac)}/64 scope link`, '       valid_lft forever preferred_lft forever');
    });
    return L;
  }
  function ping(t, w, v) {
    const y = sys(t), host = w.filter((x, i) => !x.startsWith('-') && !['-c', '-W', '-i', '-w'].includes(w[i - 1])).slice(1)[0], ci = w.indexOf('-c'), n = ci >= 0 ? Math.max(1, Math.min(10, +w[ci + 1] || 4)) : 4;
    if (!host) return ['ping: usage error: Destination address required'];
    const ip = host === 'localhost' ? '127.0.0.1' : host.toLowerCase() === y.host ? y.addr : host;
    if (osIp(ip) === null) return [ub ? `ping: ${host}: Temporary failure in name resolution` : `ping: ${host}: Name or service not known`];
    const self = ip === '127.0.0.1' || (ip === y.addr && live(t)), Wn = W();
    if (!self && !live(t)) return ['ping: connect: Network is unreachable'];
    const near = !self && osSameNet(ip, y.addr, y.prefix), up = self || (near && [y.gw, Wn.dns].includes(ip));
    const head = `PING ${ip} (${ip}) 56(84) bytes of data.`, L = [head], ms = () => (0.3 + Math.random() * 0.2).toFixed(3);
    if (up) { const ts = []; for (let k = 1; k <= n; k++) { const x = ms(); ts.push(+x); L.push(`64 bytes from ${ip}: icmp_seq=${k} ttl=${self ? 64 : 255} time=${self ? '0.030' : x} ms`); } L.push(...(ci < 0 ? ['^C'] : []), '', `--- ${ip} ping statistics ---`, `${n} packets transmitted, ${n} received, 0% packet loss, time ${(n - 1) * 1001}ms`, `rtt min/avg/max/mdev = ${Math.min(...ts).toFixed(3)}/${(ts.reduce((a, b) => a + b, 0) / n).toFixed(3)}/${Math.max(...ts).toFixed(3)}/0.041 ms`); if (ip === y.gw) t.os.ran.ping = true; return L; }
    if (near) { for (let k = 1; k <= n; k++) L.push(`From ${y.addr} icmp_seq=${k} Destination Host Unreachable`); L.push('', `--- ${ip} ping statistics ---`, `${n} packets transmitted, 0 received, +${n} errors, 100% packet loss, time ${(n - 1) * 1001}ms`); return L; }
    L.push('', `--- ${ip} ping statistics ---`, `${n} packets transmitted, 0 received, 100% packet loss, time ${(n - 1) * 1001}ms`); return L;
  }
  function ethtool(t, w) {
    const dev = w[w.length - 1], n = nicOf(t, dev); if (!n || w.length < 2) return [w.length < 2 ? 'ethtool: bad command line argument(s)' : `netlink error: no device matches name (offset 24)`, `netlink error: No such device`];
    if (w.includes('-i')) return [`driver: ${n.drv}`, `version: ${n.drvVer || m.kernel}`, `firmware-version: ${n.fw || 'N/A'}`, `bus-info: ${n.pci}`, 'supports-statistics: yes'];
    const up = n.link && sys(t).iface === n.dev; t.os.ran.ip = true;
    return [`Settings for ${dev}:`, `\tSupported ports: [ ${n.port === 'tp' ? 'TP' : 'FIBRE'} ]`, `\tSpeed: ${n.link ? n.speed + 'Mb/s' : 'Unknown!'}`, `\tDuplex: ${n.link ? 'Full' : 'Unknown! (255)'}`, `\tPort: ${n.port === 'tp' ? 'Twisted Pair' : n.port === 'da' ? 'Direct Attach Copper' : 'FIBRE'}`, '\tAuto-negotiation: off', `\tLink detected: ${n.link ? 'yes' : 'no'}`, ...(n.link && !up ? ['(The port has a link, but no address is configured on it.)'] : [])];
  }
  const osRel = () => ub ? ['PRETTY_NAME="Ubuntu 24.04.1 LTS"', 'NAME="Ubuntu"', 'VERSION_ID="24.04"', 'VERSION="24.04.1 LTS (Noble Numbat)"', 'VERSION_CODENAME=noble', 'ID=ubuntu', 'ID_LIKE=debian', 'HOME_URL="https://www.ubuntu.com/"', 'SUPPORT_URL="https://help.ubuntu.com/"']
    : ['NAME="Rocky Linux"', 'VERSION="9.5 (Blue Onyx)"', 'ID="rocky"', 'ID_LIKE="rhel centos fedora"', 'VERSION_ID="9.5"', 'PLATFORM_ID="platform:el9"', 'PRETTY_NAME="Rocky Linux 9.5 (Blue Onyx)"', 'ANSI_COLOR="0;32"', 'HOME_URL="https://rockylinux.org/"'];
  function files(t, f) {
    const y = sys(t), h = H(), mem = h.memGB(t), kb = usable(mem) * 1048576;
    switch (f) {
      case '/etc/os-release': case '/usr/lib/os-release': return osRel();
      case '/etc/redhat-release': case '/etc/rocky-release': return ub ? null : ['Rocky Linux release 9.5 (Blue Onyx)'];
      case '/etc/hostname': return [y.host];
      case '/etc/hosts': return ['127.0.0.1 localhost', ...(ub ? [`127.0.1.1 ${y.host}`] : []), '', '::1     localhost ip6-localhost ip6-loopback'];
      case '/proc/meminfo': t.os.ran.mem = true; return [`MemTotal:       ${String(kb).padStart(12)} kB`, `MemFree:        ${String(kb - 4300000).padStart(12)} kB`, `MemAvailable:   ${String(kb - 3100000).padStart(12)} kB`, 'Buffers:              10240 kB', 'Cached:             2210132 kB', `SwapTotal:      ${String((ub ? 8 : 4) * 1048576).padStart(12)} kB`];
      case '/proc/cpuinfo': { t.os.ran.cpu = true; const c = h.cpu(t); return Array.from({ length: thr(t) }, (_, k) => [`processor\t: ${k}`, 'vendor_id\t: GenuineIntel', 'cpu family\t: 6', `model\t\t: ${c.modelNo}`, `model name\t: ${c.model}`, `physical id\t: ${k % (thr(t) / 2) < c.cores ? 0 : 1}`, `cpu cores\t: ${c.cores}`, '']).flat(); }
      case '/etc/netplan/50-cloud-init.yaml': return ub ? ['network:', '  version: 2', '  ethernets:', `    ${y.iface}:`, '      addresses:', `      - "${y.addr}/${y.prefix}"`, '      nameservers:', '        addresses:', `        - ${y.dns}`, '        search: []', '      routes:', '      - to: "default"', `        via: "${y.gw}"`] : null;
      case '/etc/resolv.conf': return ub ? ['nameserver 127.0.0.53', 'options edns0 trust-ad', 'search .'] : ['# Generated by NetworkManager', `nameserver ${y.dns}`];
    }
    return null;
  }
  const PATH = ['ls', 'cat', 'grep', 'head', 'tail', 'wc', 'lsmem', 'free', 'dmidecode', 'lscpu', 'nproc', 'lsblk', 'fdisk', 'df', 'ip', 'ping', 'ethtool', 'lspci', 'hostnamectl', 'hostname', 'uname', 'whoami', 'id', 'uptime', 'date', 'sudo', 'su', 'exit', 'logout', 'reboot', 'shutdown', 'poweroff', 'clear', 'history', 'help', 'echo', 'pwd', 'systemctl', ...(ub ? ['networkctl'] : ['nmcli', 'nmtui'])];
  function cmd(t, w, sudo) {
    const y = sys(t), h = H(), tm = t.os.term, root = sudo || tm.root, c0 = w[0], mem = h.memGB(t);
    switch (c0) {
      case 'lsmem': { t.os.ran.mem = true; const lo = 2; return [...osTable([['RANGE', 'SIZE', 'STATE', 'REMOVABLE', 'BLOCK'], ['0x0000000000000000-0x000000007fffffff', '2G', 'online', 'yes', '0'], [`0x0000000100000000-0x${(mem * 1024 ** 3 + 2 * 1024 ** 3 - 1).toString(16).padStart(16, '0')}`, `${mem - lo}G`, 'online', 'yes', `2-${(mem + 2) / 2 - 1 | 0}`]], [1]), '', `Memory block size:${'2G'.padStart(18)}`, `Total online memory:${(mem + 'G').padStart(16)}`, `Total offline memory:${'0B'.padStart(15)}`]; }
      case 'free': {
        t.os.ran.mem = true; const u = usable(mem), sw = ub ? 8 : 4;
        const f = w.includes('-g') ? x => String(Math.floor(x)) : w.includes('-m') ? x => String(Math.round(x * 1024)) : w.includes('-h') ? x => x >= 1 ? (x >= 10 ? Math.round(x) : x.toFixed(1)) + 'Gi' : Math.round(x * 1024) + 'Mi' : x => String(Math.round(x * 1048576));
        return osTable([['', 'total', 'used', 'free', 'shared', 'buff/cache', 'available'], ['Mem:', f(u), f(4.1), f(u - 6.7), f(0.002), f(2.6), f(u - 3.4)], ['Swap:', f(sw), w.includes('-h') ? '0B' : '0', f(sw)]], [1, 2, 3, 4, 5, 6]);
      }
      case 'dmidecode': return dmi(t, w, root);
      case 'lscpu': t.os.ran.cpu = true; return lscpu(t);
      case 'nproc': t.os.ran.cpu = true; return [String(thr(t))];
      case 'lsblk': t.os.ran.disk = true; return lsblk(t, w);
      case 'fdisk': if (!root) return ['fdisk: cannot open /dev/' + (w[2] || 'sda').replace('/dev/', '') + ': Permission denied']; if (!w.includes('-l')) return ['fdisk: interactive mode is not part of this simulated system. Use fdisk -l.']; t.os.ran.disk = true; return h.disks(t).flatMap(d => [`Disk /dev/${d.dev}: ${osSize(d.bytes, 2).replace(/([A-Z])$/, ' $1iB')}, ${d.bytes} bytes, ${Math.floor(d.bytes / (d.sector || 512))} sectors`, `Disk model: ${d.model}`, `Units: sectors of 1 * ${d.sector || 512} = ${d.sector || 512} bytes`, `Sector size (logical/physical): ${d.sector || 512} bytes / ${d.sector || 4096} bytes`, d.dev === y.disk ? 'Disklabel type: gpt' : '', '']).filter((x, i, a) => x !== '' || a[i - 1] !== '');
      case 'df': { const g = h.disks(t).find(d => d.dev === y.disk), P = y.disk.startsWith('nvme') ? 'p' : ''; t.os.ran.disk = true; return osTable([['Filesystem', 'Size', 'Used', 'Avail', 'Use%', 'Mounted on'], ...(ub ? [['tmpfs', '76G', '2.6M', '76G', '1%', '/run'], [y.lvm ? '/dev/mapper/ubuntu--vg-ubuntu--lv' : `/dev/${y.disk}${P}2`, y.lvm ? '98G' : osSize(g.bytes - 1.1 * 1024 ** 3), '6.0G', y.lvm ? '87G' : osSize(g.bytes - 8 * 1024 ** 3), '7%', '/'], [`/dev/${y.disk}${P}2`, '2.0G', '96M', '1.7G', '6%', '/boot'], [`/dev/${y.disk}${P}1`, '1.1G', '6.2M', '1.1G', '1%', '/boot/efi']] : [['devtmpfs', '4.0M', '0', '4.0M', '0%', '/dev'], ['/dev/mapper/rl-root', '70G', '2.4G', '68G', '4%', '/'], [`/dev/${y.disk}${P}2`, '960M', '238M', '723M', '25%', '/boot'], ['/dev/mapper/rl-home', osSize(g.bytes - 76 * 1024 ** 3, 0), '2.6G', osSize(g.bytes - 79 * 1024 ** 3, 0), '1%', '/home'], [`/dev/${y.disk}${P}1`, '599M', '7.1M', '592M', '2%', '/boot/efi']])], [1, 2, 3, 4]); }
      case 'ip': return ipA(t, w);
      case 'ifconfig': return ub ? ["Command 'ifconfig' not found, but can be installed with:", '', 'sudo apt install net-tools', '', '(ip a shows the same: it is the current tool.)'] : ['bash: ifconfig: command not found', '(net-tools is not installed: use ip a.)'];
      case 'ping': return ping(t, w);
      case 'ethtool': return ethtool(t, w);
      case 'lspci': return [...h.pci, ...h.nics(t).map(n => `${n.pci.slice(5)} Ethernet controller: ${n.vendor} ${n.model}`)].sort();
      case 'hostnamectl': return [` Static hostname: ${y.host}`, '       Icon name: computer-server', '         Chassis: server', '      Machine ID: 6c1f0b6a9c3e4d27b2a8f1e05d93c4a7', `Operating System: ${m.pretty}`, ...(ub ? [] : ['     CPE OS Name: cpe:/o:rocky:rocky:9::baseos']), `          Kernel: Linux ${m.kernel}`, '    Architecture: x86-64', ` Hardware Vendor: ${h.vendor}`, `  Hardware Model: ${h.product}`, `Firmware Version: ${h.bios.ver}`];
      case 'hostname': return [w.includes('-I') ? (live(t) ? y.addr + ' ' : '') : y.host];
      case 'uname': return [w.includes('-a') ? `Linux ${y.host} ${m.kernel} #1 SMP PREEMPT_DYNAMIC ${ub ? 'Fri Aug  2 20:41:06 UTC 2024' : 'Tue Nov 19 17:36:41 UTC 2024'} x86_64 x86_64 x86_64 GNU/Linux` : w.includes('-r') ? m.kernel : w.includes('-n') ? y.host : 'Linux'];
      case 'whoami': return [root && !sudo ? 'root' : sudo ? 'root' : tm.user];
      case 'id': return root ? ['uid=0(root) gid=0(root) groups=0(root)'] : [ub ? `uid=1000(${tm.user}) gid=1000(${tm.user}) groups=1000(${tm.user}),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),101(lxd)` : `uid=1000(${tm.user}) gid=1000(${tm.user}) groups=1000(${tm.user}),10(wheel)`];
      case 'uptime': return [` ${new Date().toTimeString().slice(0, 8)} up ${Math.max(1, Math.round(osAge(y.boot) / 60))} min,  1 user,  load average: 0.08, 0.03, 0.01`];
      case 'date': return [new Date().toString().replace(/ GMT.*$/, '')];
      case 'echo': return [w.slice(1).join(' ')];
      case 'pwd': return [root ? '/root' : `/home/${tm.user}`];
      case 'ls': return [];
      case 'cat': { const f = w[1]; if (!f) return []; const r = files(t, f); return r || [`cat: ${f}: No such file or directory`]; }
      case 'grep': { const f = w[w.length - 1], r = files(t, f); if (!r || w.length < 3) return [`grep: ${f}: No such file or directory`]; const g = osFilter(r, w.slice(0, -1)); return g.err ? [g.err] : g.lines; }
      case 'nmcli': if (ub) return ["Command 'nmcli' not found, but can be installed with:", '', 'sudo apt install network-manager', '', '(Ubuntu Server uses netplan and systemd-networkd: networkctl, ip a.)'];
        t.os.ran.ip = true;
        if (/^c/.test(w[1] || '') && /^(up|down)$/.test(w[2] || '')) { if (!w[3]) return [`Error: neither a valid connection nor device given.`]; const r = w[2] === 'up' ? nmUp(t, w[3]) : nmDown(t, w[3]); return r.err ? [`Error: ${r.err}`] : [r.ok]; }
        if (/^c/.test(w[1] || '')) return osTable([['NAME', 'UUID', 'TYPE', 'DEVICE'], ...h.nics(t).map((n, k) => [n.dev, `5e2b1c7a-${(4000 + k).toString(16)}-4b8e-9d3f-2a6c8e1b0f${k}${k}`, 'ethernet', upOn(t, n) && n.link ? n.dev : '--']), ['lo', '2f7e9c41-0d3b-4a59-8e6f-1c2b3a4d5e6f', 'loopback', 'lo']]);
        return osTable([['DEVICE', 'TYPE', 'STATE', 'CONNECTION'], ...h.nics(t).map(n => [n.dev, 'ethernet', !n.link ? 'unavailable' : upOn(t, n) ? 'connected' : 'disconnected', upOn(t, n) && n.link ? n.dev : '--']), ['lo', 'loopback', 'connected (externally)', 'lo']]);
      case 'nmtui': if (ub) return ["Command 'nmtui' not found, but can be installed with:", '', 'sudo apt install network-manager', '', '(Ubuntu Server uses netplan and systemd-networkd: edit /etc/netplan/50-cloud-init.yaml, then sudo netplan apply.)'];
        nmOpen(t, w[1]); return [];
      case 'networkctl': if (!ub) return ['bash: networkctl: command not found']; t.os.ran.ip = true; return [...osTable([['IDX', 'LINK', 'TYPE', 'OPERATIONAL', 'SETUP'], ['1', 'lo', 'loopback', 'carrier', 'unmanaged'], ...h.nics(t).map((n, k) => [String(k + 2), n.dev, 'ether', n.dev === y.iface ? (n.link ? 'routable' : 'no-carrier') : 'off', n.dev === y.iface ? 'configured' : 'unmanaged'])], [0]), '', `${h.nics(t).length + 1} links listed.`];
      case 'systemctl': { const svc = (w[2] || '').replace('.service', ''); if (w[1] !== 'status' || !svc) return ['(systemctl status <service> is modelled here: ssh or sshd)']; if (!/^sshd?$/.test(svc) || (!y.ssh && ub)) return [`Unit ${svc}.service could not be found.`]; return [`● ${ub ? 'ssh' : 'sshd'}.service - ${ub ? 'OpenBSD Secure Shell server' : 'OpenSSH server daemon'}`, `     Loaded: loaded (/usr/lib/systemd/system/${ub ? 'ssh' : 'sshd'}.service; enabled; preset: enabled)`, `     Active: active (running) since ${new Date(y.boot).toString().slice(0, 24)}`, '   Main PID: 1187 (sshd)', `     CGroup: /system.slice/${ub ? 'ssh' : 'sshd'}.service`, '             └─1187 "sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups"']; }
      case 'clear': OSI.term.clear(t); return [];
      case 'history': return tm.hist.map((x, i) => `${String(i + 1).padStart(5)}  ${x}`);
      case 'help': return [`GNU bash, version 5.${ub ? '2.21' : '1.8'}(1)-release (x86_64-pc-linux-gnu)`, '', 'This simulated system answers the checks after an install:', '  lsmem  free -g  sudo dmidecode -t memory   lscpu  nproc   lsblk  df -h  sudo fdisk -l', `  ip -br a  ip a  ip r  ethtool <port>  ping -c 3 <address>  lspci  ${ub ? 'networkctl' : 'nmcli device  nmtui'}`, '  hostnamectl  cat /etc/os-release  uname -a  sudo  reboot  exit', 'Pipes into grep, head, tail and wc -l work.'];
      case 'exit': case 'logout':
        if (tm.root && !tm.suFrom && tm.user !== 'root') { tm.root = false; return ['logout']; }
        if (tm.root && tm.suFrom) { tm.root = false; tm.suFrom = null; return ['logout']; }
        OSI.term.fresh(t, banner(t).slice(1)); return [];
      case 'reboot': case 'shutdown': case 'poweroff': case 'halt': {
        if (!root) return ub ? ['Call to Reboot failed: Interactive authentication required.', 'See system logs and \'systemctl status reboot.target\' for details.'] : ['Failed to set wall message, ignoring: Interactive authentication required.', 'Call to reboot failed: Interactive authentication required.'];
        const off = c0 === 'poweroff' || c0 === 'halt' || (c0 === 'shutdown' && !w.includes('-r'));
        OSI.term.print(t, off ? 'The system will power off now!' : 'The system will reboot now!'); if (off) h.powerOff(t); else h.reboot(t); return [];
      }
      case 'su': if (sudo) { tm.root = true; return []; } if (ub) return ['Password: ', 'su: Authentication failure', '(The root account is locked on Ubuntu: use sudo.)']; tm.mode = 'su'; return [];
      case 'ssacli': case 'hpssacli': case 'storcli': case 'storcli64': case 'perccli': return [`bash: ${c0}: command not found`, `(The controller vendor's tool is not installed. ${h.ctlTool})`];
      case 'vi': case 'vim': case 'nano': case 'less': case 'more': case 'top': case 'htop': return [`${c0}: full-screen programs are not part of this simulated system.`];
      case 'yum': case 'dnf': case 'apt': case 'apt-get': case 'snap': return [`${c0}: package installs are not part of this lab.`];
      case 'esxcli': return ['bash: esxcli: command not found', '(esxcli is the ESXi shell\'s tool. This is Linux: lsmem, lscpu, lsblk, ip.)'];
    }
    if (!c0) return [];
    return ub ? [`${c0}: command not found`] : [`bash: ${c0}: command not found`];
  }
  function run(t, line, sudo) {
    const tm = t.os.term, parts = osPipes(line), w0 = osWords(parts[0]);
    if (w0[0] === 'sudo') {
      const rest = w0.slice(1);
      if (!rest.length) return ['usage: sudo -h | -K | -k | -V', 'usage: sudo [-u user] command'];
      if (tm.root) return run(t, line.replace(/^\s*sudo\s+/, ''), true);
      if (rest[0] === '-i' || rest[0] === '-s' || (rest[0] === 'su' && !rest[1]) || (rest[0] === 'su' && rest[1] === '-')) { if (!tm.sudoOk && !sudo) { tm.mode = 'sudo'; tm.pend = line; tm.tries = 0; return []; } tm.root = true; return []; }
      if (!tm.sudoOk && !sudo) { tm.mode = 'sudo'; tm.pend = line; tm.tries = 0; return []; }
      return run(t, line.replace(/^\s*sudo\s+/, ''), true);
    }
    let out = cmd(t, w0, sudo);
    for (const p of parts.slice(1)) { const r = osFilter(out, osWords(p)); if (r.err) return [r.err]; out = r.lines; }
    return out;
  }
  // the next action at the console, toward a command (login first)
  function loginCue(t) {
    const s = t.os, tm = s.term, y = s.sys;
    if (!tm || tm.mode === 'boot') return { say: `Wait: ${m.short} is starting.` };
    if (tm.mode === 'login') return tm.cmd !== y.user ? osF('cmd', y.user, `Type the user name: ${y.user}.`) : osC('osEnter', '', 'Press Enter.');
    if (tm.mode === 'pw') return tm.cmd !== y.pw ? osF('cmd', y.pw, 'Type the password from the work order.') : osC('osEnter', '', 'Press Enter.');
    if (tm.mode === 'sudo') return tm.cmd !== y.pw ? osF('cmd', y.pw, `sudo asks for ${tm.user}'s password: the one from the work order.`) : osC('osEnter', '', 'Press Enter.');
    if (tm.mode === 'su') return tm.cmd !== y.rootPw ? osF('cmd', y.rootPw || '', 'Type the root password.') : osC('osEnter', '', 'Press Enter.');
    return null;
  }
  const cmdCue = (t, c, say) => loginCue(t) || (t.os.term.cmd.trim() !== c ? osF('cmd', c, say || `Type ${c}`) : osC('osEnter', '', 'Press Enter.'));
  function postSteps() {
    const r = k => t => !!t.os.ran[k];
    return [
      { get text() { return `Log in at the console as ${OS_ACC.user}`; }, hint: 'The installed system on its own disk: the ISO is ejected.', done: r('login'), cue: t => loginCue(t) || { say: 'Logged in.' } },
      { text: 'Check the memory: lsmem', get hint() { return `It should show all ${osH().memGB(T)} GB you fitted. free shows a little less: the kernel keeps some for itself. sudo dmidecode -t memory lists every DIMM slot.`; }, done: r('mem'), cue: t => cmdCue(t, 'lsmem', 'Type lsmem: the memory the OS sees.') },
      { text: 'Check the processors: lscpu', get hint() { const c = osH().cpu(T); return `Socket(s) ${c.sockets}, Core(s) per socket ${c.cores}, Thread(s) per core 2: CPU(s) ${c.sockets * c.cores * 2}.`; }, done: r('cpu'), cue: t => cmdCue(t, 'lscpu', 'Type lscpu: the processors, cores and threads.') },
      { text: 'Check the disks: lsblk', hint: 'The OS partitions must be on the boot disk; any other disk stays untouched.', done: r('disk'), cue: t => cmdCue(t, 'lsblk', 'Type lsblk: the disks and the OS partitions.') },
      { get text() { return `Check the network: ip -br a, then ping -c 3 ${osH().net.gw}`; }, get hint() { return `The address on ${OSI.wantNic(T).dev}, state UP; the gateway answers.`; }, done: t => !!(t.os.ran.ip && t.os.ran.ping), cue: t => !t.os.ran.ip ? cmdCue(t, 'ip -br a', 'Type ip -br a: the ports, their state and addresses.') : cmdCue(t, `ping -c 3 ${osH().net.gw}`, `Type ping -c 3 ${osH().net.gw}: the gateway must answer.`) }];
  }
  /* ---- nmtui (Rocky Linux): NetworkManager's text interface. Edit a connection, Activate a connection, Set system
     hostname. Each port has a connection profile named after it (the installer writes one per port); the one set in
     the installer is Manual with the work order's address, the others Automatic (DHCP) and not connected automatically.
     As in NetworkManager, a saved change to a profile applies when the connection is activated again. ---- */
  const NMM = { manual: 'Manual', auto: 'Automatic', disabled: 'Disabled' };
  function nmProf(t) {
    const y = sys(t);
    if (!y.nmp) { y.nmp = {}; H().nics(t).forEach(n => { y.nmp[n.dev] = n.dev === y.iface ? { method: 'manual', addr: `${y.addr}/${y.prefix}`, gw: y.gw || '', dns: y.dns || '', auto: true } : { method: 'auto', addr: '', gw: '', dns: '', auto: false }; }); }
    return y.nmp;
  }
  const nmActive = (t, dev) => sys(t).iface === dev && !sys(t).nmOff;
  function nmUp(t, dev) {
    const y = sys(t), P = nmProf(t)[dev], n = nicOf(t, dev);
    if (!P) return { err: `unknown connection '${dev}'.` };
    if (!n.link) return { err: `Connection activation failed: No suitable device found for this connection (device ${dev} not available because device has no carrier).` };
    if (P.method === 'auto') return { err: 'Connection activation failed: IP configuration could not be reserved (no available address, timeout, etc.).' };
    const [a, pf] = P.addr.split('/');
    Object.assign(y, { iface: dev, nmOff: false, addr: P.method === 'manual' ? a : '', prefix: P.method === 'manual' ? +pf : y.prefix, gw: P.method === 'manual' ? P.gw : '', dns: P.method === 'manual' ? P.dns : y.dns });
    return { ok: `Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/${(y.nmAct = (y.nmAct || 2) + 1)})` };
  }
  function nmDown(t, dev) { if (!nmProf(t)[dev]) return { err: `unknown connection '${dev}'.` }; if (!nmActive(t, dev)) return { err: `'${dev}' is not an active connection.` }; sys(t).nmOff = true; return { ok: `Connection '${dev}' successfully deactivated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/${sys(t).nmAct || 3})` }; }
  function nmOpen(t, sub) { const tm = t.os.term; tm.mode = 'nmtui'; tm.nm = { s: sub === 'edit' ? 'list' : sub === 'connect' ? 'act' : sub === 'hostname' ? 'host' : 'main', sel: 0, row: H().nics(t)[0].dev, f: null, msg: '' }; if (tm.nm.s === 'host') tm.nm.f = { host: sys(t).host }; }
  // the items of each screen, in Tab order: rows (r), buttons (b), text fields (x), check boxes (c), option buttons (o)
  function nmItems(t) {
    const nm = t.os.term.nm, devs = H().nics(t).map(n => n.dev), f = nm.f;
    switch (nm.s) {
      case 'main': return [['r', 'edit', 'Edit a connection'], ['r', 'act', 'Activate a connection'], ['r', 'host', 'Set system hostname'], ['r', 'quit', 'Quit'], ['b', 'ok', 'OK']];
      case 'list': return [...devs.map(d => ['r', 'dev:' + d, d]), ['b', 'add', 'Add'], ['b', 'edit', 'Edit...'], ['b', 'del', 'Delete'], ['b', 'back', 'Back']];
      case 'act': return [...devs.map(d => ['r', 'dev:' + d, d]), ['b', 'tog', nmActive(t, nm.row) ? 'Deactivate' : 'Activate'], ['b', 'back', 'Back']];
      case 'edit': return [['o', 'method', NMM[f.method]], ...(f.method === 'manual' ? [['x', 'addr', 'Addresses'], ['x', 'gw', 'Gateway'], ['x', 'dns', 'DNS servers']] : []), ['c', 'auto', 'Automatically connect'], ['b', 'cancel', 'Cancel'], ['b', 'ok', 'OK']];
      case 'host': return [['x', 'host', 'Hostname'], ['b', 'cancel', 'Cancel'], ['b', 'ok', 'OK']];
      default: return [['b', 'ok', 'OK']];            // 'info': a message box
    }
  }
  function nmScreen(t) {
    const tm = t.os.term, nm = tm.nm, y = sys(t), it = nmItems(t), f = nm.f;
    const one = i => { const [ty, id, lb] = it[i], on = nm.sel === i;
      if (ty === 'x') return `<span class="nmf${on ? ' on' : ''}" data-act="osAct" data-arg="nm:${i}"><span class="nml">${esc(lb.padStart(13))}</span> ${osIn('nm.' + id, f[id], { label: lb, cls: on ? 'focus' : '' })}</span>`;
      if (ty === 'c') return `<button class="nmc${on ? ' on' : ''}" data-act="osAct" data-arg="nm:${i}">[${f[id] ? 'X' : ' '}] ${esc(lb)}</button>`;
      if (ty === 'o') return `<button class="nmb${on ? ' on' : ''}" data-act="osAct" data-arg="nm:${i}">&lt;${esc(lb)}&gt;</button>`;
      if (ty === 'r') { const d = id.startsWith('dev:') ? id.slice(4) : null, mark = nm.s === 'act' && d ? (nmActive(t, d) ? '* ' : '  ') : ''; return `<button class="nmr${on ? ' on' : ''}${d && d === nm.row && nm.s !== 'main' ? ' cur' : ''}" data-act="osAct" data-arg="nm:${i}">${esc(mark + lb)}</button>`; }
      return `<button class="nmb${on ? ' on' : ''}" data-act="osAct" data-arg="nm:${i}">&lt;${esc(lb)}&gt;</button>`; };
    const idx = pred => it.map((x, i) => i).filter(i => pred(it[i]));
    let title = '', body = '';
    if (nm.s === 'main') { title = 'NetworkManager TUI'; body = `<div class="nmt0">Please select an option</div><div class="nmlist">${idx(x => x[0] === 'r').map(i => one(i)).join('')}</div><div class="nmbtns">${idx(x => x[0] === 'b').map(i => one(i)).join('')}</div>`; }
    else if (nm.s === 'list' || nm.s === 'act') { title = nm.s === 'list' ? 'Edit Connection' : 'Activate Connection'; body = `<div class="nmcol"><div class="nmlist box"><div class="nmhd">Ethernet</div>${idx(x => x[0] === 'r').map(i => one(i)).join('')}</div><div class="nmside">${idx(x => x[0] === 'b').map(i => one(i)).join('')}</div></div>`; }
    else if (nm.s === 'edit') { const n = nicOf(t, nm.row); title = 'Edit Connection'; body = `<div class="nmf"><span class="nml">${'Profile name'.padStart(13)}</span> ${esc(nm.row)}</div><div class="nmf"><span class="nml">${'Device'.padStart(13)}</span> ${esc(`${nm.row} (${n.mac})`)}</div><div class="nmsec">&#9552; ETHERNET</div><div class="nmsec">&#9562; IPv4 CONFIGURATION ${one(0)}</div>${idx(x => x[0] === 'x').map(i => one(i)).join('')}${f.method === 'manual' ? `<div class="nmf"><span class="nml">${'Routing'.padStart(13)}</span> (No custom routes)</div>` : ''}<div class="nmsec">&#9552; IPv6 CONFIGURATION &lt;Automatic&gt;</div><div>${idx(x => x[0] === 'c').map(i => one(i)).join('')}</div><div class="nmbtns r">${idx(x => x[0] === 'b').map(i => one(i)).join('')}</div>`; }
    else if (nm.s === 'host') { title = 'Set Hostname'; body = `${one(0)}<div class="nmbtns r">${one(1)}${one(2)}</div>`; }
    else { title = ''; body = `<div class="nmt0">${esc(nm.msg)}</div><div class="nmbtns">${one(0)}</div>`; }
    return `<div class="osx nmt"><div class="nmwin${nm.s === 'edit' ? ' wide' : ''}">${title ? `<div class="nmti">${esc(title)}</div>` : ''}${body}</div>${nm.s !== 'info' && nm.msg ? `<div class="nmerr">${esc(nm.msg)}</div>` : ''}<div class="nmkeys">Tab, Up, Down: move  Enter: select  Space: tick  Esc: back</div></div>`;
  }
  function nmField(t, f, v) { const nm = t.os.term.nm; if (nm && nm.f && f.startsWith('nm.')) nm.f[f.slice(3)] = v; }
  const nmCheck = f => {
    if (f.method !== 'manual') return '';
    const m = /^(\d+\.\d+\.\d+\.\d+)\/(\d{1,2})$/.exec((f.addr || '').trim());
    if (!m || osIp(m[1]) === null || +m[2] < 1 || +m[2] > 32) return 'Addresses: type the address with its prefix, for example 10.1.40.120/24.';
    if (f.gw.trim() && osIp(f.gw.trim()) === null) return 'Gateway is not a valid IPv4 address.';
    if (f.gw.trim() && ((osIp(m[1]) & osMaskN(+m[2])) >>> 0) !== ((osIp(f.gw.trim()) & osMaskN(+m[2])) >>> 0)) return 'The gateway is not in the subnet of the address.';
    if (f.dns.trim() && f.dns.split(/[,\s]+/).filter(Boolean).some(d => osIp(d) === null)) return 'DNS servers: not a valid IPv4 address.';
    return '';
  };
  // select item i: a row picks the connection (or opens a menu entry), a button acts, a check box toggles
  function nmDo(t, i) {
    const tm = t.os.term, nm = tm.nm, y = sys(t), it = nmItems(t)[i]; if (!it) return; nm.sel = i; const [ty, id] = it;
    if (ty === 'x') return;
    if (ty === 'c') { nm.f[id] = !nm.f[id]; return; }
    if (ty === 'o') { const o = ['manual', 'auto', 'disabled']; nm.f.method = o[(o.indexOf(nm.f.method) + 1) % 3]; return; }
    nm.msg = '';
    const go = s => { nm.s = s; nm.sel = 0; };
    if (nm.s === 'main') { if (id === 'quit') { tm.mode = 'sh'; tm.nm = null; return; } if (id === 'ok') return nmDo(t, 0); if (id === 'host') { nm.f = { host: y.host }; return go('host'); } return go(id === 'edit' ? 'list' : 'act'); }
    if (nm.s === 'list' || nm.s === 'act') {
      if (id.startsWith('dev:')) { nm.row = id.slice(4); if (nm.s === 'list' && ty === 'r' && nm.pick === nm.row) id2(); nm.pick = nm.row; return; }
      if (id === 'back') return go('main');
      if (id === 'add' || id === 'del') { nm.msg = 'Adding or deleting a connection profile is not part of this lab: each port has its profile.'; return; }
      if (id === 'edit') return id2();
      if (id === 'tog') { const r = nmActive(t, nm.row) ? nmDown(t, nm.row) : nmUp(t, nm.row); if (r.err) nm.msg = 'Could not activate connection: ' + r.err.replace(/^Connection activation failed: /, 'Activation failed: '); else say('ok', nmActive(t, nm.row) ? `${nm.row} activated: it now has the address in its profile.` : `${nm.row} deactivated: it has no address now.`); return; }
    }
    function id2() { const P = nmProf(t)[nm.row]; nm.f = Object.assign({}, P); nm.s = 'edit'; nm.sel = 0; }
    if (nm.s === 'edit') {
      if (id === 'cancel') return go('list');
      const err = nmCheck(nm.f); if (err) { nm.msg = err; return; }
      const f = nm.f; nmProf(t)[nm.row] = { method: f.method, addr: (f.addr || '').trim(), gw: (f.gw || '').trim(), dns: (f.dns || '').trim(), auto: !!f.auto };
      say('info', `Profile ${nm.row} saved. NetworkManager applies it when the connection is activated again: Activate a connection, Deactivate, then Activate (or nmcli con up ${nm.row}).`);
      return go('list');
    }
    if (nm.s === 'host') {
      if (id === 'cancel') return go('main');
      const h = (nm.f.host || '').trim(); if (!/^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9-]+)*$/.test(h)) { nm.msg = 'Not a valid hostname: letters, digits and hyphens.'; return; }
      y.host = h; nm.msg = `Set hostname to '${h}'`; return go('info');
    }
    if (nm.s === 'info') { nm.msg = ''; return go('main'); }
  }
  function nmKey(t, k) {
    const nm = t.os.term.nm, n = nmItems(t).length;
    if (k === 'Up' || k === 'Down' || k === 'Tab' || k === 'BackTab') { nm.sel = (nm.sel + (k === 'Up' || k === 'BackTab' ? -1 : 1) + n) % n; const it = nmItems(t)[nm.sel]; if (it[0] === 'r' && it[1].startsWith('dev:')) nm.row = it[1].slice(4); return; }
    if (k === 'Enter') { const it = nmItems(t)[nm.sel]; if (it[0] === 'x') { nm.sel = (nm.sel + 1) % n; return; } if (it[0] === 'r' && it[1].startsWith('dev:')) { nm.row = it[1].slice(4); nm.pick = nm.s === 'list' ? null : nm.pick; return nm.s === 'list' ? nmDo(t, nmItems(t).findIndex(x => x[1] === 'edit')) : nmDo(t, nmItems(t).findIndex(x => x[1] === 'tog')); } return nmDo(t, nm.sel); }
    if (k === 'Space') { const it = nmItems(t)[nm.sel]; if (it[0] === 'c' || it[0] === 'o') nmDo(t, nm.sel); return; }
    if (k === 'Esc') { if (nm.s === 'main') { t.os.term.mode = 'sh'; t.os.term.nm = null; } else { nm.msg = ''; nm.s = nm.s === 'edit' ? 'list' : 'main'; nm.sel = 0; } }
  }
  OSI.nmtui = { key: nmKey };
  const sysCue = t => loginCue(t) || { say: 'Run the checks the step names.' };
  return { boot, sysTick, sysScreen, auth, userPw, motd, prompt, run, sysCue, postSteps,
    loginHost: t => sys(t).host, acct: t => sys(t).user, rootLogin: t => !ub && !!sys(t).rootPw,
    sysAct: (t, a) => { if (t.os.term && t.os.term.mode === 'nmtui' && a.startsWith('nm:')) return nmDo(t, +a.slice(3)); if (a === 'enter') OSI.term.enter(t); },
    sysField: (t, f, v) => nmField(t, f, v),
    sysKey: (t, k) => { if (t.os.term && t.os.term.mode === 'nmtui') return nmKey(t, k); if (k === 'Enter') OSI.term.enter(t); else if (k === 'Up' || k === 'Down') OSI.term.histMove(t, k === 'Up' ? -1 : 1); }, sysKeyBar: [] };
};
