import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, MessageCircle, Clock, CheckCircle, AlertCircle,
  Send, Phone, Star, Zap, Gift, Shield
} from 'lucide-react';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  adminResponse?: string;
  responseTime?: number;
}

interface VIPBenefit {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
}

interface VIPStats {
  totalSpent: number;
  ticketsPurchased: number;
  totalWinnings: number;
  vipLevel: string;
  pointsEarned: number;
  nextLevelPoints: number;
}

export default function VIPSupport() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [vipStats, setVipStats] = useState<VIPStats | null>(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium' as const
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const vipBenefits: VIPBenefit[] = [
    {
      id: 'priority_support',
      title: 'Support Prioritaire',
      description: 'Réponse garantie sous 1 heure',
      icon: <Zap className="w-5 h-5" />,
      active: true
    },
    {
      id: 'dedicated_manager',
      title: 'Gestionnaire Dédié',
      description: 'Un contact personnel pour vos demandes',
      icon: <Crown className="w-5 h-5" />,
      active: true
    },
    {
      id: 'exclusive_offers',
      title: 'Offres Exclusives',
      description: 'Bonus et promotions réservés aux VIP',
      icon: <Gift className="w-5 h-5" />,
      active: true
    },
    {
      id: 'phone_support',
      title: 'Support Téléphonique',
      description: 'Ligne directe 24/7',
      icon: <Phone className="w-5 h-5" />,
      active: true
    },
    {
      id: 'enhanced_security',
      title: 'Sécurité Renforcée',
      description: 'Protection avancée de votre compte',
      icon: <Shield className="w-5 h-5" />,
      active: true
    }
  ];

  useEffect(() => {
    fetchVIPData();
  }, []);

  const fetchVIPData = async () => {
    try {
      const [ticketsResponse, statsResponse] = await Promise.all([
        fetch('/api/vip/support/tickets', { credentials: 'include' }),
        fetch('/api/vip/stats', { credentials: 'include' })
      ]);

      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setVipStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching VIP data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données VIP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/vip/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newTicket)
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Votre demande a été envoyée. Réponse sous 1 heure garanti."
        });
        setNewTicket({ subject: '', message: '', priority: 'medium' });
        fetchVIPData();
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre demande",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: { variant: 'outline' as const, label: 'Faible' },
      medium: { variant: 'secondary' as const, label: 'Moyen' },
      high: { variant: 'default' as const, label: 'Élevé' },
      urgent: { variant: 'destructive' as const, label: 'Urgent' }
    };

    const config = variants[priority as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'in_progress':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Crown className="w-8 h-8 animate-pulse text-yellow-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* VIP Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Crown className="w-6 h-6 mr-2" />
              Support VIP Exclusif
            </h2>
            <p className="text-yellow-100">Service premium réservé aux clients VIP</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{vipStats?.vipLevel || 'Gold'}</div>
            <div className="text-sm text-yellow-100">Niveau VIP</div>
          </div>
        </div>
      </div>

      {/* VIP Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Vos Avantages VIP
          </CardTitle>
          <CardDescription>
            Profitez d'un service exclusif et personnalisé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vipBenefits.map((benefit) => (
              <div key={benefit.id} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-yellow-600 mr-3">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* VIP Stats */}
      {vipStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{vipStats.totalSpent}₪</div>
              <div className="text-sm text-gray-600">Total Dépensé</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{vipStats.ticketsPurchased}</div>
              <div className="text-sm text-gray-600">Tickets Achetés</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{vipStats.totalWinnings}₪</div>
              <div className="text-sm text-gray-600">Gains Totaux</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{vipStats.pointsEarned}</div>
              <div className="text-sm text-gray-600">Points VIP</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Direct */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Direct VIP</CardTitle>
          <CardDescription>
            Réponse garantie sous 1 heure par notre équipe dédiée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujet
            </label>
            <Input
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              placeholder="Décrivez brièvement votre demande"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <Textarea
              value={newTicket.message}
              onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
              placeholder="Détaillez votre demande..."
              rows={4}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priorité
            </label>
            <select
              value={newTicket.priority}
              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="low">Faible</option>
              <option value="medium">Moyen</option>
              <option value="high">Élevé</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <Button onClick={submitTicket} disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer ma Demande VIP
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Support History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique de Support</CardTitle>
          <CardDescription>
            Vos demandes précédentes et leurs réponses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune demande de support pour le moment</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <h4 className="font-medium">{ticket.subject}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(ticket.priority)}
                      <span className="text-sm text-gray-500">{ticket.createdAt}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{ticket.message}</p>
                  
                  {ticket.adminResponse && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">
                      <div className="flex items-center mb-2">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            VIP
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-blue-800">Équipe Support VIP</span>
                        {ticket.responseTime && (
                          <span className="ml-2 text-xs text-blue-600">
                            Répondu en {ticket.responseTime}min
                          </span>
                        )}
                      </div>
                      <p className="text-blue-800">{ticket.adminResponse}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}