import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Star, Crown, Gem } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface UserRankDisplayProps {
  className?: string;
}

interface RankConfig {
  name: string;
  threshold: number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  benefits: string[];
}

const rankConfigs: Record<string, RankConfig> = {
  new: {
    name: "New",
    threshold: 0,
    icon: Star,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    benefits: ["Basic support", "Standard features"]
  },
  silver: {
    name: "Silver",
    threshold: 10,
    icon: Award,
    color: "text-gray-400",
    bgColor: "bg-gray-50",
    benefits: ["Basic support", "Standard notifications"]
  },
  gold: {
    name: "Gold", 
    threshold: 100,
    icon: Crown,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    benefits: ["Priority support", "Advanced statistics", "Bonus draws"]
  },
  diamond: {
    name: "Diamond",
    threshold: 500,
    icon: Gem,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    benefits: ["VIP support", "Exclusive events", "Higher bonuses", "Personal account manager"]
  }
};

export function UserRankDisplay({ className = "" }: UserRankDisplayProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const { data: userTickets } = useQuery({
    queryKey: ["/api/tickets/my"],
    enabled: !!user,
  });

  const participationCount = Array.isArray(userTickets) ? userTickets.length : 0;

  const getCurrentRank = (count: number) => {
    if (count >= 500) return 'diamond';
    if (count >= 100) return 'gold';
    if (count >= 10) return 'silver';
    return 'new';
  };

  const getNextRank = (currentRank: string) => {
    switch (currentRank) {
      case 'new': return 'silver';
      case 'silver': return 'gold';
      case 'gold': return 'diamond';
      default: return null;
    }
  };

  const currentRankKey = getCurrentRank(participationCount);
  const currentRank = rankConfigs[currentRankKey];
  const nextRankKey = getNextRank(currentRankKey);
  const nextRank = nextRankKey ? rankConfigs[nextRankKey] : null;

  const progressToNextRank = nextRank 
    ? Math.min(((participationCount - currentRank.threshold) / (nextRank.threshold - currentRank.threshold)) * 100, 100)
    : 100;

  const remainingToNextRank = nextRank ? nextRank.threshold - participationCount : 0;

  const Icon = currentRank.icon;

  const rankNames = {
    en: {
      new: "New Member",
      silver: "Silver Member",
      gold: "Gold Member", 
      diamond: "Diamond Member"
    },
    he: {
      new: "חבר חדש",
      silver: "חבר כסף",
      gold: "חבר זהב",
      diamond: "חבר יהלום"
    }
  };

  const benefitTranslations = {
    en: {
      "Basic support": "Basic support",
      "Standard notifications": "Standard notifications",
      "Standard features": "Standard features",
      "Priority support": "Priority support",
      "Advanced statistics": "Advanced statistics",
      "Bonus draws": "Bonus draws",
      "VIP support": "VIP support",
      "Exclusive events": "Exclusive events",
      "Higher bonuses": "Higher bonuses",
      "Personal account manager": "Personal account manager"
    },
    he: {
      "Basic support": "תמיכה בסיסית",
      "Standard notifications": "התראות רגילות",
      "Standard features": "תכונות בסיסיות",
      "Priority support": "תמיכה מועדפת",
      "Advanced statistics": "סטטיסטיקות מתקדמות",
      "Bonus draws": "הגרלות בונוס",
      "VIP support": "תמיכת VIP",
      "Exclusive events": "אירועים בלעדיים",
      "Higher bonuses": "בונוסים גבוהים יותר",
      "Personal account manager": "מנהל חשבון אישי"
    }
  };

  return (
    <Card className={`${currentRank.bgColor} border-2 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`p-2 rounded-full bg-white shadow-md`}
          >
            <Icon className={`h-6 w-6 ${currentRank.color}`} />
          </motion.div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800">
              {rankNames[language as keyof typeof rankNames][currentRankKey]}
            </h3>
            <p className="text-sm text-gray-600">
              {participationCount} {t("participations")}
            </p>
          </div>
        </div>

        {nextRank && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {t("progressToNext")}: {rankNames[language as keyof typeof rankNames][nextRankKey]}
              </span>
              <span className="text-sm text-gray-600">
                {remainingToNextRank} {t("remaining")}
              </span>
            </div>
            <Progress value={progressToNextRank} className="h-2" />
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">
            {t("benefits")}:
          </h4>
          {currentRank.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">
                {benefitTranslations[language as keyof typeof benefitTranslations][benefit] || benefit}
              </span>
            </div>
          ))}
        </div>

        {currentRankKey === 'diamond' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-200"
          >
            <p className="text-sm font-medium text-blue-800 text-center">
              🎉 {t("maxRankAchieved")}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}