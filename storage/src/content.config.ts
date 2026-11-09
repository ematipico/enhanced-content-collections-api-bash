import { sqlite } from '@astrojs/collection-storage-sqlite';
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { jsonFiles } from './drivers/json-files/index.ts';

// Kept in a SQLite file by the storage driver, and read one entry at a time.
const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/docs' }),
  schema: z.object({ title: z.string(), order: z.number() }),
  storage: sqlite({ url: 'file:./collections.db' }),
});

// Kept by a driver written in this project, in JSON files. Notes reference docs kept in SQLite.
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/notes' }),
  schema: z.object({ title: z.string(), related: z.array(reference('docs')) }),
  storage: jsonFiles({ dir: './json-storage' }),
});

// No `storage`: bundled with the site, like every collection without the flag.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/blog' }),
  schema: z.object({ title: z.string(), date: z.coerce.date() }),
});

export const collections = { docs, notes, blog };
