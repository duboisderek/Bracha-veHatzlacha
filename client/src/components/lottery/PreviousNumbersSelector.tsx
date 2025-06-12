import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { History, Repeat } from "lucide-react";
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

  const handleSelectNumbers = (numbers: number[]) => {
    onNumbersSelected(numbers);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <History className="w-5 h-5" />
          {t("previousDrawNumbers")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          {t("selectFromDrawHistory")}
        </div>
        
        {completedDraws && Array.isArray(completedDraws) && completedDraws.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {completedDraws.slice(0, 10).map((draw: any) => (
              <motion.div
                key={draw.id}
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedDraw(selectedDraw === draw.id ? null : draw.id)}
              >
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t("drawNumber")} {draw.drawNumber}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(draw.drawDate).toLocaleDateString()}
                  </div>
                </div>
                
                {draw.winningNumbers && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">
                      {t("pastWinningNumbers")}:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {draw.winningNumbers.map((number: number, index: number) => (
                        <LotteryBall
                          key={index}
                          number={number}
                          size="sm"
                          selected={true}
                          animate={false}
                        />
                      ))}
                    </div>
                    
                    {selectedDraw === draw.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3"
                      >
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectNumbers(draw.winningNumbers);
                          }}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          size="sm"
                        >
                          <Repeat className="w-4 h-4 mr-2" />
                          {t("usePreviousDrawNumbers")}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t("drawHistoryList")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}