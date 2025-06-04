import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function AnimatedLogo({ size = "md", animate = true }: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <motion.div 
      className={sizeClasses[size]}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={animate ? { scale: 1.1, rotateY: 180 } : {}}
      transition={{ duration: 0.6, ease: "backOut" }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-lg"
        style={{ filter: isHovered ? "drop-shadow(0 8px 16px rgba(251, 191, 36, 0.4))" : "" }}
      >
        {/* Gradient Definitions */}
        <defs>
          <radialGradient id="ballGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
          
          <radialGradient id="shadowGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Shadow */}
        <motion.ellipse
          cx="50" cy="85" rx="25" ry="8"
          fill="url(#shadowGradient)"
          animate={animate ? {
            scaleX: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Ball */}
        <motion.circle
          cx="50" cy="50" r="30"
          fill="url(#ballGradient)"
          filter="url(#glow)"
          animate={animate ? {
            rotateZ: [0, 360],
            scale: [1, 1.05, 1]
          } : {}}
          transition={{ 
            rotateZ: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        {/* Highlight */}
        <motion.ellipse
          cx="42" cy="38" rx="8" ry="12"
          fill="rgba(255,255,255,0.6)"
          animate={animate ? {
            opacity: [0.6, 0.8, 0.6],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Numbers */}
        <motion.text
          x="50" y="45"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#1e293b"
          animate={animate ? {
            scale: [1, 1.1, 1],
            rotateZ: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          L
        </motion.text>
        
        <motion.text
          x="50" y="62"
          textAnchor="middle"
          fontSize="8"
          fontWeight="600"
          fill="#1e293b"
          animate={animate ? {
            opacity: [0.7, 1, 0.7]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          PRO
        </motion.text>

        {/* Sparkles */}
        {animate && (
          <>
            <motion.circle
              cx="25" cy="25" r="1.5"
              fill="white"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx="75" cy="30" r="1"
              fill="white"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.circle
              cx="80" cy="65" r="1.5"
              fill="white"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}