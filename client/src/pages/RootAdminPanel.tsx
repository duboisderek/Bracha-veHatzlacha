import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, UserPlus, Bot, Crown, Eye, Trash2 } from "lucide-react";

interface User {
  id: string;
  email?: string;
  firstName: string;
  lastName: string;
  balance: string;
  totalWinnings: string;
  isAdmin: boolean;
  isRootAdmin: boolean;
  isFictional: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export default function RootAdminPanel() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'real' | 'fictional'>('all');

  // Real client creation form
  const [realClientData, setRealClientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    balance: "100.00",
    language: "fr"
  });

  // Fictional accounts creation form
  const [fictionalData, setFictionalData] = useState({
    count: 10,
    baseWinnings: 1000
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/all-users?type=${userFilter}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userFilter]);

  const handleCreateRealClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/create-real-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(realClientData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Client réel créé",
          description: `${result.user.firstName} ${result.user.lastName} créé avec succès`,
        });
        
        setRealClientData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          balance: "100.00",
          language: "fr"
        });
        
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du client",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFictionalAccounts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/create-fictional-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(fictionalData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Comptes fictifs créés",
          description: result.message,
        });
        
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création des comptes fictifs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const realUsers = users.filter(u => !u.isFictional);
  const fictionalUsers = users.filter(u => u.isFictional);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <Crown className="w-8 h-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900">Panneau Root Admin</h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="create-real">Créer Client Réel</TabsTrigger>
            <TabsTrigger value="create-fictional">Créer Comptes Fictifs</TabsTrigger>
            <TabsTrigger value="manage-users">Gérer Utilisateurs</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clients Réels</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realUsers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Comptes authentifiés actifs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comptes Fictifs</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{fictionalUsers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Pour simulation d'activité
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Gains Fictifs</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₪{fictionalUsers.reduce((sum, user) => sum + parseFloat(user.totalWinnings), 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gains simulés affichés
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Create Real Client */}
          <TabsContent value="create-real">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Créer un Client Réel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateRealClient} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={realClientData.firstName}
                        onChange={(e) => setRealClientData({...realClientData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={realClientData.lastName}
                        onChange={(e) => setRealClientData({...realClientData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={realClientData.email}
                      onChange={(e) => setRealClientData({...realClientData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={realClientData.password}
                      onChange={(e) => setRealClientData({...realClientData, password: e.target.value})}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="balance">Solde initial (₪)</Label>
                      <Input
                        id="balance"
                        type="number"
                        step="0.01"
                        value={realClientData.balance}
                        onChange={(e) => setRealClientData({...realClientData, balance: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Langue</Label>
                      <select
                        id="language"
                        value={realClientData.language}
                        onChange={(e) => setRealClientData({...realClientData, language: e.target.value})}
                        className="w-full p-2 border rounded"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="he">עברית</option>
                      </select>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Création..." : "Créer Client Réel"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Fictional Accounts */}
          <TabsContent value="create-fictional">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Créer des Comptes Fictifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateFictionalAccounts} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="count">Nombre de comptes (max 1000)</Label>
                      <Input
                        id="count"
                        type="number"
                        min="1"
                        max="1000"
                        value={fictionalData.count}
                        onChange={(e) => setFictionalData({...fictionalData, count: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baseWinnings">Gains de base maximum (₪)</Label>
                      <Input
                        id="baseWinnings"
                        type="number"
                        min="0"
                        value={fictionalData.baseWinnings}
                        onChange={(e) => setFictionalData({...fictionalData, baseWinnings: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Les comptes fictifs seront créés avec des noms aléatoires et des gains simulés.
                      Ils apparaîtront dans les carrousels de gagnants mais ne pourront pas se connecter.
                    </p>
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Création..." : `Créer ${fictionalData.count} Comptes Fictifs`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Users */}
          <TabsContent value="manage-users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={userFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserFilter('all')}
                  >
                    Tous ({users.length})
                  </Button>
                  <Button
                    variant={userFilter === 'real' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserFilter('real')}
                  >
                    Réels ({realUsers.length})
                  </Button>
                  <Button
                    variant={userFilter === 'fictional' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserFilter('fictional')}
                  >
                    Fictifs ({fictionalUsers.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.firstName} {user.lastName}</span>
                            {user.isFictional && <Badge variant="secondary">Fictif</Badge>}
                            {user.isRootAdmin && <Badge variant="default">Root Admin</Badge>}
                            {user.isAdmin && !user.isRootAdmin && <Badge variant="outline">Admin</Badge>}
                            {user.isBlocked && <Badge variant="destructive">Bloqué</Badge>}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email || "Pas d'email"} • Balance: ₪{user.balance} • Gains: ₪{user.totalWinnings}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user.isFictional && (
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}