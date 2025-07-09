import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
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
  XCircle
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

export default function AdminCryptoPayments() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [payments, setPayments] = useState<CryptoPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<CryptoPayment | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleApprovePayment = async (paymentId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/crypto-payments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentId, notes: actionNotes })
      });

      if (response.ok) {
        toast({
          title: "Paiement approuvé",
          description: "Le paiement a été approuvé et le solde utilisateur mis à jour",
        });
        loadPayments();
        setSelectedPayment(null);
        setActionNotes("");
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de l'approbation",
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

  const handleRejectPayment = async (paymentId: string) => {
    if (!actionNotes.trim()) {
      toast({
        title: "Raison requise",
        description: "Veuillez indiquer la raison du rejet",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/crypto-payments/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentId, reason: actionNotes })
      });

      if (response.ok) {
        toast({
          title: "Paiement rejeté",
          description: "Le paiement a été rejeté",
        });
        loadPayments();
        setSelectedPayment(null);
        setActionNotes("");
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors du rejet",
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
      default:
        return '₳';
    }
  };

  const filteredPayments = payments
    .filter(payment => filter === 'all' || payment.status === filter)
    .filter(payment => 
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.currency.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const approvedCount = payments.filter(p => p.status === 'approved').length;
  const rejectedCount = payments.filter(p => p.status === 'rejected').length;

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
        <h1 className="text-3xl font-bold text-gray-900">Gestion Paiements Crypto</h1>
        <Button onClick={loadPayments} variant="outline">
          Actualiser
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-gray-500">En attente</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-sm text-gray-500">Approuvés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <div className="text-sm text-gray-500">Rejetés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{payments.length}</div>
            <div className="text-sm text-gray-500">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Email, nom, hash de transaction, devise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filter">Statut</Label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tous</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Paiements Crypto ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun paiement trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getCurrencyIcon(payment.currency)}</span>
                          <div>
                            <div className="font-medium">{payment.userName}</div>
                            <div className="text-sm text-gray-500">{payment.userEmail}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{payment.amount} {payment.currency}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(payment.submittedAt).toLocaleString('fr-FR')}
                          </div>
                        </div>
                        {getStatusBadge(payment.status)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">TX Hash:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          {payment.txHash.substring(0, 16)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://blockchair.com/search?q=${payment.txHash}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>

                      {payment.adminNotes && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <span className="font-medium">Notes admin:</span> {payment.adminNotes}
                        </div>
                      )}

                      {payment.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                          <span className="font-medium">Raison du rejet:</span> {payment.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Détails
                      </Button>

                      {payment.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setActionNotes("");
                            }}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setActionNotes("");
                            }}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Détails du Paiement</h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedPayment(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Utilisateur</Label>
                    <div className="font-medium">{selectedPayment.userName}</div>
                    <div className="text-sm text-gray-500">{selectedPayment.userEmail}</div>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <div>{getStatusBadge(selectedPayment.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Montant</Label>
                    <div className="font-bold text-lg">
                      {selectedPayment.amount} {selectedPayment.currency}
                    </div>
                  </div>
                  <div>
                    <Label>Date de soumission</Label>
                    <div>{new Date(selectedPayment.submittedAt).toLocaleString('fr-FR')}</div>
                  </div>
                </div>

                <div>
                  <Label>Hash de Transaction</Label>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-3 py-2 rounded font-mono text-sm flex-1">
                      {selectedPayment.txHash}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://blockchair.com/search?q=${selectedPayment.txHash}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Vérifier
                    </Button>
                  </div>
                </div>

                {selectedPayment.status === 'pending' && (
                  <div className="border-t pt-4">
                    <Label htmlFor="actionNotes">Notes pour cette action</Label>
                    <Textarea
                      id="actionNotes"
                      placeholder="Notes optionnelles pour l'approbation ou raison du rejet..."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      className="mt-1"
                    />

                    <div className="flex gap-4 mt-4">
                      <Button
                        onClick={() => handleApprovePayment(selectedPayment.id)}
                        disabled={isProcessing}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {isProcessing ? "Traitement..." : "Approuver"}
                      </Button>
                      <Button
                        onClick={() => handleRejectPayment(selectedPayment.id)}
                        disabled={isProcessing}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {isProcessing ? "Traitement..." : "Rejeter"}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedPayment.processedAt && (
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-500">
                      Traité le {new Date(selectedPayment.processedAt).toLocaleString('fr-FR')}
                      {selectedPayment.processedBy && ` par ${selectedPayment.processedBy}`}
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