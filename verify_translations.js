// Script de vérification complète des traductions
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lecture du fichier de traductions
const translationsPath = path.join(__dirname, 'client/src/lib/i18n_final.ts');
const content = fs.readFileSync(translationsPath, 'utf-8');

// Extraction des objets de traduction par regex
const enMatch = content.match(/en:\s*{([\s\S]*?)},\s*he:/);
const heMatch = content.match(/he:\s*{([\s\S]*?)},\s*fr:/);
const frMatch = content.match(/fr:\s*{([\s\S]*?)}\s*};/);

if (!enMatch || !heMatch || !frMatch) {
  console.error('Erreur: Impossible de parser les objets de traduction');
  process.exit(1);
}

// Fonction pour extraire les clés d'un objet de traduction
function extractKeys(translationContent) {
  const keys = [];
  const lines = translationContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('//') && trimmed.includes(':')) {
      const keyMatch = trimmed.match(/^(\w+):/);
      if (keyMatch) {
        keys.push(keyMatch[1]);
      }
    }
  }
  
  return keys.sort();
}

// Extraction des clés pour chaque langue
const enKeys = extractKeys(enMatch[1]);
const heKeys = extractKeys(heMatch[1]);
const frKeys = extractKeys(frMatch[1]);

console.log('=== AUDIT COMPLET DES TRADUCTIONS ===\n');

console.log(`ANGLAIS (EN): ${enKeys.length} clés`);
console.log(`HÉBREU (HE): ${heKeys.length} clés`);
console.log(`FRANÇAIS (FR): ${frKeys.length} clés`);

// Vérification de la cohérence
const allKeys = new Set([...enKeys, ...heKeys, ...frKeys]);
console.log(`\nTotal unique keys: ${allKeys.size}`);

// Détection des clés manquantes
const missingInHe = enKeys.filter(key => !heKeys.includes(key));
const missingInFr = enKeys.filter(key => !frKeys.includes(key));
const missingInEn = heKeys.filter(key => !enKeys.includes(key));

console.log('\n=== CLÉS MANQUANTES ===');

if (missingInHe.length > 0) {
  console.log(`\nMANQUANT EN HÉBREU (${missingInHe.length}):`);
  missingInHe.forEach(key => console.log(`  - ${key}`));
} else {
  console.log('\n✅ HÉBREU: Toutes les clés présentes');
}

if (missingInFr.length > 0) {
  console.log(`\nMANQUANT EN FRANÇAIS (${missingInFr.length}):`);
  missingInFr.forEach(key => console.log(`  - ${key}`));
} else {
  console.log('✅ FRANÇAIS: Toutes les clés présentes');
}

if (missingInEn.length > 0) {
  console.log(`\nMANQUANT EN ANGLAIS (${missingInEn.length}):`);
  missingInEn.forEach(key => console.log(`  - ${key}`));
} else {
  console.log('✅ ANGLAIS: Toutes les clés présentes');
}

// Clés supplémentaires
const extraInHe = heKeys.filter(key => !enKeys.includes(key));
const extraInFr = frKeys.filter(key => !enKeys.includes(key));

if (extraInHe.length > 0) {
  console.log(`\nCLÉS SUPPLÉMENTAIRES EN HÉBREU (${extraInHe.length}):`);
  extraInHe.forEach(key => console.log(`  + ${key}`));
}

if (extraInFr.length > 0) {
  console.log(`\nCLÉS SUPPLÉMENTAIRES EN FRANÇAIS (${extraInFr.length}):`);
  extraInFr.forEach(key => console.log(`  + ${key}`));
}

// Résumé final
console.log('\n=== RÉSUMÉ FINAL ===');
const isComplete = missingInHe.length === 0 && missingInFr.length === 0 && missingInEn.length === 0;

if (isComplete) {
  console.log('🎉 SYSTÈME MULTILINGUE COMPLET');
  console.log('✅ Toutes les langues ont toutes les clés requises');
  console.log(`✅ Total: ${enKeys.length} traductions par langue`);
} else {
  console.log('⚠️  SYSTÈME MULTILINGUE INCOMPLET');
  console.log(`❌ Clés manquantes détectées`);
}

console.log(`\nStatistiques finales:`);
console.log(`- Anglais: ${enKeys.length}/${allKeys.size} (${Math.round(enKeys.length/allKeys.size*100)}%)`);
console.log(`- Hébreu: ${heKeys.length}/${allKeys.size} (${Math.round(heKeys.length/allKeys.size*100)}%)`);
console.log(`- Français: ${frKeys.length}/${allKeys.size} (${Math.round(frKeys.length/allKeys.size*100)}%)`);