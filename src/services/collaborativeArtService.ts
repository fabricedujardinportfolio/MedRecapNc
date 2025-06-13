import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add validation to prevent runtime errors
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  throw new Error('Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface PixelData {
  id: string;
  x: number;
  y: number;
  color: string;
  session_id: string;
  contributor_name?: string;
  created_at: string;
}

export interface PixelSession {
  id: string;
  session_id: string;
  user_agent?: string;
  ip_hash?: string;
  created_at: string;
}

export interface ArtProjectStats {
  id: string;
  total_pixels: number;
  completed_pixels: number;
  percentage: number;
  sessions_today: number;
  estimated_completion?: string;
  last_updated: string;
}

export interface CreatePixelResponse {
  pixel_id: string;
  x: number;
  y: number;
  color: string;
  created_at: string;
  is_new_session: boolean;
}

class CollaborativeArtService {
  private static instance: CollaborativeArtService;
  private currentSessionId: string;
  private currentIpHash: string | null = null;
  private pixelChannel: any = null;
  private statsChannel: any = null;
  private isPixelChannelSubscribed: boolean = false;
  private isStatsChannelSubscribed: boolean = false;
  private pixelsCache: PixelData[] = [];
  private lastLoadTime: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 secondes

  constructor() {
    // Générer un ID de session unique basé sur le navigateur et le timestamp
    this.currentSessionId = this.generateSessionId();
    // Initialiser le hash IP
    this.initializeIpHash();
  }

