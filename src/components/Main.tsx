// Updated Main.tsx with cost estimation
import React, { useEffect, useState } from 'react';
import { useClaude } from '../hooks/useClaude';
import { ClaudeConfig } from '../types/claude';
import { estimateCost } from '../services/costEstimateService';
import ReactMarkdown from 'react-markdown';

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
  
  const [costEstimate, setCostEstimate] = useState<string | null>(null);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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

  // Calculate cost estimate when we have both input and response
  useEffect(() => {
    if (inputText && response) {
      const { formattedCost } = estimateCost(inputText, response, config.model);
      setCostEstimate(formattedCost);
    } else {
      setCostEstimate(null);
    }
  }, [inputText, response, config.model]);

  // Add this helper function to get prompt type display name
  const getPromptTypeDisplay = (systemPrompt: string): string => {
    if (systemPrompt.includes("Analyze this in detail")) return "Analyze";
    if (systemPrompt.includes("Summarize the key points")) return "TLDR";
    return "Custom";
  };

  // Add this function to handle copying response to clipboard
  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(response)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

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
            {getPromptTypeDisplay(config.systemPrompt || '')}
          </span>
          {costEstimate && (
            <>
              <span className="mx-1">•</span>
              <span className="mr-1">Est. Cost:</span>
              <span className="text-gray-400">{costEstimate}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
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
                <div className="text-xs text-gray-500 mb-1 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span>Input</span>
                  </div>
                  <button 
                    onClick={() => setIsInputExpanded(!isInputExpanded)}
                    className="text-blue-500 hover:text-blue-400 focus:outline-none"
                  >
                    {isInputExpanded ? 'Collapse' : 'Expand'}
                  </button>
                </div>
                <div className="bg-gray-900 rounded-md p-3 text-sm text-gray-300">
                  {isInputExpanded ? (
                    <div className="whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>{inputText}</div>
                  ) : (
                    <>
                      {inputText.length > 100 ? (
                        <>
                          <div className="whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>
                            {inputText.slice(0, 100).trim()}...
                          </div>
                          <div className="mt-1 text-xs text-blue-500 cursor-pointer" onClick={() => setIsInputExpanded(true)}>
                            Click to see {inputText.length - 100} more characters
                          </div>
                        </>
                      ) : (
                        <div className="whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>{inputText}</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {response && (
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span>Claude's Response</span>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="text-blue-500 hover:text-blue-400 focus:outline-none flex items-center"
                    title="Copy to clipboard"
                  >
                    {copySuccess ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span className="text-xs">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-900 rounded-md p-3 text-sm text-white">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>
                      {response}
                    </ReactMarkdown>
                  </div>
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