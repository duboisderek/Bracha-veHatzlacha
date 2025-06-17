import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Home, UserCheck, Shield } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export function PublicHeader() {
  const { language, setLanguage, t } = useLanguage();

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
          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            <Link href="/">
              <div className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg transition-all cursor-pointer hover:bg-white hover:bg-opacity-10">
                <Home className="w-4 h-4" />
                <span className="text-sm">{t("home")}</span>
              </div>
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Client Login Button */}
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-all duration-200"
            >
              <UserCheck className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t("clientLogin")}
            </Button>

            {/* Admin Access Button */}
            <Button
              onClick={() => window.location.href = '/admin-login'}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600"
            >
              <Shield className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t("admin")}
            </Button>

            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 bg-white bg-opacity-20 border-white border-opacity-30 text-white">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
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
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-3 flex justify-around bg-white bg-opacity-10 rounded-lg p-2">
          <Link href="/">
            <div className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all cursor-pointer hover:bg-white hover:bg-opacity-10">
              <Home className="w-5 h-5" />
              <span className="text-xs">{t("home")}</span>
            </div>
          </Link>
          
          <div 
            onClick={() => window.location.href = '/login'}
            className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all cursor-pointer hover:bg-white hover:bg-opacity-10"
          >
            <UserCheck className="w-5 h-5" />
            <span className="text-xs">{t("clientLogin")}</span>
          </div>
          
          <div 
            onClick={() => window.location.href = '/admin-login'}
            className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all cursor-pointer hover:bg-white hover:bg-opacity-10"
          >
            <Shield className="w-5 h-5" />
            <span className="text-xs">{t("admin")}</span>
          </div>
        </nav>
      </div>
    </header>
  );
}