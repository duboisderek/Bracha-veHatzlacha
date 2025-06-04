import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  speed: number;
  direction: number;
}

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

export function FloatingParticles({ count = 50, className = "" }: FloatingParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const colors = [
    "rgba(251, 191, 36, 0.1)", // gold
    "rgba(59, 130, 246, 0.08)", // blue
    "rgba(16, 185, 129, 0.06)", // green
    "rgba(139, 92, 246, 0.05)", // purple
    "rgba(255, 255, 255, 0.03)", // white
  ];

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);

    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  useEffect(() => {
    if (windowSize.width === 0 || windowSize.height === 0) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * windowSize.width,
        y: Math.random() * windowSize.height,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.5 + 0.1,
        direction: Math.random() * Math.PI * 2,
      });
    }
    setParticles(newParticles);
  }, [count, windowSize, colors]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
          }}
          animate={{
            x: [
              particle.x,
              particle.x + Math.cos(particle.direction) * 100,
              particle.x + Math.cos(particle.direction + Math.PI) * 100,
              particle.x,
            ],
            y: [
              particle.y,
              particle.y + Math.sin(particle.direction) * 80,
              particle.y + Math.sin(particle.direction + Math.PI) * 80,
              particle.y,
            ],
            scale: [1, 1.2, 0.8, 1],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity * 0.5, particle.opacity],
          }}
          transition={{
            duration: (10 + Math.random() * 20) / particle.speed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-50/5 to-blue-50/10 pointer-events-none" />
      
      {/* Animated light beams */}
      <motion.div
        className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-200/20 to-transparent"
        animate={{
          opacity: [0, 0.5, 0],
          scaleY: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0,
        }}
      />
      
      <motion.div
        className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blue-200/15 to-transparent"
        animate={{
          opacity: [0, 0.3, 0],
          scaleY: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}