import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  balance: string;
  isBlocked: boolean;
}

interface Draw {
  id: number;
  drawNumber: number;
  drawDate: string;
  jackpotAmount: string;
  isCompleted: boolean;
  winningNumbers: number[] | null;
}

export default function AdminWorking() {
  const [users, setUsers] = useState<User[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [currentDraw, setCurrentDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositComment, setDepositComment] = useState("");
  const [blockUserId, setBlockUserId] = useState("");
  const [newDrawDate, setNewDrawDate] = useState("");
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, drawsRes, currentDrawRes] = await Promise.all([
        fetch("/api/admin/users", { credentials: "include" }),
        fetch("/api/admin/draws", { credentials: "include" }),
        fetch("/api/draws/current", { credentials: "include" })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (drawsRes.ok) setDraws(await drawsRes.json());
      if (currentDrawRes.ok) setCurrentDraw(await currentDrawRes.json());
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const createUser = async () => {
    if (!newUsername.trim()) {
      showMessage("Username is required", true);
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: newUsername,
          firstName: newUsername,
          lastName: "User",
          email: `${newUsername}@brachavehatzlacha.com`,
          balance: "0.00",
          language: "he",
        }),
      });

      if (res.ok) {
        showMessage("User created successfully");
        setNewUsername("");
        loadData();
      } else {
        showMessage("Failed to create user", true);
      }
    } catch (error) {
      showMessage("Error creating user", true);
    }
  };

  const makeDeposit = async () => {
    if (!selectedUserId || !depositAmount || parseFloat(depositAmount) <= 0) {
      showMessage("Please fill all required fields", true);
      return;
    }

    try {
      const res = await fetch("/api/admin/manual-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: selectedUserId,
          amount: depositAmount,
          comment: depositComment || "Manual deposit by admin",
        }),
      });

      if (res.ok) {
        showMessage("Deposit successful");
        setDepositAmount("");
        setDepositComment("");
        setSelectedUserId("");
        loadData();
      } else {
        showMessage("Failed to make deposit", true);
      }
    } catch (error) {
      showMessage("Error making deposit", true);
    }
  };

  const blockUser = async () => {
    if (!blockUserId) {
      showMessage("Please select a user", true);
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${blockUserId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (res.ok) {
        showMessage("User blocked successfully");
        setBlockUserId("");
        loadData();
      } else {
        showMessage("Failed to block user", true);
      }
    } catch (error) {
      showMessage("Error blocking user", true);
    }
  };

  const createDraw = async () => {
    if (!newDrawDate) {
      showMessage("Please select a draw date", true);
      return;
    }

    try {
      const res = await fetch("/api/admin/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          drawDate: new Date(newDrawDate).toISOString(),
        }),
      });

      if (res.ok) {
        showMessage("Draw created successfully");
        setNewDrawDate("");
        loadData();
      } else {
        showMessage("Failed to create draw", true);
      }
    } catch (error) {
      showMessage("Error creating draw", true);
    }
  };

  const submitResults = async () => {
    if (winningNumbers.length !== 6) {
      showMessage("Please select exactly 6 winning numbers", true);
      return;
    }

    if (!currentDraw) {
      showMessage("No active draw", true);
      return;
    }

    try {
      const res = await fetch(`/api/admin/draws/${currentDraw.id}/submit-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ winningNumbers }),
      });

      if (res.ok) {
        showMessage("Draw results submitted successfully!");
        setWinningNumbers([]);
        loadData();
      } else {
        showMessage("Failed to submit results", true);
      }
    } catch (error) {
      showMessage("Error submitting results", true);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin panel...</p>
          </div>
        </div>
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
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${message.includes("Error") || message.includes("Failed") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {message}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Total Users</h3>
            <div className="text-3xl font-bold text-blue-600">{users.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Current Draw</h3>
            <div className="text-3xl font-bold text-yellow-600">#{currentDraw?.drawNumber || "N/A"}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Jackpot</h3>
            <div className="text-3xl font-bold text-green-600">₪{currentDraw?.jackpotAmount || "0"}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Platform Revenue</h3>
            <div className="text-3xl font-bold text-purple-600">₪{Math.round(87340 * 0.5).toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Submit Results */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Submit Draw Results</h2>
            
            {currentDraw && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Draw #{currentDraw.drawNumber}</h3>
                <p className="text-blue-700 text-sm">Date: {new Date(currentDraw.drawDate).toLocaleDateString()}</p>
                <p className="text-blue-700 text-sm">Jackpot: ₪{currentDraw.jackpotAmount}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-base font-medium text-slate-900 mb-4">
                Select Winning Numbers (Choose 6)
              </label>
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

            <button
              onClick={submitResults}
              disabled={winningNumbers.length !== 6 || currentDraw?.isCompleted}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-slate-900 font-bold py-4 text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Results
            </button>

            {currentDraw?.isCompleted && (
              <p className="text-center text-green-600 font-medium mt-4">Draw Completed</p>
            )}
          </div>

          {/* User Management */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">User Management</h2>
            
            {/* Create User */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-4">● Create users by entering only a username</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={createUser}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Create User
                </button>
              </div>
            </div>

            {/* Manual Deposit */}
            <div className="mb-8 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-4">● Manually top up user accounts</h4>
              <div className="space-y-3">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} (₪{user.balance})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount (₪)"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={depositComment}
                  onChange={(e) => setDepositComment(e.target.value)}
                  placeholder="Comment (optional)"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={makeDeposit}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Make Deposit
                </button>
              </div>
            </div>

            {/* Block User */}
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-4">● Temporarily or permanently block users</h4>
              <div className="space-y-3">
                <select
                  value={blockUserId}
                  onChange={(e) => setBlockUserId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select User to Block</option>
                  {users.filter(user => !user.isBlocked).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={blockUser}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Block User
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Controls */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">System Controls</h2>
            
            <div className="p-4 bg-green-50 rounded-lg mb-6">
              <h4 className="font-semibold text-green-900 mb-4">Create New Draw</h4>
              <div className="space-y-4">
                <input
                  type="datetime-local"
                  value={newDrawDate}
                  onChange={(e) => setNewDrawDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={createDraw}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Create Draw
                </button>
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

          {/* Draw History */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Draw History & Winners</h2>
            <h4 className="font-semibold text-slate-900 mb-4">● View winners of each draw and their details</h4>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {draws.map((draw) => (
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
                  {draw.winningNumbers && draw.winningNumbers.length > 0 && (
                    <div className="flex space-x-2 mb-2">
                      {draw.winningNumbers.map((num, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}