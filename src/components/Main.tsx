import React, { useState, useEffect, useCallback } from 'react';

interface MainProps {
  apiKey: string;
  model: string;
  style: string;
  prompt: string;
}

const Main: React.FC<MainProps> = ({ apiKey, model, style, prompt }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  // We need to define this function here since we can't import from background.ts easily
  async function analyzeText(
    text: string,
    apiKey: string,
    model: string,
    style: string
  ): Promise<string> {
    console.log(`Analyzing text with model: ${model}, style: ${style}`);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 1000,
          messages: [{ role: 'user', content: text }],
          temperature: style === 'creative' ? 0.9 : (style === 'precise' ? 0.3 : 0.5),
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error:", errorData);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text || 'No response from Claude';
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }

  const handleAnalysis = useCallback(async (text: string) => {
    console.log("Handling analysis for text:", text);
    setInput(text);
    setLoading(true);
    setError('');
    try {
      const result = await analyzeText(
        `${prompt}\n\n${text}`,
        apiKey,
        model,
        style
      );
      setResponse(result);
    } catch (error: any) {
      console.error("Analysis error:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [apiKey, model, style, prompt]);

  useEffect(() => {
    console.log("Main component mounted");
    
    const messageListener = (message: any) => {
      console.log("Main received message:", message);
      
      if (message.type === 'analyzeSelection' || message.type === 'analyzePage') {
        handleAnalysis(message.data);
      } else if (message.highlightedText !== undefined) {
        if (message.highlightedText) {
          handleAnalysis(message.highlightedText);
        }
        setInitialLoading(false);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    
    // Check for highlighted text when popup opens
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("Active tabs:", tabs);
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { getHighlightedText: true })
          .catch(err => {
            console.error("Error sending message to tab:", err);
            setInitialLoading(false);
          });
      } else {
        setInitialLoading(false);
      }
    });

    // If we don't get a response within 1 second, stop the loading state
    const timeout = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [handleAnalysis]);

  const handleBackToSettings = () => {
    chrome.storage.sync.remove(['apiKey']);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-darker to-dark p-4 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="bg-dark-lighter rounded-xl shadow-xl overflow-hidden backdrop-blur-sm border border-gray-700 mb-4">
          <div className="p-4 flex items-center justify-between bg-dark-darker border-b border-gray-700">
            <div className="flex items-center">
              <div className="bg-primary rounded-full p-1.5 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Claude Analyzer</h2>
            </div>
            <button 
              className="p-2 rounded-full hover:bg-dark-darker text-gray-400 hover:text-white transition-colors"
              onClick={handleBackToSettings}
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
            </button>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-gray-700">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-300 mr-2">Prompt:</span>
              <span className="text-sm text-white">{prompt}</span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-sm font-medium text-gray-300 mr-2">Model:</span>
              <span className="text-sm text-white">{model.replace('claude-3-', '').replace('-20240229', '').replace('-20240307', '')}</span>
              <span className="mx-2 text-gray-500">•</span>
              <span className="text-sm font-medium text-gray-300 mr-2">Style:</span>
              <span className="text-sm text-white capitalize">{style}</span>
            </div>
          </div>
          
          <div className="p-6">
            {initialLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-300">Loading initial text...</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-300">Analyzing with Claude...</p>
              </div>
            ) : (
              <>
                {input && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Input
                    </h3>
                    <div className="bg-dark-darker rounded-lg p-4 border border-gray-700 text-gray-300 max-h-48 overflow-y-auto">
                      {input}
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                
                {response && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Claude's Response
                    </h3>
                    <div className="bg-dark-darker rounded-lg p-4 border border-gray-700 text-white whitespace-pre-line">
                      {response}
                    </div>
                  </div>
                )}
                
                {!input && !error && !response && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-dark-darker rounded-full p-4 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 mb-2">No content to analyze yet</p>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Highlight text on the page or right-click to analyze content with Claude.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;