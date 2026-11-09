import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CollectionStorageDriver, CollectionStorageDriverFactory, StoredEntry } from 'astro';
import type { JsonFilesConfig } from './index.ts';

/**
 * A collection storage driver that writes each snapshot to two files in `dir`: its entries, and
 * then a small file recording the commit. A snapshot only exists once that second file does, so
 * readers never see a snapshot that isn't committed.
 */
export function createJsonFilesDriver({ dir }: JsonFilesConfig): CollectionStorageDriver {
  const entriesFile = (snapshot: string) => join(dir, `${encodeURIComponent(snapshot)}.entries.json`);
  const commitFile = (snapshot: string) => join(dir, `${encodeURIComponent(snapshot)}.commit.json`);

  return {
    // Readable IDs, so the snapshots are easy to find in `dir`
    createSnapshotId: () => `build-${new Date().toISOString().replace(/[:.]/g, '-')}`,

    async openWriter({ snapshot, dev }) {
      const collections: Record<string, StoredEntry[]> = {};
      return {
        async write(collection, entries) {
          collections[collection] = entries;
        },
        async commit() {
          mkdirSync(dir, { recursive: true });
          // A dev server writes its snapshot again after each change: this replaces its entries
          writeFileSync(entriesFile(snapshot), JSON.stringify(collections));
          writeFileSync(commitFile(snapshot), JSON.stringify({ committedAt: new Date().toISOString(), dev }));
        },
      };
    },

    async openReader({ snapshot }) {
      if (!existsSync(commitFile(snapshot))) {
        throw new Error(`The snapshot "${snapshot}" was never committed, or it was deleted.`);
      }
      const collections: Record<string, StoredEntry[]> = JSON.parse(readFileSync(entriesFile(snapshot), 'utf-8'));
      const byId = new Map(
        Object.entries(collections).map(([name, entries]) => [name, new Map(entries.map((entry) => [entry.id, entry]))]),
      );
      // Astro asks for entries without their content when pages only need their data
      const select = (entry: StoredEntry, content: boolean): StoredEntry =>
        content ? entry : { id: entry.id, metadata: entry.metadata };
      return {
        async get(collection, id, { content }) {
          const entry = byId.get(collection)?.get(id);
          return entry && select(entry, content);
        },
        async entries(collection, { content }) {
          return (collections[collection] ?? []).map((entry) => select(entry, content));
        },
      };
    },

    async listSnapshots() {
      if (!existsSync(dir)) return [];
      return readdirSync(dir)
        .filter((file) => file.endsWith('.commit.json'))
        .map((file) => {
          const { committedAt, dev } = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
          return {
            snapshot: decodeURIComponent(file.slice(0, -'.commit.json'.length)),
            committedAt: new Date(committedAt),
            dev,
          };
        });
    },

    async deleteSnapshot(snapshot) {
      rmSync(commitFile(snapshot), { force: true });
      rmSync(entriesFile(snapshot), { force: true });
    },
  };
}

const createDriver: CollectionStorageDriverFactory<JsonFilesConfig> = (config) => {
  if (!config?.dir) throw new Error('The JSON files driver needs a `dir`.');
  return createJsonFilesDriver(config);
};

export default createDriver;
