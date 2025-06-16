// Système de métriques de performance intégré
export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  // Mesurer le temps de chargement des composants
  measureComponentLoad(componentName: string, duration: number) {
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }
    this.metrics.get(componentName)!.push(duration);
  }

  // Mesurer les Core Web Vitals
  measureWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      this.measureComponentLoad('LCP', lastEntry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        this.measureComponentLoad('FID', entry.processingStart - entry.startTime);
      });
    }).observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.measureComponentLoad('CLS', clsValue);
    }).observe({ type: 'layout-shift', buffered: true });
  }

  // Obtenir les métriques moyennes
  getAverageMetrics(): Record<string, number> {
    const averages: Record<string, number> = {};
    
    this.metrics.forEach((values, key) => {
      averages[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return averages;
  }

  // Réinitialiser les métriques
  reset() {
    this.metrics.clear();
  }
}

// Hook pour mesurer les performances des composants React
export function usePerformanceMonitor(componentName: string) {
  const metrics = PerformanceMetrics.getInstance();
  
  return {
    startMeasure: () => {
      return performance.now();
    },
    endMeasure: (startTime: number) => {
      const duration = performance.now() - startTime;
      metrics.measureComponentLoad(componentName, duration);
    },
    getMetrics: () => metrics.getAverageMetrics()
  };
}

// Optimisations automatiques basées sur les métriques
export function applyPerformanceOptimizations() {
  if (typeof window === 'undefined') return;

  // Préchargement intelligent des ressources critiques
  const criticalResources = [
    '/api/draws/current',
    '/api/auth/user'
  ];

  criticalResources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });

  // Optimisation des images avec lazy loading natif
  const images = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // Nettoyage automatique des listeners inactifs
  let lastActivity = Date.now();
  const cleanupThreshold = 5 * 60 * 1000; // 5 minutes

  const checkActivity = () => {
    if (Date.now() - lastActivity > cleanupThreshold) {
      // Nettoyer les caches non utilisés
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('old-') || name.includes('temp-')) {
              caches.delete(name);
            }
          });
        });
      }
    }
  };

  ['click', 'scroll', 'keypress'].forEach(event => {
    document.addEventListener(event, () => {
      lastActivity = Date.now();
    }, { passive: true });
  });

  setInterval(checkActivity, 60000); // Vérifier chaque minute
}

// Compression des données JSON pour réduire la taille des transferts
export function compressData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    // Compression simple en supprimant les espaces et en raccourcissant les clés communes
    return jsonString
      .replace(/\s+/g, '')
      .replace(/"id":/g, '"i":')
      .replace(/"name":/g, '"n":')
      .replace(/"value":/g, '"v":')
      .replace(/"type":/g, '"t":');
  } catch (error) {
    console.warn('Data compression failed:', error);
    return JSON.stringify(data);
  }
}

export function decompressData(compressedData: string): any {
  try {
    // Restaurer les clés originales
    const restored = compressedData
      .replace(/"i":/g, '"id":')
      .replace(/"n":/g, '"name":')
      .replace(/"v":/g, '"value":')
      .replace(/"t":/g, '"type":');
    
    return JSON.parse(restored);
  } catch (error) {
    console.warn('Data decompression failed:', error);
    return {};
  }
}