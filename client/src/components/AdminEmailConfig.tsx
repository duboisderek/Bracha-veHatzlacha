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
  Mail, 
  Save, 
  Send, 
  TestTube,
  AlertCircle,
  CheckCircle,
  Settings,
  Users,
  Eye,
  Code,
  Globe,
  Shield,
  RefreshCw
} from "lucide-react";

interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: string;
  enabled: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
  language: string;
  type: 'welcome' | 'winner' | 'draw_reminder' | 'password_reset' | 'admin_notification';
}

export default function AdminEmailConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState<EmailConfig>({
    smtp: {
      host: '',
      port: 587,
      secure: false,
      auth: {
        user: '',
        pass: ''
      }
    },
    from: '',
    enabled: false
  });
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [activeTab, setActiveTab] = useState('config');

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const [configResponse, templatesResponse] = await Promise.all([
        fetch('/api/admin/email/config', { credentials: 'include' }),
        fetch('/api/admin/email/templates', { credentials: 'include' })
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
        description: "Impossible de charger la configuration email",
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
      const response = await fetch('/api/admin/email/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Configuration email sauvegardée",
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

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une adresse email de test",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to: testEmail })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Email de test envoyé avec succès",
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
      const response = await fetch(`/api/admin/email/templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(selectedTemplate)
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Template sauvegardé",
        });
        loadConfig(); // Reload templates
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

  const getTemplateTypeBadge = (type: EmailTemplate['type']) => {
    const types = {
      welcome: { label: 'Bienvenue', color: 'bg-blue-100 text-blue-800' },
      winner: { label: 'Gagnant', color: 'bg-green-100 text-green-800' },
      draw_reminder: { label: 'Rappel Tirage', color: 'bg-orange-100 text-orange-800' },
      password_reset: { label: 'Reset MDP', color: 'bg-purple-100 text-purple-800' },
      admin_notification: { label: 'Notification Admin', color: 'bg-red-100 text-red-800' }
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
            <Mail className="w-8 h-8 text-blue-600" />
            Configuration Email
          </h1>
          <p className="text-gray-600 mt-1">
            Gestion des paramètres SMTP et des templates d'email
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
            Configuration SMTP
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Code className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-2">
            <TestTube className="w-4 h-4" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <Users className="w-4 h-4" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        {/* SMTP Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres SMTP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Service Email</h3>
                  <p className="text-sm text-gray-600">Activer/désactiver l'envoi d'emails</p>
                </div>
                <Switch 
                  checked={config.enabled} 
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="host">Serveur SMTP</Label>
                  <Input
                    id="host"
                    value={config.smtp.host}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, host: e.target.value }
                    }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={config.smtp.port}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, port: parseInt(e.target.value) || 587 }
                    }))}
                    placeholder="587"
                  />
                </div>

                <div>
                  <Label htmlFor="user">Nom d'utilisateur</Label>
                  <Input
                    id="user"
                    value={config.smtp.auth.user}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, auth: { ...prev.smtp.auth, user: e.target.value } }
                    }))}
                    placeholder="your-email@domain.com"
                  />
                </div>

                <div>
                  <Label htmlFor="pass">Mot de passe</Label>
                  <Input
                    id="pass"
                    type="password"
                    value={config.smtp.auth.pass}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, auth: { ...prev.smtp.auth, pass: e.target.value } }
                    }))}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <Label htmlFor="from">Adresse expéditeur</Label>
                  <Input
                    id="from"
                    value={config.from}
                    onChange={(e) => setConfig(prev => ({ ...prev, from: e.target.value }))}
                    placeholder="noreply@brachavehatzlacha.com"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch 
                    checked={config.smtp.secure} 
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, secure: checked }
                    }))}
                  />
                  <Label>SSL/TLS sécurisé</Label>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Les mots de passe sont stockés de manière sécurisée et cryptée. 
                  Utilisez des mots de passe d'application spécifiques pour Gmail.
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
                <CardTitle className="text-sm">Templates Disponibles</CardTitle>
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
                    <div className="text-xs text-gray-500 truncate">{template.subject}</div>
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
                        <Code className="w-5 h-5" />
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
                      <Label htmlFor="subject">Sujet</Label>
                      <Input
                        id="subject"
                        value={selectedTemplate.subject}
                        onChange={(e) => setSelectedTemplate(prev => 
                          prev ? { ...prev, subject: e.target.value } : null
                        )}
                        placeholder="Sujet de l'email..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="html">Contenu HTML</Label>
                      <Textarea
                        id="html"
                        value={selectedTemplate.html}
                        onChange={(e) => setSelectedTemplate(prev => 
                          prev ? { ...prev, html: e.target.value } : null
                        )}
                        placeholder="<html><body>...</body></html>"
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="text">Version Texte</Label>
                      <Textarea
                        id="text"
                        value={selectedTemplate.text}
                        onChange={(e) => setSelectedTemplate(prev => 
                          prev ? { ...prev, text: e.target.value } : null
                        )}
                        placeholder="Version texte de l'email..."
                        rows={6}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleSaveTemplate} disabled={isSaving} className="gap-2">
                        <Save className="w-4 h-4" />
                        {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Prévisualiser
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                Test d'Envoi d'Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Envoyez un email de test pour vérifier la configuration SMTP.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="testEmail">Adresse email de test</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>

              <Button 
                onClick={handleTestEmail} 
                disabled={isTesting || !testEmail || !config.enabled}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {isTesting ? "Envoi..." : "Envoyer Test"}
              </Button>

              {!config.enabled && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Le service email doit être activé pour envoyer des tests.
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
                <div className="text-sm text-gray-500">Emails envoyés aujourd'hui</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-500">Emails livrés</div>
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
              <CardTitle>Historique des Envois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun historique d'envoi disponible pour le moment</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}