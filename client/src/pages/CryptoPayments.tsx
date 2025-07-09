import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Bitcoin, 
  Coins, 
  Copy, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface CryptoWallet {
  currency: string;
  address: string;
  qrCode?: string;
}

interface CryptoPayment {
  id: string;
  amount: string;
  currency: string;
  txHash: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  processedAt?: string;
  adminNotes?: string;
}

export default function CryptoPayments() {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const { toast } = useToast();

  // Fetch admin wallet addresses
  const { data: wallets, isLoading: loadingWallets } = useQuery({
    queryKey: ['/api/payments/wallets'],
  });

  // Fetch user's payment history
  const { data: paymentHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['/api/payments/crypto/history'],
  });

  // Submit crypto payment mutation
  const submitPaymentMutation = useMutation({
    mutationFn: async (data: { amount: string; txHash: string; currency: string }) => {
      return apiRequest('/api/payments/crypto', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Paiement soumis avec succès",
        description: "Votre paiement crypto est en attente d'approbation par l'admin.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/crypto/history'] });
      setAmount('');
      setTxHash('');
      setSelectedCurrency('');
    },
    onError: (error: any) => {
      toast({
        title: "Erreur lors de la soumission",
        description: error.message || "Une erreur est survenue lors de la soumission du paiement.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "L'adresse a été copiée dans le presse-papiers.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCurrency || !amount || !txHash) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) < 100) {
      toast({
        title: "Montant minimum",
        description: "Le montant minimum de dépôt est de ₪100.",
        variant: "destructive",
      });
      return;
    }

    submitPaymentMutation.mutate({
      amount,
      txHash,
      currency: selectedCurrency
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  if (loadingWallets) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Chargement des adresses de portefeuille...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Wallet className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Paiements Crypto</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bitcoin className="h-5 w-5" />
              <span>Nouveau Paiement Crypto</span>
            </CardTitle>
            <CardDescription>
              Soumettez un paiement cryptocurrency pour créditer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currency">Cryptocurrency</Label>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une crypto" />
                  </SelectTrigger>
                  <SelectContent>
                    {(wallets || []).map((wallet: CryptoWallet) => (
                      <SelectItem key={wallet.currency} value={wallet.currency}>
                        {wallet.currency.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Montant (₪)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  min="100"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Montant minimum: ₪100
                </p>
              </div>

              <div>
                <Label htmlFor="txHash">Hash de Transaction</Label>
                <Input
                  id="txHash"
                  placeholder="0x1234567890abcdef..."
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Copiez le hash de transaction de votre wallet
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitPaymentMutation.isPending || !selectedCurrency || !amount || !txHash}
              >
                {submitPaymentMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Soumission...</span>
                  </div>
                ) : (
                  'Soumettre le Paiement'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Wallet Addresses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="h-5 w-5" />
              <span>Adresses de Paiement</span>
            </CardTitle>
            <CardDescription>
              Envoyez vos paiements crypto à ces adresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(wallets || []).map((wallet: CryptoWallet) => (
              <div key={wallet.currency} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{wallet.currency.toUpperCase()}</h3>
                  <Badge variant="outline">{wallet.currency}</Badge>
                </div>
                <div className="bg-muted p-3 rounded text-sm font-mono break-all">
                  {wallet.address}
                </div>
                <div className="flex space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(wallet.address)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://blockchain.info/address/${wallet.address}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Explorer
                  </Button>
                </div>
              </div>
            ))}

            {(!wallets || wallets.length === 0) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Aucune adresse de portefeuille configurée. Contactez l'administrateur.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Paiements</CardTitle>
          <CardDescription>
            Vos paiements crypto précédents et leur statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Chargement de l'historique...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {(paymentHistory || []).map((payment: CryptoPayment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <span className="font-semibold">₪{payment.amount}</span>
                      <Badge variant="secondary">{payment.currency.toUpperCase()}</Badge>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Transaction Hash:</span>
                      <div className="font-mono text-xs break-all bg-muted p-2 rounded mt-1">
                        {payment.txHash}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Soumis le:</span>
                      <div>{new Date(payment.submittedAt).toLocaleString('fr-FR')}</div>
                      
                      {payment.processedAt && (
                        <div className="mt-2">
                          <span className="text-muted-foreground">Traité le:</span>
                          <div>{new Date(payment.processedAt).toLocaleString('fr-FR')}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {payment.adminNotes && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-muted-foreground text-sm">Notes admin:</span>
                      <div className="text-sm mt-1">{payment.adminNotes}</div>
                    </div>
                  )}
                </div>
              ))}

              {(!paymentHistory || paymentHistory.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun paiement crypto soumis pour le moment.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions de Paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Envoyez le Paiement</h3>
              <p className="text-sm text-muted-foreground">
                Envoyez votre cryptocurrency à l'adresse correspondante
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Soumettez la Preuve</h3>
              <p className="text-sm text-muted-foreground">
                Remplissez le formulaire avec le hash de transaction
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Attendez l'Approbation</h3>
              <p className="text-sm text-muted-foreground">
                L'admin vérifiera et approuvera votre paiement
              </p>
            </div>
          </div>

          <Separator />

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Assurez-vous d'envoyer uniquement la cryptocurrency 
              sélectionnée à l'adresse correspondante. Les envois vers de mauvaises adresses 
              ou avec de mauvaises cryptocurrencies ne peuvent pas être récupérés.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}