import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Trophy, Users, TrendingUp, DollarSign, Target, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminSimple() {
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isRTL } = useLanguage();

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage Bracha veHatzlacha Platform</p>
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
                {(drawStats as any)?.totalTickets || 0}
              </div>
              <div className="text-sm text-gray-600">Current Draw</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Jackpot</h3>
                <Trophy className="text-yellow-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ₪{(drawStats as any)?.totalJackpot || (currentDraw as any)?.jackpotAmount || "0"}
              </div>
              <div className="text-sm text-gray-600">Prize Pool</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Revenue</h3>
                <DollarSign className="text-green-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ₪{Math.round(87340 * 0.5).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Platform Revenue</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Winners</h3>
                <TrendingUp className="text-purple-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {(drawStats as any)?.winners?.reduce((sum: number, w: any) => sum + w.count, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Total Winners</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Submit Results */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Submit Draw Results</h2>
              
              {currentDraw && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Draw #{(currentDraw as any).drawNumber}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Date: {new Date((currentDraw as any).drawDate).toLocaleDateString()}
                  </p>
                  <p className="text-blue-700 text-sm">
                    Jackpot: ₪{(currentDraw as any).jackpotAmount}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <Label className="text-base font-medium text-slate-900 mb-4 block">
                  Select Winning Numbers
                </Label>
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-3">
                  {Array.from({ length: 37 }, (_, i) => i + 1).map((number) => (
                    <LotteryBall
                      key={number}
                      number={number}
                      selected={winningNumbers.includes(number)}
                      onClick={() => toggleNumber(number)}
                      disabled={!winningNumbers.includes(number) && winningNumbers.length >= 6}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Selected: {winningNumbers.length}/6</p>
                <div className="flex space-x-3">
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
                {submitResultsMutation.isPending ? "Processing..." : "Submit Results"}
              </Button>

              {(currentDraw as any)?.isCompleted && (
                <p className="text-center text-green-600 font-medium mt-4">
                  Draw Completed
                </p>
              )}
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">User Management</h2>
              <UserManagementSection />
            </CardContent>
          </Card>
        </div>

        {/* System Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">System Controls</h2>
              <SystemControlsSection />
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Draw History</h2>
              <DrawHistorySection />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// User Management Component
function UserManagementSection() {
  const [newUsername, setNewUsername] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositComment, setDepositComment] = useState("");
  const [blockUserId, setBlockUserId] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (username: string) => {
      return apiRequest("POST", "/api/admin/users", {
        username,
        firstName: username,
        lastName: "User",
        email: `${username}@brachavehatzlacha.com`,
        balance: "0.00",
        language: "he",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setNewUsername("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const depositMutation = useMutation({
    mutationFn: async ({ userId, amount, comment }: { userId: string; amount: string; comment: string }) => {
      return apiRequest("POST", "/api/admin/manual-deposit", {
        userId,
        amount,
        comment,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deposit successful",
      });
      setDepositAmount("");
      setDepositComment("");
      setSelectedUserId("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("POST", `/api/admin/users/${userId}/block`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User blocked successfully",
      });
      setBlockUserId("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createUser = () => {
    if (!newUsername.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUsername.trim());
  };

  const makeDeposit = () => {
    if (!selectedUserId || !depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate({
      userId: selectedUserId,
      amount: depositAmount,
      comment: depositComment || "Manual deposit by admin",
    });
  };

  const blockUser = () => {
    if (!blockUserId) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }
    blockUserMutation.mutate(blockUserId);
  };

  return (
    <div className="space-y-6">
      {/* Create User */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-4">● Create users by entering only a username</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter username"
              className="mt-1"
            />
          </div>
          <Button
            onClick={createUser}
            disabled={createUserMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {createUserMutation.isPending ? "Creating..." : "Create User"}
          </Button>
        </div>
      </div>

      {/* Manual Deposit */}
      <div className="p-4 bg-green-50 rounded-lg">
        <h4 className="font-semibold text-green-900 mb-4">● Manually top up user accounts</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="userSelect">Select User</Label>
            <select
              id="userSelect"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select User</option>
              {(users as any)?.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} (₪{user.balance})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="amount">Amount (₪)</Label>
            <Input
              id="amount"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="100"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="comment">Comment (optional)</Label>
            <Input
              id="comment"
              value={depositComment}
              onChange={(e) => setDepositComment(e.target.value)}
              placeholder="Optional comment"
              className="mt-1"
            />
          </div>
          <Button
            onClick={makeDeposit}
            disabled={depositMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {depositMutation.isPending ? "Processing..." : "Make Deposit"}
          </Button>
        </div>
      </div>

      {/* Block User */}
      <div className="p-4 bg-red-50 rounded-lg">
        <h4 className="font-semibold text-red-900 mb-4">● Temporarily or permanently block users</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="blockUserSelect">Select User to Block</Label>
            <select
              id="blockUserSelect"
              value={blockUserId}
              onChange={(e) => setBlockUserId(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select User</option>
              {(users as any)?.filter((user: any) => !user.isBlocked).map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={blockUser}
            disabled={blockUserMutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {blockUserMutation.isPending ? "Processing..." : "Block User"}
          </Button>
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
        description: "Draw created successfully",
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
        <h4 className="font-semibold text-green-900 mb-4">Create New Draw</h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="drawDate">Draw Date & Time</Label>
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
        <h4 className="font-semibold text-purple-900 mb-2">Platform Revenue</h4>
        <div className="text-2xl font-bold text-purple-600">
          ₪{Math.round(87340 * 0.5).toLocaleString()}
        </div>
        <div className="text-sm text-purple-700">50% retention from draws</div>
      </div>
    </div>
  );
}

// Draw History Section
function DrawHistorySection() {
  const { data: draws } = useQuery({
    queryKey: ["/api/admin/draws"],
  });

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <h4 className="font-semibold text-slate-900 mb-4">● View winners of each draw and their details</h4>
      {(draws as any)?.map((draw: any) => (
        <div key={draw.id} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold">Draw #{draw.drawNumber}</h4>
              <p className="text-sm text-gray-600">
                {new Date(draw.drawDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">₪{draw.jackpotAmount}</p>
              <p className={`text-sm ${draw.isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                {draw.isCompleted ? "Completed" : "Active"}
              </p>
            </div>
          </div>
          {draw.winningNumbers && (
            <div className="flex space-x-2 mb-2">
              {(draw.winningNumbers as number[]).map((num, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold"
                >
                  {num}
                </div>
              ))}
            </div>
          )}
          {draw.isCompleted && <WinnersDisplay drawId={draw.id} />}
        </div>
      ))}
    </div>
  );
}

function WinnersDisplay({ drawId }: { drawId: number }) {
  const { data: winners } = useQuery({
    queryKey: ["/api/admin/draws", drawId, "winners"],
  });

  if (!winners || (winners as any).length === 0) {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">No winners for this draw</p>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-green-50 rounded">
      <h5 className="font-medium text-green-900 mb-2">Winners:</h5>
      <div className="space-y-1">
        {(winners as any).map((winner: any, idx: number) => (
          <div key={idx} className="text-sm">
            <span className="font-medium">{winner.user.firstName} {winner.user.lastName}</span>
            <span className="text-green-700"> - {winner.matchCount} matches</span>
            <span className="text-green-800 font-bold"> - ₪{winner.winningAmount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}