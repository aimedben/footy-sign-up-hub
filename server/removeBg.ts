import express from "express";
import multer from "multer";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors()); // Autoriser les requêtes cross-origin depuis le front

// ✅ Route POST pour supprimer l’arrière-plan
app.post("/remove-bg", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucune image reçue" });
  }

  const timestamp = Date.now();
  const inputPath = path.resolve(__dirname, `temp-${timestamp}.png`);
  const outputPath = path.resolve(__dirname, `temp-${timestamp}-out.png`);

  // Écrit l'image temporaire à traiter
  fs.writeFileSync(inputPath, req.file.buffer);

  // Commande Python à exécuter
  const cmd = `python3 remove_bg.py "${inputPath}" "${outputPath}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Erreur du script Python:", stderr);
      fs.unlinkSync(inputPath);
      return res.status(500).json({ error: "Erreur traitement image" });
    }

    try {
      const imageBuffer = fs.readFileSync(outputPath);
      res.setHeader("Content-Type", "image/png");
      res.send(imageBuffer);
    } catch (readError) {
      console.error("❌ Erreur lecture fichier image:", readError);
      return res.status(500).json({ error: "Erreur lecture image" });
    } finally {
      // Nettoyage des fichiers temporaires
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Serveur Flask-like actif sur http://localhost:${PORT}`));
