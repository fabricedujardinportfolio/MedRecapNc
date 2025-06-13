/*
  # Create pixel for session RPC function

  1. New Functions
    - `create_pixel_for_session` - Creates a pixel for a session with IP-based deduplication
      - Parameters: session_id, color, contributor_name, user_agent, ip_hash
      - Returns: pixel data with creation status
      - Handles both new sessions and existing session checks

  2. Security
    - Function is accessible to public (anon) users
    - Implements IP-based anti-spam protection
    - Uses proper table aliases to avoid column ambiguity

  3. Logic
    - First checks if IP already has a pixel (anti-spam)
    - Creates session if it doesn't exist
    - Generates random coordinates for new pixels
    - Returns pixel data with is_new_session flag
*/

-- Drop function if it exists to recreate it properly
DROP FUNCTION IF EXISTS create_pixel_for_session(text, text, text, text, text);

-- Create the RPC function with proper column qualification
CREATE OR REPLACE FUNCTION create_pixel_for_session(
  p_session_id text,
  p_color text DEFAULT '#3B82F6',
  p_contributor_name text DEFAULT 'Anonyme',
  p_user_agent text DEFAULT NULL,
  p_ip_hash text DEFAULT NULL
)
RETURNS TABLE (
  pixel_id uuid,
  x integer,
  y integer,
  color text,
  created_at timestamptz,
  is_new_session boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_uuid uuid;
  v_existing_pixel_id uuid;
  v_new_x integer;
  v_new_y integer;
  v_max_attempts integer := 100;
  v_attempt_count integer := 0;
  v_is_new_session boolean := false;
BEGIN
  -- Check if this IP already has a pixel (anti-spam protection)
  IF p_ip_hash IS NOT NULL THEN
    SELECT cp.id INTO v_existing_pixel_id
    FROM collaborative_pixels cp
    INNER JOIN pixel_sessions ps ON cp.session_id = ps.id
    WHERE ps.ip_hash = p_ip_hash
    LIMIT 1;
    
    -- If IP already has a pixel, return the existing one
    IF v_existing_pixel_id IS NOT NULL THEN
      RETURN QUERY
      SELECT 
        cp.id as pixel_id,
        cp.x,
        cp.y,
        cp.color,
        cp.created_at,
        false as is_new_session
      FROM collaborative_pixels cp
      WHERE cp.id = v_existing_pixel_id;
      RETURN;
    END IF;
  END IF;

  -- Check if session already exists
  SELECT ps.id INTO v_session_uuid
  FROM pixel_sessions ps
  WHERE ps.session_id = p_session_id;

  -- If session doesn't exist, create it
  IF v_session_uuid IS NULL THEN
    INSERT INTO pixel_sessions (session_id, user_agent, ip_hash)
    VALUES (p_session_id, p_user_agent, p_ip_hash)
    RETURNING id INTO v_session_uuid;
    
    v_is_new_session := true;
  ELSE
    -- Check if this session already has a pixel
    SELECT cp.id INTO v_existing_pixel_id
    FROM collaborative_pixels cp
    WHERE cp.session_id = v_session_uuid
    LIMIT 1;
    
    -- If session already has a pixel, return it
    IF v_existing_pixel_id IS NOT NULL THEN
      RETURN QUERY
      SELECT 
        cp.id as pixel_id,
        cp.x,
        cp.y,
        cp.color,
        cp.created_at,
        false as is_new_session
      FROM collaborative_pixels cp
      WHERE cp.id = v_existing_pixel_id;
      RETURN;
    END IF;
  END IF;

  -- Generate random coordinates that don't conflict with existing pixels
  LOOP
    v_new_x := floor(random() * 1200)::integer;
    v_new_y := floor(random() * 1250)::integer;
    
    -- Check if this position is already taken
    SELECT cp.id INTO v_existing_pixel_id
    FROM collaborative_pixels cp
    WHERE cp.x = v_new_x AND cp.y = v_new_y;
    
    -- If position is free, break the loop
    IF v_existing_pixel_id IS NULL THEN
      EXIT;
    END IF;
    
    -- Increment attempt counter and check max attempts
    v_attempt_count := v_attempt_count + 1;
    IF v_attempt_count >= v_max_attempts THEN
      RAISE EXCEPTION 'Unable to find free position after % attempts', v_max_attempts;
    END IF;
  END LOOP;

  -- Create the pixel with explicit column references
  INSERT INTO collaborative_pixels (x, y, color, session_id, contributor_name)
  VALUES (v_new_x, v_new_y, p_color, v_session_uuid, p_contributor_name)
  RETURNING id INTO v_existing_pixel_id;

  -- Return the created pixel data
  RETURN QUERY
  SELECT 
    cp.id as pixel_id,
    cp.x,
    cp.y,
    cp.color,
    cp.created_at,
    v_is_new_session as is_new_session
  FROM collaborative_pixels cp
  WHERE cp.id = v_existing_pixel_id;
END;
$$;

-- Grant execute permission to anon users
GRANT EXECUTE ON FUNCTION create_pixel_for_session(text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION create_pixel_for_session(text, text, text, text, text) TO authenticated;