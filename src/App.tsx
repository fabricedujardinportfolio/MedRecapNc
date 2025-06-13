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
        <PublicProjectPage />
      </LanguageProvider>
    );
  }

  if (showPixelArtPage) {
    return (
      <LanguageProvider>
        <CollaborativePixelArt />
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
        {!isAuthenticated || !user ? (
          <LoginForm onLogin={login} isLoading={isLoading} />
        ) : (
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header user={user} onLogout={logout} />
            <main className="flex-1">
              {/* Affichage conditionnel selon le type d'utilisateur */}
              {user.type === 'cabinet' ? (
                <CabinetDashboard />
              ) : (
                <Dashboard />
              )}
            </main>
            <Footer />
          </div>
        )}
      </NotificationProvider>
    </LanguageProvider>
  );
}

export default App;