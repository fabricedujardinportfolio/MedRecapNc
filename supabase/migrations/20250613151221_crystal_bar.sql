/*
  # Système complet de gestion des patients

  1. Nouvelles Tables
    - `patients` - Informations complètes des patients
    - `consultations` - Historique des consultations
    - `factures` - Gestion des factures et paiements
    - `facture_details` - Détails des factures
    - `rendez_vous` - Planification des rendez-vous
    - `traitements` - Médicaments et traitements
    - `medicaments` - Prescriptions détaillées

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques d'accès public pour la démo
    
  3. Données
    - Import de tous les patients existants
    - Consultations, factures et rendez-vous associés
    - Relations correctes entre les tables
*/

-- Table des patients
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identifiant externe pour compatibilité
  external_id text UNIQUE,
  
  -- Informations personnelles
  nom text NOT NULL,
  prenom text NOT NULL,
  sexe text CHECK (sexe IN ('M', 'F', 'Autre')) NOT NULL,
  date_naissance date NOT NULL,
  age integer NOT NULL,
  lieu_naissance text NOT NULL,
  nationalite text NOT NULL,
  numero_securite_sociale text,
  situation_familiale text,
  
  -- Coordonnées
  adresse_rue text NOT NULL,
  adresse_ville text NOT NULL,
  adresse_code_postal text NOT NULL,
  adresse_pays text NOT NULL,
  telephone_portable text,
  telephone_fixe text,
  email text,
  
  -- Contact d'urgence
  contact_urgence_nom text NOT NULL,
  contact_urgence_lien text NOT NULL,
  contact_urgence_telephone text NOT NULL,
  
  -- Informations administratives
  numero_dossier text UNIQUE NOT NULL,
  date_admission date NOT NULL,
  service text NOT NULL,
  mode_admission text NOT NULL,
  medecin_traitant text NOT NULL,
  medecin_referent text NOT NULL,
  statut_social text,
  mutuelle text,
  pris_en_charge text,
  
  -- Informations médicales
  antecedents_personnels text[],
  antecedents_familiaux text[],
  allergies text[],
  biometrie_poids decimal,
  biometrie_taille decimal,
  biometrie_imc decimal,
  groupe_sanguin text NOT NULL,
  antecedents_chirurgicaux text[],
  habitudes_vie_tabac boolean DEFAULT false,
  habitudes_vie_alcool boolean DEFAULT false,
  habitudes_vie_drogues boolean DEFAULT false,
  habitudes_vie_details text,
  pathologies_connues text[],
  motif_hospitalisation text NOT NULL,
  diagnostics text[],
  
  -- Alertes et statut
  alerte_niveau text CHECK (alerte_niveau IN ('verte', 'orange', 'rouge')),
  alerte_message text,
  statut text CHECK (statut IN ('Actif', 'Sorti', 'Transfert', 'Urgence')) NOT NULL,
  
  -- Nouvelles fonctionnalités cabinet
  type_patient text CHECK (type_patient IN ('hospitalier', 'cabinet')) DEFAULT 'hospitalier',
  medecin_cabinet text,
  
  -- Métadonnées
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des traitements
CREATE TABLE IF NOT EXISTS traitements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  nom text NOT NULL,
  dosage text NOT NULL,
  frequence text NOT NULL,
  date_debut date NOT NULL,
  date_fin date,
  actif boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des consultations
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  date timestamptz NOT NULL,
  motif text NOT NULL,
  diagnostic text NOT NULL,
  traitement text,
  observations text,
  medecin_id text,
  medecin_nom text NOT NULL,
  duree integer DEFAULT 30, -- en minutes
  type text CHECK (type IN ('consultation', 'visite', 'urgence', 'suivi')) DEFAULT 'consultation',
  statut text CHECK (statut IN ('programmee', 'en_cours', 'terminee', 'annulee')) DEFAULT 'terminee',
  tarif decimal DEFAULT 25.00,
  
  -- Signes vitaux
  tension text,
  pouls integer,
  temperature decimal,
  poids decimal,
  taille decimal,
  
  created_at timestamptz DEFAULT now()
);

