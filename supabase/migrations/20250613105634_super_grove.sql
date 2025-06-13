/*
  # Système d'Art Collaboratif - 1,5 Million de Pixels

  1. Nouvelles Tables
    - `pixel_sessions`
      - `id` (uuid, primary key)
      - `session_id` (text, unique) - Identifiant unique de session
      - `user_agent` (text) - Information navigateur
      - `ip_hash` (text) - Hash de l'IP pour éviter les doublons
      - `created_at` (timestamp)
      
    - `collaborative_pixels`
      - `id` (uuid, primary key)
      - `x` (integer) - Position X (0-1199)
      - `y` (integer) - Position Y (0-1249)
      - `color` (text) - Couleur hexadécimale
      - `session_id` (uuid, foreign key)
      - `contributor_name` (text, optional)
      - `created_at` (timestamp)
      
    - `art_project_stats`
      - `id` (uuid, primary key)
      - `total_pixels` (integer) - 1,500,000
      - `completed_pixels` (integer)
      - `percentage` (decimal)
      - `sessions_today` (integer)
      - `last_updated` (timestamp)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques pour lecture publique
    - Politiques pour création avec validation
    
  3. Fonctionnalités
    - Une session = un pixel maximum
    - Positions uniques (pas de doublons)
    - Statistiques en temps réel
    - Historique complet des contributions
*/

-- Table des sessions utilisateur
CREATE TABLE IF NOT EXISTS pixel_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_agent text,
  ip_hash text,
  created_at timestamptz DEFAULT now()
);

-- Table des pixels générés
CREATE TABLE IF NOT EXISTS collaborative_pixels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  x integer NOT NULL CHECK (x >= 0 AND x < 1200),
  y integer NOT NULL CHECK (y >= 0 AND y < 1250),
  color text NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  session_id uuid REFERENCES pixel_sessions(id) ON DELETE CASCADE,
  contributor_name text DEFAULT 'Anonyme',
  created_at timestamptz DEFAULT now(),
  UNIQUE(x, y) -- Chaque position ne peut avoir qu'un seul pixel
);

-- Table des statistiques du projet
CREATE TABLE IF NOT EXISTS art_project_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_pixels integer DEFAULT 1500000,
  completed_pixels integer DEFAULT 0,
  percentage decimal DEFAULT 0.0,
  sessions_today integer DEFAULT 0,
  estimated_completion date,
  last_updated timestamptz DEFAULT now()
);

-- Insérer les statistiques initiales
INSERT INTO art_project_stats (total_pixels, completed_pixels, percentage, sessions_today, estimated_completion)
VALUES (1500000, 0, 0.0, 0, '2027-08-15')
ON CONFLICT DO NOTHING;

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_collaborative_pixels_position ON collaborative_pixels(x, y);
CREATE INDEX IF NOT EXISTS idx_collaborative_pixels_session ON collaborative_pixels(session_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_pixels_created_at ON collaborative_pixels(created_at);
CREATE INDEX IF NOT EXISTS idx_pixel_sessions_session_id ON pixel_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_pixel_sessions_ip_hash ON pixel_sessions(ip_hash);

-- Enable Row Level Security
ALTER TABLE pixel_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_pixels ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_project_stats ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour lecture publique
CREATE POLICY "Lecture publique des pixels"
  ON collaborative_pixels
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Lecture publique des statistiques"
  ON art_project_stats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Lecture publique des sessions"
  ON pixel_sessions
  FOR SELECT
  TO public
  USING (true);

-- Politiques pour création de nouvelles données
CREATE POLICY "Création de nouvelles sessions"
  ON pixel_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Création de nouveaux pixels"
  ON collaborative_pixels
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Mise à jour des statistiques"
  ON art_project_stats
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Fonction pour mettre à jour automatiquement les statistiques
CREATE OR REPLACE FUNCTION update_art_project_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE art_project_stats 
  SET 
    completed_pixels = (SELECT COUNT(*) FROM collaborative_pixels),
    percentage = (SELECT COUNT(*) FROM collaborative_pixels) * 100.0 / total_pixels,
    sessions_today = (
      SELECT COUNT(*) 
      FROM pixel_sessions 
      WHERE DATE(created_at) = CURRENT_DATE
    ),
    last_updated = now()
  WHERE id = (SELECT id FROM art_project_stats LIMIT 1);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mise à jour automatique des stats
DROP TRIGGER IF EXISTS trigger_update_stats_on_pixel_insert ON collaborative_pixels;
CREATE TRIGGER trigger_update_stats_on_pixel_insert
  AFTER INSERT ON collaborative_pixels
  FOR EACH ROW
  EXECUTE FUNCTION update_art_project_stats();

DROP TRIGGER IF EXISTS trigger_update_stats_on_session_insert ON pixel_sessions;
CREATE TRIGGER trigger_update_stats_on_session_insert
  AFTER INSERT ON pixel_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_art_project_stats();

-- Fonction pour obtenir une position libre aléatoire
CREATE OR REPLACE FUNCTION get_random_free_position()
RETURNS TABLE(x integer, y integer) AS $$
DECLARE
  max_attempts integer := 100;
  attempt integer := 0;
  random_x integer;
  random_y integer;
  position_taken boolean;
BEGIN
  LOOP
    -- Générer une position aléatoire
    random_x := floor(random() * 1200)::integer;
    random_y := floor(random() * 1250)::integer;
    
    -- Vérifier si la position est libre
    SELECT EXISTS(
      SELECT 1 FROM collaborative_pixels 
      WHERE collaborative_pixels.x = random_x AND collaborative_pixels.y = random_y
    ) INTO position_taken;
    
    -- Si la position est libre, la retourner
    IF NOT position_taken THEN
      RETURN QUERY SELECT random_x, random_y;
      RETURN;
    END IF;
    
    -- Incrémenter le compteur d'essais
    attempt := attempt + 1;
    
    -- Si trop d'essais, retourner une position même si occupée
    IF attempt >= max_attempts THEN
      RETURN QUERY SELECT random_x, random_y;
      RETURN;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer un pixel pour une session
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
    
    -- Vérifier si cette session a déjà généré un pixel
    IF EXISTS(SELECT 1 FROM collaborative_pixels WHERE collaborative_pixels.session_id = session_uuid) THEN
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
  
  -- Créer le nouveau pixel
  INSERT INTO collaborative_pixels (x, y, color, session_id, contributor_name)
  VALUES (free_position.x, free_position.y, p_color, session_uuid, p_contributor_name)
  RETURNING id INTO new_pixel_id;
  
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