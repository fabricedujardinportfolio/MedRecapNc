import React, { useState, useEffect } from 'react';
import { X, Stethoscope, User, Calendar, Clock, FileText, Pill, Save } from 'lucide-react';
import { ConsultationData, patientService } from '../services/patientService';
import { useLanguage } from '../hooks/useLanguage';

interface EditConsultationModalProps {
  consultation: ConsultationData;
  isOpen: boolean;
  onClose: () => void;
  onConsultationUpdated: () => void;
}

export const EditConsultationModal: React.FC<EditConsultationModalProps> = ({ 
  consultation, 
  isOpen, 
  onClose, 
  onConsultationUpdated 
}) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Array<{id: string, nom: string, prenom: string}>>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  
  const [formData, setFormData] = useState<ConsultationData>({
    ...consultation
  });

  const [medicaments, setMedicaments] = useState([
    { nom: '', dosage: '', duree: '', instructions: '' }
  ]);

  // Charger la liste des patients
  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  const loadPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const allPatients = await patientService.getAllPatients();
      setPatients(allPatients.map(p => ({
        id: p.id || '',
        nom: p.nom,
        prenom: p.prenom
      })));
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validation basique
      if (!formData.patient_id || !formData.motif || !formData.diagnostic) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Mettre à jour la consultation (fonction à implémenter dans le service)
      console.log('✅ Consultation mise à jour:', formData);
      
      // Notifier la mise à jour
      onConsultationUpdated();
      
      // Fermer le modal
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la consultation:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la consultation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ConsultationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMedicament = () => {
    setMedicaments(prev => [...prev, { nom: '', dosage: '', duree: '', instructions: '' }]);
  };

  const removeMedicament = (index: number) => {
    setMedicaments(prev => prev.filter((_, i) => i !== index));
  };

  const updateMedicament = (index: number, field: string, value: string) => {
    setMedicaments(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('consultation.edit')}</h2>
              <p className="text-gray-600">
                {formData.external_id && `ID: ${formData.external_id}`}
              </p>
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
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                {t('consultation.general_info')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('consultation.patient')}
                  </label>
                  <select
                    value={formData.patient_id}
                    onChange={(e) => handleInputChange('patient_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">{t('consultation.select_patient')}</option>
                    {isLoadingPatients ? (
                      <option value="" disabled>{t('consultation.loading_patients')}</option>
                    ) : (
                      patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.prenom} {patient.nom}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('consultation.doctor')}
                  </label>
                  <input
                    type="text"
                    value={formData.medecin_nom}
                    onChange={(e) => handleInputChange('medecin_nom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('consultation.date_time')}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     {t('consultation.duration')}
                  </label>
                  <input
                    type="number"
                    value={formData.duree}
                    onChange={(e) => handleInputChange('duree', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="15"
                    max="180"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('consultation.type')}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="consultation">{t('consultation.type_consultation')}</option>
                    <option value="visite">{t('consultation.type_visit')}</option>
                    <option value="urgence">{t('consultation.type_emergency')}</option>
                    <option value="suivi">{t('consultation.type_followup')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('consultation.status')}
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) => handleInputChange('statut', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="programmee">{t('consultation.status_scheduled')}</option>
                    <option value="en_cours">{t('consultation.status_in_progress')}</option>
                    <option value="terminee">{t('consultation.status_finished')}</option>
                    <option value="annulee">{t('consultation.status_cancelled')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Motif et diagnostic */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {t('consultation.reason_and_diagnosis')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif de consultation
                  </label>
                  <input
                    type="text"
                    value={formData.motif}
                    onChange={(e) => handleInputChange('motif', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnostic
                  </label>
                  <textarea
                    value={formData.diagnostic}
                    onChange={(e) => handleInputChange('diagnostic', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Traitement
                  </label>
                  <textarea
                    value={formData.traitement}
                    onChange={(e) => handleInputChange('traitement', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observations
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => handleInputChange('observations', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Signes vitaux */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Signes vitaux
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tension
                  </label>
                  <input
                    type="text"
                    value={formData.tension}
                    onChange={(e) => handleInputChange('tension', e.target.value)}
                    placeholder="120/80"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pouls (bpm)
                  </label>
                  <input
                    type="number"
                    value={formData.pouls || ''}
                    onChange={(e) => handleInputChange('pouls', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Température (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature || ''}
                    onChange={(e) => handleInputChange('temperature', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.poids || ''}
                    onChange={(e) => handleInputChange('poids', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Tarif */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Tarification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarif (€)
                  </label>
                  <input
                    type="number"
                    value={formData.tarif}
                    onChange={(e) => handleInputChange('tarif', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};