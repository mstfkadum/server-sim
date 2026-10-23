/* ---- Scenarios for the HPE ProLiant DL380 Gen11. Cues point at the next thing to click (act, arg) or type (field). ---- */
const C = (act, arg, say) => ({ act, arg, say });
const F = (field, value, say) => ({ field, value, say });
// the steps that open the server: wrist strap, latch, panel, baffle (each stays done once it has happened)
const once = (t, k, now) => { if (now) t.flags[k] = true; return !!t.flags[k]; };
// extend the server from the rack, and push it back in once the panel is closed again. First identify it: three servers
// of the same model sit together and the work order names this one by its serial number
const backCue = t => { const j = outSlot(t); if (j < 0 || j === usSlot(t)) return null; const S = slotSt(t, j);
  return !S.rel.l ? C('rackRel', j + 'l', `The ${SRVN(j)} is not the one in the work order: press its left rail-release latch to push it back.`) : !S.rel.r ? C('rackRel', j + 'r', 'Now its right rail-release latch.') : C('rackIn', j, `Slide the ${SRVN(j)} back into the rack.`); };
const usLever = (t, k, msg) => backCue(t) || C('rackLever', usSlot(t) + k, msg(SRVN(usSlot(t))));
const rackOutSteps = () => [
  { view: 'rack', text: `Find server S/N ${LAB.serial}: pull out the serial number tab of all three servers, read it, push it back in`, hint: 'The black tab with the i, at the top of each server\'s left rack ear, slides straight out toward you: S/N and P/N with bar codes. The servers look alike: compare every character with the work order.', done: t => once(t, 'r0', !rk(t).idCheck || (allRead(t) && [0, 1, 2].every(n => !tabOut(t, n)))),
    cue: t => { const j = [0, 1, 2].find(n => tabOut(t, n)); if (j !== undefined) return C('rackTab', j, `S/N read. Push the pull tab of the ${SRVN(j)} back into its slot.`); const i = [0, 1, 2].find(n => !rk(t).read[n]); return C('rackTab', i, `Pull out the serial number tab of the ${SRVN(i)}: the black tab with the i, at the top of its left rack ear.`); } },
  { view: 'rack', text: `Pull down the left quick-release lever of server ${LAB.serial}`, hint: 'The server whose pull tab matches the work order. The lower part of its left rack ear: the drive box label.', done: t => once(t, 'r1', t.rack.lev.l || t.rack.pos === 'out'), cue: t => usLever(t, 'l', n => `Its pull tab matches the work order: the ${n}. Pull down its left quick-release lever by its top lip.`) },
  { view: 'rack', text: `Pull down the right quick-release lever of server ${LAB.serial}`, hint: 'The lower part of its right rack ear: the model badge.', done: t => once(t, 'r2', t.rack.lev.r || t.rack.pos === 'out'), cue: t => usLever(t, 'r', n => `Now the right quick-release lever of the ${n}.`) },
  { view: 'rack', text: `Slide server ${LAB.serial} out until the rails lock`, hint: 'Extending any other server counts as a mistake: it has to go back in.', done: t => once(t, 'r3', t.rack.pos === 'out'),
    cue: t => backCue(t) || (t.rack.lev.l && t.rack.lev.r ? C('rackOut', usSlot(t), 'Slide it out on its rails.') : usLever(t, t.rack.lev.l ? 'r' : 'l', () => 'Pull the lever down again: both must be down.')) }];
const rackInSteps = () => [
  { view: 'rack', text: 'Press the left rail-release latch', done: t => once(t, 'r4', t.flags.c3 && (t.rack.rel.l || t.rack.pos === 'in')), cue: t => C('rackRel', usSlot(t) + 'l', 'Press the left rail-release latch.') },
  { view: 'rack', text: 'Press the right rail-release latch', done: t => once(t, 'r5', t.flags.c3 && (t.rack.rel.r || t.rack.pos === 'in')), cue: t => C('rackRel', usSlot(t) + 'r', 'Press the right rail-release latch.') },
  { view: 'rack', text: 'Slide the server back in until the levers click', done: t => once(t, 'r6', t.flags.c3 && t.rack.pos === 'in'), cue: t => t.rack.rel.l && t.rack.rel.r ? C('rackIn', usSlot(t), 'Slide the server back into the rack.') : C('rackRel', usSlot(t) + (t.rack.rel.l ? 'r' : 'l'), 'Press the rail-release latch again: both must be pressed.') }];
const openSteps = () => [
  { view: 'chassis', text: 'Put on the ESD wrist strap', done: t => once(t, 'o1', t.esd), cue: () => C('esd', '', 'Put on the ESD wrist strap and clip it to bare chassis metal.') },
  { view: 'chassis', text: 'Lift the access panel latch by its rear end', hint: 'The whole latch tilts up on its front pivot and pushes the panel back about 1.25 cm.', done: t => once(t, 'o2', t.cover !== 'closed'), cue: () => C('latch', '', 'Lift the access panel latch by its rear end.') },
  { view: 'chassis', text: 'Lift the access panel off', done: t => once(t, 'o3', t.cover === 'off'), cue: () => C('panelOff', '', 'Lift the access panel straight up.') },
  { view: 'chassis', text: 'Lift out the air baffle', done: t => once(t, 'o4', !t.baffle), cue: () => C('baffle', '', 'Lift the air baffle out.') }];
// and close it again, once the work inside (hw) is done
const closeSteps = hw => [
  { view: 'chassis', text: 'Refit the air baffle', done: t => once(t, 'c1', hw(t) && t.baffle), cue: () => C('baffle', '', 'Set the air baffle back over the processors and the DIMMs.') },
  { view: 'chassis', text: 'Set the access panel on, latch open', hint: 'About 1.25 cm (0.5 in) past the rear.', done: t => once(t, 'c2', hw(t) && t.baffle && (t.cover === 'placed' || t.cover === 'closed')), cue: () => C('panelPlace', '', 'Set the access panel on the chassis with the latch open.') },
  { view: 'chassis', text: 'Press the latch down to close the panel', done: t => once(t, 'c3', hw(t) && t.baffle && t.cover === 'closed'), cue: () => C('latch', '', 'Press the latch down: it pulls the panel forward and closes it.') }];
// power and the first connection to iLO
const powerSteps = () => [
  { view: 'ilo', text: 'Connect PS1 to PDU A and PS2 to PDU B', hint: 'The power LED turns amber: standby.', done: t => t.ac.ps1 && t.ac.ps2, cue: t => !t.ac.ps1 ? C('cord', 'ps1', 'Plug the power cord into PS1 (PDU A).') : C('cord', 'ps2', 'Plug the power cord into PS2 (PDU B).') },
  { view: 'ilo', text: 'Power on and wait for the power LED to turn solid green', hint: 'It flashes green during the power-on sequence.', done: t => t.power === 'on' && t.posted,
    cue: t => t.power === 'standby' ? C('power', '', 'Press the Power On/Standby button.') : { say: 'Wait: the power LED flashes green while the server runs its power-on sequence.' } }];
