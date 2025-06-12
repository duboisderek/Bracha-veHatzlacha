import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Trophy, Settings, AlertCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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

export default function AdminCleanMultilingual() {
  const { t, language, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [currentDraw, setCurrentDraw] = useState<Draw | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load users
      const usersRes = await fetch("/api/admin/users", { credentials: "include" });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Load draws
      const drawsRes = await fetch("/api/draws", { credentials: "include" });
      if (drawsRes.ok) {
        const drawsData = await drawsRes.json();
        setDraws(drawsData);
      }

      // Load current draw
      const currentDrawRes = await fetch("/api/draws/current", { credentials: "include" });
      if (currentDrawRes.ok) {
        const drawData = await currentDrawRes.json();
        setCurrentDraw(drawData);
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage(t("errorLoading"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createUser = async () => {
    if (!newUsername.trim()) return;
    
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: newUsername,
          firstName: newUsername,
          lastName: "User",
          email: `${newUsername}@example.com`,
          balance: "1000.00",
          language: language
        }),
      });

      if (res.ok) {
        showMessage(t("userCreated"));
        setNewUsername("");
        loadData();
      } else {
        showMessage(t("errorCreating"));
      }
    } catch (error) {
      showMessage(t("connectionError"));
    }
  };

  const processDeposit = async () => {
    if (!selectedUserId || !depositAmount) return;
    
    try {
      const res = await fetch("/api/admin/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: selectedUserId,
          amount: depositAmount,
          comment: "Admin manual deposit"
        }),
      });

      if (res.ok) {
        showMessage(t("depositSuccess"));
        setDepositAmount("");
        setSelectedUserId("");
        loadData();
      } else {
        showMessage(t("errorDeposit"));
      }
    } catch (error) {
      showMessage(t("connectionError"));
    }
  };

  const toggleUserBlock = async (userId: string, shouldBlock: boolean) => {
    try {
      const res = await fetch("/api/admin/block-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, block: shouldBlock }),
      });

      if (res.ok) {
        showMessage(shouldBlock ? t("userBlocked") : t("userUnblocked"));
        loadData();
      } else {
        showMessage(t("errorBlocking"));
      }
    } catch (error) {
      showMessage(t("connectionError"));
    }
  };

  const generateWinningNumbers = () => {
    const numbers = new Set<number>();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 37) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  };

  const runDraw = async () => {
    if (!currentDraw) return;
    
    try {
      const winningNumbers = generateWinningNumbers();
      
      const res = await fetch("/api/admin/run-draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          drawId: currentDraw.id,
          winningNumbers
        }),
      });

      if (res.ok) {
        showMessage(t("drawCompleted"));
        loadData();
      } else {
        showMessage(t("errorDraw"));
      }
    } catch (error) {
      showMessage(t("connectionError"));
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 p-6 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("adminPanel")}</h1>
        <p className="text-gray-600">{t("platformManagement")}</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes("Error") || message.includes("שגיאה") 
            ? "bg-red-50 text-red-700 border border-red-200" 
            : "bg-green-50 text-green-700 border border-green-200"
        }`}>
          <div className="flex items-center">
            {message.includes("Error") || message.includes("שגיאה") ? (
              <AlertCircle className="w-5 h-5 mr-2" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            {message}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalUsers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("currentJackpot")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₪{currentDraw ? parseFloat(currentDraw.jackpotAmount).toLocaleString() : "0"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalDraws")}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draws.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {t("userManagement")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Create User */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">{t("createUser")}</h4>
              <div className="flex gap-2">
                <Input
                  placeholder={t("username")}
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={createUser} className="bg-blue-600 hover:bg-blue-700">
                  {t("createUserButton")}
                </Button>
              </div>
            </div>

            {/* Manual Deposit */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-3">{t("manualDeposit")}</h4>
              <div className="space-y-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">{t("selectUser")}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} (₪{parseFloat(user.balance).toLocaleString()})
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t("amount")}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={processDeposit} className="bg-green-600 hover:bg-green-700">
                    {t("deposit")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              {t("systemControls")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Draw */}
            {currentDraw && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-3">
                  {t("currentDraw")} #{currentDraw.drawNumber}
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">{t("drawDate")}:</span>{" "}
                    {new Date(currentDraw.drawDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">{t("jackpotAmount")}:</span>{" "}
                    ₪{parseFloat(currentDraw.jackpotAmount).toLocaleString()}
                  </p>
                </div>
                {!currentDraw.isCompleted && (
                  <Button 
                    onClick={runDraw}
                    className="mt-3 bg-purple-600 hover:bg-purple-700 w-full"
                  >
                    {t("runDraw")}
                  </Button>
                )}
                {currentDraw.isCompleted && (
                  <div className="mt-3 p-2 bg-green-100 text-green-800 rounded text-center">
                    {t("drawCompleted")}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t("usersList")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className={`text-${isRTL ? 'right' : 'left'} py-2`}>{t("name")}</th>
                  <th className={`text-${isRTL ? 'right' : 'left'} py-2`}>{t("email")}</th>
                  <th className={`text-${isRTL ? 'right' : 'left'} py-2`}>{t("balance")}</th>
                  <th className={`text-${isRTL ? 'right' : 'left'} py-2`}>{t("status")}</th>
                  <th className={`text-${isRTL ? 'right' : 'left'} py-2`}>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-2">{user.firstName} {user.lastName}</td>
                    <td className="py-2">{user.email}</td>
                    <td className="py-2">₪{parseFloat(user.balance).toLocaleString()}</td>
                    <td className="py-2">
                      <Badge variant={user.isBlocked ? "destructive" : "default"}>
                        {user.isBlocked ? t("blocked") : t("active")}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserBlock(user.id, !user.isBlocked)}
                      >
                        {user.isBlocked ? t("unblock") : t("block")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}