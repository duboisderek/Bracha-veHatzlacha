import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Users, TrendingUp, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdminFinal() {
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositComment, setDepositComment] = useState("");
  const [blockUserId, setBlockUserId] = useState("");
  const [newDrawDate, setNewDrawDate] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: currentDraw, isLoading: drawLoading } = useQuery({
    queryKey: ["/api/draws/current"],
    retry: 3,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: 3,
  });

  const { data: draws, isLoading: drawsLoading } = useQuery({
    queryKey: ["/api/admin/draws"],
    retry: 3,
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          firstName: username,
          lastName: "User",
          email: `${username}@brachavehatzlacha.com`,
          balance: "0.00",
          language: "he",
        }),
      });
      if (!response.ok) throw new Error("Failed to create user");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User created successfully" });
      setNewUsername("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
    },
  });

  const depositMutation = useMutation({
    mutationFn: async ({ userId, amount, comment }: { userId: string; amount: string; comment: string }) => {
      const response = await fetch("/api/admin/manual-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, amount, comment }),
      });
      if (!response.ok) throw new Error("Failed to make deposit");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Deposit successful" });
      setDepositAmount("");
      setDepositComment("");
      setSelectedUserId("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to make deposit", variant: "destructive" });
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("Failed to block user");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User blocked successfully" });
      setBlockUserId("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to block user", variant: "destructive" });
    },
  });

  const createDrawMutation = useMutation({
    mutationFn: async (drawDate: string) => {
      const response = await fetch("/api/admin/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ drawDate: new Date(drawDate).toISOString() }),
      });
      if (!response.ok) throw new Error("Failed to create draw");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Draw created successfully" });
      setNewDrawDate("");
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create draw", variant: "destructive" });
    },
  });

  const submitResultsMutation = useMutation({
    mutationFn: async (numbers: number[]) => {
      if (!currentDraw) throw new Error("No active draw");
      const response = await fetch(`/api/admin/draws/${(currentDraw as any).id}/submit-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ winningNumbers: numbers }),
      });
      if (!response.ok) throw new Error("Failed to submit results");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Draw results submitted successfully!" });
      setWinningNumbers([]);
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit results", variant: "destructive" });
    },
  });

  // Event handlers
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

  const handleCreateUser = () => {
    if (!newUsername.trim()) {
      toast({ title: "Error", description: "Username is required", variant: "destructive" });
      return;
    }
    createUserMutation.mutate(newUsername.trim());
  };

  const handleMakeDeposit = () => {
    if (!selectedUserId || !depositAmount || parseFloat(depositAmount) <= 0) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    depositMutation.mutate({
      userId: selectedUserId,
      amount: depositAmount,
      comment: depositComment || "Manual deposit by admin",
    });
  };

  const handleBlockUser = () => {
    if (!blockUserId) {
      toast({ title: "Error", description: "Please select a user", variant: "destructive" });
      return;
    }
    blockUserMutation.mutate(blockUserId);
  };

  const handleCreateDraw = () => {
    if (!newDrawDate) {
      toast({ title: "Error", description: "Please select a draw date", variant: "destructive" });
      return;
    }
    createDrawMutation.mutate(newDrawDate);
  };

  const handleSubmitResults = () => {
    if (winningNumbers.length !== 6) {
      toast({ title: "Error", description: "Please select exactly 6 winning numbers", variant: "destructive" });
      return;
    }
    submitResultsMutation.mutate(winningNumbers);
  };

  if (drawLoading || usersLoading || drawsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin panel...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
                <h3 className="text-lg font-semibold text-slate-900">Total Users</h3>
                <Users className="text-blue-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {Array.isArray(users) ? users.length : 0}
              </div>
              <div className="text-sm text-gray-600">Registered Users</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Current Draw</h3>
                <Trophy className="text-yellow-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                #{currentDraw ? (currentDraw as any).drawNumber : "N/A"}
              </div>
              <div className="text-sm text-gray-600">Draw Number</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Jackpot</h3>
                <DollarSign className="text-green-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ₪{currentDraw ? (currentDraw as any).jackpotAmount : "0"}
              </div>
              <div className="text-sm text-gray-600">Current Prize</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Revenue</h3>
                <TrendingUp className="text-purple-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ₪{Math.round(87340 * 0.5).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Platform Revenue</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Submit Results Card */}
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
                  Select Winning Numbers (Choose 6)
                </Label>
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-3">
                  {Array.from({ length: 37 }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => toggleNumber(number)}
                      disabled={!winningNumbers.includes(number) && winningNumbers.length >= 6}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        winningNumbers.includes(number)
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-slate-900 scale-110 shadow-lg'
                          : !winningNumbers.includes(number) && winningNumbers.length >= 6
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-yellow-400 hover:bg-yellow-50'
                      }`}
                    >
                      {number}
                    </button>
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
                onClick={handleSubmitResults}
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

          {/* User Management Card */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">User Management</h2>
              
              {/* Create User Section */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
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
                    onClick={handleCreateUser}
                    disabled={createUserMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </div>

              {/* Manual Deposit Section */}
              <div className="mb-8 p-4 bg-green-50 rounded-lg">
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
                      {Array.isArray(users) && users.map((user: any) => (
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
                    onClick={handleMakeDeposit}
                    disabled={depositMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {depositMutation.isPending ? "Processing..." : "Make Deposit"}
                  </Button>
                </div>
              </div>

              {/* Block User Section */}
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
                      {Array.isArray(users) && users.filter((user: any) => !user.isBlocked).map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={handleBlockUser}
                    disabled={blockUserMutation.isPending}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {blockUserMutation.isPending ? "Processing..." : "Block User"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Controls */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">System Controls</h2>
              
              <div className="p-4 bg-green-50 rounded-lg mb-6">
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
                    onClick={handleCreateDraw}
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
            </CardContent>
          </Card>

          {/* Draw History */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Draw History & Winners</h2>
              <h4 className="font-semibold text-slate-900 mb-4">● View winners of each draw and their details</h4>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Array.isArray(draws) && draws.map((draw: any) => (
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
                    {draw.winningNumbers && Array.isArray(draw.winningNumbers) && (
                      <div className="flex space-x-2 mb-2">
                        {draw.winningNumbers.map((num: number, idx: number) => (
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function WinnersDisplay({ drawId }: { drawId: number }) {
  const { data: winners } = useQuery({
    queryKey: ["/api/admin/draws", drawId, "winners"],
    retry: 3,
  });

  if (!winners || !Array.isArray(winners) || winners.length === 0) {
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
        {winners.map((winner: any, idx: number) => (
          <div key={idx} className="text-sm">
            <span className="font-medium">{winner.user?.firstName} {winner.user?.lastName}</span>
            <span className="text-green-700"> - {winner.matchCount} matches</span>
            <span className="text-green-800 font-bold"> - ₪{winner.winningAmount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}