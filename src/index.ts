import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { techSummaryPrompt } from './lib/prompts';

const server = new McpServer({
  name: 'Bluesky Daily',
  version: '1.0.0',
});

server.resource(
  'blueskydaily',
  new ResourceTemplate('blueskydaily://{message}', { list: undefined }),
  async (uri, { message }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Resource echo: ${message}`,
      },
    ],
  })
);

/**
 * Generate a summary of key technical topics in Bluesky posts.
 * posts: Pass in a stringified JSON object with a list of posts.
 */
server.prompt(
  'tech-summary',
  'Generate a summary of key technical topics in Bluesky posts',
  { posts: z.string() },
  ({ posts }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: techSummaryPrompt({ posts }),
        },
      },
    ],
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
