import { useState, useEffect, useCallback } from 'react';
import { analyzeText as callClaudeAPI } from '../services/claudeService';
import { ClaudeConfig, ClaudeResponse } from '../types/claude';
import { calculateCost } from '../utils/costCalculator';



// Default configuration
export const DEFAULT_CONFIG: ClaudeConfig = {
  apiKey: '',
  model: 'claude-3-opus-',
  style: 'default',
  systemPrompt: 'Analyze this in detail:'
};

/**
 * Hook to manage configuration state
 */
export function useConfig() {
  const [config, setConfig] = useState<ClaudeConfig>(DEFAULT_CONFIG);
  const [isReady, setIsReady] = useState(false);

  // Load config on mount
  useEffect(() => {
    chrome.storage.sync.get(['apiKey', 'model', 'style', 'systemPrompt'], (result) => {
      setConfig(prev => ({...prev, ...result}));
      setIsReady(true);
      console.log('Config loaded: with apiKey, model, style, systemPrompt', result);
    });
  }, []);

  // Save config to storage
  const saveConfig = useCallback((newConfig: ClaudeConfig) => {
    setConfig(newConfig);
    chrome.storage.sync.set(newConfig);
    console.log('Config saved secure storage', newConfig);
    return newConfig;
  }, []);

  return { config, isReady, saveConfig };
}

/**
 * Hook to manage text analysis with Claude
 */
export function useClaude(config: ClaudeConfig) {
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState<ClaudeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cacheKey, setCacheKey] = useState<string | null>(null);
  
  // Load last response from storage on mount
  useEffect(() => {
    chrome.storage.local.get(['lastResponse', 'lastInputText'], (result) => {
      if (result.lastResponse) {
        setResponse(result.lastResponse);
      }
      if (result.lastInputText) {
        setInputText(result.lastInputText);
      }
    });
  }, []);
  
  // Function to create a cache key from input and config
  const createCacheKey = useCallback((text: string, config: ClaudeConfig) => {
    return `claude-cache-${config.model}-${config.style}-${encodeURIComponent(text.substring(0, 100))}`;
  }, []);
  
  // Analyze text with Claude and cache results
  const analyzeTextWithCache = useCallback(async (text: string) => {
    if (!config.apiKey || !text) return;
    
    setLoading(true);
    setError('');
    
    const key = createCacheKey(text, config);
    
    try {
      const result = await callClaudeAPI(text, config);
      setResponse(result);

      // Save to cache
      chrome.storage.local.set({ 
        [key]: { 
          response: result, 
          timestamp: Date.now(),
          model: config.model,
          style: config.style
        },
        // Also save as lastResponse for persistence between tab switches
        lastResponse: result,
        lastInputText: text
      });
      
      // Track usage data only when we get a new API response
      chrome.storage.local.get(['usageHistory'], (data) => {
        const usageHistory = data.usageHistory || [];
        
        // Calculate cost once
        const costBreakdown = calculateCost(
          result.model,
          result.usage.input_tokens,
          result.usage.output_tokens
        );
        
        usageHistory.push({
          inputTokens: result.usage.input_tokens,
          outputTokens: result.usage.output_tokens,
          timestamp: Date.now(),
          model: result.model,
          cost: costBreakdown.totalCost,
          formattedCost: costBreakdown.formattedCost
        });
        
        chrome.storage.local.set({ usageHistory });
      });
      
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [config, createCacheKey]);

  // Check cache and analyze text when input changes
  useEffect(() => {
    if (!inputText || !config.apiKey) return;
    
    const key = createCacheKey(inputText, config);
    setCacheKey(key);
    
    // Check cache first
    chrome.storage.local.get([key], async (result) => {
      if (result[key] && result[key].response) {
        console.log('Using cached response');
        setResponse(result[key].response);
      } else {
        // Not in cache, call API
        analyzeTextWithCache(inputText);
      }
    });
  }, [inputText, config, analyzeTextWithCache, createCacheKey]);

  // Check for pending analysis
  useEffect(() => {
    chrome.storage.local.get(['pendingAnalysis'], (result) => {
      if (result.pendingAnalysis) {
        // Set the input text to the pending analysis
        setInputText(result.pendingAnalysis);
        
        // Clear the pending analysis to avoid reprocessing
        chrome.storage.local.remove(['pendingAnalysis']);
      }
    });
  }, []);

  // Public API for component
  const analyzeText = useCallback((text: string) => {
    setInputText(text);
    // The actual analysis will happen in the useEffect
  }, []);

  return { inputText, response, loading, error, analyzeText, setInputText };
}