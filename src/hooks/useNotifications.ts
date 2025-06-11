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
  const stats: NotificationStats = useMemo(() => {
    const allNotifications = notifications; // Use all notifications for stats
    
    return {
      total: allNotifications.length,
      unread: allNotifications.filter(n => !n.isRead).length,
      critical: allNotifications.filter(n => n.priority === 'critical' && !n.isRead).length,
      actionRequired: allNotifications.filter(n => n.actionRequired && !n.isRead).length,
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
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Add new notification (for testing or manual creation)
  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

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