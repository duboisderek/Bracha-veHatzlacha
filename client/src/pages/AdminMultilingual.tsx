import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminMultilingual() {
  const { t, language } = useLanguage();
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
      setMessage(t("error"));
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
      showMessage(t("required"));
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
          language: language,
        }),
      });

      if (res.ok) {
        showMessage(t("userCreated"));
        setNewUsername("");
        loadData();
      } else {
        showMessage(t("error"));
      }
    } catch (error) {
      showMessage(t("error"));
    }
  };

  const makeDeposit = async () => {
    if (!selectedUserId || !depositAmount || parseFloat(depositAmount) <= 0) {
      showMessage(t("required"));
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
          comment: t("manualTopup"),
        }),
      });

      if (res.ok) {
        showMessage(t("topupSuccess"));
        setDepositAmount("");
        setSelectedUserId("");
        loadData();
      } else {
        showMessage(t("error"));
      }
    } catch (error) {
      showMessage(t("error"));
    }
  };

  const submitResults = async () => {
    if (winningNumbers.length !== 6) {
      showMessage(t("selectSixNumbers"));
      return;
    }

    if (!currentDraw) {
      showMessage(t("noActiveDraw"));
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
        showMessage(t("resultsSubmitted"));
        setWinningNumbers([]);
        loadData();
      } else {
        showMessage(t("error"));
      }
    } catch (error) {
      showMessage(t("error"));
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
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: "#f9fafb", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        direction: language === "he" ? "rtl" : "ltr"
      }}>
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
          <p style={{ color: "#6b7280" }}>{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f9fafb", 
      padding: "16px",
      direction: language === "he" ? "rtl" : "ltr"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: "bold", 
            color: "#1f2937", 
            marginBottom: "8px",
            textAlign: language === "he" ? "right" : "left"
          }}>
            {t("adminPanel")}
          </h1>
          <p style={{ 
            color: "#6b7280",
            textAlign: language === "he" ? "right" : "left"
          }}>
            {t("managePlatform")}
          </p>
          {message && (
            <div style={{
              marginTop: "16px",
              padding: "16px",
              borderRadius: "8px",
              backgroundColor: message.includes(t("error")) ? "#fef2f2" : "#f0fdf4",
              color: message.includes(t("error")) ? "#dc2626" : "#16a34a",
              textAlign: language === "he" ? "right" : "left"
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              color: "#6b7280", 
              marginBottom: "8px",
              textAlign: language === "he" ? "right" : "left"
            }}>
              {t("totalUsers")}
            </h3>
            <div style={{ 
              fontSize: "1.5rem", 
              fontWeight: "bold", 
              color: "#3b82f6",
              textAlign: language === "he" ? "right" : "left"
            }}>
              {users.length}
            </div>
          </div>
          
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              color: "#6b7280", 
              marginBottom: "8px",
              textAlign: language === "he" ? "right" : "left"
            }}>
              {t("currentDraw")}
            </h3>
            <div style={{ 
              fontSize: "1.5rem", 
              fontWeight: "bold", 
              color: "#eab308",
              textAlign: language === "he" ? "right" : "left"
            }}>
              #{currentDraw?.drawNumber || "N/A"}
            </div>
          </div>
          
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              color: "#6b7280", 
              marginBottom: "8px",
              textAlign: language === "he" ? "right" : "left"
            }}>
              {t("jackpot")}
            </h3>
            <div style={{ 
              fontSize: "1.5rem", 
              fontWeight: "bold", 
              color: "#16a34a",
              textAlign: language === "he" ? "right" : "left"
            }}>
              ₪{currentDraw?.jackpotAmount || "0"}
            </div>
          </div>
          
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              color: "#6b7280", 
              marginBottom: "8px",
              textAlign: language === "he" ? "right" : "left"
            }}>
              {t("platformRevenue")}
            </h3>
            <div style={{ 
              fontSize: "1.5rem", 
              fontWeight: "bold", 
              color: "#a855f7",
              textAlign: language === "he" ? "right" : "left"
            }}>
              ₪43,670
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "32px", marginBottom: "32px" }}>
          
          {/* Submit Results Card */}
          <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h2 style={{ 
              fontSize: "1.25rem", 
              fontWeight: "bold", 
              color: "#1f2937", 
              marginBottom: "24px",
              textAlign: language === "he" ? "right" : "left"
            }}>
              {t("submitDrawResults")}
            </h2>
            
            {currentDraw && (
              <div style={{ 
                padding: "16px", 
                backgroundColor: "#dbeafe", 
                borderRadius: "8px", 
                marginBottom: "24px",
                textAlign: language === "he" ? "right" : "left"
              }}>
                <h3 style={{ fontWeight: "600", color: "#1e40af", marginBottom: "8px" }}>
                  {t("drawNumber")} #{currentDraw.drawNumber}
                </h3>
                <p style={{ color: "#1e40af", fontSize: "0.875rem" }}>
                  {t("date")}: {new Date(currentDraw.drawDate).toLocaleDateString()}
                </p>
                <p style={{ color: "#1e40af", fontSize: "0.875rem" }}>
                  {t("jackpot")}: ₪{currentDraw.jackpotAmount}
                </p>
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "0.875rem", 
                fontWeight: "500", 
                color: "#1f2937", 
                marginBottom: "12px",
                textAlign: language === "he" ? "right" : "left"
              }}>
                {t("selectWinningNumbers")}
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
              <p style={{ 
                fontSize: "0.875rem", 
                color: "#6b7280", 
                marginBottom: "12px",
                textAlign: language === "he" ? "right" : "left"
              }}>
                {t("selected")}: {winningNumbers.length}/6
              </p>
              <div style={{ display: "flex", gap: "8px", justifyContent: language === "he" ? "flex-end" : "flex-start" }}>
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
              {t("submitResults")}
            </button>
          </div>

          {/* User Management Card */}
          <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h2 style={{ 
              fontSize: "1.25rem", 
              fontWeight: "bold", 
              color: "#1f2937", 
              marginBottom: "24px",
              textAlign: language === "he" ? "right" : "left"
            }}>
              {t("userManagement")}
            </h2>
            
            {/* Create User */}
            <div style={{ 
              padding: "16px", 
              backgroundColor: "#dbeafe", 
              borderRadius: "8px", 
              marginBottom: "24px",
              textAlign: language === "he" ? "right" : "left"
            }}>
              <h4 style={{ fontWeight: "600", color: "#1e40af", marginBottom: "12px" }}>
                {t("createUser")}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder={t("username")}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    textAlign: language === "he" ? "right" : "left"
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
                  {t("createUserButton")}
                </button>
              </div>
            </div>

            {/* Manual Deposit */}
            <div style={{ 
              padding: "16px", 
              backgroundColor: "#dcfce7", 
              borderRadius: "8px",
              textAlign: language === "he" ? "right" : "left"
            }}>
              <h4 style={{ fontWeight: "600", color: "#166534", marginBottom: "12px" }}>
                {t("manualTopup")}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    textAlign: language === "he" ? "right" : "left"
                  }}
                >
                  <option value="">{t("selectUser")}</option>
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
                  placeholder={t("topupAmount")}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    textAlign: language === "he" ? "right" : "left"
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
                  {t("processTopup")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h2 style={{ 
            fontSize: "1.25rem", 
            fontWeight: "bold", 
            color: "#1f2937", 
            marginBottom: "24px",
            textAlign: language === "he" ? "right" : "left"
          }}>
            {t("usersList")}
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ textAlign: language === "he" ? "right" : "left", padding: "8px" }}>{t("name")}</th>
                  <th style={{ textAlign: language === "he" ? "right" : "left", padding: "8px" }}>{t("email")}</th>
                  <th style={{ textAlign: language === "he" ? "right" : "left", padding: "8px" }}>{t("balance")}</th>
                  <th style={{ textAlign: language === "he" ? "right" : "left", padding: "8px" }}>{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "8px", textAlign: language === "he" ? "right" : "left" }}>
                      {user.firstName} {user.lastName}
                    </td>
                    <td style={{ padding: "8px", textAlign: language === "he" ? "right" : "left" }}>
                      {user.email}
                    </td>
                    <td style={{ padding: "8px", textAlign: language === "he" ? "right" : "left" }}>
                      ₪{user.balance}
                    </td>
                    <td style={{ padding: "8px", textAlign: language === "he" ? "right" : "left" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        backgroundColor: user.isBlocked ? "#fef2f2" : "#f0fdf4",
                        color: user.isBlocked ? "#dc2626" : "#16a34a"
                      }}>
                        {user.isBlocked ? t("blocked") : t("statusActive")}
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