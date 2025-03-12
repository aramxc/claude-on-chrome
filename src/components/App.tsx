import React, { useState, useEffect } from 'react';
import InitialSetup from './InitialSetup';
import Main from './Main';
import Settings from './Settings';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('claude-3-opus-20240229');
  const [style, setStyle] = useState('default');
  const [systemPrompt, setSystemPrompt] = useState('Analyze this in detail:');
  const [activeTab, setActiveTab] = useState('main');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load settings from storage
    chrome.storage.sync.get(['apiKey', 'model', 'style', 'systemPrompt'], (result) => {
      if (result.apiKey) setApiKey(result.apiKey);
      if (result.model) setModel(result.model); 
      if (result.style) setStyle(result.style);
      if (result.systemPrompt) setSystemPrompt(result.systemPrompt);
      setIsLoading(false);
    });
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-[600px] w-[400px] bg-black text-white items-center justify-center">
        <div className="animate-pulse">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
    );
  }

  // Determine which content to show
  const renderContent = () => {
    if (!apiKey) {
      return <InitialSetup 
        setApiKey={setApiKey} 
        setModel={setModel} 
        setStyle={setStyle}
        setSystemPrompt={setSystemPrompt}
      />;
    }
    
    if (activeTab === 'main') {
        return <Main config={{
          apiKey,
          model,
          style,
          systemPrompt
        }} />;
      } else if (activeTab === 'settings') {
        return <Settings 
          apiKey={apiKey}
          model={model}
          style={style}
          systemPrompt={systemPrompt}
          setApiKey={setApiKey}
          setModel={setModel}
          setStyle={setStyle}
          setSystemPrompt={setSystemPrompt}
        />;
      }
  };

  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-black text-white">
      {renderContent()}
      
      {/* Only show tabs if API key is set */}
      {apiKey && (
        <div className="mt-auto border-t border-gray-800">
          <div className="flex justify-between">
            <button 
              className={`flex-1 py-4 flex justify-center items-center ${activeTab === 'main' ? 'text-blue-400' : 'text-gray-500'}`}
              onClick={() => setActiveTab('main')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
            <button 
              className={`flex-1 py-4 flex justify-center items-center ${activeTab === 'settings' ? 'text-blue-400' : 'text-gray-500'}`}
              onClick={() => setActiveTab('settings')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;