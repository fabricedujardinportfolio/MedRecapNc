import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Send, Bot, Video, MessageCircle, Volume2, VolumeX, ExternalLink, Square } from 'lucide-react';
import { Patient } from '../types/Patient';
import { tavusService, TavusVideoSession } from '../services/tavusService';

interface TavusVideoAgentProps {
  patient: Patient;
  isVisible: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// Déclaration du type pour la Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    speechSynthesis: any;
    SpeechSynthesisUtterance: any;
    _tavusSessionLock?: boolean;
  }
}

// Initialiser le verrou global dans window pour éviter les problèmes de hot reload
if (typeof window !== 'undefined' && !window._tavusSessionLock) {
  window._tavusSessionLock = false;
}

export const TavusVideoAgent: React.FC<TavusVideoAgentProps> = ({ 
  patient, 
  isVisible, 
  onClose 
}) => {
  const [session, setSession] = useState<TavusVideoSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [externalWindow, setExternalWindow] = useState<Window | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [conversationActive, setConversationActive] = useState(false);
  const [autoListenEnabled, setAutoListenEnabled] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const autoRestartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const instanceIdRef = useRef<string>(`instance-${Date.now()}-${Math.random()}`);
  
  // Protection locale contre les initialisations multiples
  const hasInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);

  // Vérifier le support de la reconnaissance vocale et synthèse vocale
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    setSpeechSupported(!!SpeechRecognition && !!speechSynthesis);
    
    if (speechSynthesis) {
      console.log('🔊 Synthèse vocale supportée');
    }
  }, []);

  // Initialiser la session Tavus avec protection renforcée contre les instances multiples
  useEffect(() => {
    if (isVisible && !session && !hasInitializedRef.current && !isInitializingRef.current) {
      // Vérification du verrou global
      if (window._tavusSessionLock) {
        console.log('⚠️ Une session IA est déjà active globalement, fermeture de cette instance');
        setError('Une session IA est déjà active. Veuillez fermer l\'autre session avant d\'en ouvrir une nouvelle.');
        return;
      }
      
      // Marquer cette instance comme ayant initialisé
      hasInitializedRef.current = true;
      isInitializingRef.current = true;
      
      console.log(`🔒 [${instanceIdRef.current}] Début d'initialisation - Verrouillage local et global`);
      
      initializeSession();
    }
  }, [isVisible]);

  // Nettoyer les ressources
  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, [externalWindow]);

  // Auto-scroll du chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const cleanupSession = () => {
    console.log(`🧹 [${instanceIdRef.current}] Nettoyage de la session`);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }
    if (externalWindow && !externalWindow.closed) {
      externalWindow.close();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (autoRestartTimerRef.current) {
      clearTimeout(autoRestartTimerRef.current);
    }
    
    // Libérer le verrou global seulement si c'est notre instance qui l'a pris
    if (window._tavusSessionLock && session) {
      window._tavusSessionLock = false;
      console.log(`🔓 [${instanceIdRef.current}] Session globale libérée`);
    }
    
    // Réinitialiser les flags locaux
    hasInitializedRef.current = false;
    isInitializingRef.current = false;
  };

  // Fonction de synthèse vocale avec callback pour relancer l'écoute
  const speakText = (text: string, onSpeechEnd?: () => void) => {
    if (!voiceEnabled || !window.speechSynthesis) {
      console.log('🔇 Synthèse vocale désactivée ou non supportée');
      if (onSpeechEnd) onSpeechEnd();
      return;
    }

    // Arrêter toute synthèse en cours
    window.speechSynthesis.cancel();

    const utterance = new window.SpeechSynthesisUtterance(text);
    
    // Configuration de la voix
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Sélectionner une voix française si disponible
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(voice => 
      voice.lang.startsWith('fr') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.startsWith('fr'));
    
    if (frenchVoice) {
      utterance.voice = frenchVoice;
      console.log('🎙️ Voix sélectionnée:', frenchVoice.name);
    }

    utterance.onstart = () => {
      console.log('🔊 Début de la synthèse vocale');
      setIsSpeaking(true);
      if (session) {
        setSession(prev => prev ? { ...prev, status: 'speaking' } : null);
      }
    };

    utterance.onend = () => {
      console.log('🔇 Fin de la synthèse vocale');
      setIsSpeaking(false);
      if (session) {
        setSession(prev => prev ? { ...prev, status: 'ready' } : null);
      }
      
      // Relancer automatiquement l'écoute si la conversation est active et l'auto-écoute activée
      if (conversationActive && autoListenEnabled && !isListening) {
        console.log('🔄 Relance automatique de l\'écoute après synthèse vocale');
        autoRestartTimerRef.current = setTimeout(() => {
          startListening();
        }, 1000); // Délai de 1 seconde après la fin de la synthèse
      }
      
      if (onSpeechEnd) onSpeechEnd();
    };

    utterance.onerror = (event) => {
      // Handle interrupted speech synthesis gracefully
      if (event.error === 'interrupted') {
        console.log('🔇 Synthèse vocale interrompue (comportement normal)');
      } else {
        console.error('❌ Erreur synthèse vocale:', event.error);
      }
      setIsSpeaking(false);
      if (session) {
        setSession(prev => prev ? { ...prev, status: 'ready' } : null);
      }
      if (onSpeechEnd) onSpeechEnd();
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const initializeSession = async () => {
    // Double vérification du verrou global
    if (window._tavusSessionLock) {
      console.log(`⚠️ [${instanceIdRef.current}] Verrou global déjà pris, abandon`);
      setError('Une session IA est déjà active. Veuillez fermer l\'autre session avant d\'en ouvrir une nouvelle.');
      hasInitializedRef.current = false;
      isInitializingRef.current = false;
      return;
    }

    // Prendre le verrou global
    window._tavusSessionLock = true;
    console.log(`🔒 [${instanceIdRef.current}] Verrou global pris`);

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🚀 [${instanceIdRef.current}] Initialisation de la session avec données complètes du patient:`, {
        nom: patient.nom,
        prenom: patient.prenom,
        consultations: patient.consultations?.length || 0,
        factures: patient.factures?.length || 0,
        rendezVous: patient.rendezVous?.length || 0,
        typePatient: patient.typePatient
      });

      const newSession = await tavusService.initializePatientSession(patient);
      setSession(newSession);
      
      // Message de bienvenue enrichi avec informations sur les capacités
      const welcomeMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        type: 'ai',
        content: `Bonjour ! Je suis Dr. IA Assistant, votre assistant médical virtuel spécialisé. J'ai accès à l'ensemble du dossier de ${patient.prenom} ${patient.nom}, incluant :

📋 Historique médical complet
🩺 ${patient.consultations?.length || 0} consultation(s) enregistrée(s)
💰 ${patient.factures?.length || 0} facture(s) et situation financière
📅 ${patient.rendezVous?.length || 0} rendez-vous programmé(s)

Je peux répondre à vos questions sur tous ces aspects. Vous pouvez me demander :
- Un résumé complet du dossier
- Des détails sur les consultations récentes
- La situation financière et les factures
- Les rendez-vous passés et à venir
- Les traitements et recommandations

Que souhaitez-vous savoir ?`,
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
      
      // Présentation vocale automatique
      setTimeout(() => {
        speakText(`Bonjour ! Je suis Dr. IA Assistant. J'ai accès au dossier complet de ${patient.prenom} ${patient.nom}, incluant ses consultations, factures et rendez-vous. Que souhaitez-vous savoir ?`);
      }, 1000);
      
    } catch (err) {
      console.error(`❌ [${instanceIdRef.current}] Erreur lors de l'initialisation:`, err);
      setError(err instanceof Error ? err.message : 'Erreur d\'initialisation');
      // Libérer le verrou en cas d'erreur
      window._tavusSessionLock = false;
      hasInitializedRef.current = false;
      console.log(`🔓 [${instanceIdRef.current}] Verrou global libéré suite à erreur`);
    } finally {
      setIsLoading(false);
      isInitializingRef.current = false;
    }
  };

  const processVoiceInput = async (transcript: string) => {
    if (isProcessingRef.current || !transcript.trim()) {
      console.log('🚫 Traitement en cours ou transcript vide, ignoré');
      return;
    }

    isProcessingRef.current = true;
    console.log('🎯 Traitement du transcript avec contexte patient:', transcript);

    try {
      // Ajouter le message utilisateur au chat IMMÉDIATEMENT
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        type: 'user',
        content: transcript.trim(),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMessage]);

      // Envoyer le message au service Tavus
      await tavusService.sendMessage(transcript.trim());
      
      // Générer une réponse contextuelle avec les données patient
      setTimeout(() => {
        const aiResponse = tavusService.generateContextualResponse(transcript.trim(), patient);
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
        
        // Synthèse vocale automatique de la réponse IA avec callback pour relancer l'écoute
        setTimeout(() => {
          speakText(aiResponse);
        }, 500);
      }, 1500);

    } catch (error) {
      console.error('❌ Erreur lors du traitement vocal:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        type: 'ai',
        content: 'Désolé, je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const startListening = () => {
    if (!speechSupported) {
      setSpeechError('La reconnaissance vocale n\'est pas supportée par votre navigateur');
      return;
    }

    // Arrêter la synthèse vocale si en cours
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Nettoyer les timers précédents
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (autoRestartTimerRef.current) {
      clearTimeout(autoRestartTimerRef.current);
      autoRestartTimerRef.current = null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';
    recognition.maxAlternatives = 1;

    let lastResultTime = Date.now();
    let currentFinalTranscript = '';

    recognition.onstart = () => {
      console.log('🎤 Reconnaissance vocale démarrée');
      setIsListening(true);
      setSpeechError(null);
      setFinalTranscript('');
      setInterimTranscript('');
      isProcessingRef.current = false;
      if (session) {
        setSession(prev => prev ? { ...prev, status: 'listening' } : null);
      }
    };

    recognition.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        currentFinalTranscript += finalText;
        setFinalTranscript(currentFinalTranscript);
        console.log('📝 Transcript final mis à jour:', currentFinalTranscript);
      }

      setInterimTranscript(interimText);
      lastResultTime = Date.now();

      // Réinitialiser le timer de silence
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Détecter la fin de parole (2 secondes de silence)
      silenceTimerRef.current = setTimeout(() => {
        if (currentFinalTranscript.trim() && !isProcessingRef.current) {
          console.log('🔇 Silence détecté, arrêt automatique et envoi');
          recognition.stop();
        }
      }, 2000);
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Erreur reconnaissance vocale:', event.error);
      let errorMessage = 'Erreur de reconnaissance vocale';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'Aucune parole détectée. Veuillez parler plus fort.';
          break;
        case 'audio-capture':
          errorMessage = 'Impossible d\'accéder au microphone. Vérifiez les permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Permission microphone refusée. Autorisez l\'accès au microphone.';
          break;
        case 'network':
          errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Service de reconnaissance vocale non autorisé.';
          break;
      }
      
      setSpeechError(errorMessage);
      setIsListening(false);
      if (session) {
        setSession(prev => prev ? { ...prev, status: 'ready' } : null);
      }
    };

    recognition.onend = () => {
      console.log('🔇 Reconnaissance vocale terminée');
      setIsListening(false);
      setInterimTranscript('');
      
      if (session) {
        setSession(prev => prev ? { ...prev, status: 'ready' } : null);
      }
      
      // Nettoyer le timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      // Traitement automatique du transcript final
      if (currentFinalTranscript.trim() && !isProcessingRef.current) {
        console.log('📤 Envoi automatique du transcript final:', currentFinalTranscript.trim());
        processVoiceInput(currentFinalTranscript.trim());
        setFinalTranscript(''); // Réinitialiser après traitement
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      console.log('⏹️ Arrêt manuel de la reconnaissance vocale');
      recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (autoRestartTimerRef.current) {
      clearTimeout(autoRestartTimerRef.current);
      autoRestartTimerRef.current = null;
    }
  };

  const startConversation = () => {
    console.log('🎙️ Démarrage de la conversation vocale continue');
    setConversationActive(true);
    setAutoListenEnabled(true);
    startListening();
  };

  const stopConversation = () => {
    console.log('⏹️ Arrêt de la conversation vocale continue');
    setConversationActive(false);
    setAutoListenEnabled(false);
    
    // Arrêter la reconnaissance vocale
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Arrêter la synthèse vocale
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    
    // Nettoyer les timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (autoRestartTimerRef.current) {
      clearTimeout(autoRestartTimerRef.current);
      autoRestartTimerRef.current = null;
    }
    
    // Réinitialiser les états
    setIsListening(false);
    setIsSpeaking(false);
    setFinalTranscript('');
    setInterimTranscript('');
    isProcessingRef.current = false;
    
    if (session) {
      setSession(prev => prev ? { ...prev, status: 'ready' } : null);
    }
  };

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage.trim();
    if (!content || !session) return;

    console.log('💬 Envoi du message à l\'IA avec contexte patient:', content);

    // Ajouter le message utilisateur au chat
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      content: content,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Réinitialiser l'input seulement si ce n'est pas un message vocal
    if (!messageContent) {
      setInputMessage('');
    }

    try {
      // Envoyer le message au service Tavus
      await tavusService.sendMessage(content);
      
      // Générer une réponse contextuelle avec toutes les données patient
      setTimeout(() => {
        const aiResponse = tavusService.generateContextualResponse(content, patient);
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
        
        // **SYNTHÈSE VOCALE AUTOMATIQUE** de la réponse IA
        setTimeout(() => {
          speakText(aiResponse);
        }, 500);
      }, 1500);

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        type: 'ai',
        content: 'Désolé, je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      // Si on réactive la voix, arrêter toute synthèse en cours
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const openExternalWindow = () => {
    if (session?.videoUrl && session.videoUrl !== '#demo-mode') {
      const newWindow = window.open(
        session.videoUrl,
        'tavus-video',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );
      setExternalWindow(newWindow);
    }
  };

  const handleClose = async () => {
    console.log(`🚪 [${instanceIdRef.current}] Fermeture de la session`);
    
    // Arrêter la conversation si elle est active
    if (conversationActive) {
      stopConversation();
    }
    
    if (session) {
      await tavusService.endSession();
    }
    
    // Nettoyer toutes les ressources
    cleanupSession();
    
    // Réinitialiser les états
    setSession(null);
    setChatMessages([]);
    setFinalTranscript('');
    setInterimTranscript('');
    setIsSpeaking(false);
    setConversationActive(false);
    setAutoListenEnabled(false);
    isProcessingRef.current = false;
    
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden">
        {/* Left Panel - Video Avatar */}
        <div className="w-1/2 bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Dr. IA Assistant</h3>
                <p className="text-sm text-gray-600">
                  Patient: {patient.prenom} {patient.nom}
                </p>
                <p className="text-xs text-purple-600">
                  Accès complet: {patient.consultations?.length || 0} consultations • {patient.factures?.length || 0} factures • {patient.rendezVous?.length || 0} RDV
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session?.isDemoMode && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                  Mode Démo
                </span>
              )}
              {conversationActive && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  Conversation Active
                </span>
              )}
              {externalWindow && !externalWindow.closed && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  Fenêtre externe active
                </span>
              )}
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-colors ${
                  voiceEnabled 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
                title={voiceEnabled ? 'Désactiver la voix' : 'Activer la voix'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Video/Avatar Area */}
          <div className="flex-1 flex items-center justify-center p-6">
            {isLoading ? (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Initialisation de l'assistant IA...</p>
                <p className="text-sm text-purple-600 mt-2">Chargement des données patient complètes</p>
              </div>
            ) : error ? (
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => {
                    // Réinitialiser les flags avant de réessayer
                    hasInitializedRef.current = false;
                    isInitializingRef.current = false;
                    window._tavusSessionLock = false;
                    initializeSession();
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : session ? (
              <div className="text-center w-full">
                {/* Avatar simulé */}
                <div className={`w-48 h-48 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl transition-all duration-300 ${
                  isSpeaking ? 'scale-110 shadow-purple-300' : ''
                } ${
                  isListening ? 'ring-4 ring-orange-300 ring-opacity-75' : ''
                }`}>
                  <Bot className={`w-24 h-24 text-white transition-all duration-300 ${
                    isSpeaking ? 'animate-pulse' : ''
                  }`} />
                </div>
                
                {/* Status */}
                <div className="mb-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    session.status === 'ready' && !conversationActive ? 'bg-green-100 text-green-800' :
                    conversationActive ? 'bg-blue-100 text-blue-800' :
                    session.status === 'speaking' || isSpeaking ? 'bg-blue-100 text-blue-800' :
                    session.status === 'listening' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      session.status === 'ready' && !conversationActive ? 'bg-green-500' :
                      conversationActive ? 'bg-blue-500 animate-pulse' :
                      session.status === 'speaking' || isSpeaking ? 'bg-blue-500 animate-pulse' :
                      session.status === 'listening' ? 'bg-orange-500 animate-pulse' :
                      'bg-gray-500'
                    }`}></div>
                    {conversationActive && 'Conversation en cours'}
                    {!conversationActive && session.status === 'ready' && !isSpeaking && 'Prêt'}
                    {(session.status === 'speaking' || isSpeaking) && 'En train de parler'}
                    {session.status === 'listening' && 'À l\'écoute'}
                    {session.status === 'initializing' && 'Initialisation'}
                    {session.status === 'ended' && 'Session terminée'}
                  </div>
                </div>

                {/* Transcription en temps réel */}
                {(isListening || finalTranscript || interimTranscript) && (
                  <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-purple-200 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">
                        {isListening ? 'Écoute en cours...' : 'Transcription terminée'}
                      </span>
                    </div>
                    <div className="text-left">
                      {finalTranscript && (
                        <p className="text-gray-900 mb-1">{finalTranscript}</p>
                      )}
                      {interimTranscript && (
                        <p className="text-gray-500 italic">{interimTranscript}</p>
                      )}
                      {!finalTranscript && !interimTranscript && isListening && (
                        <p className="text-gray-400 italic">Parlez maintenant...</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Erreur de reconnaissance vocale */}
                {speechError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-700 text-sm">{speechError}</p>
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-center gap-3 flex-wrap">
                  {speechSupported ? (
                    <>
                      {!conversationActive ? (
                        <button
                          onClick={startConversation}
                          disabled={session.status === 'ended'}
                          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Mic className="w-5 h-5" />
                          Démarrer Conversation
                        </button>
                      ) : (
                        <button
                          onClick={stopConversation}
                          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                        >
                          <Square className="w-5 h-5" />
                          Arrêter Conversation
                        </button>
                      )}
                      
                      {!conversationActive && (
                        <button
                          onClick={isListening ? stopListening : startListening}
                          disabled={session.status === 'ended' || isSpeaking}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                            isListening
                              ? 'bg-orange-600 hover:bg-orange-700 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="w-5 h-5" />
                              Arrêter
                            </>
                          ) : (
                            <>
                              <Mic className="w-5 h-5" />
                              Parler Une Fois
                            </>
                          )}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-red-600 text-sm mb-2">
                        Reconnaissance vocale non supportée
                      </p>
                      <p className="text-gray-500 text-xs">
                        Utilisez Chrome, Edge ou Safari
                      </p>
                    </div>
                  )}
                  
                  {session.videoUrl !== '#demo-mode' && (
                    <button
                      onClick={openExternalWindow}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Ouvrir Avatar
                    </button>
                  )}
                </div>

                {/* Instructions */}
                <div className="mt-4 text-xs text-gray-600 max-w-md mx-auto">
                  <p className="mb-2">
                    <strong>Conversation:</strong> Démarre une conversation continue avec relance automatique de l'écoute
                  </p>
                  <p>
                    <strong>Parler Une Fois:</strong> Active l'écoute pour un seul message
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="w-1/2 flex flex-col border-l border-gray-200">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chat Médical Avancé</h3>
                <p className="text-sm text-gray-600">Accès complet aux données patient</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Posez une question sur le patient (consultations, factures, RDV...)..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!session || session.status === 'ended'}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || !session || session.status === 'ended'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              💡 Exemples: "Résumé complet", "Dernière consultation", "Factures en attente", "Prochain rendez-vous"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};