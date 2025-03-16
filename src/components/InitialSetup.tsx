import React, { useState, useEffect } from 'react';
import { SYSTEM_PROMPTS } from './Settings';

interface InitialSetupProps {
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setStyle: (style: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setAccountCredits: (credits: number) => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ 
  setApiKey, setModel, setStyle, setSystemPrompt, setAccountCredits
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [creditsInput, setCreditsInput] = useState('5');
  const [isLoading, setIsLoading] = useState(true);
  const [isKeyEditable, setIsKeyEditable] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  // Load existing API key if available
  useEffect(() => {
    chrome.storage.sync.get(['apiKey'], (result) => {
      if (result.apiKey) {
        setApiKeyInput(result.apiKey);
        setHasExistingKey(true);
        setIsKeyEditable(false);
      } else {
        setIsKeyEditable(true);
      }
      setIsLoading(false);
    });
  }, []);

  const handleSave = () => {
    // Set API key if provided, otherwise keep existing one
    if (apiKeyInput) {
      setApiKey(apiKeyInput);
    }
    
    // Use defaults for model, style, and system prompt
    setModel('claude-3-haiku-20240307');
    setStyle('default');
    setSystemPrompt(SYSTEM_PROMPTS.analyze);
    setAccountCredits(parseFloat(creditsInput) || 0);

    // Store settings securely in Chrome storage
    chrome.storage.sync.set({
      apiKey: apiKeyInput,
      accountCredits: parseFloat(creditsInput) || 0
    }, () => {
      console.log("Initial settings saved");
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center justify-center mb-6">
          <img src="assets/brain_128.png" className="h-12 w-12 mr-3" alt="Brain icon" />
          <h2 className="text-xl font-bold">Claude on Chrome</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Anthropic API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                disabled={!isKeyEditable}
                className={`w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${!isKeyEditable ? 'opacity-70' : ''}`}
                placeholder="sk-ant-api..."
              />
              {hasExistingKey && (
                <button 
                  onClick={() => setIsKeyEditable(!isKeyEditable)}
                  className="absolute right-2 top-2 text-xs text-blue-400 hover:text-blue-300"
                >
                  {isKeyEditable ? 'Cancel' : 'Change'}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your API key is stored securely in your browser and never shared.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Account Credits ($)
            </label>
            <input
              type="number"
              value={creditsInput}
              onChange={(e) => setCreditsInput(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="5.00"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">
              Set a budget to track your Claude API usage.
            </p>
          </div>
        </div>
      </div>
      
      {/* Fixed button at bottom */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleSave}
          disabled={(!isKeyEditable && hasExistingKey && !creditsInput) || (isKeyEditable && !apiKeyInput) || !creditsInput}
          className={`w-full py-3 rounded-md font-medium ${
            ((!isKeyEditable && hasExistingKey) || apiKeyInput) && creditsInput
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default InitialSetup;