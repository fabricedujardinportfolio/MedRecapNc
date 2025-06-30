import { createClient } from '@supabase/supabase-js';
import { products } from '../stripe-config';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

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

interface CheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode: 'payment' | 'subscription';
}

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  error?: string;
}

interface SubscriptionData {
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

class StripeService {
  private static instance: StripeService;

  constructor() {}

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

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe/create-payment-intent`, {
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

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe/update-invoice`, {
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

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResponse> {
    try {
      const { priceId, successUrl, cancelUrl, mode } = params;
      
      // Get Supabase auth token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: successUrl,
          cancel_url: cancelUrl,
          mode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      return {
        sessionId: data.sessionId,
        url: data.url
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        sessionId: '',
        url: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async redirectToCheckout(productId: string): Promise<void> {
    try {
      const product = products[productId];
      
      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }
      
      const { url, error } = await this.createCheckoutSession({
        priceId: product.priceId,
        successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
        mode: product.mode
      });
      
      if (error) {
        throw new Error(error);
      }
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }

  async getUserSubscription(): Promise<SubscriptionData | null> {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  async isSubscribed(): Promise<boolean> {
    const subscription = await this.getUserSubscription();
    return subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing';
  }

  getProductNameByPriceId(priceId: string): string {
    for (const [key, product] of Object.entries(products)) {
      if (product.priceId === priceId) {
        return product.name;
      }
    }
    return 'Unknown Product';
  }
}

export const stripeService = StripeService.getInstance();