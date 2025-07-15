// Complete Missing Translations Script
const fs = require('fs');

function extractKeys(translationContent) {
  const keyPattern = /^\s*([a-zA-Z][a-zA-Z0-9_]*)\s*:/gm;
  const keys = new Set();
  let match;
  
  while ((match = keyPattern.exec(translationContent)) !== null) {
    keys.add(match[1]);
  }
  
  return Array.from(keys);
}

function analyzeMissingTranslations() {
  console.log('=== 🔧 COMPLETING MISSING TRANSLATIONS ===\n');
  
  try {
    const content = fs.readFileSync('client/src/lib/i18n_final.ts', 'utf8');
    
    // Extract language sections
    const enMatch = content.match(/en:\s*{([\s\S]*?)},\s*he:/);
    const heMatch = content.match(/he:\s*{([\s\S]*?)},\s*fr:/);
    const frMatch = content.match(/fr:\s*{([\s\S]*?)}\s*};/);
    
    if (!enMatch || !heMatch || !frMatch) {
      console.error('❌ Could not parse language sections');
      return null;
    }
    
    const enKeys = extractKeys(enMatch[1]);
    const heKeys = extractKeys(heMatch[1]);
    const frKeys = extractKeys(frMatch[1]);
    
    console.log(`📊 CURRENT STATISTICS:`);
    console.log(`🇺🇸 ENGLISH: ${enKeys.length} keys`);
    console.log(`🇮🇱 HEBREW: ${heKeys.length} keys`);
    console.log(`🇫🇷 FRENCH: ${frKeys.length} keys`);
    
    const allKeys = new Set([...enKeys, ...heKeys, ...frKeys]);
    console.log(`📋 TOTAL UNIQUE KEYS: ${allKeys.size}`);
    
    const missingInEn = Array.from(allKeys).filter(key => !enKeys.includes(key));
    const missingInHe = Array.from(allKeys).filter(key => !heKeys.includes(key));
    const missingInFr = Array.from(allKeys).filter(key => !frKeys.includes(key));
    
    console.log(`\n🔍 MISSING TRANSLATIONS:`);
    console.log(`❌ MISSING IN ENGLISH: ${missingInEn.length}`);
    console.log(`❌ MISSING IN HEBREW: ${missingInHe.length}`);
    console.log(`❌ MISSING IN FRENCH: ${missingInFr.length}`);
    
    return {
      enKeys, heKeys, frKeys, allKeys,
      missingInEn, missingInHe, missingInFr,
      enComplete: missingInEn.length === 0,
      heComplete: missingInHe.length === 0,
      frComplete: missingInFr.length === 0
    };
    
  } catch (error) {
    console.error('❌ Error analyzing translations:', error.message);
    return null;
  }
}

// Generate missing translations
function generateMissingTranslations(analysis) {
  if (!analysis) return null;
  
  const translations = {
    english: {},
    hebrew: {},
    french: {}
  };
  
  // Generate English translations for missing keys
  analysis.missingInEn.forEach(key => {
    translations.english[key] = generateEnglishTranslation(key);
  });
  
  // Generate Hebrew translations for missing keys
  analysis.missingInHe.forEach(key => {
    translations.hebrew[key] = generateHebrewTranslation(key);
  });
  
  // Generate French translations for missing keys
  analysis.missingInFr.forEach(key => {
    translations.french[key] = generateFrenchTranslation(key);
  });
  
  return translations;
}

