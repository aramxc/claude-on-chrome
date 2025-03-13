export interface UsageRecord {
    inputTokens: number;
    outputTokens: number;
    timestamp: number;
    model: string;
  }
  
export interface UsageSummary {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    usageByDay: Record<string, {
        inputTokens: number;
        outputTokens: number;
        cost: number;
    }>;
    usageByModel: Record<string, {
        inputTokens: number;
        outputTokens: number;
        cost: number;
    }>;
}