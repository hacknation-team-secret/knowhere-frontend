import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { CityShellRoute } from "./cityApp/CityShellRoute";
import GroupWizard from "./cityApp/pages/GroupWizard";

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
              {/* Legacy routes redirected to the wizard */}
              <Route path="groups" element={<Navigate to="/app" replace />} />
              <Route path="wallets/shared" element={<Navigate to="/app" replace />} />
              <Route path="detour" element={<Navigate to="/app" replace />} />
              <Route path="detour/:id" element={<Navigate to="/app" replace />} />
              <Route path="passport" element={<Navigate to="/app" replace />} />
              <Route path="events" element={<Navigate to="/app" replace />} />
              <Route path="research" element={<Navigate to="/app" replace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
