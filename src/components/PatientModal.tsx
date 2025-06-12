import React, { useState } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Heart, 
  AlertTriangle,
  FileText,
  Pill,
  Activity,
  Download,
  Bot,
  Video,
  Stethoscope,
  Euro,
  Clock
} from 'lucide-react';
import { Patient } from '../types/Patient';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { TavusVideoAgent } from './TavusVideoAgent';
import { ConsultationModal } from './ConsultationModal';
import { FactureModal } from './FactureModal';
import { RendezVousModal } from './RendezVousModal';
import { useLanguage } from '../hooks/useLanguage';

interface PatientModalProps {
  patient: Patient;
  onClose: () => void;
  showCabinetFeatures?: boolean;
}

export const PatientModal: React.FC<PatientModalProps> = ({ 
  patient, 
  onClose, 
  showCabinetFeatures = false 
}) => {
  const [showTavusAgent, setShowTavusAgent] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [showRendezVousModal, setShowRendezVousModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'medical' | 'consultations' | 'factures' | 'rendez-vous'>('medical');
  const { t, language } = useLanguage();
  const locale = language === 'fr' ? fr : enUS;

  const getAlertColor = (niveau: string) => {
    switch (niveau) {
      case 'rouge': return 'text-red-600 bg-red-100 border-red-200';
      case 'orange': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'verte': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getFactureStatusColor = (statut: string) => {
    switch (statut) {
      case 'payee': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-orange-100 text-orange-800';
      case 'partiellement_payee': return 'bg-yellow-100 text-yellow-800';
      case 'en_retard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFactureStatusText = (statut: string) => {
    switch (statut) {
      case 'payee': return t('invoice.status.paid');
      case 'en_attente': return t('invoice.status.pending');
      case 'partiellement_payee': return t('invoice.status.partial');
      case 'en_retard': return t('invoice.status.overdue');
      default: return statut;
    }
  };

  const getRdvStatusColor = (statut: string) => {
    switch (statut) {
      case 'confirme': return 'bg-green-100 text-green-800';
      case 'programme': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-orange-100 text-orange-800';
      case 'termine': return 'bg-gray-100 text-gray-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRdvStatusText = (statut: string) => {
    switch (statut) {
      case 'confirme': return t('appointment.status.confirmed');
      case 'programme': return t('appointment.status.scheduled');
      case 'en_cours': return t('appointment.status.ongoing');
      case 'termine': return t('appointment.status.completed');
      case 'annule': return t('appointment.status.cancelled');
      default: return statut;
    }
  };

  const getConsultationStatusText = (statut: string) => {
    switch (statut) {
      case 'terminee': return t('consultation.status.completed');
      case 'en_cours': return t('consultation.status.ongoing');
      case 'programmee': return t('consultation.status.scheduled');
      case 'annulee': return t('consultation.status.cancelled');
      default: return statut;
    }
  };

  const handleExport = () => {
    try {
      // Générer le contenu HTML complet
      const htmlContent = generateCompleteHTMLDocument();
      
      // Créer un blob avec le contenu HTML
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Dossier_Patient_${patient.nom}_${patient.prenom}_${format(new Date(), 'yyyy-MM-dd')}.html`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Export réussi pour:', patient.nom, patient.prenom);
    } catch (error) {
      console.error('❌ Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du dossier patient. Veuillez réessayer.');
    }
  };

  const generateCompleteHTMLDocument = () => {
    const consultationsHtml = patient.consultations && patient.consultations.length > 0 
      ? patient.consultations.map(consultation => `
          <div class="consultation-item">
            <div class="consultation-header">
              <strong>${consultation.motif}</strong>
              <span class="date">${format(new Date(consultation.date), 'dd/MM/yyyy à HH:mm', { locale })}</span>
            </div>
            <div class="consultation-details">
              <p><strong>${t('common.doctor')}:</strong> ${consultation.medecinNom}</p>
              <p><strong>${t('common.diagnosis')}:</strong> ${consultation.diagnostic}</p>
              <p><strong>${t('common.treatment')}:</strong> ${consultation.traitement}</p>
              <p><strong>${t('common.duration')}:</strong> ${consultation.duree} min | <strong>${t('common.amount')}:</strong> ${consultation.tarif}€</p>
              ${consultation.observations ? `<p><strong>Observations:</strong> ${consultation.observations}</p>` : ''}
              ${consultation.ordonnance?.medicaments.length > 0 ? `
                <div class="ordonnance">
                  <strong>Médicaments prescrits:</strong>
                  <ul>
                    ${consultation.ordonnance.medicaments.map(med => 
                      `<li>${med.nom} ${med.dosage} - ${med.instructions}</li>`
                    ).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')
      : `<p class="no-data">${t('patient.modal.no.consultations')}</p>`;

    const facturesHtml = patient.factures && patient.factures.length > 0
      ? patient.factures.map(facture => `
          <div class="facture-item">
            <div class="facture-header">
              <strong>Facture ${facture.numero}</strong>
              <span class="status status-${facture.statut}">${getFactureStatusText(facture.statut)}</span>
            </div>
            <div class="facture-details">
              <div class="facture-row">
                <span>${t('common.date')}: ${format(new Date(facture.date), 'dd/MM/yyyy', { locale })}</span>
                <span>Échéance: ${format(new Date(facture.dateEcheance), 'dd/MM/yyyy', { locale })}</span>
              </div>
              <div class="facture-row">
                <span>${t('common.total')}: ${facture.montantTotal.toFixed(2)}€</span>
                <span>Payé: ${facture.montantPaye.toFixed(2)}€</span>
                <span>Reste: ${facture.montantRestant.toFixed(2)}€</span>
              </div>
              ${facture.remboursement ? `
                <div class="remboursement">
                  <strong>Remboursement:</strong>
                  Sécurité Sociale: ${facture.remboursement.securiteSociale.toFixed(2)}€ |
                  Mutuelle: ${facture.remboursement.mutuelle.toFixed(2)}€ |
                  Reste à charge: ${facture.remboursement.restACharge.toFixed(2)}€
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')
      : `<p class="no-data">${t('patient.modal.no.invoices')}</p>`;

    const rdvHtml = patient.rendezVous && patient.rendezVous.length > 0
      ? patient.rendezVous.map(rdv => `
          <div class="rdv-item">
            <div class="rdv-header">
              <strong>${rdv.motif}</strong>
              <span class="status status-${rdv.statut}">${getRdvStatusText(rdv.statut)}</span>
            </div>
            <div class="rdv-details">
              <div class="rdv-row">
                <span>${t('common.date')}: ${format(new Date(rdv.date), 'dd/MM/yyyy', { locale })}</span>
                <span>${t('common.time')}: ${rdv.heureDebut} - ${rdv.heureFin}</span>
              </div>
              <div class="rdv-row">
                <span>Type: ${rdv.type}</span>
                <span>${t('common.doctor')}: ${rdv.medecinNom}</span>
                <span>Salle: ${rdv.salle}</span>
              </div>
            </div>
          </div>
        `).join('')
      : `<p class="no-data">${t('patient.modal.no.appointments')}</p>`;

    return `
      <!DOCTYPE html>
      <html lang="${language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t('patient.modal.title')} - ${patient.prenom} ${patient.nom}</title>
        <style>
          ${getPrintStyles()}
        </style>
      </head>
      <body>
        <div class="print-container">
          <!-- En-tête du document -->
          <div class="header">
            <div class="header-left">
              <h1>${t('patient.modal.title').toUpperCase()}</h1>
              <h2>${patient.prenom} ${patient.nom}</h2>
              <p>${t('patient.file')} #${patient.numeroDossier}</p>
            </div>
            <div class="header-right">
              <p>Date d'impression: ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale })}</p>
              <p>${t('patient.modal.updated')}: ${format(new Date(patient.derniereMaj), 'dd/MM/yyyy à HH:mm', { locale })}</p>
            </div>
          </div>

          ${patient.alerte && patient.alerte.niveau !== 'verte' ? `
            <div class="alert alert-${patient.alerte.niveau}">
              <strong>⚠️ ALERTE ${patient.alerte.niveau.toUpperCase()}:</strong> ${patient.alerte.message}
            </div>
          ` : ''}

          <!-- Informations personnelles -->
          <section class="section">
            <h3>${t('patient.modal.personal').toUpperCase()}</h3>
            <div class="info-grid">
              <div class="info-item">
                <strong>Sexe:</strong> ${patient.sexe === 'M' ? t('common.male') : t('common.female')}
              </div>
              <div class="info-item">
                <strong>Âge:</strong> ${patient.age} ${t('patient.years')}
              </div>
              <div class="info-item">
                <strong>Date de naissance:</strong> ${format(new Date(patient.dateNaissance), 'dd/MM/yyyy', { locale })}
              </div>
              <div class="info-item">
                <strong>Lieu de naissance:</strong> ${patient.lieuNaissance}
              </div>
              <div class="info-item">
                <strong>Nationalité:</strong> ${patient.nationalite}
              </div>
              <div class="info-item">
                <strong>Situation familiale:</strong> ${patient.situationFamiliale}
              </div>
            </div>
          </section>

          <!-- Coordonnées -->
          <section class="section">
            <h3>${t('patient.modal.contact').toUpperCase()}</h3>
            <div class="info-grid">
              <div class="info-item full-width">
                <strong>Adresse:</strong> ${patient.adresse.rue}, ${patient.adresse.codePostal} ${patient.adresse.ville}, ${patient.adresse.pays}
              </div>
              <div class="info-item">
                <strong>Téléphone:</strong> ${patient.telephone.portable || patient.telephone.fixe}
              </div>
              ${patient.email ? `
                <div class="info-item">
                  <strong>Email:</strong> ${patient.email}
                </div>
              ` : ''}
              <div class="info-item full-width">
                <strong>Contact d'urgence:</strong> ${patient.contactUrgence.nom} (${patient.contactUrgence.lien}) - ${patient.contactUrgence.telephone}
              </div>
            </div>
          </section>

          <!-- Informations médicales critiques -->
          <section class="section medical-critical">
            <h3>${t('patient.modal.medical').toUpperCase()}</h3>
            <div class="info-grid">
              <div class="info-item">
                <strong>Groupe sanguin:</strong> <span class="highlight">${patient.groupeSanguin}</span>
              </div>
              <div class="info-item">
                <strong>IMC:</strong> ${patient.biometrie.imc}
              </div>
              ${patient.allergies.length > 0 ? `
                <div class="info-item full-width allergies">
                  <strong>⚠️ ${t('patient.allergies').toUpperCase()}:</strong> ${patient.allergies.join(', ')}
                </div>
              ` : ''}
            </div>
          </section>

          <!-- Hospitalisation actuelle -->
          <section class="section">
            <h3>${t('patient.modal.hospitalization').toUpperCase()}</h3>
            <div class="info-grid">
              <div class="info-item">
                <strong>Service:</strong> ${patient.service}
              </div>
              <div class="info-item">
                <strong>${t('common.status')}:</strong> ${patient.statut}
              </div>
              <div class="info-item">
                <strong>Mode d'admission:</strong> ${patient.modeAdmission}
              </div>
              <div class="info-item">
                <strong>Date d'admission:</strong> ${format(new Date(patient.dateAdmission), 'dd/MM/yyyy', { locale })}
              </div>
              <div class="info-item full-width">
                <strong>Motif d'hospitalisation:</strong> ${patient.motifHospitalisation}
              </div>
              <div class="info-item">
                <strong>Médecin référent:</strong> ${patient.medecinReferent}
              </div>
              <div class="info-item full-width">
                <strong>Diagnostics:</strong> ${patient.diagnostics.join(', ')}
              </div>
            </div>
          </section>

          <!-- Traitements en cours -->
          <section class="section">
            <h3>${t('patient.modal.treatments').toUpperCase()}</h3>
            ${patient.traitements.length > 0 ? `
              <div class="treatments">
                ${patient.traitements.map(traitement => `
                  <div class="treatment-item">
                    <strong>${traitement.nom}</strong> - ${traitement.dosage} (${traitement.frequence})
                    <span class="treatment-date">Depuis ${format(new Date(traitement.dateDebut), 'MM/yyyy', { locale })}</span>
                  </div>
                `).join('')}
              </div>
            ` : `<p class="no-data">Aucun traitement en cours</p>`}
          </section>

          <!-- Antécédents médicaux -->
          <section class="section">
            <h3>${t('patient.modal.history').toUpperCase()}</h3>
            <div class="antecedents">
              <div class="antecedent-group">
                <h4>${t('patient.modal.personal.history')}</h4>
                ${patient.antecedents.personnels.length > 0 
                  ? `<ul>${patient.antecedents.personnels.map(a => `<li>${a}</li>`).join('')}</ul>`
                  : '<p class="no-data">Aucun antécédent personnel notable</p>'
                }
              </div>
              <div class="antecedent-group">
                <h4>${t('patient.modal.family.history')}</h4>
                ${patient.antecedents.familiaux.length > 0 
                  ? `<ul>${patient.antecedents.familiaux.map(a => `<li>${a}</li>`).join('')}</ul>`
                  : '<p class="no-data">Aucun antécédent familial notable</p>'
                }
              </div>
            </div>
          </section>

          ${showCabinetFeatures ? `
            <!-- Consultations -->
            <section class="section page-break">
              <h3>${t('patient.modal.consultations').toUpperCase()}</h3>
              ${consultationsHtml}
            </section>

            <!-- Factures -->
            <section class="section">
              <h3>${t('patient.modal.invoices').toUpperCase()}</h3>
              ${facturesHtml}
            </section>

            <!-- Rendez-vous -->
            <section class="section">
              <h3>${t('patient.modal.appointments').toUpperCase()}</h3>
              ${rdvHtml}
            </section>
          ` : ''}

          <!-- Pied de page -->
          <div class="footer">
            <p>Document généré par MedRecap+ - Système de Gestion Médicale Sécurisé</p>
            <p>Conforme HDS • ISO 27001 • RGPD</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const getPrintStyles = () => {
    return `
      @page {
        size: A4;
        margin: 15mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 11px;
        line-height: 1.4;
        color: #333;
        margin: 0;
        padding: 0;
        background: white;
      }

      .print-container {
        max-width: 100%;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #2563eb;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }

      .header h1 {
        font-size: 18px;
        font-weight: bold;
        color: #2563eb;
        margin: 0 0 5px 0;
      }

      .header h2 {
        font-size: 16px;
        font-weight: bold;
        color: #1f2937;
        margin: 0 0 5px 0;
      }

      .header p {
        font-size: 10px;
        color: #6b7280;
        margin: 2px 0;
      }

      .header-right {
        text-align: right;
      }

      .alert {
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 15px;
        color: #dc2626;
      }

      .alert-rouge {
        background-color: #fef2f2;
        border-color: #fecaca;
        color: #dc2626;
      }

      .alert-orange {
        background-color: #fffbeb;
        border-color: #fed7aa;
        color: #d97706;
      }

      .section {
        margin-bottom: 20px;
        break-inside: avoid;
      }

      .section h3 {
        font-size: 14px;
        font-weight: bold;
        color: #1f2937;
        background-color: #f3f4f6;
        padding: 8px 12px;
        margin: 0 0 10px 0;
        border-left: 4px solid #2563eb;
      }

      .medical-critical h3 {
        background-color: #fef2f2;
        border-left-color: #dc2626;
        color: #dc2626;
      }

      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .info-item {
        padding: 6px 0;
        border-bottom: 1px solid #e5e7eb;
      }

      .info-item.full-width {
        grid-column: 1 / -1;
      }

      .info-item strong {
        color: #374151;
        font-weight: 600;
      }

      .highlight {
        background-color: #fef3c7;
        padding: 2px 4px;
        border-radius: 2px;
        font-weight: bold;
      }

      .allergies {
        background-color: #fef2f2;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #fecaca;
      }

      .treatments {
        display: grid;
        gap: 8px;
      }

      .treatment-item {
        background-color: #f8fafc;
        padding: 8px;
        border-radius: 4px;
        border-left: 3px solid #3b82f6;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .treatment-date {
        font-size: 10px;
        color: #6b7280;
      }

      .antecedents {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }

      .antecedent-group h4 {
        font-size: 12px;
        font-weight: 600;
        color: #374151;
        margin: 0 0 8px 0;
      }

      .antecedent-group ul {
        margin: 0;
        padding-left: 15px;
      }

      .antecedent-group li {
        margin-bottom: 4px;
      }

      .consultation-item,
      .facture-item,
      .rdv-item {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px;
        margin-bottom: 10px;
        break-inside: avoid;
      }

      .consultation-header,
      .facture-header,
      .rdv-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid #e2e8f0;
      }

      .consultation-details p,
      .facture-details,
      .rdv-details {
        margin: 4px 0;
        font-size: 10px;
      }

      .facture-row,
      .rdv-row {
        display: flex;
        justify-content: space-between;
        margin: 4px 0;
      }

      .status {
        padding: 2px 6px;
        border-radius: 12px;
        font-size: 9px;
        font-weight: 600;
      }

      .status-payee { background-color: #dcfce7; color: #166534; }
      .status-en_attente { background-color: #fed7aa; color: #9a3412; }
      .status-partiellement_payee { background-color: #fef3c7; color: #92400e; }
      .status-en_retard { background-color: #fecaca; color: #991b1b; }
      .status-confirme { background-color: #dcfce7; color: #166534; }
      .status-programme { background-color: #dbeafe; color: #1e40af; }
      .status-termine { background-color: #f3f4f6; color: #374151; }
      .status-annule { background-color: #fecaca; color: #991b1b; }

      .ordonnance {
        background-color: #f0f9ff;
        padding: 6px;
        border-radius: 4px;
        margin-top: 6px;
      }

      .ordonnance ul {
        margin: 4px 0;
        padding-left: 15px;
      }

      .remboursement {
        background-color: #f0fdf4;
        padding: 6px;
        border-radius: 4px;
        margin-top: 6px;
        font-size: 10px;
      }

      .no-data {
        color: #6b7280;
        font-style: italic;
        text-align: center;
        padding: 15px;
      }

      .page-break {
        page-break-before: always;
      }

      .footer {
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 9px;
        color: #6b7280;
      }

      .footer p {
        margin: 2px 0;
      }

      .date {
        font-size: 10px;
        color: #6b7280;
      }

      @media print {
        .section {
          break-inside: avoid;
        }
        
        .consultation-item,
        .facture-item,
        .rdv-item {
          break-inside: avoid;
        }
      }
    `;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient.prenom} {patient.nom}
                </h2>
                <p className="text-gray-600">{t('patient.file')} #{patient.numeroDossier}</p>
                <p className="text-sm text-gray-500">
                  {t('patient.modal.updated')} {format(new Date(patient.derniereMaj), 'dd/MM/yyyy à HH:mm', { locale })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Tavus AI Agent Button */}
              <button
                onClick={() => setShowTavusAgent(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Bot className="w-4 h-4" />
                {t('patient.modal.assistant')}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('patient.modal.export')}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Alert Banner */}
          {patient.alerte && (
            <div className={`px-6 py-3 border-b ${getAlertColor(patient.alerte.niveau)}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{patient.alerte.message}</span>
              </div>
            </div>
          )}

          {/* AI Summary Banner */}
          <div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    {language === 'fr' ? 'Assistant IA Médical disponible' : 'Medical AI Assistant available'}
                  </p>
                  <p className="text-xs text-purple-700">
                    {language === 'fr' 
                      ? 'Cliquez pour obtenir un résumé vidéo interactif de ce dossier patient'
                      : 'Click to get an interactive video summary of this patient file'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTavusAgent(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                <Video className="w-3 h-3" />
                {language === 'fr' ? 'Lancer l\'IA' : 'Launch AI'}
              </button>
            </div>
          </div>

          {/* Navigation Tabs (for cabinet features) */}
          {showCabinetFeatures && (
            <div className="px-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'medical', label: t('patient.modal.medical'), icon: Heart },
                  { id: 'consultations', label: t('patient.modal.consultations'), icon: Stethoscope },
                  { id: 'factures', label: t('patient.modal.invoices'), icon: Euro },
                  { id: 'rendez-vous', label: t('patient.modal.appointments'), icon: Calendar }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
            {(!showCabinetFeatures || activeTab === 'medical') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      {t('patient.modal.personal')}
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Sexe</span>
                          <p className="text-gray-900">{patient.sexe === 'M' ? t('common.male') : t('common.female')}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Âge</span>
                          <p className="text-gray-900">{patient.age} {t('patient.years')}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Date de naissance</span>
                        <p className="text-gray-900">
                          {format(new Date(patient.dateNaissance), 'dd MMMM yyyy', { locale })}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Lieu de naissance</span>
                        <p className="text-gray-900">{patient.lieuNaissance}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Nationalité</span>
                        <p className="text-gray-900">{patient.nationalite}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Situation familiale</span>
                        <p className="text-gray-900">{patient.situationFamiliale}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-green-600" />
                      {t('patient.modal.contact')}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Adresse</span>
                        <p className="text-gray-900">
                          {patient.adresse.rue}<br />
                          {patient.adresse.codePostal} {patient.adresse.ville}<br />
                          {patient.adresse.pays}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Téléphone</span>
                          <p className="text-gray-900">{patient.telephone.portable || patient.telephone.fixe}</p>
                        </div>
                        {patient.email && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Email</span>
                            <p className="text-gray-900">{patient.email}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Contact d'urgence</span>
                        <p className="text-gray-900">
                          {patient.contactUrgence.nom} ({patient.contactUrgence.lien})<br />
                          <span className="text-blue-600">{patient.contactUrgence.telephone}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-6">
                  <div className="bg-red-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      {t('patient.modal.medical')}
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Groupe sanguin</span>
                          <p className="text-lg font-bold text-gray-900">{patient.groupeSanguin}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">IMC</span>
                          <p className="text-gray-900">{patient.biometrie.imc}</p>
                        </div>
                      </div>
                      {patient.allergies.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-red-600">{t('patient.allergies')}</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {patient.allergies.map((allergie, index) => (
                              <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                {allergie}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Treatments */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Pill className="w-5 h-5 text-blue-600" />
                      {t('patient.modal.treatments')}
                    </h3>
                    <div className="space-y-3">
                      {patient.traitements.map((traitement, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{traitement.nom}</p>
                              <p className="text-sm text-gray-600">{traitement.dosage} - {traitement.frequence}</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              Depuis {format(new Date(traitement.dateDebut), 'MM/yyyy', { locale })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hospitalization Details */}
                  <div className="bg-teal-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-teal-600" />
                      {t('patient.modal.hospitalization')}
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Service</span>
                          <p className="text-gray-900">{patient.service}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Mode d'admission</span>
                          <p className="text-gray-900">{patient.modeAdmission}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Motif d'hospitalisation</span>
                        <p className="text-gray-900">{patient.motifHospitalisation}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Médecin référent</span>
                        <p className="text-gray-900">{patient.medecinReferent}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Diagnostics</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {patient.diagnostics.map((diagnostic, index) => (
                            <span key={index} className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                              {diagnostic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical History */}
                <div className="lg:col-span-2 bg-yellow-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-yellow-600" />
                    {t('patient.modal.history')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-sm font-medium text-gray-500">{t('patient.modal.personal.history')}</span>
                      <ul className="mt-2 space-y-1">
                        {patient.antecedents.personnels.map((antecedent, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                            {antecedent}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">{t('patient.modal.family.history')}</span>
                      <ul className="mt-2 space-y-1">
                        {patient.antecedents.familiaux.map((antecedent, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                            {antecedent}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Consultations Tab */}
            {showCabinetFeatures && activeTab === 'consultations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{t('patient.modal.consultations')}</h3>
                  <button 
                    onClick={() => setShowConsultationModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('patient.modal.new.consultation')}
                  </button>
                </div>
                {patient.consultations && patient.consultations.length > 0 ? (
                  <div className="space-y-4">
                    {patient.consultations.map((consultation) => (
                      <div key={consultation.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{consultation.motif}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                consultation.statut === 'terminee' ? 'bg-green-100 text-green-800' :
                                consultation.statut === 'en_cours' ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {getConsultationStatusText(consultation.statut)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{consultation.diagnostic}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                              <div>{t('common.date')}: {format(new Date(consultation.date), 'dd/MM/yyyy à HH:mm', { locale })}</div>
                              <div>{t('common.duration')}: {consultation.duree} min</div>
                              <div>{t('common.doctor')}: {consultation.medecinNom}</div>
                              <div>{t('common.amount')}: {consultation.tarif}€</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>{t('patient.modal.no.consultations')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Factures Tab */}
            {showCabinetFeatures && activeTab === 'factures' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{t('patient.modal.invoices')}</h3>
                  <button 
                    onClick={() => setShowFactureModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {t('patient.modal.new.invoice')}
                  </button>
                </div>
                {patient.factures && patient.factures.length > 0 ? (
                  <div className="space-y-4">
                    {patient.factures.map((facture) => (
                      <div key={facture.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">Facture {facture.numero}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getFactureStatusColor(facture.statut)}`}>
                                {getFactureStatusText(facture.statut)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>{t('common.date')}: {format(new Date(facture.date), 'dd/MM/yyyy', { locale })}</div>
                              <div>Échéance: {format(new Date(facture.dateEcheance), 'dd/MM/yyyy', { locale })}</div>
                              <div>{t('common.total')}: {facture.montantTotal}€</div>
                              <div>Reste à payer: {facture.montantRestant}€</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Euro className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>{t('patient.modal.no.invoices')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Rendez-vous Tab */}
            {showCabinetFeatures && activeTab === 'rendez-vous' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{t('patient.modal.appointments')}</h3>
                  <button 
                    onClick={() => setShowRendezVousModal(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {t('patient.modal.new.appointment')}
                  </button>
                </div>
                {patient.rendezVous && patient.rendezVous.length > 0 ? (
                  <div className="space-y-4">
                    {patient.rendezVous.map((rdv) => (
                      <div key={rdv.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{rdv.motif}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getRdvStatusColor(rdv.statut)}`}>
                                {getRdvStatusText(rdv.statut)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>{t('common.date')}: {format(new Date(rdv.date), 'dd/MM/yyyy', { locale })}</div>
                              <div>{t('common.time')}: {rdv.heureDebut} - {rdv.heureFin}</div>
                              <div>Type: {rdv.type}</div>
                              <div>Salle: {rdv.salle}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>{t('patient.modal.no.appointments')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTavusAgent && (
        <TavusVideoAgent
          patient={patient}
          isVisible={showTavusAgent}
          onClose={() => setShowTavusAgent(false)}
        />
      )}

      {showConsultationModal && (
        <ConsultationModal
          patientId={patient.id}
          onClose={() => setShowConsultationModal(false)}
        />
      )}

      {showFactureModal && (
        <FactureModal
          patientId={patient.id}
          onClose={() => setShowFactureModal(false)}
        />
      )}

      {showRendezVousModal && (
        <RendezVousModal
          patientId={patient.id}
          onClose={() => setShowRendezVousModal(false)}
        />
      )}
    </>
  );
};