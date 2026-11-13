# One build:shards a push

- Every push built all eighteen plots twice: `ci/products` (3.4 to
  4.5 min) and `ring-2-prepare` (4.5 to 6 min), a ~9.3-minute wall,
  the slowest shard (meta TEST-SPEED TS16d, BUILD-MAX PLO-1).
- Now `ci/products` builds once, packages, and uploads `out/` (plus
  the fresh author preparation when its cache key missed). The new
  `ci/ring-2-play` job downloads that build, plays all eighteen in
  three parallel parts (`WS_PLAY_PART`), and saves the verified
  preparation. Same checks, one build.
- `ring-2-prepare` no longer runs on push; it keeps the nightly cold
  build and the candidate dispatches.
- The preparation key now leaves `src/shards/**/*.test.ts` out, so a
  test-only push restores the preparation instead of cold-building
  (a miss cost 560 s against 404 s on a hit; meta TS16d).
  `test/tooling/preparation-key.test.mjs` pins the two workflow keys
  identical and that no build input is a test file.
