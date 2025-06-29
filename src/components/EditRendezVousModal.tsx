import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MapPin, Save } from 'lucide-react';
import { RendezVousData, patientService, supabase } from '../services/patientService';
import { useLanguage } from '../hooks/useLanguage';

interface EditRendezVousModalProps {
  rendezVous: RendezVousData;
  isOpen: boolean;
  onClose: () => void;
  onRendezVousUpdated: () => void;
}

export const EditRendezVousModal: React.FC<EditRendezVousModalProps> = ({ 
  rendezVous, 
  isOpen, 
  onClose, 
  onRendezVousUpdated 
}) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Array<{id: string, nom: string, prenom: string}>>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  
  const [formData, setFormData] = useState<RendezVousData>({
    ...rendezVous
  });

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
      if (!formData.patient_id || !formData.patient_nom || !formData.date || !formData.motif) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Mettre à jour le rendez-vous
      const { data, error } = await supabase
        .from('rendez_vous')
        .update({
          patient_id: formData.patient_id,
          patient_nom: formData.patient_nom,
          date: formData.date,
          heure_debut: formData.heure_debut,
          heure_fin: formData.heure_fin,
          motif: formData.motif,
          type: formData.type,
          statut: formData.statut,
          medecin_id: formData.medecin_id,
          medecin_nom: formData.medecin_nom,
          salle: formData.salle,
          notes: formData.notes,
          rappel_envoye: formData.rappel_envoye
        })
        .eq('id', rendezVous.id)
        .select();

      if (error) {
        throw error;
      }

      console.log('✅ Rendez-vous mis à jour:', data);
      
      // Notifier la mise à jour
      onRendezVousUpdated();
      
      // Fermer le modal
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du rendez-vous:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du rendez-vous');
    } finally {
      setIsLoading(false);
    }
  };

  const updateHeureFin = (heureDebut: string) => {
    const [hours, minutes] = heureDebut.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(hours, minutes + 30, 0, 0);
    const heureFin = endTime.toTimeString().slice(0, 5);
    setFormData(prev => ({ ...prev, heure_debut: heureDebut, heure_fin: heureFin }));
  };

  // Mettre à jour le nom du patient quand l'ID change
  const handlePatientChange = (patientId: string) => {
    const selectedPatient = patients.find(p => p.id === patientId);
    if (selectedPatient) {
      setFormData(prev => ({ 
        ...prev, 
        patient_id: patientId,
        patient_nom: `${selectedPatient.prenom} ${selectedPatient.nom}`
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        patient_id: patientId,
        patient_nom: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-600 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('appointment.edit')}</h2>
              <p className="text-gray-600">
                {rendezVous.external_id && `ID: ${rendezVous.external_id}`}
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
            {/* Informations patient */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" />
                {t('appointment.patient_info')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.patient')}
                  </label>
                  <select
                    value={formData.patient_id}
                    onChange={(e) => handlePatientChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">{t('appointment.select_patient')}</option>
                    {isLoadingPatients ? (
                      <option value="" disabled>{t('appointment.loading_patients')}</option>
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
                    {t('appointment.type')}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="consultation">{t('appointment.type_consultation')}</option>
                    <option value="suivi">{t('appointment.type_followup')}</option>
                    <option value="urgence">{t('appointment.type_emergency')}</option>
                    <option value="visite">{t('appointment.type_visit')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('appointment.reason')}
                  </label>
                  <textarea
                    value={formData.motif}
                    onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder={t('appointment.reason_placeholder')}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Planification */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                {t('appointment.scheduling')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.date')}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('appointment.location')}
                  </label>
                  <select
                    value={formData.salle}
                    onChange={(e) => setFormData(prev => ({ ...prev, salle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Cabinet 1">{t('appointment.office')} 1</option>
                    <option value="Cabinet 2">{t('appointment.office')} 2</option>
                    <option value="Salle d'examen">{t('appointment.exam_room')}</option>
                    <option value="Domicile">{t('appointment.patient_home')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('appointment.start_time')}
                  </label>
                  <input
                    type="time"
                    value={formData.heure_debut}
                    onChange={(e) => updateHeureFin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('appointment.end_time')}
                  </label>
                  <input
                    type="time"
                    value={formData.heure_fin}
                    onChange={(e) => setFormData(prev => ({ ...prev, heure_fin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Statut et options */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                {t('appointment.status_options')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.status')}
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="programme">{t('appointment.status.scheduled')}</option>
                    <option value="confirme">{t('appointment.status.confirmed')}</option>
                    <option value="en_cours">{t('appointment.status.ongoing')}</option>
                    <option value="termine">{t('appointment.status.completed')}</option>
                    <option value="annule">{t('appointment.status.cancelled')}</option>
                    <option value="reporte">{t('appointment.status.postponed')}</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.rappel_envoye}
                      onChange={(e) => setFormData(prev => ({ ...prev, rappel_envoye: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {t('appointment.send_reminder')}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6">
                    {t('appointment.reminder_description')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.notes_optional')}
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder={t('appointment.notes_placeholder')}
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
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('common.updating')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('common.save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};