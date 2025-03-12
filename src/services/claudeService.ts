import { ClaudeConfig, ClaudeResponse } from '../types/claude';

/**
 * Call Claude API to analyze text
 */
export async function analyzeText(
  text: string,
  config: ClaudeConfig
): Promise<string> {
  if (!config.apiKey) {
    throw new Error('API key is required');
  }
  
  if (!text.trim()) {
    throw new Error('No text to analyze');
  }
  
  // Set temperature based on style
  const temperature = 
    config.style === 'creative' ? 0.9 : 
    config.style === 'precise' ? 0.3 : 
    0.5; // default
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": config.apiKey,
        "anthropic-version": "2025-01-24",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 1000,
        temperature,
        messages: [{ role: "user", content: text }],
        system: config.systemPrompt || ""
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      // Friendly error messages
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      } else {
        throw new Error(errorData?.error?.message || `API error: ${response.status}`);
      }
    }
    
    const data = await response.json() as ClaudeResponse;
    
    // Extract response text from content array
    const textBlock = data.content?.find(block => block.type === 'text');
    return textBlock?.text || 'No text response from Claude';
    
  } catch (error: any) {
    if (error.name === 'TypeError' || error.message?.includes('CORS')) {
      throw new Error('Browser security blocked the request. Try using a proxy.');
    }
    throw error;
  }
}