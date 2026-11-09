/* ==========================================================================================================
   Dell PowerEdge R6515 — Memory installation view (16 DDR4 sockets, A1 to A16, across 8 memory channels).
   Sources: Dell PowerEdge R6515 Installation and Service Manual (Rev. A14), System board connectors (Figure 11,
   page 17) and System memory (pages 47 to 54, Tables 12 to 16, Figures 42 to 44). The trainer's top-open photo of
   the server shows all 16 sockets around the AMD EPYC SP3 socket: A3, A13, A4, A14, A7, A15, A8, A16 on the left
   (channels H, G, F, E) and A12, A6, A11, A5, A10, A2, A9, A1 on the right (channels A, B, C, D). White release
   tabs mark the first socket of each channel (A1 to A8); black release tabs mark the second (A9 to A16).
   © 2026 Mustafa Abdulkadhim, Information Technology. All rights reserved.
   ========================================================================================================== */

const MB = { x: 14, y: 66, w: 518, crop: [725, 710, 1615, 1380] };
const MS = MB.w / (MB.crop[2] - MB.crop[0]);
MB.h = (MB.crop[3] - MB.crop[1]) * MS;
const mx = x => MB.x + (x - MB.crop[0]) * MS;
const my = y => MB.y + (y - MB.crop[1]) * MS;

// Which populated slots are currently in valid positions vs out-of-order/mixed
function slotStatus(t, s) {
  const k = t.dimms && t.dimms[s];
  if (!k) return 'empty';
  const on = dimmList(t), kinds = dimmKinds(t);
  if (kinds.length > 1) return 'bad';
  const targetN = OKN.find(n => n >= Math.max(4, on.length)) || 16;
  const allowed = wantSlots(OKN.includes(on.length) ? on.length : targetN);
  return allowed.includes(s) ? 'ok' : 'bad';
}

