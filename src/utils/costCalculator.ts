import { MODEL_RATES } from '../types/usage';

export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  formattedCost: string;
}

export function calculateCost(
  model: string, 
  inputTokens: number, 
  outputTokens: number
): CostBreakdown {
  // Get the base model name for rate lookup
  const baseModelName = model.split('-').slice(0, 3).join('-');
  
  // Get rates from the shared MODEL_RATES object
  const modelRates = MODEL_RATES[baseModelName] || MODEL_RATES['claude-3-opus'];
  
  // Calculate costs using the rates
  const inputCost = inputTokens * modelRates.input / 1000000; // Convert from per million
  const outputCost = outputTokens * modelRates.output / 1000000; // Convert from per million
  const totalCost = inputCost + outputCost;
  
  // Format cost for display
  const formattedCost = totalCost < 0.01
    ? `${(totalCost * 100).toFixed(2)}¢` 
    : `$${totalCost.toFixed(2)}`;
  
  return {
    inputCost,
    outputCost,
    totalCost,
    formattedCost
  };
}