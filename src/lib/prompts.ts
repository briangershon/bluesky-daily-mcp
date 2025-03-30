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
    
    Most Interesting (prioritize posts that have content with URLs or software development):
    
    - Summarize key topics and include details so it is not generic
    - Explain which posts were part of each topic
    - Annotate each summary with urlToOriginalPost from source posts.
    
    Other Content:
    
    - Brief overview
    - URLs`,
  };
}
