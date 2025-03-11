// Background script for Claude on Chrome

// Setup context menus when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed, setting up context menus");
  
  chrome.contextMenus.create({
    id: 'analyzeSelection',
    title: 'Analyze with Claude', 
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'analyzePage',
    title: 'Analyze Page with Claude', 
    contexts: ['page']
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request);
  
  if (request.type === 'analyzeSelection' || request.type === 'analyzePage') {
    // Forward the message to any open popup
    chrome.runtime.sendMessage(request);
    sendResponse({ success: true });
  } else if (request.highlightedText !== undefined) {
    console.log("Received highlighted text in background:", request.highlightedText);
    // Forward to popup if open
    chrome.runtime.sendMessage(request);
    sendResponse({ received: true });
  }
  
  // Return true to indicate we'll send a response asynchronously
  return true;
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Context menu clicked:", info.menuItemId);
  
  if (!tab || !tab.id) {
    console.error("No active tab found");
    return;
  }
  
  if (info.menuItemId === 'analyzeSelection') {
    chrome.tabs.sendMessage(tab.id, {action: 'analyzeSelection'});
    chrome.action.openPopup(); // Open popup after sending message
  } else if (info.menuItemId === 'analyzePage') {
    chrome.tabs.sendMessage(tab.id, {action: 'analyzePage'});
    chrome.action.openPopup(); // Open popup after sending message
  }
});

// Standalone function for text analysis
export async function analyzeText(
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