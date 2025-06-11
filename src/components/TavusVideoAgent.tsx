import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageCircle, 
  X, 
  Volume2, 
  VolumeX,
  Loader,
  Bot,
  Send,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Play,
  Pause,
  Monitor,
  Clock,
  Maximize2,
  MicIcon,
  Square
} from 'lucide-react';
import { Patient } from '../types/Patient';
import { tavusService, TavusVideoSession } from '../services/tavusService';

interface TavusVideoAgentProps {
  patient: Patient;
  isVisible: boolean;
  onClose: () => void;
}

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
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
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  const [showExternalWindow, setShowExternalWindow] = useState(false);
  
  // Speech Recognition states
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'agent' | 'system' | 'warning';
    content: string;
    timestamp: Date;
  }>>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Check Speech Recognition support and Tavus configuration on mount
  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechRecognitionSupported(!!SpeechRecognition);

    const config = tavusService.getConfigurationStatus();
    if (!config.isFullyConfigured) {
      const missingItems = [];
      if (!config.hasApiKey) missingItems.push('API Key');
      if (!config.hasReplicaId) missingItems.push('Replica ID');
      if (!config.hasPersonaId) missingItems.push('Persona ID');
      
      setChatHistory([{
        type: 'system',
        content: `Configuration Tavus incomplète. Éléments manquants: ${missingItems.join(', ')}. Fonctionnement en mode démonstration avec reconnaissance vocale${SpeechRecognition ? ' activée' : ' non supportée'}.`,
        timestamp: new Date()
      }]);
    } else {
      setChatHistory([{
        type: 'system',
        content: `Configuration Tavus détectée. Initialisation de l'avatar IA avec support vocal${SpeechRecognition ? ' et reconnaissance vocale' : ''}...`,
        timestamp: new Date()
      }]);
    }

    if (!SpeechRecognition) {
      setChatHistory(prev => [...prev, {
        type: 'warning',
        content: '⚠️ Reconnaissance vocale non supportée par votre navigateur. Utilisez Chrome, Edge ou Safari pour une meilleure expérience.',
        timestamp: new Date()
      }]);
    }
  }, []);

  // Initialize microphone permissions and setup
  useEffect(() => {
    if (isVisible) {
      checkMicrophonePermissions();
      initializeSpeechRecognition();
    }
    
    return () => {
      cleanupAudioResources();
      cleanupSpeechRecognition();
    };
  }, [isVisible]);

  // Initialize Tavus session when component becomes visible
  useEffect(() => {
    if (isVisible && !session) {
      initializeSession();
    }
  }, [isVisible, patient]);

  // Cleanup session when component unmounts or becomes invisible
  useEffect(() => {
    return () => {
      if (session) {
        tavusService.endSession();
      }
      cleanupAudioResources();
      cleanupSpeechRecognition();
    };
  }, []);

  // Handle audio controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.volume = isMuted ? 0 : 1;
    }
  }, [isMuted]);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      
      // Configuration de la reconnaissance vocale
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR'; // Français par défaut
      recognition.maxAlternatives = 1;

      // Événements de reconnaissance vocale
      recognition.onstart = () => {
        console.log('Reconnaissance vocale démarrée');
        setIsListening(true);
        setCurrentTranscript('');
        setFinalTranscript('');
        setChatHistory(prev => [...prev, {
          type: 'system',
          content: '🎤 Reconnaissance vocale active - Parlez maintenant...',
          timestamp: new Date()
        }]);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscriptText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscriptText += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(interimTranscript);
        
        if (finalTranscriptText) {
          setFinalTranscript(prev => prev + finalTranscriptText);
          console.log('Transcription finale:', finalTranscriptText);
        }
      };

      recognition.onerror = (event) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        setIsListening(false);
        setIsSpeechRecognitionActive(false);
        
        let errorMessage = '❌ Erreur de reconnaissance vocale: ';
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'Aucune parole détectée. Réessayez.';
            break;
          case 'audio-capture':
            errorMessage += 'Impossible de capturer l\'audio. Vérifiez votre microphone.';
            break;
          case 'not-allowed':
            errorMessage += 'Permission microphone refusée.';
            setMicrophonePermission('denied');
            break;
          case 'network':
            errorMessage += 'Erreur réseau. Vérifiez votre connexion.';
            break;
          case 'language-not-supported':
            errorMessage += 'Langue non supportée.';
            break;
          default:
            errorMessage += event.error;
        }
        
        setChatHistory(prev => [...prev, {
          type: 'warning',
          content: errorMessage,
          timestamp: new Date()
        }]);
      };

      recognition.onend = () => {
        console.log('Reconnaissance vocale terminée');
        setIsListening(false);
        setIsSpeechRecognitionActive(false);
        
        // Traiter la transcription finale si elle existe
        if (finalTranscript.trim()) {
          handleVoiceMessage(finalTranscript.trim());
        } else if (currentTranscript.trim()) {
          handleVoiceMessage(currentTranscript.trim());
        }
        
        setCurrentTranscript('');
        setFinalTranscript('');
      };

      speechRecognitionRef.current = recognition;
      
      setChatHistory(prev => [...prev, {
        type: 'system',
        content: '✅ Reconnaissance vocale initialisée et prête à l\'emploi !',
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la reconnaissance vocale:', error);
      setChatHistory(prev => [...prev, {
        type: 'warning',
        content: '❌ Impossible d\'initialiser la reconnaissance vocale.',
        timestamp: new Date()
      }]);
    }
  };

  const cleanupSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      } catch (error) {
        console.error('Erreur lors du nettoyage de la reconnaissance vocale:', error);
      }
    }
    setIsListening(false);
    setIsSpeechRecognitionActive(false);
    setCurrentTranscript('');
    setFinalTranscript('');
  };

  const checkMicrophonePermissions = async () => {
    try {
      // Check if we already have permission
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicrophonePermission(permissionStatus.state);
      
      // Listen for permission changes
      permissionStatus.onchange = () => {
        setMicrophonePermission(permissionStatus.state);
      };

      if (permissionStatus.state === 'granted') {
        setChatHistory(prev => [...prev, {
          type: 'system',
          content: '🎤 Microphone autorisé - Interaction vocale disponible',
          timestamp: new Date()
        }]);
      } else if (permissionStatus.state === 'denied') {
        setChatHistory(prev => [...prev, {
          type: 'warning',
          content: '🚫 Microphone refusé - Utilisez le chat textuel ou autorisez le microphone dans les paramètres du navigateur',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions microphone:', error);
      setChatHistory(prev => [...prev, {
        type: 'warning',
        content: '⚠️ Impossible de vérifier les permissions microphone. Essayez d\'activer manuellement.',
        timestamp: new Date()
      }]);
    }
  };

  const requestMicrophoneAccess = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      audioStreamRef.current = stream;
      setMicrophonePermission('granted');
      
      // Setup audio analysis for visual feedback
      setupAudioAnalysis(stream);
      
      setChatHistory(prev => [...prev, {
        type: 'system',
        content: '✅ Microphone activé avec succès ! Vous pouvez maintenant parler à l\'IA.',
        timestamp: new Date()
      }]);
      
      return true;
    } catch (error) {
      console.error('Erreur d\'accès au microphone:', error);
      setMicrophonePermission('denied');
      
      let errorMessage = '❌ Accès au microphone refusé. ';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Veuillez autoriser l\'accès au microphone dans votre navigateur.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'Aucun microphone détecté sur votre appareil.';
        } else if (error.name === 'NotReadableError') {
          errorMessage += 'Microphone utilisé par une autre application.';
        } else {
          errorMessage += `Erreur: ${error.message}`;
        }
      }
      
      setChatHistory(prev => [...prev, {
        type: 'warning',
        content: errorMessage,
        timestamp: new Date()
      }]);
      
      return false;
    }
  };

  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Start audio level monitoring
      monitorAudioLevel();
    } catch (error) {
      console.error('Erreur lors de la configuration de l\'analyse audio:', error);
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255); // Normalize to 0-1
      
      if (isSpeechRecognitionActive || isListening) {
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  };

  const startSpeechRecognition = async () => {
    if (!speechRecognitionSupported) {
      setChatHistory(prev => [...prev, {
        type: 'warning',
        content: '❌ Reconnaissance vocale non supportée par votre navigateur. Utilisez Chrome, Edge ou Safari.',
        timestamp: new Date()
      }]);
      return;
    }

    if (microphonePermission !== 'granted') {
      const success = await requestMicrophoneAccess();
      if (!success) return;
    }

    if (!speechRecognitionRef.current) {
      initializeSpeechRecognition();
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for initialization
    }

    try {
      setIsSpeechRecognitionActive(true);
      setCurrentTranscript('');
      setFinalTranscript('');
      
      // Start audio level monitoring
      if (audioStreamRef.current) {
        monitorAudioLevel();
      }
      
      speechRecognitionRef.current?.start();
      
      setChatHistory(prev => [...prev, {
        type: 'system',
        content: '🎤 Reconnaissance vocale démarrée - Parlez maintenant !',
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Erreur lors du démarrage de la reconnaissance vocale:', error);
      setIsSpeechRecognitionActive(false);
      setChatHistory(prev => [...prev, {
        type: 'warning',
        content: '❌ Impossible de démarrer la reconnaissance vocale.',
        timestamp: new Date()
      }]);
    }
  };

  const stopSpeechRecognition = () => {
    if (speechRecognitionRef.current && isSpeechRecognitionActive) {
      try {
        speechRecognitionRef.current.stop();
        setIsSpeechRecognitionActive(false);
        setIsListening(false);
        setAudioLevel(0);
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        setChatHistory(prev => [...prev, {
          type: 'system',
          content: '⏹️ Reconnaissance vocale arrêtée.',
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Erreur lors de l\'arrêt de la reconnaissance vocale:', error);
      }
    }
  };

  const handleVoiceMessage = async (transcription: string) => {
    if (!transcription.trim()) {
      setChatHistory(prev => [...prev, {
        type: 'warning',
        content: '❌ Aucun texte transcrit. Réessayez de parler plus clairement.',
        timestamp: new Date()
      }]);
      return;
    }

    try {
      setChatHistory(prev => [...prev, {
        type: 'user',
        content: `🎤 "${transcription}"`,
        timestamp: new Date()
      }]);

      if (session) {
        await tavusService.sendMessage(transcription);
      }
      
      // Generate response
      setTimeout(() => {
        const response = generateAgentResponse(transcription, patient);
        setChatHistory(prev => [...prev, {
          type: 'agent',
          content: response,
          timestamp: new Date()
        }]);
        
        // Play audio response
        playAudioResponse(response);
      }, 1500);
    } catch (error) {
      console.error('Erreur lors du traitement du message vocal:', error);
      setChatHistory(prev => [...prev, {
        type: 'warning',
        content: '❌ Erreur lors du traitement de votre message vocal.',
        timestamp: new Date()
      }]);
    }
  };

  const cleanupAudioResources = () => {
    // Stop audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsSpeechRecognitionActive(false);
    setIsListening(false);
    setAudioLevel(0);
  };

  const toggleMicrophone = async () => {
    if (!isAudioEnabled) {
      setIsAudioEnabled(true);
      return;
    }

    if (!speechRecognitionSupported) {
      setChatHistory(prev => [...prev, {
        type: 'warning',
        content: '❌ Reconnaissance vocale non supportée. Utilisez Chrome, Edge ou Safari pour cette fonctionnalité.',
        timestamp: new Date()
      }]);
      return;
    }

    if (microphonePermission !== 'granted') {
      await requestMicrophoneAccess();
      return;
    }

    if (isSpeechRecognitionActive || isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const initializeSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newSession = await tavusService.initializePatientSession(patient);
      setSession(newSession);
      
      // Add initial agent message
      setChatHistory(prev => [...prev, {
        type: 'agent',
        content: `Bonjour ! Je suis Dr. IA Assistant, votre assistant médical virtuel${newSession.isDemoMode ? ' en mode démonstration' : ' alimenté par Tavus'}. Je vais vous présenter le dossier de ${patient.prenom} ${patient.nom}.`,
        timestamp: new Date()
      }]);

      // Check if we have a valid Tavus URL that's not demo mode
      if (newSession.videoUrl && newSession.videoUrl !== '#demo-mode') {
        setChatHistory(prev => [...prev, {
          type: 'system',
          content: `L'avatar vidéo Tavus est prêt ! En raison des restrictions de sécurité, l'avatar doit être ouvert dans une nouvelle fenêtre. Cliquez sur "Ouvrir Avatar" pour démarrer la conversation vidéo.`,
          timestamp: new Date()
        }]);
        setIsAvatarLoaded(true);
      }

      // Start playing audio introduction
      setTimeout(() => {
        playIntroductionAudio();
      }, 1000);

      // Add medical summary after a delay
      setTimeout(() => {
        setChatHistory(prev => [...prev, {
          type: 'agent',
          content: generateInitialSummary(patient),
          timestamp: new Date()
        }]);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      
      const messageType = errorMessage.includes('Limite de conversations simultanées') ? 'warning' : 'system';
      
      setChatHistory(prev => [...prev, {
        type: messageType,
        content: errorMessage,
        timestamp: new Date()
      }]);

      if (errorMessage.includes('Limite de conversations simultanées')) {
        setTimeout(() => {
          setChatHistory(prev => [...prev, {
            type: 'system',
            content: 'Vous pouvez réessayer dans quelques minutes ou utiliser le mode démonstration avec reconnaissance vocale qui reste pleinement fonctionnel.',
            timestamp: new Date()
          }]);
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const playIntroductionAudio = () => {
    const introText = `Bonjour, je suis Dr. IA Assistant. Je vais vous présenter le dossier médical de ${patient.prenom} ${patient.nom}, âgé de ${patient.age} ans, actuellement hospitalisé en ${patient.service}.`;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(introText);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = isMuted ? 0 : 1;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        if (session) {
          setSession(prev => prev ? { ...prev, status: 'speaking' } : null);
        }
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        if (session) {
          setSession(prev => prev ? { ...prev, status: 'ready' } : null);
        }
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const generateInitialSummary = (patient: Patient): string => {
    const criticalInfo = [];
    
    if (patient.alerte && patient.alerte.niveau !== 'verte') {
      criticalInfo.push(`⚠️ ALERTE ${patient.alerte.niveau.toUpperCase()}: ${patient.alerte.message}`);
    }

    if (patient.allergies.length > 0) {
      criticalInfo.push(`🚨 Allergies: ${patient.allergies.join(', ')}`);
    }

    return `
📋 **Résumé du dossier médical**

**Patient:** ${patient.prenom} ${patient.nom}, ${patient.age} ans
**Service:** ${patient.service} | **Statut:** ${patient.statut}
**Groupe sanguin:** ${patient.groupeSanguin}

${criticalInfo.length > 0 ? `**Informations critiques:**\n${criticalInfo.join('\n')}\n` : ''}

**Motif d'hospitalisation:** ${patient.motifHospitalisation}

**Traitements actuels:** ${patient.traitements.map(t => `${t.nom} ${t.dosage}`).join(', ') || 'Aucun'}

**Contact d'urgence:** ${patient.contactUrgence.nom} (${patient.contactUrgence.lien}) - ${patient.contactUrgence.telephone}

💬 Vous pouvez me poser des questions par écrit ou **utiliser le microphone** pour une interaction vocale avec reconnaissance automatique !
    `.trim();
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !session) return;

    const userMessage = message.trim();
    setMessage('');

    setChatHistory(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    try {
      await tavusService.sendMessage(userMessage);
      
      setTimeout(() => {
        const response = generateAgentResponse(userMessage, patient);
        setChatHistory(prev => [...prev, {
          type: 'agent',
          content: response,
          timestamp: new Date()
        }]);
        
        playAudioResponse(response);
      }, 2000);
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
    }
  };

  const playAudioResponse = (text: string) => {
    if ('speechSynthesis' in window && !isMuted) {
      const cleanText = text.replace(/[*#]/g, '').replace(/\n/g, ' ');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        if (session) {
          setSession(prev => prev ? { ...prev, status: 'speaking' } : null);
        }
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        if (session) {
          setSession(prev => prev ? { ...prev, status: 'ready' } : null);
        }
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      if (session) {
        setSession(prev => prev ? { ...prev, status: 'ready' } : null);
      }
    }
  };

  const generateAgentResponse = (userMessage: string, patient: Patient): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('allergie')) {
      return patient.allergies.length > 0 
        ? `Allergies identifiées: ${patient.allergies.join(', ')}. Ces informations sont critiques pour tout traitement. Assurez-vous que tous les médicaments prescrits sont compatibles avec ces allergies.`
        : 'Aucune allergie connue n\'est répertoriée pour ce patient dans le dossier actuel.';
    }
    
    if (lowerMessage.includes('traitement') || lowerMessage.includes('médicament')) {
      return patient.traitements.length > 0
        ? `Traitements actuels: ${patient.traitements.map(t => `${t.nom} ${t.dosage}, ${t.frequence}`).join('. ')}`
        : 'Aucun traitement en cours n\'est répertorié dans le dossier.';
    }
    
    if (lowerMessage.includes('antécédent')) {
      const personnels = patient.antecedents.personnels.length > 0 ? patient.antecedents.personnels.join(', ') : 'Aucun';
      const familiaux = patient.antecedents.familiaux.length > 0 ? patient.antecedents.familiaux.join(', ') : 'Aucun';
      return `Antécédents médicaux. Personnels: ${personnels}. Familiaux: ${familiaux}`;
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('urgence')) {
      return `Contact d'urgence: ${patient.contactUrgence.nom}, ${patient.contactUrgence.lien}. Téléphone: ${patient.contactUrgence.telephone}`;
    }

    if (lowerMessage.includes('diagnostic')) {
      return `Diagnostics actuels: ${patient.diagnostics.join(', ')}`;
    }

    if (lowerMessage.includes('biométrie') || lowerMessage.includes('poids') || lowerMessage.includes('taille')) {
      return `Données biométriques: Poids ${patient.biometrie.poids} kilogrammes, Taille ${patient.biometrie.taille} centimètres, I.M.C. ${patient.biometrie.imc}`;
    }
    
    return `Je peux vous fournir des informations sur les allergies, les traitements, les antécédents médicaux, les contacts d'urgence, les diagnostics, ou les données biométriques. Vous pouvez me poser vos questions par écrit ou utiliser le microphone pour une interaction vocale avec reconnaissance automatique. Que souhaitez-vous savoir spécifiquement ?`;
  };

  const openTavusInNewWindow = () => {
    if (session?.videoUrl && session.videoUrl !== '#demo-mode') {
      const width = 1200;
      const height = 800;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const newWindow = window.open(
        session.videoUrl,
        'tavus-conversation',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`
      );
      
      if (newWindow) {
        setShowExternalWindow(true);
        setChatHistory(prev => [...prev, {
          type: 'system',
          content: 'Avatar Tavus ouvert dans une nouvelle fenêtre. Vous pouvez maintenant voir et interagir avec l\'assistant IA vidéo.',
          timestamp: new Date()
        }]);
        
        const checkClosed = setInterval(() => {
          if (newWindow.closed) {
            setShowExternalWindow(false);
            setChatHistory(prev => [...prev, {
              type: 'system',
              content: 'Fenêtre avatar fermée. Vous pouvez continuer à utiliser le chat ici.',
              timestamp: new Date()
            }]);
            clearInterval(checkClosed);
          }
        }, 1000);
      } else {
        setChatHistory(prev => [...prev, {
          type: 'warning',
          content: 'Impossible d\'ouvrir la nouvelle fenêtre. Vérifiez que les pop-ups ne sont pas bloqués.',
          timestamp: new Date()
        }]);
      }
    }
  };

  const retryInitialization = () => {
    setError(null);
    setSession(null);
    setIsAvatarLoaded(false);
    setShowExternalWindow(false);
    setChatHistory(prev => [...prev, {
      type: 'system',
      content: 'Nouvelle tentative d\'initialisation...',
      timestamp: new Date()
    }]);
    initializeSession();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600';
      case 'speaking': return 'text-blue-600';
      case 'listening': return 'text-orange-600';
      case 'initializing': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Prêt';
      case 'speaking': return 'En train de parler';
      case 'listening': return 'À l\'écoute';
      case 'initializing': return 'Initialisation';
      case 'ended': return 'Session terminée';
      default: return 'Inconnu';
    }
  };

  const getMicrophoneButtonColor = () => {
    if (!speechRecognitionSupported) return 'bg-gray-500 hover:bg-gray-600';
    if (microphonePermission === 'denied') return 'bg-red-600 hover:bg-red-700';
    if (isSpeechRecognitionActive || isListening) return 'bg-red-600 hover:bg-red-700 animate-pulse';
    if (!isAudioEnabled) return 'bg-red-600 hover:bg-red-700';
    return 'bg-gray-700 hover:bg-gray-600';
  };

  const getMicrophoneIcon = () => {
    if (!speechRecognitionSupported || microphonePermission === 'denied' || !isAudioEnabled) {
      return <MicOff className="w-5 h-5 text-white" />;
    }
    if (isSpeechRecognitionActive || isListening) {
      return <Square className="w-5 h-5 text-white" />;
    }
    return <Mic className="w-5 h-5 text-white" />;
  };

  const getMicrophoneTooltip = () => {
    if (!speechRecognitionSupported) {
      return 'Reconnaissance vocale non supportée - Utilisez Chrome, Edge ou Safari';
    }
    if (microphonePermission === 'denied') {
      return 'Microphone refusé - Autorisez dans les paramètres';
    }
    if (isSpeechRecognitionActive || isListening) {
      return 'Arrêter la reconnaissance vocale';
    }
    return 'Commencer la reconnaissance vocale';
  };

  if (!isVisible) return null;

  const configStatus = tavusService.getConfigurationStatus();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Assistant Médical IA - {patient.prenom} {patient.nom}
              </h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${session?.status === 'ready' || session?.status === 'speaking' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className={`text-sm ${getStatusColor(session?.status || 'initializing')}`}>
                  {getStatusText(session?.status || 'initializing')}
                  {session?.isDemoMode && ' (Mode Démo)'}
                  {showExternalWindow && ' (Fenêtre externe active)'}
                </span>
                {configStatus.isFullyConfigured && !session?.isDemoMode ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
                {/* Speech Recognition Status */}
                {speechRecognitionSupported && microphonePermission === 'granted' && (
                  <div className="flex items-center gap-1">
                    <MicIcon className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">
                      {isListening ? 'Écoute...' : 'Vocal OK'}
                    </span>
                  </div>
                )}
                {!speechRecognitionSupported && (
                  <div className="flex items-center gap-1">
                    <MicOff className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">Vocal non supporté</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session?.videoUrl && session.videoUrl !== '#demo-mode' && (
              <button
                onClick={openTavusInNewWindow}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                title="Ouvrir l'avatar dans une nouvelle fenêtre"
              >
                <ExternalLink className="w-4 h-4" />
                Ouvrir Avatar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Video Section */}
          <div className="flex-1 bg-gray-900 relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
                  <p>Initialisation de l'agent médical Tavus...</p>
                  <p className="text-sm text-gray-300 mt-2">
                    Replica ID: {import.meta.env.VITE_TAVUS_REPLICA_ID}
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white max-w-md">
                  <div className="mb-4">
                    {error.includes('Limite de conversations simultanées') ? (
                      <Clock className="w-12 h-12 mx-auto text-orange-400" />
                    ) : (
                      <VideoOff className="w-12 h-12 mx-auto text-red-400" />
                    )}
                  </div>
                  <p className={`mb-2 ${error.includes('Limite de conversations simultanées') ? 'text-orange-400' : 'text-red-400'}`}>
                    {error}
                  </p>
                  <p className="text-sm text-gray-300 mb-4">
                    {error.includes('Limite de conversations simultanées') 
                      ? 'Le service Tavus a atteint sa limite de conversations simultanées'
                      : 'Mode démonstration avec synthèse vocale et reconnaissance vocale'
                    }
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={retryInitialization}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mr-2"
                    >
                      Réessayer
                    </button>
                    {error.includes('Limite de conversations simultanées') && (
                      <p className="text-xs text-gray-400">
                        Conseil: Fermez d'autres sessions Tavus actives ou attendez quelques minutes
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Avatar Display */}
                <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className={`w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 relative ${isPlaying ? 'animate-pulse' : ''}`}>
                      <Bot className="w-16 h-16 text-white" />
                      {/* Audio level indicator for speech recognition */}
                      {(isSpeechRecognitionActive || isListening) && audioLevel > 0 && (
                        <div 
                          className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping"
                          style={{ 
                            opacity: audioLevel,
                            transform: `scale(${1 + audioLevel * 0.3})`
                          }}
                        />
                      )}
                      {/* Listening indicator */}
                      {isListening && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Dr. IA Assistant</h3>
                    <p className="text-blue-200 mb-2">
                      Agent médical virtuel {session?.isDemoMode ? 'en mode démonstration' : 'Tavus'}
                    </p>
                    
                    {/* Speech Recognition Status Display */}
                    <div className="mb-4">
                      {speechRecognitionSupported ? (
                        microphonePermission === 'granted' ? (
                          <div className="flex items-center justify-center gap-2 text-green-300">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">
                              {isListening ? 'Reconnaissance vocale active...' : 
                               isSpeechRecognitionActive ? 'Démarrage de la reconnaissance...' : 
                               'Reconnaissance vocale prête'}
                            </span>
                          </div>
                        ) : microphonePermission === 'denied' ? (
                          <div className="flex items-center justify-center gap-2 text-red-300">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Microphone refusé</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-yellow-300">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Cliquez sur le micro pour activer</span>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-orange-300">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Reconnaissance vocale non supportée</span>
                        </div>
                      )}
                    </div>

                    {/* Current transcript display */}
                    {(currentTranscript || finalTranscript) && (
                      <div className="mb-4 p-3 bg-black bg-opacity-30 rounded-lg">
                        <p className="text-sm text-gray-300 mb-1">Transcription en cours:</p>
                        <p className="text-white">
                          {finalTranscript}
                          <span className="text-gray-400">{currentTranscript}</span>
                          {isListening && <span className="animate-pulse">|</span>}
                        </p>
                      </div>
                    )}
                    
                    {configStatus.isFullyConfigured && !session?.isDemoMode ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-green-300">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Configuration Tavus active</span>
                        </div>
                        {session?.videoUrl && session.videoUrl !== '#demo-mode' && !showExternalWindow && (
                          <button
                            onClick={openTavusInNewWindow}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mx-auto"
                          >
                            <Video className="w-4 h-4" />
                            Ouvrir Avatar Vidéo
                          </button>
                        )}
                        {showExternalWindow && (
                          <div className="flex items-center justify-center gap-2 text-purple-300">
                            <Monitor className="w-4 h-4" />
                            <span className="text-sm">Avatar actif dans fenêtre externe</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-orange-300">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">
                          Mode démonstration avec reconnaissance vocale
                          {speechRecognitionSupported ? ' activée' : ' non supportée'}
                        </span>
                      </div>
                    )}
                    
                    {session?.status === 'speaking' && (
                      <div className="flex justify-center mt-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                  <button
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    className={`p-3 rounded-full transition-colors ${
                      isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isVideoEnabled ? (
                      <Video className="w-5 h-5 text-white" />
                    ) : (
                      <VideoOff className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full transition-colors ${
                      !isMuted ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {!isMuted ? (
                      <Volume2 className="w-5 h-5 text-white" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-white" />
                    )}
                  </button>
                  {isPlaying && (
                    <button
                      onClick={stopAudio}
                      className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      <Pause className="w-5 h-5 text-white" />
                    </button>
                  )}
                  {/* Enhanced Speech Recognition Button */}
                  <button
                    onClick={toggleMicrophone}
                    className={`p-3 rounded-full transition-colors relative ${getMicrophoneButtonColor()}`}
                    title={getMicrophoneTooltip()}
                  >
                    {getMicrophoneIcon()}
                    {/* Audio level indicator */}
                    {(isSpeechRecognitionActive || isListening) && audioLevel > 0 && (
                      <div 
                        className="absolute inset-0 rounded-full border-2 border-green-400"
                        style={{ 
                          opacity: audioLevel,
                          transform: `scale(${1 + audioLevel * 0.5})`
                        }}
                      />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Chat Section */}
          <div className="w-96 border-l border-gray-200 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Chat Médical</h3>
              </div>
              {!configStatus.isFullyConfigured || session?.isDemoMode ? (
                <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded text-xs text-orange-800">
                  Mode démonstration - Synthèse vocale et reconnaissance vocale
                  {speechRecognitionSupported ? ' activées' : ' (reconnaissance non supportée)'}
                </div>
              ) : showExternalWindow ? (
                <div className="mt-2 p-2 bg-purple-100 border border-purple-200 rounded text-xs text-purple-800">
                  Avatar Tavus actif dans fenêtre externe
                </div>
              ) : (
                <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-xs text-green-800">
                  Configuration Tavus active - Cliquez "Ouvrir Avatar"
                </div>
              )}
              
              {/* Speech Recognition Status in Chat Header */}
              <div className="mt-2 flex items-center gap-2">
                {speechRecognitionSupported ? (
                  microphonePermission === 'granted' ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <MicIcon className="w-3 h-3" />
                      <span className="text-xs">
                        {isListening ? 'Écoute en cours...' : 
                         isSpeechRecognitionActive ? 'Démarrage...' : 
                         'Reconnaissance vocale prête'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-orange-600">
                      <MicOff className="w-3 h-3" />
                      <span className="text-xs">Cliquez le micro pour activer</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <MicOff className="w-3 h-3" />
                    <span className="text-xs">Reconnaissance vocale non supportée</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : msg.type === 'system'
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : msg.type === 'warning'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-line">{msg.content}</div>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-blue-200' : 
                      msg.type === 'system' ? 'text-orange-600' :
                      msg.type === 'warning' ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Posez une question sur le patient..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={!session || session.status === 'initializing'}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !session || session.status === 'initializing'}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Voice Input Button */}
              <div className="flex justify-center">
                <button
                  onClick={toggleMicrophone}
                  disabled={!session || session.status === 'initializing'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${getMicrophoneButtonColor()} text-white disabled:bg-gray-400`}
                  title={getMicrophoneTooltip()}
                >
                  {getMicrophoneIcon()}
                  <span>
                    {!speechRecognitionSupported 
                      ? 'Vocal non supporté'
                      : microphonePermission === 'denied' 
                      ? 'Autoriser le micro'
                      : (isSpeechRecognitionActive || isListening)
                      ? 'Arrêter la reconnaissance'
                      : 'Parler à l\'IA'
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden audio element for future use */}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};