function generateEnglishTranslation(key) {
  const englishTranslations = {
    // Advanced Admin Features
    dashboardActions: "Dashboard Actions",
    learningCenter: "Learning Center",
    lockedDraw: "Locked Draw",
    loginHistory: "Login History",
    manualReview: "Manual Review",
    maximumWithdrawal: "Maximum Withdrawal",
    minimumWithdrawal: "Minimum Withdrawal",
    moderationTools: "Moderation Tools",
    monitoringDashboard: "Monitoring Dashboard",
    myDashboard: "My Dashboard",
    myTransactions: "My Transactions",
    notificationCenter: "Notification Center",
    onboardingGuide: "Onboarding Guide",
    operationalDashboard: "Operational Dashboard",
    paymentProcessor: "Payment Processor",
    permissionControl: "Permission Control",
    playerStatistics: "Player Statistics",
    qualityAssurance: "Quality Assurance",
    reconciliationReport: "Reconciliation Report",
    recurringPayment: "Recurring Payment",
    referralTracking: "Referral Tracking",
    reportDownload: "Report Download",
    revenueStream: "Revenue Stream",
    riskManagement: "Risk Management",
    schedulePayment: "Schedule Payment",
    securityProtocol: "Security Protocol",
    serviceStatus: "Service Status",
    stakeholderReport: "Stakeholder Report",
    systemAlert: "System Alert",
    timelineView: "Timeline View",
    transactionFee: "Transaction Fee",
    userEngagement: "User Engagement",
    validationRule: "Validation Rule",
    workflowAutomation: "Workflow Automation"
  };
  
  return englishTranslations[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function generateHebrewTranslation(key) {
  const hebrewTranslations = {
    // Technology and Modern Terms
    dashboardActions: "פעולות לוח בקרה",
    jackpotNotifications: "התראות ג'קפוט",
    kycVerification: "אימות זהות",
    loginToAccount: "התחברות לחשבון",
    loyaltyProgram: "תוכנית נאמנות",
    mobileApp: "אפליקציה לנייד",
    multiCurrency: "מטבעות מרובים",
    noAccount: "אין חשבון",
    onlineStatus: "סטטוס מקוון",
    or: "או",
    paymentGateway: "שער תשלומים",
    pendingDraw: "הגרלה ממתינה",
    playerRanking: "דירוג שחקנים",
    promotions: "מבצעים",
    quickSupport: "תמיכה מהירה",
    realTimeUpdates: "עדכונים בזמן אמת",
    reportIssue: "דווח על בעיה",
    securityAlerts: "התראות אבטחה",
    smartphoneApp: "אפליקציית סמארטפון",
    systemMaintenance: "תחזוקת מערכת",
    thirdPartyIntegrations: "שילובי צד שלישי",
    userFeedback: "משוב משתמשים",
    userPreferences: "העדפות משתמש",
    userSettings: "הגדרות משתמש",
    versionUpdate: "עדכון גרסה",
    webNotifications: "התראות אינטרנט",
    welcomePackage: "חבילת ברוכים הבאים",
    winNotifications: "התראות זכייה"
  };
  
  return hebrewTranslations[key] || `${key} (עברית)`;
}

function generateFrenchTranslation(key) {
  const frenchTranslations = {
    // Administrative Interface
    learningCenter: "Centre d'Apprentissage",
    lockedDraw: "Tirage Verrouillé",
    loginHistory: "Historique Connexions",
    loginToAccount: "Se Connecter au Compte",
    manualReview: "Révision Manuelle",
    maximumWithdrawal: "Retrait Maximum",
    minimumWithdrawal: "Retrait Minimum",
    moderationTools: "Outils de Modération",
    monitoringDashboard: "Tableau de Surveillance",
    myDashboard: "Mon Tableau de Bord",
    myTransactions: "Mes Transactions",
    notificationCenter: "Centre de Notifications",
    onboardingGuide: "Guide d'Intégration",
    operationalDashboard: "Tableau Opérationnel",
    paymentProcessor: "Processeur de Paiement",
    permissionControl: "Contrôle des Permissions",
    playerStatistics: "Statistiques Joueurs",
    qualityAssurance: "Assurance Qualité",
    reconciliationReport: "Rapport de Réconciliation",
    recurringPayment: "Paiement Récurrent",
    referralTracking: "Suivi de Parrainage",
    reportDownload: "Téléchargement Rapport",
    revenueStream: "Flux de Revenus",
    riskManagement: "Gestion des Risques",
    schedulePayment: "Programmer Paiement",
    securityProtocol: "Protocole de Sécurité",
    serviceStatus: "Statut du Service",
    stakeholderReport: "Rapport des Parties Prenantes",
    systemAlert: "Alerte Système",
    timelineView: "Vue Chronologique",
    transactionFee: "Frais de Transaction",
    userEngagement: "Engagement Utilisateur",
    validationRule: "Règle de Validation",
    workflowAutomation: "Automatisation du Flux"
  };
  
  return frenchTranslations[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

// Main execution
if (require.main === module) {
  const analysis = analyzeMissingTranslations();
  if (analysis) {
    const missing = generateMissingTranslations(analysis);
    
    console.log('\n🔨 GENERATING MISSING TRANSLATIONS...');
    console.log(`English missing: ${Object.keys(missing.english).length}`);
    console.log(`Hebrew missing: ${Object.keys(missing.hebrew).length}`);
    console.log(`French missing: ${Object.keys(missing.french).length}`);
    
    // Output results for processing
    console.log('\n📝 READY TO APPLY TRANSLATIONS');
  }
}

module.exports = { 
  analyzeMissingTranslations, 
  generateMissingTranslations,
  generateEnglishTranslation,
  generateHebrewTranslation,
  generateFrenchTranslation
};