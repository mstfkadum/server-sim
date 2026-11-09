/* ============ Scenarios: ordered steps, each tied to a view, a test on the twin, and a cue for the next click ============
   © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved. */
const C = (act, arg, say) => ({ act, arg, say });
// one rail, Dell's order: pick it up, rear end piece on the rear post, the front latch open, front end piece on the front post
const railCue = k => t => {
  const r = t.rack, R = r.rail[k];
  if (!R.rear) return r.hand === k ? C('railRear', k, `Seat the rear end piece of the ${SIDE[k]} rail on the ${SIDE[k]} rear post at U${r.u}: both pins into the holes, push until it clicks.`)
    : C('railPick', k, `Pick up the ${SIDE[k]} rail from the kit (its end pieces are marked ${MARK[k]}), FRONT toward you.`);
  if (!R.latch) return C('railLatch', k, 'Pull the latch on the front end piece open: the pins cannot go in while it is closed.');
  return C('railFront', k, `Seat the front end piece on the ${SIDE[k]} front post at U${r.u}, top and bottom holes: the latch clicks back and locks it.`);
};
Sim.registerScenario({
  id: 'rackin', title: 'Rack installation: find the U, fit the rails, lift and secure', start: 'rack', setup: fresh,
  intro: `Work order: install the ${PROFILE.name}, Service Tag ${WO.tag}, in U${WO.u} of ${WO.rack} on its ReadyRails sliding rails (drop-in design). The server is on a cart beside the rack. Check its information tag against the work order, find U${WO.u} on the numbered strip, fit both rails (rear end first, then the front, both at U${WO.u}), pull the inner rails out, lower the server onto them rear standoffs first, release the rails and slide it in, then pull on it to check it is held. Two people for the lift. The step bar above the picture always tells you the next action, and the amber ring shows where to click. When the server is in and checked, a Continue button takes you on with this same server: its processor, then its memory.`,
  steps: [
    { view: 'rack', text: 'Pull the information tag, check the Service Tag against the work order, push it back in', hint: 'The information tag is the slide-out label in the black housing on the front, left of the right control panel; it slides out downward. The Express Service Code is the Service Tag in decimal.', done: t => t.tagRead && !t.pullTab,
      cue: t => !t.tagRead ? C('tagPull', '', 'Pull the information tag down by its lip under the face, left of the power button.') : C('tagPush', '', 'Push the information tag back up into its housing, or it catches on the rack.') },
    { view: 'rack', text: `Find U${WO.u} on the numbered strip and mark it`, hint: 'The strip beside the left post counts up from the bottom. One U is three holes; the rail end pieces go in the top and bottom holes of the U.', done: t => t.rack.u === WO.u,
      cue: () => C('rackU', WO.u, `Click U${WO.u}: the free unit under the Cisco UCS C220 M4.`) },
    { view: 'rails', text: 'Fit the left rail: rear end piece on the rear post first, then the front', hint: 'Each end piece is marked LEFT or RIGHT and FRONT or REAR. Rear end: its two pins into the top and bottom holes of the U, push until they click in. Front end: pull its latch open, push it onto the post, the latch clicks back.', done: t => railDone(t, 'l'), cue: railCue('l') },
    { view: 'rails', text: `Fit the right rail the same way, at U${WO.u}`, hint: 'Both rails at the same U, level front to rear. A rail one hole off makes the server bind.', done: t => railDone(t, 'r'), cue: railCue('r') },
    { view: 'rails', text: 'Pull both inner rails out until they lock', hint: 'The inner rails stay in the rack: they slide out toward you and lock in the extended position.', done: t => t.rack.ext,
      cue: () => C('railExt', '', 'Pull the inner rails out toward you until they lock in the extended position.') },
    { view: 'rails', text: 'Two-person lift: rear standoffs into the rear J-slots, then rotate the front down', hint: 'Dell: lower the rear rail standoff on each side of the system into the rear J-slots, then rotate the system downward until all the standoffs are seated in the J-slots. Rear first frees a hand to steady the server.', done: onRails,
      cue: t => t.rack.pos === 'cart' ? C('dropRear', '', 'Lift with two people. Lower the rear standoff on each side of the server into the rear J-slot of its rail.') : C('dropFront', '', 'Rotate the front of the server down until all the standoffs drop into their J-slots and click back into the hooks.') },
    { view: 'rails', text: 'Pull the blue slide-release lock tabs on both rails and slide the server into the rack', hint: 'The inner rails are locked in the extended position. The blue tab on each one releases it.', done: t => t.rack.pos === 'in' || t.rack.pos === 'out',
      cue: t => !t.rack.tabs.l ? C('slideTab', 'l', 'Pull the blue slide-release lock tab in the middle of the left inner rail.') : !t.rack.tabs.r ? C('slideTab', 'r', 'Pull the blue slide-release lock tab in the middle of the right inner rail too.') : C('srvPush', '', 'Slide the server into the rack, the inner rails with it, until both rack ears touch the posts.') },
    { view: 'rails', text: 'Check: press both rack-ear latches, pull the server out, push it back until they click', hint: 'The latch on each rack ear holds the server in the rack. Press both, slide it out to the service position, then pull the blue tabs and push it back: click, click.', done: t => t.rack.cycled,
      cue: t => { const r = t.rack; return r.pos === 'in' ? (!r.ear.l ? C('earLatch', 'l', 'Press the latch on the left rack ear: the left end of the front, left of the status LED.') : !r.ear.r ? C('earLatch', 'r', 'Press the latch on the right rack ear too: the right end of the front.') : C('srvOut', '', 'Both latches pressed: pull the server out until the rails lock.'))
        : !r.tabs.l ? C('slideTab', 'l', 'Pull the blue slide-release lock tab in the middle of the left inner rail.') : !r.tabs.r ? C('slideTab', 'r', 'Pull the blue slide-release lock tab in the middle of the right inner rail too.') : C('srvPush', '', 'Push the server back into the rack until both ear latches click.'); } }
  ]
});
// the processor lab: Dell's service order, from the Installation and Service Manual (pages 25 to 33 and 54 to 60)
const cordsIn = (t, want) => [t.cpu.cab.psu1, t.cpu.cab.psu2].every(x => x === want);
const DATA = ['gb1', 'gb2', 'idrac'];
// the right tool first: a cue to pick it up from the rack when the one in hand does not fit
const toolCue = (t, list, want, why) => list.includes(t.cpu.tool) ? null : C('tool', want, `Pick up the ${TOOLS[want].name} from the rack: ${why}`);
const lockTool = t => toolCue(t, LOCK_TOOLS, 'flat', 'the cover lock takes a 1/4 inch flat blade (a Phillips #2 also fits).');
const t20Tool = (t, what) => toolCue(t, T20S, 't20', `${what} are Torx T20.`);
const fpTightCue = t => t.cpu.plate === 'up' ? C('plateClose', '', 'Lower the force plate over the processor.') : t.cpu.tool !== 'tq' ? C('tool', 'tq', 'Pick up the torque driver with the T20 bit: Dell tightens the force plate screws to 12.0 ± 1.0 lbf-in.') : t.cpu.torque !== 12 ? C('torque', '12', 'Set the torque driver to 12 lbf-in.') : !t.cpu.press ? C('press', '', 'Press the force plate down with a finger, at its rear edge, while you tighten.') : fpCue(t, 'tighten it to 12 lbf-in, pressing the plate flat (the plate closes 1, 2, 3).');
const hsCue = t => { const c = t.cpu, w = hsWant(c); return w ? C('hsScrew', w[0], `Screw ${w[0] + 1}: ${w[1] === 1 ? 'about three turns' : 'fully'} (T20). Dell's order: 1 and 2 three turns, 3 and 4 three turns, 1 and 2 fully, 3 and 4 fully.`) : null; };
const fpCue = (t, txt) => { const n = fpNext(t.cpu); return C('fpScrew', n, `Force plate screw ${n + 1}: ${txt}`); };
const earCue = t => { const r = t.rack; return !r.ear.l ? C('earLatch', 'l', 'Press the latch on the left rack ear.') : !r.ear.r ? C('earLatch', 'r', 'Press the latch on the right rack ear too.') : C('srvOut', '', 'Both latches pressed: pull the system out to the service position.'); };
const inCue = t => { const r = t.rack; return !r.tabs.l ? C('slideTab', 'l', 'Pull the blue slide-release lock tab in the middle of the left inner rail.') : !r.tabs.r ? C('slideTab', 'r', 'Pull the right one too.') : C('srvPush', '', 'Push the system back into the rack until both ear latches click.'); };
function dataCabCue(t) {
  const c = t.cpu, order = ['idrac', 'gb1', 'gb2'];
  const wrong = order.find(k => cabWrong(t, k));
  if (wrong) return C('cab', wrong, `Unplug ${CAB[wrong].name} from the wrong switch port (${portTxtD(c.cabTo[wrong], c.cabPort[wrong])}) so you can move it to ${CAB[wrong].far}.`);
  const k = order.find(x => !c.cab[x]);
  if (!k) return null;
  if (c.cabOff[k]) return C('cab', k, `Plug the ${CAB[k].name} cable back in at the server (label: ${CAB[k].far}).`);
  return c.cabSel === k
    ? C('cabDest', `${CAB[k].dest}:${CAB[k].port}`, `Click ${CAB[k].far} (${CAB[k].ifName}) on ${DNAME[CAB[k].dest]} to connect ${CAB[k].name}.`)
    : C('cab', k, `Click the ${CAB[k].name} port on the rear of the server (work order: ${CAB[k].far}).`);
}
function pwrCabCue(t) {
  const c = t.cpu;
  for (const k of ['psu1', 'psu2']) {
    if (cabWrong(t, k)) return C('cab', k, `Unplug ${CAB[k].name} from the wrong PDU outlet (${portTxtD(c.cabTo[k], c.cabPort[k])}) so you can move it to ${CAB[k].far}.`);
    if (!c.cab[k]) {
      if (c.cabOff[k]) return C('cab', k, `Connect the ${CAB[k].name} back in at the server (label: ${CAB[k].far}).`);
      return c.cabSel === k
        ? C('cabDest', `${CAB[k].dest}:${CAB[k].port}`, `Click ${CAB[k].far} on ${DNAME[CAB[k].dest]} to connect the ${CAB[k].name}.`)
        : C('cab', k, `Click the ${k === 'psu1' ? 'PSU 1' : 'PSU 2'} power inlet on the rear of the server (work order: ${CAB[k].far}).`);
    }
    if (!c.strap[k]) return C('psuStrap', k, `Fasten the hook-and-loop retention strap on the ${k === 'psu1' ? 'PSU 1' : 'PSU 2'} handle to secure the power cable (Dell ISM page 93).`);
  }
  if (!c.labeled) return C('cabLabel', '', 'Fit printed wraparound labels at both ends of every cable.');
  return null;
}
// cabled: a step of the server in service only (shutting down and unplugging before service); a new installation is not cabled yet
// the first iDRAC setup: the NOC, the boot screens and System Setup, the browser (views-idrac.js)
const nocCue = t => { const n = t.idr.noc; return n.sw !== 'MGT01' ? C('nocPick', 'sw:MGT01', 'Pick the management switch: MGT01.') : n.port !== '13' ? C('nocPick', 'port:13', 'Pick the port from the cable schedule: 13.') : n.net !== '10.1.23.0/24' ? C('nocPick', 'net:10.1.23.0/24', 'Pick the management subnet: 10.1.23.0/24.') : C('nocSend', '', 'Send the request to the NOC.'); };
function idrCue(t) {
  const d = t.idr, f = d.form, ph = idrPh(t);
  if (t.cpu.power !== 'on') return C('go', 'rack', 'The server is off: press its power button (Rack view).');
  if (ph === 'init' || ph === 'logo' || ph === 'entering') return { say: 'Watch the monitor: the server is starting. Get ready to press F2.' };
  if (ph !== 'setup') {
    if (d.saved && d.rebooted) return ph === 'prompt' || ph === 'noboot' ? C('idrIp', '', `Check the boot screen: iDRAC IPV4 ${IDR.ip} [Dedicated]. Click it.`) : { say: 'Watch the boot screen.' };
    return C('dkey', 'F2', 'Press F2 for System Setup (your keyboard, or click it on the screen).');
  }
  const g = d.dlg;
  if (g) {
    if (g.k === 'pw1') return d.pw1 !== IDR.pw ? { field: 'idrpw:1', value: IDR.pw, say: `Type the new password: ${IDR.pw}.` } : C('dlgOk', '', 'OK.');
    if (g.k === 'pw2') return d.pw2 !== IDR.pw ? { field: 'idrpw:2', value: IDR.pw, say: `Type it again: ${IDR.pw}.` } : C('dlgOk', '', 'OK.');
    if (g.k === 'save' || g.k === 'exit') return C('dlgYes', '', g.k === 'save' ? 'Yes: save the changes.' : 'Yes: exit and reboot.');
    return C('dlgOk', '', 'OK.');
  }
  const p = d.page, needNet = !netOk(f) && !d.saved, needPw = !d.pwSet && !d.saved;
  const toIdrac = () => p === 'main' ? C('dgo', 'idrac', 'Open iDRAC Settings.') : C('dbtn', 'back', 'Back to iDRAC Settings.');
  if (needNet) {
    if (p !== 'net') return p === 'idrac' ? C('dgo', 'net', 'Open Network.') : toIdrac();
    const rad = (k, v, w) => f[k] !== v ? C('dset', `${k}:${v}`, w) : null, tx = (k, v, w) => f[k] !== v ? { field: 'idr:' + k, value: v, say: w } : null;
    return rad('nic', 'Enabled', 'Enable NIC: Enabled.') || rad('nicSel', 'Dedicated', 'NIC Selection: Dedicated (the iDRAC port on the rear panel).') || rad('ipv4', 'Enabled', 'Enable IPv4: Enabled.') || rad('dhcp', 'Disabled', 'Enable DHCP: Disabled. There is no DHCP server on the management network.')
      || tx('ip', IDR.ip, `Static IP Address: ${IDR.ip}.`) || tx('gw', IDR.gw, `Static Gateway: ${IDR.gw}.`) || tx('mask', IDR.mask, `Static Subnet Mask: ${IDR.mask}.`) || rad('vlan', 'Disabled', 'Enable VLAN ID: Disabled (MGT01 port 13 is an access port).');
  }
  if (needPw) { if (p !== 'user') return p === 'idrac' ? C('dgo', 'user', 'Open User Configuration.') : toIdrac(); return C('dgo', 'pw', 'Change Password: press Enter, or click it.'); }
  if (!d.saved) return p === 'idrac' ? C('dbtn', 'finish', 'Finish: it asks to save the changes.') : toIdrac();
  return p === 'main' ? C('dbtn', 'finish', 'Finish: exit System Setup and reboot.') : p === 'idrac' ? C('dbtn', 'finish', 'Finish: back to the main menu.') : C('dbtn', 'back', 'Back.');
}
function webCue(t) {
  const w = t.idr.web, url = 'https://' + IDR.ip;
  if (w.page === 'blank' || w.page === 'err') return w.url !== url ? { field: 'web:url', value: url, say: `Type ${url} in the address bar.` } : C('webGo', '', 'Go.');
  if (w.page === 'cert') return w.adv ? C('webProceed', '', `Proceed to ${IDR.ip}: the iDRAC's own self-signed certificate.`) : C('webAdv', '', 'Advanced: the certificate is the iDRAC\'s self-signed one.');
  if (w.page === 'login') return w.user !== IDR.user ? { field: 'web:user', value: IDR.user, say: `Username: ${IDR.user}.` } : w.pw !== IDR.pw ? { field: 'web:pw', value: IDR.pw, say: 'Password: the one you set in System Setup.' } : C('webLogin', '', 'Log In.');
  return C('webCheck', '', `Click the iDRAC IPv4 Address: ${IDR.ip}, as in the work order?`);
}
const CPU_STEPS = [
  { cabled: true, view: 'rack', text: 'Shut the operating system down, then power the system off', hint: 'The power button on the right control panel. Never open a running system.', done: t => t.cpu.power === 'off' || t.cpu.back, cue: () => C('powerBtn', '', 'Press the power button on the right control panel, after the operating system has shut down.') },
  { cabled: true, view: 'rear', text: 'Disconnect both power cords at the server', hint: 'PSU 1 and PSU 2 at the rear. Both: either supply alone keeps the board powered. Dell: disconnect the system from the electrical outlet, then the peripherals.', done: t => cordsIn(t, false) || t.cpu.back, cue: t => C('cab', t.cpu.cab.psu1 ? 'psu1' : 'psu2', `Unplug the PSU ${t.cpu.cab.psu1 ? 1 : 2} cord at the server.`) },
  { cabled: true, view: 'rear', text: 'Unplug Gb 1, Gb 2 and iDRAC at the server; the far ends stay in the switches', hint: 'Each cable is labelled with its far end. Unplugged, it hangs beside its port.', done: t => DATA.every(k => !t.cpu.cab[k]) || t.cpu.back, cue: t => { const k = DATA.find(k => t.cpu.cab[k]); return C('cab', k, `Unplug the ${CAB[k].name} cable at the server (label: ${CAB[k].far}).`); } },
  { view: 'rails', text: 'Press both ear latches and pull the system out to the service position', done: t => t.rack.pos === 'out' || t.cpu.back, cue: earCue },
  { view: 'inside', text: 'Put on the ESD wrist strap', done: t => t.cpu.esd, cue: () => C('esd', '', 'Put on the ESD wrist strap, below the chassis, and clip it to bare chassis metal.') },
  { view: 'inside', text: 'Remove the system cover: unlock, lift the release latch, lift the cover off', hint: 'Figure 17: 1 the lock, a quarter turn anticlockwise with a 1/4 inch flat blade or a Phillips #2 screwdriver; 2 the release latch, until the cover slides back; 3 lift.', done: t => t.cpu.cover === 'off' || t.cpu.back,
    cue: t => t.cpu.cover === 'locked' ? lockTool(t) || C('coverLock', '', 'Turn the cover lock a quarter turn anticlockwise: the round lock at the pivot end of the release latch, in the middle of the cover.') : t.cpu.cover === 'unlocked' ? C('coverLatch', '', 'Lift the release latch until the cover slides back.') : C('coverLift', '', 'Lift the cover off the system.') },
  { view: 'inside', text: 'Lift the air shroud out', hint: 'Figure 21: hold its touch points at both ends.', done: t => t.cpu.shroud === 'out' || t.cpu.back, cue: () => C('shroud', '', 'Hold the air shroud at its touch points at both ends and lift it out.') },
  { view: 'socket', text: 'Let the heat sink cool, loosen its four captive screws in the marked order, lift it off', hint: 'Figure 45. Dell: 1 and 2 about three turns, 3 and 4 about three turns, then 1 and 2 completely, then 3 and 4 completely. Torx T20.', done: t => !t.cpu.hs.on || t.cpu.tray !== 'old',
    cue: t => !t.cpu.cool ? C('cool', '', 'The heat sink is hot: wait for it to cool.') : hsCue(t) ? t20Tool(t, 'the heat sink captive screws') || hsCue(t) : C('hsLift', '', 'All four screws loose: lift the heat sink from the system.') },
  { view: 'socket', text: 'Wipe the old grease off the processor lid and the heat sink base', hint: 'A lint-free cloth. The heat sink is reused: old and new grease must not mix. The old processor goes back in its tray clean.', done: t => (t.cpu.lidClean && t.cpu.hs.clean) || t.cpu.tray !== 'old',
    cue: t => !t.cpu.lidClean ? C('lidClean', '', 'Wipe the old grease off the processor lid with the lint-free cloth: click the lid.') : C('hsClean', '', 'Wipe the old grease off the heat sink base (the button below).') },
  { view: 'socket', text: 'Open the force plate: loosen the screws 3, 2, 1; it swings up on its front hinge', hint: 'Figure 46: OPEN 3->2->1, with the T20. Screw 1 is on the rear bar of the plate, 2 and 3 on the front brackets. Keep a finger on the plate: it is spring-loaded and springs up when the last screw lets go.', done: t => t.cpu.plate === 'up' || t.cpu.tray !== 'old', cue: t => t20Tool(t, 'the force plate screws') || (!t.cpu.press ? C('press', '', 'Hold the force plate down with a finger at its rear edge first: it is spring-loaded.') : fpCue(t, 'loosen it (the plate opens 3, 2, 1).')) },
  { view: 'socket', text: 'Lift both blue latches: the rail frame rises with the processor tray in it', hint: 'Figure 47. The latches are on the rear corners of the rail frame.', done: t => t.cpu.frame === 'up' || t.cpu.tray !== 'old', cue: t => !t.cpu.latch.l ? C('latch', 'l', 'Lift the left blue latch on the rail frame.') : C('latch', 'r', 'Lift the right blue latch too: the frame swings up.') },
  { view: 'socket', text: 'Hold the tab and slide the processor tray out of the top of the standing frame', hint: 'Figure 48. The processor stays in its tray; never touch its contacts or the socket pins.', done: t => t.cpu.tray !== 'old', cue: () => C('trayOut', '', 'Hold the tab of the processor tray and slide the tray out of the top of the rail frame.') },
  { view: 'socket', text: 'Take the new processor from the kit, line its triangle up with the frame\'s, slide it in until firmly seated', hint: 'Figure 49. The gold triangle on the processor and its carrier marks one corner; the rail frame has the same mark. The tray fits one way only.', done: t => t.cpu.tray === 'new', cue: t => t.cpu.hand ? (t.cpu.trayRot ? C('trayTurn', '', 'Turn the tray 180 degrees: its triangle must sit at the same corner as the triangle on the rail frame.') : C('trayIn', '', 'Triangles at the same corner: slide the new tray into the rail frame from the top until it is firmly seated.')) : C('trayPick', '', `Take the ${WO2.cpu} tray from the kit (the button below).`) },
  { view: 'socket', text: 'Push the rail frame down until the blue latches lock', hint: 'Figure 50.', done: t => t.cpu.tray === 'new' && t.cpu.frame === 'down', cue: () => C('frameDown', '', 'Push the rail frame down until the blue latches lock into place.') },
  { view: 'socket', text: 'Lower the force plate and close it: tighten the screws 1, 2, 3, pressing the plate flat', hint: 'Figure 51: CLOSE 1->2->3, 12.0 ± 1.0 lbf-in: the torque driver with its T20 bit. Press the force plate while tightening so the processor cover does not tilt.', done: t => t.cpu.tray === 'new' && t.cpu.frame === 'down' && t.cpu.plate === 'down' && t.cpu.fp.every(Boolean),
    cue: fpTightCue },
  { view: 'socket', text: 'Draw a thin spiral of thermal grease on the processor with the syringe', hint: 'Figure 52: hold the mouse button down on the lid and draw from the centre outward, about three turns. Too much, or off the lid, and it runs into the socket: wipe it off and draw again.', done: t => t.cpu.hs.grease === 1,
    cue: t => t.cpu.hs.grease === -1 ? C('greaseWipe', '', 'Too much grease: wipe it off with the lint-free cloth (the button below) and draw again.') : { act: 'grease', arg: '', drag: greaseDrag(), say: 'Hold the mouse button down on the processor lid and draw a thin spiral, from the centre outward, about three turns.' } },
  { view: 'socket', text: 'Lower the heat sink and tighten its screws: 1 and 2, 3 and 4 three turns, then fully', hint: 'Figure 53: the captive screws over the standoffs. Torx T20.', done: t => t.cpu.hs.on && t.cpu.hs.screws.every(x => x === 2),
    cue: t => !t.cpu.hs.on ? C('hsPlace', '', 'Lower the heat sink onto the processor, its captive screws over the standoffs.') : t20Tool(t, 'the heat sink captive screws') || hsCue(t) },
  { install: true, view: 'mem', text: 'Install the memory: open the DIMM kit, choose a supported Dell DDR4 model, populate in Dell\'s order (A1, A2, A3, A4...)', hint: 'ISM Table 13 and page 49: one of the five supported DDR4-3200 models, never mixed. White release tabs first, A1 to A8, then black, A9 to A16; at least 4 equal modules (A1 to A4), or 8, 12 or 16. Open both ejector latches, align the key, press both ends evenly until the latches click.', done: t => !t.memLab || (memOk(t) && !SLOTS.some(s => t.memOpen[s])), cue: memCue },
  { view: 'inside', text: 'Install the air shroud and the system cover: align, close the latch, lock', hint: 'Figures 22 and 18. No tools or parts left inside.', done: t => t.cpu.back && t.cpu.shroud === 'in' && t.cpu.cover === 'locked',
    cue: t => t.cpu.shroud === 'out' ? C('shroud', '', 'Lower the air shroud in, its slot on the chassis standoff.') : t.cpu.cover === 'off' ? C('coverPlace', '', 'Align the cover tabs with the guide slots and set the cover on.') : t.cpu.cover === 'placed' ? C('coverClose', '', 'Close the release latch: the cover pulls home.') : lockTool(t) || C('coverLock', '', 'Turn the lock a quarter turn clockwise.') },
  { view: 'rails', text: 'Pull the blue tabs and push the system back into the rack until the ear latches click', done: t => t.cpu.back && t.rack.pos === 'in', cue: inCue },
  { view: 'rear', text: 'Connect the management and data cables according to the work order: iDRAC to MGT01 port 13, Gb 1 to SW01 port 22, and Gb 2 to SW02 port 22', hint: 'Dell ISM page 20: connect the network and management peripherals first, electrical outlets last. Click a port on the server, then click its assigned switch port from the cable schedule below (odd ports on the top row, even ports on the bottom row).', done: t => t.cpu.back && DATA.every(k => t.cpu.cab[k]), cue: dataCabCue },
  { view: 'rear', text: 'Connect both power cords last (PSU 1 to PDU A outlet 8, PSU 2 to PDU B outlet 8), secure each cord with the PSU handle strap, and label the cables', hint: 'Dell ISM pages 20 and 93: connect PSU 1 to PDU A outlet 8 and PSU 2 to PDU B outlet 8, secure each power cable to the PSU handle with its hook-and-loop strap, and fit wraparound labels at both ends.', done: t => t.cpu.back && cordsIn(t, true) && t.cpu.strap.psu1 && t.cpu.strap.psu2 && t.cpu.labeled, cue: pwrCabCue },
  { idrac: true, view: 'noc', text: 'Ask the NOC to confirm the management VLAN for 10.1.23.0/24 on MGT01 port 13', hint: 'The iDRAC address only works if the switch port it is cabled to is already in the management VLAN. The cable schedule gives the switch and the port; the work order gives the subnet.', done: t => !t.idr || t.idr.noc.ok, cue: nocCue },
  { view: 'rack', text: 'Power the system on by pressing the power button on the front control panel', hint: 'Dell ISM page 20: after connecting the peripherals and electrical outlets, press the power button on the right control panel. Listen for the cooling fans spinning up and check that the power LED lights green.', done: t => t.cpu.back && t.cpu.power === 'on', cue: () => C('powerBtn', '', 'Press the power button on the right control panel to power on the server.') },
  { idrac: true, view: 'rear', text: 'Plug a VGA monitor and a USB keyboard into the rear panel', hint: 'Dell ISM Table 6: the VGA port and the two USB 3.0 ports are on the left of the rear panel, beside the iDRAC port.', done: t => !t.idr || (t.cpu.vga && t.cpu.usb), cue: t => !t.cpu.vga ? C('rearPort', 'vga', 'Plug the monitor cable into the VGA port on the rear panel.') : C('rearPort', 'usb', 'Plug the USB keyboard into a USB 3.0 port on the rear panel.') },
  { idrac: true, view: 'console', text: 'Press F2 when the boot screen offers System Setup', hint: 'The boot screen lists F2 = System Setup, F10 = Lifecycle Controller, F11 = Boot Manager, F12 = PXE Boot. Press F2 on your keyboard, or click it on the screen.', done: t => !t.idr || t.idr.entered || !!t.idr.saved, cue: idrCue },
  { idrac: true, view: 'console', text: 'iDRAC Settings > Network: NIC enabled, Dedicated; IPv4 enabled, DHCP disabled; static address, gateway, mask; VLAN disabled', hint: 'System Setup Main Menu > iDRAC Settings > Network. Up, Down, Tab move; Left, Right or Space change a choice; type the addresses. VLAN stays disabled: MGT01 port 13 is an access port.', done: t => !t.idr || netOk(t.idr.form) || !!t.idr.saved, cue: idrCue },
  { idrac: true, view: 'console', text: 'iDRAC Settings > User Configuration: change the root password to the work order\'s', hint: 'Back to iDRAC Settings, then User Configuration > Change Password: the new password twice.', done: t => !t.idr || t.idr.pwSet || !!t.idr.saved, cue: idrCue },
  { idrac: true, view: 'console', text: 'Finish: save the settings (Yes), then Finish on the main menu: exit and reboot', hint: 'Nothing changes until it is saved. Finish on iDRAC Settings asks to save; Finish on the main menu exits and reboots.', done: t => !t.idr || (!!t.idr.saved && t.idr.rebooted), cue: idrCue },
  { idrac: true, view: 'console', text: 'Check the boot screen: iDRAC IPV4 shows the work order\'s address [Dedicated]', hint: 'After the reboot, the boot screen shows the iDRAC address beside the BIOS version. Click it when it matches the work order.', done: t => !t.idr || t.idr.sawIp, cue: idrCue },
  { idrac: true, view: 'web', text: 'On the laptop: open https://10.1.23.121 and accept the iDRAC\'s self-signed certificate', hint: 'The laptop is on the management network. A new iDRAC has its own self-signed certificate: Advanced, then proceed.', done: t => !t.idr || ['login', 'dash'].includes(t.idr.web.page), cue: webCue },
  { idrac: true, view: 'web', text: 'Log in as root with the password you set', done: t => !t.idr || t.idr.web.page === 'dash', cue: webCue },
  { idrac: true, view: 'web', text: 'Check the iDRAC IPv4 address on the dashboard against the work order', done: t => !t.idr || t.idr.web.checked, cue: webCue },
  { cabled: true, view: 'post', text: 'POST shows a configuration message: press F2 to enter System Setup, verify settings, save and exit', hint: 'Expected after installing or replacing a processor or DDR4 memory (Dell ISM pages 53 and 60). F1 would skip verification.', done: t => t.cpu.post === 'ok', cue: t => (t.cpu.post === 'cmos' || t.cpu.post === 'memPost') ? C('postKey', 'f2', 'Press F2 to enter System Setup (not F1).') : C('postKey', 'finish', 'Settings verified in System Setup: save and exit.') }
];
const chained = () => !!(T && T.cpu && T.cpu.fresh);
Sim.registerScenario({
  brief: t => t.idr && t.cpu.labeled ? idrBrief(t) : null, id: 'cpurep', title: 'Maintenance: replace the processor, reusing its heat sink', start: 'rack', setup: cpuFresh,
  get intro() {
    return chained() ? `The ${PROFILE.name} you just installed in U${WO.u} of ${WO.rack} (Service Tag ${WO.tag}) is not cabled or powered yet. Before it goes into service, replace its processor with the ${WO2.cpu} from the kit, reusing the heat sink, and install the DDR4 memory. Dell's order: slide the system out, cover off, air shroud out, heat sink off (four captive screws in the marked order), force plate open 3, 2, 1, rail frame up by its blue latches, tray out by its tab, the new tray in, frame down, force plate down and closed 1, 2, 3, grease, heat sink on; then install the memory from the DDR4 kit in Dell's population order (A1, A2, A3, A4 first); shroud and cover back, slide into the rack, connect the data and management cables to their assigned switch ports (MGT01 port 13, SW01 port 22, SW02 port 22), connect the power cords to the PDUs (PDU A outlet 8, PDU B outlet 8) with the PSU handle straps and labels, ask the NOC to confirm the management VLAN on MGT01 port 13, power on the server, plug a VGA monitor and a USB keyboard into the rear panel, press F2 and give the iDRAC9 its address and password in System Setup, reboot, and check it from the laptop browser.`
      : `Work order: iDRAC logged a processor fault on the ${PROFILE.name} in U${WO.u}, Service Tag ${WO.tag}. Replace the processor with the ${WO2.cpu} in the kit, reusing the heat sink. Dell's order: shut down and power off, disconnect both power cords and then the cables at the server, slide the system out, cover off, air shroud out, heat sink off (four captive screws in the marked order), force plate open 3, 2, 1, rail frame up by its blue latches, tray out by its tab, the new tray in, frame down, force plate down and closed 1, 2, 3, grease, heat sink on, shroud and cover back, into the rack, cables, cords, power on. The first POST shows a CMOS checksum message: expected, go into System Setup.`;
  },
  get steps() { return chained() ? CPU_STEPS.filter(s => !s.cabled) : CPU_STEPS.filter(s => !s.install && !s.idrac); }
});

