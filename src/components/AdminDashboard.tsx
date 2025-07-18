import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  UserMinus,
  Calendar,
  LogOut,
  Trophy,
  Filter,
  Phone,
  Users2,
  Hash,
  Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AutoTeamGenerator } from "./AutoTeamGenerator";

interface Player {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  telephone: string;
  team_id?: string;
  group_id?: string;
  paye?: boolean;
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
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAge, setFilterAge] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingExport, setLoadingExport] = useState(false);
  const { toast } = useToast();

  // Recharge players & teams après génération
  const handleTeamsGenerated = async () => {
    const [{ data: playersData }, { data: teamsData }] = await Promise.all([
      supabase.from("players").select(`*, teams(name)`).order("date_inscription", { ascending: false }),
      supabase.from("teams").select("*").order("name"),
    ]);
    if (playersData) setPlayers(playersData);
    if (teamsData) setTeams(teamsData);
  };

  // Chargement initial
  useEffect(() => {
    handleTeamsGenerated();
    // et charger groupes
    supabase.from("groups").select("*").order("name")
      .then(({ data }) => { if (data) setGroups(data); });
  }, []);

  // Export CSV
  const exportToCSV = async () => {
    setLoadingExport(true);
    const { data, error } = await supabase.from("players").select("nom, prenom, age, paye");
    if (error || !data) {
      toast({ title: "Erreur", description: "Impossible d'exporter.", variant: "destructive" });
      setLoadingExport(false);
      return;
    }
    const headers = ["Nom", "Prénom", "Âge", "A payé ?"];
    const rows = data.map(p => [p.nom, p.prenom, String(p.age), p.paye ? "Oui" : "Non"]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "joueurs-bouhiafoot.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setLoadingExport(false);
  };

  // Reset Teams Button


  // Filtrage
  const filteredPlayers = players.filter(p => {
    const matchSearch =
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telephone.includes(searchTerm);
    const matchAge =
      filterAge === "all" ||
      (filterAge === "young" && p.age <= 25) ||
      (filterAge === "senior" && p.age > 25);
    const matchTeam = filterTeam === "all" || p.team_id === filterTeam;
    const matchGroup = filterGroup === "all" || p.group_id === filterGroup;
    return matchSearch && matchAge && matchTeam && matchGroup;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer ${name} ?`)) return;
    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer.", variant: "destructive" });
      return;
    }
    setPlayers(prev => prev.filter(p => p.id !== id));
    toast({ title: "Joueur supprimé", description: `${name} a été retiré.` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-10 w-10 text-white animate-bounce-in" />
            <div>
              <h1 className="text-4xl font-bold text-white animate-fade-in">Administration</h1>
              <p className="text-xl text-white/90 animate-fade-in">Gestion du tournoi de football</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-red-500 hover:border-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" /> Déconnexion
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
          <AutoTeamGenerator onTeamsGenerated={handleTeamsGenerated} />
          <Button onClick={exportToCSV} disabled={loadingExport} className="mt-0">
            <Download className="mr-2 h-4 w-4" />
            {loadingExport ? "Export en cours..." : "Télécharger CSV"}
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> Recherche et filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterAge} onValueChange={setFilterAge}>
                <SelectTrigger><SelectValue placeholder="Tous les âges" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="young">≤25 ans</SelectItem>
                  <SelectItem value="senior">&gt; 25 ans</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger><SelectValue placeholder="Toutes les équipes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger><SelectValue placeholder="Tous les groupes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
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
              {filteredPlayers.length} joueur
              {filteredPlayers.length > 1 ? "s" : ""} trouvé
              {filteredPlayers.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payé</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Âge</TableHead>
                    <TableHead>Tél.</TableHead>
                    <TableHead>Équipe</TableHead>
                    <TableHead>Groupe</TableHead>
                    <TableHead>Date d’inscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={p.paye || false}
                          onChange={async e => {
                            const status = e.target.checked;
                            const { error } = await supabase
                              .from("players")
                              .update({ paye: status })
                              .eq("id", p.id);
                            if (!error) {
                              setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, paye: status } : x));
                              toast({
                                title: "Paiement mis à jour",
                                description: `${p.prenom} ${p.nom} est ${status ? "payé" : "non payé"}.`,
                              });
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{p.nom}</TableCell>
                      <TableCell>{p.prenom}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            p.age >= 18 && p.age <= 25
                              ? "bg-green-100 text-green-800"
                              : p.age >= 26 && p.age <= 35
                                ? "bg-blue-100 text-blue-800"
                                : p.age >= 36 && p.age <= 50
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-700"
                          }
                        >
                          {p.age} ans
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" /> {p.telephone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={p.team_id || ""}
                          onValueChange={async v => {
                            const { error } = await supabase
                              .from("players")
                              .update({ team_id: v })
                              .eq("id", p.id);
                            if (!error) {
                              setPlayers(prev =>
                                prev.map(x =>
                                  x.id === p.id
                                    ? { ...x, team_id: v, teams: { name: teams.find(t => t.id === v)?.name || "" } }
                                    : x
                                )
                              );
                            }
                          }}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Équipe" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map(t => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={p.group_id || ""}
                          onValueChange={async v => {
                            const { error } = await supabase
                              .from("players")
                              .update({ group_id: v })
                              .eq("id", p.id);
                            if (!error) {
                              setPlayers(prev =>
                                prev.map(x =>
                                  x.id === p.id
                                    ? { ...x, group_id: v, groups: { name: groups.find(g => g.id === v)?.name || "" } }
                                    : x
                                )
                              );
                            }
                          }}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Groupe" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map(g => (
                              <SelectItem key={g.id} value={g.id}>
                                {g.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Calendar className="h-4 w-4 inline-block mr-1" />
                        {new Date(p.date_inscription).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(p.id, `${p.prenom} ${p.nom}`)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
