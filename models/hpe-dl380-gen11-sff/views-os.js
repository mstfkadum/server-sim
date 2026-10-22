/* ---- The operating system install over iLO virtual media (engine/os-*.js): this server as an installed OS sees it,
   and the iLO side of the install: the HTML5 remote console, its Virtual Drives menu, the One-Time Boot Menu (F11 at
   POST), ejecting the image, and the new boot entry in iLO, Administration, Boot Order. The disks: the NS204i-u boot
   device (two 480 GB M.2 NVMe SSDs in hardware RAID 1, one disk to the OS) and, when it exists, the MR416i-o volume
   over the front SSDs. The data ports: the OCP 15 Broadcom BCM57412, port 1 to SW01 and port 2 to SW02, link up only
   when cabled to the schedule. Device names, MAC addresses and identifiers are the lab's own. ---- */
const OSNET = { host: LAB.host, ip: '10.1.40.17', mask: '255.255.255.0', prefix: 24, gw: '10.1.40.1', dns: '10.1.40.1', subnet: '10.1.40.0/24' };
const NS204 = 480103981056;
Sim.osHost({
  id: 'hpe', bmc: 'iLO', conName: 'iLO web interface, HTML5 remote console',
  vendor: 'HPE', product: PROFILE.product, sku: PROFILE.productId, family: 'ProLiant', serial: LAB.serial, uuid: LAB.uuid, smbios: '3.6.0',
  bios: { vendor: 'HPE', ver: 'U54', date: '01/17/2025' },
  cpu: t => ({ model: 'Intel(R) Xeon(R) Gold 6430', sockets: cpuCount(t), cores: CATALOG.cpu.cores, mhz: 2100, max: 3400, min: 800, modelNo: 143, step: 8, phys: 46, virt: 57,
    l1d: `${1.5 * cpuCount(t)} MiB (${32 * cpuCount(t)} instances)`, l1i: `${cpuCount(t)} MiB (${32 * cpuCount(t)} instances)`, l2: `${64 * cpuCount(t)} MiB (${32 * cpuCount(t)} instances)`, l3: `${60 * cpuCount(t)} MiB (${cpuCount(t)} instances)` }),
  socketName: k => `Proc ${k + 1}`,
  dimms: t => ['P1', 'P2'].flatMap(p => { const n = procSlots(t, p).length; return Array.from({ length: 16 }, (_, k) => { const id = `${p}-${k + 1}`, d = t.dimms[id] ? dimmOf(t, id) : null; return { loc: `PROC ${p[1]} DIMM ${k + 1}`, bank: 'Not Specified', gb: d ? d.cap : 0, type: 'DDR5', detail: 'Synchronous Registered (Buffered)', speed: 4800, cfg: n > 8 ? 4400 : 4800, unit: 'MT/s', ranks: d ? d.ranks : 0 }; }); }),
  memGB: t => memGB(t),
  disks: t => {
    const v = t.vol, n = v.members.length, L = [];
    if (n) { const data = v.raid === 'RAID 6' ? n - 2 : v.raid === 'RAID 5' ? n - 1 : v.raid === 'RAID 10' || v.raid === 'RAID 1' ? n / 2 : n; L.push({ dev: 'sda', model: 'MR416i-o Gen11', vendor: 'HPE', bytes: data * 960197124096, tran: '', rota: 0, sector: 512, serial: '600062b2ce0a4c802c60f0a1b4e3d901', label: `the ${v.raid} data volume on the MR416i-o (${n} front SSDs)`, boot: false, esx: 'naa.600062b2ce0a4c802c60f0a1b4e3d901', esxDisp: 'Local HPE Disk (naa.600062b2ce0a4c802c60f0a1b4e3d901)', esxVendor: 'HPE', esxModel: 'MR416i-o Gen11' }); }
    L.push({ dev: 'nvme0n1', model: 'HPE NS204i-u Gen11 Boot Controller', vendor: '', bytes: NS204, tran: 'nvme', rota: 0, sector: 512, serial: 'PWXKV0BRHL40AA', label: 'the NS204i-u boot device (two 480 GB M.2 SSDs in RAID 1)', boot: true, esx: 't10.NVMe____HPE_NS204iu_Gen11_Boot_Controller____000000000001', esxDisp: 'Local NVMe Disk (t10.NVMe____HPE_NS204iu_Gen11_Boot_Controller____000000000001)', esxVendor: 'NVMe', esxModel: 'HPE NS204i-u Gen' });
    return L;
  },
  nics: t => [1, 2].map(p => ({ dev: `ens15f${p - 1}np${p - 1}`, alt: `enp22s0f${p - 1}np${p - 1}`, esx: `vmnic${p - 1}`, mac: `94:40:C9:3A:5C:1${p - 1}`, drv: 'bnxt_en', esxDrv: 'bnxtnet', fw: '226.0.145.0/pkg 226.1.107.0', pci: `0000:16:00.${p - 1}`,
    vendor: 'Broadcom Inc. and subsidiaries', model: 'BCM57412 NetXtreme-E 10Gb RDMA Ethernet Controller (rev 01)', esxDesc: 'Broadcom NetXtreme E-Series Dual-port 10Gb SFP+ Ethernet OCP 3.0 Adapter',
    label: `OCP 15 port ${p}`, speed: 10000, port: 'da', link: cabOk(t, `ocp${p}`), to: `${p === 1 ? 'SW01' : 'SW02'} port 24`, want: p === 1 })),
  pci: ['00:00.0 Host bridge: Intel Corporation Device 09a2 (rev 20)', '00:14.0 USB controller: Intel Corporation Device 1bcd (rev 11)', '01:00.0 System peripheral: Hewlett-Packard Company Integrated Lights-Out Standard Slave Instrumentation & System Support (rev 07)', '01:00.1 VGA compatible controller: Matrox Electronics Systems Ltd. MGA G200eH3 (rev 02)', '15:00.0 RAID bus controller: Broadcom / LSI MegaRAID 12GSAS/PCIe Secure SAS39xx (HPE MR416i-o Gen11)', 'c2:00.0 Non-Volatile memory controller: Marvell Technology Group Ltd. Device 2241 (HPE NS204i-u Gen11 Boot Controller)'],
  ctlTool: 'The MR416i-o is managed from iLO or with storcli, from HPE\'s Service Pack for ProLiant.',
  net: OSNET,
  isos: [{ file: 'VMware-ESXi-8.0.3-24022510-HPE-803.0.0.11.7.0.23-Jul2024.iso', os: 'esxi', size: '0.7 GB', date: '15/07/2024' }],
  genericWhy: 'VMware\'s generic installer image: it lacks the drivers and tools HPE adds for its servers, the Agentless Management Service among them (it reports the OS to iLO). The work order asks for HPE\'s custom image for ESXi',
  genericScreen: ['Loading ESXi installer', '', 'VMware ESXi 8.0.3, VMware\'s generic image.', '', 'It installs, but without HPE\'s drivers and management tools:', 'iLO would not see the operating system (no Agentless Management Service).'],
  vibs: [['amsdv', '803.11.12.0-1', 'HPE'], ['bnxtnet', '230.0.143.0-1OEM', 'BCM'], ['ilo', '803.11.10.0-1', 'HPE'], ['lsi-mr3', '7.727.03.00-1OEM', 'BCM'], ['nvme-pcie', '1.2.4.11-1vmw', 'VMware'], ['ssacli2', '6.40.6.0-8.0.0', 'HPE']],
  cdLabel: 'iLO Virtual USB 3 : iLO Virtual CD-ROM', cdModel: 'Virtual DVD-ROM',
  entry: name => name, old: { entry: 'Rocky Linux', name: 'Rocky Linux 9.5' },
  reboot: t => rebootSrv(t),
  powerOff: t => { t.power = 'standby'; Sim.soundStop('fans', 2.5); OSI.down(t); }
});
Sim.registerView(OSI.view({ id: 'handover', title: 'OS handover check' }));

