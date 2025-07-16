import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, Trophy } from "lucide-react";

interface Player {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  dateInscription: string;
}

interface RegistrationFormProps {
  onPlayerAdded: (player: Player) => void;
}

export function RegistrationForm({ onPlayerAdded }: RegistrationFormProps) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [age, setAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nom || !prenom || !age) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    const ageNumber = parseInt(age);
    if (ageNumber < 16 || ageNumber > 50) {
      toast({
        title: "Âge invalide",
        description: "L'âge doit être entre 16 et 50 ans",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newPlayer: Player = {
        id: crypto.randomUUID(),
        nom: nom.trim(),
        prenom: prenom.trim(),
        age: ageNumber,
        dateInscription: new Date().toISOString(),
      };

      // Simulation d'une sauvegarde (remplacé par Supabase plus tard)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onPlayerAdded(newPlayer);
      
      toast({
        title: "Inscription réussie !",
        description: `${prenom} ${nom} a été inscrit(e) au tournoi`,
      });

      // Reset form
      setNom("");
      setPrenom("");
      setAge("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-accent py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Trophy className="h-12 w-12 text-primary-foreground animate-bounce-in" />
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground animate-fade-in">
              Tournoi de Football
            </h1>
          </div>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in">
            Inscrivez-vous dès maintenant à notre tournoi annuel ! 
            Rejoignez nous pour une compétition mémorable.
          </p>
        </div>
      </div>

      {/* Registration Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto animate-fade-in">
          <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
              <CardDescription>
                Remplissez le formulaire pour vous inscrire au tournoi
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    type="text"
                    placeholder="Votre nom de famille"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    type="text"
                    placeholder="Votre prénom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Âge *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Votre âge (16-50 ans)"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="16"
                    max="50"
                    required
                    className="h-12"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg"
                  variant="hero"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <Users className="h-5 w-5" />
                      S'inscrire au tournoi
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Informations du tournoi</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">16-50</div>
              <div className="text-muted-foreground">Âge requis</div>
            </Card>
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">∞</div>
              <div className="text-muted-foreground">Places disponibles</div>
            </Card>
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">Gratuit</div>
              <div className="text-muted-foreground">Participation</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}