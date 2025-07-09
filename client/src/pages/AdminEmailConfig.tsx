import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Mail, 
  Send, 
  Settings, 
  TestTube,
  CheckCircle,
  AlertCircle,
  Eye,
  Save
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
  subject: string;
  html: string;
  text: string;
}

export default function AdminEmailConfig() {
  const { t } = useLanguage();
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
  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/email/config', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        setTemplates(data.templates || {});
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/email/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ config })
      });

      if (response.ok) {
        toast({
          title: "Configuration sauvegardée",
          description: "La configuration email a été mise à jour",
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
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer une adresse email pour le test",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: testEmail,
          config: config
        })
      });

      const result = await response.json();
      setTestResult(result);

      if (result.success) {
        toast({
          title: "Test réussi",
          description: "Email de test envoyé avec succès",
        });
      } else {
        toast({
          title: "Test échoué",
          description: result.message || "Erreur lors du test",
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
      setTesting(false);
    }
  };

  const handleUpdateTemplate = async (templateName: string, template: EmailTemplate) => {
    try {
      const response = await fetch('/api/admin/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ templateName, template })
      });

      if (response.ok) {
        setTemplates(prev => ({
          ...prev,
          [templateName]: template
        }));
        toast({
          title: "Template sauvegardé",
          description: `Le template ${templateName} a été mis à jour`,
        });
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de la sauvegarde du template",
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

  const templateList = [
    { key: 'welcome', name: 'Bienvenue', description: 'Email envoyé lors de l\'inscription' },
    { key: 'winner', name: 'Gagnant', description: 'Notification de gain' },
    { key: 'draw_reminder', name: 'Rappel Tirage', description: 'Rappel avant tirage' },
    { key: 'deposit_confirmation', name: 'Confirmation Dépôt', description: 'Confirmation de dépôt' },
    { key: 'security_alert', name: 'Alerte Sécurité', description: 'Alerte de sécurité' }
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">Configuration Email</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Service Email</span>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
          />
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuration SMTP
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuration SMTP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">Serveur SMTP</Label>
                  <Input
                    id="smtpHost"
                    value={config.smtp.host}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, host: e.target.value }
                    }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={config.smtp.port}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, port: parseInt(e.target.value) || 587 }
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpUser">Nom d'utilisateur</Label>
                  <Input
                    id="smtpUser"
                    value={config.smtp.auth.user}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, auth: { ...prev.smtp.auth, user: e.target.value } }
                    }))}
                    placeholder="votre-email@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPass">Mot de passe</Label>
                  <Input
                    id="smtpPass"
                    type="password"
                    value={config.smtp.auth.pass}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, auth: { ...prev.smtp.auth, pass: e.target.value } }
                    }))}
                    placeholder="•••••••••••••••"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fromEmail">Email expéditeur</Label>
                <Input
                  id="fromEmail"
                  value={config.from}
                  onChange={(e) => setConfig(prev => ({ ...prev, from: e.target.value }))}
                  placeholder="noreply@brachavehatzlacha.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.smtp.secure}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    smtp: { ...prev.smtp, secure: checked }
                  }))}
                />
                <Label>Connexion sécurisée (SSL/TLS)</Label>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-4">
            {templateList.map((template) => {
              const currentTemplate = templates[template.key] || {
                subject: '',
                html: '',
                text: ''
              };

              return (
                <Card key={template.key}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div>
                        <div>{template.name}</div>
                        <div className="text-sm font-normal text-gray-500">
                          {template.description}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewTemplate(
                          previewTemplate === template.key ? null : template.key
                        )}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {previewTemplate === template.key ? "Masquer" : "Aperçu"}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Sujet</Label>
                      <Input
                        value={currentTemplate.subject}
                        onChange={(e) => {
                          const updated = { ...currentTemplate, subject: e.target.value };
                          setTemplates(prev => ({ ...prev, [template.key]: updated }));
                        }}
                        placeholder="Sujet de l'email"
                      />
                    </div>

                    <div>
                      <Label>Contenu HTML</Label>
                      <Textarea
                        value={currentTemplate.html}
                        onChange={(e) => {
                          const updated = { ...currentTemplate, html: e.target.value };
                          setTemplates(prev => ({ ...prev, [template.key]: updated }));
                        }}
                        placeholder="Contenu HTML de l'email"
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div>
                      <Label>Contenu texte</Label>
                      <Textarea
                        value={currentTemplate.text}
                        onChange={(e) => {
                          const updated = { ...currentTemplate, text: e.target.value };
                          setTemplates(prev => ({ ...prev, [template.key]: updated }));
                        }}
                        placeholder="Version texte de l'email"
                        rows={4}
                      />
                    </div>

                    {previewTemplate === template.key && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <h4 className="font-medium mb-2">Aperçu:</h4>
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: currentTemplate.html }}
                        />
                      </motion.div>
                    )}

                    <Button
                      onClick={() => handleUpdateTemplate(template.key, currentTemplate)}
                      size="sm"
                    >
                      Sauvegarder ce template
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test du service Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Email de test</Label>
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
                disabled={testing || !config.enabled}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {testing ? "Envoi en cours..." : "Envoyer email de test"}
              </Button>

              {!config.enabled && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Le service email est désactivé. Activez-le pour pouvoir envoyer des tests.
                  </span>
                </div>
              )}

              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg ${
                    testResult.success 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {testResult.success ? "Test réussi" : "Test échoué"}
                    </span>
                  </div>
                  <p className="text-sm">{testResult.message}</p>
                  {testResult.details && (
                    <pre className="text-xs mt-2 bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}