import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export const PaymentSuccess: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    // Simulate verification of the payment
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [sessionId]);
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('payment.verifying')}</h2>
            <p className="text-gray-600">{t('payment.please_wait')}</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('payment.success.title')}</h2>
              <p className="text-gray-600">{t('payment.success.description')}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-green-800 mb-2">{t('payment.success.details')}</h3>
              <p className="text-sm text-green-700 mb-4">{t('payment.success.confirmation')}</p>
              
              {sessionId && (
                <div className="bg-white rounded-md p-3 border border-green-200">
                  <p className="text-xs text-gray-500 mb-1">{t('payment.success.reference')}</p>
                  <p className="font-mono text-sm">{sessionId}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleBackToDashboard}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('payment.success.back_to_dashboard')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};