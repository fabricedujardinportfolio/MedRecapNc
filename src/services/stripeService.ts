import { supabase } from './patientService';

class StripeService {
  private apiUrl: string;

  constructor() {
    // Use Supabase Edge Function URL
    this.apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  }

  /**
   * Create a payment intent for an invoice
   */
  async createPaymentIntent(factureId: string, amount: number): Promise<{ clientSecret: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          factureId,
          amount: Math.round(amount * 100) // Convert to cents for Stripe
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Update invoice after successful payment
   */
  async updateInvoiceAfterPayment(factureId: string, amountPaid: number, paymentIntentId: string): Promise<void> {
    try {
      // First, get the current invoice data
      const { data: facture, error: fetchError } = await supabase
        .from('factures')
        .select('*')
        .eq('id', factureId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Calculate new values
      const newMontantPaye = facture.montant_paye + amountPaid;
      const newMontantRestant = facture.montant_total - newMontantPaye;
      
      // Determine new status
      let newStatut = facture.statut;
      if (newMontantRestant <= 0) {
        newStatut = 'payee';
      } else if (newMontantPaye > 0) {
        newStatut = 'partiellement_payee';
      }

      // Update the invoice
      const { error: updateError } = await supabase
        .from('factures')
        .update({
          montant_paye: newMontantPaye,
          montant_restant: newMontantRestant,
          statut: newStatut,
          methode_paiement: 'carte',
          date_paiement: new Date().toISOString().split('T')[0]
        })
        .eq('id', factureId);

      if (updateError) {
        throw updateError;
      }

      // Log the payment in a separate table if needed
      // This could be implemented if you want to track payment history
      console.log('Payment recorded successfully:', {
        factureId,
        amountPaid,
        paymentIntentId,
        date: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating invoice after payment:', error);
      throw error;
    }
  }

  /**
   * Get payment history for an invoice
   */
  async getPaymentHistory(factureId: string): Promise<any[]> {
    try {
      // This would typically fetch from a payments table
      // For now, we'll return an empty array
      return [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();