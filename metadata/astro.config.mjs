import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import { defineConfig } from 'astro/config';
import docsKit from './src/docs-kit/integration.mjs';
import { remarkDocsKit } from './src/docs-kit/remark.mjs';

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  integrations: [mdx(), docsKit()],
  markdown: {
    // MDX inherits the plugins of the Markdown processor.
    processor: unified({ remarkPlugins: [remarkDocsKit] }),
  },
  experimental: {
    collectionMetadata: true,
  },
});
