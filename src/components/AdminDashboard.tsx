import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, Users, UserMinus, Calendar, LogOut, Trophy,
  Filter, Phone, Users2, Hash, Download, CheckCircle, XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AutoTeamGenerator } from "./AutoTeamGenerator"; 

// --- Interfaces ---
interface Player {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  telephone: string;
  team_id?: string;
  paye?: boolean;
  date_inscription: string;
  gardien?: boolean;
  goals?: number;
  assists?: number;
  matches_played?: number;
  yellow_cards?: number;
  red_cards?: number;
  teams?: {
    id: string;
    name: string;
    group_id?: string;
    groups?: {
      name: string;
    };
  };
}

interface Team {
  id: string;
  name: string;
  group_id?: string;
}

interface Group {
  id: string;
  name: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

// !!! IMPORTANT: This Notification interface now strictly matches your provided Supabase schema !!!
interface Notification {
  id: string;
  message: string;
  created_at: string;
  seen: boolean;
  tel: string; 
  player_nom: string;
  player_prenom: string;
  // age, telephone, gardien are REMOVED as per your Supabase schema
  // If you still need this data for player insertion, it MUST come from elsewhere
}

// --- Component ---
export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAge, setFilterAge] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingExport, setLoadingExport] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  // --- Data Fetching ---

  // Fetches notifications based on your strict schema
  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        message,
        created_at,
        seen,
        tel,
        player_nom,
        player_prenom
      `) // Only select columns existing in your DB schema
      .eq("seen", false) // Assuming you want to show un-seen notifications
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      toast({ title: "Erreur", description: "Impossible de charger les notifications.", variant: "destructive" });
    } else if (data) {
      setNotifications(data as Notification[]);
    }
  }, [toast]);

  // Fetches all players, teams, and groups
  const fetchPlayersAndTeams = useCallback(async () => {
    const [
      { data: playersData, error: playersError },
      { data: teamsData, error: teamsError },
      { data: groupData, error: groupError }
    ] = await Promise.all([
      supabase.from("players").select(`
        id, nom, prenom, age, telephone, paye, date_inscription, gardien, goals, assists, matches_played, yellow_cards, red_cards, team_id,
        teams (
          id, name, group_id,
          groups ( name )
        )`).order("nom", { ascending: true }),
      supabase.from("teams").select("*").order("name"),
      supabase.from("groups").select("*").order("name")
    ]);

    if (playersError || !playersData) {
      toast({ title: "Erreur", description: "Impossible de charger les joueurs.", variant: "destructive" });
      return;
    }
    if (teamsError || !teamsData) {
      toast({ title: "Erreur", description: "Impossible de charger les équipes.", variant: "destructive" });
      return;
    }
    if (groupError || !groupData) {
      toast({ title: "Erreur", description: "Impossible de charger les groupes.", variant: "destructive" });
      return;
    }

    setPlayers((playersData as unknown as Player[]).sort((a, b) => a.nom.localeCompare(b.nom)));
    setTeams(teamsData);
    setGroups(groupData);

    // Also fetch notifications after refreshing main data
    fetchNotifications();

  }, [toast, fetchNotifications]);

  // Initial data load on component mount
  useEffect(() => {
    fetchPlayersAndTeams();
  }, [fetchPlayersAndTeams]);

  // --- Handlers ---

  const exportToCSV = async () => {
  setLoadingExport(true);

  const { data, error } = await supabase
    .from("players")
    .select("nom, prenom, age, paye");

  if (error || !data) {
    console.error("Erreur export:", error);
    toast({
      title: "Erreur",
      description: "Impossible d'exporter les données des joueurs.",
      variant: "destructive"
    });
    setLoadingExport(false);
    return;
  }

  const headers = ["Nom", "Prénom", "Âge", "A payé ?"];
  const rows = data.map(p => [
    p.nom,
    p.prenom,
    String(p.age),
    p.paye ? "Oui" : "Non"
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "joueurs-bouhiafoot.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast({ title: "Export réussi", description: "Les données ont été téléchargées." });
  setLoadingExport(false);
};

  const filteredPlayers = players.filter(p => {
    const matchSearch =
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telephone.includes(searchTerm);

    const matchAge =
      filterAge === "all" ||
      (filterAge === "young" && (p.age || 0) <= 25) ||
      (filterAge === "senior" && (p.age || 0) > 25);

    const matchTeam = filterTeam === "all" || p.team_id === filterTeam;

    const matchGroup =
      filterGroup === "all" ||
      p.teams?.groups?.name === groups.find(g => g.id === filterGroup)?.name;

    return matchSearch && matchAge && matchTeam && matchGroup;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le joueur ${name} ? Cette action est irréversible.`)) {
      return;
    }
    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur de suppression", description: `Impossible de supprimer ${name}.`, variant: "destructive" });
      return;
    }
    setPlayers(prev => prev.filter(p => p.id !== id));
    toast({ title: "Joueur supprimé", description: `${name} a été retiré de la liste.` });
  };

  // !!! IMPORTANT: Logic for player approval/rejection needs a source for age, telephone, gardien !!!
  // As these are no longer in the notification object from the DB, you must supply them.
  // For demonstration, I'm using placeholder values. In a real app, this data would likely
  // come from the initial registration form submission or another related table.
  const handleApproveNotification = async (notification: Notification) => {
    try {
      // 1. Add player to 'players' table
      // You MUST provide age, telephone, gardien here.
      // Assuming they come from somewhere else, or are hardcoded for now.
      const PLACEHOLDER_AGE = 20; // Replace with actual logic to get age
      const PLACEHOLDER_TELEPHONE = "N/A"; // Replace with actual logic to get telephone
      const PLACEHOLDER_GARDIEN = false; // Replace with actual logic to get gardien status

      const { error: insertError } = await supabase.from("players").insert({
        nom: notification.player_nom,
        prenom: notification.player_prenom,
        age: PLACEHOLDER_AGE, // Using placeholder
        telephone: PLACEHOLDER_TELEPHONE, // Using placeholder
        gardien: PLACEHOLDER_GARDIEN, // Using placeholder
        date_inscription: new Date().toISOString(),
        paye: false, // Default to not paid upon registration approval
      });

      if (insertError) {
        throw new Error(`Erreur lors de l'ajout du joueur: ${insertError.message}`);
      }

      // 2. Mark notification as seen
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ seen: true, message: `Inscription de ${notification.player_prenom} ${notification.player_nom} validée.`, tel: notification.tel }) // Assuming you want to keep the tel in the notification
        .eq("id", notification.id);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour de la notification: ${updateError.message}`);
      }

      toast({ title: "Joueur validé", description: `${notification.player_prenom} ${notification.player_nom} a été ajouté.` });
      // Refresh both player list and notifications
      fetchPlayersAndTeams();
      fetchNotifications();
    } catch (error: any) {
      console.error("Error approving player:", error);
      toast({ title: "Erreur", description: error.message || "Une erreur est survenue lors de la validation.", variant: "destructive" });
    }
  };

  const handleRejectNotification = async (notification: Notification) => {
    try {
      // Mark notification as seen (or delete it, depending on desired behavior)
      const { error } = await supabase
        .from("notifications")
        .update({ seen: true, message: `Inscription de ${notification.player_prenom} ${notification.player_nom} rejetée.`, tel: notification.tel }) // Assuming you want to keep the tel in the notification
        .eq("id", notification.id);

      if (error) {
        throw new Error(`Erreur lors du rejet de la notification: ${error.message}`);
      }

      toast({ title: "Demande rejetée", description: `La demande de ${notification.player_prenom} ${notification.player_nom} a été rejetée.` });
      fetchNotifications(); // Only re-fetch notifications, no change to player list
    } catch (error: any) {
      console.error("Error rejecting player:", error);
      toast({ title: "Erreur", description: error.message || "Une erreur est survenue lors du rejet.", variant: "destructive" });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="bg-gradient-to-r from-blue-600 to-green-600 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-10 w-10 text-white" />
            <div>
              <h1 className="text-4xl font-bold text-white">Tableau de Bord Administrateur</h1>
              <p className="text-xl text-white/90">Gestion complète du tournoi Bouhiafoot</p>
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

        {/* --- Section: Actions Rapides --- */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
          <AutoTeamGenerator onTeamsGenerated={fetchPlayersAndTeams} />
          <Button
            onClick={exportToCSV}
            disabled={loadingExport}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {loadingExport ? "Export en cours..." : "Télécharger la liste CSV"}
          </Button>
        </div>

        {/* --- Section: Filtres et Recherche --- */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <Input
            placeholder="Rechercher nom, prénom, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            // If Input component supports prefix, this would be uncommented:
            // prefix={<Search className="h-4 w-4 text-gray-500 mr-2" />}
          />

          <Select value={filterGroup} onValueChange={setFilterGroup}>
            <SelectTrigger className="w-full sm:w-48 h-10 px-3 py-2 border rounded-md">
              <SelectValue placeholder="Filtrer par groupe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les groupes</SelectItem>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterTeam} onValueChange={setFilterTeam}>
            <SelectTrigger className="w-full sm:w-48 h-10 px-3 py-2 border rounded-md">
              <SelectValue placeholder="Filtrer par équipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les équipes</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterAge} onValueChange={setFilterAge}>
            <SelectTrigger className="w-full sm:w-40 h-10 px-3 py-2 border rounded-md">
              <SelectValue placeholder="Filtrer par âge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous âges</SelectItem>
              <SelectItem value="young">&lt; 25 ans</SelectItem>
              <SelectItem value="senior">&gt; 25 ans</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* --- Section: Demandes d'inscription --- */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-6 w-6 text-blue-600" />
              Demandes d'inscription
            </CardTitle>
            <CardDescription>{notifications.length} demande(s) en attente</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Aucune nouvelle demande d'inscription pour le moment.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-100 last:border-b-0 gap-2">
                  <div>
                    <p className="font-medium text-gray-800">
                      {n.player_prenom} {n.player_nom}
                      {/* Age, telephone, gardien removed as they are not in your provided schema for notifications */}
                    </p>
                    <p className="text-sm text-gray-600">
                       {n.message} {/* Display the message from the notification */}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Envoyé le: {new Date(n.created_at).toLocaleDateString("fr-FR")} à {new Date(n.created_at).toLocaleTimeString("fr-FR")}</p>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button
                      onClick={() => handleApproveNotification(n)}
                      className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4" /> Valider
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectNotification(n)}
                      className="flex items-center gap-1"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4" /> Rejeter
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* --- Section: Liste des Joueurs --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Liste des joueurs inscrits
            </CardTitle>
            <CardDescription>{filteredPlayers.length} joueur(s) trouvé(s) sur {players.length} total.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Payé</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Âge</TableHead>
                    <TableHead>GB</TableHead>
                    <TableHead>Tél.</TableHead>
                    <TableHead>Équipe</TableHead>
                    <TableHead>Groupe</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="w-[80px]">MJ</TableHead>
                    <TableHead className="w-[80px]">Buts</TableHead>
                    <TableHead className="w-[80px]">Assists</TableHead>
                    <TableHead className="w-[60px]">🟨</TableHead>
                    <TableHead className="w-[60px]">🟥</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} className="text-center text-gray-500 py-4">
                        Aucun joueur ne correspond à vos critères de recherche ou de filtre.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPlayers.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={p.paye || false}
                            onChange={async e => {
  const status = e.target.checked;

  const confirm = window.confirm(
    status
      ? `✅ Confirmez-vous que ${p.prenom} ${p.nom} a bien payé ?`
      : `❌ Voulez-vous vraiment marquer ${p.prenom} ${p.nom} comme non payé ?`
  );

  if (!confirm) return; // ⛔ Annule l'action si non confirmé

  const { error } = await supabase
    .from("players")
    .update({ paye: status })
    .eq("id", p.id);

  if (!error) {
    setPlayers(prev =>
      prev.map(x =>
        x.id === p.id ? { ...x, paye: status } : x
      )
    );
    toast({
      title: "Statut de paiement mis à jour",
      description: `${p.prenom} ${p.nom} est maintenant ${status ? "✅ payé" : "❌ non payé"}.`,
    });
  } else {
    toast({
      title: "Erreur",
      description: "Impossible de mettre à jour le statut de paiement.",
      variant: "destructive",
    });
  }
}}

                            className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{p.nom}</TableCell>
                        <TableCell>{p.prenom}</TableCell>
                        <TableCell>
                          <Badge className={
                            (p.age || 0) <= 25 ? "bg-green-100 text-green-800" :
                              (p.age || 0) <= 35 ? "bg-blue-100 text-blue-800" :
                                "bg-orange-100 text-orange-800"
                          }>
                            {p.age ?? "N/A"} ans
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.gardien ? (
                            <Badge className="bg-yellow-100 text-yellow-800">Oui</Badge>
                          ) : (
                            <span className="text-gray-500 italic">Non</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Phone className="h-4 w-4 inline-block mr-1 text-gray-500" />
                          {p.telephone}
                        </TableCell>
                        <TableCell>{p.teams?.name || "—"}</TableCell>
                        <TableCell>
                          {p.teams?.groups?.name ? (
                            <Badge className="bg-indigo-100 text-indigo-800">
                              {p.teams.groups.name}
                            </Badge>
                          ) : (
                            <span className="text-gray-500 italic">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Calendar className="h-4 w-4 inline-block mr-1 text-gray-500" />
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
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            className="w-16 h-8 text-center bg-gray-50 border-gray-300 rounded-md text-sm"
                            value={p.matches_played ?? 0}
                            onChange={async (e) => {
                              const value = parseInt(e.target.value) || 0;
                              await supabase.from("players").update({ matches_played: value }).eq("id", p.id);
                              setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, matches_played: value } : x));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            className="w-16 h-8 text-center bg-gray-50 border-gray-300 rounded-md text-sm"
                            value={p.goals ?? 0}
                            onChange={async (e) => {
                              const value = parseInt(e.target.value) || 0;
                              await supabase.from("players").update({ goals: value }).eq("id", p.id);
                              setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, goals: value } : x));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            className="w-16 h-8 text-center bg-gray-50 border-gray-300 rounded-md text-sm"
                            value={p.assists ?? 0}
                            onChange={async (e) => {
                              const value = parseInt(e.target.value) || 0;
                              await supabase.from("players").update({ assists: value }).eq("id", p.id);
                              setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, assists: value } : x));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            className="w-12 h-8 text-center bg-gray-50 border-gray-300 rounded-md text-sm"
                            value={p.yellow_cards ?? 0}
                            onChange={async (e) => {
                              const value = parseInt(e.target.value) || 0;
                              await supabase.from("players").update({ yellow_cards: value }).eq("id", p.id);
                              setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, yellow_cards: value } : x));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            className="w-12 h-8 text-center bg-gray-50 border-gray-300 rounded-md text-sm"
                            value={p.red_cards ?? 0}
                            onChange={async (e) => {
                              const value = parseInt(e.target.value) || 0;
                              await supabase.from("players").update({ red_cards: value }).eq("id", p.id);
                              setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, red_cards: value } : x));
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}