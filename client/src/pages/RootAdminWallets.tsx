import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Wallet, 
  Bitcoin, 
  Coins,
  Copy,
  QrCode,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface CryptoWallet {
  currency: string;
  address: string;
  qrCode?: string;
  balance?: string;
  lastTransaction?: string;
}

interface WalletStats {
  totalValue: string;
  pendingTransactions: number;
  monthlyVolume: string;
}

export default function RootAdminWallets() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [stats, setStats] = useState<WalletStats>({
    totalValue: '0',
    pendingTransactions: 0,
    monthlyVolume: '0'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newWallet, setNewWallet] = useState({
    currency: '',
    address: ''
  });
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [backupData, setBackupData] = useState('');

  const supportedCurrencies = [
    { code: 'BTC', name: 'Bitcoin', icon: '₿', color: 'text-orange-500' },
    { code: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'text-blue-500' },
    { code: 'LTC', name: 'Litecoin', icon: 'Ł', color: 'text-gray-500' },
    { code: 'BCH', name: 'Bitcoin Cash', icon: '₿', color: 'text-green-500' },
    { code: 'XRP', name: 'Ripple', icon: '✗', color: 'text-blue-400' },
    { code: 'ADA', name: 'Cardano', icon: '₳', color: 'text-blue-600' }
  ];

  const loadWallets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/root-admin/wallets', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setWallets(data.wallets);
        setStats(data.stats);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les portefeuilles",
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
    loadWallets();
  }, []);

  const handleAddWallet = async () => {
    if (!newWallet.currency || !newWallet.address) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    // Validate address format
    if (!validateWalletAddress(newWallet.address, newWallet.currency)) {
      toast({
        title: "Adresse invalide",
        description: "Le format de l'adresse n'est pas valide pour cette crypto-monnaie",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/root-admin/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newWallet)
      });

      if (response.ok) {
        toast({
          title: "Portefeuille ajouté",
          description: `Portefeuille ${newWallet.currency} ajouté avec succès`,
        });
        setNewWallet({ currency: '', address: '' });
        loadWallets();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de l'ajout",
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
      setSaving(false);
    }
  };

  const handleUpdateWallet = async (currency: string, address: string) => {
    if (!validateWalletAddress(address, currency)) {
      toast({
        title: "Adresse invalide",
        description: "Le format de l'adresse n'est pas valide",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/root-admin/wallets/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currency, address })
      });

      if (response.ok) {
        toast({
          title: "Portefeuille mis à jour",
          description: `Adresse ${currency} mise à jour avec succès`,
        });
        loadWallets();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de la mise à jour",
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
      setSaving(false);
    }
  };

  const handleDeleteWallet = async (currency: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le portefeuille ${currency} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const response = await fetch('/api/root-admin/wallets/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currency })
      });

      if (response.ok) {
        toast({
          title: "Portefeuille supprimé",
          description: `Portefeuille ${currency} supprimé avec succès`,
        });
        loadWallets();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de la suppression",
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

  const validateWalletAddress = (address: string, currency: string): boolean => {
    const patterns = {
      BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
      ETH: /^0x[a-fA-F0-9]{40}$/,
      LTC: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$|^ltc1[a-z0-9]{39,59}$/,
      BCH: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bitcoincash:[a-z0-9]{42}$/,
      XRP: /^r[0-9a-zA-Z]{24,34}$/,
      ADA: /^addr1[a-z0-9]{98}$/
    };

    const pattern = patterns[currency as keyof typeof patterns];
    return pattern ? pattern.test(address) : true;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Adresse copiée dans le presse-papiers",
    });
  };

  const generateQRCode = (address: string, currency: string) => {
    // In a real implementation, you would generate a QR code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currency}:${address}`;
    window.open(qrUrl, '_blank');
  };

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/root-admin/wallets/backup', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBackupData(JSON.stringify(data, null, 2));
        
        // Download backup file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallet-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Sauvegarde créée",
          description: "Fichier de sauvegarde téléchargé avec succès",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive"
      });
    }
  };

  const handleRestore = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch('/api/root-admin/wallets/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: "Restauration réussie",
          description: "Portefeuilles restaurés avec succès",
        });
        loadWallets();
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
        description: "Fichier de sauvegarde invalide",
        variant: "destructive"
      });
    }
  };

  const getCurrencyInfo = (currency: string) => {
    return supportedCurrencies.find(c => c.code === currency) || {
      code: currency,
      name: currency,
      icon: '₳',
      color: 'text-gray-500'
    };
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
        <h1 className="text-3xl font-bold text-gray-900">Gestion Portefeuilles Crypto</h1>
        <div className="flex gap-2">
          <Button onClick={handleBackup} variant="outline">
            <Save className="w-4 h-4 mr-1" />
            Sauvegarde
          </Button>
          <Button
            onClick={() => setShowPrivateKeys(!showPrivateKeys)}
            variant="outline"
            className={showPrivateKeys ? "bg-red-50 text-red-600" : ""}
          >
            {showPrivateKeys ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showPrivateKeys ? "Masquer" : "Afficher"} clés
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">${stats.totalValue}</div>
            <div className="text-sm text-gray-500">Valeur totale</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingTransactions}</div>
            <div className="text-sm text-gray-500">Transactions en attente</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${stats.monthlyVolume}</div>
            <div className="text-sm text-gray-500">Volume mensuel</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Wallet */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter un portefeuille
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currency">Crypto-monnaie</Label>
              <select
                id="currency"
                value={newWallet.currency}
                onChange={(e) => setNewWallet(prev => ({ ...prev, currency: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sélectionner...</option>
                {supportedCurrencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.icon} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="address">Adresse du portefeuille</Label>
              <Input
                id="address"
                value={newWallet.address}
                onChange={(e) => setNewWallet(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Adresse publique du portefeuille"
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddWallet}
                disabled={saving}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                {saving ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Warning */}
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Sécurité des portefeuilles</h3>
              <p className="text-sm text-amber-700 mt-1">
                Ces adresses sont publiques et visibles par les clients. Ne partagez jamais vos clés privées.
                Effectuez régulièrement des sauvegardes et vérifiez les transactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wallets.map((wallet) => {
          const currencyInfo = getCurrencyInfo(wallet.currency);
          
          return (
            <motion.div
              key={wallet.currency}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl ${currencyInfo.color}`}>
                        {currencyInfo.icon}
                      </span>
                      <div>
                        <div>{currencyInfo.name}</div>
                        <div className="text-sm font-normal text-gray-500">
                          {wallet.currency}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generateQRCode(wallet.address, wallet.currency)}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedWallet(wallet)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWallet(wallet.currency)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">Adresse publique</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-100 px-2 py-1 rounded text-xs font-mono break-all">
                        {showPrivateKeys ? wallet.address : `${wallet.address.substring(0, 8)}...${wallet.address.substring(-8)}`}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(wallet.address)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {wallet.balance && (
                    <div>
                      <Label className="text-xs text-gray-500">Solde estimé</Label>
                      <div className="font-bold text-lg">
                        {wallet.balance} {wallet.currency}
                      </div>
                    </div>
                  )}

                  {wallet.lastTransaction && (
                    <div>
                      <Label className="text-xs text-gray-500">Dernière transaction</Label>
                      <div className="text-sm text-gray-600">
                        {new Date(wallet.lastTransaction).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {wallets.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun portefeuille configuré
            </h3>
            <p className="text-gray-500 mb-4">
              Ajoutez votre premier portefeuille crypto pour commencer à recevoir des paiements.
            </p>
          </div>
        )}
      </div>

      {/* Wallet Detail Modal */}
      {selectedWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  Détails du portefeuille {selectedWallet.currency}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedWallet(null)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Adresse complète</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-3 rounded font-mono text-sm break-all">
                      {selectedWallet.address}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedWallet.address)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => generateQRCode(selectedWallet.address, selectedWallet.currency)}
                    className="flex-1"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Générer QR Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://blockchair.com/${selectedWallet.currency.toLowerCase()}/address/${selectedWallet.address}`, '_blank')}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Explorer blockchain
                  </Button>
                </div>

                <div>
                  <Label>Modifier l'adresse</Label>
                  <div className="flex gap-2">
                    <Input
                      defaultValue={selectedWallet.address}
                      className="font-mono text-sm"
                      id="updateAddress"
                    />
                    <Button
                      onClick={() => {
                        const input = document.getElementById('updateAddress') as HTMLInputElement;
                        if (input) {
                          handleUpdateWallet(selectedWallet.currency, input.value);
                        }
                      }}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Restore Input */}
      <input
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleRestore(file);
          }
        }}
        className="hidden"
        id="restore-input"
      />
    </div>
  );
}