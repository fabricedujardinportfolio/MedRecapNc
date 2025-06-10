import React, { useState } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Heart, 
  AlertTriangle,
  FileText,
  Pill,
  Activity,
  Download,
  Bot,
  Video
} from 'lucide-react';
import { Patient } from '../types/Patient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TavusVideoAgent } from './TavusVideoAgent';

interface PatientModalProps {
  patient: Patient;
  onClose: () => void;
}

export const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose }) => {
  const [showTavusAgent, setShowTavusAgent] = useState(false);

  const getAlertColor = (niveau: string) => {
    switch (niveau) {
      case 'rouge': return 'text-red-600 bg-red-100 border-red-200';
      case 'orange': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'verte': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient.prenom} {patient.nom}
                </h2>
                <p className="text-gray-600">Dossier #{patient.numeroDossier}</p>
                <p className="text-sm text-gray-500">
                  Dernière mise à jour: {format(new Date(patient.derniereMaj), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Tavus AI Agent Button */}
              <button
                onClick={() => setShowTavusAgent(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Bot className="w-4 h-4" />
                Assistant IA
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Alert Banner */}
          {patient.alerte && (
            <div className={`px-6 py-3 border-b ${getAlertColor(patient.alerte.niveau)}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{patient.alerte.message}</span>
              </div>
            </div>
          )}

          {/* AI Summary Banner */}
          <div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    Assistant IA Médical disponible
                  </p>
                  <p className="text-xs text-purple-700">
                    Cliquez pour obtenir un résumé vidéo interactif de ce dossier patient
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTavusAgent(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                <Video className="w-3 h-3" />
                Lancer l'IA
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Informations personnelles
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Sexe</span>
                        <p className="text-gray-900">{patient.sexe}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Âge</span>
                        <p className="text-gray-900">{patient.age} ans</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Date de naissance</span>
                      <p className="text-gray-900">
                        {format(new Date(patient.dateNaissance), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Lieu de naissance</span>
                      <p className="text-gray-900">{patient.lieuNaissance}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Nationalité</span>
                      <p className="text-gray-900">{patient.nationalite}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Situation familiale</span>
                      <p className="text-gray-900">{patient.situationFamiliale}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    Coordonnées
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Adresse</span>
                      <p className="text-gray-900">
                        {patient.adresse.rue}<br />
                        {patient.adresse.codePostal} {patient.adresse.ville}<br />
                        {patient.adresse.pays}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Téléphone</span>
                        <p className="text-gray-900">{patient.telephone.portable || patient.telephone.fixe}</p>
                      </div>
                      {patient.email && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Email</span>
                          <p className="text-gray-900">{patient.email}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Contact d'urgence</span>
                      <p className="text-gray-900">
                        {patient.contactUrgence.nom} ({patient.contactUrgence.lien})<br />
                        <span className="text-blue-600">{patient.contactUrgence.telephone}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-6">
                <div className="bg-red-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    Informations médicales critiques
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Groupe sanguin</span>
                        <p className="text-lg font-bold text-gray-900">{patient.groupeSanguin}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">IMC</span>
                        <p className="text-gray-900">{patient.biometrie.imc}</p>
                      </div>
                    </div>
                    {patient.allergies.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-red-600">Allergies</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {patient.allergies.map((allergie, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {allergie}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Treatments */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-600" />
                    Traitements en cours
                  </h3>
                  <div className="space-y-3">
                    {patient.traitements.map((traitement, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{traitement.nom}</p>
                            <p className="text-sm text-gray-600">{traitement.dosage} - {traitement.frequence}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            Depuis {format(new Date(traitement.dateDebut), 'MM/yyyy', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hospitalization Details */}
                <div className="bg-teal-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-600" />
                    Hospitalisation actuelle
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Service</span>
                        <p className="text-gray-900">{patient.service}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Mode d'admission</span>
                        <p className="text-gray-900">{patient.modeAdmission}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Motif d'hospitalisation</span>
                      <p className="text-gray-900">{patient.motifHospitalisation}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Médecin référent</span>
                      <p className="text-gray-900">{patient.medecinReferent}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Diagnostics</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {patient.diagnostics.map((diagnostic, index) => (
                          <span key={index} className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                            {diagnostic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="mt-6 bg-yellow-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-600" />
                Antécédents médicaux
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">Antécédents personnels</span>
                  <ul className="mt-2 space-y-1">
                    {patient.antecedents.personnels.map((antecedent, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                        {antecedent}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Antécédents familiaux</span>
                  <ul className="mt-2 space-y-1">
                    {patient.antecedents.familiaux.map((antecedent, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                        {antecedent}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tavus Video Agent Modal */}
      <TavusVideoAgent
        patient={patient}
        isVisible={showTavusAgent}
        onClose={() => setShowTavusAgent(false)}
      />
    </>
  );
};