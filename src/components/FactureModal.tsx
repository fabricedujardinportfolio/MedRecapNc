import React, { useState } from 'react';
import { X, FileText, Euro, Calendar, User } from 'lucide-react';

interface FactureModalProps {
  onClose: () => void;
  patientId?: string;
  consultationId?: string;
}

export const FactureModal: React.FC<FactureModalProps> = ({ onClose, patientId, consultationId }) => {
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    consultationId: consultationId || '',
    numero: `F${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    date: new Date().toISOString().split('T')[0],
    dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    details: [
      { description: 'Consultation médicale', quantite: 1, prixUnitaire: 25, total: 25 }
    ],
    remboursement: {
      securiteSociale: 17.50,
      mutuelle: 7.50,
      restACharge: 0
    },
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvelle facture:', formData);
    onClose();
  };

  const addDetail = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { description: '', quantite: 1, prixUnitaire: 0, total: 0 }]
    }));
  };

  const updateDetail = (index: number, field: string, value: any) => {
    const newDetails = [...formData.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    
    if (field === 'quantite' || field === 'prixUnitaire') {
      newDetails[index].total = newDetails[index].quantite * newDetails[index].prixUnitaire;
    }
    
    setFormData(prev => ({ ...prev, details: newDetails }));
  };

  const montantTotal = formData.details.reduce((sum, detail) => sum + detail.total, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Facture</h2>
              <p className="text-gray-600">Créer une facture pour une consultation</p>
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
                <User className="w-5 h-5 text-purple-600" />
                Informations générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de facture
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    Date de facture
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={formData.dateEcheance}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateEcheance: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Détails de facturation */}
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Euro className="w-5 h-5 text-blue-600" />
                  Détails de facturation
                </h3>
                <button
                  type="button"
                  onClick={addDetail}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Ajouter une ligne
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.details.map((detail, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Description"
                        value={detail.description}
                        onChange={(e) => updateDetail(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Qté"
                        value={detail.quantite}
                        onChange={(e) => updateDetail(index, 'quantite', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Prix"
                        value={detail.prixUnitaire}
                        onChange={(e) => updateDetail(index, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={detail.total.toFixed(2)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => {
                          const newDetails = formData.details.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, details: newDetails }));
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      Total: {montantTotal.toFixed(2)} €
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Remboursement */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Remboursement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sécurité Sociale (€)
                  </label>
                  <input
                    type="number"
                    value={formData.remboursement.securiteSociale}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      remboursement: { ...prev.remboursement, securiteSociale: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mutuelle (€)
                  </label>
                  <input
                    type="number"
                    value={formData.remboursement.mutuelle}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      remboursement: { ...prev.remboursement, mutuelle: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reste à charge (€)
                  </label>
                  <input
                    type="number"
                    value={formData.remboursement.restACharge}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      remboursement: { ...prev.remboursement, restACharge: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Notes additionnelles..."
              />
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
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Créer la facture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};