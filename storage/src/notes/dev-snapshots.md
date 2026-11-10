---
title: Snapshots in development
related: [snapshots]
---

Development has a single snapshot, `dev`. Every dev session writes it again after each change. Look at `json-storage/` while `pnpm dev` runs: `dev.commit.json` and `dev.entries.json` change, and no other file appears.
