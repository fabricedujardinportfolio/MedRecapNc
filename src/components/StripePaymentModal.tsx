import React, { useState, useEffect } from 'react';
import { X, FileText, Euro, Calendar, User, CreditCard, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FactureData } from '../services/patientService';
import { useLanguage } from '../hooks/useLanguage';
import { stripeService } from '../services/stripeService';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripePaymentModalProps {
  facture: FactureData;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const PaymentForm: React.FC<{
  facture: FactureData;
  onClose: () => void;
  onPaymentComplete: () => void;
}> = ({ facture, onClose, onPaymentComplete }) => {
  const { t } = useLanguage();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Calculate the amount to pay (remaining balance)
  const amountToPay = facture.montant_restant;

  useEffect(() => {
    const getPaymentIntent = async () => {
      try {
        const { clientSecret } = await stripeService.createPaymentIntent(
          facture.id,
          amountToPay
        );
        setClientSecret(clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setPaymentError(
          error instanceof Error 
            ? error.message 
            : t('payment.error.intent')
        );
      }
    };

    if (amountToPay > 0) {
      getPaymentIntent();
    }
  }, [facture.id, amountToPay, t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setPaymentError(t('payment.error.card_element'));
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${facture.patient_name || 'Patient'} - Invoice #${facture.numero}`,
          },
        },
      });

      if (error) {
        setPaymentError(error.message || t('payment.error.generic'));
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful
        setPaymentSuccess(true);
        
        // Update the invoice in the database
        await stripeService.updateInvoiceAfterPayment(
          facture.id, 
          amountToPay,
          paymentIntent.id
        );
        
        // Notify parent component
        setTimeout(() => {
          onPaymentComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(
        error instanceof Error 
          ? error.message 
          : t('payment.error.generic')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Details */}
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('payment.invoice_details')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">{t('payment.invoice_number')}</p>
              <p className="font-medium">{facture.numero}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('payment.date')}</p>
              <p className="font-medium">{facture.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('payment.total_amount')}</p>
              <p className="font-medium">{facture.montant_total.toFixed(2)}€</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('payment.amount_to_pay')}</p>
              <p className="font-medium text-blue-600">{amountToPay.toFixed(2)}€</p>
            </div>
          </div>
        </div>

        {/* Card Element */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('payment.card_details')}
          </label>
          <div className="p-4 border border-gray-300 rounded-lg bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {t('payment.secure_processing')}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">{t('payment.error.title')}</h4>
            <p className="text-sm text-red-700">{paymentError}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {paymentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800">{t('payment.success.title')}</h4>
            <p className="text-sm text-green-700">{t('payment.success.message')}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing || paymentSuccess}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          {paymentSuccess ? t('payment.close') : t('payment.cancel')}
        </button>
        {!paymentSuccess && (
          <button
            type="submit"
            disabled={!stripe || !elements || isProcessing || amountToPay <= 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('payment.processing')}
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                {t('payment.pay_now', { amount: amountToPay.toFixed(2) })}
              </>
            )}
          </button>
        )}
      </div>

      {/* Stripe Info */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <CreditCard className="w-3 h-3" />
        <span>{t('payment.powered_by_stripe')}</span>
        <a 
          href="https://stripe.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>Stripe</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </form>
  );
};

export const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  facture,
  isOpen,
  onClose,
  onPaymentComplete,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('payment.title')}</h2>
              <p className="text-gray-600">{t('payment.subtitle')}</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Elements stripe={stripePromise}>
            <PaymentForm 
              facture={facture} 
              onClose={onClose} 
              onPaymentComplete={onPaymentComplete} 
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};