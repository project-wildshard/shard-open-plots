# TS16d cache exclusion: landed, timing bar unmet

> Written by: Codex (codex-ts16d)
> **State:** measured, 2026-11-13.

The coordinator assigned the cache exclusion in meta
`docs/plans/HOW-WE-BUILD-PLAN.md` TS16d. It already landed in
`8cd0222`: both workflow keys exclude `src/shards/**/*.test.ts`.
`f4e4abf` guards matching keys and the absence of test-file build
inputs. No workflow edit is needed.

Re-measured the first five green main push runs starting with the
exclusion's landing, attempt 1 in every case. Wall is the earliest
job start to the latest job completion, including inter-job queue
time but excluding the initial runner queue. Source: GitHub Actions
`repos/project-wildshard/shard-open-plots/actions/runs/<run>/jobs`.
Cache hits are identified by the skipped fresh-preparation upload.

| Commit | Run | Wall (s) | Products build (s) | Preparation |
| --- | --- | ---: | ---: | --- |
| `8cd0222` | 43334826720 | 440 | 253 | miss |
| `069c8b0` | 43335920883 | 345 | 176 | hit |
| `37c1712` | 43343188277 | 545 | 353 | miss |
| `936d6eb` | 43359890709 | 497 | 273 | miss |
| `bf47e41` | 43378780314 | 564 | 341 | miss |

Median 497 s (8 min 17 s), range 345-564 s: the 420 s target is
unmet. Four misses include the new key's first population and three
dependency-pin changes. This mixed sample does not isolate the
exclusion's speed benefit. The following test-comment-only push,
`069c8b0`, does reuse the cache. Each sampled run has one products
build and one Ring 2 play job; the later SA40 `build-twice` job is
outside this sample. TS16d keeps its unmet timing bar in meta.

Validation: both preparation-key guards pass, and actionlint passes
for `.github/workflows/ci.yml` and `ring-2-prepare.yml`.
