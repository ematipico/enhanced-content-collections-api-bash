import { sqlite } from '@astrojs/collection-storage-sqlite';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Kept in a SQLite file by the storage driver, and read one entry at a time.
const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/docs' }),
  schema: z.object({ title: z.string(), order: z.number() }),
  storage: sqlite({ url: 'file:./collections.db' }),
});

// No `storage`: bundled with the site, like every collection without the flag.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/blog' }),
  schema: z.object({ title: z.string(), date: z.coerce.date() }),
});

export const collections = { docs, blog };
