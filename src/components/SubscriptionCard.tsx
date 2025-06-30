import React, { useState } from 'react';
import { CreditCard, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { stripeService } from '../services/stripeService';
import { useLanguage } from '../hooks/useLanguage';

interface SubscriptionCardProps {
  productId: string;
  isSubscribed: boolean;
  currentPlan?: string | null;
  isLoading?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  productId,
  isSubscribed,
  currentPlan,
  isLoading = false
}) => {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const product = stripeService.getProductById(productId);
  
  if (!product) {
    return null;
  }

  const handleSubscribe = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      await stripeService.redirectToCheckout(productId);
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process subscription');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-blue-100">{product.description}</p>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">{t('subscription.loading')}</span>
          </div>
        ) : isSubscribed ? (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="font-medium text-green-800">{t('subscription.active')}</p>
                {currentPlan && (
                  <p className="text-sm text-green-700">{t('subscription.current_plan')}: {currentPlan}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-gray-800 font-medium">{t('subscription.price')}</span>
              </div>
              <span className="text-lg font-bold">25€ / {t('subscription.month')}</span>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                {t('subscription.benefit1')}
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                {t('subscription.benefit2')}
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                {t('subscription.benefit3')}
              </li>
            </ul>
            
            {error && (
              <div className="bg-red-50 rounded-lg p-3 mb-4 flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('subscription.processing')}
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  {t('subscription.subscribe')}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};