import { Anthropic } from '@anthropic-ai/sdk';

export async function analyzeText(
    userInput: string,
    apiKey: string,
    modelName: string,
    responseStyle: string,
    systemPrompt: string = ""
  ): Promise<string> {
    console.log(`Analyzing text with model: ${modelName}, style: ${responseStyle}`);
    
    try {
      // Create the client
      const client = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });
      
      // Set temperature based on style
      const temperature = responseStyle === 'creative' ? 0.9 : (responseStyle === 'precise' ? 0.3 : 0.5);
      
      // Create the messages request
      const message = await client.messages.create({
        model: modelName,
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
        return message.content[0].text;
      }
      
      // If first content is not text, find first text block
      const textBlock = message.content?.find(block => block.type === 'text');
      if (textBlock?.type === 'text') {
        return textBlock.text;
      }
      
      return 'No text response from Claude';
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }