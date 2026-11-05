/** Adds a banner to the entries of the collections that use the docs-kit loader. */
export function remarkDocsKit() {
  return (tree, file) => {
    const collection = file.data.astro?.collection;
    if (collection?.descriptors.docsKit !== 'docs') return;
    const section = collection.descriptors.section ?? 'docs';
    tree.children.unshift({
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: `docs-kit: "${collection.name}" collection, ${section} section` }],
        },
      ],
    });
  };
}
