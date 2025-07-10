import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User, Phone, Globe, Bell, Copy } from 'lucide-react';

interface UserProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  language: string;
  smsNotifications: boolean;
  balance: string;
  referralCode: string;
  referralCount: number;
}

interface ReferralData {
  referralLink: string;
  referralCode: string;
  referralCount: number;
  referralBonus: string;
}

export default function UserProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    language: 'fr',
    smsNotifications: true
  });

  // Fetch user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    select: (data) => data.user as UserProfileData
  });

  // Fetch referral link
  const { data: referralData } = useQuery({
    queryKey: ['/api/user/referral-link'],
    enabled: !!user
  }) as { data: ReferralData };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
      });
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        language: user.language || 'fr',
        smsNotifications: user.smsNotifications ?? true
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const copyReferralLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      toast({
        title: "Lien copié",
        description: "Le lien de parrainage a été copié dans le presse-papiers.",
      });
    }
  };

  if (userLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-amber-600" />
        <h1 className="text-3xl font-bold">Mon Profil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations Personnelles
            </CardTitle>
            <CardDescription>
              Mettez à jour vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Numéro de téléphone
                </Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+972501234567"
                />
              </div>

              <div>
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Langue préférée
                </Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="he">עברית</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sms" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications SMS
                </Label>
                <Switch
                  id="sms"
                  checked={formData.smsNotifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, smsNotifications: checked })}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Mise à jour...' : 'Mettre à jour le profil'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Overview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Solde actuel</span>
                <span className="text-2xl font-bold text-green-600">
                  ₪{user?.balance || '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Code de parrainage</span>
                <span className="font-mono text-lg">
                  {user?.referralCode}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Parrainages réussis</span>
                <span className="text-lg font-semibold">
                  {user?.referralCount || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Referral Link */}
          {referralData && (
            <Card>
              <CardHeader>
                <CardTitle>Lien de parrainage</CardTitle>
                <CardDescription>
                  Partagez ce lien pour inviter vos amis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={referralData.referralLink}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button
                    onClick={copyReferralLink}
                    variant="outline"
                    size="icon"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Bonus de parrainage :</strong> Gagnez ₪100 pour chaque ami qui s'inscrit 
                    et effectue son premier dépôt !
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}