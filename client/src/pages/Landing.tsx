import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { Trophy, Users, Gift } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
            <div className="flex items-center space-x-3" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
              <AnimatedLogo size="md" />
              <div className="text-slate-900 font-bold text-xl bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                LotoPro
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
            style={{ textAlign: isRTL ? "right" : "left" }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
              Premium Online
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 block">
                Lottery Platform
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join thousands of players in our exclusive lottery community. 
              Choose your lucky numbers, win amazing prizes, and earn rewards 
              through our referral program.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-md" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                <Trophy className="text-yellow-500 w-8 h-8" />
                <div>
                  <div className="font-semibold text-slate-900">Big Prizes</div>
                  <div className="text-sm text-gray-600">Weekly jackpots</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-md" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                <Users className="text-blue-500 w-8 h-8" />
                <div>
                  <div className="font-semibold text-slate-900">Community</div>
                  <div className="text-sm text-gray-600">Thousands of players</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-md" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                <Gift className="text-green-500 w-8 h-8" />
                <div>
                  <div className="font-semibold text-slate-900">Referrals</div>
                  <div className="text-sm text-gray-600">Earn ₪100 per friend</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Login/Register Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {isLogin ? "Welcome Back!" : "Join LotoPro"}
                  </h2>
                  <p className="text-gray-600">
                    {isLogin 
                      ? "Sign in to your account to continue playing" 
                      : "Create your account and start winning today"
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1"
                      placeholder="Enter your password"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-slate-900 font-bold py-3"
                  >
                    {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-2 text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      {isLogin ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                </div>

                {/* Demo credentials */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    <strong>Demo:</strong> Use any email and password to login
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
