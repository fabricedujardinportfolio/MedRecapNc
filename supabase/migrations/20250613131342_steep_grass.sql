/*
  # Mise à jour de la fonction create_pixel_for_session pour gérer le nom du contributeur

  1. Fonction mise à jour
    - Prend en compte le paramètre p_contributor_name
    - Stocke le nom dans la table collaborative_pixels
    - Validation et nettoyage du nom côté serveur

  2. Sécurité
    - Validation de la longueur du nom (max 50 caractères)
    - Protection contre les injections
    - Maintien de la protection anti-spam par IP
*/

-- Mise à jour de la fonction pour inclure le nom du contributeur
CREATE OR REPLACE FUNCTION create_pixel_for_session(
  p_session_id TEXT,
  p_color TEXT DEFAULT '#3B82F6',
  p_contributor_name TEXT DEFAULT 'Anonyme',
  p_user_agent TEXT DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL
)
RETURNS TABLE (
  pixel_id UUID,
  x INTEGER,
  y INTEGER,
  color TEXT,
  created_at TIMESTAMPTZ,
  is_new_session BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_uuid UUID;
  v_existing_pixel_id UUID;
  v_new_x INTEGER;
  v_new_y INTEGER;
  v_clean_contributor_name TEXT;
  v_max_attempts INTEGER := 1000;
  v_attempt INTEGER := 0;
BEGIN
  -- Validation et nettoyage du nom du contributeur
  v_clean_contributor_name := TRIM(COALESCE(p_contributor_name, 'Anonyme'));
  
  -- Limiter la longueur du nom
  IF LENGTH(v_clean_contributor_name) > 50 THEN
    v_clean_contributor_name := LEFT(v_clean_contributor_name, 50);
  END IF;
  
  -- Si le nom est vide après nettoyage, utiliser un nom par défaut
  IF LENGTH(v_clean_contributor_name) = 0 THEN
    v_clean_contributor_name := 'Contributeur Anonyme';
  END IF;

  -- Vérifier si cette IP a déjà un pixel (protection anti-spam)
  IF p_ip_hash IS NOT NULL THEN
    SELECT cp.id INTO v_existing_pixel_id
    FROM collaborative_pixels cp
    INNER JOIN pixel_sessions ps ON cp.session_id = ps.id
    WHERE ps.ip_hash = p_ip_hash
    LIMIT 1;
    
    -- Si un pixel existe déjà pour cette IP, le retourner
    IF v_existing_pixel_id IS NOT NULL THEN
      RETURN QUERY
      SELECT 
        cp.id,
        cp.x,
        cp.y,
        cp.color,
        cp.created_at,
        FALSE as is_new_session
      FROM collaborative_pixels cp
      WHERE cp.id = v_existing_pixel_id;
      RETURN;
    END IF;
  END IF;

  -- Vérifier si la session existe déjà
  SELECT id INTO v_session_uuid 
  FROM pixel_sessions 
  WHERE session_id = p_session_id;

  -- Si la session existe, vérifier s'il y a déjà un pixel
  IF v_session_uuid IS NOT NULL THEN
    SELECT id INTO v_existing_pixel_id
    FROM collaborative_pixels 
    WHERE session_id = v_session_uuid;
    
    -- Si un pixel existe déjà pour cette session, le retourner
    IF v_existing_pixel_id IS NOT NULL THEN
      RETURN QUERY
      SELECT 
        cp.id,
        cp.x,
        cp.y,
        cp.color,
        cp.created_at,
        FALSE as is_new_session
      FROM collaborative_pixels cp
      WHERE cp.id = v_existing_pixel_id;
      RETURN;
    END IF;
  ELSE
    -- Créer une nouvelle session
    INSERT INTO pixel_sessions (session_id, user_agent, ip_hash)
    VALUES (p_session_id, p_user_agent, p_ip_hash)
    RETURNING id INTO v_session_uuid;
  END IF;

  -- Générer des coordonnées aléatoires uniques
  LOOP
    v_new_x := FLOOR(RANDOM() * 1200)::INTEGER;
    v_new_y := FLOOR(RANDOM() * 1250)::INTEGER;
    
    -- Vérifier si cette position est libre
    SELECT id INTO v_existing_pixel_id
    FROM collaborative_pixels 
    WHERE x = v_new_x AND y = v_new_y;
    
    -- Si la position est libre, sortir de la boucle
    IF v_existing_pixel_id IS NULL THEN
      EXIT;
    END IF;
    
    -- Incrémenter le compteur de tentatives
    v_attempt := v_attempt + 1;
    
    -- Éviter une boucle infinie
    IF v_attempt >= v_max_attempts THEN
      RAISE EXCEPTION 'Impossible de trouver une position libre après % tentatives', v_max_attempts;
    END IF;
  END LOOP;

  -- Créer le nouveau pixel avec le nom du contributeur
  INSERT INTO collaborative_pixels (x, y, color, session_id, contributor_name)
  VALUES (v_new_x, v_new_y, p_color, v_session_uuid, v_clean_contributor_name)
  RETURNING id INTO v_existing_pixel_id;

  -- Retourner les informations du nouveau pixel
  RETURN QUERY
  SELECT 
    v_existing_pixel_id,
    v_new_x,
    v_new_y,
    p_color,
    NOW(),
    TRUE as is_new_session;
END;
$$;