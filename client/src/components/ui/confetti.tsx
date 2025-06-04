import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  shape: "circle" | "square" | "diamond" | "star";
  drift: number;
}

export function Confetti({ isActive, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const colors = [
    "#fbbf24", // gold
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#8b5cf6", // purple
    "#f59e0b", // amber
    "#ec4899", // pink
    "#14b8a6", // teal
  ];

  const shapes = ["circle", "square", "diamond", "star"] as const;

  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < 80; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -20,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 12 + 6,
          rotation: Math.random() * 360,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          drift: (Math.random() - 0.5) * 200,
        });
      }
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  const getShapeElement = (piece: ConfettiPiece) => {
    const baseClass = "absolute transform-gpu";
    const style = {
      backgroundColor: piece.color,
      width: piece.size,
      height: piece.size,
    };

    switch (piece.shape) {
      case "circle":
        return <div className={`${baseClass} rounded-full shadow-lg`} style={style} />;
      case "square":
        return <div className={`${baseClass} shadow-lg`} style={style} />;
      case "diamond":
        return (
          <div 
            className={`${baseClass} shadow-lg rotate-45`} 
            style={style}
          />
        );
      case "star":
        return (
          <svg 
            width={piece.size} 
            height={piece.size} 
            viewBox="0 0 24 24" 
            className={baseClass}
            style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
          >
            <path
              fill={piece.color}
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        );
      default:
        return <div className={`${baseClass} rounded-full shadow-lg`} style={style} />;
    }
  };

  if (!isActive || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: piece.x,
            y: piece.y,
            rotate: piece.rotation,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: piece.x + piece.drift,
            y: window.innerHeight + 100,
            rotate: piece.rotation + (Math.random() > 0.5 ? 720 : -720),
            opacity: 0,
            scale: [0, 1.2, 1, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 2 + 2.5,
            ease: "easeOut",
            times: [0, 0.1, 0.5, 0.8, 1],
          }}
          className="absolute"
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
        >
          {getShapeElement(piece)}
        </motion.div>
      ))}
      
      {/* Golden sparkle burst effect */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? [0, 1, 0] : 0 }}
        transition={{ duration: 0.6, times: [0, 0.3, 1] }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-1 h-8 bg-gradient-to-t from-transparent via-yellow-400 to-transparent"
            style={{
              left: "50%",
              top: "50%",
              transformOrigin: "bottom center",
            }}
            initial={{ 
              scale: 0,
              rotate: i * 30,
              opacity: 0 
            }}
            animate={{ 
              scale: isActive ? [0, 1, 0] : 0,
              opacity: isActive ? [0, 1, 0] : 0 
            }}
            transition={{
              duration: 1,
              delay: i * 0.05,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
