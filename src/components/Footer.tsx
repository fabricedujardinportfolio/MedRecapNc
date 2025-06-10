import React from 'react';
import { Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">MedRecap+</h3>
                <p className="text-sm text-gray-400">v3.0</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Système professionnel de gestion des dossiers patients pour la Nouvelle-Calédonie.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Built with ❤️ using <strong className="text-white">Bolt.new</strong></span>
            </div>
          </div>

          {/* Certifications */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">Certifications</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">HDS</p>
                  <p className="text-xs text-gray-400">Hébergeur Données de Santé</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">ISO 27001/27017</p>
                  <p className="text-xs text-gray-400">Sécurité de l'information</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">RGPD</p>
                  <p className="text-xs text-gray-400">Protection des données</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact and Legal */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">Informations légales</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>© 2025 MedRecap+ NC</p>
              <p>Nouvelle-Calédonie</p>
              <p className="text-xs text-gray-400 mt-4">
                Ce système respecte les normes médicales internationales et la réglementation locale 
                en matière de protection des données de santé.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400">
            <p>Dernière mise à jour du système: 15 janvier 2025</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Système opérationnel</span>
            </div>
            <div className="text-xs text-gray-400">
              Latence: {'<150ms'}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};