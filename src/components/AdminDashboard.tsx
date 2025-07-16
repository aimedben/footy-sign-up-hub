import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Trophy, 
  Calendar, 
  Trash2, 
  Edit,
  Shield,
  LogOut,
  Search,
  Filter
} from "lucide-react";

interface Player {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  dateInscription: string;
}

interface AdminDashboardProps {
  players: Player[];
  onDeletePlayer: (id: string) => void;
  onLogout: () => void;
}

export function AdminDashboard({ players, onDeletePlayer, onLogout }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const { toast } = useToast();

  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAge = ageFilter === "" || 
      (ageFilter === "young" && player.age < 25) ||
      (ageFilter === "middle" && player.age >= 25 && player.age < 35) ||
      (ageFilter === "older" && player.age >= 35);

    return matchesSearch && matchesAge;
  });

  const handleDeletePlayer = (player: Player) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${player.prenom} ${player.nom} ?`)) {
      onDeletePlayer(player.id);
      toast({
        title: "Joueur supprimé",
        description: `${player.prenom} ${player.nom} a été retiré du tournoi`,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAgeGroup = (age: number) => {
    if (age < 25) return { label: "Jeune", color: "bg-blue-500" };
    if (age < 35) return { label: "Adulte", color: "bg-green-500" };
    return { label: "Senior", color: "bg-orange-500" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary-foreground" />
              <div>
                <h1 className="text-3xl font-bold text-primary-foreground">
                  Administration
                </h1>
                <p className="text-primary-foreground/80">
                  Gestion du tournoi de football
                </p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">Total Joueurs</p>
                  <p className="text-3xl font-bold text-primary">{players.length}</p>
                </div>
                <Users className="h-12 w-12 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">Âge Moyen</p>
                  <p className="text-3xl font-bold text-primary">
                    {players.length > 0 
                      ? Math.round(players.reduce((sum, p) => sum + p.age, 0) / players.length)
                      : 0
                    } ans
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">Statut</p>
                  <p className="text-xl font-bold text-success">
                    Inscriptions ouvertes
                  </p>
                </div>
                <Trophy className="h-12 w-12 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres et recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Rechercher un joueur</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nom ou prénom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age-filter">Filtrer par âge</Label>
                <select
                  id="age-filter"
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="">Tous les âges</option>
                  <option value="young">Moins de 25 ans</option>
                  <option value="middle">25-34 ans</option>
                  <option value="older">35 ans et plus</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Liste des joueurs inscrits</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {filteredPlayers.length} joueur{filteredPlayers.length > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
            <CardDescription>
              Gérez les inscriptions au tournoi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {players.length === 0 ? "Aucun joueur inscrit" : "Aucun résultat"}
                </h3>
                <p className="text-muted-foreground">
                  {players.length === 0 
                    ? "Les inscriptions apparaîtront ici une fois que les joueurs se seront inscrits."
                    : "Essayez de modifier vos critères de recherche."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPlayers.map((player) => {
                  const ageGroup = getAgeGroup(player.age);
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-bold text-primary">
                            {player.prenom[0]}{player.nom[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {player.prenom} {player.nom}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{player.age} ans</span>
                            <Badge 
                              className={`${ageGroup.color} text-white text-xs`}
                            >
                              {ageGroup.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Inscrit le {formatDate(player.dateInscription)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary border-primary/20 hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePlayer(player)}
                          className="text-destructive border-destructive/20 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}