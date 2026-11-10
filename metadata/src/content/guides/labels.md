---
title: Labels
order: 2
---

Labels, called descriptors in the API, are small pieces of information attached to a collection, so code can recognize it. They're an object, like `{ docsKit: 'docs' }`.

## Where labels come from

- **The loader.** A loader can label every collection that uses it. docs-kit's loader adds `{ docsKit: 'docs' }`.
- **The collection's config.** `defineCollection()` and `defineLiveCollection()` take a `descriptors` option, to add labels or change the loader's.

Here's how the `reference` collection of this app ends up with three labels, one from the loader and two from its config:

```ts
// src/docs-kit/loader.ts: docs-kit's loader labels every collection that uses it
export function docsLoader(base: string): Loader<{ docsKit: 'docs' }> {
  return {
    ...glob({ pattern: '**/*.{md,mdx}', base }),
    name: 'docs-kit',
    descriptors: { docsKit: 'docs' },
  };
}

// src/content.config.ts: the collection adds two labels of its own
const reference = defineCollection({
  loader: docsLoader('./src/content/reference'),
  descriptors: { section: 'reference', audience: ['contributors'] },
});

// getCollectionsMetadata() returns all three:
// {
//   name: 'reference',
//   type: 'build-time',
//   loader: { name: 'docs-kit' },
//   descriptors: { docsKit: 'docs', section: 'reference', audience: ['contributors'] },
// }
```

When both set the same label, the collection's config wins, and the labels set on only one side are kept:

```ts
// A loader that sets two labels
const loader: Loader<{ docsKit: 'docs'; version: number }> = {
  name: 'docs-kit',
  descriptors: { docsKit: 'docs', version: 1 },
  load: async () => {},
};

// A collection that sets docsKit too, with another value, and one more label
const api = defineCollection({
  loader,
  descriptors: { docsKit: 'api', section: 'api' },
});

// getCollectionsMetadata() returns:
// descriptors: { docsKit: 'api', version: 1, section: 'api' }
//   docsKit comes from the collection, version from the loader, section from the collection
```

Only the top level is merged. If both sides set `docsKit` to an object, like `{ kind: 'docs' }` and `{ section: 'api' }`, the collection's object replaces the loader's whole object: the result is `{ section: 'api' }`.

A collection doesn't even need docs-kit's loader to get its labels: `changelog` has its own loader, and becomes a docs-kit collection only because its config adds `docsKit: 'docs'`.

## What a label can hold

Only things that can be written as JSON: text, numbers, `true` or `false`, `null`, lists and objects. No functions, dates or class instances. That's because labels are saved in files and passed to integrations and plugins, which need plain data. The types check it for you.

## Types

A loader declares its labels in its type, with `Loader<{ docsKit: 'docs' }>`, so your editor knows them. `getCollectionsMetadata()` returns them typed for each collection, so `collection.descriptors.docsKit` autocompletes.

One catch: TypeScript can't narrow a list with `filter()` when the check is on a nested value like `collection.descriptors.docsKit`. This app writes a small type guard for it, in `src/docs-kit/collections.ts`.

## Naming labels

Use a single key named after your library, like `docsKit` or `starlight`, and put what the collection is in its value: `'docs'`, `'changelog'`, and so on. That way, one library can label several kinds of collections, and two libraries don't step on each other's labels.
