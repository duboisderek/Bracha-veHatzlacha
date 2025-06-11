import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function AdminSimplified() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentDraw, setCurrentDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, currentDrawRes] = await Promise.all([
        fetch("/api/admin/users", { credentials: "include" }),
        fetch("/api/draws/current", { credentials: "include" })
      ]);

      if (usersRes.ok) {
        const userData = await usersRes.json();
        setUsers(userData);
      }
      
      if (currentDrawRes.ok) {
        const drawData = await currentDrawRes.json();
        setCurrentDraw(drawData);
      }
    } catch (error) {
      console.error("Erreur de chargement:", error);
      setMessage("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const createUser = async () => {
    if (!newUsername.trim()) {
      showMessage("Le nom d'utilisateur est requis");
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
        showMessage("Utilisateur créé avec succès");
        setNewUsername("");
        loadData();
      } else {
        showMessage("Erreur lors de la création");
      }
    } catch (error) {
      showMessage("Erreur de connexion");
    }
  };

  const makeDeposit = async () => {
    if (!selectedUserId || !depositAmount || parseFloat(depositAmount) <= 0) {
      showMessage("Veuillez remplir tous les champs");
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
          comment: "Dépôt manuel par admin",
        }),
      });

      if (res.ok) {
        showMessage("Dépôt effectué avec succès");
        setDepositAmount("");
        setSelectedUserId("");
        loadData();
      } else {
        showMessage("Erreur lors du dépôt");
      }
    } catch (error) {
      showMessage("Erreur de connexion");
    }
  };

  const submitResults = async () => {
    if (winningNumbers.length !== 6) {
      showMessage("Veuillez sélectionner exactement 6 numéros");
      return;
    }

    if (!currentDraw) {
      showMessage("Aucun tirage actif");
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
        showMessage("Résultats soumis avec succès!");
        setWinningNumbers([]);
        loadData();
      } else {
        showMessage("Erreur lors de la soumission");
      }
    } catch (error) {
      showMessage("Erreur de connexion");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du panneau admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panneau d'Administration</h1>
          <p className="text-gray-600">Gestion de la plateforme Bracha veHatzlacha</p>
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.includes("Erreur") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tirage Actuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">#{currentDraw?.drawNumber || "N/A"}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Jackpot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₪{currentDraw?.jackpotAmount || "0"}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenus Plateforme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">₪43,670</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Soumission des résultats */}
          <Card>
            <CardHeader>
              <CardTitle>Soumettre les Résultats du Tirage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentDraw && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Tirage #{currentDraw.drawNumber}</h3>
                  <p className="text-blue-700 text-sm">Date: {new Date(currentDraw.drawDate).toLocaleDateString()}</p>
                  <p className="text-blue-700 text-sm">Jackpot: ₪{currentDraw.jackpotAmount}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-3">
                  Sélectionner les Numéros Gagnants (Choisir 6)
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 37 }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => toggleNumber(number)}
                      disabled={!winningNumbers.includes(number) && winningNumbers.length >= 6}
                      className={`w-10 h-10 rounded-full text-sm font-bold ${
                        winningNumbers.includes(number)
                          ? 'bg-yellow-400 text-black'
                          : !winningNumbers.includes(number) && winningNumbers.length >= 6
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-2 border-gray-300 hover:border-yellow-400'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">Sélectionnés: {winningNumbers.length}/6</p>
                <div className="flex space-x-2">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                        winningNumbers[i] 
                          ? 'bg-yellow-400 text-black' 
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {winningNumbers[i] || "?"}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={submitResults}
                disabled={winningNumbers.length !== 6 || currentDraw?.isCompleted}
                className="w-full"
              >
                Soumettre les Résultats
              </Button>
            </CardContent>
          </Card>

          {/* Gestion des utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Créer un utilisateur */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Créer un Utilisateur</h4>
                <div className="space-y-3">
                  <Input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Nom d'utilisateur"
                  />
                  <Button onClick={createUser} className="w-full">
                    Créer l'Utilisateur
                  </Button>
                </div>
              </div>

              {/* Dépôt manuel */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">Dépôt Manuel</h4>
                <div className="space-y-3">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} (₪{user.balance})
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Montant (₪)"
                  />
                  <Button onClick={makeDeposit} className="w-full">
                    Effectuer le Dépôt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Nom</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Solde</th>
                    <th className="text-left p-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-2">{user.firstName} {user.lastName}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">₪{user.balance}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isBlocked ? 'Bloqué' : 'Actif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}