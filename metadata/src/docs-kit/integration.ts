import type { AstroIntegration } from 'astro';

/** The integration of the docs-kit library. */
export default function docsKit(): AstroIntegration {
  return {
    name: 'docs-kit',
    hooks: {
      // Called before any loader runs, and again in dev when the content config changes.
      'astro:collections:resolved': ({ collections, logger }) => {
        const docs = collections.filter((collection) => collection.descriptors.docsKit === 'docs');
        logger.info(`Found docs collections: ${docs.map((collection) => collection.name).join(', ')}`);
      },
      // Checks the entries of every docs-kit collection once the build is done.
      'astro:build:done': async ({ collections, logger }) => {
        // Both are set when `experimental.collectionMetadata` is enabled
        if (!collections.metadata || !collections.entries) return;
        const docs = collections.metadata.filter((collection) => collection.descriptors.docsKit === 'docs');
        const pages = new Map<unknown, string>();
        let checked = 0;
        for (const { name } of docs) {
          for (const entry of await collections.entries(name, { content: false })) {
            const page = `${name}/${entry.id}`;
            const other = pages.get(entry.data.title);
            if (other) logger.warn(`"${entry.data.title}" is the title of both ${other} and ${page}`);
            pages.set(entry.data.title, page);
            checked++;
          }
        }
        logger.info(`Checked ${checked} docs pages`);
      },
    },
  };
}
