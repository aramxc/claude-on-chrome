// src/services/costEstimationService.ts

// Token counting approximation (rough estimate)
export function estimateTokenCount(text: string): number {
    // A very rough approximation: average English word is ~1.3 tokens
    // Claude counts tokens differently than OpenAI, but this is a reasonable approximation
    return Math.ceil(text.split(/\s+/).length * 1.3);
  }
  
  // Cost estimation per model (rates as of March 2025)
  export const MODEL_RATES: Record<string, { input: number, output: number }> = {
    'claude-3-opus-20240229': {
      input: 0.000015,  // $15 per million input tokens
      output: 0.000075, // $75 per million output tokens
    },
    'claude-3-7-sonnet-20250219': {
      input: 0.000003,  // $3 per million input tokens
      output: 0.000015, // $15 per million output tokens
    },
    'claude-3-haiku-20240307': {
      input: 0.000000125, // $0.125 per million input tokens
      output: 0.000000625, // $0.625 per million output tokens
    },
  };
  
  interface CostEstimate {
    inputTokens: number;
    outputTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
    formattedCost: string;
  }
  
  export function estimateCost(
    inputText: string, 
    outputText: string, 
    model: string
  ): CostEstimate {
    // Default to Opus if model not found
    const rates = MODEL_RATES[model] || MODEL_RATES['claude-3-opus-20240229'];
    
    // Estimate tokens
    const inputTokens = estimateTokenCount(inputText);
    const outputTokens = estimateTokenCount(outputText);
    
    // Calculate costs
    const inputCost = inputTokens * rates.input;
    const outputCost = outputTokens * rates.output;
    const totalCost = inputCost + outputCost;
    
    // Format cost for display
    let formattedCost: string;
    if (totalCost < 0.01) {
      formattedCost = `~$${(totalCost * 100).toFixed(2)}¢`; // Show in cents
    } else {
      formattedCost = `~$${totalCost.toFixed(2)}`;
    }
    
    return {
      inputTokens,
      outputTokens,
      inputCost,
      outputCost,
      totalCost,
      formattedCost
    };
  }