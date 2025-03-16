import React, { useState, useEffect } from 'react';

// Same shared system prompts
export const SYSTEM_PROMPTS = {
  analyze: "Analyze this in detail: provide comprehensive insights, highlight key themes, explain implications, and include relevant context that would help understand the content better. Be thorough in your analysis while also minimizing tokens used.",
  tldr: "Summarize the key points of this content: be concise in your summary,capturing the essential information while eliminating unnecessary details. Focus on the main ideas and conclusions. Keep it brief but comprehensive, aiming to minimize tokens used.",
  custom: "Summarize this in the voice of Jon Stewart, a comedian who makes a lot of money off of satirizing the news."
};

interface SettingsProps {
  apiKey: string;
  model: string;
  style: string;
  systemPrompt: string;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setStyle: (style: string) => void;
  setSystemPrompt: (prompt: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  apiKey, model, style, systemPrompt, 
  setApiKey, setModel, setStyle, setSystemPrompt 
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  const [modelInput, setModelInput] = useState(model);
  const [styleInput, setStyleInput] = useState(style);
  const [systemPromptInput, setSystemPromptInput] = useState(systemPrompt);
  const [selectedPromptType, setSelectedPromptType] = useState(() => {
    if (systemPrompt.includes("Analyze this in detail")) return "analyze";
    if (systemPrompt.includes("Summarize the key points")) return "tldr";
    return "custom";
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [isKeyEditable, setIsKeyEditable] = useState(false);

  // Handle prompt button clicks
  const handlePromptSelect = (type: 'analyze' | 'tldr' | 'custom') => {
    setSelectedPromptType(type);
    setSystemPromptInput(SYSTEM_PROMPTS[type]);
  };

  const handleSave = () => {
    setApiKey(apiKeyInput);
    setModel(modelInput);
    setStyle(styleInput);
    setSystemPrompt(systemPromptInput);

    // Store settings securely in Chrome storage
    chrome.storage.sync.set({
      apiKey: apiKeyInput,
      model: modelInput,
      style: styleInput,
      systemPrompt: systemPromptInput,
      promptType: selectedPromptType
    }, () => {
      setSaveStatus('Settings saved');
      setIsKeyEditable(false);
      setTimeout(() => setSaveStatus(''), 2000);
    });
  };

  return (
    <div className="flex-1 overflow-auto p-4 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      
      <div className="space-y-4 flex-grow">
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
              placeholder="Enter your API key"
            />
            {apiKey && (
              <button 
                onClick={() => setIsKeyEditable(!isKeyEditable)}
                className="absolute right-2 top-2 text-xs text-blue-400 hover:text-blue-300"
              >
                {isKeyEditable ? 'Cancel' : 'Change'}
              </button>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Model
          </label>
          <select
            value={modelInput}
            onChange={(e) => setModelInput(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
            <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet</option>
            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Style
          </label>
          <select
            value={styleInput}
            onChange={(e) => setStyleInput(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            <option value="creative">Creative</option>
            <option value="precise">Precise</option>
          </select>
        </div>
        
        <div className="flex-grow flex flex-col">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            System Prompt
          </label>
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button 
              className={`px-2 py-1 text-sm rounded ${
                selectedPromptType === 'analyze' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300'
              }`}
              onClick={() => handlePromptSelect('analyze')}
            >
              Analyze
            </button>
            <button 
              className={`px-2 py-1 text-sm rounded ${
                selectedPromptType === 'tldr' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300'
              }`}
              onClick={() => handlePromptSelect('tldr')}
            >
              TLDR
            </button>
            <button 
              className={`px-2 py-1 text-sm rounded ${
                selectedPromptType === 'custom' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300'
              }`}
              onClick={() => handlePromptSelect('custom')}
            >
              Custom
            </button>
          </div>
          <textarea
            value={systemPromptInput}
            onChange={(e) => {
              setSystemPromptInput(e.target.value);
              setSelectedPromptType('custom');
            }}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 flex-grow min-h-[100px]"
          />
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Save Settings
        </button>
        
        {saveStatus && (
          <div className="text-center text-green-500 mt-2">
            {saveStatus}
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;