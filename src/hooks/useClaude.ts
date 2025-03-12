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
  
  // Check for pending analysis on mount
  useEffect(() => {
    chrome.storage.local.get(['pendingAnalysis'], (result) => {
      if (result.pendingAnalysis) {
        setInputText(result.pendingAnalysis);
        if (config.apiKey) {
          analyzeText(result.pendingAnalysis);
        }
        chrome.storage.local.remove(['pendingAnalysis']);
      }
    });
    
    // Listen for messages from background/content scripts
    const messageListener = (message: any) => {
      if ((message.type === 'analyzeSelection' || message.type === 'analyzePage') && message.data) {
        setInputText(message.data);
        if (config.apiKey) {
          analyzeText(message.data);
        }
      } else if (message.highlightedText) {
        setInputText(message.highlightedText);
        if (config.apiKey) {
          analyzeText(message.highlightedText);
        }
      }
    };
    
    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [config.apiKey]);

  // Analyze text with Claude
  const analyzeText = useCallback(async (text: string) => {
    if (!config.apiKey || !text) return;
    
    setLoading(true);
    setError('');
    
    try {
        const result = await callClaudeAPI(text, config);
        if (typeof result === 'string') {
          setResponse(result);
        } else {
          setResponse(String(result) || '');
        }
      } catch (err: any) {
        setError(err.message || 'Analysis failed');
      } finally {
        setLoading(false);
      }
    }, [config]);

  return { inputText, response, loading, error, analyzeText, setInputText };
}