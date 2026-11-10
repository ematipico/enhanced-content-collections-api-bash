---
title: How storage drivers work
related: [configuration, snapshots]
---

This note is kept in a JSON file by `src/drivers/json-files/driver.ts`, a driver written in this project. Its related docs are kept in SQLite, and listed below without their content.

## From the config to the server

`content.config.ts` isn't part of the server bundle, so a collection can't hold a driver instance. It holds a **storage descriptor** instead: plain data saying which module creates the driver, and with which options.

```ts
storage: jsonFiles({ dir: './json-storage' })

// returns:
({
  entrypoint: new URL('./driver.ts', import.meta.url),
  config: { dir: './json-storage' },
})
```

The `config` is written into the server bundle, so it must never contain secrets: a driver reads them itself, for example with `getSecret()` from `astro:env/server`.

The entrypoint's default export creates the driver from that `config`. Astro loads it through Vite in both places a driver runs: during sync, while the build writes collections, and in the built server, which bundles it.

## Why `openWriter()` and `openReader()`

Writing and reading happen at different times, often in different processes, and sometimes on different machines or runtimes:

- **Writing happens once, at the end of sync.** Loaders still fill Astro's in-memory store, as without a driver. When sync is done, Astro calls `openWriter({ snapshot, dev })`, then `write()` once per collection with every entry, then `commit()`.
- **Reading happens wherever pages are rendered**: while prerendering, and in the deployed server for pages rendered on demand. Astro calls `openReader({ snapshot })` on the first read, then `get()` for one entry or `entries()` for a collection.

Keeping them apart gives each side what it needs:

- **A reader never sees a half-written snapshot.** Nothing written is visible until `commit()` resolves. This driver writes the entries first, and then a small commit file: a snapshot only exists once that file does.
- **Readers stay simple.** A reader only answers lookups in one committed snapshot, so it never needs write access, and can load what it needs when it opens: this driver reads the snapshot's entries file once, in `openReader()`.
- **The two sides can run in different places.** A build machine writes, and a server, possibly on another runtime, reads.

## What Astro stores

Each entry reaches the driver as two strings Astro serializes: `metadata`, with everything but the content, and `content`, with `body` and `rendered`. Drivers store them as they are. With `getCollection({ name, content: false })`, readers are asked for entries without content, so they can skip loading it altogether, like this driver's `select()`.

## Optional methods

- `createSnapshotId()` names build snapshots, for example after a deployment ID. This driver returns `build-<date>`.
- `listSnapshots()` and `deleteSnapshot()` let integrations delete old snapshots in `astro:build:done`, as `keep-snapshots` does.

`pnpm test` runs `createStorageDriverTests()` from `astro/content/storage-driver-tests` against this driver: the checks every driver must pass.
