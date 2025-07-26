// change-password.js

import { createClient } from '@supabase/supabase-js';

// Remplace ces valeurs :
const SUPABASE_URL = 'https://rgebvgazjhqazequfext.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZWJ2Z2F6amhxYXplcXVmZXh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUwNTg5OCwiZXhwIjoyMDY4MDgxODk4fQ.MPG8l5TTbovXi9K73OzB7acjFWPCtZWo2LH0qpeZTS0'; // ⚠️ Ne jamais exposer dans le frontend !
const USER_ID = 'a73de835-d2e7-4c37-a82d-95e214891935'; // ID de l'utilisateur admin à modifier
const NEW_PASSWORD = 'bouhia2255'; // Nouveau mot de passe

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function updateAdminPassword() {
  const { data, error } = await supabase.auth.admin.updateUserById(USER_ID, {
    password: NEW_PASSWORD,
  });

  if (error) {
    console.error('❌ Erreur lors du changement de mot de passe :', error.message);
  } else {
    console.log('✅ Mot de passe modifié avec succès pour', USER_ID);
  }
}

updateAdminPassword();
