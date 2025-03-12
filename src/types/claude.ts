// Types for Claude API
export interface ClaudeConfig {
    apiKey: string;
    model: string;
    style: string;
    systemPrompt?: string;
  }
  
  export interface ClaudeResponse {
    content: Array<{
      type: string;
      text: string;
    }>;
  }