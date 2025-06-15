import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Lock, Clock, AlertTriangle } from "lucide-react";

interface DrawLockSystemProps {
  drawStartTime?: Date;
  onLockStatusChange?: (isLocked: boolean) => void;
  className?: string;
}

export function DrawLockSystem({ 
  drawStartTime, 
  onLockStatusChange,
  className = "" 
}: DrawLockSystemProps) {
  const { t } = useLanguage();
  const [isLocked, setIsLocked] = useState(false);
  const [timeUntilLock, setTimeUntilLock] = useState<number | null>(null);
  const [timeUntilDraw, setTimeUntilDraw] = useState<number | null>(null);

  useEffect(() => {
    if (!drawStartTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const drawTime = new Date(drawStartTime);
      const lockTime = new Date(drawTime.getTime() - 60000); // 60 seconds before draw
      
      const timeToLock = lockTime.getTime() - now.getTime();
      const timeToDraw = drawTime.getTime() - now.getTime();
      
      setTimeUntilLock(Math.max(0, timeToLock));
      setTimeUntilDraw(Math.max(0, timeToDraw));
      
      const shouldBeLocked = timeToLock <= 0 && timeToDraw > 0;
      
      if (shouldBeLocked !== isLocked) {
        setIsLocked(shouldBeLocked);
        onLockStatusChange?.(shouldBeLocked);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [drawStartTime, isLocked, onLockStatusChange]);

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  if (!drawStartTime) return null;

  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Lock className="h-6 w-6 text-red-500" />
          </motion.div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 dark:text-red-200">
              {t("draw_locked")}
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300">
              {t("participation_locked")}
            </p>
            {timeUntilDraw && timeUntilDraw > 0 && (
              <p className="text-xs text-red-500 mt-1">
                {t("remainingTime")}: {formatTime(timeUntilDraw)}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (timeUntilLock && timeUntilLock < 300000) { // Show warning 5 minutes before lock
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </motion.div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
              {t("drawLockWarning")}
            </h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-300">
              {t("lockMessage")}
            </p>
            <p className="text-xs text-yellow-500 mt-1">
              {t("remainingTime")}: {formatTime(timeUntilLock)}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}