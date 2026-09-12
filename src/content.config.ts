import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { CONTENT_DIR, pageIds, readManifest } from './lib/manifest.ts';

/** Every synced page, with its id the path it has in content/: `xpui/docs/tutorial.md`. */
export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: pageIds(readManifest()), base: `./${CONTENT_DIR}`, generateId: ({ entry }) => entry }),
  }),
};
