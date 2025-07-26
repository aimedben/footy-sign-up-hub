import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, Zap, Award, Target, Users, Clock } from 'lucide-react';
import Navbar from "./ui/navbar"; 


const TournamentBracket = () => {
  const [currentRound, setCurrentRound] = useState(3); // Round actuel (0=1/8, 1=1/4, 2=1/2, 3=finale)
  const [animatingMatch, setAnimatingMatch] = useState(null);
    const [currentView, setCurrentView] = useState<"registration" | "admin-login" | "admin-dashboard" | "tournament" | "profil" | "Planning">("tournament");


  // Teams initiales (16 équipes)
  const initialTeams = [
    'BouhiaCity FC', 'Eagles United', 'Thunder Wolves', 'Fire Dragons',
    'Lightning Bolts', 'Storm Riders', 'Golden Lions', 'Silver Hawks',
    'Red Titans', 'Blue Sharks', 'Green Panthers', 'White Tigers',
    'Black Scorpions', 'Orange Phoenix', 'Purple Cobras', 'Yellow Leopards'
  ];

  // Structure du bracket avec les résultats
  const bracketData = {
    // Huitièmes de finale (Round 0)
    round0: [
      { team1: 'BouhiaCity FC', team2: 'Eagles United', winner: 'BouhiaCity FC', score: '3-1' },
      { team1: 'Thunder Wolves', team2: 'Fire Dragons', winner: 'Thunder Wolves', score: '2-0' },
      { team1: 'Lightning Bolts', team2: 'Storm Riders', winner: 'Lightning Bolts', score: '4-2' },
      { team1: 'Golden Lions', team2: 'Silver Hawks', winner: 'Golden Lions', score: '1-0' },
      { team1: 'Red Titans', team2: 'Blue Sharks', winner: 'Red Titans', score: '2-1' },
      { team1: 'Green Panthers', team2: 'White Tigers', winner: 'Green Panthers', score: '3-0' },
      { team1: 'Black Scorpions', team2: 'Orange Phoenix', winner: 'Black Scorpions', score: '2-2 (5-4)' },
      { team1: 'Purple Cobras', team2: 'Yellow Leopards', winner: 'Purple Cobras', score: '1-0' }
    ],
    // Quarts de finale (Round 1)
    round1: [
      { team1: 'BouhiaCity FC', team2: 'Thunder Wolves', winner: 'BouhiaCity FC', score: '2-1' },
      { team1: 'Lightning Bolts', team2: 'Golden Lions', winner: 'Lightning Bolts', score: '3-2' },
      { team1: 'Red Titans', team2: 'Green Panthers', winner: 'Green Panthers', score: '1-2' },
      { team1: 'Black Scorpions', team2: 'Purple Cobras', winner: 'Black Scorpions', score: '4-1' }
    ],
    // Demi-finales (Round 2)
    round2: [
      { team1: 'BouhiaCity FC', team2: 'Lightning Bolts', winner: 'BouhiaCity FC', score: '3-0' },
      { team1: 'Green Panthers', team2: 'Black Scorpions', winner: 'Black Scorpions', score: '2-1' }
    ],
    // Finale (Round 3)
    round3: [
      { team1: 'BouhiaCity FC', team2: 'Black Scorpions', winner: 'BouhiaCity FC', score: '4-2' }
    ]
  };

  const roundNames = ['Huitièmes', 'Quarts', 'Demi-finales', 'FINALE'];

  const MatchCard = ({ match, roundIndex, matchIndex, isCompleted }) => {
    const isWinner1 = match.winner === match.team1;
    const isWinner2 = match.winner === match.team2;
    const isCurrentMatch = roundIndex === currentRound && !isCompleted;

    return (
      <div className={`relative bg-white/10 backdrop-blur-sm rounded-lg border transition-all duration-500 transform hover:scale-105 ${
        isCurrentMatch ? 'border-yellow-400 shadow-lg shadow-yellow-400/20 animate-pulse' : 
        isCompleted ? 'border-green-400/50' : 'border-white/20'
      }`}>
        {/* Header du match */}
        <div className="p-3 border-b border-white/10 text-center">
          <div className="flex items-center justify-center space-x-2">
            {roundIndex === 3 ? <Crown className="h-4 w-4 text-yellow-400" /> : <Target className="h-4 w-4 text-white/60" />}
            <span className="text-white/80 text-sm font-semibold">
              Match {matchIndex + 1}
            </span>
          </div>
        </div>

        {/* Équipes */}
        <div className="p-4 space-y-3">
          {/* Équipe 1 */}
          <div className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
            isWinner1 
              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30' 
              : isCompleted 
              ? 'bg-red-500/10 border border-red-400/20' 
              : 'bg-white/5 border border-white/10'
          }`}>
            <div className="flex items-center space-x-3">
              {isWinner1 && <Trophy className="h-5 w-5 text-yellow-400 animate-bounce" />}
              <span className={`font-semibold ${isWinner1 ? 'text-green-300' : 'text-white'}`}>
                {match.team1}
              </span>
            </div>
            {isCompleted && (
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                isWinner1 ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'
              }`}>
                {match.score.split('-')[0]}
              </div>
            )}
          </div>

          {/* VS */}
          <div className="text-center">
            <span className="text-white/40 font-bold">VS</span>
          </div>

          {/* Équipe 2 */}
          <div className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
            isWinner2 
              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30' 
              : isCompleted 
              ? 'bg-red-500/10 border border-red-400/20' 
              : 'bg-white/5 border border-white/10'
          }`}>
            <div className="flex items-center space-x-3">
              {isWinner2 && <Trophy className="h-5 w-5 text-yellow-400 animate-bounce" />}
              <span className={`font-semibold ${isWinner2 ? 'text-green-300' : 'text-white'}`}>
                {match.team2}
              </span>
            </div>
            {isCompleted && (
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                isWinner2 ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'
              }`}>
                {match.score.split('-')[1]}
              </div>
            )}
          </div>
        </div>

        {/* Score complet */}
        {isCompleted && (
          <div className="px-4 pb-4">
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <span className="text-white/60 text-sm">Score final: </span>
              <span className="text-white font-bold">{match.score}</span>
            </div>
          </div>
        )}

        {/* Statut du match */}
        {isCurrentMatch && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold animate-pulse">
              EN COURS
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
    <Navbar currentView={''} setCurrentView={function (view: 'registration' | 'admin-login' | 'admin-dashboard' | 'tournament' | 'profil' | 'Planning'): void {
        throw new Error('Function not implemented.');
      } } />
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 p-4 pt-28">
      <div className="container mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <Trophy className="h-6 w-6 text-yellow-400 animate-bounce" />
            <h1 className="text-3xl font-black text-white">BRACKET DE TOURNOI</h1>
            <Trophy className="h-6 w-6 text-yellow-400 animate-bounce" />
          </div>
          
          <p className="text-white/80 text-lg mb-6">
            Suivez la progression de toutes les équipes jusqu'à la finale !
          </p>

          {/* Contrôles de navigation */}
          <div className="flex justify-center space-x-2 mb-8">
            {roundNames.map((name, index) => (
              <button
                key={index}
                onClick={() => setCurrentRound(index)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  currentRound === index
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">16</div>
            <div className="text-white/60 text-sm">Équipes</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">15</div>
            <div className="text-white/60 text-sm">Matchs Total</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">4</div>
            <div className="text-white/60 text-sm">Rounds</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <Crown className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">1</div>
            <div className="text-white/60 text-sm">Champion</div>
          </div>
        </div>

        {/* Bracket Display */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          
          {/* Round Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-white mb-2">
              {roundNames[currentRound]}
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-white/70">
                {currentRound === 3 ? 'Le match décisif !' : `${bracketData[`round${currentRound}`].length} matchs`}
              </span>
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
          </div>

          {/* Matches Grid */}
          <div className={`grid gap-6 ${
            currentRound === 0 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
            currentRound === 1 ? 'grid-cols-1 md:grid-cols-2' :
            currentRound === 2 ? 'grid-cols-1 md:grid-cols-2' :
            'grid-cols-1 max-w-md mx-auto'
          }`}>
            {bracketData[`round${currentRound}`].map((match, index) => (
              <MatchCard
                key={index}
                match={match}
                roundIndex={currentRound}
                matchIndex={index}
                isCompleted={currentRound < 3 || (currentRound === 3 && match.winner)}
              />
            ))}
          </div>

          {/* Champion Display (si finale terminée) */}
          {currentRound === 3 && bracketData.round3[0].winner && (
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-8 border border-yellow-400/30 max-w-md mx-auto">
                <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-3xl font-black text-white mb-2">🏆 CHAMPION 2025</h3>
                <p className="text-4xl font-black text-yellow-400 mb-4">
                  {bracketData.round3[0].winner}
                </p>
                <div className="flex justify-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation entre rounds */}
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => setCurrentRound(Math.max(0, currentRound - 1))}
            disabled={currentRound === 0}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              currentRound === 0 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
            }`}
          >
            ← Round Précédent
          </button>
          
          <button
            onClick={() => setCurrentRound(Math.min(3, currentRound + 1))}
            disabled={currentRound === 3}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              currentRound === 3 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
            }`}
          >
            Round Suivant →
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default TournamentBracket;