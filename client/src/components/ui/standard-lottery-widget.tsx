import { ExternalLink, Dice6 } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface StandardLotteryWidgetProps {
  className?: string;
}

export function StandardLotteryWidget({ className = "" }: StandardLotteryWidgetProps) {
  const { t } = useLanguage();

  const handleJoinStandardLottery = () => {
    // Open external lottery link
    window.open('https://www.pais.co.il/lotto', '_blank');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <Dice6 className="h-5 w-5" />
            {t("standard_lottery")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-600 dark:text-purple-300 mb-4">
            Try your luck with the official Israeli lottery! Higher prizes, more chances to win.
          </p>
          
          <Button
            onClick={handleJoinStandardLottery}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {t("join_standard_lottery")}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}