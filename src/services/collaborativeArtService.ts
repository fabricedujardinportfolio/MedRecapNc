import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

  constructor() {
    // Générer un ID de session unique basé sur le navigateur et le timestamp
    this.currentSessionId = this.generateSessionId();
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

  private async hashIP(): Promise<string> {
    try {
      // Obtenir l'IP via un service externe (pour la démo)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      
      // Hasher l'IP pour la confidentialité
      const encoder = new TextEncoder();
      const data_encoded = encoder.encode(data.ip + 'medrecap_salt');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data_encoded);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    } catch (error) {
      console.warn('Impossible d\'obtenir l\'IP, utilisation d\'un hash par défaut');
      return 'default_hash_' + Math.random().toString(36).substring(2);
    }
  }

  // Récupérer les statistiques du projet
  async getProjectStats(): Promise<ArtProjectStats | null> {
    try {
      const { data, error } = await supabase
        .from('art_project_stats')
        .select('*')
        .single();

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur service statistiques:', error);
      return null;
    }
  }

  // Récupérer tous les pixels existants
  async getAllPixels(): Promise<PixelData[]> {
    try {
      const { data, error } = await supabase
        .from('collaborative_pixels')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des pixels:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service pixels:', error);
      return [];
    }
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

  // Créer un pixel pour la session actuelle
  async createPixelForCurrentSession(
    color: string = '#3B82F6',
    contributorName: string = 'Anonyme'
  ): Promise<CreatePixelResponse | null> {
    try {
      const ipHash = await this.hashIP();
      const userAgent = navigator.userAgent;

      console.log('🎨 Création d\'un pixel pour la session:', this.currentSessionId);

      const { data, error } = await supabase.rpc('create_pixel_for_session', {
        p_session_id: this.currentSessionId,
        p_color: color,
        p_contributor_name: contributorName,
        p_user_agent: userAgent,
        p_ip_hash: ipHash
      });

      if (error) {
        console.error('Erreur lors de la création du pixel:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0];
        console.log('✅ Pixel créé avec succès:', result);
        return result;
      }

      return null;
    } catch (error) {
      console.error('Erreur service création pixel:', error);
      return null;
    }
  }

  // Vérifier si la session actuelle a déjà un pixel
  async getCurrentSessionPixel(): Promise<PixelData | null> {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('pixel_sessions')
        .select('id')
        .eq('session_id', this.currentSessionId)
        .maybeSingle();

      if (sessionError || !sessionData) {
        return null;
      }

      const { data: pixelData, error: pixelError } = await supabase
        .from('collaborative_pixels')
        .select('*')
        .eq('session_id', sessionData.id)
        .maybeSingle();

      if (pixelError || !pixelData) {
        return null;
      }

      return pixelData;
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

  // Obtenir les statistiques détaillées
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
      const stats = await this.getProjectStats();
      if (!stats) return null;

      // Calculer les pixels de cette semaine
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: weeklyPixels, error: weeklyError } = await supabase
        .from('collaborative_pixels')
        .select('id')
        .gte('created_at', oneWeekAgo.toISOString());

      if (weeklyError) {
        console.error('Erreur pixels hebdomadaires:', weeklyError);
      }

      const pixelsThisWeek = weeklyPixels?.length || 0;
      const averagePixelsPerDay = pixelsThisWeek / 7;
      const remainingPixels = stats.total_pixels - stats.completed_pixels;
      const estimatedDaysRemaining = averagePixelsPerDay > 0 
        ? Math.ceil(remainingPixels / averagePixelsPerDay) 
        : 999999;

      return {
        totalPixels: stats.total_pixels,
        completedPixels: stats.completed_pixels,
        percentage: stats.percentage,
        sessionsToday: stats.sessions_today,
        pixelsThisWeek,
        averagePixelsPerDay: Math.round(averagePixelsPerDay * 100) / 100,
        estimatedDaysRemaining
      };
    } catch (error) {
      console.error('Erreur service statistiques détaillées:', error);
      return null;
    }
  }

  // Écouter les changements en temps réel
  subscribeToPixelUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('collaborative_pixels_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaborative_pixels'
        },
        callback
      )
      .subscribe();
  }

  // Écouter les changements de statistiques
  subscribeToStatsUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('art_project_stats_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'art_project_stats'
        },
        callback
      )
      .subscribe();
  }

  // Obtenir l'ID de session actuel
  getCurrentSessionId(): string {
    return this.currentSessionId;
  }

  // Régénérer l'ID de session (pour forcer une nouvelle session)
  regenerateSessionId(): string {
    this.currentSessionId = this.generateSessionId();
    return this.currentSessionId;
  }
}

export const collaborativeArtService = CollaborativeArtService.getInstance();