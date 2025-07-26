import React, { useState, useEffect } from "react";
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
import Navbar from "./ui/navbar"; 
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, Trophy, Phone, Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import emailjs from "@emailjs/browser";
import { PublicPlayersList } from "./compo/PublicPlayersList";
import Helmet from "react-helmet";


const logoUrl = "/images/bouhiaft.png";

interface Player {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  telephone: string;
  gardien?: boolean;
  team_id?: string;
  group_id?: string;
  date_inscription: string;
}

interface RegistrationFormProps {
  onPlayerAdded: (player: Player) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function RegistrationForm({ onPlayerAdded }: RegistrationFormProps) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [age, setAge] = useState("");
  const [telephone, setTelephone] = useState("");
  const [gardien, setGardien] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);
  const { toast } = useToast();
  const [verificationId, setVerificationId] = useState("");
const [code, setCode] = useState("");
const [smsSent, setSmsSent] = useState(false);


  // Calculer le temps restant jusqu'au 26/07/2025 à 00:00
  useEffect(() => {
    const calculateTimeLeft = () => {
      const endDate = new Date('2025-07-26T00:00:00');
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsRegistrationClosed(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsRegistrationClosed(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegistrationClosed) {
      toast({
        title: "Inscriptions fermées",
        description: "La période d'inscription est terminée",
        variant: "destructive",
      });
      return;
    }

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
        gardien: gardien,
        telephone: telephone.trim(),
        team_id: null,
        group_id: null,
      };

      // Vérifie s'il existe déjà un joueur avec même nom et prénom
const { data: existingPlayer, error: checkError } = await supabase
  .from("players")
  .select("id")
  .or(
    `and(nom.ilike.${nom.trim()},prenom.ilike.${prenom.trim()}),telephone.ilike.${telephone.trim()}`
  );



if (checkError) {
  toast({
    title: "Erreur",
    description: "Erreur de vérification des doublons.",
    variant: "destructive",
  });
  setIsLoading(false);
  return;
}

if (existingPlayer && existingPlayer.length > 0) {
  toast({
    title: "Déjà inscrit",
    description: "Un joueur avec ce nom et prénom, ou ce téléphone est déjà inscrit.",
    variant: "destructive",
  });
  setIsLoading(false);
  return;
}


// Sinon, on insère le nouveau joueur
const { data, error } = await supabase
  .from("notifications")
  .insert([
    {
      message: "Nouvelle demande d’inscription",
      seen: false,
      tel: telephone.trim(),
      player_nom: nom.trim(),
      player_prenom: prenom.trim(),
    },
  ])
  .select()
  .single();



      if (error) throw error;
/*
      const newPlayer: Player = {
        id: data.id,
        nom: data.nom,
        prenom: data.prenom,
        age: data.age,
        telephone: data.telephone,
        gardien: data.gardien,
        team_id: data.team_id,
        group_id: data.group_id,
        date_inscription: data.date_inscription,
      };

      onPlayerAdded(newPlayer);*/

      toast({
  title: "Demande envoyée !",
  description: `${prenom} ${nom} sera validé par l'administration.`,
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
            gardien: gardien ? "Oui" : "Non",
            to_email: "bouhiafoot@gmail.com",
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
      setGardien(false);
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

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-100">
      <Helmet>
  <title>Bouhia | Bouhiacity | Inscription Tournoi Bouhia | Bouhia Foot</title>
  <meta name="description" content="Participez au tournoi annuel de football organisé par Bouhia City. Inscriptions ouvertes aux joueurs entre 18 et 50 ans !" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta property="og:title" content="Inscription - Tournoi Bouhia" />
  <meta property="og:description" content="Inscrivez-vous dès maintenant au tournoi de football Bouhia City !" />
  <meta property="og:image" content="/images/bouhiaft.png" />
  <meta property="og:url" content="https://bouhia-foot.vercel.app" />
  <meta name="twitter:card" content="summary_large_image" />
</Helmet>

      <Navbar currentView={""} setCurrentView={function (view: "registration" | "admin-login" | "admin-dashboard"): void {
        throw new Error("Function not implemented.");
      } } />
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 py-12 pt-32">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <Trophy className="h-14 w-14 text-primary-foreground animate-bounce" />
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground animate-fade-in">
              Tournoi de Football
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <img src={logoUrl} alt="Logo du tournoi de football BouhiaCity" width="120" height="120"/>
            <h3 className="text-3xl md:text-5xl font-bold text-primary-foreground animate-fade-in">
              BouhiaCity
            </h3>
          </div>

          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in">
            Inscrivez-vous dès maintenant à notre tournoi annuel ! Rejoignez-nous pour une compétition mémorable.
          </p>
        </div>
        
      </div>

      {/* Countdown Timer */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="h-6 w-6 animate-pulse" />
              <h2 className="text-2xl font-bold">
                {isRegistrationClosed ? "Inscriptions Fermées" : "Fin des inscriptions dans :"}
              </h2>
            </div>
            
            {!isRegistrationClosed && (
              <div className="flex justify-center items-center gap-2 md:gap-8">
                <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[80px] transform hover:scale-105 transition-transform">
                  <div className="text-3xl md:text-4xl font-bold animate-pulse">
                    {formatNumber(timeLeft.days)}
                  </div>
                  <div className="text-sm opacity-90">JOURS</div>
                </div>
                <div className="text-2xl animate-pulse">:</div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[80px] transform hover:scale-105 transition-transform">
                  <div className="text-3xl md:text-4xl font-bold animate-pulse">
                    {formatNumber(timeLeft.hours)}
                  </div>
                  <div className="text-sm opacity-90">HEURES</div>
                </div>
                <div className="text-2xl animate-pulse">:</div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[80px] transform hover:scale-105 transition-transform">
                  <div className="text-3xl md:text-4xl font-bold animate-pulse">
                    {formatNumber(timeLeft.minutes)}
                  </div>
                  <div className="text-sm opacity-90">MINUTES</div>
                </div>
                <div className="text-2xl animate-pulse">:</div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[80px] transform hover:scale-105 transition-transform">
                  <div className="text-3xl md:text-4xl font-bold animate-pulse">
                    {formatNumber(timeLeft.seconds)}
                  </div>
                  <div className="text-sm opacity-90">SECONDES</div>
                </div>
              </div>
            )}

            {isRegistrationClosed && (
              <div className="text-xl font-semibold bg-white/20 backdrop-blur rounded-lg p-4 inline-block">
                ⏰ La période d'inscription est terminée
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto animate-fade-in">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-green-50 backdrop-blur">
           {/* <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Formulaire d’inscription au tournoi de football</CardTitle>
              <CardDescription>
                Remplissez le formulaire pour vous inscrire au tournoi
              </CardDescription>
            </CardHeader>*/}

            <CardContent>
              {isRegistrationClosed ? (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Inscriptions fermées</h3>
                  <p className="text-muted-foreground">
                    La période d'inscription s'est terminée le 26 juillet 2025 à minuit.
                  </p>
                </div>
              ) : (
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

                  <div className="space-y-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="gardien"
                      checked={gardien}
                      onChange={(e) => setGardien(e.target.checked)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor="gardien" className="cursor-pointer">
                      Je suis gardien de but
                    </Label>
                  </div>

                  <p className="text-sm text-muted-foreground text-center px-2">
                    💸 Frais d'inscription : <strong>500 DA</strong> – Le paiement se fait <u>hors ligne</u> le <strong>26/07/2025</strong>, sur place avant le tournoi.
                  </p>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    variant="hero"
                    disabled={isLoading || isRegistrationClosed}
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
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Informations du tournoi</h2>
            <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
              <div className="text-3xl font-bold text-primary mb-2 mx-6">18-50</div>
              <div className="text-muted-foreground">Âge requis</div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
              <div className="text-3xl font-bold text-primary mb-2">∞</div>
              <div className="text-muted-foreground">Places disponibles</div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
              <div className="text-3xl font-bold text-primary mb-2">500 DA</div>
              <div className="text-muted-foreground">Paiement hors ligne</div>
            </Card>
          </div>
          
          <div id="players" className="mt-16 scroll-mt-28">
  <PublicPlayersList />
</div>


        </div>
      </div>

      <div className="text-center mt-6 pb-8">
        <div className="text-muted-foreground text-sm flex flex-col items-center gap-1 h-28 w-auto object-contain">
          <span>Besoin d'aide ?</span>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <a href="tel:0775221864" className="text-blue-600 hover:underline">Contactez-nous au 0775221864</a>
          </div>
        </div>
      </div>
    </div>
  );
}