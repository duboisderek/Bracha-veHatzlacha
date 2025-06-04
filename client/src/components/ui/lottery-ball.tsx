import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LotteryBallProps {
  number: number;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  animationDelay?: number;
  variant?: "default" | "golden" | "winning" | "special";
}

export function LotteryBall({ 
  number, 
  isSelected = false, 
  onClick, 
  className,
  size = "md",
  disabled = false,
  animationDelay = 0,
  variant = "default"
}: LotteryBallProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-14 h-14 text-lg",
    xl: "w-16 h-16 text-xl"
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "golden":
        return "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-slate-900 shadow-2xl border-2 border-yellow-500";
      case "winning":
        return "bg-gradient-to-br from-green-300 via-green-400 to-green-600 text-white shadow-2xl border-2 border-green-500";
      case "special":
        return "bg-gradient-to-br from-purple-300 via-purple-400 to-purple-600 text-white shadow-2xl border-2 border-purple-500";
      default:
        return isSelected
          ? "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-slate-900 shadow-2xl border-2 border-yellow-500"
          : "bg-gradient-to-br from-white via-gray-50 to-gray-100 border-2 border-gray-200 hover:border-yellow-400 hover:shadow-lg text-slate-900";
    }
  };

  return (
    <motion.div
      className={cn("relative", sizeClasses[size])}
      initial={{ scale: 0, opacity: 0, rotateY: -180 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ 
        delay: animationDelay,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
    >
      {/* 3D Ball Effect */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={!disabled ? { 
          scale: 1.1,
          rotateX: 15,
          rotateY: 15,
          z: 50
        } : {}}
        whileTap={!disabled ? { 
          scale: 0.95,
          rotateX: -10,
          rotateY: -10
        } : {}}
        animate={isSelected ? {
          rotateZ: [0, 5, -5, 0],
          transition: { duration: 2, repeat: Infinity }
        } : {}}
        className={cn(
          "relative w-full h-full rounded-full font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-50 transform-gpu perspective-1000",
          getVariantStyles(),
          disabled && "opacity-50 cursor-not-allowed",
          "shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.1)]"
        )}
        style={{
          transformStyle: "preserve-3d",
          background: isSelected || variant !== "default" 
            ? undefined 
            : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.3), rgba(0,0,0,0.1))`
        }}
      >
        {/* Glossy Highlight */}
        <div className={cn(
          "absolute top-1 left-1 rounded-full opacity-60 transition-opacity duration-300",
          size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-5 h-5",
          "bg-gradient-to-br from-white to-transparent"
        )} />
        
        {/* Number */}
        <span className="relative z-10 drop-shadow-sm">{number}</span>
        
        {/* Special Effects for Selected */}
        {isSelected && (
          <>
            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-yellow-400 opacity-30 blur-sm"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Sparkle Effect */}
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2"
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.5
              }}
            >
              <div className="w-full h-full bg-white rounded-full opacity-80" />
            </motion.div>
          </>
        )}
        
        {/* Hover Shimmer */}
        {isHovered && !disabled && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.button>
    </motion.div>
  );
}
