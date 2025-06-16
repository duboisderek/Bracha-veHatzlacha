import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      // Try universal auth endpoint first, then fallback to admin-specific
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.user && userData.user.isAdmin) {
          window.location.href = '/admin';
        } else {
          toast({
            title: "Access Denied",
            description: "Admin privileges required",
            variant: "destructive"
          });
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Connection Error",
          description: errorData.message || "Email ou mot de passe incorrect",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Server connection error",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-400 rounded-full opacity-10 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-400 rounded-full opacity-10 animate-pulse"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Administration</h1>
              <p className="text-sm text-purple-200">Bracha veHatzlacha</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12 flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <Shield className="w-6 h-6 text-purple-400" />
                Admin Login
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@brachavehatzlacha.com"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3"
                >
                  {isLoggingIn ? "Connecting..." : "Login"}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/80 text-center">
                  <strong>Identifiants par défaut:</strong><br />
                  Email: admin@brachavehatzlacha.com<br />
                  Mot de passe: BrachaVeHatzlacha2024!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}