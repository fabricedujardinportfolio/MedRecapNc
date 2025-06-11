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
  Video,
  Stethoscope,
  Euro,
  Clock
} from 'lucide-react';
import { Patient } from '../types/Patient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TavusVideoAgent } from './TavusVideoAgent';

interface PatientModalProps {
  patient: Patient;
  onClose: () => void;
  showCabinetFeatures?: boolean;
}

export const PatientModal: React.FC<PatientModalProps> = ({ 
  patient, 
  onClose, 
  showCabinetFeatures = false 
}) => {
  const [showTavusAgent, setShowTavusAgent] = useState(false);
  const [activeTab, setActiveTab] = useState<'medical' | 'consultations' | 'factures' | 'rendez-vous'>('medical');

  const getAlertColor = (niveau: string) => {
    switch (niveau) {
      case 'rouge': return 'text-red-600 bg-red-100 border-red-200';
      case 'orange': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'verte': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
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
      case 'payee': return 'Payée';
      case 'en_attente': return 'En attente';
      case 'partiellement_payee': return 'Partiellement payée';
      case 'en_retard': return 'En retard';
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
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

          {/* Navigation Tabs (for cabinet features) */}
          {showCabinetFeatures && (
            <div className="px-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'medical', label: 'Dossier médical', icon: Heart },
                  { id: 'consultations', label: 'Consultations', icon: Stethoscope },
                  { id: 'factures', label: 'Factures', icon: Euro },
                  { id: 'rendez-vous', label: 'Rendez-vous', icon: Calendar }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${
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
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
            {(!showCabinetFeatures || activeTab === 'medical') && (
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

                {/* Medical History */}
                <div className="lg:col-span-2 bg-yellow-50 rounded-xl p-6">
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
            )}

            {/* Consultations Tab */}
            {showCabinetFeatures && activeTab === 'consultations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Historique des consultations</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Nouvelle consultation
                  </button>
                </div>
                {patient.consultations && patient.consultations.length > 0 ? (
                  <div className="space-y-4">
                    {patient.consultations.map((consultation) => (
                      <div key={consultation.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{consultation.motif}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                consultation.statut === 'terminee' ? 'bg-green-100 text-green-800' :
                                consultation.statut === 'en_cours' ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {consultation.statut}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{consultation.diagnostic}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                              <div>Date: {format(new Date(consultation.date), 'dd/MM/yyyy à HH:mm', { locale: fr })}</div>
                              <div>Durée: {consultation.duree} min</div>
                              <div>Médecin: {consultation.medecinNom}</div>
                              <div>Tarif: {consultation.tarif}€</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    
                    <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune consultation enregistrée</p>
                  </div>
                )}
              </div>
            )}

            {/* Factures Tab */}
            {showCabinetFeatures && activeTab === 'factures' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Factures et paiements</h3>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Nouvelle facture
                  </button>
                </div>
                {patient.factures && patient.factures.length > 0 ? (
                  <div className="space-y-4">
                    {patient.factures.map((facture) => (
                      <div key={facture.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">Facture {facture.numero}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getFactureStatusColor(facture.statut)}`}>
                                {getFactureStatusText(facture.statut)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>Date: {format(new Date(facture.date), 'dd/MM/yyyy', { locale: fr })}</div>
                              <div>Échéance: {format(new Date(facture.dateEcheance), 'dd/MM/yyyy', { locale: fr })}</div>
                              <div>Montant total: {facture.montantTotal}€</div>
                              <div>Reste à payer: {facture.montantRestant}€</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Euro className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune facture enregistrée</p>
                  </div>
                )}
              </div>
            )}

            {/* Rendez-vous Tab */}
            {showCabinetFeatures && activeTab === 'rendez-vous' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Rendez-vous</h3>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    Nouveau rendez-vous
                  </button>
                </div>
                {patient.rendezVous && patient.rendezVous.length > 0 ? (
                  <div className="space-y-4">
                    {patient.rendezVous.map((rdv) => (
                      <div key={rdv.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{rdv.motif}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getRdvStatusColor(rdv.statut)}`}>
                                {rdv.statut}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>Date: {format(new Date(rdv.date), 'dd/MM/yyyy', { locale: fr })}</div>
                              <div>Heure: {rdv.heureDebut} - {rdv.heureFin}</div>
                              <div>Type: {rdv.type}</div>
                              <div>Salle: {rdv.salle}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun rendez-vous programmé</p>
                  </div>
                )}
              </div>
            )}
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