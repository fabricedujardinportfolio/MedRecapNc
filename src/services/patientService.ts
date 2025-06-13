import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase configuration is missing');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface PatientData {
  id?: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F' | 'Autre';
  date_naissance: string;
  age: number;
  lieu_naissance: string;
  nationalite: string;
  numero_securite_sociale?: string;
  situation_familiale: string;
  
  // Coordonnées
  adresse_rue: string;
  adresse_ville: string;
  adresse_code_postal: string;
  adresse_pays: string;
  telephone_portable?: string;
  telephone_fixe?: string;
  email?: string;
  
  // Contact d'urgence
  contact_urgence_nom: string;
  contact_urgence_lien: string;
  contact_urgence_telephone: string;
  
  // Informations administratives
  numero_dossier: string;
  date_admission: string;
  service: string;
  mode_admission: string;
  medecin_traitant: string;
  medecin_referent: string;
  statut_social?: string;
  mutuelle?: string;
  pris_en_charge: string;
  
  // Informations médicales
  antecedents_personnels: string[];
  antecedents_familiaux: string[];
  allergies: string[];
  biometrie_poids?: number;
  biometrie_taille?: number;
  biometrie_imc?: number;
  groupe_sanguin: string;
  antecedents_chirurgicaux: string[];
  habitudes_vie_tabac: boolean;
  habitudes_vie_alcool: boolean;
  habitudes_vie_drogues: boolean;
  habitudes_vie_details?: string;
  pathologies_connues: string[];
  motif_hospitalisation: string;
  diagnostics: string[];
  
  // Alertes et statut
  alerte_niveau?: 'verte' | 'orange' | 'rouge';
  alerte_message?: string;
  statut: 'Actif' | 'Sorti' | 'Transfert' | 'Urgence';
  type_patient: 'hospitalier' | 'cabinet';
  medecin_cabinet?: string;
}

export interface ConsultationData {
  id?: string;
  patient_id: string;
  date: string;
  motif: string;
  diagnostic: string;
  traitement?: string;
  observations?: string;
  medecin_id?: string;
  medecin_nom: string;
  duree?: number;
  type: 'consultation' | 'visite' | 'urgence' | 'suivi';
  statut: 'programmee' | 'en_cours' | 'terminee' | 'annulee';
  tarif: number;
  tension?: string;
  pouls?: number;
  temperature?: number;
  poids?: number;
  taille?: number;
}

export interface FactureData {
  id?: string;
  patient_id: string;
  consultation_id?: string;
  numero: string;
  date: string;
  montant_total: number;
  montant_paye: number;
  montant_restant: number;
  statut: 'en_attente' | 'partiellement_payee' | 'payee' | 'en_retard' | 'annulee';
  methode_paiement?: string;
  date_echeance: string;
  date_paiement?: string;
  remboursement_securite_sociale?: number;
  remboursement_mutuelle?: number;
  remboursement_reste_a_charge?: number;
  notes?: string;
  details: Array<{
    description: string;
    quantite: number;
    prix_unitaire: number;
    total: number;
  }>;
}

export interface RendezVousData {
  id?: string;
  patient_id: string;
  patient_nom: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  motif: string;
  type: 'consultation' | 'suivi' | 'urgence' | 'visite';
  statut: 'programme' | 'confirme' | 'en_cours' | 'termine' | 'annule' | 'reporte';
  medecin_id?: string;
  medecin_nom: string;
  salle?: string;
  notes?: string;
  rappel_envoye: boolean;
  consultation_id?: string;
}

