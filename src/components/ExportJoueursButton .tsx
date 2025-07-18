// components/ExportJoueursButton.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportJoueursButtonProps {
  players: any[];
  paymentStatus: { [id: string]: boolean };
}

export function ExportJoueursButton({ players, paymentStatus }: ExportJoueursButtonProps) {
  const [loading, setLoading] = useState(false);

  const exportToCSV = () => {
    setLoading(true);

    const headers = ["Nom", "Prénom", "Âge", "A payé ?"];
    const rows = players.map((p) => [
      p.nom,
      p.prenom,
      p.age.toString(),
      paymentStatus[p.id] ? "Oui" : "Non",
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((val) => `"${val}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "joueurs-bouhiafoot.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setLoading(false);
  };

  return (
    <Button onClick={exportToCSV} disabled={loading} className="mt-4">
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Export en cours..." : "Télécharger le tableau CSV"}
    </Button>
  );
}