// the laptop's browser: address, certificate warning, login; then a page of the iLO web interface
const adminPw = t => t.iloCfg.users[0] ? t.iloCfg.users[0].pw : LAB.pw;
// host: the address iLO is reached at (the Service Port by default); the browser trusts each address separately
const urlCue = (t, host = LAB.svcIp) => {
  const c = t.ilo, want = 'https://' + host;
  if (t.iloCfg.resetAt) return { say: 'Wait: iLO is resetting. It answers again in a few seconds.' };
  if (c.page === 'cert' && c.host === host) return C('iloCert', '', `Continue to ${host}: iLO uses a self-signed certificate.`);
  return String(c.form.iloUrl || '').trim().toLowerCase().replace(/\/+$/, '') !== want ? F('iloUrl', want, `Type ${want} in the address bar.`) : C('iloGo', '', 'Press Go (or Enter).');
};
const loginCue = (t, host = LAB.svcIp, pw = adminPw(t)) => {
  const c = t.ilo;
  if (c.page !== 'login' || c.host !== host) return urlCue(t, host);
  return (c.form.iloUser || '') !== LAB.user ? F('iloUser', LAB.user, 'Login name: Administrator.') : (c.form.iloPw || '') !== pw ? F('iloPw', pw, pw === LAB.pw ? 'Password: the one on the pull tab.' : pw === WO.pw ? `Password: the new one from the work order, ${WO.pw}.` : 'Password: the new one you set.') : C('iloLogin', '', 'Click Log In.');
};
const webCue = (t, host = LAB.svcIp) => { const c = t.ilo; if (t.iloCfg.resetAt) return { say: 'Wait: iLO is resetting. It answers again in a few seconds.' }; return c.auth && c.page === 'shell' && c.host === host ? null : c.page === 'login' && c.host === host ? loginCue(t, host) : urlCue(t, host); };
const navCue = (t, nav, sub, say, host = LAB.svcIp) => webCue(t, host) || (t.ilo.rc ? C('rcClose', '', 'Close the remote console window (the X at its top right).') : t.ilo.nav !== nav ? C('iloNav', nav, say) : sub && curSub(t.ilo) !== sub ? C('iloSub', sub, `Open the ${subLabel(nav, sub)} tab.`) : null);
const iloSteps = (what) => [
  { view: 'ilo', text: 'Connect the laptop to the iLO Service Port', hint: 'Through a USB-to-Ethernet adapter.', done: t => t.laptop || t.flags.iloLogin, cue: () => C('laptop', '', 'Plug the laptop\'s USB-to-Ethernet adapter into the front iLO Service Port.') },
  { view: 'front', text: 'Pull out the serial number / iLO pull tab and read its iLO side', done: t => t.flags.sawTab, cue: t => !t.pullTab ? C('pullTab', '', 'Pull out the pull tab at the left of the front panel.') : C('tabSide', '', 'Read the other side of the tab: the iLO account.') },
  { view: 'web', text: 'Open https://169.254.1.2 and continue past the certificate warning', done: t => ['login', 'shell'].includes(t.ilo.page) || t.flags.iloLogin, cue: urlCue },
  { view: 'web', text: 'Log in as Administrator with the pull-tab password', done: t => !!t.flags.iloLogin, cue: loginCue },
  ...what.map(([id, txt]) => ({ view: 'web', get text() { return typeof txt === 'function' ? txt(T) : txt; }, done: t => !!t.ilo.seen[id], cue: t => navCue(t, 'sys', id, 'Open System Information in the menu.') }))];

/* ---- the first iLO setup at the rack: rear iLO port to the management switch, monitor and keyboard at the rear, F9 at
   POST, the iLO 6 Configuration Utility (static address, new Administrator password), then the web interface from the
   laptop on the management network. The steps take any address in the management network and any new password; the
   cues follow the work order (WO). ---- */
