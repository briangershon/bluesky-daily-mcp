# bluesky-daily-mcp

An MCP Server to help you surface the most interesting topics from your Bluesky follows daily.

## Features

- a tool to retrieve all posts from your follows for a given day
- sample prompts for analyzing posts
- caches the posts for a given day

Posts are retrieved via [`bsky-tldr`](https://www.npmjs.com/package/bsky-tldr) npm package which normalizes them into this format for easy consumption by LLM:

```json
[
  {
    "uri": "at://did:plc:kft6lu4trxowqmter2b6vg6z/app.bsky.feed.post/3lh4unyelgs2i",
    "content": "There are some missing details in this report claiming to have leaked the system prompt - most notably they don't clarify if they got the system prompt for DeepSeek v3 or DeepSeek R1 (I'm interred in R1) lab.wallarm.com/jailbreaking...",
    "createdAt": "2025-02-01T15:53:09.612Z",
    "isRepost": false,
    "links": ["https://lab.wallarm.com/jailbreaking-generative-ai/"]
  }
]
```

<img src="https://github.com/briangershon/bluesky-daily-mcp/blob/main/screenshots/visual-summary-of-bluesky-posts.jpg?raw=true" width="600" height="600" alt="Visual Summary of Bluesky Posts" />

## Limitations

- This retrieves all posts from your follows for a given day. This will become large and subsequently you'll lose posts that are truncated by the MCP Client or the LLM's context window. Will need additional strategies to handle this.

## Installation

Install this MCP Server with your MCP Client, such as Claude Desktop.

Here are the three steps:

👉 1. **Build the MCP Server first**

```bash
npm install
npm run build
```

👉 2. **Configure.** For Claude Desktop, you can install this MCP Server by adding the following to your `~/Library/Application\ Support/Claude/claude_desktop_config.json` (on MacOS):

```json
{
  "mcpServers": [
    "bluesky-daily-mcp": {
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/to/this/dist/index.js"],
      "env": {
        "BLUESKY_HANDLE": "",
        "BLUESKY_APP_PASSWORD": "",
        "TIMEZONE_OFFSET": "-8",
        "REQUEST_TIMEOUT_MS": "120000"
      }
    }
  ]
}
```

What are these env variables?

- `BLUESKY_HANDLE` is your Bluesky handle without the @ sign, e.g. `your_handle.bsky.social` or `customdomain.com`.
- `BLUESKY_APP_PASSWORD` is a Bluesky app password, which you can generate from the [Bluesky App Passwords Settings page](https://bsky.app/settings/app-passwords).
- `TIMEZONE_OFFSET` is the timezone offset from UTC in hours. For example, `-8` for PST, `+8` for CST. This helps define what a "day" is for you, so it's not hard-coded to UTC.
- `REQUEST_TIMEOUT_MS` is the max timeout for the request that retrieves the posts to run. Without this, you have a default of ~60 seconds (60000 ms). Recommend setting this to 2 minutes (120000 ms).

👉 3. **Restart Claude Desktop to load up new MCP Server.**

## Try it out

- Fire up Claude Desktop and start a new conversation
- Type in "Retrieve Bluesky posts from yesterday" or "Retrieve Bluesky posts from April 2nd" (or whatever date you want)

<img src="https://github.com/briangershon/bluesky-daily-mcp/blob/main/screenshots/claude-desktop.png?raw=true" width="800" alt="Using MCP Server with Claude Desktop" />

## Help for Contributors

### Running locally for development

Setup your local `.env` file with:

```bash
BLUESKY_HANDLE=
BLUESKY_APP_PASSWORD=
TIMEZONE_OFFSET=
```

Debug with MCP Inspector:

````bash
npm install
npm run build && npx @modelcontextprotocol/inspector -e BLUESKY_HANDLE=XXX -e BLUESKY_APP_PASSWORD=XXX -e TIMEZONE_OFFSET=XXX node dist/index.js
```

Debug by viewing logs

```bash
tail -n 20 -F ~/Library/Logs/Claude/mcp-server-bluesky-daily-mcp.log
````

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

## Steps for publishing package to NPM

After merging latest code to main branch:

1. Locally, `git checkout main && git pull`
2. `npm version patch` # or minor, or major
3. `git push --follow-tags`
4. A GitHub release is automatically written and published
