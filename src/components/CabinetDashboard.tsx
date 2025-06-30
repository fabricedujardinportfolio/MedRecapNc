import React, { useState, useMemo, useEffect } from 'react';
import { SearchFilters } from './SearchFilters';
import { PatientCard } from './PatientCard';
import { PatientModal } from './PatientModal';
import { mockPatients } from '../data/mockPatients';
import { updatePatientsWithCabinetData } from '../data/mockCabinetData';
import { Patient, SearchFilters as SearchFiltersType, Consultation, Facture, RendezVous } from '../types/Patient';
import { useLanguage } from '../hooks/useLanguage';
import { AddPatientModal } from './AddPatientModal';
import { ConsultationModal } from './ConsultationModal';
import { FactureModal } from './FactureModal';
import { RendezVousModal } from './RendezVousModal';
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Clock,
  Calendar,
  Stethoscope,
  FileText,
  Plus,
  Euro,
  Search,
  Filter,
  RefreshCw,
  UserPlus
} from 'lucide-react';

export const CabinetDashboard: React.FC = () => {
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'consultations' | 'factures' | 'rendez-vous'>('patients');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [showRendezVousModal, setShowRendezVousModal] = useState(false);
  const [cabinetPatients, setCabinetPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  // Charger les données du cabinet
  useEffect(() => {
    // Simuler un chargement asynchrone
    setIsLoading(true);
    setTimeout(() => {
      const patientsWithCabinetData = updatePatientsWithCabinetData(mockPatients);
      setCabinetPatients(patientsWithCabinetData);
      
      // Extraire toutes les consultations
      const allConsultations: Consultation[] = [];
      patientsWithCabinetData.forEach(patient => {
        if (patient.consultations && patient.consultations.length > 0) {
          allConsultations.push(...patient.consultations);
        }
      });
      setConsultations(allConsultations);
      
      // Extraire toutes les factures
      const allFactures: Facture[] = [];
      patientsWithCabinetData.forEach(patient => {
        if (patient.factures && patient.factures.length > 0) {
          allFactures.push(...patient.factures);
        }
      });
      setFactures(allFactures);
      
      // Extraire tous les rendez-vous
      const allRendezVous: RendezVous[] = [];
      patientsWithCabinetData.forEach(patient => {
        if (patient.rendezVous && patient.rendezVous.length > 0) {
          allRendezVous.push(...patient.rendezVous);
        }
      });
      setRendezVous(allRendezVous);
      
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter patients based on search criteria
  const filteredPatients = useMemo(() => {
    return cabinetPatients.filter(patient => {
      // Name filter
      if (filters.nom) {
        const searchTerm = filters.nom.toLowerCase();
        const fullName = `${patient.prenom} ${patient.nom}`.toLowerCase();
        if (!fullName.includes(searchTerm)) return false;
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

      // Type patient filter
      if (filters.typePatient && filters.typePatient !== 'tous' && patient.typePatient !== filters.typePatient) return false;

      // Prochain rendez-vous filter
      if (filters.prochainRendezVous) {
        // Vérifier si le patient a un rendez-vous à venir
        const hasUpcomingAppointment = patient.rendezVous && patient.rendezVous.some(rdv => {
          const rdvDate = new Date(rdv.date);
          const today = new Date();
          return rdvDate >= today && (rdv.statut === 'programme' || rdv.statut === 'confirme');
        });
        if (!hasUpcomingAppointment) return false;
      }

      return true;
    });
  }, [filters, cabinetPatients]);

  // Filter consultations
  const filteredConsultations = useMemo(() => {
    return consultations
      .filter(consultation => {
        // Name filter (via patient)
        if (filters.nom) {
          const patient = cabinetPatients.find(p => p.id === consultation.patientId);
          if (patient) {
            const searchTerm = filters.nom.toLowerCase();
            const fullName = `${patient.prenom} ${patient.nom}`.toLowerCase();
            if (!fullName.includes(searchTerm)) return false;
          } else {
            return false;
          }
        }

        // Date filter
        if (filters.dateAdmissionDebut) {
          const consultationDate = new Date(consultation.date);
          const filterDate = new Date(filters.dateAdmissionDebut);
          if (consultationDate < filterDate) return false;
        }

        if (filters.dateAdmissionFin) {
          const consultationDate = new Date(consultation.date);
          const filterDate = new Date(filters.dateAdmissionFin);
          if (consultationDate > filterDate) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filters, consultations, cabinetPatients]);

  // Filter factures
  const filteredFactures = useMemo(() => {
    return factures
      .filter(facture => {
        // Name filter (via patient)
        if (filters.nom) {
          const patient = cabinetPatients.find(p => p.id === facture.patientId);
          if (patient) {
            const searchTerm = filters.nom.toLowerCase();
            const fullName = `${patient.prenom} ${patient.nom}`.toLowerCase();
            if (!fullName.includes(searchTerm)) return false;
          } else {
            return false;
          }
        }

        // Date filter
        if (filters.dateAdmissionDebut) {
          const factureDate = new Date(facture.date);
          const filterDate = new Date(filters.dateAdmissionDebut);
          if (factureDate < filterDate) return false;
        }

        if (filters.dateAdmissionFin) {
          const factureDate = new Date(facture.date);
          const filterDate = new Date(filters.dateAdmissionFin);
          if (factureDate > filterDate) return false;
        }

        // Status filter
        if (filters.statutFacture && facture.statut !== filters.statutFacture) return false;

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filters, factures, cabinetPatients]);

  // Filter rendez-vous
  const filteredRendezVous = useMemo(() => {
    return rendezVous
      .filter(rdv => {
        // Name filter
        if (filters.nom) {
          const searchTerm = filters.nom.toLowerCase();
          const fullName = rdv.patientNom.toLowerCase();
          if (!fullName.includes(searchTerm)) return false;
        }

        // Date filter
        if (filters.dateAdmissionDebut) {
          const rdvDate = new Date(rdv.date);
          const filterDate = new Date(filters.dateAdmissionDebut);
          if (rdvDate < filterDate) return false;
        }

        if (filters.dateAdmissionFin) {
          const rdvDate = new Date(rdv.date);
          const filterDate = new Date(filters.dateAdmissionFin);
          if (rdvDate > filterDate) return false;
        }

        // Prochain rendez-vous filter
        if (filters.prochainRendezVous) {
          const rdvDate = new Date(rdv.date);
          const today = new Date();
          return rdvDate >= today && (rdv.statut === 'programme' || rdv.statut === 'confirme');
        }

        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filters, rendezVous]);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      patients: {
        total: cabinetPatients.length,
        nouveaux: cabinetPatients.filter(p => new Date(p.dateAdmission) >= firstDayOfMonth).length,
        actifs: cabinetPatients.filter(p => p.statut === 'Actif').length
      },
      consultations: {
        aujourdhui: consultations.filter(c => new Date(c.date) >= today).length,
        semaine: consultations.filter(c => new Date(c.date) >= oneWeekAgo).length,
        mois: consultations.filter(c => new Date(c.date) >= firstDayOfMonth).length
      },
      rendezVous: {
        aujourdhui: rendezVous.filter(r => r.date === today.toISOString().split('T')[0]).length,
        semaine: rendezVous.filter(r => new Date(r.date) >= oneWeekAgo && new Date(r.date) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)).length,
        enAttente: rendezVous.filter(r => new Date(r.date) >= today && (r.statut === 'programme' || r.statut === 'confirme')).length
      },
      finances: {
        chiffreAffaireMois: factures
          .filter(f => new Date(f.date) >= firstDayOfMonth)
          .reduce((sum, f) => sum + f.montantTotal, 0),
        facturenAttente: factures.filter(f => f.statut === 'en_attente' || f.statut === 'partiellement_payee').length,
        tauxRecouvrement: factures.length > 0 
          ? (factures.filter(f => f.statut === 'payee').length / factures.length) * 100 
          : 0
      }
    };
  }, [cabinetPatients, consultations, rendezVous, factures]);

  const resetFilters = () => {
    setFilters({});
  };

  const handlePatientAdded = (newPatient: any) => {
    setCabinetPatients(prev => [newPatient, ...prev]);
  };

  const handleDataRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const patientsWithCabinetData = updatePatientsWithCabinetData(mockPatients);
      setCabinetPatients(patientsWithCabinetData);
      
      // Extraire toutes les consultations
      const allConsultations: Consultation[] = [];
      patientsWithCabinetData.forEach(patient => {
        if (patient.consultations && patient.consultations.length > 0) {
          allConsultations.push(...patient.consultations);
        }
      });
      setConsultations(allConsultations);
      
      // Extraire toutes les factures
      const allFactures: Facture[] = [];
      patientsWithCabinetData.forEach(patient => {
        if (patient.factures && patient.factures.length > 0) {
          allFactures.push(...patient.factures);
        }
      });
      setFactures(allFactures);
      
      // Extraire tous les rendez-vous
      const allRendezVous: RendezVous[] = [];
      patientsWithCabinetData.forEach(patient => {
        if (patient.rendezVous && patient.rendezVous.length > 0) {
          allRendezVous.push(...patient.rendezVous);
        }
      });
      setRendezVous(allRendezVous);
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <p className="text-3xl font-bold text-green-600">{stats.consultations.mois}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Stethoscope className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500">
              {stats.consultations.aujourdhui} {t('cabinet.stats.today')}
            </span>
            <span className="mx-2">•</span>
            <span className="text-gray-500">
              {stats.consultations.semaine} {t('cabinet.stats.week')}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('cabinet.stats.appointments')}</p>
              <p className="text-3xl font-bold text-orange-600">{stats.rendezVous.enAttente}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500">
              {stats.rendezVous.aujourdhui} {t('cabinet.stats.today')}
            </span>
            <span className="mx-2">•</span>
            <span className="text-gray-500">
              {stats.rendezVous.semaine} {t('cabinet.stats.week')}
            </span>
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
            <span className="text-gray-500">
              {stats.finances.facturenAttente} {t('cabinet.stats.waiting')}
            </span>
            <span className="mx-2">•</span>
            <span className="text-gray-500">
              {stats.finances.tauxRecouvrement.toFixed(1)}% {t('cabinet.stats.pending')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('cabinet.actions.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowConsultationModal(true)}
            className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{t('cabinet.actions.consultation')}</span>
          </button>
          
          <button
            onClick={() => setShowRendezVousModal(true)}
            className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{t('cabinet.actions.appointment')}</span>
          </button>
          
          <button
            onClick={() => setShowFactureModal(true)}
            className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{t('cabinet.actions.invoice')}</span>
          </button>
          
          <button
            onClick={() => setShowAddPatientModal(true)}
            className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{t('cabinet.actions.patient')}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilters 
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        showCabinetFilters={true}
      />

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'patients'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('cabinet.tabs.patients')}
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'consultations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('cabinet.tabs.consultations')}
            </button>
            <button
              onClick={() => setActiveTab('factures')}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'factures'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('cabinet.tabs.invoices')}
            </button>
            <button
              onClick={() => setActiveTab('rendez-vous')}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'rendez-vous'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('cabinet.tabs.appointments')}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Header with refresh button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'patients' && t('cabinet.tabs.patients')}
                {activeTab === 'consultations' && t('cabinet.tabs.consultations')}
                {activeTab === 'factures' && t('cabinet.tabs.invoices')}
                {activeTab === 'rendez-vous' && t('cabinet.tabs.appointments')}
              </h2>
              <p className="text-gray-600">
                {activeTab === 'patients' && `${filteredPatients.length} ${filteredPatients.length === 1 ? t('dashboard.results.found') : t('dashboard.results.found.plural')}`}
                {activeTab === 'consultations' && `${filteredConsultations.length} ${filteredConsultations.length === 1 ? 'consultation' : 'consultations'}`}
                {activeTab === 'factures' && `${filteredFactures.length} ${filteredFactures.length === 1 ? 'facture' : 'factures'}`}
                {activeTab === 'rendez-vous' && `${filteredRendezVous.length} ${filteredRendezVous.length === 1 ? 'rendez-vous' : 'rendez-vous'}`}
              </p>
            </div>
            <button
              onClick={handleDataRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? t('common.loading') : 'Actualiser'}</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          ) : (
            <>
              {/* Patients Tab */}
              {activeTab === 'patients' && (
                <>
                  {filteredPatients.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t('dashboard.empty.title')}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {t('dashboard.empty.subtitle')}
                      </p>
                      <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        {t('dashboard.empty.reset')}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Consultations Tab */}
              {activeTab === 'consultations' && (
                <>
                  {filteredConsultations.length > 0 ? (
                    <div className="space-y-4">
                      {filteredConsultations.map(consultation => {
                        const patient = cabinetPatients.find(p => p.id === consultation.patientId);
                        return (
                          <div key={consultation.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                                  <Stethoscope className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu'}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {new Date(consultation.date).toLocaleDateString()} - {consultation.motif}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                  consultation.statut === 'terminee' ? 'bg-green-100 text-green-800' :
                                  consultation.statut === 'en_cours' ? 'bg-orange-100 text-orange-800' :
                                  consultation.statut === 'programmee' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {consultation.statut}
                                </span>
                                <button
                                  onClick={() => patient && setSelectedPatient(patient)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Search className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune consultation trouvée
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Essayez de modifier vos critères de recherche
                      </p>
                      <button
                        onClick={() => setShowConsultationModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Nouvelle consultation
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Factures Tab */}
              {activeTab === 'factures' && (
                <>
                  {filteredFactures.length > 0 ? (
                    <div className="space-y-4">
                      {filteredFactures.map(facture => {
                        const patient = cabinetPatients.find(p => p.id === facture.patientId);
                        return (
                          <div key={facture.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                                  <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu'}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Facture {facture.numero} - {new Date(facture.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                  facture.statut === 'payee' ? 'bg-green-100 text-green-800' :
                                  facture.statut === 'en_attente' ? 'bg-orange-100 text-orange-800' :
                                  facture.statut === 'partiellement_payee' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {facture.statut}
                                </span>
                                <span className="text-sm font-medium">
                                  {facture.montantTotal}€
                                </span>
                                <button
                                  onClick={() => patient && setSelectedPatient(patient)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Search className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune facture trouvée
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Essayez de modifier vos critères de recherche
                      </p>
                      <button
                        onClick={() => setShowFactureModal(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Nouvelle facture
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Rendez-vous Tab */}
              {activeTab === 'rendez-vous' && (
                <>
                  {filteredRendezVous.length > 0 ? (
                    <div className="space-y-4">
                      {filteredRendezVous.map(rdv => {
                        const isUpcoming = new Date(rdv.date) >= new Date() && (rdv.statut === 'programme' || rdv.statut === 'confirme');
                        return (
                          <div 
                            key={rdv.id} 
                            className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                              isUpcoming ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                                  isUpcoming ? 'bg-orange-100' : 'bg-gray-100'
                                }`}>
                                  <Calendar className={`w-5 h-5 ${
                                    isUpcoming ? 'text-orange-600' : 'text-gray-600'
                                  }`} />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {rdv.patientNom}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {new Date(rdv.date).toLocaleDateString()} - {rdv.heureDebut} à {rdv.heureFin}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {rdv.motif} - {rdv.medecinNom}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                  rdv.statut === 'confirme' ? 'bg-green-100 text-green-800' :
                                  rdv.statut === 'programme' ? 'bg-blue-100 text-blue-800' :
                                  rdv.statut === 'en_cours' ? 'bg-orange-100 text-orange-800' :
                                  rdv.statut === 'termine' ? 'bg-gray-100 text-gray-800' :
                                  rdv.statut === 'annule' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {rdv.statut}
                                </span>
                                <button
                                  onClick={() => {
                                    const patient = cabinetPatients.find(p => p.id === rdv.patientId);
                                    if (patient) setSelectedPatient(patient);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Search className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun rendez-vous trouvé
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Essayez de modifier vos critères de recherche
                      </p>
                      <button
                        onClick={() => setShowRendezVousModal(true)}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                      >
                        Nouveau rendez-vous
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Patient Modal */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          showCabinetFeatures={true}
          onPatientUpdated={handleDataRefresh}
        />
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <AddPatientModal
          isOpen={showAddPatientModal}
          onClose={() => setShowAddPatientModal(false)}
          onPatientAdded={handlePatientAdded}
        />
      )}

      {/* Consultation Modal */}
      {showConsultationModal && (
        <ConsultationModal
          onClose={() => {
            setShowConsultationModal(false);
            handleDataRefresh();
          }}
        />
      )}

      {/* Facture Modal */}
      {showFactureModal && (
        <FactureModal
          onClose={() => {
            setShowFactureModal(false);
            handleDataRefresh();
          }}
        />
      )}

      {/* Rendez-vous Modal */}
      {showRendezVousModal && (
        <RendezVousModal
          onClose={() => {
            setShowRendezVousModal(false);
            handleDataRefresh();
          }}
        />
      )}
    </div>
  );
};