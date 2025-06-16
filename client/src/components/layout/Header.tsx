import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, User, Globe, Home, UserCircle, MessageCircle, Settings, UserCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { path: "/", label: t("home"), icon: Home },
    { path: "/personal", label: t("dashboard"), icon: UserCircle },
    { path: "/chat", label: t("chat"), icon: MessageCircle },
  ];

  if ((user as any)?.isAdmin) {
    navItems.push({ path: "/admin", label: t("admin"), icon: Settings });
  }

  return (
    <header className="border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">ב</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">{t("appName")}</h1>
                <p className="text-xs opacity-80">{language === "he" ? "פלטפורמת לוטו פרטית" : "Private Lottery Platform"}</p>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white bg-opacity-20 text-white font-medium' 
                      : 'hover:bg-white hover:bg-opacity-10'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            {user && (
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">{t('balance')}:</span>
                <span className="text-sm font-bold">
                  ₪{parseFloat((user as any).balance || "0").toLocaleString()}
                </span>
              </div>
            )}

            {/* Client Login Button - visible only when not logged in */}
            {!user && (
              <Button
                onClick={() => window.location.href = '/client-auth'}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-all duration-200"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                {t("clientLogin")}
              </Button>
            )}

            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 bg-white bg-opacity-20 border-white border-opacity-30 text-white">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="he">עברית</SelectItem>
              </SelectContent>
            </Select>

            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4" />
                  <span>
                    {(user as any).firstName || (user as any).email}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="ml-1 hidden sm:inline">{t('logout')}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-3 flex justify-around bg-white bg-opacity-10 rounded-lg p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white bg-opacity-20 text-white' 
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}