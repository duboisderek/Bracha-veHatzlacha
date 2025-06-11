import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  User, 
  Headphones,
  Clock,
  CheckCircle,
  Plus,
  Phone,
  Mail
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ChatMessage {
  id: string;
  userId?: string;
  message: string;
  isFromAdmin: boolean;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
  };
}

interface SupportRequest {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  responses: Array<{
    message: string;
    isFromAdmin: boolean;
    createdAt: string;
  }>;
}

// Live Chat Component
function LiveChat() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/chat/messages"],
    refetchInterval: 3000, // Refresh every 3 seconds for real-time feel
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      return apiRequest("POST", "/api/chat/send", { message: messageText });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="h-[500px] flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-blue-500" />
          {t("liveChat")}
          <Badge className="bg-green-100 text-green-800 ml-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            Online
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2 bg-gray-50 rounded-lg">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : messages && (messages as ChatMessage[]).length > 0 ? (
            (messages as ChatMessage[]).map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isFromAdmin ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.isFromAdmin
                      ? 'bg-white border border-gray-200'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.isFromAdmin ? (
                      <Headphones className="w-4 h-4 text-blue-500" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium">
                      {msg.isFromAdmin ? 'Support' : 'You'}
                    </span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t("chatWithSupport")}</p>
              <p className="text-xs mt-1">Start a conversation with our support team</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("typeMessage")}
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Support Request Form Component
function SupportRequestForm() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const createRequestMutation = useMutation({
    mutationFn: async (data: { subject: string; description: string }) => {
      return apiRequest("POST", "/api/support/request", data);
    },
    onSuccess: () => {
      toast({
        title: t("success"),
        description: "Support request created successfully",
      });
      setSubject("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/support/requests"] });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Failed to create support request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim() && description.trim()) {
      createRequestMutation.mutate({
        subject: subject.trim(),
        description: description.trim()
      });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-6 h-6 text-green-500" />
          {t("newSupportRequest")}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Subject
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("describeProblem")}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide detailed information about your issue..."
              rows={4}
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={!subject.trim() || !description.trim() || createRequestMutation.isPending}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            {createRequestMutation.isPending ? t("loading") : t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Support Requests History Component
function SupportRequestsHistory() {
  const { t } = useLanguage();
  
  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/support/requests"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-yellow-100 text-yellow-800">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-purple-500" />
          Support Request History
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t("loading")}</p>
          </div>
        ) : requests && (requests as SupportRequest[]).length > 0 ? (
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {(requests as SupportRequest[]).map((request) => (
              <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{request.subject}</h4>
                  {getStatusBadge(request.status)}
                </div>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {request.description}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                  <span>{request.responses.length} responses</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No support requests found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Contact Information Component
function ContactInformation() {
  const { t } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-white">Other Ways to Contact Us</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button
          variant="secondary"
          className="w-full bg-white text-blue-600 hover:bg-gray-100 flex items-center gap-2"
          onClick={() => window.open('https://wa.me/your-number', '_blank')}
        >
          <Phone className="w-4 h-4" />
          {t("contactWhatsApp")}
        </Button>
        
        <Button
          variant="secondary"
          className="w-full bg-white text-blue-600 hover:bg-gray-100 flex items-center gap-2"
          onClick={() => window.open('https://t.me/your-channel', '_blank')}
        >
          <MessageCircle className="w-4 h-4" />
          {t("contactTelegram")}
        </Button>
        
        <Button
          variant="secondary"
          className="w-full bg-white text-blue-600 hover:bg-gray-100 flex items-center gap-2"
          onClick={() => window.open('mailto:support@brachavehatzlacha.com', '_blank')}
        >
          <Mail className="w-4 h-4" />
          Email Support
        </Button>
        
        <div className="text-center text-sm opacity-90 mt-4">
          <p>Support Hours:</p>
          <p>Sunday - Thursday: 9:00 AM - 6:00 PM</p>
          <p>Friday: 9:00 AM - 2:00 PM</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChatSupport() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {t("chat")}
          </h1>
          <p className="text-lg text-gray-600">
            We're here to help you with any questions or issues
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Live Chat */}
          <div className="lg:col-span-2">
            <LiveChat />
          </div>

          {/* Right Column - Support Options */}
          <div className="space-y-6">
            <ContactInformation />
          </div>
        </div>

        {/* Bottom Section - Support Requests */}
        <div className="grid md:grid-cols-2 gap-8">
          <SupportRequestForm />
          <SupportRequestsHistory />
        </div>
      </div>
    </div>
  );
}