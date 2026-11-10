# Enhanced content collections API bash

Two small Astro apps to try the experimental features of the [enhanced content collections RFC](https://github.com/withastro/roadmap/pull/1459) before they're released. Each app installs a preview build of Astro from the last pull request of a feature's stack, so it always runs the latest commit of that stack.

| App | Feature | Flag | Preview of |
| --- | --- | --- | --- |
| [`storage/`](./storage) | Collection storage drivers | `experimental.collectionStorageDrivers` | [withastro/astro#18632](https://github.com/withastro/astro/pull/18632) |
| [`metadata/`](./metadata) | Collection metadata | `experimental.collectionMetadata` | [withastro/astro#18633](https://github.com/withastro/astro/pull/18633) |

The apps are independent: each has its own dependencies, so install and run them one at a time.

```sh
git clone https://github.com/ematipico/enhanced-content-collections-api-bash.git
cd enhanced-content-collections-api-bash/storage   # or metadata
pnpm install
pnpm dev
```

Both apps need Node 22.23.4 or later and [pnpm](https://pnpm.io/installation), and use the Node adapter, so pages that opt out of prerendering run on demand. To try a production build, run `pnpm build` and then `pnpm preview`.

To pick up new commits pushed to a pull request, reinstall: `rm -rf node_modules pnpm-lock.yaml && pnpm install`.

## `storage/`: collection storage drivers

Collections can keep their entries in a storage driver, read one entry at a time, instead of in the data store bundled with the site.

- `src/content.config.ts`: the `docs` collection is stored in a local SQLite file, `collections.db`, by `@astrojs/collection-storage-sqlite`. The `notes` collection is stored in `json-storage/` by the project's own driver. The `blog` collection has no `storage`, so it stays bundled.
- `src/drivers/json-files/`: a collection storage driver written in the project. `index.ts` exports `jsonFiles()`, which returns the storage descriptor, and `driver.ts` implements the whole driver contract: `createSnapshotId()`, `openWriter()`, `openReader()`, `listSnapshots()` and `deleteSnapshot()`.
- `test/json-files-driver.test.ts`: runs `createStorageDriverTests()` from `astro/content/storage-driver-tests` against that driver. Run it with `pnpm test`.
- `src/pages/index.astro`: rendered on demand. It lists every collection with `getCollection({ name, content: false })`, which leaves out `body` and `rendered`.
- `src/pages/docs/[id].astro`: rendered on demand, reading one entry from SQLite.
- `src/pages/notes/[id].astro`: rendered on demand, reading a note from its JSON file, and its related docs from SQLite with `getEntries(note.data.related, { content: false })`.
- `src/pages/blog/[id].astro`: prerendered. `getStaticPaths()` lists the posts with `getCollection({ name: 'blog', content: false })`.
- `src/integrations/keep-snapshots.ts`: an integration that keeps the 3 most recent build snapshots of each driver, and deletes older ones in the `astro:build:done` hook, through `collections.storage`. It also logs the snapshot each build wrote, and `readAtRuntime`.

Things to try:

- Edit a page in `src/docs/` or `src/notes/` while `pnpm dev` runs. The dev server writes a single snapshot per driver, again after each change: watch `json-storage/`.
- Look inside the database: `sqlite3 collections.db "select * from astro_collection_snapshots"`.
- Run `pnpm build`, change a doc, build again, and check that each build's server only reads its own snapshot.
- Build more than 3 times, and check that `keep-snapshots` deletes the oldest build snapshots, but never the dev server's.
- Make `keep-snapshots` delete the snapshot the build just wrote (`storage.snapshot`): Astro refuses, as the server reads it.
- Pass `render()` an entry read with `{ content: false }`.
- Store a collection in a remote [Turso](https://turso.tech) database: `sqlite({ url: 'libsql://…', authTokenEnv: 'TURSO_TOKEN' })`. The driver reads the token with `getSecret()` from `astro:env/server`, so at build time it can come from a `.env` file.
- Break the JSON files driver, for example make `commit()` a no-op or ignore `content: false`, and run `pnpm test`.
- Write your own driver, starting from `src/drivers/json-files/`.

`@libsql/client` is a direct dependency, as the driver requires: the production server only leaves it out of the bundle when it can find it from the project, and libSQL can't load its native binding from a bundle. pnpm also warns about an unmet `astro` peer: the preview of the driver expects the version of Astro it will be released with.

## `metadata/`: collection metadata

Code can recognize a collection by its descriptors without knowing its name. That's useful for libraries that ship their own loaders. The app contains a tiny imaginary library, "docs-kit", in `src/docs-kit/`:

- `loader.ts`: a loader declaring the descriptor `{ docsKit: 'docs' }`.
- `integration.ts`: logs the docs-kit collections from the `astro:collections:resolved` hook, at startup and when the content config changes. After a build, it reads their entries in the `astro:build:done` hook, with `collections.entries()`, and warns about pages sharing a title.
- `remark.mjs`: a remark plugin that reads `file.data.astro.collection` and adds a banner to docs-kit entries, both Markdown and MDX.
- `collections.ts`: finds the docs-kit collections with `getCollectionsMetadata()`, without loading their entries. A type guard narrows them, so reading their entries is typed.

The rest of the project:

- `src/content.config.ts`: `guides` and `reference` use the docs-kit loader, and `reference` adds descriptors of its own. `changelog` has its own loader, which renders its Markdown with `renderMarkdown()`, and becomes a docs-kit collection through the `descriptors` option alone. `blog` and `authors` are unrelated collections.
- `src/live.config.ts`: a live collection whose descriptors come from its loader and from `defineLiveCollection()`.
- `pnpm-workspace.yaml`: lets pnpm install the preview packages, which depend on each other through URLs.
- `src/pages/index.astro`: prints `getCollectionsMetadata()` and links the pages of the docs-kit collections.
- `src/pages/[collection]/[id].astro`: a page for each entry of every docs-kit collection, whatever the collection's name. `getStaticPaths()` only returns the collection and ID of each page, and the page reads its own entry with `getEntry()`.

Things to try:

- Add a collection that uses `docsLoader()`: it gets pages and a banner without other changes.
- Override a loader descriptor with the `descriptors` option of `defineCollection()`.
- Check the types: hover `descriptors` in your editor, or return a value that isn't serializable from a descriptor.
- Use the same file in two collections: Markdown plugins see `file.data.astro.collection` as `undefined`.
- Give a guide the title of the reference page and run `pnpm build`: docs-kit warns about it at the end of the build.
- Set `experimental.collectionMetadata` to `false`.

## Feedback

Report bugs in the [enhanced content collections RFC](https://github.com/withastro/roadmap/pull/1459), or in the preview pull request of the feature.
