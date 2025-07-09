import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  X, 
  Check, 
  ExternalLink, 
  Copy, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  User,
  Calendar,
  FileText
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

interface CryptoPaymentDetailDialogProps {
  payment: CryptoPayment | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (paymentId: string, notes: string) => Promise<void>;
  onReject: (paymentId: string, reason: string) => Promise<void>;
  isProcessing: boolean;
}

export function CryptoPaymentDetailDialog({
  payment,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isProcessing
}: CryptoPaymentDetailDialogProps) {
  const { toast } = useToast();
  const [actionNotes, setActionNotes] = useState("");
  const [showActionForm, setShowActionForm] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  if (!payment) return null;

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié",
        description: "Hash de transaction copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papiers",
        variant: "destructive"
      });
    }
  };

  const handleAction = async () => {
    if (actionType === 'reject' && !actionNotes.trim()) {
      toast({
        title: "Erreur",
        description: "Une raison est requise pour rejeter le paiement",
        variant: "destructive"
      });
      return;
    }

    try {
      if (actionType === 'approve') {
        await onApprove(payment.id, actionNotes);
      } else {
        await onReject(payment.id, actionNotes);
      }
      setShowActionForm(false);
      setActionNotes("");
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Détails du Paiement Crypto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Alert */}
          {payment.status === 'pending' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Ce paiement nécessite votre validation. Vérifiez la transaction sur la blockchain avant d'approuver.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-blue-500" />
                  <Label className="font-semibold">Informations Utilisateur</Label>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Nom:</span>
                    <div className="font-medium">{payment.userName}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <div className="font-medium">{payment.userEmail}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">ID Utilisateur:</span>
                    <div className="font-mono text-sm">{payment.userId}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-green-500" />
                  <Label className="font-semibold">Détails du Paiement</Label>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Montant:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCurrencyIcon(payment.currency)}</span>
                      <span className="font-bold text-xl">{payment.amount} {payment.currency}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Statut:</span>
                    <div className="mt-1">{getStatusBadge(payment.status)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-purple-500" />
              <Label className="font-semibold">Hash de Transaction</Label>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-white border px-3 py-2 rounded font-mono text-sm flex-1 break-all">
                {payment.txHash}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(payment.txHash)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://blockchair.com/search?q=${payment.txHash}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                Vérifier
              </Button>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-500" />
              <Label className="font-semibold">Historique</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Date de soumission:</span>
                <div className="font-medium">{new Date(payment.submittedAt).toLocaleString('fr-FR')}</div>
              </div>
              {payment.processedAt && (
                <div>
                  <span className="text-sm text-gray-500">Date de traitement:</span>
                  <div className="font-medium">{new Date(payment.processedAt).toLocaleString('fr-FR')}</div>
                </div>
              )}
              {payment.processedBy && (
                <div>
                  <span className="text-sm text-gray-500">Traité par:</span>
                  <div className="font-medium">{payment.processedBy}</div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes & Rejection Reason */}
          {(payment.adminNotes || payment.rejectionReason) && (
            <div className="space-y-3">
              {payment.adminNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Label className="font-semibold text-blue-700">Notes administrateur:</Label>
                  <p className="text-blue-700 mt-1">{payment.adminNotes}</p>
                </div>
              )}
              {payment.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <Label className="font-semibold text-red-700">Raison du rejet:</Label>
                  <p className="text-red-700 mt-1">{payment.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Form */}
          {payment.status === 'pending' && (
            <div className="border-t pt-4">
              {!showActionForm ? (
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setActionType('approve');
                      setShowActionForm(true);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approuver le paiement
                  </Button>
                  <Button
                    onClick={() => {
                      setActionType('reject');
                      setShowActionForm(true);
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeter le paiement
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Label className="font-semibold">
                      {actionType === 'approve' ? 'Notes pour l\'approbation' : 'Raison du rejet'} 
                      {actionType === 'reject' && <span className="text-red-500"> *</span>}
                    </Label>
                    <Textarea
                      placeholder={
                        actionType === 'approve' 
                          ? "Notes optionnelles pour l'approbation..." 
                          : "Expliquez pourquoi ce paiement est rejeté (obligatoire)..."
                      }
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAction}
                      disabled={isProcessing || (actionType === 'reject' && !actionNotes.trim())}
                      className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                    >
                      {isProcessing ? "Traitement..." : (actionType === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet')}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowActionForm(false);
                        setActionNotes("");
                      }}
                      variant="outline"
                      disabled={isProcessing}
                    >
                      Annuler
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}