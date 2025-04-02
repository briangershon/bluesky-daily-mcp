import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
// import { promptForTechSummary } from './lib/prompts';
// import {
//   dailyPostsResources,
//   dailyPostsResourcesTemplateUri,
//   retrievePosts,
// } from './lib/resources';

const server = new Server(
  {
    name: 'Bluesky Daily',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      logging: {},
    },
  }
);

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

    const stepDuration = 10;
    const steps = 5;
    for (let i = 1; i < steps + 1; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration * 1000));

      if (progressToken !== undefined) {
        await server.notification({
          method: 'notifications/progress',
          params: {
            progress: i,
            total: steps,
            progressToken,
            message: `Step ${i} of ${steps}`,
          },
        });
      }
    }

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

// server.resource(
//   'blueskydaily-posts',
//   new ResourceTemplate(dailyPostsResourcesTemplateUri, {
//     list: () => {
//       const resources = dailyPostsResources(new Date());
//       return { resources };
//     },
//   }),
//   async (uri, { yyyymmdd }) => {
//     return {
//       contents: [
//         {
//           uri: uri.href,
//           text: JSON.stringify({
//             date: yyyymmdd,
//             posts: await retrievePosts(yyyymmdd),
//           }),
//           mimeType: 'application/json',
//         },
//       ],
//     };
//   }
// );

// /**
//  * Generate a summary of key technical topics in Bluesky posts.
//  * posts: Pass in a stringified JSON object with a list of posts.
//  */
// const techSummaryPrompt = promptForTechSummary();
// server.prompt(
//   techSummaryPrompt.name,
//   techSummaryPrompt.description,
//   {},
//   async ({}, extra) => {
//     return {
//       messages: [
//         {
//           role: 'user',
//           content: {
//             type: 'text',
//             text: techSummaryPrompt.prompt,
//           },
//         },
//       ],
//     };
//   }
// );

async function main() {
  const transport = new StdioServerTransport();
  console.error('XXXXX About to Connected to transport');
  await server.connect(transport);
  console.error('XXXXX Connected to transport');
}

main();
