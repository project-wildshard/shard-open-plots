# 2026-11-27 One producer pin rule for the cook-play partitions

Meta QA 11-26 row 65's candidate run (cooked-products-contract 46080021429, engine b9d31dbf) went green, but only
because cook-play is `continue-on-error`: all three partitions failed at once. cook-play matched the producer report's
version as `X.Y.Z` only, while the producer check already admits npm next's exact `X.Y.Z-next.<sha>`; the SDK pin has
been `0.1.100-next.922b9d45` since the images-only re-pack, so every run since (push 719ce71 too) was quietly red.
Both now read `PRODUCER_PIN` from `candidate-engine-source.mjs`, and `ci21-candidate-source.test.mjs` pins what it
admits.