// the values as they stand: pending in the open utility, or saved
function woEff(t) {
  const r = t.rb, c = t.iloCfg, fs = rbFs(r), net = fs ? r.form : c.net, e0 = fs && r.edit[0], a0 = c.users[0];
  return { net, pw: e0 && e0.act === 'Edit' && e0.pw ? e0.pw : a0 ? a0.pw : LAB.pw, fs };
}
const inMgmt = (t, ip) => { const a = ipNum(ip), m = ipNum(WO.mask), g = ipNum(WO.gw); return a !== null && ((a & m) >>> 0) === ((g & m) >>> 0) && ip !== WO.gw && ip !== t.pcIp && !ipErr({ ip, mask: WO.mask, gw: WO.gw }); };
const ipOk = (t, n) => n.dhcp === 'OFF' && inMgmt(t, String(n.ip).trim());
const netGood = (t, n) => ipOk(t, n) && String(n.mask).trim() === WO.mask && String(n.gw).trim() === WO.gw;
const woSaved = t => netGood(t, t.iloCfg.net) && t.iloCfg.users[0].pw !== LAB.pw;
// reach System Utilities on the local console, then follow fn; the dialogs first
const conCue = (t, fn, ctx = {}) => {
  const c = t.con, r = t.rb;
  if (!acOn(t)) return { say: 'Connect the power cords first (Power and iLO view).' };
  if (!isOn(t)) return C('power', '', 'Press the Power On/Standby button on the front.');
  if (c.mode === 'rbsu') {
    const d = r.dlg, e = woEff(t);
    if (d && d.kind === 'starting') return { say: 'Wait: the devices start before System Configuration opens.' };
    if (d && d.kind === 'q') return netGood(t, e.net) ? C('rbDlg', 'yes', 'Click Yes - Save Changes.') : C('rbDlg', 'cancel', 'Click Cancel: the network settings are not finished yet.');
    if (d && d.kind === 'reset') return C('rbDlg', 'ok', 'Click OK: iLO resets to use the new network settings.');
    if (d && d.kind === 'msg') return C('rbDlg', 'ok', 'Read the message, then click OK.');
    if (d && d.kind === 'pw') return d.key !== 'u0pw' ? C('rbDlg', 'cancel', 'Click Cancel.') : (d.pw1 || '') !== WO.pw ? F('rb:pw1', WO.pw, `Type the new password from the work order: ${WO.pw}.`) : (d.pw2 || '') !== WO.pw ? F('rb:pw2', WO.pw, 'Type it again to confirm.') : C('rbDlg', 'ok', 'Click OK.');
    if (d && (d.kind === 'exitBoot' || d.kind === 'reboot')) return ctx.resume && d.kind === 'exitBoot' ? C('rbDlg', 'ok', 'Click OK: the server leaves System Utilities and boots.') : C('rbDlg', 'cancel', 'Click Cancel: stay in System Utilities.');
    return fn(t);
  }
  if (c.mode === 'summary') return C('rcKey', 'F9', 'Press F9 now: the bottom of the POST screen offers F9 System Utilities.');
  if (c.mode === 'secure' || c.mode === 'post') return { say: 'Wait: the server runs its power-on self-test. Get ready to press F9.' };
  if (c.mode === 'f9') return { say: 'Wait: System Utilities are starting.' };
  if (c.mode === 'boot') return { say: 'Wait: the server is booting.' };
  return C('rcKey', 'CtrlAltDel', 'POST has passed: press Ctrl+Alt+Del to restart the server, then F9 when the screen offers it.');
};
// the next move toward a page of System Utilities: Esc up, or click down
const rbRoute = (t, target) => {
  const r = t.rb, want = rbChain(target), cur = r.path;
  const prefix = cur.length <= want.length && cur.every((p, i) => p === want[i]);
  if (prefix && cur.length === want.length) return null;
  if (prefix) { const nx = want[cur.length]; return C('rbGo', nx, `Click ${RBT[nx]}.`); }
  return C('rbBack', '', 'Press Esc (or click Exit at the bottom left) to go back one level.');
};
// the next action of the work order, wherever the student is in System Utilities
const woCue = t => conCue(t, t => {
  const r = t.rb, e = woEff(t);
  const fld = (page, k, v, say) => {
    const go = rbRoute(t, page); if (go) return go;
    const it = rbItems(t, page).find(x => x.k === k); if (!it) return null;
    if (it.type === 'sel') return r.open === k ? C('rbPick', `${k}=${v}`, say || `Choose ${v}.`) : C('rbOpen', k, say || `${it.l}: open the list and choose ${v}.`);
    if (it.type === 'pw') return C('rbPw', k, say || 'Click the Password field (Press ENTER to input password).');
    return F(`rb:${k}`, v, say || `${it.l}: type ${v}.`);
  };
  if (e.net.dhcp !== 'OFF') return fld('net', 'dhcp', 'OFF', 'DHCP Enable: open the list and choose OFF. No DHCP server answers on this network.');
  if (!ipOk(t, e.net)) return fld('net', 'ip', WO.ip, `IP Address: type ${WO.ip} (the work order).`);
  if (String(e.net.mask).trim() !== WO.mask) return fld('net', 'mask', WO.mask, `Subnet Mask: type ${WO.mask} (/24).`);
  if (String(e.net.gw).trim() !== WO.gw) return fld('net', 'gw', WO.gw, `Gateway IP Address: type ${WO.gw}.`);
  // the iLO 6 User Guide saves the network settings first (iLO then resets), and the user account after that
  if (!netGood(t, t.iloCfg.net)) return rbFs(r) && r.pend ? C('rcKey', 'F12', 'Press F12 (Save and Exit) to save the network settings: the utility asks you to confirm.') : null;
  if (e.pw === LAB.pw) { const ed = r.edit[0]; return !ed || ed.act !== 'Edit' ? fld('edit', 'u0act', 'Edit', 'Administrator, Action: open the list and choose Edit.') : fld('edit', 'u0pw', WO.pw); }
  if (rbFs(r) && r.pend) return C('rcKey', 'F12', 'Press F12 (Save and Exit) to save the new password: the utility asks you to confirm.');
  return null;
});
const once2 = (t, k, now) => { if (now) t.flags[k] = true; return !!t.flags[k]; };
// the cables at the rear of the rack, port by port from the cable schedule: data and iLO first, power last
const pos = (dev, n) => dev.startsWith('PDU') ? `outlet ${n} from the top` : `${n % 2 ? 'top' : 'bottom'} row, the ${Math.ceil(n / 2)}${['th', 'st', 'nd', 'rd'][Math.ceil(n / 2) % 10 > 3 || [11, 12, 13].includes(Math.ceil(n / 2)) ? 0 : Math.ceil(n / 2) % 10]} pair from the left`;
const cabCue = (t, k) => {
  const r = RUN[k];
  if (t.cab[k] && cabUn(t, k)) return C('cabFrom', k, `The ${r.from} cable is unplugged at the server: click its port to plug it back in.`);
  if (t.cab[k] && !cabOk(t, k)) return C('cabFrom', k, `That cable is in the wrong port. Click ${r.from} on the server to unplug it.`);
  if (t.cabSel && t.cabSel !== k) return C('cabFrom', t.cabSel, 'Put down the cable in your hand first: click its server port again.');
  if (t.cabSel !== k) return C('cabFrom', k, `Take the ${r.what.split(',')[0]}: click ${r.from} on the server's rear panel.`);
  return C('cabTo', want(k), `Click ${portTxt(want(k))} (${pos(r.dev, r.port)}).`);
};
const cabSteps = () => [
  ...RUNS.map((r, i) => ({ view: 'cable', text: `${r.from} to ${portTxt(want(r.k))}`, hint: [`${r.what}. The iLO port is the RJ-45 port left of the rear USB ports.`, `${r.what}. Port 1 of the OCP 15 NIC is the left SFP+ cage.`, `${r.what}: the second data port to the second switch.`, `${r.what}. Network cables first, power last.`, `${r.what}: the second supply to the second feed.`][i], done: t => cabOk(t, r.k), cue: t => cabCue(t, r.k) })),
  { view: 'cable', text: 'Fit the printed labels at both ends of every cable', hint: 'Rack and unit, server, port | far end | role.', done: t => allIn(t) && RUNS.every(r => t.cabLbl[r.k]), cue: () => C('cabLabel', '', 'Fit the printed labels at both ends of every cable.') },
  { view: 'cable', text: 'Dress the cables: up through the cable manager, strapped', hint: 'The power cords run apart, along the PDUs.', done: t => allIn(t) && t.cabDressed, cue: () => C('cabDress', '', 'Dress the cables: route them through the horizontal cable manager and strap them.') }];
