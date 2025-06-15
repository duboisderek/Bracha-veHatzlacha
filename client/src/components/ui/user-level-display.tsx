import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Medal, Award, Diamond, Crown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserLevelDisplayProps {
  participationCount: number;
  className?: string;
}

interface LevelInfo {
  name: string;
  icon: any;
  threshold: number;
  color: string;
  bgColor: string;
  nextThreshold?: number;
}

export function UserLevelDisplay({ participationCount, className = "" }: UserLevelDisplayProps) {
  const { t } = useLanguage();

  const levels: LevelInfo[] = [
    { name: t("statusNew"), icon: Star, threshold: 0, color: "text-gray-600", bgColor: "bg-gray-100", nextThreshold: 10 },
    { name: t("statusSilver"), icon: Medal, threshold: 10, color: "text-gray-700", bgColor: "bg-gray-200", nextThreshold: 100 },
    { name: t("statusGold"), icon: Award, threshold: 100, color: "text-yellow-600", bgColor: "bg-yellow-100", nextThreshold: 500 },
    { name: t("statusDiamond"), icon: Diamond, threshold: 500, color: "text-blue-600", bgColor: "bg-blue-100", nextThreshold: 1000 },
    { name: t("statusVIP"), icon: Crown, threshold: 1000, color: "text-purple-600", bgColor: "bg-purple-100" }
  ];

  const getCurrentLevel = (count: number): LevelInfo => {
    for (let i = levels.length - 1; i >= 0; i--) {
      if (count >= levels[i].threshold) {
        return levels[i];
      }
    }
    return levels[0];
  };

  const getProgressToNext = (count: number, currentLevel: LevelInfo): number => {
    if (!currentLevel.nextThreshold) return 100;
    const progress = ((count - currentLevel.threshold) / (currentLevel.nextThreshold - currentLevel.threshold)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const currentLevel = getCurrentLevel(participationCount);
  const progressPercent = getProgressToNext(participationCount, currentLevel);
  const participationsNeeded = currentLevel.nextThreshold ? currentLevel.nextThreshold - participationCount : 0;
  const Icon = currentLevel.icon;

  return (
    <Card className={`${className} shadow-lg border-2`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${currentLevel.bgColor}`}>
            <Icon className={`w-6 h-6 ${currentLevel.color}`} />
          </div>
          <div>
            <div className="text-lg font-bold">{t("currentLevel")}</div>
            <Badge className={`${currentLevel.bgColor} ${currentLevel.color} border-0`}>
              {currentLevel.name}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {participationCount}
          </div>
          <div className="text-sm text-gray-600">
            {t("participationHistory")}
          </div>
        </div>

        {currentLevel.nextThreshold && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex justify-between text-sm">
              <span>{t("progressToNext")}</span>
              <span className="font-medium">
                {Math.round(progressPercent)}%
              </span>
            </div>
            
            <Progress value={progressPercent} className="h-3 bg-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </Progress>
            
            <div className="text-center text-sm text-gray-600">
              <span className="font-medium text-blue-600">
                {participationsNeeded}
              </span> {t("participationsLeft")}
            </div>
          </motion.div>
        )}

        {!currentLevel.nextThreshold && (
          <div className="text-center py-4">
            <div className="text-lg font-bold text-purple-600 flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" />
              Maximum Level Achieved!
            </div>
          </div>
        )}

        {/* Level Preview */}
        <div className="grid grid-cols-5 gap-2 pt-3 border-t">
          {levels.map((level, index) => {
            const isAchieved = participationCount >= level.threshold;
            const isCurrent = level === currentLevel;
            const LevelIcon = level.icon;
            
            return (
              <motion.div
                key={level.name}
                className={`text-center p-2 rounded-lg transition-all ${
                  isCurrent 
                    ? `${level.bgColor} border-2 border-blue-400` 
                    : isAchieved 
                      ? `${level.bgColor} opacity-70` 
                      : 'bg-gray-50 opacity-40'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <LevelIcon className={`w-4 h-4 mx-auto mb-1 ${
                  isAchieved ? level.color : 'text-gray-400'
                }`} />
                <div className="text-xs font-medium">
                  {level.threshold}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}