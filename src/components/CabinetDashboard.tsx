import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  FileText, 
  Stethoscope, 
  Euro, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  Edit, 
  Eye, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { PatientCard } from './PatientCard';
import { SearchFilters } from './SearchFilters';
import { mockPatients } from '../data/mockPatients';
import { updatePatientsWithCabinetData } from '../data/mockCabinetData';
import { mockCabinetStats } from '../data/mockCabinetData';
import { PatientModal } from './PatientModal';
import { AddPatientModal } from './AddPatientModal';
import { ConsultationModal } from './ConsultationModal';
import { RendezVousModal } from './RendezVousModal';
import { FactureModal } from './FactureModal';
import { EditConsultationModal } from './EditConsultationModal';
import { EditFactureModal } from './EditFactureModal';
import { EditRendezVousModal } from './EditRendezVousModal';
import { Patient, SearchFilters as SearchFiltersType, Consultation, Facture, RendezVous } from '../types/Patient';
import { useLanguage } from '../hooks/useLanguage';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { patientService } from '../services/patientService';

export const CabinetDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const locale = language === 'fr' ? fr : enUS;
  
  const [activeTab, setActiveTab] = useState<'patients' | 'consultations' | 'factures' | 'rendez-vous'>('patients');
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [stats, setStats] = useState(mockCabinetStats);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showRendezVousModal, setShowRendezVousModal] = useState(false);
  const [showFactureModal, setShowFactureModal] = useState(false);
  
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [selectedRendezVous, setSelectedRendezVous] = useState<RendezVous | null>(null);
  
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    type: 'consultation' | 'facture' | 'rendez-vous';
    id: string;
    visible: boolean;
  } | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be API calls
        const patientsData = updatePatientsWithCabinetData(mockPatients);
        setPatients(patientsData);
        
        // Extract all consultations, factures, and rendez-vous
        const allConsultations: Consultation[] = [];
        const allFactures: Facture[] = [];
        const allRendezVous: RendezVous[] = [];
        
        patientsData.forEach(patient => {
          if (patient.consultations) {
            allConsultations.push(...patient.consultations);
          }
          if (patient.factures) {
            allFactures.push(...patient.factures);
          }
          if (patient.rendezVous) {
            allRendezVous.push(...patient.rendezVous);
          }
        });
        
        setConsultations(allConsultations);
        setFactures(allFactures);
        setRendezVous(allRendezVous);
        
        // Update stats
        setStats({
          ...stats,
          patients: {
            total: patientsData.length,
            nouveaux: patientsData.filter(p => new Date(p.dateAdmission) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
            actifs: patientsData.filter(p => p.statut === 'Actif').length
          },
          consultations: {
            ...stats.consultations,
            aujourdhui: allConsultations.filter(c => new Date(c.date).toDateString() === new Date().toDateString()).length,
            semaine: allConsultations.filter(c => new Date(c.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
          },
          rendezVous: {
            ...stats.rendezVous,
            aujourdhui: allRendezVous.filter(r => r.date === new Date().toISOString().split('T')[0]).length,
            enAttente: allRendezVous.filter(r => r.statut === 'programme' || r.statut === 'confirme').length,
          },
          finances: {
            ...stats.finances,
            facturenAttente: allFactures.filter(f => f.statut === 'en_attente' || f.statut === 'partiellement_payee').length,
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter patients based on search criteria
  const filteredPatients = React.useMemo(() => {
    return patients.filter(patient => {
      // Name filter
      if (filters.nom) {
        const searchTerm = filters.nom.toLowerCase();
        const fullName = `${patient.prenom} ${patient.nom}`.toLowerCase();
        if (!fullName.includes(searchTerm)) return false;
      }

      // Type patient filter
      if (filters.typePatient && filters.typePatient !== 'tous' && patient.typePatient !== filters.typePatient) {
        return false;
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

      // Prochain RDV filter
      if (filters.prochainRendezVous && !patient.prochainRendezVous) {
        return false;
      }

      return true;
    });
  }, [filters, patients]);

  const resetFilters = () => {
    setFilters({});
  };

  const handlePatientAdded = (newPatient: any) => {
    setPatients(prev => [newPatient, ...prev]);
    setStats(prev => ({
      ...prev,
      patients: {
        ...prev.patients,
        total: prev.patients.total + 1,
        nouveaux: prev.patients.nouveaux + 1,
        actifs: prev.patients.actifs + 1
      }
    }));
  };

  const handleConsultationCreated = () => {
    // In a real app, we would refresh the data from the API
    console.log('Consultation created');
    // For now, just close the modal
    setShowConsultationModal(false);
  };

  const handleRendezVousCreated = () => {
    // In a real app, we would refresh the data from the API
    console.log('Rendez-vous created');
    // For now, just close the modal
    setShowRendezVousModal(false);
  };

  const handleFactureCreated = () => {
    // In a real app, we would refresh the data from the API
    console.log('Facture created');
    // For now, just close the modal
    setShowFactureModal(false);
  };

  const handleConsultationUpdated = () => {
    // In a real app, we would refresh the data from the API
    console.log('Consultation updated');
    setSelectedConsultation(null);
  };

  const handleFactureUpdated = () => {
    // In a real app, we would refresh the data from the API
    console.log('Facture updated');
    setSelectedFacture(null);
  };

  const handleRendezVousUpdated = () => {
    // In a real app, we would refresh the data from the API
    console.log('Rendez-vous updated');
    setSelectedRendezVous(null);
  };

  const handleDeleteItem = async () => {
    if (!showDeleteConfirmation) return;
    
    const { type, id } = showDeleteConfirmation;
    
    try {
      switch (type) {
        case 'consultation':
          await patientService.deleteConsultation(id);
          setConsultations(prev => prev.filter(c => c.id !== id));
          break;
        case 'facture':
          await patientService.deleteFacture(id);
          setFactures(prev => prev.filter(f => f.id !== id));
          break;
        case 'rendez-vous':
          await patientService.deleteRendezVous(id);
          setRendezVous(prev => prev.filter(r => r.id !== id));
          break;
      }
      
      // Update the patient's data if a patient is selected
      if (selectedPatient) {
        const updatedPatient = { ...selectedPatient };
        
        if (type === 'consultation') {
          updatedPatient.consultations = updatedPatient.consultations.filter(c => c.id !== id);
        } else if (type === 'facture') {
          updatedPatient.factures = updatedPatient.factures.filter(f => f.id !== id);
        } else if (type === 'rendez-vous') {
          updatedPatient.rendezVous = updatedPatient.rendezVous.filter(r => r.id !== id);
        }
        
        setSelectedPatient(updatedPatient);
      }
      
      console.log(`${type} with ID ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    } finally {
      setShowDeleteConfirmation(null);
    }
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
            <span className="text-green-600">+{stats.patients.nouveaux}</span>
            <span className="text-gray-500 ml-1">{t('cabinet.stats.new.month')}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('cabinet.stats.consultations')}</p>
              <p className="text-3xl font-bold text-green-600">{stats.consultations.aujourdhui}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Stethoscope className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500">{stats.consultations.semaine} {t('cabinet.stats.week')}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('cabinet.stats.appointments')}</p>
              <p className="text-3xl font-bold text-orange-600">{stats.rendezVous.aujourdhui}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500">{stats.rendezVous.enAttente} {t('cabinet.stats.waiting')}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('cabinet.stats.revenue')}</p>
              <p className="text-3xl font-bold text-purple-600">{stats.finances.chiffreAffaireMois.toLocaleString()} €</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Euro className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500">{stats.finances.facturenAttente} {t('cabinet.stats.pending')}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('cabinet.actions.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowConsultationModal(true)}
            className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Stethoscope className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">{t('cabinet.actions.consultation')}</span>
          </button>
          
          <button
            onClick={() => setShowRendezVousModal(true)}
            className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <Calendar className="w-6 h-6 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">{t('cabinet.actions.appointment')}</span>
          </button>
          
          <button
            onClick={() => setShowFactureModal(true)}
            className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <FileText className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">{t('cabinet.actions.invoice')}</span>
          </button>
          
          <button
            onClick={() => setShowAddPatientModal(true)}
            className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <UserPlus className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">{t('cabinet.actions.patient')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-wrap border-b border-gray-200">
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'patients'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            {t('cabinet.tabs.patients')}
          </button>
          
          <button
            onClick={() => setActiveTab('consultations')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'consultations'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Stethoscope className="w-4 h-4 inline-block mr-2" />
            {t('cabinet.tabs.consultations')}
          </button>
          
          <button
            onClick={() => setActiveTab('factures')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'factures'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            {t('cabinet.tabs.invoices')}
          </button>
          
          <button
            onClick={() => setActiveTab('rendez-vous')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'rendez-vous'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 inline-block mr-2" />
            {t('cabinet.tabs.appointments')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <div>
              <SearchFilters 
                filters={filters}
                onFiltersChange={setFilters}
                onReset={resetFilters}
                showCabinetFilters={true}
              />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t('cabinet.tabs.patients')}
                  </h2>
                  <p className="text-gray-600">
                    {filteredPatients.length} {filteredPatients.length === 1 ? t('dashboard.results.found') : t('dashboard.results.found.plural')}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPatientModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('cabinet.actions.patient')}</span>
                </button>
              </div>
              
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
              
              {filteredPatients.length === 0 && (
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
            </div>
          )}

          {/* Consultations Tab */}
          {activeTab === 'consultations' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t('cabinet.tabs.consultations')}
                  </h2>
                  <p className="text-gray-600">
                    {consultations.length} {consultations.length === 1 ? 'consultation' : 'consultations'}
                  </p>
                </div>
                <button
                  onClick={() => setShowConsultationModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('cabinet.actions.consultation')}</span>
                </button>
              </div>
              
              {consultations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.patient')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.date')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.reason')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.status')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.doctor')}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {consultations
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((consultation) => {
                          // Find the patient for this consultation
                          const patient = patients.find(p => p.id === consultation.patientId);
                          
                          return (
                            <tr key={consultation.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {patient ? `${patient.prenom} ${patient.nom}` : 'Unknown Patient'}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {format(new Date(consultation.date), 'dd/MM/yyyy HH:mm', { locale })}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-900 truncate max-w-xs">
                                  {consultation.motif}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  consultation.statut === 'terminee' ? 'bg-green-100 text-green-800' :
                                  consultation.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                                  consultation.statut === 'programmee' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {t(`consultation.status.${consultation.statut}`)}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {consultation.medecinNom}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setSelectedConsultation(consultation)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirmation({
                                      type: 'consultation',
                                      id: consultation.id,
                                      visible: true
                                    })}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('consultation.none_found')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('consultation.start_create')}
                  </p>
                  <button
                    onClick={() => setShowConsultationModal(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    {t('cabinet.actions.consultation')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Factures Tab */}
          {activeTab === 'factures' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t('cabinet.tabs.invoices')}
                  </h2>
                  <p className="text-gray-600">
                    {factures.length} {factures.length === 1 ? 'facture' : 'factures'}
                  </p>
                </div>
                <button
                  onClick={() => setShowFactureModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('cabinet.actions.invoice')}</span>
                </button>
              </div>
              
              {factures.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.patient')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('invoice.number')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.date')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.amount')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.status')}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {factures
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((facture) => {
                          // Find the patient for this facture
                          const patient = patients.find(p => p.id === facture.patientId);
                          
                          return (
                            <tr key={facture.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {patient ? `${patient.prenom} ${patient.nom}` : 'Unknown Patient'}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {facture.numero}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {format(new Date(facture.date), 'dd/MM/yyyy', { locale })}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {facture.montantTotal.toFixed(2)} €
                                </div>
                                <div className="text-xs text-gray-500">
                                  {t('common.paid')}: {facture.montantPaye.toFixed(2)} €
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  facture.statut === 'payee' ? 'bg-green-100 text-green-800' :
                                  facture.statut === 'partiellement_payee' ? 'bg-yellow-100 text-yellow-800' :
                                  facture.statut === 'en_attente' ? 'bg-blue-100 text-blue-800' :
                                  facture.statut === 'en_retard' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {t(`invoice.status.${facture.statut}`)}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setSelectedFacture(facture)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirmation({
                                      type: 'facture',
                                      id: facture.id,
                                      visible: true
                                    })}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
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
                    {t('cabinet.actions.invoice')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Rendez-vous Tab */}
          {activeTab === 'rendez-vous' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t('cabinet.tabs.appointments')}
                  </h2>
                  <p className="text-gray-600">
                    {rendezVous.length} {rendezVous.length === 1 ? 'rendez-vous' : 'rendez-vous'}
                  </p>
                </div>
                <button
                  onClick={() => setShowRendezVousModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('cabinet.actions.appointment')}</span>
                </button>
              </div>
              
              {rendezVous.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.patient')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.date')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('appointment.time')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.reason')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.status')}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('common.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rendezVous
                        .sort((a, b) => {
                          // Sort by date first
                          const dateA = new Date(a.date);
                          const dateB = new Date(b.date);
                          if (dateA.getTime() !== dateB.getTime()) {
                            return dateA.getTime() - dateB.getTime();
                          }
                          // Then by time
                          return a.heureDebut.localeCompare(b.heureDebut);
                        })
                        .map((rdv) => (
                          <tr key={rdv.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {rdv.patientNom}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {format(new Date(rdv.date), 'dd/MM/yyyy', { locale })}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {rdv.heureDebut} - {rdv.heureFin}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900 truncate max-w-xs">
                                {rdv.motif}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                rdv.statut === 'confirme' ? 'bg-green-100 text-green-800' :
                                rdv.statut === 'programme' ? 'bg-blue-100 text-blue-800' :
                                rdv.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                                rdv.statut === 'termine' ? 'bg-gray-100 text-gray-800' :
                                rdv.statut === 'annule' ? 'bg-red-100 text-red-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {t(`appointment.status.${rdv.statut}`)}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {rdv.rappelEnvoye ? (
                                  <span className="text-green-600">{t('appointment.reminder_sent')}</span>
                                ) : (
                                  <span className="text-gray-500">{t('appointment.reminder_not_sent')}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedRendezVous(rdv)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirmation({
                                    type: 'rendez-vous',
                                    id: rdv.id,
                                    visible: true
                                  })}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('appointment.none_found')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('appointment.start_create')}
                  </p>
                  <button
                    onClick={() => setShowRendezVousModal(true)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    {t('cabinet.actions.appointment')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Patient Modal */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
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
          onClose={() => setShowConsultationModal(false)}
        />
      )}

      {/* Rendez-vous Modal */}
      {showRendezVousModal && (
        <RendezVousModal
          onClose={() => setShowRendezVousModal(false)}
        />
      )}

      {/* Facture Modal */}
      {showFactureModal && (
        <FactureModal
          onClose={() => setShowFactureModal(false)}
        />
      )}

      {/* Edit Consultation Modal */}
      {selectedConsultation && (
        <EditConsultationModal
          consultation={selectedConsultation}
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          onConsultationUpdated={handleConsultationUpdated}
        />
      )}

      {/* Edit Facture Modal */}
      {selectedFacture && (
        <EditFactureModal
          facture={selectedFacture}
          isOpen={!!selectedFacture}
          onClose={() => setSelectedFacture(null)}
          onFactureUpdated={handleFactureUpdated}
        />
      )}

      {/* Edit Rendez-vous Modal */}
      {selectedRendezVous && (
        <EditRendezVousModal
          rendezVous={selectedRendezVous}
          isOpen={!!selectedRendezVous}
          onClose={() => setSelectedRendezVous(null)}
          onRendezVousUpdated={handleRendezVousUpdated}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && showDeleteConfirmation.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion'}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              {language === 'fr' 
                ? `Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.`
                : `Are you sure you want to delete this item? This action cannot be undone.`
              }
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirmation(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                {language === 'fr' ? 'Supprimer' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};