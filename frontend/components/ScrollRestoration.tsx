'use client';

/**
 * Pavira Signature - Scroll Restoration Component
 * 
 * This component initializes scroll restoration functionality
 * and ensures proper cleanup. It should be included once in the root layout.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  initScrollRestoration, 
  cleanupScrollRestoration,
  saveCurrentScrollPosition 
} from '@/utils/scrollRestoration';

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize scroll restoration on mount
    initScrollRestoration();

    // Cleanup on unmount
    return () => {
      cleanupScrollRestoration();
    };
  }, []);

  // Save scroll position when route changes (for SPA navigation)
  useEffect(() => {
    // Save position before route change
    saveCurrentScrollPosition();
  }, [pathname]);

  // This component doesn't render anything
  return null;
}
