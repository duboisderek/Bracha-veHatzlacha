import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard,
  Trophy,
  Lock,
  Unlock,
  DollarSign,
  Plus,
  Minus,
  Settings,
  Shield,
  Star,
  Users,
  Activity,
  TrendingUp,
  Eye,
  History
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

interface UserDetailDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  isProcessing: boolean;
}

export function UserDetailDialog({ user, isOpen, onClose, onUpdate, isProcessing }: UserDetailDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceNotes, setBalanceNotes] = useState("");
  const [editForm, setEditForm] = useState<Partial<User>>({});

  if (!user) return null;

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      address: user.address,
      preferences: user.preferences
    });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Informations utilisateur mises à jour",
        });
        setIsEditing(false);
        onUpdate();
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
    }
  };

  const handleBalanceUpdate = async () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un montant valide",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseFloat(balanceAmount),
          operation: balanceOperation,
          notes: balanceNotes
        })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Solde mis à jour",
        });
        setBalanceAmount("");
        setBalanceNotes("");
        onUpdate();
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
    }
  };

  const handleStatusChange = async (newStatus: User['status']) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Statut mis à jour",
        });
        onUpdate();
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
    }
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'root_admin':
        return <Badge className="bg-purple-100 text-purple-800"><Shield className="w-3 h-3 mr-1" />Root Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-800"><Settings className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'vip':
        return <Badge className="bg-yellow-100 text-yellow-800"><Star className="w-3 h-3 mr-1" />VIP</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Users className="w-3 h-3 mr-1" />Utilisateur</Badge>;
    }
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">En attente</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getRoleBadge(user.role)}
              {getStatusBadge(user.status)}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details" className="gap-2">
              <User className="w-4 h-4" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="balance" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Solde
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              Activité
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <Settings className="w-4 h-4" />
              Actions
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Informations Personnelles</h3>
              {!isEditing ? (
                <Button onClick={handleStartEdit} variant="outline" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} disabled={isProcessing} className="gap-2">
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="gap-2">
                    <X className="w-4 h-4" />
                    Annuler
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Prénom</Label>
                          <Input
                            value={editForm.firstName || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Nom</Label>
                          <Input
                            value={editForm.lastName || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Téléphone</Label>
                        <Input
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          Inscrit le {new Date(user.registrationDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {user.lastLogin && (
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            Dernière connexion: {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <Label>Rôle</Label>
                        <Select 
                          value={editForm.role} 
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value as User['role'] }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="root_admin">Root Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Statut</Label>
                        <Select 
                          value={editForm.status} 
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as User['status'] }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="suspended">Suspendu</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-xs text-gray-500">Rôle</span>
                        <div className="mt-1">{getRoleBadge(user.role)}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Statut</span>
                        <div className="mt-1">{getStatusBadge(user.status)}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Solde</span>
                        <div className="text-2xl font-bold text-green-600 mt-1">₪{user.balance}</div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {user.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Adresse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {user.address.street}<br />
                    {user.address.zipCode} {user.address.city}<br />
                    {user.address.country}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Balance Tab */}
          <TabsContent value="balance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Gestion du Solde
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">₪{user.balance}</div>
                  <div className="text-sm text-gray-500">Solde actuel</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={balanceOperation === 'add' ? 'default' : 'outline'}
                    onClick={() => setBalanceOperation('add')}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </Button>
                  <Button
                    variant={balanceOperation === 'subtract' ? 'default' : 'outline'}
                    onClick={() => setBalanceOperation('subtract')}
                    className="gap-2"
                  >
                    <Minus className="w-4 h-4" />
                    Retirer
                  </Button>
                  <Button
                    variant={balanceOperation === 'set' ? 'default' : 'outline'}
                    onClick={() => setBalanceOperation('set')}
                    className="gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Définir
                  </Button>
                </div>

                <div>
                  <Label htmlFor="amount">Montant (₪)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    value={balanceNotes}
                    onChange={(e) => setBalanceNotes(e.target.value)}
                    placeholder="Raison de la modification..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleBalanceUpdate}
                  disabled={isProcessing || !balanceAmount}
                  className="w-full"
                >
                  {balanceOperation === 'add' && 'Ajouter au solde'}
                  {balanceOperation === 'subtract' && 'Retirer du solde'}
                  {balanceOperation === 'set' && 'Définir le solde'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activité Récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Historique des activités non disponible pour le moment</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">{user.totalTickets}</div>
                  <div className="text-sm text-gray-500">Tickets achetés</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{user.totalWins}</div>
                  <div className="text-sm text-gray-500">Gains remportés</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {user.totalTickets > 0 ? ((user.totalWins / user.totalTickets) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-500">Taux de gain</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actions Administrateur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.status === 'active' ? (
                    <Button
                      onClick={() => handleStatusChange('suspended')}
                      disabled={isProcessing}
                      variant="destructive"
                      className="gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Suspendre le compte
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStatusChange('active')}
                      disabled={isProcessing}
                      className="gap-2"
                    >
                      <Unlock className="w-4 h-4" />
                      Activer le compte
                    </Button>
                  )}

                  <Button variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Envoyer un email
                  </Button>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Les actions effectuées sur les comptes utilisateurs sont tracées et enregistrées pour des raisons de sécurité.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}