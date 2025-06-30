export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const products: Record<string, StripeProduct> = {
  consultation: {
    priceId: 'price_1RfYFRQwdxDYt9LWHFxCs6Gl',
    name: 'Consultation',
    description: 'Accès à une consultation médicale',
    mode: 'subscription'
  }
};