-- Table des factures
CREATE TABLE IF NOT EXISTS factures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id uuid REFERENCES consultations(id) ON DELETE SET NULL,
  numero text UNIQUE NOT NULL,
  date date NOT NULL,
  montant_total decimal NOT NULL,
  montant_paye decimal DEFAULT 0,
  montant_restant decimal NOT NULL,
  statut text CHECK (statut IN ('en_attente', 'partiellement_payee', 'payee', 'en_retard', 'annulee')) DEFAULT 'en_attente',
  methode_paiement text CHECK (methode_paiement IN ('especes', 'carte', 'cheque', 'virement', 'securite_sociale')),
  date_echeance date NOT NULL,
  date_paiement date,
  
  -- Remboursement
  remboursement_securite_sociale decimal DEFAULT 0,
  remboursement_mutuelle decimal DEFAULT 0,
  remboursement_reste_a_charge decimal DEFAULT 0,
  
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Table des détails de facture
CREATE TABLE IF NOT EXISTS facture_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id uuid REFERENCES factures(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantite integer DEFAULT 1,
  prix_unitaire decimal NOT NULL,
  total decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS rendez_vous (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  patient_nom text NOT NULL,
  date date NOT NULL,
  heure_debut time NOT NULL,
  heure_fin time NOT NULL,
  motif text NOT NULL,
  type text CHECK (type IN ('consultation', 'suivi', 'urgence', 'visite')) DEFAULT 'consultation',
  statut text CHECK (statut IN ('programme', 'confirme', 'en_cours', 'termine', 'annule', 'reporte')) DEFAULT 'programme',
  medecin_id text,
  medecin_nom text NOT NULL,
  salle text,
  notes text,
  rappel_envoye boolean DEFAULT false,
  consultation_id uuid REFERENCES consultations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des médicaments
CREATE TABLE IF NOT EXISTS medicaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES consultations(id) ON DELETE CASCADE,
  nom text NOT NULL,
  dosage text NOT NULL,
  duree text,
  instructions text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_patients_external_id ON patients(external_id);
CREATE INDEX IF NOT EXISTS idx_patients_numero_dossier ON patients(numero_dossier);
CREATE INDEX IF NOT EXISTS idx_patients_nom_prenom ON patients(nom, prenom);
CREATE INDEX IF NOT EXISTS idx_patients_type ON patients(type_patient);
CREATE INDEX IF NOT EXISTS idx_consultations_external_id ON consultations(external_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(date);
CREATE INDEX IF NOT EXISTS idx_factures_external_id ON factures(external_id);
CREATE INDEX IF NOT EXISTS idx_factures_patient ON factures(patient_id);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_external_id ON rendez_vous(external_id);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_patient ON rendez_vous(patient_id);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_date ON rendez_vous(date);
CREATE INDEX IF NOT EXISTS idx_traitements_patient ON traitements(patient_id);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE facture_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE traitements ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicaments ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour accès public (démo)
CREATE POLICY "Accès public patients" ON patients FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Accès public consultations" ON consultations FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Accès public factures" ON factures FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Accès public facture_details" ON facture_details FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Accès public rendez_vous" ON rendez_vous FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Accès public traitements" ON traitements FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Accès public medicaments" ON medicaments FOR ALL TO public USING (true) WITH CHECK (true);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour patients
CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON patients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insérer les patients avec des UUIDs générés automatiquement
DO $$
DECLARE
  patient_1_id uuid := gen_random_uuid();
  patient_2_id uuid := gen_random_uuid();
  patient_3_id uuid := gen_random_uuid();
  patient_4_id uuid := gen_random_uuid();
  patient_5_id uuid := gen_random_uuid();
  patient_6_id uuid := gen_random_uuid();
  patient_7_id uuid := gen_random_uuid();
  patient_8_id uuid := gen_random_uuid();
  
  consultation_1_id uuid := gen_random_uuid();
  consultation_2_id uuid := gen_random_uuid();
  consultation_3_id uuid := gen_random_uuid();
  
  facture_1_id uuid := gen_random_uuid();
  facture_2_id uuid := gen_random_uuid();
  facture_3_id uuid := gen_random_uuid();
  
  rdv_1_id uuid := gen_random_uuid();
  rdv_2_id uuid := gen_random_uuid();
  rdv_3_id uuid := gen_random_uuid();
  rdv_4_id uuid := gen_random_uuid();
BEGIN
  -- Insérer les patients
  INSERT INTO patients (
    id, external_id, nom, prenom, sexe, date_naissance, age, lieu_naissance, nationalite, numero_securite_sociale,
    situation_familiale, adresse_rue, adresse_ville, adresse_code_postal, adresse_pays,
    telephone_portable, telephone_fixe, email, contact_urgence_nom, contact_urgence_lien, contact_urgence_telephone,
    numero_dossier, date_admission, service, mode_admission, medecin_traitant, medecin_referent,
    statut_social, mutuelle, pris_en_charge, antecedents_personnels, antecedents_familiaux, allergies,
    biometrie_poids, biometrie_taille, biometrie_imc, groupe_sanguin, antecedents_chirurgicaux,
    habitudes_vie_tabac, habitudes_vie_alcool, habitudes_vie_drogues, habitudes_vie_details,
    pathologies_connues, motif_hospitalisation, diagnostics, alerte_niveau, alerte_message,
    statut, type_patient, medecin_cabinet
  ) VALUES 
  -- Patient 1: Marie Dubois
  (patient_1_id, 'PAT-001', 'Dubois', 'Marie', 'F', '1985-03-15', 39, 'Nouméa, New Caledonia', 'French', '2850315123456',
   'Married', '123 Coconut Palm Avenue', 'Nouméa', '98800', 'New Caledonia',
   '+687 123 456', '+687 234 567', 'marie.dubois@email.nc', 'Jean Dubois', 'Husband', '+687 345 678',
   'MED-2025-001', '2025-01-10', 'Cardiology', 'Emergency', 'Dr. Martin', 'Dr. Sarah Wilson',
   'Employed', 'CAFAT', 'Full coverage', ARRAY['Hypertension', 'Type 2 diabetes'], ARRAY['Heart disease', 'Diabetes'], ARRAY['Penicillin', 'Shellfish'],
   68, 165, 25.0, 'A+', ARRAY['Appendectomy (2010)', 'Cesarean section (2015)'],
   false, true, false, 'Occasional social drinking',
   ARRAY['Hypertension', 'Type 2 diabetes'], 'Chest pain and shortness of breath', ARRAY['Acute coronary syndrome', 'Unstable angina'], 'orange', 'Monitor blood pressure - recent elevation',
   'Actif', 'cabinet', 'Dr. Martin Dubois'),

  -- Patient 2: Pierre Kanak
  (patient_2_id, 'PAT-002', 'Kanak', 'Pierre', 'M', '1992-08-22', 32, 'Lifou, Loyalty Islands', 'French', '1920822234567',
   'Single', '45 Tribal Heritage Road', 'Lifou', '98820', 'New Caledonia',
   '+687 456 789', '+687 567 890', 'pierre.kanak@email.nc', 'Marie Kanak', 'Mother', '+687 678 901',
   'MED-2025-002', '2025-01-12', 'Emergency', 'Emergency', 'Dr. Johnson', 'Dr. Michael Brown',
   'Unemployed', 'RUAMM', 'Partial coverage', ARRAY['Asthma', 'Allergic rhinitis'], ARRAY['Asthma', 'Allergies'], ARRAY['Dust mites', 'Pollen'],
   75, 178, 23.7, 'O+', ARRAY['None'],
   true, false, false, 'Smoker - 10 cigarettes per day',
   ARRAY['Chronic asthma', 'Allergic rhinitis'], 'Severe asthma attack with respiratory distress', ARRAY['Acute asthma exacerbation', 'Respiratory failure'], 'rouge', 'Respiratory monitoring required - oxygen saturation unstable',
   'Urgence', 'hospitalier', NULL),

  -- Patient 3: Sarah Johnson
  (patient_3_id, 'PAT-003', 'Johnson', 'Sarah', 'F', '1988-11-05', 36, 'Sydney, Australia', 'Australian', '2881105345678',
   'Married', '78 Eucalyptus Street', 'Nouméa', '98800', 'New Caledonia',
   '+687 789 012', '+687 890 123', 'sarah.johnson@email.nc', 'David Johnson', 'Husband', '+687 901 234',
   'MED-2025-003', '2025-01-08', 'Obstetrics', 'Scheduled', 'Dr. Williams', 'Dr. Emma Davis',
   'Employed', 'Private insurance', 'Full coverage', ARRAY['Previous cesarean section', 'Gestational diabetes'], ARRAY['Diabetes', 'Hypertension'], ARRAY['Latex'],
   72, 168, 25.5, 'B+', ARRAY['Cesarean section (2020)'],
   false, false, false, 'Healthy lifestyle during pregnancy',
   ARRAY['Pregnancy - 32 weeks gestation'], 'Routine pregnancy monitoring and preparation for delivery', ARRAY['Normal pregnancy progression', 'Previous cesarean section'], 'verte', 'Pregnancy progressing normally - routine monitoring',
   'Actif', 'cabinet', 'Dr. Martin Dubois'),

  -- Patient 4: Jean Tamate
  (patient_4_id, 'PAT-004', 'Tamate', 'Jean', 'M', '1955-12-10', 69, 'Maré, Loyalty Islands', 'French', '1551210456789',
   'Widowed', '12 Traditional Village Path', 'Maré', '98828', 'New Caledonia',
   '+687 012 345', '+687 123 456', 'jean.tamate@email.nc', 'Paul Tamate', 'Son', '+687 234 567',
   'MED-2025-004', '2025-01-14', 'Nephrology', 'Emergency', 'Dr. Anderson', 'Dr. Robert Lee',
   'Retired', 'CAFAT', 'Full coverage', ARRAY['Chronic kidney disease', 'Hypertension', 'Type 2 diabetes'], ARRAY['Kidney disease', 'Diabetes', 'Hypertension'], ARRAY['Iodine contrast', 'NSAIDs'],
   82, 172, 27.7, 'AB+', ARRAY['Arteriovenous fistula creation (2023)'],
   false, false, false, 'Former smoker - quit 10 years ago',
   ARRAY['End-stage renal disease', 'Diabetes mellitus type 2', 'Hypertension'], 'Acute kidney injury with fluid overload and electrolyte imbalance', ARRAY['Acute on chronic kidney disease', 'Fluid overload', 'Hyperkalemia'], 'rouge', 'Critical kidney function - dialysis may be required urgently',
   'Urgence', 'cabinet', 'Dr. Martin Dubois'),

  -- Patient 5: Claire Martin
  (patient_5_id, 'PAT-005', 'Martin', 'Claire', 'F', '1978-04-18', 46, 'Paris, France', 'French', '2780418567890',
   'Divorced', '56 Bougainvillea Boulevard', 'Nouméa', '98800', 'New Caledonia',
   '+687 345 678', '+687 456 789', 'claire.martin@email.nc', 'Sophie Martin', 'Sister', '+687 567 890',
   'MED-2025-005', '2025-01-13', 'Surgery', 'Scheduled', 'Dr. Thompson', 'Dr. Lisa Garcia',
   'Employed', 'MUTUELLE DES FONCTIONNAIRES', 'Full coverage', ARRAY['Gallstones', 'Gastroesophageal reflux'], ARRAY['Gallbladder disease', 'Digestive disorders'], ARRAY['Morphine', 'Codeine'],
   65, 162, 24.8, 'O-', ARRAY['None'],
   false, true, false, 'Moderate wine consumption with meals',
   ARRAY['Cholelithiasis', 'GERD'], 'Elective laparoscopic cholecystectomy for symptomatic gallstones', ARRAY['Symptomatic cholelithiasis', 'Chronic cholecystitis'], 'verte', 'Pre-operative preparation - surgery scheduled for tomorrow',
   'Actif', 'cabinet', 'Dr. Martin Dubois'),

  -- Patient 6: Robert Wilson
  (patient_6_id, 'PAT-006', 'Wilson', 'Robert', 'M', '1965-07-30', 59, 'Wellington, New Zealand', 'New Zealand', '1650730678901',
   'Married', '89 Coral Reef Drive', 'Nouméa', '98800', 'New Caledonia',
   '+687 678 901', '+687 789 012', 'robert.wilson@email.nc', 'Helen Wilson', 'Wife', '+687 890 123',
   'MED-2025-006', '2025-01-11', 'Internal Medicine', 'Referral', 'Dr. Clark', 'Dr. James Miller',
   'Employed', 'International insurance', 'Full coverage', ARRAY['Myocardial infarction (2020)', 'Hyperlipidemia'], ARRAY['Coronary artery disease', 'Stroke'], ARRAY['Aspirin', 'Sulfa drugs'],
   88, 180, 27.2, 'A-', ARRAY['Coronary angioplasty with stent (2020)'],
   false, true, false, 'Former smoker - quit after heart attack, occasional beer',
   ARRAY['Coronary artery disease', 'Hyperlipidemia', 'Hypertension'], 'Chest pain evaluation and cardiac monitoring', ARRAY['Stable angina', 'Coronary artery disease'], 'orange', 'Cardiac monitoring - recent chest pain episodes',
   'Actif', 'hospitalier', NULL),

  -- Patient 7: Emma Brown
  (patient_7_id, 'PAT-007', 'Brown', 'Emma', 'F', '2010-02-14', 14, 'Nouméa, New Caledonia', 'French', '3100214789012',
   'Minor', '34 Hibiscus Lane', 'Nouméa', '98800', 'New Caledonia',
   '+687 901 234', '+687 012 345', 'emma.brown@email.nc', 'Michelle Brown', 'Mother', '+687 123 456',
   'MED-2025-007', '2025-01-15', 'Pediatrics', 'Emergency', 'Dr. Pediatric', 'Dr. Anna Rodriguez',
   'Student', 'CAFAT (parents)', 'Full coverage', ARRAY['Asthma', 'Eczema'], ARRAY['Allergies', 'Asthma'], ARRAY['Peanuts', 'Tree nuts', 'Eggs'],
   45, 155, 18.7, 'B-', ARRAY['None'],
   false, false, false, 'Active teenager - plays volleyball',
   ARRAY['Allergic asthma', 'Atopic dermatitis', 'Food allergies'], 'Severe allergic reaction after accidental peanut exposure', ARRAY['Anaphylaxis', 'Severe allergic reaction'], 'rouge', 'Severe food allergies - epinephrine available, monitor for anaphylaxis',
   'Urgence', 'cabinet', 'Dr. Martin Dubois'),

  -- Patient 8: Carlos Garcia
  (patient_8_id, 'PAT-008', 'Garcia', 'Carlos', 'M', '1970-09-25', 54, 'Madrid, Spain', 'Spanish', '1700925890123',
   'Married', '67 Flamboyant Street', 'Nouméa', '98800', 'New Caledonia',
   '+687 234 567', '+687 345 678', 'carlos.garcia@email.nc', 'Maria Garcia', 'Wife', '+687 456 789',
   'MED-2025-008', '2025-01-09', 'Orthopedics', 'Emergency', 'Dr. Orthopedic', 'Dr. Kevin Taylor',
   'Employed', 'European insurance', 'Partial coverage', ARRAY['Osteoarthritis', 'Lower back pain'], ARRAY['Arthritis', 'Bone disorders'], ARRAY['None known'],
   78, 175, 25.5, 'O+', ARRAY['None'],
   true, true, false, 'Moderate smoker and drinker - construction worker',
   ARRAY['Lumbar disc herniation', 'Chronic lower back pain'], 'Acute lower back pain with leg numbness after work injury', ARRAY['Acute lumbar disc herniation', 'Sciatica'], 'orange', 'Pain management required - possible surgical intervention needed',
   'Actif', 'hospitalier', NULL);

  -- Insérer les traitements pour chaque patient
  INSERT INTO traitements (patient_id, nom, dosage, frequence, date_debut) VALUES
  -- Marie Dubois
  (patient_1_id, 'Amlodipine', '5mg', 'Once daily', '2024-06-01'),
  (patient_1_id, 'Metformin', '500mg', 'Twice daily', '2024-01-15'),
  -- Pierre Kanak
  (patient_2_id, 'Salbutamol inhaler', '100mcg', 'As needed', '2023-03-10'),
  (patient_2_id, 'Fluticasone', '50mcg', 'Twice daily', '2023-03-10'),
  -- Sarah Johnson
  (patient_3_id, 'Prenatal vitamins', '1 tablet', 'Once daily', '2024-08-01'),
  (patient_3_id, 'Iron supplement', '65mg', 'Once daily', '2024-10-15'),
  -- Jean Tamate
  (patient_4_id, 'Lisinopril', '10mg', 'Once daily', '2022-01-01'),
  (patient_4_id, 'Insulin glargine', '20 units', 'Once daily', '2021-06-15'),
  (patient_4_id, 'Furosemide', '40mg', 'Twice daily', '2023-03-01'),
  -- Claire Martin
  (patient_5_id, 'Omeprazole', '20mg', 'Once daily', '2023-09-01'),
  -- Robert Wilson
  (patient_6_id, 'Clopidogrel', '75mg', 'Once daily', '2020-08-15'),
  (patient_6_id, 'Atorvastatin', '40mg', 'Once daily', '2020-08-15'),
  (patient_6_id, 'Metoprolol', '50mg', 'Twice daily', '2020-08-15'),
  -- Emma Brown
  (patient_7_id, 'Salbutamol inhaler', '100mcg', 'As needed', '2022-05-01'),
  (patient_7_id, 'Hydrocortisone cream', '1%', 'As needed', '2021-03-15'),
  -- Carlos Garcia
  (patient_8_id, 'Ibuprofen', '400mg', 'Three times daily', '2024-11-01'),
  (patient_8_id, 'Paracetamol', '500mg', 'As needed', '2024-11-01');

  -- Insérer les consultations
  INSERT INTO consultations (
    id, external_id, patient_id, date, motif, diagnostic, traitement, observations, medecin_nom, duree, type, statut, tarif,
    tension, pouls, temperature, poids, taille
  ) VALUES
  -- Marie Dubois
  (consultation_1_id, 'CONS-001', patient_1_id, '2025-01-15 09:30:00', 'Blood pressure check', 'Controlled hypertension', 'Continue antihypertensive treatment', 'Stable blood pressure, good treatment compliance', 'Dr. Martin Dubois', 30, 'suivi', 'terminee', 25,
   '130/80', 72, 36.5, 75, 170),
  -- Pierre Kanak
  (consultation_2_id, 'CONS-002', patient_2_id, '2025-01-15 14:00:00', 'Persistent cough', 'Acute bronchitis', 'Antibiotic and cough suppressant', 'Productive cough for 5 days, no fever', 'Dr. Martin Dubois', 20, 'consultation', 'terminee', 25,
   '120/75', 68, 36.8, 82, 175),
  -- Sarah Johnson
  (consultation_3_id, 'CONS-003', patient_3_id, '2025-01-16 10:15:00', 'Pregnancy follow-up', 'Normal pregnancy - 20 weeks gestation', 'Iron supplementation', 'Pregnancy progressing normally, no complications', 'Dr. Martin Dubois', 25, 'suivi', 'terminee', 25,
   '110/70', 75, 36.6, 65, 165);

  -- Insérer les médicaments prescrits
  INSERT INTO medicaments (consultation_id, nom, dosage, duree, instructions) VALUES
  -- Consultation Marie Dubois
  (consultation_1_id, 'Amlodipine', '5mg', '30 days', '1 tablet in the morning'),
  -- Consultation Pierre Kanak
  (consultation_2_id, 'Amoxicillin', '1g', '7 days', '1 tablet morning and evening'),
  (consultation_2_id, 'Cough syrup', '15ml', '5 days', '3 times daily'),
  -- Consultation Sarah Johnson
  (consultation_3_id, 'Iron + Folic acid', '1 tablet', '30 days', '1 tablet daily with meals');

  -- Insérer les factures
  INSERT INTO factures (
    id, external_id, patient_id, consultation_id, numero, date, montant_total, montant_paye, montant_restant, statut,
    methode_paiement, date_echeance, date_paiement, remboursement_securite_sociale, remboursement_mutuelle, remboursement_reste_a_charge
  ) VALUES
  -- Facture Marie Dubois
  (facture_1_id, 'FACT-001', patient_1_id, consultation_1_id, 'F2025-001', '2025-01-15', 25, 25, 0, 'payee',
   'carte', '2025-01-15', '2025-01-15', 17.50, 7.50, 0),
  -- Facture Pierre Kanak
  (facture_2_id, 'FACT-002', patient_2_id, consultation_2_id, 'F2025-002', '2025-01-15', 25, 0, 25, 'en_attente',
   NULL, '2025-02-15', NULL, 17.50, 7.50, 0),
  -- Facture Sarah Johnson
  (facture_3_id, 'FACT-003', patient_3_id, consultation_3_id, 'F2025-003', '2025-01-16', 25, 17.50, 7.50, 'partiellement_payee',
   'securite_sociale', '2025-02-16', '2025-01-16', 17.50, 7.50, 0);

  -- Insérer les détails de facture
  INSERT INTO facture_details (facture_id, description, quantite, prix_unitaire, total) VALUES
  -- Détails facture Marie Dubois
  (facture_1_id, 'Follow-up consultation', 1, 25, 25),
  -- Détails facture Pierre Kanak
  (facture_2_id, 'Medical consultation', 1, 25, 25),
  -- Détails facture Sarah Johnson
  (facture_3_id, 'Pregnancy follow-up consultation', 1, 25, 25);

  -- Insérer les rendez-vous
  INSERT INTO rendez_vous (
    id, external_id, patient_id, patient_nom, date, heure_debut, heure_fin, motif, type, statut, medecin_nom, salle, rappel_envoye
  ) VALUES
  -- RDV Marie Dubois
  (rdv_1_id, 'RDV-001', patient_1_id, 'Marie Dubois', '2025-01-17', '09:00', '09:30', 'Blood pressure check', 'suivi', 'confirme', 'Dr. Martin Dubois', 'Office 1', true),
  -- RDV Jean Tamate
  (rdv_2_id, 'RDV-002', patient_4_id, 'Jean Tamate', '2025-01-17', '10:00', '10:30', 'General consultation', 'consultation', 'programme', 'Dr. Martin Dubois', 'Office 1', false),
  -- RDV Sarah Johnson
  (rdv_3_id, 'RDV-003', patient_3_id, 'Sarah Johnson', '2025-01-17', '14:30', '15:00', 'Pregnancy follow-up', 'suivi', 'confirme', 'Dr. Martin Dubois', 'Office 1', true),
  -- RDV Pierre Kanak
  (rdv_4_id, 'RDV-004', patient_2_id, 'Pierre Kanak', '2025-01-18', '11:00', '11:30', 'Bronchitis follow-up', 'suivi', 'programme', 'Dr. Martin Dubois', 'Office 1', false);

END $$;