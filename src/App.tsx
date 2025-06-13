import React from 'react';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CabinetDashboard } from './components/CabinetDashboard';
import { PublicProjectPage } from './components/PublicProjectPage';
import { CollaborativePixelArt } from './components/CollaborativePixelArt';
import { Footer } from './components/Footer';
import { LanguageProvider } from './components/LanguageProvider';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, login, logout, isLoading, isAuthenticated } = useAuth();

  // Check if we should show the public page
  const showPublicPage = window.location.pathname === '/public' || window.location.hash === '#public';
  
  // Check if we should show the collaborative pixel art page
  const showPixelArtPage = window.location.pathname === '/collaborative-pixel-art' || window.location.hash === '#collaborative-pixel-art';

  if (showPublicPage) {
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <PublicProjectPage />
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  if (showPixelArtPage) {
    return (
      <LanguageProvider>
        <ErrorBoundary 
          onError={(error, errorInfo) => {
            console.error('🎨 Erreur dans CollaborativePixelArt:', error);
            console.error('📊 Context:', errorInfo);
            // Ici on pourrait envoyer l'erreur à un service de monitoring
          }}
        >
          <CollaborativePixelArt />
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  if (isLoading) {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du système MedRecap+...</p>
          </div>
        </div>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <NotificationProvider>
        <ErrorBoundary>
          {!isAuthenticated || !user ? (
            <LoginForm onLogin={login} isLoading={isLoading} />
          ) : (
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Header user={user} onLogout={logout} />
              <main className="flex-1">
                <ErrorBoundary fallback={
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">
                        Erreur dans le tableau de bord
                      </h3>
                      <p className="text-red-600">
                        Une erreur est survenue lors du chargement du tableau de bord. 
                        Veuillez rafraîchir la page ou contacter le support technique.
                      </p>
                    </div>
                  </div>
                }>
                  {/* Affichage conditionnel selon le type d'utilisateur */}
                  {user.type === 'cabinet' ? (
                    <CabinetDashboard />
                  ) : (
                    <Dashboard />
                  )}
                </ErrorBoundary>
              </main>
              <Footer />
            </div>
          )}
        </ErrorBoundary>
      </NotificationProvider>
    </LanguageProvider>
  );
}

export default App;