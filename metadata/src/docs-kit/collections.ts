import { type CollectionMetadata, getCollection, getCollectionsMetadata } from 'astro:content';

type DocsCollection = Extract<
  CollectionMetadata,
  { type: 'build-time'; descriptors: { docsKit: 'docs' } }
>;

// `filter()` can't narrow on a nested property, so the type guard is explicit.
function isDocsCollection(collection: CollectionMetadata): collection is DocsCollection {
  return collection.type === 'build-time' && collection.descriptors.docsKit === 'docs';
}

/** Returns the collections that use the docs-kit loader, whatever their names, with their entries. */
export async function getDocsCollections() {
  const docs = (await getCollectionsMetadata()).filter(isDocsCollection);
  return Promise.all(docs.map(async ({ name }) => ({ name, entries: await getCollection(name) })));
}
