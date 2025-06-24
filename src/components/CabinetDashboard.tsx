import React, { useState, useMemo, useEffect } from 'react';
import { SearchFilters } from './SearchFilters';
import { PatientCard } from './PatientCard';
import { PatientModal } from './PatientModal';
import { ConsultationModal } from './ConsultationModal';
import { FactureModal } from './FactureModal';
import { RendezVousModal } from './RendezVousModal';
import { AddPatientModal } from './AddPatientModal';
import { EditFactureModal } from './EditFactureModal';
import { EditConsultationModal } from './EditConsultationModal';
import { mockCabinetStats } from '../data/mockCabinetData';
import { Patient, SearchFilters as SearchFiltersType, CabinetStats, Consultation, Facture, RendezVous } from '../types/Patient';
import { PatientData, patientService, ConsultationData, FactureData, RendezVousData, supabase } from '../services/patientService';
import { useLanguage } from '../hooks/useLanguage';
import { 
  Users, 
  UserCheck, 
  Calendar,
  Euro,
  TrendingUp,
  Clock,
  Stethoscope,
  FileText,
  CreditCard,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

export const CabinetDashboard: React.FC = () => {
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [showRendezVousModal, setShowRendezVousModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showEditFactureModal, setShowEditFactureModal] = useState(false);
  const [showEditConsultationModal, setShowEditConsultationModal] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<FactureData | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationData | null>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'consultations' | 'factures' | 'rendez-vous'>('patients');
  const [patientsFromDB, setPatientsFromDB] = useState<PatientData[]>([]);
  const [consultationsFromDB, setConsultationsFromDB] = useState<ConsultationData[]>([]);
  const [facturesFromDB, setFacturesFromDB] = useState<FactureData[]>([]);
  const [rendezVousFromDB, setRendezVousFromDB] = useState<RendezVousData[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(false);
  const [isLoadingFactures, setIsLoadingFactures] = useState(false);
  const [isLoadingRendezVous, setIsLoadingRendezVous] = useState(false);
  const [stats, setStats] = useState<CabinetStats>(mockCabinetStats);
  const { t, language } = useLanguage();
  const locale = language === 'fr' ? fr : enUS;

  // Charger les patients depuis la base de données
  useEffect(() => {
    loadPatientsFromDB();
  }, []);

  // Charger les consultations quand on change d'onglet
  useEffect(() => {
    if (activeTab === 'consultations') {
      loadConsultationsFromDB();
    } else if (activeTab === 'factures') {
      loadFacturesFromDB();
    } else if (activeTab === 'rendez-vous') {
      loadRendezVousFromDB();
    }
  }, [activeTab]);

  const loadPatientsFromDB = async () => {
    try {
      setIsLoadingPatients(true);
      console.log('🔄 Chargement des patients depuis Supabase...');
      
      const patients = await patientService.getAllPatients();
      console.log('✅ Patients chargés depuis la BDD:', patients.length);
      
      setPatientsFromDB(patients);
      
      // Charger les statistiques
      const cabinetStats = await patientService.getCabinetStats();
      setStats({
        patients: {
          total: cabinetStats.totalPatients,
          nouveaux: Math.floor(cabinetStats.totalPatients * 0.1), // 10% de nouveaux
          actifs: cabinetStats.patientsActifs
        },
        consultations: {
          aujourdhui: cabinetStats.consultationsAujourdhui,
          semaine: cabinetStats.consultationsAujourdhui * 7,
          mois: cabinetStats.consultationsAujourdhui * 30
        },
        rendezVous: {
          aujourdhui: cabinetStats.rdvAujourdhui,
          semaine: cabinetStats.rdvAujourdhui * 7,
          enAttente: Math.floor(cabinetStats.rdvAujourdhui * 1.5)
        },
        finances: {
          chiffreAffaireMois: cabinetStats.totalPatients * 25 * 2, // Estimation
          facturenAttente: cabinetStats.facturesEnAttente * 25,
          tauxRecouvrement: 94.2
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des patients:', error);
      // En cas d'erreur, utiliser un tableau vide
      setPatientsFromDB([]);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const loadConsultationsFromDB = async () => {
    try {
      setIsLoadingConsultations(true);
      console.log('🔄 Chargement des consultations depuis Supabase...');
      
      // Récupérer toutes les consultations avec les informations patient
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          patients!inner(nom, prenom)
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors du chargement des consultations:', error);
        throw error;
      }

      console.log('✅ Consultations chargées:', data?.length || 0);
      setConsultationsFromDB(data || []);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des consultations:', error);
      setConsultationsFromDB([]);
    } finally {
      setIsLoadingConsultations(false);
    }
  };

  const loadFacturesFromDB = async () => {
    try {
      setIsLoadingFactures(true);
      console.log('🔄 Chargement des factures depuis Supabase...');
      
      // Récupérer toutes les factures avec les informations patient
      const { data, error } = await supabase
        .from('factures')
        .select(`
          *,
          patients!inner(nom, prenom),
          facture_details(*)
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors du chargement des factures:', error);
        throw error;
      }

      console.log('✅ Factures chargées:', data?.length || 0);
      setFacturesFromDB(data || []);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des factures:', error);
      setFacturesFromDB([]);
    } finally {
      setIsLoadingFactures(false);
    }
  };

  const loadRendezVousFromDB = async () => {
    try {
      setIsLoadingRendezVous(true);
      console.log('🔄 Chargement des rendez-vous depuis Supabase...');
      
      // Récupérer tous les rendez-vous
      const { data, error } = await supabase
        .from('rendez_vous')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors du chargement des rendez-vous:', error);
        throw error;
      }

      console.log('✅ Rendez-vous chargés:', data?.length || 0);
      setRendezVousFromDB(data || []);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des rendez-vous:', error);
      setRendezVousFromDB([]);
    } finally {
      setIsLoadingRendezVous(false);
    }
  };

  // Convertir les patients de la DB au format attendu par l'interface
  const convertDBPatientToPatient = (dbPatient: PatientData): Patient => {
    return {
      id: dbPatient.id || '',
      nom: dbPatient.nom,
      prenom: dbPatient.prenom,
      sexe: dbPatient.sexe,
      dateNaissance: dbPatient.date_naissance,
      age: dbPatient.age,
      lieuNaissance: dbPatient.lieu_naissance,
      nationalite: dbPatient.nationalite,
      numeroSecuriteSociale: dbPatient.numero_securite_sociale || '',
      situationFamiliale: dbPatient.situation_familiale || '',
      
      adresse: {
        rue: dbPatient.adresse_rue,
        ville: dbPatient.adresse_ville,
        codePostal: dbPatient.adresse_code_postal,
        pays: dbPatient.adresse_pays
      },
      telephone: {
        portable: dbPatient.telephone_portable,
        fixe: dbPatient.telephone_fixe
      },
      email: dbPatient.email,
      contactUrgence: {
        nom: dbPatient.contact_urgence_nom,
        lien: dbPatient.contact_urgence_lien,
        telephone: dbPatient.contact_urgence_telephone
      },
      
      numeroDossier: dbPatient.numero_dossier,
      dateAdmission: dbPatient.date_admission,
      service: dbPatient.service,
      modeAdmission: dbPatient.mode_admission,
      medecinTraitant: dbPatient.medecin_traitant,
      medecinReferent: dbPatient.medecin_referent,
      statutSocial: dbPatient.statut_social || '',
      mutuelle: dbPatient.mutuelle,
      prisEnCharge: dbPatient.pris_en_charge || '',
      
      antecedents: {
        personnels: dbPatient.antecedents_personnels || [],
        familiaux: dbPatient.antecedents_familiaux || []
      },
      allergies: dbPatient.allergies || [],
      traitements: [], // À charger séparément si nécessaire
      biometrie: {
        poids: dbPatient.biometrie_poids || 0,
        taille: dbPatient.biometrie_taille || 0,
        imc: dbPatient.biometrie_imc || 0
      },
      groupeSanguin: dbPatient.groupe_sanguin,
      antecedenChirurgicaux: dbPatient.antecedents_chirurgicaux || [],
      habitudesVie: {
        tabac: dbPatient.habitudes_vie_tabac || false,
        alcool: dbPatient.habitudes_vie_alcool || false,
        drogues: dbPatient.habitudes_vie_drogues || false,
        details: dbPatient.habitudes_vie_details || ''
      },
      pathologiesConnues: dbPatient.pathologies_connues || [],
      motifHospitalisation: dbPatient.motif_hospitalisation,
      diagnostics: dbPatient.diagnostics || [],
      
      alerte: dbPatient.alerte_niveau ? {
        niveau: dbPatient.alerte_niveau,
        message: dbPatient.alerte_message || ''
      } : undefined,
      statut: dbPatient.statut,
      derniereMaj: new Date().toISOString(),
      
      // Données cabinet
      consultations: [], // À charger séparément
      factures: [], // À charger séparément
      rendezVous: [], // À charger séparément
      typePatient: dbPatient.type_patient || 'cabinet',
      medecinCabinet: dbPatient.medecin_cabinet || ''
    };
  };

  // CORRECTION : Utiliser UNIQUEMENT les patients de la base de données
  const allPatients = useMemo(() => {
    console.log('🔄 Conversion des patients de la BDD:', patientsFromDB.length);
    const dbPatients = patientsFromDB.map(convertDBPatientToPatient);
    console.log('✅ Patients convertis:', dbPatients.length);
    
    // SUPPRIMÉ : Ne plus combiner avec les données mock
    // const mockPatientsWithCabinetData = updatePatientsWithCabinetData(mockPatients);
    // const existingIds = new Set(dbPatients.map(p => p.id));
    // const uniqueMockPatients = mockPatientsWithCabinetData.filter(p => !existingIds.has(p.id));
    // return [...dbPatients, ...uniqueMockPatients];
    
    // NOUVEAU : Retourner uniquement les patients de la base de données
    return dbPatients;
  }, [patientsFromDB]);

  // Filter patients based on search criteria
  const filteredPatients = useMemo(() => {
    return allPatients.filter(patient => {
      // Name filter
      if (filters.nom) {
        const searchTerm = filters.nom.toLowerCase();
        const fullName = `${patient.prenom} ${patient.nom}`.toLowerCase();
        if (!fullName.includes(searchTerm)) return false;
      }

      // Type filter (cabinet vs hospitalier)
      if (filters.typePatient && filters.typePatient !== 'tous') {
        if (patient.typePatient !== filters.typePatient) return false;
      }

      // Service filter
      if (filters.service && patient.service !== filters.service) return false;

      // Status filter
      if (filters.statut && patient.statut !== filters.statut) return false;

      // Alert filter
      if (filters.alerte && patient.alerte?.niveau !== filters.alerte) return false;

      // Age filter
      if (filters.age?.min && patient.age < filters.age.min) return false;
      if (filters.age?.max && patient.age > filters.age.max) return false;

      // Date filter
      if (filters.dateAdmissionDebut) {
        const admissionDate = new Date(patient.dateAdmission);
        const filterDate = new Date(filters.dateAdmissionDebut);
        if (admissionDate < filterDate) return false;
      }

      if (filters.dateAdmissionFin) {
        const admissionDate = new Date(patient.dateAdmission);
        const filterDate = new Date(filters.dateAdmissionFin);
        if (admissionDate > filterDate) return false;
      }

      // Prochain rendez-vous filter
      if (filters.prochainRendezVous) {
        if (!patient.prochainRendezVous) return false;
      }

      return true;
    });
  }, [filters, allPatients]);

  const resetFilters = () => {
    setFilters({});
  };

  // Gérer l'ajout d'un nouveau patient
  const handlePatientAdded = (newPatient: PatientData) => {
    console.log('✅ Nouveau patient ajouté:', newPatient);
    // Recharger les patients depuis la DB
    loadPatientsFromDB();
  };

  // Gérer la mise à jour des données après ajout de consultation, facture ou RDV
  const handleDataUpdated = () => {
    console.log('🔄 Mise à jour des données après modification');
    loadPatientsFromDB();
    // Recharger aussi les données de l'onglet actuel
    if (activeTab === 'consultations') {
      loadConsultationsFromDB();
    } else if (activeTab === 'factures') {
      loadFacturesFromDB();
    } else if (activeTab === 'rendez-vous') {
      loadRendezVousFromDB();
    }
  };

  // Gérer l'édition d'une facture
  const handleEditFacture = (facture: FactureData) => {
    setSelectedFacture(facture);
    setShowEditFactureModal(true);
  };

  // Gérer l'édition d'une consultation
  const handleEditConsultation = (consultation: ConsultationData) => {
    setSelectedConsultation(consultation);
    setShowEditConsultationModal(true);
  };

  // Fonctions utilitaires pour les statuts
  const getConsultationStatusColor = (statut: string) => {
    switch (statut) {
      case 'terminee': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-orange-100 text-orange-800';
      case 'programmee': return 'bg-blue-100 text-blue-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConsultationStatusText = (statut: string) => {
    switch (statut) {
      case 'terminee': return t('consultation.status.completed');
      case 'en_cours': return t('consultation.status.ongoing');
      case 'programmee': return t('consultation.status.scheduled');
      case 'annulee': return t('consultation.status.cancelled');
      default: return statut;
    }
  };

  const getFactureStatusColor = (statut: string) => {
    switch (statut) {
      case 'payee': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-orange-100 text-orange-800';
      case 'partiellement_payee': return 'bg-yellow-100 text-yellow-800';
      case 'en_retard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFactureStatusText = (statut: string) => {
    switch (statut) {
      case 'payee': return t('invoice.status.paid');
      case 'en_attente': return t('invoice.status.pending');
      case 'partiellement_payee': return t('invoice.status.partial');
      case 'en_retard': return t('invoice.status.overdue');
      default: return statut;
    }
  };

  const getRdvStatusColor = (statut: string) => {
    switch (statut) {
      case 'confirme': return 'bg-green-100 text-green-800';
      case 'programme': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-orange-100 text-orange-800';
      case 'termine': return 'bg-gray-100 text-gray-800';
      case 'annule': return 'bg-red-100 text-red-800';
      case 'reporte': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRdvStatusText = (statut: string) => {
    switch (statut) {
      case 'confirme': return t('appointment.status.confirmed');
      case 'programme': return t('appointment.status.scheduled');
      case 'en_cours': return t('appointment.status.ongoing');
      case 'termine': return t('appointment.status.completed');
      case 'annule': return t('appointment.status.cancelled');
      case 'reporte': return t('appointment.status.postponed');
      default: return statut;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap justify-center sm:justify-start space-x-8">
            {[
              { id: 'patients', label: t('cabinet.tabs.patients'), icon: Users },
              { id: 'consultations', label: t('cabinet.tabs.consultations'), icon: Stethoscope },
              { id: 'factures', label: t('cabinet.tabs.invoices'), icon: FileText },
              { id: 'rendez-vous', label: t('cabinet.tabs.appointments'), icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('cabinet.stats.patients')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.patients.total}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+{stats.patients.nouveaux}</span>
            <span className="text-gray-500 ml-1">{t('cabinet.stats.new.month')}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('cabinet.stats.consultations')}</p>
              <p className="text-3xl font-bold text-green-600">{consultationsFromDB.length}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Stethoscope className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500">
              {stats.consultations.semaine} {t('cabinet.stats.week')}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('cabinet.stats.appointments')}</p>
              <p className="text-3xl font-bold text-orange-600">{rendezVousFromDB.length}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Clock className="w-4 h-4 text-orange-500 mr-1" />
            <span className="text-orange-600">{stats.rendezVous.enAttente} {t('cabinet.stats.pending')}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('cabinet.stats.revenue')}</p>
              <p className="text-3xl font-bold text-purple-600">{stats.finances.chiffreAffaireMois}€</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Euro className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <CreditCard className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-red-600">{stats.finances.facturenAttente}€ {t('cabinet.stats.waiting')}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('cabinet.actions.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <button
            onClick={() => setShowAddPatientModal(true)}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">{t('cabinet.actions.patient')}</span>
          </button>
          
          <button
            onClick={loadPatientsFromDB}
            disabled={isLoadingPatients}
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoadingPatients ? 'animate-spin' : ''}`} />
            <span className="font-medium text-gray-900">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'patients' && (
        <>
          {/* Search and Filters */}
          <SearchFilters 
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
            showCabinetFilters={true}
          />

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('dashboard.title')}
              </h2>
              <p className="text-gray-600">
                {filteredPatients.length} {filteredPatients.length === 1 ? t('dashboard.results.found') : t('dashboard.results.found.plural')}
                {isLoadingPatients && (
                  <span className="ml-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 inline animate-spin mr-1" />
                    Chargement...
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Patient Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map(patient => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onViewDetails={setSelectedPatient}
                showCabinetInfo={true}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredPatients.length === 0 && !isLoadingPatients && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('dashboard.empty.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('dashboard.empty.subtitle')}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {t('dashboard.empty.reset')}
                </button>
                <button
                  onClick={() => setShowAddPatientModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Ajouter un patient
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Section Consultations */}
      {activeTab === 'consultations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('patient.modal.consultations')}</h2>
              <p className="text-gray-600">
                {consultationsFromDB.length} {t('cabinet.tabs.consultations').toLowerCase()}
                {isLoadingConsultations && (
                  <span className="ml-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 inline animate-spin mr-1" />
                    Chargement...
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowConsultationModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('patient.modal.new.consultation')}
            </button>
          </div>

          {isLoadingConsultations ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Chargement des consultations...</p>
            </div>
          ) : consultationsFromDB.length > 0 ? (
            <div className="grid gap-4">
              {consultationsFromDB.map((consultation) => (
                <div key={consultation.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap flex-col-reverse md:flex-nowrap md:flex-row items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                          <Stethoscope className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{consultation.motif}</h3>
                          <p className="text-sm text-gray-600">
                            {t('common.patient')}: {(consultation as any).patients?.prenom} {(consultation as any).patients?.nom}
                          </p>
                          {consultation.external_id && (
                            <p className="text-xs text-blue-600">ID: {consultation.external_id}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getConsultationStatusColor(consultation.statut)}`}>
                          {getConsultationStatusText(consultation.statut)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">{t('common.date')} & {t('common.time')}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(consultation.date), 'dd/MM/yyyy à HH:mm', { locale })}
                          </p>
                          <p className="text-xs text-gray-600">{t('common.duration')}: {consultation.duree} min</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">{t('common.diagnosis')}</p>
                          <p className="text-sm text-gray-900">{consultation.diagnostic}</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">{t('common.amount')}</p>
                          <p className="text-sm font-medium text-gray-900">{consultation.tarif}€</p>
                          <p className="text-xs text-gray-600">{consultation.medecin_nom}</p>
                        </div>
                      </div>

                      {consultation.traitement && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                          <p className="text-xs font-medium text-blue-800 mb-1">{t('common.treatment')}</p>
                          <p className="text-sm text-blue-900">{consultation.traitement}</p>
                        </div>
                      )}

                      {consultation.observations && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-green-800 mb-1">Observations</p>
                          <p className="text-sm text-green-900">{consultation.observations}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditConsultation(consultation)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune consultation trouvée
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par créer votre première consultation
              </p>
              <button
                onClick={() => setShowConsultationModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {t('patient.modal.new.consultation')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Section Factures */}
      {activeTab === 'factures' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('patient.modal.invoices')}</h2>
              <p className="text-gray-600">
                {facturesFromDB.length} {t('cabinet.tabs.invoices').toLowerCase()}
                {isLoadingFactures && (
                  <span className="ml-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 inline animate-spin mr-1" />
                    {t('invoice.load')}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowFactureModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t('patient.modal.new.invoice')}
            </button>
          </div>

          {isLoadingFactures ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-gray-600">{t('invoice.load.facture')}</p>
            </div>
          ) : facturesFromDB.length > 0 ? (
            <div className="grid gap-4">
              {facturesFromDB.map((facture) => (
                <div key={facture.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap flex-col-reverse md:flex-nowrap md:flex-row items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{t('invoice')} {facture.numero}</h3>
                          <p className="text-sm text-gray-600">
                            {t('common.patient')}: {(facture as any).patients?.prenom} {(facture as any).patients?.nom}
                          </p>
                          {facture.external_id && (
                            <p className="text-xs text-purple-600">ID: {facture.external_id}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getFactureStatusColor(facture.statut)}`}>
                          {getFactureStatusText(facture.statut)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">{t('common.date')}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(facture.date), 'dd/MM/yyyy', { locale })}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">{t('common.total')}</p>
                          <p className="text-sm font-bold text-gray-900">{facture.montant_total}€</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">{t('invoice.paid')}</p>
                          <p className="text-sm font-medium text-green-600">{facture.montant_paye}€</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">{t('invoice.amount_due')}</p>
                          <p className={`text-sm font-bold ${facture.montant_restant > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {facture.montant_restant}€
                          </p>
                        </div>
                      </div>

                      {(facture as any).facture_details && (facture as any).facture_details.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                          <p className="text-xs font-medium text-blue-800 mb-2">{t('invoice.details')}</p>
                          {(facture as any).facture_details.map((detail: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm text-blue-900">
                              <span>{detail.description} (x{detail.quantite})</span>
                              <span className="font-medium">{detail.total}€</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {facture.remboursement_securite_sociale > 0 && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-green-800 mb-2">{t('invoice.reimbursement')}</p>
                          <div className="grid grid-cols-3 gap-4 text-sm text-green-900">
                            <div>
                              <span className="text-xs text-green-600">{t('invoice.social_security')}</span>
                              <p className="font-medium">{facture.remboursement_securite_sociale}€</p>
                            </div>
                            <div>
                              <span className="text-xs text-green-600">{t('invoice.mutual_insurance')}</span>
                              <p className="font-medium">{facture.remboursement_mutuelle}€</p>
                            </div>
                            <div>
                              <span className="text-xs text-green-600">{t('invoice.out_of_pocket')}</span>
                              <p className="font-medium">{facture.remboursement_reste_a_charge}€</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditFacture(facture)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {facture.statut === 'en_attente' && (
                        <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('invoice.none_found')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('invoice.start_create')}
              </p>
              <button
                onClick={() => setShowFactureModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {t('patient.modal.new.invoice')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Section Rendez-vous */}
      {activeTab === 'rendez-vous' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('patient.modal.appointments')}</h2>
              <p className="text-gray-600">
                {rendezVousFromDB.length} {t('cabinet.tabs.appointments').toLowerCase()}
                {isLoadingRendezVous && (
                  <span className="ml-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 inline animate-spin mr-1" />
                    
                    {t('appointments.load')}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowRendezVousModal(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {t('patient.modal.new.appointment')}
            </button>
          </div>

          {isLoadingRendezVous ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
              <p className="text-gray-600">{t('appointment.loading')}</p>
            </div>
          ) : rendezVousFromDB.length > 0 ? (
            <div className="grid gap-4">
              {rendezVousFromDB.map((rdv) => (
                <div key={rdv.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap flex-col-reverse md:flex-nowrap md:flex-row items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{rdv.motif}</h3>
                          <p className="text-sm text-gray-600">{t('common.patient')}: {rdv.patient_nom}</p>
                          {rdv.external_id && (
                            <p className="text-xs text-orange-600">ID: {rdv.external_id}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getRdvStatusColor(rdv.statut)}`}>
                          {getRdvStatusText(rdv.statut)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">{t('common.date')}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(rdv.date), 'dd/MM/yyyy', { locale })}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Horaire</p>
                          <p className="text-sm font-medium text-gray-900">{rdv.heure_debut} - {rdv.heure_fin}</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Type</p>
                          <p className="text-sm text-gray-900 capitalize">{rdv.type}</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Lieu</p>
                          <p className="text-sm text-gray-900">{rdv.salle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          {rdv.rappel_envoye ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={rdv.rappel_envoye ? 'text-green-600' : 'text-red-600'}>
                            {rdv.rappel_envoye ? 'Rappel envoyé' : 'Rappel non envoyé'}
                          </span>
                        </div>
                        
                        {rdv.notes && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>{t('common.notes')} disponibles</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {rdv.statut === 'programme' && (
                        <button className="p-2 text-green-600 hover: bg-green-100 rounded-lg transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun rendez-vous trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par créer votre premier rendez-vous
              </p>
              <button
                onClick={() => setShowRendezVousModal(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                {t('patient.modal.new.appointment')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          showCabinetFeatures={true}
          onPatientUpdated={handleDataUpdated}
        />
      )}

      {showConsultationModal && (
        <ConsultationModal
          onClose={() => {
            setShowConsultationModal(false);
            handleDataUpdated();
          }}
        />
      )}

      {showFactureModal && (
        <FactureModal
          onClose={() => {
            setShowFactureModal(false);
            handleDataUpdated();
          }}
        />
      )}

      {showRendezVousModal && (
        <RendezVousModal
          onClose={() => {
            setShowRendezVousModal(false);
            handleDataUpdated();
          }}
        />
      )}

      {showAddPatientModal && (
        <AddPatientModal
          isOpen={showAddPatientModal}
          onClose={() => setShowAddPatientModal(false)}
          onPatientAdded={handlePatientAdded}
        />
      )}

      {showEditFactureModal && selectedFacture && (
        <EditFactureModal
          facture={selectedFacture}
          isOpen={showEditFactureModal}
          onClose={() => {
            setShowEditFactureModal(false);
            setSelectedFacture(null);
          }}
          onFactureUpdated={() => {
            handleDataUpdated();
            setShowEditFactureModal(false);
            setSelectedFacture(null);
          }}
        />
      )}

      {showEditConsultationModal && selectedConsultation && (
        <EditConsultationModal
          consultation={selectedConsultation}
          isOpen={showEditConsultationModal}
          onClose={() => {
            setShowEditConsultationModal(false);
            setSelectedConsultation(null);
          }}
          onConsultationUpdated={() => {
            handleDataUpdated();
            setShowEditConsultationModal(false);
            setSelectedConsultation(null);
          }}
        />
      )}
    </div>
  );
};