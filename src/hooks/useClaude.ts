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
  analyzeText: (text: string) => Promise<void>;
}

// Update this with your Vercel deployment URL
const PROXY_URL = 'https://your-vercel-deployment-url.vercel.app/api/claude';

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
      
      const requestBody: any = {
        model: model,
        max_tokens: 1000,
        messages: [
          { 
            role: 'user', 
            content: userInput 
          }
        ],
        temperature: style === 'creative' ? 0.9 : (style === 'precise' ? 0.3 : 0.5),
      };
      
      // Only add system if it's provided
      if (systemPrompt && systemPrompt.trim() !== '') {
        requestBody.system = systemPrompt;
      }
      
      console.log("Request body:", JSON.stringify(requestBody, null, 2));
      
      // Use the proxy server
      const apiResponse = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          
        },
        body: JSON.stringify(requestBody),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        console.error("API Error:", errorData);
        throw new Error(`API request failed: ${apiResponse.status} - ${errorData}`);
      }

      const responseData = await apiResponse.json();
      console.log("API Response:", responseData);
      const result = responseData.content[0].text || 'No response from Claude';
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