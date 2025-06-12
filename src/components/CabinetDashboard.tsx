import React, { useState, useMemo } from 'react';
import { SearchFilters } from './SearchFilters';
import { PatientCard } from './PatientCard';
import { PatientModal } from './PatientModal';
import { ConsultationModal } from './ConsultationModal';
import { FactureModal } from './FactureModal';
import { RendezVousModal } from './RendezVousModal';
import { mockPatients } from '../data/mockPatients';
import { mockCabinetStats, updatePatientsWithCabinetData, mockConsultations, mockFactures, mockRendezVous } from '../data/mockCabinetData';
import { Patient, SearchFilters as SearchFiltersType, CabinetStats, Consultation, Facture, RendezVous } from '../types/Patient';
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
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

export const CabinetDashboard: React.FC = () => {
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [showRendezVousModal, setShowRendezVousModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'patients' | 'consultations' | 'factures' | 'rendez-vous'>('patients');
  const { t, language } = useLanguage();
  const locale = language === 'fr' ? fr : enUS;

  // Mise à jour des patients avec les données cabinet
  const patientsWithCabinetData = useMemo(() => {
    return updatePatientsWithCabinetData(mockPatients);
  }, []);

  // Filter patients based on search criteria
  const filteredPatients = useMemo(() => {
    return patientsWithCabinetData.filter(patient => {
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
  }, [filters, patientsWithCabinetData]);

  const resetFilters = () => {
    setFilters({});
  };

  const stats: CabinetStats = mockCabinetStats;

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
          <nav className="-mb-px flex space-x-8">
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
              <p className="text-3xl font-bold text-green-600">{stats.consultations.aujourdhui}</p>
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
              <p className="text-3xl font-bold text-orange-600">{stats.rendezVous.aujourdhui}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowConsultationModal(true)}
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">{t('cabinet.actions.consultation')}</span>
          </button>
          <button
            onClick={() => setShowRendezVousModal(true)}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">{t('cabinet.actions.appointment')}</span>
          </button>
          <button
            onClick={() => setShowFactureModal(true)}
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">{t('cabinet.actions.invoice')}</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <Users className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">{t('cabinet.actions.patient')}</span>
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
        </>
      )}

      {/* Section Consultations */}
      {activeTab === 'consultations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('patient.modal.consultations')}</h2>
              <p className="text-gray-600">{mockConsultations.length} {t('cabinet.tabs.consultations').toLowerCase()}</p>
            </div>
            <button
              onClick={() => setShowConsultationModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('patient.modal.new.consultation')}
            </button>
          </div>

          <div className="grid gap-4">
            {mockConsultations.map((consultation) => (
              <div key={consultation.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{consultation.motif}</h3>
                        <p className="text-sm text-gray-600">
                          {t('common.patient')}: {patientsWithCabinetData.find(p => p.id === consultation.patientId)?.prenom} {patientsWithCabinetData.find(p => p.id === consultation.patientId)?.nom}
                        </p>
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
                        {consultation.factureId && (
                          <p className="text-xs text-green-600">{t('invoice.status.paid')}</p>
                        )}
                      </div>
                    </div>

                    {consultation.traitement && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-blue-800 mb-1">{t('common.treatment')}</p>
                        <p className="text-sm text-blue-900">{consultation.traitement}</p>
                      </div>
                    )}

                    {consultation.ordonnance && consultation.ordonnance.medicaments.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-800 mb-2">Ordonnance</p>
                        <div className="space-y-1">
                          {consultation.ordonnance.medicaments.map((med, index) => (
                            <div key={index} className="text-sm text-green-900">
                              <span className="font-medium">{med.nom}</span> - {med.dosage} ({med.instructions})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Factures */}
      {activeTab === 'factures' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('patient.modal.invoices')}</h2>
              <p className="text-gray-600">{mockFactures.length} {t('cabinet.tabs.invoices').toLowerCase()} • {mockFactures.filter(f => f.statut === 'en_attente').length} {t('cabinet.stats.pending')}</p>
            </div>
            <button
              onClick={() => setShowFactureModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t('patient.modal.new.invoice')}
            </button>
          </div>

          <div className="grid gap-4">
            {mockFactures.map((facture) => (
              <div key={facture.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Facture {facture.numero}</h3>
                        <p className="text-sm text-gray-600">
                          {t('common.patient')}: {patientsWithCabinetData.find(p => p.id === facture.patientId)?.prenom} {patientsWithCabinetData.find(p => p.id === facture.patientId)?.nom}
                        </p>
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
                        <p className="text-sm font-bold text-gray-900">{facture.montantTotal.toFixed(2)}€</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Payé</p>
                        <p className="text-sm font-medium text-green-600">{facture.montantPaye.toFixed(2)}€</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Reste à payer</p>
                        <p className={`text-sm font-bold ${facture.montantRestant > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {facture.montantRestant.toFixed(2)}€
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-xs font-medium text-blue-800 mb-2">Détails de facturation</p>
                      {facture.details.map((detail, index) => (
                        <div key={index} className="flex justify-between text-sm text-blue-900">
                          <span>{detail.description} (x{detail.quantite})</span>
                          <span className="font-medium">{detail.total.toFixed(2)}€</span>
                        </div>
                      ))}
                    </div>

                    {facture.remboursement && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-800 mb-2">Remboursement</p>
                        <div className="grid grid-cols-3 gap-4 text-sm text-green-900">
                          <div>
                            <span className="text-xs text-green-600">Sécurité Sociale</span>
                            <p className="font-medium">{facture.remboursement.securiteSociale.toFixed(2)}€</p>
                          </div>
                          <div>
                            <span className="text-xs text-green-600">Mutuelle</span>
                            <p className="font-medium">{facture.remboursement.mutuelle.toFixed(2)}€</p>
                          </div>
                          <div>
                            <span className="text-xs text-green-600">Reste à charge</span>
                            <p className="font-medium">{facture.remboursement.restACharge.toFixed(2)}€</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
        </div>
      )}

      {/* Section Rendez-vous */}
      {activeTab === 'rendez-vous' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('patient.modal.appointments')}</h2>
              <p className="text-gray-600">{mockRendezVous.length} {t('cabinet.tabs.appointments').toLowerCase()} • {mockRendezVous.filter(r => r.statut === 'confirme').length} confirmés</p>
            </div>
            <button
              onClick={() => setShowRendezVousModal(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {t('patient.modal.new.appointment')}
            </button>
          </div>

          <div className="grid gap-4">
            {mockRendezVous.map((rdv) => (
              <div key={rdv.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{rdv.motif}</h3>
                        <p className="text-sm text-gray-600">{t('common.patient')}: {rdv.patientNom}</p>
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
                        <p className="text-sm font-medium text-gray-900">{rdv.heureDebut} - {rdv.heureFin}</p>
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
                        {rdv.rappelEnvoye ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={rdv.rappelEnvoye ? 'text-green-600' : 'text-red-600'}>
                          {rdv.rappelEnvoye ? 'Rappel envoyé' : 'Rappel non envoyé'}
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
                    <button className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    {rdv.statut === 'programme' && (
                      <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          showCabinetFeatures={true}
        />
      )}

      {showConsultationModal && (
        <ConsultationModal
          onClose={() => setShowConsultationModal(false)}
        />
      )}

      {showFactureModal && (
        <FactureModal
          onClose={() => setShowFactureModal(false)}
        />
      )}

      {showRendezVousModal && (
        <RendezVousModal
          onClose={() => setShowRendezVousModal(false)}
        />
      )}
    </div>
  );
};