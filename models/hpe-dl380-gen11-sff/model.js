/* ==========================================================================================================
   Model pack: HPE ProLiant DL380 Gen11, 24 SFF. Profile, parts, twin state and shared helpers.
   Sources: HPE ProLiant DL380 Gen11 Server User Guide (extending the server from the rack, access panel, air baffle,
   processor heatsink module, DIMMs, hot-plug drives, front panel LEDs and buttons, drive LEDs, the system board and the
   rear panel); HPE Server Memory population rules for Gen11 (4th Gen Intel Xeon);
   iLO 6 User Guide (default account, iLO Service Port, network settings and user accounts in the iLO 6 Configuration
   Utility); the service label inside this server's access panel; the trainer's photos of this server and the screen
   recording of its iLO 6 web interface, POST and System Utilities. © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved.
   ========================================================================================================== */
const PROFILE = {
  name: 'HPE ProLiant DL380 Gen11, 24 SFF', product: 'ProLiant DL380 Gen11', productId: 'P52535-B21', socket: 'LGA4677', memGen: 'DDR5',
  bays: 24, boxes: 3, perBox: 8,
  // the service label: P2 on the left, P1 on the right (front of the server at the bottom). Slots 1 to 8 left of each
  // processor and 9 to 16 right of it, numbered left to right; white (first slot of a channel) is the one farther from
  // the processor: the odd slots left of a processor, the even ones right of it
  // HPE's population order and the supported counts (4th Gen Xeon, 16 slots per processor): FILL and OKN in views-mem.js
  torque: '0.9 N·m (8 in-lb)', tool: 'T-30 Torx',
};
// invented lab values: the server's own serial number, addresses and iLO password stay off the page
const LAB = { serial: 'CZ2LAB0001', ilo: 'ILOCZ2LAB0001', user: 'Administrator', pw: 'LAB7Q4WN', svcIp: '169.254.1.2',
  mac: '94:40:C9:3A:5B:12', ll: 'FE80::9640:C9FF:FE3A:5B12', uuid: '36353543-3434-5A43-324C-414230303031', host: 'dl380-lab01' };
// the work order for iLO on the management network (the trainer's lab network): a static address and a new
// Administrator password, replacing the pull-tab one. The laptop is on the same management network.
const WO = { ip: '10.1.23.17', mask: '255.255.255.0', gw: '10.1.23.1', pw: 'password87', pcIp: '10.1.23.50', subnet: '10.1.23.0/24' };
// iLO 6 account privileges, in the order the iLO 6 Configuration Utility lists them
const PRIVS = [['login', 'Login'], ['admin', 'Administer User Accounts'], ['rc', 'Remote Console Access'], ['vpr', 'Virtual Power and Reset'], ['vm', 'Virtual Media'], ['cfg', 'Configure Settings'], ['bios', 'Host BIOS'], ['nic', 'Host NIC'], ['stor', 'Host Storage'], ['rec', 'Recovery Set']];
const allPriv = v => Object.fromEntries(PRIVS.map(([k]) => [k, v]));
// iLO network settings as delivered: dedicated port on, DHCP on (and no DHCP server on the management network)
const NET0 = { nic: 'ON', autoSpeed: 'ON', speed: '1000 Mbps', duplex: 'Full', vlan: 'OFF', vlanId: '0', dhcp: 'ON', dns: LAB.ilo, ip: '0.0.0.0', mask: '0.0.0.0', gw: '0.0.0.0' };
// iLO settings: net (saved), live (in use since the last iLO reset), users
const newIloCfg = () => ({ net: { ...NET0 }, live: { ...NET0 }, users: [{ name: 'Administrator', login: 'Administrator', pw: LAB.pw, priv: allPriv('YES') }], resetAt: 0, resets: 0 });
// the server's screen: off, secure (Secure Start), post, summary (with the F9 to F12 prompt), f9, rbsu (System Utilities), boot, os, noboot
const newCon = () => ({ mode: 'off', t: 0, boots: 0 });
const newAdd = () => ({ name: '', login: '', pw: '', priv: Object.fromEntries(PRIVS.map(([k]) => [k, k === 'login' ? 'YES' : 'NO'])) });
// System Utilities: the page path, the selected row, an open list, a dialog, and the pending changes of the iLO 6 Configuration Utility
const newRb = () => ({ path: ['home'], sel: 'syscfg', open: null, dlg: null, started: false, form: null, edit: {}, add: newAdd(), misc: { lang: 'English', browser: 'Auto', factory: 'NO', resetIlo: 'NO' }, pend: false });
/* ---- HPE DDR5-4800 RDIMMs for the DL380 Gen11 with 4th Gen Intel Xeon: HPE's memory population paper for Gen11
   (a50007437enw, table 15). ranks, data width (x4 or x8), DRAM density in Gb, 3DS (stacked) or standard: HPE's rules do
   not mix x4 with x8 on a processor, DRAM densities, or 3DS with standard RDIMMs. The 256 GB RDIMMs need the High
   Performance Fan Kit and at most two front drive cages (QuickSpecs): this server has three, so they are listed but not
   supported here. ---- */
