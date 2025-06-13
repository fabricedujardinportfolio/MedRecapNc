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
  X
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

export const CollaborativePixelArt: React.FC = () => {
  const { t, language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [currentUserPixel, setCurrentUserPixel] = useState<PixelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPixel, setIsCreatingPixel] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [error, setError] = useState<string | null>(null);
  const [recentContributors, setRecentContributors] = useState<Array<{
    contributor_name: string;
    created_at: string;
    color: string;
  }>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Couleurs prédéfinies pour l'art collaboratif
  const predefinedColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
    setupRealtimeSubscriptions();
    
    // Nettoyer les souscriptions au démontage du composant
    return () => {
      console.log('🧹 Nettoyage des souscriptions au démontage du composant');
      collaborativeArtService.unsubscribeAll();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🚀 Chargement initial des données...');

      // Charger les statistiques
      const detailedStats = await collaborativeArtService.getDetailedStats();
      if (detailedStats) {
        setStats(detailedStats);
        console.log('📊 Statistiques chargées:', detailedStats);
      }

      // Vérifier si l'utilisateur a déjà un pixel
      const existingPixel = await collaborativeArtService.getCurrentSessionPixel();
      if (existingPixel) {
        setCurrentUserPixel(existingPixel);
        console.log('👤 Pixel utilisateur existant trouvé:', existingPixel);
      }

      // Charger tous les pixels avec retry automatique
      const allPixels = await collaborativeArtService.getAllPixels(true); // Force refresh
      setPixels(allPixels);
      console.log('🎨 Pixels chargés:', allPixels.length, 'pixels');

      // Charger les contributeurs récents
      const contributors = await collaborativeArtService.getRecentContributors(5);
      setRecentContributors(contributors);
      console.log('👥 Contributeurs récents chargés:', contributors.length);

    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      setError(t('common.error') + ': ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsLoading(false);
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
          // Recharger les stats
          loadStats();
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

  // Dessiner l'image sur le canvas
  useEffect(() => {
    if (!canvasRef.current || isLoading || !stats) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log('🖼️ Rendu du canvas avec', pixels.length, 'pixels');

    // Configurer le canvas
    const displayWidth = 600;
    const displayHeight = 625;
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Fond gris pour les pixels non remplis
    ctx.fillStyle = '#F3F4F6';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Dessiner les pixels existants
    const scaleX = displayWidth / 1200;
    const scaleY = displayHeight / 1250;

    pixels.forEach(pixel => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(
        Math.floor(pixel.x * scaleX),
        Math.floor(pixel.y * scaleY),
        Math.ceil(scaleX),
        Math.ceil(scaleY)
      );
    });

    // Dessiner le pixel de l'utilisateur actuel avec un contour
    if (currentUserPixel) {
      ctx.fillStyle = currentUserPixel.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      const x = Math.floor(currentUserPixel.x * scaleX);
      const y = Math.floor(currentUserPixel.y * scaleY);
      ctx.fillRect(x, y, Math.ceil(scaleX), Math.ceil(scaleY));
      ctx.strokeRect(x, y, Math.ceil(scaleX), Math.ceil(scaleY));
    }

    console.log('✅ Canvas rendu avec succès');
  }, [pixels, currentUserPixel, isLoading, stats]);

  // Générer un pixel pour l'utilisateur actuel
  const generateUserPixel = async () => {
    if (isCreatingPixel || currentUserPixel) return;

    try {
      setIsCreatingPixel(true);
      setError(null);

      const result = await collaborativeArtService.createPixelForCurrentSession(
        selectedColor,
        t('pixel.art.contributor.name') || 'Contributeur MedRecap+'
      );

      if (result) {
        const newPixel: PixelData = {
          id: result.pixel_id,
          x: result.x,
          y: result.y,
          color: result.color,
          session_id: collaborativeArtService.getCurrentSessionId(),
          contributor_name: t('pixel.art.contributor.you') || 'Vous',
          created_at: result.created_at
        };

        setCurrentUserPixel(newPixel);
        
        if (result.is_new_session) {
          // Nouveau pixel créé
          setPixels(prev => [...prev, newPixel]);
        }

        // Recharger les statistiques
        await loadStats();
        
        // Recharger les contributeurs récents
        const contributors = await collaborativeArtService.getRecentContributors(5);
        setRecentContributors(contributors);

      } else {
        setError(t('pixel.art.error.create') || 'Impossible de créer le pixel. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de la création du pixel:', error);
      setError(t('pixel.art.error.create') || 'Erreur lors de la création du pixel. Veuillez réessayer.');
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
          <p className="text-gray-600 text-lg">
            {t('pixel.art.loading')}
          </p>
          <p className="text-sm text-purple-600 mt-2">
            {t('pixel.art.loading.supabase')}
          </p>
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
          {/* Canvas Section */}
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
                  className="w-full h-auto border border-gray-300 rounded-lg shadow-sm"
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
              </div>
            </div>

            {/* Contributeurs récents */}
            {recentContributors.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('pixel.art.contributors.title')}
                </h3>
                <div className="space-y-2">
                  {recentContributors.map((contributor, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: contributor.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{contributor.contributor_name}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {new Date(contributor.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interaction Section */}
          <div className="space-y-6">
            {/* Votre Contribution */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('pixel.art.contribution.title')}
              </h2>
              
              {currentUserPixel ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-300 rounded-lg flex items-center justify-center">
                    <div 
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: currentUserPixel.color }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-600 font-medium">
                      {t('pixel.art.contribution.success')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {t('pixel.art.contribution.position').replace('{x}', currentUserPixel.x.toString()).replace('{y}', currentUserPixel.y.toString())}
                  </p>
                  <p className="text-xs text-blue-600">
                    {t('pixel.art.contribution.stored')}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <p className="text-gray-600 mb-4">
                      {t('pixel.art.contribution.choose')}
                    </p>
                    
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
                    disabled={isCreatingPixel}
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
    </div>
  );
};