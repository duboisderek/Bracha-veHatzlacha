import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Eye
} from "lucide-react";

interface LogEntry {
  timestamp: Date;
  level: string;
  message: string;
  service?: string;
  metadata?: any;
  error?: Error;
}

interface LogStats {
  total: number;
  byLevel: Record<string, number>;
  byService: Record<string, number>;
}

export default function AdminSystemLogs() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats>({ total: 0, byLevel: {}, byService: {} });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("24h");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        level: levelFilter !== 'all' ? levelFilter : '',
        service: serviceFilter !== 'all' ? serviceFilter : '',
        timeRange: timeFilter,
        search: searchTerm
      });

      const response = await fetch(`/api/admin/logs?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setStats(data.stats);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les logs",
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
    loadLogs();
  }, [levelFilter, serviceFilter, timeFilter]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, levelFilter, serviceFilter, timeFilter]);

  const handleSearch = () => {
    loadLogs();
  };

  const handleExportLogs = async () => {
    try {
      const params = new URLSearchParams({
        level: levelFilter !== 'all' ? levelFilter : '',
        service: serviceFilter !== 'all' ? serviceFilter : '',
        timeRange: timeFilter,
        search: searchTerm,
        format: 'csv'
      });

      const response = await fetch(`/api/admin/logs/export?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export réussi",
          description: "Les logs ont été exportés avec succès",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de l'export",
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

  const handleClearLogs = async () => {
    if (!confirm("Êtes-vous sûr de vouloir effacer tous les logs ? Cette action est irréversible.")) {
      return;
    }

    try {
      const response = await fetch('/api/admin/logs/clear', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Logs effacés",
          description: "Tous les logs ont été effacés",
        });
        loadLogs();
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de l'effacement",
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

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'debug':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      error: "destructive",
      warn: "outline",
      info: "secondary",
      debug: "outline"
    };

    return (
      <Badge variant={variants[level.toLowerCase() as keyof typeof variants] || "outline"}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => {
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const services = Object.keys(stats.byService);
  const levels = Object.keys(stats.byLevel);

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
        <h1 className="text-3xl font-bold text-gray-900">Logs Système</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 text-green-600" : ""}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          <Button onClick={loadLogs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total logs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.byLevel.error || 0}</div>
            <div className="text-sm text-gray-500">Erreurs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.byLevel.warn || 0}</div>
            <div className="text-sm text-gray-500">Avertissements</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.byLevel.info || 0}</div>
            <div className="text-sm text-gray-500">Informations</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Rechercher dans les messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="level">Niveau</Label>
              <select
                id="level"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tous les niveaux</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="service">Service</Label>
              <select
                id="service"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tous les services</option>
                {services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="time">Période</Label>
              <select
                id="time"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="1h">Dernière heure</option>
                <option value="24h">Dernières 24h</option>
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="all">Tout</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleExportLogs} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button onClick={handleClearLogs} variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-1" />
                Effacer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Logs ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun log trouvé</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getLevelIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getLevelBadge(log.level)}
                          {log.service && (
                            <Badge variant="outline" className="text-xs">
                              {log.service}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {log.message}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Détails du Log</h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedLog(null)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Niveau</Label>
                    <div>{getLevelBadge(selectedLog.level)}</div>
                  </div>
                  <div>
                    <Label>Service</Label>
                    <div>{selectedLog.service || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <Label>Timestamp</Label>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {formatTimestamp(selectedLog.timestamp)}
                  </div>
                </div>

                <div>
                  <Label>Message</Label>
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    {selectedLog.message}
                  </div>
                </div>

                {selectedLog.metadata && (
                  <div>
                    <Label>Métadonnées</Label>
                    <pre className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.error && (
                  <div>
                    <Label>Erreur</Label>
                    <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                      <div className="font-medium text-red-700">
                        {selectedLog.error.name}: {selectedLog.error.message}
                      </div>
                      {selectedLog.error.stack && (
                        <pre className="text-xs text-red-600 mt-2 overflow-x-auto">
                          {selectedLog.error.stack}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}