import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  Share2, 
  Download, 
  Users, 
  Calendar, 
  Clock, 
  Target, 
  BarChart3, 
  Palette, 
  Sparkles,
  Info,
  Check,
  Copy,
  Lock,
  Award,
  Rocket,
  Database,
  MapPin,
  Heart,
  Eye,
  EyeOff,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { collaborativeArtService, PixelData, ArtProjectStats } from '../services/collaborativeArtService';

export const CollaborativePixelArt: React.FC = () => {
  const { t, language } = useLanguage();
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [stats, setStats] = useState<ArtProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPixel, setIsCreatingPixel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#3B82F6'); // Blue default
  const [userPixel, setUserPixel] = useState<PixelData | null>(null);
  const [recentContributors, setRecentContributors] = useState<Array<{
    contributor_name: string;
    created_at: string;
    color: string;
  }>>([]);
  const [detailedStats, setDetailedStats] = useState<{
    totalPixels: number;
    completedPixels: number;
    percentage: number;
    sessionsToday: number;
    pixelsThisWeek: number;
    averagePixelsPerDay: number;
    estimatedDaysRemaining: number;
  } | null>(null);
  const [contributorName, setContributorName] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [isArtComplete, setIsArtComplete] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hoveredPixel, setHoveredPixel] = useState<PixelData | null>(null);
  const [tooltipMode, setTooltipMode] = useState<'all' | 'circles-only'>('all');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState('#FFFFFF');
  const [showExistingPixelAlert, setShowExistingPixelAlert] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelSize = 10; // Increased pixel size for better visibility
  const hoverDetectionSize = 20; // Larger detection area for hover
  
  // Load all pixels and stats on mount
  useEffect(() => {
    loadData();
    
    // Check if the user already has a pixel
    checkExistingUserPixel();
    
    // Load recent contributors
    loadRecentContributors();
    
    // Load detailed stats
    loadDetailedStats();
    
    // Subscribe to real-time updates
    const pixelChannel = collaborativeArtService.subscribeToPixelUpdates((payload) => {
      console.log('🔄 Nouveau pixel reçu:', payload);
      // Add the new pixel to the state and redraw
      if (payload.new) {
        setPixels(prevPixels => [...prevPixels, payload.new]);
        drawPixel(payload.new);
        
        // Refresh stats
        loadStats();
        
        // Refresh recent contributors
        loadRecentContributors();
      }
    });
    
    const statsChannel = collaborativeArtService.subscribeToStatsUpdates((payload) => {
      console.log('🔄 Statistiques mises à jour:', payload);
      if (payload.new) {
        setStats(payload.new);
        
        // Check if art is complete
        if (payload.new.percentage >= 100) {
          setIsArtComplete(true);
        }
      }
    });
    
    // Cleanup subscriptions
    return () => {
      collaborativeArtService.unsubscribeAll();
    };
  }, []);
  
  // Draw pixels whenever they change
  useEffect(() => {
    if (pixels.length > 0 && canvasRef.current) {
      drawAllPixels();
    }
  }, [pixels, pixelSize, canvasBackgroundColor]);
  
  // Check if art is complete based on stats
  useEffect(() => {
    if (stats && stats.percentage >= 100) {
      setIsArtComplete(true);
    }
  }, [stats]);
  
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load pixels
      const allPixels = await collaborativeArtService.getAllPixels();
      console.log('🔄 Pixels chargés:', allPixels.length);
      setPixels(allPixels);
      
      // Load stats
      await loadStats();
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
      setIsLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const projectStats = await collaborativeArtService.getProjectStats();
      setStats(projectStats);
      
      // Check if art is complete
      if (projectStats && projectStats.percentage >= 100) {
        setIsArtComplete(true);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error);
    }
  };
  
  const loadRecentContributors = async () => {
    try {
      const contributors = await collaborativeArtService.getRecentContributors(10);
      setRecentContributors(contributors);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des contributeurs récents:', error);
    }
  };
  
  const loadDetailedStats = async () => {
    try {
      const stats = await collaborativeArtService.getDetailedStats();
      setDetailedStats(stats);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques détaillées:', error);
    }
  };
  
  const checkExistingUserPixel = async () => {
    try {
      const existingPixel = await collaborativeArtService.getCurrentSessionPixel();
      if (existingPixel) {
        console.log('✅ Pixel existant trouvé pour cette session:', existingPixel);
        setUserPixel(existingPixel);
        // Show alert if user already has a pixel
        setShowExistingPixelAlert(true);
        // Hide alert after 5 seconds
        setTimeout(() => setShowExistingPixelAlert(false), 5000);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du pixel existant:', error);
    }
  };
  
  const createPixel = async () => {
    if (isArtComplete) {
      setShowCompletionModal(true);
      return;
    }
    
    setIsCreatingPixel(true);
    setError(null);
    
    try {
      const newPixel = await collaborativeArtService.createPixelForCurrentSession(
        selectedColor,
        contributorName || 'Contributeur MedRecap+'
      );
      
      if (newPixel) {
        console.log('✅ Nouveau pixel créé:', newPixel);
        
        if (!newPixel.is_new_session) {
          console.log('⚠️ Pixel existant retourné - pas de nouvelle session');
          setShowExistingPixelAlert(true);
          setTimeout(() => setShowExistingPixelAlert(false), 5000);
        }
        
        // Convertir le résultat en PixelData
        const pixelData: PixelData = {
          id: newPixel.pixel_id,
          x: newPixel.x,
          y: newPixel.y,
          color: newPixel.color,
          session_id: collaborativeArtService.getCurrentSessionId(),
          contributor_name: contributorName || 'Contributeur MedRecap+',
          created_at: newPixel.created_at
        };
        
        setUserPixel(pixelData);
        
        // Ajouter le pixel à la liste si c'est un nouveau
        if (newPixel.is_new_session) {
          setPixels(prevPixels => [...prevPixels, pixelData]);
          
          // Dessiner le pixel
          drawPixel(pixelData);
          
          // Rafraîchir les statistiques
          loadStats();
          loadDetailedStats();
          loadRecentContributors();
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création du pixel:', error);
      setError(t('pixel.art.error.create'));
    } finally {
      setIsCreatingPixel(false);
    }
  };
  
  const drawAllPixels = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas background
    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw all pixels
    let validPixelsCount = 0;
    pixels.forEach(pixel => {
      if (pixel && typeof pixel.x === 'number' && typeof pixel.y === 'number' && pixel.color) {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize);
        
        // Add a border to each pixel for better visibility
        ctx.strokeStyle = canvasBackgroundColor === '#000000' ? '#FFFFFF' : '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(pixel.x, pixel.y, pixelSize, pixelSize);
        
        validPixelsCount++;
      } else {
        console.warn('⚠️ Pixel invalide ignoré:', pixel);
      }
    });
    
    console.log(`✅ ${validPixelsCount}/${pixels.length} pixels valides dessinés sur le canvas`);
    
    // Draw user's pixel with a highlight if it exists
    if (userPixel) {
      // Draw a highlight around the user's pixel
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(userPixel.x - 2, userPixel.y - 2, pixelSize + 4, pixelSize + 4);
      
      // Draw the pixel itself
      ctx.fillStyle = userPixel.color;
      ctx.fillRect(userPixel.x, userPixel.y, pixelSize, pixelSize);
      
      // Add a second contrasting border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(userPixel.x, userPixel.y, pixelSize, pixelSize);
    }
  };
  
  const drawPixel = (pixel: PixelData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (pixel && typeof pixel.x === 'number' && typeof pixel.y === 'number' && pixel.color) {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize);
      
      // Add a border for better visibility
      ctx.strokeStyle = canvasBackgroundColor === '#000000' ? '#FFFFFF' : '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(pixel.x, pixel.y, pixelSize, pixelSize);
      
      console.log(`✅ Pixel dessiné à (${pixel.x}, ${pixel.y}) avec couleur ${pixel.color}`);
    } else {
      console.warn('⚠️ Tentative de dessiner un pixel invalide:', pixel);
    }
  };

  const toggleCanvasBackground = () => {
    setCanvasBackgroundColor(prev => prev === '#FFFFFF' ? '#000000' : '#FFFFFF');
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (canvas.width / 1200));
    const y = Math.floor((e.clientY - rect.top) / (canvas.height / 1250));
    
    // Find pixel at this position with larger detection area
    const pixelAtPosition = pixels.find(p => 
      Math.abs(p.x - x) <= hoverDetectionSize/2 && 
      Math.abs(p.y - y) <= hoverDetectionSize/2
    );
    
    if (pixelAtPosition) {
      setHoveredPixel(pixelAtPosition);
    } else {
      setHoveredPixel(null);
    }
  };
  
  const handleCanvasMouseLeave = () => {
    setHoveredPixel(null);
  };
  
  const handleRefresh = async () => {
    await collaborativeArtService.forceRefresh();
    loadData();
  };
  
  const handleShareClick = () => {
    const url = window.location.href;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 3000);
        })
        .catch(err => {
          console.error('❌ Erreur lors de la copie du lien:', err);
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    }
  };
  
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a temporary link
    const link = document.createElement('a');
    link.download = 'collaborative-pixel-art.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const formatPercentage = (value: number) => {
    return value.toFixed(4);
  };
  
  const getColorClass = (color: string) => {
    // Extract hex value without #
    const hex = color.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate luminance (simplified)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return appropriate text color class
    return luminance > 0.5 ? 'text-gray-900' : 'text-white';
  };
  
  const handleTooltipModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTooltipMode(e.target.value as 'all' | 'circles-only');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center">
              <a 
                href="/" 
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">{t('pixel.art.back')}</span>
              </a>
              <div className="h-6 border-l border-gray-300 mx-4"></div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Palette className="w-6 h-6 text-purple-600" />
                <span>{t('pixel.art.title')}</span>
                <span className="text-sm font-normal text-gray-500 hidden sm:inline">
                  {t('pixel.art.subtitle')}
                </span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3 mt-3 sm:mt-0">
              <button
                onClick={handleShareClick}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {linkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                <span>{linkCopied ? t('pixel.art.share.copied') : t('pixel.art.share')}</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{t('pixel.art.download')}</span>
              </button>
              
              <button
                onClick={handleRefresh}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{t('pixel.art.realtime.refresh')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">{t('pixel.art.hero.title')}</h2>
            <p className="text-lg text-purple-100 mb-6">{t('pixel.art.hero.description')}</p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-200" />
                  <h3 className="font-semibold">{t('pixel.art.stats.generated')}</h3>
                </div>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    stats?.completed_pixels.toLocaleString() || '0'
                  )}
                </p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-200" />
                  <h3 className="font-semibold">{t('pixel.art.stats.progress')}</h3>
                </div>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    `${formatPercentage(stats?.percentage || 0)}%`
                  )}
                </p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-200" />
                  <h3 className="font-semibold">{t('pixel.art.stats.sessions.today')}</h3>
                </div>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    stats?.sessions_today.toLocaleString() || '0'
                  )}
                </p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-200" />
                  <h3 className="font-semibold">
                    {isArtComplete ? t('pixel.art.completed.days') : t('pixel.art.stats.remaining')}
                  </h3>
                </div>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : isArtComplete ? (
                    '0'
                  ) : (
                    ((stats?.total_pixels || 0) - (stats?.completed_pixels || 0)).toLocaleString()
                  )}
                </p>
              </div>
            </div>
            
            {/* Progress Estimate */}
            <div className="mt-6 text-center">
              {isArtComplete ? (
                <p className="text-white font-medium">
                  {t('pixel.art.completed.progress.complete')}
                </p>
              ) : (
                <p className="text-purple-100">
                  {t('pixel.art.progress.estimated', { 
                    days: detailedStats?.estimatedDaysRemaining.toLocaleString() || '?' 
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Canvas and Contribution Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Canvas Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                {t('pixel.art.realtime.title')}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleCanvasBackground}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {canvasBackgroundColor === '#FFFFFF' ? 'Black Background' : 'White Background'}
                </button>
                <button 
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-full"
                  title="Toggle debug info"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <RefreshCw className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-600">{t('pixel.art.loading')}</p>
                <p className="text-sm text-purple-600 mt-2">{t('pixel.art.loading.supabase')}</p>
              </div>
            ) : (
              <div className="relative">
                <canvas 
                  ref={canvasRef} 
                  width={1200} 
                  height={1250}
                  className="w-full h-auto border border-gray-200 rounded-lg"
                  style={{ background: canvasBackgroundColor }}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={handleCanvasMouseLeave}
                />
                
                {/* Hover Tooltip */}
                {hoveredPixel && (
                  <div 
                    className="absolute bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-10"
                    style={{
                      left: `${(hoveredPixel.x / 1200) * 100}%`,
                      top: `${(hoveredPixel.y / 1250) * 100}%`,
                      transform: 'translate(-50%, -130%)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: hoveredPixel.color }}
                      ></div>
                      <span>{hoveredPixel.contributor_name || t('pixel.art.contributor.name')}</span>
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      ({hoveredPixel.x}, {hoveredPixel.y})
                    </div>
                  </div>
                )}
                
                {/* Show All Tooltips */}
                {tooltipMode === 'all' && pixels.map((pixel, index) => (
                  <div 
                    key={index}
                    className="absolute bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs pointer-events-none z-10"
                    style={{
                      left: `${(pixel.x / 1200) * 100}%`,
                      top: `${(pixel.y / 1250) * 100}%`,
                      transform: 'translate(-50%, -130%)',
                      maxWidth: '120px'
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: pixel.color }}
                      ></div>
                      <span className="truncate">{pixel.contributor_name || t('pixel.art.contributor.name')}</span>
                    </div>
                  </div>
                ))}
                
                {/* Visual Markers for Pixels - Circles Only Mode */}
                {(tooltipMode === 'all' || tooltipMode === 'circles-only') && pixels.map((pixel, index) => (
                  <div 
                    key={`marker-${index}`}
                    className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none"
                    style={{
                      left: `${(pixel.x / 1200) * 100}%`,
                      top: `${(pixel.y / 1250) * 100}%`,
                      backgroundColor: pixel.color,
                      transform: 'translate(-50%, -50%)',
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.3)'
                    }}
                  />
                ))}
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-600">
              <p>{t('pixel.art.realtime.final')}</p>
              <p className="flex items-center gap-2 mt-1 text-xs text-purple-600">
                <Database className="w-3 h-3" />
                {t('pixel.art.realtime.stored')}
              </p>
              <p className="flex items-center gap-2 mt-1 text-xs text-blue-600">
                <Info className="w-3 h-3" />
                {t('pixel.art.realtime.sizepixels')}
              </p>
              
              <div className="mt-2">
                <select
                  value={tooltipMode}
                  onChange={handleTooltipModeChange}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Show All Tooltips</option>
                  <option value="circles-only">Circles Only</option>
                </select>
              </div>
            </div>
            
            {/* Debug Info */}
            {showDebugInfo && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono">
                <h4 className="font-bold mb-2">Debug Info:</h4>
                <p>Pixels loaded: {pixels.length}</p>
                <p>Canvas size: 1200×1250</p>
                <p>Pixel size: {pixelSize}px</p>
                <p>Hover detection: {hoverDetectionSize}px</p>
                <p>Tooltip mode: {tooltipMode}</p>
                <p>Background color: {canvasBackgroundColor}</p>
                <p>User pixel: {userPixel ? `(${userPixel.x}, ${userPixel.y}) - ${userPixel.color}` : 'None'}</p>
                <p>Session ID: {collaborativeArtService.getCurrentSessionId().substring(0, 10)}...</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs"
                >
                  Force Refresh
                </button>
              </div>
            )}
          </div>
          
          {/* Contribution Section */}
          <div className="space-y-6">
            {/* Your Contribution */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                {t('pixel.art.contribution.title')}
              </h3>
              
              {/* Alert for existing pixel */}
              {showExistingPixelAlert && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5 text-yellow-600" />
                    <p className="font-medium text-yellow-800">{t('pixel.art.existing.pixel.alert')}</p>
                  </div>
                </div>
              )}
              
              {userPixel ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: userPixel.color }}></div>
                    <div>
                      <p className="font-medium text-gray-900">{t('pixel.art.contribution.success')}</p>
                      <p className="text-sm text-gray-600">
                        {t('pixel.art.contribution.position', { x: userPixel.x, y: userPixel.y })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-purple-600" />
                      <p className="text-sm font-medium text-purple-800">{t('pixel.art.contribution.stored')}</p>
                    </div>
                    <p className="text-xs text-purple-700">
                      {userPixel.contributor_name || t('pixel.art.contributor.name')}
                      {userPixel.contributor_name === contributorName ? ` (${t('pixel.art.contributor.you')})` : ''}
                    </p>
                  </div>
                </div>
              ) : isArtComplete ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <p className="font-medium text-yellow-800">{t('pixel.art.completed.no.more.pixels')}</p>
                  </div>
                  <p className="text-sm text-yellow-700">{t('pixel.art.completed.thanks.description')}</p>
                  <button
                    onClick={() => setShowCompletionModal(true)}
                    className="mt-3 w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    {t('pixel.art.completed.view.celebration')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">{t('pixel.art.contribution.choose')}</p>
                  
                  {/* Color Picker */}
                  <div className="grid grid-cols-5 gap-2">
                    {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
                      '#EC4899', '#6366F1', '#F97316', '#14B8A6', '#000000'].map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-full aspect-square rounded-lg transition-all ${
                          selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-600 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  
                  {/* Contributor Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('pixel.art.contributor.name.label')}
                    </label>
                    <input
                      type="text"
                      value={contributorName}
                      onChange={(e) => setContributorName(e.target.value)}
                      placeholder={t('pixel.art.contributor.name.placeholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('pixel.art.contributor.name.help')}
                    </p>
                  </div>
                  
                  {/* Security Notice */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-800">{t('pixel.art.security.ip.title')}</p>
                    </div>
                    <p className="text-xs text-blue-700">
                      {t('pixel.art.security.ip.description')}
                    </p>
                  </div>
                  
                  {/* Generate Button */}
                  <button
                    onClick={createPixel}
                    disabled={isCreatingPixel}
                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isCreatingPixel ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>{t('pixel.art.contribution.creating')}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>{t('pixel.art.contribution.generate')}</span>
                      </>
                    )}
                  </button>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Recent Contributors */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                {t('pixel.art.contributors.title')}
              </h3>
              
              <div className="space-y-3">
                {recentContributors.length > 0 ? (
                  recentContributors.map((contributor, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: contributor.color }}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {contributor.contributor_name || t('pixel.art.contributor.name')}
                          {contributor.contributor_name === contributorName ? ` (${t('pixel.art.contributor.you')})` : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(contributor.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    {isLoading ? t('pixel.art.loading') : 'No contributors yet'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Advanced Stats */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                {t('pixel.art.stats.advanced')}
              </h3>
              
              {detailedStats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">{t('pixel.art.stats.week')}</p>
                    <p className="text-lg font-bold text-gray-900">{detailedStats.pixelsThisWeek.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">{t('pixel.art.stats.average')}</p>
                    <p className="text-lg font-bold text-gray-900">{detailedStats.averagePixelsPerDay.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">{t('pixel.art.stats.days.remaining')}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {isArtComplete ? '0' : detailedStats.estimatedDaysRemaining.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">{t('pixel.art.stats.art.score')}</p>
                    <p className="text-lg font-bold text-purple-600">
                      {Math.floor(detailedStats.percentage * 10).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24">
                  <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Info className="w-6 h-6 text-purple-600" />
            {t('pixel.art.how.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-full mb-4">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <p className="text-purple-900">{t('pixel.art.how.step1')}</p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <p className="text-blue-900">{t('pixel.art.how.step2')}</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-4">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <p className="text-green-900">{t('pixel.art.how.step3')}</p>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-600 rounded-full mb-4">
                <span className="text-xl font-bold text-white">4</span>
              </div>
              <p className="text-orange-900">{t('pixel.art.how.step4')}</p>
            </div>
          </div>
        </div>
        
        {/* Storage Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Database className="w-6 h-6" />
                {t('pixel.art.storage.title')}
              </h3>
              <p className="text-blue-100 max-w-2xl">
                {t('pixel.art.storage.description')}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mx-auto mb-2">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium">{t('pixel.art.storage.persistent')}</p>
                <p className="text-xs text-blue-200">{t('pixel.art.storage.persistent.desc')}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mx-auto mb-2">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium">{t('pixel.art.storage.realtime')}</p>
                <p className="text-xs text-blue-200">{t('pixel.art.storage.realtime.desc')}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mx-auto mb-2">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium">{t('pixel.art.storage.secure')}</p>
                <p className="text-xs text-blue-200">{t('pixel.art.storage.secure.desc')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('pixel.art.cta.title')}</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">{t('pixel.art.cta.description')}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!userPixel && !isArtComplete && (
              <button
                onClick={createPixel}
                disabled={isCreatingPixel}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingPixel ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{t('pixel.art.contribution.creating')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{t('pixel.art.contribution.generate')}</span>
                  </>
                )}
              </button>
            )}
            
            <a
              href="/"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('pixel.art.cta.back')}</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Palette className="w-6 h-6 text-purple-400" />
                {t('pixel.art.title')}
              </h3>
              <p className="text-gray-400 mt-2">{t('pixel.art.subtitle')}</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{t('pixel.art.location')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span>{t('pixel.art.made.passion')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-blue-400" />
                <span>{t('pixel.art.innovation')}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
            <p>© 2025 MedRecap+ • {t('pixel.art.title')}</p>
          </div>
        </div>
      </footer>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{t('pixel.art.completed.modal.title')}</h3>
              <p className="text-gray-600 mt-2">{t('pixel.art.completed.modal.description')}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">{t('pixel.art.completed.modal.total.pixels')}</p>
                <p className="text-xl font-bold text-gray-900">1,500,000</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">{t('pixel.art.completed.modal.completion')}</p>
                <p className="text-xl font-bold text-green-600">100%</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">{t('pixel.art.completed.modal.thanks.title')}</h4>
              <p className="text-sm text-yellow-700">{t('pixel.art.completed.modal.thanks.message')}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span>{t('pixel.art.completed.modal.download')}</span>
              </button>
              
              <button
                onClick={handleShareClick}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                <span>{t('pixel.art.completed.modal.share')}</span>
              </button>
              
              <button
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                {t('pixel.art.completed.modal.continue')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};