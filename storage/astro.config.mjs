import node from '@astrojs/node';
import { defineConfig } from 'astro/config';
import keepSnapshots from './src/integrations/keep-snapshots.ts';

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  integrations: [keepSnapshots({ keep: 3 })],
  experimental: {
    collectionStorageDrivers: true,
  },
});
