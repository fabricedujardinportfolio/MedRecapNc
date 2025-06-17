import React, { useState } from 'react';
import { X, User, Save, Calendar, MapPin, Phone, Heart, FileText } from 'lucide-react';
import { PatientData, patientService } from '../services/patientService';
import { useLanguage } from '../hooks/useLanguage';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded: (patient: PatientData) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientAdded
}) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<PatientData, 'id'>>({
    // Informations personnelles
    nom: '',
    prenom: '',
    sexe: 'M',
    date_naissance: '',
    age: 0,
    lieu_naissance: '',
    nationalite: 'French',
    numero_securite_sociale: '',
    situation_familiale: 'Single',
    
    // Coordonnées
    adresse_rue: '',
    adresse_ville: '',
    adresse_code_postal: '',
    adresse_pays: 'New Caledonia',
    telephone_portable: '',
    telephone_fixe: '',
    email: '',
    
    // Contact d'urgence
    contact_urgence_nom: '',
    contact_urgence_lien: '',
    contact_urgence_telephone: '',
    
    // Informations administratives
    numero_dossier: '', // Sera généré automatiquement
    date_admission: new Date().toISOString().split('T')[0],
    service: 'Médecine générale',
    mode_admission: 'Consultation',
    medecin_traitant: 'Dr. Martin Dubois',
    medecin_referent: 'Dr. Martin Dubois',
    statut_social: 'Employed',
    mutuelle: 'CAFAT',
    pris_en_charge: 'Full coverage',
    
    // Informations médicales
    antecedents_personnels: [],
    antecedents_familiaux: [],
    allergies: [],
    biometrie_poids: 0,
    biometrie_taille: 0,
    biometrie_imc: 0,
    groupe_sanguin: 'O+',
    antecedents_chirurgicaux: [],
    habitudes_vie_tabac: false,
    habitudes_vie_alcool: false,
    habitudes_vie_drogues: false,
    habitudes_vie_details: '',
    pathologies_connues: [],
    motif_hospitalisation: '',
    diagnostics: [],
    
    // Alertes et statut
    alerte_niveau: 'verte',
    alerte_message: '',
    statut: 'Actif',
    type_patient: 'cabinet',
    medecin_cabinet: 'Dr. Martin Dubois'
  });

  // Calculer l'âge automatiquement
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Calculer l'IMC automatiquement
  const calculateIMC = (poids: number, taille: number) => {
    if (!poids || !taille) return 0;
    const tailleM = taille / 100;
    return Math.round((poids / (tailleM * tailleM)) * 10) / 10;
  };

  const handleInputChange = (field: keyof PatientData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Calculer l'âge automatiquement
      if (field === 'date_naissance') {
        updated.age = calculateAge(value);
      }
      
      // Calculer l'IMC automatiquement
      if (field === 'biometrie_poids' || field === 'biometrie_taille') {
        updated.biometrie_imc = calculateIMC(
          field === 'biometrie_poids' ? value : updated.biometrie_poids || 0,
          field === 'biometrie_taille' ? value : updated.biometrie_taille || 0
        );
      }
      
      return updated;
    });
  };

  const handleArrayInputChange = (field: keyof PatientData, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validation basique
      if (!formData.nom || !formData.prenom || !formData.date_naissance) {
        throw new Error('Les champs nom, prénom et date de naissance sont obligatoires');
      }

      if (!formData.contact_urgence_nom || !formData.contact_urgence_telephone) {
        throw new Error('Les informations de contact d\'urgence sont obligatoires');
      }

      // Créer le patient
      const newPatient = await patientService.createPatient(formData);
      
      console.log('✅ Nouveau patient créé:', newPatient);
      
      // Notifier le parent
      onPatientAdded(newPatient);
      
      // Fermer le modal
      onClose();
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        prenom: '',
        sexe: 'M',
        date_naissance: '',
        age: 0,
        lieu_naissance: '',
        nationalite: 'French',
        numero_securite_sociale: '',
        situation_familiale: 'Single',
        adresse_rue: '',
        adresse_ville: '',
        adresse_code_postal: '',
        adresse_pays: 'New Caledonia',
        telephone_portable: '',
        telephone_fixe: '',
        email: '',
        contact_urgence_nom: '',
        contact_urgence_lien: '',
        contact_urgence_telephone: '',
        numero_dossier: '',
        date_admission: new Date().toISOString().split('T')[0],
        service: 'Médecine générale',
        mode_admission: 'Consultation',
        medecin_traitant: 'Dr. Martin Dubois',
        medecin_referent: 'Dr. Martin Dubois',
        statut_social: 'Employed',
        mutuelle: 'CAFAT',
        pris_en_charge: 'Full coverage',
        antecedents_personnels: [],
        antecedents_familiaux: [],
        allergies: [],
        biometrie_poids: 0,
        biometrie_taille: 0,
        biometrie_imc: 0,
        groupe_sanguin: 'O+',
        antecedents_chirurgicaux: [],
        habitudes_vie_tabac: false,
        habitudes_vie_alcool: false,
        habitudes_vie_drogues: false,
        habitudes_vie_details: '',
        pathologies_connues: [],
        motif_hospitalisation: '',
        diagnostics: [],
        alerte_niveau: 'verte',
        alerte_message: '',
        statut: 'Actif',
        type_patient: 'cabinet',
        medecin_cabinet: 'Dr. Martin Dubois'
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du patient:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la création du patient');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nouveau Patient</h2>
              <p className="text-gray-600">Ajouter un nouveau patient au système</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Informations personnelles */}
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Informations personnelles
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => handleInputChange('nom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={formData.prenom}
                        onChange={(e) => handleInputChange('prenom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sexe
                      </label>
                      <select
                        value={formData.sexe}
                        onChange={(e) => handleInputChange('sexe', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de naissance *
                      </label>
                      <input
                        type="date"
                        value={formData.date_naissance}
                        onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Âge
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lieu de naissance
                      </label>
                      <input
                        type="text"
                        value={formData.lieu_naissance}
                        onChange={(e) => handleInputChange('lieu_naissance', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationalité
                      </label>
                      <input
                        type="text"
                        value={formData.nationalite}
                        onChange={(e) => handleInputChange('nationalite', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de sécurité sociale
                    </label>
                    <input
                      type="text"
                      value={formData.numero_securite_sociale}
                      onChange={(e) => handleInputChange('numero_securite_sociale', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Coordonnées */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Coordonnées
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={formData.adresse_rue}
                      onChange={(e) => handleInputChange('adresse_rue', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Rue, numéro..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={formData.adresse_ville}
                        onChange={(e) => handleInputChange('adresse_ville', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal
                      </label>
                      <input
                        type="text"
                        value={formData.adresse_code_postal}
                        onChange={(e) => handleInputChange('adresse_code_postal', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays
                      </label>
                      <input
                        type="text"
                        value={formData.adresse_pays}
                        onChange={(e) => handleInputChange('adresse_pays', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone portable
                      </label>
                      <input
                        type="tel"
                        value={formData.telephone_portable}
                        onChange={(e) => handleInputChange('telephone_portable', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact d'urgence */}
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-600" />
                  Contact d'urgence *
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={formData.contact_urgence_nom}
                        onChange={(e) => handleInputChange('contact_urgence_nom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien de parenté
                      </label>
                      <input
                        type="text"
                        value={formData.contact_urgence_lien}
                        onChange={(e) => handleInputChange('contact_urgence_lien', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Époux, parent, ami..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_urgence_telephone}
                      onChange={(e) => handleInputChange('contact_urgence_telephone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Informations médicales */}
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  Informations médicales
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Groupe sanguin
                      </label>
                      <select
                        value={formData.groupe_sanguin}
                        onChange={(e) => handleInputChange('groupe_sanguin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => handleInputChange('service', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Médecine générale">Médecine générale</option>
                        <option value="Cardiologie">Cardiologie</option>
                        <option value="Urgences">Urgences</option>
                        <option value="Obstétrique">Obstétrique</option>
                        <option value="Néphrologie">Néphrologie</option>
                        <option value="Chirurgie">Chirurgie</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poids (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.biometrie_poids}
                        onChange={(e) => handleInputChange('biometrie_poids', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taille (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.biometrie_taille}
                        onChange={(e) => handleInputChange('biometrie_taille', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IMC
                      </label>
                      <input
                        type="number"
                        value={formData.biometrie_imc}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergies (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      value={formData.allergies.join(', ')}
                      onChange={(e) => handleArrayInputChange('allergies', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Pénicilline, fruits de mer..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Antécédents personnels (séparés par des virgules)
                    </label>
                    <textarea
                      value={formData.antecedents_personnels.join(', ')}
                      onChange={(e) => handleArrayInputChange('antecedents_personnels', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={2}
                      placeholder="Hypertension, diabète..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motif d'hospitalisation/consultation
                    </label>
                    <textarea
                      value={formData.motif_hospitalisation}
                      onChange={(e) => handleInputChange('motif_hospitalisation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={2}
                      placeholder="Décrivez le motif principal..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.habitudes_vie_tabac}
                        onChange={(e) => handleInputChange('habitudes_vie_tabac', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Tabac</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.habitudes_vie_alcool}
                        onChange={(e) => handleInputChange('habitudes_vie_alcool', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Alcool</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.habitudes_vie_drogues}
                        onChange={(e) => handleInputChange('habitudes_vie_drogues', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Drogues</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Statut et alertes */}
              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Statut et alertes
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statut
                      </label>
                      <select
                        value={formData.statut}
                        onChange={(e) => handleInputChange('statut', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="Actif">Actif</option>
                        <option value="Sorti">Sorti</option>
                        <option value="Transfert">Transfert</option>
                        <option value="Urgence">Urgence</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Niveau d'alerte
                      </label>
                      <select
                        value={formData.alerte_niveau}
                        onChange={(e) => handleInputChange('alerte_niveau', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="verte">Verte (Stable)</option>
                        <option value="orange">Orange (Surveillance)</option>
                        <option value="rouge">Rouge (Critique)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message d'alerte
                    </label>
                    <input
                      type="text"
                      value={formData.alerte_message}
                      onChange={(e) => handleInputChange('alerte_message', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Message d'alerte si nécessaire..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de patient
                      </label>
                      <select
                        value={formData.type_patient}
                        onChange={(e) => handleInputChange('type_patient', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="cabinet">Cabinet médical</option>
                        <option value="hospitalier">Hospitalier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Médecin référent
                      </label>
                      <input
                        type="text"
                        value={formData.medecin_referent}
                        onChange={(e) => handleInputChange('medecin_referent', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Créer le patient
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};