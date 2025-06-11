import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { Notification as AppNotification, NotificationFilters, NotificationStats } from '../types/Notification';
import { mockNotifications, generateRealtimeNotification } from '../data/mockNotifications';

interface NotificationContextType {
  notifications: AppNotification[];
  allNotifications: AppNotification[];
  stats: NotificationStats;
  filters: NotificationFilters;
  setFilters: (filters: NotificationFilters) => void;
  isLoading: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // 20% chance of generating a new notification every 30 seconds
      if (Math.random() < 0.2) {
        const newNotification = generateRealtimeNotification();
        setNotifications(prev => [newNotification, ...prev]);
        
        // Show browser notification if permission granted
        if (window.Notification && window.Notification.permission === 'granted') {
          new window.Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/medical-icon.svg',
            tag: newNotification.id
          });
        }
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }
  }, []);

  // Filter notifications based on current filters
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (filters.type && notification.type !== filters.type) return false;
      if (filters.category && notification.category !== filters.category) return false;
      if (filters.priority && notification.priority !== filters.priority) return false;
      if (filters.isRead !== undefined && notification.isRead !== filters.isRead) return false;
      if (filters.service && notification.service !== filters.service) return false;
      
      if (filters.dateFrom) {
        const notifDate = new Date(notification.timestamp);
        const fromDate = new Date(filters.dateFrom);
        if (notifDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const notifDate = new Date(notification.timestamp);
        const toDate = new Date(filters.dateTo);
        if (notifDate > toDate) return false;
      }
      
      return true;
    });
  }, [notifications, filters]);

  // Calculate notification statistics - ALWAYS based on ALL notifications
  const stats: NotificationStats = useMemo(() => {
    console.log('🔄 [Context] Recalcul des stats notifications:', notifications.length, 'notifications totales');
    
    const allNotifications = notifications;
    const unreadCount = allNotifications.filter(n => !n.isRead).length;
    const criticalCount = allNotifications.filter(n => n.priority === 'critical' && !n.isRead).length;
    const actionRequiredCount = allNotifications.filter(n => n.actionRequired && !n.isRead).length;
    
    const newStats = {
      total: allNotifications.length,
      unread: unreadCount,
      critical: criticalCount,
      actionRequired: actionRequiredCount,
      byCategory: allNotifications.reduce((acc, n) => {
        acc[n.category] = (acc[n.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPriority: allNotifications.reduce((acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    
    console.log('📊 [Context] Stats calculées:', newStats);
    return newStats;
  }, [notifications]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    console.log('✅ [Context] Marquage comme lu:', notificationId);
    setNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      );
      console.log('📝 [Context] Notifications après marquage:', updated.filter(n => !n.isRead).length, 'non lues');
      return updated;
    });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    console.log('✅ [Context] Marquage de toutes les notifications comme lues');
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, isRead: true }));
      console.log('📝 [Context] Toutes les notifications marquées comme lues');
      return updated;
    });
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    console.log('🗑️ [Context] Suppression de la notification:', notificationId);
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== notificationId);
      console.log('📝 [Context] Notifications après suppression:', updated.length, 'restantes,', updated.filter(n => !n.isRead).length, 'non lues');
      return updated;
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    console.log('🗑️ [Context] Suppression de toutes les notifications');
    setNotifications([]);
  }, []);

  // Add new notification
  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    console.log('➕ [Context] Ajout d\'une nouvelle notification:', newNotification.id);
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      console.log('📝 [Context] Notifications après ajout:', updated.length, 'totales,', updated.filter(n => !n.isRead).length, 'non lues');
      return updated;
    });
  }, []);

  // Debug: Log stats changes
  useEffect(() => {
    console.log('🎯 [Context] Stats mises à jour:', stats);
  }, [stats]);

  const value: NotificationContextType = {
    notifications: filteredNotifications,
    allNotifications: notifications,
    stats,
    filters,
    setFilters,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};