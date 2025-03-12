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
    // Store the data for when popup opens
    chrome.storage.local.set({ pendingAnalysis: request.data }, () => {
      console.log("Stored pending analysis data:", request.data.substring(0, 100) + "...");
    });
    
    // Try to forward the message to any open popup
    chrome.runtime.sendMessage(request)
      .catch(error => {
        console.log("Error forwarding message to popup, it might not be open:", error);
      });
      
    sendResponse({ success: true });
  } else if (request.highlightedText !== undefined) {
    console.log("Received highlighted text in background:", request.highlightedText);
    
    // Store highlighted text for when popup opens
    if (request.highlightedText) {
      chrome.storage.local.set({ pendingAnalysis: request.highlightedText }, () => {
        console.log("Stored highlighted text for analysis");
      });
    }
    
    // Try to forward to popup if open
    chrome.runtime.sendMessage(request)
      .catch(error => {
        console.log("Error forwarding highlighted text to popup:", error);
      });
      
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
    // Store the selection text for the popup to use
    if (info.selectionText) {
      console.log("Storing selection for analysis:", info.selectionText);
      chrome.storage.local.set({ pendingAnalysis: info.selectionText }, () => {
        // Open the popup after storage is set
        chrome.action.openPopup();
      });
    }
  } else if (info.menuItemId === 'analyzePage') {
    console.log("Sending analyzePage message to tab:", tab.id);
    // For page analysis, we'll need to get the content via the content script
    chrome.tabs.sendMessage(tab.id, {action: 'analyzePage'})
      .then(response => {
        console.log("Received response from content script:", response);
        // Open the popup after we've received confirmation from the content script
        if (response && response.success) {
          chrome.action.openPopup();
        }
      })
      .catch(error => {
        console.error("Error sending message to tab:", error);
      });
  }
});