const firstSetupSteps = () => [
  ...cabSteps(),
  { view: 'ilo', text: 'Plug a monitor into the rear VGA port', hint: 'iLO has no address yet, so the first setup is done at the server.', done: t => once2(t, 'k1', t.crash.vga), cue: () => C('crashVga', '', 'Plug the monitor cable into the VGA port: blue, 15 pins, at the rear.') },
  { view: 'ilo', text: 'Plug a USB keyboard and mouse into a rear USB port', done: t => once2(t, 'k2', t.crash.kbd), cue: () => C('crashKbd', '', 'Plug the USB keyboard and mouse into the USB 3.2 ports at the rear.') },
  { view: 'console', text: 'Press the Power On/Standby button and watch the monitor', hint: 'Secure Start, then the power-on self-test.', done: t => once2(t, 'k3', isOn(t) || t.posted), cue: () => C('power', '', 'Press the Power On/Standby button on the front.') },
  { view: 'console', text: 'At the bottom of the POST screen: iLO 6 IPv4 0.0.0.0, no address', hint: 'DHCP is on, and no DHCP server answers on the management network.', done: t => once2(t, 'k4', t.flags.sawPost), cue: t => conCue(t, () => null) },
  { view: 'console', text: 'Press F9 when the screen offers System Utilities', hint: 'The F9 to F12 prompt shows at the bottom of the screen, for a few seconds.', done: t => once2(t, 'k5', t.flags.f9), cue: t => conCue(t, () => null) },
  { view: 'console', text: 'Open System Configuration, then the iLO 6 Configuration Utility', done: t => once2(t, 'k6', t.rb.path.includes('ilocfg')), cue: t => conCue(t, t => rbRoute(t, 'ilocfg')) },
  { view: 'console', text: 'Open Network Options and set DHCP Enable to OFF', hint: 'Only then can you type the address.', done: t => once2(t, 'k7', woEff(t).net.dhcp === 'OFF'), cue: woCue },
  { view: 'console', text: `IP Address: ${WO.ip}`, hint: `Any free address in the management network (${WO.subnet}) works; the work order gives ${WO.ip}.`, done: t => once2(t, 'k8', ipOk(t, woEff(t).net)), cue: woCue },
  { view: 'console', text: `Subnet Mask ${WO.mask} (/24), Gateway IP Address ${WO.gw}`, done: t => once2(t, 'k9', netGood(t, woEff(t).net)), cue: woCue },
  { view: 'console', text: 'Save the network settings: F12 (Save and Exit), then Yes - Save Changes', hint: 'As in the iLO 6 User Guide: save the network settings first. iLO then resets to use them.', done: t => once2(t, 'k12', netGood(t, t.iloCfg.net)), cue: woCue },
  { view: 'console', text: 'iLO resets for the new address: click OK', hint: 'The server keeps running in System Utilities.', done: t => once2(t, 'k13', t.iloCfg.resets > 0 && ipOk(t, t.iloCfg.live)), cue: t => conCue(t, () => ({ say: 'Click OK in the message.' })) },
  { view: 'console', text: 'User Management, Edit/Remove User: Administrator, Action Edit', done: t => once2(t, 'k10', (t.rb.edit[0] && t.rb.edit[0].act === 'Edit') || woEff(t).pw !== LAB.pw), cue: woCue },
  { view: 'console', text: `Administrator password: ${WO.pw}, replacing the pull-tab one`, hint: 'Click Password (Press ENTER to input password), type it twice, OK.', done: t => once2(t, 'k11', woEff(t).pw !== LAB.pw), cue: woCue },
  { view: 'console', text: 'Save the password: F12 (Save and Exit), then Yes - Save Changes', hint: 'Only the account changed this time, so iLO does not reset.', done: t => once2(t, 'k15', woSaved(t)), cue: woCue },
  { view: 'console', text: 'Esc back to System Utilities, then Exit and resume system boot', hint: 'Confirm with OK. The NS204i-u boot device is still empty: the screen says no bootable device. The operating system comes next, from your laptop through iLO.', done: t => once2(t, 'k14', t.flags.resumed), cue: t => conCue(t, t => rbRoute(t, 'home') || C('rbGo', 'exitBoot', 'Click Exit and resume system boot.'), { resume: true }) }];
// the web interface from the laptop on the management network, at the address iLO has now, with the password it has now
const mgmtWebSteps = what => [
  { view: 'web', get text() { return `On the laptop, open https://${liveIp(T) === '0.0.0.0' ? WO.ip : liveIp(T)} and continue past the certificate warning`; }, hint: 'iLO uses a self-signed certificate: the browser warns for every new address.', done: t => (['login', 'shell'].includes(t.ilo.page) && t.ilo.host === liveIp(t)) || t.flags.iloLogin, cue: t => urlCue(t, liveIp(t)) },
  { view: 'web', get text() { return `Log in as Administrator with ${adminPw(T) === WO.pw ? `the new password, ${WO.pw}` : adminPw(T) === LAB.pw ? 'the pull-tab password' : 'the new password you set'}`; }, done: t => !!t.flags.iloLogin, cue: t => loginCue(t, liveIp(t)) },
  { view: 'web', get text() { return `Overview: check the server information, then click the IP Address link (${liveIp(T)}, DHCP off)`; }, hint: 'The Overview shows the product, serial number and iLO address; the IP Address link opens iLO Dedicated Network Port.', done: t => !!(t.ilo.seen.overview && t.ilo.seen.dnp), cue: t => navCue(t, 'dnp', 'summary', 'Click the IP Address link on the Overview (or iLO Dedicated Network Port in the menu).', liveIp(t)) },
  ...what.map(([id, txt]) => ({ view: 'web', get text() { return typeof txt === 'function' ? txt(T) : txt; }, done: t => !!t.ilo.seen[id], cue: t => navCue(t, 'sys', id, 'Open System Information in the menu.', liveIp(t)) }))];

// the front drives: as many as the student wants, at least DMIN; the cue fills the lowest-numbered bays
const driveSteps = () => [{ view: 'front', get text() { return `Fit at least ${DMIN} SSDs in the front bays (${driveCount(T)} fitted)`; },
  hint: `Minimum ${DMIN}: the operating system is on the NS204i-u boot device, so the front drives hold data, and ${DMIN} drives allow any RAID level the MR416i-o offers, RAID 6 and RAID 10 included. For each drive: blank out, SSD in with its latch halfway open, then push the latch closed until it clicks.`,
  done: t => driveCount(t) >= DMIN && !t.hand && t.bays.every(b => b.st === 'drive' || b.st === 'blank'),
  cue: t => {
    const box = i => t.sel.box !== boxOf(i) ? C('box', boxOf(i), `Show drive box ${boxOf(i) + 1}.`) : null;
    const open = t.bays.findIndex(b => b.st === 'open'), emp = t.bays.findIndex(b => b.st === 'empty'), bl = t.bays.findIndex(b => b.st === 'blank');
    if (open >= 0) return box(open) || C('bay', open, t.bays[open].ins ? `Push the latch of ${bayName(open)} closed until it clicks.` : `Pull the drive out of ${bayName(open)} by its latch.`);
    if (t.hand && t.hand.kind === 'ssd') return emp >= 0 ? box(emp) || C('bay', emp, `Slide the SSD into ${bayName(emp)}, latch open.`) : C('ssdBack', '', 'No bay is open for it: put the SSD back in its box.');
    if (emp >= 0) return C('ssdPick', '', driveCount(t) >= DMIN ? `${bayName(emp)} is empty: fit an SSD in it (or push its blank back in).` : 'Pick up an SSD from its box.');
    return bl >= 0 ? box(bl) || C('bay', bl, `Remove the blank from ${bayName(bl)}.`) : null;
  } }];
