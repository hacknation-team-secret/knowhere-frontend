import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { CityShellRoute } from "./cityApp/CityShellRoute";
import CityPulse from "./cityApp/pages/CityPulse";
import Detour from "./cityApp/pages/Detour";
import DetourDetail from "./cityApp/pages/DetourDetail";
import Events from "./cityApp/pages/Events";
import Research from "./cityApp/pages/Research";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            <Route path="events" element={<Events />} />
            <Route path="research" element={<Research />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
