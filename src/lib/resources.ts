import { Agent, CredentialSession } from '@atproto/api';
import { retrieveAuthorFeed, retrieveFollows, uriToUrl } from 'bsky-tldr';
import 'dotenv/config';
import { isCacheFresh, retrieveFromCache, saveToCache } from './cache';

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

/**
 * Retrieve posts from Bluesky for a given date, with caching
 */
export async function retrievePosts(
  yyyymmdd: string | string[]
): Promise<StandalonePost[]> {
  if (Array.isArray(yyyymmdd)) {
    throw new Error('array of yyyymmdd not yet supported');
  }

  if (isCacheFresh(yyyymmdd)) {
    const cachedData = retrieveFromCache(yyyymmdd);
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

  const dailyPosts: StandalonePost[] = [];

  for await (const follow of retrieveFollows({
    bluesky,
    actor: sourceActor,
  })) {
    const posts: StandalonePost[] = [];

    for await (const post of retrieveAuthorFeed({
      bluesky,
      actor: follow.did,
      targetDate: targetDate,
      timezoneOffset: parseInt(timezoneOffset, 10),
    })) {
      posts.push({
        urlToOriginalPost: uriToUrl(post.uri) || '',
        authorWhoPostedOrReposted: follow.did,
        content: post.content,
        links: post.links,
        didAuthorRepost: post.isRepost,
      });
    }

    dailyPosts.push(...posts);
  }

  saveToCache(yyyymmdd, JSON.stringify(dailyPosts, null, 2));

  return dailyPosts;
}
