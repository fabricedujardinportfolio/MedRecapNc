import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { stripeService } from '../services/stripeService';
import { useLanguage } from '../hooks/useLanguage';

export const SubscriptionStatus: React.FC = () => {
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
  
  if (isLoading) {
    return (
      <div className="flex items-center text-gray-600">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        <span className="text-sm">{t('subscription.loading')}</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center text-red-600">
        <AlertCircle className="w-4 h-4 mr-2" />
        <span className="text-sm">{t('subscription.error')}</span>
      </div>
    );
  }
  
  if (!subscription || !subscription.subscription_id) {
    return (
      <div className="flex items-center text-gray-600">
        <XCircle className="w-4 h-4 mr-2 text-gray-500" />
        <span className="text-sm">{t('subscription.none')}</span>
      </div>
    );
  }
  
  const isActive = subscription.subscription_status === 'active' || subscription.subscription_status === 'trialing';
  const productName = subscription.price_id ? stripeService.getProductNameByPriceId(subscription.price_id) : '';
  
  if (isActive) {
    return (
      <div className="flex items-center text-green-600">
        <CheckCircle className="w-4 h-4 mr-2" />
        <span className="text-sm">{productName || t('subscription.active')}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-orange-600">
      <Clock className="w-4 h-4 mr-2" />
      <span className="text-sm">{t(`subscription.status.${subscription.subscription_status}`)}</span>
    </div>
  );
};