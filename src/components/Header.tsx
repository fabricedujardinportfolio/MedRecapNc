import React, { useState, useEffect } from 'react';
import { Shield, LogOut, User, Bell } from 'lucide-react';
import { AdminUser } from '../types/Patient';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../hooks/useLanguage';
import { NotificationPanel } from './NotificationPanel';

interface HeaderProps {
  user: AdminUser;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { stats } = useNotifications();
  const { t } = useLanguage();

  // Debug: Log stats changes in Header
  useEffect(() => {
    console.log('🎯 [Header] Stats reçues:', stats);
    console.log('🔢 [Header] Badge devrait afficher:', stats.unread);
  }, [stats]);

  // Fonction pour générer le contenu du tooltip
  const getTooltipContent = () => {
    if (stats.unread === 0) {
      return t('header.notifications.tooltip.none');
    }
    
    const unreadText = stats.unread === 1 
      ? t('header.notifications.tooltip.unread') 
      : t('header.notifications.tooltip.unread.plural');
    
    let content = `${stats.unread} ${unreadText}`;
    
    if (stats.critical > 0) {
      const criticalText = stats.critical === 1 
        ? t('header.notifications.tooltip.critical') 
        : t('header.notifications.tooltip.critical.plural');
      content += ` • ${stats.critical} ${criticalText}`;
    }
    
    return content;
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center sm:justify-between items-center min-h-fit sm:h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('header.title')}</h1>
                <p className="text-xs text-gray-500">{t('header.subtitle')}</p>
                
          {/* Logo Bolt */}
          <div className="mt-4 flex justify-center">
            <a href="https://bolt.new" target="_blank" rel="noopener noreferrer" title="Powered by Bolt">
              <img src="/bolt.png" alt="Bolt Logo" className="h-10" />
            </a>
          </div>  
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications Button - Complètement refait avec Context */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                  aria-label={`Notifications: ${getTooltipContent()}`}
                >
                  {/* Icône Bell */}
                  <Bell className="w-5 h-5" />
                  
                  {/* Badge de notification - Réactif au Context */}
                  {stats.unread > 0 && (
                    <>
                      {/* Badge principal avec le nombre - Force re-render avec key */}
                      <span 
                        key={`notification-badge-${stats.unread}-${stats.total}`}
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium z-10 px-1"
                      >
                        {stats.unread > 99 ? '99+' : stats.unread}
                      </span>
                      
                      {/* Animation ping pour attirer l'attention */}
                      <span 
                        key={`notification-ping-${stats.unread}`}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping"
                      ></span>
                    </>
                  )}
                  
                  {/* Indicateur critique - Séparé du badge principal */}
                  {stats.critical > 0 && (
                    <span 
                      key={`critical-indicator-${stats.critical}`}
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"
                      title={`${stats.critical} notification(s) critique(s)`}
                    ></span>
                  )}
                  
                  {/* Tooltip amélioré */}
                  <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    <div className="text-center">
                      {stats.unread === 0 ? (
                        <span>{t('header.notifications.tooltip.none')}</span>
                      ) : (
                        <>
                          <div className="font-medium">
                            {stats.unread} {stats.unread === 1 ? t('header.notifications.tooltip.unread') : t('header.notifications.tooltip.unread.plural')}
                          </div>
                          {stats.critical > 0 && (
                            <div className="text-red-300 text-xs mt-1">
                              {stats.critical} {stats.critical === 1 ? t('header.notifications.tooltip.critical') : t('header.notifications.tooltip.critical.plural')}
                            </div>
                          )}
                          {stats.actionRequired > 0 && (
                            <div className="text-orange-300 text-xs mt-1">
                              {stats.actionRequired} action(s) requise(s)
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Flèche du tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                  </div>
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.username}</p>
                  <p className="text-gray-500">{user.role.nom}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('header.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};