  static getInstance(): CollaborativeArtService {
    if (!CollaborativeArtService.instance) {
      CollaborativeArtService.instance = new CollaborativeArtService();
    }
    return CollaborativeArtService.instance;
  }

  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const userAgent = navigator.userAgent.slice(0, 50);
    return `session_${timestamp}_${random}_${btoa(userAgent).slice(0, 10)}`;
  }

  // 🔒 NOUVELLE MÉTHODE : Initialiser et stocker le hash IP
  private async initializeIpHash(): Promise<void> {
    try {
      this.currentIpHash = await this.hashIP();
      console.log('🔒 IP Hash initialisé:', this.currentIpHash?.substring(0, 8) + '...');
    } catch (error) {
      console.warn('⚠️ Impossible d\'initialiser le hash IP:', error);
      this.currentIpHash = 'fallback_' + Math.random().toString(36).substring(2);
    }
  }

  // 🔒 MÉTHODE AMÉLIORÉE : Hash IP avec cache
  private async hashIP(): Promise<string> {
    // Si déjà calculé, retourner le cache
    if (this.currentIpHash) {
      return this.currentIpHash;
    }

    try {
      // Obtenir l'IP via un service externe (pour la démo)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      
      // Hasher l'IP pour la confidentialité
      const encoder = new TextEncoder();
      const data_encoded = encoder.encode(data.ip + 'medrecap_salt_2025');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data_encoded);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
      
      console.log('🔒 IP hashée avec succès:', hash.substring(0, 8) + '...');
      return hash;
    } catch (error) {
      console.warn('⚠️ Impossible d\'obtenir l\'IP, utilisation d\'un hash par défaut');
      const fallbackHash = 'fallback_' + Math.random().toString(36).substring(2) + '_' + Date.now().toString(36);
      return fallbackHash.slice(0, 16);
    }
  }

  // 📊 MÉTHODE CORRIGÉE : Récupérer les statistiques avec calcul en temps réel
  async getProjectStats(): Promise<ArtProjectStats | null> {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        console.log(`🔄 Tentative ${retries + 1}/${maxRetries} - Récupération des statistiques`);
        
        // 🔧 CALCUL EN TEMPS RÉEL : Compter les pixels actuels
        const { count: actualPixelCount, error: countError } = await supabase
          .from('collaborative_pixels')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('Erreur lors du comptage des pixels:', countError);
          if (retries === maxRetries - 1) return null;
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }

        const realPixelCount = actualPixelCount || 0;
        console.log('🎨 Nombre réel de pixels dans la base:', realPixelCount);

        // Récupérer les stats de la table (pour les sessions aujourd'hui)
        const { data: statsData, error: statsError } = await supabase
          .from('art_project_stats')
          .select('*')
          .single();

        if (statsError) {
          console.error('Erreur lors de la récupération des statistiques:', statsError);
          // Créer des stats par défaut si la table est vide
          const defaultStats: ArtProjectStats = {
            id: 'default',
            total_pixels: 1500000,
            completed_pixels: realPixelCount,
            percentage: (realPixelCount / 1500000) * 100,
            sessions_today: 0,
            last_updated: new Date().toISOString()
          };
          console.log('📊 Utilisation des statistiques par défaut:', defaultStats);
          return defaultStats;
        }

        // 🔧 MISE À JOUR : Utiliser le compte réel au lieu de celui en base
        const updatedStats: ArtProjectStats = {
          ...statsData,
          completed_pixels: realPixelCount,
          percentage: (realPixelCount / statsData.total_pixels) * 100
        };

        console.log('✅ Statistiques récupérées et mises à jour:', {
          total: updatedStats.total_pixels,
          completed: updatedStats.completed_pixels,
          percentage: updatedStats.percentage.toFixed(2) + '%',
          sessionsToday: updatedStats.sessions_today
        });

        return updatedStats;
      } catch (error) {
        console.error(`❌ Erreur service statistiques (tentative ${retries + 1}):`, error);
        if (retries === maxRetries - 1) return null;
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }

    return null;
  }

  // Récupérer tous les pixels existants avec cache et retry - CORRIGÉ
  async getAllPixels(forceRefresh: boolean = false): Promise<PixelData[]> {
    const now = Date.now();
    
    // Utiliser le cache si disponible et récent (sauf si forceRefresh)
    if (!forceRefresh && this.pixelsCache.length > 0 && (now - this.lastLoadTime) < this.CACHE_DURATION) {
      console.log('📦 Utilisation du cache pixels:', this.pixelsCache.length, 'pixels');
      return this.pixelsCache;
    }

    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        console.log(`🔄 Tentative ${retries + 1}/${maxRetries} - Chargement de tous les pixels`);
        
        // Utiliser un timeout pour éviter les requêtes qui traînent
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 15000) // Augmenté à 15 secondes
        );
        
        const queryPromise = supabase
          .from('collaborative_pixels')
          .select('*')
          .order('created_at', { ascending: true });

        const result = await Promise.race([queryPromise, timeoutPromise]);
        const { data, error } = result as any;

        if (error) {
          console.error('Erreur lors de la récupération des pixels:', error);
          if (retries === maxRetries - 1) {
            // En cas d'échec final, retourner le cache s'il existe
            console.log('🔄 Retour au cache après échec:', this.pixelsCache.length, 'pixels');
            return this.pixelsCache;
          }
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }

        const pixels = data || [];
        console.log('✅ Pixels récupérés avec succès:', pixels.length, 'pixels');
        console.log('🎨 Premiers pixels:', pixels.slice(0, 3));
        
        // Valider les données des pixels
        const validPixels = pixels.filter((pixel: any) => {
          return pixel && 
                 typeof pixel.x === 'number' && 
                 typeof pixel.y === 'number' && 
                 typeof pixel.color === 'string' &&
                 pixel.color.match(/^#[0-9A-Fa-f]{6}$/);
        });

        console.log('✅ Pixels valides:', validPixels.length, '/', pixels.length);
        
        // Mettre à jour le cache seulement si on a des données valides
        if (Array.isArray(validPixels)) {
          this.pixelsCache = validPixels;
          this.lastLoadTime = now;
        }
        
        return validPixels;
      } catch (error) {
        console.error(`❌ Erreur service pixels (tentative ${retries + 1}):`, error);
        if (retries === maxRetries - 1) {
          // En cas d'échec final, retourner le cache s'il existe
          console.log('🔄 Retour au cache après erreur:', this.pixelsCache.length, 'pixels');
          return this.pixelsCache;
        }
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }

    return this.pixelsCache;
  }

  // Récupérer les pixels dans une zone spécifique (pour optimisation)
  async getPixelsInRegion(startX: number, startY: number, width: number, height: number): Promise<PixelData[]> {
    try {
      const { data, error } = await supabase
        .from('collaborative_pixels')
        .select('*')
        .gte('x', startX)
        .lt('x', startX + width)
        .gte('y', startY)
        .lt('y', startY + height);

      if (error) {
        console.error('Erreur lors de la récupération des pixels par région:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service pixels région:', error);
      return [];
    }
  }

  // 🔒 MÉTHODE CORRIGÉE : Créer un pixel avec vérification IP stricte
  async createPixelForCurrentSession(
    color: string = '#3B82F6',
    contributorName: string = 'Anonyme'
  ): Promise<CreatePixelResponse | null> {
    try {
      // S'assurer que l'IP hash est initialisé
      if (!this.currentIpHash) {
        console.log('🔒 Initialisation du hash IP...');
        await this.initializeIpHash();
      }

      const ipHash = this.currentIpHash || await this.hashIP();
      const userAgent = navigator.userAgent;

      console.log('🎨 Création d\'un pixel pour la session:', this.currentSessionId);
      console.log('🔒 Vérification IP hash:', ipHash?.substring(0, 8) + '...');

      // 🔒 VÉRIFICATION STRICTE : Cette IP a-t-elle déjà un pixel ?
      const existingPixelByIp = await this.getPixelByIpHash(ipHash);
      if (existingPixelByIp) {
        console.log('🚫 Cette IP a déjà un pixel, retour du pixel existant');
        return {
          pixel_id: existingPixelByIp.id,
          x: existingPixelByIp.x,
          y: existingPixelByIp.y,
          color: existingPixelByIp.color,
          created_at: existingPixelByIp.created_at,
          is_new_session: false
        };
      }

      // Vérification supplémentaire par session
      const existingPixelBySession = await this.getCurrentSessionPixel();
      if (existingPixelBySession) {
        console.log('⚠️ Cette session a déjà un pixel, retour du pixel existant');
        return {
          pixel_id: existingPixelBySession.id,
          x: existingPixelBySession.x,
          y: existingPixelBySession.y,
          color: existingPixelBySession.color,
          created_at: existingPixelBySession.created_at,
          is_new_session: false
        };
      }

      // Appeler la fonction Supabase avec vérification IP
      const { data, error } = await supabase.rpc('create_pixel_for_session', {
        p_session_id: this.currentSessionId,
        p_color: color,
        p_contributor_name: contributorName,
        p_user_agent: userAgent,
        p_ip_hash: ipHash
      });

      if (error) {
        console.error('❌ Erreur lors de la création du pixel:', error);
        
        // Si l'erreur indique qu'un pixel existe déjà pour cette IP
        if (error.message?.includes('unique') || error.code === '23505') {
          console.log('🔒 Pixel déjà existant pour cette IP, récupération...');
          const existingPixel = await this.getPixelByIpHash(ipHash);
          if (existingPixel) {
            return {
              pixel_id: existingPixel.id,
              x: existingPixel.x,
              y: existingPixel.y,
              color: existingPixel.color,
              created_at: existingPixel.created_at,
              is_new_session: false
            };
          }
        }
        
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0];
        console.log('✅ Pixel créé avec succès:', result);
        
        // Invalider le cache pour forcer un rechargement
        this.lastLoadTime = 0;
        this.pixelsCache = [];
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur service création pixel:', error);
      return null;
    }
  }

  // 🔒 NOUVELLE MÉTHODE : Récupérer un pixel par IP hash
  private async getPixelByIpHash(ipHash: string): Promise<PixelData | null> {
    try {
      console.log('🔍 Recherche de pixel pour IP hash:', ipHash?.substring(0, 8) + '...');
      
      const { data, error } = await supabase
        .from('collaborative_pixels')
        .select(`
          *,
          pixel_sessions!inner(ip_hash)
        `)
        .eq('pixel_sessions.ip_hash', ipHash)
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur lors de la recherche par IP:', error);
        return null;
      }

      if (data) {
        console.log('🎨 Pixel trouvé pour cette IP:', data);
        return data;
      } else {
        console.log('📝 Aucun pixel trouvé pour cette IP');
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du pixel par IP:', error);
      return null;
    }
  }

  // Vérifier si la session actuelle a déjà un pixel - AMÉLIORÉ
  async getCurrentSessionPixel(): Promise<PixelData | null> {
    try {
      console.log('🔍 Vérification du pixel pour la session:', this.currentSessionId);
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('pixel_sessions')
        .select('id')
        .eq('session_id', this.currentSessionId)
        .maybeSingle();

      if (sessionError) {
        console.error('Erreur lors de la vérification de session:', sessionError);
        return null;
      }

      if (!sessionData) {
        console.log('📝 Aucune session trouvée pour:', this.currentSessionId);
        return null;
      }

      console.log('✅ Session trouvée:', sessionData.id);

      const { data: pixelData, error: pixelError } = await supabase
        .from('collaborative_pixels')
        .select('*')
        .eq('session_id', sessionData.id)
        .maybeSingle();

      if (pixelError) {
        console.error('Erreur lors de la vérification du pixel:', pixelError);
        return null;
      }

      if (pixelData) {
        console.log('🎨 Pixel existant trouvé pour cette session:', pixelData);
        return pixelData;
      } else {
        console.log('📝 Aucun pixel trouvé pour cette session');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du pixel de session:', error);
      return null;
    }
  }

  // Obtenir les contributeurs récents
  async getRecentContributors(limit: number = 10): Promise<Array<{
    contributor_name: string;
    created_at: string;
    color: string;
  }>> {
    try {
      const { data, error } = await supabase
        .from('collaborative_pixels')
        .select('contributor_name, created_at, color')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération des contributeurs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service contributeurs:', error);
      return [];
    }
  }

  // 📊 MÉTHODE AMÉLIORÉE : Obtenir les statistiques détaillées avec calculs en temps réel
  async getDetailedStats(): Promise<{
    totalPixels: number;
    completedPixels: number;
    percentage: number;
    sessionsToday: number;
    pixelsThisWeek: number;
    averagePixelsPerDay: number;
    estimatedDaysRemaining: number;
  } | null> {
    try {
      console.log('📊 Calcul des statistiques détaillées en temps réel...');

      // 🔧 CALCUL EN TEMPS RÉEL : Compter les pixels actuels
      const { count: actualPixelCount, error: countError } = await supabase
        .from('collaborative_pixels')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Erreur lors du comptage des pixels:', countError);
        return null;
      }

      const realPixelCount = actualPixelCount || 0;
      const totalPixels = 1500000; // 1200 × 1250
      const percentage = (realPixelCount / totalPixels) * 100;

      console.log('🎨 Pixels actuels:', realPixelCount, '/', totalPixels, `(${percentage.toFixed(4)}%)`);

      // Calculer les pixels d'aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: todayPixelCount, error: todayError } = await supabase
        .from('collaborative_pixels')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      if (todayError) {
        console.error('Erreur pixels aujourd\'hui:', todayError);
      }

      const pixelsToday = todayPixelCount || 0;

      // Calculer les pixels de cette semaine
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { count: weeklyPixelCount, error: weeklyError } = await supabase
        .from('collaborative_pixels')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      if (weeklyError) {
        console.error('Erreur pixels hebdomadaires:', weeklyError);
      }

      const pixelsThisWeek = weeklyPixelCount || 0;
      const averagePixelsPerDay = pixelsThisWeek / 7;
      const remainingPixels = totalPixels - realPixelCount;
      const estimatedDaysRemaining = averagePixelsPerDay > 0 
        ? Math.ceil(remainingPixels / averagePixelsPerDay) 
        : 999999;

      const detailedStats = {
        totalPixels,
        completedPixels: realPixelCount,
        percentage,
        sessionsToday: pixelsToday, // Utiliser les pixels d'aujourd'hui comme proxy pour les sessions
        pixelsThisWeek,
        averagePixelsPerDay: Math.round(averagePixelsPerDay * 100) / 100,
        estimatedDaysRemaining
      };

      console.log('📊 Statistiques détaillées calculées:', {
        ...detailedStats,
        percentage: detailedStats.percentage.toFixed(4) + '%'
      });

      return detailedStats;
    } catch (error) {
      console.error('Erreur service statistiques détaillées:', error);
      return null;
    }
  }

  // Écouter les changements en temps réel - CORRIGÉ pour éviter les souscriptions multiples
  subscribeToPixelUpdates(callback: (payload: any) => void) {
    // Si le channel existe déjà et est souscrit, on retourne le channel existant
    if (this.pixelChannel && this.isPixelChannelSubscribed) {
      console.log('🔄 Channel pixels déjà souscrit, réutilisation');
      return this.pixelChannel;
    }

    // Nettoyer l'ancien channel s'il existe
    if (this.pixelChannel) {
      console.log('🧹 Nettoyage de l\'ancien channel pixels');
      this.pixelChannel.unsubscribe();
      this.pixelChannel = null;
      this.isPixelChannelSubscribed = false;
    }

    console.log('🆕 Création d\'un nouveau channel pixels');
    
    this.pixelChannel = supabase
      .channel('collaborative_pixels_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaborative_pixels'
        },
        (payload) => {
          console.log('🎨 Nouveau pixel reçu via realtime:', payload);
          // Invalider le cache quand un nouveau pixel arrive
          this.lastLoadTime = 0;
          callback(payload);
        }
      );

    // Marquer comme souscrit avant d'appeler subscribe
    this.isPixelChannelSubscribed = true;
    
    // S'abonner au channel
    this.pixelChannel.subscribe((status: string) => {
      console.log('📡 Statut souscription pixels:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Souscription pixels réussie');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erreur de souscription pixels');
        this.isPixelChannelSubscribed = false;
      } else if (status === 'TIMED_OUT') {
        console.error('⏰ Timeout de souscription pixels');
        this.isPixelChannelSubscribed = false;
      } else if (status === 'CLOSED') {
        console.log('🔒 Channel pixels fermé');
        this.isPixelChannelSubscribed = false;
      }
    });

    return this.pixelChannel;
  }

  // Écouter les changements de statistiques - CORRIGÉ pour éviter les souscriptions multiples
  subscribeToStatsUpdates(callback: (payload: any) => void) {
    // Si le channel existe déjà et est souscrit, on retourne le channel existant
    if (this.statsChannel && this.isStatsChannelSubscribed) {
      console.log('🔄 Channel stats déjà souscrit, réutilisation');
      return this.statsChannel;
    }

    // Nettoyer l'ancien channel s'il existe
    if (this.statsChannel) {
      console.log('🧹 Nettoyage de l\'ancien channel stats');
      this.statsChannel.unsubscribe();
      this.statsChannel = null;
      this.isStatsChannelSubscribed = false;
    }

    console.log('🆕 Création d\'un nouveau channel stats');
    
    this.statsChannel = supabase
      .channel('art_project_stats_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'art_project_stats'
        },
        callback
      );

    // Marquer comme souscrit avant d'appeler subscribe
    this.isStatsChannelSubscribed = true;
    
    // S'abonner au channel
    this.statsChannel.subscribe((status: string) => {
      console.log('📊 Statut souscription stats:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Souscription stats réussie');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erreur de souscription stats');
        this.isStatsChannelSubscribed = false;
      } else if (status === 'TIMED_OUT') {
        console.error('⏰ Timeout de souscription stats');
        this.isStatsChannelSubscribed = false;
      } else if (status === 'CLOSED') {
        console.log('🔒 Channel stats fermé');
        this.isStatsChannelSubscribed = false;
      }
    });

    return this.statsChannel;
  }

  // Méthode pour nettoyer toutes les souscriptions
  unsubscribeAll() {
    console.log('🧹 Nettoyage de toutes les souscriptions');
    
    if (this.pixelChannel) {
      this.pixelChannel.unsubscribe();
      this.pixelChannel = null;
      this.isPixelChannelSubscribed = false;
    }
    
    if (this.statsChannel) {
      this.statsChannel.unsubscribe();
      this.statsChannel = null;
      this.isStatsChannelSubscribed = false;
    }
  }

  // Méthode pour forcer le rechargement des données - AMÉLIORÉE
  async forceRefresh(): Promise<void> {
    console.log('🔄 Rechargement forcé des données');
    this.lastLoadTime = 0;
    this.pixelsCache = [];
    
    // Attendre un peu pour s'assurer que le cache est vidé
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Recharger les pixels
    await this.getAllPixels(true);
  }

  // Obtenir l'ID de session actuel
  getCurrentSessionId(): string {
    return this.currentSessionId;
  }

  // 🔒 NOUVELLE MÉTHODE : Obtenir le hash IP actuel
  getCurrentIpHash(): string | null {
    return this.currentIpHash;
  }

  // Régénérer l'ID de session (pour forcer une nouvelle session)
  regenerateSessionId(): string {
    this.currentSessionId = this.generateSessionId();
    return this.currentSessionId;
  }
}

export const collaborativeArtService = CollaborativeArtService.getInstance();