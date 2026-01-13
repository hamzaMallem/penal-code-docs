"use client";

import { useState, useEffect, useCallback } from "react";

interface OnlineStatusState {
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * Hook to detect online/offline status
 * Returns current status and whether the user was recently offline
 */
export function useOnlineStatus(): OnlineStatusState {
  const [state, setState] = useState<OnlineStatusState>({
    isOnline: true,
    wasOffline: false,
  });

  const handleOnline = useCallback(() => {
    setState((prev) => ({
      isOnline: true,
      wasOffline: prev.wasOffline || !prev.isOnline,
    }));
  }, []);

  const handleOffline = useCallback(() => {
    setState({
      isOnline: false,
      wasOffline: true,
    });
  }, []);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === "undefined") {
      return;
    }

    // Set initial state
    setState({
      isOnline: navigator.onLine,
      wasOffline: !navigator.onLine,
    });

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return state;
}

/**
 * Simple hook that just returns online status
 */
export function useIsOnline(): boolean {
  const { isOnline } = useOnlineStatus();
  return isOnline;
}
