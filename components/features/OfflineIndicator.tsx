"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useServiceWorker } from "@/components/providers/ServiceWorkerProvider";
import { WifiOff, RefreshCw, X } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Offline indicator component
 * Shows a banner when the user is offline
 * Also shows update available notification
 */
export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { isUpdateAvailable, update } = useServiceWorker();
  const [showReconnected, setShowReconnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show "reconnected" message briefly when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Reset dismissed state when going offline
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  // Don't show anything if online and no updates
  if (isOnline && !showReconnected && !isUpdateAvailable) {
    return null;
  }

  // Offline indicator
  if (!isOnline && !dismissed) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/90 dark:bg-amber-600/90 text-white rounded-lg shadow-lg backdrop-blur-sm">
          <WifiOff className="h-5 w-5 shrink-0" />
          <span className="font-medium">أنت تعمل بدون إنترنت</span>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded transition-colors mr-auto"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Reconnected message
  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 px-4 py-3 bg-green-500/90 dark:bg-green-600/90 text-white rounded-lg shadow-lg backdrop-blur-sm">
          <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
          <span className="font-medium">تم استعادة الاتصال</span>
        </div>
      </div>
    );
  }

  // Update available notification
  if (isUpdateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/90 text-primary-foreground rounded-lg shadow-lg backdrop-blur-sm">
          <RefreshCw className="h-5 w-5 shrink-0" />
          <span className="font-medium">يتوفر تحديث جديد</span>
          <button
            onClick={update}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors text-sm font-medium"
          >
            تحديث الآن
          </button>
        </div>
      </div>
    );
  }

  return null;
}
