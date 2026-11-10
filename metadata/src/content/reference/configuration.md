---
title: API summary
---

This collection uses docs-kit's loader, and adds two labels of its own in `content.config.ts`: a `section` and an `audience`. That's why the banner says "reference section".

Everything collection metadata adds, in one place:

- `experimental.collectionMetadata` in `astro.config.mjs` turns it all on.
- `getCollectionsMetadata()` from `astro:content` lists every collection, with its name, type, loader and labels.
- `descriptors` on a loader labels every collection that uses it. Type it with `Loader<{ … }>` or `LiveLoader`.
- The `descriptors` option of `defineCollection()` and `defineLiveCollection()` adds labels, or changes the loader's.
- The `astro:collections:resolved` integration hook receives the metadata before loaders run.
- `collections.metadata` and `collections.entries()` in the `astro:build:done` hook give integrations the collections after a build.
- `file.data.astro.collection` tells Markdown plugins which collection they're working on.
