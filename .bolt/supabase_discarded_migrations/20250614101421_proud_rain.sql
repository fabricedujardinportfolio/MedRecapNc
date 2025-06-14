/*
  # Système unifié d'external_id basé sur le patient

  1. Modifications
    - Créer des séquences pour chaque type d'entité par patient
    - Fonction pour générer des external_id cohérents
    - Format: PAT-001, CONS-001-001, FACT-001-001, RDV-001-001

  2. Logique
    - Patient: PAT-{numéro séquentiel}
    - Consultation: CONS-{patient_number}-{consultation_number}
    - Facture: FACT-{patient_number}-{facture_number}
    - Rendez-vous: RDV-{patient_number}-{rdv_number}
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
  WHERE external_id IS NOT NULL;
  
  RETURN 'PAT-' || LPAD(next_number::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer external_id consultation
CREATE OR REPLACE FUNCTION generate_consultation_external_id(patient_uuid uuid)
RETURNS text AS $$
DECLARE
  patient_external_id text;
  patient_number integer;
  next_consultation_number integer;
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
  
  -- Compter les consultations existantes pour ce patient
  SELECT COALESCE(COUNT(*), 0) + 1
  INTO next_consultation_number
  FROM consultations
  WHERE patient_id = patient_uuid;
  
  RETURN 'CONS-' || LPAD(patient_number::text, 3, '0') || '-' || LPAD(next_consultation_number::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer external_id facture
CREATE OR REPLACE FUNCTION generate_facture_external_id(patient_uuid uuid)
RETURNS text AS $$
DECLARE
  patient_external_id text;
  patient_number integer;
  next_facture_number integer;
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
  
  -- Compter les factures existantes pour ce patient
  SELECT COALESCE(COUNT(*), 0) + 1
  INTO next_facture_number
  FROM factures
  WHERE patient_id = patient_uuid;
  
  RETURN 'FACT-' || LPAD(patient_number::text, 3, '0') || '-' || LPAD(next_facture_number::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer external_id rendez-vous
CREATE OR REPLACE FUNCTION generate_rdv_external_id(patient_uuid uuid)
RETURNS text AS $$
DECLARE
  patient_external_id text;
  patient_number integer;
  next_rdv_number integer;
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
  
  -- Compter les rendez-vous existants pour ce patient
  SELECT COALESCE(COUNT(*), 0) + 1
  INTO next_rdv_number
  FROM rendez_vous
  WHERE patient_id = patient_uuid;
  
  RETURN 'RDV-' || LPAD(patient_number::text, 3, '0') || '-' || LPAD(next_rdv_number::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour les patients existants qui n'ont pas d'external_id
UPDATE patients 
SET external_id = generate_next_patient_external_id()
WHERE external_id IS NULL;

-- Mettre à jour les consultations existantes
UPDATE consultations 
SET external_id = generate_consultation_external_id(patient_id)
WHERE external_id IS NULL AND patient_id IS NOT NULL;

-- Mettre à jour les factures existantes
UPDATE factures 
SET external_id = generate_facture_external_id(patient_id)
WHERE external_id IS NULL AND patient_id IS NOT NULL;

-- Mettre à jour les rendez-vous existants
UPDATE rendez_vous 
SET external_id = generate_rdv_external_id(patient_id)
WHERE external_id IS NULL AND patient_id IS NOT NULL;