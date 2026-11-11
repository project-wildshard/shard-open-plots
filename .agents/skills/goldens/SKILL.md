---
name: goldens
description: Re-shoot an open plot's 8 golden views on a build and compare them against its known-good goldens in art/goldens/<plot>/, as a scored GOLDEN · NOW board, reading every row and marking red views. Use for "goldens", "golden images", "re-run the goldens", "regression check", "did this break the look", "before landing a kit / landmark / layout / generator / plot sky change", "is plot X ready for QA", or any claim that a change is pixel-identical. Not for new mockups or memory / fps readings.
---

# Goldens: open plots

> Written by: Claude (opus-k9, REPO-KIT K9, 2026-11-11). Jake, 2026-11-11 (J273): "goldens has to go into each
> major shard": this shard runs its own goldens.

The frames are this repo's: `art/goldens/<plot>/` (`<n>-<view>.jpg`, `cameras.json`, the scored `board.jpg`) for all
18 plots in `scripts/open-plots/plots.json`; `art/goldens/README.md` is the source and update log. The capture is this
repo's `scripts/goldens/capture.mjs` (the dome harness's free camera, real grid entry and settled residency reader). The
board, preview server and browser lane are engine's, from the sibling checkout `../engine`. The rules (what counts as
a look change, how a golden is updated) are in engine `docs/goldens.md`.

## 1. Find the set

```bash
PLOT=night-market ENGINE=$(cd ../engine && pwd)
ls art/goldens/$PLOT/                 # 1-road-entry.jpg … 8-far-corner.jpg, cameras.json, board.jpg
```

Never tell anyone a plot has no goldens without running that `ls`.

## 2. Serve a build that carries this shard

The game is engine's build of the pinned shard products; your change reaches it only once engine pins it (this repo's
`docs/dev.md`, J198 prepared publications, then the pin bump in an engine worktree). Until then, capture the pinned
build and say so.

```bash
URL=$(cd $ENGINE && SERVE_OWNER=goldens-$PLOT scripts/serve-build.sh --head --name goldens-$PLOT --hours 1)
PORT=${URL##*:}; PORT=${PORT%/}
```

## 3. Capture the 8 views and build the board

```bash
RUN=tmp/goldens/$(date +%F)-$PLOT                 # must be a new directory under ./tmp
$ENGINE/scripts/browser-lane.sh --max 20 node scripts/goldens/capture.mjs --plot=$PLOT --base=$URL --out=$RUN
```

It captures eight views (`$RUN/raw/$PLOT/<n>-<view>.png`), then runs engine's `scripts/goldens/board.py --goldens
art/goldens --plot $PLOT` for the scored GOLDEN · NOW board in `$RUN/board/`. Python needs Pillow and NumPy
(`--python=<interpreter>`); `--board=<path>` points at another board.py. Plot-local poses follow the plot's current
served cell, with old and new grid origins in `$RUN/capture.json`.

## 4. Read every row

**Open every `$RUN/board/<n>-<view>.jpg` with the Read tool, all 8.** Red = NOW lost or gained something the change
didn't mean to: a landmark, building or prop missing, a hole, black or blank areas, seams, exposure or colour shift, LOD
or texture pops. `UNREVIEWED` and SSIM never mean green. Burn the verdict in with
`python3 $ENGINE/scripts/goldens/board.py --goldens art/goldens --plot $PLOT --now $RUN/raw --out $RUN/board --red 3,4`.

## 5. Report, land, clean up

- **Any red view: don't land.** Fix and re-capture, or, for a look change Jake ruled on, replace those views' frames
  in `art/goldens/$PLOT/` from `$RUN/raw` and add a line (date, views, ruling) to `art/goldens/README.md`.
- Green: commit `$RUN/board/board-$PLOT.jpg` as `art/goldens/runs/<date>-<sha10>-$PLOT-board.jpg` by pathspec, with
  `Goldens: $PLOT 8/8 green on <build id>` in the body.
- Report the run, green / red counts, each red view in one line, and the board path. Show Jake the board, not SSIM.
- `(cd $ENGINE && scripts/serve-build.sh stop $PORT)`, then `rm -rf` the exact `$RUN` path.
