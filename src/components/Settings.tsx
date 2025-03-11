import React, { useState } from 'react';

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
  const [saveStatus, setSaveStatus] = useState('');

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
      setSaveStatus('Settings saved');
      setTimeout(() => setSaveStatus(''), 2000);
    });
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      
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
            System Prompt
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
                systemPromptInput === systemPromptInput
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300'
              }`}
              onClick={() => setSystemPromptInput(systemPromptInput)}
            >
              Custom
            </button>
          </div>
          <textarea
            value={systemPromptInput}
            onChange={(e) => setSystemPromptInput(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
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