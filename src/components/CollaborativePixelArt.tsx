import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Image as ImageIcon, 
  Palette, 
  Target, 
  TrendingUp,
  Share2,
  Download,
  RefreshCw,
  Eye,
  Heart,
  Zap,
  Globe,
  Award,
  Clock,
  MapPin,
  Loader,
  CheckCircle,
  AlertCircle,
  X,
  Shield,
  User
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { LanguageSelector } from './LanguageSelector';
import { 
  collaborativeArtService, 
  PixelData, 
  ArtProjectStats,
  CreatePixelResponse 
} from '../services/collaborativeArtService';

interface DetailedStats {
  totalPixels: number;
  completedPixels: number;
  percentage: number;
  sessionsToday: number;
  pixelsThisWeek: number;
  averagePixelsPerDay: number;
  estimatedDaysRemaining: number;
}

interface TooltipData {
  x: number;
  y: number;
  contributorName: string;
  color: string;
  createdAt: string;
}

export const CollaborativePixelArt: React.FC = () => {
  const { t, language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [currentUserPixel, setCurrentUserPixel] = useState<PixelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPixel, setIsCreatingPixel] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [contributorName, setContributorName] = useState(''); // 🆕 Nom du contributeur
  const [error, setError] = useState<string | null>(null);
  const [recentContributors, setRecentContributors] = useState<Array<{
    contributor_name: string;
    created_at: string;
    color: string;
  }>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [canvasReady, setCanvasReady] = useState(false);
  const [ipLimitReached, setIpLimitReached] = useState(false);
  
  // 🆕 États pour le tooltip
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  // Couleurs prédéfinies pour l'art collaboratif
  const predefinedColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  // Charger les données initiales
  useEffect(() => {
    console.log('🚀 Initialisation du composant CollaborativePixelArt');
    loadInitialData();
    
    // Nettoyer les souscriptions au démontage du composant
    return () => {
      console.log('🧹 Nettoyage des souscriptions au démontage du composant');
      collaborativeArtService.unsubscribeAll();
    };
  }, []);

  // Configurer les souscriptions temps réel après le chargement initial
  useEffect(() => {
    if (!isLoading && pixels.length >= 0) {
      console.log('📡 Configuration des souscriptions temps réel');
      setupRealtimeSubscriptions();
    }
  }, [isLoading]);

  // 🎯 EFFET CORRIGÉ : Rendu du canvas avec vérification canvasReady ET taille cohérente
  useEffect(() => {
    if (!canvasRef.current) {
      console.log('⛔️ Canvas ref non prêt, attente...');
      return;
    }

    if (!canvasReady) {
      console.log('⛔️ Canvas pas prêt pour le rendu, attente...');
      return;
    }

    if (isLoading) {
      console.log('⏳ Chargement en cours, rendu différé');
      return;
    }

    console.log('✅ Canvas prêt, déclenchement du rendu avec', pixels.length, 'pixels');
    renderCanvas();
  }, [pixels, currentUserPixel, canvasReady, isLoading, language]);

  // 🆕 Gestionnaire de mouvement de souris pour le tooltip
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasReady || pixels.length === 0) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Convertir les coordonnées de la souris en coordonnées du canvas
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = mouseX * scaleX;
      const canvasY = mouseY * scaleY;
      
      // Convertir en coordonnées de pixel
      const CANVAS_WIDTH = 800;
      const CANVAS_HEIGHT = 833;
      const pixelX = Math.floor((canvasX / CANVAS_WIDTH) * 1200);
      const pixelY = Math.floor((canvasY / CANVAS_HEIGHT) * 1250);
      
      // Chercher un pixel à cette position
      const hoveredPixel = pixels.find(p => p.x === pixelX && p.y === pixelY);
      
      if (hoveredPixel) {
        setTooltip({
          x: pixelX,
          y: pixelY,
          contributorName: hoveredPixel.contributor_name || 'Contributeur Anonyme',
          color: hoveredPixel.color,
          createdAt: hoveredPixel.created_at
        });
        setTooltipPosition({ 
          x: event.clientX + 10, 
          y: event.clientY - 10 
        });
        setIsTooltipVisible(true);
      } else {
        setIsTooltipVisible(false);
        setTooltip(null);
      }
    };

    const handleMouseLeave = () => {
      setIsTooltipVisible(false);
      setTooltip(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [pixels, canvasReady]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingStep('Initialisation...');
      setCanvasReady(false); // 🔧 Reset du canvas ready

      console.log('🚀 Chargement initial des données...');

      // 1. Charger les pixels en premier (le plus important)
      setLoadingStep('Chargement des pixels...');
      const allPixels = await collaborativeArtService.getAllPixels(true); // Force refresh
      console.log('🎨 Pixels chargés:', allPixels.length, 'pixels');
      
      // Validation et filtrage des pixels
      const validPixels = allPixels.filter(pixel => {
        const isValid = pixel &&
          typeof pixel.x === 'number' &&
          typeof pixel.y === 'number' &&
          typeof pixel.color === 'string' &&
          pixel.color.match(/^#[0-9A-Fa-f]{6}$/) &&
          pixel.x >= 0 && pixel.x < 1200 &&
          pixel.y >= 0 && pixel.y < 1250;

        if (!isValid) {
          console.warn('⚠️ Pixel invalide filtré:', pixel);
        }
        return isValid;
      });

      console.log('✅ Pixels valides:', validPixels.length, '/', allPixels.length);
      setPixels(validPixels);

      // 2. Charger les statistiques
      setLoadingStep('Chargement des statistiques...');
      const detailedStats = await collaborativeArtService.getDetailedStats();
      if (detailedStats) {
        setStats(detailedStats);
        console.log('📊 Statistiques chargées:', detailedStats);
      }

      // 3. 🔒 Vérifier si l'utilisateur a déjà un pixel (par IP ET session)
      setLoadingStep('Vérification du pixel utilisateur...');
      const existingPixel = await collaborativeArtService.getCurrentSessionPixel();
      if (existingPixel) {
        setCurrentUserPixel(existingPixel);
        setIpLimitReached(true); // Cette IP a déjà un pixel
        console.log('👤 Pixel utilisateur existant trouvé:', existingPixel);
        console.log('🔒 Limite IP atteinte, création bloquée');
      } else {
        console.log('📝 Aucun pixel trouvé pour cette session/IP');
        setIpLimitReached(false);
      }

      // 4. Charger les contributeurs récents
      setLoadingStep('Chargement des contributeurs...');
      const contributors = await collaborativeArtService.getRecentContributors(5);
      setRecentContributors(contributors);
      console.log('👥 Contributeurs récents chargés:', contributors.length);

      setLoadingStep('Finalisation...');
      
      // 🎯 CORRECTION CRITIQUE : Attendre que le canvas soit dans le DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setCanvasReady(true); // ✅ Canvas maintenant prêt pour le rendu
      console.log('✅ Chargement initial terminé avec succès, canvas prêt');

    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      setError(t('common.error') + ': ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const setupRealtimeSubscriptions = () => {
    try {
      console.log('🔄 Configuration des souscriptions temps réel');
      
      // Écouter les nouveaux pixels
      const pixelSubscription = collaborativeArtService.subscribeToPixelUpdates((payload) => {
        console.log('🎨 Nouveau pixel reçu:', payload);
        if (payload.new) {
          setPixels(prev => {
            // Vérifier si le pixel n'existe pas déjà pour éviter les doublons
            const exists = prev.some(p => p.id === payload.new.id);
            if (!exists) {
              console.log('➕ Ajout du nouveau pixel à la liste');
              return [...prev, payload.new];
            }
            return prev;
          });
          // Recharger les stats et contributeurs
          loadStats();
          loadRecentContributors();
        }
      });

      // Écouter les mises à jour de statistiques
      const statsSubscription = collaborativeArtService.subscribeToStatsUpdates((payload) => {
        console.log('📊 Statistiques mises à jour:', payload);
        loadStats();
      });

      console.log('✅ Souscriptions configurées avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de la configuration des souscriptions:', error);
      setError('Erreur lors de la configuration des mises à jour temps réel.');
    }
  };

  const loadStats = async () => {
    try {
      const detailedStats = await collaborativeArtService.getDetailedStats();
      if (detailedStats) {
        setStats(detailedStats);
      }
    } catch (error) {
      console.error('Erreur lors du rechargement des stats:', error);
    }
  };

  // 🆕 Fonction pour recharger les contributeurs récents
  const loadRecentContributors = async () => {
    try {
      const contributors = await collaborativeArtService.getRecentContributors(5);
      setRecentContributors(contributors);
    } catch (error) {
      console.error('Erreur lors du rechargement des contributeurs:', error);
    }
  };

  // Fonction pour forcer le rechargement des données
  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Rechargement forcé des données...');
      
      // Forcer le rechargement des pixels
      await collaborativeArtService.forceRefresh();
      
      // Recharger toutes les données
      await loadInitialData();
      
      console.log('✅ Rechargement terminé');
    } catch (error) {
      console.error('❌ Erreur lors du rechargement:', error);
      setError('Erreur lors du rechargement des données');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 🎯 FONCTION DE RENDU CORRIGÉE avec taille de pixel COHÉRENTE
  const renderCanvas = () => {
    if (!canvasRef.current) {
      console.log('⚠️ Canvas ref non disponible pour le rendu');
      return;
    }

    if (!canvasReady) {
      console.log('⚠️ Canvas pas encore prêt pour le rendu');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('⚠️ Contexte 2D non disponible');
      return;
    }

    console.log('🖼️ Début du rendu canvas avec', pixels.length, 'pixels (TAILLE COHÉRENTE)');

    try {
      // 🎯 CONFIGURATION FIXE : Taille de canvas et pixels TOUJOURS identique
      const CANVAS_WIDTH = 800;
      const CANVAS_HEIGHT = 833;
      const PIXEL_SIZE = 2; // 🔧 TAILLE FIXE pour tous les pixels
      
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;

      // Fond gris pour les pixels non remplis
      ctx.fillStyle = '#F3F4F6';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Dessiner les pixels existants avec TAILLE FIXE
      if (pixels.length > 0) {
        console.log('🎨 Début du rendu des pixels avec TAILLE FIXE:', PIXEL_SIZE + 'px');

        let renderedCount = 0;
        pixels.forEach((pixel, index) => {
          try {
            // Validation des données du pixel
            if (!pixel || typeof pixel.x !== 'number' || typeof pixel.y !== 'number' || !pixel.color) {
              console.warn(`⚠️ Pixel ${index} invalide:`, pixel);
              return;
            }

            // Vérifier que les coordonnées sont dans les limites
            if (pixel.x < 0 || pixel.x >= 1200 || pixel.y < 0 || pixel.y >= 1250) {
              console.warn(`⚠️ Pixel ${index} hors limites:`, { x: pixel.x, y: pixel.y });
              return;
            }

            // Vérifier le format de la couleur
            if (!pixel.color.match(/^#[0-9A-Fa-f]{6}$/)) {
              console.warn(`⚠️ Couleur invalide pour le pixel ${index}:`, pixel.color);
              return;
            }

            ctx.fillStyle = pixel.color;
            
            // 🎯 CALCUL COHÉRENT : Même logique pour TOUS les pixels
            const scaleX = CANVAS_WIDTH / 1200;
            const scaleY = CANVAS_HEIGHT / 1250;
            
            const pixelX = Math.floor(pixel.x * scaleX);
            const pixelY = Math.floor(pixel.y * scaleY);
            
            // 🔧 TAILLE FIXE : Tous les pixels ont la même taille
            ctx.fillRect(pixelX, pixelY, PIXEL_SIZE, PIXEL_SIZE);
            renderedCount++;

            // Log pour les premiers pixels pour debug
            if (index < 3) {
              console.log(`🎨 Pixel ${index} (TAILLE FIXE ${PIXEL_SIZE}px):`, {
                original: { x: pixel.x, y: pixel.y, color: pixel.color },
                rendered: { x: pixelX, y: pixelY, size: PIXEL_SIZE }
              });
            }
          } catch (error) {
            console.warn(`❌ Erreur lors du rendu du pixel ${index}:`, error);
          }
        });

        console.log(`✅ ${renderedCount}/${pixels.length} pixels rendus avec TAILLE FIXE ${PIXEL_SIZE}px`);

        // Dessiner le pixel de l'utilisateur actuel avec un contour
        if (currentUserPixel) {
          try {
            ctx.fillStyle = currentUserPixel.color;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            
            const scaleX = CANVAS_WIDTH / 1200;
            const scaleY = CANVAS_HEIGHT / 1250;
            
            const x = Math.floor(currentUserPixel.x * scaleX);
            const y = Math.floor(currentUserPixel.y * scaleY);
            
            // 🔧 MÊME TAILLE pour le pixel utilisateur
            ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
            ctx.strokeRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
            
            console.log('👤 Pixel utilisateur rendu avec TAILLE FIXE:', {
              x: currentUserPixel.x,
              y: currentUserPixel.y,
              color: currentUserPixel.color,
              rendered: { x, y, size: PIXEL_SIZE }
            });
          } catch (error) {
            console.warn('❌ Erreur lors du rendu du pixel utilisateur:', error);
          }
        }

        console.log('✅ Canvas rendu avec PIXELS COHÉRENTS -', renderedCount, 'pixels affichés');
      } else {
        console.log('⚠️ Aucun pixel à afficher');
      }
    } catch (error) {
      console.error('❌ Erreur lors du rendu du canvas:', error);
    }
  };

  // 🔒 FONCTION CORRIGÉE : Générer un pixel avec vérification IP stricte
  const generateUserPixel = async () => {
    if (isCreatingPixel) {
      console.log('🚫 Création déjà en cours, ignoré');
      return;
    }

    // 🔒 Vérification préalable : Cette IP a-t-elle déjà un pixel ?
    if (ipLimitReached || currentUserPixel) {
      console.log('🚫 Limite IP atteinte ou pixel déjà existant');
      setError('Vous avez déjà contribué à cette œuvre d\'art ! Un seul pixel par utilisateur est autorisé.');
      return;
    }

    try {
      setIsCreatingPixel(true);
      setError(null);

      console.log('🎨 Tentative de création d\'un pixel...');
      console.log('🔒 IP Hash actuel:', collaborativeArtService.getCurrentIpHash()?.substring(0, 8) + '...');

      // 🆕 Utiliser le nom du contributeur ou un nom par défaut
      const finalContributorName = contributorName.trim() || 'Contributeur Anonyme';
      console.log('👤 Nom du contributeur:', finalContributorName);

      const result = await collaborativeArtService.createPixelForCurrentSession(
        selectedColor,
        finalContributorName
      );

      if (result) {
        if (result.is_new_session) {
          // ✅ NOUVEAU PIXEL CRÉÉ - Afficher le message de succès
          const newPixel: PixelData = {
            id: result.pixel_id,
            x: result.x,
            y: result.y,
            color: result.color,
            session_id: collaborativeArtService.getCurrentSessionId(),
            contributor_name: finalContributorName, // 🆕 Utiliser le nom saisi
            created_at: result.created_at
          };

          setCurrentUserPixel(newPixel);
          setPixels(prev => [...prev, newPixel]);
          setIpLimitReached(true); // Marquer la limite comme atteinte
          
          console.log('✅ Nouveau pixel créé avec succès:', newPixel);
          // ✅ Pas d'erreur pour un nouveau pixel
        } else {
          // 🔒 PIXEL EXISTANT RETOURNÉ - Protection anti-spam activée
          const existingPixel: PixelData = {
            id: result.pixel_id,
            x: result.x,
            y: result.y,
            color: result.color,
            session_id: collaborativeArtService.getCurrentSessionId(),
            contributor_name: t('pixel.art.contributor.you') || 'Vous',
            created_at: result.created_at
          };

          setCurrentUserPixel(existingPixel);
          setIpLimitReached(true);
          
          console.log('🔒 Pixel existant retourné (limite IP):', existingPixel);
          // 🔒 AFFICHER MESSAGE ANTI-SPAM au lieu du message de succès
          setError('Vous avez déjà contribué à cette œuvre d\'art ! Voici votre pixel existant.');
        }

        // Recharger les statistiques et contributeurs
        await loadStats();
        await loadRecentContributors(); // 🆕 Recharger les contributeurs pour voir le nouveau nom
      } else {
        console.error('❌ Aucun résultat retourné par le service');
        setError(t('pixel.art.error.create') || 'Impossible de créer le pixel. Vous avez peut-être déjà contribué.');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création du pixel:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('unique') || error.message.includes('déjà')) {
          setError('Vous avez déjà contribué à cette œuvre d\'art ! Un seul pixel par utilisateur est autorisé.');
          setIpLimitReached(true);
        } else {
          setError(t('pixel.art.error.create') || 'Erreur lors de la création du pixel. Veuillez réessayer.');
        }
      } else {
        setError(t('pixel.art.error.create') || 'Erreur lors de la création du pixel. Veuillez réessayer.');
      }
    } finally {
      setIsCreatingPixel(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const shareProject = () => {
    const title = t('pixel.art.share.title') || 'Art Collaboratif MedRecap+ - 1,5 Million de Pixels';
    const text = t('pixel.art.share.text') || 'Participez à la création d\'une œuvre d\'art collaborative ! Chaque session génère un pixel unique.';
    
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t('pixel.art.share.copied') || 'Lien copié dans le presse-papiers !');
    }
  };

  const downloadProgress = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `medrecap-collaborative-art-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg mb-2">
            {t('pixel.art.loading')}
          </p>
          {loadingStep && (
            <p className="text-sm text-purple-600">
              {loadingStep}
            </p>
          )}
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm max-w-md mx-auto">
            <p className="text-xs text-gray-500">
              🔄 Chargement des données depuis Supabase...
            </p>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('pixel.art.back')}</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {t('pixel.art.title')}
                </h1>
                <p className="text-sm text-gray-600">
                  {t('pixel.art.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSelector className="mr-2" showLabel={false} />
              <button
                onClick={shareProject}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('pixel.art.share')}
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={downloadProgress}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('pixel.art.download')}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <ImageIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎨 {t('pixel.art.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            {t('pixel.art.hero.description')}
          </p>

          {/* Progress Stats */}
          {stats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-purple-600">{stats.completedPixels.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">
                    {t('pixel.art.stats.generated')}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{stats.percentage.toFixed(2)}%</div>
                  <div className="text-sm text-gray-600">
                    {t('pixel.art.stats.progress')}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">{stats.sessionsToday}</div>
                  <div className="text-sm text-gray-600">
                    {t('pixel.art.stats.sessions.today')}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-orange-600">
                    {(stats.totalPixels - stats.completedPixels).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('pixel.art.stats.remaining')}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {t('pixel.art.progress.estimated').replace('{days}', stats.estimatedDaysRemaining.toString())}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Canvas Section - TAILLE AUGMENTÉE */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('pixel.art.realtime.title')}
                </h2>
                <button
                  onClick={handleForceRefresh}
                  disabled={isRefreshing}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title={t('pixel.art.realtime.refresh')}
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto border border-gray-300 rounded-lg shadow-sm cursor-crosshair"
                  style={{ imageRendering: 'pixelated' }}
                />
                {isRefreshing && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <div className="flex items-center gap-2 text-purple-600">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Rechargement...</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {t('pixel.art.realtime.final')}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ✅ {t('pixel.art.realtime.stored')} • {pixels.length} pixels chargés
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  🖱️ <strong>Survolez les pixels</strong> pour voir les contributeurs !
                </p>
              </div>
            </div>

            {/* Contributeurs récents */}
            {recentContributors.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('pixel.art.contributors.title')}
                </h3>
                <div className="space-y-3">
                  {recentContributors.map((contributor, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: contributor.color }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {contributor.contributor_name || 'Contributeur Anonyme'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(contributor.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interaction Section */}
          <div className="space-y-6">
            {/* 🔒 Votre Contribution - AVEC PROTECTION IP */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('pixel.art.contribution.title')}
              </h2>
              
              {currentUserPixel || ipLimitReached ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-300 rounded-lg flex items-center justify-center">
                    <div 
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: currentUserPixel?.color || selectedColor }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-600 font-medium">
                      {currentUserPixel ? t('pixel.art.contribution.success') : 'Contribution déjà effectuée'}
                    </p>
                  </div>
                  {/* 🔒 AFFICHAGE CONDITIONNEL : Seulement pour les NOUVEAUX pixels */}
                  {currentUserPixel && !error && (
                    <>
                      <p className="text-sm text-gray-600 mb-2">
                        {t('pixel.art.contribution.position').replace('{x}', currentUserPixel.x.toString()).replace('{y}', currentUserPixel.y.toString())}
                      </p>
                      <p className="text-xs text-blue-600">
                        {t('pixel.art.contribution.stored')}
                      </p>
                    </>
                  )}
                  
                  {/* 🔒 Message de protection IP */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Protection Anti-Spam</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Un seul pixel par utilisateur est autorisé pour garantir l'équité de cette œuvre collaborative.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <p className="text-gray-600 mb-4">
                      {t('pixel.art.contribution.choose')}
                    </p>
                    
                    {/* 🆕 Champ nom du contributeur */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Votre nom (optionnel)
                        </div>
                      </label>
                      <input
                        type="text"
                        value={contributorName}
                        onChange={(e) => setContributorName(e.target.value)}
                        placeholder="Entrez votre pseudo..."
                        maxLength={30}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ce nom apparaîtra dans les contributeurs récents
                      </p>
                    </div>
                    
                    {/* Color Picker */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {predefinedColors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-16 h-8 rounded border border-gray-300 mb-4"
                    />
                  </div>
                  
                  <button
                    onClick={generateUserPixel}
                    disabled={isCreatingPixel || ipLimitReached}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isCreatingPixel ? (
                      <div className="flex items-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        {t('pixel.art.contribution.creating')}
                      </div>
                    ) : (
                      <>
                        🎨 {t('pixel.art.contribution.generate')}
                      </>
                    )}
                  </button>
                  
                  {/* 🔒 Information de sécurité */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Sécurité</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Votre adresse IP est utilisée pour garantir qu'un seul pixel par utilisateur soit créé.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Statistiques Avancées */}
            {stats && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('pixel.art.stats.advanced')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {stats.pixelsThisWeek}
                    </div>
                    <div className="text-xs text-gray-600">
                      {t('pixel.art.stats.week')}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {stats.averagePixelsPerDay}
                    </div>
                    <div className="text-xs text-gray-600">
                      {t('pixel.art.stats.average')}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {stats.estimatedDaysRemaining}
                    </div>
                    <div className="text-xs text-gray-600">
                      {t('pixel.art.stats.days.remaining')}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {(stats.percentage * 10).toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {t('pixel.art.stats.art.score')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comment ça marche */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('pixel.art.how.title')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">1</div>
                  <p className="text-sm text-gray-700">
                    {t('pixel.art.how.step1')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-xs font-bold">2</div>
                  <p className="text-sm text-gray-700">
                    {t('pixel.art.how.step2')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full text-xs font-bold">3</div>
                  <p className="text-sm text-gray-700">
                    {t('pixel.art.how.step3')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-orange-600 text-white rounded-full text-xs font-bold">4</div>
                  <p className="text-sm text-gray-700">
                    {t('pixel.art.how.step4')}
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-2">
                {t('pixel.art.cta.title')}
              </h3>
              <p className="text-purple-100 mb-4">
                {t('pixel.art.cta.description')}
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Zap className="w-5 h-5" />
                {t('pixel.art.cta.back')}
              </a>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('pixel.art.storage.title')}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('pixel.art.storage.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="font-semibold text-green-800 mb-2">✅ {t('pixel.art.storage.persistent')}</div>
                <div className="text-green-700">{t('pixel.art.storage.persistent.desc')}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="font-semibold text-blue-800 mb-2">🔄 {t('pixel.art.storage.realtime')}</div>
                <div className="text-blue-700">{t('pixel.art.storage.realtime.desc')}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="font-semibold text-purple-800 mb-2">🔒 {t('pixel.art.storage.secure')}</div>
                <div className="text-purple-700">{t('pixel.art.storage.secure.desc')}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{t('pixel.art.location')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>{t('pixel.art.made.passion')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>{t('pixel.art.innovation')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 Tooltip flottant */}
      {isTooltipVisible && tooltip && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: tooltip.color }}
              ></div>
              <span className="font-medium">{tooltip.contributorName}</span>
            </div>
            <div className="text-xs text-gray-300">
              Position: ({tooltip.x}, {tooltip.y})
            </div>
            <div className="text-xs text-gray-300">
              {new Date(tooltip.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            {/* Flèche du tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};