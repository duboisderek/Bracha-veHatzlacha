import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Eye, 
  EyeOff, 
  QrCode, 
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';

interface SecuritySummary {
  twoFactorEnabled: boolean;
  lastLogin: string | null;
  loginAttempts: number;
  securityLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface SecurityEvent {
  id: string;
  event: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blocked: boolean;
}

export default function Security() {
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<{secret: string; qrCode: string} | null>(null);
  const { toast } = useToast();

  // Fetch security summary
  const { data: securitySummary, isLoading: loadingSummary } = useQuery<SecuritySummary>({
    queryKey: ['/api/security/summary'],
  });

  // Generate 2FA secret mutation
  const generate2FAMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/security/2fa/generate', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      setTwoFactorSecret(data);
      setShowQRCode(true);
      toast({
        title: "Secret 2FA généré",
        description: "Scannez le QR code avec votre application d'authentification.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le secret 2FA.",
        variant: "destructive",
      });
    },
  });

  // Enable 2FA mutation
  const enable2FAMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiRequest('/api/security/2fa/enable', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    },
    onSuccess: () => {
      toast({
        title: "2FA activé",
        description: "L'authentification à deux facteurs a été activée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/security/summary'] });
      setTwoFactorToken('');
      setShowQRCode(false);
      setTwoFactorSecret(null);
    },
    onError: (error: any) => {
      toast({
        title: "Échec de l'activation",
        description: error.message || "Code invalide. Vérifiez votre application d'authentification.",
        variant: "destructive",
      });
    },
  });

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleGenerate2FA = () => {
    generate2FAMutation.mutate();
  };

  const handleEnable2FA = () => {
    if (!twoFactorToken) {
      toast({
        title: "Code requis",
        description: "Veuillez saisir le code à 6 chiffres de votre application d'authentification.",
        variant: "destructive",
      });
      return;
    }

    enable2FAMutation.mutate(twoFactorToken);
  };

  if (loadingSummary) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Chargement des informations de sécurité...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Sécurité du Compte</h1>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Aperçu Sécurité</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getSecurityLevelIcon(securitySummary?.securityLevel || 'low')}
              </div>
              <div className="text-2xl font-bold mb-1">
                {securitySummary?.securityLevel === 'high' ? 'Élevé' : 
                 securitySummary?.securityLevel === 'medium' ? 'Moyen' : 'Faible'}
              </div>
              <div className="text-sm text-muted-foreground">Niveau de Sécurité</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {securitySummary?.twoFactorEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="text-2xl font-bold mb-1">
                {securitySummary?.twoFactorEnabled ? 'Activé' : 'Désactivé'}
              </div>
              <div className="text-sm text-muted-foreground">Authentification 2FA</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {securitySummary?.lastLogin ? 
                  new Date(securitySummary.lastLogin).toLocaleDateString('fr-FR') : 
                  'Jamais'
                }
              </div>
              <div className="text-sm text-muted-foreground">Dernière Connexion</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {securitySummary?.loginAttempts || 0}
              </div>
              <div className="text-sm text-muted-foreground">Tentatives Échouées</div>
            </div>
          </div>

          {/* Security Recommendations */}
          {securitySummary?.recommendations && securitySummary.recommendations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Recommandations de Sécurité:</h3>
              <div className="space-y-2">
                {securitySummary.recommendations.map((recommendation, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{recommendation}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Authentification à Deux Facteurs (2FA)</span>
          </CardTitle>
          <CardDescription>
            Ajoutez une couche de sécurité supplémentaire à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securitySummary?.twoFactorEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">L'authentification 2FA est activée</span>
                <Badge variant="outline" className="text-green-600">Sécurisé</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Votre compte est protégé par l'authentification à deux facteurs.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium">L'authentification 2FA n'est pas activée</span>
                <Badge variant="outline" className="text-red-600">Non sécurisé</Badge>
              </div>

              {!showQRCode ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Activez l'authentification à deux facteurs pour sécuriser votre compte.
                  </p>
                  <Button 
                    onClick={handleGenerate2FA}
                    disabled={generate2FAMutation.isPending}
                  >
                    {generate2FAMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2" />
                        Configurer 2FA
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">1. Scannez le QR Code</h4>
                      {twoFactorSecret?.qrCode && (
                        <div className="border rounded-lg p-4 text-center">
                          <img 
                            src={twoFactorSecret.qrCode} 
                            alt="QR Code 2FA" 
                            className="mx-auto w-48 h-48"
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Utilisez une app comme Google Authenticator ou Authy
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">2. Entrez le Code</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="2fa-token">Code à 6 chiffres</Label>
                          <Input
                            id="2fa-token"
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            value={twoFactorToken}
                            onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ''))}
                          />
                        </div>
                        <Button 
                          onClick={handleEnable2FA}
                          disabled={enable2FAMutation.isPending || !twoFactorToken}
                          className="w-full"
                        >
                          {enable2FAMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Activation...
                            </>
                          ) : (
                            <>
                              <Key className="h-4 w-4 mr-2" />
                              Activer 2FA
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Sauvegardez ce secret dans un endroit sûr: 
                      <code className="bg-muted px-1 py-0.5 rounded text-xs ml-1">
                        {twoFactorSecret?.secret}
                      </code>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Conseils de Sécurité</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Bonnes Pratiques:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Utilisez un mot de passe fort et unique</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Activez l'authentification à deux facteurs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Déconnectez-vous des appareils publics</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Vérifiez régulièrement l'activité de votre compte</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Évitez:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Partager vos identifiants de connexion</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Utiliser des réseaux WiFi publics non sécurisés</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Cliquer sur des liens suspects dans les emails</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Laisser votre session ouverte sur un appareil partagé</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}