// the memory: any layout HPE supports, at least one DIMM per processor (slot 10). The cue takes the smallest supported
// layout that holds what is already fitted, and processor 2 copies processor 1
const memCue = (t, p, goal, kind) => {
  if (!t.flags.memUnpacked) return C('memUnpack', '', 'Take the DIMMs out of their packaging.');
  const s = procSlots(t, p), P = `processor ${p[1]}`; kind = kind || procKind(t, p);
  goal = goal || layoutOf(OKN.find(k => k >= Math.max(1, s.length)));
  const extra = s.find(k => !goal.includes(k) || dimmKind(t.dimms[`${p}-${k}`]) !== kind);
  if (extra) return C('slot', `${p}-${extra}`, `Take the DIMM out of ${P}, slot ${extra}: ${dimmKind(t.dimms[`${p}-${extra}`]) !== kind ? 'it is the other DIMM type' : 'it is not in HPE\'s layout'}. Click it: the latches open and it lifts out.`);
  const add = FILL.find(k => goal.includes(k) && !t.dimms[`${p}-${k}`]);
  if (!add) return null;
  if (t.memPick !== kind) return C('memPick', kind, `Fit ${DIMMK[kind].tiny}s, the type already in the server: choose it in the DIMM kit (right).`);
  return !t.memOpen[`${p}-${add}`] ? C('slot', `${p}-${add}`, `Open the latches of ${P}, slot ${add}.`) : C('slot', `${p}-${add}`, `Press the DIMM into ${P}, slot ${add}: notch over the key, press down evenly.`);
};
const dimmSteps = () => [
  { view: 'mem', text: 'Processor 1: DIMMs of one type, in an HPE layout, at least 1 (slot 10)', hint: 'One type from the kit: 16 GB, 32 GB or 64 GB RDIMMs. Never the 64 GB (x4) with the others (x8). Supported per processor: 1, 2, 4, 6, 8, 12 or 16 DIMMs, each count in its own slots (table, right). The minimum is 1 per processor, in slot 10.',
    done: t => procSlots(t, 'P1').length > 0 && !procErr(t, 'P1') && procUniform(t, 'P1'), cue: t => memCue(t, 'P1') },
  { view: 'mem', text: 'Processor 2: the same layout and DIMM type as processor 1', hint: 'HPE splits the DIMMs evenly over the processors: the same number, in the same slots, the same type. So the minimum for the server is 2 DIMMs, one per processor in slot 10.',
    done: t => cpuCount(t) >= 2 && memOK(t),
    cue: t => { const a = procSlots(t, 'P1'), b = procSlots(t, 'P2'), k = procKind(t, 'P1'); return !procErr(t, 'P2') && procUniform(t, 'P2') && procKind(t, 'P2') === k && b.length > a.length ? memCue(t, 'P1', b, k) : memCue(t, 'P2', a, k); } }];
const rr = t => repOf(t);
// processor 2 in the new build: the same hands-on flow as a replacement (views-cpurep.js), for a new processor and a new
// heatsink: blank and socket cover off, film off the pre-applied thermal pad, triangle to triangle, the processor clicked
// into the carrier, the module lowered, the wires clipped, the screws tightened in a cross order
const cpuSteps = () => [
  { view: 'cpu', text: 'Lift the processor blank off socket 2 and keep it', done: t => once(t, 'i1', t.sock2 !== 'blank'), cue: () => C('repSock', '', 'Lift the processor blank off socket 2.') },
  { view: 'cpu', text: 'Remove the socket 2 cover by its tabs, straight up', hint: 'Keep it. Do not touch the socket pins.', done: t => once(t, 'i2', t.sock2 === 'empty' || t.sock2 === 'phm'), cue: () => C('repSock', '', 'Remove the socket cover by its tabs.') },
  { view: 'cpu', text: 'Peel the protective film off the new heatsink\'s thermal pad', hint: 'The pad is pre-applied on a new heatsink: no cleaning and no grease.', done: t => !rr(t).film, cue: () => C('repFilm', '', 'Peel the film off the thermal pad by its tab.') },
  { view: 'cpu', text: 'Take the new processor out of its kit tray by its edges', done: t => rr(t).nw !== 'tray', cue: () => C('repNew', '', 'Take the new processor out of its tray.') },
  { view: 'cpu', text: 'Turn the processor: its triangle to the triangle on the carrier', hint: 'The gold triangle at the processor\'s corner goes to the pin 1 triangle on the carrier.', done: t => once(t, 'i5', (rr(t).nw === 'mat' && rr(t).rot === 0) || rr(t).nw === 'in'),
    cue: () => C('repRot', '', 'Turn the processor around: its triangle must be at the top left, where the carrier\'s triangle is.') },
  { view: 'cpu', text: 'Push the processor into the carrier until it clicks', hint: 'The release lever stays closed.', done: t => rr(t).nw === 'in', cue: t => rr(t).lever === 'open' ? C('repLever', '', 'Push the release lever back down: closed.') : C('repSeat', '', 'Lower the processor onto the thermal pad and push until it clicks.') },
  { view: 'cpu', text: 'Lower the module onto socket 2', hint: 'Straight down onto the guide posts, by the edges of the base plate.', done: t => rr(t).nw === 'in' && rr(t).at === 'socket', cue: () => C('repLower', '', 'Lower the module onto socket 2.') },
  { view: 'cpu', text: 'Clip the four anti-tilt wires (locked)', done: t => rr(t).nw === 'in' && rr(t).at === 'socket' && rr(t).w.every(Boolean),
    cue: t => { const k = rr(t).w.findIndex(x => !x); return C('repWire', k, `Clip the anti-tilt wire beside screw ${k + 1} down.`); } },
  { view: 'cpu', text: 'Tighten the four heatsink screws in a cross order (T-30 Torx)', hint: '0.9 N·m (8 in-lb), as on the heatsink label.', done: t => repDone(t),
    cue: t => rr(t).tool !== 't30' ? C('repTool', 't30', 'Take the T-30 Torx screwdriver from the tool tray.') : C('repNut', crossNext(t, true), `Tighten screw ${crossNext(t, true) + 1}${t.nuts2.filter(Boolean).length % 2 ? ': diagonally opposite the last one' : ''}.`) }];

