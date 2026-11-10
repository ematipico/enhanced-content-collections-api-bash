---
title: Using collections in an integration
order: 3
---

Integrations often need to know about collections before any page exists, or to look at all of them once a build is done. Two hooks give them that. docs-kit's integration, in `src/docs-kit/integration.ts`, uses both.

## Before anything loads: `astro:collections:resolved`

This hook receives the metadata of the collections loaded when you build, as soon as Astro has read your content config, and before any loader runs. In development, it runs again whenever you change the content config.

docs-kit uses it to print which collections it found. A real library could use it to set itself up for those collections, for example to decide which Markdown plugins to run.

Live collections aren't included here: Astro hasn't read `live.config.ts` at that point.

## After a build: `astro:build:done`

At the end of a build, this hook receives `collections`, with:

- `collections.metadata`: the same list as above.
- `collections.entries(name)`: the entries of one collection, as the build saved them.

docs-kit reads the entries of every docs collection and warns when two pages share a title. Try it: give a guide the same title as the reference page, and run `pnpm build`.

A few details about `entries()`:

- It returns plain data: images and references to other entries aren't resolved, and you can't render the entries.
- Pass `{ content: false }` when you only need the data, like titles. Entries then come without their text and HTML.
- Each call reads one collection from disk and keeps nothing afterwards, so it doesn't fill up memory. Read the collections you need one at a time.
