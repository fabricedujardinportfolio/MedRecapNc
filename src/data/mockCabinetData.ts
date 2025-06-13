import { Patient, Consultation, Facture, RendezVous, CabinetStats } from '../types/Patient';

// Medical practice consultation data
export const mockConsultations: Consultation[] = [
  {
    id: 'CONS-001',
    patientId: 'PAT-001',
    date: '2025-01-15T09:30:00',
    motif: 'Blood pressure check',
    diagnostic: 'Controlled hypertension',
    traitement: 'Continue antihypertensive treatment',
    observations: 'Stable blood pressure, good treatment compliance',
    medecinId: 'MED-001',
    medecinNom: 'Dr. Martin Dubois',
    duree: 30,
    type: 'suivi',
    statut: 'terminee',
    tarif: 25,
    factureId: 'FACT-001',
    signesVitaux: {
      tension: '130/80',
      pouls: 72,
      temperature: 36.5,
      poids: 75,
      taille: 170
    },
    ordonnance: {
      medicaments: [
        {
          nom: 'Amlodipine',
          dosage: '5mg',
          duree: '30 days',
          instructions: '1 tablet in the morning'
        }
      ],
      examens: ['Lipid panel in 3 months']
    }
  },
  {
    id: 'CONS-002',
    patientId: 'PAT-002',
    date: '2025-01-15T14:00:00',
    motif: 'Persistent cough',
    diagnostic: 'Acute bronchitis',
    traitement: 'Antibiotic and cough suppressant',
    observations: 'Productive cough for 5 days, no fever',
    medecinId: 'MED-001',
    medecinNom: 'Dr. Martin Dubois',
    duree: 20,
    type: 'consultation',
    statut: 'terminee',
    tarif: 25,
    factureId: 'FACT-002',
    signesVitaux: {
      tension: '120/75',
      pouls: 68,
      temperature: 36.8,
      poids: 82,
      taille: 175
    },
    ordonnance: {
      medicaments: [
        {
          nom: 'Amoxicillin',
          dosage: '1g',
          duree: '7 days',
          instructions: '1 tablet morning and evening'
        },
        {
          nom: 'Cough syrup',
          dosage: '15ml',
          duree: '5 days',
          instructions: '3 times daily'
        }
      ],
      examens: [],
      arretTravail: {
        duree: 3,
        motif: 'Acute bronchitis'
      }
    }
  },
  {
    id: 'CONS-003',
    patientId: 'PAT-003',
    date: '2025-01-16T10:15:00',
    motif: 'Pregnancy follow-up',
    diagnostic: 'Normal pregnancy - 20 weeks gestation',
    traitement: 'Iron supplementation',
    observations: 'Pregnancy progressing normally, no complications',
    medecinId: 'MED-001',
    medecinNom: 'Dr. Martin Dubois',
    duree: 25,
    type: 'suivi',
    statut: 'terminee',
    tarif: 25,
    factureId: 'FACT-003',
    signesVitaux: {
      tension: '110/70',
      pouls: 75,
      temperature: 36.6,
      poids: 65,
      taille: 165
    },
    ordonnance: {
      medicaments: [
        {
          nom: 'Iron + Folic acid',
          dosage: '1 tablet',
          duree: '30 days',
          instructions: '1 tablet daily with meals'
        }
      ],
      examens: ['Morphology ultrasound in 2 weeks']
    }
  }
];

