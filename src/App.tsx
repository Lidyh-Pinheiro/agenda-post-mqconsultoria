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
import SharedClientAgenda from "./pages/SharedClientAgenda";
import ClientSharedView from "./pages/ClientSharedView";
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
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              {/* Public shared agenda routes - no authentication required */}
              <Route path="/shared/client/:clientId" element={<SharedClientAgenda />} />
              <Route path="/client-view/:clientId" element={<ClientSharedView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
