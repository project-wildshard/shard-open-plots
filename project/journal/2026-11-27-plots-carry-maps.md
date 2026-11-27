# The open plots build on the SDK that keeps images (SF9)

SDK 0.9.0 composes each plot's discovery from its output manifest. The
candidate forced each minimap to `/assets/<slug>/map/top.webp`, a copy only
the retired public publish wrote, and refused every plot because no plot
mounts it. The SDK patch names a plot's generated map blob there instead
(sharddev `fix(build): name an output's map as its blob`), so the plots
carry no copy of their maps.

QA 28's two kit hook fixes are stamped by hand (repo-kit 4d6a2612c4 and
7e9e964052), with no full kit apply.

The bulk pins SDK 0.9.1 exactly (npm `next`; `latest` is still 0.8.1),
with engine 0.1.100-next.922b9d45 and format 0.82.4. `wildshard migrate`
ran 0.9.0 in a scratch clone, since another lane's untracked `public/`
sits in this checkout, and only GUIDE.md and the stamp changed.
