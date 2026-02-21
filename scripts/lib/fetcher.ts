/**
 * HTTP fetcher with retry, ETag caching, and timeout handling.
 *
 * Caches responses to data/source/ using ETag headers for conditional
 * requests, reducing bandwidth on repeated runs.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, '..', '..', 'data', 'source');

export interface FetchOptions {
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay between retries in milliseconds (default: 1000) */
  retryDelayMs?: number;
  /** Custom User-Agent header */
  userAgent?: string;
}

export interface FetchResult {
  body: string;
  status: number;
  etag: string | null;
  fromCache: boolean;
  url: string;
}

interface CacheEntry {
  etag: string;
  body: string;
  fetchedAt: string;
}

function getCachePath(url: string): string {
  // Create a filesystem-safe filename from URL
  const safe = url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .slice(0, 200);
  return join(CACHE_DIR, `${safe}.json`);
}

function loadCache(url: string): CacheEntry | null {
  const path = getCachePath(url);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as CacheEntry;
  } catch {
    return null;
  }
}

function saveCache(url: string, etag: string, body: string): void {
  mkdirSync(CACHE_DIR, { recursive: true });
  const entry: CacheEntry = {
    etag,
    body,
    fetchedAt: new Date().toISOString(),
  };
  writeFileSync(getCachePath(url), JSON.stringify(entry, null, 2));
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a URL with retry logic and ETag-based caching.
 *
 * On first fetch, stores the response body and ETag in data/source/.
 * On subsequent fetches, sends If-None-Match and returns cached body
 * if the server responds 304 Not Modified.
 */
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {},
): Promise<FetchResult> {
  const {
    timeoutMs = 30_000,
    maxRetries = 3,
    retryDelayMs = 1_000,
    userAgent = 'contract-law-mcp/1.0 (ingestion)',
  } = options;

  const cached = loadCache(url);
  const headers: Record<string, string> = {
    'User-Agent': userAgent,
    Accept: 'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
  };
  if (cached?.etag) {
    headers['If-None-Match'] = cached.etag;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = retryDelayMs * Math.pow(2, attempt - 1);
      console.log(`  Retry ${attempt}/${maxRetries} after ${delay}ms...`);
      await sleep(delay);
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // 304 Not Modified — return cached body
      if (response.status === 304 && cached) {
        console.log(`  Cache hit (304 Not Modified): ${url}`);
        return {
          body: cached.body,
          status: 304,
          etag: cached.etag,
          fromCache: true,
          url,
        };
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const body = await response.text();
      const etag = response.headers.get('etag');

      // Cache the response
      if (etag) {
        saveCache(url, etag, body);
      }

      return {
        body,
        status: response.status,
        etag,
        fromCache: false,
        url,
      };
    } catch (err) {
      lastError = err as Error;
      if ((err as Error).name === 'AbortError') {
        console.warn(`  Timeout after ${timeoutMs}ms: ${url}`);
      } else {
        console.warn(`  Fetch error: ${(err as Error).message}`);
      }
    }
  }

  throw new Error(
    `Failed to fetch ${url} after ${maxRetries + 1} attempts: ${lastError?.message}`,
  );
}
