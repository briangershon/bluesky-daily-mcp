export type Prompt = {
  name: string;
  description: string;
  prompt: string;
};

export function promptForTechSummary(): Prompt {
  return {
    name: 'Summarize Key Technical Topics',
    description: 'Generate a summary of key technical topics in Bluesky posts',
    prompt: `Analyze these Bluesky posts and provide a markdown summary.
    
    Guidelines:
    - analyze the posts all together to find key topics
    - do not group by author
    - Summarize key topics and include details so it is not generic
    - Explain which posts were part of each topic
    - urlToOriginalPost is a Bluesky post is in the format of "https://bsky.app/profile/did:plc:<DID>/post/<postId>". Do not modify, shorten, or split urlToOriginalPost links in any way. Treat the 'did:plc' component of links as an essential part of the URL that must be preserved intact. When sharing links, always verify that the full URL is visible and clickable. Links should always be on one line.
    - Annotate each summary with urlToOriginalPost
    
    Most Interesting (prioritize posts that have content with URLs or software development):
        
    Other Content:
    
    - Brief overview
    - URLs`,
  };
}

export function promptForMermaidDiagram(): Prompt {
  return {
    name: 'Create Mermaid Diagram',
    description: 'Create a mind map of authors and their posts using mermaid.',
    prompt: `Create a mind map of authors and their posts using mermaid.`,
  };
}

export function promptRetrieveYesterdayPosts(): Prompt {
  return {
    name: `Retrieve yesterday's posts`,
    description: `Retrieve yesterday's Bluesky posts`,
    prompt: `Retrieve yesterday's Bluesky posts.`,
  };
}

// create a mermaid mind map of authors and their posts using mermaid

// create a mermaid diagram of all the post authors and their posts
