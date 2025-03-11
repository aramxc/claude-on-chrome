import axios from 'axios';
import { logger } from '../utils/logger';

interface ClaudeRequestParams {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  system?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function analyzeText(params: ClaudeRequestParams) {
  const { apiKey, model, messages, system, temperature = 0.5, max_tokens = 1000 } = params;
  
  logger.info(`Sending request to Anthropic API for model: ${model}`);
  
  try {
    const requestBody: any = {
      model,
      messages,
      max_tokens,
      temperature
    };
    
    if (system) {
      requestBody.system = system;
    }
    
    const response = await axios.post('https://api.anthropic.com/v1/messages', requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    });
    
    logger.info('Successfully received response from Anthropic API');
    return response.data;
  } catch (error: any) {
    logger.error(`Error from Anthropic API: ${error.message}`);
    
    if (error.response) {
      logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      throw {
        message: `Anthropic API error: ${error.response.data.error?.message || 'Unknown error'}`,
        statusCode: error.response.status
      };
    }
    
    throw {
      message: `Error connecting to Anthropic API: ${error.message}`,
      statusCode: 500
    };
  }
}