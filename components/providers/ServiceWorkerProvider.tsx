"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";

interface ServiceWorkerContextType {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
  update: () => void;
}

const ServiceWorkerContext = createContext<ServiceWorkerContextType>({
  isSupported: false,
  isRegistered: false,
  isUpdateAvailable: false,
  registration: null,
  update: () => {},
});

export function useServiceWorker() {
  return useContext(ServiceWorkerContext);
}

interface ServiceWorkerProviderProps {
  children: ReactNode;
}

export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.log("[PWA] Service workers not supported");
      return;
    }

    setIsSupported(true);

    const registerServiceWorker = async () => {
      try {
        console.log("[PWA] Registering service worker...");
        
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        setRegistration(reg);
        setIsRegistered(true);
        console.log("[PWA] Service worker registered successfully");

        // Check for updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New version available
                console.log("[PWA] New version available");
                setIsUpdateAvailable(true);
              }
            });
          }
        });

        // Check for updates periodically (every hour)
        setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000);

      } catch (error) {
        console.error("[PWA] Service worker registration failed:", error);
      }
    };

    // Register when the page loads
    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener("load", registerServiceWorker);
      return () => window.removeEventListener("load", registerServiceWorker);
    }
  }, []);

  const update = () => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage("skipWaiting");
      
      // Reload the page to use the new version
      window.location.reload();
    }
  };

  return (
    <ServiceWorkerContext.Provider
      value={{
        isSupported,
        isRegistered,
        isUpdateAvailable,
        registration,
        update,
      }}
    >
      {children}
    </ServiceWorkerContext.Provider>
  );
}
