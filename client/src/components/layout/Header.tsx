import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { Coins, Settings } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user } = useAuth();

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(() => {
        window.location.reload();
      });
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
            <AnimatedLogo size="md" />
            <div className="text-slate-900 font-bold text-xl bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              LotoPro
            </div>
          </div>

          {/* Navigation and Controls */}
          <div className="flex items-center space-x-6" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
            {/* Balance Display */}
            {user && (
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 px-4 py-2 rounded-full font-semibold shadow-lg">
                <Coins className="inline w-4 h-4 mr-2" />
                <span>₪{user.balance}</span>
              </div>
            )}
            
            {/* Language Toggle */}
            <div className="flex bg-gray-100 rounded-full p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  language === "en"
                    ? "bg-slate-900 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                EN
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage("he")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  language === "he"
                    ? "bg-slate-900 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                עב
              </Button>
            </div>

            {/* Admin Panel Link */}
            {(user as any)?.isAdmin && (
              <Link href="/admin">
                <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  {t('admin_panel')}
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-2" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-700 font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
