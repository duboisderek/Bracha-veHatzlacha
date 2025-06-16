import { lazy, Suspense, memo } from 'react';

// Skeleton optimisé réutilisable
export const OptimizedSkeleton = memo(({ className = "", height = "h-8" }: { className?: string; height?: string }) => (
  <div className={`animate-pulse bg-white bg-opacity-10 rounded-lg ${height} w-full ${className}`} />
));

// Lazy loaded components avec fallbacks optimisés
export const LazyFloatingParticles = lazy(() => 
  import("@/components/ui/floating-particles").then(m => ({ default: m.FloatingParticles }))
);

export const LazyLotteryBall = lazy(() => 
  import("@/components/ui/lottery-ball").then(m => ({ default: m.LotteryBall }))
);

// Wrapper avec Suspense pour éviter la répétition
export const SuspenseWrapper = memo(({ children, fallback }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) => (
  <Suspense fallback={fallback || <OptimizedSkeleton />}>
    {children}
  </Suspense>
));

// Composant de particules optimisé avec rendu conditionnel
export const OptimizedParticles = memo(({ count = 60 }: { count?: number }) => (
  <SuspenseWrapper fallback={<div className="absolute inset-0 pointer-events-none" />}>
    <LazyFloatingParticles count={count} />
  </SuspenseWrapper>
));

// Grille de boules de loto optimisée
export const OptimizedLotteryGrid = memo(({ numbers }: { numbers: number[] }) => (
  <div className="grid grid-cols-6 gap-4">
    {numbers.map((number, index) => (
      <SuspenseWrapper key={number} fallback={<div className="w-12 h-12 bg-yellow-400 rounded-full animate-pulse" />}>
        <LazyLotteryBall number={number} size="lg" />
      </SuspenseWrapper>
    ))}
  </div>
));

OptimizedSkeleton.displayName = 'OptimizedSkeleton';
SuspenseWrapper.displayName = 'SuspenseWrapper';
OptimizedParticles.displayName = 'OptimizedParticles';
OptimizedLotteryGrid.displayName = 'OptimizedLotteryGrid';