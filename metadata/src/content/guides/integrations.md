---
title: Using collections in an integration
order: 3
---

Integrations often need to know about collections before any page exists, or to look at all of them once a build is done. Two hooks give them that. docs-kit's integration, in `src/docs-kit/integration.ts`, uses both, and this app turns it on in `astro.config.mjs`:

```js
// astro.config.mjs
import docsKit from './src/docs-kit/integration.ts';

export default defineConfig({
  integrations: [docsKit()],
  experimental: {
    collectionMetadata: true,
  },
});
```

## Before anything loads: `astro:collections:resolved`

This hook receives the metadata of the collections loaded when you build, as soon as Astro has read your content config, and before any loader runs. In development, it runs again whenever you change the content config.

docs-kit uses it to print which collections it found:

```ts
'astro:collections:resolved': ({ collections, logger }) => {
  const docs = collections.filter(
    (collection) => collection.descriptors.docsKit === 'docs',
  );
  const names = docs.map((collection) => collection.name);
  logger.info(`Found docs collections: ${names.join(', ')}`);
},
```

Run `pnpm dev` or `pnpm build`, and you'll see:

```
[docs-kit] Found docs collections: guides, reference, changelog
```

A real library could use this moment to set itself up for those collections, for example to decide which Markdown plugins to run.

Live collections aren't included here: Astro hasn't read `live.config.ts` at that point.

## After a build: `astro:build:done`

At the end of a build, this hook receives `collections`, with:

- `collections.metadata`: the same list as above.
- `collections.entries(name)`: the entries of one collection, as the build saved them.

docs-kit reads the entries of every docs collection, and warns when two pages share a title:

```ts
'astro:build:done': async ({ collections, logger }) => {
  // Both are only there when `experimental.collectionMetadata` is on
  if (!collections.metadata || !collections.entries) return;
  const docs = collections.metadata.filter(
    (collection) => collection.descriptors.docsKit === 'docs',
  );
  const pages = new Map<unknown, string>();
  for (const { name } of docs) {
    // Titles are enough, so the entries come without their text
    for (const entry of await collections.entries(name, { content: false })) {
      const page = `${name}/${entry.id}`;
      const other = pages.get(entry.data.title);
      if (other) {
        logger.warn(`"${entry.data.title}" is the title of both ${other} and ${page}`);
      }
      pages.set(entry.data.title, page);
    }
  }
},
```

Try it: give a guide the same title as the reference page, `API summary`, and run `pnpm build`. At the end, you'll see:

```
[WARN] [docs-kit] "API summary" is the title of both guides/labels and reference/configuration
```

## What `entries()` returns

Plain data, as the build saved it. Here's this page's neighbour, the labels guide, with and without its content:

```ts
await collections.entries('guides');
// [{
//   id: 'labels',
//   data: { title: 'Labels', order: 2 },
//   body: '…the Markdown of the page…',
//   rendered: { html: '…', metadata: { … } },
//   filePath: 'src/content/guides/labels.md',
//   digest: '…',
// }, …]

await collections.entries('guides', { content: false });
// [{
//   id: 'labels',
//   data: { title: 'Labels', order: 2 },
//   filePath: 'src/content/guides/labels.md',
//   digest: '…',
// }, …]
```

A few things to know:

- Images and references to other entries aren't resolved, and you can't render the entries.
- Pass `{ content: false }` when you only need the data, like titles: you skip the text and HTML.
- Each call reads one collection from disk and keeps nothing afterwards, so it doesn't fill up memory. Read the collections you need one at a time.
