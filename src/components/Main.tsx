import React, { useEffect } from 'react';
import { useClaude } from '../hooks/useClaude';
import { ClaudeConfig } from '../types/claude';

export interface MainProps {
  config: ClaudeConfig;
}

const Main: React.FC<MainProps> = ({ config }) => {
  const { 
    inputText, 
    response, 
    loading, 
    error, 
    analyzeText
  } = useClaude(config);

  // Check for highlighted text when popup opens
  useEffect(() => {
    if (chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0]?.id) {
          try {
            // First ensure content script is loaded (communicate with background.ts)
            await chrome.runtime.sendMessage({ 
              action: 'ensureContentScriptLoaded', 
              tabId: tabs[0].id 
            });
            
            // Then try to get the selection
            const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelection' });
            if (response?.text && !inputText) {
              analyzeText(response.text);
            }
          } catch (err) {
            console.log("Could not get selection: content script may not be available on this page");
            
            // Check if we have a pending analysis from context menu
            chrome.storage.local.get(['pendingAnalysis'], (result) => {
              if (result.pendingAnalysis && !inputText) {
                analyzeText(result.pendingAnalysis);
                // Clear after using
                chrome.storage.local.remove(['pendingAnalysis']);
              }
            });
          }
        }
      });
    }
  }, [inputText, analyzeText]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4">
      <div className="mb-3 flex items-center">
        <div className="rounded-full p-1 mr-2">
          <img src="assets/brain_128.png" className="h-8 w-8" alt="Brain icon" />
        </div>
        <h2 className="text-lg font-semibold">Claude in Chrome</h2>
      </div>
      
      <div className="text-xs text-gray-500 mb-3">
        <div className="flex items-center flex-wrap">
          <span className="mr-1">Model:</span>
          <span className="text-gray-400">{config.model.replace('claude-3-', '').replace(/-\d{8}$/, '')}</span>
          <span className="mx-1">•</span>
          <span className="mr-1">Style:</span>
          <span className="text-gray-400 capitalize">{config.style}</span>
          <span className="mx-1">•</span>
          <span className="mr-1">System:</span>
          <span 
            className="text-gray-400 cursor-help"
            title={config.systemPrompt ?? 'No system prompt'}
          >
            {config.systemPrompt && config.systemPrompt.length > 20 
              ? config.systemPrompt.substring(0, 20) + '...' 
              : config.systemPrompt || 'None'}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-400 text-sm">Analyzing with Claude...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 bg-red-900/30 border border-red-700 rounded-md p-3 text-red-300 text-sm">
                {error}
              </div>
            )}
            
            {inputText && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Input
                </div>
                <div className="bg-gray-900 rounded-md p-3 text-sm text-gray-300 max-h-24 overflow-y-auto">
                  {inputText}
                </div>
              </div>
            )}
            
            {response && (
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Claude's Response
                </div>
                <div className="bg-gray-900 rounded-md p-3 text-sm text-white overflow-y-auto max-h-96">
                  {response}
                </div>
              </div>
            )}
            
            
            {!inputText && !error && !response && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="bg-gray-800 rounded-full p-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm mb-1">No content to analyze yet</p>
                <p className="text-xs text-gray-500 max-w-xs">
                  Highlight text on the page or right-click to analyze content with Claude.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Main;