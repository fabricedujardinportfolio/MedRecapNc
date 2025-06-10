import React from 'react';
import { Search, Filter, Calendar, Users, AlertTriangle } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types/Patient';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onReset: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  onReset 
}) => {
  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Recherche et Filtres</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search by Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du patient
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.nom || ''}
              onChange={(e) => handleFilterChange('nom', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rechercher un nom..."
            />
          </div>
        </div>

        {/* Service Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filters.service || ''}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Tous les services</option>
              <option value="Cardiologie">Cardiologie</option>
              <option value="Urgences">Urgences</option>
              <option value="Obstétrique">Obstétrique</option>
              <option value="Néphrologie">Néphrologie</option>
              <option value="Chirurgie">Chirurgie</option>
              <option value="Médecine interne">Médecine interne</option>
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <div className="relative">
            <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filters.statut || ''}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Urgence">Urgence</option>
              <option value="Sorti">Sorti</option>
              <option value="Transfert">Transfert</option>
            </select>
          </div>
        </div>

        {/* Alert Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau d'alerte
          </label>
          <div className="relative">
            <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filters.alerte || ''}
              onChange={(e) => handleFilterChange('alerte', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Toutes les alertes</option>
              <option value="verte">Verte (Stable)</option>
              <option value="orange">Orange (Surveillance)</option>
              <option value="rouge">Rouge (Critique)</option>
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Période d'admission
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.dateAdmissionDebut || ''}
                onChange={(e) => handleFilterChange('dateAdmissionDebut', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <span className="flex items-center text-gray-500">à</span>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.dateAdmissionFin || ''}
                onChange={(e) => handleFilterChange('dateAdmissionFin', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Age Range */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tranche d'âge
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.age?.min || ''}
              onChange={(e) => handleFilterChange('age', { 
                ...filters.age, 
                min: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Âge min"
              min="0"
              max="120"
            />
            <span className="flex items-center text-gray-500">à</span>
            <input
              type="number"
              value={filters.age?.max || ''}
              onChange={(e) => handleFilterChange('age', { 
                ...filters.age, 
                max: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Âge max"
              min="0"
              max="120"
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
};