// the memory lab: Dell's DDR4 population rules and installation order (ISM pages 17 and 47 to 54)
function memCue(t) {
  if (!t.memBox) return C('memBox', '', 'Open the DIMM kit box on the antistatic mat (in the right tray).');
  if (!t.memPick) return C('memModel', 'r32', 'Choose a supported Dell DDR4-3200 memory model from ISM Table 13 (for example the 32 GB 2Rx8 RDIMM, or any of the five models).');
  const pk = t.memPick, on = dimmList(t);
  const mismatch = on.find(s => t.dimms[s] !== pk);
  if (mismatch) return C('dimmFit', mismatch, `Remove the mismatched module from ${mismatch}: Dell ISM page 49 forbids mixing capacities or RDIMM/LRDIMM.`);
  const targetN = OKN.find(n => n >= Math.max(4, on.length)) || 16, w = wantSlots(targetN);
  const wrong = on.find(s => !w.includes(s));
  if (wrong) return C('dimmFit', wrong, `Remove the module from ${wrong}: for ${targetN} modules Dell's population order is ${w.join(', ')}.`);
  const next = w.find(s => !t.dimms[s]);
  if (!next) {
    const op = SLOTS.find(s => t.memOpen[s]);
    return op ? C('dimmClip', op, `Close the open ejector latches on socket ${op}.`) : null;
  }
  return !t.memOpen[next]
    ? C('dimmClip', next, `Open both ejector latches on socket ${next} (Channel ${CHAN[next]}, ${WHITE_SLOTS.includes(next) ? 'white' : 'black'} release tabs, #${FILL.indexOf(next) + 1} in Dell's order).`)
    : C('dimmFit', next, `Align the edge-connector notch of the ${MEMKIT_D[pk].name} with socket ${next} and press down evenly on both ends until both ejectors click.`);
}

