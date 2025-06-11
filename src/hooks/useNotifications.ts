import { useState, useEffect, useCallback, useMemo } from 'react';
import { Notification as AppNotification, NotificationFilters, NotificationStats } from '../types/Notification';
import { mockNotifications, generateRealtimeNotification } from '../data/mockNotifications';

export const useNotifications = () => {
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

  // Calculate notification statistics - ALWAYS based on ALL notifications, not filtered ones
  // Force recalculation by using a dependency array that includes notifications
  const stats: NotificationStats = useMemo(() => {
    console.log('🔄 Recalcul des stats notifications:', notifications.length, 'notifications totales');
    
    const allNotifications = notifications; // Use all notifications for stats
    const unreadCount = allNotifications.filter(n => !n.isRead).length;
    const criticalCount = allNotifications.filter(n => n.priority === 'critical' && !n.isRead).length;
    const actionRequiredCount = allNotifications.filter(n => n.actionRequired && !n.isRead).length;
    
    console.log('📊 Stats calculées:', {
      total: allNotifications.length,
      unread: unreadCount,
      critical: criticalCount,
      actionRequired: actionRequiredCount
    });
    
    return {
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
  }, [notifications]); // Dependency on notifications ensures recalculation on every change

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    console.log('✅ Marquage comme lu:', notificationId);
    setNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      );
      console.log('📝 Notifications après marquage:', updated.filter(n => !n.isRead).length, 'non lues');
      return updated;
    });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    console.log('✅ Marquage de toutes les notifications comme lues');
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, isRead: true }));
      console.log('📝 Toutes les notifications marquées comme lues');
      return updated;
    });
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    console.log('🗑️ Suppression de la notification:', notificationId);
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== notificationId);
      console.log('📝 Notifications après suppression:', updated.length, 'restantes,', updated.filter(n => !n.isRead).length, 'non lues');
      return updated;
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    console.log('🗑️ Suppression de toutes les notifications');
    setNotifications([]);
  }, []);

  // Add new notification (for testing or manual creation)
  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    console.log('➕ Ajout d\'une nouvelle notification:', newNotification.id);
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      console.log('📝 Notifications après ajout:', updated.length, 'totales,', updated.filter(n => !n.isRead).length, 'non lues');
      return updated;
    });
  }, []);

  // Debug: Log stats changes
  useEffect(() => {
    console.log('🎯 Stats mises à jour dans le hook:', stats);
  }, [stats]);

  return {
    notifications: filteredNotifications,
    allNotifications: notifications,
    stats, // These stats are now reactive to all changes
    filters,
    setFilters,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification
  };
};