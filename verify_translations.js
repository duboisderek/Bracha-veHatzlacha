#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractKeys(translationContent) {
  const keyRegex = /^\s*(\w+):\s*"[^"]*"/gm;
  const keys = [];
  let match;
  
  while ((match = keyRegex.exec(translationContent)) !== null) {
    keys.push(match[1]);
  }
  
  return keys;
}

function main() {
  console.log('🔍 VERIFYING TRANSLATION KEYS FOR DUPLICATES');
  console.log('=============================================');
  
  const translationPath = path.join(__dirname, 'client/src/lib/i18n_final.ts');
  const content = fs.readFileSync(translationPath, 'utf8');
  
  const allKeys = extractKeys(content);
  const keyCount = {};
  
  for (const key of allKeys) {
    keyCount[key] = (keyCount[key] || 0) + 1;
  }
  
  const duplicates = Object.keys(keyCount).filter(key => keyCount[key] > 1);
  
  console.log(`📊 Total keys found: ${allKeys.length}`);
  console.log(`📊 Unique keys: ${Object.keys(keyCount).length}`);
  console.log(`📊 Duplicate keys: ${duplicates.length}`);
  
  if (duplicates.length > 0) {
    console.log('\n❌ DUPLICATE KEYS FOUND:');
    duplicates.forEach(key => {
      console.log(`  - ${key} (appears ${keyCount[key]} times)`);
    });
    return false;
  } else {
    console.log('\n✅ NO DUPLICATE KEYS FOUND - PERFECT!');
    return true;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = main();
  process.exit(result ? 0 : 1);
}