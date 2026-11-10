import type { AstroIntegration } from 'astro';

/**
 * Deletes the snapshots of earlier builds at the end of each build, keeping the `keep` most
 * recent ones. Astro never deletes snapshots itself, as it can't know which ones deployed
 * servers still read.
 */
export default function keepSnapshots({ keep = 3 }: { keep?: number } = {}): AstroIntegration {
  return {
    name: 'keep-snapshots',
    hooks: {
      'astro:build:done': async ({ collections, logger }) => {
        for (const storage of collections.storage ?? []) {
          logger.info(
            `${storage.collections.join(', ')}: wrote snapshot ${storage.snapshot}, read at runtime: ${storage.readAtRuntime}`,
          );
          if (!storage.listSnapshots || !storage.deleteSnapshot) continue;
          const builds = (await storage.listSnapshots())
            .filter((snapshot) => !snapshot.dev)
            .sort((a, b) => b.committedAt.getTime() - a.committedAt.getTime());
          for (const { snapshot } of builds.slice(keep)) {
            await storage.deleteSnapshot(snapshot);
            logger.info(`Deleted snapshot ${snapshot} of ${storage.collections.join(', ')}`);
          }
        }
      },
    },
  };
}
