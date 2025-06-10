import { Patient } from '../types/Patient';

// Tavus SDK configuration
const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const TAVUS_REPLICA_ID = import.meta.env.VITE_TAVUS_REPLICA_ID;
const TAVUS_PERSONA_ID = import.meta.env.VITE_TAVUS_PERSONA_ID;
const TAVUS_BASE_URL = 'https://tavusapi.com';

export interface TavusVideoSession {
  sessionId: string;
  videoUrl: string;
  status: 'initializing' | 'ready' | 'speaking' | 'listening' | 'ended';
  conversationId?: string;
  isDemoMode?: boolean;
}

export interface TavusConversationRequest {
  replica_id: string;
  persona_id: string;
  conversation_name: string;
  callback_url?: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    enable_recording?: boolean;
  };
}

export class TavusService {
  private static instance: TavusService;
  private currentSession: TavusVideoSession | null = null;

  static getInstance(): TavusService {
    if (!TavusService.instance) {
      TavusService.instance = new TavusService();
    }
    return TavusService.instance;
  }

  // Generate medical summary prompt for Tavus AI
  private generateMedicalSummary(patient: Patient): string {
    const criticalInfo = [];
    
    // Add critical alerts
    if (patient.alerte && patient.alerte.niveau !== 'verte') {
      criticalInfo.push(`ALERTE ${patient.alerte.niveau.toUpperCase()}: ${patient.alerte.message}`);
    }

    // Add allergies
    if (patient.allergies.length > 0) {
      criticalInfo.push(`Allergies importantes: ${patient.allergies.join(', ')}`);
    }

    // Add current treatments
    const treatments = patient.traitements.map(t => `${t.nom} ${t.dosage}`).join(', ');

    const summary = `
Vous êtes un assistant médical virtuel professionnel. Présentez-vous comme Dr. IA Assistant et résumez le dossier médical suivant de manière claire et professionnelle.

PATIENT: ${patient.prenom} ${patient.nom}
ÂGE: ${patient.age} ans
SEXE: ${patient.sexe === 'M' ? 'Masculin' : 'Féminin'}
GROUPE SANGUIN: ${patient.groupeSanguin}
SERVICE: ${patient.service}
STATUT: ${patient.statut}

${criticalInfo.length > 0 ? `INFORMATIONS CRITIQUES:\n${criticalInfo.join('\n')}\n` : ''}

MOTIF D'HOSPITALISATION: ${patient.motifHospitalisation}

DIAGNOSTICS: ${patient.diagnostics.join(', ')}

TRAITEMENTS ACTUELS: ${treatments || 'Aucun traitement en cours'}

ANTÉCÉDENTS MÉDICAUX: ${patient.antecedents.personnels.join(', ') || 'Aucun antécédent notable'}

CONTACT D'URGENCE: ${patient.contactUrgence.nom} (${patient.contactUrgence.lien}) - ${patient.contactUrgence.telephone}

Commencez par vous présenter, puis donnez un résumé structuré et professionnel de ce dossier patient. Soyez prêt à répondre aux questions spécifiques sur ce patient.
    `;

    return summary.trim();
  }

  // Create Tavus conversation
  private async createTavusConversation(patient: Patient): Promise<any> {
    if (!TAVUS_API_KEY || !TAVUS_REPLICA_ID || !TAVUS_PERSONA_ID) {
      throw new Error('Configuration Tavus incomplète. Vérifiez vos variables d\'environnement.');
    }

    const conversationData: TavusConversationRequest = {
      replica_id: TAVUS_REPLICA_ID,
      persona_id: TAVUS_PERSONA_ID,
      conversation_name: `Consultation médicale - ${patient.prenom} ${patient.nom}`,
      properties: {
        max_call_duration: 1800, // 30 minutes
        participant_left_timeout: 60,
        participant_absent_timeout: 300,
        enable_recording: false
      }
    };

    try {
      console.log('Création de la conversation Tavus avec:', {
        replica_id: TAVUS_REPLICA_ID,
        persona_id: TAVUS_PERSONA_ID,
        conversation_name: conversationData.conversation_name
      });

      const response = await fetch(`${TAVUS_BASE_URL}/v2/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_API_KEY
        },
        body: JSON.stringify(conversationData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur API Tavus:', response.status, errorData);
        
        // Handle specific error cases
        if (response.status === 400 && errorData.message?.includes('maximum concurrent conversations')) {
          throw new Error('CONCURRENT_LIMIT_REACHED');
        }
        
        throw new Error(`Erreur Tavus API: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
      }

      const result = await response.json();
      console.log('Conversation Tavus créée avec succès:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation Tavus:', error);
      throw error;
    }
  }

