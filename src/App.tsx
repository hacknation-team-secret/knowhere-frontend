import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { CityShellRoute } from "./cityApp/CityShellRoute";
import Groups from "./cityApp/pages/Groups";
import GroupWizard from "./cityApp/pages/GroupWizard";
import SharedWallets from "./cityApp/pages/SharedWallets";
import ResearchPage from "./cityApp/pages/ResearchPage";
import Detour from "./cityApp/pages/Detour";

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
              <Route index element={<GroupWizard />} />
              <Route path="groups" element={<Groups />} />
              <Route path="wallets/shared" element={<SharedWallets />} />
              <Route path="detour" element={<Detour />} />
              <Route path="passport" element={<Navigate to="/app/detour" replace />} />
              <Route path="research" element={<ResearchPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
