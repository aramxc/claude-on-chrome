import React, { useState, useEffect } from 'react';
import { getUsageHistory } from '../services/claudeService';
import { UsageRecord, UsageSummary } from '../types/usage';

const UsageTracking: React.FC = () => {
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'all'>('week');
  const [accountCredits, setAccountCredits] = useState<number>(0);
  const [inputCredits, setInputCredits] = useState<string>('');
  const [resetConfirm, setResetConfirm] = useState(false);

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
      const { inputTokens, outputTokens, timestamp, model, cost } = record;
      
      // Get the base model name without version
      const baseModel = model.split('-').slice(0, 3).join('-');
      
      // Update total counts
      summary.totalInputTokens += inputTokens;
      summary.totalOutputTokens += outputTokens;
      summary.totalSpend += cost;
      
      // Update by model
      if (!summary.usageByModel[baseModel]) {
        summary.usageByModel[baseModel] = {
          inputTokens: 0,
          outputTokens: 0,
          spend: 0
        };
      }
      summary.usageByModel[baseModel].inputTokens += inputTokens;
      summary.usageByModel[baseModel].outputTokens += outputTokens;
      summary.usageByModel[baseModel].spend += cost;
      
      // Update by day
      const date = new Date(timestamp);
      const day = date.toISOString().split('T')[0];
      
      if (!summary.usageByDay[day]) {
        summary.usageByDay[day] = {
          inputTokens: 0,
          outputTokens: 0,
          spend: 0,
          inputRate: 0,
          outputRate: 0
        };
      }
      summary.usageByDay[day].inputTokens += inputTokens;
      summary.usageByDay[day].outputTokens += outputTokens;
      summary.usageByDay[day].spend += cost;
    }
    
    // Calculate account balance
    summary.accountBalance = Math.max(0, accountCredits - summary.totalSpend);
    summary.totalCost = summary.totalSpend;
    
    setSummary(summary);
  }, [usageHistory, timeFrame, accountCredits]);

  const handleSaveCredits = () => {
    const credits = parseFloat(inputCredits) || 0;
    setAccountCredits(credits);
    chrome.storage.sync.set({ accountCredits: credits });
  };

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }

    // Clear usage history
    chrome.storage.local.remove(['usageHistory', 'lastResponse', 'lastInputText'], () => {
      // Clear all cached responses
      chrome.storage.local.get(null, (items) => {
        const cacheKeys = Object.keys(items).filter(key => 
          key.startsWith('claude-cache-') || key.startsWith('analysis-')
        );
        
        if (cacheKeys.length > 0) {
          chrome.storage.local.remove(cacheKeys);
        }
        
        // Also clear account credits to force initial setup on next open
        chrome.storage.sync.remove(['accountCredits'], () => {
          setUsageHistory([]);
          setSummary(null);
          setAccountCredits(0);
          setInputCredits('0');
          setResetConfirm(false);
        });
      });
    });
  };

  const cancelReset = () => {
    setResetConfirm(false);
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Usage Tracking</h2>
        <div className="flex space-x-2">
          {resetConfirm ? (
            <>
              <button 
                onClick={handleReset}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Confirm
              </button>
              <button 
                onClick={cancelReset}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-md"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={handleReset}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          )}
        </div>
      </div>

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
                type=""
                value={inputCredits}
                onChange={(e) => setInputCredits(e.target.value)}
                className="w-32 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 mr-2"
              />
              <button
                onClick={handleSaveCredits}
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