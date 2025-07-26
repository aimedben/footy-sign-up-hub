import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";

// 📦 Config Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const Phantasy = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [votedPlayerId, setVotedPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Récupérer les joueurs
  const fetchPlayers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("players")
      .select("id, nom, votes");

    if (error) console.error(error);
    else setPlayers(data);
    setLoading(false);
  };

  // ⚡ Voter pour un joueur
  const handleVote = async (playerId: string) => {
    if (votedPlayerId) return alert("Tu as déjà voté !");

    const { error } = await supabase.rpc("increment_vote", { player_id_input: playerId });

    if (error) {
      console.error("Erreur lors du vote :", error.message);
      return;
    }

    setVotedPlayerId(playerId);
    fetchPlayers(); // Refresh
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-4">⚡ PHANTASY LEAGUE</h1>
        <p className="text-white/70">
          Vote pour le joueur que tu penses être la future star du tournoi !
        </p>
      </div>

      {loading ? (
        <p className="text-center text-white/70">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {players
            .sort((a, b) => b.votes - a.votes)
            .map((player) => (
              <div
                key={player.id}
                className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 flex flex-col items-center ${
                  votedPlayerId === player.id ? "ring-2 ring-yellow-500" : ""
                }`}
              >
                <div className="text-xl font-bold">{player.nom}</div>
                <div className="text-sm text-white/60 mb-4">Votes : {player.votes}</div>
                <Button
                  onClick={() => handleVote(player.id)}
                  disabled={!!votedPlayerId}
                  className="bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  {votedPlayerId === player.id ? "Merci !" : "Voter"}
                </Button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Phantasy;
