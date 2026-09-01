/**
 * Pavira Signature - Scroll Position Restoration Utility
 * 
 * This module handles proper scroll position restoration on page refresh/navigation.
 * It ensures the user returns to the exact scroll position after refresh by:
 * 1. Disabling automatic browser scroll restoration
 * 2. Saving scroll position with debouncing
 * 3. Restoring position after ALL content (images, fonts, dynamic content) has loaded
 * 4. Handling layout shifts and lazy-loaded content
 */

const STORAGE_KEY = 'pavira_scroll_position';
const DEBOUNCE_DELAY = 150; // milliseconds
const RESTORATION_ATTEMPTS = [0, 100, 300, 600, 1000, 1500, 2000]; // Progressive delays

let debounceTimer: NodeJS.Timeout | null = null;
let isRestoring = false;

/**
 * Save the current scroll position to sessionStorage
 * Debounced to prevent excessive writes
 */
function saveScrollPosition(): void {
  if (isRestoring) return; // Don't save during restoration

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    try {
      const scrollData = {
        x: window.scrollX || window.pageXOffset,
        y: window.scrollY || window.pageYOffset,
        pathname: window.location.pathname,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(scrollData));
    } catch (error) {
      console.warn('Failed to save scroll position:', error);
    }
  }, DEBOUNCE_DELAY);
}

/**
 * Get the saved scroll position from sessionStorage
 */
function getSavedScrollPosition(): { x: number; y: number; pathname: string } | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const data = JSON.parse(saved);
    
    // Only return position if it's for the current page
    if (data.pathname === window.location.pathname) {
      return { x: data.x || 0, y: data.y || 0, pathname: data.pathname };
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to retrieve scroll position:', error);
    return null;
  }
}

/**
 * Clear saved scroll position from sessionStorage
 */
function clearSavedScrollPosition(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear scroll position:', error);
  }
}

/**
 * Check if all images in viewport are loaded
 */
function areImagesLoaded(): Promise<void> {
  return new Promise((resolve) => {
    const images = Array.from(document.images);
    
    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkComplete();
      } else {
        img.addEventListener('load', checkComplete);
        img.addEventListener('error', checkComplete); // Count errors too
      }
    });

    // Fallback: resolve after 3 seconds even if some images haven't loaded
    setTimeout(() => resolve(), 3000);
  });
}

/**
 * Check if fonts are loaded
 */
function areFontsLoaded(): Promise<void> {
  if (!document.fonts) {
    return Promise.resolve();
  }

  return document.fonts.ready
    .then(() => {
      // Additional delay for font rendering
      return new Promise<void>((resolve) => setTimeout(() => resolve(), 50));
    })
    .catch(() => {
      // Fallback if fonts API fails
      return Promise.resolve();
    });
}

/**
 * Wait for dynamic content to load
 * This checks for common loading indicators and waits for them to disappear
 */
function waitForDynamicContent(): Promise<void> {
  return new Promise((resolve) => {
    const checkInterval = 100;
    const maxWait = 2000;
    let elapsed = 0;

    const check = () => {
      // Check for common loading indicators
      const loadingElements = document.querySelectorAll(
        '[data-loading="true"], .loading, .spinner, [aria-busy="true"]'
      );

      if (loadingElements.length === 0 || elapsed >= maxWait) {
        resolve();
      } else {
        elapsed += checkInterval;
        setTimeout(check, checkInterval);
      }
    };

    check();
  });
}

/**
 * Restore scroll position to specific coordinates
 */
function scrollToPosition(x: number, y: number): void {
  window.scrollTo({
    left: x,
    top: y,
    behavior: 'auto', // Instant, not smooth
  });
}

/**
 * Main function to restore scroll position
 * Uses multiple attempts with increasing delays to handle all content loading scenarios
 */
async function restoreScrollPosition(): Promise<void> {
  const savedPosition = getSavedScrollPosition();
  
  if (!savedPosition) {
    return;
  }

  isRestoring = true;

  try {
    // Wait for initial content
    await Promise.all([
      areImagesLoaded(),
      areFontsLoaded(),
      waitForDynamicContent(),
    ]);

    // Progressive restoration attempts
    for (const delay of RESTORATION_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      // Check if document height has stabilized
      const currentHeight = document.documentElement.scrollHeight;
      
      // Only restore if the target position is valid
      if (savedPosition.y <= currentHeight) {
        scrollToPosition(savedPosition.x, savedPosition.y);
        
        // Wait a bit and check if scroll position stuck
        await new Promise((resolve) => setTimeout(resolve, 50));
        
        const currentY = window.scrollY || window.pageYOffset;
        
        // If we're close enough, consider it successful
        if (Math.abs(currentY - savedPosition.y) < 10) {
          break;
        }
      }
    }

    // Final restoration attempt
    scrollToPosition(savedPosition.x, savedPosition.y);
    
  } catch (error) {
    console.warn('Error during scroll restoration:', error);
  } finally {
    isRestoring = false;
    
    // Clear saved position after successful restoration
    // Delay clearing to ensure we don't clear during rapid refreshes
    setTimeout(() => {
      clearSavedScrollPosition();
    }, 1000);
  }
}

/**
 * Initialize scroll restoration
 * Call this on page load
 */
export function initScrollRestoration(): void {
  // Disable automatic browser scroll restoration
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Save scroll position on scroll
  window.addEventListener('scroll', saveScrollPosition, { passive: true });

  // Save scroll position before page unload
  window.addEventListener('beforeunload', () => {
    saveScrollPosition();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  });

  // Save on visibility change (mobile tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      saveScrollPosition();
    }
  });

  // Restore scroll position after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      restoreScrollPosition();
    });
  } else {
    // DOM already loaded
    restoreScrollPosition();
  }
}

/**
 * Cleanup scroll restoration
 * Call this when unmounting/navigating away
 */
export function cleanupScrollRestoration(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  
  window.removeEventListener('scroll', saveScrollPosition);
  // Note: beforeunload and visibilitychange listeners will be cleaned up automatically
}

/**
 * Manually trigger scroll position save
 * Useful for single-page navigation
 */
export function saveCurrentScrollPosition(): void {
  saveScrollPosition();
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

/**
 * Manually clear scroll position
 * Useful when you want to start fresh
 */
export function clearScrollPosition(): void {
  clearSavedScrollPosition();
}
