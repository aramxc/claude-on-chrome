import React, { useState } from 'react';
import { SYSTEM_PROMPTS } from './Settings';

interface InitialSetupProps {
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setStyle: (style: string) => void;
  setSystemPrompt: (prompt: string) => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ 
  setApiKey, setModel, setStyle, setSystemPrompt 
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelInput, setModelInput] = useState('claude-3-opus-20240229');
  const [styleInput, setStyleInput] = useState('default');
  const [systemPromptInput, setSystemPromptInput] = useState(SYSTEM_PROMPTS.tldr);
  const [selectedPromptType, setSelectedPromptType] = useState('tldr');

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
      systemPrompt: systemPromptInput
    }, () => {
      console.log("Initial settings saved");
    });
  };

  return (
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
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter your API key"
          />
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
            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
            <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
            <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
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
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Prompt Template
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <button 
              className={`px-2 py-1 text-sm rounded ${
                systemPromptInput === 'Analyze this in detail:' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300'
              }`}
              onClick={() => setSystemPromptInput('Analyze this in detail:')}
            >
              Analyze
            </button>
            <button 
              className={`px-2 py-1 text-sm rounded ${
                systemPromptInput === 'Summarize the key points of this:' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300'
              }`}
              onClick={() => setSystemPromptInput('Summarize the key points of this:')}
            >
              Summarize
            </button>
            <button 
              className={`px-2 py-1 text-sm rounded ${
                systemPromptInput === 'Critique and give feedback on this:' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300'
              }`}
              onClick={() => setSystemPromptInput('Critique and give feedback on this:')}
            >
              Critique
            </button>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={!apiKeyInput}
          className={`w-full py-3 rounded-md font-medium ${
            apiKeyInput 
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