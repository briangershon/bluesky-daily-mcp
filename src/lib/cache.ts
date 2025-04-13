import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory path (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the cache file path for a given date
 */
export function getCacheFilePath(yyyymmdd: string): string {
  const cacheDir = path.join(__dirname, '..', '..', '.cache');

  // Create cache directory if it doesn't exist
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  return path.join(cacheDir, `${yyyymmdd}.json`);
}

/**
 * Check if the cache file exists and is fresh (less than 24 hours old)
 */
export function isCacheFresh(yyyymmdd: string): boolean {
  const filePath = getCacheFilePath(yyyymmdd);
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const stats = fs.statSync(filePath);
  const fileAge = Date.now() - stats.mtimeMs;
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  return fileAge < maxAge;
}

export function retrieveFromCache(yyyymmdd: string): string {
  const filePath = getCacheFilePath(yyyymmdd);
  return fs.readFileSync(filePath, 'utf-8');
}

export function saveToCache(yyyymmdd: string, data: any): void {
  const filePath = getCacheFilePath(yyyymmdd);
  fs.writeFileSync(filePath, data);
}
