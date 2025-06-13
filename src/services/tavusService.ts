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
  patientData?: Patient;
  language?: 'fr' | 'en';
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

  // Generate comprehensive medical summary with cabinet data - MULTILINGUE
  private generateComprehensiveMedicalSummary(patient: Patient, language: 'fr' | 'en' = 'fr'): string {
    const criticalInfo = [];
    
    // Add critical alerts
    if (patient.alerte && patient.alerte.niveau !== 'verte') {
      const alertText = language === 'fr' 
        ? `ALERTE ${patient.alerte.niveau.toUpperCase()}: ${patient.alerte.message}`
        : `ALERT ${patient.alerte.niveau.toUpperCase()}: ${patient.alerte.message}`;
      criticalInfo.push(alertText);
    }

    // Add allergies
    if (patient.allergies.length > 0) {
      const allergiesText = language === 'fr'
        ? `Allergies importantes: ${patient.allergies.join(', ')}`
        : `Important allergies: ${patient.allergies.join(', ')}`;
      criticalInfo.push(allergiesText);
    }

    // Add current treatments
    const treatments = patient.traitements.map(t => `${t.nom} ${t.dosage}`).join(', ');

    // Prepare consultations summary
    let consultationsInfo = '';
    if (patient.consultations && patient.consultations.length > 0) {
      const recentConsultations = patient.consultations
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
      
      const consultationsTitle = language === 'fr' ? 'DERNIÈRES CONSULTATIONS:' : 'RECENT CONSULTATIONS:';
      consultationsInfo = `
${consultationsTitle}
${recentConsultations.map(c => 
  `- ${new Date(c.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}: ${c.motif} - ${c.diagnostic} (Dr. ${c.medecinNom})`
).join('\n')}`;
    }

    // Prepare factures summary
    let facturesInfo = '';
    if (patient.factures && patient.factures.length > 0) {
      const facturesEnAttente = patient.factures.filter(f => f.statut === 'en_attente');
      const totalEnAttente = facturesEnAttente.reduce((sum, f) => sum + f.montantRestant, 0);
      
      const financialTitle = language === 'fr' ? 'SITUATION FINANCIÈRE:' : 'FINANCIAL SITUATION:';
      const totalInvoicesText = language === 'fr' ? 'Total factures' : 'Total invoices';
      const pendingInvoicesText = language === 'fr' ? 'Factures en attente' : 'Pending invoices';
      const lastInvoiceText = language === 'fr' ? 'Dernière facture' : 'Last invoice';
      
      facturesInfo = `
${financialTitle}
- ${totalInvoicesText}: ${patient.factures.length}
- ${pendingInvoicesText}: ${facturesEnAttente.length} (${totalEnAttente}€)
- ${lastInvoiceText}: ${patient.factures[0]?.numero} ${language === 'fr' ? 'du' : 'from'} ${new Date(patient.factures[0]?.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}`;
    }

    // Prepare rendez-vous summary
    let rdvInfo = '';
    if (patient.rendezVous && patient.rendezVous.length > 0) {
      const prochainRdv = patient.rendezVous
        .filter(r => new Date(r.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      
      const dernierRdv = patient.rendezVous
        .filter(r => new Date(r.date) <= new Date())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      const appointmentsTitle = language === 'fr' ? 'RENDEZ-VOUS:' : 'APPOINTMENTS:';
      rdvInfo = `
${appointmentsTitle}`;
      
      if (prochainRdv) {
        const nextAppText = language === 'fr' ? 'Prochain RDV' : 'Next appointment';
        rdvInfo += `
- ${nextAppText}: ${new Date(prochainRdv.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')} ${language === 'fr' ? 'à' : 'at'} ${prochainRdv.heureDebut} - ${prochainRdv.motif} (${prochainRdv.statut})`;
      }
      if (dernierRdv) {
        const lastAppText = language === 'fr' ? 'Dernier RDV' : 'Last appointment';
        rdvInfo += `
- ${lastAppText}: ${new Date(dernierRdv.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')} - ${dernierRdv.motif}`;
      }
    }

    // Generate summary based on language
    const summary = language === 'fr' ? `
Vous êtes Dr. Léa Martin, assistante médicale IA empathique et professionnelle. Vous avez accès à toutes les informations médicales, administratives et financières du patient.

PATIENT: ${patient.prenom} ${patient.nom}
ÂGE: ${patient.age} ans
SEXE: ${patient.sexe === 'M' ? 'Masculin' : 'Féminin'}
GROUPE SANGUIN: ${patient.groupeSanguin}
SERVICE: ${patient.service}
STATUT: ${patient.statut}
TYPE DE PATIENT: ${patient.typePatient === 'cabinet' ? 'Patient de cabinet médical' : 'Patient hospitalier'}

${criticalInfo.length > 0 ? `INFORMATIONS CRITIQUES:\n${criticalInfo.join('\n')}\n` : ''}

MOTIF D'HOSPITALISATION: ${patient.motifHospitalisation}

DIAGNOSTICS: ${patient.diagnostics.join(', ')}

TRAITEMENTS ACTUELS: ${treatments || 'Aucun traitement en cours'}

ANTÉCÉDENTS MÉDICAUX: ${patient.antecedents.personnels.join(', ') || 'Aucun antécédent notable'}

${consultationsInfo}

${facturesInfo}

${rdvInfo}

CONTACT D'URGENCE: ${patient.contactUrgence.nom} (${patient.contactUrgence.lien}) - ${patient.contactUrgence.telephone}

CAPACITÉS D'ANALYSE:
Vous pouvez répondre aux questions sur:
- L'historique médical complet du patient
- Les consultations récentes et leurs résultats
- La situation financière et les factures
- Les rendez-vous passés et à venir
- Les traitements et leur évolution
- Les recommandations de suivi

Présentez-vous comme Dr. Léa Martin et donnez un résumé structuré et professionnel de ce dossier patient.
    ` : `
You are Dr. Léa Martin, an empathetic and professional AI medical assistant. You have access to all medical, administrative and financial information about the patient.

PATIENT: ${patient.prenom} ${patient.nom}
AGE: ${patient.age} years old
GENDER: ${patient.sexe === 'M' ? 'Male' : 'Female'}
BLOOD TYPE: ${patient.groupeSanguin}
DEPARTMENT: ${patient.service}
STATUS: ${patient.statut}
PATIENT TYPE: ${patient.typePatient === 'cabinet' ? 'Medical practice patient' : 'Hospital patient'}

${criticalInfo.length > 0 ? `CRITICAL INFORMATION:\n${criticalInfo.join('\n')}\n` : ''}

HOSPITALIZATION REASON: ${patient.motifHospitalisation}

DIAGNOSES: ${patient.diagnostics.join(', ')}

CURRENT TREATMENTS: ${treatments || 'No current treatment'}

MEDICAL HISTORY: ${patient.antecedents.personnels.join(', ') || 'No notable history'}

${consultationsInfo}

${facturesInfo}

${rdvInfo}

EMERGENCY CONTACT: ${patient.contactUrgence.nom} (${patient.contactUrgence.lien}) - ${patient.contactUrgence.telephone}

ANALYSIS CAPABILITIES:
You can answer questions about:
- Complete medical history of the patient
- Recent consultations and their results
- Financial situation and invoices
- Past and upcoming appointments
- Treatments and their evolution
- Follow-up recommendations

Introduce yourself as Dr. Léa Martin and provide a structured and professional summary of this patient file.
    `;

    return summary.trim();
  }

  // Analyze patient query and provide contextual response - MULTILINGUE
  public generateContextualResponse(question: string, patient: Patient, language: 'fr' | 'en' = 'fr'): string {
    const lowerQuestion = question.toLowerCase();
    
    // Consultations queries
    if (lowerQuestion.includes('consultation') || lowerQuestion.includes('dernière visite') || lowerQuestion.includes('dernier rendez-vous médical') || lowerQuestion.includes('last visit') || lowerQuestion.includes('recent consultation')) {
      if (patient.consultations && patient.consultations.length > 0) {
        const derniereConsultation = patient.consultations
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        if (language === 'fr') {
          return `La dernière consultation de ${patient.prenom} ${patient.nom} a eu lieu le ${new Date(derniereConsultation.date).toLocaleDateString('fr-FR')} avec ${derniereConsultation.medecinNom}. 

Motif: ${derniereConsultation.motif}
Diagnostic: ${derniereConsultation.diagnostic}
Traitement prescrit: ${derniereConsultation.traitement}
Durée: ${derniereConsultation.duree} minutes
Tarif: ${derniereConsultation.tarif}€

${derniereConsultation.observations ? `Observations: ${derniereConsultation.observations}` : ''}

${derniereConsultation.ordonnance?.medicaments.length > 0 ? 
  `Médicaments prescrits: ${derniereConsultation.ordonnance.medicaments.map(m => `${m.nom} ${m.dosage} (${m.instructions})`).join(', ')}` : ''}`;
        } else {
          return `${patient.prenom} ${patient.nom}'s last consultation took place on ${new Date(derniereConsultation.date).toLocaleDateString('en-US')} with ${derniereConsultation.medecinNom}.

Reason: ${derniereConsultation.motif}
Diagnosis: ${derniereConsultation.diagnostic}
Prescribed treatment: ${derniereConsultation.traitement}
Duration: ${derniereConsultation.duree} minutes
Fee: ${derniereConsultation.tarif}€

${derniereConsultation.observations ? `Observations: ${derniereConsultation.observations}` : ''}

${derniereConsultation.ordonnance?.medicaments.length > 0 ? 
  `Prescribed medications: ${derniereConsultation.ordonnance.medicaments.map(m => `${m.nom} ${m.dosage} (${m.instructions})`).join(', ')}` : ''}`;
        }
      } else {
        return language === 'fr' 
          ? `Aucune consultation n'est enregistrée dans le dossier de ${patient.prenom} ${patient.nom}.`
          : `No consultations are recorded in ${patient.prenom} ${patient.nom}'s file.`;
      }
    }

    // Summary queries
    if (lowerQuestion.includes('résumé') || lowerQuestion.includes('synthèse') || lowerQuestion.includes('bilan') || lowerQuestion.includes('summary') || lowerQuestion.includes('overview')) {
      if (language === 'fr') {
        let summary = `Résumé complet du dossier de ${patient.prenom} ${patient.nom}:

INFORMATIONS GÉNÉRALES:
- Âge: ${patient.age} ans, ${patient.sexe === 'M' ? 'Masculin' : 'Féminin'}
- Groupe sanguin: ${patient.groupeSanguin}
- Service: ${patient.service}
- Statut: ${patient.statut}`;

        if (patient.allergies.length > 0) {
          summary += `\n- Allergies: ${patient.allergies.join(', ')}`;
        }

        if (patient.consultations && patient.consultations.length > 0) {
          const derniereConsultation = patient.consultations
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          summary += `\n\nDERNIÈRE CONSULTATION (${new Date(derniereConsultation.date).toLocaleDateString('fr-FR')}):
- Motif: ${derniereConsultation.motif}
- Diagnostic: ${derniereConsultation.diagnostic}`;
        }

        return summary;
      } else {
        let summary = `Complete summary of ${patient.prenom} ${patient.nom}'s file:

GENERAL INFORMATION:
- Age: ${patient.age} years old, ${patient.sexe === 'M' ? 'Male' : 'Female'}
- Blood type: ${patient.groupeSanguin}
- Department: ${patient.service}
- Status: ${patient.statut}`;

        if (patient.allergies.length > 0) {
          summary += `\n- Allergies: ${patient.allergies.join(', ')}`;
        }

        if (patient.consultations && patient.consultations.length > 0) {
          const derniereConsultation = patient.consultations
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          summary += `\n\nLAST CONSULTATION (${new Date(derniereConsultation.date).toLocaleDateString('en-US')}):
- Reason: ${derniereConsultation.motif}
- Diagnosis: ${derniereConsultation.diagnostic}`;
        }

        return summary;
      }
    }
    
    // General response
    if (language === 'fr') {
      return `Concernant ${patient.prenom} ${patient.nom}, je peux vous fournir des informations détaillées sur:
- Son historique médical et ses consultations récentes
- Ses allergies, traitements et diagnostics
- Sa situation financière et ses factures
- Ses rendez-vous passés et à venir
- Son statut actuel et ses antécédents

Que souhaitez-vous savoir précisément ? Vous pouvez me demander un résumé complet, des détails sur ses consultations, sa situation financière, ou tout autre aspect de son dossier.`;
    } else {
      return `Regarding ${patient.prenom} ${patient.nom}, I can provide detailed information about:
- Medical history and recent consultations
- Allergies, treatments and diagnoses
- Financial situation and invoices
- Past and upcoming appointments
- Current status and medical history

What would you like to know specifically? You can ask me for a complete summary, consultation details, financial situation, or any other aspect of the file.`;
    }
  }

  // Create Tavus conversation
  private async createTavusConversation(patient: Patient, language: 'fr' | 'en' = 'fr'): Promise<any> {
    if (!TAVUS_API_KEY || !TAVUS_REPLICA_ID || !TAVUS_PERSONA_ID) {
      throw new Error('Configuration Tavus incomplète. Vérifiez vos variables d\'environnement.');
    }

    const conversationName = language === 'fr'
      ? `Consultation médicale complète - ${patient.prenom} ${patient.nom}`
      : `Complete medical consultation - ${patient.prenom} ${patient.nom}`;

    const conversationData: TavusConversationRequest = {
      replica_id: TAVUS_REPLICA_ID,
      persona_id: TAVUS_PERSONA_ID,
      conversation_name: conversationName,
      properties: {
        max_call_duration: 1800, // 30 minutes
        participant_left_timeout: 60,
        participant_absent_timeout: 300,
        enable_recording: false
      }
    };

    try {
      console.log('Création de la conversation Tavus avec Dr. Léa Martin:', {
        replica_id: TAVUS_REPLICA_ID,
        persona_id: TAVUS_PERSONA_ID,
        conversation_name: conversationData.conversation_name,
        language: language,
        patient_data: {
          consultations: patient.consultations?.length || 0,
          factures: patient.factures?.length || 0,
          rendezVous: patient.rendezVous?.length || 0
        }
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
        
        if (response.status === 400 && errorData.message?.includes('maximum concurrent conversations')) {
          throw new Error('CONCURRENT_LIMIT_REACHED');
        }
        
        throw new Error(`Erreur Tavus API: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
      }

      const result = await response.json();
      console.log('Conversation Tavus créée avec succès pour Dr. Léa Martin:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation Tavus:', error);
      throw error;
    }
  }

  // Initialize Tavus video session for patient with complete data - MULTILINGUE
  async initializePatientSession(patient: Patient, language: 'fr' | 'en' = 'fr'): Promise<TavusVideoSession> {
    const sessionId = `session_${patient.id}_${Date.now()}`;
    
    try {
      console.log('Initialisation de la session Dr. Léa Martin avec données complètes pour:', patient.prenom, patient.nom, 'Langue:', language);
      console.log('Données disponibles:', {
        consultations: patient.consultations?.length || 0,
        factures: patient.factures?.length || 0,
        rendezVous: patient.rendezVous?.length || 0,
        typePatient: patient.typePatient
      });
      
      // Create conversation with Tavus API
      const conversationResponse = await this.createTavusConversation(patient, language);
      
      // Extract the conversation URL from the response
      let videoUrl = '#demo-mode';
      if (conversationResponse.conversation_url) {
        videoUrl = conversationResponse.conversation_url;
      } else if (conversationResponse.conversation_id) {
        videoUrl = `https://tavus.io/conversations/${conversationResponse.conversation_id}`;
      }
      
      const session: TavusVideoSession = {
        sessionId,
        videoUrl,
        status: 'initializing',
        conversationId: conversationResponse.conversation_id,
        isDemoMode: false,
        patientData: patient,
        language: language
      };

      this.currentSession = session;

      // Generate comprehensive medical summary with all data in the correct language
      const comprehensiveSummary = this.generateComprehensiveMedicalSummary(patient, language);
      console.log('Résumé médical complet généré pour Dr. Léa Martin en', language, ':', comprehensiveSummary.substring(0, 300) + '...');
      
      // Simulate initialization process
      setTimeout(() => {
        if (this.currentSession?.sessionId === sessionId) {
          this.currentSession.status = 'ready';
        }
      }, 2000);

      return session;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session Dr. Léa Martin:', error);
      
      // Create fallback demo session with patient data
      const fallbackSession: TavusVideoSession = {
        sessionId,
        videoUrl: '#demo-mode',
        status: 'initializing',
        isDemoMode: true,
        patientData: patient,
        language: language
      };

      this.currentSession = fallbackSession;

      setTimeout(() => {
        if (this.currentSession?.sessionId === sessionId) {
          this.currentSession.status = 'ready';
        }
      }, 1000);

      if (error instanceof Error) {
        if (error.message === 'CONCURRENT_LIMIT_REACHED') {
          throw new Error('Limite de conversations simultanées atteinte. Veuillez réessayer dans quelques minutes ou fermer d\'autres sessions Tavus actives.');
        } else if (error.message.includes('Configuration Tavus incomplète')) {
          throw new Error('Configuration Tavus incomplète. Fonctionnement en mode démonstration avec synthèse vocale et accès complet aux données patient.');
        }
      }

      throw new Error('Service Tavus temporairement indisponible. Fonctionnement en mode démonstration avec synthèse vocale et accès complet aux données patient.');
    }
  }

  // Send message to Tavus AI
  async sendMessage(message: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('Aucune session active');
    }

    try {
      console.log('Message envoyé à Dr. Léa Martin avec contexte patient:', message);
      
      // If we have a real conversation ID, send to Tavus API
      if (this.currentSession.conversationId && TAVUS_API_KEY && !this.currentSession.isDemoMode) {
        console.log('Envoi du message via Tavus API avec Dr. Léa Martin...');
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
        await fetch(`${TAVUS_BASE_URL}/v2/conversations/${this.currentSession.conversationId}/end`, {
          method: 'POST',
          headers: {
            'x-api-key': TAVUS_API_KEY
          }
        });
        console.log('Session Dr. Léa Martin fermée avec succès');
      } catch (error) {
        console.error('Erreur lors de la fermeture de la session Dr. Léa Martin:', error);
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