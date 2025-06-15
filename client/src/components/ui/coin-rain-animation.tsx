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
  intensity = 15 
}: CoinRainAnimationProps) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const newCoins: Coin[] = [];
      
      for (let i = 0; i < intensity; i++) {
        newCoins.push({
          id: `coin-${i}-${Date.now()}`,
          x: Math.random() * 100,
          delay: Math.random() * 2000,
          rotation: Math.random() * 360,
          size: 20 + Math.random() * 15,
          type: Math.random() > 0.3 ? 'gold' : 'silver'
        });
      }
      
      setCoins(newCoins);
      
      setTimeout(() => {
        setIsActive(false);
        setCoins([]);
      }, duration);
    }
  }, [trigger, duration, intensity]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            className={`absolute w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
              coin.type === 'gold' 
                ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600' 
                : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500'
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
              duration: 3 + Math.random() * 2,
              delay: coin.delay / 1000,
              ease: "easeIn",
            }}
          >
            <div className={`text-xs font-bold ${
              coin.type === 'gold' ? 'text-yellow-800' : 'text-gray-700'
            }`}>
              ₪
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}