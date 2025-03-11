import React, { useState, useEffect } from 'react';
import Setup from './Setup';
import Main from './Main';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('claude-3-opus-20240229');
    const [style, setStyle] = useState('default');
    const [prompt, setPrompt] = useState('Analyze this in detail:');
  
    useEffect(() => {
      chrome.storage.sync.get(['apiKey', 'model', 'style', 'prompt'], (result) => {
        if (result.apiKey) setApiKey(result.apiKey);
        if (result.model) setModel(result.model); 
        if (result.style) setStyle(result.style);
        if (result.prompt) setPrompt(result.prompt);
      });
    }, []);
  
    return apiKey ? (
      <Main apiKey={apiKey} model={model} style={style} prompt={prompt} />
    ) : (
      <Setup 
        setApiKey={setApiKey} 
        setModel={setModel} 
        setStyle={setStyle}
        setPrompt={setPrompt}
      />
    );
  }

export default App;