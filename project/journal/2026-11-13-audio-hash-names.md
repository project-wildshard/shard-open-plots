# Recordings named by their encoded bytes (SH-ALL-15)

Moving open-plots to engine 0.1.18 and sdk 0.2.12 made `build:shards`
refuse. The audio section of each built plot,
`sections/audio/audio.json`, still named recordings such as
`/assets/sfx/desert-ruin/ambience-9e8220262258.m4a`. Since sdk 0.2.11
(AU21), the build re-encodes every source recording it finds above its
targets. It then renames the result to the hash of the encoded bytes,
so a returning player never gets new bytes under an old URL. The sdk
rewrites names inside JSON mounts, but the audio section is compiled
from `data/audioBindings.json` and the templates before that rename,
so the guard `assertNoRenamedAudioNames` stops the build.

The fix is on the data side, not in the sdk. Encoding happens once,
in the repo, instead of on every build:

- I ran the sdk's own `encodeMountAudio`, with this repo's stereo
  marks, over all 148 recordings under `public/assets`. 112 came back
  with new bytes.
- Each of those 112 is now stored as the encoded file, under its new
  hash name, and the old file is gone.
- Every file name was rewritten across the 27 JSON files that use them:
  the `sfx.json` files, `audioBindings.json`, six templates,
  `mounts.json` and `outputs.json`.

Running the same encode again now keeps all 148 recordings and renames
none. The audio is 21.7 MB before and 18.5 MB after.

`pnpm check`, `test:shards` (55 tests) and `build:shards` (18 folders)
pass. The 20 s timeout in `open-plots-no-beams` seen once was machine
load (load average about 20) and did not come back.

The one-entry `packageExtensions` for `assemblyscript` stays until an
engine release lists it in `dependencies`.