/* ---- the iLO side of the OS labs: the steps around the installer ---- */
const OC = (act, arg, say) => ({ act, arg, say });
const osm = t => t.os.m;
// the server's screen through iLO: logged in on the management network, the HTML5 remote console open
const osCon = (t, fn) => webCue(t, liveIp(t)) || (t.ilo.ue || t.ilo.dlg ? OC('wuCancel', '', 'Close the dialog first.') : !t.ilo.rc ? OC('rcOpen', '', 'Open the HTML5 remote console: click the console preview at the bottom left of the menu.') : fn(t));
function osMountCue(t) {
  const s = t.os, want = OSI.want(t);
  if (s.dlg) return s.pick !== want ? OC('osPick', want, `Choose ${want}.`) : OC('osDlg', 'ok', 'Click Open.');
  if (s.media === want) return null;
  if (!t.ilo.vm) return OC('vmMenu', '', s.media ? 'Wrong image: open Virtual Drives (the disc icon) to disconnect it.' : 'Click the Virtual Drives icon (the disc) at the top of the console.');
  return OC('vmPick', 'cd', s.media ? 'Click Image File CD/DVD-ROM: it disconnects the wrong image.' : 'Choose Image File CD/DVD-ROM.');
}
function osBootCue(t) {
  const c = t.con, s = t.os;
  if (s.media !== OSI.want(t)) return osMountCue(t);
  if (!isOn(t)) return t.ilo.menu === 'power' ? OC('rcPower', 'momentary', 'Click Momentary Press: the server powers on.') : OC('rcMenu', t.ilo.menu ? 'power' : 'main', t.ilo.menu ? 'Click Power.' : 'The server is off: open the console menu (the iLO icon), then Power.');
  if (c.mode === 'secure' || c.mode === 'post') return { say: 'Wait: POST. Get ready to press F11 when the screen offers the Boot Menu.' };
  if (c.mode === 'summary') return OC('rcKey', 'F11', 'Press F11 now: One-Time Boot Menu.');
  if (c.mode === 'f9' || c.mode === 'boot') return { say: 'Wait.' };
  if (c.mode === 'rbsu') { const r = t.rb; if (r.dlg) return r.dlg.kind === 'starting' ? { say: 'Wait.' } : OC('rbDlg', 'cancel', 'Close the dialog.'); return rbRoute(t, 'otb') || OC('rbGo', 'otb:cd', 'Choose iLO Virtual USB 3 : iLO Virtual CD-ROM.'); }
  if (s.m.cd) return null;
  return t.ilo.menu === 'power' ? OC('rcPower', 'reset', 'Click Reset: the server restarts and runs POST.') : OC('rcMenu', t.ilo.menu ? 'power' : 'main', t.ilo.menu ? 'Click Power.' : 'Restart the server from the console menu (the iLO icon at the top left): Power, Reset.');
}
const HPE_OS = {
  view: 'web',
  con: osCon,
  mount: [
    { view: 'web', text: 'Open the HTML5 remote console', hint: 'From the iLO web interface: the console preview at the bottom left of the menu, or Remote Console & Media, Launch.', done: t => once2(t, 'os1', t.ilo.rc || !!t.os.media), cue: t => osCon(t, () => null) },
    { view: 'web', get text() { return `Virtual Drives (the disc icon): Image File CD/DVD-ROM, ${OSI.want(T)}`; }, hint: 'The image is on your laptop, in Downloads. Several look alike: check the name before you open it.', done: t => t.os.media === OSI.want(t) || OSI.newSys(t), cue: t => osCon(t, osMountCue) }],
  boot: [
    { view: 'web', text: 'Restart the server: the console menu, Power, Reset', hint: 'This erases nothing: the installer asks before it touches a disk.', done: t => !!(osm(t).reset || osm(t).cd || OSI.newSys(t)), cue: t => osCon(t, osBootCue) },
    { view: 'web', text: 'At POST, press F11: One-Time Boot Menu', hint: 'F11 shows at the bottom of the POST screen, beside F9. A one-time boot does not change the boot order.', done: t => !!(osm(t).f11 || osm(t).cd || OSI.newSys(t)), cue: t => osCon(t, osBootCue) },
    { view: 'web', text: 'Choose iLO Virtual USB 3 : iLO Virtual CD-ROM', hint: 'The image on the virtual CD: the server sees it as a USB DVD drive.', done: t => !!(osm(t).cd || OSI.newSys(t)), cue: t => osCon(t, osBootCue) }],
  eject: { view: 'web', text: 'Eject the ISO: Virtual Drives, click Image File CD/DVD-ROM', hint: 'The installer is finished with it. Left in, a later restart could boot it again.', done: t => OSI.newSys(t) && !t.os.media,
    cue: t => osCon(t, t => !t.ilo.vm ? OC('vmMenu', '', 'Click the Virtual Drives icon (the disc).') : OC('vmPick', 'cd', 'Click Image File CD/DVD-ROM: the image disconnects.')) },
  readback: { view: 'web', get text() { return `In iLO, Administration, Boot Order: the new ${OSI.meta(T.os.wo).entry} entry`; }, hint: 'The installer added its UEFI boot entry at the top of the boot order: iLO reads it from the server.', done: t => !!t.flags.osBootSeen, cue: t => navCue(t, 'adm', 'boot', 'Open Administration in the menu.', liveIp(t)) || { say: 'The new entry is first in the UEFI Boot Order.' } }
};
// the lab's server: running its previous OS (Rocky Linux 9.5, from the new build) on the NS204i-u, iLO on the
// management network at the work order's address and password, the laptop on the same network
function osLabSetup(os) {
  return () => {
    const t = buildFull();
    t.iloCfg.net = { ...NET0, dhcp: 'OFF', ip: WO.ip, mask: WO.mask, gw: WO.gw }; t.iloCfg.live = { ...t.iloCfg.net }; t.iloCfg.users[0].pw = WO.pw;
    t.net = 'mgmt'; t.mgmtLink = true; t.cabLbl = { ilo: true, ocp1: true, ocp2: true, ps1: true, ps2: true }; t.cabDressed = true; t.iloLic = 'iLO Advanced';
    OSI.init(t, os, true);
    return t;
  };
}
