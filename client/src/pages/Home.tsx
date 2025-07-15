import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MobileOptimizedCard, MobileStatsCard, MobileActionCard } from "@/components/mobile/MobileOptimizedCard";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { 
  Trophy, 
  Clock, 
  Coins, 
  Star, 
  Repeat, 
  ExternalLink,
  MessageCircle,
  Phone,
  Users
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Winners Carousel Component
function WinnersCarousel() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Mock recent winners data - replace with real API call
  const recentWinners = [
    { name: "David K.", amount: 15000, time: "2 hours ago" },
    { name: "Sarah M.", amount: 8500, time: "5 hours ago" },
    { name: "Ahmed R.", amount: 12000, time: "1 day ago" },
    { name: "Rachel L.", amount: 25000, time: "2 days ago" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recentWinners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [recentWinners.length]);

  return (
    <MobileOptimizedCard 
      gradient
      className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 border-0 text-white mb-4"
      compact
    >
      <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
        <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white animate-bounce" />
        <div className="text-center text-white">
          <h3 className="font-bold mobile-text-lg">{t("winnersCarousel")}</h3>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mobile-text-sm"
          >
            <span className="font-semibold">{recentWinners[currentIndex].name}</span>
            {" "}{t("winner")} ₪{recentWinners[currentIndex].amount.toLocaleString()}
            <div className="text-xs opacity-80">{recentWinners[currentIndex].time}</div>
          </motion.div>
        </div>
        <Star className="w-5 h-5 md:w-6 md:h-6 text-white animate-pulse" />
      </div>
    </MobileOptimizedCard>
  );
}

// Jackpot Display Component
function JackpotDisplay() {
  const { t } = useLanguage();
  const [jackpotAmount, setJackpotAmount] = useState(125000);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Update jackpot every few hours (simulated)
    const interval = setInterval(() => {
      setJackpotAmount(prev => prev + Math.floor(Math.random() * 1000));
      setLastUpdate(new Date());
    }, 3600000); // Every hour

    return () => clearInterval(interval);
  }, []);

  return (
    <MobileOptimizedCard 
      className="bg-gradient-to-br from-purple-600 to-blue-600 text-white border-0 shadow-lg"
      title={t("currentJackpot")}
      icon={<Coins className="w-6 h-6 md:w-8 md:h-8 animate-spin" />}
    >
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold mb-2">
          ₪{jackpotAmount.toLocaleString()}
        </div>
        <div className="mobile-text-sm opacity-80">
          {t("lastUpdated")}: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </MobileOptimizedCard>
  );
}

