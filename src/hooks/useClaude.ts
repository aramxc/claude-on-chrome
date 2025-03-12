import Anthropic from '@anthropic-ai/sdk';
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
      
      // Set temperature based on style
      const temperature = style === 'creative' ? 0.9 : (style === 'precise' ? 0.3 : 0.5);
      
      // Create the messages request
      const message = await client.messages.create({
        model: model,
        max_tokens: 1000,
        temperature: temperature,
        messages: [
          { role: "user", content: userInput }
        ],
        system: systemPrompt
      });
      
      console.log("API Response:", message);
      
      // Extract the response text
      if (message.content?.[0]?.type === 'text') {
        const result = message.content[0].text;
        setResponse(result);
        return result;
      }
      
      // If first content is not text, find first text block
      const textBlock = message.content?.find(block => block.type === 'text');
      if (textBlock?.type === 'text') {
        const result = textBlock.text;
        setResponse(result);
        return result;
      }
      
      const noResponseMessage = 'No text response from Claude';
      setResponse(noResponseMessage);
      return noResponseMessage;
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      
      // Provide more helpful error messages for common issues
      if (error.message?.includes('authentication_error') || error.status === 401) {
        setError('Authentication failed: Your organization may not allow browser requests. Try using a proxy or server-side API calls.');
      } else if (error.message?.includes('CORS')) {
        setError('CORS error: Your organization may not allow browser requests. Try using a proxy or server-side API calls.');
      } else {
        setError(error.message || 'An error occurred');
      }
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