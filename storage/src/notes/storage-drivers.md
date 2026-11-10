---
title: How storage drivers work
related: [configuration, snapshots]
---

A storage driver is a small piece of code that knows how to save entries in one kind of storage, and read them back: a database, a folder of files, and so on. This note is saved by `src/drivers/json-files/driver.ts`, a driver that lives in this project and keeps entries in JSON files. The docs listed below are saved by a different driver, in a SQLite database.

## How Astro finds the driver

Your content config doesn't end up in the site Astro builds, so you can't put a running driver in it. Instead, you give Astro a short note saying which file contains the driver, and which options to give it:

```ts
storage: jsonFiles({ dir: './json-storage' })

// jsonFiles() returns:
({
  entrypoint: new URL('./driver.ts', import.meta.url),
  config: { dir: './json-storage' },
})
```

Astro copies those options into the site it builds, so never put passwords or tokens in them. A driver that needs a token reads it itself, with `getSecret()` from `astro:env/server`.

## Why saving and reading are separate

Astro saves your entries and reads them at different moments, often in different programs, sometimes even on different computers:

- **Saving happens once per build.** Astro gathers all your entries first, then calls `openWriter()`, hands over each collection with `write()`, and finishes with `commit()`.
- **Reading happens whenever a page needs an entry**: while building pages, or later, on the server, when someone visits. Astro calls `openReader()` once, then `get()` for one entry or `entries()` for a whole collection.

Splitting the two keeps each side simple:

- **A page never sees a half-saved copy.** Nothing counts as saved until `commit()` finishes. This driver writes the entries first, and a tiny "done" file last: until that file exists, the copy doesn't exist either.
- **Reading never changes anything.** A reader only looks things up, so it doesn't need permission to write. This driver loads the whole file once, when it opens.
- **Each side can run somewhere else.** Your laptop or a build server can save the entries, while a server somewhere else reads them.

## What gets saved

Each entry arrives as two pieces of text that Astro prepares: one with its data, like the title, and one with its content, like the text and HTML. The driver saves them as they are. When a page only needs the data, for example a list of titles, it asks with `content: false`, and the driver can skip loading the content.

## Extras a driver can add

- `createSnapshotId()` picks the name of each build's copy. This driver uses the date.
- `listSnapshots()` and `deleteSnapshot()` let other code clean up old copies. That's how `keep-snapshots` works.

Run `pnpm test` to check this driver against `createStorageDriverTests()`: the checks Astro gives every driver author.
