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
}