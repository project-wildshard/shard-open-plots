# Held tools: retire or rewire (opus-held125, meta QA 11-25 row 126)

- `night-market-kit-budget.mjs` is retired here: engine owns it with its test (`lift-disposition.json` says
  moved-engine), and this copy imported three engine modules a shard never has.
- `open-plots/ob2.mjs` reads the built product through the sdk's exported `headless/scripts/built-folder.mjs`
  (`readBuiltShardfile`), not a `build-shardfiles.mjs` that exists nowhere. Run with the sdk's bake loader, it now
  reaches the sdk and asks for a build when none is there.
- `scripts/blender/` moved to `src/blender/`: the 29 Blender scripts keep their depth, so their relative paths hold,
  and the manifest kept only the 30 `open-plots/*` targets (the other 13 were the old monorepo's). The SDK's
  `build.sh` reads `src/blender/targets.json` (sharddev 220ea7e7, next SDK publish).
- The script-paths baseline is empty.
