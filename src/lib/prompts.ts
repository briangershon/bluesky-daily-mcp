export type Prompt = {
  description: string;
  prompt: string;
};

export type PromptDict = {
  [key: string]: Prompt;
};

export const PROMPT_SUMMARIZE_KEY_TECHNICAL_TOPICS =
  'Summarize Key Technical Topics';
export const PROMPT_RETRIEVE_YESTERDAY_POSTS = "Retrieve yesterday's posts";
export const PROMPT_SUMMARIZE_AUTHORS_POSTS = "Summarize Authors' Posts";

export const prompts: Record<string, Prompt> = {
  [PROMPT_SUMMARIZE_KEY_TECHNICAL_TOPICS]: {
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
  },
  [PROMPT_RETRIEVE_YESTERDAY_POSTS]: {
    description: "Retrieve yesterday's Bluesky posts",
    prompt: "Retrieve yesterday's Bluesky posts.",
  },
  [PROMPT_SUMMARIZE_AUTHORS_POSTS]: {
    description: "Summarize each author's posts and group by author",
    prompt:
      "Group posts by Author and then summarize each author's posts. Show post count, and a summary of their posts. Include the most interesting posts and any notable themes or topics. Provide a markdown summary with links to the original posts. For authors, show link to their profile on Bluesky.",
  },
};
