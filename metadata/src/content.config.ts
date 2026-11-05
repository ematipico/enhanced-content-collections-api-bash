import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader } from './docs-kit/loader';

// The loader's descriptors: { docsKit: 'docs' }
const guides = defineCollection({
  loader: docsLoader('./src/content/guides'),
  schema: z.object({ title: z.string() }),
});

// Descriptors from the config are merged with the loader's, and win on conflicts.
const reference = defineCollection({
  loader: docsLoader('./src/content/reference'),
  schema: z.object({ title: z.string() }),
  descriptors: { section: 'reference', audience: ['contributors'] },
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

export const collections = { guides, reference, blog, authors };
