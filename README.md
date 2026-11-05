# Enhanced content collections bug bash

Two small Astro apps to try the experimental features of the [enhanced content collections RFC](https://github.com/withastro/roadmap/pull/1459) before they're released. Each app installs a preview build of Astro from the last pull request of a feature's stack, so it always runs the latest commit of that stack.

| App | Feature | Flag | Preview of |
| --- | --- | --- | --- |
| [`storage/`](./storage) | Collection storage drivers | `experimental.collectionStorageDrivers` | [withastro/astro#18583](https://github.com/withastro/astro/pull/18583) |
| [`metadata/`](./metadata) | Collection metadata | `experimental.collectionMetadata` | [withastro/astro#18596](https://github.com/withastro/astro/pull/18596) |

The apps are independent: each has its own dependencies, so install and run them one at a time.

```sh
git clone https://github.com/ematipico/enhanced-content-collections-bug-bash.git
cd enhanced-content-collections-bug-bash/storage   # or metadata
pnpm install
pnpm dev
```

Both apps need Node 22.23.4 or later and [pnpm](https://pnpm.io/installation), and use the Node adapter, so pages that opt out of prerendering run on demand. To try a production build, run `pnpm build` and then `pnpm preview`.

To pick up new commits pushed to a pull request, reinstall: `rm -rf node_modules pnpm-lock.yaml && pnpm install`.

## `storage/`: collection storage drivers

Collections can keep their entries in a storage driver, read one entry at a time, instead of in the data store bundled with the site.

- `src/content.config.ts`: the `docs` collection is stored in a local SQLite file, `collections.db`, by `@astrojs/collection-storage-sqlite`. The `blog` collection has no `storage`, so it stays bundled.
- `src/pages/index.astro`: rendered on demand. It lists both collections with `{ content: false }`, which leaves out `body` and `rendered`.
- `src/pages/docs/[id].astro`: rendered on demand, reading one entry from SQLite.
- `src/pages/blog/[id].astro`: prerendered. `getStaticPaths()` lists the posts with `{ content: false }`.

Things to try:

- Edit a page in `src/docs/` while `pnpm dev` runs. Each change is written to a new snapshot.
- Look inside the database: `sqlite3 collections.db "select * from astro_collection_snapshots"`.
- Run `pnpm build`, change a doc, build again, and check that each build's server only reads its own snapshot.
- Pass `render()` an entry read with `{ content: false }`.
- Store a collection in a remote [Turso](https://turso.tech) database: `sqlite({ url: 'libsql://…', authTokenEnv: 'TURSO_TOKEN' })`. The token must be in the environment of the process: a `.env` file isn't enough.
- Write your own driver, and check it with `createStorageDriverTests()` from `astro/content/storage-driver-tests`.

`@libsql/client` is a direct dependency to work around a bug in the preview: the production server bundles the driver, and with pnpm it can't load the native SQLite binding otherwise. pnpm also warns about an unmet `astro` peer: the preview of the driver expects the version of Astro it will be released with.

## `metadata/`: collection metadata

Code can recognize a collection by its descriptors without knowing its name. That's useful for libraries that ship their own loaders. The app contains a tiny imaginary library, "docs-kit", in `src/docs-kit/`:

- `loader.ts`: a loader declaring the descriptor `{ docsKit: 'docs' }`.
- `integration.mjs`: logs the docs-kit collections from the `astro:collections:resolved` hook, at startup and when the content config changes.
- `remark.mjs`: a remark plugin that reads `file.data.astro.collection` and adds a banner to docs-kit entries, both Markdown and MDX.
- `collections.ts`: finds the docs-kit collections with `getCollectionsMetadata()`, using a type guard so their entries are typed.

The rest of the project:

- `src/content.config.ts`: `guides` and `reference` use the docs-kit loader, and `reference` adds descriptors of its own. `blog` and `authors` are unrelated collections.
- `src/live.config.ts`: a live collection with descriptors.
- `pnpm-workspace.yaml`: lets pnpm install the preview packages, which depend on each other through URLs.
- `src/pages/index.astro`: prints `getCollectionsMetadata()` and links the pages of the docs-kit collections.
- `src/pages/[collection]/[id].astro`: a page for each entry of every docs-kit collection, whatever the collection's name.

Things to try:

- Add a collection that uses `docsLoader()`: it gets pages and a banner without other changes.
- Override a loader descriptor with the `descriptors` option of `defineCollection()`.
- Check the types: hover `descriptors` in your editor, or return a value that isn't serializable from a descriptor.
- Use the same file in two collections: Markdown plugins see `file.data.astro.collection` as `undefined`.
- Set `experimental.collectionMetadata` to `false`.

## Feedback

Report bugs in the [enhanced content collections RFC](https://github.com/withastro/roadmap/pull/1459), or in the preview pull request of the feature.
