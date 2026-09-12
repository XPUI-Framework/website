import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { syncedText } from '../lib/content.ts';
import { siteNav } from '../lib/docs.ts';
import { llmsIndex } from '../lib/llms.ts';
import { firstSentence, title } from '../lib/sections.ts';

export const GET: APIRoute = async () => {
  const entries = await getCollection('docs');
  const { groups } = siteNav(new Map(entries.map((e) => [e.id, e.body ?? ''])));
  const summaries = new Map(entries.map((e) => [e.id, firstSentence(e.body ?? '')]));
  const profile = syncedText('.github', 'profile/README.md');
  return new Response(llmsIndex(title(profile), firstSentence(profile), groups, summaries), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
