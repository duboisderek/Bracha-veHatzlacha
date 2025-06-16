// Utilitaires d'optimisation de performance
import { useCallback, useMemo, useRef } from 'react';

// Debounce pour optimiser les appels API
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => func(...args), delay);
  }, [func, delay]) as T;
}

// Throttle pour limiter la fréquence d'exécution
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  
  return useCallback((...args: Parameters<T>) => {
    if (Date.now() - lastRun.current >= delay) {
      func(...args);
      lastRun.current = Date.now();
    }
  }, [func, delay]) as T;
}

// Intersection Observer pour lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const observer = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    }, options);
  }, [callback, options]);

  useMemo(() => {
    if (observer && elementRef.current) {
      observer.observe(elementRef.current);
      return () => observer.disconnect();
    }
  }, [observer, elementRef]);
}

// Optimisation des images
export const imageOptimization = {
  // Précharger les images critiques
  preloadCriticalImages: (urls: string[]) => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  },

  // Lazy loading des images
  createLazyImage: (src: string, alt: string, className?: string) => {
    return {
      src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+',
      'data-src': src,
      alt,
      className: `${className} lazy-image`,
      loading: 'lazy' as const
    };
  }
};

// Cache en mémoire pour données fréquemment utilisées
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000) { // 5 minutes par défaut
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();

// Bundle splitting utilitaires
export const loadComponent = async (componentPath: string) => {
  try {
    const module = await import(componentPath);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load component: ${componentPath}`, error);
    return null;
  }
};

// Performance monitoring
export const performanceMonitor = {
  mark: (name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
    }
  },

  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.measure(name, startMark, endMark);
      const measures = window.performance.getEntriesByName(name);
      const lastMeasure = measures[measures.length - 1];
      console.log(`${name}: ${lastMeasure.duration.toFixed(2)}ms`);
    }
  },

  clearMarks: () => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.clearMarks();
      window.performance.clearMeasures();
    }
  }
};

// Virtual scrolling pour listes longues
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  buffer: number = 5
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
  );
  
  return { startIndex, endIndex };
}

// Optimisation des re-renders
export const memoCompare = {
  shallow: (prevProps: any, nextProps: any) => {
    const keys1 = Object.keys(prevProps);
    const keys2 = Object.keys(nextProps);
    
    if (keys1.length !== keys2.length) return false;
    
    for (let key of keys1) {
      if (prevProps[key] !== nextProps[key]) return false;
    }
    
    return true;
  },

  deep: (a: any, b: any): boolean => {
    if (a === b) return true;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) return a === b;
    if (a === null || a === undefined || b === null || b === undefined) return false;
    if (a.prototype !== b.prototype) return false;
    
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    
    return keys.every(k => memoCompare.deep(a[k], b[k]));
  }
};