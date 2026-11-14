# SA11: Open Plots shard text

> Written by: Claude

J317 retires `product` from author-facing names (meta
SHARD-AUTHORING SA11, same conventions as shard-pine-hollow `7e6e505`).
`generators/product.ts` is now `generators/shardfile.ts`; its default
declaration, the project's default build, is `defaultShardfile`. One
idea row is one output, keyed by its output slug, in comments, tests,
`outputs.json`'s `why` and the README.

Kept: the path `docs/plans/codex-2026-11-08-product-coverage.md` (a
real file's name); the engine's headless loader names and `product`
keys in the CI proofs every shard repo shares; `test/lift-disposition.json`
records. Those change with SA23 / SA25 across all shard repos at once.

`pnpm test` and `pnpm check` pass. A generator edit makes the hero
stale; the revision pass rebuilds it. No upload.
