import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, AlertTriangle, Eye, EyeOff, Ban, 
  Trash2, Clock, User, Filter, Search, Flag
} from 'lucide-react';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  flagged: boolean;
  hidden: boolean;
  category: 'general' | 'support' | 'warning' | 'spam';
  reports: number;
  moderatedBy?: string;
}

interface ModerationStats {
  totalMessages: number;
  flaggedMessages: number;
  hiddenMessages: number;
  activeUsers: number;
  reportedMessages: number;
}

export default function ChatModeration() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/admin/chat/messages?filter=${filter}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/chat/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const hideMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/chat/messages/${messageId}/hide`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Message masqué",
          description: "Le message a été masqué avec succès"
        });
        fetchMessages();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de masquer le message",
        variant: "destructive"
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      const response = await fetch(`/api/admin/chat/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Message supprimé",
          description: "Le message a été supprimé définitivement"
        });
        fetchMessages();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message",
        variant: "destructive"
      });
    }
  };

  const banUser = async (username: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir bannir l'utilisateur ${username} ?`)) return;

    try {
      const response = await fetch(`/api/admin/chat/ban/${username}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Utilisateur banni",
          description: `${username} a été banni du chat`
        });
        fetchMessages();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de bannir l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filter) {
      case 'flagged':
        return matchesSearch && message.flagged;
      case 'hidden':
        return matchesSearch && message.hidden;
      case 'reported':
        return matchesSearch && message.reports > 0;
      default:
        return matchesSearch;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <MessageSquare className="w-8 h-8 animate-pulse text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Modération Chat</h2>
          <p className="text-gray-600">Surveillance et modération des conversations</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Tous les messages</option>
            <option value="flagged">Messages signalés</option>
            <option value="hidden">Messages masqués</option>
            <option value="reported">Messages rapportés</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Messages Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Flag className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Messages Signalés</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.flaggedMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <EyeOff className="w-8 h-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Messages Masqués</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.hiddenMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher dans les messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Messages du Chat</CardTitle>
          <CardDescription>
            {filteredMessages.length} message(s) {filter !== 'all' && `(${filter})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun message trouvé</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 border rounded-lg ${
                    message.hidden ? 'bg-gray-50 border-gray-300' :
                    message.flagged ? 'bg-red-50 border-red-200' :
                    message.reports > 0 ? 'bg-yellow-50 border-yellow-200' :
                    'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{message.username}</span>
                        <span className="text-sm text-gray-500">{message.timestamp}</span>
                        
                        {message.flagged && (
                          <Badge variant="destructive">
                            <Flag className="w-3 h-3 mr-1" />
                            Signalé
                          </Badge>
                        )}
                        
                        {message.hidden && (
                          <Badge variant="secondary">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Masqué
                          </Badge>
                        )}
                        
                        {message.reports > 0 && (
                          <Badge variant="outline">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {message.reports} rapport(s)
                          </Badge>
                        )}
                        
                        <Badge variant="outline" className={
                          message.category === 'spam' ? 'text-red-600' :
                          message.category === 'warning' ? 'text-yellow-600' :
                          message.category === 'support' ? 'text-blue-600' :
                          'text-gray-600'
                        }>
                          {message.category}
                        </Badge>
                      </div>
                      
                      <p className={`text-gray-900 ${message.hidden ? 'line-through opacity-50' : ''}`}>
                        {message.message}
                      </p>
                      
                      {message.moderatedBy && (
                        <p className="text-sm text-gray-500 mt-2">
                          Modéré par: {message.moderatedBy}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!message.hidden ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => hideMessage(message.id)}
                        >
                          <EyeOff className="w-4 h-4 mr-1" />
                          Masquer
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => hideMessage(message.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Afficher
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMessage(message.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => banUser(message.username)}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Bannir
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Moderation Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions de Modération Rapides</CardTitle>
          <CardDescription>
            Actions groupées pour la modération
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              <EyeOff className="w-4 h-4 mr-2" />
              Masquer tous les signalés
            </Button>
            
            <Button variant="outline" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer les spam
            </Button>
            
            <Button variant="destructive" className="w-full">
              <Ban className="w-4 h-4 mr-2" />
              Bannir utilisateurs problématiques
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}