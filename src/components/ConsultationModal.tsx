import React, { useState, useEffect } from 'react';
import { X, Stethoscope, User, Calendar, Clock, FileText, Pill } from 'lucide-react';
import { ConsultationData, patientService } from '../services/patientService';
import { useLanguage } from '../hooks/useLanguage';

interface ConsultationModalProps {
  onClose: () => void;
  patientId?: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({ onClose, patientId }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Array<{id: string, nom: string, prenom: string}>>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  
  const [formData, setFormData] = useState<Omit<ConsultationData, 'id'>>({
    patient_id: patientId || '',
    date: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().slice(0, 5),
    motif: '',
    diagnostic: '',
    traitement: '',
    observations: '',
    medecin_nom: 'Dr. Martin Dubois',
    duree: 30,
    type: 'consultation',
    statut: 'terminee',
    tarif: 25,
    tension: '',
    pouls: undefined,
    temperature: undefined,
    poids: undefined,
    taille: undefined
  });

  const [medicaments, setMedicaments] = useState([
    { nom: '', dosage: '', duree: '', instructions: '' }
  ]);

  const [arretTravail, setArretTravail] = useState({
    debut: '',
    fin: '',
    motif: ''
  });

  useEffect(() => {
    if (!patientId) {
      loadPatients();
    }
  }, [patientId]);

  const loadPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const patientsData = await patientService.getPatients();
      setPatients(patientsData.map(p => ({ id: p.id, nom: p.nom, prenom: p.prenom })));
    } catch (err) {
      setError('Erreur lors du chargement des patients');
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await patientService.createConsultation(formData);
      onClose();
    } catch (err) {
      setError('Erreur lors de la création de la consultation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Nouvelle Consultation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Patient Selection */}
          {!patientId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Patient
              </label>
              <select
                value={formData.patient_id}
                onChange={(e) => handleInputChange('patient_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoadingPatients}
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nom} {patient.prenom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date et Heure
              </label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Durée (minutes)
              </label>
              <input
                type="number"
                value={formData.duree}
                onChange={(e) => handleInputChange('duree', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="15"
                max="180"
              />
            </div>
          </div>

          {/* Motif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif de consultation
            </label>
            <input
              type="text"
              value={formData.motif}
              onChange={(e) => handleInputChange('motif', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Vital Signs */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Diagnostic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Diagnostic
            </label>
            <textarea
              value={formData.diagnostic}
              onChange={(e) => handleInputChange('diagnostic', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Traitement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Traitement
            </label>
            <textarea
              value={formData.traitement}
              onChange={(e) => handleInputChange('traitement', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Medicaments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                <Pill className="inline h-4 w-4 mr-1" />
                Médicaments prescrits
              </label>
              <button
                type="button"
                onClick={addMedicament}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Ajouter un médicament
              </button>
            </div>
            {medicaments.map((med, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border border-gray-200 rounded">
                <input
                  type="text"
                  placeholder="Nom du médicament"
                  value={med.nom}
                  onChange={(e) => updateMedicament(index, 'nom', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={med.dosage}
                  onChange={(e) => updateMedicament(index, 'dosage', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Durée"
                  value={med.duree}
                  onChange={(e) => updateMedicament(index, 'duree', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Instructions"
                    value={med.instructions}
                    onChange={(e) => updateMedicament(index, 'instructions', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {medicaments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicament(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observations
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Création...' : 'Créer la consultation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};