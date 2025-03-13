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
  // Try to find the main element first
  const mainElement = document.querySelector('main');
  
  if (mainElement && mainElement.textContent && mainElement.textContent.trim().length > 100) {
    return mainElement.textContent.trim();
  }
  
  // If no main element or it's too short, try article or content containers
  const contentElement = document.querySelector('article, #content, .content, [role="main"]');
  
  if (contentElement && contentElement.textContent) {
    return contentElement.textContent.trim();
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