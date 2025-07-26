import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔁 Vérifie si l'utilisateur est connecté ET présent dans "profiles"
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        await supabase.auth.signOut(); // session invalide
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile || profileError) {
        console.warn("❌ Utilisateur connecté mais absent de la table 'profiles'");
        await supabase.auth.signOut();
        window.location.reload();
      } else {
        navigate("/profil");
      }
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate("/profil");
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async () => {
  setError("");
  if (!email || !password) return setError("Tous les champs sont requis");

  let result;
  if (isLogin) {
    result = await supabase.auth.signInWithPassword({ email, password });
  } else {
    result = await supabase.auth.signUp({ email, password });

    if (result.data.user) {
      // ✅ Créer les entrées après inscription
      await createProfileAndPlayer(result.data.user.id, email);
    }
  }

  if (result.error) {
    setError(result.error.message);
  }

  if (result.data.user) {
  console.log("Utilisateur inscrit :", result.data.user.id);
  await createProfileAndPlayer(result.data.user.id, email);
}

};


  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://bouhia-foot.vercel.app", // ajuste selon domaine
      },
    });

    if (error) {
      console.error("Erreur Google Auth:", error.message);
      setError("Erreur lors de la connexion avec Google.");
    }
  };


  const createProfileAndPlayer = async (userId: string, email: string) => {
  const defaultPlayerData = {
    id: userId,          // ✅ même id dans players
    nom: "Nom",
    prenom: "Prénom",
    age: 25,
    telephone: "0000000000",
    gardien: false,
    speed: 50,
    strength: 50,
    defense: 50,
    attack: 50,
    stamina: 50,
    skill: 50,
    email,
  };

  const { error: playerError } = await supabase.from("players").insert(defaultPlayerData);
  if (playerError) {
    console.error("❌ Erreur création joueur :", playerError);
    return;
  }

  const { error: profileError } = await supabase.from("profiles").insert({ id: userId, email: defaultPlayerData.email });
  if (profileError) {
    console.error("❌ Erreur création profil :", profileError);
    return;
  }

  console.log("✅ Joueur et profil créés avec succès");
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl w-full max-w-md border border-white/20">
        <h2 className="text-white text-2xl font-bold mb-4 text-center">
          {isLogin ? "Connexion" : "Créer un compte"}
        </h2>

        <label className="text-white/80">Email</label>
        <Input
          className="mb-4"
          type="email"
          placeholder="exemple@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="text-white/80">Mot de passe</label>
        <Input
          className="mb-4"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <Button
          className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white"
          onClick={handleSubmit}
        >
          {isLogin ? "Se connecter" : "Créer le compte"}
        </Button>

        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleLogin}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5"
          />
          Continuer avec Google
        </Button>

        <div className="mt-4 text-center">
          <button
            className="text-sm text-white/70 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Pas encore de compte ? S'inscrire"
              : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};
