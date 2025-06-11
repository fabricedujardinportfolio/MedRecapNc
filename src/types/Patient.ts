export interface Patient {
  id: string;
  // Informations personnelles
  nom: string;
  prenom: string;
  sexe: 'M' | 'F' | 'Autre';
  dateNaissance: string;
  age: number;
  lieuNaissance: string;
  nationalite: string;
  numeroSecuriteSociale: string;
  photo?: string;
  situationFamiliale: string;
  
  // Coordonnées
  adresse: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  };
  telephone: {
    portable?: string;
    fixe?: string;
  };
  email?: string;
  contactUrgence: {
    nom: string;
    lien: string;
    telephone: string;
  };
  
  // Informations administratives
  numeroDossier: string;
  dateAdmission: string;
  service: string;
  modeAdmission: string;
  medecinTraitant: string;
  medecinReferent: string;
  statutSocial: string;
  mutuelle?: string;
  prisEnCharge: string;
  
  // Informations médicales
  antecedents: {
    personnels: string[];
    familiaux: string[];
  };
  allergies: string[];
  traitements: Array<{
    nom: string;
    dosage: string;
    frequence: string;
    dateDebut: string;
  }>;
  biometrie: {
    poids: number;
    taille: number;
    imc: number;
  };
  groupeSanguin: string;
  antecedenChirurgicaux: string[];
  habitudesVie: {
    tabac: boolean;
    alcool: boolean;
    drogues: boolean;
    details?: string;
  };
  pathologiesConnues: string[];
  motifHospitalisation: string;
  diagnostics: string[];
  
  // Alertes et statut
  alerte?: {
    niveau: 'verte' | 'orange' | 'rouge';
    message: string;
  };
  statut: 'Actif' | 'Sorti' | 'Transfert' | 'Urgence';
  derniereMaj: string;

  // Nouvelles fonctionnalités pour médecins de quartier
  consultations: Consultation[];
  factures: Facture[];
  rendezVous: RendezVous[];
  typePatient: 'hospitalier' | 'cabinet';
  medecinCabinet?: string;
  derniereConsultation?: string;
  prochainRendezVous?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  date: string;
  motif: string;
  diagnostic: string;
  traitement: string;
  observations: string;
  medecinId: string;
  medecinNom: string;
  duree: number; // en minutes
  type: 'consultation' | 'visite' | 'urgence' | 'suivi';
  statut: 'programmee' | 'en_cours' | 'terminee' | 'annulee';
  tarif: number;
  factureId?: string;
  ordonnance?: {
    medicaments: Array<{
      nom: string;
      dosage: string;
      duree: string;
      instructions: string;
    }>;
    examens: string[];
    arretTravail?: {
      duree: number;
      motif: string;
    };
  };
  signesVitaux?: {
    tension: string;
    pouls: number;
    temperature: number;
    poids: number;
    taille: number;
  };
}

export interface Facture {
  id: string;
  patientId: string;
  consultationId?: string;
  numero: string;
  date: string;
  montantTotal: number;
  montantPaye: number;
  montantRestant: number;
  statut: 'en_attente' | 'partiellement_payee' | 'payee' | 'en_retard' | 'annulee';
  methodePaiement?: 'especes' | 'carte' | 'cheque' | 'virement' | 'securite_sociale';
  dateEcheance: string;
  datePaiement?: string;
  details: Array<{
    description: string;
    quantite: number;
    prixUnitaire: number;
    total: number;
  }>;
  remboursement?: {
    securiteSociale: number;
    mutuelle: number;
    restACharge: number;
  };
  notes?: string;
}

export interface RendezVous {
  id: string;
  patientId: string;
  patientNom: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  motif: string;
  type: 'consultation' | 'suivi' | 'urgence' | 'visite';
  statut: 'programme' | 'confirme' | 'en_cours' | 'termine' | 'annule' | 'reporte';
  medecinId: string;
  medecinNom: string;
  salle?: string;
  notes?: string;
  rappelEnvoye: boolean;
  consultationId?: string;
}

export interface SearchFilters {
  nom?: string;
  service?: string;
  statut?: string;
  dateAdmissionDebut?: string;
  dateAdmissionFin?: string;
  alerte?: string;
  age?: {
    min?: number;
    max?: number;
  };
  typePatient?: 'hospitalier' | 'cabinet' | 'tous';
  medecinCabinet?: string;
  statutFacture?: string;
  prochainRendezVous?: boolean;
}

export interface UserRole {
  id: string;
  nom: string;
  permissions: string[];
}

export interface AdminUser {
  id: string;
  username: string;
  role: UserRole;
  lastLogin?: string;
  type: 'hospitalier' | 'cabinet';
  specialite?: string;
  numeroOrdre?: string;
}

// Nouveaux types pour les statistiques du cabinet
export interface CabinetStats {
  patients: {
    total: number;
    nouveaux: number;
    actifs: number;
  };
  consultations: {
    aujourdhui: number;
    semaine: number;
    mois: number;
  };
  rendezVous: {
    aujourdhui: number;
    semaine: number;
    enAttente: number;
  };
  finances: {
    chiffreAffaireMois: number;
    facturenAttente: number;
    tauxRecouvrement: number;
  };
}