Sim.registerScenario({
  id: 'mem', title: 'Memory installation: choose a supported DDR4 model and populate A1 to A16', start: 'rack', setup: memFresh,
  intro: `Work order: install DDR4 memory in the ${PROFILE.name} in U${WO.u} of ${WO.rack} (Service Tag ${WO.tag}) according to the Dell Installation and Service Manual (pages 17, 20, 47–54 and 93). Dell's order: shut down and power off, disconnect both power cords and then the rear cables at the server (the far ends stay in the switches and PDUs), slide the system out to the service position, put on the ESD wrist strap, unlock and remove the system cover, and lift out the air shroud. In the Memory view, unpack the DDR4 kit on the antistatic mat, choose one of the five supported DDR4-3200 models (Table 13 — never mix RDIMM/LRDIMM or capacities), and populate in Dell's socket order starting with white release tabs A1, A2, A3, A4 (minimum 4 equal modules, or 8, 12, or 16). Reinstall the air shroud and cover, slide the server into the rack, reconnect iDRAC, Gb 1 and Gb 2 first and the power cords last (strapped to the PSU handles), power on, and press F2 at POST to verify Memory Settings in System Setup.`,
  steps: CPU_STEPS.filter(s => s.view !== 'socket' && !s.idrac)
});

// the iDRAC lab: the installed, cabled server, never powered on; the same steps as the end of the installation run
const IDRAC_LAB_STEPS = () => { const i = CPU_STEPS.findIndex(s => s.view === 'noc'); return CPU_STEPS.slice(i).filter(s => !s.cabled); };
Sim.registerScenario({
  brief: t => idrBrief(t), id: 'idrac', title: 'iDRAC setup: NOC check, monitor and keyboard, System Setup (F2), web check', start: 'noc', setup: idracFresh,
  intro: `Work order: the ${PROFILE.name} in U${WO.u} of ${WO.rack} (Service Tag ${WO.tag}) is installed and cabled to the schedule but has never been powered on. Give its iDRAC9 its management address and check it. First ask the NOC to confirm that MGT01 port 13 is in the management VLAN for ${IDR.net}. Power the server on, plug a VGA monitor and a USB keyboard into the rear panel, and press F2 at the boot screen. In System Setup > iDRAC Settings > Network: NIC enabled and Dedicated, IPv4 enabled, DHCP disabled, static address ${IDR.ip}, gateway ${IDR.gw}, mask ${IDR.mask}, VLAN disabled; in User Configuration change the ${IDR.user} password to ${IDR.pw}. Finish, save, exit and reboot; check the address on the boot screen. Then from the laptop browser open https://${IDR.ip}, accept the self-signed certificate, log in as ${IDR.user} and check the address on the dashboard.`,
  get steps() { return IDRAC_LAB_STEPS(); }
});
Sim.registerScenario(MemPlan.lab({ id: 'ramdist', title: 'RAM Distributor: DDR4 population and capacity planning', setup: rdSetup }));
Sim.registerScenario(MemPlan.lab({ id: 'ramexam', title: 'RAM Distributor Exam: random work-order check', setup: rdSetup, exam: true }));


