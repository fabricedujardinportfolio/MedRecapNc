export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'warning' | 'success' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  patientId?: string;
  patientName?: string;
  service?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'medical' | 'administrative' | 'system' | 'security';
  actionRequired?: boolean;
  expiresAt?: string;
}

export interface NotificationFilters {
  type?: string;
  category?: string;
  priority?: string;
  isRead?: boolean;
  service?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  critical: number;
  actionRequired: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}