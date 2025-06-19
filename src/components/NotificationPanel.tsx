import React, { useState } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  Zap,
  Clock,
  User,
  Settings,
  Shield,
  FileText,
  Calendar,
  Search,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { Notification as AppNotification, NotificationFilters } from '../types/Notification';
import { useNotifications } from '../contexts/NotificationContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useLanguage } from '../hooks/useLanguage';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    stats,
    filters,
    setFilters,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  if (!isOpen) return null;

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'urgent': return <Zap className="w-5 h-5 text-red-600" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'medical': return <User className="w-4 h-4" />;
      case 'administrative': return <FileText className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: AppNotification['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notifTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return format(notifTime, 'dd/MM/yyyy à HH:mm', { locale: fr });
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">
                {stats.unread} non lues sur {stats.total}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Critiques</span>
              </div>
              <p className="text-xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Actions</span>
              </div>
              <p className="text-xl font-bold text-orange-600">{stats.actionRequired}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Tout lire
              </button>
            )}
          </div>
          <button
            onClick={clearAllNotifications}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Effacer
            {t('notifications.clear')}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                <option value="urgent">Urgent</option>
                <option value="alert">Alerte</option>
                <option value="warning">Attention</option>
                <option value="success">Succès</option>
                <option value="info">Information</option>
              </select>
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes priorités</option>
                <option value="critical">Critique</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes catégories</option>
                <option value="medical">Médical</option>
                <option value="administrative">Administratif</option>
                <option value="system">Système</option>
                <option value="security">Sécurité</option>
              </select>
              <select
                value={filters.isRead === undefined ? '' : filters.isRead.toString()}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  isRead: e.target.value === '' ? undefined : e.target.value === 'true' 
                })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes</option>
                <option value="false">Non lues</option>
                <option value="true">Lues</option>
              </select>
            </div>
            <button
              onClick={() => setFilters({})}
              className="w-full px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Bell className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucune notification</p>
              <p className="text-sm">Vous êtes à jour !</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    notification.isRead 
                      ? 'bg-white border-gray-200' 
                      : 'bg-blue-50 border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${
                          notification.isRead ? 'text-gray-900' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-xs mt-1 ${
                        notification.isRead ? 'text-gray-600' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority === 'critical' ? 'Critique' :
                             notification.priority === 'high' ? 'Haute' :
                             notification.priority === 'medium' ? 'Moyenne' : 'Basse'}
                          </span>
                          <div className="flex items-center gap-1 text-gray-500">
                            {getCategoryIcon(notification.category)}
                            <span className="text-xs">
                              {notification.category === 'medical' ? 'Médical' :
                               notification.category === 'administrative' ? 'Admin' :
                               notification.category === 'system' ? 'Système' : 'Sécurité'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                      {notification.patientName && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                          <User className="w-3 h-3" />
                          <span>{notification.patientName}</span>
                          {notification.service && (
                            <span className="text-gray-500">• {notification.service}</span>
                          )}
                        </div>
                      )}
                      {notification.actionRequired && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          <Clock className="w-3 h-3" />
                          <span>Action requise</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {getNotificationIcon(selectedNotification.type)}
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails de la notification
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {selectedNotification.title}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Priorité:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedNotification.priority)}`}>
                    {selectedNotification.priority === 'critical' ? 'Critique' :
                     selectedNotification.priority === 'high' ? 'Haute' :
                     selectedNotification.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Catégorie:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedNotification.category === 'medical' ? 'Médical' :
                     selectedNotification.category === 'administrative' ? 'Administratif' :
                     selectedNotification.category === 'system' ? 'Système' : 'Sécurité'}
                  </span>
                </div>
              </div>

              {selectedNotification.patientName && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-800">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Patient concerné</span>
                  </div>
                  <p className="text-blue-700 mt-1">
                    {selectedNotification.patientName}
                    {selectedNotification.service && ` • ${selectedNotification.service}`}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(selectedNotification.timestamp), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
              </div>

              {selectedNotification.actionRequired && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-800">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Action requise</span>
                  </div>
                  <p className="text-orange-700 text-sm mt-1">
                    Cette notification nécessite une action de votre part.
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Fermer
              </button>
              {!selectedNotification.isRead && (
                <button
                  onClick={() => {
                    markAsRead(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Marquer comme lu
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};