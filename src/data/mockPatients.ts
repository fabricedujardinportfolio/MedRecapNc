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
  }
];