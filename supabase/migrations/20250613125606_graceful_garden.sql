/*
  # Contrainte pour limiter un pixel par IP utilisateur

  1. Modifications
    - Ajouter une contrainte unique sur ip_hash dans collaborative_pixels
    - Modifier la fonction pour vérifier l'IP avant création
    - Empêcher les doublons par IP même avec des sessions différentes

  2. Sécurité
    - Un utilisateur (IP) = un seul pixel maximum
    - Validation stricte côté base de données
    - Protection contre les tentatives de contournement
*/

-- Supprimer l'ancienne contrainte session si elle existe
ALTER TABLE collaborative_pixels DROP CONSTRAINT IF EXISTS unique_session_pixel;

-- Ajouter une contrainte unique sur ip_hash pour empêcher les doublons par IP
-- Note: On garde aussi session_id unique pour la cohérence
ALTER TABLE collaborative_pixels 
ADD CONSTRAINT unique_ip_pixel UNIQUE (ip_hash);

-- Fonction améliorée pour créer un pixel avec vérification par IP
CREATE OR REPLACE FUNCTION create_pixel_for_session(
  p_session_id text,
  p_color text DEFAULT '#3B82F6',
  p_contributor_name text DEFAULT 'Anonyme',
  p_user_agent text DEFAULT '',
  p_ip_hash text DEFAULT ''
)
RETURNS TABLE(
  pixel_id uuid,
  x integer,
  y integer,
  color text,
  created_at timestamptz,
  is_new_session boolean
) AS $$
DECLARE
  session_uuid uuid;
  free_position record;
  new_pixel_id uuid;
  session_exists boolean;
  ip_has_pixel boolean;
  existing_pixel record;
BEGIN
  -- 🔒 VÉRIFICATION CRITIQUE : Vérifier si cette IP a déjà un pixel
  SELECT EXISTS(
    SELECT 1 FROM collaborative_pixels cp
    JOIN pixel_sessions ps ON cp.session_id = ps.id
    WHERE ps.ip_hash = p_ip_hash
  ) INTO ip_has_pixel;
  
  -- Si cette IP a déjà un pixel, retourner le pixel existant
  IF ip_has_pixel THEN
    SELECT 
      cp.id,
      cp.x,
      cp.y,
      cp.color,
      cp.created_at
    INTO existing_pixel
    FROM collaborative_pixels cp
    JOIN pixel_sessions ps ON cp.session_id = ps.id
    WHERE ps.ip_hash = p_ip_hash
    LIMIT 1;
    
    RETURN QUERY
    SELECT 
      existing_pixel.id,
      existing_pixel.x,
      existing_pixel.y,
      existing_pixel.color,
      existing_pixel.created_at,
      false as is_new_session;
    RETURN;
  END IF;
  
  -- Vérifier si la session existe déjà
  SELECT EXISTS(
    SELECT 1 FROM pixel_sessions WHERE session_id = p_session_id
  ) INTO session_exists;
  
  -- Si la session existe déjà, récupérer son UUID
  IF session_exists THEN
    SELECT ps.id INTO session_uuid
    FROM pixel_sessions ps
    WHERE ps.session_id = p_session_id;
    
    -- Double vérification : cette session a-t-elle déjà un pixel ?
    IF EXISTS(SELECT 1 FROM collaborative_pixels WHERE collaborative_pixels.session_id = session_uuid) THEN
      -- Retourner le pixel existant de cette session
      RETURN QUERY
      SELECT 
        cp.id,
        cp.x,
        cp.y,
        cp.color,
        cp.created_at,
        false as is_new_session
      FROM collaborative_pixels cp
      WHERE cp.session_id = session_uuid;
      RETURN;
    END IF;
  ELSE
    -- Créer une nouvelle session avec l'IP hash
    INSERT INTO pixel_sessions (session_id, user_agent, ip_hash)
    VALUES (p_session_id, p_user_agent, p_ip_hash)
    RETURNING id INTO session_uuid;
  END IF;
  
  -- Obtenir une position libre
  SELECT * INTO free_position FROM get_random_free_position();
  
  -- Créer le nouveau pixel avec gestion d'erreur pour les contraintes uniques
  BEGIN
    INSERT INTO collaborative_pixels (x, y, color, session_id, contributor_name)
    VALUES (free_position.x, free_position.y, p_color, session_uuid, p_contributor_name)
    RETURNING id INTO new_pixel_id;
  EXCEPTION
    WHEN unique_violation THEN
      -- Si violation de contrainte unique, retourner le pixel existant
      IF EXISTS(SELECT 1 FROM collaborative_pixels WHERE collaborative_pixels.session_id = session_uuid) THEN
        RETURN QUERY
        SELECT 
          cp.id,
          cp.x,
          cp.y,
          cp.color,
          cp.created_at,
          false as is_new_session
        FROM collaborative_pixels cp
        WHERE cp.session_id = session_uuid;
      ELSE
        -- Si c'est une violation d'IP, chercher le pixel de cette IP
        RETURN QUERY
        SELECT 
          cp.id,
          cp.x,
          cp.y,
          cp.color,
          cp.created_at,
          false as is_new_session
        FROM collaborative_pixels cp
        JOIN pixel_sessions ps ON cp.session_id = ps.id
        WHERE ps.ip_hash = p_ip_hash
        LIMIT 1;
      END IF;
      RETURN;
  END;
  
  -- Retourner le nouveau pixel
  RETURN QUERY
  SELECT 
    new_pixel_id,
    free_position.x,
    free_position.y,
    p_color,
    now(),
    NOT session_exists as is_new_session;
END;
$$ LANGUAGE plpgsql;