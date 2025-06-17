import React, { useState, useEffect } from 'react';
import { X, User, Calendar, MapPin, Phone, Heart, FileText, Stethoscope, Euro, Clock, Bot, Video, AlertTriangle, Edit, Plus, Eye } from 'lucide-react';
import { Patient, Consultation, Facture, RendezVous } from '../types/Patient';
import { PatientData, ConsultationData, FactureData, RendezVousData, patientService } from '../services/patientService';
import { TavusVideoAgent } from './TavusVideoAgent';
import { ConsultationModal } from './ConsultationModal';
import { FactureModal } from './FactureModal';
import { RendezVousModal } from './RendezVousModal';
import { useLanguage } from '../hooks/useLanguage';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface PatientModalProps {
  patient: Patient;
  onClose: () => void;
  showCabinetFeatures?: boolean;
  onPatientUpdated?: () => void;
}

export const PatientModal: React.FC<PatientModalProps> = ({ 
  patient, 
  onClose, 
  showCabinetFeatures = false,
  onPatientUpdated 
}) => {
  const [showTavusAgent, setShowTavusAgent] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [showRendezVousModal, setShowRendezVousModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'consultations' | 'factures' | 'rendez-vous'>('info');
  const [patientWithCompleteData, setPatientWithCompleteData] = useState<Patient | null>(null);
  const [isLoadingCompleteData, setIsLoadingCompleteData] = useState(false);
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [factures, setFactures] = useState<FactureData[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVousData[]>([]);
  const { t, language } = useLanguage();
  const locale = language === 'fr' ? fr : enUS;

  // 🔧 NOUVEAU : Charger les données complètes du patient pour l'IA
  useEffect(() => {
    if (patient.id) {
      loadCompletePatientData();
    }
  }, [patient.id]);

  const loadCompletePatientData = async () => {
    try {
      setIsLoadingCompleteData(true);
      console.log('🔄 Chargement des données complètes pour IA:', patient.nom, patient.prenom);
      
      // Charger le patient avec toutes ses données
      const patientComplet = await patientService.getPatientWithCompleteData(patient.id);
      
      if (patientComplet) {
        // Convertir les données de la DB au format Patient pour l'IA
        const patientForAI = convertDBPatientToPatientWithData(patientComplet);
        setPatientWithCompleteData(patientForAI);
        
        // Stocker les données séparément pour l'affichage
        setConsultations(patientComplet.consultations || []);
        setFactures(patientComplet.factures || []);
        setRendezVous(patientComplet.rendezVous || []);
        
        console.log('✅ Données complètes chargées pour IA:', {
          consultations: patientComplet.consultations?.length || 0,
          factures: patientComplet.factures?.length || 0,
          rendezVous: patientComplet.rendezVous?.length || 0
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données complètes:', error);
      // En cas d'erreur, utiliser les données de base
      setPatientWithCompleteData(patient);
    } finally {
      setIsLoadingCompleteData(false);
    }
  };

  // 🔧 NOUVELLE FONCTION : Convertir les données DB en format Patient avec toutes les données
  const convertDBPatientToPatientWithData = (dbPatient: PatientData & {
    consultations?: ConsultationData[];
    factures?: FactureData[];
    rendezVous?: RendezVousData[];
    traitements?: any[];
  }): Patient => {
    // Convertir les consultations
    const consultationsConverted: Consultation[] = (dbPatient.consultations || []).map(c => ({
      id: c.id || '',
      patientId: c.patient_id,
      date: c.date,
      motif: c.motif,
      diagnostic: c.diagnostic,
      traitement: c.traitement || '',
      observations: c.observations || '',
      medecinId: c.medecin_id || '',
      medecinNom: c.medecin_nom,
      duree: c.duree || 30,
      type: c.type,
      statut: c.statut,
      tarif: c.tarif,
      factureId: undefined,
      ordonnance: {
        medicaments: (c as any).medicaments?.map((m: any) => ({
          nom: m.nom,
          dosage: m.dosage,
          duree: m.duree || '',
          instructions: m.instructions
        })) || [],
        examens: []
      },
      signesVitaux: {
        tension: c.tension || '',
        pouls: c.pouls || 0,
        temperature: c.temperature || 0,
        poids: c.poids || 0,
        taille: c.taille || 0
      }
    }));

    // Convertir les factures
    const facturesConverted: Facture[] = (dbPatient.factures || []).map(f => ({
      id: f.id || '',
      patientId: f.patient_id,
      consultationId: f.consultation_id,
      numero: f.numero,
      date: f.date,
      montantTotal: f.montant_total,
      montantPaye: f.montant_paye,
      montantRestant: f.montant_restant,
      statut: f.statut,
      methodePaiement: f.methode_paiement,
      dateEcheance: f.date_echeance,
      datePaiement: f.date_paiement,
      details: (f as any).facture_details?.map((d: any) => ({
        description: d.description,
        quantite: d.quantite,
        prixUnitaire: d.prix_unitaire,
        total: d.total
      })) || [],
      remboursement: {
        securiteSociale: f.remboursement_securite_sociale || 0,
        mutuelle: f.remboursement_mutuelle || 0,
        restACharge: f.remboursement_reste_a_charge || 0
      },
      notes: f.notes
    }));

    // Convertir les rendez-vous
    const rendezVousConverted: RendezVous[] = (dbPatient.rendezVous || []).map(r => ({
      id: r.id || '',
      patientId: r.patient_id,
      patientNom: r.patient_nom,
      date: r.date,
      heureDebut: r.heure_debut,
      heureFin: r.heure_fin,
      motif: r.motif,
      type: r.type,
      statut: r.statut,
      medecinId: r.medecin_id || '',
      medecinNom: r.medecin_nom,
      salle: r.salle,
      notes: r.notes,
      rappelEnvoye: r.rappel_envoye,
      consultationId: r.consultation_id
    }));

    // Convertir les traitements
    const traitementsConverted = (dbPatient.traitements || []).map(t => ({
      nom: t.nom,
      dosage: t.dosage,
      frequence: t.frequence,
      dateDebut: t.date_debut
    }));

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
      traitements: traitementsConverted,
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
      
      // 🔧 DONNÉES COMPLÈTES POUR L'IA
      consultations: consultationsConverted,
      factures: facturesConverted,
      rendezVous: rendezVousConverted,
      typePatient: dbPatient.type_patient || 'cabinet',
      medecinCabinet: dbPatient.medecin_cabinet || '',
      derniereConsultation: consultationsConverted[0]?.date,
      prochainRendezVous: rendezVousConverted.find(r => new Date(r.date) > new Date())?.date
    };
  };

  const handleDataUpdated = () => {
    console.log('🔄 Mise à jour des données après modification');
    loadCompletePatientData();
    if (onPatientUpdated) {
      onPatientUpdated();
    }
  };

  const handleOpenTavusAgent = () => {
    if (patientWithCompleteData) {
      console.log('🤖 Ouverture de l\'IA avec données complètes:', {
        patient: patientWithCompleteData.nom + ' ' + patientWithCompleteData.prenom,
        consultations: patientWithCompleteData.consultations?.length || 0,
        factures: patientWithCompleteData.factures?.length || 0,
        rendezVous: patientWithCompleteData.rendezVous?.length || 0
      });
      setShowTavusAgent(true);
    } else {
      console.warn('⚠️ Données complètes non encore chargées, utilisation des données de base');
      setShowTavusAgent(true);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Urgence': return 'bg-red-100 text-red-800 border-red-200';
      case 'Actif': return 'bg-green-100 text-green-800 border-green-200';
      case 'Sorti': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Transfert': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertColor = (niveau: string) => {
    switch (niveau) {
      case 'rouge': return 'bg-red-100 text-red-800 border-red-200';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'verte': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConsultationStatusColor = (statut: string) => {
    switch (statut) {
      case 'terminee': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-orange-100 text-orange-800';
      case 'programmee': return 'bg-blue-100 text-blue-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {patient.prenom} {patient.nom}
                </h2>
                <p className="text-gray-600">
                  {t('patient.modal.title')} #{patient.numeroDossier}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.statut)}`}>
                    {patient.statut}
                  </span>
                  {patient.alerte && patient.alerte.niveau !== 'verte' && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAlertColor(patient.alerte.niveau)}`}>
                      {patient.alerte.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenTavusAgent}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                disabled={isLoadingCompleteData}
              >
                {isLoadingCompleteData ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>{t('patient.modal.assistant')}</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-y-auto">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-3 font-medium text-sm border-b-2 ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('patient.modal.personal')}
              </button>
              <button
                onClick={() => setActiveTab('consultations')}
                className={`px-6 py-3 font-medium text-sm border-b-2 ${
                  activeTab === 'consultations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('patient.modal.consultations')}
              </button>
              {showCabinetFeatures && (
                <>
                  <button
                    onClick={() => setActiveTab('factures')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 ${
                      activeTab === 'factures'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {t('patient.modal.invoices')}
                  </button>
                  <button
                    onClick={() => setActiveTab('rendez-vous')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 ${
                      activeTab === 'rendez-vous'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {t('patient.modal.appointments')}
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
            {/* Personal Information Tab */}
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      {t('patient.modal.personal')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('common.male')}
                        </p>
                        <p className="text-gray-900">{patient.sexe === 'M' ? t('common.male') : patient.sexe === 'F' ? t('common.female') : t('common.other')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('patient.years')}
                        </p>
                        <p className="text-gray-900">{patient.age} {t('patient.years')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('patient.admitted')}
                        </p>
                        <p className="text-gray-900">{format(new Date(patient.dateAdmission), 'dd/MM/yyyy', { locale })}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('common.doctor')}
                        </p>
                        <p className="text-gray-900">{patient.medecinReferent}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      {t('patient.modal.contact')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('common.address')}
                        </p>
                        <p className="text-gray-900">{patient.adresse.rue}</p>
                        <p className="text-gray-900">{patient.adresse.codePostal} {patient.adresse.ville}, {patient.adresse.pays}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t('common.phone')}
                          </p>
                          <p className="text-gray-900">{patient.telephone.portable || patient.telephone.fixe || t('common.none')}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t('common.email')}
                          </p>
                          <p className="text-gray-900">{patient.email || t('common.none')}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('common.emergency')}
                        </p>
                        <p className="text-gray-900">{patient.contactUrgence.nom} ({patient.contactUrgence.lien})</p>
                        <p className="text-gray-900">{patient.contactUrgence.telephone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="bg-red-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      {t('patient.modal.medical')}
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t('common.blood')}
                          </p>
                          <p className="text-gray-900">{patient.groupeSanguin}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t('common.service')}
                          </p>
                          <p className="text-gray-900">{patient.service}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('patient.reason')}
                        </p>
                        <p className="text-gray-900">{patient.motifHospitalisation}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('patient.allergies')}
                        </p>
                        <p className="text-gray-900">
                          {patient.allergies.length > 0 
                            ? patient.allergies.join(', ') 
                            : t('common.none')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Current Treatments */}
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      {t('patient.modal.treatments')}
                    </h3>
                    {patient.traitements.length > 0 ? (
                      <div className="space-y-3">
                        {patient.traitements.map((traitement, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg border border-purple-100">
                            <div className="flex justify-between">
                              <p className="font-medium text-gray-900">{traitement.nom}</p>
                              <p className="text-sm text-purple-600">{traitement.dosage}</p>
                            </div>
                            <p className="text-sm text-gray-600">{traitement.frequence}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t('common.since')} {format(new Date(traitement.dateDebut), 'dd/MM/yyyy', { locale })}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">{t('common.no.treatments')}</p>
                    )}
                  </div>

                  {/* Current Hospitalization */}
                  <div className="bg-orange-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      {t('patient.modal.hospitalization')}
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t('common.status')}
                          </p>
                          <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient.statut)}`}>
                            {patient.statut}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t('common.admission')}
                          </p>
                          <p className="text-gray-900">{patient.modeAdmission}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('common.diagnosis')}
                        </p>
                        <p className="text-gray-900">
                          {patient.diagnostics.length > 0 
                            ? patient.diagnostics.join(', ') 
                            : t('common.none')}
                        </p>
                      </div>
                      {patient.alerte && (
                        <div className={`p-3 rounded-lg ${
                          patient.alerte.niveau === 'rouge' ? 'bg-red-100' :
                          patient.alerte.niveau === 'orange' ? 'bg-orange-100' :
                          'bg-green-100'
                        }`}>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-4 h-4 ${
                              patient.alerte.niveau === 'rouge' ? 'text-red-600' :
                              patient.alerte.niveau === 'orange' ? 'text-orange-600' :
                              'text-green-600'
                            }`} />
                            <p className={`text-sm font-medium ${
                              patient.alerte.niveau === 'rouge' ? 'text-red-800' :
                              patient.alerte.niveau === 'orange' ? 'text-orange-800' :
                              'text-green-800'
                            }`}>
                              {patient.alerte.message}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      {t('patient.modal.history')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('patient.modal.personal.history')}
                        </p>
                        <p className="text-gray-900">
                          {patient.antecedents.personnels.length > 0 
                            ? patient.antecedents.personnels.join(', ') 
                            : t('common.none')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('patient.modal.family.history')}
                        </p>
                        <p className="text-gray-900">
                          {patient.antecedents.familiaux.length > 0 
                            ? patient.antecedents.familiaux.join(', ') 
                            : t('common.none')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('common.surgical.history')}
                        </p>
                        <p className="text-gray-900">
                          {patient.antecedenChirurgicaux.length > 0 
                            ? patient.antecedenChirurgicaux.join(', ') 
                            : t('common.none')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Consultations Tab */}
            {activeTab === 'consultations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{t('patient.modal.consultations')}</h3>
                  <button
                    onClick={() => setShowConsultationModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('patient.modal.new.consultation')}
                  </button>
                </div>

                {consultations.length > 0 ? (
                  <div className="space-y-4">
                    {consultations.map((consultation) => (
                      <div key={consultation.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                                <Stethoscope className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{consultation.motif}</h4>
                                <p className="text-sm text-gray-600">
                                  {format(new Date(consultation.date), 'dd/MM/yyyy', { locale })}
                                </p>
                              </div>
                              <span className={`px-3 py-1 text-xs rounded-full font-medium ${getConsultationStatusColor(consultation.statut)}`}>
                                {consultation.statut}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">{t('common.diagnosis')}</p>
                                <p className="text-sm text-gray-900">{consultation.diagnostic}</p>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">{t('common.treatment')}</p>
                                <p className="text-sm text-gray-900">{consultation.traitement || t('common.none')}</p>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">{t('common.doctor')}</p>
                                <p className="text-sm text-gray-900">{consultation.medecin_nom}</p>
                              </div>
                            </div>

                            {consultation.observations && (
                              <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-blue-800 mb-1">{t('common.notes')}</p>
                                <p className="text-sm text-blue-900">{consultation.observations}</p>
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
                ) : (
                  <div className="text-center py-12">
                    <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('patient.modal.no.consultations')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('patient.modal.no.consultations.subtitle')}
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

            {/* Factures Tab */}
            {activeTab === 'factures' && showCabinetFeatures && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{t('patient.modal.invoices')}</h3>
                  <button
                    onClick={() => setShowFactureModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('patient.modal.new.invoice')}
                  </button>
                </div>

                {factures.length > 0 ? (
                  <div className="space-y-4">
                    {factures.map((facture) => (
                      <div key={facture.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                                <Euro className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">Facture {facture.numero}</h4>
                                <p className="text-sm text-gray-600">
                                  {format(new Date(facture.date), 'dd/MM/yyyy', { locale })}
                                </p>
                              </div>
                              <span className={`px-3 py-1 text-xs rounded-full font-medium ${getFactureStatusColor(facture.statut)}`}>
                                {facture.statut}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">{t('common.total')}</p>
                                <p className="text-sm font-bold text-gray-900">{facture.montant_total}€</p>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">{t('common.paid')}</p>
                                <p className="text-sm text-green-600">{facture.montant_paye}€</p>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">{t('common.remaining')}</p>
                                <p className={`text-sm font-medium ${facture.montant_restant > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {facture.montant_restant}€
                                </p>
                              </div>
                            </div>

                            {(facture as any).facture_details && (facture as any).facture_details.length > 0 && (
                              <div className="bg-purple-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-purple-800 mb-2">{t('common.details')}</p>
                                {(facture as any).facture_details.map((detail: any, index: number) => (
                                  <div key={index} className="flex justify-between text-sm text-purple-900">
                                    <span>{detail.description} (x{detail.quantite})</span>
                                    <span className="font-medium">{detail.total}€</span>
                                  </div>
                                ))}
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('patient.modal.no.invoices')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('patient.modal.no.invoices.subtitle')}
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

            {/* Rendez-vous Tab */}
            {activeTab === 'rendez-vous' && showCabinetFeatures && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{t('patient.modal.appointments')}</h3>
                  <button
                    onClick={() => setShowRendezVousModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('patient.modal.new.appointment')}
                  </button>
                </div>

                {rendezVous.length > 0 ? (
                  <div className="space-y-4">
                    {rendezVous.map((rdv) => (
                      <div key={rdv.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{rdv.motif}</h4>
                                <p className="text-sm text-gray-600">
                                  {format(new Date(rdv.date), 'dd/MM/yyyy', { locale })}
                                </p>
                              </div>
                              <span className={`px-3 py-1 text-xs rounded-full font-medium ${getRdvStatusColor(rdv.statut)}`}>
                                {rdv.statut}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">{t('common.time')}</p>
                                <p className="text-sm text-gray-900">{rdv.heure_debut} - {rdv.heure_fin}</p>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">{t('common.type')}</p>
                                <p className="text-sm text-gray-900">{rdv.type}</p>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">{t('common.doctor')}</p>
                                <p className="text-sm text-gray-900">{rdv.medecinNom}</p>
                              </div>
                            </div>

                            {rdv.notes && (
                              <div className="bg-orange-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-orange-800 mb-1">{t('common.notes')}</p>
                                <p className="text-sm text-orange-900">{rdv.notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <button className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors">
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
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('patient.modal.no.appointments')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('patient.modal.no.appointments.subtitle')}
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
          </div>
        </div>
      </div>

      {/* Tavus Video Agent Modal */}
      {showTavusAgent && (
        <TavusVideoAgent
          patient={patientWithCompleteData || patient}
          isVisible={showTavusAgent}
          onClose={() => setShowTavusAgent(false)}
        />
      )}

      {/* Modals */}
      {showConsultationModal && (
        <ConsultationModal
          onClose={() => {
            setShowConsultationModal(false);
            handleDataUpdated();
          }}
          patientId={patient.id}
        />
      )}

      {showFactureModal && (
        <FactureModal
          onClose={() => {
            setShowFactureModal(false);
            handleDataUpdated();
          }}
          patientId={patient.id}
        />
      )}

      {showRendezVousModal && (
        <RendezVousModal
          onClose={() => {
            setShowRendezVousModal(false);
            handleDataUpdated();
          }}
          patientId={patient.id}
        />
      )}
    </>
  );
};