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
import { useLanguage } from "@/contexts/LanguageContext";

export default function Admin() {
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, isRTL } = useLanguage();

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

        {/* Additional Admin Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* User Management */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">User Management</h2>
              <UserManagementSection />
            </CardContent>
          </Card>

          {/* System Controls */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">System Controls</h2>
              <SystemControlsSection />
            </CardContent>
          </Card>
        </div>

        {/* Draw History */}
        <Card className="shadow-xl border-0 mt-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Draw History</h2>
            <DrawHistorySection />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// User Management Component
function UserManagementSection() {
  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Total Users</h3>
        <div className="text-2xl font-bold text-blue-600">
          {users?.length || 0}
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        <div className="space-y-2">
          {users?.slice(0, 10).map((user: any) => (
            <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium">{user.firstName} {user.lastName}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">₪{user.balance}</div>
                <div className="text-sm text-gray-600">
                  {user.isAdmin ? "Admin" : "User"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// System Controls Component
function SystemControlsSection() {
  const [newDrawDate, setNewDrawDate] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createDrawMutation = useMutation({
    mutationFn: async (drawDate: string) => {
      return apiRequest("POST", "/api/admin/draws", {
        drawDate: new Date(drawDate).toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New draw created successfully!",
      });
      setNewDrawDate("");
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

  const createDraw = () => {
    if (!newDrawDate) {
      toast({
        title: "Error",
        description: "Please select a draw date",
        variant: "destructive",
      });
      return;
    }
    createDrawMutation.mutate(newDrawDate);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-4">Create New Draw</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="drawDate">Draw Date</Label>
            <Input
              id="drawDate"
              type="datetime-local"
              value={newDrawDate}
              onChange={(e) => setNewDrawDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            onClick={createDraw}
            disabled={createDrawMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {createDrawMutation.isPending ? "Creating..." : "Create Draw"}
          </Button>
        </div>
      </div>

      <div className="p-4 bg-purple-50 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-2">Platform Revenue</h3>
        <div className="text-2xl font-bold text-purple-600">
          ₪{Math.round(87340 * 0.5).toLocaleString()}
        </div>
        <div className="text-sm text-purple-700">50% retention from current draw</div>
      </div>
    </div>
  );
}

// Draw History Component
function DrawHistorySection() {
  const { data: completedDraws } = useQuery({
    queryKey: ["/api/draws/completed"],
  });

  return (
    <div className="space-y-4">
      {completedDraws?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Draw #</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Winning Numbers</th>
                <th className="text-left p-2">Jackpot</th>
                <th className="text-left p-2">Winners</th>
              </tr>
            </thead>
            <tbody>
              {completedDraws.slice(0, 5).map((draw: any) => (
                <tr key={draw.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">#{draw.drawNumber}</td>
                  <td className="p-2">{new Date(draw.drawDate).toLocaleDateString()}</td>
                  <td className="p-2">
                    <div className="flex space-x-1">
                      {draw.winningNumbers?.map((num: number, idx: number) => (
                        <span key={idx} className="inline-flex items-center justify-center w-6 h-6 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                          {num}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-2 font-medium">₪{parseFloat(draw.jackpotAmount).toLocaleString()}</td>
                  <td className="p-2">
                    <span className="text-green-600 font-medium">
                      {/* Winners count would be fetched from stats */}
                      TBD
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No completed draws yet
        </div>
      )}
    </div>
  );
}
