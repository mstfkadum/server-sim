# Server build trainer

A hands-on server hardware simulator for engineers: the student picks a server model and a scenario (new install,
memory upgrade, NIC fit, drive, fan or power supply replacement, management setup) and works through it on photos of the real
server, with guidance, mistake counting and a readiness check.

Models: Cisco UCS C240 M4 LFF (thirteen labs: eight hands-on labs, the two RAM Distributor labs and three OS install labs; in the new install and the memory lab the student chooses one of three Cisco
DIMM models, 16 GB RDIMM, 32 GB RDIMM or 64 GB LRDIMM, and fits as many as they like in Cisco's order, minimum 2 DIMMs (A1 and E1),
checked on a population map and read back in Cisco IMC, Chassis, Inventory, Memory; the cabling follows a cable schedule
with exact ports: VIC PORT 1 and PORT 2 to SW01 and SW02 port 23, MGMT to MGT01 port 12, PSU 1 and PSU 2 to PDU A and
PDU B outlet 7, and a cable in any other port is flagged, left without a link and must be moved; the cable management
arm UCSC-CMAF-M4 is taken from the parts cart first, then its three tabs go on the marked rail ends, and the two
hook-and-loop straps show open or fastened, guidance on or off) and HPE ProLiant DL380 Gen11 SFF (seven labs; HPE Lab 1 is the new build: find the
server by its serial number among three DL380 Gen11 servers in a different order each run (the serial number pull tab on the
left rack ear of each one against the work order; all three slide out, and extending the wrong one counts as a mistake), extend it
from the rack, processor 2 (the same hands-on flow as the replacement lab, for a new processor and a new heatsink: the
blank and the socket cover off, the film off the pre-applied thermal pad, triangle to triangle, the processor clicked into
the carrier, the module lowered, the wires clipped, the T-30 screws tightened in a cross order), as much memory as the student wants in any layout HPE supports (minimum 2 DIMMs, one per
processor in slot 10; the DIMM box holds three HPE types, 16 GB 1Rx8, 32 GB 2Rx8 and 64 GB 2Rx4 RDIMMs: one type in the server,
because HPE does not mix x4 with x8 DIMMs), as many front SSDs as the student wants (minimum 4, enough for a RAID 6 or RAID 10 data volume),
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
the RAM Distributor practice and exam, HPE Labs 5 to 7 the OS installs; more HPE labs are added one by one) and Dell PowerEdge
R6515 (six labs: Lab 1 the rack installation: pull the information tag on the left control panel and check the Service Tag and
Express Service Code against the work order, find the U on the rack's numbered strip, fit the ReadyRails sliding rails in
Dell's order, rear end piece on the rear post then the front with its latch, both at the same U, pull the inner rails out
until they lock, lower the server rear standoffs first into the J-slots and rotate the front down into the hooks, pull the
blue slide-release lock tabs and slide it in, then check it: press both rack-ear latches,
slide it out, push it back until they click; the front of the trainer's server is the photo, the rack and the rails are
drawings, seen from the front and from above, with close-ups of the end piece on the post, the standoffs dropping into
the J-slots and the ear latches. Dell Lab 2 replaces the processor, reusing its heat sink. The inside is the trainer's photo from above, rear at
the top, straightened and its labels painted over, with the air shroud as its own layer that lifts away and the cover
drawn over it: the lock turned, the release latch in the middle of the cover lifting up, the cover off. The student picks
the right tool from the manual's list for each job (1/4 inch flat blade or Phillips #2 for the cover lock, Torx T20 for
the heat sink, a torque driver with a T20 bit set to 12 lbf-in for the force plate, Dell's 12.0 ± 1.0 lbf-in); a wrong
tool or setting is a mistake. The front LEDs go dark when the server is off. In a drawn close-up of the socket, the
heat sink cooled and its four captive screws turned in the marked order (1 and 2, 3 and 4, three turns then fully) and
lifted off, the old grease wiped off the processor lid and the heat sink base, a finger holding the spring-loaded force
plate down while its screws go 3-2-1 and the plate swinging up on its front hinge, the two blue latches and the rail
frame rising, the old tray sliding out of the top of the standing frame by its tab, the new one (its specifications shown as it
comes out of the kit) turned until its gold triangle matches the frame's, then in, frame down, plate
down and 1-2-3 pressed flat, one thin spiral of grease drawn by the student with the mouse (too much, or off the lid,
is a mistake: wipe and draw again), the heat sink down and screwed in the same order,
shroud and cover back, back into the rack. It starts in two ways: from the Lab menu on a server in service (power off,
both cords out then the cables at the server on the trainer's rear photo, each labelled with its far end, and at the
end cables then cords last, power on, the expected CMOS checksum message at POST, F2 into System Setup), or straight
after Lab 1 with its Continue button, on the server just installed, not cabled yet: there it has no unplugging, and it
ends with the first cabling. On the rear of the rack (as in the Cisco lab: SW01, SW02, MGT01, PDU A and PDU B, the
R6515's rear photo in U20) the student cables to the work order's cable schedule, peripherals first and the outlets
last (ISM page 20): iDRAC to MGT01 port 13, Gb 1 to SW01 port 22, Gb 2 to SW02 port 22, then PSU 1 to PDU A outlet 8 and
PSU 2 to PDU B outlet 8, each cord strapped to its PSU handle (ISM page 93), labels at both ends; then the power button,
the fans run up, and F2 at POST into System Setup. A wrong port, a port in use, power before data or a cable plugged
into the wrong kind of port is a mistake; a misplaced cable stays where it went until it is unplugged and moved.
The run then sets up the iDRAC9, as Dell Lab 4 does on its own (the server installed and cabled, never powered on):
ask the NOC to confirm the management VLAN for 10.1.23.0/24 on MGT01 port 13; power on; plug a VGA monitor and a USB
keyboard into the rear panel; watch the boot screens (initializing, the Dell EMC logo, then F2 = System Setup, F10,
F11, F12 with the iDRAC IPv4 address) and press F2, on the student's own keyboard or by clicking it; in System Setup >
iDRAC Settings > Network set the NIC enabled and Dedicated, IPv4 enabled, DHCP disabled, 10.1.23.121, gateway 10.1.23.1,
mask 255.255.255.0, VLAN disabled (the switch port is an access port), and in User Configuration change the root
password, twice; Finish saves, Finish on the main menu reboots, and the boot screen shows the new address. Tab, Shift+Tab
and the arrow keys move between fields, Left, Right or Space change a choice, Enter opens or presses, Esc goes back; the
mouse works too. Last, the laptop browser: https://10.1.23.121, the iDRAC's self-signed certificate, the iDRAC9 login as
root, and the address checked on the dashboard. The screens are rebuilt from the trainer's photos of a real R6515, with
invented values. Its work order stays in view under the work, in the panel where other labs show their briefing, as
in the OS install labs. In that installation run, or as standalone Dell Lab 3 from the Lab menu, the memory goes in across the 16
DDR4 sockets (A1 to A16, eight channels A to H) on the trainer's top-open photo: unpack the DIMM kit onto the antistatic
mat, choose one of the five Dell-supported DDR4-3200 models from ISM Table 13 (8 GB 1Rx8, 16 GB 2Rx8, 32 GB 2Rx8, 64 GB
2Rx4 RDIMM, or 128 GB 8Rx4 LRDIMM; mixing capacities or RDIMM/LRDIMM is rejected), open both socket ejector latches,
align the edge-connector key notch and press down evenly on both ends in Dell's population order: white release tabs A1
to A8 first (minimum 4 equal modules in A1 to A4, or 8 in A1 to A8 for all 8 channels at 3200 MT/s), then black release
tabs A9 to A16 (12 in A1 to A12, or 16 in A1 to A16 at 2933 MT/s), and in standalone Lab 3 verify Memory Settings in System Setup at POST. Dell Labs 5 and 6 are the RAM Distributor practice and exam for the R6515. The
wrist strap is the Cisco pack's drawing; more Dell labs follow one by one). More are added as
model packs:
see `docs/ADDING_A_MODEL.md`.

## RAM Distributor

A memory planning board and test for all three servers, from the vendors' own population rules (Cisco: 16 GB and 32 GB RDIMM, 64 GB LRDIMM; HPE: 16 GB 1Rx8, 32 GB 2Rx8, 64 GB 2Rx4 RDIMM; Dell R6515: 8 GB 1Rx8, 16 GB 2Rx8, 32 GB 2Rx8, 64 GB 2Rx4 RDIMM, and 128 GB 8Rx4 LRDIMM).
The page is one board. At the top: the processors (1 or 2 on dual-socket servers; 1 on the single-socket Dell R6515), the DIMM size, the memory size, **Distribute**, **Clear
Board**, **Random Exam** and **Verify Distribution**. The memory list offers only the totals the chosen DIMM builds in a
layout the vendor supports (1 to 12 per CPU on the Cisco; 1, 2, 4, 6, 8, 12 or 16 per processor on the
HPE; 4, 8, 12 or 16 on the Dell R6515), and marks the ones that fill every channel. Below is the population map, drawn as the board sits in the server,
seen from above with the rear at the top: on the Cisco the sockets G H, CPU 2, F E C D, CPU 1, B A; on the HPE
processor 2 on the left with its slots 1 to 8 and 9 to 16 either side of it, then processor 1 the same, numbered as on
the service label; on the Dell R6515 the left bank A3, A13, A4, A14, A7, A15, A8, A16, CPU 1, and the right bank A12, A6, A11, A5, A10, A2, A9, A1. The student clicks the slots to place the chosen DIMM (a click on a fitted slot with the same size
takes it out). With guidance on, one slot at a time is marked as the next one, in the vendor's order over the server
(Cisco: A1, E1, B1, F1 ...; HPE: slot 10 of processor 1, then of processor 2, then 3 ...; Dell: white release tabs A1 to A8, then black release tabs A9 to A16). The side panel shows the vendor's
population table (the slots for each count), in practice and in the exam, so the plan need not be memorised; each
DIMM clicks into place with a sound (Sound on). Three ways to use it:

- **Planner** (the RAM Distributor in the left menu of any lab) and **Practice** (Cisco Lab 9, HPE Lab 3, Dell Lab 5): the student
  chooses the setup, places the DIMMs (or presses Distribute to see the layout) and verifies. Verify checks the board
  against the vendor's layout for that setup, and says whether another DIMM size gives the same capacity faster or
  with fewer DIMMs. Random Exam in the planner draws a work order on the board, with Distribute and the marks off until
  it is verified; nothing is recorded.
- **Exam** (Cisco Lab 10, HPE Lab 4, Dell Lab 6): a random work order from a set of tricky cases (a capacity no single DIMM size
  fills, a capacity that cannot be met exactly, a count the vendor does not support, one processor only). Any of the
  supported sizes may be used, mixed where the vendor allows. Guidance, Distribute and the marks on the board are off until
  the student verifies, which submits the layout. The best layout is shown after.

For the exam, best means, in this order: at least the capacity ordered and no more than the least a supported layout gives; then the
fastest (memory bandwidth within 5 % of the best); then the fewest DIMMs. Exam grading: an unsupported layout or less
capacity than ordered fails (score 0). A supported layout passes with points off: 20 if a faster layout was possible,
10 for more capacity than needed, 10 for more DIMMs than needed. Pass mark 70.

The rules come from the vendors' documents and are shown on the page with their sources:

- Cisco: the UCS C240 M4 spec sheet (DDR4-2400: 16 GB and 32 GB RDIMM, 64 GB LRDIMM; 1 to 12 per CPU in Cisco's
  order; both CPUs identical; no RDIMM with LRDIMM; speeds for a 2400 MHz Xeon E5-2680 v4).
- HPE: the white paper a50007437enw (memory population rules for Gen11 servers with 4th Gen Xeon) and the DL380 Gen11
  QuickSpecs (DDR5-4800 RDIMMs: 16 GB 1Rx8, 32 GB 2Rx8, 64 GB 2Rx4; 1, 2, 4, 6, 8, 12 or 16 per processor in fixed
  slots; no x4 with x8; two types only with all 16 slots filled, dual rank white and single rank black; speeds for a
  Xeon Gold 6430).
- Dell: the PowerEdge R6515 Installation and Service Manual Rev. A14, pages 17 and 47–54, Tables 12–16 (single AMD EPYC
  processor, 8 channels A to H, 16 DDR4 sockets A1 to A16; five DDR4-3200 models: 8 GB 1Rx8, 16 GB 2Rx8, 32 GB 2Rx8,
  64 GB 2Rx4 RDIMM, and 128 GB 8Rx4 LRDIMM; balanced counts 4, 8, 12 or 16 in numerical order A1 to A16, white release
  tabs A1–A8 at 3200 MT/s before black release tabs A9–A16 at 2933 MT/s; no mixing capacities or RDIMM/LRDIMM).

Limits: the check is the board's memory summary, not a full power-on with memory training; one processor model per
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
- **One-time boot:** F11 at POST on HPE (One-Time Boot Menu), F6 on Cisco (Boot Menu). On the Cisco the boot order can also be set in Cisco IMC
  (Compute, BIOS, Configure Boot Order): with the virtual DVD first, every restart boots the mapped image without F6,
  including the restart after the install, until the image is unmapped or the HDD is put first again.
- **Installers** modelled on the real ones: Ubuntu's Subiquity, Rocky's Anaconda, the ESXi installer and DCUI. Each
  has the traps engineers hit: the data volume offered before the boot device (HPE: the RAID 6 volume next to the
  NS204i-u), a static address on the port that has a link (no DHCP on the data network), and on the Cisco, ESXi's
  management network on the onboard port with no cable, to move to the VIC port.
- **After the install:** eject the image, log in at the console and check the build from the OS: `lsmem`, `free`,
  `dmidecode -t memory`, `lscpu`, `lsblk`, `ip`, `ethtool`, `ping` and more on Linux (`help` lists them), `esxcli` in
  the ESXi Shell. The Linux console keeps a command history (Up and Down) and clears with `clear` or Ctrl+L. On
  Rocky Linux, `nmtui` edits the port's connection profile (Manual or Automatic, address with prefix, gateway, DNS),
  activates or deactivates connections and sets the hostname; as in NetworkManager, a saved profile applies when the
  connection is activated again (or `nmcli con up`). Ubuntu Server has no `nmtui`: it uses netplan. Every answer comes from what the student built in the trainer: the DIMMs fitted, the processors,
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

## How to use: the first-page tour

On the first visit the page opens with a short tour: a welcome card with the four things a lab asks (pick the lab,
read the step, click the part, finish every step), then one card per part of the screen with that part spotlighted:
Server model and Lab (inside a learning platform, the course bar instead, with the package's pass mark and graded or
practice rules), Guidance, Sound, Restart, progress and mistakes, work areas, the step, the workbench, the action
buttons, the lab briefing, the steps, the reference panel and the event log. Next, Back, Skip tour; arrow keys and Esc
work too. It adapts to an exam (guidance stays off). The browser remembers that the tour was seen; **How to use** in
the header opens it again. A SCORM package shows it on a first launch, not when a saved run resumes. The tour is not a
lab action: it never makes a run practice, a mistake or a step. `?tour=off` keeps it closed, `?tour=on` always opens
it.

## Moodle and other learning platforms (SCORM 1.2)

```
node build-scorm.js      # writes dist/scorm/: one package per lab, and one with all labs
```

Inside a learning platform the simulator reports completion, a score (100 minus 10 per mistake, pass mark 70, for
runs done with guidance off; the RAM Distributor exam also takes off the plan points above), time spent and the step reached, and resumes where the student stopped. Every package opens with the How to use tour
on a first launch. Outside one it
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
