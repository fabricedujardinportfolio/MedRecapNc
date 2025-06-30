import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, AlertTriangle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { FactureData } from '../services/patientService';
import { stripeService } from '../services/stripeService';
import { useLanguage } from '../hooks/useLanguage';

interface StripePaymentModalProps {
  facture: FactureData;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  facture,
  isOpen,
  onClose,
  onPaymentComplete
}) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);

  // Initialize Stripe
  useEffect(() => {
    if (isOpen) {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      if (!stripeKey) {
        setError('Stripe public key is missing. Please check your environment variables.');
        return;
      }
      
      setStripePromise(loadStripe(stripeKey));
      initializePayment();
    }
  }, [isOpen, facture.id]);

  const initializePayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const amount = Math.round(facture.montant_restant * 100); // Convert to cents
      
      if (amount <= 0) {
        setError('No remaining amount to pay');
        setIsLoading(false);
        return;
      }
      
      const response = await stripeService.createPaymentIntent({
        amount,
        currency: 'eur',
        factureId: facture.id || '',
        patientId: facture.patient_id,
        description: `Payment for invoice ${facture.numero}`
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setClientSecret(response.clientSecret);
      setPaymentIntentId(response.paymentIntentId);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      setIsLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripePromise || !clientSecret) {
      setError('Payment system not initialized');
      return;
    }
    
    setPaymentStatus('processing');
    setError(null);
    
    try {
      const stripe = await stripePromise;
      
      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            // In a real implementation, you would use Stripe Elements here
            // This is a simplified version for demonstration
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2025,
            cvc: '123',
          },
        },
      });
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }
      
      // Update the invoice in the database
      if (paymentIntentId && facture.id) {
        const updated = await stripeService.updateInvoiceAfterPayment(facture.id, paymentIntentId);
        if (!updated) {
          throw new Error('Failed to update invoice after payment');
        }
      }
      
      setPaymentStatus('success');
      
      // Notify parent component
      setTimeout(() => {
        onPaymentComplete();
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setPaymentStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('payment.title')}</h2>
              <p className="text-gray-600">{t('payment.invoice')} {facture.numero}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={paymentStatus === 'processing'}
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {paymentStatus === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('payment.success.title')}</h3>
              <p className="text-gray-600 mb-4">{t('payment.success.message')}</p>
              <div className="bg-green-50 rounded-lg p-4 text-green-800 text-sm">
                {t('payment.success.reference')}: {paymentIntentId?.substring(0, 8)}...
              </div>
            </div>
          ) : paymentStatus === 'error' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('payment.error.title')}</h3>
              <p className="text-red-600 mb-4">{error || t('payment.error.message')}</p>
              <button
                onClick={initializePayment}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {t('payment.retry')}
              </button>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('payment.summary')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('payment.invoice_number')}</span>
                    <span className="font-medium">{facture.numero}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('payment.total_amount')}</span>
                    <span className="font-medium">{facture.montant_total.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('payment.amount_paid')}</span>
                    <span className="font-medium">{facture.montant_paye.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-800">{t('payment.amount_to_pay')}</span>
                    <span className="text-blue-600">{facture.montant_restant.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('payment.card_details')}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t('payment.demo_mode')}
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('payment.card_number')}
                    </label>
                    <input
                      type="text"
                      value="4242 4242 4242 4242"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('payment.test_card')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('payment.expiry')}
                      </label>
                      <input
                        type="text"
                        value="12/25"
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('payment.cvc')}
                      </label>
                      <input
                        type="text"
                        value="123"
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isLoading || paymentStatus === 'processing'}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !clientSecret || paymentStatus === 'processing'}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isLoading || paymentStatus === 'processing' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {paymentStatus === 'processing' ? t('payment.processing') : t('payment.initializing')}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      {t('payment.pay_now')} ({facture.montant_restant.toFixed(2)}€)
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};