import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserPlus, Eye, EyeOff, ArrowLeft, Phone, Mail } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { FloatingParticles } from "@/components/ui/floating-particles";

export default function ClientAuth() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  // Registration form state
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (!userData.user.isAdmin) {
          toast({
            title: "Connexion réussie",
            description: `Bienvenue ${userData.user.firstName}!`,
          });
          // Redirection vers l'interface client
          window.location.href = '/home';
        } else {
          toast({
            title: "Erreur",
            description: "Utilisez la page admin pour vous connecter",
            variant: "destructive"
          });
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur de connexion",
          description: errorData.message || "Email ou mot de passe incorrect",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }
    
    if (registerData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          email: registerData.email,
          phoneNumber: registerData.phoneNumber,
          password: registerData.password,
          language: isRTL ? 'he' : 'en'
        })
      });
      
      if (response.ok) {
        toast({
          title: "Compte créé",
          description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        });
        // Reset registration form
        setRegisterData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur d'inscription",
          description: errorData.message || "Erreur lors de la création du compte",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <FloatingParticles count={30} />
      
      {/* Header */}
      <header role="banner" className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backToHome")}
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t("clientAccess")}</h1>
              <p className="text-sm text-blue-200">Bracha veHatzlacha</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main role="main" className="relative z-10 container mx-auto px-6 py-12 flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                {t("welcomeToLottery")}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10">
                  <TabsTrigger value="login" className="text-white data-[state=active]:bg-white/20">
                    <User className="w-4 h-4 mr-2" />
                    {t("login")}
                  </TabsTrigger>
                  <TabsTrigger value="register" className="text-white data-[state=active]:bg-white/20">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t("register")}
                  </TabsTrigger>
                </TabsList>
                
                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-white">
                        <Mail className="w-4 h-4 inline mr-2" />
                        {t("email")}
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="votre.email@example.com"
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-white">
                        {t("password")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="••••••••"
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3"
                    >
                      {isLoading ? t("loading") : t("login")}
                    </Button>
                  </form>
                </TabsContent>
                
                {/* Register Tab */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white">{t("firstName")}</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white">{t("lastName")}</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-white">
                        <Mail className="w-4 h-4 inline mr-2" />
                        {t("email")}
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="votre.email@example.com"
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-white">
                        <Phone className="w-4 h-4 inline mr-2" />
                        {t("phoneNumber")}
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={registerData.phoneNumber}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="+972-XX-XXX-XXXX"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-white">{t("password")}</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">{t("confirmPassword")}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="••••••••"
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3"
                    >
                      {isLoading ? t("loading") : t("createAccount")}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              {/* Demo Access Note */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/80 text-center">
                  <strong>Accès de test disponible:</strong><br />
                  Email: client1@brachavehatzlacha.com<br />
                  Mot de passe: client123
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}