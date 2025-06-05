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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('adminDashboard')}</h1>
          <p className="text-gray-600">{t('managePlatform')}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{t('totalTickets')}</h3>
                <Users className="text-blue-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {(drawStats as any)?.totalTickets || 0}
              </div>
              <div className="text-sm text-gray-600">{t('currentDraw')}</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{t('jackpot')}</h3>
                <Trophy className="text-yellow-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ₪{(drawStats as any)?.totalJackpot || (currentDraw as any)?.jackpotAmount || "0"}
              </div>
              <div className="text-sm text-gray-600">{t('prizePool')}</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{t('revenue')}</h3>
                <DollarSign className="text-green-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ₪{(drawStats as any)?.totalTickets ? ((drawStats as any).totalTickets * 100).toLocaleString() : "0"}
              </div>
              <div className="text-sm text-gray-600">{t('ticketSales')}</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{t('winners')}</h3>
                <TrendingUp className="text-purple-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {(drawStats as any)?.winners?.reduce((sum: number, w: any) => sum + w.count, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">{t('totalWinners')}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Results */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('submitDrawResults')}</h2>
              
              {currentDraw && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Draw #{(currentDraw as any).drawNumber}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {t('date')}: {new Date((currentDraw as any).drawDate).toLocaleDateString()}
                  </p>
                  <p className="text-blue-700 text-sm">
                    {t('jackpot')}: ₪{(currentDraw as any).jackpotAmount}
                  </p>
                  <p className="text-blue-700 text-sm">
                    {t('totalTickets')}: {(drawStats as any)?.totalTickets || 0}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <Label className="text-base font-medium text-slate-900 mb-4 block">
                  {t('selectWinningNumbers')}
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
                  {t('winningNumbers')} ({winningNumbers.length}/6 {t('selected')})
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
                disabled={winningNumbers.length !== 6 || submitResultsMutation.isPending || (currentDraw as any)?.isCompleted}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-slate-900 font-bold py-4 text-lg"
              >
                {submitResultsMutation.isPending ? t('processing') : t('submitResults')}
              </Button>

              {(currentDraw as any)?.isCompleted && (
                <p className="text-center text-green-600 font-medium mt-4">
                  {t('drawCompleted')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Draw Statistics */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('drawStatistics')}</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">{t('ticketSales')}</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {(drawStats as any)?.totalTickets || 0} {t('ticketsText')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('revenue')}: ₪{(drawStats as any)?.totalTickets ? ((drawStats as any).totalTickets * 100).toLocaleString() : "0"}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">{t('prizeDistribution')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>6 {t('matches')} (40% du total):</span>
                      <span className="font-medium">
                        ₪{currentDraw ? (parseFloat((currentDraw as any).jackpotAmount) * 0.4).toLocaleString() : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>5 {t('matches')} (7.5% du total):</span>
                      <span className="font-medium">
                        ₪{currentDraw ? (parseFloat((currentDraw as any).jackpotAmount) * 0.075).toLocaleString() : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>4 {t('matches')} (2.5% du total):</span>
                      <span className="font-medium">
                        ₪{currentDraw ? (parseFloat((currentDraw as any).jackpotAmount) * 0.025).toLocaleString() : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2 font-bold">
                      <span>{t('platformRetention')}:</span>
                      <span className="text-green-600">
                        ₪{currentDraw ? (parseFloat((currentDraw as any).jackpotAmount) * 0.5).toLocaleString() : "0"} (50%)
                      </span>
                    </div>
                  </div>
                </div>

                {(drawStats as any)?.winners && (drawStats as any).winners.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Current {t('winners')}</h3>
                    <div className="space-y-2 text-sm">
                      {(drawStats as any).winners.map((winner: any) => (
                        <div key={winner.matchCount} className="flex justify-between">
                          <span>{winner.matchCount} {t('matches')}:</span>
                          <span className="font-medium text-green-700">
                            {winner.count} {t('winners')} - ₪{winner.totalWinnings} total
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
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('userManagement')}</h2>
              <UserManagementSection />
            </CardContent>
          </Card>

          {/* System Controls */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('systemControls')}</h2>
              <SystemControlsSection />
            </CardContent>
          </Card>
        </div>

        {/* Draw History */}
        <Card className="shadow-xl border-0 mt-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('drawHistory')}</h2>
            <DrawHistorySection />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// User Management Component
function UserManagementSection() {
  const { t } = useLanguage();
  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">{t('totalUsers')}</h3>
        <div className="text-2xl font-bold text-blue-600">
          {(users as any)?.length || 0}
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        <div className="space-y-2">
          {(users as any)?.slice(0, 10).map((user: any) => (
            <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium">{user.firstName} {user.lastName}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">₪{user.balance}</div>
                <div className="text-sm text-gray-600">
                  {user.isAdmin ? t('admin') : t('user')}
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
  const { t } = useLanguage();

  const createDrawMutation = useMutation({
    mutationFn: async (drawDate: string) => {
      return apiRequest("POST", "/api/admin/draws", {
        drawDate: new Date(drawDate).toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: t('drawCreatedSuccessfully'),
      });
      setNewDrawDate("");
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createDraw = () => {
    if (!newDrawDate) {
      toast({
        title: t('error'),
        description: t('selectDrawDate'),
        variant: "destructive",
      });
      return;
    }
    createDrawMutation.mutate(newDrawDate);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-4">{t('createNewDraw')}</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="drawDate">{t('drawDate')}</Label>
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
            {createDrawMutation.isPending ? t('creating') : t('createDraw')}
          </Button>
        </div>
      </div>

      <div className="p-4 bg-purple-50 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-2">{t('platformRevenue')}</h3>
        <div className="text-2xl font-bold text-purple-600">
          ₪{Math.round(87340 * 0.5).toLocaleString()}
        </div>
        <div className="text-sm text-purple-700">{t('retentionFromDraw')}</div>
      </div>

      <ManualDepositSection />
    </div>
  );
}

// Manual Deposit Component
function ManualDepositSection() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const depositMutation = useMutation({
    mutationFn: async (data: { userId: string; amount: string; comment: string }) => {
      return apiRequest("POST", "/api/admin/manual-deposit", data);
    },
    onSuccess: (response) => {
      toast({
        title: t('success'),
        description: response.message || t('depositSuccessful'),
      });
      setSelectedUserId("");
      setAmount("");
      setComment("");
      setSearchTerm("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredUsers = (users as any)?.filter((user: any) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedUser = (users as any)?.find((user: any) => user.id === selectedUserId);

  const handleDeposit = () => {
    if (!selectedUserId) {
      toast({
        title: t('error'),
        description: t('selectUser'),
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: t('error'),
        description: t('invalidAmount'),
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      userId: selectedUserId,
      amount: amount,
      comment: comment,
    });
  };

  return (
    <div className="p-4 bg-orange-50 rounded-lg">
      <h3 className="font-semibold text-orange-900 mb-4">{t('manualDeposit')}</h3>
      <div className="space-y-4">
        {/* User Selection */}
        <div>
          <Label htmlFor="userSearch">{t('selectUser')}</Label>
          <div className="relative mt-1">
            <Input
              id="userSearch"
              placeholder={t('searchUserByEmail')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            {searchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.slice(0, 10).map((user: any) => (
                    <button
                      key={user.id}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setSearchTerm(`${user.firstName} ${user.lastName} (${user.email})`);
                      }}
                    >
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">Balance: ₪{user.balance}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">{t('userNotFound')}</div>
                )}
              </div>
            )}
          </div>
          {selectedUser && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
              <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
              <br />
              {selectedUser.email} | Current Balance: ₪{selectedUser.balance}
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <Label htmlFor="depositAmount">{t('depositAmount')}</Label>
          <Input
            id="depositAmount"
            type="number"
            placeholder={t('enterAmount')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1"
            min="1"
            step="0.01"
          />
        </div>

        {/* Comment */}
        <div>
          <Label htmlFor="depositComment">{t('comment')}</Label>
          <Input
            id="depositComment"
            placeholder={t('enterComment')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button
          onClick={handleDeposit}
          disabled={depositMutation.isPending}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {depositMutation.isPending ? t('depositing') : t('deposit')}
        </Button>
      </div>
    </div>
  );
}

// Draw History Component
function DrawHistorySection() {
  const { t } = useLanguage();
  const { data: completedDraws } = useQuery({
    queryKey: ["/api/draws/completed"],
  });

  return (
    <div className="space-y-4">
      {(completedDraws as any)?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">{t('drawNumber')}</th>
                <th className="text-left p-2">{t('date')}</th>
                <th className="text-left p-2">{t('yourWinningNumbers')}</th>
                <th className="text-left p-2">{t('jackpot')}</th>
                <th className="text-left p-2">{t('winners')}</th>
              </tr>
            </thead>
            <tbody>
              {(completedDraws as any).slice(0, 5).map((draw: any) => (
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
                    <WinnersDisplay drawId={draw.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          {t('noCompletedDraws')}
        </div>
      )}
    </div>
  );
}

// Winners Display Component
function WinnersDisplay({ drawId }: { drawId: number }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const { data: winners, isLoading } = useQuery({
    queryKey: ["/api/admin/draws", drawId, "winners"],
    queryFn: () => apiRequest("GET", `/api/admin/draws/${drawId}/winners`),
    enabled: isOpen,
  });

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Target className="w-4 h-4" />
        View Winners
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Draw Winners - #{drawId}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : winners && (winners as any).length > 0 ? (
              <div className="space-y-4">
                {(winners as any).map((winner: any, index: number) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {winner.user.firstName} {winner.user.lastName}
                        </h4>
                        <p className="text-gray-600 text-sm">{winner.user.email}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ₪{parseFloat(winner.winningAmount).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {winner.matchCount} matches
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-medium text-gray-700">Ticket Numbers:</span>
                      <div className="flex gap-1">
                        {winner.numbers.map((num: number, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white text-xs font-bold rounded-full"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No Winners Found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
