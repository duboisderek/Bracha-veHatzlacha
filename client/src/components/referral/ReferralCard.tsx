import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check, QrCode } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { QRCodeGenerator } from "@/components/ui/qr-code-generator";

export function ReferralCard() {
  const [copied, setCopied] = useState(false);
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();

  const referralLink = user ? `${window.location.origin}/ref/${user.referralCode}` : "";

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const referralProgress = Math.min((user?.referralCount || 0) / 5, 1);

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
          <Gift className="text-yellow-600 text-xl" />
          <h3 className="text-lg font-semibold text-slate-900">{t("referFriends")}</h3>
        </div>
        
        <p className="text-sm text-gray-700 mb-4">{t("referralDescription")}</p>
        
        {/* QR Code */}
        <div className="bg-white rounded-lg p-4 mb-4 flex justify-center">
          <QRCodeGenerator 
            value={referralLink}
            size={120}
          />
        </div>
        
        {/* Referral Link */}
        <div className="bg-white rounded-lg p-3 border-2 border-dashed border-yellow-300 mb-4">
          <div className="flex items-center justify-between">
            <code className="text-xs text-gray-600 flex-1 truncate">
              {referralLink}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyReferralLink}
              className="ml-2 text-yellow-600 hover:text-yellow-700 p-1"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Progress to Bonus */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">{t("progressToBonus")}</div>
          <div className="flex items-center justify-center space-x-1 mb-2">
            {Array.from({ length: 5 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  i < (user?.referralCount || 0)
                    ? "bg-yellow-500"
                    : "bg-gray-300"
                }`}
              >
                {i < (user?.referralCount || 0) && (
                  <Check className="text-white text-xs" />
                )}
              </motion.div>
            ))}
          </div>
          <div className="text-xs text-gray-600">
            {user?.referralCount || 0}/5 {t("referralsCount")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
