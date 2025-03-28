import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClientAgenda from "./pages/ClientAgenda";
import ClientPostDetail from "./pages/ClientPostDetail";
import Login from "./pages/Login";
import ClientView from "./pages/ClientView";
import Admin from "./pages/Admin";
import { SettingsProvider } from "./contexts/SettingsContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Check initial login state
  useEffect(() => {
    // If user chose "remember me", keep them logged in
    // Otherwise, check if the session should expire (e.g., browser was closed)
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    // If remember me is not set or false, and this is a new browser session,
    // we could clear the login state here.
    // For now we'll keep the existing behavior, but this is where you'd add that logic
    
    setInitialCheckDone(true);
  }, []);
  
  if (!initialCheckDone) {
    return null; // Or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SettingsProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/agenda" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/client/:clientId" 
                element={
                  <ProtectedRoute>
                    <ClientAgenda />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/client/:clientId/post/:postId" 
                element={
                  <ProtectedRoute>
                    <ClientPostDetail />
                  </ProtectedRoute>
                } 
              />
              {/* Admin route */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } 
              />
              {/* Unified client view page - accessible without login */}
              <Route path="/client-view/:clientId" element={<ClientView />} />
              {/* Redirect old routes to new one */}
              <Route path="/shared/client/:clientId" element={<Navigate to="/client-view/:clientId" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SettingsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
