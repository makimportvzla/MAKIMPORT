'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { syncOfflineQueue } from '@/lib/offlineQueue';

export const PWAOfflineHandler: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial connection state
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      
      // Auto-dismiss the online toast after 4 seconds
      const timer = setTimeout(() => {
        setShowOnlineToast(false);
        setSyncedCount(null);
      }, 4000);

      // Attempt to sync queued actions immediately when back online
      syncOfflineQueue();

      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOnlineToast(false);
    };

    const handleQueueSynced = (e: Event) => {
      const customEvent = e as CustomEvent<{ syncedCount: number }>;
      if (customEvent.detail && customEvent.detail.syncedCount > 0) {
        setSyncedCount(customEvent.detail.syncedCount);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline_queue_synced', handleQueueSynced);

    // Register PWA Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline_queue_synced', handleQueueSynced);
    };
  }, []);

  return (
    <>
      {/* Offline Status Float Banner */}
      {isOffline && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 transform -translate-x-1/2 z-[999] animate-bounce duration-1000">
          <div className="bg-red-950/90 backdrop-blur-md text-red-200 border border-red-700/50 px-5 py-3 rounded-full shadow-[0_8px_32px_rgba(239,68,68,0.2)] flex items-center gap-3 text-xs md:text-sm font-semibold tracking-wide">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
              <WifiOff className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            </div>
            <span>Sin conexión — Navegando en modo offline</span>
          </div>
        </div>
      )}

      {/* Online Back-online Toast */}
      {showOnlineToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[999] transition-all duration-350">
          <div className="bg-slate-900/95 backdrop-blur-md text-emerald-200 border border-emerald-500/30 px-5 py-3 rounded-2xl shadow-[0_12px_40px_rgba(16,185,129,0.15)] flex items-center gap-3 text-xs md:text-sm font-semibold tracking-wide animate-in fade-in slide-in-from-top-4">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span>¡Conexión de red restaurada!</span>
              {syncedCount !== null && (
                <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                  Sincronizados {syncedCount} formulario(s) en la cola offline
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
