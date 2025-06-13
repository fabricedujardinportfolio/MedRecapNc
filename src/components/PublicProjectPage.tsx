import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Heart, 
  Stethoscope, 
  Users, 
  Shield, 
  Globe, 
  Code, 
  Zap, 
  Target,
  ChevronRight,
  ExternalLink,
  Github,
  Mail,
  MapPin,
  Calendar,
  Award,
  Lightbulb,
  Rocket,
  Database,
  Video,
  Lock,
  TestTube,
  DollarSign,
  Eye,
  Gift
} from 'lucide-react';

export const PublicProjectPage: React.FC = () => {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [secretSequence, setSecretSequence] = useState<string[]>([]);
  const [sequenceTimeout, setSequenceTimeout] = useState<NodeJS.Timeout | null>(null);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fr' ? 'en' : 'fr');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  // Easter egg caché : séquence de clics sur des éléments spécifiques
  const handleSecretClick = (element: string) => {
    console.log('🔍 Clic sur élément:', element, 'Séquence actuelle:', secretSequence);
    
    // Nettoyer le timeout précédent
    if (sequenceTimeout) {
      clearTimeout(sequenceTimeout);
    }

    const newSequence = [...secretSequence, element];
    setSecretSequence(newSequence);
    
    console.log('📝 Nouvelle séquence:', newSequence);
    
    // Séquence secrète : cliquer sur logo, puis "Nouvelle-Calédonie", puis "280 000 habitants"
    const correctSequence = ['logo', 'nc', 'population'];
    
    // Vérifier si la séquence est correcte jusqu'à présent
    const isSequenceValid = newSequence.every((item, index) => item === correctSequence[index]);
    
    if (!isSequenceValid) {
      console.log('❌ Séquence incorrecte, reset');
      setSecretSequence([]);
      return;
    }
    
    if (newSequence.length === correctSequence.length) {
      console.log('🎉 Séquence complète et correcte !');
      setShowEasterEgg(true);
      setSecretSequence([]);
      setTimeout(() => setShowEasterEgg(false), 20000); // 20 secondes
      return;
    }
    
    // Programmer un reset automatique après 15 secondes
    const timeout = setTimeout(() => {
      console.log('⏰ Timeout - Reset de la séquence');
      setSecretSequence([]);
    }, 15000);
    
    setSequenceTimeout(timeout);
  };

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
      }
    };
  }, [sequenceTimeout]);

  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSecretClick('logo')}
                className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                title="🤫"
              >
                <Stethoscope className="w-6 h-6 text-white" />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">MedRecap+ AI</h1>
                <p className="text-xs text-gray-500">
                  {t('Assistant Médical IA', 'Medical AI Assistant')}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('context')}
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{t('Contexte', 'Context')}</span>
              </button>
              <button
                onClick={() => scrollToSection('prototype')}
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Code className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{t('Prototype', 'Prototype')}</span>
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{t('Fonctionnalités', 'Features')}</span>
              </button>
              <button
                onClick={() => scrollToSection('learning')}
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Award className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{t('Apprentissage', 'Learning')}</span>
              </button>
              <button
                onClick={() => scrollToSection('next-steps')}
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Rocket className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{t('Prochaines étapes', 'Next Steps')}</span>
              </button>
            </nav>

            {/* Language Toggle & Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {language === 'fr' ? 'Français' : 'English'}
                </span>
                <span className="sm:hidden">
                  {language === 'fr' ? '🇫🇷' : '🇬🇧'}
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 bg-white">
              <nav className="space-y-2">
                <button
                  onClick={() => scrollToSection('context')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Lightbulb className="w-4 h-4 flex-shrink-0" />
                  {t('Contexte', 'Context')}
                </button>
                <button
                  onClick={() => scrollToSection('prototype')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Code className="w-4 h-4 flex-shrink-0" />
                  {t('Prototype', 'Prototype')}
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Zap className="w-4 h-4 flex-shrink-0" />
                  {t('Fonctionnalités', 'Features')}
                </button>
                <button
                  onClick={() => scrollToSection('learning')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Award className="w-4 h-4 flex-shrink-0" />
                  {t('Apprentissage', 'Learning')}
                </button>
                <button
                  onClick={() => scrollToSection('next-steps')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Rocket className="w-4 h-4 flex-shrink-0" />
                  {t('Prochaines étapes', 'Next Steps')}
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl shadow-lg">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              🏥 {t('Assistant IA Médical', 'Medical AI Assistant')}
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-600 mb-8">
              {t('pour Fiches Patients', 'for Patient Records')}
            </h2>
            
            <div className="bg-blue-50 rounded-xl p-6 mb-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  {t('À propos des traductions', 'About the Translations')}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-lg">🇫🇷</span>
                  <span className="text-gray-700">
                    {t(
                      'Chaque section est présentée en français puis en anglais pour faciliter la compréhension.',
                      'Each section is provided in French and English for easier understanding.'
                    )}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">🇬🇧</span>
                  <span className="text-gray-700">
                    {t(
                      'Each section is provided in French and English for easier understanding.',
                      'Chaque section est présentée en français puis en anglais pour faciliter la compréhension.'
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#context"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('context');
                }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg"
              >
                <Eye className="w-5 h-5" />
                {t('Découvrir le projet', 'Discover the project')}
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold transition-colors shadow-lg border border-gray-200"
              >
                <ExternalLink className="w-5 h-5" />
                {t('Voir la démo', 'View demo')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Context Section */}
      <section id="context" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6 text-blue-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                💡 {t('Contexte & Inspiration', 'Context & Inspiration')}
              </h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* French Version */}
              <div className="bg-blue-50 rounded-xl p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🇫🇷</span>
                  <h3 className="text-xl font-semibold text-blue-900">Français</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Face à la pénurie croissante de médecins en Nouvelle-Calédonie, notamment dans les zones rurales ou isolées, 
                  ce projet vise à proposer une solution technologique innovante pour soulager les professionnels de santé 
                  et améliorer le suivi des patients.
                </p>
                <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    💡 L'idée : développer un assistant IA vidéo médical qui peut présenter vocalement les fiches patients 
                    de manière synthétique et claire.
                  </p>
                </div>
              </div>

              {/* English Version */}
              <div className="bg-teal-50 rounded-xl p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🇬🇧</span>
                  <h3 className="text-xl font-semibold text-teal-900">English</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  In response to the growing shortage of doctors in New Caledonia, especially in rural or remote areas, 
                  this project aims to provide an innovative technological solution to support healthcare professionals 
                  and improve patient follow-up.
                </p>
                <div className="mt-4 p-4 bg-teal-100 rounded-lg">
                  <p className="text-teal-800 font-medium">
                    💡 The idea: develop a medical video AI assistant capable of vocally presenting patient records 
                    in a clear and concise manner.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl p-8 text-white">
                <button
                  onClick={() => handleSecretClick('nc')}
                  className="flex items-center gap-2 mb-4 hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer w-full text-left"
                  title="🤫"
                >
                  <MapPin className="w-12 h-12 opacity-80" />
                  <h3 className="text-xl font-semibold">Nouvelle-Calédonie</h3>
                </button>
                <div className="space-y-3 text-blue-100">
                  <button
                    onClick={() => handleSecretClick('population')}
                    className="flex items-center gap-2 hover:bg-white/10 rounded-lg p-2 transition-colors w-full text-left cursor-pointer"
                    title="🤫"
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm">280 000 habitants</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-sm">{t('Pénurie médicale', 'Medical shortage')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">{t('Zones isolées', 'Remote areas')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-xl p-6 text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-2">15%</div>
                  <div className="text-sm text-orange-800">{t('Médecins manquants', 'Missing doctors')}</div>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">24/7</div>
                  <div className="text-sm text-green-800">{t('Assistant IA', 'AI Assistant')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prototype Section */}
      <section id="prototype" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Code className="w-6 h-6 text-blue-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                🛠️ {t('Construction du prototype', 'Building the Prototype')}
              </h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* French Version */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🇫🇷</span>
                <h3 className="text-xl font-semibold text-gray-900">Français</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Code className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">React (actuellement), migration vers Vue 3 + TypeScript</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-5 h-5 bg-purple-600 rounded"></div>
                  <span className="text-gray-700">Tailwind CSS pour l'UI</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Video className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Tavus pour l'avatar IA vidéo</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <span className="text-gray-700">Persona IA : Dr. Léa Martin, empathique et rigoureuse</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="text-gray-700">Prototype fonctionnel avec fiches patients et agent IA</span>
                </div>
              </div>
            </div>

            {/* English Version */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🇬🇧</span>
                <h3 className="text-xl font-semibold text-gray-900">English</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Code className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">React (currently), migrating to Vue 3 + TypeScript</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-5 h-5 bg-purple-600 rounded"></div>
                  <span className="text-gray-700">Tailwind CSS for UI</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Video className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Tavus for video AI avatar</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <span className="text-gray-700">AI persona: Dr. Léa Martin, empathetic and rigorous</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="text-gray-700">Functional prototype with patient records and AI agent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                🔑 {t('Fonctionnalités clés', 'Key Features')}
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900">
                  📁 {t('Fiches patients complètes', 'Complete patient records')}
                </h3>
              </div>
              <p className="text-blue-800 text-sm">
                {t(
                  'Gestion complète des dossiers médicaux avec historique détaillé',
                  'Complete medical record management with detailed history'
                )}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-green-900">
                  🧠 {t('Résumé vocal IA', 'AI voice summary')}
                </h3>
              </div>
              <p className="text-green-800 text-sm">
                {t(
                  'Assistant IA qui présente les informations patient de manière claire',
                  'AI assistant that presents patient information clearly'
                )}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900">
                  🤖 {t('Interaction simple', 'Simple interaction')}
                </h3>
              </div>
              <p className="text-purple-800 text-sm">
                {t(
                  'Interface intuitive pour une utilisation rapide et efficace',
                  'Intuitive interface for quick and efficient use'
                )}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-600 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-orange-900">
                  🔐 {t('Authentification & rôles', 'Authentication & roles')}
                </h3>
              </div>
              <p className="text-orange-800 text-sm">
                {t(
                  'Sécurité renforcée avec gestion des accès par rôles',
                  'Enhanced security with role-based access management'
                )}
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-teal-600 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-teal-900">
                  💻 {t('Interface claire et rapide', 'Clear and fast interface')}
                </h3>
              </div>
              <p className="text-teal-800 text-sm">
                {t(
                  'Design optimisé pour un usage médical professionnel',
                  'Design optimized for professional medical use'
                )}
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-pink-600 rounded-lg">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-pink-900">
                  🌐 {t('Multilingue', 'Multilingual')}
                </h3>
              </div>
              <p className="text-pink-800 text-sm">
                {t(
                  'Support français et anglais pour la Nouvelle-Calédonie',
                  'French and English support for New Caledonia'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Section */}
      <section id="learning" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Award className="w-6 h-6 text-blue-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                🎓 {t('Ce que j\'ai appris', 'What I Learned')}
              </h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* French Version */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🇫🇷</span>
                <h3 className="text-xl font-semibold text-gray-900">Français</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg flex-shrink-0">
                    <Video className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Intégration d'un agent IA vidéo en temps réel</h4>
                    <p className="text-gray-600 text-sm">Maîtrise de l'API Tavus et gestion des flux vidéo</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg flex-shrink-0">
                    <Database className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Structuration de fiches patients dynamiques</h4>
                    <p className="text-gray-600 text-sm">Architecture de données complexes et relations</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg flex-shrink-0">
                    <Stethoscope className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Optimisation de l'interface pour un usage médical</h4>
                    <p className="text-gray-600 text-sm">UX/UI adaptée aux contraintes du secteur santé</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg flex-shrink-0">
                    <Rocket className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Structuration pour un déploiement progressif</h4>
                    <p className="text-gray-600 text-sm">Architecture scalable et modulaire</p>
                  </div>
                </div>
              </div>
            </div>

            {/* English Version */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🇬🇧</span>
                <h3 className="text-xl font-semibold text-gray-900">English</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg flex-shrink-0">
                    <Video className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Integrating a real-time video AI agent</h4>
                    <p className="text-gray-600 text-sm">Mastering Tavus API and video stream management</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg flex-shrink-0">
                    <Database className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Structuring dynamic patient records</h4>
                    <p className="text-gray-600 text-sm">Complex data architecture and relationships</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg flex-shrink-0">
                    <Stethoscope className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Optimizing the interface for medical use</h4>
                    <p className="text-gray-600 text-sm">UX/UI adapted to healthcare sector constraints</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg flex-shrink-0">
                    <Rocket className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Structuring for progressive deployment</h4>
                    <p className="text-gray-600 text-sm">Scalable and modular architecture</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps Section */}
      <section id="next-steps" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Rocket className="w-6 h-6 text-blue-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                🚧 {t('Prochaines étapes & besoins', 'Next Steps & Needs')}
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-red-900">
                  🔐 {t('Sécurité et confidentialité', 'Security & confidentiality')}
                </h3>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900">
                  🗃️ {t('Supabase pour les données sensibles', 'Supabase for sensitive data')}
                </h3>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-lg">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-green-900">
                  🎥 {t('Streaming vidéo fluide', 'Smooth video streaming')}
                </h3>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
                  <TestTube className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900">
                  🧪 {t('Tests en conditions réelles', 'Real-world testing')}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <h3 className="text-2xl font-bold text-yellow-900">
                💰 {t('Recherche de financement', 'Seeking funding')}
              </h3>
            </div>
            <p className="text-yellow-800 text-lg leading-relaxed">
              {t(
                'Ce projet nécessite un financement pour passer du prototype à une solution déployable en conditions réelles. Nous recherchons des partenaires pour soutenir l\'innovation médicale en Nouvelle-Calédonie.',
                'This project requires funding to move from prototype to a deployable real-world solution. We are seeking partners to support medical innovation in New Caledonia.'
              )}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                {t(
                  '🇫🇷 Ce projet vise à renforcer le système de santé en Nouvelle-Calédonie grâce à l\'IA, en assistant les médecins, surtout dans les zones sous-dotées.',
                  '🇬🇧 This project aims to strengthen New Caledonia\'s healthcare system with AI, assisting doctors, especially in underserved areas.'
                )}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <a
                  href="mailto:fabricedujardin873@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-blue-600 rounded-lg font-semibold transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  {t('Nous contacter', 'Contact us')}
                </a>
                <a
                  href="https://github.com/fabricedujardinportfolio/MedRecapNc"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors"
                >
                  <Github className="w-5 h-5" />
                  {t('Voir le code', 'View code')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Easter Egg Modal - Animation réduite et durée augmentée */}
      {showEasterEgg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 max-w-lg w-full text-center text-white shadow-2xl">
            <div className="text-8xl mb-6">🎊</div>
            <h3 className="text-3xl font-bold mb-4">
              INCROYABLE ! 🏆
            </h3>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
              <p className="text-lg font-semibold mb-3">
                🕵️ Félicitations ! Vous avez trouvé l'easter egg !
              </p>
              <p className="text-sm opacity-90 mb-4">
                🎁 Merci d'avoir exploré cette page avec attention ! Votre curiosité est appréciée.
              </p>
              <div className="bg-yellow-300/20 rounded-lg p-4 border border-yellow-300/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold text-yellow-300">RÉCOMPENSE EXCLUSIVE</span>
                </div>
                <p className="text-xs text-yellow-100 leading-relaxed">
                  🎁 Vous êtes officiellement un "Maître Détective d'Easter Eggs" !<br/>
                  🔍 Votre persévérance et votre logique sont exceptionnelles.<br/>
                  ⭐ Vous faites partie des 0.01% d'utilisateurs à avoir trouvé ceci !
                </p>
              </div>
            </div>
            <div className="text-xs opacity-75 mb-4">
              💡 {t('Un autre easter egg est caché quelque part sur le site principal. Saurez-vous le retrouver ?', 'Another easter egg is hidden somewhere on the main site. Can you find it?')}
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowEasterEgg(false)}
                className="px-8 py-3 bg-white hover:bg-gray-100 text-purple-600 rounded-lg font-bold transition-colors shadow-lg"
              >
                {t('Mission accomplie ! 🎯', 'Mission accomplished! 🎯')}
              </button>
              <a
                href="/collaborative-pixel-art"
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-lg font-bold transition-colors shadow-lg"
              >
                🎨 {t('Découvrir l\'Art Collaboratif', 'Discover Collaborative Art')}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">MedRecap+ AI</h3>
                  <p className="text-sm text-gray-400">v1.0.0</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                {t(
                  'Assistant IA médical pour la Nouvelle-Calédonie',
                  'Medical AI assistant for New Caledonia'
                )}
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{t('Liens', 'Links')}</h4>
              <div className="space-y-2">
                <a href="/" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  {t('Démo en ligne', 'Online demo')}
                </a>
                <a href="https://github.com/fabricedujardinportfolio/MedRecapNc" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  {t('Code source', 'Source code')}
                </a>
                <a href="mailto:contact@medrecap.nc" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  {t('Contact', 'Contact')}
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{t('Technologie', 'Technology')}</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span>React + TypeScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>Tavus AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Sécurisé HDS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 MedRecap+ AI - {t('Nouvelle-Calédonie', 'New Caledonia')} • 
              {t(' Développé avec', ' Built with')} ❤️ {t('par', 'by')} <strong>Bolt.new</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};