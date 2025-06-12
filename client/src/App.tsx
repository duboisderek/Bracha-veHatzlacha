import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import AdminLogin from "@/pages/AdminLogin";
import Home from "@/pages/Home";
import PersonalArea from "@/pages/PersonalArea";
import ChatSupport from "@/pages/ChatSupport";
import Admin from "@/pages/AdminFunctional";
import { Header } from "@/components/layout/Header";

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {isAuthenticated && <Header />}
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/admin" component={AdminLogin} />
            <Route path="/admin/*" component={AdminLogin} />
          </>
        ) : (
          <>
            {(user as any)?.isAdmin ? (
              <>
                <Route path="/admin" component={Admin} />
                <Route path="/admin/*" component={Admin} />
                <Route path="/" component={Landing} />
              </>
            ) : (
              <>
                <Route path="/" component={Home} />
                <Route path="/personal" component={PersonalArea} />
                <Route path="/chat" component={ChatSupport} />
                <Route path="/admin" component={AdminLogin} />
              </>
            )}
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
