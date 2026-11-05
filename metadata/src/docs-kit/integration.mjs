/** The integration of the docs-kit library. */
export default function docsKit() {
  return {
    name: 'docs-kit',
    hooks: {
      // Called before any loader runs, and again in dev when the content config changes.
      'astro:collections:resolved': ({ collections, logger }) => {
        const docs = collections.filter((collection) => collection.descriptors.docsKit === 'docs');
        logger.info(`Found docs collections: ${docs.map((collection) => collection.name).join(', ')}`);
      },
    },
  };
}