Sim.registerScenario({
  id: 'install', title: 'New build: processor 2, memory and drives, then the first iLO setup', start: 'rack',
  intro: `A new ProLiant DL380 Gen11, racked on its rails, no power cords yet: processor 1 is fitted, socket 2 has its blank, there is no memory, and all 24 front bays have blanks (the operating system will be on the NS204i-u boot device, two M.2 SSDs at the rear). It sits with two more DL380 Gen11 servers that look just like it from the front, in a different order each time: the work order names yours by its serial number, ${LAB.serial}. Pull out each server\'s serial number tab (the black tab with the i on its left rack ear) and read its S/N, then extend only the one that matches; extending the wrong server counts as a mistake and it has to go back in. Then install processor 2, the same way as a replacement but new: the blank and the socket cover off socket 2 (kept), the film off the new heatsink\'s pre-applied thermal pad (no cleaning, no grease), triangle to triangle, the processor clicked into the carrier, the module lowered, the wires clipped and the T-30 screws tightened in a cross order. For the memory, the DIMM box holds three HPE DIMM types for this server: 16 GB, 32 GB and 64 GB RDIMMs. Choose one, at any point, and fit as many as you like in a layout HPE supports, with that one type only: the 64 GB is x4 and the others x8, and HPE does not mix x4 with x8. Minimum: 2 DIMMs, one per processor in slot 10, because each processor needs its own memory and HPE splits it evenly. Close the server and push it back in. Fit as many SSDs as you like in the front bays. Minimum: 4, enough for a RAID 6 or RAID 10 data volume. Cable the server at the rear of the rack, every cable to the exact port in the cable schedule: iLO to MGT01 port 14, OCP 15 ports 1 and 2 to SW01 and SW02 port 24, PS1 and PS2 to PDU A and PDU B outlet 6; label and dress them. Then the first iLO setup at the rack: iLO has no address yet, so plug a monitor and a keyboard into the rear, power on, press F9 and set iLO to ${WO.ip} /24, gateway ${WO.gw}, with the Administrator password ${WO.pw} instead of the pull-tab one. Then log in to the iLO web interface from your laptop on the management network and check the address and what you installed. Finally install Rocky Linux 9.5 on the NS204i-u boot device through iLO: mount the DVD image from your laptop with the HTML5 remote console's Virtual Drives (this server has an iLO Advanced licence), boot it once from the virtual CD (F11 at POST), install, check the build from the installed system, and record the handover.`,
  setup() {
    const t = fresh();
    t.sock2 = 'blank'; t.nuts2 = [0, 0, 0, 0]; t.wires2 = 'unlocked'; t.rep = newRep('install'); t.rep.rot = Math.random() < 0.5 ? 180 : 0;
    t.bays.forEach(b => { b.st = 'blank'; });                  // no front drives yet: a blank in every bay
    t.ssdKit = PROFILE.bays; t.vol.members = []; t.flags.driveMin = true;
    t.flags.hasOS = false; t.iloLic = 'iLO Advanced';            // the NS204i-u boot device is empty: Rocky Linux is installed at the end, through iLO
    OSI.init(t, 'rocky', false);
    t.mgmtLink = false; t.net = 'mgmt'; t.pcIp = WO.pcIp;         // the laptop is on the management network
    t.cab = { ilo: null, ocp1: null, ocp2: null, ps1: null, ps2: null };   // nothing cabled at the rear yet
    // three DL380 Gen11 servers together, in a different order each run: find this one by its serial number first
    const orders = [['live', 'us', 'twin'], ['us', 'twin', 'live'], ['twin', 'live', 'us'], ['twin', 'us', 'live'], ['live', 'twin', 'us'], ['us', 'live', 'twin']];
    t.rack.order = orders[Math.floor(Math.random() * orders.length)].slice(); t.rack.idCheck = true;
    return t;
  },
  steps: [
    ...rackOutSteps(), ...openSteps(), ...cpuSteps(), ...dimmSteps(),
    ...closeSteps(t => repDone(t) && memOK(t) && cpuCount(t) >= 2), ...rackInSteps(), ...driveSteps(), ...firstSetupSteps(),
    ...mgmtWebSteps([['proc', 'Check System Information: both processors'],
      ['mem', t => { const n = dimmCount(t); return `Check System Information, Memory: ${memGB(t)} GB, ${n} DIMMs (what you fitted)`; }],
      ['stor', t => { const n = driveCount(t); return `Check System Information, Storage: your ${n} SSDs in the front bays, in no volume yet`; }]]),
    ...OSI.steps('rocky', HPE_OS)
  ]
});
/* ---- maintenance: replace processor 2, reusing its heatsink (the trainer's procedure, the Processors view) ---- */
const repSteps = () => [
  { view: 'cpu', text: 'Push the four anti-tilt wires up to vertical (unlocked)', hint: 'The wire beside each heatsink screw stands up. No click here.', done: t => once(t, 'p1', rr(t).w.every(x => !x) || rr(t).at === 'mat'),
    cue: t => { const k = rr(t).w.findIndex(Boolean); return C('repWire', k, `Push the anti-tilt wire beside screw ${k + 1} up to vertical.`); } },
  { view: 'cpu', text: 'Loosen the four heatsink screws in a cross order (T-30 Torx)', hint: 'One screw, then the one diagonally opposite it, then the other pair.', done: t => once(t, 'p2', t.nuts2.every(n => !n) || rr(t).at === 'mat'),
    cue: t => rr(t).tool !== 't30' ? C('repTool', 't30', 'Take the T-30 Torx screwdriver from the tool tray.') : C('repNut', crossNext(t, false), `Loosen screw ${crossNext(t, false) + 1}${t.nuts2.filter(n => !n).length % 2 ? ': diagonally opposite the last one' : ''}.`) },
  { view: 'cpu', text: 'Lift the module straight up, the processor still attached', hint: 'By the edges of its base plate. Then it lies base up on the mat.', done: t => once(t, 'p3', rr(t).at === 'mat'), cue: () => C('repLift', '', 'Lift the processor heatsink module straight up.') },
  { view: 'cpu', text: 'Pull the release lever on the heatsink: the processor rises', hint: 'The metal lever along the carrier edge, by the heat pipes.', done: t => once(t, 'p4', rr(t).old !== 'in'), cue: () => C('repLever', '', 'Pull the release lever up.') },
  { view: 'cpu', text: 'Press the small clips and free the old processor', done: t => once(t, 'p5', rr(t).old === 'out' || rr(t).old === 'away'), cue: () => C('repClips', '', 'Press the small clips at the sides and lift the processor out by its edges.') },
  { view: 'cpu', text: 'Put the old processor away in the antistatic return box', done: t => rr(t).old === 'away', cue: () => C('repAway', '', 'Put the old processor in the antistatic return box.') },
  { view: 'cpu', text: 'Clean the old thermal grease off the heatsink base until it shines', hint: 'The HPE-recommended cleaning kit: alcohol wipes, then the lint-free cloth.', done: t => rr(t).paste === 0,
    cue: t => rr(t).tool !== 'clean' ? C('repTool', 'clean', 'Take the cleaning kit from the tool tray.') : C('repWipe', '', 'Wipe the heatsink base.') },
  { view: 'cpu', text: 'Take the new processor out of its kit tray by its edges', done: t => rr(t).nw !== 'tray', cue: () => C('repNew', '', 'Take the new processor out of its tray.') },
  { view: 'cpu', text: 'Apply the thermal grease on the new processor\'s lid, HPE\'s pattern', hint: 'The whole syringe, in three strokes across the lid.', done: t => rr(t).grease >= 3 || rr(t).nw === 'in',
    cue: t => rr(t).tool !== 'grease' ? C('repTool', 'grease', 'Take the thermal grease syringe from the tool tray.') : C('repGrease', '', `Apply grease stroke ${rr(t).grease + 1} of 3 across the lid.`) },
  { view: 'cpu', text: 'Turn the processor: its triangle to the triangle on the heatsink', hint: 'The gold triangle at the processor\'s corner goes to the pin 1 triangle on the carrier.', done: t => once(t, 'p10', (rr(t).grease >= 3 && rr(t).rot === 0) || rr(t).nw === 'in'),
    cue: () => C('repRot', '', 'Turn the processor around: its triangle must be at the top left, where the carrier\'s triangle is.') },
  { view: 'cpu', text: 'Return the release lever to its closed position', done: t => once(t, 'p11', (t.flags.p10 && rr(t).lever === 'closed') || rr(t).nw === 'in'), cue: () => C('repLever', '', 'Push the release lever back down: closed.') },
  { view: 'cpu', text: 'Push the processor into the heatsink until it clicks', done: t => rr(t).nw === 'in', cue: () => C('repSeat', '', 'Lower the processor into the carrier, grease side down, and push until it clicks.') },
  { view: 'cpu', text: 'Lower the module into socket 2', hint: 'Straight down onto the guide posts, by the edges of the base plate.', done: t => rr(t).nw === 'in' && rr(t).at === 'socket', cue: () => C('repLower', '', 'Lower the module into socket 2.') },
  { view: 'cpu', text: 'Clip the four anti-tilt wires (locked)', done: t => rr(t).nw === 'in' && rr(t).at === 'socket' && rr(t).w.every(Boolean),
    cue: t => { const k = rr(t).w.findIndex(x => !x); return C('repWire', k, `Clip the anti-tilt wire beside screw ${k + 1} down.`); } },
  { view: 'cpu', text: 'Tighten the four heatsink screws in a cross order (T-30 Torx)', hint: '0.9 N·m (8 in-lb), as on the heatsink label.', done: t => repDone(t),
    cue: t => rr(t).tool !== 't30' ? C('repTool', 't30', 'Take the T-30 Torx screwdriver from the tool tray.') : C('repNut', crossNext(t, true), `Tighten screw ${crossNext(t, true) + 1}${t.nuts2.filter(Boolean).length % 2 ? ': diagonally opposite the last one' : ''}.`) }];
