// Types for Claude API
export interface ClaudeConfig {
    apiKey: string;
    model: string;
    style: string;
    systemPrompt?: string;
    temperature?: number;
  }
  
  export interface ClaudeResponse {
    content: Array<{
      type: string;
      text: string;
    }>;
    model: string;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  }