const RANKN = { 1: 'Single', 2: 'Dual', 4: 'Quad', 8: 'Octal' };
const DIMMK = {};
[['r16', 'P43322-B21', 16, 1, 8, 16], ['r32s', 'P43325-B21', 32, 1, 4, 16], ['r32', 'P43328-B21', 32, 2, 8, 16], ['r64', 'P43331-B21', 64, 2, 4, 16],
  ['r96', 'P66675-B21', 96, 2, 4, 24], ['r128r', 'P69974-B21', 128, 2, 4, 32], ['r128', 'P43334-B21', 128, 4, 4, 16, true], ['r256', 'P43337-B21', 256, 8, 4, 16, true], ['r256q', 'P90550-B21', 256, 4, 4, 32, true]]
  .forEach(([key, pid, cap, ranks, width, dram, td]) => { const org = `${ranks}Rx${width}`, kind = td ? '3DS RDIMM' : 'RDIMM';
    DIMMK[key] = { key, pid, cap, ranks, width, dram, td: !!td, org, name: `HPE ${cap} GB ${RANKN[ranks]} Rank x${width} DDR5-4800 Registered${td ? ' 3DS' : ''} Smart Memory`,
      short: `${cap} GB ${org} ${kind}`, tiny: `${cap} GB ${org} ${kind}`, label: `${cap}GB ${org} DDR5-4800 ${kind}`, type: `DDR5 ${kind}` }; });
const CATALOG = {
  cpu: { pid: 'P49614-B21', name: 'Intel Xeon Gold 6430', short: 'Xeon Gold 6430', cores: 32, ghz: 2.1, watts: 270, socket: 'LGA4677' },
  // the two DIMM types in the box of the build labs: 32 GB 2Rx8 RDIMMs and 128 GB 3DS RDIMMs, never mixed in one server
  dimm: DIMMK.r32, dimm3ds: DIMMK.r128,
  ssd: { label: 'SSD SATA DS 960 GB P41523', name: 'HPE 960 GB SATA SSD, SFF basic carrier', short: '960 GB SATA SSD', cap: 960 },
};

