import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/lottery/StatsCards";
import { NumberSelection } from "@/components/lottery/NumberSelection";
import { TicketCard } from "@/components/lottery/TicketCard";
import { ReferralCard } from "@/components/referral/ReferralCard";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Confetti } from "@/components/ui/confetti";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, History, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LotteryBall } from "@/components/ui/lottery-ball";

export default function Dashboard() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { t, isRTL } = useLanguage();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: currentDraw } = useQuery({
    queryKey: ["/api/draws/current"],
  });

  const { data: myTickets, refetch: refetchTickets } = useQuery({
    queryKey: ["/api/tickets/my"],
    enabled: !!user,
  });

  const { data: completedDraws } = useQuery({
    queryKey: ["/api/draws/completed"],
  });

  const handleTicketPurchased = () => {
    refetchTickets();
    setShowConfetti(true);
  };

  const handleDeposit = async () => {
    try {
      const amount = prompt("Enter deposit amount (₪):");
      if (!amount || parseFloat(amount) <= 0) return;

      const response = await fetch("/api/transactions/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `₪${amount} deposited successfully!`,
        });
        // Refresh user data
        window.location.reload();
      } else {
        throw new Error("Deposit failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Deposit failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const lastDraw = completedDraws?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Number Selection */}
          <div className="lg:col-span-2">
            <NumberSelection onTicketPurchased={handleTicketPurchased} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{t("quickActions")}</h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleDeposit}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-slate-900"
                    variant="ghost"
                  >
                    <div className="flex items-center space-x-3" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                      <Plus className="text-green-500" />
                      <span className="font-medium">{t("addFunds")}</span>
                    </div>
                  </Button>
                  
                  <Button
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-slate-900"
                    variant="ghost"
                  >
                    <div className="flex items-center space-x-3" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                      <History className="text-blue-500" />
                      <span className="font-medium">{t("myHistory")}</span>
                    </div>
                  </Button>
                  
                  <Button
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-slate-900"
                    variant="ghost"
                  >
                    <div className="flex items-center space-x-3" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                      <Headphones className="text-purple-500" />
                      <span className="font-medium">{t("supportChat")}</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Referral Program */}
            <ReferralCard />

            {/* Recent Results */}
            {lastDraw && (
              <Card className="shadow-xl border-0">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">{t("lastDrawResults")}</h3>
                  <div className="text-xs text-gray-500 mb-3">
                    {t("draw")} #{lastDraw.drawNumber} - {new Date(lastDraw.drawDate).toLocaleDateString()}
                  </div>
                  
                  {/* Winning numbers */}
                  {lastDraw.winningNumbers && (
                    <div className="flex space-x-2 mb-4 justify-center" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                      {(lastDraw.winningNumbers as number[]).map((number, index) => (
                        <LotteryBall
                          key={index}
                          number={number}
                          isSelected={true}
                          size="sm"
                          disabled={true}
                          className="bg-gradient-to-r from-red-400 to-red-600 text-white"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                      <span className="text-gray-600">6 {t("matches")}:</span>
                      <span className="font-semibold text-green-600">1 {t("winner")} - ₪43,670</span>
                    </div>
                    <div className="flex justify-between" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                      <span className="text-gray-600">5 {t("matches")}:</span>
                      <span className="font-semibold text-blue-600">3 {t("winners")} - ₪8,734 {t("each")}</span>
                    </div>
                    <div className="flex justify-between" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                      <span className="text-gray-600">4 {t("matches")}:</span>
                      <span className="font-semibold text-purple-600">12 {t("winners")} - ₪1,456 {t("each")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* My Active Tickets */}
        {myTickets && myTickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                  <h2 className="text-2xl font-bold text-slate-900">{t("myActiveTickets")}</h2>
                  <div className="text-sm text-gray-500">
                    Next draw: {currentDraw ? new Date(currentDraw.drawDate).toLocaleDateString() : "TBD"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTickets.map((ticket: any, index: number) => (
                    <TicketCard key={ticket.id} ticket={ticket} index={index} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Chat Widget */}
      <ChatWidget />

      {/* Confetti Animation */}
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
}
