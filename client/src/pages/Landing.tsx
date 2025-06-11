import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { 
  Trophy, 
  Clock, 
  Coins, 
  Star, 
  Globe, 
  Shield,
  Users,
  Zap,
  Crown,
  Gift,
  Phone,
  MessageCircle,
  UserCheck,
  Settings
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  const { language, setLanguage, t } = useLanguage();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { data: currentDraw } = useQuery({
    queryKey: ["/api/draws/current"],
  });

  const handleLogin = async (type: 'admin' | 'client') => {
    setIsLoggingIn(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ type })
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <FloatingParticles count={60} />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-400 rounded-full opacity-10 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-400 rounded-full opacity-10 animate-pulse"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-2xl">ב</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {t("appName")}
              </h1>
              <p className="text-sm text-blue-200">{t("welcomeMessage")}</p>
            </div>
          </motion.div>

          {/* Language Selector */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40 bg-white bg-opacity-20 border-white border-opacity-30 text-white">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="he">עברית</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Welcome Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="text-center lg:text-left">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              >
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  ברכה
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  והצלחה
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-blue-200 mb-8"
              >
                {t("welcomeMessage")}
              </motion.p>
            </div>

            {/* Current Jackpot Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white border-0 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-20 animate-pulse"></div>
                <CardHeader className="text-center relative z-10">
                  <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
                    <Crown className="w-10 h-10 animate-bounce" />
                    {t("currentJackpot")}
                    <Crown className="w-10 h-10 animate-bounce" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center relative z-10">
                  <div className="text-5xl font-bold mb-4 animate-pulse">
                    ₪{currentDraw ? parseFloat((currentDraw as any).jackpotAmount).toLocaleString() : "125,000"}
                  </div>
                  <div className="text-lg opacity-90 flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    Next draw in 2 days 5 hours
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Login Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold text-white mb-4">Choose Your Access</h3>
                
                <div className="grid gap-4">
                  {/* Client Login Only */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => handleLogin('client')}
                      disabled={isLoggingIn}
                      size="lg"
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-6 px-8 rounded-xl shadow-2xl text-lg"
                    >
                      <UserCheck className="w-6 h-6 mr-3" />
                      {isLoggingIn ? t("loading") : "Entrer en tant que Client"}
                      <span className="text-sm ml-2 opacity-90">(Compte Démo)</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Quick Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="flex justify-center lg:justify-start space-x-4"
            >
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
            </motion.div>
          </motion.div>

          {/* Right Column - Visual Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            {/* Lottery Balls Display */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl opacity-30 blur-xl animate-pulse"></div>
              <Card className="relative bg-white bg-opacity-15 backdrop-blur-lg border border-white border-opacity-20 shadow-2xl rounded-3xl p-8">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-white mb-4">
                    {t("selectNumbers")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Sample Numbers Grid */}
                  <div className="grid grid-cols-6 gap-4 mb-8">
                    {[7, 14, 21, 28, 35, 37].map((number, index) => (
                      <motion.div
                        key={number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <LotteryBall
                          number={number}
                          selected={true}
                          size="lg"
                          className="animate-bounce"
                        />
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="text-center space-y-3">
                    <Badge className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-6 py-3 text-lg font-bold">
                      Ticket Cost: ₪100
                    </Badge>
                    <p className="text-white text-sm opacity-80">
                      Choose 6 numbers from 1-37
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-10 -left-10 animate-bounce">
              <Coins className="w-20 h-20 text-yellow-400 opacity-60" />
            </div>
            <div className="absolute -bottom-10 -right-10 animate-pulse">
              <Star className="w-24 h-24 text-purple-400 opacity-60" />
            </div>
            <div className="absolute top-1/2 -left-5 animate-spin">
              <Gift className="w-16 h-16 text-pink-400 opacity-60" />
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-24 grid md:grid-cols-4 gap-8"
        >
          <Card className="text-center p-8 bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-3">Massive Jackpots</h3>
            <p className="text-blue-200 text-sm">Life-changing prizes every draw</p>
          </Card>

          <Card className="text-center p-8 bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <Shield className="w-16 h-16 text-green-400 mx-auto mb-6 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-3">100% Secure</h3>
            <p className="text-blue-200 text-sm">Advanced security & instant payouts</p>
          </Card>

          <Card className="text-center p-8 bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <Users className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-3">Referral Rewards</h3>
            <p className="text-blue-200 text-sm">Earn ₪100 for each friend you refer</p>
          </Card>

          <Card className="text-center p-8 bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <Clock className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-3">Regular Draws</h3>
            <p className="text-blue-200 text-sm">Multiple chances to win every week</p>
          </Card>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mt-20 text-center"
        >
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 shadow-2xl p-12">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Change Your Life?
            </h2>
            <p className="text-xl text-blue-200 mb-8">
              Join {t("appName")} today and start your journey to fortune
            </p>
            <div className="flex justify-center space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleLogin('client')}
                  disabled={isLoggingIn}
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-6 px-16 rounded-full shadow-2xl text-xl"
                >
                  <Star className="w-6 h-6 mr-2" />
                  Start Playing Now
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}