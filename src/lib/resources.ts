type MCPResource = {
  name: string;
  uri: string;
  description: string;
  mimeType: string;
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

export function retrievePosts(yyyymmdd: string | string[]): any[] {
  if (Array.isArray(yyyymmdd)) {
    throw new Error('array of yyyymmdd not supported');
  }

  return [
    { post: 'post 1 about Typescript' },
    { post: 'post 2 about React' },
    { post: 'post 3 about Node.js' },
  ];
}
