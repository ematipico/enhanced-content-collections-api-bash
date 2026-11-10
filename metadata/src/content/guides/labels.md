---
title: Labels
order: 2
---

Labels, called descriptors in the API, are small pieces of information attached to a collection, so code can recognize it. They're an object, like `{ docsKit: 'docs' }`.

## Where labels come from

- **The loader.** A loader can label every collection that uses it. docs-kit's loader adds `{ docsKit: 'docs' }`.
- **The collection's config.** `defineCollection()` and `defineLiveCollection()` take a `descriptors` option, to add labels or change the loader's.

When both set the same label, the collection's config wins. In this app, `reference` uses docs-kit's loader and adds `section` and `audience`, and `changelog` doesn't use docs-kit's loader at all: it becomes a docs-kit collection only because its config adds `docsKit: 'docs'`.

## What a label can hold

Only things that can be written as JSON: text, numbers, `true` or `false`, `null`, lists and objects. No functions, dates or class instances. That's because labels are saved in files and passed to integrations and plugins, which need plain data. The types check it for you.

## Types

A loader declares its labels in its type, with `Loader<{ docsKit: 'docs' }>`, so your editor knows them. `getCollectionsMetadata()` returns them typed for each collection, so `collection.descriptors.docsKit` autocompletes.

One catch: TypeScript can't narrow a list with `filter()` when the check is on a nested value like `collection.descriptors.docsKit`. This app writes a small type guard for it, in `src/docs-kit/collections.ts`.

## Naming labels

Use a single key named after your library, like `docsKit` or `starlight`, and put what the collection is in its value: `'docs'`, `'changelog'`, and so on. That way, one library can label several kinds of collections, and two libraries don't step on each other's labels.
