import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export const PaymentCancel: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('payment.cancel.title')}</h2>
          <p className="text-gray-600">{t('payment.cancel.description')}</p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">{t('payment.cancel.note')}</h3>
          </div>
          <p className="text-sm text-yellow-700">{t('payment.cancel.message')}</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleBackToDashboard}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('payment.cancel.back_to_dashboard')}
          </button>
          
          <button
            onClick={() => navigate('/subscription')}
            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            {t('payment.cancel.try_again')}
          </button>
        </div>
      </div>
    </div>
  );
};