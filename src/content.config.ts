import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob, type Loader } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { sourceOf } from './lib/content.ts';
import { CONTENT_DIR, pageIds, readManifest } from './lib/manifest.ts';
import { pageData, starlightId } from './lib/starlight.ts';

const ids = pageIds(readManifest());

/** The synced pages as Starlight's docs: the same files, given the front matter a synced page does not carry. */
function syncedDocs(): Loader {
  const files = glob({ pattern: ids, base: `./${CONTENT_DIR}`, generateId: ({ entry }) => starlightId(entry) });
  const content = join(process.cwd(), CONTENT_DIR);
  return {
    name: 'synced-docs',
    load: (context) =>
      files.load({
        ...context,
        parseData: (props) => {
          const id = relative(content, props.filePath ?? '');
          const [dir, ...rest] = id.split('/');
          const derived = pageData(id, readFileSync(join(content, id), 'utf8'), sourceOf(dir, rest.join('/')).edit);
          return context.parseData({ ...props, data: { ...derived, ...props.data } });
        },
      }),
  };
}

export const collections = {
  /** Every synced page, with its id the path it has in content/: `xpui/docs/tutorial.md`. */
  pages: defineCollection({
    loader: glob({ pattern: ids, base: `./${CONTENT_DIR}`, generateId: ({ entry }) => entry }),
  }),
  docs: defineCollection({ loader: syncedDocs(), schema: docsSchema() }),
};
