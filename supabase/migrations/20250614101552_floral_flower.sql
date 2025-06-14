/*
  # Système unifié d'external_id avec nettoyage des doublons

  1. Fonctions utilitaires
    - Extraction du numéro de patient depuis external_id
    - Génération d'external_id séquentiels pour chaque type

  2. Nettoyage des doublons
    - Suppression des external_id en doublon
    - Réassignation avec des IDs uniques

  3. Mise à jour des enregistrements
    - Attribution d'external_id cohérents basés sur le patient
    - Format : PAT-001, CONS-001-001, FACT-001-001, RDV-001-001
*/

-- Fonction pour extraire le numéro de patient depuis l'external_id
CREATE OR REPLACE FUNCTION extract_patient_number(patient_external_id text)
RETURNS integer AS $$
BEGIN
  IF patient_external_id IS NULL OR patient_external_id = '' THEN
    RETURN NULL;
  END IF;
  
  -- Extraire le numéro après PAT-
  RETURN SUBSTRING(patient_external_id FROM 'PAT-(\d+)')::integer;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer le prochain external_id patient
CREATE OR REPLACE FUNCTION generate_next_patient_external_id()
RETURNS text AS $$
DECLARE
  next_number integer;
BEGIN
  -- Trouver le prochain numéro disponible
  SELECT COALESCE(MAX(extract_patient_number(external_id)), 0) + 1
  INTO next_number
  FROM patients
  WHERE external_id IS NOT NULL AND external_id ~ '^PAT-\d+$';
  
  RETURN 'PAT-' || LPAD(next_number::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer external_id consultation avec vérification d'unicité
CREATE OR REPLACE FUNCTION generate_consultation_external_id(patient_uuid uuid)
RETURNS text AS $$
DECLARE
  patient_external_id text;
  patient_number integer;
  next_consultation_number integer;
  proposed_id text;
BEGIN
  -- Récupérer l'external_id du patient
  SELECT external_id INTO patient_external_id
  FROM patients
  WHERE id = patient_uuid;
  
  IF patient_external_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Extraire le numéro du patient
  patient_number := extract_patient_number(patient_external_id);
  
  IF patient_number IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Trouver le prochain numéro de consultation disponible
  SELECT COALESCE(MAX(
    SUBSTRING(external_id FROM 'CONS-\d+-(\d+)')::integer
  ), 0) + 1
  INTO next_consultation_number
  FROM consultations
  WHERE patient_id = patient_uuid 
    AND external_id ~ ('^CONS-' || LPAD(patient_number::text, 3, '0') || '-\d+$');
  
  -- Générer l'ID proposé
  proposed_id := 'CONS-' || LPAD(patient_number::text, 3, '0') || '-' || LPAD(next_consultation_number::text, 3, '0');
  
  -- Vérifier l'unicité globale et incrémenter si nécessaire
  WHILE EXISTS (SELECT 1 FROM consultations WHERE external_id = proposed_id) LOOP
    next_consultation_number := next_consultation_number + 1;
    proposed_id := 'CONS-' || LPAD(patient_number::text, 3, '0') || '-' || LPAD(next_consultation_number::text, 3, '0');
  END LOOP;
  
  RETURN proposed_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer external_id facture avec vérification d'unicité
CREATE OR REPLACE FUNCTION generate_facture_external_id(patient_uuid uuid)
RETURNS text AS $$
DECLARE
  patient_external_id text;
  patient_number integer;
  next_facture_number integer;
  proposed_id text;
BEGIN
  -- Récupérer l'external_id du patient
  SELECT external_id INTO patient_external_id
  FROM patients
  WHERE id = patient_uuid;
  
  IF patient_external_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Extraire le numéro du patient
  patient_number := extract_patient_number(patient_external_id);
  
  IF patient_number IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Trouver le prochain numéro de facture disponible
  SELECT COALESCE(MAX(
    SUBSTRING(external_id FROM 'FACT-\d+-(\d+)')::integer
  ), 0) + 1
  INTO next_facture_number
  FROM factures
  WHERE patient_id = patient_uuid 
    AND external_id ~ ('^FACT-' || LPAD(patient_number::text, 3, '0') || '-\d+$');
  
  -- Générer l'ID proposé
  proposed_id := 'FACT-' || LPAD(patient_number::text, 3, '0') || '-' || LPAD(next_facture_number::text, 3, '0');
  
  -- Vérifier l'unicité globale et incrémenter si nécessaire
  WHILE EXISTS (SELECT 1 FROM factures WHERE external_id = proposed_id) LOOP
    next_facture_number := next_facture_number + 1;
    proposed_id := 'FACT-' || LPAD(patient_number::text, 3, '0') || '-' || LPAD(next_facture_number::text, 3, '0');
  END LOOP;
  
  RETURN proposed_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer external_id rendez-vous avec vérification d'unicité
CREATE OR REPLACE FUNCTION generate_rdv_external_id(patient_uuid uuid)
RETURNS text AS $$
DECLARE
  patient_external_id text;
  patient_number integer;
  next_rdv_number integer;
  proposed_id text;
BEGIN
  -- Récupérer l'external_id du patient
  SELECT external_id INTO patient_external_id
  FROM patients
  WHERE id = patient_uuid;
  
  IF patient_external_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Extraire le numéro du patient
  patient_number := extract_patient_number(patient_external_id);
  
  IF patient_number IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Trouver le prochain numéro de rendez-vous disponible
  SELECT COALESCE(MAX(
    SUBSTRING(external_id FROM 'RDV-\d+-(\d+)')::integer
  ), 0) + 1
  INTO next_rdv_number
  FROM rendez_vous
  WHERE patient_id = patient_uuid 
    AND external_id ~ ('^RDV-' || LPAD(patient_number::text, 3, '0') || '-\d+$');
  
  -- Générer l'ID proposé
  proposed_id := 'RDV-' || LPAD(patient_number::text, 3, '0') || '-' || LPAD(next_rdv_number::text, 3, '0');
  
  -- Vérifier l'unicité globale et incrémenter si nécessaire
  WHILE EXISTS (SELECT 1 FROM rendez_vous WHERE external_id = proposed_id) LOOP
    next_rdv_number := next_rdv_number + 1;
    proposed_id := 'RDV-' || LPAD(patient_number::text, 3, '0') || '-' || LPAD(next_rdv_number::text, 3, '0');
  END LOOP;
  
  RETURN proposed_id;
END;
$$ LANGUAGE plpgsql;

-- ÉTAPE 1: Nettoyer les doublons existants en mettant à NULL les external_id en doublon
-- Consultations
UPDATE consultations 
SET external_id = NULL 
WHERE id NOT IN (
  SELECT DISTINCT ON (external_id) id 
  FROM consultations 
  WHERE external_id IS NOT NULL 
  ORDER BY external_id, created_at ASC
);

-- Factures
UPDATE factures 
SET external_id = NULL 
WHERE id NOT IN (
  SELECT DISTINCT ON (external_id) id 
  FROM factures 
  WHERE external_id IS NOT NULL 
  ORDER BY external_id, created_at ASC
);

-- Rendez-vous
UPDATE rendez_vous 
SET external_id = NULL 
WHERE id NOT IN (
  SELECT DISTINCT ON (external_id) id 
  FROM rendez_vous 
  WHERE external_id IS NOT NULL 
  ORDER BY external_id, created_at ASC
);

-- ÉTAPE 2: Mettre à jour les patients existants qui n'ont pas d'external_id
UPDATE patients 
SET external_id = generate_next_patient_external_id()
WHERE external_id IS NULL;

-- ÉTAPE 3: Mettre à jour les consultations existantes
UPDATE consultations 
SET external_id = generate_consultation_external_id(patient_id)
WHERE external_id IS NULL AND patient_id IS NOT NULL;

-- ÉTAPE 4: Mettre à jour les factures existantes
UPDATE factures 
SET external_id = generate_facture_external_id(patient_id)
WHERE external_id IS NULL AND patient_id IS NOT NULL;

-- ÉTAPE 5: Mettre à jour les rendez-vous existants
UPDATE rendez_vous 
SET external_id = generate_rdv_external_id(patient_id)
WHERE external_id IS NULL AND patient_id IS NOT NULL;

-- ÉTAPE 6: Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_consultations_external_id_pattern ON consultations(external_id) WHERE external_id ~ '^CONS-\d+-\d+$';
CREATE INDEX IF NOT EXISTS idx_factures_external_id_pattern ON factures(external_id) WHERE external_id ~ '^FACT-\d+-\d+$';
CREATE INDEX IF NOT EXISTS idx_rendez_vous_external_id_pattern ON rendez_vous(external_id) WHERE external_id ~ '^RDV-\d+-\d+$';