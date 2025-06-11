import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LotteryBallProps {
  number: number;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  animate?: boolean;
}

export function LotteryBall({ 
  number, 
  size = "md", 
  selected = false, 
  disabled = false, 
  onClick,
  animate = true 
}: LotteryBallProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg"
  };

  const baseClasses = cn(
    "rounded-full flex items-center justify-center font-bold transition-all duration-200 cursor-pointer",
    sizeClasses[size],
    selected 
      ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg scale-105" 
      : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300",
    disabled && "opacity-50 cursor-not-allowed",
    onClick && "hover:scale-110 active:scale-95"
  );

  const ballContent = (
    <div className={baseClasses} onClick={!disabled ? onClick : undefined}>
      {number}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: Math.random() * 0.2 
        }}
        whileHover={{ scale: onClick && !disabled ? 1.1 : 1 }}
        whileTap={{ scale: onClick && !disabled ? 0.95 : 1 }}
      >
        {ballContent}
      </motion.div>
    );
  }

  return ballContent;
}