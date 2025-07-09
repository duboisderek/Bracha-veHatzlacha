import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  Square, 
  Calendar,
  Trophy,
  Users,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface Draw {
  id: number;
  drawNumber: number;
  scheduledDate: string;
  drawDate?: string;
  jackpot: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  winningNumbers?: number[];
  totalTickets: number;
  totalPrize: string;
  winners?: {
    matches6: number;
    matches5: number;
    matches4: number;
    matches3: number;
  };
}

interface CreateDrawForm {
  scheduledDate: string;
  scheduledTime: string;
  jackpot: string;
  description: string;
}

export default function AdminDrawManagement() {
  const { toast } = useToast();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createForm, setCreateForm] = useState<CreateDrawForm>({
    scheduledDate: '',
    scheduledTime: '',
    jackpot: '',
    description: ''
  });

  const loadDraws = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/draws', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setDraws(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les tirages",
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
    loadDraws();
  }, []);

  const handleCreateDraw = async () => {
    if (!createForm.scheduledDate || !createForm.scheduledTime || !createForm.jackpot) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const scheduledDateTime = new Date(`${createForm.scheduledDate}T${createForm.scheduledTime}`);
      
      const response = await fetch('/api/admin/draws/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          scheduledDate: scheduledDateTime.toISOString(),
          jackpot: parseFloat(createForm.jackpot),
          description: createForm.description
        })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Tirage créé avec succès",
        });
        setShowCreateDialog(false);
        setCreateForm({
          scheduledDate: '',
          scheduledTime: '',
          jackpot: '',
          description: ''
        });
        loadDraws();
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

  const handleStartDraw = async (drawId: number) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/draws/${drawId}/start`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Tirage démarré",
        });
        loadDraws();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors du démarrage",
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

  const handleCancelDraw = async (drawId: number) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/draws/${drawId}/cancel`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Tirage annulé",
        });
        loadDraws();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de l'annulation",
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

  const getStatusBadge = (status: Draw['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Calendar className="w-3 h-3 mr-1" />
            Programmé
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600 animate-pulse">
            <Clock className="w-3 h-3 mr-1" />
            En cours
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Terminé
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Annulé
          </Badge>
        );
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getCurrentJackpot = () => {
    const activeDraw = draws.find(d => d.status === 'scheduled' || d.status === 'in_progress');
    return activeDraw?.jackpot || "500";
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
            <Trophy className="w-8 h-8 text-yellow-600" />
            Gestion des Tirages
          </h1>
          <p className="text-gray-600 mt-1">
            Administration complète des tirages de loterie
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouveau Tirage
          </Button>
        </div>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{draws.length}</div>
            <div className="text-sm text-gray-500">Total Tirages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {draws.filter(d => d.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500">Terminés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {draws.filter(d => d.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-500">En cours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">₪{getCurrentJackpot()}</div>
            <div className="text-sm text-gray-500">Jackpot Actuel</div>
          </CardContent>
        </Card>
      </div>

      {/* Draws List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tirages ({draws.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {draws.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun tirage</h3>
              <p className="text-gray-500 mb-4">
                Créez votre premier tirage pour commencer.
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Créer un tirage
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {draws.map((draw) => (
                <motion.div
                  key={draw.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div>
                          <div className="font-bold text-xl">Tirage #{draw.drawNumber}</div>
                          <div className="text-sm text-gray-500">
                            Programmé: {formatDateTime(draw.scheduledDate)}
                          </div>
                          {draw.drawDate && (
                            <div className="text-sm text-gray-500">
                              Effectué: {formatDateTime(draw.drawDate)}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-2xl text-yellow-600">₪{draw.jackpot}</div>
                          <div className="text-sm text-gray-500">{draw.totalTickets} tickets</div>
                        </div>
                        
                        {getStatusBadge(draw.status)}
                      </div>

                      {draw.winningNumbers && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-medium">Numéros gagnants:</span>
                          <div className="flex gap-1">
                            {draw.winningNumbers.map((number, index) => (
                              <div
                                key={index}
                                className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold"
                              >
                                {number}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {draw.winners && (
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>6 numéros: {draw.winners.matches6}</div>
                          <div>5 numéros: {draw.winners.matches5}</div>
                          <div>4 numéros: {draw.winners.matches4}</div>
                          <div>3 numéros: {draw.winners.matches3}</div>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col gap-2">
                      <Button
                        onClick={() => {
                          setSelectedDraw(draw);
                          setShowDetailDialog(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Détails
                      </Button>

                      {draw.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStartDraw(draw.id)}
                            disabled={isProcessing}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white gap-1"
                          >
                            <Play className="w-4 h-4" />
                            Démarrer
                          </Button>
                          <Button
                            onClick={() => handleCancelDraw(draw.id)}
                            disabled={isProcessing}
                            variant="destructive"
                            size="sm"
                            className="gap-1"
                          >
                            <Square className="w-4 h-4" />
                            Annuler
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Draw Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Créer un Nouveau Tirage
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledDate">Date du tirage *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={createForm.scheduledDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="scheduledTime">Heure du tirage *</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={createForm.scheduledTime}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="jackpot">Jackpot (₪) *</Label>
              <Input
                id="jackpot"
                type="number"
                placeholder="500"
                value={createForm.jackpot}
                onChange={(e) => setCreateForm(prev => ({ ...prev, jackpot: e.target.value }))}
                min="100"
                step="50"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Description du tirage..."
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Une fois créé, le tirage sera automatiquement visible par tous les utilisateurs.
                Assurez-vous que la date et l'heure sont correctes.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleCreateDraw}
                disabled={isProcessing || !createForm.scheduledDate || !createForm.scheduledTime || !createForm.jackpot}
                className="flex-1"
              >
                {isProcessing ? "Création..." : "Créer le tirage"}
              </Button>
              <Button
                onClick={() => setShowCreateDialog(false)}
                variant="outline"
                disabled={isProcessing}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Draw Detail Dialog */}
      {selectedDraw && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Détails du Tirage #{selectedDraw.drawNumber}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Informations Générales</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Numéro:</span>
                        <div className="font-medium">#{selectedDraw.drawNumber}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Statut:</span>
                        <div className="mt-1">{getStatusBadge(selectedDraw.status)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Jackpot:</span>
                        <div className="font-bold text-xl text-yellow-600">₪{selectedDraw.jackpot}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Dates</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Programmé:</span>
                        <div className="font-medium">{formatDateTime(selectedDraw.scheduledDate)}</div>
                      </div>
                      {selectedDraw.drawDate && (
                        <div>
                          <span className="text-sm text-gray-500">Effectué:</span>
                          <div className="font-medium">{formatDateTime(selectedDraw.drawDate)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedDraw.winningNumbers && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-yellow-800">Numéros Gagnants</h3>
                  <div className="flex gap-2">
                    {selectedDraw.winningNumbers.map((number, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
                      >
                        {number}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDraw.winners && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-green-800">Gagnants</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedDraw.winners.matches6}</div>
                      <div className="text-sm text-green-700">6 numéros</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedDraw.winners.matches5}</div>
                      <div className="text-sm text-green-700">5 numéros</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedDraw.winners.matches4}</div>
                      <div className="text-sm text-green-700">4 numéros</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedDraw.winners.matches3}</div>
                      <div className="text-sm text-green-700">3 numéros</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-blue-800">Statistiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-blue-600">Total tickets vendus:</span>
                    <div className="font-bold text-xl text-blue-800">{selectedDraw.totalTickets}</div>
                  </div>
                  <div>
                    <span className="text-sm text-blue-600">Total des prix:</span>
                    <div className="font-bold text-xl text-blue-800">₪{selectedDraw.totalPrize}</div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}