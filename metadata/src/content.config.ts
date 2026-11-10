import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader } from './docs-kit/loader';

// The loader's descriptors: { docsKit: 'docs' }
const guides = defineCollection({
  loader: docsLoader('./src/content/guides'),
  schema: z.object({ title: z.string(), order: z.number() }),
});

// Descriptors from the config are merged with the loader's, and win on conflicts.
const reference = defineCollection({
  loader: docsLoader('./src/content/reference'),
  schema: z.object({ title: z.string() }),
  descriptors: { section: 'reference', audience: ['contributors'] },
});

// A custom loader rendering its own Markdown. Its descriptors make it a docs-kit collection,
// so docs-kit gives it pages and a banner, and checks it after builds, without knowing its name.
const changelog = defineCollection({
  loader: {
    name: 'changelog-loader',
    load: async ({ store, renderMarkdown }) => {
      const releases = [
        { id: '1-1-0', title: 'Version 1.1', notes: 'Adds **collection metadata**.' },
        { id: '1-0-0', title: 'Version 1.0', notes: 'The first release.' },
      ];
      store.clear();
      for (const { id, title, notes } of releases) {
        // Markdown plugins see the collection of entries rendered with `renderMarkdown()`
        store.set({ id, data: { title }, rendered: await renderMarkdown(notes) });
      }
    },
  },
  schema: z.object({ title: z.string() }),
  descriptors: { docsKit: 'docs', section: 'changelog' },
});

// Not a docs-kit collection: no descriptors.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({ title: z.string() }),
});

// A loader defined as a function has the loader name "inline".
const authors = defineCollection({
  loader: () => [{ id: 'ada', name: 'Ada' }],
  schema: z.object({ name: z.string() }),
});

export const collections = { guides, reference, changelog, blog, authors };
