import React, { useState, useEffect } from 'react';
import { X, FileText, Euro, Calendar, User, Save } from 'lucide-react';
import { FactureData, patientService } from '../services/patientService';
import { useLanguage } from '../hooks/useLanguage';

interface EditFactureModalProps {
  facture: FactureData;
  isOpen: boolean;
  onClose: () => void;
  onFactureUpdated: () => void;
}

export const EditFactureModal: React.FC<EditFactureModalProps> = ({ 
  facture, 
  isOpen, 
  onClose, 
  onFactureUpdated 
}) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Array<{id: string, nom: string, prenom: string}>>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  
  const [formData, setFormData] = useState<FactureData>({
    ...facture,
    details: facture.details || [
      { description: 'Consultation médicale', quantite: 1, prix_unitaire: 25, total: 25 }
    ]
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
      if (!formData.patient_id || !formData.numero || !formData.date) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }
      
      // Mettre à jour la facture
      const updatedFacture = {
        ...formData,
        // Convertir les valeurs numériques
        montant_total: typeof formData.montant_total === 'string' ? parseFloat(formData.montant_total) : formData.montant_total,
        montant_paye: typeof formData.montant_paye === 'string' ? parseFloat(formData.montant_paye) : formData.montant_paye,
        montant_restant: typeof formData.montant_restant === 'string' ? parseFloat(formData.montant_restant) : formData.montant_restant,
        remboursement_securite_sociale: typeof formData.remboursement_securite_sociale === 'string' ? parseFloat(formData.remboursement_securite_sociale) : formData.remboursement_securite_sociale,
        remboursement_mutuelle: typeof formData.remboursement_mutuelle === 'string' ? parseFloat(formData.remboursement_mutuelle) : formData.remboursement_mutuelle,
        remboursement_reste_a_charge: typeof formData.remboursement_reste_a_charge === 'string' ? parseFloat(formData.remboursement_reste_a_charge) : formData.remboursement_reste_a_charge,
      };
      
      // Appeler le service de mise à jour (à implémenter)
      console.log('✅ Facture mise à jour:', updatedFacture);
      
      // Notifier la mise à jour
      onFactureUpdated();
      
      // Fermer le modal
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la facture:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la facture');
    } finally {
      setIsLoading(false);
    }
  };

  const addDetail = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { description: '', quantite: 1, prix_unitaire: 0, total: 0 }]
    }));
  };

  const updateDetail = (index: number, field: string, value: any) => {
    const newDetails = [...formData.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    
    if (field === 'quantite' || field === 'prix_unitaire') {
      newDetails[index].total = newDetails[index].quantite * newDetails[index].prix_unitaire;
    }
    
    setFormData(prev => ({ ...prev, details: newDetails }));
    
    // Recalculer le montant total
    const montantTotal = newDetails.reduce((sum, detail) => sum + detail.total, 0);
    setFormData(prev => ({ 
      ...prev, 
      montant_total: montantTotal,
      montant_restant: montantTotal - prev.montant_paye
    }));
  };

  // Mettre à jour le montant restant quand le montant payé change
  const updateMontantPaye = (value: number) => {
    setFormData(prev => ({ 
      ...prev, 
      montant_paye: value,
      montant_restant: prev.montant_total - value,
      statut: value === 0 ? 'en_attente' : 
              value === prev.montant_total ? 'payee' : 
              'partiellement_payee'
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t('invoice.edit')}
              </h2>
              <p className="text-gray-600">
                {t('invoice')} {formData.numero}</p>
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
                {t('common.general_info')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('invoice.number')}
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
                    {t('invoice.patient')}
                  </label>
                  <select
                    value={formData.patient_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {isLoadingPatients ? (
                      <option value="" disabled>Chargement des patients...</option>
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
                    value={formData.date_echeance}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_echeance: e.target.value }))}
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
                        value={detail.prix_unitaire}
                        onChange={(e) => updateDetail(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
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
                          
                          // Recalculer le montant total
                          const montantTotal = newDetails.reduce((sum, d) => sum + d.total, 0);
                          setFormData(prev => ({ 
                            ...prev, 
                            montant_total: montantTotal,
                            montant_restant: montantTotal - prev.montant_paye
                          }));
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
                      Total: {formData.montant_total.toFixed(2)} €
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Paiement et remboursement */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Paiement et remboursement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant payé (€)
                  </label>
                  <input
                    type="number"
                    value={formData.montant_paye}
                    onChange={(e) => updateMontantPaye(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                    max={formData.montant_total}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reste à payer (€)
                  </label>
                  <input
                    type="number"
                    value={formData.montant_restant.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="en_attente">En attente</option>
                    <option value="partiellement_payee">Partiellement payée</option>
                    <option value="payee">Payée</option>
                    <option value="en_retard">En retard</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Méthode de paiement
                  </label>
                  <select
                    value={formData.methode_paiement || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, methode_paiement: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="especes">Espèces</option>
                    <option value="carte">Carte bancaire</option>
                    <option value="cheque">Chèque</option>
                    <option value="virement">Virement</option>
                    <option value="securite_sociale">Sécurité sociale</option>
                  </select>
                </div>
              </div>
              
              <h4 className="text-sm font-medium text-gray-700 mb-2">Remboursement</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Sécurité Sociale (€)
                  </label>
                  <input
                    type="number"
                    value={formData.remboursement_securite_sociale}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      remboursement_securite_sociale: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Mutuelle (€)
                  </label>
                  <input
                    type="number"
                    value={formData.remboursement_mutuelle}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      remboursement_mutuelle: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Reste à charge (€)
                  </label>
                  <input
                    type="number"
                    value={formData.remboursement_reste_a_charge}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      remboursement_reste_a_charge: parseFloat(e.target.value) || 0
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
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Notes additionnelles..."
              />
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
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors flex items-center gap-2"
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