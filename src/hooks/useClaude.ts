import { useState, useEffect, useCallback } from 'react';
import { analyzeText as callClaudeAPI } from '../services/claudeService';
import { ClaudeConfig } from '../types/claude';



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
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cacheKey, setCacheKey] = useState<string | null>(null);
  
  // Function to create a cache key from input and config
  const createCacheKey = useCallback((text: string, config: ClaudeConfig) => {
    return `claude-cache-${config.model}-${config.style}-${encodeURIComponent(text.substring(0, 100))}`;
  }, []);
  
  // Check cache for previous responses on mount and when input changes
  useEffect(() => {
    if (!inputText) return;
    
    const key = createCacheKey(inputText, config);
    setCacheKey(key);
    
    // Try to load from cache
    chrome.storage.local.get([key], (result) => {
      if (result[key]) {
        console.log('Loading from cache');
        setResponse(result[key].response);
        // Don't set loading to true or call API
      } else if (config.apiKey) {
        // Not in cache, so analyze
        analyzeTextWithCache(inputText);
      }
    });
  }, [inputText, config.apiKey, config.model, config.style]);
  
  // Check for pending analysis on mount
  useEffect(() => {
    chrome.storage.local.get(['pendingAnalysis'], (result) => {
      if (result.pendingAnalysis) {
        setInputText(result.pendingAnalysis);
        chrome.storage.local.remove(['pendingAnalysis']);
      }
    });
    
    // Listen for messages from background/content scripts
    const messageListener = (message: any) => {
      if ((message.type === 'analyzeSelection' || message.type === 'analyzePage') && message.data) {
        setInputText(message.data);
      } else if (message.highlightedText) {
        setInputText(message.highlightedText);
      }
    };
    
    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  //  // Analyze text with Claude and cache results
  const analyzeTextWithCache = useCallback(async (text: string) => {
    if (!config.apiKey || !text) return;
    
    setLoading(true);
    setError('');
    
    const key = createCacheKey(text, config);
    
    try {
      const result = await callClaudeAPI(text, config);
      if (typeof result === 'string') {
        setResponse(result);
        // Save to cache
        chrome.storage.local.set({ 
          [key]: { 
            response: result, 
            timestamp: Date.now(),
            model: config.model,
            style: config.style
          } 
        });
      } else {
        setResponse(String(result) || '');
        // Save to cache
        chrome.storage.local.set({ 
          [key]: { 
            response: String(result) || '', 
            timestamp: Date.now(),
            model: config.model,
            style: config.style 
          } 
        });
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [config, createCacheKey]);

  // Public API for component
  const analyzeText = useCallback((text: string) => {
    setInputText(text);
    // The actual analysis will happen in the useEffect
  }, []);

  return { inputText, response, loading, error, analyzeText, setInputText };
}