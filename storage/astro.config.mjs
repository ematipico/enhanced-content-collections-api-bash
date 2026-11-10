// @ts-check
import node from '@astrojs/node';
import { defineConfig } from 'astro/config';
import keepSnapshots from './src/integrations/keep-snapshots.ts';

// https://astro.build/config
export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  integrations: [keepSnapshots({ keep: 3 })],
  experimental: {
    collectionStorageDrivers: true,
  },
});
