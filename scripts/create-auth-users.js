import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

const { data: players, error } = await supabase.from("players").select("*");

if (error) {
  console.error("❌ Erreur récupération des joueurs :", error);
  process.exit(1);
}

const credentials = [];

for (const player of players) {
  const nomPrenom = `${player.nom}${player.prenom}`.replace(/\s/g, "").toLowerCase();
  const email = `${nomPrenom}@gmail.com`;
  const password = nomPrenom;

  const { data, error: signupError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      name: `${player.prenom} ${player.nom}`
    },
    email_confirm: true,
    id: player.id,
  });

  if (signupError) {
    console.error(`❌ ${email} :`, signupError.message);
  } else {
    credentials.push({
      id: player.id,
      email,
      password
    });
    console.log(`✅ ${email} créé avec succès (mot de passe : ${password})`);
  }
}

// ✅ Affichage récapitulatif
console.log("\n📋 Utilisateurs créés :\n");
console.table(credentials);
