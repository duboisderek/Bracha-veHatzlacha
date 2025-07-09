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
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import PersonalArea from "@/pages/PersonalArea";
import ChatSupport from "@/pages/ChatSupport";
import Admin from "@/pages/AdminCleanMultilingual";
import RootAdminPanel from "@/pages/RootAdminPanel";
import HebrewTestPage from "@/pages/HebrewTestPage";
import AdvancedAnalytics from "@/pages/AdvancedAnalytics";
import CryptoPayments from "@/pages/CryptoPayments";
import Security from "@/pages/Security";
import Chat from "@/pages/Chat";
import AdminCryptoPayments from "@/pages/AdminCryptoPayments";
import AdminEmailConfig from "@/pages/AdminEmailConfig";
import AdminSystemLogs from "@/pages/AdminSystemLogs";
import RootAdminWallets from "@/pages/RootAdminWallets";
import SystemBackupRestore from "@/pages/SystemBackupRestore";
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
        <Route path="/register" component={Register} />
        <Route path="/admin-login" component={AdminLogin} />
        <Route path="/client-auth" component={ClientAuth} />
        
        {/* Protected client routes - require authentication */}
        <Route path="/home">
          <ProtectedRoute requireAuth={true}>
            <Home />
          </ProtectedRoute>
        </Route>
        
        <Route path="/personal">
          <ProtectedRoute requireAuth={true}>
            <PersonalArea />
          </ProtectedRoute>
        </Route>
        
        <Route path="/chat">
          <ProtectedRoute requireAuth={true}>
            <Chat />
          </ProtectedRoute>
        </Route>

        <Route path="/crypto-payments">
          <ProtectedRoute requireAuth={true}>
            <CryptoPayments />
          </ProtectedRoute>
        </Route>

        <Route path="/security">
          <ProtectedRoute requireAuth={true}>
            <Security />
          </ProtectedRoute>
        </Route>
        
        {/* Protected admin routes - require admin authentication */}
        <Route path="/admin">
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        </Route>

        <Route path="/advanced-analytics">
          <ProtectedRoute requireAdmin={true}>
            <AdvancedAnalytics />
          </ProtectedRoute>
        </Route>

        <Route path="/admin-crypto-payments">
          <ProtectedRoute requireAdmin={true}>
            <AdminCryptoPayments />
          </ProtectedRoute>
        </Route>

        <Route path="/admin-email-config">
          <ProtectedRoute requireAdmin={true}>
            <AdminEmailConfig />
          </ProtectedRoute>
        </Route>

        <Route path="/admin-system-logs">
          <ProtectedRoute requireAdmin={true}>
            <AdminSystemLogs />
          </ProtectedRoute>
        </Route>

        <Route path="/root-admin-wallets">
          <ProtectedRoute requireRootAdmin={true}>
            <RootAdminWallets />
          </ProtectedRoute>
        </Route>

        <Route path="/system-backup-restore">
          <ProtectedRoute requireRootAdmin={true}>
            <SystemBackupRestore />
          </ProtectedRoute>
        </Route>
        
        <Route path="/admin/*">
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        </Route>
        
        {/* Root Admin Panel - requires root admin privileges */}
        <Route path="/root-admin">
          <ProtectedRoute requireRootAdmin={true}>
            <RootAdminPanel />
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
