import React from 'react';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  Heart, 
  Eye,
  Clock,
  Euro,
  Stethoscope
} from 'lucide-react';
import { Patient } from '../types/Patient';
import { useLanguage } from '../hooks/useLanguage';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface PatientCardProps {
  patient: Patient;
  onViewDetails: (patient: Patient) => void;
  showCabinetInfo?: boolean;
}

export const PatientCard: React.FC<PatientCardProps> = ({ 
  patient, 
  onViewDetails, 
  showCabinetInfo = false 
}) => {
  const { t, language } = useLanguage();
  const locale = language === 'fr' ? fr : enUS;

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Urgence': return 'bg-red-100 text-red-800 border-red-200';
      case 'Actif': return 'bg-green-100 text-green-800 border-green-200';
      case 'Sorti': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Transfert': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'Actif': return t('status.active');
      case 'Urgence': return t('status.emergency');
      case 'Sorti': return t('status.discharged');
      case 'Transfert': return t('status.transfer');
      default: return statut;
    }
  };

  const getServiceText = (service: string) => {
    switch (service) {
      case 'Cardiologie': return t('service.cardiology');
      case 'Urgences': return t('service.emergency');
      case 'Obstétrique': return t('service.obstetrics');
      case 'Néphrologie': return t('service.nephrology');
      case 'Chirurgie': return t('service.surgery');
      case 'Médecine interne': return t('service.internal');
      default: return service;
    }
  };

  const getAlertColor = (niveau: string) => {
    switch (niveau) {
      case 'rouge': return 'text-red-600 bg-red-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      case 'verte': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypePatientColor = (type: string) => {
    switch (type) {
      case 'cabinet': return 'bg-blue-100 text-blue-800';
      case 'hospitalier': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Alert Banner */}
      {patient.alerte && patient.alerte.niveau !== 'verte' && (
        <div className={`px-4 py-2 ${getAlertColor(patient.alerte.niveau)} border-b`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">{patient.alerte.message}</span>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {patient.prenom} {patient.nom}
              </h3>
              <p className="text-sm text-gray-500">
                {t('patient.file')} #{patient.numeroDossier}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.statut)}`}>
              {getStatusText(patient.statut)}
            </div>
            {showCabinetInfo && patient.typePatient && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTypePatientColor(patient.typePatient)}`}>
                {patient.typePatient === 'cabinet' ? 'Cabinet' : 'Hospitalier'}
              </div>
            )}
          </div>
        </div>

        {/* Patient Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{patient.age} {t('patient.years')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Heart className="w-4 h-4" />
            <span>{patient.groupeSanguin}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{getServiceText(patient.service)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {t('patient.admitted')} {format(new Date(patient.dateAdmission), 'dd/MM/yyyy', { locale })}
            </span>
          </div>
        </div>

        {/* Cabinet-specific info */}
        {showCabinetInfo && (
          <div className="space-y-2 mb-4">
            {patient.derniereConsultation && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Stethoscope className="w-4 h-4" />
                <span>
                  Dernière consultation: {format(new Date(patient.derniereConsultation), 'dd/MM/yyyy', { locale })}
                </span>
              </div>
            )}
            {patient.prochainRendezVous && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Prochain RDV: {format(new Date(patient.prochainRendezVous), 'dd/MM/yyyy', { locale })}
                </span>
              </div>
            )}
            {patient.factures && patient.factures.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <Euro className="w-4 h-4" />
                <span>
                  {patient.factures.filter(f => f.statut === 'en_attente').length} facture(s) en attente
                </span>
              </div>
            )}
          </div>
        )}

        {/* Medical Info */}
        <div className="space-y-2 mb-4">
          <div className="text-sm">
            <span className="font-medium text-gray-700">{t('patient.reason')} </span>
            <span className="text-gray-600">{patient.motifHospitalisation}</span>
          </div>
          {patient.allergies.length > 0 && (
            <div className="text-sm">
              <span className="font-medium text-red-600">{t('patient.allergies')} </span>
              <span className="text-red-600">{patient.allergies.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Phone className="w-4 h-4" />
          <span>{patient.telephone.portable || patient.telephone.fixe}</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={() => onViewDetails(patient)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            {t('patient.view')}
          </button>
        </div>
      </div>
    </div>
  );
};