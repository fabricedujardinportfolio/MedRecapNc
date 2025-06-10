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
  Maximize2
} from 'lucide-react';
import { Patient } from '../types/Patient';
import { tavusService, TavusVideoSession } from '../services/tavusService';

interface TavusVideoAgentProps {
  patient: Patient;
  isVisible: boolean;
  onClose: () => void;
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
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'agent' | 'system' | 'warning';
    content: string;
    timestamp: Date;
  }>>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Check Tavus configuration on mount
  useEffect(() => {
    const config = tavusService.getConfigurationStatus();
    if (!config.isFullyConfigured) {
      const missingItems = [];
      if (!config.hasApiKey) missingItems.push('API Key');
      if (!config.hasReplicaId) missingItems.push('Replica ID');
      if (!config.hasPersonaId) missingItems.push('Persona ID');
      
      setChatHistory([{
        type: 'system',
        content: `Configuration Tavus incomplète. Éléments manquants: ${missingItems.join(', ')}. Fonctionnement en mode démonstration.`,
        timestamp: new Date()
      }]);
    } else {
      setChatHistory([{
        type: 'system',
        content: `Configuration Tavus détectée. Initialisation de l'avatar IA...`,
        timestamp: new Date()
      }]);
    }
  }, []);

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
    };
  }, []);

  // Handle audio controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.volume = isMuted ? 0 : 1;
    }
  }, [isMuted]);

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
        // Since we can't embed tavus.daily.co directly due to CORS,
        // we'll show a message to open in external window
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
      
      // Determine message type based on error content
      const messageType = errorMessage.includes('Limite de conversations simultanées') ? 'warning' : 'system';
      
      setChatHistory(prev => [...prev, {
        type: messageType,
        content: errorMessage,
        timestamp: new Date()
      }]);

      // If it's a concurrent limit error, suggest retry
      if (errorMessage.includes('Limite de conversations simultanées')) {
        setTimeout(() => {
          setChatHistory(prev => [...prev, {
            type: 'system',
            content: 'Vous pouvez réessayer dans quelques minutes ou utiliser le mode démonstration avec synthèse vocale qui reste pleinement fonctionnel.',
            timestamp: new Date()
          }]);
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const playIntroductionAudio = () => {
    // Simulate text-to-speech for introduction
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

N'hésitez pas à me poser des questions spécifiques sur ce patient !
    `.trim();
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !session) return;

    const userMessage = message.trim();
    setMessage('');

    // Add user message to chat
    setChatHistory(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    try {
      await tavusService.sendMessage(userMessage);
      
      // Simulate agent response with audio
      setTimeout(() => {
        const response = generateAgentResponse(userMessage, patient);
        setChatHistory(prev => [...prev, {
          type: 'agent',
          content: response,
          timestamp: new Date()
        }]);
        
        // Play audio response
        playAudioResponse(response);
      }, 2000);
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
    }
  };

  const playAudioResponse = (text: string) => {
    if ('speechSynthesis' in window && !isMuted) {
      // Clean text for speech synthesis
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
    
    return `Je peux vous fournir des informations sur les allergies, les traitements, les antécédents médicaux, les contacts d'urgence, les diagnostics, ou les données biométriques. Que souhaitez-vous savoir spécifiquement ?`;
  };

  const openTavusInNewWindow = () => {
    if (session?.videoUrl && session.videoUrl !== '#demo-mode') {
      // Open Tavus conversation in a new window with proper dimensions
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
        
        // Check if window is closed
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
                      : 'Mode démonstration avec synthèse vocale'
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
                    <div className={`w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 ${isPlaying ? 'animate-pulse' : ''}`}>
                      <Bot className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Dr. IA Assistant</h3>
                    <p className="text-blue-200 mb-2">
                      Agent médical virtuel {session?.isDemoMode ? 'en mode démonstration' : 'Tavus'}
                    </p>
                    
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
                        <span className="text-sm">Mode démonstration avec synthèse vocale</span>
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
                  <button
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`p-3 rounded-full transition-colors ${
                      isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isAudioEnabled ? (
                      <Mic className="w-5 h-5 text-white" />
                    ) : (
                      <MicOff className="w-5 h-5 text-white" />
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
                  Mode démonstration - Synthèse vocale activée
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
              <div className="flex gap-2">
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
            </div>
          </div>
        </div>

        {/* Hidden audio element for future use */}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};