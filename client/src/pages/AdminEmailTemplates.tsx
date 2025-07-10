import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Mail, Edit, Save, Send, Eye } from 'lucide-react';

interface EmailTemplate {
  name: string;
  subject: {
    [key: string]: string;
  };
  body: {
    [key: string]: string;
  };
}

interface EmailConfig {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
}

export default function AdminEmailTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('welcome');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('fr');
  const [editMode, setEditMode] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  
  const [templateData, setTemplateData] = useState({
    subject: '',
    body: ''
  });

  // Fetch email templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/admin/email/templates'],
    select: (data) => data.templates as EmailTemplate[]
  });

  // Fetch email configuration
  const { data: emailConfig } = useQuery({
    queryKey: ['/api/admin/email/config'],
    select: (data) => data.config as EmailConfig
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ templateName, data }: { templateName: string; data: any }) => 
      apiRequest(`/api/admin/email/template/${templateName}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({
        title: "Template mis à jour",
        description: "Le template email a été sauvegardé avec succès.",
      });
      setEditMode(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/templates'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le template.",
      });
    }
  });

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/email/test', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Email de test envoyé",
        description: "L'email de test a été envoyé avec succès.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer l'email de test.",
      });
    }
  });

  const currentTemplate = templates?.find(t => t.name === selectedTemplate);

  const handleEditTemplate = (templateName: string, language: string) => {
    const template = templates?.find(t => t.name === templateName);
    if (template) {
      setTemplateData({
        subject: template.subject[language] || '',
        body: template.body[language] || ''
      });
      setEditMode(`${templateName}-${language}`);
    }
  };

  const handleSaveTemplate = () => {
    if (!editMode) return;
    
    const [templateName, language] = editMode.split('-');
    updateTemplateMutation.mutate({
      templateName,
      data: {
        language,
        subject: templateData.subject,
        body: templateData.body
      }
    });
  };

  const handleSendTestEmail = () => {
    if (!testEmail || !currentTemplate) return;
    
    sendTestEmailMutation.mutate({
      to: testEmail,
      subject: currentTemplate.subject[selectedLanguage] || currentTemplate.subject.fr,
      message: currentTemplate.body[selectedLanguage] || currentTemplate.body.fr
    });
  };

  const getTemplateDisplayName = (name: string) => {
    const names: { [key: string]: string } = {
      welcome: "Email de bienvenue",
      ticket_purchase: "Confirmation d'achat",
      winning_notification: "Notification de gain",
      password_reset: "Réinitialisation mot de passe"
    };
    return names[name] || name;
  };

  const getLanguageDisplayName = (code: string) => {
    const languages: { [key: string]: string } = {
      fr: "Français",
      en: "English",
      he: "עברית"
    };
    return languages[code] || code;
  };

  if (templatesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Templates Email</h1>
      </div>

      {/* Email Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={emailConfig?.enabled ? "default" : "secondary"}>
              {emailConfig?.enabled ? "Activé" : "Désactivé"}
            </Badge>
            {emailConfig?.smtpHost && (
              <span className="text-sm text-gray-600">
                SMTP: {emailConfig.smtpHost}:{emailConfig.smtpPort}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card>
          <CardHeader>
            <CardTitle>Templates Disponibles</CardTitle>
            <CardDescription>
              Sélectionnez un template à modifier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templates?.map((template) => (
                <button
                  key={template.name}
                  onClick={() => setSelectedTemplate(template.name)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTemplate === template.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">
                    {getTemplateDisplayName(template.name)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Object.keys(template.subject).length} langue(s)
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          {currentTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  {getTemplateDisplayName(currentTemplate.name)}
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="he">עברית</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview">
                  <TabsList>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Aperçu
                    </TabsTrigger>
                    <TabsTrigger value="edit" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </TabsTrigger>
                    <TabsTrigger value="test" className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Test
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="space-y-4">
                    <div>
                      <Label>Sujet</Label>
                      <div className="p-3 bg-gray-50 rounded border">
                        {currentTemplate.subject[selectedLanguage] || "Sujet non défini"}
                      </div>
                    </div>
                    <div>
                      <Label>Corps du message</Label>
                      <div 
                        className="p-4 bg-gray-50 rounded border min-h-[200px]"
                        dangerouslySetInnerHTML={{ 
                          __html: currentTemplate.body[selectedLanguage] || "Corps non défini" 
                        }}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="edit" className="space-y-4">
                    {editMode === `${currentTemplate.name}-${selectedLanguage}` ? (
                      <>
                        <div>
                          <Label htmlFor="subject">Sujet</Label>
                          <Input
                            id="subject"
                            value={templateData.subject}
                            onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                            placeholder="Sujet de l'email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="body">Corps du message</Label>
                          <Textarea
                            id="body"
                            value={templateData.body}
                            onChange={(e) => setTemplateData({ ...templateData, body: e.target.value })}
                            placeholder="Corps de l'email (HTML autorisé)"
                            className="min-h-[300px]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSaveTemplate}
                            disabled={updateTemplateMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            {updateTemplateMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditMode(null)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Button
                          onClick={() => handleEditTemplate(currentTemplate.name, selectedLanguage)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Modifier ce template
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="test" className="space-y-4">
                    <div>
                      <Label htmlFor="testEmail">Email de test</Label>
                      <Input
                        id="testEmail"
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                    <Button
                      onClick={handleSendTestEmail}
                      disabled={!testEmail || sendTestEmailMutation.isPending || !emailConfig?.enabled}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {sendTestEmailMutation.isPending ? 'Envoi...' : 'Envoyer email de test'}
                    </Button>
                    {!emailConfig?.enabled && (
                      <p className="text-sm text-amber-600">
                        ⚠️ Le service email doit être configuré et activé pour envoyer des tests
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Sélectionnez un template pour commencer</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Variables Help */}
      <Card>
        <CardHeader>
          <CardTitle>Variables disponibles</CardTitle>
          <CardDescription>
            Utilisez ces variables dans vos templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium mb-2">Utilisateur</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code>{'{{firstName}}'}</code> - Prénom</li>
                <li><code>{'{{lastName}}'}</code> - Nom</li>
                <li><code>{'{{email}}'}</code> - Email</li>
                <li><code>{'{{referralCode}}'}</code> - Code parrainage</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Ticket</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code>{'{{numbers}}'}</code> - Numéros choisis</li>
                <li><code>{'{{cost}}'}</code> - Coût du ticket</li>
                <li><code>{'{{drawDate}}'}</code> - Date du tirage</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tirage</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code>{'{{drawNumber}}'}</code> - Numéro du tirage</li>
                <li><code>{'{{winningNumbers}}'}</code> - Numéros gagnants</li>
                <li><code>{'{{jackpot}}'}</code> - Montant du jackpot</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Gains</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code>{'{{winningAmount}}'}</code> - Montant gagné</li>
                <li><code>{'{{matchCount}}'}</code> - Numéros trouvés</li>
                <li><code>{'{{newBalance}}'}</code> - Nouveau solde</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}