---
title: What collection metadata is
order: 1
---

Collection metadata is a list of facts about the collections of a project: their names, whether they're loaded when you build or when someone visits, which loader they use, and their labels. It never includes the entries themselves, so getting it is cheap.

## Getting the list

`getCollectionsMetadata()` from `astro:content` returns one item per collection:

```ts
import { getCollectionsMetadata } from 'astro:content';

const collections = await getCollectionsMetadata();
// [
//   { name: 'guides', type: 'build-time', loader: { name: 'docs-kit' }, descriptors: { docsKit: 'docs' } },
//   { name: 'releases', type: 'live', loader: { name: 'releases-loader' }, descriptors: { changelog: true, featured: true } },
//   …
// ]
```

The home page of this app prints the whole list.

## Why it helps

Before, code that wanted to read a collection had to know its name. That's fine in your own project, but a library can't know what you called things. With metadata, a library looks for collections with its label instead, and then reads them by name:

```ts
const docs = (await getCollectionsMetadata()).filter(
  (collection) => collection.descriptors.docsKit === 'docs',
);
```

That's how docs-kit, the made-up library in this app, makes a page for every guide, reference page and changelog entry, without knowing any of those names.

## Build-time and live collections

- `type: 'build-time'` collections are loaded when you build. You read their entries with `getCollection()`.
- `type: 'live'` collections, defined in `live.config.ts`, are loaded each time someone visits. You read them with `getLiveCollection()`.

## Turning it on

It's experimental, so it needs `experimental.collectionMetadata: true` in `astro.config.mjs`. Without it, `getCollectionsMetadata()` throws, and labels are ignored.
