import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { CityShellRoute } from "./cityApp/CityShellRoute";
import CityPulse from "./cityApp/pages/CityPulse";
import Detour from "./cityApp/pages/Detour";
import DetourDetail from "./cityApp/pages/DetourDetail";
import Research from "./cityApp/pages/Research";
import SharedWallets from "./cityApp/pages/SharedWallets";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/app" element={<CityShellRoute />}>
              <Route index element={<CityPulse />} />
              <Route path="detour" element={<Detour />} />
              <Route path="detour/:id" element={<DetourDetail />} />
              <Route path="passport" element={<Detour />} />
              <Route path="events" element={<Navigate to="/app/research" replace />} />
              <Route path="research" element={<Research />} />
              <Route path="wallets/shared" element={<SharedWallets />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
