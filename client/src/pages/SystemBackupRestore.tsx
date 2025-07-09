import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Database, 
  Download, 
  Upload,
  Save,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  HardDrive,
  Users,
  Coins,
  Settings
} from "lucide-react";

interface BackupItem {
  id: string;
  name: string;
  description: string;
  size: string;
  lastBackup: string;
  status: 'success' | 'warning' | 'error';
  autoBackup: boolean;
}

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    size: string;
    lastOptimization: string;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  performance: {
    responseTime: number;
    uptime: string;
    activeUsers: number;
  };
}

export default function SystemBackupRestore() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [backupItems, setBackupItems] = useState<BackupItem[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [selectedBackupFile, setSelectedBackupFile] = useState<File | null>(null);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      const [backupsResponse, healthResponse] = await Promise.all([
        fetch('/api/root-admin/system/backups', { credentials: 'include' }),
        fetch('/api/root-admin/system/health', { credentials: 'include' })
      ]);

      if (backupsResponse.ok) {
        const backupsData = await backupsResponse.json();
        setBackupItems(backupsData.backups);
      }

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données système",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  const handleFullBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);

    try {
      const response = await fetch('/api/root-admin/system/backup/full', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setBackupProgress(prev => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return 95;
            }
            return prev + Math.random() * 10;
          });
        }, 500);

        const blob = await response.blob();
        setBackupProgress(100);
        
        // Download backup file
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-backup-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        clearInterval(progressInterval);
        toast({
          title: "Sauvegarde créée",
          description: "Sauvegarde complète téléchargée avec succès",
        });
        
        loadSystemData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur de sauvegarde",
          description: errorData.message || "Erreur lors de la sauvegarde",
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
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  const handlePartialBackup = async (itemId: string) => {
    try {
      const response = await fetch('/api/root-admin/system/backup/partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId })
      });

      if (response.ok) {
        const blob = await response.blob();
        const item = backupItems.find(b => b.id === itemId);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${itemId}-backup-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Sauvegarde créée",
          description: `Sauvegarde de ${item?.name} téléchargée`,
        });
        
        loadSystemData();
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de la sauvegarde",
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

  const handleRestore = async () => {
    if (!selectedBackupFile) {
      toast({
        title: "Fichier requis",
        description: "Veuillez sélectionner un fichier de sauvegarde",
        variant: "destructive"
      });
      return;
    }

    if (!confirm("ATTENTION: La restauration va remplacer toutes les données actuelles. Êtes-vous sûr de vouloir continuer ?")) {
      return;
    }

    setIsRestoring(true);
    setRestoreProgress(0);

    try {
      const formData = new FormData();
      formData.append('backup', selectedBackupFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setRestoreProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 8;
        });
      }, 800);

      const response = await fetch('/api/root-admin/system/restore', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      clearInterval(progressInterval);
      setRestoreProgress(100);

      if (response.ok) {
        toast({
          title: "Restauration réussie",
          description: "Système restauré avec succès. Redémarrage recommandé.",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur de restauration",
          description: errorData.message || "Erreur lors de la restauration",
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
      setIsRestoring(false);
      setRestoreProgress(0);
    }
  };

  const toggleAutoBackup = async (itemId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/root-admin/system/auto-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, enabled })
      });

      if (response.ok) {
        setBackupItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, autoBackup: enabled } : item
        ));
        
        toast({
          title: enabled ? "Auto-backup activé" : "Auto-backup désactivé",
          description: `Auto-backup ${enabled ? 'activé' : 'désactivé'} pour ${backupItems.find(b => b.id === itemId)?.name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la configuration",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: BackupItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sauvegarde & Restauration</h1>
        <Button onClick={loadSystemData} variant="outline">
          <RotateCcw className="w-4 h-4 mr-1" />
          Actualiser
        </Button>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  <span className="font-medium">Base de données</span>
                </div>
                <div className={`font-bold ${getHealthColor(systemHealth.database.status)}`}>
                  {systemHealth.database.status}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <div>Taille: {systemHealth.database.size}</div>
                <div>Dernière optimisation: {systemHealth.database.lastOptimization}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  <span className="font-medium">Stockage</span>
                </div>
                <div className="font-bold">
                  {systemHealth.storage.percentage}%
                </div>
              </div>
              <Progress value={systemHealth.storage.percentage} className="mb-2" />
              <div className="text-sm text-gray-500">
                {systemHealth.storage.used}GB / {systemHealth.storage.total}GB
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Performance</span>
                </div>
                <div className="font-bold text-green-600">
                  {systemHealth.performance.responseTime}ms
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <div>Uptime: {systemHealth.performance.uptime}</div>
                <div>Utilisateurs actifs: {systemHealth.performance.activeUsers}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-medium">Sauvegarde complète</h3>
              <p className="text-sm text-gray-500">
                Crée une sauvegarde complète de tout le système (base de données, fichiers, configuration).
              </p>
              {isBackingUp && (
                <div className="space-y-2">
                  <Progress value={backupProgress} />
                  <p className="text-sm text-blue-600">Sauvegarde en cours... {Math.round(backupProgress)}%</p>
                </div>
              )}
              <Button 
                onClick={handleFullBackup} 
                disabled={isBackingUp}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {isBackingUp ? "Sauvegarde en cours..." : "Créer sauvegarde complète"}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Restauration système</h3>
              <p className="text-sm text-gray-500">
                Restaure le système à partir d'une sauvegarde précédente.
              </p>
              <div>
                <input
                  type="file"
                  accept=".zip,.tar.gz"
                  onChange={(e) => setSelectedBackupFile(e.target.files?.[0] || null)}
                  className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedBackupFile && (
                  <p className="text-sm text-green-600 mb-2">
                    Fichier sélectionné: {selectedBackupFile.name}
                  </p>
                )}
              </div>
              {isRestoring && (
                <div className="space-y-2">
                  <Progress value={restoreProgress} />
                  <p className="text-sm text-blue-600">Restauration en cours... {Math.round(restoreProgress)}%</p>
                </div>
              )}
              <Button 
                onClick={handleRestore} 
                disabled={!selectedBackupFile || isRestoring}
                variant="destructive"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isRestoring ? "Restauration en cours..." : "Restaurer système"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Items */}
      <Card>
        <CardHeader>
          <CardTitle>Sauvegardes par composant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backupItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <span className="text-sm text-gray-500">({item.size})</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-xs text-gray-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Dernière sauvegarde: {item.lastBackup}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={item.autoBackup}
                      onChange={(e) => toggleAutoBackup(item.id, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-500">Auto</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePartialBackup(item.id)}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Sauvegarder
                  </Button>
                </div>
              </motion.div>
            ))}

            {backupItems.length === 0 && (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune sauvegarde configurée</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warning Note */}
      <Card className="mt-6 border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Important - Sécurité des sauvegardes</h3>
              <div className="text-sm text-red-700 mt-1 space-y-1">
                <p>• Stockez les sauvegardes dans un endroit sûr et séparé du système principal</p>
                <p>• Testez régulièrement vos sauvegardes pour vous assurer qu'elles fonctionnent</p>
                <p>• La restauration remplace TOUTES les données actuelles - faites une sauvegarde avant</p>
                <p>• Planifiez des sauvegardes automatiques pendant les heures creuses</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}