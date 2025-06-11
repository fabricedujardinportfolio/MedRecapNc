import React, { useState } from 'react';
import { X, Stethoscope, User, Calendar, Clock, FileText, Pill } from 'lucide-react';

interface ConsultationModalProps {
  onClose: () => void;
  patientId?: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({ onClose, patientId }) => {
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    date: new Date().toISOString().split('T')[0],
    heure: new Date().toTimeString().slice(0, 5),
    motif: '',
    diagnostic: '',
    traitement: '',
    observations: '',
    duree: 30,
    type: 'consultation',
    tarif: 25,
    signesVitaux: {
      tension: '',
      pouls: '',
      temperature: '',
      poids: '',
      taille: ''
    },
    medicaments: [{ nom: '', dosage: '', duree: '', instructions: '' }],
    examens: [''],
    arretTravail: {
      active: false,
      duree: 0,
      motif: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici on sauvegarderait la consultation
    console.log('Nouvelle consultation:', formData);
    onClose();
  };

  const addMedicament = () => {
    setFormData(prev => ({
      ...prev,
      medicaments: [...prev.medicaments, { nom: '', dosage: '', duree: '', instructions: '' }]
    }));
  };

  const addExamen = () => {
    setFormData(prev => ({
      ...prev,
      examens: [...prev.examens, '']
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Consultation</h2>
              <p className="text-gray-600">Enregistrer une consultation médicale</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations générales */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Informations générales
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient
                    </label>
                    <select
                      value={formData.patientId}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionner un patient</option>
                      <option value="PAT-001">Marie Dubois</option>
                      <option value="PAT-002">Pierre Kanak</option>
                      <option value="PAT-003">Sarah Johnson</option>
                      <option value="PAT-004">Jean Tamate</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
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
                        Heure
                      </label>
                      <input
                        type="time"
                        value={formData.heure}
                        onChange={(e) => setFormData(prev => ({ ...prev, heure: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="consultation">Consultation</option>
                        <option value="suivi">Suivi</option>
                        <option value="urgence">Urgence</option>
                        <option value="visite">Visite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée (min)
                      </label>
                      <input
                        type="number"
                        value={formData.duree}
                        onChange={(e) => setFormData(prev => ({ ...prev, duree: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="15"
                        max="120"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motif de consultation
                    </label>
                    <textarea
                      value={formData.motif}
                      onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Signes vitaux */}
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-red-600" />
                  Signes vitaux
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tension artérielle
                    </label>
                    <input
                      type="text"
                      value={formData.signesVitaux.tension}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        signesVitaux: { ...prev.signesVitaux, tension: e.target.value }
                      }))}
                      placeholder="120/80"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pouls (bpm)
                    </label>
                    <input
                      type="number"
                      value={formData.signesVitaux.pouls}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        signesVitaux: { ...prev.signesVitaux, pouls: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Température (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.signesVitaux.temperature}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        signesVitaux: { ...prev.signesVitaux, temperature: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.signesVitaux.poids}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        signesVitaux: { ...prev.signesVitaux, poids: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic et traitement */}
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Diagnostic et traitement
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnostic
                    </label>
                    <textarea
                      value={formData.diagnostic}
                      onChange={(e) => setFormData(prev => ({ ...prev, diagnostic: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Traitement
                    </label>
                    <textarea
                      value={formData.traitement}
                      onChange={(e) => setFormData(prev => ({ ...prev, traitement: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observations
                    </label>
                    <textarea
                      value={formData.observations}
                      onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tarif (€)
                    </label>
                    <input
                      type="number"
                      value={formData.tarif}
                      onChange={(e) => setFormData(prev => ({ ...prev, tarif: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Ordonnance */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-green-600" />
                  Ordonnance
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Médicaments
                      </label>
                      <button
                        type="button"
                        onClick={addMedicament}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Ajouter
                      </button>
                    </div>
                    {formData.medicaments.map((med, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Nom du médicament"
                          value={med.nom}
                          onChange={(e) => {
                            const newMeds = [...formData.medicaments];
                            newMeds[index].nom = e.target.value;
                            setFormData(prev => ({ ...prev, medicaments: newMeds }));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={med.dosage}
                          onChange={(e) => {
                            const newMeds = [...formData.medicaments];
                            newMeds[index].dosage = e.target.value;
                            setFormData(prev => ({ ...prev, medicaments: newMeds }));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Arrêt de travail */}
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.arretTravail.active}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          arretTravail: { ...prev.arretTravail, active: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Arrêt de travail</span>
                    </label>
                    {formData.arretTravail.active && (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Durée (jours)"
                          value={formData.arretTravail.duree}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            arretTravail: { ...prev.arretTravail, duree: parseInt(e.target.value) }
                          }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Motif"
                          value={formData.arretTravail.motif}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            arretTravail: { ...prev.arretTravail, motif: e.target.value }
                          }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Enregistrer la consultation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};