import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  Crown, 
  Users, 
  Star, 
  ShoppingCart,
  Trophy,
  DollarSign,
  Skull,
  Zap,
  MessageCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { MOCK_CELEBRITIES } from '../mock/mockData';
import { vipService } from '../services/vipService';

// Fonction pour obtenir l'emoji correspondant au masque animal
const getAnimalEmoji = (mask) => {
  const emojiMap = {
    'loup': '🐺', 'renard': '🦊', 'ours': '🐻', 'chat': '🐱', 'elephant': '🐘',
    'lion': '🦁', 'tigre': '🐅', 'singe': '🐵', 'aigle': '🦅', 'corbeau': '🐦‍⬛',
    'chouette': '🦉', 'vautour': '🦅', 'paon': '🦚', 'flamant': '🦩', 'serpent': '🐍',
    'crocodile': '🐊', 'iguane': '🦎', 'tortue': '🐢', 'mante': '🦗', 'scorpion': '🦂',
    'araignee': '🕷️', 'scarabee': '🪲', 'libellule': '🦋', 'papillon': '🦋', 'requin': '🦈',
    'pieuvre': '🐙', 'homard': '🦞', 'hippocampe': '🦄', 'dragon': '🐉', 'phenix': '🔥',
    'chauve-souris': '🦇', 'pangolin': '🦔', 'cameleon': '🦎', 'pingouin': '🐧', 'ours-polaire': '🐻‍❄️',
    'narval': '🦄', 'toucan': '🦜', 'jaguar': '🐆', 'capibara': '🐹', 'raie-manta': '🐠',
    'poisson-lune': '🐟', 'anguille': '🐍', 'trilobite': '🦀', 'ammonite': '🐚',
    'kraken': '🐙', 'licorne': '🦄', 'griffon': '🦅', 'sphinx': '🐱'
  };
  return emojiMap[mask] || '🎭';
};

// Fonction pour obtenir la couleur selon la personnalité
const getPersonalityColor = (personality) => {
  const colorMap = {
    'dominateur': 'text-red-400 border-red-400',
    'manipulateur': 'text-purple-400 border-purple-400',
    'violent': 'text-red-600 border-red-600',
    'énigmatique': 'text-indigo-400 border-indigo-400',
    'philosophe': 'text-blue-400 border-blue-400',
    'royal': 'text-yellow-400 border-yellow-400',
    'chasseur': 'text-orange-400 border-orange-400',
    'fou': 'text-pink-400 border-pink-400',
    'observateur': 'text-cyan-400 border-cyan-400',
    'oracle': 'text-purple-600 border-purple-600',
    'mystique': 'text-indigo-600 border-indigo-600',
    'nécrophage': 'text-gray-400 border-gray-400',
    'narcissique': 'text-pink-600 border-pink-600',
    'excentrique': 'text-magenta-400 border-magenta-400',
    'traître': 'text-green-600 border-green-600',
    'primitif': 'text-brown-400 border-brown-400',
    'méditatif': 'text-green-400 border-green-400',
    'sage': 'text-blue-600 border-blue-600',
    'predateur': 'text-red-500 border-red-500',
    'vengeur': 'text-orange-600 border-orange-600',
    'envoûteur': 'text-violet-400 border-violet-400',
    'mélancolique': 'text-gray-500 border-gray-500',
    'brutal': 'text-red-700 border-red-700',
    'impérial': 'text-gold-400 border-gold-400',
    'cyclique': 'text-teal-400 border-teal-400',
    'vampirique': 'text-red-800 border-red-800',
    'défensif': 'text-gray-600 border-gray-600',
    'snob': 'text-blue-300 border-blue-300',
    'survivant': 'text-white border-white',
    'licorne': 'text-rainbow border-rainbow',
    'gracieux': 'text-cyan-300 border-cyan-300',
    'bizarre': 'text-lime-400 border-lime-400',
    'énergique': 'text-yellow-500 border-yellow-500',
    'ancien': 'text-brown-600 border-brown-600',
    'léviathan': 'text-blue-800 border-blue-800',
    'corrompu': 'text-black border-black',
    'devinettes': 'text-amber-400 border-amber-400'
  };
  return colorMap[personality] || 'text-gray-400 border-gray-400';
};

