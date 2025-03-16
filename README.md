# bluesky-daily-mcp

An MCP Server to play with daily posts from your follows in Bluesky.

## Installation

Install this MCP Server with your MCP Client, such as Claude Desktop.

## Help for Contributors

### Local Development with watch mode

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
