import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'Bluesky Daily',
  version: '0.1.0',
  capabilities: {
    resources: {},
    prompts: {},
  },
});

server.resource(
  'blueskydaily-posts',
  new ResourceTemplate('blueskydaily://posts/{yyyymmdd}', {
    list: () => {
      // Get last 7 days as YYYYMMDD strings
      const dates = [];
      const today = new Date();
      // generate 4 days, excluding today
      for (let i = 1; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
        dates.push({
          name: `BlueSky posts for ${yyyymmdd}`,
          uri: `blueskydaily://posts/${yyyymmdd}`,
          description: `BlueSky posts for the date ${yyyymmdd}`,
          mimeType: 'application/json',
        });
      }
      return { resources: dates };
    },
  }),
  async (uri, { yyyymmdd }) => {
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify({
            date: yyyymmdd,
            posts: [
              { post: 'post 1 about Typescript' },
              { post: 'post 2 about React' },
              { post: 'post 3 about Node.js' },
            ],
          }),
          mimeType: 'application/json',
        },
      ],
    };
  }
);

/**
 * Generate a summary of key technical topics in Bluesky posts.
 * posts: Pass in a stringified JSON object with a list of posts.
 */
server.prompt(
  'Summarize Key Technical Topics',
  'Generate a summary of key technical topics in Bluesky posts',
  {},
  async ({}, extra) => {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Analyze these Bluesky posts and provide a markdown summary.
    
    Guidelines:
    - analyze the posts all together to find key topics
    - do not group by author
    
    Most Interesting (prioritize posts that have content with URLs or software development):
    
    - Summarize key topics and include details so it is not generic
    - Explain which posts were part of each topic
    - Annotate each summary with urlToOriginalPost from source posts.
    
    Other Content:
    
    - Brief overview
    - URLs`,
          },
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
