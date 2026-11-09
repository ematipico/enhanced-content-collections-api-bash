import { defineLiveCollection } from 'astro:content';
import type { LiveLoader } from 'astro/loaders';

const releases = [
  { id: '1.0.0', data: { title: 'First release' } },
  { id: '1.1.0', data: { title: 'Second release' } },
];

const releasesLoader: LiveLoader<{ title: string }, { id: string }> = {
  name: 'releases-loader',
  descriptors: { changelog: true },
  loadCollection: async () => ({ entries: releases }),
  loadEntry: async ({ filter }) => releases.find((release) => release.id === filter.id),
};

export const collections = {
  // Descriptors from the config are merged with the loader's
  releases: defineLiveCollection({ loader: releasesLoader, descriptors: { featured: true } }),
};
