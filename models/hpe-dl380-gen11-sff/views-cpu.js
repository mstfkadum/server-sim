/* ---- Processors: socket 2 close up (top view, front of the server at the bottom, as on the service label), the steps
   with their progress, and the antistatic mat with the processor heatsink module base up, the work spot and the tool
   tray. The same hands-on flow for a new install (the new build) and for a replacement (views-cpurep.js): the processor
   is clicked into the carrier on the heatsink, triangle to triangle, the module goes onto the bolster plate guide
   posts, the anti-tilt wires are clipped, and the four T-30 Torx screws are tightened in a cross order to 0.9 N·m. ---- */
const BAND = { x0: 60, y0: 860, x1: 1290, y1: 1420 };
const bandImg = id => `<defs><clipPath id="${id}"><rect x="${BAND.x0}" y="${BAND.y0}" width="${BAND.x1 - BAND.x0}" height="${BAND.y1 - BAND.y0}"/></clipPath></defs><image href="${IMG.hpBand}" x="${BAND.x0}" y="${BAND.y0}" width="${BAND.x1 - BAND.x0}" height="${BAND.y1 - BAND.y0}"/>`;
// the socket 2 close-up: W x 110..712, y 862..1420
const CZ = { x0: 110, y0: 862, x1: 712, y1: 1420, s: 0.86, ox: 14, oy: 46 };
const czT = `translate(${CZ.ox} ${CZ.oy}) scale(${CZ.s}) translate(${-CZ.x0} ${-CZ.y0})`;
const czXY = (x, y) => [CZ.ox + (x - CZ.x0) * CZ.s, CZ.oy + (y - CZ.y0) * CZ.s];
const CZW = (CZ.x1 - CZ.x0) * CZ.s, CZH = (CZ.y1 - CZ.y0) * CZ.s;

Sim.registerView({
  id: 'cpu', title: 'Processors',
  keep: [
    ['Socket 1 always', 'Processor socket 1 must always be populated, or the server does not work. Both processors must have the same part number.'],
    ['Fragile pins', 'The socket and processor pins are very fragile. Never touch them. A damaged socket means replacing the system board.'],
    ['Empty sockets', 'An unused socket keeps its socket cover and the processor blank, for the airflow and to protect the pins.'],
    ['New heatsink', 'It comes with the processor carrier fitted and the thermal pad pre-applied under a protective film. Peel the film, do not touch the pad, and use no grease and no cleaning.'],
    ['Seat the module', 'Wires vertical. Hold the module by its base plate edges and lower it straight onto the bolster plate guide posts, the heat pipes toward the front. The posts are keyed: it fits one way only. Then clip the wires.'],
    ['Torque', 'T-30 Torx, 0.9 N·m (8 in-lb), printed on the heatsink label. Tighten in a cross order: one screw, then the one diagonally opposite, then the other pair.'],
    ['Hot parts', 'Let the heatsinks cool before touching them: at least 5 minutes after the server ran.'],
    ['Replacing a processor', 'Wires up to vertical, screws loosened in a cross order (one, then the one diagonally opposite), the module lifted with the processor still attached. On the mat, base up: pull the release lever (the processor rises), press the small clips and lift it out by its edges.'],
    ['Reuse the heatsink', 'Clean the old grease off the copper base with the HPE-recommended kit (alcohol wipes, then a lint-free cloth) until it is shiny. Never a dry paper towel: it smears and leaves fibres. Apply the whole syringe of new grease on the new processor\'s lid, in the kit\'s pattern.'],
    ['Pin 1 to pin 1', 'The gold triangle on the processor goes to the triangle on the carrier. Close the release lever first, then push the processor in until it clicks.']],
  render(t) { return repRender(t); },
  actions(t) { return repActions(t); },
  tray(t) { return repTray(t); }
});
