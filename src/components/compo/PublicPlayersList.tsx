import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

interface Player {
  id: string;
  nom: string;
  prenom: string;
  gardien?: boolean;
  goals?: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
  matches_played?: number;
  teams?: {
    name: string;
    groups?: {
      name: string;
    };
  };
}


export function PublicPlayersList() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
  .from("players")
  .select(`
    id, nom, prenom, gardien,
    goals, assists, yellow_cards, red_cards, matches_played,
    teams (
      name,
      groups ( name )
    )
  `)
  .order("nom", { ascending: true })
  .order("prenom", { ascending: true });


      if (!error && data) {
        setPlayers(data as unknown as Player[]);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Trophy className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-green-700">Liste des Joueurs Inscrits</h1>
        </div>

        <Card>
  <CardHeader>
    <CardTitle className="text-center">Participants</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow className="text-center">
          <TableHead className="table-head">Nom</TableHead>
          <TableHead className="table-head">Prénom</TableHead>
          <TableHead className="table-head">Gardien</TableHead>
          <TableHead className="table-head">Équipe</TableHead>
          <TableHead className="table-head">Groupe</TableHead>
          <TableHead className="table-head">MJ</TableHead>
          <TableHead className="table-head">Buts</TableHead>
          <TableHead className="table-head">Passes</TableHead>
          <TableHead className="table-head">🟨</TableHead>
          <TableHead className="table-head">🟥</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.id} className="text-center">
            <TableCell className="align-middle">{player.nom}</TableCell>
            <TableCell className="align-middle">{player.prenom}</TableCell>
            <TableCell className="align-middle">
              {player.gardien ? (
                <Badge className="bg-yellow-100 text-yellow-800">Oui</Badge>
              ) : (
                <span className="text-muted-foreground italic">Non</span>
              )}
            </TableCell>
            <TableCell className="align-middle">{player.teams?.name || "—"}</TableCell>
            <TableCell className="align-middle">{player.teams?.groups?.name || "—"}</TableCell>
            <TableCell className="align-middle">{player.matches_played ?? 0}</TableCell>
            <TableCell className="align-middle">{player.goals ?? 0}</TableCell>
            <TableCell className="align-middle">{player.assists ?? 0}</TableCell>
            <TableCell className="align-middle">{player.yellow_cards ?? 0}</TableCell>
            <TableCell className="align-middle">{player.red_cards ?? 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>

      </div>
    </div>
  );
}
