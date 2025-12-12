import { useEffect } from 'react';

// Component to handle cleanup and prevent memory leaks
export function PerformanceOptimizer() {
  useEffect(() => {
    // Clear any lingering timeouts on component mount
    const clearAllTimeouts = () => {
      let id = window.setTimeout(() => {}, 0);
      while (id--) {
        window.clearTimeout(id);
      }
    };

    // Only clear timeouts if we suspect there might be issues
    const hasTimeoutIssues = performance.now() > 30000; // If page has been running for 30+ seconds
    if (hasTimeoutIssues) {
      clearAllTimeouts();
    }

    // Memory optimization
    const optimizeMemory = () => {
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
      
      // Clear any unused localStorage entries older than 7 days
      try {
        const now = Date.now();
        const week = 7 * 24 * 60 * 60 * 1000;
        
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('temp_') || key.startsWith('cache_')) {
            const item = localStorage.getItem(key);
            if (item) {
              try {
                const data = JSON.parse(item);
                if (data.timestamp && (now - data.timestamp) > week) {
                  localStorage.removeItem(key);
                }
              } catch (e) {
                // If we can't parse it and it's a temp/cache item, remove it
                localStorage.removeItem(key);
              }
            }
          }
        });
      } catch (error) {
        console.debug('Storage cleanup error:', error);
      }
    };

    // Run optimization after a short delay
    const optimizationTimer = setTimeout(optimizeMemory, 2000);

    return () => {
      clearTimeout(optimizationTimer);
    };
  }, []);

  return null; // This component doesn't render anything
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gc?: () => void;
  }
}