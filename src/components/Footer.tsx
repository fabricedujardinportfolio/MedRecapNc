import React, { useState } from 'react';
import { Shield, Heart, Gift } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [showSecretEasterEgg, setShowSecretEasterEgg] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Easter egg caché : triple-clic sur le logo
  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
    
    if (clickCount === 2) { // Au 3ème clic
      setShowSecretEasterEgg(true);
      setClickCount(0);
      setTimeout(() => setShowSecretEasterEgg(false), 15000); // 15 secondes
    } else {
      // Reset après 2 secondes si pas de triple-clic
      setTimeout(() => setClickCount(0), 2000);
    }
  };

  return (
    <>
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handleLogoClick}
                  className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  title="🤫 Triple-cliquez pour une surprise..."
                >
                  <Shield className="w-6 h-6 text-white" />
                </button>
                <div>
                  <h3 className="text-xl font-bold">{t('header.title')}</h3>
                  <p className="text-sm text-gray-400">v3.0</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                {t('footer.description')}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Heart className="w-4 h-4 text-red-500" />
                <span>{t('footer.built')} <strong className="text-white">Bolt.new</strong></span>
              </div>
            </div>

            {/* Certifications */}
            <div className="col-span-1">
              <h4 className="text-lg font-semibold mb-4">{t('footer.certifications')}</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">HDS</p>
                    <p className="text-xs text-gray-400">{t('footer.hds')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">ISO 27001/27017</p>
                    <p className="text-xs text-gray-400">{t('footer.ISO')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">RGPD</p>
                    <p className="text-xs text-gray-400">{t('footer.GDPR')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact and Legal */}
            <div className="col-span-1">
              <h4 className="text-lg font-semibold mb-4">{t('footer.legal')}</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>{t('footer.copyright')}</p>
                <p>{t('footer.location')}</p>
                <p className="text-xs text-gray-400 mt-4">
                  {t('footer.compliance')}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              <p>{t('footer.updated')}</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-400">{t('footer.status')}</span>
              </div>
              <div className="text-xs text-gray-400">
                {t('footer.latency')}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Easter Egg Secret Modal avec scroll */}
      {showSecretEasterEgg && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl max-w-lg w-full text-center text-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header fixe */}
            <div className="p-6 pb-4">
              <div className="text-6xl mb-4">🎊</div>
              <h3 className="text-2xl font-bold mb-2">
                BRAVO ! 🏆
              </h3>
            </div>

            {/* Contenu avec scroll */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                <p className="text-lg font-semibold mb-3">
                  🕵️ Vous avez découvert l'easter egg secret !
                </p>
                <p className="text-sm opacity-90 mb-4">
                  Triple-cliquer sur le logo du footer... Qui aurait pensé à ça ? 🤯
                </p>
                <div className="bg-yellow-300/20 rounded-lg p-4 border border-yellow-300/30 mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-yellow-300" />
                    <span className="font-bold text-yellow-300">RÉCOMPENSE SPÉCIALE</span>
                  </div>
                  <p className="text-xs text-yellow-100 leading-relaxed">
                    🎁 Vous êtes officiellement un "Détective d'Easter Eggs" certifié !<br/>
                    🔍 Votre curiosité et votre persévérance sont remarquables.<br/>
                    ⭐ Vous faites partie des 0.1% d'utilisateurs à avoir trouvé ceci !
                  </p>
                </div>

                {/* 🎨 NOUVELLE SECTION : Allusion mystérieuse à l'art collaboratif */}
                <div className="bg-gradient-to-r from-blue-400/30 to-teal-400/30 rounded-lg p-4 border border-blue-300/30">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-blue-200" />
                    <span className="font-bold text-blue-200 text-sm">BONUS MYSTÉRIEUX</span>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    🎨 Votre talent de détective vous ouvre les portes d'une expérience artistique collaborative secrète... 
                    Explorez les recoins cachés du système pour découvrir comment contribuer à une œuvre collective unique ! 
                    Cherchez les indices dans l'interface... 🔍✨
                  </p>
                </div>
              </div>

              <div className="text-xs opacity-75 mb-4">
                🤫 Psst... Il y a peut-être d'autres secrets cachés dans l'application...
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowSecretEasterEgg(false)}
                  className="px-8 py-3 bg-white hover:bg-gray-100 text-purple-600 rounded-lg font-bold transition-colors shadow-lg"
                >
                  Garder le secret 🤐
                </button>
                <a
                  href="/collaborative-pixel-art"
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-lg font-bold transition-colors shadow-lg"
                >
                  🎨 Découvrir l'Art Collaboratif
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};