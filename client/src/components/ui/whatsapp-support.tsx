import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface WhatsAppSupportProps {
  phoneNumber?: string;
  className?: string;
}

export function WhatsAppSupport({ 
  phoneNumber = "+972509948023",
  className = "" 
}: WhatsAppSupportProps) {
  const { t, isRTL } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(t('whatsapp_default_message'));
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`fixed z-50 ${className}`} 
         style={{ 
           [isRTL ? 'left' : 'right']: '16px',
           bottom: '16px'
         }}>
      <motion.button
        onClick={handleWhatsAppClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
        className="group relative bg-green-500 hover:bg-green-600 active:bg-green-700 text-white 
                   rounded-full shadow-lg transition-all duration-300 hover:shadow-xl
                   touch-target-large md:p-3 p-4"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <MessageCircle size={24} className="group-hover:animate-pulse md:w-6 md:h-6 w-7 h-7" />
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -10 : 10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isRTL ? -10 : 10, scale: 0.8 }}
              className={`absolute bottom-0 ${isRTL ? 'left-full ml-3' : 'right-full mr-3'} 
                         bg-gray-900 text-white mobile-text-sm px-3 py-2 rounded-lg 
                         shadow-lg border border-gray-700 max-w-xs md:max-w-none`}
            >
              {t('whatsapp_support_tooltip')}
              <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45
                             ${isRTL ? '-right-1 border-r border-b border-gray-700' : '-left-1 border-l border-t border-gray-700'}`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation ring */}
        <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
      </motion.button>
    </div>
  );
}

// Version minimale pour les pages où l'espace est limité
export function WhatsAppSupportMini({ 
  phoneNumber = "+972509948023",
  className = "" 
}: WhatsAppSupportProps) {
  const { t } = useLanguage();

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(t('whatsapp_default_message'));
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className={`inline-flex items-center gap-2 text-green-600 hover:text-green-700 
                 transition-colors duration-200 text-sm ${className}`}
      title={t('whatsapp_support_tooltip')}
    >
      <MessageCircle size={16} />
      <span className="hidden sm:inline">{t('whatsapp_support')}</span>
    </button>
  );
}