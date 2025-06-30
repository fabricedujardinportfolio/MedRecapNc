import { supabase } from './patientService';

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  factureId: string;
  patientId: string;
  description: string;
}

interface StripePaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
  error?: string;
}

class StripeService {
  private static instance: StripeService;
  private apiUrl: string;

  constructor() {
    // Use Supabase Edge Function URL
    this.apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe`;
  }

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<StripePaymentResponse> {
    try {
      const { amount, currency, factureId, patientId, description } = params;
      
      // Get Supabase auth token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.apiUrl}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          currency,
          factureId,
          patientId,
          description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        clientSecret: '',
        paymentIntentId: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateInvoiceAfterPayment(factureId: string, paymentIntentId: string): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.apiUrl}/update-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          factureId,
          paymentIntentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update invoice');
      }

      return true;
    } catch (error) {
      console.error('Error updating invoice after payment:', error);
      return false;
    }
  }
}

export const stripeService = StripeService.getInstance();