// Top-left panel: the real photo (FIGS.topOpen) cropped to the processor and the 16 DDR4 sockets
function memBand(t) {
  const fullW = 1720 * MS, fullH = 1720 * FIGS.topOpen.H / FIGS.topOpen.W * MS;
  const ix = MB.x - MB.crop[0] * MS, iy = MB.y - MB.crop[1] * MS;
  const yTopTab = my(748), yBody0 = my(810), yBody1 = my(1284), yBotTab = my(1344), yNotch = my(1045);
  const on = dimmList(t), nextSlot = FILL.find(s => !t.dimms[s]);

  let g = `<text x="450" y="38" text-anchor="middle" class="ss">White release tabs (A1 to A8): first socket of each channel · Black release tabs (A9 to A16): second socket</text>`;
  g += `<defs><clipPath id="dmb"><rect x="${MB.x}" y="${MB.y}" width="${MB.w}" height="${f1(MB.h)}" rx="5"/></clipPath></defs>`;
  g += `<rect x="${MB.x - 2}" y="${MB.y - 2}" width="${MB.w + 4}" height="${f1(MB.h + 4)}" rx="6" fill="#0B131A" stroke="#355268" stroke-width="1.5" pointer-events="none"/>`;
  g += `<g clip-path="url(#dmb)" pointer-events="none"><image href="${FIGS.topOpen.src}" x="${f1(ix)}" y="${f1(iy)}" width="${f1(fullW)}" height="${f1(fullH)}" preserveAspectRatio="none"/>`;
  // subtle dark vignette at the bottom edge of the photo so the silkscreen slot labels are crisp
  g += `<rect x="${MB.x}" y="${f1(MB.y + MB.h - 22)}" width="${MB.w}" height="22" fill="#081018" opacity=".82"/>`;
  g += `<rect x="${f1(mx(1090))}" y="${f1(my(1012))}" width="${f1(184 * MS)}" height="24" rx="4" fill="#0B131A" opacity=".82" stroke="#355268"/>`;
  g += TXT(mx(1182), my(1012) + 16, 'CPU 1 (AMD EPYC)', 'font:700 10px var(--font);fill:#EAF2F7');
  g += `</g>`;

  // Draw open ejector latches, seated DIMMs, and status badges on the photo
  SLOTS.forEach(s => {
    const sx = mx(SLOT_X[s]), white = WHITE_SLOTS.includes(s), open = t.memOpen[s], k = t.dimms[s], sel = t.selSlot === s;
    const tabFill = white ? '#F5F3EB' : '#32373D', tabEdge = open ? '#FFB52E' : (white ? '#9E9B90' : '#14181C');
    const aC = fxAge('dimmClip:' + s), aF = fxAge('dimmFit:' + s);
    g += `<g pointer-events="none">`;
    if (open && !k) {
      // Open ejector latches swung outward at rear (top) and front (bottom) ends of the socket
      const dy = 5;
      g += `<rect x="${f1(sx - 5)}" y="${f1(yTopTab - dy)}" width="10" height="16" rx="1.8" fill="${tabFill}" stroke="${tabEdge}" stroke-width="1.3">${aC < 0.35 ? `<animate attributeName="y" values="${f1(yTopTab)};${f1(yTopTab - dy)}" dur="0.25s" begin="-${aC.toFixed(2)}s" fill="freeze"/>` : ''}</rect>`;
      g += `<rect x="${f1(sx - 5)}" y="${f1(yBotTab - 16 + dy)}" width="10" height="16" rx="1.8" fill="${tabFill}" stroke="${tabEdge}" stroke-width="1.3">${aC < 0.35 ? `<animate attributeName="y" values="${f1(yBotTab - 16)};${f1(yBotTab - 16 + dy)}" dur="0.25s" begin="-${aC.toFixed(2)}s" fill="freeze"/>` : ''}</rect>`;
      g += `<rect x="${f1(sx - 4)}" y="${f1(yBody0)}" width="8" height="${f1(yBody1 - yBody0)}" rx="1" fill="none" stroke="#FFB52E" stroke-width="1" stroke-dasharray="4 3" opacity=".85"/>`;
    }
    if (k) {
      const d = MEMKIT_D[k], st = slotStatus(t, s), ok = st === 'ok', bCol = ok ? '#45D07F' : '#FFB52E';
      const bh = yBody1 - yBody0;
      g += `<g>${aF < 0.45 ? `<animate attributeName="opacity" values="0.3;1" dur="0.35s" begin="-${aF.toFixed(2)}s" fill="freeze"/>` : ''}`;
      // DRAM packages along the sides of the seated module
      for (let i = 0; i < 8; i++) {
        const cy = yBody0 + 14 + i * ((bh - 34) / 7);
        g += `<rect x="${f1(sx - 5)}" y="${f1(cy - 6)}" width="10" height="12" rx="1" fill="#14181D" stroke="#2D353C" stroke-width=".5"/>`;
      }
      // PCB spine from above
      g += `<rect x="${f1(sx - 3.4)}" y="${f1(yBody0 - 2)}" width="6.8" height="${f1(bh + 4)}" rx="1.5" fill="${d.col}" stroke="${bCol}" stroke-width="1.1"/>`;
      g += `<line x1="${f1(sx)}" y1="${f1(yBody0 + 4)}" x2="${f1(sx)}" y2="${f1(yBody1 - 4)}" stroke="#A8E6C3" stroke-width=".7" opacity=".65"/>`;
      // Closed ejector latches gripping the module ends
      g += `<rect x="${f1(sx - 4.5)}" y="${f1(yTopTab + 2)}" width="9" height="13" rx="1.5" fill="${tabFill}" stroke="${bCol}" stroke-width="1"/>`;
      g += `<rect x="${f1(sx - 4.5)}" y="${f1(yBotTab - 15)}" width="9" height="13" rx="1.5" fill="${tabFill}" stroke="${bCol}" stroke-width="1"/>`;
      // Uniform status badge on the seated module
      g += `<circle cx="${f1(sx)}" cy="${f1(yNotch)}" r="5" fill="${ok ? '#123824' : '#3E2810'}" stroke="${bCol}" stroke-width="1.1"/>`;
      g += ok ? `<path d="M${f1(sx - 2.3)} ${f1(yNotch + 0.2)}l1.6 1.8l3.2 -3.4" fill="none" stroke="${bCol}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<path d="M${f1(sx)} ${f1(yNotch - 2.6)}v3.2M${f1(sx)} ${f1(yNotch + 2.4)}v.5" fill="none" stroke="${bCol}" stroke-width="1.5" stroke-linecap="round"/>`;
      g += `</g>`;
    }
    if (Sim.guide && !k && !open && !memOk(t) && s === nextSlot) {
      g += `<rect x="${f1(sx - 4.5)}" y="${f1(yTopTab)}" width="9" height="${f1(yBotTab - yTopTab)}" rx="2" fill="none" stroke="#7CC4FF" stroke-width="1.2" stroke-dasharray="4 3"/>`;
    }
    // Silkscreen label at the bottom edge of the photo (below the hot zone so the cue ring never crosses it)
    const lCol = k ? (slotStatus(t, s) === 'ok' ? '#45D07F' : '#FFB52E') : sel ? '#7CC4FF' : white ? '#EAF2F7' : '#9FB2C0';
    g += TXT(sx, MB.y + MB.h - 7, s, `font:700 8px var(--font);fill:${lCol}`);
    g += `</g>`;
  });

  // Hot zones for all 16 sockets (width 10 px on 17.75 px centres -> zero overlap between neighbouring rings)
  SLOTS.forEach(s => {
    const sx = mx(SLOT_X[s]), white = WHITE_SLOTS.includes(s), open = t.memOpen[s], k = t.dimms[s], ord = FILL.indexOf(s) + 1;
    const act = k ? 'dimmFit' : open ? 'dimmFit' : 'dimmClip';
    const label = k ? `Socket ${s} (Channel ${CHAN[s]}, #${ord} in Dell's order): ${MEMKIT_D[k].name} seated — click to remove`
      : open ? `Socket ${s} (Channel ${CHAN[s]}, #${ord} in Dell's order): latches open — click to align notch and press ${t.memPick ? MEMKIT_D[t.memPick].name : 'DIMM'} in evenly`
      : `Socket ${s} (Channel ${CHAN[s]}, ${white ? 'white' : 'black'} release tabs, #${ord} in Dell's order): click to open both ejector latches`;
    g += zoneR(act, s, label, sx - 5, yTopTab, 10, yBotTab - yTopTab - 2, 2);
  });

  return g;
}

