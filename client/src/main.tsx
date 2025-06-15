import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeServiceWorker } from "./utils/serviceWorker";

// Initialize Service Worker for offline functionality
if (import.meta.env.PROD) {
  initializeServiceWorker({
    onUpdate: () => {
      console.log('[PWA] New version available');
    },
    onSuccess: () => {
      console.log('[PWA] App ready for offline use');
    },
    onError: (error) => {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
