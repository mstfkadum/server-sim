/* ============ 6. Scenarios: ordered steps, each tied to a view, a test on the twin, and a cue for the next click ============ */
const C = (act, arg, say) => ({ act, arg, say });
function routeCue(t) {
  const r = arm(t), ul = unlaid(t);
  if (ul.length && !r.lids.every(Boolean)) return C('cmaFlaps', '', 'Open the hinged flap on every cable guide.');
  if (ul.length) return C('cmaLay', '', 'Lay the cables in the arm: inner arm, round the elbow, back along the outer arm.');
  const i = r.lids.findIndex(Boolean); if (i >= 0) return C('cmaLid', i, `Close the flap on guide ${i + 1}: press it down until it clicks.`);
  return !r.straps.elbow ? C('cmaStrap', 'elbow', 'Wrap the hook-and-loop strap near the elbow round the bundle.') : C('cmaStrap', 'exit', 'Wrap the strap at the fixed end of the arm round the bundle.');
}
// slide the server out: pull both slam latches open first (left, then right), then slide it out
const outCue = (t, msg) => !latchOpen(t, 'l') ? C('rackLatch', 'l', 'Pull the left slam latch open: the lower part of the left rack ear, with the Cisco badge, swings out toward you.') : !latchOpen(t, 'r') ? C('rackLatch', 'r', 'Pull the right slam latch open too: the lower part of the right rack ear.') : C('rackOut', '', msg);
const portName = p => p.startsWith('vic') ? `VIC ${PORTS[p][2]}` : PORTS[p][2];
// cabling to the work order: each cable to its exact switch port or PDU outlet; a cable in the wrong place comes out first
const DWHERE = { dataA: 'SW01 is the top switch, at U12', dataB: 'SW02 is the middle switch, at U11', mgmt: 'MGT01 is the lowest switch, at U10', pduA: 'PDU A is the outer PDU, with the red stripe', pduB: 'PDU B is the inner PDU, with the blue stripe' };
const ORD = n => n + ([11, 12, 13].includes(n % 100) ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
const findTxt = k => { const d = CDEF[k], n = CWANT[k]; return CG.pdu[d] ? `${DWHERE[d]}; the outlet numbers are printed beside the outlets` : `${DWHERE[d]}; ${n % 2 ? 'odd ports are on the top row' : 'even ports are on the bottom row'}, so port ${n} is the ${ORD(Math.ceil(n / 2))} from the left`; };
const plug = (t, port) => cabWrong(t, port) ? C('port', port, `${portName(port)} is in ${portTxtC(t.cables[port], cabN(t, port))}, but the cable schedule says ${wantTxt(port)}. Click ${portName(port)} on the server to unplug it.`)
  : t.sel.port === port ? C('dest', `${CDEF[port]}:${CWANT[port]}`, `Now click ${wantTxt(port)} to connect ${portName(port)}: ${findTxt(port)}.`)
  : C('port', port, `${port.startsWith('vic') ? `Click ${portName(port)}, a 10 Gb SFP+ port on the VIC in riser 2 (PCIe 5).` : `Click the ${PORTS[port][2]} port on the rear panel.`} The cable schedule sends it to ${wantTxt(port)}.`);
const plugAll = ks => t => { const w = ks.find(k => cabWrong(t, k)); if (w) return plug(t, w); const k = ks.find(k => !cabRight(t, k)); return k ? plug(t, k) : null; };
const cabDone = ks => t => ks.every(k => cabRight(t, k));
const PWR_TXT = 'Connect PSU 1 to PDU A outlet 7 and PSU 2 to PDU B outlet 7', PWR_HINT = 'The cable schedule gives each cord its outlet. Two PDUs on two feeds: the server keeps running if one feed is lost.';
const MGMT_STEP = { view: 'cable', text: 'Connect the MGMT port to MGT01 port 12', hint: 'MGT01 is the out-of-band management switch. Port 12 (Gi0/12) is the one assigned to this server; even ports are on the bottom row.', done: cabDone(['mgmt']), cue: plugAll(['mgmt']) };
const coverCue = t => !t.esd ? C('esd', '', 'Put on the ESD wrist strap: click it below the chassis.')
  : t.cover === 'closed' && t.coverLock ? C('coverDial', '', 'Unlock the cover: click the lock on the latch photo (a quarter turn anticlockwise with a screwdriver).')
  : t.cover === 'closed' ? C('coverLift', '', 'Lift the latch by its green finger grip. The cover is pushed back as the latch rises.')
  : t.cover === 'placed' ? C('coverOff', '', 'Lift the cover straight up.')
  : C('coverOff', '', 'Lift the cover straight up and set it aside: click the cover.');
const fitCue = t => t.cover === 'open' ? C('coverPlace', '', 'Place the top cover on the server, latch fully open, about half an inch behind the front lip.')
  : t.cover === 'placed' && !fitOk(t) ? C('coverNudge', nudgeDir(t), 'Slide the cover until the pin on the fan-tray bracket (dashed circle) is centred in the small hole at the rear end of the latch. Use the arrows, or drag the cover.')
  : t.cover === 'closed' && t.coverLock ? null
  : C('coverPress', '', 'Press the latch down. The cover is pulled forward and closes.');
const closeCue = t => !t.baffle && t.cover === 'open' ? C('baffle', '', 'Refit the air baffle over the CPUs and DIMMs.') : fitCue(t);
// one cue for the whole CPU install on socket i: CPU 1 reuses a heatsink (clean + grease), CPU 2 gets a new one (peel the sheet)
const hsPlan = i => i === 0 ? 'hsUsed' : 'hsNew';
function cpuProg(t, i) {
  const c = t.cpu[i], b = t.bench, both = c.lev.u === 'clip' && c.lev.l === 'clip';
  if (c.st === 'torqued') return 8;
  if (c.hs) return 7.5;
  if (c.model && c.plate === 'closed' && both) { const h = b.hs, plan = hsPlan(i); return 6 + (h && h.id === plan && (plan === 'hsUsed' ? h.clean && c.grease === 5 && !c.oldGrease : !h.film && !c.grease) ? 1 : 0); }
  if (c.model && c.plate === 'closed') return 5;
  if (c.model) return 4;
  if (c.plate === 'open' && c.seat === 'up') return 3;
  if (c.lev.u === 'rel' && c.lev.l === 'rel') return 2;
  return c.cap ? 0 : 1;
}
const cpuCue = i => t => {
  const c = t.cpu[i], b = t.bench, n = i + 1, h = b.hs, plan = hsPlan(i);
  if (t.sel.socket !== i) return C('sock', i, `Show the CPU ${n} socket: click its tab above the photo.`);
  if (c.st === 'torqued') return null;
  if (c.hs) {
    if (b.tool !== 'driver') return C('toolPick', 'driver', 'Pick up the No. 2 Phillips screwdriver from Tools and consumables.');
    const k = [0, 3, 1, 2].find(q => c.screws[q] === Math.min(...c.screws));
    return C('hsScrew', `${i}:${k}`, `Turn screw ${k + 1} a little (${c.screws[k] ? 'tight' : 'snug'}), then alternate to the next one. Work evenly, crosswise.`);
  }
  if (c.cap) return C('cpuCap', i, `Lift the protective dust cover off the CPU ${n} socket by its edges. Keep it for an unused socket.`);
  if (!c.model) {
    if (c.plate === 'closed') {
      if (c.lev.u === 'clip') return C('cpuLever', `${i}:u`, 'Release the lever with the unlock icon first: press it down and out of its hook, then let it rise.');
      if (c.lev.l === 'clip') return C('cpuLever', `${i}:l`, 'Now release the lever with the lock icon.');
      return C('cpuPlate', i, 'Open the hinged CPU cover plate.');
    }
    if (c.seat === 'down') return C('cpuSeat', i, 'Swing the hinged CPU seat up.');
    const want = i === 1 && t.cpu[0].model ? t.cpu[0].model : 'e2680';
    if (b.cpu !== want) return C('cpuPick', want, `Pick up the ${byId('cpus', want).name} from the CPU tray, by the finger grips on its frame.`);
    if (b.rot !== 0) return C('cpuRotate', '', 'Turn the CPU (click it) until the ALIGN tab points down toward the seat hinge and the pin 1 triangle is at the bottom-left.');
    return C('cpuInsert', i, 'Insert the ALIGN tab of the CPU frame into the hinged seat until it stops.');
  }
  if (c.plate === 'open') return c.seat === 'up' ? C('cpuSeat', i, 'Swing the hinged seat down until the CPU frame clicks flat in the socket.') : C('cpuPlate', i, 'Close the hinged cover plate.');
  if (c.lev.l === 'rel') return C('cpuLever', `${i}:l`, 'Clip down the lever with the lock icon first.');
  if (c.lev.u === 'rel') return C('cpuLever', `${i}:u`, 'Now clip down the lever with the unlock icon.');
  if (!h || h.id !== plan) return C('hsPick', plan, plan === 'hsUsed' ? 'CPU 1 reuses a heatsink: pick up the heatsink reused from this server (UCSC-HS-C240M4).' : 'CPU 2 gets a new heatsink: pick up the new spare heatsink (UCSC-HS-C240M4=).');
  if (plan === 'hsNew') { if (h.film) return C('hsBase', '', 'Peel the small plastic sheet off the pre-applied thermal pad: click the heatsink base.'); }
  else {
    if (!h.clean) {
      if (b.tool !== 'clean') return C('toolPick', 'clean', 'Pick up the heatsink cleaning kit (UCSX-HSCK=).');
      if (!h.soak) return C('hsBase', '', 'Apply cleaning solution to the old grease on the heatsink base: click the base.');
      return soakDone(h.soak) ? C('hsBase', '', 'Wipe the old grease off with the soft cloth: click the base again.') : { say: 'Let the cleaning solution soak at least 15 seconds (sped up here).' };
    }
    if (c.grease < 5) return b.tool !== 'grease' ? C('toolPick', 'grease', 'Pick up the thermal grease syringe (UCS-CPU-GREASE3=).') : C('cpuTop', i, `Apply thermal grease to the top of the CPU: ${(c.grease * 0.4).toFixed(1)} of 2 cc so far. Click the CPU.`);
  }
  return C('hsPlace', i, 'Lower the heatsink onto the CPU: its four captive screws go over the motherboard standoffs.');
};
const cpuSteps = i => { const n = i + 1, P = k => t => cpuProg(t, i) >= k, cue = cpuCue(i); return [
  { view: 'cpu', text: `CPU ${n}: lift off the socket dust cover`, done: P(1), cue },
  { view: 'cpu', text: `CPU ${n}: release the levers, unlock-icon lever first`, hint: 'Press each lever down and out of its hook. The lever with the unlock icon goes first.', done: P(2), cue },
  { view: 'cpu', text: `CPU ${n}: open the cover plate and swing the hinged seat up`, done: P(3), cue },
  { view: 'cpu', text: `CPU ${n}: insert the CPU into the seat by its ALIGN tab`, hint: 'Hold it by the finger grips. ALIGN tab toward the seat hinge, pin 1 triangle bottom-left.', done: P(4), cue },
  { view: 'cpu', text: `CPU ${n}: swing the seat down and close the cover plate`, done: P(5), cue },
  { view: 'cpu', text: `CPU ${n}: clip the levers down, lock-icon lever first`, done: P(6), cue },
  { view: 'cpu', text: i === 0 ? 'CPU 1: clean the reused heatsink base and apply 2 cc of grease to the CPU' : 'CPU 2: peel the plastic sheet off the new heatsink\'s thermal pad', hint: i === 0 ? 'Cleaning solution, soak at least 15 seconds, wipe with the soft cloth. Then 2 cc of grease on the CPU.' : 'A new heatsink brings its own pad: add no grease.', done: P(7), cue },
  { view: 'cpu', text: `CPU ${n}: fit the heatsink and tighten its four screws evenly`, hint: 'No. 2 Phillips screwdriver. Alternate between the screws.', done: P(8), cue }]; };
// the memory: one of the three Cisco models, in Cisco's order, both CPUs identical, at least A1 and E1
const hasDimm = (t, s, id = 'r16') => !!(t.dimms[s] && t.dimms[s].id === id);
// the model the build uses: the one most of the fitted DIMMs are, else the one in hand, else the 16 GB RDIMM
function memModel(t) {
  const ids = Object.keys(t.dimms).filter(s => !t.dimms[s].fault);
  if (!ids.length) return t.sel.dimm || 'r16';
  const n = {}; ids.forEach(s => { n[t.dimms[s].id] = (n[t.dimms[s].id] || 0) + 1; });
  return Object.keys(n).sort((a, b) => n[b] - n[a])[0];
}
// one socket: fetch the right model, open the levers, press it in (or take out a wrong one)
function sockCue(t, slot, id) {
  const d = t.dimms[slot], m = byId('dimms', id);
  if (d && d.id === id) return null;
  if (d) return t.sel.dimm ? C('memDrop', '', 'Put the DIMM in your hand back in the tray.') : C('memSlot', slot, `That is the other model in ${slot}. Open its levers and lift it out.`);
  if (t.sel.dimm !== id) return C('memPick', id, `Pick up a ${m.name} (${m.pid}) from the tray.`);
  if (t.memLev[slot] !== 'open') return C('memSlot', slot, `Open both ejector levers on socket ${slot}: click the socket.`);
  return C('memSlot', slot, `Line the notch up with the key and press the DIMM into ${slot} evenly on both corners until both levers lock.`);
}
// one CPU: the smallest Cisco layout that holds what is fitted (or goal), one model; the cue removes wrong DIMMs first
function memCueC(t, c, goal) {
  const id = memModel(t), have = cpuDimms(t, c);
  goal = goal || cfill(c).slice(0, Math.max(1, have.length));
  const extra = have.find(s => !goal.includes(s) || t.dimms[s].id !== id);
  if (extra) return t.sel.dimm ? C('memDrop', '', 'Put the DIMM in your hand back in the tray first.') : C('memSlot', extra, `Take the DIMM out of ${extra}: ${t.dimms[extra].id !== id ? 'it is the other model type' : 'it is not in Cisco\'s order'}. Click it.`);
  const add = cfill(c).find(s => goal.includes(s) && !t.dimms[s]);
  return add ? sockCue(t, add, id) : null;
}
const memSteps = () => [
  { view: 'mem', text: 'Pick up the three DIMM models and read their labels: registered (R) or load-reduced (L)?', hint: '16GB 2Rx4 and 32GB 2Rx4 PC4-2400T-RA1: RDIMMs. 64GB 4Rx4 PC4-2400T-LD1: LRDIMM. Then choose one model for the whole server.',
    done: t => CATALOG.dimms.filter(d => t.memKit[d.id]).every(d => t.dimmSeen[d.id]), cue: t => { const d = CATALOG.dimms.find(x => t.memKit[x.id] && !t.dimmSeen[x.id]); return C('memPick', d.id, `Pick up the ${d.name} and read its label below the board.`); } },
  { view: 'mem', text: 'CPU 1: one DIMM model, in Cisco\'s order, at least A1', hint: 'Any count from 1 to 12 per CPU: blue #1 in A, B, C, D first, then black #2, then white #3. The minimum is one, in blue socket A1. The map below the board checks every socket.',
    done: t => cpuDimms(t, 0).length > 0 && !cpuErr(t, 0) && !mixErr(t), cue: t => memCueC(t, 0) },
  { view: 'mem', text: 'CPU 2: the same as CPU 1 (E1 for A1, F1 for B1 ...)', hint: 'Cisco: populate the DIMM sockets of each CPU identically. So the minimum for the server is 2 DIMMs: A1 and E1.',
    done: t => cpuIn(t, 1) && memOK(t), cue: t => { const a = cpuDimms(t, 0), b = cpuDimms(t, 1); return !cpuErr(t, 1) && b.length > a.length ? memCueC(t, 0, b.map(twinSock)) : memCueC(t, 1, a.map(twinSock)); } }];
// Cisco IMC, Chassis, Inventory, Memory: it reads what was installed
const memNavCue = t => { const c = t.cimc;
  if (!c.auth || c.tab !== 'app') return loginCue(t);
  if (c.kvm) return C('cimcKvmClose', '', 'Close the KVM console.');
  if (t.power !== 'on') return C('cimcPower', '', 'The host is off: click Host Power to power it on. Cisco IMC reads the memory during the power-on self-test.');
  if (c.page === 'inventory') return c.invTab === 'mem' ? C('cimcMisc', 'Refresh', 'Click Refresh to read the page again.') : C('cimcInvTab', 'mem', 'Click the Memory tab.');
  if (!c.menu) return C('cimcMenu', '', 'Open the navigation menu: click the button at the top left.');
  if (!c.chassisOpen) return C('cimcNav', 'chassis', 'Click Chassis to expand it.');
  return C('cimcNav', 'inventory', 'Click Inventory.'); };
const cimcMemStep = () => ({ view: 'cimc', get text() { const m = memSummary(T); return `In Cisco IMC, open Chassis, Inventory, Memory: it reads your ${m.count} DIMM${m.count === 1 ? '' : 's'}, ${m.total} GB`; },
  hint: 'Memory Summary: speed, total and effective memory. Memory Details: one row per socket, with the Product ID of the model you fitted.', done: t => !!t.flags.cimcMemSeen, cue: memNavCue });
const okDimm = (t, id) => dimmVerdict(byId('dimms', id)).cls === 'ok';
const tq = i => t => cpuIn(t, i);
const F = (field, value, say) => ({ field, value, say });
const urlCue = t => { const c = t.cimc, why = cimcReach(t);
  if (why) return { say: why };
  if (c.tab === 'cert' && c.url === WO.ip) return c.certAdv ? C('cimcCert', '', `The address matches the work order (${WO.ip}). Continue to the site.`) : C('cimcAdv', '', 'This warning is expected: Cisco IMC uses a self-signed certificate. Click Advanced.');
  const typed = (c.form.url || '').trim().replace(/^https?:\/\//i, '').replace(/[\/?#].*$/, '');
  if (typed !== WO.ip) return F('url', WO.ip, `Click the browser's address bar and type the CIMC IP: ${WO.ip}`);
  return C('cimcGo', '', 'Press Enter or click Go.'); };
const loginCue = t => { const c = t.cimc, f = c.form;
  if (c.tab !== 'login') return urlCue(t);
  if (f.user !== 'admin') return F('user', 'admin', 'Type the user name: admin');
  if (f.pass !== c.pw) return F('pass', c.pw, c.pwSrc === 'console' ? `Type the password set from the console: ${WO.pw}` : c.pwSrc === 'factory' ? 'Type the factory default password: password' : c.pwSrc === 'preset' ? 'Type the scenario password from the panel on the right.' : 'Type the new password you set.');
  return C('cimcLogin', '', 'Click Log In.'); };
const navCue = (t, page) => { const c = t.cimc;
  if (!c.auth) return loginCue(t);
  if (c.kvm) return C('cimcKvmClose', '', 'Close the KVM console.');
  if (c.page === page) return null;
  if (!c.menu) return C('cimcMenu', '', 'Open the navigation menu: click the button at the top left.');
  if (!c.adminOpen) return C('cimcNav', 'admin', 'Click Admin to expand it.');
  return C('cimcNav', page, page === 'users' ? 'Click User Management.' : 'Click Networking under Admin.'); };
/* console (F8) helpers */
const inF8 = t => conPhase(t) === 'f8';
const cv = t => inF8(t) ? t.con.form : t.con.savedVals || null;
const conEnterCue = t => {
  if (!t.crash.vga) return C('crashVga', '', 'Plug the monitor cable into the VGA port: the blue 15-pin port at the right of the rear I/O row.');
  if (!t.crash.kbd) return C('crashKbd', '', 'Plug the USB keyboard into one of the two blue USB 3.0 ports at the left of the I/O row.');
  if (t.power !== 'on') return C('powerOn', '', 'Press the front power button.');
  const ph = conPhase(t);
  if (['nosig', 'mem', 'plat'].includes(ph)) return { say: 'Watch the monitor: memory and platform checks run first. Get ready to press F8.' };
  if (ph === 'logo') return C('key', 'F8', 'Press F8 now: the screen offers <F8>Cisco IMC Configuration.');
  if (ph === 'entering' || (ph === 'sas' && t.con.mode === 'enter')) return { say: 'F8 accepted. The utility opens after the storage controller screen.' };
  if (ph === 'saving') return { say: 'Saving and rebooting.' };
  return C('key', 'CtrlAltDel', 'The F8 prompt has passed. Press Ctrl+Alt+Del to restart, then press F8 at the prompt.'); };
const f8Go = (t, page, k, v, act) => { const c = t.con, idx = f8Idx(page, k, v);
  if (c.page !== page) return C('key', page === 2 ? 'F1' : 'F2', page === 2 ? 'Press F1 to open page 2, the additional settings.' : 'Press F2 to go back to page 1.');
  if (c.sel !== idx) return C('conSel', idx, `Move the cursor to ${F8I[page][idx].l.replace(':', '')} with the Down and Up arrow keys.`);
  return act; };
const f8Type = (t, page, k, value, label) => f8Go(t, page, k, undefined, F('con:' + k, value, `Type the ${label}: ${value}`));
function MGMT() { return [
  { view: 'console', text: 'Plug a VGA monitor into the rear VGA port', hint: 'The server has standby power: the power LED is amber. Monitor and keyboard go on the rear panel.', done: t => t.crash.vga || t.con.sawIp, cue: t => C('crashVga', '', 'Plug the monitor cable into the VGA port: the blue 15-pin port at the right of the rear I/O row.') },
  { view: 'console', text: 'Plug a USB keyboard into a rear USB port', done: t => t.crash.kbd || t.con.sawIp, cue: t => C('crashKbd', '', 'Plug the USB keyboard into one of the two blue USB 3.0 ports at the left of the I/O row.') },
  { view: 'console', text: 'Press the front power button and watch the power-on self-test', done: t => t.power === 'on' && !!t.post, cue: t => C('powerOn', '', 'Press the front power button.') },
  { view: 'console', text: 'Press F8 when the screen offers Cisco IMC Configuration', hint: 'The prompt appears after the memory and platform checks.', done: t => t.con.entered, cue: conEnterCue },
  { view: 'console', text: 'Page 1: set NIC mode Dedicated and NIC redundancy None', hint: 'Up and Down move the cursor; Space ticks the box.', done: t => { const v = cv(t); return !!v && v.mode === 'Dedicated' && v.red === 'None'; },
    cue: t => { if (!inF8(t)) return conEnterCue(t); const f = t.con.form;
      if (f.mode !== 'Dedicated') return f8Go(t, 1, 'mode', 'Dedicated', C('key', 'Space', 'Press Space to select Dedicated: the management cable is in the dedicated M port.'));
      return f8Go(t, 1, 'red', 'None', C('key', 'Space', 'Press Space to set NIC redundancy None: the only setting valid with Dedicated mode.')); } },
  { view: 'console', text: `Page 1: untick DHCP, then enter CIMC IP ${WO.ip}, subnet ${WO.mask} and gateway ${WO.gw}`, hint: 'Type over the 0.0.0.0 values.', done: t => { const v = cv(t); return !!v && !v.dhcp && v.ip === WO.ip && v.mask === WO.mask && v.gw === WO.gw; },
    cue: t => { if (!inF8(t)) return conEnterCue(t); const f = t.con.form;
      if (f.dhcp) return f8Go(t, 1, 'dhcp', undefined, C('key', 'Space', 'Press Space to untick DHCP enabled: there is no DHCP server on the management network.'));
      if (f.ip !== WO.ip) return f8Type(t, 1, 'ip', WO.ip, 'CIMC IP');
      if (f.mask !== WO.mask) return f8Type(t, 1, 'mask', WO.mask, 'Prefix/Subnet (a /24 network)');
      return f8Type(t, 1, 'gw', WO.gw, 'Gateway'); } },
  { view: 'console', text: `Page 2 (F1): set the default user password to ${WO.pw}, twice`, hint: 'This is the password of the admin account.', done: t => { const v = cv(t); return !!v && v.pw === WO.pw && v.pw2 === WO.pw; },
    cue: t => { if (!inF8(t)) return conEnterCue(t); const f = t.con.form;
      if (f.pw !== WO.pw) return f8Type(t, 2, 'pw', WO.pw, 'default password');
      return f8Type(t, 2, 'pw2', WO.pw, 'same password again'); } },
  { view: 'console', text: 'Press F5 and wait for "Network settings configured"', hint: 'About 45 seconds on a real server; a few seconds here.', done: t => t.con.saved || (inF8(t) && t.con.configured && t.con.snap === f8Snap(t.con.form)),
    cue: t => { if (!inF8(t)) return conEnterCue(t); const c = t.con; return c.cfgT && !c.configured && c.snap === f8Snap(c.form) ? { say: 'Wait for "Network settings configured" at the bottom of the screen.' } : C('key', 'F5', 'Press F5 to apply the settings and refresh.'); } },
  { view: 'console', text: 'Press F10 to save; the server reboots', done: t => t.con.saved, cue: t => inF8(t) ? C('key', 'F10', 'Press F10 to save the settings. The server reboots.') : conEnterCue(t) },
  { view: 'console', text: `Check the boot screen now shows Cisco IMC IPv4 Address ${WO.ip}`, done: t => t.con.sawIp, cue: t => t.power === 'on' ? { say: `Watch the boot screen: instead of "Error in getting the Cisco IMC IP" it now shows ${WO.ip}.` } : C('powerOn', '', 'Press the front power button.') },
  { view: 'console', text: 'Unplug the monitor and the keyboard', hint: 'The server is ready to go to the data centre; from now on you manage it over the network.', done: t => t.con.sawIp && !t.crash.vga && !t.crash.kbd,
    cue: t => t.crash.vga ? C('crashVga', '', 'Unplug the monitor cable from the VGA port.') : C('crashKbd', '', 'Unplug the USB keyboard.') },
  { view: 'cimc', text: `Open a browser on the management network and type ${WO.ip} in the address bar`, done: t => !!t.cimc.certOk[WO.ip] || (t.cimc.url === WO.ip && ['cert', 'login', 'app'].includes(t.cimc.tab)), cue: urlCue },
  { view: 'cimc', text: 'Accept the certificate warning for the controller', hint: 'Cisco IMC uses a self-signed certificate. Continue only if the address matches the work order.', done: t => !!t.cimc.certOk[WO.ip], cue: urlCue },
  { view: 'cimc', text: `Log in with the account set from the console: ${WO.user} / ${WO.pw}`, done: t => t.cimc.consoleLogin, cue: loginCue },
  { view: 'cimc', text: 'Verify the settings under Admin, Networking against the work order', done: t => t.cimc.verified,
    cue: t => navCue(t, 'network') || C('cimcVerify', '', 'Compare each value on screen with the work order in the panel on the right, then confirm.') },
  { view: 'cimc', text: 'Change the admin password to a new strong password', hint: 'Admin, User Management: tick user 1, Modify User, Change Password, type it twice, Save.', done: t => t.cimc.guiPw,
    cue: t => { const c = t.cimc, f = c.form, n = navCue(t, 'users'); if (n) return n;
      if (!c.dlg) return !c.rowSel ? C('cimcRow', '', 'Tick the checkbox for user 1, admin.') : C('cimcModify', '', 'Click Modify User.');
      if (!c.chg) return C('cimcChg', '', 'Tick Change Password.');
      if (pwProblems(f.np, 'admin').length || f.np === c.pw) return F('np', 'Lab-Train1ng!', `Type a new strong password, for example Lab-Train1ng!. ${WO.pw} only has lower-case letters and digits, so it fails the strong password rules.`);
      if (f.cp !== f.np) return F('cp', f.np, 'Type the same password again to confirm it.');
      return C('cimcSaveUser', '', 'Click Save.'); } },
  { view: 'cimc', text: 'Log out and log back in with the new password', done: t => t.cimc.reloginNew, cue: t => t.cimc.auth ? C('cimcLogout', '', 'Click Log Out at the top right.') : loginCue(t) },
  { view: 'cimc', text: 'Launch the KVM console and check the server screen', hint: 'KVM shows the same screen the monitor showed, over the network.', done: t => t.cimc.kvmSeen,
    cue: t => { const c = t.cimc; if (!c.auth) return loginCue(t); if (t.power !== 'on') return c.kvm ? C('cimcKvmClose', '', 'No signal: the host is off. Close the KVM console.') : C('cimcPower', '', 'The host is off. Click Host Power to power it on.'); return C('cimcKvm', '', 'Click Launch KVM.'); } }
]; }

// riser 2 and the VIC (Cisco "Replacing a PCIe Card"): how far the job has got, 0 = not started, 14 = VIC in slot 5 and riser seated
// (the securing plate: closed 'on', swung open on its hinge-tabs 'open', lifted off 'off')
function riserProg(t) {
  const r = t.riser, vic = r.slots[5] === 'vic', seated = vic && cardSeated(r, '5'), shut = r.ret === 'closed' && r.plate === 'on' && r.screw === 'tight';
  if (r.loc === 'in') return seated ? (!r.up.f && !r.up.r ? 14 : 13) : 0;
  if (r.loc === 'up') return seated && shut ? 12 : 1;
  if (seated) return r.ret !== 'closed' ? 8 : r.plate === 'off' ? 9 : r.plate === 'open' ? 9.5 : r.screw !== 'tight' ? 10 : 11;
  if (vic) return 7;
  if (r.plate === 'off' && r.ret === 'open') return r.blank[5] ? 5 : 6;
  return r.plate === 'off' ? 4 : r.plate === 'open' ? 3.5 : r.screw === 'loose' ? 3 : 2;
}
const riserSteps = () => [
  { view: 'riser', text: 'Grip riser 2 at both blue touch points and lift it straight up', hint: 'Both ends together, so the board leaves the RISER2 socket evenly.', done: t => riserProg(t) >= 1,
    cue: t => { const r = t.riser; if (r.loc === 'in' && (r.up.f || r.up.r)) return C('riserPush', r.up.f ? 'f' : 'r', 'The riser is resting on its socket. Push that end down first.');
      return !r.grip.f ? C('riserGrip', 'f', 'Grip the blue touch point at the front end of riser 2.') : !r.grip.r ? C('riserGrip', 'r', 'Now grip the blue touch point at the rear end.') : C('riserLift', '', 'Lift riser 2 straight up on both ends.'); } },
  { view: 'riser', text: 'Lay it on the antistatic mat', done: t => riserProg(t) >= 2, cue: () => C('riserMat', '', 'Lay riser 2 on the antistatic mat: click the riser or the button.') },
  { view: 'riser', text: 'Loosen the thumbscrew on the bottom of the riser', hint: 'The blue captive thumbscrew holds the securing plate to its post. Anticlockwise until it comes free.', done: t => riserProg(t) >= 3,
    cue: () => C('riserScrew', '', 'Turn the blue thumbscrew at the bottom corner of the securing plate anticlockwise.') },
  { view: 'riser', text: 'Swing the securing plate open on its hinge-tabs and lift it off', hint: 'It pivots on the two hinge-tabs by the top plate: the folded edge with the black pads turns up. Then lift the tabs out of their slots.', done: t => riserProg(t) >= 4,
    cue: t => t.riser.plate === 'on' ? C('riserPlate', '', 'Swing the securing plate open: click the plate.') : C('riserPlate', '', 'Lift the plate off: its two hinge-tabs come out of their slots.') },
  { view: 'riser', text: 'Swing open the blue card-tab retainer', done: t => riserProg(t) >= 5, cue: () => C('riserRet', '', 'Swing open the blue card-tab retainer at the rear panel.') },
  { view: 'riser', text: 'Lift the blanking panel out of slot 5', hint: 'Slot 5 is the middle slot: PCIe 5 on the rear panel. Keep the panel.', done: t => riserProg(t) >= 6, cue: () => C('riserSlot', '5', 'Lift the blanking panel out of slot 5 (rear panel PCIe 5).') },
  { view: 'riser', text: 'Pick up the VIC 1225 and line it up with slot 5', hint: 'Slot 5: x16 lanes, x24 connector, NCSI. The VIC\'s primary slot in riser 2.', done: t => riserProg(t) >= 7,
    cue: t => t.sel.card !== 'vic' ? C('cardPick', 'vic', 'Pick up the Cisco UCS VIC 1225 from the card tray. Check it below the riser.') : C('riserSlot', '5', 'Line the VIC up with slot 5: click the slot 5 connector or the PCIe 5 opening.') },
  { view: 'riser', text: 'Push down evenly on both ends until the card is fully seated', hint: 'The rear-panel tab must end up flat against the riser\'s rear-panel opening.', done: t => riserProg(t) >= 8,
    cue: t => { const st = t.riser.seat[5] || {}; return !st.r ? C('cardPush', '5:r', 'Push down on the bracket end of the VIC.') : C('cardPush', '5:f', 'Now push down on the far end, evenly.'); } },
  { view: 'riser', text: 'Close the card-tab retainer', done: t => riserProg(t) >= 9, cue: () => C('riserRet', '', 'Swing the blue card-tab retainer closed over the bracket tabs.') },
  { view: 'riser', text: 'Hook the securing plate\'s two hinge-tabs into their slots and swing it closed', hint: 'Tabs first, by the top plate; then the plate swings down over the front of the riser\'s bottom side.', done: t => riserProg(t) >= 10,
    cue: t => t.riser.plate === 'off' ? C('riserPlate', '', 'Hook the securing plate\'s two hinge-tabs into their slots: click the plate on the mat.') : C('riserPlateShut', '', 'Swing the securing plate closed.') },
  { view: 'riser', text: 'Tighten the thumbscrew', done: t => riserProg(t) >= 11, cue: () => C('riserScrew', '', 'Tighten the thumbscrew on the bottom of the riser, clockwise, finger-tight.') },
  { view: 'riser', text: 'Lower riser 2 onto RISER2, the pegs and the channels, and push down on both ends', hint: 'Two alignment pegs on the motherboard, two channels in the chassis. Push both ends until it is fully engaged.', done: t => riserProg(t) >= 14,
    cue: t => { const r = t.riser; return r.loc === 'mat' ? C('riserHold', '', 'Pick up riser 2 by both touch points and hold it over the chassis.') : r.loc === 'up' ? C('riserAlign', '', 'Lower it over the RISER2 socket, the two alignment pegs and the two channels.') : C('riserPush', r.up.f ? 'f' : 'r', `Push down the ${r.up.f ? 'front' : 'rear'} end.`); } }];
const vicCables = { view: 'cable', text: 'Connect VIC PORT 1 to SW01 port 23 and PORT 2 to SW02 port 23', hint: 'The VIC\'s 10 Gb SFP+ ports carry the data network: one to each data switch, on the ports in the cable schedule (Eth1/23 on both), so the path survives a switch failure. Odd ports are on the top row.', done: cabDone(['vic1', 'vic2']),
  cue: plugAll(['vic1', 'vic2']) };

Sim.registerScenario({
  id: 'install', title: 'New server install', start: 'bench', setup: () => { const t = fresh(); OSI.init(t, 'ubuntu', false); return t; },
  intro: 'Build the server on the bench, rack it, cable it and check it. For the memory you choose: one of three Cisco models (16 GB RDIMM, 32 GB RDIMM or 64 GB LRDIMM: never an RDIMM with the LRDIMM), as many as you like in Cisco\'s order, both CPUs the same. Minimum: 2 DIMMs, A1 and E1, because each CPU needs its own memory and Cisco wants both CPUs populated identically. Cable it to the exact ports in the work order: PSU 1 to PDU A outlet 7, PSU 2 to PDU B outlet 7, VIC PORT 1 to SW01 port 23, VIC PORT 2 to SW02 port 23, MGMT to MGT01 port 12. At the end, Cisco IMC shows the memory you installed. The step bar above the picture always tells you the next action, and the amber ring shows where to click. Finally install Ubuntu Server 24.04 on the drive in HDD 01 through Cisco IMC: launch the KVM console, map the ISO from your laptop with Virtual Media, boot it once from the virtual DVD (F6 at POST), install, check the build from the installed system, and record the handover.',
  steps: [
    { view: 'bench', text: 'Put on the ESD wrist strap', done: t => t.esd || t.rack.pos !== 'bench', cue: () => C('esd', '', 'Put on the ESD wrist strap: click it below the chassis.') },
    { view: 'bench', text: 'Unlock the top cover and lift it off', hint: 'Unlock with a quarter turn anticlockwise, lift the latch by its green finger grip, then lift the cover straight up.', done: t => t.cover === 'open' || t.cpu[0].st !== 'dust', cue: coverCue },
    { view: 'bench', text: 'Lift out the air baffle', hint: 'It covers the CPUs and the front ends of the DIMM slots.', done: t => !t.baffle || t.cpu[0].st !== 'dust', cue: () => C('baffle', '', 'Lift out the air baffle: click it, between the fans and the CPUs.') },
    ...cpuSteps(0), ...cpuSteps(1),
    ...memSteps(),
    ...riserSteps(),
    { view: 'bench', text: 'Refit the air baffle and the top cover', hint: 'Latch open, cover half an inch behind the front lip, the pin on the fan-tray bracket centred in the small hole at the end of the latch, then press the latch down.', done: t => t.cover === 'closed' && t.baffle && cpuIn(t, 0) && memOK(t) && riserProg(t) >= 14, cue: closeCue },
    { view: 'storage', text: 'Install two 8 TB drives in HDD 01 and HDD 02 and close their levers', hint: 'Lowest-numbered bays first. Leave blanking trays in the bays you do not use.', done: t => t.bays[0].st === 'locked' && t.bays[1].st === 'locked',
      cue: t => {
        const i = [0, 1].find(k => t.bays[k].st !== 'locked'), b = t.bays[i], bd = t.benchDrive;
        const n = String(i + 1).padStart(2, '0');
        if (t.sel.bay !== i) return C('bay', i, `Click HDD ${n} in the front photo to select it.`);
        if (b.st === 'blank') return C('bayBlank', i, `Remove the blanking tray from HDD ${n}: press its release and pull it out.`);
        if (b.st === 'open') return C('bayLock', i, `Close the ejector lever on HDD ${n}: click the open lever in the close-up.`);
        if (!bd || bd.id !== 'hd8t') return C('drvPick', 'hd8t', 'Pick up an 8 TB LFF drive (UCS-HD8T7KL4K) from the drive tray.');
        return bd.mounted ? C('bayInsert', i, `With the lever open, slide the tray into HDD ${n} until it touches the backplane.`) : C('drvMount', '', 'Fit the drive in its tray with the four screws.');
      } },
    { view: 'rack', text: 'Stabilise the rack and mark the U position', hint: 'Slide 26: stabilise, then mark U. Heaviest equipment lowest.', done: t => t.rack.stab && !!t.rack.u,
      cue: t => !t.rack.stab ? C('rackStab', '', 'Stabilise the rack: lower the levelling pads and fit the stabilisers.') : C('rackU', 3, 'Mark the lowest free position: click U3.') },
    { view: 'rack', text: 'Fit both slide rails and the inner rails', done: t => t.rack.left && t.rack.right && t.rack.inner,
      cue: t => !t.rack.left ? C('rackRail', 'left', 'Fit the left slide rail in the rack.') : !t.rack.right ? C('rackRail', 'right', 'Fit the right slide rail at the same height.') : C('rackInner', '', 'Attach the inner rails to the sides of the server.') },
    { view: 'rack', text: 'Lift the server into the rails with two people', done: t => t.rack.pos !== 'bench', cue: () => C('rackLift', '', 'Two-person lift: insert the server and push until the slam latches engage.') },
    { view: 'cable', text: 'Attach the cable management arm', hint: 'Cisco order: the outer arm\'s tab onto the fixed outer rail, the inner arm\'s tab onto the server\'s inner rail, then the width-adjustment slider onto the opposite rail.', done: t => cmaReady(t),
      cue: t => { const r = arm(t); return !r.tabs.outer ? C('cmaTab', 'outer', 'Start with the arm farthest from the server: slide its tab onto the end of the left outer rail until it clicks.') : !r.tabs.inner ? C('cmaTab', 'inner', 'Now the arm closest to the server: slide its tab onto the end of the inner rail on the server.') : C('cmaTab', 'slider', 'Pull out the width-adjustment slider and slide its tab onto the right outer rail.'); } },
    { view: 'cable', text: PWR_TXT, hint: PWR_HINT, done: cabDone(['psu1', 'psu2']), cue: plugAll(['psu1', 'psu2']) },
    vicCables,
    MGMT_STEP,
    { view: 'cable', text: 'Route the cables through the arm\'s guides and close them', hint: 'Into the inner arm, round the elbow, back along the outer arm, out at the fixed end. Close every flap, then strap the bundle.', done: t => t.rack.routed, cue: routeCue },
    { view: 'cable', text: 'Label both ends of every cable', hint: 'Slide 33: location, source, destination, role.', done: t => t.rack.labeled, cue: () => C('label', '', 'Fit printed labels at both ends of every cable.') },
    { view: 'rack', text: 'Cycle the rails: latches open, slide the server out, then push it back', hint: 'Slide 34: the final proof is a slow full-travel cycle with no connector movement.', done: t => t.rack.tested && t.rack.pos === 'in',
      cue: t => t.rack.pos === 'in' ? outCue(t, 'Both latches are open: slide the server out slowly.') : C('rackIn', '', 'Push the server back until the slam latches click onto the posts.') },
    { view: 'ready', text: 'Run the readiness check with no blocking issues', done: t => t.checked && !runRules().some(i => i.lvl === 'fail'), cue: () => C('check', '', 'Run the readiness check.') },
    ...MGMT(),
    cimcMemStep(),
    ...OSI.steps('ubuntu', CIS_OS)
  ]
});
Sim.registerScenario({
  id: 'mgmt', title: 'Management setup: console (F8), then web check', start: 'console',
  intro: 'The server is built, racked and cabled, and its power cords are in (standby power). Cisco IMC still has its factory settings and no IP address. Configure it from a local monitor and keyboard, then check it from a browser and change the password.',
  setup() { const t = buildFull(); t.cimc = newCimc(); t.power = 'off'; t.post = null; t.con = newCon(); return t; },
  steps: MGMT()
});
Sim.registerScenario({
  id: 'drive', title: 'Maintenance: replace a failed drive (hot-swap)', start: 'storage',
  intro: 'The server is running and one hard drive in its RAID volume has failed. SAS drives are hot-swappable: replace it without shutting down and without losing the volume.',
  setup() { const t = buildFull(); t.bays[2].health = 'fault'; return t; },
  steps: [
    { view: 'storage', text: 'Find the failed drive by its amber fault LED', done: t => t.flags.ident || t.flags.pulledBad, cue: () => C('bay', 2, 'Find the carrier with the steady amber fault LED (top LED) and click it.') },
    { view: 'storage', text: 'Press the release button and open the ejector lever', done: t => t.flags.leverOpened || t.flags.pulledBad, cue: t => t.sel.bay !== 2 ? C('bay', 2, 'Select HDD 03.') : C('bayOpen', 2, 'Press the release button on HDD 03: the ejector lever swings open.') },
    { view: 'storage', text: 'Pull the failed drive tray out', hint: 'Only the failed drive. Pulling a healthy member now would destroy the volume.', done: t => t.flags.pulledBad, cue: t => t.sel.bay !== 2 ? C('bay', 2, 'Select HDD 03.') : C('bayPull', 2, 'Pull the failed drive tray out of HDD 03.') },
    { view: 'storage', text: 'Remove the four tray screws and lift the failed drive out of its tray', hint: 'Set the failed drive aside for return. The same tray takes the replacement.', done: t => t.flags.pulledBad && !(t.pulled && t.pulled.failed),
      cue: () => C('drvUnmount', '', 'Remove the four drive-tray screws and lift the failed drive out of the tray.') },
    { view: 'storage', text: 'Fit a suitable replacement drive in the tray', hint: 'Same type as the other members: an 8 TB 4K-native LFF drive (UCS-HD8T7KL4K).', done: t => t.flags.pulledBad && ((t.benchDrive && t.benchDrive.mounted) || !!t.bays[2].drive),
      cue: t => !t.benchDrive || t.benchDrive.id !== 'hd8t' ? C('drvPick', 'hd8t', 'Pick up a matching 8 TB drive, UCS-HD8T7KL4K.') : C('drvMount', '', 'Fit the drive in the tray with the four screws.') },
    { view: 'storage', text: 'Insert it in the same bay and close the lever', done: t => t.flags.pulledBad && t.bays[2].st === 'locked',
      cue: t => t.sel.bay !== 2 ? C('bay', 2, 'Select HDD 03.') : t.bays[2].st === 'empty' ? (t.benchDrive && t.benchDrive.mounted ? C('bayInsert', 2, 'With the lever open, slide the tray into HDD 03.') : C('drvPick', 'hd8t', 'Pick up a matching 8 TB drive, UCS-HD8T7KL4K.')) : C('bayLock', 2, 'Close the ejector lever on HDD 03.') },
    { view: 'storage', text: 'Wait for the rebuild to finish', done: t => t.flags.pulledBad && t.bays[2].st === 'locked' && t.bays[2].health === 'ok' && !t.arrayFailed, cue: () => ({ say: 'Wait. A blinking amber fault LED means the drive is rebuilding.' }) }
  ]
});
Sim.registerScenario({
  id: 'mem8', title: 'Memory: your choice of DIMMs, the Cisco way, then check Cisco IMC', start: 'mem',
  intro: 'Both CPUs are installed and the server is open on the bench, with no memory. Choose one of the three Cisco models (16 GB RDIMM, 32 GB RDIMM or 64 GB LRDIMM: never mix RDIMMs with LRDIMMs) and fit as many as you like in Cisco\'s order: blue #1 sockets first, alternating CPUs, both CPUs the same. Minimum: 2 DIMMs, A1 and E1. Close the server, rack it, power it on and check in Cisco IMC that it reads the memory you installed.',
  setup() {
    const t = buildFull(); t.dimms = {}; t.memKit = Object.fromEntries(MEMKIT_C.map(k => [k, 24])); t.power = 'off'; t.post = null; t.con = newCon();
    t.cables = { psu1: null, psu2: null, vic1: null, vic2: null, mgmt: null }; t.cablePort = { ...CWANT }; t.rack.pos = 'service';
    t.cover = 'open'; t.coverLock = false; t.baffle = false; t.esd = true; return t;
  },
  steps: [
    ...memSteps(),
    { view: 'bench', text: 'Refit the air baffle and the top cover', hint: 'Latch open, cover half an inch behind the front lip, the pin centred in the small hole at the end of the latch, then press the latch down.', done: t => memOK(t) && t.baffle && t.cover === 'closed', cue: closeCue },
    { view: 'rack', text: 'Push the server back into the rack', done: t => memOK(t) && t.cover === 'closed' && t.rack.pos === 'in', cue: () => C('rackIn', '', 'Push the server back until the slam latches click onto the posts.') },
    { view: 'cable', text: PWR_TXT, hint: PWR_HINT, done: cabDone(['psu1', 'psu2']), cue: plugAll(['psu1', 'psu2']) },
    MGMT_STEP,
    { view: 'ready', text: 'Power on and pass the simulated self-test', hint: 'The self-test reads the memory: total, effective and its speed.', done: t => t.power === 'on' && !!t.post, cue: () => C('powerOn', '', 'Press the power button on the front panel.') },
    { view: 'cimc', text: `Log in to Cisco IMC at ${WO.ip} (admin, the scenario password)`, done: t => t.cimc.auth || !!t.flags.cimcMemSeen, cue: loginCue },
    cimcMemStep()]
});
Sim.registerScenario({
  id: 'nic', title: 'Riser 2: fit the 10 Gb VIC (data ports) in slot 5', start: 'riser',
  intro: 'The server is shut down, unplugged and slid out of the rack with its top cover off. Both CPUs are installed. Riser 2 has a blanking panel in each of its three slots. Take the riser out, fit the Cisco VIC 1225 in slot 5 the Cisco way, put the riser back, then cable its two 10 Gb ports to the work order: PORT 1 to SW01 port 23 and PORT 2 to SW02 port 23. They are the server\'s data ports.',
  setup() {
    const t = buildFull(); t.riser = newRiser(); t.power = 'off'; t.post = null; t.con = newCon();
    t.cables = { psu1: null, psu2: null, vic1: null, vic2: null, mgmt: null }; t.cablePort = { ...CWANT }; t.rack.pos = 'service';
    t.cover = 'open'; t.coverLock = false; t.baffle = true; t.esd = true; return t;
  },
  steps: [
    ...riserSteps(),
    { view: 'bench', text: 'Refit the top cover', hint: 'Latch open, cover half an inch behind the front lip, the pin centred in the small hole at the end of the latch, then press the latch down.', done: t => riserProg(t) >= 14 && t.cover === 'closed', cue: closeCue },
    { view: 'rack', text: 'Push the server back into the rack', done: t => riserProg(t) >= 14 && t.cover === 'closed' && t.rack.pos === 'in', cue: () => C('rackIn', '', 'Push the server back until the slam latches click onto the posts.') },
    vicCables]
});
Sim.registerScenario({
  id: 'dimm', title: 'Maintenance: replace a failed DIMM', start: 'ready',
  intro: 'The system health LED is amber and Cisco IMC reports uncorrectable memory errors on DIMM B1. Replace it safely and bring the server back.',
  setup() { const t = buildFull(); t.dimms.B1.fault = true; return t; },
  steps: [
    { view: 'ready', text: 'Shut the server down gracefully', done: t => t.flags.shut, cue: () => C('shutdown', '', 'Press and release the power button on the front panel for a graceful shutdown.') },
    { view: 'cable', text: 'Disconnect both power cords', hint: 'Standby power is still present until the cords are out.', done: t => t.flags.shut && ((!t.cables.psu1 && !t.cables.psu2) || t.flags.dimmDone),
      cue: t => t.cables.psu1 ? C('port', 'psu1', 'Unplug the PSU 1 power cord.') : C('port', 'psu2', 'Unplug the PSU 2 power cord.') },
    { view: 'rack', text: 'Pull both slam latches open and slide the server out of the rack', done: t => t.rack.pos === 'service' || t.flags.dimmDone, cue: t => outCue(t, 'Both latches are open: slide the server out.') },
    { view: 'bench', text: 'ESD strap on, top cover off, air baffle out', done: t => (t.esd && t.cover === 'open' && !t.baffle) || t.flags.dimmDone, cue: t => t.cover !== 'open' ? coverCue(t) : C('baffle', '', 'Lift out the air baffle to reach the DIMM slots.') },
    { view: 'mem', text: 'Remove the failed DIMM from socket B1', done: t => t.flags.dimmPulled, cue: t => t.sel.dimm ? C('memDrop', '', 'Put the DIMM in your hand back in the tray first.') : C('memSlot', 'B1', 'Push both ejector levers on socket B1 outward and lift the faulty DIMM out.') },
    { view: 'mem', text: 'Fit an identical Cisco DIMM in B1', hint: 'Same part as the others: 16 GB Cisco RDIMM, UCS-MR-1X162RV-A.', done: t => { const ok = t.flags.dimmPulled && hasDimm(t, 'B1'); if (ok) t.flags.dimmDone = true; return !!ok; },
      cue: t => sockCue(t, 'B1', 'r16') },
    { view: 'bench', text: 'Refit the air baffle and the top cover', hint: 'Latch open, cover half an inch behind the front lip, the pin on the fan-tray bracket centred in the small hole at the end of the latch, then press the latch down.', done: t => t.flags.dimmDone && t.cover === 'closed', cue: closeCue },
    { view: 'rack', text: 'Push the server back into the rack', done: t => t.flags.dimmDone && t.cover === 'closed' && t.rack.pos === 'in', cue: () => C('rackIn', '', 'Push the server back until the slam latches click onto the posts.') },
    { view: 'cable', text: 'Reconnect PSU 1 to PDU A outlet 7 and PSU 2 to PDU B outlet 7', hint: PWR_HINT, done: t => t.flags.dimmDone && cabDone(['psu1', 'psu2'])(t), cue: plugAll(['psu1', 'psu2']) },
    { view: 'ready', text: 'Power on and pass the simulated self-test', done: t => t.flags.dimmDone && t.power === 'on' && !!t.post, cue: () => C('powerOn', '', 'Press the power button on the front panel.') }
  ]
});
Sim.registerScenario({
  id: 'fan', title: 'Maintenance: replace a failed fan (server running)', start: 'rack',
  intro: 'The fan status LED on the front panel is amber. Fan modules are hot-swappable, and the cable arm lets the server slide out while it keeps running. Find the failed module, and do not leave its bay empty for more than one minute.',
  setup() { const t = buildFull(); t.fans[3] = 'fault'; return t; },
  steps: [
    { view: 'rack', text: 'Pull both slam latches open and slide the running server out', hint: 'The cable management arm keeps every cable connected.', done: t => t.rack.pos === 'service' || t.flags.fanDone, cue: t => outCue(t, 'Both latches are open: slide the server out slowly.') },
    { view: 'bench', text: 'Remove the top cover', done: t => t.cover === 'open' || t.flags.fanDone, cue: coverCue },
    { view: 'fans', text: 'Find the module with the amber fault LED and pinch its green latch toward the centre', hint: 'The fault LED light pipe on top of the module lights amber when it fails.', done: t => t.fanPinch === 3 || t.flags.fanPulled,
      cue: t => t.fanPinch !== null && t.fanPinch !== 3 ? C('fanLatch', t.fanPinch, 'That module has a green LED. Release its latch.') : C('fanLatch', 3, 'FAN 04 has the amber LED. Grasp its top and pinch the green latch toward the centre.') },
    { view: 'fans', text: 'Lift it straight up', hint: 'The connector on its bottom comes out of the motherboard. The one-minute clock starts now.', done: t => t.flags.fanPulled, cue: () => C('fanBay', 3, 'Lift FAN 04 straight up.') },
    { view: 'fans', text: 'Set the failed module aside for return', done: t => t.fanRma || t.flags.fanDone, cue: () => C('fanAside', '', 'Set the failed module aside for return.') },
    { view: 'fans', text: 'Pick up the new module and turn it so the arrow points to the rear', hint: 'The arrow label on top shows the airflow: front to back.', done: t => (t.fanHand && t.fanHand.kind === 'new' && t.fanHand.arrow === 'rear') || t.flags.fanSpareUsed,
      cue: t => !t.fanHand ? C('fanPick', 'new', 'Pick up the new fan module UCSC-FAN-C240M4 from the tray.') : C('fanTurn', '', 'The arrow points to the front. Turn the module around.') },
    { view: 'fans', text: 'Set it in bay FAN 04, connector lined up with the motherboard connector', done: t => t.flags.fanSpareUsed, cue: () => C('fanBay', 3, 'Set the new module in bay FAN 04.') },
    { view: 'fans', text: 'Press it down gently until the latch clicks, within the minute', hint: 'Its LED turns green once it is latched and spinning.', done: t => t.flags.fanDone, cue: () => C('fanBay', 3, 'Press FAN 04 down gently until the latch clicks.') },
    { view: 'bench', text: 'Refit the top cover', done: t => t.flags.fanDone && t.cover === 'closed', hint: 'Latch open, cover half an inch behind the front lip, the pin centred in the small hole at the end of the latch, then press the latch down.', cue: closeCue },
    { view: 'rack', text: 'Push the server back into the rack', done: t => t.flags.fanDone && t.cover === 'closed' && t.rack.pos === 'in', cue: () => C('rackIn', '', 'Push the server back until the slam latches click onto the posts.') }
  ]
});

// Cisco IMC navigation for the power supply pages (Chassis, Inventory / Faults and Logs); on the page already: Refresh
const psuNavCue = (t, page, msg) => { const c = t.cimc;
  if (!c.auth || c.tab !== 'app') return loginCue(t);
  if (c.kvm) return C('cimcKvmClose', '', 'Close the KVM console.');
  if (c.page === page) return C('cimcMisc', 'Refresh', 'Click Refresh to read the page again.');
  if (!c.menu) return C('cimcMenu', '', 'Open the navigation menu: click the button at the top left.');
  if (!c.chassisOpen) return C('cimcNav', 'chassis', 'Click Chassis to expand it.');
  return C('cimcNav', page, msg); };
const PSUF = 1;   // the failed supply in this scenario: PSU 2, the upper bay
Sim.registerScenario({
  id: 'psu', title: 'Maintenance: replace a failed power supply (hot-swap)', start: 'cimc',
  intro: 'Monitoring raised an alarm and the power supply status LED on the front panel blinks amber. The server has two 1200 W supplies, redundant as 1+1, so you replace the failed one with the server running. You are logged in to Cisco IMC. Find the failed supply, check the spare, then swap it the Cisco way: cord out, pinch the release lever toward the handle and pull; push the new one in until the lever locks, then reconnect the cord.',
  setup() {
    const t = buildFull(), now = Date.now(); t.psu[PSUF].fault = true; t.esd = false;
    t.psuFaultAt = now - 26 * 60000;
    t.psuEv = [{ at: now - 26 * 60000, sev: 'Critical', txt: 'PSU2_STATUS: Power Supply sensor for PSU2, Failure detected was asserted' }, { at: now - 26 * 60000 + 2000, sev: 'Major', txt: 'PSU_REDUNDANCY: PS Redundancy sensor, Redundancy Lost was asserted' }];
    Object.assign(t.cimc, { auth: true, sess: WO.ip, url: WO.ip, tab: 'app', page: 'summary', menu: false, chassisOpen: false, form: { url: 'https://' + WO.ip } });
    return t;
  },
  steps: [
    { view: 'cimc', text: 'In Cisco IMC, open Chassis, Faults and Logs: which supply failed?', hint: 'The Fault Summary says redundancy is lost; the System Event Log below it names the supply.', done: t => t.flags.psuFaultSeen || t.flags.psuPulled,
      cue: t => psuNavCue(t, 'faults', 'Click Faults and Logs.') },
    { view: 'cimc', text: 'Open Chassis, Inventory, Power Supplies: note the product ID and the load', hint: 'The spare must have the same product ID. The supply that still works carries the whole load on its own.', done: t => t.flags.psuInvSeen || t.flags.psuPulled,
      cue: t => psuNavCue(t, 'inventory', 'Click Inventory: the Power Supplies tab is open.') },
    { view: 'cimc', text: 'Turn on the locator LED, so you find this server from the rear of the rack', done: t => t.flags.locOn || t.flags.psuPulled,
      cue: t => t.cimc.auth ? C('cimcLocator', '', 'Click Locator LED in the toolbar: the blue unit identification LED lights on the front and the rear.') : loginCue(t) },
    { view: 'psu', text: 'At the rear, read the LEDs of both supplies and find the failed one', hint: 'Failed: fault LED solid amber. Healthy: status LED solid green, fault LED off.', done: t => t.flags.psuFound || t.flags.psuPulled,
      cue: () => C('psuLed', PSUF, 'Click the LEDs of the supply whose fault LED is solid amber.') },
    { view: 'psu', text: 'Check the spares: take the carton whose label matches (UCSC-PSU2V2-1200W)', hint: 'Do not mix power supply types or wattages in the server.', done: t => !!t.psuSpare,
      cue: () => C('psuSpare', '1200', 'Read both carton labels in the Spares panel and take the UCSC-PSU2V2-1200W one.') },
    { view: 'psu', text: 'Put on the ESD wrist strap', done: t => t.esd || t.flags.psuDone, cue: () => C('esd', '', 'Put on the ESD wrist strap: click the button below the picture.') },
    { view: 'psu', text: 'Undo the cord strap and unplug the power cord from PSU 2 only', hint: 'Leave PSU 1 alone: it carries the whole server now.', done: t => t.flags.psuCordOut,
      cue: t => t.psu[PSUF].strap ? C('psuStrap', PSUF, 'Undo the hook-and-loop strap that ties the PSU 2 cord to its handle.') : C('psuCord', PSUF, 'Pull the power cord out of the PSU 2 inlet.') },
    { view: 'psu', text: 'Push the green release lever toward the handle and keep it pushed', hint: 'Push the green tab toward the handle from its outer side, and keep it pushed. "Show how" marks where to push and pull.', done: t => t.psuPinch === PSUF || t.flags.psuPulled,
      cue: () => C('psuLever', PSUF, 'Push here: press the green release lever of PSU 2 toward the handle, and keep it pushed.') },
    { view: 'psu', text: 'Pull PSU 2 out of the bay', hint: 'Support it underneath as it comes free.', done: t => t.flags.psuPulled, cue: () => C('psuPull', PSUF, 'Pull PSU 2 out by its handle, keeping the lever pinched.') },
    { view: 'psu', text: 'Set the failed supply aside, tagged for return', done: t => t.psuRma, cue: () => C('psuAside', '', 'Set the failed supply aside for return.') },
    { view: 'psu', text: 'Pick up the new supply and look at its connector end', hint: 'The gold contacts must be clean and undamaged.', done: t => t.flags.psuSpareUsed || (t.psuHand && t.psuHand.kind === 'new'),
      cue: () => C('psuPick', '', 'Pick up the new supply from the cart (Spares panel).') },
    { view: 'psu', text: 'Slide it into the empty PSU 2 bay, the same way up as PSU 1', done: t => t.flags.psuSpareUsed, cue: () => C('psuBay', PSUF, 'Slide the new supply into the empty PSU 2 bay by its handle.') },
    { view: 'psu', text: 'Push it home: the release lever clicks into place by itself', hint: 'You do not touch the lever. You hear and feel the click when its hook drops into the notch.', done: t => t.flags.psuSpareUsed && t.psu[PSUF].st === 'in',
      cue: () => C('psuBay', PSUF, 'Push PSU 2 home. The release lever clicks into place by itself.') },
    { view: 'psu', text: 'Connect the power cord and fasten the strap around it', hint: 'Its status LED turns solid green and the amber fault LED goes out.', done: t => { const ok = t.flags.psuSpareUsed && t.psu[PSUF].st === 'in' && !!t.cables.psu2 && t.psu[PSUF].strap; if (ok) t.flags.psuDone = true; return ok; },
      cue: t => !t.cables.psu2 ? C('psuCord', PSUF, 'Push the power cord into the PSU 2 inlet.') : C('psuStrap', PSUF, 'Fasten the hook-and-loop strap around the cord.') },
    { view: 'cimc', text: 'In Cisco IMC, check Faults and Logs again: no power supply fault', hint: 'The front power supply status LED is green again.', done: t => t.flags.psuVerified,
      cue: t => psuNavCue(t, 'faults', 'Click Faults and Logs.') },
    { view: 'cimc', text: 'Turn the locator LED off', done: t => t.flags.psuVerified && !t.locator, cue: t => t.cimc.auth ? C('cimcLocator', '', 'Click Locator LED to turn it off.') : loginCue(t) }
  ]
});

// the RAM Distributor labs (views-rdist.js, engine/memplan.js): a random work order from CIS_RULES.tasks, planned on the board
const RD_FIT = 'Click the sockets in Cisco\'s order: every blue #1 socket first, alternating CPUs (A1, E1, B1, F1 ...), then black #2, then white #3. Distribute shows the layout.';
Sim.registerScenario(MemPlan.lab({ id: 'ramdist', title: 'RAM Distributor: plan a memory setup on the board (practice)', hint: RD_FIT, setup: rdSetup,
  practiceIntro: 'Plan a memory setup on the RAM Distributor board, as a guide for the real server: choose one or two CPUs, the DIMM (16 GB or 32 GB RDIMM, or 64 GB LRDIMM) and the memory size; the list offers only the sizes that DIMM builds in a layout Cisco supports. The map shows the sockets and the CPUs where they sit on the board, rear of the server at the top. Place the DIMMs in Cisco\'s order (blue #1 first, alternating CPUs: A1, E1, B1, F1 ...), or press Distribute to see the layout, then Verify Distribution. Verify also says whether another DIMM size would give the same capacity faster or with fewer DIMMs. The exam is the next lab.' }));
Sim.registerScenario(MemPlan.lab({ id: 'ramexam', title: 'RAM Distributor: exam (random work order, graded)', exam: true, setup: rdSetup,
  examIntro: 'Exam, graded: guidance, Distribute and the marks on the board are off until you verify. Place the three Cisco DIMM sizes (16 GB and 32 GB RDIMM, 64 GB LRDIMM) on the board for the work order, then Verify Distribution to submit. An unsupported layout, or less capacity than ordered, fails. A supported layout passes, with points off: 20 if a faster layout was possible at the capacity needed, 10 for more capacity than needed, 10 for more DIMMs than needed. Pass mark 70. Restart for a new work order.' }));

/* ---- operating system installs over the KVM console's virtual media (views-os.js, engine/os-*.js): a reinstall of
   the server, one lab per operating system ---- */
[['ubuntu', 'Ubuntu Server 24.04 LTS'], ['rocky', 'Rocky Linux 9.5'], ['esxi', 'VMware ESXi 8.0 U3, Cisco custom image']].forEach(([os, name]) => Sim.registerScenario({
  id: 'os-' + os, title: `OS install over Cisco IMC virtual media: ${name}`, start: 'cimc', setup: osLabSetup(os),
  get intro() { const w = OSNET, m = OSI.meta(os); return `The UCS C240 M4 S/N ${WO.serial} is built, racked and cabled, and runs Rocky Linux 8.10 from its RAID virtual drive (the four 8 TB drives). A new project needs it reinstalled with ${m.name}. Work from your laptop on the management network, through Cisco IMC at ${WO.ip} (admin, password Lab-Train1ng!): launch the KVM console, activate the virtual devices and map ${OSI.want(T)} from the laptop's Downloads folder (several images there look alike), restart the server and boot it once from the virtual DVD (F6 at POST, Boot Menu). Install on the RAID virtual drive; host name ${w.host}, ${w.ip}/${w.prefix} with gateway ${w.gw} and DNS ${w.dns} on VIC PORT 1 (cabled to SW01 port 23). LAN 1 and LAN 2, the onboard ports, have no cable in this build, and no DHCP server answers on the data network. ${m.flavor === 'esxi' ? `Root password ${OSI.acc.pw}. VMware's compatibility guide does not certify the C240 M4 for ESXi 8.0: fine for this lab, check the guide before a production install.` : `The account ${OSI.acc.user} with the password ${OSI.acc.pw}.`} Unmap the image when the installer is done. Then log in at the console and check the build from the OS: the memory, processors, disks and network it reports must match what is in the server. Read the boot order in Cisco IMC, and record the handover.`; },
  steps: [{ view: 'cimc', get text() { return `On the laptop, open ${WO.ip} and log in to Cisco IMC`; }, hint: 'admin, password Lab-Train1ng! (the strong password set at the management setup).', done: t => !!(t.cimc.auth && t.cimc.tab === 'app') || !!t.flags.osIn, cue: t => (t.cimc.auth && t.cimc.tab === 'app' ? (t.flags.osIn = true, null) : loginCue(t)) }, ...OSI.steps(os, CIS_OS)]
}));

/* ============ 7. For tests and the browser console (window.pack while this model is active) ============ */
// testAnswer: for automated runs, a decision the scenarios leave to the student (none at the moment)
Sim.expose({ PROFILE, CATALOG, WO, byId, dimmVerdict, memSummary, memCheck, fresh, buildFull, runRules, testAnswer: () => null });