// Number Selection Component
function NumberSelection() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [participationAmount, setParticipationAmount] = useState(100);
  const [isParticipationLocked, setIsParticipationLocked] = useState(false);

  // Get user's previous numbers for reuse
  const { data: previousNumbers } = useQuery({
    queryKey: ["/api/user/previous-numbers"],
    enabled: !!user,
  });

  const participateMutation = useMutation({
    mutationFn: async (data: { numbers: number[], amount: number }) => {
      return apiRequest("POST", "/api/tickets", data);
    },
    onSuccess: () => {
      toast({
        title: t("success"),
        description: t("participationConfirmed"),
      });
      setSelectedNumbers([]);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message.includes("insufficient") 
          ? t("insufficientBalance") 
          : t("error"),
        variant: "destructive",
      });
    },
  });

  const toggleNumber = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(prev => prev.filter(n => n !== number));
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers(prev => [...prev, number]);
    }
  };

  const selectRandomNumbers = () => {
    const numbers: number[] = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 37) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    setSelectedNumbers(numbers);
  };

  const reusePreviousNumbers = () => {
    if (previousNumbers && Array.isArray(previousNumbers) && previousNumbers.length >= 6) {
      setSelectedNumbers(previousNumbers.slice(0, 6));
    }
  };

  const handleParticipate = () => {
    if (selectedNumbers.length !== 6) {
      toast({
        title: t("error"),
        description: t("required"),
        variant: "destructive",
      });
      return;
    }

    participateMutation.mutate({
      numbers: selectedNumbers,
      amount: participationAmount
    });
  };

  // Check if participation should be locked (60 seconds before draw)
  useEffect(() => {
    // This would be connected to actual draw timing logic
    const checkDrawTiming = () => {
      // Mock implementation - would check actual draw time
      const now = new Date();
      const nextDraw = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      const timeDiff = nextDraw.getTime() - now.getTime();
      setIsParticipationLocked(timeDiff <= 60000); // Lock 60 seconds before
    };

    const interval = setInterval(checkDrawTiming, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          {t("participateInLottery")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Number Selection Grid */}
        <div>
          <h3 className="font-semibold mb-3">{t("selectNumbers")}</h3>
          <div className="grid grid-cols-6 gap-2 mb-4">
            {Array.from({ length: 37 }, (_, i) => i + 1).map((number) => (
              <LotteryBall
                key={number}
                number={number}
                selected={selectedNumbers.includes(number)}
                onClick={() => toggleNumber(number)}
                disabled={isParticipationLocked}
                size="sm"
              />
            ))}
          </div>
          
          {/* Selected Numbers Display */}
          <div className="flex items-center gap-2 mb-4">
            <span className="font-medium">{t("selectNumbers")}:</span>
            <div className="flex gap-1">
              {selectedNumbers.map((num, idx) => (
                <LotteryBall
                  key={idx}
                  number={num}
                  selected={true}
                  size="sm"
                />
              ))}
              {Array.from({ length: 6 - selectedNumbers.length }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400 text-xs"
                >
                  ?
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={selectRandomNumbers}
            variant="outline"
            disabled={isParticipationLocked}
            className="flex items-center gap-2"
          >
            <div className="w-4 h-4 border border-current rounded"></div>
            Random Numbers
          </Button>
          
          {previousNumbers && Array.isArray(previousNumbers) && previousNumbers.length > 0 ? (
            <Button
              onClick={reusePreviousNumbers}
              variant="outline"
              disabled={isParticipationLocked}
              className="flex items-center gap-2"
            >
              <Repeat className="w-4 h-4" />
              {t("reuseNumbers")}
            </Button>
          ) : null}
        </div>

        {/* Participation Amount */}
        <div>
          <label className="block font-medium mb-2">{t("participationAmount")}</label>
          <Input
            type="number"
            value={participationAmount}
            onChange={(e) => setParticipationAmount(Number(e.target.value))}
            min="100"
            step="100"
            disabled={isParticipationLocked}
            className="w-full"
          />
        </div>

        {/* Ticket Cost Display */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-blue-800">Ticket Cost:</span>
            <span className="text-xl font-bold text-blue-900">₪{participationAmount}</span>
          </div>
          <div className="text-sm text-blue-600">
            {t("currentBalance")}: ₪{(user as any)?.balance || 0}
          </div>
        </div>

        {/* Submit Button */}
        {isParticipationLocked ? (
          <div className="text-center text-red-600 font-medium">
            {t("participationLocked")}
          </div>
        ) : (
          <Button
            onClick={handleParticipate}
            disabled={selectedNumbers.length !== 6 || participateMutation.isPending}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 text-lg shadow-lg"
            id="buy-ticket-button"
          >
            <Coins className="w-5 h-5 mr-2" />
            {participateMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t("loading")}
              </div>
            ) : (
              `Buy Lottery Ticket - ₪${participationAmount}`
            )}
          </Button>
        )}

        {/* Help Text */}
        <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="font-medium mb-1">How to play:</div>
          <div>1. Select 6 numbers (1-37)</div>
          <div>2. Choose your ticket amount</div>
          <div>3. Click "Buy Lottery Ticket" to participate</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Next Draw Info Component
function NextDrawInfo() {
  const { t } = useLanguage();
  const [timeUntilDraw, setTimeUntilDraw] = useState({
    days: 0,
    hours: 2,
    minutes: 30,
    seconds: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilDraw(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-6 h-6" />
          {t("nextDrawInfo")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-lg mb-2">{t("drawCountdown")}</div>
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{timeUntilDraw.days}</div>
              <div className="text-xs">{t("days")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{timeUntilDraw.hours}</div>
              <div className="text-xs">{t("hours")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{timeUntilDraw.minutes}</div>
              <div className="text-xs">{t("minutes")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{timeUntilDraw.seconds}</div>
              <div className="text-xs">{t("seconds")}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Contact Widget
function QuickContactWidget() {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
      <Button
        size="sm"
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3"
        onClick={() => window.open('https://wa.me/your-number', '_blank')}
      >
        <Phone className="w-5 h-5" />
      </Button>
      <Button
        size="sm"
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3"
        onClick={() => window.open('https://t.me/your-channel', '_blank')}
      >
        <MessageCircle className="w-5 h-5" />
      </Button>
      <Button
        size="sm"
        className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-3"
        onClick={() => {/* Open chat */}}
      >
        <Users className="w-5 h-5" />
      </Button>
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden pb-20 md:pb-8">
      <FloatingParticles count={30} />
      
      <div className="mobile-container md:container mx-auto px-4 py-4 md:py-8 space-y-4 md:space-y-8">
        {/* Welcome Header - Mobile optimisé */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {t("appName")}
          </h1>
          <p className="mobile-text-base md:text-lg text-gray-600">
            {t("welcomeMessage")}
          </p>
        </motion.div>

        {/* Winners Carousel */}
        <WinnersCarousel />

        {/* Layout mobile-first */}
        <div className="mobile-grid-1 lg:grid-cols-3 lg:grid gap-4 md:gap-8">
          {/* Jackpot et Next Draw - Mobile stacked */}
          <div className="space-y-4 md:space-y-6">
            <JackpotDisplay />
            
            {/* Next Draw Info - Version mobile compacte */}
            <MobileOptimizedCard 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              title={t("nextDrawInfo")}
              icon={<Clock className="w-5 h-5 md:w-6 md:h-6" />}
              compact
            >
              <div className="text-center">
                <div className="mobile-text-sm md:text-lg mb-2">{t("drawCountdown")}</div>
                <div className="flex justify-center space-x-2 md:space-x-4">
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold">3</div>
                    <div className="text-xs">{t("days")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold">14</div>
                    <div className="text-xs">{t("hours")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold">27</div>
                    <div className="text-xs">{t("minutes")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold">45</div>
                    <div className="text-xs">{t("seconds")}</div>
                  </div>
                </div>
              </div>
            </MobileOptimizedCard>
            
            {/* Standard Lottery - Masqué sur mobile pour éviter l'encombrement */}
            <div className="hidden md:block">
              <Card className="border-dashed border-2 border-orange-300 bg-orange-50">
                <CardContent className="text-center p-6">
                  <ExternalLink className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="font-medium text-orange-700 mb-3">
                    {t("standardLotterySuggestion")}
                  </p>
                  <Button variant="outline" className="border-orange-500 text-orange-700 hover:bg-orange-100">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Number Selection - Prend toute la largeur sur mobile */}
          <div className="lg:col-span-2">
            <NumberSelection />
          </div>
        </div>
      </div>

      {/* Quick Contact Widget - Masqué sur mobile car WhatsApp Support présent */}
      <div className="hidden md:block">
        <QuickContactWidget />
      </div>
    </div>
  );
}