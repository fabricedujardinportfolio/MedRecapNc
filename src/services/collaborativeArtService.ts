// Mise à jour du service pour s'assurer que le nom est bien stocké en BDD
  
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