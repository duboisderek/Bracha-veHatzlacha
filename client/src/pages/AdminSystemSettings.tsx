import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Settings, DollarSign, Clock, Shield, Save } from 'lucide-react';

interface SystemSettings {
  lottery: {
    ticketPrice: number;
    numbersPerTicket: number;
    numberRange: number;
    drawFrequency: string;
    jackpotStartAmount: number;
    maxTicketsPerUser: number;
  };
  security: {
    maxLoginAttempts: number;
    loginLockoutDuration: number;
    sessionTimeout: number;
    requireTwoFactor: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    winningNotifications: boolean;
  };
  payments: {
    minimumDeposit: number;
    maximumDeposit: number;
    cryptoEnabled: boolean;
    manualApprovalRequired: boolean;
  };
}

export default function AdminSystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState<SystemSettings>({
    lottery: {
      ticketPrice: 20,
      numbersPerTicket: 6,
      numberRange: 37,
      drawFrequency: 'weekly',
      jackpotStartAmount: 10000,
      maxTicketsPerUser: 10
    },
    security: {
      maxLoginAttempts: 5,
      loginLockoutDuration: 15,
      sessionTimeout: 60,
      requireTwoFactor: false
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      winningNotifications: true
    },
    payments: {
      minimumDeposit: 100,
      maximumDeposit: 10000,
      cryptoEnabled: true,
      manualApprovalRequired: true
    }
  });

  // Fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['/api/admin/system/settings'],
    onSuccess: (data) => {
      if (data) {
        setSettings(data);
      }
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: SystemSettings) => apiRequest('/api/admin/system/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres système ont été sauvegardés avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system/settings'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres.",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settings);
  };

  const updateLotterySettings = (key: keyof SystemSettings['lottery'], value: any) => {
    setSettings(prev => ({
      ...prev,
      lottery: { ...prev.lottery, [key]: value }
    }));
  };

  const updateSecuritySettings = (key: keyof SystemSettings['security'], value: any) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [key]: value }
    }));
  };

  const updateNotificationSettings = (key: keyof SystemSettings['notifications'], value: any) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const updatePaymentSettings = (key: keyof SystemSettings['payments'], value: any) => {
    setSettings(prev => ({
      ...prev,
      payments: { ...prev.payments, [key]: value }
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Paramètres Système</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lottery Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Paramètres de Loterie
              </CardTitle>
              <CardDescription>
                Configuration des règles du jeu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ticketPrice">Prix du ticket (₪)</Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  value={settings.lottery.ticketPrice}
                  onChange={(e) => updateLotterySettings('ticketPrice', Number(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <Label htmlFor="numbersPerTicket">Numéros par ticket</Label>
                <Input
                  id="numbersPerTicket"
                  type="number"
                  value={settings.lottery.numbersPerTicket}
                  onChange={(e) => updateLotterySettings('numbersPerTicket', Number(e.target.value))}
                  min="3"
                  max="10"
                />
              </div>

              <div>
                <Label htmlFor="numberRange">Plage de numéros (1 à...)</Label>
                <Input
                  id="numberRange"
                  type="number"
                  value={settings.lottery.numberRange}
                  onChange={(e) => updateLotterySettings('numberRange', Number(e.target.value))}
                  min="20"
                  max="50"
                />
              </div>

              <div>
                <Label htmlFor="jackpotStart">Jackpot de départ (₪)</Label>
                <Input
                  id="jackpotStart"
                  type="number"
                  value={settings.lottery.jackpotStartAmount}
                  onChange={(e) => updateLotterySettings('jackpotStartAmount', Number(e.target.value))}
                  min="1000"
                  step="1000"
                />
              </div>

              <div>
                <Label htmlFor="maxTickets">Max tickets par utilisateur</Label>
                <Input
                  id="maxTickets"
                  type="number"
                  value={settings.lottery.maxTicketsPerUser}
                  onChange={(e) => updateLotterySettings('maxTicketsPerUser', Number(e.target.value))}
                  min="1"
                  max="50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Paramètres de Sécurité
              </CardTitle>
              <CardDescription>
                Configuration de la sécurité du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxAttempts">Tentatives de connexion max</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => updateSecuritySettings('maxLoginAttempts', Number(e.target.value))}
                  min="3"
                  max="10"
                />
              </div>

              <div>
                <Label htmlFor="lockoutDuration">Durée de blocage (minutes)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  value={settings.security.loginLockoutDuration}
                  onChange={(e) => updateSecuritySettings('loginLockoutDuration', Number(e.target.value))}
                  min="5"
                  max="60"
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Timeout session (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSecuritySettings('sessionTimeout', Number(e.target.value))}
                  min="15"
                  max="480"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="require2fa">Exiger 2FA pour admins</Label>
                <Switch
                  id="require2fa"
                  checked={settings.security.requireTwoFactor}
                  onCheckedChange={(checked) => updateSecuritySettings('requireTwoFactor', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Paramètres de Notifications
              </CardTitle>
              <CardDescription>
                Configuration des notifications système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailEnabled">Notifications par email</Label>
                <Switch
                  id="emailEnabled"
                  checked={settings.notifications.emailEnabled}
                  onCheckedChange={(checked) => updateNotificationSettings('emailEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="smsEnabled">Notifications SMS</Label>
                <Switch
                  id="smsEnabled"
                  checked={settings.notifications.smsEnabled}
                  onCheckedChange={(checked) => updateNotificationSettings('smsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="pushEnabled">Notifications push</Label>
                <Switch
                  id="pushEnabled"
                  checked={settings.notifications.pushEnabled}
                  onCheckedChange={(checked) => updateNotificationSettings('pushEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="winningNotifications">Notifications de gains</Label>
                <Switch
                  id="winningNotifications"
                  checked={settings.notifications.winningNotifications}
                  onCheckedChange={(checked) => updateNotificationSettings('winningNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Paramètres de Paiement
              </CardTitle>
              <CardDescription>
                Configuration des dépôts et paiements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="minDeposit">Dépôt minimum (₪)</Label>
                <Input
                  id="minDeposit"
                  type="number"
                  value={settings.payments.minimumDeposit}
                  onChange={(e) => updatePaymentSettings('minimumDeposit', Number(e.target.value))}
                  min="50"
                  max="500"
                />
              </div>

              <div>
                <Label htmlFor="maxDeposit">Dépôt maximum (₪)</Label>
                <Input
                  id="maxDeposit"
                  type="number"
                  value={settings.payments.maximumDeposit}
                  onChange={(e) => updatePaymentSettings('maximumDeposit', Number(e.target.value))}
                  min="1000"
                  step="1000"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="cryptoEnabled">Paiements crypto activés</Label>
                <Switch
                  id="cryptoEnabled"
                  checked={settings.payments.cryptoEnabled}
                  onCheckedChange={(checked) => updatePaymentSettings('cryptoEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="manualApproval">Approbation manuelle requise</Label>
                <Switch
                  id="manualApproval"
                  checked={settings.payments.manualApprovalRequired}
                  onCheckedChange={(checked) => updatePaymentSettings('manualApprovalRequired', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Annuler
          </Button>
          <Button 
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateSettingsMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </Button>
        </div>
      </form>
    </div>
  );
}