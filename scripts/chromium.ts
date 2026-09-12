import { accessSync, constants, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

function executable(path: string): boolean {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function playwright(): string[] {
  return [join(homedir(), 'Library/Caches/ms-playwright'), join(homedir(), '.cache/ms-playwright')].flatMap((cache) => {
    try {
      return readdirSync(cache)
        .filter((d) => d.startsWith('chromium-'))
        .flatMap((d) => [
          join(cache, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
          join(cache, d, 'chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
          join(cache, d, 'chrome-linux64/chrome'),
        ]);
    } catch {
      return [];
    }
  });
}

/** A Chromium to render diagrams with: `CHROME`, puppeteer's own, Playwright's, or an installed Chrome. */
export async function findChromium(): Promise<string | undefined> {
  const { default: puppeteer } = await import('puppeteer');
  let own = '';
  try {
    own = await puppeteer.executablePath();
  } catch {}
  const candidates = [
    process.env.CHROME ?? '',
    own,
    ...playwright(),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ];
  return candidates.find((c) => c && executable(c));
}
