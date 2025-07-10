import { motion } from "framer-motion";
import { LotteryBall } from "@/components/ui/lottery-ball";

interface MobileLotteryBallsProps {
  selectedNumbers: number[];
  onNumberClick: (number: number) => void;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
}

export function MobileLotteryBalls({
  selectedNumbers,
  onNumberClick,
  maxSelections = 6,
  disabled = false,
  className = ""
}: MobileLotteryBallsProps) {
  const numbers = Array.from({ length: 37 }, (_, i) => i + 1);

  return (
    <div className={`mobile-grid-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 ${className}`}>
      {numbers.map((number) => {
        const isSelected = selectedNumbers.includes(number);
        const canSelect = selectedNumbers.length < maxSelections || isSelected;
        
        return (
          <motion.div
            key={number}
            whileTap={canSelect && !disabled ? { scale: 0.9 } : {}}
            whileHover={canSelect && !disabled ? { scale: 1.05 } : {}}
          >
            <LotteryBall
              number={number}
              selected={isSelected}
              onClick={() => canSelect && !disabled && onNumberClick(number)}
              disabled={!canSelect || disabled}
              className={`
                w-12 h-12 md:w-14 md:h-14 text-sm md:text-base
                touch-target transition-all duration-200
                ${!canSelect && !isSelected ? 'opacity-30' : ''}
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

// Version compacte pour l'affichage des numéros sélectionnés
export function SelectedNumbersDisplay({ 
  numbers, 
  className = "" 
}: { 
  numbers: number[];
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className}`}>
      {numbers.map((number, index) => (
        <motion.div
          key={number}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <LotteryBall
            number={number}
            selected={true}
            className="w-10 h-10 md:w-12 md:h-12 text-sm md:text-base"
            disabled
          />
        </motion.div>
      ))}
      
      {/* Espaces vides pour les numéros manquants */}
      {Array.from({ length: 6 - numbers.length }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="w-10 h-10 md:w-12 md:h-12 border-2 border-dashed border-gray-300 
                     rounded-full flex items-center justify-center text-gray-400 text-xs"
        >
          ?
        </div>
      ))}
    </div>
  );
}

// Composant pour les numéros gagnants avec animation
export function WinningNumbersDisplay({ 
  numbers, 
  userNumbers = [],
  className = "" 
}: { 
  numbers: number[];
  userNumbers?: number[];
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className}`}>
      {numbers.map((number, index) => {
        const isMatch = userNumbers.includes(number);
        
        return (
          <motion.div
            key={number}
            initial={{ scale: 0, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ 
              delay: index * 0.2,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            <LotteryBall
              number={number}
              selected={true}
              className={`
                w-12 h-12 md:w-14 md:h-14 text-sm md:text-base
                ${isMatch ? 'ring-4 ring-green-400 ring-opacity-60' : ''}
              `}
              disabled
            />
            {isMatch && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ delay: index * 0.2 + 0.5 }}
                className="text-center mt-1"
              >
                <span className="text-xs text-green-600 font-bold">✓</span>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// Quick pick helper pour mobile
export function QuickPickButton({ 
  onQuickPick, 
  disabled = false,
  className = ""
}: {
  onQuickPick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onQuickPick}
      disabled={disabled}
      className={`
        mobile-btn bg-gradient-to-r from-purple-500 to-blue-500 text-white
        hover:from-purple-600 hover:to-blue-600 disabled:opacity-50
        disabled:cursor-not-allowed shadow-lg hover:shadow-xl
        ${className}
      `}
    >
      <span className="mr-2">🎲</span>
      Quick Pick
    </motion.button>
  );
}