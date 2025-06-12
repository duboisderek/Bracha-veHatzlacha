import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function QuickContactWidget() {
  const { t, isRTL } = useLanguage();

  const contactOptions = [
    {
      type: "whatsapp",
      icon: Phone,
      label: t("whatsappContact"),
      color: "bg-green-500 hover:bg-green-600",
      url: "https://wa.me/972123456789"
    },
    {
      type: "telegram",
      icon: MessageCircle,
      label: t("telegramContact"),
      color: "bg-blue-500 hover:bg-blue-600",
      url: "https://t.me/brachavehatzlacha"
    },
    {
      type: "chat",
      icon: MessageCircle,
      label: t("liveChatContact"),
      color: "bg-purple-500 hover:bg-purple-600",
      url: "/chat"
    }
  ];

  const handleContactClick = (url: string) => {
    if (url.startsWith("http")) {
      window.open(url, "_blank");
    } else {
      window.location.href = url;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Card className="shadow-lg border-2 border-gradient-to-r from-yellow-400 to-orange-500">
        <CardContent className="p-3">
          <div className="text-center mb-2">
            <h3 className="text-sm font-semibold text-gray-800">
              {t("quickContactWidget")}
            </h3>
          </div>
          <div className="flex flex-col space-y-2">
            {contactOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => handleContactClick(option.url)}
                    className={`w-full text-white ${option.color} transition-all duration-200 hover:scale-105`}
                    size="sm"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}