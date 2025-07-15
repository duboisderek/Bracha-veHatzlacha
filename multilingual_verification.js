import fs from 'fs';
import path from 'path';

// Read the translation file
const translationFile = fs.readFileSync('client/src/lib/i18n_final.ts', 'utf8');

// Extract translation objects for each language
const enMatch = translationFile.match(/en:\s*\{([\s\S]*?)\n\s*\},\s*he:/);
const heMatch = translationFile.match(/he:\s*\{([\s\S]*?)\n\s*\},\s*fr:/);
const frMatch = translationFile.match(/fr:\s*\{([\s\S]*?)\n\s*\}\s*\};/);

if (!enMatch || !heMatch || !frMatch) {
  console.error('❌ Could not parse translation sections');
  process.exit(1);
}

// Function to extract keys from translation content
function extractKeys(translationContent) {
  const keys = [];
  const lines = translationContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && trimmed.includes(':')) {
      // Match key at start of line followed by colon
      const keyMatch = trimmed.match(/^(\w+):/);
      if (keyMatch) {
        keys.push(keyMatch[1]);
      }
    }
  }
  
  return keys.sort();
}

// Extract keys for each language
const enKeys = extractKeys(enMatch[1]);
const heKeys = extractKeys(heMatch[1]);
const frKeys = extractKeys(frMatch[1]);

console.log('=== 🌍 MULTILINGUAL VERIFICATION REPORT ===\n');

console.log(`📊 TRANSLATION STATISTICS:`);
console.log(`🇺🇸 ENGLISH (EN): ${enKeys.length} keys`);
console.log(`🇮🇱 HEBREW (HE): ${heKeys.length} keys`);
console.log(`🇫🇷 FRENCH (FR): ${frKeys.length} keys`);

// Find the complete set of all keys
const allKeysSet = new Set([...enKeys, ...heKeys, ...frKeys]);
const allKeys = Array.from(allKeysSet).sort();
console.log(`📋 TOTAL UNIQUE KEYS: ${allKeys.length}\n`);

// Check for missing keys in each language
const missingInEn = allKeys.filter(key => !enKeys.includes(key));
const missingInHe = allKeys.filter(key => !heKeys.includes(key));
const missingInFr = allKeys.filter(key => !frKeys.includes(key));

console.log('🔍 MISSING TRANSLATIONS ANALYSIS:\n');

if (missingInEn.length === 0 && missingInHe.length === 0 && missingInFr.length === 0) {
  console.log('✅ ALL LANGUAGES COMPLETE - NO MISSING TRANSLATIONS!');
  console.log('🎉 MULTILINGUAL SYSTEM: 100% PERFECT');
} else {
  if (missingInEn.length > 0) {
    console.log(`❌ MISSING IN ENGLISH (${missingInEn.length}):`);
    missingInEn.slice(0, 10).forEach(key => console.log(`   - ${key}`));
    if (missingInEn.length > 10) console.log(`   ... and ${missingInEn.length - 10} more`);
    console.log('');
  }
  
  if (missingInHe.length > 0) {
    console.log(`❌ MISSING IN HEBREW (${missingInHe.length}):`);
    missingInHe.slice(0, 10).forEach(key => console.log(`   - ${key}`));
    if (missingInHe.length > 10) console.log(`   ... and ${missingInHe.length - 10} more`);
    console.log('');
  }
  
  if (missingInFr.length > 0) {
    console.log(`❌ MISSING IN FRENCH (${missingInFr.length}):`);
    missingInFr.slice(0, 10).forEach(key => console.log(`   - ${key}`));
    if (missingInFr.length > 10) console.log(`   ... and ${missingInFr.length - 10} more`);
    console.log('');
  }
}

// Calculate completion percentages
const enCompletion = ((allKeys.length - missingInEn.length) / allKeys.length * 100).toFixed(1);
const heCompletion = ((allKeys.length - missingInHe.length) / allKeys.length * 100).toFixed(1);
const frCompletion = ((allKeys.length - missingInFr.length) / allKeys.length * 100).toFixed(1);

console.log('📈 COMPLETION RATES:');
console.log(`🇺🇸 English: ${enCompletion}% (${allKeys.length - missingInEn.length}/${allKeys.length})`);
console.log(`🇮🇱 Hebrew: ${heCompletion}% (${allKeys.length - missingInHe.length}/${allKeys.length})`);
console.log(`🇫🇷 French: ${frCompletion}% (${allKeys.length - missingInFr.length}/${allKeys.length})`);

// Overall system health
const overallHealth = ((300 - missingInEn.length - missingInHe.length - missingInFr.length) / 300 * 100).toFixed(1);
console.log(`\n🏥 SYSTEM HEALTH: ${overallHealth}%`);

if (missingInEn.length === 0 && missingInHe.length === 0 && missingInFr.length === 0) {
  console.log('\n🎯 STATUS: ✅ PRODUCTION READY - MULTILINGUAL PERFECT');
  process.exit(0);
} else {
  console.log('\n🎯 STATUS: ❌ NEEDS FIXES - MISSING TRANSLATIONS DETECTED');
  process.exit(1);
}