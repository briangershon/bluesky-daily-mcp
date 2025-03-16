# bluesky-daily-mcp

An MCP Server to play with daily posts from your follows in Bluesky.

## Installation

Install this MCP Server with your MCP Client, such as Claude Desktop.

For Claude Desktop, you can install this MCP Server by adding the following to your `~/Library/Application\ Support/Claude/claude_desktop_config.json` (on MacOS):

```json
{
  "mcpServers": [
    "bluesky-daily-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/your/dist/index.js"]
    }  ]
}
```

Build the MCP Server:

```bash
npm install
npm run build
```

Restart Claude Desktop to load up new MCP Server.

## Help for Contributors

### Local Development

Debug with MCP Inspector:

```bash
npm install
npm run inspector
```

### Run tests or coverage reports

```bash
npm test
npm run coverage
```

### Steps for publishing package to NPM

After merging latest code to `main` branch:

1. Locally, `git checkout main && git pull`
2. `npm version patch` # or minor, or major
3. `git push --follow-tags`
4. Create a GitHub release
