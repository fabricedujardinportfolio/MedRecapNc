import React from 'react';
import { Search, Filter, Calendar, Users, AlertTriangle, Building } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types/Patient';
import { useLanguage } from '../hooks/useLanguage';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onReset: () => void;
  showCabinetFilters?: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  onReset,
  showCabinetFilters = false
}) => {
  const { t } = useLanguage();

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
        <h3 className="text-lg font-semibold text-gray-900">{t('filters.title')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search by Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('filters.name')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.nom || ''}
              onChange={(e) => handleFilterChange('nom', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('filters.name.placeholder')}
            />
          </div>
        </div>

        {/* Type de patient (Cabinet vs Hospitalier) */}
        {showCabinetFilters && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('filters.patient.type')}
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filters.typePatient || 'tous'}
                onChange={(e) => handleFilterChange('typePatient', e.target.value === 'tous' ? undefined : e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="tous">{t('filters.patient.type.all')}</option>
                <option value="cabinet">{t('filters.patient.type.cabinet')}</option>
                <option value="hospitalier">{t('filters.patient.type.hospital')}</option>
              </select>
            </div>
          </div>
        )}

        {/* Service Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('filters.service')}
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filters.service || ''}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">{t('filters.service.all')}</option>
              <option value="Cardiologie">{t('service.cardiology')}</option>
              <option value="Urgences">{t('service.emergency')}</option>
              <option value="Obstétrique">{t('service.obstetrics')}</option>
              <option value="Néphrologie">{t('service.nephrology')}</option>
              <option value="Chirurgie">{t('service.surgery')}</option>
              <option value="Médecine interne">{t('service.internal')}</option>
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('filters.status')}
          </label>
          <div className="relative">
            <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filters.statut || ''}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">{t('filters.status.all')}</option>
              <option value="Actif">{t('status.active')}</option>
              <option value="Urgence">{t('status.emergency')}</option>
              <option value="Sorti">{t('status.discharged')}</option>
              <option value="Transfert">{t('status.transfer')}</option>
            </select>
          </div>
        </div>

        {/* Alert Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('filters.alert')}
          </label>
          <div className="relative">
            <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filters.alerte || ''}
              onChange={(e) => handleFilterChange('alerte', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">{t('filters.alert.all')}</option>
              <option value="verte">{t('filters.alert.green')}</option>
              <option value="orange">{t('filters.alert.orange')}</option>
              <option value="rouge">{t('filters.alert.red')}</option>
            </select>
          </div>
        </div>

        {/* Prochain RDV Filter (Cabinet only) */}
        {showCabinetFilters && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('filters.appointments')}
            </label>
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={filters.prochainRendezVous || false}
                onChange={(e) => handleFilterChange('prochainRendezVous', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('filters.appointments.scheduled')}</span>
            </label>
          </div>
        )}

        {/* Date Range */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('filters.date')}
          </label>
          <div className="flex flex-wrap gap-2">
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
            {t('filters.age')}
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
              placeholder={t('filters.age.min')}
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
              placeholder={t('filters.age.max')}
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
          {t('filters.reset')}
        </button>
      </div>
    </div>
  );
};