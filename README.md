# Server build trainer

A hands-on server hardware simulator for engineers: the student picks a server model and a scenario (new install,
memory upgrade, NIC fit, drive, fan or power supply replacement, management setup) and works through it on photos of the real
server, with guidance, mistake counting and a readiness check.

Models: Cisco UCS C240 M4 LFF (thirteen labs: eight hands-on labs, the two RAM Distributor labs and three OS install labs; in the new install and the memory lab the student chooses one of two Cisco
DIMM models, 16 GB RDIMM or 64 GB LRDIMM, and fits as many as they like in Cisco's order, minimum 2 DIMMs (A1 and E1),
checked on a population map and read back in Cisco IMC, Chassis, Inventory, Memory; the cabling follows a cable schedule
with exact ports: VIC PORT 1 and PORT 2 to SW01 and SW02 port 23, MGMT to MGT01 port 12, PSU 1 and PSU 2 to PDU A and
PDU B outlet 7, and a cable in any other port is flagged, left without a link and must be moved) and HPE ProLiant DL380 Gen11 SFF (seven labs; HPE Lab 1 is the new build: find the
server by its serial number among three DL380 Gen11 servers in a different order each run (the serial number pull tab on the
left rack ear of each one against the work order; all three slide out, and extending the wrong one counts as a mistake), extend it
from the rack, processor 2 (the same hands-on flow as the replacement lab, for a new processor and a new heatsink: the
blank and the socket cover off, the film off the pre-applied thermal pad, triangle to triangle, the processor clicked into
the carrier, the module lowered, the wires clipped, the T-30 screws tightened in a cross order), as much memory as the student wants in any layout HPE supports (minimum 2 DIMMs, one per
processor in slot 10; the DIMM box holds two HPE types, 32 GB RDIMMs and 128 GB 3DS RDIMMs: either one, never both,
because HPE does not support mixing 3DS and non-3DS memory), as many front SSDs as the student wants (minimum 4, enough for a RAID 6 or RAID 10 data volume),
cabling at the rear of the rack to the exact ports of a cable schedule (iLO to MGT01 port 14, OCP 15 ports 1 and 2 to
SW01 and SW02 port 24, PS1 and PS2 to PDU A and PDU B outlet 6), labelled and dressed, then the first iLO setup at the
rack ( a monitor and keyboard at the rear,
F9 at POST, a static address 10.1.23.17/24 with gateway 10.1.23.1 and a new Administrator password in the iLO 6
Configuration Utility), and the iLO web interface from the laptop on the management network, which follows whatever
address and password were set and reads what was installed; HPE Lab 2 replaces processor 2 reusing its
heatsink, in the service order: find the server by its pull tab, shut it down, unplug its power cords, data cables and
iLO cable at the server (the switch and PDU ends stay in place, labelled), extend it, wrist strap, access panel and air
baffle off, then wires up, screws loosened in a cross order with the T-30 Torx, the module lifted, the release lever and
clips to free the old processor, the base cleaned with the HPE-recommended kit, new grease, triangle to triangle, the
processor clicked in, the module lowered, wires clipped and screws tightened in a cross order; then everything back in
reverse (baffle, panel, back into the rack, iLO and data cables, power last), power on and check both processors in iLO,
drawn from HPE's service video frames supplied by the trainer; HPE Labs 3 and 4 are
the RAM Distributor practice and exam, HPE Labs 5 to 7 the OS installs; more HPE labs are added one by one). More are added as
model packs:
see `docs/ADDING_A_MODEL.md`.

## RAM Distributor

A memory planning tool and test for both servers, from the vendors' own population rules. Three ways to use it:

- **Planner** (the RAM Distributor in the left menu of any lab): type a capacity, choose one or two processors, and it
  lists every supported layout for that capacity, best first, with the slot map, the DIMM part numbers, the speed,
  the bandwidth and the reason for the ranking. Nothing is graded.
- **Practice** (Cisco Lab 9, HPE Lab 3): a random work order (capacity and processors). Order the DIMMs, fit them in the
  Memory view, run the memory check. The planner is open, so the best layout can be looked up.
- **Exam** (Cisco Lab 10, HPE Lab 4): a random work order from a set of tricky cases (a capacity no single DIMM size
  fills, a capacity that cannot be met exactly, one processor only, a DIMM the chassis does not support). Guidance, the
  planner and the memory hints are off until the student submits. The layouts are shown after submitting.

Best means, in this order: at least the capacity ordered and no more than the least a supported layout gives; then the
fastest (memory bandwidth within 5 % of the best); then the fewest DIMMs. Exam grading: an unsupported layout or less
capacity than ordered fails (score 0). A supported layout passes with points off: 20 if a faster layout was possible,
10 for more capacity than needed, 10 for more DIMMs than needed, and 10 per handling mistake. Pass mark 70.

The rules come from the vendors' documents and are shown on the page with their sources:

- Cisco: the UCS C240 M4 spec sheet (six DDR4-2400 DIMMs, 8 to 64 GB RDIMM and LRDIMM; 1 to 12 per CPU in Cisco's
  order; both CPUs identical; no RDIMM with LRDIMM; speeds for a 2400 MHz Xeon E5-2680 v4).
- HPE: the white paper a50007437enw (memory population rules for Gen11 servers with 4th Gen Xeon) and the DL380 Gen11
  QuickSpecs (nine DDR5-4800 RDIMMs, 16 to 256 GB; 1, 2, 4, 6, 8, 12 or 16 per processor in fixed slots; no 3DS with
  standard RDIMMs, no x4 with x8, no mixed DRAM densities; two types only with all 16 slots filled; the 256 GB DIMMs
  not in a 24 SFF chassis; speeds for a Xeon Gold 6430).

