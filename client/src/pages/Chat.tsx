import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  MessageCircle, 
  Send, 
  Smile, 
  Paperclip,
  Users,
  Clock,
  CheckCircle
} from "lucide-react";
import { EmojiPicker, useMessageReactions } from "@/components/EmojiPicker";
import { FileUpload, FilePreview } from "@/components/FileUpload";

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  isFromAdmin: boolean;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  attachments?: string[];
}

export default function Chat() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file: File; url: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  const { reactions, addReaction, removeReaction } = useMessageReactions();

  // Fetch chat messages
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
    refetchInterval: 5000, // Refresh every 5 seconds as fallback
  });

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connectWebSocket = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("Chat WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat') {
            // Invalidate and refetch messages
            queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("Chat WebSocket disconnected");
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() && uploadedFiles.length === 0) return;
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour envoyer un message",
        variant: "destructive"
      });
      return;
    }

    try {
      const messageData = {
        type: 'chat',
        userId: user.id,
        content: newMessage,
        attachments: uploadedFiles.map(f => f.url)
      };

      // Send via WebSocket if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(messageData));
      }

      // Clear form
      setNewMessage("");
      setUploadedFiles([]);

      // Invalidate queries to refresh messages
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi du message",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (file: File, url: string) => {
    setUploadedFiles(prev => [...prev, { file, url }]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      await addReaction(messageId, emoji, user.id);
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Chat Communauté
              </h1>
              <p className="text-gray-600 mt-2">
                Discutez avec les autres membres et l'équipe
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Messages ({messages.length})
                </CardTitle>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.userId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
                        {message.userId !== user?.id && (
                          <div className="text-xs font-medium mb-1 opacity-70">
                            {message.isFromAdmin ? 'Admin' : `${message.user?.firstName} ${message.user?.lastName}`}
                          </div>
                        )}
                        
                        <div className="text-sm">
                          {message.message}
                        </div>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="text-xs opacity-80">
                                📎 {attachment.split('/').pop()}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs opacity-70">
                            {formatTime(message.createdAt)}
                          </div>
                          
                          {/* Message reactions */}
                          <div className="flex items-center gap-1">
                            {Object.entries(reactions[message.id] || {}).map(([emoji, count]) => (
                              count > 0 && (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(message.id, emoji)}
                                  className="text-xs bg-white bg-opacity-20 rounded-full px-2 py-1 hover:bg-opacity-30 transition-colors"
                                >
                                  {emoji} {count}
                                </button>
                              )
                            ))}
                            
                            <EmojiPicker
                              onEmojiSelect={(emoji) => handleReaction(message.id, emoji)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </CardContent>
              
              {/* File Attachments Preview */}
              {uploadedFiles.length > 0 && (
                <div className="border-t p-3">
                  <div className="space-y-2">
                    {uploadedFiles.map((fileData, index) => (
                      <FilePreview
                        key={index}
                        file={fileData.file}
                        url={fileData.url}
                        onRemove={() => removeFile(index)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    acceptedTypes={['image/*', '.pdf', '.txt', '.doc', '.docx']}
                    maxSize={5}
                  />
                  
                  <div className="flex-1 relative">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tapez votre message..."
                      className="resize-none"
                      rows={2}
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </div>
                  </div>
                  
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() && uploadedFiles.length === 0}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Chat Info Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Membres en ligne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Admin Support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Vous</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-3">
                    + {Math.floor(Math.random() * 15) + 5} autres membres
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Règles du chat
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Restez respectueux envers tous les membres</p>
                <p>• Pas de spam ou de publicité</p>
                <p>• Aidez-vous mutuellement</p>
                <p>• Amusez-vous bien ! 🎉</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}