const VipSalon = ({ gameState, updateGameState }) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('salon');
  const [selectedCelebrity, setSelectedCelebrity] = useState(null);
  const [currentVips, setCurrentVips] = useState([]);
  const [loadingVips, setLoadingVips] = useState(false);
  const [allVips, setAllVips] = useState([]);
  const [pastWinners, setPastWinners] = useState([]);
  const [loadingWinners, setLoadingWinners] = useState(false);

  // Charger les VIPs et les gagnants lors du montage du composant
  useEffect(() => {
    loadSalonVips();
    loadAllVips();
    loadPastWinners();
  }, [gameState.vipSalonLevel]);

  const loadPastWinners = async () => {
    try {
      setLoadingWinners(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/statistics/winners`);
      if (response.ok) {
        const winners = await response.json();
        setPastWinners(winners);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des gagnants:', error);
    } finally {
      setLoadingWinners(false);
    }
  };

  const loadSalonVips = async () => {
    try {
      setLoadingVips(true);
      const vips = await vipService.getSalonVips(gameState.vipSalonLevel);
      setCurrentVips(vips);
    } catch (error) {
      console.error('Erreur lors du chargement des VIPs:', error);
      // En cas d'erreur, utiliser des VIPs par défaut
      setCurrentVips([]);
    } finally {
      setLoadingVips(false);
    }
  };

  const loadAllVips = async () => {
    try {
      const vips = await vipService.getAllVips();
      setAllVips(vips);
    } catch (error) {
      console.error('Erreur lors du chargement de tous les VIPs:', error);
    }
  };

  const refreshVips = async () => {
    try {
      setLoadingVips(true);
      // Générer un ID de partie temporaire pour rafraîchir les VIPs
      const tempGameId = `salon_${Date.now()}`;
      const result = await vipService.refreshGameVips(tempGameId, gameState.vipSalonLevel);
      setCurrentVips(result.vips);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des VIPs:', error);
    } finally {
      setLoadingVips(false);
    }
  };

  const salonUpgrades = [
    { 
      level: 1, 
      name: 'Salon Basique', 
      capacity: 1, 
      cost: 0, 
      description: 'Salon d\'entrée avec 1 place VIP',
      unlocked: true 
    },
    { 
      level: 2, 
      name: 'Salon Confort', 
      capacity: 3, 
      cost: 500000, // 500k
      description: 'Salon confort avec 3 places VIP',
      unlocked: gameState.money >= 500000
    },
    { 
      level: 3, 
      name: 'Salon Élégant', 
      capacity: 5, 
      cost: 1500000, // 1.5M
      description: 'Salon élégant avec 5 places VIP',
      unlocked: gameState.money >= 1500000 && gameState.vipSalonLevel >= 2 
    },
    { 
      level: 4, 
      name: 'Salon Luxe', 
      capacity: 8, 
      cost: 3500000, // 3.5M
      description: 'Salon de luxe avec bar, 8 places VIP',
      unlocked: gameState.money >= 3500000 && gameState.vipSalonLevel >= 3 
    },
    { 
      level: 5, 
      name: 'Salon Premium', 
      capacity: 10, 
      cost: 7500000, // 7.5M
      description: 'Salon premium avec service, 10 places VIP',
      unlocked: gameState.money >= 7500000 && gameState.vipSalonLevel >= 4 
    },
    { 
      level: 6, 
      name: 'Salon Impérial', 
      capacity: 12, 
      cost: 15000000, // 15M
      description: 'Salon impérial avec équipements, 12 places VIP',
      unlocked: gameState.money >= 15000000 && gameState.vipSalonLevel >= 5 
    },
    { 
      level: 7, 
      name: 'Salon Royal', 
      capacity: 15, 
      cost: 30000000, // 30M
      description: 'Salon royal avec services VIP, 15 places VIP',
      unlocked: gameState.money >= 30000000 && gameState.vipSalonLevel >= 6 
    },
    { 
      level: 8, 
      name: 'Salon Suprême', 
      capacity: 17, 
      cost: 60000000, // 60M
      description: 'Salon suprême avec luxe absolu, 17 places VIP',
      unlocked: gameState.money >= 60000000 && gameState.vipSalonLevel >= 7 
    },
    { 
      level: 9, 
      name: 'Salon Légendaire', 
      capacity: 20, 
      cost: 100000000, // 100M
      description: 'Prestige maximum légendaire, 20 places VIP',
      unlocked: gameState.money >= 100000000 && gameState.vipSalonLevel >= 8 
    }
  ];

  const purchaseCelebrity = (celebrity) => {
    if (gameState.money >= celebrity.price) {
      updateGameState({
        money: gameState.money - celebrity.price,
        ownedCelebrities: [...(gameState.ownedCelebrities || []), celebrity.id]
      });
    }
  };

  const upgradeSalon = (level) => {
    const upgrade = salonUpgrades.find(s => s.level === level);
    if (upgrade && gameState.money >= upgrade.cost && upgrade.unlocked) {
      updateGameState({
        money: gameState.money - upgrade.cost,
        vipSalonLevel: level
      });
    }
  };

  const currentSalon = salonUpgrades.find(s => s.level === gameState.vipSalonLevel);
  const ownedCelebrities = MOCK_CELEBRITIES.filter(c => 
    gameState.ownedCelebrities?.includes(c.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-4xl font-black text-white">Salon VIP</h1>
              <p className="text-gray-400">Gérez vos VIP et célébrités</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">${gameState.money.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Budget disponible</div>
          </div>
        </div>

        {/* Statut du salon actuel */}
        <Card className="bg-black/50 border-yellow-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Crown className="w-12 h-12 text-yellow-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentSalon?.name}</h2>
                  <p className="text-gray-400">{currentSalon?.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-yellow-400">{currentSalon?.capacity}</div>
                <div className="text-sm text-gray-400">Places VIP</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-black/50 border border-red-500/30">
            <TabsTrigger value="salon" className="data-[state=active]:bg-red-600">
              <Crown className="w-4 h-4 mr-2" />
              Salon
            </TabsTrigger>
            <TabsTrigger value="vips" className="data-[state=active]:bg-red-600">
              <Users className="w-4 h-4 mr-2" />
              VIP
            </TabsTrigger>
            <TabsTrigger value="celebrities" className="data-[state=active]:bg-red-600">
              <Star className="w-4 h-4 mr-2" />
              Célébrités
            </TabsTrigger>
            <TabsTrigger value="museum" className="data-[state=active]:bg-red-600">
              <Skull className="w-4 h-4 mr-2" />
              Musée des morts
            </TabsTrigger>
          </TabsList>

          {/* Gestion du salon */}
          <TabsContent value="salon" className="space-y-6">
            <Card className="bg-black/50 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white">Améliorations du salon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {salonUpgrades.map((upgrade) => (
                    <div
                      key={upgrade.level}
                      className={`p-6 rounded-lg border transition-all ${
                        gameState.vipSalonLevel === upgrade.level
                          ? 'bg-yellow-900/20 border-yellow-500/50'
                          : upgrade.unlocked
                          ? 'bg-gray-800/50 border-gray-600/30 hover:bg-gray-700/50'
                          : 'bg-gray-900/50 border-gray-700/30 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-white font-bold text-lg">{upgrade.name}</h3>
                          <p className="text-gray-400 text-sm">{upgrade.description}</p>
                        </div>
                        {gameState.vipSalonLevel === upgrade.level && (
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                            Actuel
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Capacité VIP:</span>
                          <span className="text-white font-medium">{upgrade.capacity} places</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Coût:</span>
                          <span className={`font-bold ${upgrade.cost === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {upgrade.cost === 0 ? 'Gratuit' : `$${upgrade.cost.toLocaleString()}`}
                          </span>
                        </div>

                        {gameState.vipSalonLevel < upgrade.level && (
                          <Button
                            onClick={() => upgradeSalon(upgrade.level)}
                            disabled={!upgrade.unlocked || gameState.money < upgrade.cost}
                            className={`w-full ${
                              upgrade.unlocked && gameState.money >= upgrade.cost
                                ? 'bg-yellow-600 hover:bg-yellow-700'
                                : 'bg-gray-600 cursor-not-allowed'
                            }`}
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            {!upgrade.unlocked ? 'Prérequis manquants' : 'Améliorer'}
                          </Button>
                        )}
                      </div>

                      {/* Barre de progression vers le niveau suivant */}
                      {gameState.vipSalonLevel === upgrade.level && upgrade.level < 9 && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <div className="text-sm text-gray-400 mb-2">
                            Prochain niveau: {salonUpgrades.find(s => s.level === upgrade.level + 1)?.name}
                          </div>
                          <Progress 
                            value={Math.min(100, (gameState.money / salonUpgrades.find(s => s.level === upgrade.level + 1)?.cost) * 100)} 
                            className="h-2" 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des VIP */}
          <TabsContent value="vips" className="space-y-6">
            <Card className="bg-black/50 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  VIP Permanents
                  <Button 
                    onClick={refreshVips} 
                    disabled={loadingVips}
                    variant="outline" 
                    size="sm"
                    className="ml-auto"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingVips ? 'animate-spin' : ''}`} />
                    Changer les VIPs
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingVips ? (
                  <div className="flex justify-center items-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
                    <span className="ml-2 text-gray-400">Chargement des VIPs...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentVips.map((vip, index) => (
                      <Card key={vip.id || index} className="bg-gray-800/50 border-gray-600/30">
                        <CardContent className="p-6 text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl">{getAnimalEmoji(vip.mask)}</span>
                          </div>
                          <h3 className="text-white font-bold mb-2">{vip.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={`mb-4 ${getPersonalityColor(vip.personality)}`}
                          >
                            {vip.personality}
                          </Badge>
                          
                          {/* Dialogue récent */}
                          <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
                            <MessageCircle className="w-4 h-4 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-300 italic">
                              "{vip.dialogues[Math.floor(Math.random() * vip.dialogues.length)]}"
                            </p>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Frais de visionnage:</span>
                              <span className="text-green-400">${vip.viewing_fee?.toLocaleString() || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Masque:</span>
                              <span className="text-white">{vip.mask}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Gains totaux:</span>
                              <span className="text-yellow-400">${vip.total_winnings?.toLocaleString() || '0'}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* Statistiques du salon - VERSION AMÉLIORÉE */}
                <div className="mt-8 p-6 bg-gradient-to-r from-green-900/30 to-yellow-900/30 border border-green-500/30 rounded-lg">
                  <h4 className="text-white font-bold mb-4 text-center text-lg">💰 Statistiques du salon VIP</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{currentVips.length}</div>
                      <div className="text-gray-400">VIPs présents</div>
                    </div>
                    <div className="text-center bg-green-800/30 p-3 rounded-lg border border-green-500/30">
                      <div className="text-3xl font-bold text-green-400">
                        ${currentVips.reduce((sum, vip) => sum + (vip.viewing_fee || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-green-300 font-medium">Revenus totaux</div>
                      <div className="text-xs text-green-200 mt-1">Frais de visionnage VIP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{currentSalon?.capacity}</div>
                      <div className="text-gray-400">Capacité max</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{allVips.length}</div>
                      <div className="text-gray-400">VIPs disponibles</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-300">
                      💡 <span className="text-yellow-400 font-medium">Les revenus totaux</span> représentent la somme que vous recevrez 
                      à la fin des jeux grâce aux frais de visionnage payés par les VIPs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Boutique de célébrités */}
          <TabsContent value="celebrities" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Boutique de célébrités</h2>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  {ownedCelebrities.length} possédées
                </Badge>
                <Badge variant="outline" className="text-gray-400">
                  {/* Calculer le total : célébrités normales + vrais gagnants */}
                  {MOCK_CELEBRITIES.filter(c => c.category !== "Ancien vainqueur" && c.category !== "Ancienne vainqueur").length + pastWinners.length} disponibles
                </Badge>
                {pastWinners.length > 0 && (
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {pastWinners.length} anciens gagnants
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Afficher les célébrités normales (filtrer les faux anciens gagnants) */}
              {MOCK_CELEBRITIES
                .filter(celebrity => celebrity.category !== "Ancien vainqueur" && celebrity.category !== "Ancienne vainqueur")
                .map((celebrity) => {
                  const isOwned = gameState.ownedCelebrities?.includes(celebrity.id);
                  
                  return (
                    <Card 
                      key={celebrity.id} 
                      className={`transition-all cursor-pointer ${
                        isOwned 
                          ? 'bg-green-900/20 border-green-500/30' 
                          : 'bg-gray-800/50 border-gray-600/30 hover:bg-gray-700/50'
                      }`}
                      onClick={() => setSelectedCelebrity(celebrity)}
                    >
                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <Star className="w-8 h-8 text-yellow-400" />
                          </div>
                          <h3 className="text-white font-bold">{celebrity.name}</h3>
                          <p className="text-gray-400 text-sm">{celebrity.category}</p>
                        </div>

                        <div className="space-y-2 mb-4">
                          {/* Étoiles */}
                          <div className="flex justify-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${
                                  i < celebrity.stars ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                }`} 
                              />
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Intel:</span>
                              <span className="text-white">{celebrity.stats.intelligence}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Force:</span>
                              <span className="text-white">{celebrity.stats.force}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Agilité:</span>
                              <span className="text-white">{celebrity.stats.agilité}/10</span>
                            </div>
                          </div>

                          {celebrity.wins && (
                            <div className="flex justify-center">
                              <Badge variant="outline" className="text-purple-400 border-purple-400 text-xs">
                                {celebrity.wins} victoires
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="text-center">
                          {isOwned ? (
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              Possédée
                            </Badge>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-yellow-400 font-bold">
                                ${celebrity.price.toLocaleString()}
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  purchaseCelebrity(celebrity);
                                }}
                                disabled={gameState.money < celebrity.price}
                                className={`w-full text-xs ${
                                  gameState.money >= celebrity.price
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-gray-600 cursor-not-allowed'
                                }`}
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Acheter
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

              {/* Afficher les vrais anciens gagnants */}
              {pastWinners.map((winner) => {
                const isOwned = gameState.ownedCelebrities?.includes(winner.id);
                
                return (
                  <Card 
                    key={winner.id} 
                    className={`transition-all cursor-pointer border-2 ${
                      isOwned 
                        ? 'bg-green-900/20 border-green-500/30' 
                        : 'bg-gradient-to-br from-yellow-900/30 to-red-900/30 border-yellow-400/50 hover:border-yellow-400/70'
                    }`}
                    onClick={() => setSelectedCelebrity(winner)}
                  >
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-red-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <Crown className="w-8 h-8 text-yellow-200" />
                        </div>
                        <h3 className="text-white font-bold">{winner.name}</h3>
                        <p className="text-yellow-400 text-sm font-medium">{winner.category}</p>
                        <p className="text-gray-400 text-xs">{winner.nationality}</p>
                      </div>

                      <div className="space-y-2 mb-4">
                        {/* Étoiles */}
                        <div className="flex justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < winner.stars ? 'text-yellow-400 fill-current' : 'text-gray-600'
                              }`} 
                            />
                          ))}
                        </div>

                        {/* Stats améliorées */}
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Intel:</span>
                            <span className="text-blue-400 font-bold">{winner.stats.intelligence}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Force:</span>
                            <span className="text-red-400 font-bold">{winner.stats.force}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Agilité:</span>
                            <span className="text-green-400 font-bold">{winner.stats.agilité}/10</span>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">
                            👑 Vainqueur
                          </Badge>
                        </div>
                      </div>

                      <div className="text-center">
                        {isOwned ? (
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            Possédée
                          </Badge>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-yellow-400 font-bold">
                              ${winner.price.toLocaleString()}
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                purchaseCelebrity(winner);
                              }}
                              disabled={gameState.money < winner.price}
                              className={`w-full text-xs ${
                                gameState.money >= winner.price
                                  ? 'bg-yellow-600 hover:bg-yellow-700 text-black font-bold'
                                  : 'bg-gray-600 cursor-not-allowed'
                              }`}
                            >
                              <Crown className="w-3 h-3 mr-1" />
                              Acheter
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Message si pas de gagnants */}
              {pastWinners.length === 0 && !loadingWinners && (
                <Card className="bg-gray-800/30 border-gray-600/30 col-span-full">
                  <CardContent className="p-8 text-center">
                    <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white font-bold mb-2">Aucun ancien gagnant</h3>
                    <p className="text-gray-400 text-sm">
                      Terminez vos premières parties pour voir apparaître vos gagnants dans la boutique !
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Musée des morts */}
          <TabsContent value="museum" className="space-y-6">
            <Card className="bg-black/50 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Skull className="w-5 h-5" />
                  Musée des morts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-400">
                  <Skull className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Bientôt disponible</h3>
                  <p>Les portraits des joueurs éliminés seront exposés ici</p>
                  <p className="text-sm mt-2">Organisez votre premier jeu pour commencer la collection</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal détails célébrité */}
        {selectedCelebrity && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-gray-900 border-red-500/30 max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  {selectedCelebrity.name}
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCelebrity(null)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Star className="w-10 h-10 text-yellow-400" />
                  </div>
                  <Badge variant="outline" className="text-gray-300">
                    {selectedCelebrity.nationality}
                  </Badge>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Biographie</h4>
                  <p className="text-gray-300 text-sm">{selectedCelebrity.biography}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-800/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{selectedCelebrity.stats.intelligence}</div>
                    <div className="text-xs text-gray-400">Intelligence</div>
                  </div>
                  <div className="bg-gray-800/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">{selectedCelebrity.stats.force}</div>
                    <div className="text-xs text-gray-400">Force</div>
                  </div>
                  <div className="bg-gray-800/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{selectedCelebrity.stats.agilité}</div>
                    <div className="text-xs text-gray-400">Agilité</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VipSalon;