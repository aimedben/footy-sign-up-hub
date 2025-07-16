import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Users, UserMinus, Calendar, LogOut, Trophy, Filter, Phone, Users2, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Player {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  telephone: string;
  team_id?: string;
  group_id?: string;
  date_inscription: string;
  teams?: { name: string };
  groups?: { name: string };
}

interface Team {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
}

interface AdminDashboardProps {
  players: Player[];
  onDeletePlayer: (playerId: string) => void;
  onLogout: () => void;
}

export function AdminDashboard({ players: initialPlayers, onDeletePlayer, onLogout }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAge, setFilterAge] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayersAndFilters();
  }, []);

  const fetchPlayersAndFilters = async () => {
    try {
      const [playersResult, teamsResult, groupsResult] = await Promise.all([
        supabase
          .from('players')
          .select(`
            *,
            teams (name),
            groups (name)
          `)
          .order('date_inscription', { ascending: false }),
        supabase.from('teams').select('*').order('name'),
        supabase.from('groups').select('*').order('name')
      ]);

      if (playersResult.data) setPlayers(playersResult.data);
      if (teamsResult.data) setTeams(teamsResult.data);
      if (groupsResult.data) setGroups(groupsResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.telephone.includes(searchTerm);
    
    const matchesAge = filterAge === "" || 
      (filterAge === "young" && player.age <= 25) ||
      (filterAge === "senior" && player.age > 25);
    
    const matchesTeam = filterTeam === "" || player.team_id === filterTeam;
    const matchesGroup = filterGroup === "" || player.group_id === filterGroup;
    
    return matchesSearch && matchesAge && matchesTeam && matchesGroup;
  });

  const handleDelete = async (playerId: string, playerName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${playerName} ?`)) {
      try {
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('id', playerId);

        if (error) throw error;

        setPlayers(prev => prev.filter(p => p.id !== playerId));
        onDeletePlayer(playerId);
        toast({
          title: "Joueur supprimé",
          description: `${playerName} a été retiré du tournoi`,
        });
      } catch (error) {
        console.error('Error deleting player:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le joueur",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Trophy className="h-10 w-10 text-primary-foreground animate-bounce-in" />
              <div>
                <h1 className="text-4xl font-bold text-primary-foreground animate-fade-in">
                  Administration
                </h1>
                <p className="text-xl text-primary-foreground/90 animate-fade-in">
                  Gestion du tournoi de football
                </p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="bg-background/10 border-primary-foreground/20 text-primary-foreground hover:bg-background/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="flex items-center p-6">
                <Trophy className="h-8 w-8 text-primary mr-4" />
                <div>
                  <p className="text-2xl font-bold">{players.length}</p>
                  <p className="text-sm text-muted-foreground">Joueurs inscrits</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-primary mr-4" />
                <div>
                  <p className="text-2xl font-bold">{players.filter(p => p.age <= 25).length}</p>
                  <p className="text-sm text-muted-foreground">Jeunes (≤25 ans)</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <Users2 className="h-8 w-8 text-primary mr-4" />
                <div>
                  <p className="text-2xl font-bold">{players.filter(p => p.age > 25).length}</p>
                  <p className="text-sm text-muted-foreground">Seniors (&gt;25 ans)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Hash className="h-8 w-8 text-primary mr-4" />
                <div>
                  <p className="text-2xl font-bold">{teams.length}</p>
                  <p className="text-sm text-muted-foreground">Équipes</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Recherche et filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, prénom ou téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterAge} onValueChange={setFilterAge}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les âges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les âges</SelectItem>
                    <SelectItem value="young">Jeunes (≤25 ans)</SelectItem>
                    <SelectItem value="senior">Seniors (&gt;25 ans)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterTeam} onValueChange={setFilterTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les équipes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les équipes</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterGroup} onValueChange={setFilterGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les groupes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les groupes</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Players Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des joueurs</CardTitle>
              <CardDescription>
                {filteredPlayers.length} joueur{filteredPlayers.length > 1 ? 's' : ''} trouvé{filteredPlayers.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun joueur trouvé</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Âge</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Équipe</TableHead>
                      <TableHead>Groupe</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlayers.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">{player.nom}</TableCell>
                        <TableCell>{player.prenom}</TableCell>
                        <TableCell>
                          <Badge variant={player.age <= 25 ? "default" : "secondary"}>
                            {player.age} ans
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {player.telephone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {player.teams?.name || "Non assigné"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {player.groups?.name || "Non assigné"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(player.date_inscription).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(player.id, `${player.prenom} ${player.nom}`)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}