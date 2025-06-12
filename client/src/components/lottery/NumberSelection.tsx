import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { PreviousNumbersSelector } from "./PreviousNumbersSelector";
import { Dice6, Ticket, Clock, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface NumberSelectionProps {
  onTicketPurchased?: () => void;
}

export function NumberSelection({ onTicketPurchased }: NumberSelectionProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [timeUntilDraw, setTimeUntilDraw] = useState<number>(0);
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: currentDraw } = useQuery({
    queryKey: ["/api/draws/current"],
  });

  // Auto-lock system: 60 seconds before draw
  useEffect(() => {
    if (currentDraw && typeof currentDraw === 'object' && 'drawDate' in currentDraw) {
      const drawTime = new Date(currentDraw.drawDate as string).getTime();
      const updateTimer = () => {
        const now = Date.now();
        const timeLeft = drawTime - now;
        setTimeUntilDraw(timeLeft);
        setIsLocked(timeLeft <= 60000); // Lock 60 seconds before
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [currentDraw]);

  const purchaseTicketMutation = useMutation({
    mutationFn: async (numbers: number[]) => {
      if (!currentDraw || typeof currentDraw !== 'object' || !('id' in currentDraw)) {
        throw new Error("No active draw");
      }
      
      return apiRequest("POST", "/api/tickets", {
        drawId: (currentDraw as any).id,
        numbers,
        cost: "100.00",
      });
    },
    onSuccess: () => {
      toast({
        title: t("congratulations"),
        description: "Ticket purchased successfully!",
      });
      setSelectedNumbers([]);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets/my"] });
      onTicketPurchased?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleNumber = (number: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else if (prev.length < 6) {
        return [...prev, number].sort((a, b) => a - b);
      }
      return prev;
    });
  };

  const randomNumbers = () => {
    const numbers: number[] = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 37) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
  };

  const purchaseTicket = () => {
    if (selectedNumbers.length !== 6) {
      toast({
        title: "Error",
        description: t("mustSelect6Numbers"),
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: t("loginRequired"),
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(user.balance) < 100) {
      toast({
        title: "Error",
        description: t("insufficientBalance"),
        variant: "destructive",
      });
      return;
    }

    purchaseTicketMutation.mutate(selectedNumbers);
  };

  return (
    <Card className="shadow-xl border-0">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
          <h2 className="text-2xl font-bold text-slate-900">{t("selectYourLuckyNumbers")}</h2>
          <div className="text-sm text-gray-500">{t("chooseNumbers")}</div>
        </div>

        {/* Number Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 gap-3 mb-8">
          {Array.from({ length: 37 }, (_, i) => i + 1).map((number, index) => (
            <LotteryBall
              key={number}
              number={number}
              isSelected={selectedNumbers.includes(number)}
              onClick={() => toggleNumber(number)}
              animationDelay={index * 0.02}
              disabled={!selectedNumbers.includes(number) && selectedNumbers.length >= 6}
            />
          ))}
        </div>

        {/* Selected Numbers Display */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
            <h3 className="text-lg font-semibold text-slate-900">{t("yourSelectedNumbers")}</h3>
            <span className="text-sm text-gray-500">{selectedNumbers.length}/6 {t("selected")}</span>
          </div>
          
          <div className="flex space-x-3 mb-4 justify-center" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                style={{
                  background: selectedNumbers[i] 
                    ? "linear-gradient(135deg, #fbbf24, #f59e0b)" 
                    : "#e5e7eb",
                  color: selectedNumbers[i] ? "#1e293b" : "#9ca3af"
                }}
              >
                {selectedNumbers[i] || "?"}
              </motion.div>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {t("costPerTicket")}: <span className="font-semibold text-slate-900">₪100</span>
            </div>
            <Button
              variant="ghost"
              onClick={randomNumbers}
              className="text-yellow-600 hover:text-yellow-700"
            >
              <Dice6 className="w-4 h-4 mr-2" />
              {t("quickPick")}
            </Button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={purchaseTicket}
          disabled={selectedNumbers.length !== 6 || purchaseTicketMutation.isPending}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-slate-900 font-bold py-4 px-6 text-lg shadow-lg hover:shadow-xl"
        >
          <Ticket className="w-5 h-5 mr-3" />
          {purchaseTicketMutation.isPending ? "Processing..." : `${t("purchaseTicket")} - ₪100`}
        </Button>
      </CardContent>
    </Card>
  );
}
