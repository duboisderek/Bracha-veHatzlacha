import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberBallProps {
  number: number;
  isSelected?: boolean;
  isWinning?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  animationDelay?: number;
  variant?: "default" | "winning" | "past";
}

export function NumberBall({ 
  number, 
  isSelected = false,
  isWinning = false,
  onClick, 
  className,
  size = "md",
  disabled = false,
  animationDelay = 0,
  variant = "default"
}: NumberBallProps) {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm", 
    md: "w-12 h-12 text-base",
    lg: "w-14 h-14 text-lg",
    xl: "w-16 h-16 text-xl"
  };

  const getVariantStyles = () => {
    if (isWinning || variant === "winning") {
      return "bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg border-2 border-green-600";
    }
    
    if (variant === "past") {
      const colors = [
        "from-red-400 to-red-600",
        "from-blue-400 to-blue-600", 
        "from-green-400 to-green-600",
        "from-purple-400 to-purple-600",
        "from-yellow-400 to-yellow-600",
        "from-pink-400 to-pink-600"
      ];
      const colorIndex = (number - 1) % colors.length;
      return `bg-gradient-to-r ${colors[colorIndex]} text-white shadow-lg border-2 border-current`;
    }
    
    if (isSelected) {
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 shadow-lg border-2 border-yellow-600 animate-pulse-gold";
    }
    
    return "border-2 border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 text-slate-900 bg-white";
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
      whileHover={!disabled && onClick ? { scale: 1.05 } : {}}
      whileTap={!disabled && onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled || !onClick}
      className={cn(
        "rounded-full font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 flex items-center justify-center",
        sizeClasses[size],
        getVariantStyles(),
        disabled && "opacity-50 cursor-not-allowed",
        !onClick && "cursor-default",
        className
      )}
      type="button"
    >
      {number}
    </motion.button>
  );
}
