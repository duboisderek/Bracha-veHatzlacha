import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Trophy, Users, TrendingUp, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentDraw } = useQuery({
    queryKey: ["/api/draws/current"],
  });

  const { data: drawStats } = useQuery({
    queryKey: ["/api/admin/draws", currentDraw?.id, "stats"],
    enabled: !!currentDraw?.id,
  });

  const submitResultsMutation = useMutation({
    mutationFn: async (numbers: number[]) => {
      if (!currentDraw) throw new Error("No active draw");
      
      return apiRequest("POST", `/api/admin/draws/${currentDraw.id}/submit-results`, {
        winningNumbers: numbers,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Draw results submitted successfully!",
      });
      setWinningNumbers([]);
      queryClient.invalidateQueries();
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
    setWinningNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else if (prev.length < 6) {
        return [...prev, number].sort((a, b) => a - b);
      }
      return prev;
    });
  };

  const submitResults = () => {
    if (winningNumbers.length !== 6) {
      toast({
        title: "Error",
        description: "Please select exactly 6 winning numbers",
        variant: "destructive",
      });
      return;
    }

    submitResultsMutation.mutate(winningNumbers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage draws and view platform statistics</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Total Tickets</h3>
                <Users className="text-blue-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {drawStats?.totalTickets || 0}
              </div>
              <div className="text-sm text-gray-600">Current draw</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Jackpot</h3>
                <Trophy className="text-yellow-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ₪{drawStats?.totalJackpot || currentDraw?.jackpotAmount || "0"}
              </div>
              <div className="text-sm text-gray-600">Prize pool</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Revenue</h3>
                <DollarSign className="text-green-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ₪{drawStats?.totalTickets ? (drawStats.totalTickets * 100).toLocaleString() : "0"}
              </div>
              <div className="text-sm text-gray-600">Ticket sales</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Winners</h3>
                <TrendingUp className="text-purple-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {drawStats?.winners?.reduce((sum, w) => sum + w.count, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Total winners</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Results */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Submit Draw Results</h2>
              
              {currentDraw && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Draw #{currentDraw.drawNumber}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Date: {new Date(currentDraw.drawDate).toLocaleDateString()}
                  </p>
                  <p className="text-blue-700 text-sm">
                    Jackpot: ₪{currentDraw.jackpotAmount}
                  </p>
                  <p className="text-blue-700 text-sm">
                    Total Tickets: {drawStats?.totalTickets || 0}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <Label className="text-base font-medium text-slate-900 mb-4 block">
                  Select 6 Winning Numbers (1-37)
                </Label>
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-3">
                  {Array.from({ length: 37 }, (_, i) => i + 1).map((number) => (
                    <LotteryBall
                      key={number}
                      number={number}
                      isSelected={winningNumbers.includes(number)}
                      onClick={() => toggleNumber(number)}
                      disabled={!winningNumbers.includes(number) && winningNumbers.length >= 6}
                    />
                  ))}
                </div>
              </div>

              {/* Selected Numbers Display */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Winning Numbers ({winningNumbers.length}/6 selected)
                </h3>
                <div className="flex space-x-3 justify-center">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                      style={{
                        background: winningNumbers[i] 
                          ? "linear-gradient(135deg, #fbbf24, #f59e0b)" 
                          : "#e5e7eb",
                        color: winningNumbers[i] ? "#1e293b" : "#9ca3af"
                      }}
                    >
                      {winningNumbers[i] || "?"}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={submitResults}
                disabled={winningNumbers.length !== 6 || submitResultsMutation.isPending || currentDraw?.isCompleted}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-slate-900 font-bold py-4 text-lg"
              >
                {submitResultsMutation.isPending ? "Processing..." : "Submit Results"}
              </Button>

              {currentDraw?.isCompleted && (
                <p className="text-center text-green-600 font-medium mt-4">
                  This draw has already been completed.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Draw Statistics */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Draw Statistics</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">Ticket Sales</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {drawStats?.totalTickets || 0} tickets
                  </div>
                  <div className="text-sm text-gray-600">
                    Revenue: ₪{drawStats?.totalTickets ? (drawStats.totalTickets * 100).toLocaleString() : "0"}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">Prize Distribution</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>6 matches (40% du total):</span>
                      <span className="font-medium">
                        ₪{currentDraw ? (parseFloat(currentDraw.jackpotAmount) * 0.4).toLocaleString() : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>5 matches (7.5% du total):</span>
                      <span className="font-medium">
                        ₪{currentDraw ? (parseFloat(currentDraw.jackpotAmount) * 0.075).toLocaleString() : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>4 matches (2.5% du total):</span>
                      <span className="font-medium">
                        ₪{currentDraw ? (parseFloat(currentDraw.jackpotAmount) * 0.025).toLocaleString() : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2 font-bold">
                      <span>Retenu par la plateforme:</span>
                      <span className="text-green-600">
                        ₪{currentDraw ? (parseFloat(currentDraw.jackpotAmount) * 0.5).toLocaleString() : "0"} (50%)
                      </span>
                    </div>
                  </div>
                </div>

                {drawStats?.winners && drawStats.winners.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Current Winners</h3>
                    <div className="space-y-2 text-sm">
                      {drawStats.winners.map((winner) => (
                        <div key={winner.matchCount} className="flex justify-between">
                          <span>{winner.matchCount} matches:</span>
                          <span className="font-medium text-green-700">
                            {winner.count} winners - ₪{winner.totalWinnings} total
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
