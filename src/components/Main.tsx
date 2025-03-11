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

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4">
      <div className="mb-3 flex items-center">
        <div className="bg-blue-600 rounded-full p-1 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Claude Analyzer</h2>
      </div>
      
      <div className="text-xs text-gray-500 mb-3">
        <div className="flex items-center">
          <span className="mr-1">Model:</span>
          <span className="text-gray-400">{model.replace('claude-3-', '').replace('-20240229', '').replace('-20240307', '')}</span>
          <span className="mx-1">•</span>
          <span className="mr-1">Style:</span>
          <span className="text-gray-400 capitalize">{style}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {initialLoading || loading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-400 text-sm">
              {initialLoading ? "Loading..." : "Analyzing with Claude..."}
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 bg-red-900/30 border border-red-700 rounded-md p-3 text-red-300 text-sm">
                {error}
              </div>
            )}
            
            {input && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Input
                </div>
                <div className="bg-gray-900 rounded-md p-3 text-sm text-gray-300 max-h-24 overflow-y-auto">
                  {input}
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
            
            {!input && !error && !response && (
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