import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Trophy, Users, DollarSign, Target } from 'lucide-react';

interface Draw {
  id: number;
  drawNumber: number;
  drawDate: string;
  isCompleted: boolean;
  winningNumbers: number[] | null;
  jackpot: string;
}

interface DrawStats {
  totalTickets: number;
  totalJackpot: string;
  winners: Array<{
    matchCount: number;
    count: number;
    totalWinnings: string;
  }>;
}

interface DrawWinner {
  matchCount: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  winningAmount: string;
  numbers: number[];
}

export default function AdminDrawStatistics() {
  const [selectedDrawId, setSelectedDrawId] = useState<number | null>(null);
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const [manualNumbers, setManualNumbers] = useState<string>('');

  // Fetch all draws
  const { data: draws } = useQuery({
    queryKey: ['/api/draws/all'],
    select: (data) => data as Draw[]
  });

  // Fetch draw statistics
  const { data: drawStats } = useQuery({
    queryKey: ['/api/draws', selectedDrawId, 'stats'],
    enabled: !!selectedDrawId,
    select: (data) => data as DrawStats
  });

  // Fetch draw winners
  const { data: drawWinners } = useQuery({
    queryKey: ['/api/draws', selectedDrawId, 'winners'],
    enabled: !!selectedDrawId,
    select: (data) => data as DrawWinner[]
  });

  const currentDraw = draws?.find(d => d.id === selectedDrawId);
  const completedDraws = draws?.filter(d => d.isCompleted) || [];

  const handleExecuteDraw = async () => {
    if (!selectedDrawId || winningNumbers.length !== 6) return;

    try {
      const response = await fetch(`/api/admin/draws/${selectedDrawId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winningNumbers })
      });

      if (response.ok) {
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error executing draw:', error);
    }
  };

  const handleManualNumbersChange = (value: string) => {
    setManualNumbers(value);
    const numbers = value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 37);
    setWinningNumbers(numbers.slice(0, 6));
  };

  const generateRandomNumbers = () => {
    const numbers = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 37) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    numbers.sort((a, b) => a - b);
    setWinningNumbers(numbers);
    setManualNumbers(numbers.join(', '));
  };

  // Chart data for winners distribution
  const winnersChartData = drawStats?.winners.map(w => ({
    name: `${w.matchCount} numéros`,
    count: w.count,
    winnings: parseFloat(w.totalWinnings)
  })) || [];

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Participation history chart data
  const participationData = completedDraws.slice(-10).map(draw => ({
    drawNumber: draw.drawNumber,
    jackpot: parseFloat(draw.jackpot || '0')
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold">Statistiques des Tirages</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Draw Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Sélection du Tirage</CardTitle>
            <CardDescription>
              Choisissez un tirage pour voir les statistiques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="drawSelect">Tirage</Label>
              <Select
                value={selectedDrawId?.toString() || ''}
                onValueChange={(value) => setSelectedDrawId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un tirage" />
                </SelectTrigger>
                <SelectContent>
                  {draws?.map((draw) => (
                    <SelectItem key={draw.id} value={draw.id.toString()}>
                      #{draw.drawNumber} - {new Date(draw.drawDate).toLocaleDateString('fr-FR')}
                      {draw.isCompleted && <Badge className="ml-2" variant="secondary">Terminé</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentDraw && !currentDraw.isCompleted && (
              <div className="space-y-4 p-4 border rounded-lg bg-amber-50">
                <h4 className="font-medium text-amber-800">Exécution du Tirage</h4>
                <div>
                  <Label htmlFor="manualNumbers">Numéros gagnants (1-37)</Label>
                  <Input
                    id="manualNumbers"
                    value={manualNumbers}
                    onChange={(e) => handleManualNumbersChange(e.target.value)}
                    placeholder="1, 5, 12, 23, 30, 37"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Séparez les numéros par des virgules
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={generateRandomNumbers}
                    variant="outline"
                    size="sm"
                  >
                    Aléatoire
                  </Button>
                  <Button
                    onClick={handleExecuteDraw}
                    disabled={winningNumbers.length !== 6}
                    size="sm"
                  >
                    Exécuter
                  </Button>
                </div>
                {winningNumbers.length > 0 && (
                  <div className="flex gap-1">
                    {winningNumbers.map((num, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full bg-amber-600 text-white text-sm flex items-center justify-center font-bold"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Draw Overview */}
        {currentDraw && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tirage #{currentDraw.drawNumber}
              </CardTitle>
              <CardDescription>
                {new Date(currentDraw.drawDate).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {drawStats?.totalTickets || 0}
                  </div>
                  <div className="text-sm text-gray-600">Tickets vendus</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₪{currentDraw.jackpot || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Jackpot</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {drawStats?.winners.reduce((sum, w) => sum + w.count, 0) || 0}
                  </div>
                  <div className="text-sm text-gray-600">Gagnants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    ₪{drawStats?.winners.reduce((sum, w) => sum + parseFloat(w.totalWinnings), 0).toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-gray-600">Total gains</div>
                </div>
              </div>

              {currentDraw.winningNumbers && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Numéros gagnants</h4>
                  <div className="flex gap-2">
                    {currentDraw.winningNumbers.map((num, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold flex items-center justify-center text-lg shadow-lg"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Statistics Charts */}
      {drawStats && selectedDrawId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Winners Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Distribution des Gagnants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {winnersChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={winnersChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, count }) => `${name}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {winnersChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun gagnant pour ce tirage
                </div>
              )}
            </CardContent>
          </Card>

          {/* Jackpot History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Évolution du Jackpot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={participationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="drawNumber" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₪${value}`, 'Jackpot']} />
                  <Bar dataKey="jackpot" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Winners List */}
      {drawWinners && drawWinners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Liste des Gagnants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gagnant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Numéros joués</TableHead>
                  <TableHead>Numéros trouvés</TableHead>
                  <TableHead>Gain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drawWinners.map((winner, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {winner.user.firstName} {winner.user.lastName}
                    </TableCell>
                    <TableCell>{winner.user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {winner.numbers.map((num, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 rounded bg-gray-100 text-xs flex items-center justify-center"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={winner.matchCount >= 4 ? "default" : "secondary"}>
                        {winner.matchCount} numéros
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      ₪{winner.winningAmount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé Global</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {completedDraws.length}
              </div>
              <div className="text-sm text-blue-600">Tirages terminés</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ₪{completedDraws.reduce((sum, d) => sum + parseFloat(d.jackpot || '0'), 0).toFixed(0)}
              </div>
              <div className="text-sm text-green-600">Total jackpots</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {draws?.filter(d => !d.isCompleted).length || 0}
              </div>
              <div className="text-sm text-purple-600">Tirages actifs</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {Math.round(completedDraws.reduce((sum, d) => sum + parseFloat(d.jackpot || '0'), 0) / (completedDraws.length || 1))}
              </div>
              <div className="text-sm text-amber-600">Jackpot moyen</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}