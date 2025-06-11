import React, { useState } from 'react';
import { X, Calendar, Clock, User, MapPin } from 'lucide-react';

interface RendezVousModalProps {
  onClose: () => void;
  patientId?: string;
}

export const RendezVousModal: React.FC<RendezVousModalProps> = ({ onClose, patientId }) => {
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    date: new Date().toISOString().split('T')[0],
    heureDebut: '09:00',
    heureFin: '09:30',
    motif: '',
    type: 'consultation',
    salle: 'Cabinet 1',
    notes: '',
    rappelEnvoye: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouveau rendez-vous:', formData);
    onClose();
  };

  const updateHeureFin = (heureDebut: string) => {
    const [hours, minutes] = heureDebut.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(hours, minutes + 30, 0, 0);
    const heureFin = endTime.toTimeString().slice(0, 5);
    setFormData(prev => ({ ...prev, heureDebut, heureFin }));
  };

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
              <h2 className="text-xl font-bold text-gray-900">Nouveau Rendez-vous</h2>
              <p className="text-gray-600">Planifier un rendez-vous patient</p>
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
                Patient et motif
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    <option value="PAT-001">Marie Dubois</option>
                    <option value="PAT-002">Pierre Kanak</option>
                    <option value="PAT-003">Sarah Johnson</option>
                    <option value="PAT-004">Jean Tamate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de rendez-vous
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="suivi">Suivi</option>
                    <option value="urgence">Urgence</option>
                    <option value="visite">Visite à domicile</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif du rendez-vous
                  </label>
                  <textarea
                    value={formData.motif}
                    onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Décrivez le motif du rendez-vous..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Planification */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Planification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salle/Cabinet
                  </label>
                  <select
                    value={formData.salle}
                    onChange={(e) => setFormData(prev => ({ ...prev, salle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Cabinet 1">Cabinet 1</option>
                    <option value="Cabinet 2">Cabinet 2</option>
                    <option value="Salle d'examen">Salle d'examen</option>
                    <option value="Domicile">Domicile patient</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={formData.heureDebut}
                    onChange={(e) => updateHeureFin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={formData.heureFin}
                    onChange={(e) => setFormData(prev => ({ ...prev, heureFin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Options et notes
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.rappelEnvoye}
                      onChange={(e) => setFormData(prev => ({ ...prev, rappelEnvoye: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Envoyer un rappel automatique
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6">
                    Un SMS/email de rappel sera envoyé 24h avant le rendez-vous
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes internes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Notes pour le personnel médical..."
                  />
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
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Planifier le rendez-vous
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};