/* ============ twin state ============ */
// the two other DL380 Gen11 servers in the same part of the rack (invented serials, deliberately alike): another new
// build waiting for its own job, and a production server shut down for another team's maintenance. order: the three servers top to bottom ('us' = this one)
const MATES = { twin: { serial: 'CZ2LAB0010', run: false }, live: { serial: 'CZ2LAB0100', run: true } };
const newSlot = () => ({ pos: 'in', lev: { l: false, r: false }, rel: { l: false, r: false } });
function fresh() {
  return {
    esd: false, cover: 'closed', baffle: true,
    // in the rack: 'in' (pushed in, quick-release levers engaged) or 'out' (extended on its rails, locked in the service
    // position); lev: a quick-release lever held pulled down; rel: a rail-release latch held pressed
    // order, mates, tabs: the three servers in the rack and the other two's levers, rails and pull tabs; read: serial number pull tabs read (by
    // position, 0 = top); look: the label shown close up; sel: the server being handled; idCheck: identify it by serial first
    rack: { pos: 'in', lev: { l: false, r: false }, rel: { l: false, r: false }, order: ['live', 'us', 'twin'], mates: { twin: newSlot(), live: newSlot() }, read: {}, look: null, sel: null, idCheck: false },
    // socket 2: 'blank' (processor blank and socket cover), 'cover' (socket cover only), 'empty', 'phm' (module seated)
    // rep: processor 2 being installed or replaced (views-cpurep.js), null when nothing is under way
    sock2: 'phm', nuts2: [1, 1, 1, 1], wires2: 'locked', rep: null, hold: null,
    // dimms: slot to DIMM type (a DIMMK key); memBox: DIMMs still in their packaging, by type; memLeft: unpacked, on the
    // mat; memPick: the type fitted next. The build labs' box: 32 of each of the two types
    dimms: {}, memOpen: {}, memBox: { r32: 32, r128: 32 }, memLeft: {}, memPick: 'r32',
    bays: Array.from({ length: PROFILE.bays }, () => ({ st: 'drive', health: 'ok', ins: false, rel: false, pct: 100 })),
    // the front drives' volume on the MR416i-o controller: its member bays (a lab value: RAID 6 over the fitted drives)
    vol: { raid: 'RAID 6', members: Array.from({ length: PROFILE.bays }, (_, i) => i) },
    sel: { bay: 0, box: 0, slot: null }, hand: null, ssdKit: 0, blanks: 0, rma: false,
    ac: { ps1: false, ps2: false }, acAt: 0, power: 'off', postAt: 0, posted: false, uid: false, pullTab: false, tabSide: 'sn',
    // the laptop's network: svc (on the front iLO Service Port) or mgmt (on the management switch, like the rear iLO port)
    // crash: a monitor (VGA) and a USB keyboard and mouse at the rear; mgmtLink: the rear iLO Management Port cabled to the management switch
    crash: { vga: false, kbd: false }, mgmtLink: true,
    // the cables at the rear (Cabling view): each server port to 'DEVICE:port', or null; one in hand; labels; dressed
    cab: { ilo: 'MGT01:14', ocp1: 'SW01:24', ocp2: 'SW02:24', ps1: null, ps2: null }, cabSel: null, cabLbl: {}, cabDressed: false,
    laptop: false, net: 'svc', pcIp: WO.pcIp, ilo: { page: 'blank', url: '', host: '', certOk: {}, auth: false, user: '', nav: 'info', subs: {}, form: {}, seen: {}, msg: '', rc: false, menu: null, usel: null, ue: null, wf: null, dlg: null },
    iloCfg: newIloCfg(), con: newCon(), rb: newRb(),
    flags: {}, errors: 0, log: []
  };
}
// the server as set up: both processors, 16 DIMMs (8 per processor, one in every channel), 24 SSDs, cover on, cabled, running
function buildFull() {
  const t = fresh();
  layoutOf(8).forEach(n => { t.dimms['P1-' + n] = true; t.dimms['P2-' + n] = true; }); t.memBox.r32 = 16;
  t.ac = { ps1: true, ps2: true }; t.cab.ps1 = 'PDUA:6'; t.cab.ps2 = 'PDUB:6'; t.acAt = 0; t.power = 'on'; t.posted = true; t.flags.iloUp = true; t.flags.hasOS = true; t.con.mode = 'os';
  return t;
}
const acOn = t => t.ac.ps1 || t.ac.ps2;
const isOn = t => t.power === 'on' || t.power === 'post';
// power state follows the cords: no cord, no power; a cord in, standby
function syncPower(t) {
  if (!acOn(t)) { if (t.power !== 'off') { t.power = 'off'; Sim.soundStop('fans', 0.6); } return; }
  if (t.power === 'off') t.power = 'standby';
}
const extended = t => t.rack.pos === 'out';
const inside = () => {
  if (T.cover !== 'off') return bad(extended(T) ? 'Remove the access panel first (Top view).' : 'The server is pushed into the rack. Extend it on its rails first (Rack view), then remove the access panel.');
  if (isOn(T)) return bad('The server is running. Shut it down and disconnect the power cords before working inside.');
  if (acOn(T)) return bad('Disconnect both power cords first: in standby, power is still present in the server.');
  if (!T.esd) return bad('Put on the ESD wrist strap first (Top view).');
  if (T.baffle) return bad('Remove the air baffle first (Top view). It covers the processors and the DIMMs.');
  return true;
};
const dimmCount = t => Object.keys(t.dimms).length;
const dimmKind = v => v === true ? 'r32' : v;
const dimmOf = (t, id) => DIMMK[dimmKind(t.dimms[id])];
const memGB = t => Object.keys(t.dimms).reduce((s, id) => s + dimmOf(t, id).cap, 0);
const oddIn = t => Object.keys(t.dimms).filter(id => dimmKind(t.dimms[id]) === 'r128');
const cpuCount = t => 1 + (t.sock2 === 'phm' && t.nuts2.every(Boolean) ? 1 : 0);
const driveCount = t => t.bays.filter(b => b.st === 'drive').length;
const bayName = i => `Box ${Math.floor(i / 8) + 1}, bay ${(i % 8) + 1}`;

/* ============ helpers shared by the views ============ */
const f1 = n => (+n).toFixed(1);
const f2 = n => (+n).toFixed(2);
const ageOf = at => at ? (Date.now() - at) / 1000 : 99;
const fxT = {};
const fxMark = k => { fxT[k] = Date.now(); };
const fxAge = k => ageOf(fxT[k]);
const CUE = '#FFB52E';
const pulse = (x, y, r0, r1, col = CUE) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r0}" fill="none" stroke="${col}" stroke-width="2.5" pointer-events="none"><animate attributeName="r" values="${r0};${r1}" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite"/></circle>`;
const ledBlink = (on, dur = 1) => on ? `<animate attributeName="opacity" values="1;1;.15;.15" keyTimes="0;.5;.5;1" dur="${dur}s" repeatCount="indefinite"/>` : '';

// a live clock for the power-on sequence and the drive rebuild: redraw while something is changing
Sim.every(() => {
  let changed = false;
  if (T.power === 'post' && ageOf(T.postAt) > 9) { T.power = 'on'; T.posted = true; changed = true; say('ok', 'Power-on sequence complete: the power LED is solid green and the health LED is green. The server is running.'); }
  if (T.acAt && ageOf(T.acAt) > 4 && !T.flags.iloUp) { T.flags.iloUp = true; changed = true; }
  T.bays.forEach(b => { if (b.health === 'rebuild' && isOn(T)) { b.pct = Math.min(100, b.pct + 10); changed = true; if (b.pct >= 100) { b.health = 'ok'; say('ok', 'Rebuild complete: the drive\'s online LED is solid green again.'); } } });
  if (changed) render();
}, 1000);
