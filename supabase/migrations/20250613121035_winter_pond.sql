/*
  # Contrainte pour limiter une session à un seul pixel

  1. Modifications
    - Ajouter une contrainte unique sur session_id dans collaborative_pixels
    - Modifier la fonction create_pixel_for_session pour une vérification stricte
    - Ajouter des index pour optimiser les performances

  2. Sécurité
    - Garantir qu'une session ne peut créer qu'un seul pixel
    - Validation stricte côté base de données
*/

-- Supprimer la contrainte existante si elle existe
ALTER TABLE collaborative_pixels DROP CONSTRAINT IF EXISTS unique_session_pixel;

-- Ajouter une contrainte unique pour s'assurer qu'une session ne peut avoir qu'un seul pixel
ALTER TABLE collaborative_pixels 
ADD CONSTRAINT unique_session_pixel UNIQUE (session_id);

-- Fonction améliorée pour créer un pixel avec vérification stricte
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
  pixel_exists boolean;
BEGIN
  -- Vérifier si la session existe déjà
  SELECT EXISTS(
    SELECT 1 FROM pixel_sessions WHERE session_id = p_session_id
  ) INTO session_exists;
  
  -- Si la session existe déjà, vérifier si elle a déjà un pixel
  IF session_exists THEN
    SELECT ps.id INTO session_uuid
    FROM pixel_sessions ps
    WHERE ps.session_id = p_session_id;
    
    -- VÉRIFICATION STRICTE : Une session ne peut avoir qu'un seul pixel
    SELECT EXISTS(
      SELECT 1 FROM collaborative_pixels WHERE collaborative_pixels.session_id = session_uuid
    ) INTO pixel_exists;
    
    IF pixel_exists THEN
      -- Retourner le pixel existant
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
    -- Créer une nouvelle session
    INSERT INTO pixel_sessions (session_id, user_agent, ip_hash)
    VALUES (p_session_id, p_user_agent, p_ip_hash)
    RETURNING id INTO session_uuid;
  END IF;
  
  -- Obtenir une position libre
  SELECT * INTO free_position FROM get_random_free_position();
  
  -- Créer le nouveau pixel avec gestion d'erreur pour la contrainte unique
  BEGIN
    INSERT INTO collaborative_pixels (x, y, color, session_id, contributor_name)
    VALUES (free_position.x, free_position.y, p_color, session_uuid, p_contributor_name)
    RETURNING id INTO new_pixel_id;
  EXCEPTION
    WHEN unique_violation THEN
      -- Si violation de contrainte unique (session_id), retourner le pixel existant
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