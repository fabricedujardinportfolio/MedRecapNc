import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Send, Bot, Video, MessageCircle, Volume2, VolumeX, ExternalLink, AlertTriangle } from 'lucide-react';
import { Patient } from '../types/Patient';
import { tavusService, TavusVideoSession } from '../services/tavusService';
import { useLanguage } from '../hooks/useLanguage';

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
  }
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
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  
  const { language } = useLanguage();
  
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const initializationRef = useRef(false); // Prévenir les initialisations multiples

  // Vérifier le support de la reconnaissance vocale et synthèse vocale
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    setSpeechSupported(!!SpeechRecognition && !!speechSynthesis);
    
    if (speechSynthesis) {
      console.log('🔊 Synthèse vocale supportée');
    }
  }, []);

  // 🔧 NOUVEAU : Vérifier les sessions actives au montage
  useEffect(() => {
    if (isVisible) {
      const activeStatus = tavusService.getActiveConversationsStatus();
      if (activeStatus.count > 0) {
        console.log('⚠️ Sessions Tavus actives détectées:', activeStatus);
        setShowSessionWarning(true);
      }
    }
  }, [isVisible]);

  // Initialiser la session Tavus avec protection anti-doublon
  useEffect(() => {
    if (isVisible && !session && !initializationRef.current) {
      initializationRef.current = true;
      initializeSession();
    }
  }, [isVisible, language]);

  // Nettoyer les ressources
  useEffect(() => {
    return () => {
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
    };
  }, [externalWindow]);

  // Auto-scroll du chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Fonction de synthèse vocale avec langue appropriée
  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) {
      console.log('🔇 Synthèse vocale désactivée ou non supportée');
      return;
    }

    // Arrêter toute synthèse en cours
    window.speechSynthesis.cancel();

    const utterance = new window.SpeechSynthesisUtterance(text);
    
    // Configuration de la voix selon la langue
    utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Sélectionner une voix appropriée selon la langue
    const voices = window.speechSynthesis.getVoices();
    const targetLang = language === 'fr' ? 'fr' : 'en';
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(targetLang) && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.startsWith(targetLang));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('🎙️ Voix Dr. Léa Martin sélectionnée:', preferredVoice.name, 'Langue:', preferredVoice.lang);
    }

    utterance.onstart = () => {
      console.log('🔊 Dr. Léa Martin commence à parler');
      setIsSpeaking(true);
      if (session) {
        setSession(prev => prev ? { ...prev, status: 'speaking' } : null);
      }
    };

    utterance.onend = () => {
      console.log('🔇 Dr. Léa Martin a fini de parler');
      setIsSpeaking(false);
      if (session) {
        setSession(prev => prev ? { ...prev, status: 'ready' } : null);
      }
    };

    utterance.onerror = (event) => {
      console.error('❌ Erreur synthèse vocale Dr. Léa Martin:', event.error);
      setIsSpeaking(false);
      if (session) {
        setSession(prev => prev ? { ...prev, status: 'ready' } : null);
      }
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // 🔧 NOUVELLE FONCTION : Nettoyer les sessions existantes
  const cleanupExistingSessions = async () => {
    try {
      setShowSessionWarning(false);
      await tavusService.forceCleanup();
      console.log('✅ Nettoyage des sessions terminé');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  };

  const initializeSession = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Initialisation UNIQUE de Dr. Léa Martin avec données complètes du patient:', {
        nom: patient.nom,
        prenom: patient.prenom,
        consultations: patient.consultations?.length || 0,
        factures: patient.factures?.length || 0,
        rendezVous: patient.rendezVous?.length || 0,
        typePatient: patient.typePatient,
        language: language
      });

      const newSession = await tavusService.initializePatientSession(patient, language);
      setSession(newSession);
      
      // Message de bienvenue de Dr. Léa Martin selon la langue
      const welcomeMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        type: 'ai',
        content: language === 'fr' 
          ? `Bonjour ! Je suis Dr. Léa Martin, votre assistante médicale IA. J'ai accès au dossier complet de ${patient.prenom} ${patient.nom}, incluant :

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

Que souhaitez-vous savoir ?`
          : `Hello! I'm Dr. Léa Martin, your AI medical assistant. I have access to ${patient.prenom} ${patient.nom}'s complete file, including:

📋 Complete medical history
🩺 ${patient.consultations?.length || 0} recorded consultation(s)
💰 ${patient.factures?.length || 0} invoice(s) and financial situation
📅 ${patient.rendezVous?.length || 0} scheduled appointment(s)

I can answer your questions about all these aspects. You can ask me:
- A complete file summary
- Details about recent consultations
- Financial situation and invoices
- Past and upcoming appointments
- Treatments and recommendations

What would you like to know?`,
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
      
      // Présentation vocale automatique de Dr. Léa Martin
      setTimeout(() => {
        const spokenIntro = language === 'fr'
          ? `Bonjour ! Je suis Dr. Léa Martin, votre assistante médicale IA. J'ai accès au dossier complet de ${patient.prenom} ${patient.nom}, incluant ses consultations, factures et rendez-vous. Que souhaitez-vous savoir ?`
          : `Hello! I'm Dr. Léa Martin, your AI medical assistant. I have access to ${patient.prenom} ${patient.nom}'s complete file, including consultations, invoices and appointments. What would you like to know?`;
        speakText(spokenIntro);
      }, 1000);
      
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de Dr. Léa Martin:', err);
      setError(err instanceof Error ? err.message : 'Erreur d\'initialisation');
    } finally {
      setIsLoading(false);
      initializationRef.current = false;
    }
  };

  const processVoiceInput = async (transcript: string) => {
    if (isProcessingRef.current || !transcript.trim()) {
      console.log('🚫 Traitement en cours ou transcript vide, ignoré');
      return;
    }

    isProcessingRef.current = true;
    console.log('🎯 Dr. Léa Martin traite le transcript avec contexte patient:', transcript);

    try {
      // Ajouter le message utilisateur au chat
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        type: 'user',
        content: transcript.trim(),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMessage]);

      // Envoyer le message au service Tavus
      await tavusService.sendMessage(transcript.trim());
      
      // Générer une réponse contextuelle avec les données patient dans la bonne langue
      setTimeout(() => {
        const aiResponse = tavusService.generateContextualResponse(transcript.trim(), patient, language);
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
        
        // Synthèse vocale automatique de la réponse Dr. Léa Martin
        setTimeout(() => {
          speakText(aiResponse);
        }, 500);
      }, 1500);

    } catch (error) {
      console.error('❌ Erreur lors du traitement vocal par Dr. Léa Martin:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        type: 'ai',
        content: language === 'fr'
          ? 'Désolée, je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?'
          : 'Sorry, I\'m experiencing a technical difficulty. Could you rephrase your question?',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const startListening = () => {
    if (!speechSupported) {
      const errorMsg = language === 'fr'
        ? 'La reconnaissance vocale n\'est pas supportée par votre navigateur'
        : 'Voice recognition is not supported by your browser';
      setSpeechError(errorMsg);
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

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';
    recognition.maxAlternatives = 1;

    let lastResultTime = Date.now();
    let currentFinalTranscript = '';

    recognition.onstart = () => {
      console.log('🎤 Dr. Léa Martin écoute en', language);
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
        console.log('📝 Dr. Léa Martin - Transcript final mis à jour:', currentFinalTranscript);
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
          console.log('🔇 Silence détecté, Dr. Léa Martin traite la demande');
          recognition.stop();
        }
      }, 2000);
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Erreur reconnaissance vocale Dr. Léa Martin:', event.error);
      let errorMessage = language === 'fr' 
        ? 'Erreur de reconnaissance vocale'
        : 'Voice recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = language === 'fr'
            ? 'Aucune parole détectée. Veuillez parler plus fort.'
            : 'No speech detected. Please speak louder.';
          break;
        case 'audio-capture':
          errorMessage = language === 'fr'
            ? 'Impossible d\'accéder au microphone. Vérifiez les permissions.'
            : 'Cannot access microphone. Check permissions.';
          break;
        case 'not-allowed':
          errorMessage = language === 'fr'
            ? 'Permission microphone refusée. Autorisez l\'accès au microphone.'
            : 'Microphone permission denied. Allow microphone access.';
          break;
        case 'network':
          errorMessage = language === 'fr'
            ? 'Erreur réseau. Vérifiez votre connexion internet.'
            : 'Network error. Check your internet connection.';
          break;
      }
      
      setSpeechError(errorMessage);
      setIsListening(false);
      if (session) {
        setSession(prev => prev ? { ...prev, status: 'ready' } : null);
      }
    };

    recognition.onend = () => {
      console.log('🔇 Reconnaissance vocale Dr. Léa Martin terminée');
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
        console.log('📤 Dr. Léa Martin traite automatiquement:', currentFinalTranscript.trim());
        processVoiceInput(currentFinalTranscript.trim());
        setFinalTranscript(''); // Réinitialiser après traitement
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      console.log('⏹️ Arrêt manuel de l\'écoute Dr. Léa Martin');
      recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage.trim();
    if (!content || !session) return;

    console.log('💬 Message envoyé à Dr. Léa Martin avec contexte patient:', content);

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
      
      // Générer une réponse contextuelle avec toutes les données patient dans la bonne langue
      setTimeout(() => {
        const aiResponse = tavusService.generateContextualResponse(content, patient, language);
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
        
        // **SYNTHÈSE VOCALE AUTOMATIQUE** de la réponse Dr. Léa Martin
        setTimeout(() => {
          speakText(aiResponse);
        }, 500);
      }, 1500);

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message à Dr. Léa Martin:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        type: 'ai',
        content: language === 'fr'
          ? 'Désolée, je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?'
          : 'Sorry, I\'m experiencing a technical difficulty. Could you rephrase your question?',
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
    if (session) {
      await tavusService.endSession();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    if (externalWindow && !externalWindow.closed) {
      externalWindow.close();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    setSession(null);
    setChatMessages([]);
    setFinalTranscript('');
    setInterimTranscript('');
    setIsSpeaking(false);
    isProcessingRef.current = false;
    initializationRef.current = false;
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      {/* 🔧 NOUVEAU : Alerte de sessions multiples */}
      {showSessionWarning && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[10000] flex items-center gap-3">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <p className="font-semibold">
              {language === 'fr' 
                ? 'Sessions Tavus multiples détectées !' 
                : 'Multiple Tavus sessions detected!'}
            </p>
            <p className="text-sm">
              {language === 'fr' 
                ? 'Cela peut causer des problèmes de synthèse vocale.' 
                : 'This may cause voice synthesis issues.'}
            </p>
          </div>
          <button 
            onClick={cleanupExistingSessions}
            className="ml-4 px-3 py-1 bg-white text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            {language === 'fr' ? 'Nettoyer' : 'Clean up'}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-wrap overflow-x-auto">
        {/* Left Panel - Video Avatar */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Dr. Léa Martin</h3>
                <p className="text-sm text-gray-600">
                  {language === 'fr' ? 'Assistante Médicale IA' : 'AI Medical Assistant'}
                </p>
                <p className="text-xs text-purple-600">
                  {language === 'fr' ? 'Patient' : 'Patient'}: {patient.prenom} {patient.nom}
                </p>
                <p className="text-xs text-purple-600">
                  {language === 'fr' 
                    ? `Accès complet: ${patient.consultations?.length || 0} consultations • ${patient.factures?.length || 0} factures • ${patient.rendezVous?.length || 0} RDV`
                    : `Full access: ${patient.consultations?.length || 0} consultations • ${patient.factures?.length || 0} invoices • ${patient.rendezVous?.length || 0} appointments`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session?.isDemoMode && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                  {language === 'fr' ? 'Mode Démo' : 'Demo Mode'}
                </span>
              )}
              {externalWindow && !externalWindow.closed && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  {language === 'fr' ? 'Fenêtre externe active' : 'External window active'}
                </span>
              )}
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-colors ${
                  voiceEnabled 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
                title={voiceEnabled 
                  ? (language === 'fr' ? 'Désactiver la voix' : 'Disable voice')
                  : (language === 'fr' ? 'Activer la voix' : 'Enable voice')
                }
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
                <p className="text-gray-600">
                  {language === 'fr' 
                    ? 'Initialisation de Dr. Léa Martin...'
                    : 'Initializing Dr. Léa Martin...'
                  }
                </p>
                <p className="text-sm text-purple-600 mt-2">
                  {language === 'fr'
                    ? 'Chargement des données patient complètes'
                    : 'Loading complete patient data'
                  }
                </p>
              </div>
            ) : error ? (
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={initializeSession}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  {language === 'fr' ? 'Réessayer' : 'Retry'}
                </button>
              </div>
            ) : session ? (
              <div className="text-center w-full">
                {/* Avatar simulé */}
                <div className={`w-48 h-48 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl transition-all duration-300 ${
                  isSpeaking ? 'scale-110 shadow-purple-300' : ''
                }`}>
                  <Bot className={`w-24 h-24 text-white transition-all duration-300 ${
                    isSpeaking ? 'animate-pulse' : ''
                  }`} />
                </div>
                
                {/* Status */}
                <div className="mb-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    session.status === 'ready' ? 'bg-green-100 text-green-800' :
                    session.status === 'speaking' || isSpeaking ? 'bg-blue-100 text-blue-800' :
                    session.status === 'listening' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      session.status === 'ready' ? 'bg-green-500' :
                      session.status === 'speaking' || isSpeaking ? 'bg-blue-500 animate-pulse' :
                      session.status === 'listening' ? 'bg-orange-500 animate-pulse' :
                      'bg-gray-500'
                    }`}></div>
                    {session.status === 'ready' && !isSpeaking && (language === 'fr' ? 'Prête' : 'Ready')}
                    {(session.status === 'speaking' || isSpeaking) && (language === 'fr' ? 'En train de parler' : 'Speaking')}
                    {session.status === 'listening' && (language === 'fr' ? 'À l\'écoute' : 'Listening')}
                    {session.status === 'initializing' && (language === 'fr' ? 'Initialisation' : 'Initializing')}
                    {session.status === 'ended' && (language === 'fr' ? 'Session terminée' : 'Session ended')}
                  </div>
                </div>

                {/* Transcription en temps réel */}
                {(isListening || finalTranscript || interimTranscript) && (
                  <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-purple-200 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">
                        {isListening 
                          ? (language === 'fr' ? 'Écoute en cours...' : 'Listening...')
                          : (language === 'fr' ? 'Transcription terminée' : 'Transcription completed')
                        }
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
                        <p className="text-gray-400 italic">
                          {language === 'fr' ? 'Parlez maintenant...' : 'Speak now...'}
                        </p>
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
                <div className="flex justify-center gap-3">
                  {speechSupported ? (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={session.status === 'ended' || isSpeaking}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                        isListening
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-5 h-5" />
                          {language === 'fr' ? 'Arrêter' : 'Stop'}
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          {language === 'fr' ? 'Parler' : 'Speak'}
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-red-600 text-sm mb-2">
                        {language === 'fr'
                          ? 'Reconnaissance vocale non supportée'
                          : 'Voice recognition not supported'
                        }
                      </p>
                      <p className="text-gray-500 text-xs">
                        {language === 'fr'
                          ? 'Utilisez Chrome, Edge ou Safari'
                          : 'Use Chrome, Edge or Safari'
                        }
                      </p>
                    </div>
                  )}
                  
                  {session.videoUrl !== '#demo-mode' && (
                    <button
                      onClick={openExternalWindow}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      {language === 'fr' ? 'Ouvrir Avatar' : 'Open Avatar'}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="w-full md:w-1/2 flex flex-col border-l border-gray-200">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'fr' ? 'Chat Médical Avancé' : 'Advanced Medical Chat'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'fr' 
                    ? 'Accès complet aux données patient'
                    : 'Full access to patient data'
                  }
                </p>
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
                placeholder={language === 'fr'
                  ? 'Posez une question sur le patient (consultations, factures, RDV...)...'
                  : 'Ask a question about the patient (consultations, invoices, appointments...)...'
                }
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
              💡 {language === 'fr'
                ? 'Exemples: "Résumé complet", "Dernière consultation", "Factures en attente", "Prochain rendez-vous"'
                : 'Examples: "Complete summary", "Last consultation", "Pending invoices", "Next appointment"'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};