import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { LotteryBall } from "./lottery-ball";

interface LotteryDrawAnimationProps {
  isActive: boolean;
  drawnNumbers: number[];
  onComplete?: () => void;
}

export function LotteryDrawAnimation({ isActive, drawnNumbers, onComplete }: LotteryDrawAnimationProps) {
  const [currentBallIndex, setCurrentBallIndex] = useState(0);
  const [showBalls, setShowBalls] = useState(false);

  useEffect(() => {
    if (isActive && drawnNumbers.length > 0) {
      setCurrentBallIndex(0);
      setShowBalls(true);
      
      const timer = setInterval(() => {
        setCurrentBallIndex((prev) => {
          if (prev >= drawnNumbers.length - 1) {
            clearInterval(timer);
            setTimeout(() => {
              setShowBalls(false);
              onComplete?.();
            }, 2000);
            return prev;
          }
          return prev + 1;
        });
      }, 800);

      return () => clearInterval(timer);
    }
  }, [isActive, drawnNumbers, onComplete]);

  if (!isActive || !showBalls) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative">
        {/* Central glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-yellow-400/30 via-yellow-400/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ width: "300px", height: "300px" }}
        />

        {/* Lottery machine effect */}
        <motion.div
          className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full p-8 shadow-2xl"
          initial={{ scale: 0, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 100 }}
          style={{ width: "280px", height: "280px" }}
        >
          {/* Glass dome effect */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 via-transparent to-black/20 backdrop-blur-sm border border-white/30" />
          
          {/* Ball container */}
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              {drawnNumbers.slice(0, currentBallIndex + 1).map((number, index) => (
                <motion.div
                  key={`${number}-${index}`}
                  className="absolute"
                  initial={{ 
                    scale: 0,
                    y: -200,
                    rotateX: -180,
                    opacity: 0
                  }}
                  animate={{ 
                    scale: index === currentBallIndex ? 1.2 : 0.8,
                    y: index === currentBallIndex ? 0 : 30 + (index * 15),
                    rotateX: 0,
                    opacity: 1,
                    z: index === currentBallIndex ? 50 : -index * 10
                  }}
                  exit={{ 
                    scale: 0.6,
                    y: 100,
                    opacity: 0
                  }}
                  transition={{
                    duration: 0.8,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: index * 0.1
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    zIndex: drawnNumbers.length - index
                  }}
                >
                  <LotteryBall
                    number={number}
                    size="xl"
                    variant={index === currentBallIndex ? "golden" : "winning"}
                    animationDelay={0}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Sparkle effects around the current ball */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: "50%",
                top: "50%",
                transformOrigin: `0 ${60 + Math.random() * 40}px`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Number display */}
        <motion.div
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/90 backdrop-blur-md rounded-lg px-6 py-3 shadow-lg">
            <p className="text-slate-800 text-sm font-medium text-center">
              Drawing Ball {currentBallIndex + 1} of {drawnNumbers.length}
            </p>
          </div>
        </motion.div>

        {/* Completion message */}
        {currentBallIndex >= drawnNumbers.length - 1 && (
          <motion.div
            className="absolute -bottom-28 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 rounded-lg px-8 py-4 shadow-xl font-bold">
              Draw Complete!
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}