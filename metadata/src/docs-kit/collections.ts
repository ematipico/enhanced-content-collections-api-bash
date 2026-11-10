import { type CollectionMetadata, getCollectionsMetadata } from 'astro:content';

export type DocsCollection = Extract<
  CollectionMetadata,
  { type: 'build-time'; descriptors: { docsKit: 'docs' } }
>;

// `filter()` can't narrow on a nested property, so the type guard is explicit.
function isDocsCollection(collection: CollectionMetadata): collection is DocsCollection {
  return collection.type === 'build-time' && collection.descriptors.docsKit === 'docs';
}

/** Returns the collections that use the docs-kit loader, whatever their names, without loading their entries. */
export async function getDocsCollections(): Promise<DocsCollection[]> {
  return (await getCollectionsMetadata()).filter(isDocsCollection);
}
