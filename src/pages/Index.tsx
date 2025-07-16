import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RegistrationForm } from "@/components/RegistrationForm";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLogin } from "@/components/AdminLogin";
import { Settings, UserCheck } from "lucide-react";

interface Player {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  telephone: string;
  team_id?: string;
  group_id?: string;
  date_inscription: string;
}

type ViewMode = "registration" | "admin-login" | "admin-dashboard";

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
        return (
          <RegistrationForm 
            onPlayerAdded={handlePlayerAdded}
          />
        );
      case "admin-login":
        return (
          <AdminLogin 
            onLogin={handleAdminLogin}
          />
        );
      case "admin-dashboard":
        return (
          <AdminDashboard 
            players={players}
            onDeletePlayer={handleDeletePlayer}
            onLogout={handleAdminLogout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Navigation Toggle */}
      {currentView !== "admin-dashboard" && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => {
              if (currentView === "registration") {
                setCurrentView("admin-login");
              } else if (currentView === "admin-login") {
                setCurrentView("registration");
              }
            }}
            variant="outline"
            className="bg-background/95 backdrop-blur shadow-lg"
          >
            {currentView === "registration" ? (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Administration
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Inscription
              </>
            )}
          </Button>
        </div>
      )}

      {/* Current View */}
      {renderCurrentView()}
    </div>
  );
};

export default Index;