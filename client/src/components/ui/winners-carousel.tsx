import { useEffect, useState } from "react";
import { Crown, Trophy, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface Winner {
  id: string;
  name: string;
  amount: string;
  date: string;
  matchCount: number;
}

interface WinnersCarouselProps {
  className?: string;
}

export function WinnersCarousel({ className = "" }: WinnersCarouselProps) {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    // Fetch recent winners
    fetch('/api/draws/recent-winners')
      .then(res => res.json())
      .then(data => {
        if (data.winners && data.winners.length > 0) {
          setWinners(data.winners);
        }
      })
      .catch(() => {
        // Fallback to demo winners if API fails
        setWinners([
          {
            id: '1',
            name: language === 'he' ? 'משה כהן' : 'Moshe Cohen',
            amount: '₪50,000',
            date: new Date().toLocaleDateString(),
            matchCount: 6
          },
          {
            id: '2', 
            name: language === 'he' ? 'שרה לוי' : 'Sarah Levy',
            amount: '₪25,000',
            date: new Date(Date.now() - 86400000).toLocaleDateString(),
            matchCount: 5
          },
          {
            id: '3',
            name: language === 'he' ? 'דוד אברהם' : 'David Abraham',
            amount: '₪10,000',
            date: new Date(Date.now() - 172800000).toLocaleDateString(),
            matchCount: 4
          }
        ]);
      });
  }, [language]);

  useEffect(() => {
    if (winners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % winners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [winners.length]);

  if (winners.length === 0) return null;

  const getIcon = (matchCount: number) => {
    if (matchCount === 6) return Crown;
    if (matchCount === 5) return Trophy;
    return Star;
  };

  const getIconColor = (matchCount: number) => {
    if (matchCount === 6) return "text-yellow-500";
    if (matchCount === 5) return "text-orange-500";
    return "text-blue-500";
  };

  const currentWinner = winners[currentIndex];
  const Icon = getIcon(currentWinner.matchCount);

  return (
    <div className={`bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-4 shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-4 text-center"
          >
            <Icon className={`h-6 w-6 ${getIconColor(currentWinner.matchCount)}`} />
            
            <div className="flex-1">
              <span className="font-bold text-lg">
                🎉 {t("congratulations")} {currentWinner.name}!
              </span>
              <span className="mx-2">•</span>
              <span className="font-semibold">
                {t("won")} {currentWinner.amount}
              </span>
              <span className="mx-2">•</span>
              <span className="text-sm opacity-90">
                {currentWinner.matchCount} {t("correct_numbers")}
              </span>
            </div>

            <div className="hidden sm:block text-sm opacity-75">
              {currentWinner.date}
            </div>
          </motion.div>
        </AnimatePresence>
        
        {winners.length > 1 && (
          <div className="flex justify-center mt-2 gap-1">
            {winners.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}