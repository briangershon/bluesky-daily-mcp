import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListPromptsResult,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { promptForTechSummary } from './lib/prompts';
import { dailyPostsResources, retrievePosts } from './lib/resources';

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
      resources: {},
    },
  }
);

const techSummaryPrompt = promptForTechSummary();

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'hello_debug',
        description: 'Respond to greetings such as hello',
        inputSchema: {
          type: 'object',
          properties: {
            // query: {
            //   type: 'string',
            //   description:
            //     "Local search query (e.g. 'pizza near Central Park')",
            // },
          },
          required: [],
          additionalProperties: false,
        },
      } as Tool,
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args, _meta } = request.params;

  const progressToken = _meta?.progressToken;
  console.error('progressToken', progressToken);

  if (!args) {
    throw new Error('No arguments provided');
  }

  // console.log('Tool call received:', JSON.stringify(request.params));
  // throw new Error(JSON.stringify(request, null, 2));
  if (name === 'hello_debug') {
    // const { a, b } = request.params.arguments;
    server.sendLoggingMessage({
      level: 'info',
      data: 'HELLO TOOL LOG INFO',
      logger: 'hello-debug',
    });

    // const stepDuration = 10;
    // const steps = 5;
    // for (let i = 1; i < steps + 1; i++) {
    //   await new Promise((resolve) => setTimeout(resolve, stepDuration * 1000));

    //   if (progressToken !== undefined) {
    //     await server.notification({
    //       method: 'notifications/progress',
    //       params: {
    //         progress: i,
    //         total: steps,
    //         progressToken,
    //         message: `Step ${i} of ${steps}`,
    //       },
    //     });
    //   }
    // }

    // setTimeout(() => {
    //   console.error('SET TIMEOUT');
    //   const notification = {
    //     method: 'notifications/progress',
    //     params: {
    //       progressToken: progressToken,
    //       process: 0,
    //       total: 100,
    //       message: 'my progress message',
    //     },
    //   };
    //   server.notification(notification);
    // }, 10000);

    return {
      content: [
        {
          type: 'text',
          text: 'HOWDY!',
        },
      ],
    };
  }
  throw new Error('Tool not found');
});

// server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
//   return {
//     resourceTemplates: [
//       {
//         uriTemplate: 'blueskydaily://posts/{yyyymmdd}',
//         name: 'Static Resource',
//         description: 'A static resource with a numeric ID',
//       },
//     ],
//   };
// });

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: dailyPostsResources(new Date()),
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri, arguments: args, _meta } = request.params;
  console.error(JSON.stringify({ uri, args, _meta }));

  const yyyymmdd = uri.split('://posts/')[1];

  const progressToken = `bluesky-daily-posts-${yyyymmdd}`; // _meta?.progressToken;
  console.error('progressToken', progressToken);

  server.sendLoggingMessage({
    level: 'info',
    data: 'HELLO RESOURCE',
    logger: 'hello-resource',
  });

  // const uri = request.params.uri.toString();

  if (uri.startsWith('blueskydaily://')) {
    if (progressToken !== undefined) {
      await server.notification({
        method: 'notifications/progress',
        params: {
          progress: 1,
          total: 2,
          progressToken,
          message: `Step 1 of 2`,
        },
      });
    }

    const posts = await retrievePosts(yyyymmdd);

    if (progressToken !== undefined) {
      await server.notification({
        method: 'notifications/progress',
        params: {
          progress: 2,
          total: 2,
          progressToken,
          message: `Step 2 of 2`,
        },
      });
    }

    if (yyyymmdd) {
      return {
        contents: [
          {
            uri,
            text: JSON.stringify({
              date: yyyymmdd,
              posts,
            }),
            mimeType: 'application/json',
          },
        ],
      };
    }
  }

  throw new Error(`Resource not found: ${uri}`);
});

/**
 * Generate a summary of key technical topics in Bluesky posts.
 * posts: Pass in a stringified JSON object with a list of posts.
 */
server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
  return {
    prompts: [
      {
        name: techSummaryPrompt.name,
        description: techSummaryPrompt.name,
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

  throw new Error(`Unknown prompt: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main()
  .then(() => {
    console.error('--- Server connected');
  })
  .catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
