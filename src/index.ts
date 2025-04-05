import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListPromptsResult,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import {
  promptForTechSummary,
  promptForMermaidDiagram,
  promptRetrieveYesterdayPosts,
} from './lib/prompts';
import { retrievePosts } from './lib/resources';

const server = new Server(
  {
    name: 'Bluesky Daily',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      logging: {},
      prompts: {},
    },
  }
);

const techSummaryPrompt = promptForTechSummary();
const mermaidDiagramPrompt = promptForMermaidDiagram();
const yesterdayPostsPrompt = promptRetrieveYesterdayPosts();

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'bluesky-daily',
        description:
          'Respond to requests about retrieving Bluesky posts for a specific day',
        inputSchema: {
          type: 'object',
          properties: {
            yyyymmdd: {
              type: 'string',
              description:
                "Date in YYYYMMDD format. For example, '20250402' for April 2, 2025.",
            },
          },
          required: ['yyyymmdd'],
          additionalProperties: false,
        },
      } as Tool,
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args, _meta } = request.params;

  if (!args) {
    throw new Error('No arguments provided');
  }

  const yyyymmdd = args?.yyyymmdd as string | undefined;

  if (!yyyymmdd) {
    throw new Error('Missing yyyymmdd argument');
  }

  if (yyyymmdd.length !== 8) {
    throw new Error('yyyymmdd must be in YYYYMMDD format');
  }

  // TODO: ensure yyyymmdd is yesterday or earlier

  if (name === 'bluesky-daily') {
    server.sendLoggingMessage({
      level: 'info',
      data: `Retrieving Bluesky posts for ${yyyymmdd}`,
      logger: 'bluesky-daily',
    });

    const progressToken = request.params._meta?.progressToken;

    try {
      await server.notification({
        method: 'notifications/progress',
        params: {
          progress: 1,
          total: 2,
          progressToken,
        },
      });

      const posts = await retrievePosts(yyyymmdd);

      await server.notification({
        method: 'notifications/progress',
        params: {
          progress: 2,
          total: 2,
          progressToken,
        },
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              date: yyyymmdd,
              posts,
            }),
          },
        ],
        isError: false,
      };
    } catch (e) {
      const err = e as Error;
      return {
        content: [
          {
            type: 'text',
            text: `Error while retrieving posts for ${yyyymmdd} due to ${err.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error('Tool not found');
});

server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
  return {
    prompts: [
      {
        name: techSummaryPrompt.name,
        description: techSummaryPrompt.description,
      },
      {
        name: mermaidDiagramPrompt.name,
        description: mermaidDiagramPrompt.description,
      },
      {
        name: yesterdayPostsPrompt.name,
        description: yesterdayPostsPrompt.description,
      },
    ],
  } as ListPromptsResult;
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === techSummaryPrompt.name) {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: techSummaryPrompt.prompt,
          },
        },
      ],
    };
  }

  if (name === mermaidDiagramPrompt.name) {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: mermaidDiagramPrompt.prompt,
          },
        },
      ],
    };
  }

  if (name === yesterdayPostsPrompt.name) {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: yesterdayPostsPrompt.prompt,
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
