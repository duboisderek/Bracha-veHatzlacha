import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { UserCircle, Mail, Lock, ArrowRight, Home } from "lucide-react";

export default function Login() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to dashboard after successful login
        window.location.href = "/personal";
      } else {
        setError(data.message || t("loginError"));
      }
    } catch (error) {
      setError(t("loginError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    window.location.href = "/register";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with back to home */}
        <div className="text-center mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white hover:bg-opacity-20 mb-4">
              <Home className="w-4 h-4 mr-2" />
              {t("backToHome")}
            </Button>
          </Link>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">ב</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t("appName")}</h1>
          <p className="text-white opacity-80">{t("clientLoginWelcome")}</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <UserCircle className="w-12 h-12 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {t("clientLogin")}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t("loginToAccount")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t("email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder={t("enterEmail")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t("password")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder={t("enterPassword")}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("signingIn")}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {t("signIn")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">{t("or")}</span>
              </div>
            </div>

            <Button
              onClick={handleCreateAccount}
              variant="outline"
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              disabled={isLoading}
            >
              {t("createAccount")}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4">
            <div className="text-center text-sm text-gray-600">
              {t("noAccount")}{" "}
              <Link href="/register">
                <span className="text-purple-600 hover:underline cursor-pointer font-medium">
                  {t("registerHere")}
                </span>
              </Link>
            </div>
            
            <div className="text-center text-xs text-gray-500">
              <span className="opacity-60">Accès administrateur via URL directe</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}