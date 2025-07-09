import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity,
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface SystemMetrics {
  server: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
  };
  database: {
    status: 'healthy' | 'warning' | 'critical';
    connectionPool: {
      active: number;
      idle: number;
      total: number;
    };
    queryTime: number;
    slowQueries: number;
  };
  cache: {
    status: 'healthy' | 'warning' | 'offline';
    hitRate: number;
    memoryUsage: number;
    connections: number;
  };
  api: {
    responseTime: number;
    requestsPerMinute: number;
    errorRate: number;
    endpoints: Array<{
      path: string;
      status: 'healthy' | 'slow' | 'error';
      avgResponseTime: number;
    }>;
  };
}

export function SystemHealthMonitor() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/system/health', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setLastUpdate(new Date());
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les métriques système",
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
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: 'healthy' | 'warning' | 'critical' | 'slow' | 'error' | 'offline') => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sain</Badge>;
      case 'warning':
      case 'slow':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Attention</Badge>;
      case 'critical':
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Critique</Badge>;
      case 'offline':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Hors ligne</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>;
    }
  };

  const getProgressColor = (value: number, type: 'usage' | 'performance') => {
    if (type === 'usage') {
      if (value < 70) return "bg-green-500";
      if (value < 85) return "bg-yellow-500";
      return "bg-red-500";
    } else {
      if (value > 80) return "bg-green-500";
      if (value > 60) return "bg-yellow-500";
      return "bg-red-500";
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}j ${hours}h ${minutes}m`;
  };

  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Métriques indisponibles</h3>
          <p className="text-gray-500 mb-4">Impossible de récupérer les métriques système</p>
          <Button onClick={loadMetrics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-600" />
            Santé du Système
          </h2>
          <p className="text-gray-600">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </p>
        </div>
        <Button onClick={loadMetrics} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Server Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                Serveur
              </div>
              {getStatusBadge(metrics.server.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Uptime</span>
                <span className="font-medium">{formatUptime(metrics.server.uptime)}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU</span>
                <span>{metrics.server.cpuUsage}%</span>
              </div>
              <Progress 
                value={metrics.server.cpuUsage} 
                className={`h-2 ${getProgressColor(metrics.server.cpuUsage, 'usage')}`}
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Mémoire</span>
                <span>{metrics.server.memoryUsage}%</span>
              </div>
              <Progress 
                value={metrics.server.memoryUsage} 
                className={`h-2 ${getProgressColor(metrics.server.memoryUsage, 'usage')}`}
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disque</span>
                <span>{metrics.server.diskUsage}%</span>
              </div>
              <Progress 
                value={metrics.server.diskUsage} 
                className={`h-2 ${getProgressColor(metrics.server.diskUsage, 'usage')}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Base de Données
              </div>
              {getStatusBadge(metrics.database.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.database.queryTime}ms</div>
              <div className="text-xs text-gray-500">Temps de requête moyen</div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-semibold text-green-600">{metrics.database.connectionPool.active}</div>
                <div className="text-gray-500">Actives</div>
              </div>
              <div>
                <div className="font-semibold text-blue-600">{metrics.database.connectionPool.idle}</div>
                <div className="text-gray-500">Inactives</div>
              </div>
              <div>
                <div className="font-semibold text-gray-600">{metrics.database.connectionPool.total}</div>
                <div className="text-gray-500">Total</div>
              </div>
            </div>

            {metrics.database.slowQueries > 0 && (
              <div className="text-center text-xs text-orange-600">
                {metrics.database.slowQueries} requêtes lentes
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cache Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MemoryStick className="w-4 h-4" />
                Cache
              </div>
              {getStatusBadge(metrics.cache.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.cache.hitRate}%</div>
              <div className="text-xs text-gray-500">Taux de succès</div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Mémoire</span>
                <span>{metrics.cache.memoryUsage}%</span>
              </div>
              <Progress 
                value={metrics.cache.memoryUsage} 
                className={`h-2 ${getProgressColor(metrics.cache.memoryUsage, 'usage')}`}
              />
            </div>

            <div className="text-center text-xs text-gray-500">
              {metrics.cache.connections} connexions
            </div>
          </CardContent>
        </Card>

        {/* API Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                API
              </div>
              {getStatusBadge(metrics.api.errorRate < 1 ? 'healthy' : metrics.api.errorRate < 5 ? 'warning' : 'critical')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{metrics.api.responseTime}ms</div>
              <div className="text-xs text-gray-500">Temps de réponse</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <div className="font-semibold text-blue-600">{metrics.api.requestsPerMinute}</div>
                <div className="text-gray-500">Req/min</div>
              </div>
              <div>
                <div className="font-semibold text-red-600">{metrics.api.errorRate}%</div>
                <div className="text-gray-500">Erreurs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Endpoints Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            État des Points de Terminaison API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.api.endpoints.map((endpoint, index) => (
              <motion.div
                key={endpoint.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                    {endpoint.path}
                  </code>
                  {getStatusBadge(endpoint.status)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-3 h-3" />
                  {endpoint.avgResponseTime}ms
                  {endpoint.avgResponseTime < 200 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}