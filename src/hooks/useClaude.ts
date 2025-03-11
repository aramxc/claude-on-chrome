import { Anthropic } from '@anthropic-ai/sdk';
import { useState, useCallback } from 'react';

interface UseClaudeApiOptions {
  apiKey: string;
  model: string;
  style: string;
  systemPrompt: string;
}

interface AnalysisResult {
  loading: boolean;
  error: string | null;
  response: string | null;
  analyzeText: (text: string) => Promise<string | undefined>;
}

export function useClaude({
  apiKey,
  model,
  style,
  systemPrompt
}: UseClaudeApiOptions): AnalysisResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const analyzeText = useCallback(async (userInput: string) => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`Analyzing text with model: ${model}, style: ${style}`);
      
      // Create the client
      const client = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });
      
      // Create the messages request
      const message = await client.messages.create({
        model: model,
        max_tokens: 1000,
        messages: [
          { role: "user", content: userInput }
        ],
        system: systemPrompt
      });
      
      console.log("API Response:", message);
      
      // Extract the response text
      let result = 'No text response from Claude';
      
      if (message.content && message.content.length > 0) {
        const firstContent = message.content[0];
        
        if (firstContent.type === 'text') {
          result = firstContent.text;
        } else {
          console.warn('First content block is not text:', firstContent);
          
          const textBlock = message.content.find(block => block.type === 'text');
          if (textBlock && 'text' in textBlock) {
            result = textBlock.text;
          }
        }
      }
      
      setResponse(result);
      return result;
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiKey, model, style, systemPrompt]);

  return {
    loading,
    error,
    response,
    analyzeText
  };
}