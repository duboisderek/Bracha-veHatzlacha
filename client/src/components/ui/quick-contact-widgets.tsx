import { MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "./button";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuickContactWidgetsProps {
  className?: string;
}

export function QuickContactWidgets({ className = "" }: QuickContactWidgetsProps) {
  const { t } = useLanguage();

  const contacts = [
    {
      name: "WhatsApp",
      icon: Phone,
      url: "https://wa.me/972501234567", // Replace with actual WhatsApp number
      color: "bg-green-500 hover:bg-green-600",
      textColor: "text-white"
    },
    {
      name: "Telegram", 
      icon: Send,
      url: "https://t.me/brachavehatzlacha", // Replace with actual Telegram
      color: "bg-blue-500 hover:bg-blue-600",
      textColor: "text-white"
    },
    {
      name: t("chat_support"),
      icon: MessageCircle,
      url: "/chat-support",
      color: "bg-amber-500 hover:bg-amber-600",
      textColor: "text-white"
    }
  ];

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col gap-2 ${className}`}>
      {contacts.map((contact, index) => (
        <Button
          key={contact.name}
          size="sm"
          className={`${contact.color} ${contact.textColor} shadow-lg transition-all duration-300 hover:scale-105 p-3 rounded-full`}
          onClick={() => {
            if (contact.url.startsWith('/')) {
              window.location.href = contact.url;
            } else {
              window.open(contact.url, '_blank');
            }
          }}
          title={contact.name}
        >
          <contact.icon className="h-5 w-5" />
        </Button>
      ))}
    </div>
  );
}