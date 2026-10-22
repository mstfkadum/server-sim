/* ---- The operating system install over the Cisco IMC KVM console's virtual media (engine/os-*.js): this server as
   an installed OS sees it, and the Cisco IMC side of the install: the KVM console (its Virtual Media, Boot Device,
   Power and Macros menus and a keyboard), the boot menu at POST (F6), unmapping the image, and the boot order in
   Cisco IMC, Compute, BIOS. The disks: the RAID virtual drive when the front drives form one, otherwise each drive on
   its own. The ports: LAN 1 and LAN 2 (onboard Intel I350, not cabled in this build) and the VIC 1225 in riser 2,
   PORT 1 to SW01 and PORT 2 to SW02. Device names, MAC addresses (documentation range) and identifiers are the lab's
   own. ---- */
const OSNET = { host: 'c240-lab01', ip: '10.1.40.120', mask: '255.255.255.0', prefix: 24, gw: '10.1.40.1', dns: '10.1.40.1', subnet: '10.1.40.0/24' };
const OSUUID = '7E3B5A10-4C2D-4F11-9A6B-0000C2404D01';
const kib = (k, inst) => `${k >= 1024 ? +(k / 1024).toFixed(1) + ' MiB' : k + ' KiB'} (${inst} instance${inst === 1 ? '' : 's'})`;
const cpuModel = t => { const c = t.cpu.find(x => x.st === 'torqued') || t.cpu[0]; return byId('cpus', c.model || 'e2680'); };
Sim.osHost({
  id: 'cisco', bmc: 'Cisco IMC', conName: 'Cisco IMC web interface, KVM console',
  vendor: 'Cisco Systems Inc', product: 'UCSC-C240-M4L', sku: 'UCSC-C240-M4L', family: 'UCS C-Series', serial: WO.serial, uuid: OSUUID, smbios: '3.0.0',
  bios: { vendor: 'Cisco Systems, Inc.', ver: 'C240M4.4.1.2c.0.0202211901', date: '02/02/2022' },
  cpu: t => { const c = cpuModel(t), n = [0, 1].filter(i => cpuIn(t, i)).length || 1; return { model: CPUFULL[c.id] || c.name, sockets: n, cores: c.cores, mhz: c.ghz * 1000, max: c.id === 'e2640' ? 3400 : 3300, min: 1200, modelNo: 79, step: 1, phys: 46, virt: 48,
    l1d: kib(32 * c.cores * n, c.cores * n), l1i: kib(32 * c.cores * n, c.cores * n), l2: kib(256 * c.cores * n, c.cores * n), l3: kib(2560 * c.cores * n, n) }; },
  socketName: k => `CPU${k + 1}`,
  dimms: t => { const sp = memSummary(t).speed; return [0, 1].flatMap(c => PROFILE.channels[c].flatMap((ch, ci) => [1, 2, 3].map(n => { const s = ch + n, d = t.dimms[s] ? byId('dimms', t.dimms[s].id) : null; return { loc: `DIMM_${s}`, bank: `NODE ${c} CHANNEL ${ci} DIMM ${n - 1}`, gb: d ? d.cap : 0, type: 'DDR4', detail: d ? d.detail : '', speed: 2400, cfg: sp, unit: 'MT/s', ranks: d ? d.ranks : 0 }; }))); },
  memGB: t => memSummary(t).total,
  disks: t => {
    const mem = t.bays.map((b, i) => [b, i]).filter(([b]) => b.st === 'locked' && b.member), raw = t.bays.map((b, i) => [b, i]).filter(([b]) => b.st === 'locked' && !b.member);
    const L = [];
    if (mem.length) { const cap = byId('drives', mem[0][0].drive).cap * 1e9, n = mem.length; L.push({ dev: 'sda', model: 'UCSC-MRAID12G', vendor: 'Cisco', bytes: (n >= 4 ? n / 2 : 1) * cap, tran: '', rota: 1, sector: 4096, serial: '678da6e715b8a0a02ad5c3e1f0d4b601', label: `the ${n >= 4 ? 'RAID 10' : 'RAID 1'} virtual drive over HDD ${mem.map(([, i]) => String(i + 1).padStart(2, '0')).join(', ')}`, boot: true, esx: 'naa.678da6e715b8a0a02ad5c3e1f0d4b601', esxDisp: 'Local Cisco Disk (naa.678da6e715b8a0a02ad5c3e1f0d4b601)', esxVendor: 'Cisco', esxModel: 'UCSC-MRAID12G' }); }
    raw.forEach(([b, i], k) => { const d = byId('drives', b.drive), id = `naa.5000c500a1b2c3d${k + 1}`; L.push({ dev: 'sd' + String.fromCharCode(97 + L.length), model: `${d.bus}-${d.kind}-${d.cap >= 1000 ? d.cap / 1000 + 'T' : d.cap + 'G'}`, vendor: 'TRAIN', bytes: d.cap * 1e9, tran: 'sas', rota: 1, sector: d.sector === '4Kn' ? 4096 : 512, serial: `TRN0${i + 1}A7C${k}`, label: `the ${d.cap / 1000} TB drive in HDD ${String(i + 1).padStart(2, '0')}`, boot: !mem.length && k === 0, esx: id, esxDisp: `Local TRAIN Disk (${id})`, esxVendor: 'TRAIN', esxModel: `${d.bus}-${d.kind}-${d.cap / 1000}T` }); });
    return L;
  },
  nics: t => {
    const L = [1, 2].map(p => ({ dev: `eno${p}`, alt: `enp1s0f${p - 1}`, esx: `vmnic${p - 1}`, mac: `00:00:5E:00:53:4${p - 1}`, drv: 'igb', esxDrv: 'igbn', fw: '1.63, 0x80000c6e', pci: `0000:01:00.${p - 1}`, vendor: 'Intel Corporation', model: 'I350 Gigabit Network Connection (rev 01)', esxDesc: 'Intel Corporation I350 Gigabit Network Connection', label: `LAN ${p}, onboard`, speed: 1000, port: 'tp', link: false, to: 'no cable', want: false }));
    if (vicSlot(t)) [1, 2].forEach(p => L.push({ dev: `enp${9 + p}s0`, alt: '', esx: `vmnic${p + 1}`, mac: `00:00:5E:00:53:4${'AB'[p - 1]}`, drv: 'enic', esxDrv: 'nenic', fw: '4.5(1b)', pci: `0000:0${'ab'[p - 1]}:00.0`, vendor: 'Cisco Systems Inc', model: 'VIC Ethernet NIC (rev a2)', esxDesc: 'Cisco Systems Inc Cisco VIC Ethernet NIC', label: `VIC PORT ${p} (riser 2, PCIe 5)`, speed: 10000, port: 'da', link: cabRight(t, `vic${p}`), to: `SW0${p} port 23`, want: p === 1 }));
    return L;
  },
  pci: ['00:00.0 Host bridge: Intel Corporation Xeon E7 v4/Xeon E5 v4/Xeon E3 v4/Xeon D DMI2 (rev 01)', '00:1d.0 USB controller: Intel Corporation C610/X99 series chipset USB Enhanced Host Controller #1 (rev 05)', '03:00.0 RAID bus controller: Broadcom / LSI MegaRAID SAS-3 3108 [Invader] (rev 02)', '0f:00.0 VGA compatible controller: Matrox Electronics Systems Ltd. MGA G200e [Pilot] ServerEngines (SEP1) (rev 42)'],
  ctlTool: 'Cisco\'s RAID controller is managed from Cisco IMC (Storage) or with storcli.',
  net: OSNET,
  isos: [{ file: 'VMware-ESXi-8.0.3-24022510-Custom-Cisco-4.3.4-b.iso', os: 'esxi', size: '0.6 GB', date: '22/07/2024' }],
  genericWhy: 'VMware\'s generic installer image: it lacks the drivers Cisco validates for its UCS servers (its custom image adds them). The work order asks for Cisco\'s custom image for ESXi',
  genericScreen: ['Loading ESXi installer', '', 'VMware ESXi 8.0.3, VMware\'s generic image.', '', 'Cisco\'s custom image adds the drivers Cisco validates for UCS servers', '(the VIC adapters, the RAID controller): use it on Cisco servers.'],
  vibs: [['nenic', '2.0.11.0-1OEM.800.1.0.20613240', 'CIS'], ['nfnic', '5.0.0.41-1OEM.800.1.0.20613240', 'CIS'], ['lsi-mr3', '7.727.03.00-1OEM.800.1.0.20613240', 'BCM'], ['igbn', '1.11.2.0-1vmw.803.0.0.24022510', 'VMW']],
  cdLabel: 'UEFI: Cisco vKVM-Mapped vDVD1.22', cdModel: 'Virtual CD/DVD',
  entry: name => name, old: { entry: 'Rocky Linux', name: 'Rocky Linux 8.10' },
  reboot: t => { startPost(t); Sim.sound('fans'); },
  powerOff: t => { t.power = 'off'; t.post = null; t.con.mode = 'off'; Sim.soundStop('fans', 2.5); OSI.down(t); }
});
Sim.registerView(OSI.view({ id: 'handover', title: 'OS handover check' }));

