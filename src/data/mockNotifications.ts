import { Notification } from '../types/Notification';

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'urgent',
    title: 'Alerte Critique - Patient en Détresse',
    message: 'Jean Tamate (PAT-004) présente une dégradation de sa fonction rénale. Intervention immédiate requise.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    isRead: false,
    patientId: 'PAT-004',
    patientName: 'Jean Tamate',
    service: 'Néphrologie',
    priority: 'critical',
    category: 'medical',
    actionRequired: true
  },
  {
    id: 'notif-002',
    type: 'alert',
    title: 'Surveillance Respiratoire',
    message: 'Pierre Kanak (PAT-002) nécessite une surveillance respiratoire renforcée suite à sa crise d\'asthme.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    isRead: false,
    patientId: 'PAT-002',
    patientName: 'Pierre Kanak',
    service: 'Urgences',
    priority: 'high',
    category: 'medical',
    actionRequired: true
  },
  {
    id: 'notif-003',
    type: 'warning',
    title: 'Allergie Médicamenteuse',
    message: 'Attention: Marie Dubois (PAT-001) est allergique à la Pénicilline. Vérifier les prescriptions.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    isRead: false,
    patientId: 'PAT-001',
    patientName: 'Marie Dubois',
    service: 'Cardiologie',
    priority: 'high',
    category: 'medical',
    actionRequired: false
  },
  {
    id: 'notif-004',
    type: 'info',
    title: 'Nouveau Patient Admis',
    message: 'Sarah Johnson (PAT-003) a été admise en Obstétrique pour suivi de grossesse.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    isRead: true,
    patientId: 'PAT-003',
    patientName: 'Sarah Johnson',
    service: 'Obstétrique',
    priority: 'medium',
    category: 'administrative',
    actionRequired: false
  },
  {
    id: 'notif-005',
    type: 'success',
    title: 'Résultats d\'Analyses',
    message: 'Les résultats de laboratoire de Marie Dubois sont disponibles et normaux.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: true,
    patientId: 'PAT-001',
    patientName: 'Marie Dubois',
    service: 'Cardiologie',
    priority: 'low',
    category: 'medical',
    actionRequired: false
  },
  {
    id: 'notif-006',
    type: 'warning',
    title: 'Mise à Jour Système',
    message: 'Maintenance programmée du système MedRecap+ prévue demain de 02h00 à 04h00.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    isRead: false,
    service: 'Système',
    priority: 'medium',
    category: 'system',
    actionRequired: false
  },
  {
    id: 'notif-007',
    type: 'alert',
    title: 'Tentative de Connexion Suspecte',
    message: 'Tentative de connexion échouée détectée depuis une adresse IP inconnue.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    isRead: false,
    priority: 'high',
    category: 'security',
    actionRequired: true
  },
  {
    id: 'notif-008',
    type: 'info',
    title: 'Rapport Mensuel Disponible',
    message: 'Le rapport mensuel des statistiques hospitalières de janvier 2025 est maintenant disponible.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    isRead: true,
    priority: 'low',
    category: 'administrative',
    actionRequired: false
  },
  {
    id: 'notif-009',
    type: 'urgent',
    title: 'Urgence Médicale',
    message: 'Code Rouge activé en salle d\'urgence. Tous les médecins disponibles requis immédiatement.',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    isRead: true,
    service: 'Urgences',
    priority: 'critical',
    category: 'medical',
    actionRequired: true
  },
  {
    id: 'notif-010',
    type: 'warning',
    title: 'Stock Médicament Faible',
    message: 'Le stock de Ventoline en pharmacie est critique. Réapprovisionnement urgent nécessaire.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    isRead: false,
    priority: 'high',
    category: 'administrative',
    actionRequired: true
  },
  {
    id: 'notif-011',
    type: 'info',
    title: 'Formation Obligatoire',
    message: 'Rappel: Formation sur les nouvelles procédures RGPD prévue vendredi 17 janvier à 14h00.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
    priority: 'medium',
    category: 'administrative',
    actionRequired: false
  },
  {
    id: 'notif-012',
    type: 'success',
    title: 'Sauvegarde Complétée',
    message: 'La sauvegarde quotidienne des données patients a été effectuée avec succès.',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
    isRead: true,
    priority: 'low',
    category: 'system',
    actionRequired: false
  }
];

// Fonction pour générer des notifications en temps réel
export const generateRealtimeNotification = (): Notification => {
  const types: Notification['type'][] = ['alert', 'info', 'warning', 'success', 'urgent'];
  const priorities: Notification['priority'][] = ['low', 'medium', 'high', 'critical'];
  const categories: Notification['category'][] = ['medical', 'administrative', 'system', 'security'];
  
  const templates = [
    {
      type: 'alert' as const,
      title: 'Nouvelle Alerte Patient',
      message: 'Un patient nécessite une attention médicale immédiate.',
      priority: 'high' as const,
      category: 'medical' as const
    },
    {
      type: 'info' as const,
      title: 'Nouveau Message',
      message: 'Vous avez reçu un nouveau message du service médical.',
      priority: 'medium' as const,
      category: 'administrative' as const
    },
    {
      type: 'warning' as const,
      title: 'Attention Requise',
      message: 'Une situation nécessite votre attention.',
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