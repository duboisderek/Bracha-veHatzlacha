import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Sparkles, Clock, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";

interface PreviousNumbersSelectorProps {
  onNumbersSelected: (numbers: number[]) => void;
}

export function PreviousNumbersSelector({ onNumbersSelected }: PreviousNumbersSelectorProps) {
  const { t, isRTL } = useLanguage();
  const [selectedDraw, setSelectedDraw] = useState<number | null>(null);

  const { data: completedDraws } = useQuery({
    queryKey: ["/api/draws/completed"],
  });

  // Mock data for demonstration - in real app this would come from API
  const mockDraws = [
    {
      id: 1,
      drawNumber: 1253,
      drawDate: "2025-06-14",
      winningNumbers: [7, 14, 21, 28, 35, 42],
      jackpotAmount: "125000"
    },
    {
      id: 2,
      drawNumber: 1252,
      drawDate: "2025-06-13",
      winningNumbers: [3, 9, 16, 23, 30, 37],
      jackpotAmount: "98000"
    },
    {
      id: 3,
      drawNumber: 1251,
      drawDate: "2025-06-12",
      winningNumbers: [5, 12, 19, 26, 33, 40],
      jackpotAmount: "87500"
    },
    {
      id: 4,
      drawNumber: 1250,
      drawDate: "2025-06-11",
      winningNumbers: [1, 8, 15, 22, 29, 36],
      jackpotAmount: "112000"
    },
    {
      id: 5,
      drawNumber: 1249,
      drawDate: "2025-06-10",
      winningNumbers: [6, 13, 20, 27, 34, 41],
      jackpotAmount: "156000"
    }
  ];

  const draws = Array.isArray(completedDraws) && completedDraws.length > 0 ? completedDraws : mockDraws;

  const handleSelectNumbers = (numbers: number[]) => {
    onNumbersSelected(numbers);
  };

  const getMostFrequent = () => {
    const frequency: { [key: number]: number } = {};
    draws.forEach((draw: any) => {
      if (draw.winningNumbers) {
        draw.winningNumbers.forEach((num: number) => {
          frequency[num] = (frequency[num] || 0) + 1;
        });
      }
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([num]) => parseInt(num));
  };

  const getLeastFrequent = () => {
    const frequency: { [key: number]: number } = {};
    // Initialize all numbers 1-37 with frequency 0
    for (let i = 1; i <= 37; i++) {
      frequency[i] = 0;
    }
    
    draws.forEach((draw: any) => {
      if (draw.winningNumbers) {
        draw.winningNumbers.forEach((num: number) => {
          frequency[num] = (frequency[num] || 0) + 1;
        });
      }
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 6)
      .map(([num]) => parseInt(num));
  };

  const mostFrequent = getMostFrequent();
  const leastFrequent = getLeastFrequent();

  return (
    <div className="space-y-6">
      {/* Quick Selection Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">{t("hotNumbers")}</h3>
              <Badge variant="secondary" className="text-xs">Most Frequent</Badge>
            </div>
            <div className="flex gap-2 mb-3 justify-center">
              {mostFrequent.map((number, index) => (
                <LotteryBall
                  key={index}
                  number={number}
                  selected={false}
                  size="sm"
                  disabled={true}
                />
              ))}
            </div>
            <Button
              onClick={() => handleSelectNumbers(mostFrequent)}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t("useTheseNumbers")}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">{t("coldNumbers")}</h3>
              <Badge variant="secondary" className="text-xs">Least Frequent</Badge>
            </div>
            <div className="flex gap-2 mb-3 justify-center">
              {leastFrequent.map((number, index) => (
                <LotteryBall
                  key={index}
                  number={number}
                  selected={false}
                  size="sm"
                  disabled={true}
                />
              ))}
            </div>
            <Button
              onClick={() => handleSelectNumbers(leastFrequent)}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t("useTheseNumbers")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Draws History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t("recentDraws")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {draws.slice(0, 5).map((draw: any, index: number) => (
              <motion.div
                key={draw.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedDraw === draw.id 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => setSelectedDraw(selectedDraw === draw.id ? null : draw.id)}
              >
                <div className="flex items-center justify-between mb-3" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {t("draw")} #{draw.drawNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(draw.drawDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    ₪{parseInt(draw.jackpotAmount).toLocaleString()}
                  </Badge>
                </div>
                
                <div className="flex gap-2 mb-3 justify-center">
                  {draw.winningNumbers.map((number: number, numIndex: number) => (
                    <LotteryBall
                      key={numIndex}
                      number={number}
                      selected={false}
                      size="sm"
                      disabled={true}
                    />
                  ))}
                </div>

                {selectedDraw === draw.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-3 border-t border-gray-200"
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectNumbers(draw.winningNumbers);
                      }}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 font-semibold"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t("useTheseNumbers")}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}