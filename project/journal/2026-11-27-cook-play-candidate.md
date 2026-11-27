# 2026-11-27: cook-play candidate follows the producer pin

- Meta QA68. Every cook-play partition died at import: the candidate
  engine was a hand-typed 11-16 commit (9c487655, engine 0.1.31) whose
  exports predate `./host/headlessFolder`, which SDK 0.9.1 imports.
  `continue-on-error` on both jobs kept the run green.
- The candidate now defaults to the exact commit behind the producer's
  engine pin (`src/scripts/pinned-engine-commit.mjs`: npm next's
  gitHead for a `-next.<sha>` pin, the `vX.Y.Z` tag for a release),
  passed from the producer job to cook-play as a job output. A
  dispatch input still overrides it.
- Both jobs drop `continue-on-error`, so a red now shows red.
- Preview dispatch with 922b9d45 on the old main (run 46084750481):
  producer and all three partitions green.
