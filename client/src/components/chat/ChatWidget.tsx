import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

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

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !socket && user) {
      // Connect to WebSocket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("Connected to chat");
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "chat") {
          setMessages(prev => [...prev, data.data]);
        }
      };

      ws.onclose = () => {
        console.log("Disconnected from chat");
        setSocket(null);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      return () => {
        ws.close();
      };
    }
  }, [isOpen, user]);

  useEffect(() => {
    // Load initial messages when opening chat
    if (isOpen && user) {
      fetch('/api/chat/messages', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          setMessages(data.reverse()); // Reverse to show oldest first
        })
        .catch(console.error);
    }
  }, [isOpen, user]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket || !user) return;

    const message = {
      type: "chat",
      userId: user.id,
      content: inputMessage.trim(),
    };

    socket.send(JSON.stringify(message));
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        style={{ left: isRTL ? "1.5rem" : "auto", right: isRTL ? "auto" : "1.5rem" }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-slate-900 p-4 rounded-full shadow-lg hover:shadow-xl"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-20 right-6 z-50 w-80"
            style={{ left: isRTL ? "1.5rem" : "auto", right: isRTL ? "auto" : "1.5rem" }}
          >
            <Card className="shadow-2xl border-0 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                    <MessageCircle className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">{t("supportChat")}</div>
                      <div className="text-xs opacity-80">We're here to help!</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-gray-300 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-64 p-4 overflow-y-auto bg-gray-50 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm">
                    Start a conversation with our support team!
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromAdmin ? (isRTL ? "justify-end" : "justify-start") : (isRTL ? "justify-start" : "justify-end")}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 shadow-sm ${
                        message.isFromAdmin
                          ? "bg-white text-gray-800"
                          : "bg-yellow-500 text-slate-900"
                      }`}
                    >
                      <div className="text-sm">{message.message}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.isFromAdmin ? "Support" : "You"} • {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-2" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={!socket || !user}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || !socket || !user}
                    className="bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
