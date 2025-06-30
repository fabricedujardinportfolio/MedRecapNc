import React, { useState, useEffect } from 'react';
import { Shield, CreditCard, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { stripeService } from '../services/stripeService';
import { useLanguage } from '../hooks/useLanguage';
import { products } from '../stripe-config';

export const SubscriptionPage: React.FC = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        const data = await stripeService.getUserSubscription();
        setSubscription(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError(err instanceof Error ? err.message : 'Failed to load subscription data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscription();
  }, []);
  
  const isSubscribed = subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing';
  const currentPlan = subscription?.price_id ? stripeService.getProductNameByPriceId(subscription.price_id) : null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">MedRecap+</h1>
                <p className="text-xs text-gray-500">{t('subscription.page.title')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('subscription.page.heading')}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t('subscription.page.description')}</p>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">{t('subscription.loading')}</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">{t('subscription.error.title')}</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {t('subscription.error.retry')}
            </button>
          </div>
        ) : (
          <>
            {isSubscribed && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-3xl mx-auto mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">{t('subscription.active.title')}</h3>
                </div>
                <p className="text-green-700 mb-4">
                  {t('subscription.active.message', { plan: currentPlan || t('subscription.plan') })}
                </p>
                
                {subscription.current_period_end && (
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-sm text-gray-600">
                      {t('subscription.active.renewal', { 
                        date: new Date(subscription.current_period_end * 1000).toLocaleDateString() 
                      })}
                    </p>
                    {subscription.cancel_at_period_end && (
                      <p className="text-sm text-orange-600 mt-2">
                        {t('subscription.active.cancels_at_end')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.keys(products).map(productId => (
                <SubscriptionCard
                  key={productId}
                  productId={productId}
                  isSubscribed={isSubscribed && subscription?.price_id === products[productId].priceId}
                  currentPlan={currentPlan}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};