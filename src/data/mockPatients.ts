import { Patient } from '../types/Patient';

export const mockPatients: Patient[] = [
  {
    id: "PAT-001",
    nom: "Dubois",
    prenom: "Marie",
    sexe: "F",
    dateNaissance: "1985-03-15",
    age: 40,
    lieuNaissance: "Nouméa",
    nationalite: "Française",
    numeroSecuriteSociale: "2850315123456",
    situationFamiliale: "Mariée",
    adresse: {
      rue: "15 Avenue de la Paix",
      ville: "Nouméa",
      codePostal: "98800",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687123456",
      fixe: "025412345"
    },
    email: "marie.dubois@email.nc",
    contactUrgence: {
      nom: "Jean Dubois",
      lien: "Époux",
      telephone: "0687654321"
    },
    numeroDossier: "DH-98800-001",
    dateAdmission: "2025-01-15T08:30:00",
    service: "Cardiologie",
    modeAdmission: "Programmée",
    medecinTraitant: "Dr. Martin",
    medecinReferent: "Dr. Leblanc",
    statutSocial: "ALD",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Hypertension", "Diabète type 2"],
      familiaux: ["Maladie cardiovasculaire"]
    },
    allergies: ["Pénicilline", "Fruits de mer"],
    traitements: [
      {
        nom: "Lisinopril",
        dosage: "10mg",
        frequence: "1x/jour",
        dateDebut: "2024-06-01"
      },
      {
        nom: "Metformine",
        dosage: "500mg",
        frequence: "2x/jour",
        dateDebut: "2024-01-15"
      }
    ],
    biometrie: {
      poids: 68,
      taille: 165,
      imc: 25.0
    },
    groupeSanguin: "A+",
    antecedenChirurgicaux: ["Appendicectomie (2010)"],
    habitudesVie: {
      tabac: false,
      alcool: true,
      drogues: false,
      details: "Consommation occasionnelle d'alcool"
    },
    pathologiesConnues: ["Hypertension artérielle", "Diabète type 2"],
    motifHospitalisation: "Surveillance cardiaque préventive",
    diagnostics: ["Hypertension bien contrôlée", "Diabète stable"],
    alerte: {
      niveau: "verte",
      message: "Patient stable"
    },
    statut: "Actif",
    derniereMaj: "2025-01-15T14:30:00"
  },
  {
    id: "PAT-002",
    nom: "Kanak",
    prenom: "Pierre",
    sexe: "M",
    dateNaissance: "1978-07-22",
    age: 47,
    lieuNaissance: "Lifou",
    nationalite: "Française",
    numeroSecuriteSociale: "1780722456789",
    situationFamiliale: "Célibataire",
    adresse: {
      rue: "Village de Wé",
      ville: "Lifou",
      codePostal: "98820",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687987654"
    },
    contactUrgence: {
      nom: "Marie Kanak",
      lien: "Sœur",
      telephone: "0687111222"
    },
    numeroDossier: "DH-98820-002",
    dateAdmission: "2025-01-14T15:45:00",
    service: "Urgences",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Patel",
    medecinReferent: "Dr. Nguyen",
    statutSocial: "Régime général",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Asthme"],
      familiaux: ["Diabète"]
    },
    allergies: ["Pollen"],
    traitements: [
      {
        nom: "Ventoline",
        dosage: "100mcg",
        frequence: "Au besoin",
        dateDebut: "2020-03-01"
      }
    ],
    biometrie: {
      poids: 82,
      taille: 178,
      imc: 25.9
    },
    groupeSanguin: "O-",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: true,
      alcool: false,
      drogues: false,
      details: "10 cigarettes/jour"
    },
    pathologiesConnues: ["Asthme bronchique"],
    motifHospitalisation: "Crise d'asthme sévère",
    diagnostics: ["Exacerbation asthmatique"],
    alerte: {
      niveau: "orange",
      message: "Surveillance respiratoire requise"
    },
    statut: "Urgence",
    derniereMaj: "2025-01-14T16:15:00"
  },
  {
    id: "PAT-003",
    nom: "Johnson",
    prenom: "Sarah",
    sexe: "F",
    dateNaissance: "1992-11-08",
    age: 32,
    lieuNaissance: "Sydney",
    nationalite: "Australienne",
    numeroSecuriteSociale: "2921108789012",
    situationFamiliale: "Mariée",
    adresse: {
      rue: "12 Baie des Citrons",
      ville: "Nouméa",
      codePostal: "98800",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687555666",
      fixe: "025498765"
    },
    email: "sarah.johnson@email.com",
    contactUrgence: {
      nom: "Mike Johnson",
      lien: "Époux",
      telephone: "0687777888"
    },
    numeroDossier: "DH-98800-003",
    dateAdmission: "2025-01-13T10:00:00",
    service: "Obstétrique",
    modeAdmission: "Programmée",
    medecinTraitant: "Dr. Wilson",
    medecinReferent: "Dr. Garcia",
    statutSocial: "Tourisme médical",
    mutuelle: "Assurance internationale",
    prisEnCharge: "Privé",
    antecedents: {
      personnels: [],
      familiaux: ["Hypertension maternelle"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Acide folique",
        dosage: "5mg",
        frequence: "1x/jour",
        dateDebut: "2024-08-01"
      }
    ],
    biometrie: {
      poids: 72,
      taille: 168,
      imc: 25.5
    },
    groupeSanguin: "B+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: [],
    motifHospitalisation: "Suivi grossesse - 32 semaines",
    diagnostics: ["Grossesse normale évolutive"],
    alerte: {
      niveau: "verte",
      message: "Grossesse sans complication"
    },
    statut: "Actif",
    derniereMaj: "2025-01-13T11:30:00"
  },
  {
    id: "PAT-004",
    nom: "Tamate",
    prenom: "Jean",
    sexe: "M",
    dateNaissance: "1965-04-12",
    age: 59,
    lieuNaissance: "Poindimié",
    nationalite: "Française",
    numeroSecuriteSociale: "1650412345678",
    situationFamiliale: "Veuf",
    adresse: {
      rue: "Route Territoriale 3",
      ville: "Poindimié",
      codePostal: "98822",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687333444"
    },
    contactUrgence: {
      nom: "Paul Tamate",
      lien: "Fils",
      telephone: "0687222333"
    },
    numeroDossier: "DH-98822-004",
    dateAdmission: "2025-01-12T14:20:00",
    service: "Néphrologie",
    modeAdmission: "Référé",
    medecinTraitant: "Dr. Brown",
    medecinReferent: "Dr. Lee",
    statutSocial: "ALD",
    mutuelle: "MSA",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Insuffisance rénale chronique", "Hypertension"],
      familiaux: ["Diabète", "Insuffisance rénale"]
    },
    allergies: ["Iode"],
    traitements: [
      {
        nom: "Losartan",
        dosage: "50mg",
        frequence: "1x/jour",
        dateDebut: "2022-01-01"
      },
      {
        nom: "Furosémide",
        dosage: "40mg",
        frequence: "1x/jour",
        dateDebut: "2024-03-01"
      }
    ],
    biometrie: {
      poids: 75,
      taille: 172,
      imc: 25.3
    },
    groupeSanguin: "AB+",
    antecedenChirurgicaux: ["Fistule artério-veineuse (2024)"],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false,
      details: "Ancien fumeur - arrêt en 2020"
    },
    pathologiesConnues: ["Insuffisance rénale chronique stade 4", "Hypertension"],
    motifHospitalisation: "Évaluation pré-dialyse",
    diagnostics: ["IRC stade 4", "HTA contrôlée"],
    alerte: {
      niveau: "rouge",
      message: "Fonction rénale critique - Surveillance étroite"
    },
    statut: "Actif",
    derniereMaj: "2025-01-12T15:45:00"
  },
  {
    id: "PAT-005",
    nom: "Wamytan",
    prenom: "Célestine",
    sexe: "F",
    dateNaissance: "1955-09-03",
    age: 69,
    lieuNaissance: "Maré",
    nationalite: "Française",
    numeroSecuriteSociale: "2550903234567",
    situationFamiliale: "Veuve",
    adresse: {
      rue: "Tribu de Rawa",
      ville: "Maré",
      codePostal: "98828",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687445566"
    },
    contactUrgence: {
      nom: "Antoine Wamytan",
      lien: "Fils",
      telephone: "0687998877"
    },
    numeroDossier: "DH-98828-005",
    dateAdmission: "2025-01-11T09:15:00",
    service: "Gériatrie",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Rousseau",
    medecinReferent: "Dr. Moreau",
    statutSocial: "ALD",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Arthrose", "Ostéoporose", "Cataracte"],
      familiaux: ["Diabète", "Hypertension"]
    },
    allergies: ["Aspirine"],
    traitements: [
      {
        nom: "Calcium",
        dosage: "1000mg",
        frequence: "1x/jour",
        dateDebut: "2020-01-01"
      },
      {
        nom: "Vitamine D",
        dosage: "800UI",
        frequence: "1x/jour",
        dateDebut: "2020-01-01"
      }
    ],
    biometrie: {
      poids: 58,
      taille: 155,
      imc: 24.1
    },
    groupeSanguin: "O+",
    antecedenChirurgicaux: ["Chirurgie cataracte (2023)"],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: ["Arthrose généralisée", "Ostéoporose"],
    motifHospitalisation: "Chute avec suspicion fracture col fémur",
    diagnostics: ["Fracture col fémur gauche"],
    alerte: {
      niveau: "orange",
      message: "Risque de complications post-opératoires"
    },
    statut: "Actif",
    derniereMaj: "2025-01-11T10:30:00"
  },
  {
    id: "PAT-006",
    nom: "Nguyen",
    prenom: "Linh",
    sexe: "F",
    dateNaissance: "1988-12-20",
    age: 36,
    lieuNaissance: "Hanoï",
    nationalite: "Vietnamienne",
    numeroSecuriteSociale: "2881220345678",
    situationFamiliale: "Mariée",
    adresse: {
      rue: "Quartier Latin",
      ville: "Nouméa",
      codePostal: "98800",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687334455",
      fixe: "025467890"
    },
    email: "linh.nguyen@email.nc",
    contactUrgence: {
      nom: "Duc Nguyen",
      lien: "Époux",
      telephone: "0687556677"
    },
    numeroDossier: "DH-98800-006",
    dateAdmission: "2025-01-10T16:20:00",
    service: "Pneumologie",
    modeAdmission: "Référé",
    medecinTraitant: "Dr. Chen",
    medecinReferent: "Dr. Pham",
    statutSocial: "Régime général",
    mutuelle: "Mutuelle du Pacifique",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Tuberculose pulmonaire (2015)"],
      familiaux: ["Cancer du poumon"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Bronchodilatateur",
        dosage: "200mcg",
        frequence: "2x/jour",
        dateDebut: "2024-11-01"
      }
    ],
    biometrie: {
      poids: 52,
      taille: 160,
      imc: 20.3
    },
    groupeSanguin: "A-",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false,
      details: "Ancienne fumeuse - arrêt en 2015"
    },
    pathologiesConnues: ["Séquelles tuberculose pulmonaire"],
    motifHospitalisation: "Dyspnée d'effort progressive",
    diagnostics: ["Fibrose pulmonaire post-tuberculeuse"],
    alerte: {
      niveau: "verte",
      message: "État stable"
    },
    statut: "Actif",
    derniereMaj: "2025-01-10T17:00:00"
  },
  {
    id: "PAT-007",
    nom: "Lebrun",
    prenom: "Antoine",
    sexe: "M",
    dateNaissance: "2010-05-14",
    age: 14,
    lieuNaissance: "Nouméa",
    nationalite: "Française",
    numeroSecuriteSociale: "1100514456789",
    situationFamiliale: "Célibataire",
    adresse: {
      rue: "Résidence Magenta",
      ville: "Nouméa",
      codePostal: "98800",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687223344"
    },
    contactUrgence: {
      nom: "Sophie Lebrun",
      lien: "Mère",
      telephone: "0687445566"
    },
    numeroDossier: "DH-98800-007",
    dateAdmission: "2025-01-09T13:45:00",
    service: "Pédiatrie",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Petit",
    medecinReferent: "Dr. Durand",
    statutSocial: "Ayant droit",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Asthme léger"],
      familiaux: ["Allergies alimentaires"]
    },
    allergies: ["Arachides", "Œufs"],
    traitements: [
      {
        nom: "Ventoline",
        dosage: "100mcg",
        frequence: "Au besoin",
        dateDebut: "2022-09-01"
      }
    ],
    biometrie: {
      poids: 45,
      taille: 155,
      imc: 18.7
    },
    groupeSanguin: "B-",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: ["Asthme allergique"],
    motifHospitalisation: "Réaction allergique alimentaire sévère",
    diagnostics: ["Choc anaphylactique aux arachides"],
    alerte: {
      niveau: "rouge",
      message: "Allergie sévère - EpiPen disponible"
    },
    statut: "Urgence",
    derniereMaj: "2025-01-09T14:30:00"
  },
  {
    id: "PAT-008",
    nom: "Poigoune",
    prenom: "Marcel",
    sexe: "M",
    dateNaissance: "1972-08-30",
    age: 52,
    lieuNaissance: "Ouvéa",
    nationalite: "Française",
    numeroSecuriteSociale: "1720830567890",
    situationFamiliale: "Marié",
    adresse: {
      rue: "Tribu de Fayaoué",
      ville: "Ouvéa",
      codePostal: "98814",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687112233"
    },
    contactUrgence: {
      nom: "Jeanne Poigoune",
      lien: "Épouse",
      telephone: "0687334455"
    },
    numeroDossier: "DH-98814-008",
    dateAdmission: "2025-01-08T11:30:00",
    service: "Chirurgie",
    modeAdmission: "Programmée",
    medecinTraitant: "Dr. Blanc",
    medecinReferent: "Dr. Noir",
    statutSocial: "Régime général",
    mutuelle: "CAFAT",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Hernie inguinale"],
      familiaux: []
    },
    allergies: [],
    traitements: [],
    biometrie: {
      poids: 78,
      taille: 175,
      imc: 25.5
    },
    groupeSanguin: "O+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: true,
      alcool: true,
      drogues: false,
      details: "Fumeur occasionnel, bière le weekend"
    },
    pathologiesConnues: ["Hernie inguinale droite"],
    motifHospitalisation: "Cure hernie inguinale programmée",
    diagnostics: ["Hernie inguinale droite non compliquée"],
    alerte: {
      niveau: "verte",
      message: "Intervention programmée sans complication"
    },
    statut: "Actif",
    derniereMaj: "2025-01-08T12:00:00"
  },
  {
    id: "PAT-009",
    nom: "Roux",
    prenom: "Isabelle",
    sexe: "F",
    dateNaissance: "1979-02-28",
    age: 45,
    lieuNaissance: "Lyon",
    nationalite: "Française",
    numeroSecuriteSociale: "2790228678901",
    situationFamiliale: "Divorcée",
    adresse: {
      rue: "Vallée du Tir",
      ville: "Nouméa",
      codePostal: "98800",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687998877",
      fixe: "025334455"
    },
    email: "isabelle.roux@email.nc",
    contactUrgence: {
      nom: "Claire Roux",
      lien: "Sœur",
      telephone: "0687776655"
    },
    numeroDossier: "DH-98800-009",
    dateAdmission: "2025-01-07T14:15:00",
    service: "Psychiatrie",
    modeAdmission: "Volontaire",
    medecinTraitant: "Dr. Freud",
    medecinReferent: "Dr. Jung",
    statutSocial: "ALD",
    mutuelle: "Harmonie Mutuelle",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Dépression majeure", "Tentative de suicide (2020)"],
      familiaux: ["Troubles bipolaires"]
    },
    allergies: ["Lithium"],
    traitements: [
      {
        nom: "Sertraline",
        dosage: "50mg",
        frequence: "1x/jour",
        dateDebut: "2023-06-01"
      },
      {
        nom: "Lorazépam",
        dosage: "1mg",
        frequence: "Au besoin",
        dateDebut: "2023-06-01"
      }
    ],
    biometrie: {
      poids: 62,
      taille: 168,
      imc: 22.0
    },
    groupeSanguin: "A+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: true,
      drogues: false,
      details: "Consommation d'alcool problématique"
    },
    pathologiesConnues: ["Trouble dépressif majeur récurrent"],
    motifHospitalisation: "Décompensation dépressive",
    diagnostics: ["Épisode dépressif majeur sévère"],
    alerte: {
      niveau: "orange",
      message: "Surveillance suicide - Évaluation quotidienne"
    },
    statut: "Actif",
    derniereMaj: "2025-01-07T15:00:00"
  },
  {
    id: "PAT-010",
    nom: "Tjibaou",
    prenom: "Paul",
    sexe: "M",
    dateNaissance: "1945-01-30",
    age: 80,
    lieuNaissance: "Tiendanite",
    nationalite: "Française",
    numeroSecuriteSociale: "1450130789012",
    situationFamiliale: "Marié",
    adresse: {
      rue: "Tribu de Tiendanite",
      ville: "Hienghène",
      codePostal: "98815",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687556677"
    },
    contactUrgence: {
      nom: "Marie Tjibaou",
      lien: "Épouse",
      telephone: "0687778899"
    },
    numeroDossier: "DH-98815-010",
    dateAdmission: "2025-01-06T08:45:00",
    service: "Cardiologie",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Coeur",
    medecinReferent: "Dr. Veine",
    statutSocial: "ALD",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Infarctus du myocarde (2018)", "Hypertension", "Diabète type 2"],
      familiaux: ["Maladie cardiovasculaire"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Aspirine",
        dosage: "75mg",
        frequence: "1x/jour",
        dateDebut: "2018-03-01"
      },
      {
        nom: "Atorvastatine",
        dosage: "40mg",
        frequence: "1x/jour",
        dateDebut: "2018-03-01"
      },
      {
        nom: "Metformine",
        dosage: "1000mg",
        frequence: "2x/jour",
        dateDebut: "2015-01-01"
      }
    ],
    biometrie: {
      poids: 72,
      taille: 170,
      imc: 24.9
    },
    groupeSanguin: "B+",
    antecedenChirurgicaux: ["Angioplastie coronaire (2018)"],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false,
      details: "Ancien fumeur - arrêt en 2018"
    },
    pathologiesConnues: ["Cardiopathie ischémique", "Diabète type 2", "Hypertension"],
    motifHospitalisation: "Douleurs thoraciques atypiques",
    diagnostics: ["Angor stable", "Diabète équilibré"],
    alerte: {
      niveau: "orange",
      message: "Antécédent d'IDM - Surveillance cardiaque"
    },
    statut: "Actif",
    derniereMaj: "2025-01-06T09:30:00"
  },
  {
    id: "PAT-011",
    nom: "Bensa",
    prenom: "Alain",
    sexe: "M",
    dateNaissance: "1963-11-15",
    age: 61,
    lieuNaissance: "Marseille",
    nationalite: "Française",
    numeroSecuriteSociale: "1631115890123",
    situationFamiliale: "Marié",
    adresse: {
      rue: "Anse Vata",
      ville: "Nouméa",
      codePostal: "98800",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687445566",
      fixe: "025556677"
    },
    email: "alain.bensa@email.nc",
    contactUrgence: {
      nom: "Sylvie Bensa",
      lien: "Épouse",
      telephone: "0687667788"
    },
    numeroDossier: "DH-98800-011",
    dateAdmission: "2025-01-05T10:20:00",
    service: "Gastroentérologie",
    modeAdmission: "Programmée",
    medecinTraitant: "Dr. Estomac",
    medecinReferent: "Dr. Intestin",
    statutSocial: "Régime général",
    mutuelle: "MGEN",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Ulcère gastrique", "Reflux gastro-œsophagien"],
      familiaux: ["Cancer colorectal"]
    },
    allergies: ["Anti-inflammatoires"],
    traitements: [
      {
        nom: "Oméprazole",
        dosage: "20mg",
        frequence: "1x/jour",
        dateDebut: "2020-01-01"
      }
    ],
    biometrie: {
      poids: 85,
      taille: 178,
      imc: 26.8
    },
    groupeSanguin: "AB-",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: true,
      drogues: false,
      details: "Consommation modérée de vin"
    },
    pathologiesConnues: ["Maladie ulcéreuse gastroduodénale", "RGO"],
    motifHospitalisation: "Coloscopie de dépistage programmée",
    diagnostics: ["Polypes coliques bénins"],
    alerte: {
      niveau: "verte",
      message: "Surveillance endoscopique régulière"
    },
    statut: "Sorti",
    derniereMaj: "2025-01-05T16:00:00"
  },
  {
    id: "PAT-012",
    nom: "Waheo",
    prenom: "Christine",
    sexe: "F",
    dateNaissance: "1990-07-08",
    age: 34,
    lieuNaissance: "Koné",
    nationalite: "Française",
    numeroSecuriteSociale: "2900708901234",
    situationFamiliale: "Célibataire",
    adresse: {
      rue: "Centre-ville",
      ville: "Koné",
      codePostal: "98860",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687334455"
    },
    contactUrgence: {
      nom: "Robert Waheo",
      lien: "Père",
      telephone: "0687556677"
    },
    numeroDossier: "DH-98860-012",
    dateAdmission: "2025-01-04T15:30:00",
    service: "Dermatologie",
    modeAdmission: "Référé",
    medecinTraitant: "Dr. Peau",
    medecinReferent: "Dr. Grain",
    statutSocial: "Régime général",
    mutuelle: "CAFAT",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Eczéma atopique"],
      familiaux: ["Allergies cutanées"]
    },
    allergies: ["Nickel", "Parfums"],
    traitements: [
      {
        nom: "Crème hydratante",
        dosage: "Application",
        frequence: "2x/jour",
        dateDebut: "2020-01-01"
      }
    ],
    biometrie: {
      poids: 58,
      taille: 165,
      imc: 21.3
    },
    groupeSanguin: "O-",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: ["Dermatite atopique"],
    motifHospitalisation: "Poussée d'eczéma généralisé",
    diagnostics: ["Exacerbation dermatite atopique"],
    alerte: {
      niveau: "verte",
      message: "Réponse favorable au traitement"
    },
    statut: "Sorti",
    derniereMaj: "2025-01-04T18:00:00"
  },
  {
    id: "PAT-013",
    nom: "Mapou",
    prenom: "Raphaël",
    sexe: "M",
    dateNaissance: "1987-04-22",
    age: 37,
    lieuNaissance: "La Foa",
    nationalite: "Française",
    numeroSecuriteSociale: "1870422012345",
    situationFamiliale: "Marié",
    adresse: {
      rue: "Route de Sarraméa",
      ville: "La Foa",
      codePostal: "98880",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687223344",
      fixe: "025778899"
    },
    contactUrgence: {
      nom: "Lucie Mapou",
      lien: "Épouse",
      telephone: "0687445566"
    },
    numeroDossier: "DH-98880-013",
    dateAdmission: "2025-01-03T12:45:00",
    service: "Orthopédie",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Os",
    medecinReferent: "Dr. Fracture",
    statutSocial: "Accident du travail",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: [],
      familiaux: []
    },
    allergies: [],
    traitements: [
      {
        nom: "Tramadol",
        dosage: "50mg",
        frequence: "3x/jour",
        dateDebut: "2025-01-03"
      }
    ],
    biometrie: {
      poids: 82,
      taille: 180,
      imc: 25.3
    },
    groupeSanguin: "A+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: true,
      drogues: false,
      details: "Consommation sociale"
    },
    pathologiesConnues: [],
    motifHospitalisation: "Fracture tibia-fibula suite chute échafaudage",
    diagnostics: ["Fracture fermée tibia-fibula gauche"],
    alerte: {
      niveau: "orange",
      message: "Surveillance post-opératoire"
    },
    statut: "Actif",
    derniereMaj: "2025-01-03T16:30:00"
  },
  {
    id: "PAT-014",
    nom: "Vanuatu",
    prenom: "Joséphine",
    sexe: "F",
    dateNaissance: "1995-06-12",
    age: 29,
    lieuNaissance: "Port-Vila",
    nationalite: "Vanuataise",
    numeroSecuriteSociale: "2950612123456",
    situationFamiliale: "Célibataire",
    adresse: {
      rue: "Quartier Receiving",
      ville: "Nouméa",
      codePostal: "98800",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687112233"
    },
    contactUrgence: {
      nom: "Marie Vanuatu",
      lien: "Mère",
      telephone: "0687334455"
    },
    numeroDossier: "DH-98800-014",
    dateAdmission: "2025-01-02T09:30:00",
    service: "Médecine interne",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Tropical",
    medecinReferent: "Dr. Infectieux",
    statutSocial: "Étranger",
    prisEnCharge: "Privé",
    antecedents: {
      personnels: ["Paludisme (2020)"],
      familiaux: []
    },
    allergies: [],
    traitements: [
      {
        nom: "Paracétamol",
        dosage: "1000mg",
        frequence: "3x/jour",
        dateDebut: "2025-01-02"
      }
    ],
    biometrie: {
      poids: 55,
      taille: 162,
      imc: 21.0
    },
    groupeSanguin: "B+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: [],
    motifHospitalisation: "Fièvre et éruption cutanée",
    diagnostics: ["Dengue probable"],
    alerte: {
      niveau: "orange",
      message: "Surveillance plaquettes et hémorragie"
    },
    statut: "Actif",
    derniereMaj: "2025-01-02T14:00:00"
  },
  {
    id: "PAT-015",
    nom: "Colombani",
    prenom: "François",
    sexe: "M",
    dateNaissance: "1958-10-05",
    age: 66,
    lieuNaissance: "Bastia",
    nationalite: "Française",
    numeroSecuriteSociale: "1581005234567",
    situationFamiliale: "Marié",
    adresse: {
      rue: "Mont-Dore",
      ville: "Mont-Dore",
      codePostal: "98810",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687556677",
      fixe: "025889900"
    },
    email: "francois.colombani@email.nc",
    contactUrgence: {
      nom: "Anna Colombani",
      lien: "Épouse",
      telephone: "0687778899"
    },
    numeroDossier: "DH-98810-015",
    dateAdmission: "2025-01-01T11:15:00",
    service: "Urologie",
    modeAdmission: "Programmée",
    medecinTraitant: "Dr. Vessie",
    medecinReferent: "Dr. Rein",
    statutSocial: "Retraité",
    mutuelle: "Mutuelle Générale",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Hypertrophie prostate", "Hypertension"],
      familiaux: ["Cancer prostate"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Tamsulosine",
        dosage: "0.4mg",
        frequence: "1x/jour",
        dateDebut: "2022-01-01"
      }
    ],
    biometrie: {
      poids: 78,
      taille: 175,
      imc: 25.5
    },
    groupeSanguin: "A-",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: true,
      drogues: false,
      details: "Ancien fumeur, vin aux repas"
    },
    pathologiesConnues: ["Hypertrophie bénigne prostate"],
    motifHospitalisation: "Résection transurétrale prostate",
    diagnostics: ["Adénome prostatique"],
    alerte: {
      niveau: "verte",
      message: "Intervention de routine"
    },
    statut: "Actif",
    derniereMaj: "2025-01-01T12:00:00"
  },
  {
    id: "PAT-016",
    nom: "Teao",
    prenom: "Vahiné",
    sexe: "F",
    dateNaissance: "1993-03-25",
    age: 31,
    lieuNaissance: "Papeete",
    nationalite: "Française",
    numeroSecuriteSociale: "2930325345678",
    situationFamiliale: "Concubinage",
    adresse: {
      rue: "Baie de Sainte-Marie",
      ville: "Bourail",
      codePostal: "98870",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687445566"
    },
    contactUrgence: {
      nom: "Teiva Teao",
      lien: "Compagnon",
      telephone: "0687667788"
    },
    numeroDossier: "DH-98870-016",
    dateAdmission: "2024-12-31T14:20:00",
    service: "Obstétrique",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Bébé",
    medecinReferent: "Dr. Sage-femme",
    statutSocial: "Régime général",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Grossesse gémellaire antérieure"],
      familiaux: []
    },
    allergies: [],
    traitements: [
      {
        nom: "Acide folique",
        dosage: "5mg",
        frequence: "1x/jour",
        dateDebut: "2024-05-01"
      }
    ],
    biometrie: {
      poids: 78,
      taille: 168,
      imc: 27.6
    },
    groupeSanguin: "O+",
    antecedenChirurgicaux: ["Césarienne (2021)"],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: [],
    motifHospitalisation: "Travail prématuré - 35 semaines",
    diagnostics: ["Menace accouchement prématuré"],
    alerte: {
      niveau: "orange",
      message: "Surveillance fœtale continue"
    },
    statut: "Actif",
    derniereMaj: "2024-12-31T15:30:00"
  },
  {
    id: "PAT-017",
    nom: "Kasarhérou",
    prenom: "Emmanuel",
    sexe: "M",
    dateNaissance: "1975-09-18",
    age: 49,
    lieuNaissance: "Canala",
    nationalite: "Française",
    numeroSecuriteSociale: "1750918456789",
    situationFamiliale: "Marié",
    adresse: {
      rue: "Tribu de Nakéty",
      ville: "Canala",
      codePostal: "98813",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687223344"
    },
    contactUrgence: {
      nom: "Sylvie Kasarhérou",
      lien: "Épouse",
      telephone: "0687445566"
    },
    numeroDossier: "DH-98813-017",
    dateAdmission: "2024-12-30T16:45:00",
    service: "Neurologie",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Cerveau",
    medecinReferent: "Dr. Nerf",
    statutSocial: "Régime général",
    mutuelle: "CAFAT",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Migraine", "Hypertension"],
      familiaux: ["AVC"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Amlodipine",
        dosage: "5mg",
        frequence: "1x/jour",
        dateDebut: "2020-01-01"
      }
    ],
    biometrie: {
      poids: 85,
      taille: 178,
      imc: 26.8
    },
    groupeSanguin: "AB+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: true,
      alcool: true,
      drogues: false,
      details: "Fumeur 20 cigarettes/jour, alcool quotidien"
    },
    pathologiesConnues: ["Hypertension artérielle", "Céphalées chroniques"],
    motifHospitalisation: "Céphalées sévères avec troubles visuels",
    diagnostics: ["Suspicion hémorragie méningée"],
    alerte: {
      niveau: "rouge",
      message: "Surveillance neurologique étroite - Scanner urgent"
    },
    statut: "Urgence",
    derniereMaj: "2024-12-30T18:00:00"
  },
  {
    id: "PAT-018",
    nom: "Gorodé",
    prenom: "Déwé",
    sexe: "F",
    dateNaissance: "1952-05-31",
    age: 72,
    lieuNaissance: "Ponérihouen",
    nationalite: "Française",
    numeroSecuriteSociale: "2520531567890",
    situationFamiliale: "Veuve",
    adresse: {
      rue: "Tribu de Népou",
      ville: "Ponérihouen",
      codePostal: "98823",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687334455"
    },
    contactUrgence: {
      nom: "Jean Gorodé",
      lien: "Fils",
      telephone: "0687556677"
    },
    numeroDossier: "DH-98823-018",
    dateAdmission: "2024-12-29T10:30:00",
    service: "Endocrinologie",
    modeAdmission: "Programmée",
    medecinTraitant: "Dr. Sucre",
    medecinReferent: "Dr. Hormone",
    statutSocial: "ALD",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Diabète type 2", "Hypertension", "Obésité"],
      familiaux: ["Diabète"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Insuline",
        dosage: "20UI",
        frequence: "2x/jour",
        dateDebut: "2018-01-01"
      },
      {
        nom: "Metformine",
        dosage: "1000mg",
        frequence: "2x/jour",
        dateDebut: "2010-01-01"
      }
    ],
    biometrie: {
      poids: 92,
      taille: 160,
      imc: 35.9
    },
    groupeSanguin: "O+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: ["Diabète type 2 insulino-requérant", "Obésité morbide"],
    motifHospitalisation: "Déséquilibre diabétique",
    diagnostics: ["Diabète décompensé", "Rétinopathie diabétique"],
    alerte: {
      niveau: "orange",
      message: "Surveillance glycémique renforcée"
    },
    statut: "Actif",
    derniereMaj: "2024-12-29T11:15:00"
  },
  {
    id: "PAT-019",
    nom: "Backes",
    prenom: "Philippe",
    sexe: "M",
    dateNaissance: "1968-12-03",
    age: 56,
    lieuNaissance: "Strasbourg",
    nationalite: "Française",
    numeroSecuriteSociale: "1681203678901",
    situationFamiliale: "Marié",
    adresse: {
      rue: "Dumbéa-sur-Mer",
      ville: "Dumbéa",
      codePostal: "98835",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687112233",
      fixe: "025990011"
    },
    email: "philippe.backes@email.nc",
    contactUrgence: {
      nom: "Martine Backes",
      lien: "Épouse",
      telephone: "0687334455"
    },
    numeroDossier: "DH-98835-019",
    dateAdmission: "2024-12-28T13:20:00",
    service: "Rhumatologie",
    modeAdmission: "Référé",
    medecinTraitant: "Dr. Articulation",
    medecinReferent: "Dr. Cartilage",
    statutSocial: "Régime général",
    mutuelle: "Harmonie Mutuelle",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Lombalgie chronique", "Arthrose"],
      familiaux: ["Polyarthrite rhumatoïde"]
    },
    allergies: ["Sulfamides"],
    traitements: [
      {
        nom: "Ibuprofène",
        dosage: "400mg",
        frequence: "3x/jour",
        dateDebut: "2022-01-01"
      }
    ],
    biometrie: {
      poids: 88,
      taille: 182,
      imc: 26.6
    },
    groupeSanguin: "B-",
    antecedenChirurgicaux: ["Discectomie L4-L5 (2020)"],
    habitudesVie: {
      tabac: false,
      alcool: true,
      drogues: false,
      details: "Consommation modérée"
    },
    pathologiesConnues: ["Lombalgie chronique", "Arthrose lombaire"],
    motifHospitalisation: "Infiltration rachidienne programmée",
    diagnostics: ["Discopathie dégénérative L4-L5"],
    alerte: {
      niveau: "verte",
      message: "Procédure de routine"
    },
    statut: "Sorti",
    derniereMaj: "2024-12-28T17:00:00"
  },
  {
    id: "PAT-020",
    nom: "Néaoutyine",
    prenom: "Paul",
    sexe: "M",
    dateNaissance: "1953-08-07",
    age: 71,
    lieuNaissance: "Poum",
    nationalite: "Française",
    numeroSecuriteSociale: "1530807789012",
    situationFamiliale: "Marié",
    adresse: {
      rue: "Tribu de Poum",
      ville: "Poum",
      codePostal: "98826",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687556677"
    },
    contactUrgence: {
      nom: "Marie Néaoutyine",
      lien: "Épouse",
      telephone: "0687778899"
    },
    numeroDossier: "DH-98826-020",
    dateAdmission: "2024-12-27T08:45:00",
    service: "Oncologie",
    modeAdmission: "Programmée",
    medecinTraitant: "Dr. Cancer",
    medecinReferent: "Dr. Chimio",
    statutSocial: "ALD",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Cancer prostate (2022)"],
      familiaux: ["Cancer"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Bicalutamide",
        dosage: "50mg",
        frequence: "1x/jour",
        dateDebut: "2022-06-01"
      }
    ],
    biometrie: {
      poids: 70,
      taille: 172,
      imc: 23.7
    },
    groupeSanguin: "A+",
    antecedenChirurgicaux: ["Prostatectomie radicale (2022)"],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false,
      details: "Ancien fumeur - arrêt en 2022"
    },
    pathologiesConnues: ["Adénocarcinome prostatique"],
    motifHospitalisation: "Chimiothérapie adjuvante",
    diagnostics: ["Cancer prostate en rémission"],
    alerte: {
      niveau: "orange",
      message: "Surveillance oncologique - Effets secondaires chimio"
    },
    statut: "Actif",
    derniereMaj: "2024-12-27T09:30:00"
  },
  {
    id: "PAT-021",
    nom: "Selefen",
    prenom: "Jocelyne",
    sexe: "F",
    dateNaissance: "1984-01-19",
    age: 41,
    lieuNaissance: "Thio",
    nationalite: "Française",
    numeroSecuriteSociale: "2840119890123",
    situationFamiliale: "Mariée",
    adresse: {
      rue: "Village de Thio",
      ville: "Thio",
      codePostal: "98829",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687223344"
    },
    contactUrgence: {
      nom: "Pierre Selefen",
      lien: "Époux",
      telephone: "0687445566"
    },
    numeroDossier: "DH-98829-021",
    dateAdmission: "2024-12-26T15:10:00",
    service: "Gynécologie",
    modeAdmission: "Programmée",
    medecinTraitant: "Dr. Femme",
    medecinReferent: "Dr. Utérus",
    statutSocial: "Régime général",
    mutuelle: "CAFAT",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Endométriose", "Kystes ovariens"],
      familiaux: ["Cancer ovaire"]
    },
    allergies: ["Latex"],
    traitements: [
      {
        nom: "Pilule contraceptive",
        dosage: "1cp",
        frequence: "1x/jour",
        dateDebut: "2020-01-01"
      }
    ],
    biometrie: {
      poids: 65,
      taille: 167,
      imc: 23.3
    },
    groupeSanguin: "B+",
    antecedenChirurgicaux: ["Cœlioscopie diagnostique (2023)"],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: ["Endométriose pelvienne"],
    motifHospitalisation: "Hystérectomie programmée",
    diagnostics: ["Endométriose sévère"],
    alerte: {
      niveau: "verte",
      message: "Intervention programmée"
    },
    statut: "Actif",
    derniereMaj: "2024-12-26T16:00:00"
  },
  {
    id: "PAT-022",
    nom: "Wanma",
    prenom: "Léon",
    sexe: "M",
    dateNaissance: "1996-10-14",
    age: 28,
    lieuNaissance: "Tadine",
    nationalite: "Française",
    numeroSecuriteSociale: "1961014901234",
    situationFamiliale: "Célibataire",
    adresse: {
      rue: "Tribu de Tadine",
      ville: "Maré",
      codePostal: "98828",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687334455"
    },
    contactUrgence: {
      nom: "Suzanne Wanma",
      lien: "Mère",
      telephone: "0687556677"
    },
    numeroDossier: "DH-98828-022",
    dateAdmission: "2024-12-25T11:30:00",
    service: "Traumatologie",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Trauma",
    medecinReferent: "Dr. Urgence",
    statutSocial: "Régime général",
    mutuelle: "CAFAT",
    prisEnCharge: "80%",
    antecedents: {
      personnels: [],
      familiaux: []
    },
    allergies: [],
    traitements: [
      {
        nom: "Morphine",
        dosage: "10mg",
        frequence: "4x/jour",
        dateDebut: "2024-12-25"
      }
    ],
    biometrie: {
      poids: 75,
      taille: 175,
      imc: 24.5
    },
    groupeSanguin: "O+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: true,
      alcool: true,
      drogues: false,
      details: "Fumeur social, bière weekend"
    },
    pathologiesConnues: [],
    motifHospitalisation: "Accident moto - Fractures multiples",
    diagnostics: ["Fracture fémur droit", "Traumatisme crânien léger"],
    alerte: {
      niveau: "rouge",
      message: "Polytraumatisé - Surveillance neurologique"
    },
    statut: "Urgence",
    derniereMaj: "2024-12-25T14:45:00"
  },
  {
    id: "PAT-023",
    nom: "Pidjot",
    prenom: "Gérard",
    sexe: "M",
    dateNaissance: "1961-07-26",
    age: 63,
    lieuNaissance: "Koumac",
    nationalite: "Française",
    numeroSecuriteSociale: "1610726012345",
    situationFamiliale: "Marié",
    adresse: {
      rue: "Centre-ville",
      ville: "Koumac",
      codePostal: "98850",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687112233",
      fixe: "025001122"
    },
    contactUrgence: {
      nom: "Claudine Pidjot",
      lien: "Épouse",
      telephone: "0687334455"
    },
    numeroDossier: "DH-98850-023",
    dateAdmission: "2024-12-24T09:20:00",
    service: "Pneumologie",
    modeAdmission: "Référé",
    medecinTraitant: "Dr. Poumon",
    medecinReferent: "Dr. Respiration",
    statutSocial: "Retraité",
    mutuelle: "CAFAT",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["BPCO", "Tabagisme chronique"],
      familiaux: ["Cancer poumon"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Spiriva",
        dosage: "18mcg",
        frequence: "1x/jour",
        dateDebut: "2020-01-01"
      },
      {
        nom: "Symbicort",
        dosage: "160/4.5mcg",
        frequence: "2x/jour",
        dateDebut: "2020-01-01"
      }
    ],
    biometrie: {
      poids: 68,
      taille: 170,
      imc: 23.5
    },
    groupeSanguin: "A-",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: true,
      alcool: true,
      drogues: false,
      details: "Fumeur 40 ans - 2 paquets/jour"
    },
    pathologiesConnues: ["BPCO stade 3", "Emphysème pulmonaire"],
    motifHospitalisation: "Exacerbation BPCO",
    diagnostics: ["Décompensation respiratoire"],
    alerte: {
      niveau: "orange",
      message: "Oxygénothérapie - Surveillance gazométrie"
    },
    statut: "Actif",
    derniereMaj: "2024-12-24T10:15:00"
  },
  {
    id: "PAT-024",
    nom: "Xowie",
    prenom: "Yvette",
    sexe: "F",
    dateNaissance: "1977-02-11",
    age: 47,
    lieuNaissance: "Voh",
    nationalite: "Française",
    numeroSecuriteSociale: "2770211123456",
    situationFamiliale: "Divorcée",
    adresse: {
      rue: "Route de Koné",
      ville: "Voh",
      codePostal: "98833",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687445566"
    },
    contactUrgence: {
      nom: "Lucie Xowie",
      lien: "Fille",
      telephone: "0687667788"
    },
    numeroDossier: "DH-98833-024",
    dateAdmission: "2024-12-23T14:40:00",
    service: "Hématologie",
    modeAdmission: "Programmée",
    medecinTraitant: "Dr. Sang",
    medecinReferent: "Dr. Globule",
    statutSocial: "ALD",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Anémie chronique"],
      familiaux: ["Leucémie"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Fer",
        dosage: "80mg",
        frequence: "1x/jour",
        dateDebut: "2023-01-01"
      }
    ],
    biometrie: {
      poids: 58,
      taille: 163,
      imc: 21.8
    },
    groupeSanguin: "AB-",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: ["Anémie ferriprive chronique"],
    motifHospitalisation: "Bilan hématologique complet",
    diagnostics: ["Anémie microcytaire"],
    alerte: {
      niveau: "verte",
      message: "Surveillance biologique"
    },
    statut: "Sorti",
    derniereMaj: "2024-12-23T18:00:00"
  },
  {
    id: "PAT-025",
    nom: "Zeula",
    prenom: "André",
    sexe: "M",
    dateNaissance: "1989-05-03",
    age: 35,
    lieuNaissance: "Yaté",
    nationalite: "Française",
    numeroSecuriteSociale: "1890503234567",
    situationFamiliale: "Marié",
    adresse: {
      rue: "Goro",
      ville: "Yaté",
      codePostal: "98834",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687223344"
    },
    contactUrgence: {
      nom: "Sylvie Zeula",
      lien: "Épouse",
      telephone: "0687445566"
    },
    numeroDossier: "DH-98834-025",
    dateAdmission: "2024-12-22T12:15:00",
    service: "Médecine du travail",
    modeAdmission: "Programmée",
    medecinTraitant: "Dr. Travail",
    medecinReferent: "Dr. Professionnel",
    statutSocial: "Salarié",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Exposition nickel"],
      familiaux: []
    },
    allergies: ["Nickel"],
    traitements: [],
    biometrie: {
      poids: 80,
      taille: 177,
      imc: 25.5
    },
    groupeSanguin: "O-",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: true,
      alcool: true,
      drogues: false,
      details: "Fumeur 15 cigarettes/jour"
    },
    pathologiesConnues: ["Dermatite de contact au nickel"],
    motifHospitalisation: "Surveillance médicale renforcée - Exposition professionnelle",
    diagnostics: ["Exposition chronique nickel"],
    alerte: {
      niveau: "orange",
      message: "Surveillance pneumologique - Risque fibrose"
    },
    statut: "Sorti",
    derniereMaj: "2024-12-22T16:30:00"
  },
  {
    id: "PAT-026",
    nom: "Uregei",
    prenom: "Louis",
    sexe: "M",
    dateNaissance: "1943-12-08",
    age: 81,
    lieuNaissance: "Houaïlou",
    nationalite: "Française",
    numeroSecuriteSociale: "1431208345678",
    situationFamiliale: "Veuf",
    adresse: {
      rue: "Tribu de Houaïlou",
      ville: "Houaïlou",
      codePostal: "98816",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687556677"
    },
    contactUrgence: {
      nom: "Michel Uregei",
      lien: "Fils",
      telephone: "0687778899"
    },
    numeroDossier: "DH-98816-026",
    dateAdmission: "2024-12-21T10:45:00",
    service: "Gériatrie",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Âgé",
    medecinReferent: "Dr. Senior",
    statutSocial: "Retraité",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Démence sénile", "Hypertension", "Diabète"],
      familiaux: ["Alzheimer"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Donépézil",
        dosage: "10mg",
        frequence: "1x/jour",
        dateDebut: "2022-01-01"
      },
      {
        nom: "Amlodipine",
        dosage: "5mg",
        frequence: "1x/jour",
        dateDebut: "2020-01-01"
      }
    ],
    biometrie: {
      poids: 62,
      taille: 168,
      imc: 22.0
    },
    groupeSanguin: "A+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false,
      details: "Ancien fumeur - arrêt en 1990"
    },
    pathologiesConnues: ["Maladie d'Alzheimer", "Hypertension", "Diabète type 2"],
    motifHospitalisation: "Chute répétées - Évaluation cognitive",
    diagnostics: ["Démence modérée", "Syndrome de glissement"],
    alerte: {
      niveau: "orange",
      message: "Risque de chute - Surveillance continue"
    },
    statut: "Actif",
    derniereMaj: "2024-12-21T11:30:00"
  },
  {
    id: "PAT-027",
    nom: "Vendegou",
    prenom: "Sylvie",
    sexe: "F",
    dateNaissance: "1981-09-16",
    age: 43,
    lieuNaissance: "Belep",
    nationalite: "Française",
    numeroSecuriteSociale: "2810916456789",
    situationFamiliale: "Célibataire",
    adresse: {
      rue: "Île Art",
      ville: "Belep",
      codePostal: "98811",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687334455"
    },
    contactUrgence: {
      nom: "Pierre Vendegou",
      lien: "Frère",
      telephone: "0687556677"
    },
    numeroDossier: "DH-98811-027",
    dateAdmission: "2024-12-20T16:20:00",
    service: "Ophtalmologie",
    modeAdmission: "Référé",
    medecinTraitant: "Dr. Œil",
    medecinReferent: "Dr. Vision",
    statutSocial: "Régime général",
    mutuelle: "CAFAT",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Myopie forte", "Glaucome"],
      familiaux: ["Cécité"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Collyre antiglaucomateux",
        dosage: "1 goutte",
        frequence: "2x/jour",
        dateDebut: "2020-01-01"
      }
    ],
    biometrie: {
      poids: 60,
      taille: 165,
      imc: 22.0
    },
    groupeSanguin: "B-",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: ["Glaucome chronique", "Myopie forte"],
    motifHospitalisation: "Chirurgie glaucome programmée",
    diagnostics: ["Glaucome primitif à angle ouvert"],
    alerte: {
      niveau: "verte",
      message: "Intervention programmée"
    },
    statut: "Actif",
    derniereMaj: "2024-12-20T17:00:00"
  },
  {
    id: "PAT-028",
    nom: "Wetta",
    prenom: "Charles",
    sexe: "M",
    dateNaissance: "1970-04-25",
    age: 54,
    lieuNaissance: "Boulouparis",
    nationalite: "Française",
    numeroSecuriteSociale: "1700425567890",
    situationFamiliale: "Marié",
    adresse: {
      rue: "Route de la Coulée",
      ville: "Boulouparis",
      codePostal: "98812",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687112233",
      fixe: "025112233"
    },
    contactUrgence: {
      nom: "Françoise Wetta",
      lien: "Épouse",
      telephone: "0687334455"
    },
    numeroDossier: "DH-98812-028",
    dateAdmission: "2024-12-19T13:30:00",
    service: "Addictologie",
    modeAdmission: "Volontaire",
    medecinTraitant: "Dr. Sevrage",
    medecinReferent: "Dr. Addiction",
    statutSocial: "Régime général",
    mutuelle: "CAFAT",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Alcoolisme chronique", "Cirrhose"],
      familiaux: ["Alcoolisme"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Thiamine",
        dosage: "100mg",
        frequence: "1x/jour",
        dateDebut: "2024-12-19"
      },
      {
        nom: "Acamprosate",
        dosage: "666mg",
        frequence: "3x/jour",
        dateDebut: "2024-12-19"
      }
    ],
    biometrie: {
      poids: 65,
      taille: 175,
      imc: 21.2
    },
    groupeSanguin: "O+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: true,
      alcool: true,
      drogues: false,
      details: "Alcoolisme chronique - 1L vin/jour"
    },
    pathologiesConnues: ["Alcoolisme chronique", "Cirrhose hépatique"],
    motifHospitalisation: "Sevrage alcoolique programmé",
    diagnostics: ["Syndrome de sevrage alcoolique"],
    alerte: {
      niveau: "orange",
      message: "Surveillance delirium tremens"
    },
    statut: "Actif",
    derniereMaj: "2024-12-19T14:15:00"
  },
  {
    id: "PAT-029",
    nom: "Yengo",
    prenom: "Bernadette",
    sexe: "F",
    dateNaissance: "1986-11-29",
    age: 38,
    lieuNaissance: "Sarraméa",
    nationalite: "Française",
    numeroSecuriteSociale: "2861129678901",
    situationFamiliale: "Mariée",
    adresse: {
      rue: "Village de Sarraméa",
      ville: "Sarraméa",
      codePostal: "98882",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687445566"
    },
    contactUrgence: {
      nom: "Joseph Yengo",
      lien: "Époux",
      telephone: "0687667788"
    },
    numeroDossier: "DH-98882-029",
    dateAdmission: "2024-12-18T11:45:00",
    service: "Infectiologie",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Microbe",
    medecinReferent: "Dr. Virus",
    statutSocial: "Régime général",
    mutuelle: "CAFAT",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["VIH+", "Hépatite B"],
      familiaux: []
    },
    allergies: ["Cotrimoxazole"],
    traitements: [
      {
        nom: "Trithérapie ARV",
        dosage: "1cp",
        frequence: "1x/jour",
        dateDebut: "2015-01-01"
      }
    ],
    biometrie: {
      poids: 55,
      taille: 162,
      imc: 21.0
    },
    groupeSanguin: "A-",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: ["Infection VIH contrôlée"],
    motifHospitalisation: "Pneumocystose pulmonaire",
    diagnostics: ["Pneumonie à Pneumocystis jirovecii"],
    alerte: {
      niveau: "rouge",
      message: "Immunodépression - Isolement protecteur"
    },
    statut: "Actif",
    derniereMaj: "2024-12-18T12:30:00"
  },
  {
    id: "PAT-030",
    nom: "Zongo",
    prenom: "Fabrice",
    sexe: "M",
    dateNaissance: "1991-06-17",
    age: 33,
    lieuNaissance: "Ouagadougou",
    nationalite: "Burkinabé",
    numeroSecuriteSociale: "1910617789012",
    situationFamiliale: "Célibataire",
    adresse: {
      rue: "Quartier Rivière-Salée",
      ville: "Nouméa",
      codePostal: "98800",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687223344"
    },
    contactUrgence: {
      nom: "Aminata Zongo",
      lien: "Sœur",
      telephone: "0687445566"
    },
    numeroDossier: "DH-98800-030",
    dateAdmission: "2024-12-17T14:50:00",
    service: "Médecine tropicale",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Tropical",
    medecinReferent: "Dr. Parasites",
    statutSocial: "Étranger",
    prisEnCharge: "Privé",
    antecedents: {
      personnels: ["Paludisme récurrent"],
      familiaux: ["Drépanocytose"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Artéméther-Luméfantrine",
        dosage: "20/120mg",
        frequence: "2x/jour",
        dateDebut: "2024-12-17"
      }
    ],
    biometrie: {
      poids: 70,
      taille: 175,
      imc: 22.9
    },
    groupeSanguin: "O+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: ["Paludisme à Plasmodium falciparum"],
    motifHospitalisation: "Accès palustre grave",
    diagnostics: ["Paludisme sévère"],
    alerte: {
      niveau: "rouge",
      message: "Surveillance neurologique - Risque neuropaludisme"
    },
    statut: "Urgence",
    derniereMaj: "2024-12-17T16:00:00"
  },
  {
    id: "PAT-031",
    nom: "Ataï",
    prenom: "Joséphine",
    sexe: "F",
    dateNaissance: "1998-08-12",
    age: 26,
    lieuNaissance: "La Roche",
    nationalite: "Française",
    numeroSecuriteSociale: "2980812890123",
    situationFamiliale: "Célibataire",
    adresse: {
      rue: "Tribu de La Roche",
      ville: "Maré",
      codePostal: "98828",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687556677"
    },
    contactUrgence: {
      nom: "Marie Ataï",
      lien: "Mère",
      telephone: "0687778899"
    },
    numeroDossier: "DH-98828-031",
    dateAdmission: "2024-12-16T09:15:00",
    service: "Maternité",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Accouchement",
    medecinReferent: "Dr. Nouveau-né",
    statutSocial: "Régime général",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: ["Primigeste"],
      familiaux: []
    },
    allergies: [],
    traitements: [],
    biometrie: {
      poids: 68,
      taille: 160,
      imc: 26.6
    },
    groupeSanguin: "A+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: [],
    motifHospitalisation: "Travail en cours - 39 semaines",
    diagnostics: ["Grossesse à terme en travail"],
    alerte: {
      niveau: "verte",
      message: "Travail physiologique"
    },
    statut: "Actif",
    derniereMaj: "2024-12-16T10:00:00"
  },
  {
    id: "PAT-032",
    nom: "Bearune",
    prenom: "Michel",
    sexe: "M",
    dateNaissance: "1964-03-07",
    age: 60,
    lieuNaissance: "Poya",
    nationalite: "Française",
    numeroSecuriteSociale: "1640307901234",
    situationFamiliale: "Marié",
    adresse: {
      rue: "Centre de Poya",
      ville: "Poya",
      codePostal: "98827",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687334455",
      fixe: "025223344"
    },
    contactUrgence: {
      nom: "Sylviane Bearune",
      lien: "Épouse",
      telephone: "0687556677"
    },
    numeroDossier: "DH-98827-032",
    dateAdmission: "2024-12-15T15:20:00",
    service: "Cardiologie",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Rythme",
    medecinReferent: "Dr. Pacemaker",
    statutSocial: "Régime général",
    mutuelle: "CAFAT",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Fibrillation auriculaire", "Hypertension"],
      familiaux: ["Troubles du rythme"]
    },
    allergies: [],
    traitements: [
      {
        nom: "Warfarine",
        dosage: "5mg",
        frequence: "1x/jour",
        dateDebut: "2020-01-01"
      },
      {
        nom: "Bisoprolol",
        dosage: "5mg",
        frequence: "1x/jour",
        dateDebut: "2020-01-01"
      }
    ],
    biometrie: {
      poids: 85,
      taille: 178,
      imc: 26.8
    },
    groupeSanguin: "B+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: true,
      drogues: false,
      details: "Ancien fumeur, consommation modérée alcool"
    },
    pathologiesConnues: ["Fibrillation auriculaire permanente"],
    motifHospitalisation: "Décompensation cardiaque",
    diagnostics: ["Insuffisance cardiaque décompensée"],
    alerte: {
      niveau: "orange",
      message: "Surveillance hémodynamique"
    },
    statut: "Actif",
    derniereMaj: "2024-12-15T16:30:00"
  },
  {
    id: "PAT-033",
    nom: "Caillard",
    prenom: "Émilie",
    sexe: "F",
    dateNaissance: "1983-12-21",
    age: 41,
    lieuNaissance: "Nantes",
    nationalite: "Française",
    numeroSecuriteSociale: "2831221012345",
    situationFamiliale: "Mariée",
    adresse: {
      rue: "Baie de Kuto",
      ville: "Île des Pins",
      codePostal: "98832",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687112233"
    },
    email: "emilie.caillard@email.nc",
    contactUrgence: {
      nom: "Thomas Caillard",
      lien: "Époux",
      telephone: "0687334455"
    },
    numeroDossier: "DH-98832-033",
    dateAdmission: "2024-12-14T12:10:00",
    service: "Allergologie",
    modeAdmission: "Programmée",
    medecinTraitant: "Dr. Allergie",
    medecinReferent: "Dr. Immunologie",
    statutSocial: "Régime général",
    mutuelle: "Harmonie Mutuelle",
    prisEnCharge: "80%",
    antecedents: {
      personnels: ["Asthme allergique", "Rhinite allergique"],
      familiaux: ["Allergies multiples"]
    },
    allergies: ["Acariens", "Pollens", "Poils de chat"],
    traitements: [
      {
        nom: "Cetirizine",
        dosage: "10mg",
        frequence: "1x/jour",
        dateDebut: "2020-01-01"
      }
    ],
    biometrie: {
      poids: 62,
      taille: 168,
      imc: 22.0
    },
    groupeSanguin: "AB+",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: false,
      drogues: false
    },
    pathologiesConnues: ["Asthme allergique", "Rhinite allergique perannuelle"],
    motifHospitalisation: "Tests allergologiques complets",
    diagnostics: ["Polysensibilisation allergénique"],
    alerte: {
      niveau: "verte",
      message: "Bilan allergologique de routine"
    },
    statut: "Sorti",
    derniereMaj: "2024-12-14T17:00:00"
  },
  {
    id: "PAT-034",
    nom: "Dianou",
    prenom: "Raphaël",
    sexe: "M",
    dateNaissance: "2005-01-28",
    age: 19,
    lieuNaissance: "Touho",
    nationalite: "Française",
    numeroSecuriteSociale: "1050128123456",
    situationFamiliale: "Célibataire",
    adresse: {
      rue: "Tribu de Touho",
      ville: "Touho",
      codePostal: "98831",
      pays: "Nouvelle-Calédonie"
    },
    telephone: {
      portable: "0687445566"
    },
    contactUrgence: {
      nom: "Jeanne Dianou",
      lien: "Mère",
      telephone: "0687667788"
    },
    numeroDossier: "DH-98831-034",
    dateAdmission: "2024-12-13T18:30:00",
    service: "Urgences",
    modeAdmission: "Urgence",
    medecinTraitant: "Dr. Jeune",
    medecinReferent: "Dr. Urgentiste",
    statutSocial: "Étudiant",
    mutuelle: "CAFAT",
    prisEnCharge: "100%",
    antecedents: {
      personnels: [],
      familiaux: []
    },
    allergies: [],
    traitements: [],
    biometrie: {
      poids: 65,
      taille: 175,
      imc: 21.2
    },
    groupeSanguin: "O-",
    antecedenChirurgicaux: [],
    habitudesVie: {
      tabac: false,
      alcool: true,
      drogues: false,
      details: "Consommation occasionnelle alcool"
    },
    pathologiesConnues: [],
    motifHospitalisation: "Intoxication alcoolique aiguë",
    diagnostics: ["Coma éthylique"],
    alerte: {
      niveau: "rouge",
      message: "Surveillance neurologique - Jeune patient"
    },
    statut: "Urgence",
    derniereMaj: "2024-12-13T20:00:00"
  }
];