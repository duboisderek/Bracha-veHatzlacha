import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Coin {
  id: string;
  x: number;
  delay: number;
  rotation: number;
  size: number;
  type: 'gold' | 'silver';
}

interface CoinRainAnimationProps {
  trigger?: boolean;
  duration?: number;
  intensity?: number;
}

export function CoinRainAnimation({ 
  trigger = false, 
  duration = 3000, 
  intensity = 20 
}: CoinRainAnimationProps) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      
      // Generate coins
      const newCoins: Coin[] = [];
      for (let i = 0; i < intensity; i++) {
        newCoins.push({
          id: `coin-${i}-${Date.now()}`,
          x: Math.random() * 100,
          delay: Math.random() * duration * 0.8,
          rotation: Math.random() * 360,
          size: Math.random() * 20 + 20,
          type: Math.random() > 0.3 ? 'gold' : 'silver'
        });
      }
      
      setCoins(newCoins);
      
      // Clear animation after duration
      setTimeout(() => {
        setCoins([]);
        setIsActive(false);
      }, duration);
    }
  }, [trigger, duration, intensity, isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            className={`absolute w-8 h-8 rounded-full shadow-lg ${
              coin.type === 'gold' 
                ? 'bg-gradient-to-br from-yellow-300 to-yellow-600' 
                : 'bg-gradient-to-br from-gray-300 to-gray-500'
            }`}
            style={{
              left: `${coin.x}%`,
              width: `${coin.size}px`,
              height: `${coin.size}px`,
            }}
            initial={{
              y: -100,
              rotate: coin.rotation,
              opacity: 0,
            }}
            animate={{
              y: window.innerHeight + 100,
              rotate: coin.rotation + 720,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: duration / 1000,
              delay: coin.delay / 1000,
              ease: "easeIn",
            }}
          >
            {/* Coin symbol */}
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
              {coin.type === 'gold' ? '₪' : '•'}
            </div>
            
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}