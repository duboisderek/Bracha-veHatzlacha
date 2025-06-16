import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Phone,
  MessageCircle,
  UserCheck,
  Settings
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";

export default function LandingOptimized() {
  const { language, setLanguage, t } = useLanguage();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { data: currentDraw } = useQuery({
    queryKey: ["/api/draws/current"],
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });

  const handleLogin = async (type: 'admin' | 'client') => {
    setIsLoggingIn(true);
    try {
      let response;
      
      if (type === 'client') {
        response = await fetch('/api/auth/demo-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ demoUser: 'client1' })
        });
      } else {
        response = await fetch('/api/auth/demo-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ demoUser: 'admin' })
        });
      }

      if (response.ok) {
        window.location.href = type === 'admin' ? '/admin' : '/personal';
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const formatTimeRemaining = (drawDate: string) => {
    const now = new Date();
    const draw = new Date(drawDate);
    const diff = draw.getTime() - now.getTime();
    
    if (diff <= 0) return "Draw in progress";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-yellow-400 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-orange-500 blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-500 blur-xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t("appName")}</h1>
              <p className="text-blue-200 text-sm">Premium Lottery Platform</p>
            </div>
          </div>

          {/* Language Selector */}
          <div>
            <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'he' | 'fr')}>
              <SelectTrigger className="w-40 bg-white bg-opacity-20 border-white border-opacity-30 text-white" id="language-selector">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>{language === 'he' ? 'עברית' : language === 'fr' ? 'Français' : 'English'}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300">
                <SelectItem value="en" className="cursor-pointer hover:bg-gray-100">
                  English
                </SelectItem>
                <SelectItem value="fr" className="cursor-pointer hover:bg-gray-100">
                  Français
                </SelectItem>
                <SelectItem value="he" className="cursor-pointer hover:bg-gray-100">
                  עברית
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Content */}
            <div className="space-y-8">
              
              {/* Hero Section */}
              <div className="text-center lg:text-left">
                <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  {t("welcomeToLottery")}
                </h2>
                <p className="text-xl text-blue-200 mb-8 leading-relaxed max-w-2xl">
                  Join thousands of players in our premium lottery platform. Choose your lucky numbers and win amazing prizes!
                </p>
                
                {/* Current Draw Info */}
                {currentDraw && (
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <h3 className="text-yellow-400 font-bold text-lg">{t("currentJackpot")}</h3>
                        <p className="text-white text-2xl font-bold">₪{Number((currentDraw as any).jackpotAmount).toLocaleString()}</p>
                      </div>
                      <div>
                        <h3 className="text-yellow-400 font-bold text-lg">{t("nextDraw")}</h3>
                        <p className="text-white text-2xl font-bold">
                          {formatTimeRemaining((currentDraw as any).drawDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Access Buttons */}
              <div className="space-y-4">
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl font-bold text-white mb-4">Choose Your Access</h3>
                  
                  <div className="grid gap-4">
                    {/* Client Authentication */}
                    <Button
                      onClick={() => window.location.href = '/client-auth'}
                      size="lg"
                      disabled={isLoggingIn}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-6 px-8 rounded-xl shadow-2xl text-lg transition-all duration-200"
                      id="client-auth-button"
                    >
                      <UserCheck className="w-6 h-6 mr-3" />
                      {t("clientLogin")}
                      <span className="text-sm ml-2 opacity-90">(Connexion / Inscription)</span>
                    </Button>

                    {/* Admin Login */}
                    <Button
                      onClick={() => window.location.href = '/admin'}
                      variant="outline"
                      size="lg"
                      disabled={isLoggingIn}
                      className="w-full bg-white bg-opacity-10 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 font-bold py-4 px-8 rounded-xl shadow-xl text-lg transition-all duration-200"
                    >
                      <Settings className="w-6 h-6 mr-3" />
                      Admin Access
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="flex justify-center lg:justify-start space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
                  onClick={() => window.open('https://wa.me/your-number', '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {t("contactWhatsApp")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
                  onClick={() => window.open('https://t.me/your-channel', '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t("contactTelegram")}
                </Button>
              </div>
            </div>

            {/* Right Column - Visual Elements */}
            <div className="relative">
              {/* Sample Numbers Display */}
              <Card className="bg-white bg-opacity-15 backdrop-blur-lg border border-white border-opacity-20 shadow-2xl rounded-3xl p-8">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-white mb-4">
                    {t("selectNumbers")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Sample Numbers Grid */}
                  <div className="grid grid-cols-6 gap-4 mb-8">
                    {[7, 14, 21, 28, 35, 37].map((number) => (
                      <div
                        key={number}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      >
                        {number}
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center text-white">
                    <div>
                      <div className="text-2xl font-bold">₪100</div>
                      <div className="text-sm opacity-75">Min. Ticket</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">37</div>
                      <div className="text-sm opacity-75">Numbers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">6</div>
                      <div className="text-sm opacity-75">Pick</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 text-center">
                  <div className="text-yellow-400 text-2xl font-bold">₪20</div>
                  <div className="text-white text-sm">Launch Bonus</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 text-center">
                  <div className="text-yellow-400 text-2xl font-bold">3</div>
                  <div className="text-white text-sm">Languages</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}