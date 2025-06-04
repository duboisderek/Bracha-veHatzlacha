import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LotteryBallProps {
  number: number;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  animationDelay?: number;
}

export function LotteryBall({ 
  number, 
  isSelected = false, 
  onClick, 
  className,
  size = "md",
  disabled = false,
  animationDelay = 0
}: LotteryBallProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-14 h-14 text-lg"
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay: animationDelay,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50",
        sizeClasses[size],
        isSelected
          ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 shadow-lg border-2 border-yellow-600 focus:ring-yellow-500"
          : "border-2 border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 text-slate-900 focus:ring-yellow-500",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {number}
    </motion.button>
  );
}
