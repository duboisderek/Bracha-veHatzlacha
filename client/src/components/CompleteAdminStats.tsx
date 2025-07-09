import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Activity,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

interface AdminStats {
  payments: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalValue: string;
    last24h: number;
  };
  users: {
    total: number;
    active: number;
    new24h: number;
    withCrypto: number;
  };
  system: {
    uptime: string;
    lastSync: string;
    pendingActions: number;
    alerts: number;
  };
  trends: {
    paymentsGrowth: number;
    usersGrowth: number;
    valueGrowth: number;
  };
}

interface CompleteAdminStatsProps {
  onRefresh?: () => void;
}

export function CompleteAdminStats({ onRefresh }: CompleteAdminStatsProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats/complete', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadStats();
    onRefresh?.();
  };

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const formatTrend = (value: number) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tableau de Bord Administrateur</h2>
          <p className="text-gray-500 text-sm">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Paiements Total
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.payments.total}</div>
                  <div className="text-sm text-gray-500">{stats.payments.totalValue}</div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {getTrendIcon(stats.trends.paymentsGrowth)}
                  <span className={stats.trends.paymentsGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatTrend(stats.trends.paymentsGrowth)}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                +{stats.payments.last24h} dernières 24h
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                En Attente
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.payments.pending}
                </div>
                {stats.payments.pending > 0 && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    Action requise
                  </Badge>
                )}
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>{stats.payments.approved} approuvés</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  <span>{stats.payments.rejected} rejetés</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.users.total}</div>
                  <div className="text-sm text-gray-500">{stats.users.active} actifs</div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {getTrendIcon(stats.trends.usersGrowth)}
                  <span className={stats.trends.usersGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatTrend(stats.trends.usersGrowth)}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                +{stats.users.new24h} nouveaux aujourd'hui
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Système
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-green-600">Opérationnel</div>
                  <div className="text-sm text-gray-500">Uptime: {stats.system.uptime}</div>
                </div>
                {stats.system.alerts > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {stats.system.alerts}
                  </Badge>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Sync: {stats.system.lastSync}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Répartition des Paiements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Approuvés</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.payments.approved}</span>
                  <span className="text-gray-500 text-sm">
                    ({((stats.payments.approved / stats.payments.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">En attente</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.payments.pending}</span>
                  <span className="text-gray-500 text-sm">
                    ({((stats.payments.pending / stats.payments.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Rejetés</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.payments.rejected}</span>
                  <span className="text-gray-500 text-sm">
                    ({((stats.payments.rejected / stats.payments.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Engagement Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Utilisateurs avec crypto</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.users.withCrypto}</span>
                  <span className="text-gray-500 text-sm">
                    ({((stats.users.withCrypto / stats.users.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Utilisateurs actifs</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.users.active}</span>
                  <span className="text-gray-500 text-sm">
                    ({((stats.users.active / stats.users.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Croissance 24h</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">+{stats.users.new24h}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(stats.trends.usersGrowth)}
                    <span className={`text-sm ${stats.trends.usersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatTrend(stats.trends.usersGrowth)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {stats.system.pendingActions > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <span className="font-medium">Actions en attente:</span>
                <span className="ml-2">{stats.system.pendingActions} élément(s) nécessitent votre attention</span>
              </div>
              <Button variant="outline" size="sm">
                Voir les actions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}