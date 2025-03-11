import React, { useState, useEffect } from 'react';

interface SetupProps {
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setStyle: (style: string) => void;
  setPrompt: (prompt: string) => void;
}

const Setup: React.FC<SetupProps> = ({ setApiKey, setModel, setStyle, setPrompt }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelInput, setModelInput] = useState('claude-3-opus-20240229');
  const [styleInput, setStyleInput] = useState('default');
  const [promptInput, setPromptInput] = useState('Analyze this in detail:');

  // Load stored values when the component mounts
  useEffect(() => {
    chrome.storage.local.get(["apiKey", "model", "style", "prompt"], (result) => {
      if (result.apiKey) setApiKeyInput(result.apiKey);
      if (result.model) setModelInput(result.model);
      if (result.style) setStyleInput(result.style);
      if (result.prompt) setPromptInput(result.prompt);
    });
  }, []);

  const handleSave = () => {
    setApiKey(apiKeyInput);
    setModel(modelInput);
    setStyle(styleInput);
    setPrompt(promptInput);

    // Store settings securely in Chrome storage
    chrome.storage.local.set({
      apiKey: apiKeyInput,
      model: modelInput,
      style: styleInput,
      prompt: promptInput
    }, () => {
      console.log("Settings saved securely");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-darker to-dark p-6 text-white">
      <div className="max-w-md mx-auto bg-dark-lighter rounded-xl shadow-xl overflow-hidden backdrop-blur-sm border border-gray-700">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="rounded-full p-3 mr-3">
              <img src="assets/brain_300.png" className="h-14 w-14 rounded-full" alt="Brain icon" />
            </div>
            <h2 className="text-2xl font-bold text-white">Claude on Chrome</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-300">
                Anthropic API Key
              </label>
              <input
                type="text"
                id="api-key"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter your Anthropic API key"
                className="input-field"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="model" className="block text-sm font-medium text-gray-300">
                Model
              </label>
              <select
                id="model"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                className="select-field"
              >
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="style" className="block text-sm font-medium text-gray-300">
                Style
              </label>
              <select
                id="style"
                value={styleInput}
                onChange={(e) => setStyleInput(e.target.value)}
                className="select-field"
              >
                <option value="default">Default</option>
                <option value="creative">Creative</option>
                <option value="precise">Precise</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Prompt Template
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    promptInput === 'Analyze this in detail:' 
                      ? 'bg-primary text-white shadow-glow' 
                      : 'bg-dark-lighter text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setPromptInput('Analyze this in detail:')}
                >
                  Detailed Analysis
                </button>
                <button 
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    promptInput === 'Summarize the key points of this:' 
                      ? 'bg-primary text-white shadow-glow' 
                      : 'bg-dark-lighter text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setPromptInput('Summarize the key points of this:')}
                >
                  Summarize
                </button>
                <button 
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    promptInput === 'Critique and give feedback on this:' 
                      ? 'bg-primary text-white shadow-glow' 
                      : 'bg-dark-lighter text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setPromptInput('Critique and give feedback on this:')}
                >
                  Critique
                </button>
              </div>
            </div>
            
            <button 
              className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark"
              onClick={handleSave}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setup;