Limits: the check is the lab's memory summary, not a full power-on with memory training; one processor model per
server; bandwidth is a model (channels used and their interleaving), not a benchmark. The trainer does not replace the
vendors' own configuration tools for a real order.

## OS install over virtual media

The last part of a server build, and three labs per server (Cisco Labs 11 to 13, HPE Labs 5 to 7): Ubuntu Server
24.04, Rocky Linux 9.5 and VMware ESXi 8.0 U3, installed from the laptop through the management controller. The new
build labs end with it too (Cisco Lab 1 installs Ubuntu Server, HPE Lab 1 Rocky Linux). The OS labs are reinstalls of
a server that is already built and runs an older system, which is why the one-time boot matters.

- **Media:** the ISO comes from the laptop's Downloads folder, mapped through iLO's HTML5 remote console (Virtual
  Drives, Image File CD/DVD-ROM) or the Cisco IMC KVM console (Virtual Media, Map CD/DVD). The folder also holds
  look-alike wrong images (the Ubuntu desktop image, the Rocky Linux boot and ARM images, VMware's generic ESXi image
  instead of the vendor's custom one); mapping one is a mistake.
- **One-time boot:** F11 at POST on HPE (One-Time Boot Menu), F6 on Cisco (Boot Menu).
- **Installers** modelled on the real ones: Ubuntu's Subiquity, Rocky's Anaconda, the ESXi installer and DCUI. Each
  has the traps engineers hit: the data volume offered before the boot device (HPE: the RAID 6 volume next to the
  NS204i-u), a static address on the port that has a link (no DHCP on the data network), and on the Cisco, ESXi's
  management network on the onboard port with no cable, to move to the VIC port.
- **After the install:** eject the image, log in at the console and check the build from the OS: `lsmem`, `free`,
  `dmidecode -t memory`, `lscpu`, `lsblk`, `ip`, `ethtool`, `ping` and more on Linux (`help` lists them), `esxcli` in
  the ESXi Shell. Every answer comes from what the student built in the trainer: the DIMMs fitted, the processors,
  the RAID volume, the cabled ports. Then the new boot entry is read back in iLO (Administration, Boot Order) or Cisco
  IMC (Compute, BIOS), and the handover records memory, logical CPUs and boot disk as the OS reports them.

Limits: the systems are simulated, not real operating systems: the shell answers a set of checking commands (listed by
`help`), and the installers follow the standard path with its common mistakes, not every option. Versions are lab
examples. The HPE is assumed to have an iLO Advanced licence, which virtual media needs. VMware's compatibility guide
does not certify the C240 M4 for ESXi 8.0; the Cisco ESXi lab says so.

## Build

Needs Node.js (any recent version), nothing else:

```
node build.js            # writes dist/index.html
node build.js out.html   # or any other path
```

The result is one self-contained HTML file (photos included). Open it in a browser, or put it on any static web
host: GitHub Pages, Netlify, Cloudflare Pages, a university web server, or a learning platform.

Direct links: `index.html?model=cisco-c240-m4-lff&scenario=fan` or `index.html?model=hpe-dl380-gen11-sff&scenario=install`
opens a model and scenario (`&guide=off` starts with guidance off).

## Moodle and other learning platforms (SCORM 1.2)

```
node build-scorm.js      # writes dist/scorm/: one package per lab, and one with all labs
```

Inside a learning platform the simulator reports completion, a score (100 minus 10 per mistake, pass mark 70, for
runs done with guidance off; the RAM Distributor exam also takes off the plan points above), time spent and the step reached, and resumes where the student stopped. Outside one it
works exactly as the plain page. Setup steps: `docs/MOODLE_SCORM.md`.

## Layout

- `engine/` the shared engine (page, menus, scenario runner, drawing helpers, SCORM link, embedded typefaces)
- `models/` one folder per server model, listed in `models/index.json`
- `docs/` how to add a model, a template pack to copy, and the Moodle setup
- `tests/` automated checks (Node.js with Playwright: `npm i playwright`)

## Guidance and highlights

With guidance on, the next action is framed by a ring and a "Click here" tag on the picture (or an outline on a button or
field). The ring frames its own target only: in dense rows (DIMM sockets, switch ports, PDU outlets) it stays inside the
gap to the neighbours, and it passes under a label rather than through it. With guidance off nothing on the picture points
the way: no ring, no "next" marker, no port or outlet drawn brighter than the others, and no order numbers on the Cisco
DIMM sockets. The reference material stays (the cable schedule, the population tables, the service label), as on a real
job.

## Look and feel

The page is drawn like the hardware it teaches. The header is the server's front bezel, with one lamp per step of the
lab (green done, amber next) and the mistake count. Panels are service labels on a steel chassis lid, and the picture
sits on the blue antistatic mat. Colours keep the meaning they have on a server's LEDs: green for done and for touch
points, amber for the next action, blue for the selected item, red for a mistake. The step bar above the picture
always names the next action; the result of each action appears below the picture, and the lab briefing below the
action buttons. On a phone the picture can be zoomed and scrolled sideways. The typefaces (Instrument Sans for text,
Big Shoulders for titles and numbers) are embedded, so the page looks the same offline and inside a learning
platform, with no request to an outside font service. Light and dark follow the device setting.

## Copyright

© 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved. See `LICENSE.txt`.
