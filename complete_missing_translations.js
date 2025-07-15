#!/usr/bin/env node

// COMPLETE MISSING TRANSLATIONS SCRIPT
// This script identifies and removes ALL duplicate translation keys for 100% perfection

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractKeys(translationContent) {
  const keyRegex = /(\w+):\s*"[^"]*"/g;
  const keys = [];
  let match;
  
  while ((match = keyRegex.exec(translationContent)) !== null) {
    keys.push(match[1]);
  }
  
  return keys;
}

function analyzeMissingTranslations() {
  console.log('🔍 ANALYZING TRANSLATION DUPLICATES FOR 100% PERFECTION');
  console.log('======================================================');
  
  const translationPath = path.join(__dirname, 'client/src/lib/i18n_final.ts');
  const content = fs.readFileSync(translationPath, 'utf8');
  
  // Extract sections
  const enMatch = content.match(/en:\s*\{([\s\S]*?)\}/);
  const heMatch = content.match(/he:\s*\{([\s\S]*?)\}/);
  const frMatch = content.match(/fr:\s*\{([\s\S]*?)\}/);
  
  if (!enMatch || !heMatch || !frMatch) {
    console.error('❌ Could not find all language sections');
    return false;
  }
  
  const enKeys = extractKeys(enMatch[1]);
  const heKeys = extractKeys(heMatch[1]);
  const frKeys = extractKeys(frMatch[1]);
  
  console.log(`📊 English keys: ${enKeys.length}`);
  console.log(`📊 Hebrew keys: ${heKeys.length}`);
  console.log(`📊 French keys: ${frKeys.length}`);
  
  // Find duplicates
  const duplicatesInHe = heKeys.filter(key => enKeys.includes(key));
  const duplicatesInFr = frKeys.filter(key => enKeys.includes(key));
  
  console.log(`🔍 Hebrew duplicates: ${duplicatesInHe.length}`);
  console.log(`🔍 French duplicates: ${duplicatesInFr.length}`);
  
  if (duplicatesInHe.length > 0) {
    console.log('Hebrew duplicates:', duplicatesInHe);
  }
  
  if (duplicatesInFr.length > 0) {
    console.log('French duplicates:', duplicatesInFr);
  }
  
  return {
    enKeys,
    heKeys,
    frKeys,
    duplicatesInHe,
    duplicatesInFr,
    content
  };
}

function generateMissingTranslations(analysis) {
  const { enKeys, heKeys, frKeys, duplicatesInHe, duplicatesInFr, content } = analysis;
  
  let newContent = content;
  
  // Remove Hebrew duplicates
  if (duplicatesInHe.length > 0) {
    console.log('🔧 Removing Hebrew duplicates...');
    duplicatesInHe.forEach(key => {
      const regex = new RegExp(`\\s*${key}:\\s*"[^"]*",?\\s*\\n`, 'g');
      const heSection = newContent.match(/he:\s*\{([\s\S]*?)\}/);
      if (heSection) {
        const cleanedSection = heSection[1].replace(regex, '');
        newContent = newContent.replace(heSection[0], `he: {${cleanedSection}}`);
      }
    });
  }
  
  // Remove French duplicates
  if (duplicatesInFr.length > 0) {
    console.log('🔧 Removing French duplicates...');
    duplicatesInFr.forEach(key => {
      const regex = new RegExp(`\\s*${key}:\\s*"[^"]*",?\\s*\\n`, 'g');
      const frSection = newContent.match(/fr:\s*\{([\s\S]*?)\}/);
      if (frSection) {
        const cleanedSection = frSection[1].replace(regex, '');
        newContent = newContent.replace(frSection[0], `fr: {${cleanedSection}}`);
      }
    });
  }
  
  // Clean up extra commas and formatting
  newContent = newContent.replace(/,\s*\n\s*,/g, ',');
  newContent = newContent.replace(/,\s*\n\s*\}/g, '\n  }');
  newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return newContent;
}

function generateEnglishTranslation(key) {
  // Generate human-readable English translation from key
  return key.replace(/([A-Z])/g, ' $1')
           .replace(/^./, str => str.toUpperCase())
           .replace(/\s+/g, ' ')
           .trim();
}

function generateHebrewTranslation(key) {
  // Hebrew translations for common keys
  const hebrewMap = {
    'appName': 'ברכה והצלחה',
    'home': 'בית',
    'dashboard': 'לוח בקרה',
    'login': 'כניסה',
    'logout': 'יציאה',
    'admin': 'ניהול',
    'settings': 'הגדרות',
    'profile': 'פרופיל',
    'notifications': 'התראות',
    'security': 'אבטחה',
    'help': 'עזרה',
    'support': 'תמיכה',
    'analytics': 'ניתוחים',
    'reports': 'דוחות',
    'users': 'משתמשים',
    'transactions': 'עסקאות',
    'payments': 'תשלומים',
    'balance': 'יתרה',
    'history': 'היסטוריה',
    'chat': 'צ\'אט',
    'language': 'שפה',
    'preferences': 'העדפות',
    'jackpot': 'קופה',
    'lottery': 'הגרלה',
    'ticket': 'כרטיס',
    'draw': 'הגרלה',
    'winner': 'זוכה',
    'prize': 'פרס'
  };
  
  return hebrewMap[key] || generateEnglishTranslation(key);
}

function generateFrenchTranslation(key) {
  // French translations for common keys
  const frenchMap = {
    'appName': 'Bracha et Hatzlacha',
    'home': 'Accueil',
    'dashboard': 'Tableau de Bord',
    'login': 'Connexion',
    'logout': 'Déconnexion',
    'admin': 'Administration',
    'settings': 'Paramètres',
    'profile': 'Profil',
    'notifications': 'Notifications',
    'security': 'Sécurité',
    'help': 'Aide',
    'support': 'Support',
    'analytics': 'Analytique',
    'reports': 'Rapports',
    'users': 'Utilisateurs',
    'transactions': 'Transactions',
    'payments': 'Paiements',
    'balance': 'Solde',
    'history': 'Historique',
    'chat': 'Chat',
    'language': 'Langue',
    'preferences': 'Préférences',
    'jackpot': 'Jackpot',
    'lottery': 'Loterie',
    'ticket': 'Ticket',
    'draw': 'Tirage',
    'winner': 'Gagnant',
    'prize': 'Prix'
  };
  
  return frenchMap[key] || generateEnglishTranslation(key);
}

async function main() {
  console.log('🚀 STARTING COMPLETE TRANSLATION CLEANUP');
  console.log('========================================');
  
  const analysis = analyzeMissingTranslations();
  
  if (!analysis) {
    console.error('❌ Analysis failed');
    process.exit(1);
  }
  
  const newContent = generateMissingTranslations(analysis);
  
  // Write the cleaned content
  const translationPath = path.join(__dirname, 'client/src/lib/i18n_final.ts');
  fs.writeFileSync(translationPath, newContent, 'utf8');
  
  console.log('✅ Translation file cleaned successfully');
  
  // Verify the fix
  const verifyAnalysis = analyzeMissingTranslations();
  
  if (verifyAnalysis.duplicatesInHe.length === 0 && verifyAnalysis.duplicatesInFr.length === 0) {
    console.log('🎉 SUCCESS! All duplicates removed - 100% perfection achieved!');
    process.exit(0);
  } else {
    console.log('⚠️  Some duplicates still remain');
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Script error:', error);
    process.exit(1);
  });
}