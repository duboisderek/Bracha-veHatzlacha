import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  TrendingUp, 
  History, 
  Award, 
  Star,
  Crown,
  Diamond,
  Medal,
  CreditCard,
  Calendar,
  Trophy,
  Users
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

// User Status Badge Component
function UserStatusBadge({ status, participationCount }: { status: string, participationCount: number }) {
  const { t } = useLanguage();
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'new':
        return {
          label: t("statusNew"),
          icon: Star,
          color: "bg-gray-100 text-gray-700",
          nextRequirement: t("silverRequirement")
        };
      case 'silver':
        return {
          label: t("statusSilver"),
          icon: Medal,
          color: "bg-gray-200 text-gray-800",
          nextRequirement: t("goldRequirement")
        };
      case 'gold':
        return {
          label: t("statusGold"),
          icon: Award,
          color: "bg-yellow-100 text-yellow-800",
          nextRequirement: t("diamondRequirement")
        };
      case 'diamond':
        return {
          label: t("statusDiamond"),
          icon: Diamond,
          color: "bg-blue-100 text-blue-800",
          nextRequirement: "VIP status achieved!"
        };
      case 'vip':
        return {
          label: t("statusVIP"),
          icon: Crown,
          color: "bg-purple-100 text-purple-800",
          nextRequirement: "Maximum status achieved!"
        };
      default:
        return {
          label: t("statusActive"),
          icon: Star,
          color: "bg-green-100 text-green-800",
          nextRequirement: t("silverRequirement")
        };
    }
  };

  const statusInfo = getStatusInfo(status);
  const Icon = statusInfo.icon;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          {t("userStatus")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <Badge className={`${statusInfo.color} text-lg px-4 py-2 flex items-center gap-2`}>
            <Icon className="w-5 h-5" />
            {statusInfo.label}
          </Badge>
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-600">
            Current Participations: <span className="font-bold text-blue-600">{participationCount}</span>
          </div>
          <div className="text-xs text-gray-500">
            {statusInfo.nextRequirement}
          </div>
        </div>

        {/* Progress Bar for Next Status */}
        {status !== 'vip' && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (participationCount % getNextThreshold(status)) / getNextThreshold(status) * 100)}%`
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getNextThreshold(status: string): number {
  switch (status) {
    case 'new': return 10;
    case 'silver': return 100;
    case 'gold': return 500;
    default: return 1000;
  }
}

// Account Balance Component
function AccountBalance() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const balance = parseFloat((user as any)?.balance || "0");

  return (
    <Card className="bg-gradient-to-br from-green-500 to-blue-600 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Wallet className="w-6 h-6" />
          {t("accountBalance")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            ₪{balance.toLocaleString()}
          </div>
          <Button 
            variant="secondary" 
            className="bg-white text-green-600 hover:bg-gray-100"
            onClick={() => {/* Navigate to top-up */}}
          >
            {t("topUp")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Top-up History Component
function TopupHistory() {
  const { t } = useLanguage();
  
  const { data: topupHistory, isLoading } = useQuery({
    queryKey: ["/api/user/topup-history"],
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-6 h-6 text-blue-500" />
          {t("topupHistory")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t("loading")}</p>
          </div>
        ) : topupHistory && (topupHistory as any).length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {(topupHistory as any).map((topup: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium">₪{parseFloat(topup.amount).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(topup.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {t("success")}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No top-up history found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Participation History Component
function ParticipationHistory() {
  const { t } = useLanguage();
  
  const { data: participationHistory, isLoading } = useQuery({
    queryKey: ["/api/user/participation-history"],
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-500" />
          {t("participationHistory")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t("loading")}</p>
          </div>
        ) : participationHistory && (participationHistory as any).length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {(participationHistory as any).map((participation: any, index: number) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">Draw #{participation.drawNumber}</div>
                  <div className="text-sm text-gray-500">
                    ₪{parseFloat(participation.amount).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">Numbers:</span>
                  <div className="flex gap-1">
                    {participation.numbers.map((num: number, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">
                    {new Date(participation.createdAt).toLocaleDateString()}
                  </span>
                  {participation.winningAmount && parseFloat(participation.winningAmount) > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Won ₪{parseFloat(participation.winningAmount).toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No participation history found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Referral Stats Component  
function ReferralStats() {
  const { t } = useLanguage();
  
  const { data: referralData } = useQuery({
    queryKey: ["/api/user/referral-stats"],
  });

  const totalReferrals = (referralData as any)?.totalReferrals || 0;
  const totalEarnings = parseFloat((referralData as any)?.totalEarnings || "0");

  return (
    <Card className="bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="w-6 h-6" />
          {t("referralProgram")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{totalReferrals}</div>
            <div className="text-sm opacity-90">Friends Referred</div>
          </div>
          <div>
            <div className="text-2xl font-bold">₪{totalEarnings.toLocaleString()}</div>
            <div className="text-sm opacity-90">Total Earned</div>
          </div>
        </div>
        
        <div className="text-center text-sm opacity-90">
          {t("referralBonus")} - {t("bonusCondition")}
        </div>
        
        <Button 
          variant="secondary" 
          className="w-full bg-white text-orange-600 hover:bg-gray-100"
          onClick={() => {/* Navigate to referral page */}}
        >
          {t("shareLink")}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PersonalArea() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Calculate user status based on participation count
  const participationCount = parseInt((user as any)?.participationCount || "0");
  const getUserStatus = (count: number) => {
    if (count >= 500) return 'diamond';
    if (count >= 100) return 'gold';
    if (count >= 10) return 'silver';
    return 'new';
  };

  const userStatus = getUserStatus(participationCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {t("personalArea")}
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back, {(user as any)?.firstName || "User"}!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <AccountBalance />
            <UserStatusBadge status={userStatus} participationCount={participationCount} />
            <ReferralStats />
          </div>

          {/* Right Columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <TopupHistory />
              <ParticipationHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}