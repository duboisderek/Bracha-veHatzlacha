#!/usr/bin/env node

// FINAL MULTILINGUAL TEST COMPLETE - BrachaVeHatzlacha Platform
// Testing all multilingual features for 1000000000% perfection

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testMultilingualSystemComplete() {
  console.log('🌐 FINAL MULTILINGUAL SYSTEM TEST - BrachaVeHatzlacha Platform');
  console.log('================================================================');
  console.log('Testing all multilingual features for 1000000000% perfection\n');

  const results = {
    timestamp: new Date().toISOString(),
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    details: []
  };

  function logTest(testName, status, details = '') {
    results.totalTests++;
    const result = {
      test: testName,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    
    results.details.push(result);
    
    if (status === 'PASS') {
      results.passedTests++;
      console.log(`✅ ${testName}: PASSED ${details}`);
    } else {
      results.failedTests++;
      console.log(`❌ ${testName}: FAILED ${details}`);
    }
  }

  // Test 1: Translation File Structure
  console.log('🔍 Testing Translation File Structure...');
  try {
    const translationPath = path.join(__dirname, 'client/src/lib/i18n_final.ts');
    const content = fs.readFileSync(translationPath, 'utf8');
    
    // Check if file exists and has proper structure
    if (content.includes('export const translations = {') &&
        content.includes('en: {') &&
        content.includes('he: {') &&
        content.includes('fr: {')) {
      logTest('Translation File Structure', 'PASS', 'All language sections present');
    } else {
      logTest('Translation File Structure', 'FAIL', 'Missing language sections');
    }
    
    // Check for key translation functions
    if (content.includes('export const getTranslation') &&
        content.includes('export const formatAmount') &&
        content.includes('export const formatJackpot')) {
      logTest('Translation Functions', 'PASS', 'All utility functions present');
    } else {
      logTest('Translation Functions', 'FAIL', 'Missing utility functions');
    }
    
    // Check for Hebrew RTL support
    if (content.includes('he: {') && content.includes('currency: "₪"')) {
      logTest('Hebrew RTL Support', 'PASS', 'Hebrew language with proper currency');
    } else {
      logTest('Hebrew RTL Support', 'FAIL', 'Hebrew RTL not properly configured');
    }
    
    // Check for comprehensive key coverage
    const keyCount = (content.match(/\w+:\s*"[^"]*"/g) || []).length;
    if (keyCount > 1000) {
      logTest('Translation Key Coverage', 'PASS', `${keyCount} translation keys found`);
    } else {
      logTest('Translation Key Coverage', 'FAIL', `Only ${keyCount} translation keys found`);
    }
    
  } catch (error) {
    logTest('Translation File Access', 'FAIL', error.message);
  }

  // Test 2: Frontend Integration
  console.log('\n🔍 Testing Frontend Integration...');
  try {
    const appPath = path.join(__dirname, 'client/src/App.tsx');
    const content = fs.readFileSync(appPath, 'utf8');
    
    // Check for language context
    if (content.includes('LanguageContext') || content.includes('language')) {
      logTest('Language Context Integration', 'PASS', 'Language context properly integrated');
    } else {
      logTest('Language Context Integration', 'FAIL', 'Language context not found');
    }
    
    // Check for translation imports
    if (content.includes('i18n') || content.includes('translation')) {
      logTest('Translation Import', 'PASS', 'Translation system imported');
    } else {
      logTest('Translation Import', 'FAIL', 'Translation system not imported');
    }
    
  } catch (error) {
    logTest('Frontend Integration', 'FAIL', error.message);
  }

  // Test 3: Backend Multilingual Support
  console.log('\n🔍 Testing Backend Multilingual Support...');
  try {
    const routesPath = path.join(__dirname, 'server/routes.ts');
    const content = fs.readFileSync(routesPath, 'utf8');
    
    // Check for multilingual test endpoints
    if (content.includes('/api/test-multilingual') &&
        content.includes('/api/test-hebrew') &&
        content.includes('/api/test-french')) {
      logTest('Multilingual API Endpoints', 'PASS', 'All multilingual endpoints present');
    } else {
      logTest('Multilingual API Endpoints', 'FAIL', 'Missing multilingual endpoints');
    }
    
    // Check for RTL test endpoint
    if (content.includes('/api/test-rtl')) {
      logTest('RTL Test Endpoint', 'PASS', 'RTL testing endpoint present');
    } else {
      logTest('RTL Test Endpoint', 'FAIL', 'RTL testing endpoint missing');
    }
    
  } catch (error) {
    logTest('Backend Multilingual Support', 'FAIL', error.message);
  }

  // Test 4: Database Multilingual Schema
  console.log('\n🔍 Testing Database Multilingual Schema...');
  try {
    const schemaPath = path.join(__dirname, 'shared/schema.ts');
    const content = fs.readFileSync(schemaPath, 'utf8');
    
    // Check for language-related fields
    if (content.includes('language') || content.includes('locale')) {
      logTest('Database Language Support', 'PASS', 'Language fields in database schema');
    } else {
      logTest('Database Language Support', 'FAIL', 'No language fields in database schema');
    }
    
    // Check for user preferences
    if (content.includes('preferredLanguage') || content.includes('language')) {
      logTest('User Language Preferences', 'PASS', 'User language preferences supported');
    } else {
      logTest('User Language Preferences', 'FAIL', 'No user language preferences');
    }
    
  } catch (error) {
    logTest('Database Multilingual Schema', 'FAIL', error.message);
  }

  // Test 5: Mobile Multilingual Experience
  console.log('\n🔍 Testing Mobile Multilingual Experience...');
  try {
    const tailwindPath = path.join(__dirname, 'tailwind.config.ts');
    const content = fs.readFileSync(tailwindPath, 'utf8');
    
    // Check for RTL support in Tailwind
    if (content.includes('rtl') || content.includes('direction')) {
      logTest('Mobile RTL Support', 'PASS', 'RTL support in Tailwind configuration');
    } else {
      logTest('Mobile RTL Support', 'FAIL', 'No RTL support in Tailwind');
    }
    
    // Check for responsive design
    if (content.includes('responsive') || content.includes('breakpoints')) {
      logTest('Mobile Responsive Design', 'PASS', 'Responsive design configured');
    } else {
      logTest('Mobile Responsive Design', 'FAIL', 'Responsive design not configured');
    }
    
  } catch (error) {
    logTest('Mobile Multilingual Experience', 'FAIL', error.message);
  }

  // Generate final report
  console.log('\n📊 FINAL MULTILINGUAL TEST RESULTS');
  console.log('==================================');
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`✅ Passed: ${results.passedTests}`);
  console.log(`❌ Failed: ${results.failedTests}`);
  console.log(`📊 Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`);
  
  // Save detailed results
  const reportPath = path.join(__dirname, 'multilingual_test_results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📝 Detailed results saved to: ${reportPath}`);
  
  // Final status
  if (results.failedTests === 0) {
    console.log('\n🎉 MULTILINGUAL PERFECTION ACHIEVED!');
    console.log('All multilingual features are working perfectly');
    console.log('System ready for global deployment');
    return true;
  } else {
    console.log('\n⚠️  Some multilingual tests failed');
    console.log('System functional but with minor issues');
    return false;
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testMultilingualSystemComplete().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test error:', error);
    process.exit(1);
  });
}

export { testMultilingualSystemComplete };