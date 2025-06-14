/*
  # Correction du champ external_id pour les consultations

  1. Modifications
    - Rendre le champ external_id optionnel (nullable)
    - Supprimer la contrainte UNIQUE temporairement
    - Ajouter une contrainte UNIQUE qui ignore les valeurs NULL

  2. Sécurité
    - Maintenir l'intégrité des données
    - Permettre les insertions sans external_id
*/

-- Supprimer la contrainte unique existante sur external_id
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_external_id_key;

-- Rendre le champ external_id nullable
ALTER TABLE consultations ALTER COLUMN external_id DROP NOT NULL;

-- Créer un index unique partiel qui ignore les valeurs NULL
CREATE UNIQUE INDEX IF NOT EXISTS consultations_external_id_unique_idx 
ON consultations (external_id) 
WHERE external_id IS NOT NULL;

-- Faire la même chose pour les autres tables si nécessaire
ALTER TABLE factures DROP CONSTRAINT IF EXISTS factures_external_id_key;
ALTER TABLE factures ALTER COLUMN external_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS factures_external_id_unique_idx 
ON factures (external_id) 
WHERE external_id IS NOT NULL;

ALTER TABLE rendez_vous DROP CONSTRAINT IF EXISTS rendez_vous_external_id_key;
ALTER TABLE rendez_vous ALTER COLUMN external_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS rendez_vous_external_id_unique_idx 
ON rendez_vous (external_id) 
WHERE external_id IS NOT NULL;

-- Fonction pour générer un external_id automatiquement si nécessaire
CREATE OR REPLACE FUNCTION generate_external_id(table_prefix text)
RETURNS text AS $$
BEGIN
  RETURN table_prefix || '-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::text, 3, '0') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::bigint::text, 10, '0');
END;
$$ LANGUAGE plpgsql;