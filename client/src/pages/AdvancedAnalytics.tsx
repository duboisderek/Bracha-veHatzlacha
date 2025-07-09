import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Activity,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdvancedAnalytics() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Fetch all analytics data
  const { data: userBehavior, isLoading: loadingUserBehavior } = useQuery({
    queryKey: ['/api/analytics/user-behavior'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: revenueData, isLoading: loadingRevenue } = useQuery({
    queryKey: ['/api/analytics/revenue'],
    refetchInterval: 60000,
  });

  const { data: drawData, isLoading: loadingDraws } = useQuery({
    queryKey: ['/api/analytics/draws'],
    refetchInterval: 60000,
  });

  const { data: conversionData, isLoading: loadingConversion } = useQuery({
    queryKey: ['/api/analytics/conversion-rates'],
    refetchInterval: 60000,
  });

  const { data: detailedReport, isLoading: loadingReport } = useQuery({
    queryKey: ['/api/analytics/detailed-reports', dateRange.from, dateRange.to],
    enabled: !!dateRange.from && !!dateRange.to,
  });

  const exportReport = () => {
    if (detailedReport) {
      const dataStr = JSON.stringify(detailedReport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const isLoading = loadingUserBehavior || loadingRevenue || loadingDraws || loadingConversion;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement des analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Avancées</h1>
          <p className="text-muted-foreground">
            Tableau de bord complet des performances de la plateforme
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBehavior?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{userBehavior?.newUsersToday || 0} aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{revenueData?.totalRevenue?.toFixed(0) || 0}</div>
            <p className="text-xs text-muted-foreground">
              ₪{revenueData?.dailyRevenue?.toFixed(0) || 0}/jour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversionData?.registrationToFirstTicket?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Registration → Premier ticket
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tirages Actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drawData?.totalDraws || 0}</div>
            <p className="text-xs text-muted-foreground">
              {drawData?.completedDraws || 0} complétés
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="draws">Tirages</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition Géographique</CardTitle>
                <CardDescription>Top pays des utilisateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userBehavior?.topCountries || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ country, users }) => `${country}: ${users}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="users"
                    >
                      {(userBehavior?.topCountries || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métriques d'Engagement</CardTitle>
                <CardDescription>Activité utilisateur</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Utilisateurs Actifs</span>
                    <span>{userBehavior?.activeUsers || 0}/{userBehavior?.totalUsers || 0}</span>
                  </div>
                  <Progress 
                    value={userBehavior ? (userBehavior.activeUsers / userBehavior.totalUsers * 100) : 0} 
                    className="mt-2" 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Taux de Conversion</span>
                    <span>{userBehavior?.conversionRate?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={userBehavior?.conversionRate || 0} className="mt-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span>Temps Session Moyen</span>
                    <span>{userBehavior?.averageSessionTime || 0} min</span>
                  </div>
                  <Progress 
                    value={userBehavior ? (userBehavior.averageSessionTime / 60 * 100) : 0} 
                    className="mt-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sources de Revenus</CardTitle>
                <CardDescription>Répartition par type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData?.revenueBySource || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₪${value}`, 'Montant']} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Méthodes de Paiement</CardTitle>
                <CardDescription>Répartition des dépôts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(revenueData?.paymentMethodBreakdown || []).map((method, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm">
                        <span>{method.method}</span>
                        <span>₪{method.amount.toFixed(0)} ({method.percentage}%)</span>
                      </div>
                      <Progress value={method.percentage} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Métriques Financières</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₪{revenueData?.monthlyRevenue?.toFixed(0) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Revenus Mensuels</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ₪{revenueData?.averageTicketValue?.toFixed(0) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Ticket Moyen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ₪{revenueData?.dailyRevenue?.toFixed(0) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Revenus Quotidiens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    ₪{revenueData?.totalRevenue?.toFixed(0) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Revenus</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draws" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Numéros Populaires</CardTitle>
                <CardDescription>Les plus tirés</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={drawData?.popularNumbers?.slice(0, 10) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="number" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribution des Gagnants</CardTitle>
                <CardDescription>Par nombre de correspondances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(drawData?.winnerDistribution || []).map((winner, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{winner.matchCount} numéros</Badge>
                        <span>{winner.winners} gagnants</span>
                      </div>
                      <span className="font-semibold">₪{winner.totalWinnings.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Évolution des Jackpots</CardTitle>
              <CardDescription>Derniers tirages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={drawData?.jackpotTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₪${value}`, 'Jackpot']} />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Entonnoir de Conversion</CardTitle>
                <CardDescription>Étapes utilisateur</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Inscription → Premier Ticket</span>
                    <span>{conversionData?.registrationToFirstTicket?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={conversionData?.registrationToFirstTicket || 0} className="mt-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span>Premier → Deuxième Ticket</span>
                    <span>{conversionData?.firstTicketToSecondTicket?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={conversionData?.firstTicketToSecondTicket || 0} className="mt-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span>Ticket → Parrainage</span>
                    <span>{conversionData?.ticketToReferral?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={conversionData?.ticketToReferral || 0} className="mt-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span>Conversion Dépôt</span>
                    <span>{conversionData?.depositConversion?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={conversionData?.depositConversion || 0} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taux de Rétention</CardTitle>
                <CardDescription>Fidélisation utilisateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {conversionData?.retentionRates?.day1 || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Jour 1</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {conversionData?.retentionRates?.day7 || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Jour 7</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {conversionData?.retentionRates?.day30 || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Jour 30</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}