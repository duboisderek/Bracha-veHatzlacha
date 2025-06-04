import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Ticket, Trophy, Users, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";

export function StatsCards() {
  const { t, isRTL } = useLanguage();

  const { data: currentDraw } = useQuery({
    queryKey: ["/api/draws/current"],
  });

  const { data: userTickets } = useQuery({
    queryKey: ["/api/tickets/my"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const calculateTimeLeft = (drawDate: string) => {
    const now = new Date().getTime();
    const draw = new Date(drawDate).getTime();
    const diff = draw - now;

    if (diff <= 0) return "Draw completed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  const stats = [
    {
      title: t("nextDraw"),
      value: currentDraw ? calculateTimeLeft(currentDraw.drawDate) : "Loading...",
      subtitle: currentDraw ? new Date(currentDraw.drawDate).toLocaleDateString() : "",
      icon: Clock,
      color: "text-blue-500",
      extraInfo: currentDraw ? `${t("jackpot")}: ₪${currentDraw.jackpotAmount}` : "",
    },
    {
      title: t("myTickets"),
      value: userTickets?.length || 0,
      subtitle: t("activeForNextDraw"),
      icon: Ticket,
      color: "text-yellow-500",
      progress: Math.min((userTickets?.length || 0) / 5 * 100, 100),
    },
    {
      title: t("totalWinnings"),
      value: user ? `₪${user.totalWinnings}` : "₪0",
      subtitle: t("lifetimeEarnings"),
      icon: Trophy,
      color: "text-green-500",
      extraInfo: `+₪850 ${t("thisMonth")}`,
      trend: "up",
    },
    {
      title: t("referrals"),
      value: user?.referralCount || 0,
      subtitle: t("friendsJoined"),
      icon: Users,
      color: "text-purple-500",
      extraInfo: user ? `₪${user.referralBonus} ${t("earnedFromReferrals")}` : "",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
        >
          <Card className="shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                <h3 className="text-lg font-semibold text-slate-900">{stat.title}</h3>
                <stat.icon className={`text-xl ${stat.color}`} />
              </div>
              
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {stat.value}
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                {stat.subtitle}
              </div>
              
              {stat.progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <motion.div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                  />
                </div>
              )}
              
              {stat.extraInfo && (
                <div className={`text-sm ${stat.trend === "up" ? "text-green-600" : "text-yellow-600"} flex items-center`}>
                  {stat.trend === "up" && <TrendingUp className="w-3 h-3 mr-1" />}
                  {stat.extraInfo}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
