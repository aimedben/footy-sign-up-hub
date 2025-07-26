import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PublicPlayersList } from "./components/compo/PublicPlayersList";
import { AdminLogin } from "./components/AdminLogin";
import Tournoi from "./components/Tournoi";
import { AdminDashboard } from "./components/AdminDashboard";
import ContactForm from "./components/contact";
import { AuthForm } from "./components/AuthForm";
import Profile from "./components/profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          <Route path="/tournoi" element={<Tournoi />} />
          <Route path="/joueurs" element={<PublicPlayersList />} />
          {/* Admin Login Route */}
          <Route path="admin-dashboard" element={<AdminDashboard onLogout={function (): void {
            throw new Error("Function not implemented.");
          } }/>} />
          <Route
            path="/admin-login"
            element={<AdminLogin onLogin={(success: boolean) => {
              // Tu peux gérer ici ce qui se passe après login si besoin
              if (success) console.log("Admin connecté");
            }} />}
          />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/profile" element={<Profile />} />


        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
