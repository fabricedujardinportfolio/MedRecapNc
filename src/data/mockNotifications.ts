import { Notification as AppNotification } from '../types/Notification';

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-001',
    type: 'urgent',
    title: 'Critical Alert - Patient in Distress',
    message: 'Jean Tamate (PAT-004) shows deteriorating kidney function. Immediate intervention required.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    isRead: false,
    patientId: 'PAT-004',
    patientName: 'Jean Tamate',
    service: 'Nephrology',
    priority: 'critical',
    category: 'medical',
    actionRequired: true
  },
  {
    id: 'notif-002',
    type: 'alert',
    title: 'Respiratory Monitoring',
    message: 'Pierre Kanak (PAT-002) requires enhanced respiratory monitoring following asthma attack.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    isRead: false,
    patientId: 'PAT-002',
    patientName: 'Pierre Kanak',
    service: 'Emergency',
    priority: 'high',
    category: 'medical',
    actionRequired: true
  },
  {
    id: 'notif-003',
    type: 'warning',
    title: 'Drug Allergy Alert',
    message: 'Warning: Marie Dubois (PAT-001) is allergic to Penicillin. Check prescriptions.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    isRead: false,
    patientId: 'PAT-001',
    patientName: 'Marie Dubois',
    service: 'Cardiology',
    priority: 'high',
    category: 'medical',
    actionRequired: false
  },
  {
    id: 'notif-004',
    type: 'info',
    title: 'New Patient Admitted',
    message: 'Sarah Johnson (PAT-003) has been admitted to Obstetrics for pregnancy monitoring.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    isRead: true,
    patientId: 'PAT-003',
    patientName: 'Sarah Johnson',
    service: 'Obstetrics',
    priority: 'medium',
    category: 'administrative',
    actionRequired: false
  },
  {
    id: 'notif-005',
    type: 'success',
    title: 'Lab Results Available',
    message: 'Marie Dubois laboratory results are available and normal.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: true,
    patientId: 'PAT-001',
    patientName: 'Marie Dubois',
    service: 'Cardiology',
    priority: 'low',
    category: 'medical',
    actionRequired: false
  },
  {
    id: 'notif-006',
    type: 'warning',
    title: 'System Update',
    message: 'Scheduled MedRecap+ system maintenance tomorrow from 02:00 to 04:00.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    isRead: false,
    service: 'System',
    priority: 'medium',
    category: 'system',
    actionRequired: false
  },
  {
    id: 'notif-007',
    type: 'alert',
    title: 'Suspicious Login Attempt',
    message: 'Failed login attempt detected from unknown IP address.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    isRead: false,
    priority: 'high',
    category: 'security',
    actionRequired: true
  },
  {
    id: 'notif-008',
    type: 'info',
    title: 'Monthly Report Available',
    message: 'January 2025 hospital statistics monthly report is now available.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    isRead: true,
    priority: 'low',
    category: 'administrative',
    actionRequired: false
  },
  {
    id: 'notif-009',
    type: 'urgent',
    title: 'Medical Emergency',
    message: 'Code Red activated in emergency room. All available doctors required immediately.',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    isRead: true,
    service: 'Emergency',
    priority: 'critical',
    category: 'medical',
    actionRequired: true
  },
  {
    id: 'notif-010',
    type: 'warning',
    title: 'Low Medication Stock',
    message: 'Ventolin stock in pharmacy is critical. Urgent restocking needed.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    isRead: false,
    priority: 'high',
    category: 'administrative',
    actionRequired: true
  },
  {
    id: 'notif-011',
    type: 'info',
    title: 'Mandatory Training',
    message: 'Reminder: GDPR procedures training scheduled Friday January 17 at 2:00 PM.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
    priority: 'medium',
    category: 'administrative',
    actionRequired: false
  },
  {
    id: 'notif-012',
    type: 'success',
    title: 'Backup Completed',
    message: 'Daily patient data backup completed successfully.',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
    isRead: true,
    priority: 'low',
    category: 'system',
    actionRequired: false
  }
];

// Function to generate real-time notifications
export const generateRealtimeNotification = (): AppNotification => {
  const types: AppNotification['type'][] = ['alert', 'info', 'warning', 'success', 'urgent'];
  const priorities: AppNotification['priority'][] = ['low', 'medium', 'high', 'critical'];
  const categories: AppNotification['category'][] = ['medical', 'administrative', 'system', 'security'];
  
  const templates = [
    {
      type: 'alert' as const,
      title: 'New Patient Alert',
      message: 'A patient requires immediate medical attention.',
      priority: 'high' as const,
      category: 'medical' as const
    },
    {
      type: 'info' as const,
      title: 'New Message',
      message: 'You have received a new message from medical staff.',
      priority: 'medium' as const,
      category: 'administrative' as const
    },
    {
      type: 'warning' as const,
      title: 'Attention Required',
      message: 'A situation requires your attention.',
      priority: 'medium' as const,
      category: 'medical' as const
    }
  ];

  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    id: `notif-${Date.now()}`,
    ...template,
    timestamp: new Date().toISOString(),
    isRead: false,
    actionRequired: Math.random() > 0.7
  };
};