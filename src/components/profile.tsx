import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogOut, Loader, Edit3, Save, X } from "lucide-react";



// Interfaces
interface Player {
  nom: string;
  prenom: string;
  age: number;
  telephone: string;
  gardien?: boolean;
  email?: string;
  speed?: number;
  strength?: number;
  defense?: number;
  attack?: number;
  stamina?: number;
  skill?: number;
  last_updated?: string;
  vote?: number;
}

interface UserProfile {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    avatar_url?: string;
  };
  created_at: string;
  role: string;
  app_metadata: {
    provider?: string;
  };
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [editablePlayer, setEditablePlayer] = useState<Player | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [nextEditDate, setNextEditDate] = useState<Date | null>(null);
  const navigate = useNavigate();
  const [rotate, setRotate] = useState(false);

  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
const [uploadingAvatar, setUploadingAvatar] = useState(false);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);


// Renomme-la en removeBackgroundFlask et mets à jour son appel :
const removeBackgroundFlask = async (imageFile: File): Promise<Blob | null> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch("http://localhost:5001/remove-bg", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    console.error("Erreur Flask remove-bg:", await response.text());
    return null;
  }

  return await response.blob();
};



  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file || !user) return;

  setUploadingAvatar(true);

  try {
    const fileWithoutBg = await removeBackgroundFlask(file);
    if (!fileWithoutBg) throw new Error("Échec de suppression du fond");

    const preview = URL.createObjectURL(fileWithoutBg);
    setPreviewUrl(preview);

    const filePath = `${user.id}.png`;

    // Supprimer l’ancien fichier
    await supabase.storage.from("avatars").remove([filePath]);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, fileWithoutBg, {
        upsert: true,
        contentType: "image/png",
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const urlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`;

    // ➕ Met à jour auth
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: urlWithTimestamp },
    });
    if (updateError) throw updateError;

    // ✅ Met aussi à jour la table players
    const { error: playerUpdateError } = await supabase
      .from("players")
      .update({ avatar_url: urlWithTimestamp })
      .eq("id", user.id);

    if (playerUpdateError) throw playerUpdateError;

    // Mise à jour du state React
    setUser((prev) =>
      prev
        ? {
            ...prev,
            user_metadata: {
              ...prev.user_metadata,
              avatar_url: urlWithTimestamp,
            },
          }
        : null
    );

    alert("✅ Photo mise à jour avec fond supprimé !");
  } catch (error) {
    console.error("Erreur avatar:", error);
    alert("❌ Échec de l’envoi ou de la suppression du fond");
  } finally {
    setUploadingAvatar(false);
  }
};


  const handleRotate = () => {
    setRotate(true);
    setTimeout(() => setRotate(false), 1000);
  };

  // Fonction pour obtenir l'image selon le vote
  const getVoteImage = (vote: number): string => {
  if (vote >= 18 && vote <= 25) return "/cartes/platine.png";
  if (vote >= 26 && vote <= 35) return "/cartes/diamand.png"; 
  if (vote >= 36 && vote <= 42) return "/cartes/icone.png";
  if (vote >= 43 && vote <= 50) return "/cartes/legendaire.webp";
  return "/cartes/default.png";
};


  // Fonction pour obtenir le titre selon le vote
  const getVoteTitle = (vote: number): string => {
    if (vote >= 18 && vote <= 25) return "PLATINE";
    if (vote >= 26 && vote <= 35) return "DIAMANT";
    if (vote >= 36 && vote <= 42) return "ICÔNE";
    if (vote >= 43 && vote <= 50) return "LÉGENDE";
    return "JOUEUR";
  };

  // Fonction pour obtenir la couleur de la carte selon le vote
  const getVoteCardStyle = (vote: number) => {
    if (vote >= 18 && vote <= 25) return { 
      bg: 'from-slate-400 to-slate-600', 
      border: 'border-slate-400',
      glow: 'shadow-slate-400/50',
      getVoteImage: '/cartes/platine.png'
    }; // Platine
    if (vote >= 26 && vote <= 35) return { 
      bg: 'from-cyan-400 to-cyan-600', 
      border: 'border-cyan-400',
      glow: 'shadow-cyan-400/50',
      getVoteImage: '/cartes/diamand.png'
    }; // Diamant
    if (vote >= 36 && vote <= 42) return { 
      bg: 'from-purple-400 to-purple-600', 
      border: 'border-purple-400',
      glow: 'shadow-purple-400/50',
      getVoteImage: '/cartes/icone.png'
    }; // Icône
    if (vote >= 43 && vote <= 50) return { 
      bg: 'from-yellow-400 to-yellow-600', 
      border: 'border-yellow-400',
      glow: 'shadow-yellow-400/50',
      getVoteImage: '/cartes/FIRE.png'
    }; // Légende
    return { 
      bg: 'from-gray-400 to-gray-600', 
      border: 'border-gray-400',
      glow: 'shadow-gray-400/50'
    }; // Par défaut
  };

  // Fonction pour calculer la note globale
  const calculateOverall = (player: Player): number => {
    if (player.gardien) {
      // Pour un gardien, on privilégie la défense et d'autres stats spécifiques
      return Math.round(
        ((player.defense || 0) * 0.3 +
        (player.strength || 0) * 0.2 +
        (player.skill || 0) * 0.25 +
        (player.stamina || 0) * 0.15 +
        (player.speed || 0) * 0.1) / 1
      );
    } else {
      // Pour un joueur de champ
      return Math.round(
        ((player.speed || 0) +
        (player.strength || 0) +
        (player.defense || 0) +
        (player.attack || 0) +
        (player.stamina || 0) +
        (player.skill || 0)) / 6
      );
    }
  };

  // Fonction pour déterminer la couleur de la carte selon la note
  const getCardImage = (overall: number): string => {
  if (overall >= 90) return "/cartes/legendaire.png"; // Or - Légendaire
  if (overall >= 85) return "/cartes/icone.png"; // Violet - Elite  
  if (overall >= 80) return "/cartes/diamand.png"; // Bleu - Rare
  if (overall >= 75) return "/cartes/platine.png"; // Vert - Non-rare
  return "/cartes/bronze.png"; // Gris - Bronze (si tu as cette carte)
};

  // Fonctions utilitaires existantes...
  const canEditThisWeek = (lastUpdated: string | null): boolean => {
    if (!lastUpdated) return true;
    const lastUpdate = new Date(lastUpdated);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return lastUpdate <= oneWeekAgo;
  };

  const getNextEditDate = (lastUpdated: string | null): Date | null => {
    if (!lastUpdated) return null;
    const lastUpdate = new Date(lastUpdated);
    return new Date(lastUpdate.getTime() + 7 * 24 * 60 * 60 * 1000);
  };

  useEffect(() => {
    const fetchUserAndPlayer = async () => {
      const { data: authResult, error: userError } = await supabase.auth.getUser();
      const user = authResult.user;

      if (userError || !user) {
        navigate("/auth");
        return;
      }

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || "",
        user_metadata: {
          name: user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url,
        },
        created_at: user.created_at,
        role: user.role,
        app_metadata: {
          provider: user.app_metadata?.provider,
        },
      };

      setUser(userProfile);
      setName(userProfile.user_metadata?.name || "");

      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select("*")
        .eq("id", user.id)
        .single();

      if (playerError || !playerData) {
        console.error("❌ Joueur introuvable :", playerError);
        return;
      }

      setPlayer(playerData);
      const canEditNow = canEditThisWeek(playerData.last_updated);
      setCanEdit(canEditNow);

      if (!canEditNow) {
        const nextEdit = getNextEditDate(playerData.last_updated);
        setNextEditDate(nextEdit);
      }
    };

    fetchUserAndPlayer();
  }, [navigate]);

  const handleStartEdit = () => {
    if (!canEdit) return;
    setEditablePlayer({ ...player! });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditablePlayer(null);
  };

  const handleSavePlayer = async () => {
    if (!editablePlayer || !user) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("players")
        .update({
          ...editablePlayer,
          last_updated: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        alert("Erreur lors de la mise à jour");
      } else {
        alert("Informations mises à jour avec succès !");
        setPlayer({ ...editablePlayer, last_updated: new Date().toISOString() });
        setIsEditing(false);
        setCanEdit(false);
        setNextEditDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      }
    } catch (error) {
      alert("Une erreur s'est produite");
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleUpdateName = async () => {
    if (name.trim() === "") {
      alert("Le nom ne peut pas être vide");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { name },
    });

    if (error) {
      alert("Erreur lors de la mise à jour");
    } else {
      alert("Nom mis à jour !");
      setUser((prev) =>
        prev ? { ...prev, user_metadata: { ...prev.user_metadata, name } } : null
      );
    }

    setLoading(false);
  };

  const handlePlayerInputChange = (field: keyof Player, value: string | number | boolean) => {
    if (!editablePlayer) return;
    
    setEditablePlayer(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  if (!user || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const displayPlayer = isEditing ? editablePlayer! : player;
  const overall = calculateOverall(displayPlayer);
  
  // Utiliser le style basé sur le vote au lieu du style basé sur l'âge
  const voteCardStyle = getVoteCardStyle(displayPlayer.vote || 0);
  const voteTitle = getVoteTitle(displayPlayer.vote || 0);
  const playerImage = getVoteImage(displayPlayer.vote || 0);

  return (
    <div className="min-h-auto bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Carte FIFA Style EA FC 25 avec image basée sur le vote */}
        <div className="flex justify-center">
  <div
    onClick={handleRotate}
    className={`relative w-64 h-[400px] bg-cover bg-center rounded-xl shadow-lg overflow-hidden text-white transition-transform duration-700 transform ${
      rotate ? "rotate-y-180" : ""
    } cursor-pointer`}
    style={{
      backgroundImage: `url('${playerImage}')`,
      transformStyle: 'preserve-3d',
    }}
  >
    {/* Photo du joueur */}
    <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
      <img
  src={user.user_metadata?.avatar_url || "/default-avatar.png"}
  alt="Avatar"
  className="w-full h-44 object-cover border-4 border-white shadow-xl ring-4 ring-blue-400/30"
/>





    </div>
    


    {/* Nom et prénom */}
    <div className="absolute top-56 w-full text-center px-2 ">
      <h2 className="text-sm font-medium leading-tight">
        {displayPlayer.prenom}
      </h2>
      <h1 className="text-xl font-bold leading-tight">
        {displayPlayer.nom.toUpperCase()}
      </h1>
    </div>

    {/* Statistiques FIFA style */}
    <div className="absolute bottom-6 w-full px-4 py-4">
      <div className="grid grid-cols-3 gap-y-3 text-center text-xs font-semibold">
        <div>
          <div className="text-lg">{displayPlayer.speed ?? 0}</div>
          <div>VIT</div>
        </div>
        <div>
          <div className="text-lg">{displayPlayer.attack ?? 0}</div>
          <div>ATT</div>
        </div>
        <div>
          <div className="text-lg">{displayPlayer.skill ?? 0}</div>
          <div>STA</div>
        </div>
        <div>
          <div className="text-lg">{displayPlayer.defense ?? 0}</div>
          <div>DEF</div>
        </div>
        <div>
          <div className="text-lg">{displayPlayer.strength ?? 0}</div>
          <div>PHY</div>
        </div>
        <div>
          <div className="text-lg">{displayPlayer.stamina ?? 0}</div>
          <div>END</div>
        </div>
      </div>
    </div>
  </div>
</div>

<div className="mt-3 flex flex-col items-center">
  <label
    htmlFor="avatarInput"
    className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-all"
  >
    📷 Modifier la photo
  </label>
  <input
    id="avatarInput"
    type="file"
    accept="image/*"
    capture="environment"
    onChange={handleAvatarUpload}
    className="hidden"
  />
  {uploadingAvatar && <Loader className="w-4 h-4 animate-spin mt-2" />}
</div>



        {/* Informations sur la catégorie de vote */}
        <div className={`bg-gradient-to-r ${voteCardStyle.bg} bg-opacity-20 backdrop-blur-sm border ${voteCardStyle.border} border-opacity-30 rounded-xl p-4 text-center`}>
          <div className="text-lg font-bold text-white mb-2">
            Catégorie : {voteTitle}
          </div>
          <div className="text-sm text-white/80 mb-3">
            {(displayPlayer.vote || 0) >= 18 && (displayPlayer.vote || 0) <= 25 && "Jeune talent avec un potentiel énorme"}
            {(displayPlayer.vote || 0) >= 26 && (displayPlayer.vote || 0) <= 35 && "Joueur dans sa prime, expérience et technique"}
            {(displayPlayer.vote || 0) >= 36 && (displayPlayer.vote || 0) <= 42 && "Vétéran respecté, leadership et sagesse"}
            {(displayPlayer.vote || 0) >= 43 && (displayPlayer.vote || 0) <= 50 && "Légende du sport, maître incontesté"}
            {((displayPlayer.vote || 0) < 18 || (displayPlayer.vote || 0) > 50) && "Joueur en développement"}
          </div>
          <div className="text-lg font-semibold text-white">
            Score de vote : <span className="text-yellow-300">{displayPlayer.vote || 0}</span>
          </div>
          {isEditing && (
            <div className="mt-4">
              <label className="text-sm text-white/70 block mb-2">Modifier le score de vote :</label>
              <input
                type="number"
                min="0"
                max="100"
                value={editablePlayer?.vote || 0}
                onChange={(e) => handlePlayerInputChange("vote", parseInt(e.target.value) || 0)}
                className="w-24 mx-auto text-center p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:border-blue-400"
                placeholder="Vote"
              />
            </div>
          )}
        </div>

        {/* Informations de contact éditables en mode édition */}
        {isEditing && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-center">Informations de contact</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/70 block mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={editablePlayer?.telephone || ""}
                  onChange={(e) => handlePlayerInputChange("telephone", e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-400"
                  placeholder="Numéro de téléphone"
                />
              </div>
            </div>
          </div>
        )}

        {/* Indication de la prochaine modification */}
        {!canEdit && nextEditDate && (
          <div className="text-center bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
            <div className="text-orange-300 text-sm">
              <strong>Prochaine modification possible :</strong>
              <br />
              {nextEditDate.toLocaleDateString()} à {nextEditDate.toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Mise à jour nom d'utilisateur */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold">Profil utilisateur</h3>
          <div className="space-y-3">
            <label className="text-sm text-white/70">Nom d'affichage</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={handleUpdateName}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Enregistrement...
                </span>
              ) : (
                "Mettre à jour"
              )}
            </button>
          </div>
        </div>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-all duration-300"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;