/* ---- the KVM console: menus, the server's screen, a keyboard ---- */
(() => {
  if (document.getElementById('cis-kvm-css')) return;
  const s = document.createElement('style'); s.id = 'cis-kvm-css';
  s.textContent = `.simui .kvm{position:relative;background:#2B2E31}
.simui .kvm .menu{background:#3A3E42;color:#F1F3F4;border-bottom:1px solid #22262A}
.simui .kvm .menu b{margin-right:8px}
.simui .kvm .menu .mi{background:none;border:0;color:#F1F3F4;padding:3px 6px;font:500 13px var(--font);border-radius:3px;cursor:pointer}
.simui .kvm .menu .mi.on,.simui .kvm .menu .mi:hover{background:#565B60}
.simui .kvm .menu .mx{color:#9AA4AC;padding:3px 6px}
.simui .kvm .menu .cls{margin-left:auto}
.simui .kvm .dd:where(:not(.osx *)){position:absolute;z-index:6;top:38px;background:#F4F5F6;color:#1D2A33;border:1px solid #8E99A3;box-shadow:0 8px 18px rgba(0,0,0,.4);min-width:240px;display:flex;flex-direction:column;padding:3px 0}
.simui .kvm .dd button:where(:not(.osx *)){background:none;border:0;border-radius:0;text-align:left;padding:7px 14px;font:13px var(--font);color:#1D2A33;cursor:pointer}
.simui .kvm .dd button:hover:where(:not(.osx *)){background:#DDE6EE}.simui .kvm .dd button[disabled]:where(:not(.osx *)){color:#9AA7B1;cursor:default;background:none}
.simui .kvm .dd hr{border:0;border-top:1px solid #C9D0D5;margin:3px 0}
.simui .kvm .kscr{margin:8px;background:#000;border:1px solid #111}
.simui .kvm .kscr pre:where(:not(.osx *)){margin:0;padding:60px 24px;min-height:330px;color:#D0D0D0;font:13px/1.5 var(--mono);white-space:pre-wrap;background:#000}
.simui .kvm .kk{display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding:4px 8px 8px;color:#C9D0D5;font-size:12px}
.simui .kvm .kk button{background:#3A3F44;color:#EEE;border:1px solid #5B6268;border-radius:3px;padding:3px 7px;font:700 11px var(--mono)}
.simui .kvm .vmd{position:absolute;z-index:7;left:50%;top:70px;transform:translateX(-50%);width:min(520px,94%);background:#FFF;color:#1D2A33;border:1px solid #6F7A82;box-shadow:0 12px 30px rgba(0,0,0,.5)}
.simui .kvm .vmd header{background:#E7EBEE;padding:8px 12px;font-weight:600;border-bottom:1px solid #C3CBD1}
.simui .kvm .vmd .in{padding:12px}.simui .kvm .vmd .row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center}
.simui .kvm .vmd .fn{border:1px solid #9AA7B1;padding:4px 8px;min-height:22px;overflow-wrap:anywhere;font-size:13px}
.simui .kvm .vmd footer{display:flex;justify-content:flex-end;gap:8px;padding:10px 12px;border-top:1px solid #E3E7EA}
.bmn{position:absolute;inset:0;background:#000;color:#BFBFBF;font:${osU(15)}/${osU(20)} 'DejaVu Sans Mono','Courier New',monospace}
.bmn .bx{position:absolute;left:${osU(190)};right:${osU(190)};top:${osU(180)};border:${osU(2)} solid #BFBFBF;background:#00007A;color:#FFF;padding:${osU(8)} ${osU(14)}}
#stage .bmn .bx h4{margin:0 0 ${osU(8)};font:inherit;text-align:center;color:#FFF}
#stage .bmn .row{display:block;width:100%;padding:0 ${osU(6)};white-space:pre;color:#FFF;background:none;border:0;text-align:left;font:inherit;cursor:pointer}
#stage .bmn .row.f{background:#BFBFBF;color:#00007A}
.bmn .hl{position:absolute;left:0;right:0;top:${osU(470)};text-align:center;white-space:pre}
.mon .scr.osfit{padding:0;height:auto;white-space:normal;overflow:hidden}
@media (max-width:760px){.simui .kvm .kscr,.mon .scr.osfit{overflow-x:auto}.simui .kvm .kscr .osbox,.mon .scr.osfit .osbox{min-width:740px}}`;
  Sim.addCss(s);
})();
// the boot menu at POST (F6), drawn as on the server's screen
function bootMenuHtml(t) {
  const L = [...(t.os ? OSI.bootList(t) : t.flags.hasOS ? [{ id: 'disk', label: 'Rocky Linux' }] : []), { id: 'shell', label: 'UEFI: Built-in EFI Shell' }, { id: 'setup', label: 'Enter Setup' }];
  const sel = Math.min(t.con.bsel || 0, L.length - 1);
  return `<div class="osbox"><div class="osx bmn"><div class="bx"><h4>Please select boot device:</h4>${L.map((b, k) => `<button class="row${k === sel ? ' f' : ''}" data-act="kvmBoot" data-arg="${b.id}">${esc(b.label)}</button>`).join('')}<div style="border-top:${osU(1)} solid #BFBFBF;margin-top:${osU(8)};padding-top:${osU(6)};text-align:center">&uarr; and &darr; to move selection<br>ENTER to select boot device<br>ESC to boot using defaults</div></div></div></div>`;
}
const osScreenOn = t => conPhase(t) === 'final' && t.os && t.con.osb === 'osi';
// the server's screen in the KVM window: the OS screens, the boot menu, or the POST text
function kvmScreen(t) {
  const ph = conPhase(t);
  if (ph === 'bmenu') return bootMenuHtml(t);
  if (osScreenOn(t)) return `<div class="osbox">${OSI.screen(t)}</div>`;
  return `<pre>${esc(hostScreenText(t))}</pre>`;
}
function kvmHtml(t, b) {
  const c = t.cimc, m = c.kvmMenu, md = t.os && t.os.media;
  const mi = (k, l) => `<button class="mi${m === k ? ' on' : ''}" data-act="kvmMenu" data-arg="${k}">${l}</button>`;
  let h = `<div class="kvm cueable"><div class="menu"><b>KVM console</b><span class="mx">File</span><span class="mx">View</span>${mi('macro', 'Macros')}<span class="mx">Tools</span>${mi('power', 'Power')}${mi('boot', 'Boot Device')}${mi('vm', 'Virtual Media')}<span class="mx">Help</span>${b('Close KVM', 'cimcKvmClose', '', 'cls')}</div>`;
  const it = (act, arg, l, dis) => `<button data-act="${act}" data-arg="${arg}"${dis ? ' disabled' : ''}>${l}</button>`;
  if (m === 'power') h += `<div class="dd" style="left:250px">${it('kvmPower', 'on', 'Power On System', t.power === 'on')}${it('kvmPower', 'off', 'Power Off System', t.power !== 'on')}${it('kvmPower', 'reset', 'Reset System (warm boot)', t.power !== 'on')}${it('kvmPower', 'cycle', 'Power Cycle System (cold boot)', t.power !== 'on')}</div>`;
  if (m === 'macro') h += `<div class="dd" style="left:130px">${it('kvmKey', 'CtrlAltDel', 'Ctrl+Alt+Del')}${it('kvmKey', 'AltF1', 'Alt+F1')}${it('kvmKey', 'AltF2', 'Alt+F2')}</div>`;
  if (m === 'boot') h += `<div class="dd" style="left:310px">${it('kvmBootDev', 'none', `${!t.os || !t.os.next ? '&#10003; ' : ''}No Override`)}${(t.os ? OSI.bootList(t) : []).map(x => it('kvmBootDev', x.id, `${t.os.next === x.id ? '&#10003; ' : ''}${esc(x.label)}`)).join('')}</div>`;
  if (m === 'vm') h += `<div class="dd" style="left:400px">${it('kvmVm', 'create', 'Create Image')}${it('kvmVm', 'activate', c.vmAct ? 'Deactivate Virtual Devices' : 'Activate Virtual Devices')}<hr>${md ? it('kvmVm', 'unmap', `&#10003; Unmap CD/DVD: ${esc(md)}`) : it('kvmVm', 'map', 'Map CD/DVD...', !c.vmAct)}${it('kvmVm', 'rem', 'Map Removable Disk...', !c.vmAct)}${it('kvmVm', 'fd', 'Map Floppy Disk...', !c.vmAct)}</div>`;
  h += `<div class="kscr" tabindex="0" aria-label="Server screen">${kvmScreen(t)}</div>`;
  const base = [['Esc', 'Esc'], ['F2', 'F2'], ['F6', 'F6'], ['F8', 'F8'], ['Up', '&uarr;'], ['Down', '&darr;'], ['Enter', 'Enter'], ['Space', 'Space'], ['CtrlAltDel', 'Ctrl+Alt+Del']], ext = t.os ? OSI.keys(t).filter(([k]) => !base.some(x => x[0] === k)) : [];
  h += `<div class="kk"><span>Keyboard (through the KVM):</span>${base.map(([k, l]) => `<button data-act="kvmKey" data-arg="${k}">${l}</button>`).join('')}${ext.map(([k, l]) => `<button data-act="osKey" data-arg="${k}">${l}</button>`).join('')}</div>`;
  if (c.vmDlg) h += `<div class="vmd" role="dialog" aria-label="Virtual Media - Map CD/DVD"><header>Virtual Media - Map CD/DVD</header><div class="in"><div class="row"><span>Drive/Image File:</span><span class="fn">${esc(c.vmFile || '')}</span><button data-act="kvmBrowse" data-arg="">Browse...</button></div><p style="margin:10px 0 0"><button class="chk" role="checkbox" aria-checked="true" disabled>&#10003;</button> Read Only</p></div><footer><button class="blue" data-act="kvmMap" data-arg="">Map Drive</button><button data-act="kvmMapCancel" data-arg="">Cancel</button></footer></div>`;
  if (t.os && t.os.dlg) h += OSI.fileDialog(t, 'Open: image file for the virtual CD/DVD');
  return h + '</div>';
}
// Cisco IMC, Compute, BIOS: the boot order the server reports
function cimcCompute(t, b) {
  const L = t.os ? OSI.bootList(t) : t.flags.hasOS ? [{ id: 'disk', label: 'Rocky Linux', os: true }] : [];
  const rows = [...L.filter(x => x.os).map(x => [x.label, 'UEFI', 'HDD']), ...(t.os && t.os.media ? [['Cisco vKVM-Mapped vDVD1.22', 'UEFI', 'VMEDIA']] : []), ['UEFI: Built-in EFI Shell', 'UEFI', 'EFI'], ['UEFI: PXE IPv4 Cisco VIC Ethernet Interface', 'UEFI', 'PXE']];
  return `<div class="tabs">${b('BIOS', 'cimcMisc', 'tab', 'on')}${b('Remote Management', 'cimcMisc', 'Remote Management')}${b('Troubleshooting', 'cimcMisc', 'Troubleshooting')}${b('Power Policies', 'cimcMisc', 'Power Policies')}${b('PID Catalog', 'cimcMisc', 'PID Catalog')}</div><h4 style="margin-top:0">BIOS Properties</h4><div class="kv"><span>Running Version:</span><span>C240M4.4.1.2c.0.0202211901</span><span>UEFI Secure Boot:</span><span>Disabled</span><span>Actual Boot Mode:</span><span>Uefi</span><span>Configured Boot Mode:</span><span>UEFI</span><span>Last Configured Boot Order Source:</span><span>BIOS</span></div>
<h4>Actual Boot Order</h4><table><tr><th>Name</th><th>Boot Mode</th><th>Type</th></tr>${rows.map(r => `<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table><p class="cap" style="font-size:12.5px;margin-top:8px">Cisco IMC reads this list from the BIOS: the installed operating system's own UEFI entry comes first.</p>`;
}
Sim.on('kvmMenu', k => { const c = T.cimc; c.kvmMenu = c.kvmMenu === k ? null : k; });
Sim.on('kvmPower', k => {
  const c = T.cimc; c.kvmMenu = null;
  if (k === 'on') { if (T.power === 'on') return say('info', 'The host is already on.'); return Sim.actions.powerOn(); }
  if (T.power !== 'on') return say('info', 'The host is off: Power On System first.');
  if (k === 'off') return Sim.actions.shutdown();
  startPost(T); Sim.sound('fans');
  say('ok', k === 'reset' ? 'Reset System (warm boot): the server restarts and runs its power-on self-test.' : 'Power Cycle System (cold boot): power off, then on again; the server runs its power-on self-test.');
});
Sim.on('kvmBootDev', id => { const c = T.cimc; c.kvmMenu = null; if (!T.os) return say('info', 'Boot Device: not used in this lab.'); if (id === 'none') { T.os.next = null; return say('info', 'No Override: the server follows its boot order.'); } OSI.pickBoot(T, id); say('ok', `Boot Device: the next start boots ${id === 'cd' ? 'the image on the virtual CD (Cisco vKVM-Mapped vDVD)' : 'the installed system'}. Restart the server to use it.`); });
Sim.on('kvmVm', k => {
  const c = T.cimc; c.kvmMenu = null;
  if (k === 'activate') { c.vmAct = !c.vmAct; if (!c.vmAct && T.os && T.os.media) OSI.eject(T); return say('info', c.vmAct ? 'Virtual devices activated: the server now sees a virtual CD/DVD drive, removable disk and floppy drive.' : 'Virtual devices deactivated.'); }
  if (k === 'create') return say('info', 'Create Image makes an image file from a folder. Not needed here: the images are ready on the laptop.');
  if (!c.vmAct) return say('warn', 'Activate Virtual Devices first.');
  if (!T.os) return say('info', 'Virtual media: not used in this lab. The OS install labs map their ISO here.');
  if (k === 'map') { c.vmDlg = true; c.vmFile = ''; return; }
  if (k === 'unmap') return OSI.eject(T);
  say('info', { rem: 'Map Removable Disk: a USB key image. The installers are DVD images: Map CD/DVD.', fd: 'Map Floppy Disk: not used.' }[k]);
});
Sim.on('kvmBrowse', () => { if (!T.os) return; OSI.openDialog(T, { mount: false, then: 'kvmFile' }); });
Sim.on('kvmFile', f => { T.cimc.vmFile = f; });
Sim.on('kvmMap', () => { const c = T.cimc; if (!c.vmFile) return say('warn', 'Browse to the image file first.'); c.vmDlg = false; OSI.mount(T, c.vmFile); });
Sim.on('kvmMapCancel', () => { T.cimc.vmDlg = false; });
Sim.on('kvmBoot', id => keyIn('boot:' + id));
Sim.on('kvmKey', k => { T.cimc.kvmMenu = null; keyIn(k, true); });

