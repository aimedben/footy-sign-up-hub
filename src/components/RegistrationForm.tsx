import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, Trophy, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import emailjs from "@emailjs/browser";

const logoUrl = "/bouhiaft.png";

interface Player {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  telephone: string;
  team_id?: string;
  group_id?: string;
  date_inscription: string;
}

interface RegistrationFormProps {
  onPlayerAdded: (player: Player) => void;
}

export function RegistrationForm({ onPlayerAdded }: RegistrationFormProps) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [age, setAge] = useState("");
  const [telephone, setTelephone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom || !prenom || !age || !telephone) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const ageNumber = parseInt(age);
    if (ageNumber < 18 || ageNumber > 50) {
      toast({
        title: "Âge invalide",
        description: "L'âge doit être entre 18 et 50 ans",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^0[567]\d{8}$/;
    if (!phoneRegex.test(telephone.trim())) {
      toast({
        title: "Numéro invalide",
        description: "Le téléphone doit commencer par 05, 06 ou 07 suivi de 8 chiffres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const playerData = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        age: ageNumber,
        telephone: telephone.trim(),
        team_id: null,
        group_id: null,
      };

      const { data, error } = await supabase
        .from("players")
        .insert([playerData])
        .select()
        .single();

      if (error) throw error;

      const newPlayer: Player = {
        id: data.id,
        nom: data.nom,
        prenom: data.prenom,
        age: data.age,
        telephone: data.telephone,
        team_id: data.team_id,
        group_id: data.group_id,
        date_inscription: data.date_inscription,
      };

      onPlayerAdded(newPlayer);

      toast({
        title: "Inscription réussie !",
        description: `${prenom} ${nom} a été inscrit(e) au tournoi`,
      });

      try {
        await emailjs.send(
          "service_hc9hxbe",
          "template_lufo88g",
          {
            nom: nom.trim(),
            prenom: prenom.trim(),
            age: ageNumber,
            telephone: telephone.trim(),
            to_email: "Bouhiafoot@gmail.com",
          },
          "n9XgeYyvQYC7U-UuZ"
        );
      } catch (emailError) {
        console.error("Erreur EmailJS :", emailError);
        toast({
          title: "Email non envoyé",
          description: "Le joueur est bien inscrit, mais l'e-mail n'a pas pu être envoyé.",
          variant: "default",
        });
      }

      setNom("");
      setPrenom("");
      setAge("");
      setTelephone("");
    } catch (error) {
      console.error("Erreur d'inscription :", error);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 py-12">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <Trophy className="h-14 w-14 text-primary-foreground animate-bounce-in" />
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground animate-fade-in">
              Tournoi de Football
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <img
              src={logoUrl}
              alt="Logo BouhiaCity"
              className="h-28 w-auto object-contain"
            />
            <h3 className="text-3xl md:text-5xl font-bold text-primary-foreground animate-fade-in">
              BouhiaCity
            </h3>
          </div>

          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in">
            Inscrivez-vous dès maintenant à notre tournoi annuel ! Rejoignez-nous pour une compétition mémorable.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto animate-fade-in">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-green-50 backdrop-blur">
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
                    placeholder="Votre âge (18-50 ans)"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="18"
                    max="50"
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone *</Label>
                  <Input
                    id="telephone"
                    type="tel"
                    placeholder="Ex: 0612345678"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <p className="text-sm text-muted-foreground text-center px-2">
                  💸 Frais d'inscription : <strong>500 DA</strong> – Le paiement se fait <u>hors ligne</u> le <strong>26/07/2025</strong>, sur place avant le tournoi.
                </p>

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

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Informations du tournoi</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
              <div className="text-3xl font-bold text-primary mb-2">18-50</div>
              <div className="text-muted-foreground">Âge requis</div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
              <div className="text-3xl font-bold text-primary mb-2">∞</div>
              <div className="text-muted-foreground">Places disponibles</div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
              <div className="text-3xl font-bold text-primary mb-2">Gratuit</div>
              <div className="text-muted-foreground">Participation</div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
              <div className="text-3xl font-bold text-primary mb-2">500 DA</div>
              <div className="text-muted-foreground">Paiement hors ligne</div>
            </Card>
          </div>
        </div>
      </div>
      <div className="text-center mt-6">
  <div className="text-muted-foreground text-sm flex flex-col items-center gap-1">
    <span>Besoin d’aide ?</span>
    <div className="flex items-center gap-2">
      <Phone className="h-4 w-4 text-primary" />
    <span>Contactez-nous sur 07***-**-**-**</span>
    </div>
      
  </div>
</div>
    </div>

    
  );
}