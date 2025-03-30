import { describe, expect, it } from 'vitest';
import { dailyPostsResources } from '../lib/resources';

describe('Bluesky Daily MCP Server', () => {
  it('returns list of latest 4 daily post resources', async () => {
    const today = new Date('2025-03-29');
    const resources = dailyPostsResources(today);
    expect(resources).toEqual([
      {
        name: 'BlueSky posts for 20250328',
        uri: 'blueskydaily://posts/20250328',
        description: 'BlueSky posts for the date 20250328',
        mimeType: 'application/json',
      },
      {
        name: 'BlueSky posts for 20250327',
        uri: 'blueskydaily://posts/20250327',
        description: 'BlueSky posts for the date 20250327',
        mimeType: 'application/json',
      },
      {
        name: 'BlueSky posts for 20250326',
        uri: 'blueskydaily://posts/20250326',
        description: 'BlueSky posts for the date 20250326',
        mimeType: 'application/json',
      },
      {
        name: 'BlueSky posts for 20250325',
        uri: 'blueskydaily://posts/20250325',
        description: 'BlueSky posts for the date 20250325',
        mimeType: 'application/json',
      },
    ]);
  });
});
