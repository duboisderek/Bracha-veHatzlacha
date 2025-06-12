import { useState, useEffect } from "react";

export default function AdminFunctional() {
  const [users, setUsers] = useState([]);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [winningNumbers, setWinningNumbers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const usersRes = await fetch("/api/admin/users", { credentials: "include" });
      const currentDrawRes = await fetch("/api/draws/current", { credentials: "include" });

      if (usersRes.ok) {
        const userData = await usersRes.json();
        setUsers(userData);
      }
      
      if (currentDrawRes.ok) {
        const drawData = await currentDrawRes.json();
        setCurrentDraw(drawData);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Loading error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg) => {
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
        showMessage("User created successfully");
        setNewUsername("");
        loadData();
      } else {
        showMessage("Error creating user");
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

  const toggleNumber = (number) => {
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
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "80px", 
            height: "80px", 
            border: "4px solid #e5e7eb", 
            borderTop: "4px solid #3b82f6", 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }}></div>
          <p style={{ color: "#6b7280" }}>Chargement du panneau admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "16px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
            Panneau d'Administration
          </h1>
          <p style={{ color: "#6b7280" }}>Gestion de la plateforme Bracha veHatzlacha</p>
          {message && (
            <div style={{
              marginTop: "16px",
              padding: "16px",
              borderRadius: "8px",
              backgroundColor: message.includes("Erreur") ? "#fef2f2" : "#f0fdf4",
              color: message.includes("Erreur") ? "#dc2626" : "#16a34a"
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "#6b7280", marginBottom: "8px" }}>
              Total Utilisateurs
            </h3>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#3b82f6" }}>
              {users.length}
            </div>
          </div>
          
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "#6b7280", marginBottom: "8px" }}>
              Tirage Actuel
            </h3>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#eab308" }}>
              #{currentDraw?.drawNumber || "N/A"}
            </div>
          </div>
          
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "#6b7280", marginBottom: "8px" }}>
              Jackpot
            </h3>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#16a34a" }}>
              ₪{currentDraw?.jackpotAmount || "0"}
            </div>
          </div>
          
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "#6b7280", marginBottom: "8px" }}>
              Revenus Plateforme
            </h3>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#a855f7" }}>
              ₪43,670
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "32px", marginBottom: "32px" }}>
          
          {/* Submit Results Card */}
          <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1f2937", marginBottom: "24px" }}>
              Soumettre les Résultats du Tirage
            </h2>
            
            {currentDraw && (
              <div style={{ padding: "16px", backgroundColor: "#dbeafe", borderRadius: "8px", marginBottom: "24px" }}>
                <h3 style={{ fontWeight: "600", color: "#1e40af", marginBottom: "8px" }}>
                  Tirage #{currentDraw.drawNumber}
                </h3>
                <p style={{ color: "#1e40af", fontSize: "0.875rem" }}>
                  Date: {new Date(currentDraw.drawDate).toLocaleDateString()}
                </p>
                <p style={{ color: "#1e40af", fontSize: "0.875rem" }}>
                  Jackpot: ₪{currentDraw.jackpotAmount}
                </p>
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#1f2937", marginBottom: "12px" }}>
                Sélectionner les Numéros Gagnants (Choisir 6)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", marginBottom: "16px" }}>
                {Array.from({ length: 37 }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => toggleNumber(number)}
                    disabled={!winningNumbers.includes(number) && winningNumbers.length >= 6}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                      border: "2px solid",
                      cursor: "pointer",
                      backgroundColor: winningNumbers.includes(number) ? "#fbbf24" : "white",
                      borderColor: winningNumbers.includes(number) ? "#fbbf24" : "#d1d5db",
                      color: winningNumbers.includes(number) ? "#000" : "#374151",
                      opacity: (!winningNumbers.includes(number) && winningNumbers.length >= 6) ? 0.5 : 1
                    }}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "12px" }}>
                Sélectionnés: {winningNumbers.length}/6
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      backgroundColor: winningNumbers[i] ? "#fbbf24" : "#e5e7eb",
                      color: winningNumbers[i] ? "#000" : "#9ca3af"
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
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#3b82f6",
                color: "white",
                fontWeight: "bold",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                opacity: (winningNumbers.length !== 6 || currentDraw?.isCompleted) ? 0.5 : 1
              }}
            >
              Soumettre les Résultats
            </button>
          </div>

          {/* User Management Card */}
          <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1f2937", marginBottom: "24px" }}>
              Gestion des Utilisateurs
            </h2>
            
            {/* Create User */}
            <div style={{ padding: "16px", backgroundColor: "#dbeafe", borderRadius: "8px", marginBottom: "24px" }}>
              <h4 style={{ fontWeight: "600", color: "#1e40af", marginBottom: "12px" }}>
                Créer un Utilisateur
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Nom d'utilisateur"
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem"
                  }}
                />
                <button
                  onClick={createUser}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Créer l'Utilisateur
                </button>
              </div>
            </div>

            {/* Manual Deposit */}
            <div style={{ padding: "16px", backgroundColor: "#dcfce7", borderRadius: "8px" }}>
              <h4 style={{ fontWeight: "600", color: "#166534", marginBottom: "12px" }}>
                Dépôt Manuel
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem"
                  }}
                >
                  <option value="">Sélectionner un utilisateur</option>
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
                  placeholder="Montant (₪)"
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem"
                  }}
                />
                <button
                  onClick={makeDeposit}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#16a34a",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Effectuer le Dépôt
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1f2937", marginBottom: "24px" }}>
            Liste des Utilisateurs
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ textAlign: "left", padding: "8px" }}>Nom</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Email</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Solde</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "8px" }}>{user.firstName} {user.lastName}</td>
                    <td style={{ padding: "8px" }}>{user.email}</td>
                    <td style={{ padding: "8px" }}>₪{user.balance}</td>
                    <td style={{ padding: "8px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        backgroundColor: user.isBlocked ? "#fef2f2" : "#f0fdf4",
                        color: user.isBlocked ? "#dc2626" : "#16a34a"
                      }}>
                        {user.isBlocked ? 'Bloqué' : 'Actif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}