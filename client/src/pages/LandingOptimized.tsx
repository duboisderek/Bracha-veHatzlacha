import { useState, memo, useMemo, lazy, Suspense, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

// Lazy load des composants non-critiques
const FloatingParticles = lazy(() => import("@/components/ui/floating-particles").then(m => ({ default: m.FloatingParticles })));
const LotteryBall = lazy(() => import("@/components/ui/lottery-ball").then(m => ({ default: m.LotteryBall })));

// Skeleton optimisé
const ComponentSkeleton = memo(() => (
  <div className="animate-pulse bg-white bg-opacity-10 rounded-lg h-8 w-full" />
));

// Animation variants optimisées
const fadeInVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

const scaleVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 }
};

// Composant Stats memoizé
const StatsCard = memo(({ icon: Icon, title, value, description }: {
  icon: any;
  title: string;
  value: string;
  description: string;
}) => (
  <motion.div
    variants={fadeInVariants}
    className="text-center p-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl border border-white border-opacity-20"
  >
    <Icon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
    <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
    <p className="text-lg font-semibold text-yellow-300 mb-1">{title}</p>
    <p className="text-sm text-blue-200">{description}</p>
  </motion.div>
));

const Landing = memo(() => {
  const { language, setLanguage, t } = useLanguage();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { data: currentDraw } = useQuery({
    queryKey: ["/api/draws/current"],
    staleTime: 5 * 60 * 1000,
  });

  // Memoized calculations
  const jackpotDisplay = useMemo(() => {
    const draw = currentDraw as any;
    if (!draw?.jackpotAmount) return "40,030";
    return parseInt(draw.jackpotAmount).toLocaleString();
  }, [currentDraw]);

  const drawNumber = useMemo(() => {
    const draw = currentDraw as any;
    return draw?.drawNumber || 1254;
  }, [currentDraw]);

  // Optimized event handlers
  const handleLogin = useCallback(async (type: 'admin' | 'client') => {
    setIsLoggingIn(true);
    try {
      let response;
      
      if (type === 'client') {
        response = await fetch('/api/auth/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ demoUser: 'client1' })
        });
      } else {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            email: 'demo@brachavehatzlacha.com', 
            password: 'demo123' 
          })
        });
      }
      
      if (response.ok) {
        window.location.reload();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || `${type} login failed`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const handleLanguageChange = useCallback((value: string) => {
    setLanguage(value as 'en' | 'he' | 'fr');
  }, [setLanguage]);

  // Memoized stats data
  const statsData = useMemo(() => [
    { icon: Trophy, title: t("currentJackpot"), value: `₪${jackpotDisplay}`, description: t("nextDraw") },
    { icon: Users, title: "Active Players", value: "2,500+", description: "Join the community" },
    { icon: Clock, title: t("drawNumber"), value: `#${drawNumber}`, description: t("timeUntilDraw") },
    { icon: Shield, title: "Security", value: "100%", description: "Protected & Licensed" }
  ], [jackpotDisplay, drawNumber, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <Suspense fallback={<ComponentSkeleton />}>
        <FloatingParticles count={60} />
      </Suspense>
      
      {/* Optimized Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 animate-pulse will-change-transform"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-400 rounded-full opacity-10 animate-bounce will-change-transform"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-400 rounded-full opacity-10 animate-pulse will-change-transform"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-2xl">ב</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t("appName")}</h1>
              <p className="text-sm text-blue-200">{t("welcomeMessage")}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40 bg-white bg-opacity-20 border-white border-opacity-30 text-white">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <SelectValue placeholder={language === 'he' ? 'עברית' : language === 'fr' ? 'Français' : 'English'} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300">
                <SelectItem value="en" className="cursor-pointer hover:bg-gray-100">English</SelectItem>
                <SelectItem value="fr" className="cursor-pointer hover:bg-gray-100">Français</SelectItem>
                <SelectItem value="he" className="cursor-pointer hover:bg-gray-100">עברית</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-yellow-400 text-purple-900 font-bold px-4 py-2 text-lg mb-6">
                ⚡ Live Now - {t("currentJackpot")}
              </Badge>
              <h2 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Win Big with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 block">
                  {t("appName")}
                </span>
              </h2>
              <p className="text-xl text-blue-200 mb-8 leading-relaxed">
                Experience the thrill of our premium lottery platform. Choose your lucky numbers and join thousands of winners!
              </p>
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
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => window.location.href = '/client-auth'}
                      size="lg"
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-6 px-8 rounded-xl shadow-2xl text-lg transition-all duration-200"
                    >
                      <UserCheck className="w-6 h-6 mr-3" />
                      {t("clientLogin")}
                      <span className="text-sm ml-2 opacity-90">(Connexion / Inscription)</span>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => window.location.href = '/admin'}
                      variant="outline"
                      size="lg"
                      className="w-full bg-white bg-opacity-10 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 font-bold py-4 px-8 rounded-xl shadow-xl text-lg transition-all duration-200"
                    >
                      <Settings className="w-6 h-6 mr-3" />
                      Admin Access
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

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
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
                        <Suspense fallback={<div className="w-12 h-12 bg-yellow-400 rounded-full animate-pulse" />}>
                          <LotteryBall number={number} size="lg" />
                        </Suspense>
                      </motion.div>
                    ))}
                  </div>

                  {/* Stats Grid */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="grid grid-cols-2 gap-4 mb-8"
                  >
                    {statsData.slice(0, 2).map((stat, index) => (
                      <StatsCard key={index} {...stat} />
                    ))}
                  </motion.div>

                  {/* CTA Button */}
                  <div className="flex justify-center space-x-6">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
        >
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </motion.div>
      </main>
    </div>
  );
});

Landing.displayName = 'Landing';

export default Landing;