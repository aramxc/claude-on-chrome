// src/components/Usage.tsx
import React, { useState, useEffect } from 'react';
import { getUsageHistory } from '../services/claudeService';
import { MODEL_RATES } from '../services/costEstimateService';
import { UsageRecord, UsageSummary } from '../types/usage';

// Ensure styling consistency with other tabs
const Usage: React.FC = () => {
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'all'>('week');
  
  useEffect(() => {
    const loadUsageHistory = async () => {
      const history = await getUsageHistory();
      setUsageHistory(history);
    };
    
    loadUsageHistory();
  }, []);
  
  useEffect(() => {
    if (usageHistory.length === 0) return;
    
    // Filter by timeframe
    let filteredHistory = [...usageHistory];
    const now = Date.now();
    
    if (timeFrame === 'week') {
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      filteredHistory = filteredHistory.filter(record => record.timestamp >= oneWeekAgo);
    } else if (timeFrame === 'month') {
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
      filteredHistory = filteredHistory.filter(record => record.timestamp >= oneMonthAgo);
    }
    
    // Calculate summary statistics
    const summary: UsageSummary = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCost: 0,
      usageByDay: {},
      usageByModel: {}
    };
    
    for (const record of filteredHistory) {
      // Update totals
      summary.totalInputTokens += record.inputTokens;
      summary.totalOutputTokens += record.outputTokens;
      
      // Calculate cost
      const modelRates = MODEL_RATES[record.model] || MODEL_RATES['claude-3-opus-20240229'];
      const recordCost = 
        record.inputTokens * modelRates.input + 
        record.outputTokens * modelRates.output;
      
      summary.totalCost += recordCost;
      
      // Group by day
      const day = new Date(record.timestamp).toISOString().split('T')[0];
      if (!summary.usageByDay[day]) {
        summary.usageByDay[day] = {
          inputTokens: 0,
          outputTokens: 0,
          cost: 0
        };
      }
      
      summary.usageByDay[day].inputTokens += record.inputTokens;
      summary.usageByDay[day].outputTokens += record.outputTokens;
      summary.usageByDay[day].cost += recordCost;
      
      // Group by model
      const modelKey = record.model.replace(/-\d{8}$/, '');
      if (!summary.usageByModel[modelKey]) {
        summary.usageByModel[modelKey] = {
          inputTokens: 0,
          outputTokens: 0,
          cost: 0
        };
      }
      
      summary.usageByModel[modelKey].inputTokens += record.inputTokens;
      summary.usageByModel[modelKey].outputTokens += record.outputTokens;
      summary.usageByModel[modelKey].cost += recordCost;
    }
    
    setSummary(summary);
  }, [usageHistory, timeFrame]);
  
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="mb-3 flex items-center">
        <div className="rounded-full p-1 mr-2">
          <img src="assets/brain_128.png" className="h-8 w-8" alt="Brain icon" />
        </div>
        <h2 className="text-lg font-semibold">Usage Statistics</h2>
      </div>
      
      <div className="mb-4">
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded text-sm ${timeFrame === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            onClick={() => setTimeFrame('week')}
          >
            Last 7 Days
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${timeFrame === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            onClick={() => setTimeFrame('month')}
          >
            Last 30 Days
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${timeFrame === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            onClick={() => setTimeFrame('all')}
          >
            All Time
          </button>
        </div>
      </div>
      
      {summary ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-1">Total Requests</div>
              <div className="text-xl font-semibold">{usageHistory.length}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-1">Total Tokens</div>
              <div className="text-xl font-semibold">
                {(summary.totalInputTokens + summary.totalOutputTokens).toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-1">Total Cost</div>
              <div className="text-xl font-semibold">${summary.totalCost.toFixed(2)}</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Usage by Model</h3>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-3">Model</th>
                    <th className="text-right p-3">Input Tokens</th>
                    <th className="text-right p-3">Output Tokens</th>
                    <th className="text-right p-3">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.usageByModel).map(([model, data]) => (
                    <tr key={model} className="border-b border-gray-800">
                      <td className="p-3">{model.replace('claude-3-', '')}</td>
                      <td className="text-right p-3">{data.inputTokens.toLocaleString()}</td>
                      <td className="text-right p-3">{data.outputTokens.toLocaleString()}</td>
                      <td className="text-right p-3">${data.cost.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Recent Usage</h3>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-3">Date</th>
                    <th className="text-right p-3">Tokens</th>
                    <th className="text-right p-3">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.usageByDay)
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .slice(0, 7)
                    .map(([day, data]) => (
                      <tr key={day} className="border-b border-gray-800">
                        <td className="p-3">{new Date(day).toLocaleDateString()}</td>
                        <td className="text-right p-3">
                          {(data.inputTokens + data.outputTokens).toLocaleString()}
                        </td>
                        <td className="text-right p-3">${data.cost.toFixed(4)}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No usage data available yet.
        </div>
      )}
    </div>
  );
};

export default Usage;