/* ---- the Cisco IMC side of the OS labs: the steps around the installer ---- */
const OC = (act, arg, say) => ({ act, arg, say });
const osm = t => t.os.m;
const osCon = (t, fn) => { const c = t.cimc; if (!c.auth || c.tab !== 'app') return loginCue(t); if (!c.kvm) return OC('cimcKvm', '', 'Click Launch KVM.'); return fn(t); };
function osMountCue(t) {
  const s = t.os, c = t.cimc, want = OSI.want(t);
  if (s.dlg) return s.pick !== want ? OC('osPick', want, `Choose ${want}.`) : OC('osDlg', 'ok', 'Click Open.');
  if (c.vmDlg) return c.vmFile !== want ? OC('kvmBrowse', '', 'Click Browse... and choose the image.') : OC('kvmMap', '', 'Click Map Drive.');
  if (s.media === want) return null;
  if (c.kvmMenu !== 'vm') return OC('kvmMenu', 'vm', s.media ? 'Wrong image: open Virtual Media to unmap it.' : 'Open the Virtual Media menu.');
  if (s.media) return OC('kvmVm', 'unmap', 'Unmap the wrong image.');
  return !c.vmAct ? OC('kvmVm', 'activate', 'Click Activate Virtual Devices.') : OC('kvmVm', 'map', 'Click Map CD/DVD...');
}
function osBootCue(t) {
  const c = t.cimc, s = t.os, ph = conPhase(t);
  if (s.media !== OSI.want(t)) return osMountCue(t);
  if (t.power !== 'on') return c.kvmMenu !== 'power' ? OC('kvmMenu', 'power', 'The host is off: open the Power menu.') : OC('kvmPower', 'on', 'Click Power On System.');
  if (['nosig', 'mem', 'plat'].includes(ph)) return { say: 'Wait: memory and platform checks. Get ready to press F6.' };
  if (ph === 'logo') return t.con.f6 ? { say: 'F6 pressed: the boot menu opens after the storage controller.' } : OC('kvmKey', 'F6', 'Press F6 now: Boot Menu.');
  if (ph === 'bmenu') return OC('kvmBoot', 'cd', 'Choose UEFI: Cisco vKVM-Mapped vDVD1.22.');
  if (ph === 'entering' || ph === 'sas' || ph === 'saving' || ph === 'leaving') return { say: 'Wait.' };
  if (s.m.cd) return null;
  return c.kvmMenu !== 'power' ? OC('kvmMenu', 'power', 'Restart the server: open the Power menu.') : OC('kvmPower', 'reset', 'Click Reset System (warm boot).');
}
const CIS_OS = {
  view: 'cimc', con: osCon,
  mount: [
    { view: 'cimc', text: 'Launch the KVM console', hint: 'From the Cisco IMC toolbar: Launch KVM.', done: t => !!(t.flags.os1 = t.flags.os1 || t.cimc.kvm || !!t.os.media), cue: t => osCon(t, () => null) },
    { view: 'cimc', text: 'Virtual Media: Activate Virtual Devices', hint: 'The server then sees a virtual CD/DVD drive over the KVM session.', done: t => !!(t.cimc.vmAct || t.os.media || OSI.newSys(t)), cue: t => osCon(t, osMountCue) },
    { view: 'cimc', get text() { return `Virtual Media: Map CD/DVD, Browse, ${OSI.want(T)}, Map Drive`; }, hint: 'The image is on your laptop, in Downloads. Several look alike: check the name before you open it.', done: t => t.os.media === OSI.want(t) || OSI.newSys(t), cue: t => osCon(t, osMountCue) }],
  boot: [
    { view: 'cimc', text: 'Restart the server: Power, Reset System (warm boot)', hint: 'This erases nothing: the installer asks before it touches a disk.', done: t => !!(osm(t).reset || osm(t).cd || OSI.newSys(t)), cue: t => osCon(t, osBootCue) },
    { view: 'cimc', text: 'At the Cisco screen, press F6: Boot Menu', hint: 'The prompt shows F2 Setup, F6 Boot Menu, F7 Diagnostics, F8 Cisco IMC Configuration, F12 Network Boot. Boot Device in the KVM menu does the same before a restart.', done: t => !!(osm(t).f11 || osm(t).cd || OSI.newSys(t)), cue: t => osCon(t, osBootCue) },
    { view: 'cimc', text: 'Choose UEFI: Cisco vKVM-Mapped vDVD1.22', hint: 'The image mapped through the KVM: the server sees it as a DVD drive.', done: t => !!(osm(t).cd || OSI.newSys(t)), cue: t => osCon(t, osBootCue) }],
  eject: { view: 'cimc', text: 'Virtual Media: unmap the CD/DVD', hint: 'The installer is finished with it. Left mapped, a later restart could boot it again.', done: t => OSI.newSys(t) && !t.os.media,
    cue: t => osCon(t, t => t.cimc.kvmMenu !== 'vm' ? OC('kvmMenu', 'vm', 'Open the Virtual Media menu.') : OC('kvmVm', 'unmap', 'Click Unmap CD/DVD.')) },
  readback: { view: 'cimc', get text() { return `In Cisco IMC, Compute, BIOS: the new ${OSI.meta(T.os.wo).entry} entry in the Actual Boot Order`; }, hint: 'The installer added its UEFI boot entry: Cisco IMC reads the boot order from the BIOS.', done: t => !!t.flags.osBootSeen,
    cue: t => { const c = t.cimc; if (!c.auth || c.tab !== 'app') return loginCue(t); if (c.kvm) return OC('cimcKvmClose', '', 'Close the KVM console.'); if (!c.menu) return OC('cimcMenu', '', 'Open the navigation menu: the button at the top left.'); return OC('cimcNav', 'compute', 'Click Compute.'); } }
};
// the lab's server: built and racked, Cisco IMC on the management network, running its previous OS (Rocky Linux
// 8.10) on the RAID virtual drive
function osLabSetup(os) { return () => { const t = buildFull(); OSI.init(t, os, true); t.con.osb = 'old'; return t; }; }
