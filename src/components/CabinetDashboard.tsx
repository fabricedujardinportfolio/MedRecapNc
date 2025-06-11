import React, { useState, useMemo } from 'react';
import { SearchFilters } from './SearchFilters';
import { PatientCard } from './PatientCard';
import { PatientModal } from './PatientModal';
import { ConsultationModal } from './ConsultationModal';
import { FactureModal } from './FactureModal';
import { RendezVousModal } from './RendezVousModal';
import { mockPatients } from '../data/mockPatients';
import { mockCabinetStats, updatePatientsWithCabinetData } from '../data/mockCabinetData';
import { Patient, SearchFilters as SearchFiltersType, CabinetStats } from '../types/Patient';
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
  AlertTriangle
} from 'lucide-react';

export const CabinetDashboard: React.FC = () => {
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [showRendezVousModal, setShowRendezVousModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'patients' | 'consultations' | 'factures' | 'rendez-vous'>('patients');
  const { t } = useLanguage();

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'patients', label: 'Patients', icon: Users },
              { id: 'consultations', label: 'Consultations', icon: Stethoscope },
              { id: 'factures', label: 'Factures', icon: FileText },
              { id: 'rendez-vous', label: 'Rendez-vous', icon: Calendar }
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
              <p className="text-sm font-medium text-gray-600">Patients Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.patients.total}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+{stats.patients.nouveaux}</span>
            <span className="text-gray-500 ml-1">nouveaux ce mois</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consultations</p>
              <p className="text-3xl font-bold text-green-600">{stats.consultations.aujourdhui}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Stethoscope className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500">
              {stats.consultations.semaine} cette semaine
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rendez-vous</p>
              <p className="text-3xl font-bold text-orange-600">{stats.rendezVous.aujourdhui}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Clock className="w-4 h-4 text-orange-500 mr-1" />
            <span className="text-orange-600">{stats.rendezVous.enAttente} en attente</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CA du mois</p>
              <p className="text-3xl font-bold text-purple-600">{stats.finances.chiffreAffaireMois}€</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Euro className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <CreditCard className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-red-600">{stats.finances.facturenAttente}€ en attente</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowConsultationModal(true)}
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Nouvelle consultation</span>
          </button>
          <button
            onClick={() => setShowRendezVousModal(true)}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">Nouveau RDV</span>
          </button>
          <button
            onClick={() => setShowFactureModal(true)}
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Nouvelle facture</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <Users className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">Nouveau patient</span>
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
                Liste des Patients
              </h2>
              <p className="text-gray-600">
                {filteredPatients.length} {filteredPatients.length === 1 ? 'patient trouvé' : 'patients trouvés'}
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
                Aucun patient trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </>
      )}

      {/* Other tabs content would go here */}
      {activeTab === 'consultations' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des Consultations</h3>
          <p className="text-gray-600">Interface de gestion des consultations en cours de développement</p>
        </div>
      )}

      {activeTab === 'factures' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des Factures</h3>
          <p className="text-gray-600">Interface de gestion des factures en cours de développement</p>
        </div>
      )}

      {activeTab === 'rendez-vous' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Planning des Rendez-vous</h3>
          <p className="text-gray-600">Interface de planning en cours de développement</p>
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