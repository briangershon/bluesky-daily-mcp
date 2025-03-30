# bluesky-daily-mcp

An MCP Server to retrieve and play with daily posts from your follows in Bluesky.

## Installation

Install this MCP Server with your MCP Client, such as Claude Desktop.

For Claude Desktop, you can install this MCP Server by adding the following to your `~/Library/Application\ Support/Claude/claude_desktop_config.json` (on MacOS):

```json
{
  "mcpServers": [
    "bluesky-daily-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/your/dist/index.js"],
      "env": {
        "BLUESKY_HANDLE": "",
        "BLUESKY_APP_PASSWORD": "",
        "TIMEZONE_OFFSET": "-8",
      }
    }
  ]
}
```

What are these env variables?

`BLUESKY_HANDLE` is your Bluesky handle without the @ sign, e.g. `your_handle.bsky.social` or `customdomain.com`.
`BLUESKY_APP_PASSWORD` is your Bluesky app password, which you can generate from the [Bluesky App Passwords Settings page](https://bsky.app/settings/app-passwords).
`TIMEZONE_OFFSET` is the timezone offset from UTC in hours. For example, `-8` for PST, `+8` for CST.

Build the MCP Server:

```bash
npm install
npm run build
```

Restart Claude Desktop to load up new MCP Server.

## Help for Contributors

### Local Development

Setup your local `.env` file with:

```bash
BLUESKY_HANDLE=
BLUESKY_APP_PASSWORD=
TIMEZONE_OFFSET=
```

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

### Manually retrieve posts

If you want to make sure the post retrieval code is running ok with your .env, run:

```bash
npm run retrieve-posts
```

### Steps for publishing package to NPM

After merging latest code to `main` branch:

1. Locally, `git checkout main && git pull`
2. `npm version patch` # or minor, or major
3. `git push --follow-tags`
4. Create a GitHub release
