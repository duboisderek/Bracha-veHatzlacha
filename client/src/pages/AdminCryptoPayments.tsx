import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { CryptoPaymentDetailDialog } from "@/components/CryptoPaymentDetailDialog";
import { AdvancedSearchFilter } from "@/components/AdvancedSearchFilter";
import { CompleteAdminStats } from "@/components/CompleteAdminStats";
import { 
  Wallet, 
  Check, 
  X, 
  Clock, 
  Search, 
  Filter,
  Eye,
  ExternalLink,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  BarChart3,
  Users,
  DollarSign,
  TrendingUp
} from "lucide-react";

interface CryptoPayment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: string;
  currency: string;
  txHash: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  adminNotes?: string;
  rejectionReason?: string;
}

interface FilterOptions {
  searchTerm: string;
  status: 'all' | 'pending' | 'approved' | 'rejected';
  currency: string;
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: string;
  amountMax?: string;
}

export default function AdminCryptoPayments() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [payments, setPayments] = useState<CryptoPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<CryptoPayment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("payments");
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    status: 'pending',
    currency: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    amountMin: '',
    amountMax: ''
  });

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/crypto-payments', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les paiements",
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
    loadPayments();
  }, []);

  const handleApprovePayment = async (paymentId: string, notes: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/crypto-payments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          paymentId, 
          notes 
        })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Paiement approuvé avec succès",
        });
        setShowDetailDialog(false);
        setSelectedPayment(null);
        loadPayments();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de l'approbation",
          variant: "destructive"
        });
        throw new Error(errorData.message);
      }
    } catch (error) {
      if (!(error as Error).message.includes('lors de l\'approbation')) {
        toast({
          title: "Erreur",
          description: "Erreur de connexion",
          variant: "destructive"
        });
      }
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async (paymentId: string, reason: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/crypto-payments/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          paymentId, 
          reason 
        })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Paiement rejeté",
        });
        setShowDetailDialog(false);
        setSelectedPayment(null);
        loadPayments();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors du rejet",
          variant: "destructive"
        });
        throw new Error(errorData.message);
      }
    } catch (error) {
      if (!(error as Error).message.includes('lors du rejet')) {
        toast({
          title: "Erreur",
          description: "Erreur de connexion",
          variant: "destructive"
        });
      }
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: CryptoPayment['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approuvé
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </Badge>
        );
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency.toUpperCase()) {
      case 'BTC':
        return '₿';
      case 'ETH':
        return 'Ξ';
      case 'LTC':
        return 'Ł';
      case 'USDT':
      case 'USDC':
        return '$';
      default:
        return '₳';
    }
  };

  const applyFilters = (payments: CryptoPayment[]): CryptoPayment[] => {
    return payments.filter(payment => {
      // Search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matches = 
          payment.userEmail.toLowerCase().includes(searchLower) ||
          payment.userName.toLowerCase().includes(searchLower) ||
          payment.txHash.toLowerCase().includes(searchLower) ||
          payment.currency.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      // Status filter
      if (filters.status !== 'all' && payment.status !== filters.status) {
        return false;
      }

      // Currency filter
      if (filters.currency !== 'all' && payment.currency !== filters.currency) {
        return false;
      }

      // Date filters
      if (filters.dateFrom) {
        const paymentDate = new Date(payment.submittedAt);
        if (paymentDate < filters.dateFrom) return false;
      }

      if (filters.dateTo) {
        const paymentDate = new Date(payment.submittedAt);
        if (paymentDate > filters.dateTo) return false;
      }

      // Amount filters
      if (filters.amountMin) {
        const amount = parseFloat(payment.amount);
        if (amount < parseFloat(filters.amountMin)) return false;
      }

      if (filters.amountMax) {
        const amount = parseFloat(payment.amount);
        if (amount > parseFloat(filters.amountMax)) return false;
      }

      return true;
    });
  };

  const filteredPayments = applyFilters(payments);

  const handleOpenDetail = (payment: CryptoPayment) => {
    setSelectedPayment(payment);
    setShowDetailDialog(true);
  };

  const exportPayments = () => {
    const csvContent = [
      ['ID', 'Utilisateur', 'Email', 'Montant', 'Devise', 'Statut', 'Date', 'Hash TX'].join(','),
      ...filteredPayments.map(payment => [
        payment.id,
        payment.userName,
        payment.userEmail,
        payment.amount,
        payment.currency,
        payment.status,
        new Date(payment.submittedAt).toLocaleDateString('fr-FR'),
        payment.txHash
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paiements-crypto-${new Date().toISOString().split('T')[0]}.csv`;
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
            <Wallet className="w-8 h-8 text-blue-600" />
            Administration Crypto
          </h1>
          <p className="text-gray-600 mt-1">
            Gestion complète des paiements en cryptomonnaies
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportPayments} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
          <Button onClick={loadPayments} variant="outline" className="gap-2">
            <Eye className="w-4 h-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Tableau de Bord
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Paiements
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <CompleteAdminStats onRefresh={loadPayments} />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          {/* Advanced Search */}
          <AdvancedSearchFilter
            filters={filters}
            onFiltersChange={setFilters}
            totalItems={payments.length}
            filteredItems={filteredPayments.length}
          />

          {/* Payments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Paiements Crypto ({filteredPayments.length})
                </span>
                <div className="flex gap-2">
                  {filters.status === 'pending' && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      {filteredPayments.filter(p => p.status === 'pending').length} en attente
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPayments.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paiement trouvé</h3>
                  <p className="text-gray-500">
                    {payments.length === 0 
                      ? "Aucun paiement crypto n'a été soumis pour le moment."
                      : "Aucun paiement ne correspond aux filtres sélectionnés."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {/* Header Row */}
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {getCurrencyIcon(payment.currency)}
                              </div>
                              <div>
                                <div className="font-semibold text-lg">{payment.userName}</div>
                                <div className="text-sm text-gray-500">{payment.userEmail}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-bold text-xl text-gray-900">
                                  {payment.amount} {payment.currency}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(payment.submittedAt).toLocaleString('fr-FR')}
                                </div>
                              </div>
                              {getStatusBadge(payment.status)}
                            </div>
                          </div>

                          {/* Transaction Details */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-medium text-gray-700">Transaction:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono border">
                              {payment.txHash.substring(0, 20)}...
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://blockchair.com/search?q=${payment.txHash}`, '_blank')}
                              className="h-6 px-2"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Notes & Rejection Reason */}
                          {payment.adminNotes && (
                            <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                              <span className="font-medium text-blue-800">Notes admin:</span>
                              <span className="text-blue-700 ml-2">{payment.adminNotes}</span>
                            </div>
                          )}

                          {payment.rejectionReason && (
                            <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
                              <span className="font-medium text-red-800">Rejet:</span>
                              <span className="text-red-700 ml-2">{payment.rejectionReason}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="ml-6 flex flex-col gap-2">
                          <Button
                            onClick={() => handleOpenDetail(payment)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Détails
                          </Button>

                          {payment.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleOpenDetail(payment)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white gap-1"
                              >
                                <Check className="w-4 h-4" />
                                Approuver
                              </Button>
                              <Button
                                onClick={() => handleOpenDetail(payment)}
                                variant="destructive"
                                size="sm"
                                className="gap-1"
                              >
                                <X className="w-4 h-4" />
                                Rejeter
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
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistiques par Statut
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['pending', 'approved', 'rejected'].map(status => {
                    const count = payments.filter(p => p.status === status).length;
                    const percentage = payments.length > 0 ? (count / payments.length * 100).toFixed(1) : '0';
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(status as any)}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{count}</div>
                          <div className="text-sm text-gray-500">({percentage}%)</div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                status === 'pending' ? 'bg-yellow-500' : 
                                status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Répartition par Devise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(payments.map(p => p.currency))).map(currency => {
                    const currencyPayments = payments.filter(p => p.currency === currency);
                    const count = currencyPayments.length;
                    const totalValue = currencyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                    const percentage = payments.length > 0 ? (count / payments.length * 100).toFixed(1) : '0';
                    
                    return (
                      <div key={currency} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getCurrencyIcon(currency)}</span>
                          <span className="font-medium">{currency}</span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <div className="font-medium">{count} paiements</div>
                            <div className="text-sm text-gray-500">{totalValue.toFixed(4)} {currency}</div>
                          </div>
                          <div className="text-sm text-gray-500">({percentage}%)</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <CryptoPaymentDetailDialog
        payment={selectedPayment}
        isOpen={showDetailDialog}
        onClose={() => {
          setShowDetailDialog(false);
          setSelectedPayment(null);
        }}
        onApprove={handleApprovePayment}
        onReject={handleRejectPayment}
        isProcessing={isProcessing}
      />
    </div>
  );
}