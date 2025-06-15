// Service Worker Registration and Management
// Handles PWA functionality and offline capabilities

import React from 'react';

export interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig = {};

  private constructor() {}

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  async register(config: ServiceWorkerConfig = {}): Promise<void> {
    this.config = config;

    if (!('serviceWorker' in navigator)) {
      console.warn('[SW] Service Worker not supported in this browser');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[SW] Service Worker registered successfully');

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] New content available');
            this.config.onUpdate?.(this.registration!);
          }
        });
      });

      // Handle successful registration
      if (this.registration.active) {
        this.config.onSuccess?.(this.registration);
      }

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
      this.config.onError?.(error as Error);
    }
  }

  async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) {
      return;
    }

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  setupNetworkStatusListener(): void {
    window.addEventListener('online', () => {
      console.log('[SW] Network status: Online');
      this.notifyNetworkStatus(true);
    });

    window.addEventListener('offline', () => {
      console.log('[SW] Network status: Offline');
      this.notifyNetworkStatus(false);
    });
  }

  private notifyNetworkStatus(isOnline: boolean): void {
    window.dispatchEvent(new CustomEvent('network-status-change', {
      detail: { isOnline }
    }));
  }

  private handleMessage(event: MessageEvent): void {
    const { data } = event;
    
    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('[SW] Cache updated:', data.payload);
        break;
      case 'OFFLINE_FALLBACK':
        console.log('[SW] Serving offline content');
        break;
      case 'SYNC_COMPLETED':
        console.log('[SW] Background sync completed:', data.payload);
        break;
      default:
        console.log('[SW] Unknown message:', data);
    }
  }

  async requestBackgroundSync(tag: string): Promise<void> {
    if (!this.registration || !this.registration.sync) {
      console.warn('[SW] Background sync not supported');
      return;
    }

    try {
      await this.registration.sync.register(tag);
      console.log(`[SW] Background sync registered: ${tag}`);
    } catch (error) {
      console.error(`[SW] Background sync registration failed: ${tag}`, error);
    }
  }
}

// Network status hook for React components
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleNetworkChange = (event: CustomEvent) => {
      setIsOnline(event.detail.isOnline);
    };

    window.addEventListener('network-status-change', handleNetworkChange as EventListener);
    
    return () => {
      window.removeEventListener('network-status-change', handleNetworkChange as EventListener);
    };
  }, []);

  return { isOnline };
}

// Initialize Service Worker
export async function initializeServiceWorker(config: ServiceWorkerConfig = {}): Promise<void> {
  const swManager = ServiceWorkerManager.getInstance();
  
  swManager.setupNetworkStatusListener();
  
  await swManager.register({
    onUpdate: (registration) => {
      console.log('[SW] New version available');
      config.onUpdate?.(registration);
    },
    onSuccess: (registration) => {
      console.log('[SW] Service Worker ready');
      config.onSuccess?.(registration);
    },
    onError: (error) => {
      console.error('[SW] Service Worker error:', error);
      config.onError?.(error);
    }
  });
}

export const serviceWorkerManager = ServiceWorkerManager.getInstance();