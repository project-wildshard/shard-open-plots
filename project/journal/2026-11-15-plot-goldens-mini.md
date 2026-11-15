# 2026-11-15: plot goldens run again, 15 boards on 5e5b0b0 (SHARD-REPOS SH-ALL-11)

- The capture could not start: `scripts/capture-plot-domes.mjs` still imported six engine helpers by their pre-lift
  local paths, the repo never declared `playwright`, and the menu now stops on the name prompt. Imports now point at
  `@wildshard/engine` (two by `node_modules` path, as `capture.mjs` already does, because engine's exports leave them
  out), `playwright` 1.65.0 is a devDependency (engine's pin), and `capture.mjs` seeds `NAME_ASKED`.
- Still open in engine: its published scripts import `playwright` with it only in devDependencies, so the store copy
  can't resolve it. This run used a node `--import` resolve hook pointing `playwright` at this repo's copy.
- 15 of 18 plots shot on the Mac mini (build `5e5b0b0-mwiamjy8`). Every plot's own content matches its golden in all
  eight views; views 3 and 4 (and night-market 1) score low because the goldens show bare grid floor or other
  neighbours where this build serves populated plots. Scores and boards: `art/goldens/README.md` Runs.
- Not served by the build: desert-ruin and thin-ice (no single served cell) and showcase-template (no `shard.json`).

## mini-goldens, later the same day

- Views 3 and 4 (and Night Market 1) were low or RED only beyond the plot edge: J305 moved the neighbours (Nine Dragon's
  towers now stand behind Night Market). Re-baselining would go red again at the next layout change; hiding the other
  cells alone shows a plot floating over sky (the old grid floor belonged to a neighbour cell). So NOW stays the frame
  as played, and each view also shoots other-cells-hidden and every-cell-hidden frames; engine's board.py (`fcd8c7f7` on
  `plan/mini-goldens`, landing) scores only where they differ. `--no-mask` keeps whole-frame scoring.
- All 15 plots rerun on `a38e4f7-mwieo8k8` with the mask: 14 are 8/8 green and views 3 and 4 gate everywhere. The mask
  surfaced four stale road-entry goldens (pre-G992 relight, pre-OP26 entry board; refreshed, as 11-03 did for the other
  views) and Frostline's far peak, which now draws snow-capped (red until its owner rules). desert-ruin and thin-ice are
  off the grid by J305 and showcase-template is retired by DEL3: decisions, not harness faults.
