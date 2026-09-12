import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { sourceOf } from '../lib/content.ts';
import { siteNav } from '../lib/docs.ts';
import { llmsFull } from '../lib/llms.ts';
import { routeOf } from '../lib/routes.ts';

export const GET: APIRoute = async () => {
  const entries = await getCollection('docs');
  const bodies = new Map(entries.map((e) => [e.id, e.body ?? '']));
  const { order } = siteNav(bodies);
  const pages = order.map(({ id }) => {
    const [dir, ...rest] = id.split('/');
    const { github, sha } = sourceOf(dir, rest.join('/'));
    return { href: routeOf(id), source: `${github}@${sha.slice(0, 7)} ${rest.join('/')}`, body: bodies.get(id) ?? '' };
  });
  return new Response(llmsFull(pages), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
