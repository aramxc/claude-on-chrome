console.log("Content script loaded");

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  if (message.action === 'analyzeSelection') {
    const selection = window.getSelection()?.toString() || '';
    console.log("Selected text:", selection);
    chrome.runtime.sendMessage({type: 'analyzeSelection', data: selection});
    sendResponse({success: true});
  } 
  else if (message.action === 'analyzePage') {
    console.log("Analyzing entire page");
    // Get page content (simpler version - just get text)
    const pageText = document.body.innerText || document.body.textContent || '';
    console.log("Page text length:", pageText.length);
    
    // Limit text length to avoid overwhelming the API
    const truncatedText = pageText.substring(0, 10000);
    
    chrome.runtime.sendMessage({
      type: 'analyzePage', 
      data: truncatedText
    });
    
    sendResponse({success: true});
  } 
  else if (message.getHighlightedText) {
    const selection = window.getSelection()?.toString() || '';
    console.log("Getting highlighted text:", selection);
    chrome.runtime.sendMessage({highlightedText: selection});
    sendResponse({success: true});
  }
  
  // Return true to indicate we'll send a response asynchronously
  return true;
});

console.log("Content script initialization complete");