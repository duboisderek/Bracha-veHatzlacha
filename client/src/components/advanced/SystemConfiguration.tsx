import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Shield, DollarSign, Mail, MessageSquare } from 'lucide-react';

interface SystemConfig {
  lottery: {
    ticketPrice: number;
    minNumbers: number;
    maxNumbers: number;
    numberRange: number;
    drawFrequency: string;
  };
  financial: {
    houseEdge: number;
    referralBonus: number;
    referralThreshold: number;
    vipThreshold: number;
    minDeposit: number;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    require2FA: boolean;
    enforceStrongPasswords: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    winningNotifications: boolean;
    promotionalEmails: boolean;
  };
  features: {
    chatEnabled: boolean;
    referralProgram: boolean;
    cryptoPayments: boolean;
    multiLanguage: boolean;
    mobileApp: boolean;
  };
}

export default function SystemConfiguration() {
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/root-admin/system/config', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        // Default configuration if none exists
        setConfig({
          lottery: {
            ticketPrice: 100,
            minNumbers: 6,
            maxNumbers: 6,
            numberRange: 37,
            drawFrequency: 'weekly'
          },
          financial: {
            houseEdge: 0.5,
            referralBonus: 100,
            referralThreshold: 1000,
            vipThreshold: 10000,
            minDeposit: 100
          },
          security: {
            sessionTimeout: 24,
            maxLoginAttempts: 5,
            lockoutDuration: 15,
            require2FA: false,
            enforceStrongPasswords: true
          },
          notifications: {
            emailEnabled: true,
            smsEnabled: false,
            pushEnabled: true,
            winningNotifications: true,
            promotionalEmails: false
          },
          features: {
            chatEnabled: true,
            referralProgram: true,
            cryptoPayments: true,
            multiLanguage: true,
            mobileApp: true
          }
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/root-admin/system/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Configuration sauvegardée avec succès"
        });
      } else {
        throw new Error('Erreur de sauvegarde');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: keyof SystemConfig, key: string, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [key]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuration Système</h2>
          <p className="text-gray-600">Paramètres globaux de la plateforme</p>
        </div>
        <Button onClick={saveConfig} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="lottery" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="lottery">Loterie</TabsTrigger>
          <TabsTrigger value="financial">Financier</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
        </TabsList>

        <TabsContent value="lottery">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Paramètres Loterie
              </CardTitle>
              <CardDescription>
                Configuration des règles de jeu et des tirages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticketPrice">Prix du ticket (₪)</Label>
                  <Input
                    id="ticketPrice"
                    type="number"
                    value={config.lottery.ticketPrice}
                    onChange={(e) => updateConfig('lottery', 'ticketPrice', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="numberRange">Plage de numéros (1-X)</Label>
                  <Input
                    id="numberRange"
                    type="number"
                    value={config.lottery.numberRange}
                    onChange={(e) => updateConfig('lottery', 'numberRange', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="minNumbers">Nombres minimum à sélectionner</Label>
                  <Input
                    id="minNumbers"
                    type="number"
                    value={config.lottery.minNumbers}
                    onChange={(e) => updateConfig('lottery', 'minNumbers', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxNumbers">Nombres maximum à sélectionner</Label>
                  <Input
                    id="maxNumbers"
                    type="number"
                    value={config.lottery.maxNumbers}
                    onChange={(e) => updateConfig('lottery', 'maxNumbers', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Financiers</CardTitle>
              <CardDescription>
                Configuration des seuils et pourcentages financiers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="houseEdge">Marge de la maison (%)</Label>
                  <Input
                    id="houseEdge"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.financial.houseEdge}
                    onChange={(e) => updateConfig('financial', 'houseEdge', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="referralBonus">Bonus parrainage (₪)</Label>
                  <Input
                    id="referralBonus"
                    type="number"
                    value={config.financial.referralBonus}
                    onChange={(e) => updateConfig('financial', 'referralBonus', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="referralThreshold">Seuil parrainage (₪)</Label>
                  <Input
                    id="referralThreshold"
                    type="number"
                    value={config.financial.referralThreshold}
                    onChange={(e) => updateConfig('financial', 'referralThreshold', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="vipThreshold">Seuil VIP (₪)</Label>
                  <Input
                    id="vipThreshold"
                    type="number"
                    value={config.financial.vipThreshold}
                    onChange={(e) => updateConfig('financial', 'vipThreshold', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Paramètres Sécurité
              </CardTitle>
              <CardDescription>
                Configuration de la sécurité et des restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Timeout session (heures)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config.security.sessionTimeout}
                    onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Tentatives max connexion</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="lockoutDuration">Durée blocage (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={config.security.lockoutDuration}
                    onChange={(e) => updateConfig('security', 'lockoutDuration', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="require2FA">Forcer 2FA pour tous</Label>
                  <Switch
                    id="require2FA"
                    checked={config.security.require2FA}
                    onCheckedChange={(checked) => updateConfig('security', 'require2FA', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enforceStrongPasswords">Mots de passe forts</Label>
                  <Switch
                    id="enforceStrongPasswords"
                    checked={config.security.enforceStrongPasswords}
                    onCheckedChange={(checked) => updateConfig('security', 'enforceStrongPasswords', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Paramètres Notifications
              </CardTitle>
              <CardDescription>
                Configuration des systèmes de notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailEnabled">Notifications Email</Label>
                  <Switch
                    id="emailEnabled"
                    checked={config.notifications.emailEnabled}
                    onCheckedChange={(checked) => updateConfig('notifications', 'emailEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="smsEnabled">Notifications SMS</Label>
                  <Switch
                    id="smsEnabled"
                    checked={config.notifications.smsEnabled}
                    onCheckedChange={(checked) => updateConfig('notifications', 'smsEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushEnabled">Notifications Push</Label>
                  <Switch
                    id="pushEnabled"
                    checked={config.notifications.pushEnabled}
                    onCheckedChange={(checked) => updateConfig('notifications', 'pushEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="winningNotifications">Notifications gains</Label>
                  <Switch
                    id="winningNotifications"
                    checked={config.notifications.winningNotifications}
                    onCheckedChange={(checked) => updateConfig('notifications', 'winningNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="promotionalEmails">Emails promotionnels</Label>
                  <Switch
                    id="promotionalEmails"
                    checked={config.notifications.promotionalEmails}
                    onCheckedChange={(checked) => updateConfig('notifications', 'promotionalEmails', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Fonctionnalités
              </CardTitle>
              <CardDescription>
                Activation/désactivation des fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="chatEnabled">Chat en temps réel</Label>
                  <Switch
                    id="chatEnabled"
                    checked={config.features.chatEnabled}
                    onCheckedChange={(checked) => updateConfig('features', 'chatEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="referralProgram">Programme parrainage</Label>
                  <Switch
                    id="referralProgram"
                    checked={config.features.referralProgram}
                    onCheckedChange={(checked) => updateConfig('features', 'referralProgram', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="cryptoPayments">Paiements crypto</Label>
                  <Switch
                    id="cryptoPayments"
                    checked={config.features.cryptoPayments}
                    onCheckedChange={(checked) => updateConfig('features', 'cryptoPayments', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="multiLanguage">Support multilingue</Label>
                  <Switch
                    id="multiLanguage"
                    checked={config.features.multiLanguage}
                    onCheckedChange={(checked) => updateConfig('features', 'multiLanguage', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mobileApp">Application mobile</Label>
                  <Switch
                    id="mobileApp"
                    checked={config.features.mobileApp}
                    onCheckedChange={(checked) => updateConfig('features', 'mobileApp', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}