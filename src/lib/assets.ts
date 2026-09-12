import type { APIRoute } from 'astro';
import { syncedBytes } from './content.ts';

/** An endpoint serving one synced brand file, so the site holds no second copy of it. */
export function brandFile(path: string, type: string): APIRoute {
  return () => new Response(new Uint8Array(syncedBytes('brand', path)), { headers: { 'Content-Type': type } });
}
