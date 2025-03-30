import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { techSummaryPrompt } from './lib/prompts';
import {
  dailyPostsResources,
  dailyPostsResourcesTemplateUri,
  retrievePosts,
} from './lib/resources';

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
  new ResourceTemplate(dailyPostsResourcesTemplateUri, {
    list: () => {
      const resources = dailyPostsResources(new Date());
      return { resources };
    },
  }),
  async (uri, { yyyymmdd }) => {
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify({
            date: yyyymmdd,
            posts: retrievePosts(yyyymmdd),
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
            text: techSummaryPrompt(),
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
