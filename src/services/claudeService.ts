import { ClaudeConfig } from '../types/claude';

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
  
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'callClaudeAPI',
      payload: {
        apiKey: config.apiKey,
        model: config.model,
        system: config.systemPrompt || "",
        content: text,
        temperature: config.temperature
      }
    });
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    // Extract response text from content array
    const textBlock = response.result.content?.find((block: any) => block.type === 'text');
    return textBlock?.text || 'No text response from Claude';
    
  } catch (error: any) {
    console.error("Error calling Claude API:", error);
    if (error.message?.includes('Could not establish connection')) {
      throw new Error('Communication with background script failed. Please reload the extension.');
    }
    throw error;
  }
}