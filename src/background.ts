// Track tabs with loaded content script
const contentScriptTabs = new Set<number>();

// Setup context menus on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeSelection',
    title: 'Analyze with Claude', 
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'analyzePage',
    title: 'Analyze page with Claude', 
    contexts: ['page']
  });
});

// Handle content script ready messages
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'ready' && sender.tab?.id) {
    contentScriptTabs.add(sender.tab.id);
  }
  
  // Pass any analysis data to storage for popup
  if (message.type === 'analyzeSelection' || message.type === 'analyzePage') {
    chrome.storage.local.set({ pendingAnalysis: message.data });
  }
  
  return true;
});

// Ensure content script is loaded
async function ensureContentScript(tabId: number): Promise<void> {
  if (contentScriptTabs.has(tabId)) return;
  
  try {
    // Try pinging first
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    contentScriptTabs.add(tabId);
  } catch (error) {
    // Inject content script if not loaded
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    
    // Brief delay for initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  
  try {
    // Selection analysis (use context menu's selection text directly)
    if (info.menuItemId === 'analyzeSelection' && info.selectionText) {
      chrome.storage.local.set({ pendingAnalysis: info.selectionText });
      chrome.action.openPopup();
      return;
    }
    
    // Page analysis
    if (info.menuItemId === 'analyzePage') {
      await ensureContentScript(tab.id);
      
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' });
        if (response?.text) {
          chrome.storage.local.set({ pendingAnalysis: response.text });
          chrome.action.openPopup();
        }
      } catch (error) {
        // Fallback: Use tab title and URL
        const tabInfo = await chrome.tabs.get(tab.id);
        const fallbackText = `URL: ${tabInfo.url}\nTitle: ${tabInfo.title}\n\nCould not access page content. This may be due to browser restrictions.`;
        chrome.storage.local.set({ pendingAnalysis: fallbackText });
        chrome.action.openPopup();
      }
    }
  } catch (error) {
    console.error("Error in context menu handler:", error);
  }
});