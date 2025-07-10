import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, Upload, RefreshCw, Archive, Clock, 
  CheckCircle, AlertCircle, Settings, Database,
  Calendar, FileText, Shield
} from 'lucide-react';

interface BackupInfo {
  id: string;
  name: string;
  date: string;
  size: string;
  type: 'automatic' | 'manual';
  status: 'completed' | 'failed' | 'in_progress';
  path: string;
  checksum: string;
}

interface BackupStats {
  totalBackups: number;
  totalSize: string;
  lastBackup: string;
  nextScheduled: string;
  successRate: number;
}

export default function BackupManagement() {
  const { toast } = useToast();
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
    fetchStats();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/root-admin/system/backups', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les sauvegardes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/root-admin/system/backup-stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching backup stats:', error);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/root-admin/system/backup', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Succès",
          description: "Sauvegarde créée avec succès"
        });
        fetchBackups();
        fetchStats();
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la sauvegarde",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir restaurer cette sauvegarde ? Cette action est irréversible.')) {
      return;
    }

    setRestoring(backupId);
    try {
      const response = await fetch(`/api/root-admin/system/restore/${backupId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Sauvegarde restaurée avec succès"
        });
        // Reload the page after successful restore
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error('Erreur lors de la restauration');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de restaurer la sauvegarde",
        variant: "destructive"
      });
    } finally {
      setRestoring(null);
    }
  };

  const downloadBackup = async (backup: BackupInfo) => {
    try {
      const response = await fetch(`/api/root-admin/system/backup/${backup.id}/download`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = backup.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la sauvegarde",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      in_progress: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status === 'completed' ? 'Terminé' : 
         status === 'failed' ? 'Échoué' : 
         status === 'in_progress' ? 'En cours' : status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Sauvegardes</h2>
          <p className="text-gray-600">Sauvegarde et restauration du système</p>
        </div>
        <Button onClick={createBackup} disabled={creating}>
          {creating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Création...
            </>
          ) : (
            <>
              <Archive className="w-4 h-4 mr-2" />
              Nouvelle Sauvegarde
            </>
          )}
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Sauvegardes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBackups}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Archive className="w-8 h-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Taille Totale</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Dernière Sauvegarde</p>
                  <p className="text-sm font-bold text-gray-900">{stats.lastBackup}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Taux de Succès</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backup Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configuration Automatique
          </CardTitle>
          <CardDescription>
            Les sauvegardes automatiques sont effectuées quotidiennement à 3h00 UTC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Prochaine sauvegarde automatique : {stats?.nextScheduled || 'Non programmée'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Sauvegardes</CardTitle>
          <CardDescription>
            Liste de toutes les sauvegardes disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune sauvegarde disponible</p>
              </div>
            ) : (
              backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(backup.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{backup.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{backup.date}</span>
                        <span>{backup.size}</span>
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          {backup.type === 'automatic' ? 'Automatique' : 'Manuel'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(backup.status)}
                    
                    {backup.status === 'completed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadBackup(backup)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Télécharger
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreBackup(backup.id)}
                          disabled={restoring === backup.id}
                        >
                          {restoring === backup.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                              Restauration...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-1" />
                              Restaurer
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}