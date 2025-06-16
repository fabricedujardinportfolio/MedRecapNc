import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  RefreshCw, 
  Users, 
  Clock, 
  Target, 
  Calendar, 
  Zap, 
  Info, 
  ChevronRight, 
  Palette, 
  Shield, 
  Database, 
  Sparkles,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { 
  collaborativeArtService, 
  PixelData, 
  ArtProjectStats 
} from '../services/collaborativeArtService';

export const CollaborativePixelArt: React.FC = () => {
  const { t, language } = useLanguage();
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [stats, setStats] = useState<ArtProjectStats | null>(null);
  const [detailedStats, setDetailedStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPixel, setIsGeneratingPixel] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [contributorName, setContributorName] = useState('');
  const [userPixel, setUserPixel] = useState<PixelData | null>(null);
  const [recentContributors, setRecentContributors] = useState<Array<{
    contributor_name: string;
    created_at: string;
    color: string;
  }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    contributor: string;
    color: string;
    date: string;
  } | null>(null);
  const [isExistingPixel, setIsExistingPixel] = useState(false);
  const [isArtCompleted, setIsArtCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelSize = 2; // Taille de chaque pixel sur le canvas
  const canvasWidth = 1200 * pixelSize;
  const canvasHeight = 1250 * pixelSize;
  
  // Couleurs disponibles
  const availableColors = [
    '#3B82F6', // Bleu
    '#EF4444', // Rouge
    '#10B981', // Vert
    '#F59E0B', // Orange
    '#8B5CF6', // Violet
    '#EC4899', // Rose
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F97316', // Orange foncé
    '#FBBF24', // Jaune
    '#A3E635', // Vert lime
    '#D946EF', // Fuchsia
    '#0EA5E9', // Bleu ciel
    '#64748B', // Gris bleu
    '#000000', // Noir
    '#FFFFFF', // Blanc
  ];

  // Initialiser le nom du contributeur à partir du localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('pixelArtContributorName');
    if (savedName) {
      setContributorName(savedName);
    }
  }, []);

  // Charger les pixels et les statistiques
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Charger les pixels existants
        const existingPixels = await collaborativeArtService.getAllPixels();
        setPixels(existingPixels);
        
        // Charger les statistiques du projet
        const projectStats = await collaborativeArtService.getProjectStats();
        setStats(projectStats);
        
        // Vérifier si l'art est complété (100%)
        if (projectStats && projectStats.percentage >= 100) {
          setIsArtCompleted(true);
        }
        
        // Charger les statistiques détaillées
        const detailedStatsData = await collaborativeArtService.getDetailedStats();
        setDetailedStats(detailedStatsData);
        
        // Charger les contributeurs récents
        const contributors = await collaborativeArtService.getRecentContributors(10);
        setRecentContributors(contributors);
        
        // Vérifier si l'utilisateur a déjà un pixel
        const existingUserPixel = await collaborativeArtService.getCurrentSessionPixel();
        
        if (existingUserPixel) {
          console.log('🎨 Pixel existant trouvé pour cet utilisateur:', existingUserPixel);
          setUserPixel(existingUserPixel);
          setIsExistingPixel(true);
        } else {
          // Vérifier si l'utilisateur a un pixel basé sur son IP
          const ipHash = await collaborativeArtService.getCurrentIpHash();
          if (ipHash) {
            const pixelByIp = await collaborativeArtService.getPixelByIpHash(ipHash);
            if (pixelByIp) {
              console.log('🎨 Pixel existant trouvé pour cette IP:', pixelByIp);
              setUserPixel(pixelByIp);
              setIsExistingPixel(true);
            }
          }
        }
        
        // Souscrire aux mises à jour en temps réel
        const pixelChannel = collaborativeArtService.subscribeToPixelUpdates((payload) => {
          const newPixel = payload.new as PixelData;
          setPixels(prevPixels => [...prevPixels, newPixel]);
          
          // Mettre à jour les statistiques
          if (stats) {
            setStats({
              ...stats,
              completed_pixels: stats.completed_pixels + 1,
              percentage: ((stats.completed_pixels + 1) / stats.total_pixels) * 100
            });
          }
          
          // Mettre à jour les contributeurs récents
          setRecentContributors(prev => {
            const newContributors = [{
              contributor_name: newPixel.contributor_name || 'Anonyme',
              created_at: newPixel.created_at,
              color: newPixel.color
            }, ...prev];
            return newContributors.slice(0, 10);
          });
        });
        
        const statsChannel = collaborativeArtService.subscribeToStatsUpdates((payload) => {
          setStats(payload.new);
          
          // Vérifier si l'art est complété (100%)
          if (payload.new && payload.new.percentage >= 100) {
            setIsArtCompleted(true);
          }
        });
        
        // Nettoyer les souscriptions
        return () => {
          collaborativeArtService.unsubscribeAll();
        };
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        setError(error instanceof Error ? error.message : 'Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Dessiner les pixels sur le canvas
  useEffect(() => {
    if (!canvasRef.current || pixels.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner chaque pixel
    pixels.forEach(pixel => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize);
    });
    
    // Mettre en évidence le pixel de l'utilisateur s'il existe
    if (userPixel) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        userPixel.x * pixelSize - 1, 
        userPixel.y * pixelSize - 1, 
        pixelSize + 2, 
        pixelSize + 2
      );
      
      // Ajouter un halo autour du pixel de l'utilisateur
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        userPixel.x * pixelSize - 3, 
        userPixel.y * pixelSize - 3, 
        pixelSize + 6, 
        pixelSize + 6
      );
    }
  }, [pixels, userPixel]);

  // Fonction pour trouver le pixel le plus proche du point de survol
  const findNearestPixel = (x: number, y: number, radius: number = 5) => {
    if (pixels.length === 0) return null;
    
    // Chercher d'abord un pixel exact à cette position
    const exactPixel = pixels.find(p => p.x === x && p.y === y);
    if (exactPixel) return exactPixel;
    
    // Si aucun pixel exact, chercher dans un rayon
    let nearestPixel = null;
    let minDistance = radius;
    
    pixels.forEach(pixel => {
      const distance = Math.sqrt(Math.pow(pixel.x - x, 2) + Math.pow(pixel.y - y, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearestPixel = pixel;
      }
    });
    
    return nearestPixel;
  };

  // Gérer le survol du canvas avec détection améliorée
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || pixels.length === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Calculer la position du pixel
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / pixelSize);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / pixelSize);
    
    // Trouver le pixel le plus proche dans un rayon de 3 pixels
    const nearestPixel = findNearestPixel(x, y, 3);
    
    if (nearestPixel) {
      setHoverInfo({
        x: nearestPixel.x,
        y: nearestPixel.y,
        contributor: nearestPixel.contributor_name || 'Anonyme',
        color: nearestPixel.color,
        date: new Date(nearestPixel.created_at).toLocaleString()
      });
    } else {
      setHoverInfo(null);
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoverInfo(null);
  };

  // Générer un pixel pour l'utilisateur
  const generatePixel = async () => {
    try {
      // Vérifier si l'art est complété
      if (isArtCompleted) {
        setError(t('pixel.art.completed.no.more.pixels'));
        return;
      }
      
      // Vérifier si l'utilisateur a déjà un pixel
      if (isExistingPixel && userPixel) {
        setError(t('pixel.art.existing.pixel.alert'));
        
        // Mettre en évidence le pixel existant
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Faire clignoter le pixel existant
            let blinks = 0;
            const blinkInterval = setInterval(() => {
              if (blinks % 2 === 0) {
                // Dessiner un halo
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.strokeRect(
                  userPixel.x * pixelSize - 4, 
                  userPixel.y * pixelSize - 4, 
                  pixelSize + 8, 
                  pixelSize + 8
                );
              } else {
                // Redessiner le canvas normal
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                pixels.forEach(pixel => {
                  ctx.fillStyle = pixel.color;
                  ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize);
                });
                
                // Remettre en évidence le pixel de l'utilisateur
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                  userPixel.x * pixelSize - 1, 
                  userPixel.y * pixelSize - 1, 
                  pixelSize + 2, 
                  pixelSize + 2
                );
                
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.strokeRect(
                  userPixel.x * pixelSize - 3, 
                  userPixel.y * pixelSize - 3, 
                  pixelSize + 6, 
                  pixelSize + 6
                );
              }
              
              blinks++;
              if (blinks >= 6) {
                clearInterval(blinkInterval);
              }
            }, 300);
          }
        }
        
        return;
      }
      
      setIsGeneratingPixel(true);
      setError(null);
      
      // Sauvegarder le nom du contributeur dans le localStorage
      if (contributorName) {
        localStorage.setItem('pixelArtContributorName', contributorName);
      }
      
      // Créer un pixel pour la session actuelle
      const result = await collaborativeArtService.createPixelForCurrentSession(
        selectedColor,
        contributorName || 'Anonyme'
      );
      
      if (result) {
        console.log('✅ Pixel créé avec succès:', result);
        
        // Vérifier si c'est un nouveau pixel ou un pixel existant
        if (!result.is_new_session) {
          setIsExistingPixel(true);
          setError(t('pixel.art.existing.pixel.alert'));
        }
        
        // Créer un objet PixelData à partir du résultat
        const newPixel: PixelData = {
          id: result.pixel_id,
          x: result.x,
          y: result.y,
          color: result.color,
          session_id: '',
          contributor_name: contributorName || 'Anonyme',
          created_at: result.created_at
        };
        
        // Mettre à jour le pixel de l'utilisateur
        setUserPixel(newPixel);
        
        // Ajouter le pixel à la liste si c'est un nouveau pixel
        if (result.is_new_session) {
          setPixels(prevPixels => [...prevPixels, newPixel]);
          
          // Mettre à jour les statistiques
          if (stats) {
            setStats({
              ...stats,
              completed_pixels: stats.completed_pixels + 1,
              percentage: ((stats.completed_pixels + 1) / stats.total_pixels) * 100
            });
          }
          
          // Mettre à jour les contributeurs récents
          setRecentContributors(prev => {
            const newContributors = [{
              contributor_name: contributorName || 'Anonyme',
              created_at: new Date().toISOString(),
              color: selectedColor
            }, ...prev];
            return newContributors.slice(0, 10);
          });
        }
        
        // Forcer un rechargement des données
        setTimeout(() => {
          refreshData();
        }, 2000);
      } else {
        setError(t('pixel.art.error.create'));
      }
    } catch (error) {
      console.error('❌ Erreur lors de la génération du pixel:', error);
      setError(error instanceof Error ? error.message : t('pixel.art.error.create'));
    } finally {
      setIsGeneratingPixel(false);
    }
  };

  // Rafraîchir les données
  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Forcer le rechargement des données
      await collaborativeArtService.forceRefresh();
      
      // Recharger les pixels
      const refreshedPixels = await collaborativeArtService.getAllPixels(true);
      setPixels(refreshedPixels);
      
      // Recharger les statistiques
      const refreshedStats = await collaborativeArtService.getProjectStats();
      setStats(refreshedStats);
      
      // Vérifier si l'art est complété (100%)
      if (refreshedStats && refreshedStats.percentage >= 100) {
        setIsArtCompleted(true);
      }
      
      // Recharger les statistiques détaillées
      const refreshedDetailedStats = await collaborativeArtService.getDetailedStats();
      setDetailedStats(refreshedDetailedStats);
      
      // Recharger les contributeurs récents
      const refreshedContributors = await collaborativeArtService.getRecentContributors(10);
      setRecentContributors(refreshedContributors);
      
      console.log('✅ Données rafraîchies avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement des données:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du rafraîchissement des données');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Partager l'URL
  const shareUrl = () => {
    const url = window.location.href;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setShowShareTooltip(true);
          setTimeout(() => setShowShareTooltip(false), 2000);
        })
        .catch(err => {
          console.error('Erreur lors de la copie:', err);
        });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Clipboard
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
      } catch (err) {
        console.error('Erreur lors de la copie:', err);
      }
      
      document.body.removeChild(textArea);
    }
  };

  // Télécharger l'image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'collaborative-pixel-art.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Formater le nombre avec séparateurs de milliers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US').format(num);
  };

  // Calculer le pourcentage de progression
  const calculateProgress = () => {
    if (!stats) return 0;
    return (stats.completed_pixels / stats.total_pixels) * 100;
  };

  // Formater le temps restant
  const formatTimeRemaining = () => {
    if (!detailedStats) return '';
    
    const days = detailedStats.estimatedDaysRemaining;
    
    if (days > 365) {
      const years = Math.floor(days / 365);
      return language === 'fr' 
        ? `${years} ${years > 1 ? 'années' : 'année'}`
        : `${years} ${years > 1 ? 'years' : 'year'}`;
    } else if (days > 30) {
      const months = Math.floor(days / 30);
      return language === 'fr'
        ? `${months} ${months > 1 ? 'mois' : 'mois'}`
        : `${months} ${months > 1 ? 'months' : 'month'}`;
    } else {
      return language === 'fr'
        ? `${days} ${days > 1 ? 'jours' : 'jour'}`
        : `${days} ${days > 1 ? 'days' : 'day'}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a 
                href="/" 
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">{t('pixel.art.back')}</span>
              </a>
              <div className="hidden md:block h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900 hidden md:block">
                {t('pixel.art.title')}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={shareUrl}
                  className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label={t('pixel.art.share')}
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {showShareTooltip && (
                  <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg z-10">
                    {t('pixel.art.share.copied')}
                  </div>
                )}
              </div>
              <button
                onClick={downloadImage}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={t('pixel.art.download')}
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                aria-label={t('pixel.art.realtime.refresh')}
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            🎨 {t('pixel.art.hero.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('pixel.art.hero.description')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('pixel.art.stats.generated')}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats ? formatNumber(stats.completed_pixels) : '...'}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <Palette className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <Target className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-blue-600">
                {stats ? formatNumber(stats.total_pixels) : '1 500 000'} {t('pixel.art.stats.remaining')}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('pixel.art.stats.progress')}</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats ? calculateProgress().toFixed(4) : '0.0000'}%
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <Clock className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">
                {isArtCompleted 
                  ? t('pixel.art.completed.days')
                  : detailedStats 
                    ? t('pixel.art.progress.estimated', { days: formatTimeRemaining() }) 
                    : '...'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('pixel.art.stats.sessions.today')}</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats ? formatNumber(stats.sessions_today) : '...'}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <Calendar className="w-4 h-4 text-orange-500 mr-1" />
              <span className="text-orange-600">
                {detailedStats ? formatNumber(detailedStats.pixelsThisWeek) : '...'} {t('pixel.art.stats.week')}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('pixel.art.stats.average')}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {detailedStats ? formatNumber(detailedStats.averagePixelsPerDay) : '...'}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <Info className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-purple-600">
                {detailedStats ? formatNumber(detailedStats.estimatedDaysRemaining) : '...'} {t('pixel.art.stats.days.remaining')}
              </span>
            </div>
          </div>
        </div>

        {/* Art Completed Banner */}
        {isArtCompleted && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-12 text-white shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">{t('pixel.art.completed.title')}</h2>
                <p className="text-white/90">{t('pixel.art.completed.subtitle')}</p>
                <p className="mt-2 text-white/80">{t('pixel.art.completed.thanks')}</p>
              </div>
              <button
                onClick={() => setShowCompletionModal(true)}
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors shadow-md"
              >
                {t('pixel.art.completed.view.celebration')}
              </button>
            </div>
            <div className="mt-4 bg-white/20 rounded-lg p-3">
              <p className="text-center font-medium">
                {t('pixel.art.completed.progress.complete')}
              </p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Canvas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{t('pixel.art.realtime.title')}</h2>
                <button
                  onClick={refreshData}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {t('pixel.art.realtime.refresh')}
                </button>
              </div>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">{t('pixel.art.loading')}</p>
                  <p className="text-sm text-blue-600 mt-2">{t('pixel.art.loading.supabase')}</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-red-800 mb-2">Erreur</h3>
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={refreshData}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    {t('pixel.art.realtime.refresh')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
                    <div className="text-xs text-gray-500 text-center py-1 bg-gray-200">
                      {t('pixel.art.hover.instruction')}
                    </div>
                    <div className="relative">
                      <canvas
                        ref={canvasRef}
                        width={canvasWidth}
                        height={canvasHeight}
                        className="w-full h-auto"
                        onMouseMove={handleCanvasMouseMove}
                        onMouseLeave={handleCanvasMouseLeave}
                      />
                      
                      {/* Invisible overlay for better hover detection */}
                      <div 
                        className="absolute inset-0 z-10"
                        onMouseMove={handleCanvasMouseMove}
                        onMouseLeave={handleCanvasMouseLeave}
                      ></div>
                    </div>
                    
                    {/* Hover Info */}
                    {hoverInfo && (
                      <div 
                        className="absolute bg-black bg-opacity-80 text-white text-xs p-2 rounded pointer-events-none z-20"
                        style={{
                          left: `${(hoverInfo.x * pixelSize) / (canvasWidth / 100)}%`,
                          top: `${(hoverInfo.y * pixelSize) / (canvasHeight / 100)}%`,
                          transform: 'translate(-50%, -100%)',
                          marginTop: '-8px'
                        }}
                      >
                        <div className="font-semibold">{hoverInfo.contributor}</div>
                        <div>({hoverInfo.x}, {hoverInfo.y})</div>
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: hoverInfo.color }}
                          ></div>
                          <span>{hoverInfo.color}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 text-center">
                    {t('pixel.art.realtime.final')}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {stats ? formatNumber(stats.completed_pixels) : '0'} / {stats ? formatNumber(stats.total_pixels) : '1 500 000'}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {stats ? calculateProgress().toFixed(4) : '0.0000'}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${calculateProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Database className="w-3 h-3" />
                    <span>{t('pixel.art.realtime.stored')}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* How It Works */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('pixel.art.how.title')}</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">1</span>
                  </div>
                  <p className="text-gray-700">{t('pixel.art.how.step1')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">2</span>
                  </div>
                  <p className="text-gray-700">{t('pixel.art.how.step2')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">3</span>
                  </div>
                  <p className="text-gray-700">{t('pixel.art.how.step3')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">4</span>
                  </div>
                  <p className="text-gray-700">{t('pixel.art.how.step4')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contribution & Stats */}
          <div className="space-y-6">
            {/* Contribution Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('pixel.art.contribution.title')}</h2>
              
              {isExistingPixel && userPixel ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">{t('pixel.art.existing.pixel.alert')}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-800">{t('pixel.art.contribution.success')}</span>
                      <div 
                        className="w-6 h-6 rounded-md border border-blue-300" 
                        style={{ backgroundColor: userPixel.color }}
                      ></div>
                    </div>
                    <p className="text-blue-700 text-sm">
                      {t('pixel.art.contribution.position', { x: userPixel.x, y: userPixel.y })}
                    </p>
                    <p className="text-blue-700 text-sm">
                      {t('pixel.art.contributor.name')}: {userPixel.contributor_name || t('pixel.art.contributor.you')}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                      <Database className="w-3 h-3" />
                      <span>{t('pixel.art.contribution.stored')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Alerte si l'art est complété */}
                  {isArtCompleted ? (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-800">{t('pixel.art.completed.no.more.pixels')}</span>
                      </div>
                      <p className="text-purple-700 text-sm">
                        {t('pixel.art.completed.thanks.description')}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-600">{t('pixel.art.contribution.choose')}</p>
                      
                      {/* Color Picker */}
                      <div className="grid grid-cols-8 gap-2">
                        {availableColors.map(color => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-md border-2 transition-all ${
                              selectedColor === color ? 'border-gray-900 scale-110 shadow-md' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Color ${color}`}
                          />
                        ))}
                      </div>
                      
                      {/* Contributor Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('pixel.art.contributor.name.label')}
                        </label>
                        <input
                          type="text"
                          value={contributorName}
                          onChange={(e) => setContributorName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t('pixel.art.contributor.name.placeholder')}
                          maxLength={50}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {t('pixel.art.contributor.name.help')}
                        </p>
                      </div>
                      
                      {/* Security Notice */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">{t('pixel.art.security.ip.title')}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {t('pixel.art.security.ip.description')}
                        </p>
                      </div>
                      
                      {/* Generate Button */}
                      <button
                        onClick={generatePixel}
                        disabled={isGeneratingPixel}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                      >
                        {isGeneratingPixel ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {t('pixel.art.contribution.creating')}
                          </>
                        ) : (
                          <>
                            <Palette className="w-5 h-5" />
                            {t('pixel.art.contribution.generate')}
                          </>
                        )}
                      </button>
                      
                      {/* Error Display */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Recent Contributors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('pixel.art.contributors.title')}</h2>
              
              {recentContributors.length > 0 ? (
                <div className="space-y-3">
                  {recentContributors.map((contributor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-md border border-gray-300" 
                          style={{ backgroundColor: contributor.color }}
                        ></div>
                        <span className="text-gray-900 font-medium">
                          {contributor.contributor_name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(contributor.created_at).toLocaleTimeString(
                          language === 'fr' ? 'fr-FR' : 'en-US',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">{t('pixel.art.loading')}</p>
              )}
            </div>

            {/* Advanced Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('pixel.art.stats.advanced')}</h2>
              
              {detailedStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">{t('pixel.art.stats.week')}</p>
                      <p className="text-lg font-semibold text-gray-900">{formatNumber(detailedStats.pixelsThisWeek)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">{t('pixel.art.stats.average')}</p>
                      <p className="text-lg font-semibold text-gray-900">{formatNumber(detailedStats.averagePixelsPerDay)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">{t('pixel.art.stats.days.remaining')}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {isArtCompleted 
                          ? t('pixel.art.completed.days')
                          : formatNumber(detailedStats.estimatedDaysRemaining)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">{t('pixel.art.stats.art.score')}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {Math.floor(Math.random() * 100) + 900}/1000
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mt-12 text-white shadow-lg">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">{t('pixel.art.cta.title')}</h2>
            <p className="text-lg text-white/90 mb-6">{t('pixel.art.cta.description')}</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-blue-600 rounded-lg font-semibold transition-colors shadow-md"
            >
              {t('pixel.art.cta.back')}
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('pixel.art.storage.title')}</h3>
              <p className="text-gray-300 text-sm mb-4">
                {t('pixel.art.storage.description')}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Database className="w-4 h-4 text-blue-400" />
                <span>Supabase</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('pixel.art.security.title')}</h3>
              <p className="text-gray-300 text-sm mb-4">
                {t('pixel.art.security.description')}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>{t('pixel.art.storage.secure')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>{t('pixel.art.storage.persistent')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>{t('pixel.art.storage.realtime')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-4">MedRecap+</h3>
                <p className="text-gray-300 text-sm">
                  {t('pixel.art.location')}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>{t('pixel.art.made.passion')}</span>
                </div>
                <span>{t('pixel.art.innovation')}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Completion Celebration Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl max-w-lg w-full text-center text-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">
                {t('pixel.art.completed.modal.title')}
              </h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-white/70 mb-1">{t('pixel.art.completed.modal.achievement')}</p>
                    <p className="text-xl font-bold">100%</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-white/70 mb-1">{t('pixel.art.completed.modal.total.pixels')}</p>
                    <p className="text-xl font-bold">1.5M</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-white/70 mb-1">{t('pixel.art.completed.modal.completion')}</p>
                    <p className="text-xl font-bold">100%</p>
                  </div>
                </div>
                
                <p className="text-lg font-semibold mb-3">
                  {t('pixel.art.completed.modal.description')}
                </p>
                
                <div className="bg-yellow-300/20 rounded-lg p-4 border border-yellow-300/30 mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span className="font-bold text-yellow-300">{t('pixel.art.completed.modal.thanks.title')}</span>
                  </div>
                  <p className="text-xs text-yellow-100 leading-relaxed">
                    {t('pixel.art.completed.modal.thanks.message')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={downloadImage}
                  className="px-8 py-3 bg-white hover:bg-gray-100 text-purple-600 rounded-lg font-bold transition-colors shadow-lg"
                >
                  {t('pixel.art.completed.modal.download')}
                </button>
                <button
                  onClick={shareUrl}
                  className="px-8 py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold transition-colors shadow-lg"
                >
                  {t('pixel.art.completed.modal.share')}
                </button>
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="px-8 py-3 bg-transparent hover:bg-white/10 text-white border border-white/30 rounded-lg font-bold transition-colors"
                >
                  {t('pixel.art.completed.modal.continue')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};