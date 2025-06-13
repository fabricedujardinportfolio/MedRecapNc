export const mockPatients = [
  {
    id: 'PAT-001',
    // Personal Information
    nom: 'Dubois',
    prenom: 'Marie',
    sexe: 'F' as const,
    dateNaissance: '1985-03-15',
    age: 39,
    lieuNaissance: 'Nouméa, New Caledonia',
    nationalite: 'French',
    numeroSecuriteSociale: '2850315123456',
    situationFamiliale: 'Married',
    
    // Contact Information
    adresse: {
      rue: '123 Coconut Palm Avenue',
      ville: 'Nouméa',
      codePostal: '98800',
      pays: 'New Caledonia'
    },
    telephone: {
      portable: '+687 123 456',
      fixe: '+687 234 567'
    },
    email: 'marie.dubois@email.nc',
    contactUrgence: {
      nom: 'Jean Dubois',
      lien: 'Husband',
      telephone: '+687 345 678'
    },
    
    // Administrative Information
    numeroDossier: 'MED-2025-001',
    dateAdmission: '2025-01-10',
    service: 'Cardiology',
    modeAdmission: 'Emergency',
    medecinTraitant: 'Dr. Martin',
    medecinReferent: 'Dr. Sarah Wilson',
    statutSocial: 'Employed',
    mutuelle: 'CAFAT',
    prisEnCharge: 'Full coverage',
    
    // Medical Information
    antecedents: {
      personnels: ['Hypertension', 'Type 2 diabetes'],
      familiaux: ['Heart disease', 'Diabetes']
    },
    allergies: ['Penicillin', 'Shellfish'],
    traitements: [
      {
        nom: 'Amlodipine',
        dosage: '5mg',
        frequence: 'Once daily',
        dateDebut: '2024-06-01'
      },
      {
        nom: 'Metformin',
        dosage: '500mg',
        frequence: 'Twice daily',
        dateDebut: '2024-01-15'
      }
    ],
    biometrie: {
      poids: 68,
      taille: 165,
      imc: 25.0
    },
    groupeSanguin: 'A+',
    antecedenChirurgicaux: ['Appendectomy (2010)', 'Cesarean section (2015)'],
    habitudesVie: {
      tabac: false,
      alcool: true,
      drogues: false,
      details: 'Occasional social drinking'
    },
    pathologiesConnues: ['Hypertension', 'Type 2 diabetes'],
    motifHospitalisation: 'Chest pain and shortness of breath',
    diagnostics: ['Acute coronary syndrome', 'Unstable angina'],
    
    // Alerts and Status
    alerte: {
      niveau: 'orange' as const,
      message: 'Monitor blood pressure - recent elevation'
    },
    statut: 'Active' as const,
    derniereMaj: '2025-01-15T14:30:00Z',

    // Cabinet Features
    consultations: [],
    factures: [],
    rendezVous: [],
    typePatient: 'hospitalier' as const
  },
  {
    id: 'PAT-002',
    // Personal Information
    nom: 'Kanak',
    prenom: 'Pierre',
    sexe: 'M' as const,
    dateNaissance: '1992-08-22',
    age: 32,
    lieuNaissance: 'Lifou, Loyalty Islands',
    nationalite: 'French',
    numeroSecuriteSociale: '1920822234567',
    situationFamiliale: 'Single',
    
    // Contact Information
    adresse: {
      rue: '45 Tribal Heritage Road',
      ville: 'Lifou',
      codePostal: '98820',
      pays: 'New Caledonia'
    },
    telephone: {
      portable: '+687 456 789',
      fixe: '+687 567 890'
    },
    email: 'pierre.kanak@email.nc',
    contactUrgence: {
      nom: 'Marie Kanak',
      lien: 'Mother',
      telephone: '+687 678 901'
    },
    
    // Administrative Information
    numeroDossier: 'MED-2025-002',
    dateAdmission: '2025-01-12',
    service: 'Emergency',
    modeAdmission: 'Emergency',
    medecinTraitant: 'Dr. Johnson',
    medecinReferent: 'Dr. Michael Brown',
    statutSocial: 'Unemployed',
    mutuelle: 'RUAMM',
    prisEnCharge: 'Partial coverage',
    
    // Medical Information
    antecedents: {
      personnels: ['Asthma', 'Allergic rhinitis'],
      familiaux: ['Asthma', 'Allergies']
    },
    allergies: ['Dust mites', 'Pollen'],
    traitements: [
      {
        nom: 'Salbutamol inhaler',
        dosage: '100mcg',
        frequence: 'As needed',
        dateDebut: '2023-03-10'
      },
      {
        nom: 'Fluticasone',
        dosage: '50mcg',
        frequence: 'Twice daily',
        dateDebut: '2023-03-10'
      }
    ],
    biometrie: {
      poids: 75,
      taille: 178,
      imc: 23.7
    },
    groupeSanguin: 'O+',
    antecedenChirurgicaux: ['None'],
    habitudesVie: {
      tabac: true,
      alcool: false,
      drogues: false,
      details: 'Smoker - 10 cigarettes per day'
    },
    pathologiesConnues: ['Chronic asthma', 'Allergic rhinitis'],
    motifHospitalisation: 'Severe asthma attack with respiratory distress',
    diagnostics: ['Acute asthma exacerbation', 'Respiratory failure'],
    
    // Alerts and Status
    alerte: {
      niveau: 'rouge' as const,
      message: 'Respiratory monitoring required - oxygen saturation unstable'
    },
    statut: 'Emergency' as const,
    derniereMaj: '2025-01-15T16:45:00Z',

    // Cabinet Features
    consultations: [],
    factures: [],
    rendezVous: [],
    typePatient: 'hospitalier' as const
  },
  {
    id: 'PAT-003',
    // Personal Information
    nom: 'Johnson',
    prenom: 'Sarah',
    sexe: 'F' as const,
    dateNaissance: '1988-11-05',
    age: 36,
    lieuNaissance: 'Sydney, Australia',
    nationalite: 'Australian',
    numeroSecuriteSociale: '2881105345678',
    situationFamiliale: 'Married',
    
    // Contact Information
    adresse: {
      rue: '78 Eucalyptus Street',
      ville: 'Nouméa',
      codePostal: '98800',
      pays: 'New Caledonia'
    },
    telephone: {
      portable: '+687 789 012',
      fixe: '+687 890 123'
    },
    email: 'sarah.johnson@email.nc',
    contactUrgence: {
      nom: 'David Johnson',
      lien: 'Husband',
      telephone: '+687 901 234'
    },
    
    // Administrative Information
    numeroDossier: 'MED-2025-003',
    dateAdmission: '2025-01-08',
    service: 'Obstetrics',
    modeAdmission: 'Scheduled',
    medecinTraitant: 'Dr. Williams',
    medecinReferent: 'Dr. Emma Davis',
    statutSocial: 'Employed',
    mutuelle: 'Private insurance',
    prisEnCharge: 'Full coverage',
    
    // Medical Information
    antecedents: {
      personnels: ['Previous cesarean section', 'Gestational diabetes'],
      familiaux: ['Diabetes', 'Hypertension']
    },
    allergies: ['Latex'],
    traitements: [
      {
        nom: 'Prenatal vitamins',
        dosage: '1 tablet',
        frequence: 'Once daily',
        dateDebut: '2024-08-01'
      },
      {
        nom: 'Iron supplement',
        dosage: '65mg',
        frequence: 'Once daily',
        dateDebut: '2024-10-15'
      }
    ],
    biometrie: {
      poids: 72,
      taille: 168,
      imc: 25.5
    },
    groupeSanguin: 'B+',
    antecedenChirurgicaux: ['Cesarean section (2020)'],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false,
      details: 'Healthy lifestyle during pregnancy'
    },
    pathologiesConnues: ['Pregnancy - 32 weeks gestation'],
    motifHospitalisation: 'Routine pregnancy monitoring and preparation for delivery',
    diagnostics: ['Normal pregnancy progression', 'Previous cesarean section'],
    
    // Alerts and Status
    alerte: {
      niveau: 'verte' as const,
      message: 'Pregnancy progressing normally - routine monitoring'
    },
    statut: 'Active' as const,
    derniereMaj: '2025-01-15T10:15:00Z',

    // Cabinet Features
    consultations: [],
    factures: [],
    rendezVous: [],
    typePatient: 'cabinet' as const
  },
  {
    id: 'PAT-004',
    // Personal Information
    nom: 'Tamate',
    prenom: 'Jean',
    sexe: 'M' as const,
    dateNaissance: '1955-12-10',
    age: 69,
    lieuNaissance: 'Maré, Loyalty Islands',
    nationalite: 'French',
    numeroSecuriteSociale: '1551210456789',
    situationFamiliale: 'Widowed',
    
    // Contact Information
    adresse: {
      rue: '12 Traditional Village Path',
      ville: 'Maré',
      codePostal: '98828',
      pays: 'New Caledonia'
    },
    telephone: {
      portable: '+687 012 345',
      fixe: '+687 123 456'
    },
    email: 'jean.tamate@email.nc',
    contactUrgence: {
      nom: 'Paul Tamate',
      lien: 'Son',
      telephone: '+687 234 567'
    },
    
    // Administrative Information
    numeroDossier: 'MED-2025-004',
    dateAdmission: '2025-01-14',
    service: 'Nephrology',
    modeAdmission: 'Emergency',
    medecinTraitant: 'Dr. Anderson',
    medecinReferent: 'Dr. Robert Lee',
    statutSocial: 'Retired',
    mutuelle: 'CAFAT',
    prisEnCharge: 'Full coverage',
    
    // Medical Information
    antecedents: {
      personnels: ['Chronic kidney disease', 'Hypertension', 'Type 2 diabetes'],
      familiaux: ['Kidney disease', 'Diabetes', 'Hypertension']
    },
    allergies: ['Iodine contrast', 'NSAIDs'],
    traitements: [
      {
        nom: 'Lisinopril',
        dosage: '10mg',
        frequence: 'Once daily',
        dateDebut: '2022-01-01'
      },
      {
        nom: 'Insulin glargine',
        dosage: '20 units',
        frequence: 'Once daily',
        dateDebut: '2021-06-15'
      },
      {
        nom: 'Furosemide',
        dosage: '40mg',
        frequence: 'Twice daily',
        dateDebut: '2023-03-01'
      }
    ],
    biometrie: {
      poids: 82,
      taille: 172,
      imc: 27.7
    },
    groupeSanguin: 'AB+',
    antecedenChirurgicaux: ['Arteriovenous fistula creation (2023)'],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false,
      details: 'Former smoker - quit 10 years ago'
    },
    pathologiesConnues: ['End-stage renal disease', 'Diabetes mellitus type 2', 'Hypertension'],
    motifHospitalisation: 'Acute kidney injury with fluid overload and electrolyte imbalance',
    diagnostics: ['Acute on chronic kidney disease', 'Fluid overload', 'Hyperkalemia'],
    
    // Alerts and Status
    alerte: {
      niveau: 'rouge' as const,
      message: 'Critical kidney function - dialysis may be required urgently'
    },
    statut: 'Emergency' as const,
    derniereMaj: '2025-01-15T18:20:00Z',

    // Cabinet Features
    consultations: [],
    factures: [],
    rendezVous: [],
    typePatient: 'hospitalier' as const
  },
  {
    id: 'PAT-005',
    // Personal Information
    nom: 'Martin',
    prenom: 'Claire',
    sexe: 'F' as const,
    dateNaissance: '1978-04-18',
    age: 46,
    lieuNaissance: 'Paris, France',
    nationalite: 'French',
    numeroSecuriteSociale: '2780418567890',
    situationFamiliale: 'Divorced',
    
    // Contact Information
    adresse: {
      rue: '56 Bougainvillea Boulevard',
      ville: 'Nouméa',
      codePostal: '98800',
      pays: 'New Caledonia'
    },
    telephone: {
      portable: '+687 345 678',
      fixe: '+687 456 789'
    },
    email: 'claire.martin@email.nc',
    contactUrgence: {
      nom: 'Sophie Martin',
      lien: 'Sister',
      telephone: '+687 567 890'
    },
    
    // Administrative Information
    numeroDossier: 'MED-2025-005',
    dateAdmission: '2025-01-13',
    service: 'Surgery',
    modeAdmission: 'Scheduled',
    medecinTraitant: 'Dr. Thompson',
    medecinReferent: 'Dr. Lisa Garcia',
    statutSocial: 'Employed',
    mutuelle: 'MUTUELLE DES FONCTIONNAIRES',
    prisEnCharge: 'Full coverage',
    
    // Medical Information
    antecedents: {
      personnels: ['Gallstones', 'Gastroesophageal reflux'],
      familiaux: ['Gallbladder disease', 'Digestive disorders']
    },
    allergies: ['Morphine', 'Codeine'],
    traitements: [
      {
        nom: 'Omeprazole',
        dosage: '20mg',
        frequence: 'Once daily',
        dateDebut: '2023-09-01'
      }
    ],
    biometrie: {
      poids: 65,
      taille: 162,
      imc: 24.8
    },
    groupeSanguin: 'O-',
    antecedenChirurgicaux: ['None'],
    habitudesVie: {
      tabac: false,
      alcool: true,
      drogues: false,
      details: 'Moderate wine consumption with meals'
    },
    pathologiesConnues: ['Cholelithiasis', 'GERD'],
    motifHospitalisation: 'Elective laparoscopic cholecystectomy for symptomatic gallstones',
    diagnostics: ['Symptomatic cholelithiasis', 'Chronic cholecystitis'],
    
    // Alerts and Status
    alerte: {
      niveau: 'verte' as const,
      message: 'Pre-operative preparation - surgery scheduled for tomorrow'
    },
    statut: 'Active' as const,
    derniereMaj: '2025-01-15T12:00:00Z',

    // Cabinet Features
    consultations: [],
    factures: [],
    rendezVous: [],
    typePatient: 'cabinet' as const
  },
  {
    id: 'PAT-006',
    // Personal Information
    nom: 'Wilson',
    prenom: 'Robert',
    sexe: 'M' as const,
    dateNaissance: '1965-07-30',
    age: 59,
    lieuNaissance: 'Wellington, New Zealand',
    nationalite: 'New Zealand',
    numeroSecuriteSociale: '1650730678901',
    situationFamiliale: 'Married',
    
    // Contact Information
    adresse: {
      rue: '89 Coral Reef Drive',
      ville: 'Nouméa',
      codePostal: '98800',
      pays: 'New Caledonia'
    },
    telephone: {
      portable: '+687 678 901',
      fixe: '+687 789 012'
    },
    email: 'robert.wilson@email.nc',
    contactUrgence: {
      nom: 'Helen Wilson',
      lien: 'Wife',
      telephone: '+687 890 123'
    },
    
    // Administrative Information
    numeroDossier: 'MED-2025-006',
    dateAdmission: '2025-01-11',
    service: 'Internal Medicine',
    modeAdmission: 'Referral',
    medecinTraitant: 'Dr. Clark',
    medecinReferent: 'Dr. James Miller',
    statutSocial: 'Employed',
    mutuelle: 'International insurance',
    prisEnCharge: 'Full coverage',
    
    // Medical Information
    antecedents: {
      personnels: ['Myocardial infarction (2020)', 'Hyperlipidemia'],
      familiaux: ['Coronary artery disease', 'Stroke']
    },
    allergies: ['Aspirin', 'Sulfa drugs'],
    traitements: [
      {
        nom: 'Clopidogrel',
        dosage: '75mg',
        frequence: 'Once daily',
        dateDebut: '2020-08-15'
      },
      {
        nom: 'Atorvastatin',
        dosage: '40mg',
        frequence: 'Once daily',
        dateDebut: '2020-08-15'
      },
      {
        nom: 'Metoprolol',
        dosage: '50mg',
        frequence: 'Twice daily',
        dateDebut: '2020-08-15'
      }
    ],
    biometrie: {
      poids: 88,
      taille: 180,
      imc: 27.2
    },
    groupeSanguin: 'A-',
    antecedenChirurgicaux: ['Coronary angioplasty with stent (2020)'],
    habitudesVie: {
      tabac: false,
      alcool: true,
      drogues: false,
      details: 'Former smoker - quit after heart attack, occasional beer'
    },
    pathologiesConnues: ['Coronary artery disease', 'Hyperlipidemia', 'Hypertension'],
    motifHospitalisation: 'Chest pain evaluation and cardiac monitoring',
    diagnostics: ['Stable angina', 'Coronary artery disease'],
    
    // Alerts and Status
    alerte: {
      niveau: 'orange' as const,
      message: 'Cardiac monitoring - recent chest pain episodes'
    },
    statut: 'Active' as const,
    derniereMaj: '2025-01-15T15:30:00Z',

    // Cabinet Features
    consultations: [],
    factures: [],
    rendezVous: [],
    typePatient: 'hospitalier' as const
  },
  {
    id: 'PAT-007',
    // Personal Information
    nom: 'Brown',
    prenom: 'Emma',
    sexe: 'F' as const,
    dateNaissance: '2010-02-14',
    age: 14,
    lieuNaissance: 'Nouméa, New Caledonia',
    nationalite: 'French',
    numeroSecuriteSociale: '3100214789012',
    situationFamiliale: 'Minor',
    
    // Contact Information
    adresse: {
      rue: '34 Hibiscus Lane',
      ville: 'Nouméa',
      codePostal: '98800',
      pays: 'New Caledonia'
    },
    telephone: {
      portable: '+687 901 234',
      fixe: '+687 012 345'
    },
    email: 'emma.brown@email.nc',
    contactUrgence: {
      nom: 'Michelle Brown',
      lien: 'Mother',
      telephone: '+687 123 456'
    },
    
    // Administrative Information
    numeroDossier: 'MED-2025-007',
    dateAdmission: '2025-01-15',
    service: 'Pediatrics',
    modeAdmission: 'Emergency',
    medecinTraitant: 'Dr. Pediatric',
    medecinReferent: 'Dr. Anna Rodriguez',
    statutSocial: 'Student',
    mutuelle: 'CAFAT (parents)',
    prisEnCharge: 'Full coverage',
    
    // Medical Information
    antecedents: {
      personnels: ['Asthma', 'Eczema'],
      familiaux: ['Allergies', 'Asthma']
    },
    allergies: ['Peanuts', 'Tree nuts', 'Eggs'],
    traitements: [
      {
        nom: 'Salbutamol inhaler',
        dosage: '100mcg',
        frequence: 'As needed',
        dateDebut: '2022-05-01'
      },
      {
        nom: 'Hydrocortisone cream',
        dosage: '1%',
        frequence: 'As needed',
        dateDebut: '2021-03-15'
      }
    ],
    biometrie: {
      poids: 45,
      taille: 155,
      imc: 18.7
    },
    groupeSanguin: 'B-',
    antecedenChirurgicaux: ['None'],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false,
      details: 'Active teenager - plays volleyball'
    },
    pathologiesConnues: ['Allergic asthma', 'Atopic dermatitis', 'Food allergies'],
    motifHospitalisation: 'Severe allergic reaction after accidental peanut exposure',
    diagnostics: ['Anaphylaxis', 'Severe allergic reaction'],
    
    // Alerts and Status
    alerte: {
      niveau: 'rouge' as const,
      message: 'Severe food allergies - epinephrine available, monitor for anaphylaxis'
    },
    statut: 'Emergency' as const,
    derniereMaj: '2025-01-15T19:45:00Z',

    // Cabinet Features
    consultations: [],
    factures: [],
    rendezVous: [],
    typePatient: 'cabinet' as const
  },
  {
    id: 'PAT-008',
    // Personal Information
    nom: 'Garcia',
    prenom: 'Carlos',
    sexe: 'M' as const,
    dateNaissance: '1970-09-25',
    age: 54,
    lieuNaissance: 'Madrid, Spain',
    nationalite: 'Spanish',
    numeroSecuriteSociale: '1700925890123',
    situationFamiliale: 'Married',
    
    // Contact Information
    adresse: {
      rue: '67 Flamboyant Street',
      ville: 'Nouméa',
      codePostal: '98800',
      pays: 'New Caledonia'
    },
    telephone: {
      portable: '+687 234 567',
      fixe: '+687 345 678'
    },
    email: 'carlos.garcia@email.nc',
    contactUrgence: {
      nom: 'Maria Garcia',
      lien: 'Wife',
      telephone: '+687 456 789'
    },
    
    // Administrative Information
    numeroDossier: 'MED-2025-008',
    dateAdmission: '2025-01-09',
    service: 'Orthopedics',
    modeAdmission: 'Emergency',
    medecinTraitant: 'Dr. Orthopedic',
    medecinReferent: 'Dr. Kevin Taylor',
    statutSocial: 'Employed',
    mutuelle: 'European insurance',
    prisEnCharge: 'Partial coverage',
    
    // Medical Information
    antecedents: {
      personnels: ['Osteoarthritis', 'Lower back pain'],
      familiaux: ['Arthritis', 'Bone disorders']
    },
    allergies: ['None known'],
    traitements: [
      {
        nom: 'Ibuprofen',
        dosage: '400mg',
        frequence: 'Three times daily',
        dateDebut: '2024-11-01'
      },
      {
        nom: 'Paracetamol',
        dosage: '500mg',
        frequence: 'As needed',
        dateDebut: '2024-11-01'
      }
    ],
    biometrie: {
      poids: 78,
      taille: 175,
      imc: 25.5
    },
    groupeSanguin: 'O+',
    antecedenChirurgicaux: ['None'],
    habitudesVie: {
      tabac: true,
      alcool: true,
      drogues: false,
      details: 'Moderate smoker and drinker - construction worker'
    },
    pathologiesConnues: ['Lumbar disc herniation', 'Chronic lower back pain'],
    motifHospitalisation: 'Acute lower back pain with leg numbness after work injury',
    diagnostics: ['Acute lumbar disc herniation', 'Sciatica'],
    
    // Alerts and Status
    alerte: {
      niveau: 'orange' as const,
      message: 'Pain management required - possible surgical intervention needed'
    },
    statut: 'Active' as const,
    derniereMaj: '2025-01-15T13:15:00Z',

    // Cabinet Features
    consultations: [],
    factures: [],
    rendezVous: [],
    typePatient: 'hospitalier' as const
  }
];