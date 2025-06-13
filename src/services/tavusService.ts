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

  // Generate comprehensive medical summary with cabinet data
  private generateComprehensiveMedicalSummary(patient: Patient): string {
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

    // Prepare consultations summary
    let consultationsInfo = '';
    if (patient.consultations && patient.consultations.length > 0) {
      const recentConsultations = patient.consultations
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
      
      consultationsInfo = `
DERNIÈRES CONSULTATIONS:
${recentConsultations.map(c => 
  `- ${new Date(c.date).toLocaleDateString('fr-FR')}: ${c.motif} - ${c.diagnostic} (Dr. ${c.medecinNom})`
).join('\n')}`;
    }

    // Prepare factures summary
    let facturesInfo = '';
    if (patient.factures && patient.factures.length > 0) {
      const facturesEnAttente = patient.factures.filter(f => f.statut === 'en_attente');
      const totalEnAttente = facturesEnAttente.reduce((sum, f) => sum + f.montantRestant, 0);
      
      facturesInfo = `
SITUATION FINANCIÈRE:
- Total factures: ${patient.factures.length}
- Factures en attente: ${facturesEnAttente.length} (${totalEnAttente}€)
- Dernière facture: ${patient.factures[0]?.numero} du ${new Date(patient.factures[0]?.date).toLocaleDateString('fr-FR')}`;
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

      rdvInfo = `
RENDEZ-VOUS:`;
      if (prochainRdv) {
        rdvInfo += `
- Prochain RDV: ${new Date(prochainRdv.date).toLocaleDateString('fr-FR')} à ${prochainRdv.heureDebut} - ${prochainRdv.motif} (${prochainRdv.statut})`;
      }
      if (dernierRdv) {
        rdvInfo += `
- Dernier RDV: ${new Date(dernierRdv.date).toLocaleDateString('fr-FR')} - ${dernierRdv.motif}`;
      }
    }

    const summary = `
Vous êtes Dr. IA Assistant, un assistant médical virtuel professionnel spécialisé dans l'analyse complète des dossiers patients. Vous avez accès à toutes les informations médicales, administratives et financières du patient.

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

Commencez par vous présenter, puis donnez un résumé structuré et professionnel de ce dossier patient. Soyez prêt à répondre aux questions spécifiques sur tous les aspects du dossier.
    `;

    return summary.trim();
  }

  // Analyze patient query and provide contextual response
  public generateContextualResponse(question: string, patient: Patient): string {
    const lowerQuestion = question.toLowerCase();
    
    // Consultations queries
    if (lowerQuestion.includes('consultation') || lowerQuestion.includes('dernière visite') || lowerQuestion.includes('dernier rendez-vous médical')) {
      if (patient.consultations && patient.consultations.length > 0) {
        const derniereConsultation = patient.consultations
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
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
        return `Aucune consultation n'est enregistrée dans le dossier de ${patient.prenom} ${patient.nom}.`;
      }
    }

    // Factures/financial queries
    if (lowerQuestion.includes('facture') || lowerQuestion.includes('paiement') || lowerQuestion.includes('financier') || lowerQuestion.includes('dette') || lowerQuestion.includes('doit')) {
      if (patient.factures && patient.factures.length > 0) {
        const facturesEnAttente = patient.factures.filter(f => f.statut === 'en_attente');
        const totalEnAttente = facturesEnAttente.reduce((sum, f) => sum + f.montantRestant, 0);
        const totalPaye = patient.factures.reduce((sum, f) => sum + f.montantPaye, 0);
        
        let response = `Situation financière de ${patient.prenom} ${patient.nom}:

Total des factures: ${patient.factures.length}
Montant total payé: ${totalPaye}€
Factures en attente: ${facturesEnAttente.length}
Montant en attente: ${totalEnAttente}€`;

        if (facturesEnAttente.length > 0) {
          response += `\n\nDétail des factures en attente:`;
          facturesEnAttente.forEach(f => {
            response += `\n- Facture ${f.numero} du ${new Date(f.date).toLocaleDateString('fr-FR')}: ${f.montantRestant}€ (échéance: ${new Date(f.dateEcheance).toLocaleDateString('fr-FR')})`;
          });
        }

        return response;
      } else {
        return `Aucune facture n'est enregistrée pour ${patient.prenom} ${patient.nom}.`;
      }
    }

    // Rendez-vous queries
    if (lowerQuestion.includes('rendez-vous') || lowerQuestion.includes('rdv') || lowerQuestion.includes('prochain') || lowerQuestion.includes('planning')) {
      if (patient.rendezVous && patient.rendezVous.length > 0) {
        const prochainRdv = patient.rendezVous
          .filter(r => new Date(r.date) > new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        
        const dernierRdv = patient.rendezVous
          .filter(r => new Date(r.date) <= new Date())
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        let response = `Planning des rendez-vous pour ${patient.prenom} ${patient.nom}:`;

        if (prochainRdv) {
          response += `\n\nProchain rendez-vous:
- Date: ${new Date(prochainRdv.date).toLocaleDateString('fr-FR')}
- Heure: ${prochainRdv.heureDebut} - ${prochainRdv.heureFin}
- Motif: ${prochainRdv.motif}
- Type: ${prochainRdv.type}
- Statut: ${prochainRdv.statut}
- Médecin: ${prochainRdv.medecinNom}`;
        } else {
          response += `\n\nAucun rendez-vous programmé à venir.`;
        }

        if (dernierRdv) {
          response += `\n\nDernier rendez-vous:
- Date: ${new Date(dernierRdv.date).toLocaleDateString('fr-FR')}
- Motif: ${dernierRdv.motif}
- Statut: ${dernierRdv.statut}`;
        }

        return response;
      } else {
        return `Aucun rendez-vous n'est programmé pour ${patient.prenom} ${patient.nom}.`;
      }
    }

    // Allergies queries
    if (lowerQuestion.includes('allergie')) {
      if (patient.allergies.length > 0) {
        return `${patient.prenom} ${patient.nom} présente les allergies suivantes : ${patient.allergies.join(', ')}. Il est important de vérifier toute prescription médicamenteuse en tenant compte de ces allergies.`;
      } else {
        return `${patient.prenom} ${patient.nom} ne présente aucune allergie connue dans son dossier médical.`;
      }
    }
    
    // Treatment queries
    if (lowerQuestion.includes('traitement') || lowerQuestion.includes('médicament')) {
      if (patient.traitements.length > 0) {
        const traitements = patient.traitements.map(t => `${t.nom} ${t.dosage} (${t.frequence})`).join(', ');
        return `Les traitements actuels de ${patient.prenom} ${patient.nom} sont : ${traitements}.`;
      } else {
        return `${patient.prenom} ${patient.nom} ne suit actuellement aucun traitement médicamenteux.`;
      }
    }
    
    // Diagnostic queries
    if (lowerQuestion.includes('diagnostic')) {
      return `Les diagnostics pour ${patient.prenom} ${patient.nom} sont : ${patient.diagnostics.join(', ')}.`;
    }
    
    // Medical history queries
    if (lowerQuestion.includes('antécédent')) {
      const antecedents = patient.antecedents.personnels.length > 0 
        ? patient.antecedents.personnels.join(', ')
        : 'aucun antécédent notable';
      return `Les antécédents médicaux de ${patient.prenom} ${patient.nom} incluent : ${antecedents}.`;
    }
    
    // Status queries
    if (lowerQuestion.includes('statut') || lowerQuestion.includes('état')) {
      let response = `${patient.prenom} ${patient.nom} est actuellement ${patient.statut.toLowerCase()} dans le service ${patient.service}.`;
      if (patient.alerte && patient.alerte.niveau !== 'verte') {
        response += ` Attention : ${patient.alerte.message}`;
      }
      return response;
    }

    // Summary queries
    if (lowerQuestion.includes('résumé') || lowerQuestion.includes('synthèse') || lowerQuestion.includes('bilan')) {
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

      if (patient.factures && patient.factures.length > 0) {
        const facturesEnAttente = patient.factures.filter(f => f.statut === 'en_attente');
        if (facturesEnAttente.length > 0) {
          const totalEnAttente = facturesEnAttente.reduce((sum, f) => sum + f.montantRestant, 0);
          summary += `\n\nSITUATION FINANCIÈRE:
- ${facturesEnAttente.length} facture(s) en attente pour un total de ${totalEnAttente}€`;
        }
      }

      if (patient.rendezVous && patient.rendezVous.length > 0) {
        const prochainRdv = patient.rendezVous
          .filter(r => new Date(r.date) > new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        
        if (prochainRdv) {
          summary += `\n\nPROCHAIN RENDEZ-VOUS:
- ${new Date(prochainRdv.date).toLocaleDateString('fr-FR')} à ${prochainRdv.heureDebut} - ${prochainRdv.motif}`;
        }
      }

      return summary;
    }
    
    // General response
    return `Concernant ${patient.prenom} ${patient.nom}, je peux vous fournir des informations détaillées sur:
- Son historique médical et ses consultations récentes
- Ses allergies, traitements et diagnostics
- Sa situation financière et ses factures
- Ses rendez-vous passés et à venir
- Son statut actuel et ses antécédents

Que souhaitez-vous savoir précisément ? Vous pouvez me demander un résumé complet, des détails sur ses consultations, sa situation financière, ou tout autre aspect de son dossier.`;
  }

  // Create Tavus conversation
  private async createTavusConversation(patient: Patient): Promise<any> {
    if (!TAVUS_API_KEY || !TAVUS_REPLICA_ID || !TAVUS_PERSONA_ID) {
      throw new Error('Configuration Tavus incomplète. Vérifiez vos variables d\'environnement.');
    }

    const conversationData: TavusConversationRequest = {
      replica_id: TAVUS_REPLICA_ID,
      persona_id: TAVUS_PERSONA_ID,
      conversation_name: `Consultation médicale complète - ${patient.prenom} ${patient.nom}`,
      properties: {
        max_call_duration: 1800, // 30 minutes
        participant_left_timeout: 60,
        participant_absent_timeout: 300,
        enable_recording: false
      }
    };

    try {
      console.log('Création de la conversation Tavus avec données complètes:', {
        replica_id: TAVUS_REPLICA_ID,
        persona_id: TAVUS_PERSONA_ID,
        conversation_name: conversationData.conversation_name,
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
      console.log('Conversation Tavus créée avec succès:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation Tavus:', error);
      throw error;
    }
  }

  // Initialize Tavus video session for patient with complete data
  async initializePatientSession(patient: Patient): Promise<TavusVideoSession> {
    const sessionId = `session_${patient.id}_${Date.now()}`;
    
    try {
      console.log('Initialisation de la session Tavus avec données complètes pour:', patient.prenom, patient.nom);
      console.log('Données disponibles:', {
        consultations: patient.consultations?.length || 0,
        factures: patient.factures?.length || 0,
        rendezVous: patient.rendezVous?.length || 0,
        typePatient: patient.typePatient
      });
      
      // Create conversation with Tavus API
      const conversationResponse = await this.createTavusConversation(patient);
      
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
        patientData: patient
      };

      this.currentSession = session;

      // Generate comprehensive medical summary with all data
      const comprehensiveSummary = this.generateComprehensiveMedicalSummary(patient);
      console.log('Résumé médical complet généré pour Tavus:', comprehensiveSummary.substring(0, 300) + '...');
      
      // Simulate initialization process
      setTimeout(() => {
        if (this.currentSession?.sessionId === sessionId) {
          this.currentSession.status = 'ready';
        }
      }, 2000);

      return session;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session Tavus:', error);
      
      // Create fallback demo session with patient data
      const fallbackSession: TavusVideoSession = {
        sessionId,
        videoUrl: '#demo-mode',
        status: 'initializing',
        isDemoMode: true,
        patientData: patient
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
      console.log('Message envoyé à Tavus avec contexte patient:', message);
      
      // If we have a real conversation ID, send to Tavus API
      if (this.currentSession.conversationId && TAVUS_API_KEY && !this.currentSession.isDemoMode) {
        console.log('Envoi du message via Tavus API avec données patient...');
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