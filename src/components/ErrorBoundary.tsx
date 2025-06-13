import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Met à jour l'état pour afficher l'UI de fallback au prochain rendu
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log l'erreur pour le débogage
    console.error('🚨 Erreur capturée par ErrorBoundary:', error);
    console.error('📍 Informations sur l\'erreur:', errorInfo);
    
    // Stocker les détails de l'erreur dans l'état
    this.setState({
      error,
      errorInfo
    });

    // Appeler le callback d'erreur personnalisé si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Optionnel : envoyer l'erreur à un service de monitoring
    // Exemple avec Sentry : Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    // Réinitialiser l'état pour permettre un nouveau rendu
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    // Rediriger vers la page d'accueil
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Si un fallback personnalisé est fourni, l'utiliser
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Sinon, afficher l'UI d'erreur par défaut
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center">
              {/* Icône d'erreur */}
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              {/* Titre et message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Oups ! Une erreur est survenue
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Le composant d'art collaboratif a rencontré un problème technique. 
                Cela peut être dû à un problème de connexion à la base de données ou à une configuration manquante.
              </p>

              {/* Détails de l'erreur (en mode développement) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">Détails techniques :</h3>
                  <code className="text-xs text-red-700 break-all">
                    {this.state.error.message}
                  </code>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 cursor-pointer">Stack trace</summary>
                      <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Retour à l'accueil
                </button>
              </div>

              {/* Message d'aide */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Conseil :</strong> Vérifiez que les variables d'environnement Supabase sont correctement configurées dans le fichier .env
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook pour utiliser l'Error Boundary avec des composants fonctionnels
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};