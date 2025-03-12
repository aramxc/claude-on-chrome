// Standard message format for all communication
type Message = {
  action: 'getSelection' | 'getPageContent' | 'ping',
  payload?: any
}

// Get selected text function
function getSelectedText(): string {
  const selection = window.getSelection();
  return selection ? selection.toString().trim() : '';
}

// Extract page content intelligently
function getPageContent(): string {
  // Try to find main content container
  const mainContent = document.querySelector('main, article, #content, .content');
  
  if (mainContent) {
    return mainContent.textContent || '';
  }
  
  // Fallback: Remove navigation, etc. from body
  const bodyClone = document.body.cloneNode(true) as HTMLElement;
  
  ['nav', 'header', 'footer', 'aside', '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]']
    .forEach(selector => {
      bodyClone.querySelectorAll(selector)
        .forEach(el => el.parentNode?.removeChild(el));
    });
  
  // Clean and truncate text
  return (bodyClone.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 10000);
}

// Message handler
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  console.log("Content script received:", message);
  
  switch (message.action) {
    case 'getSelection':
      sendResponse({ text: getSelectedText() });
      break;
      
    case 'getPageContent':
      sendResponse({ text: getPageContent() });
      break;
      
    case 'ping':
      sendResponse({ ready: true });
      break;
  }
  
  return true; // Keep message channel open for async response
});

// Notify background script that content script is loaded
chrome.runtime.sendMessage({ action: 'ready' })
  .catch(error => console.log("Ready message error:", error));