import { Agent, CredentialSession } from '@atproto/api';
import {
  getDailyPostsFromFollows,
  retrieveAuthorFeedGenerator,
  retrieveFollowsGenerator,
  uriToUrl,
  type DailyPostsFromFollowsResponse,
} from 'bsky-tldr';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

type MCPResource = {
  name: string;
  uri: string;
  description: string;
  mimeType: string;
};

// these attributes are named to be meaningful to the LLM model
type StandalonePost = {
  urlToOriginalPost: string;
  authorWhoPostedOrReposted: string;
  content: string;
  links: string[];
  didAuthorRepost: boolean;
};

export const dailyPostsResourcesTemplateUri = 'blueskydaily://posts/{yyyymmdd}';

export function dailyPostsResources(today: Date): MCPResource[] {
  const resources = [];

  // generate last 4 days, excluding today
  for (let i = 1; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
    resources.push({
      name: `BlueSky posts for ${yyyymmdd}`,
      uri: dailyPostsResourcesTemplateUri.replace('{yyyymmdd}', yyyymmdd),
      description: `BlueSky posts for the date ${yyyymmdd}`,
      mimeType: 'application/json',
    });
  }
  return resources;
}

// Get the current file's directory path (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the cache file path for a given date
 */
function getCacheFilePath(yyyymmdd: string): string {
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
function isCacheFresh(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const stats = fs.statSync(filePath);
  const fileAge = Date.now() - stats.mtimeMs;
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  return fileAge < maxAge;
}

/**
 * Retrieve posts from Bluesky for a given date, with caching
 */
export async function retrievePosts(
  yyyymmdd: string | string[]
): Promise<StandalonePost[]> {
  if (Array.isArray(yyyymmdd)) {
    throw new Error('array of yyyymmdd not yet supported');
  }

  const cacheFilePath = getCacheFilePath(yyyymmdd);

  // Check if we have a fresh cache
  if (isCacheFresh(cacheFilePath)) {
    const cachedData = fs.readFileSync(cacheFilePath, 'utf-8');
    return JSON.parse(cachedData);
  }

  const sourceActor = process.env.BLUESKY_HANDLE;
  const appPassword = process.env.BLUESKY_APP_PASSWORD;
  const timezoneOffset = process.env.TIMEZONE_OFFSET;

  if (!sourceActor || !appPassword || !timezoneOffset) {
    throw new Error(
      'BLUESKY_USER_NAME and BLUESKY_APP_PASSWORD and TIMEZONE_OFFSET must be set'
    );
  }

  const targetDate = yyyymmdd;

  const session = new CredentialSession(new URL('https://bsky.social'));
  const bluesky = new Agent(session);
  const loginResponse = await session.login({
    identifier: sourceActor,
    password: appPassword,
  });

  if (loginResponse.success === false) {
    throw new Error('Bluesky Login failed');
  }

  const response: DailyPostsFromFollowsResponse =
    await getDailyPostsFromFollows({
      bluesky,
      sourceActor,
      targetDate,
      timezoneOffset: parseInt(timezoneOffset, 10),
      retrieveFollows: retrieveFollowsGenerator,
      retrieveAuthorFeed: retrieveAuthorFeedGenerator,
    });

  const follows = response.follows;

  // build an array of all posts, not focused on author
  const dailyPosts: StandalonePost[] = [];
  for (const authorDid in follows) {
    const posts = follows[authorDid].posts;
    for (const post of posts) {
      dailyPosts.push({
        urlToOriginalPost: uriToUrl(post.uri) || '',
        authorWhoPostedOrReposted: authorDid,
        content: post.content,
        links: post.links,
        didAuthorRepost: post.isRepost,
      });
    }
  }

  // Cache the results
  fs.writeFileSync(cacheFilePath, JSON.stringify(dailyPosts, null, 2));

  return dailyPosts;
}
