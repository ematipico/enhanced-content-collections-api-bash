import type { CollectionStorageDescriptor } from 'astro';

export type JsonFilesConfig = {
  /** The directory the snapshots are written to. Relative paths start from where Astro runs. */
  dir: string;
};

/** Keeps a collection's entries in JSON files, one per snapshot. Pass it to `storage`. */
export function jsonFiles(config: JsonFilesConfig): CollectionStorageDescriptor<JsonFilesConfig> {
  return {
    // Astro loads the driver through Vite, during sync and bundled with the server
    entrypoint: new URL('./driver.ts', import.meta.url),
    config: { ...config },
  };
}
