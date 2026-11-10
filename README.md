# Enhanced content collections API bash

Two small Astro apps to try two new, experimental content collection features before they're released. They come from the [enhanced content collections RFC](https://github.com/withastro/roadmap/pull/1459). Each app installs a preview version of Astro that already has the feature, built from its pull request.

| App | What it shows | Setting that turns it on | Preview from |
| --- | --- | --- | --- |
| [`storage/`](./storage) | Keeping a collection in a database or in files, instead of inside your site | `experimental.collectionStorageDrivers` | [withastro/astro#18632](https://github.com/withastro/astro/pull/18632) |
| [`metadata/`](./metadata) | Finding collections by a label, without knowing their names | `experimental.collectionMetadata` | [withastro/astro#18633](https://github.com/withastro/astro/pull/18633) |

The two apps don't depend on each other. Both started from Astro's basics template (`pnpm create astro --template basics`), so every page uses its layout and styles. Install and run them one at a time:

```sh
git clone https://github.com/ematipico/enhanced-content-collections-api-bash.git
cd enhanced-content-collections-api-bash/storage   # or metadata
pnpm install
pnpm dev
```

You need Node 22.23.4 or later and [pnpm](https://pnpm.io/installation). To try the built site instead of the dev server, run `pnpm build` and then `pnpm preview`. Both apps use the Node adapter, so some pages are built when someone visits them, and the others are turned into HTML files when you build.

When a pull request gets new commits, reinstall to get them: `rm -rf node_modules pnpm-lock.yaml && pnpm install`.

## `storage/`: keeping collections in a database or in files

Normally, Astro packs every collection into your site, and loads all of it in memory as soon as one page needs an entry. With this feature, a collection can live somewhere else instead, like a database, and Astro only reads the entries a page asks for. The code that saves and reads entries in one kind of storage is called a **driver**.

What's in the app:

- `src/content.config.ts`: the three collections.
  - `docs` is saved in a SQLite database file, `collections.db`, by the official driver, `@astrojs/collection-storage-sqlite`.
  - `notes` is saved in a folder of JSON files, `json-storage/`, by a driver that lives in this project.
  - `blog` has no `storage` option, so Astro packs it into the site, like always.
- `src/drivers/json-files/`: the project's own driver, a good place to see how a driver is made.
  - `index.ts` exports `jsonFiles()`, which tells Astro where the driver is and which options to give it.
  - `driver.ts` is the driver itself. It saves entries (`openWriter()`), reads them back (`openReader()`), names each build's copy (`createSnapshotId()`), and lists and deletes old copies (`listSnapshots()`, `deleteSnapshot()`).
- `test/json-files-driver.test.ts`: checks the driver with `createStorageDriverTests()`, the checks Astro gives every driver author. Run them with `pnpm test`.
- `src/pages/index.astro`: built when someone visits. It lists every collection, asking only for titles and not for the text of each entry (`getCollection({ name, content: false })`).
- `src/pages/docs/[id].astro`: built when someone visits. It reads one doc from the database.
- `src/pages/notes/[id].astro`: built when someone visits. It reads one note from its JSON file, and the titles of its related docs from the database (`getEntries(note.data.related, { content: false })`).
- `src/pages/blog/[id].astro`: turned into an HTML file when you build. To know which pages to make, it lists the posts without their text.
- `src/integrations/keep-snapshots.ts`: cleans up. Every build saves a new copy of the entries (a **snapshot**), and this integration keeps the 3 newest copies of each driver and deletes the rest, at the end of each build. It also prints which copy each build saved. The [Snapshots](./storage/src/docs/snapshots.md) page explains copies in more detail.

Things to try:

- Edit a page in `src/docs/` or `src/notes/` while `pnpm dev` runs. Development only ever has one copy, called `dev`, which Astro overwrites after each change. Watch `json-storage/` to see it.
- Look inside the database: `sqlite3 collections.db "select * from astro_collection_snapshots"`.
- Run `pnpm build`, change a doc, and build again. Each built site keeps reading its own copy of the docs.
- Build more than 3 times, and watch `keep-snapshots` delete the oldest copies. It never touches `dev`.
- Make `keep-snapshots` delete the copy the build just saved (`storage.snapshot`). Astro refuses, because the site that build created needs it.
- Pass an entry you read with `content: false` to `render()`. Astro refuses, because the entry has no text to render.
- Keep a collection in an online [Turso](https://turso.tech) database: `sqlite({ url: 'libsql://…', authTokenEnv: 'TURSO_TOKEN' })`. The driver reads the token from the `TURSO_TOKEN` environment variable, with `getSecret()` from `astro:env/server`, so while you build it can come from a `.env` file.
- Break the JSON files driver, for example by making `commit()` do nothing, or by ignoring `content: false`, and run `pnpm test` to see the checks catch it.
- Write your own driver, starting from a copy of `src/drivers/json-files/`.

Two things you might notice:

- `@libsql/client` is listed as a dependency of the app, not only of the SQLite driver. The driver needs that: the database client includes a compiled binary, which only works when the built site loads it from `node_modules`.
- pnpm warns that the SQLite driver wants a newer `astro`. That's because the preview of the driver already expects the version of Astro it will be released with.

## `metadata/`: finding collections by a label

Collections can carry **labels**, called descriptors, that other code reads to recognize them, without knowing what they're called. That helps libraries: a documentation library could find "its" collections in any project, whatever names people gave them.

The app contains a tiny made-up library, "docs-kit", in `src/docs-kit/`:

- `loader.ts`: docs-kit's loader. It labels every collection that uses it with `{ docsKit: 'docs' }`.
- `integration.ts`: docs-kit's integration.
  - When Astro starts, and again in development when the content config changes, it prints the collections labelled as docs-kit docs (`astro:collections:resolved` hook).
  - After a build, it reads their entries and warns when two pages have the same title (`astro:build:done` hook, with `collections.entries()`).
- `remark.mjs`: a Markdown plugin that adds a coloured banner to docs-kit pages. It knows which collection a page belongs to through `file.data.astro.collection`. It works for Markdown and MDX.
- `collections.ts`: finds the docs-kit collections with `getCollectionsMetadata()`, which returns facts about every collection without loading any entry.

The rest of the app:

- `src/content.config.ts`: the collections.
  - `guides` and `reference` use docs-kit's loader. `reference` also adds labels of its own.
  - `changelog` has its own loader, which turns its Markdown into HTML with `renderMarkdown()`. It becomes a docs-kit collection only because its config adds the `docsKit` label.
  - `blog` and `authors` have nothing to do with docs-kit.
- `src/live.config.ts`: a live collection, loaded each time someone visits. It gets labels from its loader and from its config.
- `pnpm-workspace.yaml`: a setting pnpm needs to install the preview packages, which point to each other through URLs.
- `src/pages/index.astro`: shows what `getCollectionsMetadata()` returns, and links the docs-kit pages.
- `src/pages/[collection]/[id].astro`: a page for every entry of every docs-kit collection, whatever the collection is called. `getStaticPaths()` only decides which pages exist, and each page then reads its own entry with `getEntry()`.

Things to try:

- Add a collection that uses `docsLoader()`. It gets pages and a banner without any other change.
- Change one of the loader's labels with the `descriptors` option of `defineCollection()`.
- Check the types: hover `descriptors` in your editor, or try to use a function as a label value.
- Use the same file in two collections. The Markdown plugin can't tell which collection the page belongs to, so it sees `undefined`.
- Give a guide the same title as the reference page, and run `pnpm build`. docs-kit warns about it at the end of the build.
- Set `experimental.collectionMetadata` to `false`.

## Feedback

Tell us what you think, or report bugs, in the [enhanced content collections RFC](https://github.com/withastro/roadmap/pull/1459), or in the pull request of the feature.