// Right-top panel: side-view close-up of the focused socket (Dell ISM Figures 43 and 44)
function slotSide(t) {
  const X = 546, Y = 66, W = 340, H = 228;
  const s = t.selSlot || 'A1', white = WHITE_SLOTS.includes(s), open = t.memOpen[s], k = t.dimms[s], ord = FILL.indexOf(s) + 1;
  const pk = k || t.memPick, d = pk ? MEMKIT_D[pk] : null;
  const aC = fxAge('dimmClip:' + s), aF = fxAge('dimmFit:' + s);
  const tabCol = white ? '#F2F0E6' : '#32373D', tabStroke = white ? '#9E9B90' : '#14181C';
  const bodyCol = white ? '#DFDDD3' : '#262A30';

  let g = `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="6" fill="#0B141C" stroke="#2E5571" stroke-width="1.5" pointer-events="none"/>`;
  g += TXT(X + W / 2, Y + 18, `Socket ${s} close-up (Channel ${CHAN[s]}, #${ord} in Dell's fill order)`, 'font:700 11px var(--font);fill:#EAF2F7');
  g += TXT(X + W / 2, Y + 33, `${white ? 'White release tabs (1st socket of Ch ' + CHAN[s] + ')' : 'Black release tabs (2nd socket of Ch ' + CHAN[s] + ')'} · ${k ? 'Seated' : open ? 'Latches open' : 'Latches closed'}`, 'font:500 9.5px var(--font);fill:#9FB2C0');

  // System board PCB and socket base from the side
  const sx = X + 44, sw = W - 88, sy = Y + 178, notchX = sx + sw * 0.44;
  g += R(X + 16, sy + 20, W - 32, 16, '#1B5E3F', 'rx="2" stroke="#12402B" pointer-events="none"');
  g += TXT(X + W / 2, sy + 31, `System board · Silkscreen ${s} (Channel ${CHAN[s]})`, 'font:600 8.5px var(--font);fill:#B9E4CC');

  // The DIMM module: either seated in the socket, or hovering above it when a model is chosen and latches are open
  if (k || (open && d)) {
    const seated = !!k, dy = seated ? 0 : -46;
    const animIn = seated && aF < 0.55 ? `<animateTransform attributeName="transform" type="translate" values="0 -46;0 0" dur="0.42s" begin="-${aF.toFixed(2)}s" fill="freeze"/>` : '';
    const mx0 = sx + 8, mw = sw - 16, my0 = sy - 42;
    g += `<g pointer-events="none" transform="translate(0 ${animIn ? 0 : dy})">${animIn}`;
    // Gold edge fingers with key notch cut-out
    g += R(mx0 + 4, my0 + 38, mw - 8, 8, '#D6AD42', 'stroke="#8A6B1C" stroke-width=".7"');
    for (let i = 0; i < 28; i++) g += `<line x1="${f1(mx0 + 8 + i * ((mw - 16) / 28))}" y1="${my0 + 38}" x2="${f1(mx0 + 8 + i * ((mw - 16) / 28))}" y2="${my0 + 46}" stroke="#7A5E12" stroke-width=".7"/>`;
    g += R(notchX - 4, my0 + 37, 8, 10, '#0B141C');
    // Module PCB body and side notches for the ejector latches
    g += R(mx0, my0, mw, 40, d.col, 'rx="2" stroke="#45D07F" stroke-width="1"');
    g += `<circle cx="${mx0}" cy="${my0 + 22}" r="3.5" fill="#0B141C"/><circle cx="${mx0 + mw}" cy="${my0 + 22}" r="3.5" fill="#0B141C"/>`;
    // DRAM chips and central register/buffer (RCD)
    for (let i = 0; i < 8; i++) {
      if (i === 4) continue;
      const cx = mx0 + 12 + i * ((mw - 24) / 7.5);
      g += R(cx, my0 + 7, 18, 24, '#14181D', 'rx="1.5" stroke="#343D46" stroke-width=".7"');
    }
    g += R(mx0 + mw / 2 - 12, my0 + 5, 24, 28, '#101418', 'rx="1.5" stroke="#5B6770" stroke-width=".8"');
    g += R(mx0 + 16, my0 + 11, 96, 13, '#F2F4F7', 'rx="1.5"') + TXT(mx0 + 64, my0 + 20, d.tag, 'font:700 7.5px var(--font);fill:#14181C');
    if (!seated) {
      // Downward thumb-press arrows at both ends (ISM Figure 44: press down on both ends, not the middle)
      [[mx0 + 18, my0 - 16], [mx0 + mw - 18, my0 - 16]].forEach(([ax, ay]) => {
        g += `<path d="M${ax} ${ay}v11m-4 -4l4 4l4 -4" stroke="#FFB52E" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      });
      g += TXT(X + W / 2, my0 - 20, 'Press down evenly on both ends (not the middle)', 'font:600 8.5px var(--font);fill:#FFB52E');
    }
    g += `</g>`;
  } else if (!d) {
    g += TXT(X + W / 2, Y + 104, t.memBox ? 'Select a supported DDR4 model in the kit (right tray)' : 'Unpack the DIMM kit box in the right tray first', 'font:500 10px var(--font);fill:#C4D3DE');
  } else {
    g += TXT(X + W / 2, Y + 104, `Open socket ${s}'s ejector latches to insert ${d.gb} GB ${d.kind}`, 'font:500 10px var(--font);fill:#FFB52E');
  }

  // Socket body and off-centre alignment key (drawn over the bottom edge of the seated DIMM)
  g += R(sx, sy, sw, 20, bodyCol, `rx="2" stroke="${tabStroke}" stroke-width="1.2" pointer-events="none"`);
  g += R(sx + 6, sy + 3, sw - 12, 6, '#12161A', 'pointer-events="none"');
  g += `<circle cx="${f1(notchX)}" cy="${sy + 6}" r="3.2" fill="${bodyCol}" pointer-events="none"/>`;
  g += TXT(notchX, sy + 16, 'alignment key', 'font:600 7.5px var(--font);fill:#8FA4B5');

  // Left and right ejector latches (ISM Figure 43: open outward to release/insert; Figure 44: snap upright when seated)
  const ang = open && !k ? 30 : 0;
  [[-1, sx - 2], [1, sx + sw + 2]].forEach(([dir, lx]) => {
    const piv = `${f1(lx)} ${sy + 14}`, th = dir * ang, from = dir * (open && !k ? 0 : 30);
    const swA = (aC < 0.4 || (k && aF < 0.5)) ? `<animateTransform attributeName="transform" type="rotate" values="${from} ${piv};${th} ${piv}" dur="0.3s" begin="-${Math.min(aC, aF).toFixed(2)}s" fill="freeze"/>` : '';
    g += `<g pointer-events="none" transform="rotate(${swA ? 0 : th} ${piv})">${swA}`;
    g += `<path d="M${f1(lx - 5)} ${sy + 16}V${sy - 26}h10V${sy + 16}z" fill="${tabCol}" stroke="${tabStroke}" stroke-width="1.2"/>`;
    g += `<rect x="${f1(lx - 7 * dir)}" y="${sy - 22}" width="7" height="6" rx="1" fill="${tabCol}" stroke="${tabStroke}" stroke-width=".9"/>`;
    g += `</g>`;
    if (k && aF < 0.7) g += clickFx(lx, sy - 18, 0.32, aF);
  });

  return g;
}

// Right-middle panel: live Dell R6515 configuration summary and BIOS NPS/speed readout
function popSummary(t) {
  const X = 546, Y = 304, W = 340, H = 152;
  const on = dimmList(t), kinds = dimmKinds(t), ok = memOk(t), pk = (on[0] && t.dimms[on[0]]) || t.memPick, d = pk ? MEMKIT_D[pk] : null;
  const chs = [...new Set(FILL.filter(s => t.dimms[s]).map(s => CHAN[s]))];
  let g = `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="6" fill="#0B141C" stroke="${ok ? '#45D07F' : '#2E5571'}" stroke-width="1.5" pointer-events="none"/>`;
  g += TXT(X + 14, Y + 20, 'Dell R6515 Memory Configuration', 'font:700 11.5px var(--font);fill:#EAF2F7', 'start');
  g += TXT(X + 14, Y + 40, `Selected model: ${d ? d.name : 'none chosen yet'}`, 'font:500 10px var(--font);fill:#C4D3DE', 'start');
  g += TXT(X + 14, Y + 58, `Populated: ${on.length} of 16 sockets · Total: ${memTotalGb(t)} GB`, 'font:600 10px var(--font);fill:#EAF2F7', 'start');
  g += TXT(X + 14, Y + 76, `Bus speed: ${on.length ? `${memSpeed(t)} MT/s (${on.length <= 8 ? '1 DPC, max 3200 MT/s' : '2 DPC, 2933 MT/s'})` : '—'} · Channels: ${chs.length ? chs.join(', ') : 'none'}`, 'font:500 9.5px var(--font);fill:#9FB2C0', 'start');

  const msg = ok ? `Valid Dell configuration (${on.length} × ${d.gb} GB ${d.kind} in ${wantSlots(on.length).join(', ')}). Next: the air shroud, or continue to ${OKN.find(n => n > on.length) || 16} modules.` : memWhy(t);
  const words = msg.split(' '), lines = []; let cur = '';
  words.forEach(w => { if ((cur + ' ' + w).trim().length > 54) { lines.push(cur.trim()); cur = w; } else cur = (cur + ' ' + w).trim(); });
  if (cur) lines.push(cur);
  lines.slice(0, 3).forEach((ln, i) => {
    g += TXT(X + 14, Y + 100 + i * 15, ln, `font:600 9.2px var(--font);fill:${ok ? '#45D07F' : '#FFB52E'}`, 'start');
  });
  if (kinds.length > 1) g += TXT(X + 14, Y + 145, 'Rule: Never mix RDIMM/LRDIMM or different capacities.', 'font:600 8.5px var(--font);fill:#FF8A7A', 'start');
  return g;
}

// Bottom full-width panel: 16-socket map in physical board order (SLOTS_L | CPU 1 | SLOTS_R) with channel & fill order
function popTable(t) {
  const X = 14, Y = 468, W = 872, H = 164;
  let g = `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="6" fill="#0B141C" stroke="#2E5571" stroke-width="1.5" pointer-events="none"/>`;
  g += TXT(X + W / 2, Y + 18, 'Board map & Dell population order (ISM Table 12 & Table 14): click any slot below to inspect in close-up', 'font:700 11px var(--font);fill:#EAF2F7');

  const colW = 47, cpuW = 68, startX = X + 26;
  // CPU 1 divider in the centre between the left 8 sockets and right 8 sockets
  const cpuX = startX + 8 * colW + 4;
  g += R(cpuX, Y + 30, cpuW - 8, H - 42, '#162634', 'rx="4" stroke="#355268" pointer-events="none"');
  g += TXT(cpuX + (cpuW - 8) / 2, Y + 78, 'CPU 1', 'font:700 10.5px var(--font);fill:#EAF2F7');
  g += TXT(cpuX + (cpuW - 8) / 2, Y + 95, 'EPYC', 'font:600 9px var(--font);fill:#9FB2C0');
  g += TXT(cpuX + (cpuW - 8) / 2, Y + 112, '8 ch', 'font:500 8.5px var(--font);fill:#7CC4FF');

  SLOTS.forEach((s, idx) => {
    const cx = idx < 8 ? startX + idx * colW : startX + idx * colW + cpuW;
    const white = WHITE_SLOTS.includes(s), k = t.dimms[s], open = t.memOpen[s], st = slotStatus(t, s), ord = FILL.indexOf(s) + 1, sel = t.selSlot === s;
    const stroke = k ? (st === 'ok' ? '#45D07F' : '#FFB52E') : sel ? '#7CC4FF' : '#2A3F50';
    const fill = k ? (st === 'ok' ? '#123322' : '#382410') : open ? '#2B2412' : '#0E1A24';
    g += `<g${hot('slotPick', s, `Inspect socket ${s} (Channel ${CHAN[s]}, #${ord} in Dell's order)`)}>`;
    g += `<rect x="${cx}" y="${Y + 30}" width="${colW - 4}" height="${H - 42}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${sel ? 1.8 : 1}" class="zone"/>`;
    // Release tab colour pill at top of column
    g += R(cx + 6, Y + 36, colW - 16, 11, white ? '#F2F0E6' : '#262A30', `rx="2" stroke="${white ? '#9E9B90' : '#59626A'}" pointer-events="none"`);
    g += TXT(cx + (colW - 4) / 2, Y + 44.5, white ? 'WHITE' : 'BLACK', `font:700 6.5px var(--font);fill:${white ? '#14181C' : '#C9D0D6'}`);
    // Socket name and Channel
    g += TXT(cx + (colW - 4) / 2, Y + 62, s, 'font:700 11px var(--font);fill:#EAF2F7');
    g += TXT(cx + (colW - 4) / 2, Y + 75, `Ch ${CHAN[s]}`, 'font:600 8.5px var(--font);fill:#9FB2C0');
    g += TXT(cx + (colW - 4) / 2, Y + 88, `Order #${ord}`, `font:600 8px var(--font);fill:${ord <= 4 ? '#45D07F' : ord <= 8 ? '#7CC4FF' : '#9FB2C0'}`);
    // Installed capacity or state
    if (k) {
      const d = MEMKIT_D[k];
      g += TXT(cx + (colW - 4) / 2, Y + 108, `${d.gb} GB`, `font:700 9.5px var(--font);fill:${st === 'ok' ? '#45D07F' : '#FFB52E'}`);
      g += TXT(cx + (colW - 4) / 2, Y + 121, d.rank, 'font:600 8px var(--font);fill:#EAF2F7');
      g += TXT(cx + (colW - 4) / 2, Y + 136, st === 'ok' ? '✓ OK' : '! Fix', `font:700 8.5px var(--font);fill:${st === 'ok' ? '#45D07F' : '#FFB52E'}`);
    } else {
      g += TXT(cx + (colW - 4) / 2, Y + 114, open ? 'OPEN' : 'empty', `font:600 8.5px var(--font);fill:${open ? '#FFB52E' : '#596A78'}`);
    }
    g += `</g>`;
  });

  return g;
}

const POP_HTML_D = `<h3>Population order (Dell ISM, pages 49–52)</h3><table class="dec">` +
  `<tr><td>4 (min)</td><td>A1, A2, A3, A4 (white tabs · Ch D, C, H, G · 3200 MT/s)</td></tr>` +
  `<tr><td>8 (1 DPC)</td><td>A1, A2, A3, A4, A5, A6, A7, A8 (all white · 8 Ch · 3200 MT/s)</td></tr>` +
  `<tr><td>12</td><td>A1–A8 (white) + A9, A10, A11, A12 (black · NPS 2)</td></tr>` +
  `<tr><td>16 (2 DPC)</td><td>A1–A8 (white) + A9–A16 (black · all 16 · 2933 MT/s)</td></tr></table>` +
  `<p class="cap" style="margin-top:6px">White release tabs (A1–A8) are the first socket of each channel and are populated before black release tabs (A9–A16). Mixing capacities or RDIMM/LRDIMM is not supported.</p>`;

Sim.registerView({
  id: 'mem', title: 'Memory: 16 DDR4 sockets, A1 to A16',
  keep: [
    ['16 sockets, 8 channels', 'The AMD EPYC processor drives eight memory channels (A to H), two sockets per channel: A3, A13, A4, A14, A7, A15, A8, A16 on the left of the processor and A12, A6, A11, A5, A10, A2, A9, A1 on the right (ISM Figure 11 & Table 12).'],
    ['White tabs first', 'Sockets A1 to A8 have white release tabs (first socket of each channel) and are populated first in numerical order: A1, A2, A3, A4, A5, A6, A7, A8. Sockets A9 to A16 have black release tabs (second socket of each channel) and follow: A9 to A16 (ISM page 49 & Table 14).'],
    ['Balanced counts', 'Dell ISM page 49 & Table 16: minimum recommended configuration is 4 equal modules (A1, A2, A3, A4 — the 4-DIMM NPS 1 layout). Populate 8 equal modules (A1 to A8, one per channel) to maximize 8-channel bandwidth at 3200 MT/s, or 12 (A1 to A12) or 16 (A1 to A16, 2933 MT/s at 2 DPC).'],
    ['Supported models (Table 13)', 'Five DDR4-3200 models are supported: 8 GB 1Rx8 RDIMM, 16 GB 2Rx8 RDIMM, 32 GB 2Rx8 RDIMM, 64 GB 2Rx4 RDIMM (up to 1 TB), and 128 GB 8Rx4 LRDIMM (up to 2 TB). Mixing capacities or mixing RDIMM and LRDIMM is not supported.'],
    ['Handling (Figures 43 & 44)', 'Wear the ESD wrist strap. Hold the module by its card edges without touching the middle of the module or the gold contacts. Align the edge-connector key with the socket alignment key and press down evenly on both ends until the ejectors click closed.']],
  render(t) {
    if (!t.cpu || !t.memLab) return frame('Memory sockets', `<rect x="120" y="60" width="660" height="110" rx="8" fill="#0E1A24" stroke="#2E5571"/><text x="450" y="100" text-anchor="middle" class="st">Memory sockets: not part of this lab</text><text x="450" y="126" text-anchor="middle" class="ss">The memory goes in during the installation: finish the rack installation, press Continue,</text><text x="450" y="146" text-anchor="middle" class="ss">and it follows the processor and the heat sink.</text>`, 220);
    const c = t.cpu;
    if (c.cover !== 'off' || c.shroud === 'in') {
      let g = `<rect x="120" y="60" width="660" height="120" rx="8" fill="#0E1A24" stroke="#2E5571"/>`;
      g += TXT(450, 102, c.cover !== 'off' ? 'The system cover is still on.' : 'The air shroud covers the memory sockets.', 'font:600 15px var(--font);fill:#EAF2F7');
      g += TXT(450, 130, 'Open the Inside view first: put on the ESD wrist strap, remove the cover, and lift the air shroud out.', 'font:400 12px var(--font);fill:#C4D3DE');
      g += TXT(450, 154, 'Never remove or install memory modules while the air shroud is in place.', 'font:400 11.5px var(--font);fill:#FFB52E');
      return frame('Memory: 16 DDR4 sockets, A1 to A16', g, 240);
    }
    const g = memBand(t) + slotSide(t) + popSummary(t) + popTable(t);
    return frame('Memory: 16 DDR4 sockets, A1 to A16', g, 646);
  },
  actions(t) {
    if (!t.cpu || !t.memLab) return [];
    const c = t.cpu, a = [];
    if (!c.esd) a.push(button('Put on the ESD wrist strap', 'esd', '', true));
    if (!t.memBox) a.push(button('Unpack the DIMM kit box on the antistatic mat', 'memBox', '', true));
    if (memOk(t) && !SLOTS.some(s => t.memOpen[s]) && c.shroud === 'out') {
      a.push(button('Return to Inside view to reinstall the air shroud', 'go', 'inside', true));
    }
    return a;
  },
  tray(t) {
    if (!t.cpu || !t.memLab) return '';
    const on = dimmList(t), kinds = dimmKinds(t), mixed = kinds.length > 1;
    let h = `<h2>Antistatic mat: Dell DDR4 kit (ISM Table 13)</h2>`;
    if (!t.memBox) {
      h += `<p class="cap" style="font-size:12.5px;margin:0 0 8px">Five Dell-supported DDR4-3200 memory models (Table 13, page 48) are packed in electrostatic-discharge cages. Open the kit box on the antistatic mat before handling.</p>`;
      h += `<div class="acts">${button('Open the DIMM kit box', 'memBox', '', true)}</div>`;
    } else {
      h += `<p class="cap" style="font-size:12.5px;margin:0 0 6px">Choose one supported DDR4-3200 model from Table 13 (do not mix models in the system):</p>`;
      DIMMK.forEach(k => {
        const d = MEMKIT_D[k], pick = t.memPick === k, used = on.filter(s => t.dimms[s] === k).length, badMix = mixed && used > 0 && k !== t.memPick;
        const st = (pick ? `<span class="pill on" style="margin-top:4px">&#10003; Fitting next</span> ` : '') + (badMix ? `<span class="pill" style="color:var(--red);border-color:var(--red);margin-top:4px">Mixed: remove</span>` : '');
        const btn = !pick ? button('Fit this model', 'memModel', k) : '';
        h += `<div class="item" style="padding:8px 10px;margin-top:7px;border:${badMix ? '2px solid var(--red)' : pick ? '2px solid var(--touch)' : '1px solid var(--line)'};border-radius:8px"><span><b>${esc(d.name)}</b><small style="font-family:var(--mono)">${esc(d.tag)} · ${d.v}</small><small>${esc(d.org)} · 3200 MT/s (1 DPC) / 2933 MT/s (2 DPC)</small><small>${t.memLeft[k]} on the mat${used ? `, ${used} in the server` : ''}</small>${st}</span><span style="flex:none;white-space:nowrap">${btn}</span></div>`;
      });
    }
    return h + POP_HTML_D;
  }
});

/* ---- Memory handlers ---- */
Sim.on('slotPick', s => {
  if (!T.cpu || !T.memLab || !SLOTS.includes(s)) return;
  T.selSlot = s; Sim.sound('pick');
  const ord = FILL.indexOf(s) + 1, k = T.dimms[s];
  say('info', `Socket ${s} (Channel ${CHAN[s]}, ${WHITE_SLOTS.includes(s) ? 'white' : 'black'} release tabs, #${ord} in Dell's population order): ${k ? MEMKIT_D[k].name + ' seated.' : T.memOpen[s] ? 'ejector latches open.' : 'empty, latches closed.'}`);
});

Sim.on('memBox', () => {
  if (!T.cpu || !T.memLab) return;
  if (T.memBox) return say('info', 'The DIMM kit box is already open on the antistatic mat.');
  T.memBox = true; Sim.sound('tab');
  say('ok', 'DIMM kit box opened on the antistatic mat. Choose one of the five supported Dell PowerEdge R6515 DDR4-3200 memory models (ISM Table 13): 8 GB 1Rx8, 16 GB 2Rx8, 32 GB 2Rx8, 64 GB 2Rx4 RDIMM, or 128 GB 8Rx4 LRDIMM.');
});

Sim.on('memModel', k => {
  if (!T.cpu || !T.memLab || !MEMKIT_D[k]) return;
  if (!T.memBox) return bad('Open the DIMM kit box on the antistatic mat first.');
  T.memPick = k; Sim.sound('pick');
  const d = MEMKIT_D[k], on = dimmList(T);
  if (on.length && on.some(s => T.dimms[s] !== k)) {
    return say('warn', `Selected ${d.name}. Note: ${on.map(s => `${s} (${MEMKIT_D[T.dimms[s]].gb} GB)`).join(', ')} already holds a different model — Dell ISM page 49 does not support mixing capacities or RDIMM/LRDIMM in the same system.`);
  }
  say('ok', `Selected ${d.name} (${d.org}, ${d.v}, 3200 MT/s at 1 DPC, 2933 MT/s at 2 DPC; max ${k === 'l128' ? '2 TB' : k === 'r64' ? '1 TB' : (d.gb * 16) + ' GB'} in 16 sockets). Populate in Dell's order starting at A1, A2, A3, A4.`);
});

Sim.on('dimmClip', s => {
  const c = T.cpu; if (!c || !T.memLab || !SLOTS.includes(s)) return;
  if (c.cover !== 'off' || c.shroud === 'in') return bad('Remove the system cover and lift out the air shroud before touching the memory sockets.');
  if (!c.esd) return bad('Put on the ESD wrist strap and clip it to bare chassis metal before touching memory sockets or modules.');
  T.selSlot = s;
  if (T.dimms[s]) return say('info', `Socket ${s} holds a ${MEMKIT_D[T.dimms[s]].name}. Click the module to release its latches and lift it out.`);
  T.memOpen[s] = !T.memOpen[s]; fxMark('dimmClip:' + s); Sim.sound(T.memOpen[s] ? 'clipOpen' : 'clip');
  const ord = FILL.indexOf(s) + 1;
  say(T.memOpen[s] ? 'ok' : 'info', T.memOpen[s]
    ? `Socket ${s} (Channel ${CHAN[s]}, ${WHITE_SLOTS.includes(s) ? 'white' : 'black'} release tabs, #${ord} in Dell's order): both ejector latches pressed outward. Align the DIMM edge-connector notch with the alignment key and press down evenly at both ends.`
    : `Socket ${s}: ejector latches closed.`);
});

Sim.on('dimmFit', s => {
  const c = T.cpu; if (!c || !T.memLab || !SLOTS.includes(s)) return;
  if (c.cover !== 'off' || c.shroud === 'in') return bad('Remove the system cover and lift out the air shroud first.');
  if (!c.esd) return bad('Put on the ESD wrist strap before handling DDR4 memory modules.');
  T.selSlot = s;
  // Removing an already-seated module back to the antistatic mat
  if (T.dimms[s]) {
    const k = T.dimms[s], d = MEMKIT_D[k];
    T.dimms[s] = null; T.memLeft[k]++; T.memOpen[s] = true; fxMark('dimmClip:' + s); Sim.sound('clipOpen');
    return say('info', `${d.name} released from socket ${s} by pressing both ejectors outward and returned to the antistatic mat.${memOk(T) ? ' Current configuration is balanced and valid.' : ''}`);
  }
  if (!T.memBox) return bad('Open the DIMM kit box on the antistatic mat first.');
  if (!T.memPick) return bad('Choose a supported DDR4 memory model in the kit (right tray) before inserting a module.');
  if (!T.memOpen[s]) return bad(`Socket ${s}'s ejector latches are closed: open both ejector latches outward before inserting the memory module (ISM Figure 43).`);
  const k = T.memPick, d = MEMKIT_D[k];
  if (T.memLeft[k] <= 0) return bad(`No more ${d.name} modules left in the kit.`);
  T.dimms[s] = k; T.memLeft[k]--; T.memOpen[s] = false; fxMark('dimmFit:' + s); Sim.sound('dimm', 0.32);
  const on = dimmList(T), n = on.length;
  if (memOk(T)) {
    return say('ok', `${d.name} seated in ${s} (Channel ${CHAN[s]}): aligned with the key, pressed evenly on both ends until both ejectors snapped upright (${n} × ${d.gb} GB = ${memTotalGb(T)} GB at ${memSpeed(T)} MT/s). Balanced ${n}-DIMM configuration complete — reinstall the air shroud in the Inside view, or continue populating up to ${OKN.find(x => x > n) || 16} sockets.`);
  }
  const st = slotStatus(T, s);
  if (st === 'bad') {
    return say('warn', `${d.name} seated in ${s}, but ${memWhy(T)}`);
  }
  say('ok', `${d.name} seated in ${s} (Channel ${CHAN[s]}, #${FILL.indexOf(s) + 1} in Dell's order): both ejectors clicked closed. ${memWhy(T)}`);
});
Sim.every(() => { if (Sim.view === 'mem' && T && T.cpu && SLOTS.some(s => { const a = Math.min(fxAge('dimmClip:' + s), fxAge('dimmFit:' + s)); return a > 0.45 && a < 1.2; })) render(); }, 250);