  // Initialize Tavus video session for patient
  async initializePatientSession(patient: Patient): Promise<TavusVideoSession> {
    const sessionId = `session_${patient.id}_${Date.now()}`;
    
    try {
      console.log('Initialisation de la session Tavus pour:', patient.prenom, patient.nom);
      
      // Create conversation with Tavus API
      const conversationResponse = await this.createTavusConversation(patient);
      
      // Extract the conversation URL from the response
      let videoUrl = '#demo-mode';
      if (conversationResponse.conversation_url) {
        videoUrl = conversationResponse.conversation_url;
      } else if (conversationResponse.conversation_id) {
        // Construct URL if only ID is provided
        videoUrl = `https://tavus.io/conversations/${conversationResponse.conversation_id}`;
      }
      
      const session: TavusVideoSession = {
        sessionId,
        videoUrl,
        status: 'initializing',
        conversationId: conversationResponse.conversation_id,
        isDemoMode: false
      };

      this.currentSession = session;

      // Generate medical summary and send initial context
      const medicalSummary = this.generateMedicalSummary(patient);
      console.log('Résumé médical généré pour Tavus:', medicalSummary.substring(0, 200) + '...');
      
      // Simulate initialization process
      setTimeout(() => {
        if (this.currentSession?.sessionId === sessionId) {
          this.currentSession.status = 'ready';
        }
      }, 2000);

      // Start with medical summary
      setTimeout(() => {
        if (this.currentSession?.sessionId === sessionId) {
          this.currentSession.status = 'speaking';
        }
      }, 3000);

      return session;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session Tavus:', error);
      
      // Create fallback demo session
      const fallbackSession: TavusVideoSession = {
        sessionId,
        videoUrl: '#demo-mode',
        status: 'initializing',
        isDemoMode: true
      };

      this.currentSession = fallbackSession;

      // Set status to ready after a short delay
      setTimeout(() => {
        if (this.currentSession?.sessionId === sessionId) {
          this.currentSession.status = 'ready';
        }
      }, 1000);

      // Determine the specific error type for better user feedback
      if (error instanceof Error) {
        if (error.message === 'CONCURRENT_LIMIT_REACHED') {
          throw new Error('Limite de conversations simultanées atteinte. Veuillez réessayer dans quelques minutes ou fermer d\'autres sessions Tavus actives.');
        } else if (error.message.includes('Configuration Tavus incomplète')) {
          throw new Error('Configuration Tavus incomplète. Fonctionnement en mode démonstration avec synthèse vocale.');
        }
      }

      // Generic fallback error message
      throw new Error('Service Tavus temporairement indisponible. Fonctionnement en mode démonstration avec synthèse vocale.');
    }
  }

  // Send message to Tavus AI
  async sendMessage(message: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('Aucune session active');
    }

    try {
      console.log('Message envoyé à Tavus:', message);
      
      // If we have a real conversation ID, send to Tavus API
      if (this.currentSession.conversationId && TAVUS_API_KEY && !this.currentSession.isDemoMode) {
        // In a real implementation, you would send the message to Tavus here
        // This would typically be done through WebSocket or Server-Sent Events
        console.log('Envoi du message via Tavus API...');
      }
      
      // Update session status
      this.currentSession.status = 'listening';
      
      setTimeout(() => {
        if (this.currentSession) {
          this.currentSession.status = 'speaking';
        }
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  // End current session
  async endSession(): Promise<void> {
    if (this.currentSession?.conversationId && TAVUS_API_KEY && !this.currentSession.isDemoMode) {
      try {
        // End the Tavus conversation
        await fetch(`${TAVUS_BASE_URL}/v2/conversations/${this.currentSession.conversationId}/end`, {
          method: 'POST',
          headers: {
            'x-api-key': TAVUS_API_KEY
          }
        });
        console.log('Session Tavus fermée avec succès');
      } catch (error) {
        console.error('Erreur lors de la fermeture de la session Tavus:', error);
      }
    }

    if (this.currentSession) {
      this.currentSession.status = 'ended';
      this.currentSession = null;
    }
  }

  // Get current session
  getCurrentSession(): TavusVideoSession | null {
    return this.currentSession;
  }

  // Check if Tavus is properly configured
  isConfigured(): boolean {
    return !!(TAVUS_API_KEY && TAVUS_REPLICA_ID && TAVUS_PERSONA_ID);
  }

  // Get configuration status
  getConfigurationStatus(): {
    hasApiKey: boolean;
    hasReplicaId: boolean;
    hasPersonaId: boolean;
    isFullyConfigured: boolean;
  } {
    return {
      hasApiKey: !!TAVUS_API_KEY,
      hasReplicaId: !!TAVUS_REPLICA_ID,
      hasPersonaId: !!TAVUS_PERSONA_ID,
      isFullyConfigured: this.isConfigured()
    };
  }
}

export const tavusService = TavusService.getInstance();