class PatientService {
  // Récupérer tous les patients avec leurs données complètes
  async getAllPatients(): Promise<PatientData[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des patients:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service patients:', error);
      throw error;
    }
  }

  // Récupérer un patient par ID avec toutes ses données
  async getPatientById(id: string): Promise<PatientData | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du patient:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur service patient:', error);
      throw error;
    }
  }

  // Créer un nouveau patient
  async createPatient(patientData: Omit<PatientData, 'id'>): Promise<PatientData> {
    try {
      // Générer un numéro de dossier unique
      const numeroDossier = `MED-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
      
      const { data, error } = await supabase
        .from('patients')
        .insert([{
          ...patientData,
          numero_dossier: numeroDossier
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du patient:', error);
        throw error;
      }

      console.log('✅ Patient créé avec succès:', data);
      return data;
    } catch (error) {
      console.error('Erreur service création patient:', error);
      throw error;
    }
  }

  // Mettre à jour un patient
  async updatePatient(id: string, patientData: Partial<PatientData>): Promise<PatientData> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du patient:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur service mise à jour patient:', error);
      throw error;
    }
  }

  // Récupérer les consultations d'un patient
  async getPatientConsultations(patientId: string): Promise<ConsultationData[]> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des consultations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service consultations:', error);
      throw error;
    }
  }

  // Récupérer les factures d'un patient
  async getPatientFactures(patientId: string): Promise<FactureData[]> {
    try {
      const { data, error } = await supabase
        .from('factures')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des factures:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service factures:', error);
      throw error;
    }
  }

  // Récupérer les rendez-vous d'un patient
  async getPatientRendezVous(patientId: string): Promise<RendezVousData[]> {
    try {
      const { data, error } = await supabase
        .from('rendez_vous')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service rendez-vous:', error);
      throw error;
    }
  }

  // Créer une nouvelle consultation
  async createConsultation(consultationData: Omit<ConsultationData, 'id'>): Promise<ConsultationData> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .insert([consultationData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la consultation:', error);
        throw error;
      }

      console.log('✅ Consultation créée avec succès:', data);
      return data;
    } catch (error) {
      console.error('Erreur service création consultation:', error);
      throw error;
    }
  }

  // Créer une nouvelle facture
  async createFacture(factureData: Omit<FactureData, 'id'>): Promise<FactureData> {
    try {
      // Créer la facture principale
      const { data: factureData, error: factureError } = await supabase
        .from('factures')
        .insert([{
          patient_id: factureData.patient_id,
          consultation_id: factureData.consultation_id,
          numero: factureData.numero,
          date: factureData.date,
          montant_total: factureData.montant_total,
          montant_paye: factureData.montant_paye,
          montant_restant: factureData.montant_restant,
          statut: factureData.statut,
          methode_paiement: factureData.methode_paiement,
          date_echeance: factureData.date_echeance,
          date_paiement: factureData.date_paiement,
          remboursement_securite_sociale: factureData.remboursement_securite_sociale,
          remboursement_mutuelle: factureData.remboursement_mutuelle,
          remboursement_reste_a_charge: factureData.remboursement_reste_a_charge,
          notes: factureData.notes
        }])
        .select()
        .single();

      if (factureError) {
        console.error('Erreur lors de la création de la facture:', factureError);
        throw factureError;
      }

      // Créer les détails de la facture
      if (factureData.details && factureData.details.length > 0) {
        const detailsWithFactureId = factureData.details.map(detail => ({
          facture_id: factureData.id,
          description: detail.description,
          quantite: detail.quantite,
          prix_unitaire: detail.prix_unitaire,
          total: detail.total
        }));

        const { error: detailsError } = await supabase
          .from('facture_details')
          .insert(detailsWithFactureId);

        if (detailsError) {
          console.error('Erreur lors de la création des détails de facture:', detailsError);
          // Ne pas échouer complètement si les détails ne sont pas créés
        }
      }

      console.log('✅ Facture créée avec succès:', factureData);
      return factureData;
    } catch (error) {
      console.error('Erreur service création facture:', error);
      throw error;
    }
  }

  // Créer un nouveau rendez-vous
  async createRendezVous(rdvData: Omit<RendezVousData, 'id'>): Promise<RendezVousData> {
    try {
      const { data, error } = await supabase
        .from('rendez_vous')
        .insert([rdvData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du rendez-vous:', error);
        throw error;
      }

      console.log('✅ Rendez-vous créé avec succès:', data);
      return data;
    } catch (error) {
      console.error('Erreur service création rendez-vous:', error);
      throw error;
    }
  }

  // Rechercher des patients
  async searchPatients(searchTerm: string): Promise<PatientData[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,numero_dossier.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la recherche de patients:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service recherche patients:', error);
      throw error;
    }
  }

  // Obtenir les statistiques du cabinet
  async getCabinetStats(): Promise<{
    totalPatients: number;
    patientsActifs: number;
    consultationsAujourdhui: number;
    rdvAujourdhui: number;
    facturesEnAttente: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Compter les patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      const { count: patientsActifs } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'Actif');

      // Compter les consultations d'aujourd'hui
      const { count: consultationsAujourdhui } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .gte('date', today)
        .lt('date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      // Compter les RDV d'aujourd'hui
      const { count: rdvAujourdhui } = await supabase
        .from('rendez_vous')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      // Compter les factures en attente
      const { count: facturesEnAttente } = await supabase
        .from('factures')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'en_attente');

      return {
        totalPatients: totalPatients || 0,
        patientsActifs: patientsActifs || 0,
        consultationsAujourdhui: consultationsAujourdhui || 0,
        rdvAujourdhui: rdvAujourdhui || 0,
        facturesEnAttente: facturesEnAttente || 0
      };
    } catch (error) {
      console.error('Erreur service statistiques cabinet:', error);
      throw error;
    }
  }
}

export const patientService = new PatientService();