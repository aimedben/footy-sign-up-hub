import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader, Trophy } from "lucide-react";

type Props = {
  onTeamsGenerated?: () => void;
};

interface Player {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  telephone: string;
  gardien?: boolean;
  date_inscription?: string;
  email?: string;
  team_id?: string | null;
}

export function AutoTeamGenerator({ onTeamsGenerated }: Props) {
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const { toast } = useToast();

  const resetTeams = async () => {
    const confirm = window.confirm("Tous les joueurs vont être retirés de leurs équipes et groupes. Continuer ?");
    if (!confirm) return;

    setLoading(true);
    try {
      await supabase.from("players").update({ team_id: null }).not("team_id", "is", null);
      await supabase.from("teams").delete().not("id", "is", null);
      await supabase.from("groups").delete().not("id", "is", null);

      toast({
        title: "Équipes & Groupes réinitialisés",
        description: "Tout est prêt pour une nouvelle répartition.",
      });

      onTeamsGenerated?.();
    } catch (error) {
      console.error("Erreur reset:", error);
      toast({
        title: "Erreur",
        description: "Impossible de tout réinitialiser.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTeams = async () => {
    const confirm = window.confirm(`Former des équipes équilibrées de 8 joueurs max avec une répartition équitable des âges ?`);
    if (!confirm) return;

    setShowAnimation(true);

    setTimeout(async () => {
      setLoading(true);

      try {
        // Fetch players without a team
        const { data: players, error: fetchError } = await supabase
          .from("players")
          .select("*")
          .is("team_id", null);

        if (fetchError) throw fetchError;
        if (!players || players.length < 8) throw new Error("Il faut au moins 8 joueurs pour créer une équipe.");

        // Sort players by age for balanced distribution
        const sortedPlayers: Player[] = [...players].sort((a, b) => a.age - b.age);

        // Calculate team sizes
        const teamSize = 8;
        const totalTeams = Math.floor(sortedPlayers.length / teamSize);
        const remainder = sortedPlayers.length % teamSize;
        const groupCount = 2;


        // Distribute players to teams to balance ages
        const teams: { id?: string; players: Player[] }[] = Array.from({ length: totalTeams }, () => ({ players: [] }));
        let playerIndex = 0;

        // Snake distribution: fill teams in forward order, then reverse
        for (let i = 0; playerIndex < totalTeams * teamSize; i++) {
          const teamIndex = i % 2 === 0
            ? Math.floor(i / 2) % totalTeams
            : totalTeams - 1 - (Math.floor(i / 2) % totalTeams);
          if (playerIndex < sortedPlayers.length) {
            teams[teamIndex].players.push(sortedPlayers[playerIndex]);
            playerIndex++;
          }
        }

        // Handle remaining players (special team)
        const remainingPlayers = sortedPlayers.slice(playerIndex);

        // Delete old teams and groups
        await supabase.from("teams").delete().not("id", "is", null);
        await supabase.from("groups").delete().not("id", "is", null);

        // Create groups
        const groupNames = Array.from({ length: groupCount }, (_, i) => ({ name: `Groupe ${i + 1}` }));
        const { data: createdGroups, error: groupError } = await supabase.from("groups").insert(groupNames).select();
        if (groupError || !createdGroups) throw groupError;

        // Create teams and assign to groups
        for (let i = 0; i < totalTeams; i++) {
          const group = createdGroups[i % groupCount];
          const teamName = `Équipe ${String.fromCharCode(65 + i)}`;

          const { data: newTeam, error: teamError } = await supabase
            .from("teams")
            .insert({
              name: teamName,
              group_id: group.id,
            })
            .select()
            .single();

          if (teamError || !newTeam) throw teamError;
          teams[i].id = newTeam.id;
        }

        // Create special team for remaining players
        if (remainingPlayers.length > 0) {
          const group = createdGroups[teams.length % groupCount];

          const teamName = `Équipe ${String.fromCharCode(65 + totalTeams)}`;

          const { data: specialTeam, error: specialTeamError } = await supabase
            .from("teams")
            .insert({
              name: teamName,
              group_id: group.id,
            })
            .select()
            .single();

          if (specialTeamError || !specialTeam) throw specialTeamError;

          teams.push({ id: specialTeam.id, players: remainingPlayers });
        }

        // Update players with team assignments
        const updates = teams.flatMap(team =>
          team.players.map(player =>
            supabase.from("players").update({ team_id: team.id }).eq("id", player.id)
          )
        );
        await Promise.all(updates);

        // Calculate average age per team for feedback
        const teamAverages = teams.map(team => {
          const avgAge = team.players.reduce((sum, p) => sum + p.age, 0) / team.players.length;
          return Number.isNaN(avgAge) ? 0 : Math.round(avgAge);
        });

        toast({
          title: "✅ Répartition réussie",
          description: `${players.length} joueurs répartis dans ${teams.length} équipes. Âges moyens: ${teamAverages.join(", ")} ans.`,
        });

        onTeamsGenerated?.();
      } catch (error) {
        console.error("Erreur:", error);
        toast({
          title: "❌ Erreur",
          description: error instanceof Error ? error.message : "Erreur durant la répartition.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setShowAnimation(false);
      }
    }, 2000); // Animation duration
  };

  return (
    <div className="relative flex flex-col sm:flex-row items-center gap-4">
      {/* Team Generation Animation */}
      {showAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center space-y-6">
            {/* Spinner */}
            <div className="relative">
              <Trophy
                className="w-16 h-16 text-yellow-400 animate-spin"
                style={{ animationDuration: "2s" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-600/20 rounded-full blur-md animate-pulse"></div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-600 animate-pulse"
                style={{
                  width: "100%",
                  animation: "progress 2s ease-in-out infinite",
                }}
              ></div>
            </div>

            {/* Text */}
            <h2 className="text-2xl font-bold text-white">Génération des équipes équilibrées...</h2>

            {/* Confetti Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    background: Math.random() > 0.5 ? "#facc15" : "#f97316",
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <Button
        onClick={generateTeams}
        disabled={loading || showAnimation}
        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all duration-200 hover:scale-105"
      >
        {loading || showAnimation ? (
          <span className="flex items-center">
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Génération...
          </span>
        ) : (
          "Former les équipes & groupes"
        )}
      </Button>
      <Button
        variant="outline"
        onClick={resetTeams}
        disabled={loading || showAnimation}
        className="bg-red-100 hover:bg-red-200 text-red-800 transition-all duration-200 hover:scale-105"
      >
        Réinitialiser
      </Button>

      {/* CSS for Animations */}
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}