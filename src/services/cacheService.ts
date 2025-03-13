// Cache management functions

// Clean up caches older than 7 days
export function cleanupOldCaches(): void {
    chrome.storage.local.get(null, (allItems) => {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const keysToRemove: string[] = [];
      
      for (const [key, value] of Object.entries(allItems)) {
        if (key.startsWith('claude-cache-') && value.timestamp && value.timestamp < sevenDaysAgo) {
          keysToRemove.push(key);
        }
      }
      
      if (keysToRemove.length > 0) {
        chrome.storage.local.remove(keysToRemove);
        console.log(`Cleaned up ${keysToRemove.length} old cache items`);
      }
    });
  }
  
  // Call this function in your background.ts file on startup or periodically