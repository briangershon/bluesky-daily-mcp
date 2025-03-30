export type TechSummaryPrompt = {
  name: string;
  description: string;
  prompt: string;
};

export function promptForTechSummary(): TechSummaryPrompt {
  return {
    name: 'Summarize Key Technical Topics',
    description: 'Generate a summary of key technical topics in Bluesky posts',
    prompt: `Analyze these Bluesky posts and provide a markdown summary.
    
    Guidelines:
    - analyze the posts all together to find key topics
    - do not group by author
    - Summarize key topics and include details so it is not generic
    - Explain which posts were part of each topic
    - Annotate each summary with urlToOriginalPost. Do not modify, shorten, or split urlToOriginalPost links in any way. Treat the 'did' component of links as an essential part of the URL that must be preserved intact. When sharing links, always verify that the full URL is visible and clickable.
    
    Most Interesting (prioritize posts that have content with URLs or software development):
        
    Other Content:
    
    - Brief overview
    - URLs`,
  };
}