export const mockFactures: Facture[] = [
  {
    id: 'FACT-001',
    patientId: 'PAT-001',
    consultationId: 'CONS-001',
    numero: 'F2025-001',
    date: '2025-01-15',
    montantTotal: 25,
    montantPaye: 25,
    montantRestant: 0,
    statut: 'payee',
    methodePaiement: 'carte',
    dateEcheance: '2025-01-15',
    datePaiement: '2025-01-15',
    details: [
      {
        description: 'Follow-up consultation',
        quantite: 1,
        prixUnitaire: 25,
        total: 25
      }
    ],
    remboursement: {
      securiteSociale: 17.50,
      mutuelle: 7.50,
      restACharge: 0
    }
  },
  {
    id: 'FACT-002',
    patientId: 'PAT-002',
    consultationId: 'CONS-002',
    numero: 'F2025-002',
    date: '2025-01-15',
    montantTotal: 25,
    montantPaye: 0,
    montantRestant: 25,
    statut: 'en_attente',
    dateEcheance: '2025-02-15',
    details: [
      {
        description: 'Medical consultation',
        quantite: 1,
        prixUnitaire: 25,
        total: 25
      }
    ],
    remboursement: {
      securiteSociale: 17.50,
      mutuelle: 7.50,
      restACharge: 0
    }
  },
  {
    id: 'FACT-003',
    patientId: 'PAT-003',
    consultationId: 'CONS-003',
    numero: 'F2025-003',
    date: '2025-01-16',
    montantTotal: 25,
    montantPaye: 17.50,
    montantRestant: 7.50,
    statut: 'partiellement_payee',
    methodePaiement: 'securite_sociale',
    dateEcheance: '2025-02-16',
    datePaiement: '2025-01-16',
    details: [
      {
        description: 'Pregnancy follow-up consultation',
        quantite: 1,
        prixUnitaire: 25,
        total: 25
      }
    ],
    remboursement: {
      securiteSociale: 17.50,
      mutuelle: 7.50,
      restACharge: 0
    },
    notes: 'Mutual insurance reimbursement pending'
  }
];

export const mockRendezVous: RendezVous[] = [
  {
    id: 'RDV-001',
    patientId: 'PAT-001',
    patientNom: 'Marie Dubois',
    date: '2025-01-17',
    heureDebut: '09:00',
    heureFin: '09:30',
    motif: 'Blood pressure check',
    type: 'suivi',
    statut: 'confirme',
    medecinId: 'MED-001',
    medecinNom: 'Dr. Martin Dubois',
    salle: 'Office 1',
    rappelEnvoye: true
  },
  {
    id: 'RDV-002',
    patientId: 'PAT-004',
    patientNom: 'Jean Tamate',
    date: '2025-01-17',
    heureDebut: '10:00',
    heureFin: '10:30',
    motif: 'General consultation',
    type: 'consultation',
    statut: 'programme',
    medecinId: 'MED-001',
    medecinNom: 'Dr. Martin Dubois',
    salle: 'Office 1',
    rappelEnvoye: false
  },
  {
    id: 'RDV-003',
    patientId: 'PAT-003',
    patientNom: 'Sarah Johnson',
    date: '2025-01-17',
    heureDebut: '14:30',
    heureFin: '15:00',
    motif: 'Pregnancy follow-up',
    type: 'suivi',
    statut: 'confirme',
    medecinId: 'MED-001',
    medecinNom: 'Dr. Martin Dubois',
    salle: 'Office 1',
    rappelEnvoye: true
  },
  {
    id: 'RDV-004',
    patientId: 'PAT-002',
    patientNom: 'Pierre Kanak',
    date: '2025-01-18',
    heureDebut: '11:00',
    heureFin: '11:30',
    motif: 'Bronchitis follow-up',
    type: 'suivi',
    statut: 'programme',
    medecinId: 'MED-001',
    medecinNom: 'Dr. Martin Dubois',
    salle: 'Office 1',
    rappelEnvoye: false
  }
];

export const mockCabinetStats: CabinetStats = {
  patients: {
    total: 156,
    nouveaux: 8,
    actifs: 142
  },
  consultations: {
    aujourdhui: 12,
    semaine: 67,
    mois: 284
  },
  rendezVous: {
    aujourdhui: 8,
    semaine: 45,
    enAttente: 23
  },
  finances: {
    chiffreAffaireMois: 7100,
    facturenAttente: 1250,
    tauxRecouvrement: 94.2
  }
};

// Update existing patients to include new cabinet data
export const updatePatientsWithCabinetData = (patients: Patient[]): Patient[] => {
  return patients.map(patient => ({
    ...patient,
    typePatient: Math.random() > 0.5 ? 'cabinet' : 'hospitalier',
    medecinCabinet: 'Dr. Martin Dubois',
    consultations: mockConsultations.filter(c => c.patientId === patient.id),
    factures: mockFactures.filter(f => f.patientId === patient.id),
    rendezVous: mockRendezVous.filter(r => r.patientId === patient.id),
    derniereConsultation: mockConsultations.find(c => c.patientId === patient.id)?.date,
    prochainRendezVous: mockRendezVous.find(r => r.patientId === patient.id && new Date(r.date) > new Date())?.date
  }));
};