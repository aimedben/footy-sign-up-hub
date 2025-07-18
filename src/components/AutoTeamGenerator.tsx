import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Props = {
  onTeamsGenerated?: () => void;
};

export function AutoTeamGenerator({ onTeamsGenerated }: Props) {
  const [teamCount, setTeamCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetTeams = async () => {
    const confirm = window.confirm(
      "Tous les joueurs vont être retirés de leurs équipes. Continuer ?"
    );
    if (!confirm) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("players")
        .update({ team_id: null })
        .not("team_id", "is", null); // Corrigé ici

      if (error) throw error;

      toast({
        title: "Équipes réinitialisées",
        description: "Tous les joueurs n'ont plus d'équipe.",
      });

      onTeamsGenerated?.();
    } catch (error) {
      console.error("Erreur réinitialisation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les équipes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTeams = async () => {
    if (teamCount < 2 || teamCount > 10) {
      toast({
        title: "Erreur",
        description: "Le nombre d'équipes doit être entre 2 et 10.",
        variant: "destructive",
      });
      return;
    }

    const confirm = window.confirm(
      `Vous allez créer ${teamCount} équipes et répartir aléatoirement les joueurs. Continuer ?`
    );
    if (!confirm) return;

    setLoading(true);

    try {
      // Récupérer les joueurs sans équipe
      const { data: players, error: fetchError } = await supabase
        .from("players")
        .select("*")
        .is("team_id", null);

      if (fetchError) throw fetchError;
      if (!players || players.length < teamCount) {
        throw new Error(
          `Seulement ${players?.length || 0} joueurs disponibles pour ${teamCount} équipes.`
        );
      }

      // Supprimer les anciennes équipes
      const { error: deleteError } = await supabase
        .from("teams")
        .delete()
        .not("id", "is", null);
      if (deleteError) throw deleteError;

      // Créer les nouvelles équipes avec noms fixes
      const teamNames = Array.from({ length: teamCount }, (_, i) => ({
        name: `Équipe ${String.fromCharCode(65 + i)}`, // A, B, C...
      }));

      const { data: createdTeams, error: teamError } = await supabase
        .from("teams")
        .insert(teamNames)
        .select();

      if (teamError || !createdTeams) throw teamError;

      // Répartir les joueurs aléatoirement
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      const updates = shuffled.map((player, index) => ({
        id: player.id,
        team_id: createdTeams[index % teamCount].id,
      }));

      // Mise à jour des joueurs (batch par promesses)
      const updatePromises = updates.map((u) =>
        supabase
          .from("players")
          .update({ team_id: u.team_id })
          .eq("id", u.id)
      );

      await Promise.all(updatePromises);

      toast({
        title: "✅ Répartition réussie",
        description: `${players.length} joueurs répartis dans ${teamCount} équipes.`,
      });

      onTeamsGenerated?.();
      await new Promise((resolve) => setTimeout(resolve, 300)); // délai léger
    } catch (error) {
      console.error("Erreur génération équipes:", error);
      toast({
        title: "❌ Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors de la génération des équipes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 my-6">
      <Input
        type="number"
        value={teamCount}
        onChange={(e) => {
          const value = parseInt(e.target.value);
          setTeamCount(isNaN(value) ? 2 : Math.max(2, Math.min(value, 10)));
        }}
        min={2}
        max={10}
        className="w-24"
      />
      <Button
        onClick={generateTeams}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700"
      >
        {loading ? "Génération..." : "Former les équipes"}
      </Button>
      <Button
        variant="outline"
        onClick={resetTeams}
        disabled={loading}
        className="bg-red-100 hover:bg-red-200 text-red-800"
      >
        Réinitialiser
      </Button>
    </div>
  );
}
