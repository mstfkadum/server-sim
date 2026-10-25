// OS install labs: the mistakes the installers are built to catch (wrong image, wrong disk, a port without a link, the
// management network on the wrong adapter, the handover values), the recovery the cues offer after each, and the
// shell's answers against the twin. The full runs of every OS lab are in cue-run.js and real-click.js.
// Usage: node tests/os-install.js [dist/index.html]
const { chromium } = require('playwright'), path = require('path');
const FILE = 'file://' + path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist', 'index.html'));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  await p.addInitScript(() => { try { localStorage.setItem('sbt.tour', 'seen'); } catch (e) { } });   // the first-visit tour stays closed (tests/tour.js covers it)
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
  await p.goto(FILE); await p.waitForTimeout(400);
  // one cued action (a field typed, a click), or 'wait'
  await p.evaluate(() => {
    window.__cue = () => {
      const st = Sim.scenarios[Sim.scenario].steps, t = twin(), i = st.findIndex(s => !s.done(t)); if (i < 0) return 'done';
      const s = st[i]; if (Sim.view !== s.view) { Sim.do('go', s.view); return 'go'; }
      const c = s.cue && s.cue(t); if (!c) return 'wait';
      if (c.field) { const el = document.querySelector(`#stage [data-field="${c.field}"]`); if (!el) return 'wait'; el.value = c.value; el.dispatchEvent(new Event('input', { bubbles: true })); Sim.do('go', Sim.view); return 'field'; }
      if (!c.act) return 'wait'; Sim.do(c.act, c.arg === undefined ? '' : String(c.arg)); return 'act';
    };
  });
  // follow the cues until fn(twin) is true (fn is a string, evaluated in the page)
  const until = async (fn, max = 1500) => { for (let k = 0; k < max; k++) { const r = await p.evaluate(f => { const t = twin(); if (new Function('t', 'return ' + f)(t)) return 'yes'; return window.__cue(); }, fn); if (r === 'yes') return true; if (r === 'done') return false; if (r === 'wait') await p.waitForTimeout(200); } return false; };
  const lab = async (m, sc) => { await p.evaluate(([m, sc]) => { if (Sim.model !== m) loadModel(m, sc); else loadScenario(sc); }, [m, sc]); };
  const T = f => p.evaluate(new Function('return (' + f + ')(twin())'));
  const H = 'hpe-dl380-gen11-sff', C = 'cisco-c240-m4-lff';

  // 1. the wrong image: a mistake when it is mounted; the cue takes it out and mounts the right one
  await lab(H, 'os-ubuntu');
  ok(await until('!!(t.os.dlg)'), 'HPE Ubuntu: the file dialog opens from Virtual Drives');
  let e0 = await T('t => t.errors');
  await p.evaluate(() => { Sim.do('osPick', 'ubuntu-24.04.1-desktop-amd64.iso'); Sim.do('osDlg', 'ok'); });
  let r = await T('t => ({ e: t.errors, m: t.os.media, msg: t.log[t.log.length - 1].msg })');
  ok(r.e === e0 + 1 && r.m.includes('desktop') && /live desktop/.test(r.msg), `wrong image (desktop) is a mistake: ${r.msg.slice(0, 90)}`);
  ok(await until("t.os.media === 'ubuntu-24.04.1-live-server-amd64.iso'", 60), 'the cues eject it and mount the server image');
  // 2. the data volume instead of the boot device
  ok(await until("t.os.inst && t.os.inst.s === 'storage'"), 'Ubuntu installer reaches guided storage');
  r = await T("t => ({ d: t.os.inst.disk })");
  ok(r.d === 'sda', 'the disk offered first is the 19 TB data volume (sda)');
  e0 = await T('t => t.errors'); await p.evaluate(() => Sim.do('osAct', 'done'));
  r = await T("t => ({ e: t.errors, s: t.os.inst.s, msg: t.log[t.log.length - 1].msg })");
  ok(r.e === e0 + 1 && r.s === 'storage' && /data volume/.test(r.msg), `installing on the data volume is a mistake and stays: ${r.msg.slice(0, 80)}`);
  ok(await until("t.os.inst.s === 'summary'", 30), 'the cue picks the NS204i-u and goes on');
  // 3. the profile: the work order's server name and password
  ok(await until("t.os.inst.s === 'profile'"), 'Ubuntu reaches the profile');
  await p.evaluate(() => { const i = twin().os.inst; Object.assign(i.f, { name: 'Lab Admin', host: 'server1', user: 'labadmin', pw: 'Train-OS-26!', pw2: 'Train-OS-26!' }); Sim.do('osAct', 'done'); });
  r = await T("t => ({ s: t.os.inst.s, msg: t.log[t.log.length - 1].msg })");
  ok(r.s === 'profile' && /dl380-lab01/.test(r.msg), 'a server name other than the work order\'s is refused');
  // 4. the shell: sudo, dmidecode, lsblk on the installed system
  ok(await until('!!t.os.ran.login'), 'Ubuntu installed, booted, logged in');
  const sh = async c => p.evaluate(c => { const t = twin(); t.os.term.cmd = c; OSI.term.enter(t); return OSI.term.out(t).slice(-60).join('\n'); }, c);
  let o = await sh('sudo dmidecode -t memory | grep -c "Size: 32 GB"');
  ok(/\[sudo\] password|$/.test(o) && (await T('t => t.os.term.mode')) === 'sudo', 'sudo asks for the user\'s password');
  o = await sh('wrong-password'); ok(/Sorry, try again/.test(o), 'a wrong sudo password: Sorry, try again');
  o = await sh('Train-OS-26!'); const dimms = await T("t => Object.keys(t.dimms).length");
  ok(o.trim().split('\n').pop() === String(dimms), `dmidecode counts the fitted DIMMs: ${o.trim().split('\n').pop()} of ${dimms}`);
  o = await sh('lsblk'); ok(/nvme0n1p3/.test(o) && /ubuntu--vg-ubuntu--lv/.test(o) && !/sda1/.test(o), 'lsblk: the OS partitions on nvme0n1, the data volume untouched');
  o = await sh('lsmem'); const gb = await T("t => Object.keys(t.dimms).length * 32");
  ok(new RegExp(`Total online memory:\\s+${gb}G`).test(o), `lsmem reports the fitted ${gb} GB`);
  o = await sh('ip -br a'); ok(/ens15f0np0\s+UP\s+10\.1\.40\.17\/24/.test(o) && /ens15f1np1\s+DOWN/.test(o), 'ip -br a: the address on OCP 15 port 1, port 2 down');
  // 5. the handover: what free shows is not the installed memory; cores are not threads
  ok(await until("Sim.view === 'handover' || t.os.repOk", 200), 'the checks done, the handover is next');
  await p.evaluate(() => { const t = twin(), gb = Object.keys(t.dimms).length * 32; Sim.do('go', 'handover'); t.os.rep.mem = String(Math.floor(gb - 0.6 - gb * 0.0165)); t.os.rep.thr = '64'; t.os.rep.disk = 'nvme0n1'; Sim.do('osRep', 'submit'); });
  r = await T("t => ({ ok: t.os.repOk, msg: t.log[t.log.length - 1].msg })");
  ok(!r.ok && /reservations/.test(r.msg) && /Hyper-Threading/.test(r.msg), 'handover: the free value and the core count are refused, with the reason');
  ok(await until('t.os.repOk', 40), 'the cue records the right values: lab done');

  // 6. Cisco: a static address on a port without a link
  await lab(C, 'os-ubuntu');
  ok(await until("t.os.inst && t.os.inst.s === 'net'"), 'Cisco Ubuntu reaches the network screen');
  r = await T("t => Object.keys(t.os.inst.net).join(' ')"); ok(r === 'eno1 eno2 enp10s0 enp11s0', `four ports: ${r}`);
  await p.evaluate(() => { const i = twin().os.inst; Object.assign(i.net.eno1, { mode: 'manual', subnet: '10.1.40.0/24', addr: '10.1.40.120', gw: '10.1.40.1', dns: '10.1.40.1' }); });
  e0 = await T('t => t.errors'); await p.evaluate(() => Sim.do('osAct', 'done'));
  r = await T("t => ({ e: t.errors, s: t.os.inst.s, msg: t.log[t.log.length - 1].msg })");
  ok(r.e === e0 + 1 && r.s === 'net' && /no link/.test(r.msg), `the address on LAN 1 (no cable) is a mistake: ${r.msg.slice(0, 80)}`);
  ok(await until("t.os.inst.s === 'proxy'", 60), 'the cue moves it to VIC PORT 1 (enp10s0)');

  // 7. Rocky: both disks, then Server with GUI
  await lab(H, 'os-rocky');
  ok(await until("t.os.inst && t.os.inst.s === 'dest'"), 'Rocky reaches Installation Destination');
  e0 = await T('t => t.errors'); await p.evaluate(() => { Sim.do('osAct', 'disk:sda'); Sim.do('osAct', 'disk:nvme0n1'); Sim.do('osAct', 'done'); });
  r = await T("t => ({ e: t.errors, msg: t.log[t.log.length - 1].msg })"); ok(r.e === e0 + 1 && /More than one disk/.test(r.msg), 'both disks selected: a mistake');
  ok(await until("t.os.inst.s === 'hub' && t.os.inst.destOk", 40), 'the cue deselects the data volume and reclaims the old system\'s space');
  ok(await until("t.os.inst.s === 'soft'"), 'Rocky reaches Software Selection');
  e0 = await T('t => t.errors'); await p.evaluate(() => Sim.do('osAct', 'done'));
  r = await T("t => ({ e: t.errors, msg: t.log[t.log.length - 1].msg })"); ok(r.e === e0 + 1 && /Server with GUI/.test(r.msg), 'Server with GUI (the default) is refused');

  // 8. ESXi on the Cisco: the management network left on vmnic0, LAN 1 without a cable
  await lab(C, 'os-esxi');
  ok(await until("t.os.dcui && t.os.dcui.s === 'nics'"), 'ESXi installed, DCUI, Network Adapters');
  r = await T("t => t.os.dcui.f.nics.join(',')"); ok(r === 'vmnic0', 'ESXi starts with vmnic0');
  e0 = await T('t => t.errors'); await p.evaluate(() => Sim.do('osKey', 'Enter'));
  r = await T("t => ({ e: t.errors, msg: t.log[t.log.length - 1].msg })"); ok(r.e === e0 + 1 && /Disconnected/.test(r.msg), `vmnic0 kept: a mistake: ${r.msg.slice(0, 80)}`);
  ok(await until('!!t.os.m.e_apply', 80), 'the cue moves the management network to vmnic2 (VIC PORT 1) and applies it');
  ok(await until('!!t.os.ran.login', 80), 'ESXi Shell: logged in as root');
  o = await sh('esxcli hardware memory get'); const cg = await T('t => Object.values(t.dimms).length * 16');
  ok(new RegExp(`Physical Memory: ${cg * 1024 ** 3} Bytes`).test(o), `esxcli: ${cg} GiB in bytes`);
  o = await sh('esxcli network nic list'); ok(/vmnic0\s+0000:01:00\.0\s+igbn\s+Up\s+Down/.test(o) && /vmnic2\s+0000:0a:00\.0\s+nenic\s+Up\s+Up\s+10000/.test(o), 'esxcli network nic list: LAN 1 down, VIC PORT 1 up at 10 Gb/s');
  o = await sh('vmkping -c 3 10.1.40.1'); ok(/3 packets received, 0% packet loss/.test(o), 'vmkping: the gateway answers');

  // 9. no OS lab: virtual media is not used, nothing breaks
  await lab(H, 'cpurep');
  await p.evaluate(() => { Sim.do('go', 'handover'); });
  r = await T("t => !!t.os"); ok(!r, 'other labs carry no OS state');
  console.log(errs.length ? 'page errors: ' + JSON.stringify(errs) : 'no page errors'); if (errs.length) fails++;
  await b.close(); process.exit(fails ? 1 : 0);
})();