// the server ends of its cables, for maintenance: unplug them at the server (the far ends stay in their ports, labelled),
// and plug them back in after the work
const unCue = (t, ks) => { const k = ks.find(x => plugged(t, x)); return k ? C('cabFrom', k, `Unplug the ${RUN[k].from} cable: click its port on the server.`) : null; };
const replugCue = (t, ks) => {
  const k = ks.find(x => !cabOk(t, x)); if (!k) return null;
  if (t.cabSel && t.cabSel !== k) return C('cabFrom', t.cabSel, 'Put down the cable in your hand first: click its server port again.');
  return cabUn(t, k) ? C('cabFrom', k, `Plug the ${RUN[k].from} cable back in: click its port on the server.`) : cabCue(t, k);
};
Sim.registerScenario({
  id: 'cpurep', title: 'Maintenance: replace processor 2, reusing its heatsink', start: 'rack',
  intro: `The ProLiant DL380 Gen11 S/N ${LAB.serial} is running in the rack, and iLO's Integrated Management Log reports an uncorrectable error on processor 2: the health LED is amber. HPE sent a replacement, processor kit ${CATALOG.cpu.pid} (${CATALOG.cpu.name}, the same part as processor 1) with a syringe of thermal grease; the heatsink is reused. First find the server by its serial number: three servers of the same model sit together, so read the pull tab of each. Shut it down, then at the rear unplug its two power cords, its two data cables (OCP 15 ports 1 and 2) and its iLO cable at the server: their switch and PDU ends stay in place, labelled. Extend it on its rails, put on the wrist strap, take off the access panel and the air baffle. Then, with the T-30 Torx screwdriver and the HPE-recommended cleaning kit: wires up to vertical, screws loosened in a cross order, the module lifted with the processor attached, the release lever pulled and the clips pressed to free the old processor, the old processor put away, the base cleaned until shiny, grease on the new processor, triangle to triangle, the lever closed, the processor pushed in until it clicks, the module lowered, the wires clipped and the screws tightened in a cross order. Then everything back in reverse: air baffle, access panel, server back into the rack, iLO and data cables, power cords last. Power on and check in iLO (https://${WO.ip}, Administrator, ${WO.pw}) that both processors are OK.`,
  setup() {
    const t = buildFull();
    t.rep = newRep(); t.rep.rot = Math.random() < 0.5 ? 180 : 0; t.wires2 = 'locked';
    const orders = [['live', 'us', 'twin'], ['us', 'twin', 'live'], ['twin', 'live', 'us'], ['twin', 'us', 'live'], ['live', 'twin', 'us'], ['us', 'live', 'twin']];
    t.rack.order = orders[Math.floor(Math.random() * orders.length)].slice(); t.rack.idCheck = true;
    t.cabLbl = { ilo: true, ocp1: true, ocp2: true, ps1: true, ps2: true }; t.cabDressed = true; t.cabOff = {};
    // iLO as the new build left it: on the management network at the work order's address and password, the laptop there too
    t.iloCfg.net = { ...NET0, dhcp: 'OFF', ip: WO.ip, mask: WO.mask, gw: WO.gw }; t.iloCfg.live = { ...t.iloCfg.net }; t.iloCfg.users[0].pw = WO.pw;
    t.net = 'mgmt'; t.mgmtLink = true; t.iloLic = 'iLO Advanced';
    return t;
  },
  steps: [
    rackOutSteps()[0],
    { view: 'ilo', get text() { return `Shut server ${LAB.serial} down: press its power button once`; }, hint: 'A graceful shutdown: the power LED turns amber (standby).', done: t => once(t, 'q1', t.power !== 'on' && t.power !== 'post'), cue: () => C('power', '', 'Press and release the Power On/Standby button.') },
    { view: 'cable', text: 'Unplug both power cords at the server (PS1 and PS2)', hint: 'In standby, power is still present inside the server. Unplug at the server: the PDU ends stay in their outlets.', done: t => once(t, 'q2', t.flags.q1 && !acOn(t)), cue: t => unCue(t, ['ps1', 'ps2']) },
    { view: 'cable', text: 'Unplug the two data cables at the server: OCP 15 port 1 and port 2', hint: 'Pull the DAC tab and draw the connector straight out. The switch ends stay in SW01 and SW02 port 24, with their labels.', done: t => once(t, 'q2b', t.flags.q2 && !plugged(t, 'ocp1') && !plugged(t, 'ocp2')), cue: t => unCue(t, ['ocp1', 'ocp2']) },
    { view: 'cable', text: 'Unplug the iLO management cable at the server', hint: 'Press the RJ-45 clip. iLO is off the management network until the cable is back in.', done: t => once(t, 'q2c', t.flags.q2b && !plugged(t, 'ilo')), cue: t => unCue(t, ['ilo']) },
    ...rackOutSteps().slice(1), ...openSteps(), ...repSteps(), ...closeSteps(repDone), ...rackInSteps(),
    { view: 'cable', text: 'Plug the iLO cable back into the iLO Management Port', done: t => once(t, 'q3a', t.flags.r6 && cabOk(t, 'ilo')), cue: t => replugCue(t, ['ilo']) },
    { view: 'cable', text: 'Plug the data cables back in: OCP 15 port 1 and port 2', hint: 'Each one into its own port: the labels say which.', done: t => once(t, 'q3b', t.flags.q3a && cabOk(t, 'ocp1') && cabOk(t, 'ocp2')), cue: t => replugCue(t, ['ocp1', 'ocp2']) },
    { view: 'cable', text: 'Plug the power cords back in at the server: PS1 and PS2', hint: 'Data before power: the server comes up with its links ready. The power LED turns amber: standby.', done: t => once(t, 'q3', t.flags.q3b && cabOk(t, 'ps1') && cabOk(t, 'ps2')), cue: t => replugCue(t, ['ps1', 'ps2']) },
    { view: 'ilo', text: 'Power on and wait for the health LED to turn green', hint: 'The power-on sequence runs with the new processor.', done: t => once(t, 'q4', t.flags.q3 && t.power === 'on' && t.posted),
      cue: t => t.power === 'standby' ? C('power', '', 'Press the Power On/Standby button.') : { say: 'Wait: the power LED flashes green while the server runs its power-on sequence.' } },
    { view: 'web', get text() { return `On the laptop, open https://${WO.ip} and log in as Administrator`; }, hint: `iLO is back on the management network. The password is the work order's, ${WO.pw}.`, done: t => once(t, 'q5', t.flags.q4 && t.ilo.auth && t.ilo.page === 'shell'), cue: t => webCue(t, liveIp(t)) || { say: 'Logged in.' } },
    { view: 'web', text: 'System Information, Processors: both processors OK', hint: 'The error on processor 2 is cleared by the new processor: the health LED is green again.', done: t => once(t, 'q6', t.flags.q5 && !!t.ilo.seen.procOk), cue: t => navCue(t, 'sys', 'proc', 'Open System Information in the menu.', liveIp(t)) || { say: 'Both processors report OK.' } }]
});
// the RAM Distributor labs (views-rdist.js, engine/memplan.js): a random work order from HPE_RULES.tasks, planned on the board
const RD_FIT = 'Choose a DIMM size, then click the slots in HPE\'s order: 10, 3, then 7, 14, then 5, 16, then 1, 12, then the black slots; only 1, 2, 4, 6, 8, 12 or 16 per processor. Distribute shows the best layout.';
Sim.registerScenario(MemPlan.lab({ id: 'ramdist', title: 'RAM Distributor: plan the memory for a capacity (practice)', hint: RD_FIT, setup: rdSetup,
  practiceIntro: 'Plan the memory for the work order on the RAM Distributor board: the three HPE DIMMs (16 GB 1Rx8, 32 GB 2Rx8, 64 GB 2Rx4) go in the 16 slots of each processor. Place them by hand, or press Distribute for the best layout, then Verify Distribution. Best means the least capacity that meets the order, then the fastest layout (memory bandwidth within 5 %), then the fewest DIMMs. Restart for a new work order; the exam is the next lab.' }));
