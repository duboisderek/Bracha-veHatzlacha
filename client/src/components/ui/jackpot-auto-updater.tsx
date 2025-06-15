import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Clock, TrendingUp } from "lucide-react";

interface JackpotAutoUpdaterProps {
  currentJackpot: string;
  onJackpotUpdate?: (newAmount: string) => void;
  className?: string;
}

export function JackpotAutoUpdater({ 
  currentJackpot, 
  onJackpotUpdate,
  className = "" 
}: JackpotAutoUpdaterProps) {
  const { t, language } = useLanguage();
  const [timeUntilUpdate, setTimeUntilUpdate] = useState(3600); // 1 hour in seconds
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilUpdate(prev => {
        if (prev <= 1) {
          // Time to update jackpot
          updateJackpot();
          return 3600; // Reset to 1 hour
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateJackpot = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/draws/update-jackpot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incrementAmount: Math.floor(Math.random() * 1000) + 500 })
      });
      
      if (response.ok) {
        const data = await response.json();
        setLastUpdateTime(new Date());
        onJackpotUpdate?.(data.newJackpot);
      }
    } catch (error) {
      console.error('Failed to update jackpot:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastUpdate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'he' ? 'he-IL' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  return (
    <div className={`bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-green-800 dark:text-green-200">
            {t("jackpot_updated")}
          </span>
        </div>
        
        {isUpdating && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"
          />
        )}
      </div>
      
      <div className="mt-2 space-y-1 text-sm">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Clock className="h-4 w-4" />
          <span>{t("last_update")}: {formatLastUpdate(lastUpdateTime)}</span>
        </div>
        
        <div className="text-green-600 dark:text-green-400">
          {t("auto_update_in")}: {formatTime(timeUntilUpdate)}
        </div>
        
        <div className="text-xs text-green-500 dark:text-green-500 mt-1">
          {t("full_timestamp")}: {lastUpdateTime.toLocaleDateString()} {lastUpdateTime.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}