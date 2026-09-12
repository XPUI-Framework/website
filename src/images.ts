/** The synced goldens, handed to Vite, so dev and build serve the same bytes at the same URLs. */
const urls = import.meta.glob('/content/xpui-gallery/**/*.png', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

export function galleryImage(path: string): string {
  const url = urls[`/content/xpui-gallery/${path}`];
  if (!url) throw new Error(`xpui-gallery/${path} is not synced — add it to sources.json`);
  return url;
}
