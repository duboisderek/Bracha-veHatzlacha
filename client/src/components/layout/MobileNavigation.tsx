import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Home, 
  User, 
  MessageCircle, 
  Settings,
  Trophy,
  Menu,
  X
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

interface MobileNavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  requiredAuth?: boolean;
}

export function MobileNavigation() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems: MobileNavItem[] = [
    {
      icon: <Home size={20} />,
      label: t('home'),
      href: '/',
    },
    {
      icon: <User size={20} />,
      label: t('dashboard'),
      href: '/dashboard',
      requiredAuth: true,
    },
    {
      icon: <MessageCircle size={20} />,
      label: t('chat'),
      href: '/chat',
      requiredAuth: true,
    },
    {
      icon: <Trophy size={20} />,
      label: t('admin'),
      href: '/admin',
      requiredAuth: true,
    },
    {
      icon: <Settings size={20} />,
      label: t('settings'),
      href: '/settings',
      requiredAuth: true,
    }
  ];

  const visibleItems = navItems.filter(item => 
    !item.requiredAuth || (item.requiredAuth && isAuthenticated)
  );

  // Version compacte avec 4 icônes principales
  const mainItems = visibleItems.slice(0, 4);
  const extraItems = visibleItems.slice(4);

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location.startsWith(href);
  };

  return (
    <>
      {/* Navigation mobile fixe en bas */}
      <div className="mobile-nav md:hidden bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-1">
          {mainItems.map((item, index) => (
            <Link key={item.href} href={item.href}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className={`touch-target flex flex-col items-center justify-center px-3 py-2 rounded-lg
                           transition-colors duration-200 ${
                  isActiveRoute(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </motion.button>
            </Link>
          ))}
          
          {/* Menu supplémentaire si plus de 4 items */}
          {extraItems.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="touch-target flex flex-col items-center justify-center px-3 py-2 rounded-lg
                         text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              {isExpanded ? <X size={20} /> : <Menu size={20} />}
              <span className="text-xs mt-1 font-medium">{t('menu')}</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Menu étendu */}
      {isExpanded && extraItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 
                     shadow-lg z-40 md:hidden"
        >
          <div className="p-4 space-y-2">
            {extraItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsExpanded(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg
                             transition-colors duration-200 ${
                    isActiveRoute(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Overlay pour fermer le menu */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}

// Version simplifiée pour certaines pages
export function MobileNavSimple() {
  const { t } = useLanguage();
  const [location] = useLocation();

  const quickItems = [
    { icon: <Home size={18} />, label: t('home'), href: '/' },
    { icon: <User size={18} />, label: t('dashboard'), href: '/dashboard' },
    { icon: <MessageCircle size={18} />, label: t('chat'), href: '/chat' },
  ];

  return (
    <div className="flex justify-center gap-4 p-4 bg-white border-t border-gray-200 md:hidden">
      {quickItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`touch-target flex items-center gap-2 px-4 py-2 rounded-full
                       transition-colors duration-200 ${
              location === item.href
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </motion.button>
        </Link>
      ))}
    </div>
  );
}