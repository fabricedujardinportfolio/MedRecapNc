import React, { useState } from 'react';
import { Shield, LogOut, User, Bell } from 'lucide-react';
import { AdminUser } from '../types/Patient';
import { useNotifications } from '../hooks/useNotifications';
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

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('header.title')}</h1>
                <p className="text-xs text-gray-500">{t('header.subtitle')}</p>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button 
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors group"
              >
                <Bell className="w-5 h-5" />
                {stats.unread > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {stats.unread > 99 ? '99+' : stats.unread}
                    </span>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping"></span>
                  </>
                )}
                {stats.critical > 0 && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
                )}
                
                {/* Tooltip */}
                <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {stats.unread > 0 ? (
                    <>
                      {stats.unread} {stats.unread === 1 ? t('header.notifications.tooltip.unread') : t('header.notifications.tooltip.unread.plural')}
                      {stats.critical > 0 && (
                        <span className="block text-red-300">
                          {stats.critical} {stats.critical === 1 ? t('header.notifications.tooltip.critical') : t('header.notifications.tooltip.critical.plural')}
                        </span>
                      )}
                    </>
                  ) : (
                    t('header.notifications.tooltip.none')
                  )}
                </div>
              </button>

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