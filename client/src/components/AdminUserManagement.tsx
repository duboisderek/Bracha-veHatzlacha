import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserDetailDialog } from "@/components/UserDetailDialog";
import { 
  Users, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Plus,
  Eye,
  Lock,
  Unlock,
  CreditCard,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  Trophy,
  Star,
  Shield,
  Settings,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'user' | 'vip' | 'admin' | 'root_admin';
  status: 'active' | 'suspended' | 'pending';
  balance: string;
  totalTickets: number;
  totalWins: number;
  registrationDate: string;
  lastLogin?: string;
  address?: {
    street: string;
    city: string;
    country: string;
    zipCode: string;
  };
  preferences?: {
    language: string;
    notifications: boolean;
    marketing: boolean;
  };
}

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: User['role'];
  status: User['status'];
  balance: string;
  street: string;
  city: string;
  country: string;
  zipCode: string;
  language: string;
  notifications: boolean;
  marketing: boolean;
}

interface FilterOptions {
  searchTerm: string;
  role: string;
  status: string;
  balanceMin: string;
  balanceMax: string;
  registrationFrom?: Date;
  registrationTo?: Date;
}

export default function AdminUserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    role: 'all',
    status: 'all',
    balanceMin: '',
    balanceMax: '',
    registrationFrom: undefined,
    registrationTo: undefined
  });

  const [createForm, setCreateForm] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user',
    status: 'active',
    balance: '100',
    street: '',
    city: '',
    country: '',
    zipCode: '',
    language: 'fr',
    notifications: true,
    marketing: false
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.firstName || !createForm.lastName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Utilisateur créé avec succès",
        });
        setShowCreateDialog(false);
        resetCreateForm();
        loadUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de la création",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: User['status']) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Statut utilisateur mis à jour",
        });
        loadUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de la mise à jour",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateUserBalance = async (userId: string, amount: string, operation: 'add' | 'subtract' | 'set') => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: parseFloat(amount), operation })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Solde utilisateur mis à jour",
        });
        loadUsers();
        setShowDetailDialog(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de la mise à jour",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Utilisateur supprimé",
        });
        loadUsers();
        setShowDetailDialog(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de la suppression",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'user',
      status: 'active',
      balance: '100',
      street: '',
      city: '',
      country: '',
      zipCode: '',
      language: 'fr',
      notifications: true,
      marketing: false
    });
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'root_admin':
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            <Shield className="w-3 h-3 mr-1" />
            Root Admin
          </Badge>
        );
      case 'admin':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Settings className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case 'vip':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Star className="w-3 h-3 mr-1" />
            VIP
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-600">
            <Users className="w-3 h-3 mr-1" />
            Utilisateur
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <UserCheck className="w-3 h-3 mr-1" />
            Actif
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <UserX className="w-3 h-3 mr-1" />
            Suspendu
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            <Users className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  const applyFilters = (users: User[]): User[] => {
    return users.filter(user => {
      // Search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matches = 
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          (user.phone && user.phone.toLowerCase().includes(searchLower));
        if (!matches) return false;
      }

      // Role filter
      if (filters.role !== 'all' && user.role !== filters.role) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && user.status !== filters.status) {
        return false;
      }

      // Balance filters
      if (filters.balanceMin) {
        const balance = parseFloat(user.balance);
        if (balance < parseFloat(filters.balanceMin)) return false;
      }

      if (filters.balanceMax) {
        const balance = parseFloat(user.balance);
        if (balance > parseFloat(filters.balanceMax)) return false;
      }

      return true;
    });
  };

  const filteredUsers = applyFilters(users);

  const exportUsers = () => {
    const csvContent = [
      ['ID', 'Email', 'Prénom', 'Nom', 'Rôle', 'Statut', 'Solde', 'Tickets', 'Gains', 'Inscription'].join(','),
      ...filteredUsers.map(user => [
        user.id,
        user.email,
        user.firstName,
        user.lastName,
        user.role,
        user.status,
        user.balance,
        user.totalTickets,
        user.totalWins,
        new Date(user.registrationDate).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilisateurs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600 mt-1">
            Administration complète des comptes utilisateurs
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportUsers} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouvel Utilisateur
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Utilisateurs ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Trophy className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <Upload className="w-4 h-4" />
            Actions Groupées
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Rechercher</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Email, nom, téléphone..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Rôle</Label>
                  <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="root_admin">Root Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Statut</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="suspended">Suspendu</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={loadUsers} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Actualiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Utilisateurs ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                  <p className="text-gray-500">
                    {users.length === 0 
                      ? "Aucun utilisateur n'est encore enregistré."
                      : "Aucun utilisateur ne correspond aux filtres sélectionnés."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-semibold text-lg">
                                  {user.firstName} {user.lastName}
                                </span>
                                {getRoleBadge(user.role)}
                                {getStatusBadge(user.status)}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </div>
                                {user.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {user.phone}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(user.registrationDate).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-xl text-green-600">₪{user.balance}</div>
                              <div className="text-sm text-gray-500">
                                {user.totalTickets} tickets • {user.totalWins} gains
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-6 flex flex-col gap-2">
                          <Button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailDialog(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Détails
                          </Button>

                          <div className="flex gap-2">
                            {user.status === 'active' ? (
                              <Button
                                onClick={() => handleUpdateUserStatus(user.id, 'suspended')}
                                disabled={isProcessing}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <Lock className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleUpdateUserStatus(user.id, 'active')}
                                disabled={isProcessing}
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <Unlock className="w-4 h-4" />
                              </Button>
                            )}
                            
                            <Button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={isProcessing}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{users.length}</div>
                <div className="text-sm text-gray-500">Total Utilisateurs</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </div>
                <div className="text-sm text-gray-500">Utilisateurs Actifs</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {users.filter(u => u.role === 'vip').length}
                </div>
                <div className="text-sm text-gray-500">Utilisateurs VIP</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  ₪{users.reduce((sum, u) => sum + parseFloat(u.balance), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Solde Total</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bulk Actions Tab */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Actions Groupées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Bonus de Solde Groupé</h3>
                  <div className="flex gap-2">
                    <Input placeholder="Montant (₪)" type="number" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Cibler" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les utilisateurs</SelectItem>
                        <SelectItem value="vip">Utilisateurs VIP</SelectItem>
                        <SelectItem value="active">Utilisateurs actifs</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>Appliquer</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Promotion de Rôle</h3>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Nouveau rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Utilisateur</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Critères" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balance">Par solde</SelectItem>
                        <SelectItem value="tickets">Par tickets</SelectItem>
                        <SelectItem value="wins">Par gains</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>Appliquer</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Detail Dialog */}
      <UserDetailDialog
        user={selectedUser}
        isOpen={showDetailDialog}
        onClose={() => {
          setShowDetailDialog(false);
          setSelectedUser(null);
        }}
        onUpdate={loadUsers}
        isProcessing={isProcessing}
      />

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Créer un Nouvel Utilisateur
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Jean"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="jean.dupont@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+33612345678"
                />
              </div>
              <div>
                <Label htmlFor="balance">Solde initial (₪)</Label>
                <Input
                  id="balance"
                  type="number"
                  value={createForm.balance}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, balance: e.target.value }))}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select value={createForm.role} onValueChange={(value) => setCreateForm(prev => ({ ...prev, role: value as User['role'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={createForm.status} onValueChange={(value) => setCreateForm(prev => ({ ...prev, status: value as User['status'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                L'utilisateur recevra un email avec ses identifiants de connexion.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleCreateUser}
                disabled={isProcessing || !createForm.email || !createForm.firstName || !createForm.lastName}
                className="flex-1"
              >
                {isProcessing ? "Création..." : "Créer l'utilisateur"}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateDialog(false);
                  resetCreateForm();
                }}
                variant="outline"
                disabled={isProcessing}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}