import React, { useState, useEffect } from 'react';
import { getUsageHistory } from '../services/claudeService';
import { UsageRecord, UsageSummary, MODEL_RATES } from '../types/usage';

const UsageTracking: React.FC = () => {
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'all'>('week');
  const [accountCredits, setAccountCredits] = useState<number>(0);
  const [inputCredits, setInputCredits] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      const history = await getUsageHistory();
      setUsageHistory(history || []);

      chrome.storage.sync.get(['accountCredits'], (result) => {
        const credits = result.accountCredits || 0;
        setAccountCredits(credits);
        setInputCredits(credits.toString());
      });
    };

    loadData();
  }, []);

  useEffect(() => {
    if (usageHistory.length === 0) return;

    let filteredHistory = [...usageHistory];
    const now = Date.now();

    if (timeFrame === 'week') {
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      filteredHistory = filteredHistory.filter(record => record.timestamp >= oneWeekAgo);
    } else if (timeFrame === 'month') {
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
      filteredHistory = filteredHistory.filter(record => record.timestamp >= oneMonthAgo);
    }

    const summary: UsageSummary = {
      totalCost: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalSpend: 0,
      usageByDay: {},
      usageByModel: {},
      accountCredits,
      accountBalance: accountCredits,
    };

    for (const record of filteredHistory) {
      const { inputTokens, outputTokens, timestamp, model } = record;
      
      // Get the base model name without version
      const baseModel = model.split('-').slice(0, 3).join('-');
      
      // Use the correct rates for the model or fallback to opus
      const modelRates = MODEL_RATES[baseModel] || MODEL_RATES['claude-3-opus'];
      
      const inputCost = inputTokens * modelRates.input / 1000000; // Convert from per million
      const outputCost = outputTokens * modelRates.output / 1000000; // Convert from per million
      const recordSpend = inputCost + outputCost;
      
      summary.totalInputTokens += inputTokens;
      summary.totalOutputTokens += outputTokens;
      summary.totalSpend += recordSpend;
      summary.accountBalance -= recordSpend;
      
      const day = new Date(timestamp).toISOString().split('T')[0];
      if (!summary.usageByDay[day]) {
        summary.usageByDay[day] = {
          inputTokens: 0,
          outputTokens: 0,
          spend: 0,
          inputRate: modelRates.input,
          outputRate: modelRates.output
        };
      }
      
      summary.usageByDay[day].inputTokens += inputTokens;
      summary.usageByDay[day].outputTokens += outputTokens;
      summary.usageByDay[day].spend += recordSpend;
      
      // Remove model version from model name in response
      const modelKey = baseModel;
      
      if (!summary.usageByModel[modelKey]) {
        summary.usageByModel[modelKey] = {
          inputTokens: 0,
          outputTokens: 0,
          spend: 0
        };
      }
      
      summary.usageByModel[modelKey].inputTokens += inputTokens;
      summary.usageByModel[modelKey].outputTokens += outputTokens;
      summary.usageByModel[modelKey].spend += recordSpend;
    }

    setSummary(summary);
  }, [usageHistory, timeFrame, accountCredits]);

  const updateAccountCredits = () => {
    const credits = parseFloat(inputCredits);
    if (!isNaN(credits)) {
      setAccountCredits(credits);
      chrome.storage.sync.set({ accountCredits: credits });
    }
  };

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

      {usageHistory.length > 0 ? (
        <div className="space-y-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Account Credits ($)
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={inputCredits}
                onChange={(e) => setInputCredits(e.target.value)}
                className="w-32 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 mr-2"
              />
              <button
                onClick={updateAccountCredits}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md"
              >
                Update
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-1">Total Requests</div>
              <div className="text-xl font-semibold">{usageHistory.length}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-1">Total Tokens</div>
              <div className="text-xl font-semibold">
                {summary ? (summary.totalInputTokens + summary.totalOutputTokens).toLocaleString() : 0}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-1">Total Spend</div>
              <div className="text-xl font-semibold">${summary ? summary.totalSpend.toFixed(4) : '0.00'}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-1">Account Balance</div>
              <div className="text-xl font-semibold">
                ${summary ? summary.accountBalance.toFixed(2) : accountCredits.toFixed(2)}
              </div>
            </div>
          </div>

          {summary && Object.keys(summary.usageByModel).length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Usage by Model</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-3">Model</th>
                      <th className="text-right p-3">Input Tokens</th>
                      <th className="text-right p-3">Output Tokens</th>
                      <th className="text-right p-3">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.usageByModel).map(([model, data]) => (
                      <tr key={model} className="border-b border-gray-800">
                        <td className="p-3">{model.replace('claude-3-', '')}</td>
                        <td className="text-right p-3">{data.inputTokens.toLocaleString()}</td>
                        <td className="text-right p-3">{data.outputTokens.toLocaleString()}</td>
                        <td className="text-right p-3">${data.spend.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {summary && Object.keys(summary.usageByDay).length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Recent Usage</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-3">Date</th>
                      <th className="text-right p-3">Input Tokens</th>
                      <th className="text-right p-3">Output Tokens</th>
                      <th className="text-right p-3">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.usageByDay)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .slice(0, 7)
                      .map(([day, data]) => (
                        <tr key={day} className="border-b border-gray-800">
                          <td className="p-3">{new Date(day).toLocaleDateString()}</td>
                          <td className="text-right p-3">{data.inputTokens.toLocaleString()}</td>
                          <td className="text-right p-3">{data.outputTokens.toLocaleString()}</td>
                          <td className="text-right p-3">${data.spend.toFixed(4)}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No usage data available yet.
        </div>
      )}
    </div>
  );
};

export default UsageTracking;