import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/LandingOptimized";
import AdminLogin from "@/pages/AdminLogin";
import ClientAuth from "@/pages/ClientAuth";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import PersonalArea from "@/pages/PersonalArea";
import ChatSupport from "@/pages/ChatSupport";
import Admin from "@/pages/AdminCleanMultilingual";
import HebrewTestPage from "@/pages/HebrewTestPage";
import { Header } from "@/components/layout/Header";
import { PublicHeader } from "@/components/layout/PublicHeader";

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
      {isAuthenticated ? <Header /> : <PublicHeader />}
      <Switch>
        {/* Public routes - accessible to everyone */}
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/client-auth" component={ClientAuth} />
        <Route path="/admin-login" component={AdminLogin} />
        
        {/* Protected client routes - require authentication */}
        <Route path="/personal">
          <ProtectedRoute requireAuth={true}>
            <PersonalArea />
          </ProtectedRoute>
        </Route>
        
        <Route path="/chat">
          <ProtectedRoute requireAuth={true}>
            <ChatSupport />
          </ProtectedRoute>
        </Route>
        
        {/* Protected admin routes - require admin authentication */}
        <Route path="/admin">
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        </Route>
        
        <Route path="/admin/*">
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        </Route>
        
        {/* Development/Test routes */}
        <Route path="/hebrew-test" component={HebrewTestPage} />
        
        {/* Fallback route */}
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
