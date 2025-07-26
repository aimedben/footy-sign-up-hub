import React, { useState, useEffect } from 'react';
import {
    Trophy, Users, Calendar, Phone, Home, Info,
    Star, Zap, Award, Settings, Menu, X,
    UserCheck // Assurez-vous que UserCheck est bien importé si vous l'utilisez
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';


interface NavbarProps {
    currentView: string;
    setCurrentView: (view: "registration" | "admin-login" | "admin-dashboard" | "tournoi" | "profile" | "Planning") => void;
}

const Navbar = ({ currentView, setCurrentView }: NavbarProps) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeItem, setActiveItem] = useState('home');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const location = useLocation();

useEffect(() => {
  // Synchronise activeItem avec la route actuelle
  if (location.pathname === '/') setActiveItem('home');
  else if (location.pathname.startsWith('/tournoi')) setActiveItem('tournoi');
  else if (location.pathname.startsWith('/joueurs')) setActiveItem('players');
  else if (location.pathname.startsWith('/admin-login')) setActiveItem('admin-toggle');
  else if (location.pathname.startsWith('/profile')) setActiveItem('auth');
  else if (location.pathname.startsWith('/auth')) setActiveItem('auth');
  // Tu peux rajouter d’autres routes ici si besoin
}, [location.pathname]);


    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            console.log("Utilisateur récupéré :", user);
            setUser(user);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string, offset = -100) => {
        const target = document.getElementById(sectionId);
        if (target) {
            window.scrollTo({
                top: target.offsetTop + offset,
                behavior: 'smooth'
            });
            window.history.pushState(null, '', `#${sectionId}`);
        }
    };

    useEffect(() => {
  supabase.auth.getUser().then(async ({ data: { user } }) => {
    console.log("Utilisateur récupéré :", user);
    setUser(user);

    if (user) {
      // 🔍 Vérifier s’il existe un profil avec player_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("player_id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.warn("❌ Erreur lors de la récupération du profil :", profileError);

        //await supabase.auth.signOut(); // 🔐 Déconnecter
        //setUser(null); // 🧹 Nettoyer l’état utilisateur

        //alert("Erreur lors de la récupération de votre profil. Vous avez été déconnecté."); // ou toast si tu préfères
        navigate("/"); // rediriger vers la page d’accueil ou de login
      } else if (!profile || !('player_id' in profile) || !profile.player_id) {
        console.warn("❌ Joueur introuvable ou non lié :", profile);

        //await supabase.auth.signOut(); // 🔐 Déconnecter
        //setUser(null); // 🧹 Nettoyer l’état utilisateur

        //alert("Aucun joueur associé à votre compte. Vous avez été déconnecté."); // ou toast si tu préfères
        navigate("/"); // rediriger vers la page d’accueil ou de login
      }
    }
  });

  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user ?? null);
  });

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);


    const handleNavClick = (itemId: string) => {
  setMobileMenuOpen(false); // Ferme le menu mobile après clic

  switch (itemId) {
    case 'home':
      setActiveItem('home');
      if (currentView === 'registration') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', window.location.pathname);
      } else {
        navigate("/");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', window.location.pathname);
      }
      break;

    case 'tournament':
      setActiveItem('tournament');
      navigate("/tournoi");
      break;

    case 'players':
      setActiveItem('players');
      if (currentView === 'registration') {
        scrollToSection('players');
      } else {
        navigate("/");
        // attendre un peu que le DOM se charge avant le scroll
        setTimeout(() => scrollToSection('players'), 300);
      }
      break;

    case 'schedule':
      setActiveItem('schedule');
      scrollToSection('schedule');
      break;

    case 'game':
      setActiveItem('game');
      // Placeholder pour navigation future
      break;

    case 'contact':
      setActiveItem('contact');
      scrollToSection('contact');
      break;

    case 'admin-toggle':
      setActiveItem('admin-toggle');
      navigate("/admin-login");
      break;

    case 'auth':
      setActiveItem('auth');
      if (user) {
        navigate("/profile");
      } else {
        navigate("/auth");
      }
      break;

    default:
      if (itemId === 'djdj') {
        const nextView =
          currentView === "registration" ? "admin-login" : "registration";
        setCurrentView(nextView);
      }
      break;
  }
};


    const navItems = [
        {
            id: 'home',
            icon: Home,
            label: 'Accueil',
            color: 'from-blue-500 to-cyan-500',
            action: () => handleNavClick('home')
        },
        {
            id: 'tournament',
            icon: Trophy,
            label: 'Tournoi',
            color: 'from-yellow-500 to-orange-500',
            action: () => handleNavClick('tournament')
        },
        {
            id: 'players',
            icon: Users,
            label: 'Joueurs',
            color: 'from-green-500 to-emerald-500',
            action: () => handleNavClick('players')
        },
        {
            id: 'schedule',
            icon: Calendar,
            label: 'Planning',
            color: 'from-purple-500 to-pink-500',
            action: () => handleNavClick('schedule')
        },
        {
            id: 'game',
            icon: Info,
            label: 'Phantasy',
            color: 'from-red-500 to-rose-500',
            action: () => handleNavClick('game')
        },
        {
            id: 'admin-toggle',
            icon: Settings,
            label: "Administration",
            color: 'from-fuchsia-500 to-pink-600',
            action: () => handleNavClick('admin-toggle')
        }
    ];

    // Nouveau : Bouton S'inscrire/Profile pour le menu mobile
    const mobileAuthButton = user ? (
        <button
            key="mobile-profile"
            onClick={() => handleNavClick("auth")} // Utilise le handleNavClick pour cohérence
            className={`group relative px-4 py-3 rounded-xl font-semibold text-sm w-full text-left transition-all duration-300 transform hover:scale-105 text-white/80 hover:text-white`}
        >
            <div className={`absolute inset-0 rounded-xl transition-all duration-300 bg-white/10 opacity-0 group-hover:opacity-100`}></div>
            <div className="relative flex items-center space-x-2">
                <img
                    src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                    alt="Profil"
                    className="w-6 h-6 rounded-full border border-yellow-400 object-cover mr-2"
                />
                <span>Mon Profil ({user.user_metadata?.name || "Utilisateur"})</span>
            </div>
        </button>
    ) : (
        <button
            key="mobile-register"
            onClick={() => handleNavClick("auth")} // Utilise le handleNavClick
            className="flex group relative overflow-hidden bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm w-full"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-2">
                <Award className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>S’INSCRIRE</span>
            </div>
        </button>
    );


    const renderNavButton = (item: typeof navItems[0]) => {
        const Icon = item.icon;
        const isActive =
            activeItem === item.id ||
            (item.id === 'admin-toggle' && currentView === 'admin-login');

        return (
            <button
                key={item.id}
                onClick={item.action}
                className={`group relative px-4 py-3 rounded-xl font-semibold text-sm w-full text-left transition-all duration-300 transform hover:scale-105 ${
                    isActive ? 'text-white shadow-lg' : 'text-white/80 hover:text-white'
                }`}
            >
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    isActive
                        ? `bg-gradient-to-r ${item.color} opacity-100 shadow-lg`
                        : 'bg-white/10 opacity-0 group-hover:opacity-100'
                }`}></div>

                <div className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                    isActive
                        ? 'bg-gradient-to-r from-white/20 via-white/5 to-transparent opacity-100 animate-pulse'
                        : 'opacity-0'
                }`}></div>

                <div className="relative flex items-center space-x-2">
                    <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : 'group-hover:rotate-12'}`} />
                    <span className="hidden md:inline">{item.label}</span>
                    <span className="md:hidden">{item.label}</span>
                </div>

                {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    </div>
                )}
            </button>
        );
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            isScrolled
                ? 'bg-white/10 backdrop-blur-md shadow-2xl border-b border-white/20 py-2'
                : 'bg-gradient-to-r from-blue-600/20 to-green-600/20 backdrop-blur-sm py-4'
        }`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-3 group cursor-pointer">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
                            <div className="relative bg-gradient-to-r from-yellow-500 to-orange-600 p-3 rounded-full transform group-hover:scale-110 transition-transform duration-300">
                                <Trophy className="h-8 w-8 text-white animate-bounce" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-wider">
                                BOUHIA<span className="text-yellow-400">CITY</span>
                            </h1>
                            <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-400" />
                                <span className="text-white/80 text-sm font-semibold">TOURNOI 2025</span>
                                <Star className="h-3 w-3 text-yellow-400" />
                            </div>
                        </div>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navItems.map(renderNavButton)}
                    </div>

                    {/* CTA (Call to Action) + Burger */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs md:text-sm">
                            <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                            <span className="text-white font-bold">inscrits</span>
                        </div>

                        {/* Bouton S’INSCRIRE / Profil (VISIBLE UNIQUEMENT SUR GRAND ÉCRAN OU QUAND LE MENU MOBILE EST FERMÉ) */}
                        {!mobileMenuOpen && ( // <-- Ajout de cette condition
                            user ? (
                                <div
                                    className="relative group cursor-pointer hidden md:block" // Hidden on mobile, block on desktop
                                    onClick={() => navigate("/profile")}
                                >
                                    <img
                                        src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                                        alt="Profil"
                                        className="w-10 h-10 rounded-full border-2 border-yellow-400 hover:scale-110 transition-transform duration-300 object-cover"
                                    />
                                    <div className="absolute hidden group-hover:block top-full mt-2 bg-white text-black px-4 py-2 rounded shadow-md text-sm whitespace-nowrap">
                                        {user.user_metadata?.name || "Utilisateur"}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        navigate("/auth");
                                        setMobileMenuOpen(false); // S'assurer que le menu se ferme
                                    }}
                                    className="flex group relative overflow-hidden bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm hidden md:flex" // Hidden on mobile, flex on desktop
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center space-x-1">
                                        <Award className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                                        <span>S’INSCRIRE</span>
                                    </div>
                                </button>
                            )
                        )}

                        {/* Menu burger mobile */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-white p-2"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Menu mobile déroulant */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 flex flex-col items-start space-y-2">
                        {/* Ajout du bouton S'INSCRIRE/Profile dans le menu mobile */}
                        {mobileAuthButton}
                        {navItems.map(renderNavButton)}
                    </div>
                )}

                {/* Progress bar */}
                <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full transition-all duration-1000 animate-pulse" style={{ width: '67%' }}></div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;