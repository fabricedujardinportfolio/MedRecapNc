import { supabase } from '../lib/supabase';

interface CreatePixelResponse {
  pixel_id: string;
  x: number;
  y: number;
  color: string;
  created_at: string;
  is_new_session: boolean;
}

class CollaborativeArtService {
  private currentSessionId: string | null = null;
  private currentIpHash: string | null = null;
  private pixelsCache: any[] = [];
  private lastLoadTime: number = 0;

  // Initialize IP hash
  private async initializeIpHash(): Promise<void> {
    this.currentIpHash = await this.hashIP();
  }

  // Hash IP address for privacy
  private async hashIP(): Promise<string> {
    try {
      // Get IP from a service or use a fallback
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const ip = data.ip;
      
      // Create hash
      const encoder = new TextEncoder();
      const data_encoded = encoder.encode(ip);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data_encoded);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Error hashing IP:', error);
      // Fallback hash
      return 'fallback_hash_' + Math.random().toString(36).substring(2, 15);
    }
  }

  // Get pixel by IP hash
  private async getPixelByIpHash(ipHash: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('collaborative_pixels')
        .select('*')
        .eq('session_id', this.currentSessionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error getting pixel by IP hash:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getPixelByIpHash:', error);
      return null;
    }
  }

  // Get current session pixel
  private async getCurrentSessionPixel(): Promise<any> {
    if (!this.currentSessionId) return null;

    try {
      const { data, error } = await supabase
        .from('collaborative_pixels')
        .select('*')
        .eq('session_id', this.currentSessionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error getting current session pixel:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentSessionPixel:', error);
      return null;
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
      console.log('👤 Nom du contributeur à stocker:', contributorName); // 🆕 Log du nom

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

      // 🆕 VALIDATION ET NETTOYAGE DU NOM
      const cleanContributorName = contributorName.trim() || 'Contributeur Anonyme';
      const finalContributorName = cleanContributorName.length > 30 
        ? cleanContributorName.substring(0, 30) 
        : cleanContributorName;

      console.log('✅ Nom final à stocker en BDD:', finalContributorName);

      // Appeler la fonction Supabase avec vérification IP ET nom du contributeur
      const { data, error } = await supabase.rpc('create_pixel_for_session', {
        p_session_id: this.currentSessionId,
        p_color: color,
        p_contributor_name: finalContributorName, // 🆕 Nom nettoyé et validé
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
        console.log('✅ Pixel créé avec succès en BDD avec nom:', result);
        console.log('👤 Nom stocké:', finalContributorName);
        
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

  // Set current session ID
  setCurrentSessionId(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  // Get current session ID
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }
}

// Export singleton instance
export const collaborativeArtService = new CollaborativeArtService();