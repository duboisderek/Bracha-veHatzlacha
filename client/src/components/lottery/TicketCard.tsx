import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { useLanguage } from "@/contexts/LanguageContext";

interface Ticket {
  id: string;
  numbers: number[];
  cost: string;
  createdAt: string;
  matchCount?: number;
  winningAmount?: string;
}

interface TicketCardProps {
  ticket: Ticket;
  index: number;
}

export function TicketCard({ ticket, index }: TicketCardProps) {
  const { t, isRTL } = useLanguage();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
            <div className="text-sm font-medium text-gray-600">
              {t("ticket")} #{index + 1}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(ticket.createdAt)}
            </div>
          </div>
          
          <div className="flex space-x-2 mb-4 justify-center" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
            {ticket.numbers.map((number, numIndex) => (
              <LotteryBall
                key={numIndex}
                number={number}
                isSelected={true}
                size="sm"
                disabled={true}
              />
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {t("cost")}: ₪{ticket.cost}
            </span>
            <Badge 
              variant="secondary" 
              className="bg-blue-100 text-blue-800"
            >
              {t("active")}
            </Badge>
          </div>
          
          {ticket.matchCount !== undefined && ticket.matchCount > 0 && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-800">
                {ticket.matchCount} {t("matches")}
              </div>
              {ticket.winningAmount && parseFloat(ticket.winningAmount) > 0 && (
                <div className="text-lg font-bold text-green-600">
                  +₪{ticket.winningAmount}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
