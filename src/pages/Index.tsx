import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RegistrationForm } from "@/components/RegistrationForm";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLogin } from "@/components/AdminLogin";
import { Link, Phone, Settings, UserCheck } from "lucide-react";
import Navbar from "@/components/ui/navbar";
import TournamentBracket from "@/components/Tournoi";

interface Player {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  telephone: string;
  team_id?: string;
  group_id?: string;
  goals?: number;
  assists?: number;
  matches_played?: number;
  yellow_cards?: number;
  red_cards?: number;

  date_inscription: string;
}



type ViewMode = "registration" | "admin-login" | "admin-dashboard" | "tournament" | "profil" | "Planning";

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewMode>("registration");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const handlePlayerAdded = (newPlayer: Player) => {
    setPlayers(prev => [...prev, newPlayer]);
  };

  const handleDeletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setIsAdminLoggedIn(true);
      setCurrentView("admin-dashboard");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentView("registration");
  };

  const renderCurrentView = () => {
  switch (currentView) {
    case "registration":
      return <RegistrationForm onPlayerAdded={handlePlayerAdded} />;
    case "admin-login":
      return <AdminLogin onLogin={handleAdminLogin} />;
    case "admin-dashboard":
      return <AdminDashboard onLogout={handleAdminLogout} />;
    case "tournament":
      return <TournamentBracket />;
    case "Planning":
  return <div className="text-white p-8 text-center">Page Planning à venir...</div>;
case "profil":
  return <div className="text-white p-8 text-center">Page Profil à venir...</div>;

    default:
      return null;
  }
  };

  return (
    <div className="relative">
      <div className="relative">
  {/* Navbar avec vue dynamique */}
  <Navbar currentView={currentView} setCurrentView={setCurrentView} />

  {/* Current View */}
  <div> {/* décale pour ne pas être caché */}
    {renderCurrentView()}
  </div>
</div>


    </div>
    
  );
};



export default Index;