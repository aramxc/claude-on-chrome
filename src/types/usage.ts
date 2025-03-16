export interface ModelRates {
    input: number;
    output: number;
  }
  
  export interface UsageRecord {
    inputTokens: number;
    outputTokens: number;
    timestamp: number;
    model: string;
  }
  
  export interface DailyUsage {
    spend: number;
    inputTokens: number;
    outputTokens: number;
    inputRate: number;
    outputRate: number;
  }
  
  export interface ModelUsage {
    inputTokens: number;
    outputTokens: number;
    spend: number;
  }
  
  export interface UsageSummary {
    totalSpend: number;
    accountCredits: number;
    accountBalance: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    usageByDay: Record<string, DailyUsage>;
    usageByModel: Record<string, ModelUsage>;
  }
  
  // Current Model Rates per token: https://www.anthropic.com/pricing#anthropic-api
export const MODEL_RATES: Record<string, ModelRates> = {
    'claude-3-5-haiku': { input: 0.8, output: 4.0 }, // $0.80 per 1M input, $4 per 1M output
    'claude-3-5-sonnet': { input: 3.0, output: 15.0 }, // $3 per 1M input, $15 per 1M output
    'claude-3-7-sonnet': { input: 3.0, output: 15.0 }, // $3 per 1M input, $15 per 1M output
    'claude-3-opus': { input: 15.0, output: 75.0 }, // $15 per 1M input, $75 per 1M output
    'claude-3-sonnet': { input: 3.0, output: 15.0 }, // $3 per 1M input, $15 per 1M output
    'claude-3-haiku': { input: 0.25, output: 1.25 }, // $0.25 per 1M input, $1.25 per 1M output
}