Sim.registerScenario(MemPlan.lab({ id: 'ramexam', title: 'RAM Distributor: exam (random work order, graded)', exam: true, setup: rdSetup,
  examIntro: 'Exam, graded: guidance, Distribute and the marks on the board are off until you verify. Place the three HPE DIMM sizes (16 GB 1Rx8, 32 GB 2Rx8, 64 GB 2Rx4) on the board for the work order, then Verify Distribution to submit. An unsupported layout, or less capacity than ordered, fails. A supported layout passes, with points off: 20 if a faster layout was possible at the capacity needed, 10 for more capacity than needed, 10 for more DIMMs than needed. Pass mark 70. Restart for a new work order.' }));
/* ---- operating system installs over iLO virtual media (views-os.js, engine/os-*.js): a reinstall of the server
   built in Lab 1, one lab per operating system ---- */
const OS_LOGIN = { view: 'web', get text() { return `On the laptop, open https://${WO.ip}, continue past the certificate warning and log in as Administrator`; }, hint: `iLO is on the management network at ${WO.ip}; the Administrator password is the work order's, ${WO.pw}.`, done: t => !!t.flags.iloLogin, cue: t => webCue(t, liveIp(t)) || { say: 'Logged in.' } };
[['ubuntu', 'Ubuntu Server 24.04 LTS'], ['rocky', 'Rocky Linux 9.5'], ['esxi', 'VMware ESXi 8.0 U3, HPE custom image']].forEach(([os, name]) => Sim.registerScenario({
  id: 'os-' + os, title: `OS install over iLO virtual media: ${name}`, start: 'web', setup: osLabSetup(os),
  get intro() { const w = OSNET, m = OSI.meta(os); return `The ProLiant DL380 Gen11 S/N ${LAB.serial} is built, racked and cabled, and runs Rocky Linux 9.5 from its NS204i-u boot device, beside a ${'RAID 6'} data volume on the 24 front SSDs. A new project needs it reinstalled with ${m.name}. Work from your laptop on the management network, through iLO at ${WO.ip} (this server has an iLO Advanced licence, which virtual media needs): open the HTML5 remote console, mount ${OSI.want(T)} from the laptop's Downloads folder with Virtual Drives (several images there look alike), restart the server and boot it once from the virtual CD (F11 at POST, One-Time Boot Menu). Install on the NS204i-u boot device, not on the data volume; host name ${w.host}, ${w.ip}/${w.prefix} with gateway ${w.gw} and DNS ${w.dns} on OCP 15 port 1 (cabled to SW01 port 24); ${m.flavor === 'esxi' ? `root password ${OSI.acc.pw}` : `the account ${OSI.acc.user} with the password ${OSI.acc.pw}`}. No DHCP server answers on the data network. Eject the image when the installer is done. Then log in at the console and check the build from the OS: the memory, processors, disks and network it reports must match what is in the server. Read the new boot entry in iLO, and record the handover.`; },
  steps: [OS_LOGIN, ...OSI.steps(os, HPE_OS)]
}));
Sim.expose({ PROFILE, LAB, fresh, buildFull });
