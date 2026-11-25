/** Serialized into the page: show or hide grid cells for the plot-mask frames, never the floor or roads.
 * Engine names each cell's content `grid-cell:<instance>` (far proxy and impostor included), its haze holder
 * `grid-band:grid-cell:<instance>`, and an entered cell's world `region:<instance>` (engine
 * src/client/game/grid/session.ts, regionalView.ts). The cover code sets `visible` back on release and refresh, so
 * the rule runs again in every late frame, after updates and before the draw.
 * Modes: `off` (as played; restores only what this hid), `others` (every cell but `instance`), `all` (every cell).
 * @param {string} instance */
export function installNeighbourMask(instance) {
  const api = window.__wildshard, game = api.requireWorld().game;
  const owner = name => {
    for (const prefix of ['grid-band:grid-cell:', 'grid-cell:', 'region:']) if (name.startsWith(prefix)) return name.slice(prefix.length);
    return null;
  };
  const ours = new Set();
  const mask = {
    instance, mode: 'off', last: { mode: 'off', hidden: [], kept: [] },
    set(mode) { mask.mode = mode; apply(); },
  };
  const apply = () => {
    const hidden = new Set(), kept = new Set();
    if (mask.mode === 'off') { for (const child of ours) child.visible = true; ours.clear(); }
    else for (const child of game.scene.children) {
      const cell = owner(child.name);
      if (cell === null) continue;
      if (mask.mode === 'others' && cell === instance) { kept.add(child.name); continue; }
      if (child.visible) { child.visible = false; ours.add(child); }
      hidden.add(cell);
    }
    mask.last = { mode: mask.mode, hidden: [...hidden].sort(), kept: [...kept].sort() };
  };
  window.__plotNeighbourMask = mask;
  game.onLate(apply, 'harness.plot-mask');
}
