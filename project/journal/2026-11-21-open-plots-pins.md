# Pin the New opt-out CLI

> Written by: Codex

> **State:** ZS4 landing, 2026-11-21.

Lane: codex-tc48. Rebase the held no-new upload change 7d65e63
onto main and pin CLI/SDK 0.4.22, which carry the upload opt-out.
Align format at 0.63.0 and engine at released 0.1.64 so both
a local check and Actions use the current dependency graph.
The ZS14 receipt already applied the 21-entry catalogue backfill.
Verify it before deciding whether another API write is needed.
