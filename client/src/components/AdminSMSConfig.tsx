import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Save, 
  Send, 
  TestTube,
  AlertCircle,
  CheckCircle,
  Settings,
  Globe,
  Shield,
  RefreshCw,
  Phone,
  Users,
  BarChart3
} from "lucide-react";

interface SMSConfig {
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  enabled: boolean;
  defaultCountryCode: string;
}

interface SMSTemplate {
  id: string;
  name: string;
  message: string;
  language: string;
  type: 'welcome' | 'winner' | 'draw_reminder' | 'verification' | 'admin_alert';
}

export default function AdminSMSConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState<SMSConfig>({
    twilio: {
      accountSid: '',
      authToken: '',
      phoneNumber: ''
    },
    enabled: false,
    defaultCountryCode: '+33'
  });
  
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [activeTab, setActiveTab] = useState('config');

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const [configResponse, templatesResponse] = await Promise.all([
        fetch('/api/admin/sms/config', { credentials: 'include' }),
        fetch('/api/admin/sms/templates', { credentials: 'include' })
      ]);

      if (configResponse.ok) {
        const configData = await configResponse.json();
        setConfig(configData);
      }

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
        if (templatesData.length > 0) {
          setSelectedTemplate(templatesData[0]);
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration SMS",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/sms/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Configuration SMS sauvegardée",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de la sauvegarde",
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
      setIsSaving(false);
    }
  };

  const handleTestSMS = async () => {
    if (!testPhone) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un numéro de téléphone de test",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/admin/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to: testPhone })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "SMS de test envoyé avec succès",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de l'envoi du test",
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
      setIsTesting(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/sms/templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(selectedTemplate)
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Template SMS sauvegardé",
        });
        loadConfig();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de la sauvegarde",
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
      setIsSaving(false);
    }
  };

  const getTemplateTypeBadge = (type: SMSTemplate['type']) => {
    const types = {
      welcome: { label: 'Bienvenue', color: 'bg-blue-100 text-blue-800' },
      winner: { label: 'Gagnant', color: 'bg-green-100 text-green-800' },
      draw_reminder: { label: 'Rappel Tirage', color: 'bg-orange-100 text-orange-800' },
      verification: { label: 'Vérification', color: 'bg-purple-100 text-purple-800' },
      admin_alert: { label: 'Alerte Admin', color: 'bg-red-100 text-red-800' }
    };

    const typeInfo = types[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  const getLanguageBadge = (language: string) => {
    const languages = {
      fr: { label: 'Français', color: 'bg-blue-100 text-blue-800' },
      en: { label: 'English', color: 'bg-green-100 text-green-800' },
      he: { label: 'עברית', color: 'bg-purple-100 text-purple-800' }
    };

    const langInfo = languages[language as keyof typeof languages] || { label: language, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={langInfo.color}>{langInfo.label}</Badge>;
  };

  if (isLoading) {
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
            <MessageSquare className="w-8 h-8 text-blue-600" />
            Configuration SMS
          </h1>
          <p className="text-gray-600 mt-1">
            Gestion des paramètres Twilio et des templates SMS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={config.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {config.enabled ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Activé
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                Désactivé
              </>
            )}
          </Badge>
          <Button onClick={loadConfig} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config" className="gap-2">
            <Settings className="w-4 h-4" />
            Configuration Twilio
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-2">
            <TestTube className="w-4 h-4" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        {/* Twilio Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres Twilio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Service SMS</h3>
                  <p className="text-sm text-gray-600">Activer/désactiver l'envoi de SMS</p>
                </div>
                <Switch 
                  checked={config.enabled} 
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountSid">Account SID</Label>
                  <Input
                    id="accountSid"
                    value={config.twilio.accountSid}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      twilio: { ...prev.twilio, accountSid: e.target.value }
                    }))}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>

                <div>
                  <Label htmlFor="authToken">Auth Token</Label>
                  <Input
                    id="authToken"
                    type="password"
                    value={config.twilio.authToken}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      twilio: { ...prev.twilio, authToken: e.target.value }
                    }))}
                    placeholder="••••••••••••••••••••••••••••••••"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Numéro Twilio</Label>
                  <Input
                    id="phoneNumber"
                    value={config.twilio.phoneNumber}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      twilio: { ...prev.twilio, phoneNumber: e.target.value }
                    }))}
                    placeholder="+15551234567"
                  />
                </div>

                <div>
                  <Label htmlFor="defaultCountryCode">Code pays par défaut</Label>
                  <Select 
                    value={config.defaultCountryCode} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, defaultCountryCode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+33">🇫🇷 France (+33)</SelectItem>
                      <SelectItem value="+1">🇺🇸 États-Unis (+1)</SelectItem>
                      <SelectItem value="+44">🇬🇧 Royaume-Uni (+44)</SelectItem>
                      <SelectItem value="+972">🇮🇱 Israël (+972)</SelectItem>
                      <SelectItem value="+49">🇩🇪 Allemagne (+49)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Les tokens Twilio sont stockés de manière sécurisée et cryptée. 
                  Obtenez vos identifiants depuis votre console Twilio.
                </AlertDescription>
              </Alert>

              <Button onClick={handleSaveConfig} disabled={isSaving} className="gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? "Sauvegarde..." : "Sauvegarder la Configuration"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Templates SMS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-medium text-sm mb-1">{template.name}</div>
                    <div className="flex gap-2 mb-2">
                      {getTemplateTypeBadge(template.type)}
                      {getLanguageBadge(template.language)}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2">{template.message}</div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Template Editor */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Édition: {selectedTemplate.name}
                      </div>
                      <div className="flex gap-2">
                        {getTemplateTypeBadge(selectedTemplate.type)}
                        {getLanguageBadge(selectedTemplate.language)}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="message">Message SMS</Label>
                      <Textarea
                        id="message"
                        value={selectedTemplate.message}
                        onChange={(e) => setSelectedTemplate(prev => 
                          prev ? { ...prev, message: e.target.value } : null
                        )}
                        placeholder="Votre message SMS..."
                        rows={6}
                        maxLength={160}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedTemplate.message.length}/160 caractères
                      </div>
                    </div>

                    <Alert>
                      <MessageSquare className="h-4 w-4" />
                      <AlertDescription>
                        Variables disponibles: {"{firstName}"}, {"{lastName}"}, {"{amount}"}, {"{drawNumber}"}
                      </AlertDescription>
                    </Alert>

                    <Button onClick={handleSaveTemplate} disabled={isSaving} className="gap-2">
                      <Save className="w-4 h-4" />
                      {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun template sélectionné</h3>
                    <p className="text-gray-500">Sélectionnez un template à modifier dans la liste.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Test d'Envoi de SMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Envoyez un SMS de test pour vérifier la configuration Twilio.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="testPhone">Numéro de téléphone de test</Label>
                <Input
                  id="testPhone"
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+33612345678"
                />
              </div>

              <Button 
                onClick={handleTestSMS} 
                disabled={isTesting || !testPhone || !config.enabled}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {isTesting ? "Envoi..." : "Envoyer Test SMS"}
              </Button>

              {!config.enabled && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Le service SMS doit être activé pour envoyer des tests.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-500">SMS envoyés aujourd'hui</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-500">SMS livrés</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600">0</div>
                <div className="text-sm text-gray-500">Échecs d'envoi</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">{templates.length}</div>
                <div className="text-sm text-gray-500">Templates configurés</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historique des Envois SMS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun historique d'envoi SMS disponible pour le moment</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}