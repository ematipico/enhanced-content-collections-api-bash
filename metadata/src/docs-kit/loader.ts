import { glob, type Loader } from 'astro/loaders';

/**
 * The loader of an imaginary "docs-kit" library. Its descriptor lets the library find the
 * collections that use it, whatever the user names them.
 */
export function docsLoader(base: string): Loader<{ docsKit: 'docs' }> {
  return {
    ...glob({ pattern: '**/*.{md,mdx}', base }),
    name: 'docs-kit',
    descriptors: { docsKit: 'docs' },
  };
}
