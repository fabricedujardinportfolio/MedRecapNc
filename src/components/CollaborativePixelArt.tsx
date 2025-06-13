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
  MapPin
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface PixelData {
  x: number;
  y: number;
  color: string;
  sessionId: string;
  timestamp: string;
  contributor?: string;
}

interface ProgressStats {
  totalPixels: number;
  completedPixels: number;
  percentage: number;
  sessionsToday: number;
  estimatedCompletion: string;
}

export const CollaborativePixelArt: React.FC = () => {
  const { t, language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalPixels: 1500000, // 1200 x 1250
    completedPixels: 47832,
    percentage: 3.19,
    sessionsToday: 156,
    estimatedCompletion: '2027-08-15'
  });
  const [currentUserPixel, setCurrentUserPixel] = useState<PixelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [showContributors, setShowContributors] = useState(false);

  // Couleurs prédéfinies pour l'art collaboratif
  const predefinedColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  // Simuler la génération de pixels existants
  useEffect(() => {
    const generateMockPixels = () => {
      const mockPixels: PixelData[] = [];
      const imageWidth = 1200;
      const imageHeight = 1250;
      
      // Générer des pixels aléatoirement pour simuler la progression
      for (let i = 0; i < stats.completedPixels; i++) {
        mockPixels.push({
          x: Math.floor(Math.random() * imageWidth),
          y: Math.floor(Math.random() * imageHeight),
          color: predefinedColors[Math.floor(Math.random() * predefinedColors.length)],
          sessionId: `session_${i}`,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          contributor: `Contributeur ${i + 1}`
        });
      }
      
      setPixels(mockPixels);
      setIsLoading(false);
    };

    generateMockPixels();
  }, [stats.completedPixels]);

  // Dessiner l'image sur le canvas
  useEffect(() => {
    if (!canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    // Dessiner le pixel de l'utilisateur actuel s'il existe
    if (currentUserPixel) {
      ctx.fillStyle = currentUserPixel.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      const x = Math.floor(currentUserPixel.x * scaleX);
      const y = Math.floor(currentUserPixel.y * scaleY);
      ctx.fillRect(x, y, Math.ceil(scaleX), Math.ceil(scaleY));
      ctx.strokeRect(x, y, Math.ceil(scaleX), Math.ceil(scaleY));
    }
  }, [pixels, currentUserPixel, isLoading]);

  // Générer un pixel pour l'utilisateur actuel
  const generateUserPixel = () => {
    const newPixel: PixelData = {
      x: Math.floor(Math.random() * 1200),
      y: Math.floor(Math.random() * 1250),
      color: selectedColor,
      sessionId: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      contributor: 'Vous'
    };

    setCurrentUserPixel(newPixel);
    setPixels(prev => [...prev, newPixel]);
    setStats(prev => ({
      ...prev,
      completedPixels: prev.completedPixels + 1,
      percentage: ((prev.completedPixels + 1) / prev.totalPixels) * 100
    }));
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const shareProject = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Art Collaboratif MedRecap+ - 1,5 Million de Pixels',
        text: 'Participez à la création d\'une œuvre d\'art collaborative ! Chaque session génère un pixel unique.',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  const downloadProgress = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `medrecap-collaborative-art-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

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
              <span>{language === 'fr' ? 'Retour' : 'Back'}</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {language === 'fr' ? 'Art Collaboratif' : 'Collaborative Art'}
                </h1>
                <p className="text-sm text-gray-600">
                  {language === 'fr' ? '1,5 Million de Pixels' : '1.5 Million Pixels'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={shareProject}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={language === 'fr' ? 'Partager' : 'Share'}
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={downloadProgress}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={language === 'fr' ? 'Télécharger' : 'Download'}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <ImageIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎨 {language === 'fr' ? 'Œuvre Collaborative' : 'Collaborative Artwork'}
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            {language === 'fr' 
              ? 'Chaque session sur MedRecap+ génère un pixel unique. Ensemble, créons une œuvre d\'art de 1,5 million de pixels !'
              : 'Each session on MedRecap+ generates a unique pixel. Together, let\'s create a 1.5 million pixel artwork!'
            }
          </p>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{stats.completedPixels.toLocaleString()}</div>
              <div className="text-sm text-gray-600">
                {language === 'fr' ? 'Pixels générés' : 'Pixels generated'}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{stats.percentage.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">
                {language === 'fr' ? 'Progression' : 'Progress'}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.sessionsToday}</div>
              <div className="text-sm text-gray-600">
                {language === 'fr' ? 'Sessions aujourd\'hui' : 'Sessions today'}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">
                {(stats.totalPixels - stats.completedPixels).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'fr' ? 'Pixels restants' : 'Pixels remaining'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {language === 'fr' 
                ? `Estimation de fin : ${new Date(stats.estimatedCompletion).toLocaleDateString('fr-FR')}`
                : `Estimated completion: ${new Date(stats.estimatedCompletion).toLocaleDateString('en-US')}`
              }
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Canvas Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {language === 'fr' ? 'Progression en Temps Réel' : 'Real-time Progress'}
                </h2>
                <button
                  onClick={() => window.location.reload()}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title={language === 'fr' ? 'Actualiser' : 'Refresh'}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              
              <div className="relative">
                {isLoading ? (
                  <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">
                        {language === 'fr' ? 'Chargement de l\'œuvre...' : 'Loading artwork...'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto border border-gray-300 rounded-lg shadow-sm"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {language === 'fr' 
                    ? 'Image finale : 1200 × 1250 pixels (1,5 million de pixels)'
                    : 'Final image: 1200 × 1250 pixels (1.5 million pixels)'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Interaction Section */}
          <div className="space-y-6">
            {/* Votre Contribution */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {language === 'fr' ? 'Votre Contribution' : 'Your Contribution'}
              </h2>
              
              {currentUserPixel ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-300 rounded-lg flex items-center justify-center">
                    <div 
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: currentUserPixel.color }}
                    ></div>
                  </div>
                  <p className="text-green-600 font-medium mb-2">
                    {language === 'fr' ? '✅ Pixel généré avec succès !' : '✅ Pixel generated successfully!'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'fr' 
                      ? `Position: (${currentUserPixel.x}, ${currentUserPixel.y})`
                      : `Position: (${currentUserPixel.x}, ${currentUserPixel.y})`
                    }
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <p className="text-gray-600 mb-4">
                      {language === 'fr' 
                        ? 'Choisissez une couleur et générez votre pixel unique !'
                        : 'Choose a color and generate your unique pixel!'
                      }
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
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                  >
                    {language === 'fr' ? '🎨 Générer Mon Pixel' : '🎨 Generate My Pixel'}
                  </button>
                </div>
              )}
            </div>

            {/* Comment ça marche */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'fr' ? 'Comment ça marche ?' : 'How does it work?'}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">1</div>
                  <p className="text-sm text-gray-700">
                    {language === 'fr' 
                      ? 'Chaque session sur MedRecap+ génère automatiquement un pixel unique'
                      : 'Each session on MedRecap+ automatically generates a unique pixel'
                    }
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-xs font-bold">2</div>
                  <p className="text-sm text-gray-700">
                    {language === 'fr' 
                      ? 'Votre pixel est placé aléatoirement sur l\'image de 1200×1250'
                      : 'Your pixel is randomly placed on the 1200×1250 image'
                    }
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full text-xs font-bold">3</div>
                  <p className="text-sm text-gray-700">
                    {language === 'fr' 
                      ? 'L\'image se complète progressivement avec chaque nouvelle session'
                      : 'The image gradually completes with each new session'
                    }
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-orange-600 text-white rounded-full text-xs font-bold">4</div>
                  <p className="text-sm text-gray-700">
                    {language === 'fr' 
                      ? 'Objectif : 1,5 million de sessions pour révéler l\'œuvre complète'
                      : 'Goal: 1.5 million sessions to reveal the complete artwork'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Statistiques Avancées */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'fr' ? 'Statistiques Avancées' : 'Advanced Statistics'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {Math.floor(stats.completedPixels / stats.sessionsToday)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {language === 'fr' ? 'Pixels/jour' : 'Pixels/day'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {Math.floor((stats.totalPixels - stats.completedPixels) / (stats.completedPixels / 30))}
                  </div>
                  <div className="text-xs text-gray-600">
                    {language === 'fr' ? 'Jours restants' : 'Days remaining'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {Math.floor(stats.completedPixels / 30)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {language === 'fr' ? 'Pixels/mois' : 'Pixels/month'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {(stats.percentage * 10).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {language === 'fr' ? 'Score art' : 'Art score'}
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-2">
                {language === 'fr' ? 'Participez à l\'Histoire !' : 'Be Part of History!'}
              </h3>
              <p className="text-purple-100 mb-4">
                {language === 'fr' 
                  ? 'Chaque session compte. Votre pixel fait partie d\'une œuvre collective unique.'
                  : 'Every session counts. Your pixel is part of a unique collective artwork.'
                }
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Zap className="w-5 h-5" />
                {language === 'fr' ? 'Retour à MedRecap+' : 'Back to MedRecap+'}
              </a>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'fr' ? 'Une Expérience Unique' : 'A Unique Experience'}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {language === 'fr' 
                ? 'Ce projet artistique collaboratif transforme chaque visite sur MedRecap+ en une contribution créative. Ensemble, nous créons quelque chose de plus grand que la somme de ses parties - une œuvre d\'art numérique collective qui représente notre communauté médicale unie.'
                : 'This collaborative art project transforms every visit to MedRecap+ into a creative contribution. Together, we create something greater than the sum of its parts - a collective digital artwork representing our united medical community.'
              }
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{language === 'fr' ? 'Nouvelle-Calédonie' : 'New Caledonia'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>{language === 'fr' ? 'Fait avec passion' : 'Made with passion'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>{language === 'fr' ? 'Innovation 2025' : 'Innovation 2025'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};